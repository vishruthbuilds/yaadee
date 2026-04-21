import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchConfig } from '../api';

const Welcome = () => {
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig().then(data => {
      if (data) setConfig(data);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={styles.container}
    >
      {config?.logoUrl ? (
        <motion.img 
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1 }}
          src={`http://localhost:5000${config.logoUrl}`} 
          alt="Logo" 
          style={styles.logo} 
        />
      ) : (
        <div style={styles.placeholderLogo}>LOGO</div>
      )}
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        style={styles.title}
      >
        {config?.eventName || 'Farewell 2026'}
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        style={styles.subtitle}
      >
        A nostalgic trip down memory lane.
      </motion.p>

      <motion.button 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
        className="btn" 
        style={styles.btn}
        onClick={() => navigate('/login')}
      >
        Enter Memories
      </motion.button>
    </motion.div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  logo: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '2rem',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  },
  placeholderLogo: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: '#e6b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '5rem',
    color: '#3b3a30',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
  },
  btn: {
    padding: '12px 32px',
    fontSize: '1.2rem',
    borderRadius: '30px'
  }
};

export default Welcome;
