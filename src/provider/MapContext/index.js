'use client';
import { createContext, useState } from 'react';

const defaultProvider = {
  map: null,
};

export const MapContext = createContext(defaultProvider);

const MapProvider = ({ children }) => {
  const [map, setMap] = useState(defaultProvider.map);

  const values = {
    map,
    setMap,
  };

  return <MapContext.Provider value={values}>{children}</MapContext.Provider>;
};

export default MapProvider;
