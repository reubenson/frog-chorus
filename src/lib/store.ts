import _ from 'lodash'
import NoSleep from 'nosleep.js'
import { writable } from 'svelte/store'
import { AudioConfig } from './AudioManager'
import { Frog } from './Frog'
import spring_peeper from '../assets/spring-peeper.mp3'

// Important parameters for refining behavior
export const inputSamplingInterval = 80 // time (ms) between audio analysis events
export const FFT_SIZE = 1024
export const highpassFilterFrequency = 1000 // (units: hz)
export const loudnessThreshold = 21 // arbitrary units, following Meyda lib
export const chirpAttemptRate = 250 // how often to attempt chirping (units: ms)
export const rateOfLosingShyness = 0.05

// UI state
export const showCloseIcon = writable(false)
export const showError = writable(false)
export const errorMessage = writable('')

// UX
export const colors = {
  // background: 'emerald-900',
  background: 'transparent',
  main: 'emerald-900',
  darkMode: {
    main: 'emerald-100',
    background: 'emerald-900'
  },
  lightMode: {
    main: 'emerald-900',
    background: 'emerald-300'
  }
}

export const frogsCount = 1
export const audio = new AudioConfig()
export const audioFile = spring_peeper
export const hasStarted = writable(false)
export const DEBUG_ON = writable(false)
export const FROGS = writable([])
export const PRINT_LOGS = writable(true)
export const url = writable('')
export let inputSourceNode
export const hash = writable('')

const historyState = { foo: 'bar' }
const startTime = Date.now()

export const handleUrlUpdate = () => {
  const h = window.document.location.hash

  hash.set(h)
  // show a close icon when hash content is being rendered
  showCloseIcon.set(h.includes('#'))
}

export const handleClose = () => {
  history.pushState(historyState, null, '/')
  handleUrlUpdate() // update UI to url sta
}

export const handleError = (msg) => {
  console.error('Rendering error to user:', msg)
  showError.set(true)
  errorMessage.set(msg)

  // send error to GA
  if (window.gtag) {
    window.gtag('event', 'error_rendered', {
      msg
    })
  }
}

function handleUpdates (frog: Frog) {
  FROGS.update(val => [...val, frog])
  setInterval(() => {
    // temporary move to meyda callback
    // frog.updateState();

    // update UI props
    // todo: more performant to selectively update props?
    FROGS.update(state => state)
  }, inputSamplingInterval)
}

export const handleStart = async () => {
  // TODO: add GA event for click

  const noSleep = new NoSleep()

  noSleep.enable()

  await audio
    .start()
    .then(async () => {
      inputSourceNode = audio.input

      const promises = _.times(frogsCount, async () => {
        const frog = new Frog(audio, audioFile)

        await frog.initialize()
          .then(() => {
            handleUpdates(frog)
          })
      })

      return await Promise.all(promises)
    })
    .then(() => {
      hasStarted.set(true)
    })
    .catch(errorMsg => {
      handleError(errorMsg)
    })
}

export const toggleOnDebug = () => {
  DEBUG_ON.set(true)
}

// on initialization
handleUrlUpdate()
