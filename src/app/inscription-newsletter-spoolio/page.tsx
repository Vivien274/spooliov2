import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Inscription Newsletter | Spoolio",
  description: "Inscris-toi à la newsletter Spoolio pour recevoir nos codes promos, découvrir nos nouveaux objets 3D en avant-première et suivre nos aventures !",
};

export default function NewsletterPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blob-orange" style={{ backgroundColor: 'rgba(255, 79, 0, 0.12)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[10%] left-[-15%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blob-indigo" style={{ backgroundColor: 'rgba(99, 102, 241, 0.10)', filter: 'blur(100px)' }} />
      </div>

      <Header className="relative h-24 flex items-center justify-between z-50 px-6 max-w-[1200px] mx-auto w-full" />

      {/* Main Content Area */}
      <main className="w-full max-w-[650px] px-6 py-12 relative z-10 flex-grow">
        
        {/* Intro */}
        <div className="text-center mb-8 animate-reveal">
          <span className="text-xs text-[#2F3CD9] font-black uppercase tracking-widest block mb-2 font-sans">
            Ne manque aucun bon plan !
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight font-antonio text-neon-flow text-center">
            Rejoins la Newsletter Spoolio
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans leading-relaxed mt-2">
            Des promos exclusives, des coulisses de l'atelier et les nouveautés 3D en avant-première !
          </p>
        </div>

        {/* Form Container Card */}
        <div className="mt-6 p-6 md:p-8 rounded-3xl bg-spoolio-card border border-spoolio-border animate-reveal delay-100 font-sans">
          
          <form 
            action="https://spoolio.us15.list-manage.com/subscribe/post?u=ac0c921fbe515914135ceab3c&amp;id=bcabd4b111&amp;f_id=001a85e0f0" 
            method="post" 
            id="mc-embedded-subscribe-form" 
            name="mc-embedded-subscribe-form" 
            className="validate space-y-6 text-xs" 
            target="_blank"
          >
            {/* Form Fields */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mce-EMAIL" className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Ton adresse e-mail *
              </label>
              <input 
                type="email" 
                name="EMAIL" 
                className="h-11 border border-spoolio-border rounded-xl px-3.5 outline-none focus:border-[#ff4f00] transition-colors review-input text-sm" 
                id="mce-EMAIL" 
                required 
                placeholder="exemple@email.com"
              />
            </div>

            {/* GDPR Checkbox */}
            <div className="p-4 rounded-2xl bg-[#1b1b1f]/20 border border-spoolio-border/30 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer text-gray-400 text-[11px] leading-relaxed">
                <input 
                  type="checkbox" 
                  id="gdpr_85218" 
                  name="gdpr[85218]" 
                  className="mt-0.5 rounded border-spoolio-border text-[#ff4f00] focus:ring-0 cursor-pointer accent-[#ff4f00]" 
                  value="Y" 
                  required
                />
                <span>
                  J'accepte de recevoir les e-mails d'informations et offres commerciales de la part de la Savonnerie / Boutique Spoolio.
                </span>
              </label>
              <p className="text-[10px] text-gray-500 pl-6 leading-relaxed">
                Tu peux te désabonner à tout moment via le lien situé au bas de chacun de nos e-mails.
              </p>
            </div>

            {/* Legal Notice */}
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Nous utilisons Mailchimp comme plateforme marketing. En cliquant ci-dessous pour t'inscrire, tu reconnais que tes informations seront transférées à Mailchimp pour traitement conformément à leurs conditions d'utilisation.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              name="subscribe"
              id="mc-embedded-subscribe"
              className="w-full py-3.5 bg-[#ff4f00] hover:bg-[#e04500] text-white font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#ff4f00]/25 text-center text-xs"
            >
              M'inscrire gratuitement
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
