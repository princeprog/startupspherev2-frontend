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

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";
export default function Startupadd() {
  const [selectedTab, setSelectedTab] = useState("Company Information"); // State to track the selected tab
  
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
    country: "",
    postalCode: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedIn: "",
    locationLat: null,
    locationLng: null,
    locationName: "",
  });

  const [verificationModal , setVerificationMOdal] = useState(false)

  const [error, setError] = useState("");

  const tabs = [
    "Company Information",
    "Contact Information",
    "Address Information",
    "Social Media Links",
    "Location Info",
  ];

  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

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
      foundedDate: date,
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
      return; // Prevent re-initialization
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Ensure this is a valid DOM element
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9842, 14.5995], // Default center (Manila, Philippines)
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
    if (!formData.companyDescription) return toast.error("Company Description is required.");
    if (!formData.foundedDate) return toast.error("Founded Date is required.");
    if (!formData.numberOfEmployees) return toast.error("Number of Employees is required.");
    if (!formData.typeOfCompany) return toast.error("Type of Company is required.");
    if (!formData.industry) return toast.error("Industry is required.");
    return ""; // No errors
  };

  const validateContactInformation = () => {
    if (!formData.phoneNumber) return toast.error("Phone Number is required.");
    if (!formData.contactEmail) return toast.error("Contact Email is required.");
    if (!formData.website) return toast.error("Website is required.");
    return ""; // No errors
  };

  const validateAddressInformation = () => {
    if (!formData.streetAddress) return toast.error("Street Address is required.");
    if (!formData.city) return toast.error("City is required.");
    if (!formData.province) return toast.error("Province is required.");
    if (!formData.country) return toast.error("Country is required.");
    if (!formData.postalCode) return toast.error("Postal Code is required.");
    return ""; // No errors
  };

  const validateSocialMediaLinks = () => {
    if (!formData.facebook) return toast.error("Facebook URL is required.");
    if (!formData.linkedIn) return toast.error("LinkedIn URL is required.");
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

  const handleSubmit = async() =>{
    try {
        const response = await fetch('http://localhost:8080/startups',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(formData),
            credentials:'include'
        })

        const data = await response.json();
        if(response.ok){
            console.log("Check your company email for verifation: ",data);
            setVerificationMOdal(true)
        }else{
            console.log("Error adding a startup: ",data);
        }
    } catch (error) {
        console.log(error)
    }
  }

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
              onClick={() => setSelectedTab(tab)}
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
                selected={formData.foundedDate}
                onChange={handleDateChange}
                placeholderText="Select founded date"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
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
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone number"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                placeholder="Contact email"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
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
                className="w-full border border-gray-300 rounded-md px-4 py-2"
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
              <label className="block mb-1 text-sm font-medium">
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.streetAddress}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Province</label>
              <input
                type="text"
                name="province"
                placeholder="Province"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.province}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Country</label>
              <input
                type="text"
                name="country"
                placeholder="Country"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.country}
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
                placeholder="Postal Code"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.postalCode}
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
        {selectedTab === "Location Info" && (
          <div className="grid gap-4">
            <div ref={geocoderContainerRef} className="mb-4" />
            <div
              ref={mapContainerRef}
              className="w-full h-96 rounded-md border border-gray-300"
            />
            {formData.locationName && (
              <p className="text-sm text-gray-600">
                Selected Location: {formData.locationName}
              </p>
            )}
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
                className="bg-green-500 text-white px-6 py-2 rounded-md"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000} // 3 seconds
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {verificationModal && <Verification setVerificationMOdal={setVerificationMOdal}/>}
    </div>
  );
}
