import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

type CalculationType = 'vize' | 'komite';

interface VizeData {
  count: number;
  weights: number[];
  scores: number[];
  finalWeight: number;
  finalScore: number | null;
}

interface KomiteData {
  count: number;
  weights: number[];
  scores: number[];
  finalWeight: number;
  finalScore: number | null;
}

interface YearEndCalculatorProps {
  darkMode: boolean;
}

const YearEndCalculator: React.FC<YearEndCalculatorProps> = ({ darkMode }) => {
  const [calculationType, setCalculationType] = useState<CalculationType>('vize');
  const [passingGrade, setPassingGrade] = useState<number>(60);
  
  const [vizeData, setVizeData] = useState<VizeData>({
    count: 1,
    weights: [40],
    scores: [null as unknown as number],
    finalWeight: 60,
    finalScore: null
  });
  
  const [komiteData, setKomiteData] = useState<KomiteData>({
    count: 4,
    weights: [18.67, 15, 15, 11.33],
    scores: [null as unknown as number, null as unknown as number, null as unknown as number, null as unknown as number],
    finalWeight: 0,
    finalScore: null
  });
  
  const [yearEndResult, setYearEndResult] = useState<number | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<{
    type: CalculationType;
    yearEndResult: number;
    date: string;
    scores: number[];
    weights: number[];
  }[]>([]);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedVizeData = localStorage.getItem('yearEndVizeData');
    if (savedVizeData) {
      try {
        setVizeData(JSON.parse(savedVizeData));
      } catch (error) {
        console.error('Error loading saved vize data:', error);
      }
    }

    const savedKomiteData = localStorage.getItem('yearEndKomiteData');
    if (savedKomiteData) {
      try {
        setKomiteData(JSON.parse(savedKomiteData));
      } catch (error) {
        console.error('Error loading saved komite data:', error);
      }
    }

    const savedPassingGrade = localStorage.getItem('yearEndPassingGrade');
    if (savedPassingGrade) {
      try {
        setPassingGrade(JSON.parse(savedPassingGrade));
      } catch (error) {
        console.error('Error loading saved passing grade:', error);
      }
    }

    const savedCalculationType = localStorage.getItem('yearEndCalculationType');
    if (savedCalculationType) {
      try {
        setCalculationType(JSON.parse(savedCalculationType) as CalculationType);
      } catch (error) {
        console.error('Error loading saved calculation type:', error);
      }
    }

    const savedYearEndCalculations = localStorage.getItem('savedYearEndCalculations');
    if (savedYearEndCalculations) {
      try {
        setSavedCalculations(JSON.parse(savedYearEndCalculations));
      } catch (error) {
        console.error('Error loading saved calculations:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('yearEndVizeData', JSON.stringify(vizeData));
  }, [vizeData]);

  useEffect(() => {
    localStorage.setItem('yearEndKomiteData', JSON.stringify(komiteData));
  }, [komiteData]);

  useEffect(() => {
    localStorage.setItem('yearEndPassingGrade', JSON.stringify(passingGrade));
  }, [passingGrade]);

  useEffect(() => {
    localStorage.setItem('yearEndCalculationType', JSON.stringify(calculationType));
  }, [calculationType]);

  useEffect(() => {
    localStorage.setItem('savedYearEndCalculations', JSON.stringify(savedCalculations));
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
    setYearEndResult(null);
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
    setYearEndResult(null);
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
    setYearEndResult(null);
  };

  // Update vize final score
  const updateVizeFinalScore = (score: number) => {
    setVizeData({
      ...vizeData,
      finalScore: score
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
    setYearEndResult(null);
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
      // Calculate the weight for each komite based on the final weight
      const komiteTotal = 100 - komiteData.finalWeight;
      const eachWeight = Math.floor(komiteTotal / count);
      for (let i = 0; i < count; i++) {
        newWeights[i] = eachWeight;
      }
      // Adjust last weight to ensure sum is 100 - finalWeight
      newWeights[count - 1] += komiteTotal - (eachWeight * count);
    }
    
    setKomiteData({
      ...komiteData,
      count,
      weights: newWeights,
      scores: newScores
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
    setYearEndResult(null);
  };

  // Update komite weight
  const updateKomiteWeight = (index: number, weight: number) => {
    const newWeights = [...komiteData.weights];
    newWeights[index] = weight;
    
    // Calculate total komite weight
    const totalKomiteWeight = newWeights.reduce((sum, w) => sum + w, 0);
    
    // Update final weight automatically (100 - total komite weight)
    const finalWeight = Math.max(0, 100 - totalKomiteWeight);
    
    setKomiteData({
      ...komiteData,
      weights: newWeights,
      finalWeight
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
    setYearEndResult(null);
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
    setYearEndResult(null);
  };

  // Update komite final score
  const updateKomiteFinalScore = (score: number) => {
    setKomiteData({
      ...komiteData,
      finalScore: score
    });
    
    // Reset calculation when changing inputs
    setHasCalculated(false);
    setYearEndResult(null);
  };

  // Calculate year end result
  const calculateYearEndResult = () => {
    if (calculationType === 'vize') {
      // Check if all vize scores and final score are entered
      const allVizeScoresEntered = vizeData.scores.every(score => score !== null && !isNaN(score));
      const finalScoreEntered = vizeData.finalScore !== null && !isNaN(vizeData.finalScore);
      
      if (allVizeScoresEntered && finalScoreEntered) {
        // Calculate vize contribution
        let vizeContribution = 0;
        for (let i = 0; i < vizeData.count; i++) {
          vizeContribution += (vizeData.scores[i] * vizeData.weights[i]) / 100;
        }
        
        // Calculate final contribution
        const finalContribution = (vizeData.finalScore !== null ? vizeData.finalScore : 0) * vizeData.finalWeight / 100;
        
        // Calculate year end result
        const result = vizeContribution + finalContribution;
        
        setYearEndResult(result);
        setHasCalculated(true);
        
        if (result >= passingGrade) {
          toast.success('Tebrikler! Dersi geçtiniz!', {
            icon: '🎓',
          });
        } else {
          toast.error('Üzgünüz, dersi geçemediniz.', {
            icon: '📚',
          });
        }
      } else {
        toast.error('Lütfen tüm vize notlarını ve final notunu girin!', {
          icon: '⚠️',
        });
      }
    } else { // komite calculation
      // Check if all komite scores are entered
      const allKomiteScoresEntered = komiteData.scores.every(score => score !== null && !isNaN(score));
      const totalKomiteWeight = komiteData.weights.reduce((sum, w) => sum + w, 0) / 100; // Convert to decimal
      const finalScoreNeeded = totalKomiteWeight < 1; // If total komite weight is less than 100%
      const finalScoreEntered = komiteData.finalScore !== null && !isNaN(komiteData.finalScore);
      
      if (allKomiteScoresEntered && (!finalScoreNeeded || finalScoreEntered)) {
        // Calculate komite contribution
        let yearEndResult = 0;
        
        // Add komite scores weighted contribution
        for (let i = 0; i < komiteData.count; i++) {
          yearEndResult += (komiteData.scores[i] * (komiteData.weights[i] / 100)); // Convert weight to decimal
        }
        
        // Add final contribution if applicable
        // Final weight is (1 - total komite weight)
        if (finalScoreNeeded && finalScoreEntered && komiteData.finalScore !== null) {
          yearEndResult += komiteData.finalScore * (1 - totalKomiteWeight);
        }
        
        setYearEndResult(yearEndResult);
        setHasCalculated(true);
        
        if (yearEndResult >= passingGrade) {
          toast.success('Tebrikler! Dersi geçtiniz!', {
            icon: '🎓',
          });
        } else {
          toast.error('Üzgünüz, dersi geçemediniz.', {
            icon: '📚',
          });
        }
      } else {
        const errorMessage = finalScoreNeeded && !finalScoreEntered
          ? 'Lütfen tüm komite notlarını ve final notunu girin!'
          : 'Lütfen tüm komite notlarını girin!';
        
        toast.error(errorMessage, {
          icon: '⚠️',
        });
      }
    }
  };

  // Save calculation
  const saveCalculation = () => {
    if (yearEndResult !== null) {
      const newCalculation = {
        type: calculationType,
        yearEndResult,
        date: new Date().toLocaleString('tr-TR'),
        scores: calculationType === 'vize' ? vizeData.scores : komiteData.scores,
        weights: calculationType === 'vize' ? vizeData.weights : komiteData.weights
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
    setYearEndResult(null);
  }, [calculationType]);

  const getGradeColor = (score: number): string => {
    if (score >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 70) return darkMode ? 'text-green-300' : 'text-green-500';
    if (score >= 60) return darkMode ? 'text-yellow-300' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
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
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Hesaplama Türü</h3>
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

      <motion.div className="mb-6" variants={itemVariants}>
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
            setYearEndResult(null);
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
          
          {/* Weight summary */}
          {/* <div className={`mt-4 p-3 rounded-md ${
            totalVizeWeight + vizeData.finalWeight === 100
              ? darkMode ? 'bg-green-900/20' : 'bg-green-50'
              : darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Vize Ağırlıkları Toplamı: {totalVizeWeight}%
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Final Ağırlığı: {vizeData.finalWeight}%
              </span>
            </div>
          </div> */}
          
          {/* Final section */}
          <div className="mt-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Final Notu
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vizeData.finalScore || ''}
                  onChange={(e) => updateVizeFinalScore(parseFloat(e.target.value))}
                  className={`w-full md:w-1/3 px-3 py-2 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                      : 'border-gray-300 focus:ring-indigo-500'
                  } rounded-md focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="0-100"
                />
              </div>
            </div>
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
          
          {/* Weight summary */}
          {/* <div className={`mt-4 p-3 rounded-md ${
            totalKomiteWeight + komiteData.finalWeight === 100
              ? darkMode ? 'bg-green-900/20' : 'bg-green-50'
              : darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Komite Ağırlıkları Toplamı: {totalKomiteWeight}%
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Final Ağırlığı: {komiteData.finalWeight}%
              </span>
            </div>
          </div> */}

          {/* Final section */}
          <div className="mt-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Final Notu {komiteData.weights.reduce((sum, w) => sum + w, 0) < 100 && 
                    `(Ağırlık: %${(100 - komiteData.weights.reduce((sum, w) => sum + w, 0)).toFixed(2)})`}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={komiteData.finalScore || ''}
                  onChange={(e) => updateKomiteFinalScore(parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500' 
                      : 'border-gray-300 focus:ring-indigo-500'
                  } rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    komiteData.weights.reduce((sum, w) => sum + w, 0) >= 100 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="0-100"
                  disabled={komiteData.weights.reduce((sum, w) => sum + w, 0) >= 100}
                />
                {komiteData.weights.reduce((sum, w) => sum + w, 0) >= 100 ? (
                  <p className={`mt-1 text-xs ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                    Komite ağırlıkları toplamı %100'e ulaştığı için final notu girilemiyor.
                  </p>
                ) : (
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Final ağırlığı komite ağırlıkları toplamının 100'den çıkarılmasıyla hesaplanır.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div className="mt-8 flex flex-wrap gap-4" variants={itemVariants}>
        <button
          onClick={calculateYearEndResult}
          className={`flex items-center space-x-2 ${
            darkMode 
              ? 'bg-red-700 hover:bg-red-600' 
              : 'bg-red-500 hover:bg-red-600'
          } text-white px-6 py-3 rounded-md transition-colors`}
        >
          <Calculator className="h-5 w-5" />
          <span>Hesapla</span>
        </button>
        
        {hasCalculated && yearEndResult !== null && (
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

      {hasCalculated && yearEndResult !== null && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-6 p-6 ${
            yearEndResult >= passingGrade
              ? darkMode 
                ? 'bg-green-900/30 border-green-800' 
                : 'bg-green-50 border-green-100'
              : darkMode 
                ? 'bg-red-900/30 border-red-800' 
                : 'bg-red-50 border-red-100'
          } border rounded-lg`}
        >
          <h4 className={`font-medium ${
            yearEndResult >= passingGrade
              ? darkMode ? 'text-green-300' : 'text-green-800'
              : darkMode ? 'text-red-300' : 'text-red-800'
          } mb-4 text-lg flex items-center`}>
            {yearEndResult >= passingGrade 
              ? <><CheckCircle className="h-5 w-5 mr-2" /> Sonuç: Geçtiniz!</>
              : <><AlertCircle className="h-5 w-5 mr-2" /> Sonuç: Kaldınız!</>
            }
          </h4>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-2 md:mb-0">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yıl Sonu Notu:</span>
              <span className={`ml-2 text-3xl font-bold ${getGradeColor(yearEndResult)}`}>
                {yearEndResult.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  yearEndResult >= 85 ? 'bg-green-500 dark:bg-green-400' :
                  yearEndResult >= 70 ? 'bg-green-400 dark:bg-green-500' :
                  yearEndResult >= 60 ? 'bg-yellow-400 dark:bg-yellow-500' :
                  'bg-red-500 dark:bg-red-400'
                }`} 
                style={{ width: `${Math.min(100, yearEndResult)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Geçme notu: {passingGrade}
            </p>
          </div>
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
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{passingGrade}</div>
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
                      <div className={`text-sm font-medium ${getGradeColor(calc.yearEndResult)}`}>
                        {calc.yearEndResult.toFixed(2)}
                      </div>
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

export default YearEndCalculator;