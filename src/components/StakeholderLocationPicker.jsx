import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import debounce from 'lodash/debounce';

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function StakeholderLocationPicker({ onLocationSelect, initialLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation ? [initialLocation.lng, initialLocation.lat] : [123.8854, 10.3157], // Default: Cebu City
      zoom: initialLocation ? 15 : 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    mapRef.current = map;

    // Add marker if initial location exists
    if (initialLocation) {
      const marker = new mapboxgl.Marker({ color: '#3B82F6', draggable: true })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(map);
      
      // Update location when marker is dragged
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onLocationSelect({ 
          lat: lngLat.lat, 
          lng: lngLat.lng,
          name: initialLocation.name || `Selected location (${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)})`
        });
      });
      
      markerRef.current = marker;
    }

    // Click handler to set marker
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // If there's already a marker, update its position
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        // Create a new marker
        markerRef.current = new mapboxgl.Marker({ color: '#3B82F6', draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);
        
        // Add dragend event listener
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current.getLngLat();
          onLocationSelect({ 
            lat: lngLat.lat, 
            lng: lngLat.lng,
            name: `Selected location (${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)})`
          });
        });
      }

      // Get location name using reverse geocoding
      reverseGeocode(lng, lat).then(placeName => {
        onLocationSelect({ 
          lat, 
          lng, 
          name: placeName || `Selected location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        });
      });
    });

    return () => map.remove();
  }, [initialLocation, onLocationSelect]);

  // Reverse geocoding to get place name
  const reverseGeocode = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=en`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  // Search for locations
  const searchLocations = debounce(async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=PH&proximity=123.8854,10.3157&limit=5`
      );
      
      const data = await response.json();
      
      if (data.features) {
        setSearchResults(data.features.map(feature => ({
          id: feature.id,
          name: feature.place_name,
          coordinates: feature.center, // [lng, lat]
        })));
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    searchLocations(value);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const [lng, lat] = result.coordinates;
    
    // Update map view
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2000
    });

    // Create or update marker
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: '#3B82F6', draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      
      // Add dragend event listener
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        onLocationSelect({ 
          lat: lngLat.lat, 
          lng: lngLat.lng,
          name: result.name
        });
      });
    }

    // Pass the location to parent component
    onLocationSelect({ lat, lng, name: result.name });
    
    // Clear search
    setSearchValue('');
    setSearchResults([]);
  };

  return (
    <div className="relative h-full w-full ">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Search box */}
      <div className="absolute top-4 left-4 z-10 w-72 ">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search for a location..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchValue && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <button 
                    onClick={() => {
                      setSearchValue('');
                      setSearchResults([]);
                    }} 
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-start space-x-2"
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 line-clamp-2">{result.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg max-w-xs">
        <p className="text-xs text-gray-700">
          <strong>Tip:</strong> Click anywhere on the map to place a marker or drag the existing marker to adjust the location.
        </p>
      </div>
    </div>
  );
}