// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import {log} from '@deck.gl/core';

import JSONLayer from './json-layer';

// TODO - replace with loaders.gl
import parseExpressionString from '../json-converter/parse-expression-string';
import enhancedFetch from '../json-converter/enhanced-fetch';
import convertJSON from '../json-converter/convert-json';

export const DEFAULT_MAP_PROPS = {style: 'mapbox://styles/mapbox/light-v9'};

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
export function convertDeckJSON(json, configuration) {
  const jsonProps = convertJSON(json, configuration);

  // Normalize deck props
  if ('initialViewState' in jsonProps) {
    jsonProps.viewState = jsonProps.viewState || jsonProps.initialViewState;
  }

  normalizeMapProps(jsonProps, configuration);

  return jsonProps;
}

// Normalizes map/mapStyle etc props to a `map: {style}` object-valued prop
function normalizeMapProps(jsonProps, configuration) {
  if (jsonProps.map || jsonProps.mapStyle) {
    jsonProps.map = Object.assign({}, DEFAULT_MAP_PROPS, jsonProps.map);
  }

  if (!jsonProps.map) {
    return;
  }

  if ('mapStyle' in jsonProps) {
    jsonProps.map.style = jsonProps.mapStyle;
    jsonProps.map.mapStyle = jsonProps.mapStyle;
    delete jsonProps.mapStyle;
  }

  // TODO - better map handling
  if ('viewState' in jsonProps) {
    jsonProps.map.viewState = jsonProps.viewState;
  }
}

// LAYERS

// Replaces accessor props
export function getJSONLayers(jsonLayers = [], configuration) {
  // assert(Array.isArray(jsonLayers));
  const layerCatalog = configuration.layers || {};
  return jsonLayers.map(jsonLayer => {
    const Layer = layerCatalog[jsonLayer.type];
    const props = getJSONLayerProps(Layer, jsonLayer, configuration);
    return Layer && new Layer(props);
  });
}

function getJSONLayerProps(Layer, jsonProps, configuration) {
  const replacedProps = {};
  for (const propName in jsonProps) {
    let propValue = jsonProps[propName];

    // Parse string valued expressions
    if (typeof propValue === 'string') {
      const propType = Layer && Layer._propTypes && Layer._propTypes[propName];
      let type = typeof propType === 'object' && propType.type;
      // TODO - should not be needed if prop types are good
      if (propName.startsWith('get')) {
        type = 'accessor';
      }
      switch (type) {
        case 'accessor':
          const isAccessor = true;
          propValue = parseExpressionString(propValue, configuration, isAccessor);
          break;
        case 'function':
          propValue = parseExpressionString(propValue, configuration);
          break;
        default:
      }
    }

    // Invalid functions return null, show default value instead.
    if (propValue) {
      replacedProps[propName] = propValue;
    }
  }
  return replacedProps;
}
