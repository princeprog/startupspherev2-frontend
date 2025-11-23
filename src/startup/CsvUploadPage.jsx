import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivacyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Privacy & Security</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-blue-800 mb-2">Data Protection</h3>
                            <p className="text-blue-700">
                                Your startup data is encrypted and securely stored using industry-standard security measures. We implement strict access controls and regular security audits to ensure your information remains protected.
                            </p>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-blue-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const LoadingModal = ({ isLoading, loadingProgress, loadingStatus }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-gray-200">
                <div className="text-center">
                    <div className="mb-4">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Startup</h2>
                    <p className="text-gray-600 mb-4">{loadingStatus}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">Please wait while we process your startup information...</p>
                </div>
            </div>
        </div>
    );
};


export default function CsvUploadPage() {
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [startupId, setStartupId] = useState("DUMMY_CSV_STARTUP_ID"); 

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error("No file selected.");
            return;
        }

        // Get file extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        // Check for valid file types
        const validExtensions = ['csv', 'xlsx'];
        const validMimeTypes = [
            'text/csv',
            'application/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        const isValidExtension = validExtensions.includes(fileExtension);
        const isValidMimeType = validMimeTypes.includes(file.type) || file.type === '';
        
        if (!isValidExtension) {
            toast.error("Invalid file type. Please upload a .csv or .xlsx file.");
            return;
        }
        
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            toast.error("File size too large. Maximum file size is 10MB.");
            return;
        }
        
        setUploadedFile(file);
        toast.success(`${fileExtension.toUpperCase()} file selected successfully!`);
    };

    const handleFileSubmit = async () => {
        if (!uploadedFile) {
            toast.error("Please select a file.");
            return;
        }
        if (!startupId) {
            toast.error("Error: Startup ID not found. Cannot proceed with upload.");
            return;
        }

        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingStatus("Preparing to upload data...");

        const formData = new FormData();
        formData.append("file", uploadedFile);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            setLoadingStatus("Uploading data...");
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/startups/upload-startups`, 
                {
                    method: "POST", 
                    body: formData,
                    credentials: "include",
                }
            );

            clearInterval(progressInterval);
            setLoadingProgress(100);
            setLoadingStatus("Finalizing startup data...");

            if (response.ok) {
                toast.success("Startup data uploaded successfully and is waiting for review!");
                setTimeout(() => {
                    navigate("/startup-dashboard");
                }, 1500);
            } else {
                const errorData = await response.json();
                toast.error(
                    `Failed to upload file: ${errorData.message || "Unknown error"}`
                );
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("An error occurred while uploading the file.");
            setIsLoading(false);
        }
    };

    const downloadCsvTemplate = async () => {
        try {
            // Fetch the template from the public folder
            const response = await fetch('/startupsphere-template.xlsx');
            
            if (!response.ok) {
                throw new Error('Failed to fetch template');
            }
            
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "startupsphere-startup-template.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            toast.success("Template downloaded successfully!");
        } catch (error) {
            console.error("Error downloading template:", error);
            toast.error("Failed to download template. Please try again.");
        }
    };

    const handleSkip = () => {
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingStatus("Preparing to redirect...");

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 30;
            });
        }, 300);

        setTimeout(() => {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setLoadingStatus("Redirecting to dashboard...");
            setTimeout(() => {
                navigate("/startup-dashboard");
            }, 1000);
        }, 1000);
    };


    return (
        <div className="h-screen overflow-hidden bg-gray-100 min-h-screen text-gray-800 relative">
            <div className="bg-[#1D3557] px-10 py-6 text-white">
                <h1 className="text-3xl font-semibold">Upload Startup Data</h1>
            </div>

            <div className="bg-white shadow-md rounded-md p-8 w-4/5 mx-auto mt-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Upload Startup Data</h2>
                            <button
                                type="button"
                                className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                onClick={downloadCsvTemplate}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Template
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column - Upload Section */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <h3 className="text-lg font-medium text-blue-800 mb-2">Quick Start Guide</h3>
                                    <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                        <li>Download the Excel template</li>
                                        <li>Fill in your startup's data</li>
                                        <li>Upload the completed file</li>
                                        <li>Review and submit</li>
                                    </ol>
                                </div>

                                {/* File Dropzone */}
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const droppedFile = e.dataTransfer.files[0];
                                        if (droppedFile) {
                                            // Create a synthetic event for handleFileUpload
                                            handleFileUpload({ target: { files: [droppedFile] } });
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="cursor-pointer block"
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="text-gray-600 font-medium">
                                                {uploadedFile ? uploadedFile.name : "Click to upload file"}
                                            </span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                or drag and drop your file here
                                            </span>
                                            <span className="text-xs text-gray-400 mt-2">
                                                Supports .CSV and .XLSX files (Max 10MB)
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between space-x-4">
                                    <button
                                        type="button"
                                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
                                        onClick={() => navigate("/startup-dashboard")} // No 'Back' needed, redirect to dashboard or previous screen
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleFileSubmit}
                                        disabled={!uploadedFile}
                                    >
                                        Upload File
                                    </button>
                                </div>
                            </div>

                            {/* Right Column - Instructions (Privacy, Required Fields) */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">Required Data Fields</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-2">1</span>
                                            <div>
                                                <p className="font-medium text-gray-700">Financial Metrics</p>
                                                <p className="text-sm text-gray-600">Revenue, capital, funding data</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-2">2</span>
                                            <div>
                                                <p className="font-medium text-gray-700">Growth Indicators</p>
                                                <p className="text-sm text-gray-600">Growth rate, survival rate</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-2">3</span>
                                            <div>
                                                <p className="font-medium text-gray-700">Support Programs</p>
                                                <p className="text-sm text-gray-600">Incubators, mentors, partnerships</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className=" bg-green-50 rounded-lg p-4 border border-green-100">
                                    <h3 className="text-lg font-medium text-green-800 mb-2">Privacy & Security</h3>
                                    <p className="text-sm text-green-700">
                                        Your data is encrypted and securely stored. We follow industry-standard security practices to protect your information.
                                    </p>
                                    <button
                                        onClick={() => setIsPrivacyModalOpen(true)}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-flex items-center"
                                    >
                                        Learn more about our privacy practices
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {uploadedFile && (
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center flex-1">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-blue-700 font-medium truncate">File Ready to Upload</span>
                                                    </div>
                                                    <p className="text-sm text-blue-600 mt-1 truncate">
                                                        {uploadedFile.name}
                                                    </p>
                                                    <p className="text-xs text-blue-500 mt-0.5">
                                                        {(uploadedFile.size / 1024).toFixed(2)} KB • {uploadedFile.name.split('.').pop().toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setUploadedFile(null);
                                                    const fileInput = document.getElementById('csv-upload');
                                                    if (fileInput) fileInput.value = '';
                                                    toast.info("File removed");
                                                }}
                                                className="ml-3 p-2 hover:bg-blue-200 rounded-lg transition-colors flex-shrink-0"
                                                title="Remove file"
                                            >
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PrivacyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
            />

            <LoadingModal 
                isLoading={isLoading} 
                loadingProgress={loadingProgress} 
                loadingStatus={loadingStatus} 
            />
            <ToastContainer />
        </div>
    );
}