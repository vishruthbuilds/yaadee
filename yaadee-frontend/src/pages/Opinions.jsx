import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOpinions, fetchAnonymousMessages, addOpinion, addAnonymousMessage } from '../api';

const Opinions = () => {
  const [opinions, setOpinions] = useState([]);
  const [anonymous, setAnonymous] = useState([]);
  const [view, setView] = useState('opinions'); // 'opinions' or 'anonymous'
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const ops = await fetchOpinions();
      const anon = await fetchAnonymousMessages();
      if (ops) setOpinions(ops);
      if (anon) setAnonymous(anon);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newText.trim()) return;
    if (view === 'opinions') {
      await addOpinion(newText);
      const ops = await fetchOpinions();
      if (ops) setOpinions(ops);
    } else {
      await addAnonymousMessage(newText);
      const anon = await fetchAnonymousMessages();
      if (anon) setAnonymous(anon);
    }
    setNewText('');
    alert("Message sealed and sent to the archive.");
  };

  const currentData = view === 'opinions' ? opinions : anonymous;

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-accent uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium"
        >
          Anonymous Archive
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-8xl text-center text-ink italic mb-6"
        >
          Confessions<span className="text-accent not-italic">.</span>
        </motion.h1>
        <p className="text-stone-400 font-serif italic text-lg max-w-lg mx-auto leading-relaxed">
          "Unspoken truths, whispered to the digital wind, captured before they disappear."
        </p>
      </div>

      <div className="flex justify-center gap-8 mb-16">
        <button 
          onClick={() => setView('opinions')}
          className={`font-serif text-xl italic transition-all relative pb-2 ${view === 'opinions' ? 'text-ink' : 'text-stone-300 hover:text-stone-400'}`}
        >
          Public Words
          {view === 'opinions' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-px bg-accent" />}
        </button>
        <button 
          onClick={() => setView('anonymous')}
          className={`font-serif text-xl italic transition-all relative pb-2 ${view === 'anonymous' ? 'text-ink' : 'text-stone-300 hover:text-stone-400'}`}
        >
          Unspoken Truths
          {view === 'anonymous' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-px bg-accent" />}
        </button>
      </div>
      
      {loading ? (
        <div className="text-center font-serif text-2xl text-stone-300 italic py-20 animate-pulse">Listening to the echoes...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-32">
          <AnimatePresence mode="popLayout">
            {currentData.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="paper-cutout min-h-[200px] flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="absolute -top-4 -left-4 text-5xl text-stone-50 font-serif group-hover:text-accent/10 transition-colors">"</div>
                  <p className="font-serif text-xl italic text-stone-700 leading-relaxed z-10 relative">{item.text}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-stone-50 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">{view === 'opinions' ? 'Public' : 'Secret'} #{index + 1}</span>
                  <div className="w-6 h-px bg-stone-100 group-hover:w-12 group-hover:bg-accent/30 transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Submission Form */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto p-12 bg-white shadow-2xl relative border border-stone-100"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/30"></div>
        <h2 className="font-serif text-3xl italic mb-8 text-center text-ink">Add to the archive</h2>
        <textarea 
          placeholder={view === 'opinions' ? "Share a public thought..." : "What remains unspoken?"}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="w-full p-6 border border-stone-100 bg-stone-50/50 focus:outline-none focus:border-accent transition-all min-h-[150px] font-serif text-xl italic mb-6 resize-none"
        ></textarea>
        <button onClick={handleSubmit} className="btn-primary w-full">
          Seal the message &rarr;
        </button>
        <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-stone-300 text-center italic">
          Your words will be preserved in the archive forever.
        </p>
      </motion.div>
    </div>
  );
};

export default Opinions;
