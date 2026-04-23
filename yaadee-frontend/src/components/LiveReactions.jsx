import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const EMOJIS = ['😊', '😂', '💖', '🥰', '👏'];

const LiveReactions = () => {
  const [activeReactions, setActiveReactions] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    // Initialize the channel once
    const channel = supabase.channel('global-reactions', {
      config: {
        broadcast: { self: true }, // self: true allows the sender to also receive the message
      },
    });

    channel
      .on('broadcast', { event: 'emoji-reaction' }, (payload) => {
        const id = Date.now() + Math.random();
        setActiveReactions((prev) => [...prev, { ...payload.payload, id }]);
        
        setTimeout(() => {
          setActiveReactions((prev) => prev.filter(r => r.id !== id));
        }, 3000);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  const handleEmojiClick = (emoji) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'emoji-reaction',
        payload: { emoji }
      });
    }
  };

  return (
    <>
      {/* --- Flying Emojis Overlay --- */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {activeReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                x: window.innerWidth - 60, 
                y: window.innerHeight - 60, 
                opacity: 0,
                scale: 0.5 
              }}
              animate={{ 
                x: [window.innerWidth - 60, Math.random() * window.innerWidth], 
                y: [window.innerHeight - 60, -100], 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1.5, 1],
                rotate: [0, Math.random() * 360]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute text-3xl md:text-4xl select-none"
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Reaction Bar --- */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 right-4 z-[9998] flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-stone-200/50"
      >
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => handleEmojiClick(emoji)}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl hover:bg-stone-100 rounded-full transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    </>
  );
};

export default LiveReactions;
