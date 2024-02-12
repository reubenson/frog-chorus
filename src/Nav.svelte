<script lang="ts">
  import { onMount } from 'svelte';
  import { colors, hasStarted } from "./lib/store";

  let mainColor;
  let activeNavItem = ''

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }

  window.addEventListener('hashchange', handleHashChange);

  function handleHashChange() {
    const hash = window.location.hash || '';
    activeNavItem = hash.replace('#/', '')
    console.log('activeNavItem', activeNavItem);
  }

  onMount(() => {
    handleHashChange()
  });
</script>

<nav class="text-{mainColor} w-screen mt-5 lg:w-[50rem] m-auto top-5">
  <ul class="flex flex-row">
    <li class="flex-1 {activeNavItem === '' ? 'active' : ''} border-color:{mainColor}" id="home" >
      <a href="#/">Home</a>
    </li>
    <li class="flex-1 {activeNavItem === 'about' ? 'active' : ''} border-color:{mainColor}" id="about">
      <a href="#/about">About</a>
    </li>
    <li class="flex-1 {activeNavItem === 'events' ? 'active' : ''} border-color:{mainColor}" id="events">
      <a href="#/events">Events</a>
    </li>
  </ul>
</nav>

<style>
  li {
    font-family: cursive;
    font-weight: bold;
    list-style: none;
  }
  li a {
    text-decoration: none;
  }
  .active a {
    padding: 10px;
    border-bottom: solid 1px;
  }
</style>