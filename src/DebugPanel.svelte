<script lang="ts">
  import _ from 'lodash'
  import { audioAnalyser, FROGS, loudnessThreshold } from './lib/store';
  import { drawFFT, log } from './lib/utils'
  import { Frog } from './lib/Frog'

  let shynessPlotEl, eagernessPlotEl, fftEl, convolutionEl, ambientEl
  let showBaselineLoading = true

  export let id
  $: frog = $FROGS[0];
  $: analyser = $audioAnalyser;

  $: {
    plotInputFFT(analyser.realtimeAudioFeatures?.directInputFFT);
    plotConvolution(analyser.realtimeAudioFeatures?.convolutionFFT);
    plotBaseline(analyser.baselineAudioFeatures?.convolutionFFT);
    plotEagernessCurve();
    plotShynessCurve();
  }

  function plotInputFFT(data) {
    if (!data) {
      console.warn('No FFT data to plot');
      return;
    }

    if (fftEl) {
      drawFFT(data, fftEl);
    }
  }

  /**
   * Plot the convolved FFT data
   * @param data
   */
   function plotConvolution(data) {
    if (!data) {
      console.warn('No convolution data to plot');
      return;
    }

    if (convolutionEl) {
      drawFFT(data, convolutionEl);
    }
  }

  /**
   * Plot the ambient baseline FFT
   * @param data
   */
   function plotBaseline(data) {
    if (showBaselineLoading && ambientEl && data) {
      drawFFT(data, ambientEl);
      showBaselineLoading = false;
    }
  }

  function plotEagernessCurve() {
    // functionPlot library is loaded dynamically in debug mode
    const functionPlot = _.get(window, 'functionPlot', (y: any) => {});
    const box = eagernessPlotEl?.getBoundingClientRect();

    if (!box) return;

    functionPlot({
      target: "#eagerness-curve",
      title: 'Eagerness',
      width: box.width,
      height: box.width * 0.75,
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 1.1] },
      grid: true,
      disableZoom: true,
      data: [
        {
          graphType: 'polyline',
          fn: function (scope) {
            return Frog.prototype.calculateEagernessFactor(scope.x);
          },
          skipTip: true
        }
      ],
      annotations: [{
        y: Frog.prototype.calculateEagernessFactor(frog.eagerness),
        text: 'eagerness coefficient'
      }]
    });
  }

  function plotShynessCurve() {
    const functionPlot = _.get(window, 'functionPlot', (x) => {});
    const box = shynessPlotEl?.getBoundingClientRect();

    if (!box) return;

    functionPlot({
      target: "#shyness-curve",
      title: 'Shyness',
      width: box.width,
      height: box.width * 0.75,
      xAxis: { domain: [0, 1] },
      yAxis: { domain: [0, 1.1] },
      grid: true,
      disableZoom: true,
      data: [
        {
          graphType: 'polyline',
          fn: function (scope) {
            return Frog.prototype.calculateShynessFactor(scope.x);
          },
          skipTip: true
        }
      ],
      annotations: [{
        y: Frog.prototype.calculateShynessFactor(frog.shyness),
        text: 'shyness coefficient'
      }]
    });
  }
</script>

<div class="debug-panel">
  <script src="https://unpkg.com/function-plot/dist/function-plot.js"></script>
  <div class="mt-4">
    <header class="text-xl mt-2">Basic Metrics</header>
    <ul class="flex flex-row flex-wrap">
      <li class="h-14 p-2 basis-2/4">Detune Amt: { frog.detuneAmount }</li>
      <li class="h-14 p-2 basis-2/4">Shyness: {_.round(frog.shyness, 2)}</li>
      <li class="h-14 p-2 basis-2/4">Eagerness: {_.round(frog.eagerness, 2)}</li>
      <li class="h-14 p-2 basis-2/4">Chirp Probability: {_.round(frog.chirpProbability, 2)}</li>
    </ul>
  </div>
  <header class="text-xl mt-2 mb-2">Behavior Curves</header>
  <div class="flex flex-wrap flex-row">
    <div class="basis-2/4 min-w-[150px]">
      <div bind:this={eagernessPlotEl} id="eagerness-curve"></div>
    </div>
    <div class="basis-2/4 min-w-[150px]">
      <div bind:this={shynessPlotEl} id="shyness-curve"></div>
    </div>
  </div>
  <header class="text-xl mt-2 mb-2">Audio Metrics</header>
  <div class="flex flex-wrap flex-row">
    <div class="basis-full p-2 shrink">
      <header>FFT</header>
      <canvas bind:this={fftEl} class="w-full"></canvas>
    </div>
    <div class="basis-2/4 p-2 relative">
      <header>C-Baseline</header>
      {#if showBaselineLoading}
      <div role="status" class="m-auto absolute left-0 right-0 top-8 bottom-0">
        <svg aria-hidden="true" class="m-auto w-10 h-10 mt-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
      {/if}
      <canvas bind:this={ambientEl} class="w-full"></canvas>
    </div>
    <div class="basis-2/4 p-2">
      <header>C-Realtime</header>
      <canvas bind:this={convolutionEl} class="w-full"></canvas>
    </div>
  </div>
  <header class="mt-4 text-xl">
    Audio Features
  </header>
  <ul>
    <li class="h-14 p-2 basis-2/4">Base Rolloff: {_.round(analyser.baselineRolloff, 1)}</li>
    <li class="h-14 p-2 basis-2/4">Base Centroid: {_.round(analyser.baselineCentroid, 1)}</li>
  </ul>
  <ul class="flex flex-row flex-wrap">
    <li class="h-14 p-2 basis-2/4">Loudness Threshold: {_.round(loudnessThreshold, 1)}</li>
    <!-- <li class="h-14 p-2 basis-2/4">Amplitude: {_.round(analyser.amplitude, 0)}</li> -->
    <!-- <li class="h-14 p-2 basis-2/4">Conv Amp: {Math.round(analyser.convolutionAmplitude)}</li> -->
    <li class="h-14 p-2 basis-2/4">
      Loudness: {_.round(analyser.realtimeAudioFeatures?.loudness, 1)}
    </li>
    <li class="h-14 p-2 basis-2/4">
      Rolloff: {_.round(analyser.realtimeAudioFeatures?.spectralRolloff, 0)}
    </li>
    <li class="h-14 p-2 basis-2/4">
      Centroid: {_.round(analyser.realtimeAudioFeatures?.spectralCentroid, 0)}
    </li>
    <li class="h-14 p-2 basis-2/4">
      Crest: {_.round(analyser.realtimeAudioFeatures?.spectralCrest, 0)}
    </li>
  </ul>
</div>
