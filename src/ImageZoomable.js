import Zoomable from './Zoomable.js';
var ImageZoomable = /** @class */ (function () {
    function ImageZoomable(parent, src, options) {
        var _this = this;
        this.parent = parent;
        this.options = options;
        this.initialScale = 1;
        this.parent.addEventListener('onApply', function (e) {
            e.preventDefault();
            var event = e;
            var animate = event.detail.animate;
            var duration = event.detail.duration;
            var tX = event.detail.x;
            var tY = event.detail.y;
            var scale = event.detail.scale;
            if (animate === true) {
                if (duration) {
                    _this.img.style.transition = duration + "s";
                }
                else {
                    _this.img.style.transition = '1s';
                }
            }
            else {
                _this.img.style.transition = '0s';
            }
            _this.img.style.transform = "translate(" + tX + "px, " + tY + "px) scale(" + scale + ")";
        });
        this.zoomable = new Zoomable(this.parent, this.options);
        if (typeof src === 'string') {
            this.img = document.createElement('img');
            this.img.style.transformOrigin = '0 0 0';
            this.img.onload = function () {
                parent.appendChild(_this.img);
                _this.responsive();
                var event = new CustomEvent('background-ready', { bubbles: true });
                _this.parent.dispatchEvent(event);
            };
            this.img.src = src;
        }
        else if (typeof src === 'object') {
            this.img = src;
            this.img.style.transformOrigin = '0 0 0';
            this.responsive();
        }
        this.parent.addEventListener('zoomable-gesture-end', function () {
            _this.bound.call(_this);
        });
        window.addEventListener('resize', function () {
            _this.responsive();
        });
    }
    ImageZoomable.prototype.isInlineSVG = function () {
        return typeof this.img.width === 'object';
    };
    ImageZoomable.prototype.getImgWidth = function () {
        return (this.isInlineSVG()) ? this.img.width.baseVal.value : this.img.width;
    };
    ImageZoomable.prototype.getImgOffsetWidth = function () {
        return (this.isInlineSVG()) ? this.img.width.baseVal.value : this.img.offsetWidth;
    };
    ImageZoomable.prototype.getImgHeight = function () {
        return (this.isInlineSVG()) ? this.img.height.baseVal.value : this.img.height;
    };
    ImageZoomable.prototype.bound = function () {
        if (this.options && this.options.bound === false) {
            return;
        }
        if (this.zoomable.scale < this.initialScale) {
            this.responsive();
            return;
        }
        var width = this.getImgWidth() * this.zoomable.currentScale;
        var height = this.getImgHeight() * this.zoomable.currentScale;
        if (width < this.parent.offsetWidth) {
            this.zoomable.x = (this.parent.offsetWidth - width) / 2;
        }
        else {
            if (this.zoomable.x > 0) {
                this.zoomable.x = 0;
            }
            if (this.zoomable.x < this.parent.offsetWidth - width) {
                this.zoomable.x = this.parent.offsetWidth - width;
            }
        }
        if (height < this.parent.offsetHeight) {
            this.zoomable.y = (this.parent.offsetHeight - height) / 2;
        }
        else {
            if (this.zoomable.y > 0) {
                this.zoomable.y = 0;
            }
            if (this.zoomable.y < this.parent.offsetHeight - height) {
                this.zoomable.y = this.parent.offsetHeight - height;
            }
        }
        this.zoomable.apply(true, 0.5);
    };
    ImageZoomable.prototype.responsive = function (animate, duration) {
        var ratio = this.getImgWidth() / this.getImgHeight();
        var width = this.parent.offsetWidth;
        var height = width / ratio;
        if (height > this.parent.offsetHeight) {
            height = this.parent.offsetHeight;
            width = height * ratio;
        }
        var scale = width / this.getImgOffsetWidth();
        var x = 0;
        var y = 0;
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
    };
    return ImageZoomable;
}());
export default ImageZoomable;
//# sourceMappingURL=ImageZoomable.js.map