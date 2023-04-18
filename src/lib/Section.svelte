<script lang="ts">
  import { fade } from 'svelte/transition';
  import { hash, hasStarted, colors } from './store';

  export let customClass = '';
  export let hashString;
  export let showSection = false;

  hash.subscribe(val => {
    showSection = val === hashString;
  });

  let mainColor;

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }
</script>

<section transition:fade class="{showSection ? '' : 'hidden'} {customClass} m-auto pl-6 pr-6 text-justify mt-1 mb-16 rounded-lg text-{mainColor} lg:w-[50rem]">
  <slot></slot>
</section>
