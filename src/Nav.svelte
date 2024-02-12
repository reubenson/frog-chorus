<script lang="ts">
  import { colors, hasStarted } from "./lib/store";

  let mainColor;
  let activeNavItem = ''

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }

  window.addEventListener('hashchange', handleHashChange);

  function handleHashChange(ev) {
    const hash = window.location.hash || '';
    activeNavItem = hash.replace('#/', '')
    console.log('activeNavItem', activeNavItem);
  }
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