# svg-easy-tree

Compiles simple tree object into DOM structure (SVG or HTML) and add it to a parent element.

Tree is a structure of `node` objects that describes DOM that you want to get.

Content:

* [Node](#node)
  * [tag](#property-tag)
  * [opt](#property-opt)
  * [val](#property-val)
  * [sub](#property-sub)
  * [_id](#property-_id)
  * [sav](#properties-sav-and-_el)
  * [_el](#properties-sav-and-_el)
* [Properties](#tree-instance-properties)
  * [tree](#tree)
  * [xmlns](#xmlns)
* [Methods](#methods)
  * [constructor](#constructor)
  * [compile](#compile)
  * [recompile](#recompile)
  * [find](#find)
  * [append](#append)
  * [prepend](#prepend)
  * [analyze](#analyze)
* [Example](#example)

---

## Node

Each `node` is an object that represents one DOM element.

Allowed properties (jsdoc notation):

```
 @property {String}         tag
 @property {String|Number} [_id]
 @property {Object}        [opt]
 @property {String|Number} [val]
 @property {Boolean}       [sav]
 @property {Array<node>}   [sub]
 @property {Element}       [_el]
```

All other properties and methods of node will be ignored.
So that, you can create a class that represent and take care about a part of the tree
and put its instance inside as a node. In this case, class can operate with created element
via provided `_el` property, or modify own node properties and use `recompile`.

#### Property `tag`

_Type: String_

Element tag name. For example `'svg'`.

It will produce element `<svg></svg>`.

Also, `tag` can contain an `Element` instance, and it will be updated with other passed settings.

#### Property `opt`

_Type: Object_

Plain object that contains all element attributes.

Example:

```json
{
  "tag": "svg",
  "opt": {
           "width": 400,
           "height": 400,
           "viewBox": "0 0 400 400"
         }
}
```

will produce

```html
<svg width="400" height="400" viewBox="0 0 400 400"></svg>
```

#### Property `val`

_Type: String &#124; Number_

Sets the inner value of created element. By default, that means some text or number,
but in real the passed value will be put in the element.innerHTML,
so it can be anything, including other elements markup.

Example:

```json
{
  "tag": "text",
  "val": "42 is the Answer"
}
```

Result:

```html
<text>42 is the Answer</text>
```

#### Property `sub`

_Type: Array&lt;node&gt;_

Contains subtree, array of nodes that will be compiled recursively.
Can also contains everything, that can be appended to DOM element.

This property will be processed after `val` property, so subtree will be appended after element's value.

Example:

```js
tspan = document.createElement('tspan');
tspan.innerHTML = '42';

new Tree().compile({
  "tag": "svg",
  "sub": [
    {tag: 'text', sub: [tspan]},
    {tag: 'line', opt: {x1: 0, y1: 0, x2: 100, y2: 100}}
  ]
})
```

Result (pretty printed):

```html
<svg>
    <text>
        <tspan>42</tspan>
    </text>
    <line x1="0" y1="0" x2="100" y2="100"></line>
</svg>
```

#### Property `_id`

_Type: String_

Sets `x-id` attribute, that allows finding node into the DOM or in the tree.

Not replace `id` attribute, so in the DOM, you still can set `id` with `opt`
and then get a generated element using `getElementById`.

Example:

```json
{
  "tag": "text",
  "opt": {
    "id": "text-element",
    "data": {
      "innerId": "dataId"
    }
  },
  "_id": "text-node"
}
```

Result:

```html
<text id="text-element" data-inner-id="dataId" x-id="text-node"></text>
```

#### Properties `sav` and `_el`

_Type `sav`: Boolean_

_Type `_el`: SVGElement &#124; HTMLElement_

Two these properties are directly tied, because `_el` property
will automatically contains link to generated DOM element, if `sav` property sets to `true`.

Example:

```js
const treeObject = {
  "tag": "text",
  "_id": "text-node",
  "sav": true
};

new Tree().compile(treeObject)
```

Result:

content of `treeObject`:

```json
{
    "tag": "text",
    "_id": "text-node",
    "sav": true,
    "opt": {"x-id": "text-node"},
    "_el": text
}
```

where `text` is a link to generated `SVGElement`, and `treeObject._el.outerHTML` returns:

```html
<text x-id="text-node"></text>
```

## Tree instance properties

### tree

Contains tree structure to work with.

### xmlns

Represents namespace for created elements.

## Methods

### constructor

Creates an instance of `Tree`.

Parameters:

* `initialTree` - optional, `node` that contains tree to start working with, default `{}`
* `xmlns` - optional, namespace that will be used for creating elements. By default will be used SVG namespace.

### compile

Compiles a passed `node` to Element (HTML or SVG, depends on `xmlns` parameter in the constructor),
and append it to parent, if passed.

Parameters:

* `node` - optional, node to process, `this.tree` by default,
means tree, that was passed as `initialTree` to constructor and stored to further work.
* `parent` - optional, DOM Element to append compiled element

Returns created element.

### recompile

Compile a new node and replace an old element with it.

Requires to be enabled `sav` into a previously compiled node (at least it should exist `_el` link to existed element in the DOM).

It is possible to update `node` into the tree and run `recompile`, without passing any parameters,
in this case whole tree will be recompiled and updated into the DOM.

Parameters:

* `oldNode` - optional, node to be removed, `this.tree` by default
* `newNode` - optional, node to be compiled and placed instead of old node, `oldNode` by default

### find

Find matches node from the tree.

Needs some rework, so now it is better to use as search by `_id`.

Parameters:

* `selector` - string describes search conditions (`_id` to find)
* `tree` - optional, node to start recursive search, `this.tree` by default

Returns found node or `null`.

### append

Appends passed subtree (node) to parent `sub`.

Parameters:

* `node` - parent node, that will contains subtree
* `subTree` - node to append
* `before` - optional, boolean flag that change append method to prepend, `false` by default

Returns `node`.

There are two options to use: `append(node, subTree)` and `append(subTree)`.

In the second variant, `subTree` will be added to `this.tree`.

### prepend

Same as `append`, but set `before` flag to `true`.

### analyze

Restore tree from existing DOM element.

Parameters:

* `element` - DOM element to analyze

Returns `node` with serialized tree.

## Example

<div id="chart-wrapper" style="width: 500px; height: 300px"></div>

```js
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
```

<noscript>
    <p>Check working example <a src="https://liksu.github.io/svg-easy-tree/#example">here</a>.</p>
    <p>And nevermind next script tag (if shown) 😉</p>
</noscript>
<script src="README.js" type="module"></script>