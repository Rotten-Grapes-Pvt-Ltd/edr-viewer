"use client";
import L from "leaflet";
import { useEffect, useRef } from "react";

function MapView() {
  const mapRef = useRef();
  // useEffect(() => {
  //   // Initialize the map
  //   const mapObj = L.map(mapRef.current, {
  //     center: [51.505, -0.09],
  //     zoom: 13,
  //   });

  //   // Add a tile layer (you may need to replace the URL with your own)
  //   // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //   //   attribution: "© OpenStreetMap contributors",
  //   // }).addTo(mapObj);
  //   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //     maxZoom: 19,
  //     attribution:
  //       '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  //   }).addTo(mapObj);

  //   return () => {
  //     // Cleanup and remove the map instance
  //     mapObj.remove();
  //   };
  // }, []);

  return <div ref={mapRef} className="h-screen w-full relative"></div>;
}

export default MapView;
