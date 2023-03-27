<script lang="ts">
  import { fade } from 'svelte/transition';
  import { hash } from './store';

  export let hashString;
  export let showSection = false;

  hash.subscribe(val => {
    showSection = val === hashString;
  });
</script>

<section transition:fade class="{showSection ? '' : 'hidden'} max-w-xl m-auto pl-6 pr-6 text-left mt-8">
  <slot></slot>
</section>
