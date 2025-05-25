import React from 'react';
import { FileVideo, GraduationCap, Menu } from 'lucide-react';
import { Button } from './ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-xl">LectureQuiz</span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-sm font-medium text-blue-600 flex items-center">
              <FileVideo className="h-4 w-4 mr-1" />
              My Videos
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <a 
              href="https://github.com/yourusername/lecture-quiz-generator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Documentation
            </a>
            <Button size="sm">Upload New Video</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;