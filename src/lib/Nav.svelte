<script lang="ts">
  import { showCloseIcon, handleClose, colors, hasStarted } from "./store";
  import frog03 from '../assets/frog03.gif'

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
        <!-- <a href="">ḟԻ✺❡ ḉℏ✺Ի<span class="relative">
          <img src="{frog03}" alt="frog chorus header" class="absolute header-frog {$hasStarted ? 'invisible' : ''}"></span>ṳṧ</a> -->
        <!--  -->
        <a href="/">ḟԻ✺❡ ḉℏ✺Ի<span class="relative">
          <span class="absolute header-frog font-bold {$hasStarted ? 'invisible' : ''}">&#78223;</span>ṳṧ</a>
        <!-- <a href="">ᠻ᥅ꪮᧁ ᥴꫝꪮ᥅ꪊᦓ</a> -->
        <!-- <a href="">ⲯ﹍︿﹍︿﹍ 𝚏𝚛𝚘𝚐 𝚌𝚑𝚘𝚛𝚞𝚜 ﹍ⲯ﹍ⲯ﹍︿﹍☼</a> -->
        <!-- <a href="">𝖋𝖗𝖔𝖌 𝖈𝖍𝖔𝖗𝖚𝖘</a> -->
        <!-- <a href="#">𝒻𝓇𝑜𝑔 𝒸𝒽𝑜𝓇𝓊𝓈</a> -->
        <!-- <a href="#">FROG CHORUS</a> -->
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
  <!-- <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-{colors.background} to-transparent"></div> -->
</nav>
