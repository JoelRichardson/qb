/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parser_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parser_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__parser_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ops_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ops_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__ops_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__utils_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__undoManager_js__ = __webpack_require__(4);

/*
 * Data structures:
 *   0. The data model for a mine is a graph of objects representing 
 *   classes, their components (attributes, references, collections), and relationships.
 *   1. The query is represented by a d3-style hierarchy structure: a list of
 *   nodes, where each node has a name (string), and a children list (possibly empty 
 *   list of nodes). The nodes and the parent/child relationships of this structure 
 *   are what drive the dislay.
 *   2. Each node in the diagram corresponds to a component in a path, where each
 *   path starts with the root class, optionally proceeds through references and collections,
 *   and optionally ends at an attribute.
 *
 */

//import { mines } from './mines.js';





let currMine;
let currTemplate;
let currNode;

let name2mine;
let m;
let w;
let h;
let i;
let root;
let diagonal;
let vis;
let nodes;
let links;
let layoutStyle = "tree";
let animationDuration = 250; // ms
let defaultColors = { header: { main: "#595455", text: "#fff" } };
let defaultLogo = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png";
let undoMgr = new __WEBPACK_IMPORTED_MODULE_3__undoManager_js__["a" /* default */]();

function setup(){
    m = [20, 120, 20, 120]
    w = 1280 - m[1] - m[3]
    h = 800 - m[0] - m[2]
    i = 0

    diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });

    // create the SVG container
    vis = d3.select("#svgContainer svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .on("click", hideDialog)
      .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    //
    d3.select('#tInfoBar > i.button[name="openclose"]')
        .on("click", function(){ 
            let t = d3.select("#tInfoBar");
            let wasClosed = t.classed("closed");
            let isClosed = !wasClosed;
            let d = d3.select('#drawer')[0][0]
            if (isClosed)
                // save the current height just before closing
                d.__saved_height = d.getBoundingClientRect().height;
            else if (d.__saved_height)
               // on open, restore the saved height
               d3.select('#drawer').style("height", d.__saved_height);
                
            t.classed("closed", isClosed);
            d3.select(this).text( isClosed ? "add" : "clear" );
        });

    Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])("./resources/testdata/registry.json")
      .then(function(j_mines){
        var mines = j_mines.instances;
        name2mine = {};
        mines.forEach(function(m){ name2mine[m.name] = m; });
        currMine = mines[0];
        currTemplate = null;

        var ml = d3.select("#mlist").selectAll("option").data(mines);
        var selectMine = "MouseMine";
        ml.enter().append("option")
            .attr("value", function(d){return d.name;})
            .attr("disabled", function(d){
                var w = window.location.href.startsWith("https");
                var m = d.url.startsWith("https");
                var v = (w && !m) || null;
                return v;
            })
            .attr("selected", function(d){ return d.name===selectMine || null; })
            .text(function(d){ return d.name; });
        //
        // when a mine is selected from the list
        d3.select("#mlist")
            .on("change", function(){ selectedMine(this.value); });
        //
        var dg = d3.select("#dialog");
        dg.classed("hidden",true)
        dg.select(".button.close").on("click", hideDialog);
        dg.select(".button.remove").on("click", () => removeNode(currNode));

        // 
        //
        d3.select("#layoutstyle")
            .on("change", function () { setLayout(this.value); })
            ;

        //
        d3.select("#dialog .subclassConstraint select")
            .on("change", function(){ setSubclassConstraint(currNode, this.value); });
        //
        d3.select("#dialog .select-ctrl")
            .on("click", function() {
                currNode.isSelected ? currNode.unselect() : currNode.select();
                update(currNode);
                d3.select("#dialog .select-ctrl").classed("selected", currNode.isSelected);
                saveState();
            });

        // start with the first mine by default.
        selectedMine(selectMine);
      });

    d3.selectAll("#ttext label span")
        .on('click', function(){
            d3.select('#ttext').attr('class', 'flexcolumn '+this.innerText.toLowerCase());
            updateTtext();
        });
    d3.select('#runatmine')
        .on('click', runatmine);
    d3.select('#querycount .button.sync')
        .on('click', function(){
            let t = d3.select(this);
            let turnSyncOff = t.text() === "sync";
            t.text( turnSyncOff ? "sync_disabled" : "sync" )
             .attr("title", () =>
                 `Count autosync is ${ turnSyncOff ? "OFF" : "ON" }. Click to turn it ${ turnSyncOff ? "ON" : "OFF" }.`);
            !turnSyncOff && updateCount();
        d3.select('#querycount').classed("syncoff", turnSyncOff);
        });
    d3.select("#xmltextarea")
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["selectText"])("xmltextarea")});
    d3.select("#jsontextarea")
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["selectText"])("jsontextarea")});
    d3.select("#undoButton")
        .on("click", undo);
    d3.select("#redoButton")
        .on("click", redo);
}

function clearState() {
    undoMgr.clear();
}
function saveState() {
    let s = JSON.stringify(uncompileTemplate(currTemplate));
    undoMgr.add(s);
}
function undo() { undoredo("undo") }
function redo() { undoredo("redo") }
function undoredo(which){
    try {
        let s = JSON.parse(undoMgr[which]());
        editTemplate(s, true);
    }
    catch (err) {
        console.log(err);
    }
}

// Called when user selects a mine from the option list
// Loads that mine's data model and all its templates.
// Then initializes display to show the first termplate's query.
function selectedMine(mname){
    currMine = name2mine[mname]
    if(!currMine) return;
    let url = currMine.url;
    let turl, murl, lurl, burl, surl, ourl;
    currMine.tnames = []
    currMine.templates = []
    if (mname === "test") { 
        turl = url + "/templates.json";
        murl = url + "/model.json";
        lurl = url + "/lists.json";
        burl = url + "/branding.json";
        surl = url + "/summaryfields.json";
        ourl = url + "/organismlist.json";
    }
    else {
        turl = url + "/service/templates?format=json";
        murl = url + "/service/model?format=json";
        lurl = url + "/service/lists?format=json";
        burl = url + "/service/branding";
        surl = url + "/service/summaryfields";
        ourl = url + "/service/query/results?query=%3Cquery+name%3D%22%22+model%3D%22genomic%22+view%3D%22Organism.shortName%22+longDescription%3D%22%22%3E%3C%2Fquery%3E&format=jsonobjects";
    }
    // get the model
    console.log("Loading resources from " + url );
    Promise.all([
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(murl),
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(turl),
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(lurl),
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(burl),
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(surl),
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(ourl)
    ]).then( function(data) {
        var j_model = data[0];
        var j_templates = data[1];
        var j_lists = data[2];
        var j_branding = data[3];
        var j_summary = data[4];
        var j_organisms = data[5];
        //
        currMine.model = compileModel(j_model.model)
        currMine.templates = j_templates.templates;
        currMine.lists = j_lists.lists;
        currMine.summaryFields = j_summary.classes;
        currMine.organismList = j_organisms.results.map(o => o.shortName);
        //
        currMine.tlist = obj2array(currMine.templates)
        currMine.tlist.sort(function(a,b){ 
            return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
        });
        currMine.tnames = Object.keys( currMine.templates );
        currMine.tnames.sort();
        // Fill in the selection list of templates for this mine.
        var tl = d3.select("#tlist select")
            .selectAll('option')
            .data( currMine.tlist );
        tl.enter().append('option')
        tl.exit().remove()
        tl.attr("value", function(d){ return d.name; })
          .text(function(d){return d.title;});
        d3.selectAll('[name="editTarget"] [name="in"]')
            .on("change", startEdit);
        editTemplate(currMine.templates[currMine.tlist[0].name]);
        // Apply branding
        let clrs = currMine.colors || defaultColors;
        let bgc = clrs.header ? clrs.header.main : clrs.main.fg;
        let txc = clrs.header ? clrs.header.text : clrs.main.bg;
        let logo = currMine.images.logo || defaultLogo;
        d3.select("#tInfoBar")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#mineLogo")
            .attr("src", logo);
        d3.selectAll('#svgContainer [name="minename"]')
            .text(currMine.name);
        // populate class list 
        let clist = Object.keys(currMine.model.classes);
        clist.sort();
        initOptionList("#newqclist select", clist);
        d3.select('#editSourceSelector [name="in"]')
            .call(function(){ this[0][0].selectedIndex = 1; })
            .on("change", function(){ selectedEditSource(this.value); startEdit(); });
        selectedEditSource( "tlist" );
        d3.select("#xmltextarea")[0][0].value = "";
        d3.select("#jsontextarea").value = "";

    }, function(error){
        alert(`Could not access ${currMine.name}. Status=${error.status}. Error=${error.statusText}. (If there is no error message, then its probably a CORS issue.)`);
    });
}

//
function startEdit() {
    // selector for choosing edit input source, and the current selection
    let srcSelector = d3.selectAll('[name="editTarget"] [name="in"]');
    let inputId = srcSelector[0][0].value;
    // the query input element corresponding to the selected source
    let src = d3.select(`#${inputId} [name="in"]`);
    // the quary starting point
    let val = src[0][0].value
    if (inputId === "tlist") {
        // a saved query or template
        editTemplate(currMine.templates[val]);
    }
    else if (inputId === "newqclist") {
        // a new query from a selected starting class
        let nt = new Template();
        nt.select.push(val+".id");
        editTemplate(nt);
    }
    else if (inputId === "importxml") {
        // import xml query
        val && editTemplate(Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["parsePathQuery"])(val));
    }
    else if (inputId === "importjson") {
        // import json query
        val && editTemplate(JSON.parse(val));
    }
    else
        throw "Unknown edit source."
}

// 
function selectedEditSource(show){
    d3.selectAll('[name="editTarget"] > div.option')
        .style("display", function(){ return this.id === show ? null : "none"; });
}

// Returns an array containing the item values from the given object.
// The list is sorted by the item keys.
// If nameAttr is specified, the item key is also added to each element
// as an attribute (only works if those items are themselves objects).
// Examples:
//    states = {'ME':{name:'Maine'}, 'IA':{name:'Iowa'}}
//    obj2array(states) =>
//        [{name:'Iowa'}, {name:'Maine'}]
//    obj2array(states, 'abbrev') =>
//        [{name:'Iowa',abbrev'IA'}, {name:'Maine',abbrev'ME'}]
// Args:
//    o  (object) The object.
//    nameAttr (string) If specified, adds the item key as an attribute to each list element.
// Return:
//    list containing the item values from o
function obj2array(o, nameAttr){
    var ks = Object.keys(o);
    ks.sort();
    return ks.map(function (k) {
        if (nameAttr) o[k].name = k;
        return o[k];
    });
};

