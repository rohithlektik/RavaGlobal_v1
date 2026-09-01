import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Dev-only: stash the R3F state getter on window for inspection. */
export function FrameSync() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __three: unknown }).__three = get;
  }, [get]);
  return null;
}
