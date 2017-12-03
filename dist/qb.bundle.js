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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__undoManager_js__ = __webpack_require__(5);

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
let dragBehavior = null;
let animationDuration = 250; // ms
let defaultColors = { header: { main: "#595455", text: "#fff" } };
let defaultLogo = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png";
let undoMgr = new __WEBPACK_IMPORTED_MODULE_4__undoManager_js__["a" /* default */]();
let registryUrl = "http://registry.intermine.org/service/instances";
let registryFileUrl = "./resources/testdata/registry.json";

let editViews = {
    queryMain: {
        name: "queryMain",
        layoutStyle: "tree",
        nodeComp: null,
        handleIcon: {
            fontFamily: "Material Icons",
            text: n => {
                let dir = n.sort ? n.sort.dir.toLowerCase() : "none";
                let cc = __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__["codepoints"][ dir === "asc" ? "arrow_upward" : dir === "desc" ? "arrow_downward" : "" ];
                return cc ? cc : ""
            }
        },
        nodeIcon: {
        }
    },
    columnOrder: {
        name: "columnOrder",
        layoutStyle: "dendrogram",
        draggable: "g.nodegroup.selected",
        nodeComp: function(a,b){
          // Comparator function. In column order view:
          //     - selected nodes are at the top, in selection-list order (top-to-bottom)
          //     - unselected nodes are at the bottom, in alpha order by name
          if (a.isSelected)
              return b.isSelected ? a.view - b.view : -1;
          else
              return b.isSelected ? 1 : nameComp(a,b);
        },
        // drag in columnOrder view changes the column order (duh!)
        afterDrag: function(nodes, dragged) {
          nodes.forEach((n,i) => { n.view = i });
          dragged.template.select = nodes.map( n=> n.path );
        },
        handleIcon: {
            fontFamily: "Material Icons",
            text: n => n.isSelected ? __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__["codepoints"]["reorder"] : ""
        },
        nodeIcon: {
            fontFamily: null,
            text: n => n.isSelected ? n.view : ""
        }
    },
    sortOrder: {
        name: "sortOrder",
        layoutStyle: "dendrogram",
        draggable: "g.nodegroup.sorted",
        nodeComp: function(a,b){
          // Comparator function. In sort order view:
          //     - sorted nodes are at the top, in sort-list order (top-to-bottom)
          //     - unsorted nodes are at the bottom, in alpha order by name
          if (a.sort)
              return b.sort ? a.sort.level - b.sort.level : -1;
          else
              return b.sort ? 1 : nameComp(a,b);
        },
        afterDrag: function(nodes, dragged) {
          // drag in sortOrder view changes the sort order (duh!)
          nodes.forEach((n,i) => {
              n.sort.level = i
          });
        },
        handleIcon: {
            fontFamily: "Material Icons",
            text: n => n.sort ? __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__["codepoints"]["reorder"] : ""
        },
        nodeIcon: {
            fontFamily: "Material Icons",
            text: n => {
                let dir = n.sort ? n.sort.dir.toLowerCase() : "none";
                let cc = __WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__["codepoints"][ dir === "asc" ? "arrow_upward" : dir === "desc" ? "arrow_downward" : "" ];
                return cc ? cc : ""
            }
        }
    },
    constraintLogic: {
        name: "constraintLogic",
        layoutStyle: "dendrogram",
        nodeComp: function(a,b){
          // Comparator function. In constraint logic view:
          //     - constrained nodes are at the top, in code order (top-to-bottom)
          //     - unsorted nodes are at the bottom, in alpha order by name
          let aconst = a.constraints && a.constraints.length > 0;
          let acode = aconst ? a.constraints[0].code : null;
          let bconst = b.constraints && b.constraints.length > 0;
          let bcode = bconst ? b.constraints[0].code : null;
          if (aconst)
              return bconst ? (acode < bcode ? -1 : acode > bcode ? 1 : 0) : -1;
          else
              return bconst ? 1 : nameComp(a, b);
        },
        handleIcon: {
            text: ""
        },
        nodeIcon: {
            text: ""
        }
    }
};

// Comparator function, for sorting a list of nodes by name. Case-insensitive.
//
let nameComp = function(a,b) {
    let na = a.name.toLowerCase();
    let nb = b.name.toLowerCase();
    return na < nb ? -1 : na > nb ? 1 : 0;
};

// Starting edit view is the main query view.
let editView = editViews.queryMain;

// Setup function
function setup(){
    m = [40, 120, 20, 120]
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
    d3.select('.button[name="openclose"]')
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

  //
  dragBehavior = d3.behavior.drag()
    .on("drag", function () {
      // on drag, follow the mouse in the Y dimension.
      // Drag callback is attached to the drag handle.
      let nodeGrp = d3.select(this);
      // update node's y-coordinate
      nodeGrp.attr("transform", (n) => {
          n.y = d3.event.y;
          return `translate(${n.x},${n.y})`;
      });
      // update the node's link
      let ll = d3.select(`path.link[target="${nodeGrp.attr('id')}"]`);
      ll.attr("d", diagonal);
      })
    .on("dragend", function () {
      // on dragend, resort the draggable nodes according to their Y position
      let nodes = d3.selectAll(editView.draggable).data()
      nodes.sort( (a, b) => a.y - b.y );
      // the node that was dragged
      let dragged = d3.select(this).data()[0];
      // callback for specific drag-end behavior
      editView.afterDrag && editView.afterDrag(nodes, dragged);
      //
      update();
      saveState();
      //
      d3.event.sourceEvent.preventDefault();
      d3.event.sourceEvent.stopPropagation();
  });
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
    d3.select("#editView select")
        .on("change", function () { setEditView(this.value); })
        ;

    //
    d3.select("#dialog .subclassConstraint select")
        .on("change", function(){ setSubclassConstraint(currNode, this.value); });
    // Wire up select button in dialog
    d3.select('#dialog [name="select-ctrl"] .swatch')
        .on("click", function() {
            currNode.isSelected ? currNode.unselect() : currNode.select();
            d3.select('#dialog [name="select-ctrl"]')
                .classed("selected", currNode.isSelected);
            update(currNode);
            saveState();
        });
    // Wire up sort function in dialog
    d3.select('#dialog [name="sort-ctrl"] .swatch')
        .on("click", function() {
            let cc = d3.select('#dialog [name="sort-ctrl"]');
            let currSort = cc.classed
            let oldsort = cc.classed("sortasc") ? "asc" : cc.classed("sortdesc") ? "desc" : "none";
            let newsort = oldsort === "asc" ? "desc" : oldsort === "desc" ? "none" : "asc";
            cc.classed("sortasc", newsort === "asc");
            cc.classed("sortdesc", newsort === "desc");
            currNode.setSort(newsort);
            update(currNode);
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
        d3.select("#tooltray")
            .style("background-color", bgc)
            .style("color", txc);
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
        d3.select("#xmltextarea")[0][0].value = "";
        d3.select("#jsontextarea").value = "";
        selectedEditSource( "tlist" );

    }, function(error){
        alert(`Could not access ${currMine.name}. Status=${error.status}. Error=${error.statusText}. (If there is no error message, then its probably a CORS issue.)`);
    });
}

// Begins an edit, based on user controls.
function startEdit() {
    // selector for choosing edit input source, and the current selection
    let srcSelector = d3.selectAll('[name="editTarget"] [name="in"]');
    // the chosen edit source
    let inputId = srcSelector[0][0].value;
    // the query input element corresponding to the selected source
    let src = d3.select(`#${inputId} [name="in"]`);
    // the query starting point
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
             let cc = new Constraint(c);
             cc.node = null;
             t.where.push(cc)
        })
        if (n.join === "outer") {
            t.joins.push(p);
        }
        if (n.sort) {
            let s = {}
            s[p] = n.sort.dir.toUpperCase();
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
    setSort(newdir){
        let olddir = this.sort ? this.sort.dir : "none";
        let oldlev = this.sort ? this.sort.level : -1;
        let maxlev = -1;
        let renumber = function (n){
            if (n.sort) {
                if (oldlev >= 0 && n.sort.level > oldlev)
                    n.sort.level -= 1;
                maxlev = Math.max(maxlev, n.sort.level);
            }
            n.children.forEach(renumber);
        }
        if (!newdir || newdir === "none") {
            // set to not sorted
            this.sort = null;
            if (oldlev >= 0){
                // if we were sorted before, need to renumber any existing sort cfgs.
                renumber(this.template.qtree);
            }
        }
        else {
            // set to sorted
            if (oldlev === -1) {
                // if we were not sorted before, need to find next level.
                renumber(this.template.qtree);
                oldlev = maxlev + 1;
            }
            this.sort = { dir:newdir, level: oldlev };
        }
    }
}

class Template {
    constructor (t) {
        t = t || {}
        this.model = t.model ? Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t.model) : { name: "genomic" };
        this.name = t.name || "";
        this.title = t.title || "";
        this.description = t.description || "";
        this.comment = t.comment || "";
        this.select = t.select ? Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t.select) : [];
        this.where = t.where ? t.where.map( c => c.clone ? c.clone() : new Constraint(c) ) : [];
        this.constraintLogic = t.constraintLogic || "";
        this.joins = t.joins ? Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t.joins) : [];
        this.tags = t.tags ? Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t.tags) : [];
        this.orderBy = t.orderBy ? Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(t.orderBy) : [];
    }

    // TODO: Keep moving functions into methods
    // FIXME: Not all templates are Temaplates !! (some are still plain objects created elsewise)
};

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
    constructor (c) {
        c = c || {}
        // save the  node
        this.node = c.node || null;
        // all constraints have this
        this.path = c.path || c.node && c.node.path || "";
        // used by all except subclass constraints (we set it to "ISA")
        this.op = c.op || null;
        // one of: null, value, multivalue, subclass, lookup, list
        this.ctype = c.ctype || null;
        // used by all except subclass constraints
        this.code = c.code || null;
        // used by value, list
        this.value = c.value || "";
        // used by LOOKUP on BioEntity and subclasses
        this.extraValue = c.extraValue || null;
        // used by multivalue and range constraints
        this.values = c.values && Object(__WEBPACK_IMPORTED_MODULE_2__utils_js__["deepc"])(c.values) || null;
        // used by subclass contraints
        this.type = c.type || null;
        // used for constraints in a template
        this.editable = c.editable || null;
    }
    // Returns an unregistered clone. (means: no node pointer)
    clone () {
        let c = new Constraint(this);
        c.node = null;
        return c;
    }
    //
    setOp (o, quietly) {
        let op = __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPINDEX"][o];
        if (!op) throw "Unknown operator: " + o;
        this.op = op.op;
        this.ctype = op.ctype;
        let t = this.node && this.node.template;
        if (this.ctype === "subclass") {
            if (this.code && !quietly && t) 
                delete t.code2c[this.code];
            this.code = null;
        }
        else {
            if (!this.code) 
                this.code = t && nextAvailableCode(t) || null;
        }
        !quietly && t && setLogicExpression(t.constraintLogic, t);
    }
    // formats this constraint as xml
    c2xml (){
        let g = '';
        let h = '';
        if (this.ctype === "value" || this.ctype === "list")
            g = `path="${this.path}" op="${esc(this.op)}" value="${esc(this.value)}" code="${this.code}" editable="${this.editable}"`;
        else if (this.ctype === "lookup"){
            let ev = (this.extraValue && this.extraValue !== "Any") ? `extraValue="${this.extraValue}"` : "";
            g = `path="${this.path}" op="${esc(this.op)}" value="${esc(this.value)}" ${ev} code="${this.code}" editable="${this.editable}"`;
        }
        else if (this.ctype === "multivalue"){
            g = `path="${this.path}" op="${this.op}" code="${this.code}" editable="${this.editable}"`;
            h = this.values.map( v => `<value>${esc(v)}</value>` ).join('');
        }
        else if (this.ctype === "subclass")
            g = `path="${this.path}" type="${this.type}" editable="false"`;
        else if (this.ctype === "null")
            g = `path="${this.path}" op="${this.op}" code="${this.code}" editable="${this.editable}"`;
        if(h)
            return `<constraint ${g}>${h}</constraint>\n`;
        else
            return `<constraint ${g} />\n`;
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
    currTemplate = new Template(t);
    //
    root = compileTemplate(currTemplate, currMine.model).qtree
    root.x0 = 0;
    root.y0 = h / 2;
    //
    setLogicExpression();

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
    d3.select('#svgContainer [name="logicExpression"] input')
        .call(function(){ this[0][0].value = currTemplate.constraintLogic })
        .on("change", function(){
            setLogicExpression(this.value, currTemplate);
            xfer("constraintLogic", this)
        });

    //
    hideDialog();
    update(root);
}

