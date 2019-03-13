import Zoomable from './Zoomable.js';

export default class ImageZoomable {
  public img : any;
  private zoomable : Zoomable;
  private initialScale = 1;
  constructor(public parent : HTMLElement, src : string, private options?: any) {
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
    this.zoomable = new Zoomable(this.parent, this.options);
    if (typeof src === 'string') {
      this.img = document.createElement('img');
      this.img.style.transformOrigin = '0 0 0';
      this.img.onload = () => {
        parent.appendChild(this.img);
        this.responsive();
        const event = new CustomEvent('background-ready', { bubbles: true });
        this.parent.dispatchEvent(event);
      };
      this.img.src = src;
    } else if (typeof src === 'object') {
      this.img = src;
      this.img.style.transformOrigin = '0 0 0';
      this.responsive();
    }
    this.parent.addEventListener('zoomable-gesture-end', () => {
      this.bound.call(this);
    });
    window.addEventListener('resize', () => {
      this.responsive();
    });
  }
  private isInlineSVG() :boolean {
    return typeof this.img.width === 'object';
  }
  private getImgWidth() :number {
    return (this.isInlineSVG()) ? this.img.width.baseVal.value : this.img.width;
  }
  private getImgOffsetWidth() :number {
    return (this.isInlineSVG()) ? this.img.width.baseVal.value : this.img.offsetWidth;
  }
  private getImgHeight() :number {
    return (this.isInlineSVG()) ? this.img.height.baseVal.value : this.img.height;
  }
  private bound() {
    if (this.options && this.options.bound === false) {
      return;
    }
    if (this.zoomable.scale < this.initialScale) {
      this.responsive();
      return;
    }
    const width = this.getImgWidth() * this.zoomable.currentScale;
    const height = this.getImgHeight() * this.zoomable.currentScale;
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
  private responsive(animate? : boolean, duration? : number) {
    const ratio = this.getImgWidth() / this.getImgHeight();

    let width = this.parent.offsetWidth;
    let height = width / ratio;
    if (height > this.parent.offsetHeight) {
      height = this.parent.offsetHeight;
      width = height * ratio;
    }
    const scale = width / this.getImgOffsetWidth();
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
    this.zoomable.apply(animate, duration);
  }
}
