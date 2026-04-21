import React, { useState, useEffect, useMemo } from 'react';
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
  const [selectedVoteName, setSelectedVoteName] = useState(null);

  useEffect(() => {
    // Load users for the voting options
    fetchUsers().then(data => { if (data) setUsers(data); });

    // Fetch initially active poll on mount
    import('../api').then(({ fetchPolls }) => {
      fetchPolls().then(polls => {
        if (polls) {
          const active = polls.find(p => p.status === 'active');
          if (active) {
            setActivePoll(active);
            setHasVoted(false);
          }
        }
      });
    });

    const activeSub = subscribeToActivePolls((poll) => {
      setActivePoll(poll);
      setHasVoted(false);
      setResults(null);
      setSearch('');
      setSelectedVoteName(null);
    });

    const completedSub = subscribeToCompletedPolls((poll) => {
      setActivePoll(prev => {
        if (prev && prev.id === poll.id) {
          return { ...prev, status: 'completed' };
        }
        return prev;
      });
      setTimeLeft(0);
      fetchAndShowResults(poll.id);
    });

    return () => {
      unsubscribeChannel(activeSub);
      unsubscribeChannel(completedSub);
    };
  }, []); // Run once on mount

  // Sync timeLeft with activePoll options (expires_at)
  useEffect(() => {
    if (activePoll && activePoll.status === 'active') {
      const expiresAtStr = activePoll.options && activePoll.options.length > 0 ? activePoll.options[0] : null;
      if (!expiresAtStr) return;

      const updateTimer = () => {
        const expiresAt = new Date(expiresAtStr).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(remaining);
        return remaining;
      };

      const initialRemaining = updateTimer();
      if (initialRemaining <= 0) return;

      const timer = setInterval(() => {
        const remaining = updateTimer();
        if (remaining <= 0) {
          clearInterval(timer);
          // Automatically close the poll when time hits 0
          import('../api').then(({ closePoll }) => {
            closePoll(activePoll.id).then(() => {
              fetchAndShowResults(activePoll.id);
            });
          });
        }
      }, 500);

      return () => clearInterval(timer);
    } else if (activePoll && activePoll.status === 'completed') {
      setTimeLeft(0);
      fetchAndShowResults(activePoll.id);
    } else {
      setTimeLeft(0);
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
      
      // Fire celebration confetti!
      confetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });
    }
  };

  const handleSelectPerson = (userName) => {
    setSelectedVoteName(userName);
    setSearch(userName);
    setShowDropdown(false);
  };

  const handleVoteSubmit = async () => {
    if (hasVoted || !selectedVoteName) return;
    let userStr = localStorage.getItem('yaadee_user');
    if (userStr === 'undefined' || !userStr) userStr = '{"name":"Anonymous"}';
    const voter = JSON.parse(userStr);
    
    await submitVote(activePoll.id, selectedVoteName, voter.name);
    setHasVoted(true);
  };

  const closePollModal = () => {
    setActivePoll(null);
    setResults(null);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name && user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // Winner calculation
  const winner = useMemo(() => {
    if (!results || Object.keys(results).length === 0) return null;
    const maxVotes = Math.max(...Object.values(results));
    const winnerName = Object.keys(results).find(opt => results[opt] === maxVotes);
    if (!winnerName) return null;
    const user = users.find(u => u.name === winnerName) || { name: winnerName };
    return { ...user, votes: maxVotes };
  }, [results, users]);

  if (!activePoll) return null;

  const isPollLive = activePoll.status === 'active' && timeLeft > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] pointer-events-auto" onClick={closePollModal}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 2 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
          className="paper-cutout w-full max-w-md pointer-events-auto shadow-2xl border border-stone-300 relative z-10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 rotate-[-3deg] shadow-sm backdrop-blur-sm"></div>

          <h3 className="font-serif text-accent uppercase tracking-widest text-sm mb-2 text-center mt-2">Wall of Fame</h3>
          <p className="font-serif text-3xl text-ink text-center mb-4">{activePoll.question}</p>
          
          {isPollLive ? (
            <div>
              <div className={`text-center font-sans text-6xl font-bold mb-6 transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
                {timeLeft}s
              </div>

              {!hasVoted ? (
                <div className="relative mb-4">
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 text-center">Cast your vote</label>
                  <input 
                    type="text" 
                    placeholder="Search name to vote..." 
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-4 rounded-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm font-serif text-xl text-ink bg-[#fdfbf7]"
                  />
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-stone-200 shadow-2xl rounded-sm max-h-56 overflow-y-auto text-left z-[100]"
                      >
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <div 
                              key={user.id}
                              onClick={() => handleSelectPerson(user.name)}
                              className="px-5 py-4 border-b border-stone-100 hover:bg-accent/5 cursor-pointer flex items-center justify-between transition-colors group"
                            >
                              <span className="font-serif text-xl group-hover:text-accent transition-colors">{user.name}</span>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter bg-stone-100 px-2 py-1 rounded-full group-hover:bg-accent group-hover:text-white transition-colors">Select</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-5 py-4 text-stone-400 font-sans italic text-sm">No names found in directory.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedVoteName && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleVoteSubmit}
                      className="w-full mt-6 bg-accent text-white font-bold py-4 rounded-sm shadow-xl hover:bg-red-600 transition-colors text-lg uppercase tracking-widest"
                    >
                      Submit Vote for {selectedVoteName}
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-serif italic text-2xl text-accent">Vote cast for <span className="font-bold underline">{search}</span>!</p>
                  <p className="text-stone-400 text-sm mt-2">Waiting for results...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              {results ? (
                <div className="flex flex-col items-center text-center">
                  <h2 className="font-serif text-4xl text-accent font-bold mb-6">Congratulations!</h2>
                  
                  {winner ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="polaroid polaroid-rotate-right cursor-default mb-6 shadow-2xl scale-110">
                        <div className="aspect-square w-40 bg-stone-200 mb-3 overflow-hidden rounded-sm flex items-center justify-center relative">
                          {winner.photoUrl ? (
                            <img src={winner.photoUrl} alt={winner.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-6xl text-stone-400 font-serif">{winner.name.charAt(0)}</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></div>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-ink">{winner.name}</h3>
                      </div>
                      
                      <div className="bg-accent text-white font-bold px-8 py-2 rounded-full text-lg shadow-lg mb-8">
                        Winner with {winner.votes} {winner.votes === 1 ? 'vote' : 'votes'}!
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center font-serif text-stone-500 italic mb-10 text-xl">The crowd was silent... No votes cast.</div>
                  )}

                  <button 
                    onClick={closePollModal}
                    className="btn-primary w-full py-4 text-xl tracking-widest shadow-xl"
                  >
                    CONTINUE &rarr;
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center">
                   <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
                   <p className="font-serif text-2xl text-ink">Tallying the final votes...</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LivePoll;
