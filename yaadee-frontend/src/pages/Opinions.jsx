import { useState, useEffect } from 'react';
import { fetchOpinions, fetchAnonymous } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';

const Opinions = () => {
  const [opinions, setOpinions] = useState([]);
  const [anonymous, setAnonymous] = useState([]);
  const [view, setView] = useState('opinions'); // opinions | anonymous

  useEffect(() => {
    fetchOpinions().then(data => { if (data) setOpinions(data); });
    fetchAnonymous().then(data => { if (data) setAnonymous(data); });
  }, []);

  const data = view === 'opinions' ? opinions : anonymous;

  return (
    <PageWrapper style={styles.page}>
      <h1 className="handwritten" style={{ fontSize: '4rem', textAlign: 'center' }}>Classmate Echoes</h1>
      
      <div style={styles.tabs}>
        <button 
          className="btn" 
          style={view === 'opinions' ? styles.activeTab : styles.tab}
          onClick={() => setView('opinions')}
        >
          Public Opinions
        </button>
        <button 
          className="btn" 
          style={view === 'anonymous' ? styles.activeTab : styles.tab}
          onClick={() => setView('anonymous')}
        >
          Anonymous "Guess Who"
        </button>
      </div>

      <div style={styles.grid}>
        {data.length === 0 ? <p style={{ textAlign: 'center', width: '100%' }}>No messages here yet.</p> : null}
        {data.map((msg, i) => (
          <motion.div 
            key={msg.id}
            style={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <p className="handwritten" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>"{msg.text}"</p>
            {view === 'opinions' ? (
              <p style={{ textAlign: 'right', fontWeight: 'bold' }}>- {msg.authorName}</p>
            ) : (
              <p style={{ textAlign: 'right', fontStyle: 'italic', color: '#888' }}>- Guess Who? 🕵️</p>
            )}
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

const styles = {
  page: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '3rem',
    marginTop: '1rem'
  },
  tab: {
    background: '#f4eee0',
    color: '#333'
  },
  activeTab: {
    background: '#3b3a30',
    color: '#fff'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: 'var(--paper-shadow)',
    borderTop: '4px solid #e6b981'
  }
};

export default Opinions;
