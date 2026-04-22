import React, { useState, useEffect } from 'react';
import { 
  fetchPolls, createPoll, startPoll, closePoll, fetchPollResults, deletePoll,
  fetchUsers, addUser, updateUser, deleteUser,
  fetchQuestions, addQuestion, deleteQuestion
} from '../api';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data states
  const [polls, setPolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', photoUrl: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', photoUrl: '' });
  
  const [newPoll, setNewPoll] = useState({ question: '', options: '' });
  const [newQuestion, setNewQuestion] = useState({ text: '', options: '', correctAnswer: '' });

  // Poll Results
  const [results, setResults] = useState(null);
  const [resultsPollId, setResultsPollId] = useState(null);

  useEffect(() => {
    const adminSession = localStorage.getItem('yaadee_admin_auth');
    if (adminSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      localStorage.setItem('yaadee_admin_auth', 'true');
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    const pData = await fetchPolls();
    if (pData) setPolls(pData);
    
    const uData = await fetchUsers();
    if (uData) setUsers(uData);

    const qData = await fetchQuestions();
    if (qData) setQuestions(qData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'V!sh@Yaadee') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // --- Image Upload to Base64 Helper ---
  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size (prevent extremely large files from crashing Supabase)
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result); // This is the Base64 string
    };
    reader.readAsDataURL(file);
  };

  // --- Users ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name) return alert('Name is required');
    const result = await addUser(newUser.name, newUser.photoUrl);
    if (result.error) {
      alert('Error adding user: ' + result.error.message);
    } else {
      setNewUser({ name: '', photoUrl: '' });
      loadAllData();
      alert('Person successfully saved!');
    }
  };

  const handleStartEditUser = (u) => {
    setEditingUserId(u.id);
    setEditUserForm({ name: u.name, photoUrl: u.photoUrl || '' });
  };

  const handleSaveEditUser = async (id) => {
    if (!editUserForm.name) return alert('Name is required');
    await updateUser(id, editUserForm.name, editUserForm.photoUrl);
    setEditingUserId(null);
    loadAllData();
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
      loadAllData();
    }
  };

  // --- Polls ---
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPoll.question) return alert('Question is required');
    
    await createPoll(newPoll.question);
    setNewPoll({ question: '', options: '' });
    loadAllData();
    alert("Poll created!");
  };

  const handleStartPoll = async (id) => {
    await startPoll(id);
    loadAllData();
  };

  const handleClosePoll = async (id) => {
    await closePoll(id);
    loadAllData();
  };

  const handleDeletePoll = async (id) => {
    if (window.confirm("Delete this poll forever?")) {
      await deletePoll(id);
      loadAllData();
    }
  }

  const handleViewResults = async (id) => {
    if (resultsPollId === id) {
      setResultsPollId(null);
      return;
    }
    const data = await fetchPollResults(id);
    if (data) {
      const tallies = {};
      data.forEach(vote => {
        tallies[vote.selected_option] = (tallies[vote.selected_option] || 0) + 1;
      });
      setResults(tallies);
      setResultsPollId(id);
    }
  };

  // --- Questions (Class Chaos) ---
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const optionsArray = newQuestion.options.split(',').map(o => o.trim()).filter(o => o);
    if (!newQuestion.text || optionsArray.length === 0 || !newQuestion.correctAnswer) return alert('All fields required');
    
    await addQuestion(newQuestion.text, optionsArray, newQuestion.correctAnswer);
    setNewQuestion({ text: '', options: '', correctAnswer: '' });
    loadAllData();
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Delete this question?")) {
      await deleteQuestion(id);
      loadAllData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="paper-cutout p-8 max-w-sm w-full text-center">
          <h2 className="font-serif text-3xl mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password"
              className="p-3 border border-stone-300 w-full focus:outline-none focus:border-accent"
            />
            <button type="submit" className="btn-primary w-full">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center relative mb-8 md:mb-12">
        <h1 className="font-serif text-3xl md:text-5xl text-center">Admin Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('yaadee_admin_auth');
            setIsAuthenticated(false);
          }}
          className="md:absolute right-0 mt-4 md:mt-0 text-sm font-bold text-stone-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Logout &times;
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* BOX 1: USER MANAGEMENT */}
        <div className="paper-cutout p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-accent">People Directory</h2>
            <button 
              onClick={() => window.location.href = '/admin/users'} 
              className="bg-stone-200 text-ink px-4 py-1 rounded-sm text-sm font-bold hover:bg-stone-300 transition"
            >
              View All People &rarr;
            </button>
          </div>
          
          <form onSubmit={handleAddUser} className="mb-6 flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
            <h3 className="font-sans font-bold text-sm text-stone-500 uppercase tracking-wider">Add New Person</h3>
            <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Upload Photo (Max 2MB)</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (base64) => setNewUser({...newUser, photoUrl: base64}))} className="text-sm w-full" />
            </div>
            {newUser.photoUrl && (
              <div className="mt-2">
                <p className="text-xs text-stone-400 mb-1">Preview:</p>
                <img src={newUser.photoUrl} alt="preview" className="w-16 h-16 object-cover rounded-sm border border-stone-300" />
              </div>
            )}
            <button type="submit" className="bg-ink text-paper py-2 px-4 mt-2 hover:bg-stone-700 transition">Save Person</button>
          </form>
        </div>

        {/* BOX 2: WALL OF FAME (POLLS) */}
        <div className="paper-cutout p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-accent">Wall of Fame (Polls)</h2>
            <button 
              onClick={() => window.location.href = '/admin/polls'} 
              className="bg-stone-200 text-ink px-4 py-1 rounded-sm text-sm font-bold hover:bg-stone-300 transition"
            >
              View All Polls &rarr;
            </button>
          </div>
          
          <form onSubmit={handleCreatePoll} className="mb-6 flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
            <h3 className="font-sans font-bold text-sm text-stone-500 uppercase tracking-wider">Create New Poll</h3>
            <input type="text" placeholder="Question (e.g. Most likely to...)" value={newPoll.question} onChange={e => setNewPoll({...newPoll, question: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <button type="submit" className="bg-ink text-paper py-2 px-4 hover:bg-stone-700 transition">Save Poll</button>
          </form>
        </div>

        {/* BOX 3: CLASS CHAOS (GAMES) */}
        <div className="paper-cutout p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl mb-4 text-accent">Class Chaos (Games/Questions)</h2>
          
          <form onSubmit={handleAddQuestion} className="mb-6 flex flex-col md:flex-row gap-3 bg-stone-50 p-4 border border-stone-200">
            <input type="text" placeholder="Question" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="p-2 border border-stone-300 flex-1" />
            <input type="text" placeholder="Options (comma separated)" value={newQuestion.options} onChange={e => setNewQuestion({...newQuestion, options: e.target.value})} className="p-2 border border-stone-300 flex-1" />
            <input type="text" placeholder="Correct Answer" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})} className="p-2 border border-stone-300 flex-1" />
            <button type="submit" className="bg-ink text-paper py-2 px-6 hover:bg-stone-700 transition">Save</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map(q => (
              <div key={q.id} className="p-4 border border-stone-200 bg-white relative">
                <button onClick={() => handleDeleteQuestion(q.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 text-xs font-bold">X</button>
                <div className="font-serif pr-4 mb-2">{q.text}</div>
                <div className="text-xs text-stone-500 mb-1">Options: {Array.isArray(q.options) ? q.options.join(', ') : q.options}</div>
                <div className="text-xs font-bold text-green-600">Answer: {q.correctAnswer}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BOX 4: TIME CAPSULE */}
        <div className="paper-cutout p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="font-serif text-2xl mb-2 text-accent italic">Time Capsule Manager</h2>
              <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">
                The ultimate interactive memory journey. Configure the 3D flipping book, the horizontal cinematic reel, and the final immersive video memory.
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/admin/time-capsule'} 
              className="bg-ink text-paper py-4 px-8 rounded-sm font-bold hover:bg-stone-700 transition shadow-xl whitespace-nowrap"
            >
              ⏳ Configure Time Capsule &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
