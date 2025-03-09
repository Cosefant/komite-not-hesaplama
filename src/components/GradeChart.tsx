import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GradeChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  darkMode: boolean;
}

const GradeChart: React.FC<GradeChartProps> = ({ data, darkMode }) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: darkMode ? '#e5e7eb' : '#1f2937',
        borderColor: darkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.8)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 3,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563',
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
        }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: darkMode ? '#9ca3af' : '#4b5563',
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return <Bar data={data} options={options} />;
};

export default GradeChart;