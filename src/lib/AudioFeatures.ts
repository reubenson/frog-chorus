interface AudioFeaturesI {
  amplitude: number;
  convolutionFFT: Float32Array;
  directInputFFT: Float32Array;
  loudness: number;
  spectralCrest: number;
  spectralRolloff: number;
  spectralCentroid: number;
  // averageRolloff: number // calculated over time, not provided by Meyda
  // averageCentroid: number // calculated over time, not provided by Meyda
}

export class AudioFeatures implements AudioFeaturesI {
  amplitude: number;
  convolutionFFT: Float32Array;
  directInputFFT: Float32Array;
  loudness: number;
  spectralCrest: number;
  spectralRolloff: number;
  spectralCentroid: number;

  constructor(features: AudioFeaturesI) {
    this.amplitude = features.amplitude;
    this.convolutionFFT = features.convolutionFFT;
    this.directInputFFT = features.directInputFFT;
    this.loudness = features.loudness;
    this.spectralCrest = features.spectralCrest;
    this.spectralRolloff = features.spectralRolloff;
    this.spectralCentroid = features.spectralCentroid;
  }
}
