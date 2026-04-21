import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-6 left-6 z-50 bg-stone-100/80 backdrop-blur-sm border border-stone-300 text-ink px-4 py-2 rounded-full font-sans tracking-wide text-sm shadow-sm hover:bg-stone-200 transition-colors flex items-center gap-2"
    >
      <span>&larr;</span> Back
    </button>
  );
};

export default BackButton;
