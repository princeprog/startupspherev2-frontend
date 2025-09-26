import React, { useState, useEffect, useRef } from "react";
import StakeholderLocationPicker from "../components/StakeholderLocationPicker";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Clock,
} from "lucide-react";

export default function StartupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholderLoading, setStakeholderLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Add this validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // For stakeholder management
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState(null);
  const [stakeholderFormData, setStakeholderFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    region: "",
    city: "",
    barangay: "",
    street: "",
    postalCode: "",
    facebook: "",
    linkedIn: "",
    role: "Mentor",
    status: "Active",
    hasPhysicalLocation: false, // New toggle field
    locationLat: null, // Latitude coordinate
    locationLng: null, // Longitude coordinate
    locationName: "", // Descriptive name of location
  });

  // Add this state near your other state variables
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add these states for controlling the map modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapInstanceRef = useRef(null);

  // New state for expanded stakeholders
  const [expandedStakeholders, setExpandedStakeholders] = useState({});

  // First, add these new state variables at the top of your component
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Track selected location IDs for API filtering
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Fetch startup data
  useEffect(() => {
    const fetchStartupDetails = async () => {
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
        setStartup(data);
      } catch (error) {
        console.error("Error fetching startup details:", error);
        setError("Failed to load startup details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStartupDetails();
  }, [id]);

  // Fetch stakeholders when tab changes to stakeholders
  useEffect(() => {
    if (
      activeTab === "stakeholders" &&
      !stakeholderLoading &&
      stakeholders.length === 0
    ) {
      fetchStakeholders();
    }
  }, [activeTab]);

  // Fetch stakeholders
  // Update the fetchStakeholders function to use the correct endpoint

  const fetchStakeholders = async () => {
    setStakeholderLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/startup-stakeholders/startup/${id}/stakeholders`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching stakeholders: ${response.status}`);
      }

      const data = await response.json();
      setStakeholders(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching stakeholders:", error);
      showNotification(
        "Failed to load stakeholders. Please try again.",
        "error"
      );
    } finally {
      setStakeholderLoading(false);
    }
  };

  // Handle location selection from the map
  const handleLocationSelect = (location) => {
    setStakeholderFormData({
      ...stakeholderFormData,
      locationLat: location.lat,
      locationLng: location.lng,
      locationName:
        location.name ||
        `${stakeholderFormData.city || ""} (${location.lat.toFixed(
          6
        )}, ${location.lng.toFixed(6)})`,
    });
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  // Update the handleAddStakeholder function to include location data
  // Update the handleAddStakeholder function to include loading state and better error handling
  const handleAddStakeholder = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Extract stakeholder data (excluding role and status)
      const { role, status, hasPhysicalLocation, ...stakeholderData } =
        stakeholderFormData;

      // Remove location data if hasPhysicalLocation is false
      if (!hasPhysicalLocation) {
        delete stakeholderData.locationLat;
        delete stakeholderData.locationLng;
        delete stakeholderData.locationName;
      }

      // Step 2: Create stakeholder
      const stakeholderResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/stakeholders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(stakeholderData),
        }
      );

      const responseData = await stakeholderResponse.json();

      if (!stakeholderResponse.ok) {
        // Check for duplicate email error
        if (
          responseData.message?.toLowerCase().includes("duplicate") ||
          responseData.message?.toLowerCase().includes("already exists")
        ) {
          throw new Error(
            "A stakeholder with this email address already exists. Please use a different email."
          );
        }
        throw new Error(responseData.message || "Error creating stakeholder");
      }

      // Step 3: Get the created stakeholder ID
      const stakeholderId = responseData.id;

      // Step 4: Create startup-stakeholder association
      const associationResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            startupId: parseInt(id),
            stakeholderId: stakeholderId,
            role: role,
            status: status,
          }),
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(
          errorData.message || "Error associating stakeholder with startup"
        );
      }

      // Step 5: Refresh the stakeholders list
      await fetchStakeholders();
      setShowStakeholderForm(false);
      resetStakeholderForm();
      showNotification("Stakeholder added successfully!", "success");
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      showNotification(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update stakeholder
  // Update the handleUpdateStakeholder function similarly
  // Fix for the handleUpdateStakeholder function to use the correct endpoint for role and status
  const handleUpdateStakeholder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the correct stakeholder ID depending on structure
      const stakeholderId = editingStakeholder.stakeholder
        ? editingStakeholder.stakeholder.id
        : editingStakeholder.id;

      // Extract role and status
      const { role, status, hasPhysicalLocation, ...stakeholderData } =
        stakeholderFormData;

      // Remove location data if hasPhysicalLocation is false
      if (!hasPhysicalLocation) {
        delete stakeholderData.locationLat;
        delete stakeholderData.locationLng;
        delete stakeholderData.locationName;
      }

      // Step 1: Update the stakeholder data
      const stakeholderResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/stakeholders/${stakeholderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(stakeholderData),
        }
      );

      const responseData = await stakeholderResponse.json();

      if (!stakeholderResponse.ok) {
        // Check for duplicate email error
        if (
          responseData.message?.toLowerCase().includes("duplicate") ||
          responseData.message?.toLowerCase().includes("already exists")
        ) {
          throw new Error(
            "A stakeholder with this email address already exists. Please use a different email."
          );
        }
        throw new Error(responseData.message || "Error updating stakeholder");
      }

      // Step 2: Update the role and status using the direct startup-stakeholder ID
      // Note: stakeholderData.id is actually the association ID, not the stakeholder ID
      const associationId = stakeholderData.id || editingStakeholder.id;

      const associationResponse = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/startup-stakeholders/${associationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role: role,
            status: status,
          }),
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(
          errorData.message || "Error updating stakeholder role/status"
        );
      }

      await fetchStakeholders();
      setShowStakeholderForm(false);
      setEditingStakeholder(null);
      resetStakeholderForm();
      showNotification("Stakeholder updated successfully!", "success");
    } catch (error) {
      console.error("Error updating stakeholder:", error);
      showNotification(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete stakeholder
  // Update the handleDeleteStakeholder function to use the correct endpoints in sequence
  const handleDeleteStakeholder = async (associationId) => {
    if (!window.confirm("Are you sure you want to delete this stakeholder?")) {
      return;
    }

    // Find the stakeholder data to get both IDs
    const stakeholderData = stakeholders.find(
      (item) => item.id === associationId
    );
    if (!stakeholderData) {
      showNotification("Could not find stakeholder data", "error");
      return;
    }

    // Get the actual stakeholder ID from the nested structure
    const stakeholderId = stakeholderData.stakeholder?.id;

    setIsSubmitting(true);

    try {
      // Step 1: Delete the startup-stakeholder association
      console.log(`Deleting association with ID: ${associationId}`);
      const associationResponse = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/startup-stakeholders/${associationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(
          errorData.message || "Error deleting stakeholder association"
        );
      }

      // Step 2: Delete the stakeholder entity
      if (stakeholderId) {
        console.log(`Deleting stakeholder with ID: ${stakeholderId}`);
        const stakeholderResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/stakeholders/${stakeholderId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!stakeholderResponse.ok) {
          const errorData = await stakeholderResponse.json();
          throw new Error(
            errorData.message || "Error deleting stakeholder entity"
          );
        }
      } else {
        console.warn("No stakeholder ID found, skipping stakeholder deletion");
      }

      // Refresh the stakeholders list after successful deletion
      await fetchStakeholders();
      showNotification("Stakeholder deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting stakeholder:", error);
      showNotification(
        "Failed to delete stakeholder: " + error.message,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to edit stakeholder
  // Helper function to edit stakeholder
  const startEditingStakeholder = (stakeholderData) => {
    console.log(stakeholderData);
    // Handle both direct stakeholder objects and nested structures
    const stakeholder = stakeholderData.stakeholder || stakeholderData;

    // Determine if stakeholder has a physical location
    const hasPhysicalLocation = !!(
      stakeholder.locationLat && stakeholder.locationLng
    );

    setEditingStakeholder(stakeholderData);
    setStakeholderFormData({
      name: stakeholder.name || "",
      email: stakeholder.email || "",
      phoneNumber: stakeholder.phoneNumber || "",
      region: stakeholder.region || "",
      city: stakeholder.city || "",
      barangay: stakeholder.barangay || "",
      street: stakeholder.street || "",
      postalCode: stakeholder.postalCode || "",
      facebook: stakeholder.facebook || "",
      linkedIn: stakeholder.linkedIn || "",
      role: stakeholderData.role || "Mentor",
      status: stakeholderData.status || "Active",
      hasPhysicalLocation,
      locationLat: stakeholder.locationLat || null,
      locationLng: stakeholder.locationLng || null,
      locationName: stakeholder.locationName || "",
    });

    // Find and select the region based on name (pre-selection)
    const matchedRegion = regions.find((r) => r.name === stakeholder.region);
    if (matchedRegion) {
      setSelectedRegion(matchedRegion.code);
      // The useEffect hooks will handle loading provinces and subsequent selections
    }

    setShowStakeholderForm(true);
  };

  // Reset stakeholder form
  const resetStakeholderForm = () => {
    setStakeholderFormData({
      name: "",
      email: "",
      phoneNumber: "",
      region: "",
      city: "",
      barangay: "",
      street: "",
      postalCode: "",
      facebook: "",
      linkedIn: "",
      role: "Mentor",
      status: "Active",
      hasPhysicalLocation: false,
      locationLat: null,
      locationLng: null,
      locationName: "",
    });
  };

  // Show notification
  // Update the showNotification function to give more prominence to error messages
  const showNotification = (message, type) => {
    setNotification({
      message,
      type,
      // Add title based on notification type
      title: type === "success" ? "Success" : "Error Occurred",
    });

    // Clear notification after some time
    setTimeout(
      () => {
        setNotification(null);
      },
      type === "error" ? 8000 : 5000
    ); // Show errors longer
  };

  // Then update the notification component:
  {
    notification && (
      <div
        className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 flex items-start ${
          notification.type === "success"
            ? "bg-green-50 border border-green-100"
            : "bg-red-50 border border-red-100"
        }`}
      >
        {notification.type === "success" ? (
          <CheckCircle2
            size={20}
            className="text-green-500 mr-3 flex-shrink-0 mt-0.5"
          />
        ) : (
          <AlertCircle
            size={20}
            className="text-red-500 mr-3 flex-shrink-0 mt-0.5"
          />
        )}
        <div className="flex-1">
          <h3
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : "text-red-800"
            }`}
          >
            {notification.title}
          </h3>
          <p
            className={`mt-1 text-sm ${
              notification.type === "success"
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className={`ml-4 p-1 rounded-full ${
            notification.type === "success"
              ? "hover:bg-green-100 text-green-500"
              : "hover:bg-red-100 text-red-500"
          }`}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const validateForm = () => {
    // Required fields
    if (!stakeholderFormData.name.trim()) {
      showNotification("Please enter the stakeholder's name.", "error");
      return false;
    }

    if (!stakeholderFormData.email.trim()) {
      showNotification("Please enter an email address.", "error");
      return false;
    }

    if (!validateEmail(stakeholderFormData.email)) {
      showNotification("Please enter a valid email address.", "error");
      return false;
    }

    return true;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format dates and times
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle function for expanding stakeholder rows
  const toggleStakeholderExpand = (id) => {
    if (!id) return; // Guard against undefined IDs
    setExpandedStakeholders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Use these effects to fetch hierarchical data from the PSGC API

  // Fetch all regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("https://psgc.gitlab.io/api/regions");
        if (!response.ok) throw new Error("Failed to fetch regions");
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
    const fetchProvinces = async () => {
      if (!selectedRegion) {
        setProvinces([]);
        return;
      }

      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/regions/${selectedRegion}/provinces`
        );
        if (!response.ok) throw new Error("Failed to fetch provinces");
        const data = await response.json();
        setProvinces(data);
        // Reset child selections when parent changes
        setSelectedProvince("");
        setSelectedCity("");
        setCities([]);
        setBarangays([]);
        // Update form data with region name instead of code
        const selectedRegionObj = regions.find(
          (r) => r.code === selectedRegion
        );
        if (selectedRegionObj) {
          setStakeholderFormData((prev) => ({
            ...prev,
            region: selectedRegionObj.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, [selectedRegion, regions]);

  // Fetch cities/municipalities when province is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvince) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities`
        );
        if (!response.ok) throw new Error("Failed to fetch cities");
        const data = await response.json();
        setCities(data);
        // Reset barangays when city changes
        setSelectedCity("");
        setBarangays([]);
        // Update form data with province name
        const selectedProvinceObj = provinces.find(
          (p) => p.code === selectedProvince
        );
        if (selectedProvinceObj) {
          setStakeholderFormData((prev) => ({
            ...prev,
            province: selectedProvinceObj.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [selectedProvince, provinces]);

  // Fetch barangays when city/municipality is selected
  useEffect(() => {
    const fetchBarangays = async () => {
      if (!selectedCity) {
        setBarangays([]);
        return;
      }

      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays`
        );
        if (!response.ok) throw new Error("Failed to fetch barangays");
        const data = await response.json();
        setBarangays(data);
        // Update form data with city name
        const selectedCityObj = cities.find((c) => c.code === selectedCity);
        if (selectedCityObj) {
          setStakeholderFormData((prev) => ({
            ...prev,
            city: selectedCityObj.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching barangays:", error);
      }
    };
    fetchBarangays();
  }, [selectedCity, cities]);

  // Handle barangay selection
  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    const selectedBarangayObj = barangays.find((b) => b.code === barangayCode);

    if (selectedBarangayObj) {
      setStakeholderFormData((prev) => ({
        ...prev,
        barangay: selectedBarangayObj.name,
      }));
    }
  };

  // Add this state for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    stakeholderId: null,
    stakeholderName: "",
    isDeleting: false,
  });

  // Update the delete handler to open the modal instead of showing a browser confirm
  const handleDeleteClick = (stakeholderData) => {
    const stakeholder = stakeholderData.stakeholder || stakeholderData;
    setDeleteModal({
      isOpen: true,
      stakeholderId: stakeholderData.id,
      stakeholderName: stakeholder.name,
      role: stakeholderData.role || "Stakeholder",
      isDeleting: false,
    });
  };

  // Create a new function for the actual deletion process
  const confirmDeleteStakeholder = async () => {
    const stakeholderId = deleteModal.stakeholderId;

    // Find the stakeholder data to get both IDs
    const stakeholderData = stakeholders.find((item) => item.id === stakeholderId);
    if (!stakeholderData) {
      showNotification("Could not find stakeholder data", "error");
      setDeleteModal({ ...deleteModal, isOpen: false });
      return;
    }

    // Get the actual stakeholder ID from the nested structure
    const actualStakeholderId = stakeholderData.stakeholder?.id;

    // Start deletion and show loading state
    setDeleteModal({ ...deleteModal, isDeleting: true });

    try {
      // Step 1: Delete the startup-stakeholder association
      console.log(`Deleting association with ID: ${stakeholderId}`);
      const associationResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholders/${stakeholderId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(
          errorData.message || "Error deleting stakeholder association"
        );
      }

      // Step 2: Delete the stakeholder entity
      if (actualStakeholderId) {
        console.log(`Deleting stakeholder with ID: ${actualStakeholderId}`);
        const stakeholderResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/stakeholders/${actualStakeholderId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!stakeholderResponse.ok) {
          const errorData = await stakeholderResponse.json();
          throw new Error(
            errorData.message || "Error deleting stakeholder entity"
          );
        }
      } else {
        console.warn("No stakeholder ID found, skipping stakeholder deletion");
      }

      // Refresh the stakeholders list after successful deletion
      await fetchStakeholders();
      showNotification(
        `${deleteModal.stakeholderName} was deleted successfully`,
        "success"
      );
    } catch (error) {
      console.error("Error deleting stakeholder:", error);
      showNotification("Failed to delete stakeholder: " + error.message, "error");
    } finally {
      setDeleteModal({
        isOpen: false,
        stakeholderId: null,
        stakeholderName: "",
        isDeleting: false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading</h2>
          <p className="text-gray-500">Retrieving startup information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Startup Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 truncate">
              {startup.companyName}
            </h1>
            <span className="ml-3 px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Public Profile
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() =>
                navigate(`/update-startup/${id}`, { state: { startup } })
              }
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Edit size={16} className="mr-2" />
              Edit Startup
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 flex items-center ${
            notification.type === "success"
              ? "bg-green-50 border border-green-100"
              : "bg-red-50 border border-red-100"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2
              size={20}
              className="text-green-500 mr-3 flex-shrink-0"
            />
          ) : (
            <AlertCircle
              size={20}
              className="text-red-500 mr-3 flex-shrink-0"
            />
          )}
          <p
            className={
              notification.type === "success"
                ? "text-green-700"
                : "text-red-700"
            }
          >
            {notification.message}
          </p>
          <button
            onClick={() => setNotification(null)}
            className={`ml-4 p-1 rounded-full ${
              notification.type === "success"
                ? "hover:bg-green-100 text-green-500"
                : "hover:bg-red-100 text-red-500"
            }`}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={`px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Startup Details
            </button>
            <button
              className={`px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === "stakeholders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("stakeholders")}
            >
              Stakeholders
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with company info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Building className="w-10 h-10 text-blue-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  {startup.companyName}
                </h2>
                <p className="text-sm text-gray-500 text-center mb-4">
                  {startup.industry || "No industry specified"}
                </p>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  {startup.foundedDate && (
                    <div className="flex items-center text-gray-700">
                      <Calendar size={18} className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Founded
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(startup.foundedDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {startup.typeOfCompany && (
                    <div className="flex items-center text-gray-700">
                      <Briefcase size={18} className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Type
                        </p>
                        <p className="text-sm text-gray-600">
                          {startup.typeOfCompany}
                        </p>
                      </div>
                    </div>
                  )}

                  {startup.numberOfEmployees && (
                    <div className="flex items-center text-gray-700">
                      <Users size={18} className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Employees
                        </p>
                        <p className="text-sm text-gray-600">
                          {startup.numberOfEmployees}
                        </p>
                      </div>
                    </div>
                  )}

                  {startup.city && startup.province && (
                    <div className="flex items-center text-gray-700">
                      <MapPin size={18} className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Location
                        </p>
                        <p className="text-sm text-gray-600">
                          {[startup.city, startup.province]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  Contact Information
                </h3>
                <div className="mt-3 space-y-3">
                  {startup.contactEmail && (
                    <a
                      href={`mailto:${startup.contactEmail}`}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Mail size={16} className="mr-2 text-gray-400" />
                      {startup.contactEmail}
                    </a>
                  )}

                  {startup.phoneNumber && (
                    <a
                      href={`tel:${startup.phoneNumber}`}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Phone size={16} className="mr-2 text-gray-400" />
                      {startup.phoneNumber}
                    </a>
                  )}

                  {startup.website && (
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Globe size={16} className="mr-2 text-gray-400" />
                      {startup.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                {/* Social Media Links */}
                {(startup.facebook ||
                  startup.twitter ||
                  startup.instagram ||
                  startup.linkedIn) && (
                  <div className="mt-4 flex space-x-3">
                    {startup.facebook && (
                      <a
                        href={startup.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700"
                      >
                        <Facebook size={18} />
                      </a>
                    )}
                    {startup.twitter && (
                      <a
                        href={startup.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                    {startup.instagram && (
                      <a
                        href={startup.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-600"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                    {startup.linkedIn && (
                      <a
                        href={startup.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-800"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            {activeTab === "details" ? (
              // Details tab
              <div className="space-y-6">
                {/* Company Description */}
                <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      About the Company
                    </h3>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-gray-700 whitespace-pre-line">
                      {startup.companyDescription ||
                        "No description available."}
                    </p>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      Address Information
                    </h3>
                  </div>
                  <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {startup.streetAddress && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Street Address
                        </h4>
                        <p className="text-gray-900">{startup.streetAddress}</p>
                      </div>
                    )}

                    {startup.city && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          City
                        </h4>
                        <p className="text-gray-900">{startup.city}</p>
                      </div>
                    )}

                    {startup.province && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Province/State
                        </h4>
                        <p className="text-gray-900">{startup.province}</p>
                      </div>
                    )}

                    {startup.postalCode && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Postal/ZIP Code
                        </h4>
                        <p className="text-gray-900">{startup.postalCode}</p>
                      </div>
                    )}

                    {startup.country && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Country
                        </h4>
                        <p className="text-gray-900">{startup.country}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Metrics */}
                <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                      Business Metrics
                    </h3>
                  </div>
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {startup.fundingStage && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Funding Stage
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {startup.fundingStage}
                          </p>
                        </div>
                      )}

                      {startup.operatingHours && (
                        <div className="p-4 bg-indigo-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Operating Hours
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {startup.operatingHours}
                          </p>
                        </div>
                      )}

                      {startup.numberOfEmployees && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Team Size
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {startup.numberOfEmployees}
                          </p>
                        </div>
                      )}
                    </div>

                    {!startup.fundingStage &&
                      !startup.operatingHours &&
                      !startup.numberOfEmployees && (
                        <p className="text-gray-500 italic">
                          No business metrics available.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              // Stakeholders tab
              <div>
                <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Stakeholders
                    </h3>
                    <button
                      onClick={() => {
                        resetStakeholderForm();
                        setEditingStakeholder(null);
                        setShowStakeholderForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Stakeholder
                    </button>
                  </div>

                  {/* Stakeholder form - Enhanced Professional Design */}
                  {showStakeholderForm && (
                    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
                      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                          <div className="px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {editingStakeholder
                                ? "Edit Stakeholder"
                                : "Add New Stakeholder"}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setShowStakeholderForm(false);
                                setEditingStakeholder(null);
                              }}
                              className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label="Close"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>

                        <form
                          onSubmit={
                            editingStakeholder
                              ? handleUpdateStakeholder
                              : handleAddStakeholder
                          }
                          className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]"
                        >
                          <div className="space-y-8">
                            {/* Basic Information */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <User
                                  size={18}
                                  className="mr-2 text-blue-600"
                                />
                                Basic Information
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="col-span-1">
                                  <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Full Name{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="name"
                                    required
                                    value={stakeholderFormData.name}
                                    onChange={(e) =>
                                      setStakeholderFormData({
                                        ...stakeholderFormData,
                                        name: e.target.value,
                                      })
                                    }
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="John Smith"
                                  />
                                </div>

                                {/* NEW: Role Selection Dropdown */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Role <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Briefcase
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    </div>
                                    <select
                                      id="role"
                                      required
                                      value={stakeholderFormData.role}
                                      onChange={(e) =>
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          role: e.target.value,
                                        })
                                      }
                                      className="block text-gray-800 w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none"
                                    >
                                      <option value="Mentor">Mentor</option>
                                      <option value="Advisor">Advisor</option>
                                      <option value="Investor">Investor</option>
                                      <option value="Angel Investor">
                                        Angel Investor
                                      </option>
                                      <option value="VC Representative">
                                        VC Representative
                                      </option>
                                      <option value="Founder">Founder</option>
                                      <option value="Co-Founder">
                                        Co-Founder
                                      </option>
                                      <option value="Board Member">
                                        Board Member
                                      </option>
                                      <option value="Executive">
                                        Executive
                                      </option>
                                      <option value="Partner">Partner</option>
                                      <option value="Strategic Partner">
                                        Strategic Partner
                                      </option>
                                      <option value="Industry Expert">
                                        Industry Expert
                                      </option>
                                      <option value="Service Provider">
                                        Service Provider
                                      </option>
                                      <option value="Family Office">
                                        Family Office
                                      </option>
                                      <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                      <ChevronDown
                                        size={14}
                                        className="text-gray-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Existing email field */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Email Address{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div>
                                    <input
                                      type="email"
                                      id="email"
                                      required
                                      value={stakeholderFormData.email}
                                      onChange={(e) => {
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          email: e.target.value,
                                        });
                                      }}
                                      className={`block text-gray-800 w-full px-3 py-2 border ${
                                        stakeholderFormData.email &&
                                        !validateEmail(
                                          stakeholderFormData.email
                                        )
                                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                      } rounded-md shadow-sm sm:text-sm transition-all`}
                                      placeholder="john.smith@example.com"
                                    />
                                    {stakeholderFormData.email &&
                                      !validateEmail(
                                        stakeholderFormData.email
                                      ) && (
                                        <p className="mt-1 text-sm text-red-600">
                                          Please enter a valid email address
                                        </p>
                                      )}
                                  </div>
                                </div>

                                {/* Existing phone number field */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Phone Number
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Phone
                                        size={16}
                                        className="text-gray-400"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      id="phoneNumber"
                                      value={stakeholderFormData.phoneNumber}
                                      onChange={(e) =>
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          phoneNumber: e.target.value,
                                        })
                                      }
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="+63 919 123 4567"
                                    />
                                  </div>
                                </div>

                                {/* NEW: Status Selection Dropdown */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Status{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          stakeholderFormData.status ===
                                          "Active"
                                            ? "bg-green-500"
                                            : stakeholderFormData.status ===
                                              "Inactive"
                                            ? "bg-gray-400"
                                            : "bg-yellow-500"
                                        }`}
                                      ></div>
                                    </div>
                                    <select
                                      id="status"
                                      required
                                      value={stakeholderFormData.status}
                                      onChange={(e) =>
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          status: e.target.value,
                                        })
                                      }
                                      className="block text-gray-800 w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                      <option value="Pending">Pending</option>
                                      <option value="Former">Former</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                      <ChevronDown
                                        size={14}
                                        className="text-gray-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </fieldset>

                            {/* Address Information with PSGC API Integration */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <MapPin
                                  size={18}
                                  className="mr-2 text-blue-600"
                                />
                                Address Information
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Region Selection */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="region"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Region
                                  </label>
                                  <select
                                    id="region"
                                    value={selectedRegion}
                                    onChange={(e) =>
                                      setSelectedRegion(e.target.value)
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800"
                                  >
                                    <option value="">Select a region</option>
                                    {regions.map((region) => (
                                      <option
                                        key={region.code}
                                        value={region.code}
                                      >
                                        {region.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Province Selection */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="province"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Province
                                  </label>
                                  <select
                                    id="province"
                                    value={selectedProvince}
                                    onChange={(e) =>
                                      setSelectedProvince(e.target.value)
                                    }
                                    disabled={
                                      !selectedRegion || provinces.length === 0
                                    }
                                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800 ${
                                      !selectedRegion
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select a province</option>
                                    {provinces.map((province) => (
                                      <option
                                        key={province.code}
                                        value={province.code}
                                      >
                                        {province.name}
                                      </option>
                                    ))}
                                  </select>
                                  {selectedRegion && provinces.length === 0 && (
                                    <p className="mt-1 text-xs text-blue-600">
                                      Loading provinces or region may not have
                                      provinces...
                                    </p>
                                  )}
                                </div>

                                {/* City/Municipality Selection */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="city"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    City / Municipality
                                  </label>
                                  <select
                                    id="city"
                                    value={selectedCity}
                                    onChange={(e) =>
                                      setSelectedCity(e.target.value)
                                    }
                                    disabled={
                                      !selectedProvince || cities.length === 0
                                    }
                                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800 ${
                                      !selectedProvince
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <option value="">
                                      Select a city/municipality
                                    </option>
                                    {cities.map((city) => (
                                      <option key={city.code} value={city.code}>
                                        {city.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Barangay Selection */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="barangay"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Barangay
                                  </label>
                                  <select
                                    id="barangay"
                                    onChange={handleBarangayChange}
                                    disabled={
                                      !selectedCity || barangays.length === 0
                                    }
                                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800 ${
                                      !selectedCity
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select a barangay</option>
                                    {barangays.map((barangay) => (
                                      <option
                                        key={barangay.code}
                                        value={barangay.code}
                                      >
                                        {barangay.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Street Address - Keep as free text input */}
                                <div className="col-span-2">
                                  <label
                                    htmlFor="street"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Street Address / Building / House No.
                                  </label>
                                  <input
                                    type="text"
                                    id="street"
                                    value={stakeholderFormData.street}
                                    onChange={(e) =>
                                      setStakeholderFormData({
                                        ...stakeholderFormData,
                                        street: e.target.value,
                                      })
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800"
                                    placeholder="123 Main Street"
                                  />
                                </div>

                                {/* Postal Code - Keep as free text input */}
                                <div className="col-span-1">
                                  <label
                                    htmlFor="postalCode"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Postal Code
                                  </label>
                                  <input
                                    type="text"
                                    id="postalCode"
                                    value={stakeholderFormData.postalCode}
                                    onChange={(e) =>
                                      setStakeholderFormData({
                                        ...stakeholderFormData,
                                        postalCode: e.target.value,
                                      })
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-800"
                                    placeholder="1200"
                                  />
                                </div>
                              </div>
                            </fieldset>

                            {/* Social Media */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <Globe
                                  size={18}
                                  className="mr-2 text-blue-600"
                                />
                                Social Media
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="col-span-1">
                                  <label
                                    htmlFor="facebook"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Facebook
                                  </label>
                                  <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Facebook
                                        size={16}
                                        className="text-blue-600"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      id="facebook"
                                      value={stakeholderFormData.facebook}
                                      onChange={(e) =>
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          facebook: e.target.value,
                                        })
                                      }
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="facebook.com/profile"
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Full URL or username
                                  </p>
                                </div>

                                <div className="col-span-1">
                                  <label
                                    htmlFor="linkedIn"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    LinkedIn
                                  </label>
                                  <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Linkedin
                                        size={16}
                                        className="text-blue-700"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      id="linkedIn"
                                      value={stakeholderFormData.linkedIn}
                                      onChange={(e) =>
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          linkedIn: e.target.value,
                                        })
                                      }
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="linkedin.com/in/profile"
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Full URL or username
                                  </p>
                                </div>
                              </div>
                            </fieldset>

                            {/* Location on Map (Optional) */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <MapPin
                                  size={18}
                                  className="mr-2 text-blue-600"
                                />
                                Physical Location
                              </legend>

                              <div className="flex items-center mb-4">
                                <div className="form-control">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={
                                        stakeholderFormData.hasPhysicalLocation
                                      }
                                      onChange={(e) => {
                                        setStakeholderFormData({
                                          ...stakeholderFormData,
                                          hasPhysicalLocation: e.target.checked,
                                          // Reset location data if toggled off
                                          ...(e.target.checked
                                            ? {}
                                            : {
                                                locationLat: null,
                                                locationLng: null,
                                                locationName: "",
                                              }),
                                        });
                                      }}
                                      className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">
                                      This stakeholder has a physical office or
                                      workplace to show on the map
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {stakeholderFormData.hasPhysicalLocation && (
                                <div className="space-y-4">
                                  <div className="relative rounded-md border border-gray-300 bg-gray-50 p-4">
                                    {stakeholderFormData.locationLat &&
                                    stakeholderFormData.locationLng ? (
                                      <div className="flex flex-col space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">
                                              {stakeholderFormData.locationName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Latitude:{" "}
                                              {stakeholderFormData.locationLat.toFixed(
                                                6
                                              )}
                                              , Longitude:{" "}
                                              {stakeholderFormData.locationLng.toFixed(
                                                6
                                              )}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setShowLocationModal(true)
                                            }
                                            className="px-3 py-1 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                                          >
                                            Change
                                          </button>
                                        </div>

                                        {/* Preview Map */}
                                        <div className="h-40 w-full rounded-md overflow-hidden border border-gray-200">
                                          <iframe
                                            title="Location preview"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            src={`https://maps.google.com/maps?q=${stakeholderFormData.locationLat},${stakeholderFormData.locationLng}&z=15&output=embed`}
                                          />
                                        </div>

                                        {/* Location description input */}
                                        <div>
                                          <label
                                            htmlFor="locationName"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                          >
                                            Location Name{" "}
                                            <span className="text-xs text-gray-500">
                                              (e.g. "Main Office",
                                              "Headquarters")
                                            </span>
                                          </label>
                                          <input
                                            type="text"
                                            id="locationName"
                                            value={
                                              stakeholderFormData.locationName
                                            }
                                            onChange={(e) =>
                                              setStakeholderFormData({
                                                ...stakeholderFormData,
                                                locationName: e.target.value,
                                              })
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Enter a descriptive name for this location"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-6">
                                        <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">
                                          No location selected
                                        </p>
                                        <p className="text-xs text-gray-500 mb-4">
                                          Click the button below to select a
                                          location on the map
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowLocationModal(true)
                                          }
                                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                          Select Location on Map
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </fieldset>

                            {/* Form Buttons */}
                            {/* Form Buttons */}
                            <div className="mt-8 border-t border-gray-200 pt-5">
                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => {
                                    setShowStakeholderForm(false);
                                    setEditingStakeholder(null);
                                  }}
                                  className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                                    isSubmitting
                                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                      : "text-gray-700 bg-white hover:bg-gray-50"
                                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    isSubmitting
                                      ? "bg-blue-500 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors inline-flex items-center`}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      {editingStakeholder
                                        ? "Saving..."
                                        : "Adding..."}
                                    </>
                                  ) : (
                                    <>
                                      {editingStakeholder
                                        ? "Save Changes"
                                        : "Add Stakeholder"}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-5">
                    {stakeholderLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="w-10 h-10 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
                      </div>
                    ) : stakeholders.length > 0 ? (
                      <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="w-10 px-3 py-3"></th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Name
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Email
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Phone Number
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stakeholders.map((stakeholderData) => {
                                // Handle both nested and direct stakeholder objects
                                const stakeholder =
                                  stakeholderData.stakeholder ||
                                  stakeholderData;
                                const stakeholderId = stakeholderData.id;

                                if (!stakeholder) return null; // Skip if stakeholder object is undefined

                                return (
                                  <React.Fragment key={stakeholderId}>
                                    <tr
                                      className={`hover:bg-gray-50 ${
                                        expandedStakeholders[stakeholderId]
                                          ? "bg-blue-50/40"
                                          : ""
                                      }`}
                                    >
                                      <td className="px-3 py-4 whitespace-nowrap">
                                        <button
                                          onClick={() =>
                                            toggleStakeholderExpand(
                                              stakeholderId
                                            )
                                          }
                                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                          {expandedStakeholders[
                                            stakeholderId
                                          ] ? (
                                            <ChevronUp size={18} />
                                          ) : (
                                            <ChevronDown size={18} />
                                          )}
                                        </button>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                            <User size={18} />
                                          </div>
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              {stakeholder.name || "Unnamed"}
                                            </div>
                                            {stakeholderData.role && (
                                              <div className="text-xs text-gray-500">
                                                {stakeholderData.role}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {stakeholder.email && (
                                            <a
                                              href={`mailto:${stakeholder.email}`}
                                              className="text-gray-600 hover:text-blue-600"
                                            >
                                              {stakeholder.email}
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                          {stakeholder.phoneNumber && (
                                            <a
                                              href={`tel:${stakeholder.phoneNumber}`}
                                              className="text-gray-600 hover:text-blue-600"
                                            >
                                              {stakeholder.phoneNumber}
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() =>
                                              startEditingStakeholder(
                                                stakeholderData
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                          >
                                            <Edit size={16} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteClick(stakeholderData)
                                            }
                                            className="text-red-600 hover:text-red-900 p-1"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>

                                    {/* Expanded details row */}
                                    {expandedStakeholders[stakeholderId] && (
                                      <tr>
                                        <td className="px-0"></td>
                                        <td colSpan={4} className="px-6 py-3">
                                          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              {/* Address Details */}
                                              <div className="space-y-2">
                                                <h4 className="text-sm font-semibold flex items-center text-gray-700">
                                                  <MapPin
                                                    size={16}
                                                    className="mr-1 text-gray-400"
                                                  />{" "}
                                                  Address
                                                </h4>
                                                <div className="pl-6 space-y-1 text-sm">
                                                  {stakeholder.street && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">
                                                        Street:
                                                      </span>{" "}
                                                      {stakeholder.street}
                                                    </p>
                                                  )}
                                                  {stakeholder.barangay && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">
                                                        Barangay:
                                                      </span>{" "}
                                                      {stakeholder.barangay}
                                                    </p>
                                                  )}
                                                  {stakeholder.city && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">
                                                        City:
                                                      </span>{" "}
                                                      {stakeholder.city}
                                                    </p>
                                                  )}
                                                  {stakeholder.region && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">
                                                        Region:
                                                      </span>{" "}
                                                      {stakeholder.region}
                                                    </p>
                                                  )}
                                                  {stakeholder.postalCode && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">
                                                        Postal Code:
                                                      </span>{" "}
                                                      {stakeholder.postalCode}
                                                    </p>
                                                  )}
                                                  {!stakeholder.street &&
                                                    !stakeholder.barangay &&
                                                    !stakeholder.city &&
                                                    !stakeholder.region &&
                                                    !stakeholder.postalCode && (
                                                      <p className="text-gray-500 italic">
                                                        No address information
                                                        available
                                                      </p>
                                                    )}
                                                </div>
                                              </div>

                                              {/* Social Media and Date Information */}
                                              <div className="space-y-4">
                                                {/* Social Media Links */}
                                                <div className="space-y-2">
                                                  <h4 className="text-sm font-semibold flex items-center text-gray-700">
                                                    <Link
                                                      size={16}
                                                      className="mr-1 text-gray-400"
                                                    />{" "}
                                                    Social Media
                                                  </h4>
                                                  <div className="pl-6 space-y-1 text-sm">
                                                    {stakeholder.facebook && (
                                                      <p className="text-gray-600">
                                                        <a
                                                          href={
                                                            stakeholder.facebook.startsWith(
                                                              "http"
                                                            )
                                                              ? stakeholder.facebook
                                                              : `https://${stakeholder.facebook}`
                                                          }
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                          <Facebook
                                                            size={14}
                                                            className="mr-1"
                                                          />
                                                          {stakeholder.facebook.replace(
                                                            /^https?:\/\/(www\.)?/,
                                                            ""
                                                          )}
                                                        </a>
                                                      </p>
                                                    )}
                                                    {stakeholder.linkedIn && (
                                                      <p className="text-gray-600">
                                                        <a
                                                          href={
                                                            stakeholder.linkedIn.startsWith(
                                                              "http"
                                                            )
                                                              ? stakeholder.linkedIn
                                                              : `https://${stakeholder.linkedIn}`
                                                          }
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                          <Linkedin
                                                            size={14}
                                                            className="mr-1"
                                                          />
                                                          {stakeholder.linkedIn.replace(
                                                            /^https?:\/\/(www\.)?/,
                                                            ""
                                                          )}
                                                        </a>
                                                      </p>
                                                    )}
                                                    {!stakeholder.facebook &&
                                                      !stakeholder.linkedIn && (
                                                        <p className="text-gray-500 italic">
                                                          No social media links
                                                          available
                                                        </p>
                                                      )}
                                                  </div>
                                                </div>

                                                {/* Date Information */}
                                                {(stakeholder.createdAt ||
                                                  stakeholder.lastUpdated ||
                                                  stakeholderData.dateJoined) && (
                                                  <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold flex items-center text-gray-700">
                                                      <Clock
                                                        size={16}
                                                        className="mr-1 text-gray-400"
                                                      />{" "}
                                                      Date Information
                                                    </h4>
                                                    <div className="pl-6 space-y-1 text-sm">
                                                      {stakeholderData.dateJoined && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">
                                                            Date Joined:
                                                          </span>{" "}
                                                          {formatDate(
                                                            stakeholderData.dateJoined
                                                          )}
                                                        </p>
                                                      )}
                                                      {stakeholder.createdAt && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">
                                                            Created:
                                                          </span>{" "}
                                                          {formatDateTime(
                                                            stakeholder.createdAt
                                                          )}
                                                        </p>
                                                      )}
                                                      {stakeholder.lastUpdated && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">
                                                            Last Updated:
                                                          </span>{" "}
                                                          {formatDateTime(
                                                            stakeholder.lastUpdated
                                                          )}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Physical Location Map (if available) */}
                                            {stakeholder.locationLat &&
                                              stakeholder.locationLng && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                  <h4 className="text-sm font-semibold flex items-center text-gray-700 mb-2">
                                                    <MapPin
                                                      size={16}
                                                      className="mr-1 text-blue-500"
                                                    />{" "}
                                                    Physical Location
                                                  </h4>
                                                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300">
                                                    <iframe
                                                      title={`${stakeholder.name}'s location`}
                                                      width="100%"
                                                      height="100%"
                                                      frameBorder="0"
                                                      src={`https://maps.google.com/maps?q=${stakeholder.locationLat},${stakeholder.locationLng}&z=15&output=embed`}
                                                    />
                                                  </div>
                                                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                                                    <p>
                                                      {stakeholder.locationName ||
                                                        "Office Location"}
                                                    </p>
                                                    <p>
                                                      Coordinates:{" "}
                                                      {stakeholder.locationLat.toFixed(
                                                        6
                                                      )}
                                                      ,{" "}
                                                      {stakeholder.locationLng.toFixed(
                                                        6
                                                      )}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                          <Users size={24} />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No stakeholders
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by adding a new stakeholder.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              resetStakeholderForm();
                              setShowStakeholderForm(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Plus size={16} className="-ml-1 mr-2" />
                            Add Stakeholder
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg">
              <div className="px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Stakeholder Location
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-0">
                <StakeholderLocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    stakeholderFormData.locationLat &&
                    stakeholderFormData.locationLng
                      ? {
                          lat: stakeholderFormData.locationLat,
                          lng: stakeholderFormData.locationLng,
                          name: stakeholderFormData.locationName,
                        }
                      : null
                  }
                />
              </div>

              {/* Help text overlay */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md">
                <p className="text-sm text-gray-700 font-medium">
                  Click on the map to select the stakeholder's location
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/30 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                Delete {deleteModal.role}
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete <span className="font-semibold">{deleteModal.stakeholderName}</span>?
              </p>
              <p className="text-sm text-gray-500">
                This action will permanently remove this stakeholder and cannot be undone.
                All associated data will be deleted.
              </p>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteModal({...deleteModal, isOpen: false})}
                disabled={deleteModal.isDeleting}
                className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 
                ${deleteModal.isDeleting ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStakeholder}
                disabled={deleteModal.isDeleting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                text-white bg-red-600 ${deleteModal.isDeleting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors
                inline-flex items-center`}
              >
                {deleteModal.isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
