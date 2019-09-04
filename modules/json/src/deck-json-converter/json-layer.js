import {CompositeLayer} from '@deck.gl/core';
import {getJSONLayers} from './deck-json-converter';
import {getDeckJSONConfiguration} from './deck-json-configuration';

const defaultProps = {
  // Optionally accept JSON strings by parsing them
  fetch: dataString => JSON.parse(dataString),
  configuration: {}
};

export default class JSONLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      layers: [],
      configuration: {}
    };
  }

  updateState({props, oldProps, changeFlags}) {
    if (props.configuration !== oldProps.configuration) {
      this.setState({
        configuration: getDeckJSONConfiguration(this.props.configuration)
      });
    }

    const layersChanged = changeFlags.dataChanged || props.configuration !== oldProps.configuration;
    if (layersChanged) {
      this.state.layers = getJSONLayers(props.data, this.state.configuration);
    }
  }

  renderLayers() {
    return this.state.layers;
  }
}

JSONLayer.layerName = 'JSONLayer';
JSONLayer.defaultProps = defaultProps;
