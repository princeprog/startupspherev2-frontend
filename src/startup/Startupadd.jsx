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
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupadd() {
  const [selectedTab, setSelectedTab] = useState("Company Information");
  const [startupId, setStartupId] = useState(null);
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const navigate = useNavigate();
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
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Invalid file type. Please upload a .csv file.");
        return;
      }
      setUploadedFile(file);
      toast.success("CSV file selected successfully!");
    } else {
      toast.error("No file selected.");
    }
  };

  const handleFileSubmit = async () => {
    if (!uploadedFile) {
      toast.error("Please select a CSV file.");
      return;
    }
    if (!startupId) {
      toast.error("Please complete the startup form and submit it first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const response = await fetch(
        `http://localhost:8080/startups/${startupId}/upload-csv`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("File uploaded successfully!");
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to upload file: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading the file.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    if (!mapContainerRef.current || mapInstanceRef.current) {
      return;
    }
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9842, 14.5995],
      zoom: 12,
    });
    mapInstanceRef.current = map;
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
        .then((response) => response.json())
        .then((data) => {
          const locationName =
            data.features[0]?.place_name || "Unknown Location";
          handleMapClick(lat, lng, locationName);
        })
        .catch((error) =>
          console.error("Failed to fetch location name:", error)
        );
    });
    return map;
  };

  useEffect(() => {
    if (selectedTab === "Location Info" && mapContainerRef.current) {
      initializeMap();
    }
  }, [selectedTab]);

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
    return "";
  };

  const validateContactInformation = () => {
    if (!formData.phoneNumber) return toast.error("Phone Number is required.");
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
      const response = await fetch("http://localhost:8080/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Startup added successfully: ", data);
        const startupId = data.id;
        setStartupId(startupId);
        setUploadedFile(null);

        if (uploadedImage) {
          const imageFormData = new FormData();
          imageFormData.append("photo", uploadedImage);
          try {
            const imageResponse = await fetch(
              `http://localhost:8080/startups/${startupId}/upload-photo`,
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

        const emailResponse = await fetch(
          "http://localhost:8080/startups/send-verification-email",
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
          setVerificationModal(true);
        } else {
          if (emailResponseData.error.includes("Email is already verified")) {
            toast.info("Email is already verified. Proceeding to upload data.");
            setSelectedTab("Upload Data");
          } else {
            toast.error(
              `Failed to send verification email: ${
                emailResponseData.error || "Unknown error"
              }`
            );
          }
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

  const downloadCsvTemplate = () => {
    const csvContent =
      "revenue,annualRevenue,paidUpCapital,numberOfActiveStartups,numberOfNewStartupsThisYear,averageStartupGrowthRate,startupSurvivalRate,totalStartupFundingReceived,averageFundingPerStartup,numberOfFundingRounds,numberOfStartupsWithForeignInvestment,amountOfGovernmentGrantsOrSubsidiesReceived,numberOfStartupIncubatorsOrAccelerators,numberOfStartupsInIncubationPrograms,numberOfMentorsOrAdvisorsInvolved,publicPrivatePartnershipsInvolvingStartups\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "startup_data_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((response) => response.json())
      .then((data) => setRegions(data))
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);

  useEffect(() => {
    if (formData.region) {
      fetch(`https://psgc.gitlab.io/api/regions/${formData.region}/provinces/`)
        .then((response) => response.json())
        .then((data) => setProvinces(data))
        .catch((error) => console.error("Error fetching provinces:", error));
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [formData.region]);

  useEffect(() => {
    if (formData.province) {
      fetch(
        `https://psgc.gitlab.io/api/provinces/${formData.province}/cities-municipalities/`
      )
        .then((response) => response.json())
        .then((data) => setCities(data))
        .catch((error) => console.error("Error fetching cities:", error));
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.city) {
      fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${formData.city}/barangays/`
      )
        .then((response) => response.json())
        .then((data) => setBarangays(data))
        .catch((error) => console.error("Error fetching barangays:", error));
    } else {
      setBarangays([]);
    }
  }, [formData.city]);

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800 relative">
      <div className="bg-[#1D3557] px-10 py-6 text-white">
        <h1 className="text-3xl font-semibold">Add Startup</h1>
      </div>

      <div className="bg-white shadow-md rounded-md p-8 w-4/5 mx-auto mt-8">
        <div className="flex border-b mb-8">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`w-1/5 text-center py-2 cursor-pointer text-sm font-medium ${
                selectedTab === tab
                  ? "text-[#1D3557] border-b-2 border-[#1D3557]"
                  : "text-gray-500"
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
                Company Name
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
                Company Description
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
                Founded Date
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
                Number of Employees
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
                Type of Company
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
              <label className="block mb-1 text-sm font-medium">Industry</label>
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
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  +639
                </span>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter 9-digit number (e.g., 123456789)"
                  className="w-full border border-gray-300 rounded-md px-12 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.phoneNumber.replace("+639", "")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 9) {
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: `+639 ${value}`,
                      }));
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Format: +639 followed by 9 digits (e.g., +639123456789)
              </p>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Contact Email
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
              <label className="block mb-1 text-sm font-medium">Website</label>
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
                value={formData.region}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
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
                value={formData.province}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    city: "",
                    barangay: "",
                  }));
                }}
                disabled={!formData.region}
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                City/Municipality
              </label>
              <select
                name="city"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.city}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    barangay: "",
                  }));
                }}
                disabled={!formData.province}
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
                value={formData.barangay}
                onChange={handleChange}
                disabled={!formData.city}
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
                <label className="block mb-1 text-sm font-medium">Street</label>
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
                  Postal Code
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
              <label className="block mb-1 text-sm font-medium">Facebook</label>
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
              <label className="block mb-1 text-sm font-medium">LinkedIn</label>
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
                Funding Stage
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
                Operating Hours
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
                Business Activity
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
          <div>
            <div ref={geocoderContainerRef} className="mb-4" />
            <div ref={mapContainerRef} className="w-full h-96 rounded-md" />
            <div className="mt-4">
              <p>Selected Location: {formData.locationName || "None"}</p>
              <p>
                Latitude: {formData.locationLat || "N/A"}, Longitude:{" "}
                {formData.locationLng || "N/A"}
              </p>
            </div>
            <div className="flex justify-between mt-4">
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
                Submit
                {isSubmitting && (
                  <span className="loading loading-spinner text-primary"></span>
                )}
              </button>
            </div>
          </div>
        )}
        {selectedTab === "Upload Data" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Upload Startup Data (CSV)
            </h2>
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">
                CSV Upload Instructions
              </h3>
              <p className="text-sm text-gray-600">
                Please upload a CSV file containing your startup's data. The
                file must include the following columns:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-2">
                <li>
                  <strong>revenue</strong>: Total revenue of the startup.
                </li>
                <li>
                  <strong>annualRevenue</strong>: Annual revenue of the startup.
                </li>
                <li>
                  <strong>paidUpCapital</strong>: Paid-up capital of the
                  startup.
                </li>
                <li>
                  <strong>numberOfActiveStartups</strong>: Number of active
                  startups.
                </li>
                <li>
                  <strong>numberOfNewStartupsThisYear</strong>: Number of new
                  startups this year.
                </li>
                <li>
                  <strong>averageStartupGrowthRate</strong>: Average growth rate
                  of startups (as a percentage).
                </li>
                <li>
                  <strong>startupSurvivalRate</strong>: Survival rate of
                  startups (as a percentage).
                </li>
                <li>
                  <strong>totalStartupFundingReceived</strong>: Total funding
                  received by startups.
                </li>
                <li>
                  <strong>averageFundingPerStartup</strong>: Average funding per
                  startup.
                </li>
                <li>
                  <strong>numberOfFundingRounds</strong>: Number of funding
                  rounds.
                </li>
                <li>
                  <strong>numberOfStartupsWithForeignInvestment</strong>: Number
                  of startups with foreign investment.
                </li>
                <li>
                  <strong>amountOfGovernmentGrantsOrSubsidiesReceived</strong>:
                  Amount of government grants or subsidies received.
                </li>
                <li>
                  <strong>numberOfStartupIncubatorsOrAccelerators</strong>:
                  Number of startup incubators or accelerators.
                </li>
                <li>
                  <strong>numberOfStartupsInIncubationPrograms</strong>: Number
                  of startups in incubation programs.
                </li>
                <li>
                  <strong>numberOfMentorsOrAdvisorsInvolved</strong>: Number of
                  mentors or advisors involved.
                </li>
                <li>
                  <strong>publicPrivatePartnershipsInvolvingStartups</strong>:
                  Number of public-private partnerships involving startups.
                </li>
              </ul>
              <button
                type="button"
                className="text-[#1D3557] underline text-sm mt-2"
                onClick={downloadCsvTemplate}
              >
                Download CSV Template
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Privacy Policy</h3>
              <p className="text-sm text-gray-600">
                Your data is important to us. The uploaded CSV file will be
                securely stored and used solely for the purpose of analyzing and
                displaying your startup's metrics. We implement
                industry-standard security measures to protect your data and
                will not share it with third parties without your consent. For
                more details, please review our full{" "}
                <a href="/privacy-policy" className="text-[#1D3557] underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-4 w-full border border-gray-300 rounded-md px-4 py-2"
            />
            <div className="flex justify-between mt-4">
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
                onClick={handleFileSubmit}
              >
                Upload CSV
              </button>
              <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                onClick={() => navigate("/startup-dashboard")} // Navigate to /startup-dashboard
              >
                Skip
              </button>
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

      <ToastContainer />
    </div>
  );
}
