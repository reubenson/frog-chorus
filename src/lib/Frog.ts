/**
 * This file exports a single class (Frog), which is intended to be used in a browser-based
 * translation of a sound art installation by Felix Hess. It relies on the web audio API
 * to perform FFT (Fast Fourier Transform) analysis to determine the frequency content of
 * the audio signal picked up by the device's microphone. The underlying behavior for a 'frog'
 * is relatively straightfoward, in which the frog will listen to its audio environmnent (mediated
 * by the microphone and frequency spectrum analaysis), and will chirp based on its "eagerness"
 * and "shyness".
 *
 * When eagerness is high relative to shyness, the robot will emit a chirping sound, which is then
 * "heard" by the other robots. Each robot will become more "eager" when it hears another's chirp,
 * and will become more "shy" when it hears loud non-chirping sounds. Through a simple set of
 * behavioral rules, a dynamic chorus of chirping emerges, which is highly sensitive to environmental
 * dynamics, similar to if one were encountering a frog chorus in the wild.
 *
 * Multiple instances of this class may run within the runtime environment on a single device,
 * but the ultimate intent is to only have one instatiated per device, and to have it "interact"
 * with other frogs running on other devices within acoustic proximity.
 */

import { EventEmitter } from 'eventemitter3';
import _ from 'lodash';
import type { AudioConfig } from './AudioManager';
import { chirpAttemptRate, loudnessThreshold, rateOfLosingShyness } from './store';
import { calculateAmplitude, testProbability, findPeakBin } from './utils';
import { AudioFeatures } from './AudioFeatures';
import { AudioAnalyser } from './AudioAnalyser';

let idCounter = 0;

interface FrogProps {
  id: number;
  amplitude: number;
  isCurrentlySinging: boolean;
  frogSignalDetected: boolean;
  isSleeping: boolean;
  shyness: number;
  eagerness: number;
  chirpProbability: number;
  detuneAmount: number;
}

export class Frog implements FrogProps {
  private emitter: EventEmitter;
  id: number;
  amplitude: number;
  audioAnalyser: AudioAnalyser;
  audioConfig: AudioConfig;
  shyness: number; // 0. - 1.
  eagerness: number; // 0. - 1.
  lastUpdated: number;
  currentTimestamp: number;
  rateOfStateChange: number; // manually-calibrated value used to determine rate of change in eagerness and shyness
  sampleDuration: number;
  hasInitialized: boolean;
  frogSignalDetected: boolean;
  isCurrentlySinging: boolean;
  chirpProbability: number;
  detuneAmount: number;
  chirpTimer: NodeJS.Timeout;
  isSleeping: boolean;
  lastAttemptTime: number;

  constructor(audioAnalyser) {
    this.id = ++idCounter;
    this.audioAnalyser = audioAnalyser;
    this.emitter = audioAnalyser.emitter;
    this.audioConfig = audioAnalyser.audioConfig;
    this.shyness = 1.0; // initiaize to 1 (maximum shyness)
    this.eagerness = 0.0; // initialize to 0 (minimum eagerness)
    this.lastUpdated = Date.now();
    this.currentTimestamp = Date.now();
    this.rateOfStateChange = 0.2; // to be tweaked
    this.hasInitialized = false;
    this.frogSignalDetected = false;
    this.isCurrentlySinging = false;
    this.detuneAmount = _.random(-100, 100);
    this.isSleeping = false;
    this.lastAttemptTime = Date.now();

    this.emitter.on('audioFeatures', this.updateState.bind(this));
  }

  /**
   * Initialize the frog
   */
  public initialize(): void {
    // evaluate whether to chirp or not on every tick
    this.chirpTimer = setInterval(this.tryChirp.bind(this), chirpAttemptRate);

    this.hasInitialized = true;
  }

  /**
   * Update the internal state in response to environment
   * Hearing other frogs will increase eagerness.
   * A loud environment with non-frog sounds will increase shyness.
   * @param audioFeatures - object containing audio features
   * @returns
   */
  public updateState(audioFeatures: AudioFeatures): void {
    if (!this.hasInitialized || this.isSleeping) return;

    if (this.isCurrentlySinging) {
      // log('pausing update state while chirping');
      return;
    }

    this.currentTimestamp = Date.now();

    this.amplitude = audioFeatures.amplitude;

    this.detectFrogSignal(audioFeatures);
    this.updateShyness();
    this.updateEagerness();

    this.lastUpdated = this.currentTimestamp;
  }

