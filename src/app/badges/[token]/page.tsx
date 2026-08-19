import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, AlertTriangle, Tent, Globe, MessageCircle } from 'lucide-react';
import Particles from '@/components/badges/Particles';
import FicheEnfant from '@/components/badges/FicheEnfant';
import FicheAnimal from '@/components/badges/FicheAnimal';
import { getBadgeByToken } from '@/lib/badgesData';

type Props = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SPOOLIO_BLUE = '#2F3CD9';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const fiche = await getBadgeByToken(token);
  const type = fiche?.type ?? 'festivalier';
  const name =
    type === 'animal' ? fiche?.data?.nom :
    type === 'enfant' ? fiche?.data?.prenom :
    fiche?.data?.prenom;
  const suffix =
    type === 'animal' ? 'Fiche animal SOS' :
    type === 'enfant' ? 'Fiche enfant SOS' :
    'Fiche SOS Festivalier';
  return {
    title: name ? `${name} — ${suffix}` : `${suffix} — Spoolio Badge`,
    description: `${suffix} Spoolio`,
  };
}

export default async function BadgePublicPage({ params }: Props) {
  const { token } = await params;
  const fiche = await getBadgeByToken(token);

  if (!fiche) {
    // If not found in badges.json, render a clean fallback preview
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center text-white"
        style={{ background: SPOOLIO_BLUE }}
      >
        <Particles />
        <div className="bg-[#121215] border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-4">
          <div className="text-5xl">🏷️</div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Badge NFC Spoolio</h1>
          <p className="text-gray-400 text-xs leading-relaxed">
            Ce badge NFC avec jeton <span className="font-mono text-amber-400">{token}</span> n&apos;a pas encore été configuré.
          </p>
          <Link
            href={`/badges/${token}/edit`}
            className="block w-full bg-[#ff4f00] hover:bg-[#ff6600] text-black font-extrabold px-6 py-3.5 rounded-2xl transition-colors text-xs uppercase tracking-wider shadow-lg"
          >
            Activer ce badge
          </Link>
        </div>
      </main>
    );
  }

  if (!fiche.is_claimed) {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center text-white"
        style={{ background: SPOOLIO_BLUE }}
      >
        <Particles />
        <div className="bg-[#121215] border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-4">
          <div className="text-5xl">🏷️</div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Badge pas encore activé</h1>
          <p className="text-gray-400 text-xs leading-relaxed">
            Ce badge n&apos;a pas encore été configuré par son propriétaire. Si c&apos;est le tien, active-le dès maintenant !
          </p>
          <Link
            href={`/badges/${token}/edit`}
            className="block w-full bg-[#ff4f00] hover:bg-[#ff6600] text-black font-extrabold px-6 py-3.5 rounded-2xl transition-colors text-xs uppercase tracking-wider shadow-lg"
          >
            Activer mon badge
          </Link>
        </div>
      </main>
    );
  }

  const type = fiche.type ?? 'festivalier';

  if (type === 'enfant') return <FicheEnfant fiche={fiche} />;
  if (type === 'animal') return <FicheAnimal fiche={fiche} />;

  // ── Festivalier (default) ──
  const d = fiche.data;
  const ticketNum = token.slice(-8).toUpperCase();

  const BARCODE: [number, number][] = [
    [2,100],[1,70],[3,100],[1,100],[2,70],[1,100],[1,70],[3,100],[1,70],[2,100],
    [1,100],[3,70],[2,100],[1,100],[1,70],[2,100],[3,70],[1,100],[2,70],[1,100],
    [1,70],[2,100],[1,70],[3,100],[1,100],[2,70],[1,100],[1,100],[3,70],[2,100],
    [1,100],[2,70],[1,100],[3,100],[1,70],[1,100],[2,70],[1,100],[2,100],[3,70],
  ];

  return (
    <main
      className="min-h-screen px-4 py-8 flex flex-col items-center select-none"
      style={{ background: SPOOLIO_BLUE }}
    >
      <Particles />
      <div className="w-full max-w-sm relative z-10">

        {/* ═══ TICKET ═══ */}
        <div className="relative">
          {/* Entoches encoches ticket */}
          <div
            className="absolute -left-3 top-[52%] w-6 h-6 rounded-full z-20"
            style={{ background: SPOOLIO_BLUE }}
          />
          <div
            className="absolute -right-3 top-[52%] w-6 h-6 rounded-full z-20"
            style={{ background: SPOOLIO_BLUE }}
          />

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl text-gray-900">

            {/* Header ticket */}
            <div className="bg-gradient-to-r from-[#2F3CD9] via-[#ff4f00] to-[#FF8800] p-6 text-white text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/80 mb-3">
                <span>Spoolio Pass SOS</span>
                <span>NFC Tag #{ticketNum}</span>
              </div>

              {/* Photo / Avatar */}
              <div className="flex justify-center my-3">
                {d.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.photo_url}
                    alt={d.prenom ?? 'Avatar'}
                    className="w-24 h-24 rounded-full object-cover shadow-2xl border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border-4 border-white shadow-2xl">
                    🎟️
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight">{d.prenom || 'Festivalier'}</h1>
              {d.intro && <p className="text-xs text-white/90 font-medium mt-1 italic">&ldquo;{d.intro}&rdquo;</p>}
            </div>

            {/* Contacts d'urgence */}
            <div className="p-6 space-y-4">
              {(d.contact1_tel || d.contact2_tel) && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#ff4f00]" /> Contacts D&apos;urgence SOS
                  </h3>
                  <div className="space-y-2">
                    {d.contact1_tel && (
                      <a
                        href={`tel:${d.contact1_tel}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#2F3CD9] to-[#4553F5] text-white font-black text-sm shadow-md hover:scale-[1.02] transition-transform"
                      >
                        <span className="text-xs opacity-90">{d.contact1_nom || 'Contact 1'}</span>
                        <span className="font-mono text-base">{d.contact1_tel}</span>
                      </a>
                    )}
                    {d.contact2_tel && (
                      <a
                        href={`tel:${d.contact2_tel}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-100 text-gray-900 font-black text-sm hover:bg-gray-200 transition-colors"
                      >
                        <span className="text-xs text-gray-500">{d.contact2_nom || 'Contact 2'}</span>
                        <span className="font-mono text-base">{d.contact2_tel}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Infos médicales & groupe sanguin */}
              {(d.infos_medicales || d.groupe_sanguin) && (
                <div className="pt-3 border-t border-gray-100">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" /> Fiche Santé & Secours
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs space-y-1.5">
                    {d.groupe_sanguin && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-800">Groupe Sanguin :</span>
                        <span className="font-mono font-black text-red-600 bg-white px-2 py-0.5 rounded-md border border-red-200">{d.groupe_sanguin}</span>
                      </div>
                    )}
                    {d.infos_medicales && (
                      <p className="text-gray-700 leading-relaxed font-medium">{d.infos_medicales}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Camping & Langues */}
              {(d.camping || d.langues) && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  {d.camping && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="block text-[9px] uppercase font-bold text-gray-400">Camping / Repère</span>
                      <span className="font-bold text-gray-800">{d.camping}</span>
                    </div>
                  )}
                  {d.langues && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="block text-[9px] uppercase font-bold text-gray-400">Langues</span>
                      <span className="font-bold text-gray-800">{d.langues}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Barcode Footer */}
              <div className="pt-4 border-t border-dashed border-gray-200 flex flex-col items-center">
                <div className="flex items-end h-8 gap-0.5">
                  {BARCODE.map(([w, h], idx) => (
                    <div key={idx} style={{ width: `${w}px`, height: `${h}%` }} className="bg-gray-800" />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-gray-400 font-bold tracking-widest mt-1">SPOOLIO-NFC-{ticketNum}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action button: Edit profile */}
        <div className="mt-4">
          <Link
            href={`/badges/${token}/edit`}
            className="flex items-center justify-center w-full bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm backdrop-blur-sm shadow-md"
          >
            Modifier cette fiche
          </Link>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Badge SOS créé par <a href="https://spoolio.fr" className="underline font-bold">Spoolio.fr</a>
        </p>
      </div>
    </main>
  );
}
