<script lang="ts">
  import Router from 'svelte-spa-router';
  import _ from 'lodash';
  import Tailwind from './Tailwind.svelte';
  import Nav from './Nav.svelte';
  import Home from './Home.svelte';
  import About from './About.svelte';
  import Events from './Events.svelte';
  import {
    hasStarted,
    toggleOnDebug,
    colors,
  } from './lib/store'
  import './styles/general.css';
  import frog_gif from './assets/frog03.gif';
  import { onMount } from 'svelte';

  let mainColor;

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }

  onMount(() => {
    if (document.location.search.includes('debug')) {
      toggleOnDebug();
    }
  });

  let routes = {
    '/': Home,
    '/about': About,
    '/events': Events
  }
</script>

<Tailwind />

<main class="font-serif text-center tracking-wider pb-6 text-{colors.main}">
  <noscript>
    &#9888; Please enable javascript on your browser to use this app &#9888;
  </noscript>
  <Nav />
  <header class="text-5xl text-center bg-{colors.background} mt-12 mb-8 text-{mainColor}">
    <a href="/">ḟԻ✺❡ ḉℏ✺Իṳṧ<span class="relative"></a>
  </header>
  <div class="main-content">
    <Router {routes} />
  </div>
  <div class="-z-20 bg-{colors.background} fixed left-[-100px] right-[-100px] top-[-100px] bottom-[-100px] blur-3xl bg-cover backdrop-invert opacity-30 transition-all duration-1000 {$hasStarted ? 'bg-zinc-900': ''}" 
    style="background-image: url({frog_gif}); {$hasStarted ? 'background-image: none; opacity: 1; filter: none;' : ''}"></div>

  <!-- embed tailwind color styles -->
  <span class="invisble bg-emerald-900 bg-emerald-800 bg-emerald-700 bg-emerald-600 bg-emerald-500 bg-emerald-400 bg-emerald-300 bg-emerald-200 bg-emerald-100 text-emerald-900 text-emerald-800 text-emerald-700 text-emerald-600 text-emerald-500 text-emerald-400 text-emerald-300 text-emerald-200 text-emerald-100 border-emerald-900 border-emerald-800 border-emerald-700 border-emerald-600 border-emerald-500 border-emerald-400 border-emerald-300 border-emerald-200 border-emerald-100 from-emerald-900 from-emerald-800 from-emerald-700 from-emerald-600 from-emerald-500 from-emerald-400 from-emerald-300 from-emerald-200 from-emerald-100 divide-emerald-900 divide-emerald-800 divide-emerald-700 divide-emerald-600 divide-emerald-500 divide-emerald-400 divide-emerald-300 divide-emerald-200 divide-emerald-100 bg-emerald-950 text-emerald-950 border-emerald-950 from-emerald-950 divide-emerald-950 bg-zinc-900"></span>
</main>

<style>
  .header-frog {
    bottom: 4px;
    left: -16px;
    width: 14px;
  }

  .header-frog img {
    -webkit-mask:url("/public/images/frog-glyph.png") center/contain;
    mask:url("/public/images/frog-glyph.png") center/contain;
  }
</style>