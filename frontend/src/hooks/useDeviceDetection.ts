import { useMemo } from 'react';

export const useDeviceDetection = () => {
  return useMemo(
    () => ({
      isMobile: () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
    }),
    [],
  );
};
