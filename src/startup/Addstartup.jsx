import { useRef, useState, useEffect } from "react";
import Startupmap from "../3dmap/Startupmap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCallback } from "react";
export default function Addstartup() {
  const mapInstanceRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    contactEmail: "",
    industry: "",
    foundedDate: null,
    facebook: "",
    instagram: "",
    linkedIn: "",
    twitter: "",
    website: "",
    phoneNumber: "",
    region: "",
    city: "",
    barangay: "",
    numberOfEmployees: "",
    postalCode: "",
    typeOfCompany: "",
    locationLat: null, // Latitude of the selected location
    locationLng: null,
  });

  const [regions, setRegions] = useState([]);
  const [regionCode, setRegionCode] = useState(null);
  const [cities, setCities] = useState([]);
  const [cityCode, setCityCode] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // State to toggle sidebar visibility

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("https://psgc.gitlab.io/api/regions/");
        const data = await response.json();
        if (response.ok) {
          const sortedRegions = data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setRegions(sortedRegions);
        } else {
          console.log("Error fetching Regions: ", data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/regions/${regionCode}/cities/`
        );
        const data = await response.json();
        if (response.ok) {
          const sortedCities = data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setCities(sortedCities);
        } else {
          console.log("Error fetching Cities: ", data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (regionCode) fetchCities();
  }, [regionCode]);

  useEffect(() => {
    if (cityCode === null) {
      return;
    }
    const fetchBarangays = async () => {
      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/cities/${cityCode}/barangays`
        );
        const data = await response.json();
        if (response.ok) {
          const sortedCities = data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setBarangays(sortedCities);
        } else {
          console.log("Error fetching Cities: ", data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBarangays();
  }, [cityCode]);

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

  const handleMapClick = useCallback((lat, lng) => {
    console.log("Latitude:", lat, "Longitude:", lng);
    setFormData((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
    }));
    setIsSidebarVisible(true);
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8080/startups", {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(formData),
        credentials:'include'
      });
      const data = await response.json();
      if(response.ok){
        console.log("Startup added successfully: ",data);
      }else{
        console.log("Error adding startup: ",data);
      }
    } catch (e) {
        console.log(e);
    }
  };

  return (
    <div className="flex">
      {isSidebarVisible && (
        <div className="sidebar h-screen w-[30%] bg-[#ffffff] p-4 overflow-y-auto">
          <input
            type="text"
            name="companyName"
            placeholder="Startup name"
            value={formData.companyName}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="companyDescription"
            placeholder="Description"
            value={formData.companyDescription}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="email"
            name="contactEmail"
            placeholder="Contact email"
            value={formData.contactEmail}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <button
            onClick={() => setIsSidebarVisible(false)} // Hide the sidebar
            className="btn bg-blue-500 text-white hover:bg-blue-600 mt-4 w-full py-2 rounded-lg"
          >
            Set Company Location
          </button>
          {formData.locationLat && (
            <p className="text-sm text-gray-600 mt-2">
              Selected Location: ({formData.locationLat.toFixed(4)},{" "}
              {formData.locationLng.toFixed(4)})
            </p>
          )}

          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="select bg-gray-300 text-black border-gray-200"
          >
            <option value="">Industry</option>
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

          <div className="relative max-w-sm mt-4">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Founded Date
            </label>
            <DatePicker
              id="date"
              name="foundedDate"
              selected={formData.foundedDate}
              onChange={handleDateChange}
              placeholderText="Select date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>

          <input
            type="text"
            name="facebook"
            placeholder="Facebook"
            value={formData.facebook}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="instagram"
            placeholder="Instagram"
            value={formData.instagram}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="linkedIn"
            placeholder="LinkedIn"
            value={formData.linkedIn}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="twitter"
            placeholder="Twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={formData.website}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />

          <select
            name="region"
            value={formData.region}
            onChange={(e) => {
              handleChange(e);
              setRegionCode(e.target.value);
            }}
            className="select bg-gray-300 text-black border-gray-200"
          >
            <option value="">region</option>
            {regions.map((pro) => (
              <option key={pro.code} value={pro.code}>
                {pro.regionName}
              </option>
            ))}
          </select>
          <select
            name="city"
            value={formData.city}
            onChange={(e) => {
              handleChange(e);
              setCityCode(e.target.value);
            }}
            className="select bg-gray-300 text-black border-gray-200"
          >
            <option value="">Cities</option>
            {cities.map((mun) => (
              <option key={mun.code} value={mun.code}>
                {mun.name}
              </option>
            ))}
          </select>

          <select
            name="barangay"
            value={formData.barangay}
            onChange={handleChange}
            className="select bg-gray-300 text-black border-gray-200"
          >
            <option value="">Barangay</option>
            {barangays.map((bar) => (
              <option key={bar.code} value={bar.name}>
                {bar.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="numberOfEmployees"
            placeholder="Number of employees"
            value={formData.numberOfEmployees}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal code"
            value={formData.postalCode}
            onChange={handleChange}
            className="input bg-gray-300 text-black border-gray-200"
          />
          <select
            name="typeOfCompany"
            value={formData.companyType}
            onChange={handleChange}
            className="select bg-gray-300 text-black border-gray-200"
          >
            <option value="">Type of Company</option>
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
          <button className="btn btn-active btn-primary w-full"
            onClick={handleSubmit}
          >Submit startup</button>
        </div>
      )}
      <Startupmap mapInstanceRef={mapInstanceRef} onMapClick={handleMapClick} />
    </div>
  );
}
