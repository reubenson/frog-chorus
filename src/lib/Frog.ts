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
 *
 * To see a diagram of the general logic flow, see https://reubenson.com/frog/frog-diagram.png
 *
 * Historical Context:
 * Felix Hess began developing his frog-based installation work in 1982, which involved developing
 * a set of fifty robots, each outfitted with a microphone, speaker, and circuitry to allow each
 * robot to listen to its environment and make sounds in the manner of a frog in a frog chorus.
 *
 * Some historical documentation can be read here (https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/),
 * but the best resource for understanding Hess' work is his monograph, 'Light as Air', published by Kehrer Verlag,
 * as well as an artist talk from the 2010s on [YouTube](https://www.youtube.com/watch?v=rMnFKYHzm2k).
 *
 * Additional references:
 * On how frogs hear: https://www.sonova.com/en/story/frogs-hearing-no-ears
 * Autocorrelation for pitch detection: https://alexanderell.is/posts/tuner/
 * Convolution vs correlation: https://towardsdatascience.com/convolution-vs-correlation-af868b6b4fb5
 * Pitchy lib: https://www.npmjs.com/package/pitchy
 */

import type { MeydaAnalyzer } from 'meyda'
import Meyda from 'meyda'
import _ from 'lodash'
import type { AudioConfig } from './AudioManager'
import {
  DEBUG_ON,
  FFT_SIZE,
  chirpAttemptRate,
  highpassFilterFrequency,
  inputSamplingInterval,
  inputSourceNode,
  loudnessThreshold,
  rateOfLosingShyness
} from './store'
import { log, calculateAmplitude, testProbability } from './utils'

let idCounter = 0
let debugOn = false

interface AudioFeatures {
  loudness: { total: number, specific: number }
  spectralCrest: number
  spectralRolloff: number
  spectralCentroid: number
  // averageRolloff: number // calculated over time, not provided by Meyda
  // averageCentroid: number // calculated over time, not provided by Meyda
}

interface AudioFeaturesOverTime {
  spectralRolloff: number[]
  spectralCentroid: number[]
}

interface FrogProps {
  id: number
  amplitude: number
  isCurrentlySinging: boolean
  frogSignalDetected: boolean
  isSleeping: boolean
  environmentIsQuiet: boolean
}

interface FrogPropsExtended extends FrogProps {
  convolutionAmplitude: number
  shyness: number
  eagerness: number
  directInputFFT: Float32Array
  convolutionFFT: Float32Array
  ambientFFT: Float32Array
  audioFeatures: AudioFeatures
  loudnessThreshold: number
  loudness: number
  baselineCentroid: number
  baselineRolloff: number
  chirpProbability: number
  detuneAmount: number
}

export class Frog implements FrogPropsExtended {
  id: number
  amplitude: number
  audioFilepath: string
  audioConfig: AudioConfig
  shyness: number // 0. - 1.
  eagerness: number // 0. - 1.
  directInputFFT: Float32Array
  convolutionFFT: Float32Array
  diffFFT: Float32Array
  lastUpdated: number
  currentTimestamp: number
  rateOfStateChange: number // manually-calibrated value used to determine rate of change in eagerness and shyness
  sampleDuration: number
  // amplitudeThreshold: number; // relative threshold between a quiet vs noisy environment
  loudnessThreshold: number // loudness calculated with Meyda lib
  convolutionAmplitudeThreshold: number
  hasInitialized: boolean
  convolutionAnalyser: AnalyserNode
  directInputAnalyser: AnalyserNode
  meydaAnalyser: MeydaAnalyzer
  loudness: number
  convolutionAmplitude: number
  convolver: ConvolverNode
  ambientFFT: Float32Array
  environmentIsQuiet: boolean
  frogSignalDetected: boolean
  isCurrentlySinging: boolean
  audioFeatures: AudioFeatures
  audioFeaturesOverTime: AudioFeaturesOverTime
  buffer: AudioBuffer
  baselineRolloff: number
  baselineCentroid: number
  ambientTimeout: number
  chirpProbability: number
  detuneAmount: number
  chirpTimer: NodeJS.Timeout
  isSleeping: boolean
  startTime: number
  lastAttemptTime: number
  updateStateWithThrottle: Function
  constructor (audioConfig: AudioConfig, audioFilepath: string) {
    DEBUG_ON.subscribe(val => {
      debugOn = val
    })
    this.id = ++idCounter
    this.audioConfig = audioConfig
    this.audioFilepath = audioFilepath
    this.shyness = 1.0 // initiaize to 1 (maximum shyness)
    this.eagerness = 0.0 // initialize to 0 (minimum eagerness)
    this.lastUpdated = Date.now()
    this.currentTimestamp = Date.now()
    this.rateOfStateChange = 0.2 // to be tweaked
    // this.amplitudeThreshold = -65; // to be tweaked
    this.loudnessThreshold = loudnessThreshold
    this.hasInitialized = false
    this.frogSignalDetected = false
    this.isCurrentlySinging = false
    this.detuneAmount = _.random(-100, 100)
    this.audioFeaturesOverTime = {
      spectralCentroid: [],
      spectralRolloff: []
    }
    this.isSleeping = false
    this.startTime = Date.now()
    this.lastAttemptTime = this.startTime
    this.updateStateWithThrottle = _.throttle(this.updateState, inputSamplingInterval)
  }

  /**
   * Calculate the audioImprint, which will be used to compare against the microphone's audio
   * feed in order to determine the level of match in the frequency spectrum and thereby calcuate
   * the frog's shyness and eagerness
   */
  public async initialize (): Promise<void> {
    const attemptRate = chirpAttemptRate

    await this.fetchAudioBuffer()

    this.setUpAnalysers()

    // evaluate whether to chirp or not on every tick
    this.chirpTimer = setInterval(this.tryChirp.bind(this), attemptRate)

    this.hasInitialized = true
  }

  /**
   * Periodically update frog's shyness and eagerness
   * Hearing other frogs will increase eagerness.
   * A loud environment with non-frog sounds will increase shyness.
   */
  public updateState (): void {
    if (!this.hasInitialized || this.isSleeping) return

    this.analyseInputSignal()

    if (this.isCurrentlySinging) {
      // log('pausing update state while chirping');
      return
    }

    this.currentTimestamp = Date.now()

    // To Do: move this to initialize fn instead?
    this.establishAmbientFFT()

    this.detectFrogSignal()
    this.updateShyness()
    this.updateEagerness()

    this.lastUpdated = this.currentTimestamp
  }

  public sleep (): void {
    this.meydaAnalyser.stop()
    clearInterval(this.chirpTimer)
    this.isSleeping = true
  }

  /**
   * Set up the convolver node, which will use the audio sample of the frog
   * chirp to process incoming audio from the microphone
   */
  private async createConvolver (): Promise<void> {
    this.convolver = this.audioConfig.ctx.createConvolver()
    this.convolver.normalize = false

    // load impulse response from file
    const response = await fetch(this.audioFilepath)
    const arraybuffer = await response.arrayBuffer()

    this.convolver.buffer = await this.audioConfig.ctx.decodeAudioData(arraybuffer)
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
  private setUpAnalysers (): void {
    const smoothingConstant = 0.8 // value to be tweaked

    // set up direct input analyser
    this.directInputAnalyser = this.audioConfig.ctx.createAnalyser()
    this.directInputAnalyser.fftSize = FFT_SIZE
    this.directInputAnalyser.smoothingTimeConstant = smoothingConstant // this can be tweaked

    inputSourceNode.connect(this.directInputAnalyser)

    // set up convolved input analyser
    this.createConvolver()
    this.convolutionAnalyser = this.audioConfig.ctx.createAnalyser()
    this.convolutionAnalyser.fftSize = FFT_SIZE
    this.convolutionAnalyser.smoothingTimeConstant = smoothingConstant // this can be tweaked

    // set up high-pass filter, to minimize handling noise and energy in the very low frequency spectrum
    const filter = this.audioConfig.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(highpassFilterFrequency, 0) // to be tweaked
    filter.Q.setValueAtTime(0.01, 0)

    // connect input to filter, and then to convolver for analysis
    inputSourceNode.connect(filter)
    filter.connect(this.convolver)
    this.convolver.connect(this.convolutionAnalyser)

    // create Meyda analyser
    this.meydaAnalyser = Meyda.createMeydaAnalyzer({
      audioContext: this.audioConfig.ctx,
      sampleRate: this.audioConfig.ctx.sampleRate,
      source: this.convolver,
      bufferSize: 1024,
      featureExtractors: ['loudness', 'spectralRolloff', 'spectralCrest', 'spectralCentroid'],
      callback: features => {
        const isAnalysingAmbience = !!this.ambientTimeout

        this.audioFeatures = Object.assign(features)

        this.updateStateWithThrottle()

        if (isAnalysingAmbience) {
          const { spectralRolloff, spectralCentroid } = features

          if (typeof spectralRolloff === 'number') this.audioFeaturesOverTime.spectralRolloff.push(spectralRolloff)
          if (typeof spectralCentroid === 'number') this.audioFeaturesOverTime.spectralCentroid.push(spectralCentroid)
        }
      }
    })

    this.meydaAnalyser.start()
    // Debug: send convolved input through audio output
    // this.convolutionAnalyser.connect(this.audioConfig.ctx.destination);
  }

  /**
   * Determine length of audio sample, in seconds
   */
  private async fetchAudioBuffer (): Promise<void> {
    await new Promise<void>(resolve => {
      const req = new XMLHttpRequest()

      req.open('GET', this.audioFilepath, true)
      req.responseType = 'arraybuffer'
      req.onload = async () => {
        const data = req.response

        await this.audioConfig.ctx.decodeAudioData(data, buffer => {
          this.buffer = buffer
          this.sampleDuration = buffer.duration
          log('Sample Duration:', this.sampleDuration)

          resolve()
        })
      }

      req.send()
    })
  }

  /**
   * Use web audio analyser to calculate the frequency spectrum of the mic input,
   * giving the frog the ability to "hear". The main 'trick' with this is that
   * convolutionFFT emphasizes the frequency spectrum of the microphone input
   * that matches the frog chirp, and can be used to roughly determine whether
   * a sound present in the mic input matches the frog
   *
   * Ref: ref: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData
   * To Do: try extracting more audio features (https://meyda.js.org/audio-features)
   */
  private analyseInputSignal (): void {
    // todo: don't re-instantiate
    const convolutionFFT = new Float32Array(FFT_SIZE / 2)
    const directInputFFT = new Float32Array(FFT_SIZE / 2)

    this.convolutionAnalyser.getFloatFrequencyData(convolutionFFT)
    this.convolutionAmplitude = calculateAmplitude(convolutionFFT)

    // the direct input analyser is currently just used for diagnostics, and is not being actively used
    this.directInputAnalyser.getFloatFrequencyData(directInputFFT)
    this.amplitude = calculateAmplitude(directInputFFT)

    this.convolutionFFT = convolutionFFT
    this.directInputFFT = directInputFFT

    this.loudness = this?.audioFeatures?.loudness?.total
  }

  private setAmbientFFT (): void {
    this.ambientFFT = this.convolutionFFT
    this.convolutionAmplitudeThreshold = this.convolutionAmplitude

    // TODO?: dynamically reset amplitude threshold to lower values as the environment gets quieter
    // this.baselineRolloff = this.audioFeatures?.spectralRolloff
    const averageRolloff = _.mean(this.audioFeaturesOverTime.spectralRolloff)
    this.baselineRolloff = averageRolloff
    // this.audioFeatures.averageRolloff = averageRolloff
    // this.baselineCentroid = this.audioFeatures?.spectralCentroid
    const averageCentroid = _.mean(this.audioFeaturesOverTime.spectralCentroid)
    this.baselineCentroid = averageCentroid
    // this.audioFeatures.averageCentroid = averageCentroid
  }

  /**
   * Set the FFT data corrresponding to the convolved mic input when the
   * environment is quiet. This provides the baseline measurement to detect
   * other frogs in the acoustic environment
   */
  private establishAmbientFFT (): void {
    const convolvedInputHasSettled = Date.now() - this.startTime > this.sampleDuration * 1000
    // early return if ambientFFT has already been set
    if (this.ambientFFT || !convolvedInputHasSettled) return

    if (this.loudness > this.loudnessThreshold) {
      clearTimeout(this.ambientTimeout)
      this.ambientTimeout = null
      // to do: refactor
      this.audioFeaturesOverTime = {
        spectralRolloff: [],
        spectralCentroid: []
      }
      return
    }

    if (this.ambientTimeout) return

    // set ambientFFT if the environment has settled into quiet for a certain period of time
    this.ambientTimeout = setTimeout(() => {
      this.setAmbientFFT()
      this.environmentIsQuiet = true
    }, 2500)
  }

  /**
   * For a given array, return an object containing the index-value pair
   * corresponding to the largest value in the array
   * @param arr - expects an array of FFT values
   * @returns object
   */
  private findPeakBin (arr: Float32Array): { index: number, value: number } {
    const defaultValue = { index: 0, value: -Infinity }

    if (!arr) return defaultValue

    return arr.reduce((acc: { index: number, value: number }, item: number, i: number) => {
      if (item > acc.value) {
        return { index: i, value: item }
      } else {
        return acc
      }
    }, defaultValue)
  }

  /**
   * Perform frequency analysis using FFT data to determine whether another frog is being heard.
   * The convolutionFFT data is a way of representing the degree of match between the microphone
   * input and the sound of the frog. The ambientFFT data is a snapshot of the convolutionFFT
   * data taken when the environment is very quiet, and therefore represents a baseline measurement
   * to detect when there are sounds in the environment above ambient noise. By comparing these two
   * FFT arrays, we can get make an approximate determination of detectable sounds, whether those
   * sounds correspond to the frequency range we would associated with the frog.
   *
   * TO DO: Ideas for improving signal detection
   * - Use a weighted average calculation instead of analysing frequency bins in the FFT individually
   * - Use a library like Meyda to extract more complex audio features (https://meyda.js.org/audio-features)
   * - Try statistical measurements https://www.npmjs.com/package/stat-fns
   */
  private detectFrogSignal (): void {
    const convolutionPeakBin = this.findPeakBin(this.convolutionFFT)
    const ambientPeakBin = this.findPeakBin(this.ambientFFT)

    // simple calculation: determine whether the peak frequency bin is similar,
    // between convolutionFFT and ambientFFT
    const peaksAreSimilar = Math.abs(convolutionPeakBin.index - ambientPeakBin.index) < 4
    const convolutionAmplitude = calculateAmplitude(this.convolutionFFT)
    const convolutionIsLouder = convolutionAmplitude - this.convolutionAmplitudeThreshold > 20

    // these criteria ensure (1) that the dominant frequency of the frog is reflected in the convolution FFT data (works under the assumption that the frog only has one dominant frequency, e.g. not cocqui) and (2) that the microphone is above ambient noise, and therefore actually hearing a frog, and not hovering around the ambient state
    const convolutionMatches = peaksAreSimilar && convolutionIsLouder

    // spectral rolloff: "The frequency below which is contained 99% of the energy of the spectrum". This is useful for ensuring that the spectrum is similar, without a bunch of energy added to non-frog parts of the spectrun
    const rolloff = this.audioFeatures?.spectralRolloff
    const deltaRolloff = Math.abs(rolloff - this.baselineRolloff)
    const rolloffIsSimilar = deltaRolloff < 600

    // spectral crest: "This is the ratio of the loudest magnitude over the RMS of the whole frame. A high number is an indication of a loud peak compared out to the overall curve of the spectrum".  This is useful for ensuring that there are still sharp peaks in the audio. This is only useful for frogs like spring peepers, which have a strong dominant frequency
    const crest = this.audioFeatures?.spectralCrest
    const hasSharpCrest = crest > 10

    // spectral centroid: "An indicator of the “brightness” of a given sound, representing the spectral centre of gravity. If you were to take the spectrum, make a wooden block out of it and try to balance it on your finger (across the X axis), the spectral centroid would be the frequency that your finger “touches” when it successfully balances." This is very useful, because it ensures that the majority of activity in the spectrum is close to the frog's dominant frequency
    const centroid = this.audioFeatures?.spectralCentroid
    const relativeCentroid = Math.abs(centroid - this.baselineCentroid)
    const centroidIsSimilar = relativeCentroid < 1.0

    this.frogSignalDetected = convolutionMatches && hasSharpCrest && centroidIsSimilar && rolloffIsSimilar
  }

  /**
   * Update the frog's "shyness", which is the frog's tendency to be silent
   */
  private updateShyness (): void {
    const rateOfIncreasingShyness = 0.8 * ((this.loudness || 0) / 40.0)

    // const environmentIsQuiet = this.amplitude < (this.amplitudeThreshold + 40);
    const environmentIsQuiet = this.loudness < this.loudnessThreshold + 5

    if (environmentIsQuiet) {
      const velocity = rateOfLosingShyness

      // monotonically decrease shyness if the environment is quiet
      this.shyness -= velocity * this.timeSinceLastUpdate()
    } else {
      const velocity = rateOfIncreasingShyness

      // increase shyness if environment is loud
      // To Do: also make a function of this.frogSignalDetected?
      this.shyness += velocity * this.timeSinceLastUpdate()
    }

    this.shyness = Math.max(0, Math.min(1, this.shyness)) // restrict to value between 0 and 1
  }

  /**
   * Update the frog's "eagerness", which is the tendency of the frog to chirp
   */
  private updateEagerness (): void {
    if (this.frogSignalDetected) {
      // increase eagerness if other frogs are heard
      // TODO: make a function of amount of signal detected?
      const velocity = this.rateOfStateChange * 5 // amount of change in eagerness per second

      this.eagerness += velocity * this.timeSinceLastUpdate()
    } else {
      // TODO: consider monotonically increasing as a function of quietness
      // do nothing; shyness will increase if the environment is loud
      // eagerness will only monotonically increase, and will only decrease
      // to 0 immediately after it makes a chirp
    }

    // limit eagerness to a max of 1
    this.eagerness = Math.min(1, this.eagerness)
  }

  /**
   * Calculate time since the last state update, in units of seconds
   * @returns number
   */
  private timeSinceLastUpdate (): number {
    return (this.currentTimestamp - this.lastUpdated) / 1000
  }

  /**
   * Make the frog chirp, by playing audio sample
   */
  private playSample (): void {
    const shouldPauseWhilePlaying = true // remove after debugging

    if (shouldPauseWhilePlaying) {
      this.isCurrentlySinging = true
      // this.meydaAnalyser.stop();

      setTimeout(() => {
        this.isCurrentlySinging = false
        // this.meydaAnalyser.start();
      }, 2 * this.sampleDuration * 1000)
    }

    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    const source = this.audioConfig.ctx.createBufferSource()

    source.buffer = this.buffer
    source.connect(this.audioConfig.ctx.destination)

    source.detune.value = this.detuneAmount
    source.start()
  }

  /**
   * Map eagerness to an exponential curve
   * @param eagerness - value 0 to 1
   * @returns - 0 to 1
   */
  public calculateEagernessFactor (eagerness): number {
    const eagernessBaseFactor = 0.01

    return eagernessBaseFactor + Math.pow(eagerness, 1 / 2) * (1 - eagernessBaseFactor)
  }

  /**
   * Map shyness to an exponential curve
   * @param shyness - value 0 to 1
   * @returns - 0 to 1
   */
  public calculateShynessFactor (shyness): number {
    return 1 - Math.pow(shyness, 2 / 3)
  }

  /**
   * Determine the likelihood that the frog should chirp
   * @returns number - between 0 and 1
   */
  private determineChirpProbability (): number {
    if (this.eagerness === 1) {
      return 1
    } else {
      return this.calculateEagernessFactor(this.eagerness) * this.calculateShynessFactor(this.shyness)
    }
  }

  /**
   * Determine whether the frog should chirp, or not.
   * Probability is calculated over a volume of time:
   * likelihood of chirp per second.
   * This is done to account for variable attempt rate, especially when interval timers are subject to throttling by the browser (e.g. when screen is inactive)
   */
  private tryChirp (): void {
    const time = Date.now()
    const probabilityInterval = 1 // (unit: seconds)

    this.chirpProbability = this.determineChirpProbability() * ((time - this.lastAttemptTime) / 1000) / probabilityInterval
    const shouldChirp = testProbability(this.chirpProbability)

    if (shouldChirp) {
      this.playSample()

      // reset eagerness to 0 so that the frog does not immediately chirp at the next invocation
      this.eagerness = 0
    }

    this.lastAttemptTime = time
  }

  /**
   * Handy function for returning just the props needed for rendering UI
   * (many of these are for debug/diagnostics, not for the primary view)
   * @returns FrogProps
   */
  public getProps (): FrogProps | FrogPropsExtended {
    return debugOn
      ? {
          id: this.id,
          amplitude: this.amplitude,
          convolutionAmplitude: this.convolutionAmplitude,
          shyness: this.shyness,
          eagerness: this.eagerness,
          directInputFFT: this.directInputFFT,
          convolutionFFT: this.convolutionFFT,
          ambientFFT: this.ambientFFT,
          audioFeatures: this.audioFeatures,
          isCurrentlySinging: this.isCurrentlySinging,
          frogSignalDetected: this.frogSignalDetected,
          loudnessThreshold: this.loudnessThreshold,
          loudness: this.loudness,
          baselineCentroid: this.baselineCentroid,
          baselineRolloff: this.baselineRolloff,
          chirpProbability: this.chirpProbability,
          detuneAmount: this.detuneAmount,
          isSleeping: this.isSleeping
        }
      : {
          id: this.id,
          frogSignalDetected: this.frogSignalDetected,
          isCurrentlySinging: this.isCurrentlySinging,
          isSleeping: this.isSleeping,
          amplitude: this.amplitude,
          environmentIsQuiet: this.environmentIsQuiet
        }
  }
}
