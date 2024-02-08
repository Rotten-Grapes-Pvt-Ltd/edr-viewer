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
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "@/assets/react-leaflet-draw.css";
import { EditControl } from "react-leaflet-draw";
import Select from "react-select";
import { toast } from "react-toastify";
import { toWKT } from "@/services/helper";
import Loader from "@/components/Loader";
import TreeView from "@/components/TreeView";
import Link from "next/link";

export default function Home() {
  const mapRef = useRef();
  const featureGroupRef = useRef();
  const [url, setUrl] = useState(
    "https://labs.metoffice.gov.uk/edr/collections?f=application/json"
  );
  const [selectedTab, setSelectedTab] = useState("map");
  const [map, setMap] = useState();
  const [newUrl, setNewUrl] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [queryParams, setQueryParams] = useState();
  const [geojsonData, setGeojsonData] = useState();
  const [selectedCollection, setSelectedCollection] = useState();
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedWithin, setSelectedWithin] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedCSR, setSelectedCSR] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [selectedParameters, setSelectedParameters] = useState([]);
  // const [valid, setValid] = useState(false);
  const { data: getCollections, isLoading: gettingCollection } =
    GetCollections(url);
  const { data: getLocations, isLoading: gettingLocaion } = GetLocations(
    selectedQuery === "locations"
      ? selectedCollection?.data_queries?.locations?.link.href
      : null
  );
  const { mutateAsync: getEdrData, isPending: gettongEdrData } = GetEdrData();

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
    setSelectedWithin("1");
    setSelectedUnit("");
    setGeojsonData();
    clearDrawnItems(map);
    onDeleted();
  };

  const resetQuery = () => {
    setSelectedQuery("");
    setSelectedCoordinates("");
    setGeojsonData();
    clearDrawnItems(map);
  };

  const manageParm = (e) => {
    setSelectedParameters(e);
  };
  const selectAllParm = (e) => {
    if (e.target.checked) {
      let p = [];
      Object.keys(selectedCollection.parameter_names).map((x) =>
        p.push({
          value: x,
          label: selectedCollection.parameter_names[x].description,
        })
      );
      setSelectedParameters(p);
    } else {
      setSelectedParameters([]);
    }
  };

  const valid = () => {
    return (
      selectedCollectionId &&
      selectedQuery !== "" &&
      selectedParameters.length > 0 &&
      selectedCoordinates !== "" &&
      selectedCSR !== "" &&
      selectedOutput !== "" &&
      !isEditing
    );
  };

  const createEdrUrl = () => {
    if (valid()) {
      let createUrl =
        "https://labs.metoffice.gov.uk/edr/collections/" +
        selectedCollectionId +
        "/" +
        selectedQuery;

      createUrl += "?coords=" + selectedCoordinates;

      if (selectedQuery === "radius") {
        if (selectedWithin !== "" && selectedUnit !== "") {
          createUrl +=
            "&within=" + selectedWithin + "&within-units=" + selectedUnit;
        } else {
          toast.warning("Please select unit option under 'Within'.");
          return;
        }
      }

      createUrl +=
        "&parameter-name=" +
        selectedParameters.map((item) => item.value).join(",") +
        "&crs=" +
        selectedCSR +
        "&f=" +
        selectedOutput;

      setNewUrl(createUrl);
      // const url = new URL(createUrl);
      handleParseUrl(createUrl);
      getEdrData(createUrl)
        .then((res) => {
          setGeojsonData(res);
          toast.success("URL created successfully");
        })
        .catch((err) => {
          console.log(err.response.data.description);
          toast.error("URL not created properly");
        });
    }
  };

  const handleParseUrl = (urlInput) => {
    // Use the URL constructor to parse the input URL
    const parsedUrl = new URL(urlInput);

    // Extract query parameters
    const params = {};
    parsedUrl.searchParams.forEach((value, key) => (params[key] = value));
    setQueryParams(params);
  };

  const onEditDraw = (e) => {
    setGeojsonData();
    e.layers.eachLayer((layer) => {
      const wkt = toWKT(layer);
      setSelectedCoordinates(wkt);
    });
    setIsEditing(false);
  };

  const onCreate = (e) => {
    const wkt = toWKT(e.layer);
    setSelectedCoordinates(wkt);
  };
  const onDeleted = (e) => {
    setSelectedCoordinates("");
  };

  const handleMapReady = (map) => {
    setMap(map.target);
  };

  const getStyle = (feature) => {
    const { type } = feature.geometry;
    switch (type) {
      case "MultiPolygon":
        return {
          fillColor: "blue",
          color: "black",
          weight: 2,
        };
      case "MultiLineString":
        return {
          color: "orange",
          weight: 3,
        };
      case "Polygon":
        return {
          fillColor: "green",
          color: "black",
          weight: 2,
        };
      case "Point":
        return {
          fillColor: "red",
          color: "black",
          weight: 2,
          radius: 8,
        };
      default:
        return {};
    }
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng);
  };

  const clearDrawnItems = (map) => {
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Path ||
        layer instanceof L.Marker ||
        layer instanceof L.Polygon
      ) {
        map.removeLayer(layer);
      }
    });
  };

  const startEdit = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    setGeojsonData();
  }, [selectedUnit, selectedWithin, selectedParameters, selectedCoordinates]);

  return (
    <>
      {(gettongEdrData || gettingCollection || gettingLocaion) && <Loader />}

      <div className="flex justify-between p-2 text-center bg-gray-700">
        <div>This is a pre-release version , so you might face 🐞 !{" "}</div>
        <div className="flex items-center gap-3">
          <Link href="mailto:office@rottengrapes.tech"><Image src={'/images/email.svg'} alt="" height={24} width={24} /></Link>
          <Link href="https://github.com/Rotten-Grapes-Pvt-Ltd/edr-viewer"><Image src={'/images/git.svg'} alt="" height={24} width={24} /></Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="grid grid-cols-2 bg-slate-300">
          <button
            className={selectedTab === "map" ? "btnPrimary" : ""}
            onClick={() => setSelectedTab("map")}
          >
            Map
          </button>
          <button
            className={selectedTab === "data" ? "btnPrimary" : ""}
            onClick={() => setSelectedTab("data")}
          >
            Data
          </button>
        </div>
        <div className="flex col-span-2 p-3">
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

      <div
        className={`grid grid-cols-3 gap-5 ${
          selectedTab === "map" ? "block" : "hidden"
        }`}
      >
        <div className="p-3">
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
                <div className="flex gap-2 mb-3">
                  <div className="w-full">
                    <div className="mb-2 font-semibold text-slate-200">
                      Query:
                    </div>
                    <select
                      className="inputArea"
                      value={selectedQuery}
                      onChange={(e) => {
                        resetQuery();
                        setSelectedQuery(e.target.value);
                      }}
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
                    <div className="">
                      <div className="mb-2 font-semibold text-slate-200">
                        Within:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          className="inputArea"
                          value={selectedWithin}
                          onChange={(e) => setSelectedWithin(e.target.value)}
                        />
                        <select
                          name=""
                          id=""
                          className="inputArea"
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                          <option>Select Unit</option>
                          {selectedCollection.data_queries.radius.link.variables.within_units.map(
                            (unit, index) => (
                              <option value={unit} key={index}>
                                {unit}
                              </option>
                            )
                          )}
                        </select>
                      </div>
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
                {selectedCoordinates === "" && (
                  <div className="mb-2">Please draw on map</div>
                )}
                <input
                  type="text"
                  className="mt-2 mb-5 inputArea"
                  value={selectedCoordinates}
                  disabled
                />

                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-200">
                    Choose parameters
                  </label>
                  <label>
                    <input type="checkbox" onChange={(e) => selectAllParm(e)} />{" "}
                    Select All
                  </label>
                </div>
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

            {/* {console.log("selectedCollection ", selectedCollection)} */}
            {selectedCollection && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-2 font-semibold text-slate-200">
                    Output CSR
                  </div>
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
                  <div className="mb-2 font-semibold text-slate-200">
                    Output Format
                  </div>
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
            <button
              className="w-full mt-3 btnPrimary disabled:opacity-50"
              disabled={!valid()}
              onClick={createEdrUrl}
            >
              Create EDR URL
            </button>
          </div>
        </div>

        <div className="col-span-2">
          <div className="p-3">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              ref={mapRef}
              whenReady={handleMapReady}
            >
              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  position="topright"
                  onEdited={onEditDraw}
                  // onEditStart={startEdit}
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
                        ? ["position", "radius"].includes(selectedQuery) && {
                            icon: new L.Icon({
                              iconUrl: "marker-icon.png",
                              iconSize: [32, 32],
                            }),
                          }
                        : false,
                    polyline:
                      selectedCoordinates === ""
                        ? selectedQuery === "trajectory"
                        : false,
                    circlemarker: false,
                  }}
                  // edit={{
                  //   rectangle:
                  //     selectedCoordinates !== ""
                  //       ? selectedQuery === "items"
                  //       : false,
                  //   circle: false,
                  //   polygon:
                  //     selectedCoordinates !== ""
                  //       ? selectedQuery === "area"
                  //       : false,
                  //   marker:
                  //     selectedCoordinates !== ""
                  //       ? ["position", "radius"].includes(selectedQuery)
                  //       : false,
                  //   polyline:
                  //     selectedCoordinates !== ""
                  //       ? selectedQuery === "trajectory"
                  //       : false,
                  //   circlemarker: false,
                  // }}
                />
                {/* <Circle center={[51.51, -0.06]} radius={200} /> */}
                {selectedOutput === "GeoJSON" && geojsonData && (
                  <GeoJSON
                    data={geojsonData}
                    style={getStyle}
                    pointToLayer={pointToLayer}
                  /> //pointToLayer={pointToLayer}
                )}
              </FeatureGroup>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>
            <input type="text" value={newUrl} className="mt-3 inputArea" />
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-3 gap-5 ${
          selectedTab === "data" ? "block" : "hidden"
        }`}
      >
        <div className="p-3">
          <div className="my-2">
            {"/edr/collections/" + selectedCollectionId + "/" + selectedQuery}
          </div>
          {queryParams &&
            Object.keys(queryParams).map((x, key) => (
              <div key={key} className="grid grid-cols-3 gap-2 my-2">
                <div className="font-semibold">{x}</div>{" "}
                <div className="col-span-2 break-words"> {queryParams[x]}</div>
              </div>
            ))}
        </div>
        <div className="col-span-2 p-3 max-h-[calc(100vh-100px)] overflow-y-auto">
          {geojsonData && <TreeView data={geojsonData} />}
        </div>
      </div>
    </>
  );
}
