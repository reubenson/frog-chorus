<script lang="ts">
  import { hasStarted, colors } from './lib/store';

  let mainColor;

  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }
</script>

<section class="m-auto pl-6 pr-6 text-justify mt-1 mb-16 rounded-lg text-{mainColor} lg:w-[50rem]">
  <slot></slot>
</section>
