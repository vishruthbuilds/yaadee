import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchScrapbook } from '../api';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';

const Scrapbook = () => {
  const { id } = useParams();
  const [scrapbook, setScrapbook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // We would normally fetch user details as well, using localStorage for simplicity
    const saved = localStorage.getItem('yaadee_user');
    if (saved) setCurrentUser(JSON.parse(saved));

    fetchScrapbook(id).then(data => {
      if (data) setScrapbook(data);
    });
  }, [id]);

  if (!scrapbook) return <PageWrapper><h2>Loading your memories...</h2></PageWrapper>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="handwritten text-4xl md:text-7xl text-center mb-2 text-[#e6b981]">{currentUser?.name}'s Scrapbook</h1>
      <p className="text-center text-lg md:text-xl text-stone-500 italic mb-12">"{currentUser?.quote || 'No quote provided'}"</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-8">
        {currentUser?.photoUrl && (
          <motion.div className="polaroid" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <img 
              src={currentUser.photoUrl.startsWith('/') ? currentUser.photoUrl : currentUser.photoUrl} 
              alt="Main" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="caption">Me!</p>
          </motion.div>
        )}

        {scrapbook.photos.map((photo, index) => (
          <motion.div 
            key={index} 
            className="polaroid"
            initial={{ scale: 0, rotate: Math.random() * 20 - 10 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: index * 0.1 }}
          >
            <img 
              src={photo.startsWith('/') ? photo : photo} 
              alt="Memory" 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Memory+Missing'; }}
            />
            <p className="caption">Memory #{index + 1}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-6 md:p-8 bg-white/50 rounded-2xl backdrop-blur-sm shadow-inner">
        <h2 className="handwritten text-4xl md:text-5xl mb-6">Messages for you</h2>
        {scrapbook.messages.length === 0 ? <p className="text-stone-400 italic">No messages yet.</p> : null}
        <div className="flex flex-col gap-4">
          {scrapbook.messages.map((msg, i) => (
            <motion.div 
              key={msg.id} 
              className="bg-[#fef9e7] p-6 rounded-lg shadow-sm border-l-4 border-[#e6b981]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="handwritten text-xl md:text-2xl">{msg.text}</p>
              <p className="text-right mt-3 text-sm text-stone-500">- {msg.from}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scrapbook;
