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
    operatingHours: "",
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
      toast.success("Image selected successfully!");
    } else {
      toast.error("No image selected.");
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
     if (name === "numberOfEmployees") {
          if (/\D/.test(value)) {
            toast.error("Only Accepting Numeral inputs");
            return;
        }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      center: [120.9842, 14.5995],
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
    if (!id || id === 'undefined' || id === 'null') {
      console.error("Invalid draft ID:", id);
      toast.error("Invalid draft ID. Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/startup-dashboard");
      }, 2000);
      return;
    }

    setIsLoadingDraft(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_REACT_APP_API_URL;
      console.log("Fetching draft with ID:", id, "from:", `${apiUrl}/startups/draft/${id}`);
      
      const response = await fetch(
        `${apiUrl}/startups/draft/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Response is not JSON:", errorText);
        throw new Error("Server returned an invalid response. Please check if the API endpoint exists.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch draft data");
      }

      const data = await response.json();
      
      // Populate form with draft data
      setFormData({
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
        city: data.city || "",
        province: data.province || "",
        region: data.region || "",
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
      });

      setDraftId(data.id || id);
      setStartupId(data.id || id);
      
      toast.success("Draft loaded successfully! Continue where you left off.");
    } catch (error) {
      console.error("Error fetching draft:", error);
      toast.error(error.message || "Failed to load draft. Please try again.");
      
      // Redirect back to dashboard if draft fetch fails
      setTimeout(() => {
        navigate("/startup-dashboard");
      }, 2000);
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
          center: [120.9842, 14.5995],
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
    if (!formData.website) return toast.error("Website is required.");
    return "";
  };

  const validateAddressInformation = () => {
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
    const currentIndex = tabs.indexOf(selectedTab);
    if (currentIndex < tabs.length - 1) {
      setSelectedTab(tabs[currentIndex + 1]);
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
        toast.success("Draft updated successfully!");
        setDraftId(data._id || draftId);
        setStartupId(data._id || draftId);
        
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
        toast.success("Draft saved successfully!");
        setDraftId(data._id);
        setStartupId(data._id);
        
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
  
  // Set isDraft to false for final submission
  setFormData(prev => ({ ...prev, isDraft: false }));
  
  let errorMessage = validateCompanyInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }
  errorMessage = validateContactInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }
  errorMessage = validateAddressInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }
  errorMessage = validateSocialMediaLinks();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }
  errorMessage = validateAdditionalInformation();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }
  errorMessage = validateLocationInfo();
  if (errorMessage) {
    setError(errorMessage);
    setIsSubmitting(false);
    return;
  }

  try {
    let response;
    let startupId;
    
    // If updating an existing draft, use submit endpoint
    if (draftId) {
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
      
      // Clear draft state
      setDraftId(null);
    } else {
      // Create new startup submission
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
    }

    // Continue with file uploads using the startupId
    setUploadedFile(null);

    // Upload registration certificate if present
    if (formData.registrationCertificate) {
        const certFormData = new FormData();
        certFormData.append("file", formData.registrationCertificate);
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
            toast.success("Registration certificate uploaded successfully!");
          }
        } catch (err) {
          toast.error("Error uploading registration certificate.");
        }
      }

      // Upload company logo if present
      if (uploadedImage) {
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
            const imageSuccessData = await imageResponse.json();
            toast.success(
              imageSuccessData.message || "Image uploaded successfully!"
            );
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast.error("An error occurred while uploading the image.");
        }
      }

      // Send verification email
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

        setVerificationModal(true);
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
        <div className="flex border-b mb-8">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`w-1/5 text-center py-2 cursor-pointer text-sm font-medium transition-colors
                ${selectedTab === tab
                  ? "text-[#1D3557] border-b-2 border-[#1D3557]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {selectedTab === "Company Information" && (
          <form className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Company Name <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="companyName"
                placeholder="Company name"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Company Description <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="companyDescription"
                placeholder="Company description"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.companyDescription}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Founded Date <span className="text-red-500"> *</span>
              </label>
              <DatePicker
                selected={
                  formData.foundedDate ? new Date(formData.foundedDate) : null
                }
                onChange={handleDateChange}
                placeholderText="Select founded date"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                maxDate={new Date()} // Restrict selection to today or earlier
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Number of Employees <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="numberOfEmployees"
                placeholder="Number of employees"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.numberOfEmployees}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Type of Company <span className="text-red-500"> *</span>
              </label>
              <select
                name="typeOfCompany"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
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
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Industry
                    <span className="text-red-500"> *</span>
              </label>
              <select
                name="industry"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="">Select industry</option>
                <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
                <option value="Agriculture & Farming">Agriculture & Farming</option>
                <option value="Aquaculture & Fisheries">Aquaculture & Fisheries</option>
                <option value="Automotive & Repair">Automotive & Repair</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="BPO & Call Center">BPO & Call Center</option>
                <option value="Cleaning Services">Cleaning Services</option>
                <option value="Consulting Services">Consulting Services</option>
                <option value="Construction & Engineering">Construction & Engineering</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Courier Services">Courier Services</option>
                <option value="Delivery Services">Delivery Services</option>
                <option value="Dental Clinic">Dental Clinic</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Education & Training">Education & Training</option>
                <option value="Energy & Utilities">Energy & Utilities</option>
                <option value="Entertainment & Media">Entertainment & Media</option>
                <option value="Event Planning">Event Planning</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Fitness & Gym">Fitness & Gym</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Food Manufacturing">Food Manufacturing</option>
                <option value="Freight & Cargo">Freight & Cargo</option>
                <option value="Garments & Textiles">Garments & Textiles</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Handicrafts & Crafts">Handicrafts & Crafts</option>
                <option value="Healthcare & Medical Services">Healthcare & Medical Services</option>
                <option value="Home Services & Repair">Home Services & Repair</option>
                <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                <option value="Hotel & Resort">Hotel & Resort</option>
                <option value="Insurance">Insurance</option>
                <option value="IT Solutions & Consulting">IT Solutions & Consulting</option>
                <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
                <option value="Legal Services">Legal Services</option>
                <option value="Manufacturing & Production">Manufacturing & Production</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Online Tutoring">Online Tutoring</option>
                <option value="Other Services">Other Services</option>
                <option value="Pet Care Services">Pet Care Services</option>
                <option value="Pharmacy & Drugstore">Pharmacy & Drugstore</option>
                <option value="Photography & Videography">Photography & Videography</option>
                <option value="Printing & Publishing">Printing & Publishing</option>
                <option value="Real Estate & Property">Real Estate & Property</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Restaurant & Catering">Restaurant & Catering</option>
                <option value="Retail & E-commerce">Retail & E-commerce</option>
                <option value="Salon & Barbershop">Salon & Barbershop</option>
                <option value="Sari-Sari Store">Sari-Sari Store</option>
                <option value="Security Services">Security Services</option>
                <option value="Skills Training Center">Skills Training Center</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Software Development">Software Development</option>
                <option value="Spa & Massage">Spa & Massage</option>
                <option value="Technology & IT Services">Technology & IT Services</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Transportation & Logistics">Transportation & Logistics</option>
                <option value="Travel Agency">Travel Agency</option>
                <option value="Web Development">Web Development</option>
                <option value="Wholesale Trade">Wholesale Trade</option>
              </select>
            </div>

            {/* Government Registration Section */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Is your startup registered with a government agency? <span className="text-red-500">*</span>
              </label>
              <select
                name="isGovernmentRegistered"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
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
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>

            {/* Registration Agency (conditional) */}
            {formData.isGovernmentRegistered && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Registration Agency <span className="text-red-500">*</span>
                </label>
                <select
                  name="registrationAgency"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
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
              </div>
            )}

            {/* Other Registration Agency (conditional) */}
            {formData.isGovernmentRegistered &&
              formData.registrationAgency === "other" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Please specify the agency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherRegistrationAgency"
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    placeholder="Enter agency name"
                    value={formData.otherRegistrationAgency}
                    onChange={handleChange}
                  />
                </div>
              )}

            {/* Registration Number */}
            {formData.isGovernmentRegistered && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  placeholder="Enter registration/certificate number"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Registration Date */}
            {formData.isGovernmentRegistered && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Registration Date <span className="text-red-500">*</span>
                </label>
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
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  maxDate={new Date()}
                />
              </div>
            )}

            {/* Business License Number */}
            {formData.isGovernmentRegistered && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Business License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessLicenseNumber"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  placeholder="Enter business license number"
                  value={formData.businessLicenseNumber}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* TIN */}
            {formData.isGovernmentRegistered && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  TIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tin"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  placeholder="Enter TIN"
                  value={formData.tin}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Registration Certificate Upload */}
            {formData.isGovernmentRegistered && (
              <div className="col-span-2">
                <label className="block mb-1 text-sm font-medium">
                  Registration Certificate <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    setFormData(prev => ({
                      ...prev,
                      registrationCertificate: file || null,
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
                {formData.registrationCertificate && (
                  <span className="text-sm text-gray-600 mt-1 block">
                    {formData.registrationCertificate.name}
                  </span>
                )}
              </div>
            )}

            <div className="col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Company Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
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
              <label className="block mb-1 text-sm font-medium">
                Phone Number <span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  +63
                </span>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter 10-digit number (e.g., 123456789)"
                  className="w-full border border-gray-300 rounded-md px-12 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.phoneNumber.replace("+63", "")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: `+63 ${value}`,
                      }));
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Format: +63 followed by 10 digits (e.g., +639123456789)
              </p>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Contact Email <span className="text-red-500"> *</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                placeholder="Contact email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.contactEmail}
                onChange={handleChange}
              />
              <p className="text-sm text-blue-600 mt-1 flex items-start gap-1">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Please ensure this email is active for verification purposes</span>
              </p>
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
          <form className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium">Region</label>
              <select
                name="region"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedRegion?.code || ""}
                onChange={(e) => {
                  const selectedRegionObj = regions.find(
                    (r) => r.code === e.target.value
                  );
                  setSelectedRegion(selectedRegionObj);
                  setFormData((prev) => ({
                    ...prev,
                    region: selectedRegionObj?.name || "",
                    province: "",
                    city: "",
                    barangay: "",
                  }));
                }}
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Province</label>
              <select
                name="province"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedProvince?.code || ""}
                onChange={(e) => {
                  const selectedProvinceObj = provinces.find(
                    (p) => p.code === e.target.value
                  );
                  setSelectedProvince(selectedProvinceObj);
                  setFormData((prev) => ({
                    ...prev,
                    province: selectedProvinceObj?.name || "",
                    city: "",
                    barangay: "",
                  }));
                }}
                disabled={!selectedRegion}
              >
                <option value="">Select Province <span className="text-red-500"> *</span> </option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                City/Municipality <span className="text-red-500"> *</span>
              </label>
              <select
                name="city"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedCity?.code || ""}
                onChange={(e) => {
                  const selectedCityObj = cities.find(
                    (c) => c.code === e.target.value
                  );
                  setSelectedCity(selectedCityObj);
                  setFormData((prev) => ({
                    ...prev,
                    city: selectedCityObj?.name || "",
                    barangay: "",
                  }));
                }}
                disabled={!selectedProvince}
              >
                <option value="">Select City/Municipality</option>
                {cities.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Barangay</label>
              <select
                name="barangay"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedBarangay?.code || ""}
                onChange={(e) => {
                  const selectedBarangayObj = barangays.find(
                    (b) => b.code === e.target.value
                  );
                  setSelectedBarangay(selectedBarangayObj);
                  setFormData((prev) => ({
                    ...prev,
                    barangay: selectedBarangayObj?.name || "",
                  }));
                }}
                disabled={!selectedCity}
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm font-medium">Street <span className="text-red-500"> *</span></label>
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Enter street"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.streetAddress}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Postal Code <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Enter postal code"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
                    if (value.length <= 4) {
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: value,
                      }));
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Postal code must be a 4-digit number.
                </p>
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
          <form className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium">Facebook
                    <span className="text-red-500"> *</span>
              </label>
              <input
                type="url"
                name="facebook"
                placeholder="Enter Facebook URL"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.facebook}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Twitter</label>
              <input
                type="url"
                name="twitter"
                placeholder="Enter Twitter URL"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.twitter}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                placeholder="Enter Instagram URL"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.instagram}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">LinkedIn
                    <span className="text-red-500"> *</span>
              </label>
              <input
                type="url"
                name="linkedIn"
                placeholder="Enter LinkedIn URL"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.linkedIn}
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
        {selectedTab === "Additional Information" && (
          <form className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Funding Stage <span className="text-red-500"> *</span>
              </label>
              <select
                name="fundingStage"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.fundingStage}
                onChange={handleChange}
              >
                <option value="">Select funding stage</option>
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
            <div>
              <label className="block mb-1 text-sm font-medium">
                Operating Hours <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="operatingHours"
                placeholder="Operating hours"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.operatingHours}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Business Activity <span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="businessActivity"
                placeholder="Business activity"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.businessActivity}
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
      <ToastContainer />
    </div>
  );
}
