import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navigation from './components/Navigation';
import Welcome from './pages/Welcome';
import Credential from './pages/Credential';
import MCQ from './pages/MCQ';
import Scrapbook from './pages/Scrapbook';
import Gallery from './pages/Gallery';
import Opinions from './pages/Opinions';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && location.pathname !== '/login' && <Navigation />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Credential />} />
          <Route path="/quiz" element={<MCQ />} />
          <Route path="/scrapbook/:id" element={<Scrapbook />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/opinions" element={<Opinions />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
