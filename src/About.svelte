<script lang="ts">
  import Section from './Section.svelte';
  import { colors, hasStarted } from "./lib/store";
  import frogmail from './assets/frogmail.gif';
  import hess_diagram from './assets/hess_diagram.jpeg';
  import frog_comp from './assets/frogcomp_riso.png';
  let mainColor;
  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }
</script>

<Section>
  <p>
    This project is dedicated to the Dutch physicist and sound artist, <a href="https://simple.wikipedia.org/wiki/Felix_Hess" target="_blank">Felix Hess</a> (1941 - 2022). In the 1980s, Felix began developing a series of art installations in which groups of frog-robots communicated with each other through sound, modeled after frogs in a chorus. In translating Felix's frogs into a browser-based application, <strong>Frog Chorus</strong> allows a set of users in physical proximity to have their mobile devices <em>listen</em> and <em>sing</em> to each other as if they were frogs. 
    
    <!-- The implementation of "hearing" is predicated here on relatively unsophisticated FFT (fast fourier transform) analysis via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" target="_blank">Web Audio AnalyserNode</a> -->
  </p>
  <p>
    To accomplish this, sounds from the environment are analysed for frog-likeness, which then influences each phone-frog's behavior. Felix's original designs have been adapted here, in which a frog's “eagerness” increases when other frogs are heard, and its “shyness” increases when loud non-frog sounds are heard. Through a simple set of non-deterministic rules, a dynamic chorus of singing emerges between multiple phones, much like if one were encountering a group of frogs in the wild.
    <!-- This project is a translation of a series of art installations by the late Dutch sound artist Felix Hess. The first such installation was developed in 1982, with a set of fifty robots, each outfitted with a microphone, speaker, and circuitry to allow each robot to listen to its environment and make sounds in the manner of a frog in a frog chorus.  -->
  </p>
  <figure class="m-auto mt-5 mb-5 border-{mainColor}">
    <img src="{hess_diagram}" alt="Flow diagram of the frog behavior">
    <figcaption class="text-sm text-center">
      Flow diagram of the frog-robot behavior; source: <a href="https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/" class="italic" target="_blank">Electronic Sound Creatures</a>
    </figcaption>
  </figure>
  <p>
    In using <strong>Frog Chorus</strong>, I invite participants to give their phones some space, and join in active listening, as they walk around the chorus of phones, and to think of it as a kind of ad-hoc sound sculpture. While remaining faithful to Felix’s original work, this project extends it with a critique of what it means to live in a world increasingly of machines talking to each other. In actuality, frogs behave through <em>phonotaxis</em> (the movement of an organism using sound), which I take as a poetic metaphor for how we might navigate algorithmically-governed environments. In an age where machines more convincingly give an impression of aliveness, the simple act of listening may serve as an act of resistance, a place from which to understand how our own aliveness is not like that of a machine.
  </p>
  <p>
    Felix writes it best himself:
  </p>
  
  <blockquote class="mt-5">
    The complexity of my electronic 'sound creatures' is nothing compared to that of any biological system [...] I developed them as a means to investigate the nature of listening. Through actually building machines such as the 'sound creatures' one can get a 'feel' for the relationship between sensitivity and intelligence. This work has only increased my respect for the frogs, who taught me to sit in silence and listen.
    <br/><br/>
    - Felix Hess, <cite><a href="https://alife.org/wp-content/uploads/2013/08/collections_ECAL93-0452-0457-Hess.pdf" target="_blank">Electronic Sound Creatures</a></cite>
  </blockquote>
  
    <!-- blockquote -->
    <!-- The acoustic communications between animals like frogs, cicadas, or grasshoppers often give rise to group concerts or choruses. Both order and chaos appear to be present in the resulting sound patterns, and one may notice various rhythms and wavelike movements. Similar group processes can be realised with machines built specifically for such a purpose. - Felix Hess -->
    <!-- <p>
      Hess' original designs for accomplishing this were are relatively straightfoward, in which the robot-frog's sounding behavior is predicated on "eagerness" and "shyness". When eagerness is high relative to shyness, the robot will emit a chirp, which is then "heard" by the other robots. Each robot will increase its eagerness when it hears another's chirp, and will increase its shyness when it hears non-chirping sounds. Through this simple set of rules, a dynamic chorus of sounds emerges, which is highly sensitive to environmental dynamics, much like if one were encountering a group of frogs in the wild.
    </p>
    <p>
      The project presented here utilizes the Web Audio API to make a browser-based translation of Hess' robot-frogs, allowing a set of users in physical, acoustic proximity to have their mobile devices "sing" to each other as if they were frogs. The implementation of "hearing" is predicated here on relatively unsophisticated FFT (fast fourier transform) analysis via the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode" target="_blank">Web Audio AnalyserNode</a>.
    </p> -->
    <p>For a technical introduction to this project, check it out on <a href="https://github.com/reubenson/frog-chorus" target="_blank">GitHub</a>, and for more information about the developer of this project, visit <a href="https://reubenson.com" target="_blank">https://reubenson.com</a>.</p>
    <p>Feedback, bug reports, and general inquiries are very welcome at <a href="mailto:frogchor@gmail.com">frogchor@gmail.com</a></p>

  <h6 class="mt-4 text-lg">Additional References for Felix Hess</h6>
  <ol class="">
    <li class="list-inside"><a href="https://basicfunction-releases.bandcamp.com/album/frog-night" target="_blank">Felix's audio recordings</a>, recently reissued by Basic Function</li>
    <li class="list-inside"><a href="https://www.kehrerverlag.com/en/felix-hess-light-as-air-978-3-933257-65-9" target="_blank" class="italic">Light as Air</a> monograph published by Kehrer Verlag</li>
    <li class="list-inside"><a href="https://www.youtube.com/watch?v=rMnFKYHzm2k" target="_blank">Artist talk by Felix Hess in 2010 (YouTube)</a></li>
  </ol>
  <!-- <img class="mt-8 w-full" src="{frogmail}" alt="froggy email"> -->
  
  <figure class="m-auto mt-5 mb-5 border-{mainColor}">
    <img src="{frog_comp}" alt="frog at the computer">
  </figure>
</Section>
