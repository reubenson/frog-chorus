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
    errorMessage
  } from './lib/store'
  import './app.css'
  import hess_diagram from './assets/hess_diagram.jpeg';
  
  window.addEventListener('hashchange', handleUrlUpdate);
</script>

<Tailwind />

<main class="font-serif bg-emerald-100 h-screen text-center tracking-wider overflow-y-scroll pb-6">
  <NAV />

  <Section hashString=''>
    {#if !$hasStarted}
      {#if !$showError}
        <p>
          Frog Chorus is a simple application that allows your mobile device or computer to chirp in a “chorus” of other devices, as if they were a chorus of frogs in the wild. This application uses your device's built-in speaker and microphone to operate, and does not require that devices be connected on a common Wi-Fi network.
        </p>
        <p>
          For an introduction to current research around the biology of frog choruses, read <a href="https://www.nytimes.com/2022/04/28/science/frogs-mating-songs.html">Now That's What I Call Frog Mating Music</a>.
        </p>
        <p>
          This project is dedicated to the memory of the Dutch sound artist, <a href="https://simple.wikipedia.org/wiki/Felix_Hess">Felix Hess</a> (1941 - 2022). To learn more about his installation work and the origins of this project, see <a href="#info">info</a>.
        </p>
        <button
          class="border-black border-2 bg-white rounded-lg p-2 mt-4 tracking-wider m-auto block"
          on:click|once|capture|trusted={handleStart}>
            START
        </button>
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
      <!--

      on start, the audio device will initialize, and a number of frogs
      will be instantiated. Each frog will register itself with the audio device.
      At an interval, the audio device will update the behavior of each frog.
      When a frog makes a call, the audio device microphone needs to be disabled,
      such that a frog does not listen to itself.

      Each frog will also have its own debug state, which can be toggled on and off,
      in order to print some basic metrics, and plot FFT histograms

      -->
      <div class="flex flex-row p-4">
        {#each $FROGS as frog}<FROG {...frog}/>{/each}
      </div>

      <!-- TO DO: don't wait for audioImprint to calculate to start frog-->
    {/if}
  </Section>

  <Section hashString='#info'>
  <div class="text-base">
    <p>
      This project is a translation of a series of art installations by the late Dutch sound artist Felix Hess. The first such installation was developed in 1982, with a set of fifty robots,each outfitted with a microphone, speaker, and circuitry to allow each robot to listen to its environment and make sounds in the manner of a frog in a frog chorus. 
    </p>
    <!-- blockquote -->
    <!-- The acoustic communications between animals like frogs, cicadas, or grasshoppers often give rise to group concerts or choruses. Both order and chaos appear to be present in the resulting sound patterns, and one may notice various rhythms and wavelike movements. Similar group processes can be realised with machines built specifically for such a purpose. - Felix Hess -->
    <p>
      Hess' original designs for accomplishing this were are relatively straightfoward, in which the robot-frog's sounding behavior is predicated on "eagerness" and "shyness". When eagerness is high relative to shyness, the robot will emit a chirp, which is then "heard" by the other robots. Each robot will increase its eagerness when it hears another's chirp, and will increase its shyness when it hears non-chirping sounds. Through this simple set of rules, a dynamic chorus of sounds emerges, which is highly sensitive to environmental dynamics, much like if one were encountering a group of frogs in the wild.
    </p>
    <figure>
      <img src="{hess_diagram}" alt="Flow diagram of the frog behavior">
      <figcaption class="text-sm text-center">
        Flow diagram of the frog behavior excerpted from Hess' <a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" class="italic">Electronic Sound Creatures</a>
      </figcaption>
    </figure>
    <p>
      The project presented here utilizes the Web Audio API to make a browser-based translation of Hess' robot-frogs, allowing a set of users in physical, acoustic proximity to have their mobile devices "sing" to each other as if they were frogs. The implementation of "hearing" is predicated here on relatively unsophisticated FFT (fast fourier transform) analysis via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode">Web Audio AnalyserNode</a>.
    </p>
    <p>For more information about the developer of this project, visit <a href="https://reubenson.com">https://reubenson.com</a>.</p>
    <h6 class="mt-4 text-lg">References</h6>
    <ol class="list-disc">
      <li class="list-inside"><a href="https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/" target="_blank" rel="noreferrer">A brief historical introduction on BLDG Blog</a></li>
      <li class="list-inside"><a href="https://www.youtube.com/watch?v=rMnFKYHzm2k" target="_blank" rel="noreferrer">Artist talk by Felix Hess in 2010 (YouTube)</a></li>
      <li class="list-inside"><a href="https://www.kehrerverlag.com/en/felix-hess-light-as-air-978-3-933257-65-9" target="_blank" rel="noreferrer">"Light as Air"</a> monograph published by Kehrer Verlag</li>
      <li class="list-inside"><a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" target="_blank" rel="noreferrer" class="italic">Electronic Sound Creatures by Felix Hess</a></li>
      <li class="list-inside"><a href="https://basicfunction-releases.bandcamp.com/album/frog-night" target="_blank" rel="noreferrer">Felix's audio recordings, recently reissued by Basic Function</a></li>
    </ol>
  </Section>

  <!-- potentially use slider to determine number of frogs instantiated 
  https://svelte.dev/tutorial/local-transitions -->
</main>
