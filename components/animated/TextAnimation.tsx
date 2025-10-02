"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface DecryptTextProps {
  text: string;
  className?: string;
  flickerIntervalMs?: number; // how fast random chars change
  revealDelayMs?: number; // how often we advance the trail
  trailSize?: number; // how many encrypted chars visible at once
  revealBatch?: number; // how many chars decrypt per advance
  startDelayMs?: number; // 🔥 delay before animation starts
}

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>/?|";

const randChar = () =>
  DEFAULT_CHARSET[Math.floor(Math.random() * DEFAULT_CHARSET.length)];

export default function DecryptText({
  text,
  className = "",
  flickerIntervalMs = 50,
  revealDelayMs = 90,
  trailSize = 6,
  revealBatch = 2,
  startDelayMs = 0,
}: DecryptTextProps) {
  const [displayText, setDisplayText] = useState("".padEnd(text.length, " ")); // start blank
  const [inView, setInView] = useState(false);

  const revealedRef = useRef<boolean[]>([]);
  const activeRef = useRef<boolean[]>([]);
  const activeQueueRef = useRef<number[]>([]);
  const headRef = useRef<number>(0); // next index to activate

  const flickerRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    // delay before starting animation
    startTimeoutRef.current = window.setTimeout(() => {
      // init state for this run
      revealedRef.current = Array.from(
        { length: text.length },
        (_, i) => text[i] === " ",
      );
      activeRef.current = Array(text.length).fill(false);
      activeQueueRef.current = [];
      headRef.current = 0;
      setDisplayText("".padEnd(text.length, " "));

      const activateNext = () => {
        // keep up to `trailSize` active flickering chars (skip spaces)
        while (
          activeQueueRef.current.length < trailSize &&
          headRef.current < text.length
        ) {
          if (text[headRef.current] === " ") {
            revealedRef.current[headRef.current] = true;
            headRef.current++;
            continue;
          }
          activeRef.current[headRef.current] = true;
          activeQueueRef.current.push(headRef.current);
          headRef.current++;
        }
      };

      const revealSome = () => {
        let c = 0;
        while (c < revealBatch && activeQueueRef.current.length > 0) {
          const idx = activeQueueRef.current.shift()!;
          activeRef.current[idx] = false;
          revealedRef.current[idx] = true;
          c++;
        }
      };

      const maybeFinish = () => {
        if (
          headRef.current >= text.length &&
          activeQueueRef.current.length === 0
        ) {
          // ✅ Force final render to the actual text
          setDisplayText(text);

          if (flickerRef.current) {
            clearInterval(flickerRef.current);
            flickerRef.current = null;
          }
          if (advanceRef.current) {
            clearInterval(advanceRef.current);
            advanceRef.current = null;
          }
        }
      };

      // continuous flicker render
      flickerRef.current = window.setInterval(() => {
        setDisplayText(() =>
          text
            .split("")
            .map((ch, i) =>
              revealedRef.current[i]
                ? ch
                : activeRef.current[i]
                  ? randChar()
                  : " ",
            )
            .join(""),
        );
      }, flickerIntervalMs);

      // smooth advancing trail (no batch pauses)
      advanceRef.current = window.setInterval(() => {
        activateNext();
        revealSome();
        maybeFinish();
      }, revealDelayMs);
    }, startDelayMs);

    return () => {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      if (flickerRef.current) clearInterval(flickerRef.current);
      if (advanceRef.current) clearInterval(advanceRef.current);
    };
  }, [
    inView,
    text,
    flickerIntervalMs,
    revealDelayMs,
    trailSize,
    revealBatch,
    startDelayMs,
  ]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 1 }}
      whileInView={{
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      }}
      viewport={{ once: true }}
      onViewportEnter={() => setInView(true)}
    >
      {displayText}
    </motion.div>
  );
}
