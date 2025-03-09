import React, { useState, useEffect } from 'react';
import { Menu, X, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import MinimumFinalCalculator from './components/MinimumFinalCalculator';
import YearEndCalculator from './components/YearEndCalculator';
import ThemeToggle from './components/ThemeToggle';
import ShareModal from './components/ShareModal';
import InfoModal from './components/InfoModal';
import ContactModal from './components/ContactModal';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('minimum');
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    if (isFirstVisit) {
      localStorage.setItem('hasVisitedBefore', 'true');
      setTimeout(() => {
        toast('Hoş geldiniz! Not hesaplama aracını kullanmaya başlayabilirsiniz.', {
          icon: '👋',
          duration: 5000,
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(darkMode ? 'Aydınlık mod aktif!' : 'Karanlık mod aktif!', {
      icon: darkMode ? '☀️' : '🌙',
      style: {
        background: darkMode ? '#fff' : '#333',
        color: darkMode ? '#333' : '#fff',
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);
  const openInfoModal = () => setInfoModalOpen(true);
  const closeInfoModal = () => setInfoModalOpen(false);
  const openContactModal = () => setContactModalOpen(true);
  const closeContactModal = () => setContactModalOpen(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`h-12 w-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center`}>
              <svg className={`h-12 w-12 ${darkMode ? 'text-white' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="12" cy="12" r="5" className="text-red-500" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="font-bold text-xl md:text-3xl text-gray-800 dark:text-white">KOMİTE NOT HESAPLAMA</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <button 
              onClick={openInfoModal}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Info"
            >
              <Info className="h-5 w-5" />
            </button>
            <button 
              onClick={openShareModal}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : null}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Calculator selector */}
          <motion.div 
            className="mb-8 flex justify-center"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 inline-flex">
              <button
                onClick={() => setActiveCalculator('minimum')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeCalculator === 'minimum'
                    ? darkMode
                      ? 'bg-red-700 text-white'
                      : 'bg-red-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Minimum Final Notu
              </button>
              <button
                onClick={() => setActiveCalculator('yearend')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeCalculator === 'yearend'
                    ? darkMode
                      ? 'bg-red-700 text-white'
                      : 'bg-red-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Yıl Sonu Not Hesaplama
              </button>
            </div>
          </motion.div>

          {/* Calculator components */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              {activeCalculator === 'minimum' ? (
                <motion.div
                  key="minimum"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MinimumFinalCalculator darkMode={darkMode} />
                </motion.div>
              ) : (
                <motion.div
                  key="yearend"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <YearEndCalculator darkMode={darkMode} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-800'} py-6 mt-12 transition-colors duration-300`}>
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className={`h-12 w-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center`}>
                <svg className={`h-12 w-12 ${darkMode ? 'text-white' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="12" cy="12" r="5" className="text-red-500" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-bold text-xl md:text-3xl text-gray-800 dark:text-white">KOMİTE NOT HESAPLAMA</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mt-2">
                <button 
                  onClick={openContactModal}
                  className={`${darkMode ? 'text-white' : 'text-gray-600'} hover:text-indigo-400 transition-colors`}
                >
                  İletişim
                </button>
                <button 
                  onClick={openShareModal}
                  className={`${darkMode ? 'text-white' : 'text-gray-600'} hover:text-indigo-400 transition-colors`}
                >
                  Paylaş
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mb-2`}>
              Bu araçtaki hesaplamaların doğruluğunu garanti etmiyoruz. Kullanıcılar, hesaplamalarda hata olabileceğini göz önünde bulundurmalı ve sonuçları kendi sorumlulukları altında değerlendirmelidir. Bu nedenle, hesaplamalardan doğabilecek herhangi bir sonuçtan dolayı sorumlu tutulamayız. Bu siteyi kullanarak bu şartları kabul etmiş olursunuz; aksi takdirde lütfen siteyi kullanmayın.
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              © {new Date().getFullYear()} Komite Not Hesaplama.
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>

      <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
      <InfoModal isOpen={isInfoModalOpen} onClose={closeInfoModal} />
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </div>
  );
}

export default App;