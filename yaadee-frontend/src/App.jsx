import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import BackButton from './components/BackButton';
import Welcome from './pages/Welcome';
import SelectUser from './pages/SelectUser';
import MainHub from './pages/MainHub';
import Credential from './pages/Credential';
import MCQ from './pages/MCQ';
import Scrapbook from './pages/Scrapbook';
import Gallery from './pages/Gallery';
import Opinions from './pages/Opinions';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminPolls from './pages/AdminPolls';
import TimeCapsule from './pages/TimeCapsule';
import AdminTimeCapsule from './pages/AdminTimeCapsule';
import WallOfFame from './pages/WallOfFame';

function App() {
  const location = useLocation();

  return (
    <>
      {/* Background Decor: Dark brown transparent scattered sheets */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-10 left-10 w-48 md:w-64 h-56 md:h-72 bg-[#3b2f2f] opacity-10 rotate-[-6deg] rounded-sm mix-blend-multiply blur-[1px]"></div>
        <div className="absolute top-1/4 right-5 w-32 md:w-48 h-40 md:h-56 bg-[#2a1c1c] opacity-[0.08] rotate-[8deg] rounded-sm mix-blend-multiply"></div>
        <div className="absolute bottom-20 left-1/4 w-64 md:w-80 h-80 md:h-96 bg-[#4a3636] opacity-[0.06] rotate(12deg) rounded-sm mix-blend-multiply blur-[2px]"></div>
        <div className="absolute -bottom-10 -right-10 w-72 md:w-96 h-64 md:h-80 bg-[#1f1616] opacity-10 rotate-[-15deg] rounded-sm mix-blend-multiply"></div>
      </div>

      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/select-user' && <BackButton />}
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
          <Route path="/time-capsule" element={<TimeCapsule />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/polls" element={<AdminPolls />} />
          <Route path="/admin/time-capsule" element={<AdminTimeCapsule />} />
          <Route path="/wall-of-fame" element={<WallOfFame />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
