import Image from 'next/image';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/467970237_956852316472370_5862938173089959610_n.jpg"
          alt="KT Token Hero"
          fill
          className="hero-image object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-white">
          <h1 className="text-7xl font-bold mb-6 drop-shadow-lg">KT Token</h1>
          <p className="text-2xl mb-12 drop-shadow-md">Next Generation of Meme Coins</p>
          <a 
            href="https://dexscreener.com/solana/ahzduwyvqhpq7swgqbvjauxnzi8dg3qy73pywghp21hv" 
            className="inline-block bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl"
          >
            Buy Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
