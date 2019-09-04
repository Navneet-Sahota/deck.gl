// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

// import parseExpressionString from '../json-converter/parse-expression-string';

// TODO - This can conflict with real props: Use non-valid JS key, e.g. `@type`?
const DEFAULT_TYPE_KEY = 'type';

const assert = (condition, message = '') => {
  if (!condition) {
    throw new Error(`JSON conversion error ${message}`);
  }
};

const isObject = value => value && typeof value === 'object';

export function validateConfiguration(configuration) {
  assert(!configuration.typeKey || typeof configuration.typeKey === 'string');
  assert(isObject(configuration.classes));
  return true;
}

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
export default function convertJSON(json, configuration) {
  if (Array.isArray(json)) {
    return json.map(element => convertJSON(element, configuration));
  }

  // If object.type is in configuration, instantitate
  if (isClassInstance(json, configuration)) {
    return convertClassInstance(json, configuration);
  }

  if (isObject(json)) {
    return convertPlainObject(json, configuration);
  }

  // Single value
  if (typeof json === 'string') {
    return convertString(json, configuration);

    // TODO - Define a syntax for functions so we don't need to sniff types?
    // if (json.indexOf('@@: ') === 0)
    // if (typeHint === function)
    // parseExpressionString(propValue, configuration, isAccessor);

    // TODO - We could also support string syntax for hydrating other types, like regexps...
    // But no current use case
  }

  // Return unchanged (number, boolean, ...)
  return json;
}

function isClassInstance(json, configuration) {
  const {typeKey = DEFAULT_TYPE_KEY} = configuration;
  return isObject(json) && Boolean(json[typeKey]);
}

function convertClassInstance(json, configuration) {
  // Extract the class type field
  const {typeKey = DEFAULT_TYPE_KEY} = configuration;
  const type = json[typeKey];

  // Prepare a props object and ensure all values have been converted
  const props = {...json};
  delete props[typeKey];

  // Find the class
  const Class = configuration.classes[type];

  // Check that the class was in the configuration.
  if (!Class) {
    const {log = console} = configuration; // eslint-disable-line
    const stringProps = JSON.stringify(props, null, 0).slice(0, 40);
    log.warn(`JSON converter: No registered class of type ${type}(${stringProps}...)  `);
    return null;
  }

  convertPlainObject(props, configuration);

  return new Class(props);
}

// Plain JS object, convert each key and return.
function convertPlainObject(json, configuration) {
  assert(isObject(json));

  const result = {};
  for (const key in json) {
    const value = json[key];
    result[key] = convertJSON(value, configuration);
  }
  return result;
}

// Convert one string value in an object
// TODO - hard to convert without type hint
function convertString(json, configuration) {
  if (configuration.enumerations) {
    // TODO - look up
    return json;
  }
  return json;
}