// Add direct cross references to named types. (E.g., where the
// model says that Gene.alleles is a collection whose referencedType
// is the string "Allele", add a direct reference to the Allele class)
// Also adds arrays for convenience for accessing all classes or all attributes of a class.
//
function compileModel(model){
    // First add classes that represent the basic type
    __WEBPACK_IMPORTED_MODULE_1__ops_js__["LEAFTYPES"].forEach(function(n){
        model.classes[n] = {
            isLeafType: true,
            name: n,
            displayName: n,
            attributes: [],
            references: [],
            collections: [],
            extends: []
        }
    });
    //
    model.allClasses = obj2array(model.classes)
    var cns = Object.keys(model.classes);
    cns.sort()
    cns.forEach(function(cn){
        var cls = model.classes[cn];
        cls.allAttributes = obj2array(cls.attributes)
        cls.allReferences = obj2array(cls.references)
        cls.allCollections = obj2array(cls.collections)
        cls.allAttributes.forEach(function(x){ x.kind = "attribute"; });
        cls.allReferences.forEach(function(x){ x.kind = "reference"; });
        cls.allCollections.forEach(function(x){ x.kind = "collection"; });
        cls.allParts = cls.allAttributes.concat(cls.allReferences).concat(cls.allCollections);
        cls.allParts.sort(function(a,b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
        model.allClasses.push(cls);
        //
        cls["extends"] = cls["extends"].map(function(e){
            var bc = model.classes[e];
            if (bc.extendedBy) {
                bc.extendedBy.push(cls);
            }
            else {
                bc.extendedBy = [cls];
            }
            return bc;
        });
        //
        Object.keys(cls.references).forEach(function(rn){
            var r = cls.references[rn];
            r.type = model.classes[r.referencedType]
        });
        //
        Object.keys(cls.collections).forEach(function(cn){
            var c = cls.collections[cn];
            c.type = model.classes[c.referencedType]
        });
    });
    return model;
}

// Returns a list of all the superclasses of the given class.
// (
// The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSuperclasses(cls){
    if (typeof(cls) === "string" || !cls["extends"] || cls["extends"].length == 0) return [];
    var anc = cls["extends"].map(function(sc){ return getSuperclasses(sc); });
    var all = cls["extends"].concat(anc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return obj2array(ans);
}

// Returns a list of all the subclasses of the given class.
// (The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSubclasses(cls){
    if (typeof(cls) === "string" || !cls.extendedBy || cls.extendedBy.length == 0) return [];
    var desc = cls.extendedBy.map(function(sc){ return getSubclasses(sc); });
    var all = cls.extendedBy.concat(desc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return obj2array(ans);
}

// Returns true iff sub is a subclass of sup.
function isSubclass(sub,sup) {
    if (sub === sup) return true;
    if (typeof(sub) === "string" || !sub["extends"] || sub["extends"].length == 0) return false;
    var r = sub["extends"].filter(function(x){ return x===sup || isSubclass(x, sup); });
    return r.length > 0;
}

// Returns true iff the given list is valid as a list constraint option for
// the node n. A list is valid to use in a list constraint at node n iff
//     * the list's type is equal to or a subclass of the node's type
//     * the list's type is a superclass of the node's type. In this case,
//       elements in the list that are not compatible with the node's type
//       are automatically filtered out.
function isValidListConstraint(list, n){
    var nt = n.subtypeConstraint || n.ptype;
    if (typeof(nt) === "string" ) return false;
    var lt = currMine.model.classes[list.type];
    return isSubclass(lt, nt) || isSubclass(nt, lt);
}

// Compiles a "raw" template - such as one returned by the /templates web service - against
// a model. The model should have been previously compiled.
// Args:
//   template - a template query as a json object
//   model - the mine's model, already compiled (see compileModel).
// Returns:
//   nothing
// Side effects:
//   Creates a tree of query nodes (suitable for drawing by d3, BTW).
//   Adds this tree to the template object as attribute 'qtree'.
//   Turns each (string) path into a reference to a tree node corresponding to that path.
function compileTemplate(template, model) {
    var roots = []
    var t = template;
    // the tree of nodes representing the compiled query will go here
    t.qtree = null;
    // index of code to constraint gors here.
    t.code2c = {}
    // normalize things that may be undefined
    t.comment = t.comment || "";
    t.description = t.description || "";
    //
    var subclassCs = [];
    t.where && t.where.forEach(function(c){
        if (c.type) {
            c.op = "ISA"
            subclassCs.push(c);
        }
        c.ctype = __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPINDEX"][c.op].ctype;
        if (c.code) t.code2c[c.code] = c;
        if (c.ctype === "null"){
            // With null/not-null constraints, IM has a weird quirk of filling the value 
            // field with the operator. E.g., for an "IS NOT NULL" opreator, the value field is
            // also "IS NOT NULL". 
            // 
            c.value = "";
        }
        else if (c.ctype === "lookup") {
            // TODO: deal with extraValue here (?)
        }
    })
    // must process any subclass constraints first, from shortest to longest path
    subclassCs
        .sort(function(a,b){
            return a.path.length - b.path.length;
        })
        .forEach(function(c){
             var n = addPath(t, c.path, model);
             var cls = model.classes[c.type];
             if (!cls) throw "Could not find class " + c.type;
             n.subclassConstraint = cls;
        });
    //
    t.where && t.where.forEach(function(c){
        var n = addPath(t, c.path, model);
        if (n.constraints)
            n.constraints.push(c)
        else
            n.constraints = [c];
    })

    //
    t.select && t.select.forEach(function(p,i){
        var n = addPath(t, p, model);
        n.select();
    })
    t.joins && t.joins.forEach(function(j){
        var n = addPath(t, j, model);
        n.join = "outer";
    })
    t.orderBy && t.orderBy.forEach(function(o, i){
        var p = Object.keys(o)[0]
        var dir = o[p]
        var n = addPath(t, p, model);
        n.sort = { dir: dir, level: i };
    });
    if (!t.qtree) {
        throw "No paths in query."
    }
    return t;
}

// Turns a qtree structure back into a "raw" template. 
//
function uncompileTemplate(tmplt){
    var t = {
        name: tmplt.name,
        title: tmplt.title,
        description: tmplt.description,
        comment: tmplt.comment,
        rank: tmplt.rank,
        model: Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(tmplt.model),
        tags: Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(tmplt.tags),
        select : [],
        where : [],
        joins : [],
        constraintLogic: tmplt.constraintLogic || "",
        orderBy : []
    }
    function reach(n){
        var p = n.path
        if (n.isSelected) {
            // path should already be there
            if (t.select.indexOf(n.path) === -1)
                throw "Anomaly detected in select list.";
        }
        (n.constraints || []).forEach(function(c){
             t.where.push(c);
                
        })
        if (n.join === "outer") {
            t.joins.push(p);
        }
        if (n.sort) {
            let s = {}
            s[p] = n.sort.dir;
            t.orderBy[n.sort.level] = s;
        }
        n.children.forEach(reach);
    }

    reach(tmplt.qtree);
    t.orderBy = t.orderBy.filter(o => o);
    return t
}

//
class Node {
    // Args:
    //   template (Template object) the template that owns this node
    //   parent (object) Parent of the new node.
    //   name (string) Name for the node
    //   pcomp (object) Path component for the root, this is a class. For other nodes, an attribute, 
    //                  reference, or collection decriptor.
    //   ptype (object or string) Type of pcomp.
    constructor (template, parent, name, pcomp, ptype) {
        this.template = template; // the template I belong to.
        this.name = name;     // display name
        this.children = [];   // child nodes
        this.parent = parent; // parent node
        this.pcomp = pcomp;   // path component represented by the node. At root, this is
                              // the starting class. Otherwise, points to an attribute (simple, 
                              // reference, or collection).
        this.ptype  = ptype;  // path type. The type of the path at this node, i.e. the type of pcomp. 
                              // For simple attributes, this is a string. Otherwise,
                              // points to a class in the model. May be overriden by subclass constraint.
        this.subclassConstraint = null; // subclass constraint (if any). Points to a class in the model
                              // If specified, overrides ptype as the type of the node.
        this.constraints = [];// all constraints
        this.view = null;    // If selected for return, this is its column#.
        parent && parent.children.push(this);
        
        this.id = this.path;
    }
    //
    get rootNode () {
        return this.template.qtree;
    }

    //
    get path () {
        return (this.parent ? this.parent.path +"." : "") + this.name;
    }
    //
    get nodeType () {
        return this.subclassConstraint || this.ptype;
    }
    //
    get isBioEntity () {
        let be = currMine.model.classes["BioEntity"];
        let nt = this.nodeType;
        return isSubclass(nt, be);
    }
    //
    get isSelected () {
         return this.view >= 0;
    }
    select () {
        let p = this.path;
        let t = this.template;
        let i = t.select.indexOf(p);
        this.view = i >= 0 ? i : (t.select.push(p) - 1);
    }
    unselect () {
        let p = this.path;
        let t = this.template;
        let i = t.select.indexOf(p);
        if (i >= 0) {
            // remove path from the select list
            t.select.splice(i,1);
            // FIXME: renumber nodes here
        }
        this.view = null;
    }
}

class Template {
    constructor () {
        this.model = { name: "genomic" };
        this.name = "";
        this.title = "";
        this.description = "";
        this.comment = "";
        this.select = [];
        this.where = [];
        this.constraintLogic = "";
        this.tags = [];
        this.orderBy = [];
    }

    findNode (p) {
        let n = this.qtree;
        let parts = p.split(".");
    }
}

class Constraint {
    constructor (n, t) {
        // one of: null, value, multivalue, subclass, lookup, list
        this.ctype = n.pcomp.kind === "attribute" ? "value" : "lookup";
        // used by all except subclass constraints (we set it to "ISA")
        this.op = this.ctype === "value" ? "=" : "LOOKUP";
        // used by all except subclass constraints
        this.code = nextAvailableCode(t);
        // all constraints have this
        this.path = n.path;
        // used by value, list
        this.value = "";
        // used by LOOKUP on BioEntity and subclasses
        this.extraValue = null;
        // used by multivalue and range constraints
        this.values = null;
        // used by subclass contraints
        this.type = null;
    }
}

// Adds a path to the current diagram. Path is specified as a dotted list of names.
// Args:
//   template (object) the template
//   path (string) the path to add. 
//   model object Compiled data model.
// Returns:
//   last path component created. 
// Side effects:
//   Creates new nodes as needed and adds them to the qtree.
function addPath(template, path, model){
    if (typeof(path) === "string")
        path = path.split(".");
    var classes = model.classes;
    var lastt = null
    var n = template.qtree;  // current node pointer

    function find(list, n){
         return list.filter(function(x){return x.name === n})[0]
    }

    path.forEach(function(p, i){
        if (i === 0) {
            if (template.qtree) {
                // If root already exists, make sure new path has same root.
                n = template.qtree;
                if (p !== n.name)
                    throw "Cannot add path from different root.";
            }
            else {
                // First path to be added
                cls = classes[p];
                if (!cls)
                   throw "Could not find class: " + p;
                n = template.qtree = new Node( template, null, p, cls, cls );
            }
        }
        else {
            // n is pointing to the parent, and p is the next name in the path.
            var nn = find(n.children, p);
            if (nn) {
                // p is already a child
                n = nn;
            }
            else {
                // need to add a new node for p
                // First, lookup p
                var x;
                var cls = n.subclassConstraint || n.ptype;
                if (cls.attributes[p]) {
                    x = cls.attributes[p];
                    cls = x.type // <-- A string!
                } 
                else if (cls.references[p] || cls.collections[p]) {
                    x = cls.references[p] || cls.collections[p];
                    cls = classes[x.referencedType] // <--
                    if (!cls) throw "Could not find class: " + p;
                } 
                else {
                    throw "Could not find member named " + p + " in class " + cls.name + ".";
                }
                // create new node, add it to n's children
                nn = new Node(template, n, p, x, cls);
                n = nn;
            }
        }
    })

    // return the last node in the path
    return n;
}


// Args:
//   n (node) The node having the constraint.
//   scName (type) Name of subclass.
function setSubclassConstraint(n, scName){
    // remove any existing subclass constraint
    n.constraints = n.constraints.filter(function (c){ return c.ctype !== "subclass"; });
    n.subclassConstraint = null;
    if (scName){
        let cls = currMine.model.classes[scName];
        if(!cls) throw "Could not find class " + scName;
        n.constraints.push({ ctype:"subclass", op:"ISA", path:n.path, type:cls.name });
        n.subclassConstraint = cls;
    }
    function check(node, removed) {
        var cls = node.subclassConstraint || node.ptype;
        var c2 = [];
        node.children.forEach(function(c){
            if(c.name in cls.attributes || c.name in cls.references || c.name in cls.collections) {
                c2.push(c);
                check(c, removed);
            }
            else
                removed.push(c);
        })
        node.children = c2;
        return removed;
    }
    var removed = check(n,[]);
    hideDialog();
    update(n);
    if(removed.length > 0)
        window.setTimeout(function(){
            alert("Constraining to subclass " + (scName || n.ptype.name)
            + " caused the following paths to be removed: " 
            + removed.map(n => n.path).join(", ")); 
        }, animationDuration);
}

// Removes the current node and all its descendants.
//
function removeNode(n) {
    // First, remove all constraints on n or its descendants
    function rmc (x) {
        x.constraints.forEach(c => removeConstraint(x,c));
        x.children.forEach(rmc);
    }
    rmc(n);
    // Now remove the subtree at n.
    var p = n.parent;
    if (p) {
        p.children.splice(p.children.indexOf(n), 1);
        hideDialog();
        update(p);
    }
    else {
        hideDialog()
    }
    //
    saveState();
}

// Called when the user selects a template from the list.
// Gets the template from the current mine and builds a set of nodes
// for d3 tree display.
//
function editTemplate (t, nosave) {
    // Make sure the editor works on a copy of the template.
    //
    currTemplate = Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t);
    //
    root = compileTemplate(currTemplate, currMine.model).qtree
    root.x0 = 0;
    root.y0 = h / 2;

    if (! nosave) saveState();

    // Fill in the basic template information (name, title, description, etc.)
    //
    var ti = d3.select("#tInfo");
    var xfer = function(name, elt){ currTemplate[name] = elt.value; updateTtext(); };
    // Name (the internal unique name)
    ti.select('[name="name"] input')
        .attr("value", currTemplate.name)
        .on("change", function(){ xfer("name", this) });
    // Title (what the user sees)
    ti.select('[name="title"] input')
        .attr("value", currTemplate.title)
        .on("change", function(){ xfer("title", this) });
    // Description (what it does - a little documentation).
    ti.select('[name="description"] textarea')
        .text(currTemplate.description)
        .on("change", function(){ xfer("description", this) });
    // Comment - for whatever, I guess. 
    ti.select('[name="comment"] textarea')
        .text(currTemplate.comment)
        .on("change", function(){ xfer("comment", this) });

    // Logic expression - which ties the individual constraints together
    ti.select('[name="logicExpression"] input')
        .call(function(){ this[0][0].value = setLogicExpression(currTemplate.constraintLogic, currTemplate) })
        .on("change", function(){
            this.value = setLogicExpression(this.value, currTemplate);
            xfer("constraintLogic", this)
        });

    //
    hideDialog();
    update(root);
}

// Set the constraint logic expression for the given template.
// In the process, also "corrects" the expression as follows:
//    * any codes in the expression that are not associated with
//      any constraint in the current template are removed and the
//      expression logic updated accordingly
//    * and codes in the template that are not in the expression
//      are ANDed to the end.
// For example, if the current template has codes A, B, and C, and
// the expression is "(A or D) and B", the D drops out and C is
// added, resulting in "A and B and C". 
// Args:
//   ex (string) the expression
//   tmplt (obj) the template
// Returns:
//   the "corrected" expression
//   
function setLogicExpression(ex, tmplt){
    var ast; // abstract syntax tree
    var seen = [];
    function reach(n,lev){
        if (typeof(n) === "string" ){
            // check that n is a constraint code in the template. If not, remove it from the expr.
            seen.push(n);
            return (n in tmplt.code2c ? n : "");
        }
        var cms = n.children.map(function(c){return reach(c, lev+1);}).filter(function(x){return x;});;
        var cmss = cms.join(" "+n.op+" ");
        return cms.length === 0 ? "" : lev === 0 || cms.length === 1 ? cmss : "(" + cmss + ")"
    }
    try {
        ast = ex ? __WEBPACK_IMPORTED_MODULE_0__parser_js___default.a.parse(ex) : null;
    }
    catch (err) {
        alert(err);
        return tmplt.constraintLogic;
    }
    //
    var lex = ast ? reach(ast,0) : "";
    // if any constraint codes in the template were not seen in the expression,
    // AND them into the expression (except ISA constraints).
    var toAdd = Object.keys(tmplt.code2c).filter(function(c){
        return seen.indexOf(c) === -1 && c.op !== "ISA";
        });
    if (toAdd.length > 0) {
         if(ast && ast.op && ast.op === "or")
             lex = `(${lex})`;
         if (lex) toAdd.unshift(lex);
         lex = toAdd.join(" and ");
    }
    //
    tmplt.constraintLogic = lex;

    d3.select('#tInfo [name="logicExpression"] input')
        .call(function(){ this[0][0].value = lex; });

    return lex;
}

// Extends the path from currNode to p
// Args:
//   currNode (node) Node to extend from
//   mode (string) one of "select", "constrain" or "open"
//   p (string) Name of an attribute, ref, or collection
// Returns:
//   nothing
// Side effects:
//   If the selected item is not already in the display, it enters
//   as a new child (growing out from the parent node.
//   Then the dialog is opened on the child node.
//   If the user clicked on a "open+select" button, the child is selected.
//   If the user clicked on a "open+constrain" button, a new constraint is added to the
//   child, and the constraint editor opened  on that constraint.
//
function selectedNext(currNode, mode, p){
    let n;
    let cc;
    let sfs;
    if (mode === "summaryfields") {
        sfs = currMine.summaryFields[currNode.nodeType.name]||[];
        sfs.forEach(function(sf, i){
            sf = sf.replace(/^[^.]+/, currNode.path);
            let m = addPath(currTemplate, sf, currMine.model);
            if (! m.isSelected) {
                m.select();
            }
        });
    }
    else {
        p = currNode.path + "." + p;
        n = addPath(currTemplate, p, currMine.model );
        if (mode === "selected")
            !n.isSelected && n.select();
        if (mode === "constrained") {
            cc = addConstraint(n, false)
        }
    }
    hideDialog();
    update(currNode);
    if (mode !== "open")
        saveState();
    if (mode !== "summaryfields") 
        setTimeout(function(){
            showDialog(n);
            cc && setTimeout(function(){
                editConstraint(cc, n)
            }, animationDuration);
        }, animationDuration);
    
}
// Returns a text representation of a constraint
//
function constraintText(c) {
   var t = "?";
   if (!c) return t;
   if (c.ctype === "subclass"){
       t = "ISA " + (c.type || "?");
   }
   else if (c.ctype === "list") {
       t = c.op + " " + c.value;
   }
   else if (c.ctype === "lookup") {
       t = c.op + " " + c.value;
       if (c.extraValue) t = t + " IN " + c.extraValue;
   }
   else if (c.value !== undefined){
       t = c.op + (c.op.includes("NULL") ? "" : " " + c.value)
   }
   else if (c.values !== undefined){
       t = c.op + " " + c.values
   }
   return (c.code ? "("+c.code+") " : "") + t;
}

// Returns  the DOM element corresponding to the given data object.
//
function findDomByDataObj(d){
    var x = d3.selectAll(".nodegroup .node").filter(function(dd){ return dd === d; });
    return x[0][0];
}

//
function opValidFor(op, n){
    if(!n.parent && !op.validForRoot) return false;
    if(typeof(n.ptype) === "string")
        if(! op.validForAttr)
            return false;
        else if( op.validTypes && op.validTypes.indexOf(n.ptype) == -1)
            return false;
    if(n.ptype.name && ! op.validForClass) return false;
    return true;
}

//
function updateCEinputs(c, op){
    d3.select('#constraintEditor [name="op"]')[0][0].value = op || c.op;
    d3.select('#constraintEditor [name="code"]').text(c.code);

    d3.select('#constraintEditor [name="value"]')[0][0].value = c.ctype==="null" ? "" : c.value;
    d3.select('#constraintEditor [name="values"]')[0][0].value = Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(c.values);
}

// Args:
//   selector (string) For selecting the <select> element
//   data (list) Data to bind to options
//   cfg (object) Additional optional configs:
//       title - function or literal for setting the text of the option. 
//       value - function or literal setting the value of the option
//       selected - function or array or string for deciding which option(s) are selected
//          If function, called for each option.
//          If array, specifies the values the select.
//          If string, specifies which value is selected
//       emptyMessage - a message to show if the data list is empty
//       multiple - if true, make it a multi-select list
//
function initOptionList(selector, data, cfg){
    
    cfg = cfg || {};

    var ident = (x=>x);
    var opts;
    if(data && data.length > 0){
        opts = d3.select(selector)
            .selectAll("option")
            .data(data);
        opts.enter().append('option');
        opts.exit().remove();
        //
        opts.attr("value", cfg.value || ident)
            .text(cfg.title || ident)
            .attr("selected", null)
            .attr("disabled", null);
        if (typeof(cfg.selected) === "function"){
            // selected if the function says so
            opts.attr("selected", d => cfg.selected(d)||null);
        }
        else if (Array.isArray(cfg.selected)) {
            // selected if the opt's value is in the array
            opts.attr("selected", d => cfg.selected.indexOf((cfg.value || ident)(d)) != -1 || null);
        }
        else if (cfg.selected) {
            // selected if the opt's value matches
            opts.attr("selected", d => ((cfg.value || ident)(d) === cfg.selected) || null);
        }
        else {
            d3.select(selector)[0][0].selectedIndex = 0;
        }
    }
    else {
        opts = d3.select(selector)
            .selectAll("option")
            .data([cfg.emptyMessage||"empty list"]);
        opts.enter().append('option');
        opts.exit().remove();
        opts.text(ident).attr("disabled", true);
    }
    // set multi select (or not)
    d3.select(selector).attr("multiple", cfg.multiple || null);
    // allow caller to chain
    return opts;
}

// Initializes the input elements in the constraint editor from the given constraint.
//
function initCEinputs(n, c, ctype) {

    // Populate the operator select list with ops appropriate for the path
    // at this node.
    if (!ctype) 
      initOptionList(
        '#constraintEditor select[name="op"]', 
        __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPS"].filter(function(op){ return opValidFor(op, n); }),
        { multiple: false,
        value: d => d.op,
        title: d => d.op,
        selected:c.op
        });
    //
    //
    ctype = ctype || c.ctype;

    let ce = d3.select("#constraintEditor");
    let smzd = ce.classed("summarized");
    ce.attr("class", "open " + ctype)
        .classed("summarized", smzd)
        .classed("bioentity",  n.isBioEntity);

 
    //
    // set/remove the "multiple" attribute of the select element according to ctype
    d3.select('#constraintEditor select[name="values"]')
        .attr("multiple", function(){ return ctype === "multivalue" || null; });

    //
    if (ctype === "lookup") {
        d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
        initOptionList(
            '#constraintEditor select[name="values"]',
            ["Any"].concat(currMine.organismList),
            { selected: c.extraValue }
            );
    }
    else if (ctype === "subclass") {
        // Create an option list of subclass names
        initOptionList(
            '#constraintEditor select[name="values"]',
            n.parent ? getSubclasses(n.pcomp.kind ? n.pcomp.type : n.pcomp) : [],
            { multiple: false,
            value: d => d.name,
            title: d => d.name,
            emptyMessage: "(No subclasses)",
            selected: function(d){ 
                // Find the one whose name matches the node's type and set its selected attribute
                var matches = d.name === ((n.subclassConstraint || n.ptype).name || n.ptype);
                return matches || null;
                }
            });
    }
    else if (ctype === "list") {
        initOptionList(
            '#constraintEditor select[name="values"]',
            currMine.lists.filter(function (l) { return isValidListConstraint(l, currNode); }),
            { multiple: false,
            value: d => d.title,
            title: d => d.title,
            emptyMessage: "(No lists)",
            selected: c.value,
            });
    }
    else if (ctype === "multivalue") {
        generateOptionList(n, c);
    } else if (ctype === "value") {
        let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
        //let acs = getLocal("autocomplete", true, []);
        // disable this for now.
        let acs = [];
        if (acs.indexOf(attr) !== -1)
            generateOptionList(n, c)
        else
            d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
    } else if (ctype === "null") {
    }
    else {
        throw "Unrecognized ctype: " + ctype
    }
    
}

// Opens the constraint editor for constraint c of node n.
//
function openConstraintEditor(c, n){

    var ccopy = Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(c);
    d3.select("#constraintEditor").datum({ c, ccopy })

    // Note if this is happening at the root node
    var isroot = ! n.parent;
 
    // Find the div for constraint c in the dialog listing. We will
    // open the constraint editor on top of it.
    var cdiv;
    d3.selectAll("#dialog .constraint")
        .each(function(cc){ if(cc === c) cdiv = this; });
    // bounding box of the constraint's container div
    var cbb = cdiv.getBoundingClientRect();
    // bounding box of the app's main body element
    var dbb = d3.select("#qb")[0][0].getBoundingClientRect();
    // position the constraint editor over the constraint in the dialog
    var ced = d3.select("#constraintEditor")
        .attr("class", c.ctype)
        .classed("open", true)
        .style("top", (cbb.top - dbb.top)+"px")
        .style("left", (cbb.left - dbb.left)+"px")
        ;

    // Init the constraint code 
    d3.select('#constraintEditor [name="code"]')
        .text(c.code);

    initCEinputs(n, c);

    // When user selects an operator, add a class to the c.e.'s container
    d3.select('#constraintEditor [name="op"]')
        .on("change", function(){
            var op = __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPINDEX"][this.value];
            initCEinputs(n, c, op.ctype);
        })
        ;

    d3.select("#constraintEditor .button.cancel")
        .on("click", function(){ cancelConstraintEditor(n, c) });

    d3.select("#constraintEditor .button.save")
        .on("click", function(){ saveConstraintEdits(n, c) });

    d3.select("#constraintEditor .button.sync")
        .on("click", function(){ generateOptionList(n, c) });

}
// Generates an option list of distinct values to select from.
// Args:
//   n  (node)  The node we're working on. Must be an attribute node.
//   c  (constraint) The constraint to generate the list for.
// NB: Only value and multivaue constraints can be summarized in this way.  
function generateOptionList(n, c){
    // To get the list, we have to run the current query with an additional parameter, 
    // summaryPath, which is the path we want distinct values for. 
    // BUT NOTE, we have to run the query *without* constraint c!!
    // Example: suppose we have a query with a constraint alleleType=Targeted,
    // and we want to change it to Spontaneous. We open the c.e., and then click the
    // sync button to get a list. If we run the query with c intact, we'll get a list
    // containint only "Targeted". Doh!
    // ANOTHER NOTE: the path in summaryPath must be part of the query proper. The approach
    // here is to ensure it by adding the path to the view list.

    let cvals = [];
    if (c.ctype === "multivalue") {
        cvals = c.values;
    }
    else if (c.ctype === "value") {
        cvals = [ c.value ];
    }

    // Save this choice in localStorage
    let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
    let key = "autocomplete";
    let lst;
    lst = Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["getLocal"])(key, true, []);
    if(lst.indexOf(attr) === -1) lst.push(attr);
    Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["setLocal"])(key, lst, true);

    Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["clearLocal"])();

    // build the query
    let p = n.path; // what we want to summarize
    //
    let lex = currTemplate.constraintLogic; // save constraint logic expr
    removeConstraint(n, c, false); // temporarily remove the constraint
    let j = uncompileTemplate(currTemplate);
    j.select.push(p); // make sure p is part of the query
    currTemplate.constraintLogic = lex; // restore the logic expr
    addConstraint(n, false, c); // re-add the constraint

    // build the url
    let x = json2xml(j, true);
    let e = encodeURIComponent(x);
    let url = `${currMine.url}/service/query/results?summaryPath=${p}&format=jsonrows&query=${e}`
    let threshold = 250;

    // signal that we're starting
    d3.select("#constraintEditor")
        .classed("summarizing", true);
    // go!
    Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(url).then(function(json){
        // The list of values is in json.reults.
        // Each list item looks like: { item: "somestring", count: 17 }
        // (Yes, we get counts for free! Ought to make use of this.)
        //
        let res = json.results.map(r => r.item).sort();
        if (res.length > threshold) {
            let ans = prompt(`There are ${res.length} results, which exceeds the threshold of ${threshold}. How many do you want to show?`, threshold);
            if (ans === null) {
                // Signal that we're done.
                d3.select("#constraintEditor")
                    .classed("summarizing", false);
                return;
            }
            ans = parseInt(ans);
            if (isNaN(ans) || ans <= 0) return;
            res = res.slice(0, ans);
        }
        d3.select('#constraintEditor')
            .classed("summarized", true);
        let opts = d3.select('#constraintEditor [name="values"]')
            .selectAll('option')
            .data(res);
        opts.enter().append("option");
        opts.exit().remove();
        opts.attr("value", d => d)
            .text( d => d )
            .attr("disabled", null)
            .attr("selected", d => cvals.indexOf(d) !== -1 || null);
        // Signal that we're done.
        d3.select("#constraintEditor")
            .classed("summarizing", false);
    })
}
//
function cancelConstraintEditor(n, c){
    if (! c.saved) {
        removeConstraint(n, c, true);
    }
    hideConstraintEditor();
}
function hideConstraintEditor(){
    d3.select("#constraintEditor").classed("open", null);
}
//
function editConstraint(c, n){
    openConstraintEditor(c, n);
}
// Returns a single character constraint code in the range A-Z that is not already
// used in the given template.
//
function nextAvailableCode(tmplt){
    for(var i= "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++){
        var c = String.fromCharCode(i);
        if (! (c in tmplt.code2c))
            return c;
    }
    return null;
}

// Adds a new constraint to a node and returns it.
// Args:
//   n (node) The node to add the constraint to. Required.
//   updateUI (boolean) If true, update the display. If false or not specified, no update.
//   c (constraint) If given, use that constraint. Otherwise autogenerate.
// Returns:
//   The new constraint.
//
function addConstraint(n, updateUI, c) {
    if (!c) {
        c = new Constraint(n,currTemplate);
    }
    n.constraints.push(c);
    currTemplate.where.push(c);
    currTemplate.code2c[c.code] = c;
    setLogicExpression(currTemplate.constraintLogic, currTemplate);
    //
    if (updateUI) {
        update(n);
        showDialog(n, null, true);
        editConstraint(c, n);
    }
    //
    return c;
}

//
function removeConstraint(n, c, updateUI){
    n.constraints = n.constraints.filter(function(cc){ return cc !== c; });
    currTemplate.where = currTemplate.where.filter(function(cc){ return cc !== c; });
    delete currTemplate.code2c[c.code];
    if (c.ctype === "subclass") n.subclassConstraint = null;
    setLogicExpression(currTemplate.constraintLogic, currTemplate);
    //
    if (updateUI) {
        update(n);
        showDialog(n, null, true);
    }
    return c;
}
//
function saveConstraintEdits(n, c){
    //
    let o = d3.select('#constraintEditor [name="op"]')[0][0].value;
    c.op = o;
    c.ctype = __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPINDEX"][o].ctype;
    c.saved = true;
    //
    let val = d3.select('#constraintEditor [name="value"]')[0][0].value;
    let vals = [];
    d3.select('#constraintEditor [name="values"]')
        .selectAll("option")
        .each( function() {
            if (this.selected) vals.push(this.value);
        });

    let z = d3.select('#constraintEditor').classed("summarized");

    if (c.ctype === "null"){
        c.value = c.type = c.values = null;
    }
    else if (c.ctype === "subclass") {
        c.type = vals[0]
        c.value = c.values = null;
        setSubclassConstraint(n, c.type)
    }
    else if (c.ctype === "lookup") {
        c.value = val;
        c.values = c.type = null;
        c.extraValue = vals[0] === "Any" ? null : vals[0];
    }
    else if (c.ctype === "list") {
        c.value = vals[0];
        c.values = c.type = null;
    }
    else if (c.ctype === "multivalue") {
        c.values = vals;
        c.value = c.type = null;
    }
    else if (c.ctype === "range") {
        c.values = vals;
        c.value = c.type = null;
    }
    else if (c.ctype === "value") {
        c.value = z ? vals[0] : val;
        c.type = c.values = null;
    }
    else {
        throw "Unknown ctype: "+c.ctype;
    }
    hideConstraintEditor();
    update(n);
    showDialog(n, null, true);
    saveState();
}

// Opens a dialog on the specified node.
// Also makes that node the current node.
// Args:
//   n    the node
//   elt  the DOM element (e.g. a circle)
// Returns
//   string
// Side effect:
//   sets global currNode
//
function showDialog(n, elt, refreshOnly){
  if (!elt) elt = findDomByDataObj(n);
  hideConstraintEditor();
 
  // Set the global currNode
  currNode = n;
  var isroot = ! currNode.parent;
  // Make node the data obj for the dialog
  var dialog = d3.select("#dialog").datum(n);
  // Calculate dialog's position
  var dbb = dialog[0][0].getBoundingClientRect();
  var ebb = elt.getBoundingClientRect();
  var bbb = d3.select("#qb")[0][0].getBoundingClientRect();
  var t = (ebb.top - bbb.top) + ebb.width/2;
  var b = (bbb.bottom - ebb.bottom) + ebb.width/2;
  var l = (ebb.left - bbb.left) + ebb.height/2;
  var dir = "d" ; // "d" or "u"
  // NB: can't get opening up to work, so hard wire it to down. :-\

  //
  dialog
      .style("left", l+"px")
      .style("transform", refreshOnly?"scale(1)":"scale(1e-6)")
      .classed("hidden", false)
      .classed("isroot", isroot)
      ;
  if (dir === "d")
      dialog
          .style("top", t+"px")
          .style("bottom", null)
          .style("transform-origin", "0% 0%") ;
  else
      dialog
          .style("top", null)
          .style("bottom", b+"px")
          .style("transform-origin", "0% 100%") ;

  // Set the dialog title to node name
  dialog.select('[name="header"] [name="dialogTitle"] span')
      .text(n.name);
  // Show the full path
  dialog.select('[name="header"] [name="fullPath"] div')
      .text(n.path);
  // Type at this node
  var tp = n.ptype.name || n.ptype;
  var stp = (n.subclassConstraint && n.subclassConstraint.name) || null;
  var tstring = stp && `<span style="color: purple;">${stp}</span> (${tp})` || tp
  dialog.select('[name="header"] [name="type"] div')
      .html(tstring);

  // Wire up add constraint button
  dialog.select("#dialog .constraintSection .add-button")
        .on("click", function(){ addConstraint(n, true); });

  // Fill out the constraints section. First, select all constraints.
  var constrs = dialog.select(".constraintSection")
      .selectAll(".constraint")
      .data(n.constraints);
  // Enter(): create divs for each constraint to be displayed  (TODO: use an HTML5 template instead)
  // 1. container
  var cdivs = constrs.enter().append("div").attr("class","constraint") ;
  // 2. operator
  cdivs.append("div").attr("name", "op") ;
  // 3. value
  cdivs.append("div").attr("name", "value") ;
  // 4. constraint code
  cdivs.append("div").attr("name", "code") ;
  // 5. button to edit this constraint
  cdivs.append("i").attr("class", "material-icons edit").text("mode_edit");
  // 6. button to remove this constraint
  cdivs.append("i").attr("class", "material-icons cancel").text("delete_forever");

  // Remove exiting
  constrs.exit().remove() ;

  // Set the text for each constraint
  constrs
      .attr("class", function(c) { return "constraint " + c.ctype; });
  constrs.select('[name="code"]')
      .text(function(c){ return c.code || "?"; });
  constrs.select('[name="op"]')
      .text(function(c){ return c.op || "ISA"; });
  constrs.select('[name="value"]')
      .text(function(c){
          // FIXME 
          if (c.ctype === "lookup") {
              return c.value + (c.extraValue ? " in " + c.extraValue : "");
          }
          else
              return c.value || (c.values && c.values.join(",")) || c.type;
      });
  constrs.select("i.edit")
      .on("click", function(c){ 
          editConstraint(c, n);
      });
  constrs.select("i.cancel")
      .on("click", function(c){ 
          removeConstraint(n, c, true);
          saveState();
      })


  // Transition to "grow" the dialog out of the node
  dialog.transition()
      .duration(animationDuration)
      .style("transform","scale(1.0)");

  //
  var t = n.pcomp.type;
  if (typeof(t) === "string") {
      // dialog for simple attributes.
      dialog
          .classed("simple",true);
      dialog.select("span.clsName")
          .text(n.pcomp.type.name || n.pcomp.type );
      // 
      dialog.select(".select-ctrl")
          .classed("selected", function(n){ return n.isSelected });
  }
  else {
      // Dialog for classes
      dialog
          .classed("simple",false);
      dialog.select("span.clsName")
          .text(n.pcomp.type ? n.pcomp.type.name : n.pcomp.name);

      // wire up the button to show summary fields
      dialog.select('#dialog [name="showSummary"]')
          .on("click", () => selectedNext(currNode, "summaryfields"));

      // Fill in the table listing all the attributes/refs/collections.
      var tbl = dialog.select("table.attributes");
      var rows = tbl.selectAll("tr")
          .data((n.subclassConstraint || n.ptype).allParts)
          ;
      rows.enter().append("tr");
      rows.exit().remove();
      var cells = rows.selectAll("td")
          .data(function(comp) {
              if (comp.kind === "attribute") {
              return [{
                  name: comp.name,
                  cls: ''
                  },{
                  name: '<i class="material-icons" title="Select this attribute">play_arrow</i>',
                  cls: 'selectsimple',
                  click: function (){selectedNext(currNode, "selected", comp.name); }
                  },{
                  name: '<i class="material-icons" title="Constrain this attribute">play_arrow</i>',
                  cls: 'constrainsimple',
                  click: function (){selectedNext(currNode, "constrained", comp.name); }
                  }];
              }
              else {
              return [{
                  name: comp.name,
                  cls: ''
                  },{
                  name: `<i class="material-icons" title="Follow this ${comp.kind}">play_arrow</i>`,
                  cls: 'opennext',
                  click: function (){selectedNext(currNode, "open", comp.name); }
                  },{
                  name: "",
                  cls: ''
                  }];
              }
          })
          ;
      cells.enter().append("td");
      cells
          .attr("class", function(d){return d.cls;})
          .html(function(d){return d.name;})
          .on("click", function(d){ return d.click && d.click(); })
          ;
      cells.exit().remove();
  }
}

// Hides the dialog. Sets the current node to null.
// Args:
//   none
// Returns
//  nothing
// Side effects:
//  Hides the dialog.
//  Sets currNode to null.
//
function hideDialog(){
  currNode = null;
  var dialog = d3.select("#dialog")
      .classed("hidden", true)
      .transition()
      .duration(animationDuration/2)
      .style("transform","scale(1e-6)")
      ;
  d3.select("#constraintEditor")
      .classed("open", null)
      ;
}

function setLayout(style){
    layoutStyle = style;
    update(root);
}

