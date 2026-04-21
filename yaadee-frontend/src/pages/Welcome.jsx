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
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Scattered background elements for depth */}
      <motion.div 
        initial={{ opacity: 0, rotate: -10 }} 
        animate={{ opacity: 0.4, rotate: -15 }} 
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute top-20 left-20 w-32 h-32 bg-[#e6dfd1] rounded-sm shadow-sm z-0"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, rotate: 10 }} 
        animate={{ opacity: 0.3, rotate: 20 }} 
        transition={{ duration: 2, delay: 0.8 }}
        className="absolute bottom-20 right-20 w-48 h-48 bg-[#e8e2d4] rounded-sm shadow-sm z-0"
      ></motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-2xl px-6 paper-cutout"
      >
        <motion.p variants={itemVariants} className="text-stone-500 uppercase tracking-widest text-sm mb-4">
          Welcome
        </motion.p>
        
        <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-serif text-ink mb-6">
          Yaadee
        </motion.h1>
        
        <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-serif italic text-stone-700 mb-4">
          A quiet place to revisit everything you lived
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-stone-500 text-lg mb-12">
          Because this isn’t a goodbye. It’s a replay.
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <button 
            onClick={() => navigate('/select-user')}
            className="btn-primary"
          >
            Start
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
