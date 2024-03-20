<script lang="ts">
  import Section from './Section.svelte';
  import { colors, hasStarted } from "./lib/store";
  import { events } from './data/events.json';
  let mainColor;
  $: {
    mainColor = $hasStarted ? colors.darkMode.main : colors.lightMode.main;
  }
  
  const upcomingEvents = events
    .filter(event => {
      console.log('event', event);
      console.log('new Date(event.date)', new Date(event.date));
      return true;
      // return new Date(event.date) >= new Date()
    })
    .map(event => {
      return {
        ...event,
        date: new Date(event.date).toDateString()
      }
    });
</script>

<Section>
  <h2 class="text-xl mt-5 border-b-2 border-{mainColor}">Upcoming Events</h2>
  {#if upcomingEvents.length > 0}
    <ul class="event-list">
      {#each upcomingEvents as event}
        <li class="event-item">
          <p>{event.date} at {event.time}</p>
          <p class="mt-0">{event.location}</p>
          <p>
            {@html event.description}
          </p>
        </li>
      {/each}
    </ul>
  {:else}
  <p>There are no official upcoming events scheduled! But you can organize your own Frog Chorus event and use the suggestion below.</p>
  {/if}

  <h3 class="text-xl mt-5 border-b-2 border-{mainColor}">What to expect for a Frog Chorus event</h3>
  <p>In a gathering of five or more people with smartphones running this app in a browser, consider the following actions.</p>
  <ul>
    <li>
      Walk in a slow, undirected manner with your phone (frog) until you find a good place to set it down.
    </li>
    <li>
      Notice how the other participants are setting down their phones (frogs) too, and remain quiet as the frogs (phones) settle into their environment, slowly beginning to make their calls.
    </li>
    <li>
      Focus on the sound of your frog, apart from the other frogs. Wander further away from your frog, until you can no longer distinguish which which frog is yours.
    </li>
    <li>
      Consider what it feels like to be separated from your frog (phone), witnessing it absorbed in the act of listening and singing?
    </li>
    <li>
      After a while, leave the frog chorus, either bringing your phone with you, or not.
    </li>
    <!-- <li>
      Walk in a slow, undirected manner with your frog until you find a good place to set it down.
    </li>
    <li>
      Walk around, and between the frogs, imagining traversing the "web" of frogs.
    </li>
    <li>
      Try to pick out the sound of your frog, apart from the other frogs. Wander further away from your frog, until you can no longer distinguish which which frog is yours.
    </li>
    <li>
      Instead of a web, imagine a pond encircling the cluster of frogs from a further distance. Imagine each frog sitting in that pond sending ripples back and forth. Notice how content the frogs seem just chirping amongst themselves.
    </li>
    <li>
      After a while, consider leaving the pond, either bringing your phone with you, or not.
    </li> -->
  </ul>
</Section>
  