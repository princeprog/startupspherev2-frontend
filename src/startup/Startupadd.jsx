import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verification from "../modals/Verification";
import { useNavigate, useLocation } from "react-router-dom";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

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

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">How We Protect Your Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Encryption</h4>
                    <p className="text-sm text-gray-600">All data is encrypted both in transit and at rest</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Access Control</h4>
                    <p className="text-sm text-gray-600">Strict access controls and authentication</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Regular Audits</h4>
                    <p className="text-sm text-gray-600">Continuous security monitoring and updates</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Data Retention</h4>
                    <p className="text-sm text-gray-600">Clear data retention and deletion policies</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your Rights</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access and download your data at any time</li>
                <li>Request data deletion or modification</li>
                <li>Opt-out of data sharing with third parties</li>
                <li>Receive notifications about data breaches</li>
              </ul>
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

export default function Startupadd() {
  const [selectedTab, setSelectedTab] = useState("Company Information");
  const [startupId, setStartupId] = useState(null);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    foundedDate: null,
    typeOfCompany: "",
    numberOfEmployees: "",
    industry: "",
    phoneNumber: "",
    contactEmail: "",
    website: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedIn: "",
    locationLat: null,
    locationLng: null,
    locationName: "",
    fundingStage: "",
    operatingHours: "Monday, Tuesday, Wednesday, Thursday, Friday: 09:00 - 17:00",
    businessActivity: "",
    isGovernmentRegistered: "",
    registrationAgency: "",
    registrationNumber: "",
    registrationDate: null,
    otherRegistrationAgency: "",
    businessLicenseNumber: "",
    tin: "",
    registrationCertificate: null,
    isDraft: false,
  });

  const [verificationModal, setVerificationModal] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [draftLogoUrl, setDraftLogoUrl] = useState(null);
  const [showLogoPreview, setShowLogoPreview] = useState(false);
  const [draftCertificateUrl, setDraftCertificateUrl] = useState(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const tabs = [
    "Company Information",
    "Contact Information",
    "Address Information",
    "Social Media Links",
    "Additional Information",
    "Location Info",
    "Upload Data",
  ];

  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [draftId, setDraftId] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSubmittingStartup, setIsSubmittingStartup] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [completedTabs, setCompletedTabs] = useState([]);
  const [furthestTabReached, setFurthestTabReached] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  // Operating hours state
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

  const resetForm = () => {
    setFormData({
      companyName: "",
      companyDescription: "",
      foundedDate: null,
      typeOfCompany: "",
      numberOfEmployees: "",
      industry: "",
      phoneNumber: "",
      contactEmail: "",
      website: "",
      streetAddress: "",
      city: "",
      province: "",
      postalCode: "",
      facebook: "",
      twitter: "",
      instagram: "",
      linkedIn: "",
      locationLat: null,
      locationLng: null,
      locationName: "",
      fundingStage: "",
      operatingHours: "",
      businessActivity: "",
      isDraft: false,
    });
    setStartupId(null);
    setDraftId(null);
    setUploadedFile(null);
    setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(
          "Invalid file type. Please upload an image file (e.g., JPEG, PNG)."
        );
        return;
      }
      setUploadedImage(file);
      setDraftLogoUrl(null); // Clear the draft logo when new image is selected
      setShowLogoPreview(true);
      toast.success("Image selected successfully!");
    } else {
      toast.error("No image selected.");
    }
  };

  const handleRemoveLogo = () => {
    setUploadedImage(null);
    setDraftLogoUrl(null);
    setShowLogoPreview(false);
  };

  const handleRemoveCertificate = () => {
    setFormData(prev => ({
      ...prev,
      registrationCertificate: null
    }));
    setDraftCertificateUrl(null);
    setShowCertificatePreview(false);
  };

  const fetchDraftLogo = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/photo`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setDraftLogoUrl(imageUrl);
        setShowLogoPreview(true);
      } else {
        console.log("No logo found for this draft");
        setShowLogoPreview(false);
      }
    } catch (error) {
      console.error("Error fetching draft logo:", error);
      setShowLogoPreview(false);
    }
  };

  const fetchDraftCertificate = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/registration-certificate`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);
        setDraftCertificateUrl(fileUrl);
        setShowCertificatePreview(true);
      } else {
        console.log("No certificate found for this draft");
        setShowCertificatePreview(false);
      }
    } catch (error) {
      console.error("Error fetching draft certificate:", error);
      setShowCertificatePreview(false);
    }
  };

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
      toast.error("Please complete the startup form and submit it first.");
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
        `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/upload-csv`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus("Finalizing startup data...");

      if (response.ok) {
        toast.success("Startup added successfully and is waiting for review!");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate email in real-time
    if (name === "contactEmail") {
      validateEmail(value);
    }
  };
  
  const validateEmail = (email) => {
    if (!email) {
      setEmailError("");
      return false;
    }
    
    // Email regex pattern
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    // Additional checks
    if (email.includes("..") || email.startsWith(".") || email.endsWith(".")) {
      setEmailError("Invalid email format");
      return false;
    }
    
    if (email.split("@").length !== 2) {
      setEmailError("Email must contain exactly one @ symbol");
      return false;
    }
    
    const [localPart, domain] = email.split("@");
    if (localPart.length === 0 || domain.length < 3) {
      setEmailError("Invalid email format");
      return false;
    }
    
    if (!domain.includes(".")) {
      setEmailError("Email domain must contain a period");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      foundedDate: date ? date.toISOString().split("T")[0] : null,
    }));
  };

  const handleMapClick = (lat, lng, locationName) => {
    setFormData((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
      locationName: locationName,
    }));
  };

  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.resize();
      return mapInstanceRef.current;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [123.9022, 10.2926],
      zoom: 12,
    });

    mapInstanceRef.current = map;

    // Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for places...",
    });

    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = "";
      geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
    }

    geocoder.on("result", (event) => {
      const { center, place_name } = event.result;
      map.flyTo({ center, zoom: 14 });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat(center)
        .addTo(map);
      handleMapClick(center[1], center[0], place_name);
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .addTo(map);

      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      )
        .then((res) => res.json())
        .then((data) => {
          const locationName = data.features[0]?.place_name || "Unknown Location";
          handleMapClick(lat, lng, locationName);
        });
    });

    // Important: Resize after load to prevent blank map
    map.on("load", () => {
      map.resize();
    });

    return map;
  };

