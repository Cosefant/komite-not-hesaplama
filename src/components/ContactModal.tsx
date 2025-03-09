import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Instagram } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('sefa1cem@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-11/12 max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 dark:text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="mb-1 text-center text-2xl font-bold text-gray-800 dark:text-white">İletişim</h2>
            <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
              İletişim için aşağıdaki e-posta adresini kullanabilirsiniz.
            </p>
            
            <div className="mb-6 grid grid-cols-1 gap-3">
              <motion.button 
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 mx-auto flex flex-col items-center justify-center rounded-lg bg-pink-600 py-3 text-white shadow-md transition-colors hover:bg-pink-700"
                onClick={() => window.open('https://www.instagram.com/sefacemturan/', '_blank')}
              >
                <Instagram className="h-8 w-8" />
                <span className="mt-1 text-xs">Instagram</span>
              </motion.button>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <input 
                  type="text" 
                  value="sefa1cem@gmail.com" 
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                />
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              {copied && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-xs text-green-600 dark:text-green-400"
                >
                  E-posta kopyalandı!
                </motion.p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-medium text-white shadow-md transition-all hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-700 dark:to-indigo-800 dark:hover:from-indigo-600 dark:hover:to-indigo-700"
            >
              Kapat
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal; 