  public sleep(): void {
    clearInterval(this.chirpTimer);
    this.isSleeping = true;
  }

  /**
   * Perform frequency analysis using FFT data to determine whether another frog is being heard.
   * The convolutionFFT data is a way of representing the degree of match between the microphone
   * input and the sound of the frog. The baselineAudioFeatures is snapshot of the convolutionFFT
   * data taken when the environment is very quiet, and therefore represents a baseline measurement
   * to detect when there are sounds in the environment above ambient noise. By comparing these two
   * FFT arrays, we can get make an approximate determination of detectable sounds, whether those
   * sounds correspond to the frequency range we would associated with the frog.
   *
   * TO DO: Ideas for improving signal detection
   * - Use a weighted average calculation instead of analysing frequency bins in the FFT individually
   * - Try statistical measurements https://www.npmjs.com/package/stat-fns
   */
  private detectFrogSignal(audioFeatures: AudioFeatures): void {
    if (!this.audioAnalyser.environmentIsQuiet) return;

    const convolutionPeakBin = findPeakBin(audioFeatures.convolutionFFT);
    const baselinePeakBin = findPeakBin(this.audioAnalyser.baselineAudioFeatures.convolutionFFT);

    // simple calculation: determine whether the peak frequency bin is similar,
    // between convolutionFFT and baselineFFT
    const peaksAreSimilar = Math.abs(convolutionPeakBin.index - baselinePeakBin.index) < 4;
    const convolutionAmplitude = calculateAmplitude(audioFeatures.convolutionFFT);
    const convolutionIsLouder =
      convolutionAmplitude - this.audioAnalyser.convolutionAmplitudeThreshold > 20;

    // these criteria ensure (1) that the dominant frequency of the frog is
    // reflected in the convolution FFT data (works under the assumption that
    // the frog only has one dominant frequency, e.g. not cocqui) and (2) that
    // the microphone is above ambient noise, and therefore actually hearing a
    // frog, and not hovering around the ambient state
    const convolutionMatches = peaksAreSimilar && convolutionIsLouder;

    // spectral rolloff: "The frequency below which is contained 99% of the energy
    // of the spectrum". This is useful for ensuring that the spectrum is similar,
    // without a bunch of energy added to non-frog parts of the spectrum
    const rolloff = audioFeatures.spectralRolloff;
    const deltaRolloff = Math.abs(rolloff - this.audioAnalyser.baselineRolloff);
    const rolloffIsSimilar = deltaRolloff < 600;

    // spectral crest: "This is the ratio of the loudest magnitude over the RMS
    // of the whole frame. A high number is an indication of a loud peak compared
    // out to the overall curve of the spectrum".  This is useful for ensuring that
    // there are still sharp peaks in the audio. This is only useful for frogs like
    // spring peepers, which have a strong dominant frequency
    const crest = audioFeatures.spectralCrest;
    const hasSharpCrest = crest > 10;

    // spectral centroid: "An indicator of the “brightness” of a given sound, representing
    // the spectral centre of gravity. If you were to take the spectrum, make a wooden
    // block out of it and try to balance it on your finger (across the X axis), the spectral
    // centroid would be the frequency that your finger “touches” when it successfully balances."
    // This is very useful, because it ensures that the majority of activity in the spectrum is
    // close to the frog's dominant frequency
    const centroid = audioFeatures.spectralCentroid;
    const relativeCentroid = Math.abs(centroid - this.audioAnalyser.baselineCentroid);
    const centroidIsSimilar = relativeCentroid < 1.0;

    this.frogSignalDetected =
      convolutionMatches && hasSharpCrest && centroidIsSimilar && rolloffIsSimilar;
  }

  /**
   * Update the frog's "shyness", which is the frog's tendency to be silent
   */
  private updateShyness(): void {
    const loudness = this.audioAnalyser.realtimeAudioFeatures?.loudness || 0;
    const rateOfIncreasingShyness = 0.8 * (loudness / 40.0);
    const isQuiet = loudness < loudnessThreshold + 5;

    if (isQuiet) {
      const velocity = rateOfLosingShyness;

      // monotonically decrease shyness if the environment is quiet
      this.shyness -= velocity * this.timeSinceLastUpdate();
    } else {
      const velocity = rateOfIncreasingShyness;

      // increase shyness if environment is loud
      // To Do: also make a function of this.frogSignalDetected?
      this.shyness += velocity * this.timeSinceLastUpdate();
    }

    this.shyness = Math.max(0, Math.min(1, this.shyness)); // restrict to value between 0 and 1
  }

