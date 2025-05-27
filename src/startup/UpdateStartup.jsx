import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Upload,
} from "lucide-react";
import Startupmap from "../3dmap/Startupmap"; // Import the map component

export default function UpdateStartup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mapInstanceRef = useRef(null);
  const fileInputRef = useRef(null);

  const initialStartupData = location.state?.startup || {};

  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    industry: "",
    foundedDate: "",
    typeOfCompany: "",
    numberOfEmployees: "",
    contactEmail: "",
    phoneNumber: "",
    website: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedIn: "",
    streetAddress: "",
    country: "",
    city: "",
    province: "",
    postalCode: "",
    locationLat: null,
    locationLng: null,
    locationName: "",
    ...initialStartupData,
  });

  const [loading, setLoading] = useState(!initialStartupData.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("basic");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (formData.foundedDate) {
      try {
        const date = new Date(formData.foundedDate);
        if (!isNaN(date.getTime())) {
          setFormData((prev) => ({
            ...prev,
            foundedDate: date.toISOString().split("T")[0],
          }));
        }
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
  }, []);

  // Fetch startup data if not provided in navigation state
  useEffect(() => {
    if (!initialStartupData.id && id) {
      fetchStartupData();
    }
  }, [id, initialStartupData.id]);

  const fetchStartupData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/startups/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error fetching startup: ${response.status}`);
      }

      const data = await response.json();

      let formattedData = { ...data };
      if (data.foundedDate) {
        try {
          const date = new Date(data.foundedDate);
          if (!isNaN(date.getTime())) {
            formattedData.foundedDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }
      }

      setFormData(formattedData);
    } catch (error) {
      console.error("Error fetching startup data:", error);
      setError("Failed to load startup details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMapClick = useCallback((lat, lng) => {
    console.log("Latitude:", lat, "Longitude:", lng);
    setFormData((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
    }));
    setIsSidebarVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/startups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error updating startup: ${response.status}`);
      }

      setSuccess("Startup updated successfully!");

      // Wait a bit before navigating back
      setTimeout(() => {
        navigate("/startup-dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error updating startup:", error);
      setError("Failed to update startup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setUploadStatus(null);
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      setUploadStatus({
        success: false,
        message: "Please select a CSV file to upload.",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(
        `http://localhost:8080/startups/${id}/upload-csv`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Read the error message as text
        throw new Error(errorText || `Error uploading CSV: ${response.status}`);
      }

      // Handle both JSON and plain text responses
      const contentType = response.headers.get("Content-Type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      setUploadStatus({
        success: true,
        message: result.message || result || "CSV data uploaded successfully!",
      });
      setCsvFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus({
        success: false,
        message: error.message || "Failed to upload CSV. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderFormSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input
                type="text"
                name="companyName"
                placeholder="Startup name"
                value={formData.companyName || ""}
                onChange={handleInputChange}
                required
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                name="companyDescription"
                placeholder="Description"
                value={formData.companyDescription || ""}
                onChange={handleInputChange}
                required
                rows={4}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <select
                name="industry"
                value={formData.industry || ""}
                onChange={handleInputChange}
                required
                className="select bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              >
                <option value="" disabled>
                  Select Industry
                </option>
                <option value="Agriculture">Agriculture</option>
                <option value="Construction">Construction</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <input
                type="date"
                name="foundedDate"
                value={formData.foundedDate || ""}
                onChange={handleInputChange}
                required
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="text"
                name="numberOfEmployees"
                placeholder="Number of employees"
                value={formData.numberOfEmployees || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <select
                name="typeOfCompany"
                value={formData.typeOfCompany || ""}
                onChange={handleInputChange}
                className="select bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              >
                <option value="" disabled>
                  Select Type of Company
                </option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Corporation (Inc.)">Corporation (Inc.)</option>
                <option value="Limited Liability Company (LLC)">
                  Limited Liability Company (LLC)
                </option>
                <option value="Cooperative (Co-op)">Cooperative (Co-op)</option>
                <option value="Nonprofit Organization">
                  Nonprofit Organization
                </option>
                <option value="Franchise">Franchise</option>
              </select>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input
                type="email"
                name="contactEmail"
                placeholder="Contact email"
                value={formData.contactEmail || ""}
                onChange={handleInputChange}
                required
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone number"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="url"
                name="website"
                placeholder="Website"
                value={formData.website || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="url"
                name="facebook"
                placeholder="Facebook"
                value={formData.facebook || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="url"
                name="twitter"
                placeholder="Twitter"
                value={formData.twitter || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="url"
                name="instagram"
                placeholder="Instagram"
                value={formData.instagram || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>

            <div>
              <input
                type="url"
                name="linkedIn"
                placeholder="LinkedIn"
                value={formData.linkedIn || ""}
                onChange={handleInputChange}
                className="input bg-gray-300 text-black border-gray-200 w-full mb-4 p-2 rounded"
              />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="flex flex-col md:flex-row h-full">
            {isSidebarVisible && (
              <div className="md:w-1/3 p-4 bg-white rounded-lg shadow mr-4">
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="locationName"
                    placeholder="Location Name"
                    value={formData.locationName || ""}
                    onChange={handleInputChange}
                    className="input bg-gray-300 text-black border-gray-200 w-full p-2 rounded"
                  />

                  <input
                    type="text"
                    name="streetAddress"
                    placeholder="Street Address"
                    value={formData.streetAddress || ""}
                    onChange={handleInputChange}
                    className="input bg-gray-300 text-black border-gray-200 w-full p-2 rounded"
                  />

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="input bg-gray-300 text-black border-gray-200 w-full p-2 rounded"
                  />

                  <input
                    type="text"
                    name="province"
                    placeholder="Province/State"
                    value={formData.province || ""}
                    onChange={handleInputChange}
                    className="input bg-gray-300 text-black border-gray-200 w-full p-2 rounded"
                  />

                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode || ""}
                    onChange={handleInputChange}
                    className="input bg-gray-300 text-black border-gray-200 w-full p-2 rounded"
                  />

                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="locationLat"
                      placeholder="Latitude"
                      value={formData.locationLat || ""}
                      onChange={handleInputChange}
                      readOnly
                      className="input bg-gray-200 text-black border-gray-200 w-1/2 p-2 rounded"
                    />

                    <input
                      type="number"
                      name="locationLng"
                      placeholder="Longitude"
                      value={formData.locationLng || ""}
                      onChange={handleInputChange}
                      readOnly
                      className="input bg-gray-200 text-black border-gray-200 w-1/2 p-2 rounded"
                    />
                  </div>

                  <button
                    onClick={() => setIsSidebarVisible(false)}
                    className="btn bg-blue-500 text-white hover:bg-blue-600 w-full py-2 rounded-lg"
                  >
                    Set Company Location on Map
                  </button>

                  {formData.locationLat && (
                    <p className="text-sm text-gray-600">
                      Selected Location: ({formData.locationLat.toFixed(4)},{" "}
                      {formData.locationLng.toFixed(4)})
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Map always shows in location tab, but takes full width when sidebar is hidden */}
            <div
              className={`${
                isSidebarVisible ? "md:w-2/3" : "w-full"
              } h-96 rounded-lg overflow-hidden`}
            >
              <Startupmap
                mapInstanceRef={mapInstanceRef}
                onMapClick={handleMapClick}
                initialLocation={
                  formData.locationLat && formData.locationLng
                    ? { lat: formData.locationLat, lng: formData.locationLng }
                    : null
                }
              />
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Data via CSV
              </h2>

              <p className="text-gray-600 mb-6">
                Upload a CSV file to update or add data to this startup. Make
                sure your CSV follows the required format.
              </p>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Select CSV File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV files only</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {csvFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected file: {csvFile.name}
                  </p>
                )}
              </div>

              {uploadStatus && (
                <div
                  className={`p-4 mb-4 rounded-lg ${
                    uploadStatus.success
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <p className="text-sm font-medium">{uploadStatus.message}</p>
                </div>
              )}

              <button
                onClick={handleCsvUpload}
                disabled={!csvFile || uploading}
                className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !csvFile || uploading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload CSV
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <h1 className="text-xl font-bold text-indigo-600">
            Update Startup: {formData.companyName}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex items-center">
              <div className="py-1">
                <svg
                  className="h-6 w-6 mr-4 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <div className="flex items-center">
              <div className="py-1">
                <svg
                  className="h-6 w-6 mr-4 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold">Success</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection("basic")}
              className={`flex-1 py-4 text-center font-medium whitespace-nowrap ${
                activeSection === "basic"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Basic Information
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("contact")}
              className={`flex-1 py-4 text-center font-medium whitespace-nowrap ${
                activeSection === "contact"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Contact & Social
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("location")}
              className={`flex-1 py-4 text-center font-medium whitespace-nowrap ${
                activeSection === "location"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Location
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("upload")}
              className={`flex-1 py-4 text-center font-medium whitespace-nowrap ${
                activeSection === "upload"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upload Data
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {renderFormSection()}

              {activeSection !== "upload" && (
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => navigate("/startup-dashboard")}
                    disabled={submitting}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
