import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import DecorationLayer from '../components/DecorationLayer';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/select-user'
      }
    });
    
    if (error) {
      console.error('Error logging in:', error);
      if (error.message.includes('provider is not enabled')) {
        alert('Google login is not yet configured in the Supabase dashboard. Please use the "Identify Yourself" flow for now.');
      } else {
        alert('Login failed: ' + error.message);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-paper overflow-hidden">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="scrapbook-card max-w-2xl w-full text-center p-12 md:p-20 relative z-10"
      >
        <div className="tape-mark -top-2 left-1/2 -translate-x-1/2 w-24 h-8 bg-soft-yellow/30"></div>
        
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-6xl md:text-8xl font-serif text-warm-brown mb-2 italic">Yaadee</h1>
          <div className="h-0.5 w-16 bg-accent/20 mx-auto"></div>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-stone-600 font-serif italic mb-12 leading-relaxed"
        >
          Because this isn’t a goodbye. It’s a replay.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <button 
            onClick={handleGoogleLogin}
            className="btn-primary bg-ink text-paper flex items-center justify-center gap-4 py-4 rounded-sm shadow-2xl hover:bg-stone-800 transition-all group"
          >
            <div className="bg-white p-1 rounded-sm group-hover:scale-110 transition-transform">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
            </div>
            <span className="tracking-widest uppercase text-sm font-bold">Continue with Google</span>
          </button>
          
          <button 
            onClick={() => navigate('/select-user')}
            className="text-stone-400 font-serif italic text-sm hover:text-warm-brown transition-colors tracking-widest"
          >
            Or identify yourself from the list &rarr;
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative Year Label */}
      <div className="absolute bottom-12 left-12 font-serif italic text-warm-brown/20 text-4xl hidden md:block select-none">
        2026
      </div>
    </div>
  );
};

export default Welcome;
