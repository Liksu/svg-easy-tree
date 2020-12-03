import Tree from './tree';

// get element from page and calculate sizes
const wrapper = document.getElementById('chart-wrapper');
let {width, height} = window.getComputedStyle(wrapper);
width = parseFloat(width);
height = parseFloat(height);

// set chart params
const margin = 5;
const xStep = width / 10;
const yStep = height / 10;
const yMin = yStep;
const yMax = height - yStep - margin;
const font = 10;
const fontConfig = {
    'font-size': font,
    'alignment-baseline': 'middle',
    'text-anchor': 'middle',
    'font-family': 'sans-serif'
};

const g = {
    tag: 'g',
    sav: true,
    sub: []
};

// create an empty chart
const tree = new Tree({
    _id: 'main',
    tag: 'svg',
    sav: true,
    opt: {width, height, viewBox: `0 0 ${width} ${height}`},
    sub: [
        // background
        {
            tag: 'rect',
            opt: {width, height, fill: 'aliceblue'}
        },
        // vertical axis
        {
            tag: 'line',
            opt: {
                x1: margin, y1: 13,
                x2: margin, y2: height,
                stroke: 'navy'
            }
        },
        // horizontal axis
        {
            tag: 'line',
            opt: {
                x1: 0, y1: height - margin,
                x2: width - font, y2: height - margin,
                stroke: 'navy'
            }
        },
        // X letter
        {
            tag: 'text',
            val: 'x',
            opt: Object.assign({
                x: width - margin,
                y: height - margin
            }, fontConfig)
        },
        // Y letter
        {
            tag: 'text',
            val: 'y',
            opt: Object.assign({
                x: margin,
                y: margin
            }, fontConfig)
        },
        // container for series
        g
    ]
});

function generate() {
    // clear g
    g.sub.splice(0);

    // define start point
    let x1 = xStep + margin;
    let y1 = Math.floor(Math.random() * (yMax - yMin)) + yMin;

    // run loop to create chart series
    let n = 8;
    while (n--) {
        // calculate end point
        let x2 = x1 + xStep;
        let y2 = Math.floor(Math.random() * (yMax - yMin)) + yMin;

        // add line and circle to the subtree of g
        tree.append(g, [
            {
                tag: 'line',
                opt: {x1, y1, x2, y2, stroke: 'navy'}
            },
            {
                tag: 'circle',
                opt: {
                    cx: x1, cy: y1, r: 2,
                    stroke: 'red', 'stroke-width': 1, fill: 'red'
                }
            }
        ]);

        // store new coordinates
        [x1, y1] = [x2, y2];
    }

    // append last circle
    tree.append(g, {
        tag: 'circle',
        opt: {
            cx: x1, cy: y1, r: 2,
            stroke: 'red', 'stroke-width': 1, fill: 'red'
        }
    });
}

// create series
generate();
// compile tree and add it on page
tree.compile(null, wrapper);

// change chart every 5 seconds
setInterval(() => {
    // update series
    generate();
    // update chart
    tree.recompile()
}, 5000);