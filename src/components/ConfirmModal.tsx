import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg w-11/12 max-w-md"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 md:mb-4">Onayla</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 md:mb-6">{message}</p>
            <div className="flex justify-end space-x-2 md:space-x-4">
              <button 
                onClick={onClose} 
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={onConfirm} 
                className="px-3 py-1 md:px-4 md:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Onayla
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal; 