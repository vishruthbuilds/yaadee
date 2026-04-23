import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPolls, deletePoll, startPoll, closePoll, extendPoll, subscribeToVotes, fetchPollResults } from '../api';

const AdminPolls = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveVotes, setLiveVotes] = useState({});
  const [activeSubscriptions, setActiveSubscriptions] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 500);
    loadPolls();
    return () => {
      clearInterval(timer);
      // Cleanup subscriptions when leaving page
      Object.values(activeSubscriptions).forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
      });
    };
  }, []);

  const loadPolls = async () => {
    setLoading(true);
    const data = await fetchPolls();
    if (data) {
      setPolls(data);
      // For any active poll, fetch current results and subscribe to new votes
      data.forEach(poll => {
        if (poll.status === 'active') {
          setupLiveLeaderboard(poll.id);
        }
      });
    }
    setLoading(false);
  };

  const setupLiveLeaderboard = async (pollId) => {
    // Fetch initial votes
    const existingVotes = await fetchPollResults(pollId);
    const initialTallies = {};
    if (existingVotes) {
      existingVotes.forEach(v => {
        initialTallies[v.selected_option] = (initialTallies[v.selected_option] || 0) + 1;
      });
    }
    
    setLiveVotes(prev => ({ ...prev, [pollId]: initialTallies }));

    // Subscribe to new votes
    if (!activeSubscriptions[pollId]) {
      const sub = subscribeToVotes(pollId, (newVote) => {
        setLiveVotes(prev => {
          const pollVotes = { ...(prev[pollId] || {}) };
          pollVotes[newVote.selected_option] = (pollVotes[newVote.selected_option] || 0) + 1;
          return { ...prev, [pollId]: pollVotes };
        });
      });
      setActiveSubscriptions(prev => ({ ...prev, [pollId]: sub }));
    }
  };

  const handleStartPoll = async (id) => {
    await startPoll(id, 30);
    loadPolls();
  };

  const handleEndPoll = async (id) => {
    await closePoll(id);
    if (activeSubscriptions[id] && typeof activeSubscriptions[id].unsubscribe === 'function') {
      activeSubscriptions[id].unsubscribe();
    }
    loadPolls();
  };

  const handleAddTime = async (id) => {
    await extendPoll(id, 10);
    alert('Added 10 seconds to the poll!');
    loadPolls();
  };

  const handleDeletePoll = async (id) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(id);
      loadPolls();
    }
  };

  const handleViewResults = async (id) => {
    const existingVotes = await fetchPollResults(id);
    const initialTallies = {};
    if (existingVotes) {
      existingVotes.forEach(v => {
        initialTallies[v.selected_option] = (initialTallies[v.selected_option] || 0) + 1;
      });
    }
    setLiveVotes(prev => ({ ...prev, [id]: initialTallies }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto pt-16 md:pt-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="font-serif text-3xl md:text-4xl text-ink">All Saved Polls</h1>
        <button onClick={() => navigate('/admin')} className="btn-primary py-2 px-4 text-sm w-full md:w-auto">
          Back to Admin
        </button>
      </div>

      <div className="paper-cutout p-6">
        {loading ? (
          <p className="font-serif text-stone-500">Loading polls...</p>
        ) : polls.length === 0 ? (
          <p className="font-serif text-stone-500 italic">No polls created yet.</p>
        ) : (
            <div className="space-y-12">
              {/* SECTION: ACTIVE & PENDING */}
              <section>
                <h2 className="text-xl font-bold uppercase tracking-widest text-accent mb-6 border-b border-accent/20 pb-2">Active & Pending Polls</h2>
                <div className="flex flex-col gap-6">
                  {polls.filter(p => p.status !== 'completed').length === 0 ? (
                    <p className="font-serif italic text-stone-400">No active polls. Create one in the console.</p>
                  ) : (
                    polls.filter(p => p.status !== 'completed').map(poll => (
                      <div key={poll.id} className="p-6 border border-stone-200 bg-white relative shadow-md">
                        <button onClick={() => handleDeletePoll(poll.id)} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 font-bold transition text-xs uppercase tracking-tighter">Discard</button>
                        <h3 className="font-serif text-2xl pr-20 mb-2">{poll.question}</h3>
                        <div className="mb-4">
                          <span className={`font-bold px-2 py-1 rounded-sm text-[10px] uppercase tracking-widest ${poll.status === 'active' ? 'bg-green-600 text-white animate-pulse' : 'bg-yellow-500 text-white'}`}>
                            {poll.status}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          {poll.status === 'pending' && (
                            <button onClick={() => handleStartPoll(poll.id)} className="bg-ink text-white font-bold px-8 py-3 rounded-sm hover:scale-105 transition-transform shadow-lg uppercase tracking-widest text-xs">
                              LAUCH POLL &rarr;
                            </button>
                          )}
                          {poll.status === 'active' && (
                            <>
                              <button onClick={() => handleEndPoll(poll.id)} className="bg-red-900 text-white font-bold px-6 py-3 rounded-sm hover:bg-red-800 transition uppercase tracking-widest text-xs shadow-lg">
                                STOP EARLY
                              </button>
                              <button onClick={() => handleAddTime(poll.id)} className="bg-stone-800 text-white font-bold px-6 py-3 rounded-sm hover:bg-black transition uppercase tracking-widest text-xs shadow-lg">
                                +10s
                              </button>
                              {poll.options && poll.options[0] && (
                                <div className="flex items-center ml-4 bg-stone-100 px-4 py-2 rounded-full">
                                  <span className="font-mono font-bold text-lg text-red-600">
                                    00:{Math.max(0, Math.floor((new Date(poll.options[0]).getTime() - currentTime) / 1000)).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {poll.status === 'active' && (
                           <div className="mt-8 p-6 bg-stone-50 border-t border-stone-200">
                             <h4 className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-4 text-center">🔴 Live Feedback</h4>
                             {liveVotes[poll.id] && Object.keys(liveVotes[poll.id]).length > 0 ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {Object.entries(liveVotes[poll.id])
                                   .sort(([, a], [, b]) => b - a)
                                   .map(([name, count]) => (
                                     <div key={name} className="flex justify-between items-center bg-white p-3 border border-stone-100 shadow-sm">
                                       <span className="font-serif text-lg">{name}</span>
                                       <span className="font-bold text-accent px-3 py-1 rounded-full text-xs">{count}</span>
                                     </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="text-center text-stone-400 italic text-xs py-4">Awaiting first vote...</div>
                             )}
                           </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* SECTION: COMPLETED (WALL OF FAME) */}
              <section>
                <h2 className="text-xl font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-stone-200 pb-2">Wall of Fame Archive</h2>
                <div className="flex flex-col gap-4">
                  {polls.filter(p => p.status === 'completed').length === 0 ? (
                    <p className="font-serif italic text-stone-400">No completed polls yet.</p>
                  ) : (
                    polls.filter(p => p.status === 'completed').map(poll => (
                      <div key={poll.id} className="p-4 border border-stone-100 bg-white/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white transition-colors">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">{poll.question}</p>
                          <div className="flex items-center gap-3">
                            <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">COMPLETED</span>
                            {liveVotes[poll.id] && (
                              <p className="text-sm font-serif italic text-ink">
                                Winner: <span className="font-bold text-accent">{Object.entries(liveVotes[poll.id]).sort(([,a],[,b]) => b-a)[0]?.[0] || 'N/A'}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                           {!liveVotes[poll.id] && (
                             <button onClick={() => handleViewResults(poll.id)} className="text-[10px] font-bold uppercase tracking-widest text-ink hover:underline">Verify Winner</button>
                           )}
                           <button 
                             onClick={() => handleDeletePoll(poll.id)} 
                             className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition p-2 bg-red-50 rounded group-hover:bg-red-100"
                           >
                             Remove from Wall
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolls;
