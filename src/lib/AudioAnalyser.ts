import type { MeydaAnalyzer } from 'meyda';
import { EventEmitter } from 'eventemitter3';
import Meyda from 'meyda';
import _ from 'lodash';
import type { AudioConfig } from './AudioManager';
import { log, calculateAmplitude } from './utils';
import {
  DEBUG_ON,
  FFT_SIZE,
  highpassFilterFrequency,
  inputSamplingInterval,
  inputSourceNode,
  loudnessThreshold,
} from './store';

interface AudioFeatures {
  loudness: { total: number; specific: number };
  spectralCrest: number;
  spectralRolloff: number;
  spectralCentroid: number;
  // averageRolloff: number // calculated over time, not provided by Meyda
  // averageCentroid: number // calculated over time, not provided by Meyda
}

interface AudioFeaturesOverTime {
  spectralRolloff: number[];
  spectralCentroid: number[];
}

export class AudioAnalyser {
  environmentIsQuiet: boolean;
  emitter: EventEmitter
  audioFilepath: string;
  audioConfig: AudioConfig;
  convolutionAnalyser: AnalyserNode;
  convolutionAmplitude: number;
  amplitude: number;
  convolutionFFT: Float32Array;
  directInputFFT: Float32Array;
  ambientFFT: Float32Array;
  loudness: number;
  loudnessThreshold: number; // loudness calculated with Meyda lib
  directInputAnalyser: AnalyserNode;
  meydaAnalyser: MeydaAnalyzer;
  convolver: ConvolverNode;
  buffer: AudioBuffer;
  audioFeatures: AudioFeatures;
  audioFeaturesOverTime: AudioFeaturesOverTime;
  updateStateWithThrottle: Function;
  ambientTimeout: number;
  baselineRolloff: number;
  baselineCentroid: number;
  convolutionAmplitudeThreshold: number;
  startTime: number;
  lastAttemptTime: number;
  sampleDuration: number;

  constructor(audioConfig, audioFilepath) {
    this.startTime = Date.now();
    this.lastAttemptTime = this.startTime;
    this.audioConfig = audioConfig;
    this.audioFilepath = audioFilepath;
    this.emitter = new EventEmitter();
    this.loudnessThreshold = loudnessThreshold;

    this.audioFeaturesOverTime = {
      spectralCentroid: [],
      spectralRolloff: [],
    };

    this.updateStateWithThrottle = _.throttle(
      this.emitAudioEvent,
      inputSamplingInterval,
    );
  }

  public async init(): Promise<void> {
    await this.fetchAudioBuffer(this.audioConfig.ctx);
    this.setUpAnalysers();
  }

  private async fetchAudioBuffer(ctx): Promise<void> {
    return await new Promise<void>((resolve) => {
      const req = new XMLHttpRequest();

      req.open('GET', this.audioFilepath, true);
      req.responseType = 'arraybuffer';
      req.onload = async () => {
        const data = req.response;

        await ctx.decodeAudioData(data, (buffer) => {
          this.buffer = buffer;
          this.sampleDuration = buffer.duration;

          resolve();
        });
      };

      req.send();
    });
  }
    /**
     * Set up the convolver node, which will use the audio sample of the frog
     * chirp to process incoming audio from the microphone
     */
    private async createConvolver(): Promise<void> {
      this.convolver = this.audioConfig.ctx.createConvolver();
      this.convolver.normalize = false;
  
      // load impulse response from file
      const response = await fetch(this.audioFilepath);
      const arraybuffer = await response.arrayBuffer();
  
      this.convolver.buffer =
        await this.audioConfig.ctx.decodeAudioData(arraybuffer);
    }

  /**
   * Configure the Web Audio analyser nodes, which are responsible for measuring
   * FFT data on the microphone input. One of these analysers is responsible for
   * measuring the mic input directly, and the other is responsible for measuring
   * the mic input convolved with the frog's chirp itself. The latter is used to
   * perform operations to detect frog chirping in the mic input
   *
   * Ref: https://www.w3.org/TR/2013/WD-webaudio-20131010/convolution.html
   */
  private setUpAnalysers(): void {
    const smoothingConstant = 0.8; // value to be tweaked

    // set up direct input analyser
    this.directInputAnalyser = this.audioConfig.ctx.createAnalyser();
    this.directInputAnalyser.fftSize = FFT_SIZE;
    this.directInputAnalyser.smoothingTimeConstant = smoothingConstant; // this can be tweaked

    inputSourceNode.connect(this.directInputAnalyser);

    // set up convolved input analyser
    this.createConvolver();
    this.convolutionAnalyser = this.audioConfig.ctx.createAnalyser();
    this.convolutionAnalyser.fftSize = FFT_SIZE;
    this.convolutionAnalyser.smoothingTimeConstant = smoothingConstant; // this can be tweaked

    // set up high-pass filter, to minimize handling noise and energy in the very low frequency spectrum
    const filter = this.audioConfig.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpassFilterFrequency, 0); // to be tweaked
    filter.Q.setValueAtTime(0.01, 0);

