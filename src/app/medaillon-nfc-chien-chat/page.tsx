import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLdScript";
import { getProductJsonLd, getBreadcrumbJsonLd } from "@/lib/jsonLd";
import { ShieldCheck, Zap, Phone, Heart, Award, ArrowRight, CheckCircle2, Lock, BatteryCharging, Sparkles, MapPin, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL("https://spoolio.fr"),
  title: "Médaillon NFC pour Chien, Chat & Porte-Clés SOS Enfant | Spoolio",
  description:
    "Le médaillon connecté NFC pour animaux et enfants. Un simple scan de smartphone permet d'appeler immédiatement le propriétaire. Sans batterie, sans abonnement, résine brillante ultra-résistante, fabriqué en France.",
  alternates: {
    canonical: "https://spoolio.fr/medaillon-nfc-chien-chat",
  },
  openGraph: {
    title: "Médaillon NFC Chien, Chat & Porte-Clés SOS Enfant | Spoolio",
    description: "La médaille connectée sécurité pour vos animaux & proches. Un scan de smartphone suffit.",
    url: "https://spoolio.fr/medaillon-nfc-chien-chat",
    type: "website",
  },
};

const SPOOLIO_ORANGE = "#ff4f00";
const SPOOLIO_BLUE = "#2F3CD9";

