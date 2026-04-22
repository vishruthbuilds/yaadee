import React, { useState, useEffect } from 'react';
import { fetchQuestions } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const MCQ = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchQuestions().then(data => {
      if (data && data.length > 0) {
        // Shuffle and take 3 random questions
        setQuestions([...data].sort(() => 0.5 - Math.random()).slice(0, 3));
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
        setFeedback("You've completed the chaos! 🎓");
      }
    }, 2000);
  };

  if (questions.length === 0) return <div className="text-center font-serif text-xl mt-20">Recalling memories...</div>;

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen py-12 md:py-16 px-4 md:px-6 max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 md:mb-12 text-ink">Class Chaos</h1>
      
      <AnimatePresence mode="wait">
        {!feedback.includes('completed') ? (
          <motion.div 
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="paper-cutout w-full"
          >
            <h2 className="font-serif text-3xl mb-8 leading-snug">{question.text}</h2>
            <div className="flex flex-col gap-4">
              {question.options.map((opt, i) => (
                <button 
                  key={i} 
                  className="bg-stone-100 hover:bg-stone-200 text-ink font-sans text-lg py-4 px-6 text-left transition-colors border border-stone-200"
                  onClick={() => handleAnswer(opt)}
                >
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
            className="mt-12 text-center"
          >
            <h3 className="font-serif italic text-3xl text-accent">{feedback}</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCQ;
