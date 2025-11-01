import React, { useEffect, useState } from "react";
import { MapPin, X, LocateFixed, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🟢 Custom avatar icon for pin (replace the URL below with your avatar image)
const avatarIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Simple modern map pin
  iconSize: [38, 38],     // Adjust size as needed (smaller for mobile)
  iconAnchor: [19, 38],   // Bottom center points exactly at the location
  popupAnchor: [0, -35],  // Popup appears nicely above the pin
});

// Default Leaflet marker fix (in case other components use it)
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
    profileData.lat && profileData.lon ? [profileData.lat, profileData.lon] : null
  );
  const [locationLabel, setLocationLabel] = useState<string>(
    profileData.location || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  // 🧭 Reverse geocode to fetch main city nearby
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      setReverseLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("Reverse geocode failed");
      const data = await res.json();
      const address = data.address || {};

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.suburb ||
        address.county ||
        address.state ||
        null;

      const label =
        city || data.display_name || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;

      setLocationLabel(label);
      setProfileData((prev: any) => ({
        ...prev,
        lat,
        lon,
        location: label,
      }));
      setReverseLoading(false);
      return label;
    } catch (err) {
      console.error("Reverse geocode error:", err);
      setReverseLoading(false);
      const fallback = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      setLocationLabel(fallback);
      setProfileData((prev: any) => ({ ...prev, lat, lon, location: fallback }));
      return fallback;
    }
  };

  // 🗺️ Resolve label if existing lat/lon
  useEffect(() => {
    if (profileData.lat && profileData.lon && !locationLabel) {
      reverseGeocode(profileData.lat, profileData.lon);
    }
  }, []);

  // 🔍 Fetch search suggestions
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          setLoadingSuggestions(true);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
              searchQuery
            )}&addressdetails=1&limit=6`
          );
          const data = await res.json();
          setSuggestions(data || []);
        } catch (err) {
          console.error("Search failed", err);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // 🗺️ Map click event
  const LocationMarker: React.FC = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      },
    });
    return position ? <Marker position={position} icon={avatarIcon} /> : null;
  };

  // 📍 Use My Location (fixed to work on first click)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🔍 Handle suggestion click
  const handleSuggestionClick = async (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setPosition([lat, lon]);
    const display = item.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    setLocationLabel(display);
    setProfileData((prev: any) => ({ ...prev, lat, lon, location: display }));
    setSuggestions([]);
    setSearchQuery(display);
    await reverseGeocode(lat, lon);
  };

  const placeholderText = locationLabel
    ? locationLabel
    : position
    ? `Lat: ${position[0].toFixed(4)}, Lon: ${position[1].toFixed(4)}`
    : "No location selected";

  return (
    <div className="w-full">
      <label className="block text-gray-700 text-sm mb-1">Location</label>

      <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
        <MapPin className="text-sky-500 w-5 h-5 mr-2" />
        <input
          type="text"
          readOnly
          value={placeholderText}
          className="w-full bg-transparent outline-none text-sm"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 rounded-full bg-white hover:bg-sky-100 border border-sky-300 transition"
          title="Select on Map"
        >
          <MapPin className="text-sky-500 w-5 h-5" />
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700">Select Location</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative m-3">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
              />
              {loadingSuggestions && (
                <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md p-2 text-sm text-gray-500">
                  Searching...
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-sky-50 cursor-pointer text-sm"
                      onClick={() => handleSuggestionClick(item)}
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
                center={position || [6.9271, 79.8612]} // default Colombo
                zoom={13}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker />
              </MapContainer>

              {/* 📍 Fixed Use My Location Button */}
              <button
                onClick={handleUseMyLocation}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-sky-600 flex items-center gap-2 text-sm"
              >
                <LocateFixed className="w-4 h-4" /> Use My Location
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-3 border-t border-gray-200 gap-3">
              <div className="text-sm text-gray-500">
                {reverseLoading
                  ? "Resolving location..."
                  : locationLabel || "No city selected"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPosition(null);
                    setLocationLabel("");
                    setProfileData((prev: any) => ({
                      ...prev,
                      lat: undefined,
                      lon: undefined,
                      location: "",
                    }));
                    setModalOpen(false);
                  }}
                  className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
                >
                  Clear
                </button>

                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
