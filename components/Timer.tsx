'use client';

import { useEffect, useRef } from 'react';

interface TimerProps {
  seconds: number;
  isPaused: boolean;
  onTick: (remaining: number) => void;
  onExpire: () => void;
}

export default function Timer({ seconds, isPaused, onTick, onExpire }: TimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(seconds);

  useEffect(() => {
    remainingRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      onTick(remainingRef.current);
      if (remainingRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpire();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, onTick, onExpire]);

  const isUrgent = seconds <= 5;
  const pct = Math.max(0, (seconds / 30) * 100);

  return (
    <div className="flex items-center gap-2" aria-label={`Tempo restante: ${seconds} segundos`}>
      <div className="relative w-8 h-8 shrink-0">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="3"
            className="text-ink/10" />
          <circle
            cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isUrgent ? 'text-danger' : 'text-claude'}`}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold
          ${isUrgent ? 'text-danger' : 'text-ink'}`}>
          {seconds}
        </span>
      </div>
    </div>
  );
}
