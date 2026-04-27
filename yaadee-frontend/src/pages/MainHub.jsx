import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const MainHub = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have a Supabase session (Google Login)
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we have a local guest session (Select User flow)
      const savedUserStr = localStorage.getItem('yaadee_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      
      if (!session && !savedUser) {
        // No session and no local user? Go to welcome
        navigate('/');
        return;
      }

      if (savedUser?.isDemo) {
        setUser(savedUser);
        return;
      }
      
      if (session?.user?.email) {
        // Always verify against DB if logged in with Google
        const { fetchUserIdentity } = await import('../api');
        const mappedUser = await fetchUserIdentity(session.user.email);
        if (!mappedUser) {
          // Mapping was deleted by Admin or never existed
          localStorage.removeItem('yaadee_user');
          navigate('/select-user');
          return;
        } else {
          // Keep local storage synced
          localStorage.setItem('yaadee_user', JSON.stringify(mappedUser));
          setUser(mappedUser);
          return;
        }
      }

      if (!savedUser) {
        // Fallback for non-Google users if we ever allow that
        navigate('/select-user');
        return;
      }
      
      setUser(savedUser);
    };
    checkAuth();
  }, [navigate]);

  const features = [
    { id: 'wall', title: 'Wall of Fame', desc: 'Live titles & polls', path: '/wall-of-fame', rotation: 'polaroid-rotate-left' },
    { id: 'throwbacks', title: 'Throwbacks', desc: 'Captured memories', path: '/throwbacks', rotation: 'polaroid-rotate-right' },
    { id: 'time-capsule', title: 'Time Capsule', desc: 'A journey through time', path: '/time-capsule', rotation: 'polaroid-rotate-left' },
    { id: 'chaos', title: 'Class Chaos', desc: 'Synchronized Gaming Mayhem', path: '/class-chaos', rotation: 'polaroid-rotate-right' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center py-12 md:py-16 px-4 md:px-6 max-w-5xl mx-auto relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Welcome, <span className="italic">{user.name}</span></h1>
        <p className="text-lg md:text-xl text-stone-500 font-sans tracking-wide">Let's go back for a bit.</p>
      </motion.div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 w-full mb-auto z-10">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(feature.path)}
            className={`scrapbook-card cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center h-44 md:h-56 group ${feature.rotation}`}
          >
            {/* Tape Mark Accent */}
            <div className="tape-mark top-[-10px] left-1/2 -translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-stone-100/30 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <h2 className="text-3xl font-serif text-ink mb-2 z-10">{feature.title}</h2>
            <p className="text-stone-500 font-sans z-10 mb-2 px-4 text-center">{feature.desc}</p>
            
            <div className="absolute bottom-4 right-4 text-accent/30 font-serif italic text-sm group-hover:text-accent transition-colors">
               Explore &rarr;
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-24 text-center z-10"
      >
        <p className="font-sans text-stone-400 hover:text-stone-800 transition-colors duration-500 tracking-widest text-sm uppercase">
          Crafted by Vishruth Gupta
        </p>
      </motion.div>
    </div>
  );
};

export default MainHub;
