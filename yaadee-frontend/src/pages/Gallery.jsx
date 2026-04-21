import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../api';
import { motion } from 'framer-motion';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(data => {
      if (data) {
        // Find users with photos
        const userPhotos = data.filter(u => u.photoUrl).map(u => ({ url: u.photoUrl, caption: u.name }));
        setPhotos(userPhotos);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen py-16 px-6 max-w-6xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-5xl text-center mb-16 text-ink"
      >
        Throwbacks
      </motion.h1>
      
      {loading ? (
        <div className="text-center font-serif text-xl">Developing photos...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {photos.map((p, i) => {
            const rotationClass = i % 2 === 0 ? 'polaroid-rotate-left' : 'polaroid-rotate-right';
            
            return (
              <motion.div 
                key={i} 
                className={`polaroid ${rotationClass}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="aspect-square bg-stone-200 mb-4 overflow-hidden rounded-sm relative">
                  <img src={p.url} alt="Gallery" loading="lazy" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none"></div>
                </div>
                <p className="font-serif text-center text-lg italic text-ink">{p.caption}</p>
              </motion.div>
            )
          })}
          {photos.length === 0 && <p className="text-center w-full col-span-full font-serif text-stone-500">No memories captured yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Gallery;
