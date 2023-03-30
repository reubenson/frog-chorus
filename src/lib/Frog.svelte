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
  export let diffFFT;
  export let ambientFFT;
  export let audioFeatures;
  export let isCurrentlySinging;
  export let frogSignalDetected;
  let fftEl, convolutionEl, differenceEl, ambientEl;
  let blurClass = $DEBUG_ON ? '' : 'blur-2xl';

  function plotInputFFT(data) {
    if (!fftEl) return;

    drawFFT(data, fftEl);
  }
  
  function plotConvolution(data) {
    if (!convolutionEl) return;
    
    drawFFT(data, convolutionEl);
  }
  
  function plotDifference(data) {
    if (!differenceEl) return;

    drawFFT(data, differenceEl);
  }

  function plotBaseline(data) {
    if (!ambientEl || !data) return;

    drawFFT(data, ambientEl);
  }

  $: {
    plotInputFFT(directInputFFT);
    plotConvolution(convolutionFFT);
    plotDifference(diffFFT);
    plotBaseline(ambientFFT);
  }
</script>

<div class="frog-item w-full max-w-lg h-full m-auto border-black border-2 p-4 rounded-md">
  <div class="text-center">
    <div class="text-8xl animate-pulse p-4 opacity-0">&#78223;</div>
    <p>Your frog is listening ...</p>
  </div>
  <!-- if only one frog: -->
  <div class="-z-10 w-screen h-screen absolute {blurClass} left-0 top-0 transition-colors duration-1000 {isCurrentlySinging ? 'bg-lime-300' : ''}"></div>
  <div class="frog-debug-panel mt-2">
    <!-- <header class="text-2xl transition-colors duration-500 {frogSignalDetected ? 'bg-black' : ''}">Frog {id}</header> -->
    {#if $DEBUG_ON}
    <div class="debug-panel">
      <div class="mt-2">
        <header class="text-xl mb-2">Basic Metrics</header>
        <ul class="flex flex-row flex-wrap">
          <li class="h-14 p-2 basis-2/4">Shyness: {_.round(shyness, 3)}</li>
          <li class="h-14 p-2 basis-2/4">Eagerness: {_.round(eagerness, 3)}</li>
          <li class="h-14 p-2 basis-2/4">Amplitude: {_.round(amplitude, 2)}</li>
          <li class="h-14 p-2 basis-2/4">Conv Amp: {Math.round(convolutionAmplitude)}</li>
        </ul>
        <header class="mt-4 text-xl">
          Audio Features
        </header>
        <ul>
          <li>
            Loudness: {_.round(audioFeatures?.loudness?.total, 2)}
          </li>
          <li>
            Spread: {_.round(audioFeatures?.perceptualSpread, 2)}
          </li>
          <li>
            Slope: {audioFeatures?.spectralSlope}
          </li>
        </ul>
      </div>
      <header class="text-xl mt-8 mb-2">Figures</header>
      <div class="flex flex-wrap flex-row">
        <div class="basis-2/4 p-2 shrink">
          <header>FFT</header>
          <canvas bind:this={fftEl} class="w-full"></canvas>
          <ul>
          </ul>
        </div>
        <div class="basis-2/4 p-2">
          <header>Ambient Baseline</header>
          <canvas bind:this={ambientEl} class="w-full"></canvas>
        </div>
        <div class="basis-2/4 p-2">
          <header>Convolution</header>
          <canvas bind:this={convolutionEl} class="w-full"></canvas>
        </div>
        <div class="basis-2/4 p-2">
          <header>FFT Differential</header>
          <canvas bind:this={differenceEl} class="w-full"></canvas>
        </div>
      </div>
    </div>
    {/if}
  </div>
</div>
