import _ from 'lodash';
import { PRINT_LOGS } from './store';

/**
 * Wrapper function around console.log
 * @param message - first string
 * @param additionalMessage - optional string
 */
export function log(message: string, additionalMessage?: any) {
  if (PRINT_LOGS) {
    console.log(message, additionalMessage || '');
  }
}

/**
 * Calculate the total amplitude of the input FFT
 * @param data - fft array
 * @returns number
 */
export function calculateAmplitude(data: Float32Array) {
  const fftSum = _.sum(_.map(data, item => Math.pow(10, item)));

  return Math.log10(fftSum); // convert back to log decibel scale;
}

/**
 * Normalize FFT and translate from logarithmic to linear scale
 * @param data - FFT array
 * @param opts - options
 * @returns array
 */
export function processFFT(data: Float32Array, opts: { normalize: boolean, forceMax?: number }) {
  const { normalize, forceMax } = opts;

  // default to normalizing to -30 db
  let max = normalize ? _.max(data) || -30 : -30;

  // console.log('max', max);

  if (forceMax) max = forceMax;

  // todo: add logic so that max does not exceed limit

  // max = 0;
  return data.map(item => {
    const newValue = Math.pow(10, item - max); // need to be mindful of float32 precision limits

    // console.log('item', item);
    // if (Number.isNaN(newValue)) {
    //   console.error('NaN original value', item);
    // }

    return newValue;
  });
}

export function linearToLog(data: number[]) {
  return data.map(item => {
    const newValue = Math.log10(item);

    if (Number.isNaN(newValue)) {
      console.error('NaN original value', item);
    } else {
      // console.log('this is fine', item);
    }

    return newValue;
  });
}

/**
 * Plot FFT histogram (expects logarithmic-scale input)
 * @param dataArray - fft data to be plotted
 * @param canvasElement - canvas element to plot onto
 */
export function drawFFT(dataArray: Float32Array, canvasElement: HTMLCanvasElement) {
  const canvasCtx = canvasElement.getContext('2d');

  if (!canvasCtx) {
    console.error('error getting canvas context');
    return;
  }

  // Draw black background
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw spectrum
  const bufferLength = dataArray.length;
  const barWidth = (canvasElement.width / bufferLength) * 2.5;
  let posX = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] + 140) * 2;

    canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight + 100) + ', 50, 50)';
    canvasCtx.fillRect(posX, canvasElement.height - barHeight / 2, barWidth, barHeight / 2);
    posX += barWidth + 1;
  }
}

/**
 * Plot FFT histogram (expects linear-scale input)
 * @param dataArray - fft data to be plotted
 * @param canvasElement - canvas element to plot onto
 */
export function drawHistogram(dataArray: number[], canvasElement: HTMLCanvasElement) {
  // console.log('drawing', dataArray);
  const canvasCtx = canvasElement.getContext('2d');

  if (!canvasCtx) {
    console.error('error getting canvas context');
    return;
  }

  // Draw black background
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw spectrum
  const bufferLength = dataArray.length;
  const barWidth = (canvasElement.width / bufferLength) * 2.5;
  let posX = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] + 140) * 2;

    canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight + 100) + ', 50, 50)';
    canvasCtx.fillRect(posX, canvasElement.height - barHeight / 2, barWidth, barHeight / 2);
    posX += barWidth + 1;
  }
}

/**
 * Log the min and max of input data
 * @param data - array of data to operate on
 * @param label - string to label log with
 */
export function logMinMax(data: Array<number>, label: string) {
  const min = _.min(data);
  const max = _.max(data);

  log(`${label} min:`, min);
  log(`${label} max:`, max);

  // if (!min || !max) console.error('Error processing data', data);
}

export function matchToHash(str) {
  const hash = window.document.location.hash;

  return hash === `#${str}`;
}

/**
 * Evaluate probability
 * @param probability - number between 0 and 1
 * @returns boolean
 */
export function testProbability(probability = 0) {
  return probability >= Math.random();
}
