import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchScrapbook } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';

const Scrapbook = () => {
  const { id } = useParams();
  const [scrapbook, setScrapbook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // We would normally fetch user details as well, using localStorage for simplicity
    const saved = localStorage.getItem('yaadee_user');
    if (saved) setCurrentUser(JSON.parse(saved));

    fetchScrapbook(id).then(data => {
      if (data) setScrapbook(data);
    });
  }, [id]);

  if (!scrapbook) return <PageWrapper><h2>Loading your memories...</h2></PageWrapper>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12">
      <div className="text-center mb-16 relative">
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-accent uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium"
        >
          Personal Archive
        </motion.span>
        <h1 className="text-5xl md:text-8xl font-serif text-ink italic mb-4">
          {currentUser?.name}<span className="text-accent font-normal">'s</span> <br/>
          <span className="text-stone-400 not-italic">Scrapbook</span>
        </h1>
        <div className="max-w-md mx-auto">
          <p className="text-xl text-stone-500 italic font-serif leading-relaxed">
            "{currentUser?.quote || 'Collecting fragments of a beautiful time.'}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 py-8">
        {currentUser?.photoUrl && (
          <motion.div 
            className="polaroid relative group" 
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: 'spring' }}
          >
            {/* Washi Tape Effect */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-accent/20 backdrop-blur-sm rotate-[-2deg] z-10 border border-white/20"></div>
            
            <div className="aspect-square overflow-hidden mb-4 rounded-sm">
              <img 
                src={currentUser.photoUrl} 
                alt="Main" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <p className="font-serif italic text-center text-stone-400 group-hover:text-ink transition-colors">The Protagonist.</p>
          </motion.div>
        )}

        {scrapbook.photos.map((photo, index) => (
          <motion.div 
            key={index} 
            className="polaroid relative group"
            initial={{ scale: 0.9, opacity: 0, rotate: Math.random() * 10 - 5 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: index * 0.1 }}
          >
            {/* Washi Tape Effect */}
            <div className={`absolute -top-3 ${index % 2 === 0 ? 'left-4' : 'right-4'} w-16 h-6 bg-stone-200/40 backdrop-blur-sm rotate-[15deg] z-10 border border-white/10`}></div>

            <div className="aspect-square overflow-hidden mb-4 rounded-sm">
              <img 
                src={photo} 
                alt="Memory" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Memory+Missing'; }}
              />
            </div>
            <p className="font-serif italic text-center text-stone-300 group-hover:text-ink transition-colors">Memory {index + 1}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 p-8 md:p-16 bg-white/40 backdrop-blur-md rounded-sm shadow-sm border border-stone-100 relative overflow-hidden">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
        
        <h2 className="text-4xl md:text-6xl font-serif italic mb-12 text-center text-ink">Inscriptions<span className="text-accent">.</span></h2>
        
        {scrapbook.messages.length === 0 ? (
          <p className="text-stone-400 italic text-center font-serif py-20 text-xl">The pages are waiting for stories...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scrapbook.messages.map((msg, i) => (
              <motion.div 
                key={msg.id} 
                className="bg-white p-8 shadow-sm hover:shadow-md transition-all duration-500 border-l-2 border-accent/20 relative group"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="absolute top-4 right-4 text-[4rem] text-stone-50 font-serif select-none pointer-events-none group-hover:text-accent/5 transition-colors">"</div>
                <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed italic z-10 relative">
                  {msg.text}
                </p>
                <div className="mt-8 flex items-center gap-3 justify-end">
                  <div className="w-8 h-px bg-stone-100"></div>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 italic font-medium">{msg.from}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scrapbook;
