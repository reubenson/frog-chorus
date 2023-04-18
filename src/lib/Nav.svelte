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
</script>

<nav class="z-10 h-32 text-{colors.main} top-0 body-font fixed w-screen bg-{colors.background}d">
  <header class="text-xl text-left h-20 bg-{colors.background}">
    <ul
      class="pt-10"
      class:open
    >
      <li class="left-6 absolute">
        {#if !$showCloseIcon}
        <!-- <a href="#info">𝒾𝓃𝒻𝑜</a> -->
        {/if}
      </li>
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
        class="absolute left-6 top-4"
        on:click={handleClick}>&#10008</button>
    {:else}
      <button 
        class="absolute left-6 top-4 rotate-[50deg]"
        on:click={handleClick}
        >
          <a href="#info">&#10008</a>
      </button>
    {/if}
  </header>
  <div class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-{colors.background} to-transparent"></div>
</nav>
