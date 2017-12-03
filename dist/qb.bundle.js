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





let VERSION = "0.1.0";

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
    m = [20, 120, 20, 120]
    w = 1280 - m[1] - m[3]
    h = 800 - m[0] - m[2]
    i = 0

    //
    d3.select('#footer [name="version"]')
        .text(`QB v${VERSION}`);

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
    c2xml (qonly){
        let g = '';
        let h = '';
        let e = qonly ? "" : `editable="${this.editable || 'false'}"`;
        if (this.ctype === "value" || this.ctype === "list")
            g = `path="${this.path}" op="${esc(this.op)}" value="${esc(this.value)}" code="${this.code}" ${e}`;
        else if (this.ctype === "lookup"){
            let ev = (this.extraValue && this.extraValue !== "Any") ? `extraValue="${this.extraValue}"` : "";
            g = `path="${this.path}" op="${esc(this.op)}" value="${esc(this.value)}" ${ev} code="${this.code}" ${e}`;
        }
        else if (this.ctype === "multivalue"){
            g = `path="${this.path}" op="${this.op}" code="${this.code}" ${e}`;
            h = this.values.map( v => `<value>${esc(v)}</value>` ).join('');
        }
        else if (this.ctype === "subclass")
            g = `path="${this.path}" type="${this.type}" ${e}`;
        else if (this.ctype === "null")
            g = `path="${this.path}" op="${this.op}" code="${this.code}" ${e}`;
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
  ${(t.where || []).map(c => c.c2xml(qonly)).join(" ")}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNGVjNTBkOGVkNTg2N2NmYTEyNGIiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDNkM7QUFVOUQ7QUFDa0I7QUFDbkI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIscUJBQXFCLFVBQVUsZ0NBQWdDO0FB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QXdCLEVBQUU7QUFDN0YsMkNBQTJDLHFCQUFxQixZQUFZLEVBQUUsSUFBSTtBQUNsRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLHNDQUFzQyxFQUFFO0FBQ3RGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFp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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLHVCQUF1QixJQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5QkFBeUIsd0JBQXdCLEVBQUU7O0FBRW5EO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSxpQkFBaUIsRUFBRTtBQUNwRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUwsa0JBQWtCOzs7Ozs7OztBQzVObEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixvREFBb0Q7QUFDaEYsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixjQUFjO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsY0FBYyxHQUFHLGNBQWM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsSUFBSTs7QUFFTDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNoN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoicWIuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNGVjNTBkOGVkNTg2N2NmYTEyNGIiLCJcbi8qXG4gKiBEYXRhIHN0cnVjdHVyZXM6XG4gKiAgIDAuIFRoZSBkYXRhIG1vZGVsIGZvciBhIG1pbmUgaXMgYSBncmFwaCBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBcbiAqICAgY2xhc3NlcywgdGhlaXIgY29tcG9uZW50cyAoYXR0cmlidXRlcywgcmVmZXJlbmNlcywgY29sbGVjdGlvbnMpLCBhbmQgcmVsYXRpb25zaGlwcy5cbiAqICAgMS4gVGhlIHF1ZXJ5IGlzIHJlcHJlc2VudGVkIGJ5IGEgZDMtc3R5bGUgaGllcmFyY2h5IHN0cnVjdHVyZTogYSBsaXN0IG9mXG4gKiAgIG5vZGVzLCB3aGVyZSBlYWNoIG5vZGUgaGFzIGEgbmFtZSAoc3RyaW5nKSwgYW5kIGEgY2hpbGRyZW4gbGlzdCAocG9zc2libHkgZW1wdHkgXG4gKiAgIGxpc3Qgb2Ygbm9kZXMpLiBUaGUgbm9kZXMgYW5kIHRoZSBwYXJlbnQvY2hpbGQgcmVsYXRpb25zaGlwcyBvZiB0aGlzIHN0cnVjdHVyZSBcbiAqICAgYXJlIHdoYXQgZHJpdmUgdGhlIGRpc2xheS5cbiAqICAgMi4gRWFjaCBub2RlIGluIHRoZSBkaWFncmFtIGNvcnJlc3BvbmRzIHRvIGEgY29tcG9uZW50IGluIGEgcGF0aCwgd2hlcmUgZWFjaFxuICogICBwYXRoIHN0YXJ0cyB3aXRoIHRoZSByb290IGNsYXNzLCBvcHRpb25hbGx5IHByb2NlZWRzIHRocm91Z2ggcmVmZXJlbmNlcyBhbmQgY29sbGVjdGlvbnMsXG4gKiAgIGFuZCBvcHRpb25hbGx5IGVuZHMgYXQgYW4gYXR0cmlidXRlLlxuICpcbiAqL1xuaW1wb3J0IHBhcnNlciBmcm9tICcuL3BhcnNlci5qcyc7XG4vL2ltcG9ydCB7IG1pbmVzIH0gZnJvbSAnLi9taW5lcy5qcyc7XG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHtcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgZ2V0TG9jYWwsXG4gICAgc2V0TG9jYWwsXG4gICAgdGVzdExvY2FsLFxuICAgIGNsZWFyTG9jYWwsXG4gICAgcGFyc2VQYXRoUXVlcnlcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQge2NvZGVwb2ludHN9IGZyb20gJy4vbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzJztcbmltcG9ydCBVbmRvTWFuYWdlciBmcm9tICcuL3VuZG9NYW5hZ2VyLmpzJztcblxubGV0IFZFUlNJT04gPSBcIjAuMS4wXCI7XG5cbmxldCBjdXJyTWluZTtcbmxldCBjdXJyVGVtcGxhdGU7XG5sZXQgY3Vyck5vZGU7XG5cbmxldCBuYW1lMm1pbmU7XG5sZXQgbTtcbmxldCB3O1xubGV0IGg7XG5sZXQgaTtcbmxldCByb290O1xubGV0IGRpYWdvbmFsO1xubGV0IHZpcztcbmxldCBub2RlcztcbmxldCBsaW5rcztcbmxldCBkcmFnQmVoYXZpb3IgPSBudWxsO1xubGV0IGFuaW1hdGlvbkR1cmF0aW9uID0gMjUwOyAvLyBtc1xubGV0IGRlZmF1bHRDb2xvcnMgPSB7IGhlYWRlcjogeyBtYWluOiBcIiM1OTU0NTVcIiwgdGV4dDogXCIjZmZmXCIgfSB9O1xubGV0IGRlZmF1bHRMb2dvID0gXCJodHRwczovL2Nkbi5yYXdnaXQuY29tL2ludGVybWluZS9kZXNpZ24tbWF0ZXJpYWxzLzc4YTEzZGI1L2xvZ29zL2ludGVybWluZS9zcXVhcmVpc2gvNDV4NDUucG5nXCI7XG5sZXQgdW5kb01nciA9IG5ldyBVbmRvTWFuYWdlcigpO1xubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5sZXQgZWRpdFZpZXdzID0ge1xuICAgIHF1ZXJ5TWFpbjoge1xuICAgICAgICBuYW1lOiBcInF1ZXJ5TWFpblwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCIsXG4gICAgICAgIG5vZGVDb21wOiBudWxsLFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbHVtbk9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwiY29sdW1uT3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc2VsZWN0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29sdW1uIG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNlbGVjdGlvbi1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gYS52aWV3IC0gYi52aWV3IDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGRyYWcgaW4gY29sdW1uT3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBjb2x1bW4gb3JkZXIgKGR1aCEpXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHsgbi52aWV3ID0gaSB9KTtcbiAgICAgICAgICBkcmFnZ2VkLnRlbXBsYXRlLnNlbGVjdCA9IG5vZGVzLm1hcCggbj0+IG4ucGF0aCApO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogbnVsbCxcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gbi52aWV3IDogXCJcIlxuICAgICAgICB9XG4gICAgfSxcbiAgICBzb3J0T3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJzb3J0T3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc29ydGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIHNvcnQgb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNvcnQtbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLnNvcnQpXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyBhLnNvcnQubGV2ZWwgLSBiLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIC8vIGRyYWcgaW4gc29ydE9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgc29ydCBvcmRlciAoZHVoISlcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHtcbiAgICAgICAgICAgICAgbi5zb3J0LmxldmVsID0gaVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uc29ydCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb25zdHJhaW50TG9naWM6IHtcbiAgICAgICAgbmFtZTogXCJjb25zdHJhaW50TG9naWNcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb25zdHJhaW50IGxvZ2ljIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gY29uc3RyYWluZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIGNvZGUgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBsZXQgYWNvbnN0ID0gYS5jb25zdHJhaW50cyAmJiBhLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGFjb2RlID0gYWNvbnN0ID8gYS5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBsZXQgYmNvbnN0ID0gYi5jb25zdHJhaW50cyAmJiBiLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGJjb2RlID0gYmNvbnN0ID8gYi5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBpZiAoYWNvbnN0KVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gKGFjb2RlIDwgYmNvZGUgPyAtMSA6IGFjb2RlID4gYmNvZGUgPyAxIDogMCkgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAxIDogbmFtZUNvbXAoYSwgYik7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbXBhcmF0b3IgZnVuY3Rpb24sIGZvciBzb3J0aW5nIGEgbGlzdCBvZiBub2RlcyBieSBuYW1lLiBDYXNlLWluc2Vuc2l0aXZlLlxuLy9cbmxldCBuYW1lQ29tcCA9IGZ1bmN0aW9uKGEsYikge1xuICAgIGxldCBuYSA9IGEubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBuYiA9IGIubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBuYSA8IG5iID8gLTEgOiBuYSA+IG5iID8gMSA6IDA7XG59O1xuXG4vLyBTdGFydGluZyBlZGl0IHZpZXcgaXMgdGhlIG1haW4gcXVlcnkgdmlldy5cbmxldCBlZGl0VmlldyA9IGVkaXRWaWV3cy5xdWVyeU1haW47XG5cbi8vIFNldHVwIGZ1bmN0aW9uXG5mdW5jdGlvbiBzZXR1cCgpe1xuICAgIG0gPSBbMjAsIDEyMCwgMjAsIDEyMF1cbiAgICB3ID0gMTI4MCAtIG1bMV0gLSBtWzNdXG4gICAgaCA9IDgwMCAtIG1bMF0gLSBtWzJdXG4gICAgaSA9IDBcblxuICAgIC8vXG4gICAgZDMuc2VsZWN0KCcjZm9vdGVyIFtuYW1lPVwidmVyc2lvblwiXScpXG4gICAgICAgIC50ZXh0KGBRQiB2JHtWRVJTSU9OfWApO1xuXG4gICAgLy8gdGhhbmtzIHRvOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTAwNzg3Ny9ob3ctdG8tdXNlLXRoZS1kMy1kaWFnb25hbC1mdW5jdGlvbi10by1kcmF3LWN1cnZlZC1saW5lc1xuICAgIGRpYWdvbmFsID0gZDMuc3ZnLmRpYWdvbmFsKClcbiAgICAgICAgLnNvdXJjZShmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC5zb3VyY2UueSwgXCJ5XCI6ZC5zb3VyY2UueH07IH0pICAgICBcbiAgICAgICAgLnRhcmdldChmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC50YXJnZXQueSwgXCJ5XCI6ZC50YXJnZXQueH07IH0pXG4gICAgICAgIC5wcm9qZWN0aW9uKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFtkLnksIGQueF07IH0pO1xuICAgIFxuICAgIC8vIGNyZWF0ZSB0aGUgU1ZHIGNvbnRhaW5lclxuICAgIHZpcyA9IGQzLnNlbGVjdChcIiNzdmdDb250YWluZXIgc3ZnXCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgdyArIG1bMV0gKyBtWzNdKVxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoICsgbVswXSArIG1bMl0pXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpXG4gICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtWzNdICsgXCIsXCIgKyBtWzBdICsgXCIpXCIpO1xuICAgIC8vXG4gICAgZDMuc2VsZWN0KCcuYnV0dG9uW25hbWU9XCJvcGVuY2xvc2VcIl0nKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpO1xuICAgICAgICAgICAgbGV0IHdhc0Nsb3NlZCA9IHQuY2xhc3NlZChcImNsb3NlZFwiKTtcbiAgICAgICAgICAgIGxldCBpc0Nsb3NlZCA9ICF3YXNDbG9zZWQ7XG4gICAgICAgICAgICBsZXQgZCA9IGQzLnNlbGVjdCgnI2RyYXdlcicpWzBdWzBdXG4gICAgICAgICAgICBpZiAoaXNDbG9zZWQpXG4gICAgICAgICAgICAgICAgLy8gc2F2ZSB0aGUgY3VycmVudCBoZWlnaHQganVzdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgICAgICAgICAgIGQuX19zYXZlZF9oZWlnaHQgPSBkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGQuX19zYXZlZF9oZWlnaHQpXG4gICAgICAgICAgICAgICAvLyBvbiBvcGVuLCByZXN0b3JlIHRoZSBzYXZlZCBoZWlnaHRcbiAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RyYXdlcicpLnN0eWxlKFwiaGVpZ2h0XCIsIGQuX19zYXZlZF9oZWlnaHQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsIGlzQ2xvc2VkKTtcbiAgICAgICAgfSk7XG5cbiAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5VXJsKVxuICAgICAgLnRoZW4oaW5pdE1pbmVzKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyByZWdpc3RyeSBhdCAke3JlZ2lzdHJ5VXJsfS4gVHJ5aW5nICR7cmVnaXN0cnlGaWxlVXJsfS5gKTtcbiAgICAgICAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5RmlsZVVybClcbiAgICAgICAgICAgICAgLnRoZW4oaW5pdE1pbmVzKVxuICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgYWxlcnQoXCJDYW5ub3QgYWNjZXNzIHJlZ2lzdHJ5IGZpbGUuIFRoaXMgaXMgbm90IHlvdXIgbHVja3kgZGF5LlwiKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgdXBkYXRlVHRleHQoKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgLm9uKCdjbGljaycsIHJ1bmF0bWluZSk7XG4gICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgdC50ZXh0KCB0dXJuU3luY09mZiA/IFwic3luY19kaXNhYmxlZFwiIDogXCJzeW5jXCIgKVxuICAgICAgICAgICAgIC5hdHRyKFwidGl0bGVcIiwgKCkgPT5cbiAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgIXR1cm5TeW5jT2ZmICYmIHVwZGF0ZUNvdW50KCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIilcbiAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwianNvbnRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI3VuZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgdW5kbyk7XG4gICAgZDMuc2VsZWN0KFwiI3JlZG9CdXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgcmVkbyk7XG5cbiAgLy9cbiAgZHJhZ0JlaGF2aW9yID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgLm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBvbiBkcmFnLCBmb2xsb3cgdGhlIG1vdXNlIGluIHRoZSBZIGRpbWVuc2lvbi5cbiAgICAgIC8vIERyYWcgY2FsbGJhY2sgaXMgYXR0YWNoZWQgdG8gdGhlIGRyYWcgaGFuZGxlLlxuICAgICAgbGV0IG5vZGVHcnAgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAvLyB1cGRhdGUgbm9kZSdzIHktY29vcmRpbmF0ZVxuICAgICAgbm9kZUdycC5hdHRyKFwidHJhbnNmb3JtXCIsIChuKSA9PiB7XG4gICAgICAgICAgbi55ID0gZDMuZXZlbnQueTtcbiAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke24ueH0sJHtuLnl9KWA7XG4gICAgICB9KTtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgbm9kZSdzIGxpbmtcbiAgICAgIGxldCBsbCA9IGQzLnNlbGVjdChgcGF0aC5saW5rW3RhcmdldD1cIiR7bm9kZUdycC5hdHRyKCdpZCcpfVwiXWApO1xuICAgICAgbGwuYXR0cihcImRcIiwgZGlhZ29uYWwpO1xuICAgICAgfSlcbiAgICAub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIG9uIGRyYWdlbmQsIHJlc29ydCB0aGUgZHJhZ2dhYmxlIG5vZGVzIGFjY29yZGluZyB0byB0aGVpciBZIHBvc2l0aW9uXG4gICAgICBsZXQgbm9kZXMgPSBkMy5zZWxlY3RBbGwoZWRpdFZpZXcuZHJhZ2dhYmxlKS5kYXRhKClcbiAgICAgIG5vZGVzLnNvcnQoIChhLCBiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgIC8vIHRoZSBub2RlIHRoYXQgd2FzIGRyYWdnZWRcbiAgICAgIGxldCBkcmFnZ2VkID0gZDMuc2VsZWN0KHRoaXMpLmRhdGEoKVswXTtcbiAgICAgIC8vIGNhbGxiYWNrIGZvciBzcGVjaWZpYyBkcmFnLWVuZCBiZWhhdmlvclxuICAgICAgZWRpdFZpZXcuYWZ0ZXJEcmFnICYmIGVkaXRWaWV3LmFmdGVyRHJhZyhub2RlcywgZHJhZ2dlZCk7XG4gICAgICAvL1xuICAgICAgdXBkYXRlKCk7XG4gICAgICBzYXZlU3RhdGUoKTtcbiAgICAgIC8vXG4gICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0TWluZXMoal9taW5lcykge1xuICAgIHZhciBtaW5lcyA9IGpfbWluZXMuaW5zdGFuY2VzO1xuICAgIG5hbWUybWluZSA9IHt9O1xuICAgIG1pbmVzLmZvckVhY2goZnVuY3Rpb24obSl7IG5hbWUybWluZVttLm5hbWVdID0gbTsgfSk7XG4gICAgY3Vyck1pbmUgPSBtaW5lc1swXTtcbiAgICBjdXJyVGVtcGxhdGUgPSBudWxsO1xuXG4gICAgdmFyIG1sID0gZDMuc2VsZWN0KFwiI21saXN0XCIpLnNlbGVjdEFsbChcIm9wdGlvblwiKS5kYXRhKG1pbmVzKTtcbiAgICB2YXIgc2VsZWN0TWluZSA9IFwiTW91c2VNaW5lXCI7XG4gICAgbWwuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIilcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgIHZhciBtID0gZC51cmwuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgdmFyIHYgPSAodyAmJiAhbSkgfHwgbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lPT09c2VsZWN0TWluZSB8fCBudWxsOyB9KVxuICAgICAgICAudGV4dChmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSk7XG4gICAgLy9cbiAgICAvLyB3aGVuIGEgbWluZSBpcyBzZWxlY3RlZCBmcm9tIHRoZSBsaXN0XG4gICAgZDMuc2VsZWN0KFwiI21saXN0XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZE1pbmUodGhpcy52YWx1ZSk7IH0pO1xuICAgIC8vXG4gICAgdmFyIGRnID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKTtcbiAgICBkZy5jbGFzc2VkKFwiaGlkZGVuXCIsdHJ1ZSlcbiAgICBkZy5zZWxlY3QoXCIuYnV0dG9uLmNsb3NlXCIpLm9uKFwiY2xpY2tcIiwgaGlkZURpYWxvZyk7XG4gICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5yZW1vdmVcIikub24oXCJjbGlja1wiLCAoKSA9PiByZW1vdmVOb2RlKGN1cnJOb2RlKSk7XG5cbiAgICAvLyBcbiAgICAvL1xuICAgIGQzLnNlbGVjdChcIiNlZGl0VmlldyBzZWxlY3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHsgc2V0RWRpdFZpZXcodGhpcy52YWx1ZSk7IH0pXG4gICAgICAgIDtcblxuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc3ViY2xhc3NDb25zdHJhaW50IHNlbGVjdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2V0U3ViY2xhc3NDb25zdHJhaW50KGN1cnJOb2RlLCB0aGlzLnZhbHVlKTsgfSk7XG4gICAgLy8gV2lyZSB1cCBzZWxlY3QgYnV0dG9uIGluIGRpYWxvZ1xuICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGN1cnJOb2RlLmlzU2VsZWN0ZWQgPyBjdXJyTm9kZS51bnNlbGVjdCgpIDogY3Vyck5vZGUuc2VsZWN0KCk7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzZWxlY3QtY3RybFwiXScpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBjdXJyTm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgLy8gV2lyZSB1cCBzb3J0IGZ1bmN0aW9uIGluIGRpYWxvZ1xuICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXSAuc3dhdGNoJylcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgY2MgPSBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzb3J0LWN0cmxcIl0nKTtcbiAgICAgICAgICAgIGxldCBjdXJyU29ydCA9IGNjLmNsYXNzZWRcbiAgICAgICAgICAgIGxldCBvbGRzb3J0ID0gY2MuY2xhc3NlZChcInNvcnRhc2NcIikgPyBcImFzY1wiIDogY2MuY2xhc3NlZChcInNvcnRkZXNjXCIpID8gXCJkZXNjXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgIGxldCBuZXdzb3J0ID0gb2xkc29ydCA9PT0gXCJhc2NcIiA/IFwiZGVzY1wiIDogb2xkc29ydCA9PT0gXCJkZXNjXCIgPyBcIm5vbmVcIiA6IFwiYXNjXCI7XG4gICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGFzY1wiLCBuZXdzb3J0ID09PSBcImFzY1wiKTtcbiAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuZXdzb3J0ID09PSBcImRlc2NcIik7XG4gICAgICAgICAgICBjdXJyTm9kZS5zZXRTb3J0KG5ld3NvcnQpO1xuICAgICAgICAgICAgdXBkYXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgICB9KTtcblxuICAgIC8vIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG1pbmUgYnkgZGVmYXVsdC5cbiAgICBzZWxlY3RlZE1pbmUoc2VsZWN0TWluZSk7XG59XG4vL1xuZnVuY3Rpb24gY2xlYXJTdGF0ZSgpIHtcbiAgICB1bmRvTWdyLmNsZWFyKCk7XG59XG5mdW5jdGlvbiBzYXZlU3RhdGUoKSB7XG4gICAgbGV0IHMgPSBKU09OLnN0cmluZ2lmeSh1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpKTtcbiAgICB1bmRvTWdyLmFkZChzKTtcbn1cbmZ1bmN0aW9uIHVuZG8oKSB7IHVuZG9yZWRvKFwidW5kb1wiKSB9XG5mdW5jdGlvbiByZWRvKCkgeyB1bmRvcmVkbyhcInJlZG9cIikgfVxuZnVuY3Rpb24gdW5kb3JlZG8od2hpY2gpe1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzID0gSlNPTi5wYXJzZSh1bmRvTWdyW3doaWNoXSgpKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKHMsIHRydWUpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG4vLyBDYWxsZWQgd2hlbiB1c2VyIHNlbGVjdHMgYSBtaW5lIGZyb20gdGhlIG9wdGlvbiBsaXN0XG4vLyBMb2FkcyB0aGF0IG1pbmUncyBkYXRhIG1vZGVsIGFuZCBhbGwgaXRzIHRlbXBsYXRlcy5cbi8vIFRoZW4gaW5pdGlhbGl6ZXMgZGlzcGxheSB0byBzaG93IHRoZSBmaXJzdCB0ZXJtcGxhdGUncyBxdWVyeS5cbmZ1bmN0aW9uIHNlbGVjdGVkTWluZShtbmFtZSl7XG4gICAgY3Vyck1pbmUgPSBuYW1lMm1pbmVbbW5hbWVdXG4gICAgaWYoIWN1cnJNaW5lKSByZXR1cm47XG4gICAgbGV0IHVybCA9IGN1cnJNaW5lLnVybDtcbiAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICBjdXJyTWluZS50bmFtZXMgPSBbXVxuICAgIGN1cnJNaW5lLnRlbXBsYXRlcyA9IFtdXG4gICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikgeyBcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9tb2RlbC5qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9saXN0cy5qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zdW1tYXJ5ZmllbGRzLmpzb25cIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL29yZ2FuaXNtbGlzdC5qc29uXCI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0dXJsID0gdXJsICsgXCIvc2VydmljZS90ZW1wbGF0ZXM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbHVybCA9IHVybCArIFwiL3NlcnZpY2UvbGlzdHM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgYnVybCA9IHVybCArIFwiL3NlcnZpY2UvYnJhbmRpbmdcIjtcbiAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICBvdXJsID0gdXJsICsgXCIvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSUzQ3F1ZXJ5K25hbWUlM0QlMjIlMjIrbW9kZWwlM0QlMjJnZW5vbWljJTIyK3ZpZXclM0QlMjJPcmdhbmlzbS5zaG9ydE5hbWUlMjIrbG9uZ0Rlc2NyaXB0aW9uJTNEJTIyJTIyJTNFJTNDJTJGcXVlcnklM0UmZm9ybWF0PWpzb25vYmplY3RzXCI7XG4gICAgfVxuICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICBjb25zb2xlLmxvZyhcIkxvYWRpbmcgcmVzb3VyY2VzIGZyb20gXCIgKyB1cmwgKTtcbiAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgIGQzanNvblByb21pc2UodHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UobHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgIGQzanNvblByb21pc2Uoc3VybCksXG4gICAgICAgIGQzanNvblByb21pc2Uob3VybClcbiAgICBdKS50aGVuKCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBqX21vZGVsID0gZGF0YVswXTtcbiAgICAgICAgdmFyIGpfdGVtcGxhdGVzID0gZGF0YVsxXTtcbiAgICAgICAgdmFyIGpfbGlzdHMgPSBkYXRhWzJdO1xuICAgICAgICB2YXIgal9icmFuZGluZyA9IGRhdGFbM107XG4gICAgICAgIHZhciBqX3N1bW1hcnkgPSBkYXRhWzRdO1xuICAgICAgICB2YXIgal9vcmdhbmlzbXMgPSBkYXRhWzVdO1xuICAgICAgICAvL1xuICAgICAgICBjdXJyTWluZS5tb2RlbCA9IGNvbXBpbGVNb2RlbChqX21vZGVsLm1vZGVsKVxuICAgICAgICBjdXJyTWluZS50ZW1wbGF0ZXMgPSBqX3RlbXBsYXRlcy50ZW1wbGF0ZXM7XG4gICAgICAgIGN1cnJNaW5lLmxpc3RzID0gal9saXN0cy5saXN0cztcbiAgICAgICAgY3Vyck1pbmUuc3VtbWFyeUZpZWxkcyA9IGpfc3VtbWFyeS5jbGFzc2VzO1xuICAgICAgICBjdXJyTWluZS5vcmdhbmlzbUxpc3QgPSBqX29yZ2FuaXNtcy5yZXN1bHRzLm1hcChvID0+IG8uc2hvcnROYW1lKTtcbiAgICAgICAgLy9cbiAgICAgICAgY3Vyck1pbmUudGxpc3QgPSBvYmoyYXJyYXkoY3Vyck1pbmUudGVtcGxhdGVzKVxuICAgICAgICBjdXJyTWluZS50bGlzdC5zb3J0KGZ1bmN0aW9uKGEsYil7IFxuICAgICAgICAgICAgcmV0dXJuIGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiBhLnRpdGxlID4gYi50aXRsZSA/IDEgOiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgY3Vyck1pbmUudG5hbWVzID0gT2JqZWN0LmtleXMoIGN1cnJNaW5lLnRlbXBsYXRlcyApO1xuICAgICAgICBjdXJyTWluZS50bmFtZXMuc29ydCgpO1xuICAgICAgICAvLyBGaWxsIGluIHRoZSBzZWxlY3Rpb24gbGlzdCBvZiB0ZW1wbGF0ZXMgZm9yIHRoaXMgbWluZS5cbiAgICAgICAgdmFyIHRsID0gZDMuc2VsZWN0KFwiI3RsaXN0IHNlbGVjdFwiKVxuICAgICAgICAgICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAgICAgICAgIC5kYXRhKCBjdXJyTWluZS50bGlzdCApO1xuICAgICAgICB0bC5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJylcbiAgICAgICAgdGwuZXhpdCgpLnJlbW92ZSgpXG4gICAgICAgIHRsLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSlcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihkKXtyZXR1cm4gZC50aXRsZTt9KTtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgc3RhcnRFZGl0KTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1tjdXJyTWluZS50bGlzdFswXS5uYW1lXSk7XG4gICAgICAgIC8vIEFwcGx5IGJyYW5kaW5nXG4gICAgICAgIGxldCBjbHJzID0gY3Vyck1pbmUuY29sb3JzIHx8IGRlZmF1bHRDb2xvcnM7XG4gICAgICAgIGxldCBiZ2MgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLm1haW4gOiBjbHJzLm1haW4uZmc7XG4gICAgICAgIGxldCB0eGMgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLnRleHQgOiBjbHJzLm1haW4uYmc7XG4gICAgICAgIGxldCBsb2dvID0gY3Vyck1pbmUuaW1hZ2VzLmxvZ28gfHwgZGVmYXVsdExvZ287XG4gICAgICAgIGQzLnNlbGVjdChcIiN0b29sdHJheVwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI21pbmVMb2dvXCIpXG4gICAgICAgICAgICAuYXR0cihcInNyY1wiLCBsb2dvKTtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibWluZW5hbWVcIl0nKVxuICAgICAgICAgICAgLnRleHQoY3Vyck1pbmUubmFtZSk7XG4gICAgICAgIC8vIHBvcHVsYXRlIGNsYXNzIGxpc3QgXG4gICAgICAgIGxldCBjbGlzdCA9IE9iamVjdC5rZXlzKGN1cnJNaW5lLm1vZGVsLmNsYXNzZXMpO1xuICAgICAgICBjbGlzdC5zb3J0KCk7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFwiI25ld3FjbGlzdCBzZWxlY3RcIiwgY2xpc3QpO1xuICAgICAgICBkMy5zZWxlY3QoJyNlZGl0U291cmNlU2VsZWN0b3IgW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnNlbGVjdGVkSW5kZXggPSAxOyB9KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNlbGVjdGVkRWRpdFNvdXJjZSh0aGlzLnZhbHVlKTsgc3RhcnRFZGl0KCk7IH0pO1xuICAgICAgICBkMy5zZWxlY3QoXCIjeG1sdGV4dGFyZWFcIilbMF1bMF0udmFsdWUgPSBcIlwiO1xuICAgICAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgc2VsZWN0ZWRFZGl0U291cmNlKCBcInRsaXN0XCIgKTtcblxuICAgIH0sIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgJHtjdXJyTWluZS5uYW1lfS4gU3RhdHVzPSR7ZXJyb3Iuc3RhdHVzfS4gRXJyb3I9JHtlcnJvci5zdGF0dXNUZXh0fS4gKElmIHRoZXJlIGlzIG5vIGVycm9yIG1lc3NhZ2UsIHRoZW4gaXRzIHByb2JhYmx5IGEgQ09SUyBpc3N1ZS4pYCk7XG4gICAgfSk7XG59XG5cbi8vIEJlZ2lucyBhbiBlZGl0LCBiYXNlZCBvbiB1c2VyIGNvbnRyb2xzLlxuZnVuY3Rpb24gc3RhcnRFZGl0KCkge1xuICAgIC8vIHNlbGVjdG9yIGZvciBjaG9vc2luZyBlZGl0IGlucHV0IHNvdXJjZSwgYW5kIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGxldCBzcmNTZWxlY3RvciA9IGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKTtcbiAgICAvLyB0aGUgY2hvc2VuIGVkaXQgc291cmNlXG4gICAgbGV0IGlucHV0SWQgPSBzcmNTZWxlY3RvclswXVswXS52YWx1ZTtcbiAgICAvLyB0aGUgcXVlcnkgaW5wdXQgZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RlZCBzb3VyY2VcbiAgICBsZXQgc3JjID0gZDMuc2VsZWN0KGAjJHtpbnB1dElkfSBbbmFtZT1cImluXCJdYCk7XG4gICAgLy8gdGhlIHF1ZXJ5IHN0YXJ0aW5nIHBvaW50XG4gICAgbGV0IHZhbCA9IHNyY1swXVswXS52YWx1ZVxuICAgIGlmIChpbnB1dElkID09PSBcInRsaXN0XCIpIHtcbiAgICAgICAgLy8gYSBzYXZlZCBxdWVyeSBvciB0ZW1wbGF0ZVxuICAgICAgICBlZGl0VGVtcGxhdGUoY3Vyck1pbmUudGVtcGxhdGVzW3ZhbF0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcIm5ld3FjbGlzdFwiKSB7XG4gICAgICAgIC8vIGEgbmV3IHF1ZXJ5IGZyb20gYSBzZWxlY3RlZCBzdGFydGluZyBjbGFzc1xuICAgICAgICBsZXQgbnQgPSBuZXcgVGVtcGxhdGUoKTtcbiAgICAgICAgbnQuc2VsZWN0LnB1c2godmFsK1wiLmlkXCIpO1xuICAgICAgICBlZGl0VGVtcGxhdGUobnQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydHhtbFwiKSB7XG4gICAgICAgIC8vIGltcG9ydCB4bWwgcXVlcnlcbiAgICAgICAgdmFsICYmIGVkaXRUZW1wbGF0ZShwYXJzZVBhdGhRdWVyeSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnRqc29uXCIpIHtcbiAgICAgICAgLy8gaW1wb3J0IGpzb24gcXVlcnlcbiAgICAgICAgdmFsICYmIGVkaXRUZW1wbGF0ZShKU09OLnBhcnNlKHZhbCkpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHRocm93IFwiVW5rbm93biBlZGl0IHNvdXJjZS5cIlxufVxuXG4vLyBcbmZ1bmN0aW9uIHNlbGVjdGVkRWRpdFNvdXJjZShzaG93KXtcbiAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSA+IGRpdi5vcHRpb24nKVxuICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLmlkID09PSBzaG93ID8gbnVsbCA6IFwibm9uZVwiOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBvYmplY3QuXG4vLyBUaGUgbGlzdCBpcyBzb3J0ZWQgYnkgdGhlIGl0ZW0ga2V5cy5cbi8vIElmIG5hbWVBdHRyIGlzIHNwZWNpZmllZCwgdGhlIGl0ZW0ga2V5IGlzIGFsc28gYWRkZWQgdG8gZWFjaCBlbGVtZW50XG4vLyBhcyBhbiBhdHRyaWJ1dGUgKG9ubHkgd29ya3MgaWYgdGhvc2UgaXRlbXMgYXJlIHRoZW1zZWx2ZXMgb2JqZWN0cykuXG4vLyBFeGFtcGxlczpcbi8vICAgIHN0YXRlcyA9IHsnTUUnOntuYW1lOidNYWluZSd9LCAnSUEnOntuYW1lOidJb3dhJ319XG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YSd9LCB7bmFtZTonTWFpbmUnfV1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMsICdhYmJyZXYnKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YScsYWJicmV2J0lBJ30sIHtuYW1lOidNYWluZScsYWJicmV2J01FJ31dXG4vLyBBcmdzOlxuLy8gICAgbyAgKG9iamVjdCkgVGhlIG9iamVjdC5cbi8vICAgIG5hbWVBdHRyIChzdHJpbmcpIElmIHNwZWNpZmllZCwgYWRkcyB0aGUgaXRlbSBrZXkgYXMgYW4gYXR0cmlidXRlIHRvIGVhY2ggbGlzdCBlbGVtZW50LlxuLy8gUmV0dXJuOlxuLy8gICAgbGlzdCBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIG9cbmZ1bmN0aW9uIG9iajJhcnJheShvLCBuYW1lQXR0cil7XG4gICAgdmFyIGtzID0gT2JqZWN0LmtleXMobyk7XG4gICAga3Muc29ydCgpO1xuICAgIHJldHVybiBrcy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG5hbWVBdHRyKSBvW2tdLm5hbWUgPSBrO1xuICAgICAgICByZXR1cm4gb1trXTtcbiAgICB9KTtcbn07XG5cbi8vIEFkZCBkaXJlY3QgY3Jvc3MgcmVmZXJlbmNlcyB0byBuYW1lZCB0eXBlcy4gKEUuZy4sIHdoZXJlIHRoZVxuLy8gbW9kZWwgc2F5cyB0aGF0IEdlbmUuYWxsZWxlcyBpcyBhIGNvbGxlY3Rpb24gd2hvc2UgcmVmZXJlbmNlZFR5cGVcbi8vIGlzIHRoZSBzdHJpbmcgXCJBbGxlbGVcIiwgYWRkIGEgZGlyZWN0IHJlZmVyZW5jZSB0byB0aGUgQWxsZWxlIGNsYXNzKVxuLy8gQWxzbyBhZGRzIGFycmF5cyBmb3IgY29udmVuaWVuY2UgZm9yIGFjY2Vzc2luZyBhbGwgY2xhc3NlcyBvciBhbGwgYXR0cmlidXRlcyBvZiBhIGNsYXNzLlxuLy9cbmZ1bmN0aW9uIGNvbXBpbGVNb2RlbChtb2RlbCl7XG4gICAgLy8gRmlyc3QgYWRkIGNsYXNzZXMgdGhhdCByZXByZXNlbnQgdGhlIGJhc2ljIHR5cGVcbiAgICBMRUFGVFlQRVMuZm9yRWFjaChmdW5jdGlvbihuKXtcbiAgICAgICAgbW9kZWwuY2xhc3Nlc1tuXSA9IHtcbiAgICAgICAgICAgIGlzTGVhZlR5cGU6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiBuLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IG4sXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXSxcbiAgICAgICAgICAgIHJlZmVyZW5jZXM6IFtdLFxuICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vXG4gICAgbW9kZWwuYWxsQ2xhc3NlcyA9IG9iajJhcnJheShtb2RlbC5jbGFzc2VzKVxuICAgIHZhciBjbnMgPSBPYmplY3Qua2V5cyhtb2RlbC5jbGFzc2VzKTtcbiAgICBjbnMuc29ydCgpXG4gICAgY25zLmZvckVhY2goZnVuY3Rpb24oY24pe1xuICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzID0gb2JqMmFycmF5KGNscy5hdHRyaWJ1dGVzKVxuICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcyA9IG9iajJhcnJheShjbHMucmVmZXJlbmNlcylcbiAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJhdHRyaWJ1dGVcIjsgfSk7XG4gICAgICAgIGNscy5hbGxSZWZlcmVuY2VzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwicmVmZXJlbmNlXCI7IH0pO1xuICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICBjbHMuYWxsUGFydHMgPSBjbHMuYWxsQXR0cmlidXRlcy5jb25jYXQoY2xzLmFsbFJlZmVyZW5jZXMpLmNvbmNhdChjbHMuYWxsQ29sbGVjdGlvbnMpO1xuICAgICAgICBjbHMuYWxsUGFydHMuc29ydChmdW5jdGlvbihhLGIpeyByZXR1cm4gYS5uYW1lIDwgYi5uYW1lID8gLTEgOiBhLm5hbWUgPiBiLm5hbWUgPyAxIDogMDsgfSk7XG4gICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAvL1xuICAgICAgICBjbHNbXCJleHRlbmRzXCJdID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICB2YXIgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgaWYgKGJjLmV4dGVuZGVkQnkpIHtcbiAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5LnB1c2goY2xzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkgPSBbY2xzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiYztcbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIE9iamVjdC5rZXlzKGNscy5yZWZlcmVuY2VzKS5mb3JFYWNoKGZ1bmN0aW9uKHJuKXtcbiAgICAgICAgICAgIHZhciByID0gY2xzLnJlZmVyZW5jZXNbcm5dO1xuICAgICAgICAgICAgci50eXBlID0gbW9kZWwuY2xhc3Nlc1tyLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgIHZhciBjID0gY2xzLmNvbGxlY3Rpb25zW2NuXTtcbiAgICAgICAgICAgIGMudHlwZSA9IG1vZGVsLmNsYXNzZXNbYy5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1vZGVsO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1cGVyY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoXG4vLyBUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHNbXCJleHRlbmRzXCJdIHx8IGNsc1tcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgYW5jID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3VwZXJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNsc1tcImV4dGVuZHNcIl0uY29uY2F0KGFuYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1YmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdWJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHMuZXh0ZW5kZWRCeSB8fCBjbHMuZXh0ZW5kZWRCeS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBkZXNjID0gY2xzLmV4dGVuZGVkQnkubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1YmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzLmV4dGVuZGVkQnkuY29uY2F0KGRlc2MucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiBzdWIgaXMgYSBzdWJjbGFzcyBvZiBzdXAuXG5mdW5jdGlvbiBpc1N1YmNsYXNzKHN1YixzdXApIHtcbiAgICBpZiAoc3ViID09PSBzdXApIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2Yoc3ViKSA9PT0gXCJzdHJpbmdcIiB8fCAhc3ViW1wiZXh0ZW5kc1wiXSB8fCBzdWJbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHIgPSBzdWJbXCJleHRlbmRzXCJdLmZpbHRlcihmdW5jdGlvbih4KXsgcmV0dXJuIHg9PT1zdXAgfHwgaXNTdWJjbGFzcyh4LCBzdXApOyB9KTtcbiAgICByZXR1cm4gci5sZW5ndGggPiAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBsaXN0IGlzIHZhbGlkIGFzIGEgbGlzdCBjb25zdHJhaW50IG9wdGlvbiBmb3Jcbi8vIHRoZSBub2RlIG4uIEEgbGlzdCBpcyB2YWxpZCB0byB1c2UgaW4gYSBsaXN0IGNvbnN0cmFpbnQgYXQgbm9kZSBuIGlmZlxuLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGVxdWFsIHRvIG9yIGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlXG4vLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgYSBzdXBlcmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZS4gSW4gdGhpcyBjYXNlLFxuLy8gICAgICAgZWxlbWVudHMgaW4gdGhlIGxpc3QgdGhhdCBhcmUgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgbm9kZSdzIHR5cGVcbi8vICAgICAgIGFyZSBhdXRvbWF0aWNhbGx5IGZpbHRlcmVkIG91dC5cbmZ1bmN0aW9uIGlzVmFsaWRMaXN0Q29uc3RyYWludChsaXN0LCBuKXtcbiAgICB2YXIgbnQgPSBuLnN1YnR5cGVDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgaWYgKHR5cGVvZihudCkgPT09IFwic3RyaW5nXCIgKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGx0ID0gY3Vyck1pbmUubW9kZWwuY2xhc3Nlc1tsaXN0LnR5cGVdO1xuICAgIHJldHVybiBpc1N1YmNsYXNzKGx0LCBudCkgfHwgaXNTdWJjbGFzcyhudCwgbHQpO1xufVxuXG4vLyBDb21waWxlcyBhIFwicmF3XCIgdGVtcGxhdGUgLSBzdWNoIGFzIG9uZSByZXR1cm5lZCBieSB0aGUgL3RlbXBsYXRlcyB3ZWIgc2VydmljZSAtIGFnYWluc3Rcbi8vIGEgbW9kZWwuIFRoZSBtb2RlbCBzaG91bGQgaGF2ZSBiZWVuIHByZXZpb3VzbHkgY29tcGlsZWQuXG4vLyBBcmdzOlxuLy8gICB0ZW1wbGF0ZSAtIGEgdGVtcGxhdGUgcXVlcnkgYXMgYSBqc29uIG9iamVjdFxuLy8gICBtb2RlbCAtIHRoZSBtaW5lJ3MgbW9kZWwsIGFscmVhZHkgY29tcGlsZWQgKHNlZSBjb21waWxlTW9kZWwpLlxuLy8gUmV0dXJuczpcbi8vICAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICBDcmVhdGVzIGEgdHJlZSBvZiBxdWVyeSBub2RlcyAoc3VpdGFibGUgZm9yIGRyYXdpbmcgYnkgZDMsIEJUVykuXG4vLyAgIEFkZHMgdGhpcyB0cmVlIHRvIHRoZSB0ZW1wbGF0ZSBvYmplY3QgYXMgYXR0cmlidXRlICdxdHJlZScuXG4vLyAgIFR1cm5zIGVhY2ggKHN0cmluZykgcGF0aCBpbnRvIGEgcmVmZXJlbmNlIHRvIGEgdHJlZSBub2RlIGNvcnJlc3BvbmRpbmcgdG8gdGhhdCBwYXRoLlxuZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlLCBtb2RlbCkge1xuICAgIHZhciByb290cyA9IFtdXG4gICAgdmFyIHQgPSB0ZW1wbGF0ZTtcbiAgICAvLyB0aGUgdHJlZSBvZiBub2RlcyByZXByZXNlbnRpbmcgdGhlIGNvbXBpbGVkIHF1ZXJ5IHdpbGwgZ28gaGVyZVxuICAgIHQucXRyZWUgPSBudWxsO1xuICAgIC8vIGluZGV4IG9mIGNvZGUgdG8gY29uc3RyYWludCBnb3JzIGhlcmUuXG4gICAgdC5jb2RlMmMgPSB7fVxuICAgIC8vIG5vcm1hbGl6ZSB0aGluZ3MgdGhhdCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgdC5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgdC5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAvL1xuICAgIHZhciBzdWJjbGFzc0NzID0gW107XG4gICAgdC53aGVyZSAmJiB0LndoZXJlLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgIGlmIChjLnR5cGUpIHtcbiAgICAgICAgICAgIGMub3AgPSBcIklTQVwiXG4gICAgICAgICAgICBzdWJjbGFzc0NzLnB1c2goYyk7XG4gICAgICAgIH1cbiAgICAgICAgYy5jdHlwZSA9IE9QSU5ERVhbYy5vcF0uY3R5cGU7XG4gICAgICAgIGlmIChjLmNvZGUpIHQuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICAgICAgLy8gV2l0aCBudWxsL25vdC1udWxsIGNvbnN0cmFpbnRzLCBJTSBoYXMgYSB3ZWlyZCBxdWlyayBvZiBmaWxsaW5nIHRoZSB2YWx1ZSBcbiAgICAgICAgICAgIC8vIGZpZWxkIHdpdGggdGhlIG9wZXJhdG9yLiBFLmcuLCBmb3IgYW4gXCJJUyBOT1QgTlVMTFwiIG9wcmVhdG9yLCB0aGUgdmFsdWUgZmllbGQgaXNcbiAgICAgICAgICAgIC8vIGFsc28gXCJJUyBOT1QgTlVMTFwiLiBcbiAgICAgICAgICAgIC8vIFxuICAgICAgICAgICAgYy52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgLy8gVE9ETzogZGVhbCB3aXRoIGV4dHJhVmFsdWUgaGVyZSAoPylcbiAgICAgICAgfVxuICAgIH0pXG4gICAgLy8gbXVzdCBwcm9jZXNzIGFueSBzdWJjbGFzcyBjb25zdHJhaW50cyBmaXJzdCwgZnJvbSBzaG9ydGVzdCB0byBsb25nZXN0IHBhdGhcbiAgICBzdWJjbGFzc0NzXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wYXRoLmxlbmd0aCAtIGIucGF0aC5sZW5ndGg7XG4gICAgICAgIH0pXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBjLnBhdGgsIG1vZGVsKTtcbiAgICAgICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjLnR5cGVdO1xuICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICB9KTtcbiAgICAvL1xuICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgYy5wYXRoLCBtb2RlbCk7XG4gICAgICAgIGlmIChuLmNvbnN0cmFpbnRzKVxuICAgICAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKGMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMgPSBbY107XG4gICAgfSlcblxuICAgIC8vXG4gICAgdC5zZWxlY3QgJiYgdC5zZWxlY3QuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgcCwgbW9kZWwpO1xuICAgICAgICBuLnNlbGVjdCgpO1xuICAgIH0pXG4gICAgdC5qb2lucyAmJiB0LmpvaW5zLmZvckVhY2goZnVuY3Rpb24oail7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBqLCBtb2RlbCk7XG4gICAgICAgIG4uam9pbiA9IFwib3V0ZXJcIjtcbiAgICB9KVxuICAgIHQub3JkZXJCeSAmJiB0Lm9yZGVyQnkuZm9yRWFjaChmdW5jdGlvbihvLCBpKXtcbiAgICAgICAgdmFyIHAgPSBPYmplY3Qua2V5cyhvKVswXVxuICAgICAgICB2YXIgZGlyID0gb1twXVxuICAgICAgICB2YXIgbiA9IGFkZFBhdGgodCwgcCwgbW9kZWwpO1xuICAgICAgICBuLnNvcnQgPSB7IGRpcjogZGlyLCBsZXZlbDogaSB9O1xuICAgIH0pO1xuICAgIGlmICghdC5xdHJlZSkge1xuICAgICAgICB0aHJvdyBcIk5vIHBhdGhzIGluIHF1ZXJ5LlwiXG4gICAgfVxuICAgIHJldHVybiB0O1xufVxuXG4vLyBUdXJucyBhIHF0cmVlIHN0cnVjdHVyZSBiYWNrIGludG8gYSBcInJhd1wiIHRlbXBsYXRlLiBcbi8vXG5mdW5jdGlvbiB1bmNvbXBpbGVUZW1wbGF0ZSh0bXBsdCl7XG4gICAgdmFyIHQgPSB7XG4gICAgICAgIG5hbWU6IHRtcGx0Lm5hbWUsXG4gICAgICAgIHRpdGxlOiB0bXBsdC50aXRsZSxcbiAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICBjb21tZW50OiB0bXBsdC5jb21tZW50LFxuICAgICAgICByYW5rOiB0bXBsdC5yYW5rLFxuICAgICAgICBtb2RlbDogZGVlcGModG1wbHQubW9kZWwpLFxuICAgICAgICB0YWdzOiBkZWVwYyh0bXBsdC50YWdzKSxcbiAgICAgICAgc2VsZWN0IDogdG1wbHQuc2VsZWN0LmNvbmNhdCgpLFxuICAgICAgICB3aGVyZSA6IFtdLFxuICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICBjb25zdHJhaW50TG9naWM6IHRtcGx0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiLFxuICAgICAgICBvcmRlckJ5IDogW11cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVhY2gobil7XG4gICAgICAgIHZhciBwID0gbi5wYXRoXG4gICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHBhdGggc2hvdWxkIGFscmVhZHkgYmUgdGhlcmVcbiAgICAgICAgICAgIGlmICh0LnNlbGVjdC5pbmRleE9mKG4ucGF0aCkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgfVxuICAgICAgICAobi5jb25zdHJhaW50cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICBjYy5ub2RlID0gbnVsbDtcbiAgICAgICAgICAgICB0LndoZXJlLnB1c2goY2MpXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChuLmpvaW4gPT09IFwib3V0ZXJcIikge1xuICAgICAgICAgICAgdC5qb2lucy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgIGxldCBzID0ge31cbiAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB0Lm9yZGVyQnlbbi5zb3J0LmxldmVsXSA9IHM7XG4gICAgICAgIH1cbiAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlYWNoKTtcbiAgICB9XG5cbiAgICByZWFjaCh0bXBsdC5xdHJlZSk7XG4gICAgdC5vcmRlckJ5ID0gdC5vcmRlckJ5LmZpbHRlcihvID0+IG8pO1xuICAgIHJldHVybiB0XG59XG5cbi8vXG5jbGFzcyBOb2RlIHtcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgdGVtcGxhdGUgKFRlbXBsYXRlIG9iamVjdCkgdGhlIHRlbXBsYXRlIHRoYXQgb3ducyB0aGlzIG5vZGVcbiAgICAvLyAgIHBhcmVudCAob2JqZWN0KSBQYXJlbnQgb2YgdGhlIG5ldyBub2RlLlxuICAgIC8vICAgbmFtZSAoc3RyaW5nKSBOYW1lIGZvciB0aGUgbm9kZVxuICAgIC8vICAgcGNvbXAgKG9iamVjdCkgUGF0aCBjb21wb25lbnQgZm9yIHRoZSByb290LCB0aGlzIGlzIGEgY2xhc3MuIEZvciBvdGhlciBub2RlcywgYW4gYXR0cmlidXRlLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbiBkZWNyaXB0b3IuXG4gICAgLy8gICBwdHlwZSAob2JqZWN0IG9yIHN0cmluZykgVHlwZSBvZiBwY29tcC5cbiAgICBjb25zdHJ1Y3RvciAodGVtcGxhdGUsIHBhcmVudCwgbmFtZSwgcGNvbXAsIHB0eXBlKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTsgLy8gdGhlIHRlbXBsYXRlIEkgYmVsb25nIHRvLlxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lOyAgICAgLy8gZGlzcGxheSBuYW1lXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTsgICAvLyBjaGlsZCBub2Rlc1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDsgLy8gcGFyZW50IG5vZGVcbiAgICAgICAgdGhpcy5wY29tcCA9IHBjb21wOyAgIC8vIHBhdGggY29tcG9uZW50IHJlcHJlc2VudGVkIGJ5IHRoZSBub2RlLiBBdCByb290LCB0aGlzIGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3RhcnRpbmcgY2xhc3MuIE90aGVyd2lzZSwgcG9pbnRzIHRvIGFuIGF0dHJpYnV0ZSAoc2ltcGxlLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbikuXG4gICAgICAgIHRoaXMucHR5cGUgID0gcHR5cGU7ICAvLyBwYXRoIHR5cGUuIFRoZSB0eXBlIG9mIHRoZSBwYXRoIGF0IHRoaXMgbm9kZSwgaS5lLiB0aGUgdHlwZSBvZiBwY29tcC4gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3Igc2ltcGxlIGF0dHJpYnV0ZXMsIHRoaXMgaXMgYSBzdHJpbmcuIE90aGVyd2lzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbC4gTWF5IGJlIG92ZXJyaWRlbiBieSBzdWJjbGFzcyBjb25zdHJhaW50LlxuICAgICAgICB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7IC8vIHN1YmNsYXNzIGNvbnN0cmFpbnQgKGlmIGFueSkuIFBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgc3BlY2lmaWVkLCBvdmVycmlkZXMgcHR5cGUgYXMgdGhlIHR5cGUgb2YgdGhlIG5vZGUuXG4gICAgICAgIHRoaXMuY29uc3RyYWludHMgPSBbXTsvLyBhbGwgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDsgICAgLy8gSWYgc2VsZWN0ZWQgZm9yIHJldHVybiwgdGhpcyBpcyBpdHMgY29sdW1uIy5cbiAgICAgICAgcGFyZW50ICYmIHBhcmVudC5jaGlsZHJlbi5wdXNoKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMucGF0aDtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgcm9vdE5vZGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZS5xdHJlZTtcbiAgICB9XG5cbiAgICAvL1xuICAgIGdldCBwYXRoICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnBhdGggK1wiLlwiIDogXCJcIikgKyB0aGlzLm5hbWU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IG5vZGVUeXBlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzQmlvRW50aXR5ICgpIHtcbiAgICAgICAgbGV0IGJlID0gY3Vyck1pbmUubW9kZWwuY2xhc3Nlc1tcIkJpb0VudGl0eVwiXTtcbiAgICAgICAgbGV0IG50ID0gdGhpcy5ub2RlVHlwZTtcbiAgICAgICAgcmV0dXJuIGlzU3ViY2xhc3MobnQsIGJlKTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNTZWxlY3RlZCAoKSB7XG4gICAgICAgICByZXR1cm4gdGhpcy52aWV3ICE9PSBudWxsICYmIHRoaXMudmlldyAhPT0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIHRoaXMudmlldyA9IGkgPj0gMCA/IGkgOiAodC5zZWxlY3QucHVzaChwKSAtIDEpO1xuICAgIH1cbiAgICB1bnNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHBhdGggZnJvbSB0aGUgc2VsZWN0IGxpc3RcbiAgICAgICAgICAgIHQuc2VsZWN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgLy8gRklYTUU6IHJlbnVtYmVyIG5vZGVzIGhlcmVcbiAgICAgICAgICAgIHQuc2VsZWN0LnNsaWNlKGkpLmZvckVhY2goIChwLGopID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IGdldE5vZGVCeVBhdGgodGhpcy50ZW1wbGF0ZSwgcCk7XG4gICAgICAgICAgICAgICAgbi52aWV3IC09IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cbiAgICBzZXRTb3J0KG5ld2Rpcil7XG4gICAgICAgIGxldCBvbGRkaXIgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQuZGlyIDogXCJub25lXCI7XG4gICAgICAgIGxldCBvbGRsZXYgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgbGV0IG1heGxldiA9IC0xO1xuICAgICAgICBsZXQgcmVudW1iZXIgPSBmdW5jdGlvbiAobil7XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwICYmIG4uc29ydC5sZXZlbCA+IG9sZGxldilcbiAgICAgICAgICAgICAgICAgICAgbi5zb3J0LmxldmVsIC09IDE7XG4gICAgICAgICAgICAgICAgbWF4bGV2ID0gTWF0aC5tYXgobWF4bGV2LCBuLnNvcnQubGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlbnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5ld2RpciB8fCBuZXdkaXIgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gbm90IHNvcnRlZFxuICAgICAgICAgICAgdGhpcy5zb3J0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCl7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIHJlbnVtYmVyIGFueSBleGlzdGluZyBzb3J0IGNmZ3MuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gc29ydGVkXG4gICAgICAgICAgICBpZiAob2xkbGV2ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgbm90IHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gZmluZCBuZXh0IGxldmVsLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgICAgIG9sZGxldiA9IG1heGxldiArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNvcnQgPSB7IGRpcjpuZXdkaXIsIGxldmVsOiBvbGRsZXYgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yICh0KSB7XG4gICAgICAgIHQgPSB0IHx8IHt9XG4gICAgICAgIHRoaXMubW9kZWwgPSB0Lm1vZGVsID8gZGVlcGModC5tb2RlbCkgOiB7IG5hbWU6IFwiZ2Vub21pY1wiIH07XG4gICAgICAgIHRoaXMubmFtZSA9IHQubmFtZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLnRpdGxlID0gdC50aXRsZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSB0LnNlbGVjdCA/IGRlZXBjKHQuc2VsZWN0KSA6IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gdC53aGVyZSA/IHQud2hlcmUubWFwKCBjID0+IGMuY2xvbmUgPyBjLmNsb25lKCkgOiBuZXcgQ29uc3RyYWludChjKSApIDogW107XG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5qb2lucyA9IHQuam9pbnMgPyBkZWVwYyh0LmpvaW5zKSA6IFtdO1xuICAgICAgICB0aGlzLnRhZ3MgPSB0LnRhZ3MgPyBkZWVwYyh0LnRhZ3MpIDogW107XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IHQub3JkZXJCeSA/IGRlZXBjKHQub3JkZXJCeSkgOiBbXTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBLZWVwIG1vdmluZyBmdW5jdGlvbnMgaW50byBtZXRob2RzXG4gICAgLy8gRklYTUU6IE5vdCBhbGwgdGVtcGxhdGVzIGFyZSBUZW1hcGxhdGVzICEhIChzb21lIGFyZSBzdGlsbCBwbGFpbiBvYmplY3RzIGNyZWF0ZWQgZWxzZXdpc2UpXG59O1xuXG5mdW5jdGlvbiBnZXROb2RlQnlQYXRoICh0LHApIHtcbiAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICBpZiAoIXApIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgcGFydHMgPSBwLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgbGV0IG4gPSB0LnF0cmVlO1xuICAgICAgICBpZiAobi5uYW1lICE9PSBwYXJ0c1swXSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGNuYW1lID0gcGFydHNbaV07XG4gICAgICAgICAgICBsZXQgYyA9IChuLmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoeCA9PiB4Lm5hbWUgPT09IGNuYW1lKVswXTtcbiAgICAgICAgICAgIGlmICghYykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBuID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG5cbmNsYXNzIENvbnN0cmFpbnQge1xuICAgIGNvbnN0cnVjdG9yIChjKSB7XG4gICAgICAgIGMgPSBjIHx8IHt9XG4gICAgICAgIC8vIHNhdmUgdGhlICBub2RlXG4gICAgICAgIHRoaXMubm9kZSA9IGMubm9kZSB8fCBudWxsO1xuICAgICAgICAvLyBhbGwgY29uc3RyYWludHMgaGF2ZSB0aGlzXG4gICAgICAgIHRoaXMucGF0aCA9IGMucGF0aCB8fCBjLm5vZGUgJiYgYy5ub2RlLnBhdGggfHwgXCJcIjtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzICh3ZSBzZXQgaXQgdG8gXCJJU0FcIilcbiAgICAgICAgdGhpcy5vcCA9IGMub3AgfHwgbnVsbDtcbiAgICAgICAgLy8gb25lIG9mOiBudWxsLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgc3ViY2xhc3MsIGxvb2t1cCwgbGlzdFxuICAgICAgICB0aGlzLmN0eXBlID0gYy5jdHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy5jb2RlID0gYy5jb2RlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgdmFsdWUsIGxpc3RcbiAgICAgICAgdGhpcy52YWx1ZSA9IGMudmFsdWUgfHwgXCJcIjtcbiAgICAgICAgLy8gdXNlZCBieSBMT09LVVAgb24gQmlvRW50aXR5IGFuZCBzdWJjbGFzc2VzXG4gICAgICAgIHRoaXMuZXh0cmFWYWx1ZSA9IGMuZXh0cmFWYWx1ZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IG11bHRpdmFsdWUgYW5kIHJhbmdlIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmFsdWVzID0gYy52YWx1ZXMgJiYgZGVlcGMoYy52YWx1ZXMpIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgc3ViY2xhc3MgY29udHJhaW50c1xuICAgICAgICB0aGlzLnR5cGUgPSBjLnR5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBmb3IgY29uc3RyYWludHMgaW4gYSB0ZW1wbGF0ZVxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gYy5lZGl0YWJsZSB8fCBudWxsO1xuICAgIH1cbiAgICAvLyBSZXR1cm5zIGFuIHVucmVnaXN0ZXJlZCBjbG9uZS4gKG1lYW5zOiBubyBub2RlIHBvaW50ZXIpXG4gICAgY2xvbmUgKCkge1xuICAgICAgICBsZXQgYyA9IG5ldyBDb25zdHJhaW50KHRoaXMpO1xuICAgICAgICBjLm5vZGUgPSBudWxsO1xuICAgICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgLy9cbiAgICBzZXRPcCAobywgcXVpZXRseSkge1xuICAgICAgICBsZXQgb3AgPSBPUElOREVYW29dO1xuICAgICAgICBpZiAoIW9wKSB0aHJvdyBcIlVua25vd24gb3BlcmF0b3I6IFwiICsgbztcbiAgICAgICAgdGhpcy5vcCA9IG9wLm9wO1xuICAgICAgICB0aGlzLmN0eXBlID0gb3AuY3R5cGU7XG4gICAgICAgIGxldCB0ID0gdGhpcy5ub2RlICYmIHRoaXMubm9kZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29kZSAmJiAhcXVpZXRseSAmJiB0KSBcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5jb2RlMmNbdGhpcy5jb2RlXTtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY29kZSkgXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gdCAmJiBuZXh0QXZhaWxhYmxlQ29kZSh0KSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgICFxdWlldGx5ICYmIHQgJiYgc2V0TG9naWNFeHByZXNzaW9uKHQuY29uc3RyYWludExvZ2ljLCB0KTtcbiAgICB9XG4gICAgLy8gZm9ybWF0cyB0aGlzIGNvbnN0cmFpbnQgYXMgeG1sXG4gICAgYzJ4bWwgKHFvbmx5KXtcbiAgICAgICAgbGV0IGcgPSAnJztcbiAgICAgICAgbGV0IGggPSAnJztcbiAgICAgICAgbGV0IGUgPSBxb25seSA/IFwiXCIgOiBgZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGUgfHwgJ2ZhbHNlJ31cImA7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInZhbHVlXCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJsaXN0XCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7ZXNjKHRoaXMub3ApfVwiIHZhbHVlPVwiJHtlc2ModGhpcy52YWx1ZSl9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiKXtcbiAgICAgICAgICAgIGxldCBldiA9ICh0aGlzLmV4dHJhVmFsdWUgJiYgdGhpcy5leHRyYVZhbHVlICE9PSBcIkFueVwiKSA/IGBleHRyYVZhbHVlPVwiJHt0aGlzLmV4dHJhVmFsdWV9XCJgIDogXCJcIjtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiAke2V2fSBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICAgICAgaCA9IHRoaXMudmFsdWVzLm1hcCggdiA9PiBgPHZhbHVlPiR7ZXNjKHYpfTwvdmFsdWU+YCApLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIHR5cGU9XCIke3RoaXMudHlwZX1cIiAke2V9YDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGlmKGgpXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30+JHtofTwvY29uc3RyYWludD5cXG5gO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30gLz5cXG5gO1xuICAgIH1cbn1cblxuLy8gQWRkcyBhIHBhdGggdG8gdGhlIGN1cnJlbnQgZGlhZ3JhbS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbi8vIEFyZ3M6XG4vLyAgIHRlbXBsYXRlIChvYmplY3QpIHRoZSB0ZW1wbGF0ZVxuLy8gICBwYXRoIChzdHJpbmcpIHRoZSBwYXRoIHRvIGFkZC4gXG4vLyAgIG1vZGVsIG9iamVjdCBDb21waWxlZCBkYXRhIG1vZGVsLlxuLy8gUmV0dXJuczpcbi8vICAgbGFzdCBwYXRoIGNvbXBvbmVudCBjcmVhdGVkLiBcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgQ3JlYXRlcyBuZXcgbm9kZXMgYXMgbmVlZGVkIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHF0cmVlLlxuZnVuY3Rpb24gYWRkUGF0aCh0ZW1wbGF0ZSwgcGF0aCwgbW9kZWwpe1xuICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgICB2YXIgY2xhc3NlcyA9IG1vZGVsLmNsYXNzZXM7XG4gICAgdmFyIGxhc3R0ID0gbnVsbFxuICAgIHZhciBuID0gdGVtcGxhdGUucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuXG4gICAgZnVuY3Rpb24gZmluZChsaXN0LCBuKXtcbiAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICB9XG5cbiAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocCwgaSl7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGUucXRyZWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWU7XG4gICAgICAgICAgICAgICAgaWYgKHAgIT09IG4ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3BdO1xuICAgICAgICAgICAgICAgIGlmICghY2xzKVxuICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWUgPSBuZXcgTm9kZSggdGVtcGxhdGUsIG51bGwsIHAsIGNscywgY2xzICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBuIGlzIHBvaW50aW5nIHRvIHRoZSBwYXJlbnQsIGFuZCBwIGlzIHRoZSBuZXh0IG5hbWUgaW4gdGhlIHBhdGguXG4gICAgICAgICAgICB2YXIgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgaWYgKG5uKSB7XG4gICAgICAgICAgICAgICAgLy8gcCBpcyBhbHJlYWR5IGEgY2hpbGRcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QsIGxvb2t1cCBwXG4gICAgICAgICAgICAgICAgdmFyIHg7XG4gICAgICAgICAgICAgICAgdmFyIGNscyA9IG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjbHMuYXR0cmlidXRlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0geC50eXBlIC8vIDwtLSBBIHN0cmluZyFcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdIC8vIDwtLVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgbWVtYmVyIG5hbWVkIFwiICsgcCArIFwiIGluIGNsYXNzIFwiICsgY2xzLm5hbWUgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlLCBhZGQgaXQgdG8gbidzIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgbm4gPSBuZXcgTm9kZSh0ZW1wbGF0ZSwgbiwgcCwgeCwgY2xzKTtcbiAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gcmV0dXJuIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHBhdGhcbiAgICByZXR1cm4gbjtcbn1cblxuXG4vLyBBcmdzOlxuLy8gICBuIChub2RlKSBUaGUgbm9kZSBoYXZpbmcgdGhlIGNvbnN0cmFpbnQuXG4vLyAgIHNjTmFtZSAodHlwZSkgTmFtZSBvZiBzdWJjbGFzcy5cbmZ1bmN0aW9uIHNldFN1YmNsYXNzQ29uc3RyYWludChuLCBzY05hbWUpe1xuICAgIC8vIHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludFxuICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbiAoYyl7IHJldHVybiBjLmN0eXBlICE9PSBcInN1YmNsYXNzXCI7IH0pO1xuICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICBpZiAoc2NOYW1lKXtcbiAgICAgICAgbGV0IGNscyA9IGN1cnJNaW5lLm1vZGVsLmNsYXNzZXNbc2NOYW1lXTtcbiAgICAgICAgaWYoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIHNjTmFtZTtcbiAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKHsgY3R5cGU6XCJzdWJjbGFzc1wiLCBvcDpcIklTQVwiLCBwYXRoOm4ucGF0aCwgdHlwZTpjbHMubmFtZSB9KTtcbiAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgdmFyIGNscyA9IG5vZGUuc3ViY2xhc3NDb25zdHJhaW50IHx8IG5vZGUucHR5cGU7XG4gICAgICAgIHZhciBjMiA9IFtdO1xuICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBpZihjLm5hbWUgaW4gY2xzLmF0dHJpYnV0ZXMgfHwgYy5uYW1lIGluIGNscy5yZWZlcmVuY2VzIHx8IGMubmFtZSBpbiBjbHMuY29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjMi5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChjKTtcbiAgICAgICAgfSlcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IGMyO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICB9XG4gICAgdmFyIHJlbW92ZWQgPSBjaGVjayhuLFtdKTtcbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKG4pO1xuICAgIGlmKHJlbW92ZWQubGVuZ3RoID4gMClcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ29uc3RyYWluaW5nIHRvIHN1YmNsYXNzIFwiICsgKHNjTmFtZSB8fCBuLnB0eXBlLm5hbWUpXG4gICAgICAgICAgICArIFwiIGNhdXNlZCB0aGUgZm9sbG93aW5nIHBhdGhzIHRvIGJlIHJlbW92ZWQ6IFwiIFxuICAgICAgICAgICAgKyByZW1vdmVkLm1hcChuID0+IG4ucGF0aCkuam9pbihcIiwgXCIpKTsgXG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbn1cblxuLy8gUmVtb3ZlcyB0aGUgY3VycmVudCBub2RlIGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuLy9cbmZ1bmN0aW9uIHJlbW92ZU5vZGUobikge1xuICAgIC8vIEZpcnN0LCByZW1vdmUgYWxsIGNvbnN0cmFpbnRzIG9uIG4gb3IgaXRzIGRlc2NlbmRhbnRzXG4gICAgZnVuY3Rpb24gcm1jICh4KSB7XG4gICAgICAgIHgudW5zZWxlY3QoKTtcbiAgICAgICAgeC5jb25zdHJhaW50cy5mb3JFYWNoKGMgPT4gcmVtb3ZlQ29uc3RyYWludCh4LGMpKTtcbiAgICAgICAgeC5jaGlsZHJlbi5mb3JFYWNoKHJtYyk7XG4gICAgfVxuICAgIHJtYyhuKTtcbiAgICAvLyBOb3cgcmVtb3ZlIHRoZSBzdWJ0cmVlIGF0IG4uXG4gICAgdmFyIHAgPSBuLnBhcmVudDtcbiAgICBpZiAocCkge1xuICAgICAgICBwLmNoaWxkcmVuLnNwbGljZShwLmNoaWxkcmVuLmluZGV4T2YobiksIDEpO1xuICAgICAgICBoaWRlRGlhbG9nKCk7XG4gICAgICAgIHVwZGF0ZShwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGhpZGVEaWFsb2coKVxuICAgIH1cbiAgICAvL1xuICAgIHNhdmVTdGF0ZSgpO1xufVxuXG4vLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbi8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4vLyBmb3IgZDMgdHJlZSBkaXNwbGF5LlxuLy9cbmZ1bmN0aW9uIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIGN1cnJUZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZSh0KTtcbiAgICAvL1xuICAgIHJvb3QgPSBjb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlLCBjdXJyTWluZS5tb2RlbCkucXRyZWVcbiAgICByb290LngwID0gMDtcbiAgICByb290LnkwID0gaCAvIDI7XG4gICAgLy9cbiAgICBzZXRMb2dpY0V4cHJlc3Npb24oKTtcblxuICAgIGlmICghIG5vc2F2ZSkgc2F2ZVN0YXRlKCk7XG5cbiAgICAvLyBGaWxsIGluIHRoZSBiYXNpYyB0ZW1wbGF0ZSBpbmZvcm1hdGlvbiAobmFtZSwgdGl0bGUsIGRlc2NyaXB0aW9uLCBldGMuKVxuICAgIC8vXG4gICAgdmFyIHRpID0gZDMuc2VsZWN0KFwiI3RJbmZvXCIpO1xuICAgIHZhciB4ZmVyID0gZnVuY3Rpb24obmFtZSwgZWx0KXsgY3VyclRlbXBsYXRlW25hbWVdID0gZWx0LnZhbHVlOyB1cGRhdGVUdGV4dCgpOyB9O1xuICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3VyclRlbXBsYXRlLm5hbWUpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwibmFtZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBUaXRsZSAod2hhdCB0aGUgdXNlciBzZWVzKVxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJ0aXRsZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3VyclRlbXBsYXRlLnRpdGxlKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcInRpdGxlXCIsIHRoaXMpIH0pO1xuICAgIC8vIERlc2NyaXB0aW9uICh3aGF0IGl0IGRvZXMgLSBhIGxpdHRsZSBkb2N1bWVudGF0aW9uKS5cbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiZGVzY3JpcHRpb25cIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdXJyVGVtcGxhdGUuZGVzY3JpcHRpb24pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiZGVzY3JpcHRpb25cIiwgdGhpcykgfSk7XG4gICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy4gXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdXJyVGVtcGxhdGUuY29tbWVudClcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJjb21tZW50XCIsIHRoaXMpIH0pO1xuXG4gICAgLy8gTG9naWMgZXhwcmVzc2lvbiAtIHdoaWNoIHRpZXMgdGhlIGluZGl2aWR1YWwgY29uc3RyYWludHMgdG9nZXRoZXJcbiAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyB9KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldExvZ2ljRXhwcmVzc2lvbih0aGlzLnZhbHVlLCBjdXJyVGVtcGxhdGUpO1xuICAgICAgICAgICAgeGZlcihcImNvbnN0cmFpbnRMb2dpY1wiLCB0aGlzKVxuICAgICAgICB9KTtcblxuICAgIC8vXG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShyb290KTtcbn1cblxuLy8gU2V0cyB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4vLyBJbiB0aGUgcHJvY2VzcywgYWxzbyBcImNvcnJlY3RzXCIgdGhlIGV4cHJlc3Npb24gYXMgZm9sbG93czpcbi8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbi8vICAgICAgYW55IGNvbnN0cmFpbnQgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUgYXJlIHJlbW92ZWQgYW5kIHRoZVxuLy8gICAgICBleHByZXNzaW9uIGxvZ2ljIHVwZGF0ZWQgYWNjb3JkaW5nbHlcbi8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbi8vICAgICAgYXJlIEFORGVkIHRvIHRoZSBlbmQuXG4vLyBGb3IgZXhhbXBsZSwgaWYgdGhlIGN1cnJlbnQgdGVtcGxhdGUgaGFzIGNvZGVzIEEsIEIsIGFuZCBDLCBhbmRcbi8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4vLyBhZGRlZCwgcmVzdWx0aW5nIGluIFwiQSBhbmQgQiBhbmQgQ1wiLiBcbi8vIEFyZ3M6XG4vLyAgIGV4IChzdHJpbmcpIHRoZSBleHByZXNzaW9uXG4vLyAgIHRtcGx0IChvYmopIHRoZSB0ZW1wbGF0ZVxuLy8gUmV0dXJuczpcbi8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuLy8gICBcbmZ1bmN0aW9uIHNldExvZ2ljRXhwcmVzc2lvbihleCwgdG1wbHQpe1xuICAgIHRtcGx0ID0gdG1wbHQgPyB0bXBsdCA6IGN1cnJUZW1wbGF0ZTtcbiAgICBleCA9IGV4ID8gZXggOiAodG1wbHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCIpXG4gICAgdmFyIGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZ1bmN0aW9uIHJlYWNoKG4sbGV2KXtcbiAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgLy8gY2hlY2sgdGhhdCBuIGlzIGEgY29uc3RyYWludCBjb2RlIGluIHRoZSB0ZW1wbGF0ZS4gXG4gICAgICAgICAgICAvLyBJZiBub3QsIHJlbW92ZSBpdCBmcm9tIHRoZSBleHByLlxuICAgICAgICAgICAgLy8gQWxzbyByZW1vdmUgaXQgaWYgaXQncyB0aGUgY29kZSBmb3IgYSBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICByZXR1cm4gKG4gaW4gdG1wbHQuY29kZTJjICYmIHRtcGx0LmNvZGUyY1tuXS5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiKSA/IG4gOiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgIHZhciBjbXNzID0gY21zLmpvaW4oXCIgXCIrbi5vcCtcIiBcIik7XG4gICAgICAgIHJldHVybiBjbXMubGVuZ3RoID09PSAwID8gXCJcIiA6IGxldiA9PT0gMCB8fCBjbXMubGVuZ3RoID09PSAxID8gY21zcyA6IFwiKFwiICsgY21zcyArIFwiKVwiXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGFzdCA9IGV4ID8gcGFyc2VyLnBhcnNlKGV4KSA6IG51bGw7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgYWxlcnQoZXJyKTtcbiAgICAgICAgcmV0dXJuIHRtcGx0LmNvbnN0cmFpbnRMb2dpYztcbiAgICB9XG4gICAgLy9cbiAgICB2YXIgbGV4ID0gYXN0ID8gcmVhY2goYXN0LDApIDogXCJcIjtcbiAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAvLyBBTkQgdGhlbSBpbnRvIHRoZSBleHByZXNzaW9uIChleGNlcHQgSVNBIGNvbnN0cmFpbnRzKS5cbiAgICB2YXIgdG9BZGQgPSBPYmplY3Qua2V5cyh0bXBsdC5jb2RlMmMpLmZpbHRlcihmdW5jdGlvbihjKXtcbiAgICAgICAgcmV0dXJuIHNlZW4uaW5kZXhPZihjKSA9PT0gLTEgJiYgYy5vcCAhPT0gXCJJU0FcIjtcbiAgICAgICAgfSk7XG4gICAgaWYgKHRvQWRkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgIGlmKGFzdCAmJiBhc3Qub3AgJiYgYXN0Lm9wID09PSBcIm9yXCIpXG4gICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgIGlmIChsZXgpIHRvQWRkLnVuc2hpZnQobGV4KTtcbiAgICAgICAgIGxleCA9IHRvQWRkLmpvaW4oXCIgYW5kIFwiKTtcbiAgICB9XG4gICAgLy9cbiAgICB0bXBsdC5jb25zdHJhaW50TG9naWMgPSBsZXg7XG5cbiAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gbGV4OyB9KTtcblxuICAgIHJldHVybiBsZXg7XG59XG5cbi8vIEV4dGVuZHMgdGhlIHBhdGggZnJvbSBjdXJyTm9kZSB0byBwXG4vLyBBcmdzOlxuLy8gICBjdXJyTm9kZSAobm9kZSkgTm9kZSB0byBleHRlbmQgZnJvbVxuLy8gICBtb2RlIChzdHJpbmcpIG9uZSBvZiBcInNlbGVjdFwiLCBcImNvbnN0cmFpblwiIG9yIFwib3BlblwiXG4vLyAgIHAgKHN0cmluZykgTmFtZSBvZiBhbiBhdHRyaWJ1dGUsIHJlZiwgb3IgY29sbGVjdGlvblxuLy8gUmV0dXJuczpcbi8vICAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICBJZiB0aGUgc2VsZWN0ZWQgaXRlbSBpcyBub3QgYWxyZWFkeSBpbiB0aGUgZGlzcGxheSwgaXQgZW50ZXJzXG4vLyAgIGFzIGEgbmV3IGNoaWxkIChncm93aW5nIG91dCBmcm9tIHRoZSBwYXJlbnQgbm9kZS5cbi8vICAgVGhlbiB0aGUgZGlhbG9nIGlzIG9wZW5lZCBvbiB0aGUgY2hpbGQgbm9kZS5cbi8vICAgSWYgdGhlIHVzZXIgY2xpY2tlZCBvbiBhIFwib3BlbitzZWxlY3RcIiBidXR0b24sIHRoZSBjaGlsZCBpcyBzZWxlY3RlZC5cbi8vICAgSWYgdGhlIHVzZXIgY2xpY2tlZCBvbiBhIFwib3Blbitjb25zdHJhaW5cIiBidXR0b24sIGEgbmV3IGNvbnN0cmFpbnQgaXMgYWRkZWQgdG8gdGhlXG4vLyAgIGNoaWxkLCBhbmQgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9wZW5lZCAgb24gdGhhdCBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIHNlbGVjdGVkTmV4dChjdXJyTm9kZSwgbW9kZSwgcCl7XG4gICAgbGV0IG47XG4gICAgbGV0IGNjO1xuICAgIGxldCBzZnM7XG4gICAgaWYgKG1vZGUgPT09IFwic3VtbWFyeWZpZWxkc1wiKSB7XG4gICAgICAgIHNmcyA9IGN1cnJNaW5lLnN1bW1hcnlGaWVsZHNbY3Vyck5vZGUubm9kZVR5cGUubmFtZV18fFtdO1xuICAgICAgICBzZnMuZm9yRWFjaChmdW5jdGlvbihzZiwgaSl7XG4gICAgICAgICAgICBzZiA9IHNmLnJlcGxhY2UoL15bXi5dKy8sIGN1cnJOb2RlLnBhdGgpO1xuICAgICAgICAgICAgbGV0IG0gPSBhZGRQYXRoKGN1cnJUZW1wbGF0ZSwgc2YsIGN1cnJNaW5lLm1vZGVsKTtcbiAgICAgICAgICAgIGlmICghIG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIG0uc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcCA9IGN1cnJOb2RlLnBhdGggKyBcIi5cIiArIHA7XG4gICAgICAgIG4gPSBhZGRQYXRoKGN1cnJUZW1wbGF0ZSwgcCwgY3Vyck1pbmUubW9kZWwgKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwic2VsZWN0ZWRcIilcbiAgICAgICAgICAgICFuLmlzU2VsZWN0ZWQgJiYgbi5zZWxlY3QoKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwiY29uc3RyYWluZWRcIikge1xuICAgICAgICAgICAgY2MgPSBhZGRDb25zdHJhaW50KG4sIGZhbHNlKVxuICAgICAgICB9XG4gICAgfVxuICAgIGhpZGVEaWFsb2coKTtcbiAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgIGlmIChtb2RlICE9PSBcIm9wZW5cIilcbiAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgaWYgKG1vZGUgIT09IFwic3VtbWFyeWZpZWxkc1wiKSBcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2hvd0RpYWxvZyhuKTtcbiAgICAgICAgICAgIGNjICYmIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBlZGl0Q29uc3RyYWludChjYywgbilcbiAgICAgICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgIFxufVxuLy8gUmV0dXJucyBhIHRleHQgcmVwcmVzZW50YXRpb24gb2YgYSBjb25zdHJhaW50XG4vL1xuZnVuY3Rpb24gY29uc3RyYWludFRleHQoYykge1xuICAgdmFyIHQgPSBcIj9cIjtcbiAgIGlmICghYykgcmV0dXJuIHQ7XG4gICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKXtcbiAgICAgICB0ID0gXCJJU0EgXCIgKyAoYy50eXBlIHx8IFwiP1wiKTtcbiAgIH1cbiAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgdCA9IGMub3AgKyBcIiBcIiArIGMudmFsdWU7XG4gICB9XG4gICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgdCA9IGMub3AgKyBcIiBcIiArIGMudmFsdWU7XG4gICAgICAgaWYgKGMuZXh0cmFWYWx1ZSkgdCA9IHQgKyBcIiBJTiBcIiArIGMuZXh0cmFWYWx1ZTtcbiAgIH1cbiAgIGVsc2UgaWYgKGMudmFsdWUgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgdCA9IGMub3AgKyAoYy5vcC5pbmNsdWRlcyhcIk5VTExcIikgPyBcIlwiIDogXCIgXCIgKyBjLnZhbHVlKVxuICAgfVxuICAgZWxzZSBpZiAoYy52YWx1ZXMgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgdCA9IGMub3AgKyBcIiBcIiArIGMudmFsdWVzXG4gICB9XG4gICByZXR1cm4gKGMuY29kZSA/IFwiKFwiK2MuY29kZStcIikgXCIgOiBcIlwiKSArIHQ7XG59XG5cbi8vIFJldHVybnMgIHRoZSBET00gZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBkYXRhIG9iamVjdC5cbi8vXG5mdW5jdGlvbiBmaW5kRG9tQnlEYXRhT2JqKGQpe1xuICAgIHZhciB4ID0gZDMuc2VsZWN0QWxsKFwiLm5vZGVncm91cCAubm9kZVwiKS5maWx0ZXIoZnVuY3Rpb24oZGQpeyByZXR1cm4gZGQgPT09IGQ7IH0pO1xuICAgIHJldHVybiB4WzBdWzBdO1xufVxuXG4vL1xuZnVuY3Rpb24gb3BWYWxpZEZvcihvcCwgbil7XG4gICAgaWYoIW4ucGFyZW50ICYmICFvcC52YWxpZEZvclJvb3QpIHJldHVybiBmYWxzZTtcbiAgICBpZih0eXBlb2Yobi5wdHlwZSkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIGlmKCEgb3AudmFsaWRGb3JBdHRyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmKCBvcC52YWxpZFR5cGVzICYmIG9wLnZhbGlkVHlwZXMuaW5kZXhPZihuLnB0eXBlKSA9PSAtMSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZihuLnB0eXBlLm5hbWUgJiYgISBvcC52YWxpZEZvckNsYXNzKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVDRWlucHV0cyhjLCBvcCl7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWUgPSBvcCB8fCBjLm9wO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJjb2RlXCJdJykudGV4dChjLmNvZGUpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLmN0eXBlPT09XCJudWxsXCIgPyBcIlwiIDogYy52YWx1ZTtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylbMF1bMF0udmFsdWUgPSBkZWVwYyhjLnZhbHVlcyk7XG59XG5cbi8vIEFyZ3M6XG4vLyAgIHNlbGVjdG9yIChzdHJpbmcpIEZvciBzZWxlY3RpbmcgdGhlIDxzZWxlY3Q+IGVsZW1lbnRcbi8vICAgZGF0YSAobGlzdCkgRGF0YSB0byBiaW5kIHRvIG9wdGlvbnNcbi8vICAgY2ZnIChvYmplY3QpIEFkZGl0aW9uYWwgb3B0aW9uYWwgY29uZmlnczpcbi8vICAgICAgIHRpdGxlIC0gZnVuY3Rpb24gb3IgbGl0ZXJhbCBmb3Igc2V0dGluZyB0aGUgdGV4dCBvZiB0aGUgb3B0aW9uLiBcbi8vICAgICAgIHZhbHVlIC0gZnVuY3Rpb24gb3IgbGl0ZXJhbCBzZXR0aW5nIHRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uXG4vLyAgICAgICBzZWxlY3RlZCAtIGZ1bmN0aW9uIG9yIGFycmF5IG9yIHN0cmluZyBmb3IgZGVjaWRpbmcgd2hpY2ggb3B0aW9uKHMpIGFyZSBzZWxlY3RlZFxuLy8gICAgICAgICAgSWYgZnVuY3Rpb24sIGNhbGxlZCBmb3IgZWFjaCBvcHRpb24uXG4vLyAgICAgICAgICBJZiBhcnJheSwgc3BlY2lmaWVzIHRoZSB2YWx1ZXMgdGhlIHNlbGVjdC5cbi8vICAgICAgICAgIElmIHN0cmluZywgc3BlY2lmaWVzIHdoaWNoIHZhbHVlIGlzIHNlbGVjdGVkXG4vLyAgICAgICBlbXB0eU1lc3NhZ2UgLSBhIG1lc3NhZ2UgdG8gc2hvdyBpZiB0aGUgZGF0YSBsaXN0IGlzIGVtcHR5XG4vLyAgICAgICBtdWx0aXBsZSAtIGlmIHRydWUsIG1ha2UgaXQgYSBtdWx0aS1zZWxlY3QgbGlzdFxuLy9cbmZ1bmN0aW9uIGluaXRPcHRpb25MaXN0KHNlbGVjdG9yLCBkYXRhLCBjZmcpe1xuICAgIFxuICAgIGNmZyA9IGNmZyB8fCB7fTtcblxuICAgIHZhciBpZGVudCA9ICh4PT54KTtcbiAgICB2YXIgb3B0cztcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoID4gMCl7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShkYXRhKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICAvL1xuICAgICAgICBvcHRzLmF0dHIoXCJ2YWx1ZVwiLCBjZmcudmFsdWUgfHwgaWRlbnQpXG4gICAgICAgICAgICAudGV4dChjZmcudGl0bGUgfHwgaWRlbnQpXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIG51bGwpXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIG51bGwpO1xuICAgICAgICBpZiAodHlwZW9mKGNmZy5zZWxlY3RlZCkgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgZnVuY3Rpb24gc2F5cyBzb1xuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjZmcuc2VsZWN0ZWQoZCl8fG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY2ZnLnNlbGVjdGVkKSkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIGlzIGluIHRoZSBhcnJheVxuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjZmcuc2VsZWN0ZWQuaW5kZXhPZigoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSkgIT0gLTEgfHwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ZnLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgbWF0Y2hlc1xuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiAoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkgPT09IGNmZy5zZWxlY3RlZCkgfHwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkMy5zZWxlY3Qoc2VsZWN0b3IpWzBdWzBdLnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoW2NmZy5lbXB0eU1lc3NhZ2V8fFwiZW1wdHkgbGlzdFwiXSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgb3B0cy50ZXh0KGlkZW50KS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIHNldCBtdWx0aSBzZWxlY3QgKG9yIG5vdClcbiAgICBkMy5zZWxlY3Qoc2VsZWN0b3IpLmF0dHIoXCJtdWx0aXBsZVwiLCBjZmcubXVsdGlwbGUgfHwgbnVsbCk7XG4gICAgLy8gYWxsb3cgY2FsbGVyIHRvIGNoYWluXG4gICAgcmV0dXJuIG9wdHM7XG59XG5cbi8vIEluaXRpYWxpemVzIHRoZSBpbnB1dCBlbGVtZW50cyBpbiB0aGUgY29uc3RyYWludCBlZGl0b3IgZnJvbSB0aGUgZ2l2ZW4gY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBpbml0Q0VpbnB1dHMobiwgYywgY3R5cGUpIHtcblxuICAgIC8vIFBvcHVsYXRlIHRoZSBvcGVyYXRvciBzZWxlY3QgbGlzdCB3aXRoIG9wcyBhcHByb3ByaWF0ZSBmb3IgdGhlIHBhdGhcbiAgICAvLyBhdCB0aGlzIG5vZGUuXG4gICAgaWYgKCFjdHlwZSkgXG4gICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwib3BcIl0nLCBcbiAgICAgICAgT1BTLmZpbHRlcihmdW5jdGlvbihvcCl7IHJldHVybiBvcFZhbGlkRm9yKG9wLCBuKTsgfSksXG4gICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZCA9PiBkLm9wLFxuICAgICAgICB0aXRsZTogZCA9PiBkLm9wLFxuICAgICAgICBzZWxlY3RlZDpjLm9wXG4gICAgICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICBjdHlwZSA9IGN0eXBlIHx8IGMuY3R5cGU7XG5cbiAgICBsZXQgY2UgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKTtcbiAgICBsZXQgc216ZCA9IGNlLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuICAgIGNlLmF0dHIoXCJjbGFzc1wiLCBcIm9wZW4gXCIgKyBjdHlwZSlcbiAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHNtemQpXG4gICAgICAgIC5jbGFzc2VkKFwiYmlvZW50aXR5XCIsICBuLmlzQmlvRW50aXR5KTtcblxuIFxuICAgIC8vXG4gICAgLy8gc2V0L3JlbW92ZSB0aGUgXCJtdWx0aXBsZVwiIGF0dHJpYnV0ZSBvZiB0aGUgc2VsZWN0IGVsZW1lbnQgYWNjb3JkaW5nIHRvIGN0eXBlXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScpXG4gICAgICAgIC5hdHRyKFwibXVsdGlwbGVcIiwgZnVuY3Rpb24oKXsgcmV0dXJuIGN0eXBlID09PSBcIm11bHRpdmFsdWVcIiB8fCBudWxsOyB9KTtcblxuICAgIC8vXG4gICAgaWYgKGN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBbXCJBbnlcIl0uY29uY2F0KGN1cnJNaW5lLm9yZ2FuaXNtTGlzdCksXG4gICAgICAgICAgICB7IHNlbGVjdGVkOiBjLmV4dHJhVmFsdWUgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAvLyBDcmVhdGUgYW4gb3B0aW9uIGxpc3Qgb2Ygc3ViY2xhc3MgbmFtZXNcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgbi5wYXJlbnQgPyBnZXRTdWJjbGFzc2VzKG4ucGNvbXAua2luZCA/IG4ucGNvbXAudHlwZSA6IG4ucGNvbXApIDogW10sXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gc3ViY2xhc3NlcylcIixcbiAgICAgICAgICAgIHNlbGVjdGVkOiBmdW5jdGlvbihkKXsgXG4gICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgb25lIHdob3NlIG5hbWUgbWF0Y2hlcyB0aGUgbm9kZSdzIHR5cGUgYW5kIHNldCBpdHMgc2VsZWN0ZWQgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSBkLm5hbWUgPT09ICgobi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZSkubmFtZSB8fCBuLnB0eXBlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgY3Vyck1pbmUubGlzdHMuZmlsdGVyKGZ1bmN0aW9uIChsKSB7IHJldHVybiBpc1ZhbGlkTGlzdENvbnN0cmFpbnQobCwgY3Vyck5vZGUpOyB9KSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIGxpc3RzKVwiLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKTtcbiAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgIC8vbGV0IGFjcyA9IGdldExvY2FsKFwiYXV0b2NvbXBsZXRlXCIsIHRydWUsIFtdKTtcbiAgICAgICAgLy8gZGlzYWJsZSB0aGlzIGZvciBub3cuXG4gICAgICAgIGxldCBhY3MgPSBbXTtcbiAgICAgICAgaWYgKGFjcy5pbmRleE9mKGF0dHIpICE9PSAtMSlcbiAgICAgICAgICAgIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcIm51bGxcIikge1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJVbnJlY29nbml6ZWQgY3R5cGU6IFwiICsgY3R5cGVcbiAgICB9XG4gICAgXG59XG5cbi8vIE9wZW5zIHRoZSBjb25zdHJhaW50IGVkaXRvciBmb3IgY29uc3RyYWludCBjIG9mIG5vZGUgbi5cbi8vXG5mdW5jdGlvbiBvcGVuQ29uc3RyYWludEVkaXRvcihjLCBuKXtcblxuICAgIC8vIE5vdGUgaWYgdGhpcyBpcyBoYXBwZW5pbmcgYXQgdGhlIHJvb3Qgbm9kZVxuICAgIHZhciBpc3Jvb3QgPSAhIG4ucGFyZW50O1xuIFxuICAgIC8vIEZpbmQgdGhlIGRpdiBmb3IgY29uc3RyYWludCBjIGluIHRoZSBkaWFsb2cgbGlzdGluZy4gV2Ugd2lsbFxuICAgIC8vIG9wZW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9uIHRvcCBvZiBpdC5cbiAgICB2YXIgY2RpdjtcbiAgICBkMy5zZWxlY3RBbGwoXCIjZGlhbG9nIC5jb25zdHJhaW50XCIpXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKGNjKXsgaWYoY2MgPT09IGMpIGNkaXYgPSB0aGlzOyB9KTtcbiAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGNvbnN0cmFpbnQncyBjb250YWluZXIgZGl2XG4gICAgdmFyIGNiYiA9IGNkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBhcHAncyBtYWluIGJvZHkgZWxlbWVudFxuICAgIHZhciBkYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgLy8gcG9zaXRpb24gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG92ZXIgdGhlIGNvbnN0cmFpbnQgaW4gdGhlIGRpYWxvZ1xuICAgIHZhciBjZWQgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIGMuY3R5cGUpXG4gICAgICAgIC5jbGFzc2VkKFwib3BlblwiLCB0cnVlKVxuICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgKGNiYi50b3AgLSBkYmIudG9wKStcInB4XCIpXG4gICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGNiYi5sZWZ0IC0gZGJiLmxlZnQpK1wicHhcIilcbiAgICAgICAgO1xuXG4gICAgLy8gSW5pdCB0aGUgY29uc3RyYWludCBjb2RlIFxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJjb2RlXCJdJylcbiAgICAgICAgLnRleHQoYy5jb2RlKTtcblxuICAgIGluaXRDRWlucHV0cyhuLCBjKTtcblxuICAgIC8vIFdoZW4gdXNlciBzZWxlY3RzIGFuIG9wZXJhdG9yLCBhZGQgYSBjbGFzcyB0byB0aGUgYy5lLidzIGNvbnRhaW5lclxuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIG9wID0gT1BJTkRFWFt0aGlzLnZhbHVlXTtcbiAgICAgICAgICAgIGluaXRDRWlucHV0cyhuLCBjLCBvcC5jdHlwZSk7XG4gICAgICAgIH0pXG4gICAgICAgIDtcblxuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uY2FuY2VsXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IGNhbmNlbENvbnN0cmFpbnRFZGl0b3IobiwgYykgfSk7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnNhdmVcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgc2F2ZUNvbnN0cmFpbnRFZGl0cyhuLCBjKSB9KTtcblxuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc3luY1wiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYykgfSk7XG5cbn1cbi8vIEdlbmVyYXRlcyBhbiBvcHRpb24gbGlzdCBvZiBkaXN0aW5jdCB2YWx1ZXMgdG8gc2VsZWN0IGZyb20uXG4vLyBBcmdzOlxuLy8gICBuICAobm9kZSkgIFRoZSBub2RlIHdlJ3JlIHdvcmtpbmcgb24uIE11c3QgYmUgYW4gYXR0cmlidXRlIG5vZGUuXG4vLyAgIGMgIChjb25zdHJhaW50KSBUaGUgY29uc3RyYWludCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBmb3IuXG4vLyBOQjogT25seSB2YWx1ZSBhbmQgbXVsdGl2YXVlIGNvbnN0cmFpbnRzIGNhbiBiZSBzdW1tYXJpemVkIGluIHRoaXMgd2F5LiAgXG5mdW5jdGlvbiBnZW5lcmF0ZU9wdGlvbkxpc3QobiwgYyl7XG4gICAgLy8gVG8gZ2V0IHRoZSBsaXN0LCB3ZSBoYXZlIHRvIHJ1biB0aGUgY3VycmVudCBxdWVyeSB3aXRoIGFuIGFkZGl0aW9uYWwgcGFyYW1ldGVyLCBcbiAgICAvLyBzdW1tYXJ5UGF0aCwgd2hpY2ggaXMgdGhlIHBhdGggd2Ugd2FudCBkaXN0aW5jdCB2YWx1ZXMgZm9yLiBcbiAgICAvLyBCVVQgTk9URSwgd2UgaGF2ZSB0byBydW4gdGhlIHF1ZXJ5ICp3aXRob3V0KiBjb25zdHJhaW50IGMhIVxuICAgIC8vIEV4YW1wbGU6IHN1cHBvc2Ugd2UgaGF2ZSBhIHF1ZXJ5IHdpdGggYSBjb25zdHJhaW50IGFsbGVsZVR5cGU9VGFyZ2V0ZWQsXG4gICAgLy8gYW5kIHdlIHdhbnQgdG8gY2hhbmdlIGl0IHRvIFNwb250YW5lb3VzLiBXZSBvcGVuIHRoZSBjLmUuLCBhbmQgdGhlbiBjbGljayB0aGVcbiAgICAvLyBzeW5jIGJ1dHRvbiB0byBnZXQgYSBsaXN0LiBJZiB3ZSBydW4gdGhlIHF1ZXJ5IHdpdGggYyBpbnRhY3QsIHdlJ2xsIGdldCBhIGxpc3RcbiAgICAvLyBjb250YWluaW50IG9ubHkgXCJUYXJnZXRlZFwiLiBEb2ghXG4gICAgLy8gQU5PVEhFUiBOT1RFOiB0aGUgcGF0aCBpbiBzdW1tYXJ5UGF0aCBtdXN0IGJlIHBhcnQgb2YgdGhlIHF1ZXJ5IHByb3Blci4gVGhlIGFwcHJvYWNoXG4gICAgLy8gaGVyZSBpcyB0byBlbnN1cmUgaXQgYnkgYWRkaW5nIHRoZSBwYXRoIHRvIHRoZSB2aWV3IGxpc3QuXG5cbiAgICBsZXQgY3ZhbHMgPSBbXTtcbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgY3ZhbHMgPSBjLnZhbHVlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGN2YWxzID0gWyBjLnZhbHVlIF07XG4gICAgfVxuXG4gICAgLy8gU2F2ZSB0aGlzIGNob2ljZSBpbiBsb2NhbFN0b3JhZ2VcbiAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICBsZXQga2V5ID0gXCJhdXRvY29tcGxldGVcIjtcbiAgICBsZXQgbHN0O1xuICAgIGxzdCA9IGdldExvY2FsKGtleSwgdHJ1ZSwgW10pO1xuICAgIGlmKGxzdC5pbmRleE9mKGF0dHIpID09PSAtMSkgbHN0LnB1c2goYXR0cik7XG4gICAgc2V0TG9jYWwoa2V5LCBsc3QsIHRydWUpO1xuXG4gICAgY2xlYXJMb2NhbCgpO1xuXG4gICAgLy8gYnVpbGQgdGhlIHF1ZXJ5XG4gICAgbGV0IHAgPSBuLnBhdGg7IC8vIHdoYXQgd2Ugd2FudCB0byBzdW1tYXJpemVcbiAgICAvL1xuICAgIGxldCBsZXggPSBjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljOyAvLyBzYXZlIGNvbnN0cmFpbnQgbG9naWMgZXhwclxuICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgZmFsc2UpOyAvLyB0ZW1wb3JhcmlseSByZW1vdmUgdGhlIGNvbnN0cmFpbnRcbiAgICBsZXQgaiA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gICAgai5zZWxlY3QucHVzaChwKTsgLy8gbWFrZSBzdXJlIHAgaXMgcGFydCBvZiB0aGUgcXVlcnlcbiAgICBjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljID0gbGV4OyAvLyByZXN0b3JlIHRoZSBsb2dpYyBleHByXG4gICAgYWRkQ29uc3RyYWludChuLCBmYWxzZSwgYyk7IC8vIHJlLWFkZCB0aGUgY29uc3RyYWludFxuXG4gICAgLy8gYnVpbGQgdGhlIHVybFxuICAgIGxldCB4ID0ganNvbjJ4bWwoaiwgdHJ1ZSk7XG4gICAgbGV0IGUgPSBlbmNvZGVVUklDb21wb25lbnQoeCk7XG4gICAgbGV0IHVybCA9IGAke2N1cnJNaW5lLnVybH0vc2VydmljZS9xdWVyeS9yZXN1bHRzP3N1bW1hcnlQYXRoPSR7cH0mZm9ybWF0PWpzb25yb3dzJnF1ZXJ5PSR7ZX1gXG4gICAgbGV0IHRocmVzaG9sZCA9IDI1MDtcblxuICAgIC8vIHNpZ25hbCB0aGF0IHdlJ3JlIHN0YXJ0aW5nXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCB0cnVlKTtcbiAgICAvLyBnbyFcbiAgICBkM2pzb25Qcm9taXNlKHVybCkudGhlbihmdW5jdGlvbihqc29uKXtcbiAgICAgICAgLy8gVGhlIGxpc3Qgb2YgdmFsdWVzIGlzIGluIGpzb24ucmV1bHRzLlxuICAgICAgICAvLyBFYWNoIGxpc3QgaXRlbSBsb29rcyBsaWtlOiB7IGl0ZW06IFwic29tZXN0cmluZ1wiLCBjb3VudDogMTcgfVxuICAgICAgICAvLyAoWWVzLCB3ZSBnZXQgY291bnRzIGZvciBmcmVlISBPdWdodCB0byBtYWtlIHVzZSBvZiB0aGlzLilcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHJlcyA9IGpzb24ucmVzdWx0cy5tYXAociA9PiByLml0ZW0pLnNvcnQoKTtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGxldCBhbnMgPSBwcm9tcHQoYFRoZXJlIGFyZSAke3Jlcy5sZW5ndGh9IHJlc3VsdHMsIHdoaWNoIGV4Y2VlZHMgdGhlIHRocmVzaG9sZCBvZiAke3RocmVzaG9sZH0uIEhvdyBtYW55IGRvIHlvdSB3YW50IHRvIHNob3c/YCwgdGhyZXNob2xkKTtcbiAgICAgICAgICAgIGlmIChhbnMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lLlxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFucyA9IHBhcnNlSW50KGFucyk7XG4gICAgICAgICAgICBpZiAoaXNOYU4oYW5zKSB8fCBhbnMgPD0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGFucyk7XG4gICAgICAgIH1cbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvcicpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgdHJ1ZSk7XG4gICAgICAgIGxldCBvcHRzID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdvcHRpb24nKVxuICAgICAgICAgICAgLmRhdGEocmVzKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZChcIm9wdGlvblwiKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGQgPT4gZClcbiAgICAgICAgICAgIC50ZXh0KCBkID0+IGQgKVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBudWxsKVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGN2YWxzLmluZGV4T2YoZCkgIT09IC0xIHx8IG51bGwpO1xuICAgICAgICAvLyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lLlxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgfSlcbn1cbi8vXG5mdW5jdGlvbiBjYW5jZWxDb25zdHJhaW50RWRpdG9yKG4sIGMpe1xuICAgIGlmICghIGMuc2F2ZWQpIHtcbiAgICAgICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCB0cnVlKTtcbiAgICB9XG4gICAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbn1cbmZ1bmN0aW9uIGhpZGVDb25zdHJhaW50RWRpdG9yKCl7XG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIikuY2xhc3NlZChcIm9wZW5cIiwgbnVsbCk7XG59XG4vL1xuZnVuY3Rpb24gZWRpdENvbnN0cmFpbnQoYywgbil7XG4gICAgb3BlbkNvbnN0cmFpbnRFZGl0b3IoYywgbik7XG59XG4vLyBSZXR1cm5zIGEgc2luZ2xlIGNoYXJhY3RlciBjb25zdHJhaW50IGNvZGUgaW4gdGhlIHJhbmdlIEEtWiB0aGF0IGlzIG5vdCBhbHJlYWR5XG4vLyB1c2VkIGluIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbi8vXG5mdW5jdGlvbiBuZXh0QXZhaWxhYmxlQ29kZSh0bXBsdCl7XG4gICAgZm9yKHZhciBpPSBcIkFcIi5jaGFyQ29kZUF0KDApOyBpIDw9IFwiWlwiLmNoYXJDb2RlQXQoMCk7IGkrKyl7XG4gICAgICAgIHZhciBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAgICAgaWYgKCEgKGMgaW4gdG1wbHQuY29kZTJjKSlcbiAgICAgICAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuLy8gQWRkcyBhIG5ldyBjb25zdHJhaW50IHRvIGEgbm9kZSBhbmQgcmV0dXJucyBpdC5cbi8vIEFyZ3M6XG4vLyAgIG4gKG5vZGUpIFRoZSBub2RlIHRvIGFkZCB0aGUgY29uc3RyYWludCB0by4gUmVxdWlyZWQuXG4vLyAgIHVwZGF0ZVVJIChib29sZWFuKSBJZiB0cnVlLCB1cGRhdGUgdGhlIGRpc3BsYXkuIElmIGZhbHNlIG9yIG5vdCBzcGVjaWZpZWQsIG5vIHVwZGF0ZS5cbi8vICAgYyAoY29uc3RyYWludCkgSWYgZ2l2ZW4sIHVzZSB0aGF0IGNvbnN0cmFpbnQuIE90aGVyd2lzZSBhdXRvZ2VuZXJhdGUuXG4vLyBSZXR1cm5zOlxuLy8gICBUaGUgbmV3IGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gYWRkQ29uc3RyYWludChuLCB1cGRhdGVVSSwgYykge1xuICAgIGlmIChjKSB7XG4gICAgICAgIC8vIGp1c3QgdG8gYmUgc3VyZVxuICAgICAgICBjLm5vZGUgPSBuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IG9wID0gT1BJTkRFWFtuLnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIgPyBcIj1cIiA6IFwiTE9PS1VQXCJdO1xuICAgICAgICBjID0gbmV3IENvbnN0cmFpbnQoe25vZGU6biwgb3A6b3Aub3AsIGN0eXBlOiBvcC5jdHlwZX0pO1xuICAgIH1cbiAgICBuLmNvbnN0cmFpbnRzLnB1c2goYyk7XG4gICAgbi50ZW1wbGF0ZS53aGVyZS5wdXNoKGMpO1xuICAgIGlmIChjLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgYy5jb2RlID0gbmV4dEF2YWlsYWJsZUNvZGUobi50ZW1wbGF0ZSk7XG4gICAgICAgIG4udGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICBzZXRMb2dpY0V4cHJlc3Npb24obi50ZW1wbGF0ZS5jb25zdHJhaW50TG9naWMsIG4udGVtcGxhdGUpO1xuICAgIH1cbiAgICAvL1xuICAgIGlmICh1cGRhdGVVSSkge1xuICAgICAgICB1cGRhdGUobik7XG4gICAgICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIGVkaXRDb25zdHJhaW50KGMsIG4pO1xuICAgIH1cbiAgICAvL1xuICAgIHJldHVybiBjO1xufVxuXG4vL1xuZnVuY3Rpb24gcmVtb3ZlQ29uc3RyYWludChuLCBjLCB1cGRhdGVVSSl7XG4gICAgbi5jb25zdHJhaW50cyA9IG4uY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICBjdXJyVGVtcGxhdGUud2hlcmUgPSBjdXJyVGVtcGxhdGUud2hlcmUuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICBkZWxldGUgY3VyclRlbXBsYXRlLmNvZGUyY1tjLmNvZGVdO1xuICAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICBzZXRMb2dpY0V4cHJlc3Npb24oY3VyclRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYywgY3VyclRlbXBsYXRlKTtcbiAgICAvL1xuICAgIGlmICh1cGRhdGVVSSkge1xuICAgICAgICB1cGRhdGUobik7XG4gICAgICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBjO1xufVxuLy9cbmZ1bmN0aW9uIHNhdmVDb25zdHJhaW50RWRpdHMobiwgYyl7XG4gICAgLy9cbiAgICBsZXQgbyA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlO1xuICAgIGMuc2V0T3Aobyk7XG4gICAgYy5zYXZlZCA9IHRydWU7XG4gICAgLy9cbiAgICBsZXQgdmFsID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWU7XG4gICAgbGV0IHZhbHMgPSBbXTtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkgdmFscy5wdXNoKHRoaXMudmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgIGxldCB6ID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvcicpLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuXG4gICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIGMudHlwZSA9IHZhbHNbMF1cbiAgICAgICAgYy52YWx1ZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgc2V0U3ViY2xhc3NDb25zdHJhaW50KG4sIGMudHlwZSlcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICBjLnZhbHVlID0gdmFsO1xuICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIGMuZXh0cmFWYWx1ZSA9IHZhbHNbMF0gPT09IFwiQW55XCIgPyBudWxsIDogdmFsc1swXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHZhbHNbMF07XG4gICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBjLnZhbHVlID0geiA/IHZhbHNbMF0gOiB2YWw7XG4gICAgICAgIGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IFwiVW5rbm93biBjdHlwZTogXCIrYy5jdHlwZTtcbiAgICB9XG4gICAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiAgICB1cGRhdGUobik7XG4gICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICBzYXZlU3RhdGUoKTtcbn1cblxuLy8gT3BlbnMgYSBkaWFsb2cgb24gdGhlIHNwZWNpZmllZCBub2RlLlxuLy8gQWxzbyBtYWtlcyB0aGF0IG5vZGUgdGhlIGN1cnJlbnQgbm9kZS5cbi8vIEFyZ3M6XG4vLyAgIG4gICAgdGhlIG5vZGVcbi8vICAgZWx0ICB0aGUgRE9NIGVsZW1lbnQgKGUuZy4gYSBjaXJjbGUpXG4vLyBSZXR1cm5zXG4vLyAgIHN0cmluZ1xuLy8gU2lkZSBlZmZlY3Q6XG4vLyAgIHNldHMgZ2xvYmFsIGN1cnJOb2RlXG4vL1xuZnVuY3Rpb24gc2hvd0RpYWxvZyhuLCBlbHQsIHJlZnJlc2hPbmx5KXtcbiAgaWYgKCFlbHQpIGVsdCA9IGZpbmREb21CeURhdGFPYmoobik7XG4gIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG4gXG4gIC8vIFNldCB0aGUgZ2xvYmFsIGN1cnJOb2RlXG4gIGN1cnJOb2RlID0gbjtcbiAgdmFyIGlzcm9vdCA9ICEgY3Vyck5vZGUucGFyZW50O1xuICAvLyBNYWtlIG5vZGUgdGhlIGRhdGEgb2JqIGZvciB0aGUgZGlhbG9nXG4gIHZhciBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpLmRhdHVtKG4pO1xuICAvLyBDYWxjdWxhdGUgZGlhbG9nJ3MgcG9zaXRpb25cbiAgdmFyIGRiYiA9IGRpYWxvZ1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGViYiA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGJiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHQgPSAoZWJiLnRvcCAtIGJiYi50b3ApICsgZWJiLndpZHRoLzI7XG4gIHZhciBiID0gKGJiYi5ib3R0b20gLSBlYmIuYm90dG9tKSArIGViYi53aWR0aC8yO1xuICB2YXIgbCA9IChlYmIubGVmdCAtIGJiYi5sZWZ0KSArIGViYi5oZWlnaHQvMjtcbiAgdmFyIGRpciA9IFwiZFwiIDsgLy8gXCJkXCIgb3IgXCJ1XCJcbiAgLy8gTkI6IGNhbid0IGdldCBvcGVuaW5nIHVwIHRvIHdvcmssIHNvIGhhcmQgd2lyZSBpdCB0byBkb3duLiA6LVxcXG5cbiAgLy9cbiAgZGlhbG9nXG4gICAgICAuc3R5bGUoXCJsZWZ0XCIsIGwrXCJweFwiKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsIHJlZnJlc2hPbmx5P1wic2NhbGUoMSlcIjpcInNjYWxlKDFlLTYpXCIpXG4gICAgICAuY2xhc3NlZChcImhpZGRlblwiLCBmYWxzZSlcbiAgICAgIC5jbGFzc2VkKFwiaXNyb290XCIsIGlzcm9vdClcbiAgICAgIDtcbiAgaWYgKGRpciA9PT0gXCJkXCIpXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgdCtcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDAlXCIpIDtcbiAgZWxzZVxuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwidG9wXCIsIG51bGwpXG4gICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIGIrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAxMDAlXCIpIDtcblxuICAvLyBTZXQgdGhlIGRpYWxvZyB0aXRsZSB0byBub2RlIG5hbWVcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJkaWFsb2dUaXRsZVwiXSBzcGFuJylcbiAgICAgIC50ZXh0KG4ubmFtZSk7XG4gIC8vIFNob3cgdGhlIGZ1bGwgcGF0aFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImZ1bGxQYXRoXCJdIGRpdicpXG4gICAgICAudGV4dChuLnBhdGgpO1xuICAvLyBUeXBlIGF0IHRoaXMgbm9kZVxuICB2YXIgdHAgPSBuLnB0eXBlLm5hbWUgfHwgbi5wdHlwZTtcbiAgdmFyIHN0cCA9IChuLnN1YmNsYXNzQ29uc3RyYWludCAmJiBuLnN1YmNsYXNzQ29uc3RyYWludC5uYW1lKSB8fCBudWxsO1xuICB2YXIgdHN0cmluZyA9IHN0cCAmJiBgPHNwYW4gc3R5bGU9XCJjb2xvcjogcHVycGxlO1wiPiR7c3RwfTwvc3Bhbj4gKCR7dHB9KWAgfHwgdHBcbiAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJ0eXBlXCJdIGRpdicpXG4gICAgICAuaHRtbCh0c3RyaW5nKTtcblxuICAvLyBXaXJlIHVwIGFkZCBjb25zdHJhaW50IGJ1dHRvblxuICBkaWFsb2cuc2VsZWN0KFwiI2RpYWxvZyAuY29uc3RyYWludFNlY3Rpb24gLmFkZC1idXR0b25cIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgYWRkQ29uc3RyYWludChuLCB0cnVlKTsgfSk7XG5cbiAgLy8gRmlsbCBvdXQgdGhlIGNvbnN0cmFpbnRzIHNlY3Rpb24uIEZpcnN0LCBzZWxlY3QgYWxsIGNvbnN0cmFpbnRzLlxuICB2YXIgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEobi5jb25zdHJhaW50cyk7XG4gIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gIC8vIDEuIGNvbnRhaW5lclxuICB2YXIgY2RpdnMgPSBjb25zdHJzLmVudGVyKCkuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLFwiY29uc3RyYWludFwiKSA7XG4gIC8vIDIuIG9wZXJhdG9yXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgLy8gMy4gdmFsdWVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwiY29kZVwiKSA7XG4gIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKS5hdHRyKFwidGl0bGVcIixcIkVkaXQgdGhpcyBjb25zdHJhaW50XCIpO1xuICAvLyA2LiBidXR0b24gdG8gcmVtb3ZlIHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGNhbmNlbFwiKS50ZXh0KFwiZGVsZXRlX2ZvcmV2ZXJcIikuYXR0cihcInRpdGxlXCIsXCJSZW1vdmUgdGhpcyBjb25zdHJhaW50XCIpO1xuXG4gIC8vIFJlbW92ZSBleGl0aW5nXG4gIGNvbnN0cnMuZXhpdCgpLnJlbW92ZSgpIDtcblxuICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICBjb25zdHJzXG4gICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGMpIHsgcmV0dXJuIFwiY29uc3RyYWludCBcIiArIGMuY3R5cGU7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwib3BcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXtcbiAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSArIChjLmV4dHJhVmFsdWUgPyBcIiBpbiBcIiArIGMuZXh0cmFWYWx1ZSA6IFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlIHx8IChjLnZhbHVlcyAmJiBjLnZhbHVlcy5qb2luKFwiLFwiKSkgfHwgYy50eXBlO1xuICAgICAgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmNhbmNlbFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIHJlbW92ZUNvbnN0cmFpbnQobiwgYywgdHJ1ZSk7XG4gICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICB9KVxuXG5cbiAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgLy9cbiAgdmFyIHQgPSBuLnBjb21wLnR5cGU7XG4gIGlmICh0eXBlb2YodCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLHRydWUpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkIH0pO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNvcnQtY3RybFwiXScpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRkZXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJkZXNjXCIpXG4gIH1cbiAgZWxzZSB7XG4gICAgICAvLyBEaWFsb2cgZm9yIGNsYXNzZXNcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsZmFsc2UpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZSA/IG4ucGNvbXAudHlwZS5uYW1lIDogbi5wY29tcC5uYW1lKTtcblxuICAgICAgLy8gd2lyZSB1cCB0aGUgYnV0dG9uIHRvIHNob3cgc3VtbWFyeSBmaWVsZHNcbiAgICAgIGRpYWxvZy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzaG93U3VtbWFyeVwiXScpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gc2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcInN1bW1hcnlmaWVsZHNcIikpO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSB0YWJsZSBsaXN0aW5nIGFsbCB0aGUgYXR0cmlidXRlcy9yZWZzL2NvbGxlY3Rpb25zLlxuICAgICAgdmFyIHRibCA9IGRpYWxvZy5zZWxlY3QoXCJ0YWJsZS5hdHRyaWJ1dGVzXCIpO1xuICAgICAgdmFyIHJvd3MgPSB0Ymwuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YSgobi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZSkuYWxsUGFydHMpXG4gICAgICAgICAgO1xuICAgICAgcm93cy5lbnRlcigpLmFwcGVuZChcInRyXCIpO1xuICAgICAgcm93cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICAgICAgICBpZiAoY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiU2VsZWN0IHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnc2VsZWN0c2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwic2VsZWN0ZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiQ29uc3RyYWluIHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnY29uc3RyYWluc2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwiY29uc3RyYWluZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBgPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiRm9sbG93IHRoaXMgJHtjb21wLmtpbmR9XCI+cGxheV9hcnJvdzwvaT5gLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnb3Blbm5leHQnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJvcGVuXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICA7XG4gICAgICBjZWxscy5lbnRlcigpLmFwcGVuZChcInRkXCIpO1xuICAgICAgY2VsbHNcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLmNsczt9KVxuICAgICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQuY2xpY2sgJiYgZC5jbGljaygpOyB9KVxuICAgICAgICAgIDtcbiAgICAgIGNlbGxzLmV4aXQoKS5yZW1vdmUoKTtcbiAgfVxufVxuXG4vLyBIaWRlcyB0aGUgZGlhbG9nLiBTZXRzIHRoZSBjdXJyZW50IG5vZGUgdG8gbnVsbC5cbi8vIEFyZ3M6XG4vLyAgIG5vbmVcbi8vIFJldHVybnNcbi8vICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgSGlkZXMgdGhlIGRpYWxvZy5cbi8vICBTZXRzIGN1cnJOb2RlIHRvIG51bGwuXG4vL1xuZnVuY3Rpb24gaGlkZURpYWxvZygpe1xuICBjdXJyTm9kZSA9IG51bGw7XG4gIHZhciBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpXG4gICAgICAuY2xhc3NlZChcImhpZGRlblwiLCB0cnVlKVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uLzIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDFlLTYpXCIpXG4gICAgICA7XG4gIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAuY2xhc3NlZChcIm9wZW5cIiwgbnVsbClcbiAgICAgIDtcbn1cblxuLy8gU2V0IHRoZSBlZGl0aW5nIHZpZXcuIFZpZXcgaXMgb25lIG9mOlxuLy8gQXJnczpcbi8vICAgICB2aWV3IChzdHJpbmcpIE9uZSBvZjogcXVlcnlNYWluLCBjb25zdHJhaW50TG9naWMsIGNvbHVtbk9yZGVyLCBzb3J0T3JkZXJcbi8vIFJldHVybnM6XG4vLyAgICAgTm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICAgIENoYW5nZXMgdGhlIGxheW91dCBhbmQgdXBkYXRlcyB0aGUgdmlldy5cbmZ1bmN0aW9uIHNldEVkaXRWaWV3KHZpZXcpe1xuICAgIGxldCB2ID0gZWRpdFZpZXdzW3ZpZXddO1xuICAgIGlmICghdikgdGhyb3cgXCJVbnJlY29nbml6ZWQgdmlldyB0eXBlOiBcIiArIHZpZXc7XG4gICAgZWRpdFZpZXcgPSB2O1xuICAgIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIHYubmFtZSk7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG5mdW5jdGlvbiBkb0xheW91dChyb290KXtcbiAgdmFyIGxheW91dDtcbiAgbGV0IGxlYXZlcyA9IFtdO1xuICBcbiAgaWYgKGVkaXRWaWV3LmxheW91dFN0eWxlID09PSBcInRyZWVcIikge1xuICAgICAgLy8gZDMgbGF5b3V0IGFycmFuZ2VzIG5vZGVzIHRvcC10by1ib3R0b20sIGJ1dCB3ZSB3YW50IGxlZnQtdG8tcmlnaHQuXG4gICAgICAvLyBTby4uLnJldmVyc2Ugd2lkdGggYW5kIGhlaWdodCwgYW5kIGRvIHRoZSBsYXlvdXQuIFRoZW4sIHJldmVyc2UgdGhlIHgseSBjb29yZHMgaW4gdGhlIHJlc3VsdHMuXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQudHJlZSgpLnNpemUoW2gsIHddKTtcbiAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgLy8gUmV2ZXJzZSB4IGFuZCB5LiBBbHNvLCBub3JtYWxpemUgeCBmb3IgZml4ZWQtZGVwdGguXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDtcbiAgICAgICAgICBkLnggPSBkLmRlcHRoICogMTgwO1xuICAgICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgICAvLyBkZW5kcm9ncmFtXG4gICAgICBmdW5jdGlvbiBtZCAobikgeyAvLyBtYXggZGVwdGhcbiAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPT09IDApIGxlYXZlcy5wdXNoKG4pO1xuICAgICAgICAgIHJldHVybiAxICsgKG4uY2hpbGRyZW4ubGVuZ3RoID8gTWF0aC5tYXguYXBwbHkobnVsbCwgbi5jaGlsZHJlbi5tYXAobWQpKSA6IDApO1xuICAgICAgfTtcbiAgICAgIGxldCBtYXhkID0gbWQocm9vdCk7IC8vIG1heCBkZXB0aCwgMS1iYXNlZFxuICAgICAgbGF5b3V0ID0gZDMubGF5b3V0LmNsdXN0ZXIoKVxuICAgICAgICAgIC5zZXBhcmF0aW9uKChhLGIpID0+IDEpXG4gICAgICAgICAgLnNpemUoW2gsIG1heGQgKiAxODBdKTtcbiAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgbm9kZXMgPSBsYXlvdXQubm9kZXMocm9vdCkucmV2ZXJzZSgpO1xuICAgICAgbm9kZXMuZm9yRWFjaCggZCA9PiB7IGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wOyB9KTtcblxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBSZWFycmFuZ2UgeS1wb3NpdGlvbnMgb2YgbGVhZiBub2Rlcy4gXG4gICAgICBsZXQgcG9zID0gbGVhdmVzLm1hcChmdW5jdGlvbihuKXsgcmV0dXJuIHsgeTogbi55LCB5MDogbi55MCB9OyB9KTtcblxuICAgICAgbGVhdmVzLnNvcnQoZWRpdFZpZXcubm9kZUNvbXApO1xuXG4gICAgICAvLyByZWFzc2lnbiB0aGUgWSBwb3NpdGlvbnNcbiAgICAgIGxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgICAgIG4ueSA9IHBvc1tpXS55O1xuICAgICAgICAgIG4ueTAgPSBwb3NbaV0ueTA7XG4gICAgICB9KTtcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIGxlYXZlcyBoYXZlIGJlZW4gcmVhcnJhbmdlZCwgYnV0IHRoZSBpbnRlcmlvciBub2RlcyBoYXZlbid0LlxuICAgICAgLy8gSGVyIHdlIG1vdmUgaW50ZXJpb3Igbm9kZXMgdG93YXJkIHRoZWlyIFwiY2VudGVyIG9mIGdyYXZpdHlcIiBhcyBkZWZpbmVkXG4gICAgICAvLyBieSB0aGUgcG9zaXRpb25zIG9mIHRoZWlyIGNoaWxkcmVuLiBBcHBseSB0aGlzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgICAgLy8gXG4gICAgICAvLyBOT1RFIHRoYXQgeCBhbmQgeSBjb29yZGluYXRlcyBhcmUgb3Bwb3NpdGUgYXQgdGhpcyBwb2ludCFcbiAgICAgIC8vXG4gICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBvY2N1cGllZCBwb3NpdGlvbnM6XG4gICAgICBsZXQgb2NjdXBpZWQgPSB7fSA7ICAvLyBvY2N1cGllZFt4IHBvc2l0aW9uXSA9PSBbbGlzdCBvZiBub2Rlc11cbiAgICAgIGZ1bmN0aW9uIGNvZyAobikge1xuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgLy8gY29tcHV0ZSBteSBjLm8uZy4gYXMgdGhlIGF2ZXJhZ2Ugb2YgbXkga2lkcycgcG9zaXRpb25zXG4gICAgICAgICAgICAgIGxldCBteUNvZyA9IChuLmNoaWxkcmVuLm1hcChjb2cpLnJlZHVjZSgodCxjKSA9PiB0K2MsIDApKS9uLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICAgICAgaWYobi5wYXJlbnQpIG4ueSA9IG15Q29nO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgZGQgPSBvY2N1cGllZFtuLnldID0gKG9jY3VwaWVkW24ueV0gfHwgW10pO1xuICAgICAgICAgIGRkLnB1c2gobi55KTtcbiAgICAgICAgICByZXR1cm4gbi55O1xuICAgICAgfVxuICAgICAgY29nKHJvb3QpO1xuXG4gICAgICAvLyBUT0RPOiBGaW5hbCBhZGp1c3RtZW50c1xuICAgICAgLy8gMS4gSWYgd2UgZXh0ZW5kIG9mZiB0aGUgcmlnaHQgZWRnZSwgY29tcHJlc3MuXG4gICAgICAvLyAyLiBJZiBpdGVtcyBhdCBzYW1lIHggb3ZlcmxhcCwgc3ByZWFkIHRoZW0gb3V0IGluIHkuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgfVxuXG4gIC8vIHNhdmUgbGlua3MgaW4gZ2xvYmFsXG4gIGxpbmtzID0gbGF5b3V0LmxpbmtzKG5vZGVzKTtcblxuICByZXR1cm4gW25vZGVzLCBsaW5rc11cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHVwZGF0ZShuKSBcbi8vIFRoZSBtYWluIGRyYXdpbmcgcm91dGluZS4gXG4vLyBVcGRhdGVzIHRoZSBTVkcsIHVzaW5nIG4gYXMgdGhlIHNvdXJjZSBvZiBhbnkgZW50ZXJpbmcvZXhpdGluZyBhbmltYXRpb25zLlxuLy9cbmZ1bmN0aW9uIHVwZGF0ZShzb3VyY2UpIHtcbiAgLy9cbiAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgZWRpdFZpZXcubmFtZSk7XG4gIGRvTGF5b3V0KHJvb3QpO1xuICB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKTtcbiAgdXBkYXRlTGlua3MobGlua3MsIHNvdXJjZSk7XG4gIHVwZGF0ZVR0ZXh0KCk7XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKXtcbiAgbGV0IG5vZGVHcnBzID0gdmlzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAuZGF0YShub2RlcywgZnVuY3Rpb24obikgeyByZXR1cm4gbi5pZCB8fCAobi5pZCA9ICsraSk7IH0pXG4gICAgICA7XG5cbiAgLy8gQ3JlYXRlIG5ldyBub2RlcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBub2RlRW50ZXIgPSBub2RlR3Jwcy5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgIC5hdHRyKFwiaWRcIiwgbiA9PiBuLnBhdGgucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlZ3JvdXBcIilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLngwICsgXCIsXCIgKyBzb3VyY2UueTAgKyBcIilcIjsgfSlcbiAgICAgIDtcblxuICAvLyBBZGQgZ2x5cGggZm9yIHRoZSBub2RlXG4gIG5vZGVFbnRlci5hcHBlbmQoZnVuY3Rpb24oZCl7XG4gICAgICB2YXIgc2hhcGUgPSAoZC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIgPyBcInJlY3RcIiA6IFwiY2lyY2xlXCIpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHNoYXBlKTtcbiAgICB9KVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZVwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47IFxuICAgICAgICAgIGlmIChjdXJyTm9kZSAhPT0gZCkgc2hvd0RpYWxvZyhkLCB0aGlzKTtcbiAgICAgICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0pO1xuICBub2RlRW50ZXIuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuICBub2RlRW50ZXIuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIC04LjUpXG4gICAgICAuYXR0cihcInlcIiwgLTguNSlcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuXG4gIC8vIEFkZCB0ZXh0IGZvciBub2RlIG5hbWVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5jaGlsZHJlbiA/IC0xMCA6IDEwOyB9KVxuICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIG5lYXJseSB0cmFuc3BhcmVudFxuICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZU5hbWVcIilcbiAgICAgIDtcblxuICAvLyBQbGFjZWhvbGRlciBmb3IgaWNvbi90ZXh0IHRvIGFwcGVhciBpbnNpZGUgbm9kZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlSWNvbicpXG4gICAgICAuYXR0cignZHknLCA1KVxuICAgICAgO1xuXG4gIC8vIEFkZCBub2RlIGhhbmRsZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdoYW5kbGUnKVxuICAgICAgLmF0dHIoJ2R4JywgMTApXG4gICAgICAuYXR0cignZHknLCA1KVxuICAgICAgO1xuXG4gIGxldCBub2RlVXBkYXRlID0gbm9kZUdycHNcbiAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgbiA9PiBuLmlzU2VsZWN0ZWQpXG4gICAgICAuY2xhc3NlZChcImNvbnN0cmFpbmVkXCIsIG4gPT4gbi5jb25zdHJhaW50cy5sZW5ndGggPiAwKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmxldmVsID49IDApXG4gICAgICAuY2xhc3NlZChcInNvcnRlZGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAuY2xhc3NlZChcInNvcnRlZGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgICAvLyBUcmFuc2l0aW9uIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIG4ueCArIFwiLFwiICsgbi55ICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0LmhhbmRsZVwiKVxuICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgZWRpdFZpZXcuaGFuZGxlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAudGV4dChlZGl0Vmlldy5oYW5kbGVJY29uLnRleHQgfHwgXCJcIikgO1xuICBub2RlVXBkYXRlLnNlbGVjdChcInRleHQubm9kZUljb25cIilcbiAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIGVkaXRWaWV3Lm5vZGVJY29uLmZvbnRGYW1pbHkgfHwgbnVsbClcbiAgICAgIC50ZXh0KGVkaXRWaWV3Lm5vZGVJY29uLnRleHQgfHwgXCJcIikgO1xuXG4gIG5vZGVVcGRhdGUuc2VsZWN0QWxsKFwidGV4dC5ub2RlTmFtZVwiKVxuICAgICAgLnRleHQobiA9PiBuLm5hbWUpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE1ha2Ugc2VsZWN0ZWQgbm9kZXMgZHJhZ2dhYmxlLlxuICAvLyBDbGVhciBvdXQgYWxsIGV4aXRpbmcgZHJhZyBoYW5kbGVyc1xuICBkMy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgZmFsc2UpXG4gICAgICAuc2VsZWN0KFwiLmhhbmRsZVwiKVxuICAgICAgICAgIC5vbihcIi5kcmFnXCIsIG51bGwpOyBcbiAgLy8gTm93IG1ha2UgZXZlcnl0aGluZyBkcmFnZ2FibGUgdGhhdCBzaG91bGQgYmVcbiAgaWYgKGVkaXRWaWV3LmRyYWdnYWJsZSlcbiAgICAgIGQzLnNlbGVjdEFsbChlZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgdHJ1ZSlcbiAgICAgICAgICAuY2FsbChkcmFnQmVoYXZpb3IpO1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEFkZCB0ZXh0IGZvciBjb25zdHJhaW50c1xuICBsZXQgY3QgPSBub2RlR3Jwcy5zZWxlY3RBbGwoXCJ0ZXh0LmNvbnN0cmFpbnRcIilcbiAgICAgIC5kYXRhKGZ1bmN0aW9uKG4peyByZXR1cm4gbi5jb25zdHJhaW50czsgfSk7XG4gIGN0LmVudGVyKCkuYXBwZW5kKFwic3ZnOnRleHRcIikuYXR0cihcImNsYXNzXCIsIFwiY29uc3RyYWludFwiKTtcbiAgY3QuZXhpdCgpLnJlbW92ZSgpO1xuICBjdC50ZXh0KCBjID0+IGNvbnN0cmFpbnRUZXh0KGMpIClcbiAgICAgICAuYXR0cihcInhcIiwgMClcbiAgICAgICAuYXR0cihcImR5XCIsIChjLGkpID0+IGAkeyhpKzEpKjEuN31lbWApXG4gICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLFwic3RhcnRcIilcbiAgICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIGZ1bGwgc2l6ZVxuICBub2RlVXBkYXRlLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDguNSApXG4gICAgICA7XG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxNyApXG4gICAgICAuYXR0cihcImhlaWdodFwiLCAxNyApXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIGZ1bGx5IG9wYXF1ZVxuICBub2RlVXBkYXRlLnNlbGVjdChcInRleHRcIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxKVxuICAgICAgO1xuXG4gIC8vXG4gIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICBsZXQgbm9kZUV4aXQgPSBub2RlR3Jwcy5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54ICsgXCIsXCIgKyBzb3VyY2UueSArIFwiKVwiOyB9KVxuICAgICAgLnJlbW92ZSgpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIHRpbnkgcmFkaXVzXG4gIG5vZGVFeGl0LnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIHRyYW5zcGFyZW50XG4gIG5vZGVFeGl0LnNlbGVjdChcInRleHRcIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KVxuICAgICAgO1xuICAvLyBTdGFzaCB0aGUgb2xkIHBvc2l0aW9ucyBmb3IgdHJhbnNpdGlvbi5cbiAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgZC54MCA9IGQueDtcbiAgICBkLnkwID0gZC55O1xuICB9KTtcbiAgLy9cblxufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTGlua3MobGlua3MsIHNvdXJjZSkge1xuICBsZXQgbGluayA9IHZpcy5zZWxlY3RBbGwoXCJwYXRoLmxpbmtcIilcbiAgICAgIC5kYXRhKGxpbmtzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC5pZDsgfSlcbiAgICAgIDtcblxuICAvLyBFbnRlciBhbnkgbmV3IGxpbmtzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cbiAgbGV0IG5ld1BhdGhzID0gbGluay5lbnRlcigpLmluc2VydChcInN2ZzpwYXRoXCIsIFwiZ1wiKTtcbiAgbGV0IGxpbmtUaXRsZSA9IGZ1bmN0aW9uKGwpe1xuICAgICAgbGV0IGNsaWNrID0gXCJcIjtcbiAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kICE9PSBcImF0dHJpYnV0ZVwiKXtcbiAgICAgICAgICBjbGljayA9IGBDbGljayB0byBtYWtlIHRoaXMgcmVsYXRpb25zaGlwICR7bC50YXJnZXQuam9pbiA/IFwiUkVRVUlSRURcIiA6IFwiT1BUSU9OQUxcIn0uIGA7XG4gICAgICB9XG4gICAgICBsZXQgYWx0Y2xpY2sgPSBcIkFsdC1jbGljayB0byBjdXQgbGluay5cIjtcbiAgICAgIHJldHVybiBjbGljayArIGFsdGNsaWNrO1xuICB9XG4gIC8vIHNldCB0aGUgdG9vbHRpcFxuICBuZXdQYXRocy5hcHBlbmQoXCJzdmc6dGl0bGVcIikudGV4dChsaW5rVGl0bGUpO1xuICBuZXdQYXRoc1xuICAgICAgLmF0dHIoXCJ0YXJnZXRcIiwgZCA9PiBkLnRhcmdldC5pZC5yZXBsYWNlKC9cXC4vZywgXCJfXCIpKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIilcbiAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHNvdXJjZS54MCwgeTogc291cmNlLnkwfTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5jbGFzc2VkKFwiYXR0cmlidXRlXCIsIGZ1bmN0aW9uKGwpIHsgcmV0dXJuIGwudGFyZ2V0LnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCI7IH0pXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihsKXsgXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICAvLyBhIHNoaWZ0LWNsaWNrIGN1dHMgdGhlIHRyZWUgYXQgdGhpcyBlZGdlXG4gICAgICAgICAgICAgIHJlbW92ZU5vZGUobC50YXJnZXQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiKSByZXR1cm47XG4gICAgICAgICAgICAgIC8vIHJlZ3VsYXIgY2xpY2sgb24gYSByZWxhdGlvbnNoaXAgZWRnZSBpbnZlcnRzIHdoZXRoZXJcbiAgICAgICAgICAgICAgLy8gdGhlIGpvaW4gaXMgaW5uZXIgb3Igb3V0ZXIuIFxuICAgICAgICAgICAgICBsLnRhcmdldC5qb2luID0gKGwudGFyZ2V0LmpvaW4gPyBudWxsIDogXCJvdXRlclwiKTtcbiAgICAgICAgICAgICAgLy8gcmUtc2V0IHRoZSB0b29sdGlwXG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJ0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICAgICAgICAgIHVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoXCJkXCIsIGRpYWdvbmFsKVxuICAgICAgO1xuIFxuICBcbiAgLy8gVHJhbnNpdGlvbiBsaW5rcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gIGxpbmsuY2xhc3NlZChcIm91dGVyXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4udGFyZ2V0LmpvaW4gPT09IFwib3V0ZXJcIjsgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGluay5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgbyA9IHt4OiBzb3VyY2UueCwgeTogc291cmNlLnl9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLnJlbW92ZSgpXG4gICAgICA7XG5cbn1cbi8vXG4vLyBGdW5jdGlvbiB0byBlc2NhcGUgJzwnICdcIicgYW5kICcmJyBjaGFyYWN0ZXJzXG5mdW5jdGlvbiBlc2Mocyl7XG4gICAgaWYgKCFzKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIik7IFxufVxuXG4vLyBUdXJucyBhIGpzb24gcmVwcmVzZW50YXRpb24gb2YgYSB0ZW1wbGF0ZSBpbnRvIFhNTCwgc3VpdGFibGUgZm9yIGltcG9ydGluZyBpbnRvIHRoZSBJbnRlcm1pbmUgUUIuXG5mdW5jdGlvbiBqc29uMnhtbCh0LCBxb25seSl7XG4gICAgdmFyIHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7IFxuICAgICAgICB2YXIgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICB2YXIgdiA9IHhba11cbiAgICAgICAgcmV0dXJuIHMgKyBgJHtrfSAke3Z9IGA7XG4gICAgfSwgXCJcIik7XG5cbiAgICAvLyBDb252ZXJ0cyBhbiBvdXRlciBqb2luIHBhdGggdG8geG1sLlxuICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICB9XG5cbiAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgIHZhciBxcGFydCA9IFxuYDxxdWVyeVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgbW9kZWw9XCIkeyh0Lm1vZGVsICYmIHQubW9kZWwubmFtZSkgfHwgJyd9XCJcbiAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gIHNvcnRPcmRlcj1cIiR7c28gfHwgJyd9XCJcbiAgJHt0LmNvbnN0cmFpbnRMb2dpYyAmJiAnY29uc3RyYWludExvZ2ljPVwiJyt0LmNvbnN0cmFpbnRMb2dpYysnXCInIHx8ICcnfVxuPlxuICAkeyh0LmpvaW5zIHx8IFtdKS5tYXAob2oyeG1sKS5qb2luKFwiIFwiKX1cbiAgJHsodC53aGVyZSB8fCBbXSkubWFwKGMgPT4gYy5jMnhtbChxb25seSkpLmpvaW4oXCIgXCIpfVxuPC9xdWVyeT5gO1xuICAgIC8vIHRoZSB3aG9sZSB0ZW1wbGF0ZVxuICAgIHZhciB0bXBsdCA9IFxuYDx0ZW1wbGF0ZVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgdGl0bGU9XCIke2VzYyh0LnRpdGxlIHx8ICcnKX1cIlxuICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAke3FwYXJ0fVxuPC90ZW1wbGF0ZT5cbmA7XG4gICAgcmV0dXJuIHFvbmx5ID8gcXBhcnQgOiB0bXBsdFxufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlVHRleHQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQ7XG4gIGlmKCBkMy5zZWxlY3QoXCIjdHRleHRcIikuY2xhc3NlZChcImpzb25cIikgKVxuICAgICAgdHh0ID0gSlNPTi5zdHJpbmdpZnkodWN0LCBudWxsLCAyKTtcbiAgZWxzZVxuICAgICAgdHh0ID0ganNvbjJ4bWwodWN0KTtcbiAgZDMuc2VsZWN0KFwiI3R0ZXh0ZGl2XCIpIFxuICAgICAgLnRleHQodHh0KVxuICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCB0cnVlKTtcbiAgICAgICAgICBzZWxlY3RUZXh0KFwidHRleHRkaXZcIik7XG4gICAgICB9KVxuICAgICAgLm9uKFwiYmx1clwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgIHVwZGF0ZUNvdW50KCk7XG59XG5cbmZ1bmN0aW9uIHJ1bmF0bWluZSgpIHtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gIGxldCBsaW5rdXJsID0gY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KCl7XG4gIGxldCB1Y3QgPSB1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpO1xuICBsZXQgcXR4dCA9IGpzb24yeG1sKHVjdCwgdHJ1ZSk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gIGxldCBjb3VudFVybCA9IGN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gIGQzanNvblByb21pc2UoY291bnRVcmwpXG4gICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCBzcGFuJykudGV4dChuKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIHRydWUpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgIH0pO1xufVxuXG4vLyBUaGUgY2FsbCB0aGF0IGdldHMgaXQgYWxsIGdvaW5nLi4uXG5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb25zdHJhaW50cyBvbiBhdHRyaWJ1dGVzOlxuLy8gLSB2YWx1ZSAoY29tcGFyaW5nIGFuIGF0dHJpYnV0ZSB0byBhIHZhbHVlLCB1c2luZyBhbiBvcGVyYXRvcilcbi8vICAgICAgPiA+PSA8IDw9ID0gIT0gTElLRSBOT1QtTElLRSBDT05UQUlOUyBET0VTLU5PVC1DT05UQUlOXG4vLyAtIG11bHRpdmFsdWUgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgbXVsdGlwbGUgdmFsdWUpXG4vLyAgICAgIE9ORS1PRiBOT1QtT05FIE9GXG4vLyAtIHJhbmdlIChzdWJ0eXBlIG9mIG11bHRpdmFsdWUsIGZvciBjb29yZGluYXRlIHJhbmdlcylcbi8vICAgICAgV0lUSElOIE9VVFNJREUgT1ZFUkxBUFMgRE9FUy1OT1QtT1ZFUkxBUFxuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwpXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vXG4vLyBDb25zdHJhaW50cyBvbiByZWZlcmVuY2VzL2NvbGxlY3Rpb25zXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTCByZWYvZW1wdHkgY29sbGVjdGlvbilcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy8gLSBsb29rdXAgKFxuLy8gICAgICBMT09LVVBcbi8vIC0gc3ViY2xhc3Ncbi8vICAgICAgSVNBXG4vLyAtIGxpc3Rcbi8vICAgICAgSU4gTk9ULUlOXG4vLyAtIGxvb3AgKFRPRE8pXG5cbnZhciBOVU1FUklDVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCJcbl07XG5cbnZhciBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbnZhciBMRUFGVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiLFxuICAgIFwiamF2YS5sYW5nLk9iamVjdFwiLFxuICAgIFwiT2JqZWN0XCJcbl1cblxuXG52YXIgT1BTID0gW1xuXG4gICAgLy8gVmFsaWQgZm9yIGFueSBhdHRyaWJ1dGVcbiAgICAvLyBBbHNvIHRoZSBvcGVyYXRvcnMgZm9yIGxvb3AgY29uc3RyYWludHMgKG5vdCB5ZXQgaW1wbGVtZW50ZWQpLlxuICAgIHtcbiAgICBvcDogXCI9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0se1xuICAgIG9wOiBcIiE9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIG51bWVyaWMgYW5kIGRhdGUgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCI+XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI+PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPFwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPD1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIHN0cmluZyBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIkNPTlRBSU5TXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG5cbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBDT05UQUlOXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgZm9yIExvY2F0aW9uIG5vZGVzXG4gICAge1xuICAgIG9wOiBcIldJVEhJTlwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVkVSTEFQU1wiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBPVkVSTEFQXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9VVFNJREVcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSxcbiBcbiAgICAvLyBOVUxMIGNvbnN0cmFpbnRzLiBWYWxpZCBmb3IgYW55IG5vZGUgZXhjZXB0IHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiSVMgTk9UIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgKGkuZS4sIHRoZSByb290LCBvciBhbnkgXG4gICAgLy8gcmVmZXJlbmNlIG9yIGNvbGxlY3Rpb24gbm9kZSkuXG4gICAge1xuICAgIG9wOiBcIkxPT0tVUFwiLFxuICAgIGN0eXBlOiBcImxvb2t1cFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIElOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgZXhjZXB0IHRoZSByb290LlxuICAgIHtcbiAgICBvcDogXCJJU0FcIixcbiAgICBjdHlwZTogXCJzdWJjbGFzc1wiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfV07XG4vL1xudmFyIE9QSU5ERVggPSBPUFMucmVkdWNlKGZ1bmN0aW9uKHgsbyl7XG4gICAgeFtvLm9wXSA9IG87XG4gICAgcmV0dXJuIHg7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9vcHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vLyBQcm9taXNpZmllcyBhIGNhbGwgdG8gZDMuanNvbi5cbi8vIEFyZ3M6XG4vLyAgIHVybCAoc3RyaW5nKSBUaGUgdXJsIG9mIHRoZSBqc29uIHJlc291cmNlXG4vLyBSZXR1cm5zOlxuLy8gICBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUganNvbiBvYmplY3QgdmFsdWUsIG9yIHJlamVjdHMgd2l0aCBhbiBlcnJvclxuZnVuY3Rpb24gZDNqc29uUHJvbWlzZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGQzLmpzb24odXJsLCBmdW5jdGlvbihlcnJvciwganNvbil7XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdCh7IHN0YXR1czogZXJyb3Iuc3RhdHVzLCBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0fSkgOiByZXNvbHZlKGpzb24pO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG4vLyBTZWxlY3RzIGFsbCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLiBcbi8vIFRoZSBjb250YWluZXIgbXVzdCBoYXZlIGFuIGlkLlxuLy8gQ29waWVkIGZyb206XG4vLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjc3NDUxL2hvdy10by1zZWxlY3QtZGl2LXRleHQtb24tYnV0dG9uLWNsaWNrXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGNvbnRhaW5lcmlkKSB7XG4gICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICByYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59XG5cbi8vIENvbnZlcnRzIGFuIEludGVyTWluZSBxdWVyeSBpbiBQYXRoUXVlcnkgWE1MIGZvcm1hdCB0byBhIEpTT04gb2JqZWN0IHJlcHJlc2VudGF0aW9uLlxuLy9cbmZ1bmN0aW9uIHBhcnNlUGF0aFF1ZXJ5KHhtbCl7XG4gICAgLy8gVHVybnMgdGhlIHF1YXNpLWxpc3Qgb2JqZWN0IHJldHVybmVkIGJ5IHNvbWUgRE9NIG1ldGhvZHMgaW50byBhY3R1YWwgbGlzdHMuXG4gICAgZnVuY3Rpb24gZG9tbGlzdDJhcnJheShsc3QpIHtcbiAgICAgICAgbGV0IGEgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8bHN0Lmxlbmd0aDsgaSsrKSBhLnB1c2gobHN0W2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIC8vIHBhcnNlIHRoZSBYTUxcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBkb20gPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgXCJ0ZXh0L3htbFwiKTtcblxuICAgIC8vIGdldCB0aGUgcGFydHMuIFVzZXIgbWF5IHBhc3RlIGluIGEgPHRlbXBsYXRlPiBvciBhIDxxdWVyeT5cbiAgICAvLyAoaS5lLiwgdGVtcGxhdGUgbWF5IGJlIG51bGwpXG4gICAgbGV0IHRlbXBsYXRlID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IHRpdGxlID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikgfHwgXCJcIjtcbiAgICBsZXQgY29tbWVudCA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcImNvbW1lbnRcIikgfHwgXCJcIjtcbiAgICBsZXQgcXVlcnkgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJxdWVyeVwiKVswXTtcbiAgICBsZXQgbW9kZWwgPSB7IG5hbWU6IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm1vZGVsXCIpIHx8IFwiZ2Vub21pY1wiIH07XG4gICAgbGV0IG5hbWUgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpIHx8IFwiXCI7XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibG9uZ0Rlc2NyaXRpb25cIikgfHwgXCJcIjtcbiAgICBsZXQgc2VsZWN0ID0gKHF1ZXJ5LmdldEF0dHJpYnV0ZShcInZpZXdcIikgfHwgXCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgbGV0IGNvbnN0cmFpbnRzID0gZG9tbGlzdDJhcnJheShkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnN0cmFpbnQnKSk7XG4gICAgbGV0IGNvbnN0cmFpbnRMb2dpYyA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImNvbnN0cmFpbnRMb2dpY1wiKTtcbiAgICBsZXQgam9pbnMgPSBkb21saXN0MmFycmF5KHF1ZXJ5LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiam9pblwiKSk7XG4gICAgbGV0IHNvcnRPcmRlciA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKSB8fCBcIlwiO1xuICAgIC8vXG4gICAgLy9cbiAgICBsZXQgd2hlcmUgPSBjb25zdHJhaW50cy5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgb3AgPSBjLmdldEF0dHJpYnV0ZShcIm9wXCIpO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjLmdldEF0dHJpYnV0ZShcInR5cGVcIik7XG4gICAgICAgICAgICAgICAgb3AgPSBcIklTQVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbHMgPSBkb21saXN0MmFycmF5KGMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ2YWx1ZVwiKSkubWFwKCB2ID0+IHYuaW5uZXJIVE1MICk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjLmdldEF0dHJpYnV0ZShcInBhdGhcIiksXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA6IHZhbHMsXG4gICAgICAgICAgICAgICAgdHlwZSA6IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjLmdldEF0dHJpYnV0ZShcImNvZGVcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGU6IGMuZ2V0QXR0cmlidXRlKFwiZWRpdGFibGVcIikgfHwgXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAvLyBDaGVjazogaWYgdGhlcmUgaXMgb25seSBvbmUgY29uc3RyYWludCwgKGFuZCBpdCdzIG5vdCBhbiBJU0EpLCBzb21ldGltZXMgdGhlIGNvbnN0cmFpbnRMb2dpYyBcbiAgICAvLyBhbmQvb3IgdGhlIGNvbnN0cmFpbnQgY29kZSBhcmUgbWlzc2luZy5cbiAgICBpZiAod2hlcmUubGVuZ3RoID09PSAxICYmIHdoZXJlWzBdLm9wICE9PSBcIklTQVwiICYmICF3aGVyZVswXS5jb2RlKXtcbiAgICAgICAgd2hlcmVbMF0uY29kZSA9IGNvbnN0cmFpbnRMb2dpYyA9IFwiQVwiO1xuICAgIH1cblxuICAgIC8vIG91dGVyIGpvaW5zLiBUaGV5IGxvb2sgbGlrZSB0aGlzOlxuICAgIC8vICAgICAgIDxqb2luIHBhdGg9XCJHZW5lLnNlcXVlbmNlT250b2xvZ3lUZXJtXCIgc3R5bGU9XCJPVVRFUlwiLz5cbiAgICBqb2lucyA9IGpvaW5zLm1hcCggaiA9PiBqLmdldEF0dHJpYnV0ZShcInBhdGhcIikgKTtcblxuICAgIGxldCBvcmRlckJ5ID0gbnVsbDtcbiAgICBpZiAoc29ydE9yZGVyKSB7XG4gICAgICAgIC8vIFRoZSBqc29uIGZvcm1hdCBmb3Igb3JkZXJCeSBpcyBhIGJpdCB3ZWlyZC5cbiAgICAgICAgLy8gSWYgdGhlIHhtbCBvcmRlckJ5IGlzOiBcIkEuYi5jIGFzYyBBLmQuZSBkZXNjXCIsXG4gICAgICAgIC8vIHRoZSBqc29uIHNob3VsZCBiZTogWyB7XCJBLmIuY1wiOlwiYXNjXCJ9LCB7XCJBLmQuZVwiOlwiZGVzY30gXVxuICAgICAgICAvLyBcbiAgICAgICAgLy8gVGhlIG9yZGVyYnkgc3RyaW5nIHRva2VucywgZS5nLiBbXCJBLmIuY1wiLCBcImFzY1wiLCBcIkEuZC5lXCIsIFwiZGVzY1wiXVxuICAgICAgICBsZXQgb2IgPSBzb3J0T3JkZXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIC8vIHNhbml0eSBjaGVjazpcbiAgICAgICAgaWYgKG9iLmxlbmd0aCAlIDIgKVxuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgcGFyc2UgdGhlIG9yZGVyQnkgY2xhdXNlOiBcIiArIHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKTtcbiAgICAgICAgLy8gY29udmVydCB0b2tlbnMgdG8ganNvbiBvcmRlckJ5IFxuICAgICAgICBvcmRlckJ5ID0gb2IucmVkdWNlKGZ1bmN0aW9uKGFjYywgY3VyciwgaSl7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApe1xuICAgICAgICAgICAgICAgIC8vIG9kZC4gY3VyciBpcyBhIHBhdGguIFB1c2ggaXQuXG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY3VycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGV2ZW4uIFBvcCB0aGUgcGF0aCwgY3JlYXRlIHRoZSB7fSwgYW5kIHB1c2ggaXQuXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB7fVxuICAgICAgICAgICAgICAgIGxldCBwID0gYWNjLnBvcCgpXG4gICAgICAgICAgICAgICAgdltwXSA9IGN1cnI7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYyxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgam9pbnMsXG4gICAgICAgIG9yZGVyQnlcbiAgICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZGVlcCBjb3B5IG9mIG9iamVjdCBvLiBcbi8vIEFyZ3M6XG4vLyAgIG8gIChvYmplY3QpIE11c3QgYmUgYSBKU09OIG9iamVjdCAobm8gY3VyY3VsYXIgcmVmcywgbm8gZnVuY3Rpb25zKS5cbi8vIFJldHVybnM6XG4vLyAgIGEgZGVlcCBjb3B5IG9mIG9cbmZ1bmN0aW9uIGRlZXBjKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBvO1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTtcbn1cblxuLy9cbmxldCBQUkVGSVg9XCJvcmcubWdpLmFwcHMucWJcIjtcbmZ1bmN0aW9uIHRlc3RMb2NhbChhdHRyKSB7XG4gICAgcmV0dXJuIChQUkVGSVgrXCIuXCIrYXR0cikgaW4gbG9jYWxTdG9yYWdlO1xufVxuZnVuY3Rpb24gc2V0TG9jYWwoYXR0ciwgdmFsLCBlbmNvZGUpe1xuICAgIGxvY2FsU3RvcmFnZVtQUkVGSVgrXCIuXCIrYXR0cl0gPSBlbmNvZGUgPyBKU09OLnN0cmluZ2lmeSh2YWwpIDogdmFsO1xufVxuZnVuY3Rpb24gZ2V0TG9jYWwoYXR0ciwgZGVjb2RlLCBkZmx0KXtcbiAgICBsZXQga2V5ID0gUFJFRklYK1wiLlwiK2F0dHI7XG4gICAgaWYgKGtleSBpbiBsb2NhbFN0b3JhZ2Upe1xuICAgICAgICBsZXQgdiA9IGxvY2FsU3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAoZGVjb2RlKSB2ID0gSlNPTi5wYXJzZSh2KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZGZsdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhckxvY2FsKCkge1xuICAgIGxldCBybXYgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoUFJFRklYKSk7XG4gICAgcm12LmZvckVhY2goIGsgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oaykgKTtcbn1cblxuLy9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibGV0IHMgPSBgXG4zZF9yb3RhdGlvbiBlODRkXG5hY191bml0IGViM2JcbmFjY2Vzc19hbGFybSBlMTkwXG5hY2Nlc3NfYWxhcm1zIGUxOTFcbmFjY2Vzc190aW1lIGUxOTJcbmFjY2Vzc2liaWxpdHkgZTg0ZVxuYWNjZXNzaWJsZSBlOTE0XG5hY2NvdW50X2JhbGFuY2UgZTg0ZlxuYWNjb3VudF9iYWxhbmNlX3dhbGxldCBlODUwXG5hY2NvdW50X2JveCBlODUxXG5hY2NvdW50X2NpcmNsZSBlODUzXG5hZGIgZTYwZVxuYWRkIGUxNDVcbmFkZF9hX3Bob3RvIGU0MzlcbmFkZF9hbGFybSBlMTkzXG5hZGRfYWxlcnQgZTAwM1xuYWRkX2JveCBlMTQ2XG5hZGRfY2lyY2xlIGUxNDdcbmFkZF9jaXJjbGVfb3V0bGluZSBlMTQ4XG5hZGRfbG9jYXRpb24gZTU2N1xuYWRkX3Nob3BwaW5nX2NhcnQgZTg1NFxuYWRkX3RvX3Bob3RvcyBlMzlkXG5hZGRfdG9fcXVldWUgZTA1Y1xuYWRqdXN0IGUzOWVcbmFpcmxpbmVfc2VhdF9mbGF0IGU2MzBcbmFpcmxpbmVfc2VhdF9mbGF0X2FuZ2xlZCBlNjMxXG5haXJsaW5lX3NlYXRfaW5kaXZpZHVhbF9zdWl0ZSBlNjMyXG5haXJsaW5lX3NlYXRfbGVncm9vbV9leHRyYSBlNjMzXG5haXJsaW5lX3NlYXRfbGVncm9vbV9ub3JtYWwgZTYzNFxuYWlybGluZV9zZWF0X2xlZ3Jvb21fcmVkdWNlZCBlNjM1XG5haXJsaW5lX3NlYXRfcmVjbGluZV9leHRyYSBlNjM2XG5haXJsaW5lX3NlYXRfcmVjbGluZV9ub3JtYWwgZTYzN1xuYWlycGxhbmVtb2RlX2FjdGl2ZSBlMTk1XG5haXJwbGFuZW1vZGVfaW5hY3RpdmUgZTE5NFxuYWlycGxheSBlMDU1XG5haXJwb3J0X3NodXR0bGUgZWIzY1xuYWxhcm0gZTg1NVxuYWxhcm1fYWRkIGU4NTZcbmFsYXJtX29mZiBlODU3XG5hbGFybV9vbiBlODU4XG5hbGJ1bSBlMDE5XG5hbGxfaW5jbHVzaXZlIGViM2RcbmFsbF9vdXQgZTkwYlxuYW5kcm9pZCBlODU5XG5hbm5vdW5jZW1lbnQgZTg1YVxuYXBwcyBlNWMzXG5hcmNoaXZlIGUxNDlcbmFycm93X2JhY2sgZTVjNFxuYXJyb3dfZG93bndhcmQgZTVkYlxuYXJyb3dfZHJvcF9kb3duIGU1YzVcbmFycm93X2Ryb3BfZG93bl9jaXJjbGUgZTVjNlxuYXJyb3dfZHJvcF91cCBlNWM3XG5hcnJvd19mb3J3YXJkIGU1YzhcbmFycm93X3Vwd2FyZCBlNWQ4XG5hcnRfdHJhY2sgZTA2MFxuYXNwZWN0X3JhdGlvIGU4NWJcbmFzc2Vzc21lbnQgZTg1Y1xuYXNzaWdubWVudCBlODVkXG5hc3NpZ25tZW50X2luZCBlODVlXG5hc3NpZ25tZW50X2xhdGUgZTg1ZlxuYXNzaWdubWVudF9yZXR1cm4gZTg2MFxuYXNzaWdubWVudF9yZXR1cm5lZCBlODYxXG5hc3NpZ25tZW50X3R1cm5lZF9pbiBlODYyXG5hc3Npc3RhbnQgZTM5ZlxuYXNzaXN0YW50X3Bob3RvIGUzYTBcbmF0dGFjaF9maWxlIGUyMjZcbmF0dGFjaF9tb25leSBlMjI3XG5hdHRhY2htZW50IGUyYmNcbmF1ZGlvdHJhY2sgZTNhMVxuYXV0b3JlbmV3IGU4NjNcbmF2X3RpbWVyIGUwMWJcbmJhY2tzcGFjZSBlMTRhXG5iYWNrdXAgZTg2NFxuYmF0dGVyeV9hbGVydCBlMTljXG5iYXR0ZXJ5X2NoYXJnaW5nX2Z1bGwgZTFhM1xuYmF0dGVyeV9mdWxsIGUxYTRcbmJhdHRlcnlfc3RkIGUxYTVcbmJhdHRlcnlfdW5rbm93biBlMWE2XG5iZWFjaF9hY2Nlc3MgZWIzZVxuYmVlbmhlcmUgZTUyZFxuYmxvY2sgZTE0YlxuYmx1ZXRvb3RoIGUxYTdcbmJsdWV0b290aF9hdWRpbyBlNjBmXG5ibHVldG9vdGhfY29ubmVjdGVkIGUxYThcbmJsdWV0b290aF9kaXNhYmxlZCBlMWE5XG5ibHVldG9vdGhfc2VhcmNoaW5nIGUxYWFcbmJsdXJfY2lyY3VsYXIgZTNhMlxuYmx1cl9saW5lYXIgZTNhM1xuYmx1cl9vZmYgZTNhNFxuYmx1cl9vbiBlM2E1XG5ib29rIGU4NjVcbmJvb2ttYXJrIGU4NjZcbmJvb2ttYXJrX2JvcmRlciBlODY3XG5ib3JkZXJfYWxsIGUyMjhcbmJvcmRlcl9ib3R0b20gZTIyOVxuYm9yZGVyX2NsZWFyIGUyMmFcbmJvcmRlcl9jb2xvciBlMjJiXG5ib3JkZXJfaG9yaXpvbnRhbCBlMjJjXG5ib3JkZXJfaW5uZXIgZTIyZFxuYm9yZGVyX2xlZnQgZTIyZVxuYm9yZGVyX291dGVyIGUyMmZcbmJvcmRlcl9yaWdodCBlMjMwXG5ib3JkZXJfc3R5bGUgZTIzMVxuYm9yZGVyX3RvcCBlMjMyXG5ib3JkZXJfdmVydGljYWwgZTIzM1xuYnJhbmRpbmdfd2F0ZXJtYXJrIGUwNmJcbmJyaWdodG5lc3NfMSBlM2E2XG5icmlnaHRuZXNzXzIgZTNhN1xuYnJpZ2h0bmVzc18zIGUzYThcbmJyaWdodG5lc3NfNCBlM2E5XG5icmlnaHRuZXNzXzUgZTNhYVxuYnJpZ2h0bmVzc182IGUzYWJcbmJyaWdodG5lc3NfNyBlM2FjXG5icmlnaHRuZXNzX2F1dG8gZTFhYlxuYnJpZ2h0bmVzc19oaWdoIGUxYWNcbmJyaWdodG5lc3NfbG93IGUxYWRcbmJyaWdodG5lc3NfbWVkaXVtIGUxYWVcbmJyb2tlbl9pbWFnZSBlM2FkXG5icnVzaCBlM2FlXG5idWJibGVfY2hhcnQgZTZkZFxuYnVnX3JlcG9ydCBlODY4XG5idWlsZCBlODY5XG5idXJzdF9tb2RlIGU0M2NcbmJ1c2luZXNzIGUwYWZcbmJ1c2luZXNzX2NlbnRlciBlYjNmXG5jYWNoZWQgZTg2YVxuY2FrZSBlN2U5XG5jYWxsIGUwYjBcbmNhbGxfZW5kIGUwYjFcbmNhbGxfbWFkZSBlMGIyXG5jYWxsX21lcmdlIGUwYjNcbmNhbGxfbWlzc2VkIGUwYjRcbmNhbGxfbWlzc2VkX291dGdvaW5nIGUwZTRcbmNhbGxfcmVjZWl2ZWQgZTBiNVxuY2FsbF9zcGxpdCBlMGI2XG5jYWxsX3RvX2FjdGlvbiBlMDZjXG5jYW1lcmEgZTNhZlxuY2FtZXJhX2FsdCBlM2IwXG5jYW1lcmFfZW5oYW5jZSBlOGZjXG5jYW1lcmFfZnJvbnQgZTNiMVxuY2FtZXJhX3JlYXIgZTNiMlxuY2FtZXJhX3JvbGwgZTNiM1xuY2FuY2VsIGU1YzlcbmNhcmRfZ2lmdGNhcmQgZThmNlxuY2FyZF9tZW1iZXJzaGlwIGU4ZjdcbmNhcmRfdHJhdmVsIGU4ZjhcbmNhc2lubyBlYjQwXG5jYXN0IGUzMDdcbmNhc3RfY29ubmVjdGVkIGUzMDhcbmNlbnRlcl9mb2N1c19zdHJvbmcgZTNiNFxuY2VudGVyX2ZvY3VzX3dlYWsgZTNiNVxuY2hhbmdlX2hpc3RvcnkgZTg2YlxuY2hhdCBlMGI3XG5jaGF0X2J1YmJsZSBlMGNhXG5jaGF0X2J1YmJsZV9vdXRsaW5lIGUwY2JcbmNoZWNrIGU1Y2FcbmNoZWNrX2JveCBlODM0XG5jaGVja19ib3hfb3V0bGluZV9ibGFuayBlODM1XG5jaGVja19jaXJjbGUgZTg2Y1xuY2hldnJvbl9sZWZ0IGU1Y2JcbmNoZXZyb25fcmlnaHQgZTVjY1xuY2hpbGRfY2FyZSBlYjQxXG5jaGlsZF9mcmllbmRseSBlYjQyXG5jaHJvbWVfcmVhZGVyX21vZGUgZTg2ZFxuY2xhc3MgZTg2ZVxuY2xlYXIgZTE0Y1xuY2xlYXJfYWxsIGUwYjhcbmNsb3NlIGU1Y2RcbmNsb3NlZF9jYXB0aW9uIGUwMWNcbmNsb3VkIGUyYmRcbmNsb3VkX2NpcmNsZSBlMmJlXG5jbG91ZF9kb25lIGUyYmZcbmNsb3VkX2Rvd25sb2FkIGUyYzBcbmNsb3VkX29mZiBlMmMxXG5jbG91ZF9xdWV1ZSBlMmMyXG5jbG91ZF91cGxvYWQgZTJjM1xuY29kZSBlODZmXG5jb2xsZWN0aW9ucyBlM2I2XG5jb2xsZWN0aW9uc19ib29rbWFyayBlNDMxXG5jb2xvcl9sZW5zIGUzYjdcbmNvbG9yaXplIGUzYjhcbmNvbW1lbnQgZTBiOVxuY29tcGFyZSBlM2I5XG5jb21wYXJlX2Fycm93cyBlOTE1XG5jb21wdXRlciBlMzBhXG5jb25maXJtYXRpb25fbnVtYmVyIGU2MzhcbmNvbnRhY3RfbWFpbCBlMGQwXG5jb250YWN0X3Bob25lIGUwY2ZcbmNvbnRhY3RzIGUwYmFcbmNvbnRlbnRfY29weSBlMTRkXG5jb250ZW50X2N1dCBlMTRlXG5jb250ZW50X3Bhc3RlIGUxNGZcbmNvbnRyb2xfcG9pbnQgZTNiYVxuY29udHJvbF9wb2ludF9kdXBsaWNhdGUgZTNiYlxuY29weXJpZ2h0IGU5MGNcbmNyZWF0ZSBlMTUwXG5jcmVhdGVfbmV3X2ZvbGRlciBlMmNjXG5jcmVkaXRfY2FyZCBlODcwXG5jcm9wIGUzYmVcbmNyb3BfMTZfOSBlM2JjXG5jcm9wXzNfMiBlM2JkXG5jcm9wXzVfNCBlM2JmXG5jcm9wXzdfNSBlM2MwXG5jcm9wX2RpbiBlM2MxXG5jcm9wX2ZyZWUgZTNjMlxuY3JvcF9sYW5kc2NhcGUgZTNjM1xuY3JvcF9vcmlnaW5hbCBlM2M0XG5jcm9wX3BvcnRyYWl0IGUzYzVcbmNyb3Bfcm90YXRlIGU0MzdcbmNyb3Bfc3F1YXJlIGUzYzZcbmRhc2hib2FyZCBlODcxXG5kYXRhX3VzYWdlIGUxYWZcbmRhdGVfcmFuZ2UgZTkxNlxuZGVoYXplIGUzYzdcbmRlbGV0ZSBlODcyXG5kZWxldGVfZm9yZXZlciBlOTJiXG5kZWxldGVfc3dlZXAgZTE2Y1xuZGVzY3JpcHRpb24gZTg3M1xuZGVza3RvcF9tYWMgZTMwYlxuZGVza3RvcF93aW5kb3dzIGUzMGNcbmRldGFpbHMgZTNjOFxuZGV2ZWxvcGVyX2JvYXJkIGUzMGRcbmRldmVsb3Blcl9tb2RlIGUxYjBcbmRldmljZV9odWIgZTMzNVxuZGV2aWNlcyBlMWIxXG5kZXZpY2VzX290aGVyIGUzMzdcbmRpYWxlcl9zaXAgZTBiYlxuZGlhbHBhZCBlMGJjXG5kaXJlY3Rpb25zIGU1MmVcbmRpcmVjdGlvbnNfYmlrZSBlNTJmXG5kaXJlY3Rpb25zX2JvYXQgZTUzMlxuZGlyZWN0aW9uc19idXMgZTUzMFxuZGlyZWN0aW9uc19jYXIgZTUzMVxuZGlyZWN0aW9uc19yYWlsd2F5IGU1MzRcbmRpcmVjdGlvbnNfcnVuIGU1NjZcbmRpcmVjdGlvbnNfc3Vid2F5IGU1MzNcbmRpcmVjdGlvbnNfdHJhbnNpdCBlNTM1XG5kaXJlY3Rpb25zX3dhbGsgZTUzNlxuZGlzY19mdWxsIGU2MTBcbmRucyBlODc1XG5kb19ub3RfZGlzdHVyYiBlNjEyXG5kb19ub3RfZGlzdHVyYl9hbHQgZTYxMVxuZG9fbm90X2Rpc3R1cmJfb2ZmIGU2NDNcbmRvX25vdF9kaXN0dXJiX29uIGU2NDRcbmRvY2sgZTMwZVxuZG9tYWluIGU3ZWVcbmRvbmUgZTg3NlxuZG9uZV9hbGwgZTg3N1xuZG9udXRfbGFyZ2UgZTkxN1xuZG9udXRfc21hbGwgZTkxOFxuZHJhZnRzIGUxNTFcbmRyYWdfaGFuZGxlIGUyNWRcbmRyaXZlX2V0YSBlNjEzXG5kdnIgZTFiMlxuZWRpdCBlM2M5XG5lZGl0X2xvY2F0aW9uIGU1NjhcbmVqZWN0IGU4ZmJcbmVtYWlsIGUwYmVcbmVuaGFuY2VkX2VuY3J5cHRpb24gZTYzZlxuZXF1YWxpemVyIGUwMWRcbmVycm9yIGUwMDBcbmVycm9yX291dGxpbmUgZTAwMVxuZXVyb19zeW1ib2wgZTkyNlxuZXZfc3RhdGlvbiBlNTZkXG5ldmVudCBlODc4XG5ldmVudF9hdmFpbGFibGUgZTYxNFxuZXZlbnRfYnVzeSBlNjE1XG5ldmVudF9ub3RlIGU2MTZcbmV2ZW50X3NlYXQgZTkwM1xuZXhpdF90b19hcHAgZTg3OVxuZXhwYW5kX2xlc3MgZTVjZVxuZXhwYW5kX21vcmUgZTVjZlxuZXhwbGljaXQgZTAxZVxuZXhwbG9yZSBlODdhXG5leHBvc3VyZSBlM2NhXG5leHBvc3VyZV9uZWdfMSBlM2NiXG5leHBvc3VyZV9uZWdfMiBlM2NjXG5leHBvc3VyZV9wbHVzXzEgZTNjZFxuZXhwb3N1cmVfcGx1c18yIGUzY2VcbmV4cG9zdXJlX3plcm8gZTNjZlxuZXh0ZW5zaW9uIGU4N2JcbmZhY2UgZTg3Y1xuZmFzdF9mb3J3YXJkIGUwMWZcbmZhc3RfcmV3aW5kIGUwMjBcbmZhdm9yaXRlIGU4N2RcbmZhdm9yaXRlX2JvcmRlciBlODdlXG5mZWF0dXJlZF9wbGF5X2xpc3QgZTA2ZFxuZmVhdHVyZWRfdmlkZW8gZTA2ZVxuZmVlZGJhY2sgZTg3ZlxuZmliZXJfZHZyIGUwNWRcbmZpYmVyX21hbnVhbF9yZWNvcmQgZTA2MVxuZmliZXJfbmV3IGUwNWVcbmZpYmVyX3BpbiBlMDZhXG5maWJlcl9zbWFydF9yZWNvcmQgZTA2MlxuZmlsZV9kb3dubG9hZCBlMmM0XG5maWxlX3VwbG9hZCBlMmM2XG5maWx0ZXIgZTNkM1xuZmlsdGVyXzEgZTNkMFxuZmlsdGVyXzIgZTNkMVxuZmlsdGVyXzMgZTNkMlxuZmlsdGVyXzQgZTNkNFxuZmlsdGVyXzUgZTNkNVxuZmlsdGVyXzYgZTNkNlxuZmlsdGVyXzcgZTNkN1xuZmlsdGVyXzggZTNkOFxuZmlsdGVyXzkgZTNkOVxuZmlsdGVyXzlfcGx1cyBlM2RhXG5maWx0ZXJfYl9hbmRfdyBlM2RiXG5maWx0ZXJfY2VudGVyX2ZvY3VzIGUzZGNcbmZpbHRlcl9kcmFtYSBlM2RkXG5maWx0ZXJfZnJhbWVzIGUzZGVcbmZpbHRlcl9oZHIgZTNkZlxuZmlsdGVyX2xpc3QgZTE1MlxuZmlsdGVyX25vbmUgZTNlMFxuZmlsdGVyX3RpbHRfc2hpZnQgZTNlMlxuZmlsdGVyX3ZpbnRhZ2UgZTNlM1xuZmluZF9pbl9wYWdlIGU4ODBcbmZpbmRfcmVwbGFjZSBlODgxXG5maW5nZXJwcmludCBlOTBkXG5maXJzdF9wYWdlIGU1ZGNcbmZpdG5lc3NfY2VudGVyIGViNDNcbmZsYWcgZTE1M1xuZmxhcmUgZTNlNFxuZmxhc2hfYXV0byBlM2U1XG5mbGFzaF9vZmYgZTNlNlxuZmxhc2hfb24gZTNlN1xuZmxpZ2h0IGU1MzlcbmZsaWdodF9sYW5kIGU5MDRcbmZsaWdodF90YWtlb2ZmIGU5MDVcbmZsaXAgZTNlOFxuZmxpcF90b19iYWNrIGU4ODJcbmZsaXBfdG9fZnJvbnQgZTg4M1xuZm9sZGVyIGUyYzdcbmZvbGRlcl9vcGVuIGUyYzhcbmZvbGRlcl9zaGFyZWQgZTJjOVxuZm9sZGVyX3NwZWNpYWwgZTYxN1xuZm9udF9kb3dubG9hZCBlMTY3XG5mb3JtYXRfYWxpZ25fY2VudGVyIGUyMzRcbmZvcm1hdF9hbGlnbl9qdXN0aWZ5IGUyMzVcbmZvcm1hdF9hbGlnbl9sZWZ0IGUyMzZcbmZvcm1hdF9hbGlnbl9yaWdodCBlMjM3XG5mb3JtYXRfYm9sZCBlMjM4XG5mb3JtYXRfY2xlYXIgZTIzOVxuZm9ybWF0X2NvbG9yX2ZpbGwgZTIzYVxuZm9ybWF0X2NvbG9yX3Jlc2V0IGUyM2JcbmZvcm1hdF9jb2xvcl90ZXh0IGUyM2NcbmZvcm1hdF9pbmRlbnRfZGVjcmVhc2UgZTIzZFxuZm9ybWF0X2luZGVudF9pbmNyZWFzZSBlMjNlXG5mb3JtYXRfaXRhbGljIGUyM2ZcbmZvcm1hdF9saW5lX3NwYWNpbmcgZTI0MFxuZm9ybWF0X2xpc3RfYnVsbGV0ZWQgZTI0MVxuZm9ybWF0X2xpc3RfbnVtYmVyZWQgZTI0MlxuZm9ybWF0X3BhaW50IGUyNDNcbmZvcm1hdF9xdW90ZSBlMjQ0XG5mb3JtYXRfc2hhcGVzIGUyNWVcbmZvcm1hdF9zaXplIGUyNDVcbmZvcm1hdF9zdHJpa2V0aHJvdWdoIGUyNDZcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX2xfdG9fciBlMjQ3XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9yX3RvX2wgZTI0OFxuZm9ybWF0X3VuZGVybGluZWQgZTI0OVxuZm9ydW0gZTBiZlxuZm9yd2FyZCBlMTU0XG5mb3J3YXJkXzEwIGUwNTZcbmZvcndhcmRfMzAgZTA1N1xuZm9yd2FyZF81IGUwNThcbmZyZWVfYnJlYWtmYXN0IGViNDRcbmZ1bGxzY3JlZW4gZTVkMFxuZnVsbHNjcmVlbl9leGl0IGU1ZDFcbmZ1bmN0aW9ucyBlMjRhXG5nX3RyYW5zbGF0ZSBlOTI3XG5nYW1lcGFkIGUzMGZcbmdhbWVzIGUwMjFcbmdhdmVsIGU5MGVcbmdlc3R1cmUgZTE1NVxuZ2V0X2FwcCBlODg0XG5naWYgZTkwOFxuZ29sZl9jb3Vyc2UgZWI0NVxuZ3BzX2ZpeGVkIGUxYjNcbmdwc19ub3RfZml4ZWQgZTFiNFxuZ3BzX29mZiBlMWI1XG5ncmFkZSBlODg1XG5ncmFkaWVudCBlM2U5XG5ncmFpbiBlM2VhXG5ncmFwaGljX2VxIGUxYjhcbmdyaWRfb2ZmIGUzZWJcbmdyaWRfb24gZTNlY1xuZ3JvdXAgZTdlZlxuZ3JvdXBfYWRkIGU3ZjBcbmdyb3VwX3dvcmsgZTg4NlxuaGQgZTA1MlxuaGRyX29mZiBlM2VkXG5oZHJfb24gZTNlZVxuaGRyX3N0cm9uZyBlM2YxXG5oZHJfd2VhayBlM2YyXG5oZWFkc2V0IGUzMTBcbmhlYWRzZXRfbWljIGUzMTFcbmhlYWxpbmcgZTNmM1xuaGVhcmluZyBlMDIzXG5oZWxwIGU4ODdcbmhlbHBfb3V0bGluZSBlOGZkXG5oaWdoX3F1YWxpdHkgZTAyNFxuaGlnaGxpZ2h0IGUyNWZcbmhpZ2hsaWdodF9vZmYgZTg4OFxuaGlzdG9yeSBlODg5XG5ob21lIGU4OGFcbmhvdF90dWIgZWI0NlxuaG90ZWwgZTUzYVxuaG91cmdsYXNzX2VtcHR5IGU4OGJcbmhvdXJnbGFzc19mdWxsIGU4OGNcbmh0dHAgZTkwMlxuaHR0cHMgZTg4ZFxuaW1hZ2UgZTNmNFxuaW1hZ2VfYXNwZWN0X3JhdGlvIGUzZjVcbmltcG9ydF9jb250YWN0cyBlMGUwXG5pbXBvcnRfZXhwb3J0IGUwYzNcbmltcG9ydGFudF9kZXZpY2VzIGU5MTJcbmluYm94IGUxNTZcbmluZGV0ZXJtaW5hdGVfY2hlY2tfYm94IGU5MDlcbmluZm8gZTg4ZVxuaW5mb19vdXRsaW5lIGU4OGZcbmlucHV0IGU4OTBcbmluc2VydF9jaGFydCBlMjRiXG5pbnNlcnRfY29tbWVudCBlMjRjXG5pbnNlcnRfZHJpdmVfZmlsZSBlMjRkXG5pbnNlcnRfZW1vdGljb24gZTI0ZVxuaW5zZXJ0X2ludml0YXRpb24gZTI0ZlxuaW5zZXJ0X2xpbmsgZTI1MFxuaW5zZXJ0X3Bob3RvIGUyNTFcbmludmVydF9jb2xvcnMgZTg5MVxuaW52ZXJ0X2NvbG9yc19vZmYgZTBjNFxuaXNvIGUzZjZcbmtleWJvYXJkIGUzMTJcbmtleWJvYXJkX2Fycm93X2Rvd24gZTMxM1xua2V5Ym9hcmRfYXJyb3dfbGVmdCBlMzE0XG5rZXlib2FyZF9hcnJvd19yaWdodCBlMzE1XG5rZXlib2FyZF9hcnJvd191cCBlMzE2XG5rZXlib2FyZF9iYWNrc3BhY2UgZTMxN1xua2V5Ym9hcmRfY2Fwc2xvY2sgZTMxOFxua2V5Ym9hcmRfaGlkZSBlMzFhXG5rZXlib2FyZF9yZXR1cm4gZTMxYlxua2V5Ym9hcmRfdGFiIGUzMWNcbmtleWJvYXJkX3ZvaWNlIGUzMWRcbmtpdGNoZW4gZWI0N1xubGFiZWwgZTg5MlxubGFiZWxfb3V0bGluZSBlODkzXG5sYW5kc2NhcGUgZTNmN1xubGFuZ3VhZ2UgZTg5NFxubGFwdG9wIGUzMWVcbmxhcHRvcF9jaHJvbWVib29rIGUzMWZcbmxhcHRvcF9tYWMgZTMyMFxubGFwdG9wX3dpbmRvd3MgZTMyMVxubGFzdF9wYWdlIGU1ZGRcbmxhdW5jaCBlODk1XG5sYXllcnMgZTUzYlxubGF5ZXJzX2NsZWFyIGU1M2NcbmxlYWtfYWRkIGUzZjhcbmxlYWtfcmVtb3ZlIGUzZjlcbmxlbnMgZTNmYVxubGlicmFyeV9hZGQgZTAyZVxubGlicmFyeV9ib29rcyBlMDJmXG5saWJyYXJ5X211c2ljIGUwMzBcbmxpZ2h0YnVsYl9vdXRsaW5lIGU5MGZcbmxpbmVfc3R5bGUgZTkxOVxubGluZV93ZWlnaHQgZTkxYVxubGluZWFyX3NjYWxlIGUyNjBcbmxpbmsgZTE1N1xubGlua2VkX2NhbWVyYSBlNDM4XG5saXN0IGU4OTZcbmxpdmVfaGVscCBlMGM2XG5saXZlX3R2IGU2MzlcbmxvY2FsX2FjdGl2aXR5IGU1M2ZcbmxvY2FsX2FpcnBvcnQgZTUzZFxubG9jYWxfYXRtIGU1M2VcbmxvY2FsX2JhciBlNTQwXG5sb2NhbF9jYWZlIGU1NDFcbmxvY2FsX2Nhcl93YXNoIGU1NDJcbmxvY2FsX2NvbnZlbmllbmNlX3N0b3JlIGU1NDNcbmxvY2FsX2RpbmluZyBlNTU2XG5sb2NhbF9kcmluayBlNTQ0XG5sb2NhbF9mbG9yaXN0IGU1NDVcbmxvY2FsX2dhc19zdGF0aW9uIGU1NDZcbmxvY2FsX2dyb2Nlcnlfc3RvcmUgZTU0N1xubG9jYWxfaG9zcGl0YWwgZTU0OFxubG9jYWxfaG90ZWwgZTU0OVxubG9jYWxfbGF1bmRyeV9zZXJ2aWNlIGU1NGFcbmxvY2FsX2xpYnJhcnkgZTU0YlxubG9jYWxfbWFsbCBlNTRjXG5sb2NhbF9tb3ZpZXMgZTU0ZFxubG9jYWxfb2ZmZXIgZTU0ZVxubG9jYWxfcGFya2luZyBlNTRmXG5sb2NhbF9waGFybWFjeSBlNTUwXG5sb2NhbF9waG9uZSBlNTUxXG5sb2NhbF9waXp6YSBlNTUyXG5sb2NhbF9wbGF5IGU1NTNcbmxvY2FsX3Bvc3Rfb2ZmaWNlIGU1NTRcbmxvY2FsX3ByaW50c2hvcCBlNTU1XG5sb2NhbF9zZWUgZTU1N1xubG9jYWxfc2hpcHBpbmcgZTU1OFxubG9jYWxfdGF4aSBlNTU5XG5sb2NhdGlvbl9jaXR5IGU3ZjFcbmxvY2F0aW9uX2Rpc2FibGVkIGUxYjZcbmxvY2F0aW9uX29mZiBlMGM3XG5sb2NhdGlvbl9vbiBlMGM4XG5sb2NhdGlvbl9zZWFyY2hpbmcgZTFiN1xubG9jayBlODk3XG5sb2NrX29wZW4gZTg5OFxubG9ja19vdXRsaW5lIGU4OTlcbmxvb2tzIGUzZmNcbmxvb2tzXzMgZTNmYlxubG9va3NfNCBlM2ZkXG5sb29rc181IGUzZmVcbmxvb2tzXzYgZTNmZlxubG9va3Nfb25lIGU0MDBcbmxvb2tzX3R3byBlNDAxXG5sb29wIGUwMjhcbmxvdXBlIGU0MDJcbmxvd19wcmlvcml0eSBlMTZkXG5sb3lhbHR5IGU4OWFcbm1haWwgZTE1OFxubWFpbF9vdXRsaW5lIGUwZTFcbm1hcCBlNTViXG5tYXJrdW5yZWFkIGUxNTlcbm1hcmt1bnJlYWRfbWFpbGJveCBlODliXG5tZW1vcnkgZTMyMlxubWVudSBlNWQyXG5tZXJnZV90eXBlIGUyNTJcbm1lc3NhZ2UgZTBjOVxubWljIGUwMjlcbm1pY19ub25lIGUwMmFcbm1pY19vZmYgZTAyYlxubW1zIGU2MThcbm1vZGVfY29tbWVudCBlMjUzXG5tb2RlX2VkaXQgZTI1NFxubW9uZXRpemF0aW9uX29uIGUyNjNcbm1vbmV5X29mZiBlMjVjXG5tb25vY2hyb21lX3Bob3RvcyBlNDAzXG5tb29kIGU3ZjJcbm1vb2RfYmFkIGU3ZjNcbm1vcmUgZTYxOVxubW9yZV9ob3JpeiBlNWQzXG5tb3JlX3ZlcnQgZTVkNFxubW90b3JjeWNsZSBlOTFiXG5tb3VzZSBlMzIzXG5tb3ZlX3RvX2luYm94IGUxNjhcbm1vdmllIGUwMmNcbm1vdmllX2NyZWF0aW9uIGU0MDRcbm1vdmllX2ZpbHRlciBlNDNhXG5tdWx0aWxpbmVfY2hhcnQgZTZkZlxubXVzaWNfbm90ZSBlNDA1XG5tdXNpY192aWRlbyBlMDYzXG5teV9sb2NhdGlvbiBlNTVjXG5uYXR1cmUgZTQwNlxubmF0dXJlX3Blb3BsZSBlNDA3XG5uYXZpZ2F0ZV9iZWZvcmUgZTQwOFxubmF2aWdhdGVfbmV4dCBlNDA5XG5uYXZpZ2F0aW9uIGU1NWRcbm5lYXJfbWUgZTU2OVxubmV0d29ya19jZWxsIGUxYjlcbm5ldHdvcmtfY2hlY2sgZTY0MFxubmV0d29ya19sb2NrZWQgZTYxYVxubmV0d29ya193aWZpIGUxYmFcbm5ld19yZWxlYXNlcyBlMDMxXG5uZXh0X3dlZWsgZTE2YVxubmZjIGUxYmJcbm5vX2VuY3J5cHRpb24gZTY0MVxubm9fc2ltIGUwY2Ncbm5vdF9pbnRlcmVzdGVkIGUwMzNcbm5vdGUgZTA2Zlxubm90ZV9hZGQgZTg5Y1xubm90aWZpY2F0aW9ucyBlN2Y0XG5ub3RpZmljYXRpb25zX2FjdGl2ZSBlN2Y3XG5ub3RpZmljYXRpb25zX25vbmUgZTdmNVxubm90aWZpY2F0aW9uc19vZmYgZTdmNlxubm90aWZpY2F0aW9uc19wYXVzZWQgZTdmOFxub2ZmbGluZV9waW4gZTkwYVxub25kZW1hbmRfdmlkZW8gZTYzYVxub3BhY2l0eSBlOTFjXG5vcGVuX2luX2Jyb3dzZXIgZTg5ZFxub3Blbl9pbl9uZXcgZTg5ZVxub3Blbl93aXRoIGU4OWZcbnBhZ2VzIGU3ZjlcbnBhZ2V2aWV3IGU4YTBcbnBhbGV0dGUgZTQwYVxucGFuX3Rvb2wgZTkyNVxucGFub3JhbWEgZTQwYlxucGFub3JhbWFfZmlzaF9leWUgZTQwY1xucGFub3JhbWFfaG9yaXpvbnRhbCBlNDBkXG5wYW5vcmFtYV92ZXJ0aWNhbCBlNDBlXG5wYW5vcmFtYV93aWRlX2FuZ2xlIGU0MGZcbnBhcnR5X21vZGUgZTdmYVxucGF1c2UgZTAzNFxucGF1c2VfY2lyY2xlX2ZpbGxlZCBlMDM1XG5wYXVzZV9jaXJjbGVfb3V0bGluZSBlMDM2XG5wYXltZW50IGU4YTFcbnBlb3BsZSBlN2ZiXG5wZW9wbGVfb3V0bGluZSBlN2ZjXG5wZXJtX2NhbWVyYV9taWMgZThhMlxucGVybV9jb250YWN0X2NhbGVuZGFyIGU4YTNcbnBlcm1fZGF0YV9zZXR0aW5nIGU4YTRcbnBlcm1fZGV2aWNlX2luZm9ybWF0aW9uIGU4YTVcbnBlcm1faWRlbnRpdHkgZThhNlxucGVybV9tZWRpYSBlOGE3XG5wZXJtX3Bob25lX21zZyBlOGE4XG5wZXJtX3NjYW5fd2lmaSBlOGE5XG5wZXJzb24gZTdmZFxucGVyc29uX2FkZCBlN2ZlXG5wZXJzb25fb3V0bGluZSBlN2ZmXG5wZXJzb25fcGluIGU1NWFcbnBlcnNvbl9waW5fY2lyY2xlIGU1NmFcbnBlcnNvbmFsX3ZpZGVvIGU2M2JcbnBldHMgZTkxZFxucGhvbmUgZTBjZFxucGhvbmVfYW5kcm9pZCBlMzI0XG5waG9uZV9ibHVldG9vdGhfc3BlYWtlciBlNjFiXG5waG9uZV9mb3J3YXJkZWQgZTYxY1xucGhvbmVfaW5fdGFsayBlNjFkXG5waG9uZV9pcGhvbmUgZTMyNVxucGhvbmVfbG9ja2VkIGU2MWVcbnBob25lX21pc3NlZCBlNjFmXG5waG9uZV9wYXVzZWQgZTYyMFxucGhvbmVsaW5rIGUzMjZcbnBob25lbGlua19lcmFzZSBlMGRiXG5waG9uZWxpbmtfbG9jayBlMGRjXG5waG9uZWxpbmtfb2ZmIGUzMjdcbnBob25lbGlua19yaW5nIGUwZGRcbnBob25lbGlua19zZXR1cCBlMGRlXG5waG90byBlNDEwXG5waG90b19hbGJ1bSBlNDExXG5waG90b19jYW1lcmEgZTQxMlxucGhvdG9fZmlsdGVyIGU0M2JcbnBob3RvX2xpYnJhcnkgZTQxM1xucGhvdG9fc2l6ZV9zZWxlY3RfYWN0dWFsIGU0MzJcbnBob3RvX3NpemVfc2VsZWN0X2xhcmdlIGU0MzNcbnBob3RvX3NpemVfc2VsZWN0X3NtYWxsIGU0MzRcbnBpY3R1cmVfYXNfcGRmIGU0MTVcbnBpY3R1cmVfaW5fcGljdHVyZSBlOGFhXG5waWN0dXJlX2luX3BpY3R1cmVfYWx0IGU5MTFcbnBpZV9jaGFydCBlNmM0XG5waWVfY2hhcnRfb3V0bGluZWQgZTZjNVxucGluX2Ryb3AgZTU1ZVxucGxhY2UgZTU1ZlxucGxheV9hcnJvdyBlMDM3XG5wbGF5X2NpcmNsZV9maWxsZWQgZTAzOFxucGxheV9jaXJjbGVfb3V0bGluZSBlMDM5XG5wbGF5X2Zvcl93b3JrIGU5MDZcbnBsYXlsaXN0X2FkZCBlMDNiXG5wbGF5bGlzdF9hZGRfY2hlY2sgZTA2NVxucGxheWxpc3RfcGxheSBlMDVmXG5wbHVzX29uZSBlODAwXG5wb2xsIGU4MDFcbnBvbHltZXIgZThhYlxucG9vbCBlYjQ4XG5wb3J0YWJsZV93aWZpX29mZiBlMGNlXG5wb3J0cmFpdCBlNDE2XG5wb3dlciBlNjNjXG5wb3dlcl9pbnB1dCBlMzM2XG5wb3dlcl9zZXR0aW5nc19uZXcgZThhY1xucHJlZ25hbnRfd29tYW4gZTkxZVxucHJlc2VudF90b19hbGwgZTBkZlxucHJpbnQgZThhZFxucHJpb3JpdHlfaGlnaCBlNjQ1XG5wdWJsaWMgZTgwYlxucHVibGlzaCBlMjU1XG5xdWVyeV9idWlsZGVyIGU4YWVcbnF1ZXN0aW9uX2Fuc3dlciBlOGFmXG5xdWV1ZSBlMDNjXG5xdWV1ZV9tdXNpYyBlMDNkXG5xdWV1ZV9wbGF5X25leHQgZTA2NlxucmFkaW8gZTAzZVxucmFkaW9fYnV0dG9uX2NoZWNrZWQgZTgzN1xucmFkaW9fYnV0dG9uX3VuY2hlY2tlZCBlODM2XG5yYXRlX3JldmlldyBlNTYwXG5yZWNlaXB0IGU4YjBcbnJlY2VudF9hY3RvcnMgZTAzZlxucmVjb3JkX3ZvaWNlX292ZXIgZTkxZlxucmVkZWVtIGU4YjFcbnJlZG8gZTE1YVxucmVmcmVzaCBlNWQ1XG5yZW1vdmUgZTE1YlxucmVtb3ZlX2NpcmNsZSBlMTVjXG5yZW1vdmVfY2lyY2xlX291dGxpbmUgZTE1ZFxucmVtb3ZlX2Zyb21fcXVldWUgZTA2N1xucmVtb3ZlX3JlZF9leWUgZTQxN1xucmVtb3ZlX3Nob3BwaW5nX2NhcnQgZTkyOFxucmVvcmRlciBlOGZlXG5yZXBlYXQgZTA0MFxucmVwZWF0X29uZSBlMDQxXG5yZXBsYXkgZTA0MlxucmVwbGF5XzEwIGUwNTlcbnJlcGxheV8zMCBlMDVhXG5yZXBsYXlfNSBlMDViXG5yZXBseSBlMTVlXG5yZXBseV9hbGwgZTE1ZlxucmVwb3J0IGUxNjBcbnJlcG9ydF9wcm9ibGVtIGU4YjJcbnJlc3RhdXJhbnQgZTU2Y1xucmVzdGF1cmFudF9tZW51IGU1NjFcbnJlc3RvcmUgZThiM1xucmVzdG9yZV9wYWdlIGU5MjlcbnJpbmdfdm9sdW1lIGUwZDFcbnJvb20gZThiNFxucm9vbV9zZXJ2aWNlIGViNDlcbnJvdGF0ZV85MF9kZWdyZWVzX2NjdyBlNDE4XG5yb3RhdGVfbGVmdCBlNDE5XG5yb3RhdGVfcmlnaHQgZTQxYVxucm91bmRlZF9jb3JuZXIgZTkyMFxucm91dGVyIGUzMjhcbnJvd2luZyBlOTIxXG5yc3NfZmVlZCBlMGU1XG5ydl9ob29rdXAgZTY0Mlxuc2F0ZWxsaXRlIGU1NjJcbnNhdmUgZTE2MVxuc2Nhbm5lciBlMzI5XG5zY2hlZHVsZSBlOGI1XG5zY2hvb2wgZTgwY1xuc2NyZWVuX2xvY2tfbGFuZHNjYXBlIGUxYmVcbnNjcmVlbl9sb2NrX3BvcnRyYWl0IGUxYmZcbnNjcmVlbl9sb2NrX3JvdGF0aW9uIGUxYzBcbnNjcmVlbl9yb3RhdGlvbiBlMWMxXG5zY3JlZW5fc2hhcmUgZTBlMlxuc2RfY2FyZCBlNjIzXG5zZF9zdG9yYWdlIGUxYzJcbnNlYXJjaCBlOGI2XG5zZWN1cml0eSBlMzJhXG5zZWxlY3RfYWxsIGUxNjJcbnNlbmQgZTE2M1xuc2VudGltZW50X2Rpc3NhdGlzZmllZCBlODExXG5zZW50aW1lbnRfbmV1dHJhbCBlODEyXG5zZW50aW1lbnRfc2F0aXNmaWVkIGU4MTNcbnNlbnRpbWVudF92ZXJ5X2Rpc3NhdGlzZmllZCBlODE0XG5zZW50aW1lbnRfdmVyeV9zYXRpc2ZpZWQgZTgxNVxuc2V0dGluZ3MgZThiOFxuc2V0dGluZ3NfYXBwbGljYXRpb25zIGU4YjlcbnNldHRpbmdzX2JhY2t1cF9yZXN0b3JlIGU4YmFcbnNldHRpbmdzX2JsdWV0b290aCBlOGJiXG5zZXR0aW5nc19icmlnaHRuZXNzIGU4YmRcbnNldHRpbmdzX2NlbGwgZThiY1xuc2V0dGluZ3NfZXRoZXJuZXQgZThiZVxuc2V0dGluZ3NfaW5wdXRfYW50ZW5uYSBlOGJmXG5zZXR0aW5nc19pbnB1dF9jb21wb25lbnQgZThjMFxuc2V0dGluZ3NfaW5wdXRfY29tcG9zaXRlIGU4YzFcbnNldHRpbmdzX2lucHV0X2hkbWkgZThjMlxuc2V0dGluZ3NfaW5wdXRfc3ZpZGVvIGU4YzNcbnNldHRpbmdzX292ZXJzY2FuIGU4YzRcbnNldHRpbmdzX3Bob25lIGU4YzVcbnNldHRpbmdzX3Bvd2VyIGU4YzZcbnNldHRpbmdzX3JlbW90ZSBlOGM3XG5zZXR0aW5nc19zeXN0ZW1fZGF5ZHJlYW0gZTFjM1xuc2V0dGluZ3Nfdm9pY2UgZThjOFxuc2hhcmUgZTgwZFxuc2hvcCBlOGM5XG5zaG9wX3R3byBlOGNhXG5zaG9wcGluZ19iYXNrZXQgZThjYlxuc2hvcHBpbmdfY2FydCBlOGNjXG5zaG9ydF90ZXh0IGUyNjFcbnNob3dfY2hhcnQgZTZlMVxuc2h1ZmZsZSBlMDQzXG5zaWduYWxfY2VsbHVsYXJfNF9iYXIgZTFjOFxuc2lnbmFsX2NlbGx1bGFyX2Nvbm5lY3RlZF9ub19pbnRlcm5ldF80X2JhciBlMWNkXG5zaWduYWxfY2VsbHVsYXJfbm9fc2ltIGUxY2VcbnNpZ25hbF9jZWxsdWxhcl9udWxsIGUxY2ZcbnNpZ25hbF9jZWxsdWxhcl9vZmYgZTFkMFxuc2lnbmFsX3dpZmlfNF9iYXIgZTFkOFxuc2lnbmFsX3dpZmlfNF9iYXJfbG9jayBlMWQ5XG5zaWduYWxfd2lmaV9vZmYgZTFkYVxuc2ltX2NhcmQgZTMyYlxuc2ltX2NhcmRfYWxlcnQgZTYyNFxuc2tpcF9uZXh0IGUwNDRcbnNraXBfcHJldmlvdXMgZTA0NVxuc2xpZGVzaG93IGU0MWJcbnNsb3dfbW90aW9uX3ZpZGVvIGUwNjhcbnNtYXJ0cGhvbmUgZTMyY1xuc21va2VfZnJlZSBlYjRhXG5zbW9raW5nX3Jvb21zIGViNGJcbnNtcyBlNjI1XG5zbXNfZmFpbGVkIGU2MjZcbnNub296ZSBlMDQ2XG5zb3J0IGUxNjRcbnNvcnRfYnlfYWxwaGEgZTA1M1xuc3BhIGViNGNcbnNwYWNlX2JhciBlMjU2XG5zcGVha2VyIGUzMmRcbnNwZWFrZXJfZ3JvdXAgZTMyZVxuc3BlYWtlcl9ub3RlcyBlOGNkXG5zcGVha2VyX25vdGVzX29mZiBlOTJhXG5zcGVha2VyX3Bob25lIGUwZDJcbnNwZWxsY2hlY2sgZThjZVxuc3RhciBlODM4XG5zdGFyX2JvcmRlciBlODNhXG5zdGFyX2hhbGYgZTgzOVxuc3RhcnMgZThkMFxuc3RheV9jdXJyZW50X2xhbmRzY2FwZSBlMGQzXG5zdGF5X2N1cnJlbnRfcG9ydHJhaXQgZTBkNFxuc3RheV9wcmltYXJ5X2xhbmRzY2FwZSBlMGQ1XG5zdGF5X3ByaW1hcnlfcG9ydHJhaXQgZTBkNlxuc3RvcCBlMDQ3XG5zdG9wX3NjcmVlbl9zaGFyZSBlMGUzXG5zdG9yYWdlIGUxZGJcbnN0b3JlIGU4ZDFcbnN0b3JlX21hbGxfZGlyZWN0b3J5IGU1NjNcbnN0cmFpZ2h0ZW4gZTQxY1xuc3RyZWV0dmlldyBlNTZlXG5zdHJpa2V0aHJvdWdoX3MgZTI1N1xuc3R5bGUgZTQxZFxuc3ViZGlyZWN0b3J5X2Fycm93X2xlZnQgZTVkOVxuc3ViZGlyZWN0b3J5X2Fycm93X3JpZ2h0IGU1ZGFcbnN1YmplY3QgZThkMlxuc3Vic2NyaXB0aW9ucyBlMDY0XG5zdWJ0aXRsZXMgZTA0OFxuc3Vid2F5IGU1NmZcbnN1cGVydmlzb3JfYWNjb3VudCBlOGQzXG5zdXJyb3VuZF9zb3VuZCBlMDQ5XG5zd2FwX2NhbGxzIGUwZDdcbnN3YXBfaG9yaXogZThkNFxuc3dhcF92ZXJ0IGU4ZDVcbnN3YXBfdmVydGljYWxfY2lyY2xlIGU4ZDZcbnN3aXRjaF9jYW1lcmEgZTQxZVxuc3dpdGNoX3ZpZGVvIGU0MWZcbnN5bmMgZTYyN1xuc3luY19kaXNhYmxlZCBlNjI4XG5zeW5jX3Byb2JsZW0gZTYyOVxuc3lzdGVtX3VwZGF0ZSBlNjJhXG5zeXN0ZW1fdXBkYXRlX2FsdCBlOGQ3XG50YWIgZThkOFxudGFiX3Vuc2VsZWN0ZWQgZThkOVxudGFibGV0IGUzMmZcbnRhYmxldF9hbmRyb2lkIGUzMzBcbnRhYmxldF9tYWMgZTMzMVxudGFnX2ZhY2VzIGU0MjBcbnRhcF9hbmRfcGxheSBlNjJiXG50ZXJyYWluIGU1NjRcbnRleHRfZmllbGRzIGUyNjJcbnRleHRfZm9ybWF0IGUxNjVcbnRleHRzbXMgZTBkOFxudGV4dHVyZSBlNDIxXG50aGVhdGVycyBlOGRhXG50aHVtYl9kb3duIGU4ZGJcbnRodW1iX3VwIGU4ZGNcbnRodW1ic191cF9kb3duIGU4ZGRcbnRpbWVfdG9fbGVhdmUgZTYyY1xudGltZWxhcHNlIGU0MjJcbnRpbWVsaW5lIGU5MjJcbnRpbWVyIGU0MjVcbnRpbWVyXzEwIGU0MjNcbnRpbWVyXzMgZTQyNFxudGltZXJfb2ZmIGU0MjZcbnRpdGxlIGUyNjRcbnRvYyBlOGRlXG50b2RheSBlOGRmXG50b2xsIGU4ZTBcbnRvbmFsaXR5IGU0MjdcbnRvdWNoX2FwcCBlOTEzXG50b3lzIGUzMzJcbnRyYWNrX2NoYW5nZXMgZThlMVxudHJhZmZpYyBlNTY1XG50cmFpbiBlNTcwXG50cmFtIGU1NzFcbnRyYW5zZmVyX3dpdGhpbl9hX3N0YXRpb24gZTU3MlxudHJhbnNmb3JtIGU0MjhcbnRyYW5zbGF0ZSBlOGUyXG50cmVuZGluZ19kb3duIGU4ZTNcbnRyZW5kaW5nX2ZsYXQgZThlNFxudHJlbmRpbmdfdXAgZThlNVxudHVuZSBlNDI5XG50dXJuZWRfaW4gZThlNlxudHVybmVkX2luX25vdCBlOGU3XG50diBlMzMzXG51bmFyY2hpdmUgZTE2OVxudW5kbyBlMTY2XG51bmZvbGRfbGVzcyBlNWQ2XG51bmZvbGRfbW9yZSBlNWQ3XG51cGRhdGUgZTkyM1xudXNiIGUxZTBcbnZlcmlmaWVkX3VzZXIgZThlOFxudmVydGljYWxfYWxpZ25fYm90dG9tIGUyNThcbnZlcnRpY2FsX2FsaWduX2NlbnRlciBlMjU5XG52ZXJ0aWNhbF9hbGlnbl90b3AgZTI1YVxudmlicmF0aW9uIGU2MmRcbnZpZGVvX2NhbGwgZTA3MFxudmlkZW9fbGFiZWwgZTA3MVxudmlkZW9fbGlicmFyeSBlMDRhXG52aWRlb2NhbSBlMDRiXG52aWRlb2NhbV9vZmYgZTA0Y1xudmlkZW9nYW1lX2Fzc2V0IGUzMzhcbnZpZXdfYWdlbmRhIGU4ZTlcbnZpZXdfYXJyYXkgZThlYVxudmlld19jYXJvdXNlbCBlOGViXG52aWV3X2NvbHVtbiBlOGVjXG52aWV3X2NvbWZ5IGU0MmFcbnZpZXdfY29tcGFjdCBlNDJiXG52aWV3X2RheSBlOGVkXG52aWV3X2hlYWRsaW5lIGU4ZWVcbnZpZXdfbGlzdCBlOGVmXG52aWV3X21vZHVsZSBlOGYwXG52aWV3X3F1aWx0IGU4ZjFcbnZpZXdfc3RyZWFtIGU4ZjJcbnZpZXdfd2VlayBlOGYzXG52aWduZXR0ZSBlNDM1XG52aXNpYmlsaXR5IGU4ZjRcbnZpc2liaWxpdHlfb2ZmIGU4ZjVcbnZvaWNlX2NoYXQgZTYyZVxudm9pY2VtYWlsIGUwZDlcbnZvbHVtZV9kb3duIGUwNGRcbnZvbHVtZV9tdXRlIGUwNGVcbnZvbHVtZV9vZmYgZTA0Zlxudm9sdW1lX3VwIGUwNTBcbnZwbl9rZXkgZTBkYVxudnBuX2xvY2sgZTYyZlxud2FsbHBhcGVyIGUxYmNcbndhcm5pbmcgZTAwMlxud2F0Y2ggZTMzNFxud2F0Y2hfbGF0ZXIgZTkyNFxud2JfYXV0byBlNDJjXG53Yl9jbG91ZHkgZTQyZFxud2JfaW5jYW5kZXNjZW50IGU0MmVcbndiX2lyaWRlc2NlbnQgZTQzNlxud2Jfc3VubnkgZTQzMFxud2MgZTYzZFxud2ViIGUwNTFcbndlYl9hc3NldCBlMDY5XG53ZWVrZW5kIGUxNmJcbndoYXRzaG90IGU4MGVcbndpZGdldHMgZTFiZFxud2lmaSBlNjNlXG53aWZpX2xvY2sgZTFlMVxud2lmaV90ZXRoZXJpbmcgZTFlMlxud29yayBlOGY5XG53cmFwX3RleHQgZTI1YlxueW91dHViZV9zZWFyY2hlZF9mb3IgZThmYVxuem9vbV9pbiBlOGZmXG56b29tX291dCBlOTAwXG56b29tX291dF9tYXAgZTU2YlxuYDtcblxubGV0IGNvZGVwb2ludHMgPSBzLnRyaW0oKS5zcGxpdChcIlxcblwiKS5yZWR1Y2UoZnVuY3Rpb24oY3YsIG52KXtcbiAgICBsZXQgcGFydHMgPSBudi5zcGxpdCgvICsvKTtcbiAgICBsZXQgdWMgPSAnXFxcXHUnICsgcGFydHNbMV07XG4gICAgY3ZbcGFydHNbMF1dID0gZXZhbCgnXCInICsgdWMgKyAnXCInKTtcbiAgICByZXR1cm4gY3Y7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvZGVwb2ludHNcbn1cblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgVW5kb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxpbWl0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgY2xlYXIgKCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludGVyID0gLTE7XG4gICAgfVxuICAgIGdldCBjdXJyZW50U3RhdGUgKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyIDwgMClcbiAgICAgICAgICAgIHRocm93IFwiTm8gY3VycmVudCBzdGF0ZS5cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICBnZXQgaGFzU3RhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID49IDA7XG4gICAgfVxuICAgIGdldCBjYW5VbmRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+IDA7XG4gICAgfVxuICAgIGdldCBjYW5SZWRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU3RhdGUgJiYgdGhpcy5wb2ludGVyIDwgdGhpcy5oaXN0b3J5Lmxlbmd0aC0xO1xuICAgIH1cbiAgICBhZGQgKHMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFERFwiKTtcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdID0gcztcbiAgICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSh0aGlzLnBvaW50ZXIrMSk7XG4gICAgfVxuICAgIHVuZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVU5ET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5VbmRvKSB0aHJvdyBcIk5vIHVuZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgcmVkbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRURPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblJlZG8pIHRocm93IFwiTm8gcmVkby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVW5kb01hbmFnZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9