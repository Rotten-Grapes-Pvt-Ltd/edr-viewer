export const toWKT = (layer) => {
  var lng,
    lat,
    coords = [];
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    var latlngs = layer.getLatLngs();
    for (var i = 0; i < latlngs.length; i++) {
      var latlngs1 = latlngs[i];
      if (latlngs1.length) {
        for (var j = 0; j < latlngs1.length; j++) {
          coords.push(latlngs1[j].lng + " " + latlngs1[j].lat);
          if (j === 0) {
            lng = latlngs1[j].lng;
            lat = latlngs1[j].lat;
          }
        }
      } else {
        coords.push(latlngs[i].lng + " " + latlngs[i].lat);
        if (i === 0) {
          lng = latlngs[i].lng;
          lat = latlngs[i].lat;
        }
      }
    }
    if (layer instanceof L.Polygon) {
      return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
    } else if (layer instanceof L.Polyline) {
      return "LINESTRING(" + coords.join(",") + ")";
    }
  } else if (layer instanceof L.Marker) {
    return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
  }
};
