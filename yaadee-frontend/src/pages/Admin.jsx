import React, { useState, useEffect } from 'react';
import { fetchPolls, createPoll, startPoll, closePoll, fetchPollResults } from '../api';
import PageWrapper from '../components/PageWrapper';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [polls, setPolls] = useState([]);
  
  // New poll state
  const [question, setQuestion] = useState('');
  const [optionsStr, setOptionsStr] = useState('');

  // Results state
  const [results, setResults] = useState(null);
  const [resultsPollId, setResultsPollId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPolls();
    }
  }, [isAuthenticated]);

  const loadPolls = async () => {
    const data = await fetchPolls();
    if (data) setPolls(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password for now
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const optionsArray = optionsStr.split(',').map(o => o.trim()).filter(o => o);
    if (!question || optionsArray.length === 0) return alert('Question and options are required');
    
    await createPoll(question, optionsArray);
    setQuestion('');
    setOptionsStr('');
    loadPolls();
  };

  const handleStartPoll = async (id) => {
    await startPoll(id);
    loadPolls();
  };

  const handleClosePoll = async (id) => {
    await closePoll(id);
    loadPolls();
  };

  const handleViewResults = async (id) => {
    const data = await fetchPollResults(id);
    if (data) {
      // Calculate tallies
      const tallies = {};
      data.forEach(vote => {
        tallies[vote.selected_option] = (tallies[vote.selected_option] || 0) + 1;
      });
      setResults(tallies);
      setResultsPollId(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password"
              style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
            />
            <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
          </form>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <h2>Admin Dashboard</h2>
        
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Create New Poll</h3>
          <form onSubmit={handleCreatePoll}>
            <div style={{ marginBottom: '10px' }}>
              <label>Question:</label>
              <input type="text" value={question} onChange={e => setQuestion(e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Options (comma separated):</label>
              <input type="text" value={optionsStr} onChange={e => setOptionsStr(e.target.value)} placeholder="Alice, Bob, Charlie" style={{ width: '100%', padding: '8px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 20px' }}>Create Poll</button>
          </form>
        </div>

        <div>
          <h3>Manage Polls</h3>
          {polls.length === 0 && <p>No polls created yet.</p>}
          {polls.map(poll => (
            <div key={poll.id} style={{ padding: '15px', border: '1px solid #ccc', marginBottom: '10px', borderRadius: '5px' }}>
              <strong>{poll.question}</strong> - Status: <span style={{ color: poll.status === 'active' ? 'green' : 'white' }}>{poll.status}</span>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                {poll.status === 'pending' && <button onClick={() => handleStartPoll(poll.id)} style={{ padding: '5px 10px', background: 'green', color: 'white' }}>Start Live Poll</button>}
                {poll.status === 'active' && <button onClick={() => handleClosePoll(poll.id)} style={{ padding: '5px 10px', background: 'red', color: 'white' }}>End Poll Now</button>}
                {poll.status === 'completed' && <button onClick={() => handleViewResults(poll.id)} style={{ padding: '5px 10px' }}>View Results</button>}
              </div>

              {resultsPollId === poll.id && results && (
                <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
                  <h4>Results:</h4>
                  {Object.entries(results).map(([option, count]) => (
                    <div key={option}>{option}: {count} votes</div>
                  ))}
                  {Object.keys(results).length === 0 && <div>No votes cast.</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Admin;
