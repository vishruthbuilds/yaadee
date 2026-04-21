import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchScrapbook } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';

const Scrapbook = () => {
  const { id } = useParams();
  const [scrapbook, setScrapbook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // We would normally fetch user details as well, using localStorage for simplicity
    const saved = localStorage.getItem('yaadee_user');
    if (saved) setCurrentUser(JSON.parse(saved));

    fetchScrapbook(id).then(data => {
      if (data) setScrapbook(data);
    });
  }, [id]);

  if (!scrapbook) return <PageWrapper><h2>Loading your memories...</h2></PageWrapper>;

  return (
    <PageWrapper style={styles.page}>
      <h1 className="handwritten" style={styles.title}>{currentUser?.name}'s Scrapbook</h1>
      <p style={styles.quote}>"{currentUser?.quote || 'No quote provided'}"</p>

      <div style={styles.grid}>
        {currentUser?.photoUrl && (
          <motion.div className="polaroid" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <img src={`http://localhost:5000${currentUser.photoUrl}`} alt="Main" />
            <p className="caption">Me!</p>
          </motion.div>
        )}

        {scrapbook.photos.map((photo, index) => (
          <motion.div 
            key={index} 
            className="polaroid"
            initial={{ scale: 0, rotate: Math.random() * 20 - 10 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: index * 0.1 }}
          >
            <img src={`http://localhost:5000${photo}`} alt="Memory" />
            <p className="caption">Memory #{index + 1}</p>
          </motion.div>
        ))}
      </div>

      <div style={styles.messagesContainer}>
        <h2 className="handwritten" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Messages for you</h2>
        {scrapbook.messages.length === 0 ? <p>No messages yet.</p> : null}
        {scrapbook.messages.map((msg, i) => (
          <motion.div 
            key={msg.id} 
            style={styles.messageNote}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="handwritten" style={{ fontSize: '1.5rem' }}>{msg.text}</p>
            <p style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>- {msg.from}</p>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

const styles = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '4.5rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#e6b981'
  },
  quote: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: '3rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '2rem',
    padding: '2rem 0'
  },
  messagesContainer: {
    marginTop: '4rem',
    padding: '2rem',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '16px',
    backdropFilter: 'blur(5px)'
  },
  messageNote: {
    background: '#fef9e7',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '8px',
    boxShadow: 'var(--paper-shadow)',
    borderLeft: '4px solid #e6b981'
  }
};

export default Scrapbook;
