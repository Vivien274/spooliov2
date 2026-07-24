'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SensoryFilter from '@/components/boussole/SensoryFilter';
import FidgetCard from '@/components/boussole/FidgetCard';
import DigitalFidgets from '@/components/boussole/DigitalFidgets';
import BreathingGuide from '@/components/boussole/BreathingGuide';
import FidgetProfiler from '@/components/boussole/FidgetProfiler';
import { FidgetProduct, SensoryCategory } from '@/types/boussole';
import { Sparkles, LayoutGrid, Brain, Gamepad2, Wind, Heart, Zap } from 'lucide-react';

const products: FidgetProduct[] = [
  {
    id: 'porte-cle-clavier-mecanique',
    name: 'Porte-clé Clavier Mécanique',
    category: 'cliquer',
    description: 'Le clic-clic franc et ultra tactile d\'un véritable switch mécanique de clavier de jeu. La référence ultime pour calmer le besoin de presser.',
    price: '5.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/porte-cle-clavier-mecanique/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/01/Spoolio_Porte-Cle-clavier-mecanique-7.jpg',
    noiseLevel: 'high',
    size: 'pocket',
    profiles: ['tdah', 'focus']
  },
  {
    id: 'fidget-twist',
    name: 'Fidget "Twist"',
    category: 'manipuler',
    description: 'Un mouvement hélicoïdal fascinant : fais monter et descendre la bague le long de sa spirale 3D. Idéal pour concentrer l\'attention et les yeux.',
    price: '3.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/fidget-twist/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/12/Spoolio-fidget-twist-2-scaled.webp',
    noiseLevel: 'silent',
    size: 'medium',
    profiles: ['anxiety', 'autism']
  },
  {
    id: 'fidget-cube-articule',
    name: 'Fidget Cube Articulé',
    category: 'manipuler',
    description: 'Plie, tourne et replie ce cube infini. Totalement silencieux, il s\'occupe de tes doigts pendant les réunions ou les cours sans faire de bruit.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/fidget-cube-articule/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/12/Spoolio-fidget-cubes-2-scaled.webp',
    noiseLevel: 'low',
    size: 'medium',
    profiles: ['tdah', 'focus', 'autism']
  },
  {
    id: 'fidget-bague-rotative',
    name: 'Fidget Bague Rotative',
    category: 'manipuler',
    description: 'Porte-la au doigt et fais-la tourner discrètement à l\'infini. Le fidget le plus discret pour évacuer le stress n\'importe où.',
    price: '3.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/fidget-bague-rotative/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/12/Spoolio-fidget-bague-rotative-5-scaled.webp',
    noiseLevel: 'silent',
    size: 'pocket',
    profiles: ['anxiety', 'tdah']
  },
  {
    id: 'fidget-engrenages-mecanique',
    name: 'Fidget Engrenage Mécanique',
    category: 'resoudre',
    description: 'Le plaisir brut d\'engrenages imbriqués à manipuler. Fais tourner les engrenages pour ressentir le retour mécanique et canaliser ton attention.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/fidget-engrenages-mecanique/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/12/Spoolio-fidget-mecanique-engrenage-2-scaled.webp',
    noiseLevel: 'low',
    size: 'medium',
    profiles: ['focus', 'tdah']
  },
  {
    id: 'fidget-boule-piquante',
    name: 'Fidget Boule Piquante',
    category: 'caresser',
    description: 'Des dizaines de petits pics d\'acupression stimulants. Masse, roule et fais glisser tes doigts sur ses reliefs pour relâcher instantanément les tensions.',
    price: '3.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/fidget-boule-piquante/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/12/Spoolio-fidget-sensoriel-boule-3-scaled.webp',
    noiseLevel: 'silent',
    size: 'pocket',
    profiles: ['anxiety', 'autism']
  },
  {
    id: 'serpent-articule',
    name: 'Serpent Articulé',
    category: 'manipuler',
    description: 'Un long corps sinueux entièrement articulé qui ondule et se contorsionne de façon hypnotique dans tes mains. Un incontournable pour libérer les tensions motrices.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/serpent-articule/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/01/Spoolio-Serpent-articule-11-scaled.jpg',
    noiseLevel: 'low',
    size: 'large',
    profiles: ['tdah', 'autism']
  },
  {
    id: 'gadgetoids-robot-transformable',
    name: 'Gadgetoids™ Robot Transformable',
    category: 'resoudre',
    description: 'Un mini robot geek transformable inspiré des objets tech rétro des années 90. Manipule ses articulations pour le métamorphoser et stimuler ton focus.',
    price: '12.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/gadgetoids-robot-transformable/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2026/02/Gadgetoids-detail-scaled.jpg',
    noiseLevel: 'low',
    size: 'medium',
    profiles: ['focus', 'tdah']
  },
  {
    id: 'clicker-coeur',
    name: 'Clicker Cœur',
    category: 'cliquer',
    description: 'Un adorable clicker en forme de cœur imprimé en 3D. Presse-le à l\'infini pour un retour tactile "clicky" hyper satisfaisant et rassurant.',
    price: '3.40€',
    wooCommerceUrl: 'https://spoolio.fr/produit/clicker-coeur/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2026/01/Spoolio-St-Valentin-clicker-coeur-2.webp',
    noiseLevel: 'medium',
    size: 'pocket',
    profiles: ['anxiety', 'focus']
  },
  {
    id: 'clicker-toilettes-bureau',
    name: 'Clicker Toilettes de Bureau',
    category: 'cliquer',
    description: 'Le mini trône anti-stress par excellence ! Un clicker insolite en forme de toilettes de bureau pour décompresser avec humour pendant les heures de travail.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/clicker-toilettes-bureau/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/11/Spoolio_SecretSanta-Clicker-Toilette-4-scaled.webp',
    noiseLevel: 'medium',
    size: 'pocket',
    profiles: ['focus', 'tdah']
  },
  {
    id: 'clicker-mug-chocolat-chaud',
    name: 'Clicker Mug Chocolat Chaud',
    category: 'cliquer',
    description: 'Une tasse de chocolat chaud réconfortante à cliquer sans modération ! Le fidget le plus mignon pour occuper tes doigts tout en restant au chaud.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/clicker-mug-chocolat-chaud/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/01/Spoolio_Clicker-mug-1.jpeg',
    noiseLevel: 'medium',
    size: 'pocket',
    profiles: ['anxiety', 'autism']
  },
  {
    id: 'caca-fidget',
    name: 'Caca Fidget',
    category: 'manipuler',
    description: 'Le fidget le plus rigolo ! Ce petit caca doté d\'une bouille amusante tourne entre tes doigts pour combiner relaxation mécanique et éclats de rire.',
    price: '4.00€',
    wooCommerceUrl: 'https://spoolio.fr/produit/caca-fidget/',
    imageUrl: 'https://i0.wp.com/spoolio.fr/wp-content/uploads/2025/01/Spoolio-Caca_Fidget-6.jpg',
    noiseLevel: 'silent',
    size: 'pocket',
    profiles: ['tdah', 'focus']
  }
];

