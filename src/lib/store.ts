import _ from 'lodash'
import NoSleep from 'nosleep.js'
import { writable } from 'svelte/store'
import { AudioConfig } from './AudioManager'
import { Frog } from './Frog'
import spring_peeper from '../assets/spring-peeper.mp3'

// Important parameters for refining behavior
export const inputSamplingInterval = 200 // time (ms) between audio analysis events
export const FFT_SIZE = 1024
export const highpassFilterFrequency = 1000 // (units: hz)
export const loudnessThreshold = 25 // arbitrary units, following Meyda lib
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
export const frogInstances = []
export const FROGS = writable([])
export const PRINT_LOGS = writable(true)
export const url = writable('')
export let inputSourceNode
export const hash = writable('')

const historyState = { foo: 'bar' }

export const handleUrlUpdate = (): void => {
  const h = window.document.location.hash

  hash.set(h)
  // show a close icon when hash content is being rendered
  showCloseIcon.set(h.includes('#'))
}

export const handleClose = (): void => {
  history.pushState(historyState, null, '/')
  handleUrlUpdate() // update UI to url sta
}

export const handleError = (msg: string): void => {
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

/**
 * Update UI props
 */
function setUpdateInterval (): void {
  setInterval(() => {
    FROGS.update(state => {
      state = frogInstances.map(frog => frog.getProps())
      return state
    })
  }, inputSamplingInterval)
}

export const handleStart = async (): Promise<void> => {
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
            const frogProps = frog.getProps()
            frogInstances.push(frog)
            FROGS.update(val => [...val, frogProps])
            setUpdateInterval()
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

export const toggleOnDebug = (): void => {
  DEBUG_ON.set(true)
}

export const sendFrogsToBed = (): void => {
  frogInstances.forEach(frog => frog.sleep())
}

// on initialization
handleUrlUpdate()
