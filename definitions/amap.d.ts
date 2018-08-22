declare namespace AMapModule {
  class LngLat {
    constructor (lng?: number, lat?: number);

    public offset (w: number, s: number): LngLat;

    public distance (lnglat: LngLat | LngLat[]): number;

    public getLng (): number;

    public getLat (): number;

    public equals (lnglat: LngLat): boolean;

    public toString (): string;
  }

  class Bounds {
    constructor (southWest: LngLat, northEast: LngLat);

    public contains (point: LngLat): boolean;

    public getCenter (): LngLat;

    public getSouthWest (): LngLat;

    public getSouthEast (): LngLat;

    public getNorthWest (): LngLat;

    public getNorthEast (): LngLat;

    public toString (): string;
  }

  class Size {
    constructor (width: number, height: number);

    public getWidth (): number;

    public getHeight (): number;

    public toString (): string;
  }

  class Pixel {
    constructor (x: number, y: number);

    public getX (): number;

    public getY (): number;

    public equals (point: Pixel): boolean;

    public toString (): string;
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
    constructor (tileOpt: ITileLayerOptions);

    public setOpacity (alpha: number): void;

    public show (): void;

    public hide (): void;

    public getTiles (): any[];

    public reload (): void;

    public setTileUrl (url: string): void;

    public getZooms (): number[];

    public setMap (map: Map): void;
  }

  interface IView2DOptions {
    center: LngLat;
    rotation?: number;
    zoom?: number;
    crs?: string;
  }

  class View2D {
    constructor (opt: IView2DOptions);
  }

  interface IMapOptions {
    view?: View2D;
    layers?: TileLayer[];
    zoom?: number;
    center?: LngLat | number[];
    labelzIndex?: number;
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
    indoorMap?: any;
    expandZoomRange?: boolean;
    dragEnable?: boolean;
    zoomEnable?: boolean;
    doubleClickZoom?: boolean;
    keyboardEnable?: boolean;
    jogEnable?: boolean;
    scrollWheel?: boolean;
    touchZoom?: boolean;
    touchZoomCenter?: number;
    mapStyle?: string;
    features?: string[];
    showBuildingBlock?: boolean;
    viewMode?: string;
    pitch?: number;
    pitchEnable?: boolean;
    buildingAnimation?: boolean;
    skyColor?: string;
    preloadMode?: boolean;
  }

  interface ICity {
    province: string;
    city: string;
    citycode: string;
    district: string;
  }

  interface IMapStatus {
    resizeEnable: boolean;
    dragEnable: boolean;
    keyboardEnable: boolean;
    doubleClickZoom: boolean;
    isHotspot: boolean;
  }

  type OverlayerType = 'marker' | 'circle' | 'polyline' | 'polygon';
  type MapEventName =
    'complete'
    | 'click'
    | 'dblclick'
    | 'mapmove'
    | 'hotspotclick'
    | 'hotspotover'
    | 'movestart'
    | 'moveend'
    | 'zoomchange'
    | 'zoomstart'
    | 'zoomend'
    | 'mousemove'
    | 'mousewheel'
    | 'mouseover'
    | 'mouseout'
    | 'mouseup'
    | 'mousedown'
    | 'rightclick'
    | 'dragstart'
    | 'dragging'
    | 'dragend'
    | 'resize'
    | 'touchstart'
    | 'touchmove'
    | 'touchend';

  interface IMapEvent {
    lnglat: LngLat;
    pixel: Pixel;
    type: MapEventName;
    target: any;
  }

  class Map {
    constructor (container: string | HTMLElement, opts?: IMapOptions);

    public poiOnAMAP (obj: object): void;

    public detailOnAMAP (obj: object): void;

    public getZoom (): number;

    public getLayers (): TileLayer[];

    public getCenter (): LngLat;

    public getContainer (): HTMLElement;

    public getCity (callback: (result: ICity) => any): void;

    public getBounds (): Bounds;

    public getLabelzIndex (): number;

    public getLimitBounds (): Bounds;

    public getLang (): string;

    public getSize (): Size;

    public getRotation (): number;

    public getStatus (): IMapStatus;

    public getDefaultCursor (): string;

    public getResolution (point: LngLat): number;

    public getScale (dpi: number): number;

    public setZoom (level: number): void;

    public setlabelzIndex (index: number): void;

    public setLayers (layers: TileLayer[]): void;

    public add (overlayers: any[]): void;

    public remove (overlayers: any[]): void;

    public getAllOverlays (type?: OverlayerType): any;

    public setCenter (position: LngLat): void;

    public setZoomAndCenter (zoomLevel: number, center: LngLat): void;

    public setCity (city: string, callback: () => any): void;

    public setBounds (bound: Bounds): void;

    public setLimitBounds (bound: Bounds): void;

    public clearLimitBounds (): void;

    public setLang (lang: string): string;

    public setRotation (rotation: number): number;

    public setStatus (status: IMapStatus): number;

    public setDefaultCursor (cursor: string): void;

    public zoomIn (): void;

    public zoomOut (): void;

    public panTo (position: LngLat): void;

    public panBy (x: number, y: number): void;

    public setFitView (overlayList: any[]): void;

    public clearMap (): void;

    public destroy (): void;

    public plugin (name: string | string[], callback: () => any): void;

    public addControl (obj: any): void;

    public removeControl (obj: any): void;

    public clearInfoWindow (): void;

    public pixelToLngLat (pixel: Pixel, level: number): LngLat;

    public lnglatToPixel (lnglat: LngLat, level: number): Pixel;

    public containerToLngLat (pixel: Pixel): LngLat;

    public lngLatToContainer (lnglat: LngLat): Pixel;

    public setMapStyle (style: string): void;

    public getMapStyle (): string;

    public setFeatures (feature: any[]): void;

    public getFeatures (): any[];

    public setDefaultLayer (layer: TileLayer): void;

    public setPitch (pitch: number): void;

    public getPitch (): number;

    public on (event: MapEventName, handler: (mapEvent?: IMapEvent, ...args: any[]) => any, context?: any): void;
  }

  interface IIconOption {
    size?: Size;
    imageOffset?: Pixel;
    image: string;
    imageSize?: Size;
  }

  class Icon {
    constructor (opt: IIconOption);

    public getImageSize (): Size;

    public setImageSize (size: Size): void;
  }

  type MarkerAnimationType = 'AMAP_ANIMATION_NONE' | 'AMAP_ANIMATION_DROP' | 'AMAP_ANIMATION_BOUNCE';

  interface IMarkerLabel {
    content: string;
    offset?: Pixel;
  }

  type MarkerShapeType = 'circle' | 'poly' | 'rect';

  interface IMarkerShapeOptions {
    coords: number[];
    type: MarkerShapeType;
  }

  class MarkerShape {
    constructor (opt: IMarkerShapeOptions);
  }

  type MarkerEventName =
    'click'
    | 'dblclick'
    | 'rightclick'
    | 'mousemove'
    | 'mouseover'
    | 'mouseout'
    | 'mouseup'
    | 'dragstart'
    | 'dragging'
    | 'dragend'
    | 'moving'
    | 'moveend'
    | 'movealone'
    | 'touchstart'
    | 'touchmove'
    | 'touchend';

  interface IMarkerOptions {
    map?: Map;
    position?: LngLat;
    offset?: Pixel;
    icon?: string | Icon;
    content?: string | object;
    topWhenClick?: boolean;
    bubble?: boolean;
    draggable?: boolean;
    raiseOnDrag?: boolean;
    cursor?: string;
    visible?: boolean;
    zIndex?: number;
    angle?: number;
    autoRotation?: boolean;
    animation?: MarkerAnimationType;
    shadow?: Icon;
    title?: string;
    clickable?: boolean;
    shape?: MarkerShape;
    extData?: any;
    label?: IMarkerLabel;
  }

  class Marker {
    constructor (opt: IMarkerOptions);

    public markOnAMAP (obj: object): void;

    public getOffset (): Pixel;

    public setOffset (offset: Pixel): void;

    public setAnimation (animate: MarkerAnimationType): void;

    public getAnimation (): MarkerAnimationType;

    public setClickable (clickable: boolean): void;

    public getClickable (): boolean;

    public getPosition (): LngLat;

    public setPosition (lnglat: LngLat): void;

    public setAngle (angle: number): void;

    public setLabel (label: IMarkerLabel): void;

    public getLabel (): IMarkerLabel;

    public getAngle (): number;

    public setzIndex (index: number): void;

    public getzIndex (): number;

    public setIcon (content: string | Icon | undefined): void;

    public getIcon (): string | Icon;

    public setDraggable (draggable: boolean): void;

    public getDraggable (): boolean;

    public hide (): void;

    public show (): void;

    public setCursor (cursor: string): string;

    public setContent (html: string | HTMLElement): void;

    public getContent (): string;

    public moveAlone (path: any[], speed: number, f: any, circlable: boolean): void;

    public moveTo (lnglat: LngLat, speed: number, f: any): void;

    public stopMove (): void;

    public pauseMove (): void;

    public resumeMove (): void;

    public setMap (map: Map | null): void;

    public getMap (): Map;

    public setTitle (title: string): void;

    public getTitle (): string;

    public setTop (isTop: boolean): void;

    public getTop (): boolean;

    public setShadow (icon: Icon): void;

    public getShadow (): Icon;

    public setShape (shape: MarkerShape): void;

    public getShape (): MarkerShape;

    public setExtData (data: any): void;

    public getExtData (): any;

    public on (eventName: MarkerEventName, handler: any, context?: any): void;
  }

  interface IGeometryUtil {
    distance (p1: number | LngLat, p2: number | LngLat): number;

    distanceToSegment (p: number | LngLat, l0: number | LngLat, l1: number | LngLat): number;
  }

  export interface IAMap {
    Pixel: typeof Pixel;
    Size: typeof Size;
    LngLat: typeof LngLat;
    Bounds: typeof Bounds;
    Map: typeof Map;
    Marker: typeof Marker;
    MarkerShape: typeof MarkerShape;
    Icon: typeof Icon;
    GeometryUtil: IGeometryUtil;
  }
}

declare var AMap: AMapModule.IAMap;
