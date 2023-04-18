<script lang="ts">
  import _ from 'lodash';
  import { fade } from 'svelte/transition';
  import Tailwind from './lib/Tailwind.svelte';
  import Section from './lib/Section.svelte';
  import NAV from './lib/Nav.svelte';
  import FROG from './lib/Frog.svelte';
  import ESSAY from './lib/Essay.svelte';
  import {
    audio,
    handleStart,
    hasStarted,
    FROGS,
    handleUrlUpdate,
    showError,
    errorMessage,
    toggleOnDebug,
    DEBUG_ON,
    colors,
  } from './lib/store'
  import { longpress } from './lib/actions';
  import './app.css';
  import hess_diagram from './assets/hess_diagram.jpeg';
  import frogmail from './assets/frogmail.gif';
  import frog_gif from './assets/frog03.gif';
  import grass from './assets/profolia-grass.gif';
  import { onMount } from 'svelte';

  let sleepTimeout;
  
  window.addEventListener('hashchange', handleUrlUpdate);

  function scheduleSleep() {
    const minutes = val => val * 60 * 1000;
    const duration = minutes(0);

    clearTimeout(sleepTimeout);
    sleepTimeout = setTimeout(goToSleep, duration);
  }

  function goToSleep() {
    $FROGS.forEach(frog => frog.sleep());
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
    if (document.location.search.includes('debug')) {
      toggleOnDebug();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
  });
</script>

<Tailwind />

