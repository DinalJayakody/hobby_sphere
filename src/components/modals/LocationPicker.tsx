import React, { useState, useEffect } from "react";
import { MapPin, X, LocateFixed, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";

// Default Leaflet marker fix for React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Props {
  profileData: any;
  setProfileData: (data: any) => void;
}

const LocationPicker: React.FC<Props> = ({ profileData, setProfileData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    profileData.lat && profileData.lon
      ? [profileData.lat, profileData.lon]
      : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // 🔍 Fetch location suggestions as user types
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchQuery
            )}`
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Nominatim search failed", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 🗺️ Handle click on the map to select position
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setProfileData({ ...profileData, lat, lon: lng });
      },
    });
    return position ? <Marker position={position}></Marker> : null;
  };

  // 📍 Use current browser location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setProfileData({ ...profileData, lat: latitude, lon: longitude });
        },
        (err) => {
          alert("Unable to fetch your location.");
          console.error(err);
        }
      );
    } else {
      alert("Geolocation not supported in your browser.");
    }
  };

  return (
    <div className="w-full">
      <label className="block text-gray-700 text-sm mb-1">Location</label>

      <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
        <MapPin className="text-sky-500 w-5 h-5 mr-2" />
        <input
          type="text"
          readOnly
          value={
            position
              ? `Lat: ${position[0].toFixed(4)}, Lon: ${position[1].toFixed(4)}`
              : "No location selected"
          }
          className="w-full bg-transparent outline-none text-sm"
        />

        {/* 🌍 Modern map icon button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="p-2 rounded-full bg-white hover:bg-sky-100 border border-sky-300 transition"
          title="Select on Map"
        >
          <MapPin className="text-sky-500 w-5 h-5" />
        </motion.button>
      </div>

      {/* 🧭 Modal for map selection */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">
                  Select Location
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search field */}
              <div className="relative m-3">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
                />

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-sky-50 cursor-pointer text-sm"
                        onClick={() => {
                          setPosition([parseFloat(item.lat), parseFloat(item.lon)]);
                          setProfileData({
                            ...profileData,
                            lat: parseFloat(item.lat),
                            lon: parseFloat(item.lon),
                          });
                          setSearchQuery(item.display_name);
                          setSuggestions([]);
                        }}
                      >
                        {item.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map container */}
              <div className="relative w-full h-[55vh]">
                <MapContainer
                  center={position || [6.9271, 79.8612]} // default to Colombo
                  zoom={13}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationMarker />
                </MapContainer>

                {/* 📍 Use My Location button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUseMyLocation}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-sky-600 flex items-center gap-2 text-sm"
                >
                  <LocateFixed className="w-4 h-4" /> Use My Location
                </motion.button>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-3 border-t border-gray-200">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationPicker;
