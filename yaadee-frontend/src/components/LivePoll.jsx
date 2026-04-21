import React, { useState, useEffect } from 'react';
import { subscribeToActivePolls, subscribeToCompletedPolls, submitVote, fetchPollResults, unsubscribeChannel, fetchUsers } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LivePoll = () => {
  const [activePoll, setActivePoll] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Search to vote state
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load users for the voting options
    fetchUsers().then(data => { if (data) setUsers(data); });

    const activeSub = subscribeToActivePolls((poll) => {
      setActivePoll(poll);
      setHasVoted(false);
      setResults(null);
      setSearch('');
    });

    const completedSub = subscribeToCompletedPolls((poll) => {
      if (activePoll && activePoll.id === poll.id) {
        setActivePoll({ ...activePoll, status: 'completed' });
        setTimeLeft(0);
        fetchAndShowResults(poll.id);
      }
    });

    return () => {
      unsubscribeChannel(activeSub);
      unsubscribeChannel(completedSub);
    };
  }, [activePoll]);

  useEffect(() => {
    if (activePoll && activePoll.status === 'active') {
      const expiresAtStr = activePoll.options && activePoll.options.length > 0 ? activePoll.options[0] : null;
      if (!expiresAtStr) return;

      const timer = setInterval(() => {
        const expiresAt = new Date(expiresAtStr).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          // Wait for backend to officially close it, or just show tallying
        }
      }, 500); // Check more frequently to sync perfectly

      return () => clearInterval(timer);
    }
  }, [activePoll]);

  const fetchAndShowResults = async (pollId) => {
    const data = await fetchPollResults(pollId);
    if (data) {
      const tallies = {};
      data.forEach(vote => {
        tallies[vote.selected_option] = (tallies[vote.selected_option] || 0) + 1;
      });
      setResults(tallies);
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#d88c7d', '#e6dfd1', '#2c2a25', '#fcd34d', '#4ade80']
      });
    }
  };

  const handleVote = async (userName) => {
    if (hasVoted) return;
    let userStr = localStorage.getItem('yaadee_user');
    if (userStr === 'undefined' || !userStr) userStr = '{"name":"Anonymous"}';
    const voter = JSON.parse(userStr);
    
    await submitVote(activePoll.id, userName, voter.name);
    setHasVoted(true);
    setShowDropdown(false);
  };

  const closePollModal = () => {
    setActivePoll(null);
    setResults(null);
  };

  const filteredUsers = users.filter(user => 
    user.name && user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Winner logic
  let winner = null;
  if (results && Object.keys(results).length > 0) {
    const maxVotes = Math.max(...Object.values(results));
    const winnerName = Object.keys(results).find(opt => results[opt] === maxVotes);
    if (winnerName) {
      winner = users.find(u => u.name === winnerName) || { name: winnerName };
      winner.votes = maxVotes;
    }
  }

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
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 rotate-[-3deg] shadow-sm backdrop-blur-sm"></div>

          <h3 className="font-serif text-accent uppercase tracking-widest text-sm mb-2 text-center mt-2">Wall of Fame</h3>
          <p className="font-serif text-3xl text-ink text-center mb-6">{activePoll.question}</p>
          
          {activePoll.status === 'active' && timeLeft > 0 ? (
            <div>
              <div className={`text-center font-sans text-5xl font-bold mb-8 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
                {timeLeft}s
              </div>

              {!hasVoted ? (
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search name to vote..." 
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-3 rounded-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm font-sans text-lg text-ink"
                  />
                  
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 shadow-xl rounded-sm max-h-48 overflow-y-auto text-left z-50"
                    >
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <div 
                            key={user.id}
                            onClick={() => handleVote(user.name)}
                            className="px-4 py-3 border-b border-stone-100 hover:bg-stone-50 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <span className="font-serif text-lg">{user.name}</span>
                            <span className="text-xs text-stone-400 font-bold tracking-widest uppercase bg-stone-100 px-2 py-1 rounded-full">Vote</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-stone-400 font-sans italic text-sm">No names found.</div>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center my-8 text-accent font-serif italic text-xl">
                  Vote cast! Waiting for the results...
                </div>
              )}
            </div>
          ) : (
            <div>
              {results ? (
                <div className="flex flex-col items-center">
                  <div className="text-center mb-6 font-serif text-3xl text-accent font-bold">
                    Congratulations!
                  </div>
                  
                  {winner ? (
                    <div className="flex flex-col items-center mb-6">
                      <div className="polaroid polaroid-rotate-right cursor-default mb-4 shadow-xl">
                        <div className="aspect-square w-32 bg-stone-200 mb-2 overflow-hidden rounded-sm flex items-center justify-center">
                          {winner.photoUrl ? (
                            <img src={winner.photoUrl} alt={winner.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-4xl text-stone-400 font-serif">{winner.name.charAt(0)}</div>
                          )}
                        </div>
                      </div>
                      <h3 className="font-serif text-3xl font-bold">{winner.name}</h3>
                      <span className="text-stone-500 font-bold bg-stone-100 px-3 py-1 mt-2 rounded-full text-sm">
                        Winner with {winner.votes} votes!
                      </span>
                    </div>
                  ) : (
                    <div className="text-center font-serif text-stone-500 italic mb-6">No votes were cast...</div>
                  )}

                  <button 
                    onClick={closePollModal}
                    className="w-full mt-2 py-3 bg-stone-800 text-white font-sans tracking-widest hover:bg-black transition-colors rounded-sm"
                  >
                    CLOSE
                  </button>
                </div>
              ) : (
                <div className="text-center font-serif text-stone-500 py-8">Tallying the votes...</div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LivePoll;
