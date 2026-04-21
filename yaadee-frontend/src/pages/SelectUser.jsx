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

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-serif mb-4">Who are you looking for?</h1>
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-sm border border-stone-300 bg-white/80 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm font-sans"
        />
      </motion.div>

      {loading ? (
        <div className="text-center font-serif text-xl">Dusting off the old records...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredUsers.map((user, index) => {
              const rotationClass = index % 2 === 0 ? 'polaroid-rotate-left' : 'polaroid-rotate-right';
              const isSelected = selectedUser?.id === user.id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`polaroid ${rotationClass} cursor-pointer relative overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-accent z-20 scale-105 rotate-0 shadow-2xl' : ''}`}
                >
                  <div className="aspect-square bg-stone-200 mb-4 overflow-hidden rounded-sm flex items-center justify-center relative">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="text-4xl text-stone-400 font-serif">{user.name.charAt(0)}</div>
                    )}
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none"></div>
                  </div>
                  <h3 className="font-serif text-center text-lg">{user.name}</h3>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Continue Button */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <button 
              onClick={handleContinue}
              className="btn-primary shadow-2xl pointer-events-auto flex items-center gap-2"
            >
              Continue as <span className="font-serif italic font-bold">{selectedUser.name}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectUser;