// Sets the constraint logic expression for the given template.
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
    tmplt = tmplt ? tmplt : currTemplate;
    ex = ex ? ex : (tmplt.constraintLogic || "")
    var ast; // abstract syntax tree
    var seen = [];
    function reach(n,lev){
        if (typeof(n) === "string" ){
            // check that n is a constraint code in the template. 
            // If not, remove it from the expr.
            // Also remove it if it's the code for a subclass constraint
            seen.push(n);
            return (n in tmplt.code2c && tmplt.code2c[n].ctype !== "subclass") ? n : "";
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

    d3.select('#svgContainer [name="logicExpression"] input')
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
    if (c) {
        // just to be sure
        c.node = n;
    }
    else {
        let op = __WEBPACK_IMPORTED_MODULE_1__ops_js__["OPINDEX"][n.pcomp.kind === "attribute" ? "=" : "LOOKUP"];
        c = new Constraint({node:n, op:op.op, ctype: op.ctype});
    }
    n.constraints.push(c);
    n.template.where.push(c);
    if (c.ctype !== "subclass") {
        c.code = nextAvailableCode(n.template);
        n.template.code2c[c.code] = c;
        setLogicExpression(n.template.constraintLogic, n.template);
    }
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
    c.setOp(o);
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
  cdivs.append("i").attr("class", "material-icons edit").text("mode_edit").attr("title","Edit this constraint");
  // 6. button to remove this constraint
  cdivs.append("i").attr("class", "material-icons cancel").text("delete_forever").attr("title","Remove this constraint");

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
      dialog.select('[name="select-ctrl"]')
          .classed("selected", function(n){ return n.isSelected });
      // 
      dialog.select('[name="sort-ctrl"]')
          .classed("sortasc", n => n.sort && n.sort.dir.toLowerCase() === "asc")
          .classed("sortdesc", n => n.sort && n.sort.dir.toLowerCase() === "desc")
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
    d3.select("#svgContainer").attr("class", v.name);
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
      // Rearrange y-positions of leaf nodes. 
      let pos = leaves.map(function(n){ return { y: n.y, y0: n.y0 }; });

      leaves.sort(editView.nodeComp);

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
  d3.select("#svgContainer").attr("class", editView.name);
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
      .attr("x", function(d) { return d.children ? -10 : 10; })
      .attr("dy", ".35em")
      .style("fill-opacity", 1e-6) // start off nearly transparent
      .attr("class","nodeName")
      ;

  // Placeholder for icon/text to appear inside node
  nodeEnter.append("svg:text")
      .attr('class', 'nodeIcon')
      .attr('dy', 5)
      ;

  // Add node handle
  nodeEnter.append("svg:text")
      .attr('class', 'handle')
      .attr('dx', 10)
      .attr('dy', 5)
      ;

  let nodeUpdate = nodeGrps
      .classed("selected", n => n.isSelected)
      .classed("constrained", n => n.constraints.length > 0)
      .classed("sorted", n => n.sort && n.sort.level >= 0)
      .classed("sortedasc", n => n.sort && n.sort.dir.toLowerCase() === "asc")
      .classed("sorteddesc", n => n.sort && n.sort.dir.toLowerCase() === "desc")
    // Transition nodes to their new position.
    .transition()
      .duration(animationDuration)
      .attr("transform", function(n) { return "translate(" + n.x + "," + n.y + ")"; })
      ;

  nodeUpdate.select("text.handle")
      .attr('font-family', editView.handleIcon.fontFamily || null)
      .text(editView.handleIcon.text || "") ;
  nodeUpdate.select("text.nodeIcon")
      .attr('font-family', editView.nodeIcon.fontFamily || null)
      .text(editView.nodeIcon.text || "") ;

  nodeUpdate.selectAll("text.nodeName")
      .text(n => n.name);

  // --------------------------------------------------
  // Make selected nodes draggable.
  // Clear out all exiting drag handlers
  d3.selectAll("g.nodegroup")
      .classed("draggable", false)
      .select(".handle")
          .on(".drag", null); 
  // Now make everything draggable that should be
  if (editView.draggable)
      d3.selectAll(editView.draggable)
          .classed("draggable", true)
          .call(dragBehavior);
  // --------------------------------------------------

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
              saveState();
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
//
// Function to escape '<' '"' and '&' characters
function esc(s){
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); 
}

// Turns a json representation of a template into XML, suitable for importing into the Intermine QB.
function json2xml(t, qonly){
    var so = (t.orderBy || []).reduce(function(s,x){ 
        var k = Object.keys(x)[0];
        var v = x[k]
        return s + `${k} ${v} `;
    }, "");

    // Converts an outer join path to xml.
    function oj2xml(oj){
        return `<join path="${oj}" style="OUTER" />`;
    }

    // the query part
    var qpart = 
`<query
  name="${t.name || ''}"
  model="${(t.model && t.model.name) || ''}"
  view="${t.select.join(' ')}"
  longDescription="${esc(t.description || '')}"
  sortOrder="${so || ''}"
  ${t.constraintLogic && 'constraintLogic="'+t.constraintLogic+'"' || ''}
>
  ${(t.joins || []).map(oj2xml).join(" ")}
  ${(t.where || []).map(c => c.c2xml()).join(" ")}
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
/***/ (function(module, exports) {

let s = `
3d_rotation e84d
ac_unit eb3b
access_alarm e190
access_alarms e191
access_time e192
accessibility e84e
accessible e914
account_balance e84f
account_balance_wallet e850
account_box e851
account_circle e853
adb e60e
add e145
add_a_photo e439
add_alarm e193
add_alert e003
add_box e146
add_circle e147
add_circle_outline e148
add_location e567
add_shopping_cart e854
add_to_photos e39d
add_to_queue e05c
adjust e39e
airline_seat_flat e630
airline_seat_flat_angled e631
airline_seat_individual_suite e632
airline_seat_legroom_extra e633
airline_seat_legroom_normal e634
airline_seat_legroom_reduced e635
airline_seat_recline_extra e636
airline_seat_recline_normal e637
airplanemode_active e195
airplanemode_inactive e194
airplay e055
airport_shuttle eb3c
alarm e855
alarm_add e856
alarm_off e857
alarm_on e858
album e019
all_inclusive eb3d
all_out e90b
android e859
announcement e85a
apps e5c3
archive e149
arrow_back e5c4
arrow_downward e5db
arrow_drop_down e5c5
arrow_drop_down_circle e5c6
arrow_drop_up e5c7
arrow_forward e5c8
arrow_upward e5d8
art_track e060
aspect_ratio e85b
assessment e85c
assignment e85d
assignment_ind e85e
assignment_late e85f
assignment_return e860
assignment_returned e861
assignment_turned_in e862
assistant e39f
assistant_photo e3a0
attach_file e226
attach_money e227
attachment e2bc
audiotrack e3a1
autorenew e863
av_timer e01b
backspace e14a
backup e864
battery_alert e19c
battery_charging_full e1a3
battery_full e1a4
battery_std e1a5
battery_unknown e1a6
beach_access eb3e
beenhere e52d
block e14b
bluetooth e1a7
bluetooth_audio e60f
bluetooth_connected e1a8
bluetooth_disabled e1a9
bluetooth_searching e1aa
blur_circular e3a2
blur_linear e3a3
blur_off e3a4
blur_on e3a5
book e865
bookmark e866
bookmark_border e867
border_all e228
border_bottom e229
border_clear e22a
border_color e22b
border_horizontal e22c
border_inner e22d
border_left e22e
border_outer e22f
border_right e230
border_style e231
border_top e232
border_vertical e233
branding_watermark e06b
brightness_1 e3a6
brightness_2 e3a7
brightness_3 e3a8
brightness_4 e3a9
brightness_5 e3aa
brightness_6 e3ab
brightness_7 e3ac
brightness_auto e1ab
brightness_high e1ac
brightness_low e1ad
brightness_medium e1ae
broken_image e3ad
brush e3ae
bubble_chart e6dd
bug_report e868
build e869
burst_mode e43c
business e0af
business_center eb3f
cached e86a
cake e7e9
call e0b0
call_end e0b1
call_made e0b2
call_merge e0b3
call_missed e0b4
call_missed_outgoing e0e4
call_received e0b5
call_split e0b6
call_to_action e06c
camera e3af
camera_alt e3b0
camera_enhance e8fc
camera_front e3b1
camera_rear e3b2
camera_roll e3b3
cancel e5c9
card_giftcard e8f6
card_membership e8f7
card_travel e8f8
casino eb40
cast e307
cast_connected e308
center_focus_strong e3b4
center_focus_weak e3b5
change_history e86b
chat e0b7
chat_bubble e0ca
chat_bubble_outline e0cb
check e5ca
check_box e834
check_box_outline_blank e835
check_circle e86c
chevron_left e5cb
chevron_right e5cc
child_care eb41
child_friendly eb42
chrome_reader_mode e86d
class e86e
clear e14c
clear_all e0b8
close e5cd
closed_caption e01c
cloud e2bd
cloud_circle e2be
cloud_done e2bf
cloud_download e2c0
cloud_off e2c1
cloud_queue e2c2
cloud_upload e2c3
code e86f
collections e3b6
collections_bookmark e431
color_lens e3b7
colorize e3b8
comment e0b9
compare e3b9
compare_arrows e915
computer e30a
confirmation_number e638
contact_mail e0d0
contact_phone e0cf
contacts e0ba
content_copy e14d
content_cut e14e
content_paste e14f
control_point e3ba
control_point_duplicate e3bb
copyright e90c
create e150
create_new_folder e2cc
credit_card e870
crop e3be
crop_16_9 e3bc
crop_3_2 e3bd
crop_5_4 e3bf
crop_7_5 e3c0
crop_din e3c1
crop_free e3c2
crop_landscape e3c3
crop_original e3c4
crop_portrait e3c5
crop_rotate e437
crop_square e3c6
dashboard e871
data_usage e1af
date_range e916
dehaze e3c7
delete e872
delete_forever e92b
delete_sweep e16c
description e873
desktop_mac e30b
desktop_windows e30c
details e3c8
developer_board e30d
developer_mode e1b0
device_hub e335
devices e1b1
devices_other e337
dialer_sip e0bb
dialpad e0bc
directions e52e
directions_bike e52f
directions_boat e532
directions_bus e530
directions_car e531
directions_railway e534
directions_run e566
directions_subway e533
directions_transit e535
directions_walk e536
disc_full e610
dns e875
do_not_disturb e612
do_not_disturb_alt e611
do_not_disturb_off e643
do_not_disturb_on e644
dock e30e
domain e7ee
done e876
done_all e877
donut_large e917
donut_small e918
drafts e151
drag_handle e25d
drive_eta e613
dvr e1b2
edit e3c9
edit_location e568
eject e8fb
email e0be
enhanced_encryption e63f
equalizer e01d
error e000
error_outline e001
euro_symbol e926
ev_station e56d
event e878
event_available e614
event_busy e615
event_note e616
event_seat e903
exit_to_app e879
expand_less e5ce
expand_more e5cf
explicit e01e
explore e87a
exposure e3ca
exposure_neg_1 e3cb
exposure_neg_2 e3cc
exposure_plus_1 e3cd
exposure_plus_2 e3ce
exposure_zero e3cf
extension e87b
face e87c
fast_forward e01f
fast_rewind e020
favorite e87d
favorite_border e87e
featured_play_list e06d
featured_video e06e
feedback e87f
fiber_dvr e05d
fiber_manual_record e061
fiber_new e05e
fiber_pin e06a
fiber_smart_record e062
file_download e2c4
file_upload e2c6
filter e3d3
filter_1 e3d0
filter_2 e3d1
filter_3 e3d2
filter_4 e3d4
filter_5 e3d5
filter_6 e3d6
filter_7 e3d7
filter_8 e3d8
filter_9 e3d9
filter_9_plus e3da
filter_b_and_w e3db
filter_center_focus e3dc
filter_drama e3dd
filter_frames e3de
filter_hdr e3df
filter_list e152
filter_none e3e0
filter_tilt_shift e3e2
filter_vintage e3e3
find_in_page e880
find_replace e881
fingerprint e90d
first_page e5dc
fitness_center eb43
flag e153
flare e3e4
flash_auto e3e5
flash_off e3e6
flash_on e3e7
flight e539
flight_land e904
flight_takeoff e905
flip e3e8
flip_to_back e882
flip_to_front e883
folder e2c7
folder_open e2c8
folder_shared e2c9
folder_special e617
font_download e167
format_align_center e234
format_align_justify e235
format_align_left e236
format_align_right e237
format_bold e238
format_clear e239
format_color_fill e23a
format_color_reset e23b
format_color_text e23c
format_indent_decrease e23d
format_indent_increase e23e
format_italic e23f
format_line_spacing e240
format_list_bulleted e241
format_list_numbered e242
format_paint e243
format_quote e244
format_shapes e25e
format_size e245
format_strikethrough e246
format_textdirection_l_to_r e247
format_textdirection_r_to_l e248
format_underlined e249
forum e0bf
forward e154
forward_10 e056
forward_30 e057
forward_5 e058
free_breakfast eb44
fullscreen e5d0
fullscreen_exit e5d1
functions e24a
g_translate e927
gamepad e30f
games e021
gavel e90e
gesture e155
get_app e884
gif e908
golf_course eb45
gps_fixed e1b3
gps_not_fixed e1b4
gps_off e1b5
grade e885
gradient e3e9
grain e3ea
graphic_eq e1b8
grid_off e3eb
grid_on e3ec
group e7ef
group_add e7f0
group_work e886
hd e052
hdr_off e3ed
hdr_on e3ee
hdr_strong e3f1
hdr_weak e3f2
headset e310
headset_mic e311
healing e3f3
hearing e023
help e887
help_outline e8fd
high_quality e024
highlight e25f
highlight_off e888
history e889
home e88a
hot_tub eb46
hotel e53a
hourglass_empty e88b
hourglass_full e88c
http e902
https e88d
image e3f4
image_aspect_ratio e3f5
import_contacts e0e0
import_export e0c3
important_devices e912
inbox e156
indeterminate_check_box e909
info e88e
info_outline e88f
input e890
insert_chart e24b
insert_comment e24c
insert_drive_file e24d
insert_emoticon e24e
insert_invitation e24f
insert_link e250
insert_photo e251
invert_colors e891
invert_colors_off e0c4
iso e3f6
keyboard e312
keyboard_arrow_down e313
keyboard_arrow_left e314
keyboard_arrow_right e315
keyboard_arrow_up e316
keyboard_backspace e317
keyboard_capslock e318
keyboard_hide e31a
keyboard_return e31b
keyboard_tab e31c
keyboard_voice e31d
kitchen eb47
label e892
label_outline e893
landscape e3f7
language e894
laptop e31e
laptop_chromebook e31f
laptop_mac e320
laptop_windows e321
last_page e5dd
launch e895
layers e53b
layers_clear e53c
leak_add e3f8
leak_remove e3f9
lens e3fa
library_add e02e
library_books e02f
library_music e030
lightbulb_outline e90f
line_style e919
line_weight e91a
linear_scale e260
link e157
linked_camera e438
list e896
live_help e0c6
live_tv e639
local_activity e53f
local_airport e53d
local_atm e53e
local_bar e540
local_cafe e541
local_car_wash e542
local_convenience_store e543
local_dining e556
local_drink e544
local_florist e545
local_gas_station e546
local_grocery_store e547
local_hospital e548
local_hotel e549
local_laundry_service e54a
local_library e54b
local_mall e54c
local_movies e54d
local_offer e54e
local_parking e54f
local_pharmacy e550
local_phone e551
local_pizza e552
local_play e553
local_post_office e554
local_printshop e555
local_see e557
local_shipping e558
local_taxi e559
location_city e7f1
location_disabled e1b6
location_off e0c7
location_on e0c8
location_searching e1b7
lock e897
lock_open e898
lock_outline e899
looks e3fc
looks_3 e3fb
looks_4 e3fd
looks_5 e3fe
looks_6 e3ff
looks_one e400
looks_two e401
loop e028
loupe e402
low_priority e16d
loyalty e89a
mail e158
mail_outline e0e1
map e55b
markunread e159
markunread_mailbox e89b
memory e322
menu e5d2
merge_type e252
message e0c9
mic e029
mic_none e02a
mic_off e02b
mms e618
mode_comment e253
mode_edit e254
monetization_on e263
money_off e25c
monochrome_photos e403
mood e7f2
mood_bad e7f3
more e619
more_horiz e5d3
more_vert e5d4
motorcycle e91b
mouse e323
move_to_inbox e168
movie e02c
movie_creation e404
movie_filter e43a
multiline_chart e6df
music_note e405
music_video e063
my_location e55c
nature e406
nature_people e407
navigate_before e408
navigate_next e409
navigation e55d
near_me e569
network_cell e1b9
network_check e640
network_locked e61a
network_wifi e1ba
new_releases e031
next_week e16a
nfc e1bb
no_encryption e641
no_sim e0cc
not_interested e033
note e06f
note_add e89c
notifications e7f4
notifications_active e7f7
notifications_none e7f5
notifications_off e7f6
notifications_paused e7f8
offline_pin e90a
ondemand_video e63a
opacity e91c
open_in_browser e89d
open_in_new e89e
open_with e89f
pages e7f9
pageview e8a0
palette e40a
pan_tool e925
panorama e40b
panorama_fish_eye e40c
panorama_horizontal e40d
panorama_vertical e40e
panorama_wide_angle e40f
party_mode e7fa
pause e034
pause_circle_filled e035
pause_circle_outline e036
payment e8a1
people e7fb
people_outline e7fc
perm_camera_mic e8a2
perm_contact_calendar e8a3
perm_data_setting e8a4
perm_device_information e8a5
perm_identity e8a6
perm_media e8a7
perm_phone_msg e8a8
perm_scan_wifi e8a9
person e7fd
person_add e7fe
person_outline e7ff
person_pin e55a
person_pin_circle e56a
personal_video e63b
pets e91d
phone e0cd
phone_android e324
phone_bluetooth_speaker e61b
phone_forwarded e61c
phone_in_talk e61d
phone_iphone e325
phone_locked e61e
phone_missed e61f
phone_paused e620
phonelink e326
phonelink_erase e0db
phonelink_lock e0dc
phonelink_off e327
phonelink_ring e0dd
phonelink_setup e0de
photo e410
photo_album e411
photo_camera e412
photo_filter e43b
photo_library e413
photo_size_select_actual e432
photo_size_select_large e433
photo_size_select_small e434
picture_as_pdf e415
picture_in_picture e8aa
picture_in_picture_alt e911
pie_chart e6c4
pie_chart_outlined e6c5
pin_drop e55e
place e55f
play_arrow e037
play_circle_filled e038
play_circle_outline e039
play_for_work e906
playlist_add e03b
playlist_add_check e065
playlist_play e05f
plus_one e800
poll e801
polymer e8ab
pool eb48
portable_wifi_off e0ce
portrait e416
power e63c
power_input e336
power_settings_new e8ac
pregnant_woman e91e
present_to_all e0df
print e8ad
priority_high e645
public e80b
publish e255
query_builder e8ae
question_answer e8af
queue e03c
queue_music e03d
queue_play_next e066
radio e03e
radio_button_checked e837
radio_button_unchecked e836
rate_review e560
receipt e8b0
recent_actors e03f
record_voice_over e91f
redeem e8b1
redo e15a
refresh e5d5
remove e15b
remove_circle e15c
remove_circle_outline e15d
remove_from_queue e067
remove_red_eye e417
remove_shopping_cart e928
reorder e8fe
repeat e040
repeat_one e041
replay e042
replay_10 e059
replay_30 e05a
replay_5 e05b
reply e15e
reply_all e15f
report e160
report_problem e8b2
restaurant e56c
restaurant_menu e561
restore e8b3
restore_page e929
ring_volume e0d1
room e8b4
room_service eb49
rotate_90_degrees_ccw e418
rotate_left e419
rotate_right e41a
rounded_corner e920
router e328
rowing e921
rss_feed e0e5
rv_hookup e642
satellite e562
save e161
scanner e329
schedule e8b5
school e80c
screen_lock_landscape e1be
screen_lock_portrait e1bf
screen_lock_rotation e1c0
screen_rotation e1c1
screen_share e0e2
sd_card e623
sd_storage e1c2
search e8b6
security e32a
select_all e162
send e163
sentiment_dissatisfied e811
sentiment_neutral e812
sentiment_satisfied e813
sentiment_very_dissatisfied e814
sentiment_very_satisfied e815
settings e8b8
settings_applications e8b9
settings_backup_restore e8ba
settings_bluetooth e8bb
settings_brightness e8bd
settings_cell e8bc
settings_ethernet e8be
settings_input_antenna e8bf
settings_input_component e8c0
settings_input_composite e8c1
settings_input_hdmi e8c2
settings_input_svideo e8c3
settings_overscan e8c4
settings_phone e8c5
settings_power e8c6
settings_remote e8c7
settings_system_daydream e1c3
settings_voice e8c8
share e80d
shop e8c9
shop_two e8ca
shopping_basket e8cb
shopping_cart e8cc
short_text e261
show_chart e6e1
shuffle e043
signal_cellular_4_bar e1c8
signal_cellular_connected_no_internet_4_bar e1cd
signal_cellular_no_sim e1ce
signal_cellular_null e1cf
signal_cellular_off e1d0
signal_wifi_4_bar e1d8
signal_wifi_4_bar_lock e1d9
signal_wifi_off e1da
sim_card e32b
sim_card_alert e624
skip_next e044
skip_previous e045
slideshow e41b
slow_motion_video e068
smartphone e32c
smoke_free eb4a
smoking_rooms eb4b
sms e625
sms_failed e626
snooze e046
sort e164
sort_by_alpha e053
spa eb4c
space_bar e256
speaker e32d
speaker_group e32e
speaker_notes e8cd
speaker_notes_off e92a
speaker_phone e0d2
spellcheck e8ce
star e838
star_border e83a
star_half e839
stars e8d0
stay_current_landscape e0d3
stay_current_portrait e0d4
stay_primary_landscape e0d5
stay_primary_portrait e0d6
stop e047
stop_screen_share e0e3
storage e1db
store e8d1
store_mall_directory e563
straighten e41c
streetview e56e
strikethrough_s e257
style e41d
subdirectory_arrow_left e5d9
subdirectory_arrow_right e5da
subject e8d2
subscriptions e064
subtitles e048
subway e56f
supervisor_account e8d3
surround_sound e049
swap_calls e0d7
swap_horiz e8d4
swap_vert e8d5
swap_vertical_circle e8d6
switch_camera e41e
switch_video e41f
sync e627
sync_disabled e628
sync_problem e629
system_update e62a
system_update_alt e8d7
tab e8d8
tab_unselected e8d9
tablet e32f
tablet_android e330
tablet_mac e331
tag_faces e420
tap_and_play e62b
terrain e564
text_fields e262
text_format e165
textsms e0d8
texture e421
theaters e8da
thumb_down e8db
thumb_up e8dc
thumbs_up_down e8dd
time_to_leave e62c
timelapse e422
timeline e922
timer e425
timer_10 e423
timer_3 e424
timer_off e426
title e264
toc e8de
today e8df
toll e8e0
tonality e427
touch_app e913
toys e332
track_changes e8e1
traffic e565
train e570
tram e571
transfer_within_a_station e572
transform e428
translate e8e2
trending_down e8e3
trending_flat e8e4
trending_up e8e5
tune e429
turned_in e8e6
turned_in_not e8e7
tv e333
unarchive e169
undo e166
unfold_less e5d6
unfold_more e5d7
update e923
usb e1e0
verified_user e8e8
vertical_align_bottom e258
vertical_align_center e259
vertical_align_top e25a
vibration e62d
video_call e070
video_label e071
video_library e04a
videocam e04b
videocam_off e04c
videogame_asset e338
view_agenda e8e9
view_array e8ea
view_carousel e8eb
view_column e8ec
view_comfy e42a
view_compact e42b
view_day e8ed
view_headline e8ee
view_list e8ef
view_module e8f0
view_quilt e8f1
view_stream e8f2
view_week e8f3
vignette e435
visibility e8f4
visibility_off e8f5
voice_chat e62e
voicemail e0d9
volume_down e04d
volume_mute e04e
volume_off e04f
volume_up e050
vpn_key e0da
vpn_lock e62f
wallpaper e1bc
warning e002
watch e334
watch_later e924
wb_auto e42c
wb_cloudy e42d
wb_incandescent e42e
wb_iridescent e436
wb_sunny e430
wc e63d
web e051
web_asset e069
weekend e16b
whatshot e80e
widgets e1bd
wifi e63e
wifi_lock e1e1
wifi_tethering e1e2
work e8f9
wrap_text e25b
youtube_searched_for e8fa
zoom_in e8ff
zoom_out e900
zoom_out_map e56b
`;

let codepoints = s.trim().split("\n").reduce(function(cv, nv){
    let parts = nv.split(/ +/);
    let uc = '\\u' + parts[1];
    cv[parts[0]] = eval('"' + uc + '"');
    return cv;
}, {});

module.exports = {
    codepoints
}




/***/ }),
/* 5 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGQxODlhN2NlODE0MGYwYjNmMDkiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDNkM7QUFVOUQ7QUFDa0I7QUFDbkI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIscUJBQXFCLFVBQVUsZ0NBQWdDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0Esa0NBQWtDLGFBQWE7QUFDL0M7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCLFNBQVMsZ0NBQWdDLEVBQUU7QUFDeEUsNkJBQTZCLFNBQVMsZ0NBQWdDLEVBQUU7QUFDeEUsaUNBQWlDLG1CQUFtQixFQUFFOztBQUV0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFD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QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUJBQXlCLHdCQUF3QixFQUFFOztBQUVuRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsaUJBQWlCLEVBQUU7QUFDcEY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVMLGtCQUFrQjs7Ozs7Ozs7QUM1TmxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUw7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDaDdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6InFiLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGRkMTg5YTdjZTgxNDBmMGIzZjA5IiwiXG4vKlxuICogRGF0YSBzdHJ1Y3R1cmVzOlxuICogICAwLiBUaGUgZGF0YSBtb2RlbCBmb3IgYSBtaW5lIGlzIGEgZ3JhcGggb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgXG4gKiAgIGNsYXNzZXMsIHRoZWlyIGNvbXBvbmVudHMgKGF0dHJpYnV0ZXMsIHJlZmVyZW5jZXMsIGNvbGxlY3Rpb25zKSwgYW5kIHJlbGF0aW9uc2hpcHMuXG4gKiAgIDEuIFRoZSBxdWVyeSBpcyByZXByZXNlbnRlZCBieSBhIGQzLXN0eWxlIGhpZXJhcmNoeSBzdHJ1Y3R1cmU6IGEgbGlzdCBvZlxuICogICBub2Rlcywgd2hlcmUgZWFjaCBub2RlIGhhcyBhIG5hbWUgKHN0cmluZyksIGFuZCBhIGNoaWxkcmVuIGxpc3QgKHBvc3NpYmx5IGVtcHR5IFxuICogICBsaXN0IG9mIG5vZGVzKS4gVGhlIG5vZGVzIGFuZCB0aGUgcGFyZW50L2NoaWxkIHJlbGF0aW9uc2hpcHMgb2YgdGhpcyBzdHJ1Y3R1cmUgXG4gKiAgIGFyZSB3aGF0IGRyaXZlIHRoZSBkaXNsYXkuXG4gKiAgIDIuIEVhY2ggbm9kZSBpbiB0aGUgZGlhZ3JhbSBjb3JyZXNwb25kcyB0byBhIGNvbXBvbmVudCBpbiBhIHBhdGgsIHdoZXJlIGVhY2hcbiAqICAgcGF0aCBzdGFydHMgd2l0aCB0aGUgcm9vdCBjbGFzcywgb3B0aW9uYWxseSBwcm9jZWVkcyB0aHJvdWdoIHJlZmVyZW5jZXMgYW5kIGNvbGxlY3Rpb25zLFxuICogICBhbmQgb3B0aW9uYWxseSBlbmRzIGF0IGFuIGF0dHJpYnV0ZS5cbiAqXG4gKi9cbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuLy9pbXBvcnQgeyBtaW5lcyB9IGZyb20gJy4vbWluZXMuanMnO1xuaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7XG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5XG59IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHtjb2RlcG9pbnRzfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5pbXBvcnQgVW5kb01hbmFnZXIgZnJvbSAnLi91bmRvTWFuYWdlci5qcyc7XG5cbmxldCBjdXJyTWluZTtcbmxldCBjdXJyVGVtcGxhdGU7XG5sZXQgY3Vyck5vZGU7XG5cbmxldCBuYW1lMm1pbmU7XG5sZXQgbTtcbmxldCB3O1xubGV0IGg7XG5sZXQgaTtcbmxldCByb290O1xubGV0IGRpYWdvbmFsO1xubGV0IHZpcztcbmxldCBub2RlcztcbmxldCBsaW5rcztcbmxldCBkcmFnQmVoYXZpb3IgPSBudWxsO1xubGV0IGFuaW1hdGlvbkR1cmF0aW9uID0gMjUwOyAvLyBtc1xubGV0IGRlZmF1bHRDb2xvcnMgPSB7IGhlYWRlcjogeyBtYWluOiBcIiM1OTU0NTVcIiwgdGV4dDogXCIjZmZmXCIgfSB9O1xubGV0IGRlZmF1bHRMb2dvID0gXCJodHRwczovL2Nkbi5yYXdnaXQuY29tL2ludGVybWluZS9kZXNpZ24tbWF0ZXJpYWxzLzc4YTEzZGI1L2xvZ29zL2ludGVybWluZS9zcXVhcmVpc2gvNDV4NDUucG5nXCI7XG5sZXQgdW5kb01nciA9IG5ldyBVbmRvTWFuYWdlcigpO1xubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5sZXQgZWRpdFZpZXdzID0ge1xuICAgIHF1ZXJ5TWFpbjoge1xuICAgICAgICBuYW1lOiBcInF1ZXJ5TWFpblwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCIsXG4gICAgICAgIG5vZGVDb21wOiBudWxsLFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbHVtbk9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwiY29sdW1uT3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc2VsZWN0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29sdW1uIG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNlbGVjdGlvbi1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gYS52aWV3IC0gYi52aWV3IDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGRyYWcgaW4gY29sdW1uT3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBjb2x1bW4gb3JkZXIgKGR1aCEpXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHsgbi52aWV3ID0gaSB9KTtcbiAgICAgICAgICBkcmFnZ2VkLnRlbXBsYXRlLnNlbGVjdCA9IG5vZGVzLm1hcCggbj0+IG4ucGF0aCApO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogbnVsbCxcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gbi52aWV3IDogXCJcIlxuICAgICAgICB9XG4gICAgfSxcbiAgICBzb3J0T3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJzb3J0T3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc29ydGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIHNvcnQgb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNvcnQtbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLnNvcnQpXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyBhLnNvcnQubGV2ZWwgLSBiLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIC8vIGRyYWcgaW4gc29ydE9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgc29ydCBvcmRlciAoZHVoISlcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHtcbiAgICAgICAgICAgICAgbi5zb3J0LmxldmVsID0gaVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uc29ydCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb25zdHJhaW50TG9naWM6IHtcbiAgICAgICAgbmFtZTogXCJjb25zdHJhaW50TG9naWNcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb25zdHJhaW50IGxvZ2ljIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gY29uc3RyYWluZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIGNvZGUgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBsZXQgYWNvbnN0ID0gYS5jb25zdHJhaW50cyAmJiBhLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGFjb2RlID0gYWNvbnN0ID8gYS5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBsZXQgYmNvbnN0ID0gYi5jb25zdHJhaW50cyAmJiBiLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGJjb2RlID0gYmNvbnN0ID8gYi5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBpZiAoYWNvbnN0KVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gKGFjb2RlIDwgYmNvZGUgPyAtMSA6IGFjb2RlID4gYmNvZGUgPyAxIDogMCkgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAxIDogbmFtZUNvbXAoYSwgYik7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbXBhcmF0b3IgZnVuY3Rpb24sIGZvciBzb3J0aW5nIGEgbGlzdCBvZiBub2RlcyBieSBuYW1lLiBDYXNlLWluc2Vuc2l0aXZlLlxuLy9cbmxldCBuYW1lQ29tcCA9IGZ1bmN0aW9uKGEsYikge1xuICAgIGxldCBuYSA9IGEubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBuYiA9IGIubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBuYSA8IG5iID8gLTEgOiBuYSA+IG5iID8gMSA6IDA7XG59O1xuXG4vLyBTdGFydGluZyBlZGl0IHZpZXcgaXMgdGhlIG1haW4gcXVlcnkgdmlldy5cbmxldCBlZGl0VmlldyA9IGVkaXRWaWV3cy5xdWVyeU1haW47XG5cbi8vIFNldHVwIGZ1bmN0aW9uXG5mdW5jdGlvbiBzZXR1cCgpe1xuICAgIG0gPSBbNDAsIDEyMCwgMjAsIDEyMF1cbiAgICB3ID0gMTI4MCAtIG1bMV0gLSBtWzNdXG4gICAgaCA9IDgwMCAtIG1bMF0gLSBtWzJdXG4gICAgaSA9IDBcblxuICAgIC8vIHRoYW5rcyB0bzogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUwMDc4NzcvaG93LXRvLXVzZS10aGUtZDMtZGlhZ29uYWwtZnVuY3Rpb24tdG8tZHJhdy1jdXJ2ZWQtbGluZXNcbiAgICBkaWFnb25hbCA9IGQzLnN2Zy5kaWFnb25hbCgpXG4gICAgICAgIC5zb3VyY2UoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQuc291cmNlLnksIFwieVwiOmQuc291cmNlLnh9OyB9KSAgICAgXG4gICAgICAgIC50YXJnZXQoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQudGFyZ2V0LnksIFwieVwiOmQudGFyZ2V0Lnh9OyB9KVxuICAgICAgICAucHJvamVjdGlvbihmdW5jdGlvbihkKSB7IHJldHVybiBbZC55LCBkLnhdOyB9KTtcbiAgICBcbiAgICAvLyBjcmVhdGUgdGhlIFNWRyBjb250YWluZXJcbiAgICB2aXMgPSBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyIHN2Z1wiKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIHcgKyBtWzFdICsgbVszXSlcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaCArIG1bMF0gKyBtWzJdKVxuICAgICAgICAub24oXCJjbGlja1wiLCBoaWRlRGlhbG9nKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbVszXSArIFwiLFwiICsgbVswXSArIFwiKVwiKTtcbiAgICAvL1xuICAgIGQzLnNlbGVjdCgnLmJ1dHRvbltuYW1lPVwib3BlbmNsb3NlXCJdJylcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgXG4gICAgICAgICAgICBsZXQgdCA9IGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKTtcbiAgICAgICAgICAgIGxldCB3YXNDbG9zZWQgPSB0LmNsYXNzZWQoXCJjbG9zZWRcIik7XG4gICAgICAgICAgICBsZXQgaXNDbG9zZWQgPSAhd2FzQ2xvc2VkO1xuICAgICAgICAgICAgbGV0IGQgPSBkMy5zZWxlY3QoJyNkcmF3ZXInKVswXVswXVxuICAgICAgICAgICAgaWYgKGlzQ2xvc2VkKVxuICAgICAgICAgICAgICAgIC8vIHNhdmUgdGhlIGN1cnJlbnQgaGVpZ2h0IGp1c3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgICAgICAgICAgICBkLl9fc2F2ZWRfaGVpZ2h0ID0gZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICBlbHNlIGlmIChkLl9fc2F2ZWRfaGVpZ2h0KVxuICAgICAgICAgICAgICAgLy8gb24gb3BlbiwgcmVzdG9yZSB0aGUgc2F2ZWQgaGVpZ2h0XG4gICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNkcmF3ZXInKS5zdHlsZShcImhlaWdodFwiLCBkLl9fc2F2ZWRfaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHQuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgIH0pO1xuXG4gICAgZDNqc29uUHJvbWlzZShyZWdpc3RyeVVybClcbiAgICAgIC50aGVuKGluaXRNaW5lcylcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgcmVnaXN0cnkgYXQgJHtyZWdpc3RyeVVybH0uIFRyeWluZyAke3JlZ2lzdHJ5RmlsZVVybH0uYCk7XG4gICAgICAgICAgZDNqc29uUHJvbWlzZShyZWdpc3RyeUZpbGVVcmwpXG4gICAgICAgICAgICAgIC50aGVuKGluaXRNaW5lcylcbiAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiQ2Fubm90IGFjY2VzcyByZWdpc3RyeSBmaWxlLiBUaGlzIGlzIG5vdCB5b3VyIGx1Y2t5IGRheS5cIik7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgZDMuc2VsZWN0QWxsKFwiI3R0ZXh0IGxhYmVsIHNwYW5cIilcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyN0dGV4dCcpLmF0dHIoJ2NsYXNzJywgJ2ZsZXhjb2x1bW4gJyt0aGlzLmlubmVyVGV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIHVwZGF0ZVR0ZXh0KCk7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdCgnI3J1bmF0bWluZScpXG4gICAgICAgIC5vbignY2xpY2snLCBydW5hdG1pbmUpO1xuICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJylcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgdCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgICAgICAgIGxldCB0dXJuU3luY09mZiA9IHQudGV4dCgpID09PSBcInN5bmNcIjtcbiAgICAgICAgICAgIHQudGV4dCggdHVyblN5bmNPZmYgPyBcInN5bmNfZGlzYWJsZWRcIiA6IFwic3luY1wiIClcbiAgICAgICAgICAgICAuYXR0cihcInRpdGxlXCIsICgpID0+XG4gICAgICAgICAgICAgICAgIGBDb3VudCBhdXRvc3luYyBpcyAkeyB0dXJuU3luY09mZiA/IFwiT0ZGXCIgOiBcIk9OXCIgfS4gQ2xpY2sgdG8gdHVybiBpdCAkeyB0dXJuU3luY09mZiA/IFwiT05cIiA6IFwiT0ZGXCIgfS5gKTtcbiAgICAgICAgICAgICF0dXJuU3luY09mZiAmJiB1cGRhdGVDb3VudCgpO1xuICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInN5bmNvZmZcIiwgdHVyblN5bmNPZmYpO1xuICAgICAgICB9KTtcbiAgICBkMy5zZWxlY3QoXCIjeG1sdGV4dGFyZWFcIilcbiAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwieG1sdGV4dGFyZWFcIil9KTtcbiAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpXG4gICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcImpzb250ZXh0YXJlYVwiKX0pO1xuICAgIGQzLnNlbGVjdChcIiN1bmRvQnV0dG9uXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIHVuZG8pO1xuICAgIGQzLnNlbGVjdChcIiNyZWRvQnV0dG9uXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIHJlZG8pO1xuXG4gIC8vXG4gIGRyYWdCZWhhdmlvciA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgIC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gb24gZHJhZywgZm9sbG93IHRoZSBtb3VzZSBpbiB0aGUgWSBkaW1lbnNpb24uXG4gICAgICAvLyBEcmFnIGNhbGxiYWNrIGlzIGF0dGFjaGVkIHRvIHRoZSBkcmFnIGhhbmRsZS5cbiAgICAgIGxldCBub2RlR3JwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgLy8gdXBkYXRlIG5vZGUncyB5LWNvb3JkaW5hdGVcbiAgICAgIG5vZGVHcnAuYXR0cihcInRyYW5zZm9ybVwiLCAobikgPT4ge1xuICAgICAgICAgIG4ueSA9IGQzLmV2ZW50Lnk7XG4gICAgICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHtuLnh9LCR7bi55fSlgO1xuICAgICAgfSk7XG4gICAgICAvLyB1cGRhdGUgdGhlIG5vZGUncyBsaW5rXG4gICAgICBsZXQgbGwgPSBkMy5zZWxlY3QoYHBhdGgubGlua1t0YXJnZXQ9XCIke25vZGVHcnAuYXR0cignaWQnKX1cIl1gKTtcbiAgICAgIGxsLmF0dHIoXCJkXCIsIGRpYWdvbmFsKTtcbiAgICAgIH0pXG4gICAgLm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBvbiBkcmFnZW5kLCByZXNvcnQgdGhlIGRyYWdnYWJsZSBub2RlcyBhY2NvcmRpbmcgdG8gdGhlaXIgWSBwb3NpdGlvblxuICAgICAgbGV0IG5vZGVzID0gZDMuc2VsZWN0QWxsKGVkaXRWaWV3LmRyYWdnYWJsZSkuZGF0YSgpXG4gICAgICBub2Rlcy5zb3J0KCAoYSwgYikgPT4gYS55IC0gYi55ICk7XG4gICAgICAvLyB0aGUgbm9kZSB0aGF0IHdhcyBkcmFnZ2VkXG4gICAgICBsZXQgZHJhZ2dlZCA9IGQzLnNlbGVjdCh0aGlzKS5kYXRhKClbMF07XG4gICAgICAvLyBjYWxsYmFjayBmb3Igc3BlY2lmaWMgZHJhZy1lbmQgYmVoYXZpb3JcbiAgICAgIGVkaXRWaWV3LmFmdGVyRHJhZyAmJiBlZGl0Vmlldy5hZnRlckRyYWcobm9kZXMsIGRyYWdnZWQpO1xuICAgICAgLy9cbiAgICAgIHVwZGF0ZSgpO1xuICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICAvL1xuICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdE1pbmVzKGpfbWluZXMpIHtcbiAgICB2YXIgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICBuYW1lMm1pbmUgPSB7fTtcbiAgICBtaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKG0peyBuYW1lMm1pbmVbbS5uYW1lXSA9IG07IH0pO1xuICAgIGN1cnJNaW5lID0gbWluZXNbMF07XG4gICAgY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgIHZhciBtbCA9IGQzLnNlbGVjdChcIiNtbGlzdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShtaW5lcyk7XG4gICAgdmFyIHNlbGVjdE1pbmUgPSBcIk1vdXNlTWluZVwiO1xuICAgIG1sLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICB2YXIgbSA9IGQudXJsLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgIHZhciB2ID0gKHcgJiYgIW0pIHx8IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZT09PXNlbGVjdE1pbmUgfHwgbnVsbDsgfSlcbiAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pO1xuICAgIC8vXG4gICAgLy8gd2hlbiBhIG1pbmUgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdFxuICAgIGQzLnNlbGVjdChcIiNtbGlzdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZWN0ZWRNaW5lKHRoaXMudmFsdWUpOyB9KTtcbiAgICAvL1xuICAgIHZhciBkZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIik7XG4gICAgZGcuY2xhc3NlZChcImhpZGRlblwiLHRydWUpXG4gICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5jbG9zZVwiKS5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpO1xuICAgIGRnLnNlbGVjdChcIi5idXR0b24ucmVtb3ZlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gcmVtb3ZlTm9kZShjdXJyTm9kZSkpO1xuXG4gICAgLy8gXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoXCIjZWRpdFZpZXcgc2VsZWN0XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7IHNldEVkaXRWaWV3KHRoaXMudmFsdWUpOyB9KVxuICAgICAgICA7XG5cbiAgICAvL1xuICAgIGQzLnNlbGVjdChcIiNkaWFsb2cgLnN1YmNsYXNzQ29uc3RyYWludCBzZWxlY3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNldFN1YmNsYXNzQ29uc3RyYWludChjdXJyTm9kZSwgdGhpcy52YWx1ZSk7IH0pO1xuICAgIC8vIFdpcmUgdXAgc2VsZWN0IGJ1dHRvbiBpbiBkaWFsb2dcbiAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzZWxlY3QtY3RybFwiXSAuc3dhdGNoJylcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjdXJyTm9kZS5pc1NlbGVjdGVkID8gY3Vyck5vZGUudW5zZWxlY3QoKSA6IGN1cnJOb2RlLnNlbGVjdCgpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0nKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgY3Vyck5vZGUuaXNTZWxlY3RlZCk7XG4gICAgICAgICAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICAgIH0pO1xuICAgIC8vIFdpcmUgdXAgc29ydCBmdW5jdGlvbiBpbiBkaWFsb2dcbiAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzb3J0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGNjID0gZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdJyk7XG4gICAgICAgICAgICBsZXQgY3VyclNvcnQgPSBjYy5jbGFzc2VkXG4gICAgICAgICAgICBsZXQgb2xkc29ydCA9IGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIpID8gXCJhc2NcIiA6IGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiKSA/IFwiZGVzY1wiIDogXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgbmV3c29ydCA9IG9sZHNvcnQgPT09IFwiYXNjXCIgPyBcImRlc2NcIiA6IG9sZHNvcnQgPT09IFwiZGVzY1wiID8gXCJub25lXCIgOiBcImFzY1wiO1xuICAgICAgICAgICAgY2MuY2xhc3NlZChcInNvcnRhc2NcIiwgbmV3c29ydCA9PT0gXCJhc2NcIik7XG4gICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGRlc2NcIiwgbmV3c29ydCA9PT0gXCJkZXNjXCIpO1xuICAgICAgICAgICAgY3Vyck5vZGUuc2V0U29ydChuZXdzb3J0KTtcbiAgICAgICAgICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdGFydCB3aXRoIHRoZSBmaXJzdCBtaW5lIGJ5IGRlZmF1bHQuXG4gICAgc2VsZWN0ZWRNaW5lKHNlbGVjdE1pbmUpO1xufVxuLy9cbmZ1bmN0aW9uIGNsZWFyU3RhdGUoKSB7XG4gICAgdW5kb01nci5jbGVhcigpO1xufVxuZnVuY3Rpb24gc2F2ZVN0YXRlKCkge1xuICAgIGxldCBzID0gSlNPTi5zdHJpbmdpZnkodW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKSk7XG4gICAgdW5kb01nci5hZGQocyk7XG59XG5mdW5jdGlvbiB1bmRvKCkgeyB1bmRvcmVkbyhcInVuZG9cIikgfVxuZnVuY3Rpb24gcmVkbygpIHsgdW5kb3JlZG8oXCJyZWRvXCIpIH1cbmZ1bmN0aW9uIHVuZG9yZWRvKHdoaWNoKXtcbiAgICB0cnkge1xuICAgICAgICBsZXQgcyA9IEpTT04ucGFyc2UodW5kb01nclt3aGljaF0oKSk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShzLCB0cnVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuLy8gQ2FsbGVkIHdoZW4gdXNlciBzZWxlY3RzIGEgbWluZSBmcm9tIHRoZSBvcHRpb24gbGlzdFxuLy8gTG9hZHMgdGhhdCBtaW5lJ3MgZGF0YSBtb2RlbCBhbmQgYWxsIGl0cyB0ZW1wbGF0ZXMuXG4vLyBUaGVuIGluaXRpYWxpemVzIGRpc3BsYXkgdG8gc2hvdyB0aGUgZmlyc3QgdGVybXBsYXRlJ3MgcXVlcnkuXG5mdW5jdGlvbiBzZWxlY3RlZE1pbmUobW5hbWUpe1xuICAgIGN1cnJNaW5lID0gbmFtZTJtaW5lW21uYW1lXVxuICAgIGlmKCFjdXJyTWluZSkgcmV0dXJuO1xuICAgIGxldCB1cmwgPSBjdXJyTWluZS51cmw7XG4gICAgbGV0IHR1cmwsIG11cmwsIGx1cmwsIGJ1cmwsIHN1cmwsIG91cmw7XG4gICAgY3Vyck1pbmUudG5hbWVzID0gW11cbiAgICBjdXJyTWluZS50ZW1wbGF0ZXMgPSBbXVxuICAgIGlmIChtbmFtZSA9PT0gXCJ0ZXN0XCIpIHsgXG4gICAgICAgIHR1cmwgPSB1cmwgKyBcIi90ZW1wbGF0ZXMuanNvblwiO1xuICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICBsdXJsID0gdXJsICsgXCIvbGlzdHMuanNvblwiO1xuICAgICAgICBidXJsID0gdXJsICsgXCIvYnJhbmRpbmcuanNvblwiO1xuICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgIG91cmwgPSB1cmwgKyBcIi9vcmdhbmlzbWxpc3QuanNvblwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3NlcnZpY2UvdGVtcGxhdGVzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL21vZGVsP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2JyYW5kaW5nXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3N1bW1hcnlmaWVsZHNcIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgIH1cbiAgICAvLyBnZXQgdGhlIG1vZGVsXG4gICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBkM2pzb25Qcm9taXNlKG11cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGx1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGJ1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKG91cmwpXG4gICAgXSkudGhlbiggZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgal9tb2RlbCA9IGRhdGFbMF07XG4gICAgICAgIHZhciBqX3RlbXBsYXRlcyA9IGRhdGFbMV07XG4gICAgICAgIHZhciBqX2xpc3RzID0gZGF0YVsyXTtcbiAgICAgICAgdmFyIGpfYnJhbmRpbmcgPSBkYXRhWzNdO1xuICAgICAgICB2YXIgal9zdW1tYXJ5ID0gZGF0YVs0XTtcbiAgICAgICAgdmFyIGpfb3JnYW5pc21zID0gZGF0YVs1XTtcbiAgICAgICAgLy9cbiAgICAgICAgY3Vyck1pbmUubW9kZWwgPSBjb21waWxlTW9kZWwoal9tb2RlbC5tb2RlbClcbiAgICAgICAgY3Vyck1pbmUudGVtcGxhdGVzID0gal90ZW1wbGF0ZXMudGVtcGxhdGVzO1xuICAgICAgICBjdXJyTWluZS5saXN0cyA9IGpfbGlzdHMubGlzdHM7XG4gICAgICAgIGN1cnJNaW5lLnN1bW1hcnlGaWVsZHMgPSBqX3N1bW1hcnkuY2xhc3NlcztcbiAgICAgICAgY3Vyck1pbmUub3JnYW5pc21MaXN0ID0gal9vcmdhbmlzbXMucmVzdWx0cy5tYXAobyA9PiBvLnNob3J0TmFtZSk7XG4gICAgICAgIC8vXG4gICAgICAgIGN1cnJNaW5lLnRsaXN0ID0gb2JqMmFycmF5KGN1cnJNaW5lLnRlbXBsYXRlcylcbiAgICAgICAgY3Vyck1pbmUudGxpc3Quc29ydChmdW5jdGlvbihhLGIpeyBcbiAgICAgICAgICAgIHJldHVybiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogYS50aXRsZSA+IGIudGl0bGUgPyAxIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJNaW5lLnRuYW1lcyA9IE9iamVjdC5rZXlzKCBjdXJyTWluZS50ZW1wbGF0ZXMgKTtcbiAgICAgICAgY3Vyck1pbmUudG5hbWVzLnNvcnQoKTtcbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgc2VsZWN0aW9uIGxpc3Qgb2YgdGVtcGxhdGVzIGZvciB0aGlzIG1pbmUuXG4gICAgICAgIHZhciB0bCA9IGQzLnNlbGVjdChcIiN0bGlzdCBzZWxlY3RcIilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YSggY3Vyck1pbmUudGxpc3QgKTtcbiAgICAgICAgdGwuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpXG4gICAgICAgIHRsLmV4aXQoKS5yZW1vdmUoKVxuICAgICAgICB0bC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7cmV0dXJuIGQudGl0bGU7fSk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIHN0YXJ0RWRpdCk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShjdXJyTWluZS50ZW1wbGF0ZXNbY3Vyck1pbmUudGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGN1cnJNaW5lLmNvbG9ycyB8fCBkZWZhdWx0Q29sb3JzO1xuICAgICAgICBsZXQgYmdjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci5tYWluIDogY2xycy5tYWluLmZnO1xuICAgICAgICBsZXQgdHhjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci50ZXh0IDogY2xycy5tYWluLmJnO1xuICAgICAgICBsZXQgbG9nbyA9IGN1cnJNaW5lLmltYWdlcy5sb2dvIHx8IGRlZmF1bHRMb2dvO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdG9vbHRyYXlcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNtaW5lTG9nb1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgbG9nbyk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGN1cnJNaW5lLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0IFxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjdXJyTWluZS5tb2RlbC5jbGFzc2VzKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZEVkaXRTb3VyY2UodGhpcy52YWx1ZSk7IHN0YXJ0RWRpdCgpOyB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpWzBdWzBdLnZhbHVlID0gXCJcIjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG5cbiAgICB9LCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y3Vyck1pbmUubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgIH0pO1xufVxuXG4vLyBCZWdpbnMgYW4gZWRpdCwgYmFzZWQgb24gdXNlciBjb250cm9scy5cbmZ1bmN0aW9uIHN0YXJ0RWRpdCgpIHtcbiAgICAvLyBzZWxlY3RvciBmb3IgY2hvb3NpbmcgZWRpdCBpbnB1dCBzb3VyY2UsIGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgLy8gdGhlIGNob3NlbiBlZGl0IHNvdXJjZVxuICAgIGxldCBpbnB1dElkID0gc3JjU2VsZWN0b3JbMF1bMF0udmFsdWU7XG4gICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgbGV0IHNyYyA9IGQzLnNlbGVjdChgIyR7aW5wdXRJZH0gW25hbWU9XCJpblwiXWApO1xuICAgIC8vIHRoZSBxdWVyeSBzdGFydGluZyBwb2ludFxuICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICBpZiAoaW5wdXRJZCA9PT0gXCJ0bGlzdFwiKSB7XG4gICAgICAgIC8vIGEgc2F2ZWQgcXVlcnkgb3IgdGVtcGxhdGVcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1t2YWxdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAvLyBhIG5ldyBxdWVyeSBmcm9tIGEgc2VsZWN0ZWQgc3RhcnRpbmcgY2xhc3NcbiAgICAgICAgbGV0IG50ID0gbmV3IFRlbXBsYXRlKCk7XG4gICAgICAgIG50LnNlbGVjdC5wdXNoKHZhbCtcIi5pZFwiKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKG50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnR4bWxcIikge1xuICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0anNvblwiKSB7XG4gICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbn1cblxuLy8gXG5mdW5jdGlvbiBzZWxlY3RlZEVkaXRTb3VyY2Uoc2hvdyl7XG4gICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gb2JqZWN0LlxuLy8gVGhlIGxpc3QgaXMgc29ydGVkIGJ5IHRoZSBpdGVtIGtleXMuXG4vLyBJZiBuYW1lQXR0ciBpcyBzcGVjaWZpZWQsIHRoZSBpdGVtIGtleSBpcyBhbHNvIGFkZGVkIHRvIGVhY2ggZWxlbWVudFxuLy8gYXMgYW4gYXR0cmlidXRlIChvbmx5IHdvcmtzIGlmIHRob3NlIGl0ZW1zIGFyZSB0aGVtc2VsdmVzIG9iamVjdHMpLlxuLy8gRXhhbXBsZXM6XG4vLyAgICBzdGF0ZXMgPSB7J01FJzp7bmFtZTonTWFpbmUnfSwgJ0lBJzp7bmFtZTonSW93YSd9fVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnfSwge25hbWU6J01haW5lJ31dXG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzLCAnYWJicmV2JykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnLGFiYnJldidJQSd9LCB7bmFtZTonTWFpbmUnLGFiYnJldidNRSd9XVxuLy8gQXJnczpcbi8vICAgIG8gIChvYmplY3QpIFRoZSBvYmplY3QuXG4vLyAgICBuYW1lQXR0ciAoc3RyaW5nKSBJZiBzcGVjaWZpZWQsIGFkZHMgdGhlIGl0ZW0ga2V5IGFzIGFuIGF0dHJpYnV0ZSB0byBlYWNoIGxpc3QgZWxlbWVudC5cbi8vIFJldHVybjpcbi8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSBvXG5mdW5jdGlvbiBvYmoyYXJyYXkobywgbmFtZUF0dHIpe1xuICAgIHZhciBrcyA9IE9iamVjdC5rZXlzKG8pO1xuICAgIGtzLnNvcnQoKTtcbiAgICByZXR1cm4ga3MubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChuYW1lQXR0cikgb1trXS5uYW1lID0gaztcbiAgICAgICAgcmV0dXJuIG9ba107XG4gICAgfSk7XG59O1xuXG4vLyBBZGQgZGlyZWN0IGNyb3NzIHJlZmVyZW5jZXMgdG8gbmFtZWQgdHlwZXMuIChFLmcuLCB3aGVyZSB0aGVcbi8vIG1vZGVsIHNheXMgdGhhdCBHZW5lLmFsbGVsZXMgaXMgYSBjb2xsZWN0aW9uIHdob3NlIHJlZmVyZW5jZWRUeXBlXG4vLyBpcyB0aGUgc3RyaW5nIFwiQWxsZWxlXCIsIGFkZCBhIGRpcmVjdCByZWZlcmVuY2UgdG8gdGhlIEFsbGVsZSBjbGFzcylcbi8vIEFsc28gYWRkcyBhcnJheXMgZm9yIGNvbnZlbmllbmNlIGZvciBhY2Nlc3NpbmcgYWxsIGNsYXNzZXMgb3IgYWxsIGF0dHJpYnV0ZXMgb2YgYSBjbGFzcy5cbi8vXG5mdW5jdGlvbiBjb21waWxlTW9kZWwobW9kZWwpe1xuICAgIC8vIEZpcnN0IGFkZCBjbGFzc2VzIHRoYXQgcmVwcmVzZW50IHRoZSBiYXNpYyB0eXBlXG4gICAgTEVBRlRZUEVTLmZvckVhY2goZnVuY3Rpb24obil7XG4gICAgICAgIG1vZGVsLmNsYXNzZXNbbl0gPSB7XG4gICAgICAgICAgICBpc0xlYWZUeXBlOiB0cnVlLFxuICAgICAgICAgICAgbmFtZTogbixcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBuLFxuICAgICAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgICAgICByZWZlcmVuY2VzOiBbXSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXSxcbiAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvL1xuICAgIG1vZGVsLmFsbENsYXNzZXMgPSBvYmoyYXJyYXkobW9kZWwuY2xhc3NlcylcbiAgICB2YXIgY25zID0gT2JqZWN0LmtleXMobW9kZWwuY2xhc3Nlcyk7XG4gICAgY25zLnNvcnQoKVxuICAgIGNucy5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgdmFyIGNscyA9IG1vZGVsLmNsYXNzZXNbY25dO1xuICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMgPSBvYmoyYXJyYXkoY2xzLnJlZmVyZW5jZXMpXG4gICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucyA9IG9iajJhcnJheShjbHMuY29sbGVjdGlvbnMpXG4gICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcInJlZmVyZW5jZVwiOyB9KTtcbiAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiY29sbGVjdGlvblwiOyB9KTtcbiAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgY2xzLmFsbFBhcnRzLnNvcnQoZnVuY3Rpb24oYSxiKXsgcmV0dXJuIGEubmFtZSA8IGIubmFtZSA/IC0xIDogYS5uYW1lID4gYi5uYW1lID8gMSA6IDA7IH0pO1xuICAgICAgICBtb2RlbC5hbGxDbGFzc2VzLnB1c2goY2xzKTtcbiAgICAgICAgLy9cbiAgICAgICAgY2xzW1wiZXh0ZW5kc1wiXSA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgdmFyIGJjID0gbW9kZWwuY2xhc3Nlc1tlXTtcbiAgICAgICAgICAgIGlmIChiYy5leHRlbmRlZEJ5KSB7XG4gICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeS5wdXNoKGNscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5ID0gW2Nsc107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmM7XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICBPYmplY3Qua2V5cyhjbHMucmVmZXJlbmNlcykuZm9yRWFjaChmdW5jdGlvbihybil7XG4gICAgICAgICAgICB2YXIgciA9IGNscy5yZWZlcmVuY2VzW3JuXTtcbiAgICAgICAgICAgIHIudHlwZSA9IG1vZGVsLmNsYXNzZXNbci5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIE9iamVjdC5rZXlzKGNscy5jb2xsZWN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgICAgICB2YXIgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICBjLnR5cGUgPSBtb2RlbC5jbGFzc2VzW2MucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBtb2RlbDtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdXBlcmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFxuLy8gVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1cGVyY2xhc3NlcyhjbHMpe1xuICAgIGlmICh0eXBlb2YoY2xzKSA9PT0gXCJzdHJpbmdcIiB8fCAhY2xzW1wiZXh0ZW5kc1wiXSB8fCBjbHNbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgdmFyIGFuYyA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1cGVyY2xhc3NlcyhzYyk7IH0pO1xuICAgIHZhciBhbGwgPSBjbHNbXCJleHRlbmRzXCJdLmNvbmNhdChhbmMucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdWJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3ViY2xhc3NlcyhjbHMpe1xuICAgIGlmICh0eXBlb2YoY2xzKSA9PT0gXCJzdHJpbmdcIiB8fCAhY2xzLmV4dGVuZGVkQnkgfHwgY2xzLmV4dGVuZGVkQnkubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgZGVzYyA9IGNscy5leHRlbmRlZEJ5Lm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdWJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNscy5leHRlbmRlZEJ5LmNvbmNhdChkZXNjLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgdmFyIGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgc3ViIGlzIGEgc3ViY2xhc3Mgb2Ygc3VwLlxuZnVuY3Rpb24gaXNTdWJjbGFzcyhzdWIsc3VwKSB7XG4gICAgaWYgKHN1YiA9PT0gc3VwKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodHlwZW9mKHN1YikgPT09IFwic3RyaW5nXCIgfHwgIXN1YltcImV4dGVuZHNcIl0gfHwgc3ViW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciByID0gc3ViW1wiZXh0ZW5kc1wiXS5maWx0ZXIoZnVuY3Rpb24oeCl7IHJldHVybiB4PT09c3VwIHx8IGlzU3ViY2xhc3MoeCwgc3VwKTsgfSk7XG4gICAgcmV0dXJuIHIubGVuZ3RoID4gMDtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gbGlzdCBpcyB2YWxpZCBhcyBhIGxpc3QgY29uc3RyYWludCBvcHRpb24gZm9yXG4vLyB0aGUgbm9kZSBuLiBBIGxpc3QgaXMgdmFsaWQgdG8gdXNlIGluIGEgbGlzdCBjb25zdHJhaW50IGF0IG5vZGUgbiBpZmZcbi8vICAgICAqIHRoZSBsaXN0J3MgdHlwZSBpcyBlcXVhbCB0byBvciBhIHN1YmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZVxuLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGEgc3VwZXJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGUuIEluIHRoaXMgY2FzZSxcbi8vICAgICAgIGVsZW1lbnRzIGluIHRoZSBsaXN0IHRoYXQgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIG5vZGUncyB0eXBlXG4vLyAgICAgICBhcmUgYXV0b21hdGljYWxseSBmaWx0ZXJlZCBvdXQuXG5mdW5jdGlvbiBpc1ZhbGlkTGlzdENvbnN0cmFpbnQobGlzdCwgbil7XG4gICAgdmFyIG50ID0gbi5zdWJ0eXBlQ29uc3RyYWludCB8fCBuLnB0eXBlO1xuICAgIGlmICh0eXBlb2YobnQpID09PSBcInN0cmluZ1wiICkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBsdCA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbbGlzdC50eXBlXTtcbiAgICByZXR1cm4gaXNTdWJjbGFzcyhsdCwgbnQpIHx8IGlzU3ViY2xhc3MobnQsIGx0KTtcbn1cblxuLy8gQ29tcGlsZXMgYSBcInJhd1wiIHRlbXBsYXRlIC0gc3VjaCBhcyBvbmUgcmV0dXJuZWQgYnkgdGhlIC90ZW1wbGF0ZXMgd2ViIHNlcnZpY2UgLSBhZ2FpbnN0XG4vLyBhIG1vZGVsLiBUaGUgbW9kZWwgc2hvdWxkIGhhdmUgYmVlbiBwcmV2aW91c2x5IGNvbXBpbGVkLlxuLy8gQXJnczpcbi8vICAgdGVtcGxhdGUgLSBhIHRlbXBsYXRlIHF1ZXJ5IGFzIGEganNvbiBvYmplY3Rcbi8vICAgbW9kZWwgLSB0aGUgbWluZSdzIG1vZGVsLCBhbHJlYWR5IGNvbXBpbGVkIChzZWUgY29tcGlsZU1vZGVsKS5cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgQ3JlYXRlcyBhIHRyZWUgb2YgcXVlcnkgbm9kZXMgKHN1aXRhYmxlIGZvciBkcmF3aW5nIGJ5IGQzLCBCVFcpLlxuLy8gICBBZGRzIHRoaXMgdHJlZSB0byB0aGUgdGVtcGxhdGUgb2JqZWN0IGFzIGF0dHJpYnV0ZSAncXRyZWUnLlxuLy8gICBUdXJucyBlYWNoIChzdHJpbmcpIHBhdGggaW50byBhIHJlZmVyZW5jZSB0byBhIHRyZWUgbm9kZSBjb3JyZXNwb25kaW5nIHRvIHRoYXQgcGF0aC5cbmZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgbW9kZWwpIHtcbiAgICB2YXIgcm9vdHMgPSBbXVxuICAgIHZhciB0ID0gdGVtcGxhdGU7XG4gICAgLy8gdGhlIHRyZWUgb2Ygbm9kZXMgcmVwcmVzZW50aW5nIHRoZSBjb21waWxlZCBxdWVyeSB3aWxsIGdvIGhlcmVcbiAgICB0LnF0cmVlID0gbnVsbDtcbiAgICAvLyBpbmRleCBvZiBjb2RlIHRvIGNvbnN0cmFpbnQgZ29ycyBoZXJlLlxuICAgIHQuY29kZTJjID0ge31cbiAgICAvLyBub3JtYWxpemUgdGhpbmdzIHRoYXQgbWF5IGJlIHVuZGVmaW5lZFxuICAgIHQuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgIHQuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgLy9cbiAgICB2YXIgc3ViY2xhc3NDcyA9IFtdO1xuICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICBpZiAoYy50eXBlKSB7XG4gICAgICAgICAgICBjLm9wID0gXCJJU0FcIlxuICAgICAgICAgICAgc3ViY2xhc3NDcy5wdXNoKGMpO1xuICAgICAgICB9XG4gICAgICAgIGMuY3R5cGUgPSBPUElOREVYW2Mub3BdLmN0eXBlO1xuICAgICAgICBpZiAoYy5jb2RlKSB0LmNvZGUyY1tjLmNvZGVdID0gYztcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgICAgIC8vIFdpdGggbnVsbC9ub3QtbnVsbCBjb25zdHJhaW50cywgSU0gaGFzIGEgd2VpcmQgcXVpcmsgb2YgZmlsbGluZyB0aGUgdmFsdWUgXG4gICAgICAgICAgICAvLyBmaWVsZCB3aXRoIHRoZSBvcGVyYXRvci4gRS5nLiwgZm9yIGFuIFwiSVMgTk9UIE5VTExcIiBvcHJlYXRvciwgdGhlIHZhbHVlIGZpZWxkIGlzXG4gICAgICAgICAgICAvLyBhbHNvIFwiSVMgTk9UIE5VTExcIi4gXG4gICAgICAgICAgICAvLyBcbiAgICAgICAgICAgIGMudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGRlYWwgd2l0aCBleHRyYVZhbHVlIGhlcmUgKD8pXG4gICAgICAgIH1cbiAgICB9KVxuICAgIC8vIG11c3QgcHJvY2VzcyBhbnkgc3ViY2xhc3MgY29uc3RyYWludHMgZmlyc3QsIGZyb20gc2hvcnRlc3QgdG8gbG9uZ2VzdCBwYXRoXG4gICAgc3ViY2xhc3NDc1xuICAgICAgICAuc29ydChmdW5jdGlvbihhLGIpe1xuICAgICAgICAgICAgcmV0dXJuIGEucGF0aC5sZW5ndGggLSBiLnBhdGgubGVuZ3RoO1xuICAgICAgICB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgYy5wYXRoLCBtb2RlbCk7XG4gICAgICAgICAgICAgdmFyIGNscyA9IG1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIGMudHlwZTtcbiAgICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgfSk7XG4gICAgLy9cbiAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGMucGF0aCwgbW9kZWwpO1xuICAgICAgICBpZiAobi5jb25zdHJhaW50cylcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzID0gW2NdO1xuICAgIH0pXG5cbiAgICAvL1xuICAgIHQuc2VsZWN0ICYmIHQuc2VsZWN0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIHAsIG1vZGVsKTtcbiAgICAgICAgbi5zZWxlY3QoKTtcbiAgICB9KVxuICAgIHQuam9pbnMgJiYgdC5qb2lucy5mb3JFYWNoKGZ1bmN0aW9uKGope1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgaiwgbW9kZWwpO1xuICAgICAgICBuLmpvaW4gPSBcIm91dGVyXCI7XG4gICAgfSlcbiAgICB0Lm9yZGVyQnkgJiYgdC5vcmRlckJ5LmZvckVhY2goZnVuY3Rpb24obywgaSl7XG4gICAgICAgIHZhciBwID0gT2JqZWN0LmtleXMobylbMF1cbiAgICAgICAgdmFyIGRpciA9IG9bcF1cbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIHAsIG1vZGVsKTtcbiAgICAgICAgbi5zb3J0ID0geyBkaXI6IGRpciwgbGV2ZWw6IGkgfTtcbiAgICB9KTtcbiAgICBpZiAoIXQucXRyZWUpIHtcbiAgICAgICAgdGhyb3cgXCJObyBwYXRocyBpbiBxdWVyeS5cIlxuICAgIH1cbiAgICByZXR1cm4gdDtcbn1cblxuLy8gVHVybnMgYSBxdHJlZSBzdHJ1Y3R1cmUgYmFjayBpbnRvIGEgXCJyYXdcIiB0ZW1wbGF0ZS4gXG4vL1xuZnVuY3Rpb24gdW5jb21waWxlVGVtcGxhdGUodG1wbHQpe1xuICAgIHZhciB0ID0ge1xuICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICB0aXRsZTogdG1wbHQudGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0bXBsdC5kZXNjcmlwdGlvbixcbiAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgcmFuazogdG1wbHQucmFuayxcbiAgICAgICAgbW9kZWw6IGRlZXBjKHRtcGx0Lm1vZGVsKSxcbiAgICAgICAgdGFnczogZGVlcGModG1wbHQudGFncyksXG4gICAgICAgIHNlbGVjdCA6IHRtcGx0LnNlbGVjdC5jb25jYXQoKSxcbiAgICAgICAgd2hlcmUgOiBbXSxcbiAgICAgICAgam9pbnMgOiBbXSxcbiAgICAgICAgY29uc3RyYWludExvZ2ljOiB0bXBsdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIixcbiAgICAgICAgb3JkZXJCeSA6IFtdXG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlYWNoKG4pe1xuICAgICAgICB2YXIgcCA9IG4ucGF0aFxuICAgICAgICBpZiAobi5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBwYXRoIHNob3VsZCBhbHJlYWR5IGJlIHRoZXJlXG4gICAgICAgICAgICBpZiAodC5zZWxlY3QuaW5kZXhPZihuLnBhdGgpID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkFub21hbHkgZGV0ZWN0ZWQgaW4gc2VsZWN0IGxpc3QuXCI7XG4gICAgICAgIH1cbiAgICAgICAgKG4uY29uc3RyYWludHMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgbGV0IGNjID0gbmV3IENvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICAgY2Mubm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgdC53aGVyZS5wdXNoKGNjKVxuICAgICAgICB9KVxuICAgICAgICBpZiAobi5qb2luID09PSBcIm91dGVyXCIpIHtcbiAgICAgICAgICAgIHQuam9pbnMucHVzaChwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICBsZXQgcyA9IHt9XG4gICAgICAgICAgICBzW3BdID0gbi5zb3J0LmRpci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICB9XG4gICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZWFjaCk7XG4gICAgfVxuXG4gICAgcmVhY2godG1wbHQucXRyZWUpO1xuICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICByZXR1cm4gdFxufVxuXG4vL1xuY2xhc3MgTm9kZSB7XG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHRlbXBsYXRlIChUZW1wbGF0ZSBvYmplY3QpIHRoZSB0ZW1wbGF0ZSB0aGF0IG93bnMgdGhpcyBub2RlXG4gICAgLy8gICBwYXJlbnQgKG9iamVjdCkgUGFyZW50IG9mIHRoZSBuZXcgbm9kZS5cbiAgICAvLyAgIG5hbWUgKHN0cmluZykgTmFtZSBmb3IgdGhlIG5vZGVcbiAgICAvLyAgIHBjb21wIChvYmplY3QpIFBhdGggY29tcG9uZW50IGZvciB0aGUgcm9vdCwgdGhpcyBpcyBhIGNsYXNzLiBGb3Igb3RoZXIgbm9kZXMsIGFuIGF0dHJpYnV0ZSwgXG4gICAgLy8gICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24gZGVjcmlwdG9yLlxuICAgIC8vICAgcHR5cGUgKG9iamVjdCBvciBzdHJpbmcpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHNpbXBsZSBhdHRyaWJ1dGVzLCB0aGlzIGlzIGEgc3RyaW5nLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWwuIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnBhdGg7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy9cbiAgICBnZXQgcGF0aCAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoICtcIi5cIiA6IFwiXCIpICsgdGhpcy5uYW1lO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBub2RlVHlwZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCB8fCB0aGlzLnB0eXBlO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc0Jpb0VudGl0eSAoKSB7XG4gICAgICAgIGxldCBiZSA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbXCJCaW9FbnRpdHlcIl07XG4gICAgICAgIGxldCBudCA9IHRoaXMubm9kZVR5cGU7XG4gICAgICAgIHJldHVybiBpc1N1YmNsYXNzKG50LCBiZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyAhPT0gbnVsbCAmJiB0aGlzLnZpZXcgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICB0aGlzLnZpZXcgPSBpID49IDAgPyBpIDogKHQuc2VsZWN0LnB1c2gocCkgLSAxKTtcbiAgICB9XG4gICAgdW5zZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwYXRoIGZyb20gdGhlIHNlbGVjdCBsaXN0XG4gICAgICAgICAgICB0LnNlbGVjdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW51bWJlciBub2RlcyBoZXJlXG4gICAgICAgICAgICB0LnNlbGVjdC5zbGljZShpKS5mb3JFYWNoKCAocCxqKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSBnZXROb2RlQnlQYXRoKHRoaXMudGVtcGxhdGUsIHApO1xuICAgICAgICAgICAgICAgIG4udmlldyAtPSAxO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB9XG4gICAgc2V0U29ydChuZXdkaXIpe1xuICAgICAgICBsZXQgb2xkZGlyID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmRpciA6IFwibm9uZVwiO1xuICAgICAgICBsZXQgb2xkbGV2ID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgIGxldCBtYXhsZXYgPSAtMTtcbiAgICAgICAgbGV0IHJlbnVtYmVyID0gZnVuY3Rpb24gKG4pe1xuICAgICAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCAmJiBuLnNvcnQubGV2ZWwgPiBvbGRsZXYpXG4gICAgICAgICAgICAgICAgICAgIG4uc29ydC5sZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIG1heGxldiA9IE1hdGgubWF4KG1heGxldiwgbi5zb3J0LmxldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZW51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFuZXdkaXIgfHwgbmV3ZGlyID09PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgLy8gc2V0IHRvIG5vdCBzb3J0ZWRcbiAgICAgICAgICAgIHRoaXMuc29ydCA9IG51bGw7XG4gICAgICAgICAgICBpZiAob2xkbGV2ID49IDApe1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgc29ydGVkIGJlZm9yZSwgbmVlZCB0byByZW51bWJlciBhbnkgZXhpc3Rpbmcgc29ydCBjZmdzLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0IHRvIHNvcnRlZFxuICAgICAgICAgICAgaWYgKG9sZGxldiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIG5vdCBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIGZpbmQgbmV4dCBsZXZlbC5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgICAgICBvbGRsZXYgPSBtYXhsZXYgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zb3J0ID0geyBkaXI6bmV3ZGlyLCBsZXZlbDogb2xkbGV2IH07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvciAodCkge1xuICAgICAgICB0ID0gdCB8fCB7fVxuICAgICAgICB0aGlzLm1vZGVsID0gdC5tb2RlbCA/IGRlZXBjKHQubW9kZWwpIDogeyBuYW1lOiBcImdlbm9taWNcIiB9O1xuICAgICAgICB0aGlzLm5hbWUgPSB0Lm5hbWUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy50aXRsZSA9IHQudGl0bGUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgdGhpcy5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gdC5zZWxlY3QgPyBkZWVwYyh0LnNlbGVjdCkgOiBbXTtcbiAgICAgICAgdGhpcy53aGVyZSA9IHQud2hlcmUgPyB0LndoZXJlLm1hcCggYyA9PiBjLmNsb25lID8gYy5jbG9uZSgpIDogbmV3IENvbnN0cmFpbnQoYykgKSA6IFtdO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuam9pbnMgPSB0LmpvaW5zID8gZGVlcGModC5qb2lucykgOiBbXTtcbiAgICAgICAgdGhpcy50YWdzID0gdC50YWdzID8gZGVlcGModC50YWdzKSA6IFtdO1xuICAgICAgICB0aGlzLm9yZGVyQnkgPSB0Lm9yZGVyQnkgPyBkZWVwYyh0Lm9yZGVyQnkpIDogW107XG4gICAgfVxuXG4gICAgLy8gVE9ETzogS2VlcCBtb3ZpbmcgZnVuY3Rpb25zIGludG8gbWV0aG9kc1xuICAgIC8vIEZJWE1FOiBOb3QgYWxsIHRlbXBsYXRlcyBhcmUgVGVtYXBsYXRlcyAhISAoc29tZSBhcmUgc3RpbGwgcGxhaW4gb2JqZWN0cyBjcmVhdGVkIGVsc2V3aXNlKVxufTtcblxuZnVuY3Rpb24gZ2V0Tm9kZUJ5UGF0aCAodCxwKSB7XG4gICAgICAgIHAgPSBwLnRyaW0oKTtcbiAgICAgICAgaWYgKCFwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IHBhcnRzID0gcC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBuID0gdC5xdHJlZTtcbiAgICAgICAgaWYgKG4ubmFtZSAhPT0gcGFydHNbMF0pIHJldHVybiBudWxsO1xuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjbmFtZSA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgbGV0IGMgPSAobi5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKHggPT4geC5uYW1lID09PSBjbmFtZSlbMF07XG4gICAgICAgICAgICBpZiAoIWMpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG5jbGFzcyBDb25zdHJhaW50IHtcbiAgICBjb25zdHJ1Y3RvciAoYykge1xuICAgICAgICBjID0gYyB8fCB7fVxuICAgICAgICAvLyBzYXZlIHRoZSAgbm9kZVxuICAgICAgICB0aGlzLm5vZGUgPSBjLm5vZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gYWxsIGNvbnN0cmFpbnRzIGhhdmUgdGhpc1xuICAgICAgICB0aGlzLnBhdGggPSBjLnBhdGggfHwgYy5ub2RlICYmIGMubm9kZS5wYXRoIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgYWxsIGV4Y2VwdCBzdWJjbGFzcyBjb25zdHJhaW50cyAod2Ugc2V0IGl0IHRvIFwiSVNBXCIpXG4gICAgICAgIHRoaXMub3AgPSBjLm9wIHx8IG51bGw7XG4gICAgICAgIC8vIG9uZSBvZjogbnVsbCwgdmFsdWUsIG11bHRpdmFsdWUsIHN1YmNsYXNzLCBsb29rdXAsIGxpc3RcbiAgICAgICAgdGhpcy5jdHlwZSA9IGMuY3R5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMuY29kZSA9IGMuY29kZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHZhbHVlLCBsaXN0XG4gICAgICAgIHRoaXMudmFsdWUgPSBjLnZhbHVlIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgTE9PS1VQIG9uIEJpb0VudGl0eSBhbmQgc3ViY2xhc3Nlc1xuICAgICAgICB0aGlzLmV4dHJhVmFsdWUgPSBjLmV4dHJhVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IGMudmFsdWVzICYmIGRlZXBjKGMudmFsdWVzKSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHN1YmNsYXNzIGNvbnRyYWludHNcbiAgICAgICAgdGhpcy50eXBlID0gYy50eXBlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgZm9yIGNvbnN0cmFpbnRzIGluIGEgdGVtcGxhdGVcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IGMuZWRpdGFibGUgfHwgbnVsbDtcbiAgICB9XG4gICAgLy8gUmV0dXJucyBhbiB1bnJlZ2lzdGVyZWQgY2xvbmUuIChtZWFuczogbm8gbm9kZSBwb2ludGVyKVxuICAgIGNsb25lICgpIHtcbiAgICAgICAgbGV0IGMgPSBuZXcgQ29uc3RyYWludCh0aGlzKTtcbiAgICAgICAgYy5ub2RlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIC8vXG4gICAgc2V0T3AgKG8sIHF1aWV0bHkpIHtcbiAgICAgICAgbGV0IG9wID0gT1BJTkRFWFtvXTtcbiAgICAgICAgaWYgKCFvcCkgdGhyb3cgXCJVbmtub3duIG9wZXJhdG9yOiBcIiArIG87XG4gICAgICAgIHRoaXMub3AgPSBvcC5vcDtcbiAgICAgICAgdGhpcy5jdHlwZSA9IG9wLmN0eXBlO1xuICAgICAgICBsZXQgdCA9IHRoaXMubm9kZSAmJiB0aGlzLm5vZGUudGVtcGxhdGU7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvZGUgJiYgIXF1aWV0bHkgJiYgdCkgXG4gICAgICAgICAgICAgICAgZGVsZXRlIHQuY29kZTJjW3RoaXMuY29kZV07XG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvZGUpIFxuICAgICAgICAgICAgICAgIHRoaXMuY29kZSA9IHQgJiYgbmV4dEF2YWlsYWJsZUNvZGUodCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAhcXVpZXRseSAmJiB0ICYmIHNldExvZ2ljRXhwcmVzc2lvbih0LmNvbnN0cmFpbnRMb2dpYywgdCk7XG4gICAgfVxuICAgIC8vIGZvcm1hdHMgdGhpcyBjb25zdHJhaW50IGFzIHhtbFxuICAgIGMyeG1sICgpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiIHx8IHRoaXMuY3R5cGUgPT09IFwibGlzdFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiBlZGl0YWJsZT1cIiR7dGhpcy5lZGl0YWJsZX1cImA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKHRoaXMuZXh0cmFWYWx1ZSAmJiB0aGlzLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke3RoaXMuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke3RoaXMuY29kZX1cIiBlZGl0YWJsZT1cIiR7dGhpcy5lZGl0YWJsZX1cImA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiIGVkaXRhYmxlPVwiJHt0aGlzLmVkaXRhYmxlfVwiYDtcbiAgICAgICAgICAgIGggPSB0aGlzLnZhbHVlcy5tYXAoIHYgPT4gYDx2YWx1ZT4ke2VzYyh2KX08L3ZhbHVlPmAgKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiB0eXBlPVwiJHt0aGlzLnR5cGV9XCIgZWRpdGFibGU9XCJmYWxzZVwiYDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGV9XCJgO1xuICAgICAgICBpZihoKVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9PiR7aH08L2NvbnN0cmFpbnQ+XFxuYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9IC8+XFxuYDtcbiAgICB9XG59XG5cbi8vIEFkZHMgYSBwYXRoIHRvIHRoZSBjdXJyZW50IGRpYWdyYW0uIFBhdGggaXMgc3BlY2lmaWVkIGFzIGEgZG90dGVkIGxpc3Qgb2YgbmFtZXMuXG4vLyBBcmdzOlxuLy8gICB0ZW1wbGF0ZSAob2JqZWN0KSB0aGUgdGVtcGxhdGVcbi8vICAgcGF0aCAoc3RyaW5nKSB0aGUgcGF0aCB0byBhZGQuIFxuLy8gICBtb2RlbCBvYmplY3QgQ29tcGlsZWQgZGF0YSBtb2RlbC5cbi8vIFJldHVybnM6XG4vLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC4gXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIENyZWF0ZXMgbmV3IG5vZGVzIGFzIG5lZWRlZCBhbmQgYWRkcyB0aGVtIHRvIHRoZSBxdHJlZS5cbmZ1bmN0aW9uIGFkZFBhdGgodGVtcGxhdGUsIHBhdGgsIG1vZGVsKXtcbiAgICBpZiAodHlwZW9mKHBhdGgpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgdmFyIGNsYXNzZXMgPSBtb2RlbC5jbGFzc2VzO1xuICAgIHZhciBsYXN0dCA9IG51bGxcbiAgICB2YXIgbiA9IHRlbXBsYXRlLnF0cmVlOyAgLy8gY3VycmVudCBub2RlIHBvaW50ZXJcblxuICAgIGZ1bmN0aW9uIGZpbmQobGlzdCwgbil7XG4gICAgICAgICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHgubmFtZSA9PT0gbn0pWzBdXG4gICAgfVxuXG4gICAgcGF0aC5mb3JFYWNoKGZ1bmN0aW9uKHAsIGkpe1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlLnF0cmVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgcm9vdCBhbHJlYWR5IGV4aXN0cywgbWFrZSBzdXJlIG5ldyBwYXRoIGhhcyBzYW1lIHJvb3QuXG4gICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgIGlmIChwICE9PSBuLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2Fubm90IGFkZCBwYXRoIGZyb20gZGlmZmVyZW50IHJvb3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCBwYXRoIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICBpZiAoIWNscylcbiAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzOiBcIiArIHA7XG4gICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gbiBpcyBwb2ludGluZyB0byB0aGUgcGFyZW50LCBhbmQgcCBpcyB0aGUgbmV4dCBuYW1lIGluIHRoZSBwYXRoLlxuICAgICAgICAgICAgdmFyIG5uID0gZmluZChuLmNoaWxkcmVuLCBwKTtcbiAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgIC8vIHAgaXMgYWxyZWFkeSBhIGNoaWxkXG4gICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBhZGQgYSBuZXcgbm9kZSBmb3IgcFxuICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgIHZhciB4O1xuICAgICAgICAgICAgICAgIHZhciBjbHMgPSBuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlO1xuICAgICAgICAgICAgICAgIGlmIChjbHMuYXR0cmlidXRlc1twXSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IHgudHlwZSAvLyA8LS0gQSBzdHJpbmchXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXTtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1t4LnJlZmVyZW5jZWRUeXBlXSAvLyA8LS1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIG1lbWJlciBuYW1lZCBcIiArIHAgKyBcIiBpbiBjbGFzcyBcIiArIGNscy5uYW1lICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSwgYWRkIGl0IHRvIG4ncyBjaGlsZHJlblxuICAgICAgICAgICAgICAgIG5uID0gbmV3IE5vZGUodGVtcGxhdGUsIG4sIHAsIHgsIGNscyk7XG4gICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIHJldHVybiB0aGUgbGFzdCBub2RlIGluIHRoZSBwYXRoXG4gICAgcmV0dXJuIG47XG59XG5cblxuLy8gQXJnczpcbi8vICAgbiAobm9kZSkgVGhlIG5vZGUgaGF2aW5nIHRoZSBjb25zdHJhaW50LlxuLy8gICBzY05hbWUgKHR5cGUpIE5hbWUgb2Ygc3ViY2xhc3MuXG5mdW5jdGlvbiBzZXRTdWJjbGFzc0NvbnN0cmFpbnQobiwgc2NOYW1lKXtcbiAgICAvLyByZW1vdmUgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24gKGMpeyByZXR1cm4gYy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiOyB9KTtcbiAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7XG4gICAgaWYgKHNjTmFtZSl7XG4gICAgICAgIGxldCBjbHMgPSBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW3NjTmFtZV07XG4gICAgICAgIGlmKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBzY05hbWU7XG4gICAgICAgIG4uY29uc3RyYWludHMucHVzaCh7IGN0eXBlOlwic3ViY2xhc3NcIiwgb3A6XCJJU0FcIiwgcGF0aDpuLnBhdGgsIHR5cGU6Y2xzLm5hbWUgfSk7XG4gICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjaGVjayhub2RlLCByZW1vdmVkKSB7XG4gICAgICAgIHZhciBjbHMgPSBub2RlLnN1YmNsYXNzQ29uc3RyYWludCB8fCBub2RlLnB0eXBlO1xuICAgICAgICB2YXIgYzIgPSBbXTtcbiAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgaWYoYy5uYW1lIGluIGNscy5hdHRyaWJ1dGVzIHx8IGMubmFtZSBpbiBjbHMucmVmZXJlbmNlcyB8fCBjLm5hbWUgaW4gY2xzLmNvbGxlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgYzIucHVzaChjKTtcbiAgICAgICAgICAgICAgICBjaGVjayhjLCByZW1vdmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goYyk7XG4gICAgICAgIH0pXG4gICAgICAgIG5vZGUuY2hpbGRyZW4gPSBjMjtcbiAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XG4gICAgfVxuICAgIHZhciByZW1vdmVkID0gY2hlY2sobixbXSk7XG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShuKTtcbiAgICBpZihyZW1vdmVkLmxlbmd0aCA+IDApXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBhbGVydChcIkNvbnN0cmFpbmluZyB0byBzdWJjbGFzcyBcIiArIChzY05hbWUgfHwgbi5wdHlwZS5uYW1lKVxuICAgICAgICAgICAgKyBcIiBjYXVzZWQgdGhlIGZvbGxvd2luZyBwYXRocyB0byBiZSByZW1vdmVkOiBcIiBcbiAgICAgICAgICAgICsgcmVtb3ZlZC5tYXAobiA9PiBuLnBhdGgpLmpvaW4oXCIsIFwiKSk7IFxuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG59XG5cbi8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbi8vXG5mdW5jdGlvbiByZW1vdmVOb2RlKG4pIHtcbiAgICAvLyBGaXJzdCwgcmVtb3ZlIGFsbCBjb25zdHJhaW50cyBvbiBuIG9yIGl0cyBkZXNjZW5kYW50c1xuICAgIGZ1bmN0aW9uIHJtYyAoeCkge1xuICAgICAgICB4LnVuc2VsZWN0KCk7XG4gICAgICAgIHguY29uc3RyYWludHMuZm9yRWFjaChjID0+IHJlbW92ZUNvbnN0cmFpbnQoeCxjKSk7XG4gICAgICAgIHguY2hpbGRyZW4uZm9yRWFjaChybWMpO1xuICAgIH1cbiAgICBybWMobik7XG4gICAgLy8gTm93IHJlbW92ZSB0aGUgc3VidHJlZSBhdCBuLlxuICAgIHZhciBwID0gbi5wYXJlbnQ7XG4gICAgaWYgKHApIHtcbiAgICAgICAgcC5jaGlsZHJlbi5zcGxpY2UocC5jaGlsZHJlbi5pbmRleE9mKG4pLCAxKTtcbiAgICAgICAgaGlkZURpYWxvZygpO1xuICAgICAgICB1cGRhdGUocCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoaWRlRGlhbG9nKClcbiAgICB9XG4gICAgLy9cbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIHRlbXBsYXRlIGZyb20gdGhlIGxpc3QuXG4vLyBHZXRzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjdXJyZW50IG1pbmUgYW5kIGJ1aWxkcyBhIHNldCBvZiBub2Rlc1xuLy8gZm9yIGQzIHRyZWUgZGlzcGxheS5cbi8vXG5mdW5jdGlvbiBlZGl0VGVtcGxhdGUgKHQsIG5vc2F2ZSkge1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWRpdG9yIHdvcmtzIG9uIGEgY29weSBvZiB0aGUgdGVtcGxhdGUuXG4gICAgLy9cbiAgICBjdXJyVGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodCk7XG4gICAgLy9cbiAgICByb290ID0gY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSwgY3Vyck1pbmUubW9kZWwpLnF0cmVlXG4gICAgcm9vdC54MCA9IDA7XG4gICAgcm9vdC55MCA9IGggLyAyO1xuICAgIC8vXG4gICAgc2V0TG9naWNFeHByZXNzaW9uKCk7XG5cbiAgICBpZiAoISBub3NhdmUpIHNhdmVTdGF0ZSgpO1xuXG4gICAgLy8gRmlsbCBpbiB0aGUgYmFzaWMgdGVtcGxhdGUgaW5mb3JtYXRpb24gKG5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbiwgZXRjLilcbiAgICAvL1xuICAgIHZhciB0aSA9IGQzLnNlbGVjdChcIiN0SW5mb1wiKTtcbiAgICB2YXIgeGZlciA9IGZ1bmN0aW9uKG5hbWUsIGVsdCl7IGN1cnJUZW1wbGF0ZVtuYW1lXSA9IGVsdC52YWx1ZTsgdXBkYXRlVHRleHQoKTsgfTtcbiAgICAvLyBOYW1lICh0aGUgaW50ZXJuYWwgdW5pcXVlIG5hbWUpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cIm5hbWVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS5uYW1lKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcIm5hbWVcIiwgdGhpcykgfSk7XG4gICAgLy8gVGl0bGUgKHdoYXQgdGhlIHVzZXIgc2VlcylcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwidGl0bGVcIl0gaW5wdXQnKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN1cnJUZW1wbGF0ZS50aXRsZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBEZXNjcmlwdGlvbiAod2hhdCBpdCBkb2VzIC0gYSBsaXR0bGUgZG9jdW1lbnRhdGlvbikuXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmRlc2NyaXB0aW9uKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImRlc2NyaXB0aW9uXCIsIHRoaXMpIH0pO1xuICAgIC8vIENvbW1lbnQgLSBmb3Igd2hhdGV2ZXIsIEkgZ3Vlc3MuIFxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJjb21tZW50XCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3VyclRlbXBsYXRlLmNvbW1lbnQpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiY29tbWVudFwiLCB0aGlzKSB9KTtcblxuICAgIC8vIExvZ2ljIGV4cHJlc3Npb24gLSB3aGljaCB0aWVzIHRoZSBpbmRpdmlkdWFsIGNvbnN0cmFpbnRzIHRvZ2V0aGVyXG4gICAgZDMuc2VsZWN0KCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgfSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSwgY3VyclRlbXBsYXRlKTtcbiAgICAgICAgICAgIHhmZXIoXCJjb25zdHJhaW50TG9naWNcIiwgdGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAvL1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICB1cGRhdGUocm9vdCk7XG59XG5cbi8vIFNldHMgdGhlIGNvbnN0cmFpbnQgbG9naWMgZXhwcmVzc2lvbiBmb3IgdGhlIGdpdmVuIHRlbXBsYXRlLlxuLy8gSW4gdGhlIHByb2Nlc3MsIGFsc28gXCJjb3JyZWN0c1wiIHRoZSBleHByZXNzaW9uIGFzIGZvbGxvd3M6XG4vLyAgICAqIGFueSBjb2RlcyBpbiB0aGUgZXhwcmVzc2lvbiB0aGF0IGFyZSBub3QgYXNzb2NpYXRlZCB3aXRoXG4vLyAgICAgIGFueSBjb25zdHJhaW50IGluIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFyZSByZW1vdmVkIGFuZCB0aGVcbi8vICAgICAgZXhwcmVzc2lvbiBsb2dpYyB1cGRhdGVkIGFjY29yZGluZ2x5XG4vLyAgICAqIGFuZCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgdGhhdCBhcmUgbm90IGluIHRoZSBleHByZXNzaW9uXG4vLyAgICAgIGFyZSBBTkRlZCB0byB0aGUgZW5kLlxuLy8gRm9yIGV4YW1wbGUsIGlmIHRoZSBjdXJyZW50IHRlbXBsYXRlIGhhcyBjb2RlcyBBLCBCLCBhbmQgQywgYW5kXG4vLyB0aGUgZXhwcmVzc2lvbiBpcyBcIihBIG9yIEQpIGFuZCBCXCIsIHRoZSBEIGRyb3BzIG91dCBhbmQgQyBpc1xuLy8gYWRkZWQsIHJlc3VsdGluZyBpbiBcIkEgYW5kIEIgYW5kIENcIi4gXG4vLyBBcmdzOlxuLy8gICBleCAoc3RyaW5nKSB0aGUgZXhwcmVzc2lvblxuLy8gICB0bXBsdCAob2JqKSB0aGUgdGVtcGxhdGVcbi8vIFJldHVybnM6XG4vLyAgIHRoZSBcImNvcnJlY3RlZFwiIGV4cHJlc3Npb25cbi8vICAgXG5mdW5jdGlvbiBzZXRMb2dpY0V4cHJlc3Npb24oZXgsIHRtcGx0KXtcbiAgICB0bXBsdCA9IHRtcGx0ID8gdG1wbHQgOiBjdXJyVGVtcGxhdGU7XG4gICAgZXggPSBleCA/IGV4IDogKHRtcGx0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiKVxuICAgIHZhciBhc3Q7IC8vIGFic3RyYWN0IHN5bnRheCB0cmVlXG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmdW5jdGlvbiByZWFjaChuLGxldil7XG4gICAgICAgIGlmICh0eXBlb2YobikgPT09IFwic3RyaW5nXCIgKXtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuIFxuICAgICAgICAgICAgLy8gSWYgbm90LCByZW1vdmUgaXQgZnJvbSB0aGUgZXhwci5cbiAgICAgICAgICAgIC8vIEFsc28gcmVtb3ZlIGl0IGlmIGl0J3MgdGhlIGNvZGUgZm9yIGEgc3ViY2xhc3MgY29uc3RyYWludFxuICAgICAgICAgICAgc2Vlbi5wdXNoKG4pO1xuICAgICAgICAgICAgcmV0dXJuIChuIGluIHRtcGx0LmNvZGUyYyAmJiB0bXBsdC5jb2RlMmNbbl0uY3R5cGUgIT09IFwic3ViY2xhc3NcIikgPyBuIDogXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY21zID0gbi5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYyl7cmV0dXJuIHJlYWNoKGMsIGxldisxKTt9KS5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHg7fSk7O1xuICAgICAgICB2YXIgY21zcyA9IGNtcy5qb2luKFwiIFwiK24ub3ArXCIgXCIpO1xuICAgICAgICByZXR1cm4gY21zLmxlbmd0aCA9PT0gMCA/IFwiXCIgOiBsZXYgPT09IDAgfHwgY21zLmxlbmd0aCA9PT0gMSA/IGNtc3MgOiBcIihcIiArIGNtc3MgKyBcIilcIlxuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBhc3QgPSBleCA/IHBhcnNlci5wYXJzZShleCkgOiBudWxsO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFsZXJ0KGVycik7XG4gICAgICAgIHJldHVybiB0bXBsdC5jb25zdHJhaW50TG9naWM7XG4gICAgfVxuICAgIC8vXG4gICAgdmFyIGxleCA9IGFzdCA/IHJlYWNoKGFzdCwwKSA6IFwiXCI7XG4gICAgLy8gaWYgYW55IGNvbnN0cmFpbnQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHdlcmUgbm90IHNlZW4gaW4gdGhlIGV4cHJlc3Npb24sXG4gICAgLy8gQU5EIHRoZW0gaW50byB0aGUgZXhwcmVzc2lvbiAoZXhjZXB0IElTQSBjb25zdHJhaW50cykuXG4gICAgdmFyIHRvQWRkID0gT2JqZWN0LmtleXModG1wbHQuY29kZTJjKS5maWx0ZXIoZnVuY3Rpb24oYyl7XG4gICAgICAgIHJldHVybiBzZWVuLmluZGV4T2YoYykgPT09IC0xICYmIGMub3AgIT09IFwiSVNBXCI7XG4gICAgICAgIH0pO1xuICAgIGlmICh0b0FkZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICBpZihhc3QgJiYgYXN0Lm9wICYmIGFzdC5vcCA9PT0gXCJvclwiKVxuICAgICAgICAgICAgIGxleCA9IGAoJHtsZXh9KWA7XG4gICAgICAgICBpZiAobGV4KSB0b0FkZC51bnNoaWZ0KGxleCk7XG4gICAgICAgICBsZXggPSB0b0FkZC5qb2luKFwiIGFuZCBcIik7XG4gICAgfVxuICAgIC8vXG4gICAgdG1wbHQuY29uc3RyYWludExvZ2ljID0gbGV4O1xuXG4gICAgZDMuc2VsZWN0KCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGxleDsgfSk7XG5cbiAgICByZXR1cm4gbGV4O1xufVxuXG4vLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuLy8gQXJnczpcbi8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbi8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuLy8gICBwIChzdHJpbmcpIE5hbWUgb2YgYW4gYXR0cmlidXRlLCByZWYsIG9yIGNvbGxlY3Rpb25cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4vLyAgIFRoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQgb24gdGhlIGNoaWxkIG5vZGUuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuLy8gICBjaGlsZCwgYW5kIHRoZSBjb25zdHJhaW50IGVkaXRvciBvcGVuZWQgIG9uIHRoYXQgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIG1vZGUsIHApe1xuICAgIGxldCBuO1xuICAgIGxldCBjYztcbiAgICBsZXQgc2ZzO1xuICAgIGlmIChtb2RlID09PSBcInN1bW1hcnlmaWVsZHNcIikge1xuICAgICAgICBzZnMgPSBjdXJyTWluZS5zdW1tYXJ5RmllbGRzW2N1cnJOb2RlLm5vZGVUeXBlLm5hbWVdfHxbXTtcbiAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBjdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgIGxldCBtID0gYWRkUGF0aChjdXJyVGVtcGxhdGUsIHNmLCBjdXJyTWluZS5tb2RlbCk7XG4gICAgICAgICAgICBpZiAoISBtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtLnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHAgPSBjdXJyTm9kZS5wYXRoICsgXCIuXCIgKyBwO1xuICAgICAgICBuID0gYWRkUGF0aChjdXJyVGVtcGxhdGUsIHAsIGN1cnJNaW5lLm1vZGVsICk7XG4gICAgICAgIGlmIChtb2RlID09PSBcInNlbGVjdGVkXCIpXG4gICAgICAgICAgICAhbi5pc1NlbGVjdGVkICYmIG4uc2VsZWN0KCk7XG4gICAgICAgIGlmIChtb2RlID09PSBcImNvbnN0cmFpbmVkXCIpIHtcbiAgICAgICAgICAgIGNjID0gYWRkQ29uc3RyYWludChuLCBmYWxzZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKGN1cnJOb2RlKTtcbiAgICBpZiAobW9kZSAhPT0gXCJvcGVuXCIpXG4gICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgIGlmIChtb2RlICE9PSBcInN1bW1hcnlmaWVsZHNcIikgXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNob3dEaWFsb2cobik7XG4gICAgICAgICAgICBjYyAmJiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWRpdENvbnN0cmFpbnQoY2MsIG4pXG4gICAgICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbiAgICBcbn1cbi8vIFJldHVybnMgYSB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIGEgY29uc3RyYWludFxuLy9cbmZ1bmN0aW9uIGNvbnN0cmFpbnRUZXh0KGMpIHtcbiAgIHZhciB0ID0gXCI/XCI7XG4gICBpZiAoIWMpIHJldHVybiB0O1xuICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIil7XG4gICAgICAgdCA9IFwiSVNBIFwiICsgKGMudHlwZSB8fCBcIj9cIik7XG4gICB9XG4gICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlO1xuICAgfVxuICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlO1xuICAgICAgIGlmIChjLmV4dHJhVmFsdWUpIHQgPSB0ICsgXCIgSU4gXCIgKyBjLmV4dHJhVmFsdWU7XG4gICB9XG4gICBlbHNlIGlmIChjLnZhbHVlICE9PSB1bmRlZmluZWQpe1xuICAgICAgIHQgPSBjLm9wICsgKGMub3AuaW5jbHVkZXMoXCJOVUxMXCIpID8gXCJcIiA6IFwiIFwiICsgYy52YWx1ZSlcbiAgIH1cbiAgIGVsc2UgaWYgKGMudmFsdWVzICE9PSB1bmRlZmluZWQpe1xuICAgICAgIHQgPSBjLm9wICsgXCIgXCIgKyBjLnZhbHVlc1xuICAgfVxuICAgcmV0dXJuIChjLmNvZGUgPyBcIihcIitjLmNvZGUrXCIpIFwiIDogXCJcIikgKyB0O1xufVxuXG4vLyBSZXR1cm5zICB0aGUgRE9NIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gZGF0YSBvYmplY3QuXG4vL1xuZnVuY3Rpb24gZmluZERvbUJ5RGF0YU9iaihkKXtcbiAgICB2YXIgeCA9IGQzLnNlbGVjdEFsbChcIi5ub2RlZ3JvdXAgLm5vZGVcIikuZmlsdGVyKGZ1bmN0aW9uKGRkKXsgcmV0dXJuIGRkID09PSBkOyB9KTtcbiAgICByZXR1cm4geFswXVswXTtcbn1cblxuLy9cbmZ1bmN0aW9uIG9wVmFsaWRGb3Iob3AsIG4pe1xuICAgIGlmKCFuLnBhcmVudCAmJiAhb3AudmFsaWRGb3JSb290KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodHlwZW9mKG4ucHR5cGUpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBpZighIG9wLnZhbGlkRm9yQXR0cilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZiggb3AudmFsaWRUeXBlcyAmJiBvcC52YWxpZFR5cGVzLmluZGV4T2Yobi5wdHlwZSkgPT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYobi5wdHlwZS5uYW1lICYmICEgb3AudmFsaWRGb3JDbGFzcykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlQ0VpbnB1dHMoYywgb3Ape1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlID0gb3AgfHwgYy5vcDtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpLnRleHQoYy5jb2RlKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy5jdHlwZT09PVwibnVsbFwiID8gXCJcIiA6IGMudmFsdWU7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpWzBdWzBdLnZhbHVlID0gZGVlcGMoYy52YWx1ZXMpO1xufVxuXG4vLyBBcmdzOlxuLy8gICBzZWxlY3RvciAoc3RyaW5nKSBGb3Igc2VsZWN0aW5nIHRoZSA8c2VsZWN0PiBlbGVtZW50XG4vLyAgIGRhdGEgKGxpc3QpIERhdGEgdG8gYmluZCB0byBvcHRpb25zXG4vLyAgIGNmZyAob2JqZWN0KSBBZGRpdGlvbmFsIG9wdGlvbmFsIGNvbmZpZ3M6XG4vLyAgICAgICB0aXRsZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgZm9yIHNldHRpbmcgdGhlIHRleHQgb2YgdGhlIG9wdGlvbi4gXG4vLyAgICAgICB2YWx1ZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgc2V0dGluZyB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvblxuLy8gICAgICAgc2VsZWN0ZWQgLSBmdW5jdGlvbiBvciBhcnJheSBvciBzdHJpbmcgZm9yIGRlY2lkaW5nIHdoaWNoIG9wdGlvbihzKSBhcmUgc2VsZWN0ZWRcbi8vICAgICAgICAgIElmIGZ1bmN0aW9uLCBjYWxsZWQgZm9yIGVhY2ggb3B0aW9uLlxuLy8gICAgICAgICAgSWYgYXJyYXksIHNwZWNpZmllcyB0aGUgdmFsdWVzIHRoZSBzZWxlY3QuXG4vLyAgICAgICAgICBJZiBzdHJpbmcsIHNwZWNpZmllcyB3aGljaCB2YWx1ZSBpcyBzZWxlY3RlZFxuLy8gICAgICAgZW1wdHlNZXNzYWdlIC0gYSBtZXNzYWdlIHRvIHNob3cgaWYgdGhlIGRhdGEgbGlzdCBpcyBlbXB0eVxuLy8gICAgICAgbXVsdGlwbGUgLSBpZiB0cnVlLCBtYWtlIGl0IGEgbXVsdGktc2VsZWN0IGxpc3Rcbi8vXG5mdW5jdGlvbiBpbml0T3B0aW9uTGlzdChzZWxlY3RvciwgZGF0YSwgY2ZnKXtcbiAgICBcbiAgICBjZmcgPSBjZmcgfHwge307XG5cbiAgICB2YXIgaWRlbnQgPSAoeD0+eCk7XG4gICAgdmFyIG9wdHM7XG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApe1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgY2ZnLnZhbHVlIHx8IGlkZW50KVxuICAgICAgICAgICAgLnRleHQoY2ZnLnRpdGxlIHx8IGlkZW50KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBudWxsKVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBudWxsKTtcbiAgICAgICAgaWYgKHR5cGVvZihjZmcuc2VsZWN0ZWQpID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIGZ1bmN0aW9uIHNheXMgc29cbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkKGQpfHxudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNmZy5zZWxlY3RlZCkpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBpcyBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkLmluZGV4T2YoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkpICE9IC0xIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNmZy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIG1hdGNoZXNcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpID09PSBjZmcuc2VsZWN0ZWQpIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHNlbGVjdG9yKVswXVswXS5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKFtjZmcuZW1wdHlNZXNzYWdlfHxcImVtcHR5IGxpc3RcIl0pO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIG9wdHMudGV4dChpZGVudCkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cbiAgICAvLyBzZXQgbXVsdGkgc2VsZWN0IChvciBub3QpXG4gICAgZDMuc2VsZWN0KHNlbGVjdG9yKS5hdHRyKFwibXVsdGlwbGVcIiwgY2ZnLm11bHRpcGxlIHx8IG51bGwpO1xuICAgIC8vIGFsbG93IGNhbGxlciB0byBjaGFpblxuICAgIHJldHVybiBvcHRzO1xufVxuXG4vLyBJbml0aWFsaXplcyB0aGUgaW5wdXQgZWxlbWVudHMgaW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZyb20gdGhlIGdpdmVuIGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gaW5pdENFaW5wdXRzKG4sIGMsIGN0eXBlKSB7XG5cbiAgICAvLyBQb3B1bGF0ZSB0aGUgb3BlcmF0b3Igc2VsZWN0IGxpc3Qgd2l0aCBvcHMgYXBwcm9wcmlhdGUgZm9yIHRoZSBwYXRoXG4gICAgLy8gYXQgdGhpcyBub2RlLlxuICAgIGlmICghY3R5cGUpIFxuICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cIm9wXCJdJywgXG4gICAgICAgIE9QUy5maWx0ZXIoZnVuY3Rpb24ob3ApeyByZXR1cm4gb3BWYWxpZEZvcihvcCwgbik7IH0pLFxuICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGQgPT4gZC5vcCxcbiAgICAgICAgdGl0bGU6IGQgPT4gZC5vcCxcbiAgICAgICAgc2VsZWN0ZWQ6Yy5vcFxuICAgICAgICB9KTtcbiAgICAvL1xuICAgIC8vXG4gICAgY3R5cGUgPSBjdHlwZSB8fCBjLmN0eXBlO1xuXG4gICAgbGV0IGNlID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIik7XG4gICAgbGV0IHNtemQgPSBjZS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcbiAgICBjZS5hdHRyKFwiY2xhc3NcIiwgXCJvcGVuIFwiICsgY3R5cGUpXG4gICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCBzbXpkKVxuICAgICAgICAuY2xhc3NlZChcImJpb2VudGl0eVwiLCAgbi5pc0Jpb0VudGl0eSk7XG5cbiBcbiAgICAvL1xuICAgIC8vIHNldC9yZW1vdmUgdGhlIFwibXVsdGlwbGVcIiBhdHRyaWJ1dGUgb2YgdGhlIHNlbGVjdCBlbGVtZW50IGFjY29yZGluZyB0byBjdHlwZVxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAuYXR0cihcIm11bHRpcGxlXCIsIGZ1bmN0aW9uKCl7IHJldHVybiBjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIgfHwgbnVsbDsgfSk7XG5cbiAgICAvL1xuICAgIGlmIChjdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgW1wiQW55XCJdLmNvbmNhdChjdXJyTWluZS5vcmdhbmlzbUxpc3QpLFxuICAgICAgICAgICAgeyBzZWxlY3RlZDogYy5leHRyYVZhbHVlIH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIG9wdGlvbiBsaXN0IG9mIHN1YmNsYXNzIG5hbWVzXG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIG4ucGFyZW50ID8gZ2V0U3ViY2xhc3NlcyhuLnBjb21wLmtpbmQgPyBuLnBjb21wLnR5cGUgOiBuLnBjb21wKSA6IFtdLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIHN1YmNsYXNzZXMpXCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogZnVuY3Rpb24oZCl7IFxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG9uZSB3aG9zZSBuYW1lIG1hdGNoZXMgdGhlIG5vZGUncyB0eXBlIGFuZCBzZXQgaXRzIHNlbGVjdGVkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIHZhciBtYXRjaGVzID0gZC5uYW1lID09PSAoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLm5hbWUgfHwgbi5wdHlwZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIGN1cnJNaW5lLmxpc3RzLmZpbHRlcihmdW5jdGlvbiAobCkgeyByZXR1cm4gaXNWYWxpZExpc3RDb25zdHJhaW50KGwsIGN1cnJOb2RlKTsgfSksXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBsaXN0cylcIixcbiAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYyk7XG4gICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICAvL2xldCBhY3MgPSBnZXRMb2NhbChcImF1dG9jb21wbGV0ZVwiLCB0cnVlLCBbXSk7XG4gICAgICAgIC8vIGRpc2FibGUgdGhpcyBmb3Igbm93LlxuICAgICAgICBsZXQgYWNzID0gW107XG4gICAgICAgIGlmIChhY3MuaW5kZXhPZihhdHRyKSAhPT0gLTEpXG4gICAgICAgICAgICBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiVW5yZWNvZ25pemVkIGN0eXBlOiBcIiArIGN0eXBlXG4gICAgfVxuICAgIFxufVxuXG4vLyBPcGVucyB0aGUgY29uc3RyYWludCBlZGl0b3IgZm9yIGNvbnN0cmFpbnQgYyBvZiBub2RlIG4uXG4vL1xuZnVuY3Rpb24gb3BlbkNvbnN0cmFpbnRFZGl0b3IoYywgbil7XG5cbiAgICAvLyBOb3RlIGlmIHRoaXMgaXMgaGFwcGVuaW5nIGF0IHRoZSByb290IG5vZGVcbiAgICB2YXIgaXNyb290ID0gISBuLnBhcmVudDtcbiBcbiAgICAvLyBGaW5kIHRoZSBkaXYgZm9yIGNvbnN0cmFpbnQgYyBpbiB0aGUgZGlhbG9nIGxpc3RpbmcuIFdlIHdpbGxcbiAgICAvLyBvcGVuIHRoZSBjb25zdHJhaW50IGVkaXRvciBvbiB0b3Agb2YgaXQuXG4gICAgdmFyIGNkaXY7XG4gICAgZDMuc2VsZWN0QWxsKFwiI2RpYWxvZyAuY29uc3RyYWludFwiKVxuICAgICAgICAuZWFjaChmdW5jdGlvbihjYyl7IGlmKGNjID09PSBjKSBjZGl2ID0gdGhpczsgfSk7XG4gICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBjb25zdHJhaW50J3MgY29udGFpbmVyIGRpdlxuICAgIHZhciBjYmIgPSBjZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgYXBwJ3MgbWFpbiBib2R5IGVsZW1lbnRcbiAgICB2YXIgZGJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIC8vIHBvc2l0aW9uIHRoZSBjb25zdHJhaW50IGVkaXRvciBvdmVyIHRoZSBjb25zdHJhaW50IGluIHRoZSBkaWFsb2dcbiAgICB2YXIgY2VkID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBjLmN0eXBlKVxuICAgICAgICAuY2xhc3NlZChcIm9wZW5cIiwgdHJ1ZSlcbiAgICAgICAgLnN0eWxlKFwidG9wXCIsIChjYmIudG9wIC0gZGJiLnRvcCkrXCJweFwiKVxuICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChjYmIubGVmdCAtIGRiYi5sZWZ0KStcInB4XCIpXG4gICAgICAgIDtcblxuICAgIC8vIEluaXQgdGhlIGNvbnN0cmFpbnQgY29kZSBcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpXG4gICAgICAgIC50ZXh0KGMuY29kZSk7XG5cbiAgICBpbml0Q0VpbnB1dHMobiwgYyk7XG5cbiAgICAvLyBXaGVuIHVzZXIgc2VsZWN0cyBhbiBvcGVyYXRvciwgYWRkIGEgY2xhc3MgdG8gdGhlIGMuZS4ncyBjb250YWluZXJcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBvcCA9IE9QSU5ERVhbdGhpcy52YWx1ZV07XG4gICAgICAgICAgICBpbml0Q0VpbnB1dHMobiwgYywgb3AuY3R5cGUpO1xuICAgICAgICB9KVxuICAgICAgICA7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBjYW5jZWxDb25zdHJhaW50RWRpdG9yKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zYXZlXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IHNhdmVDb25zdHJhaW50RWRpdHMobiwgYykgfSk7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnN5bmNcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpIH0pO1xuXG59XG4vLyBHZW5lcmF0ZXMgYW4gb3B0aW9uIGxpc3Qgb2YgZGlzdGluY3QgdmFsdWVzIHRvIHNlbGVjdCBmcm9tLlxuLy8gQXJnczpcbi8vICAgbiAgKG5vZGUpICBUaGUgbm9kZSB3ZSdyZSB3b3JraW5nIG9uLiBNdXN0IGJlIGFuIGF0dHJpYnV0ZSBub2RlLlxuLy8gICBjICAoY29uc3RyYWludCkgVGhlIGNvbnN0cmFpbnQgdG8gZ2VuZXJhdGUgdGhlIGxpc3QgZm9yLlxuLy8gTkI6IE9ubHkgdmFsdWUgYW5kIG11bHRpdmF1ZSBjb25zdHJhaW50cyBjYW4gYmUgc3VtbWFyaXplZCBpbiB0aGlzIHdheS4gIFxuZnVuY3Rpb24gZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpe1xuICAgIC8vIFRvIGdldCB0aGUgbGlzdCwgd2UgaGF2ZSB0byBydW4gdGhlIGN1cnJlbnQgcXVlcnkgd2l0aCBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciwgXG4gICAgLy8gc3VtbWFyeVBhdGgsIHdoaWNoIGlzIHRoZSBwYXRoIHdlIHdhbnQgZGlzdGluY3QgdmFsdWVzIGZvci4gXG4gICAgLy8gQlVUIE5PVEUsIHdlIGhhdmUgdG8gcnVuIHRoZSBxdWVyeSAqd2l0aG91dCogY29uc3RyYWludCBjISFcbiAgICAvLyBFeGFtcGxlOiBzdXBwb3NlIHdlIGhhdmUgYSBxdWVyeSB3aXRoIGEgY29uc3RyYWludCBhbGxlbGVUeXBlPVRhcmdldGVkLFxuICAgIC8vIGFuZCB3ZSB3YW50IHRvIGNoYW5nZSBpdCB0byBTcG9udGFuZW91cy4gV2Ugb3BlbiB0aGUgYy5lLiwgYW5kIHRoZW4gY2xpY2sgdGhlXG4gICAgLy8gc3luYyBidXR0b24gdG8gZ2V0IGEgbGlzdC4gSWYgd2UgcnVuIHRoZSBxdWVyeSB3aXRoIGMgaW50YWN0LCB3ZSdsbCBnZXQgYSBsaXN0XG4gICAgLy8gY29udGFpbmludCBvbmx5IFwiVGFyZ2V0ZWRcIi4gRG9oIVxuICAgIC8vIEFOT1RIRVIgTk9URTogdGhlIHBhdGggaW4gc3VtbWFyeVBhdGggbXVzdCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBwcm9wZXIuIFRoZSBhcHByb2FjaFxuICAgIC8vIGhlcmUgaXMgdG8gZW5zdXJlIGl0IGJ5IGFkZGluZyB0aGUgcGF0aCB0byB0aGUgdmlldyBsaXN0LlxuXG4gICAgbGV0IGN2YWxzID0gW107XG4gICAgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGN2YWxzID0gYy52YWx1ZXM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBjdmFscyA9IFsgYy52YWx1ZSBdO1xuICAgIH1cblxuICAgIC8vIFNhdmUgdGhpcyBjaG9pY2UgaW4gbG9jYWxTdG9yYWdlXG4gICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgbGV0IGtleSA9IFwiYXV0b2NvbXBsZXRlXCI7XG4gICAgbGV0IGxzdDtcbiAgICBsc3QgPSBnZXRMb2NhbChrZXksIHRydWUsIFtdKTtcbiAgICBpZihsc3QuaW5kZXhPZihhdHRyKSA9PT0gLTEpIGxzdC5wdXNoKGF0dHIpO1xuICAgIHNldExvY2FsKGtleSwgbHN0LCB0cnVlKTtcblxuICAgIGNsZWFyTG9jYWwoKTtcblxuICAgIC8vIGJ1aWxkIHRoZSBxdWVyeVxuICAgIGxldCBwID0gbi5wYXRoOyAvLyB3aGF0IHdlIHdhbnQgdG8gc3VtbWFyaXplXG4gICAgLy9cbiAgICBsZXQgbGV4ID0gY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYzsgLy8gc2F2ZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJcbiAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIGZhbHNlKTsgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIHRoZSBjb25zdHJhaW50XG4gICAgbGV0IGogPSB1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpO1xuICAgIGouc2VsZWN0LnB1c2gocCk7IC8vIG1ha2Ugc3VyZSBwIGlzIHBhcnQgb2YgdGhlIHF1ZXJ5XG4gICAgY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyA9IGxleDsgLy8gcmVzdG9yZSB0aGUgbG9naWMgZXhwclxuICAgIGFkZENvbnN0cmFpbnQobiwgZmFsc2UsIGMpOyAvLyByZS1hZGQgdGhlIGNvbnN0cmFpbnRcblxuICAgIC8vIGJ1aWxkIHRoZSB1cmxcbiAgICBsZXQgeCA9IGpzb24yeG1sKGosIHRydWUpO1xuICAgIGxldCBlID0gZW5jb2RlVVJJQ29tcG9uZW50KHgpO1xuICAgIGxldCB1cmwgPSBgJHtjdXJyTWluZS51cmx9L3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9zdW1tYXJ5UGF0aD0ke3B9JmZvcm1hdD1qc29ucm93cyZxdWVyeT0ke2V9YFxuICAgIGxldCB0aHJlc2hvbGQgPSAyNTA7XG5cbiAgICAvLyBzaWduYWwgdGhhdCB3ZSdyZSBzdGFydGluZ1xuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgdHJ1ZSk7XG4gICAgLy8gZ28hXG4gICAgZDNqc29uUHJvbWlzZSh1cmwpLnRoZW4oZnVuY3Rpb24oanNvbil7XG4gICAgICAgIC8vIFRoZSBsaXN0IG9mIHZhbHVlcyBpcyBpbiBqc29uLnJldWx0cy5cbiAgICAgICAgLy8gRWFjaCBsaXN0IGl0ZW0gbG9va3MgbGlrZTogeyBpdGVtOiBcInNvbWVzdHJpbmdcIiwgY291bnQ6IDE3IH1cbiAgICAgICAgLy8gKFllcywgd2UgZ2V0IGNvdW50cyBmb3IgZnJlZSEgT3VnaHQgdG8gbWFrZSB1c2Ugb2YgdGhpcy4pXG4gICAgICAgIC8vXG4gICAgICAgIGxldCByZXMgPSBqc29uLnJlc3VsdHMubWFwKHIgPT4gci5pdGVtKS5zb3J0KCk7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBsZXQgYW5zID0gcHJvbXB0KGBUaGVyZSBhcmUgJHtyZXMubGVuZ3RofSByZXN1bHRzLCB3aGljaCBleGNlZWRzIHRoZSB0aHJlc2hvbGQgb2YgJHt0aHJlc2hvbGR9LiBIb3cgbWFueSBkbyB5b3Ugd2FudCB0byBzaG93P2AsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICBpZiAoYW5zID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbnMgPSBwYXJzZUludChhbnMpO1xuICAgICAgICAgICAgaWYgKGlzTmFOKGFucykgfHwgYW5zIDw9IDApIHJldHVybjtcbiAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBhbnMpO1xuICAgICAgICB9XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3InKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHRydWUpO1xuICAgICAgICBsZXQgb3B0cyA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAgICAgICAgIC5kYXRhKHJlcyk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIik7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLmF0dHIoXCJ2YWx1ZVwiLCBkID0+IGQpXG4gICAgICAgICAgICAudGV4dCggZCA9PiBkIClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjdmFscy5pbmRleE9mKGQpICE9PSAtMSB8fCBudWxsKTtcbiAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpO1xuICAgIH0pXG59XG4vL1xuZnVuY3Rpb24gY2FuY2VsQ29uc3RyYWludEVkaXRvcihuLCBjKXtcbiAgICBpZiAoISBjLnNhdmVkKSB7XG4gICAgICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdHJ1ZSk7XG4gICAgfVxuICAgIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG59XG5mdW5jdGlvbiBoaWRlQ29uc3RyYWludEVkaXRvcigpe1xuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpO1xufVxuLy9cbmZ1bmN0aW9uIGVkaXRDb25zdHJhaW50KGMsIG4pe1xuICAgIG9wZW5Db25zdHJhaW50RWRpdG9yKGMsIG4pO1xufVxuLy8gUmV0dXJucyBhIHNpbmdsZSBjaGFyYWN0ZXIgY29uc3RyYWludCBjb2RlIGluIHRoZSByYW5nZSBBLVogdGhhdCBpcyBub3QgYWxyZWFkeVxuLy8gdXNlZCBpbiB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4vL1xuZnVuY3Rpb24gbmV4dEF2YWlsYWJsZUNvZGUodG1wbHQpe1xuICAgIGZvcih2YXIgaT0gXCJBXCIuY2hhckNvZGVBdCgwKTsgaSA8PSBcIlpcIi5jaGFyQ29kZUF0KDApOyBpKyspe1xuICAgICAgICB2YXIgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgICAgIGlmICghIChjIGluIHRtcGx0LmNvZGUyYykpXG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbi8vIEFkZHMgYSBuZXcgY29uc3RyYWludCB0byBhIG5vZGUgYW5kIHJldHVybnMgaXQuXG4vLyBBcmdzOlxuLy8gICBuIChub2RlKSBUaGUgbm9kZSB0byBhZGQgdGhlIGNvbnN0cmFpbnQgdG8uIFJlcXVpcmVkLlxuLy8gICB1cGRhdGVVSSAoYm9vbGVhbikgSWYgdHJ1ZSwgdXBkYXRlIHRoZSBkaXNwbGF5LiBJZiBmYWxzZSBvciBub3Qgc3BlY2lmaWVkLCBubyB1cGRhdGUuXG4vLyAgIGMgKGNvbnN0cmFpbnQpIElmIGdpdmVuLCB1c2UgdGhhdCBjb25zdHJhaW50LiBPdGhlcndpc2UgYXV0b2dlbmVyYXRlLlxuLy8gUmV0dXJuczpcbi8vICAgVGhlIG5ldyBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIGFkZENvbnN0cmFpbnQobiwgdXBkYXRlVUksIGMpIHtcbiAgICBpZiAoYykge1xuICAgICAgICAvLyBqdXN0IHRvIGJlIHN1cmVcbiAgICAgICAgYy5ub2RlID0gbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBvcCA9IE9QSU5ERVhbbi5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiID8gXCI9XCIgOiBcIkxPT0tVUFwiXTtcbiAgICAgICAgYyA9IG5ldyBDb25zdHJhaW50KHtub2RlOm4sIG9wOm9wLm9wLCBjdHlwZTogb3AuY3R5cGV9KTtcbiAgICB9XG4gICAgbi5jb25zdHJhaW50cy5wdXNoKGMpO1xuICAgIG4udGVtcGxhdGUud2hlcmUucHVzaChjKTtcbiAgICBpZiAoYy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIGMuY29kZSA9IG5leHRBdmFpbGFibGVDb2RlKG4udGVtcGxhdGUpO1xuICAgICAgICBuLnRlbXBsYXRlLmNvZGUyY1tjLmNvZGVdID0gYztcbiAgICAgICAgc2V0TG9naWNFeHByZXNzaW9uKG4udGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBuLnRlbXBsYXRlKTtcbiAgICB9XG4gICAgLy9cbiAgICBpZiAodXBkYXRlVUkpIHtcbiAgICAgICAgdXBkYXRlKG4pO1xuICAgICAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgICAgICBlZGl0Q29uc3RyYWludChjLCBuKTtcbiAgICB9XG4gICAgLy9cbiAgICByZXR1cm4gYztcbn1cblxuLy9cbmZ1bmN0aW9uIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdXBkYXRlVUkpe1xuICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgY3VyclRlbXBsYXRlLndoZXJlID0gY3VyclRlbXBsYXRlLndoZXJlLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgZGVsZXRlIGN1cnJUZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXTtcbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSBuLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7XG4gICAgc2V0TG9naWNFeHByZXNzaW9uKGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMsIGN1cnJUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICBpZiAodXBkYXRlVUkpIHtcbiAgICAgICAgdXBkYXRlKG4pO1xuICAgICAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gYztcbn1cbi8vXG5mdW5jdGlvbiBzYXZlQ29uc3RyYWludEVkaXRzKG4sIGMpe1xuICAgIC8vXG4gICAgbGV0IG8gPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZTtcbiAgICBjLnNldE9wKG8pO1xuICAgIGMuc2F2ZWQgPSB0cnVlO1xuICAgIC8vXG4gICAgbGV0IHZhbCA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlO1xuICAgIGxldCB2YWxzID0gW107XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpXG4gICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHZhbHMucHVzaCh0aGlzLnZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICBsZXQgeiA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3InKS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcblxuICAgIGlmIChjLmN0eXBlID09PSBcIm51bGxcIil7XG4gICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICBjLnR5cGUgPSB2YWxzWzBdXG4gICAgICAgIGMudmFsdWUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIHNldFN1YmNsYXNzQ29uc3RyYWludChuLCBjLnR5cGUpXG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHZhbDtcbiAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICBjLmV4dHJhVmFsdWUgPSB2YWxzWzBdID09PSBcIkFueVwiID8gbnVsbCA6IHZhbHNbMF07XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB2YWxzWzBdO1xuICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHogPyB2YWxzWzBdIDogdmFsO1xuICAgICAgICBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIlVua25vd24gY3R5cGU6IFwiK2MuY3R5cGU7XG4gICAgfVxuICAgIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG4gICAgdXBkYXRlKG4pO1xuICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgc2F2ZVN0YXRlKCk7XG59XG5cbi8vIE9wZW5zIGEgZGlhbG9nIG9uIHRoZSBzcGVjaWZpZWQgbm9kZS5cbi8vIEFsc28gbWFrZXMgdGhhdCBub2RlIHRoZSBjdXJyZW50IG5vZGUuXG4vLyBBcmdzOlxuLy8gICBuICAgIHRoZSBub2RlXG4vLyAgIGVsdCAgdGhlIERPTSBlbGVtZW50IChlLmcuIGEgY2lyY2xlKVxuLy8gUmV0dXJuc1xuLy8gICBzdHJpbmdcbi8vIFNpZGUgZWZmZWN0OlxuLy8gICBzZXRzIGdsb2JhbCBjdXJyTm9kZVxuLy9cbmZ1bmN0aW9uIHNob3dEaWFsb2cobiwgZWx0LCByZWZyZXNoT25seSl7XG4gIGlmICghZWx0KSBlbHQgPSBmaW5kRG9tQnlEYXRhT2JqKG4pO1xuICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xuIFxuICAvLyBTZXQgdGhlIGdsb2JhbCBjdXJyTm9kZVxuICBjdXJyTm9kZSA9IG47XG4gIHZhciBpc3Jvb3QgPSAhIGN1cnJOb2RlLnBhcmVudDtcbiAgLy8gTWFrZSBub2RlIHRoZSBkYXRhIG9iaiBmb3IgdGhlIGRpYWxvZ1xuICB2YXIgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKS5kYXR1bShuKTtcbiAgLy8gQ2FsY3VsYXRlIGRpYWxvZydzIHBvc2l0aW9uXG4gIHZhciBkYmIgPSBkaWFsb2dbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBlYmIgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBiYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB0ID0gKGViYi50b3AgLSBiYmIudG9wKSArIGViYi53aWR0aC8yO1xuICB2YXIgYiA9IChiYmIuYm90dG9tIC0gZWJiLmJvdHRvbSkgKyBlYmIud2lkdGgvMjtcbiAgdmFyIGwgPSAoZWJiLmxlZnQgLSBiYmIubGVmdCkgKyBlYmIuaGVpZ2h0LzI7XG4gIHZhciBkaXIgPSBcImRcIiA7IC8vIFwiZFwiIG9yIFwidVwiXG4gIC8vIE5COiBjYW4ndCBnZXQgb3BlbmluZyB1cCB0byB3b3JrLCBzbyBoYXJkIHdpcmUgaXQgdG8gZG93bi4gOi1cXFxuXG4gIC8vXG4gIGRpYWxvZ1xuICAgICAgLnN0eWxlKFwibGVmdFwiLCBsK1wicHhcIilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLCByZWZyZXNoT25seT9cInNjYWxlKDEpXCI6XCJzY2FsZSgxZS02KVwiKVxuICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgZmFsc2UpXG4gICAgICAuY2xhc3NlZChcImlzcm9vdFwiLCBpc3Jvb3QpXG4gICAgICA7XG4gIGlmIChkaXIgPT09IFwiZFwiKVxuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwidG9wXCIsIHQrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcImJvdHRvbVwiLCBudWxsKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAwJVwiKSA7XG4gIGVsc2VcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5zdHlsZShcInRvcFwiLCBudWxsKVxuICAgICAgICAgIC5zdHlsZShcImJvdHRvbVwiLCBiK1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm0tb3JpZ2luXCIsIFwiMCUgMTAwJVwiKSA7XG5cbiAgLy8gU2V0IHRoZSBkaWFsb2cgdGl0bGUgdG8gbm9kZSBuYW1lXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZGlhbG9nVGl0bGVcIl0gc3BhbicpXG4gICAgICAudGV4dChuLm5hbWUpO1xuICAvLyBTaG93IHRoZSBmdWxsIHBhdGhcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJmdWxsUGF0aFwiXSBkaXYnKVxuICAgICAgLnRleHQobi5wYXRoKTtcbiAgLy8gVHlwZSBhdCB0aGlzIG5vZGVcbiAgdmFyIHRwID0gbi5wdHlwZS5uYW1lIHx8IG4ucHR5cGU7XG4gIHZhciBzdHAgPSAobi5zdWJjbGFzc0NvbnN0cmFpbnQgJiYgbi5zdWJjbGFzc0NvbnN0cmFpbnQubmFtZSkgfHwgbnVsbDtcbiAgdmFyIHRzdHJpbmcgPSBzdHAgJiYgYDxzcGFuIHN0eWxlPVwiY29sb3I6IHB1cnBsZTtcIj4ke3N0cH08L3NwYW4+ICgke3RwfSlgIHx8IHRwXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwidHlwZVwiXSBkaXYnKVxuICAgICAgLmh0bWwodHN0cmluZyk7XG5cbiAgLy8gV2lyZSB1cCBhZGQgY29uc3RyYWludCBidXR0b25cbiAgZGlhbG9nLnNlbGVjdChcIiNkaWFsb2cgLmNvbnN0cmFpbnRTZWN0aW9uIC5hZGQtYnV0dG9uXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IGFkZENvbnN0cmFpbnQobiwgdHJ1ZSk7IH0pO1xuXG4gIC8vIEZpbGwgb3V0IHRoZSBjb25zdHJhaW50cyBzZWN0aW9uLiBGaXJzdCwgc2VsZWN0IGFsbCBjb25zdHJhaW50cy5cbiAgdmFyIGNvbnN0cnMgPSBkaWFsb2cuc2VsZWN0KFwiLmNvbnN0cmFpbnRTZWN0aW9uXCIpXG4gICAgICAuc2VsZWN0QWxsKFwiLmNvbnN0cmFpbnRcIilcbiAgICAgIC5kYXRhKG4uY29uc3RyYWludHMpO1xuICAvLyBFbnRlcigpOiBjcmVhdGUgZGl2cyBmb3IgZWFjaCBjb25zdHJhaW50IHRvIGJlIGRpc3BsYXllZCAgKFRPRE86IHVzZSBhbiBIVE1MNSB0ZW1wbGF0ZSBpbnN0ZWFkKVxuICAvLyAxLiBjb250YWluZXJcbiAgdmFyIGNkaXZzID0gY29uc3Rycy5lbnRlcigpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIixcImNvbnN0cmFpbnRcIikgO1xuICAvLyAyLiBvcGVyYXRvclxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJvcFwiKSA7XG4gIC8vIDMuIHZhbHVlXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcInZhbHVlXCIpIDtcbiAgLy8gNC4gY29uc3RyYWludCBjb2RlXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcImNvZGVcIikgO1xuICAvLyA1LiBidXR0b24gdG8gZWRpdCB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBlZGl0XCIpLnRleHQoXCJtb2RlX2VkaXRcIikuYXR0cihcInRpdGxlXCIsXCJFZGl0IHRoaXMgY29uc3RyYWludFwiKTtcbiAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBjYW5jZWxcIikudGV4dChcImRlbGV0ZV9mb3JldmVyXCIpLmF0dHIoXCJ0aXRsZVwiLFwiUmVtb3ZlIHRoaXMgY29uc3RyYWludFwiKTtcblxuICAvLyBSZW1vdmUgZXhpdGluZ1xuICBjb25zdHJzLmV4aXQoKS5yZW1vdmUoKSA7XG5cbiAgLy8gU2V0IHRoZSB0ZXh0IGZvciBlYWNoIGNvbnN0cmFpbnRcbiAgY29uc3Ryc1xuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihjKSB7IHJldHVybiBcImNvbnN0cmFpbnQgXCIgKyBjLmN0eXBlOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwiY29kZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMuY29kZSB8fCBcIj9cIjsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cIm9wXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5vcCB8fCBcIklTQVwiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwidmFsdWVcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgLy8gRklYTUUgXG4gICAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgKyAoYy5leHRyYVZhbHVlID8gXCIgaW4gXCIgKyBjLmV4dHJhVmFsdWUgOiBcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSB8fCAoYy52YWx1ZXMgJiYgYy52YWx1ZXMuam9pbihcIixcIikpIHx8IGMudHlwZTtcbiAgICAgIH0pO1xuICBjb25zdHJzLnNlbGVjdChcImkuZWRpdFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIGVkaXRDb25zdHJhaW50KGMsIG4pO1xuICAgICAgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KFwiaS5jYW5jZWxcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGMpeyBcbiAgICAgICAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIHRydWUpO1xuICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgfSlcblxuXG4gIC8vIFRyYW5zaXRpb24gdG8gXCJncm93XCIgdGhlIGRpYWxvZyBvdXQgb2YgdGhlIG5vZGVcbiAgZGlhbG9nLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxLjApXCIpO1xuXG4gIC8vXG4gIHZhciB0ID0gbi5wY29tcC50eXBlO1xuICBpZiAodHlwZW9mKHQpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAvLyBkaWFsb2cgZm9yIHNpbXBsZSBhdHRyaWJ1dGVzLlxuICAgICAgZGlhbG9nXG4gICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIix0cnVlKTtcbiAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUubmFtZSB8fCBuLnBjb21wLnR5cGUgKTtcbiAgICAgIC8vIFxuICAgICAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJzZWxlY3QtY3RybFwiXScpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZCB9KTtcbiAgICAgIC8vIFxuICAgICAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJzb3J0LWN0cmxcIl0nKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICB9XG4gIGVsc2Uge1xuICAgICAgLy8gRGlhbG9nIGZvciBjbGFzc2VzXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLGZhbHNlKTtcbiAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUgPyBuLnBjb21wLnR5cGUubmFtZSA6IG4ucGNvbXAubmFtZSk7XG5cbiAgICAgIC8vIHdpcmUgdXAgdGhlIGJ1dHRvbiB0byBzaG93IHN1bW1hcnkgZmllbGRzXG4gICAgICBkaWFsb2cuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2hvd1N1bW1hcnlcIl0nKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHNlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzdW1tYXJ5ZmllbGRzXCIpKTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgdGFibGUgbGlzdGluZyBhbGwgdGhlIGF0dHJpYnV0ZXMvcmVmcy9jb2xsZWN0aW9ucy5cbiAgICAgIHZhciB0YmwgPSBkaWFsb2cuc2VsZWN0KFwidGFibGUuYXR0cmlidXRlc1wiKTtcbiAgICAgIHZhciByb3dzID0gdGJsLnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLmFsbFBhcnRzKVxuICAgICAgICAgIDtcbiAgICAgIHJvd3MuZW50ZXIoKS5hcHBlbmQoXCJ0clwiKTtcbiAgICAgIHJvd3MuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgdmFyIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoXCJ0ZFwiKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICAgICAgaWYgKGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIikge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIlNlbGVjdCB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ3NlbGVjdHNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcInNlbGVjdGVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkNvbnN0cmFpbiB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ2NvbnN0cmFpbnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcImNvbnN0cmFpbmVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogYDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkZvbGxvdyB0aGlzICR7Y29tcC5raW5kfVwiPnBsYXlfYXJyb3c8L2k+YCxcbiAgICAgICAgICAgICAgICAgIGNsczogJ29wZW5uZXh0JyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwib3BlblwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZW50ZXIoKS5hcHBlbmQoXCJ0ZFwiKTtcbiAgICAgIGNlbGxzXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5jbHM7fSlcbiAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLmNsaWNrICYmIGQuY2xpY2soKTsgfSlcbiAgICAgICAgICA7XG4gICAgICBjZWxscy5leGl0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuLy8gSGlkZXMgdGhlIGRpYWxvZy4gU2V0cyB0aGUgY3VycmVudCBub2RlIHRvIG51bGwuXG4vLyBBcmdzOlxuLy8gICBub25lXG4vLyBSZXR1cm5zXG4vLyAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gIEhpZGVzIHRoZSBkaWFsb2cuXG4vLyAgU2V0cyBjdXJyTm9kZSB0byBudWxsLlxuLy9cbmZ1bmN0aW9uIGhpZGVEaWFsb2coKXtcbiAgY3Vyck5vZGUgPSBudWxsO1xuICB2YXIgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKVxuICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgdHJ1ZSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbi8yKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxZS02KVwiKVxuICAgICAgO1xuICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpXG4gICAgICA7XG59XG5cbi8vIFNldCB0aGUgZWRpdGluZyB2aWV3LiBWaWV3IGlzIG9uZSBvZjpcbi8vIEFyZ3M6XG4vLyAgICAgdmlldyAoc3RyaW5nKSBPbmUgb2Y6IHF1ZXJ5TWFpbiwgY29uc3RyYWludExvZ2ljLCBjb2x1bW5PcmRlciwgc29ydE9yZGVyXG4vLyBSZXR1cm5zOlxuLy8gICAgIE5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgICBDaGFuZ2VzIHRoZSBsYXlvdXQgYW5kIHVwZGF0ZXMgdGhlIHZpZXcuXG5mdW5jdGlvbiBzZXRFZGl0Vmlldyh2aWV3KXtcbiAgICBsZXQgdiA9IGVkaXRWaWV3c1t2aWV3XTtcbiAgICBpZiAoIXYpIHRocm93IFwiVW5yZWNvZ25pemVkIHZpZXcgdHlwZTogXCIgKyB2aWV3O1xuICAgIGVkaXRWaWV3ID0gdjtcbiAgICBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyXCIpLmF0dHIoXCJjbGFzc1wiLCB2Lm5hbWUpO1xuICAgIHVwZGF0ZShyb290KTtcbn1cblxuZnVuY3Rpb24gZG9MYXlvdXQocm9vdCl7XG4gIHZhciBsYXlvdXQ7XG4gIGxldCBsZWF2ZXMgPSBbXTtcbiAgXG4gIGlmIChlZGl0Vmlldy5sYXlvdXRTdHlsZSA9PT0gXCJ0cmVlXCIpIHtcbiAgICAgIC8vIGQzIGxheW91dCBhcnJhbmdlcyBub2RlcyB0b3AtdG8tYm90dG9tLCBidXQgd2Ugd2FudCBsZWZ0LXRvLXJpZ2h0LlxuICAgICAgLy8gU28uLi5yZXZlcnNlIHdpZHRoIGFuZCBoZWlnaHQsIGFuZCBkbyB0aGUgbGF5b3V0LiBUaGVuLCByZXZlcnNlIHRoZSB4LHkgY29vcmRzIGluIHRoZSByZXN1bHRzLlxuICAgICAgbGF5b3V0ID0gZDMubGF5b3V0LnRyZWUoKS5zaXplKFtoLCB3XSk7XG4gICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgIG5vZGVzID0gbGF5b3V0Lm5vZGVzKHJvb3QpLnJldmVyc2UoKTtcbiAgICAgIC8vIFJldmVyc2UgeCBhbmQgeS4gQWxzbywgbm9ybWFsaXplIHggZm9yIGZpeGVkLWRlcHRoLlxuICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7XG4gICAgICAgICAgZC54ID0gZC5kZXB0aCAqIDE4MDtcbiAgICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgICAgLy8gZGVuZHJvZ3JhbVxuICAgICAgZnVuY3Rpb24gbWQgKG4pIHsgLy8gbWF4IGRlcHRoXG4gICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID09PSAwKSBsZWF2ZXMucHVzaChuKTtcbiAgICAgICAgICByZXR1cm4gMSArIChuLmNoaWxkcmVuLmxlbmd0aCA/IE1hdGgubWF4LmFwcGx5KG51bGwsIG4uY2hpbGRyZW4ubWFwKG1kKSkgOiAwKTtcbiAgICAgIH07XG4gICAgICBsZXQgbWF4ZCA9IG1kKHJvb3QpOyAvLyBtYXggZGVwdGgsIDEtYmFzZWRcbiAgICAgIGxheW91dCA9IGQzLmxheW91dC5jbHVzdGVyKClcbiAgICAgICAgICAuc2VwYXJhdGlvbigoYSxiKSA9PiAxKVxuICAgICAgICAgIC5zaXplKFtoLCBtYXhkICogMTgwXSk7XG4gICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgIG5vZGVzID0gbGF5b3V0Lm5vZGVzKHJvb3QpLnJldmVyc2UoKTtcbiAgICAgIG5vZGVzLmZvckVhY2goIGQgPT4geyBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDsgfSk7XG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuIFxuICAgICAgbGV0IHBvcyA9IGxlYXZlcy5tYXAoZnVuY3Rpb24obil7IHJldHVybiB7IHk6IG4ueSwgeTA6IG4ueTAgfTsgfSk7XG5cbiAgICAgIGxlYXZlcy5zb3J0KGVkaXRWaWV3Lm5vZGVDb21wKTtcblxuICAgICAgLy8gcmVhc3NpZ24gdGhlIFkgcG9zaXRpb25zXG4gICAgICBsZWF2ZXMuZm9yRWFjaChmdW5jdGlvbihuLCBpKXtcbiAgICAgICAgICBuLnkgPSBwb3NbaV0ueTtcbiAgICAgICAgICBuLnkwID0gcG9zW2ldLnkwO1xuICAgICAgfSk7XG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCBsZWF2ZXMgaGF2ZSBiZWVuIHJlYXJyYW5nZWQsIGJ1dCB0aGUgaW50ZXJpb3Igbm9kZXMgaGF2ZW4ndC5cbiAgICAgIC8vIEhlciB3ZSBtb3ZlIGludGVyaW9yIG5vZGVzIHRvd2FyZCB0aGVpciBcImNlbnRlciBvZiBncmF2aXR5XCIgYXMgZGVmaW5lZFxuICAgICAgLy8gYnkgdGhlIHBvc2l0aW9ucyBvZiB0aGVpciBjaGlsZHJlbi4gQXBwbHkgdGhpcyByZWN1cnNpdmVseSB1cCB0aGUgdHJlZS5cbiAgICAgIC8vIFxuICAgICAgLy8gTk9URSB0aGF0IHggYW5kIHkgY29vcmRpbmF0ZXMgYXJlIG9wcG9zaXRlIGF0IHRoaXMgcG9pbnQhXG4gICAgICAvL1xuICAgICAgLy8gTWFpbnRhaW4gYSBtYXAgb2Ygb2NjdXBpZWQgcG9zaXRpb25zOlxuICAgICAgbGV0IG9jY3VwaWVkID0ge30gOyAgLy8gb2NjdXBpZWRbeCBwb3NpdGlvbl0gPT0gW2xpc3Qgb2Ygbm9kZXNdXG4gICAgICBmdW5jdGlvbiBjb2cgKG4pIHtcbiAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIC8vIGNvbXB1dGUgbXkgYy5vLmcuIGFzIHRoZSBhdmVyYWdlIG9mIG15IGtpZHMnIHBvc2l0aW9uc1xuICAgICAgICAgICAgICBsZXQgbXlDb2cgPSAobi5jaGlsZHJlbi5tYXAoY29nKS5yZWR1Y2UoKHQsYykgPT4gdCtjLCAwKSkvbi5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgIGlmKG4ucGFyZW50KSBuLnkgPSBteUNvZztcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGRkID0gb2NjdXBpZWRbbi55XSA9IChvY2N1cGllZFtuLnldIHx8IFtdKTtcbiAgICAgICAgICBkZC5wdXNoKG4ueSk7XG4gICAgICAgICAgcmV0dXJuIG4ueTtcbiAgICAgIH1cbiAgICAgIGNvZyhyb290KTtcblxuICAgICAgLy8gVE9ETzogRmluYWwgYWRqdXN0bWVudHNcbiAgICAgIC8vIDEuIElmIHdlIGV4dGVuZCBvZmYgdGhlIHJpZ2h0IGVkZ2UsIGNvbXByZXNzLlxuICAgICAgLy8gMi4gSWYgaXRlbXMgYXQgc2FtZSB4IG92ZXJsYXAsIHNwcmVhZCB0aGVtIG91dCBpbiB5LlxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIH1cblxuICAvLyBzYXZlIGxpbmtzIGluIGdsb2JhbFxuICBsaW5rcyA9IGxheW91dC5saW5rcyhub2Rlcyk7XG5cbiAgcmV0dXJuIFtub2RlcywgbGlua3NdXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB1cGRhdGUobikgXG4vLyBUaGUgbWFpbiBkcmF3aW5nIHJvdXRpbmUuIFxuLy8gVXBkYXRlcyB0aGUgU1ZHLCB1c2luZyBuIGFzIHRoZSBzb3VyY2Ugb2YgYW55IGVudGVyaW5nL2V4aXRpbmcgYW5pbWF0aW9ucy5cbi8vXG5mdW5jdGlvbiB1cGRhdGUoc291cmNlKSB7XG4gIC8vXG4gIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIGVkaXRWaWV3Lm5hbWUpO1xuICBkb0xheW91dChyb290KTtcbiAgdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSk7XG4gIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpO1xuICB1cGRhdGVUdGV4dCgpO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSl7XG4gIGxldCBub2RlR3JwcyA9IHZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgO1xuXG4gIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAuYXR0cihcImlkXCIsIG4gPT4gbi5wYXRoLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54MCArIFwiLFwiICsgc291cmNlLnkwICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICBub2RlRW50ZXIuYXBwZW5kKGZ1bmN0aW9uKGQpe1xuICAgICAgdmFyIHNoYXBlID0gKGQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiID8gXCJyZWN0XCIgOiBcImNpcmNsZVwiKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgfSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuOyBcbiAgICAgICAgICBpZiAoY3Vyck5vZGUgIT09IGQpIHNob3dEaWFsb2coZCwgdGhpcyk7XG4gICAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9KTtcbiAgbm9kZUVudGVyLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcbiAgbm9kZUVudGVyLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieFwiLCAtOC41KVxuICAgICAgLmF0dHIoXCJ5XCIsIC04LjUpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcblxuICAvLyBBZGQgdGV4dCBmb3Igbm9kZSBuYW1lXG4gIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuY2hpbGRyZW4gPyAtMTAgOiAxMDsgfSlcbiAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBuZWFybHkgdHJhbnNwYXJlbnRcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVOYW1lXCIpXG4gICAgICA7XG5cbiAgLy8gUGxhY2Vob2xkZXIgZm9yIGljb24vdGV4dCB0byBhcHBlYXIgaW5zaWRlIG5vZGVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cignY2xhc3MnLCAnbm9kZUljb24nKVxuICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgIDtcblxuICAvLyBBZGQgbm9kZSBoYW5kbGVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cignY2xhc3MnLCAnaGFuZGxlJylcbiAgICAgIC5hdHRyKCdkeCcsIDEwKVxuICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgIDtcblxuICBsZXQgbm9kZVVwZGF0ZSA9IG5vZGVHcnBzXG4gICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIG4gPT4gbi5pc1NlbGVjdGVkKVxuICAgICAgLmNsYXNzZWQoXCJjb25zdHJhaW5lZFwiLCBuID0+IG4uY29uc3RyYWludHMubGVuZ3RoID4gMClcbiAgICAgIC5jbGFzc2VkKFwic29ydGVkXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5sZXZlbCA+PSAwKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRhc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImFzY1wiKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRkZXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJkZXNjXCIpXG4gICAgLy8gVHJhbnNpdGlvbiBub2RlcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24obikgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBuLnggKyBcIixcIiArIG4ueSArIFwiKVwiOyB9KVxuICAgICAgO1xuXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5oYW5kbGVcIilcbiAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIGVkaXRWaWV3LmhhbmRsZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgLnRleHQoZWRpdFZpZXcuaGFuZGxlSWNvbi50ZXh0IHx8IFwiXCIpIDtcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0Lm5vZGVJY29uXCIpXG4gICAgICAuYXR0cignZm9udC1mYW1pbHknLCBlZGl0Vmlldy5ub2RlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAudGV4dChlZGl0Vmlldy5ub2RlSWNvbi50ZXh0IHx8IFwiXCIpIDtcblxuICBub2RlVXBkYXRlLnNlbGVjdEFsbChcInRleHQubm9kZU5hbWVcIilcbiAgICAgIC50ZXh0KG4gPT4gbi5uYW1lKTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBNYWtlIHNlbGVjdGVkIG5vZGVzIGRyYWdnYWJsZS5cbiAgLy8gQ2xlYXIgb3V0IGFsbCBleGl0aW5nIGRyYWcgaGFuZGxlcnNcbiAgZDMuc2VsZWN0QWxsKFwiZy5ub2RlZ3JvdXBcIilcbiAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIGZhbHNlKVxuICAgICAgLnNlbGVjdChcIi5oYW5kbGVcIilcbiAgICAgICAgICAub24oXCIuZHJhZ1wiLCBudWxsKTsgXG4gIC8vIE5vdyBtYWtlIGV2ZXJ5dGhpbmcgZHJhZ2dhYmxlIHRoYXQgc2hvdWxkIGJlXG4gIGlmIChlZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICBkMy5zZWxlY3RBbGwoZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIHRydWUpXG4gICAgICAgICAgLmNhbGwoZHJhZ0JlaGF2aW9yKTtcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBZGQgdGV4dCBmb3IgY29uc3RyYWludHNcbiAgbGV0IGN0ID0gbm9kZUdycHMuc2VsZWN0QWxsKFwidGV4dC5jb25zdHJhaW50XCIpXG4gICAgICAuZGF0YShmdW5jdGlvbihuKXsgcmV0dXJuIG4uY29uc3RyYWludHM7IH0pO1xuICBjdC5lbnRlcigpLmFwcGVuZChcInN2Zzp0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbnN0cmFpbnRcIik7XG4gIGN0LmV4aXQoKS5yZW1vdmUoKTtcbiAgY3QudGV4dCggYyA9PiBjb25zdHJhaW50VGV4dChjKSApXG4gICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgLmF0dHIoXCJkeVwiLCAoYyxpKSA9PiBgJHsoaSsxKSoxLjd9ZW1gKVxuICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIixcInN0YXJ0XCIpXG4gICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byBmdWxsIHNpemVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCA4LjUgKVxuICAgICAgO1xuICBub2RlVXBkYXRlLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTcgKVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMTcgKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byBmdWxseSBvcGFxdWVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMSlcbiAgICAgIDtcblxuICAvL1xuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGV0IG5vZGVFeGl0ID0gbm9kZUdycHMuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueCArIFwiLFwiICsgc291cmNlLnkgKyBcIilcIjsgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byB0aW55IHJhZGl1c1xuICBub2RlRXhpdC5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCAxZS02KVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byB0cmFuc3BhcmVudFxuICBub2RlRXhpdC5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNilcbiAgICAgIDtcbiAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXG4gIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGQueDAgPSBkLng7XG4gICAgZC55MCA9IGQueTtcbiAgfSk7XG4gIC8vXG5cbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpIHtcbiAgbGV0IGxpbmsgPSB2aXMuc2VsZWN0QWxsKFwicGF0aC5saW5rXCIpXG4gICAgICAuZGF0YShsaW5rcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQuaWQ7IH0pXG4gICAgICA7XG5cbiAgLy8gRW50ZXIgYW55IG5ldyBsaW5rcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBuZXdQYXRocyA9IGxpbmsuZW50ZXIoKS5pbnNlcnQoXCJzdmc6cGF0aFwiLCBcImdcIik7XG4gIGxldCBsaW5rVGl0bGUgPSBmdW5jdGlvbihsKXtcbiAgICAgIGxldCBjbGljayA9IFwiXCI7XG4gICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIil7XG4gICAgICAgICAgY2xpY2sgPSBgQ2xpY2sgdG8gbWFrZSB0aGlzIHJlbGF0aW9uc2hpcCAke2wudGFyZ2V0LmpvaW4gPyBcIlJFUVVJUkVEXCIgOiBcIk9QVElPTkFMXCJ9LiBgO1xuICAgICAgfVxuICAgICAgbGV0IGFsdGNsaWNrID0gXCJBbHQtY2xpY2sgdG8gY3V0IGxpbmsuXCI7XG4gICAgICByZXR1cm4gY2xpY2sgKyBhbHRjbGljaztcbiAgfVxuICAvLyBzZXQgdGhlIHRvb2x0aXBcbiAgbmV3UGF0aHMuYXBwZW5kKFwic3ZnOnRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgbmV3UGF0aHNcbiAgICAgIC5hdHRyKFwidGFyZ2V0XCIsIGQgPT4gZC50YXJnZXQuaWQucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5rXCIpXG4gICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgbyA9IHt4OiBzb3VyY2UueDAsIHk6IHNvdXJjZS55MH07XG4gICAgICAgIHJldHVybiBkaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgIH0pXG4gICAgICAuY2xhc3NlZChcImF0dHJpYnV0ZVwiLCBmdW5jdGlvbihsKSB7IHJldHVybiBsLnRhcmdldC5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiOyB9KVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24obCl7IFxuICAgICAgICAgIGlmIChkMy5ldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgLy8gYSBzaGlmdC1jbGljayBjdXRzIHRoZSB0cmVlIGF0IHRoaXMgZWRnZVxuICAgICAgICAgICAgICByZW1vdmVOb2RlKGwudGFyZ2V0KVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAvLyByZWd1bGFyIGNsaWNrIG9uIGEgcmVsYXRpb25zaGlwIGVkZ2UgaW52ZXJ0cyB3aGV0aGVyXG4gICAgICAgICAgICAgIC8vIHRoZSBqb2luIGlzIGlubmVyIG9yIG91dGVyLiBcbiAgICAgICAgICAgICAgbC50YXJnZXQuam9pbiA9IChsLnRhcmdldC5qb2luID8gbnVsbCA6IFwib3V0ZXJcIik7XG4gICAgICAgICAgICAgIC8vIHJlLXNldCB0aGUgdG9vbHRpcFxuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0KFwidGl0bGVcIikudGV4dChsaW5rVGl0bGUpO1xuICAgICAgICAgICAgICB1cGRhdGUobC5zb3VyY2UpO1xuICAgICAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcbiBcbiAgXG4gIC8vIFRyYW5zaXRpb24gbGlua3MgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICBsaW5rLmNsYXNzZWQoXCJvdXRlclwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLnRhcmdldC5qb2luID09PSBcIm91dGVyXCI7IH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZGlhZ29uYWwpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxpbmsuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngsIHk6IHNvdXJjZS55fTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG59XG4vL1xuLy8gRnVuY3Rpb24gdG8gZXNjYXBlICc8JyAnXCInIGFuZCAnJicgY2hhcmFjdGVyc1xuZnVuY3Rpb24gZXNjKHMpe1xuICAgIGlmICghcykgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpOyBcbn1cblxuLy8gVHVybnMgYSBqc29uIHJlcHJlc2VudGF0aW9uIG9mIGEgdGVtcGxhdGUgaW50byBYTUwsIHN1aXRhYmxlIGZvciBpbXBvcnRpbmcgaW50byB0aGUgSW50ZXJtaW5lIFFCLlxuZnVuY3Rpb24ganNvbjJ4bWwodCwgcW9ubHkpe1xuICAgIHZhciBzbyA9ICh0Lm9yZGVyQnkgfHwgW10pLnJlZHVjZShmdW5jdGlvbihzLHgpeyBcbiAgICAgICAgdmFyIGsgPSBPYmplY3Qua2V5cyh4KVswXTtcbiAgICAgICAgdmFyIHYgPSB4W2tdXG4gICAgICAgIHJldHVybiBzICsgYCR7a30gJHt2fSBgO1xuICAgIH0sIFwiXCIpO1xuXG4gICAgLy8gQ29udmVydHMgYW4gb3V0ZXIgam9pbiBwYXRoIHRvIHhtbC5cbiAgICBmdW5jdGlvbiBvajJ4bWwob2ope1xuICAgICAgICByZXR1cm4gYDxqb2luIHBhdGg9XCIke29qfVwiIHN0eWxlPVwiT1VURVJcIiAvPmA7XG4gICAgfVxuXG4gICAgLy8gdGhlIHF1ZXJ5IHBhcnRcbiAgICB2YXIgcXBhcnQgPSBcbmA8cXVlcnlcbiAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gIG1vZGVsPVwiJHsodC5tb2RlbCAmJiB0Lm1vZGVsLm5hbWUpIHx8ICcnfVwiXG4gIHZpZXc9XCIke3Quc2VsZWN0LmpvaW4oJyAnKX1cIlxuICBsb25nRGVzY3JpcHRpb249XCIke2VzYyh0LmRlc2NyaXB0aW9uIHx8ICcnKX1cIlxuICBzb3J0T3JkZXI9XCIke3NvIHx8ICcnfVwiXG4gICR7dC5jb25zdHJhaW50TG9naWMgJiYgJ2NvbnN0cmFpbnRMb2dpYz1cIicrdC5jb25zdHJhaW50TG9naWMrJ1wiJyB8fCAnJ31cbj5cbiAgJHsodC5qb2lucyB8fCBbXSkubWFwKG9qMnhtbCkuam9pbihcIiBcIil9XG4gICR7KHQud2hlcmUgfHwgW10pLm1hcChjID0+IGMuYzJ4bWwoKSkuam9pbihcIiBcIil9XG48L3F1ZXJ5PmA7XG4gICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgdmFyIHRtcGx0ID0gXG5gPHRlbXBsYXRlXG4gIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gIGNvbW1lbnQ9XCIke2VzYyh0LmNvbW1lbnQgfHwgJycpfVwiPlxuICR7cXBhcnR9XG48L3RlbXBsYXRlPlxuYDtcbiAgICByZXR1cm4gcW9ubHkgPyBxcGFydCA6IHRtcGx0XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVUdGV4dCgpe1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dDtcbiAgaWYoIGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSApXG4gICAgICB0eHQgPSBKU09OLnN0cmluZ2lmeSh1Y3QsIG51bGwsIDIpO1xuICBlbHNlXG4gICAgICB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBkMy5zZWxlY3QoXCIjdHRleHRkaXZcIikgXG4gICAgICAudGV4dCh0eHQpXG4gICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIHRydWUpO1xuICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgdXBkYXRlQ291bnQoKTtcbn1cblxuZnVuY3Rpb24gcnVuYXRtaW5lKCkge1xuICBsZXQgdWN0ID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgbGV0IHR4dCA9IGpzb24yeG1sKHVjdCk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQodHh0KTtcbiAgbGV0IGxpbmt1cmwgPSBjdXJyTWluZS51cmwgKyBcIi9sb2FkUXVlcnkuZG8/dHJhaWw9JTdDcXVlcnkmbWV0aG9kPXhtbFwiO1xuICBsZXQgZWRpdHVybCA9IGxpbmt1cmwgKyBcIiZxdWVyeT1cIiArIHVybFR4dDtcbiAgbGV0IHJ1bnVybCA9IGxpbmt1cmwgKyBcIiZza2lwQnVpbGRlcj10cnVlJnF1ZXJ5PVwiICsgdXJsVHh0O1xuICB3aW5kb3cub3BlbiggZDMuZXZlbnQuYWx0S2V5ID8gZWRpdHVybCA6IHJ1bnVybCwgJ19ibGFuaycgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ291bnQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCBxdHh0ID0ganNvbjJ4bWwodWN0LCB0cnVlKTtcbiAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudChxdHh0KTtcbiAgbGV0IGNvdW50VXJsID0gY3Vyck1pbmUudXJsICsgYC9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JHt1cmxUeHR9JmZvcm1hdD1jb3VudGA7XG4gIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwicnVubmluZ1wiLCB0cnVlKTtcbiAgZDNqc29uUHJvbWlzZShjb3VudFVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKG4pe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgZmFsc2UpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IHNwYW4nKS50ZXh0KG4pXG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgdHJ1ZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6OlwiLCBxdHh0KVxuICAgICAgfSk7XG59XG5cbi8vIFRoZSBjYWxsIHRoYXQgZ2V0cyBpdCBhbGwgZ29pbmcuLi5cbnNldHVwKClcbi8vXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYi5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIENvbnN0cmFpbnRzIG9uIGF0dHJpYnV0ZXM6XG4vLyAtIHZhbHVlIChjb21wYXJpbmcgYW4gYXR0cmlidXRlIHRvIGEgdmFsdWUsIHVzaW5nIGFuIG9wZXJhdG9yKVxuLy8gICAgICA+ID49IDwgPD0gPSAhPSBMSUtFIE5PVC1MSUtFIENPTlRBSU5TIERPRVMtTk9ULUNPTlRBSU5cbi8vIC0gbXVsdGl2YWx1ZSAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBtdWx0aXBsZSB2YWx1ZSlcbi8vICAgICAgT05FLU9GIE5PVC1PTkUgT0Zcbi8vIC0gcmFuZ2UgKHN1YnR5cGUgb2YgbXVsdGl2YWx1ZSwgZm9yIGNvb3JkaW5hdGUgcmFuZ2VzKVxuLy8gICAgICBXSVRISU4gT1VUU0lERSBPVkVSTEFQUyBET0VTLU5PVC1PVkVSTEFQXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTClcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIHJlZmVyZW5jZXMvY29sbGVjdGlvbnNcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMIHJlZi9lbXB0eSBjb2xsZWN0aW9uKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vLyAtIGxvb2t1cCAoXG4vLyAgICAgIExPT0tVUFxuLy8gLSBzdWJjbGFzc1xuLy8gICAgICBJU0Fcbi8vIC0gbGlzdFxuLy8gICAgICBJTiBOT1QtSU5cbi8vIC0gbG9vcCAoVE9ETylcblxudmFyIE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxudmFyIE5VTExBQkxFVFlQRVM9IFtcbiAgICBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiLFxuICAgIFwiamF2YS5sYW5nLlN0cmluZ1wiLFxuICAgIFwiamF2YS5sYW5nLkJvb2xlYW5cIlxuXTtcblxudmFyIExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJPYmplY3RcIlxuXVxuXG5cbnZhciBPUFMgPSBbXG5cbiAgICAvLyBWYWxpZCBmb3IgYW55IGF0dHJpYnV0ZVxuICAgIC8vIEFsc28gdGhlIG9wZXJhdG9ycyBmb3IgbG9vcCBjb25zdHJhaW50cyAobm90IHlldCBpbXBsZW1lbnRlZCkuXG4gICAge1xuICAgIG9wOiBcIj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSx7XG4gICAgb3A6IFwiIT1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3IgbnVtZXJpYyBhbmQgZGF0ZSBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIj5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIj49XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3Igc3RyaW5nIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiQ09OVEFJTlNcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cblxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIENPTlRBSU5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIExJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJPTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBmb3IgTG9jYXRpb24gbm9kZXNcbiAgICB7XG4gICAgb3A6IFwiV0lUSElOXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9WRVJMQVBTXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIE9WRVJMQVBcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1VUU0lERVwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LFxuIFxuICAgIC8vIE5VTEwgY29uc3RyYWludHMuIFZhbGlkIGZvciBhbnkgbm9kZSBleGNlcHQgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVMgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCJJUyBOT1QgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSAoaS5lLiwgdGhlIHJvb3QsIG9yIGFueSBcbiAgICAvLyByZWZlcmVuY2Ugb3IgY29sbGVjdGlvbiBub2RlKS5cbiAgICB7XG4gICAgb3A6IFwiTE9PS1VQXCIsXG4gICAgY3R5cGU6IFwibG9va3VwXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIklOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJOT1QgSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSBleGNlcHQgdGhlIHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTQVwiLFxuICAgIGN0eXBlOiBcInN1YmNsYXNzXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9XTtcbi8vXG52YXIgT1BJTkRFWCA9IE9QUy5yZWR1Y2UoZnVuY3Rpb24oeCxvKXtcbiAgICB4W28ub3BdID0gbztcbiAgICByZXR1cm4geDtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8vIFByb21pc2lmaWVzIGEgY2FsbCB0byBkMy5qc29uLlxuLy8gQXJnczpcbi8vICAgdXJsIChzdHJpbmcpIFRoZSB1cmwgb2YgdGhlIGpzb24gcmVzb3VyY2Vcbi8vIFJldHVybnM6XG4vLyAgIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBqc29uIG9iamVjdCB2YWx1ZSwgb3IgcmVqZWN0cyB3aXRoIGFuIGVycm9yXG5mdW5jdGlvbiBkM2pzb25Qcm9taXNlKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZDMuanNvbih1cmwsIGZ1bmN0aW9uKGVycm9yLCBqc29uKXtcbiAgICAgICAgICAgIGVycm9yID8gcmVqZWN0KHsgc3RhdHVzOiBlcnJvci5zdGF0dXMsIHN0YXR1c1RleHQ6IGVycm9yLnN0YXR1c1RleHR9KSA6IHJlc29sdmUoanNvbik7XG4gICAgICAgIH0pXG4gICAgfSk7XG59XG5cbi8vIFNlbGVjdHMgYWxsIHRoZSB0ZXh0IGluIHRoZSBnaXZlbiBjb250YWluZXIuIFxuLy8gVGhlIGNvbnRhaW5lciBtdXN0IGhhdmUgYW4gaWQuXG4vLyBDb3BpZWQgZnJvbTpcbi8vICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzE2Nzc0NTEvaG93LXRvLXNlbGVjdC1kaXYtdGV4dC1vbi1idXR0b24tY2xpY2tcbmZ1bmN0aW9uIHNlbGVjdFRleHQoY29udGFpbmVyaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn1cblxuLy8gQ29udmVydHMgYW4gSW50ZXJNaW5lIHF1ZXJ5IGluIFBhdGhRdWVyeSBYTUwgZm9ybWF0IHRvIGEgSlNPTiBvYmplY3QgcmVwcmVzZW50YXRpb24uXG4vL1xuZnVuY3Rpb24gcGFyc2VQYXRoUXVlcnkoeG1sKXtcbiAgICAvLyBUdXJucyB0aGUgcXVhc2ktbGlzdCBvYmplY3QgcmV0dXJuZWQgYnkgc29tZSBET00gbWV0aG9kcyBpbnRvIGFjdHVhbCBsaXN0cy5cbiAgICBmdW5jdGlvbiBkb21saXN0MmFycmF5KGxzdCkge1xuICAgICAgICBsZXQgYSA9IFtdO1xuICAgICAgICBmb3IobGV0IGk9MDsgaTxsc3QubGVuZ3RoOyBpKyspIGEucHVzaChsc3RbaV0pO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgLy8gcGFyc2UgdGhlIFhNTFxuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGRvbSA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sLCBcInRleHQveG1sXCIpO1xuXG4gICAgLy8gZ2V0IHRoZSBwYXJ0cy4gVXNlciBtYXkgcGFzdGUgaW4gYSA8dGVtcGxhdGU+IG9yIGEgPHF1ZXJ5PlxuICAgIC8vIChpLmUuLCB0ZW1wbGF0ZSBtYXkgYmUgbnVsbClcbiAgICBsZXQgdGVtcGxhdGUgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZW1wbGF0ZVwiKVswXTtcbiAgICBsZXQgdGl0bGUgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSB8fCBcIlwiO1xuICAgIGxldCBjb21tZW50ID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwiY29tbWVudFwiKSB8fCBcIlwiO1xuICAgIGxldCBxdWVyeSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInF1ZXJ5XCIpWzBdO1xuICAgIGxldCBtb2RlbCA9IHsgbmFtZTogcXVlcnkuZ2V0QXR0cmlidXRlKFwibW9kZWxcIikgfHwgXCJnZW5vbWljXCIgfTtcbiAgICBsZXQgbmFtZSA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm5hbWVcIikgfHwgXCJcIjtcbiAgICBsZXQgZGVzY3JpcHRpb24gPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJsb25nRGVzY3JpdGlvblwiKSB8fCBcIlwiO1xuICAgIGxldCBzZWxlY3QgPSAocXVlcnkuZ2V0QXR0cmlidXRlKFwidmlld1wiKSB8fCBcIlwiKS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICBsZXQgY29uc3RyYWludHMgPSBkb21saXN0MmFycmF5KGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY29uc3RyYWludCcpKTtcbiAgICBsZXQgY29uc3RyYWludExvZ2ljID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwiY29uc3RyYWludExvZ2ljXCIpO1xuICAgIGxldCBqb2lucyA9IGRvbWxpc3QyYXJyYXkocXVlcnkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJqb2luXCIpKTtcbiAgICBsZXQgc29ydE9yZGVyID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpIHx8IFwiXCI7XG4gICAgLy9cbiAgICAvL1xuICAgIGxldCB3aGVyZSA9IGNvbnN0cmFpbnRzLm1hcChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBvcCA9IGMuZ2V0QXR0cmlidXRlKFwib3BcIik7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICAgICAgICBvcCA9IFwiSVNBXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdmFscyA9IGRvbWxpc3QyYXJyYXkoYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInZhbHVlXCIpKS5tYXAoIHYgPT4gdi5pbm5lckhUTUwgKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3A6IG9wLFxuICAgICAgICAgICAgICAgIHBhdGg6IGMuZ2V0QXR0cmlidXRlKFwicGF0aFwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGMuZ2V0QXR0cmlidXRlKFwidmFsdWVcIiksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogdmFscyxcbiAgICAgICAgICAgICAgICB0eXBlIDogYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLFxuICAgICAgICAgICAgICAgIGNvZGU6IGMuZ2V0QXR0cmlidXRlKFwiY29kZVwiKSxcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogYy5nZXRBdHRyaWJ1dGUoXCJlZGl0YWJsZVwiKSB8fCBcInRydWVcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIC8vIENoZWNrOiBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjb25zdHJhaW50LCAoYW5kIGl0J3Mgbm90IGFuIElTQSksIHNvbWV0aW1lcyB0aGUgY29uc3RyYWludExvZ2ljIFxuICAgIC8vIGFuZC9vciB0aGUgY29uc3RyYWludCBjb2RlIGFyZSBtaXNzaW5nLlxuICAgIGlmICh3aGVyZS5sZW5ndGggPT09IDEgJiYgd2hlcmVbMF0ub3AgIT09IFwiSVNBXCIgJiYgIXdoZXJlWzBdLmNvZGUpe1xuICAgICAgICB3aGVyZVswXS5jb2RlID0gY29uc3RyYWludExvZ2ljID0gXCJBXCI7XG4gICAgfVxuXG4gICAgLy8gb3V0ZXIgam9pbnMuIFRoZXkgbG9vayBsaWtlIHRoaXM6XG4gICAgLy8gICAgICAgPGpvaW4gcGF0aD1cIkdlbmUuc2VxdWVuY2VPbnRvbG9neVRlcm1cIiBzdHlsZT1cIk9VVEVSXCIvPlxuICAgIGpvaW5zID0gam9pbnMubWFwKCBqID0+IGouZ2V0QXR0cmlidXRlKFwicGF0aFwiKSApO1xuXG4gICAgbGV0IG9yZGVyQnkgPSBudWxsO1xuICAgIGlmIChzb3J0T3JkZXIpIHtcbiAgICAgICAgLy8gVGhlIGpzb24gZm9ybWF0IGZvciBvcmRlckJ5IGlzIGEgYml0IHdlaXJkLlxuICAgICAgICAvLyBJZiB0aGUgeG1sIG9yZGVyQnkgaXM6IFwiQS5iLmMgYXNjIEEuZC5lIGRlc2NcIixcbiAgICAgICAgLy8gdGhlIGpzb24gc2hvdWxkIGJlOiBbIHtcIkEuYi5jXCI6XCJhc2NcIn0sIHtcIkEuZC5lXCI6XCJkZXNjfSBdXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBUaGUgb3JkZXJieSBzdHJpbmcgdG9rZW5zLCBlLmcuIFtcIkEuYi5jXCIsIFwiYXNjXCIsIFwiQS5kLmVcIiwgXCJkZXNjXCJdXG4gICAgICAgIGxldCBvYiA9IHNvcnRPcmRlci50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrOlxuICAgICAgICBpZiAob2IubGVuZ3RoICUgMiApXG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBwYXJzZSB0aGUgb3JkZXJCeSBjbGF1c2U6IFwiICsgcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpO1xuICAgICAgICAvLyBjb252ZXJ0IHRva2VucyB0byBqc29uIG9yZGVyQnkgXG4gICAgICAgIG9yZGVyQnkgPSBvYi5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBjdXJyLCBpKXtcbiAgICAgICAgICAgIGlmIChpICUgMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgLy8gb2RkLiBjdXJyIGlzIGEgcGF0aC4gUHVzaCBpdC5cbiAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZXZlbi4gUG9wIHRoZSBwYXRoLCBjcmVhdGUgdGhlIHt9LCBhbmQgcHVzaCBpdC5cbiAgICAgICAgICAgICAgICBsZXQgdiA9IHt9XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBhY2MucG9wKClcbiAgICAgICAgICAgICAgICB2W3BdID0gY3VycjtcbiAgICAgICAgICAgICAgICBhY2MucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgY29uc3RyYWludExvZ2ljLFxuICAgICAgICBzZWxlY3QsXG4gICAgICAgIHdoZXJlLFxuICAgICAgICBqb2lucyxcbiAgICAgICAgb3JkZXJCeVxuICAgIH07XG59XG5cbi8vIFJldHVybnMgYSBkZWVwIGNvcHkgb2Ygb2JqZWN0IG8uIFxuLy8gQXJnczpcbi8vICAgbyAgKG9iamVjdCkgTXVzdCBiZSBhIEpTT04gb2JqZWN0IChubyBjdXJjdWxhciByZWZzLCBubyBmdW5jdGlvbnMpLlxuLy8gUmV0dXJuczpcbi8vICAgYSBkZWVwIGNvcHkgb2Ygb1xuZnVuY3Rpb24gZGVlcGMobykge1xuICAgIGlmICghbykgcmV0dXJuIG87XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobykpO1xufVxuXG4vL1xubGV0IFBSRUZJWD1cIm9yZy5tZ2kuYXBwcy5xYlwiO1xuZnVuY3Rpb24gdGVzdExvY2FsKGF0dHIpIHtcbiAgICByZXR1cm4gKFBSRUZJWCtcIi5cIithdHRyKSBpbiBsb2NhbFN0b3JhZ2U7XG59XG5mdW5jdGlvbiBzZXRMb2NhbChhdHRyLCB2YWwsIGVuY29kZSl7XG4gICAgbG9jYWxTdG9yYWdlW1BSRUZJWCtcIi5cIithdHRyXSA9IGVuY29kZSA/IEpTT04uc3RyaW5naWZ5KHZhbCkgOiB2YWw7XG59XG5mdW5jdGlvbiBnZXRMb2NhbChhdHRyLCBkZWNvZGUsIGRmbHQpe1xuICAgIGxldCBrZXkgPSBQUkVGSVgrXCIuXCIrYXR0cjtcbiAgICBpZiAoa2V5IGluIGxvY2FsU3RvcmFnZSl7XG4gICAgICAgIGxldCB2ID0gbG9jYWxTdG9yYWdlW2tleV07XG4gICAgICAgIGlmIChkZWNvZGUpIHYgPSBKU09OLnBhcnNlKHYpO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkZmx0O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyTG9jYWwoKSB7XG4gICAgbGV0IHJtdiA9IE9iamVjdC5rZXlzKGxvY2FsU3RvcmFnZSkuZmlsdGVyKGtleSA9PiBrZXkuc3RhcnRzV2l0aChQUkVGSVgpKTtcbiAgICBybXYuZm9yRWFjaCggayA9PiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrKSApO1xufVxuXG4vL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJsZXQgcyA9IGBcbjNkX3JvdGF0aW9uIGU4NGRcbmFjX3VuaXQgZWIzYlxuYWNjZXNzX2FsYXJtIGUxOTBcbmFjY2Vzc19hbGFybXMgZTE5MVxuYWNjZXNzX3RpbWUgZTE5MlxuYWNjZXNzaWJpbGl0eSBlODRlXG5hY2Nlc3NpYmxlIGU5MTRcbmFjY291bnRfYmFsYW5jZSBlODRmXG5hY2NvdW50X2JhbGFuY2Vfd2FsbGV0IGU4NTBcbmFjY291bnRfYm94IGU4NTFcbmFjY291bnRfY2lyY2xlIGU4NTNcbmFkYiBlNjBlXG5hZGQgZTE0NVxuYWRkX2FfcGhvdG8gZTQzOVxuYWRkX2FsYXJtIGUxOTNcbmFkZF9hbGVydCBlMDAzXG5hZGRfYm94IGUxNDZcbmFkZF9jaXJjbGUgZTE0N1xuYWRkX2NpcmNsZV9vdXRsaW5lIGUxNDhcbmFkZF9sb2NhdGlvbiBlNTY3XG5hZGRfc2hvcHBpbmdfY2FydCBlODU0XG5hZGRfdG9fcGhvdG9zIGUzOWRcbmFkZF90b19xdWV1ZSBlMDVjXG5hZGp1c3QgZTM5ZVxuYWlybGluZV9zZWF0X2ZsYXQgZTYzMFxuYWlybGluZV9zZWF0X2ZsYXRfYW5nbGVkIGU2MzFcbmFpcmxpbmVfc2VhdF9pbmRpdmlkdWFsX3N1aXRlIGU2MzJcbmFpcmxpbmVfc2VhdF9sZWdyb29tX2V4dHJhIGU2MzNcbmFpcmxpbmVfc2VhdF9sZWdyb29tX25vcm1hbCBlNjM0XG5haXJsaW5lX3NlYXRfbGVncm9vbV9yZWR1Y2VkIGU2MzVcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX2V4dHJhIGU2MzZcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX25vcm1hbCBlNjM3XG5haXJwbGFuZW1vZGVfYWN0aXZlIGUxOTVcbmFpcnBsYW5lbW9kZV9pbmFjdGl2ZSBlMTk0XG5haXJwbGF5IGUwNTVcbmFpcnBvcnRfc2h1dHRsZSBlYjNjXG5hbGFybSBlODU1XG5hbGFybV9hZGQgZTg1NlxuYWxhcm1fb2ZmIGU4NTdcbmFsYXJtX29uIGU4NThcbmFsYnVtIGUwMTlcbmFsbF9pbmNsdXNpdmUgZWIzZFxuYWxsX291dCBlOTBiXG5hbmRyb2lkIGU4NTlcbmFubm91bmNlbWVudCBlODVhXG5hcHBzIGU1YzNcbmFyY2hpdmUgZTE0OVxuYXJyb3dfYmFjayBlNWM0XG5hcnJvd19kb3dud2FyZCBlNWRiXG5hcnJvd19kcm9wX2Rvd24gZTVjNVxuYXJyb3dfZHJvcF9kb3duX2NpcmNsZSBlNWM2XG5hcnJvd19kcm9wX3VwIGU1YzdcbmFycm93X2ZvcndhcmQgZTVjOFxuYXJyb3dfdXB3YXJkIGU1ZDhcbmFydF90cmFjayBlMDYwXG5hc3BlY3RfcmF0aW8gZTg1YlxuYXNzZXNzbWVudCBlODVjXG5hc3NpZ25tZW50IGU4NWRcbmFzc2lnbm1lbnRfaW5kIGU4NWVcbmFzc2lnbm1lbnRfbGF0ZSBlODVmXG5hc3NpZ25tZW50X3JldHVybiBlODYwXG5hc3NpZ25tZW50X3JldHVybmVkIGU4NjFcbmFzc2lnbm1lbnRfdHVybmVkX2luIGU4NjJcbmFzc2lzdGFudCBlMzlmXG5hc3Npc3RhbnRfcGhvdG8gZTNhMFxuYXR0YWNoX2ZpbGUgZTIyNlxuYXR0YWNoX21vbmV5IGUyMjdcbmF0dGFjaG1lbnQgZTJiY1xuYXVkaW90cmFjayBlM2ExXG5hdXRvcmVuZXcgZTg2M1xuYXZfdGltZXIgZTAxYlxuYmFja3NwYWNlIGUxNGFcbmJhY2t1cCBlODY0XG5iYXR0ZXJ5X2FsZXJ0IGUxOWNcbmJhdHRlcnlfY2hhcmdpbmdfZnVsbCBlMWEzXG5iYXR0ZXJ5X2Z1bGwgZTFhNFxuYmF0dGVyeV9zdGQgZTFhNVxuYmF0dGVyeV91bmtub3duIGUxYTZcbmJlYWNoX2FjY2VzcyBlYjNlXG5iZWVuaGVyZSBlNTJkXG5ibG9jayBlMTRiXG5ibHVldG9vdGggZTFhN1xuYmx1ZXRvb3RoX2F1ZGlvIGU2MGZcbmJsdWV0b290aF9jb25uZWN0ZWQgZTFhOFxuYmx1ZXRvb3RoX2Rpc2FibGVkIGUxYTlcbmJsdWV0b290aF9zZWFyY2hpbmcgZTFhYVxuYmx1cl9jaXJjdWxhciBlM2EyXG5ibHVyX2xpbmVhciBlM2EzXG5ibHVyX29mZiBlM2E0XG5ibHVyX29uIGUzYTVcbmJvb2sgZTg2NVxuYm9va21hcmsgZTg2NlxuYm9va21hcmtfYm9yZGVyIGU4NjdcbmJvcmRlcl9hbGwgZTIyOFxuYm9yZGVyX2JvdHRvbSBlMjI5XG5ib3JkZXJfY2xlYXIgZTIyYVxuYm9yZGVyX2NvbG9yIGUyMmJcbmJvcmRlcl9ob3Jpem9udGFsIGUyMmNcbmJvcmRlcl9pbm5lciBlMjJkXG5ib3JkZXJfbGVmdCBlMjJlXG5ib3JkZXJfb3V0ZXIgZTIyZlxuYm9yZGVyX3JpZ2h0IGUyMzBcbmJvcmRlcl9zdHlsZSBlMjMxXG5ib3JkZXJfdG9wIGUyMzJcbmJvcmRlcl92ZXJ0aWNhbCBlMjMzXG5icmFuZGluZ193YXRlcm1hcmsgZTA2YlxuYnJpZ2h0bmVzc18xIGUzYTZcbmJyaWdodG5lc3NfMiBlM2E3XG5icmlnaHRuZXNzXzMgZTNhOFxuYnJpZ2h0bmVzc180IGUzYTlcbmJyaWdodG5lc3NfNSBlM2FhXG5icmlnaHRuZXNzXzYgZTNhYlxuYnJpZ2h0bmVzc183IGUzYWNcbmJyaWdodG5lc3NfYXV0byBlMWFiXG5icmlnaHRuZXNzX2hpZ2ggZTFhY1xuYnJpZ2h0bmVzc19sb3cgZTFhZFxuYnJpZ2h0bmVzc19tZWRpdW0gZTFhZVxuYnJva2VuX2ltYWdlIGUzYWRcbmJydXNoIGUzYWVcbmJ1YmJsZV9jaGFydCBlNmRkXG5idWdfcmVwb3J0IGU4NjhcbmJ1aWxkIGU4NjlcbmJ1cnN0X21vZGUgZTQzY1xuYnVzaW5lc3MgZTBhZlxuYnVzaW5lc3NfY2VudGVyIGViM2ZcbmNhY2hlZCBlODZhXG5jYWtlIGU3ZTlcbmNhbGwgZTBiMFxuY2FsbF9lbmQgZTBiMVxuY2FsbF9tYWRlIGUwYjJcbmNhbGxfbWVyZ2UgZTBiM1xuY2FsbF9taXNzZWQgZTBiNFxuY2FsbF9taXNzZWRfb3V0Z29pbmcgZTBlNFxuY2FsbF9yZWNlaXZlZCBlMGI1XG5jYWxsX3NwbGl0IGUwYjZcbmNhbGxfdG9fYWN0aW9uIGUwNmNcbmNhbWVyYSBlM2FmXG5jYW1lcmFfYWx0IGUzYjBcbmNhbWVyYV9lbmhhbmNlIGU4ZmNcbmNhbWVyYV9mcm9udCBlM2IxXG5jYW1lcmFfcmVhciBlM2IyXG5jYW1lcmFfcm9sbCBlM2IzXG5jYW5jZWwgZTVjOVxuY2FyZF9naWZ0Y2FyZCBlOGY2XG5jYXJkX21lbWJlcnNoaXAgZThmN1xuY2FyZF90cmF2ZWwgZThmOFxuY2FzaW5vIGViNDBcbmNhc3QgZTMwN1xuY2FzdF9jb25uZWN0ZWQgZTMwOFxuY2VudGVyX2ZvY3VzX3N0cm9uZyBlM2I0XG5jZW50ZXJfZm9jdXNfd2VhayBlM2I1XG5jaGFuZ2VfaGlzdG9yeSBlODZiXG5jaGF0IGUwYjdcbmNoYXRfYnViYmxlIGUwY2FcbmNoYXRfYnViYmxlX291dGxpbmUgZTBjYlxuY2hlY2sgZTVjYVxuY2hlY2tfYm94IGU4MzRcbmNoZWNrX2JveF9vdXRsaW5lX2JsYW5rIGU4MzVcbmNoZWNrX2NpcmNsZSBlODZjXG5jaGV2cm9uX2xlZnQgZTVjYlxuY2hldnJvbl9yaWdodCBlNWNjXG5jaGlsZF9jYXJlIGViNDFcbmNoaWxkX2ZyaWVuZGx5IGViNDJcbmNocm9tZV9yZWFkZXJfbW9kZSBlODZkXG5jbGFzcyBlODZlXG5jbGVhciBlMTRjXG5jbGVhcl9hbGwgZTBiOFxuY2xvc2UgZTVjZFxuY2xvc2VkX2NhcHRpb24gZTAxY1xuY2xvdWQgZTJiZFxuY2xvdWRfY2lyY2xlIGUyYmVcbmNsb3VkX2RvbmUgZTJiZlxuY2xvdWRfZG93bmxvYWQgZTJjMFxuY2xvdWRfb2ZmIGUyYzFcbmNsb3VkX3F1ZXVlIGUyYzJcbmNsb3VkX3VwbG9hZCBlMmMzXG5jb2RlIGU4NmZcbmNvbGxlY3Rpb25zIGUzYjZcbmNvbGxlY3Rpb25zX2Jvb2ttYXJrIGU0MzFcbmNvbG9yX2xlbnMgZTNiN1xuY29sb3JpemUgZTNiOFxuY29tbWVudCBlMGI5XG5jb21wYXJlIGUzYjlcbmNvbXBhcmVfYXJyb3dzIGU5MTVcbmNvbXB1dGVyIGUzMGFcbmNvbmZpcm1hdGlvbl9udW1iZXIgZTYzOFxuY29udGFjdF9tYWlsIGUwZDBcbmNvbnRhY3RfcGhvbmUgZTBjZlxuY29udGFjdHMgZTBiYVxuY29udGVudF9jb3B5IGUxNGRcbmNvbnRlbnRfY3V0IGUxNGVcbmNvbnRlbnRfcGFzdGUgZTE0ZlxuY29udHJvbF9wb2ludCBlM2JhXG5jb250cm9sX3BvaW50X2R1cGxpY2F0ZSBlM2JiXG5jb3B5cmlnaHQgZTkwY1xuY3JlYXRlIGUxNTBcbmNyZWF0ZV9uZXdfZm9sZGVyIGUyY2NcbmNyZWRpdF9jYXJkIGU4NzBcbmNyb3AgZTNiZVxuY3JvcF8xNl85IGUzYmNcbmNyb3BfM18yIGUzYmRcbmNyb3BfNV80IGUzYmZcbmNyb3BfN181IGUzYzBcbmNyb3BfZGluIGUzYzFcbmNyb3BfZnJlZSBlM2MyXG5jcm9wX2xhbmRzY2FwZSBlM2MzXG5jcm9wX29yaWdpbmFsIGUzYzRcbmNyb3BfcG9ydHJhaXQgZTNjNVxuY3JvcF9yb3RhdGUgZTQzN1xuY3JvcF9zcXVhcmUgZTNjNlxuZGFzaGJvYXJkIGU4NzFcbmRhdGFfdXNhZ2UgZTFhZlxuZGF0ZV9yYW5nZSBlOTE2XG5kZWhhemUgZTNjN1xuZGVsZXRlIGU4NzJcbmRlbGV0ZV9mb3JldmVyIGU5MmJcbmRlbGV0ZV9zd2VlcCBlMTZjXG5kZXNjcmlwdGlvbiBlODczXG5kZXNrdG9wX21hYyBlMzBiXG5kZXNrdG9wX3dpbmRvd3MgZTMwY1xuZGV0YWlscyBlM2M4XG5kZXZlbG9wZXJfYm9hcmQgZTMwZFxuZGV2ZWxvcGVyX21vZGUgZTFiMFxuZGV2aWNlX2h1YiBlMzM1XG5kZXZpY2VzIGUxYjFcbmRldmljZXNfb3RoZXIgZTMzN1xuZGlhbGVyX3NpcCBlMGJiXG5kaWFscGFkIGUwYmNcbmRpcmVjdGlvbnMgZTUyZVxuZGlyZWN0aW9uc19iaWtlIGU1MmZcbmRpcmVjdGlvbnNfYm9hdCBlNTMyXG5kaXJlY3Rpb25zX2J1cyBlNTMwXG5kaXJlY3Rpb25zX2NhciBlNTMxXG5kaXJlY3Rpb25zX3JhaWx3YXkgZTUzNFxuZGlyZWN0aW9uc19ydW4gZTU2NlxuZGlyZWN0aW9uc19zdWJ3YXkgZTUzM1xuZGlyZWN0aW9uc190cmFuc2l0IGU1MzVcbmRpcmVjdGlvbnNfd2FsayBlNTM2XG5kaXNjX2Z1bGwgZTYxMFxuZG5zIGU4NzVcbmRvX25vdF9kaXN0dXJiIGU2MTJcbmRvX25vdF9kaXN0dXJiX2FsdCBlNjExXG5kb19ub3RfZGlzdHVyYl9vZmYgZTY0M1xuZG9fbm90X2Rpc3R1cmJfb24gZTY0NFxuZG9jayBlMzBlXG5kb21haW4gZTdlZVxuZG9uZSBlODc2XG5kb25lX2FsbCBlODc3XG5kb251dF9sYXJnZSBlOTE3XG5kb251dF9zbWFsbCBlOTE4XG5kcmFmdHMgZTE1MVxuZHJhZ19oYW5kbGUgZTI1ZFxuZHJpdmVfZXRhIGU2MTNcbmR2ciBlMWIyXG5lZGl0IGUzYzlcbmVkaXRfbG9jYXRpb24gZTU2OFxuZWplY3QgZThmYlxuZW1haWwgZTBiZVxuZW5oYW5jZWRfZW5jcnlwdGlvbiBlNjNmXG5lcXVhbGl6ZXIgZTAxZFxuZXJyb3IgZTAwMFxuZXJyb3Jfb3V0bGluZSBlMDAxXG5ldXJvX3N5bWJvbCBlOTI2XG5ldl9zdGF0aW9uIGU1NmRcbmV2ZW50IGU4NzhcbmV2ZW50X2F2YWlsYWJsZSBlNjE0XG5ldmVudF9idXN5IGU2MTVcbmV2ZW50X25vdGUgZTYxNlxuZXZlbnRfc2VhdCBlOTAzXG5leGl0X3RvX2FwcCBlODc5XG5leHBhbmRfbGVzcyBlNWNlXG5leHBhbmRfbW9yZSBlNWNmXG5leHBsaWNpdCBlMDFlXG5leHBsb3JlIGU4N2FcbmV4cG9zdXJlIGUzY2FcbmV4cG9zdXJlX25lZ18xIGUzY2JcbmV4cG9zdXJlX25lZ18yIGUzY2NcbmV4cG9zdXJlX3BsdXNfMSBlM2NkXG5leHBvc3VyZV9wbHVzXzIgZTNjZVxuZXhwb3N1cmVfemVybyBlM2NmXG5leHRlbnNpb24gZTg3YlxuZmFjZSBlODdjXG5mYXN0X2ZvcndhcmQgZTAxZlxuZmFzdF9yZXdpbmQgZTAyMFxuZmF2b3JpdGUgZTg3ZFxuZmF2b3JpdGVfYm9yZGVyIGU4N2VcbmZlYXR1cmVkX3BsYXlfbGlzdCBlMDZkXG5mZWF0dXJlZF92aWRlbyBlMDZlXG5mZWVkYmFjayBlODdmXG5maWJlcl9kdnIgZTA1ZFxuZmliZXJfbWFudWFsX3JlY29yZCBlMDYxXG5maWJlcl9uZXcgZTA1ZVxuZmliZXJfcGluIGUwNmFcbmZpYmVyX3NtYXJ0X3JlY29yZCBlMDYyXG5maWxlX2Rvd25sb2FkIGUyYzRcbmZpbGVfdXBsb2FkIGUyYzZcbmZpbHRlciBlM2QzXG5maWx0ZXJfMSBlM2QwXG5maWx0ZXJfMiBlM2QxXG5maWx0ZXJfMyBlM2QyXG5maWx0ZXJfNCBlM2Q0XG5maWx0ZXJfNSBlM2Q1XG5maWx0ZXJfNiBlM2Q2XG5maWx0ZXJfNyBlM2Q3XG5maWx0ZXJfOCBlM2Q4XG5maWx0ZXJfOSBlM2Q5XG5maWx0ZXJfOV9wbHVzIGUzZGFcbmZpbHRlcl9iX2FuZF93IGUzZGJcbmZpbHRlcl9jZW50ZXJfZm9jdXMgZTNkY1xuZmlsdGVyX2RyYW1hIGUzZGRcbmZpbHRlcl9mcmFtZXMgZTNkZVxuZmlsdGVyX2hkciBlM2RmXG5maWx0ZXJfbGlzdCBlMTUyXG5maWx0ZXJfbm9uZSBlM2UwXG5maWx0ZXJfdGlsdF9zaGlmdCBlM2UyXG5maWx0ZXJfdmludGFnZSBlM2UzXG5maW5kX2luX3BhZ2UgZTg4MFxuZmluZF9yZXBsYWNlIGU4ODFcbmZpbmdlcnByaW50IGU5MGRcbmZpcnN0X3BhZ2UgZTVkY1xuZml0bmVzc19jZW50ZXIgZWI0M1xuZmxhZyBlMTUzXG5mbGFyZSBlM2U0XG5mbGFzaF9hdXRvIGUzZTVcbmZsYXNoX29mZiBlM2U2XG5mbGFzaF9vbiBlM2U3XG5mbGlnaHQgZTUzOVxuZmxpZ2h0X2xhbmQgZTkwNFxuZmxpZ2h0X3Rha2VvZmYgZTkwNVxuZmxpcCBlM2U4XG5mbGlwX3RvX2JhY2sgZTg4MlxuZmxpcF90b19mcm9udCBlODgzXG5mb2xkZXIgZTJjN1xuZm9sZGVyX29wZW4gZTJjOFxuZm9sZGVyX3NoYXJlZCBlMmM5XG5mb2xkZXJfc3BlY2lhbCBlNjE3XG5mb250X2Rvd25sb2FkIGUxNjdcbmZvcm1hdF9hbGlnbl9jZW50ZXIgZTIzNFxuZm9ybWF0X2FsaWduX2p1c3RpZnkgZTIzNVxuZm9ybWF0X2FsaWduX2xlZnQgZTIzNlxuZm9ybWF0X2FsaWduX3JpZ2h0IGUyMzdcbmZvcm1hdF9ib2xkIGUyMzhcbmZvcm1hdF9jbGVhciBlMjM5XG5mb3JtYXRfY29sb3JfZmlsbCBlMjNhXG5mb3JtYXRfY29sb3JfcmVzZXQgZTIzYlxuZm9ybWF0X2NvbG9yX3RleHQgZTIzY1xuZm9ybWF0X2luZGVudF9kZWNyZWFzZSBlMjNkXG5mb3JtYXRfaW5kZW50X2luY3JlYXNlIGUyM2VcbmZvcm1hdF9pdGFsaWMgZTIzZlxuZm9ybWF0X2xpbmVfc3BhY2luZyBlMjQwXG5mb3JtYXRfbGlzdF9idWxsZXRlZCBlMjQxXG5mb3JtYXRfbGlzdF9udW1iZXJlZCBlMjQyXG5mb3JtYXRfcGFpbnQgZTI0M1xuZm9ybWF0X3F1b3RlIGUyNDRcbmZvcm1hdF9zaGFwZXMgZTI1ZVxuZm9ybWF0X3NpemUgZTI0NVxuZm9ybWF0X3N0cmlrZXRocm91Z2ggZTI0NlxuZm9ybWF0X3RleHRkaXJlY3Rpb25fbF90b19yIGUyNDdcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX3JfdG9fbCBlMjQ4XG5mb3JtYXRfdW5kZXJsaW5lZCBlMjQ5XG5mb3J1bSBlMGJmXG5mb3J3YXJkIGUxNTRcbmZvcndhcmRfMTAgZTA1NlxuZm9yd2FyZF8zMCBlMDU3XG5mb3J3YXJkXzUgZTA1OFxuZnJlZV9icmVha2Zhc3QgZWI0NFxuZnVsbHNjcmVlbiBlNWQwXG5mdWxsc2NyZWVuX2V4aXQgZTVkMVxuZnVuY3Rpb25zIGUyNGFcbmdfdHJhbnNsYXRlIGU5MjdcbmdhbWVwYWQgZTMwZlxuZ2FtZXMgZTAyMVxuZ2F2ZWwgZTkwZVxuZ2VzdHVyZSBlMTU1XG5nZXRfYXBwIGU4ODRcbmdpZiBlOTA4XG5nb2xmX2NvdXJzZSBlYjQ1XG5ncHNfZml4ZWQgZTFiM1xuZ3BzX25vdF9maXhlZCBlMWI0XG5ncHNfb2ZmIGUxYjVcbmdyYWRlIGU4ODVcbmdyYWRpZW50IGUzZTlcbmdyYWluIGUzZWFcbmdyYXBoaWNfZXEgZTFiOFxuZ3JpZF9vZmYgZTNlYlxuZ3JpZF9vbiBlM2VjXG5ncm91cCBlN2VmXG5ncm91cF9hZGQgZTdmMFxuZ3JvdXBfd29yayBlODg2XG5oZCBlMDUyXG5oZHJfb2ZmIGUzZWRcbmhkcl9vbiBlM2VlXG5oZHJfc3Ryb25nIGUzZjFcbmhkcl93ZWFrIGUzZjJcbmhlYWRzZXQgZTMxMFxuaGVhZHNldF9taWMgZTMxMVxuaGVhbGluZyBlM2YzXG5oZWFyaW5nIGUwMjNcbmhlbHAgZTg4N1xuaGVscF9vdXRsaW5lIGU4ZmRcbmhpZ2hfcXVhbGl0eSBlMDI0XG5oaWdobGlnaHQgZTI1ZlxuaGlnaGxpZ2h0X29mZiBlODg4XG5oaXN0b3J5IGU4ODlcbmhvbWUgZTg4YVxuaG90X3R1YiBlYjQ2XG5ob3RlbCBlNTNhXG5ob3VyZ2xhc3NfZW1wdHkgZTg4YlxuaG91cmdsYXNzX2Z1bGwgZTg4Y1xuaHR0cCBlOTAyXG5odHRwcyBlODhkXG5pbWFnZSBlM2Y0XG5pbWFnZV9hc3BlY3RfcmF0aW8gZTNmNVxuaW1wb3J0X2NvbnRhY3RzIGUwZTBcbmltcG9ydF9leHBvcnQgZTBjM1xuaW1wb3J0YW50X2RldmljZXMgZTkxMlxuaW5ib3ggZTE1NlxuaW5kZXRlcm1pbmF0ZV9jaGVja19ib3ggZTkwOVxuaW5mbyBlODhlXG5pbmZvX291dGxpbmUgZTg4ZlxuaW5wdXQgZTg5MFxuaW5zZXJ0X2NoYXJ0IGUyNGJcbmluc2VydF9jb21tZW50IGUyNGNcbmluc2VydF9kcml2ZV9maWxlIGUyNGRcbmluc2VydF9lbW90aWNvbiBlMjRlXG5pbnNlcnRfaW52aXRhdGlvbiBlMjRmXG5pbnNlcnRfbGluayBlMjUwXG5pbnNlcnRfcGhvdG8gZTI1MVxuaW52ZXJ0X2NvbG9ycyBlODkxXG5pbnZlcnRfY29sb3JzX29mZiBlMGM0XG5pc28gZTNmNlxua2V5Ym9hcmQgZTMxMlxua2V5Ym9hcmRfYXJyb3dfZG93biBlMzEzXG5rZXlib2FyZF9hcnJvd19sZWZ0IGUzMTRcbmtleWJvYXJkX2Fycm93X3JpZ2h0IGUzMTVcbmtleWJvYXJkX2Fycm93X3VwIGUzMTZcbmtleWJvYXJkX2JhY2tzcGFjZSBlMzE3XG5rZXlib2FyZF9jYXBzbG9jayBlMzE4XG5rZXlib2FyZF9oaWRlIGUzMWFcbmtleWJvYXJkX3JldHVybiBlMzFiXG5rZXlib2FyZF90YWIgZTMxY1xua2V5Ym9hcmRfdm9pY2UgZTMxZFxua2l0Y2hlbiBlYjQ3XG5sYWJlbCBlODkyXG5sYWJlbF9vdXRsaW5lIGU4OTNcbmxhbmRzY2FwZSBlM2Y3XG5sYW5ndWFnZSBlODk0XG5sYXB0b3AgZTMxZVxubGFwdG9wX2Nocm9tZWJvb2sgZTMxZlxubGFwdG9wX21hYyBlMzIwXG5sYXB0b3Bfd2luZG93cyBlMzIxXG5sYXN0X3BhZ2UgZTVkZFxubGF1bmNoIGU4OTVcbmxheWVycyBlNTNiXG5sYXllcnNfY2xlYXIgZTUzY1xubGVha19hZGQgZTNmOFxubGVha19yZW1vdmUgZTNmOVxubGVucyBlM2ZhXG5saWJyYXJ5X2FkZCBlMDJlXG5saWJyYXJ5X2Jvb2tzIGUwMmZcbmxpYnJhcnlfbXVzaWMgZTAzMFxubGlnaHRidWxiX291dGxpbmUgZTkwZlxubGluZV9zdHlsZSBlOTE5XG5saW5lX3dlaWdodCBlOTFhXG5saW5lYXJfc2NhbGUgZTI2MFxubGluayBlMTU3XG5saW5rZWRfY2FtZXJhIGU0Mzhcbmxpc3QgZTg5NlxubGl2ZV9oZWxwIGUwYzZcbmxpdmVfdHYgZTYzOVxubG9jYWxfYWN0aXZpdHkgZTUzZlxubG9jYWxfYWlycG9ydCBlNTNkXG5sb2NhbF9hdG0gZTUzZVxubG9jYWxfYmFyIGU1NDBcbmxvY2FsX2NhZmUgZTU0MVxubG9jYWxfY2FyX3dhc2ggZTU0MlxubG9jYWxfY29udmVuaWVuY2Vfc3RvcmUgZTU0M1xubG9jYWxfZGluaW5nIGU1NTZcbmxvY2FsX2RyaW5rIGU1NDRcbmxvY2FsX2Zsb3Jpc3QgZTU0NVxubG9jYWxfZ2FzX3N0YXRpb24gZTU0NlxubG9jYWxfZ3JvY2VyeV9zdG9yZSBlNTQ3XG5sb2NhbF9ob3NwaXRhbCBlNTQ4XG5sb2NhbF9ob3RlbCBlNTQ5XG5sb2NhbF9sYXVuZHJ5X3NlcnZpY2UgZTU0YVxubG9jYWxfbGlicmFyeSBlNTRiXG5sb2NhbF9tYWxsIGU1NGNcbmxvY2FsX21vdmllcyBlNTRkXG5sb2NhbF9vZmZlciBlNTRlXG5sb2NhbF9wYXJraW5nIGU1NGZcbmxvY2FsX3BoYXJtYWN5IGU1NTBcbmxvY2FsX3Bob25lIGU1NTFcbmxvY2FsX3BpenphIGU1NTJcbmxvY2FsX3BsYXkgZTU1M1xubG9jYWxfcG9zdF9vZmZpY2UgZTU1NFxubG9jYWxfcHJpbnRzaG9wIGU1NTVcbmxvY2FsX3NlZSBlNTU3XG5sb2NhbF9zaGlwcGluZyBlNTU4XG5sb2NhbF90YXhpIGU1NTlcbmxvY2F0aW9uX2NpdHkgZTdmMVxubG9jYXRpb25fZGlzYWJsZWQgZTFiNlxubG9jYXRpb25fb2ZmIGUwYzdcbmxvY2F0aW9uX29uIGUwYzhcbmxvY2F0aW9uX3NlYXJjaGluZyBlMWI3XG5sb2NrIGU4OTdcbmxvY2tfb3BlbiBlODk4XG5sb2NrX291dGxpbmUgZTg5OVxubG9va3MgZTNmY1xubG9va3NfMyBlM2ZiXG5sb29rc180IGUzZmRcbmxvb2tzXzUgZTNmZVxubG9va3NfNiBlM2ZmXG5sb29rc19vbmUgZTQwMFxubG9va3NfdHdvIGU0MDFcbmxvb3AgZTAyOFxubG91cGUgZTQwMlxubG93X3ByaW9yaXR5IGUxNmRcbmxveWFsdHkgZTg5YVxubWFpbCBlMTU4XG5tYWlsX291dGxpbmUgZTBlMVxubWFwIGU1NWJcbm1hcmt1bnJlYWQgZTE1OVxubWFya3VucmVhZF9tYWlsYm94IGU4OWJcbm1lbW9yeSBlMzIyXG5tZW51IGU1ZDJcbm1lcmdlX3R5cGUgZTI1MlxubWVzc2FnZSBlMGM5XG5taWMgZTAyOVxubWljX25vbmUgZTAyYVxubWljX29mZiBlMDJiXG5tbXMgZTYxOFxubW9kZV9jb21tZW50IGUyNTNcbm1vZGVfZWRpdCBlMjU0XG5tb25ldGl6YXRpb25fb24gZTI2M1xubW9uZXlfb2ZmIGUyNWNcbm1vbm9jaHJvbWVfcGhvdG9zIGU0MDNcbm1vb2QgZTdmMlxubW9vZF9iYWQgZTdmM1xubW9yZSBlNjE5XG5tb3JlX2hvcml6IGU1ZDNcbm1vcmVfdmVydCBlNWQ0XG5tb3RvcmN5Y2xlIGU5MWJcbm1vdXNlIGUzMjNcbm1vdmVfdG9faW5ib3ggZTE2OFxubW92aWUgZTAyY1xubW92aWVfY3JlYXRpb24gZTQwNFxubW92aWVfZmlsdGVyIGU0M2Fcbm11bHRpbGluZV9jaGFydCBlNmRmXG5tdXNpY19ub3RlIGU0MDVcbm11c2ljX3ZpZGVvIGUwNjNcbm15X2xvY2F0aW9uIGU1NWNcbm5hdHVyZSBlNDA2XG5uYXR1cmVfcGVvcGxlIGU0MDdcbm5hdmlnYXRlX2JlZm9yZSBlNDA4XG5uYXZpZ2F0ZV9uZXh0IGU0MDlcbm5hdmlnYXRpb24gZTU1ZFxubmVhcl9tZSBlNTY5XG5uZXR3b3JrX2NlbGwgZTFiOVxubmV0d29ya19jaGVjayBlNjQwXG5uZXR3b3JrX2xvY2tlZCBlNjFhXG5uZXR3b3JrX3dpZmkgZTFiYVxubmV3X3JlbGVhc2VzIGUwMzFcbm5leHRfd2VlayBlMTZhXG5uZmMgZTFiYlxubm9fZW5jcnlwdGlvbiBlNjQxXG5ub19zaW0gZTBjY1xubm90X2ludGVyZXN0ZWQgZTAzM1xubm90ZSBlMDZmXG5ub3RlX2FkZCBlODljXG5ub3RpZmljYXRpb25zIGU3ZjRcbm5vdGlmaWNhdGlvbnNfYWN0aXZlIGU3Zjdcbm5vdGlmaWNhdGlvbnNfbm9uZSBlN2Y1XG5ub3RpZmljYXRpb25zX29mZiBlN2Y2XG5ub3RpZmljYXRpb25zX3BhdXNlZCBlN2Y4XG5vZmZsaW5lX3BpbiBlOTBhXG5vbmRlbWFuZF92aWRlbyBlNjNhXG5vcGFjaXR5IGU5MWNcbm9wZW5faW5fYnJvd3NlciBlODlkXG5vcGVuX2luX25ldyBlODllXG5vcGVuX3dpdGggZTg5ZlxucGFnZXMgZTdmOVxucGFnZXZpZXcgZThhMFxucGFsZXR0ZSBlNDBhXG5wYW5fdG9vbCBlOTI1XG5wYW5vcmFtYSBlNDBiXG5wYW5vcmFtYV9maXNoX2V5ZSBlNDBjXG5wYW5vcmFtYV9ob3Jpem9udGFsIGU0MGRcbnBhbm9yYW1hX3ZlcnRpY2FsIGU0MGVcbnBhbm9yYW1hX3dpZGVfYW5nbGUgZTQwZlxucGFydHlfbW9kZSBlN2ZhXG5wYXVzZSBlMDM0XG5wYXVzZV9jaXJjbGVfZmlsbGVkIGUwMzVcbnBhdXNlX2NpcmNsZV9vdXRsaW5lIGUwMzZcbnBheW1lbnQgZThhMVxucGVvcGxlIGU3ZmJcbnBlb3BsZV9vdXRsaW5lIGU3ZmNcbnBlcm1fY2FtZXJhX21pYyBlOGEyXG5wZXJtX2NvbnRhY3RfY2FsZW5kYXIgZThhM1xucGVybV9kYXRhX3NldHRpbmcgZThhNFxucGVybV9kZXZpY2VfaW5mb3JtYXRpb24gZThhNVxucGVybV9pZGVudGl0eSBlOGE2XG5wZXJtX21lZGlhIGU4YTdcbnBlcm1fcGhvbmVfbXNnIGU4YThcbnBlcm1fc2Nhbl93aWZpIGU4YTlcbnBlcnNvbiBlN2ZkXG5wZXJzb25fYWRkIGU3ZmVcbnBlcnNvbl9vdXRsaW5lIGU3ZmZcbnBlcnNvbl9waW4gZTU1YVxucGVyc29uX3Bpbl9jaXJjbGUgZTU2YVxucGVyc29uYWxfdmlkZW8gZTYzYlxucGV0cyBlOTFkXG5waG9uZSBlMGNkXG5waG9uZV9hbmRyb2lkIGUzMjRcbnBob25lX2JsdWV0b290aF9zcGVha2VyIGU2MWJcbnBob25lX2ZvcndhcmRlZCBlNjFjXG5waG9uZV9pbl90YWxrIGU2MWRcbnBob25lX2lwaG9uZSBlMzI1XG5waG9uZV9sb2NrZWQgZTYxZVxucGhvbmVfbWlzc2VkIGU2MWZcbnBob25lX3BhdXNlZCBlNjIwXG5waG9uZWxpbmsgZTMyNlxucGhvbmVsaW5rX2VyYXNlIGUwZGJcbnBob25lbGlua19sb2NrIGUwZGNcbnBob25lbGlua19vZmYgZTMyN1xucGhvbmVsaW5rX3JpbmcgZTBkZFxucGhvbmVsaW5rX3NldHVwIGUwZGVcbnBob3RvIGU0MTBcbnBob3RvX2FsYnVtIGU0MTFcbnBob3RvX2NhbWVyYSBlNDEyXG5waG90b19maWx0ZXIgZTQzYlxucGhvdG9fbGlicmFyeSBlNDEzXG5waG90b19zaXplX3NlbGVjdF9hY3R1YWwgZTQzMlxucGhvdG9fc2l6ZV9zZWxlY3RfbGFyZ2UgZTQzM1xucGhvdG9fc2l6ZV9zZWxlY3Rfc21hbGwgZTQzNFxucGljdHVyZV9hc19wZGYgZTQxNVxucGljdHVyZV9pbl9waWN0dXJlIGU4YWFcbnBpY3R1cmVfaW5fcGljdHVyZV9hbHQgZTkxMVxucGllX2NoYXJ0IGU2YzRcbnBpZV9jaGFydF9vdXRsaW5lZCBlNmM1XG5waW5fZHJvcCBlNTVlXG5wbGFjZSBlNTVmXG5wbGF5X2Fycm93IGUwMzdcbnBsYXlfY2lyY2xlX2ZpbGxlZCBlMDM4XG5wbGF5X2NpcmNsZV9vdXRsaW5lIGUwMzlcbnBsYXlfZm9yX3dvcmsgZTkwNlxucGxheWxpc3RfYWRkIGUwM2JcbnBsYXlsaXN0X2FkZF9jaGVjayBlMDY1XG5wbGF5bGlzdF9wbGF5IGUwNWZcbnBsdXNfb25lIGU4MDBcbnBvbGwgZTgwMVxucG9seW1lciBlOGFiXG5wb29sIGViNDhcbnBvcnRhYmxlX3dpZmlfb2ZmIGUwY2VcbnBvcnRyYWl0IGU0MTZcbnBvd2VyIGU2M2NcbnBvd2VyX2lucHV0IGUzMzZcbnBvd2VyX3NldHRpbmdzX25ldyBlOGFjXG5wcmVnbmFudF93b21hbiBlOTFlXG5wcmVzZW50X3RvX2FsbCBlMGRmXG5wcmludCBlOGFkXG5wcmlvcml0eV9oaWdoIGU2NDVcbnB1YmxpYyBlODBiXG5wdWJsaXNoIGUyNTVcbnF1ZXJ5X2J1aWxkZXIgZThhZVxucXVlc3Rpb25fYW5zd2VyIGU4YWZcbnF1ZXVlIGUwM2NcbnF1ZXVlX211c2ljIGUwM2RcbnF1ZXVlX3BsYXlfbmV4dCBlMDY2XG5yYWRpbyBlMDNlXG5yYWRpb19idXR0b25fY2hlY2tlZCBlODM3XG5yYWRpb19idXR0b25fdW5jaGVja2VkIGU4MzZcbnJhdGVfcmV2aWV3IGU1NjBcbnJlY2VpcHQgZThiMFxucmVjZW50X2FjdG9ycyBlMDNmXG5yZWNvcmRfdm9pY2Vfb3ZlciBlOTFmXG5yZWRlZW0gZThiMVxucmVkbyBlMTVhXG5yZWZyZXNoIGU1ZDVcbnJlbW92ZSBlMTViXG5yZW1vdmVfY2lyY2xlIGUxNWNcbnJlbW92ZV9jaXJjbGVfb3V0bGluZSBlMTVkXG5yZW1vdmVfZnJvbV9xdWV1ZSBlMDY3XG5yZW1vdmVfcmVkX2V5ZSBlNDE3XG5yZW1vdmVfc2hvcHBpbmdfY2FydCBlOTI4XG5yZW9yZGVyIGU4ZmVcbnJlcGVhdCBlMDQwXG5yZXBlYXRfb25lIGUwNDFcbnJlcGxheSBlMDQyXG5yZXBsYXlfMTAgZTA1OVxucmVwbGF5XzMwIGUwNWFcbnJlcGxheV81IGUwNWJcbnJlcGx5IGUxNWVcbnJlcGx5X2FsbCBlMTVmXG5yZXBvcnQgZTE2MFxucmVwb3J0X3Byb2JsZW0gZThiMlxucmVzdGF1cmFudCBlNTZjXG5yZXN0YXVyYW50X21lbnUgZTU2MVxucmVzdG9yZSBlOGIzXG5yZXN0b3JlX3BhZ2UgZTkyOVxucmluZ192b2x1bWUgZTBkMVxucm9vbSBlOGI0XG5yb29tX3NlcnZpY2UgZWI0OVxucm90YXRlXzkwX2RlZ3JlZXNfY2N3IGU0MThcbnJvdGF0ZV9sZWZ0IGU0MTlcbnJvdGF0ZV9yaWdodCBlNDFhXG5yb3VuZGVkX2Nvcm5lciBlOTIwXG5yb3V0ZXIgZTMyOFxucm93aW5nIGU5MjFcbnJzc19mZWVkIGUwZTVcbnJ2X2hvb2t1cCBlNjQyXG5zYXRlbGxpdGUgZTU2Mlxuc2F2ZSBlMTYxXG5zY2FubmVyIGUzMjlcbnNjaGVkdWxlIGU4YjVcbnNjaG9vbCBlODBjXG5zY3JlZW5fbG9ja19sYW5kc2NhcGUgZTFiZVxuc2NyZWVuX2xvY2tfcG9ydHJhaXQgZTFiZlxuc2NyZWVuX2xvY2tfcm90YXRpb24gZTFjMFxuc2NyZWVuX3JvdGF0aW9uIGUxYzFcbnNjcmVlbl9zaGFyZSBlMGUyXG5zZF9jYXJkIGU2MjNcbnNkX3N0b3JhZ2UgZTFjMlxuc2VhcmNoIGU4YjZcbnNlY3VyaXR5IGUzMmFcbnNlbGVjdF9hbGwgZTE2Mlxuc2VuZCBlMTYzXG5zZW50aW1lbnRfZGlzc2F0aXNmaWVkIGU4MTFcbnNlbnRpbWVudF9uZXV0cmFsIGU4MTJcbnNlbnRpbWVudF9zYXRpc2ZpZWQgZTgxM1xuc2VudGltZW50X3ZlcnlfZGlzc2F0aXNmaWVkIGU4MTRcbnNlbnRpbWVudF92ZXJ5X3NhdGlzZmllZCBlODE1XG5zZXR0aW5ncyBlOGI4XG5zZXR0aW5nc19hcHBsaWNhdGlvbnMgZThiOVxuc2V0dGluZ3NfYmFja3VwX3Jlc3RvcmUgZThiYVxuc2V0dGluZ3NfYmx1ZXRvb3RoIGU4YmJcbnNldHRpbmdzX2JyaWdodG5lc3MgZThiZFxuc2V0dGluZ3NfY2VsbCBlOGJjXG5zZXR0aW5nc19ldGhlcm5ldCBlOGJlXG5zZXR0aW5nc19pbnB1dF9hbnRlbm5hIGU4YmZcbnNldHRpbmdzX2lucHV0X2NvbXBvbmVudCBlOGMwXG5zZXR0aW5nc19pbnB1dF9jb21wb3NpdGUgZThjMVxuc2V0dGluZ3NfaW5wdXRfaGRtaSBlOGMyXG5zZXR0aW5nc19pbnB1dF9zdmlkZW8gZThjM1xuc2V0dGluZ3Nfb3ZlcnNjYW4gZThjNFxuc2V0dGluZ3NfcGhvbmUgZThjNVxuc2V0dGluZ3NfcG93ZXIgZThjNlxuc2V0dGluZ3NfcmVtb3RlIGU4YzdcbnNldHRpbmdzX3N5c3RlbV9kYXlkcmVhbSBlMWMzXG5zZXR0aW5nc192b2ljZSBlOGM4XG5zaGFyZSBlODBkXG5zaG9wIGU4YzlcbnNob3BfdHdvIGU4Y2FcbnNob3BwaW5nX2Jhc2tldCBlOGNiXG5zaG9wcGluZ19jYXJ0IGU4Y2NcbnNob3J0X3RleHQgZTI2MVxuc2hvd19jaGFydCBlNmUxXG5zaHVmZmxlIGUwNDNcbnNpZ25hbF9jZWxsdWxhcl80X2JhciBlMWM4XG5zaWduYWxfY2VsbHVsYXJfY29ubmVjdGVkX25vX2ludGVybmV0XzRfYmFyIGUxY2RcbnNpZ25hbF9jZWxsdWxhcl9ub19zaW0gZTFjZVxuc2lnbmFsX2NlbGx1bGFyX251bGwgZTFjZlxuc2lnbmFsX2NlbGx1bGFyX29mZiBlMWQwXG5zaWduYWxfd2lmaV80X2JhciBlMWQ4XG5zaWduYWxfd2lmaV80X2Jhcl9sb2NrIGUxZDlcbnNpZ25hbF93aWZpX29mZiBlMWRhXG5zaW1fY2FyZCBlMzJiXG5zaW1fY2FyZF9hbGVydCBlNjI0XG5za2lwX25leHQgZTA0NFxuc2tpcF9wcmV2aW91cyBlMDQ1XG5zbGlkZXNob3cgZTQxYlxuc2xvd19tb3Rpb25fdmlkZW8gZTA2OFxuc21hcnRwaG9uZSBlMzJjXG5zbW9rZV9mcmVlIGViNGFcbnNtb2tpbmdfcm9vbXMgZWI0Ylxuc21zIGU2MjVcbnNtc19mYWlsZWQgZTYyNlxuc25vb3plIGUwNDZcbnNvcnQgZTE2NFxuc29ydF9ieV9hbHBoYSBlMDUzXG5zcGEgZWI0Y1xuc3BhY2VfYmFyIGUyNTZcbnNwZWFrZXIgZTMyZFxuc3BlYWtlcl9ncm91cCBlMzJlXG5zcGVha2VyX25vdGVzIGU4Y2RcbnNwZWFrZXJfbm90ZXNfb2ZmIGU5MmFcbnNwZWFrZXJfcGhvbmUgZTBkMlxuc3BlbGxjaGVjayBlOGNlXG5zdGFyIGU4MzhcbnN0YXJfYm9yZGVyIGU4M2FcbnN0YXJfaGFsZiBlODM5XG5zdGFycyBlOGQwXG5zdGF5X2N1cnJlbnRfbGFuZHNjYXBlIGUwZDNcbnN0YXlfY3VycmVudF9wb3J0cmFpdCBlMGQ0XG5zdGF5X3ByaW1hcnlfbGFuZHNjYXBlIGUwZDVcbnN0YXlfcHJpbWFyeV9wb3J0cmFpdCBlMGQ2XG5zdG9wIGUwNDdcbnN0b3Bfc2NyZWVuX3NoYXJlIGUwZTNcbnN0b3JhZ2UgZTFkYlxuc3RvcmUgZThkMVxuc3RvcmVfbWFsbF9kaXJlY3RvcnkgZTU2M1xuc3RyYWlnaHRlbiBlNDFjXG5zdHJlZXR2aWV3IGU1NmVcbnN0cmlrZXRocm91Z2hfcyBlMjU3XG5zdHlsZSBlNDFkXG5zdWJkaXJlY3RvcnlfYXJyb3dfbGVmdCBlNWQ5XG5zdWJkaXJlY3RvcnlfYXJyb3dfcmlnaHQgZTVkYVxuc3ViamVjdCBlOGQyXG5zdWJzY3JpcHRpb25zIGUwNjRcbnN1YnRpdGxlcyBlMDQ4XG5zdWJ3YXkgZTU2Zlxuc3VwZXJ2aXNvcl9hY2NvdW50IGU4ZDNcbnN1cnJvdW5kX3NvdW5kIGUwNDlcbnN3YXBfY2FsbHMgZTBkN1xuc3dhcF9ob3JpeiBlOGQ0XG5zd2FwX3ZlcnQgZThkNVxuc3dhcF92ZXJ0aWNhbF9jaXJjbGUgZThkNlxuc3dpdGNoX2NhbWVyYSBlNDFlXG5zd2l0Y2hfdmlkZW8gZTQxZlxuc3luYyBlNjI3XG5zeW5jX2Rpc2FibGVkIGU2MjhcbnN5bmNfcHJvYmxlbSBlNjI5XG5zeXN0ZW1fdXBkYXRlIGU2MmFcbnN5c3RlbV91cGRhdGVfYWx0IGU4ZDdcbnRhYiBlOGQ4XG50YWJfdW5zZWxlY3RlZCBlOGQ5XG50YWJsZXQgZTMyZlxudGFibGV0X2FuZHJvaWQgZTMzMFxudGFibGV0X21hYyBlMzMxXG50YWdfZmFjZXMgZTQyMFxudGFwX2FuZF9wbGF5IGU2MmJcbnRlcnJhaW4gZTU2NFxudGV4dF9maWVsZHMgZTI2MlxudGV4dF9mb3JtYXQgZTE2NVxudGV4dHNtcyBlMGQ4XG50ZXh0dXJlIGU0MjFcbnRoZWF0ZXJzIGU4ZGFcbnRodW1iX2Rvd24gZThkYlxudGh1bWJfdXAgZThkY1xudGh1bWJzX3VwX2Rvd24gZThkZFxudGltZV90b19sZWF2ZSBlNjJjXG50aW1lbGFwc2UgZTQyMlxudGltZWxpbmUgZTkyMlxudGltZXIgZTQyNVxudGltZXJfMTAgZTQyM1xudGltZXJfMyBlNDI0XG50aW1lcl9vZmYgZTQyNlxudGl0bGUgZTI2NFxudG9jIGU4ZGVcbnRvZGF5IGU4ZGZcbnRvbGwgZThlMFxudG9uYWxpdHkgZTQyN1xudG91Y2hfYXBwIGU5MTNcbnRveXMgZTMzMlxudHJhY2tfY2hhbmdlcyBlOGUxXG50cmFmZmljIGU1NjVcbnRyYWluIGU1NzBcbnRyYW0gZTU3MVxudHJhbnNmZXJfd2l0aGluX2Ffc3RhdGlvbiBlNTcyXG50cmFuc2Zvcm0gZTQyOFxudHJhbnNsYXRlIGU4ZTJcbnRyZW5kaW5nX2Rvd24gZThlM1xudHJlbmRpbmdfZmxhdCBlOGU0XG50cmVuZGluZ191cCBlOGU1XG50dW5lIGU0MjlcbnR1cm5lZF9pbiBlOGU2XG50dXJuZWRfaW5fbm90IGU4ZTdcbnR2IGUzMzNcbnVuYXJjaGl2ZSBlMTY5XG51bmRvIGUxNjZcbnVuZm9sZF9sZXNzIGU1ZDZcbnVuZm9sZF9tb3JlIGU1ZDdcbnVwZGF0ZSBlOTIzXG51c2IgZTFlMFxudmVyaWZpZWRfdXNlciBlOGU4XG52ZXJ0aWNhbF9hbGlnbl9ib3R0b20gZTI1OFxudmVydGljYWxfYWxpZ25fY2VudGVyIGUyNTlcbnZlcnRpY2FsX2FsaWduX3RvcCBlMjVhXG52aWJyYXRpb24gZTYyZFxudmlkZW9fY2FsbCBlMDcwXG52aWRlb19sYWJlbCBlMDcxXG52aWRlb19saWJyYXJ5IGUwNGFcbnZpZGVvY2FtIGUwNGJcbnZpZGVvY2FtX29mZiBlMDRjXG52aWRlb2dhbWVfYXNzZXQgZTMzOFxudmlld19hZ2VuZGEgZThlOVxudmlld19hcnJheSBlOGVhXG52aWV3X2Nhcm91c2VsIGU4ZWJcbnZpZXdfY29sdW1uIGU4ZWNcbnZpZXdfY29tZnkgZTQyYVxudmlld19jb21wYWN0IGU0MmJcbnZpZXdfZGF5IGU4ZWRcbnZpZXdfaGVhZGxpbmUgZThlZVxudmlld19saXN0IGU4ZWZcbnZpZXdfbW9kdWxlIGU4ZjBcbnZpZXdfcXVpbHQgZThmMVxudmlld19zdHJlYW0gZThmMlxudmlld193ZWVrIGU4ZjNcbnZpZ25ldHRlIGU0MzVcbnZpc2liaWxpdHkgZThmNFxudmlzaWJpbGl0eV9vZmYgZThmNVxudm9pY2VfY2hhdCBlNjJlXG52b2ljZW1haWwgZTBkOVxudm9sdW1lX2Rvd24gZTA0ZFxudm9sdW1lX211dGUgZTA0ZVxudm9sdW1lX29mZiBlMDRmXG52b2x1bWVfdXAgZTA1MFxudnBuX2tleSBlMGRhXG52cG5fbG9jayBlNjJmXG53YWxscGFwZXIgZTFiY1xud2FybmluZyBlMDAyXG53YXRjaCBlMzM0XG53YXRjaF9sYXRlciBlOTI0XG53Yl9hdXRvIGU0MmNcbndiX2Nsb3VkeSBlNDJkXG53Yl9pbmNhbmRlc2NlbnQgZTQyZVxud2JfaXJpZGVzY2VudCBlNDM2XG53Yl9zdW5ueSBlNDMwXG53YyBlNjNkXG53ZWIgZTA1MVxud2ViX2Fzc2V0IGUwNjlcbndlZWtlbmQgZTE2Ylxud2hhdHNob3QgZTgwZVxud2lkZ2V0cyBlMWJkXG53aWZpIGU2M2VcbndpZmlfbG9jayBlMWUxXG53aWZpX3RldGhlcmluZyBlMWUyXG53b3JrIGU4ZjlcbndyYXBfdGV4dCBlMjViXG55b3V0dWJlX3NlYXJjaGVkX2ZvciBlOGZhXG56b29tX2luIGU4ZmZcbnpvb21fb3V0IGU5MDBcbnpvb21fb3V0X21hcCBlNTZiXG5gO1xuXG5sZXQgY29kZXBvaW50cyA9IHMudHJpbSgpLnNwbGl0KFwiXFxuXCIpLnJlZHVjZShmdW5jdGlvbihjdiwgbnYpe1xuICAgIGxldCBwYXJ0cyA9IG52LnNwbGl0KC8gKy8pO1xuICAgIGxldCB1YyA9ICdcXFxcdScgKyBwYXJ0c1sxXTtcbiAgICBjdltwYXJ0c1swXV0gPSBldmFsKCdcIicgKyB1YyArICdcIicpO1xuICAgIHJldHVybiBjdjtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29kZXBvaW50c1xufVxuXG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBVbmRvTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IobGltaXQpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50ZXIgPSAtMTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnRTdGF0ZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCAwKVxuICAgICAgICAgICAgdGhyb3cgXCJObyBjdXJyZW50IHN0YXRlLlwiO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIGdldCBoYXNTdGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPj0gMDtcbiAgICB9XG4gICAgZ2V0IGNhblVuZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID4gMDtcbiAgICB9XG4gICAgZ2V0IGNhblJlZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTdGF0ZSAmJiB0aGlzLnBvaW50ZXIgPCB0aGlzLmhpc3RvcnkubGVuZ3RoLTE7XG4gICAgfVxuICAgIGFkZCAocykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQUREXCIpO1xuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl0gPSBzO1xuICAgICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKHRoaXMucG9pbnRlcisxKTtcbiAgICB9XG4gICAgdW5kbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVTkRPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblVuZG8pIHRocm93IFwiTm8gdW5kby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICByZWRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJFRE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuUmVkbykgdGhyb3cgXCJObyByZWRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVbmRvTWFuYWdlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=