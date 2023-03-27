import _ from 'lodash';
import { FFT_SIZE, handleError } from './store';
import { log } from './utils';

/**
 * The AudioConfig class is responsible for managing audio input and output devices
 */
export class AudioConfig {
  input: MediaStreamAudioSourceNode;
  input2: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  ctx: AudioContext;
  canvas: HTMLCanvasElement;
  deviceId: string;
  groupId: string;
  sampleRate: number;

  /**
   * Initialize Audio class instance
   * @returns Promise
   */
  public start() {
    (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContext();
    this.sampleRate = this.ctx.sampleRate;
    log('Audio Sample Rate:', this.sampleRate);

    return this.setInputDeviceId()
      .then(this.initializeAudio.bind(this))
      .then(() => {
        console.log('audio start complete');
      });
  }

  /**
   * Determine the audio input device id
   * @returns Promise
   */
  private setInputDeviceId() {
    return navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        const audioInputDevice = audioInputDevices[0];

        if (!audioInputDevice) {
          console.error('no audio input device found');
          return;
        } else if (audioInputDevices.length > 1) {
          console.warn(`multiple audio devices found - selecting ${JSON.stringify(audioInputDevice)}`);
        }

        this.deviceId = audioInputDevice.deviceId;
        this.groupId = audioInputDevice.groupId;
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  /**
   * Connect audio input to webAudio analyser and set up
   * an interval timer to measure FFT of realtime audio
   */
  private initializeAudio() {
    const ctx = this.ctx;
    const constraints = { audio: {} };

    if (this.deviceId) constraints.audio = { deviceId: { exact: this.deviceId } };
    else if (this.groupId) constraints.audio = { groupId: { exact: this.groupId } };

    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream: any) => {
        const input = ctx.createMediaStreamSource(stream);

        this.input = input;
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = FFT_SIZE;
        this.analyser.smoothingTimeConstant = 0.5; // to be tweaked
        // input.connect(this.analyser); // why is this here??
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  /**
   * Analyze incoming audio and generate an FFT signature to be used
   * to compare against other signals
   * Note: see https://stackoverflow.com/questions/14169317/interpreting-web-audio-api-fft-results
   * @param audio - audio elemnt with src to be analysed
   * @param sourceNode - source node corresponding to audio
   * @param duration - audio sample duration (seconds)
   * @returns Float32Array
   */
  public async analyseSample(
    audio: HTMLAudioElement,
    sourceNode: MediaElementAudioSourceNode,
    duration: number
  ): Promise<Float32Array> {
    // create analyser node
    const analyserNode = this.ctx.createAnalyser();

    analyserNode.fftSize = FFT_SIZE;
    analyserNode.smoothingTimeConstant = 0.97; // this can be tweaked

    // set up audio node network
    sourceNode.connect(analyserNode);

    // measure the FFT of the audio sample n times, at equal time intervals across the duration of the sample
    const bufferLength = analyserNode.frequencyBinCount;
    const fft = new Float32Array(bufferLength);
    const numberOfSteps = 5; // can be tweaked
    const intervalLength = Math.floor((duration * 1000) / numberOfSteps);

    // render error if there is an issue on playback
    // await audio.play()
    //   .catch(e => {
    //     handleError(e);
    //     throw new Error(e);
    //   });

    for (let index = 0; index < numberOfSteps; index++) {
      await new Promise(resolve => setTimeout(resolve, intervalLength));
      analyserNode.getFloatFrequencyData(fft);

      if (_.max(fft) === -Infinity) console.warn(`issue occurred analysing sample on step ${index}`);
    }

    return fft;
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
}
