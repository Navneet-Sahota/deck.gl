// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
// TODO - Currently converts in place, might be clearer to convert to separate structure

import JSONConverter from '../json-converter/json-converter';
import {shallowEqualObjects} from '../utils/shallow-equal-objects.js';

export default class DeckJSONConverter extends JSONConverter {
  constructor(props) {
    super(props);
  }

  postProcessConvertedJson(json) {
    // Handle `json.initialViewState`
    // If we receive new JSON we need to decide if we should update current view state
    // Current heuristic is to compare with last `initialViewState` and only update if changed
    if ('initialViewState' in json) {
      const updateViewState =
        !this.initialViewState ||
        !shallowEqualObjects(json.initialViewState, this.initialViewState);

      if (updateViewState) {
        json.viewState = json.initialViewState;
        this.initialViewState = json.initialViewState;
      }

      delete json.initialViewState;
    }

    return json;
  }
}
