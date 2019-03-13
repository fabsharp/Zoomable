import "./polyfills/CustomEvent.js";
export * from '../node_modules/pepjs/src/pointerevents.js';
import ImageZoomable from './ImageZoomable.js';
export default function (element, src, options) {
    return new ImageZoomable(element, src, options);
}