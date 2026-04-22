import React, { useState, useEffect } from 'react';
import { fetchOpinions, fetchAnonymous } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const Opinions = () => {
  const [opinions, setOpinions] = useState([]);
  const [anonymous, setAnonymous] = useState([]);
  const [view, setView] = useState('opinions'); // opinions | anonymous
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOpinions(), fetchAnonymous()]).then(([opData, anonData]) => {
      if (opData) setOpinions(opData);
      if (anonData) setAnonymous(anonData);
      setLoading(false);
    });
  }, []);

  const data = view === 'opinions' ? opinions : anonymous;

  return (
    <div className="min-h-screen py-16 px-6 max-w-4xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-4xl md:text-5xl text-center mb-8 md:mb-12 text-ink"
      >
        Confessions
      </motion.h1>
      
      <div className="flex justify-center gap-4 mb-12">
        <button 
          className={`px-6 py-2 font-sans tracking-wide transition-all ${view === 'opinions' ? 'bg-ink text-paper shadow-md scale-105' : 'bg-stone-200 text-ink hover:bg-stone-300'}`}
          onClick={() => setView('opinions')}
          style={{ clipPath: 'polygon(2% 0, 100% 3%, 98% 100%, 0 98%)' }}
        >
          Public Words
        </button>
        <button 
          className={`px-6 py-2 font-sans tracking-wide transition-all ${view === 'anonymous' ? 'bg-ink text-paper shadow-md scale-105' : 'bg-stone-200 text-ink hover:bg-stone-300'}`}
          onClick={() => setView('anonymous')}
          style={{ clipPath: 'polygon(2% 0, 100% 3%, 98% 100%, 0 98%)' }}
        >
          Unspoken Truths
        </button>
      </div>

      {loading ? (
        <div className="text-center font-serif text-xl">Listening to the echoes...</div>
      ) : (
        <div className="flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.p 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center font-serif text-stone-500 w-full"
              >
                No confessions written yet.
              </motion.p>
            ) : (
              data.map((msg, i) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="paper-cutout relative"
                >
                  <p className="font-serif text-2xl mb-4 italic text-ink leading-relaxed">"{msg.text}"</p>
                  
                  {view === 'opinions' ? (
                    <p className="text-right font-sans font-bold text-accent uppercase tracking-wider text-sm">- {msg.authorName}</p>
                  ) : (
                    <p className="text-right font-sans italic text-stone-400">- Someone you know</p>
                  )}
                  
                  {/* Decorative tape */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 rotate-[-2deg] shadow-sm backdrop-blur-sm"></div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Opinions;
