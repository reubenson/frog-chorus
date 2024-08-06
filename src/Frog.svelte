<script lang="ts">
  import _ from 'lodash';
  import DebugPanel from './DebugPanel.svelte';
  import { DEBUG_ON, colors, audioAnalyser } from './lib/store';
  import { onMount } from 'svelte';
  import spring_peeper from './assets/spring-p.png';
  
  // props defined by FrogProps interface
  export let id;
  export let amplitude;
  export let isSleeping;
  export let frogSignalDetected;
  export let isCurrentlySinging;

  let environmentVolumeLevel = 0;
  let showNoisyWarning = false;
  let showExitMessage = false;

  function updateMetrics(amp) {
    environmentVolumeLevel = Math.min(((amp + 90) / 80) * 100, 100); // roughly map it to a percentage
  }

  $: environmentIsQuiet = $audioAnalyser.environmentIsQuiet;

  $: {
    updateMetrics(amplitude)
  }

  onMount(() => {
    // indicate to user that they're in a noisy environment
    const noisyTimeout = 15000;
    setTimeout(() => {
      if (!environmentIsQuiet) {
        showNoisyWarning = true && !isSleeping;
      } else {
        showExitMessage = true;
      }
    }, noisyTimeout);
  });
</script>

<div class="frog-item w-full max-w-lg h-full m-auto rounded-md">
  <div class="text-center relative h-50">
    <div class="mt-12 mb-12 text-8xl font-normal p-4 opacity-80 transition-colors duration-1000 relative">
      <div class="rounded-full overflow-hidden">
        <img src="{spring_peeper}" alt="spring peeper">
        <!-- background animation to indicate when chirping -->
        <div class="-z-10 rounded-full blur-xl w-full h-full absolute bottom-0 left-0 top-0 transition-colors duration-700 bg-{isCurrentlySinging ? colors.darkMode.main : colors.darkMode.background} blur-fix"></div>
        <div class="absolute bottom-0 left-0 right-0 top-0 rounded-full border-{colors.main} duration-700 border-{frogSignalDetected ? '8': '2'}"></div>
        <div class="invisible hidden border-black border-2 border-8"></div>
      </div>
    </div>
    <!-- circle inside frog representing its detecting of other frogs -->
    {#if !isSleeping}
      <p>Your frog (a <a href="https://en.wikipedia.org/wiki/Spring_peeper" target="_blank">spring peeper</a> ) is listening ...</p>
    {:else}
      <p>Your frog has gone to sleep due to inactvity ... Frog Chorus does not work in the background. Please refresh this page to return to your frog!</p>
    {/if}
    <div class="border-bottom border-[1px] m-auto mt-4 width-full transition-transform duration-100 border-{colors.darkMode.main}" style="transform: scaleX({environmentVolumeLevel}%)"></div>
    {#if showNoisyWarning && !isSleeping}
      <p>(But it seems like it's a bit noisy where you are. Please try turning off some sounds, or try again in a quieter environment)</p>
    {:else if showExitMessage && !isSleeping} 
      <p>(When you're done, you can refresh page or click the logo at the top to turn your frog off)</p>
    {/if}
  </div>
  <div class="frog-debug-panel mt-4">
    {#if $DEBUG_ON}
      <DebugPanel {id}/>
    {/if}
  </div>
</div>

<style>
  /* // https://stackoverflow.com/questions/70138527/css-filter-blur-not-working-properly-on-safari */
  .blur-fix {
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
  }
</style>