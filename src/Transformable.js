function center(position1, position2) {
    return {
        x: (position1.x + position2.x) / 2,
        y: (position1.y + position2.y) / 2,
    };
}
function distance(position1, position2) {
    var deltaX = position1.x - position2.x;
    var deltaY = position1.y - position2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
var Transformable = /** @class */ (function () {
    function Transformable(element) {
        var _this = this;
        this.element = element;
        this._cache = Array();
        this._startPosition = {
            x: 0,
            y: 0,
        };
        this._initialDistance = 0;
        this._justStarted = false;
        this._inProgress = false;
        this._downX = 0;
        this._downY = 0;
        this._cancel = false;
        this._threshold = 10;
        // detect gestures
        element.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            _this._onPointerDown.call(_this, e);
        });
        element.addEventListener('pointermove', function (e) {
            e.preventDefault();
            _this._onPointerMove.call(_this, e);
        });
        element.addEventListener('pointerup', function (e) {
            e.preventDefault();
            _this._onPointerUp.call(_this, e);
        });
        // detect pan & double-tap
        element.addEventListener('gesture-start', function (e) {
            _this._onGestureStart.call(_this, e);
        });
        element.addEventListener('gesture-move', function (e) {
            _this._onGestureMove.call(_this, e);
        });
        element.addEventListener('gesture-end', function (e) {
            _this._onGestureEnd.call(_this, e);
        });
    }
    Transformable.prototype._onPointerDown = function (e) {
        if (e.pointerType === 'mouse' && e.buttons !== 1) {
            return;
        }
        this._downX = e.clientX;
        this._downY = e.clientY;
        if (this._cache.length === 0) {
            this._startPosition = {
                x: e.clientX,
                y: e.clientY,
            };
            this._target = e.target;
            this._target.setPointerCapture(e.pointerId);
            this._cache.push(e);
            this._justStarted = true;
            this._initialDistance = 0;
            var details = {
                bubbles: true,
                detail: {
                    srcEvent: e,
                },
            };
            var event_1 = new CustomEvent('gesture-start', details);
            this.element.dispatchEvent(event_1);
        }
        else {
            this._startPosition = center(this._startPosition, { x: e.x, y: e.y });
            this._initialDistance = this.getDistance();
            this._cache.push(e);
        }
    };
    Transformable.prototype.getDistance = function () {
        var _distance = 0;
        if (this._cache.length > 1) {
            for (var i = 0; i < this._cache.length - 1; i += 1) {
                var newDistance = distance(this._cache[i], this._cache[i + 1]);
                if (newDistance > _distance) {
                    _distance = newDistance;
                }
            }
        }
        return _distance;
    };
    Transformable.prototype.getCenter = function () {
        var _center;
        if (this._cache[0]) {
            _center = {
                x: this._cache[0].clientX,
                y: this._cache[0].clientY,
            };
        }
        else {
            _center = {
                x: this._downX,
                y: this._downY,
            };
        }
        if (this._cache.length > 1) {
            _center = center(_center, {
                x: this._cache[1].clientX,
                y: this._cache[1].clientY,
            });
        }
        return _center;
    };
    Object.defineProperty(Transformable.prototype, "transform", {
        get: function () {
            var _center = this.getCenter();
            var _distance = this.getDistance() - this._initialDistance;
            var _translateX = _center.x - this._startPosition.x;
            var _translateY = _center.y - this._startPosition.y;
            var _translation = distance(_center, this._startPosition);
            var _scale = 1;
            if (_distance !== 0 && this._initialDistance !== 0) {
                _scale += _distance / this._initialDistance;
            }
            return {
                center: _center,
                // https://davidwalsh.name/javascript-clone-array
                pointers: this._cache.slice(0),
                distance: _distance,
                scale: _scale,
                translateX: _translateX,
                translateY: _translateY,
                translation: _translation,
            };
        },
        enumerable: true,
        configurable: true
    });
    Transformable.prototype._onPointerMove = function (e) {
        if (e.pointerType === 'mouse' && e.buttons !== 1) {
            return;
        }
        if (this._downX !== e.clientX && this._downY !== e.clientY) {
            for (var i = 0; i < this._cache.length; i += 1) {
                if (this._cache[i].pointerId === e.pointerId) {
                    if (this._justStarted) {
                        this._justStarted = false;
                        this._initialDistance = this.getDistance();
                        this._inProgress = true;
                    }
                    for (var i_1 = 0; i_1 < this._cache.length; i_1 += 1) {
                        if (this._cache[i_1].pointerId === e.pointerId) {
                            this._cache[i_1] = e;
                        }
                    }
                }
            }
            var details = {
                bubbles: true,
                detail: {
                    srcEvent: e,
                },
            };
            var event_2 = new CustomEvent('gesture-move', details);
            this.element.dispatchEvent(event_2);
        }
    };
    Transformable.prototype._onPointerUp = function (e) {
        if (this._inProgress) {
            this._inProgress = false;
        }
        var index = -1;
        for (var i = 0; i < this._cache.length; i += 1) {
            if (this._cache[i].pointerId === e.pointerId) {
                index = i;
            }
        }
        if (this._cache.length === 1) {
            var details = {
                bubbles: true,
                detail: {
                    srcEvent: e,
                },
            };
            var event_3 = new CustomEvent('gesture-end', details);
            this.element.dispatchEvent(event_3);
        }
        if (index !== -1) {
            this._cache.splice(index, 1);
        }
    };
    Transformable.prototype._onGestureStart = function (e) {
        this._cancel = false;
    };
    Transformable.prototype._onGestureMove = function (e) {
        var point1 = {
            x: e.detail.srcEvent.clientX,
            y: e.detail.srcEvent.clientY,
        };
        var point2 = {
            x: this._downX,
            y: this._downY,
        };
        if (Math.abs(distance(point1, point2)) > this._threshold) {
            this._cancel = true;
        }
    };
    Transformable.prototype._onGestureEnd = function (e) {
        var _this = this;
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
            var event_4 = new CustomEvent('double-tap', { bubbles: true });
            this.element.dispatchEvent(event_4);
        }
        else {
            this._timeout = setTimeout(function () {
                _this._timeout = null;
                var event = new CustomEvent('tap', { bubbles: true });
                _this.element.dispatchEvent(event);
            }, 250);
        }
    };
    return Transformable;
}());
export default Transformable;
//# sourceMappingURL=Transformable.js.map