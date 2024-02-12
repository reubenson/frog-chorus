# Frog Chorus
Frog Chorus is an audio-based web application that allows your mobile device or laptop to chirp in a “chorus” of other devices, as if they were a chorus of frogs in the wild.

The app uses the built-in speaker and microphone to have devices listen to and interact with each other, generating a dynamic and spatialized work of sound sculpture. This project is an translation of work by Felix Hess in the 1980s, who published writing about the design of his frog-robots in [this essay](https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/).

The core challenge of achieving the behavior necessary for Frog Chorus is the detection of frog sounds in a performant way. While there are numerous ways of achieving this, I've decided to approach this with convolution and frequency (FFT) techniques, using the Web Audio API built into standard web browsers:
- audio input from the microphone is run through a [convolution](https://en.wikipedia.org/wiki/Convolution) algorithm, using the pre-recorded frog sound as the signal that the microphone input is convolved with
- create a baseline measurement of this convolved output, which will be used as a reference for frog signal detection
- extract audio features from the convolved output and compare it against the baseline to determine whether there is sufficient similarity to consider it a match

Currently, this seems to work well enough, but additional sophistication in audio feature matching is necessary for more complex frog calls. The spring peeper (Pseudacris crucifer) has been a good specimen to work with in this project, because it emits a simple peep, with a clear audio signature consisting of a single peak frequency. Check out [https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts](https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts) to see the current implementation of the audio analysis and general frog behavior (which I've modeled after Felix's original specifications).

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
