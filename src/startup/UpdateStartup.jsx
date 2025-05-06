import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Save, X, Building, Mail, Phone, Globe, MapPin, 
  Calendar, Users, Briefcase, Facebook, Twitter, Instagram, Linkedin
} from "lucide-react";

export default function UpdateStartup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
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
    locationLat: "",
    locationLng: "",
    locationName: "",
    ...initialStartupData
  });
  
  const [loading, setLoading] = useState(!initialStartupData.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    if (formData.foundedDate) {
      try {
        const date = new Date(formData.foundedDate);
        if (!isNaN(date.getTime())) {
          setFormData(prev => ({
            ...prev,
            foundedDate: date.toISOString().split('T')[0]
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
            formattedData.foundedDate = date.toISOString().split('T')[0];
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderFormSection = () => {
    switch(activeSection) {
      case 'basic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                  required
                  className="block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description *
              </label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription || ""}
                onChange={handleInputChange}
                required
                rows={4}
                className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry || ""}
                  onChange={handleInputChange}
                  required
                  className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="typeOfCompany" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Company *
              </label>
              <select
                id="typeOfCompany"
                name="typeOfCompany"
                value={formData.typeOfCompany || ""}
                onChange={handleInputChange}
                required
                className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              >
                <option value="">Select company type</option>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Non-profit">Non-profit</option>
                <option value="Cooperative">Cooperative</option>
                <option value="Partnership">Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
            </div>

            <div>
              <label htmlFor="foundedDate" className="block text-sm font-medium text-gray-700 mb-1">
                Founded Date *
              </label>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  id="foundedDate"
                  name="foundedDate"
                  value={formData.foundedDate || ""}
                  onChange={handleInputChange}
                  required
                  className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Employees
              </label>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees || ""}
                  onChange={handleInputChange}
                  className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={handleInputChange}
                  required
                  className="block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="facebook" className="block  text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <div className="flex items-center">
                <Facebook className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  value={formData.facebook || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="https://facebook.com/yourcompany"
                />
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <div className="flex items-center">
                <Twitter className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <div className="flex items-center">
                <Instagram className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="https://instagram.com/yourcompany"
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <div className="flex items-center">
                <Linkedin className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  value={formData.linkedIn || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="locationName"
                  name="locationName"
                  value={formData.locationName || ""}
                  onChange={handleInputChange}
                  className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                Province/State
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="locationLat" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="locationLat"
                name="locationLat"
                value={formData.locationLat || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="locationLng" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="locationLng"
                name="locationLng"
                value={formData.locationLng || ""}
                onChange={handleInputChange}
                className="block w-full rounded-md text-gray-500 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              />
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
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
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
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

          <form onSubmit={handleSubmit}>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  type="button"
                  onClick={() => setActiveSection("basic")}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeSection === "basic"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Basic Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("contact")}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeSection === "contact"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Contact & Social
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("location")}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeSection === "location"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Location
                </button>
              </nav>
            </div>

            <div className="p-6">
              {renderFormSection()}

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => navigate("/startup-dashboard")}
                  disabled={submitting}
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}