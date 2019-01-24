export interface Point {
  x: number;
  y: number;
}

function center(position1 : Point, position2 : Point) : Point {
  return {
    x : (position1.x + position2.x) / 2,
    y : (position1.y + position2.y) / 2,
  };
}

function distance(position1 : Point, position2 : Point) : number {
  const deltaX = position1.x - position2.x;
  const deltaY = position1.y - position2.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export default class Transformable {
  protected _cache = Array<PointerEvent>();
  private _startPosition = {
    x : 0,
    y : 0,
  };
  private _initialDistance = 0;
  private _target : any;
  private _justStarted = false;
  private _inProgress = false;
  private _downX = 0;
  private _downY = 0;
  private _cancel = false;
  private _timeout? : any;
  constructor(public element : HTMLElement) {
    // detect gestures
    element.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this._onPointerDown.call(this, e);
    });
    element.addEventListener('pointermove', (e) => {
      e.preventDefault();
      this._onPointerMove.call(this, e);
    });
    element.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this._onPointerUp.call(this, e);
    });
    // detect pan & double-tap
    element.addEventListener('gesture-start', (e) => {
      this._onGestureStart.call(this);
    });
    element.addEventListener('gesture-move', (e) => {
      this._onGestureMove.call(this);
    });
    element.addEventListener('gesture-end', (e) => {
      this._onGestureEnd.call(this);
    });
  }
  private _onPointerDown(e : PointerEvent) {
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      return;
    }
    this._downX = e.x;
    this._downY = e.y;
    if (this._cache.length === 0) {
      this._startPosition = {
        x : e.x,
        y : e.y,
      };
      this._target = e.target;
      this._target.setPointerCapture(e.pointerId);
      this._cache.push(e);
      this._justStarted = true;
      this._initialDistance = 0;
      const event = new CustomEvent('gesture-start', { bubbles: true });
      this.element.dispatchEvent(event);
    } else {
      this._startPosition = center(this._startPosition, { x : e.x, y : e.y });
      this._initialDistance = this.getDistance();
      this._cache.push(e);
    }
  }
  private getDistance() : number {
    let _distance = 0;
    if (this._cache.length > 1) {
      for (let i = 0; i < this._cache.length - 1; i += 1) {
        const newDistance = distance(this._cache[i], this._cache[i + 1]);
        if (newDistance > _distance) {
          _distance = newDistance;
        }
      }
    }
    return _distance;
  }
  private getCenter() : Point {
    let _center;
    if (this._cache[0]) {
      _center = {
        x : this._cache[0].x,
        y : this._cache[0].y,
      };
    } else {
      _center = {
        x : this._downX,
        y : this._downY,
      };
    }
    if (this._cache.length > 1) {
      _center = center(_center, {
        x : this._cache[1].x,
        y : this._cache[1].y,
      });
    }
    return _center;
  }
  get transform() {
    const _center = this.getCenter();
    const _distance = this.getDistance() - this._initialDistance;
    const _translateX =  _center.x - this._startPosition.x;
    const _translateY = _center.y - this._startPosition.y;
    const _translation = distance(_center, this._startPosition);
    let _scale = 1;
    if (_distance !== 0 && this._initialDistance !== 0) {
      _scale +=  _distance / this._initialDistance;
    }

    return {
      center : _center,
      // https://davidwalsh.name/javascript-clone-array
      pointers : this._cache.slice(0),
      distance : _distance,
      scale : _scale,
      translateX : _translateX,
      translateY : _translateY,
      translation : _translation,
    };
  }
  private _onPointerMove(e : PointerEvent) {
    if (e.pointerType === 'mouse' && e.buttons !== 1) {
      return;
    }
    if (this._downX !== e.x && this._downY !== e.y) {
      for (let i = 0; i < this._cache.length; i += 1) {
        if (this._cache[i].pointerId === e.pointerId) {
          if (this._justStarted) {
            this._justStarted = false;
            this._initialDistance = this.getDistance();
            this._inProgress = true;
          }
          for (let i = 0; i < this._cache.length; i += 1) {
            if (this._cache[i].pointerId === e.pointerId) {
              this._cache[i] = e;
            }
          }
        }
      }
      const event = new CustomEvent('gesture-move', { bubbles: true });
      this.element.dispatchEvent(event);
    }
  }
  private _onPointerUp(e : PointerEvent) {
    if (this._inProgress) {
      this._inProgress = false;
    }
    let index = -1;
    for (let i = 0; i < this._cache.length; i += 1) {
      if (this._cache[i].pointerId === e.pointerId) {
        index = i;
      }
    }
    if (this._cache.length === 1) {
      const event = new CustomEvent('gesture-end', { bubbles: true });
      this.element.dispatchEvent(event);
    }
    if (index !== -1) {
      this._cache.splice(index, 1);
    }
  }
  private _onGestureStart() {
    this._cancel = false;
  }
  private _onGestureMove() {
    this._cancel = true;
  }
  private _onGestureEnd() {
    if (this._cancel) {
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      return;
    }
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
      const event = new CustomEvent('double-tap', { bubbles: true });
      this.element.dispatchEvent(event);
    } else {
      this._timeout = setTimeout(
        () => {
          this._timeout = null;
          const event = new CustomEvent('tap', { bubbles: true });
          this.element.dispatchEvent(event);
        },
        250);
    }
  }
}
