<script lang="ts">
  import _ from 'lodash';
  import { drawFFT } from "./utils";
  import { DEBUG_ON } from './store';
  
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
  let fftEl, convolutionEl, ambientEl;
  let blurClass = $DEBUG_ON ? '' : 'blur-2xl';
  let ampFontsize = 10;
  let loudnessFontsize = 10;
  let outlineColor = 'black';

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

    drawFFT(data, ambientEl);
  }

  function updateMetrics(amp) {
    const fontMin = 0;
    const fontMax = 72;

    // ampFontsize = fontMin + ((amp + 110) / 80) * fontMax;
    ampFontsize = fontMin + (loudness / 30) * fontMax;
    loudnessFontsize = fontMin + (audioFeatures?.loudness?.total / 20) * fontMax; 
  }

  $: {
    plotInputFFT(directInputFFT);
    plotConvolution(convolutionFFT);
    plotBaseline(ambientFFT);
    updateMetrics(loudness);
    
    outlineColor = frogSignalDetected ? 'emerald-900' : 'black';
  }
</script>

<div class="frog-item w-full max-w-lg h-full m-auto p-4 rounded-md">
  <div class="text-center relative h-50">
    <div class="text-8xl font-normal p-4 opacity-80 transition-colors duration-1000 text-{outlineColor}">&#78223;</div>
    <div style="font-size: {ampFontsize}px; transform: translateY(calc(40px + {-ampFontsize/2}px));" class="absolute m-auto left-0 right-0 top-0 blur-sm transition-colors duration-1000 text-{outlineColor}">&xcirc;</div>
    <p class="text-{outlineColor}">Your frog is listening ...</p>
    <span class="invisible text-emerald-900 text-emerald-100"></span>
  </div>
  <div>
    <!-- <span style="font-size: {ampFontsize}px" class="absolute">&#127908;</span> -->
    <!-- <span style="font-size: {loudnessFontsize}px">&#127908;</span> -->
  </div>
  <!-- if only one frog: -->
  <div class="-z-10 w-screen h-screen absolute {blurClass} left-0 top-0 transition-colors duration-1000 {isCurrentlySinging ? 'bg-lime-300' : ''}"></div>
  <div class="frog-debug-panel mt-4">
    <!-- <header class="text-2xl transition-colors duration-500 {frogSignalDetected ? 'bg-black' : ''}">Frog {id}</header> -->
    {#if $DEBUG_ON}
    <div class="debug-panel">
      <div class="mt-4">
        <header class="text-xl mt-2">Basic Metrics</header>
        <ul class="flex flex-row flex-wrap">
          <li class="h-14 p-2 basis-2/4">Shyness: {_.round(shyness, 2)}</li>
          <li class="h-14 p-2 basis-2/4">Eagerness: {_.round(eagerness, 2)}</li>
        </ul>
      </div>
      <header class="text-xl mt-2 mb-2">Figures</header>
      <div class="flex flex-wrap flex-row">
        <div class="basis-full p-2 shrink">
          <header>FFT</header>
          <canvas bind:this={fftEl} class="w-full"></canvas>
          <ul>
          </ul>
        </div>
        <div class="basis-2/4 p-2">
          <header>C-Baseline</header>
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