export default function MedaillonNfcLandingPage() {
  const productLd = getProductJsonLd({
    name: "Médaillon NFC Chien, Chat & Porte-Clés SOS Enfant",
    description:
      "Médaillon connecté NFC personnalisé avec résine transparente protectrice. Un scan de smartphone permet de contacter le propriétaire immédiatement.",
    slug: "medaillon-nfc-chien-chat",
    price: 7.0,
    ratingValue: 5.0,
    reviewCount: 32,
  });

  const breadcrumbLd = getBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Boutique", url: "/boutique" },
    { name: "Médaillon NFC Chien, Chat & SOS Enfant", url: "/medaillon-nfc-chien-chat" },
  ]);

  const testimonials = [
    {
      name: "Cyntia",
      rating: 5,
      text: "Je n'osais plus faire sortir mon chat qui avait pris l'habitude d'explorer trop loin. Avec ce médaillon, je suis rassurée. Au moins si quelqu'un le trouve, on pourra m'appeler facilement !",
      tag: "Propriétaire de Chat 🐱",
    },
    {
      name: "Quentin",
      rating: 5,
      text: "Pour notre Jack Russel qui se sauve dès qu'on ouvre le portail, c'est hyper utile. Et en plus il fait le fier avec sa médaille colorée !",
      tag: "Propriétaire de Chien 🐶",
    },
    {
      name: "Guillaume",
      rating: 5,
      text: "Idée géniale ! Notre chat a des problèmes de santé et un traitement spécifique. Au moins si quelqu'un le recueille, les consignes médicales sont affichées direct.",
      tag: "Santé & Secours 🏥",
    },
    {
      name: "Orianne",
      rating: 5,
      text: "Je n'osais pas lâcher mon chien en balade par peur qu'il s'éloigne. Là au moins, s'il s'enfuit et que quelqu'un le voit, la personne scanne et m'appelle immédiatement.",
      tag: "Balades en sécurité 🌲",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Commandez votre médaillon",
      desc: "Choisissez la couleur, le modèle et la forme adaptée à votre compagnon ou porte-clés.",
      icon: "🎁",
    },
    {
      num: "02",
      title: "Remplissez votre fiche SOS",
      desc: "Créez votre profil en 2 minutes : téléphones, contacts urgence, groupe sanguin, infos médicales & véto.",
      icon: "📝",
    },
    {
      num: "03",
      title: "Un scan suffit en cas de besoin",
      desc: "Toute personne qui retrouve votre animal approche simplement son smartphone du médaillon.",
      icon: "📱",
    },
    {
      num: "04",
      title: "Mise en relation directe",
      desc: "Un bouton permet d'appeler directement le propriétaire pour organiser le retour en sécurité.",
      icon: "📞",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0e0e12] text-white font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-black overflow-x-hidden">
      <JsonLdScript data={productLd} id="medaillon-nfc-product-jsonld" />
      <JsonLdScript data={breadcrumbLd} id="medaillon-nfc-breadcrumb-jsonld" />

      {/* Decorative Glow Halos */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ backgroundColor: "rgba(255, 79, 0, 0.12)", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[35%] left-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ backgroundColor: "rgba(47, 60, 217, 0.15)", filter: "blur(140px)" }}
        />
        <div
          className="absolute top-[70%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ backgroundColor: "rgba(255, 79, 0, 0.1)", filter: "blur(140px)" }}
        />
      </div>

      {/* Header */}
      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1250px] mx-auto w-full" />

      {/* Ticker Banner */}
      <div className="w-full bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#2F3CD9] py-2 text-center text-xs font-black uppercase tracking-widest text-white z-20 shadow-md">
        <span>🔐 SÉCURITÉ SANS ABONNEMENT · SANS BATTERIE · FABRICATIVE EN FRANCE 🇫🇷</span>
      </div>

      <main className="w-full max-w-[1250px] px-4 py-12 relative z-10 space-y-20">

        {/* ═══ SECTION 1: HERO MARKETING ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff4f00]/15 border border-[#ff4f00]/30 text-[#ff4f00] text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Médaillon Connecté NFC · Spoolio Protect</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)] leading-[1.05]">
              Le médaillon NFC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f00] via-[#FF8800] to-amber-300">
                qui ramène votre compagnon à la maison
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-sans leading-relaxed">
              Un chien qui fugue, un chat qui s&apos;éloigne, un enfant égaré... Un simple scan de smartphone sur le médaillon permet de vous <strong className="text-white">contacter immédiatement</strong>. Sans batterie, sans application, sans abonnement.
            </p>

            {/* Badges Arguments Reassurance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs font-bold text-gray-200">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <BatteryCharging className="w-4 h-4 text-[#ff4f00]" />
                <span>Sans Batterie</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Sans Abonnement</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Scan Instantané</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                href="/product/medaillon-nfc-chien-et-chat"
                className="h-14 px-8 bg-gradient-to-r from-[#ff4f00] via-[#ff6600] to-[#ff4f00] hover:from-[#e04500] hover:to-[#ff4f00] text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,79,0,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Je sécurise mon animal (à partir de 7,00€)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#comment-ca-marche"
                className="h-14 px-6 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center transition-colors"
              >
                Comment ça marche ? ↓
              </a>
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#16161f] to-[#0d0d12] p-4 shadow-2xl group">
              <Image
                src="/images/imported/Spoolio-badge-nfc-securite-7-scaled.webp"
                alt="Médaillon NFC Spoolio pour chien et chat"
                fill
                priority
                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 no-invert"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-widest mb-1">
                  Résine brillante protectrice anti-rayures
                </span>
                <h3 className="text-xl font-extrabold text-white">Médaillon Spoolio Protect ⚡️</h3>
                <p className="text-xs text-gray-300 mt-1">Imprimé en 3D à Comines (Nord) en PLA végétal bio-sourcé</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: PORTEUR DE VALEUR / PORTE-CLÉ & MÉDAILLE ═══ */}
        <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-[#ff4f00] tracking-widest">
              Un seul médaillon · Plusieurs usages de sécurité
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)]">
              Une protection indispensable pour chiens, chats & enfants
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Que ce soit sur le collier de votre animal ou accroché au sac d&apos;école de votre enfant, le médaillon NFC Spoolio offre une réponse immédiate et rassurante en cas d&apos;imprévu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#ff4f00]/50 transition-colors">
              <div className="text-4xl mb-2">🐕</div>
              <h3 className="text-lg font-black text-white">Pour les chiens</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Parfait pour les balades en forêt, le rappel incertain ou les fugues imprévues. Accrochage solide par anneau mousqueton.
              </p>
            </div>

            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#ff4f00]/50 transition-colors">
              <div className="text-4xl mb-2">🐱</div>
              <h3 className="text-lg font-black text-white">Pour les chats</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Léger, silencieux et discret sur le collier. Permet de préciser les traitements médicaux et régimes alimentaires du chat.
              </p>
            </div>

            <div className="bg-[#14141a] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#ff4f00]/50 transition-colors">
              <div className="text-4xl mb-2">🎒</div>
              <h3 className="text-lg font-black text-white">Porte-clés SOS Enfant</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Accroché au cartable ou blouson. Permet aux secours ou adultes d&apos;appeler immédiatement les parents en cas de perte dans la foule.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: COMMENT CA MARCHE (4 ETAPES) ═══ */}
        <section id="comment-ca-marche" className="space-y-10 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-widest">
              Simple · Rapide · Sans abonnement
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)]">
              Comment fonctionne le médaillon NFC ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left relative flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="font-mono text-2xl font-black text-white/20">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 4: TABLEAU COMPARATIF NFC vs GPS ═══ */}
        <section className="bg-gradient-to-r from-[#2F3CD9]/20 via-[#14141f] to-[#ff4f00]/15 border border-white/15 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-widest">
              Le comparatif clair & honnête
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)]">
              Pourquoi choisir un médaillon NFC plutôt qu&apos;un traceur GPS ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className="bg-[#121217] border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" />
                <span>Médaillon NFC Spoolio</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-200">
                <li className="flex items-center gap-2">✓ <strong>Pas de batterie</strong> : toujours prêt, zéro panne.</li>
                <li className="flex items-center gap-2">✓ <strong>Zéro abonnement</strong> : vous payez une seule fois à l&apos;achat.</li>
                <li className="flex items-center gap-2">✓ <strong>Léger & compact</strong> : aucun gêne pour l&apos;animal.</li>
                <li className="flex items-center gap-2">✓ <strong>Résistant à l&apos;eau</strong> : résine brillante haute protection.</li>
                <li className="flex items-center gap-2">✓ <strong>Scan universel</strong> : fonctionne avec tout smartphone.</li>
              </ul>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 space-y-4 opacity-70">
              <div className="flex items-center gap-2 text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                <AlertCircle className="w-5 h-5" />
                <span>Traceur GPS Classique</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-400">
                <li className="flex items-center gap-2">✗ Nécessite une recharge tous les 2 à 5 jours.</li>
                <li className="flex items-center gap-2">✗ Abonnement mensuel obligatoire (3€ à 8€ / mois).</li>
                <li className="flex items-center gap-2">✗ Volumineux et lourd sur le cou.</li>
                <li className="flex items-center gap-2">✗ Sensible aux chocs et à l&apos;immersion.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 5: RETOURS ET TESTEURS ═══ */}
        <section className="space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-[#ff4f00] tracking-widest">
              Témoignages & Avis Clients
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-[family-name:var(--font-antonio)]">
              Les retours des propriétaires
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3 font-sans relative">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{t.name}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-amber-300">
                    {t.tag}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 6: FINAL BUY CTA CARD ═══ */}
        <section className="bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#FF8800] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-white/80">
              Offre de Lancement Spoolio Protect
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-[family-name:var(--font-antonio)]">
              Commandez votre médaillon NFC dès 7,00€
            </h2>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Fabriqué artisanalement en France dans notre atelier à Comines (Nord). Livré avec attache mousqueton et fiche SOS modifiable à vie.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/product/medaillon-nfc-chien-et-chat"
              className="h-14 px-8 bg-white text-black hover:bg-gray-100 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
            >
              <span>Personnaliser ma médaille 🐾</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer className="w-full mt-20" />
    </div>
  );
}