const fetchDraftData = async (id) => {
  if (!id || id === "undefined" || id === "null") {
    toast.error("Invalid draft ID");
    navigate("/startup-dashboard");
    return;
  }

  setIsLoadingDraft(true);

  try {
    const apiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_REACT_APP_API_URL;
    const response = await fetch(`${apiUrl}/startups/draft/${id}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch draft");
    }

    const data = await response.json();

    // === Restore all form fields first ===
    setFormData((prev) => ({
      ...prev,
      companyName: data.companyName || "",
      companyDescription: data.companyDescription || "",
      foundedDate: data.foundedDate ? new Date(data.foundedDate) : null,
      typeOfCompany: data.typeOfCompany || "",
      numberOfEmployees: data.numberOfEmployees || "",
      industry: data.industry || "",
      phoneNumber: data.phoneNumber || "",
      contactEmail: data.contactEmail || "",
      website: data.website || "",
      streetAddress: data.streetAddress || "",
      region: data.region || "",
      province: data.province || "",
      city: data.city || "",
      barangay: data.barangay || "",
      postalCode: data.postalCode || "",
      facebook: data.facebook || "",
      twitter: data.twitter || "",
      instagram: data.instagram || "",
      linkedIn: data.linkedIn || "",
      locationLat: data.locationLat || null,
      locationLng: data.locationLng || null,
      locationName: data.locationName || "",
      fundingStage: data.fundingStage || "",
      operatingHours: data.operatingHours || "",
      businessActivity: data.businessActivity || "",
      isGovernmentRegistered: data.isGovernmentRegistered || "",
      registrationAgency: data.registrationAgency || "",
      registrationNumber: data.registrationNumber || "",
      registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
      otherRegistrationAgency: data.otherRegistrationAgency || "",
      businessLicenseNumber: data.businessLicenseNumber || "",
      tin: data.tin || "",
      registrationCertificate: null,
      isDraft: true,
    }));

    setDraftId(data.id || data._id || id);
    setStartupId(data.id || data._id || id);
    
    // Fetch draft logo if exists
    await fetchDraftLogo(data.id || data._id || id);
    
    // Fetch draft certificate if exists
    await fetchDraftCertificate(data.id || data._id || id);
    
    toast.success("Draft loaded successfully!");

    // === NEW: Smart address restoration that waits for regions to load ===
    const restoreAddress = async () => {
      if (!data.region) return;

      // 1. Fetch regions if not already loaded
      let currentRegions = regions;
      if (currentRegions.length === 0) {
        const res = await fetch("https://psgc.gitlab.io/api/regions/");
        currentRegions = await res.json();
        setRegions(currentRegions);
      }

      const regionObj = currentRegions.find(r => r.name === data.region);
      if (!regionObj) return;

      setSelectedRegion(regionObj);

      // 2. Fetch provinces
      const provRes = await fetch(`https://psgc.gitlab.io/api/regions/${regionObj.code}/provinces/`);
      const provincesList = await provRes.json();
      setProvinces(provincesList);

      if (data.province) {
        const provinceObj = provincesList.find(p => p.name === data.province);
        if (provinceObj) {
          setSelectedProvince(provinceObj);

          // 3. Fetch cities
          const cityRes = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceObj.code}/cities-municipalities/`);
          const citiesList = await cityRes.json();
          setCities(citiesList);

          if (data.city) {
            const cityObj = citiesList.find(c => c.name === data.city);
            if (cityObj) {
              setSelectedCity(cityObj);

              // 4. Fetch barangays
              const brgyRes = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityObj.code}/barangays/`);
              const barangaysList = await brgyRes.json();
              setBarangays(barangaysList);

              if (data.barangay) {
                const barangayObj = barangaysList.find(b => b.name === data.barangay);
                if (barangayObj) setSelectedBarangay(barangayObj);
              }
            }
          }
        }
      }
    };

    // Run restoration (async, no race condition)
    restoreAddress();

  } catch (error) {
    console.error("Error loading draft:", error);
    toast.error(error.message || "Failed to load draft");
    navigate("/startup-dashboard");
  } finally {
    setIsLoadingDraft(false);
  }
};

  useEffect(() => {
    // Only run when the map is ready AND we have saved coordinates
    if (!mapInstanceRef.current || !formData.locationLat || !formData.locationLng) return;

    const map = mapInstanceRef.current;
    const lat = formData.locationLat;
    const lng = formData.locationLng;

    // Remove any existing marker
    if (markerRef.current) markerRef.current.remove();

    // Add new marker
    markerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat([lng, lat])
      .addTo(map);

    // Fly to the saved location (smooth animation)
    map.flyTo({ center: [lng, lat], zoom: 14 });
  }, [formData.locationLat, formData.locationLng, mapInstanceRef.current]);

  useEffect(() => {
    console.log("Cookies:", document.cookie);
    
    // Check for draftId in URL params - only load draft when explicitly continuing
    const urlParams = new URLSearchParams(window.location.search);
    const draftIdFromUrl = urlParams.get('draftId');
    
    if (draftIdFromUrl) {
      // Fetch draft data from backend when user clicks "Continue"
      fetchDraftData(draftIdFromUrl);
    }
    // Form starts fresh if no draftId in URL
  }, []);

  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((response) => response.json())
      .then((data) => setRegions(data))
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);
  
  // Animate percentage counting
  useEffect(() => {
    const targetPercentage = Math.round((completedTabs.length / tabs.length) * 100);
    
    if (displayPercentage === targetPercentage) return;
    
    const increment = displayPercentage < targetPercentage ? 1 : -1;
    const duration = 30; // milliseconds per increment
    
    const timer = setInterval(() => {
      setDisplayPercentage(prev => {
        const next = prev + increment;
        
        // Stop when we reach the target
        if ((increment > 0 && next >= targetPercentage) || 
            (increment < 0 && next <= targetPercentage)) {
          clearInterval(timer);
          return targetPercentage;
        }
        
        return next;
      });
    }, duration);
    
    return () => clearInterval(timer);
  }, [completedTabs.length, tabs.length]);

  useEffect(() => {
    let map = null;

    if (selectedTab === "Location Info") {
      // Small delay to ensure container is in DOM and visible
      const timer = setTimeout(() => {
        if (!mapContainerRef.current) return;

        // Always create fresh map when entering the tab
        map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [123.9022, 10.2926], // Cebu City coordinates
          zoom: 12,
        });

        mapInstanceRef.current = map;

        // Geocoder
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
          placeholder: "Search for places...",
        });

        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = "";
          geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
        }

        // Restore saved location + marker
        if (formData.locationLat && formData.locationLng) {
          const lng = formData.locationLng;
          const lat = formData.locationLat;

          map.on("load", () => {
            map.flyTo({ center: [lng, lat], zoom: 15 });

            if (markerRef.current) markerRef.current.remove();
            markerRef.current = new mapboxgl.Marker({ color: "red" })
              .setLngLat([lng, lat])
              .addTo(map);
          });
        }

        // Geocoder result
        geocoder.on("result", (e) => {
          const { center, place_name } = e.result;
          map.flyTo({ center, zoom: 15 });

          if (markerRef.current) markerRef.current.remove();
          markerRef.current = new mapboxgl.Marker({ color: "red" })
            .setLngLat(center)
            .addTo(map);

          handleMapClick(center[1], center[0], place_name);
        });

        // Click to place marker
        map.on("click", (e) => {
          const { lng, lat } = e.lngLat;

          if (markerRef.current) markerRef.current.remove();
          markerRef.current = new mapboxgl.Marker({ color: "red" })
            .setLngLat([lng, lat])
            .addTo(map);

          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
            .then(r => r.json())
            .then(data => {
              const name = data.features[0]?.place_name || "Unknown Location";
              handleMapClick(lat, lng, name);
            });
        });

        // Force resize after load
        map.on("load", () => map.resize());
      }, 100);

      return () => clearTimeout(timer);
    }

    // —————— CLEANUP: Destroy map when leaving tab ——————
    return () => {
      if (mapInstanceRef.current) {
        console.log("Destroying map instance");
        mapInstanceRef.current.remove();   // This is the key
        mapInstanceRef.current = null;
        markerRef.current?.remove();
        markerRef.current = null;
        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = "";
        }
      }
    };
  }, [selectedTab]);


  // Update validation for Company Information
  const validateCompanyInformation = () => {
    if (!formData.companyName) return toast.error("Company Name is required.");
    if (!formData.companyDescription)
      return toast.error("Company Description is required.");
    if (!formData.foundedDate) return toast.error("Founded Date is required.");
    if (!formData.numberOfEmployees)
      return toast.error("Number of Employees is required.");
    if (!formData.typeOfCompany)
      return toast.error("Type of Company is required.");
    if (!formData.industry) return toast.error("Industry is required.");
    // Registration validation
    if (formData.isGovernmentRegistered === "") {
      return toast.error("Please specify if your startup is registered with a government agency.");
    }
    if (formData.isGovernmentRegistered === "yes") {
      if (!formData.registrationAgency) {
        return toast.error("Please select the registration agency.");
      }
      if (
        formData.registrationAgency === "other" &&
        !formData.otherRegistrationAgency
      ) {
        return toast.error("Please specify the other registration agency.");
      }
      if (!formData.registrationNumber) {
        return toast.error("Registration number is required.");
      }
      if (!formData.registrationDate) {
        return toast.error("Registration date is required.");
      }
      if (!formData.businessLicenseNumber) {
        return toast.error("Business license number is required.");
      }
      if (!formData.tin) {
        return toast.error("TIN is required.");
      }
      if (!formData.registrationCertificate) {
        return toast.error("Registration certificate file is required.");
      }
    }
    return "";
  };

  const validateContactInformation = () => {
    if (!formData.phoneNumber) return toast.error("Phone Number is required.");
    const digits = formData.phoneNumber.replace("+63 ", "").replace(/\D/g, "");
        if (digits.length !== 10) {
            return toast.error("Phone number must contain exactly 10 digits (excluding +63 prefix).");
         }
    if (!formData.contactEmail)
      return toast.error("Contact Email is required.");
    if (!validateEmail(formData.contactEmail))
      return toast.error("Please enter a valid email address");
    if (!formData.website) return toast.error("Website is required.");
    return "";
  };  const validateAddressInformation = () => {
    if (!formData.streetAddress)
      return toast.error("Street Address is required.");
    if (!formData.city) return toast.error("City is required.");
    if (!formData.province) return toast.error("Province is required.");
    if (!formData.postalCode) return toast.error("Postal Code is required.");
    if (formData.postalCode.length !== 4) {
      return toast.error("Postal Code Must be 4 digits");
    }

    return "";
  };

  const validateSocialMediaLinks = () => {
    if (!formData.facebook) return toast.error("Facebook URL is required.");
    if (!formData.linkedIn) return toast.error("LinkedIn URL is required.");
    return "";
  };

  const validateAdditionalInformation = () => {
    if (!formData.fundingStage)
      return toast.error("Funding Stage is required.");
    if (!formData.operatingHours)
      return toast.error("Operating Hours is required.");
    if (!formData.businessActivity)
      return toast.error("Business Activity is required.");
    return "";
  };

  const validateLocationInfo = () => {
    if (!formData.locationLat || !formData.locationLng)
      return toast.error("Please select a location on the map.");
    if (!formData.locationName)
      return toast.error("Location name is required.");
    return "";
  };

  const handleNext = () => {
    let errorMessage = "";
    if (selectedTab === "Company Information") {
      errorMessage = validateCompanyInformation();
    } else if (selectedTab === "Contact Information") {
      errorMessage = validateContactInformation();
    } else if (selectedTab === "Address Information") {
      errorMessage = validateAddressInformation();
    } else if (selectedTab === "Social Media Links") {
      errorMessage = validateSocialMediaLinks();
    } else if (selectedTab === "Additional Information") {
      errorMessage = validateAdditionalInformation();
    }
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    setError("");
    
    // Mark current tab as completed
    if (!completedTabs.includes(selectedTab)) {
      setCompletedTabs([...completedTabs, selectedTab]);
    }
    
    const currentIndex = tabs.indexOf(selectedTab);
    if (currentIndex < tabs.length - 1) {
      const nextIndex = currentIndex + 1;
      setSelectedTab(tabs[nextIndex]);
      // Update furthest tab reached
      if (nextIndex > furthestTabReached) {
        setFurthestTabReached(nextIndex);
      }
    }
  };

  const handleBack = () => {
    setError("");
    const currentIndex = tabs.indexOf(selectedTab);
    if (currentIndex > 0) {
      setSelectedTab(tabs[currentIndex - 1]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to upload draft logo
  const uploadDraftLogo = async (draftId) => {
    try {
      console.log("Uploading draft logo for ID:", draftId);
      const imageFormData = new FormData();
      imageFormData.append("photo", uploadedImage);
      
      const imageResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${draftId}/upload-photo`,
        {
          method: "PUT",
          body: imageFormData,
          credentials: "include",
        }
      );

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Failed to upload logo:", errorText);
        toast.error("Failed to upload logo image");
        return false;
      }
      
      console.log("Logo uploaded successfully");
      return true;
    } catch (error) {
      console.error("Error uploading draft logo:", error);
      toast.error("Error uploading logo: " + error.message);
      return false;
    }
  };

  // Helper function to upload draft registration certificate
  const uploadDraftCertificate = async (draftId) => {
    try {
      console.log("Uploading draft registration certificate for ID:", draftId);
      const certFormData = new FormData();
      certFormData.append("registrationCertificate", formData.registrationCertificate);
      
      const certResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${draftId}/upload-registration-certificate`,
        {
          method: "PUT",
          body: certFormData,
          credentials: "include",
        }
      );

      if (!certResponse.ok) {
        const errorText = await certResponse.text();
        console.error("Failed to upload certificate:", errorText);
        toast.error("Failed to upload registration certificate");
        return false;
      }
      
      console.log("Certificate uploaded successfully");
      return true;
    } catch (error) {
      console.error("Error uploading draft certificate:", error);
      toast.error("Error uploading certificate: " + error.message);
      return false;
    }
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Prepare JSON payload
      const draftData = {
        companyName: formData.companyName,
        companyDescription: formData.companyDescription,
        foundedDate: formData.foundedDate,
        typeOfCompany: formData.typeOfCompany,
        numberOfEmployees: formData.numberOfEmployees,
        phoneNumber: formData.phoneNumber,
        contactEmail: formData.contactEmail,
        streetAddress: formData.streetAddress,
        city: formData.city,
        province: formData.province,
        region: formData.region,
        barangay: formData.barangay,
        postalCode: formData.postalCode,
        industry: formData.industry,
        website: formData.website,
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedIn: formData.linkedIn,
        locationLat: formData.locationLat,
        locationLng: formData.locationLng,
        locationName: formData.locationName,
        fundingStage: formData.fundingStage,
        businessActivity: formData.businessActivity,
        operatingHours: formData.operatingHours,
        isGovernmentRegistered: formData.isGovernmentRegistered,
        registrationAgency: formData.registrationAgency,
        registrationNumber: formData.registrationNumber,
        registrationDate: formData.registrationDate,
        otherRegistrationAgency: formData.otherRegistrationAgency,
        businessLicenseNumber: formData.businessLicenseNumber,
        tin: formData.tin,
        isDraft: true,
      };

      // Remove empty/null values
      Object.keys(draftData).forEach(key => {
        if (draftData[key] === null || draftData[key] === undefined || draftData[key] === "") {
          delete draftData[key];
        }
      });

      let response;

      if (draftId) {
        // Update existing draft
        response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/startups/draft/${draftId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(draftData),
            credentials: "include",
          }
        );
        
        if (!response.ok) {
          const text = await response.text();
          let errorMessage = "Failed to update draft";
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        // Use existing draftId if response doesn't include one
        const savedDraftId = data._id || data.id || draftId;
        
        console.log("Draft updated with ID:", savedDraftId);
        setDraftId(savedDraftId);
        setStartupId(savedDraftId);
        
        // Upload logo if present - only if we have a valid ID
        if (uploadedImage && savedDraftId) {
          console.log("Uploading logo for draft ID:", savedDraftId);
          await uploadDraftLogo(savedDraftId);
        }
        
        // Upload registration certificate if present - only if we have a valid ID
        if (formData.registrationCertificate && savedDraftId) {
          console.log("Uploading certificate for draft ID:", savedDraftId);
          await uploadDraftCertificate(savedDraftId);
        }
        
        toast.success("Draft updated successfully!");
        
        // Navigate to dashboard after successful save
        setTimeout(() => {
          navigate("/startup-dashboard");
        }, 1500);
      } else {
        // Create new draft
        response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/startups/draft`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(draftData),
            credentials: "include",
          }
        );
        
        if (!response.ok) {
          const text = await response.text();
          let errorMessage = "Failed to save draft";
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        // Extract draft ID from response - check multiple possible fields
        const savedDraftId = data._id || data.id || data.draftId;
        
        if (!savedDraftId) {
          console.error("No draft ID received from server. Response:", data);
          throw new Error("Failed to retrieve draft ID from server");
        }
        
        console.log("Draft saved with ID:", savedDraftId);
        setDraftId(savedDraftId);
        setStartupId(savedDraftId);
        
        // Upload logo if present - only if we have a valid ID
        if (uploadedImage && savedDraftId) {
          console.log("Uploading logo for draft ID:", savedDraftId);
          await uploadDraftLogo(savedDraftId);
        }
        
        // Upload registration certificate if present - only if we have a valid ID
        if (formData.registrationCertificate && savedDraftId) {
          console.log("Uploading certificate for draft ID:", savedDraftId);
          await uploadDraftCertificate(savedDraftId);
        }
        
        toast.success("Draft saved successfully!");
        
        // Navigate to dashboard after successful save
        setTimeout(() => {
          navigate("/startup-dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

const handleSubmit = async () => {
  setIsSubmitting(true);
  setIsSubmittingStartup(true);
  setSubmissionProgress(0);
  setSubmissionStatus("Validating startup information...");
  
  // Set isDraft to false for final submission
  setFormData(prev => ({ ...prev, isDraft: false }));
  
  let errorMessage = validateCompanyInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }
  errorMessage = validateContactInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }
  errorMessage = validateAddressInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }
  errorMessage = validateSocialMediaLinks();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }
  errorMessage = validateAdditionalInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }
  errorMessage = validateLocationInfo();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    setIsSubmittingStartup(false);
    return;
  }

  setSubmissionProgress(15);
  setSubmissionStatus("Validation complete. Preparing submission...");

  try {
    let response;
    let startupId;
    
    // If updating an existing draft, use submit endpoint
    if (draftId) {
      setSubmissionProgress(25);
      setSubmissionStatus("Submitting your startup from draft...");
      
      response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/draft/${draftId}/submit`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit draft");
      }
      
      const data = await response.json();
      console.log("Draft submitted successfully: ", data);
      startupId = data.id || data._id;
      setStartupId(startupId);
      
      // Mark Location Info as completed after successful submission
      if (!completedTabs.includes("Location Info")) {
        setCompletedTabs(prev => [...prev, "Location Info"]);
      }
      
      // Update furthest tab reached to include Upload Data (next tab after Location Info)
      const locationIndex = tabs.indexOf("Location Info");
      if (locationIndex + 1 > furthestTabReached) {
        setFurthestTabReached(locationIndex + 1);
      }
      
      setSubmissionProgress(40);
      setSubmissionStatus("Startup submitted successfully!");
      
      // Clear draft state
      setDraftId(null);
    } else {
      // Create new startup submission
      setSubmissionProgress(25);
      setSubmissionStatus("Creating your startup profile...");
      
      const { registrationCertificate, ...startupData } = formData;

      response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(startupData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit startup");
      }
      
      const data = await response.json();
      console.log("Startup added successfully: ", data);
      startupId = data.id || data._id;
      setStartupId(startupId);
      
      // Mark Location Info as completed after successful submission
      if (!completedTabs.includes("Location Info")) {
        setCompletedTabs(prev => [...prev, "Location Info"]);
      }
      
      // Update furthest tab reached to include Upload Data (next tab after Location Info)
      const locationIndex = tabs.indexOf("Location Info");
      if (locationIndex + 1 > furthestTabReached) {
        setFurthestTabReached(locationIndex + 1);
      }
      
      setSubmissionProgress(40);
      setSubmissionStatus("Startup profile created successfully!");
    }

    // Continue with file uploads using the startupId
    setUploadedFile(null);

    // Upload registration certificate if present
    if (formData.registrationCertificate) {
        setSubmissionProgress(50);
        setSubmissionStatus("Uploading registration certificate...");
        
        const certFormData = new FormData();
        certFormData.append("registrationCertificate", formData.registrationCertificate);
        try {
          const certResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/upload-registration-certificate`,
            {
              method: "PUT",
              body: certFormData,
              credentials: "include",
            }
          );
          if (!certResponse.ok) {
            const certError = await certResponse.json();
            toast.error(
              certError.message ||
                "Failed to upload registration certificate."
            );
          } else {
            setSubmissionProgress(60);
            setSubmissionStatus("Certificate uploaded successfully!");
          }
        } catch (err) {
          toast.error("Error uploading registration certificate.");
        }
      } else {
        setSubmissionProgress(60);
      }

      // Upload company logo if present
      if (uploadedImage) {
        setSubmissionProgress(65);
        setSubmissionStatus("Uploading company logo...");
        
        const imageFormData = new FormData();
        imageFormData.append("photo", uploadedImage);
        try {
          const imageResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/upload-photo`,
            {
              method: "PUT",
              body: imageFormData,
              credentials: "include",
            }
          );

          let imageErrorMessage = "Failed to upload image.";
          if (!imageResponse.ok) {
            try {
              const imageErrorData = await imageResponse.json();
              imageErrorMessage = imageErrorData.error || imageErrorMessage;
            } catch (jsonError) {
              const text = await imageResponse.text();
              imageErrorMessage =
                text || "Failed to upload image: Invalid server response.";
            }
            toast.error(imageErrorMessage);
          } else {
            setSubmissionProgress(75);
            setSubmissionStatus("Logo uploaded successfully!");
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast.error("An error occurred while uploading the image.");
        }
      } else {
        setSubmissionProgress(75);
      }

      // Send verification email
      setSubmissionProgress(85);
      setSubmissionStatus("Sending verification email...");
      
      const emailResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startupId,
            email: formData.contactEmail,
          }),
          credentials: "include",
        }
      );

      let emailResponseData;
      try {
        emailResponseData = await emailResponse.json();
      } catch (jsonError) {
        console.error("Failed to parse email response:", jsonError);
        toast.error(
          "Failed to send verification email: Invalid server response."
        );
        return;
      }

      if (emailResponse.ok) {
        setSubmissionProgress(95);
        setSubmissionStatus("Finalizing submission...");
        
        toast.success("Startup added successfully! Verification email sent.");

        try {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/draft`, {
            method: "DELETE",
            credentials: "include",
          });
          console.log("Draft cleared from backend.");
        } catch (err) {
          console.warn("Failed to clear draft:", err);
        }

        setSubmissionProgress(100);
        setSubmissionStatus("Submission complete!");
        
        // Delay closing the modal to show 100%
        setTimeout(() => {
          setVerificationModal(true);
          setIsSubmittingStartup(false);
        }, 500);
      } else {
        toast.error(
          `Failed to send verification email: ${
            emailResponseData.error || "Unknown error"
          }`
        );
      }

  } catch (error) {
    console.error("Error:", error);
    toast.error("An error occurred while adding the startup.");
    setIsSubmittingStartup(false);
  } finally {
    setIsSubmitting(false);
  }
};

  const downloadCsvTemplate = async () => {
    try {
      // Fetch the template from the public folder
      const response = await fetch('/startup_data_template.xlsx');
      
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "startup_data_template.xlsx";
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


  useEffect(() => {
    if (selectedRegion?.code) {
      fetch(
        `https://psgc.gitlab.io/api/regions/${selectedRegion.code}/provinces/`
      )
        .then((response) => response.json())
        .then((data) => setProvinces(data))
        .catch((error) => console.error("Error fetching provinces:", error));
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedProvince?.code) {
      fetch(
        `https://psgc.gitlab.io/api/provinces/${selectedProvince.code}/cities-municipalities/`
      )
        .then((response) => response.json())
        .then((data) => setCities(data))
        .catch((error) => console.error("Error fetching cities:", error));
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity?.code) {
      fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${selectedCity.code}/barangays/`
      )
        .then((response) => response.json())
        .then((data) => setBarangays(data))
        .catch((error) => console.error("Error fetching barangays:", error));
    } else {
      setBarangays([]);
    }
  }, [selectedCity]);

  const LoadingModal = () => {
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

  const DraftLoadingModal = () => {
    if (!isLoadingDraft) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-blue-50/90 to-indigo-50/90">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-blue-100">
          <div className="text-center">
            <div className="mb-6 relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Draft</h2>
            <p className="text-gray-600 mb-4">Retrieving your saved information...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SubmissionProgressModal = () => {
    if (!isSubmittingStartup) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-blue-50/95 to-indigo-100/95">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-blue-200">
          <div className="text-center">
            {/* Animated Icon */}
            <div className="mb-6 relative">
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title and Status */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Submitting Your Startup
            </h2>
            <p className="text-gray-600 mb-6 min-h-[24px]">
              {submissionStatus}
            </p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${submissionProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-blue-600">{submissionProgress}%</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              <div className={`flex flex-col items-center ${submissionProgress >= 15 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${submissionProgress >= 15 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Validate</span>
              </div>
              <div className={`flex flex-col items-center ${submissionProgress >= 40 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${submissionProgress >= 40 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Submit</span>
              </div>
              <div className={`flex flex-col items-center ${submissionProgress >= 60 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${submissionProgress >= 60 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Files</span>
              </div>
              <div className={`flex flex-col items-center ${submissionProgress >= 85 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${submissionProgress >= 85 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Email</span>
              </div>
              <div className={`flex flex-col items-center ${submissionProgress >= 100 ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${submissionProgress >= 100 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Done</span>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Please wait...</span> We're processing your startup information and uploading your files securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSkip = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStatus("Preparing to redirect...");

    // Simulate progress updates
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
    <>
      <style>
        {`
          /* Progress Bar Animations */
          @keyframes countUp {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes pulse-scale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(-10px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .percentage-animate {
            animation: countUp 0.5s ease-out, pulse-scale 0.3s ease-in-out;
          }
          
          .step-complete-animate {
            animation: slideIn 0.4s ease-out;
          }
          
          @keyframes progressGlow {
            0%, 100% {
              box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
            }
            50% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4);
            }
          }
          
          .progress-line-animate {
            animation: progressGlow 1.5s ease-in-out;
          }
          
          /* Modern DatePicker Styling */
          .react-datepicker-wrapper {
            width: 100%;
          }
          
          .react-datepicker {
            font-family: inherit;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .react-datepicker__header {
            background-color: #1D3557;
            border-bottom: none;
            border-radius: 10px 10px 0 0;
            padding: 16px 0;
          }
          
          .react-datepicker__current-month {
            color: white;
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 8px;
          }
          
          .react-datepicker__day-name {
            color: white;
            font-weight: 500;
            width: 2.5rem;
            line-height: 2.5rem;
          }
          
          .react-datepicker__day {
            width: 2.5rem;
            line-height: 2.5rem;
            margin: 0.2rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: #374151;
          }
          
          .react-datepicker__day:hover {
            background-color: #dbeafe;
            color: #1D3557;
          }
          
          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected {
            background-color: #1D3557;
            color: white;
            font-weight: 600;
          }
          
          .react-datepicker__day--today {
            background-color: #fef3c7;
            color: #92400e;
            font-weight: 600;
          }
          
          .react-datepicker__day--disabled {
            color: #d1d5db;
            cursor: not-allowed;
          }
          
          .react-datepicker__day--disabled:hover {
            background-color: transparent;
          }
          
          .react-datepicker__month-dropdown,
          .react-datepicker__year-dropdown {
            background-color: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px;
            max-height: 200px;
            overflow-y: auto;
          }
          
          .react-datepicker__month-option,
          .react-datepicker__year-option {
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .react-datepicker__month-option:hover,
          .react-datepicker__year-option:hover {
            background-color: #dbeafe;
            color: #1D3557;
          }
          
          .react-datepicker__month-option--selected_month,
          .react-datepicker__year-option--selected_year {
            background-color: #1D3557;
            color: white;
            font-weight: 600;
          }
          
          .react-datepicker__navigation {
            top: 16px;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            transition: background-color 0.2s ease;
          }
          
          .react-datepicker__navigation:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 2px 2px 0 0;
            height: 8px;
            width: 8px;
          }
          
          .react-datepicker__month-dropdown-container,
          .react-datepicker__year-dropdown-container {
            margin: 0 4px;
          }
          
          .react-datepicker__month-read-view,
          .react-datepicker__year-read-view {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 6px 12px;
            color: white;
            font-weight: 500;
            transition: background-color 0.2s ease;
          }
          
          .react-datepicker__month-read-view:hover,
          .react-datepicker__year-read-view:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }
          
          .react-datepicker__month-read-view--down-arrow,
          .react-datepicker__year-read-view--down-arrow {
            border-color: white;
            border-width: 2px 2px 0 0;
            height: 6px;
            width: 6px;
            margin-left: 8px;
          }
        `}
      </style>
      <div className="bg-gray-100 min-h-screen text-gray-800 relative">
      <div className="bg-white border-b border-gray-200 px-10 py-5">  
        <div className="flex items-center text-sm font-medium">
        {/*Back Arrow*/}
        <button
          onClick={() => navigate("/startup-dashboard")}
          className="mr-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

          {/* Breadcrumb Links */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-[#1D3557] transition-colors"
            >
              Home
            </button>
            <span className="text-gray-400">&gt;</span>
            <button
              onClick={() => navigate("/startup-dashboard")}
              className="text-gray-500 hover:text-[#1D3557] transition-colors"
              >
                Dashboard
            </button>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-500">Add Startup</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-[#1D3557] font-semibold">
              {selectedTab}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-md p-8 w-4/5 mx-auto mt-8">
        {/* Professional Steps Progress Bar */}
        <div className="mb-8">
          {/* Progress Percentage Header */}
          <div className="flex justify-between items-center mb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Form Progress</span>
              </div>
              <div className="h-5 w-px bg-gray-300"></div>
              <span 
                key={`steps-${completedTabs.length}`}
                className="text-xs text-gray-500 step-complete-animate"
              >
                {completedTabs.length} of {tabs.length} steps completed
              </span>
            </div>
            
            {/* Percentage Badge */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200 transition-all duration-300">
                  <svg className="w-4 h-4 text-blue-600 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span 
                    key={completedTabs.length}
                    className="text-lg font-bold text-blue-600 percentage-animate"
                  >
                    {displayPercentage}%
                  </span>
                </div>
                {completedTabs.length === tabs.length && (
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="relative px-4">
            {/* Background Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300"></div>
            
            {/* Active Progress Line */}
            <div 
              key={`progress-${completedTabs.length}`}
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-700 ease-in-out shadow-md progress-line-animate"
              style={{ width: `${(completedTabs.length / (tabs.length - 1)) * 100}%` }}
            >
              {/* Glowing effect at the end of progress line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-400 animate-pulse"></div>
            </div>
            
            {/* Steps */}
            <div className="flex justify-between items-start">
              {tabs.map((tab, index) => {
                const isActive = selectedTab === tab;
                const isCompleted = completedTabs.includes(tab);
                const stepNumber = index + 1;
                // Allow access to completed tabs, current tab, or any tab up to the furthest reached
                const isAccessible = isCompleted || isActive || index <= furthestTabReached;
                
                return (
                  <div 
                    key={tab}
                    className={`flex flex-col items-center relative ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'} group`}
                    style={{ width: `${100 / tabs.length}%` }}
                    onClick={() => {
                      if (isAccessible) {
                        setSelectedTab(tab);
                      }
                    }}
                  >
                    {/* Step Circle */}
                    <div className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 
                      transition-all duration-300 mb-2 z-10
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-300 scale-110' 
                        : isCompleted 
                        ? 'bg-blue-600 border-blue-600' 
                        : isAccessible
                        ? 'bg-white border-gray-300 group-hover:border-blue-400'
                        : 'bg-gray-100 border-gray-300 opacity-50'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`
                          font-semibold text-sm
                          ${isActive ? 'text-white' : isAccessible ? 'text-gray-500 group-hover:text-blue-600' : 'text-gray-400'}
                        `}>
                          {stepNumber}
                        </span>
                      )}
                      
                      {/* Active Step Ring */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
                      )}
                      
                      {/* Lock Icon for Inaccessible Steps */}
                      {!isAccessible && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="text-center">
                      <p className={`
                        text-xs font-medium transition-colors duration-200
                        ${isActive 
                          ? 'text-blue-600' 
                          : isCompleted 
                          ? 'text-gray-700' 
                          : isAccessible
                          ? 'text-gray-500 group-hover:text-blue-600'
                          : 'text-gray-400'
                        }
                      `}>
                        {tab}
                      </p>
                      {isActive && (
                        <div className="mt-1 px-2 py-0.5 bg-blue-100 rounded-full">
                          <span className="text-[10px] text-blue-600 font-semibold">Current</span>
                        </div>
                      )}
                      {!isAccessible && (
                        <div className="mt-1 px-2 py-0.5 bg-gray-100 rounded-full">
                          <span className="text-[10px] text-gray-500 font-semibold">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedTab === "Company Information" && (
          <form className="space-y-8">
            {/* Section Header */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Basic Company Details
              </h3>
              <p className="text-sm text-gray-600 mt-1">Tell us about your startup and help others discover what makes you unique</p>
            </div>

            {/* Company Name & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Name
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter your company name"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                  {formData.companyName && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Official registered name of your company
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Company Description
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <textarea
                    name="companyDescription"
                    placeholder="Brief description of what your company does..."
                    rows="3"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400 resize-none"
                    value={formData.companyDescription}
                    onChange={handleChange}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.companyDescription.length}/500
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Describe your products, services, or mission
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Founded Date
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <DatePicker
                  selected={
                    formData.foundedDate ? new Date(formData.foundedDate) : null
                  }
                  onChange={handleDateChange}
                  placeholderText="Select founded date"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  dateFormat="MMMM d, yyyy"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Select the month and year your company was founded
              </p>
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Number of Employees
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="numberOfEmployees"
                    placeholder="e.g., 10, 25, 100"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                  />
                  {formData.numberOfEmployees && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Current total number of employees
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Type of Company
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="typeOfCompany"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                    value={formData.typeOfCompany}
                    onChange={handleChange}
                  >
                <option value="">Select type of company</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Corporation">Corporation</option>
                <option value="Family Business">Family Business</option>
                <option value="Foundation">Foundation</option>
                <option value="Franchise">Franchise</option>
                <option value="General Partnership">General Partnership</option>
                <option value="Large Enterprise">Large Enterprise (200+ employees)</option>
                <option value="Limited Partnership">Limited Partnership</option>
                <option value="Medium Enterprise">Medium Enterprise (100-199 employees)</option>
                <option value="Microenterprise">Microenterprise (1-9 employees)</option>
                <option value="NGO (Non-Governmental Organization)">NGO (Non-Governmental Organization)</option>
                <option value="Non-Profit Organization">Non-Profit Organization</option>
                <option value="Non-Stock Corporation">Non-Stock Corporation</option>
                <option value="One Person Corporation (OPC)">One Person Corporation (OPC)</option>
                <option value="Partnership">Partnership</option>
                <option value="Small Enterprise">Small Enterprise (10-99 employees)</option>
                <option value="Social Enterprise">Social Enterprise</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Stock Corporation">Stock Corporation</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Legal structure of your business
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Industry
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="industry"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                <option value="">Select industry</option>
                
                {/* Agriculture & Food */}
                <optgroup label="🌾 Agriculture & Food">
                  <option value="Agriculture & Farming">Agriculture & Farming</option>
                  <option value="Aquaculture & Fisheries">Aquaculture & Fisheries</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Food Manufacturing">Food Manufacturing</option>
                  <option value="Restaurant & Catering">Restaurant & Catering</option>
                  <option value="Sari-Sari Store">Sari-Sari Store</option>
                </optgroup>

                {/* Technology & IT */}
                <optgroup label="💻 Technology & IT">
                  <option value="IT Solutions & Consulting">IT Solutions & Consulting</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Technology & IT Services">Technology & IT Services</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Web Development">Web Development</option>
                </optgroup>

                {/* Healthcare & Wellness */}
                <optgroup label="⚕️ Healthcare & Wellness">
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Dental Clinic">Dental Clinic</option>
                  <option value="Fitness & Gym">Fitness & Gym</option>
                  <option value="Healthcare & Medical Services">Healthcare & Medical Services</option>
                  <option value="Pharmacy & Drugstore">Pharmacy & Drugstore</option>
                  <option value="Salon & Barbershop">Salon & Barbershop</option>
                  <option value="Spa & Massage">Spa & Massage</option>
                </optgroup>

                {/* Business Services */}
                <optgroup label="💼 Business Services">
                  <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
                  <option value="BPO & Call Center">BPO & Call Center</option>
                  <option value="Consulting Services">Consulting Services</option>
                  <option value="Legal Services">Legal Services</option>
                </optgroup>

                {/* Creative & Marketing */}
                <optgroup label="🎨 Creative & Marketing">
                  <option value="Content Creation">Content Creation</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Photography & Videography">Photography & Videography</option>
                  <option value="Printing & Publishing">Printing & Publishing</option>
                  <option value="Social Media Management">Social Media Management</option>
                </optgroup>

                {/* Retail & E-commerce */}
                <optgroup label="🛒 Retail & E-commerce">
                  <option value="Retail & E-commerce">Retail & E-commerce</option>
                  <option value="Wholesale Trade">Wholesale Trade</option>
                </optgroup>

                {/* Education & Training */}
                <optgroup label="📚 Education & Training">
                  <option value="Education & Training">Education & Training</option>
                  <option value="Online Tutoring">Online Tutoring</option>
                  <option value="Skills Training Center">Skills Training Center</option>
                </optgroup>

                {/* Construction & Manufacturing */}
                <optgroup label="🏗️ Construction & Manufacturing">
                  <option value="Construction & Engineering">Construction & Engineering</option>
                  <option value="Garments & Textiles">Garments & Textiles</option>
                  <option value="Handicrafts & Crafts">Handicrafts & Crafts</option>
                  <option value="Manufacturing & Production">Manufacturing & Production</option>
                </optgroup>

                {/* Transportation & Logistics */}
                <optgroup label="🚚 Transportation & Logistics">
                  <option value="Courier Services">Courier Services</option>
                  <option value="Delivery Services">Delivery Services</option>
                  <option value="Freight & Cargo">Freight & Cargo</option>
                  <option value="Transportation & Logistics">Transportation & Logistics</option>
                </optgroup>

                {/* Hospitality & Tourism */}
                <optgroup label="🏨 Hospitality & Tourism">
                  <option value="Event Planning">Event Planning</option>
                  <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                  <option value="Hotel & Resort">Hotel & Resort</option>
                  <option value="Travel Agency">Travel Agency</option>
                </optgroup>

                {/* Real Estate & Property */}
                <optgroup label="🏠 Real Estate & Property">
                  <option value="Real Estate & Property">Real Estate & Property</option>
                </optgroup>

                {/* Energy & Utilities */}
                <optgroup label="⚡ Energy & Utilities">
                  <option value="Energy & Utilities">Energy & Utilities</option>
                  <option value="Renewable Energy">Renewable Energy</option>
                </optgroup>

                {/* Financial Services */}
                <optgroup label="💰 Financial Services">
                  <option value="Financial Services">Financial Services</option>
                  <option value="Insurance">Insurance</option>
                </optgroup>

                {/* Entertainment & Media */}
                <optgroup label="🎬 Entertainment & Media">
                  <option value="Entertainment & Media">Entertainment & Media</option>
                </optgroup>

                {/* Other Services */}
                <optgroup label="🔧 Other Services">
                  <option value="Automotive & Repair">Automotive & Repair</option>
                  <option value="Cleaning Services">Cleaning Services</option>
                  <option value="Home Services & Repair">Home Services & Repair</option>
                  <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
                  <option value="Pet Care Services">Pet Care Services</option>
                  <option value="Security Services">Security Services</option>
                  <option value="Other Services">Other Services</option>
                </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Primary business sector or category
                </p>
              </div>
            </div>

            {/* Government Registration Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Government Registration
                </h4>
                <p className="text-sm text-gray-600 mt-1">Provide your official registration details for verification purposes</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Is your startup registered with a government agency?
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="isGovernmentRegistered"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                    value={formData.isGovernmentRegistered}
                    onChange={e => {
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
                        registrationCertificate: null,
                      }));
                    }}
                  >
                    <option value="">Select an option</option>
                    <option value={true}>Yes, my startup is registered</option>
                    <option value={false}>No, not yet registered</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Agency (conditional) */}
            {formData.isGovernmentRegistered && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Registration Agency
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      name="registrationAgency"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                      value={formData.registrationAgency}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          registrationAgency: e.target.value,
                          otherRegistrationAgency: "",
                        }))
                      }
                    >
                      <option value="">Select agency</option>
                      <option value="DICT">DICT (Department of Information and Communications Technology)</option>
                      <option value="DOST">DOST (Department of Science and Technology)</option>
                      <option value="DTI">DTI (Department of Trade and Industry)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Other Registration Agency (conditional) */}
                {formData.registrationAgency === "other" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Please specify the agency
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="otherRegistrationAgency"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      placeholder="Enter agency name"
                      value={formData.otherRegistrationAgency}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Registration Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Registration Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Enter registration/certificate number"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Registration Date
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <DatePicker
                      selected={
                        formData.registrationDate
                          ? new Date(formData.registrationDate)
                          : null
                      }
                      onChange={date =>
                        setFormData(prev => ({
                          ...prev,
                          registrationDate: date ? date.toISOString().split("T")[0] : null,
                        }))
                      }
                      placeholderText="Select registration date"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                      maxDate={new Date()}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={50}
                      scrollableYearDropdown
                      dateFormat="MMMM d, yyyy"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Business License Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Business License Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessLicenseNumber"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Enter business license number"
                    value={formData.businessLicenseNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* TIN */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    TIN (Tax Identification Number)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tin"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="Enter TIN"
                    value={formData.tin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Registration Certificate Upload */}
            {formData.isGovernmentRegistered && (
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Registration Certificate <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Please upload your registration certificate in PDF format
                </p>
                
                {showCertificatePreview || formData.registrationCertificate ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                      {/* Certificate Preview */}
                      <div className="relative">
                        <div className="w-24 h-24 flex items-center justify-center bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
                          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Certificate Actions */}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-gray-600">
                          {formData.registrationCertificate 
                            ? formData.registrationCertificate.name 
                            : 'Current registration certificate'}
                        </p>
                        <div className="flex gap-2">
                          {draftCertificateUrl && !formData.registrationCertificate && (
                            <a
                              href={draftCertificateUrl}
                              download="registration-certificate"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </a>
                          )}
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Change Certificate
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFormData(prev => ({
                                    ...prev,
                                    registrationCertificate: file,
                                  }));
                                  setDraftCertificateUrl(null);
                                  toast.success("Certificate selected successfully!");
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveCertificate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> certificate
                      </p>
                      <p className="text-xs text-gray-500">PDF or Image (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData(prev => ({
                            ...prev,
                            registrationCertificate: file,
                          }));
                          setShowCertificatePreview(true);
                          toast.success("Certificate selected successfully!");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            <div className="col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Company Logo (Optional)
              </label>
              
              {showLogoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-4">
                    {/* Logo Preview */}
                    <div className="relative">
                      <img
                        src={uploadedImage ? URL.createObjectURL(uploadedImage) : draftLogoUrl}
                        alt="Company Logo"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Logo Actions */}
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-600">
                        {uploadedImage ? 'New logo selected' : 'Current company logo'}
                      </p>
                      <div className="flex gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Change Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, or JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="col-span-2 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                onClick={saveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save as Draft</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </form>
        )}
        {selectedTab === "Contact Information" && (
          <form className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                {/* Country Code Badge */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <div className="flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    <span className="text-xl">🇵🇭</span>
                    <span className="text-sm font-medium text-gray-700">+63</span>
                  </div>
                </div>
                
                {/* Phone Number Input */}
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="9XX XXX XXXX"
                  className="w-full border-2 border-gray-300 rounded-lg pl-28 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                  value={formData.phoneNumber.replace("+63 ", "").replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: `+63 ${value}`,
                      }));
                    }
                  }}
                  maxLength="12"
                />
                
                {/* Input Icon */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              
              {/* Helper Text with Validation */}
              <div className="mt-2 flex items-start gap-2">
                {formData.phoneNumber && formData.phoneNumber.replace("+63 ", "").replace(/\D/g, "").length === 10 ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Valid phone number</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-xs text-gray-500">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Enter 10 digits starting with 9 (e.g., 917 123 4567)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Contact Email <span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="example@domain.com"
                  className={`w-full border-2 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:outline-none transition-all duration-200 ${
                    emailError && formData.contactEmail
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : formData.contactEmail && !emailError
                      ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
                {formData.contactEmail && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {emailError ? (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              
              {/* Validation Messages */}
              <div className="mt-2 flex items-start gap-2">
                {emailError && formData.contactEmail ? (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{emailError}</span>
                  </div>
                ) : formData.contactEmail && !emailError ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Valid email address</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-xs text-blue-600">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Please ensure this email is active for verification purposes</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Website
                <span className="text-red-500"> *</span>
              </label>
              <input
                type="url"
                name="website"
                placeholder="Website link"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                onClick={handleBack}
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}
        {selectedTab === "Address Information" && (
          <form className="space-y-6">
            {/* Section Header */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Business Location
              </h3>
              <p className="text-sm text-gray-600 mt-1">Provide your complete business address details</p>
            </div>

            {/* Location Hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Region
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative group">
                  <select
                    name="region"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                    value={selectedRegion?.code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const selectedRegionObj = regions.find((r) => r.code === code) || null;
                      setSelectedRegion(selectedRegionObj);
                      setSelectedProvince(null);
                      setSelectedCity(null);
                      setSelectedBarangay(null);

                      setFormData((prev) => ({
                        ...prev,
                        region: selectedRegionObj?.name || "",
                        province: "",
                        city: "",
                        barangay: "",
                      }));
                    }}
                  >
                    <option value="">Select region...</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Province */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Province
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="province"
                    className={`w-full border-2 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      !selectedRegion 
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400' 
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}
                    value={selectedProvince?.code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const selectedProvinceObj = provinces.find((p) => p.code === code) || null;
                      setSelectedProvince(selectedProvinceObj);
                      setSelectedCity(null);
                      setSelectedBarangay(null);

                      setFormData((prev) => ({
                        ...prev,
                        province: selectedProvinceObj?.name || "",
                        city: "",
                        barangay: "",
                      }));
                    }}
                    disabled={!selectedRegion}
                  >
                    <option value="">{!selectedRegion ? 'Select region first' : 'Select province...'}</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  City/Municipality
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="city"
                    className={`w-full border-2 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      !selectedProvince 
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400' 
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}
                    value={selectedCity?.code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const selectedCityObj = cities.find((c) => c.code === code) || null;
                      setSelectedCity(selectedCityObj);
                      setSelectedBarangay(null);

                      setFormData((prev) => ({
                        ...prev,
                        city: selectedCityObj?.name || "",
                        barangay: "",
                      }));
                    }}
                    disabled={!selectedProvince}
                  >
                    <option value="">{!selectedProvince ? 'Select province first' : 'Select city/municipality...'}</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.code}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Barangay */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Barangay
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative group">
                  <select
                    name="barangay"
                    className={`w-full border-2 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
                      !selectedCity 
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400' 
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}
                    value={selectedBarangay?.code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const selectedBarangayObj = barangays.find((b) => b.code === code) || null;
                      setSelectedBarangay(selectedBarangayObj);

                      setFormData((prev) => ({
                        ...prev,
                        barangay: selectedBarangayObj?.name || "",
                      }));
                    }}
                    disabled={!selectedCity}
                  >
                    <option value="">{!selectedCity ? 'Select city first' : 'Select barangay...'}</option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Street Address and Postal Code */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-medium text-blue-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Street Address
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="e.g., 123 Main Street, Building 5"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                      value={formData.streetAddress}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Postal Code
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="XXXX"
                      maxLength="4"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                      value={formData.postalCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4) {
                          setFormData((prev) => ({
                            ...prev,
                            postalCode: value,
                          }));
                        }
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {formData.postalCode && formData.postalCode.length === 4 ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Must be a 4-digit number
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="col-span-2 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                onClick={handleBack}
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}
        {selectedTab === "Social Media Links" && (
          <form className="space-y-6">
            {/* Section Header */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Social Media Presence
              </h3>
              <p className="text-sm text-gray-600 mt-1">Connect your social media accounts to enhance your startup's visibility</p>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Why add social media links?</h4>
                  <p className="text-xs text-blue-700 mt-1">Social media links help stakeholders and investors find and connect with your startup across platforms, building trust and credibility.</p>
                </div>
              </div>
            </div>

            {/* Social Media Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facebook */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  Facebook
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="facebook"
                    placeholder="https://facebook.com/yourcompany"
                    className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.facebook}
                    onChange={handleChange}
                  />
                  {formData.facebook && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  LinkedIn
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="linkedIn"
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.linkedIn}
                    onChange={handleChange}
                  />
                  {formData.linkedIn && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Twitter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  Twitter / X
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="twitter"
                    placeholder="https://twitter.com/yourcompany"
                    className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.twitter}
                    onChange={handleChange}
                  />
                  {formData.twitter && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </div>
                  Instagram
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="instagram"
                    placeholder="https://instagram.com/yourcompany"
                    className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 group-hover:border-gray-400"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                  {formData.instagram && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Pro Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Use your official business pages, not personal profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Ensure your profile information is up-to-date and consistent across platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Copy and paste the full URL from your browser's address bar</span>
                </li>
              </ul>
            </div>
            <div className="col-span-2 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                onClick={handleBack}
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}
        {selectedTab === "Additional Information" && (
          <form className="space-y-6">
            {/* Section Header */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Business Operations
              </h3>
              <p className="text-sm text-gray-600 mt-1">Provide additional details about your business operations and funding</p>
            </div>

            {/* Funding Stage and Business Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funding Stage */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Funding Stage
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <select
                    name="fundingStage"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white group-hover:border-gray-400"
                    value={formData.fundingStage}
                    onChange={handleChange}
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Business Activity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Business Activity
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="businessActivity"
                    placeholder="e.g., Software Development, E-commerce, Consulting"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                    value={formData.businessActivity}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {formData.businessActivity ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Operating Hours
                  <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-600 mt-1">Set your business hours and operating days</p>
              </div>

              {/* Time Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Opening Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Opening Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => {
                        setOpeningTime(e.target.value);
                        const hours = `${e.target.value} - ${closingTime}`;
                        const days = selectedDays.join(", ");
                        setFormData(prev => ({ ...prev, operatingHours: `${days}: ${hours}` }));
                      }}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>

                {/* Closing Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Closing Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => {
                        setClosingTime(e.target.value);
                        const hours = `${openingTime} - ${e.target.value}`;
                        const days = selectedDays.join(", ");
                        setFormData(prev => ({ ...prev, operatingHours: `${days}: ${hours}` }));
                      }}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Days */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        selectedDays.includes(day)
                          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Click days to select/deselect operating days
                </p>
              </div>

              {/* Preview */}
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <p className="text-sm text-gray-900 font-mono mt-1">
                      {formData.operatingHours || "Please select opening time, closing time, and operating days"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-2 flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                onClick={handleBack}
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </form>
        )}
          {selectedTab === "Location Info" && (
            <div className="relative">
              {/* Geocoder search box – always visible when tab is active */}
              <div
                ref={geocoderContainerRef}
                className="absolute top-4 left-4 z-10 w-full max-w-md pointer-events-auto"
              />

              {/* MAP CONTAINER – this is the key change */}
              <div
                ref={mapContainerRef}
                className="w-full h-96 rounded-md border border-gray-300"
                style={{ minHeight: "384px" }} // optional: forces layout
              />

              {/* Selected location display */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium">
                  Selected Location: <span className="font-normal">{formData.locationName || "None"}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Latitude: {formData.locationLat?.toFixed(6) || "N/A"},
                  Longitude: {formData.locationLng?.toFixed(6) || "N/A"}
                </p>
              </div>

              {/* Back & Submit buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  onClick={handleBack}
                >
                  Back
                </button>
                <div className="flex gap-3">
                  {/* Only show Save as Draft button if startup hasn't been submitted */}
                  {!startupId && !completedTabs.includes("Location Info") && (
                    <button
                      type="button"
                      className="flex items-center gap-2 px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      onClick={saveDraft}
                      disabled={isSavingDraft}
                    >
                      {isSavingDraft ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          <span>Save as Draft</span>
                        </>
                      )}
                    </button>
                  )}
                  {/* Show Next button only if startup has been submitted (has startupId and Location Info is completed) */}
                  {startupId && completedTabs.includes("Location Info") ? (
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm"
                      onClick={handleNext}
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-[#1D3557] text-white px-6 py-2.5 rounded-lg hover:bg-[#16324f] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        {selectedTab === "Upload Data" && (
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

                  <div className="flex justify-between space-x-4">
                    <button
                      type="button"
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleFileSubmit}
                      disabled={!uploadedFile}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={handleSkip}
                    >
                      Skip
                    </button>
                  </div>
                </div>

                {/* Right Column - Instructions */}
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

                  {/* Terms and Conditions Notice */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h3 className="text-lg font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Terms & Conditions
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      By uploading startup data, you agree that the information provided is accurate and that you have the authority to share this data publicly on StartupSphere.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href="/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium inline-flex items-center"
                      >
                        Read Terms and Conditions
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <span className="text-amber-500 hidden sm:inline">|</span>
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium inline-flex items-center"
                      >
                        Privacy Policy
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
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
        )}
      </div>

      {verificationModal && (
        <Verification
          setVerificationModal={setVerificationModal}
          setSelectedTab={setSelectedTab}
          startupId={startupId}
          contactEmail={formData.contactEmail}
          resetForm={resetForm}
        />
      )}

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <LoadingModal />
      <DraftLoadingModal />
      <SubmissionProgressModal />
      <ToastContainer />
    </div>
    </>
  );
}
