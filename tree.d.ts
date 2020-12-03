/**
 * (c) Petro Borshchahivskyi
 * https://github.com/Liksu/svg-easy-tree
 */
/**
 * @typedef  {Object}    Node
 * @property {String}         tag
 * @property {String|Number} [_id]
 * @property {Object}        [opt]
 * @property {String|Number} [val]
 * @property {Boolean}       [sav]
 * @property {Array<Node>}   [sub]
 * @property {Element}       [_el]
 */

export default class Tree {
    static ns_HTML: string;
    static ns_SVG: string;
    static attributeId: string;
    /**
     * @param {Node|Element} [initialTree]
     * @param {string} [xmlns]
     */
    constructor(initialTree?: Node | Element, xmlns?: string);
    xmlns: string;
    tree: Node;
    /**
     * Create dom element from node object
     *
     * @param {Node|Element} node
     * @param {Element} [parent]
     * @returns {Element}
     */
    createNode(node: Node | Element, parent?: Element): Element;
    /**
     * Compile tree into dom structure and append it to parent element
     *
     * @param {Node} [node]
     * @param {Element} [parent]
     * @returns {Element|null}
     */
    compile(node?: Node, parent?: Element): Element | null;
    /**
     * Compile new node and replace old element with it
     *
     * @param {Node} [oldNode]
     * @param {Node} [newNode]
     */
    recompile(oldNode?: Node, newNode?: Node): Element;
    /**
     * works not really correct, need rework
     * has issue with returning found value from deep like '/main/hours/line', will return hours node instead of line
     * has issue with partial selectors like 'hours/line' instead of full '/main/hours/line'
     * best usage for now is to find plugin by id
     *
     * @param {String} selector - id of node or path from root like '/main/...', if node has _id it will be used to compare with selector, otherwise - tag
     * @param {Node} [tree]
     * @param {String} [path]
     * @returns {Node|null}
     */
    find(selector: string, tree?: Node, path?: string): Node | null;
    /**
     * init code, not finished
     * should return tree node by xpath
     *
     * @param {String|Number} selector
     * @param {Node} tree
     * @returns {Node|Node[]}
     */
    q(selector: string | number, tree?: Node): Node | Node[];
    /**
     * Appends subTree to passed node
     *
     * @param {Node|Node[]|string|Tree} node - node to append subTree or selector to find such node
     * @param {Node|Object|null|Array<Node>|Tree} [subTree]
     * @param {boolean} [before=false] - prepend if true
     * @returns {Node}
     */
    append(node: Node | Array<Node> | string | Tree, subTree?: Node | Array<Node> | null | Tree, before?: boolean): Node;
    /**
     * Prepend subTree to node
     *
     * @param {Node|Node[]|string|Tree} node - node to append subTree or selector to find such node
     * @param {Node|Object|null|Array<Node>|Tree} subTree
     * @returns {Node}
     */
    prepend(node: Node | Array<Node> | string | Tree, subTree: Node | null | Array<Node> | Tree): Node;
    /**
     * Restore tree from existing DOM
     *
     * @param {Element} _el - DOM element
     * @returns {Node}
     */
    analyze(_el: Element): Node;
}

export type Node = {
    tag: string;
    _id?: string | number;
    opt?: object;
    val?: string | number;
    sav?: boolean;
    sub?: Array<Node | Element>;
    _el?: Element;
};
