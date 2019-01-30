import Zoomable from './Zoomable.js';

export default class ImageZoomable {
  public img : HTMLImageElement;
  private zoomable : Zoomable;
  private initialScale = 1;
  constructor(public parent : HTMLElement, src : string) {
    this.parent.addEventListener('onApply', (e) => {
      e.preventDefault();
      const event = <CustomEvent> e;
      const animate = event.detail.animate;
      const duration = event.detail.duration;
      const tX = event.detail.x;
      const tY = event.detail.y;
      const scale = event.detail.scale;
      if (animate === true) {
        if (duration) {
          this.img.style.transition = `${duration}s`;
        } else {
          this.img.style.transition = '1s';
        }
      } else {
        this.img.style.transition = '0s';
      }
      this.img.style.transform = `translate(${tX}px, ${tY}px) scale(${scale})`;
    });
    this.img = document.createElement('img');
    this.img.style.transformOrigin = '0 0 0';
    this.zoomable = new Zoomable(this.parent);
    this.img.onload = () => {
      parent.appendChild(this.img);
      this.responsive();
    };
    this.img.src = src;
    this.parent.addEventListener('zoomable-gesture-end', () => {
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
    const scale = width / this.img.offsetWidth;
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
