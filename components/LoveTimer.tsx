import React, { useEffect, useState } from 'react';
import { START_DATE } from '../types';
import { intervalToDuration } from 'date-fns';
import { motion } from 'framer-motion';

// Infer the Duration type from the function return type to avoid import issues
type Duration = ReturnType<typeof intervalToDuration>;

const LoveTimer: React.FC = () => {
  const [duration, setDuration] = useState<Duration>({});

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setDuration(intervalToDuration({ start: START_DATE, end: now }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-1 md:mx-3">
      <span className="font-bold text-xl md:text-3xl lg:text-4xl tabular-nums tracking-wider text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] md:text-xs font-serif text-[#f3e5ab] opacity-70 mt-1 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <span className="text-[#f3e5ab] text-lg md:text-2xl opacity-50 font-light pb-4">:</span>
  );

  return (
    <div className="w-full text-center py-4 md:py-8 z-20 relative pointer-events-none mix-blend-screen">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#f3e5ab] font-cinzel text-sm md:text-xl tracking-[0.3em] opacity-90 uppercase mb-4"
      >
        Loving You For
      </motion.h2>
      
      <div className="flex justify-center items-end flex-wrap gap-y-2">
        <TimeUnit value={years} label="Years" />
        <Separator />
        <TimeUnit value={months} label="Months" />
        <Separator />
        <TimeUnit value={days} label="Days" />
        <Separator />
        <TimeUnit value={hours} label="Hours" />
        <Separator />
        <TimeUnit value={minutes} label="Mins" />
        <Separator />
        <TimeUnit value={seconds} label="Secs" />
      </div>
    </div>
  );
};

export default LoveTimer;