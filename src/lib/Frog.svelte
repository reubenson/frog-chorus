<script lang="ts">
  import _ from 'lodash';
  import { drawFFT } from "./utils";
  import { DEBUG_ON } from './store';
  import { onMount } from 'svelte';
  import { Frog } from './Frog';
  
  export let id;
  export let amplitude;
  export let convolutionAmplitude;
  export let shyness;
  export let eagerness;
  export let directInputFFT;
  export let convolutionFFT;
  export let ambientFFT;
  export let audioFeatures;
  export let isCurrentlySinging;
  export let frogSignalDetected;
  export let loudnessThreshold;
  export let loudness;
  export let baselineCentroid;
  export let baselineRolloff;
  export let chirpProbability;
  let fftEl, convolutionEl, ambientEl;
  let blurClass = $DEBUG_ON ? '' : 'blur-2xl';
  let ampFontsize = 10;
  let loudnessFontsize = 10;
  let outlineColor = 'black';
  let showBaselineLoading = true;
  let plotWidth = 300;
  let plotHeight = 200;
  let showNoisyWarning = false;

  function plotInputFFT(data) {
    if (!fftEl) return;

    drawFFT(data, fftEl);
  }
  
  function plotConvolution(data) {
    if (!convolutionEl) return;
    
    drawFFT(data, convolutionEl);
  }

  function plotBaseline(data) {
    if (!ambientEl || !data) return;

    if (showBaselineLoading) {
      drawFFT(data, ambientEl);
      showBaselineLoading = false;
    }
  }

  function updateMetrics(amp) {
    const fontMin = 0;
    const fontMax = 72;

    // ampFontsize = fontMin + ((amp + 110) / 80) * fontMax;
    ampFontsize = fontMin + (loudness / 30) * fontMax;
    loudnessFontsize = fontMin + (audioFeatures?.loudness?.total / 20) * fontMax; 
  }

  function plotEagernessCurve() {
    const el = document.querySelector('#eagerness-curve');
    const box = el.getBoundingClientRect();

    window.functionPlot({
      target: "#eagerness-curve",
      title: 'Eagerness',
      width: box.width,
      height: plotHeight,
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
        y: Frog.prototype.calculateEagernessFactor(eagerness),
        text: 'eagerness'
      }]
    });
  }

  function plotShynessCurve() {
    const el = document.querySelector('#shyness-curve');
    const box = el.getBoundingClientRect();

    window.functionPlot({
      target: "#shyness-curve",
      title: 'Shyness',
      width: box.width,
      height: plotHeight,
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
        y: Frog.prototype.calculateShynessFactor(shyness),
        text: 'shyness'
      }]
    });
  }

  function updateEagernessCurve(eagerness) {
    const annotationEl = document.body.querySelector('#eagerness-curve .annotations text');

    if (!annotationEl) return;

    plotEagernessCurve();
    annotationEl.innerHTML = `y = ${_.round(Frog.prototype.calculateEagernessFactor(eagerness), 2)}`;
  }

  function updateShynessCurve(shyness) {
    const annotationEl = document.body.querySelector('#shyness-curve .annotations text');

    if (!annotationEl) return;

    plotShynessCurve();
    annotationEl.innerHTML = `y = ${_.round(Frog.prototype.calculateShynessFactor(shyness), 2)}`;
  }

  $: {
    plotInputFFT(directInputFFT);
    plotConvolution(convolutionFFT);
    plotBaseline(ambientFFT);
    updateMetrics(loudness);
    
    outlineColor = frogSignalDetected ? 'emerald-900' : 'black';

    updateEagernessCurve(eagerness);
    updateShynessCurve(shyness);

    if (!showBaselineLoading) showNoisyWarning = false;
  }

  onMount(() => {
    plotEagernessCurve();
    plotShynessCurve();

    // indicate to user that they're in a noisy environment
    const noisyTimeout = 10000;
    setTimeout(() => {
      // use showBaselineLoading as an indicator that ambient threshold has not been met
      if (showBaselineLoading) {
        showNoisyWarning = true;
      }
    }, noisyTimeout);
  });
</script>

