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
        layoutStyle: "tree"
    },
    constraintLogic: {
        layoutStyle: "dendrogram"
    },
    columnOrder: {
        layoutStyle: "dendrogram"
    },
    sortOrder: {
        layoutStyle: "dendrogram"
    }
};
let editView = editViews.queryMain;

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
      .text(function(d) {
          return d.name + (d.isSelected ? `(${d.view})` : "");
      })


  let drag = d3.behavior.drag();
  nodeGrps.call(drag);
  drag.on("drag", function () {
      //console.log("Drag", this, d3.event.dx, d3.event.dy);
      //console.log("Drag", this, d3.event.x, d3.event.y);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYzkwZGQ3ZjFlNTE4OGVhN2VjMzgiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsUUFBUTtBQUM2QztBQVU5RDs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIscUJBQXFCLFVBQVUsZ0NBQWdDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7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RTtBQUN0RjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEIsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakMseUJBQXlCO0FBQ3pCLDJCQUEyQjtBQUMzQiw2QkFBNkI7QUFDN0IsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztB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bUJBQW1CO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLHNDQUFzQyxtQkFBbUI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxtQkFBbUI7QUFDdkQ7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRyx5QkFBeUI7QUFDdkM7OztBQUdBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7QUNyckJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUwsa0JBQWtCOzs7Ozs7OztBQzVObEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixvREFBb0Q7QUFDaEYsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixjQUFjO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsY0FBYyxHQUFHLGNBQWM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoicWIuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYzkwZGQ3ZjFlNTE4OGVhN2VjMzgiLCJcbi8qXG4gKiBEYXRhIHN0cnVjdHVyZXM6XG4gKiAgIDAuIFRoZSBkYXRhIG1vZGVsIGZvciBhIG1pbmUgaXMgYSBncmFwaCBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBcbiAqICAgY2xhc3NlcywgdGhlaXIgY29tcG9uZW50cyAoYXR0cmlidXRlcywgcmVmZXJlbmNlcywgY29sbGVjdGlvbnMpLCBhbmQgcmVsYXRpb25zaGlwcy5cbiAqICAgMS4gVGhlIHF1ZXJ5IGlzIHJlcHJlc2VudGVkIGJ5IGEgZDMtc3R5bGUgaGllcmFyY2h5IHN0cnVjdHVyZTogYSBsaXN0IG9mXG4gKiAgIG5vZGVzLCB3aGVyZSBlYWNoIG5vZGUgaGFzIGEgbmFtZSAoc3RyaW5nKSwgYW5kIGEgY2hpbGRyZW4gbGlzdCAocG9zc2libHkgZW1wdHkgXG4gKiAgIGxpc3Qgb2Ygbm9kZXMpLiBUaGUgbm9kZXMgYW5kIHRoZSBwYXJlbnQvY2hpbGQgcmVsYXRpb25zaGlwcyBvZiB0aGlzIHN0cnVjdHVyZSBcbiAqICAgYXJlIHdoYXQgZHJpdmUgdGhlIGRpc2xheS5cbiAqICAgMi4gRWFjaCBub2RlIGluIHRoZSBkaWFncmFtIGNvcnJlc3BvbmRzIHRvIGEgY29tcG9uZW50IGluIGEgcGF0aCwgd2hlcmUgZWFjaFxuICogICBwYXRoIHN0YXJ0cyB3aXRoIHRoZSByb290IGNsYXNzLCBvcHRpb25hbGx5IHByb2NlZWRzIHRocm91Z2ggcmVmZXJlbmNlcyBhbmQgY29sbGVjdGlvbnMsXG4gKiAgIGFuZCBvcHRpb25hbGx5IGVuZHMgYXQgYW4gYXR0cmlidXRlLlxuICpcbiAqL1xuaW1wb3J0IHBhcnNlciBmcm9tICcuL3BhcnNlci5qcyc7XG4vL2ltcG9ydCB7IG1pbmVzIH0gZnJvbSAnLi9taW5lcy5qcyc7XG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHtcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgZ2V0TG9jYWwsXG4gICAgc2V0TG9jYWwsXG4gICAgdGVzdExvY2FsLFxuICAgIGNsZWFyTG9jYWwsXG4gICAgcGFyc2VQYXRoUXVlcnlcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmltcG9ydCBVbmRvTWFuYWdlciBmcm9tICcuL3VuZG9NYW5hZ2VyLmpzJztcblxubGV0IGN1cnJNaW5lO1xubGV0IGN1cnJUZW1wbGF0ZTtcbmxldCBjdXJyTm9kZTtcblxubGV0IG5hbWUybWluZTtcbmxldCBtO1xubGV0IHc7XG5sZXQgaDtcbmxldCBpO1xubGV0IHJvb3Q7XG5sZXQgZGlhZ29uYWw7XG5sZXQgdmlzO1xubGV0IG5vZGVzO1xubGV0IGxpbmtzO1xubGV0IGFuaW1hdGlvbkR1cmF0aW9uID0gMjUwOyAvLyBtc1xubGV0IGRlZmF1bHRDb2xvcnMgPSB7IGhlYWRlcjogeyBtYWluOiBcIiM1OTU0NTVcIiwgdGV4dDogXCIjZmZmXCIgfSB9O1xubGV0IGRlZmF1bHRMb2dvID0gXCJodHRwczovL2Nkbi5yYXdnaXQuY29tL2ludGVybWluZS9kZXNpZ24tbWF0ZXJpYWxzLzc4YTEzZGI1L2xvZ29zL2ludGVybWluZS9zcXVhcmVpc2gvNDV4NDUucG5nXCI7XG5sZXQgdW5kb01nciA9IG5ldyBVbmRvTWFuYWdlcigpO1xubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5sZXQgZWRpdFZpZXdzID0ge1xuICAgIHF1ZXJ5TWFpbjoge1xuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCJcbiAgICB9LFxuICAgIGNvbnN0cmFpbnRMb2dpYzoge1xuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCJcbiAgICB9LFxuICAgIGNvbHVtbk9yZGVyOiB7XG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIlxuICAgIH0sXG4gICAgc29ydE9yZGVyOiB7XG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIlxuICAgIH1cbn07XG5sZXQgZWRpdFZpZXcgPSBlZGl0Vmlld3MucXVlcnlNYWluO1xuXG5mdW5jdGlvbiBzZXR1cCgpe1xuICAgIG0gPSBbMjAsIDEyMCwgMjAsIDEyMF1cbiAgICB3ID0gMTI4MCAtIG1bMV0gLSBtWzNdXG4gICAgaCA9IDgwMCAtIG1bMF0gLSBtWzJdXG4gICAgaSA9IDBcblxuICAgIGRpYWdvbmFsID0gZDMuc3ZnLmRpYWdvbmFsKClcbiAgICAgICAgLnByb2plY3Rpb24oZnVuY3Rpb24oZCkgeyByZXR1cm4gW2QueCwgZC55XTsgfSk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIFNWRyBjb250YWluZXJcbiAgICB2aXMgPSBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyIHN2Z1wiKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIHcgKyBtWzFdICsgbVszXSlcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaCArIG1bMF0gKyBtWzJdKVxuICAgICAgICAub24oXCJjbGlja1wiLCBoaWRlRGlhbG9nKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbVszXSArIFwiLFwiICsgbVswXSArIFwiKVwiKTtcbiAgICAvL1xuICAgIGQzLnNlbGVjdCgnI3RJbmZvQmFyID4gaS5idXR0b25bbmFtZT1cIm9wZW5jbG9zZVwiXScpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IFxuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIik7XG4gICAgICAgICAgICBsZXQgd2FzQ2xvc2VkID0gdC5jbGFzc2VkKFwiY2xvc2VkXCIpO1xuICAgICAgICAgICAgbGV0IGlzQ2xvc2VkID0gIXdhc0Nsb3NlZDtcbiAgICAgICAgICAgIGxldCBkID0gZDMuc2VsZWN0KCcjZHJhd2VyJylbMF1bMF1cbiAgICAgICAgICAgIGlmIChpc0Nsb3NlZClcbiAgICAgICAgICAgICAgICAvLyBzYXZlIHRoZSBjdXJyZW50IGhlaWdodCBqdXN0IGJlZm9yZSBjbG9zaW5nXG4gICAgICAgICAgICAgICAgZC5fX3NhdmVkX2hlaWdodCA9IGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgZWxzZSBpZiAoZC5fX3NhdmVkX2hlaWdodClcbiAgICAgICAgICAgICAgIC8vIG9uIG9wZW4sIHJlc3RvcmUgdGhlIHNhdmVkIGhlaWdodFxuICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjZHJhd2VyJykuc3R5bGUoXCJoZWlnaHRcIiwgZC5fX3NhdmVkX2hlaWdodCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0LmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnRleHQoIGlzQ2xvc2VkID8gXCJhZGRcIiA6IFwiY2xlYXJcIiApO1xuICAgICAgICB9KTtcblxuICAgIGQzanNvblByb21pc2UocmVnaXN0cnlVcmwpXG4gICAgICAudGhlbihpbml0TWluZXMpXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzIHJlZ2lzdHJ5IGF0ICR7cmVnaXN0cnlVcmx9LiBUcnlpbmcgJHtyZWdpc3RyeUZpbGVVcmx9LmApO1xuICAgICAgICAgIGQzanNvblByb21pc2UocmVnaXN0cnlGaWxlVXJsKVxuICAgICAgICAgICAgICAudGhlbihpbml0TWluZXMpXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBhbGVydChcIkNhbm5vdCBhY2Nlc3MgcmVnaXN0cnkgZmlsZS4gVGhpcyBpcyBub3QgeW91ciBsdWNreSBkYXkuXCIpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIGQzLnNlbGVjdEFsbChcIiN0dGV4dCBsYWJlbCBzcGFuXCIpXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjdHRleHQnKS5hdHRyKCdjbGFzcycsICdmbGV4Y29sdW1uICcrdGhpcy5pbm5lclRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB1cGRhdGVUdGV4dCgpO1xuICAgICAgICB9KTtcbiAgICBkMy5zZWxlY3QoJyNydW5hdG1pbmUnKVxuICAgICAgICAub24oJ2NsaWNrJywgcnVuYXRtaW5lKTtcbiAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IC5idXR0b24uc3luYycpXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICBsZXQgdHVyblN5bmNPZmYgPSB0LnRleHQoKSA9PT0gXCJzeW5jXCI7XG4gICAgICAgICAgICB0LnRleHQoIHR1cm5TeW5jT2ZmID8gXCJzeW5jX2Rpc2FibGVkXCIgOiBcInN5bmNcIiApXG4gICAgICAgICAgICAgLmF0dHIoXCJ0aXRsZVwiLCAoKSA9PlxuICAgICAgICAgICAgICAgICBgQ291bnQgYXV0b3N5bmMgaXMgJHsgdHVyblN5bmNPZmYgPyBcIk9GRlwiIDogXCJPTlwiIH0uIENsaWNrIHRvIHR1cm4gaXQgJHsgdHVyblN5bmNPZmYgPyBcIk9OXCIgOiBcIk9GRlwiIH0uYCk7XG4gICAgICAgICAgICAhdHVyblN5bmNPZmYgJiYgdXBkYXRlQ291bnQoKTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJzeW5jb2ZmXCIsIHR1cm5TeW5jT2ZmKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpXG4gICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcInhtbHRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJqc29udGV4dGFyZWFcIil9KTtcbiAgICBkMy5zZWxlY3QoXCIjdW5kb0J1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCB1bmRvKTtcbiAgICBkMy5zZWxlY3QoXCIjcmVkb0J1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCByZWRvKTtcbn1cblxuZnVuY3Rpb24gaW5pdE1pbmVzKGpfbWluZXMpIHtcbiAgICB2YXIgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICBuYW1lMm1pbmUgPSB7fTtcbiAgICBtaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKG0peyBuYW1lMm1pbmVbbS5uYW1lXSA9IG07IH0pO1xuICAgIGN1cnJNaW5lID0gbWluZXNbMF07XG4gICAgY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgIHZhciBtbCA9IGQzLnNlbGVjdChcIiNtbGlzdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShtaW5lcyk7XG4gICAgdmFyIHNlbGVjdE1pbmUgPSBcIk1vdXNlTWluZVwiO1xuICAgIG1sLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICB2YXIgbSA9IGQudXJsLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgIHZhciB2ID0gKHcgJiYgIW0pIHx8IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZT09PXNlbGVjdE1pbmUgfHwgbnVsbDsgfSlcbiAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pO1xuICAgIC8vXG4gICAgLy8gd2hlbiBhIG1pbmUgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdFxuICAgIGQzLnNlbGVjdChcIiNtbGlzdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZWN0ZWRNaW5lKHRoaXMudmFsdWUpOyB9KTtcbiAgICAvL1xuICAgIHZhciBkZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIik7XG4gICAgZGcuY2xhc3NlZChcImhpZGRlblwiLHRydWUpXG4gICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5jbG9zZVwiKS5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpO1xuICAgIGRnLnNlbGVjdChcIi5idXR0b24ucmVtb3ZlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gcmVtb3ZlTm9kZShjdXJyTm9kZSkpO1xuXG4gICAgLy8gXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoXCIjZWRpdFZpZXdcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHsgc2V0RWRpdFZpZXcodGhpcy52YWx1ZSk7IH0pXG4gICAgICAgIDtcblxuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc3ViY2xhc3NDb25zdHJhaW50IHNlbGVjdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2V0U3ViY2xhc3NDb25zdHJhaW50KGN1cnJOb2RlLCB0aGlzLnZhbHVlKTsgfSk7XG4gICAgLy9cbiAgICBkMy5zZWxlY3QoXCIjZGlhbG9nIC5zZWxlY3QtY3RybFwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGN1cnJOb2RlLmlzU2VsZWN0ZWQgPyBjdXJyTm9kZS51bnNlbGVjdCgpIDogY3Vyck5vZGUuc2VsZWN0KCk7XG4gICAgICAgICAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc2VsZWN0LWN0cmxcIikuY2xhc3NlZChcInNlbGVjdGVkXCIsIGN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgZmlyc3QgbWluZSBieSBkZWZhdWx0LlxuICAgIHNlbGVjdGVkTWluZShzZWxlY3RNaW5lKTtcbn1cbi8vXG5mdW5jdGlvbiBjbGVhclN0YXRlKCkge1xuICAgIHVuZG9NZ3IuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHNhdmVTdGF0ZSgpIHtcbiAgICBsZXQgcyA9IEpTT04uc3RyaW5naWZ5KHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSkpO1xuICAgIHVuZG9NZ3IuYWRkKHMpO1xufVxuZnVuY3Rpb24gdW5kbygpIHsgdW5kb3JlZG8oXCJ1bmRvXCIpIH1cbmZ1bmN0aW9uIHJlZG8oKSB7IHVuZG9yZWRvKFwicmVkb1wiKSB9XG5mdW5jdGlvbiB1bmRvcmVkbyh3aGljaCl7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHMgPSBKU09OLnBhcnNlKHVuZG9NZ3Jbd2hpY2hdKCkpO1xuICAgICAgICBlZGl0VGVtcGxhdGUocywgdHJ1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbi8vIENhbGxlZCB3aGVuIHVzZXIgc2VsZWN0cyBhIG1pbmUgZnJvbSB0aGUgb3B0aW9uIGxpc3Rcbi8vIExvYWRzIHRoYXQgbWluZSdzIGRhdGEgbW9kZWwgYW5kIGFsbCBpdHMgdGVtcGxhdGVzLlxuLy8gVGhlbiBpbml0aWFsaXplcyBkaXNwbGF5IHRvIHNob3cgdGhlIGZpcnN0IHRlcm1wbGF0ZSdzIHF1ZXJ5LlxuZnVuY3Rpb24gc2VsZWN0ZWRNaW5lKG1uYW1lKXtcbiAgICBjdXJyTWluZSA9IG5hbWUybWluZVttbmFtZV1cbiAgICBpZighY3Vyck1pbmUpIHJldHVybjtcbiAgICBsZXQgdXJsID0gY3Vyck1pbmUudXJsO1xuICAgIGxldCB0dXJsLCBtdXJsLCBsdXJsLCBidXJsLCBzdXJsLCBvdXJsO1xuICAgIGN1cnJNaW5lLnRuYW1lcyA9IFtdXG4gICAgY3Vyck1pbmUudGVtcGxhdGVzID0gW11cbiAgICBpZiAobW5hbWUgPT09IFwidGVzdFwiKSB7IFxuICAgICAgICB0dXJsID0gdXJsICsgXCIvdGVtcGxhdGVzLmpzb25cIjtcbiAgICAgICAgbXVybCA9IHVybCArIFwiL21vZGVsLmpzb25cIjtcbiAgICAgICAgbHVybCA9IHVybCArIFwiL2xpc3RzLmpzb25cIjtcbiAgICAgICAgYnVybCA9IHVybCArIFwiL2JyYW5kaW5nLmpzb25cIjtcbiAgICAgICAgc3VybCA9IHVybCArIFwiL3N1bW1hcnlmaWVsZHMuanNvblwiO1xuICAgICAgICBvdXJsID0gdXJsICsgXCIvb3JnYW5pc21saXN0Lmpzb25cIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHR1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3RlbXBsYXRlcz9mb3JtYXQ9anNvblwiO1xuICAgICAgICBtdXJsID0gdXJsICsgXCIvc2VydmljZS9tb2RlbD9mb3JtYXQ9anNvblwiO1xuICAgICAgICBsdXJsID0gdXJsICsgXCIvc2VydmljZS9saXN0cz9mb3JtYXQ9anNvblwiO1xuICAgICAgICBidXJsID0gdXJsICsgXCIvc2VydmljZS9icmFuZGluZ1wiO1xuICAgICAgICBzdXJsID0gdXJsICsgXCIvc2VydmljZS9zdW1tYXJ5ZmllbGRzXCI7XG4gICAgICAgIG91cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JTNDcXVlcnkrbmFtZSUzRCUyMiUyMittb2RlbCUzRCUyMmdlbm9taWMlMjIrdmlldyUzRCUyMk9yZ2FuaXNtLnNob3J0TmFtZSUyMitsb25nRGVzY3JpcHRpb24lM0QlMjIlMjIlM0UlM0MlMkZxdWVyeSUzRSZmb3JtYXQ9anNvbm9iamVjdHNcIjtcbiAgICB9XG4gICAgLy8gZ2V0IHRoZSBtb2RlbFxuICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyByZXNvdXJjZXMgZnJvbSBcIiArIHVybCApO1xuICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZDNqc29uUHJvbWlzZShtdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZSh0dXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShsdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShidXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShzdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShvdXJsKVxuICAgIF0pLnRoZW4oIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGpfbW9kZWwgPSBkYXRhWzBdO1xuICAgICAgICB2YXIgal90ZW1wbGF0ZXMgPSBkYXRhWzFdO1xuICAgICAgICB2YXIgal9saXN0cyA9IGRhdGFbMl07XG4gICAgICAgIHZhciBqX2JyYW5kaW5nID0gZGF0YVszXTtcbiAgICAgICAgdmFyIGpfc3VtbWFyeSA9IGRhdGFbNF07XG4gICAgICAgIHZhciBqX29yZ2FuaXNtcyA9IGRhdGFbNV07XG4gICAgICAgIC8vXG4gICAgICAgIGN1cnJNaW5lLm1vZGVsID0gY29tcGlsZU1vZGVsKGpfbW9kZWwubW9kZWwpXG4gICAgICAgIGN1cnJNaW5lLnRlbXBsYXRlcyA9IGpfdGVtcGxhdGVzLnRlbXBsYXRlcztcbiAgICAgICAgY3Vyck1pbmUubGlzdHMgPSBqX2xpc3RzLmxpc3RzO1xuICAgICAgICBjdXJyTWluZS5zdW1tYXJ5RmllbGRzID0gal9zdW1tYXJ5LmNsYXNzZXM7XG4gICAgICAgIGN1cnJNaW5lLm9yZ2FuaXNtTGlzdCA9IGpfb3JnYW5pc21zLnJlc3VsdHMubWFwKG8gPT4gby5zaG9ydE5hbWUpO1xuICAgICAgICAvL1xuICAgICAgICBjdXJyTWluZS50bGlzdCA9IG9iajJhcnJheShjdXJyTWluZS50ZW1wbGF0ZXMpXG4gICAgICAgIGN1cnJNaW5lLnRsaXN0LnNvcnQoZnVuY3Rpb24oYSxiKXsgXG4gICAgICAgICAgICByZXR1cm4gYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyTWluZS50bmFtZXMgPSBPYmplY3Qua2V5cyggY3Vyck1pbmUudGVtcGxhdGVzICk7XG4gICAgICAgIGN1cnJNaW5lLnRuYW1lcy5zb3J0KCk7XG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIHNlbGVjdGlvbiBsaXN0IG9mIHRlbXBsYXRlcyBmb3IgdGhpcyBtaW5lLlxuICAgICAgICB2YXIgdGwgPSBkMy5zZWxlY3QoXCIjdGxpc3Qgc2VsZWN0XCIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdvcHRpb24nKVxuICAgICAgICAgICAgLmRhdGEoIGN1cnJNaW5lLnRsaXN0ICk7XG4gICAgICAgIHRsLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKVxuICAgICAgICB0bC5leGl0KCkucmVtb3ZlKClcbiAgICAgICAgdGwuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpe3JldHVybiBkLnRpdGxlO30pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBzdGFydEVkaXQpO1xuICAgICAgICBlZGl0VGVtcGxhdGUoY3Vyck1pbmUudGVtcGxhdGVzW2N1cnJNaW5lLnRsaXN0WzBdLm5hbWVdKTtcbiAgICAgICAgLy8gQXBwbHkgYnJhbmRpbmdcbiAgICAgICAgbGV0IGNscnMgPSBjdXJyTWluZS5jb2xvcnMgfHwgZGVmYXVsdENvbG9ycztcbiAgICAgICAgbGV0IGJnYyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIubWFpbiA6IGNscnMubWFpbi5mZztcbiAgICAgICAgbGV0IHR4YyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIudGV4dCA6IGNscnMubWFpbi5iZztcbiAgICAgICAgbGV0IGxvZ28gPSBjdXJyTWluZS5pbWFnZXMubG9nbyB8fCBkZWZhdWx0TG9nbztcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNtaW5lTG9nb1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgbG9nbyk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGN1cnJNaW5lLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0IFxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjdXJyTWluZS5tb2RlbC5jbGFzc2VzKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZEVkaXRTb3VyY2UodGhpcy52YWx1ZSk7IHN0YXJ0RWRpdCgpOyB9KTtcbiAgICAgICAgc2VsZWN0ZWRFZGl0U291cmNlKCBcInRsaXN0XCIgKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpWzBdWzBdLnZhbHVlID0gXCJcIjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKS52YWx1ZSA9IFwiXCI7XG5cbiAgICB9LCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y3Vyck1pbmUubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgIH0pO1xufVxuXG4vL1xuZnVuY3Rpb24gc3RhcnRFZGl0KCkge1xuICAgIC8vIHNlbGVjdG9yIGZvciBjaG9vc2luZyBlZGl0IGlucHV0IHNvdXJjZSwgYW5kIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGxldCBzcmNTZWxlY3RvciA9IGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKTtcbiAgICBsZXQgaW5wdXRJZCA9IHNyY1NlbGVjdG9yWzBdWzBdLnZhbHVlO1xuICAgIC8vIHRoZSBxdWVyeSBpbnB1dCBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNlbGVjdGVkIHNvdXJjZVxuICAgIGxldCBzcmMgPSBkMy5zZWxlY3QoYCMke2lucHV0SWR9IFtuYW1lPVwiaW5cIl1gKTtcbiAgICAvLyB0aGUgcXVhcnkgc3RhcnRpbmcgcG9pbnRcbiAgICBsZXQgdmFsID0gc3JjWzBdWzBdLnZhbHVlXG4gICAgaWYgKGlucHV0SWQgPT09IFwidGxpc3RcIikge1xuICAgICAgICAvLyBhIHNhdmVkIHF1ZXJ5IG9yIHRlbXBsYXRlXG4gICAgICAgIGVkaXRUZW1wbGF0ZShjdXJyTWluZS50ZW1wbGF0ZXNbdmFsXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwibmV3cWNsaXN0XCIpIHtcbiAgICAgICAgLy8gYSBuZXcgcXVlcnkgZnJvbSBhIHNlbGVjdGVkIHN0YXJ0aW5nIGNsYXNzXG4gICAgICAgIGxldCBudCA9IG5ldyBUZW1wbGF0ZSgpO1xuICAgICAgICBudC5zZWxlY3QucHVzaCh2YWwrXCIuaWRcIik7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShudCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0eG1sXCIpIHtcbiAgICAgICAgLy8gaW1wb3J0IHhtbCBxdWVyeVxuICAgICAgICB2YWwgJiYgZWRpdFRlbXBsYXRlKHBhcnNlUGF0aFF1ZXJ5KHZhbCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydGpzb25cIikge1xuICAgICAgICAvLyBpbXBvcnQganNvbiBxdWVyeVxuICAgICAgICB2YWwgJiYgZWRpdFRlbXBsYXRlKEpTT04ucGFyc2UodmFsKSk7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgdGhyb3cgXCJVbmtub3duIGVkaXQgc291cmNlLlwiXG59XG5cbi8vIFxuZnVuY3Rpb24gc2VsZWN0ZWRFZGl0U291cmNlKHNob3cpe1xuICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdID4gZGl2Lm9wdGlvbicpXG4gICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuaWQgPT09IHNob3cgPyBudWxsIDogXCJub25lXCI7IH0pO1xufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gdGhlIGdpdmVuIG9iamVjdC5cbi8vIFRoZSBsaXN0IGlzIHNvcnRlZCBieSB0aGUgaXRlbSBrZXlzLlxuLy8gSWYgbmFtZUF0dHIgaXMgc3BlY2lmaWVkLCB0aGUgaXRlbSBrZXkgaXMgYWxzbyBhZGRlZCB0byBlYWNoIGVsZW1lbnRcbi8vIGFzIGFuIGF0dHJpYnV0ZSAob25seSB3b3JrcyBpZiB0aG9zZSBpdGVtcyBhcmUgdGhlbXNlbHZlcyBvYmplY3RzKS5cbi8vIEV4YW1wbGVzOlxuLy8gICAgc3RhdGVzID0geydNRSc6e25hbWU6J01haW5lJ30sICdJQSc6e25hbWU6J0lvd2EnfX1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJ30sIHtuYW1lOidNYWluZSd9XVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcywgJ2FiYnJldicpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJyxhYmJyZXYnSUEnfSwge25hbWU6J01haW5lJyxhYmJyZXYnTUUnfV1cbi8vIEFyZ3M6XG4vLyAgICBvICAob2JqZWN0KSBUaGUgb2JqZWN0LlxuLy8gICAgbmFtZUF0dHIgKHN0cmluZykgSWYgc3BlY2lmaWVkLCBhZGRzIHRoZSBpdGVtIGtleSBhcyBhbiBhdHRyaWJ1dGUgdG8gZWFjaCBsaXN0IGVsZW1lbnQuXG4vLyBSZXR1cm46XG4vLyAgICBsaXN0IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gb1xuZnVuY3Rpb24gb2JqMmFycmF5KG8sIG5hbWVBdHRyKXtcbiAgICB2YXIga3MgPSBPYmplY3Qua2V5cyhvKTtcbiAgICBrcy5zb3J0KCk7XG4gICAgcmV0dXJuIGtzLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICBpZiAobmFtZUF0dHIpIG9ba10ubmFtZSA9IGs7XG4gICAgICAgIHJldHVybiBvW2tdO1xuICAgIH0pO1xufTtcblxuLy8gQWRkIGRpcmVjdCBjcm9zcyByZWZlcmVuY2VzIHRvIG5hbWVkIHR5cGVzLiAoRS5nLiwgd2hlcmUgdGhlXG4vLyBtb2RlbCBzYXlzIHRoYXQgR2VuZS5hbGxlbGVzIGlzIGEgY29sbGVjdGlvbiB3aG9zZSByZWZlcmVuY2VkVHlwZVxuLy8gaXMgdGhlIHN0cmluZyBcIkFsbGVsZVwiLCBhZGQgYSBkaXJlY3QgcmVmZXJlbmNlIHRvIHRoZSBBbGxlbGUgY2xhc3MpXG4vLyBBbHNvIGFkZHMgYXJyYXlzIGZvciBjb252ZW5pZW5jZSBmb3IgYWNjZXNzaW5nIGFsbCBjbGFzc2VzIG9yIGFsbCBhdHRyaWJ1dGVzIG9mIGEgY2xhc3MuXG4vL1xuZnVuY3Rpb24gY29tcGlsZU1vZGVsKG1vZGVsKXtcbiAgICAvLyBGaXJzdCBhZGQgY2xhc3NlcyB0aGF0IHJlcHJlc2VudCB0aGUgYmFzaWMgdHlwZVxuICAgIExFQUZUWVBFUy5mb3JFYWNoKGZ1bmN0aW9uKG4pe1xuICAgICAgICBtb2RlbC5jbGFzc2VzW25dID0ge1xuICAgICAgICAgICAgaXNMZWFmVHlwZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IG4sXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogbixcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgICAgICAgcmVmZXJlbmNlczogW10sXG4gICAgICAgICAgICBjb2xsZWN0aW9uczogW10sXG4gICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy9cbiAgICBtb2RlbC5hbGxDbGFzc2VzID0gb2JqMmFycmF5KG1vZGVsLmNsYXNzZXMpXG4gICAgdmFyIGNucyA9IE9iamVjdC5rZXlzKG1vZGVsLmNsYXNzZXMpO1xuICAgIGNucy5zb3J0KClcbiAgICBjbnMuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgIHZhciBjbHMgPSBtb2RlbC5jbGFzc2VzW2NuXTtcbiAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMgPSBvYmoyYXJyYXkoY2xzLmF0dHJpYnV0ZXMpXG4gICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMgPSBvYmoyYXJyYXkoY2xzLmNvbGxlY3Rpb25zKVxuICAgICAgICBjbHMuYWxsQXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImF0dHJpYnV0ZVwiOyB9KTtcbiAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImNvbGxlY3Rpb25cIjsgfSk7XG4gICAgICAgIGNscy5hbGxQYXJ0cyA9IGNscy5hbGxBdHRyaWJ1dGVzLmNvbmNhdChjbHMuYWxsUmVmZXJlbmNlcykuY29uY2F0KGNscy5hbGxDb2xsZWN0aW9ucyk7XG4gICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgbW9kZWwuYWxsQ2xhc3Nlcy5wdXNoKGNscyk7XG4gICAgICAgIC8vXG4gICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIHZhciBiYyA9IG1vZGVsLmNsYXNzZXNbZV07XG4gICAgICAgICAgICBpZiAoYmMuZXh0ZW5kZWRCeSkge1xuICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkucHVzaChjbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeSA9IFtjbHNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJjO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgT2JqZWN0LmtleXMoY2xzLnJlZmVyZW5jZXMpLmZvckVhY2goZnVuY3Rpb24ocm4pe1xuICAgICAgICAgICAgdmFyIHIgPSBjbHMucmVmZXJlbmNlc1tybl07XG4gICAgICAgICAgICByLnR5cGUgPSBtb2RlbC5jbGFzc2VzW3IucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICBPYmplY3Qua2V5cyhjbHMuY29sbGVjdGlvbnMpLmZvckVhY2goZnVuY3Rpb24oY24pe1xuICAgICAgICAgICAgdmFyIGMgPSBjbHMuY29sbGVjdGlvbnNbY25dO1xuICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbW9kZWw7XG59XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3VwZXJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChcbi8vIFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdXBlcmNsYXNzZXMoY2xzKXtcbiAgICBpZiAodHlwZW9mKGNscykgPT09IFwic3RyaW5nXCIgfHwgIWNsc1tcImV4dGVuZHNcIl0gfHwgY2xzW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBhbmMgPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdXBlcmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzW1wiZXh0ZW5kc1wiXS5jb25jYXQoYW5jLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgdmFyIGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3ViY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1YmNsYXNzZXMoY2xzKXtcbiAgICBpZiAodHlwZW9mKGNscykgPT09IFwic3RyaW5nXCIgfHwgIWNscy5leHRlbmRlZEJ5IHx8IGNscy5leHRlbmRlZEJ5Lmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgdmFyIGRlc2MgPSBjbHMuZXh0ZW5kZWRCeS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3ViY2xhc3NlcyhzYyk7IH0pO1xuICAgIHZhciBhbGwgPSBjbHMuZXh0ZW5kZWRCeS5jb25jYXQoZGVzYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWZmIHN1YiBpcyBhIHN1YmNsYXNzIG9mIHN1cC5cbmZ1bmN0aW9uIGlzU3ViY2xhc3Moc3ViLHN1cCkge1xuICAgIGlmIChzdWIgPT09IHN1cCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHR5cGVvZihzdWIpID09PSBcInN0cmluZ1wiIHx8ICFzdWJbXCJleHRlbmRzXCJdIHx8IHN1YltcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgciA9IHN1YltcImV4dGVuZHNcIl0uZmlsdGVyKGZ1bmN0aW9uKHgpeyByZXR1cm4geD09PXN1cCB8fCBpc1N1YmNsYXNzKHgsIHN1cCk7IH0pO1xuICAgIHJldHVybiByLmxlbmd0aCA+IDA7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIGxpc3QgaXMgdmFsaWQgYXMgYSBsaXN0IGNvbnN0cmFpbnQgb3B0aW9uIGZvclxuLy8gdGhlIG5vZGUgbi4gQSBsaXN0IGlzIHZhbGlkIHRvIHVzZSBpbiBhIGxpc3QgY29uc3RyYWludCBhdCBub2RlIG4gaWZmXG4vLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgZXF1YWwgdG8gb3IgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGVcbi8vICAgICAqIHRoZSBsaXN0J3MgdHlwZSBpcyBhIHN1cGVyY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlLiBJbiB0aGlzIGNhc2UsXG4vLyAgICAgICBlbGVtZW50cyBpbiB0aGUgbGlzdCB0aGF0IGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBub2RlJ3MgdHlwZVxuLy8gICAgICAgYXJlIGF1dG9tYXRpY2FsbHkgZmlsdGVyZWQgb3V0LlxuZnVuY3Rpb24gaXNWYWxpZExpc3RDb25zdHJhaW50KGxpc3QsIG4pe1xuICAgIHZhciBudCA9IG4uc3VidHlwZUNvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICBpZiAodHlwZW9mKG50KSA9PT0gXCJzdHJpbmdcIiApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgbHQgPSBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW2xpc3QudHlwZV07XG4gICAgcmV0dXJuIGlzU3ViY2xhc3MobHQsIG50KSB8fCBpc1N1YmNsYXNzKG50LCBsdCk7XG59XG5cbi8vIENvbXBpbGVzIGEgXCJyYXdcIiB0ZW1wbGF0ZSAtIHN1Y2ggYXMgb25lIHJldHVybmVkIGJ5IHRoZSAvdGVtcGxhdGVzIHdlYiBzZXJ2aWNlIC0gYWdhaW5zdFxuLy8gYSBtb2RlbC4gVGhlIG1vZGVsIHNob3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBjb21waWxlZC5cbi8vIEFyZ3M6XG4vLyAgIHRlbXBsYXRlIC0gYSB0ZW1wbGF0ZSBxdWVyeSBhcyBhIGpzb24gb2JqZWN0XG4vLyAgIG1vZGVsIC0gdGhlIG1pbmUncyBtb2RlbCwgYWxyZWFkeSBjb21waWxlZCAoc2VlIGNvbXBpbGVNb2RlbCkuXG4vLyBSZXR1cm5zOlxuLy8gICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIENyZWF0ZXMgYSB0cmVlIG9mIHF1ZXJ5IG5vZGVzIChzdWl0YWJsZSBmb3IgZHJhd2luZyBieSBkMywgQlRXKS5cbi8vICAgQWRkcyB0aGlzIHRyZWUgdG8gdGhlIHRlbXBsYXRlIG9iamVjdCBhcyBhdHRyaWJ1dGUgJ3F0cmVlJy5cbi8vICAgVHVybnMgZWFjaCAoc3RyaW5nKSBwYXRoIGludG8gYSByZWZlcmVuY2UgdG8gYSB0cmVlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGF0IHBhdGguXG5mdW5jdGlvbiBjb21waWxlVGVtcGxhdGUodGVtcGxhdGUsIG1vZGVsKSB7XG4gICAgdmFyIHJvb3RzID0gW11cbiAgICB2YXIgdCA9IHRlbXBsYXRlO1xuICAgIC8vIHRoZSB0cmVlIG9mIG5vZGVzIHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcXVlcnkgd2lsbCBnbyBoZXJlXG4gICAgdC5xdHJlZSA9IG51bGw7XG4gICAgLy8gaW5kZXggb2YgY29kZSB0byBjb25zdHJhaW50IGdvcnMgaGVyZS5cbiAgICB0LmNvZGUyYyA9IHt9XG4gICAgLy8gbm9ybWFsaXplIHRoaW5ncyB0aGF0IG1heSBiZSB1bmRlZmluZWRcbiAgICB0LmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICB0LmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgIC8vXG4gICAgdmFyIHN1YmNsYXNzQ3MgPSBbXTtcbiAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgaWYgKGMudHlwZSkge1xuICAgICAgICAgICAgYy5vcCA9IFwiSVNBXCJcbiAgICAgICAgICAgIHN1YmNsYXNzQ3MucHVzaChjKTtcbiAgICAgICAgfVxuICAgICAgICBjLmN0eXBlID0gT1BJTkRFWFtjLm9wXS5jdHlwZTtcbiAgICAgICAgaWYgKGMuY29kZSkgdC5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcIm51bGxcIil7XG4gICAgICAgICAgICAvLyBXaXRoIG51bGwvbm90LW51bGwgY29uc3RyYWludHMsIElNIGhhcyBhIHdlaXJkIHF1aXJrIG9mIGZpbGxpbmcgdGhlIHZhbHVlIFxuICAgICAgICAgICAgLy8gZmllbGQgd2l0aCB0aGUgb3BlcmF0b3IuIEUuZy4sIGZvciBhbiBcIklTIE5PVCBOVUxMXCIgb3ByZWF0b3IsIHRoZSB2YWx1ZSBmaWVsZCBpc1xuICAgICAgICAgICAgLy8gYWxzbyBcIklTIE5PVCBOVUxMXCIuIFxuICAgICAgICAgICAgLy8gXG4gICAgICAgICAgICBjLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBkZWFsIHdpdGggZXh0cmFWYWx1ZSBoZXJlICg/KVxuICAgICAgICB9XG4gICAgfSlcbiAgICAvLyBtdXN0IHByb2Nlc3MgYW55IHN1YmNsYXNzIGNvbnN0cmFpbnRzIGZpcnN0LCBmcm9tIHNob3J0ZXN0IHRvIGxvbmdlc3QgcGF0aFxuICAgIHN1YmNsYXNzQ3NcbiAgICAgICAgLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnBhdGgubGVuZ3RoIC0gYi5wYXRoLmxlbmd0aDtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGMucGF0aCwgbW9kZWwpO1xuICAgICAgICAgICAgIHZhciBjbHMgPSBtb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgICAgIH0pO1xuICAgIC8vXG4gICAgdC53aGVyZSAmJiB0LndoZXJlLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBjLnBhdGgsIG1vZGVsKTtcbiAgICAgICAgaWYgKG4uY29uc3RyYWludHMpXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbi5jb25zdHJhaW50cyA9IFtjXTtcbiAgICB9KVxuXG4gICAgLy9cbiAgICB0LnNlbGVjdCAmJiB0LnNlbGVjdC5mb3JFYWNoKGZ1bmN0aW9uKHAsaSl7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBwLCBtb2RlbCk7XG4gICAgICAgIG4uc2VsZWN0KCk7XG4gICAgfSlcbiAgICB0LmpvaW5zICYmIHQuam9pbnMuZm9yRWFjaChmdW5jdGlvbihqKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGosIG1vZGVsKTtcbiAgICAgICAgbi5qb2luID0gXCJvdXRlclwiO1xuICAgIH0pXG4gICAgdC5vcmRlckJ5ICYmIHQub3JkZXJCeS5mb3JFYWNoKGZ1bmN0aW9uKG8sIGkpe1xuICAgICAgICB2YXIgcCA9IE9iamVjdC5rZXlzKG8pWzBdXG4gICAgICAgIHZhciBkaXIgPSBvW3BdXG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBwLCBtb2RlbCk7XG4gICAgICAgIG4uc29ydCA9IHsgZGlyOiBkaXIsIGxldmVsOiBpIH07XG4gICAgfSk7XG4gICAgaWYgKCF0LnF0cmVlKSB7XG4gICAgICAgIHRocm93IFwiTm8gcGF0aHMgaW4gcXVlcnkuXCJcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59XG5cbi8vIFR1cm5zIGEgcXRyZWUgc3RydWN0dXJlIGJhY2sgaW50byBhIFwicmF3XCIgdGVtcGxhdGUuIFxuLy9cbmZ1bmN0aW9uIHVuY29tcGlsZVRlbXBsYXRlKHRtcGx0KXtcbiAgICB2YXIgdCA9IHtcbiAgICAgICAgbmFtZTogdG1wbHQubmFtZSxcbiAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICBkZXNjcmlwdGlvbjogdG1wbHQuZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbW1lbnQ6IHRtcGx0LmNvbW1lbnQsXG4gICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgIG1vZGVsOiBkZWVwYyh0bXBsdC5tb2RlbCksXG4gICAgICAgIHRhZ3M6IGRlZXBjKHRtcGx0LnRhZ3MpLFxuICAgICAgICBzZWxlY3QgOiB0bXBsdC5zZWxlY3QuY29uY2F0KCksXG4gICAgICAgIHdoZXJlIDogW10sXG4gICAgICAgIGpvaW5zIDogW10sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYzogdG1wbHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCIsXG4gICAgICAgIG9yZGVyQnkgOiBbXVxuICAgIH1cbiAgICBmdW5jdGlvbiByZWFjaChuKXtcbiAgICAgICAgdmFyIHAgPSBuLnBhdGhcbiAgICAgICAgaWYgKG4uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gcGF0aCBzaG91bGQgYWxyZWFkeSBiZSB0aGVyZVxuICAgICAgICAgICAgaWYgKHQuc2VsZWN0LmluZGV4T2Yobi5wYXRoKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJBbm9tYWx5IGRldGVjdGVkIGluIHNlbGVjdCBsaXN0LlwiO1xuICAgICAgICB9XG4gICAgICAgIChuLmNvbnN0cmFpbnRzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgIHQud2hlcmUucHVzaChjKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKG4uam9pbiA9PT0gXCJvdXRlclwiKSB7XG4gICAgICAgICAgICB0LmpvaW5zLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgbGV0IHMgPSB7fVxuICAgICAgICAgICAgc1twXSA9IG4uc29ydC5kaXI7XG4gICAgICAgICAgICB0Lm9yZGVyQnlbbi5zb3J0LmxldmVsXSA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlYWNoKTtcbiAgICB9XG5cbiAgICByZWFjaCh0bXBsdC5xdHJlZSk7XG4gICAgdC5vcmRlckJ5ID0gdC5vcmRlckJ5LmZpbHRlcihvID0+IG8pO1xuICAgIHJldHVybiB0XG59XG5cbi8vXG5jbGFzcyBOb2RlIHtcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgdGVtcGxhdGUgKFRlbXBsYXRlIG9iamVjdCkgdGhlIHRlbXBsYXRlIHRoYXQgb3ducyB0aGlzIG5vZGVcbiAgICAvLyAgIHBhcmVudCAob2JqZWN0KSBQYXJlbnQgb2YgdGhlIG5ldyBub2RlLlxuICAgIC8vICAgbmFtZSAoc3RyaW5nKSBOYW1lIGZvciB0aGUgbm9kZVxuICAgIC8vICAgcGNvbXAgKG9iamVjdCkgUGF0aCBjb21wb25lbnQgZm9yIHRoZSByb290LCB0aGlzIGlzIGEgY2xhc3MuIEZvciBvdGhlciBub2RlcywgYW4gYXR0cmlidXRlLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbiBkZWNyaXB0b3IuXG4gICAgLy8gICBwdHlwZSAob2JqZWN0IG9yIHN0cmluZykgVHlwZSBvZiBwY29tcC5cbiAgICBjb25zdHJ1Y3RvciAodGVtcGxhdGUsIHBhcmVudCwgbmFtZSwgcGNvbXAsIHB0eXBlKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTsgLy8gdGhlIHRlbXBsYXRlIEkgYmVsb25nIHRvLlxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lOyAgICAgLy8gZGlzcGxheSBuYW1lXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTsgICAvLyBjaGlsZCBub2Rlc1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDsgLy8gcGFyZW50IG5vZGVcbiAgICAgICAgdGhpcy5wY29tcCA9IHBjb21wOyAgIC8vIHBhdGggY29tcG9uZW50IHJlcHJlc2VudGVkIGJ5IHRoZSBub2RlLiBBdCByb290LCB0aGlzIGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3RhcnRpbmcgY2xhc3MuIE90aGVyd2lzZSwgcG9pbnRzIHRvIGFuIGF0dHJpYnV0ZSAoc2ltcGxlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbikuXG4gICAgICAgIHRoaXMucHR5cGUgID0gcHR5cGU7ICAvLyBwYXRoIHR5cGUuIFRoZSB0eXBlIG9mIHRoZSBwYXRoIGF0IHRoaXMgbm9kZSwgaS5lLiB0aGUgdHlwZSBvZiBwY29tcC4gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3Igc2ltcGxlIGF0dHJpYnV0ZXMsIHRoaXMgaXMgYSBzdHJpbmcuIE90aGVyd2lzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbC4gTWF5IGJlIG92ZXJyaWRlbiBieSBzdWJjbGFzcyBjb25zdHJhaW50LlxuICAgICAgICB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7IC8vIHN1YmNsYXNzIGNvbnN0cmFpbnQgKGlmIGFueSkuIFBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgc3BlY2lmaWVkLCBvdmVycmlkZXMgcHR5cGUgYXMgdGhlIHR5cGUgb2YgdGhlIG5vZGUuXG4gICAgICAgIHRoaXMuY29uc3RyYWludHMgPSBbXTsvLyBhbGwgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDsgICAgLy8gSWYgc2VsZWN0ZWQgZm9yIHJldHVybiwgdGhpcyBpcyBpdHMgY29sdW1uIy5cbiAgICAgICAgcGFyZW50ICYmIHBhcmVudC5jaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMucGF0aDtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgcm9vdE5vZGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZS5xdHJlZTtcbiAgICB9XG5cbiAgICAvL1xuICAgIGdldCBwYXRoICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnBhdGggK1wiLlwiIDogXCJcIikgKyB0aGlzLm5hbWU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IG5vZGVUeXBlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzQmlvRW50aXR5ICgpIHtcbiAgICAgICAgbGV0IGJlID0gY3Vyck1pbmUubW9kZWwuY2xhc3Nlc1tcIkJpb0VudGl0eVwiXTtcbiAgICAgICAgbGV0IG50ID0gdGhpcy5ub2RlVHlwZTtcbiAgICAgICAgcmV0dXJuIGlzU3ViY2xhc3MobnQsIGJlKTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNTZWxlY3RlZCAoKSB7XG4gICAgICAgICByZXR1cm4gdGhpcy52aWV3ICE9PSBudWxsICYmIHRoaXMudmlldyAhPT0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIHRoaXMudmlldyA9IGkgPj0gMCA/IGkgOiAodC5zZWxlY3QucHVzaChwKSAtIDEpO1xuICAgIH1cbiAgICB1bnNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHBhdGggZnJvbSB0aGUgc2VsZWN0IGxpc3RcbiAgICAgICAgICAgIHQuc2VsZWN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgLy8gRklYTUU6IHJlbnVtYmVyIG5vZGVzIGhlcmVcbiAgICAgICAgICAgIHQuc2VsZWN0LnNsaWNlKGkpLmZvckVhY2goIChwLGopID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IGdldE5vZGVCeVBhdGgodGhpcy50ZW1wbGF0ZSwgcCk7XG4gICAgICAgICAgICAgICAgbi52aWV3IC09IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cbn1cblxuY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5tb2RlbCA9IHsgbmFtZTogXCJnZW5vbWljXCIgfTtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy50aXRsZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gW107XG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gXCJcIjtcbiAgICAgICAgdGhpcy50YWdzID0gW107XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IFtdO1xuICAgIH1cblxufVxuZnVuY3Rpb24gZ2V0Tm9kZUJ5UGF0aCAodCxwKSB7XG4gICAgICAgIHAgPSBwLnRyaW0oKTtcbiAgICAgICAgaWYgKCFwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IHBhcnRzID0gcC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBuID0gdC5xdHJlZTtcbiAgICAgICAgaWYgKG4ubmFtZSAhPT0gcGFydHNbMF0pIHJldHVybiBudWxsO1xuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjbmFtZSA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgbGV0IGMgPSAobi5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKHggPT4geC5uYW1lID09PSBjbmFtZSlbMF07XG4gICAgICAgICAgICBpZiAoIWMpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG5jbGFzcyBDb25zdHJhaW50IHtcbiAgICBjb25zdHJ1Y3RvciAobiwgdCkge1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0XG4gICAgICAgIHRoaXMuY3R5cGUgPSBuLnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIgPyBcInZhbHVlXCIgOiBcImxvb2t1cFwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gdGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiID8gXCI9XCIgOiBcIkxPT0tVUFwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy5jb2RlID0gbmV4dEF2YWlsYWJsZUNvZGUodCk7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gbi5wYXRoO1xuICAgICAgICAvLyB1c2VkIGJ5IHZhbHVlLCBsaXN0XG4gICAgICAgIHRoaXMudmFsdWUgPSBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgc3ViY2xhc3MgY29udHJhaW50c1xuICAgICAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgIH1cbn1cblxuLy8gQWRkcyBhIHBhdGggdG8gdGhlIGN1cnJlbnQgZGlhZ3JhbS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbi8vIEFyZ3M6XG4vLyAgIHRlbXBsYXRlIChvYmplY3QpIHRoZSB0ZW1wbGF0ZVxuLy8gICBwYXRoIChzdHJpbmcpIHRoZSBwYXRoIHRvIGFkZC4gXG4vLyAgIG1vZGVsIG9iamVjdCBDb21waWxlZCBkYXRhIG1vZGVsLlxuLy8gUmV0dXJuczpcbi8vICAgbGFzdCBwYXRoIGNvbXBvbmVudCBjcmVhdGVkLiBcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgQ3JlYXRlcyBuZXcgbm9kZXMgYXMgbmVlZGVkIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHF0cmVlLlxuZnVuY3Rpb24gYWRkUGF0aCh0ZW1wbGF0ZSwgcGF0aCwgbW9kZWwpe1xuICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgICB2YXIgY2xhc3NlcyA9IG1vZGVsLmNsYXNzZXM7XG4gICAgdmFyIGxhc3R0ID0gbnVsbFxuICAgIHZhciBuID0gdGVtcGxhdGUucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuXG4gICAgZnVuY3Rpb24gZmluZChsaXN0LCBuKXtcbiAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICB9XG5cbiAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocCwgaSl7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGUucXRyZWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWU7XG4gICAgICAgICAgICAgICAgaWYgKHAgIT09IG4ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3BdO1xuICAgICAgICAgICAgICAgIGlmICghY2xzKVxuICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWUgPSBuZXcgTm9kZSggdGVtcGxhdGUsIG51bGwsIHAsIGNscywgY2xzICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBuIGlzIHBvaW50aW5nIHRvIHRoZSBwYXJlbnQsIGFuZCBwIGlzIHRoZSBuZXh0IG5hbWUgaW4gdGhlIHBhdGguXG4gICAgICAgICAgICB2YXIgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgaWYgKG5uKSB7XG4gICAgICAgICAgICAgICAgLy8gcCBpcyBhbHJlYWR5IGEgY2hpbGRcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QsIGxvb2t1cCBwXG4gICAgICAgICAgICAgICAgdmFyIHg7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjbHMuYXR0cmlidXRlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0geC50eXBlIC8vIDwtLSBBIHN0cmluZyFcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdIC8vIDwtLVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgbWVtYmVyIG5hbWVkIFwiICsgcCArIFwiIGluIGNsYXNzIFwiICsgY2xzLm5hbWUgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlLCBhZGQgaXQgdG8gbidzIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgbm4gPSBuZXcgTm9kZSh0ZW1wbGF0ZSwgbiwgcCwgeCwgY2xzKTtcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gcmV0dXJuIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHBhdGhcbiAgICByZXR1cm4gbjtcbn1cblxuXG4vLyBBcmdzOlxuLy8gICBuIChub2RlKSBUaGUgbm9kZSBoYXZpbmcgdGhlIGNvbnN0cmFpbnQuXG4vLyAgIHNjTmFtZSAodHlwZSkgTmFtZSBvZiBzdWJjbGFzcy5cbmZ1bmN0aW9uIHNldFN1YmNsYXNzQ29uc3RyYWludChuLCBzY05hbWUpe1xuICAgIC8vIHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludFxuICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbiAoYyl7IHJldHVybiBjLmN0eXBlICE9PSBcInN1YmNsYXNzXCI7IH0pO1xuICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICBpZiAoc2NOYW1lKXtcbiAgICAgICAgbGV0IGNscyA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbc2NOYW1lXTtcbiAgICAgICAgaWYoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIHNjTmFtZTtcbiAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKHsgY3R5cGU6XCJzdWJjbGFzc1wiLCBvcDpcIklTQVwiLCBwYXRoOm4ucGF0aCwgdHlwZTpjbHMubmFtZSB9KTtcbiAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgdmFyIGNscyA9IG5vZGUuc3ViY2xhc3NDb25zdHJhaW50IHx8IG5vZGUucHR5cGU7XG4gICAgICAgIHZhciBjMiA9IFtdO1xuICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBpZihjLm5hbWUgaW4gY2xzLmF0dHJpYnV0ZXMgfHwgYy5uYW1lIGluIGNscy5yZWZlcmVuY2VzIHx8IGMubmFtZSBpbiBjbHMuY29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjMi5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChjKTtcbiAgICAgICAgfSlcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IGMyO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICB9XG4gICAgdmFyIHJlbW92ZWQgPSBjaGVjayhuLFtdKTtcbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKG4pO1xuICAgIGlmKHJlbW92ZWQubGVuZ3RoID4gMClcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ29uc3RyYWluaW5nIHRvIHN1YmNsYXNzIFwiICsgKHNjTmFtZSB8fCBuLnB0eXBlLm5hbWUpXG4gICAgICAgICAgICArIFwiIGNhdXNlZCB0aGUgZm9sbG93aW5nIHBhdGhzIHRvIGJlIHJlbW92ZWQ6IFwiIFxuICAgICAgICAgICAgKyByZW1vdmVkLm1hcChuID0+IG4ucGF0aCkuam9pbihcIiwgXCIpKTsgXG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbn1cblxuLy8gUmVtb3ZlcyB0aGUgY3VycmVudCBub2RlIGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuLy9cbmZ1bmN0aW9uIHJlbW92ZU5vZGUobikge1xuICAgIC8vIEZpcnN0LCByZW1vdmUgYWxsIGNvbnN0cmFpbnRzIG9uIG4gb3IgaXRzIGRlc2NlbmRhbnRzXG4gICAgZnVuY3Rpb24gcm1jICh4KSB7XG4gICAgICAgIHgudW5zZWxlY3QoKTtcbiAgICAgICAgeC5jb25zdHJhaW50cy5mb3JFYWNoKGMgPT4gcmVtb3ZlQ29uc3RyYWludCh4LGMpKTtcbiAgICAgICAgeC5jaGlsZHJlbi5mb3JFYWNoKHJtYyk7XG4gICAgfVxuICAgIHJtYyhuKTtcbiAgICAvLyBOb3cgcmVtb3ZlIHRoZSBzdWJ0cmVlIGF0IG4uXG4gICAgdmFyIHAgPSBuLnBhcmVudDtcbiAgICBpZiAocCkge1xuICAgICAgICBwLmNoaWxkcmVuLnNwbGljZShwLmNoaWxkcmVuLmluZGV4T2YobiksIDEpO1xuICAgICAgICBoaWRlRGlhbG9nKCk7XG4gICAgICAgIHVwZGF0ZShwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGhpZGVEaWFsb2coKVxuICAgIH1cbiAgICAvL1xuICAgIHNhdmVTdGF0ZSgpO1xufVxuXG4vLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbi8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4vLyBmb3IgZDMgdHJlZSBkaXNwbGF5LlxuLy9cbmZ1bmN0aW9uIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIGN1cnJUZW1wbGF0ZSA9IGRlZXBjKHQpO1xuICAgIC8vXG4gICAgcm9vdCA9IGNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUsIGN1cnJNaW5lLm1vZGVsKS5xdHJlZVxuICAgIHJvb3QueDAgPSAwO1xuICAgIHJvb3QueTAgPSBoIC8gMjtcblxuICAgIGlmICghIG5vc2F2ZSkgc2F2ZVN0YXRlKCk7XG5cbiAgICAvLyBGaWxsIGluIHRoZSBiYXNpYyB0ZW1wbGF0ZSBpbmZvcm1hdGlvbiAobmFtZSwgdGl0bGUsIGRlc2NyaXB0aW9uLCBldGMuKVxuICAgIC8vXG4gICAgdmFyIHRpID0gZDMuc2VsZWN0KFwiI3RJbmZvXCIpO1xuICAgIHZhciB4ZmVyID0gZnVuY3Rpb24obmFtZSwgZWx0KXsgY3VyclRlbXBsYXRlW25hbWVdID0gZWx0LnZhbHVlOyB1cGRhdGVUdGV4dCgpOyB9O1xuICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3VyclRlbXBsYXRlLm5hbWUpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwibmFtZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBUaXRsZSAod2hhdCB0aGUgdXNlciBzZWVzKVxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJ0aXRsZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3VyclRlbXBsYXRlLnRpdGxlKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcInRpdGxlXCIsIHRoaXMpIH0pO1xuICAgIC8vIERlc2NyaXB0aW9uICh3aGF0IGl0IGRvZXMgLSBhIGxpdHRsZSBkb2N1bWVudGF0aW9uKS5cbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiZGVzY3JpcHRpb25cIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdXJyVGVtcGxhdGUuZGVzY3JpcHRpb24pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiZGVzY3JpcHRpb25cIiwgdGhpcykgfSk7XG4gICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy4gXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdXJyVGVtcGxhdGUuY29tbWVudClcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJjb21tZW50XCIsIHRoaXMpIH0pO1xuXG4gICAgLy8gTG9naWMgZXhwcmVzc2lvbiAtIHdoaWNoIHRpZXMgdGhlIGluZGl2aWR1YWwgY29uc3RyYWludHMgdG9nZXRoZXJcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpIH0pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHNldExvZ2ljRXhwcmVzc2lvbih0aGlzLnZhbHVlLCBjdXJyVGVtcGxhdGUpO1xuICAgICAgICAgICAgeGZlcihcImNvbnN0cmFpbnRMb2dpY1wiLCB0aGlzKVxuICAgICAgICB9KTtcblxuICAgIC8vXG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShyb290KTtcbn1cblxuLy8gU2V0IHRoZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJlc3Npb24gZm9yIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbi8vIEluIHRoZSBwcm9jZXNzLCBhbHNvIFwiY29ycmVjdHNcIiB0aGUgZXhwcmVzc2lvbiBhcyBmb2xsb3dzOlxuLy8gICAgKiBhbnkgY29kZXMgaW4gdGhlIGV4cHJlc3Npb24gdGhhdCBhcmUgbm90IGFzc29jaWF0ZWQgd2l0aFxuLy8gICAgICBhbnkgY29uc3RyYWludCBpbiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBhcmUgcmVtb3ZlZCBhbmQgdGhlXG4vLyAgICAgIGV4cHJlc3Npb24gbG9naWMgdXBkYXRlZCBhY2NvcmRpbmdseVxuLy8gICAgKiBhbmQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHRoYXQgYXJlIG5vdCBpbiB0aGUgZXhwcmVzc2lvblxuLy8gICAgICBhcmUgQU5EZWQgdG8gdGhlIGVuZC5cbi8vIEZvciBleGFtcGxlLCBpZiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoYXMgY29kZXMgQSwgQiwgYW5kIEMsIGFuZFxuLy8gdGhlIGV4cHJlc3Npb24gaXMgXCIoQSBvciBEKSBhbmQgQlwiLCB0aGUgRCBkcm9wcyBvdXQgYW5kIEMgaXNcbi8vIGFkZGVkLCByZXN1bHRpbmcgaW4gXCJBIGFuZCBCIGFuZCBDXCIuIFxuLy8gQXJnczpcbi8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbi8vICAgdG1wbHQgKG9iaikgdGhlIHRlbXBsYXRlXG4vLyBSZXR1cm5zOlxuLy8gICB0aGUgXCJjb3JyZWN0ZWRcIiBleHByZXNzaW9uXG4vLyAgIFxuZnVuY3Rpb24gc2V0TG9naWNFeHByZXNzaW9uKGV4LCB0bXBsdCl7XG4gICAgdmFyIGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZ1bmN0aW9uIHJlYWNoKG4sbGV2KXtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgLy8gY2hlY2sgdGhhdCBuIGlzIGEgY29uc3RyYWludCBjb2RlIGluIHRoZSB0ZW1wbGF0ZS4gSWYgbm90LCByZW1vdmUgaXQgZnJvbSB0aGUgZXhwci5cbiAgICAgICAgICAgIHNlZW4ucHVzaChuKTtcbiAgICAgICAgICAgIHJldHVybiAobiBpbiB0bXBsdC5jb2RlMmMgPyBuIDogXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNtcyA9IG4uY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKGMpe3JldHVybiByZWFjaChjLCBsZXYrMSk7fSkuZmlsdGVyKGZ1bmN0aW9uKHgpe3JldHVybiB4O30pOztcbiAgICAgICAgdmFyIGNtc3MgPSBjbXMuam9pbihcIiBcIituLm9wK1wiIFwiKTtcbiAgICAgICAgcmV0dXJuIGNtcy5sZW5ndGggPT09IDAgPyBcIlwiIDogbGV2ID09PSAwIHx8IGNtcy5sZW5ndGggPT09IDEgPyBjbXNzIDogXCIoXCIgKyBjbXNzICsgXCIpXCJcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXN0ID0gZXggPyBwYXJzZXIucGFyc2UoZXgpIDogbnVsbDtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBhbGVydChlcnIpO1xuICAgICAgICByZXR1cm4gdG1wbHQuY29uc3RyYWludExvZ2ljO1xuICAgIH1cbiAgICAvL1xuICAgIHZhciBsZXggPSBhc3QgPyByZWFjaChhc3QsMCkgOiBcIlwiO1xuICAgIC8vIGlmIGFueSBjb25zdHJhaW50IGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB3ZXJlIG5vdCBzZWVuIGluIHRoZSBleHByZXNzaW9uLFxuICAgIC8vIEFORCB0aGVtIGludG8gdGhlIGV4cHJlc3Npb24gKGV4Y2VwdCBJU0EgY29uc3RyYWludHMpLlxuICAgIHZhciB0b0FkZCA9IE9iamVjdC5rZXlzKHRtcGx0LmNvZGUyYykuZmlsdGVyKGZ1bmN0aW9uKGMpe1xuICAgICAgICByZXR1cm4gc2Vlbi5pbmRleE9mKGMpID09PSAtMSAmJiBjLm9wICE9PSBcIklTQVwiO1xuICAgICAgICB9KTtcbiAgICBpZiAodG9BZGQubGVuZ3RoID4gMCkge1xuICAgICAgICAgaWYoYXN0ICYmIGFzdC5vcCAmJiBhc3Qub3AgPT09IFwib3JcIilcbiAgICAgICAgICAgICBsZXggPSBgKCR7bGV4fSlgO1xuICAgICAgICAgaWYgKGxleCkgdG9BZGQudW5zaGlmdChsZXgpO1xuICAgICAgICAgbGV4ID0gdG9BZGQuam9pbihcIiBhbmQgXCIpO1xuICAgIH1cbiAgICAvL1xuICAgIHRtcGx0LmNvbnN0cmFpbnRMb2dpYyA9IGxleDtcblxuICAgIGQzLnNlbGVjdCgnI3RJbmZvIFtuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGxleDsgfSk7XG5cbiAgICByZXR1cm4gbGV4O1xufVxuXG4vLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuLy8gQXJnczpcbi8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbi8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuLy8gICBwIChzdHJpbmcpIE5hbWUgb2YgYW4gYXR0cmlidXRlLCByZWYsIG9yIGNvbGxlY3Rpb25cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4vLyAgIFRoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQgb24gdGhlIGNoaWxkIG5vZGUuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuLy8gICBjaGlsZCwgYW5kIHRoZSBjb25zdHJhaW50IGVkaXRvciBvcGVuZWQgIG9uIHRoYXQgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIG1vZGUsIHApe1xuICAgIGxldCBuO1xuICAgIGxldCBjYztcbiAgICBsZXQgc2ZzO1xuICAgIGlmIChtb2RlID09PSBcInN1bW1hcnlmaWVsZHNcIikge1xuICAgICAgICBzZnMgPSBjdXJyTWluZS5zdW1tYXJ5RmllbGRzW2N1cnJOb2RlLm5vZGVUeXBlLm5hbWVdfHxbXTtcbiAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBjdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgIGxldCBtID0gYWRkUGF0aChjdXJyVGVtcGxhdGUsIHNmLCBjdXJyTWluZS5tb2RlbCk7XG4gICAgICAgICAgICBpZiAoISBtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtLnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHAgPSBjdXJyTm9kZS5wYXRoICsgXCIuXCIgKyBwO1xuICAgICAgICBuID0gYWRkUGF0aChjdXJyVGVtcGxhdGUsIHAsIGN1cnJNaW5lLm1vZGVsICk7XG4gICAgICAgIGlmIChtb2RlID09PSBcInNlbGVjdGVkXCIpXG4gICAgICAgICAgICAhbi5pc1NlbGVjdGVkICYmIG4uc2VsZWN0KCk7XG4gICAgICAgIGlmIChtb2RlID09PSBcImNvbnN0cmFpbmVkXCIpIHtcbiAgICAgICAgICAgIGNjID0gYWRkQ29uc3RyYWludChuLCBmYWxzZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKGN1cnJOb2RlKTtcbiAgICBpZiAobW9kZSAhPT0gXCJvcGVuXCIpXG4gICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgIGlmIChtb2RlICE9PSBcInN1bW1hcnlmaWVsZHNcIikgXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNob3dEaWFsb2cobik7XG4gICAgICAgICAgICBjYyAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWRpdENvbnN0cmFpbnQoY2MsIG4pXG4gICAgICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbiAgICBcbn1cbi8vIFJldHVybnMgYSB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIGEgY29uc3RyYWludFxuLy9cbmZ1bmN0aW9uIGNvbnN0cmFpbnRUZXh0KGMpIHtcbiAgIHZhciB0ID0gXCI/XCI7XG4gICBpZiAoIWMpIHJldHVybiB0O1xuICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIil7XG4gICAgICAgdCA9IFwiSVNBIFwiICsgKGMudHlwZSB8fCBcIj9cIik7XG4gICB9XG4gICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlO1xuICAgfVxuICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlO1xuICAgICAgIGlmIChjLmV4dHJhVmFsdWUpIHQgPSB0ICsgXCIgSU4gXCIgKyBjLmV4dHJhVmFsdWU7XG4gICB9XG4gICBlbHNlIGlmIChjLnZhbHVlICE9PSB1bmRlZmluZWQpe1xuICAgICAgIHQgPSBjLm9wICsgKGMub3AuaW5jbHVkZXMoXCJOVUxMXCIpID8gXCJcIiA6IFwiIFwiICsgYy52YWx1ZSlcbiAgIH1cbiAgIGVsc2UgaWYgKGMudmFsdWVzICE9PSB1bmRlZmluZWQpe1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlc1xuICAgfVxuICAgcmV0dXJuIChjLmNvZGUgPyBcIihcIitjLmNvZGUrXCIpIFwiIDogXCJcIikgKyB0O1xufVxuXG4vLyBSZXR1cm5zICB0aGUgRE9NIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gZGF0YSBvYmplY3QuXG4vL1xuZnVuY3Rpb24gZmluZERvbUJ5RGF0YU9iaihkKXtcbiAgICB2YXIgeCA9IGQzLnNlbGVjdEFsbChcIi5ub2RlZ3JvdXAgLm5vZGVcIikuZmlsdGVyKGZ1bmN0aW9uKGRkKXsgcmV0dXJuIGRkID09PSBkOyB9KTtcbiAgICByZXR1cm4geFswXVswXTtcbn1cblxuLy9cbmZ1bmN0aW9uIG9wVmFsaWRGb3Iob3AsIG4pe1xuICAgIGlmKCFuLnBhcmVudCAmJiAhb3AudmFsaWRGb3JSb290KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodHlwZW9mKG4ucHR5cGUpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBpZighIG9wLnZhbGlkRm9yQXR0cilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZiggb3AudmFsaWRUeXBlcyAmJiBvcC52YWxpZFR5cGVzLmluZGV4T2Yobi5wdHlwZSkgPT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYobi5wdHlwZS5uYW1lICYmICEgb3AudmFsaWRGb3JDbGFzcykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlQ0VpbnB1dHMoYywgb3Ape1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlID0gb3AgfHwgYy5vcDtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpLnRleHQoYy5jb2RlKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy5jdHlwZT09PVwibnVsbFwiID8gXCJcIiA6IGMudmFsdWU7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpWzBdWzBdLnZhbHVlID0gZGVlcGMoYy52YWx1ZXMpO1xufVxuXG4vLyBBcmdzOlxuLy8gICBzZWxlY3RvciAoc3RyaW5nKSBGb3Igc2VsZWN0aW5nIHRoZSA8c2VsZWN0PiBlbGVtZW50XG4vLyAgIGRhdGEgKGxpc3QpIERhdGEgdG8gYmluZCB0byBvcHRpb25zXG4vLyAgIGNmZyAob2JqZWN0KSBBZGRpdGlvbmFsIG9wdGlvbmFsIGNvbmZpZ3M6XG4vLyAgICAgICB0aXRsZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgZm9yIHNldHRpbmcgdGhlIHRleHQgb2YgdGhlIG9wdGlvbi4gXG4vLyAgICAgICB2YWx1ZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgc2V0dGluZyB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvblxuLy8gICAgICAgc2VsZWN0ZWQgLSBmdW5jdGlvbiBvciBhcnJheSBvciBzdHJpbmcgZm9yIGRlY2lkaW5nIHdoaWNoIG9wdGlvbihzKSBhcmUgc2VsZWN0ZWRcbi8vICAgICAgICAgIElmIGZ1bmN0aW9uLCBjYWxsZWQgZm9yIGVhY2ggb3B0aW9uLlxuLy8gICAgICAgICAgSWYgYXJyYXksIHNwZWNpZmllcyB0aGUgdmFsdWVzIHRoZSBzZWxlY3QuXG4vLyAgICAgICAgICBJZiBzdHJpbmcsIHNwZWNpZmllcyB3aGljaCB2YWx1ZSBpcyBzZWxlY3RlZFxuLy8gICAgICAgZW1wdHlNZXNzYWdlIC0gYSBtZXNzYWdlIHRvIHNob3cgaWYgdGhlIGRhdGEgbGlzdCBpcyBlbXB0eVxuLy8gICAgICAgbXVsdGlwbGUgLSBpZiB0cnVlLCBtYWtlIGl0IGEgbXVsdGktc2VsZWN0IGxpc3Rcbi8vXG5mdW5jdGlvbiBpbml0T3B0aW9uTGlzdChzZWxlY3RvciwgZGF0YSwgY2ZnKXtcbiAgICBcbiAgICBjZmcgPSBjZmcgfHwge307XG5cbiAgICB2YXIgaWRlbnQgPSAoeD0+eCk7XG4gICAgdmFyIG9wdHM7XG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApe1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgY2ZnLnZhbHVlIHx8IGlkZW50KVxuICAgICAgICAgICAgLnRleHQoY2ZnLnRpdGxlIHx8IGlkZW50KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBudWxsKVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBudWxsKTtcbiAgICAgICAgaWYgKHR5cGVvZihjZmcuc2VsZWN0ZWQpID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIGZ1bmN0aW9uIHNheXMgc29cbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkKGQpfHxudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNmZy5zZWxlY3RlZCkpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBpcyBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkLmluZGV4T2YoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkpICE9IC0xIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNmZy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIG1hdGNoZXNcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpID09PSBjZmcuc2VsZWN0ZWQpIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHNlbGVjdG9yKVswXVswXS5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKFtjZmcuZW1wdHlNZXNzYWdlfHxcImVtcHR5IGxpc3RcIl0pO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIG9wdHMudGV4dChpZGVudCkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cbiAgICAvLyBzZXQgbXVsdGkgc2VsZWN0IChvciBub3QpXG4gICAgZDMuc2VsZWN0KHNlbGVjdG9yKS5hdHRyKFwibXVsdGlwbGVcIiwgY2ZnLm11bHRpcGxlIHx8IG51bGwpO1xuICAgIC8vIGFsbG93IGNhbGxlciB0byBjaGFpblxuICAgIHJldHVybiBvcHRzO1xufVxuXG4vLyBJbml0aWFsaXplcyB0aGUgaW5wdXQgZWxlbWVudHMgaW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZyb20gdGhlIGdpdmVuIGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gaW5pdENFaW5wdXRzKG4sIGMsIGN0eXBlKSB7XG5cbiAgICAvLyBQb3B1bGF0ZSB0aGUgb3BlcmF0b3Igc2VsZWN0IGxpc3Qgd2l0aCBvcHMgYXBwcm9wcmlhdGUgZm9yIHRoZSBwYXRoXG4gICAgLy8gYXQgdGhpcyBub2RlLlxuICAgIGlmICghY3R5cGUpIFxuICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cIm9wXCJdJywgXG4gICAgICAgIE9QUy5maWx0ZXIoZnVuY3Rpb24ob3ApeyByZXR1cm4gb3BWYWxpZEZvcihvcCwgbik7IH0pLFxuICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGQgPT4gZC5vcCxcbiAgICAgICAgdGl0bGU6IGQgPT4gZC5vcCxcbiAgICAgICAgc2VsZWN0ZWQ6Yy5vcFxuICAgICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgY3R5cGUgPSBjdHlwZSB8fCBjLmN0eXBlO1xuXG4gICAgbGV0IGNlID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIik7XG4gICAgbGV0IHNtemQgPSBjZS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcbiAgICBjZS5hdHRyKFwiY2xhc3NcIiwgXCJvcGVuIFwiICsgY3R5cGUpXG4gICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCBzbXpkKVxuICAgICAgICAuY2xhc3NlZChcImJpb2VudGl0eVwiLCAgbi5pc0Jpb0VudGl0eSk7XG5cbiBcbiAgICAvL1xuICAgIC8vIHNldC9yZW1vdmUgdGhlIFwibXVsdGlwbGVcIiBhdHRyaWJ1dGUgb2YgdGhlIHNlbGVjdCBlbGVtZW50IGFjY29yZGluZyB0byBjdHlwZVxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAuYXR0cihcIm11bHRpcGxlXCIsIGZ1bmN0aW9uKCl7IHJldHVybiBjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIgfHwgbnVsbDsgfSk7XG5cbiAgICAvL1xuICAgIGlmIChjdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgW1wiQW55XCJdLmNvbmNhdChjdXJyTWluZS5vcmdhbmlzbUxpc3QpLFxuICAgICAgICAgICAgeyBzZWxlY3RlZDogYy5leHRyYVZhbHVlIH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIG9wdGlvbiBsaXN0IG9mIHN1YmNsYXNzIG5hbWVzXG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIG4ucGFyZW50ID8gZ2V0U3ViY2xhc3NlcyhuLnBjb21wLmtpbmQgPyBuLnBjb21wLnR5cGUgOiBuLnBjb21wKSA6IFtdLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIHN1YmNsYXNzZXMpXCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogZnVuY3Rpb24oZCl7IFxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG9uZSB3aG9zZSBuYW1lIG1hdGNoZXMgdGhlIG5vZGUncyB0eXBlIGFuZCBzZXQgaXRzIHNlbGVjdGVkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIHZhciBtYXRjaGVzID0gZC5uYW1lID09PSAoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLm5hbWUgfHwgbi5wdHlwZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIGN1cnJNaW5lLmxpc3RzLmZpbHRlcihmdW5jdGlvbiAobCkgeyByZXR1cm4gaXNWYWxpZExpc3RDb25zdHJhaW50KGwsIGN1cnJOb2RlKTsgfSksXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBsaXN0cylcIixcbiAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYyk7XG4gICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICAvL2xldCBhY3MgPSBnZXRMb2NhbChcImF1dG9jb21wbGV0ZVwiLCB0cnVlLCBbXSk7XG4gICAgICAgIC8vIGRpc2FibGUgdGhpcyBmb3Igbm93LlxuICAgICAgICBsZXQgYWNzID0gW107XG4gICAgICAgIGlmIChhY3MuaW5kZXhPZihhdHRyKSAhPT0gLTEpXG4gICAgICAgICAgICBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiVW5yZWNvZ25pemVkIGN0eXBlOiBcIiArIGN0eXBlXG4gICAgfVxuICAgIFxufVxuXG4vLyBPcGVucyB0aGUgY29uc3RyYWludCBlZGl0b3IgZm9yIGNvbnN0cmFpbnQgYyBvZiBub2RlIG4uXG4vL1xuZnVuY3Rpb24gb3BlbkNvbnN0cmFpbnRFZGl0b3IoYywgbil7XG5cbiAgICB2YXIgY2NvcHkgPSBkZWVwYyhjKTtcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5kYXR1bSh7IGMsIGNjb3B5IH0pXG5cbiAgICAvLyBOb3RlIGlmIHRoaXMgaXMgaGFwcGVuaW5nIGF0IHRoZSByb290IG5vZGVcbiAgICB2YXIgaXNyb290ID0gISBuLnBhcmVudDtcbiBcbiAgICAvLyBGaW5kIHRoZSBkaXYgZm9yIGNvbnN0cmFpbnQgYyBpbiB0aGUgZGlhbG9nIGxpc3RpbmcuIFdlIHdpbGxcbiAgICAvLyBvcGVuIHRoZSBjb25zdHJhaW50IGVkaXRvciBvbiB0b3Agb2YgaXQuXG4gICAgdmFyIGNkaXY7XG4gICAgZDMuc2VsZWN0QWxsKFwiI2RpYWxvZyAuY29uc3RyYWludFwiKVxuICAgICAgICAuZWFjaChmdW5jdGlvbihjYyl7IGlmKGNjID09PSBjKSBjZGl2ID0gdGhpczsgfSk7XG4gICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBjb25zdHJhaW50J3MgY29udGFpbmVyIGRpdlxuICAgIHZhciBjYmIgPSBjZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgYXBwJ3MgbWFpbiBib2R5IGVsZW1lbnRcbiAgICB2YXIgZGJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIHBvc2l0aW9uIHRoZSBjb25zdHJhaW50IGVkaXRvciBvdmVyIHRoZSBjb25zdHJhaW50IGluIHRoZSBkaWFsb2dcbiAgICB2YXIgY2VkID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBjLmN0eXBlKVxuICAgICAgICAuY2xhc3NlZChcIm9wZW5cIiwgdHJ1ZSlcbiAgICAgICAgLnN0eWxlKFwidG9wXCIsIChjYmIudG9wIC0gZGJiLnRvcCkrXCJweFwiKVxuICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChjYmIubGVmdCAtIGRiYi5sZWZ0KStcInB4XCIpXG4gICAgICAgIDtcblxuICAgIC8vIEluaXQgdGhlIGNvbnN0cmFpbnQgY29kZSBcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpXG4gICAgICAgIC50ZXh0KGMuY29kZSk7XG5cbiAgICBpbml0Q0VpbnB1dHMobiwgYyk7XG5cbiAgICAvLyBXaGVuIHVzZXIgc2VsZWN0cyBhbiBvcGVyYXRvciwgYWRkIGEgY2xhc3MgdG8gdGhlIGMuZS4ncyBjb250YWluZXJcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBvcCA9IE9QSU5ERVhbdGhpcy52YWx1ZV07XG4gICAgICAgICAgICBpbml0Q0VpbnB1dHMobiwgYywgb3AuY3R5cGUpO1xuICAgICAgICB9KVxuICAgICAgICA7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBjYW5jZWxDb25zdHJhaW50RWRpdG9yKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zYXZlXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IHNhdmVDb25zdHJhaW50RWRpdHMobiwgYykgfSk7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnN5bmNcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpIH0pO1xuXG59XG4vLyBHZW5lcmF0ZXMgYW4gb3B0aW9uIGxpc3Qgb2YgZGlzdGluY3QgdmFsdWVzIHRvIHNlbGVjdCBmcm9tLlxuLy8gQXJnczpcbi8vICAgbiAgKG5vZGUpICBUaGUgbm9kZSB3ZSdyZSB3b3JraW5nIG9uLiBNdXN0IGJlIGFuIGF0dHJpYnV0ZSBub2RlLlxuLy8gICBjICAoY29uc3RyYWludCkgVGhlIGNvbnN0cmFpbnQgdG8gZ2VuZXJhdGUgdGhlIGxpc3QgZm9yLlxuLy8gTkI6IE9ubHkgdmFsdWUgYW5kIG11bHRpdmF1ZSBjb25zdHJhaW50cyBjYW4gYmUgc3VtbWFyaXplZCBpbiB0aGlzIHdheS4gIFxuZnVuY3Rpb24gZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpe1xuICAgIC8vIFRvIGdldCB0aGUgbGlzdCwgd2UgaGF2ZSB0byBydW4gdGhlIGN1cnJlbnQgcXVlcnkgd2l0aCBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciwgXG4gICAgLy8gc3VtbWFyeVBhdGgsIHdoaWNoIGlzIHRoZSBwYXRoIHdlIHdhbnQgZGlzdGluY3QgdmFsdWVzIGZvci4gXG4gICAgLy8gQlVUIE5PVEUsIHdlIGhhdmUgdG8gcnVuIHRoZSBxdWVyeSAqd2l0aG91dCogY29uc3RyYWludCBjISFcbiAgICAvLyBFeGFtcGxlOiBzdXBwb3NlIHdlIGhhdmUgYSBxdWVyeSB3aXRoIGEgY29uc3RyYWludCBhbGxlbGVUeXBlPVRhcmdldGVkLFxuICAgIC8vIGFuZCB3ZSB3YW50IHRvIGNoYW5nZSBpdCB0byBTcG9udGFuZW91cy4gV2Ugb3BlbiB0aGUgYy5lLiwgYW5kIHRoZW4gY2xpY2sgdGhlXG4gICAgLy8gc3luYyBidXR0b24gdG8gZ2V0IGEgbGlzdC4gSWYgd2UgcnVuIHRoZSBxdWVyeSB3aXRoIGMgaW50YWN0LCB3ZSdsbCBnZXQgYSBsaXN0XG4gICAgLy8gY29udGFpbmludCBvbmx5IFwiVGFyZ2V0ZWRcIi4gRG9oIVxuICAgIC8vIEFOT1RIRVIgTk9URTogdGhlIHBhdGggaW4gc3VtbWFyeVBhdGggbXVzdCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBwcm9wZXIuIFRoZSBhcHByb2FjaFxuICAgIC8vIGhlcmUgaXMgdG8gZW5zdXJlIGl0IGJ5IGFkZGluZyB0aGUgcGF0aCB0byB0aGUgdmlldyBsaXN0LlxuXG4gICAgbGV0IGN2YWxzID0gW107XG4gICAgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGN2YWxzID0gYy52YWx1ZXM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBjdmFscyA9IFsgYy52YWx1ZSBdO1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhpcyBjaG9pY2UgaW4gbG9jYWxTdG9yYWdlXG4gICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgbGV0IGtleSA9IFwiYXV0b2NvbXBsZXRlXCI7XG4gICAgbGV0IGxzdDtcbiAgICBsc3QgPSBnZXRMb2NhbChrZXksIHRydWUsIFtdKTtcbiAgICBpZihsc3QuaW5kZXhPZihhdHRyKSA9PT0gLTEpIGxzdC5wdXNoKGF0dHIpO1xuICAgIHNldExvY2FsKGtleSwgbHN0LCB0cnVlKTtcblxuICAgIGNsZWFyTG9jYWwoKTtcblxuICAgIC8vIGJ1aWxkIHRoZSBxdWVyeVxuICAgIGxldCBwID0gbi5wYXRoOyAvLyB3aGF0IHdlIHdhbnQgdG8gc3VtbWFyaXplXG4gICAgLy9cbiAgICBsZXQgbGV4ID0gY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYzsgLy8gc2F2ZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJcbiAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIGZhbHNlKTsgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIHRoZSBjb25zdHJhaW50XG4gICAgbGV0IGogPSB1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpO1xuICAgIGouc2VsZWN0LnB1c2gocCk7IC8vIG1ha2Ugc3VyZSBwIGlzIHBhcnQgb2YgdGhlIHF1ZXJ5XG4gICAgY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyA9IGxleDsgLy8gcmVzdG9yZSB0aGUgbG9naWMgZXhwclxuICAgIGFkZENvbnN0cmFpbnQobiwgZmFsc2UsIGMpOyAvLyByZS1hZGQgdGhlIGNvbnN0cmFpbnRcblxuICAgIC8vIGJ1aWxkIHRoZSB1cmxcbiAgICBsZXQgeCA9IGpzb24yeG1sKGosIHRydWUpO1xuICAgIGxldCBlID0gZW5jb2RlVVJJQ29tcG9uZW50KHgpO1xuICAgIGxldCB1cmwgPSBgJHtjdXJyTWluZS51cmx9L3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9zdW1tYXJ5UGF0aD0ke3B9JmZvcm1hdD1qc29ucm93cyZxdWVyeT0ke2V9YFxuICAgIGxldCB0aHJlc2hvbGQgPSAyNTA7XG5cbiAgICAvLyBzaWduYWwgdGhhdCB3ZSdyZSBzdGFydGluZ1xuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgdHJ1ZSk7XG4gICAgLy8gZ28hXG4gICAgZDNqc29uUHJvbWlzZSh1cmwpLnRoZW4oZnVuY3Rpb24oanNvbil7XG4gICAgICAgIC8vIFRoZSBsaXN0IG9mIHZhbHVlcyBpcyBpbiBqc29uLnJldWx0cy5cbiAgICAgICAgLy8gRWFjaCBsaXN0IGl0ZW0gbG9va3MgbGlrZTogeyBpdGVtOiBcInNvbWVzdHJpbmdcIiwgY291bnQ6IDE3IH1cbiAgICAgICAgLy8gKFllcywgd2UgZ2V0IGNvdW50cyBmb3IgZnJlZSEgT3VnaHQgdG8gbWFrZSB1c2Ugb2YgdGhpcy4pXG4gICAgICAgIC8vXG4gICAgICAgIGxldCByZXMgPSBqc29uLnJlc3VsdHMubWFwKHIgPT4gci5pdGVtKS5zb3J0KCk7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBsZXQgYW5zID0gcHJvbXB0KGBUaGVyZSBhcmUgJHtyZXMubGVuZ3RofSByZXN1bHRzLCB3aGljaCBleGNlZWRzIHRoZSB0aHJlc2hvbGQgb2YgJHt0aHJlc2hvbGR9LiBIb3cgbWFueSBkbyB5b3Ugd2FudCB0byBzaG93P2AsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICBpZiAoYW5zID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbnMgPSBwYXJzZUludChhbnMpO1xuICAgICAgICAgICAgaWYgKGlzTmFOKGFucykgfHwgYW5zIDw9IDApIHJldHVybjtcbiAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBhbnMpO1xuICAgICAgICB9XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3InKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHRydWUpO1xuICAgICAgICBsZXQgb3B0cyA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAgICAgICAgIC5kYXRhKHJlcyk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIik7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLmF0dHIoXCJ2YWx1ZVwiLCBkID0+IGQpXG4gICAgICAgICAgICAudGV4dCggZCA9PiBkIClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjdmFscy5pbmRleE9mKGQpICE9PSAtMSB8fCBudWxsKTtcbiAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpO1xuICAgIH0pXG59XG4vL1xuZnVuY3Rpb24gY2FuY2VsQ29uc3RyYWludEVkaXRvcihuLCBjKXtcbiAgICBpZiAoISBjLnNhdmVkKSB7XG4gICAgICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdHJ1ZSk7XG4gICAgfVxuICAgIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG59XG5mdW5jdGlvbiBoaWRlQ29uc3RyYWludEVkaXRvcigpe1xuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpO1xufVxuLy9cbmZ1bmN0aW9uIGVkaXRDb25zdHJhaW50KGMsIG4pe1xuICAgIG9wZW5Db25zdHJhaW50RWRpdG9yKGMsIG4pO1xufVxuLy8gUmV0dXJucyBhIHNpbmdsZSBjaGFyYWN0ZXIgY29uc3RyYWludCBjb2RlIGluIHRoZSByYW5nZSBBLVogdGhhdCBpcyBub3QgYWxyZWFkeVxuLy8gdXNlZCBpbiB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4vL1xuZnVuY3Rpb24gbmV4dEF2YWlsYWJsZUNvZGUodG1wbHQpe1xuICAgIGZvcih2YXIgaT0gXCJBXCIuY2hhckNvZGVBdCgwKTsgaSA8PSBcIlpcIi5jaGFyQ29kZUF0KDApOyBpKyspe1xuICAgICAgICB2YXIgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgICAgIGlmICghIChjIGluIHRtcGx0LmNvZGUyYykpXG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbi8vIEFkZHMgYSBuZXcgY29uc3RyYWludCB0byBhIG5vZGUgYW5kIHJldHVybnMgaXQuXG4vLyBBcmdzOlxuLy8gICBuIChub2RlKSBUaGUgbm9kZSB0byBhZGQgdGhlIGNvbnN0cmFpbnQgdG8uIFJlcXVpcmVkLlxuLy8gICB1cGRhdGVVSSAoYm9vbGVhbikgSWYgdHJ1ZSwgdXBkYXRlIHRoZSBkaXNwbGF5LiBJZiBmYWxzZSBvciBub3Qgc3BlY2lmaWVkLCBubyB1cGRhdGUuXG4vLyAgIGMgKGNvbnN0cmFpbnQpIElmIGdpdmVuLCB1c2UgdGhhdCBjb25zdHJhaW50LiBPdGhlcndpc2UgYXV0b2dlbmVyYXRlLlxuLy8gUmV0dXJuczpcbi8vICAgVGhlIG5ldyBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIGFkZENvbnN0cmFpbnQobiwgdXBkYXRlVUksIGMpIHtcbiAgICBpZiAoIWMpIHtcbiAgICAgICAgYyA9IG5ldyBDb25zdHJhaW50KG4sY3VyclRlbXBsYXRlKTtcbiAgICB9XG4gICAgbi5jb25zdHJhaW50cy5wdXNoKGMpO1xuICAgIGN1cnJUZW1wbGF0ZS53aGVyZS5wdXNoKGMpO1xuICAgIGN1cnJUZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgc2V0TG9naWNFeHByZXNzaW9uKGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMsIGN1cnJUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICBpZiAodXBkYXRlVUkpIHtcbiAgICAgICAgdXBkYXRlKG4pO1xuICAgICAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgICAgICBlZGl0Q29uc3RyYWludChjLCBuKTtcbiAgICB9XG4gICAgLy9cbiAgICByZXR1cm4gYztcbn1cblxuLy9cbmZ1bmN0aW9uIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdXBkYXRlVUkpe1xuICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgY3VyclRlbXBsYXRlLndoZXJlID0gY3VyclRlbXBsYXRlLndoZXJlLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgZGVsZXRlIGN1cnJUZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXTtcbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSBuLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7XG4gICAgc2V0TG9naWNFeHByZXNzaW9uKGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMsIGN1cnJUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICBpZiAodXBkYXRlVUkpIHtcbiAgICAgICAgdXBkYXRlKG4pO1xuICAgICAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gYztcbn1cbi8vXG5mdW5jdGlvbiBzYXZlQ29uc3RyYWludEVkaXRzKG4sIGMpe1xuICAgIC8vXG4gICAgbGV0IG8gPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZTtcbiAgICBjLm9wID0gbztcbiAgICBjLmN0eXBlID0gT1BJTkRFWFtvXS5jdHlwZTtcbiAgICBjLnNhdmVkID0gdHJ1ZTtcbiAgICAvL1xuICAgIGxldCB2YWwgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZTtcbiAgICBsZXQgdmFscyA9IFtdO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgIC5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB2YWxzLnB1c2godGhpcy52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgbGV0IHogPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJykuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG5cbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgYy50eXBlID0gdmFsc1swXVxuICAgICAgICBjLnZhbHVlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICBzZXRTdWJjbGFzc0NvbnN0cmFpbnQobiwgYy50eXBlKVxuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB2YWw7XG4gICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgYy5leHRyYVZhbHVlID0gdmFsc1swXSA9PT0gXCJBbnlcIiA/IG51bGwgOiB2YWxzWzBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBjLnZhbHVlID0gdmFsc1swXTtcbiAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB6ID8gdmFsc1swXSA6IHZhbDtcbiAgICAgICAgYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJVbmtub3duIGN0eXBlOiBcIitjLmN0eXBlO1xuICAgIH1cbiAgICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xuICAgIHVwZGF0ZShuKTtcbiAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgIHNhdmVTdGF0ZSgpO1xufVxuXG4vLyBPcGVucyBhIGRpYWxvZyBvbiB0aGUgc3BlY2lmaWVkIG5vZGUuXG4vLyBBbHNvIG1ha2VzIHRoYXQgbm9kZSB0aGUgY3VycmVudCBub2RlLlxuLy8gQXJnczpcbi8vICAgbiAgICB0aGUgbm9kZVxuLy8gICBlbHQgIHRoZSBET00gZWxlbWVudCAoZS5nLiBhIGNpcmNsZSlcbi8vIFJldHVybnNcbi8vICAgc3RyaW5nXG4vLyBTaWRlIGVmZmVjdDpcbi8vICAgc2V0cyBnbG9iYWwgY3Vyck5vZGVcbi8vXG5mdW5jdGlvbiBzaG93RGlhbG9nKG4sIGVsdCwgcmVmcmVzaE9ubHkpe1xuICBpZiAoIWVsdCkgZWx0ID0gZmluZERvbUJ5RGF0YU9iaihuKTtcbiAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiBcbiAgLy8gU2V0IHRoZSBnbG9iYWwgY3Vyck5vZGVcbiAgY3Vyck5vZGUgPSBuO1xuICB2YXIgaXNyb290ID0gISBjdXJyTm9kZS5wYXJlbnQ7XG4gIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIikuZGF0dW0obik7XG4gIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICB2YXIgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgZWJiID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgdmFyIGIgPSAoYmJiLmJvdHRvbSAtIGViYi5ib3R0b20pICsgZWJiLndpZHRoLzI7XG4gIHZhciBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICB2YXIgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAvLyBOQjogY2FuJ3QgZ2V0IG9wZW5pbmcgdXAgdG8gd29yaywgc28gaGFyZCB3aXJlIGl0IHRvIGRvd24uIDotXFxcblxuICAvL1xuICBkaWFsb2dcbiAgICAgIC5zdHlsZShcImxlZnRcIiwgbCtcInB4XCIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgLmNsYXNzZWQoXCJpc3Jvb3RcIiwgaXNyb290KVxuICAgICAgO1xuICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm0tb3JpZ2luXCIsIFwiMCUgMCVcIikgO1xuICBlbHNlXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gIC8vIFNldCB0aGUgZGlhbG9nIHRpdGxlIHRvIG5vZGUgbmFtZVxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgLnRleHQobi5uYW1lKTtcbiAgLy8gU2hvdyB0aGUgZnVsbCBwYXRoXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgIC50ZXh0KG4ucGF0aCk7XG4gIC8vIFR5cGUgYXQgdGhpcyBub2RlXG4gIHZhciB0cCA9IG4ucHR5cGUubmFtZSB8fCBuLnB0eXBlO1xuICB2YXIgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gIHZhciB0c3RyaW5nID0gc3RwICYmIGA8c3BhbiBzdHlsZT1cImNvbG9yOiBwdXJwbGU7XCI+JHtzdHB9PC9zcGFuPiAoJHt0cH0pYCB8fCB0cFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gIC8vIFdpcmUgdXAgYWRkIGNvbnN0cmFpbnQgYnV0dG9uXG4gIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBhZGRDb25zdHJhaW50KG4sIHRydWUpOyB9KTtcblxuICAvLyBGaWxsIG91dCB0aGUgY29uc3RyYWludHMgc2VjdGlvbi4gRmlyc3QsIHNlbGVjdCBhbGwgY29uc3RyYWludHMuXG4gIHZhciBjb25zdHJzID0gZGlhbG9nLnNlbGVjdChcIi5jb25zdHJhaW50U2VjdGlvblwiKVxuICAgICAgLnNlbGVjdEFsbChcIi5jb25zdHJhaW50XCIpXG4gICAgICAuZGF0YShuLmNvbnN0cmFpbnRzKTtcbiAgLy8gRW50ZXIoKTogY3JlYXRlIGRpdnMgZm9yIGVhY2ggY29uc3RyYWludCB0byBiZSBkaXNwbGF5ZWQgIChUT0RPOiB1c2UgYW4gSFRNTDUgdGVtcGxhdGUgaW5zdGVhZClcbiAgLy8gMS4gY29udGFpbmVyXG4gIHZhciBjZGl2cyA9IGNvbnN0cnMuZW50ZXIoKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsXCJjb25zdHJhaW50XCIpIDtcbiAgLy8gMi4gb3BlcmF0b3JcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwib3BcIikgO1xuICAvLyAzLiB2YWx1ZVxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJ2YWx1ZVwiKSA7XG4gIC8vIDQuIGNvbnN0cmFpbnQgY29kZVxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJjb2RlXCIpIDtcbiAgLy8gNS4gYnV0dG9uIHRvIGVkaXQgdGhpcyBjb25zdHJhaW50XG4gIGNkaXZzLmFwcGVuZChcImlcIikuYXR0cihcImNsYXNzXCIsIFwibWF0ZXJpYWwtaWNvbnMgZWRpdFwiKS50ZXh0KFwibW9kZV9lZGl0XCIpO1xuICAvLyA2LiBidXR0b24gdG8gcmVtb3ZlIHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGNhbmNlbFwiKS50ZXh0KFwiZGVsZXRlX2ZvcmV2ZXJcIik7XG5cbiAgLy8gUmVtb3ZlIGV4aXRpbmdcbiAgY29uc3Rycy5leGl0KCkucmVtb3ZlKCkgO1xuXG4gIC8vIFNldCB0aGUgdGV4dCBmb3IgZWFjaCBjb25zdHJhaW50XG4gIGNvbnN0cnNcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oYykgeyByZXR1cm4gXCJjb25zdHJhaW50IFwiICsgYy5jdHlwZTsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLmNvZGUgfHwgXCI/XCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJvcFwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMub3AgfHwgXCJJU0FcIjsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cInZhbHVlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpe1xuICAgICAgICAgIC8vIEZJWE1FIFxuICAgICAgICAgIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlICsgKGMuZXh0cmFWYWx1ZSA/IFwiIGluIFwiICsgYy5leHRyYVZhbHVlIDogXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgfHwgKGMudmFsdWVzICYmIGMudmFsdWVzLmpvaW4oXCIsXCIpKSB8fCBjLnR5cGU7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmVkaXRcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGMpeyBcbiAgICAgICAgICBlZGl0Q29uc3RyYWludChjLCBuKTtcbiAgICAgIH0pO1xuICBjb25zdHJzLnNlbGVjdChcImkuY2FuY2VsXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCB0cnVlKTtcbiAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgIH0pXG5cblxuICAvLyBUcmFuc2l0aW9uIHRvIFwiZ3Jvd1wiIHRoZSBkaWFsb2cgb3V0IG9mIHRoZSBub2RlXG4gIGRpYWxvZy50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMS4wKVwiKTtcblxuICAvL1xuICB2YXIgdCA9IG4ucGNvbXAudHlwZTtcbiAgaWYgKHR5cGVvZih0KSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgLy8gZGlhbG9nIGZvciBzaW1wbGUgYXR0cmlidXRlcy5cbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsdHJ1ZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlLm5hbWUgfHwgbi5wY29tcC50eXBlICk7XG4gICAgICAvLyBcbiAgICAgIGRpYWxvZy5zZWxlY3QoXCIuc2VsZWN0LWN0cmxcIilcbiAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgICAgLy8gRGlhbG9nIGZvciBjbGFzc2VzXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLGZhbHNlKTtcbiAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUgPyBuLnBjb21wLnR5cGUubmFtZSA6IG4ucGNvbXAubmFtZSk7XG5cbiAgICAgIC8vIHdpcmUgdXAgdGhlIGJ1dHRvbiB0byBzaG93IHN1bW1hcnkgZmllbGRzXG4gICAgICBkaWFsb2cuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2hvd1N1bW1hcnlcIl0nKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHNlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzdW1tYXJ5ZmllbGRzXCIpKTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgdGFibGUgbGlzdGluZyBhbGwgdGhlIGF0dHJpYnV0ZXMvcmVmcy9jb2xsZWN0aW9ucy5cbiAgICAgIHZhciB0YmwgPSBkaWFsb2cuc2VsZWN0KFwidGFibGUuYXR0cmlidXRlc1wiKTtcbiAgICAgIHZhciByb3dzID0gdGJsLnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLmFsbFBhcnRzKVxuICAgICAgICAgIDtcbiAgICAgIHJvd3MuZW50ZXIoKS5hcHBlbmQoXCJ0clwiKTtcbiAgICAgIHJvd3MuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgdmFyIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoXCJ0ZFwiKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICAgICAgaWYgKGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIikge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIlNlbGVjdCB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ3NlbGVjdHNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcInNlbGVjdGVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkNvbnN0cmFpbiB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ2NvbnN0cmFpbnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcImNvbnN0cmFpbmVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogYDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkZvbGxvdyB0aGlzICR7Y29tcC5raW5kfVwiPnBsYXlfYXJyb3c8L2k+YCxcbiAgICAgICAgICAgICAgICAgIGNsczogJ29wZW5uZXh0JyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwib3BlblwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZW50ZXIoKS5hcHBlbmQoXCJ0ZFwiKTtcbiAgICAgIGNlbGxzXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5jbHM7fSlcbiAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLmNsaWNrICYmIGQuY2xpY2soKTsgfSlcbiAgICAgICAgICA7XG4gICAgICBjZWxscy5leGl0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuLy8gSGlkZXMgdGhlIGRpYWxvZy4gU2V0cyB0aGUgY3VycmVudCBub2RlIHRvIG51bGwuXG4vLyBBcmdzOlxuLy8gICBub25lXG4vLyBSZXR1cm5zXG4vLyAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gIEhpZGVzIHRoZSBkaWFsb2cuXG4vLyAgU2V0cyBjdXJyTm9kZSB0byBudWxsLlxuLy9cbmZ1bmN0aW9uIGhpZGVEaWFsb2coKXtcbiAgY3Vyck5vZGUgPSBudWxsO1xuICB2YXIgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKVxuICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgdHJ1ZSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbi8yKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxZS02KVwiKVxuICAgICAgO1xuICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpXG4gICAgICA7XG59XG5cbi8vIFNldCB0aGUgZWRpdGluZyB2aWV3LiBWaWV3IGlzIG9uZSBvZjpcbi8vIEFyZ3M6XG4vLyAgICAgdmlldyAoc3RyaW5nKSBPbmUgb2Y6IHF1ZXJ5TWFpbiwgY29uc3RyYWludExvZ2ljLCBjb2x1bW5PcmRlciwgc29ydE9yZGVyXG4vLyBSZXR1cm5zOlxuLy8gICAgIE5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgICBDaGFuZ2VzIHRoZSBsYXlvdXQgYW5kIHVwZGF0ZXMgdGhlIHZpZXcuXG5mdW5jdGlvbiBzZXRFZGl0Vmlldyh2aWV3KXtcbiAgICBsZXQgdiA9IGVkaXRWaWV3c1t2aWV3XTtcbiAgICBpZiAoIXYpIHRocm93IFwiVW5yZWNvZ25pemVkIHZpZXcgdHlwZTogXCIgKyB2aWV3O1xuICAgIGVkaXRWaWV3ID0gdjtcbiAgICB1cGRhdGUocm9vdCk7XG59XG5cbmZ1bmN0aW9uIGRvTGF5b3V0KHJvb3Qpe1xuICB2YXIgbGF5b3V0O1xuICBsZXQgbGVhdmVzID0gW107XG4gIFxuICBpZiAobGF5b3V0U3R5bGUgPT09IFwidHJlZVwiKSB7XG4gICAgICAvLyBkMyBsYXlvdXQgYXJyYW5nZXMgbm9kZXMgdG9wLXRvLWJvdHRvbSwgYnV0IHdlIHdhbnQgbGVmdC10by1yaWdodC5cbiAgICAgIC8vIFNvLi4ucmV2ZXJzZSB3aWR0aCBhbmQgaGVpZ2h0LCBhbmQgZG8gdGhlIGxheW91dC4gVGhlbiwgcmV2ZXJzZSB0aGUgeCx5IGNvb3JkcyBpbiB0aGUgcmVzdWx0cy5cbiAgICAgIGxheW91dCA9IGQzLmxheW91dC50cmVlKCkuc2l6ZShbaCwgd10pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICAvLyBSZXZlcnNlIHggYW5kIHkuIEFsc28sIG5vcm1hbGl6ZSB4IGZvciBmaXhlZC1kZXB0aC5cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wO1xuICAgICAgICAgIGQueCA9IGQuZGVwdGggKiAxODA7XG4gICAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIGRlbmRyb2dyYW1cbiAgICAgIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgbGVhdmVzLnB1c2gobik7XG4gICAgICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gICAgICB9O1xuICAgICAgbGV0IG1heGQgPSBtZChyb290KTsgLy8gbWF4IGRlcHRoLCAxLWJhc2VkXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQuY2x1c3RlcigpXG4gICAgICAgICAgLnNlcGFyYXRpb24oKGEsYikgPT4gMSlcbiAgICAgICAgICAuc2l6ZShbaCwgbWF4ZCAqIDE4MF0pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICBub2Rlcy5mb3JFYWNoKCBkID0+IHsgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7IH0pO1xuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIEV4cGVyaW1lbnRpbmcgd2l0aCByZWFycmFuZ2luZyBsZWF2ZXMuIFJvdWdoIGNvZGUgYWhlYWQuLi5cbiAgICAgIC8vXG4gICAgICAvLyBSZWFycmFuZ2UgeS1wb3NpdGlvbnMgb2YgbGVhZiBub2Rlcy4gXG4gICAgICBsZXQgcG9zID0gbGVhdmVzLm1hcChmdW5jdGlvbihuKXsgcmV0dXJuIHsgeTogbi55LCB5MDogbi55MCB9OyB9KTtcbiAgICAgIC8vbGV0IHBvcyA9IGxlYXZlcy5tYXAoZnVuY3Rpb24obil7IHJldHVybiB7IHg6IG4ueCwgeDA6IG4ueDAgfTsgfSk7XG4gICAgICBsZXQgbmFtZUNvbXAgPSBmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgICBsZXQgbmEgPSBhLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBsZXQgbmIgPSBiLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICByZXR1cm4gbmEgPCBuYiA/IC0xIDogbmEgPiBuYiA/IDEgOiAwO1xuICAgICAgfTtcbiAgICAgIGxldCBjb2xPcmRlckNvbXAgPSBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIGlmIChhLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgIGlmIChiLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYS52aWV3IC0gYi52aWV3O1xuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGlmIChiLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gbmFtZUNvbXAoYSxiKVxuICAgICAgfVxuICAgICAgbGVhdmVzLnNvcnQoY29sT3JkZXJDb21wKTtcbiAgICAgIC8vIHJlYXNzaWduIHRoZSBZIHBvc2l0aW9uc1xuICAgICAgbGVhdmVzLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgICAgbi55ID0gcG9zW2ldLnk7XG4gICAgICAgICAgbi55MCA9IHBvc1tpXS55MDtcbiAgICAgIH0pO1xuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbGVhdmVzIGhhdmUgYmVlbiByZWFycmFuZ2VkLCBidXQgdGhlIGludGVyaW9yIG5vZGVzIGhhdmVuJ3QuXG4gICAgICAvLyBIZXIgd2UgbW92ZSBpbnRlcmlvciBub2RlcyB0b3dhcmQgdGhlaXIgXCJjZW50ZXIgb2YgZ3Jhdml0eVwiIGFzIGRlZmluZWRcbiAgICAgIC8vIGJ5IHRoZSBwb3NpdGlvbnMgb2YgdGhlaXIgY2hpbGRyZW4uIEFwcGx5IHRoaXMgcmVjdXJzaXZlbHkgdXAgdGhlIHRyZWUuXG4gICAgICAvLyBcbiAgICAgIC8vIE5PVEUgdGhhdCB4IGFuZCB5IGNvb3JkaW5hdGVzIGFyZSBvcHBvc2l0ZSBhdCB0aGlzIHBvaW50IVxuICAgICAgLy9cbiAgICAgIC8vIE1haW50YWluIGEgbWFwIG9mIG9jY3VwaWVkIHBvc2l0aW9uczpcbiAgICAgIGxldCBvY2N1cGllZCA9IHt9IDsgIC8vIG9jY3VwaWVkW3ggcG9zaXRpb25dID09IFtsaXN0IG9mIG5vZGVzXVxuICAgICAgZnVuY3Rpb24gY29nIChuKSB7XG4gICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAvLyBjb21wdXRlIG15IGMuby5nLiBhcyB0aGUgYXZlcmFnZSBvZiBteSBraWRzJyBwb3NpdGlvbnNcbiAgICAgICAgICAgICAgbGV0IG15Q29nID0gKG4uY2hpbGRyZW4ubWFwKGNvZykucmVkdWNlKCh0LGMpID0+IHQrYywgMCkpL24uY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICBpZihuLnBhcmVudCkgbi55ID0gbXlDb2c7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBkZCA9IG9jY3VwaWVkW24ueV0gPSAob2NjdXBpZWRbbi55XSB8fCBbXSk7XG4gICAgICAgICAgZGQucHVzaChuLnkpO1xuICAgICAgICAgIHJldHVybiBuLnk7XG4gICAgICB9XG4gICAgICBjb2cocm9vdCk7XG5cbiAgICAgIC8vIFRPRE86IEZpbmFsIGFkanVzdG1lbnRzXG4gICAgICAvLyAxLiBJZiB3ZSBleHRlbmQgb2ZmIHRoZSByaWdodCBlZGdlLCBjb21wcmVzcy5cbiAgICAgIC8vIDIuIElmIGl0ZW1zIGF0IHNhbWUgeCBvdmVybGFwLCBzcHJlYWQgdGhlbSBvdXQgaW4geS5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB9XG5cbiAgLy8gc2F2ZSBsaW5rcyBpbiBnbG9iYWxcbiAgbGlua3MgPSBsYXlvdXQubGlua3Mobm9kZXMpO1xuXG4gIHJldHVybiBbbm9kZXMsIGxpbmtzXVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gdXBkYXRlKG4pIFxuLy8gVGhlIG1haW4gZHJhd2luZyByb3V0aW5lLiBcbi8vIFVwZGF0ZXMgdGhlIFNWRywgdXNpbmcgbiBhcyB0aGUgc291cmNlIG9mIGFueSBlbnRlcmluZy9leGl0aW5nIGFuaW1hdGlvbnMuXG4vL1xuZnVuY3Rpb24gdXBkYXRlKHNvdXJjZSkge1xuICAvL1xuICBkb0xheW91dChyb290KTtcbiAgdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSk7XG4gIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpO1xuICB1cGRhdGVUdGV4dCgpO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSl7XG4gIGxldCBub2RlR3JwcyA9IHZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgO1xuXG4gIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54MCArIFwiLFwiICsgc291cmNlLnkwICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICAvL25vZGVFbnRlci5hcHBlbmQoXCJzdmc6Y2lyY2xlXCIpXG4gIG5vZGVFbnRlci5hcHBlbmQoZnVuY3Rpb24oZCl7XG4gICAgICB2YXIgc2hhcGUgPSAoZC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIgPyBcInJlY3RcIiA6IFwiY2lyY2xlXCIpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHNoYXBlKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgaWYgKGN1cnJOb2RlICE9PSBkKSBzaG93RGlhbG9nKGQsIHRoaXMpO1xuICAgICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfSk7XG4gIG5vZGVFbnRlci5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICA7XG4gIG5vZGVFbnRlci5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInhcIiwgLTguNSlcbiAgICAgIC5hdHRyKFwieVwiLCAtOC41KVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICAuYXR0cihcImhlaWdodFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICA7XG5cbiAgLy8gQWRkIHRleHQgZm9yIG5vZGUgbmFtZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmNoaWxkcmVuIHx8IGQuX2NoaWxkcmVuID8gLTEwIDogMTA7IH0pXG4gICAgICAuYXR0cihcImR5XCIsIFwiLjM1ZW1cIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KSAvLyBzdGFydCBvZmYgbmVhcmx5IHRyYW5zcGFyZW50XG4gICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlTmFtZVwiKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gbm9kZXMgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICBsZXQgbm9kZVVwZGF0ZSA9IG5vZGVHcnBzXG4gICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkOyB9KVxuICAgICAgLmNsYXNzZWQoXCJjb25zdHJhaW5lZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uY29uc3RyYWludHMubGVuZ3RoID4gMDsgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbi54ICsgXCIsXCIgKyBuLnkgKyBcIilcIjsgfSlcbiAgICAgIDtcblxuICBub2RlVXBkYXRlLnNlbGVjdEFsbChcInRleHQubm9kZU5hbWVcIilcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZC5uYW1lICsgKGQuaXNTZWxlY3RlZCA/IGAoJHtkLnZpZXd9KWAgOiBcIlwiKTtcbiAgICAgIH0pXG5cblxuICBsZXQgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKTtcbiAgbm9kZUdycHMuY2FsbChkcmFnKTtcbiAgZHJhZy5vbihcImRyYWdcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgLy9jb25zb2xlLmxvZyhcIkRyYWdcIiwgdGhpcywgZDMuZXZlbnQuZHgsIGQzLmV2ZW50LmR5KTtcbiAgICAgIC8vY29uc29sZS5sb2coXCJEcmFnXCIsIHRoaXMsIGQzLmV2ZW50LngsIGQzLmV2ZW50LnkpO1xuICB9KTtcblxuICAvLyBBZGQgdGV4dCBmb3IgY29uc3RyYWludHNcbiAgbGV0IGN0ID0gbm9kZUdycHMuc2VsZWN0QWxsKFwidGV4dC5jb25zdHJhaW50XCIpXG4gICAgICAuZGF0YShmdW5jdGlvbihuKXsgcmV0dXJuIG4uY29uc3RyYWludHM7IH0pO1xuICBjdC5lbnRlcigpLmFwcGVuZChcInN2Zzp0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbnN0cmFpbnRcIik7XG4gIGN0LmV4aXQoKS5yZW1vdmUoKTtcbiAgY3QudGV4dCggYyA9PiBjb25zdHJhaW50VGV4dChjKSApXG4gICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgLmF0dHIoXCJkeVwiLCAoYyxpKSA9PiBgJHsoaSsxKSoxLjd9ZW1gKVxuICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIixcInN0YXJ0XCIpXG4gICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byBmdWxsIHNpemVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCA4LjUgKVxuICAgICAgO1xuICBub2RlVXBkYXRlLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTcgKVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMTcgKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byBmdWxseSBvcGFxdWVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMSlcbiAgICAgIDtcblxuICAvL1xuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGV0IG5vZGVFeGl0ID0gbm9kZUdycHMuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueCArIFwiLFwiICsgc291cmNlLnkgKyBcIilcIjsgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byB0aW55IHJhZGl1c1xuICBub2RlRXhpdC5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCAxZS02KVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byB0cmFuc3BhcmVudFxuICBub2RlRXhpdC5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNilcbiAgICAgIDtcbiAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXG4gIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGQueDAgPSBkLng7XG4gICAgZC55MCA9IGQueTtcbiAgfSk7XG4gIC8vXG5cbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpIHtcbiAgbGV0IGxpbmsgPSB2aXMuc2VsZWN0QWxsKFwicGF0aC5saW5rXCIpXG4gICAgICAuZGF0YShsaW5rcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQuaWQ7IH0pXG4gICAgICA7XG5cbiAgLy8gRW50ZXIgYW55IG5ldyBsaW5rcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBuZXdQYXRocyA9IGxpbmsuZW50ZXIoKS5pbnNlcnQoXCJzdmc6cGF0aFwiLCBcImdcIik7XG4gIGxldCBsaW5rVGl0bGUgPSBmdW5jdGlvbihsKXtcbiAgICAgIGxldCBjbGljayA9IFwiXCI7XG4gICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIil7XG4gICAgICAgICAgY2xpY2sgPSBgQ2xpY2sgdG8gbWFrZSB0aGlzIHJlbGF0aW9uc2hpcCAke2wudGFyZ2V0LmpvaW4gPyBcIlJFUVVJUkVEXCIgOiBcIk9QVElPTkFMXCJ9LiBgO1xuICAgICAgfVxuICAgICAgbGV0IGFsdGNsaWNrID0gXCJBbHQtY2xpY2sgdG8gY3V0IGxpbmsuXCI7XG4gICAgICByZXR1cm4gY2xpY2sgKyBhbHRjbGljaztcbiAgfVxuICAvLyBzZXQgdGhlIHRvb2x0aXBcbiAgbmV3UGF0aHMuYXBwZW5kKFwic3ZnOnRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgbmV3UGF0aHMuYXR0cihcImNsYXNzXCIsIFwibGlua1wiKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngwLCB5OiBzb3VyY2UueTB9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLmNsYXNzZWQoXCJhdHRyaWJ1dGVcIiwgZnVuY3Rpb24obCkgeyByZXR1cm4gbC50YXJnZXQucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIjsgfSlcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGwpeyBcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgIC8vIGEgc2hpZnQtY2xpY2sgY3V0cyB0aGUgdHJlZSBhdCB0aGlzIGVkZ2VcbiAgICAgICAgICAgICAgcmVtb3ZlTm9kZShsLnRhcmdldClcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIpIHJldHVybjtcbiAgICAgICAgICAgICAgLy8gcmVndWxhciBjbGljayBvbiBhIHJlbGF0aW9uc2hpcCBlZGdlIGludmVydHMgd2hldGhlclxuICAgICAgICAgICAgICAvLyB0aGUgam9pbiBpcyBpbm5lciBvciBvdXRlci4gXG4gICAgICAgICAgICAgIGwudGFyZ2V0LmpvaW4gPSAobC50YXJnZXQuam9pbiA/IG51bGwgOiBcIm91dGVyXCIpO1xuICAgICAgICAgICAgICAvLyByZS1zZXQgdGhlIHRvb2x0aXBcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcInRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgICAgICAgICAgdXBkYXRlKGwuc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcbiBcbiAgXG4gIC8vIFRyYW5zaXRpb24gbGlua3MgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICBsaW5rLmNsYXNzZWQoXCJvdXRlclwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLnRhcmdldC5qb2luID09PSBcIm91dGVyXCI7IH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZGlhZ29uYWwpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxpbmsuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngsIHk6IHNvdXJjZS55fTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG59XG5cbi8vIFR1cm5zIGEganNvbiByZXByZXNlbnRhdGlvbiBvZiBhIHRlbXBsYXRlIGludG8gWE1MLCBzdWl0YWJsZSBmb3IgaW1wb3J0aW5nIGludG8gdGhlIEludGVybWluZSBRQi5cbmZ1bmN0aW9uIGpzb24yeG1sKHQsIHFvbmx5KXtcbiAgICB2YXIgc28gPSAodC5vcmRlckJ5IHx8IFtdKS5yZWR1Y2UoZnVuY3Rpb24ocyx4KXsgXG4gICAgICAgIHZhciBrID0gT2JqZWN0LmtleXMoeClbMF07XG4gICAgICAgIHZhciB2ID0geFtrXVxuICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICB9LCBcIlwiKTtcblxuICAgIC8vIEZ1bmN0aW9uIHRvIGVzY2FwZSAnPCcgJ1wiJyBhbmQgJyYnIGNoYXJhY3RlcnNcbiAgICB2YXIgZXNjID0gZnVuY3Rpb24ocyl7IHJldHVybiBzLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTsgfTtcbiAgICAvLyBDb252ZXJ0cyBhbiBvdXRlciBqb2luIHBhdGggdG8geG1sLlxuICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICB9XG4gICAgLy8gQ29udmVydHMgYSBjb25zdHJhaW50IHRvIHhtbFxuICAgIGZ1bmN0aW9uIGMyeG1sKGMpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiIHx8IGMuY3R5cGUgPT09IFwibGlzdFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2VzYyhjLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKGMudmFsdWUpfVwiIGNvZGU9XCIke2MuY29kZX1cIiBlZGl0YWJsZT1cIiR7Yy5lZGl0YWJsZX1cImA7XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKGMuZXh0cmFWYWx1ZSAmJiBjLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke2MuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2VzYyhjLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKGMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke2MuY29kZX1cIiBlZGl0YWJsZT1cIiR7Yy5lZGl0YWJsZX1cImA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHtjLnBhdGh9XCIgb3A9XCIke2Mub3B9XCIgY29kZT1cIiR7Yy5jb2RlfVwiIGVkaXRhYmxlPVwiJHtjLmVkaXRhYmxlfVwiYDtcbiAgICAgICAgICAgIGggPSBjLnZhbHVlcy5tYXAoIHYgPT4gYDx2YWx1ZT4ke2VzYyh2KX08L3ZhbHVlPmAgKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke2MucGF0aH1cIiB0eXBlPVwiJHtjLnR5cGV9XCIgZWRpdGFibGU9XCJmYWxzZVwiYDtcbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke2MucGF0aH1cIiBvcD1cIiR7Yy5vcH1cIiBjb2RlPVwiJHtjLmNvZGV9XCIgZWRpdGFibGU9XCIke2MuZWRpdGFibGV9XCJgO1xuICAgICAgICBpZihoKVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9PiR7aH08L2NvbnN0cmFpbnQ+XFxuYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9IC8+XFxuYDtcbiAgICB9XG5cbiAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgIHZhciBxcGFydCA9IFxuYDxxdWVyeVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgbW9kZWw9XCIkeyh0Lm1vZGVsICYmIHQubW9kZWwubmFtZSkgfHwgJyd9XCJcbiAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gIHNvcnRPcmRlcj1cIiR7c28gfHwgJyd9XCJcbiAgY29uc3RyYWludExvZ2ljPVwiJHt0LmNvbnN0cmFpbnRMb2dpYyB8fCAnJ31cIj5cbiAgJHsodC5qb2lucyB8fCBbXSkubWFwKG9qMnhtbCkuam9pbihcIiBcIil9XG4gICR7KHQud2hlcmUgfHwgW10pLm1hcChjMnhtbCkuam9pbihcIiBcIil9XG48L3F1ZXJ5PmA7XG4gICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgdmFyIHRtcGx0ID0gXG5gPHRlbXBsYXRlXG4gIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gIGNvbW1lbnQ9XCIke2VzYyh0LmNvbW1lbnQgfHwgJycpfVwiPlxuICR7cXBhcnR9XG48L3RlbXBsYXRlPlxuYDtcbiAgICByZXR1cm4gcW9ubHkgPyBxcGFydCA6IHRtcGx0XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVUdGV4dCgpe1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dDtcbiAgaWYoIGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSApXG4gICAgICB0eHQgPSBKU09OLnN0cmluZ2lmeSh1Y3QsIG51bGwsIDIpO1xuICBlbHNlXG4gICAgICB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBkMy5zZWxlY3QoXCIjdHRleHRkaXZcIikgXG4gICAgICAudGV4dCh0eHQpXG4gICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIHRydWUpO1xuICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgdXBkYXRlQ291bnQoKTtcbn1cblxuZnVuY3Rpb24gcnVuYXRtaW5lKCkge1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dCA9IGpzb24yeG1sKHVjdCk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQodHh0KTtcbiAgbGV0IGxpbmt1cmwgPSBjdXJyTWluZS51cmwgKyBcIi9sb2FkUXVlcnkuZG8/dHJhaWw9JTdDcXVlcnkmbWV0aG9kPXhtbFwiO1xuICBsZXQgZWRpdHVybCA9IGxpbmt1cmwgKyBcIiZxdWVyeT1cIiArIHVybFR4dDtcbiAgbGV0IHJ1bnVybCA9IGxpbmt1cmwgKyBcIiZza2lwQnVpbGRlcj10cnVlJnF1ZXJ5PVwiICsgdXJsVHh0O1xuICB3aW5kb3cub3BlbiggZDMuZXZlbnQuYWx0S2V5ID8gZWRpdHVybCA6IHJ1bnVybCwgJ19ibGFuaycgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCBxdHh0ID0ganNvbjJ4bWwodWN0LCB0cnVlKTtcbiAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudChxdHh0KTtcbiAgbGV0IGNvdW50VXJsID0gY3Vyck1pbmUudXJsICsgYC9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JHt1cmxUeHR9JmZvcm1hdD1jb3VudGA7XG4gIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwicnVubmluZ1wiLCB0cnVlKTtcbiAgZDNqc29uUHJvbWlzZShjb3VudFVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG4pe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgZmFsc2UpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IHNwYW4nKS50ZXh0KG4pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgdHJ1ZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6OlwiLCBxdHh0KVxuICAgICAgfSk7XG59XG5cbi8vIFRoZSBjYWxsIHRoYXQgZ2V0cyBpdCBhbGwgZ29pbmcuLi5cbnNldHVwKClcbi8vXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYi5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIENvbnN0cmFpbnRzIG9uIGF0dHJpYnV0ZXM6XG4vLyAtIHZhbHVlIChjb21wYXJpbmcgYW4gYXR0cmlidXRlIHRvIGEgdmFsdWUsIHVzaW5nIGFuIG9wZXJhdG9yKVxuLy8gICAgICA+ID49IDwgPD0gPSAhPSBMSUtFIE5PVC1MSUtFIENPTlRBSU5TIERPRVMtTk9ULUNPTlRBSU5cbi8vIC0gbXVsdGl2YWx1ZSAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBtdWx0aXBsZSB2YWx1ZSlcbi8vICAgICAgT05FLU9GIE5PVC1PTkUgT0Zcbi8vIC0gcmFuZ2UgKHN1YnR5cGUgb2YgbXVsdGl2YWx1ZSwgZm9yIGNvb3JkaW5hdGUgcmFuZ2VzKVxuLy8gICAgICBXSVRISU4gT1VUU0lERSBPVkVSTEFQUyBET0VTLU5PVC1PVkVSTEFQXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTClcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIHJlZmVyZW5jZXMvY29sbGVjdGlvbnNcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMIHJlZi9lbXB0eSBjb2xsZWN0aW9uKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vLyAtIGxvb2t1cCAoXG4vLyAgICAgIExPT0tVUFxuLy8gLSBzdWJjbGFzc1xuLy8gICAgICBJU0Fcbi8vIC0gbGlzdFxuLy8gICAgICBJTiBOT1QtSU5cbi8vIC0gbG9vcCAoVE9ETylcblxudmFyIE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxudmFyIE5VTExBQkxFVFlQRVM9IFtcbiAgICBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiLFxuICAgIFwiamF2YS5sYW5nLlN0cmluZ1wiLFxuICAgIFwiamF2YS5sYW5nLkJvb2xlYW5cIlxuXTtcblxudmFyIExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJPYmplY3RcIlxuXVxuXG5cbnZhciBPUFMgPSBbXG5cbiAgICAvLyBWYWxpZCBmb3IgYW55IGF0dHJpYnV0ZVxuICAgIC8vIEFsc28gdGhlIG9wZXJhdG9ycyBmb3IgbG9vcCBjb25zdHJhaW50cyAobm90IHlldCBpbXBsZW1lbnRlZCkuXG4gICAge1xuICAgIG9wOiBcIj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSx7XG4gICAgb3A6IFwiIT1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3IgbnVtZXJpYyBhbmQgZGF0ZSBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIj5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIj49XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3Igc3RyaW5nIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiQ09OVEFJTlNcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cblxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIENPTlRBSU5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIExJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJPTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBmb3IgTG9jYXRpb24gbm9kZXNcbiAgICB7XG4gICAgb3A6IFwiV0lUSElOXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9WRVJMQVBTXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIE9WRVJMQVBcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1VUU0lERVwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LFxuIFxuICAgIC8vIE5VTEwgY29uc3RyYWludHMuIFZhbGlkIGZvciBhbnkgbm9kZSBleGNlcHQgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVMgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCJJUyBOT1QgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSAoaS5lLiwgdGhlIHJvb3QsIG9yIGFueSBcbiAgICAvLyByZWZlcmVuY2Ugb3IgY29sbGVjdGlvbiBub2RlKS5cbiAgICB7XG4gICAgb3A6IFwiTE9PS1VQXCIsXG4gICAgY3R5cGU6IFwibG9va3VwXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIklOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJOT1QgSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSBleGNlcHQgdGhlIHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTQVwiLFxuICAgIGN0eXBlOiBcInN1YmNsYXNzXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9XTtcbi8vXG52YXIgT1BJTkRFWCA9IE9QUy5yZWR1Y2UoZnVuY3Rpb24oeCxvKXtcbiAgICB4W28ub3BdID0gbztcbiAgICByZXR1cm4geDtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8vIFByb21pc2lmaWVzIGEgY2FsbCB0byBkMy5qc29uLlxuLy8gQXJnczpcbi8vICAgdXJsIChzdHJpbmcpIFRoZSB1cmwgb2YgdGhlIGpzb24gcmVzb3VyY2Vcbi8vIFJldHVybnM6XG4vLyAgIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBqc29uIG9iamVjdCB2YWx1ZSwgb3IgcmVqZWN0cyB3aXRoIGFuIGVycm9yXG5mdW5jdGlvbiBkM2pzb25Qcm9taXNlKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZDMuanNvbih1cmwsIGZ1bmN0aW9uKGVycm9yLCBqc29uKXtcbiAgICAgICAgICAgIGVycm9yID8gcmVqZWN0KHsgc3RhdHVzOiBlcnJvci5zdGF0dXMsIHN0YXR1c1RleHQ6IGVycm9yLnN0YXR1c1RleHR9KSA6IHJlc29sdmUoanNvbik7XG4gICAgICAgIH0pXG4gICAgfSk7XG59XG5cbi8vIFNlbGVjdHMgYWxsIHRoZSB0ZXh0IGluIHRoZSBnaXZlbiBjb250YWluZXIuIFxuLy8gVGhlIGNvbnRhaW5lciBtdXN0IGhhdmUgYW4gaWQuXG4vLyBDb3BpZWQgZnJvbTpcbi8vICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzE2Nzc0NTEvaG93LXRvLXNlbGVjdC1kaXYtdGV4dC1vbi1idXR0b24tY2xpY2tcbmZ1bmN0aW9uIHNlbGVjdFRleHQoY29udGFpbmVyaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn1cblxuLy8gQ29udmVydHMgYW4gSW50ZXJNaW5lIHF1ZXJ5IGluIFBhdGhRdWVyeSBYTUwgZm9ybWF0IHRvIGEgSlNPTiBvYmplY3QgcmVwcmVzZW50YXRpb24uXG4vL1xuZnVuY3Rpb24gcGFyc2VQYXRoUXVlcnkoeG1sKXtcbiAgICAvLyBUdXJucyB0aGUgcXVhc2ktbGlzdCBvYmplY3QgcmV0dXJuZWQgYnkgc29tZSBET00gbWV0aG9kcyBpbnRvIGFjdHVhbCBsaXN0cy5cbiAgICBmdW5jdGlvbiBkb21saXN0MmFycmF5KGxzdCkge1xuICAgICAgICBsZXQgYSA9IFtdO1xuICAgICAgICBmb3IobGV0IGk9MDsgaTxsc3QubGVuZ3RoOyBpKyspIGEucHVzaChsc3RbaV0pO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgLy8gcGFyc2UgdGhlIFhNTFxuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGRvbSA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sLCBcInRleHQveG1sXCIpO1xuXG4gICAgLy8gZ2V0IHRoZSBwYXJ0cy4gVXNlciBtYXkgcGFzdGUgaW4gYSA8dGVtcGxhdGU+IG9yIGEgPHF1ZXJ5PlxuICAgIC8vIChpLmUuLCB0ZW1wbGF0ZSBtYXkgYmUgbnVsbClcbiAgICBsZXQgdGVtcGxhdGUgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZW1wbGF0ZVwiKVswXTtcbiAgICBsZXQgdGl0bGUgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSB8fCBcIlwiO1xuICAgIGxldCBjb21tZW50ID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwiY29tbWVudFwiKSB8fCBcIlwiO1xuICAgIGxldCBxdWVyeSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInF1ZXJ5XCIpWzBdO1xuICAgIGxldCBtb2RlbCA9IHsgbmFtZTogcXVlcnkuZ2V0QXR0cmlidXRlKFwibW9kZWxcIikgfHwgXCJnZW5vbWljXCIgfTtcbiAgICBsZXQgbmFtZSA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm5hbWVcIikgfHwgXCJcIjtcbiAgICBsZXQgZGVzY3JpcHRpb24gPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJsb25nRGVzY3JpdGlvblwiKSB8fCBcIlwiO1xuICAgIGxldCBzZWxlY3QgPSAocXVlcnkuZ2V0QXR0cmlidXRlKFwidmlld1wiKSB8fCBcIlwiKS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICBsZXQgY29uc3RyYWludHMgPSBkb21saXN0MmFycmF5KGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY29uc3RyYWludCcpKTtcbiAgICBsZXQgY29uc3RyYWludExvZ2ljID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwiY29uc3RyYWludExvZ2ljXCIpO1xuICAgIGxldCBqb2lucyA9IGRvbWxpc3QyYXJyYXkocXVlcnkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJqb2luXCIpKTtcbiAgICBsZXQgc29ydE9yZGVyID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpIHx8IFwiXCI7XG4gICAgLy9cbiAgICAvL1xuICAgIGxldCB3aGVyZSA9IGNvbnN0cmFpbnRzLm1hcChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBvcCA9IGMuZ2V0QXR0cmlidXRlKFwib3BcIik7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICAgICAgICBvcCA9IFwiSVNBXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdmFscyA9IGRvbWxpc3QyYXJyYXkoYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInZhbHVlXCIpKS5tYXAoIHYgPT4gdi5pbm5lckhUTUwgKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3A6IG9wLFxuICAgICAgICAgICAgICAgIHBhdGg6IGMuZ2V0QXR0cmlidXRlKFwicGF0aFwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGMuZ2V0QXR0cmlidXRlKFwidmFsdWVcIiksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogdmFscyxcbiAgICAgICAgICAgICAgICB0eXBlIDogYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLFxuICAgICAgICAgICAgICAgIGNvZGU6IGMuZ2V0QXR0cmlidXRlKFwiY29kZVwiKSxcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogYy5nZXRBdHRyaWJ1dGUoXCJlZGl0YWJsZVwiKSB8fCBcInRydWVcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIC8vIENoZWNrOiBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjb25zdHJhaW50LCAoYW5kIGl0J3Mgbm90IGFuIElTQSksIHNvbWV0aW1lcyB0aGUgY29uc3RyYWludExvZ2ljIFxuICAgIC8vIGFuZC9vciB0aGUgY29uc3RyYWludCBjb2RlIGFyZSBtaXNzaW5nLlxuICAgIGlmICh3aGVyZS5sZW5ndGggPT09IDEgJiYgd2hlcmVbMF0ub3AgIT09IFwiSVNBXCIgJiYgIXdoZXJlWzBdLmNvZGUpe1xuICAgICAgICB3aGVyZVswXS5jb2RlID0gY29uc3RyYWludExvZ2ljID0gXCJBXCI7XG4gICAgfVxuXG4gICAgLy8gb3V0ZXIgam9pbnMuIFRoZXkgbG9vayBsaWtlIHRoaXM6XG4gICAgLy8gICAgICAgPGpvaW4gcGF0aD1cIkdlbmUuc2VxdWVuY2VPbnRvbG9neVRlcm1cIiBzdHlsZT1cIk9VVEVSXCIvPlxuICAgIGpvaW5zID0gam9pbnMubWFwKCBqID0+IGouZ2V0QXR0cmlidXRlKFwicGF0aFwiKSApO1xuXG4gICAgbGV0IG9yZGVyQnkgPSBudWxsO1xuICAgIGlmIChzb3J0T3JkZXIpIHtcbiAgICAgICAgLy8gVGhlIGpzb24gZm9ybWF0IGZvciBvcmRlckJ5IGlzIGEgYml0IHdlaXJkLlxuICAgICAgICAvLyBJZiB0aGUgeG1sIG9yZGVyQnkgaXM6IFwiQS5iLmMgYXNjIEEuZC5lIGRlc2NcIixcbiAgICAgICAgLy8gdGhlIGpzb24gc2hvdWxkIGJlOiBbIHtcIkEuYi5jXCI6XCJhc2NcIn0sIHtcIkEuZC5lXCI6XCJkZXNjfSBdXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBUaGUgb3JkZXJieSBzdHJpbmcgdG9rZW5zLCBlLmcuIFtcIkEuYi5jXCIsIFwiYXNjXCIsIFwiQS5kLmVcIiwgXCJkZXNjXCJdXG4gICAgICAgIGxldCBvYiA9IHNvcnRPcmRlci50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrOlxuICAgICAgICBpZiAob2IubGVuZ3RoICUgMiApXG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBwYXJzZSB0aGUgb3JkZXJCeSBjbGF1c2U6IFwiICsgcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpO1xuICAgICAgICAvLyBjb252ZXJ0IHRva2VucyB0byBqc29uIG9yZGVyQnkgXG4gICAgICAgIG9yZGVyQnkgPSBvYi5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBjdXJyLCBpKXtcbiAgICAgICAgICAgIGlmIChpICUgMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgLy8gb2RkLiBjdXJyIGlzIGEgcGF0aC4gUHVzaCBpdC5cbiAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZXZlbi4gUG9wIHRoZSBwYXRoLCBjcmVhdGUgdGhlIHt9LCBhbmQgcHVzaCBpdC5cbiAgICAgICAgICAgICAgICBsZXQgdiA9IHt9XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBhY2MucG9wKClcbiAgICAgICAgICAgICAgICB2W3BdID0gY3VycjtcbiAgICAgICAgICAgICAgICBhY2MucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgY29uc3RyYWludExvZ2ljLFxuICAgICAgICBzZWxlY3QsXG4gICAgICAgIHdoZXJlLFxuICAgICAgICBqb2lucyxcbiAgICAgICAgb3JkZXJCeVxuICAgIH07XG59XG5cbi8vIFJldHVybnMgYSBkZWVwIGNvcHkgb2Ygb2JqZWN0IG8uIFxuLy8gQXJnczpcbi8vICAgbyAgKG9iamVjdCkgTXVzdCBiZSBhIEpTT04gb2JqZWN0IChubyBjdXJjdWxhciByZWZzLCBubyBmdW5jdGlvbnMpLlxuLy8gUmV0dXJuczpcbi8vICAgYSBkZWVwIGNvcHkgb2Ygb1xuZnVuY3Rpb24gZGVlcGMobykge1xuICAgIGlmICghbykgcmV0dXJuIG87XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobykpO1xufVxuXG4vL1xubGV0IFBSRUZJWD1cIm9yZy5tZ2kuYXBwcy5xYlwiO1xuZnVuY3Rpb24gdGVzdExvY2FsKGF0dHIpIHtcbiAgICByZXR1cm4gKFBSRUZJWCtcIi5cIithdHRyKSBpbiBsb2NhbFN0b3JhZ2U7XG59XG5mdW5jdGlvbiBzZXRMb2NhbChhdHRyLCB2YWwsIGVuY29kZSl7XG4gICAgbG9jYWxTdG9yYWdlW1BSRUZJWCtcIi5cIithdHRyXSA9IGVuY29kZSA/IEpTT04uc3RyaW5naWZ5KHZhbCkgOiB2YWw7XG59XG5mdW5jdGlvbiBnZXRMb2NhbChhdHRyLCBkZWNvZGUsIGRmbHQpe1xuICAgIGxldCBrZXkgPSBQUkVGSVgrXCIuXCIrYXR0cjtcbiAgICBpZiAoa2V5IGluIGxvY2FsU3RvcmFnZSl7XG4gICAgICAgIGxldCB2ID0gbG9jYWxTdG9yYWdlW2tleV07XG4gICAgICAgIGlmIChkZWNvZGUpIHYgPSBKU09OLnBhcnNlKHYpO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkZmx0O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyTG9jYWwoKSB7XG4gICAgbGV0IHJtdiA9IE9iamVjdC5rZXlzKGxvY2FsU3RvcmFnZSkuZmlsdGVyKGtleSA9PiBrZXkuc3RhcnRzV2l0aChQUkVGSVgpKTtcbiAgICBybXYuZm9yRWFjaCggayA9PiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrKSApO1xufVxuXG4vL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBVbmRvTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IobGltaXQpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50ZXIgPSAtMTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnRTdGF0ZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCAwKVxuICAgICAgICAgICAgdGhyb3cgXCJObyBjdXJyZW50IHN0YXRlLlwiO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIGdldCBoYXNTdGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPj0gMDtcbiAgICB9XG4gICAgZ2V0IGNhblVuZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID4gMDtcbiAgICB9XG4gICAgZ2V0IGNhblJlZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTdGF0ZSAmJiB0aGlzLnBvaW50ZXIgPCB0aGlzLmhpc3RvcnkubGVuZ3RoLTE7XG4gICAgfVxuICAgIGFkZCAocykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQUREXCIpO1xuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl0gPSBzO1xuICAgICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKHRoaXMucG9pbnRlcisxKTtcbiAgICB9XG4gICAgdW5kbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVTkRPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblVuZG8pIHRocm93IFwiTm8gdW5kby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICByZWRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJFRE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuUmVkbykgdGhyb3cgXCJObyByZWRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVbmRvTWFuYWdlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=