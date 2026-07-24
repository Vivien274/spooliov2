'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Sliders, ToggleLeft, ToggleRight, Sparkles, CircleDot, Maximize2, X } from 'lucide-react';
const track = (..._args: any[]) => {};

type FidgetSubTab = 'switchboard' | 'bubblewrap' | 'particles' | 'elastic';

// Synthesize satisfying sounds using the Web Audio API (No large file downloads!)
const playSound = (type: 'click' | 'toggle' | 'tick' | 'pop' | 'sweep') => {
  if (typeof window === 'undefined') return;

  // Haptic vibration feedback for mobile devices (progressive enhancement)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      if (type === 'click') navigator.vibrate(15);
      else if (type === 'toggle') navigator.vibrate(20);
      else if (type === 'tick') navigator.vibrate(6);
      else if (type === 'pop') navigator.vibrate(12);
      else if (type === 'sweep') navigator.vibrate([8, 20, 8, 20]);
    } catch (e) {}
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      // Deep mechanical switch sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'toggle') {
      // Sharp toggle latch snap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.015);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'tick') {
      // High-frequency tactile notch tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } else if (type === 'pop') {
      // High pitch bubble warp snap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'sweep') {
      // Sweeping whoosh for reset
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Context is blocked by browser autoplay policy before gesture
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

