/**
 * (c) Petro Borshchahivskyi
 * https://github.com/Liksu/svg-easy-tree
 */

/**
 * @typedef  {Object}    node
 * @property {String}         tag
 * @property {String|Number} [_id]
 * @property {Object}        [opt]
 * @property {String|Number} [val]
 * @property {Boolean}       [sav]
 * @property {Array<node>}   [sub]
 * @property {Element}       [_el]
 */

/**
 * @property {node} tree
 * @property {string} xmlns
 */
export default class Tree {
    static ns_HTML = 'http://www.w3.org/1999/xhtml';
    static ns_SVG = 'http://www.w3.org/2000/svg';
    static attributeId = 'x-id';

    /**
     * @param {node|Element} [initialTree]
     * @param {string} [xmlns]
     */
    constructor(initialTree, xmlns = Tree.ns_SVG) {
        this.xmlns = xmlns;
        this.tree = initialTree instanceof Element
            ? this.analyze(initialTree)
            : initialTree || {};
    }

    /**
     * Create dom element from node object
     *
     * @param {node|Element} node
     * @param {Element} [parent]
     * @returns {Element}
     */
    createNode(node, parent) {
        const el = node.tag instanceof Element ? node.tag : document.createElementNS(this.xmlns, node.tag);
        if (!node.tag) return null;

        if (node.val != null) {
            el.innerHTML = node.val;
        }
        if (node.opt) {
            Object.entries(node.opt).forEach(([key, value]) => {
                if (key === 'data' && typeof value === 'object') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        el.dataset[dataKey] = dataValue;
                    });
                } else {
                    el.setAttributeNS(null, key, value);
                }
            });
        }
        if (parent) parent.appendChild(el);
        return el;
    }

    /**
     * Compile tree into dom structure and append it to parent element
     *
     * @param {node} [node]
     * @param {Element} [parent]
     * @returns {Element|null}
     */
    compile(node = this.tree, parent = null) {
        if (!node) node = this.tree;
        if (!node.tag) return null;

        if (node._id) {
            if (!node.opt) node.opt = {};
            node.opt[Tree.attributeId] = node._id;
        }

        const el = this.createNode(node, parent);
        if (node.sav) node._el = el;
        if (node.sub) node.sub.forEach(sub => {
            if (sub instanceof Element) el.appendChild(sub);
            else sub && this.compile(sub, el);
        });

        return el;
    }

    /**
     * Compile new node and replace old element with it
     *
     * @param {node} [oldNode]
     * @param {node} [newNode]
     */
    recompile(oldNode = this.tree, newNode = oldNode) {
        if (!oldNode._el) {
            console.error('Trying to recompile node without stored element');
            return;
        }

        const oldElement = oldNode._el;
        const newElement = this.compile(newNode);
        return oldElement.parentElement.replaceChild(newElement, oldElement);
    }

    /**
     * works not really correct, need rework
     * has issue with returning found value from deep like '/main/hours/line', will return hours node instead of line
     * has issue with partial selectors like 'hours/line' instead of full '/main/hours/line'
     * best usage for now is to find plugin by id
     *
     * @param {String} selector - id of node or path from root like '/main/...', if node has _id it will be used to compare with selector, otherwise - tag
     * @param {node} [tree]
     * @param {String} [path]
     * @returns {node|null}
     */
    find(selector, tree = this.tree, path = '') {
        if (tree._id == selector) return tree;
        const treePath = path + '/' + (tree._id || tree.tag || '');
        if (treePath === selector) return tree;
        if (tree.sub) {
            return tree.sub.filter(subTree => typeof subTree === 'object')
                .find(subTree => this.find(selector, subTree, treePath)) || null;
        }
        return null;
    }

    /**
     * init code, not finished
     * should return tree node by xpath
     *
     * @param {String|Number} selector
     * @param {node} tree
     * @returns {node|node[]}
     */
    q(selector, tree = this.tree) {
        if (tree._id == selector) return tree;
        if (this._cache[selector]) return this._cache[selector][0];
        const path = String(selector).split('/');
        const catches = path.map(value => this._cache[value]);
        //catches.reduce(() => {}, );
        return catches;
    }

    /**
     * Appends subTree to passed node
     *
     * @param {node|node[]|string|Tree} node - node to append subTree or selector to find such node
     * @param {node|Object|null|Array<node>|Tree} [subTree]
     * @param {boolean} [before=false] - prepend if true
     * @returns {node}
     */
    append(node, subTree, before = false) {
        // selector passed
        if (node && subTree && String(node) === node) {
            node = this.find(node);
        }

        // node not passed
        if (node && subTree == null && node instanceof Object) {
            subTree = node;
            node = this.tree;
        }

        if (node) {
            if (!node.sub) node.sub = [];
            if (subTree instanceof Tree) subTree = subTree.tree;
            if (!(subTree instanceof Array)) subTree = [subTree];
            const method = before ? 'unshift' : 'push';
            node.sub[method](...subTree);
        }

        return node;
    }

    /**
     * Prepend subTree to node
     *
     * @param {node|node[]|string|Tree} node - node to append subTree or selector to find such node
     * @param {node|Object|null|Array<node>|Tree} subTree
     * @returns {node}
     */
    prepend(node, subTree) {
        return this.append(node, subTree, true);
    }

    /**
     * Restore tree from existing DOM
     *
     * @param {Element} _el - DOM element
     * @returns {node}
     */
    analyze(_el) {
        const opt = Object.fromEntries(Array.from(_el.attributes, a => [a.name, restoreTypes(a.value)]));
        const node = {
            _el,
            opt,
            tag: _el.tagName,
            sav: true,
            sub: []
        };

        if (_el.children.length) {
            for (let child of _el.children) {
                node.sub.push(this.analyze(child));
            }
        }

        if (opt[Tree.attributeId]) {
            node._id = node.opt[Tree.attributeId];
            delete node.opt[Tree.attributeId];
        }

        const val = Array.from(_el.childNodes)
            .filter(n => n.nodeType === Text.TEXT_NODE)
            .map(n => n.nodeValue);

        if (val.length) {
            node.val = restoreTypes(val.join('\n'));
        }

        return node;
    }
}

function restoreTypes(string) {
    if (!isNaN(parseFloat(string)) && isFinite(string)) return Number(string);
    return string;
}