import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navigation from './components/Navigation';
import Welcome from './pages/Welcome';
import SelectUser from './pages/SelectUser';
import MainHub from './pages/MainHub';
import Credential from './pages/Credential';
import MCQ from './pages/MCQ';
import Scrapbook from './pages/Scrapbook';
import Gallery from './pages/Gallery';
import Opinions from './pages/Opinions';
import Admin from './pages/Admin';
import LivePoll from './components/LivePoll';

function App() {
  const location = useLocation();

  return (
    <>
      <LivePoll />
      {location.pathname !== '/' && location.pathname !== '/login' && <Navigation />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Welcome />} />
          <Route path="/select-user" element={<SelectUser />} />
          <Route path="/hub" element={<MainHub />} />
          <Route path="/login" element={<Credential />} />
          <Route path="/chaos" element={<MCQ />} />
          <Route path="/scrapbook/:id" element={<Scrapbook />} />
          <Route path="/throwbacks" element={<Gallery />} />
          <Route path="/confessions" element={<Opinions />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
