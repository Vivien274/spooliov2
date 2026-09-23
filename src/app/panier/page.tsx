import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PanierClient from "./PanierClient";

export const metadata = {
  title: "Mon Panier - Spoolio V2",
  description: "Finalisez vos achats et soutenez l'Atelier Spoolio de fabrication locale de fidgets 3D écoresponsables.",
};

export default function CartPage() {
  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-zinc-900 font-sans flex flex-col items-center selection:bg-[#ff4f00] selection:text-white overflow-x-hidden">
      {/* Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] px-6 pt-28 lg:pt-32 pb-12 relative z-10">
        <PanierClient />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
