import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchChaosQuestions, addChaosQuestion, deleteChaosQuestion, 
  fetchChaosGameState, updateChaosGameState, fetchChaosPlayers,
  fetchUsers, resetChaosGame
} from '../api';
import { supabase } from '../supabaseClient';
import BackButton from '../components/BackButton';

const AdminClassChaos = () => {
  const [questions, setQuestions] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [activeTab, setActiveTab] = useState('image_guess');
  const [formData, setFormData] = useState({
    image: '',
    correctPersonId: '',
    nickname: '',
    answer: '',
    timelineImages: ['', '', '', ''],
    timelineAnswer: [0, 1, 2, 3] // Indices in correct order
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAll();
    const stateSub = supabase.channel('chaos_game_state_admin')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chaos_game_state' }, payload => {
        setGameState(payload.new);
      })
      .subscribe();

    let lastFetch = 0;
    const playerSub = supabase.channel('chaos_players_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chaos_players' }, () => {
        const now = Date.now();
        if (now - lastFetch > 3000) { // Limit refresh rate to every 3 seconds
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

  const loadAll = async () => {
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

  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { compressImage, uploadFile } = await import('../api');
      const compressed = await compressImage(file);
      const url = await uploadFile(compressed);
      callback(url);
    } catch (err) {
      console.error('Question image upload failed:', err);
      alert('Upload failed. Ensure "yaadee" bucket exists in Supabase Storage.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    let qData = {};
    let answer = formData.answer;

    if (activeTab === 'image_guess') {
      if (!formData.image || (!formData.correctPersonId && !formData.answer)) return alert('Image and Answer required');
      qData = { image: formData.image };
      if (!answer && formData.correctPersonId) {
        answer = users.find(u => u.id === formData.correctPersonId).name;
      }
    } else if (activeTab === 'nickname') {
      if (!formData.nickname || (!formData.correctPersonId && !formData.answer)) return alert('Nickname and Answer required');
      qData = { nickname: formData.nickname };
      if (!answer && formData.correctPersonId) {
        answer = users.find(u => u.id === formData.correctPersonId).name;
      }
    } else if (activeTab === 'timeline') {
      if (formData.timelineImages.some(img => !img)) return alert('All 4 images required');
      qData = { images: formData.timelineImages };
      answer = JSON.stringify([0, 1, 2, 3]); 
    }

    if (editingId) {
      await updateChaosQuestion(editingId, { type: activeTab, data: qData, answer });
    } else {
      await addChaosQuestion(activeTab, qData, answer);
    }
    
    alert(editingId ? 'Question updated!' : 'Question added!');
    setFormData({ image: '', correctPersonId: '', nickname: '', answer: '', timelineImages: ['', '', '', ''], timelineAnswer: [0, 1, 2, 3] });
    setEditingId(null);
    loadAll();
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setActiveTab(q.type);
    if (q.type === 'image_guess') {
      setFormData({ ...formData, image: q.data.image, answer: q.answer, correctPersonId: '' });
    } else if (q.type === 'nickname') {
      setFormData({ ...formData, nickname: q.data.nickname, answer: q.answer, correctPersonId: '' });
    } else if (q.type === 'timeline') {
      setFormData({ ...formData, timelineImages: q.data.images, answer: q.answer });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Game Controls
  const startGame = async () => {
    // Immediate local update to feel fast
    setGameState(prev => ({ ...prev, status: 'active', current_question_index: 0, is_paused: false }));
    await updateChaosGameState({ status: 'active', current_question_index: 0, is_paused: false });
  };
  
  const endGame = async () => {
    setGameState(prev => ({ ...prev, status: 'ended' }));
    await updateChaosGameState({ status: 'ended' });
  };

  const revealWinner = async () => {
    setGameState(prev => ({ ...prev, status: 'revealed' }));
    await updateChaosGameState({ status: 'revealed' });
  };

  const resetGame = async () => {
    await resetChaosGame();
    loadAll();
  };

  if (loading) return <div className="p-8 font-serif italic">Accessing the chaos...</div>;

  return (
    <div className="min-h-screen bg-paper p-6 md:p-12 selection:bg-accent/20">
      <BackButton />
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-stone-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif italic text-ink">Manage Class Chaos</h1>
          <p className="text-stone-500 mt-2 font-serif italic">Synchronized Mayhem Control Center</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Question Creation */}
          <div className="lg:col-span-2 space-y-8">
            <section className="paper-cutout p-8">
              <h2 className="text-2xl font-serif italic mb-6 text-accent">{editingId ? 'Edit Question' : 'Create Questions'}</h2>
              
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['image_guess', 'timeline', 'nickname'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-ink text-paper scale-105 shadow-md' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                {activeTab === 'image_guess' && (
                  <div className="space-y-4">
                    <div className="bg-stone-50 p-6 border border-stone-200">
                       <label className="text-xs text-stone-500 font-bold uppercase block mb-2">Upload Memory Photo</label>
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (b) => setFormData({...formData, image: b}))} className="text-sm w-full" />
                       {formData.image && <img src={formData.image} className="mt-4 w-32 h-32 object-cover rounded shadow-sm" alt="" />}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-stone-400 font-bold uppercase">Correct Answer (Select Student)</label>
                      <StudentSelector 
                        value={formData.answer} 
                        onChange={(val) => setFormData({...formData, answer: val})} 
                        users={users} 
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'nickname' && (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Enter Nickname..."
                      value={formData.nickname}
                      onChange={e => setFormData({...formData, nickname: e.target.value})}
                      className="w-full p-3 border border-stone-300 font-serif italic"
                    />
                    <div className="space-y-2">
                      <label className="text-xs text-stone-400 font-bold uppercase">Correct Answer (Select Student)</label>
                      <StudentSelector 
                        value={formData.answer} 
                        onChange={(val) => setFormData({...formData, answer: val})} 
                        users={users} 
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="bg-stone-50 p-4 border border-stone-200 text-center">
                        <label className="text-[10px] text-stone-400 font-bold uppercase block mb-2">Phase {i + 1}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (b) => {
                          const newImgs = [...formData.timelineImages];
                          newImgs[i] = b;
                          setFormData({...formData, timelineImages: newImgs});
                        })} className="text-[10px] w-full" />
                        {formData.timelineImages[i] && <img src={formData.timelineImages[i]} className="mt-2 w-full aspect-square object-cover rounded shadow-sm" alt="" />}
                      </div>
                    ))}
                    <p className="col-span-2 text-xs text-stone-400 italic">Order of upload will be the correct chronological order.</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary flex-1 py-4 text-lg">
                    {editingId ? 'Update Question ✓' : 'Save Question'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ image: '', correctPersonId: '', nickname: '', answer: '', timelineImages: ['', '', '', ''], timelineAnswer: [0, 1, 2, 3] });
                      }}
                      className="bg-stone-200 text-stone-600 px-6 py-4 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="paper-cutout p-8">
               <h2 className="text-2xl font-serif italic mb-6">Question List ({questions.length})</h2>
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                 {questions.map((q, i) => (
                   <div key={q.id} className="flex items-center justify-between p-4 border border-stone-100 bg-white group">
                     <div className="flex items-center gap-4">
                        <span className="text-stone-300 font-mono text-xs">{i+1}</span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">{q.type.replace('_', ' ')}</p>
                          <p className="text-sm font-serif italic">Answer: {q.type === 'timeline' ? 'Chronological Order' : q.answer}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => handleEdit(q)} className="text-stone-400 hover:text-ink text-xs font-bold uppercase tracking-widest">Edit</button>
                       <button onClick={() => deleteChaosQuestion(q.id).then(loadAll)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest">Delete</button>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
          </div>

          {/* Section 2: Game Control & Monitoring */}
          <div className="space-y-8">
            <section className="paper-cutout p-8 bg-ink text-paper">
              <h2 className="text-2xl font-serif italic mb-6 text-accent">Game Master</h2>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 border border-stone-800 bg-black/20 rounded-sm">
                   <span className="text-[10px] uppercase tracking-[0.4em] text-stone-500 mb-2">Game Status</span>
                   <span className={`text-2xl font-serif italic ${gameState?.status === 'active' ? 'text-green-400' : 'text-stone-400'}`}>
                     {gameState?.status.toUpperCase()}
                   </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {gameState?.status === 'lobby' && (
                    <button onClick={startGame} className="bg-accent text-white py-4 font-bold rounded-sm shadow-xl hover:scale-105 transition-transform uppercase tracking-widest">Start Chaos &rarr;</button>
                  )}
                  
                  {gameState?.status === 'active' && (
                    <button onClick={endGame} className="bg-red-900 text-white py-4 font-bold rounded-sm shadow-xl uppercase tracking-widest">End Session</button>
                  )}

                  {gameState?.status === 'ended' && (
                    <button onClick={revealWinner} className="bg-accent text-white py-4 font-bold rounded-sm shadow-xl animate-pulse uppercase tracking-widest">Reveal Winner 🏆</button>
                  )}

                  <button onClick={resetGame} className="border border-stone-700 text-stone-500 py-3 text-[10px] uppercase tracking-[0.4em] hover:bg-red-900/10 transition-colors">Reset Lobby</button>
                </div>
              </div>
            </section>

            <section className="paper-cutout p-8">
              <h2 className="text-2xl font-serif italic mb-6 text-ink">Live Leaderboard</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {players.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                       <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${i < 3 ? 'bg-accent text-white' : 'bg-stone-100 text-stone-400'}`}>
                         {i + 1}
                       </span>
                       <span className="font-serif italic text-stone-700">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-accent">{p.score}</span>
                  </div>
                ))}
                {players.length === 0 && <p className="text-center text-stone-400 font-serif italic py-8">Waiting for players...</p>}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

const StudentSelector = ({ value, onChange, users }) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState(value);
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div 
        onClick={() => setShow(!show)}
        className="p-3 border border-stone-300 bg-white cursor-pointer font-serif italic text-ink flex justify-between items-center"
      >
        <span>{value || 'Select Student...'}</span>
        <span className="text-[10px]">▼</span>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 bg-white border border-stone-200 shadow-2xl z-50 max-h-60 overflow-y-auto"
          >
            <input 
              autoFocus
              type="text" 
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 border-b border-stone-100 font-sans sticky top-0 bg-white"
            />
            {filtered.map(u => (
              <button 
                key={u.id}
                onClick={() => {
                  onChange(u.name);
                  setShow(false);
                }}
                className="w-full p-3 text-left hover:bg-stone-50 font-serif italic text-sm border-b border-stone-50"
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

export default AdminClassChaos;
