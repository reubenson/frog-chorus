import _ from 'lodash';
import { writable } from 'svelte/store';
import { AudioConfig } from './AudioManager';
import { Frog } from './Frog';

// UI state
export const showCloseIcon = writable(false);
export const showError = writable(false);
export const errorMessage = writable('');

export const frogsCount = 1;
export const AUDIO_SRC_DIRECTORY = 'https://reubenson.com/frog/audio';
// peeper downloaded from https://www.umesc.usgs.gov/terrestrial/amphibians/armi/frog_calls/spring_peeper.mp3
export const AUDIO_FILES = ['Aneides_lugubris90.mp3', 'Anaxyrus_punctatus2.mp3', 'spring-peeper.mp3'];
export const audio = new AudioConfig();
export const audioFile = `${AUDIO_SRC_DIRECTORY}/${AUDIO_FILES[2]}`;
export const hasStarted = writable(false);
export const FFT_SIZE = 1024;
export const DEBUG_ON = writable(true);
export const FROGS = writable([]);
export const PRINT_LOGS = writable(true);
export const inputSamplingInterval = 50; // time (ms) between FFT analysis events
export const url = writable('');
export let inputSourceNode;
export const hash = writable('');

const historyState = { foo: 'bar' };

export const handleUrlUpdate = () => {
  const h = window.document.location.hash;

  hash.set(h);
  // show a close icon when hash content is being rendered
  showCloseIcon.set(h.includes('#'));
  console.log('hash in store', hash);
};

export const handleClose = () => {
  history.pushState(historyState, null, '/');
  handleUrlUpdate(); // update UI to url sta
};

export const handleError = (msg) => {
  console.error('Rendering error to user:', msg);
  showError.set(true);
  errorMessage.set(msg);
}

function handleUpdates(frog: Frog) {
  FROGS.update(val => [...val, frog]);
  setInterval(() => {
    frog.updateState();

    // update UI props
    // todo: more performant to selectively update props?
    FROGS.update(state => state);
  }, inputSamplingInterval);
}

export const handleStart = () => {
  return audio
    .start()
    .then(() => {
      inputSourceNode = audio.input;

      const promises = _.times(frogsCount, async () => {
        const frog = new Frog(audio, audioFile);

        await frog.initialize()
          .then(() => {
            handleUpdates(frog);
          });
      });

      return Promise.all(promises);
    })
    .then(() => {
      hasStarted.set(true);
    })
    .catch(errorMsg => {
      showError.set(true);
      errorMessage.set(errorMsg);
    });
};

// on initialization
handleUrlUpdate();
