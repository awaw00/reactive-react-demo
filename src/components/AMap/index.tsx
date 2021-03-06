import React from 'react';
import { Action, createComponent } from 'src/reactive-react';
import { immReducer } from 'src/utils/reducer';
import {
  addPoint,
  IAddPointPayload,
  IMovePayload,
  IRemovePointPayload,
  ISetPointsPayload,
  IZoomPayload,
  mapZoom,
  removePoint,
  setPoints,
} from './actions';
import createAMap, { IMapState } from './createAMap';
import * as types from './types';

export interface IState extends IMapState {
  foo?: any;
}

const AMapComponent = createComponent<IState>({
  name: 'AMap',
  initialState: {
    center: new AMap.LngLat(120.062016, 30.281321),
    zoom: 15,
    points: [
      [120.062016, 30.281321],
    ],
    visibleRange: 500
  },
  reducers: (reducer) => {
    reducer.on(types.ZOOM)(immReducer<IState, IZoomPayload>(payload => d => {
      const {zoom, center, bounds} = payload;
      d.zoom = zoom;
      const horizontalSize = AMap.GeometryUtil.distance(bounds.getNorthEast(), bounds.getNorthWest());
      const verticalSize = AMap.GeometryUtil.distance(bounds.getNorthEast(), bounds.getSouthEast());
      let range = Math.max(horizontalSize, verticalSize);

      if (range > 2000) {
        range = 2000;
      }

      d.visibleRange = range;
      if (center) {
        d.center = center;
      }
    }));

    reducer.on(types.MOVE)(immReducer<IState, IMovePayload>(payload => d => {
      d.center = payload.center;
    }));

    reducer.on(types.SET_POINTS)(immReducer<IState, ISetPointsPayload>(payload => d => {
      const {clear, points} = payload;

      if (clear) {
        d.points = points;
      } else {
        d.points = d.points.concat(points);
      }
    }));

    reducer.on(types.ADD_POINT)(immReducer<IState, IAddPointPayload>(payload => d => {
      const {point} = payload;
      d.points.push(point);
    }));

    reducer.on(types.REMOVE_POINT)(immReducer<IState, IRemovePointPayload>(payload => d => {
      const {point} = payload;
      const index = d.points.findIndex(i => i[0] === point[0] && i[1] === point[1]);
      if (index >= 0) {
        d.points.splice(index, 1);
      }
    }));
  },
  init () {
    this['mapRef'] = React.createRef();
    window['dp'] = this.dispatch;
  },
  componentDidMount () {
    this['destroyMap'] = createAMap({
      container: this['mapRef'].current,
      state$: this.state$,
      dispatch: this.dispatch,
    });
  },
  componentWillUnmount () {
    this['destroyMap']();
  },
  render$ ({state, props}) {
    return (
      <div ref={this['mapRef']} style={{height: 500, width: 300}}/>
    );
  },
});

export default AMapComponent;
