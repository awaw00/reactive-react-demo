import isEqual from 'lodash.isequal';
import { BehaviorSubject, concat, from, merge, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, skip, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { IAction } from 'src/reactive-react';
import { mapMove, mapZoom } from './actions';
import LngLat = AMapModule.LngLat;

export interface IMapState {
  center: AMapModule.LngLat | null;
  zoom: number;
  points: number[][];
  visibleRange: number;
}

interface ICreateAMapOptions {
  container: HTMLElement,
  mapOpts?: AMapModule.IMapOptions,
  state$: Observable<IMapState>,
  dispatch: (action: IAction) => void
}

export default function createAMap (opts: ICreateAMapOptions) {
  const {container, mapOpts, state$, dispatch} = opts;

  const aMap = new AMap.Map(container, {
    ...mapOpts,
  });

  // 位置流
  const center$ = state$.pipe(
    map(state => state.center),
    distinctUntilChanged(),
    tap<AMapModule.LngLat | null>(center => {
      const orgCenter = aMap.getCenter();
      if (orgCenter !== center && center) {
        aMap.setCenter(center);
      }
    }),
  );
  const zoom$ = state$.pipe(
    map(state => state.zoom),
    distinctUntilChanged(),
    tap<number>(zoom => {
      aMap.setZoom(zoom);
    }),
  );

  // 单车所在的点数组状态流
  const markers$ = new BehaviorSubject<AMapModule.Marker[]>([]);

  const markersVisibleAndStyle$ = state$.pipe(
    filter(state => state.center !== null),
    map(state => ({center: state.center, visibleRange: state.visibleRange})),
    distinctUntilChanged(isEqual),
    withLatestFrom(markers$, (fromState, markers) => ({...fromState, markers})),
    tap((value: {center: LngLat, visibleRange: number, markers: AMapModule.Marker[]}) => {
      const {center, visibleRange, markers} = value;
      let minDistance = Number.MAX_VALUE;
      let nearestMarker: AMapModule.Marker | null = null;

      for (const marker of markers) {
        const distance = AMap.GeometryUtil.distance(center, marker.getPosition());
        if (distance < minDistance) {
          minDistance = distance;
          nearestMarker = marker;
        }
        if (distance <= visibleRange) {
          marker.show();
        } else {
          marker.hide();
        }

        if (marker.getIcon()) {
          marker.setIcon(undefined);
        }
      }

      if (nearestMarker && minDistance <= visibleRange) {
        nearestMarker.setTop(true);
      }
    })
  );

  const markersAddOrRemove$ = state$.pipe(
    map(state => state.points),
    distinctUntilChanged(),
    withLatestFrom(markers$),
    map(arr => {
      const points: number[][] = arr[0];
      const markers: AMapModule.Marker[] = arr[1];

      // 找到新增的点
      const newPoints = points.filter(p => {
        const index = markers.findIndex(m => {
          const lnglat = m.getPosition();
          return lnglat.getLng() === p[0] && lnglat.getLat() === p[1];
        });

        return index < 0;
      });

      // 找到被移除的点
      const delMarkers = markers.filter(m => {
        const lnglat = m.getPosition();
        const lng = lnglat.getLng();
        const lat = lnglat.getLat();

        const index = points.findIndex(p => {
          return p[0] === lng && p[1] === lat;
        });

        return index < 0;
      });

      if (newPoints.length === 0 && delMarkers.length === 0) {
        return markers;
      }

      delMarkers.forEach(m => m.setMap(null));

      return markers.filter(m => delMarkers.indexOf(m) < 0).concat(newPoints.map(p => {
        return new AMap.Marker({
          map: aMap,
          position: new AMap.LngLat(p[0], p[1]),
        });
      }));
    }),
    distinctUntilChanged(),
    tap(v => markers$.next(v)),
  );

  const markersUpdate$ = merge(
    markersAddOrRemove$,
    markersVisibleAndStyle$,
  );

  let subscriber: {unsubscribe: () => void};
  aMap.on('complete', (e: any) => {
    const merged$ = merge(
      center$,
      zoom$,
      markersUpdate$,
    );
    subscriber = merged$.subscribe();
  });

  aMap.on('zoomend', (e: any) => {
    dispatch(mapZoom({zoom: aMap.getZoom(), center: aMap.getCenter(), bounds: aMap.getBounds()}));
  });

  aMap.on('moveend', (e: any) => {
    dispatch(mapMove({center: aMap.getCenter()}));
  });

  return function () {
    if (subscriber) {
      subscriber.unsubscribe();
    }
    aMap.destroy();
  };
}
