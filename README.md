# Zoomable
Zoomable DOM elements with pinch / double tap / mouse wheel.

## Get started:
```javascript
var zoomable = new Zoomable(document.getElementById("wrapper"), 'img.jpg', {
    gestures: {
        // See ImageMap full example
    },
    zoomMax: 4,
    bound: true
});
```

## ImageMap:
Simple example:
```javascript
var map = new ImageMap(document.getElementById("wrapper"), 'img.jpg');
var hotspot = map.addHotspot(1500, 900, './hotspot.png');
hotspot.element.addEventListener('click', function(e) {
    console.log("click on hotspot");
});
map.resetZoom(true, 0.75);
```

Full options example:
```javascript
var map = new ImageMap(document.getElementById("wrapper"), document.getElementById("myInlineSVG"), {
    gestures: {
        doubleTap: true,
        onDoubleTap: () => {
            console.log('onDoubleTap');
            return false; //Do not execute default action
        },
        pan: true,
        onPan: () => {
            console.log('onPan');
        },
        zoom: true,
        onZoom: () => {
            console.log('onZoom');
        }
    },
    zoomMax: 4,
    bound: true
});

document.getElementById("wrapper").addEventListener('background-ready', function(){
    console.log('background-ready !!');
});

var hotspot = map.addHotspot(1000, 750, './hotspot.png', false, {
    id: "myHotspotId",
    classes: ["plop", "foo", "test"],
    css: {
        zIndex: '12',
        marginTop: '15px'
    },
    data: {
        name: 'hotspot #2',
        whatever: 'This is for the example'
    }
});
hotspot.element.addEventListener('pointerup', function(e) {
    console.log("click on ", this.zoomableData.name);
    console.log(this.zoomableData.whatever);
});
```