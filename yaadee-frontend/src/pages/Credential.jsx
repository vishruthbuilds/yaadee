import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchUsers } from '../api';
import PageWrapper from '../components/PageWrapper';

const Credential = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers().then(data => {
      if (data) setUsers(data);
    });
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleProceed = () => {
    if (selectedUser) {
      localStorage.setItem('yaadee_user', JSON.stringify(selectedUser));
      navigate(`/scrapbook/${selectedUser.id}`);
    }
  };

  return (
    <PageWrapper style={styles.page}>
      <motion.div className="scrapbook-card w-full max-w-md mx-auto text-center p-12" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <div className="tape-mark -top-2 left-1/2 -translate-x-1/2"></div>
        <h2 className="text-4xl md:text-5xl font-serif text-warm-brown mb-6">Who are you?</h2>
        <p className="mb-8 text-stone-500 font-serif italic">Find your name to unlock your memories.</p>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type your name..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null);
            }}
            className="w-full px-6 py-4 rounded-sm border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-soft-yellow shadow-inner font-sans text-lg text-ink"
          />

          {searchTerm && !selectedUser && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 shadow-2xl rounded-sm max-h-48 overflow-y-auto z-50 text-left">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <li key={user.id} className="px-6 py-4 border-b border-stone-50 hover:bg-soft-yellow/10 cursor-pointer transition-colors font-serif italic" onClick={() => {
                  setSelectedUser(user);
                  setSearchTerm(user.name);
                }}>
                  {user.name}
                </li>
              )) : <li className="px-6 py-4 text-stone-400 font-serif italic">No one found :(</li>}
            </ul>
          )}
        </div>

        <button 
          className="btn-primary w-full mt-10 bg-warm-brown hover:bg-stone-800" 
          disabled={!selectedUser}
          onClick={handleProceed}
        >
          Open My Scrapbook
        </button>
      </motion.div>
    </PageWrapper>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '0px'
  }
};

export default Credential;
