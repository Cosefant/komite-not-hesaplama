import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Save, BarChart, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import GradeChart from './GradeChart';

interface KomiteData {
  count: number;
  weights: number[];
  scores: number[];
  result: number | null;
}

interface KomiteSystemProps {
  darkMode: boolean;
}

const KomiteSystem: React.FC<KomiteSystemProps> = ({ darkMode }) => {
  const [komiteData, setKomiteData] = useState<KomiteData>({
    count: 3,
    weights: [30, 30, 40],
    scores: [null as unknown as number, null as unknown as number, null as unknown as number ],
    result: null
  });
  const [showChart, setShowChart] = useState(false);
  const [savedResults, setSavedResults] = useState<{name: string, result: number}[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedKomiteData = localStorage.getItem('komiteData');
    if (savedKomiteData) {
      try {
        setKomiteData(JSON.parse(savedKomiteData));
      } catch (error) {
        console.error('Error loading saved komite data:', error);
      }
    }

    const savedResultsData = localStorage.getItem('komiteSavedResults');
    if (savedResultsData) {
      try {
        setSavedResults(JSON.parse(savedResultsData));
      } catch (error) {
        console.error('Error loading saved results:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('komiteData', JSON.stringify(komiteData));
  }, [komiteData]);

  useEffect(() => {
    localStorage.setItem('komiteSavedResults', JSON.stringify(savedResults));
  }, [savedResults]);

  // Calculate result whenever scores or weights change
  useEffect(() => {
    calculateResult();
  }, [komiteData.scores, komiteData.weights]);

  const increaseKomiteCount = () => {
    if (komiteData.count < 10) {
      const newCount = komiteData.count + 1;
      const newWeights = [...komiteData.weights, 0];
      const newScores = [...komiteData.scores, null as unknown as number];
      
      // Redistribute weights to maintain 100% total
      const totalWeight = newWeights.reduce((sum, weight) => sum + weight, 0);
      if (totalWeight === 100) {
        // Reduce the last weight to make room for the new one
        newWeights[newWeights.length - 2] = Math.max(5, newWeights[newWeights.length - 2] - 10);
        newWeights[newWeights.length - 1] = 10;
      } else {
        // Distribute remaining weight to the new komite
        newWeights[newWeights.length - 1] = 100 - totalWeight;
      }
      
      setKomiteData({
        ...komiteData,
        count: newCount,
        weights: newWeights,
        scores: newScores
      });

      toast.success('Komite eklendi!', {
        icon: '➕',
      });
    }
  };

  const decreaseKomiteCount = () => {
    if (komiteData.count > 1) {
      const newCount = komiteData.count - 1;
      const newWeights = [...komiteData.weights.slice(0, newCount)];
      const newScores = [...komiteData.scores.slice(0, newCount)];
      
      // Redistribute the removed weight to maintain 100% total
      const totalWeight = newWeights.reduce((sum, weight) => sum + weight, 0);
      if (totalWeight < 100) {
        // Add the remaining weight to the last komite
        newWeights[newWeights.length - 1] += (100 - totalWeight);
      }
      
      setKomiteData({
        ...komiteData,
        count: newCount,
        weights: newWeights,
        scores: newScores
      });

      toast.success('Komite silindi!', {
        icon: '➖',
      });
    }
  };

  const updateKomiteWeight = (index: number, weight: number) => {
    const newWeights = [...komiteData.weights];
    newWeights[index] = weight;
    
    // Adjust the last weight to ensure total is 100
    const otherWeightsTotal = newWeights.reduce((sum, w, i) => i !== newWeights.length - 1 ? sum + w : sum, 0);
    newWeights[newWeights.length - 1] = 100 - otherWeightsTotal;
    
    setKomiteData({
      ...komiteData,
      weights: newWeights
    });
  };

  const updateKomiteScore = (index: number, score: number) => {
    const newScores = [...komiteData.scores];
    newScores[index] = score;
    
    setKomiteData({
      ...komiteData,
      scores: newScores
    });
  };

  const calculateResult = () => {
    // Check if all scores are entered
    const allScoresEntered = komiteData.scores.every(score => score !== null && !isNaN(score));
    
    if (allScoresEntered) {
      let totalResult = 0;
      for (let i = 0; i < komiteData.count; i++) {
        totalResult += (komiteData.scores[i] * komiteData.weights[i]) / 100;
      }
      
      setKomiteData({
        ...komiteData,
        result: totalResult
      });

      if (totalResult >= 60) {
        toast.success('Tebrikler! Dersi geçtiniz!', {
          icon: '🎓',
          duration: 3000,
        });
      }
    } else {
      setKomiteData({
        ...komiteData,
        result: null
      });
    }
  };

  const saveResult = () => {
    if (komiteData.result !== null) {
      const resultName = prompt('Bu sonucu kaydetmek için bir isim girin:');
      if (resultName) {
        const newSavedResults = [
          ...savedResults,
          { name: resultName, result: komiteData.result }
        ];
        setSavedResults(newSavedResults);
        toast.success('Sonuç kaydedildi!', {
          icon: '💾',
        });
      }
    }
  };

  const deleteSavedResult = (index: number) => {
    const newSavedResults = [...savedResults];
    newSavedResults.splice(index, 1);
    setSavedResults(newSavedResults);
    toast.success('Kayıt silindi!', {
      icon: '🗑️',
    });
  };

  const resetForm = () => {
    if (confirm('Formu sıfırlamak istediğinize emin misiniz?')) {
      setKomiteData({
        count: 3,
        weights: [30, 30, 40],
        scores: [null as unknown as number, null as unknown as number, null as unknown as number],
        result: null
      });
      toast.success('Form sıfırlandı!', {
        icon: '🔄',
      });
    }
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 90) return 'AA';
    if (score >= 85) return 'BA';
    if (score >= 80) return 'BB';
    if (score >= 75) return 'CB';
    if (score >= 70) return 'CC';
    if (score >= 65) return 'DC';
    if (score >= 60) return 'DD';
    if (score >= 50) return 'FD';
    return 'FF';
  };

  const getGradeColor = (score: number): string => {
    if (score >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 70) return darkMode ? 'text-green-300' : 'text-green-500';
    if (score >= 60) return darkMode ? 'text-yellow-300' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  // Prepare data for chart
  const chartData = {
    labels: savedResults.length > 0 
      ? savedResults.map(result => result.name) 
      : komiteData.scores.every(score => score !== null) 
        ? Array.from({ length: komiteData.count }).map((_, i) => `Komite ${i + 1}`) 
        : [],
    datasets: [
      {
        label: 'Notlar',
        data: savedResults.length > 0 
          ? savedResults.map(result => result.result) 
          : komiteData.scores.every(score => score !== null) 
            ? komiteData.scores 
            : [],
        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)',
        borderColor: darkMode ? 'rgba(129, 140, 248, 1)' : 'rgba(67, 56, 202, 1)',
        borderWidth: 1,
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-6 flex flex-wrap gap-4 justify-between items-center" variants={itemVariants}>
        <div className="flex items-center space-x-4">
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Komite Sayısı: {komiteData.count}</h3>
          <div className="flex space-x-2">
            <button
              onClick={decreaseKomiteCount}
              disabled={komiteData.count <= 1}
              className={`p-2 rounded-full ${
                komiteData.count <= 1 
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : darkMode 
                    ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
              } transition-colors`}
              aria-label="Decrease komite count"
            >
              <MinusCircle className="h-5 w-5" />
            </button>
            <button
              onClick={increaseKomiteCount}
              disabled={komiteData.count >= 10}
              className={`p-2 rounded-full ${
                komiteData.count >= 10 
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : darkMode 
                    ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
              } transition-colors`}
              aria-label="Increase komite count"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={resetForm}
            className={`px-3 py-2 rounded-md ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            Sıfırla
          </button>
          
          {(komiteData.result !== null || savedResults.length > 0) && (
            <button 
              onClick={() => setShowChart(!showChart)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                darkMode 
                  ? 'bg-indigo-700 text-white hover:bg-indigo-600' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              } transition-colors`}
            >
              <BarChart className="h-4 w-4" />
              <span>{showChart ? 'Grafiği Gizle' : 'Grafiği Göster'}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Chart Section */}
      <AnimatePresence>
        {showChart && (savedResults.length > 0 || komiteData.scores.every(score => score !== null)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                {savedResults.length > 0 ? 'Kaydedilmiş Sonuçlar' : 'Komite Notları'}
              </h3>
              <div className="h-64">
                <GradeChart data={chartData} darkMode={darkMode} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={`bg-white dark:bg-gray-750 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden shadow-sm`}
        variants={itemVariants}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Komite
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Ağırlık (%)
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                Not
              </th>
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'bg-gray-750' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {Array.from({ length: komiteData.count }).map((_, index) => (
              <tr key={index} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Komite {index + 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={komiteData.weights[index] || ''}
                    onChange={(e) => updateKomiteWeight(index, parseFloat(e.target.value))}
                    className={`w-24 px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                    disabled={index === komiteData.count - 1} // Last weight is auto-calculated
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={komiteData.scores[index] || ''}
                    onChange={(e) => updateKomiteScore(index, parseFloat(e.target.value))}
                    className={`w-24 px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div 
        className={`mt-6 p-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
        variants={itemVariants}
      >
        <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Ağırlık Toplamı</h4>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                komiteData.weights.reduce((sum, w) => sum + w, 0) === 100 
                  ? darkMode ? 'bg-green-500' : 'bg-green-600' 
                  : darkMode ? 'bg-yellow-400' : 'bg-yellow-500'
              }`} 
              style={{ width: `${Math.min(100, komiteData.weights.reduce((sum, w) => sum + w, 0))}%` }}
            ></div>
          </div>
          <span className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {komiteData.weights.reduce((sum, w) => sum + w, 0)}%
          </span>
        </div>
        {komiteData.weights.reduce((sum, w) => sum + w, 0) !== 100 && (
          <p className={`mt-2 text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            Ağırlıkların toplamı 100% olmalıdır. Son komite ağırlığı otomatik olarak ayarlanmaktadır.
          </p>
        )}
      </motion.div>

      {komiteData.result !== null && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-6 p-4 ${
            komiteData.result >= 60
              ? darkMode 
                ? 'bg-green-900/30 border-green-800' 
                : 'bg-green-50 border-green-100'
              : darkMode 
                ? 'bg-red-900/30 border-red-800' 
                : 'bg-red-50 border-red-100'
          } border rounded-lg`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Sonuç</h4>
              <div className="flex items-center justify-between mb-4">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yıl Sonu Notu:</span>
                <span className={`text-2xl font-bold ${getGradeColor(komiteData.result)}`}>
                  {komiteData.result.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harf Notu:</span>
                <span className={`text-2xl font-bold ${getGradeColor(komiteData.result)}`}>
                  {getLetterGrade(komiteData.result)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={saveResult}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  darkMode 
                    ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } transition-colors`}
              >
                <Save className="h-4 w-4" />
                <span>Sonucu Kaydet</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  komiteData.result >= 85 ? 'bg-green-500 dark:bg-green-400' :
                  komiteData.result >= 70 ? 'bg-green-400 dark:bg-green-500' :
                  komiteData.result >= 60 ? 'bg-yellow-400 dark:bg-yellow-500' :
                  'bg-red-500 dark:bg-red-400'
                }`} 
                style={{ width: `${Math.min(100, komiteData.result)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Harf notu değerlendirmesi üniversitenin belirlediği kriterlere göre değişiklik gösterebilir.
            </p>
          </div>
        </motion.div>
      )}

      {/* Saved Results Section */}
      {savedResults.length > 0 && (
        <motion.div 
          className={`mt-8 p-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
          variants={itemVariants}
        >
          <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Kaydedilmiş Sonuçlar</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    İsim
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Not
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Harf Notu
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-750' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {savedResults.map((result, index) => (
                  <tr key={index} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{result.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getGradeColor(result.result)}`}>{result.result.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getGradeColor(result.result)}`}>{getLetterGrade(result.result)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteSavedResult(index)}
                        className={`text-sm ${
                          darkMode 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-500'
                        }`}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default KomiteSystem;