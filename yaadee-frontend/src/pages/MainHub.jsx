import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MainHub = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('yaadee_user');
    if (!savedUser) {
      navigate('/select-user');
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  const features = [
    { id: 'wall', title: 'Wall of Fame', desc: 'Live titles & polls', path: '/wall-of-fame', rotation: 'polaroid-rotate-left' },
    { id: 'throwbacks', title: 'Throwbacks', desc: 'Captured memories', path: '/throwbacks', rotation: 'polaroid-rotate-right' },
    { id: 'confessions', title: 'Confessions', desc: 'Unspoken words', path: '/confessions', rotation: 'polaroid-rotate-left' },
    { id: 'chaos', title: 'Class Chaos', desc: 'Who did what?', path: '/chaos', rotation: 'polaroid-rotate-right' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-4 md:px-8 max-w-6xl mx-auto relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative"
      >
        <span className="text-stone-400 uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium">Session Active</span>
        <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
          Welcome back, <br/>
          <span className="italic text-accent">{user.name}</span>
        </h1>
        <div className="w-16 h-px bg-stone-200 mx-auto"></div>
      </motion.div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full z-10">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(feature.path)}
            className={`paper-cutout cursor-pointer group flex flex-col items-start min-h-[220px] p-8 hover:shadow-2xl transition-all duration-700 ${feature.rotation} hover:rotate-0`}
          >
            <div className="mb-auto">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mb-4 block group-hover:text-accent transition-colors">Section {index + 1}</span>
              <h2 className="text-3xl font-serif italic text-ink mb-2 group-hover:text-accent transition-colors">{feature.title}</h2>
              <p className="text-sm text-stone-500 leading-relaxed max-w-[200px]">{feature.desc}</p>
            </div>
            
            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-stone-300 group-hover:text-ink transition-all">
              <span>Explore</span>
              <div className="w-8 h-px bg-stone-200 group-hover:w-12 group-hover:bg-ink transition-all"></div>
            </div>

            {/* Decorative "corner" effect */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-stone-100/50 to-transparent pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Background Decor */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.03 }} 
        className="fixed bottom-10 left-10 text-[20rem] font-serif italic text-accent select-none pointer-events-none z-0"
      >
        {user.name.charAt(0)}
      </motion.div>
    
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-24 text-center z-10"
      >
        <p className="font-sans text-stone-400 hover:text-stone-800 transition-colors duration-500 tracking-widest text-sm uppercase">
          Crafted quietly by VishruthGupta
        </p>
      </motion.div>
    </div>
  );
};

export default MainHub;
