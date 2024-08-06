# Frog Chorus

Frog Chorus is an audio-based web application that allows a browser-supporting device to chirp in a “chorus” of other devices, as if they were a chorus of frogs in the wild.

The app uses the built-in speaker and microphone to have devices listen to and interact with each other, generating a dynamic and spatialized work of sound sculpture. This project is an translation of [work by Felix Hess](https://isea-archives.siggraph.org/art-events/electronic-sound-creatures-by-felix-hess/) in the 1980s.

The core challenge of achieving the behavior necessary for Frog Chorus is the detection of frog sounds. While there are numerous ways of achieving this, I've decided to approach this with convolution and frequency (FFT) techniques, using the Web Audio API built into standard web browsers:

- audio input from the microphone is run through a [convolution](https://en.wikipedia.org/wiki/Convolution) algorithm, using the pre-recorded frog sound as the signal that the microphone input is convolved with
- a baseline measurement of this convolved output is created, which will be used as a reference for frog signal detection
- real-time audio features are extracted from the convolved output and compared against the baseline to determine whether there is sufficient similarity to consider it a match

Currently, this seems to work well enough, but additional sophistication in audio feature-matching is necessary for more complex frog calls. The spring peeper (Pseudacris crucifer) has been a good specimen to work with in this project, because it emits a simple peep, with a clear audio signature consisting of a single peak frequency. Check out [https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts](https://github.com/reubenson/frog-chorus/blob/main/src/lib/Frog.ts) to see the current implementation of the audio analysis and frog chirping behavior (which I've modeled after Felix's original designs).

Historical Context:
Felix Hess began developing his frog-based installation work in 1982, which involved developing a set of fifty robots, each outfitted with a microphone, speaker, and circuitry to allow each robot to listen to its environment and make sounds in the manner of a frog in a frog chorus. Some historical documentation can be read here (https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/), but the best resource for understanding Hess' work is his monograph, 'Light as Air', published by Kehrer Verlag, as well as an artist talk from the 2010s on [YouTube](https://www.youtube.com/watch?v=rMnFKYHzm2k).

This project is built with Svelte, TypeScript, Vite, and Tailwind, and hosted via GitHub pages at https://frogchor.us.

Additional references:
- On how frogs hear: https://www.sonova.com/en/story/frogs-hearing-no-ears
- Autocorrelation for pitch detection: https://alexanderell.is/posts/tuner/
- Convolution vs correlation: https://towardsdatascience.com/convolution-vs-correlation-af868b6b4fb5
- Pitchy lib: https://www.npmjs.com/package/pitchy

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
