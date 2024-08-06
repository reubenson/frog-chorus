interface AudioFeaturesI {
  amplitude: number;
  // convolutionAmplitude: number;
  // ambientFFT: Float32Array;
  convolutionFFT: Float32Array;
  directInputFFT: Float32Array;
  // FFT: Float32Array;
  loudness: number;
  // loudness: { total: number; specific: number };
  spectralCrest: number;
  spectralRolloff: number;
  spectralCentroid: number;
  // averageRolloff: number // calculated over time, not provided by Meyda
  // averageCentroid: number // calculated over time, not provided by Meyda
}

export class AudioFeatures implements AudioFeaturesI {
  amplitude: number;
  // convolutionAmplitude: number;
  // FFT: Float32Array;
  // ambientFFT: Float32Array;
  convolutionFFT: Float32Array;
  directInputFFT: Float32Array;
  loudness: number;
  // loudness: { total: number; specific: number };
  spectralCrest: number;
  spectralRolloff: number;
  spectralCentroid: number;

  constructor(features: AudioFeaturesI) {
    this.amplitude = features.amplitude;
    // this.convolutionAmplitude = features.convolutionAmplitude;
    // this.FFT = features.FFT;
    // this.ambientFFT = features.ambientFFT;
    this.convolutionFFT = features.convolutionFFT;
    this.directInputFFT = features.directInputFFT;
    this.loudness = features.loudness;
    this.spectralCrest = features.spectralCrest;
    this.spectralRolloff = features.spectralRolloff;
    this.spectralCentroid = features.spectralCentroid;
  }
}