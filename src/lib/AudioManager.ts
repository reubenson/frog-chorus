import { FFT_SIZE, handleError } from './store';
import { log } from './utils';

/**
 * The AudioConfig class is responsible for managing audio input and output devices
 */
export class AudioConfig {
  input: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  ctx: AudioContext;
  canvas: HTMLCanvasElement;
  deviceId: string;
  groupId: string;
  sampleRate: number;
  stream: MediaStream;

  /**
   * Initialize Audio class instance
   * @returns Promise
   */
  public async start(): Promise<void> {
    (window as any).AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContext();
    this.sampleRate = this.ctx.sampleRate;
    log('Audio Sample Rate:', this.sampleRate);

    await this.setInputDeviceId()
      .then(this.initializeAudio.bind(this))
      .then(() => {
        console.log('audio start complete');
      });
  }

  public stop(): void {
    this.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * Determine the audio input device id
   * @returns Promise
   */
  private async setInputDeviceId(): Promise<void> {
    await navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
        const audioInputDevice = audioInputDevices[0];

        // manually throw error, for debugging error-handling
        // throw new Error('testing error');

        if (!audioInputDevice) {
          console.error('no audio input device found');
          return;
        } else if (audioInputDevices.length > 1) {
          console.warn(
            `multiple audio devices found - selecting ${JSON.stringify(audioInputDevice)}`,
          );
        }

        this.deviceId = audioInputDevice.deviceId;
        this.groupId = audioInputDevice.groupId;
      })
      .catch(async (err) => {
        return await Promise.reject(err);
      });
  }

  /**
   * Connect audio input to webAudio analyser and set up
   * an interval timer to measure FFT of realtime audio
   */
  private async initializeAudio(): Promise<void> {
    const ctx = this.ctx;
    const constraints = { audio: {} };

    if (this.deviceId) constraints.audio = { deviceId: { exact: this.deviceId } };
    else if (this.groupId) constraints.audio = { groupId: { exact: this.groupId } };

    await navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream: any) => {
        const input = ctx.createMediaStreamSource(stream);

        this.stream = stream;
        this.input = input;
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = FFT_SIZE;
        this.analyser.smoothingTimeConstant = 0.5; // to be tweaked
      })
      .catch(async (err) => {
        return await Promise.reject(err);
      });
  }
}
