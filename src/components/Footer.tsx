import React from 'react';
import { Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Music size={20} className="text-white" />
          <span className="text-lg font-bold tracking-wider">EAR TRAINER</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;