<script lang="ts">
  import _ from 'lodash';
  import { fade } from 'svelte/transition';
  import Tailwind from './lib/Tailwind.svelte';
  import Section from './lib/Section.svelte';
  import NAV from './lib/Nav.svelte';
  import FROG from './lib/Frog.svelte';
  import {
    handleStart,
    hasStarted,
    FROGS,
    handleUrlUpdate,
    showError,
    errorMessage,
    toggleOnDebug,
    DEBUG_ON,
    colors
  } from './lib/store'
  import { longpress } from './lib/actions';
  import './app.css'
  import hess_diagram from './assets/hess_diagram.jpeg';
  import frog_jumping from './assets/frogjumping.gif';
  import frogmail from './assets/frogmail.gif';
  import grass from './assets/profolia-grass.gif';
  import { onMount } from 'svelte';
  
  window.addEventListener('hashchange', handleUrlUpdate);

  function handleLongpress() {
    toggleOnDebug();
    handleStart();
  }

  onMount(() => {
    if (document.location.search.includes('debug')) {
      toggleOnDebug();
    }
  });
</script>

<Tailwind />

<main class="font-serif text-center tracking-wider pb-6 text-{colors.main}">
  <noscript>
    &#9888; Please enable javascript on your browser to use this app &#9888;
  </noscript>
  {#if DEBUG_ON}
  <script src="https://unpkg.com/function-plot/dist/function-plot.js"></script>
  {/if}
  <NAV />
  <Section hashString=''>
    <marquee behavior="scroll" direction="left" class="mt-2 {$hasStarted ? 'invisible' : ''}">&#128679; work in progress &#128679;</marquee>
    {#if !$hasStarted}
      {#if !$showError}
        <p>
          <span class="italic">Frog Chorus</span> is an audio-based web-application that allows your laptop or mobile device to chirp in a “chorus” of other devices, as if they were a <a href="https://www.youtube.com/watch?v=aPAchkz76c8" target="_blank" rel="noreferrer">chorus of frogs in the wild</a> . 
          <!-- TODO: Try expanding UI to show video here? -->
        </p>
        <p>
        It uses your device's built-in speaker and microphone to operate, without the aid of technologies like wi-fi and bluetooth. Due to the nature of the app, you should run this software with a group of friends, with each person operating their own "frog". Click <span class="font-sans">𝓼𝓽𝓪𝓻𝓽</span> below to begin!
        </p>
        <button
          class="border-black border-2 text-white p-2 mt-6 mb-6 tracking-widest m-auto block font-sans w-48 border-black ring-2"
          on:click|once|capture|trusted={handleStart}
          use:longpress
          on:longpress={handleLongpress}
          style="background-image: url('{grass}')">
          <!-- START -->
          <!-- 𝓈𝓉𝒶𝓇𝓉 -->
          <span class="select-nonee">𝓼𝓽𝓪𝓻𝓽</span>
        </button>
        <p>
          For an introduction to current topics around the ecology of frog choruses, check out <a href="https://www.nytimes.com/2022/04/28/science/frogs-mating-songs.html" target="_blank" rel="noreferrer">Now That's What I Call Frog Mating Music</a> and <a href="https://www.nytimes.com/2023/03/27/opinion/frogs-vernal-pools-ecosystem-climate.html" target="_blank" rel="noreferrer">Why Tiny Ponds and Singing Frogs Matter So Much</a>.
        </p>
        <p>
          This project is dedicated to the memory of the Dutch physicist and sound artist, <a href="https://simple.wikipedia.org/wiki/Felix_Hess" target="_blank" rel="noreferrer">Felix Hess</a> (1941 - 2022). To learn more about his installation work and the origins of this project, click <span class="inline-block rotate-[50deg]">&#10008</span> in the top left corner.
        </p>
      {:else}
        <div>
          <!-- <header>Error</header> -->
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

  <Section hashString='#info'>
  <div class="text-base">
    <p>
      This project is a translation of a series of art installations by the late Dutch sound artist Felix Hess. The first such installation was developed in 1982, with a set of fifty robots, each outfitted with a microphone, speaker, and circuitry to allow each robot to listen to its environment and make sounds in the manner of a frog in a frog chorus. 
    </p>
    <!-- blockquote -->
    <!-- The acoustic communications between animals like frogs, cicadas, or grasshoppers often give rise to group concerts or choruses. Both order and chaos appear to be present in the resulting sound patterns, and one may notice various rhythms and wavelike movements. Similar group processes can be realised with machines built specifically for such a purpose. - Felix Hess -->
    <p>
      Hess' original designs for accomplishing this were are relatively straightfoward, in which the robot-frog's sounding behavior is predicated on "eagerness" and "shyness". When eagerness is high relative to shyness, the robot will emit a chirp, which is then "heard" by the other robots. Each robot will increase its eagerness when it hears another's chirp, and will increase its shyness when it hears non-chirping sounds. Through this simple set of rules, a dynamic chorus of sounds emerges, which is highly sensitive to environmental dynamics, much like if one were encountering a group of frogs in the wild.
    </p>
    <figure>
      <img src="{hess_diagram}" alt="Flow diagram of the frog behavior">
      <figcaption class="text-sm text-center">
        Flow diagram of the frog behavior excerpted from Hess' <a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" class="italic" target="_blank" rel="noreferrer">Electronic Sound Creatures</a>
      </figcaption>
    </figure>
    <p>
      The project presented here utilizes the Web Audio API to make a browser-based translation of Hess' robot-frogs, allowing a set of users in physical, acoustic proximity to have their mobile devices "sing" to each other as if they were frogs. The implementation of "hearing" is predicated here on relatively unsophisticated FFT (fast fourier transform) analysis via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" target="_blank" rel="noreferrer">Web Audio AnalyserNode</a>.
    </p>
    <p>This project is open-source. For more information, check out the source code at <a href="https://github.com/reubenson/frog-chorus" target="_blank" rel="noreferrer">GitHub</a>.</p>
    <p>For more information about the developer of this project, visit <a href="https://reubenson.com" target="_blank" rel="noreferrer">https://reubenson.com</a>.</p>
    <h6 class="mt-4 text-lg">References</h6>
    <ol class="list-disc">
      <li class="list-inside"><a href="https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/" target="_blank" rel="noreferrer">A brief historical introduction to Felix on BLDG Blog</a></li>
      <li class="list-inside"><a href="https://www.youtube.com/watch?v=rMnFKYHzm2k" target="_blank" rel="noreferrer">Artist talk by Felix Hess in 2010 (YouTube)</a></li>
      <li class="list-inside"><a href="https://www.kehrerverlag.com/en/felix-hess-light-as-air-978-3-933257-65-9" target="_blank" rel="noreferrer">"Light as Air"</a> monograph published by Kehrer Verlag</li>
      <li class="list-inside"><a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" target="_blank" rel="noreferrer" class="italic">Electronic Sound Creatures by Felix Hess</a></li>
      <li class="list-inside"><a href="https://basicfunction-releases.bandcamp.com/album/frog-night" target="_blank" rel="noreferrer">Felix's audio recordings, recently reissued by Basic Function</a></li>
    </ol>
    <img class="mt-8 width-full" src="{frogmail}" alt="froggy email">
    <p>Feedback, suggestions, and inquiries may be directed <a href="mailto:frogchor@gmail.com">to frogchor@gmail.com</a></p>
  </Section>
  <div class="-z-20 bg-{colors.background} fixed left-0 right-0 top-0 bottom-0"></div>

  <!-- embed tailwind color styles -->
  <span class="invisble bg-emerald-900 bg-emerald-800 bg-emerald-700 bg-emerald-600 bg-emerald-500 bg-emerald-400 bg-emerald-300 bg-emerald-200 bg-emerald-100 text-emerald-900 text-emerald-800 text-emerald-700 text-emerald-600 text-emerald-500 text-emerald-400 text-emerald-300 text-emerald-200 text-emerald-100 border-emerald-900 border-emerald-800 border-emerald-700 border-emerald-600 border-emerald-500 border-emerald-400 border-emerald-300 border-emerald-200 border-emerald-100 from-emerald-900 from-emerald-800 from-emerald-700 from-emerald-600 from-emerald-500 from-emerald-400 from-emerald-300 from-emerald-200 from-emerald-100"></span>
</main>
