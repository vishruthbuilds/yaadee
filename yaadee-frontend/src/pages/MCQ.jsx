import { useState, useEffect } from 'react';
import { fetchQuestions } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';

const MCQ = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchQuestions().then(data => {
      if (data && data.length > 0) {
        // Just take up to 3 random questions
        setQuestions(data.sort(() => 0.5 - Math.random()).slice(0, 3));
      }
    });
  }, []);

  const handleAnswer = (option) => {
    const isCorrect = option === questions[currentIndex].correctAnswer;
    setFeedback(isCorrect ? "LOL that's so you! Exactly!" : "Nah, nice try! 😂");
    
    setTimeout(() => {
      setFeedback('');
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFeedback("You've completed the fun quiz! 🎓");
      }
    }, 2000);
  };

  if (questions.length === 0) return <PageWrapper><h2>Loading questions...</h2></PageWrapper>;

  const question = questions[currentIndex];

  return (
    <PageWrapper>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Memory Lane Quiz</h1>
        
        <AnimatePresence mode="wait">
          {!feedback.includes('completed') ? (
            <motion.div 
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              style={styles.card}
            >
              <h2 style={{ marginBottom: '2rem' }}>{question.text}</h2>
              <div style={styles.options}>
                {question.options.map((opt, i) => (
                  <button key={i} className="btn" style={styles.optionBtn} onClick={() => handleAnswer(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              style={styles.feedback}
            >
              <h3 className="handwritten" style={{ fontSize: '2.5rem', color: '#e6b981' }}>{feedback}</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};

const styles = {
  wrapper: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center'
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '2rem'
  },
  card: {
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: 'var(--paper-shadow)',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  optionBtn: {
    background: '#f4eee0',
    color: '#3b3a30',
    fontSize: '1.1rem',
    padding: '15px'
  },
  feedback: {
    marginTop: '2rem'
  }
};

export default MCQ;
