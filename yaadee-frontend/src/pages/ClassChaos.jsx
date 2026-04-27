import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  fetchChaosQuestions, fetchChaosGameState, fetchChaosPlayers,
  joinChaosGame, submitChaosResponse, fetchUsers
} from '../api';
import { supabase } from '../supabaseClient';

const ClassChaos = () => {
  const [gameState, setGameState] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [myPlayer, setMyPlayer] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Question State
  const [answer, setAnswer] = useState('');
  const [timelineOrder, setTimelineOrder] = useState([]); // indices
  const [hasAnswered, setHasAnswered] = useState(false);
  const [localIndex, setLocalIndex] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(null); // feedback after answering
  const [demoTimeLeft, setDemoTimeLeft] = useState(30);

  useEffect(() => {
    loadInitial();
    
    const stateSub = supabase.channel('chaos_game_state_user')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chaos_game_state' }, payload => {
        setGameState(payload.new);
      })
      .subscribe();

    let lastFetch = 0;
    const playerSub = supabase.channel('chaos_players_user')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chaos_players' }, () => {
        const now = Date.now();
        if (now - lastFetch > 3000) { // Only fetch at most every 3 seconds
          loadPlayers();
          lastFetch = now;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(stateSub);
      supabase.removeChannel(playerSub);
    };
  }, []);

  const loadInitial = async () => {
    const q = await fetchChaosQuestions();
    const s = await fetchChaosGameState();
    const u = await fetchUsers();
    setQuestions(q.data || []);
    setGameState(s.data);
    setUsers(u || []);
    loadPlayers();
    setLoading(false);
  };

  const loadPlayers = async () => {
    const p = await fetchChaosPlayers();
    setPlayers(p.data || []);
  };

  const user = JSON.parse(localStorage.getItem('yaadee_user'));
  const [myUser, setMyUser] = useState(user);

  useEffect(() => {
    // We rely on yaadee_user from localStorage which is enforced in MainHub
    const savedUser = localStorage.getItem('yaadee_user');
    if (savedUser) {
      setMyUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (hasJoined || !myUser) return;
    const autoJoin = async () => {
      const { data } = await joinChaosGame(myUser.name);
      if (data) {
        setMyPlayer(data[0]);
        setHasJoined(true);
      }
    };
    autoJoin();
  }, [myUser, hasJoined]);

  useEffect(() => {
    if (gameState?.status === 'active' && localIndex === 0) {
      setLocalIndex(0);
    }
  }, [gameState?.status]);

  useEffect(() => {
    setAnswer('');
    setHasAnswered(false);
    if (questions[localIndex]?.type === 'timeline') {
      const shuffled = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      setTimelineOrder(shuffled);
    }
  }, [localIndex, questions]);

  const currentQuestion = questions[localIndex];

  useEffect(() => {
    if (myUser?.isDemo && currentQuestion && !hasAnswered) {
      setDemoTimeLeft(30);
      const timer = setInterval(() => {
        setDemoTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (localIndex < questions.length - 1) {
              setLocalIndex(l => l + 1);
            } else {
              setLocalIndex(questions.length);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [myUser?.isDemo, localIndex, currentQuestion, questions.length, hasAnswered]);

  const handleSubmit = async (directAnswer) => {
    if (hasAnswered || !currentQuestion) return;
    // Use directAnswer if provided to avoid stale state closure
    let response = currentQuestion.type === 'timeline' ? timelineOrder : (directAnswer || answer);
    const result = await submitChaosResponse(myPlayer.id, currentQuestion.id, response);
    setHasAnswered(true);
    setPointsEarned(result.points ?? 0);
    setTimeout(() => {
      setPointsEarned(null);
      if (localIndex < questions.length - 1) {
        setLocalIndex(prev => prev + 1);
      } else {
        setLocalIndex(questions.length); 
      }
    }, 1500);
  };

  const [countdown, setCountdown] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (gameState?.status === 'revealed') {
      loadPlayers(); // Fresh scores for reveal
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowCelebration(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState?.status]);

  const getDisplayLeaders = () => {
    if (!gameState || gameState.status === 'lobby') {
      // Lobby: All unique users from directory, sorted alphabetically
      const uniqueUsers = [];
      const seen = new Set();
      users.forEach(u => {
        const key = u.name.toLowerCase().trim();
        if (!seen.has(key)) {
          uniqueUsers.push({ id: u.id, name: u.name, score: 0 });
          seen.add(key);
        }
      });
      return uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Active Game: Aggregate scores by name and return top 3
    const aggregated = players.reduce((acc, p) => {
      const key = p.name.toLowerCase().trim();
      if (key === 'demo user') return acc;
      if (!acc[key]) {
        acc[key] = { ...p, score: 0 };
      }
      acc[key].score += p.score;
      return acc;
    }, {});
    
    return Object.values(aggregated)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const displayLeaders = getDisplayLeaders();

  if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center font-serif italic text-stone-400">Loading the mayhem...</div>;

  // REVEALED VIEW (COUNTDOWN & CELEBRATION)
  if (gameState?.status === 'revealed') {
     if (!showCelebration) {
       return (
         <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-center p-6">
           <motion.div 
             key={countdown}
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1.5, opacity: 1 }}
             exit={{ scale: 2, opacity: 0 }}
             className="text-8xl md:text-9xl font-mono font-bold text-accent italic"
           >
             {countdown}
           </motion.div>
           <p className="text-stone-500 font-serif italic mt-12 tracking-widest uppercase text-xs">The chaos reveals its legend in...</p>
         </div>
       );
     }

     // Calculate winners and runners including ties with aggregated scores
     const aggregatedResults = players.reduce((acc, p) => {
       const key = p.name.toLowerCase().trim();
       if (key === 'demo user') return acc;
       if (!acc[key]) {
         acc[key] = { ...p, score: 0 };
       }
       acc[key].score += p.score;
       return acc;
     }, {});
     
     const sortedPlayers = Object.values(aggregatedResults).sort((a, b) => b.score - a.score);
     if (sortedPlayers.length === 0) return <div className="min-h-screen bg-ink flex items-center justify-center font-serif italic text-stone-500">Calculating the Legend...</div>;

     const highestScore = sortedPlayers[0].score;
     const winners = sortedPlayers.filter(p => p.score === highestScore && p.score > 0);
     
     const runnerUpScore = sortedPlayers.find(p => p.score < highestScore)?.score;
     const runners = (runnerUpScore !== undefined && runnerUpScore > 0) ? sortedPlayers.filter(p => p.score === runnerUpScore) : [];

     return (
       <div className="min-h-screen bg-paper flex flex-col items-center py-12 px-6 overflow-hidden relative">
         {/* Party Popups */}
         {[...Array(20)].map((_, i) => (
           <motion.div 
             key={i}
             initial={{ y: '100vh', x: Math.random() * 100 + 'vw', rotate: 0 }}
             animate={{ y: '-10vh', rotate: 360 }}
             transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
             className="absolute pointer-events-none text-2xl"
           >
             {['🎉', '✨', '🎈', '🎊', '⭐️'][i % 5]}
           </motion.div>
         ))}

         <div className="max-w-4xl w-full flex flex-col items-center relative z-10">
           <motion.h1 
             initial={{ y: -20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="text-4xl md:text-5xl font-serif italic text-ink mb-12 text-center"
           >
             {winners.length > 1 ? 'The Legends Emerged' : 'A Legend Has Emerged'}
           </motion.h1>

           {/* WINNERS SECTION */}
           <div className="flex flex-wrap justify-center gap-12 mb-16">
             {winners.map((winner, idx) => {
               const profile = users.find(u => u.name.toLowerCase().trim() === winner.name.toLowerCase().trim());
               return (
                 <motion.div 
                   key={winner.name}
                   drag
                   dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: idx * 0.2 }}
                   className="flex flex-col items-center cursor-grab active:cursor-grabbing z-20"
                 >
                   <div className="relative mb-6">
                     <motion.div 
                       animate={{ rotate: [idx % 2 === 0 ? 3 : -3, idx % 2 === 0 ? -3 : 3, idx % 2 === 0 ? 3 : -3] }} 
                       transition={{ repeat: Infinity, duration: 3 }}
                       className="w-44 h-44 md:w-56 md:h-56 rounded-sm border-8 border-white shadow-2xl bg-stone-100 flex items-center justify-center"
                     >
                       <img src={profile?.photoUrl || 'https://via.placeholder.com/300'} className="w-full h-full object-contain bg-white" alt="" />
                     </motion.div>
                     <div className="absolute -top-8 -right-8 text-7xl drop-shadow-lg pointer-events-none">👑</div>
                     <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-2 text-sm font-mono font-bold rounded-full whitespace-nowrap shadow-xl">
                       {winner.score} POINTS
                     </div>
                   </div>
                   <h2 className="text-3xl md:text-4xl font-serif italic text-ink mt-4 text-center">{winner.name}</h2>
                 </motion.div>
               );
             })}
           </div>

           {/* RUNNERS SECTION */}
           {runners.length > 0 && (
             <div className="w-full border-t border-stone-200 pt-16 text-center">
               <h3 className="text-xl font-serif italic text-stone-400 mb-10 uppercase tracking-[0.3em]">Honorable Runners Up</h3>
               <div className="flex flex-wrap justify-center gap-10">
                 {runners.map((runner, idx) => {
                   const profile = users.find(u => u.name.toLowerCase().trim() === runner.name.toLowerCase().trim());
                   return (
                     <motion.div 
                       key={runner.name}
                       drag
                       dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.5 + idx * 0.1 }}
                       className="flex flex-col items-center cursor-grab active:cursor-grabbing z-10"
                     >
                       <div className="relative mb-4">
                         <motion.div 
                           className="w-32 h-32 md:w-40 md:h-40 rounded-sm border-4 border-white shadow-xl bg-stone-100 flex items-center justify-center"
                         >
                           <img src={profile?.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-contain bg-white" alt="" />
                         </motion.div>
                         <div className="absolute -top-5 -right-5 text-5xl drop-shadow-md pointer-events-none">🥈</div>
                         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-700 text-white px-4 py-1 text-xs font-mono font-bold rounded-full whitespace-nowrap shadow-md">
                           {runner.score} POINTS
                         </div>
                       </div>
                       <h2 className="text-xl md:text-2xl font-serif italic text-ink mt-2 text-center">{runner.name}</h2>
                     </motion.div>
                   );
                 })}
               </div>
             </div>
           )}

           <button onClick={() => window.location.href = '/hub'} className="btn-primary px-12 py-5 mt-20 text-lg shadow-xl uppercase tracking-widest">Return to Hub</button>
         </div>
       </div>
     );
  }

  // AUTO-JOINING STATE
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif italic text-stone-500">Signing you into Chaos...</p>
        </div>
      </div>
    );
  }

  // LOBBY VIEW
  if (gameState?.status === 'lobby') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-2xl">
           <h1 className="text-6xl font-serif italic text-ink mb-2">Class Chaos</h1>
           <p className="text-stone-500 font-serif italic mb-8 uppercase tracking-widest text-[10px]">Prepare for the Mayhem</p>
           <div className="w-16 h-1 bg-accent mx-auto mb-8"></div>
           
           <div className="bg-white/50 border border-stone-200 p-6 rounded-sm mb-8">
             <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">Participants Directory</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
               {displayLeaders.map(p => (
                 <div key={p.id} className="flex justify-between items-center bg-white p-3 border border-stone-100 shadow-sm text-left">
                   <span className="text-xs font-serif italic text-ink truncate mr-2">{p.name}</span>
                   <span className="text-[10px] font-mono font-bold text-stone-300">{p.score}</span>
                 </div>
               ))}
             </div>
           </div>

           <p className="text-stone-400 font-serif italic animate-pulse">Waiting for the Game Master to begin...</p>
        </motion.div>
      </div>
    );
  }

  // FINISHED QUESTIONS, WAITING FOR ADMIN TO END/REVEAL
  if (localIndex >= questions.length && gameState?.status === 'active') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
           <div className="text-6xl mb-8">🏁</div>
           <h2 className="text-4xl font-serif italic text-ink mb-4">Well Done!</h2>
           <p className="text-stone-500 font-serif italic">You've survived the chaos. Waiting for the final results...</p>
        </motion.div>
      </div>
    );
  }

  // GAME ENDED (WAITING FOR REVEAL)
  if (gameState?.status === 'ended') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
           <h1 className="text-5xl font-serif italic text-ink mb-4">Game Concluded</h1>
           <p className="text-stone-500 font-serif italic">The chaos is over. Who emerged as the legend? Reveal coming soon...</p>
        </motion.div>
      </div>
    );
  }

  // ACTIVE GAME VIEW
  return (
    <div className="min-h-screen bg-[#faf9f6] p-6 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400">Memory</span>
          <span className="font-mono text-2xl text-accent">#{localIndex + 1} / {questions.length}</span>
        </div>
        
        <div className="flex flex-col items-center">
           <div className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center text-ink">
              <span className="font-mono text-xl font-bold">⚡</span>
           </div>
           {/* My live score */}
           <span className="text-[10px] font-mono text-accent font-bold mt-1">
             {players.filter(p => p.name.toLowerCase().trim() === myUser?.name.toLowerCase().trim()).reduce((sum, p) => sum + p.score, 0)} pts
           </span>
        </div>

        <div className="flex flex-col items-end">
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400">Leaders</span>
           <div className="flex gap-2 mt-1">
               {displayLeaders.map((p, i) => (
                 <div key={p.id || i} className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-stone-400">#{i+1}</span>
                    <span className="text-xs font-serif italic text-ink">{p.name}</span>
                    <span className="text-xs font-mono font-bold text-accent">{p.score}</span>
                 </div>
               ))}
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!currentQuestion ? (
          <div className="p-20 text-center font-serif italic text-stone-400">Recalling...</div>
        ) : (
          <motion.div 
            key={localIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-3xl"
          >
            <div className="paper-cutout p-8 md:p-12 mb-12">
              {/* Image Guess Type */}
              {currentQuestion.type === 'image_guess' && (
                <div className="space-y-8 flex flex-col items-center">
                  <h2 className="text-2xl md:text-3xl font-serif italic text-center">Identify the person</h2>
                  <div className="w-full rounded-sm shadow-2xl border-8 border-white flex items-center justify-center bg-white p-2">
                    <img src={currentQuestion.data.image} className="w-auto h-auto max-w-full max-h-[55vh] object-contain" alt="Memory" />
                  </div>
                  {!myUser?.isDemo ? (
                    <StudentSelector 
                      value={answer} 
                      onChange={setAnswer} 
                      users={users} 
                      onSubmit={handleSubmit}
                      disabled={hasAnswered}
                    />
                  ) : (
                    <div className="text-stone-400 font-serif italic text-xl mt-4">
                      Projecting for the class... ({demoTimeLeft}s)
                    </div>
                  )}
                </div>
              )}

              {/* Nickname Type */}
              {currentQuestion.type === 'nickname' && (
                <div className="space-y-12 text-center py-12">
                  <h2 className="text-2xl md:text-4xl font-serif italic">Who is famously known as...</h2>
                  <div className="text-5xl md:text-7xl font-serif italic text-accent">
                    "{currentQuestion.data.nickname}"
                  </div>
                  {!myUser?.isDemo ? (
                    <StudentSelector 
                      value={answer} 
                      onChange={setAnswer} 
                      users={users} 
                      onSubmit={handleSubmit}
                      disabled={hasAnswered}
                    />
                  ) : (
                    <div className="text-stone-400 font-serif italic text-xl mt-4">
                      Projecting for the class... ({demoTimeLeft}s)
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Type */}
              {currentQuestion.type === 'timeline' && (
                <div className="space-y-8 flex flex-col items-center">
                  <h2 className="text-2xl md:text-3xl font-serif italic text-center">Arrange Chronologically</h2>
                  
                  {!myUser?.isDemo ? (
                    <>
                      <Reorder.Group 
                        axis="y" 
                        values={timelineOrder} 
                        onReorder={setTimelineOrder}
                        className="w-full grid grid-cols-1 gap-4"
                      >
                        {timelineOrder.map((idx) => (
                          <Reorder.Item 
                            key={idx} 
                            value={idx}
                            className="p-3 bg-white border border-stone-200 rounded-sm shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4 group"
                          >
                            <div className="w-12 h-12 bg-stone-100 flex items-center justify-center font-mono text-stone-300 shrink-0">#</div>
                            <div className="w-24 h-16 md:w-32 md:h-20 bg-stone-50 rounded flex items-center justify-center overflow-hidden shrink-0">
                              <img src={currentQuestion.data.images[idx]} className="w-full h-full object-contain" alt="" />
                            </div>
                            <span className="font-serif italic text-stone-400 group-hover:text-ink">Drag to position</span>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                      <button 
                        disabled={hasAnswered}
                        onClick={handleSubmit} 
                        className="btn-primary w-full py-4 text-xl mt-8 disabled:opacity-50"
                      >
                        {hasAnswered ? 'Submitting...' : 'Confirm Order!'}
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full grid grid-cols-1 gap-4">
                        {timelineOrder.map((idx) => (
                          <div key={idx} className="p-3 bg-white border border-stone-200 rounded-sm shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-100 flex items-center justify-center font-mono text-stone-300 shrink-0">?</div>
                            <div className="w-24 h-16 md:w-32 md:h-20 bg-stone-50 rounded flex items-center justify-center overflow-hidden shrink-0">
                              <img src={currentQuestion.data.images[idx]} className="w-full h-full object-contain" alt="" />
                            </div>
                            <span className="font-serif italic text-stone-400">Class is answering...</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-stone-400 font-serif italic text-xl mt-8">
                        Projecting for the class... ({demoTimeLeft}s)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points earned popup */}
      <AnimatePresence>
        {pointsEarned !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -40 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`text-center px-12 py-8 rounded-sm shadow-2xl border-4 ${pointsEarned > 0 ? 'bg-white border-accent' : 'bg-white border-stone-300'}`}>
              <div className="text-6xl mb-2">{pointsEarned > 0 ? '🎯' : '😬'}</div>
              <div className={`text-5xl font-mono font-bold ${pointsEarned > 0 ? 'text-accent' : 'text-stone-400'}`}>
                {pointsEarned > 0 ? `+${pointsEarned}` : '0'}
              </div>
              <div className="text-xs uppercase tracking-widest font-bold text-stone-400 mt-2">
                {pointsEarned > 0 ? 'Points Earned!' : 'Better luck next time'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentSelector = ({ value, onChange, users, onSubmit, disabled }) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full relative max-w-md mx-auto">
      <div 
        onClick={() => !disabled && setShow(!show)}
        className={`p-4 border-2 border-stone-200 focus:border-accent outline-none text-center font-serif text-xl cursor-pointer ${disabled ? 'bg-stone-50 text-stone-400' : 'bg-white text-ink'}`}
      >
        {value || 'Pick the person...'}
      </div>
      
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-0 right-0 bg-white border-2 border-stone-200 shadow-2xl z-50 max-h-64 overflow-y-auto mb-2"
          >
            <input 
              autoFocus
              type="text" 
              placeholder="Search student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-4 border-b border-stone-100 font-sans sticky top-0 bg-white outline-none"
            />
            {filtered.map(u => (
              <button 
                key={u.id} 
                onClick={() => {
                  onChange(u.name);
                  setShow(false);
                  setSearch('');
                  // Pass name directly — avoids stale answer state in handleSubmit
                  onSubmit(u.name);
                }}
                className="w-full p-4 text-left hover:bg-accent hover:text-white transition-colors border-b border-stone-50 font-serif italic"
              >
                {u.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassChaos;
