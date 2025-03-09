import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
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
            
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white">Hakkında</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                <strong>Öğrenci Not Hesaplama</strong> uygulaması, öğrencilerin notlarını kolayca hesaplamasına yardımcı olmak için tasarlanmıştır.
              </p>
              <p>
                Bu uygulama ile:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Vize ve final notlarınızı girerek yıl sonu notunuzu hesaplayabilirsiniz</li>
                <li>Komite sistemine göre notlarınızı hesaplayabilirsiniz</li>
                <li>Geçmek için gereken minimum final notunu öğrenebilirsiniz</li>
              </ul>
              <p>
                Uygulama tamamen ücretsizdir ve herhangi bir kişisel veri toplamamaktadır. Tüm hesaplamalar tarayıcınızda yerel olarak yapılır.
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 font-medium text-white shadow-md transition-all hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-700 dark:to-indigo-800 dark:hover:from-indigo-600 dark:hover:to-indigo-700"
            >
              Anladım
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal; 