    // connect input to filter, and then to convolver for analysis
    inputSourceNode.connect(filter);
    filter.connect(this.convolver);
    this.convolver.connect(this.convolutionAnalyser);

    // create Meyda analyser
    this.meydaAnalyser = Meyda.createMeydaAnalyzer({
      audioContext: this.audioConfig.ctx,
      sampleRate: this.audioConfig.ctx.sampleRate,
      source: this.convolver,
      bufferSize: 1024,
      featureExtractors: [
        'loudness',
        'spectralRolloff',
        'spectralCrest',
        'spectralCentroid',
      ],
      callback: (features) => {
        this.meydaCallback(features);
      },
    });

    this.meydaAnalyser.start();
  
    // Debug: send convolved input through audio output
    // this.convolutionAnalyser.connect(this.audioConfig.ctx.destination);
  }

  /**
   * Use web audio analyser to calculate the frequency spectrum of the mic input,
   * giving the frog the ability to "hear". The main 'trick' with this is that
   * convolutionFFT emphasizes the frequency spectrum of the microphone input
   * that matches the frog chirp, and can be used to roughly determine whether
   * a sound present in the mic input matches the frog
   *
   * Ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData
   * To Do: try extracting more audio features (https://meyda.js.org/audio-features)
   */
  private analyseInputSignal(): void {
    // todo: don't re-instantiate
    const convolutionFFT = new Float32Array(FFT_SIZE / 2);
    const directInputFFT = new Float32Array(FFT_SIZE / 2);

    this.convolutionAnalyser.getFloatFrequencyData(convolutionFFT);
    this.convolutionAmplitude = calculateAmplitude(convolutionFFT);

    // the direct input analyser is currently just used for diagnostics, and is not being actively used
    this.directInputAnalyser.getFloatFrequencyData(directInputFFT);
    this.amplitude = calculateAmplitude(directInputFFT);

    this.convolutionFFT = convolutionFFT;
    this.directInputFFT = directInputFFT;

    this.loudness = this?.audioFeatures?.loudness?.total;
  }

  /**
   * Emit an event with the current state of the audio analyser
   */
  public emitAudioEvent(): void {
    this.analyseInputSignal();
    this.emitter.emit('audioFeatures', {
      audioFeatures: this.audioFeatures,
      convolutionAmplitude: this.convolutionAmplitude,
      amplitude: this.amplitude,
      convolutionFFT: this.convolutionFFT,
      directInputFFT: this.directInputFFT,
      loudness: this.loudness
    });
    // if (!this.hasInitialized || this.isSleeping) return;

    this.establishAmbientFFT();
  }

  private setAmbientFFT(): void {
    this.ambientFFT = this.convolutionFFT;
    this.convolutionAmplitudeThreshold = this.convolutionAmplitude;

    // TODO?: dynamically reset amplitude threshold to lower values as the environment gets quieter
    // this.baselineRolloff = this.audioFeatures?.spectralRolloff
    const averageRolloff = _.mean(this.audioFeaturesOverTime.spectralRolloff);
    this.baselineRolloff = averageRolloff;
    // this.audioFeatures.averageRolloff = averageRolloff
    // this.baselineCentroid = this.audioFeatures?.spectralCentroid
    const averageCentroid = _.mean(this.audioFeaturesOverTime.spectralCentroid);
    this.baselineCentroid = averageCentroid;
    // this.audioFeatures.averageCentroid = averageCentroid
  }

  /**
   * Set the FFT data corrresponding to the convolved mic input when the
   * environment is quiet. This provides the baseline measurement to detect
   * other frogs in the acoustic environment
   */
    private establishAmbientFFT(): void {
      const convolvedInputHasSettled =
        Date.now() - this.startTime > this.sampleDuration * 1000;

      // early return if ambientFFT has already been set
      if (this.ambientFFT || !convolvedInputHasSettled) return;
  
      if (this.loudness > this.loudnessThreshold) {
        clearTimeout(this.ambientTimeout);
        this.ambientTimeout = null;
        // to do: refactor
        this.audioFeaturesOverTime = {
          spectralRolloff: [],
          spectralCentroid: [],
        };
        return;
      }
  
      if (this.ambientTimeout) return;
  
      // set ambientFFT if the environment has settled into quiet for a certain period of time
      this.ambientTimeout = setTimeout(() => {
        this.setAmbientFFT();
        this.environmentIsQuiet = true;
      }, 2500);
    }

  public meydaCallback(features): void {
    const isAnalysingAmbience = !!this.ambientTimeout;

    this.audioFeatures = Object.assign(features);

    this.updateStateWithThrottle();

    if (isAnalysingAmbience) {
      const { spectralRolloff, spectralCentroid } = features;

      if (typeof spectralRolloff === 'number')
        this.audioFeaturesOverTime.spectralRolloff.push(spectralRolloff);
      if (typeof spectralCentroid === 'number')
        this.audioFeaturesOverTime.spectralCentroid.push(spectralCentroid);
    }
  }

  public stop(): void {
    this.meydaAnalyser.stop();
  }
  
  public start(): void {
    this.meydaAnalyser.start();
  }
}
