import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit } from 'lucide-react';

const AddMethodModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleManualInput = () => {
    onClose(); 
    navigate("/add-startup");
  };

  const handleCsvFile = () => {
    onClose();
    navigate("/add-startup-csv"); 
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-opacity-10 backdrop-blur-sm"> 
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-8 border border-gray-200 relative"> 
        <div className="flex justify-center items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Add New Startup
          </h2>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="flex justify-center  text-lg text-gray-700 mb-8 font-medium">
          Which method would you prefer to input your data?
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleManualInput}
            className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-gray-300 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors shadow-md hover:border-blue-500 hover:ring-2 hover:ring-blue-500/50"
          >
            <Edit className="w-8 h-8 mb-2" />
            <span className="text-lg font-semibold">Manual Input</span>
            <span className="text-sm text-gray-500 mt-1">Step-by-step form entry</span>
          </button>

          <button
            onClick={handleCsvFile}
            className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-gray-300 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors shadow-md hover:border-blue-500 hover:ring-2 hover:ring-blue-500/50"   
          >
            <FileText className="w-8 h-8 mb-2" />
            <span className="text-lg font-semibold">CSV File</span>
            <span className="text-sm text-gray-500 mt-1">Bulk data upload</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMethodModal;