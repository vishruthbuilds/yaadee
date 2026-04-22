import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)} 
      className="fixed top-6 left-6 z-[100] group flex items-center gap-2"
    >
      <div className="w-10 h-10 bg-white/80 backdrop-blur-md border border-stone-200 flex items-center justify-center transition-all duration-300 group-hover:bg-ink group-hover:border-ink shadow-sm group-hover:shadow-lg" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}>
        <span className="text-stone-400 group-hover:text-paper transition-colors">&larr;</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 group-hover:text-ink transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300 italic">Back</span>
    </button>
  );
};

export default BackButton;
