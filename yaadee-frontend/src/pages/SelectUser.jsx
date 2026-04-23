import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers } from '../api';
import PageWrapper from '../components/PageWrapper';

const SelectUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      if (data) setUsers(data);
      setLoading(false);
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name && user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedUser) {
      localStorage.setItem('yaadee_user', JSON.stringify(selectedUser));
      navigate('/hub');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearch(user.name);
    setShowDropdown(false);
  };

  return (
    <PageWrapper style={{ paddingTop: '64px' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center relative max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-serif mb-8 text-warm-brown italic">Identify yourself</h1>
        
        {loading ? (
          <div className="font-serif text-xl text-stone-400 italic">Checking the records...</div>
        ) : (
          <div className="relative max-w-md mx-auto z-30">
            <input 
              type="text" 
              placeholder="Start typing your name..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
                setSelectedUser(null);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-6 py-4 rounded-sm border border-stone-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-soft-yellow shadow-sm font-sans text-lg text-ink"
            />
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 shadow-2xl rounded-sm max-h-64 overflow-y-auto text-left z-50"
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-6 py-4 border-b border-stone-50 hover:bg-soft-yellow/10 cursor-pointer flex items-center gap-4 transition-colors font-serif italic"
                      >
                        <span>{user.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-stone-400 font-sans italic text-sm">No names match that search.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Selected User Display */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="polaroid polaroid-rotate-right mb-12 cursor-default relative">
              <div className="tape-mark -top-3 left-1/2 -translate-x-1/2 rotate-[5deg] w-16"></div>
              <div className="aspect-square w-56 bg-stone-100 mb-6 overflow-hidden rounded-sm flex items-center justify-center relative shadow-inner">
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt={selectedUser.name} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="text-7xl text-stone-300 font-serif">{selectedUser.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>
              </div>
              <h3 className="font-serif text-center text-2xl text-ink italic">{selectedUser.name}</h3>
            </div>

            <button 
              onClick={handleContinue}
              className="btn-primary shadow-2xl flex items-center gap-3 text-lg px-12 py-5 bg-warm-brown"
            >
              Confirm Identity <span className="font-serif italic font-bold text-soft-yellow">{selectedUser.name}</span> &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

export default SelectUser;
