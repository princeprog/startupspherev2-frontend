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
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const draftIdFromUrl = urlParams.get("draftId"); // ← This is the key
  const [loadingDraftId, setLoadingDraftId] = useState(draftIdFromUrl);
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
    });
    setStartupId(null);
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

  // Auto-save draft to backend
  useEffect(() => {
    // Only save if user started typing
    if (!formData.companyName) return;

    setIsSaving(true);

    const timer = setTimeout(async () => {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/draft`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData: JSON.stringify(formData),
            selectedTab,
          }),
        });
      } catch (err) {
        console.warn("Failed to save draft:", err);
      } finally {
        setIsSaving(false);
      }
    }, 800); // 0.8s after last change

    return () => clearTimeout(timer);
  }, [formData, selectedTab]);

  useEffect(() => {
  console.log("Cookies:", document.cookie);
  }, []);

    useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((response) => response.json())
      .then((data) => setRegions(data))
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);

  // Load draft when component mounts
  useEffect(() => {
    
    if (regions.length === 0) return;

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/startups/draft`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok || res.status === 204 || res.status === 404) {
          console.log("No draft – starting fresh");
          return;
        }

        const data = await res.json();

        
        let parsed;
        try {
          parsed = JSON.parse(data.formData);
          if (typeof parsed === "string") parsed = JSON.parse(parsed);
        } catch (e) {
          console.error("Failed to parse draft formData", e);
          return;
        }

        
        const safeFormData = {
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
          region: "",
          barangay: "",
          ...parsed,
        };

        setFormData(safeFormData);
        setSelectedTab(data.selectedTab || "Company Information");

        const restoreAddress = async () => {

          if (safeFormData.region) {
            const regionObj = regions.find((r) => r.name === safeFormData.region);
            if (regionObj) {
              setSelectedRegion(regionObj);

              
              const provRes = await fetch(
                `https://psgc.gitlab.io/api/regions/${regionObj.code}/provinces/`
              );
              const provs = await provRes.json();
              setProvinces(provs);

              if (safeFormData.province) {
                const provObj = provs.find((p) => p.name === safeFormData.province);
                if (provObj) {
                  setSelectedProvince(provObj);

                  
                  const cityRes = await fetch(
                    `https://psgc.gitlab.io/api/provinces/${provObj.code}/cities-municipalities/`
                  );
                  const cities = await cityRes.json();
                  setCities(cities);

                  if (safeFormData.city) {
                    const cityObj = cities.find((c) => c.name === safeFormData.city);
                    if (cityObj) {
                      setSelectedCity(cityObj);

                      
                      const brgyRes = await fetch(
                        `https://psgc.gitlab.io/api/cities-municipalities/${cityObj.code}/barangays/`
                      );
                      const brgys = await brgyRes.json();
                      setBarangays(brgys);

                      if (safeFormData.barangay) {
                        const brgyObj = brgys.find(
                          (b) => b.name === safeFormData.barangay
                        );
                        if (brgyObj) setSelectedBarangay(brgyObj);
                      }
                    }
                  }
                }
              }
            }
          }
        };

        await restoreAddress();

        toast.success("Draft restored from previous session!");
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    })();
  }, [regions]);


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

const handleSubmit = async () => {
  setIsSubmitting(true);
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
    // Prepare a copy of formData without the registrationCertificate file for JSON POST
    const { registrationCertificate, ...startupData } = formData;

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(startupData),
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Startup added successfully: ", data);
      const startupId = data.id;
      setStartupId(startupId);
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

        // CLEAR DRAFT ONLY ON FULL SUCCESS (email sent)
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
    } else {
      console.error("Error adding a startup: ", data);
      toast.error(
        `Failed to add startup: ${
          data.message || data.error || "Unknown error"
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

          {/* Optional: Auto-save indicator */}
          <div className="ml-auto flex items-center space-x-2 text-xs text-gray-500">
            {isSaving ? (
              <>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Saving draft...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 - -11.414-1.414L8 12.58617.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Draft saved</span>
              </>
            )}
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
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="llc">Limited Liability Company (LLC)</option>
                <option value="cooperative">Cooperative</option>
                <option value="non_profit">Non-Profit Organization</option>
                <option value="public_company">Public Company</option>
                <option value="private_company">Private Company</option>
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
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="construction">Construction</option>
                <option value="hospitality">Hospitality</option>
                <option value="transportation">Transportation</option>
                <option value="real_estate">Real Estate</option>
                <option value="agriculture">Agriculture</option>
                <option value="entertainment">Entertainment</option>
                <option value="legal_services">Legal Services</option>
                <option value="energy">Energy</option>
                <option value="telecommunications">Telecommunications</option>
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
                  <option value="DTI">DTI (Department of Trade and Industry)</option>
                  <option value="SEC">SEC (Securities and Exchange Commission)</option>
                  <option value="CDA">CDA (Cooperative Development Authority)</option>
                  <option value="BIR">BIR (Bureau of Internal Revenue)</option>
                  <option value="other">Other</option>
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

            <div className="col-span-2 text-center mt-4">
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2 rounded-md"
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
            <div className="col-span-2 flex justify-between mt-4">
              <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded-md"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2 rounded-md"
                onClick={handleNext}
              >
                Next
              </button>
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
            <div className="col-span-2 flex justify-between mt-6">
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2 rounded-md hover:bg-[#16324f] transition"
                onClick={handleNext}
              >
                Next
              </button>
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
            <div className="col-span-2 flex justify-between mt-4">
              <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded-md"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2 rounded-md"
                onClick={handleNext}
              >
                Next
              </button>
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
                <option value="bootstrapped">Bootstrapped</option>
                <option value="seed">Seed</option>
                <option value="series_a">Series A</option>
                <option value="series_b">Series B</option>
                <option value="series_c">Series C</option>
                <option value="public">Public</option>
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
            <div className="col-span-2 flex justify-between mt-4">
              <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded-md"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-[#1D3557] text-white px-6 py-2 rounded-md"
                onClick={handleNext}
              >
                Next
              </button>
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
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-gray-300 px-6 py-2 rounded-md"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-[#1D3557] text-white px-6 py-2 rounded-md"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
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
      <ToastContainer />
    </div>
  );
}
