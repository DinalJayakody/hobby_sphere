// src/pages/RegisterSuccess.tsx
import React, { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import { useNavigate } from "react-router-dom";

/**
 * HobbySphere Register Success Animation
 * - Smooth character entrance with wave
 * - Animated checkmark and floating letters
 * - Soft blue "hobby" confetti burst
 */

const RegisterSuccess: React.FC = () => {
  const nav = useNavigate();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const charRef = useRef<SVGGElement | null>(null);
  const checkRef = useRef<SVGPathElement | null>(null);
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const timelineRef = useRef<any>(null);
  const [skipped, setSkipped] = useState(false);

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const TOTAL_ANIM_MS = 10800;

  useEffect(() => {
    if (prefersReduced) {
      setTimeout(() => nav("/", { replace: true }), 2000);
      return;
    }

    const head = charRef.current;
    const check = checkRef.current;
    const confettiRoot = confettiRef.current;
    const title = titleRef.current;

    if (!head || !check || !confettiRoot || !title) {
      setTimeout(() => nav("/", { replace: true }), 800);
      return;
    }

    confettiRoot.innerHTML = "";
    const confettiCount = 22;
    for (let i = 0; i < confettiCount; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.width = "8px";
      el.style.height = "12px";
      el.style.position = "absolute";
      el.style.left = "50%";
      el.style.top = "50%";
      el.style.transform = "translate(-50%, -50%)";
      el.style.background = ["#06b6d4", "#38bdf8", "#0ea5e9", "#7dd3fc", "#bae6fd"][i % 5];
      el.style.borderRadius = "2px";
      confettiRoot.appendChild(el);
    }

    const tl = anime.timeline({ autoplay: false, easing: "easeOutQuart" });

    tl.add({
      targets: head,
      translateY: [60, 0],
      opacity: [0, 1],
      duration: 600,
      elasticity: 500,
    })
      .add(
        {
          targets: head,
          rotate: [-4, 4, -2, 2, 0],
          duration: 700,
        },
        "+=80"
      )
      .add(
        {
          targets: title.children,
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 700,
          delay: anime.stagger(40),
          easing: "easeOutExpo",
        },
        "-=300"
      );

    const pathLength = check.getTotalLength();
    check.style.strokeDasharray = String(pathLength);
    check.style.strokeDashoffset = String(pathLength);
    check.style.opacity = "1";

    tl.add(
      {
        targets: check,
        strokeDashoffset: [pathLength, 0],
        duration: 650,
        easing: "easeOutCubic",
        strokeWidth: [0, 6],
        complete: () => {
          anime({
            targets: svgRef.current,
            scale: [1, 1.02, 1],
            duration: 350,
          });
        },
      },
      "-=400"
    ).add(
      {
        duration: 1,
        complete: () => {
          const pieces = Array.from(confettiRoot.children) as HTMLElement[];
          anime({
            targets: pieces,
            translateX: () => anime.random(-160, 160),
            translateY: () => anime.random(-260, -80),
            rotate: () => anime.random(-720, 720),
            scale: [
              { value: 1, duration: 120 },
              { value: 0.9, duration: 900 },
            ],
            opacity: [
              { value: 1, duration: 50 },
              { value: 0, duration: 900, delay: 450 },
            ],
            easing: "easeOutCubic",
            duration: 1100,
            delay: anime.stagger(20, { start: 0 }),
          });
        },
      },
      "-=300"
    );

    timelineRef.current = tl;
    tl.play();

    const endTimeout = setTimeout(() => {
      if (!skipped) nav("/", { replace: true });
    }, TOTAL_ANIM_MS);

    return () => {
      clearTimeout(endTimeout);
      tl.pause();
      confettiRoot.innerHTML = "";
    };
  }, [nav, prefersReduced, skipped]);

  const onSkip = () => {
    setSkipped(true);
    if (timelineRef.current) timelineRef.current.pause();
    if (confettiRef.current) confettiRef.current.innerHTML = "";
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-6">
      <div className="max-w-xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 relative overflow-hidden border border-sky-100">
          {/* Character SVG */}
          <div className="mx-auto w-64 h-60 relative">
            <svg
              ref={svgRef}
              viewBox="0 0 260 240"
              className="w-full h-full"
              aria-hidden="true"
            >
              <g ref={charRef}>
                {/* soft gradient background bubble */}
                <circle cx="130" cy="130" r="80" fill="url(#grad)" opacity="0.15" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>

                {/* torso */}
                <rect
                  x="85"
                  y="110"
                  width="90"
                  height="60"
                  rx="28"
                  fill="#bae6fd"
                />
                {/* head */}
                <circle
                  cx="130"
                  cy="70"
                  r="32"
                  fill="#f0f9ff"
                  stroke="#7dd3fc"
                  strokeWidth="2"
                />
                {/* eyes */}
                <circle cx="120" cy="66" r="3" fill="#0c4a6e" />
                <circle cx="140" cy="66" r="3" fill="#0c4a6e" />
                {/* smile */}
                <path
                  d="M118 76 q12 8 24 0"
                  stroke="#0c4a6e"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* waving hand */}
                <path
                  d="M176 105 q6 -14 18 -8 q6 3 5 12 q-1 9 -6 12 q-10 6 -18 -8 z"
                  fill="#38bdf8"
                />
              </g>

              {/* checkmark path */}
              <path
                ref={checkRef}
                d="M88 140 L122 168 L176 108"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
              />
            </svg>

            <div
              ref={confettiRef}
              className="absolute inset-0 pointer-events-none"
              aria-hidden
            />
          </div>

          {/* Animated Heading */}
          <h2
            ref={titleRef}
            className="mt-8 text-3xl font-extrabold text-sky-700 flex justify-center space-x-1"
          >
            {"Welcome aboard!".split("").map((ch, i) => (
              <span key={i} className="inline-block opacity-0">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h2>

          <p className="mt-3 text-gray-600 text-base">
            Your HobbySphere account is ready! Let’s explore your passions 🎨🎸⚽
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onSkip}
              className="text-sm text-sky-600 hover:text-sky-800 font-medium transition"
              aria-label="Skip animation"
            >
              Skip
            </button>
            <div className="text-sm text-gray-400">Auto redirecting...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
