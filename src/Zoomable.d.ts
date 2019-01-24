import Transformable from './Transformable.js';
export default class Zoomable extends Transformable {
    offsetX: number;
    offsetY: number;
    scale: number;
    x: number;
    y: number;
    currentScale: number;
    constructor(element: HTMLElement);
    private _onDoubleTap;
    private _OnGestureMove;
    private _OnGestureEnd;
    translate(x: number, y: number): void;
    zoomAt(x: number, y: number, scale: number): void;
    apply(animate?: boolean, duration?: number): void;
}
