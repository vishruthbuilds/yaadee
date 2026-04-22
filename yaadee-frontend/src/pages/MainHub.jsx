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
    <div className="min-h-screen flex flex-col items-center py-12 md:py-16 px-4 md:px-6 max-w-5xl mx-auto relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Welcome, <span className="italic">{user.name}</span></h1>
        <p className="text-lg md:text-xl text-stone-500 font-sans tracking-wide">Let's go back for a bit.</p>
      </motion.div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full mb-auto z-10">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(feature.path)}
            className={`paper-cutout cursor-pointer hover:shadow-xl hover:border-stone-300 flex flex-col justify-center items-center h-40 md:h-48 relative overflow-hidden group ${feature.rotation}`}
          >
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-stone-100/50 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <h2 className="text-3xl font-serif text-ink mb-2 z-10">{feature.title}</h2>
            <p className="text-stone-500 font-sans z-10 mb-2">{feature.desc}</p>
            {feature.id === 'wall' && (
              <span className="text-accent font-bold text-sm tracking-widest uppercase z-10 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Let's Go &rarr;</span>
            )}
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
          Crafted quietly by VishruthGupta
        </p>
      </motion.div>
    </div>
  );
};

export default MainHub;
