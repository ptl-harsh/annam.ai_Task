import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './pages/home';
import VideoDetail from './pages/video-detail';
import { ToastContainer } from './hooks/use-toast';

function App() {
  return (
    <ToastContainer>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video/:id" element={<VideoDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastContainer>
  );
}

export default App;