const categoryHeadings = {
  cliquer: '🎯 Ta dose de clics tactiles immédiate :',
  manipuler: '🌀 Pour t\'occuper les mains de façon fluide :',
  resoudre: '🧩 Un défi logique pour canaliser ton attention :',
  caresser: '🌿 Un retour tactile doux et apaisant :',
};

type AppTab = 'compass' | 'profiler' | 'digital' | 'breathing';

export default function BoussoleSensoriellePage() {
  const [activeTab, setActiveTab] = useState<AppTab>('compass');
  const [selectedCategory, setSelectedCategory] = useState<SensoryCategory | null>(null);
  const [virtualClicks, setVirtualClicks] = useState<number>(0);
  const [clickScale, setClickScale] = useState<boolean>(false);

  const [stats, setStats] = useState({
    clicks: 0,
    pops: 0,
    twangs: 0,
    breathingSeconds: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spoolio_calm_stats');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStats(parsed);
          setVirtualClicks(parsed.clicks || 0);
        }
      } catch (e) {}

      const handleStatsUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
          setStats(customEvent.detail);
          setVirtualClicks(customEvent.detail.clicks || 0);
        }
      };

      window.addEventListener('calm-stats-updated', handleStatsUpdate);
      return () => {
        window.removeEventListener('calm-stats-updated', handleStatsUpdate);
      };
    }
  }, []);

  const handleSelectCategory = (category: SensoryCategory | null) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setSelectedCategory(category);
      });
    } else {
      setSelectedCategory(category);
    }
  };

  const handleVirtualClick = () => {
    setVirtualClicks((prev) => prev + 1);
    setClickScale(true);

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('spoolio_calm_stats');
        const currentStats = saved ? JSON.parse(saved) : { clicks: 0, pops: 0, twangs: 0, breathingSeconds: 0 };
        currentStats.clicks = (currentStats.clicks || 0) + 1;
        localStorage.setItem('spoolio_calm_stats', JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('calm-stats-updated', { detail: currentStats }));
      } catch (e) {}
    }
    
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.setValueAtTime(350, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.04);
      } catch (e) {}
    }

    setTimeout(() => setClickScale(false), 80);
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center overflow-x-hidden">
      <Header />

      {/* Hero Header */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-16 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF5500]/30 bg-[#FF5500]/10 text-xs font-bold text-[#FF5500] select-none">
            <Sparkles className="w-4 h-4" />
            <span>BOUSSOLE SENSORIELLE &amp; DIAGNOSTIC FIDGETS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-[family-name:var(--font-antonio)]">
            De quoi tes mains ont-elles besoin{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-amber-300 to-pink-500">
              là, tout de suite ?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Trouve ton objet idéal imprimé en 3D biosourcé ou amuse-toi directement avec nos fidgets tactiles interactifs en ligne.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleVirtualClick}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-900/80
                hover:border-[#FF5500] hover:text-[#FF5500] transition-all duration-100 cursor-pointer
                active:scale-95 text-xs font-bold uppercase tracking-wider
                ${clickScale ? 'scale-90 bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]' : 'text-neutral-300'}
              `}
              title="Clicker rapide anti-stress"
            >
              <Zap className={`w-4 h-4 ${clickScale ? 'fill-current' : ''}`} />
              <span>Quick Clicker Anti-Stress</span>
              <span className="bg-black px-2 py-0.5 rounded-md font-mono text-xs text-white border border-neutral-800">
                {virtualClicks}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Switcher Tabs */}
        <div className="flex justify-center mb-12 select-none">
          <div className="inline-flex p-1.5 bg-neutral-900/80 border border-neutral-800 rounded-3xl flex-wrap justify-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('compass')}
              className={`
                flex items-center gap-2 py-3 px-5 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase
                transition-all duration-300 cursor-pointer
                ${
                  activeTab === 'compass'
                    ? 'bg-[#FF5500] text-black font-extrabold shadow-lg shadow-[#FF5500]/25'
                    : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>🧭 Trouver mon Fidget</span>
            </button>

            <button
              onClick={() => setActiveTab('profiler')}
              className={`
                flex items-center gap-2 py-3 px-5 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase
                transition-all duration-300 cursor-pointer
                ${
                  activeTab === 'profiler'
                    ? 'bg-violet-600 text-white font-extrabold shadow-lg shadow-violet-600/25'
                    : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <Brain className="w-4 h-4" />
              <span>🎯 Diagnostic (30s)</span>
            </button>

            <button
              onClick={() => setActiveTab('digital')}
              className={`
                flex items-center gap-2 py-3 px-5 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase
                transition-all duration-300 cursor-pointer
                ${
                  activeTab === 'digital'
                    ? 'bg-pink-600 text-white font-extrabold shadow-lg shadow-pink-600/25'
                    : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🕹️ Fidgets Numériques</span>
            </button>

            <button
              onClick={() => setActiveTab('breathing')}
              className={`
                flex items-center gap-2 py-3 px-5 sm:px-6 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase
                transition-all duration-300 cursor-pointer
                ${
                  activeTab === 'breathing'
                    ? 'bg-cyan-500 text-black font-extrabold shadow-lg shadow-cyan-500/25'
                    : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <Wind className="w-4 h-4" />
              <span>🫁 Respiration Zen</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Compass Products */}
        {activeTab === 'compass' && (
          <div className="space-y-12 animate-fade-in">
            <section>
              <SensoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 max-w-5xl mx-auto select-none">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {selectedCategory
                    ? categoryHeadings[selectedCategory]
                    : '✨ Sélection sensorielle Spoolio :'}
                </h2>

                <div className="text-xs font-semibold text-neutral-400">
                  {filteredProducts.length} fidget{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {filteredProducts.map((product) => (
                  <FidgetCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Profiler Quiz */}
        {activeTab === 'profiler' && (
          <section className="animate-fade-in">
            <FidgetProfiler products={products} />
          </section>
        )}

        {/* Tab 3: Digital Fidgets */}
        {activeTab === 'digital' && (
          <section className="animate-fade-in">
            <DigitalFidgets />
          </section>
        )}

        {/* Tab 4: Breathing Guide */}
        {activeTab === 'breathing' && (
          <section className="animate-fade-in">
            <BreathingGuide />
          </section>
        )}

        {/* Mon Havre de Paix Stats */}
        <section className="mt-16 border-t border-neutral-800/80 pt-12 max-w-4xl mx-auto w-full select-none text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-xs font-semibold text-pink-400 mb-4">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Mon Havre de Paix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">Ton Énergie Apaisée</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md mx-auto">
            Chaque micro-pause et chaque respiration compte.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
              <span className="text-2xl font-black text-white font-mono block">{stats.clicks}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Clics / Pressions</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
              <span className="text-2xl font-black text-white font-mono block">{stats.pops}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Bulles Éclatées</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
              <span className="text-2xl font-black text-white font-mono block">{stats.twangs}</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Tensions Élastiques</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
              <span className="text-2xl font-black text-white font-mono block">
                {Math.floor(stats.breathingSeconds / 60)}m {stats.breathingSeconds % 60}s
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Respiration Zen</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
