var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Transformable from './Transformable.js';
import { addWheelListener } from './polyfills/MouseWheel.js';
export function getAbsolutePosition(element) {
    var el = element;
    var x = 0;
    var y = 0;
    while (el) {
        if (el.tagName === 'BODY') {
            // deal with browser quirks with body/window/document and page scroll
            var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = el.scrollTop || document.documentElement.scrollTop;
            x += (el.offsetLeft - xScroll + el.clientLeft);
            y += (el.offsetTop - yScroll + el.clientTop);
        }
        else {
            // for all other non-BODY elements
            x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            y += (el.offsetTop - el.scrollTop + el.clientTop);
        }
        el = el.offsetParent;
    }
    return { x: x, y: y };
}
var Zoomable = /** @class */ (function (_super) {
    __extends(Zoomable, _super);
    function Zoomable(element) {
        var _this = _super.call(this, element) || this;
        _this.element = element;
        _this.offsetX = 0;
        _this.offsetY = 0;
        _this.scale = 1;
        _this.x = 0;
        _this.y = 0;
        _this.currentScale = 1;
        _this.element.addEventListener('gesture-move', function () {
            _this._OnGestureMove.call(_this);
        });
        _this.element.addEventListener('gesture-end', function () {
            _this._OnGestureEnd.call(_this);
        });
        _this.element.addEventListener('double-tap', function () {
            _this._onDoubleTap.call(_this);
        });
        addWheelListener(element, function (e) {
            e.preventDefault();
            var offset = getAbsolutePosition(element);
            var zX;
            var zY;
            if (e.originalEvent) {
                // for IE10 & IE11
                zX = e.originalEvent.clientX - offset.x - _this.x;
                zY = e.originalEvent.clientY - offset.y - _this.y;
            }
            else {
                // for others
                zX = e.clientX - offset.x - _this.x;
                zY = e.clientY - offset.y - _this.y;
            }
            if (e.deltaY > 0) {
                _this.zoomAt(zX, zY, _this.scale * 0.7);
            }
            else {
                _this.zoomAt(zX, zY, _this.scale * 1.3);
            }
            _this.apply(false);
            _this.currentScale = _this.scale;
            var event = new CustomEvent('zoomable-gesture-end', { bubbles: true });
            _this.element.dispatchEvent(event);
        });
        return _this;
    }
    Zoomable.prototype._onDoubleTap = function () {
        var transform = this.transform;
        var offset = getAbsolutePosition(this.element);
        var zX = transform.center.x - offset.x - this.x;
        var zY = transform.center.y - offset.y - this.y;
        this.zoomAt(zX, zY, this.scale * 2);
        this.apply(true);
    };
    Zoomable.prototype._OnGestureMove = function () {
        var transform = this.transform;
        var offset = getAbsolutePosition(this.element);
        var zX = transform.center.x - offset.x - this.x;
        var zY = transform.center.y - offset.y - this.y;
        if (this._cache.length > 1) {
            this.zoomAt(zX, zY, transform.scale * this.currentScale);
        }
        this.translate(transform.translateX, transform.translateY);
        this.apply(false);
    };
    Zoomable.prototype._OnGestureEnd = function () {
        this.x += this.offsetX;
        this.y += this.offsetY;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentScale = this.scale;
        var event = new CustomEvent('zoomable-gesture-end', { bubbles: true });
        this.element.dispatchEvent(event);
    };
    Zoomable.prototype.translate = function (x, y) {
        this.offsetX = x;
        this.offsetY = y;
        var event = new CustomEvent('onTranslate', { bubbles: true });
        this.element.dispatchEvent(event);
    };
    Zoomable.prototype.zoomAt = function (x, y, scale) {
        var newZoom = scale;
        // position of click :
        var ix = x / this.scale;
        var iy = y / this.scale;
        // position of click with new zoom
        var nx = ix * newZoom;
        var ny = iy * newZoom;
        // difference
        var cx = (ix + (x - ix) - nx);
        var cy = (iy + (y - iy) - ny);
        // update
        this.scale = newZoom;
        this.x += cx;
        this.y += cy;
        var event = new CustomEvent('onZoomAt', { bubbles: true });
        this.element.dispatchEvent(event);
    };
    Zoomable.prototype.apply = function (animate, duration) {
        // TODO : trace apply on IE10, it is called every pointermove ?
        // TODO : tons of console errors in IE10 ?
        var tX = this.x + this.offsetX;
        var tY = this.y + this.offsetY;
        var _animate = animate;
        var _duration = duration;
        var details = {
            bubbles: true,
            detail: {
                x: tX,
                y: tY,
                scale: this.scale,
                animate: _animate,
                duration: _duration,
            },
            cancelable: true,
        };
        var event = new CustomEvent('onApply', details);
        var cancelled = !this.element.dispatchEvent(event);
        if (!cancelled) {
            if (animate === true) {
                if (duration) {
                    this.element.style.transition = duration + "s";
                }
                else {
                    this.element.style.transition = '1s';
                }
            }
            else {
                this.element.style.transition = '0s';
            }
            this.element.style.transform = "translate(" + tX + "px, " + tY + "px) scale(" + this.scale + ")";
        }
    };
    return Zoomable;
}(Transformable));
export default Zoomable;
//# sourceMappingURL=Zoomable.js.map