import { motion } from 'framer-motion';
import DecorationLayer from './DecorationLayer';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const PageWrapper = ({ children, style }) => {
  return (
    <div className="relative min-h-screen">
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ 
          minHeight: '100vh', 
          paddingTop: '60px', 
          paddingBottom: '40px',
          ...style 
        }}
        className="container mx-auto px-4 md:px-8 relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageWrapper;