function doLayout(root){
  var layout;
  let leaves = [];
  
  if (layoutStyle === "tree") {
      // d3 layout arranges nodes top-to-bottom, but we want left-to-right.
      // So...reverse width and height, and do the layout. Then, reverse the x,y coords in the results.
      layout = d3.layout.tree().size([h, w]);
      // Save nodes in global.
      nodes = layout.nodes(root).reverse();
      // Reverse x and y. Also, normalize x for fixed-depth.
      nodes.forEach(function(d) {
          let tmp = d.x; d.x = d.y; d.y = tmp;
          d.x = d.depth * 180;
      });
  }
  else {
      // dendrogram
      // Experimenting with rearranging leaves. Rough code ahead...

      function md (n) { // max depth
          if (n.children.length === 0) leaves.push(n);
          return 1 + (n.children.length ? Math.max.apply(null, n.children.map(md)) : 0);
      };
      let maxd = md(root); // max depth, 1-based
      layout = d3.layout.cluster()
          .separation((a,b) => 1)
          .size([h, maxd * 180]);
      // Compute the new layout, and save nodes in global.
      nodes = layout.nodes(root).reverse();
      nodes.forEach( d => { let tmp = d.x; d.x = d.y; d.y = tmp; });

      // Rearrange y-positions of leaf nodes. 
      // NOTE that x and y are reversed at this point
      let pos = leaves.map(function(n){ return { y: n.y, y0: n.y0 }; });
      // sort the leaf array by name
      leaves.sort(function(a,b) {
          let na = a.name.toLowerCase();
          let nb = b.name.toLowerCase();
          return na < nb ? -1 : na > nb ? 1 : 0;
      });
      // reassign the Y positions
      leaves.forEach(function(n, i){
          n.y = pos[i].y;
          n.y0 = pos[i].y0;
      });
      // At this point, leaves have been rearranged, but the interior nodes haven't.
      // Her we move interior nodes toward their "center of gravity" as defined
      // by the positions of their children. Apply this recursively up the tree.
      // 
      // NOTE that x and y coordinates are opposite at this point!
      //
      // Maintain a map of occupied positions:
      let occupied = {} ;  // occupied[x position] == [list of nodes]
      function cog (n) {
          if (n.children.length > 0) {
              // compute my c.o.g. as the average of my kids' positions
              let myCog = (n.children.map(cog).reduce((t,c) => t+c, 0))/n.children.length;
              if(n.parent) n.y = myCog;
          }
          let dd = occupied[n.y] = (occupied[n.y] || []);
          dd.push(n.y);
          return n.y;
      }
      cog(root);

      // TODO: Final adjustments
      // 1. If we extend off the right edge, compress.
      // 2. If items at same x overlap, spread them out in y.
  }

  // save links in global
  links = layout.links(nodes);

  return [nodes, links]
}

// --------------------------------------------------------------------------
// update(n) 
// The main drawing routine. 
// Updates the SVG, using n as the source of any entering/exiting animations.
//
function update(source) {
  //
  doLayout(root);
  updateNodes(nodes, source);
  updateLinks(links, source);
  updateTtext();
}

//
function updateNodes(nodes, source){
  let nodeGrps = vis.selectAll("g.nodegroup")
      .data(nodes, function(n) { return n.id || (n.id = ++i); })
      ;

  // Create new nodes at the parent's previous position.
  let nodeEnter = nodeGrps.enter()
      .append("svg:g")
      .attr("class", "nodegroup")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
      ;

  // Add glyph for the node
  //nodeEnter.append("svg:circle")
  nodeEnter.append(function(d){
      var shape = (d.pcomp.kind == "attribute" ? "rect" : "circle");
      return document.createElementNS("http://www.w3.org/2000/svg", shape);
      })
      .attr("class","node")
      .on("click", function(d) {
          if (currNode !== d) showDialog(d, this);
          d3.event.stopPropagation();
      });
  nodeEnter.select("circle")
      .attr("r", 1e-6) // start off invisibly small
      ;
  nodeEnter.select("rect")
      .attr("x", -8.5)
      .attr("y", -8.5)
      .attr("width", 1e-6) // start off invisibly small
      .attr("height", 1e-6) // start off invisibly small
      ;

  // Add text for node name
  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6) // start off nearly transparent
      .attr("class","nodeName")
      ;

  // Transition nodes to their new position.
  let nodeUpdate = nodeGrps
      .classed("selected", function(n){ return n.isSelected; })
      .classed("constrained", function(n){ return n.constraints.length > 0; })
      .transition()
      .duration(animationDuration)
      .attr("transform", function(n) { return "translate(" + n.x + "," + n.y + ")"; })
      ;


  // Add text for constraints
  let ct = nodeGrps.selectAll("text.constraint")
      .data(function(n){ return n.constraints; });
  ct.enter().append("svg:text").attr("class", "constraint");
  ct.exit().remove();
  ct.text( c => constraintText(c) )
       .attr("x", 0)
       .attr("dy", (c,i) => `${(i+1)*1.7}em`)
       .attr("text-anchor","start")
       ;

  // Transition circles to full size
  nodeUpdate.select("circle")
      .attr("r", 8.5 )
      ;
  nodeUpdate.select("rect")
      .attr("width", 17 )
      .attr("height", 17 )
      ;

  // Transition text to fully opaque
  nodeUpdate.select("text")
      .style("fill-opacity", 1)
      ;

  //
  // Transition exiting nodes to the parent's new position.
  let nodeExit = nodeGrps.exit().transition()
      .duration(animationDuration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
      .remove()
      ;

  // Transition circles to tiny radius
  nodeExit.select("circle")
      .attr("r", 1e-6)
      ;

  // Transition text to transparent
  nodeExit.select("text")
      .style("fill-opacity", 1e-6)
      ;
  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  //

}

//
function updateLinks(links, source) {
  let link = vis.selectAll("path.link")
      .data(links, function(d) { return d.target.id; })
      ;

  // Enter any new links at the parent's previous position.
  let newPaths = link.enter().insert("svg:path", "g");
  let linkTitle = function(l){
      let click = "";
      if (l.target.pcomp.kind !== "attribute"){
          click = `Click to make this relationship ${l.target.join ? "REQUIRED" : "OPTIONAL"}. `;
      }
      let altclick = "Alt-click to cut link.";
      return click + altclick;
  }
  // set the tooltip
  newPaths.append("svg:title").text(linkTitle);
  newPaths.attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .classed("attribute", function(l) { return l.target.pcomp.kind === "attribute"; })
      .on("click", function(l){ 
          if (d3.event.altKey) {
              // a shift-click cuts the tree at this edge
              removeNode(l.target)
          }
          else {
              if (l.target.pcomp.kind == "attribute") return;
              // regular click on a relationship edge inverts whether
              // the join is inner or outer. 
              l.target.join = (l.target.join ? null : "outer");
              // re-set the tooltip
              d3.select(this).select("title").text(linkTitle);
              update(l.source);
          }
      })
      .transition()
        .duration(animationDuration)
        .attr("d", diagonal)
      ;
 
  
  // Transition links to their new position.
  link.classed("outer", function(n) { return n.target.join === "outer"; })
      .transition()
      .duration(animationDuration)
      .attr("d", diagonal)
      ;

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(animationDuration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove()
      ;

}

// Turns a json representation of a template into XML, suitable for importing into the Intermine QB.
function json2xml(t, qonly){
    var so = (t.orderBy || []).reduce(function(s,x){ 
        var k = Object.keys(x)[0];
        var v = x[k]
        return s + `${k} ${v} `;
    }, "");

    // Function to escape '<' '"' and '&' characters
    var esc = function(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
    // Converts an outer join path to xml.
    function oj2xml(oj){
        return `<join path="${oj}" style="OUTER" />`;
    }
    // Converts a constraint to xml
    function c2xml(c){
        let g = '';
        let h = '';
        if (c.ctype === "value" || c.ctype === "list")
            g = `path="${c.path}" op="${esc(c.op)}" value="${esc(c.value)}" code="${c.code}" editable="${c.editable}"`;
        else if (c.ctype === "lookup"){
            let ev = (c.extraValue && c.extraValue !== "Any") ? `extraValue="${c.extraValue}"` : "";
            g = `path="${c.path}" op="${esc(c.op)}" value="${esc(c.value)}" ${ev} code="${c.code}" editable="${c.editable}"`;
        }
        else if (c.ctype === "multivalue"){
            g = `path="${c.path}" op="${c.op}" code="${c.code}" editable="${c.editable}"`;
            h = c.values.map( v => `<value>${esc(v)}</value>` ).join('');
        }
        else if (c.ctype === "subclass")
            g = `path="${c.path}" type="${c.type}" editable="false"`;
        else if (c.ctype === "null")
            g = `path="${c.path}" op="${c.op}" code="${c.code}" editable="${c.editable}"`;
        if(h)
            return `<constraint ${g}>${h}</constraint>\n`;
        else
            return `<constraint ${g} />\n`;
    }

    // the query part
    var qpart = 
`<query
  name="${t.name || ''}"
  model="${(t.model && t.model.name) || ''}"
  view="${t.select.join(' ')}"
  longDescription="${esc(t.description || '')}"
  sortOrder="${so || ''}"
  constraintLogic="${t.constraintLogic || ''}">
  ${(t.joins || []).map(oj2xml).join(" ")}
  ${(t.where || []).map(c2xml).join(" ")}
</query>`;
    // the whole template
    var tmplt = 
`<template
  name="${t.name || ''}"
  title="${esc(t.title || '')}"
  comment="${esc(t.comment || '')}">
 ${qpart}
</template>
`;
    return qonly ? qpart : tmplt
}

//
function updateTtext(){
  let uct = uncompileTemplate(currTemplate);
  let txt;
  if( d3.select("#ttext").classed("json") )
      txt = JSON.stringify(uct, null, 2);
  else
      txt = json2xml(uct);
  d3.select("#ttextdiv") 
      .text(txt)
      .on("focus", function(){
          d3.select("#drawer").classed("expanded", true);
          Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["selectText"])("ttextdiv");
      })
      .on("blur", function() {
          d3.select("#drawer").classed("expanded", false);
      });
  if (d3.select('#querycount .button.sync').text() === "sync")
      updateCount();
}

function runatmine() {
  let uct = uncompileTemplate(currTemplate);
  let txt = json2xml(uct);
  let urlTxt = encodeURIComponent(txt);
  let linkurl = currMine.url + "/loadQuery.do?trail=%7Cquery&method=xml";
  let editurl = linkurl + "&query=" + urlTxt;
  let runurl = linkurl + "&skipBuilder=true&query=" + urlTxt;
  window.open( d3.event.altKey ? editurl : runurl, '_blank' );
}

function updateCount(){
  let uct = uncompileTemplate(currTemplate);
  let qtxt = json2xml(uct, true);
  let urlTxt = encodeURIComponent(qtxt);
  let countUrl = currMine.url + `/service/query/results?query=${urlTxt}&format=count`;
  d3.select('#querycount').classed("running", true);
  Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(countUrl)
      .then(function(n){
          d3.select('#querycount').classed("error", false).classed("running", false);
          d3.select('#querycount span').text(n)
      })
      .catch(function(e){
          d3.select('#querycount').classed("error", true).classed("running", false);
          console.log("ERROR::", qtxt)
      });
}

// The call that gets it all going...
setup()
//


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = /*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */
(function() {
  "use strict";

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },

          "class": function(expectation) {
            var escapedParts = "",
                i;

            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                : classEscape(expectation.parts[i]);
            }

            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },

          any: function(expectation) {
            return "any character";
          },

          end: function(expectation) {
            return "end of input";
          },

          other: function(expectation) {
            return expectation.description;
          }
        };

    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }

    function literalEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g,  '\\"')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function classEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/-/g,  '\\-')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }

    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }

    function describeExpected(expected) {
      var descriptions = new Array(expected.length),
          i, j;

      for (i = 0; i < expected.length; i++) {
        descriptions[i] = describeExpectation(expected[i]);
      }

      descriptions.sort();

      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      switch (descriptions.length) {
        case 1:
          return descriptions[0];

        case 2:
          return descriptions[0] + " or " + descriptions[1];

        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };

  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};

    var peg$FAILED = {},

        peg$startRuleFunctions = { Expression: peg$parseExpression },
        peg$startRuleFunction  = peg$parseExpression,

        peg$c0 = "or",
        peg$c1 = peg$literalExpectation("or", false),
        peg$c2 = "OR",
        peg$c3 = peg$literalExpectation("OR", false),
        peg$c4 = function(head, tail) { 
              return propagate("or", head, tail)
            },
        peg$c5 = "and",
        peg$c6 = peg$literalExpectation("and", false),
        peg$c7 = "AND",
        peg$c8 = peg$literalExpectation("AND", false),
        peg$c9 = function(head, tail) {
              return propagate("and", head, tail)
            },
        peg$c10 = "(",
        peg$c11 = peg$literalExpectation("(", false),
        peg$c12 = ")",
        peg$c13 = peg$literalExpectation(")", false),
        peg$c14 = function(expr) { return expr; },
        peg$c15 = peg$otherExpectation("code"),
        peg$c16 = /^[A-Za-z]/,
        peg$c17 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false),
        peg$c18 = function() { return text().toUpperCase(); },
        peg$c19 = peg$otherExpectation("whitespace"),
        peg$c20 = /^[ \t\n\r]/,
        peg$c21 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1 }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location
      );
    }

    function error(message, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

      throw peg$buildSimpleError(message, location);
    }

    function peg$literalExpectation(text, ignoreCase) {
      return { type: "literal", text: text, ignoreCase: ignoreCase };
    }

    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }

    function peg$anyExpectation() {
      return { type: "any" };
    }

    function peg$endExpectation() {
      return { type: "end" };
    }

    function peg$otherExpectation(description) {
      return { type: "other", description: description };
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column
        };

        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildSimpleError(message, location) {
      return new peg$SyntaxError(message, null, null, location);
    }

    function peg$buildStructuredError(expected, found, location) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parseExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTerm();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c0) {
              s6 = peg$c0;
              peg$currPos += 2;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1); }
            }
            if (s6 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c2) {
                s6 = peg$c2;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c3); }
              }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parse_();
              if (s7 !== peg$FAILED) {
                s8 = peg$parseTerm();
                if (s8 !== peg$FAILED) {
                  s5 = [s5, s6, s7, s8];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c0) {
                s6 = peg$c0;
                peg$currPos += 2;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
              if (s6 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c2) {
                  s6 = peg$c2;
                  peg$currPos += 2;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c3); }
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseTerm();
                  if (s8 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c4(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseTerm() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseFactor();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c5) {
            s5 = peg$c5;
            peg$currPos += 3;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s5 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c7) {
              s5 = peg$c7;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseFactor();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c5) {
              s5 = peg$c5;
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c7) {
                s5 = peg$c7;
                peg$currPos += 3;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseFactor();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c9(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseFactor() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c10;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseExpression();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c12;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c13); }
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseCode();
      }

      return s0;
    }

    function peg$parseCode() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (peg$c16.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c18();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c20.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c20.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }

      return s0;
    }


      function propagate(op, head, tail) {
          if (tail.length === 0) return head;
          return tail.reduce(function(result, element) {
            result.children.push(element[3]);
            return  result;
          }, {"op":op, children:[head]});
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }

      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Constraints on attributes:
// - value (comparing an attribute to a value, using an operator)
//      > >= < <= = != LIKE NOT-LIKE CONTAINS DOES-NOT-CONTAIN
// - multivalue (subtype of value constraint, multiple value)
//      ONE-OF NOT-ONE OF
// - range (subtype of multivalue, for coordinate ranges)
//      WITHIN OUTSIDE OVERLAPS DOES-NOT-OVERLAP
// - null (subtype of value constraint, for testing NULL)
//      NULL IS-NOT-NULL
//
// Constraints on references/collections
// - null (subtype of value constraint, for testing NULL ref/empty collection)
//      NULL IS-NOT-NULL
// - lookup (
//      LOOKUP
// - subclass
//      ISA
// - list
//      IN NOT-IN
// - loop (TODO)

var NUMERICTYPES= [
    "int", "java.lang.Integer",
    "short", "java.lang.Short",
    "long", "java.lang.Long",
    "float", "java.lang.Float",
    "double", "java.lang.Double",
    "java.math.BigDecimal",
    "java.util.Date"
];

var NULLABLETYPES= [
    "java.lang.Integer",
    "java.lang.Short",
    "java.lang.Long",
    "java.lang.Float",
    "java.lang.Double",
    "java.math.BigDecimal",
    "java.util.Date",
    "java.lang.String",
    "java.lang.Boolean"
];

var LEAFTYPES= [
    "int", "java.lang.Integer",
    "short", "java.lang.Short",
    "long", "java.lang.Long",
    "float", "java.lang.Float",
    "double", "java.lang.Double",
    "java.math.BigDecimal",
    "java.util.Date",
    "java.lang.String",
    "java.lang.Boolean",
    "java.lang.Object",
    "Object"
]


var OPS = [

    // Valid for any attribute
    // Also the operators for loop constraints (not yet implemented).
    {
    op: "=",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false
    },{
    op: "!=",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false
    },
    
    // Valid for numeric and date attributes
    {
    op: ">",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: NUMERICTYPES
    },{
    op: ">=",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: NUMERICTYPES
    },{
    op: "<",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: NUMERICTYPES
    },{
    op: "<=",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: NUMERICTYPES
    },
    
    // Valid for string attributes
    {
    op: "CONTAINS",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]

    },{
    op: "DOES NOT CONTAIN",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]
    },{
    op: "LIKE",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]
    },{
    op: "NOT LIKE",
    ctype: "value",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]
    },{
    op: "ONE OF",
    ctype: "multivalue",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]
    },{
    op: "NONE OF",
    ctype: "multivalue",
    validForClass: false,
    validForAttr: true,
    validForRoot: false,
    validTypes: ["java.lang.String"]
    },
    
    // Valid only for Location nodes
    {
    op: "WITHIN",
    ctype: "range"
    },{
    op: "OVERLAPS",
    ctype: "range"
    },{
    op: "DOES NOT OVERLAP",
    ctype: "range"
    },{
    op: "OUTSIDE",
    ctype: "range"
    },
 
    // NULL constraints. Valid for any node except root.
    {
    op: "IS NULL",
    ctype: "null",
    validForClass: true,
    validForAttr: true,
    validForRoot: false,
    validTypes: NULLABLETYPES
    },{
    op: "IS NOT NULL",
    ctype: "null",
    validForClass: true,
    validForAttr: true,
    validForRoot: false,
    validTypes: NULLABLETYPES
    },
    
    // Valid only at any non-attribute node (i.e., the root, or any 
    // reference or collection node).
    {
    op: "LOOKUP",
    ctype: "lookup",
    validForClass: true,
    validForAttr: false,
    validForRoot: true
    },{
    op: "IN",
    ctype: "list",
    validForClass: true,
    validForAttr: false,
    validForRoot: true
    },{
    op: "NOT IN",
    ctype: "list",
    validForClass: true,
    validForAttr: false,
    validForRoot: true
    },
    
    // Valid at any non-attribute node except the root.
    {
    op: "ISA",
    ctype: "subclass",
    validForClass: true,
    validForAttr: false,
    validForRoot: false
    }];
//
var OPINDEX = OPS.reduce(function(x,o){
    x[o.op] = o;
    return x;
}, {});

module.exports = { NUMERICTYPES, NULLABLETYPES, LEAFTYPES, OPS, OPINDEX };


