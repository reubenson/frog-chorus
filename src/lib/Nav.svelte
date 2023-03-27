<script lang="ts">
  import { showCloseIcon, handleClose } from "./store";
</script>

<nav class="text-gray-600 body-font absolute w-screen border-b">
  <header class="bg-gray-100 text-xl text-left h-16">
    <ul
      class="p-4"
      class:open
    >
      <li class="left-6 absolute">
        {#if !$showCloseIcon}
        <a href="#info">𝒾𝓃𝒻𝑜</a>
        {/if}
      </li>
      <li class="text-center">
        <!-- <a href="#">𝒻𝓇𝑜𝑔 𝒸𝒽𝑜𝓇𝓊𝓈</a> -->
        <a href="#">FROG CHORUS</a>
      </li>
    </ul>
    {#if $showCloseIcon}
      <button 
        class="absolute left-6 top-4"
        on:click={handleClose}>&#10008</button>
    {/if}
  </header>
</nav>
