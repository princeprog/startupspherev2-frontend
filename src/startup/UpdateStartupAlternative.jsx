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
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Startupmap from "../3dmap/Startupmap";

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
  const [errors, setErrors] = useState({});

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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}`,
        {
          credentials: "include",
        }
      );

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

    // Basic validation
    const newErrors = {};
    if (!formData.companyName) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.contactEmail) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email address is invalid";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.website) {
      newErrors.website = "Website is required";
    }
    if (!formData.streetAddress) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.province) {
      newErrors.province = "Province/State is required";
    }
    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required";
    }
    if (!formData.locationLat || !formData.locationLng) {
      newErrors.location = "Location on map is required";
    }

    setErrors(newErrors);

    // If there are errors, don't submit the form
    if (Object.keys(newErrors).length > 0) {
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

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

  const validateCsvData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.trim().split("\n");

          // Define valid headers (all possible headers)
          const validHeaders = [
            "revenue",
            "annualrevenue",
            "paidupcapital",
            "fundingstage",
            "businessactivity",
            "operatinghours",
            "numberofactivestartups",
            "numberofnewstartupsthisyear",
            "averagestartupgrowthrate",
            "startupsurvivalrate",
            "totalstartupfundingreceived",
            "averagefundingperstartup",
            "numberoffundingrounds",
            "numberofstartupswithforeigninvestment",
            "amountofgovernmentgrantsorsubsidiesreceived",
            "numberofstartupincubatorsoraccelerators",
            "numberofstartupsinincubationprograms",
            "numberofmentorsoradvisorsinvolved",
            "publicprivatepartnershipsinvolvingstartups",
          ];

          // Get and validate headers
          const headers = lines[0]
            .toLowerCase()
            .trim()
            .split(",")
            .map((h) => h.trim());

          // Find which headers are valid
          const foundHeaders = headers.filter((h) => validHeaders.includes(h));

          if (foundHeaders.length === 0) {
            reject(
              "CSV file must contain at least one valid column. Valid columns are: " +
                validHeaders.join(", ")
            );
            return;
          }

          // Process CSV data
          const data = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const rowData = {};

            headers.forEach((header, index) => {
              if (validHeaders.includes(header)) {
                // Handle numeric values appropriately
                const value = values[index] || "";
                if (
                  [
                    "fundingstage",
                    "businessactivity",
                    "operatinghours",
                  ].includes(header)
                ) {
                  rowData[header] = value; // Keep as string
                } else {
                  // Convert numeric values but maintain empty strings
                  rowData[header] = value === "" ? "" : Number(value) || value;
                }
              }
            });

            return rowData;
          });

          // Create processed CSV
          const processedCsv = new Blob(
            [
              headers.join(",") +
                "\n" +
                data
                  .map((row) =>
                    headers
                      .map((h) => (row[h] !== undefined ? row[h] : ""))
                      .join(",")
                  )
                  .join("\n"),
            ],
            { type: "text/csv;charset=utf-8;" }
          );

          resolve({
            blob: processedCsv,
            headers: foundHeaders,
          });
        } catch (error) {
          reject("Error processing CSV file: " + error.message);
        }
      };
      reader.onerror = () => reject("Error reading file");
      reader.readAsText(file);
    });
  };

  // Update the handleCsvUpload function
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
      const { blob, headers } = await validateCsvData(csvFile);

      const formData = new FormData();
      formData.append("file", blob, csvFile.name);
      formData.append("headers", JSON.stringify(headers)); // Send headers to backend

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/upload-csv`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error uploading CSV: ${response.status}`);
      }

      const result = await response.json();

      setUploadStatus({
        success: true,
        message: `CSV data uploaded successfully! Updated fields: ${headers.join(
          ", "
        )}`,
      });

      // Reset file input and state
      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh startup data
      await fetchStartupData();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus({
        success: false,
        message: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading</h2>
          <p className="mt-2 text-sm text-gray-500">Retrieving startup information...</p>
        </div>
      </div>
    );
  }

  const renderFormSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Basic Information</h2>
            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.companyName ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800`}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription || ""}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your company's mission, vision, and what you do"
                  className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry*
                  </label>
                  <div className="relative">
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry || ""}
                      onChange={handleInputChange}
                      required
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none pr-10"
                    >
                      <option value="" disabled>Select Industry</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Construction">Construction</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronRight size={18} className="text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Founded Date */}
                <div>
                  <label htmlFor="foundedDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="foundedDate"
                      name="foundedDate"
                      value={formData.foundedDate || ""}
                      onChange={handleInputChange}
                      required
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Number of Employees */}
                <div>
                  <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Employees
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="numberOfEmployees"
                      name="numberOfEmployees"
                      value={formData.numberOfEmployees || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 1-10, 11-50, 51-200"
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Type of Company */}
                <div>
                  <label htmlFor="typeOfCompany" className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase size={18} className="text-gray-400" />
                    </div>
                    <select
                      id="typeOfCompany"
                      name="typeOfCompany"
                      value={formData.typeOfCompany || ""}
                      onChange={handleInputChange}
                      className="text-gray-800 w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Corporation (Inc.)">Corporation (Inc.)</option>
                      <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                      <option value="Cooperative (Co-op)">Cooperative (Co-op)</option>
                      <option value="Nonprofit Organization">Nonprofit Organization</option>
                      <option value="Franchise">Franchise</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronRight size={18} className="text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Contact Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="contact@company.com"
                      className={`w-full pl-10 pr-3 py-2.5 border ${
                        errors.contactEmail ? "border-red-300" : "border-gray-300"
                      } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 123-4567"
                      className={`w-full pl-10 pr-3 py-2.5 border ${
                        errors.phoneNumber ? "border-red-300" : "border-gray-300"
                      } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="https://www.example.com"
                    className={`w-full pl-10 pr-3 py-2.5 border ${
                      errors.website ? "border-red-300" : "border-gray-300"
                    } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>

              {/* Social Media Section */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Social Media Profiles</h3>
                <div className="space-y-4">
                  {/* Facebook */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Facebook size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook || ""}
                      onChange={handleInputChange}
                      placeholder="Facebook URL"
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Twitter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Twitter size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter || ""}
                      onChange={handleInputChange}
                      placeholder="Twitter URL"
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Instagram size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram || ""}
                      onChange={handleInputChange}
                      placeholder="Instagram URL"
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Linkedin size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="linkedIn"
                      value={formData.linkedIn || ""}
                      onChange={handleInputChange}
                      placeholder="LinkedIn URL"
                      className="text-gray-800 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Location Information</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="h-[500px] relative rounded-lg overflow-hidden">
                <Startupmap
                  mapInstanceRef={mapInstanceRef}
                  onMapClick={handleMapClick}
                  initialLocation={
                    formData.locationLat && formData.locationLng
                      ? { lat: formData.locationLat, lng: formData.locationLng }
                      : null
                  }
                />
                
                <div className={`absolute top-4 ${isSidebarVisible ? 'right-4' : 'left-4'} bg-white rounded-lg shadow-lg p-5 w-80 max-w-[calc(100%-2rem)] transition-all`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <MapPin size={18} className="text-blue-600 mr-2" />
                      Location Details
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                      className="text-gray-800 hover:text-gray-700 transition-colors"
                    >
                      {isSidebarVisible ? <X size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>

                  {isSidebarVisible && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="locationName"
                        placeholder="Location Name"
                        value={formData.locationName || ""}
                        onChange={handleInputChange}
                        className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <input
                        type="text"
                        name="streetAddress"
                        placeholder="Street Address*"
                        value={formData.streetAddress || ""}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border ${
                          errors.streetAddress ? "border-red-300" : "border-gray-300"
                        } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="city"
                          placeholder="City*"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border ${
                            errors.city ? "border-red-300" : "border-gray-300"
                          } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        
                        <input
                          type="text"
                          name="province"
                          placeholder="Province/State*"
                          value={formData.province || ""}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border ${
                            errors.province ? "border-red-300" : "border-gray-300"
                          } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="postalCode"
                          placeholder="Postal Code*"
                          value={formData.postalCode || ""}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border ${
                            errors.postalCode ? "border-red-300" : "border-gray-300"
                          } text-gray-800 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        
                        <input
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={formData.country || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {errors.location && (
                        <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm flex items-start">
                          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>{errors.location}</span>
                        </div>
                      )}
                      
                      {formData.locationLat && formData.locationLng && (
                        <div className="bg-blue-50 p-2 rounded-md text-sm text-blue-700">
                          <div className="font-medium mb-1 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            Position selected
                          </div>
                          <div className="font-mono text-xs">
                            Lat: {formData.locationLat.toFixed(6)}, Lng: {formData.locationLng.toFixed(6)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "upload":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload Data</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Upload size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">CSV Data Upload</h3>
                    <p className="text-gray-500 text-sm">Import additional metrics using CSV format</p>
                  </div>
                </div>

                {/* File upload area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-8 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Upload size={24} className="text-gray-600" />
                  </div>
                  <h4 className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</h4>
                  <p className="text-sm text-gray-500 mb-2">CSV files only</p>
                  <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Select CSV File
                  </span>
                </div>

                {/* Selected file indicator */}
                {csvFile && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md mr-3">
                      <span className="text-xs font-semibold text-blue-700">CSV</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{csvFile.name}</p>
                      <p className="text-sm text-gray-500">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-blue-200 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCsvFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X size={16} className="text-blue-600" />
                    </button>
                  </div>
                )}

                {/* Upload status */}
                {uploadStatus && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    uploadStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex">
                      {uploadStatus.success ? (
                        <CheckCircle2 size={20} className="text-green-600 mr-3 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`font-medium ${uploadStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                          {uploadStatus.success ? 'Upload Successful' : 'Upload Failed'}
                        </p>
                        <p className={`text-sm ${uploadStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                          {uploadStatus.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <button
                  type="button"
                  onClick={handleCsvUpload}
                  disabled={!csvFile || uploading}
                  className={`mt-5 w-full py-2.5 px-4 rounded-md font-medium flex items-center justify-center ${
                    !csvFile || uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Upload CSV Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-gray-700 mr-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {formData.companyName ? `Edit: ${formData.companyName}` : "Update Startup"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate("/startup-dashboard")}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex items-center">
              <CheckCircle2 size={20} className="text-green-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Form Sections</h2>
              </div>
              <nav className="flex flex-col">
                {[
                  { id: "basic", label: "Basic Information", icon: <Building size={18} /> },
                  { id: "contact", label: "Contact Information", icon: <Mail size={18} /> },
                  { id: "location", label: "Location", icon: <MapPin size={18} /> },
                  { id: "upload", label: "Upload Data", icon: <Upload size={18} /> },
                ].map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center px-4 py-3 text-left border-l-2 ${
                      activeSection === section.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-3 text-gray-500">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
              
              {/* Form completion indicator */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Completion</span>
                  <span>Step {["basic", "contact", "location", "upload"].indexOf(activeSection) + 1} of 4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(["basic", "contact", "location", "upload"].indexOf(activeSection) + 1) * 25}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form>
                {renderFormSection()}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}