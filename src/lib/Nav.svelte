<script lang="ts">
  import { showCloseIcon, handleClose } from "./store";
  import frog03 from '../assets/frog03.gif'
</script>

<nav class="text-gray-900 body-font absolute w-screen">
  <header class="text-xl text-left h-20">
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
        <a href="">ḟԻ✺❡ ḉℏ✺Ի<span class="relative"><img src="{frog03}" alt="frog chorus header" class="absolute header-frog"></span>ṳṧ</a>
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
        on:click={handleClose}>&#10008</button>
    {/if}
  </header>
</nav>
