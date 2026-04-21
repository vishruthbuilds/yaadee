import React from 'react';
import LivePoll from '../components/LivePoll';
import { motion } from 'framer-motion';

const WallOfFame = () => {
  return (
    <div className="min-h-screen py-16 px-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-5xl mb-6 text-ink"
      >
        Wall of Fame
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-sans text-stone-500 italic mb-12"
      >
        Waiting for the admin to start a poll. The popup will appear here...
      </motion.p>
      
      {/* LivePoll component renders the popup overlay when a poll is active */}
      <LivePoll />
    </div>
  );
};

export default WallOfFame;
