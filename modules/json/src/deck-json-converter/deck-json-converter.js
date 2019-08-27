// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
// TODO - Currently converts in place, might be clearer to convert to separate structure

import JSONConverter from '../json-converter/json-converter';
import {shallowEqualObjects} from '../utils/shallow-equal-objects.js';

export default class DeckJSONConverter extends JSONConverter {
  constructor(props) {
    super(props);
  }

  postProcessConvertedJson(convertedJson) {
    // Handle `json.initialViewState`
    // If we receive new JSON we need to decide if we should update current view state
    // Current heuristic is to compare with last `initialViewState` and only update if changed
    if ('initialViewState' in convertedJson) {
      const updateViewState =
        !this.initialViewState ||
        !shallowEqualObjects(convertedJson.initialViewState, this.initialViewState);

      if (updateViewState) {
        convertedJson.viewState = convertedJson.initialViewState;
        this.initialViewState = convertedJson.initialViewState;
      }

      delete convertedJson.initialViewState;
    }

    return convertedJson;
  }
}
