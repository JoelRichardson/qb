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
let animationDuration = 250; // ms
let defaultColors = { header: { main: "#595455", text: "#fff" } };
let defaultLogo = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png";
let undoMgr = new __WEBPACK_IMPORTED_MODULE_3__undoManager_js__["a" /* default */]();
let registryUrl = "http://registry.intermine.org/service/instances";
let registryFileUrl = "./resources/testdata/registry.json";

let editViews = {
    queryMain: {
        name: "queryMain",
        layoutStyle: "tree"
    },
    constraintLogic: {
        name: "constraintLogic",
        layoutStyle: "tree"
    },
    columnOrder: {
        name: "columnOrder",
        layoutStyle: "dendrogram"
    },
    sortOrder: {
        name: "sortOrder",
        layoutStyle: "dendrogram"
    }
};
let editView = editViews.queryMain;

function setup(){
    m = [20, 120, 20, 120]
    w = 1280 - m[1] - m[3]
    h = 800 - m[0] - m[2]
    i = 0

    // thanks to: https://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
    diagonal = d3.svg.diagonal()
        .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })     
        .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
        .projection(function(d) { return [d.y, d.x]; });
    
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

    Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(registryUrl)
      .then(initMines)
      .catch(() => {
          alert(`Could not access registry at ${registryUrl}. Trying ${registryFileUrl}.`);
          Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["d3jsonPromise"])(registryFileUrl)
              .then(initMines)
              .catch(() => {
                  alert("Cannot access registry file. This is not your lucky day.");
                  });
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

function initMines(j_mines) {
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
    d3.select("#editView")
        .on("change", function () { setEditView(this.value); })
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
}
//
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
        select : tmplt.select.concat(),
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
         return this.view !== null && this.view !== undefined;
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
            t.select.slice(i).forEach( (p,j) => {
                let n = getNodeByPath(this.template, p);
                n.view -= 1;
            });
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

}
function getNodeByPath (t,p) {
        p = p.trim();
        if (!p) return null;
        let parts = p.split(".");
        let n = t.qtree;
        if (n.name !== parts[0]) return null;
        for( let i = 1; i < parts.length; i++){
            let cname = parts[i];
            let c = (n.children || []).filter(x => x.name === cname)[0];
            if (!c) return null;
            n = c;
        }
        return n;
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
        x.unselect();
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

// Set the editing view. View is one of:
// Args:
//     view (string) One of: queryMain, constraintLogic, columnOrder, sortOrder
// Returns:
//     Nothing
// Side effects:
//     Changes the layout and updates the view.
function setEditView(view){
    let v = editViews[view];
    if (!v) throw "Unrecognized view type: " + view;
    editView = v;
    update(root);
}

function doLayout(root){
  var layout;
  let leaves = [];
  
  if (editView.layoutStyle === "tree") {
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
      function md (n) { // max depth
          if (n.children.length === 0) leaves.push(n);
          return 1 + (n.children.length ? Math.max.apply(null, n.children.map(md)) : 0);
      };
      let maxd = md(root); // max depth, 1-based
      layout = d3.layout.cluster()
          .separation((a,b) => 1)
          .size([h, maxd * 180]);
      // Save nodes in global.
      nodes = layout.nodes(root).reverse();
      nodes.forEach( d => { let tmp = d.x; d.x = d.y; d.y = tmp; });

      // ------------------------------------------------------
      // Experimenting with rearranging leaves. Rough code ahead...
      //
      // Rearrange y-positions of leaf nodes. 
      let pos = leaves.map(function(n){ return { y: n.y, y0: n.y0 }; });
      //let pos = leaves.map(function(n){ return { x: n.x, x0: n.x0 }; });
      let nameComp = function(a,b) {
          let na = a.name.toLowerCase();
          let nb = b.name.toLowerCase();
          return na < nb ? -1 : na > nb ? 1 : 0;
      };
      let colOrderComp = function(a,b){
          if (a.isSelected)
              if (b.isSelected)
                  return a.view - b.view;
              else
                  return -1
          else
              if (b.isSelected)
                  return 1
              else
                  return nameComp(a,b)
      }
      leaves.sort(colOrderComp);
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
      // ------------------------------------------------------
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
      .attr("id", n => n.path.replace(/\./g, "_"))
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
          if (d3.event.defaultPrevented) return; 
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

  nodeUpdate.selectAll("text.nodeName")
      .text(n => n.name);

  // Make selected nodes draggable
  let drag = d3.behavior.drag();
  d3.selectAll("g.nodegroup")
      .classed("draggable", false)
      .on(".drag", null); 
  if (editView.name === "columnOrder")
      d3.selectAll("g.nodegroup.selected")
          .classed("draggable", true)
          .call(drag);
  drag
      .on("drag", function () {
          let dd = d3.select(this);
          dd.attr("transform", (n) => {
              //n.x = d3.event.x;
              n.y = d3.event.y;
              return `translate(${n.x},${n.y})`;
          });
          let ll = d3.select(`path.link[target="${dd.attr('id')}"]`);
          ll.attr("d", diagonal);
      })
      .on("dragend", function () {
          d3.event.sourceEvent.preventDefault();
          d3.event.sourceEvent.stopPropagation();
          let dragged = d3.select(this).data()[0];
          let nodes = d3.selectAll(".nodegroup.selected").data()
          nodes.sort( (a, b) => a.y - b.y );
          nodes.forEach((n,i) => { n.view = i });
          dragged.template.select = nodes.map( n=> n.path );
          update();
          saveState();
      });

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
  newPaths
      .attr("target", d => d.target.id.replace(/\./g, "_"))
      .attr("class", "link")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMGFiOGU1Nzc3NTQ4ZjkxMWI1ODIiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsUUFBUTtBQUM2QztBQVU5RDs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIscUJBQXFCLFVBQVUsZ0NBQWdDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7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QUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsSUFBSTs7QUFFTCxrQkFBa0I7Ozs7Ozs7O0FDNU5sQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLG9EQUFvRDtBQUNoRixTQUFTO0FBQ1QsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGNBQWM7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxjQUFjLEdBQUcsY0FBYztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsImZpbGUiOiJxYi5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAwYWI4ZTU3Nzc1NDhmOTExYjU4MiIsIlxuLypcbiAqIERhdGEgc3RydWN0dXJlczpcbiAqICAgMC4gVGhlIGRhdGEgbW9kZWwgZm9yIGEgbWluZSBpcyBhIGdyYXBoIG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIFxuICogICBjbGFzc2VzLCB0aGVpciBjb21wb25lbnRzIChhdHRyaWJ1dGVzLCByZWZlcmVuY2VzLCBjb2xsZWN0aW9ucyksIGFuZCByZWxhdGlvbnNoaXBzLlxuICogICAxLiBUaGUgcXVlcnkgaXMgcmVwcmVzZW50ZWQgYnkgYSBkMy1zdHlsZSBoaWVyYXJjaHkgc3RydWN0dXJlOiBhIGxpc3Qgb2ZcbiAqICAgbm9kZXMsIHdoZXJlIGVhY2ggbm9kZSBoYXMgYSBuYW1lIChzdHJpbmcpLCBhbmQgYSBjaGlsZHJlbiBsaXN0IChwb3NzaWJseSBlbXB0eSBcbiAqICAgbGlzdCBvZiBub2RlcykuIFRoZSBub2RlcyBhbmQgdGhlIHBhcmVudC9jaGlsZCByZWxhdGlvbnNoaXBzIG9mIHRoaXMgc3RydWN0dXJlIFxuICogICBhcmUgd2hhdCBkcml2ZSB0aGUgZGlzbGF5LlxuICogICAyLiBFYWNoIG5vZGUgaW4gdGhlIGRpYWdyYW0gY29ycmVzcG9uZHMgdG8gYSBjb21wb25lbnQgaW4gYSBwYXRoLCB3aGVyZSBlYWNoXG4gKiAgIHBhdGggc3RhcnRzIHdpdGggdGhlIHJvb3QgY2xhc3MsIG9wdGlvbmFsbHkgcHJvY2VlZHMgdGhyb3VnaCByZWZlcmVuY2VzIGFuZCBjb2xsZWN0aW9ucyxcbiAqICAgYW5kIG9wdGlvbmFsbHkgZW5kcyBhdCBhbiBhdHRyaWJ1dGUuXG4gKlxuICovXG5pbXBvcnQgcGFyc2VyIGZyb20gJy4vcGFyc2VyLmpzJztcbi8vaW1wb3J0IHsgbWluZXMgfSBmcm9tICcuL21pbmVzLmpzJztcbmltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQge1xuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeVxufSBmcm9tICcuL3V0aWxzLmpzJztcblxuaW1wb3J0IFVuZG9NYW5hZ2VyIGZyb20gJy4vdW5kb01hbmFnZXIuanMnO1xuXG5sZXQgY3Vyck1pbmU7XG5sZXQgY3VyclRlbXBsYXRlO1xubGV0IGN1cnJOb2RlO1xuXG5sZXQgbmFtZTJtaW5lO1xubGV0IG07XG5sZXQgdztcbmxldCBoO1xubGV0IGk7XG5sZXQgcm9vdDtcbmxldCBkaWFnb25hbDtcbmxldCB2aXM7XG5sZXQgbm9kZXM7XG5sZXQgbGlua3M7XG5sZXQgYW5pbWF0aW9uRHVyYXRpb24gPSAyNTA7IC8vIG1zXG5sZXQgZGVmYXVsdENvbG9ycyA9IHsgaGVhZGVyOiB7IG1haW46IFwiIzU5NTQ1NVwiLCB0ZXh0OiBcIiNmZmZcIiB9IH07XG5sZXQgZGVmYXVsdExvZ28gPSBcImh0dHBzOi8vY2RuLnJhd2dpdC5jb20vaW50ZXJtaW5lL2Rlc2lnbi1tYXRlcmlhbHMvNzhhMTNkYjUvbG9nb3MvaW50ZXJtaW5lL3NxdWFyZWlzaC80NXg0NS5wbmdcIjtcbmxldCB1bmRvTWdyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XG5sZXQgcmVnaXN0cnlVcmwgPSBcImh0dHA6Ly9yZWdpc3RyeS5pbnRlcm1pbmUub3JnL3NlcnZpY2UvaW5zdGFuY2VzXCI7XG5sZXQgcmVnaXN0cnlGaWxlVXJsID0gXCIuL3Jlc291cmNlcy90ZXN0ZGF0YS9yZWdpc3RyeS5qc29uXCI7XG5cbmxldCBlZGl0Vmlld3MgPSB7XG4gICAgcXVlcnlNYWluOiB7XG4gICAgICAgIG5hbWU6IFwicXVlcnlNYWluXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcInRyZWVcIlxuICAgIH0sXG4gICAgY29uc3RyYWludExvZ2ljOiB7XG4gICAgICAgIG5hbWU6IFwiY29uc3RyYWludExvZ2ljXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcInRyZWVcIlxuICAgIH0sXG4gICAgY29sdW1uT3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJjb2x1bW5PcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCJcbiAgICB9LFxuICAgIHNvcnRPcmRlcjoge1xuICAgICAgICBuYW1lOiBcInNvcnRPcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCJcbiAgICB9XG59O1xubGV0IGVkaXRWaWV3ID0gZWRpdFZpZXdzLnF1ZXJ5TWFpbjtcblxuZnVuY3Rpb24gc2V0dXAoKXtcbiAgICBtID0gWzIwLCAxMjAsIDIwLCAxMjBdXG4gICAgdyA9IDEyODAgLSBtWzFdIC0gbVszXVxuICAgIGggPSA4MDAgLSBtWzBdIC0gbVsyXVxuICAgIGkgPSAwXG5cbiAgICAvLyB0aGFua3MgdG86IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MDA3ODc3L2hvdy10by11c2UtdGhlLWQzLWRpYWdvbmFsLWZ1bmN0aW9uLXRvLWRyYXctY3VydmVkLWxpbmVzXG4gICAgZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAuc291cmNlKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnNvdXJjZS55LCBcInlcIjpkLnNvdXJjZS54fTsgfSkgICAgIFxuICAgICAgICAudGFyZ2V0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnRhcmdldC55LCBcInlcIjpkLnRhcmdldC54fTsgfSlcbiAgICAgICAgLnByb2plY3Rpb24oZnVuY3Rpb24oZCkgeyByZXR1cm4gW2QueSwgZC54XTsgfSk7XG4gICAgXG4gICAgLy8gY3JlYXRlIHRoZSBTVkcgY29udGFpbmVyXG4gICAgdmlzID0gZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lciBzdmdcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3ICsgbVsxXSArIG1bM10pXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGggKyBtWzBdICsgbVsyXSlcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgaGlkZURpYWxvZylcbiAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1bM10gKyBcIixcIiArIG1bMF0gKyBcIilcIik7XG4gICAgLy9cbiAgICBkMy5zZWxlY3QoJyN0SW5mb0JhciA+IGkuYnV0dG9uW25hbWU9XCJvcGVuY2xvc2VcIl0nKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpO1xuICAgICAgICAgICAgbGV0IHdhc0Nsb3NlZCA9IHQuY2xhc3NlZChcImNsb3NlZFwiKTtcbiAgICAgICAgICAgIGxldCBpc0Nsb3NlZCA9ICF3YXNDbG9zZWQ7XG4gICAgICAgICAgICBsZXQgZCA9IGQzLnNlbGVjdCgnI2RyYXdlcicpWzBdWzBdXG4gICAgICAgICAgICBpZiAoaXNDbG9zZWQpXG4gICAgICAgICAgICAgICAgLy8gc2F2ZSB0aGUgY3VycmVudCBoZWlnaHQganVzdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgICAgICAgICAgIGQuX19zYXZlZF9oZWlnaHQgPSBkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGQuX19zYXZlZF9oZWlnaHQpXG4gICAgICAgICAgICAgICAvLyBvbiBvcGVuLCByZXN0b3JlIHRoZSBzYXZlZCBoZWlnaHRcbiAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RyYXdlcicpLnN0eWxlKFwiaGVpZ2h0XCIsIGQuX19zYXZlZF9oZWlnaHQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsIGlzQ2xvc2VkKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS50ZXh0KCBpc0Nsb3NlZCA/IFwiYWRkXCIgOiBcImNsZWFyXCIgKTtcbiAgICAgICAgfSk7XG5cbiAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5VXJsKVxuICAgICAgLnRoZW4oaW5pdE1pbmVzKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyByZWdpc3RyeSBhdCAke3JlZ2lzdHJ5VXJsfS4gVHJ5aW5nICR7cmVnaXN0cnlGaWxlVXJsfS5gKTtcbiAgICAgICAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5RmlsZVVybClcbiAgICAgICAgICAgICAgLnRoZW4oaW5pdE1pbmVzKVxuICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgYWxlcnQoXCJDYW5ub3QgYWNjZXNzIHJlZ2lzdHJ5IGZpbGUuIFRoaXMgaXMgbm90IHlvdXIgbHVja3kgZGF5LlwiKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgdXBkYXRlVHRleHQoKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgLm9uKCdjbGljaycsIHJ1bmF0bWluZSk7XG4gICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgdC50ZXh0KCB0dXJuU3luY09mZiA/IFwic3luY19kaXNhYmxlZFwiIDogXCJzeW5jXCIgKVxuICAgICAgICAgICAgIC5hdHRyKFwidGl0bGVcIiwgKCkgPT5cbiAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgIXR1cm5TeW5jT2ZmICYmIHVwZGF0ZUNvdW50KCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIilcbiAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwianNvbnRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI3VuZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgdW5kbyk7XG4gICAgZDMuc2VsZWN0KFwiI3JlZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgcmVkbyk7XG59XG5cbmZ1bmN0aW9uIGluaXRNaW5lcyhqX21pbmVzKSB7XG4gICAgdmFyIG1pbmVzID0gal9taW5lcy5pbnN0YW5jZXM7XG4gICAgbmFtZTJtaW5lID0ge307XG4gICAgbWluZXMuZm9yRWFjaChmdW5jdGlvbihtKXsgbmFtZTJtaW5lW20ubmFtZV0gPSBtOyB9KTtcbiAgICBjdXJyTWluZSA9IG1pbmVzWzBdO1xuICAgIGN1cnJUZW1wbGF0ZSA9IG51bGw7XG5cbiAgICB2YXIgbWwgPSBkMy5zZWxlY3QoXCIjbWxpc3RcIikuc2VsZWN0QWxsKFwib3B0aW9uXCIpLmRhdGEobWluZXMpO1xuICAgIHZhciBzZWxlY3RNaW5lID0gXCJNb3VzZU1pbmVcIjtcbiAgICBtbC5lbnRlcigpLmFwcGVuZChcIm9wdGlvblwiKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgIHZhciB3ID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgdmFyIG0gPSBkLnVybC5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICB2YXIgdiA9ICh3ICYmICFtKSB8fCBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU9PT1zZWxlY3RNaW5lIHx8IG51bGw7IH0pXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KTtcbiAgICAvL1xuICAgIC8vIHdoZW4gYSBtaW5lIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3RcbiAgICBkMy5zZWxlY3QoXCIjbWxpc3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNlbGVjdGVkTWluZSh0aGlzLnZhbHVlKTsgfSk7XG4gICAgLy9cbiAgICB2YXIgZGcgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpO1xuICAgIGRnLmNsYXNzZWQoXCJoaWRkZW5cIix0cnVlKVxuICAgIGRnLnNlbGVjdChcIi5idXR0b24uY2xvc2VcIikub24oXCJjbGlja1wiLCBoaWRlRGlhbG9nKTtcbiAgICBkZy5zZWxlY3QoXCIuYnV0dG9uLnJlbW92ZVwiKS5vbihcImNsaWNrXCIsICgpID0+IHJlbW92ZU5vZGUoY3Vyck5vZGUpKTtcblxuICAgIC8vIFxuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2VkaXRWaWV3XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7IHNldEVkaXRWaWV3KHRoaXMudmFsdWUpOyB9KVxuICAgICAgICA7XG5cbiAgICAvL1xuICAgIGQzLnNlbGVjdChcIiNkaWFsb2cgLnN1YmNsYXNzQ29uc3RyYWludCBzZWxlY3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNldFN1YmNsYXNzQ29uc3RyYWludChjdXJyTm9kZSwgdGhpcy52YWx1ZSk7IH0pO1xuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc2VsZWN0LWN0cmxcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjdXJyTm9kZS5pc1NlbGVjdGVkID8gY3Vyck5vZGUudW5zZWxlY3QoKSA6IGN1cnJOb2RlLnNlbGVjdCgpO1xuICAgICAgICAgICAgdXBkYXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdChcIiNkaWFsb2cgLnNlbGVjdC1jdHJsXCIpLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBjdXJyTm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgIC8vIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG1pbmUgYnkgZGVmYXVsdC5cbiAgICBzZWxlY3RlZE1pbmUoc2VsZWN0TWluZSk7XG59XG4vL1xuZnVuY3Rpb24gY2xlYXJTdGF0ZSgpIHtcbiAgICB1bmRvTWdyLmNsZWFyKCk7XG59XG5mdW5jdGlvbiBzYXZlU3RhdGUoKSB7XG4gICAgbGV0IHMgPSBKU09OLnN0cmluZ2lmeSh1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpKTtcbiAgICB1bmRvTWdyLmFkZChzKTtcbn1cbmZ1bmN0aW9uIHVuZG8oKSB7IHVuZG9yZWRvKFwidW5kb1wiKSB9XG5mdW5jdGlvbiByZWRvKCkgeyB1bmRvcmVkbyhcInJlZG9cIikgfVxuZnVuY3Rpb24gdW5kb3JlZG8od2hpY2gpe1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzID0gSlNPTi5wYXJzZSh1bmRvTWdyW3doaWNoXSgpKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKHMsIHRydWUpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG4vLyBDYWxsZWQgd2hlbiB1c2VyIHNlbGVjdHMgYSBtaW5lIGZyb20gdGhlIG9wdGlvbiBsaXN0XG4vLyBMb2FkcyB0aGF0IG1pbmUncyBkYXRhIG1vZGVsIGFuZCBhbGwgaXRzIHRlbXBsYXRlcy5cbi8vIFRoZW4gaW5pdGlhbGl6ZXMgZGlzcGxheSB0byBzaG93IHRoZSBmaXJzdCB0ZXJtcGxhdGUncyBxdWVyeS5cbmZ1bmN0aW9uIHNlbGVjdGVkTWluZShtbmFtZSl7XG4gICAgY3Vyck1pbmUgPSBuYW1lMm1pbmVbbW5hbWVdXG4gICAgaWYoIWN1cnJNaW5lKSByZXR1cm47XG4gICAgbGV0IHVybCA9IGN1cnJNaW5lLnVybDtcbiAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICBjdXJyTWluZS50bmFtZXMgPSBbXVxuICAgIGN1cnJNaW5lLnRlbXBsYXRlcyA9IFtdXG4gICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikgeyBcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9tb2RlbC5qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9saXN0cy5qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zdW1tYXJ5ZmllbGRzLmpzb25cIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL29yZ2FuaXNtbGlzdC5qc29uXCI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0dXJsID0gdXJsICsgXCIvc2VydmljZS90ZW1wbGF0ZXM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbHVybCA9IHVybCArIFwiL3NlcnZpY2UvbGlzdHM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgYnVybCA9IHVybCArIFwiL3NlcnZpY2UvYnJhbmRpbmdcIjtcbiAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICBvdXJsID0gdXJsICsgXCIvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSUzQ3F1ZXJ5K25hbWUlM0QlMjIlMjIrbW9kZWwlM0QlMjJnZW5vbWljJTIyK3ZpZXclM0QlMjJPcmdhbmlzbS5zaG9ydE5hbWUlMjIrbG9uZ0Rlc2NyaXB0aW9uJTNEJTIyJTIyJTNFJTNDJTJGcXVlcnklM0UmZm9ybWF0PWpzb25vYmplY3RzXCI7XG4gICAgfVxuICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICBjb25zb2xlLmxvZyhcIkxvYWRpbmcgcmVzb3VyY2VzIGZyb20gXCIgKyB1cmwgKTtcbiAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgIGQzanNvblByb21pc2UodHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UobHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgIGQzanNvblByb21pc2Uoc3VybCksXG4gICAgICAgIGQzanNvblByb21pc2Uob3VybClcbiAgICBdKS50aGVuKCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBqX21vZGVsID0gZGF0YVswXTtcbiAgICAgICAgdmFyIGpfdGVtcGxhdGVzID0gZGF0YVsxXTtcbiAgICAgICAgdmFyIGpfbGlzdHMgPSBkYXRhWzJdO1xuICAgICAgICB2YXIgal9icmFuZGluZyA9IGRhdGFbM107XG4gICAgICAgIHZhciBqX3N1bW1hcnkgPSBkYXRhWzRdO1xuICAgICAgICB2YXIgal9vcmdhbmlzbXMgPSBkYXRhWzVdO1xuICAgICAgICAvL1xuICAgICAgICBjdXJyTWluZS5tb2RlbCA9IGNvbXBpbGVNb2RlbChqX21vZGVsLm1vZGVsKVxuICAgICAgICBjdXJyTWluZS50ZW1wbGF0ZXMgPSBqX3RlbXBsYXRlcy50ZW1wbGF0ZXM7XG4gICAgICAgIGN1cnJNaW5lLmxpc3RzID0gal9saXN0cy5saXN0cztcbiAgICAgICAgY3Vyck1pbmUuc3VtbWFyeUZpZWxkcyA9IGpfc3VtbWFyeS5jbGFzc2VzO1xuICAgICAgICBjdXJyTWluZS5vcmdhbmlzbUxpc3QgPSBqX29yZ2FuaXNtcy5yZXN1bHRzLm1hcChvID0+IG8uc2hvcnROYW1lKTtcbiAgICAgICAgLy9cbiAgICAgICAgY3Vyck1pbmUudGxpc3QgPSBvYmoyYXJyYXkoY3Vyck1pbmUudGVtcGxhdGVzKVxuICAgICAgICBjdXJyTWluZS50bGlzdC5zb3J0KGZ1bmN0aW9uKGEsYil7IFxuICAgICAgICAgICAgcmV0dXJuIGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiBhLnRpdGxlID4gYi50aXRsZSA/IDEgOiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgY3Vyck1pbmUudG5hbWVzID0gT2JqZWN0LmtleXMoIGN1cnJNaW5lLnRlbXBsYXRlcyApO1xuICAgICAgICBjdXJyTWluZS50bmFtZXMuc29ydCgpO1xuICAgICAgICAvLyBGaWxsIGluIHRoZSBzZWxlY3Rpb24gbGlzdCBvZiB0ZW1wbGF0ZXMgZm9yIHRoaXMgbWluZS5cbiAgICAgICAgdmFyIHRsID0gZDMuc2VsZWN0KFwiI3RsaXN0IHNlbGVjdFwiKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAgICAgICAgIC5kYXRhKCBjdXJyTWluZS50bGlzdCApO1xuICAgICAgICB0bC5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJylcbiAgICAgICAgdGwuZXhpdCgpLnJlbW92ZSgpXG4gICAgICAgIHRsLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSlcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKXtyZXR1cm4gZC50aXRsZTt9KTtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgc3RhcnRFZGl0KTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1tjdXJyTWluZS50bGlzdFswXS5uYW1lXSk7XG4gICAgICAgIC8vIEFwcGx5IGJyYW5kaW5nXG4gICAgICAgIGxldCBjbHJzID0gY3Vyck1pbmUuY29sb3JzIHx8IGRlZmF1bHRDb2xvcnM7XG4gICAgICAgIGxldCBiZ2MgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLm1haW4gOiBjbHJzLm1haW4uZmc7XG4gICAgICAgIGxldCB0eGMgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLnRleHQgOiBjbHJzLm1haW4uYmc7XG4gICAgICAgIGxldCBsb2dvID0gY3Vyck1pbmUuaW1hZ2VzLmxvZ28gfHwgZGVmYXVsdExvZ287XG4gICAgICAgIGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjbWluZUxvZ29cIilcbiAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGxvZ28pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJyNzdmdDb250YWluZXIgW25hbWU9XCJtaW5lbmFtZVwiXScpXG4gICAgICAgICAgICAudGV4dChjdXJyTWluZS5uYW1lKTtcbiAgICAgICAgLy8gcG9wdWxhdGUgY2xhc3MgbGlzdCBcbiAgICAgICAgbGV0IGNsaXN0ID0gT2JqZWN0LmtleXMoY3Vyck1pbmUubW9kZWwuY2xhc3Nlcyk7XG4gICAgICAgIGNsaXN0LnNvcnQoKTtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXCIjbmV3cWNsaXN0IHNlbGVjdFwiLCBjbGlzdCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI2VkaXRTb3VyY2VTZWxlY3RvciBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDE7IH0pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZWN0ZWRFZGl0U291cmNlKHRoaXMudmFsdWUpOyBzdGFydEVkaXQoKTsgfSk7XG4gICAgICAgIHNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVswXVswXS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIikudmFsdWUgPSBcIlwiO1xuXG4gICAgfSwgZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyAke2N1cnJNaW5lLm5hbWV9LiBTdGF0dXM9JHtlcnJvci5zdGF0dXN9LiBFcnJvcj0ke2Vycm9yLnN0YXR1c1RleHR9LiAoSWYgdGhlcmUgaXMgbm8gZXJyb3IgbWVzc2FnZSwgdGhlbiBpdHMgcHJvYmFibHkgYSBDT1JTIGlzc3VlLilgKTtcbiAgICB9KTtcbn1cblxuLy9cbmZ1bmN0aW9uIHN0YXJ0RWRpdCgpIHtcbiAgICAvLyBzZWxlY3RvciBmb3IgY2hvb3NpbmcgZWRpdCBpbnB1dCBzb3VyY2UsIGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgbGV0IGlucHV0SWQgPSBzcmNTZWxlY3RvclswXVswXS52YWx1ZTtcbiAgICAvLyB0aGUgcXVlcnkgaW5wdXQgZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RlZCBzb3VyY2VcbiAgICBsZXQgc3JjID0gZDMuc2VsZWN0KGAjJHtpbnB1dElkfSBbbmFtZT1cImluXCJdYCk7XG4gICAgLy8gdGhlIHF1YXJ5IHN0YXJ0aW5nIHBvaW50XG4gICAgbGV0IHZhbCA9IHNyY1swXVswXS52YWx1ZVxuICAgIGlmIChpbnB1dElkID09PSBcInRsaXN0XCIpIHtcbiAgICAgICAgLy8gYSBzYXZlZCBxdWVyeSBvciB0ZW1wbGF0ZVxuICAgICAgICBlZGl0VGVtcGxhdGUoY3Vyck1pbmUudGVtcGxhdGVzW3ZhbF0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcIm5ld3FjbGlzdFwiKSB7XG4gICAgICAgIC8vIGEgbmV3IHF1ZXJ5IGZyb20gYSBzZWxlY3RlZCBzdGFydGluZyBjbGFzc1xuICAgICAgICBsZXQgbnQgPSBuZXcgVGVtcGxhdGUoKTtcbiAgICAgICAgbnQuc2VsZWN0LnB1c2godmFsK1wiLmlkXCIpO1xuICAgICAgICBlZGl0VGVtcGxhdGUobnQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydHhtbFwiKSB7XG4gICAgICAgIC8vIGltcG9ydCB4bWwgcXVlcnlcbiAgICAgICAgdmFsICYmIGVkaXRUZW1wbGF0ZShwYXJzZVBhdGhRdWVyeSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnRqc29uXCIpIHtcbiAgICAgICAgLy8gaW1wb3J0IGpzb24gcXVlcnlcbiAgICAgICAgdmFsICYmIGVkaXRUZW1wbGF0ZShKU09OLnBhcnNlKHZhbCkpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHRocm93IFwiVW5rbm93biBlZGl0IHNvdXJjZS5cIlxufVxuXG4vLyBcbmZ1bmN0aW9uIHNlbGVjdGVkRWRpdFNvdXJjZShzaG93KXtcbiAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSA+IGRpdi5vcHRpb24nKVxuICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLmlkID09PSBzaG93ID8gbnVsbCA6IFwibm9uZVwiOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBvYmplY3QuXG4vLyBUaGUgbGlzdCBpcyBzb3J0ZWQgYnkgdGhlIGl0ZW0ga2V5cy5cbi8vIElmIG5hbWVBdHRyIGlzIHNwZWNpZmllZCwgdGhlIGl0ZW0ga2V5IGlzIGFsc28gYWRkZWQgdG8gZWFjaCBlbGVtZW50XG4vLyBhcyBhbiBhdHRyaWJ1dGUgKG9ubHkgd29ya3MgaWYgdGhvc2UgaXRlbXMgYXJlIHRoZW1zZWx2ZXMgb2JqZWN0cykuXG4vLyBFeGFtcGxlczpcbi8vICAgIHN0YXRlcyA9IHsnTUUnOntuYW1lOidNYWluZSd9LCAnSUEnOntuYW1lOidJb3dhJ319XG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YSd9LCB7bmFtZTonTWFpbmUnfV1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMsICdhYmJyZXYnKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YScsYWJicmV2J0lBJ30sIHtuYW1lOidNYWluZScsYWJicmV2J01FJ31dXG4vLyBBcmdzOlxuLy8gICAgbyAgKG9iamVjdCkgVGhlIG9iamVjdC5cbi8vICAgIG5hbWVBdHRyIChzdHJpbmcpIElmIHNwZWNpZmllZCwgYWRkcyB0aGUgaXRlbSBrZXkgYXMgYW4gYXR0cmlidXRlIHRvIGVhY2ggbGlzdCBlbGVtZW50LlxuLy8gUmV0dXJuOlxuLy8gICAgbGlzdCBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIG9cbmZ1bmN0aW9uIG9iajJhcnJheShvLCBuYW1lQXR0cil7XG4gICAgdmFyIGtzID0gT2JqZWN0LmtleXMobyk7XG4gICAga3Muc29ydCgpO1xuICAgIHJldHVybiBrcy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG5hbWVBdHRyKSBvW2tdLm5hbWUgPSBrO1xuICAgICAgICByZXR1cm4gb1trXTtcbiAgICB9KTtcbn07XG5cbi8vIEFkZCBkaXJlY3QgY3Jvc3MgcmVmZXJlbmNlcyB0byBuYW1lZCB0eXBlcy4gKEUuZy4sIHdoZXJlIHRoZVxuLy8gbW9kZWwgc2F5cyB0aGF0IEdlbmUuYWxsZWxlcyBpcyBhIGNvbGxlY3Rpb24gd2hvc2UgcmVmZXJlbmNlZFR5cGVcbi8vIGlzIHRoZSBzdHJpbmcgXCJBbGxlbGVcIiwgYWRkIGEgZGlyZWN0IHJlZmVyZW5jZSB0byB0aGUgQWxsZWxlIGNsYXNzKVxuLy8gQWxzbyBhZGRzIGFycmF5cyBmb3IgY29udmVuaWVuY2UgZm9yIGFjY2Vzc2luZyBhbGwgY2xhc3NlcyBvciBhbGwgYXR0cmlidXRlcyBvZiBhIGNsYXNzLlxuLy9cbmZ1bmN0aW9uIGNvbXBpbGVNb2RlbChtb2RlbCl7XG4gICAgLy8gRmlyc3QgYWRkIGNsYXNzZXMgdGhhdCByZXByZXNlbnQgdGhlIGJhc2ljIHR5cGVcbiAgICBMRUFGVFlQRVMuZm9yRWFjaChmdW5jdGlvbihuKXtcbiAgICAgICAgbW9kZWwuY2xhc3Nlc1tuXSA9IHtcbiAgICAgICAgICAgIGlzTGVhZlR5cGU6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiBuLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IG4sXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXSxcbiAgICAgICAgICAgIHJlZmVyZW5jZXM6IFtdLFxuICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vXG4gICAgbW9kZWwuYWxsQ2xhc3NlcyA9IG9iajJhcnJheShtb2RlbC5jbGFzc2VzKVxuICAgIHZhciBjbnMgPSBPYmplY3Qua2V5cyhtb2RlbC5jbGFzc2VzKTtcbiAgICBjbnMuc29ydCgpXG4gICAgY25zLmZvckVhY2goZnVuY3Rpb24oY24pe1xuICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzID0gb2JqMmFycmF5KGNscy5hdHRyaWJ1dGVzKVxuICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcyA9IG9iajJhcnJheShjbHMucmVmZXJlbmNlcylcbiAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJhdHRyaWJ1dGVcIjsgfSk7XG4gICAgICAgIGNscy5hbGxSZWZlcmVuY2VzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwicmVmZXJlbmNlXCI7IH0pO1xuICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICBjbHMuYWxsUGFydHMgPSBjbHMuYWxsQXR0cmlidXRlcy5jb25jYXQoY2xzLmFsbFJlZmVyZW5jZXMpLmNvbmNhdChjbHMuYWxsQ29sbGVjdGlvbnMpO1xuICAgICAgICBjbHMuYWxsUGFydHMuc29ydChmdW5jdGlvbihhLGIpeyByZXR1cm4gYS5uYW1lIDwgYi5uYW1lID8gLTEgOiBhLm5hbWUgPiBiLm5hbWUgPyAxIDogMDsgfSk7XG4gICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAvL1xuICAgICAgICBjbHNbXCJleHRlbmRzXCJdID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICB2YXIgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgaWYgKGJjLmV4dGVuZGVkQnkpIHtcbiAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5LnB1c2goY2xzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkgPSBbY2xzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiYztcbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIE9iamVjdC5rZXlzKGNscy5yZWZlcmVuY2VzKS5mb3JFYWNoKGZ1bmN0aW9uKHJuKXtcbiAgICAgICAgICAgIHZhciByID0gY2xzLnJlZmVyZW5jZXNbcm5dO1xuICAgICAgICAgICAgci50eXBlID0gbW9kZWwuY2xhc3Nlc1tyLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgIHZhciBjID0gY2xzLmNvbGxlY3Rpb25zW2NuXTtcbiAgICAgICAgICAgIGMudHlwZSA9IG1vZGVsLmNsYXNzZXNbYy5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1vZGVsO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1cGVyY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoXG4vLyBUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHNbXCJleHRlbmRzXCJdIHx8IGNsc1tcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgYW5jID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3VwZXJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNsc1tcImV4dGVuZHNcIl0uY29uY2F0KGFuYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1YmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdWJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHMuZXh0ZW5kZWRCeSB8fCBjbHMuZXh0ZW5kZWRCeS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBkZXNjID0gY2xzLmV4dGVuZGVkQnkubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1YmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzLmV4dGVuZGVkQnkuY29uY2F0KGRlc2MucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiBzdWIgaXMgYSBzdWJjbGFzcyBvZiBzdXAuXG5mdW5jdGlvbiBpc1N1YmNsYXNzKHN1YixzdXApIHtcbiAgICBpZiAoc3ViID09PSBzdXApIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2Yoc3ViKSA9PT0gXCJzdHJpbmdcIiB8fCAhc3ViW1wiZXh0ZW5kc1wiXSB8fCBzdWJbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHIgPSBzdWJbXCJleHRlbmRzXCJdLmZpbHRlcihmdW5jdGlvbih4KXsgcmV0dXJuIHg9PT1zdXAgfHwgaXNTdWJjbGFzcyh4LCBzdXApOyB9KTtcbiAgICByZXR1cm4gci5sZW5ndGggPiAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBsaXN0IGlzIHZhbGlkIGFzIGEgbGlzdCBjb25zdHJhaW50IG9wdGlvbiBmb3Jcbi8vIHRoZSBub2RlIG4uIEEgbGlzdCBpcyB2YWxpZCB0byB1c2UgaW4gYSBsaXN0IGNvbnN0cmFpbnQgYXQgbm9kZSBuIGlmZlxuLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGVxdWFsIHRvIG9yIGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlXG4vLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgYSBzdXBlcmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZS4gSW4gdGhpcyBjYXNlLFxuLy8gICAgICAgZWxlbWVudHMgaW4gdGhlIGxpc3QgdGhhdCBhcmUgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgbm9kZSdzIHR5cGVcbi8vICAgICAgIGFyZSBhdXRvbWF0aWNhbGx5IGZpbHRlcmVkIG91dC5cbmZ1bmN0aW9uIGlzVmFsaWRMaXN0Q29uc3RyYWludChsaXN0LCBuKXtcbiAgICB2YXIgbnQgPSBuLnN1YnR5cGVDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgaWYgKHR5cGVvZihudCkgPT09IFwic3RyaW5nXCIgKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGx0ID0gY3Vyck1pbmUubW9kZWwuY2xhc3Nlc1tsaXN0LnR5cGVdO1xuICAgIHJldHVybiBpc1N1YmNsYXNzKGx0LCBudCkgfHwgaXNTdWJjbGFzcyhudCwgbHQpO1xufVxuXG4vLyBDb21waWxlcyBhIFwicmF3XCIgdGVtcGxhdGUgLSBzdWNoIGFzIG9uZSByZXR1cm5lZCBieSB0aGUgL3RlbXBsYXRlcyB3ZWIgc2VydmljZSAtIGFnYWluc3Rcbi8vIGEgbW9kZWwuIFRoZSBtb2RlbCBzaG91bGQgaGF2ZSBiZWVuIHByZXZpb3VzbHkgY29tcGlsZWQuXG4vLyBBcmdzOlxuLy8gICB0ZW1wbGF0ZSAtIGEgdGVtcGxhdGUgcXVlcnkgYXMgYSBqc29uIG9iamVjdFxuLy8gICBtb2RlbCAtIHRoZSBtaW5lJ3MgbW9kZWwsIGFscmVhZHkgY29tcGlsZWQgKHNlZSBjb21waWxlTW9kZWwpLlxuLy8gUmV0dXJuczpcbi8vICAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICBDcmVhdGVzIGEgdHJlZSBvZiBxdWVyeSBub2RlcyAoc3VpdGFibGUgZm9yIGRyYXdpbmcgYnkgZDMsIEJUVykuXG4vLyAgIEFkZHMgdGhpcyB0cmVlIHRvIHRoZSB0ZW1wbGF0ZSBvYmplY3QgYXMgYXR0cmlidXRlICdxdHJlZScuXG4vLyAgIFR1cm5zIGVhY2ggKHN0cmluZykgcGF0aCBpbnRvIGEgcmVmZXJlbmNlIHRvIGEgdHJlZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhhdCBwYXRoLlxuZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlLCBtb2RlbCkge1xuICAgIHZhciByb290cyA9IFtdXG4gICAgdmFyIHQgPSB0ZW1wbGF0ZTtcbiAgICAvLyB0aGUgdHJlZSBvZiBub2RlcyByZXByZXNlbnRpbmcgdGhlIGNvbXBpbGVkIHF1ZXJ5IHdpbGwgZ28gaGVyZVxuICAgIHQucXRyZWUgPSBudWxsO1xuICAgIC8vIGluZGV4IG9mIGNvZGUgdG8gY29uc3RyYWludCBnb3JzIGhlcmUuXG4gICAgdC5jb2RlMmMgPSB7fVxuICAgIC8vIG5vcm1hbGl6ZSB0aGluZ3MgdGhhdCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgdC5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgdC5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAvL1xuICAgIHZhciBzdWJjbGFzc0NzID0gW107XG4gICAgdC53aGVyZSAmJiB0LndoZXJlLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgIGlmIChjLnR5cGUpIHtcbiAgICAgICAgICAgIGMub3AgPSBcIklTQVwiXG4gICAgICAgICAgICBzdWJjbGFzc0NzLnB1c2goYyk7XG4gICAgICAgIH1cbiAgICAgICAgYy5jdHlwZSA9IE9QSU5ERVhbYy5vcF0uY3R5cGU7XG4gICAgICAgIGlmIChjLmNvZGUpIHQuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICAgICAgLy8gV2l0aCBudWxsL25vdC1udWxsIGNvbnN0cmFpbnRzLCBJTSBoYXMgYSB3ZWlyZCBxdWlyayBvZiBmaWxsaW5nIHRoZSB2YWx1ZSBcbiAgICAgICAgICAgIC8vIGZpZWxkIHdpdGggdGhlIG9wZXJhdG9yLiBFLmcuLCBmb3IgYW4gXCJJUyBOT1QgTlVMTFwiIG9wcmVhdG9yLCB0aGUgdmFsdWUgZmllbGQgaXNcbiAgICAgICAgICAgIC8vIGFsc28gXCJJUyBOT1QgTlVMTFwiLiBcbiAgICAgICAgICAgIC8vIFxuICAgICAgICAgICAgYy52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgLy8gVE9ETzogZGVhbCB3aXRoIGV4dHJhVmFsdWUgaGVyZSAoPylcbiAgICAgICAgfVxuICAgIH0pXG4gICAgLy8gbXVzdCBwcm9jZXNzIGFueSBzdWJjbGFzcyBjb25zdHJhaW50cyBmaXJzdCwgZnJvbSBzaG9ydGVzdCB0byBsb25nZXN0IHBhdGhcbiAgICBzdWJjbGFzc0NzXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wYXRoLmxlbmd0aCAtIGIucGF0aC5sZW5ndGg7XG4gICAgICAgIH0pXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBjLnBhdGgsIG1vZGVsKTtcbiAgICAgICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjLnR5cGVdO1xuICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICB9KTtcbiAgICAvL1xuICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgYy5wYXRoLCBtb2RlbCk7XG4gICAgICAgIGlmIChuLmNvbnN0cmFpbnRzKVxuICAgICAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKGMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMgPSBbY107XG4gICAgfSlcblxuICAgIC8vXG4gICAgdC5zZWxlY3QgJiYgdC5zZWxlY3QuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgcCwgbW9kZWwpO1xuICAgICAgICBuLnNlbGVjdCgpO1xuICAgIH0pXG4gICAgdC5qb2lucyAmJiB0LmpvaW5zLmZvckVhY2goZnVuY3Rpb24oail7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBqLCBtb2RlbCk7XG4gICAgICAgIG4uam9pbiA9IFwib3V0ZXJcIjtcbiAgICB9KVxuICAgIHQub3JkZXJCeSAmJiB0Lm9yZGVyQnkuZm9yRWFjaChmdW5jdGlvbihvLCBpKXtcbiAgICAgICAgdmFyIHAgPSBPYmplY3Qua2V5cyhvKVswXVxuICAgICAgICB2YXIgZGlyID0gb1twXVxuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgcCwgbW9kZWwpO1xuICAgICAgICBuLnNvcnQgPSB7IGRpcjogZGlyLCBsZXZlbDogaSB9O1xuICAgIH0pO1xuICAgIGlmICghdC5xdHJlZSkge1xuICAgICAgICB0aHJvdyBcIk5vIHBhdGhzIGluIHF1ZXJ5LlwiXG4gICAgfVxuICAgIHJldHVybiB0O1xufVxuXG4vLyBUdXJucyBhIHF0cmVlIHN0cnVjdHVyZSBiYWNrIGludG8gYSBcInJhd1wiIHRlbXBsYXRlLiBcbi8vXG5mdW5jdGlvbiB1bmNvbXBpbGVUZW1wbGF0ZSh0bXBsdCl7XG4gICAgdmFyIHQgPSB7XG4gICAgICAgIG5hbWU6IHRtcGx0Lm5hbWUsXG4gICAgICAgIHRpdGxlOiB0bXBsdC50aXRsZSxcbiAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICBjb21tZW50OiB0bXBsdC5jb21tZW50LFxuICAgICAgICByYW5rOiB0bXBsdC5yYW5rLFxuICAgICAgICBtb2RlbDogZGVlcGModG1wbHQubW9kZWwpLFxuICAgICAgICB0YWdzOiBkZWVwYyh0bXBsdC50YWdzKSxcbiAgICAgICAgc2VsZWN0IDogdG1wbHQuc2VsZWN0LmNvbmNhdCgpLFxuICAgICAgICB3aGVyZSA6IFtdLFxuICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICBjb25zdHJhaW50TG9naWM6IHRtcGx0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiLFxuICAgICAgICBvcmRlckJ5IDogW11cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVhY2gobil7XG4gICAgICAgIHZhciBwID0gbi5wYXRoXG4gICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHBhdGggc2hvdWxkIGFscmVhZHkgYmUgdGhlcmVcbiAgICAgICAgICAgIGlmICh0LnNlbGVjdC5pbmRleE9mKG4ucGF0aCkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgfVxuICAgICAgICAobi5jb25zdHJhaW50cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICB0LndoZXJlLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChuLmpvaW4gPT09IFwib3V0ZXJcIikge1xuICAgICAgICAgICAgdC5qb2lucy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgIGxldCBzID0ge31cbiAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyO1xuICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICB9XG4gICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZWFjaCk7XG4gICAgfVxuXG4gICAgcmVhY2godG1wbHQucXRyZWUpO1xuICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICByZXR1cm4gdFxufVxuXG4vL1xuY2xhc3MgTm9kZSB7XG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHRlbXBsYXRlIChUZW1wbGF0ZSBvYmplY3QpIHRoZSB0ZW1wbGF0ZSB0aGF0IG93bnMgdGhpcyBub2RlXG4gICAgLy8gICBwYXJlbnQgKG9iamVjdCkgUGFyZW50IG9mIHRoZSBuZXcgbm9kZS5cbiAgICAvLyAgIG5hbWUgKHN0cmluZykgTmFtZSBmb3IgdGhlIG5vZGVcbiAgICAvLyAgIHBjb21wIChvYmplY3QpIFBhdGggY29tcG9uZW50IGZvciB0aGUgcm9vdCwgdGhpcyBpcyBhIGNsYXNzLiBGb3Igb3RoZXIgbm9kZXMsIGFuIGF0dHJpYnV0ZSwgXG4gICAgLy8gICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24gZGVjcmlwdG9yLlxuICAgIC8vICAgcHR5cGUgKG9iamVjdCBvciBzdHJpbmcpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHNpbXBsZSBhdHRyaWJ1dGVzLCB0aGlzIGlzIGEgc3RyaW5nLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWwuIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnBhdGg7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy9cbiAgICBnZXQgcGF0aCAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoICtcIi5cIiA6IFwiXCIpICsgdGhpcy5uYW1lO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBub2RlVHlwZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCB8fCB0aGlzLnB0eXBlO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc0Jpb0VudGl0eSAoKSB7XG4gICAgICAgIGxldCBiZSA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbXCJCaW9FbnRpdHlcIl07XG4gICAgICAgIGxldCBudCA9IHRoaXMubm9kZVR5cGU7XG4gICAgICAgIHJldHVybiBpc1N1YmNsYXNzKG50LCBiZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyAhPT0gbnVsbCAmJiB0aGlzLnZpZXcgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICB0aGlzLnZpZXcgPSBpID49IDAgPyBpIDogKHQuc2VsZWN0LnB1c2gocCkgLSAxKTtcbiAgICB9XG4gICAgdW5zZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwYXRoIGZyb20gdGhlIHNlbGVjdCBsaXN0XG4gICAgICAgICAgICB0LnNlbGVjdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW51bWJlciBub2RlcyBoZXJlXG4gICAgICAgICAgICB0LnNlbGVjdC5zbGljZShpKS5mb3JFYWNoKCAocCxqKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSBnZXROb2RlQnlQYXRoKHRoaXMudGVtcGxhdGUsIHApO1xuICAgICAgICAgICAgICAgIG4udmlldyAtPSAxO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMubW9kZWwgPSB7IG5hbWU6IFwiZ2Vub21pY1wiIH07XG4gICAgICAgIHRoaXMubmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMudGl0bGUgPSBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb21tZW50ID0gXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSBbXTtcbiAgICAgICAgdGhpcy53aGVyZSA9IFtdO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IFwiXCI7XG4gICAgICAgIHRoaXMudGFncyA9IFtdO1xuICAgICAgICB0aGlzLm9yZGVyQnkgPSBbXTtcbiAgICB9XG5cbn1cbmZ1bmN0aW9uIGdldE5vZGVCeVBhdGggKHQscCkge1xuICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgIGlmICghcCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgbiA9IHQucXRyZWU7XG4gICAgICAgIGlmIChuLm5hbWUgIT09IHBhcnRzWzBdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY25hbWUgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGxldCBjID0gKG4uY2hpbGRyZW4gfHwgW10pLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gY25hbWUpWzBdO1xuICAgICAgICAgICAgaWYgKCFjKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIG4gPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuY2xhc3MgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKG4sIHQpIHtcbiAgICAgICAgLy8gb25lIG9mOiBudWxsLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgc3ViY2xhc3MsIGxvb2t1cCwgbGlzdFxuICAgICAgICB0aGlzLmN0eXBlID0gbi5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiID8gXCJ2YWx1ZVwiIDogXCJsb29rdXBcIjtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzICh3ZSBzZXQgaXQgdG8gXCJJU0FcIilcbiAgICAgICAgdGhpcy5vcCA9IHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIiA/IFwiPVwiIDogXCJMT09LVVBcIjtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMuY29kZSA9IG5leHRBdmFpbGFibGVDb2RlKHQpO1xuICAgICAgICAvLyBhbGwgY29uc3RyYWludHMgaGF2ZSB0aGlzXG4gICAgICAgIHRoaXMucGF0aCA9IG4ucGF0aDtcbiAgICAgICAgLy8gdXNlZCBieSB2YWx1ZSwgbGlzdFxuICAgICAgICB0aGlzLnZhbHVlID0gXCJcIjtcbiAgICAgICAgLy8gdXNlZCBieSBMT09LVVAgb24gQmlvRW50aXR5IGFuZCBzdWJjbGFzc2VzXG4gICAgICAgIHRoaXMuZXh0cmFWYWx1ZSA9IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgbXVsdGl2YWx1ZSBhbmQgcmFuZ2UgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHN1YmNsYXNzIGNvbnRyYWludHNcbiAgICAgICAgdGhpcy50eXBlID0gbnVsbDtcbiAgICB9XG59XG5cbi8vIEFkZHMgYSBwYXRoIHRvIHRoZSBjdXJyZW50IGRpYWdyYW0uIFBhdGggaXMgc3BlY2lmaWVkIGFzIGEgZG90dGVkIGxpc3Qgb2YgbmFtZXMuXG4vLyBBcmdzOlxuLy8gICB0ZW1wbGF0ZSAob2JqZWN0KSB0aGUgdGVtcGxhdGVcbi8vICAgcGF0aCAoc3RyaW5nKSB0aGUgcGF0aCB0byBhZGQuIFxuLy8gICBtb2RlbCBvYmplY3QgQ29tcGlsZWQgZGF0YSBtb2RlbC5cbi8vIFJldHVybnM6XG4vLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC4gXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIENyZWF0ZXMgbmV3IG5vZGVzIGFzIG5lZWRlZCBhbmQgYWRkcyB0aGVtIHRvIHRoZSBxdHJlZS5cbmZ1bmN0aW9uIGFkZFBhdGgodGVtcGxhdGUsIHBhdGgsIG1vZGVsKXtcbiAgICBpZiAodHlwZW9mKHBhdGgpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgdmFyIGNsYXNzZXMgPSBtb2RlbC5jbGFzc2VzO1xuICAgIHZhciBsYXN0dCA9IG51bGxcbiAgICB2YXIgbiA9IHRlbXBsYXRlLnF0cmVlOyAgLy8gY3VycmVudCBub2RlIHBvaW50ZXJcblxuICAgIGZ1bmN0aW9uIGZpbmQobGlzdCwgbil7XG4gICAgICAgICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHgubmFtZSA9PT0gbn0pWzBdXG4gICAgfVxuXG4gICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uKHAsIGkpe1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlLnF0cmVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgcm9vdCBhbHJlYWR5IGV4aXN0cywgbWFrZSBzdXJlIG5ldyBwYXRoIGhhcyBzYW1lIHJvb3QuXG4gICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgIGlmIChwICE9PSBuLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2Fubm90IGFkZCBwYXRoIGZyb20gZGlmZmVyZW50IHJvb3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCBwYXRoIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICBpZiAoIWNscylcbiAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzOiBcIiArIHA7XG4gICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gbiBpcyBwb2ludGluZyB0byB0aGUgcGFyZW50LCBhbmQgcCBpcyB0aGUgbmV4dCBuYW1lIGluIHRoZSBwYXRoLlxuICAgICAgICAgICAgdmFyIG5uID0gZmluZChuLmNoaWxkcmVuLCBwKTtcbiAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgIC8vIHAgaXMgYWxyZWFkeSBhIGNoaWxkXG4gICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBhZGQgYSBuZXcgbm9kZSBmb3IgcFxuICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgIHZhciB4O1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlO1xuICAgICAgICAgICAgICAgIGlmIChjbHMuYXR0cmlidXRlc1twXSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IHgudHlwZSAvLyA8LS0gQSBzdHJpbmchXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXTtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1t4LnJlZmVyZW5jZWRUeXBlXSAvLyA8LS1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIG1lbWJlciBuYW1lZCBcIiArIHAgKyBcIiBpbiBjbGFzcyBcIiArIGNscy5uYW1lICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSwgYWRkIGl0IHRvIG4ncyBjaGlsZHJlblxuICAgICAgICAgICAgICAgIG5uID0gbmV3IE5vZGUodGVtcGxhdGUsIG4sIHAsIHgsIGNscyk7XG4gICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIHJldHVybiB0aGUgbGFzdCBub2RlIGluIHRoZSBwYXRoXG4gICAgcmV0dXJuIG47XG59XG5cblxuLy8gQXJnczpcbi8vICAgbiAobm9kZSkgVGhlIG5vZGUgaGF2aW5nIHRoZSBjb25zdHJhaW50LlxuLy8gICBzY05hbWUgKHR5cGUpIE5hbWUgb2Ygc3ViY2xhc3MuXG5mdW5jdGlvbiBzZXRTdWJjbGFzc0NvbnN0cmFpbnQobiwgc2NOYW1lKXtcbiAgICAvLyByZW1vdmUgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24gKGMpeyByZXR1cm4gYy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiOyB9KTtcbiAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7XG4gICAgaWYgKHNjTmFtZSl7XG4gICAgICAgIGxldCBjbHMgPSBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW3NjTmFtZV07XG4gICAgICAgIGlmKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBzY05hbWU7XG4gICAgICAgIG4uY29uc3RyYWludHMucHVzaCh7IGN0eXBlOlwic3ViY2xhc3NcIiwgb3A6XCJJU0FcIiwgcGF0aDpuLnBhdGgsIHR5cGU6Y2xzLm5hbWUgfSk7XG4gICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjaGVjayhub2RlLCByZW1vdmVkKSB7XG4gICAgICAgIHZhciBjbHMgPSBub2RlLnN1YmNsYXNzQ29uc3RyYWludCB8fCBub2RlLnB0eXBlO1xuICAgICAgICB2YXIgYzIgPSBbXTtcbiAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgaWYoYy5uYW1lIGluIGNscy5hdHRyaWJ1dGVzIHx8IGMubmFtZSBpbiBjbHMucmVmZXJlbmNlcyB8fCBjLm5hbWUgaW4gY2xzLmNvbGxlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgYzIucHVzaChjKTtcbiAgICAgICAgICAgICAgICBjaGVjayhjLCByZW1vdmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goYyk7XG4gICAgICAgIH0pXG4gICAgICAgIG5vZGUuY2hpbGRyZW4gPSBjMjtcbiAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XG4gICAgfVxuICAgIHZhciByZW1vdmVkID0gY2hlY2sobixbXSk7XG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShuKTtcbiAgICBpZihyZW1vdmVkLmxlbmd0aCA+IDApXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBhbGVydChcIkNvbnN0cmFpbmluZyB0byBzdWJjbGFzcyBcIiArIChzY05hbWUgfHwgbi5wdHlwZS5uYW1lKVxuICAgICAgICAgICAgKyBcIiBjYXVzZWQgdGhlIGZvbGxvd2luZyBwYXRocyB0byBiZSByZW1vdmVkOiBcIiBcbiAgICAgICAgICAgICsgcmVtb3ZlZC5tYXAobiA9PiBuLnBhdGgpLmpvaW4oXCIsIFwiKSk7IFxuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG59XG5cbi8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbi8vXG5mdW5jdGlvbiByZW1vdmVOb2RlKG4pIHtcbiAgICAvLyBGaXJzdCwgcmVtb3ZlIGFsbCBjb25zdHJhaW50cyBvbiBuIG9yIGl0cyBkZXNjZW5kYW50c1xuICAgIGZ1bmN0aW9uIHJtYyAoeCkge1xuICAgICAgICB4LnVuc2VsZWN0KCk7XG4gICAgICAgIHguY29uc3RyYWludHMuZm9yRWFjaChjID0+IHJlbW92ZUNvbnN0cmFpbnQoeCxjKSk7XG4gICAgICAgIHguY2hpbGRyZW4uZm9yRWFjaChybWMpO1xuICAgIH1cbiAgICBybWMobik7XG4gICAgLy8gTm93IHJlbW92ZSB0aGUgc3VidHJlZSBhdCBuLlxuICAgIHZhciBwID0gbi5wYXJlbnQ7XG4gICAgaWYgKHApIHtcbiAgICAgICAgcC5jaGlsZHJlbi5zcGxpY2UocC5jaGlsZHJlbi5pbmRleE9mKG4pLCAxKTtcbiAgICAgICAgaGlkZURpYWxvZygpO1xuICAgICAgICB1cGRhdGUocCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoaWRlRGlhbG9nKClcbiAgICB9XG4gICAgLy9cbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIHRlbXBsYXRlIGZyb20gdGhlIGxpc3QuXG4vLyBHZXRzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjdXJyZW50IG1pbmUgYW5kIGJ1aWxkcyBhIHNldCBvZiBub2Rlc1xuLy8gZm9yIGQzIHRyZWUgZGlzcGxheS5cbi8vXG5mdW5jdGlvbiBlZGl0VGVtcGxhdGUgKHQsIG5vc2F2ZSkge1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWRpdG9yIHdvcmtzIG9uIGEgY29weSBvZiB0aGUgdGVtcGxhdGUuXG4gICAgLy9cbiAgICBjdXJyVGVtcGxhdGUgPSBkZWVwYyh0KTtcbiAgICAvL1xuICAgIHJvb3QgPSBjb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlLCBjdXJyTWluZS5tb2RlbCkucXRyZWVcbiAgICByb290LngwID0gMDtcbiAgICByb290LnkwID0gaCAvIDI7XG5cbiAgICBpZiAoISBub3NhdmUpIHNhdmVTdGF0ZSgpO1xuXG4gICAgLy8gRmlsbCBpbiB0aGUgYmFzaWMgdGVtcGxhdGUgaW5mb3JtYXRpb24gKG5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbiwgZXRjLilcbiAgICAvL1xuICAgIHZhciB0aSA9IGQzLnNlbGVjdChcIiN0SW5mb1wiKTtcbiAgICB2YXIgeGZlciA9IGZ1bmN0aW9uKG5hbWUsIGVsdCl7IGN1cnJUZW1wbGF0ZVtuYW1lXSA9IGVsdC52YWx1ZTsgdXBkYXRlVHRleHQoKTsgfTtcbiAgICAvLyBOYW1lICh0aGUgaW50ZXJuYWwgdW5pcXVlIG5hbWUpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cIm5hbWVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS5uYW1lKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcIm5hbWVcIiwgdGhpcykgfSk7XG4gICAgLy8gVGl0bGUgKHdoYXQgdGhlIHVzZXIgc2VlcylcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwidGl0bGVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS50aXRsZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBEZXNjcmlwdGlvbiAod2hhdCBpdCBkb2VzIC0gYSBsaXR0bGUgZG9jdW1lbnRhdGlvbikuXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmRlc2NyaXB0aW9uKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImRlc2NyaXB0aW9uXCIsIHRoaXMpIH0pO1xuICAgIC8vIENvbW1lbnQgLSBmb3Igd2hhdGV2ZXIsIEkgZ3Vlc3MuIFxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJjb21tZW50XCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmNvbW1lbnQpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiY29tbWVudFwiLCB0aGlzKSB9KTtcblxuICAgIC8vIExvZ2ljIGV4cHJlc3Npb24gLSB3aGljaCB0aWVzIHRoZSBpbmRpdmlkdWFsIGNvbnN0cmFpbnRzIHRvZ2V0aGVyXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBzZXRMb2dpY0V4cHJlc3Npb24oY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYywgY3VyclRlbXBsYXRlKSB9KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBzZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSwgY3VyclRlbXBsYXRlKTtcbiAgICAgICAgICAgIHhmZXIoXCJjb25zdHJhaW50TG9naWNcIiwgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAvL1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICB1cGRhdGUocm9vdCk7XG59XG5cbi8vIFNldCB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4vLyBJbiB0aGUgcHJvY2VzcywgYWxzbyBcImNvcnJlY3RzXCIgdGhlIGV4cHJlc3Npb24gYXMgZm9sbG93czpcbi8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbi8vICAgICAgYW55IGNvbnN0cmFpbnQgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUgYXJlIHJlbW92ZWQgYW5kIHRoZVxuLy8gICAgICBleHByZXNzaW9uIGxvZ2ljIHVwZGF0ZWQgYWNjb3JkaW5nbHlcbi8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbi8vICAgICAgYXJlIEFORGVkIHRvIHRoZSBlbmQuXG4vLyBGb3IgZXhhbXBsZSwgaWYgdGhlIGN1cnJlbnQgdGVtcGxhdGUgaGFzIGNvZGVzIEEsIEIsIGFuZCBDLCBhbmRcbi8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4vLyBhZGRlZCwgcmVzdWx0aW5nIGluIFwiQSBhbmQgQiBhbmQgQ1wiLiBcbi8vIEFyZ3M6XG4vLyAgIGV4IChzdHJpbmcpIHRoZSBleHByZXNzaW9uXG4vLyAgIHRtcGx0IChvYmopIHRoZSB0ZW1wbGF0ZVxuLy8gUmV0dXJuczpcbi8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuLy8gICBcbmZ1bmN0aW9uIHNldExvZ2ljRXhwcmVzc2lvbihleCwgdG1wbHQpe1xuICAgIHZhciBhc3Q7IC8vIGFic3RyYWN0IHN5bnRheCB0cmVlXG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmdW5jdGlvbiByZWFjaChuLGxldil7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09IFwic3RyaW5nXCIgKXtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuIElmIG5vdCwgcmVtb3ZlIGl0IGZyb20gdGhlIGV4cHIuXG4gICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICByZXR1cm4gKG4gaW4gdG1wbHQuY29kZTJjID8gbiA6IFwiXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgIHZhciBjbXNzID0gY21zLmpvaW4oXCIgXCIrbi5vcCtcIiBcIik7XG4gICAgICAgIHJldHVybiBjbXMubGVuZ3RoID09PSAwID8gXCJcIiA6IGxldiA9PT0gMCB8fCBjbXMubGVuZ3RoID09PSAxID8gY21zcyA6IFwiKFwiICsgY21zcyArIFwiKVwiXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGFzdCA9IGV4ID8gcGFyc2VyLnBhcnNlKGV4KSA6IG51bGw7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgYWxlcnQoZXJyKTtcbiAgICAgICAgcmV0dXJuIHRtcGx0LmNvbnN0cmFpbnRMb2dpYztcbiAgICB9XG4gICAgLy9cbiAgICB2YXIgbGV4ID0gYXN0ID8gcmVhY2goYXN0LDApIDogXCJcIjtcbiAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAvLyBBTkQgdGhlbSBpbnRvIHRoZSBleHByZXNzaW9uIChleGNlcHQgSVNBIGNvbnN0cmFpbnRzKS5cbiAgICB2YXIgdG9BZGQgPSBPYmplY3Qua2V5cyh0bXBsdC5jb2RlMmMpLmZpbHRlcihmdW5jdGlvbihjKXtcbiAgICAgICAgcmV0dXJuIHNlZW4uaW5kZXhPZihjKSA9PT0gLTEgJiYgYy5vcCAhPT0gXCJJU0FcIjtcbiAgICAgICAgfSk7XG4gICAgaWYgKHRvQWRkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGlmKGFzdCAmJiBhc3Qub3AgJiYgYXN0Lm9wID09PSBcIm9yXCIpXG4gICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgIGlmIChsZXgpIHRvQWRkLnVuc2hpZnQobGV4KTtcbiAgICAgICAgIGxleCA9IHRvQWRkLmpvaW4oXCIgYW5kIFwiKTtcbiAgICB9XG4gICAgLy9cbiAgICB0bXBsdC5jb25zdHJhaW50TG9naWMgPSBsZXg7XG5cbiAgICBkMy5zZWxlY3QoJyN0SW5mbyBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBsZXg7IH0pO1xuXG4gICAgcmV0dXJuIGxleDtcbn1cblxuLy8gRXh0ZW5kcyB0aGUgcGF0aCBmcm9tIGN1cnJOb2RlIHRvIHBcbi8vIEFyZ3M6XG4vLyAgIGN1cnJOb2RlIChub2RlKSBOb2RlIHRvIGV4dGVuZCBmcm9tXG4vLyAgIG1vZGUgKHN0cmluZykgb25lIG9mIFwic2VsZWN0XCIsIFwiY29uc3RyYWluXCIgb3IgXCJvcGVuXCJcbi8vICAgcCAoc3RyaW5nKSBOYW1lIG9mIGFuIGF0dHJpYnV0ZSwgcmVmLCBvciBjb2xsZWN0aW9uXG4vLyBSZXR1cm5zOlxuLy8gICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIElmIHRoZSBzZWxlY3RlZCBpdGVtIGlzIG5vdCBhbHJlYWR5IGluIHRoZSBkaXNwbGF5LCBpdCBlbnRlcnNcbi8vICAgYXMgYSBuZXcgY2hpbGQgKGdyb3dpbmcgb3V0IGZyb20gdGhlIHBhcmVudCBub2RlLlxuLy8gICBUaGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkIG9uIHRoZSBjaGlsZCBub2RlLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK3NlbGVjdFwiIGJ1dHRvbiwgdGhlIGNoaWxkIGlzIHNlbGVjdGVkLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK2NvbnN0cmFpblwiIGJ1dHRvbiwgYSBuZXcgY29uc3RyYWludCBpcyBhZGRlZCB0byB0aGVcbi8vICAgY2hpbGQsIGFuZCB0aGUgY29uc3RyYWludCBlZGl0b3Igb3BlbmVkICBvbiB0aGF0IGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gc2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBtb2RlLCBwKXtcbiAgICBsZXQgbjtcbiAgICBsZXQgY2M7XG4gICAgbGV0IHNmcztcbiAgICBpZiAobW9kZSA9PT0gXCJzdW1tYXJ5ZmllbGRzXCIpIHtcbiAgICAgICAgc2ZzID0gY3Vyck1pbmUuc3VtbWFyeUZpZWxkc1tjdXJyTm9kZS5ub2RlVHlwZS5uYW1lXXx8W107XG4gICAgICAgIHNmcy5mb3JFYWNoKGZ1bmN0aW9uKHNmLCBpKXtcbiAgICAgICAgICAgIHNmID0gc2YucmVwbGFjZSgvXlteLl0rLywgY3Vyck5vZGUucGF0aCk7XG4gICAgICAgICAgICBsZXQgbSA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBzZiwgY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbS5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwID0gY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgbiA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBwLCBjdXJyTWluZS5tb2RlbCApO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJzZWxlY3RlZFwiKVxuICAgICAgICAgICAgIW4uaXNTZWxlY3RlZCAmJiBuLnNlbGVjdCgpO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJjb25zdHJhaW5lZFwiKSB7XG4gICAgICAgICAgICBjYyA9IGFkZENvbnN0cmFpbnQobiwgZmFsc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgaWYgKG1vZGUgIT09IFwib3BlblwiKVxuICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICBpZiAobW9kZSAhPT0gXCJzdW1tYXJ5ZmllbGRzXCIpIFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzaG93RGlhbG9nKG4pO1xuICAgICAgICAgICAgY2MgJiYgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVkaXRDb25zdHJhaW50KGNjLCBuKVxuICAgICAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgXG59XG4vLyBSZXR1cm5zIGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBhIGNvbnN0cmFpbnRcbi8vXG5mdW5jdGlvbiBjb25zdHJhaW50VGV4dChjKSB7XG4gICB2YXIgdCA9IFwiP1wiO1xuICAgaWYgKCFjKSByZXR1cm4gdDtcbiAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpe1xuICAgICAgIHQgPSBcIklTQSBcIiArIChjLnR5cGUgfHwgXCI/XCIpO1xuICAgfVxuICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgIH1cbiAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgICAgICBpZiAoYy5leHRyYVZhbHVlKSB0ID0gdCArIFwiIElOIFwiICsgYy5leHRyYVZhbHVlO1xuICAgfVxuICAgZWxzZSBpZiAoYy52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIChjLm9wLmluY2x1ZGVzKFwiTlVMTFwiKSA/IFwiXCIgOiBcIiBcIiArIGMudmFsdWUpXG4gICB9XG4gICBlbHNlIGlmIChjLnZhbHVlcyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZXNcbiAgIH1cbiAgIHJldHVybiAoYy5jb2RlID8gXCIoXCIrYy5jb2RlK1wiKSBcIiA6IFwiXCIpICsgdDtcbn1cblxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgdmFyIHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vXG5mdW5jdGlvbiBvcFZhbGlkRm9yKG9wLCBuKXtcbiAgICBpZighbi5wYXJlbnQgJiYgIW9wLnZhbGlkRm9yUm9vdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHR5cGVvZihuLnB0eXBlKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgaWYoISBvcC52YWxpZEZvckF0dHIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKG4ucHR5cGUpID09IC0xKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmKG4ucHR5cGUubmFtZSAmJiAhIG9wLnZhbGlkRm9yQ2xhc3MpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUNFaW5wdXRzKGMsIG9wKXtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKS50ZXh0KGMuY29kZSk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbn1cblxuLy8gQXJnczpcbi8vICAgc2VsZWN0b3IgKHN0cmluZykgRm9yIHNlbGVjdGluZyB0aGUgPHNlbGVjdD4gZWxlbWVudFxuLy8gICBkYXRhIChsaXN0KSBEYXRhIHRvIGJpbmQgdG8gb3B0aW9uc1xuLy8gICBjZmcgKG9iamVjdCkgQWRkaXRpb25hbCBvcHRpb25hbCBjb25maWdzOlxuLy8gICAgICAgdGl0bGUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIGZvciBzZXR0aW5nIHRoZSB0ZXh0IG9mIHRoZSBvcHRpb24uIFxuLy8gICAgICAgdmFsdWUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIHNldHRpbmcgdGhlIHZhbHVlIG9mIHRoZSBvcHRpb25cbi8vICAgICAgIHNlbGVjdGVkIC0gZnVuY3Rpb24gb3IgYXJyYXkgb3Igc3RyaW5nIGZvciBkZWNpZGluZyB3aGljaCBvcHRpb24ocykgYXJlIHNlbGVjdGVkXG4vLyAgICAgICAgICBJZiBmdW5jdGlvbiwgY2FsbGVkIGZvciBlYWNoIG9wdGlvbi5cbi8vICAgICAgICAgIElmIGFycmF5LCBzcGVjaWZpZXMgdGhlIHZhbHVlcyB0aGUgc2VsZWN0LlxuLy8gICAgICAgICAgSWYgc3RyaW5nLCBzcGVjaWZpZXMgd2hpY2ggdmFsdWUgaXMgc2VsZWN0ZWRcbi8vICAgICAgIGVtcHR5TWVzc2FnZSAtIGEgbWVzc2FnZSB0byBzaG93IGlmIHRoZSBkYXRhIGxpc3QgaXMgZW1wdHlcbi8vICAgICAgIG11bHRpcGxlIC0gaWYgdHJ1ZSwgbWFrZSBpdCBhIG11bHRpLXNlbGVjdCBsaXN0XG4vL1xuZnVuY3Rpb24gaW5pdE9wdGlvbkxpc3Qoc2VsZWN0b3IsIGRhdGEsIGNmZyl7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgdmFyIGlkZW50ID0gKHg9PngpO1xuICAgIHZhciBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy8gSW5pdGlhbGl6ZXMgdGhlIGlucHV0IGVsZW1lbnRzIGluIHRoZSBjb25zdHJhaW50IGVkaXRvciBmcm9tIHRoZSBnaXZlbiBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIGluaXRDRWlucHV0cyhuLCBjLCBjdHlwZSkge1xuXG4gICAgLy8gUG9wdWxhdGUgdGhlIG9wZXJhdG9yIHNlbGVjdCBsaXN0IHdpdGggb3BzIGFwcHJvcHJpYXRlIGZvciB0aGUgcGF0aFxuICAgIC8vIGF0IHRoaXMgbm9kZS5cbiAgICBpZiAoIWN0eXBlKSBcbiAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJvcFwiXScsIFxuICAgICAgICBPUFMuZmlsdGVyKGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wVmFsaWRGb3Iob3AsIG4pOyB9KSxcbiAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBkID0+IGQub3AsXG4gICAgICAgIHRpdGxlOiBkID0+IGQub3AsXG4gICAgICAgIHNlbGVjdGVkOmMub3BcbiAgICAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIGN0eXBlID0gY3R5cGUgfHwgYy5jdHlwZTtcblxuICAgIGxldCBjZSA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpO1xuICAgIGxldCBzbXpkID0gY2UuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG4gICAgY2UuYXR0cihcImNsYXNzXCIsIFwib3BlbiBcIiArIGN0eXBlKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgc216ZClcbiAgICAgICAgLmNsYXNzZWQoXCJiaW9lbnRpdHlcIiwgIG4uaXNCaW9FbnRpdHkpO1xuXG4gXG4gICAgLy9cbiAgICAvLyBzZXQvcmVtb3ZlIHRoZSBcIm11bHRpcGxlXCIgYXR0cmlidXRlIG9mIHRoZSBzZWxlY3QgZWxlbWVudCBhY2NvcmRpbmcgdG8gY3R5cGVcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLmF0dHIoXCJtdWx0aXBsZVwiLCBmdW5jdGlvbigpeyByZXR1cm4gY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiIHx8IG51bGw7IH0pO1xuXG4gICAgLy9cbiAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIFtcIkFueVwiXS5jb25jYXQoY3Vyck1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICApO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBvcHRpb24gbGlzdCBvZiBzdWJjbGFzcyBuYW1lc1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBuLnBhcmVudCA/IGdldFN1YmNsYXNzZXMobi5wY29tcC5raW5kID8gbi5wY29tcC50eXBlIDogbi5wY29tcCkgOiBbXSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBvbmUgd2hvc2UgbmFtZSBtYXRjaGVzIHRoZSBub2RlJ3MgdHlwZSBhbmQgc2V0IGl0cyBzZWxlY3RlZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBjdXJyTWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGlzVmFsaWRMaXN0Q29uc3RyYWludChsLCBjdXJyTm9kZSk7IH0pLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gbGlzdHMpXCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICAgICAgLy9sZXQgYWNzID0gZ2V0TG9jYWwoXCJhdXRvY29tcGxldGVcIiwgdHJ1ZSwgW10pO1xuICAgICAgICAvLyBkaXNhYmxlIHRoaXMgZm9yIG5vdy5cbiAgICAgICAgbGV0IGFjcyA9IFtdO1xuICAgICAgICBpZiAoYWNzLmluZGV4T2YoYXR0cikgIT09IC0xKVxuICAgICAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIlVucmVjb2duaXplZCBjdHlwZTogXCIgKyBjdHlwZVxuICAgIH1cbiAgICBcbn1cblxuLy8gT3BlbnMgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZvciBjb25zdHJhaW50IGMgb2Ygbm9kZSBuLlxuLy9cbmZ1bmN0aW9uIG9wZW5Db25zdHJhaW50RWRpdG9yKGMsIG4pe1xuXG4gICAgdmFyIGNjb3B5ID0gZGVlcGMoYyk7XG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIikuZGF0dW0oeyBjLCBjY29weSB9KVxuXG4gICAgLy8gTm90ZSBpZiB0aGlzIGlzIGhhcHBlbmluZyBhdCB0aGUgcm9vdCBub2RlXG4gICAgdmFyIGlzcm9vdCA9ICEgbi5wYXJlbnQ7XG4gXG4gICAgLy8gRmluZCB0aGUgZGl2IGZvciBjb25zdHJhaW50IGMgaW4gdGhlIGRpYWxvZyBsaXN0aW5nLiBXZSB3aWxsXG4gICAgLy8gb3BlbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb24gdG9wIG9mIGl0LlxuICAgIHZhciBjZGl2O1xuICAgIGQzLnNlbGVjdEFsbChcIiNkaWFsb2cgLmNvbnN0cmFpbnRcIilcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oY2MpeyBpZihjYyA9PT0gYykgY2RpdiA9IHRoaXM7IH0pO1xuICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgY29uc3RyYWludCdzIGNvbnRhaW5lciBkaXZcbiAgICB2YXIgY2JiID0gY2Rpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGFwcCdzIG1haW4gYm9keSBlbGVtZW50XG4gICAgdmFyIGRiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBwb3NpdGlvbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb3ZlciB0aGUgY29uc3RyYWludCBpbiB0aGUgZGlhbG9nXG4gICAgdmFyIGNlZCA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgYy5jdHlwZSlcbiAgICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIHRydWUpXG4gICAgICAgIC5zdHlsZShcInRvcFwiLCAoY2JiLnRvcCAtIGRiYi50b3ApK1wicHhcIilcbiAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoY2JiLmxlZnQgLSBkYmIubGVmdCkrXCJweFwiKVxuICAgICAgICA7XG5cbiAgICAvLyBJbml0IHRoZSBjb25zdHJhaW50IGNvZGUgXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAudGV4dChjLmNvZGUpO1xuXG4gICAgaW5pdENFaW5wdXRzKG4sIGMpO1xuXG4gICAgLy8gV2hlbiB1c2VyIHNlbGVjdHMgYW4gb3BlcmF0b3IsIGFkZCBhIGNsYXNzIHRvIHRoZSBjLmUuJ3MgY29udGFpbmVyXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgb3AgPSBPUElOREVYW3RoaXMudmFsdWVdO1xuICAgICAgICAgICAgaW5pdENFaW5wdXRzKG4sIGMsIG9wLmN0eXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgY2FuY2VsQ29uc3RyYWludEVkaXRvcihuLCBjKSB9KTtcblxuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc2F2ZVwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBzYXZlQ29uc3RyYWludEVkaXRzKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zeW5jXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKSB9KTtcblxufVxuLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbi8vIEFyZ3M6XG4vLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbi8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbi8vIE5COiBPbmx5IHZhbHVlIGFuZCBtdWx0aXZhdWUgY29uc3RyYWludHMgY2FuIGJlIHN1bW1hcml6ZWQgaW4gdGhpcyB3YXkuICBcbmZ1bmN0aW9uIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKXtcbiAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgIC8vIEJVVCBOT1RFLCB3ZSBoYXZlIHRvIHJ1biB0aGUgcXVlcnkgKndpdGhvdXQqIGNvbnN0cmFpbnQgYyEhXG4gICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgIC8vIHN5bmMgYnV0dG9uIHRvIGdldCBhIGxpc3QuIElmIHdlIHJ1biB0aGUgcXVlcnkgd2l0aCBjIGludGFjdCwgd2UnbGwgZ2V0IGEgbGlzdFxuICAgIC8vIGNvbnRhaW5pbnQgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAvLyBoZXJlIGlzIHRvIGVuc3VyZSBpdCBieSBhZGRpbmcgdGhlIHBhdGggdG8gdGhlIHZpZXcgbGlzdC5cblxuICAgIGxldCBjdmFscyA9IFtdO1xuICAgIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBjdmFscyA9IGMudmFsdWVzO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgY3ZhbHMgPSBbIGMudmFsdWUgXTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoaXMgY2hvaWNlIGluIGxvY2FsU3RvcmFnZVxuICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgIGxldCBrZXkgPSBcImF1dG9jb21wbGV0ZVwiO1xuICAgIGxldCBsc3Q7XG4gICAgbHN0ID0gZ2V0TG9jYWwoa2V5LCB0cnVlLCBbXSk7XG4gICAgaWYobHN0LmluZGV4T2YoYXR0cikgPT09IC0xKSBsc3QucHVzaChhdHRyKTtcbiAgICBzZXRMb2NhbChrZXksIGxzdCwgdHJ1ZSk7XG5cbiAgICBjbGVhckxvY2FsKCk7XG5cbiAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgIC8vXG4gICAgbGV0IGxleCA9IGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWM7IC8vIHNhdmUgY29uc3RyYWludCBsb2dpYyBleHByXG4gICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCBmYWxzZSk7IC8vIHRlbXBvcmFyaWx5IHJlbW92ZSB0aGUgY29uc3RyYWludFxuICAgIGxldCBqID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgICBqLnNlbGVjdC5wdXNoKHApOyAvLyBtYWtlIHN1cmUgcCBpcyBwYXJ0IG9mIHRoZSBxdWVyeVxuICAgIGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgPSBsZXg7IC8vIHJlc3RvcmUgdGhlIGxvZ2ljIGV4cHJcbiAgICBhZGRDb25zdHJhaW50KG4sIGZhbHNlLCBjKTsgLy8gcmUtYWRkIHRoZSBjb25zdHJhaW50XG5cbiAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgbGV0IHggPSBqc29uMnhtbChqLCB0cnVlKTtcbiAgICBsZXQgZSA9IGVuY29kZVVSSUNvbXBvbmVudCh4KTtcbiAgICBsZXQgdXJsID0gYCR7Y3Vyck1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICBsZXQgdGhyZXNob2xkID0gMjUwO1xuXG4gICAgLy8gc2lnbmFsIHRoYXQgd2UncmUgc3RhcnRpbmdcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgIC8vIGdvIVxuICAgIGQzanNvblByb21pc2UodXJsKS50aGVuKGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAvLyBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgaW4ganNvbi5yZXVsdHMuXG4gICAgICAgIC8vIEVhY2ggbGlzdCBpdGVtIGxvb2tzIGxpa2U6IHsgaXRlbTogXCJzb21lc3RyaW5nXCIsIGNvdW50OiAxNyB9XG4gICAgICAgIC8vIChZZXMsIHdlIGdldCBjb3VudHMgZm9yIGZyZWUhIE91Z2h0IHRvIG1ha2UgdXNlIG9mIHRoaXMuKVxuICAgICAgICAvL1xuICAgICAgICBsZXQgcmVzID0ganNvbi5yZXN1bHRzLm1hcChyID0+IHIuaXRlbSkuc29ydCgpO1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgbGV0IGFucyA9IHByb21wdChgVGhlcmUgYXJlICR7cmVzLmxlbmd0aH0gcmVzdWx0cywgd2hpY2ggZXhjZWVkcyB0aGUgdGhyZXNob2xkIG9mICR7dGhyZXNob2xkfS4gSG93IG1hbnkgZG8geW91IHdhbnQgdG8gc2hvdz9gLCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgIGlmIChpc05hTihhbnMpIHx8IGFucyA8PSAwKSByZXR1cm47XG4gICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJylcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCB0cnVlKTtcbiAgICAgICAgbGV0IG9wdHMgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YShyZXMpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgZCA9PiBkKVxuICAgICAgICAgICAgLnRleHQoIGQgPT4gZCApXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIG51bGwpXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY3ZhbHMuaW5kZXhPZihkKSAhPT0gLTEgfHwgbnVsbCk7XG4gICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICB9KVxufVxuLy9cbmZ1bmN0aW9uIGNhbmNlbENvbnN0cmFpbnRFZGl0b3IobiwgYyl7XG4gICAgaWYgKCEgYy5zYXZlZCkge1xuICAgICAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIHRydWUpO1xuICAgIH1cbiAgICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xufVxuZnVuY3Rpb24gaGlkZUNvbnN0cmFpbnRFZGl0b3IoKXtcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5jbGFzc2VkKFwib3BlblwiLCBudWxsKTtcbn1cbi8vXG5mdW5jdGlvbiBlZGl0Q29uc3RyYWludChjLCBuKXtcbiAgICBvcGVuQ29uc3RyYWludEVkaXRvcihjLCBuKTtcbn1cbi8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbi8vIHVzZWQgaW4gdGhlIGdpdmVuIHRlbXBsYXRlLlxuLy9cbmZ1bmN0aW9uIG5leHRBdmFpbGFibGVDb2RlKHRtcGx0KXtcbiAgICBmb3IodmFyIGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICBpZiAoISAoYyBpbiB0bXBsdC5jb2RlMmMpKVxuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG4vLyBBZGRzIGEgbmV3IGNvbnN0cmFpbnQgdG8gYSBub2RlIGFuZCByZXR1cm5zIGl0LlxuLy8gQXJnczpcbi8vICAgbiAobm9kZSkgVGhlIG5vZGUgdG8gYWRkIHRoZSBjb25zdHJhaW50IHRvLiBSZXF1aXJlZC5cbi8vICAgdXBkYXRlVUkgKGJvb2xlYW4pIElmIHRydWUsIHVwZGF0ZSB0aGUgZGlzcGxheS4gSWYgZmFsc2Ugb3Igbm90IHNwZWNpZmllZCwgbm8gdXBkYXRlLlxuLy8gICBjIChjb25zdHJhaW50KSBJZiBnaXZlbiwgdXNlIHRoYXQgY29uc3RyYWludC4gT3RoZXJ3aXNlIGF1dG9nZW5lcmF0ZS5cbi8vIFJldHVybnM6XG4vLyAgIFRoZSBuZXcgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBhZGRDb25zdHJhaW50KG4sIHVwZGF0ZVVJLCBjKSB7XG4gICAgaWYgKCFjKSB7XG4gICAgICAgIGMgPSBuZXcgQ29uc3RyYWludChuLGN1cnJUZW1wbGF0ZSk7XG4gICAgfVxuICAgIG4uY29uc3RyYWludHMucHVzaChjKTtcbiAgICBjdXJyVGVtcGxhdGUud2hlcmUucHVzaChjKTtcbiAgICBjdXJyVGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgfVxuICAgIC8vXG4gICAgcmV0dXJuIGM7XG59XG5cbi8vXG5mdW5jdGlvbiByZW1vdmVDb25zdHJhaW50KG4sIGMsIHVwZGF0ZVVJKXtcbiAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGN1cnJUZW1wbGF0ZS53aGVyZSA9IGN1cnJUZW1wbGF0ZS53aGVyZS5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGRlbGV0ZSBjdXJyVGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG4vL1xuZnVuY3Rpb24gc2F2ZUNvbnN0cmFpbnRFZGl0cyhuLCBjKXtcbiAgICAvL1xuICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgYy5vcCA9IG87XG4gICAgYy5jdHlwZSA9IE9QSU5ERVhbb10uY3R5cGU7XG4gICAgYy5zYXZlZCA9IHRydWU7XG4gICAgLy9cbiAgICBsZXQgdmFsID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWU7XG4gICAgbGV0IHZhbHMgPSBbXTtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkgdmFscy5wdXNoKHRoaXMudmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgIGxldCB6ID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvcicpLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuXG4gICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIGMudHlwZSA9IHZhbHNbMF1cbiAgICAgICAgYy52YWx1ZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgc2V0U3ViY2xhc3NDb25zdHJhaW50KG4sIGMudHlwZSlcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICBjLnZhbHVlID0gdmFsO1xuICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIGMuZXh0cmFWYWx1ZSA9IHZhbHNbMF0gPT09IFwiQW55XCIgPyBudWxsIDogdmFsc1swXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHZhbHNbMF07XG4gICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBjLnZhbHVlID0geiA/IHZhbHNbMF0gOiB2YWw7XG4gICAgICAgIGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiVW5rbm93biBjdHlwZTogXCIrYy5jdHlwZTtcbiAgICB9XG4gICAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiAgICB1cGRhdGUobik7XG4gICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gT3BlbnMgYSBkaWFsb2cgb24gdGhlIHNwZWNpZmllZCBub2RlLlxuLy8gQWxzbyBtYWtlcyB0aGF0IG5vZGUgdGhlIGN1cnJlbnQgbm9kZS5cbi8vIEFyZ3M6XG4vLyAgIG4gICAgdGhlIG5vZGVcbi8vICAgZWx0ICB0aGUgRE9NIGVsZW1lbnQgKGUuZy4gYSBjaXJjbGUpXG4vLyBSZXR1cm5zXG4vLyAgIHN0cmluZ1xuLy8gU2lkZSBlZmZlY3Q6XG4vLyAgIHNldHMgZ2xvYmFsIGN1cnJOb2RlXG4vL1xuZnVuY3Rpb24gc2hvd0RpYWxvZyhuLCBlbHQsIHJlZnJlc2hPbmx5KXtcbiAgaWYgKCFlbHQpIGVsdCA9IGZpbmREb21CeURhdGFPYmoobik7XG4gIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG4gXG4gIC8vIFNldCB0aGUgZ2xvYmFsIGN1cnJOb2RlXG4gIGN1cnJOb2RlID0gbjtcbiAgdmFyIGlzcm9vdCA9ICEgY3Vyck5vZGUucGFyZW50O1xuICAvLyBNYWtlIG5vZGUgdGhlIGRhdGEgb2JqIGZvciB0aGUgZGlhbG9nXG4gIHZhciBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpLmRhdHVtKG4pO1xuICAvLyBDYWxjdWxhdGUgZGlhbG9nJ3MgcG9zaXRpb25cbiAgdmFyIGRiYiA9IGRpYWxvZ1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGViYiA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGJiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHQgPSAoZWJiLnRvcCAtIGJiYi50b3ApICsgZWJiLndpZHRoLzI7XG4gIHZhciBiID0gKGJiYi5ib3R0b20gLSBlYmIuYm90dG9tKSArIGViYi53aWR0aC8yO1xuICB2YXIgbCA9IChlYmIubGVmdCAtIGJiYi5sZWZ0KSArIGViYi5oZWlnaHQvMjtcbiAgdmFyIGRpciA9IFwiZFwiIDsgLy8gXCJkXCIgb3IgXCJ1XCJcbiAgLy8gTkI6IGNhbid0IGdldCBvcGVuaW5nIHVwIHRvIHdvcmssIHNvIGhhcmQgd2lyZSBpdCB0byBkb3duLiA6LVxcXG5cbiAgLy9cbiAgZGlhbG9nXG4gICAgICAuc3R5bGUoXCJsZWZ0XCIsIGwrXCJweFwiKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsIHJlZnJlc2hPbmx5P1wic2NhbGUoMSlcIjpcInNjYWxlKDFlLTYpXCIpXG4gICAgICAuY2xhc3NlZChcImhpZGRlblwiLCBmYWxzZSlcbiAgICAgIC5jbGFzc2VkKFwiaXNyb290XCIsIGlzcm9vdClcbiAgICAgIDtcbiAgaWYgKGRpciA9PT0gXCJkXCIpXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgdCtcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDAlXCIpIDtcbiAgZWxzZVxuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwidG9wXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIGIrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAxMDAlXCIpIDtcblxuICAvLyBTZXQgdGhlIGRpYWxvZyB0aXRsZSB0byBub2RlIG5hbWVcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJkaWFsb2dUaXRsZVwiXSBzcGFuJylcbiAgICAgIC50ZXh0KG4ubmFtZSk7XG4gIC8vIFNob3cgdGhlIGZ1bGwgcGF0aFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImZ1bGxQYXRoXCJdIGRpdicpXG4gICAgICAudGV4dChuLnBhdGgpO1xuICAvLyBUeXBlIGF0IHRoaXMgbm9kZVxuICB2YXIgdHAgPSBuLnB0eXBlLm5hbWUgfHwgbi5wdHlwZTtcbiAgdmFyIHN0cCA9IChuLnN1YmNsYXNzQ29uc3RyYWludCAmJiBuLnN1YmNsYXNzQ29uc3RyYWludC5uYW1lKSB8fCBudWxsO1xuICB2YXIgdHN0cmluZyA9IHN0cCAmJiBgPHNwYW4gc3R5bGU9XCJjb2xvcjogcHVycGxlO1wiPiR7c3RwfTwvc3Bhbj4gKCR7dHB9KWAgfHwgdHBcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJ0eXBlXCJdIGRpdicpXG4gICAgICAuaHRtbCh0c3RyaW5nKTtcblxuICAvLyBXaXJlIHVwIGFkZCBjb25zdHJhaW50IGJ1dHRvblxuICBkaWFsb2cuc2VsZWN0KFwiI2RpYWxvZyAuY29uc3RyYWludFNlY3Rpb24gLmFkZC1idXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgYWRkQ29uc3RyYWludChuLCB0cnVlKTsgfSk7XG5cbiAgLy8gRmlsbCBvdXQgdGhlIGNvbnN0cmFpbnRzIHNlY3Rpb24uIEZpcnN0LCBzZWxlY3QgYWxsIGNvbnN0cmFpbnRzLlxuICB2YXIgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEobi5jb25zdHJhaW50cyk7XG4gIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gIC8vIDEuIGNvbnRhaW5lclxuICB2YXIgY2RpdnMgPSBjb25zdHJzLmVudGVyKCkuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLFwiY29uc3RyYWludFwiKSA7XG4gIC8vIDIuIG9wZXJhdG9yXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgLy8gMy4gdmFsdWVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwiY29kZVwiKSA7XG4gIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKTtcbiAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBjYW5jZWxcIikudGV4dChcImRlbGV0ZV9mb3JldmVyXCIpO1xuXG4gIC8vIFJlbW92ZSBleGl0aW5nXG4gIGNvbnN0cnMuZXhpdCgpLnJlbW92ZSgpIDtcblxuICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICBjb25zdHJzXG4gICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGMpIHsgcmV0dXJuIFwiY29uc3RyYWludCBcIiArIGMuY3R5cGU7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwib3BcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXtcbiAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSArIChjLmV4dHJhVmFsdWUgPyBcIiBpbiBcIiArIGMuZXh0cmFWYWx1ZSA6IFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlIHx8IChjLnZhbHVlcyAmJiBjLnZhbHVlcy5qb2luKFwiLFwiKSkgfHwgYy50eXBlO1xuICAgICAgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmNhbmNlbFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdHJ1ZSk7XG4gICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICB9KVxuXG5cbiAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgLy9cbiAgdmFyIHQgPSBuLnBjb21wLnR5cGU7XG4gIGlmICh0eXBlb2YodCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLHRydWUpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KFwiLnNlbGVjdC1jdHJsXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZCB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIERpYWxvZyBmb3IgY2xhc3Nlc1xuICAgICAgZGlhbG9nXG4gICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIixmYWxzZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlID8gbi5wY29tcC50eXBlLm5hbWUgOiBuLnBjb21wLm5hbWUpO1xuXG4gICAgICAvLyB3aXJlIHVwIHRoZSBidXR0b24gdG8gc2hvdyBzdW1tYXJ5IGZpZWxkc1xuICAgICAgZGlhbG9nLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNob3dTdW1tYXJ5XCJdJylcbiAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwic3VtbWFyeWZpZWxkc1wiKSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIHRhYmxlIGxpc3RpbmcgYWxsIHRoZSBhdHRyaWJ1dGVzL3JlZnMvY29sbGVjdGlvbnMuXG4gICAgICB2YXIgdGJsID0gZGlhbG9nLnNlbGVjdChcInRhYmxlLmF0dHJpYnV0ZXNcIik7XG4gICAgICB2YXIgcm93cyA9IHRibC5zZWxlY3RBbGwoXCJ0clwiKVxuICAgICAgICAgIC5kYXRhKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5hbGxQYXJ0cylcbiAgICAgICAgICA7XG4gICAgICByb3dzLmVudGVyKCkuYXBwZW5kKFwidHJcIik7XG4gICAgICByb3dzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIHZhciBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YShmdW5jdGlvbihjb21wKSB7XG4gICAgICAgICAgICAgIGlmIChjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJTZWxlY3QgdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdzZWxlY3RzaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzZWxlY3RlZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJDb25zdHJhaW4gdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdjb25zdHJhaW5zaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJjb25zdHJhaW5lZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJGb2xsb3cgdGhpcyAke2NvbXAua2luZH1cIj5wbGF5X2Fycm93PC9pPmAsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdvcGVubmV4dCcsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcIm9wZW5cIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIDtcbiAgICAgIGNlbGxzLmVudGVyKCkuYXBwZW5kKFwidGRcIik7XG4gICAgICBjZWxsc1xuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuY2xzO30pXG4gICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5jbGljayAmJiBkLmNsaWNrKCk7IH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZXhpdCgpLnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIEhpZGVzIHRoZSBkaWFsb2cuIFNldHMgdGhlIGN1cnJlbnQgbm9kZSB0byBudWxsLlxuLy8gQXJnczpcbi8vICAgbm9uZVxuLy8gUmV0dXJuc1xuLy8gIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICBIaWRlcyB0aGUgZGlhbG9nLlxuLy8gIFNldHMgY3Vyck5vZGUgdG8gbnVsbC5cbi8vXG5mdW5jdGlvbiBoaWRlRGlhbG9nKCl7XG4gIGN1cnJOb2RlID0gbnVsbDtcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIHRydWUpXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24vMilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMWUtNilcIilcbiAgICAgIDtcbiAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgIC5jbGFzc2VkKFwib3BlblwiLCBudWxsKVxuICAgICAgO1xufVxuXG4vLyBTZXQgdGhlIGVkaXRpbmcgdmlldy4gVmlldyBpcyBvbmUgb2Y6XG4vLyBBcmdzOlxuLy8gICAgIHZpZXcgKHN0cmluZykgT25lIG9mOiBxdWVyeU1haW4sIGNvbnN0cmFpbnRMb2dpYywgY29sdW1uT3JkZXIsIHNvcnRPcmRlclxuLy8gUmV0dXJuczpcbi8vICAgICBOb3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgICAgQ2hhbmdlcyB0aGUgbGF5b3V0IGFuZCB1cGRhdGVzIHRoZSB2aWV3LlxuZnVuY3Rpb24gc2V0RWRpdFZpZXcodmlldyl7XG4gICAgbGV0IHYgPSBlZGl0Vmlld3Nbdmlld107XG4gICAgaWYgKCF2KSB0aHJvdyBcIlVucmVjb2duaXplZCB2aWV3IHR5cGU6IFwiICsgdmlldztcbiAgICBlZGl0VmlldyA9IHY7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG5mdW5jdGlvbiBkb0xheW91dChyb290KXtcbiAgdmFyIGxheW91dDtcbiAgbGV0IGxlYXZlcyA9IFtdO1xuICBcbiAgaWYgKGVkaXRWaWV3LmxheW91dFN0eWxlID09PSBcInRyZWVcIikge1xuICAgICAgLy8gZDMgbGF5b3V0IGFycmFuZ2VzIG5vZGVzIHRvcC10by1ib3R0b20sIGJ1dCB3ZSB3YW50IGxlZnQtdG8tcmlnaHQuXG4gICAgICAvLyBTby4uLnJldmVyc2Ugd2lkdGggYW5kIGhlaWdodCwgYW5kIGRvIHRoZSBsYXlvdXQuIFRoZW4sIHJldmVyc2UgdGhlIHgseSBjb29yZHMgaW4gdGhlIHJlc3VsdHMuXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQudHJlZSgpLnNpemUoW2gsIHddKTtcbiAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgLy8gUmV2ZXJzZSB4IGFuZCB5LiBBbHNvLCBub3JtYWxpemUgeCBmb3IgZml4ZWQtZGVwdGguXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDtcbiAgICAgICAgICBkLnggPSBkLmRlcHRoICogMTgwO1xuICAgICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgICAvLyBkZW5kcm9ncmFtXG4gICAgICBmdW5jdGlvbiBtZCAobikgeyAvLyBtYXggZGVwdGhcbiAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPT09IDApIGxlYXZlcy5wdXNoKG4pO1xuICAgICAgICAgIHJldHVybiAxICsgKG4uY2hpbGRyZW4ubGVuZ3RoID8gTWF0aC5tYXguYXBwbHkobnVsbCwgbi5jaGlsZHJlbi5tYXAobWQpKSA6IDApO1xuICAgICAgfTtcbiAgICAgIGxldCBtYXhkID0gbWQocm9vdCk7IC8vIG1heCBkZXB0aCwgMS1iYXNlZFxuICAgICAgbGF5b3V0ID0gZDMubGF5b3V0LmNsdXN0ZXIoKVxuICAgICAgICAgIC5zZXBhcmF0aW9uKChhLGIpID0+IDEpXG4gICAgICAgICAgLnNpemUoW2gsIG1heGQgKiAxODBdKTtcbiAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgbm9kZXMuZm9yRWFjaCggZCA9PiB7IGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wOyB9KTtcblxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBFeHBlcmltZW50aW5nIHdpdGggcmVhcnJhbmdpbmcgbGVhdmVzLiBSb3VnaCBjb2RlIGFoZWFkLi4uXG4gICAgICAvL1xuICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuIFxuICAgICAgbGV0IHBvcyA9IGxlYXZlcy5tYXAoZnVuY3Rpb24obil7IHJldHVybiB7IHk6IG4ueSwgeTA6IG4ueTAgfTsgfSk7XG4gICAgICAvL2xldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB4OiBuLngsIHgwOiBuLngwIH07IH0pO1xuICAgICAgbGV0IG5hbWVDb21wID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgICAgICAgbGV0IG5hID0gYS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgbGV0IG5iID0gYi5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmV0dXJuIG5hIDwgbmIgPyAtMSA6IG5hID4gbmIgPyAxIDogMDtcbiAgICAgIH07XG4gICAgICBsZXQgY29sT3JkZXJDb21wID0gZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICBpZiAoYS5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICBpZiAoYi5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGEudmlldyAtIGIudmlldztcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBpZiAoYi5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWVDb21wKGEsYilcbiAgICAgIH1cbiAgICAgIGxlYXZlcy5zb3J0KGNvbE9yZGVyQ29tcCk7XG4gICAgICAvLyByZWFzc2lnbiB0aGUgWSBwb3NpdGlvbnNcbiAgICAgIGxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgICAgIG4ueSA9IHBvc1tpXS55O1xuICAgICAgICAgIG4ueTAgPSBwb3NbaV0ueTA7XG4gICAgICB9KTtcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIGxlYXZlcyBoYXZlIGJlZW4gcmVhcnJhbmdlZCwgYnV0IHRoZSBpbnRlcmlvciBub2RlcyBoYXZlbid0LlxuICAgICAgLy8gSGVyIHdlIG1vdmUgaW50ZXJpb3Igbm9kZXMgdG93YXJkIHRoZWlyIFwiY2VudGVyIG9mIGdyYXZpdHlcIiBhcyBkZWZpbmVkXG4gICAgICAvLyBieSB0aGUgcG9zaXRpb25zIG9mIHRoZWlyIGNoaWxkcmVuLiBBcHBseSB0aGlzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgICAgLy8gXG4gICAgICAvLyBOT1RFIHRoYXQgeCBhbmQgeSBjb29yZGluYXRlcyBhcmUgb3Bwb3NpdGUgYXQgdGhpcyBwb2ludCFcbiAgICAgIC8vXG4gICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBvY2N1cGllZCBwb3NpdGlvbnM6XG4gICAgICBsZXQgb2NjdXBpZWQgPSB7fSA7ICAvLyBvY2N1cGllZFt4IHBvc2l0aW9uXSA9PSBbbGlzdCBvZiBub2Rlc11cbiAgICAgIGZ1bmN0aW9uIGNvZyAobikge1xuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgLy8gY29tcHV0ZSBteSBjLm8uZy4gYXMgdGhlIGF2ZXJhZ2Ugb2YgbXkga2lkcycgcG9zaXRpb25zXG4gICAgICAgICAgICAgIGxldCBteUNvZyA9IChuLmNoaWxkcmVuLm1hcChjb2cpLnJlZHVjZSgodCxjKSA9PiB0K2MsIDApKS9uLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICAgICAgaWYobi5wYXJlbnQpIG4ueSA9IG15Q29nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgZGQgPSBvY2N1cGllZFtuLnldID0gKG9jY3VwaWVkW24ueV0gfHwgW10pO1xuICAgICAgICAgIGRkLnB1c2gobi55KTtcbiAgICAgICAgICByZXR1cm4gbi55O1xuICAgICAgfVxuICAgICAgY29nKHJvb3QpO1xuXG4gICAgICAvLyBUT0RPOiBGaW5hbCBhZGp1c3RtZW50c1xuICAgICAgLy8gMS4gSWYgd2UgZXh0ZW5kIG9mZiB0aGUgcmlnaHQgZWRnZSwgY29tcHJlc3MuXG4gICAgICAvLyAyLiBJZiBpdGVtcyBhdCBzYW1lIHggb3ZlcmxhcCwgc3ByZWFkIHRoZW0gb3V0IGluIHkuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgfVxuXG4gIC8vIHNhdmUgbGlua3MgaW4gZ2xvYmFsXG4gIGxpbmtzID0gbGF5b3V0LmxpbmtzKG5vZGVzKTtcblxuICByZXR1cm4gW25vZGVzLCBsaW5rc11cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHVwZGF0ZShuKSBcbi8vIFRoZSBtYWluIGRyYXdpbmcgcm91dGluZS4gXG4vLyBVcGRhdGVzIHRoZSBTVkcsIHVzaW5nIG4gYXMgdGhlIHNvdXJjZSBvZiBhbnkgZW50ZXJpbmcvZXhpdGluZyBhbmltYXRpb25zLlxuLy9cbmZ1bmN0aW9uIHVwZGF0ZShzb3VyY2UpIHtcbiAgLy9cbiAgZG9MYXlvdXQocm9vdCk7XG4gIHVwZGF0ZU5vZGVzKG5vZGVzLCBzb3VyY2UpO1xuICB1cGRhdGVMaW5rcyhsaW5rcywgc291cmNlKTtcbiAgdXBkYXRlVHRleHQoKTtcbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZU5vZGVzKG5vZGVzLCBzb3VyY2Upe1xuICBsZXQgbm9kZUdycHMgPSB2aXMuc2VsZWN0QWxsKFwiZy5ub2RlZ3JvdXBcIilcbiAgICAgIC5kYXRhKG5vZGVzLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLmlkIHx8IChuLmlkID0gKytpKTsgfSlcbiAgICAgIDtcblxuICAvLyBDcmVhdGUgbmV3IG5vZGVzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cbiAgbGV0IG5vZGVFbnRlciA9IG5vZGVHcnBzLmVudGVyKClcbiAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgLmF0dHIoXCJpZFwiLCBuID0+IG4ucGF0aC5yZXBsYWNlKC9cXC4vZywgXCJfXCIpKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVncm91cFwiKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueDAgKyBcIixcIiArIHNvdXJjZS55MCArIFwiKVwiOyB9KVxuICAgICAgO1xuXG4gIC8vIEFkZCBnbHlwaCBmb3IgdGhlIG5vZGVcbiAgLy9ub2RlRW50ZXIuYXBwZW5kKFwic3ZnOmNpcmNsZVwiKVxuICBub2RlRW50ZXIuYXBwZW5kKGZ1bmN0aW9uKGQpe1xuICAgICAgdmFyIHNoYXBlID0gKGQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiID8gXCJyZWN0XCIgOiBcImNpcmNsZVwiKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgICB9KVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZVwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47IFxuICAgICAgICAgIGlmIChjdXJyTm9kZSAhPT0gZCkgc2hvd0RpYWxvZyhkLCB0aGlzKTtcbiAgICAgICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0pO1xuICBub2RlRW50ZXIuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuICBub2RlRW50ZXIuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIC04LjUpXG4gICAgICAuYXR0cihcInlcIiwgLTguNSlcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuXG4gIC8vIEFkZCB0ZXh0IGZvciBub2RlIG5hbWVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5jaGlsZHJlbiB8fCBkLl9jaGlsZHJlbiA/IC0xMCA6IDEwOyB9KVxuICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIG5lYXJseSB0cmFuc3BhcmVudFxuICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZU5hbWVcIilcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgbGV0IG5vZGVVcGRhdGUgPSBub2RlR3Jwc1xuICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZDsgfSlcbiAgICAgIC5jbGFzc2VkKFwiY29uc3RyYWluZWRcIiwgZnVuY3Rpb24obil7IHJldHVybiBuLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7IH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIG4ueCArIFwiLFwiICsgbi55ICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgbm9kZVVwZGF0ZS5zZWxlY3RBbGwoXCJ0ZXh0Lm5vZGVOYW1lXCIpXG4gICAgICAudGV4dChuID0+IG4ubmFtZSk7XG5cbiAgLy8gTWFrZSBzZWxlY3RlZCBub2RlcyBkcmFnZ2FibGVcbiAgbGV0IGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG4gIGQzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCBmYWxzZSlcbiAgICAgIC5vbihcIi5kcmFnXCIsIG51bGwpOyBcbiAgaWYgKGVkaXRWaWV3Lm5hbWUgPT09IFwiY29sdW1uT3JkZXJcIilcbiAgICAgIGQzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwLnNlbGVjdGVkXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgdHJ1ZSlcbiAgICAgICAgICAuY2FsbChkcmFnKTtcbiAgZHJhZ1xuICAgICAgLm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbGV0IGRkID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgIGRkLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKG4pID0+IHtcbiAgICAgICAgICAgICAgLy9uLnggPSBkMy5ldmVudC54O1xuICAgICAgICAgICAgICBuLnkgPSBkMy5ldmVudC55O1xuICAgICAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke24ueH0sJHtuLnl9KWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGV0IGxsID0gZDMuc2VsZWN0KGBwYXRoLmxpbmtbdGFyZ2V0PVwiJHtkZC5hdHRyKCdpZCcpfVwiXWApO1xuICAgICAgICAgIGxsLmF0dHIoXCJkXCIsIGRpYWdvbmFsKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGxldCBkcmFnZ2VkID0gZDMuc2VsZWN0KHRoaXMpLmRhdGEoKVswXTtcbiAgICAgICAgICBsZXQgbm9kZXMgPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwLnNlbGVjdGVkXCIpLmRhdGEoKVxuICAgICAgICAgIG5vZGVzLnNvcnQoIChhLCBiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHsgbi52aWV3ID0gaSB9KTtcbiAgICAgICAgICBkcmFnZ2VkLnRlbXBsYXRlLnNlbGVjdCA9IG5vZGVzLm1hcCggbj0+IG4ucGF0aCApO1xuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgfSk7XG5cbiAgLy8gQWRkIHRleHQgZm9yIGNvbnN0cmFpbnRzXG4gIGxldCBjdCA9IG5vZGVHcnBzLnNlbGVjdEFsbChcInRleHQuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEoZnVuY3Rpb24obil7IHJldHVybiBuLmNvbnN0cmFpbnRzOyB9KTtcbiAgY3QuZW50ZXIoKS5hcHBlbmQoXCJzdmc6dGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb25zdHJhaW50XCIpO1xuICBjdC5leGl0KCkucmVtb3ZlKCk7XG4gIGN0LnRleHQoIGMgPT4gY29uc3RyYWludFRleHQoYykgKVxuICAgICAgIC5hdHRyKFwieFwiLCAwKVxuICAgICAgIC5hdHRyKFwiZHlcIiwgKGMsaSkgPT4gYCR7KGkrMSkqMS43fWVtYClcbiAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsXCJzdGFydFwiKVxuICAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gZnVsbCBzaXplXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgOC41IClcbiAgICAgIDtcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDE3IClcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDE3IClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gZnVsbHkgb3BhcXVlXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDEpXG4gICAgICA7XG5cbiAgLy9cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxldCBub2RlRXhpdCA9IG5vZGVHcnBzLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLnggKyBcIixcIiArIHNvdXJjZS55ICsgXCIpXCI7IH0pXG4gICAgICAucmVtb3ZlKClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gdGlueSByYWRpdXNcbiAgbm9kZUV4aXQuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNilcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gdHJhbnNwYXJlbnRcbiAgbm9kZUV4aXQuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpXG4gICAgICA7XG4gIC8vIFN0YXNoIHRoZSBvbGQgcG9zaXRpb25zIGZvciB0cmFuc2l0aW9uLlxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLngwID0gZC54O1xuICAgIGQueTAgPSBkLnk7XG4gIH0pO1xuICAvL1xuXG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVMaW5rcyhsaW5rcywgc291cmNlKSB7XG4gIGxldCBsaW5rID0gdmlzLnNlbGVjdEFsbChcInBhdGgubGlua1wiKVxuICAgICAgLmRhdGEobGlua3MsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0LmlkOyB9KVxuICAgICAgO1xuXG4gIC8vIEVudGVyIGFueSBuZXcgbGlua3MgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbmV3UGF0aHMgPSBsaW5rLmVudGVyKCkuaW5zZXJ0KFwic3ZnOnBhdGhcIiwgXCJnXCIpO1xuICBsZXQgbGlua1RpdGxlID0gZnVuY3Rpb24obCl7XG4gICAgICBsZXQgY2xpY2sgPSBcIlwiO1xuICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpe1xuICAgICAgICAgIGNsaWNrID0gYENsaWNrIHRvIG1ha2UgdGhpcyByZWxhdGlvbnNoaXAgJHtsLnRhcmdldC5qb2luID8gXCJSRVFVSVJFRFwiIDogXCJPUFRJT05BTFwifS4gYDtcbiAgICAgIH1cbiAgICAgIGxldCBhbHRjbGljayA9IFwiQWx0LWNsaWNrIHRvIGN1dCBsaW5rLlwiO1xuICAgICAgcmV0dXJuIGNsaWNrICsgYWx0Y2xpY2s7XG4gIH1cbiAgLy8gc2V0IHRoZSB0b29sdGlwXG4gIG5ld1BhdGhzLmFwcGVuZChcInN2Zzp0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gIG5ld1BhdGhzXG4gICAgICAuYXR0cihcInRhcmdldFwiLCBkID0+IGQudGFyZ2V0LmlkLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGlua1wiKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngwLCB5OiBzb3VyY2UueTB9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLmNsYXNzZWQoXCJhdHRyaWJ1dGVcIiwgZnVuY3Rpb24obCkgeyByZXR1cm4gbC50YXJnZXQucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIjsgfSlcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGwpeyBcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgIC8vIGEgc2hpZnQtY2xpY2sgY3V0cyB0aGUgdHJlZSBhdCB0aGlzIGVkZ2VcbiAgICAgICAgICAgICAgcmVtb3ZlTm9kZShsLnRhcmdldClcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIpIHJldHVybjtcbiAgICAgICAgICAgICAgLy8gcmVndWxhciBjbGljayBvbiBhIHJlbGF0aW9uc2hpcCBlZGdlIGludmVydHMgd2hldGhlclxuICAgICAgICAgICAgICAvLyB0aGUgam9pbiBpcyBpbm5lciBvciBvdXRlci4gXG4gICAgICAgICAgICAgIGwudGFyZ2V0LmpvaW4gPSAobC50YXJnZXQuam9pbiA/IG51bGwgOiBcIm91dGVyXCIpO1xuICAgICAgICAgICAgICAvLyByZS1zZXQgdGhlIHRvb2x0aXBcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcInRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgICAgICAgICAgdXBkYXRlKGwuc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcbiBcbiAgXG4gIC8vIFRyYW5zaXRpb24gbGlua3MgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICBsaW5rLmNsYXNzZWQoXCJvdXRlclwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLnRhcmdldC5qb2luID09PSBcIm91dGVyXCI7IH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZGlhZ29uYWwpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxpbmsuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngsIHk6IHNvdXJjZS55fTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG59XG5cbi8vIFR1cm5zIGEganNvbiByZXByZXNlbnRhdGlvbiBvZiBhIHRlbXBsYXRlIGludG8gWE1MLCBzdWl0YWJsZSBmb3IgaW1wb3J0aW5nIGludG8gdGhlIEludGVybWluZSBRQi5cbmZ1bmN0aW9uIGpzb24yeG1sKHQsIHFvbmx5KXtcbiAgICB2YXIgc28gPSAodC5vcmRlckJ5IHx8IFtdKS5yZWR1Y2UoZnVuY3Rpb24ocyx4KXsgXG4gICAgICAgIHZhciBrID0gT2JqZWN0LmtleXMoeClbMF07XG4gICAgICAgIHZhciB2ID0geFtrXVxuICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICB9LCBcIlwiKTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGVzY2FwZSAnPCcgJ1wiJyBhbmQgJyYnIGNoYXJhY3RlcnNcbiAgICB2YXIgZXNjID0gZnVuY3Rpb24ocyl7IHJldHVybiBzLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTsgfTtcbiAgICAvLyBDb252ZXJ0cyBhbiBvdXRlciBqb2luIHBhdGggdG8geG1sLlxuICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICB9XG4gICAgLy8gQ29udmVydHMgYSBjb25zdHJhaW50IHRvIHhtbFxuICAgIGZ1bmN0aW9uIGMyeG1sKGMpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiIHx8IGMuY3R5cGUgPT09IFwibGlzdFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2VzYyhjLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKGMudmFsdWUpfVwiIGNvZGU9XCIke2MuY29kZX1cIiBlZGl0YWJsZT1cIiR7Yy5lZGl0YWJsZX1cImA7XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKGMuZXh0cmFWYWx1ZSAmJiBjLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke2MuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2VzYyhjLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKGMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke2MuY29kZX1cIiBlZGl0YWJsZT1cIiR7Yy5lZGl0YWJsZX1cImA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2Mub3B9XCIgY29kZT1cIiR7Yy5jb2RlfVwiIGVkaXRhYmxlPVwiJHtjLmVkaXRhYmxlfVwiYDtcbiAgICAgICAgICAgIGggPSBjLnZhbHVlcy5tYXAoIHYgPT4gYDx2YWx1ZT4ke2VzYyh2KX08L3ZhbHVlPmAgKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke2MucGF0aH1cIiB0eXBlPVwiJHtjLnR5cGV9XCIgZWRpdGFibGU9XCJmYWxzZVwiYDtcbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke2MucGF0aH1cIiBvcD1cIiR7Yy5vcH1cIiBjb2RlPVwiJHtjLmNvZGV9XCIgZWRpdGFibGU9XCIke2MuZWRpdGFibGV9XCJgO1xuICAgICAgICBpZihoKVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9PiR7aH08L2NvbnN0cmFpbnQ+XFxuYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9IC8+XFxuYDtcbiAgICB9XG5cbiAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgIHZhciBxcGFydCA9IFxuYDxxdWVyeVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgbW9kZWw9XCIkeyh0Lm1vZGVsICYmIHQubW9kZWwubmFtZSkgfHwgJyd9XCJcbiAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gIHNvcnRPcmRlcj1cIiR7c28gfHwgJyd9XCJcbiAgY29uc3RyYWludExvZ2ljPVwiJHt0LmNvbnN0cmFpbnRMb2dpYyB8fCAnJ31cIj5cbiAgJHsodC5qb2lucyB8fCBbXSkubWFwKG9qMnhtbCkuam9pbihcIiBcIil9XG4gICR7KHQud2hlcmUgfHwgW10pLm1hcChjMnhtbCkuam9pbihcIiBcIil9XG48L3F1ZXJ5PmA7XG4gICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgdmFyIHRtcGx0ID0gXG5gPHRlbXBsYXRlXG4gIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gIGNvbW1lbnQ9XCIke2VzYyh0LmNvbW1lbnQgfHwgJycpfVwiPlxuICR7cXBhcnR9XG48L3RlbXBsYXRlPlxuYDtcbiAgICByZXR1cm4gcW9ubHkgPyBxcGFydCA6IHRtcGx0XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVUdGV4dCgpe1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dDtcbiAgaWYoIGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSApXG4gICAgICB0eHQgPSBKU09OLnN0cmluZ2lmeSh1Y3QsIG51bGwsIDIpO1xuICBlbHNlXG4gICAgICB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBkMy5zZWxlY3QoXCIjdHRleHRkaXZcIikgXG4gICAgICAudGV4dCh0eHQpXG4gICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIHRydWUpO1xuICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgdXBkYXRlQ291bnQoKTtcbn1cblxuZnVuY3Rpb24gcnVuYXRtaW5lKCkge1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dCA9IGpzb24yeG1sKHVjdCk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQodHh0KTtcbiAgbGV0IGxpbmt1cmwgPSBjdXJyTWluZS51cmwgKyBcIi9sb2FkUXVlcnkuZG8/dHJhaWw9JTdDcXVlcnkmbWV0aG9kPXhtbFwiO1xuICBsZXQgZWRpdHVybCA9IGxpbmt1cmwgKyBcIiZxdWVyeT1cIiArIHVybFR4dDtcbiAgbGV0IHJ1bnVybCA9IGxpbmt1cmwgKyBcIiZza2lwQnVpbGRlcj10cnVlJnF1ZXJ5PVwiICsgdXJsVHh0O1xuICB3aW5kb3cub3BlbiggZDMuZXZlbnQuYWx0S2V5ID8gZWRpdHVybCA6IHJ1bnVybCwgJ19ibGFuaycgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCBxdHh0ID0ganNvbjJ4bWwodWN0LCB0cnVlKTtcbiAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudChxdHh0KTtcbiAgbGV0IGNvdW50VXJsID0gY3Vyck1pbmUudXJsICsgYC9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JHt1cmxUeHR9JmZvcm1hdD1jb3VudGA7XG4gIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwicnVubmluZ1wiLCB0cnVlKTtcbiAgZDNqc29uUHJvbWlzZShjb3VudFVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG4pe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgZmFsc2UpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IHNwYW4nKS50ZXh0KG4pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgdHJ1ZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6OlwiLCBxdHh0KVxuICAgICAgfSk7XG59XG5cbi8vIFRoZSBjYWxsIHRoYXQgZ2V0cyBpdCBhbGwgZ29pbmcuLi5cbnNldHVwKClcbi8vXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYi5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIENvbnN0cmFpbnRzIG9uIGF0dHJpYnV0ZXM6XG4vLyAtIHZhbHVlIChjb21wYXJpbmcgYW4gYXR0cmlidXRlIHRvIGEgdmFsdWUsIHVzaW5nIGFuIG9wZXJhdG9yKVxuLy8gICAgICA+ID49IDwgPD0gPSAhPSBMSUtFIE5PVC1MSUtFIENPTlRBSU5TIERPRVMtTk9ULUNPTlRBSU5cbi8vIC0gbXVsdGl2YWx1ZSAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBtdWx0aXBsZSB2YWx1ZSlcbi8vICAgICAgT05FLU9GIE5PVC1PTkUgT0Zcbi8vIC0gcmFuZ2UgKHN1YnR5cGUgb2YgbXVsdGl2YWx1ZSwgZm9yIGNvb3JkaW5hdGUgcmFuZ2VzKVxuLy8gICAgICBXSVRISU4gT1VUU0lERSBPVkVSTEFQUyBET0VTLU5PVC1PVkVSTEFQXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTClcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIHJlZmVyZW5jZXMvY29sbGVjdGlvbnNcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMIHJlZi9lbXB0eSBjb2xsZWN0aW9uKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vLyAtIGxvb2t1cCAoXG4vLyAgICAgIExPT0tVUFxuLy8gLSBzdWJjbGFzc1xuLy8gICAgICBJU0Fcbi8vIC0gbGlzdFxuLy8gICAgICBJTiBOT1QtSU5cbi8vIC0gbG9vcCAoVE9ETylcblxudmFyIE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxudmFyIE5VTExBQkxFVFlQRVM9IFtcbiAgICBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiLFxuICAgIFwiamF2YS5sYW5nLlN0cmluZ1wiLFxuICAgIFwiamF2YS5sYW5nLkJvb2xlYW5cIlxuXTtcblxudmFyIExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJPYmplY3RcIlxuXVxuXG5cbnZhciBPUFMgPSBbXG5cbiAgICAvLyBWYWxpZCBmb3IgYW55IGF0dHJpYnV0ZVxuICAgIC8vIEFsc28gdGhlIG9wZXJhdG9ycyBmb3IgbG9vcCBjb25zdHJhaW50cyAobm90IHlldCBpbXBsZW1lbnRlZCkuXG4gICAge1xuICAgIG9wOiBcIj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSx7XG4gICAgb3A6IFwiIT1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3IgbnVtZXJpYyBhbmQgZGF0ZSBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIj5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIj49XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3Igc3RyaW5nIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiQ09OVEFJTlNcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cblxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIENPTlRBSU5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIExJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJPTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBmb3IgTG9jYXRpb24gbm9kZXNcbiAgICB7XG4gICAgb3A6IFwiV0lUSElOXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9WRVJMQVBTXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIE9WRVJMQVBcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1VUU0lERVwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LFxuIFxuICAgIC8vIE5VTEwgY29uc3RyYWludHMuIFZhbGlkIGZvciBhbnkgbm9kZSBleGNlcHQgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVMgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCJJUyBOT1QgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSAoaS5lLiwgdGhlIHJvb3QsIG9yIGFueSBcbiAgICAvLyByZWZlcmVuY2Ugb3IgY29sbGVjdGlvbiBub2RlKS5cbiAgICB7XG4gICAgb3A6IFwiTE9PS1VQXCIsXG4gICAgY3R5cGU6IFwibG9va3VwXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIklOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJOT1QgSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSBleGNlcHQgdGhlIHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTQVwiLFxuICAgIGN0eXBlOiBcInN1YmNsYXNzXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9XTtcbi8vXG52YXIgT1BJTkRFWCA9IE9QUy5yZWR1Y2UoZnVuY3Rpb24oeCxvKXtcbiAgICB4W28ub3BdID0gbztcbiAgICByZXR1cm4geDtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8vIFByb21pc2lmaWVzIGEgY2FsbCB0byBkMy5qc29uLlxuLy8gQXJnczpcbi8vICAgdXJsIChzdHJpbmcpIFRoZSB1cmwgb2YgdGhlIGpzb24gcmVzb3VyY2Vcbi8vIFJldHVybnM6XG4vLyAgIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBqc29uIG9iamVjdCB2YWx1ZSwgb3IgcmVqZWN0cyB3aXRoIGFuIGVycm9yXG5mdW5jdGlvbiBkM2pzb25Qcm9taXNlKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZDMuanNvbih1cmwsIGZ1bmN0aW9uKGVycm9yLCBqc29uKXtcbiAgICAgICAgICAgIGVycm9yID8gcmVqZWN0KHsgc3RhdHVzOiBlcnJvci5zdGF0dXMsIHN0YXR1c1RleHQ6IGVycm9yLnN0YXR1c1RleHR9KSA6IHJlc29sdmUoanNvbik7XG4gICAgICAgIH0pXG4gICAgfSk7XG59XG5cbi8vIFNlbGVjdHMgYWxsIHRoZSB0ZXh0IGluIHRoZSBnaXZlbiBjb250YWluZXIuIFxuLy8gVGhlIGNvbnRhaW5lciBtdXN0IGhhdmUgYW4gaWQuXG4vLyBDb3BpZWQgZnJvbTpcbi8vICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzE2Nzc0NTEvaG93LXRvLXNlbGVjdC1kaXYtdGV4dC1vbi1idXR0b24tY2xpY2tcbmZ1bmN0aW9uIHNlbGVjdFRleHQoY29udGFpbmVyaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn1cblxuLy8gQ29udmVydHMgYW4gSW50ZXJNaW5lIHF1ZXJ5IGluIFBhdGhRdWVyeSBYTUwgZm9ybWF0IHRvIGEgSlNPTiBvYmplY3QgcmVwcmVzZW50YXRpb24uXG4vL1xuZnVuY3Rpb24gcGFyc2VQYXRoUXVlcnkoeG1sKXtcbiAgICAvLyBUdXJucyB0aGUgcXVhc2ktbGlzdCBvYmplY3QgcmV0dXJuZWQgYnkgc29tZSBET00gbWV0aG9kcyBpbnRvIGFjdHVhbCBsaXN0cy5cbiAgICBmdW5jdGlvbiBkb21saXN0MmFycmF5KGxzdCkge1xuICAgICAgICBsZXQgYSA9IFtdO1xuICAgICAgICBmb3IobGV0IGk9MDsgaTxsc3QubGVuZ3RoOyBpKyspIGEucHVzaChsc3RbaV0pO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgLy8gcGFyc2UgdGhlIFhNTFxuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGRvbSA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sLCBcInRleHQveG1sXCIpO1xuXG4gICAgLy8gZ2V0IHRoZSBwYXJ0cy4gVXNlciBtYXkgcGFzdGUgaW4gYSA8dGVtcGxhdGU+IG9yIGEgPHF1ZXJ5PlxuICAgIC8vIChpLmUuLCB0ZW1wbGF0ZSBtYXkgYmUgbnVsbClcbiAgICBsZXQgdGVtcGxhdGUgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZW1wbGF0ZVwiKVswXTtcbiAgICBsZXQgdGl0bGUgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSB8fCBcIlwiO1xuICAgIGxldCBjb21tZW50ID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwiY29tbWVudFwiKSB8fCBcIlwiO1xuICAgIGxldCBxdWVyeSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInF1ZXJ5XCIpWzBdO1xuICAgIGxldCBtb2RlbCA9IHsgbmFtZTogcXVlcnkuZ2V0QXR0cmlidXRlKFwibW9kZWxcIikgfHwgXCJnZW5vbWljXCIgfTtcbiAgICBsZXQgbmFtZSA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm5hbWVcIikgfHwgXCJcIjtcbiAgICBsZXQgZGVzY3JpcHRpb24gPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJsb25nRGVzY3JpdGlvblwiKSB8fCBcIlwiO1xuICAgIGxldCBzZWxlY3QgPSAocXVlcnkuZ2V0QXR0cmlidXRlKFwidmlld1wiKSB8fCBcIlwiKS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICBsZXQgY29uc3RyYWludHMgPSBkb21saXN0MmFycmF5KGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY29uc3RyYWludCcpKTtcbiAgICBsZXQgY29uc3RyYWludExvZ2ljID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwiY29uc3RyYWludExvZ2ljXCIpO1xuICAgIGxldCBqb2lucyA9IGRvbWxpc3QyYXJyYXkocXVlcnkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJqb2luXCIpKTtcbiAgICBsZXQgc29ydE9yZGVyID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpIHx8IFwiXCI7XG4gICAgLy9cbiAgICAvL1xuICAgIGxldCB3aGVyZSA9IGNvbnN0cmFpbnRzLm1hcChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBvcCA9IGMuZ2V0QXR0cmlidXRlKFwib3BcIik7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICAgICAgICBvcCA9IFwiSVNBXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdmFscyA9IGRvbWxpc3QyYXJyYXkoYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInZhbHVlXCIpKS5tYXAoIHYgPT4gdi5pbm5lckhUTUwgKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3A6IG9wLFxuICAgICAgICAgICAgICAgIHBhdGg6IGMuZ2V0QXR0cmlidXRlKFwicGF0aFwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGMuZ2V0QXR0cmlidXRlKFwidmFsdWVcIiksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogdmFscyxcbiAgICAgICAgICAgICAgICB0eXBlIDogYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLFxuICAgICAgICAgICAgICAgIGNvZGU6IGMuZ2V0QXR0cmlidXRlKFwiY29kZVwiKSxcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogYy5nZXRBdHRyaWJ1dGUoXCJlZGl0YWJsZVwiKSB8fCBcInRydWVcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIC8vIENoZWNrOiBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjb25zdHJhaW50LCAoYW5kIGl0J3Mgbm90IGFuIElTQSksIHNvbWV0aW1lcyB0aGUgY29uc3RyYWludExvZ2ljIFxuICAgIC8vIGFuZC9vciB0aGUgY29uc3RyYWludCBjb2RlIGFyZSBtaXNzaW5nLlxuICAgIGlmICh3aGVyZS5sZW5ndGggPT09IDEgJiYgd2hlcmVbMF0ub3AgIT09IFwiSVNBXCIgJiYgIXdoZXJlWzBdLmNvZGUpe1xuICAgICAgICB3aGVyZVswXS5jb2RlID0gY29uc3RyYWludExvZ2ljID0gXCJBXCI7XG4gICAgfVxuXG4gICAgLy8gb3V0ZXIgam9pbnMuIFRoZXkgbG9vayBsaWtlIHRoaXM6XG4gICAgLy8gICAgICAgPGpvaW4gcGF0aD1cIkdlbmUuc2VxdWVuY2VPbnRvbG9neVRlcm1cIiBzdHlsZT1cIk9VVEVSXCIvPlxuICAgIGpvaW5zID0gam9pbnMubWFwKCBqID0+IGouZ2V0QXR0cmlidXRlKFwicGF0aFwiKSApO1xuXG4gICAgbGV0IG9yZGVyQnkgPSBudWxsO1xuICAgIGlmIChzb3J0T3JkZXIpIHtcbiAgICAgICAgLy8gVGhlIGpzb24gZm9ybWF0IGZvciBvcmRlckJ5IGlzIGEgYml0IHdlaXJkLlxuICAgICAgICAvLyBJZiB0aGUgeG1sIG9yZGVyQnkgaXM6IFwiQS5iLmMgYXNjIEEuZC5lIGRlc2NcIixcbiAgICAgICAgLy8gdGhlIGpzb24gc2hvdWxkIGJlOiBbIHtcIkEuYi5jXCI6XCJhc2NcIn0sIHtcIkEuZC5lXCI6XCJkZXNjfSBdXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBUaGUgb3JkZXJieSBzdHJpbmcgdG9rZW5zLCBlLmcuIFtcIkEuYi5jXCIsIFwiYXNjXCIsIFwiQS5kLmVcIiwgXCJkZXNjXCJdXG4gICAgICAgIGxldCBvYiA9IHNvcnRPcmRlci50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrOlxuICAgICAgICBpZiAob2IubGVuZ3RoICUgMiApXG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBwYXJzZSB0aGUgb3JkZXJCeSBjbGF1c2U6IFwiICsgcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpO1xuICAgICAgICAvLyBjb252ZXJ0IHRva2VucyB0byBqc29uIG9yZGVyQnkgXG4gICAgICAgIG9yZGVyQnkgPSBvYi5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBjdXJyLCBpKXtcbiAgICAgICAgICAgIGlmIChpICUgMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgLy8gb2RkLiBjdXJyIGlzIGEgcGF0aC4gUHVzaCBpdC5cbiAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZXZlbi4gUG9wIHRoZSBwYXRoLCBjcmVhdGUgdGhlIHt9LCBhbmQgcHVzaCBpdC5cbiAgICAgICAgICAgICAgICBsZXQgdiA9IHt9XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBhY2MucG9wKClcbiAgICAgICAgICAgICAgICB2W3BdID0gY3VycjtcbiAgICAgICAgICAgICAgICBhY2MucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgY29uc3RyYWludExvZ2ljLFxuICAgICAgICBzZWxlY3QsXG4gICAgICAgIHdoZXJlLFxuICAgICAgICBqb2lucyxcbiAgICAgICAgb3JkZXJCeVxuICAgIH07XG59XG5cbi8vIFJldHVybnMgYSBkZWVwIGNvcHkgb2Ygb2JqZWN0IG8uIFxuLy8gQXJnczpcbi8vICAgbyAgKG9iamVjdCkgTXVzdCBiZSBhIEpTT04gb2JqZWN0IChubyBjdXJjdWxhciByZWZzLCBubyBmdW5jdGlvbnMpLlxuLy8gUmV0dXJuczpcbi8vICAgYSBkZWVwIGNvcHkgb2Ygb1xuZnVuY3Rpb24gZGVlcGMobykge1xuICAgIGlmICghbykgcmV0dXJuIG87XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobykpO1xufVxuXG4vL1xubGV0IFBSRUZJWD1cIm9yZy5tZ2kuYXBwcy5xYlwiO1xuZnVuY3Rpb24gdGVzdExvY2FsKGF0dHIpIHtcbiAgICByZXR1cm4gKFBSRUZJWCtcIi5cIithdHRyKSBpbiBsb2NhbFN0b3JhZ2U7XG59XG5mdW5jdGlvbiBzZXRMb2NhbChhdHRyLCB2YWwsIGVuY29kZSl7XG4gICAgbG9jYWxTdG9yYWdlW1BSRUZJWCtcIi5cIithdHRyXSA9IGVuY29kZSA/IEpTT04uc3RyaW5naWZ5KHZhbCkgOiB2YWw7XG59XG5mdW5jdGlvbiBnZXRMb2NhbChhdHRyLCBkZWNvZGUsIGRmbHQpe1xuICAgIGxldCBrZXkgPSBQUkVGSVgrXCIuXCIrYXR0cjtcbiAgICBpZiAoa2V5IGluIGxvY2FsU3RvcmFnZSl7XG4gICAgICAgIGxldCB2ID0gbG9jYWxTdG9yYWdlW2tleV07XG4gICAgICAgIGlmIChkZWNvZGUpIHYgPSBKU09OLnBhcnNlKHYpO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkZmx0O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyTG9jYWwoKSB7XG4gICAgbGV0IHJtdiA9IE9iamVjdC5rZXlzKGxvY2FsU3RvcmFnZSkuZmlsdGVyKGtleSA9PiBrZXkuc3RhcnRzV2l0aChQUkVGSVgpKTtcbiAgICBybXYuZm9yRWFjaCggayA9PiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrKSApO1xufVxuXG4vL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBVbmRvTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IobGltaXQpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50ZXIgPSAtMTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnRTdGF0ZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCAwKVxuICAgICAgICAgICAgdGhyb3cgXCJObyBjdXJyZW50IHN0YXRlLlwiO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIGdldCBoYXNTdGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPj0gMDtcbiAgICB9XG4gICAgZ2V0IGNhblVuZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID4gMDtcbiAgICB9XG4gICAgZ2V0IGNhblJlZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTdGF0ZSAmJiB0aGlzLnBvaW50ZXIgPCB0aGlzLmhpc3RvcnkubGVuZ3RoLTE7XG4gICAgfVxuICAgIGFkZCAocykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQUREXCIpO1xuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl0gPSBzO1xuICAgICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKHRoaXMucG9pbnRlcisxKTtcbiAgICB9XG4gICAgdW5kbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVTkRPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblVuZG8pIHRocm93IFwiTm8gdW5kby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICByZWRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJFRE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuUmVkbykgdGhyb3cgXCJObyByZWRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVbmRvTWFuYWdlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=