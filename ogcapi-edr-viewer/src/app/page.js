"use client";
// import MapView from "@/components/MapView";
import {
  GetCollections,
  GetEdrData,
  GetLocations,
} from "@/queries/ControllersQueries";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Circle,
  FeatureGroup,
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import Select from "react-select";
import { toast } from "react-toastify";

export default function Home() {
  const mapRef = useRef();
  const [url, setUrl] = useState(
    "https://labs.metoffice.gov.uk/edr/collections?f=application/json"
  );
  const [newUrl, setNewUrl] = useState();
  const [geojsonData, setGeojsonData] = useState()
  const [selectedCollection, setSelectedCollection] = useState();
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedCSR, setSelectedCSR] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [selectedParameters, setSelectedParameters] = useState([]);
  const { data: getCollections } = GetCollections(url);
  const { data: getLocations } = GetLocations(
    selectedQuery === "locations"
      ? selectedCollection?.data_queries?.locations?.link.href
      : null
  );
  const {mutateAsync: getEdrData} = GetEdrData()

  useEffect(() => {
    if (getCollections && selectedCollectionId) {
      reset();
      const selectedColl = getCollections.collections.find(
        (item) => item.id === selectedCollectionId
      );
      setSelectedCollection(selectedColl);
    }
  }, [selectedCollectionId]);

  const reset = () => {
    setSelectedCoordinates("");
    setSelectedQuery("");
    setSelectedCSR("");
    setSelectedOutput("");
    setSelectedParameters([]);
    onDeleted()
  };

  const manageParm = (e) => {
    setSelectedParameters(e);
  };

  const createUrl = () => {
    if (selectedCollectionId && selectedQuery && selectedParameters) {
      const createUrl =
        "https://labs.metoffice.gov.uk/edr/collections/" +
        selectedCollectionId +
        "/" +
        selectedQuery +
        "?coords=" +
        selectedCoordinates +
        "&parameter-name=" +
        selectedParameters.map((item) => item.value).join(",") +
        "&crs=" +
        selectedCSR +
        "&f=" +
        selectedOutput;
      setNewUrl(createUrl);
      getEdrData(createUrl).then(res => {
        console.log(res)
        setGeojsonData(res)
        toast.success('URL created successfully')
        debugger
      }).catch(err => {
        console.log(err.response.data.description)
        toast.error('URL not created properly')
        debugger
      })
    }
  };
  const onEditPath = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const wkt = layer
          .toGeoJSON()
          .geometry.coordinates.map((ring) =>
            ring.map((point) => point.join(" ")).join(",")
          )
          .join(";");
        setSelectedCoordinates(`POLYGON((${wkt}))`);
      }
    });
  };
  const onCreate = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const wkt = layer
        .toGeoJSON()
        .geometry.coordinates.map((ring) =>
          ring.map((point) => point.join(" ")).join(",")
        )
        .join(";");
      setSelectedCoordinates(`POLYGON((${wkt}))`);
    }
  };
  const onDeleted = (e) => {
    setSelectedCoordinates("");
  };

  const handleMapReady = (map) => {
    // console.log('========',map)
    // console.log('========',mapRef.current)
    // debugger
  };

  const handleDrawDelete = (e) => {
    const { layers } = e;
    layers.eachLayer((layer) => {
      // Remove the deleted layer from the state
      setDrawnLayers((prevLayers) => prevLayers.filter((prevLayer) => prevLayer !== layer));
    });
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      
      <div className="p-3">
        <div className="grid grid-cols-2 bg-slate-300">
          <button className="btnPrimary">Map</button>
          <button className="">Data</button>
        </div>
        <div>
          <h3 className="py-5 font-semibold">
            Collections (demo not for operational use)
          </h3>
          <label className="font-semibold text-slate-200">Collection:</label>
          <select
            className="mt-2 mb-5 inputArea"
            value={selectedCollectionId}
            onChange={(e) => {
              reset();
              setSelectedCollectionId(e.target.value);
            }}
          >
            <option>Select Collection</option>
            {getCollections?.collections.map((c, i) => (
              <option key={i} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {selectedCollection && (
            <>
              <div className="flex gap-2">
                <div className="w-full">
                  <label className="font-semibold text-slate-200">Query:</label>
                  <select
                    className="mt-2 mb-5 inputArea"
                    value={selectedQuery}
                    onChange={(e) => setSelectedQuery(e.target.value)}
                  >
                    <option>Select query</option>
                    {Object.keys(selectedCollection.data_queries).map(
                      (query, index) => (
                        <option key={index} value={query}>
                          {query}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {selectedQuery === "radius" && (
                  <div className="flex gap-2">
                    <div>
                      <label className="font-semibold text-slate-200">
                        Locations:
                      </label>
                    </div>
                    <div></div>
                  </div>
                )}
              </div>

              {selectedQuery === "locations" && (
                <div className="w-full">
                  <label className="font-semibold text-slate-200">
                    Locations:
                  </label>
                  <select
                    className="mt-2 mb-5 inputArea"
                    value={selectedQuery}
                    onChange={(e) => setSelectedQuery(e.target.value)}
                  >
                    <option>Select query</option>
                    {console.log(getLocations)}
                    {console.log(
                      "url: ",
                      selectedCollection?.data_queries?.locations?.link.href
                    )}
                    {getLocations?.features.map((loc, index) => (
                      <option key={index} value={loc.properties.Name}>
                        {loc.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="font-semibold text-slate-200">
                Coordinates:
              </label>
              <input
                type="text"
                className="mt-2 mb-5 inputArea"
                value={selectedCoordinates}
                disabled
              />
              {console.log(selectedCoordinates)}

              <label className="mb-2 font-semibold text-slate-200">
                Choose parameters
              </label>
              <Select
                className="my-2"
                closeMenuOnSelect={false}
                isMulti
                value={selectedParameters}
                options={Object.keys(selectedCollection.parameter_names).map(
                  (x) => ({
                    value: x,
                    label: selectedCollection.parameter_names[x].description,
                  })
                )}
                onChange={manageParm}
              />
            </>
          )}

          {console.log(selectedCollection)}
          {selectedCollection && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 font-semibold text-slate-200">
                  Output CSR
                </label>
                <select
                  value={selectedCSR}
                  className="inputArea"
                  onChange={(e) => setSelectedCSR(e.target.value)}
                >
                  <option>Select CSR</option>
                  {selectedCollection.crs.map((crs, index) => (
                    <option key={index}>{crs}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 font-semibold text-slate-200">
                  Output Format
                </label>
                <select
                  className="inputArea"
                  value={selectedOutput}
                  onChange={(e) => setSelectedOutput(e.target.value)}
                >
                  <option>Select output</option>
                  {selectedCollection.output_formats.map((output, index) => (
                    <option key={index}>{output}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <button className="w-full mt-3 btnPrimary" onClick={createUrl}>
            Create EDR URL
          </button>
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex w-full p-3">
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
        <div className="p-3">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            ref={mapRef}
            whenReady={handleMapReady}
          >
            <FeatureGroup>
              <EditControl
                position="topright"
                onEdited={onEditPath}
                onCreated={onCreate}
                onDeleted={onDeleted}
                draw={{
                  rectangle:
                    selectedCoordinates === ""
                      ? selectedQuery === "items"
                      : false,
                  circle: false,
                  polygon:
                    selectedCoordinates === ""
                      ? selectedQuery === "area"
                      : false,
                  marker:
                    selectedCoordinates === ""
                      ? ["position", "radius"].includes(selectedQuery)
                      : false,
                  polyline:
                    selectedCoordinates === ""
                      ? selectedQuery === "trajectory"
                      : false,
                  circlemarker: false,
                }}
                edit={{
                  rectangle:
                    selectedCoordinates !== ""
                      ? selectedQuery === "items"
                      : false,
                  circle: false,
                  polygon:
                    selectedCoordinates !== ""
                      ? selectedQuery === "area"
                      : false,
                  marker:
                    selectedCoordinates !== ""
                      ? ["position", "radius"].includes(selectedQuery)
                      : false,
                  polyline:
                    selectedCoordinates !== ""
                      ? selectedQuery === "trajectory"
                      : false,
                  circlemarker: false,
                }}
              />
              {/* <Circle center={[51.51, -0.06]} radius={200} /> */}
              {geojsonData && <GeoJSON data={geojsonData} />}
            </FeatureGroup>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
      </div>
      
      <div className="col-span-3 p-5">
        <input type="text" value={newUrl} className="inputArea" />
      </div>
    </div>
  );
}
