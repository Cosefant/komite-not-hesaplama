import React, { useState, useEffect } from 'react';
import { Calculator, Save, Trash2} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

type CalculationType = 'vize' | 'komite';

interface VizeData {
  count: number;
  weights: number[];
  scores: number[];
  finalWeight: number;
}

interface KomiteData {
  count: number;
  weights: number[];
  scores: number[];
  finalWeight: number;
  finalScore: number | null;
}

interface MinimumFinalCalculatorProps {
  darkMode: boolean;
}

const MinimumFinalCalculator: React.FC<MinimumFinalCalculatorProps> = ({ darkMode }) => {
  const [calculationType, setCalculationType] = useState<CalculationType>('vize');
  const [passingGrade, setPassingGrade] = useState<number>(60);
  
  const [vizeData, setVizeData] = useState<VizeData>({
    count: 1,
    weights: [40],
    scores: [null as unknown as number],
    finalWeight: 60
  });
  
  const [komiteData, setKomiteData] = useState<KomiteData>({
    count: 4,
    weights: [18.67, 15, 15, 11.33],
    scores: Array(4).fill(null),
    finalWeight: 0,
    finalScore: null
  });
  
  const [minimumFinalScore, setMinimumFinalScore] = useState<number | null>(null);
  const [isCalculationPossible, setIsCalculationPossible] = useState<boolean>(true);
  const [savedCalculations, setSavedCalculations] = useState<{
    type: CalculationType;
    passingGrade: number;
    minimumFinalScore: number | null;
    isPossible: boolean;
    date: string;
    scores: number[];
    weights: number[];
  }[]>([]);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedVizeData = localStorage.getItem('minimumVizeData');
    if (savedVizeData) {
      try {
        setVizeData(JSON.parse(savedVizeData));
      } catch (error) {
        console.error('Error loading saved vize data:', error);
      }
    }

    const savedKomiteData = localStorage.getItem('minimumKomiteData');
    if (savedKomiteData) {
      try {
        setKomiteData(JSON.parse(savedKomiteData));
      } catch (error) {
        console.error('Error loading saved komite data:', error);
      }
    }

    const savedPassingGrade = localStorage.getItem('passingGrade');
    if (savedPassingGrade) {
      try {
        setPassingGrade(JSON.parse(savedPassingGrade));
      } catch (error) {
        console.error('Error loading saved passing grade:', error);
      }
    }

    const savedCalculationType = localStorage.getItem('calculationType');
    if (savedCalculationType) {
      try {
        setCalculationType(JSON.parse(savedCalculationType) as CalculationType);
      } catch (error) {
        console.error('Error loading saved calculation type:', error);
      }
    }

    const savedCalculations = localStorage.getItem('savedCalculations');
    if (savedCalculations) {
      try {
        setSavedCalculations(JSON.parse(savedCalculations));
      } catch (error) {
        console.error('Error loading saved calculations:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('minimumVizeData', JSON.stringify(vizeData));
  }, [vizeData]);

  useEffect(() => {
    localStorage.setItem('minimumKomiteData', JSON.stringify(komiteData));
  }, [komiteData]);

  useEffect(() => {
    localStorage.setItem('passingGrade', JSON.stringify(passingGrade));
  }, [passingGrade]);

  useEffect(() => {
    localStorage.setItem('calculationType', JSON.stringify(calculationType));
  }, [calculationType]);

  useEffect(() => {
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

  // Update vize count
  const updateVizeCount = (count: number) => {
    const newWeights = Array(count).fill(0);
    const newScores = Array(count).fill(null);
    
    // Copy existing values
    for (let i = 0; i < Math.min(count, vizeData.weights.length); i++) {
      newWeights[i] = vizeData.weights[i];
      newScores[i] = vizeData.scores[i];
    }
    
    // If first time setting up, distribute weights evenly
    if (vizeData.count === 1 && vizeData.weights[0] === 40) {
      const vizeTotal = 100 - vizeData.finalWeight;
      const eachWeight = Math.floor(vizeTotal / count);
      for (let i = 0; i < count; i++) {
        newWeights[i] = eachWeight;
      }
    }
    
    setVizeData({
      ...vizeData,
      count,
      weights: newWeights,
      scores: newScores
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Update vize weight
  const updateVizeWeight = (index: number, weight: number) => {
    const newWeights = [...vizeData.weights];
    newWeights[index] = weight;
    
    // Calculate total vize weight
    const totalVizeWeight = newWeights.reduce((sum, w) => sum + w, 0);
    
    // Update final weight
    const finalWeight = 100 - totalVizeWeight;
    
    setVizeData({
      ...vizeData,
      weights: newWeights,
      finalWeight
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Update vize score
  const updateVizeScore = (index: number, score: number) => {
    const newScores = [...vizeData.scores];
    newScores[index] = score;
    
    setVizeData({
      ...vizeData,
      scores: newScores
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Update komite count
  const updateKomiteCount = (count: number) => {
    const newWeights = Array(count).fill(0);
    const newScores = Array(count).fill(null);
    
    // Copy existing values
    for (let i = 0; i < Math.min(count, komiteData.weights.length); i++) {
      newWeights[i] = komiteData.weights[i];
      newScores[i] = komiteData.scores[i];
    }
    
    // If first time or redistributing, make weights equal
    if (count !== komiteData.count) {
      const eachWeight = Math.floor(100 / count);
      for (let i = 0; i < count; i++) {
        newWeights[i] = eachWeight;
      }
      // Adjust last weight to ensure sum is 100
      newWeights[count - 1] += 100 - (eachWeight * count);
    }
    
    const finalWeight = 100 - newWeights.reduce((sum, w) => sum + w, 0);
    setKomiteData({
      ...komiteData,
      count,
      weights: newWeights,
      scores: newScores,
      finalWeight
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Update komite weight
  const updateKomiteWeight = (index: number, weight: number) => {
    const newWeights = [...komiteData.weights];
    newWeights[index] = weight;
    
    // Calculate total komite weight
    const totalKomiteWeight = newWeights.reduce((sum, w) => sum + w, 0);
    
    // Update final weight to ensure total is 100%
    const finalWeight = Math.max(0, 100 - totalKomiteWeight);
    
    setKomiteData({
      ...komiteData,
      weights: newWeights,
      finalWeight
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Update komite score
  const updateKomiteScore = (index: number, score: number) => {
    const newScores = [...komiteData.scores];
    newScores[index] = score;
    
    setKomiteData({
      ...komiteData,
      scores: newScores
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
  };

  // Calculate minimum final score
  const calculateMinimumFinalScore = () => {
    if (calculationType === 'vize') {
      // Check if all vize scores are entered
      const allVizeScoresEntered = vizeData.scores.every(score => score !== null && !isNaN(score));
      
      if (allVizeScoresEntered) {
        // Calculate current vize contribution
        let vizeContribution = 0;
        for (let i = 0; i < vizeData.count; i++) {
          vizeContribution += (vizeData.scores[i] * vizeData.weights[i]) / 100;
        }
        
        // Calculate required final score
        const requiredFinalScore = ((passingGrade - vizeContribution) * 100) / vizeData.finalWeight;
        
        if (requiredFinalScore > 100) {
          setIsCalculationPossible(false);
          setMinimumFinalScore(null);
          toast.error('Mevcut notlarınızla dersi geçmeniz mümkün değil!', {
            icon: '❌',
          });
        } else {
          setIsCalculationPossible(true);
          setMinimumFinalScore(Math.max(0, requiredFinalScore));
          toast.success('Minimum final notu hesaplandı!', {
            icon: '🧮',
          });
        }
      } else {
        toast.error('Lütfen tüm vize notlarını girin!', {
          icon: '⚠️',
        });
        return;
      }
    } else { // komite calculation
      // Tüm komite notlarının girilip girilmediğini kontrol et
      const allKomiteScoresEntered = komiteData.scores.every(score => score !== null && !isNaN(score));
      
      if (allKomiteScoresEntered) {
        // Toplam komite ağırlığını hesapla
        const totalKomiteWeight = komiteData.weights.reduce((sum, w) => sum + w, 0);
        
        // Final ağırlığını hesapla (100 - toplam komite ağırlığı)
        const finalWeight = 100 - totalKomiteWeight;
        
        // Mevcut komite katkısını hesapla
        const komiteContribution = komiteData.scores.reduce((sum, score, index) => {
          return sum + (score * komiteData.weights[index]) / 100;
        }, 0);
        
        // Geçmek için gereken puan farkını hesapla
        const neededPoints = passingGrade - komiteContribution;
        
        // Gereken minimum final notunu hesapla
        const requiredFinalScore = (neededPoints * 100) / finalWeight;
        
        if (requiredFinalScore > 100) {
          setIsCalculationPossible(false);
          setMinimumFinalScore(null);
          toast.error('Mevcut komite notlarınızla dersi geçmeniz mümkün değil!', {
            icon: '❌',
          });
        } else {
          setIsCalculationPossible(true);
          setMinimumFinalScore(Math.max(0, requiredFinalScore));
          toast.success('Minimum final notu hesaplandı!', {
            icon: '🧮',
          });
        }
      } else {
        toast.error('Lütfen tüm komite notlarını girin!', {
          icon: '⚠️',
        });
        return;
      }
    }
    
    setHasCalculated(true);
  };

  // Save calculation
  const saveCalculation = () => {
    if (minimumFinalScore !== null || !isCalculationPossible) {
      const newCalculation = {
        type: calculationType,
        passingGrade,
        minimumFinalScore,
        isPossible: isCalculationPossible,
        date: new Date().toLocaleString('tr-TR'),
        scores: calculationType === 'vize' ? [...vizeData.scores] : [...komiteData.scores],
        weights: calculationType === 'vize' ? [...vizeData.weights] : [...komiteData.weights]
      };
      
      setSavedCalculations([...savedCalculations, newCalculation]);
      toast.success('Hesaplama kaydedildi!', {
        icon: '💾',
      });
    }
  };

  // Delete saved calculation
  const deleteCalculation = (index: number) => {
    const newCalculations = [...savedCalculations];
    newCalculations.splice(index, 1);
    setSavedCalculations(newCalculations);
    toast.success('Kayıt silindi!', {
      icon: '🗑️',
    });
  };

  // Clear all saved calculations
  const clearAllCalculations = () => {
    setSavedCalculations([]);
    toast.success('Tüm kayıtlar silindi!', {
      icon: '🧹',
    });
  };

  // Reset calculation when changing calculation type
  useEffect(() => {
    setHasCalculated(false);
    setMinimumFinalScore(null);
  }, [calculationType]);

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

  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  const confirmClearAllCalculations = () => {
    clearAllCalculations();
    closeConfirmModal();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-6 p-0" variants={itemVariants}>
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Hesaplama Türü</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setCalculationType('vize')}
            className={`px-4 py-2 rounded-md transition-colors ${
              calculationType === 'vize' 
                ? darkMode 
                  ? 'bg-red-700 text-white' 
                  : 'bg-red-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vize Sistemi
          </button>
          <button
            onClick={() => setCalculationType('komite')}
            className={`px-4 py-2 rounded-md transition-colors ${
              calculationType === 'komite' 
                ? darkMode 
                  ? 'bg-red-700 text-white' 
                  : 'bg-red-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Komite Sistemi
          </button>
        </div>
      </motion.div>

      <motion.div className="mb-4" variants={itemVariants}>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
          Geçme Notu
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={passingGrade || ''}
          onChange={(e) => {
            setPassingGrade(parseFloat(e.target.value));
            setHasCalculated(false);
          }}
          className={`w-full md:w-1/4 px-3 py-2 border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
              : 'border-gray-300 focus:ring-indigo-500'
          } rounded-md focus:outline-none focus:ring-2 transition-colors`}
          placeholder="Örn: 60"
        />
      </motion.div>

      {calculationType === 'vize' ? (
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Vize Bilgileri</h3>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Vize Sayısı
            </label>
            <select
              value={vizeData.count}
              onChange={(e) => updateVizeCount(parseInt(e.target.value))}
              className={`w-full md:w-auto px-3 py-2 border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              } rounded-md focus:outline-none focus:ring-2 transition-colors`}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: vizeData.count }).map((_, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Vize {index + 1} Notu
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vizeData.scores[index] || ''}
                    onChange={(e) => updateVizeScore(index, parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Vize {index + 1} Ağırlığı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={vizeData.weights[index] || ''}
                    onChange={(e) => updateVizeWeight(index, parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Final Ağırlığı (%)
            </label>
            <input
              type="number"
              value={vizeData.finalWeight || ''}
              readOnly
              className={`w-full md:w-1/3 px-3 py-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              } border rounded-md`}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Komite Bilgileri</h3>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Komite Sayısı
            </label>
            <select
              value={komiteData.count}
              onChange={(e) => updateKomiteCount(parseInt(e.target.value))}
              className={`w-full md:w-auto px-3 py-2 border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              } rounded-md focus:outline-none focus:ring-2 transition-colors`}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: komiteData.count }).map((_, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Komite {index + 1} Notu
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={komiteData.scores[index] || ''}
                    onChange={(e) => updateKomiteScore(index, parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Komite {index + 1} Ağırlığı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={komiteData.weights[index] || ''}
                    onChange={(e) => updateKomiteWeight(index, parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="0-100"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Final Ağırlığı (%)
            </label>
            <input
              type="number"
              value={100 - komiteData.weights.reduce((sum, w) => sum + w, 0)}
              readOnly
              className={`w-full md:w-1/3 px-3 py-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              } border rounded-md`}
            />
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Final ağırlığı, komite ağırlıklarının toplamına göre otomatik hesaplanır.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div className="mt-8 flex flex-wrap gap-4" variants={itemVariants}>
        <button
          onClick={calculateMinimumFinalScore}
          className={`flex items-center space-x-2 ${
            darkMode 
              ? 'bg-red-700 hover:bg-red-600' 
              : 'bg-red-500 hover:bg-red-600'
          } text-white px-6 py-3 rounded-md transition-colors`}
        >
          <Calculator className="h-5 w-5" />
          <span>Hesapla</span>
        </button>
        
        {hasCalculated && minimumFinalScore !== null && (
          <button
            onClick={saveCalculation}
            className={`flex items-center space-x-2 ${
              darkMode 
                ? 'bg-green-700 hover:bg-green-600' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-6 py-3 rounded-md transition-colors`}
          >
            <Save className="h-5 w-5" />
            <span>Hesaplamayı Kaydet</span>
          </button>
        )}
        
        <button
          onClick={openConfirmModal}
          className={`flex items-center space-x-2 ${
            darkMode 
              ? 'bg-red-700 hover:bg-red-600' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white px-6 py-3 rounded-md transition-colors`}
        >
          <Trash2 className="h-5 w-5" />
          <span>Tüm Kayıtları Temizle</span>
        </button>
      </motion.div>

      {hasCalculated && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-6 p-6 ${
            isCalculationPossible
              ? darkMode 
                ? 'bg-green-900/30 border-green-800' 
                : 'bg-green-50 border-green-100'
              : darkMode 
                ? 'bg-red-900/30 border-red-800' 
                : 'bg-red-50 border-red-100'
          } border rounded-lg`}
        >
          <h4 className={`text-xl font-medium mb-4 ${
            isCalculationPossible
              ? darkMode ? 'text-green-300' : 'text-green-800'
              : darkMode ? 'text-red-300' : 'text-red-800'
          }`}>
            Hesaplama Sonucu
          </h4>

          {isCalculationPossible ? (
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Finalden almanız gereken minimum not:
                </div>
                <div className={`text-4xl font-bold ${
                  minimumFinalScore && minimumFinalScore > 85
                    ? darkMode ? 'text-red-400' : 'text-red-600'
                    : minimumFinalScore && minimumFinalScore > 70
                      ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                      : darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {Math.ceil(minimumFinalScore || 0)}
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      minimumFinalScore && minimumFinalScore > 85
                        ? 'bg-red-500 dark:bg-red-400'
                        : minimumFinalScore && minimumFinalScore > 70
                          ? 'bg-yellow-500 dark:bg-yellow-400'
                          : 'bg-green-500 dark:bg-green-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.ceil(minimumFinalScore || 0))}%` }}
                  />
                </div>
                
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {minimumFinalScore && minimumFinalScore > 85
                    ? '⚠️ Çok yüksek bir final notu almanız gerekiyor. Ekstra çalışmanız önerilir.'
                    : minimumFinalScore && minimumFinalScore > 70
                      ? '📚 Ortalama üstü bir final notu almanız gerekiyor.'
                      : minimumFinalScore && minimumFinalScore > 50
                        ? '👍 Makul bir final notu ile dersi geçebilirsiniz.'
                        : '🎉 Düşük bir final notu ile dersi geçebilirsiniz.'}
                </p>
              </div>

              <div className={`mt-4 p-4 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <h5 className={`font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Özet Bilgiler:
                </h5>
                <ul className={`list-disc list-inside space-y-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <li>Geçme Notu: {passingGrade}</li>
                  <li>Final Ağırlığı: {(100 - komiteData.weights.reduce((sum, w) => sum + w, 0)).toFixed(2)}%</li>
                  {calculationType === 'komite' && (
                    <li>Mevcut Komite Ortalaması: {(komiteData.scores.reduce((sum, score, index) => 
                      sum + (score * komiteData.weights[index]) / 100, 0)).toFixed(2)}</li>
                  )}
                  {calculationType === 'vize' && (
                    <li>Vize Ortalaması: {(vizeData.scores.reduce((sum, score, index) => 
                      sum + (score * vizeData.weights[index]) / 100, 0)).toFixed(2)}</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`text-lg font-medium ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                ❌ Mevcut komite notlarınızla dersi geçmeniz mümkün değil
              </div>
              
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Öneriler:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Komite notlarınızı tekrar kontrol edin</li>
                  <li>Geçme notunu kontrol edin</li>
                  <li>Bölüm başkanınızla görüşün</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Saved Calculations */}
      {savedCalculations.length > 0 && (
        <motion.div 
          className={`mt-8 p-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}
          variants={itemVariants}
        >
          <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Kaydedilmiş Hesaplamalar</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Tür
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Geçme Notu
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Girişler
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Sonuç
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-750' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {savedCalculations.map((calc, index) => (
                  <tr key={index} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {calc.type === 'vize' ? 'Vize Sistemi' : 'Komite Sistemi'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{calc.passingGrade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} flex flex-wrap gap-2`}>
                        {calc.scores.map((score, index) => (
                          <div key={index} className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md relative">
                            <span className="absolute top-1 left-1 text-xs font-bold text-gray-500">{index + 1}</span>
                            <span>{score}</span>
                            <span className="text-xs text-gray-500">Ağırlık: {calc.weights[index]}%</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {calc.isPossible ? (
                        <div className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {calc.type === 'vize' || (calc.type === 'komite' && calc.minimumFinalScore !== null && calc.minimumFinalScore > 0)
                            ? `Min. Final: ${Math.ceil(calc.minimumFinalScore || 0)}`
                            : 'Geçtiniz'}
                        </div>
                      ) : (
                        <div className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Geçiş Mümkün Değil
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteCalculation(index)}
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

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmClearAllCalculations}
        message="Tüm kayıtlı hesaplamaları silmek istediğinize emin misiniz?"
      />
    </motion.div>
  );
};

export default MinimumFinalCalculator;