'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
const track = (..._args: any[]) => {};

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const phaseMeta = {
  'inhale': {
    text: 'Inspire...',
    description: 'Remplis tes poumons d\'énergie positive',
    colorClass: 'from-cyan-500/30 to-blue-500/20 border-cyan-400/50 shadow-cyan-500/40 text-cyan-200',
    scaleClass: 'scale-115 md:scale-120',
    glowColor: '#00f5ff'
  },
  'hold-in': {
    text: 'Retiens ton souffle',
    description: 'Profite de la sensation de plénitude',
    colorClass: 'from-yellow-500/30 to-amber-500/20 border-yellow-400/50 shadow-yellow-500/40 text-yellow-200',
    scaleClass: 'scale-115 md:scale-120 animate-pulse',
    glowColor: '#ffe600'
  },
  'exhale': {
    text: 'Expire...',
    description: 'Relâche toutes les tensions et le stress',
    colorClass: 'from-pink-500/30 to-violet-500/20 border-pink-400/50 shadow-pink-500/40 text-pink-200',
    scaleClass: 'scale-90 md:scale-95',
    glowColor: '#ff007a'
  },
  'hold-out': {
    text: 'Attends...',
    description: 'Vide ton esprit avant le prochain souffle',
    colorClass: 'from-slate-800/50 to-slate-900/30 border-spoolio-dark-border shadow-slate-950/40 text-slate-400',
    scaleClass: 'scale-90 md:scale-95',
    glowColor: 'rgba(255, 255, 255, 0.1)'
  }
};

const incrementCalmStat = (type: 'clicks' | 'pops' | 'twangs' | 'breathingSeconds', amount: number = 1) => {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('spoolio_calm_stats');
    const stats = saved ? JSON.parse(saved) : { clicks: 0, pops: 0, twangs: 0, breathingSeconds: 0 };
    stats[type] = (stats[type] || 0) + amount;
    localStorage.setItem('spoolio_calm_stats', JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('calm-stats-updated', { detail: stats }));
  } catch (e) {}
};

