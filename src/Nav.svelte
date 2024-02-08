<script lang="ts">
  import { showCloseIcon, handleClose, colors, hasStarted } from "./lib/store";

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    handleClose();
  }

  let mainColor;

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }
</script>

<nav class="text-{mainColor} w-screen">
  <header class="text-xl text-left h-20 bg-{colors.background} mb-10">
    <ul
      class="pt-10"
    >
      <li class="text-center text-4xl">
        <!-- https://www.fancytextpro.com/CursiveTextGenerator -->
        <a href="/">ḟԻ✺❡ ḉℏ✺Ի<span class="relative">
          <span class="absolute header-frog font-bold {$hasStarted ? 'invisible' : ''}">&#78223;</span>ṳṧ</a>
      </li>
    </ul>
    {#if $showCloseIcon}
      <button 
        class="left-2 top-0 fixed"
        on:click={handleClick}>&#10008</button>
    {:else}
      <button 
        class="left-2 top-0 rotate-[50deg] fixed"
        on:click={handleClick}
        >
          <a href="#info">&#10008</a>
      </button>
    {/if}
  </header>
</nav>
