import React, { useState, useEffect } from 'react';
import { 
  fetchPolls, createPoll, startPoll, closePoll, fetchPollResults, deletePoll,
  fetchUsers, addUser, deleteUser,
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
  const [newPoll, setNewPoll] = useState({ question: '', options: '' });
  const [newQuestion, setNewQuestion] = useState({ text: '', options: '', correctAnswer: '' });

  // Poll Results
  const [results, setResults] = useState(null);
  const [resultsPollId, setResultsPollId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
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

  // --- Users ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name) return alert('Name is required');
    await addUser(newUser.name, newUser.photoUrl);
    setNewUser({ name: '', photoUrl: '' });
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
    const optionsArray = newPoll.options.split(',').map(o => o.trim()).filter(o => o);
    if (!newPoll.question || optionsArray.length === 0) return alert('Question and options are required');
    
    await createPoll(newPoll.question, optionsArray);
    setNewPoll({ question: '', options: '' });
    loadAllData();
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
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <h1 className="font-serif text-5xl text-center mb-12">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BOX 1: USER MANAGEMENT */}
        <div className="paper-cutout p-6">
          <h2 className="font-serif text-2xl mb-4 text-accent">People Directory</h2>
          
          <form onSubmit={handleAddUser} className="mb-6 flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
            <h3 className="font-sans font-bold text-sm text-stone-500 uppercase tracking-wider">Add New Person</h3>
            <input type="text" placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <input type="text" placeholder="Photo URL (optional)" value={newUser.photoUrl} onChange={e => setNewUser({...newUser, photoUrl: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <button type="submit" className="bg-ink text-paper py-2 px-4 hover:bg-stone-700 transition">Save Person</button>
          </form>

          <div className="max-h-96 overflow-y-auto pr-2 flex flex-col gap-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-stone-200 bg-white">
                <div className="flex items-center gap-3">
                  {u.photoUrl ? (
                    <img src={u.photoUrl} alt="profile" className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-serif">{u.name.charAt(0)}</div>
                  )}
                  <span className="font-sans font-bold">{u.name}</span>
                </div>
                <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 text-sm font-bold px-2 py-1">Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* BOX 2: WALL OF FAME (POLLS) */}
        <div className="paper-cutout p-6">
          <h2 className="font-serif text-2xl mb-4 text-accent">Wall of Fame (Polls)</h2>
          
          <form onSubmit={handleCreatePoll} className="mb-6 flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
            <h3 className="font-sans font-bold text-sm text-stone-500 uppercase tracking-wider">Create New Poll</h3>
            <input type="text" placeholder="Question (e.g. Most likely to...)" value={newPoll.question} onChange={e => setNewPoll({...newPoll, question: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <input type="text" placeholder="Options (comma separated)" value={newPoll.options} onChange={e => setNewPoll({...newPoll, options: e.target.value})} className="p-2 border border-stone-300 w-full" />
            <button type="submit" className="bg-ink text-paper py-2 px-4 hover:bg-stone-700 transition">Save Poll</button>
          </form>

          <div className="max-h-96 overflow-y-auto pr-2 flex flex-col gap-3">
            {polls.map(poll => (
              <div key={poll.id} className="p-4 border border-stone-200 bg-white relative">
                <button onClick={() => handleDeletePoll(poll.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 text-xs font-bold">X</button>
                <div className="font-serif text-lg mb-1 pr-6">{poll.question}</div>
                <div className="text-xs text-stone-500 mb-3">Status: <span className={`font-bold ${poll.status === 'active' ? 'text-green-500' : 'text-stone-500'}`}>{poll.status.toUpperCase()}</span></div>
                
                <div className="flex gap-2">
                  {poll.status === 'pending' && <button onClick={() => handleStartPoll(poll.id)} className="bg-green-600 text-white px-3 py-1 text-sm hover:bg-green-700">Start Poll</button>}
                  {poll.status === 'active' && <button onClick={() => handleClosePoll(poll.id)} className="bg-red-500 text-white px-3 py-1 text-sm hover:bg-red-600">Stop Poll</button>}
                  {poll.status === 'completed' && <button onClick={() => handleViewResults(poll.id)} className="bg-stone-200 text-ink border border-stone-300 px-3 py-1 text-sm hover:bg-stone-300">Results</button>}
                </div>

                {resultsPollId === poll.id && results && (
                  <div className="mt-4 p-3 bg-stone-50 border border-stone-200">
                    <h4 className="font-serif mb-2">Highest Voted:</h4>
                    {Object.keys(results).length > 0 ? (() => {
                      const maxVotes = Math.max(...Object.values(results));
                      const winners = Object.keys(results).filter(opt => results[opt] === maxVotes);
                      return (
                        <div>
                          {winners.map(w => (
                            <div key={w} className="font-bold text-accent text-lg">{w} <span className="text-stone-500 text-sm font-normal">({maxVotes} votes)</span></div>
                          ))}
                        </div>
                      );
                    })() : <div className="text-stone-500 italic">No votes cast.</div>}
                    
                    <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-500">
                      All Options: {Object.entries(results).map(([opt, count]) => `${opt}: ${count}`).join(' | ')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

      </div>
    </div>
  );
};

export default Admin;
