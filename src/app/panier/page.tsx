import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PanierClient from "./PanierClient";

export const metadata = {
  title: "Mon Panier - Spoolio V2",
  description: "Finalisez vos achats et soutenez l'Atelier Spoolio de fabrication locale de fidgets 3D écoresponsables.",
};

export default function CartPage() {
  return (
    <div className="relative min-h-screen bg-spoolio-bg text-white font-sans flex flex-col items-center selection:bg-spoolio-orange selection:text-black overflow-x-hidden">
      {/* Navigation Header */}
      <Header className="h-24 flex items-center justify-between px-6 max-w-[1200px] mx-auto w-full no-invert" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] px-6 py-12 relative z-10">
        <PanierClient />
      </main>

      {/* Footer */}
      <Footer className="w-full bg-[#111] border-t border-white/5 py-12 text-center" />
    </div>
  );
}
