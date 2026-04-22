import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Decorative background elements */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 0.1, x: 0 }} 
        className="absolute top-10 left-10 w-px h-64 bg-accent hidden md:block"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 0.05, y: 0 }} 
        className="absolute bottom-20 left-20 text-[12rem] font-serif italic text-accent select-none pointer-events-none"
      >
        Y
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-3xl w-full"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <span className="text-stone-400 uppercase tracking-[0.3em] text-[10px] font-medium border-b border-stone-200 pb-2">
            The Digital Archive
          </span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="text-8xl md:text-9xl font-serif text-ink mb-8 leading-none"
        >
          Yaadee<span className="text-accent italic">.</span>
        </motion.h1>
        
        <motion.div variants={itemVariants} className="max-w-md mx-auto mb-16">
          <h2 className="text-xl md:text-2xl font-serif italic text-stone-600 leading-relaxed">
            "A quiet place to revisit everything you lived, before the clock reset."
          </h2>
          <div className="w-12 h-px bg-stone-200 mx-auto mt-8"></div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <button 
            onClick={() => navigate('/select-user')}
            className="group relative inline-flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-accent/10 scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="btn-primary relative z-10">
              Enter the replay &rarr;
            </span>
          </button>
        </motion.div>

        <motion.p 
          variants={itemVariants} 
          className="mt-16 text-stone-400 text-[10px] uppercase tracking-widest italic"
        >
          Because this isn’t a goodbye.
        </motion.p>
      </motion.div>

      {/* Subtle border decor */}
      <div className="fixed inset-8 border border-stone-200/30 pointer-events-none z-50"></div>
    </div>
  );
};

export default Welcome;
