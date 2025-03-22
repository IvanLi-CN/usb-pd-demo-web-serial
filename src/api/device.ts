import { toast } from 'sonner';
import { DeviceState } from '../models/device-state';
import EventEmitter from 'eventemitter3';

interface MessageEvents {
  'connect': () => void;
  'disconnected': () => void;
  'message': (data: DeviceState) => void;
}


export class Device extends EventEmitter<MessageEvents> {
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private writer?: WritableStreamDefaultWriter<Uint8Array>;
  private portEventAbortController: AbortController = new AbortController();

  constructor(
    public readonly port: SerialPort,
  ) {
    super()

    port.addEventListener('disconnect', () => {
      this.emit('disconnected');
    }, {
      signal: this.portEventAbortController.signal
    });
  }

  async start() {
    await this.port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: "none" });

    this.reader = this.port.readable?.getReader();
    this.writer = this.port.writable?.getWriter();

    if (!this.reader || !this.writer) {
      throw new DeviceNotConnectedError();
    }

    this.emit('connect');
    await this.poll();
  }

  async close() {
    await this.reader?.cancel();
    await this.writer?.close();
    this.portEventAbortController.abort();
    this.reader = undefined;
    this.writer = undefined;
    await this.port.close();
    this.emit('disconnected');
  }

  private async poll() {
    if (!this.port.connected) {
      throw new DeviceNotConnectedError();
    }

    if (!this.port.readable) {
      throw new DeviceNotConnectedError();
    }

    await this.reader?.read();

    const buff = new Uint8Array(128);
    let buffCursor = 0;

    while (this.reader) {
      const { value, done } = await this.reader.read();
      if (done) {
        this.reader?.releaseLock();
        break;
      }

      if (DeviceState.isValidMagic(value)) {
        const chunk = value.subarray(DeviceState.MAGIC.length, value.length);
        buff.set(chunk, 0);
        buffCursor = chunk.length;
        continue;
      }

      if (buffCursor > buff.length + value.length) {
        continue;
      }
      buff.set(value, buffCursor);
      buffCursor += value.length;

      if (buffCursor < 69) {
        continue;
      }

      try {
        console.debug(buff);
        buffCursor = 0;
        const data = this.parseRxData(buff);
        console.debug(data);
        this.emit('message', data);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private parseRxData(data: Uint8Array) {
    // [voltage: f64 (V), current: f64 (A), status_bits: u8, voltage_config: u16 (mV), current_config: u16(mA), temperature: f64 (°C)]
    // opt.: [voltage_adc_raw: u16, current_adc_raw: u16, voltage_adc: f64 (V), current_adc: f64 (A), voltage_dac_raw: u16, current_dac_raw: u16, voltage_dac: f64 (V), current_dac: f64 (A)]

    const reader = new DataView(data.buffer, data.byteOffset, data.byteLength);

    if (data.byteLength < 29) {
      throw new UnexpectedMessageError("Message too short");
    }
    const voltage = reader.getFloat64(0);
    const current = reader.getFloat64(8);
    const status_bits = reader.getUint8(16);
    const voltage_config = reader.getUint16(17);
    const current_config = reader.getUint16(19);
    const temperature = reader.getFloat64(21);

    if (data.byteLength >= 69) {
      const voltage_adc_raw = reader.getUint16(29);
      const current_adc_raw = reader.getUint16(31);
      const voltage_adc = reader.getFloat64(33);
      const current_adc = reader.getFloat64(41);
      const voltage_dac_raw = reader.getUint16(49);
      const current_dac_raw = reader.getUint16(51);
      const voltage_dac = reader.getFloat64(53);
      const current_dac = reader.getFloat64(61);

      return new DeviceState(
        voltage,
        current,
        status_bits,
        voltage_config,
        current_config,
        temperature,
        voltage_adc_raw,
        current_adc_raw,
        voltage_adc,
        current_adc,
        voltage_dac_raw,
        current_dac_raw,
        voltage_dac,
        current_dac
      );
    }

    return new DeviceState(
      voltage,
      current,
      status_bits,
      voltage_config,
      current_config,
      temperature
    );
  }

  static async createFromSerialPort() {
    if (!("serial" in navigator)) {
      toast.error("Your browser does not support Web Serial API");
      throw new WebSerialNotSupportedError();
    }


    const port = await navigator.serial.requestPort();

    return new Device(port);
  }

  async setVoltage(voltage: number) {
    const buff = new Uint8Array(3);
    const writerView = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);

    writerView.setUint8(0, 0x01);
    writerView.setUint16(1, voltage);

    await this.writeData(buff);
  }

  async setCurrent(current: number) {
    const buff = new Uint8Array(3);
    const writerView = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);

    writerView.setUint8(0, 0x04);
    writerView.setUint16(1, current);

    await this.writeData(buff);
  }

  async writeData(data: Uint8Array) {
    if (!this.port.writable) {
      throw new DeviceNotWritableError();
    }

    await this.writer?.write(data);
  }
}

export class DeviceError extends Error {
}

export class WebSerialNotSupportedError extends DeviceError {
  constructor() {
    super("Web Serial API is not supported");
  }

}

export class DeviceNotConnectedError extends DeviceError {
  constructor() {
    super("Device is not connected");
  }
}

export class DeviceNotReadableError extends DeviceError {
  constructor() {
    super("Device is not readable");
  }
}

export class DeviceNotWritableError extends DeviceError {
  constructor() {
    super("Device is not writable");
  }
}

export class UnexpectedMessageError extends DeviceError {
  constructor(message: string) {
    super(`Unexpected message. ${message}`);
  }
}