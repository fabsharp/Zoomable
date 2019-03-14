import Transformable from './Transformable.js';
import { addWheelListener } from './polyfills/MouseWheel.js';

export function getAbsolutePosition(element : HTMLElement) : any {
  let el = element;
  let x = 0;
  let y = 0;
  while (el) {
    if (el.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      const yScroll = el.scrollTop || document.documentElement.scrollTop;

      x += (el.offsetLeft - xScroll + el.clientLeft);
      y += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      y += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = <HTMLElement> el.offsetParent;
  }
  return { x, y };
}

export default class Zoomable extends Transformable {
  offsetX = 0;
  offsetY = 0;
  public scale = 1;
  public x = 0;
  public y = 0;
  public currentScale = 1;
  constructor(public element : HTMLElement, public options: any) {
    super(element);
    this.element.addEventListener('gesture-move', () => {
      this._OnGestureMove.call(this);
    });
    this.element.addEventListener('gesture-end', () => {
      this._OnGestureEnd.call(this);
    });
    this.element.addEventListener('double-tap', () => {
      this._onDoubleTap.call(this);
    });
    addWheelListener(element, (e : any) => {
      e.preventDefault();
      if (this._executeGesturesOptions('zoom', 'onZoom')) {
        const offset = getAbsolutePosition(element);
        let zX;
        let zY;
        if (e.originalEvent) {
          // for IE10 & IE11
          zX = e.originalEvent.clientX - offset.x - this.x;
          zY = e.originalEvent.clientY - offset.y - this.y;
        } else {
          // for others
          zX = e.clientX - offset.x - this.x;
          zY = e.clientY - offset.y - this.y;
        }
        if (e.deltaY > 0) {
          this.zoomAt(zX, zY, this.scale * 0.7);
        } else {
          this.zoomAt(zX, zY, this.scale * 1.3);
        }
        this.apply(false);
        this.currentScale = this.scale;
        const event = new CustomEvent('zoomable-gesture-end', {bubbles: true});
        this.element.dispatchEvent(event);
      }
    });
  }
  private _onDoubleTap() {
    if (this._executeGesturesOptions('doubleTap', 'onDoubleTap')) {
      const transform = this.transform;
      const offset = getAbsolutePosition(this.element);
      const zX = transform.center.x - offset.x - this.x;
      const zY = transform.center.y - offset.y - this.y;
      this.zoomAt(zX, zY , this.scale * 2);
      this.apply(true);
    }
  }
  private _OnGestureMove() {
    const gestureName = (this._cache.length > 1) ? 'zoom' : 'pan';
    const gestureEventName = (gestureName === 'zoom') ? 'onZoom' : 'onPan';
    if (this._executeGesturesOptions(gestureName, gestureEventName)) {
      const transform = this.transform;
      const offset = getAbsolutePosition(this.element);
      const zX = transform.center.x - offset.x - this.x;
      const zY = transform.center.y - offset.y - this.y;
      if (this._cache.length > 1) {
        this.zoomAt(zX, zY, transform.scale * this.currentScale);
      }
      this.translate(transform.translateX, transform.translateY);
      this.apply(false);
    }
  }
  private  _OnGestureEnd() {
    this.x += this.offsetX;
    this.y += this.offsetY;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentScale = this.scale;
    const event = new CustomEvent('zoomable-gesture-end', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  private _executeGesturesOptions(gestureName: string, gestureEventName: string) {
    if (this.options && this.options.gestures
      && (typeof this.options.gestures[gestureName] === 'boolean')
      && (!this.options.gestures[gestureName])) {
      return false;
    }
    if (this.options && this.options.gestures
      && (typeof this.options.gestures[gestureEventName] === 'function')) {
      if (this.options.gestures[gestureEventName]() === false) {
        return false;
      }
    }
    return true;
  }
  public translate(x : number, y : number) {
    this.offsetX = x;
    this.offsetY = y;
    const event = new CustomEvent('onTranslate', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  public zoomAt(x : number, y : number, scale : number, forceCenter : boolean = false) {
    const newZoom = (this.options && this.options.zoomMax && (this.options.zoomMax < scale))
        ? this.options.zoomMax
        : scale;
    // position of click :
    const ix = x / this.scale;
    const iy = y / this.scale;
    // position of click with new zoom
    const nx = ix * newZoom;
    const ny = iy * newZoom;
    // difference
    let cx = (ix + (x - ix) - nx);
    let cy = (iy + (y - iy) - ny);
    if (forceCenter === true) {
      // middle difference
      const midX = (this.element.offsetWidth / 2) - x;
      const midY = (this.element.offsetHeight / 2) - y;
      cx += midX;
      cy += midY;
    }
    // update
    this.scale = newZoom;
    this.x += cx;
    this.y += cy;
    const event = new CustomEvent('onZoomAt', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  public apply(_animate? : boolean, _duration? : number) {
    // TODO : trace apply on IE10, it is called every pointermove ?
    // TODO : tons of console errors in IE10 ?
    const tX = this.x + this.offsetX;
    const tY = this.y + this.offsetY;
    const details = {
      bubbles: true,
      detail : {
        x : tX,
        y : tY,
        scale : this.scale,
        animate : _animate,
        duration : _duration,
      },
      cancelable: true,
    };
    const event = new CustomEvent('onApply', details);
    const cancelled = !this.element.dispatchEvent(event);
    if (!cancelled) {
      if (_animate === true) {
        if (_duration) {
          this.element.style.transition = `${_duration}s`;
        } else {
          this.element.style.transition = '1s';
        }
      } else {
        this.element.style.transition = '0s';
      }
      this.element.style.transform = `translate(${tX}px, ${tY}px) scale(${this.scale})`;
    }
  }
}
