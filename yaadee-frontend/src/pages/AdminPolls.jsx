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
    <div className="min-h-screen p-8 max-w-5xl mx-auto pt-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl text-ink">All Saved Polls</h1>
        <button onClick={() => navigate('/admin')} className="btn-primary py-2 px-4 text-sm">
          Back to Admin
        </button>
      </div>

      <div className="paper-cutout p-6">
        {loading ? (
          <p className="font-serif text-stone-500">Loading polls...</p>
        ) : polls.length === 0 ? (
          <p className="font-serif text-stone-500 italic">No polls created yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {polls.map(poll => (
              <div key={poll.id} className="p-6 border border-stone-200 bg-white relative shadow-sm">
                <button onClick={() => handleDeletePoll(poll.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 font-bold transition">Delete</button>
                
                <h3 className="font-serif text-2xl pr-16 mb-2">{poll.question}</h3>
                
                <div className="mb-4">
                  Status: <span className={`font-bold px-2 py-1 rounded-sm text-xs uppercase tracking-wider ${poll.status === 'active' ? 'bg-green-100 text-green-700' : poll.status === 'completed' ? 'bg-stone-200 text-stone-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {poll.status}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  {poll.status === 'pending' && (
                    <button onClick={() => handleStartPoll(poll.id)} className="bg-green-600 text-white font-bold px-6 py-2 rounded-sm hover:bg-green-700 transition">
                      START POLL
                    </button>
                  )}
                  {poll.status === 'active' && (
                    <>
                      <button onClick={() => handleEndPoll(poll.id)} className="bg-red-500 text-white font-bold px-6 py-2 rounded-sm hover:bg-red-600 transition">
                        END POLL EARLY
                      </button>
                      <button onClick={() => handleAddTime(poll.id)} className="bg-blue-500 text-white font-bold px-6 py-2 rounded-sm hover:bg-blue-600 transition">
                        +10 SECONDS
                      </button>
                      
                      {poll.options && poll.options[0] && (
                        <div className="flex items-center ml-4">
                          <span className="font-sans font-bold text-xl text-red-500 animate-pulse">
                            ⏳ {Math.max(0, Math.floor((new Date(poll.options[0]).getTime() - currentTime) / 1000))}s
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {poll.status === 'completed' && (
                    <button onClick={() => handleViewResults(poll.id)} className="bg-stone-200 text-ink font-bold border border-stone-300 px-6 py-2 rounded-sm hover:bg-stone-300 transition">
                      SHOW FINAL RESULTS
                    </button>
                  )}
                </div>

                {/* Leaderboard Section */}
                {(poll.status === 'active' || (poll.status === 'completed' && liveVotes[poll.id])) && (
                  <div className="mt-6 p-4 bg-stone-50 border border-stone-200">
                    <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-stone-500 mb-3">
                      {poll.status === 'active' ? '🔴 Live Leaderboard' : 'Final Results'}
                    </h4>
                    
                    {liveVotes[poll.id] && Object.keys(liveVotes[poll.id]).length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {Object.entries(liveVotes[poll.id])
                          .sort(([, a], [, b]) => b - a)
                          .map(([name, count]) => (
                            <div key={name} className="flex justify-between items-center bg-white p-2 border border-stone-100 shadow-sm">
                              <span className="font-serif text-lg">{name}</span>
                              <span className="font-bold text-accent bg-stone-100 px-3 py-1 rounded-full">{count} votes</span>
                            </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-stone-400 italic text-sm">No votes yet...</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolls;
