import * as types from './types';

export interface IMovePayload {
  center: AMapModule.LngLat;
}

export function mapMove (payload: IMovePayload) {
  return {
    type: types.MOVE,
    payload,
  };
}

export interface IZoomPayload {
  zoom: number;
  center?: AMapModule.LngLat;
}

export function mapZoom (payload: IZoomPayload) {
  return {
    type: types.ZOOM,
    payload,
  };
}

export interface ISetPointsPayload {
  points: number[][];
  clear?: boolean;
}

export function setPoints (payload: ISetPointsPayload) {
  return {
    type: types.SET_POINTS,
    payload: {
      clear: true,
      ...payload
    },
  };
}

export interface IAddPointPayload {
  point: number[];
}

export function addPoint (payload: IAddPointPayload) {
  return {
    type: types.ADD_POINT,
    payload,
  };
}

export interface IRemovePointPayload {
  point: number[];
}

export function removePoint (payload: IRemovePointPayload) {
  return {
    type: types.REMOVE_POINT,
    payload
  };
}
