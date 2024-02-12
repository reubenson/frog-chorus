# Frog Chorus
Frog Chorus is an audio-based web application that allows a browser-supporting device to chirp in a “chorus” of other devices, as if they were a chorus of frogs in the wild.

The app uses the built-in speaker and microphone to have devices listen to and interact with each other, generating a dynamic and spatialized work of sound sculpture. This project is an translation of [work by Felix Hess](https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/) in the 1980s.

The core challenge of achieving the behavior necessary for Frog Chorus is the detection of frog sounds. While there are numerous ways of achieving this, I've decided to approach this with convolution and frequency (FFT) techniques, using the Web Audio API built into standard web browsers:
- audio input from the microphone is run through a [convolution](https://en.wikipedia.org/wiki/Convolution) algorithm, using the pre-recorded frog sound as the signal that the microphone input is convolved with
- a baseline measurement of this convolved output is created, which will be used as a reference for frog signal detection
- real-time audio features are extracted from the convolved output and compared against the baseline to determine whether there is sufficient similarity to consider it a match

Currently, this seems to work well enough, but additional sophistication in audio feature-matching is necessary for more complex frog calls. The spring peeper (Pseudacris crucifer) has been a good specimen to work with in this project, because it emits a simple peep, with a clear audio signature consisting of a single peak frequency. Check out [https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts](https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts) to see the current implementation of the audio analysis and frog chirping behavior (which I've modeled after Felix's original designs).

As a side note ... it's hard to say how actual frogs perceive sound, but according to [this source](https://www.sonova.com/en/story/frogs-hearing-no-ears), sound reaches their inner ear through their mouth, and their hearing is highly specific to the frequency range of their own species. But more apropos to this project, Felix Hess sums up his own motivations for his work in the following way:

> The complexity of my electronic 'sound creatures' is nothing compared to that of any biological system [...] I developed them as a means to investigate the nature of listening. Through actually building machines such as the 'sound creatures' one can get a 'feel' for the relationship between sensitivity and intelligence. This work has only increased my respect for the frogs, who taught me to sit in silence and listen. - Felix Hess, [Electronic Sound Creatures](https://alife.org/wp-content/uploads/2013/08/collections_ECAL93-0452-0457-Hess.pdf)

This project is built with Svelte, TypeScript, Vite, and Tailwind, and hosted via GitHub pages at https://frogchor.us.


## Getting Started
To get the app serving locally with Vite:
```bash
npm i
npm run dev
```

## Deployments
To generate static files to serve via GitHub pages:
```bash
npm run build
```

### Staging
An informal staging build is also deployed to frogchor.us/stg, which is managed via 
```bash
npm run build-stg
```
