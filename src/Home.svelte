<script lang="ts">
  import _ from 'lodash';
  import Section from './Section.svelte';
  import FROG from './Frog.svelte';
  import {
    audio,
    handleStart,
    hasStarted,
    FROGS,
    showError,
    errorMessage,
    toggleOnDebug,
    sendFrogsToBed
  } from './lib/store'
  import { longpress } from './lib/actions';
  import frog_gif from './assets/frog03.gif';
  import button_background from './assets/moonrise_pond.gif';
  import { onMount } from 'svelte';

  let sleepTimeout;

  function scheduleSleep() {
    const minutes = val => val * 60 * 1000;
    const duration = minutes(0);

    clearTimeout(sleepTimeout);
    sleepTimeout = setTimeout(goToSleep, duration);
  }

  function goToSleep() {
    sendFrogsToBed();
    audio.stop();
  }

  function handleLongpress() {
    toggleOnDebug();
    handleStart();
  }

  /**
   * Use visibility change to trigger auto-shutoff.
   * This app is intended to be "actively" used, and not left on while
   * the user is performing other activities on their device
   */
  function handleVisibilityChange() {
    const isActive = document.visibilityState === 'visible';

    if (isActive) {
      clearTimeout(sleepTimeout);
    } else {
      scheduleSleep();
    }
  }

  onMount(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });
</script>

<Section>
  {#if !$hasStarted}
    {#if !$showError}
      <p>
        <span class="italic">Frog Chorus</span> is an audio-based web-app that allows your mobile device or laptop to chirp in a “chorus” of other devices, as if they were a <a href="https://www.youtube.com/watch?v=aPAchkz76c8" target="_blank">chorus of frogs in the wild</a>.
      </p>
      <p>
        This app uses your device's built-in speaker and microphone to communicate with other devices running the app, through sound only. No data is sent over the internet, and no data is stored on any server (aside from Google Analytics). While you <em>can</em> run this app alone, your frog will not make much sound unless you're in a relatively quiet environment with lots of other frogs (phones) around.
      </p>
      <button
        class="border-black font-bold border-2 text-emerald-100 p-2 mt-10 tracking-[.2em] m-auto block font-mono h-[70px] w-[80px] border-black ring-2 bg-right-top rounded-full"
        on:click|once|capture|trusted={handleStart}
        use:longpress
        on:longpress={handleLongpress}
        style="background-image: url('{button_background}'); background-size: cover; background-repeat: no-repeat; cursor: url({frog_gif}), auto">
        <!-- button gif source: https://bridgemom.tripod.com/Dragonfly.index.html -->
        start
      </button>
    {:else}
      <div>
        <p class="mt-4 text-base">
          There was an error setting up your frog:
        </p>
        <blockquote class="font-mono mt-4 text-sm">
          "{$errorMessage}"
        </blockquote>
        <p>
          If you did not see a prompt to give permissions for this website to access your microphone, please go to your browser settings and make sure you don't have it set to always deny microphone access permissions.
        </p>
      </div>
    {/if}
  {:else}
    <div class="flex flex-row p-4">
      {#each $FROGS as frog}<FROG {...frog}/>{/each}
    </div>
  {/if}
</Section>