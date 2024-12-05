import { useEffect } from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import About from "../components/About";
import Store from "../components/Store";
import Whitepaper from "../components/Whitepaper";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { language } = useLanguage();

  useEffect(() => {
    // Import GSAP dynamically to avoid SSR issues
    const loadGSAP = async () => {
      const gsap = (await import('gsap')).default;
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
      gsap.registerPlugin(ScrollTrigger);

      // Animate cards
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleClass: "visible",
            once: true
          },
          opacity: 0,
          y: 50,
          duration: 1,
          delay: index * 0.2
        });
      });

      // Hero image parallax
      gsap.to('.hero-image', {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: 100,
        scale: 0.9
      });
    };

    loadGSAP();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Store />
        <Whitepaper />
      </main>
      <Footer />
    </div>
  );
}
