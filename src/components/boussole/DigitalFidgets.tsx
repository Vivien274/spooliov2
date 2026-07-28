'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Sliders, ToggleLeft, ToggleRight, Sparkles, CircleDot, Maximize2, X, RotateCw, Settings } from 'lucide-react';
const track = (..._args: any[]) => {};

type FidgetSubTab = 'switchboard' | 'spinner' | 'gears' | 'bubblewrap' | 'particles' | 'elastic' | 'sand' | 'slime' | 'maze';

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

  // Fidget 7: Kinetic Zen Sand Canvas setup
  const sandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sandResetRef = useRef<(() => void) | null>(null);

  // Fidget 8: Neon Slime Fluid Canvas setup
  const slimeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fidget 9: Marble Maze Canvas setup
  const mazeCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }
    let sparks: Spark[] = [];

    const spawnSparks = (x: number, y: number) => {
      const colors = ['#00f5ff', '#ff007f', '#ff4f00', '#fbbf24'];
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          maxLife: 20 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3.5 + 1.5,
        });
      }
    };

    const getCanvasPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: Math.max(10, Math.min(width - 10, clientX - rect.left)),
        y: clientY - rect.top,
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasPos(e);
      isDragging = true;
      dragX = x;
      dragY = y;
      yPos = y;
      playSound('click');
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const { x, y } = getCanvasPos(e);
      dragX = x;
      dragY = y;
      yPos = y;
    };

    const handleEnd = () => {
      if (isDragging) {
        isDragging = false;
        const stretch = Math.abs(yPos - yBase);
        if (stretch > 8) {
          playSound('sweep');
          incrementCalmStat('twangs');
          spawnSparks(dragX, yPos);
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      // Draw background grid lines for tactile depth
      ctx.strokeStyle = '#1e2029';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Physics spring calculations when released
      if (!isDragging) {
        const displacement = yPos - yBase;
        const force = -0.12 * displacement;
        yVel += force;
        yVel *= 0.86; // Damping
        yPos += yVel;
      }

      const ctrlX = isDragging ? dragX : width / 2;

      // Draw secondary outer glowing strings
      const strings = [
        { offset: -16, color: '#ff007f', width: 3 },
        { offset: 0, color: '#00f5ff', width: 6 },
        { offset: 16, color: '#ff4f00', width: 3 },
      ];

      strings.forEach(({ offset, color, width: strWidth }) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, yBase + offset * 0.5);
        ctx.quadraticCurveTo(ctrlX, yPos + offset, width, yBase + offset * 0.5);
        ctx.strokeStyle = color;
        ctx.lineWidth = strWidth;
        ctx.shadowColor = color;
        ctx.shadowBlur = strWidth === 6 ? 16 : 8;
        ctx.stroke();
        ctx.restore();
      });

      // Draw interactive pull node ring when dragging
      if (isDragging) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(dragX, yPos, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#00f5ff22';
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Render and update spark particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // Gravity
        s.life -= 1 / s.maxLife;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

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

  // Fidget 7: Kinetic Zen Sand Canvas Loop
  useEffect(() => {
    if (activeTab !== 'sand' || !sandCanvasRef.current) return;
    const canvas = sandCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 600);
    let height = (canvas.height = 360);

    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = width;
    trailCanvas.height = height;
    const trailCtx = trailCanvas.getContext('2d');

    const clearSandTrails = () => {
      if (!trailCtx) return;
      trailCtx.clearRect(0, 0, width, height);
    };

    sandResetRef.current = clearSandTrails;

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 360;
        trailCanvas.width = width;
        trailCanvas.height = height;
        clearSandTrails();
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    let stones = [
      { id: 1, x: width * 0.25, y: height * 0.45, r: 26, icon: '🪨' },
      { id: 2, x: width * 0.72, y: height * 0.38, r: 32, icon: '☯️' },
      { id: 3, x: width * 0.5, y: height * 0.72, r: 22, icon: '🌸' },
    ];

    let draggedStoneId: number | null = null;
    let isRaking = false;
    let lastX = 0;
    let lastY = 0;
    let stepCount = 0;

    const drawZenRipples = (x: number, y: number, r: number) => {
      if (!trailCtx) return;
      trailCtx.save();
      trailCtx.strokeStyle = 'rgba(217, 180, 112, 0.22)';
      trailCtx.lineWidth = 2;
      for (let i = 1; i <= 5; i++) {
        trailCtx.beginPath();
        trailCtx.arc(x, y, r + i * 8, 0, Math.PI * 2);
        trailCtx.stroke();
      }
      trailCtx.restore();
    };

    stones.forEach((s) => drawZenRipples(s.x, s.y, s.r));

    const drawRakeLine = (x1: number, y1: number, x2: number, y2: number) => {
      if (!trailCtx) return;
      trailCtx.save();
      const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
      const prongs = [-16, -8, 0, 8, 16];

      prongs.forEach((offset) => {
        const ox = Math.cos(angle) * offset;
        const oy = Math.sin(angle) * offset;

        // Sand groove highlight
        trailCtx.beginPath();
        trailCtx.moveTo(x1 + ox, y1 + oy);
        trailCtx.lineTo(x2 + ox, y2 + oy);
        trailCtx.strokeStyle = 'rgba(245, 212, 145, 0.45)';
        trailCtx.lineWidth = 3.5;
        trailCtx.stroke();

        // Sand groove shadow
        trailCtx.beginPath();
        trailCtx.moveTo(x1 + ox + 1, y1 + oy + 1.5);
        trailCtx.lineTo(x2 + ox + 1, y2 + oy + 1.5);
        trailCtx.strokeStyle = 'rgba(10, 11, 16, 0.65)';
        trailCtx.lineWidth = 2;
        trailCtx.stroke();
      });
      trailCtx.restore();
    };

    const getCanvasPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: Math.max(5, Math.min(width - 5, clientX - rect.left)),
        y: Math.max(5, Math.min(height - 5, clientY - rect.top)),
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasPos(e);
      lastX = x;
      lastY = y;

      const stone = stones.find((s) => {
        const dx = x - s.x;
        const dy = y - s.y;
        return Math.sqrt(dx * dx + dy * dy) <= s.r + 12;
      });

      if (stone) {
        draggedStoneId = stone.id;
        playSound('click');
      } else {
        isRaking = true;
        playSound('tick');
      }
      incrementCalmStat('clicks');
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasPos(e);

      if (draggedStoneId !== null) {
        const stone = stones.find((s) => s.id === draggedStoneId);
        if (stone) {
          stone.x = x;
          stone.y = y;
          drawZenRipples(x, y, stone.r);
        }
      } else if (isRaking) {
        const dist = Math.hypot(x - lastX, y - lastY);
        if (dist > 3) {
          drawRakeLine(lastX, lastY, x, y);
          lastX = x;
          lastY = y;

          stepCount++;
          if (stepCount % 5 === 0) {
            playSound('tick');
          }
        }
      }
    };

    const handleEnd = () => {
      if (draggedStoneId !== null) {
        const stone = stones.find((s) => s.id === draggedStoneId);
        if (stone) drawZenRipples(stone.x, stone.y, stone.r);
        playSound('pop');
      }
      draggedStoneId = null;
      isRaking = false;
    };

    const draw = () => {
      // Base Zen Garden Background
      ctx.fillStyle = '#161720';
      ctx.fillRect(0, 0, width, height);

      // Fine Zen sand texture dots
      ctx.fillStyle = '#222433';
      for (let sx = 12; sx < width; sx += 24) {
        for (let sy = 12; sy < height; sy += 24) {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render persistent raked sand trails
      ctx.drawImage(trailCanvas, 0, 0);

      // Render Zen Stones
      stones.forEach((s) => {
        ctx.save();

        // Stone shadow
        ctx.beginPath();
        ctx.arc(s.x + 4, s.y + 6, s.r + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 12;
        ctx.fill();

        // Stone body gradient
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, 2, s.x, s.y, s.r);
        grad.addColorStop(0, '#475569');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Icon inside stone
        ctx.font = `${s.r * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.icon, s.x, s.y + 1);

        ctx.restore();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

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

  // Fidget 8: Viscous Neon Liquid Puddle (Flaque) Canvas Loop
  useEffect(() => {
    if (activeTab !== 'slime' || !slimeCanvasRef.current) return;
    const canvas = slimeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 600);
    let height = (canvas.height = 360);

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 360;
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    // Liquid Puddle Control Points
    const numPoints = 32;
    interface PuddlePoint {
      angle: number;
      baseR: number;
      r: number;
      v: number;
      x: number;
      y: number;
    }

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.32;

    let points: PuddlePoint[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * Math.PI * 2) / numPoints;
      const baseR = baseRadius + Math.sin(i * 3) * 10;
      points.push({
        angle,
        baseR,
        r: baseR,
        v: 0,
        x: cx + Math.cos(angle) * baseR,
        y: cy + Math.sin(angle) * baseR,
      });
    }

    // Splash Droplet Particles
    interface Droplet {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      life: number;
    }
    let droplets: Droplet[] = [];

    let isTouching = false;
    let touchX = cx;
    let touchY = cy;
    let lastTouchX = cx;
    let lastTouchY = cy;

    const spawnDroplets = (x: number, y: number) => {
      const colors = ['#00f5ff', '#ff007f', '#ff4f00', '#a855f7'];
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4 + 2;
        droplets.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          r: Math.random() * 5 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
        });
      }
    };

    const getCanvasPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: Math.max(10, Math.min(width - 10, clientX - rect.left)),
        y: Math.max(10, Math.min(height - 10, clientY - rect.top)),
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isTouching = true;
      const { x, y } = getCanvasPos(e);
      touchX = x;
      touchY = y;
      lastTouchX = x;
      lastTouchY = y;

      // Ripple disturbance at click
      points.forEach((p) => {
        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          p.v += (100 - dist) * 0.25;
        }
      });

      playSound('sweep');
      incrementCalmStat('clicks');
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isTouching) return;
      const { x, y } = getCanvasPos(e);

      const speed = Math.hypot(x - lastTouchX, y - lastTouchY);
      if (speed > 15) {
        spawnDroplets(x, y);
      }

      touchX = x;
      touchY = y;
      lastTouchX = x;
      lastTouchY = y;
    };

    const handleEnd = () => {
      if (isTouching) playSound('pop');
      isTouching = false;
    };

    const draw = () => {
      ctx.fillStyle = '#07080d';
      ctx.fillRect(0, 0, width, height);

      // Puddle Points Spring & Neighbor Wave Physics
      const centerCurrentX = width / 2;
      const centerCurrentY = height / 2;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Interaction pull towards cursor
        if (isTouching) {
          const dx = touchX - p.x;
          const dy = touchY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const pull = (120 - dist) * 0.18;
            p.v += pull;
          }
        }

        // Spring force towards resting baseR
        const displacement = p.r - p.baseR;
        const springForce = -0.14 * displacement;
        p.v += springForce;
        p.v *= 0.84; // Damping
        p.r += p.v;

        // Recalculate Cartesian position
        p.x = centerCurrentX + Math.cos(p.angle) * p.r;
        p.y = centerCurrentY + Math.sin(p.angle) * p.r;
      }

      // Smooth neighbor coupling (propagation of liquid wobble wave)
      for (let i = 0; i < points.length; i++) {
        const prev = points[(i - 1 + points.length) % points.length];
        const next = points[(i + 1) % points.length];
        const avg = (prev.r + next.r) / 2;
        points[i].r += (avg - points[i].r) * 0.08;
      }

      // Draw Main Liquid Puddle (Flaque)
      ctx.save();
      ctx.beginPath();
      const firstMidX = (points[0].x + points[points.length - 1].x) / 2;
      const firstMidY = (points[0].y + points[points.length - 1].y) / 2;
      ctx.moveTo(firstMidX, firstMidY);

      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }
      ctx.closePath();

      // Viscous Liquid Puddle Gradient Fill
      const puddleGrad = ctx.createRadialGradient(
        centerCurrentX - 40,
        centerCurrentY - 40,
        10,
        centerCurrentX,
        centerCurrentY,
        baseRadius * 1.4
      );
      puddleGrad.addColorStop(0, '#00f5ff');
      puddleGrad.addColorStop(0.4, '#ff007f');
      puddleGrad.addColorStop(0.8, '#ff4f00');
      puddleGrad.addColorStop(1, '#6b21a8');

      ctx.fillStyle = puddleGrad;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 24;
      ctx.fill();

      // Liquid Gloss Sheen Highlight
      ctx.beginPath();
      ctx.ellipse(
        centerCurrentX - baseRadius * 0.3,
        centerCurrentY - baseRadius * 0.3,
        baseRadius * 0.4,
        baseRadius * 0.18,
        -Math.PI / 6,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.restore();

      // Render and update Splash Droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.2; // Gravity
        d.life -= 0.03;

        if (d.life <= 0) {
          droplets.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.life;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

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

  // Fidget 9: Marble Maze Canvas Loop
  useEffect(() => {
    if (activeTab !== 'maze' || !mazeCanvasRef.current) return;
    const canvas = mazeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 600);
    let height = (canvas.height = 360);

    const resizeHandler = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = canvas.width = parent.clientWidth;
        height = canvas.height = 360;
      }
    };
    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    let marble = { x: 65, y: 65, vx: 0, vy: 0, r: 13 };

    const walls = [
      [15, 15, width - 30, 10],
      [15, height - 25, width - 30, 10],
      [15, 15, 10, height - 30],
      [width - 25, 15, 10, height - 30],

      [110, 15, 12, 170],
      [210, 130, 12, 200],
      [110, 270, 110, 12],
      [310, 15, 12, 200],
      [410, 130, 12, 200],
      [310, 270, 110, 12],
    ];

    const goal = { x: width - 65, y: height - 65, r: 22 };
    let isDragging = false;
    let soundCooldown = 0;

    const resetMarble = () => {
      marble.x = 65;
      marble.y = 65;
      marble.vx = 0;
      marble.vy = 0;
    };

    const getCanvasPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasPos(e);
      const dx = x - marble.x;
      const dy = y - marble.y;
      if (Math.hypot(dx, dy) < marble.r + 20) {
        isDragging = true;
      } else {
        marble.vx += (x - marble.x) * 0.05;
        marble.vy += (y - marble.y) * 0.05;
      }
      playSound('click');
      incrementCalmStat('clicks');
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getCanvasPos(e);
      if (isDragging) {
        marble.vx = (x - marble.x) * 0.35;
        marble.vy = (y - marble.y) * 0.35;
      }
    };

    const handleEnd = () => {
      isDragging = false;
    };

    const draw = () => {
      ctx.fillStyle = '#0d0e14';
      ctx.fillRect(0, 0, width, height);

      marble.vx *= 0.95;
      marble.vy *= 0.95;

      let nextX = marble.x + marble.vx;
      let nextY = marble.y + marble.vy;

      soundCooldown++;
      walls.forEach(([wx, wy, ww, wh]) => {
        if (
          nextX + marble.r > wx &&
          nextX - marble.r < wx + ww &&
          nextY + marble.r > wy &&
          nextY - marble.r < wy + wh
        ) {
          if (marble.x + marble.r <= wx || marble.x - marble.r >= wx + ww) {
            marble.vx *= -0.7;
            nextX = marble.x;
          }
          if (marble.y + marble.r <= wy || marble.y - marble.r >= wy + wh) {
            marble.vy *= -0.7;
            nextY = marble.y;
          }
          if (soundCooldown > 8 && Math.hypot(marble.vx, marble.vy) > 0.4) {
            playSound('tick');
            soundCooldown = 0;
          }
        }
      });

      marble.x = nextX;
      marble.y = nextY;

      if (Math.hypot(goal.x - marble.x, goal.y - marble.y) < goal.r) {
        playSound('pop');
        incrementCalmStat('pops');
        resetMarble();
      }

      // Draw Goal Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(goal.x, goal.y, goal.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', goal.x, goal.y);
      ctx.restore();

      // Draw Maze Walls
      ctx.save();
      walls.forEach(([wx, wy, ww, wh]) => {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.strokeRect(wx, wy, ww, wh);
      });
      ctx.restore();

      // Draw Metallic Marble
      ctx.save();
      ctx.beginPath();
      ctx.arc(marble.x + 3, marble.y + 4, marble.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(marble.x, marble.y, marble.r, 0, Math.PI * 2);
      const mGrad = ctx.createRadialGradient(
        marble.x - marble.r * 0.3,
        marble.y - marble.r * 0.3,
        2,
        marble.x,
        marble.y,
        marble.r
      );
      mGrad.addColorStop(0, '#ffffff');
      mGrad.addColorStop(0.3, '#cbd5e1');
      mGrad.addColorStop(1, '#334155');
      ctx.fillStyle = mGrad;
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

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

  const renderSand = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
            <span>⌛ Sable Kinétique &amp; Jardin Zen</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Râteau le sable pour dessiner des sillons apaisants ou déplace les galets zen.</p>
        </div>

        <button
          onClick={() => {
            if (sandResetRef.current) sandResetRef.current();
            playSound('sweep');
            incrementCalmStat('clicks');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shadow-md self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Lisser le Sable
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#161720] border border-white/10">
        <canvas ref={sandCanvasRef} className="w-full block bg-[#161720] cursor-crosshair" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  const renderSlime = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
            <span>🧪 Fluide Néon Tactile (Slime)</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Glisse ton doigt ou ta souris pour déformer, étirer et fusionner le fluide visqueux.</p>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#07080d] border border-white/10">
        <canvas ref={slimeCanvasRef} className="w-full block bg-[#07080d] cursor-pointer" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  const renderMaze = () => (
    <div className="bg-spoolio-card border border-[#1f1f23] p-5 sm:p-6 rounded-[28px] max-w-2xl mx-auto animate-fade-in w-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800 select-none">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
            <span>🌀 Labyrinthe à Bille 2D</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Attrape la bille métallique ou clique pour la guider jusqu&apos;à la cible 🎯.</p>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#0d0e14] border border-white/10">
        <canvas ref={mazeCanvasRef} className="w-full block bg-[#0d0e14] cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 relative">
      {/* Sub tabs selector aligned with top tabs style and margins */}
      <div className="w-full max-w-3xl mx-auto mb-8 select-none">
        <div className="p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-3xl flex overflow-x-auto scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-4 md:grid-cols-8 gap-1.5 shadow-xl">
          <button
            onClick={() => handleTabTransition('switchboard')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'switchboard' ? 'bg-[#005cff] text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tableau
          </button>

          <button
            onClick={() => handleTabTransition('spinner')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'spinner' ? 'bg-[#005cff] text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Spinner
          </button>

          <button
            onClick={() => handleTabTransition('gears')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'gears' ? 'bg-pink-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Engrenages
          </button>

          <button
            onClick={() => handleTabTransition('bubblewrap')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'bubblewrap' ? 'bg-pink-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bulle Pop
          </button>

          <button
            onClick={() => handleTabTransition('particles')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'particles' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Particules
          </button>

          <button
            onClick={() => handleTabTransition('elastic')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'elastic' ? 'bg-cyan-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Élastique
          </button>

          <button
            onClick={() => handleTabTransition('sand')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'sand' ? 'bg-amber-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sable Zen
          </button>

          <button
            onClick={() => handleTabTransition('slime')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'slime' ? 'bg-purple-500 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Slime Néon
          </button>

          <button
            onClick={() => handleTabTransition('maze')}
            className={`shrink-0 snap-center min-w-[85px] sm:min-w-0 sm:w-full py-2.5 px-1 rounded-2xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 cursor-pointer outline-none text-center truncate flex items-center justify-center ${
              activeTab === 'maze' ? 'bg-emerald-500 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Labyrinthe
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
        {activeTab === 'sand' && renderSand()}
        {activeTab === 'slime' && renderSlime()}
        {activeTab === 'maze' && renderMaze()}
      </div>
    </div>
  );
}
