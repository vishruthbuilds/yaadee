import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers } from '../api';
import PageWrapper from '../components/PageWrapper';

const Throwbacks = () => {
  const [cards, setCards] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [flippedId, setFlippedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchUsers();
      setCards(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsRevealed(true);
    }, 800);
  };

  if (loading) return <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif italic text-stone-400">Fetching memories...</div>;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif italic text-stone-800 mb-4">The Class of Throwbacks</h1>
          <AnimatePresence>
            {!isRevealed && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-stone-500 font-serif"
              >
                {isOpening ? "Opening the Archives..." : "A collection of shared moments"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className={`relative min-h-[70vh] flex flex-col items-center justify-center`}>
          
          <AnimatePresence>
            {!isRevealed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, y: -50 }}
                className="relative w-80 h-56 md:w-[450px] md:h-72 flex items-center justify-center perspective-2000 group cursor-pointer"
                onClick={handleOpen}
              >
                {/* The Memory Box - Refined Design */}
                <div className="absolute inset-0 bg-[#2d2a24] rounded-sm shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-t border-white/10 preserve-3d">
                   {/* Wood Texture / Grained look */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }}></div>
                   
                   {/* Interior Depth */}
                   <div className="absolute inset-0 bg-black/40 shadow-inner"></div>

                   {/* The Lid */}
                   <motion.div 
                     animate={{ rotateX: isOpening ? -110 : 0 }}
                     transition={{ duration: 0.8, ease: "easeInOut" }}
                     className="absolute inset-0 bg-[#3a362f] rounded-sm shadow-2xl border-t border-white/10 z-20 origin-top preserve-3d"
                   >
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }}></div>
                      {/* Brass Latch */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 bg-[#b59a5d] rounded-t-sm shadow-lg border border-[#8e7641] flex items-center justify-center">
                        <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                      </div>
                      <div className="absolute inset-8 border-2 border-accent/5 rounded-sm flex flex-col items-center justify-center">
                        <h2 className="text-accent/30 font-serif italic text-2xl md:text-4xl tracking-widest uppercase">Class of 2026</h2>
                      </div>
                   </motion.div>
                </div>

                {/* Peek-a-boo cards (inside the box) */}
                <div className="absolute inset-0 flex items-center justify-center w-full z-10 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        y: isOpening ? -100 : [0, -10, 0],
                        opacity: isOpening ? 0 : 1,
                        rotate: (i - 3.5) * 8
                      }}
                      transition={{ 
                        duration: isOpening ? 0.5 : 3, 
                        repeat: isOpening ? 0 : Infinity, 
                        delay: i * 0.1 
                      }}
                      className="absolute w-24 h-32 md:w-32 md:h-44 bg-white border border-stone-200 rounded-sm shadow-xl origin-bottom"
                      style={{ 
                        zIndex: 10 + i,
                        x: (i - 3.5) * 15
                      }}
                    >
                      <div className="absolute inset-0 bg-stone-50/50 flex items-center justify-center opacity-40">
                        <div className="w-12 h-16 bg-stone-200/50 rounded-sm"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {!isOpening && (
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-30 flex flex-col items-center justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-accent text-white px-12 py-5 rounded-sm shadow-2xl font-serif italic text-2xl border border-white/20"
                    >
                      Open Memories
                    </motion.div>
                    <p className="mt-6 text-white/40 font-serif italic text-sm tracking-widest uppercase">Tap to Unlock</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isRevealed && (
            <motion.div 
              layout
              className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-12"
            >
              {cards.map((card, index) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  index={index} 
                  isRevealed={isRevealed}
                  isFlipped={flippedId === card.id}
                  onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

const Card = ({ card, index, isRevealed, isFlipped, onFlip }) => {
  // Random scattering for the burst animation
  const randomInitialX = (Math.random() - 0.5) * 200;
  const randomInitialY = (Math.random() - 0.5) * 200;
  const randomRotate = (Math.random() - 0.5) * 180;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.1, 
        x: 0, // Burst from center
        y: 100, // Slightly offset from box center
        rotate: randomRotate 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: 0, 
        y: 0, 
        rotate: 0 
      }}
      transition={{ 
        delay: index * 0.05, 
        duration: 1.5, 
        type: "spring", 
        stiffness: 40, 
        damping: 12 
      }}
      className="relative aspect-[3/4] cursor-pointer perspective-1000 group"
      onClick={onFlip}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* FRONT: Polaroid Style */}
        <div className="absolute inset-0 backface-hidden bg-white p-4 pb-12 shadow-md border border-stone-100 rounded-sm hover:shadow-xl transition-shadow flex flex-col">
          <div className="flex-1 bg-stone-100 mb-4 overflow-hidden relative transition-all duration-1000 flex items-center justify-center">
             {card.photoUrl ? (
               <img src={card.photoUrl} className="w-full h-full object-cover" alt="" />
             ) : (
               <div className="text-4xl text-stone-300 font-serif uppercase tracking-widest">{card.name?.charAt(0)}</div>
             )}
             <div className="absolute inset-0 bg-stone-900/5 mix-blend-overlay" />
          </div>
          <div className="text-center font-serif text-stone-700 italic border-t border-stone-50 pt-2">
            {card.name}
          </div>
          <div className="absolute bottom-2 right-3 text-[10px] text-stone-300 font-mono">2026</div>
        </div>

        {/* BACK: Bio/Message */}
        <div 
          className="absolute inset-0 backface-hidden bg-[#faf7f2] p-8 shadow-md border border-stone-100 rounded-sm flex flex-col items-center justify-center text-center overflow-y-auto"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-12 h-0.5 bg-stone-200 mb-6 flex-shrink-0" />
          <p className="text-stone-600 font-serif italic leading-relaxed text-sm">
            {card.quote ? `"${card.quote}"` : ""}
          </p>
          <div className="w-12 h-0.5 bg-stone-200 mt-6 flex-shrink-0" />
          <p className="mt-8 text-stone-400 text-xs font-mono uppercase tracking-widest">— {card.name}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Throwbacks;
