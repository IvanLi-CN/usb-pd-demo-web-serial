import { useCallback, useEffect, useState } from 'react';
import { Device } from '../api/device';
import type { DeviceState } from '../models/device-state';

export const useDevice = () => {
  const [device, setDevice] = useState<Device>();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<DeviceState>();

  useEffect(() => {
    let device: Device | undefined;

    if (isOpen) {
      Device.createFromSerialPort().then((d) => {
        device = d;
        setDevice(d);

        device.addListener('message', (data) => {
          setState(data);
        });
        device.addListener('connect', () => {
          setIsConnected(true);
        });
        device.addListener('disconnected', () => {
          setIsConnected(false);
          setIsOpen(false);
        });

        d.start().then(() => {
          setIsConnected(false);
        });

      });
    }

    return () => {
      setDevice(undefined);
      setIsConnected(false);

      device?.removeAllListeners();
      device?.close();
    };
  }, [isOpen]);


  const open = useCallback(() => {
    setIsOpen(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const setVoltage = useCallback(
    (voltage: number) => device?.setVoltage(voltage),
    [device]
  );

  const setCurrent = useCallback(
    (current: number) => device?.setCurrent(current),
    [device]
  );

  return {
    open,
    close,
    setVoltage,
    setCurrent,
    device,
    isConnected,
    state,
    isOpen,
  };
};