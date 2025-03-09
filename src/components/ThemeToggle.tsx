import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.button
      onClick={toggleDarkMode}
      className={`relative p-2 rounded-full ${
        darkMode 
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } transition-colors`}
      aria-label={darkMode ? 'Light mode' : 'Dark mode'}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;