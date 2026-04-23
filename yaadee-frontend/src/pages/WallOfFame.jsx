import React, { useState, useEffect } from 'react';
import LivePoll from '../components/LivePoll';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPolls, fetchPollResults, fetchUsers, subscribeToCompletedPolls, unsubscribeChannel } from '../api';

const WallOfFame = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadWall();
    
    // Subscribe to new completions to update the wall live
    const completedSub = subscribeToCompletedPolls(() => {
      loadWall();
    });

    return () => {
      unsubscribeChannel(completedSub);
    };
  }, []);

  const loadWall = async () => {
    const allUsers = await fetchUsers();
    setUsers(allUsers || []);
    
    const polls = await fetchPolls();
    if (!polls) {
      setLoading(false);
      return;
    }

    const completedPolls = polls.filter(p => p.status === 'completed');
    
    const winnersData = await Promise.all(
      completedPolls.map(async (poll) => {
        const results = await fetchPollResults(poll.id);
        if (!results || results.length === 0) return null;
        
        const tallies = {};
        results.forEach(v => {
          tallies[v.selected_option] = (tallies[v.selected_option] || 0) + 1;
        });
        
        const maxVotes = Math.max(...Object.values(tallies));
        const winnerName = Object.keys(tallies).find(opt => tallies[opt] === maxVotes);
        const winnerProfile = (allUsers || []).find(u => u.name === winnerName);
        
        return {
          pollId: poll.id,
          question: poll.question,
          winnerName,
          votes: maxVotes,
          photoUrl: winnerProfile?.photoUrl
        };
      })
    );

    setWinners(winnersData.filter(w => w !== null));
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-16 px-6 max-w-6xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-serif text-5xl md:text-7xl mb-4 text-ink italic">Wall of Fame</h1>
        <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
        <p className="font-serif text-stone-500 italic max-w-lg mx-auto">
          Celebrating the legends of our class. Those who stood out and captured the hearts (and votes) of everyone.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-accent rounded-full animate-spin mb-4"></div>
          <p className="font-serif italic text-stone-400">Curating the legends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          <AnimatePresence>
            {winners.map((winner, idx) => (
              <motion.div
                key={winner.pollId}
                initial={{ opacity: 0, scale: 0.9, rotate: idx % 2 === 0 ? -2 : 2 }}
                animate={{ opacity: 1, scale: 1, rotate: idx % 2 === 0 ? -1 : 1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                className="polaroid-card p-6 bg-white shadow-xl border border-stone-100 flex flex-col items-center group relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-soft-yellow/30 rotate-[-5deg] z-10 pointer-events-none"></div>
                
                <div className="aspect-square w-full bg-stone-50 mb-6 overflow-hidden border-4 border-white shadow-inner relative">
                  {winner.photoUrl ? (
                    <img src={winner.photoUrl} alt={winner.winnerName} className="object-cover w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300 text-6xl font-serif">
                      {winner.winnerName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5"></div>
                </div>

                <div className="text-center w-full">
                   <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">{winner.question}</p>
                   <h2 className="font-serif text-2xl text-ink mb-1">{winner.winnerName}</h2>
                   <p className="font-serif italic text-stone-400 text-sm">Won with {winner.votes} {winner.votes === 1 ? 'vote' : 'votes'}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {winners.length === 0 && !loading && (
        <div className="text-center py-20 opacity-40">
          <div className="text-6xl mb-4">🏆</div>
          <p className="font-serif italic text-xl">The wall is empty, waiting for its first legend...</p>
        </div>
      )}
      
      {/* LivePoll component renders the popup overlay when a poll is active */}
      <LivePoll />
    </div>
  );
};

export default WallOfFame;
