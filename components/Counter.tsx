"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TARGET_DATE = "2025-11-06T00:00:00";
const EVENT_SUBTITLE = "EVENT STARTS IN";
const TIME_LABELS = {
  days: "DAYS",
  hours: "HRS",
  minutes: "MINS",
  seconds: "SECS",
};

function getTimeLeft() {
  const now = new Date();
  const target = new Date(TARGET_DATE);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function CountdownDigit({
  value,
  label,
  delay = 0,
  prevValue,
}: {
  value: number;
  label: string;
  delay?: number;
  prevValue?: number;
}) {
  const formattedValue = String(value).padStart(2, "0");
  const isSeconds = label === TIME_LABELS.seconds;
  const digits = formattedValue.split("");

  const hasChanged = prevValue !== undefined && value !== prevValue;
  const unitsDigitIsZero = digits[1] === "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center justify-center"
    >
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden sm:h-24 sm:w-24">
        <div className="flex items-center justify-center">
          {digits.map((digit, index) => {
            const isUnitsDigit = index === 1;
            const isTensDigit = index === 0;

            const shouldAnimate =
              hasChanged && (isUnitsDigit || (isTensDigit && unitsDigitIsZero));

            return (
              <AnimatePresence mode="wait" key={`${index}-${digit}`}>
                <motion.div
                  key={`${value}-${index}-${shouldAnimate ? "anim" : "static"}`}
                  initial={
                    shouldAnimate
                      ? { y: -80, opacity: 0 }
                      : { y: 0, opacity: 1 }
                  }
                  animate={{ y: 0, opacity: 1 }}
                  exit={
                    shouldAnimate ? { y: 80, opacity: 0 } : { y: 0, opacity: 1 }
                  }
                  transition={{
                    duration: isSeconds ? 0.15 : 0.3,
                    type: "tween",
                    ease: "easeOut",
                    delay: index * 0.05,
                  }}
                  className="digit-container flex items-center justify-center"
                >
                  <div
                    className={`font-amiga text-center text-xl font-bold sm:text-3xl ${
                      isSeconds ? "seconds-digit" : ""
                    }`}
                  >
                    {digit}
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      </div>

      {label && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay }}
          className="font-orbitron text-primary -mt-4 text-[10px] tracking-widest sm:text-sm"
        >
          {label}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Counter() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const prevTimeLeft = useRef({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const initialTime = getTimeLeft();
    setTimeLeft(initialTime);
    prevTimeLeft.current = initialTime;

    const timer = setInterval(() => {
      prevTimeLeft.current = { ...timeLeft };
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isComplete = Object.values(timeLeft).every((v) => v === 0);

  if (!mounted)
    return (
      <div className="h-[40vh] bg-black">
        {/* <div className="absolute top-5 left-5 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
        <div className="absolute top-5 right-5 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
        <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
        <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" /> */}
      </div>
    );

  if (isComplete && mounted) {
    return (
      <div className="text-primary flex h-[50vh] flex-col items-center justify-center bg-black">
        {/* <div className="absolute top-5 left-5 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
        <div className="absolute top-5 right-5 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
        <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
        <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" /> */}
        {/* <div className="absolute top-0 h-24 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />
        <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" /> */}

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="font-orbitron max-w-5xl px-4 text-center text-3xl font-bold sm:text-6xl"
        >
          The Event Has Started!
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[40vh] flex-col items-center justify-center overflow-hidden bg-black px-2 py-14">
      {/* <div className="absolute top-5 left-5 z-10 h-10 w-10 border-t-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute top-5 right-5 z-10 h-10 w-10 border-t-2 border-r-2 border-[#c3ff49]/50" />
      <div className="absolute bottom-5 left-5 z-10 h-10 w-10 border-b-2 border-l-2 border-[#c3ff49]/50" />
      <div className="absolute right-5 bottom-5 z-10 h-10 w-10 border-r-2 border-b-2 border-[#c3ff49]/50" /> */}

      {/* <div className="absolute top-0 h-12 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent" />
      <div className="absolute bottom-0 h-12 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent" /> */}

      <motion.div
        className="z-10 flex w-full flex-col items-center px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 className="font-orbitron text-primary shadow-primary sm:3xl px-1 pb-2 text-center text-2xl font-semibold tracking-widest md:text-5xl">
          {EVENT_SUBTITLE}
        </motion.h2>
      </motion.div>
      <div className="flex">
        <CountdownDigit
          value={timeLeft.days}
          prevValue={prevTimeLeft.current.days}
          label={TIME_LABELS.days}
          delay={0.3}
        />
        <CountdownDigit
          value={timeLeft.hours}
          prevValue={prevTimeLeft.current.hours}
          label={TIME_LABELS.hours}
          delay={0.5}
        />
        <CountdownDigit
          value={timeLeft.minutes}
          prevValue={prevTimeLeft.current.minutes}
          label={TIME_LABELS.minutes}
          delay={0.7}
        />
        <CountdownDigit
          value={timeLeft.seconds}
          prevValue={prevTimeLeft.current.seconds}
          label={TIME_LABELS.seconds}
          delay={0.9}
        />
      </div>

      <style jsx global>{`
        .seconds-digit {
          position: relative;
        }

        .digit-container {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
