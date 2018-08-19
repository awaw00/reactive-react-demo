declare namespace AMapModule {
  class LngLat {
    constructor(lng: number, lat: number);

    public offset(w: number, s: number): LngLat;
    public distance(lnglat: LngLat | LngLat[]): number;
    public getLng(): number;
    public getLat(): number;
    public equals(lnglat: LngLat): boolean;
    public toString(): string;
  }

  class Bounds {
    constructor(southWest: LngLat, northEast: LngLat);

    public contains(point: LngLat): boolean;
    public getCenter(): LngLat;
    public getSouthWest(): LngLat;
    public getNorthEast(): LngLat;
    public toString(): string;
  }

  class Size {
    constructor(width: number, height: number);

    public getWidth(): number;
    public getHeight(): number;
    public toString(): string;
  }

  class Pixel {
    constructor(x: number, y: number);

    public getX(): number;
    public getY(): number;
    public equals(point: Pixel): boolean;
    public toString(): string;
  }

  interface ITileLayerOptions {
    map: Map;
    tileSize?: number;
    tileUrl: string;
    errorUrl: string;
    getTileUrl: string | ((x: string, y: string, z: string) => string);
    zIndex?: number;
    opacity?: number;
    zooms?: number[];
    detectRetina?: boolean;
  }
  class TileLayer {
    constructor(tileOpt: ITileLayerOptions);

    public setOpacity(alpha: number): void;
    public show(): void;
    public hide(): void;
    public getTiles(): any[];
    public reload(): void;
    public setTileUrl(url: string): void;
    public getZooms(): number[];
    public setMap(map: Map): void;
  }

  interface IView2DOptions {
    center: LngLat;
    rotation?: number;
    zoom?: number;
    crs?: string;
  }
  class View2D {
    constructor(opt: IView2DOptions);
  }

  interface IMapOptions {
    view?: View2D;
    layers?: TileLayer[];
    zoom?: number;
    center: LngLat;
    labelzIndex: number;
    zooms?: number[];
    lang?: string;
    defaultCursor?: string;
    crs?: string;
    animateEnable?: boolean;
    isHotspot?: boolean;
    defaultLayer?: TileLayer;
    rotateEnable?: boolean;
    resizeEnable?: boolean;
    showIndoorMap?: boolean;
    indoorMap: any;
    expandZoomRange?: boolean;

  }
  class Map {
    constructor(container: string | HTMLElement, opts: IMapOptions);
  }

  export interface IAMap {
    Pixel: typeof Pixel;
    Size: typeof Size;
    LngLat: typeof LngLat;
    Bounds: typeof Bounds;
  }
}

declare var AMap: AMapModule.IAMap;