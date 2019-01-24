import Zoomable from './Zoomable.js';

export default class ImageZoomable {
  public img : HTMLImageElement;
  private zoomable : Zoomable;
  private initialScale = 1;
  constructor(public parent : HTMLElement, src : string) {
    this.img = document.createElement('img');
    this.zoomable = new Zoomable(this.img);
    this.img.onload = () => {
      this.responsive();
      parent.appendChild(this.img);
    };
    this.img.src = src;
    this.img.addEventListener('zoomable-gesture-end', () => {
      this.bound.call(this);
    });
    window.addEventListener('resize', () => {
      this.responsive();
    });
  }
  private bound() {
    if (this.zoomable.scale < this.initialScale) {
      this.responsive();
      return;
    }
    const width = this.img.width * this.zoomable.currentScale;
    const height = this.img.height * this.zoomable.currentScale;
    if (width < this.parent.offsetWidth) {
      this.zoomable.x = (this.parent.offsetWidth - width) / 2;
    } else {
      if (this.zoomable.x > 0) {
        this.zoomable.x = 0;
      }
      if (this.zoomable.x < this.parent.offsetWidth - width) {
        this.zoomable.x = this.parent.offsetWidth - width;
      }
    }
    if (height < this.parent.offsetHeight) {
      this.zoomable.y = (this.parent.offsetHeight - height) / 2;
    } else {
      if (this.zoomable.y > 0) {
        this.zoomable.y = 0;
      }
      if (this.zoomable.y < this.parent.offsetHeight - height) {
        this.zoomable.y = this.parent.offsetHeight - height;
      }
    }
    this.zoomable.apply(true, 0.5);
  }
  private responsive() {
    const ratio = this.img.width / this.img.height;
    let width = this.parent.offsetWidth;
    let height = width / ratio;
    if (height > this.parent.offsetHeight) {
      height = this.parent.offsetHeight;
      width = height * ratio;
    }
    const scale = width / this.img.width;
    let x = 0;
    let y = 0;
    if (height < this.parent.offsetHeight) {
      y = (this.parent.offsetHeight - height) / 2;
    }
    if (width < this.parent.offsetWidth) {
      x = (this.parent.offsetWidth - width) / 2;
    }
    this.zoomable.x = x;
    this.zoomable.y = y;
    this.zoomable.scale = scale;
    this.zoomable.currentScale = scale;
    this.initialScale = scale;
    this.zoomable.apply();
  }
}
