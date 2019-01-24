import { terser } from "rollup-plugin-terser";

const iffe = {
    input: 'src/index.js',
    output: {
        file: 'dist/zoomable.js',
        format: 'iife',
        name: 'Zoomable'
    },
};

const iffeMin = {
    input: 'src/index.js',
    plugins: [
        terser({
            compress: { ecma: 6 },
        })
    ],
    output: {
        file: 'dist/zoomable-min.js',
        format: 'iife',
        name : 'Zoomable'
    },
};

export default [iffe, iffeMin];