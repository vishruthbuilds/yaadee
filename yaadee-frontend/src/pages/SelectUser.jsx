import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers } from '../api';

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
    user.name.toLowerCase().includes(search.toLowerCase())
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
    <div className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center pt-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center relative"
      >
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-ink">Identify yourself</h1>
        
        {loading ? (
          <div className="font-serif text-xl text-stone-500">Checking the records...</div>
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
              className="w-full px-6 py-4 rounded-sm border border-stone-300 bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-accent shadow-sm font-sans text-lg text-ink"
            />
            
            <AnimatePresence>
              {showDropdown && search.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-sm max-h-64 overflow-y-auto text-left"
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-6 py-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer flex items-center gap-4 transition-colors"
                      >
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="w-10 h-10 object-cover rounded-full shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center font-serif text-stone-600 shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-serif text-lg">{user.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-stone-400 font-sans italic">No names match that search.</div>
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
            <div className="polaroid polaroid-rotate-right mb-8 cursor-default">
              <div className="aspect-square w-48 bg-stone-200 mb-4 overflow-hidden rounded-sm flex items-center justify-center relative">
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt={selectedUser.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-6xl text-stone-400 font-serif">{selectedUser.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none"></div>
              </div>
              <h3 className="font-serif text-center text-xl">{selectedUser.name}</h3>
            </div>

            <button 
              onClick={handleContinue}
              className="btn-primary shadow-xl flex items-center gap-2 text-lg"
            >
              Continue as <span className="font-serif italic font-bold">{selectedUser.name}</span> &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectUser;
