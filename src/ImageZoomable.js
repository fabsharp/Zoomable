import Zoomable from './Zoomable.js';
var ImageZoomable = /** @class */ (function () {
    function ImageZoomable(parent, src) {
        var _this = this;
        this.parent = parent;
        this.initialScale = 1;
        this.img = document.createElement('img');
        this.zoomable = new Zoomable(this.img);
        this.img.onload = function () {
            _this.responsive();
            parent.appendChild(_this.img);
        };
        this.img.src = src;
        this.img.addEventListener('zoomable-gesture-end', function () {
            _this.bound.call(_this);
        });
        window.addEventListener('resize', function () {
            _this.responsive();
        });
    }
    ImageZoomable.prototype.bound = function () {
        if (this.zoomable.scale < this.initialScale) {
            this.responsive();
            return;
        }
        var width = this.img.width * this.zoomable.currentScale;
        var height = this.img.height * this.zoomable.currentScale;
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
    ImageZoomable.prototype.responsive = function () {
        var ratio = this.img.width / this.img.height;
        var width = this.parent.offsetWidth;
        var height = width / ratio;
        if (height > this.parent.offsetHeight) {
            height = this.parent.offsetHeight;
            width = height * ratio;
        }
        var scale = width / this.img.width;
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
        this.zoomable.apply();
    };
    return ImageZoomable;
}());
export default ImageZoomable;
//# sourceMappingURL=ImageZoomable.js.map