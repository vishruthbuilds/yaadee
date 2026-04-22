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
    user.name && user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user) => {
    setSelectedUser(user);
    setSearch(user.name);
    setShowDropdown(false);
  };

  const handleContinue = () => {
    if (selectedUser) {
      localStorage.setItem('yaadee_user', JSON.stringify(selectedUser));
      navigate('/hub');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center relative z-10"
      >
        <span className="text-accent uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium">Identity Verification</span>
        <h1 className="text-5xl md:text-7xl font-serif mb-12 text-ink italic">Identify yourself<span className="text-accent font-normal">.</span></h1>
        
        {loading ? (
          <div className="font-serif text-2xl text-stone-400 italic animate-pulse">Consulting the records...</div>
        ) : (
          <div className="relative max-w-md mx-auto z-30">
            <input 
              type="text" 
              placeholder="Search the archive for your name..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
                setSelectedUser(null);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-6 py-5 rounded-sm border border-stone-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-accent transition-all shadow-sm font-serif text-xl italic text-ink"
            />
            
            <AnimatePresence>
              {showDropdown && search && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 shadow-2xl rounded-sm max-h-64 overflow-y-auto text-left z-50"
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => handleSelect(user)}
                        className="px-6 py-4 border-b border-stone-50 hover:bg-accent/5 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <span className="font-serif text-lg group-hover:text-accent transition-colors italic">{user.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-stone-300 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all">Select</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-stone-400 font-sans italic text-sm">No match found in the records.</div>
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="polaroid polaroid-rotate-right mb-10 cursor-default scale-110">
              <div className="aspect-square w-48 bg-stone-100 mb-4 overflow-hidden rounded-sm flex items-center justify-center relative">
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt={selectedUser.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-7xl text-stone-200 font-serif italic">{selectedUser.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></div>
              </div>
              <h3 className="font-serif text-center text-2xl italic text-ink">{selectedUser.name}</h3>
            </div>

            <button 
              onClick={handleContinue}
              className="btn-primary flex items-center gap-4 group"
            >
              Continue to Hub
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectUser;
