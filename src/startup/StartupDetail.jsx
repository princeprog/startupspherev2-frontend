import React, { useState, useEffect } from "react";
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
  Clock
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
    role: "Mentor", // Default role
    status: "Active" // Default status
  });

  // New state for expanded stakeholders
  const [expandedStakeholders, setExpandedStakeholders] = useState({});

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
      console.log(data)
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

  // Add new stakeholder
  const handleAddStakeholder = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Extract stakeholder data (excluding role and status)
      const { role, status, ...stakeholderData } = stakeholderFormData;
      
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

      if (!stakeholderResponse.ok) {
        const errorData = await stakeholderResponse.json();
        throw new Error(errorData.message || "Error creating stakeholder");
      }

      // Step 3: Get the created stakeholder ID
      const newStakeholder = await stakeholderResponse.json();
      const stakeholderId = newStakeholder.id;

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
            status: status
          }),
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(errorData.message || "Error associating stakeholder with startup");
      }

      // Step 5: Refresh the stakeholders list
      await fetchStakeholders();
      setShowStakeholderForm(false);
      resetStakeholderForm();
      showNotification("Stakeholder added successfully!", "success");
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      showNotification("Failed to add stakeholder: " + error.message, "error");
    }
  };

  // Update stakeholder
  const handleUpdateStakeholder = async (e) => {
    e.preventDefault();

    // Get the correct stakeholder ID depending on structure
    const stakeholderId = editingStakeholder.stakeholder 
      ? editingStakeholder.stakeholder.id 
      : editingStakeholder.id;
      
    // Extract role and status
    const { role, status, ...stakeholderData } = stakeholderFormData;

    try {
      // Step 1: Update the stakeholder
      const stakeholderResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/stakeholder/${stakeholderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(stakeholderData),
        }
      );

      if (!stakeholderResponse.ok) {
        const errorData = await stakeholderResponse.json();
        throw new Error(errorData.message || "Error updating stakeholder");
      }

      // Step 2: Update the startup-stakeholder association
      // This assumes there's an association ID or that the API can find the association
      // based on startupId and stakeholderId
      const associationResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholder/startup/${id}/stakeholder/${stakeholderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role: role,
            status: status
          }),
        }
      );

      if (!associationResponse.ok) {
        const errorData = await associationResponse.json();
        throw new Error(errorData.message || "Error updating stakeholder association");
      }

      await fetchStakeholders();
      setShowStakeholderForm(false);
      setEditingStakeholder(null);
      resetStakeholderForm();
      showNotification("Stakeholder updated successfully!", "success");
    } catch (error) {
      console.error("Error updating stakeholder:", error);
      showNotification("Failed to update stakeholder: " + error.message, "error");
    }
  };

  // Delete stakeholder
  const handleDeleteStakeholder = async (stakeholderId) => {
    if (!window.confirm("Are you sure you want to delete this stakeholder?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholders/stakeholders/${stakeholderId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting stakeholder");
      }

      await fetchStakeholders();
      showNotification("Stakeholder deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting stakeholder:", error);
      showNotification(
        "Failed to delete stakeholder: " + error.message,
        "error"
      );
    }
  };

  // Helper function to edit stakeholder
  const startEditingStakeholder = (stakeholderData) => {
    // Handle both direct stakeholder objects and nested structures
    const stakeholder = stakeholderData.stakeholder || stakeholderData;

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
      status: stakeholderData.status || "Active"
    });
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
      status: "Active"
    });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
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
                              {editingStakeholder ? "Edit Stakeholder" : "Add New Stakeholder"}
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
                          onSubmit={editingStakeholder ? handleUpdateStakeholder : handleAddStakeholder}
                          className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]"
                        >
                          <div className="space-y-8">
                            {/* Basic Information */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <User size={18} className="mr-2 text-blue-600" />
                                Basic Information
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="col-span-1">
                                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="name"
                                    required
                                    value={stakeholderFormData.name}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, name: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="John Smith"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    id="email"
                                    required
                                    value={stakeholderFormData.email}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, email: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="john.smith@example.com"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                  </label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Phone size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                      type="text"
                                      id="phoneNumber"
                                      value={stakeholderFormData.phoneNumber}
                                      onChange={(e) => setStakeholderFormData({...stakeholderFormData, phoneNumber: e.target.value})}
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="+63 919 123 4567"
                                    />
                                  </div>
                                </div>
                              </div>
                            </fieldset>

                            {/* Address Information */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <MapPin size={18} className="mr-2 text-blue-600" />
                                Address Information
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="col-span-2">
                                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                  </label>
                                  <input
                                    type="text"
                                    id="street"
                                    value={stakeholderFormData.street}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, street: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="123 Main Street"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
                                    Barangay
                                  </label>
                                  <input
                                    type="text"
                                    id="barangay"
                                    value={stakeholderFormData.barangay}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, barangay: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="Poblacion"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City / Municipality
                                  </label>
                                  <input
                                    type="text"
                                    id="city"
                                    value={stakeholderFormData.city}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, city: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="Makati City"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                                    Region
                                  </label>
                                  <select
                                    id="region"
                                    value={stakeholderFormData.region}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, region: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                  >
                                    <option value="">Select a region</option>
                                    <option value="Metro Manila">Metro Manila (NCR)</option>
                                    <option value="Ilocos Region">Ilocos Region (Region I)</option>
                                    <option value="Cagayan Valley">Cagayan Valley (Region II)</option>
                                    <option value="Central Luzon">Central Luzon (Region III)</option>
                                    <option value="CALABARZON">CALABARZON (Region IV-A)</option>
                                    <option value="MIMAROPA">MIMAROPA (Region IV-B)</option>
                                    <option value="Bicol Region">Bicol Region (Region V)</option>
                                    <option value="Western Visayas">Western Visayas (Region VI)</option>
                                    <option value="Central Visayas">Central Visayas (Region VII)</option>
                                    <option value="Eastern Visayas">Eastern Visayas (Region VIII)</option>
                                    <option value="Zamboanga Peninsula">Zamboanga Peninsula (Region IX)</option>
                                    <option value="Northern Mindanao">Northern Mindanao (Region X)</option>
                                    <option value="Davao Region">Davao Region (Region XI)</option>
                                    <option value="SOCCSKSARGEN">SOCCSKSARGEN (Region XII)</option>
                                    <option value="Caraga">Caraga (Region XIII)</option>
                                    <option value="CAR">Cordillera Administrative Region (CAR)</option>
                                    <option value="BARMM">Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)</option>
                                  </select>
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code
                                  </label>
                                  <input
                                    type="text"
                                    id="postalCode"
                                    value={stakeholderFormData.postalCode}
                                    onChange={(e) => setStakeholderFormData({...stakeholderFormData, postalCode: e.target.value})}
                                    className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                    placeholder="1200"
                                  />
                                </div>
                              </div>
                            </fieldset>

                            {/* Social Media */}
                            <fieldset>
                              <legend className="text-base font-medium text-gray-700 mb-4 flex items-center">
                                <Globe size={18} className="mr-2 text-blue-600" /> 
                                Social Media
                              </legend>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="col-span-1">
                                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                    Facebook
                                  </label>
                                  <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Facebook size={16} className="text-blue-600" />
                                    </div>
                                    <input
                                      type="text"
                                      id="facebook"
                                      value={stakeholderFormData.facebook}
                                      onChange={(e) => setStakeholderFormData({...stakeholderFormData, facebook: e.target.value})}
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="facebook.com/profile"
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">Full URL or username</p>
                                </div>
                                
                                <div className="col-span-1">
                                  <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-1">
                                    LinkedIn
                                  </label>
                                  <div className="relative rounded-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Linkedin size={16} className="text-blue-700" />
                                    </div>
                                    <input
                                      type="text"
                                      id="linkedIn"
                                      value={stakeholderFormData.linkedIn}
                                      onChange={(e) => setStakeholderFormData({...stakeholderFormData, linkedIn: e.target.value})}
                                      className="block text-gray-800 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                                      placeholder="linkedin.com/in/profile"
                                    />
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">Full URL or username</p>
                                </div>
                              </div>
                            </fieldset>
                          </div>

                          {/* Form Buttons */}
                          <div className="mt-8 border-t border-gray-200 pt-5">
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowStakeholderForm(false);
                                  setEditingStakeholder(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                {editingStakeholder ? "Save Changes" : "Add Stakeholder"}
                              </button>
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Phone Number
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stakeholders.map((stakeholderData) => {
                                // Handle both nested and direct stakeholder objects
                                const stakeholder = stakeholderData.stakeholder || stakeholderData;
                                const stakeholderId = stakeholderData.id;
                                
                                if (!stakeholder) return null; // Skip if stakeholder object is undefined
                                
                                return (
                                  <React.Fragment key={stakeholderId}>
                                    <tr className={`hover:bg-gray-50 ${expandedStakeholders[stakeholderId] ? "bg-blue-50/40" : ""}`}>
                                      <td className="px-3 py-4 whitespace-nowrap">
                                        <button
                                          onClick={() => toggleStakeholderExpand(stakeholderId)}
                                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                          {expandedStakeholders[stakeholderId] ? 
                                            <ChevronUp size={18} /> : 
                                            <ChevronDown size={18} />
                                          }
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
                                              <div className="text-xs text-gray-500">{stakeholderData.role}</div>
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
                                            onClick={() => startEditingStakeholder(stakeholderData)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                          >
                                            <Edit size={16} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteStakeholder(stakeholderId)}
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
                                                  <MapPin size={16} className="mr-1 text-gray-400" /> Address
                                                </h4>
                                                <div className="pl-6 space-y-1 text-sm">
                                                  {stakeholder.street && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">Street:</span> {stakeholder.street}
                                                    </p>
                                                  )}
                                                  {stakeholder.barangay && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">Barangay:</span> {stakeholder.barangay}
                                                    </p>
                                                  )}
                                                  {stakeholder.city && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">City:</span> {stakeholder.city}
                                                    </p>
                                                  )}
                                                  {stakeholder.region && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">Region:</span> {stakeholder.region}
                                                    </p>
                                                  )}
                                                  {stakeholder.postalCode && (
                                                    <p className="text-gray-600">
                                                      <span className="font-medium">Postal Code:</span> {stakeholder.postalCode}
                                                    </p>
                                                  )}
                                                  {!stakeholder.street && !stakeholder.barangay && !stakeholder.city && 
                                                  !stakeholder.region && !stakeholder.postalCode && (
                                                    <p className="text-gray-500 italic">No address information available</p>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Social Media and Date Information */}
                                              <div className="space-y-4">
                                                {/* Social Media Links */}
                                                <div className="space-y-2">
                                                  <h4 className="text-sm font-semibold flex items-center text-gray-700">
                                                    <Link size={16} className="mr-1 text-gray-400" /> Social Media
                                                  </h4>
                                                  <div className="pl-6 space-y-1 text-sm">
                                                    {stakeholder.facebook && (
                                                      <p className="text-gray-600">
                                                        <a href={stakeholder.facebook.startsWith('http') ? stakeholder.facebook : `https://${stakeholder.facebook}`} 
                                                          target="_blank" rel="noopener noreferrer"
                                                          className="text-blue-600 hover:underline flex items-center">
                                                          <Facebook size={14} className="mr-1" /> 
                                                          {stakeholder.facebook.replace(/^https?:\/\/(www\.)?/, '')}
                                                        </a>
                                                      </p>
                                                    )}
                                                    {stakeholder.linkedIn && (
                                                      <p className="text-gray-600">
                                                        <a href={stakeholder.linkedIn.startsWith('http') ? stakeholder.linkedIn : `https://${stakeholder.linkedIn}`} 
                                                          target="_blank" rel="noopener noreferrer"
                                                          className="text-blue-600 hover:underline flex items-center">
                                                          <Linkedin size={14} className="mr-1" /> 
                                                          {stakeholder.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}
                                                        </a>
                                                      </p>
                                                    )}
                                                    {!stakeholder.facebook && !stakeholder.linkedIn && (
                                                      <p className="text-gray-500 italic">No social media links available</p>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Date Information */}
                                                {(stakeholder.createdAt || stakeholder.lastUpdated || stakeholderData.dateJoined) && (
                                                  <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold flex items-center text-gray-700">
                                                      <Clock size={16} className="mr-1 text-gray-400" /> Date Information
                                                    </h4>
                                                    <div className="pl-6 space-y-1 text-sm">
                                                      {stakeholderData.dateJoined && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">Date Joined:</span> {formatDate(stakeholderData.dateJoined)}
                                                        </p>
                                                      )}
                                                      {stakeholder.createdAt && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">Created:</span> {formatDateTime(stakeholder.createdAt)}
                                                        </p>
                                                      )}
                                                      {stakeholder.lastUpdated && (
                                                        <p className="text-gray-600">
                                                          <span className="font-medium">Last Updated:</span> {formatDateTime(stakeholder.lastUpdated)}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
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
    </div>
  );
}
