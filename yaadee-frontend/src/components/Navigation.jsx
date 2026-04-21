import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation = () => {
  return (
    <nav style={styles.nav}>
      <motion.div style={styles.container} initial={{ y: -50 }} animate={{ y: 0 }}>
        <NavLink to="/quiz" style={({ isActive }) => isActive ? styles.activeLink : styles.link}>Quiz</NavLink>
        <NavLink to="/gallery" style={({ isActive }) => isActive ? styles.activeLink : styles.link}>Gallery</NavLink>
        <NavLink to="/opinions" style={({ isActive }) => isActive ? styles.activeLink : styles.link}>Opinions</NavLink>
      </motion.div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 100,
  },
  container: {
    display: 'flex',
    gap: '1.5rem',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    padding: '10px 24px',
    borderRadius: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  link: {
    textDecoration: 'none',
    color: '#3b3a30',
    fontFamily: 'Inter',
    fontWeight: 500,
  },
  activeLink: {
    textDecoration: 'none',
    color: '#e6b981',
    fontFamily: 'Inter',
    fontWeight: 600,
  }
};

export default Navigation;