<main class="font-serif text-center tracking-wider pb-6 text-{colors.main}">
  <noscript>
    &#9888; Please enable javascript on your browser to use this app &#9888;
  </noscript>
  {#if $DEBUG_ON}
    <script src="https://unpkg.com/function-plot/dist/function-plot.js"></script>
  {/if}
  <NAV />
  <div class="main-content">
    <Section hashString=''>
      <marquee behavior="scroll" direction="left" class="mt-2 {$hasStarted ? 'hidden' : ''}">&#128679; work in progress &#128679;</marquee>
      {#if !$hasStarted}
        {#if !$showError}
          <p>
            <span class="italic">Frog Chorus</span> is an audio-based web-application that allows your laptop or mobile device to chirp in a “chorus” of other devices, as if they were a <a href="https://www.youtube.com/watch?v=aPAchkz76c8" target="_blank">chorus of frogs in the wild</a>.
            <!-- TODO: Try expanding UI to show video here? -->
          </p>
          <p>
            It uses your device's built-in speaker and microphone to operate, without the aid of technologies like wi-fi and bluetooth. Due to the nature of the app, you should run this software with a group of friends, with each person operating their own "frog".
          </p>
          <p>
            Click <span class="font-sans">𝓼𝓽𝓪𝓻𝓽</span> below to begin!
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
          <!-- <p>
            For an introduction to current topics around the ecology of frog choruses, check out <a href="https://www.nytimes.com/2022/04/28/science/frogs-mating-songs.html" target="_blank">Now That's What I Call Frog Mating Music</a> and <a href="https://www.nytimes.com/2023/03/27/opinion/frogs-vernal-pools-ecosystem-climate.html" target="_blank">Why Tiny Ponds and Singing Frogs Matter So Much</a>.
          </p> -->
          <p>
            This project is dedicated to the memory of the Dutch physicist and sound artist, <a href="https://simple.wikipedia.org/wiki/Felix_Hess" target="_blank">Felix Hess</a> (1941 - 2022). To learn more the origins of this project and intent of this project, click <span class="inline-block rotate-[50deg] pl-1 pr-1">&#10008</span> in the top left corner.
          </p>
          <p>
            For a suggestion on how to use this app:
          </p>
          <div>
            <!-- <h2>Suggestion for Performance</h2> -->
            <p>In a gathering of five or more people with smartphones running this page in a browser, consider the following actions.</p>
            <ul>
              <li>
                Walk in a slow, undirected manner with your phone until you find a good place to set your it down.
              </li>
              <li>
                Walk around, and between the phones, imagining traversing the "web" of phones.
              </li>
              <li>
                Try to pick out the sound of your phone, apart from the other phone. Walk further away from your phone, noticing how it becomes harder to pick your phone out from the chorus.
              </li>
              <li>
                Instead of a web, imagine a pond encircling the cluster of phones from a further distance. Imagine each phone sitting in that pond sending ripples back and forth. Notice how content the phones seem just chirping amongst themselves.
              </li>
              <li>
                After a while, consider leaving the pond, either bringing your phone with you, or not.
              </li>
            </ul>
          </div>
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
  
    <Section hashString='#info' customClass="info">
      <!-- <SvelteMarkdown {source} /> -->
      <ESSAY />
  
    <div class="text-base">
      <!-- <p>
        This project is a translation of a series of art installations by the late Dutch sound artist Felix Hess. The first such installation was developed in 1982, with a set of fifty robots, each outfitted with a microphone, speaker, and circuitry to allow each robot to listen to its environment and make sounds in the manner of a frog in a frog chorus. 
      </p> -->
      <!-- blockquote -->
      <!-- The acoustic communications between animals like frogs, cicadas, or grasshoppers often give rise to group concerts or choruses. Both order and chaos appear to be present in the resulting sound patterns, and one may notice various rhythms and wavelike movements. Similar group processes can be realised with machines built specifically for such a purpose. - Felix Hess -->
      <!-- <p>
        Hess' original designs for accomplishing this were are relatively straightfoward, in which the robot-frog's sounding behavior is predicated on "eagerness" and "shyness". When eagerness is high relative to shyness, the robot will emit a chirp, which is then "heard" by the other robots. Each robot will increase its eagerness when it hears another's chirp, and will increase its shyness when it hears non-chirping sounds. Through this simple set of rules, a dynamic chorus of sounds emerges, which is highly sensitive to environmental dynamics, much like if one were encountering a group of frogs in the wild.
      </p>
      <figure>
        <img src="{hess_diagram}" alt="Flow diagram of the frog behavior">
        <figcaption class="text-sm text-center">
          Flow diagram of the frog behavior excerpted from Hess' <a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" class="italic" target="_blank">Electronic Sound Creatures</a>
        </figcaption>
      </figure>
      <p>
        The project presented here utilizes the Web Audio API to make a browser-based translation of Hess' robot-frogs, allowing a set of users in physical, acoustic proximity to have their mobile devices "sing" to each other as if they were frogs. The implementation of "hearing" is predicated here on relatively unsophisticated FFT (fast fourier transform) analysis via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" target="_blank">Web Audio AnalyserNode</a>.
      </p> -->
      <div class="border-[1px] border-{colors.main} mt-4"></div>
      <p>This project is open-source. For a technical introduction to this project, check it out on <a href="https://github.com/reubenson/frog-chorus" target="_blank">GitHub</a>.</p>
      <p>For more information about the developer of this project, visit <a href="https://reubenson.com" target="_blank">https://reubenson.com</a>.</p>
      <h6 class="mt-4 text-lg">Additional References for Felix Hess</h6>
      <ol class="list-disc">
        <li class="list-inside"><a href="https://basicfunction-releases.bandcamp.com/album/frog-night" target="_blank">Felix's audio recordings, recently reissued by Basic Function</a></li>
        <!-- <li class="list-inside"><a href="https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/" target="_blank">A brief historical introduction to Felix on BLDG Blog</a></li> -->
        <li class="list-inside"><a href="https://www.kehrerverlag.com/en/felix-hess-light-as-air-978-3-933257-65-9" target="_blank" class="italic">Light as Air</a> monograph published by Kehrer Verlag</li>
        <li class="list-inside"><a href="https://www.youtube.com/watch?v=rMnFKYHzm2k" target="_blank">Artist talk by Felix Hess in 2010 (YouTube)</a></li>
        <!-- <li class="list-inside"><a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" target="_blank" class="italic">Electronic Sound Creatures by Felix Hess</a></li> -->
      </ol>
      <img class="mt-8 w-full" src="{frogmail}" alt="froggy email">
      <p>Feedback, bug reports, and general inquiries are very welcome at <a href="mailto:frogchor@gmail.com">frogchor@gmail.com</a></p>
    </Section>
  </div>
  
  <div class="-z-20 bg-{colors.background} fixed left-[-100px] right-[-100px] top-[-100px] bottom-[-100px] blur-3xl bg-cover backdrop-invert opacity-30 transition-all duration-1000 {$hasStarted ? 'bg-zinc-900': ''}" 
    style="background-image: url({frog_gif}); {$hasStarted ? 'background-image: none; opacity: 1; filter: none;' : ''}"></div>

  <!-- embed tailwind color styles -->
  <span class="invisble bg-emerald-900 bg-emerald-800 bg-emerald-700 bg-emerald-600 bg-emerald-500 bg-emerald-400 bg-emerald-300 bg-emerald-200 bg-emerald-100 text-emerald-900 text-emerald-800 text-emerald-700 text-emerald-600 text-emerald-500 text-emerald-400 text-emerald-300 text-emerald-200 text-emerald-100 border-emerald-900 border-emerald-800 border-emerald-700 border-emerald-600 border-emerald-500 border-emerald-400 border-emerald-300 border-emerald-200 border-emerald-100 from-emerald-900 from-emerald-800 from-emerald-700 from-emerald-600 from-emerald-500 from-emerald-400 from-emerald-300 from-emerald-200 from-emerald-100 divide-emerald-900 divide-emerald-800 divide-emerald-700 divide-emerald-600 divide-emerald-500 divide-emerald-400 divide-emerald-300 divide-emerald-200 divide-emerald-100 bg-emerald-950
  text-emerald-950
  border-emerald-950
  from-emerald-950
  divide-emerald-950
  bg-zinc-900"></span>
</main>
