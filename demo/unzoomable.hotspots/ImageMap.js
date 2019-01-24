var Hotspot = function(x, y, src) {
    this.x = x;
    this.y = y;
    this.src = src;
    this.element = document.createElement('img');
    this.element.style.position = 'absolute';
    this.element.className = 'hotspot';
    this.element.style.zIndex = '9999';
    var self = this;
    this.element.onload = function() {
        self.element.style.top = -(self.element.height) + 'px';
        self.element.style.left =  -(self.element.width / 2) + 'px';
    };

    this.element.src = src;
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
    this.element.style.transform = 'translate('+ translateX + 'px, '+ translateY +'px)';
};
var ImageMap = function(container, backgroundImage) {
    this.container = container;
    this.zoomable = new Zoomable(container, backgroundImage);
    this.hotspots = [];
    var hotspots = this.hotspots;
    this.zoomable.img.addEventListener("onApply", function(e) {
        hotspots.forEach(function(hotspot) {
            hotspot.apply(e.detail.x, e.detail.y, e.detail.scale, e.detail.animate, e.detail.duration)
        });
    });
};
ImageMap.prototype.addHotspot = function(x, y, src) {
    var hotspot = new Hotspot(x, y, src);
    this.hotspots.push(hotspot);
    this.container.appendChild(hotspot.element);
    return hotspot;
};
