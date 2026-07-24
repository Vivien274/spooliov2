'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Sliders, ToggleLeft, ToggleRight, Sparkles, CircleDot, Maximize2, X, RotateCw, Settings } from 'lucide-react';
const track = (..._args: any[]) => {};

type FidgetSubTab = 'switchboard' | 'spinner' | 'gears' | 'bubblewrap' | 'particles' | 'elastic';

// Synthesize satisfying sounds using the Web Audio API
const playSound = (type: 'click' | 'toggle' | 'tick' | 'pop' | 'sweep' | 'gear') => {
  if (typeof window === 'undefined') return;

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      if (type === 'click') navigator.vibrate(15);
      else if (type === 'toggle') navigator.vibrate(20);
      else if (type === 'tick') navigator.vibrate(6);
      else if (type === 'pop') navigator.vibrate(12);
      else if (type === 'gear') navigator.vibrate(8);
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'toggle') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.015);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } else if (type === 'gear') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'sweep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
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
  const [bubbles, setBubbles] = useState<boolean[]>(Array(24).fill(false));
  const [popCount, setPopCount] = useState(0);

  // Fidget 3: Particle Canvas setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particleCount, setParticleCount] = useState(200);

  // Fidget 4: Elastic Canvas setup
  const elasticCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fidget 5: 3D Gyroscopic Spinner Canvas setup
  const spinnerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rpm, setRpm] = useState(0);
  const angularVelocityRef = useRef(0);

  // Fidget 6: Infinite Gears Canvas setup
  const gearsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gearAngleRef = useRef(0);

  const handleBtnClick = () => {
    setBtnClicks(prev => prev + 1);
    playSound('click');
    incrementCalmStat('clicks');
  };

  const handleToggle = (which: 1 | 2) => {
    if (which === 1) setToggle1(prev => !prev);
    else setToggle2(prev => !prev);
    playSound('toggle');
    incrementCalmStat('clicks');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);

    if (Math.abs(val - lastSliderTickRef.current) >= 4) {
      playSound('tick');
      lastSliderTickRef.current = val;
      incrementCalmStat('clicks');
    }
  };

  const handleDialClick = () => {
    setDialAngle(prev => (prev + 30) % 360);
    playSound('tick');
    incrementCalmStat('clicks');
  };

  const handlePopBubble = (idx: number) => {
    if (!bubbles[idx]) {
      const next = [...bubbles];
      next[idx] = true;
      setBubbles(next);
      setPopCount(prev => prev + 1);
      playSound('pop');
      incrementCalmStat('pops');
    }
  };

  const resetBubbles = () => {
    setBubbles(Array(24).fill(false));
    playSound('sweep');
  };

  // 3D Gyroscopic Spinner Canvas Loop
  useEffect(() => {
    if (activeTab !== 'spinner' || !spinnerCanvasRef.current) return;

    const canvas = spinnerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 600;
    let height = canvas.height = 350;
    let currentAngle = 0;
    let lastMouseAngle = 0;
    let isDragging = false;

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 350;
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    const getCenterDist = (x: number, y: number) => {
      const cx = width / 2;
      const cy = height / 2;
      return { dx: x - cx, dy: y - cy, angle: Math.atan2(y - cy, x - cx) };
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const { angle } = getCenterDist(clientX - rect.left, clientY - rect.top);
      isDragging = true;
      lastMouseAngle = angle;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX === undefined || clientY === undefined) return;

      const { angle } = getCenterDist(clientX - rect.left, clientY - rect.top);
      let diff = angle - lastMouseAngle;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      angularVelocityRef.current += diff * 0.4;
      lastMouseAngle = angle;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const draw = () => {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Friction decay
      angularVelocityRef.current *= 0.988;
      currentAngle += angularVelocityRef.current;

      const currentRPM = Math.round(Math.abs(angularVelocityRef.current) * 190);
      setRpm(currentRPM);

      if (currentRPM > 10 && Math.random() < 0.15) {
        playSound('tick');
      }

      ctx.save();
      ctx.translate(cx, cy);

      // Outer Gyroscopic Ring 1
      ctx.save();
      ctx.rotate(currentAngle * 0.3);
      ctx.scale(1, 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.strokeStyle = '#005cff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#005cff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // Outer Gyroscopic Ring 2
      ctx.save();
      ctx.rotate(-currentAngle * 0.5);
      ctx.scale(0.5, 1);
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // Main 3-Blade Fidget Spinner Body
      ctx.rotate(currentAngle);
      for (let i = 0; i < 3; i++) {
        const bladeAngle = (i * Math.PI * 2) / 3;
        ctx.save();
        ctx.rotate(bladeAngle);

        // Arm
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -85);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Outer Brass Weight Cap
        ctx.beginPath();
        ctx.arc(0, -85, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, -85, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.restore();
      }

      // Center Stainless Bearing Cap
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#005cff';
      ctx.shadowColor = '#005cff';
      ctx.shadowBlur = 20;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    canvas.addEventListener('touchend', handlePointerUp, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      if (canvas) {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mousemove', handlePointerMove);
        canvas.removeEventListener('mouseup', handlePointerUp);
        canvas.removeEventListener('mouseleave', handlePointerUp);
        canvas.removeEventListener('touchstart', handlePointerDown);
        canvas.removeEventListener('touchmove', handlePointerMove);
        canvas.removeEventListener('touchend', handlePointerUp);
      }
    };
  }, [activeTab]);

  const spinImpulse = () => {
    angularVelocityRef.current += 0.45;
    playSound('sweep');
    incrementCalmStat('clicks');
  };

  // Infinite Gears Canvas Loop
  useEffect(() => {
    if (activeTab !== 'gears' || !gearsCanvasRef.current) return;

    const canvas = gearsCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 600;
    let height = canvas.height = 350;
    let lastX = 0;
    let isDragging = false;
    let gearVelocity = 0.01;

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 350;
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      lastX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const currentX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
      const diff = currentX - lastX;
      gearVelocity += diff * 0.003;
      lastX = currentX;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const drawGear = (cx: number, cy: number, radius: number, teeth: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.fillStyle = color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;

      // Draw gear teeth
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a1 = (i * Math.PI * 2) / teeth;
        const a2 = a1 + Math.PI / teeth / 2;
        const a3 = a1 + (Math.PI * 3) / teeth / 2;
        const a4 = ((i + 1) * Math.PI * 2) / teeth;

        const rIn = radius - 8;
        const rOut = radius + 10;

        if (i === 0) ctx.moveTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
        else ctx.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);

        ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
        ctx.lineTo(Math.cos(a3) * rOut, Math.sin(a3) * rOut);
        ctx.lineTo(Math.cos(a4) * rIn, Math.sin(a4) * rIn);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Gear Hole
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0b0e';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const draw = () => {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      gearVelocity *= 0.985;
      if (Math.abs(gearVelocity) < 0.002) gearVelocity = 0.003;
      gearAngleRef.current += gearVelocity;

      const mainAngle = gearAngleRef.current;
      const gear1Teeth = 16;
      const gear2Teeth = 11;
      const gear3Teeth = 8;

      const cx = width / 2;
      const cy = height / 2;

      // Gear 1 (Main Drive Blue)
      drawGear(cx - 100, cy, 75, gear1Teeth, mainAngle, '#005cff');

      // Gear 2 (Interlocking Pink)
      drawGear(cx + 40, cy, 52, gear2Teeth, -mainAngle * (gear1Teeth / gear2Teeth), '#ec4899');

      // Gear 3 (High-Speed Yellow)
      drawGear(cx + 145, cy, 38, gear3Teeth, mainAngle * (gear1Teeth / gear3Teeth), '#fbbf24');

      if (Math.abs(gearVelocity) > 0.01 && Math.random() < 0.2) {
        playSound('gear');
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    canvas.addEventListener('touchend', handlePointerUp, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      if (canvas) {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mousemove', handlePointerMove);
        canvas.removeEventListener('mouseup', handlePointerUp);
        canvas.removeEventListener('mouseleave', handlePointerUp);
        canvas.removeEventListener('touchstart', handlePointerDown);
        canvas.removeEventListener('touchmove', handlePointerMove);
        canvas.removeEventListener('touchend', handlePointerUp);
      }
    };
  }, [activeTab]);

  const gearImpulse = () => {
    gearAngleRef.current += 0.6;
    playSound('gear');
    incrementCalmStat('clicks');
  };

  // Particles & Elastic canvas loops remain existing
  useEffect(() => {
    if (activeTab !== 'particles' || !canvasRef.current) return;
    const canvas = canvasRef.current;
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

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isHovering = false;

    const particles: any[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 1,
        color: ['#005cff', '#ec4899', '#fbbf24', '#00f5ff'][Math.floor(Math.random() * 4)],
      });
    }

    const draw = () => {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        if (isHovering) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const force = (140 - dist) / 140;
            p.vx -= (dx / dist) * force * 0.4;
            p.vy -= (dy / dist) * force * 0.4;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [activeTab, particleCount]);

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

    const yBase = height / 2;
    let dragY = yBase;
    let dragX = width / 2;
    let isDragging = false;
    let yPos = yBase;
    let yVel = 0;

    const draw = () => {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      if (!isDragging) {
        const displacement = yPos - yBase;
        const force = -0.08 * displacement;
        yVel += force;
        yVel *= 0.88;
        yPos += yVel;
      }

      ctx.beginPath();
      ctx.moveTo(0, yBase);
      const ctrlX = isDragging ? dragX : width / 2;
      ctx.quadraticCurveTo(ctrlX, yPos, width, yBase);
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 6;
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
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

  const renderSwitchboard = (isModal: boolean = false, activeOnly: typeof fullscreenControl = null) => (
    <div className={`grid grid-cols-1 ${isModal ? 'max-w-md mx-auto' : 'sm:grid-cols-2 md:grid-cols-4'} gap-6 animate-fade-in w-full`}>
      {/* Keyboard Cap */}
      {(!isModal || activeOnly === 'keyboard') && (
        <div className={`flex flex-col items-center justify-between ${isModal ? 'p-10' : 'p-6'} rounded-[28px] border border-[#1f1f23] bg-spoolio-card text-center relative select-none shadow-lg shadow-black/40 w-full`}>
          {!isModal && (
            <button
              onClick={() => setFullscreenControl('keyboard')}
              className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/20 text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer flex items-center justify-center outline-none"
              title="Agrandir"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Keyboard Cap</span>
            <h4 className={`font-extrabold text-white mt-1 ${isModal ? 'text-xl mb-10' : 'text-md mb-6'}`}>Clic Tactile</h4>
          </div>

          <button
            onClick={handleBtnClick}
            className={`
              bg-gradient-to-b from-[#2e3450] to-[#161a29] border-t border-slate-400/30
              rounded-2xl shadow-[0_8px_0_#0f111a,0_15px_20px_rgba(0,0,0,0.5)] cursor-pointer
              active:translate-y-[6px] active:shadow-[0_2px_0_#0f111a,0_8px_10px_rgba(0,0,0,0.5)]
              transition-all duration-75 flex items-center justify-center text-white outline-none
              ${isModal ? 'w-28 h-28 rounded-3xl' : 'w-20 h-20'}
            `}
          >
            <CircleDot className={isModal ? 'w-8 h-8 text-slate-400' : 'w-6 h-6 text-slate-400'} />
          </button>

          <span className={`text-neutral-400 font-bold ${isModal ? 'mt-12 text-sm' : 'mt-8 text-xs'}`}>
            Cliqué : <strong className="text-white font-mono">{btnClicks}</strong>
          </span>
        </div>
      )}

      {/* Levers */}
      {(!isModal || activeOnly === 'levers') && (
        <div className={`flex flex-col items-center justify-between ${isModal ? 'p-10' : 'p-6'} rounded-[28px] border border-[#1f1f23] bg-spoolio-card text-center relative select-none shadow-lg shadow-black/40 w-full`}>
          {!isModal && (
            <button onClick={() => setFullscreenControl('levers')} className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Lever Switches</span>
            <h4 className="font-extrabold text-white mt-1">Leviers Métalliques</h4>
          </div>

          <div className="flex items-center gap-6 py-4">
            <button onClick={() => handleToggle(1)} className={`p-3 rounded-2xl border transition-all ${toggle1 ? 'border-[#005cff] text-[#005cff] bg-[#005cff]/10' : 'border-neutral-800 text-neutral-500 bg-neutral-900/60'}`}>
              {toggle1 ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
            <button onClick={() => handleToggle(2)} className={`p-3 rounded-2xl border transition-all ${toggle2 ? 'border-pink-500 text-pink-400 bg-pink-500/10' : 'border-neutral-800 text-neutral-500 bg-neutral-900/60'}`}>
              {toggle2 ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          <span className="text-neutral-400 font-bold text-xs">
            {toggle1 ? 'ON' : 'OFF'} &bull; {toggle2 ? 'ON' : 'OFF'}
          </span>
        </div>
      )}

      {/* Notch Slider */}
      {(!isModal || activeOnly === 'slider') && (
        <div className={`flex flex-col items-center justify-between ${isModal ? 'p-10' : 'p-6'} rounded-[28px] border border-[#1f1f23] bg-spoolio-card text-center relative select-none shadow-lg shadow-black/40 w-full`}>
          {!isModal && (
            <button onClick={() => setFullscreenControl('slider')} className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Notched Slider</span>
            <h4 className="font-extrabold text-white mt-1">Curseur Cranté</h4>
          </div>

          <div className="w-full flex items-center justify-center py-6">
            <input type="range" min="0" max="100" value={sliderValue} onChange={handleSliderChange} className="w-full accent-[#005cff] bg-neutral-900 border border-neutral-800 h-2 rounded-lg" />
          </div>

          <span className="text-neutral-400 font-bold text-xs">
            Intensité : <strong className="text-[#005cff] font-mono">{sliderValue}%</strong>
          </span>
        </div>
      )}

      {/* Rotary Dial */}
      {(!isModal || activeOnly === 'dial') && (
        <div className={`flex flex-col items-center justify-between ${isModal ? 'p-10' : 'p-6'} rounded-[28px] border border-[#1f1f23] bg-spoolio-card text-center relative select-none shadow-lg shadow-black/40 w-full`}>
          {!isModal && (
            <button onClick={() => setFullscreenControl('dial')} className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-all">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Rotary Dial</span>
            <h4 className="font-extrabold text-white mt-1">Molette Rotative</h4>
          </div>

          <button onClick={handleDialClick} className="w-16 h-16 rounded-full bg-neutral-950 border-2 border-neutral-700 flex items-center justify-center cursor-pointer shadow-inner relative active:scale-95 transition-transform" style={{ transform: `rotate(${dialAngle}deg)` }}>
            <div className="w-2 h-2 rounded-full bg-pink-500 absolute top-1" />
          </button>

          <span className="text-neutral-400 font-bold text-xs mt-8">
            Angle : <strong className="text-white font-mono">{dialAngle}°</strong>
          </span>
        </div>
      )}
    </div>
  );

  const renderBubblewrap = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-6 rounded-[28px] max-w-lg mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-bold text-white text-lg">Papier Bulle Infini</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Clique pour éclater, éclate pour détendre.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-400">Bulles : <strong className="text-pink-400 font-mono">{popCount}</strong></span>
          <button onClick={resetBubbles} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 transition-all cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
        {bubbles.map((popped, idx) => (
          <button key={idx} onClick={() => handlePopBubble(idx)} className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer ${popped ? 'bg-neutral-950 border border-neutral-900 opacity-60' : 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700/50 hover:scale-105'}`}>
            {!popped && <span className="w-1.5 h-1.5 rounded-full bg-white/25 absolute top-1 left-2 pointer-events-none" />}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSpinner = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
            <span>🌀 Spinner Gyroscopique 3D</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Glisse ton doigt ou ta souris pour faire tourner en 3D avec inertie physique.</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
          <div className="text-left sm:text-right leading-tight">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vitesse</span>
            <strong className="text-[#005cff] font-mono text-sm block">{rpm} RPM</strong>
          </div>
          <button onClick={spinImpulse} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#005cff] text-white hover:bg-[#004ecc] active:scale-95 transition-all cursor-pointer shadow-md shrink-0">
            <RotateCw className="w-3.5 h-3.5" /> ⚡ Impulsion
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10">
        <canvas ref={spinnerCanvasRef} className="w-full block bg-black/60 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  const renderGears = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
            <span>⚙️ L'Engrenage Infini</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Fais tourner le pignon principal et entraîne l'engrenage en chaîne.</p>
        </div>

        <button onClick={gearImpulse} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-pink-600 text-white hover:bg-pink-500 active:scale-95 transition-all cursor-pointer shadow-md self-start sm:self-auto">
          <Settings className="w-3.5 h-3.5 animate-spin" /> ⚙️ Tourner
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10">
        <canvas ref={gearsCanvasRef} className="w-full block bg-black/60 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  const renderParticles = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg">Sable Stellaire Gravity</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Survole pour rassembler le sable. Touche ou clique pour le repousser.</p>
        </div>
      </div>
      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10">
        <canvas ref={canvasRef} className="w-full block bg-black/60 cursor-crosshair" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  const renderElastic = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg">L'Élastique Sensoriel</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Pince et étire le fil avec ton doigt ou ta souris, puis relâche pour le faire vibrer.</p>
        </div>
      </div>
      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/10">
        <canvas ref={elasticCanvasRef} className="w-full block bg-black/60 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 relative">
      {/* Sub tabs selector aligned with top tabs style and margins */}
      <div className="w-full max-w-3xl mx-auto mb-8 select-none">
        <div className="p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-3xl flex overflow-x-auto scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-6 gap-1.5 shadow-xl">
          <button
            onClick={() => handleTabTransition('switchboard')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'switchboard' ? 'bg-[#005cff] text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tableau
          </button>

          <button
            onClick={() => handleTabTransition('spinner')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'spinner' ? 'bg-[#005cff] text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Spinner 3D
          </button>

          <button
            onClick={() => handleTabTransition('gears')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'gears' ? 'bg-pink-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Engrenages
          </button>

          <button
            onClick={() => handleTabTransition('bubblewrap')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'bubblewrap' ? 'bg-pink-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bulle Pop
          </button>

          <button
            onClick={() => handleTabTransition('particles')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'particles' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sable
          </button>

          <button
            onClick={() => handleTabTransition('elastic')}
            className={`shrink-0 snap-center min-w-[100px] sm:min-w-0 sm:w-full py-2.5 px-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'elastic' ? 'bg-cyan-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Élastique
          </button>
        </div>
      </div>

      {/* Render active fidget block */}
      <div className="w-full">
        {activeTab === 'switchboard' && renderSwitchboard(false)}
        {activeTab === 'spinner' && renderSpinner()}
        {activeTab === 'gears' && renderGears()}
        {activeTab === 'bubblewrap' && renderBubblewrap()}
        {activeTab === 'particles' && renderParticles()}
        {activeTab === 'elastic' && renderElastic()}
      </div>
    </div>
  );
}