/***/ }),
/* 3 */
/***/ (function(module, exports) {


// Promisifies a call to d3.json.
// Args:
//   url (string) The url of the json resource
// Returns:
//   a promise that resolves to the json object value, or rejects with an error
function d3jsonPromise(url) {
    return new Promise(function(resolve, reject) {
        d3.json(url, function(error, json){
            error ? reject({ status: error.status, statusText: error.statusText}) : resolve(json);
        })
    });
}

// Selects all the text in the given container. 
// The container must have an id.
// Copied from:
//   https://stackoverflow.com/questions/31677451/how-to-select-div-text-on-button-click
function selectText(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().empty();
        window.getSelection().addRange(range);
    }
}

// Converts an InterMine query in PathQuery XML format to a JSON object representation.
//
function parsePathQuery(xml){
    // Turns the quasi-list object returned by some DOM methods into actual lists.
    function domlist2array(lst) {
        let a = [];
        for(let i=0; i<lst.length; i++) a.push(lst[i]);
        return a;
    }
    // parse the XML
    let parser = new DOMParser();
    let dom = parser.parseFromString(xml, "text/xml");

    // get the parts. User may paste in a <template> or a <query>
    // (i.e., template may be null)
    let template = dom.getElementsByTagName("template")[0];
    let title = template && template.getAttribute("title") || "";
    let comment = template && template.getAttribute("comment") || "";
    let query = dom.getElementsByTagName("query")[0];
    let model = { name: query.getAttribute("model") || "genomic" };
    let name = query.getAttribute("name") || "";
    let description = query.getAttribute("longDescrition") || "";
    let select = (query.getAttribute("view") || "").trim().split(/\s+/);
    let constraints = domlist2array(dom.getElementsByTagName('constraint'));
    let constraintLogic = query.getAttribute("constraintLogic");
    let joins = domlist2array(query.getElementsByTagName("join"));
    let sortOrder = query.getAttribute("sortOrder") || "";
    //
    //
    let where = constraints.map(function(c){
            let op = c.getAttribute("op");
            let type = null;
            if (!op) {
                type = c.getAttribute("type");
                op = "ISA";
            }
            let vals = domlist2array(c.getElementsByTagName("value")).map( v => v.innerHTML );
            return {
                op: op,
                path: c.getAttribute("path"),
                value : c.getAttribute("value"),
                values : vals,
                type : c.getAttribute("type"),
                code: c.getAttribute("code"),
                editable: c.getAttribute("editable") || "true"
                };
        });
    // Check: if there is only one constraint, (and it's not an ISA), sometimes the constraintLogic 
    // and/or the constraint code are missing.
    if (where.length === 1 && where[0].op !== "ISA" && !where[0].code){
        where[0].code = constraintLogic = "A";
    }

    // outer joins. They look like this:
    //       <join path="Gene.sequenceOntologyTerm" style="OUTER"/>
    joins = joins.map( j => j.getAttribute("path") );

    let orderBy = null;
    if (sortOrder) {
        // The json format for orderBy is a bit weird.
        // If the xml orderBy is: "A.b.c asc A.d.e desc",
        // the json should be: [ {"A.b.c":"asc"}, {"A.d.e":"desc} ]
        // 
        // The orderby string tokens, e.g. ["A.b.c", "asc", "A.d.e", "desc"]
        let ob = sortOrder.trim().split(/\s+/);
        // sanity check:
        if (ob.length % 2 )
            throw "Could not parse the orderBy clause: " + query.getAttribute("sortOrder");
        // convert tokens to json orderBy 
        orderBy = ob.reduce(function(acc, curr, i){
            if (i % 2 === 0){
                // odd. curr is a path. Push it.
                acc.push(curr)
            }
            else {
                // even. Pop the path, create the {}, and push it.
                let v = {}
                let p = acc.pop()
                v[p] = curr;
                acc.push(v);
            }
            return acc;
            }, []);
    }

    return {
        title,
        comment,
        model,
        name,
        description,
        constraintLogic,
        select,
        where,
        joins,
        orderBy
    };
}

// Returns a deep copy of object o. 
// Args:
//   o  (object) Must be a JSON object (no curcular refs, no functions).
// Returns:
//   a deep copy of o
function deepc(o) {
    if (!o) return o;
    return JSON.parse(JSON.stringify(o));
}

//
let PREFIX="org.mgi.apps.qb";
function testLocal(attr) {
    return (PREFIX+"."+attr) in localStorage;
}
function setLocal(attr, val, encode){
    localStorage[PREFIX+"."+attr] = encode ? JSON.stringify(val) : val;
}
function getLocal(attr, decode, dflt){
    let key = PREFIX+"."+attr;
    if (key in localStorage){
        let v = localStorage[key];
        if (decode) v = JSON.parse(v);
        return v;
    }
    else {
        return dflt;
    }
}
function clearLocal() {
    let rmv = Object.keys(localStorage).filter(key => key.startsWith(PREFIX));
    rmv.forEach( k => localStorage.removeItem(k) );
}

//
module.exports = {
    d3jsonPromise,
    selectText,
    deepc,
    getLocal,
    setLocal,
    testLocal,
    clearLocal,
    parsePathQuery
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class UndoManager {
    constructor(limit) {
        this.clear();
    }
    clear () {
        this.history = [];
        this.pointer = -1;
    }
    get currentState () {
        if (this.pointer < 0)
            throw "No current state.";
        return this.history[this.pointer];
    }
    get hasState () {
        return this.pointer >= 0;
    }
    get canUndo () {
        return this.pointer > 0;
    }
    get canRedo () {
        return this.hasState && this.pointer < this.history.length-1;
    }
    add (s) {
        //console.log("ADD");
        this.pointer += 1;
        this.history[this.pointer] = s;
        this.history.splice(this.pointer+1);
    }
    undo () {
        //console.log("UNDO");
        if (! this.canUndo) throw "No undo."
        this.pointer -= 1;
        return this.history[this.pointer];
    }
    redo () {
        //console.log("REDO");
        if (! this.canRedo) throw "No redo."
        this.pointer += 1;
        return this.history[this.pointer];
    }
}

/* harmony default export */ __webpack_exports__["a"] = (UndoManager);


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjM2N2ZiYjk2MDc5MmE1N2E3NTEiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsUUFBUTtBQUM2QztBQVU5RDs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QixxQkFBcUIsVUFBVSxnQ0FBZ0M7QUFDL0Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUNBQWlDLG1CQUFtQixFQUFFOztBQUV0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UztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxpQkFBaUIsRUFBRTtBQUNwRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQWdDLDBCQUEwQixFQUFFO0FBQzVELFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyx1Q0FBdUMsRUFBRTs7QUFFOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNi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QUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUwsa0JBQWtCOzs7Ozs7OztBQzVObEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixvREFBb0Q7QUFDaEYsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixjQUFjO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsY0FBYyxHQUFHLGNBQWM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoicWIuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMjM2N2ZiYjk2MDc5MmE1N2E3NTEiLCJcbi8qXG4gKiBEYXRhIHN0cnVjdHVyZXM6XG4gKiAgIDAuIFRoZSBkYXRhIG1vZGVsIGZvciBhIG1pbmUgaXMgYSBncmFwaCBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBcbiAqICAgY2xhc3NlcywgdGhlaXIgY29tcG9uZW50cyAoYXR0cmlidXRlcywgcmVmZXJlbmNlcywgY29sbGVjdGlvbnMpLCBhbmQgcmVsYXRpb25zaGlwcy5cbiAqICAgMS4gVGhlIHF1ZXJ5IGlzIHJlcHJlc2VudGVkIGJ5IGEgZDMtc3R5bGUgaGllcmFyY2h5IHN0cnVjdHVyZTogYSBsaXN0IG9mXG4gKiAgIG5vZGVzLCB3aGVyZSBlYWNoIG5vZGUgaGFzIGEgbmFtZSAoc3RyaW5nKSwgYW5kIGEgY2hpbGRyZW4gbGlzdCAocG9zc2libHkgZW1wdHkgXG4gKiAgIGxpc3Qgb2Ygbm9kZXMpLiBUaGUgbm9kZXMgYW5kIHRoZSBwYXJlbnQvY2hpbGQgcmVsYXRpb25zaGlwcyBvZiB0aGlzIHN0cnVjdHVyZSBcbiAqICAgYXJlIHdoYXQgZHJpdmUgdGhlIGRpc2xheS5cbiAqICAgMi4gRWFjaCBub2RlIGluIHRoZSBkaWFncmFtIGNvcnJlc3BvbmRzIHRvIGEgY29tcG9uZW50IGluIGEgcGF0aCwgd2hlcmUgZWFjaFxuICogICBwYXRoIHN0YXJ0cyB3aXRoIHRoZSByb290IGNsYXNzLCBvcHRpb25hbGx5IHByb2NlZWRzIHRocm91Z2ggcmVmZXJlbmNlcyBhbmQgY29sbGVjdGlvbnMsXG4gKiAgIGFuZCBvcHRpb25hbGx5IGVuZHMgYXQgYW4gYXR0cmlidXRlLlxuICpcbiAqL1xuaW1wb3J0IHBhcnNlciBmcm9tICcuL3BhcnNlci5qcyc7XG4vL2ltcG9ydCB7IG1pbmVzIH0gZnJvbSAnLi9taW5lcy5qcyc7XG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHtcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgZ2V0TG9jYWwsXG4gICAgc2V0TG9jYWwsXG4gICAgdGVzdExvY2FsLFxuICAgIGNsZWFyTG9jYWwsXG4gICAgcGFyc2VQYXRoUXVlcnlcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmltcG9ydCBVbmRvTWFuYWdlciBmcm9tICcuL3VuZG9NYW5hZ2VyLmpzJztcblxubGV0IGN1cnJNaW5lO1xubGV0IGN1cnJUZW1wbGF0ZTtcbmxldCBjdXJyTm9kZTtcblxubGV0IG5hbWUybWluZTtcbmxldCBtO1xubGV0IHc7XG5sZXQgaDtcbmxldCBpO1xubGV0IHJvb3Q7XG5sZXQgZGlhZ29uYWw7XG5sZXQgdmlzO1xubGV0IG5vZGVzO1xubGV0IGxpbmtzO1xubGV0IGxheW91dFN0eWxlID0gXCJ0cmVlXCI7XG5sZXQgYW5pbWF0aW9uRHVyYXRpb24gPSAyNTA7IC8vIG1zXG5sZXQgZGVmYXVsdENvbG9ycyA9IHsgaGVhZGVyOiB7IG1haW46IFwiIzU5NTQ1NVwiLCB0ZXh0OiBcIiNmZmZcIiB9IH07XG5sZXQgZGVmYXVsdExvZ28gPSBcImh0dHBzOi8vY2RuLnJhd2dpdC5jb20vaW50ZXJtaW5lL2Rlc2lnbi1tYXRlcmlhbHMvNzhhMTNkYjUvbG9nb3MvaW50ZXJtaW5lL3NxdWFyZWlzaC80NXg0NS5wbmdcIjtcbmxldCB1bmRvTWdyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XG5cbmZ1bmN0aW9uIHNldHVwKCl7XG4gICAgbSA9IFsyMCwgMTIwLCAyMCwgMTIwXVxuICAgIHcgPSAxMjgwIC0gbVsxXSAtIG1bM11cbiAgICBoID0gODAwIC0gbVswXSAtIG1bMl1cbiAgICBpID0gMFxuXG4gICAgZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAucHJvamVjdGlvbihmdW5jdGlvbihkKSB7IHJldHVybiBbZC54LCBkLnldOyB9KTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgU1ZHIGNvbnRhaW5lclxuICAgIHZpcyA9IGQzLnNlbGVjdChcIiNzdmdDb250YWluZXIgc3ZnXCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgdyArIG1bMV0gKyBtWzNdKVxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoICsgbVswXSArIG1bMl0pXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpXG4gICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtWzNdICsgXCIsXCIgKyBtWzBdICsgXCIpXCIpO1xuICAgIC8vXG4gICAgZDMuc2VsZWN0KCcjdEluZm9CYXIgPiBpLmJ1dHRvbltuYW1lPVwib3BlbmNsb3NlXCJdJylcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgXG4gICAgICAgICAgICBsZXQgdCA9IGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKTtcbiAgICAgICAgICAgIGxldCB3YXNDbG9zZWQgPSB0LmNsYXNzZWQoXCJjbG9zZWRcIik7XG4gICAgICAgICAgICBsZXQgaXNDbG9zZWQgPSAhd2FzQ2xvc2VkO1xuICAgICAgICAgICAgbGV0IGQgPSBkMy5zZWxlY3QoJyNkcmF3ZXInKVswXVswXVxuICAgICAgICAgICAgaWYgKGlzQ2xvc2VkKVxuICAgICAgICAgICAgICAgIC8vIHNhdmUgdGhlIGN1cnJlbnQgaGVpZ2h0IGp1c3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgICAgICAgICAgICBkLl9fc2F2ZWRfaGVpZ2h0ID0gZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICBlbHNlIGlmIChkLl9fc2F2ZWRfaGVpZ2h0KVxuICAgICAgICAgICAgICAgLy8gb24gb3BlbiwgcmVzdG9yZSB0aGUgc2F2ZWQgaGVpZ2h0XG4gICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNkcmF3ZXInKS5zdHlsZShcImhlaWdodFwiLCBkLl9fc2F2ZWRfaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHQuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcykudGV4dCggaXNDbG9zZWQgPyBcImFkZFwiIDogXCJjbGVhclwiICk7XG4gICAgICAgIH0pO1xuXG4gICAgZDNqc29uUHJvbWlzZShcIi4vcmVzb3VyY2VzL3Rlc3RkYXRhL3JlZ2lzdHJ5Lmpzb25cIilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGpfbWluZXMpe1xuICAgICAgICB2YXIgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICAgICAgbmFtZTJtaW5lID0ge307XG4gICAgICAgIG1pbmVzLmZvckVhY2goZnVuY3Rpb24obSl7IG5hbWUybWluZVttLm5hbWVdID0gbTsgfSk7XG4gICAgICAgIGN1cnJNaW5lID0gbWluZXNbMF07XG4gICAgICAgIGN1cnJUZW1wbGF0ZSA9IG51bGw7XG5cbiAgICAgICAgdmFyIG1sID0gZDMuc2VsZWN0KFwiI21saXN0XCIpLnNlbGVjdEFsbChcIm9wdGlvblwiKS5kYXRhKG1pbmVzKTtcbiAgICAgICAgdmFyIHNlbGVjdE1pbmUgPSBcIk1vdXNlTWluZVwiO1xuICAgICAgICBtbC5lbnRlcigpLmFwcGVuZChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgICAgIHZhciBtID0gZC51cmwuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgICAgIHZhciB2ID0gKHcgJiYgIW0pIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZT09PXNlbGVjdE1pbmUgfHwgbnVsbDsgfSlcbiAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gd2hlbiBhIG1pbmUgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdFxuICAgICAgICBkMy5zZWxlY3QoXCIjbWxpc3RcIilcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZE1pbmUodGhpcy52YWx1ZSk7IH0pO1xuICAgICAgICAvL1xuICAgICAgICB2YXIgZGcgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpO1xuICAgICAgICBkZy5jbGFzc2VkKFwiaGlkZGVuXCIsdHJ1ZSlcbiAgICAgICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5jbG9zZVwiKS5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpO1xuICAgICAgICBkZy5zZWxlY3QoXCIuYnV0dG9uLnJlbW92ZVwiKS5vbihcImNsaWNrXCIsICgpID0+IHJlbW92ZU5vZGUoY3Vyck5vZGUpKTtcblxuICAgICAgICAvLyBcbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0KFwiI2xheW91dHN0eWxlXCIpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkgeyBzZXRMYXlvdXQodGhpcy52YWx1ZSk7IH0pXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc3ViY2xhc3NDb25zdHJhaW50IHNlbGVjdFwiKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNldFN1YmNsYXNzQ29uc3RyYWludChjdXJyTm9kZSwgdGhpcy52YWx1ZSk7IH0pO1xuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoXCIjZGlhbG9nIC5zZWxlY3QtY3RybFwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY3Vyck5vZGUuaXNTZWxlY3RlZCA/IGN1cnJOb2RlLnVuc2VsZWN0KCkgOiBjdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgICAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChcIiNkaWFsb2cgLnNlbGVjdC1jdHJsXCIpLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBjdXJyTm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG1pbmUgYnkgZGVmYXVsdC5cbiAgICAgICAgc2VsZWN0ZWRNaW5lKHNlbGVjdE1pbmUpO1xuICAgICAgfSk7XG5cbiAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgdXBkYXRlVHRleHQoKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgLm9uKCdjbGljaycsIHJ1bmF0bWluZSk7XG4gICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgdC50ZXh0KCB0dXJuU3luY09mZiA/IFwic3luY19kaXNhYmxlZFwiIDogXCJzeW5jXCIgKVxuICAgICAgICAgICAgIC5hdHRyKFwidGl0bGVcIiwgKCkgPT5cbiAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgIXR1cm5TeW5jT2ZmICYmIHVwZGF0ZUNvdW50KCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIilcbiAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwianNvbnRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI3VuZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgdW5kbyk7XG4gICAgZDMuc2VsZWN0KFwiI3JlZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgcmVkbyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyU3RhdGUoKSB7XG4gICAgdW5kb01nci5jbGVhcigpO1xufVxuZnVuY3Rpb24gc2F2ZVN0YXRlKCkge1xuICAgIGxldCBzID0gSlNPTi5zdHJpbmdpZnkodW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKSk7XG4gICAgdW5kb01nci5hZGQocyk7XG59XG5mdW5jdGlvbiB1bmRvKCkgeyB1bmRvcmVkbyhcInVuZG9cIikgfVxuZnVuY3Rpb24gcmVkbygpIHsgdW5kb3JlZG8oXCJyZWRvXCIpIH1cbmZ1bmN0aW9uIHVuZG9yZWRvKHdoaWNoKXtcbiAgICB0cnkge1xuICAgICAgICBsZXQgcyA9IEpTT04ucGFyc2UodW5kb01nclt3aGljaF0oKSk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShzLCB0cnVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuLy8gQ2FsbGVkIHdoZW4gdXNlciBzZWxlY3RzIGEgbWluZSBmcm9tIHRoZSBvcHRpb24gbGlzdFxuLy8gTG9hZHMgdGhhdCBtaW5lJ3MgZGF0YSBtb2RlbCBhbmQgYWxsIGl0cyB0ZW1wbGF0ZXMuXG4vLyBUaGVuIGluaXRpYWxpemVzIGRpc3BsYXkgdG8gc2hvdyB0aGUgZmlyc3QgdGVybXBsYXRlJ3MgcXVlcnkuXG5mdW5jdGlvbiBzZWxlY3RlZE1pbmUobW5hbWUpe1xuICAgIGN1cnJNaW5lID0gbmFtZTJtaW5lW21uYW1lXVxuICAgIGlmKCFjdXJyTWluZSkgcmV0dXJuO1xuICAgIGxldCB1cmwgPSBjdXJyTWluZS51cmw7XG4gICAgbGV0IHR1cmwsIG11cmwsIGx1cmwsIGJ1cmwsIHN1cmwsIG91cmw7XG4gICAgY3Vyck1pbmUudG5hbWVzID0gW11cbiAgICBjdXJyTWluZS50ZW1wbGF0ZXMgPSBbXVxuICAgIGlmIChtbmFtZSA9PT0gXCJ0ZXN0XCIpIHsgXG4gICAgICAgIHR1cmwgPSB1cmwgKyBcIi90ZW1wbGF0ZXMuanNvblwiO1xuICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICBsdXJsID0gdXJsICsgXCIvbGlzdHMuanNvblwiO1xuICAgICAgICBidXJsID0gdXJsICsgXCIvYnJhbmRpbmcuanNvblwiO1xuICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgIG91cmwgPSB1cmwgKyBcIi9vcmdhbmlzbWxpc3QuanNvblwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3NlcnZpY2UvdGVtcGxhdGVzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL21vZGVsP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2JyYW5kaW5nXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3N1bW1hcnlmaWVsZHNcIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgIH1cbiAgICAvLyBnZXQgdGhlIG1vZGVsXG4gICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBkM2pzb25Qcm9taXNlKG11cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGx1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGJ1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKG91cmwpXG4gICAgXSkudGhlbiggZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgal9tb2RlbCA9IGRhdGFbMF07XG4gICAgICAgIHZhciBqX3RlbXBsYXRlcyA9IGRhdGFbMV07XG4gICAgICAgIHZhciBqX2xpc3RzID0gZGF0YVsyXTtcbiAgICAgICAgdmFyIGpfYnJhbmRpbmcgPSBkYXRhWzNdO1xuICAgICAgICB2YXIgal9zdW1tYXJ5ID0gZGF0YVs0XTtcbiAgICAgICAgdmFyIGpfb3JnYW5pc21zID0gZGF0YVs1XTtcbiAgICAgICAgLy9cbiAgICAgICAgY3Vyck1pbmUubW9kZWwgPSBjb21waWxlTW9kZWwoal9tb2RlbC5tb2RlbClcbiAgICAgICAgY3Vyck1pbmUudGVtcGxhdGVzID0gal90ZW1wbGF0ZXMudGVtcGxhdGVzO1xuICAgICAgICBjdXJyTWluZS5saXN0cyA9IGpfbGlzdHMubGlzdHM7XG4gICAgICAgIGN1cnJNaW5lLnN1bW1hcnlGaWVsZHMgPSBqX3N1bW1hcnkuY2xhc3NlcztcbiAgICAgICAgY3Vyck1pbmUub3JnYW5pc21MaXN0ID0gal9vcmdhbmlzbXMucmVzdWx0cy5tYXAobyA9PiBvLnNob3J0TmFtZSk7XG4gICAgICAgIC8vXG4gICAgICAgIGN1cnJNaW5lLnRsaXN0ID0gb2JqMmFycmF5KGN1cnJNaW5lLnRlbXBsYXRlcylcbiAgICAgICAgY3Vyck1pbmUudGxpc3Quc29ydChmdW5jdGlvbihhLGIpeyBcbiAgICAgICAgICAgIHJldHVybiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogYS50aXRsZSA+IGIudGl0bGUgPyAxIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJNaW5lLnRuYW1lcyA9IE9iamVjdC5rZXlzKCBjdXJyTWluZS50ZW1wbGF0ZXMgKTtcbiAgICAgICAgY3Vyck1pbmUudG5hbWVzLnNvcnQoKTtcbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgc2VsZWN0aW9uIGxpc3Qgb2YgdGVtcGxhdGVzIGZvciB0aGlzIG1pbmUuXG4gICAgICAgIHZhciB0bCA9IGQzLnNlbGVjdChcIiN0bGlzdCBzZWxlY3RcIilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YSggY3Vyck1pbmUudGxpc3QgKTtcbiAgICAgICAgdGwuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpXG4gICAgICAgIHRsLmV4aXQoKS5yZW1vdmUoKVxuICAgICAgICB0bC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7cmV0dXJuIGQudGl0bGU7fSk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIHN0YXJ0RWRpdCk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShjdXJyTWluZS50ZW1wbGF0ZXNbY3Vyck1pbmUudGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGN1cnJNaW5lLmNvbG9ycyB8fCBkZWZhdWx0Q29sb3JzO1xuICAgICAgICBsZXQgYmdjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci5tYWluIDogY2xycy5tYWluLmZnO1xuICAgICAgICBsZXQgdHhjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci50ZXh0IDogY2xycy5tYWluLmJnO1xuICAgICAgICBsZXQgbG9nbyA9IGN1cnJNaW5lLmltYWdlcy5sb2dvIHx8IGRlZmF1bHRMb2dvO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI21pbmVMb2dvXCIpXG4gICAgICAgICAgICAuYXR0cihcInNyY1wiLCBsb2dvKTtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibWluZW5hbWVcIl0nKVxuICAgICAgICAgICAgLnRleHQoY3Vyck1pbmUubmFtZSk7XG4gICAgICAgIC8vIHBvcHVsYXRlIGNsYXNzIGxpc3QgXG4gICAgICAgIGxldCBjbGlzdCA9IE9iamVjdC5rZXlzKGN1cnJNaW5lLm1vZGVsLmNsYXNzZXMpO1xuICAgICAgICBjbGlzdC5zb3J0KCk7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFwiI25ld3FjbGlzdCBzZWxlY3RcIiwgY2xpc3QpO1xuICAgICAgICBkMy5zZWxlY3QoJyNlZGl0U291cmNlU2VsZWN0b3IgW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnNlbGVjdGVkSW5kZXggPSAxOyB9KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNlbGVjdGVkRWRpdFNvdXJjZSh0aGlzLnZhbHVlKTsgc3RhcnRFZGl0KCk7IH0pO1xuICAgICAgICBzZWxlY3RlZEVkaXRTb3VyY2UoIFwidGxpc3RcIiApO1xuICAgICAgICBkMy5zZWxlY3QoXCIjeG1sdGV4dGFyZWFcIilbMF1bMF0udmFsdWUgPSBcIlwiO1xuICAgICAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpLnZhbHVlID0gXCJcIjtcblxuICAgIH0sIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgJHtjdXJyTWluZS5uYW1lfS4gU3RhdHVzPSR7ZXJyb3Iuc3RhdHVzfS4gRXJyb3I9JHtlcnJvci5zdGF0dXNUZXh0fS4gKElmIHRoZXJlIGlzIG5vIGVycm9yIG1lc3NhZ2UsIHRoZW4gaXRzIHByb2JhYmx5IGEgQ09SUyBpc3N1ZS4pYCk7XG4gICAgfSk7XG59XG5cbi8vXG5mdW5jdGlvbiBzdGFydEVkaXQoKSB7XG4gICAgLy8gc2VsZWN0b3IgZm9yIGNob29zaW5nIGVkaXQgaW5wdXQgc291cmNlLCBhbmQgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgbGV0IHNyY1NlbGVjdG9yID0gZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpO1xuICAgIGxldCBpbnB1dElkID0gc3JjU2VsZWN0b3JbMF1bMF0udmFsdWU7XG4gICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgbGV0IHNyYyA9IGQzLnNlbGVjdChgIyR7aW5wdXRJZH0gW25hbWU9XCJpblwiXWApO1xuICAgIC8vIHRoZSBxdWFyeSBzdGFydGluZyBwb2ludFxuICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICBpZiAoaW5wdXRJZCA9PT0gXCJ0bGlzdFwiKSB7XG4gICAgICAgIC8vIGEgc2F2ZWQgcXVlcnkgb3IgdGVtcGxhdGVcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1t2YWxdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAvLyBhIG5ldyBxdWVyeSBmcm9tIGEgc2VsZWN0ZWQgc3RhcnRpbmcgY2xhc3NcbiAgICAgICAgbGV0IG50ID0gbmV3IFRlbXBsYXRlKCk7XG4gICAgICAgIG50LnNlbGVjdC5wdXNoKHZhbCtcIi5pZFwiKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKG50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnR4bWxcIikge1xuICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0anNvblwiKSB7XG4gICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbn1cblxuLy8gXG5mdW5jdGlvbiBzZWxlY3RlZEVkaXRTb3VyY2Uoc2hvdyl7XG4gICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gb2JqZWN0LlxuLy8gVGhlIGxpc3QgaXMgc29ydGVkIGJ5IHRoZSBpdGVtIGtleXMuXG4vLyBJZiBuYW1lQXR0ciBpcyBzcGVjaWZpZWQsIHRoZSBpdGVtIGtleSBpcyBhbHNvIGFkZGVkIHRvIGVhY2ggZWxlbWVudFxuLy8gYXMgYW4gYXR0cmlidXRlIChvbmx5IHdvcmtzIGlmIHRob3NlIGl0ZW1zIGFyZSB0aGVtc2VsdmVzIG9iamVjdHMpLlxuLy8gRXhhbXBsZXM6XG4vLyAgICBzdGF0ZXMgPSB7J01FJzp7bmFtZTonTWFpbmUnfSwgJ0lBJzp7bmFtZTonSW93YSd9fVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnfSwge25hbWU6J01haW5lJ31dXG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzLCAnYWJicmV2JykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnLGFiYnJldidJQSd9LCB7bmFtZTonTWFpbmUnLGFiYnJldidNRSd9XVxuLy8gQXJnczpcbi8vICAgIG8gIChvYmplY3QpIFRoZSBvYmplY3QuXG4vLyAgICBuYW1lQXR0ciAoc3RyaW5nKSBJZiBzcGVjaWZpZWQsIGFkZHMgdGhlIGl0ZW0ga2V5IGFzIGFuIGF0dHJpYnV0ZSB0byBlYWNoIGxpc3QgZWxlbWVudC5cbi8vIFJldHVybjpcbi8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSBvXG5mdW5jdGlvbiBvYmoyYXJyYXkobywgbmFtZUF0dHIpe1xuICAgIHZhciBrcyA9IE9iamVjdC5rZXlzKG8pO1xuICAgIGtzLnNvcnQoKTtcbiAgICByZXR1cm4ga3MubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChuYW1lQXR0cikgb1trXS5uYW1lID0gaztcbiAgICAgICAgcmV0dXJuIG9ba107XG4gICAgfSk7XG59O1xuXG4vLyBBZGQgZGlyZWN0IGNyb3NzIHJlZmVyZW5jZXMgdG8gbmFtZWQgdHlwZXMuIChFLmcuLCB3aGVyZSB0aGVcbi8vIG1vZGVsIHNheXMgdGhhdCBHZW5lLmFsbGVsZXMgaXMgYSBjb2xsZWN0aW9uIHdob3NlIHJlZmVyZW5jZWRUeXBlXG4vLyBpcyB0aGUgc3RyaW5nIFwiQWxsZWxlXCIsIGFkZCBhIGRpcmVjdCByZWZlcmVuY2UgdG8gdGhlIEFsbGVsZSBjbGFzcylcbi8vIEFsc28gYWRkcyBhcnJheXMgZm9yIGNvbnZlbmllbmNlIGZvciBhY2Nlc3NpbmcgYWxsIGNsYXNzZXMgb3IgYWxsIGF0dHJpYnV0ZXMgb2YgYSBjbGFzcy5cbi8vXG5mdW5jdGlvbiBjb21waWxlTW9kZWwobW9kZWwpe1xuICAgIC8vIEZpcnN0IGFkZCBjbGFzc2VzIHRoYXQgcmVwcmVzZW50IHRoZSBiYXNpYyB0eXBlXG4gICAgTEVBRlRZUEVTLmZvckVhY2goZnVuY3Rpb24obil7XG4gICAgICAgIG1vZGVsLmNsYXNzZXNbbl0gPSB7XG4gICAgICAgICAgICBpc0xlYWZUeXBlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogbixcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBuLFxuICAgICAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgICAgICByZWZlcmVuY2VzOiBbXSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXSxcbiAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvL1xuICAgIG1vZGVsLmFsbENsYXNzZXMgPSBvYmoyYXJyYXkobW9kZWwuY2xhc3NlcylcbiAgICB2YXIgY25zID0gT2JqZWN0LmtleXMobW9kZWwuY2xhc3Nlcyk7XG4gICAgY25zLnNvcnQoKVxuICAgIGNucy5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgdmFyIGNscyA9IG1vZGVsLmNsYXNzZXNbY25dO1xuICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMgPSBvYmoyYXJyYXkoY2xzLnJlZmVyZW5jZXMpXG4gICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucyA9IG9iajJhcnJheShjbHMuY29sbGVjdGlvbnMpXG4gICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcInJlZmVyZW5jZVwiOyB9KTtcbiAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiY29sbGVjdGlvblwiOyB9KTtcbiAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgY2xzLmFsbFBhcnRzLnNvcnQoZnVuY3Rpb24oYSxiKXsgcmV0dXJuIGEubmFtZSA8IGIubmFtZSA/IC0xIDogYS5uYW1lID4gYi5uYW1lID8gMSA6IDA7IH0pO1xuICAgICAgICBtb2RlbC5hbGxDbGFzc2VzLnB1c2goY2xzKTtcbiAgICAgICAgLy9cbiAgICAgICAgY2xzW1wiZXh0ZW5kc1wiXSA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgdmFyIGJjID0gbW9kZWwuY2xhc3Nlc1tlXTtcbiAgICAgICAgICAgIGlmIChiYy5leHRlbmRlZEJ5KSB7XG4gICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeS5wdXNoKGNscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5ID0gW2Nsc107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmM7XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICBPYmplY3Qua2V5cyhjbHMucmVmZXJlbmNlcykuZm9yRWFjaChmdW5jdGlvbihybil7XG4gICAgICAgICAgICB2YXIgciA9IGNscy5yZWZlcmVuY2VzW3JuXTtcbiAgICAgICAgICAgIHIudHlwZSA9IG1vZGVsLmNsYXNzZXNbci5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIE9iamVjdC5rZXlzKGNscy5jb2xsZWN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgICAgICB2YXIgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICBjLnR5cGUgPSBtb2RlbC5jbGFzc2VzW2MucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBtb2RlbDtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdXBlcmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFxuLy8gVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1cGVyY2xhc3NlcyhjbHMpe1xuICAgIGlmICh0eXBlb2YoY2xzKSA9PT0gXCJzdHJpbmdcIiB8fCAhY2xzW1wiZXh0ZW5kc1wiXSB8fCBjbHNbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgdmFyIGFuYyA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1cGVyY2xhc3NlcyhzYyk7IH0pO1xuICAgIHZhciBhbGwgPSBjbHNbXCJleHRlbmRzXCJdLmNvbmNhdChhbmMucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdWJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3ViY2xhc3NlcyhjbHMpe1xuICAgIGlmICh0eXBlb2YoY2xzKSA9PT0gXCJzdHJpbmdcIiB8fCAhY2xzLmV4dGVuZGVkQnkgfHwgY2xzLmV4dGVuZGVkQnkubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgZGVzYyA9IGNscy5leHRlbmRlZEJ5Lm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdWJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNscy5leHRlbmRlZEJ5LmNvbmNhdChkZXNjLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgdmFyIGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgc3ViIGlzIGEgc3ViY2xhc3Mgb2Ygc3VwLlxuZnVuY3Rpb24gaXNTdWJjbGFzcyhzdWIsc3VwKSB7XG4gICAgaWYgKHN1YiA9PT0gc3VwKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodHlwZW9mKHN1YikgPT09IFwic3RyaW5nXCIgfHwgIXN1YltcImV4dGVuZHNcIl0gfHwgc3ViW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciByID0gc3ViW1wiZXh0ZW5kc1wiXS5maWx0ZXIoZnVuY3Rpb24oeCl7IHJldHVybiB4PT09c3VwIHx8IGlzU3ViY2xhc3MoeCwgc3VwKTsgfSk7XG4gICAgcmV0dXJuIHIubGVuZ3RoID4gMDtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gbGlzdCBpcyB2YWxpZCBhcyBhIGxpc3QgY29uc3RyYWludCBvcHRpb24gZm9yXG4vLyB0aGUgbm9kZSBuLiBBIGxpc3QgaXMgdmFsaWQgdG8gdXNlIGluIGEgbGlzdCBjb25zdHJhaW50IGF0IG5vZGUgbiBpZmZcbi8vICAgICAqIHRoZSBsaXN0J3MgdHlwZSBpcyBlcXVhbCB0byBvciBhIHN1YmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZVxuLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGEgc3VwZXJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGUuIEluIHRoaXMgY2FzZSxcbi8vICAgICAgIGVsZW1lbnRzIGluIHRoZSBsaXN0IHRoYXQgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIG5vZGUncyB0eXBlXG4vLyAgICAgICBhcmUgYXV0b21hdGljYWxseSBmaWx0ZXJlZCBvdXQuXG5mdW5jdGlvbiBpc1ZhbGlkTGlzdENvbnN0cmFpbnQobGlzdCwgbil7XG4gICAgdmFyIG50ID0gbi5zdWJ0eXBlQ29uc3RyYWludCB8fCBuLnB0eXBlO1xuICAgIGlmICh0eXBlb2YobnQpID09PSBcInN0cmluZ1wiICkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBsdCA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbbGlzdC50eXBlXTtcbiAgICByZXR1cm4gaXNTdWJjbGFzcyhsdCwgbnQpIHx8IGlzU3ViY2xhc3MobnQsIGx0KTtcbn1cblxuLy8gQ29tcGlsZXMgYSBcInJhd1wiIHRlbXBsYXRlIC0gc3VjaCBhcyBvbmUgcmV0dXJuZWQgYnkgdGhlIC90ZW1wbGF0ZXMgd2ViIHNlcnZpY2UgLSBhZ2FpbnN0XG4vLyBhIG1vZGVsLiBUaGUgbW9kZWwgc2hvdWxkIGhhdmUgYmVlbiBwcmV2aW91c2x5IGNvbXBpbGVkLlxuLy8gQXJnczpcbi8vICAgdGVtcGxhdGUgLSBhIHRlbXBsYXRlIHF1ZXJ5IGFzIGEganNvbiBvYmplY3Rcbi8vICAgbW9kZWwgLSB0aGUgbWluZSdzIG1vZGVsLCBhbHJlYWR5IGNvbXBpbGVkIChzZWUgY29tcGlsZU1vZGVsKS5cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgQ3JlYXRlcyBhIHRyZWUgb2YgcXVlcnkgbm9kZXMgKHN1aXRhYmxlIGZvciBkcmF3aW5nIGJ5IGQzLCBCVFcpLlxuLy8gICBBZGRzIHRoaXMgdHJlZSB0byB0aGUgdGVtcGxhdGUgb2JqZWN0IGFzIGF0dHJpYnV0ZSAncXRyZWUnLlxuLy8gICBUdXJucyBlYWNoIChzdHJpbmcpIHBhdGggaW50byBhIHJlZmVyZW5jZSB0byBhIHRyZWUgbm9kZSBjb3JyZXNwb25kaW5nIHRvIHRoYXQgcGF0aC5cbmZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgbW9kZWwpIHtcbiAgICB2YXIgcm9vdHMgPSBbXVxuICAgIHZhciB0ID0gdGVtcGxhdGU7XG4gICAgLy8gdGhlIHRyZWUgb2Ygbm9kZXMgcmVwcmVzZW50aW5nIHRoZSBjb21waWxlZCBxdWVyeSB3aWxsIGdvIGhlcmVcbiAgICB0LnF0cmVlID0gbnVsbDtcbiAgICAvLyBpbmRleCBvZiBjb2RlIHRvIGNvbnN0cmFpbnQgZ29ycyBoZXJlLlxuICAgIHQuY29kZTJjID0ge31cbiAgICAvLyBub3JtYWxpemUgdGhpbmdzIHRoYXQgbWF5IGJlIHVuZGVmaW5lZFxuICAgIHQuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgIHQuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgLy9cbiAgICB2YXIgc3ViY2xhc3NDcyA9IFtdO1xuICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICBpZiAoYy50eXBlKSB7XG4gICAgICAgICAgICBjLm9wID0gXCJJU0FcIlxuICAgICAgICAgICAgc3ViY2xhc3NDcy5wdXNoKGMpO1xuICAgICAgICB9XG4gICAgICAgIGMuY3R5cGUgPSBPUElOREVYW2Mub3BdLmN0eXBlO1xuICAgICAgICBpZiAoYy5jb2RlKSB0LmNvZGUyY1tjLmNvZGVdID0gYztcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgICAgIC8vIFdpdGggbnVsbC9ub3QtbnVsbCBjb25zdHJhaW50cywgSU0gaGFzIGEgd2VpcmQgcXVpcmsgb2YgZmlsbGluZyB0aGUgdmFsdWUgXG4gICAgICAgICAgICAvLyBmaWVsZCB3aXRoIHRoZSBvcGVyYXRvci4gRS5nLiwgZm9yIGFuIFwiSVMgTk9UIE5VTExcIiBvcHJlYXRvciwgdGhlIHZhbHVlIGZpZWxkIGlzXG4gICAgICAgICAgICAvLyBhbHNvIFwiSVMgTk9UIE5VTExcIi4gXG4gICAgICAgICAgICAvLyBcbiAgICAgICAgICAgIGMudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGRlYWwgd2l0aCBleHRyYVZhbHVlIGhlcmUgKD8pXG4gICAgICAgIH1cbiAgICB9KVxuICAgIC8vIG11c3QgcHJvY2VzcyBhbnkgc3ViY2xhc3MgY29uc3RyYWludHMgZmlyc3QsIGZyb20gc2hvcnRlc3QgdG8gbG9uZ2VzdCBwYXRoXG4gICAgc3ViY2xhc3NDc1xuICAgICAgICAuc29ydChmdW5jdGlvbihhLGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucGF0aC5sZW5ndGggLSBiLnBhdGgubGVuZ3RoO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgYy5wYXRoLCBtb2RlbCk7XG4gICAgICAgICAgICAgdmFyIGNscyA9IG1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIGMudHlwZTtcbiAgICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgfSk7XG4gICAgLy9cbiAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGMucGF0aCwgbW9kZWwpO1xuICAgICAgICBpZiAobi5jb25zdHJhaW50cylcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzID0gW2NdO1xuICAgIH0pXG5cbiAgICAvL1xuICAgIHQuc2VsZWN0ICYmIHQuc2VsZWN0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIHAsIG1vZGVsKTtcbiAgICAgICAgbi5zZWxlY3QoKTtcbiAgICB9KVxuICAgIHQuam9pbnMgJiYgdC5qb2lucy5mb3JFYWNoKGZ1bmN0aW9uKGope1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgaiwgbW9kZWwpO1xuICAgICAgICBuLmpvaW4gPSBcIm91dGVyXCI7XG4gICAgfSlcbiAgICB0Lm9yZGVyQnkgJiYgdC5vcmRlckJ5LmZvckVhY2goZnVuY3Rpb24obywgaSl7XG4gICAgICAgIHZhciBwID0gT2JqZWN0LmtleXMobylbMF1cbiAgICAgICAgdmFyIGRpciA9IG9bcF1cbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIHAsIG1vZGVsKTtcbiAgICAgICAgbi5zb3J0ID0geyBkaXI6IGRpciwgbGV2ZWw6IGkgfTtcbiAgICB9KTtcbiAgICBpZiAoIXQucXRyZWUpIHtcbiAgICAgICAgdGhyb3cgXCJObyBwYXRocyBpbiBxdWVyeS5cIlxuICAgIH1cbiAgICByZXR1cm4gdDtcbn1cblxuLy8gVHVybnMgYSBxdHJlZSBzdHJ1Y3R1cmUgYmFjayBpbnRvIGEgXCJyYXdcIiB0ZW1wbGF0ZS4gXG4vL1xuZnVuY3Rpb24gdW5jb21waWxlVGVtcGxhdGUodG1wbHQpe1xuICAgIHZhciB0ID0ge1xuICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICB0aXRsZTogdG1wbHQudGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0bXBsdC5kZXNjcmlwdGlvbixcbiAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgcmFuazogdG1wbHQucmFuayxcbiAgICAgICAgbW9kZWw6IGRlZXBjKHRtcGx0Lm1vZGVsKSxcbiAgICAgICAgdGFnczogZGVlcGModG1wbHQudGFncyksXG4gICAgICAgIHNlbGVjdCA6IFtdLFxuICAgICAgICB3aGVyZSA6IFtdLFxuICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICBjb25zdHJhaW50TG9naWM6IHRtcGx0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiLFxuICAgICAgICBvcmRlckJ5IDogW11cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVhY2gobil7XG4gICAgICAgIHZhciBwID0gbi5wYXRoXG4gICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHBhdGggc2hvdWxkIGFscmVhZHkgYmUgdGhlcmVcbiAgICAgICAgICAgIGlmICh0LnNlbGVjdC5pbmRleE9mKG4ucGF0aCkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgfVxuICAgICAgICAobi5jb25zdHJhaW50cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICB0LndoZXJlLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChuLmpvaW4gPT09IFwib3V0ZXJcIikge1xuICAgICAgICAgICAgdC5qb2lucy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgIGxldCBzID0ge31cbiAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyO1xuICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICB9XG4gICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZWFjaCk7XG4gICAgfVxuXG4gICAgcmVhY2godG1wbHQucXRyZWUpO1xuICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICByZXR1cm4gdFxufVxuXG4vL1xuY2xhc3MgTm9kZSB7XG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHRlbXBsYXRlIChUZW1wbGF0ZSBvYmplY3QpIHRoZSB0ZW1wbGF0ZSB0aGF0IG93bnMgdGhpcyBub2RlXG4gICAgLy8gICBwYXJlbnQgKG9iamVjdCkgUGFyZW50IG9mIHRoZSBuZXcgbm9kZS5cbiAgICAvLyAgIG5hbWUgKHN0cmluZykgTmFtZSBmb3IgdGhlIG5vZGVcbiAgICAvLyAgIHBjb21wIChvYmplY3QpIFBhdGggY29tcG9uZW50IGZvciB0aGUgcm9vdCwgdGhpcyBpcyBhIGNsYXNzLiBGb3Igb3RoZXIgbm9kZXMsIGFuIGF0dHJpYnV0ZSwgXG4gICAgLy8gICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24gZGVjcmlwdG9yLlxuICAgIC8vICAgcHR5cGUgKG9iamVjdCBvciBzdHJpbmcpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHNpbXBsZSBhdHRyaWJ1dGVzLCB0aGlzIGlzIGEgc3RyaW5nLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWwuIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnBhdGg7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy9cbiAgICBnZXQgcGF0aCAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoICtcIi5cIiA6IFwiXCIpICsgdGhpcy5uYW1lO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBub2RlVHlwZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCB8fCB0aGlzLnB0eXBlO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc0Jpb0VudGl0eSAoKSB7XG4gICAgICAgIGxldCBiZSA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbXCJCaW9FbnRpdHlcIl07XG4gICAgICAgIGxldCBudCA9IHRoaXMubm9kZVR5cGU7XG4gICAgICAgIHJldHVybiBpc1N1YmNsYXNzKG50LCBiZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyA+PSAwO1xuICAgIH1cbiAgICBzZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIHRoaXMudmlldyA9IGkgPj0gMCA/IGkgOiAodC5zZWxlY3QucHVzaChwKSAtIDEpO1xuICAgIH1cbiAgICB1bnNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHBhdGggZnJvbSB0aGUgc2VsZWN0IGxpc3RcbiAgICAgICAgICAgIHQuc2VsZWN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgLy8gRklYTUU6IHJlbnVtYmVyIG5vZGVzIGhlcmVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cbn1cblxuY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5tb2RlbCA9IHsgbmFtZTogXCJnZW5vbWljXCIgfTtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy50aXRsZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gW107XG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gXCJcIjtcbiAgICAgICAgdGhpcy50YWdzID0gW107XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IFtdO1xuICAgIH1cblxuICAgIGZpbmROb2RlIChwKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5xdHJlZTtcbiAgICAgICAgbGV0IHBhcnRzID0gcC5zcGxpdChcIi5cIik7XG4gICAgfVxufVxuXG5jbGFzcyBDb25zdHJhaW50IHtcbiAgICBjb25zdHJ1Y3RvciAobiwgdCkge1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0XG4gICAgICAgIHRoaXMuY3R5cGUgPSBuLnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIgPyBcInZhbHVlXCIgOiBcImxvb2t1cFwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gdGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiID8gXCI9XCIgOiBcIkxPT0tVUFwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy5jb2RlID0gbmV4dEF2YWlsYWJsZUNvZGUodCk7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gbi5wYXRoO1xuICAgICAgICAvLyB1c2VkIGJ5IHZhbHVlLCBsaXN0XG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgc3ViY2xhc3MgY29udHJhaW50c1xuICAgICAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgIH1cbn1cblxuLy8gQWRkcyBhIHBhdGggdG8gdGhlIGN1cnJlbnQgZGlhZ3JhbS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbi8vIEFyZ3M6XG4vLyAgIHRlbXBsYXRlIChvYmplY3QpIHRoZSB0ZW1wbGF0ZVxuLy8gICBwYXRoIChzdHJpbmcpIHRoZSBwYXRoIHRvIGFkZC4gXG4vLyAgIG1vZGVsIG9iamVjdCBDb21waWxlZCBkYXRhIG1vZGVsLlxuLy8gUmV0dXJuczpcbi8vICAgbGFzdCBwYXRoIGNvbXBvbmVudCBjcmVhdGVkLiBcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgQ3JlYXRlcyBuZXcgbm9kZXMgYXMgbmVlZGVkIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHF0cmVlLlxuZnVuY3Rpb24gYWRkUGF0aCh0ZW1wbGF0ZSwgcGF0aCwgbW9kZWwpe1xuICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgICB2YXIgY2xhc3NlcyA9IG1vZGVsLmNsYXNzZXM7XG4gICAgdmFyIGxhc3R0ID0gbnVsbFxuICAgIHZhciBuID0gdGVtcGxhdGUucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuXG4gICAgZnVuY3Rpb24gZmluZChsaXN0LCBuKXtcbiAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICB9XG5cbiAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocCwgaSl7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGUucXRyZWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWU7XG4gICAgICAgICAgICAgICAgaWYgKHAgIT09IG4ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3BdO1xuICAgICAgICAgICAgICAgIGlmICghY2xzKVxuICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWUgPSBuZXcgTm9kZSggdGVtcGxhdGUsIG51bGwsIHAsIGNscywgY2xzICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBuIGlzIHBvaW50aW5nIHRvIHRoZSBwYXJlbnQsIGFuZCBwIGlzIHRoZSBuZXh0IG5hbWUgaW4gdGhlIHBhdGguXG4gICAgICAgICAgICB2YXIgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgaWYgKG5uKSB7XG4gICAgICAgICAgICAgICAgLy8gcCBpcyBhbHJlYWR5IGEgY2hpbGRcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QsIGxvb2t1cCBwXG4gICAgICAgICAgICAgICAgdmFyIHg7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjbHMuYXR0cmlidXRlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0geC50eXBlIC8vIDwtLSBBIHN0cmluZyFcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdIC8vIDwtLVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgbWVtYmVyIG5hbWVkIFwiICsgcCArIFwiIGluIGNsYXNzIFwiICsgY2xzLm5hbWUgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlLCBhZGQgaXQgdG8gbidzIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgbm4gPSBuZXcgTm9kZSh0ZW1wbGF0ZSwgbiwgcCwgeCwgY2xzKTtcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gcmV0dXJuIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHBhdGhcbiAgICByZXR1cm4gbjtcbn1cblxuXG4vLyBBcmdzOlxuLy8gICBuIChub2RlKSBUaGUgbm9kZSBoYXZpbmcgdGhlIGNvbnN0cmFpbnQuXG4vLyAgIHNjTmFtZSAodHlwZSkgTmFtZSBvZiBzdWJjbGFzcy5cbmZ1bmN0aW9uIHNldFN1YmNsYXNzQ29uc3RyYWludChuLCBzY05hbWUpe1xuICAgIC8vIHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludFxuICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbiAoYyl7IHJldHVybiBjLmN0eXBlICE9PSBcInN1YmNsYXNzXCI7IH0pO1xuICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICBpZiAoc2NOYW1lKXtcbiAgICAgICAgbGV0IGNscyA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbc2NOYW1lXTtcbiAgICAgICAgaWYoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIHNjTmFtZTtcbiAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKHsgY3R5cGU6XCJzdWJjbGFzc1wiLCBvcDpcIklTQVwiLCBwYXRoOm4ucGF0aCwgdHlwZTpjbHMubmFtZSB9KTtcbiAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgdmFyIGNscyA9IG5vZGUuc3ViY2xhc3NDb25zdHJhaW50IHx8IG5vZGUucHR5cGU7XG4gICAgICAgIHZhciBjMiA9IFtdO1xuICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBpZihjLm5hbWUgaW4gY2xzLmF0dHJpYnV0ZXMgfHwgYy5uYW1lIGluIGNscy5yZWZlcmVuY2VzIHx8IGMubmFtZSBpbiBjbHMuY29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjMi5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChjKTtcbiAgICAgICAgfSlcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IGMyO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICB9XG4gICAgdmFyIHJlbW92ZWQgPSBjaGVjayhuLFtdKTtcbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKG4pO1xuICAgIGlmKHJlbW92ZWQubGVuZ3RoID4gMClcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ29uc3RyYWluaW5nIHRvIHN1YmNsYXNzIFwiICsgKHNjTmFtZSB8fCBuLnB0eXBlLm5hbWUpXG4gICAgICAgICAgICArIFwiIGNhdXNlZCB0aGUgZm9sbG93aW5nIHBhdGhzIHRvIGJlIHJlbW92ZWQ6IFwiIFxuICAgICAgICAgICAgKyByZW1vdmVkLm1hcChuID0+IG4ucGF0aCkuam9pbihcIiwgXCIpKTsgXG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbn1cblxuLy8gUmVtb3ZlcyB0aGUgY3VycmVudCBub2RlIGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuLy9cbmZ1bmN0aW9uIHJlbW92ZU5vZGUobikge1xuICAgIC8vIEZpcnN0LCByZW1vdmUgYWxsIGNvbnN0cmFpbnRzIG9uIG4gb3IgaXRzIGRlc2NlbmRhbnRzXG4gICAgZnVuY3Rpb24gcm1jICh4KSB7XG4gICAgICAgIHguY29uc3RyYWludHMuZm9yRWFjaChjID0+IHJlbW92ZUNvbnN0cmFpbnQoeCxjKSk7XG4gICAgICAgIHguY2hpbGRyZW4uZm9yRWFjaChybWMpO1xuICAgIH1cbiAgICBybWMobik7XG4gICAgLy8gTm93IHJlbW92ZSB0aGUgc3VidHJlZSBhdCBuLlxuICAgIHZhciBwID0gbi5wYXJlbnQ7XG4gICAgaWYgKHApIHtcbiAgICAgICAgcC5jaGlsZHJlbi5zcGxpY2UocC5jaGlsZHJlbi5pbmRleE9mKG4pLCAxKTtcbiAgICAgICAgaGlkZURpYWxvZygpO1xuICAgICAgICB1cGRhdGUocCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoaWRlRGlhbG9nKClcbiAgICB9XG4gICAgLy9cbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIHRlbXBsYXRlIGZyb20gdGhlIGxpc3QuXG4vLyBHZXRzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjdXJyZW50IG1pbmUgYW5kIGJ1aWxkcyBhIHNldCBvZiBub2Rlc1xuLy8gZm9yIGQzIHRyZWUgZGlzcGxheS5cbi8vXG5mdW5jdGlvbiBlZGl0VGVtcGxhdGUgKHQsIG5vc2F2ZSkge1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWRpdG9yIHdvcmtzIG9uIGEgY29weSBvZiB0aGUgdGVtcGxhdGUuXG4gICAgLy9cbiAgICBjdXJyVGVtcGxhdGUgPSBkZWVwYyh0KTtcbiAgICAvL1xuICAgIHJvb3QgPSBjb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlLCBjdXJyTWluZS5tb2RlbCkucXRyZWVcbiAgICByb290LngwID0gMDtcbiAgICByb290LnkwID0gaCAvIDI7XG5cbiAgICBpZiAoISBub3NhdmUpIHNhdmVTdGF0ZSgpO1xuXG4gICAgLy8gRmlsbCBpbiB0aGUgYmFzaWMgdGVtcGxhdGUgaW5mb3JtYXRpb24gKG5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbiwgZXRjLilcbiAgICAvL1xuICAgIHZhciB0aSA9IGQzLnNlbGVjdChcIiN0SW5mb1wiKTtcbiAgICB2YXIgeGZlciA9IGZ1bmN0aW9uKG5hbWUsIGVsdCl7IGN1cnJUZW1wbGF0ZVtuYW1lXSA9IGVsdC52YWx1ZTsgdXBkYXRlVHRleHQoKTsgfTtcbiAgICAvLyBOYW1lICh0aGUgaW50ZXJuYWwgdW5pcXVlIG5hbWUpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cIm5hbWVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS5uYW1lKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcIm5hbWVcIiwgdGhpcykgfSk7XG4gICAgLy8gVGl0bGUgKHdoYXQgdGhlIHVzZXIgc2VlcylcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwidGl0bGVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS50aXRsZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBEZXNjcmlwdGlvbiAod2hhdCBpdCBkb2VzIC0gYSBsaXR0bGUgZG9jdW1lbnRhdGlvbikuXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmRlc2NyaXB0aW9uKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImRlc2NyaXB0aW9uXCIsIHRoaXMpIH0pO1xuICAgIC8vIENvbW1lbnQgLSBmb3Igd2hhdGV2ZXIsIEkgZ3Vlc3MuIFxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJjb21tZW50XCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmNvbW1lbnQpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiY29tbWVudFwiLCB0aGlzKSB9KTtcblxuICAgIC8vIExvZ2ljIGV4cHJlc3Npb24gLSB3aGljaCB0aWVzIHRoZSBpbmRpdmlkdWFsIGNvbnN0cmFpbnRzIHRvZ2V0aGVyXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBzZXRMb2dpY0V4cHJlc3Npb24oY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYywgY3VyclRlbXBsYXRlKSB9KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBzZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSwgY3VyclRlbXBsYXRlKTtcbiAgICAgICAgICAgIHhmZXIoXCJjb25zdHJhaW50TG9naWNcIiwgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAvL1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICB1cGRhdGUocm9vdCk7XG59XG5cbi8vIFNldCB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4vLyBJbiB0aGUgcHJvY2VzcywgYWxzbyBcImNvcnJlY3RzXCIgdGhlIGV4cHJlc3Npb24gYXMgZm9sbG93czpcbi8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbi8vICAgICAgYW55IGNvbnN0cmFpbnQgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUgYXJlIHJlbW92ZWQgYW5kIHRoZVxuLy8gICAgICBleHByZXNzaW9uIGxvZ2ljIHVwZGF0ZWQgYWNjb3JkaW5nbHlcbi8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbi8vICAgICAgYXJlIEFORGVkIHRvIHRoZSBlbmQuXG4vLyBGb3IgZXhhbXBsZSwgaWYgdGhlIGN1cnJlbnQgdGVtcGxhdGUgaGFzIGNvZGVzIEEsIEIsIGFuZCBDLCBhbmRcbi8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4vLyBhZGRlZCwgcmVzdWx0aW5nIGluIFwiQSBhbmQgQiBhbmQgQ1wiLiBcbi8vIEFyZ3M6XG4vLyAgIGV4IChzdHJpbmcpIHRoZSBleHByZXNzaW9uXG4vLyAgIHRtcGx0IChvYmopIHRoZSB0ZW1wbGF0ZVxuLy8gUmV0dXJuczpcbi8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuLy8gICBcbmZ1bmN0aW9uIHNldExvZ2ljRXhwcmVzc2lvbihleCwgdG1wbHQpe1xuICAgIHZhciBhc3Q7IC8vIGFic3RyYWN0IHN5bnRheCB0cmVlXG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmdW5jdGlvbiByZWFjaChuLGxldil7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09IFwic3RyaW5nXCIgKXtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuIElmIG5vdCwgcmVtb3ZlIGl0IGZyb20gdGhlIGV4cHIuXG4gICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICByZXR1cm4gKG4gaW4gdG1wbHQuY29kZTJjID8gbiA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgIHZhciBjbXNzID0gY21zLmpvaW4oXCIgXCIrbi5vcCtcIiBcIik7XG4gICAgICAgIHJldHVybiBjbXMubGVuZ3RoID09PSAwID8gXCJcIiA6IGxldiA9PT0gMCB8fCBjbXMubGVuZ3RoID09PSAxID8gY21zcyA6IFwiKFwiICsgY21zcyArIFwiKVwiXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGFzdCA9IGV4ID8gcGFyc2VyLnBhcnNlKGV4KSA6IG51bGw7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgYWxlcnQoZXJyKTtcbiAgICAgICAgcmV0dXJuIHRtcGx0LmNvbnN0cmFpbnRMb2dpYztcbiAgICB9XG4gICAgLy9cbiAgICB2YXIgbGV4ID0gYXN0ID8gcmVhY2goYXN0LDApIDogXCJcIjtcbiAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAvLyBBTkQgdGhlbSBpbnRvIHRoZSBleHByZXNzaW9uIChleGNlcHQgSVNBIGNvbnN0cmFpbnRzKS5cbiAgICB2YXIgdG9BZGQgPSBPYmplY3Qua2V5cyh0bXBsdC5jb2RlMmMpLmZpbHRlcihmdW5jdGlvbihjKXtcbiAgICAgICAgcmV0dXJuIHNlZW4uaW5kZXhPZihjKSA9PT0gLTEgJiYgYy5vcCAhPT0gXCJJU0FcIjtcbiAgICAgICAgfSk7XG4gICAgaWYgKHRvQWRkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGlmKGFzdCAmJiBhc3Qub3AgJiYgYXN0Lm9wID09PSBcIm9yXCIpXG4gICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgIGlmIChsZXgpIHRvQWRkLnVuc2hpZnQobGV4KTtcbiAgICAgICAgIGxleCA9IHRvQWRkLmpvaW4oXCIgYW5kIFwiKTtcbiAgICB9XG4gICAgLy9cbiAgICB0bXBsdC5jb25zdHJhaW50TG9naWMgPSBsZXg7XG5cbiAgICBkMy5zZWxlY3QoJyN0SW5mbyBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBsZXg7IH0pO1xuXG4gICAgcmV0dXJuIGxleDtcbn1cblxuLy8gRXh0ZW5kcyB0aGUgcGF0aCBmcm9tIGN1cnJOb2RlIHRvIHBcbi8vIEFyZ3M6XG4vLyAgIGN1cnJOb2RlIChub2RlKSBOb2RlIHRvIGV4dGVuZCBmcm9tXG4vLyAgIG1vZGUgKHN0cmluZykgb25lIG9mIFwic2VsZWN0XCIsIFwiY29uc3RyYWluXCIgb3IgXCJvcGVuXCJcbi8vICAgcCAoc3RyaW5nKSBOYW1lIG9mIGFuIGF0dHJpYnV0ZSwgcmVmLCBvciBjb2xsZWN0aW9uXG4vLyBSZXR1cm5zOlxuLy8gICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIElmIHRoZSBzZWxlY3RlZCBpdGVtIGlzIG5vdCBhbHJlYWR5IGluIHRoZSBkaXNwbGF5LCBpdCBlbnRlcnNcbi8vICAgYXMgYSBuZXcgY2hpbGQgKGdyb3dpbmcgb3V0IGZyb20gdGhlIHBhcmVudCBub2RlLlxuLy8gICBUaGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkIG9uIHRoZSBjaGlsZCBub2RlLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK3NlbGVjdFwiIGJ1dHRvbiwgdGhlIGNoaWxkIGlzIHNlbGVjdGVkLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK2NvbnN0cmFpblwiIGJ1dHRvbiwgYSBuZXcgY29uc3RyYWludCBpcyBhZGRlZCB0byB0aGVcbi8vICAgY2hpbGQsIGFuZCB0aGUgY29uc3RyYWludCBlZGl0b3Igb3BlbmVkICBvbiB0aGF0IGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gc2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBtb2RlLCBwKXtcbiAgICBsZXQgbjtcbiAgICBsZXQgY2M7XG4gICAgbGV0IHNmcztcbiAgICBpZiAobW9kZSA9PT0gXCJzdW1tYXJ5ZmllbGRzXCIpIHtcbiAgICAgICAgc2ZzID0gY3Vyck1pbmUuc3VtbWFyeUZpZWxkc1tjdXJyTm9kZS5ub2RlVHlwZS5uYW1lXXx8W107XG4gICAgICAgIHNmcy5mb3JFYWNoKGZ1bmN0aW9uKHNmLCBpKXtcbiAgICAgICAgICAgIHNmID0gc2YucmVwbGFjZSgvXlteLl0rLywgY3Vyck5vZGUucGF0aCk7XG4gICAgICAgICAgICBsZXQgbSA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBzZiwgY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbS5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwID0gY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgbiA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBwLCBjdXJyTWluZS5tb2RlbCApO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJzZWxlY3RlZFwiKVxuICAgICAgICAgICAgIW4uaXNTZWxlY3RlZCAmJiBuLnNlbGVjdCgpO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJjb25zdHJhaW5lZFwiKSB7XG4gICAgICAgICAgICBjYyA9IGFkZENvbnN0cmFpbnQobiwgZmFsc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgaWYgKG1vZGUgIT09IFwib3BlblwiKVxuICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICBpZiAobW9kZSAhPT0gXCJzdW1tYXJ5ZmllbGRzXCIpIFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzaG93RGlhbG9nKG4pO1xuICAgICAgICAgICAgY2MgJiYgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVkaXRDb25zdHJhaW50KGNjLCBuKVxuICAgICAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgXG59XG4vLyBSZXR1cm5zIGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBhIGNvbnN0cmFpbnRcbi8vXG5mdW5jdGlvbiBjb25zdHJhaW50VGV4dChjKSB7XG4gICB2YXIgdCA9IFwiP1wiO1xuICAgaWYgKCFjKSByZXR1cm4gdDtcbiAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpe1xuICAgICAgIHQgPSBcIklTQSBcIiArIChjLnR5cGUgfHwgXCI/XCIpO1xuICAgfVxuICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgIH1cbiAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgICAgICBpZiAoYy5leHRyYVZhbHVlKSB0ID0gdCArIFwiIElOIFwiICsgYy5leHRyYVZhbHVlO1xuICAgfVxuICAgZWxzZSBpZiAoYy52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIChjLm9wLmluY2x1ZGVzKFwiTlVMTFwiKSA/IFwiXCIgOiBcIiBcIiArIGMudmFsdWUpXG4gICB9XG4gICBlbHNlIGlmIChjLnZhbHVlcyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZXNcbiAgIH1cbiAgIHJldHVybiAoYy5jb2RlID8gXCIoXCIrYy5jb2RlK1wiKSBcIiA6IFwiXCIpICsgdDtcbn1cblxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgdmFyIHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vXG5mdW5jdGlvbiBvcFZhbGlkRm9yKG9wLCBuKXtcbiAgICBpZighbi5wYXJlbnQgJiYgIW9wLnZhbGlkRm9yUm9vdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHR5cGVvZihuLnB0eXBlKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgaWYoISBvcC52YWxpZEZvckF0dHIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKG4ucHR5cGUpID09IC0xKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmKG4ucHR5cGUubmFtZSAmJiAhIG9wLnZhbGlkRm9yQ2xhc3MpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUNFaW5wdXRzKGMsIG9wKXtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKS50ZXh0KGMuY29kZSk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbn1cblxuLy8gQXJnczpcbi8vICAgc2VsZWN0b3IgKHN0cmluZykgRm9yIHNlbGVjdGluZyB0aGUgPHNlbGVjdD4gZWxlbWVudFxuLy8gICBkYXRhIChsaXN0KSBEYXRhIHRvIGJpbmQgdG8gb3B0aW9uc1xuLy8gICBjZmcgKG9iamVjdCkgQWRkaXRpb25hbCBvcHRpb25hbCBjb25maWdzOlxuLy8gICAgICAgdGl0bGUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIGZvciBzZXR0aW5nIHRoZSB0ZXh0IG9mIHRoZSBvcHRpb24uIFxuLy8gICAgICAgdmFsdWUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIHNldHRpbmcgdGhlIHZhbHVlIG9mIHRoZSBvcHRpb25cbi8vICAgICAgIHNlbGVjdGVkIC0gZnVuY3Rpb24gb3IgYXJyYXkgb3Igc3RyaW5nIGZvciBkZWNpZGluZyB3aGljaCBvcHRpb24ocykgYXJlIHNlbGVjdGVkXG4vLyAgICAgICAgICBJZiBmdW5jdGlvbiwgY2FsbGVkIGZvciBlYWNoIG9wdGlvbi5cbi8vICAgICAgICAgIElmIGFycmF5LCBzcGVjaWZpZXMgdGhlIHZhbHVlcyB0aGUgc2VsZWN0LlxuLy8gICAgICAgICAgSWYgc3RyaW5nLCBzcGVjaWZpZXMgd2hpY2ggdmFsdWUgaXMgc2VsZWN0ZWRcbi8vICAgICAgIGVtcHR5TWVzc2FnZSAtIGEgbWVzc2FnZSB0byBzaG93IGlmIHRoZSBkYXRhIGxpc3QgaXMgZW1wdHlcbi8vICAgICAgIG11bHRpcGxlIC0gaWYgdHJ1ZSwgbWFrZSBpdCBhIG11bHRpLXNlbGVjdCBsaXN0XG4vL1xuZnVuY3Rpb24gaW5pdE9wdGlvbkxpc3Qoc2VsZWN0b3IsIGRhdGEsIGNmZyl7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgdmFyIGlkZW50ID0gKHg9PngpO1xuICAgIHZhciBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy8gSW5pdGlhbGl6ZXMgdGhlIGlucHV0IGVsZW1lbnRzIGluIHRoZSBjb25zdHJhaW50IGVkaXRvciBmcm9tIHRoZSBnaXZlbiBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIGluaXRDRWlucHV0cyhuLCBjLCBjdHlwZSkge1xuXG4gICAgLy8gUG9wdWxhdGUgdGhlIG9wZXJhdG9yIHNlbGVjdCBsaXN0IHdpdGggb3BzIGFwcHJvcHJpYXRlIGZvciB0aGUgcGF0aFxuICAgIC8vIGF0IHRoaXMgbm9kZS5cbiAgICBpZiAoIWN0eXBlKSBcbiAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJvcFwiXScsIFxuICAgICAgICBPUFMuZmlsdGVyKGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wVmFsaWRGb3Iob3AsIG4pOyB9KSxcbiAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBkID0+IGQub3AsXG4gICAgICAgIHRpdGxlOiBkID0+IGQub3AsXG4gICAgICAgIHNlbGVjdGVkOmMub3BcbiAgICAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIGN0eXBlID0gY3R5cGUgfHwgYy5jdHlwZTtcblxuICAgIGxldCBjZSA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpO1xuICAgIGxldCBzbXpkID0gY2UuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG4gICAgY2UuYXR0cihcImNsYXNzXCIsIFwib3BlbiBcIiArIGN0eXBlKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgc216ZClcbiAgICAgICAgLmNsYXNzZWQoXCJiaW9lbnRpdHlcIiwgIG4uaXNCaW9FbnRpdHkpO1xuXG4gXG4gICAgLy9cbiAgICAvLyBzZXQvcmVtb3ZlIHRoZSBcIm11bHRpcGxlXCIgYXR0cmlidXRlIG9mIHRoZSBzZWxlY3QgZWxlbWVudCBhY2NvcmRpbmcgdG8gY3R5cGVcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLmF0dHIoXCJtdWx0aXBsZVwiLCBmdW5jdGlvbigpeyByZXR1cm4gY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiIHx8IG51bGw7IH0pO1xuXG4gICAgLy9cbiAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIFtcIkFueVwiXS5jb25jYXQoY3Vyck1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICApO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBvcHRpb24gbGlzdCBvZiBzdWJjbGFzcyBuYW1lc1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBuLnBhcmVudCA/IGdldFN1YmNsYXNzZXMobi5wY29tcC5raW5kID8gbi5wY29tcC50eXBlIDogbi5wY29tcCkgOiBbXSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBvbmUgd2hvc2UgbmFtZSBtYXRjaGVzIHRoZSBub2RlJ3MgdHlwZSBhbmQgc2V0IGl0cyBzZWxlY3RlZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBjdXJyTWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGlzVmFsaWRMaXN0Q29uc3RyYWludChsLCBjdXJyTm9kZSk7IH0pLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gbGlzdHMpXCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICAgICAgLy9sZXQgYWNzID0gZ2V0TG9jYWwoXCJhdXRvY29tcGxldGVcIiwgdHJ1ZSwgW10pO1xuICAgICAgICAvLyBkaXNhYmxlIHRoaXMgZm9yIG5vdy5cbiAgICAgICAgbGV0IGFjcyA9IFtdO1xuICAgICAgICBpZiAoYWNzLmluZGV4T2YoYXR0cikgIT09IC0xKVxuICAgICAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIlVucmVjb2duaXplZCBjdHlwZTogXCIgKyBjdHlwZVxuICAgIH1cbiAgICBcbn1cblxuLy8gT3BlbnMgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZvciBjb25zdHJhaW50IGMgb2Ygbm9kZSBuLlxuLy9cbmZ1bmN0aW9uIG9wZW5Db25zdHJhaW50RWRpdG9yKGMsIG4pe1xuXG4gICAgdmFyIGNjb3B5ID0gZGVlcGMoYyk7XG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIikuZGF0dW0oeyBjLCBjY29weSB9KVxuXG4gICAgLy8gTm90ZSBpZiB0aGlzIGlzIGhhcHBlbmluZyBhdCB0aGUgcm9vdCBub2RlXG4gICAgdmFyIGlzcm9vdCA9ICEgbi5wYXJlbnQ7XG4gXG4gICAgLy8gRmluZCB0aGUgZGl2IGZvciBjb25zdHJhaW50IGMgaW4gdGhlIGRpYWxvZyBsaXN0aW5nLiBXZSB3aWxsXG4gICAgLy8gb3BlbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb24gdG9wIG9mIGl0LlxuICAgIHZhciBjZGl2O1xuICAgIGQzLnNlbGVjdEFsbChcIiNkaWFsb2cgLmNvbnN0cmFpbnRcIilcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oY2MpeyBpZihjYyA9PT0gYykgY2RpdiA9IHRoaXM7IH0pO1xuICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgY29uc3RyYWludCdzIGNvbnRhaW5lciBkaXZcbiAgICB2YXIgY2JiID0gY2Rpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGFwcCdzIG1haW4gYm9keSBlbGVtZW50XG4gICAgdmFyIGRiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBwb3NpdGlvbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb3ZlciB0aGUgY29uc3RyYWludCBpbiB0aGUgZGlhbG9nXG4gICAgdmFyIGNlZCA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgYy5jdHlwZSlcbiAgICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIHRydWUpXG4gICAgICAgIC5zdHlsZShcInRvcFwiLCAoY2JiLnRvcCAtIGRiYi50b3ApK1wicHhcIilcbiAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoY2JiLmxlZnQgLSBkYmIubGVmdCkrXCJweFwiKVxuICAgICAgICA7XG5cbiAgICAvLyBJbml0IHRoZSBjb25zdHJhaW50IGNvZGUgXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAudGV4dChjLmNvZGUpO1xuXG4gICAgaW5pdENFaW5wdXRzKG4sIGMpO1xuXG4gICAgLy8gV2hlbiB1c2VyIHNlbGVjdHMgYW4gb3BlcmF0b3IsIGFkZCBhIGNsYXNzIHRvIHRoZSBjLmUuJ3MgY29udGFpbmVyXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgb3AgPSBPUElOREVYW3RoaXMudmFsdWVdO1xuICAgICAgICAgICAgaW5pdENFaW5wdXRzKG4sIGMsIG9wLmN0eXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgY2FuY2VsQ29uc3RyYWludEVkaXRvcihuLCBjKSB9KTtcblxuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc2F2ZVwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBzYXZlQ29uc3RyYWludEVkaXRzKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zeW5jXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKSB9KTtcblxufVxuLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbi8vIEFyZ3M6XG4vLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbi8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbi8vIE5COiBPbmx5IHZhbHVlIGFuZCBtdWx0aXZhdWUgY29uc3RyYWludHMgY2FuIGJlIHN1bW1hcml6ZWQgaW4gdGhpcyB3YXkuICBcbmZ1bmN0aW9uIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKXtcbiAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgIC8vIEJVVCBOT1RFLCB3ZSBoYXZlIHRvIHJ1biB0aGUgcXVlcnkgKndpdGhvdXQqIGNvbnN0cmFpbnQgYyEhXG4gICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgIC8vIHN5bmMgYnV0dG9uIHRvIGdldCBhIGxpc3QuIElmIHdlIHJ1biB0aGUgcXVlcnkgd2l0aCBjIGludGFjdCwgd2UnbGwgZ2V0IGEgbGlzdFxuICAgIC8vIGNvbnRhaW5pbnQgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAvLyBoZXJlIGlzIHRvIGVuc3VyZSBpdCBieSBhZGRpbmcgdGhlIHBhdGggdG8gdGhlIHZpZXcgbGlzdC5cblxuICAgIGxldCBjdmFscyA9IFtdO1xuICAgIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBjdmFscyA9IGMudmFsdWVzO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgY3ZhbHMgPSBbIGMudmFsdWUgXTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoaXMgY2hvaWNlIGluIGxvY2FsU3RvcmFnZVxuICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgIGxldCBrZXkgPSBcImF1dG9jb21wbGV0ZVwiO1xuICAgIGxldCBsc3Q7XG4gICAgbHN0ID0gZ2V0TG9jYWwoa2V5LCB0cnVlLCBbXSk7XG4gICAgaWYobHN0LmluZGV4T2YoYXR0cikgPT09IC0xKSBsc3QucHVzaChhdHRyKTtcbiAgICBzZXRMb2NhbChrZXksIGxzdCwgdHJ1ZSk7XG5cbiAgICBjbGVhckxvY2FsKCk7XG5cbiAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgIC8vXG4gICAgbGV0IGxleCA9IGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWM7IC8vIHNhdmUgY29uc3RyYWludCBsb2dpYyBleHByXG4gICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCBmYWxzZSk7IC8vIHRlbXBvcmFyaWx5IHJlbW92ZSB0aGUgY29uc3RyYWludFxuICAgIGxldCBqID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgICBqLnNlbGVjdC5wdXNoKHApOyAvLyBtYWtlIHN1cmUgcCBpcyBwYXJ0IG9mIHRoZSBxdWVyeVxuICAgIGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgPSBsZXg7IC8vIHJlc3RvcmUgdGhlIGxvZ2ljIGV4cHJcbiAgICBhZGRDb25zdHJhaW50KG4sIGZhbHNlLCBjKTsgLy8gcmUtYWRkIHRoZSBjb25zdHJhaW50XG5cbiAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgbGV0IHggPSBqc29uMnhtbChqLCB0cnVlKTtcbiAgICBsZXQgZSA9IGVuY29kZVVSSUNvbXBvbmVudCh4KTtcbiAgICBsZXQgdXJsID0gYCR7Y3Vyck1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICBsZXQgdGhyZXNob2xkID0gMjUwO1xuXG4gICAgLy8gc2lnbmFsIHRoYXQgd2UncmUgc3RhcnRpbmdcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgIC8vIGdvIVxuICAgIGQzanNvblByb21pc2UodXJsKS50aGVuKGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAvLyBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgaW4ganNvbi5yZXVsdHMuXG4gICAgICAgIC8vIEVhY2ggbGlzdCBpdGVtIGxvb2tzIGxpa2U6IHsgaXRlbTogXCJzb21lc3RyaW5nXCIsIGNvdW50OiAxNyB9XG4gICAgICAgIC8vIChZZXMsIHdlIGdldCBjb3VudHMgZm9yIGZyZWUhIE91Z2h0IHRvIG1ha2UgdXNlIG9mIHRoaXMuKVxuICAgICAgICAvL1xuICAgICAgICBsZXQgcmVzID0ganNvbi5yZXN1bHRzLm1hcChyID0+IHIuaXRlbSkuc29ydCgpO1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgbGV0IGFucyA9IHByb21wdChgVGhlcmUgYXJlICR7cmVzLmxlbmd0aH0gcmVzdWx0cywgd2hpY2ggZXhjZWVkcyB0aGUgdGhyZXNob2xkIG9mICR7dGhyZXNob2xkfS4gSG93IG1hbnkgZG8geW91IHdhbnQgdG8gc2hvdz9gLCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgIGlmIChpc05hTihhbnMpIHx8IGFucyA8PSAwKSByZXR1cm47XG4gICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJylcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCB0cnVlKTtcbiAgICAgICAgbGV0IG9wdHMgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YShyZXMpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgZCA9PiBkKVxuICAgICAgICAgICAgLnRleHQoIGQgPT4gZCApXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIG51bGwpXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY3ZhbHMuaW5kZXhPZihkKSAhPT0gLTEgfHwgbnVsbCk7XG4gICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICB9KVxufVxuLy9cbmZ1bmN0aW9uIGNhbmNlbENvbnN0cmFpbnRFZGl0b3IobiwgYyl7XG4gICAgaWYgKCEgYy5zYXZlZCkge1xuICAgICAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIHRydWUpO1xuICAgIH1cbiAgICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xufVxuZnVuY3Rpb24gaGlkZUNvbnN0cmFpbnRFZGl0b3IoKXtcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5jbGFzc2VkKFwib3BlblwiLCBudWxsKTtcbn1cbi8vXG5mdW5jdGlvbiBlZGl0Q29uc3RyYWludChjLCBuKXtcbiAgICBvcGVuQ29uc3RyYWludEVkaXRvcihjLCBuKTtcbn1cbi8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbi8vIHVzZWQgaW4gdGhlIGdpdmVuIHRlbXBsYXRlLlxuLy9cbmZ1bmN0aW9uIG5leHRBdmFpbGFibGVDb2RlKHRtcGx0KXtcbiAgICBmb3IodmFyIGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICBpZiAoISAoYyBpbiB0bXBsdC5jb2RlMmMpKVxuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG4vLyBBZGRzIGEgbmV3IGNvbnN0cmFpbnQgdG8gYSBub2RlIGFuZCByZXR1cm5zIGl0LlxuLy8gQXJnczpcbi8vICAgbiAobm9kZSkgVGhlIG5vZGUgdG8gYWRkIHRoZSBjb25zdHJhaW50IHRvLiBSZXF1aXJlZC5cbi8vICAgdXBkYXRlVUkgKGJvb2xlYW4pIElmIHRydWUsIHVwZGF0ZSB0aGUgZGlzcGxheS4gSWYgZmFsc2Ugb3Igbm90IHNwZWNpZmllZCwgbm8gdXBkYXRlLlxuLy8gICBjIChjb25zdHJhaW50KSBJZiBnaXZlbiwgdXNlIHRoYXQgY29uc3RyYWludC4gT3RoZXJ3aXNlIGF1dG9nZW5lcmF0ZS5cbi8vIFJldHVybnM6XG4vLyAgIFRoZSBuZXcgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBhZGRDb25zdHJhaW50KG4sIHVwZGF0ZVVJLCBjKSB7XG4gICAgaWYgKCFjKSB7XG4gICAgICAgIGMgPSBuZXcgQ29uc3RyYWludChuLGN1cnJUZW1wbGF0ZSk7XG4gICAgfVxuICAgIG4uY29uc3RyYWludHMucHVzaChjKTtcbiAgICBjdXJyVGVtcGxhdGUud2hlcmUucHVzaChjKTtcbiAgICBjdXJyVGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgfVxuICAgIC8vXG4gICAgcmV0dXJuIGM7XG59XG5cbi8vXG5mdW5jdGlvbiByZW1vdmVDb25zdHJhaW50KG4sIGMsIHVwZGF0ZVVJKXtcbiAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGN1cnJUZW1wbGF0ZS53aGVyZSA9IGN1cnJUZW1wbGF0ZS53aGVyZS5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGRlbGV0ZSBjdXJyVGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG4vL1xuZnVuY3Rpb24gc2F2ZUNvbnN0cmFpbnRFZGl0cyhuLCBjKXtcbiAgICAvL1xuICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgYy5vcCA9IG87XG4gICAgYy5jdHlwZSA9IE9QSU5ERVhbb10uY3R5cGU7XG4gICAgYy5zYXZlZCA9IHRydWU7XG4gICAgLy9cbiAgICBsZXQgdmFsID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWU7XG4gICAgbGV0IHZhbHMgPSBbXTtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkgdmFscy5wdXNoKHRoaXMudmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgIGxldCB6ID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvcicpLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuXG4gICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIGMudHlwZSA9IHZhbHNbMF1cbiAgICAgICAgYy52YWx1ZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgc2V0U3ViY2xhc3NDb25zdHJhaW50KG4sIGMudHlwZSlcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICBjLnZhbHVlID0gdmFsO1xuICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIGMuZXh0cmFWYWx1ZSA9IHZhbHNbMF0gPT09IFwiQW55XCIgPyBudWxsIDogdmFsc1swXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHZhbHNbMF07XG4gICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBjLnZhbHVlID0geiA/IHZhbHNbMF0gOiB2YWw7XG4gICAgICAgIGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiVW5rbm93biBjdHlwZTogXCIrYy5jdHlwZTtcbiAgICB9XG4gICAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiAgICB1cGRhdGUobik7XG4gICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gT3BlbnMgYSBkaWFsb2cgb24gdGhlIHNwZWNpZmllZCBub2RlLlxuLy8gQWxzbyBtYWtlcyB0aGF0IG5vZGUgdGhlIGN1cnJlbnQgbm9kZS5cbi8vIEFyZ3M6XG4vLyAgIG4gICAgdGhlIG5vZGVcbi8vICAgZWx0ICB0aGUgRE9NIGVsZW1lbnQgKGUuZy4gYSBjaXJjbGUpXG4vLyBSZXR1cm5zXG4vLyAgIHN0cmluZ1xuLy8gU2lkZSBlZmZlY3Q6XG4vLyAgIHNldHMgZ2xvYmFsIGN1cnJOb2RlXG4vL1xuZnVuY3Rpb24gc2hvd0RpYWxvZyhuLCBlbHQsIHJlZnJlc2hPbmx5KXtcbiAgaWYgKCFlbHQpIGVsdCA9IGZpbmREb21CeURhdGFPYmoobik7XG4gIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG4gXG4gIC8vIFNldCB0aGUgZ2xvYmFsIGN1cnJOb2RlXG4gIGN1cnJOb2RlID0gbjtcbiAgdmFyIGlzcm9vdCA9ICEgY3Vyck5vZGUucGFyZW50O1xuICAvLyBNYWtlIG5vZGUgdGhlIGRhdGEgb2JqIGZvciB0aGUgZGlhbG9nXG4gIHZhciBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpLmRhdHVtKG4pO1xuICAvLyBDYWxjdWxhdGUgZGlhbG9nJ3MgcG9zaXRpb25cbiAgdmFyIGRiYiA9IGRpYWxvZ1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGViYiA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGJiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHQgPSAoZWJiLnRvcCAtIGJiYi50b3ApICsgZWJiLndpZHRoLzI7XG4gIHZhciBiID0gKGJiYi5ib3R0b20gLSBlYmIuYm90dG9tKSArIGViYi53aWR0aC8yO1xuICB2YXIgbCA9IChlYmIubGVmdCAtIGJiYi5sZWZ0KSArIGViYi5oZWlnaHQvMjtcbiAgdmFyIGRpciA9IFwiZFwiIDsgLy8gXCJkXCIgb3IgXCJ1XCJcbiAgLy8gTkI6IGNhbid0IGdldCBvcGVuaW5nIHVwIHRvIHdvcmssIHNvIGhhcmQgd2lyZSBpdCB0byBkb3duLiA6LVxcXG5cbiAgLy9cbiAgZGlhbG9nXG4gICAgICAuc3R5bGUoXCJsZWZ0XCIsIGwrXCJweFwiKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsIHJlZnJlc2hPbmx5P1wic2NhbGUoMSlcIjpcInNjYWxlKDFlLTYpXCIpXG4gICAgICAuY2xhc3NlZChcImhpZGRlblwiLCBmYWxzZSlcbiAgICAgIC5jbGFzc2VkKFwiaXNyb290XCIsIGlzcm9vdClcbiAgICAgIDtcbiAgaWYgKGRpciA9PT0gXCJkXCIpXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgdCtcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDAlXCIpIDtcbiAgZWxzZVxuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwidG9wXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIGIrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAxMDAlXCIpIDtcblxuICAvLyBTZXQgdGhlIGRpYWxvZyB0aXRsZSB0byBub2RlIG5hbWVcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJkaWFsb2dUaXRsZVwiXSBzcGFuJylcbiAgICAgIC50ZXh0KG4ubmFtZSk7XG4gIC8vIFNob3cgdGhlIGZ1bGwgcGF0aFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImZ1bGxQYXRoXCJdIGRpdicpXG4gICAgICAudGV4dChuLnBhdGgpO1xuICAvLyBUeXBlIGF0IHRoaXMgbm9kZVxuICB2YXIgdHAgPSBuLnB0eXBlLm5hbWUgfHwgbi5wdHlwZTtcbiAgdmFyIHN0cCA9IChuLnN1YmNsYXNzQ29uc3RyYWludCAmJiBuLnN1YmNsYXNzQ29uc3RyYWludC5uYW1lKSB8fCBudWxsO1xuICB2YXIgdHN0cmluZyA9IHN0cCAmJiBgPHNwYW4gc3R5bGU9XCJjb2xvcjogcHVycGxlO1wiPiR7c3RwfTwvc3Bhbj4gKCR7dHB9KWAgfHwgdHBcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJ0eXBlXCJdIGRpdicpXG4gICAgICAuaHRtbCh0c3RyaW5nKTtcblxuICAvLyBXaXJlIHVwIGFkZCBjb25zdHJhaW50IGJ1dHRvblxuICBkaWFsb2cuc2VsZWN0KFwiI2RpYWxvZyAuY29uc3RyYWludFNlY3Rpb24gLmFkZC1idXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgYWRkQ29uc3RyYWludChuLCB0cnVlKTsgfSk7XG5cbiAgLy8gRmlsbCBvdXQgdGhlIGNvbnN0cmFpbnRzIHNlY3Rpb24uIEZpcnN0LCBzZWxlY3QgYWxsIGNvbnN0cmFpbnRzLlxuICB2YXIgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEobi5jb25zdHJhaW50cyk7XG4gIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gIC8vIDEuIGNvbnRhaW5lclxuICB2YXIgY2RpdnMgPSBjb25zdHJzLmVudGVyKCkuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLFwiY29uc3RyYWludFwiKSA7XG4gIC8vIDIuIG9wZXJhdG9yXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgLy8gMy4gdmFsdWVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwiY29kZVwiKSA7XG4gIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKTtcbiAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBjYW5jZWxcIikudGV4dChcImRlbGV0ZV9mb3JldmVyXCIpO1xuXG4gIC8vIFJlbW92ZSBleGl0aW5nXG4gIGNvbnN0cnMuZXhpdCgpLnJlbW92ZSgpIDtcblxuICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICBjb25zdHJzXG4gICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGMpIHsgcmV0dXJuIFwiY29uc3RyYWludCBcIiArIGMuY3R5cGU7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwib3BcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXtcbiAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSArIChjLmV4dHJhVmFsdWUgPyBcIiBpbiBcIiArIGMuZXh0cmFWYWx1ZSA6IFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlIHx8IChjLnZhbHVlcyAmJiBjLnZhbHVlcy5qb2luKFwiLFwiKSkgfHwgYy50eXBlO1xuICAgICAgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmNhbmNlbFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdHJ1ZSk7XG4gICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICB9KVxuXG5cbiAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgLy9cbiAgdmFyIHQgPSBuLnBjb21wLnR5cGU7XG4gIGlmICh0eXBlb2YodCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLHRydWUpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KFwiLnNlbGVjdC1jdHJsXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZCB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIERpYWxvZyBmb3IgY2xhc3Nlc1xuICAgICAgZGlhbG9nXG4gICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIixmYWxzZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlID8gbi5wY29tcC50eXBlLm5hbWUgOiBuLnBjb21wLm5hbWUpO1xuXG4gICAgICAvLyB3aXJlIHVwIHRoZSBidXR0b24gdG8gc2hvdyBzdW1tYXJ5IGZpZWxkc1xuICAgICAgZGlhbG9nLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNob3dTdW1tYXJ5XCJdJylcbiAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwic3VtbWFyeWZpZWxkc1wiKSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIHRhYmxlIGxpc3RpbmcgYWxsIHRoZSBhdHRyaWJ1dGVzL3JlZnMvY29sbGVjdGlvbnMuXG4gICAgICB2YXIgdGJsID0gZGlhbG9nLnNlbGVjdChcInRhYmxlLmF0dHJpYnV0ZXNcIik7XG4gICAgICB2YXIgcm93cyA9IHRibC5zZWxlY3RBbGwoXCJ0clwiKVxuICAgICAgICAgIC5kYXRhKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5hbGxQYXJ0cylcbiAgICAgICAgICA7XG4gICAgICByb3dzLmVudGVyKCkuYXBwZW5kKFwidHJcIik7XG4gICAgICByb3dzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIHZhciBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YShmdW5jdGlvbihjb21wKSB7XG4gICAgICAgICAgICAgIGlmIChjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJTZWxlY3QgdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdzZWxlY3RzaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzZWxlY3RlZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJDb25zdHJhaW4gdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdjb25zdHJhaW5zaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJjb25zdHJhaW5lZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJGb2xsb3cgdGhpcyAke2NvbXAua2luZH1cIj5wbGF5X2Fycm93PC9pPmAsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdvcGVubmV4dCcsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcIm9wZW5cIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIDtcbiAgICAgIGNlbGxzLmVudGVyKCkuYXBwZW5kKFwidGRcIik7XG4gICAgICBjZWxsc1xuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuY2xzO30pXG4gICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5jbGljayAmJiBkLmNsaWNrKCk7IH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZXhpdCgpLnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIEhpZGVzIHRoZSBkaWFsb2cuIFNldHMgdGhlIGN1cnJlbnQgbm9kZSB0byBudWxsLlxuLy8gQXJnczpcbi8vICAgbm9uZVxuLy8gUmV0dXJuc1xuLy8gIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICBIaWRlcyB0aGUgZGlhbG9nLlxuLy8gIFNldHMgY3Vyck5vZGUgdG8gbnVsbC5cbi8vXG5mdW5jdGlvbiBoaWRlRGlhbG9nKCl7XG4gIGN1cnJOb2RlID0gbnVsbDtcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIHRydWUpXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24vMilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMWUtNilcIilcbiAgICAgIDtcbiAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgIC5jbGFzc2VkKFwib3BlblwiLCBudWxsKVxuICAgICAgO1xufVxuXG5mdW5jdGlvbiBzZXRMYXlvdXQoc3R5bGUpe1xuICAgIGxheW91dFN0eWxlID0gc3R5bGU7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG5mdW5jdGlvbiBkb0xheW91dChyb290KXtcbiAgdmFyIGxheW91dDtcbiAgbGV0IGxlYXZlcyA9IFtdO1xuICBcbiAgaWYgKGxheW91dFN0eWxlID09PSBcInRyZWVcIikge1xuICAgICAgLy8gZDMgbGF5b3V0IGFycmFuZ2VzIG5vZGVzIHRvcC10by1ib3R0b20sIGJ1dCB3ZSB3YW50IGxlZnQtdG8tcmlnaHQuXG4gICAgICAvLyBTby4uLnJldmVyc2Ugd2lkdGggYW5kIGhlaWdodCwgYW5kIGRvIHRoZSBsYXlvdXQuIFRoZW4sIHJldmVyc2UgdGhlIHgseSBjb29yZHMgaW4gdGhlIHJlc3VsdHMuXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQudHJlZSgpLnNpemUoW2gsIHddKTtcbiAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgLy8gUmV2ZXJzZSB4IGFuZCB5LiBBbHNvLCBub3JtYWxpemUgeCBmb3IgZml4ZWQtZGVwdGguXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDtcbiAgICAgICAgICBkLnggPSBkLmRlcHRoICogMTgwO1xuICAgICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgICAvLyBkZW5kcm9ncmFtXG4gICAgICAvLyBFeHBlcmltZW50aW5nIHdpdGggcmVhcnJhbmdpbmcgbGVhdmVzLiBSb3VnaCBjb2RlIGFoZWFkLi4uXG5cbiAgICAgIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgbGVhdmVzLnB1c2gobik7XG4gICAgICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gICAgICB9O1xuICAgICAgbGV0IG1heGQgPSBtZChyb290KTsgLy8gbWF4IGRlcHRoLCAxLWJhc2VkXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQuY2x1c3RlcigpXG4gICAgICAgICAgLnNlcGFyYXRpb24oKGEsYikgPT4gMSlcbiAgICAgICAgICAuc2l6ZShbaCwgbWF4ZCAqIDE4MF0pO1xuICAgICAgLy8gQ29tcHV0ZSB0aGUgbmV3IGxheW91dCwgYW5kIHNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgbm9kZXMuZm9yRWFjaCggZCA9PiB7IGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wOyB9KTtcblxuICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuIFxuICAgICAgLy8gTk9URSB0aGF0IHggYW5kIHkgYXJlIHJldmVyc2VkIGF0IHRoaXMgcG9pbnRcbiAgICAgIGxldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB5OiBuLnksIHkwOiBuLnkwIH07IH0pO1xuICAgICAgLy8gc29ydCB0aGUgbGVhZiBhcnJheSBieSBuYW1lXG4gICAgICBsZWF2ZXMuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgICBsZXQgbmEgPSBhLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBsZXQgbmIgPSBiLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICByZXR1cm4gbmEgPCBuYiA/IC0xIDogbmEgPiBuYiA/IDEgOiAwO1xuICAgICAgfSk7XG4gICAgICAvLyByZWFzc2lnbiB0aGUgWSBwb3NpdGlvbnNcbiAgICAgIGxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgICAgIG4ueSA9IHBvc1tpXS55O1xuICAgICAgICAgIG4ueTAgPSBwb3NbaV0ueTA7XG4gICAgICB9KTtcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIGxlYXZlcyBoYXZlIGJlZW4gcmVhcnJhbmdlZCwgYnV0IHRoZSBpbnRlcmlvciBub2RlcyBoYXZlbid0LlxuICAgICAgLy8gSGVyIHdlIG1vdmUgaW50ZXJpb3Igbm9kZXMgdG93YXJkIHRoZWlyIFwiY2VudGVyIG9mIGdyYXZpdHlcIiBhcyBkZWZpbmVkXG4gICAgICAvLyBieSB0aGUgcG9zaXRpb25zIG9mIHRoZWlyIGNoaWxkcmVuLiBBcHBseSB0aGlzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgICAgLy8gXG4gICAgICAvLyBOT1RFIHRoYXQgeCBhbmQgeSBjb29yZGluYXRlcyBhcmUgb3Bwb3NpdGUgYXQgdGhpcyBwb2ludCFcbiAgICAgIC8vXG4gICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBvY2N1cGllZCBwb3NpdGlvbnM6XG4gICAgICBsZXQgb2NjdXBpZWQgPSB7fSA7ICAvLyBvY2N1cGllZFt4IHBvc2l0aW9uXSA9PSBbbGlzdCBvZiBub2Rlc11cbiAgICAgIGZ1bmN0aW9uIGNvZyAobikge1xuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgLy8gY29tcHV0ZSBteSBjLm8uZy4gYXMgdGhlIGF2ZXJhZ2Ugb2YgbXkga2lkcycgcG9zaXRpb25zXG4gICAgICAgICAgICAgIGxldCBteUNvZyA9IChuLmNoaWxkcmVuLm1hcChjb2cpLnJlZHVjZSgodCxjKSA9PiB0K2MsIDApKS9uLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICAgICAgaWYobi5wYXJlbnQpIG4ueSA9IG15Q29nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgZGQgPSBvY2N1cGllZFtuLnldID0gKG9jY3VwaWVkW24ueV0gfHwgW10pO1xuICAgICAgICAgIGRkLnB1c2gobi55KTtcbiAgICAgICAgICByZXR1cm4gbi55O1xuICAgICAgfVxuICAgICAgY29nKHJvb3QpO1xuXG4gICAgICAvLyBUT0RPOiBGaW5hbCBhZGp1c3RtZW50c1xuICAgICAgLy8gMS4gSWYgd2UgZXh0ZW5kIG9mZiB0aGUgcmlnaHQgZWRnZSwgY29tcHJlc3MuXG4gICAgICAvLyAyLiBJZiBpdGVtcyBhdCBzYW1lIHggb3ZlcmxhcCwgc3ByZWFkIHRoZW0gb3V0IGluIHkuXG4gIH1cblxuICAvLyBzYXZlIGxpbmtzIGluIGdsb2JhbFxuICBsaW5rcyA9IGxheW91dC5saW5rcyhub2Rlcyk7XG5cbiAgcmV0dXJuIFtub2RlcywgbGlua3NdXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB1cGRhdGUobikgXG4vLyBUaGUgbWFpbiBkcmF3aW5nIHJvdXRpbmUuIFxuLy8gVXBkYXRlcyB0aGUgU1ZHLCB1c2luZyBuIGFzIHRoZSBzb3VyY2Ugb2YgYW55IGVudGVyaW5nL2V4aXRpbmcgYW5pbWF0aW9ucy5cbi8vXG5mdW5jdGlvbiB1cGRhdGUoc291cmNlKSB7XG4gIC8vXG4gIGRvTGF5b3V0KHJvb3QpO1xuICB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKTtcbiAgdXBkYXRlTGlua3MobGlua3MsIHNvdXJjZSk7XG4gIHVwZGF0ZVR0ZXh0KCk7XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKXtcbiAgbGV0IG5vZGVHcnBzID0gdmlzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAuZGF0YShub2RlcywgZnVuY3Rpb24obikgeyByZXR1cm4gbi5pZCB8fCAobi5pZCA9ICsraSk7IH0pXG4gICAgICA7XG5cbiAgLy8gQ3JlYXRlIG5ldyBub2RlcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBub2RlRW50ZXIgPSBub2RlR3Jwcy5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlZ3JvdXBcIilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLngwICsgXCIsXCIgKyBzb3VyY2UueTAgKyBcIilcIjsgfSlcbiAgICAgIDtcblxuICAvLyBBZGQgZ2x5cGggZm9yIHRoZSBub2RlXG4gIC8vbm9kZUVudGVyLmFwcGVuZChcInN2ZzpjaXJjbGVcIilcbiAgbm9kZUVudGVyLmFwcGVuZChmdW5jdGlvbihkKXtcbiAgICAgIHZhciBzaGFwZSA9IChkLnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIiA/IFwicmVjdFwiIDogXCJjaXJjbGVcIik7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgc2hhcGUpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBpZiAoY3Vyck5vZGUgIT09IGQpIHNob3dEaWFsb2coZCwgdGhpcyk7XG4gICAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9KTtcbiAgbm9kZUVudGVyLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcbiAgbm9kZUVudGVyLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieFwiLCAtOC41KVxuICAgICAgLmF0dHIoXCJ5XCIsIC04LjUpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcblxuICAvLyBBZGQgdGV4dCBmb3Igbm9kZSBuYW1lXG4gIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuY2hpbGRyZW4gfHwgZC5fY2hpbGRyZW4gPyAtMTAgOiAxMDsgfSlcbiAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxuICAgICAgLnRleHQoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5uYW1lOyB9KVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBuZWFybHkgdHJhbnNwYXJlbnRcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVOYW1lXCIpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBub2RlcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gIGxldCBub2RlVXBkYXRlID0gbm9kZUdycHNcbiAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24obil7IHJldHVybiBuLmlzU2VsZWN0ZWQ7IH0pXG4gICAgICAuY2xhc3NlZChcImNvbnN0cmFpbmVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5jb25zdHJhaW50cy5sZW5ndGggPiAwOyB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24obikgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBuLnggKyBcIixcIiArIG4ueSArIFwiKVwiOyB9KVxuICAgICAgO1xuXG5cbiAgLy8gQWRkIHRleHQgZm9yIGNvbnN0cmFpbnRzXG4gIGxldCBjdCA9IG5vZGVHcnBzLnNlbGVjdEFsbChcInRleHQuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEoZnVuY3Rpb24obil7IHJldHVybiBuLmNvbnN0cmFpbnRzOyB9KTtcbiAgY3QuZW50ZXIoKS5hcHBlbmQoXCJzdmc6dGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb25zdHJhaW50XCIpO1xuICBjdC5leGl0KCkucmVtb3ZlKCk7XG4gIGN0LnRleHQoIGMgPT4gY29uc3RyYWludFRleHQoYykgKVxuICAgICAgIC5hdHRyKFwieFwiLCAwKVxuICAgICAgIC5hdHRyKFwiZHlcIiwgKGMsaSkgPT4gYCR7KGkrMSkqMS43fWVtYClcbiAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsXCJzdGFydFwiKVxuICAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gZnVsbCBzaXplXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgOC41IClcbiAgICAgIDtcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDE3IClcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDE3IClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gZnVsbHkgb3BhcXVlXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDEpXG4gICAgICA7XG5cbiAgLy9cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxldCBub2RlRXhpdCA9IG5vZGVHcnBzLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLnggKyBcIixcIiArIHNvdXJjZS55ICsgXCIpXCI7IH0pXG4gICAgICAucmVtb3ZlKClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gdGlueSByYWRpdXNcbiAgbm9kZUV4aXQuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNilcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gdHJhbnNwYXJlbnRcbiAgbm9kZUV4aXQuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpXG4gICAgICA7XG4gIC8vIFN0YXNoIHRoZSBvbGQgcG9zaXRpb25zIGZvciB0cmFuc2l0aW9uLlxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLngwID0gZC54O1xuICAgIGQueTAgPSBkLnk7XG4gIH0pO1xuICAvL1xuXG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVMaW5rcyhsaW5rcywgc291cmNlKSB7XG4gIGxldCBsaW5rID0gdmlzLnNlbGVjdEFsbChcInBhdGgubGlua1wiKVxuICAgICAgLmRhdGEobGlua3MsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0LmlkOyB9KVxuICAgICAgO1xuXG4gIC8vIEVudGVyIGFueSBuZXcgbGlua3MgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbmV3UGF0aHMgPSBsaW5rLmVudGVyKCkuaW5zZXJ0KFwic3ZnOnBhdGhcIiwgXCJnXCIpO1xuICBsZXQgbGlua1RpdGxlID0gZnVuY3Rpb24obCl7XG4gICAgICBsZXQgY2xpY2sgPSBcIlwiO1xuICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpe1xuICAgICAgICAgIGNsaWNrID0gYENsaWNrIHRvIG1ha2UgdGhpcyByZWxhdGlvbnNoaXAgJHtsLnRhcmdldC5qb2luID8gXCJSRVFVSVJFRFwiIDogXCJPUFRJT05BTFwifS4gYDtcbiAgICAgIH1cbiAgICAgIGxldCBhbHRjbGljayA9IFwiQWx0LWNsaWNrIHRvIGN1dCBsaW5rLlwiO1xuICAgICAgcmV0dXJuIGNsaWNrICsgYWx0Y2xpY2s7XG4gIH1cbiAgLy8gc2V0IHRoZSB0b29sdGlwXG4gIG5ld1BhdGhzLmFwcGVuZChcInN2Zzp0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gIG5ld1BhdGhzLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIilcbiAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHNvdXJjZS54MCwgeTogc291cmNlLnkwfTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5jbGFzc2VkKFwiYXR0cmlidXRlXCIsIGZ1bmN0aW9uKGwpIHsgcmV0dXJuIGwudGFyZ2V0LnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCI7IH0pXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihsKXsgXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICAvLyBhIHNoaWZ0LWNsaWNrIGN1dHMgdGhlIHRyZWUgYXQgdGhpcyBlZGdlXG4gICAgICAgICAgICAgIHJlbW92ZU5vZGUobC50YXJnZXQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiKSByZXR1cm47XG4gICAgICAgICAgICAgIC8vIHJlZ3VsYXIgY2xpY2sgb24gYSByZWxhdGlvbnNoaXAgZWRnZSBpbnZlcnRzIHdoZXRoZXJcbiAgICAgICAgICAgICAgLy8gdGhlIGpvaW4gaXMgaW5uZXIgb3Igb3V0ZXIuIFxuICAgICAgICAgICAgICBsLnRhcmdldC5qb2luID0gKGwudGFyZ2V0LmpvaW4gPyBudWxsIDogXCJvdXRlclwiKTtcbiAgICAgICAgICAgICAgLy8gcmUtc2V0IHRoZSB0b29sdGlwXG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJ0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICAgICAgICAgIHVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cihcImRcIiwgZGlhZ29uYWwpXG4gICAgICA7XG4gXG4gIFxuICAvLyBUcmFuc2l0aW9uIGxpbmtzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgbGluay5jbGFzc2VkKFwib3V0ZXJcIiwgZnVuY3Rpb24obikgeyByZXR1cm4gbi50YXJnZXQuam9pbiA9PT0gXCJvdXRlclwiOyB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJkXCIsIGRpYWdvbmFsKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICBsaW5rLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHNvdXJjZS54LCB5OiBzb3VyY2UueX07XG4gICAgICAgIHJldHVybiBkaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgIH0pXG4gICAgICAucmVtb3ZlKClcbiAgICAgIDtcblxufVxuXG4vLyBUdXJucyBhIGpzb24gcmVwcmVzZW50YXRpb24gb2YgYSB0ZW1wbGF0ZSBpbnRvIFhNTCwgc3VpdGFibGUgZm9yIGltcG9ydGluZyBpbnRvIHRoZSBJbnRlcm1pbmUgUUIuXG5mdW5jdGlvbiBqc29uMnhtbCh0LCBxb25seSl7XG4gICAgdmFyIHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7IFxuICAgICAgICB2YXIgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICB2YXIgdiA9IHhba11cbiAgICAgICAgcmV0dXJuIHMgKyBgJHtrfSAke3Z9IGA7XG4gICAgfSwgXCJcIik7XG5cbiAgICAvLyBGdW5jdGlvbiB0byBlc2NhcGUgJzwnICdcIicgYW5kICcmJyBjaGFyYWN0ZXJzXG4gICAgdmFyIGVzYyA9IGZ1bmN0aW9uKHMpeyByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIik7IH07XG4gICAgLy8gQ29udmVydHMgYW4gb3V0ZXIgam9pbiBwYXRoIHRvIHhtbC5cbiAgICBmdW5jdGlvbiBvajJ4bWwob2ope1xuICAgICAgICByZXR1cm4gYDxqb2luIHBhdGg9XCIke29qfVwiIHN0eWxlPVwiT1VURVJcIiAvPmA7XG4gICAgfVxuICAgIC8vIENvbnZlcnRzIGEgY29uc3RyYWludCB0byB4bWxcbiAgICBmdW5jdGlvbiBjMnhtbChjKXtcbiAgICAgICAgbGV0IGcgPSAnJztcbiAgICAgICAgbGV0IGggPSAnJztcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIiB8fCBjLmN0eXBlID09PSBcImxpc3RcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7Yy5wYXRofVwiIG9wPVwiJHtlc2MoYy5vcCl9XCIgdmFsdWU9XCIke2VzYyhjLnZhbHVlKX1cIiBjb2RlPVwiJHtjLmNvZGV9XCIgZWRpdGFibGU9XCIke2MuZWRpdGFibGV9XCJgO1xuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKXtcbiAgICAgICAgICAgIGxldCBldiA9IChjLmV4dHJhVmFsdWUgJiYgYy5leHRyYVZhbHVlICE9PSBcIkFueVwiKSA/IGBleHRyYVZhbHVlPVwiJHtjLmV4dHJhVmFsdWV9XCJgIDogXCJcIjtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7Yy5wYXRofVwiIG9wPVwiJHtlc2MoYy5vcCl9XCIgdmFsdWU9XCIke2VzYyhjLnZhbHVlKX1cIiAke2V2fSBjb2RlPVwiJHtjLmNvZGV9XCIgZWRpdGFibGU9XCIke2MuZWRpdGFibGV9XCJgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKXtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7Yy5wYXRofVwiIG9wPVwiJHtjLm9wfVwiIGNvZGU9XCIke2MuY29kZX1cIiBlZGl0YWJsZT1cIiR7Yy5lZGl0YWJsZX1cImA7XG4gICAgICAgICAgICBoID0gYy52YWx1ZXMubWFwKCB2ID0+IGA8dmFsdWU+JHtlc2Modil9PC92YWx1ZT5gICkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgdHlwZT1cIiR7Yy50eXBlfVwiIGVkaXRhYmxlPVwiZmFsc2VcImA7XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2Mub3B9XCIgY29kZT1cIiR7Yy5jb2RlfVwiIGVkaXRhYmxlPVwiJHtjLmVkaXRhYmxlfVwiYDtcbiAgICAgICAgaWYoaClcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfT4ke2h9PC9jb25zdHJhaW50PlxcbmA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfSAvPlxcbmA7XG4gICAgfVxuXG4gICAgLy8gdGhlIHF1ZXJ5IHBhcnRcbiAgICB2YXIgcXBhcnQgPSBcbmA8cXVlcnlcbiAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gIG1vZGVsPVwiJHsodC5tb2RlbCAmJiB0Lm1vZGVsLm5hbWUpIHx8ICcnfVwiXG4gIHZpZXc9XCIke3Quc2VsZWN0LmpvaW4oJyAnKX1cIlxuICBsb25nRGVzY3JpcHRpb249XCIke2VzYyh0LmRlc2NyaXB0aW9uIHx8ICcnKX1cIlxuICBzb3J0T3JkZXI9XCIke3NvIHx8ICcnfVwiXG4gIGNvbnN0cmFpbnRMb2dpYz1cIiR7dC5jb25zdHJhaW50TG9naWMgfHwgJyd9XCI+XG4gICR7KHQuam9pbnMgfHwgW10pLm1hcChvajJ4bWwpLmpvaW4oXCIgXCIpfVxuICAkeyh0LndoZXJlIHx8IFtdKS5tYXAoYzJ4bWwpLmpvaW4oXCIgXCIpfVxuPC9xdWVyeT5gO1xuICAgIC8vIHRoZSB3aG9sZSB0ZW1wbGF0ZVxuICAgIHZhciB0bXBsdCA9IFxuYDx0ZW1wbGF0ZVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgdGl0bGU9XCIke2VzYyh0LnRpdGxlIHx8ICcnKX1cIlxuICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAke3FwYXJ0fVxuPC90ZW1wbGF0ZT5cbmA7XG4gICAgcmV0dXJuIHFvbmx5ID8gcXBhcnQgOiB0bXBsdFxufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlVHRleHQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQ7XG4gIGlmKCBkMy5zZWxlY3QoXCIjdHRleHRcIikuY2xhc3NlZChcImpzb25cIikgKVxuICAgICAgdHh0ID0gSlNPTi5zdHJpbmdpZnkodWN0LCBudWxsLCAyKTtcbiAgZWxzZVxuICAgICAgdHh0ID0ganNvbjJ4bWwodWN0KTtcbiAgZDMuc2VsZWN0KFwiI3R0ZXh0ZGl2XCIpIFxuICAgICAgLnRleHQodHh0KVxuICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCB0cnVlKTtcbiAgICAgICAgICBzZWxlY3RUZXh0KFwidHRleHRkaXZcIik7XG4gICAgICB9KVxuICAgICAgLm9uKFwiYmx1clwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgIHVwZGF0ZUNvdW50KCk7XG59XG5cbmZ1bmN0aW9uIHJ1bmF0bWluZSgpIHtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gIGxldCBsaW5rdXJsID0gY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KCl7XG4gIGxldCB1Y3QgPSB1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpO1xuICBsZXQgcXR4dCA9IGpzb24yeG1sKHVjdCwgdHJ1ZSk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gIGxldCBjb3VudFVybCA9IGN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gIGQzanNvblByb21pc2UoY291bnRVcmwpXG4gICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCBzcGFuJykudGV4dChuKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIHRydWUpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgIH0pO1xufVxuXG4vLyBUaGUgY2FsbCB0aGF0IGdldHMgaXQgYWxsIGdvaW5nLi4uXG5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb25zdHJhaW50cyBvbiBhdHRyaWJ1dGVzOlxuLy8gLSB2YWx1ZSAoY29tcGFyaW5nIGFuIGF0dHJpYnV0ZSB0byBhIHZhbHVlLCB1c2luZyBhbiBvcGVyYXRvcilcbi8vICAgICAgPiA+PSA8IDw9ID0gIT0gTElLRSBOT1QtTElLRSBDT05UQUlOUyBET0VTLU5PVC1DT05UQUlOXG4vLyAtIG11bHRpdmFsdWUgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgbXVsdGlwbGUgdmFsdWUpXG4vLyAgICAgIE9ORS1PRiBOT1QtT05FIE9GXG4vLyAtIHJhbmdlIChzdWJ0eXBlIG9mIG11bHRpdmFsdWUsIGZvciBjb29yZGluYXRlIHJhbmdlcylcbi8vICAgICAgV0lUSElOIE9VVFNJREUgT1ZFUkxBUFMgRE9FUy1OT1QtT1ZFUkxBUFxuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwpXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vXG4vLyBDb25zdHJhaW50cyBvbiByZWZlcmVuY2VzL2NvbGxlY3Rpb25zXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTCByZWYvZW1wdHkgY29sbGVjdGlvbilcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy8gLSBsb29rdXAgKFxuLy8gICAgICBMT09LVVBcbi8vIC0gc3ViY2xhc3Ncbi8vICAgICAgSVNBXG4vLyAtIGxpc3Rcbi8vICAgICAgSU4gTk9ULUlOXG4vLyAtIGxvb3AgKFRPRE8pXG5cbnZhciBOVU1FUklDVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCJcbl07XG5cbnZhciBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbnZhciBMRUFGVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiLFxuICAgIFwiamF2YS5sYW5nLk9iamVjdFwiLFxuICAgIFwiT2JqZWN0XCJcbl1cblxuXG52YXIgT1BTID0gW1xuXG4gICAgLy8gVmFsaWQgZm9yIGFueSBhdHRyaWJ1dGVcbiAgICAvLyBBbHNvIHRoZSBvcGVyYXRvcnMgZm9yIGxvb3AgY29uc3RyYWludHMgKG5vdCB5ZXQgaW1wbGVtZW50ZWQpLlxuICAgIHtcbiAgICBvcDogXCI9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0se1xuICAgIG9wOiBcIiE9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIG51bWVyaWMgYW5kIGRhdGUgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCI+XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI+PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPFwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPD1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIHN0cmluZyBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIkNPTlRBSU5TXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG5cbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBDT05UQUlOXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgZm9yIExvY2F0aW9uIG5vZGVzXG4gICAge1xuICAgIG9wOiBcIldJVEhJTlwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVkVSTEFQU1wiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBPVkVSTEFQXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9VVFNJREVcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSxcbiBcbiAgICAvLyBOVUxMIGNvbnN0cmFpbnRzLiBWYWxpZCBmb3IgYW55IG5vZGUgZXhjZXB0IHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiSVMgTk9UIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgKGkuZS4sIHRoZSByb290LCBvciBhbnkgXG4gICAgLy8gcmVmZXJlbmNlIG9yIGNvbGxlY3Rpb24gbm9kZSkuXG4gICAge1xuICAgIG9wOiBcIkxPT0tVUFwiLFxuICAgIGN0eXBlOiBcImxvb2t1cFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIElOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgZXhjZXB0IHRoZSByb290LlxuICAgIHtcbiAgICBvcDogXCJJU0FcIixcbiAgICBjdHlwZTogXCJzdWJjbGFzc1wiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfV07XG4vL1xudmFyIE9QSU5ERVggPSBPUFMucmVkdWNlKGZ1bmN0aW9uKHgsbyl7XG4gICAgeFtvLm9wXSA9IG87XG4gICAgcmV0dXJuIHg7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9vcHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vLyBQcm9taXNpZmllcyBhIGNhbGwgdG8gZDMuanNvbi5cbi8vIEFyZ3M6XG4vLyAgIHVybCAoc3RyaW5nKSBUaGUgdXJsIG9mIHRoZSBqc29uIHJlc291cmNlXG4vLyBSZXR1cm5zOlxuLy8gICBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUganNvbiBvYmplY3QgdmFsdWUsIG9yIHJlamVjdHMgd2l0aCBhbiBlcnJvclxuZnVuY3Rpb24gZDNqc29uUHJvbWlzZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGQzLmpzb24odXJsLCBmdW5jdGlvbihlcnJvciwganNvbil7XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdCh7IHN0YXR1czogZXJyb3Iuc3RhdHVzLCBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0fSkgOiByZXNvbHZlKGpzb24pO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG4vLyBTZWxlY3RzIGFsbCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLiBcbi8vIFRoZSBjb250YWluZXIgbXVzdCBoYXZlIGFuIGlkLlxuLy8gQ29waWVkIGZyb206XG4vLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjc3NDUxL2hvdy10by1zZWxlY3QtZGl2LXRleHQtb24tYnV0dG9uLWNsaWNrXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGNvbnRhaW5lcmlkKSB7XG4gICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICByYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59XG5cbi8vIENvbnZlcnRzIGFuIEludGVyTWluZSBxdWVyeSBpbiBQYXRoUXVlcnkgWE1MIGZvcm1hdCB0byBhIEpTT04gb2JqZWN0IHJlcHJlc2VudGF0aW9uLlxuLy9cbmZ1bmN0aW9uIHBhcnNlUGF0aFF1ZXJ5KHhtbCl7XG4gICAgLy8gVHVybnMgdGhlIHF1YXNpLWxpc3Qgb2JqZWN0IHJldHVybmVkIGJ5IHNvbWUgRE9NIG1ldGhvZHMgaW50byBhY3R1YWwgbGlzdHMuXG4gICAgZnVuY3Rpb24gZG9tbGlzdDJhcnJheShsc3QpIHtcbiAgICAgICAgbGV0IGEgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8bHN0Lmxlbmd0aDsgaSsrKSBhLnB1c2gobHN0W2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIC8vIHBhcnNlIHRoZSBYTUxcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBkb20gPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgXCJ0ZXh0L3htbFwiKTtcblxuICAgIC8vIGdldCB0aGUgcGFydHMuIFVzZXIgbWF5IHBhc3RlIGluIGEgPHRlbXBsYXRlPiBvciBhIDxxdWVyeT5cbiAgICAvLyAoaS5lLiwgdGVtcGxhdGUgbWF5IGJlIG51bGwpXG4gICAgbGV0IHRlbXBsYXRlID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IHRpdGxlID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikgfHwgXCJcIjtcbiAgICBsZXQgY29tbWVudCA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcImNvbW1lbnRcIikgfHwgXCJcIjtcbiAgICBsZXQgcXVlcnkgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJxdWVyeVwiKVswXTtcbiAgICBsZXQgbW9kZWwgPSB7IG5hbWU6IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm1vZGVsXCIpIHx8IFwiZ2Vub21pY1wiIH07XG4gICAgbGV0IG5hbWUgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpIHx8IFwiXCI7XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibG9uZ0Rlc2NyaXRpb25cIikgfHwgXCJcIjtcbiAgICBsZXQgc2VsZWN0ID0gKHF1ZXJ5LmdldEF0dHJpYnV0ZShcInZpZXdcIikgfHwgXCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgbGV0IGNvbnN0cmFpbnRzID0gZG9tbGlzdDJhcnJheShkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnN0cmFpbnQnKSk7XG4gICAgbGV0IGNvbnN0cmFpbnRMb2dpYyA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImNvbnN0cmFpbnRMb2dpY1wiKTtcbiAgICBsZXQgam9pbnMgPSBkb21saXN0MmFycmF5KHF1ZXJ5LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiam9pblwiKSk7XG4gICAgbGV0IHNvcnRPcmRlciA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKSB8fCBcIlwiO1xuICAgIC8vXG4gICAgLy9cbiAgICBsZXQgd2hlcmUgPSBjb25zdHJhaW50cy5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgb3AgPSBjLmdldEF0dHJpYnV0ZShcIm9wXCIpO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjLmdldEF0dHJpYnV0ZShcInR5cGVcIik7XG4gICAgICAgICAgICAgICAgb3AgPSBcIklTQVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbHMgPSBkb21saXN0MmFycmF5KGMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ2YWx1ZVwiKSkubWFwKCB2ID0+IHYuaW5uZXJIVE1MICk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjLmdldEF0dHJpYnV0ZShcInBhdGhcIiksXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA6IHZhbHMsXG4gICAgICAgICAgICAgICAgdHlwZSA6IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjLmdldEF0dHJpYnV0ZShcImNvZGVcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGU6IGMuZ2V0QXR0cmlidXRlKFwiZWRpdGFibGVcIikgfHwgXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAvLyBDaGVjazogaWYgdGhlcmUgaXMgb25seSBvbmUgY29uc3RyYWludCwgKGFuZCBpdCdzIG5vdCBhbiBJU0EpLCBzb21ldGltZXMgdGhlIGNvbnN0cmFpbnRMb2dpYyBcbiAgICAvLyBhbmQvb3IgdGhlIGNvbnN0cmFpbnQgY29kZSBhcmUgbWlzc2luZy5cbiAgICBpZiAod2hlcmUubGVuZ3RoID09PSAxICYmIHdoZXJlWzBdLm9wICE9PSBcIklTQVwiICYmICF3aGVyZVswXS5jb2RlKXtcbiAgICAgICAgd2hlcmVbMF0uY29kZSA9IGNvbnN0cmFpbnRMb2dpYyA9IFwiQVwiO1xuICAgIH1cblxuICAgIC8vIG91dGVyIGpvaW5zLiBUaGV5IGxvb2sgbGlrZSB0aGlzOlxuICAgIC8vICAgICAgIDxqb2luIHBhdGg9XCJHZW5lLnNlcXVlbmNlT250b2xvZ3lUZXJtXCIgc3R5bGU9XCJPVVRFUlwiLz5cbiAgICBqb2lucyA9IGpvaW5zLm1hcCggaiA9PiBqLmdldEF0dHJpYnV0ZShcInBhdGhcIikgKTtcblxuICAgIGxldCBvcmRlckJ5ID0gbnVsbDtcbiAgICBpZiAoc29ydE9yZGVyKSB7XG4gICAgICAgIC8vIFRoZSBqc29uIGZvcm1hdCBmb3Igb3JkZXJCeSBpcyBhIGJpdCB3ZWlyZC5cbiAgICAgICAgLy8gSWYgdGhlIHhtbCBvcmRlckJ5IGlzOiBcIkEuYi5jIGFzYyBBLmQuZSBkZXNjXCIsXG4gICAgICAgIC8vIHRoZSBqc29uIHNob3VsZCBiZTogWyB7XCJBLmIuY1wiOlwiYXNjXCJ9LCB7XCJBLmQuZVwiOlwiZGVzY30gXVxuICAgICAgICAvLyBcbiAgICAgICAgLy8gVGhlIG9yZGVyYnkgc3RyaW5nIHRva2VucywgZS5nLiBbXCJBLmIuY1wiLCBcImFzY1wiLCBcIkEuZC5lXCIsIFwiZGVzY1wiXVxuICAgICAgICBsZXQgb2IgPSBzb3J0T3JkZXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIC8vIHNhbml0eSBjaGVjazpcbiAgICAgICAgaWYgKG9iLmxlbmd0aCAlIDIgKVxuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgcGFyc2UgdGhlIG9yZGVyQnkgY2xhdXNlOiBcIiArIHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKTtcbiAgICAgICAgLy8gY29udmVydCB0b2tlbnMgdG8ganNvbiBvcmRlckJ5IFxuICAgICAgICBvcmRlckJ5ID0gb2IucmVkdWNlKGZ1bmN0aW9uKGFjYywgY3VyciwgaSl7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApe1xuICAgICAgICAgICAgICAgIC8vIG9kZC4gY3VyciBpcyBhIHBhdGguIFB1c2ggaXQuXG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY3VycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGV2ZW4uIFBvcCB0aGUgcGF0aCwgY3JlYXRlIHRoZSB7fSwgYW5kIHB1c2ggaXQuXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB7fVxuICAgICAgICAgICAgICAgIGxldCBwID0gYWNjLnBvcCgpXG4gICAgICAgICAgICAgICAgdltwXSA9IGN1cnI7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYyxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgam9pbnMsXG4gICAgICAgIG9yZGVyQnlcbiAgICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZGVlcCBjb3B5IG9mIG9iamVjdCBvLiBcbi8vIEFyZ3M6XG4vLyAgIG8gIChvYmplY3QpIE11c3QgYmUgYSBKU09OIG9iamVjdCAobm8gY3VyY3VsYXIgcmVmcywgbm8gZnVuY3Rpb25zKS5cbi8vIFJldHVybnM6XG4vLyAgIGEgZGVlcCBjb3B5IG9mIG9cbmZ1bmN0aW9uIGRlZXBjKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBvO1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTtcbn1cblxuLy9cbmxldCBQUkVGSVg9XCJvcmcubWdpLmFwcHMucWJcIjtcbmZ1bmN0aW9uIHRlc3RMb2NhbChhdHRyKSB7XG4gICAgcmV0dXJuIChQUkVGSVgrXCIuXCIrYXR0cikgaW4gbG9jYWxTdG9yYWdlO1xufVxuZnVuY3Rpb24gc2V0TG9jYWwoYXR0ciwgdmFsLCBlbmNvZGUpe1xuICAgIGxvY2FsU3RvcmFnZVtQUkVGSVgrXCIuXCIrYXR0cl0gPSBlbmNvZGUgPyBKU09OLnN0cmluZ2lmeSh2YWwpIDogdmFsO1xufVxuZnVuY3Rpb24gZ2V0TG9jYWwoYXR0ciwgZGVjb2RlLCBkZmx0KXtcbiAgICBsZXQga2V5ID0gUFJFRklYK1wiLlwiK2F0dHI7XG4gICAgaWYgKGtleSBpbiBsb2NhbFN0b3JhZ2Upe1xuICAgICAgICBsZXQgdiA9IGxvY2FsU3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAoZGVjb2RlKSB2ID0gSlNPTi5wYXJzZSh2KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZGZsdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhckxvY2FsKCkge1xuICAgIGxldCBybXYgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoUFJFRklYKSk7XG4gICAgcm12LmZvckVhY2goIGsgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oaykgKTtcbn1cblxuLy9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgVW5kb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxpbWl0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgY2xlYXIgKCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludGVyID0gLTE7XG4gICAgfVxuICAgIGdldCBjdXJyZW50U3RhdGUgKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyIDwgMClcbiAgICAgICAgICAgIHRocm93IFwiTm8gY3VycmVudCBzdGF0ZS5cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICBnZXQgaGFzU3RhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID49IDA7XG4gICAgfVxuICAgIGdldCBjYW5VbmRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+IDA7XG4gICAgfVxuICAgIGdldCBjYW5SZWRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU3RhdGUgJiYgdGhpcy5wb2ludGVyIDwgdGhpcy5oaXN0b3J5Lmxlbmd0aC0xO1xuICAgIH1cbiAgICBhZGQgKHMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFERFwiKTtcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdID0gcztcbiAgICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSh0aGlzLnBvaW50ZXIrMSk7XG4gICAgfVxuICAgIHVuZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVU5ET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5VbmRvKSB0aHJvdyBcIk5vIHVuZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgcmVkbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRURPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblJlZG8pIHRocm93IFwiTm8gcmVkby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVW5kb01hbmFnZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9