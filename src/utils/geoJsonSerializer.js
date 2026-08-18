/**
 * GeoJSON Feature and FeatureCollection Serializer (RFC 7946)
 */

/**
 * Creates a GeoJSON Feature
 * @param {object} geometry - { type: "Point"|"MultiPolygon", coordinates: [...] }
 * @param {object} properties - Property attributes
 * @param {string|number|bigint} id - Feature ID
 */
export const toFeature = (geometry, properties = {}, id = undefined) => {
  const feature = {
    type: "Feature",
    geometry: geometry || null,
    properties: properties || {},
  };

  if (id !== undefined) {
    feature.id = typeof id === "bigint" ? id.toString() : id;
  }

  return feature;
};

/**
 * Creates a GeoJSON FeatureCollection
 * @param {Array<object>} features - Array of GeoJSON Features
 * @param {object} meta - Optional metadata or bounding box
 */
export const toFeatureCollection = (features = [], meta = undefined) => {
  const collection = {
    type: "FeatureCollection",
    features,
  };

  if (meta !== undefined) {
    collection.meta = meta;
  }

  return collection;
};

/**
 * Helper to parse PostGIS GeoJSON string into JS object
 * @param {string|object} geom
 */
export const parseGeometry = (geom) => {
  if (!geom) return null;
  if (typeof geom === "object") return geom;
  try {
    return JSON.parse(geom);
  } catch (e) {
    return null;
  }
};
