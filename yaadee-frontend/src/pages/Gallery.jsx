import { useState, useEffect } from 'react';
// Assuming gallery photos are just public scrapbook photos or users' photos
// For this demo, let's fetch all users and show their main photos as gallery
import { fetchUsers } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchUsers().then(data => {
      if (data) {
        const userPhotos = data.filter(u => u.photoUrl).map(u => ({ url: u.photoUrl, caption: u.name }));
        setPhotos(userPhotos);
      }
    });
  }, []);

  return (
    <PageWrapper>
      <h1 className="handwritten" style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '2rem' }}>Our Gallery</h1>
      
      <div style={styles.grid}>
        {photos.map((p, i) => (
          <motion.div 
            key={i} 
            className="polaroid"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <img src={`http://localhost:5000${p.url}`} alt="Gallery" loading="lazy" />
            <p className="caption">{p.caption}</p>
          </motion.div>
        ))}
        {photos.length === 0 && <p style={{ textAlign: 'center', width: '100%' }}>No photos added yet.</p>}
      </div>
    </PageWrapper>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '3rem',
    padding: '1rem'
  }
};

export default Gallery;