export default function BreathingGuide() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [breathDuration, setBreathDuration] = useState(4); // 4 seconds Box Breathing default
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // References for Web Audio API synth
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize or resume Audio context
  const initAudio = () => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);

        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      } catch (e) {}
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Adjust audio pitch and volume based on phase and progression
  const updateAudioNode = (currentPhase: BreathPhase, progressRatio: number) => {
    if (!isAudioEnabled || !audioCtxRef.current || !oscRef.current || !gainRef.current) return;

    const ctx = audioCtxRef.current;
    const osc = oscRef.current;
    const gain = gainRef.current;
    const now = ctx.currentTime;

    try {
      if (currentPhase === 'inhale') {
        // Frequency climbs up from 130Hz to 240Hz
        const freq = 130 + (240 - 130) * progressRatio;
        osc.frequency.setTargetAtTime(freq, now, 0.2);
        // Soft volume ramp up
        const vol = 0.08 + 0.12 * progressRatio;
        gain.gain.setTargetAtTime(vol, now, 0.2);
      } else if (currentPhase === 'hold-in') {
        // High frequency steady humming with slight vibrato oscillation
        osc.frequency.setTargetAtTime(240, now, 0.2);
        gain.gain.setTargetAtTime(0.12, now, 0.2);
      } else if (currentPhase === 'exhale') {
        // Frequency slides down from 240Hz to 130Hz
        const freq = 240 - (240 - 130) * progressRatio;
        osc.frequency.setTargetAtTime(freq, now, 0.2);
        // Soft volume ramp down
        const vol = 0.2 - 0.12 * progressRatio;
        gain.gain.setTargetAtTime(vol, now, 0.2);
      } else if (currentPhase === 'hold-out') {
        // Deep grounding hum at 70Hz
        osc.frequency.setTargetAtTime(70, now, 0.2);
        gain.gain.setTargetAtTime(0.04, now, 0.2);
      }
    } catch (e) {}
  };

  // Stop sound when paused or muted
  const silenceAudio = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.15);
      } catch (e) {}
    }
  };

  // Sound muting toggle
  useEffect(() => {
    if (!isAudioEnabled) {
      silenceAudio();
    }
  }, [isAudioEnabled]);

  // Main breathing loop timer
  useEffect(() => {
    if (!isActive) {
      silenceAudio();
      return;
    }

    initAudio();

    const timer = setTimeout(() => {
      // Calculate progress ratio for sound morphing
      const nextSec = secondsRemaining - 1;
      const totalDuration = breathDuration;
      const elapsed = totalDuration - nextSec;
      const progressRatio = Math.max(0, Math.min(1, elapsed / totalDuration));
      updateAudioNode(phase, progressRatio);

      // Accumulate breathing statistics (safely inside effect body)
      incrementCalmStat('breathingSeconds', 1);

      if (nextSec <= 0) {
        // Transition to the next phase in Box Breathing
        let nextPhase: BreathPhase = 'inhale';
        if (phase === 'inhale') {
          nextPhase = 'hold-in';
        } else if (phase === 'hold-in') {
          nextPhase = 'exhale';
        } else if (phase === 'exhale') {
          nextPhase = 'hold-out';
        } else if (phase === 'hold-out') {
          nextPhase = 'inhale';
          setCycles(c => c + 1);
        }

        setPhase(nextPhase);
        setSecondsRemaining(breathDuration);
      } else {
        setSecondsRemaining(nextSec);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, phase, secondsRemaining, breathDuration]);

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const handleStartStop = () => {
    if (!isActive) {
      try {
        track('breath_session_start', { duration: breathDuration });
      } catch (e) {}
      initAudio();
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setSecondsRemaining(breathDuration);
    setCycles(0);
    silenceAudio();
  };

  const currentMeta = phaseMeta[phase];

  return (
    <div className="bg-spoolio-dark-card border border-spoolio-dark-border p-6 sm:p-10 rounded-3xl max-w-2xl mx-auto animate-fade-in w-full shadow-lg relative select-none">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-spoolio-dark-border/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-black uppercase text-cyan-300 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Anti-Stress ASMR</span>
          </div>
          <h3 className="font-extrabold text-white text-xl tracking-wide">Respiration au Carré</h3>
          <p className="text-xs text-spoolio-text-muted mt-0.5">
            Calme instantanément ton système nerveux et focalise ton attention.
          </p>
        </div>

        {/* Duration configuration buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-spoolio-text-muted mr-1">Rythme :</span>
          {[4, 5, 6].map(dur => (
            <button
              key={dur}
              onClick={() => {
                setBreathDuration(dur);
                setSecondsRemaining(dur);
                handleReset();
              }}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border
                ${breathDuration === dur 
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-md' 
                  : 'bg-background border-spoolio-dark-border text-spoolio-text-muted hover:text-white'
                }
              `}
            >
              {dur}s
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive animation bubble */}
      <div className="flex flex-col items-center justify-center py-8">
        
        {/* Animated breathing bubble */}
        <div 
          onClick={handleStartStop}
          className={`
            w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 flex flex-col items-center justify-center text-center p-6
            bg-gradient-to-br backdrop-blur-md shadow-2xl transition-all duration-1000 ease-in-out cursor-pointer select-none
            ${isActive ? currentMeta.scaleClass : 'scale-100 border-spoolio-dark-border from-slate-900/40 to-slate-950/20 shadow-slate-950/20'}
            ${isActive ? currentMeta.colorClass : 'text-slate-400'}
          `}
          style={{
            boxShadow: isActive ? `0 20px 50px -15px ${currentMeta.glowColor}` : undefined
          }}
        >
          {isActive ? (
            <div className="space-y-3">
              <span className="text-2xl sm:text-3xl font-black tracking-wide uppercase transition-all">
                {currentMeta.text}
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono leading-none tracking-tight">
                {secondsRemaining}
              </div>
              <p className="text-[10px] text-spoolio-text-muted max-w-[150px] mx-auto uppercase tracking-widest">
                {phase === 'inhale' && 'Inspirer'}
                {phase === 'hold-in' && 'Retenir'}
                {phase === 'exhale' && 'Expirer'}
                {phase === 'hold-out' && 'Bloquer'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-base font-black tracking-widest uppercase text-white animate-pulse">
                Appuie pour commencer
              </span>
              <p className="text-[10px] text-spoolio-text-muted max-w-[150px] mx-auto uppercase tracking-widest">
                Prépare-toi à expirer...
              </p>
            </div>
          )}
        </div>

        {/* Phase instructions details description */}
        <div className="h-10 text-center mt-8 max-w-sm">
          <p className="text-sm font-semibold text-white/90">
            {isActive ? currentMeta.description : 'Trouve une position confortable et détends tes épaules.'}
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between border-t border-spoolio-dark-border/40 pt-6 mt-6 select-none">
        
        {/* Play / Pause / Reset button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartStop}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-95 border
              ${isActive
                ? 'bg-slate-900 border-spoolio-dark-border text-white hover:bg-slate-800'
                : 'bg-cyan-500 border-cyan-400 text-white shadow-lg hover:bg-cyan-600'
              }
            `}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Démarrer</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl border border-spoolio-dark-border bg-slate-900 hover:bg-slate-800 text-spoolio-text-muted hover:text-white transition-all cursor-pointer active:scale-95"
            title="Réinitialiser le cycle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Cycle count indicator and Sound controller */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold text-spoolio-text-muted uppercase tracking-widest block">Cycles complétés</span>
            <span className="text-lg font-black text-white font-mono">{cycles}</span>
          </div>

          <button
            onClick={() => setIsAudioEnabled(prev => !prev)}
            className={`
              p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95
              ${isAudioEnabled 
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20' 
                : 'border-spoolio-dark-border bg-slate-900 text-spoolio-text-muted hover:text-white'
              }
            `}
            title={isAudioEnabled ? 'Désactiver le son ASMR' : 'Activer le son ASMR'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

      </div>

    </div>
  );
}
