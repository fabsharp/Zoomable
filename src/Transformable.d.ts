export interface Point {
    x: number;
    y: number;
}
export default class Transformable {
    element: HTMLElement;
    protected _cache: PointerEvent[];
    private _startPosition;
    private _initialDistance;
    private _target;
    private _justStarted;
    private _inProgress;
    private _downX;
    private _downY;
    private _cancel;
    private _timeout?;
    constructor(element: HTMLElement);
    private _onPointerDown;
    private getDistance;
    private getCenter;
    readonly transform: {
        center: Point;
        pointers: PointerEvent[];
        distance: number;
        scale: number;
        translateX: number;
        translateY: number;
        translation: number;
    };
    private _onPointerMove;
    private _onPointerUp;
    private _onGestureStart;
    private _onGestureMove;
    private _onGestureEnd;
}
