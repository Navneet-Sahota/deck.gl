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
// import parseExpressionString from '../json-converter/parse-expression-string';

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
export default function convertJSON(json, configuration) {
  const {TYPE_KEY = 'type'} = configuration;

  if (Array.isArray(json)) {
    return json.map(x => convertJSON(json, configuration));
  }
  if (json && typeof json === 'object') {
    // If object.type is in configuration, instantitate
    if (json[TYPE_KEY]) {
      const type = json[TYPE_KEY];
      const Class = configuration.classes[type];
      if (configuration.classes[type]) {
        delete json.type;
        const props = convertJSON(json);
        return new Class(props);
      }
      log.warn(`Unknown class ${type}`)();
      // fall through
    }
    return convertPlainObject(json, configuration);
  }
  // TODO - single value, do we need to do anything?
  return json;
}

// Plain JS object, convert each key and return.
function convertPlainObject(json, configuration) {
  const result = {};
  for (const key of json) {
    const value = json[key];
    if (typeof value === 'string') {
      result[key] = convertString(json, key, null, configuration);
      // TODO if typeHint === function
      // parseExpressionString(propValue, configuration, isAccessor);
    } else {
      result[key] = convertJSON(json[key], configuration);
    }
  }
  return result;
}

// Convert one string value in an object
// TODO - hard to convert without type hint
function convertString(json, key, typeHint, configuration) {
  const value = json[key];
  if (configuration.enumerations) {
    // TODO - look up
    return value;
  }
  return value;
}
