import { useCallback, useEffect, useRef, useState } from 'react';

export type Speed = 'very-slow' | 'slow' | 'normal';

export type UseRunnerOptions<T> = {
  getProgram: () => T[];
  apply: (ins: T) => void;
  getIntervalMs?: (speed: Speed) => number;
  onComplete?: () => void;
};

export function useRunner<T>({
  getProgram,
  apply,
  getIntervalMs,
  onComplete,
}: UseRunnerOptions<T>) {
  const [ip, setIp] = useState(0);
  const [speed, setSpeed] = useState<Speed>('very-slow');
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const intervalMs = useCallback(
    () =>
      getIntervalMs
        ? getIntervalMs(speed)
        : speed === 'very-slow'
          ? 1600
          : speed === 'slow'
            ? 1000
            : 450,
    [getIntervalMs, speed]
  );

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setIp(0);
  }, [stop]);

  const step = useCallback(() => {
    if (running) return;
    const program = getProgram();
    if (ip >= program.length) {
      onComplete?.();
      return;
    }
    const ins = program[ip];
    apply(ins);
    setIp((n) => n + 1);
  }, [apply, getProgram, ip, onComplete, running]);

  const toggleRun = useCallback(() => {
    const program = getProgram();
    if (running) {
      stop();
      return;
    }
    if (ip >= program.length) {
      onComplete?.();
      return;
    }
    let i = ip;
    setRunning(true);
    timerRef.current = window.setInterval(() => {
      const prog = getProgram();
      if (i >= prog.length) {
        stop();
        onComplete?.();
        return;
      }
      apply(prog[i++]);
      setIp(i);
    }, intervalMs());
  }, [apply, getProgram, intervalMs, ip, onComplete, running, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { ip, setIp, speed, setSpeed, running, toggleRun, step, reset, stop } as const;
}

export default useRunner;
