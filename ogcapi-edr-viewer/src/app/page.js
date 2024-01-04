"use client";
import MapView from "@/components/MapView";
import { GetCollections } from "@/queries/ControllersQueries";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

export default function Home() {
  const [url, setUrl] = useState(
    "https://labs.metoffice.gov.uk/edr/collections?f=application/json"
  );
  const [newUrl, setNewUrl] = useState();
  const [selectedCollection, setSelectedCollection] = useState();
  const [selectedCollectionId, setSelectedCollectionId] = useState();
  const [selectedQuery, setSelectedQuery] = useState();
  const [selectedParameters, setSelectedParameters] = useState([]);
  const { data: getCollections } = GetCollections(url);

  useEffect(() => {
    if (getCollections && selectedCollectionId) {
      const selectedColl = getCollections.collections.find(
        (item) => item.id === selectedCollectionId
      );
      setSelectedCollection(selectedColl);
    }
  }, [selectedCollectionId]);

  const manageParm = (e) => {
    if (selectedParameters.includes(e.target.value)) {
      setSelectedParameters(
        selectedParameters.filter((item) => item !== e.target.value)
      );
    } else {
      setSelectedParameters([...selectedParameters, e.target.value]);
    }
  };

  useEffect(() => {
    if (selectedCollectionId && selectedQuery && selectedParameters) {
      const createUrl =
        "https://labs.metoffice.gov.uk/edr/collections/" +
        selectedCollectionId +
        "/" +
        selectedQuery +
        "&parameter-name=" +
        selectedParameters.join("&");
      setNewUrl(createUrl);
    }
  }, [selectedCollectionId, selectedQuery, selectedParameters]);

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer> */}
      <div className="col-span-2">
        <div className="flex w-full m-3">
          <input
            type="text"
            className="inputArea grow"
            placeholder="Url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btnSecondary whitespace-nowrap">
            Retrieve collections
          </button>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 bg-slate-300">
          <button className="btnPrimary">Map</button>
          <button className="">Data</button>
        </div>
        <div>
          <h3 className="font-semibold py-5">
            Collections (demo not for operational use)
          </h3>
          <label className="font-semibold text-slate-200">Collection:</label>
          <select
            className="inputArea mt-2 mb-5"
            onChange={(e) => setSelectedCollectionId(e.target.value)}
          >
            {getCollections?.collections.map((c, i) => (
              <option key={i} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <label className="font-semibold text-slate-200">Query:</label>
          <select
            className="inputArea mt-2 mb-5"
            onChange={(e) => setSelectedQuery(e.target.value)}
          >
            {selectedCollection ? (
              Object.keys(selectedCollection.data_queries).map(
                (query, index) => (
                  <option key={index} value={query}>
                    {query}
                  </option>
                )
              )
            ) : (
              <option>Select</option>
            )}
          </select>
          <label className="font-semibold text-slate-200">Coordinates:</label>
          <input type="text" className="inputArea mt-2 mb-5" />
          <label className="font-semibold text-slate-200 mb-2">
            Choose parameters
          </label>
          {console.log(selectedParameters)}
          {selectedCollection
            ? Object.keys(selectedCollection.parameter_names).map(
                (parm, index) => (
                  <div key={index} className="my-2">
                    <label>
                      <input
                        type="checkbox"
                        value={parm}
                        onChange={manageParm}
                      />{" "}
                      {selectedCollection.parameter_names[parm].description}
                    </label>
                  </div>
                )
              )
            : ""}
        </div>
      </div>
      <div className="col-span-3 p-5">
        <input type="text" value={newUrl} className="inputArea" />
      </div>
    </div>
  );
}
