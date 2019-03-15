var Hotspot = function(x, y, src, scale, data) {
    var self = this;
    this.x = x;
    this.y = y;
    this.scaleOpt = (typeof scale === 'boolean') ? scale : false;
    if (typeof src === 'string') {
        this.element = document.createElement('img');
        this.element.onload = function() {
            self.element.style.top = (self.scaleOpt) ? (-(self.element.height / 2) + 'px') : (-(self.element.height) + 'px');
            self.element.style.left =  -(self.element.width / 2) + 'px';
        };
        this.element.src = src;
    } else if (typeof src === 'object') {
        this.element = src;
        this.element.style.top = (this.scaleOpt) ? (-(this.element.height / 2) + 'px') : (-(this.element.height) + 'px');
        this.element.style.left =  -(this.element.width / 2) + 'px';
    }
    this.element.style.position = 'absolute';
    this.element.className = 'hotspot';
    if(data) {
        if(data.id) {
            this.element.id = data.id;
        }
        if(data.classes && (data.classes.length > 0)) {
            data.classes.forEach(function(_class){
                self.element.classList.add(_class);
            });
        }
        if(data.css) {
            Object.keys(data.css).forEach(function(_key){
                self.element.style[_key] = data.css[_key];
            });
        }
        if(data.data){
            this.element.zoomableData = data.data;
        }
    }
    if((!data) || (!data.css) || (!data.css.zIndex)){
        self.element.style.zIndex = '1';
    }
};
Hotspot.prototype.apply = function(tX, tY, scale, animate, duration) {
    if (animate === true) {
        if (duration) {
            this.element.style.transition = duration +'s';
        } else {
            this.element.style.transition = '1s';
        }
    } else {
        this.element.style.transition = '0s';
    }
    var translateX = tX + this.x * scale;
    var translateY = tY + this.y * scale;
    this.element.style.transform = (this.scaleOpt) ? 'translate('+ translateX + 'px, '+ translateY +'px) scale(' + scale + ', ' + scale + ')' : 'translate('+ translateX + 'px, '+ translateY +'px)';
};
var ImageMap = function(container, backgroundImage, options) {
    this.container = container;
    this.zoomable = new Zoomable(container, backgroundImage, options);
    this.hotspots = [];
    var hotspots = this.hotspots;
    this.zoomable.parent.addEventListener("onApply", function(e) {
        hotspots.forEach(function(hotspot) {
            hotspot.apply(e.detail.x, e.detail.y, e.detail.scale, e.detail.animate, e.detail.duration)
        });
    });
};
ImageMap.prototype.addHotspot = function(x, y, src, scale, data) {
    var hotspot = new Hotspot(x, y, src, scale, data);
    this.hotspots.push(hotspot);
    this.container.appendChild(hotspot.element);
    return hotspot;
};
ImageMap.prototype.resetZoom = function(animate, duration) {
    this.zoomable.responsive(animate, duration);
};