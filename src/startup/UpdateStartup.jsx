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
  const [errors, setErrors] = useState({}); // For form validation errors

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

  // Update the handleCsvUpload function
  // Add this utility function at the top of your file
  // Update the validateCsvData function
  // Update the validateCsvData function
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
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading startup information...
        </p>
      </div>
    );
  }

  const renderFormSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="space-y-8">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="companyName"
              >
                Company Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter your company name"
                />
              </div>
              {errors.companyName && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <span className="inline-block h-4 w-4 rounded-full bg-red-100 text-red-500 mr-1.5 flex items-center justify-center text-xs">
                    !
                  </span>
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Company Description */}
            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="companyDescription"
              >
                Company Description
              </label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                placeholder="Describe your company's mission, vision, and what you do"
                value={formData.companyDescription || ""}
                onChange={handleInputChange}
                required
                rows={4}
                className="block w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
              />
            </div>

            {/* Industry and Founded Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="industry"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry || ""}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white appearance-none"
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
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="foundedDate"
                >
                  Founded Date
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="foundedDate"
                    type="date"
                    name="foundedDate"
                    value={formData.foundedDate || ""}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Number of Employees and Company Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="numberOfEmployees"
                >
                  Number of Employees
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="numberOfEmployees"
                    type="text"
                    name="numberOfEmployees"
                    placeholder="e.g. 1-10, 11-50, 51-200"
                    value={formData.numberOfEmployees || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="typeOfCompany"
                >
                  Type of Company
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="typeOfCompany"
                    name="typeOfCompany"
                    value={formData.typeOfCompany || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white appearance-none"
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-8">
            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="contactEmail"
                >
                  Contact Email
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="contactEmail"
                    type="email"
                    name="contactEmail"
                    placeholder="contact@company.com"
                    value={formData.contactEmail || ""}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                {errors.contactEmail && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <span className="inline-block h-4 w-4 rounded-full bg-red-100 text-red-500 mr-1.5 flex items-center justify-center text-xs">
                      !
                    </span>
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="phoneNumber"
                >
                  Phone Number
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="text"
                    name="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <span className="inline-block h-4 w-4 rounded-full bg-red-100 text-red-500 mr-1.5 flex items-center justify-center text-xs">
                      !
                    </span>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="website"
              >
                Website
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="website"
                  type="url"
                  name="website"
                  placeholder="https://www.example.com"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              {errors.website && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <span className="inline-block h-4 w-4 rounded-full bg-red-100 text-red-500 mr-1.5 flex items-center justify-center text-xs">
                    !
                  </span>
                  {errors.website}
                </p>
              )}
            </div>

            {/* Social Media Profiles */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Social Media Profiles
              </h3>

              <div className="space-y-4">
                {/* Facebook */}
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Facebook className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="facebook"
                    placeholder="Facebook URL"
                    value={formData.facebook || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Twitter */}
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Twitter className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="twitter"
                    placeholder="Twitter URL"
                    value={formData.twitter || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Instagram */}
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="instagram"
                    placeholder="Instagram URL"
                    value={formData.instagram || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* LinkedIn */}
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Linkedin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="linkedIn"
                    placeholder="LinkedIn URL"
                    value={formData.linkedIn || ""}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="relative h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            <Startupmap
              mapInstanceRef={mapInstanceRef}
              onMapClick={handleMapClick}
              initialLocation={
                formData.locationLat && formData.locationLng
                  ? { lat: formData.locationLat, lng: formData.locationLng }
                  : null
              }
            />

            <div className="absolute top-4 left-4 bg-white/95 p-5 rounded-xl shadow-xl backdrop-blur-sm border border-slate-100 w-80 max-w-[calc(100%-32px)] transition-all">
              <h3 className="font-medium text-slate-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                Location Details
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  name="locationName"
                  placeholder="Location Name"
                  value={formData.locationName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />

                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street Address"
                  value={formData.streetAddress || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  />

                  <input
                    type="text"
                    name="province"
                    placeholder="Province/State"
                    value={formData.province || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  />
                </div>

                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />

                {errors.location && (
                  <p className="text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg">
                    <span className="inline-block h-4 w-4 rounded-full bg-red-100 text-red-500 mr-1.5 flex items-center justify-center text-xs">
                      !
                    </span>
                    {errors.location}
                  </p>
                )}
              </div>

              {formData.locationLat && (
                <div className="mt-3 p-2 rounded-lg bg-indigo-50 flex items-center text-sm text-indigo-700 font-medium">
                  <MapPin className="h-4 w-4 mr-1.5 text-indigo-600" />
                  <div>
                    <div>Location set:</div>
                    <div className="font-mono text-xs">
                      {formData.locationLat.toFixed(6)}, {formData.locationLng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all font-medium text-sm"
              >
                {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              </button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 p-8 rounded-xl">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 shadow-sm">
                  <Upload className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Upload Startup Data
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Import additional metrics and data using CSV format
                  </p>
                </div>
              </div>

              {/* File upload area with dropzone */}
              <div
                className="border-2 border-dashed border-indigo-200 rounded-xl bg-white hover:bg-indigo-50/50 transition-colors p-8 text-center cursor-pointer group relative shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Upload className="h-8 w-8 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="font-medium text-slate-800 text-lg">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-slate-500 mt-1">- or -</p>
                <button
                  type="button"
                  className="mt-3 px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                >
                  Browse Files
                </button>
                <p className="text-xs text-slate-400 mt-4">
                  Only CSV files with valid startup metrics are supported
                </p>
              </div>

              {/* Selected file indicator */}
              {csvFile && (
                <div className="flex items-center mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                    <span className="text-xs font-medium text-indigo-600">CSV</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {csvFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-4 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCsvFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Upload status */}
              {uploadStatus && (
                <div
                  className={`mt-4 p-4 rounded-xl ${
                    uploadStatus.success
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 rounded-full p-1 ${
                        uploadStatus.success ? "bg-emerald-100" : "bg-red-100"
                      }`}
                    >
                      {uploadStatus.success ? (
                        <svg
                          className="h-5 w-5 text-emerald-600"
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
                      ) : (
                        <svg
                          className="h-5 w-5 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          uploadStatus.success
                            ? "text-emerald-800"
                            : "text-red-800"
                        }`}
                      >
                        {uploadStatus.success
                          ? "Upload Successful"
                          : "Upload Failed"}
                      </p>
                      <p
                        className={`text-sm ${
                          uploadStatus.success
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {uploadStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={handleCsvUpload}
                disabled={!csvFile || uploading}
                className={`mt-6 w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                  !csvFile || uploading
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-md"
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
                    Upload Data
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern header with subtle gradient and better spacing */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-white/90 transition-all rounded-lg px-4 py-2 hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5 mr-2" strokeWidth={2.5} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {formData.companyName || "Update Startup Profile"}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification with improved design */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl text-red-700 p-5 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-4">
                <svg
                  className="h-5 w-5 text-red-500"
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
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                className="ml-auto text-red-400 hover:text-red-600"
                onClick={() => setError(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Success notification with improved design */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 rounded-full p-2 mr-4">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-emerald-800">Success</h3>
                <p className="text-sm text-emerald-700 mt-1">{success}</p>
              </div>
              <button
                className="ml-auto text-emerald-400 hover:text-emerald-600"
                onClick={() => setSuccess(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main card with improved shadow and rounding */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Modern tab navigation */}
          <div className="flex border-b overflow-x-auto bg-white sticky top-0 z-10">
            {[
              {
                id: "basic",
                label: "Basic Information",
                icon: <Building className="h-4 w-4 mr-2" />,
              },
              {
                id: "contact",
                label: "Contact & Social",
                icon: <Mail className="h-4 w-4 mr-2" />,
              },
              {
                id: "location",
                label: "Location",
                icon: <MapPin className="h-4 w-4 mr-2" />,
              },
              {
                id: "upload",
                label: "Upload Data",
                icon: <Upload className="h-4 w-4 mr-2" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center justify-center px-6 py-5 text-center font-medium transition-all duration-200 min-w-[140px] ${
                  activeSection === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30"
                    : "text-slate-600 hover:text-indigo-500 hover:bg-indigo-50/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="relative h-1 bg-indigo-50">
            <div
              className="absolute h-1 bg-indigo-500 transition-all duration-500 ease-in-out"
              style={{
                width: `${(["basic", "contact", "location", "upload"].indexOf(
                  activeSection
                ) + 1) * 25}%`,
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-8">{renderFormSection()}</div>

            {/* Form actions with improved styling */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button
                type="button"
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium transition-all shadow-sm disabled:opacity-50"
                onClick={() => navigate("/startup-dashboard")}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 font-medium transition-all flex items-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
