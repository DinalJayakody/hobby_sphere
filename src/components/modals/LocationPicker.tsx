import React, { useEffect, useRef, useState } from "react";
import { MapPin, X, LocateFixed, Search, Loader2, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useToast } from "../../context/ToastContext";

// Self-contained pin icon (no external CDN dependency — the previous version
// pulled its marker image from a random flaticon.com URL, a single point of
// failure with no guarantee that URL keeps working). A plain inline SVG data
// URI needs no network request and matches the app's brand color.
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
  <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="#2798ea"/>
  <circle cx="17" cy="17" r="7" fill="#ffffff"/>
</svg>`;
const avatarIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(PIN_SVG)}`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

interface Props {
  profileData: any;
  setProfileData: (data: any) => void;
}

// react-leaflet's <MapContainer center={...}> only applies that prop on the
// very first render — moving `position` afterward (via search or "Use My
// Location") never re-centers the view on its own. This child reads the
// live map instance and flies it to the new position whenever one is picked.
const MapRecenter: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 });
    }
  }, [position, map]);
  return null;
};

const LocationPicker: React.FC<Props> = ({ profileData, setProfileData }) => {
  const { toast } = useToast();
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
  const [searchError, setSearchError] = useState<string | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const searchAbortRef = useRef<AbortController | null>(null);
  const reverseRequestIdRef = useRef(0);
  // Selecting a suggestion fills the search box with its full display name
  // (so the field shows what's selected) — but that write also re-triggers
  // the debounced search effect below, which would otherwise immediately
  // re-search that exact text and pop the dropdown back open right after
  // picking something. This flag lets that one resulting effect run skip
  // the re-search instead.
  const suppressNextSearchRef = useRef(false);

  // 🧭 Reverse geocode to fetch main city nearby
  const reverseGeocode = async (lat: number, lon: number) => {
    const requestId = ++reverseRequestIdRef.current;
    try {
      setReverseLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("Reverse geocode failed");
      const data = await res.json();
      if (requestId !== reverseRequestIdRef.current) return; // a newer pick superseded this one

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
      setProfileData((prev: any) => ({ ...prev, lat, lon, location: label }));
      return label;
    } catch (err) {
      console.error("Reverse geocode error:", err);
      if (requestId !== reverseRequestIdRef.current) return;
      const fallback = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
      setLocationLabel(fallback);
      setProfileData((prev: any) => ({ ...prev, lat, lon, location: fallback }));
      return fallback;
    } finally {
      if (requestId === reverseRequestIdRef.current) setReverseLoading(false);
    }
  };

  // 🗺️ Resolve label if existing lat/lon
  useEffect(() => {
    if (profileData.lat && profileData.lon && !locationLabel) {
      reverseGeocode(profileData.lat, profileData.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 Fetch search suggestions — cancels the previous in-flight request so a
  // slow response for an earlier keystroke can never overwrite a newer one.
  useEffect(() => {
    const delay = setTimeout(async () => {
      searchAbortRef.current?.abort();

      if (suppressNextSearchRef.current) {
        suppressNextSearchRef.current = false;
        return;
      }

      if (searchQuery.trim().length <= 2) {
        setSuggestions([]);
        setSearchError(null);
        return;
      }

      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        setLoadingSuggestions(true);
        setSearchError(null);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&limit=6`,
          { signal: controller.signal, headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err: any) {
        if (err?.name === "AbortError") return; // superseded by a newer keystroke, not a real failure
        console.error("Search failed", err);
        setSuggestions([]);
        setSearchError("Couldn't search right now. Check your connection and try again.");
      } finally {
        if (searchAbortRef.current === controller) setLoadingSuggestions(false);
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

  // 📍 Use My Location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation isn't supported by this browser.", "error");
      return;
    }
    if (!window.isSecureContext) {
      toast("Location access requires a secure (https) connection.", "error");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude).finally(() => setGeoLoading(false));
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGeoLoading(false);
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Allow it in your browser's site settings to use this."
            : err.code === err.TIMEOUT
            ? "Finding your location took too long. Please try again."
            : "Couldn't determine your location. Please try again or search instead.";
        toast(message, "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    suppressNextSearchRef.current = true;
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
      <label className="block text-ink-muted text-sm mb-1">Location</label>

      <div className="flex items-center border-2 border-sky-200 dark:border-sky-500/30 rounded-lg p-2 bg-sky-50 dark:bg-sky-500/10 shadow-sm">
        <MapPin className="text-sky-500 dark:text-sky-400 w-5 h-5 mr-2 shrink-0" />
        <input
          type="text"
          readOnly
          value={placeholderText}
          className="w-full bg-transparent outline-none text-sm text-ink"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="p-2 rounded-full bg-surface hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-300 dark:border-sky-500/40 transition shrink-0"
          title="Select on Map"
        >
          <MapPin className="text-sky-500 dark:text-sky-400 w-5 h-5" />
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2">
          <div className="bg-surface-raised rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <h3 className="text-lg font-semibold text-ink">Select Location</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-surface-muted"
              >
                <X className="w-5 h-5 text-ink-faint" />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative m-3">
              <Search className="absolute left-3 top-2.5 text-ink-faint w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border-strong text-ink placeholder-ink-faint rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none text-sm"
              />
              {loadingSuggestions && (
                <div className="absolute left-0 right-0 bg-surface-raised border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md p-2 text-sm text-ink-muted flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                </div>
              )}
              {!loadingSuggestions && searchError && (
                <div className="absolute left-0 right-0 bg-surface-raised border border-border rounded-lg mt-1 z-50 shadow-md p-2 text-sm text-coral-500 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {searchError}
                </div>
              )}
              {!loadingSuggestions && !searchError && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-surface-raised border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer text-sm text-ink"
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
                <MapRecenter position={position} />
              </MapContainer>

              {/* 📍 Use My Location */}
              <button
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-600 dark:bg-sky-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-navy-700 dark:hover:bg-sky-500 disabled:opacity-70 flex items-center gap-2 text-sm"
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                {geoLoading ? "Finding you..." : "Use My Location"}
              </button>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-3 border-t border-border gap-3">
              <div className="text-sm text-ink-muted truncate">
                {reverseLoading
                  ? "Resolving location..."
                  : locationLabel || "No city selected"}
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                  className="px-3 py-2 bg-surface-muted rounded-md text-sm text-ink hover:bg-border-strong/40"
                >
                  Clear
                </button>

                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-navy-600 dark:bg-sky-600 text-white rounded-lg hover:bg-navy-700 dark:hover:bg-sky-500 text-sm"
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
