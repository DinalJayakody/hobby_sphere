import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

// Custom marker icon to ensure visibility
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  location: Location;
  updateLocation: (location: Location) => void;
};

const LocationSelector: React.FC<Props> = ({ updateLocation }) => {
  const [selected, setSelected] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<L.Map>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) return setSuggestions([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "HobbySphere/1.0 (testemail@example.com)",
            Referer: window.location.origin,
          },
        }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSelect = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const newLoc = {
      lat,
      lng,
      address: place.display_name,
    };
    setSelected(newLoc);
    updateLocation(newLoc);
    setSuggestions([]);
    setSearchQuery(place.display_name);

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
  };

  const DraggableMarker = () => {
    const [position, setPosition] = useState<L.LatLngExpression>(
      selected ? [selected.lat, selected.lng] : [7.8731, 80.7718]
    );
    const markerRef = useRef<L.Marker>(null);

    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        const newLoc = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          address: "Custom location selected",
        };
        setSelected(newLoc);
        updateLocation(newLoc);
      },
    });

    useEffect(() => {
      if (selected) setPosition([selected.lat, selected.lng]);
    }, [selected]);

    return (
      <Marker
        position={position}
        draggable
        ref={markerRef}
        icon={customIcon}
        eventHandlers={{
          dragend() {
            if (markerRef.current) {
              const latlng = markerRef.current.getLatLng();
              const newLoc = {
                lat: latlng.lat,
                lng: latlng.lng,
                address: "Custom location selected",
              };
              setSelected(newLoc);
              updateLocation(newLoc);
            }
          },
        }}
      />
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Select Your Location
      </h2>

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "45px",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
              maxHeight: "150px",
              overflowY: "auto",
              zIndex: 1000,
              listStyle: "none",
              margin: 0,
              padding: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {suggestions.map((place, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(place)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "50px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={7}
          style={{ width: "100%", height: "100%", borderRadius: "16px" }}
          whenReady={() => {
            if (mapRef.current === null) {
              // @ts-ignore
              mapRef.current =
                (document.querySelector(".leaflet-container") as any)?._leaflet_map ||
                null;
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <DraggableMarker />
        </MapContainer>
      </div>

      {/* Selected info */}
      {selected && (
        <div
          className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-white to-green-50 rounded-xl shadow-md border border-blue-200"
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center">
            📍 Selected Location
          </h3>
          <div className="space-y-1 text-slate-800">
            <p className="flex items-center">
              🏠 <span className="ml-2 font-medium">Address:</span> {selected.address}
            </p>
            <p className="flex items-center">
              🌐 <span className="ml-2 font-medium">Latitude:</span>{" "}
              {selected.lat.toFixed(6)}
            </p>
            <p className="flex items-center">
              📏 <span className="ml-2 font-medium">Longitude:</span>{" "}
              {selected.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
