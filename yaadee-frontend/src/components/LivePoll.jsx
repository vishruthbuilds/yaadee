import React, { useState, useEffect } from 'react';
import { subscribeToActivePolls, subscribeToCompletedPolls, submitVote, fetchPollResults } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LivePoll = () => {
  const [activePoll, setActivePoll] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const activeSub = subscribeToActivePolls((poll) => {
      const started = new Date(poll.started_at).getTime();
      const now = Date.now();
      const diff = Math.floor((now - started) / 1000);
      const remaining = 30 - diff;

      if (remaining > 0) {
        setActivePoll(poll);
        setTimeLeft(remaining);
        setHasVoted(false);
        setResults(null);
      } else {
        fetchAndShowResults(poll.id);
      }
    });

    const completedSub = subscribeToCompletedPolls((poll) => {
      if (activePoll && activePoll.id === poll.id) {
        setTimeLeft(0);
      }
    });

    return () => {};
  }, [activePoll]);

  useEffect(() => {
    if (timeLeft > 0 && activePoll) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            fetchAndShowResults(activePoll.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, activePoll]);

  const fetchAndShowResults = async (pollId) => {
    const data = await fetchPollResults(pollId);
    if (data) {
      const tallies = {};
      data.forEach(vote => {
        tallies[vote.selected_option] = (tallies[vote.selected_option] || 0) + 1;
      });
      setResults(tallies);
      
      // Fire confetti when results show!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#d88c7d', '#e6dfd1', '#2c2a25']
      });
    }
  };

  const handleVote = async (option) => {
    if (hasVoted) return;
    let userStr = localStorage.getItem('yaadee_user');
    if (userStr === 'undefined' || !userStr) userStr = '{"name":"Anonymous"}';
    const user = JSON.parse(userStr);
    await submitVote(activePoll.id, option, user.name);
    setHasVoted(true);
  };

  const closePollModal = () => {
    setActivePoll(null);
    setResults(null);
  };

  if (!activePoll) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 2 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
          className="paper-cutout w-full max-w-md pointer-events-auto shadow-2xl border border-stone-300 relative"
        >
          {/* Decorative tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 rotate-[-3deg] shadow-sm backdrop-blur-sm"></div>

          <h3 className="font-serif text-accent uppercase tracking-widest text-sm mb-2 text-center mt-2">Wall of Fame</h3>
          <p className="font-serif text-3xl text-ink text-center mb-6">{activePoll.question}</p>
          
          {timeLeft > 0 ? (
            <div>
              <div className={`text-center font-sans text-5xl font-bold mb-8 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
                {timeLeft}s
              </div>

              {!hasVoted ? (
                <div className="flex flex-col gap-3">
                  {activePoll.options.map(option => (
                    <button 
                      key={option} 
                      onClick={() => handleVote(option)}
                      className="bg-stone-100 hover:bg-stone-200 text-ink font-sans py-3 px-4 text-left transition-colors border border-stone-200 shadow-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center my-8 text-accent font-serif italic text-xl">
                  Vote cast! Waiting for the dust to settle...
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-center mb-6 font-serif text-2xl text-ink">
                The results are in!
              </div>
              {results ? (
                <div className="flex flex-col gap-4">
                  {activePoll.options.map((option, idx) => {
                    const votes = results[option] || 0;
                    const total = Object.values(results).reduce((a,b)=>a+b, 0) || 1;
                    const percent = Math.round((votes / total) * 100);
                    
                    // Highlight winner
                    const isWinner = votes > 0 && votes === Math.max(...Object.values(results));
                    
                    return (
                      <div key={option} className={`relative p-3 border ${isWinner ? 'border-accent bg-accent/5' : 'border-stone-200 bg-stone-50'}`}>
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-stone-200 -z-10 transition-all duration-1000" 
                          style={{ width: `${percent}%` }}
                        ></div>
                        <div className="flex justify-between font-sans z-10">
                          <span className={`${isWinner ? 'font-bold' : ''}`}>{option}</span>
                          <span className="text-stone-500">{votes} votes ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center font-serif text-stone-500">Tallying...</div>
              )}
              <button 
                onClick={closePollModal}
                className="w-full mt-8 py-3 bg-stone-800 text-white font-sans tracking-widest hover:bg-black transition-colors"
              >
                CLOSE
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LivePoll;