export default function DigitalFidgets() {
  const [activeTab, setActiveTab] = useState<FidgetSubTab>('switchboard');
  const [fullscreenControl, setFullscreenControl] = useState<'keyboard' | 'levers' | 'slider' | 'dial' | null>(null);

  const [isColorblind, setIsColorblind] = useState<boolean>(false);

  // Fidget 1: Switchboard States
  const [btnClicks, setBtnClicks] = useState(0);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [sliderValue, setSliderValue] = useState(50);
  const [dialAngle, setDialAngle] = useState(0);
  const lastSliderTickRef = useRef(50);

  // Fidget 2: Bubble Wrap States
  const [bubbles, setBubbles] = useState<boolean[]>(Array(24).fill(false)); // false = intact, true = popped
  const [popCount, setPopCount] = useState(0);

  // Fidget 3: Particle Canvas setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particleCount, setParticleCount] = useState(200);

  // Fidget 4: Elastic Canvas setup
  const elasticCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle Switchboard Click Button
  const handleBtnClick = () => {
    setBtnClicks(prev => prev + 1);
    playSound('click');
    incrementCalmStat('clicks');
  };

  // Handle Toggle Switch
  const handleToggle = (which: 1 | 2) => {
    if (which === 1) setToggle1(prev => !prev);
    else setToggle2(prev => !prev);
    playSound('toggle');
    incrementCalmStat('clicks');
  };

  // Handle Slider notch feedback (ticks every 5 units)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    if (Math.abs(val - lastSliderTickRef.current) >= 5) {
      playSound('tick');
      lastSliderTickRef.current = val;
      incrementCalmStat('clicks');
    }
  };

  // Handle Dial / Knob Click rotation
  const handleDialClick = () => {
    setDialAngle(prev => (prev + 30) % 360);
    playSound('tick');
    incrementCalmStat('clicks');
  };

  // Handle Popping Bubbles
  const handlePopBubble = (index: number) => {
    if (bubbles[index]) return; // Already popped
    const newBubbles = [...bubbles];
    newBubbles[index] = true;
    setBubbles(newBubbles);
    setPopCount(prev => prev + 1);
    playSound('pop');
    incrementCalmStat('pops');
  };

  // Reset/Regrow all bubbles with a sweet rapid sequence
  const resetBubbles = () => {
    playSound('sweep');
    setBubbles(Array(24).fill(false));
  };

  // Fidget 3: Calming physics particle canvas simulation
  useEffect(() => {
    if (activeTab !== 'particles' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 400);

    // Handle resizing
    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = 400;
    };
    window.addEventListener('resize', resizeHandler);

    // Mouse coordinates tracker
    const mouse = { x: width / 2, y: height / 2, active: false, isClicking: false };

    // Particles array definition
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      shape: 'circle' | 'square' | 'triangle' | 'cross';
    }

    const colors = ['#0055ff', '#ff007a', '#ffe600', '#00f5ff'];
    const shapes: ('circle' | 'square' | 'triangle' | 'cross')[] = ['circle', 'square', 'triangle', 'cross'];
    const particlesList: Particle[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particlesList.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.4,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.fillStyle = 'rgba(18, 20, 32, 0.25)'; // Smooth trails effect
      ctx.fillRect(0, 0, width, height);

      particlesList.forEach(p => {
        // Calming movement physics
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction gravity
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const force = (150 - dist) / 150; // Stronger force when closer
            // Attraction or push depending on mouse click
            const strength = mouse.isClicking ? -0.15 : 0.05; 
            p.vx += (dx / dist) * force * strength;
            p.vy += (dy / dist) * force * strength;
          }
        }

        // Limit speed to avoid flying off
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }

        // Render particle
        if (isColorblind) {
          ctx.beginPath();
          if (p.shape === 'circle') {
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          } else if (p.shape === 'square') {
            ctx.rect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          } else if (p.shape === 'triangle') {
            ctx.moveTo(p.x, p.y - p.radius);
            ctx.lineTo(p.x + p.radius, p.y + p.radius);
            ctx.lineTo(p.x - p.radius, p.y + p.radius);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          } else if (p.shape === 'cross') {
            ctx.moveTo(p.x - p.radius, p.y);
            ctx.lineTo(p.x + p.radius, p.y);
            ctx.moveTo(p.x, p.y - p.radius);
            ctx.lineTo(p.x, p.y + p.radius);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = p.alpha;
            ctx.stroke();
          }
          ctx.globalAlpha = 1.0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // Render mouse connection lines (magnetic web)
      if (mouse.active && !mouse.isClicking) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 0, 122, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        particlesList.forEach(p => {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = isColorblind ? '#ffffff' : p.color;
            ctx.globalAlpha = (100 - dist) / 100 * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        });
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Event listeners for hover/touch attraction
    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const coords = getCoordinates(e);
      if (coords) {
        mouse.x = coords.x;
        mouse.y = coords.y;
        mouse.active = true;
        mouse.isClicking = true;
        playSound('tick');
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCoordinates(e);
      if (coords) {
        mouse.x = coords.x;
        mouse.y = coords.y;
        mouse.active = true;
      }
    };

    const handleEnd = () => {
      mouse.active = false;
      mouse.isClicking = false;
    };

    // Desktop Listeners
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', () => { mouse.isClicking = false; });
    canvas.addEventListener('mouseleave', handleEnd);

    // Mobile Listeners
    canvas.addEventListener('touchstart', handleStart, { passive: true });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchend', handleEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', () => { mouse.isClicking = false; });
        canvas.removeEventListener('mouseleave', handleEnd);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleEnd);
      }
    };
  }, [activeTab, particleCount, isColorblind]);

  // Fidget 4: Tactile elastic string simulation
  useEffect(() => {
    if (activeTab !== 'elastic' || !elasticCanvasRef.current) return;

    const canvas = elasticCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 600;
    let height = canvas.height = 350;

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 350;
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    // Physics parameters
    const yBase = height / 2; // Default horizontal line
    let dragY = yBase;
    let dragX = width / 2;
    let isDragging = false;

    // Simulation variables
    let yPos = yBase; // current vertical position of the center
    let yVel = 0; // velocity of the center
    const k = 0.08; // spring constant
    const damping = 0.88; // decay damping factor

    // Track mouse coordinates
    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const coords = getCoordinates(e);
      if (coords) {
        // Only lock if dragging close to the string center vertically
        const distY = Math.abs(coords.y - yPos);
        if (distY < 60) {
          isDragging = true;
          dragX = coords.x;
          dragY = coords.y;
        }
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const coords = getCoordinates(e);
      if (coords) {
        dragX = coords.x;
        // Limit stretch vertical range
        dragY = Math.max(50, Math.min(height - 50, coords.y));
        yPos = dragY;
        yVel = 0; // reset velocity when dragged
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        isDragging = false;
        
        // Trigger spring sound and haptic vibration pattern!
        const displacement = Math.abs(yPos - yBase);
        if (displacement > 10) {
          // Play twang sound
          playSpringSound(displacement);
          // Vibrate device
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try {
              // Pulsed vibration decaying based on displacement
              const pulse = Math.min(50, Math.floor(displacement / 3));
              navigator.vibrate([pulse, 40, Math.floor(pulse / 2), 30, Math.floor(pulse / 4)]);
            } catch (err) {}
          }
          // Increment stat
          incrementCalmStat('twangs');
        }
      }
    };

    // Synthesize spring twang audio
    const playSpringSound = (intensity: number) => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Twang sound frequency drops and oscillates
        const baseFreq = 70 + Math.min(100, intensity / 2);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, audioCtx.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.35);

        const volume = Math.min(0.4, intensity / 250);
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (err) {}
    };

    const draw = () => {
      ctx.fillStyle = '#06070a'; // Dark solid background
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid helper for visual depth
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Physics update if not dragged
      if (!isDragging) {
        const displacement = yPos - yBase;
        const force = -k * displacement;
        yVel += force;
        yVel *= damping; // damping factor
        yPos += yVel;
      }

      // Render Elastic String
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      const ctrlX = isDragging ? dragX : width / 2;
      ctx.quadraticCurveTo(ctrlX, yPos, width, yBase);
      
      // Neon glow stroke
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow for other draws

      // Draw active handle center circle
      ctx.beginPath();
      const circleX = isDragging ? dragX : width / 2;
      ctx.arc(circleX, yPos, 10, 0, Math.PI * 2);
      ctx.fillStyle = isDragging ? '#ffe600' : '#ffffff';
      ctx.strokeStyle = '#06070a';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Draw static anchors at the sides
      ctx.beginPath();
      ctx.arc(0, yBase, 7, 0, Math.PI * 2);
      ctx.arc(width, yBase, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // Attach listeners
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: true });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchend', handleEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', handleEnd);
        canvas.removeEventListener('mouseleave', handleEnd);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleEnd);
      }
    };
  }, [activeTab]);

  const handleTabTransition = (tab: FidgetSubTab) => {
    try {
      track('fidget_tab_visit', { tab });
    } catch (e) {}
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setActiveTab(tab);
      });
    } else {
      setActiveTab(tab);
    }
  };

  // Modular render function: Switchboard Grid
  const renderSwitchboard = (isModal: boolean = false, activeOnly: typeof fullscreenControl = null) => (
    <div className={`grid grid-cols-1 ${isModal ? 'max-w-md mx-auto' : 'sm:grid-cols-2 md:grid-cols-4'} gap-6 animate-fade-in w-full`}>
      
      {/* Fidget: Mechanical Keyboard Cap */}
      {(!isModal || activeOnly === 'keyboard') && (
        <div className={`flex flex-col items-center justify-between p-6 ${isModal ? 'p-10' : 'p-6'} rounded-3xl border border-spoolio-dark-border bg-spoolio-dark-card text-center relative select-none shadow-md w-full`}>
          {/* Fullscreen Expand Icon (Only shown in normal layout mode) */}
          {!isModal && (
            <button
              onClick={() => setFullscreenControl('keyboard')}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-spoolio-dark-border bg-slate-900/60 hover:text-spoolio-blue hover:border-spoolio-blue text-spoolio-text-muted transition-all active:scale-90 cursor-pointer flex items-center justify-center outline-none"
              title="Agrandir ce fidget"
              aria-label="Agrandir ce fidget"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-spoolio-text-muted">
              Keyboard Cap
            </span>
            <h4 className={`font-extrabold text-white mt-1 ${isModal ? 'text-xl mb-10' : 'text-md mb-6'}`}>
              {isModal ? 'Clic Tactile Plein Écran' : 'Clic Tactile'}
            </h4>
          </div>

          <button
            onClick={handleBtnClick}
            className={`
              bg-linear-to-b from-[#2e3450] to-[#161a29] border-t border-slate-500
              rounded-2xl shadow-[0_8px_0_#0f111a,0_15px_20px_rgba(0,0,0,0.5)] cursor-pointer
              active:translate-y-[6px] active:shadow-[0_2px_0_#0f111a,0_8px_10px_rgba(0,0,0,0.5)]
              transition-all duration-75 flex items-center justify-center text-white outline-none focus-visible:ring-2 focus-visible:ring-spoolio-blue
              ${isModal ? 'w-28 h-28 rounded-3xl shadow-[0_12px_0_#0f111a,0_20px_25px_rgba(0,0,0,0.6)] active:translate-y-[10px]' : 'w-20 h-20'}
            `}
            aria-label="Clic Switch mécanique virtuel"
          >
            <CircleDot className={isModal ? 'w-8 h-8 text-slate-400' : 'w-6 h-6 text-slate-400'} />
          </button>

          <span className={`text-spoolio-text-muted font-bold ${isModal ? 'mt-12 text-sm' : 'mt-8 text-xs'}`}>
            Cliqué : <strong className="text-white font-mono">{btnClicks}</strong>
          </span>
        </div>
      )}

      {/* Fidget: Toggle Latches */}
      {(!isModal || activeOnly === 'levers') && (
        <div className={`flex flex-col items-center justify-between p-6 ${isModal ? 'p-10' : 'p-6'} rounded-3xl border border-spoolio-dark-border bg-spoolio-dark-card text-center relative select-none shadow-md w-full`}>
          {!isModal && (
            <button
              onClick={() => setFullscreenControl('levers')}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-spoolio-dark-border bg-slate-900/60 hover:text-spoolio-blue hover:border-spoolio-blue text-spoolio-text-muted transition-all active:scale-90 cursor-pointer flex items-center justify-center outline-none"
              title="Agrandir ce fidget"
              aria-label="Agrandir ce fidget"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-spoolio-text-muted">
              Lever Switches
            </span>
            <h4 className={`font-extrabold text-white mt-1 ${isModal ? 'text-xl mb-10' : 'text-md mb-6'}`}>
              Leviers Métalliques
            </h4>
          </div>

          <div className={`flex items-center gap-6 ${isModal ? 'gap-10 py-6 scale-110' : 'py-4'}`}>
            <button
              onClick={() => handleToggle(1)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spoolio-blue ${
                toggle1 ? 'border-spoolio-blue text-spoolio-blue bg-spoolio-blue/10' : 'border-spoolio-dark-border text-slate-500'
              } ${isModal ? 'p-4 rounded-3xl' : ''}`}
              aria-label="Interrupteur à bascule 1"
            >
              {toggle1 ? <ToggleRight className={isModal ? 'w-10 h-10' : 'w-8 h-8'} /> : <ToggleLeft className={isModal ? 'w-10 h-10' : 'w-8 h-8'} />}
            </button>

            <button
              onClick={() => handleToggle(2)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spoolio-pink ${
                toggle2 ? 'border-spoolio-pink text-spoolio-pink bg-spoolio-pink/10' : 'border-spoolio-dark-border text-slate-500'
              } ${isModal ? 'p-4 rounded-3xl' : ''}`}
              aria-label="Interrupteur à bascule 2"
            >
              {toggle2 ? <ToggleRight className={isModal ? 'w-10 h-10' : 'w-8 h-8'} /> : <ToggleLeft className={isModal ? 'w-10 h-10' : 'w-8 h-8'} />}
            </button>
          </div>

          <span className={`text-spoolio-text-muted font-bold ${isModal ? 'mt-8 text-sm' : 'mt-4 text-xs'}`}>
            {toggle1 ? 'ON' : 'OFF'} &bull; {toggle2 ? 'ON' : 'OFF'}
          </span>
        </div>
      )}

      {/* Fidget: Tactile Notch Slider */}
      {(!isModal || activeOnly === 'slider') && (
        <div className={`flex flex-col items-center justify-between p-6 ${isModal ? 'p-10' : 'p-6'} rounded-3xl border border-spoolio-dark-border bg-spoolio-dark-card text-center relative select-none shadow-md w-full`}>
          {!isModal && (
            <button
              onClick={() => setFullscreenControl('slider')}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-spoolio-dark-border bg-slate-900/60 hover:text-spoolio-blue hover:border-spoolio-blue text-spoolio-text-muted transition-all active:scale-90 cursor-pointer flex items-center justify-center outline-none"
              title="Agrandir ce fidget"
              aria-label="Agrandir ce fidget"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-spoolio-text-muted">
              Notched Slider
            </span>
            <h4 className={`font-extrabold text-white mt-1 ${isModal ? 'text-xl mb-10' : 'text-md mb-6'}`}>
              Curseur Cranté
            </h4>
          </div>

          <div className={`w-full flex items-center justify-center ${isModal ? 'py-10' : 'py-6'}`}>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className={`
                w-full accent-spoolio-yellow bg-background border border-spoolio-dark-border
                rounded-lg appearance-none cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-spoolio-yellow
                ${isModal ? 'h-3' : 'h-2'}
              `}
              aria-label="Curseur sensoriel cranté"
            />
          </div>

          <span className={`text-spoolio-text-muted font-bold ${isModal ? 'mt-8 text-sm' : 'mt-4 text-xs'}`}>
            Intensité : <strong className="text-spoolio-yellow font-mono">{sliderValue}%</strong>
          </span>
        </div>
      )}

      {/* Fidget: Rotary Tick Knob */}
      {(!isModal || activeOnly === 'dial') && (
        <div className={`flex flex-col items-center justify-between p-6 ${isModal ? 'p-10' : 'p-6'} rounded-3xl border border-spoolio-dark-border bg-spoolio-dark-card text-center relative select-none shadow-md w-full`}>
          {!isModal && (
            <button
              onClick={() => setFullscreenControl('dial')}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-spoolio-dark-border bg-slate-900/60 hover:text-spoolio-blue hover:border-spoolio-blue text-spoolio-text-muted transition-all active:scale-90 cursor-pointer flex items-center justify-center outline-none"
              title="Agrandir ce fidget"
              aria-label="Agrandir ce fidget"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-spoolio-text-muted">
              Rotary Dial
            </span>
            <h4 className={`font-extrabold text-white mt-1 ${isModal ? 'text-xl mb-10' : 'text-md mb-6'}`}>
              Molette Rotative
            </h4>
          </div>

          <button
            onClick={handleDialClick}
            className={`
              rounded-full bg-slate-900 border-4 border-spoolio-dark-border
              flex items-center justify-center cursor-pointer shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-spoolio-pink
              active:scale-95 transition-transform duration-100 relative
              ${isModal ? 'w-24 h-24 border-6' : 'w-16 h-16'}
            `}
            style={{ transform: `rotate(${dialAngle}deg)` }}
            aria-label="Bouton rotatif de réglage"
          >
            {/* Notch point on the dial */}
            <div className={`rounded-full bg-spoolio-pink absolute ${isModal ? 'top-2 w-3.5 h-3.5' : 'top-1 w-2 h-2'}`} />
          </button>

          <span className={`text-spoolio-text-muted font-bold ${isModal ? 'mt-12 text-sm' : 'mt-8 text-xs'}`}>
            Angle : <strong className="text-white font-mono">{dialAngle}°</strong>
          </span>
        </div>
      )}
    </div>
  );

  // Modular render function: Bubblewrap
  const renderBubblewrap = () => (
    <div className="bg-spoolio-dark-card border border-spoolio-dark-border p-6 rounded-3xl max-w-lg mx-auto animate-fade-in w-full shadow-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-spoolio-dark-border/40 select-none">
        <div>
          <h3 className="font-bold text-white text-lg">Papier Bulle Infini</h3>
          <p className="text-xs text-spoolio-text-muted mt-0.5">Clique pour éclater, éclate pour détendre.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-spoolio-text-muted">
            Bulles : <strong className="text-spoolio-pink font-mono">{popCount}</strong>
          </span>
          <button
            onClick={resetBubbles}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
              bg-spoolio-pink text-white hover:bg-spoolio-pink/90 active:scale-95
              transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-spoolio-pink
            "
            title="Tout regonfler"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bubbles Grid (6 x 4) */}
      <div className="grid grid-cols-6 gap-4 p-4 bg-background/50 rounded-2xl">
        {bubbles.map((popped, idx) => (
          <button
            key={idx}
            onClick={() => handlePopBubble(idx)}
            aria-label={`Bulle numéro ${idx + 1}`}
            className={`
              aspect-square rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer relative outline-none
              ${
                popped
                  ? 'bg-slate-950 border border-slate-900 shadow-[inset_0_3px_5px_rgba(0,0,0,0.8)] scale-90 opacity-60'
                  : 'bg-radial from-slate-700 to-slate-900 border border-slate-600 shadow-[0_5px_8px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 group focus-visible:ring-2 focus-visible:ring-spoolio-pink'
              }
            `}
          >
            {/* Bubble inner light reflection effect */}
            {!popped && (
              <span className="w-1.5 h-1.5 rounded-full bg-white/25 absolute top-1 left-2 pointer-events-none transition-transform group-active:scale-50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Modular render function: Particles
  const renderParticles = () => (
    <div className="bg-spoolio-dark-card border border-spoolio-dark-border p-6 rounded-3xl max-w-2xl mx-auto animate-fade-in w-full shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-spoolio-dark-border/40 select-none">
        <div>
          <h3 className="font-bold text-white text-lg">Sable Stellaire Gravity</h3>
          <p className="text-xs text-spoolio-text-muted mt-0.5">
            Survole pour rassembler le sable. Touche ou clique pour le repousser.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Colorblind Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isColorblind}
              onChange={(e) => setIsColorblind(e.target.checked)}
              className="accent-spoolio-yellow w-4 h-4 rounded border-spoolio-dark-border cursor-pointer focus:ring-0"
            />
            <span className="text-xs font-bold text-spoolio-text-muted hover:text-white transition-colors">
              👁️ Formes (Daltonisme)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <label htmlFor="density-select" className="text-xs font-bold text-spoolio-text-muted whitespace-nowrap">
              Densité :
            </label>
            <select
              id="density-select"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value, 10))}
              className="
                bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-xl
                border border-spoolio-dark-border focus:border-spoolio-yellow outline-none
              "
            >
              <option value="100">Zen (100)</option>
              <option value="200">Standard (200)</option>
              <option value="350">Dense (350)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-900">
        <canvas
          ref={canvasRef}
          className="w-full block bg-slate-950 cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        {/* Visual Indicator of Gravity */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-spoolio-yellow font-mono pointer-events-none select-none flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-spin" />
          <span>Canvas Interactif</span>
        </div>
      </div>
    </div>
  );

  // If in fullscreen overlay mode for a Switchboard control card
  if (fullscreenControl) {
    return (
      <div className="fixed inset-0 z-50 bg-[#06070a] flex flex-col items-center justify-center p-4 sm:p-12 overflow-hidden select-none animate-fade-in">
        {/* Fullscreen background decorative glows */}
        <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-spoolio-blue/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-spoolio-pink/10 blur-[100px] pointer-events-none" />

        {/* Top immersive banner */}
        <div className="w-full max-w-md flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎛️</span>
            <div>
              <h4 className="font-extrabold text-white text-sm tracking-wider uppercase">
                {fullscreenControl === 'keyboard' && 'Bouton Mécanique'}
                {fullscreenControl === 'levers' && 'Interrupteurs à Leviers'}
                {fullscreenControl === 'slider' && 'Curseur Sensoriel'}
                {fullscreenControl === 'dial' && 'Molette Tactile'}
              </h4>
              <p className="text-[9px] text-spoolio-text-muted uppercase tracking-widest mt-0.5">
                Immersion Fidget Individuel
              </p>
            </div>
          </div>

          <button
            onClick={() => setFullscreenControl(null)}
            className="p-2.5 rounded-xl border border-spoolio-dark-border bg-spoolio-dark-card hover:bg-slate-900 text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center outline-none"
            title="Quitter le plein écran"
            aria-label="Quitter le plein écran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centered active control card */}
        <div className="w-full max-w-md mx-auto relative z-10 flex items-center justify-center">
          {renderSwitchboard(true, fullscreenControl)}
        </div>
      </div>
    );
  }

  // Modular render function: Elastic
  const renderElastic = () => (
    <div className="bg-spoolio-dark-card border border-spoolio-dark-border p-6 rounded-3xl max-w-2xl mx-auto animate-fade-in w-full shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-spoolio-dark-border/40 select-none">
        <div>
          <h3 className="font-bold text-white text-lg">L'Élastique Sensoriel</h3>
          <p className="text-xs text-spoolio-text-muted mt-0.5">
            Pince et étire le fil avec ton doigt ou ta souris, puis relâche pour le faire vibrer.
          </p>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-900">
        <canvas
          ref={elasticCanvasRef}
          className="w-full block bg-slate-950 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        />
        {/* Haptic indicator */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-spoolio-blue font-mono pointer-events-none select-none flex items-center gap-1">
          <span>🪢 Simulation de Tensions Physiques</span>
        </div>
      </div>
    </div>
  );

  // Normal inline tab content
  return (
    <div className="w-full max-w-4xl mx-auto px-4 relative">
      
      {/* Sub tabs selector */}
      <div className="flex max-w-2xl mx-auto mb-8 bg-spoolio-dark-card/45 p-1 rounded-2xl select-none border border-spoolio-dark-border/20">
        <button
          onClick={() => handleTabTransition('switchboard')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none ${
            activeTab === 'switchboard'
              ? 'bg-spoolio-blue text-white shadow-md'
              : 'text-spoolio-text-muted hover:text-foreground'
          }`}
        >
          🎛️ Tableau
        </button>
        <button
          onClick={() => handleTabTransition('bubblewrap')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none ${
            activeTab === 'bubblewrap'
              ? 'bg-spoolio-pink text-white shadow-md'
              : 'text-spoolio-text-muted hover:text-foreground'
          }`}
        >
          🫧 Bulle Pop
        </button>
        <button
          onClick={() => handleTabTransition('particles')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none ${
            activeTab === 'particles'
              ? 'bg-spoolio-yellow text-background shadow-md'
              : 'text-spoolio-text-muted hover:text-foreground'
          }`}
        >
          🌌 Sable
        </button>
        <button
          onClick={() => handleTabTransition('elastic')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none ${
            activeTab === 'elastic'
              ? 'bg-[#00f5ff] text-slate-950 shadow-md'
              : 'text-spoolio-text-muted hover:text-foreground'
          }`}
        >
          🪢 Élastique
        </button>
      </div>

      {/* Render active fidget block */}
      <div className="w-full">
        {activeTab === 'switchboard' && renderSwitchboard(false)}
        {activeTab === 'bubblewrap' && renderBubblewrap()}
        {activeTab === 'particles' && renderParticles()}
        {activeTab === 'elastic' && renderElastic()}
      </div>
    </div>
  );
}
