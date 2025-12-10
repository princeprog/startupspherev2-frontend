import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import EditLocationMap from "../3dmap/EditLocationMap";

export default function UpdateStartup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mapInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const certificateInputRef = useRef(null);

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
    region: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: "",
    locationLat: null,
    locationLng: null,
    locationName: "",
    fundingStage: "",
    operatingHours: "",
    businessActivity: "",
    isGovernmentRegistered: "",
    registrationAgency: "",
    registrationNumber: "",
    registrationDate: null,
    otherRegistrationAgency: "",
    businessLicenseNumber: "",
    tin: "",
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
  const [uploadMode, setUploadMode] = useState("replace"); // replace or skip
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [csvPreviewData, setCsvPreviewData] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [uploadedCertificate, setUploadedCertificate] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState(false);

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

  // Fetch current logo whenever id is available
  useEffect(() => {
    if (id) {
      console.log("[useEffect] Component mounted/id changed, fetching logo for ID:", id);
      fetchCurrentLogo();
    }
  }, [id]);

  // Fetch current certificate whenever id is available
  useEffect(() => {
    if (id) {
      console.log("[useEffect] Component mounted/id changed, fetching certificate for ID:", id);
      fetchCurrentCertificate();
    }
  }, [id]);

  // Fetch regions from PSGC API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("https://psgc.gitlab.io/api/regions/");
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    fetchRegions();
  }, []);

  // Fetch provinces when region is selected
  useEffect(() => {
    if (selectedRegion) {
      const fetchProvinces = async () => {
        try {
          const response = await fetch(`https://psgc.gitlab.io/api/regions/${selectedRegion.code}/provinces/`);
          const data = await response.json();
          setProvinces(data);
        } catch (error) {
          console.error("Error fetching provinces:", error);
        }
      };
      fetchProvinces();
    }
  }, [selectedRegion]);

  // Fetch cities when province is selected
  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          const response = await fetch(`https://psgc.gitlab.io/api/provinces/${selectedProvince.code}/cities-municipalities/`);
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    }
  }, [selectedProvince]);

  // Fetch barangays when city is selected
  useEffect(() => {
    if (selectedCity) {
      const fetchBarangays = async () => {
        try {
          const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity.code}/barangays/`);
          const data = await response.json();
          setBarangays(data);
        } catch (error) {
          console.error("Error fetching barangays:", error);
        }
      };
      fetchBarangays();
    }
  }, [selectedCity]);

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

      // Parse operating hours
      if (data.operatingHours) {
        const match = data.operatingHours.match(/^(.*?): (\d{2}:\d{2}) - (\d{2}:\d{2})$/);
        if (match) {
          const [_, days, opening, closing] = match;
          setSelectedDays(days.split(", "));
          setOpeningTime(opening);
          setClosingTime(closing);
        }
      }

      setFormData(formattedData);
      
      // Logo will be fetched by the dedicated useEffect hook
    } catch (error) {
      console.error("Error fetching startup data:", error);
      setError("Failed to load startup details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLogo = async () => {
    console.log("[fetchCurrentLogo] Starting logo fetch for startup ID:", id);
    setLogoLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/photo`;
      console.log("[fetchCurrentLogo] Fetching from URL:", url);
      
      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("[fetchCurrentLogo] Response status:", response.status);
      console.log("[fetchCurrentLogo] Response ok:", response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log("[fetchCurrentLogo] Blob received, size:", blob.size, "bytes, type:", blob.type);
        
        // Clean up old URL if exists
        if (logoUrl) {
          console.log("[fetchCurrentLogo] Cleaning up old URL");
          URL.revokeObjectURL(logoUrl);
        }
        const objectUrl = URL.createObjectURL(blob);
        console.log("[fetchCurrentLogo] Created object URL:", objectUrl);
        setLogoUrl(objectUrl);
        console.log("[fetchCurrentLogo] Logo URL state updated successfully");
      } else {
        console.warn("[fetchCurrentLogo] Response not OK. Status:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("[fetchCurrentLogo] Error fetching logo:", error);
    } finally {
      setLogoLoading(false);
    }
  };

  const fetchCurrentCertificate = async () => {
    console.log("[fetchCurrentCertificate] Starting certificate fetch for startup ID:", id);
    setCertificateLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/registration-certificate`;
      console.log("[fetchCurrentCertificate] Fetching from URL:", url);
      
      const response = await fetch(url, {
        credentials: "include",
      });

      console.log("[fetchCurrentCertificate] Response status:", response.status);
      console.log("[fetchCurrentCertificate] Response ok:", response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log("[fetchCurrentCertificate] Blob received, size:", blob.size, "bytes, type:", blob.type);
        
        // Clean up old URL if exists
        if (certificateUrl) {
          console.log("[fetchCurrentCertificate] Cleaning up old URL");
          URL.revokeObjectURL(certificateUrl);
        }
        const objectUrl = URL.createObjectURL(blob);
        console.log("[fetchCurrentCertificate] Created object URL:", objectUrl);
        setCertificateUrl(objectUrl);
        console.log("[fetchCurrentCertificate] Certificate URL state updated successfully");
      } else {
        console.warn("[fetchCurrentCertificate] Response not OK. Status:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("[fetchCurrentCertificate] Error fetching certificate:", error);
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/upload-photo`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }

      // Clean up preview URL
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(null);
      }
      
      // Refresh logo
      await fetchCurrentLogo();
      setUploadedLogo(null);
      setSuccess("Logo updated successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("Failed to upload logo. Please try again.");
    }
  };

  const handleCertificateUpload = async (file) => {
    if (!file) return;

    setCertificateUploading(true);
    try {
      const formData = new FormData();
      formData.append("registrationCertificate", file);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/upload-registration-certificate`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload certificate");
      }

      // Clean up preview URL
      if (certificatePreviewUrl) {
        URL.revokeObjectURL(certificatePreviewUrl);
        setCertificatePreviewUrl(null);
      }
      
      // Refresh certificate
      await fetchCurrentCertificate();
      setUploadedCertificate(null);
      setSuccess("Certificate updated successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      setError("Failed to upload certificate. Please try again.");
    } finally {
      setCertificateUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMapClick = useCallback((lat, lng, locationName = "") => {
    console.log("Latitude:", lat, "Longitude:", lng);
    setFormData((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
      locationName: locationName || prev.locationName,
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

  // Prepare CSV upload and show confirmation
  const handleCsvUpload = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      setUploadStatus({
        success: false,
        message: "Please select a file to upload.",
      });
      return;
    }

    // Get file extension
    const fileExtension = csvFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['csv', 'xlsx'];
    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const isValidExtension = validExtensions.includes(fileExtension);
    if (!isValidExtension) {
      setUploadStatus({
        success: false,
        message: "Invalid file type. Please upload a .csv or .xlsx file.",
      });
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (csvFile.size > maxSize) {
      setUploadStatus({
        success: false,
        message: "File size too large. Maximum file size is 10MB.",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/upload-csv`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: "File uploaded successfully!",
        });
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchStartupData();
      } else {
        const errorData = await response.json();
        setUploadStatus({
          success: false,
          message: errorData.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        success: false,
        message: "An error occurred while uploading the file.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Confirm and execute upload
  const confirmCsvUpload = async () => {
    if (!csvPreviewData) return;

    setUploading(true);
    setShowUploadConfirmation(false);
    setUploadStatus(null);

    try {
      const { blob, headers } = csvPreviewData;

      const formData = new FormData();
      formData.append("file", blob, csvFile.name);
      formData.append("headers", JSON.stringify(headers));
      formData.append("mode", uploadMode); // Send upload mode to backend

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
      setCsvPreviewData(null);
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

              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      const file = e.target.files[0];
                      setUploadedLogo(file);
                      const tempUrl = URL.createObjectURL(file);
                      setLogoPreviewUrl(tempUrl);
                    }
                  }}
                  className="hidden"
                />
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                  {logoLoading ? (
                    <div className="p-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-20 h-20 mb-4">
                          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <h4 className="text-base font-semibold text-gray-700 mb-2">Loading logo...</h4>
                        <p className="text-sm text-gray-500">Please wait while we fetch your company logo</p>
                      </div>
                    </div>
                  ) : (logoUrl || logoPreviewUrl) ? (
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Logo Preview */}
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white">
                            <img 
                              src={logoPreviewUrl || logoUrl} 
                              alt="Company logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {uploadedLogo && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1.5 shadow-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex-1">
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {uploadedLogo ? "New logo ready to upload" : "Current company logo"}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  {uploadedLogo 
                                    ? "Click 'Upload Logo' to save changes" 
                                    : "This is your current logo. Click 'Change Logo' to update it."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {uploadedLogo ? (
                            <div className="space-y-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-sm font-medium text-gray-700">Selected file:</p>
                                <p className="text-xs text-gray-500 mt-1 truncate">{uploadedLogo.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {(uploadedLogo.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleLogoUpload(uploadedLogo);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
                                >
                                  <Upload size={18} />
                                  Upload Logo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Clean up preview URL
                                    if (logoPreviewUrl) {
                                      URL.revokeObjectURL(logoPreviewUrl);
                                      setLogoPreviewUrl(null);
                                    }
                                    setUploadedLogo(null);
                                    if (logoInputRef.current) {
                                      logoInputRef.current.value = "";
                                    }
                                  }}
                                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Change Logo
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowRemoveLogoModal(true)}
                                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-gray-700 mb-2">No logo uploaded</h4>
                        <p className="text-sm text-gray-500 mb-6">
                          Upload a company logo to make your profile stand out
                        </p>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
                        >
                          <Upload size={20} />
                          Upload Logo
                        </button>
                        <p className="text-xs text-gray-400 mt-4">
                          PNG, JPG or WEBP (max. 5MB)
                        </p>
                      </div>
                    </div>
                  )}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Click anywhere on the map to set or update your startup's location. 
                You can freely pan and zoom to find the exact spot.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="h-[500px] relative rounded-lg overflow-hidden">
                <EditLocationMap
                  mapInstanceRef={mapInstanceRef}
                  onMapClick={handleMapClick}
                  initialLocation={
                    formData.locationLat && formData.locationLng
                      ? { 
                          lat: formData.locationLat, 
                          lng: formData.locationLng,
                          name: formData.locationName 
                        }
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
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
                          <div className="font-medium mb-1 flex items-center text-green-800">
                            <CheckCircle2 size={14} className="mr-1" />
                            Location Confirmed
                          </div>
                          <div className="font-mono text-xs text-green-700 mt-1">
                            Lat: {formData.locationLat.toFixed(6)}<br/>
                            Lng: {formData.locationLng.toFixed(6)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                locationLat: null,
                                locationLng: null,
                              }));
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center"
                          >
                            <X size={12} className="mr-1" />
                            Clear Location
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "additional":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Additional Information</h2>
            <div className="space-y-6">
              {/* Funding Stage */}
              <div>
                <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700 mb-1">
                  Funding Stage*
                </label>
                <select
                  id="fundingStage"
                  name="fundingStage"
                  value={formData.fundingStage || ""}
                  onChange={handleInputChange}
                  required
                  className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select funding stage...</option>
                  <option value="Angel Investment">Angel Investment</option>
                  <option value="Bank Loan">Bank Loan</option>
                  <option value="Crowdfunding">Crowdfunding</option>
                  <option value="DOST Funding">DOST Funding</option>
                  <option value="DTI Funding">DTI Funding</option>
                  <option value="Family & Friends">Family & Friends</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="IPO / Public Offering">IPO / Public Offering</option>
                  <option value="Microfinance">Microfinance</option>
                  <option value="Not Seeking Funding">Not Seeking Funding</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Private Equity">Private Equity</option>
                  <option value="Seed Funding">Seed Funding</option>
                  <option value="Self-Funded / Bootstrapped">Self-Funded / Bootstrapped</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C">Series C</option>
                  <option value="Series D+">Series D+</option>
                  <option value="Venture Capital">Venture Capital</option>
                </select>
              </div>

              {/* Business Activity */}
              <div>
                <label htmlFor="businessActivity" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Activity*
                </label>
                <input
                  type="text"
                  id="businessActivity"
                  name="businessActivity"
                  value={formData.businessActivity || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Software Development, E-commerce, Consulting"
                  className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Operating Hours */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Operating Hours*</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Opening Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => {
                        setOpeningTime(e.target.value);
                        const hours = `${e.target.value} - ${closingTime}`;
                        const days = selectedDays.join(", ");
                        setFormData(prev => ({ ...prev, operatingHours: `${days}: ${hours}` }));
                      }}
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Closing Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => {
                        setClosingTime(e.target.value);
                        const hours = `${openingTime} - ${e.target.value}`;
                        const days = selectedDays.join(", ");
                        setFormData(prev => ({ ...prev, operatingHours: `${days}: ${hours}` }));
                      }}
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Operating Days */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = selectedDays.includes(day)
                            ? selectedDays.filter(d => d !== day)
                            : [...selectedDays, day];
                          setSelectedDays(newDays);
                          const hours = `${openingTime} - ${closingTime}`;
                          const daysStr = newDays.join(", ");
                          setFormData(prev => ({ ...prev, operatingHours: `${daysStr}: ${hours}` }));
                        }}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          selectedDays.includes(day)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 border-2 border-gray-300"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <p className="text-sm text-gray-900 font-mono mt-1">
                    {formData.operatingHours || "Please select opening time, closing time, and operating days"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "government":
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Government Registration</h2>
            <div className="space-y-6">
              {/* Is Government Registered */}
              <div>
                <label htmlFor="isGovernmentRegistered" className="block text-sm font-medium text-gray-700 mb-1">
                  Is your startup registered with a government agency?*
                </label>
                <select
                  id="isGovernmentRegistered"
                  name="isGovernmentRegistered"
                  value={formData.isGovernmentRegistered}
                  onChange={(e) => {
                    const value = e.target.value === "true" ? true : e.target.value === "false" ? false : "";
                    setFormData(prev => ({
                      ...prev,
                      isGovernmentRegistered: value,
                      registrationAgency: "",
                      otherRegistrationAgency: "",
                      registrationNumber: "",
                      registrationDate: null,
                      businessLicenseNumber: "",
                      tin: "",
                    }));
                  }}
                  className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select an option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Registration Agency */}
              {formData.isGovernmentRegistered && (
                <>
                  <div>
                    <label htmlFor="registrationAgency" className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Agency*
                    </label>
                    <select
                      id="registrationAgency"
                      name="registrationAgency"
                      value={formData.registrationAgency || ""}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          registrationAgency: e.target.value,
                          otherRegistrationAgency: "",
                        }))
                      }
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select agency</option>
                      <option value="DICT">DICT (Department of Information and Communications Technology)</option>
                      <option value="DOST">DOST (Department of Science and Technology)</option>
                      <option value="DTI">DTI (Department of Trade and Industry)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Other Registration Agency */}
                  {formData.registrationAgency === "other" && (
                    <div>
                      <label htmlFor="otherRegistrationAgency" className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify the agency*
                      </label>
                      <input
                        type="text"
                        id="otherRegistrationAgency"
                        name="otherRegistrationAgency"
                        value={formData.otherRegistrationAgency || ""}
                        onChange={handleInputChange}
                        placeholder="Enter agency name"
                        className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Registration Number */}
                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number*
                    </label>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter registration/certificate number"
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Registration Date */}
                  <div>
                    <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date*
                    </label>
                    <DatePicker
                      selected={formData.registrationDate ? new Date(formData.registrationDate) : null}
                      onChange={(date) =>
                        setFormData(prev => ({
                          ...prev,
                          registrationDate: date ? date.toISOString().split("T")[0] : null,
                        }))
                      }
                      placeholderText="Select registration date"
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxDate={new Date()}
                    />
                  </div>

                  {/* Business License Number */}
                  <div>
                    <label htmlFor="businessLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Business License Number*
                    </label>
                    <input
                      type="text"
                      id="businessLicenseNumber"
                      name="businessLicenseNumber"
                      value={formData.businessLicenseNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter business license number"
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* TIN */}
                  <div>
                    <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-1">
                      TIN*
                    </label>
                    <input
                      type="text"
                      id="tin"
                      name="tin"
                      value={formData.tin || ""}
                      onChange={handleInputChange}
                      placeholder="Enter TIN"
                      className="text-gray-800 w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Registration Certificate Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Registration Certificate</span>
                    </label>
                    <input
                      ref={certificateInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          const file = e.target.files[0];
                          setUploadedCertificate(file);
                          const tempUrl = URL.createObjectURL(file);
                          setCertificatePreviewUrl(tempUrl);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                      {certificateLoading ? (
                        <div className="p-8">
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative w-20 h-20 mb-4">
                              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                            <h4 className="text-base font-semibold text-gray-700 mb-2">Loading certificate...</h4>
                            <p className="text-sm text-gray-500">Please wait while we fetch your registration certificate</p>
                          </div>
                        </div>
                      ) : certificateUploading ? (
                        <div className="p-8">
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative w-20 h-20 mb-4">
                              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                            <h4 className="text-base font-semibold text-gray-700 mb-2">Uploading certificate...</h4>
                            <p className="text-sm text-gray-500 text-center">Please wait while we process your registration certificate</p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
                              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              <span className="font-medium">Processing</span>
                            </div>
                          </div>
                        </div>
                      ) : (certificateUrl || certificatePreviewUrl) ? (
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Certificate Preview */}
                            <div className="relative">
                              <div className="w-24 h-24 flex items-center justify-center bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              {uploadedCertificate && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* Certificate Actions */}
                            <div className="flex-1 space-y-2">
                              <p className="text-sm text-gray-600 font-medium">
                                {uploadedCertificate 
                                  ? uploadedCertificate.name
                                  : 'Current registration certificate'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {uploadedCertificate 
                                  ? `${(uploadedCertificate.size / 1024).toFixed(2)} KB - Ready to upload` 
                                  : 'Click "Change Certificate" to update'}
                              </p>

                              {uploadedCertificate ? (
                                <div className="flex gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await handleCertificateUpload(uploadedCertificate);
                                    }}
                                    disabled={certificateUploading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {certificateUploading ? (
                                      <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Upload Certificate
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (certificatePreviewUrl) {
                                        URL.revokeObjectURL(certificatePreviewUrl);
                                        setCertificatePreviewUrl(null);
                                      }
                                      setUploadedCertificate(null);
                                      if (certificateInputRef.current) {
                                        certificateInputRef.current.value = "";
                                      }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 pt-2">
                                  {certificateUrl && (
                                    <a
                                      href={certificateUrl}
                                      download="registration-certificate"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-all duration-200"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => certificateInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Change Certificate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(
                                          `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/registration-certificate`,
                                          {
                                            method: "DELETE",
                                            credentials: "include",
                                          }
                                        );
                                        
                                        if (response.ok) {
                                          if (certificateUrl) {
                                            URL.revokeObjectURL(certificateUrl);
                                          }
                                          setCertificateUrl(null);
                                          setSuccess("Certificate removed successfully!");
                                        } else {
                                          throw new Error("Failed to remove certificate");
                                        }
                                      } catch (error) {
                                        console.error("Error removing certificate:", error);
                                        setError("Failed to remove certificate. Please try again.");
                                      }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8">
                          <div className="text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h4 className="text-base font-semibold text-gray-700 mb-2">No certificate uploaded</h4>
                            <p className="text-sm text-gray-500 mb-6">
                              Upload your government registration certificate
                            </p>
                            <button
                              type="button"
                              onClick={() => certificateInputRef.current?.click()}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-medium"
                            >
                              <Upload size={20} />
                              Upload Certificate
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                              PDF, PNG, JPG or JPEG (max. 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Upload className="mr-2 text-blue-600" size={28} /> Upload Startup Data
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Upload your startup data in <span className="font-semibold text-blue-600">CSV</span> or <span className="font-semibold text-blue-600">XLSX</span> format.<br />
                Max file size: <span className="font-semibold">10MB</span>.
              </p>
              <div
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors duration-200 ${csvFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {!csvFile ? (
                  <>
                    <Upload size={40} className="text-blue-400 mb-2" />
                    <span className="text-gray-700 font-medium">Drag & drop or click to select a file</span>
                    <span className="text-xs text-gray-500 mt-1">Supported formats: .csv, .xlsx</span>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Upload size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">{csvFile.name}</span>
                        <span className="block text-xs text-gray-500">{csvFile.type || 'Unknown type'} • {(csvFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={e => { e.stopPropagation(); setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        title="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCsvUpload}
                disabled={uploading || !csvFile}
                className={`mt-6 w-full py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow ${uploading || !csvFile ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Uploading...</span>
                ) : (
                  <span className="flex items-center justify-center"><Upload size={18} className="mr-2" />Upload File</span>
                )}
              </button>
              {uploadStatus && (
                <div className={`mt-6 w-full p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${uploadStatus.success ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
                  {uploadStatus.success ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
                  <span>{uploadStatus.message}</span>
                </div>
              )}
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
                  { id: "additional", label: "Additional Information", icon: <Briefcase size={18} /> },
                  { id: "government", label: "Government Registration", icon: <CheckCircle2 size={18} /> },
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
                  <span>Step {["basic", "contact", "location", "additional", "government", "upload"].indexOf(activeSection) + 1} of 6</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(["basic", "contact", "location", "additional", "government", "upload"].indexOf(activeSection) + 1) * 16.67}%` }}
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

      {/* Remove Logo Confirmation Modal */}
      {showRemoveLogoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Remove Company Logo?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to remove the current company logo? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRemoveLogoModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Call API to delete logo if needed
                      const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/photo`,
                        {
                          method: "DELETE",
                          credentials: "include",
                        }
                      );
                      
                      if (response.ok) {
                        // Clean up URLs
                        if (logoUrl) {
                          URL.revokeObjectURL(logoUrl);
                        }
                        if (logoPreviewUrl) {
                          URL.revokeObjectURL(logoPreviewUrl);
                        }
                        setLogoUrl(null);
                        setLogoPreviewUrl(null);
                        setUploadedLogo(null);
                        setSuccess("Logo removed successfully!");
                      } else {
                        throw new Error("Failed to remove logo");
                      }
                    } catch (error) {
                      console.error("Error removing logo:", error);
                      setError("Failed to remove logo. Please try again.");
                    } finally {
                      setShowRemoveLogoModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-sm"
                >
                  Remove Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}