  /**
   * Update the frog's "eagerness", which is the tendency of the frog to chirp
   */
  private updateEagerness(): void {
    if (this.frogSignalDetected) {
      // increase eagerness if other frogs are heard
      // TODO: make a function of amount of signal detected?
      const velocity = this.rateOfStateChange * 5; // amount of change in eagerness per second

      this.eagerness += velocity * this.timeSinceLastUpdate();
    } else {
      // TODO: consider monotonically increasing as a function of quietness
      // do nothing; shyness will increase if the environment is loud
      // eagerness will only monotonically increase, and will only decrease
      // to 0 immediately after it makes a chirp
    }

    // limit eagerness to a max of 1
    this.eagerness = Math.min(1, this.eagerness);
  }

  /**
   * Calculate time since the last state update, in units of seconds
   * @returns number
   */
  private timeSinceLastUpdate(): number {
    return (this.currentTimestamp - this.lastUpdated) / 1000;
  }

  /**
   * Make the frog chirp, by playing audio sample
   */
  private playSample(): void {
    const shouldPauseWhilePlaying = true; // remove after debugging

    if (shouldPauseWhilePlaying) {
      this.isCurrentlySinging = true;
      this.audioAnalyser.stop();

      setTimeout(
        () => {
          this.isCurrentlySinging = false;
          this.audioAnalyser.start();
        },
        2 * this.sampleDuration * 1000,
      );
    }

    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    const source = this.audioConfig.ctx.createBufferSource();

    source.buffer = this.audioAnalyser.buffer;
    source.connect(this.audioConfig.ctx.destination);

    source.detune.value = this.detuneAmount;

    // trigger playback; start can only be called once
    source.start();
  }

  /**
   * Map eagerness to an exponential curve
   * @param eagerness - value 0 to 1
   * @returns - 0 to 1
   */
  public calculateEagernessFactor(eagerness): number {
    const eagernessBaseFactor = 0.01;

    return eagernessBaseFactor + Math.pow(eagerness, 1 / 2) * (1 - eagernessBaseFactor);
  }

  /**
   * Map shyness to an exponential curve
   * @param shyness - value 0 to 1
   * @returns - 0 to 1
   */
  public calculateShynessFactor(shyness): number {
    return 1 - Math.pow(shyness, 2 / 3);
  }

  /**
   * Determine the likelihood that the frog should chirp
   * @returns number - between 0 and 1
   */
  private determineChirpProbability(): number {
    if (this.eagerness === 1) {
      return 1;
    } else {
      return (
        this.calculateEagernessFactor(this.eagerness) * this.calculateShynessFactor(this.shyness)
      );
    }
  }

  /**
   * Determine whether the frog should chirp, or not.
   * Probability is calculated over a volume of time:
   * likelihood of chirp per second.
   * This is done to account for variable attempt rate, especially when interval timers are subject
   * to throttling by the browser (e.g. when screen is inactive)
   */
  private tryChirp(): void {
    const time = Date.now();
    const probabilityInterval = 1; // (unit: seconds)

    this.chirpProbability =
      (this.determineChirpProbability() * ((time - this.lastAttemptTime) / 1000)) /
      probabilityInterval;
    const shouldChirp = testProbability(this.chirpProbability);

    if (shouldChirp) {
      this.playSample();

      // reset eagerness to 0 so that the frog does not immediately chirp at the next invocation
      this.eagerness = 0;
    }

    this.lastAttemptTime = time;
  }

  /**
   * Handy function for returning just the props needed for rendering UI
   * (many of these are for debug/diagnostics, not for the primary view)
   * @returns FrogProps
   */
  public getUiProps(): FrogProps {
    return {
      id: this.id,
      amplitude: this.amplitude,
      frogSignalDetected: this.frogSignalDetected,
      isCurrentlySinging: this.isCurrentlySinging,
      isSleeping: this.isSleeping,
      shyness: this.shyness,
      eagerness: this.eagerness,
      chirpProbability: this.chirpProbability,
      detuneAmount: this.detuneAmount,
    };
  }
}
