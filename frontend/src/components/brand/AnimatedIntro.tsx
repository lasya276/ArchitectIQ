import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AQMonogram } from './AQLogo';

export const INTRO_SESSION_KEY = 'architectiq_intro_seen';

export interface AnimatedIntroProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

/**
 * AnimatedIntro: Cinematic 5-scene full-screen opening brand experience for ArchitectIQ.
 *
 * Scene 1 (0.0s - 0.4s): Deep midnight navy canvas with architectural grid & ambient glow.
 * Scene 2 (0.3s - 1.2s): Vector stroke drawing reveals the interlocking AQ lettermark.
 * Scene 3 (1.1s - 1.8s): Clean typography reveal of "ArchitectIQ" wordmark & official tagline.
 * Scene 4 (1.8s - 2.4s): Polished specular light sweep sweeps across the monogram.
 * Scene 5 (2.4s - 2.9s): Dissolves seamlessly into the main application.
 */
export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete, forcePlay = false }) => {
  // Phase tracks the animation progression:
  // 'entering' -> 'animating' -> 'dissolving' -> 'done'
  const [phase, setPhase] = useState<'entering' | 'animating' | 'dissolving' | 'done'>('entering');
  const [scene3Visible, setScene3Visible] = useState(false);
  const [scene4Sweep, setScene4Sweep] = useState(false);
  const hasFinishedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
      // Ignore storage errors in restricted iframe/incognito modes
    }
    setPhase('done');
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) {
        e.stopPropagation();
      }
      finishIntro();
    },
    [finishIntro]
  );

  // Check reduced-motion preference & schedule scene transitions
  useEffect(() => {
    // If user prefers reduced motion and not explicitly forcing replay, skip immediately
    if (!forcePlay && typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        finishIntro();
        return;
      }
    }

    // Scene 1 -> Scene 2 starts automatically
    const enterTimer = setTimeout(() => {
      setPhase('animating');
    }, 50);

    // Scene 3: Wordmark & Tagline reveal at 1.1s
    const scene3Timer = setTimeout(() => {
      setScene3Visible(true);
    }, 1100);

    // Scene 4: Light sweep shimmer trigger at 1.8s
    const scene4Timer = setTimeout(() => {
      setScene4Sweep(true);
    }, 1800);

    // Scene 5: Dissolve transition starts at 2.4s
    const dissolveTimer = setTimeout(() => {
      setPhase('dissolving');
    }, 2400);

    // Complete & unmount at 2.9s
    const completeTimer = setTimeout(() => {
      finishIntro();
    }, 2900);

    // Keyboard navigation (Escape / Space to skip)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(scene3Timer);
      clearTimeout(scene4Timer);
      clearTimeout(dissolveTimer);
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finishIntro, forcePlay, handleSkip]);

  if (phase === 'done') {
    return null;
  }

  const isDissolving = phase === 'dissolving';

  return (
    <div
      role="dialog"
      aria-label="ArchitectIQ Animated Brand Introduction"
      aria-modal="true"
      onClick={() => handleSkip()}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-500 ease-out ${
        isDissolving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#070B14',
      }}
    >
      {/* Background Architectural Grid Lines */}
      <div
        className="absolute inset-0 architect-grid-bg opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient Radial Backlight Glow Behind Logo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(40,123,255,0.22) 0%, rgba(56,217,245,0.10) 35%, rgba(121,91,255,0.04) 60%, transparent 75%)',
          filter: 'blur(30px)',
          transform: phase === 'animating' ? 'scale(1.15)' : 'scale(0.85)',
        }}
        aria-hidden="true"
      />

      {/* Top Bar Skip Control */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleSkip}
          id="skip-intro-button"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 backdrop-blur-md transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          title="Skip introduction (Press Esc or click anywhere)"
        >
          <span>Skip</span>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">
            Esc
          </span>
          <span className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5">
            ➔
          </span>
        </button>
      </div>

      {/* Center Cinematic Stage */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()} // clicking badge or text area allows skip through backdrop, but can also trigger skip
      >
        {/* Monogram Box with Vector Stroke Drawing */}
        <div className="relative p-5 sm:p-6 mb-5 flex items-center justify-center">
          {/* Subtle Ambient Squircle Base Light */}
          <div
            className="absolute inset-0 rounded-3xl bg-blue-600/10 blur-xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Interlocking AQ Lettermark Glyph */}
          <div className="relative z-10 transition-transform duration-700 ease-out transform hover:scale-105">
            <AQMonogram
              size={100}
              variant="gradient"
              animated={true}
              title="ArchitectIQ Official Interlocking AQ Monogram"
            />
          </div>

          {/* Scene 4: Light Sweep Specular Beam */}
          {scene4Sweep && (
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
              aria-hidden="true"
            >
              <div
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent animate-light-sweep"
              />
            </div>
          )}
        </div>

        {/* Scene 3: Brand Reveal (Wordmark & Tagline) */}
        <div
          className={`flex flex-col items-center transition-all duration-700 ease-out ${
            scene3Visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {/* Wordmark */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center">
            Architect
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300 bg-clip-text text-transparent ml-0.5">
              IQ
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-2">
            <span className="inline-block w-4 h-px bg-blue-500/50" />
            <span>Where Ideas Become Architecture</span>
            <span className="inline-block w-4 h-px bg-blue-500/50" />
          </p>

          {/* Progress Indicator dots */}
          <div className="mt-6 flex items-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-200" />
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-[11px] text-slate-500 font-mono tracking-wider opacity-70 pointer-events-none"
        aria-hidden="true"
      >
        Click anywhere to skip
      </div>
    </div>
  );
};

export default AnimatedIntro;
