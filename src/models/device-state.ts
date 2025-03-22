export class DeviceState {
  constructor(
    public voltage: number,
    public current: number,
    public status_bits: number,
    public voltage_config: number,
    public current_config: number,
    public temperature: number,
    public voltage_adc_raw?: number,
    public current_adc_raw?: number,
    public voltage_adc?: number,
    public current_adc?: number,
    public voltage_dac_raw?: number,
    public current_dac_raw?: number,
    public voltage_dac?: number,
    public current_dac?: number
  ) { }


  static MAGIC = Array.from("PDSTA").map(c => c.charCodeAt(0));

  static isValidMagic(data: Uint8Array) {
    for (let i = 0; i < DeviceState.MAGIC.length; i++) {
      if (data[i] !== DeviceState.MAGIC[i]) {
        return false;
      }
    }
    return true;
  }
}