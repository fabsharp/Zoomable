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
  constructor(public element : HTMLElement) {
    super(element);
    this.element.style.touchAction = 'none';
    this.element.style.transformOrigin = '0 0';
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
      const offset = getAbsolutePosition(element);
      const zX = e.clientX - offset.x - this.x;
      const zY = e.clientY - offset.y - this.y;
      if (e.deltaY > 0) {
        this.zoomAt(zX, zY, this.scale * 0.7);
      } else {
        this.zoomAt(zX, zY, this.scale * 1.3);
      }
      this.apply(false);
      this.currentScale = this.scale;
      const event = new CustomEvent('zoomable-gesture-end', { bubbles: true });
      this.element.dispatchEvent(event);
    });
  }
  private _onDoubleTap() {
    const transform = this.transform;
    const offset = getAbsolutePosition(this.element);
    const zX = transform.center.x - offset.x - this.x;
    const zY = transform.center.y - offset.y - this.y;
    this.zoomAt(zX, zY , this.scale * 2);
    this.apply(true);
  }
  private _OnGestureMove() {
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
  private  _OnGestureEnd() {
    this.x += this.offsetX;
    this.y += this.offsetY;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentScale = this.scale;
    const event = new CustomEvent('zoomable-gesture-end', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  public translate(x : number, y : number) {
    this.offsetX = x;
    this.offsetY = y;
    const event = new CustomEvent('onTranslate', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  public zoomAt(x : number, y : number, scale : number) {
    const newZoom = scale;
    // position of click :
    const ix = x / this.scale;
    const iy = y / this.scale;
    // position of click with new zoom
    const nx = ix * newZoom;
    const ny = iy * newZoom;
    // difference
    const cx = (ix + (x - ix) - nx);
    const cy = (iy + (y - iy) - ny);
    // update
    this.scale = newZoom;
    this.x += cx;
    this.y += cy;
    const event = new CustomEvent('onZoomAt', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  public apply(animate? : boolean, duration? : number) {
    const tX = this.x + this.offsetX;
    const tY = this.y + this.offsetY;
    const _animate = animate;
    const _duration = duration;
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
      if (animate === true) {
        if (duration) {
          this.element.style.transition = `${duration}s`;
        } else {
          this.element.style.transition = '1s';
        }
      } else {
        this.element.style.transition = '0s';
      }
      this.element.style.transform = `translate(${tX}px, ${tY}px) scale(${this.scale})`;;
    }
  }
}