<div class="frog-item w-full max-w-lg h-full m-auto rounded-md">
  <div class="text-center relative h-50">
    <div class="text-8xl font-normal p-4 opacity-80 transition-colors duration-1000 text-{outlineColor}">&#78223;</div>
    <div style="font-size: {ampFontsize}px; transform: translateY(calc(40px + {-ampFontsize/2}px));" class="absolute m-auto left-0 right-0 top-0 blur-sm transition-colors duration-1000 text-{outlineColor}">&xcirc;</div>
    <p class="text-{outlineColor}">Your frog is listening ...</p>
    {#if frogSignalDetected}
      Frog detected
    {/if}
    {#if showNoisyWarning}
      <p>(But it seems like it's pretty noisy where you are. Please try turning off some sounds, or try again in a quieter environment)</p>
    {/if}
    <!-- hard-code colors here -->
    <span class="invisible text-emerald-900 text-emerald-100 bg-lime-300"></span>
  </div>
  <div>
    <!-- <span style="font-size: {ampFontsize}px" class="absolute">&#127908;</span> -->
    <!-- <span style="font-size: {loudnessFontsize}px">&#127908;</span> -->
  </div>
  <!-- if only one frog: -->
  <div class="-z-10 w-screen h-screen absolute {blurClass} left-0 top-0 transition-colors duration-1000 {isCurrentlySinging ? 'bg-lime-300' : 'bg-emerald-100'}"></div>
  <div class="frog-debug-panel mt-4">
    <!-- <header class="text-2xl transition-colors duration-500 {frogSignalDetected ? 'bg-black' : ''}">Frog {id}</header> -->
    {#if $DEBUG_ON}
    <div class="debug-panel">
      <div class="mt-4">
        <header class="text-xl mt-2">Basic Metrics</header>
        <ul class="flex flex-row flex-wrap">
          <li class="h-14 p-2 basis-2/4">Shyness: {_.round(shyness, 2)}</li>
          <li class="h-14 p-2 basis-2/4">Eagerness: {_.round(eagerness, 2)}</li>
          <li class="h-14 p-2 basis-2/4">Chirp Probability: {_.round(chirpProbability, 2)}</li>
        </ul>
      </div>
      <header class="text-xl mt-2 mb-2">Behavior Curves</header>
      <div class="flex flex-wrap flex-row">
        <div class="basis-2/4">
          <div id="eagerness-curve" ></div>
        </div>
        <div class="basis-2/4">
          <div id="shyness-curve"></div>
        </div>
      </div>
      <header class="text-xl mt-2 mb-2">Audio Metrics</header>
      <div class="flex flex-wrap flex-row">
        <div class="basis-full p-2 shrink">
          <header>FFT</header>
          <canvas bind:this={fftEl} class="w-full"></canvas>
          <ul>
          </ul>
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
        <li class="h-14 p-2 basis-2/4">Base Rolloff: {_.round(baselineRolloff, 1)}</li>
        <li class="h-14 p-2 basis-2/4">Base Centroid: {_.round(baselineCentroid, 1)}</li>
      </ul>
      <ul class="flex flex-row flex-wrap">
        <li class="h-14 p-2 basis-2/4">Loudness Threshold: {_.round(loudnessThreshold, 1)}</li>
        <li class="h-14 p-2 basis-2/4">Amplitude: {_.round(amplitude, 0)}</li>
        <li class="h-14 p-2 basis-2/4">Conv Amp: {Math.round(convolutionAmplitude)}</li>
        <li class="h-14 p-2 basis-2/4">
          Loudness: {_.round(audioFeatures?.loudness?.total, 1)}
        </li>
        <li class="h-14 p-2 basis-2/4">
          Rolloff: {_.round(audioFeatures?.spectralRolloff, 0)}
        </li>
        <li class="h-14 p-2 basis-2/4">
          Centroid: {_.round(audioFeatures?.spectralCentroid, 0)}
        </li>
        <li class="h-14 p-2 basis-2/4">
          Crest: {_.round(audioFeatures?.spectralCrest, 0)}
        </li>
      </ul>
    </div>
    {/if}
  </div>
</div>
