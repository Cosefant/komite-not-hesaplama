import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, AlertCircle, CheckCircle, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import GradeChart from './GradeChart';

interface Course {
  id: string;
  name: string;
  vizeCount: number;
  vizeWeights: number[];
  vizeScores: number[];
  finalWeight: number;
  finalScore: number | null;
  finalResult: number | null;
}

interface VizeSystemProps {
  darkMode: boolean;
}

const VizeSystem: React.FC<VizeSystemProps> = ({ darkMode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved courses from localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem('vizeCourses');
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (error) {
        console.error('Error loading saved courses:', error);
      }
    } else if (courses.length === 0) {
      addCourse();
    }
  }, []);

  // Save courses to localStorage when they change
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('vizeCourses', JSON.stringify(courses));
    }
  }, [courses]);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: `Ders ${courses.length + 1}`,
      vizeCount: 1,
      vizeWeights: [40],
      vizeScores: [null as unknown as number],
      finalWeight: 60,
      finalScore: null,
      finalResult: null
    };
    setCourses([...courses, newCourse]);
    toast.success('Yeni ders eklendi!', {
      icon: '📚',
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
    toast.success('Ders silindi!', {
      icon: '🗑️',
    });
  };

  const updateCourseName = (id: string, name: string) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, name } : course
    ));
  };

  const updateVizeCount = (id: string, count: number) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        // Adjust weights and scores arrays based on new count
        const newVizeWeights = Array(count).fill(0);
        const newVizeScores = Array(count).fill(null);
        
        // Copy existing values
        for (let i = 0; i < Math.min(count, course.vizeWeights.length); i++) {
          newVizeWeights[i] = course.vizeWeights[i];
          newVizeScores[i] = course.vizeScores[i];
        }
        
        // If first time setting up, distribute weights evenly
        if (course.vizeCount === 1 && course.vizeWeights[0] === 40) {
          const vizeTotal = 100 - course.finalWeight;
          const eachWeight = Math.floor(vizeTotal / count);
          for (let i = 0; i < count; i++) {
            newVizeWeights[i] = eachWeight;
          }
        }
        
        return { 
          ...course, 
          vizeCount: count,
          vizeWeights: newVizeWeights,
          vizeScores: newVizeScores
        };
      }
      return course;
    }));
  };

  const updateVizeWeight = (courseId: string, vizeIndex: number, weight: number) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const newVizeWeights = [...course.vizeWeights];
        newVizeWeights[vizeIndex] = weight;
        
        // Adjust final weight to ensure total is 100
        const vizeTotal = newVizeWeights.reduce((sum, w) => sum + w, 0);
        const finalWeight = 100 - vizeTotal;
        
        return { 
          ...course, 
          vizeWeights: newVizeWeights,
          finalWeight: finalWeight
        };
      }
      return course;
    }));
  };

  const updateVizeScore = (courseId: string, vizeIndex: number, score: number) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const newVizeScores = [...course.vizeScores];
        newVizeScores[vizeIndex] = score;
        
        // Calculate final result if all scores are available
        const allVizeScoresEntered = newVizeScores.every(score => score !== null && !isNaN(score));
        let finalResult = null;
        
        if (allVizeScoresEntered && course.finalScore !== null) {
          let vizeTotal = 0;
          for (let i = 0; i < course.vizeCount; i++) {
            vizeTotal += (newVizeScores[i] * course.vizeWeights[i]) / 100;
          }
          const finalContribution = (course.finalScore * course.finalWeight) / 100;
          finalResult = vizeTotal + finalContribution;
        }
        
        return { 
          ...course, 
          vizeScores: newVizeScores,
          finalResult
        };
      }
      return course;
    }));
  };

  const updateFinalScore = (courseId: string, score: number) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        // Calculate final result if all vize scores are available
        const allVizeScoresEntered = course.vizeScores.every(score => score !== null && !isNaN(score));
        let finalResult = null;
        
        if (allVizeScoresEntered && score !== null) {
          let vizeTotal = 0;
          for (let i = 0; i < course.vizeCount; i++) {
            vizeTotal += (course.vizeScores[i] * course.vizeWeights[i]) / 100;
          }
          const finalContribution = (score * course.finalWeight) / 100;
          finalResult = vizeTotal + finalContribution;
          
          // Show confetti if the student passed (score >= 60)
          if (finalResult >= 60 && !showConfetti) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            toast.success('Tebrikler! Dersi geçtiniz! 🎉', {
              icon: '🎓',
              duration: 5000,
            });
          }
        }
        
        return { 
          ...course, 
          finalScore: score,
          finalResult
        };
      }
      return course;
    }));
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

  const clearAllCourses = () => {
    if (confirm('Tüm dersleri silmek istediğinize emin misiniz?')) {
      setCourses([]);
      localStorage.removeItem('vizeCourses');
      addCourse();
      toast.success('Tüm dersler silindi!', {
        icon: '🧹',
      });
    }
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

  // Prepare data for chart
  const chartData = {
    labels: courses.map(course => course.name),
    datasets: [
      {
        label: 'Yıl Sonu Notu',
        data: courses.map(course => course.finalResult || 0),
        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)',
        borderColor: darkMode ? 'rgba(129, 140, 248, 1)' : 'rgba(67, 56, 202, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <motion.div 
        className="mb-6 flex flex-wrap gap-4 justify-between items-center"
        variants={itemVariants}
      >
        <div className="flex space-x-2">
          <button 
            onClick={addCourse}
            className={`flex items-center space-x-2 ${
              darkMode 
                ? 'bg-indigo-700 hover:bg-indigo-800' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white px-4 py-2 rounded-md transition-colors`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Yeni Ders Ekle</span>
          </button>
          
          {courses.length > 0 && (
            <button 
              onClick={clearAllCourses}
              className={`flex items-center space-x-2 ${
                darkMode 
                  ? 'bg-red-700 hover:bg-red-800' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white px-4 py-2 rounded-md transition-colors`}
            >
              <Trash2 className="h-5 w-5" />
              <span>Tümünü Temizle</span>
            </button>
          )}
        </div>
        
        {courses.some(course => course.finalResult !== null) && (
          <button 
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center space-x-2 ${
              darkMode 
                ? 'bg-emerald-700 hover:bg-emerald-800' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white px-4 py-2 rounded-md transition-colors`}
          >
            <BarChart className="h-5 w-5" />
            <span>{showChart ? 'Grafiği Gizle' : 'Grafiği Göster'}</span>
          </button>
        )}
      </motion.div>

      {/* Chart Section */}
      <AnimatePresence>
        {showChart && courses.some(course => course.finalResult !== null) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Not Dağılımı</h3>
              <div className="h-64">
                <GradeChart data={chartData} darkMode={darkMode} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {courses.length === 0 ? (
        <motion.div 
          className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          variants={itemVariants}
        >
          Henüz ders eklenmemiş. Yukarıdaki butonu kullanarak ders ekleyebilirsiniz.
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
        >
          <AnimatePresence>
            {courses.map(course => (
              <motion.div 
                key={course.id} 
                className={`border ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-750' 
                    : 'border-gray-200 bg-gray-50'
                } rounded-lg p-4 shadow-sm transition-colors duration-300`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                layout
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex-1 mb-2 md:mb-0">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourseName(course.id, e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-500' 
                          : 'border-gray-300 focus:ring-indigo-500'
                      } rounded-md focus:outline-none focus:ring-2 transition-colors duration-300`}
                      placeholder="Ders Adı"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => removeCourse(course.id)}
                      className={`flex items-center space-x-1 px-3 py-2 ${
                        darkMode 
                          ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      } rounded-md transition-colors duration-300`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Vize Sayısı
                  </label>
                  <select
                    value={course.vizeCount}
                    onChange={(e) => updateVizeCount(course.id, parseInt(e.target.value))}
                    className={`w-full md:w-auto px-3 py-2 border ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-500' 
                        : 'border-gray-300 focus:ring-indigo-500'
                    } rounded-md focus:outline-none focus:ring-2 transition-colors duration-300`}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Vize Notları ve Ağırlıkları</h4>
                  <div className="space-y-3">
                    {Array.from({ length: course.vizeCount }).map((_, index) => (
                      <div key={index} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                          <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            Vize {index + 1} Notu
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={course.vizeScores[index] || ''}
                            onChange={(e) => updateVizeScore(course.id, index, parseFloat(e.target.value))}
                            className={`w-full px-3 py-2 border ${
                              darkMode 
                                ? 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-500' 
                                : 'border-gray-300 focus:ring-indigo-500'
                            } rounded-md focus:outline-none focus:ring-2 transition-colors duration-300`}
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
                            value={course.vizeWeights[index] || ''}
                            onChange={(e) => updateVizeWeight(course.id, index, parseFloat(e.target.value))}
                            className={`w-full px-3 py-2 border ${
                              darkMode 
                                ? 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-500' 
                                : 'border-gray-300 focus:ring-indigo-500'
                            } rounded-md focus:outline-none focus:ring-2 transition-colors duration-300`}
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Final Notu
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={course.finalScore || ''}
                        onChange={(e) => updateFinalScore(course.id, parseFloat(e.target.value))}
                        className={`w-full px-3 py-2 border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white focus:ring-indigo-500' 
                            : 'border-gray-300 focus:ring-indigo-500'
                        } rounded-md focus:outline-none focus:ring-2 transition-colors duration-300`}
                        placeholder="0-100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        Final Ağırlığı (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={course.finalWeight}
                        readOnly
                        className={`w-full px-3 py-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300' 
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        } border rounded-md`}
                      />
                    </div>
                  </div>
                </div>

                {course.finalResult !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mt-6 p-4 ${
                      course.finalResult >= 60
                        ? darkMode 
                          ? 'bg-green-900/30 border-green-800' 
                          : 'bg-green-50 border-green-100'
                        : darkMode 
                          ? 'bg-red-900/30 border-red-800' 
                          : 'bg-red-50 border-red-100'
                    } border rounded-lg`}
                  >
                    <h4 className={`font-medium ${
                      course.finalResult >= 60
                        ? darkMode ? 'text-green-300' : 'text-green-800'
                        : darkMode ? 'text-red-300' : 'text-red-800'
                    } mb-2 flex items-center`}>
                      {course.finalResult >= 60 
                        ? <><CheckCircle className="h-5 w-5 mr-2" /> Sonuç: Geçtiniz!</>
                        : <><AlertCircle className="h-5 w-5 mr-2" /> Sonuç: Kaldınız!</>
                      }
                    </h4>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-2 md:mb-0">
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Yıl Sonu Notu:</span>
                        <span className={`ml-2 text-2xl font-bold ${getGradeColor(course.finalResult)}`}>
                          {course.finalResult.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Harf Notu:</span>
                        <span className={`ml-2 text-2xl font-bold ${getGradeColor(course.finalResult)}`}>
                          {getLetterGrade(course.finalResult)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            course.finalResult >= 85 ? 'bg-green-500 dark:bg-green-400' :
                            course.finalResult >= 70 ? 'bg-green-400 dark:bg-green-500' :
                            course.finalResult >= 60 ? 'bg-yellow-400 dark:bg-yellow-500' :
                            'bg-red-500 dark:bg-red-400'
                          }`} 
                          style={{ width: `${Math.min(100, course.finalResult)}%` }}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default VizeSystem;