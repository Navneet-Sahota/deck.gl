import {MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

// Support all `@deck.gl/core` Views by default
const DEFAULT_VIEW_CATALOG = {MapView, FirstPersonView, OrbitView, OrthographicView};

export function getDeckConfiguration(configuration = {}) {
  return Object.assign({}, configuration, {
    classes: Object.assign(DEFAULT_VIEW_CATALOG, configuration.classes),
    enumerations: Object.assign({COORDINATE_SYSTEM, GL}, configuration.enumerations)
  });
}
