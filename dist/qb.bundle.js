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
            },
            stroke: "#e28b28"
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
      .text(editView.handleIcon.text || "") 
      .attr("stroke", editView.handleIcon.stroke || null)
      .attr("fill", editView.handleIcon.fill || null);
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
  //
  let title = vis.selectAll("#qtitle")
      .data([root.template.title]);
  title.enter()
      .append("svg:text")
      .attr("id","qtitle")
      .attr("x", -40)
      .attr("y", 15)
      ;
  title.html(t => {
      let parts = t.split(/(-->)/);
      return parts.map((p,i) => {
          if (p === "-->") 
              return `<tspan y=10 font-family="Material Icons">${__WEBPACK_IMPORTED_MODULE_3__material_icon_codepoints_js__["codepoints"]['forward']}</tspan>`
          else
              return `<tspan y=4>${p}</tspan>`
      }).join("");
  });

  //
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
  //
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZWNmMTk5MmJjM2Q5ZWQ5OTQyMTIiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL29wcy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDNkM7QUFVOUQ7QUFDa0I7QUFDbkI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUIscUJBQXFCLFVBQVUsZ0NBQWdDO0FB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SztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7O0FDcnJCRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVMLGtCQUFrQjs7Ozs7Ozs7QUM1TmxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUw7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDaDdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6InFiLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGVjZjE5OTJiYzNkOWVkOTk0MjEyIiwiXG4vKlxuICogRGF0YSBzdHJ1Y3R1cmVzOlxuICogICAwLiBUaGUgZGF0YSBtb2RlbCBmb3IgYSBtaW5lIGlzIGEgZ3JhcGggb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgXG4gKiAgIGNsYXNzZXMsIHRoZWlyIGNvbXBvbmVudHMgKGF0dHJpYnV0ZXMsIHJlZmVyZW5jZXMsIGNvbGxlY3Rpb25zKSwgYW5kIHJlbGF0aW9uc2hpcHMuXG4gKiAgIDEuIFRoZSBxdWVyeSBpcyByZXByZXNlbnRlZCBieSBhIGQzLXN0eWxlIGhpZXJhcmNoeSBzdHJ1Y3R1cmU6IGEgbGlzdCBvZlxuICogICBub2Rlcywgd2hlcmUgZWFjaCBub2RlIGhhcyBhIG5hbWUgKHN0cmluZyksIGFuZCBhIGNoaWxkcmVuIGxpc3QgKHBvc3NpYmx5IGVtcHR5IFxuICogICBsaXN0IG9mIG5vZGVzKS4gVGhlIG5vZGVzIGFuZCB0aGUgcGFyZW50L2NoaWxkIHJlbGF0aW9uc2hpcHMgb2YgdGhpcyBzdHJ1Y3R1cmUgXG4gKiAgIGFyZSB3aGF0IGRyaXZlIHRoZSBkaXNsYXkuXG4gKiAgIDIuIEVhY2ggbm9kZSBpbiB0aGUgZGlhZ3JhbSBjb3JyZXNwb25kcyB0byBhIGNvbXBvbmVudCBpbiBhIHBhdGgsIHdoZXJlIGVhY2hcbiAqICAgcGF0aCBzdGFydHMgd2l0aCB0aGUgcm9vdCBjbGFzcywgb3B0aW9uYWxseSBwcm9jZWVkcyB0aHJvdWdoIHJlZmVyZW5jZXMgYW5kIGNvbGxlY3Rpb25zLFxuICogICBhbmQgb3B0aW9uYWxseSBlbmRzIGF0IGFuIGF0dHJpYnV0ZS5cbiAqXG4gKi9cbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuLy9pbXBvcnQgeyBtaW5lcyB9IGZyb20gJy4vbWluZXMuanMnO1xuaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7XG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5XG59IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHtjb2RlcG9pbnRzfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5pbXBvcnQgVW5kb01hbmFnZXIgZnJvbSAnLi91bmRvTWFuYWdlci5qcyc7XG5cbmxldCBWRVJTSU9OID0gXCIwLjEuMFwiO1xuXG5sZXQgY3Vyck1pbmU7XG5sZXQgY3VyclRlbXBsYXRlO1xubGV0IGN1cnJOb2RlO1xuXG5sZXQgbmFtZTJtaW5lO1xubGV0IG07XG5sZXQgdztcbmxldCBoO1xubGV0IGk7XG5sZXQgcm9vdDtcbmxldCBkaWFnb25hbDtcbmxldCB2aXM7XG5sZXQgbm9kZXM7XG5sZXQgbGlua3M7XG5sZXQgZHJhZ0JlaGF2aW9yID0gbnVsbDtcbmxldCBhbmltYXRpb25EdXJhdGlvbiA9IDI1MDsgLy8gbXNcbmxldCBkZWZhdWx0Q29sb3JzID0geyBoZWFkZXI6IHsgbWFpbjogXCIjNTk1NDU1XCIsIHRleHQ6IFwiI2ZmZlwiIH0gfTtcbmxldCBkZWZhdWx0TG9nbyA9IFwiaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9pbnRlcm1pbmUvZGVzaWduLW1hdGVyaWFscy83OGExM2RiNS9sb2dvcy9pbnRlcm1pbmUvc3F1YXJlaXNoLzQ1eDQ1LnBuZ1wiO1xubGV0IHVuZG9NZ3IgPSBuZXcgVW5kb01hbmFnZXIoKTtcbmxldCByZWdpc3RyeVVybCA9IFwiaHR0cDovL3JlZ2lzdHJ5LmludGVybWluZS5vcmcvc2VydmljZS9pbnN0YW5jZXNcIjtcbmxldCByZWdpc3RyeUZpbGVVcmwgPSBcIi4vcmVzb3VyY2VzL3Rlc3RkYXRhL3JlZ2lzdHJ5Lmpzb25cIjtcblxubGV0IGVkaXRWaWV3cyA9IHtcbiAgICBxdWVyeU1haW46IHtcbiAgICAgICAgbmFtZTogXCJxdWVyeU1haW5cIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwidHJlZVwiLFxuICAgICAgICBub2RlQ29tcDogbnVsbCxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0cm9rZTogXCIjZTI4YjI4XCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29sdW1uT3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJjb2x1bW5PcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zZWxlY3RlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb2x1bW4gb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc2VsZWN0aW9uLWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyBhLnZpZXcgLSBiLnZpZXcgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZHJhZyBpbiBjb2x1bW5PcmRlciB2aWV3IGNoYW5nZXMgdGhlIGNvbHVtbiBvcmRlciAoZHVoISlcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4geyBuLnZpZXcgPSBpIH0pO1xuICAgICAgICAgIGRyYWdnZWQudGVtcGxhdGUuc2VsZWN0ID0gbm9kZXMubWFwKCBuPT4gbi5wYXRoICk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBudWxsLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBuLnZpZXcgOiBcIlwiXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNvcnRPcmRlcjoge1xuICAgICAgICBuYW1lOiBcInNvcnRPcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zb3J0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gc29ydCBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc29ydC1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuc29ydClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IGEuc29ydC5sZXZlbCAtIGIuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgLy8gZHJhZyBpbiBzb3J0T3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBzb3J0IG9yZGVyIChkdWghKVxuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4ge1xuICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgPSBpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5zb3J0ID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnN0cmFpbnRMb2dpYzoge1xuICAgICAgICBuYW1lOiBcImNvbnN0cmFpbnRMb2dpY1wiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbnN0cmFpbnQgbG9naWMgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBjb25zdHJhaW5lZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gY29kZSBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGxldCBhY29uc3QgPSBhLmNvbnN0cmFpbnRzICYmIGEuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYWNvZGUgPSBhY29uc3QgPyBhLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGxldCBiY29uc3QgPSBiLmNvbnN0cmFpbnRzICYmIGIuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYmNvZGUgPSBiY29uc3QgPyBiLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGlmIChhY29uc3QpXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAoYWNvZGUgPCBiY29kZSA/IC0xIDogYWNvZGUgPiBiY29kZSA/IDEgOiAwKSA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IDEgOiBuYW1lQ29tcChhLCBiKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29tcGFyYXRvciBmdW5jdGlvbiwgZm9yIHNvcnRpbmcgYSBsaXN0IG9mIG5vZGVzIGJ5IG5hbWUuIENhc2UtaW5zZW5zaXRpdmUuXG4vL1xubGV0IG5hbWVDb21wID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgbGV0IG5hID0gYS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IG5iID0gYi5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG5hIDwgbmIgPyAtMSA6IG5hID4gbmIgPyAxIDogMDtcbn07XG5cbi8vIFN0YXJ0aW5nIGVkaXQgdmlldyBpcyB0aGUgbWFpbiBxdWVyeSB2aWV3LlxubGV0IGVkaXRWaWV3ID0gZWRpdFZpZXdzLnF1ZXJ5TWFpbjtcblxuLy8gU2V0dXAgZnVuY3Rpb25cbmZ1bmN0aW9uIHNldHVwKCl7XG4gICAgbSA9IFsyMCwgMTIwLCAyMCwgMTIwXVxuICAgIHcgPSAxMjgwIC0gbVsxXSAtIG1bM11cbiAgICBoID0gODAwIC0gbVswXSAtIG1bMl1cbiAgICBpID0gMFxuXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoJyNmb290ZXIgW25hbWU9XCJ2ZXJzaW9uXCJdJylcbiAgICAgICAgLnRleHQoYFFCIHYke1ZFUlNJT059YCk7XG5cbiAgICAvLyB0aGFua3MgdG86IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MDA3ODc3L2hvdy10by11c2UtdGhlLWQzLWRpYWdvbmFsLWZ1bmN0aW9uLXRvLWRyYXctY3VydmVkLWxpbmVzXG4gICAgZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAuc291cmNlKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnNvdXJjZS55LCBcInlcIjpkLnNvdXJjZS54fTsgfSkgICAgIFxuICAgICAgICAudGFyZ2V0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnRhcmdldC55LCBcInlcIjpkLnRhcmdldC54fTsgfSlcbiAgICAgICAgLnByb2plY3Rpb24oZnVuY3Rpb24oZCkgeyByZXR1cm4gW2QueSwgZC54XTsgfSk7XG4gICAgXG4gICAgLy8gY3JlYXRlIHRoZSBTVkcgY29udGFpbmVyXG4gICAgdmlzID0gZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lciBzdmdcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3ICsgbVsxXSArIG1bM10pXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGggKyBtWzBdICsgbVsyXSlcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgaGlkZURpYWxvZylcbiAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1bM10gKyBcIixcIiArIG1bMF0gKyBcIilcIik7XG4gICAgLy9cbiAgICBkMy5zZWxlY3QoJy5idXR0b25bbmFtZT1cIm9wZW5jbG9zZVwiXScpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IFxuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIik7XG4gICAgICAgICAgICBsZXQgd2FzQ2xvc2VkID0gdC5jbGFzc2VkKFwiY2xvc2VkXCIpO1xuICAgICAgICAgICAgbGV0IGlzQ2xvc2VkID0gIXdhc0Nsb3NlZDtcbiAgICAgICAgICAgIGxldCBkID0gZDMuc2VsZWN0KCcjZHJhd2VyJylbMF1bMF1cbiAgICAgICAgICAgIGlmIChpc0Nsb3NlZClcbiAgICAgICAgICAgICAgICAvLyBzYXZlIHRoZSBjdXJyZW50IGhlaWdodCBqdXN0IGJlZm9yZSBjbG9zaW5nXG4gICAgICAgICAgICAgICAgZC5fX3NhdmVkX2hlaWdodCA9IGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgZWxzZSBpZiAoZC5fX3NhdmVkX2hlaWdodClcbiAgICAgICAgICAgICAgIC8vIG9uIG9wZW4sIHJlc3RvcmUgdGhlIHNhdmVkIGhlaWdodFxuICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjZHJhd2VyJykuc3R5bGUoXCJoZWlnaHRcIiwgZC5fX3NhdmVkX2hlaWdodCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0LmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICB9KTtcblxuICAgIGQzanNvblByb21pc2UocmVnaXN0cnlVcmwpXG4gICAgICAudGhlbihpbml0TWluZXMpXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzIHJlZ2lzdHJ5IGF0ICR7cmVnaXN0cnlVcmx9LiBUcnlpbmcgJHtyZWdpc3RyeUZpbGVVcmx9LmApO1xuICAgICAgICAgIGQzanNvblByb21pc2UocmVnaXN0cnlGaWxlVXJsKVxuICAgICAgICAgICAgICAudGhlbihpbml0TWluZXMpXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBhbGVydChcIkNhbm5vdCBhY2Nlc3MgcmVnaXN0cnkgZmlsZS4gVGhpcyBpcyBub3QgeW91ciBsdWNreSBkYXkuXCIpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIGQzLnNlbGVjdEFsbChcIiN0dGV4dCBsYWJlbCBzcGFuXCIpXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjdHRleHQnKS5hdHRyKCdjbGFzcycsICdmbGV4Y29sdW1uICcrdGhpcy5pbm5lclRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB1cGRhdGVUdGV4dCgpO1xuICAgICAgICB9KTtcbiAgICBkMy5zZWxlY3QoJyNydW5hdG1pbmUnKVxuICAgICAgICAub24oJ2NsaWNrJywgcnVuYXRtaW5lKTtcbiAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IC5idXR0b24uc3luYycpXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICBsZXQgdHVyblN5bmNPZmYgPSB0LnRleHQoKSA9PT0gXCJzeW5jXCI7XG4gICAgICAgICAgICB0LnRleHQoIHR1cm5TeW5jT2ZmID8gXCJzeW5jX2Rpc2FibGVkXCIgOiBcInN5bmNcIiApXG4gICAgICAgICAgICAgLmF0dHIoXCJ0aXRsZVwiLCAoKSA9PlxuICAgICAgICAgICAgICAgICBgQ291bnQgYXV0b3N5bmMgaXMgJHsgdHVyblN5bmNPZmYgPyBcIk9GRlwiIDogXCJPTlwiIH0uIENsaWNrIHRvIHR1cm4gaXQgJHsgdHVyblN5bmNPZmYgPyBcIk9OXCIgOiBcIk9GRlwiIH0uYCk7XG4gICAgICAgICAgICAhdHVyblN5bmNPZmYgJiYgdXBkYXRlQ291bnQoKTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJzeW5jb2ZmXCIsIHR1cm5TeW5jT2ZmKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpXG4gICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcInhtbHRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJqc29udGV4dGFyZWFcIil9KTtcbiAgICBkMy5zZWxlY3QoXCIjdW5kb0J1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCB1bmRvKTtcbiAgICBkMy5zZWxlY3QoXCIjcmVkb0J1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCByZWRvKTtcblxuICAvL1xuICBkcmFnQmVoYXZpb3IgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAub24oXCJkcmFnXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIG9uIGRyYWcsIGZvbGxvdyB0aGUgbW91c2UgaW4gdGhlIFkgZGltZW5zaW9uLlxuICAgICAgLy8gRHJhZyBjYWxsYmFjayBpcyBhdHRhY2hlZCB0byB0aGUgZHJhZyBoYW5kbGUuXG4gICAgICBsZXQgbm9kZUdycCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgIC8vIHVwZGF0ZSBub2RlJ3MgeS1jb29yZGluYXRlXG4gICAgICBub2RlR3JwLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKG4pID0+IHtcbiAgICAgICAgICBuLnkgPSBkMy5ldmVudC55O1xuICAgICAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7bi54fSwke24ueX0pYDtcbiAgICAgIH0pO1xuICAgICAgLy8gdXBkYXRlIHRoZSBub2RlJ3MgbGlua1xuICAgICAgbGV0IGxsID0gZDMuc2VsZWN0KGBwYXRoLmxpbmtbdGFyZ2V0PVwiJHtub2RlR3JwLmF0dHIoJ2lkJyl9XCJdYCk7XG4gICAgICBsbC5hdHRyKFwiZFwiLCBkaWFnb25hbCk7XG4gICAgICB9KVxuICAgIC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gb24gZHJhZ2VuZCwgcmVzb3J0IHRoZSBkcmFnZ2FibGUgbm9kZXMgYWNjb3JkaW5nIHRvIHRoZWlyIFkgcG9zaXRpb25cbiAgICAgIGxldCBub2RlcyA9IGQzLnNlbGVjdEFsbChlZGl0Vmlldy5kcmFnZ2FibGUpLmRhdGEoKVxuICAgICAgbm9kZXMuc29ydCggKGEsIGIpID0+IGEueSAtIGIueSApO1xuICAgICAgLy8gdGhlIG5vZGUgdGhhdCB3YXMgZHJhZ2dlZFxuICAgICAgbGV0IGRyYWdnZWQgPSBkMy5zZWxlY3QodGhpcykuZGF0YSgpWzBdO1xuICAgICAgLy8gY2FsbGJhY2sgZm9yIHNwZWNpZmljIGRyYWctZW5kIGJlaGF2aW9yXG4gICAgICBlZGl0Vmlldy5hZnRlckRyYWcgJiYgZWRpdFZpZXcuYWZ0ZXJEcmFnKG5vZGVzLCBkcmFnZ2VkKTtcbiAgICAgIC8vXG4gICAgICB1cGRhdGUoKTtcbiAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgLy9cbiAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXRNaW5lcyhqX21pbmVzKSB7XG4gICAgdmFyIG1pbmVzID0gal9taW5lcy5pbnN0YW5jZXM7XG4gICAgbmFtZTJtaW5lID0ge307XG4gICAgbWluZXMuZm9yRWFjaChmdW5jdGlvbihtKXsgbmFtZTJtaW5lW20ubmFtZV0gPSBtOyB9KTtcbiAgICBjdXJyTWluZSA9IG1pbmVzWzBdO1xuICAgIGN1cnJUZW1wbGF0ZSA9IG51bGw7XG5cbiAgICB2YXIgbWwgPSBkMy5zZWxlY3QoXCIjbWxpc3RcIikuc2VsZWN0QWxsKFwib3B0aW9uXCIpLmRhdGEobWluZXMpO1xuICAgIHZhciBzZWxlY3RNaW5lID0gXCJNb3VzZU1pbmVcIjtcbiAgICBtbC5lbnRlcigpLmFwcGVuZChcIm9wdGlvblwiKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgIHZhciB3ID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgdmFyIG0gPSBkLnVybC5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICB2YXIgdiA9ICh3ICYmICFtKSB8fCBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0pXG4gICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU9PT1zZWxlY3RNaW5lIHx8IG51bGw7IH0pXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KTtcbiAgICAvL1xuICAgIC8vIHdoZW4gYSBtaW5lIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3RcbiAgICBkMy5zZWxlY3QoXCIjbWxpc3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNlbGVjdGVkTWluZSh0aGlzLnZhbHVlKTsgfSk7XG4gICAgLy9cbiAgICB2YXIgZGcgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpO1xuICAgIGRnLmNsYXNzZWQoXCJoaWRkZW5cIix0cnVlKVxuICAgIGRnLnNlbGVjdChcIi5idXR0b24uY2xvc2VcIikub24oXCJjbGlja1wiLCBoaWRlRGlhbG9nKTtcbiAgICBkZy5zZWxlY3QoXCIuYnV0dG9uLnJlbW92ZVwiKS5vbihcImNsaWNrXCIsICgpID0+IHJlbW92ZU5vZGUoY3Vyck5vZGUpKTtcblxuICAgIC8vIFxuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2VkaXRWaWV3IHNlbGVjdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkgeyBzZXRFZGl0Vmlldyh0aGlzLnZhbHVlKTsgfSlcbiAgICAgICAgO1xuXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoXCIjZGlhbG9nIC5zdWJjbGFzc0NvbnN0cmFpbnQgc2VsZWN0XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZXRTdWJjbGFzc0NvbnN0cmFpbnQoY3Vyck5vZGUsIHRoaXMudmFsdWUpOyB9KTtcbiAgICAvLyBXaXJlIHVwIHNlbGVjdCBidXR0b24gaW4gZGlhbG9nXG4gICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3Vyck5vZGUuaXNTZWxlY3RlZCA/IGN1cnJOb2RlLnVuc2VsZWN0KCkgOiBjdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgdXBkYXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICAvLyBXaXJlIHVwIHNvcnQgZnVuY3Rpb24gaW4gZGlhbG9nXG4gICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBjYyA9IGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXScpO1xuICAgICAgICAgICAgbGV0IGN1cnJTb3J0ID0gY2MuY2xhc3NlZFxuICAgICAgICAgICAgbGV0IG9sZHNvcnQgPSBjYy5jbGFzc2VkKFwic29ydGFzY1wiKSA/IFwiYXNjXCIgOiBjYy5jbGFzc2VkKFwic29ydGRlc2NcIikgPyBcImRlc2NcIiA6IFwibm9uZVwiO1xuICAgICAgICAgICAgbGV0IG5ld3NvcnQgPSBvbGRzb3J0ID09PSBcImFzY1wiID8gXCJkZXNjXCIgOiBvbGRzb3J0ID09PSBcImRlc2NcIiA/IFwibm9uZVwiIDogXCJhc2NcIjtcbiAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG5ld3NvcnQgPT09IFwiYXNjXCIpO1xuICAgICAgICAgICAgY2MuY2xhc3NlZChcInNvcnRkZXNjXCIsIG5ld3NvcnQgPT09IFwiZGVzY1wiKTtcbiAgICAgICAgICAgIGN1cnJOb2RlLnNldFNvcnQobmV3c29ydCk7XG4gICAgICAgICAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgZmlyc3QgbWluZSBieSBkZWZhdWx0LlxuICAgIHNlbGVjdGVkTWluZShzZWxlY3RNaW5lKTtcbn1cbi8vXG5mdW5jdGlvbiBjbGVhclN0YXRlKCkge1xuICAgIHVuZG9NZ3IuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHNhdmVTdGF0ZSgpIHtcbiAgICBsZXQgcyA9IEpTT04uc3RyaW5naWZ5KHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSkpO1xuICAgIHVuZG9NZ3IuYWRkKHMpO1xufVxuZnVuY3Rpb24gdW5kbygpIHsgdW5kb3JlZG8oXCJ1bmRvXCIpIH1cbmZ1bmN0aW9uIHJlZG8oKSB7IHVuZG9yZWRvKFwicmVkb1wiKSB9XG5mdW5jdGlvbiB1bmRvcmVkbyh3aGljaCl7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHMgPSBKU09OLnBhcnNlKHVuZG9NZ3Jbd2hpY2hdKCkpO1xuICAgICAgICBlZGl0VGVtcGxhdGUocywgdHJ1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbi8vIENhbGxlZCB3aGVuIHVzZXIgc2VsZWN0cyBhIG1pbmUgZnJvbSB0aGUgb3B0aW9uIGxpc3Rcbi8vIExvYWRzIHRoYXQgbWluZSdzIGRhdGEgbW9kZWwgYW5kIGFsbCBpdHMgdGVtcGxhdGVzLlxuLy8gVGhlbiBpbml0aWFsaXplcyBkaXNwbGF5IHRvIHNob3cgdGhlIGZpcnN0IHRlcm1wbGF0ZSdzIHF1ZXJ5LlxuZnVuY3Rpb24gc2VsZWN0ZWRNaW5lKG1uYW1lKXtcbiAgICBjdXJyTWluZSA9IG5hbWUybWluZVttbmFtZV1cbiAgICBpZighY3Vyck1pbmUpIHJldHVybjtcbiAgICBsZXQgdXJsID0gY3Vyck1pbmUudXJsO1xuICAgIGxldCB0dXJsLCBtdXJsLCBsdXJsLCBidXJsLCBzdXJsLCBvdXJsO1xuICAgIGN1cnJNaW5lLnRuYW1lcyA9IFtdXG4gICAgY3Vyck1pbmUudGVtcGxhdGVzID0gW11cbiAgICBpZiAobW5hbWUgPT09IFwidGVzdFwiKSB7IFxuICAgICAgICB0dXJsID0gdXJsICsgXCIvdGVtcGxhdGVzLmpzb25cIjtcbiAgICAgICAgbXVybCA9IHVybCArIFwiL21vZGVsLmpzb25cIjtcbiAgICAgICAgbHVybCA9IHVybCArIFwiL2xpc3RzLmpzb25cIjtcbiAgICAgICAgYnVybCA9IHVybCArIFwiL2JyYW5kaW5nLmpzb25cIjtcbiAgICAgICAgc3VybCA9IHVybCArIFwiL3N1bW1hcnlmaWVsZHMuanNvblwiO1xuICAgICAgICBvdXJsID0gdXJsICsgXCIvb3JnYW5pc21saXN0Lmpzb25cIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHR1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3RlbXBsYXRlcz9mb3JtYXQ9anNvblwiO1xuICAgICAgICBtdXJsID0gdXJsICsgXCIvc2VydmljZS9tb2RlbD9mb3JtYXQ9anNvblwiO1xuICAgICAgICBsdXJsID0gdXJsICsgXCIvc2VydmljZS9saXN0cz9mb3JtYXQ9anNvblwiO1xuICAgICAgICBidXJsID0gdXJsICsgXCIvc2VydmljZS9icmFuZGluZ1wiO1xuICAgICAgICBzdXJsID0gdXJsICsgXCIvc2VydmljZS9zdW1tYXJ5ZmllbGRzXCI7XG4gICAgICAgIG91cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JTNDcXVlcnkrbmFtZSUzRCUyMiUyMittb2RlbCUzRCUyMmdlbm9taWMlMjIrdmlldyUzRCUyMk9yZ2FuaXNtLnNob3J0TmFtZSUyMitsb25nRGVzY3JpcHRpb24lM0QlMjIlMjIlM0UlM0MlMkZxdWVyeSUzRSZmb3JtYXQ9anNvbm9iamVjdHNcIjtcbiAgICB9XG4gICAgLy8gZ2V0IHRoZSBtb2RlbFxuICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyByZXNvdXJjZXMgZnJvbSBcIiArIHVybCApO1xuICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZDNqc29uUHJvbWlzZShtdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZSh0dXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShsdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShidXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShzdXJsKSxcbiAgICAgICAgZDNqc29uUHJvbWlzZShvdXJsKVxuICAgIF0pLnRoZW4oIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGpfbW9kZWwgPSBkYXRhWzBdO1xuICAgICAgICB2YXIgal90ZW1wbGF0ZXMgPSBkYXRhWzFdO1xuICAgICAgICB2YXIgal9saXN0cyA9IGRhdGFbMl07XG4gICAgICAgIHZhciBqX2JyYW5kaW5nID0gZGF0YVszXTtcbiAgICAgICAgdmFyIGpfc3VtbWFyeSA9IGRhdGFbNF07XG4gICAgICAgIHZhciBqX29yZ2FuaXNtcyA9IGRhdGFbNV07XG4gICAgICAgIC8vXG4gICAgICAgIGN1cnJNaW5lLm1vZGVsID0gY29tcGlsZU1vZGVsKGpfbW9kZWwubW9kZWwpXG4gICAgICAgIGN1cnJNaW5lLnRlbXBsYXRlcyA9IGpfdGVtcGxhdGVzLnRlbXBsYXRlcztcbiAgICAgICAgY3Vyck1pbmUubGlzdHMgPSBqX2xpc3RzLmxpc3RzO1xuICAgICAgICBjdXJyTWluZS5zdW1tYXJ5RmllbGRzID0gal9zdW1tYXJ5LmNsYXNzZXM7XG4gICAgICAgIGN1cnJNaW5lLm9yZ2FuaXNtTGlzdCA9IGpfb3JnYW5pc21zLnJlc3VsdHMubWFwKG8gPT4gby5zaG9ydE5hbWUpO1xuICAgICAgICAvL1xuICAgICAgICBjdXJyTWluZS50bGlzdCA9IG9iajJhcnJheShjdXJyTWluZS50ZW1wbGF0ZXMpXG4gICAgICAgIGN1cnJNaW5lLnRsaXN0LnNvcnQoZnVuY3Rpb24oYSxiKXsgXG4gICAgICAgICAgICByZXR1cm4gYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyTWluZS50bmFtZXMgPSBPYmplY3Qua2V5cyggY3Vyck1pbmUudGVtcGxhdGVzICk7XG4gICAgICAgIGN1cnJNaW5lLnRuYW1lcy5zb3J0KCk7XG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIHNlbGVjdGlvbiBsaXN0IG9mIHRlbXBsYXRlcyBmb3IgdGhpcyBtaW5lLlxuICAgICAgICB2YXIgdGwgPSBkMy5zZWxlY3QoXCIjdGxpc3Qgc2VsZWN0XCIpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKCdvcHRpb24nKVxuICAgICAgICAgICAgLmRhdGEoIGN1cnJNaW5lLnRsaXN0ICk7XG4gICAgICAgIHRsLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKVxuICAgICAgICB0bC5leGl0KCkucmVtb3ZlKClcbiAgICAgICAgdGwuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpe3JldHVybiBkLnRpdGxlO30pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBzdGFydEVkaXQpO1xuICAgICAgICBlZGl0VGVtcGxhdGUoY3Vyck1pbmUudGVtcGxhdGVzW2N1cnJNaW5lLnRsaXN0WzBdLm5hbWVdKTtcbiAgICAgICAgLy8gQXBwbHkgYnJhbmRpbmdcbiAgICAgICAgbGV0IGNscnMgPSBjdXJyTWluZS5jb2xvcnMgfHwgZGVmYXVsdENvbG9ycztcbiAgICAgICAgbGV0IGJnYyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIubWFpbiA6IGNscnMubWFpbi5mZztcbiAgICAgICAgbGV0IHR4YyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIudGV4dCA6IGNscnMubWFpbi5iZztcbiAgICAgICAgbGV0IGxvZ28gPSBjdXJyTWluZS5pbWFnZXMubG9nbyB8fCBkZWZhdWx0TG9nbztcbiAgICAgICAgZDMuc2VsZWN0KFwiI3Rvb2x0cmF5XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjbWluZUxvZ29cIilcbiAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGxvZ28pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJyNzdmdDb250YWluZXIgW25hbWU9XCJtaW5lbmFtZVwiXScpXG4gICAgICAgICAgICAudGV4dChjdXJyTWluZS5uYW1lKTtcbiAgICAgICAgLy8gcG9wdWxhdGUgY2xhc3MgbGlzdCBcbiAgICAgICAgbGV0IGNsaXN0ID0gT2JqZWN0LmtleXMoY3Vyck1pbmUubW9kZWwuY2xhc3Nlcyk7XG4gICAgICAgIGNsaXN0LnNvcnQoKTtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXCIjbmV3cWNsaXN0IHNlbGVjdFwiLCBjbGlzdCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI2VkaXRTb3VyY2VTZWxlY3RvciBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDE7IH0pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZWN0ZWRFZGl0U291cmNlKHRoaXMudmFsdWUpOyBzdGFydEVkaXQoKTsgfSk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVswXVswXS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICBzZWxlY3RlZEVkaXRTb3VyY2UoIFwidGxpc3RcIiApO1xuXG4gICAgfSwgZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyAke2N1cnJNaW5lLm5hbWV9LiBTdGF0dXM9JHtlcnJvci5zdGF0dXN9LiBFcnJvcj0ke2Vycm9yLnN0YXR1c1RleHR9LiAoSWYgdGhlcmUgaXMgbm8gZXJyb3IgbWVzc2FnZSwgdGhlbiBpdHMgcHJvYmFibHkgYSBDT1JTIGlzc3VlLilgKTtcbiAgICB9KTtcbn1cblxuLy8gQmVnaW5zIGFuIGVkaXQsIGJhc2VkIG9uIHVzZXIgY29udHJvbHMuXG5mdW5jdGlvbiBzdGFydEVkaXQoKSB7XG4gICAgLy8gc2VsZWN0b3IgZm9yIGNob29zaW5nIGVkaXQgaW5wdXQgc291cmNlLCBhbmQgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgbGV0IHNyY1NlbGVjdG9yID0gZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpO1xuICAgIC8vIHRoZSBjaG9zZW4gZWRpdCBzb3VyY2VcbiAgICBsZXQgaW5wdXRJZCA9IHNyY1NlbGVjdG9yWzBdWzBdLnZhbHVlO1xuICAgIC8vIHRoZSBxdWVyeSBpbnB1dCBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNlbGVjdGVkIHNvdXJjZVxuICAgIGxldCBzcmMgPSBkMy5zZWxlY3QoYCMke2lucHV0SWR9IFtuYW1lPVwiaW5cIl1gKTtcbiAgICAvLyB0aGUgcXVlcnkgc3RhcnRpbmcgcG9pbnRcbiAgICBsZXQgdmFsID0gc3JjWzBdWzBdLnZhbHVlXG4gICAgaWYgKGlucHV0SWQgPT09IFwidGxpc3RcIikge1xuICAgICAgICAvLyBhIHNhdmVkIHF1ZXJ5IG9yIHRlbXBsYXRlXG4gICAgICAgIGVkaXRUZW1wbGF0ZShjdXJyTWluZS50ZW1wbGF0ZXNbdmFsXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwibmV3cWNsaXN0XCIpIHtcbiAgICAgICAgLy8gYSBuZXcgcXVlcnkgZnJvbSBhIHNlbGVjdGVkIHN0YXJ0aW5nIGNsYXNzXG4gICAgICAgIGxldCBudCA9IG5ldyBUZW1wbGF0ZSgpO1xuICAgICAgICBudC5zZWxlY3QucHVzaCh2YWwrXCIuaWRcIik7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShudCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0eG1sXCIpIHtcbiAgICAgICAgLy8gaW1wb3J0IHhtbCBxdWVyeVxuICAgICAgICB2YWwgJiYgZWRpdFRlbXBsYXRlKHBhcnNlUGF0aFF1ZXJ5KHZhbCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydGpzb25cIikge1xuICAgICAgICAvLyBpbXBvcnQganNvbiBxdWVyeVxuICAgICAgICB2YWwgJiYgZWRpdFRlbXBsYXRlKEpTT04ucGFyc2UodmFsKSk7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgdGhyb3cgXCJVbmtub3duIGVkaXQgc291cmNlLlwiXG59XG5cbi8vIFxuZnVuY3Rpb24gc2VsZWN0ZWRFZGl0U291cmNlKHNob3cpe1xuICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdID4gZGl2Lm9wdGlvbicpXG4gICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuaWQgPT09IHNob3cgPyBudWxsIDogXCJub25lXCI7IH0pO1xufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gdGhlIGdpdmVuIG9iamVjdC5cbi8vIFRoZSBsaXN0IGlzIHNvcnRlZCBieSB0aGUgaXRlbSBrZXlzLlxuLy8gSWYgbmFtZUF0dHIgaXMgc3BlY2lmaWVkLCB0aGUgaXRlbSBrZXkgaXMgYWxzbyBhZGRlZCB0byBlYWNoIGVsZW1lbnRcbi8vIGFzIGFuIGF0dHJpYnV0ZSAob25seSB3b3JrcyBpZiB0aG9zZSBpdGVtcyBhcmUgdGhlbXNlbHZlcyBvYmplY3RzKS5cbi8vIEV4YW1wbGVzOlxuLy8gICAgc3RhdGVzID0geydNRSc6e25hbWU6J01haW5lJ30sICdJQSc6e25hbWU6J0lvd2EnfX1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJ30sIHtuYW1lOidNYWluZSd9XVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcywgJ2FiYnJldicpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJyxhYmJyZXYnSUEnfSwge25hbWU6J01haW5lJyxhYmJyZXYnTUUnfV1cbi8vIEFyZ3M6XG4vLyAgICBvICAob2JqZWN0KSBUaGUgb2JqZWN0LlxuLy8gICAgbmFtZUF0dHIgKHN0cmluZykgSWYgc3BlY2lmaWVkLCBhZGRzIHRoZSBpdGVtIGtleSBhcyBhbiBhdHRyaWJ1dGUgdG8gZWFjaCBsaXN0IGVsZW1lbnQuXG4vLyBSZXR1cm46XG4vLyAgICBsaXN0IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gb1xuZnVuY3Rpb24gb2JqMmFycmF5KG8sIG5hbWVBdHRyKXtcbiAgICB2YXIga3MgPSBPYmplY3Qua2V5cyhvKTtcbiAgICBrcy5zb3J0KCk7XG4gICAgcmV0dXJuIGtzLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICBpZiAobmFtZUF0dHIpIG9ba10ubmFtZSA9IGs7XG4gICAgICAgIHJldHVybiBvW2tdO1xuICAgIH0pO1xufTtcblxuLy8gQWRkIGRpcmVjdCBjcm9zcyByZWZlcmVuY2VzIHRvIG5hbWVkIHR5cGVzLiAoRS5nLiwgd2hlcmUgdGhlXG4vLyBtb2RlbCBzYXlzIHRoYXQgR2VuZS5hbGxlbGVzIGlzIGEgY29sbGVjdGlvbiB3aG9zZSByZWZlcmVuY2VkVHlwZVxuLy8gaXMgdGhlIHN0cmluZyBcIkFsbGVsZVwiLCBhZGQgYSBkaXJlY3QgcmVmZXJlbmNlIHRvIHRoZSBBbGxlbGUgY2xhc3MpXG4vLyBBbHNvIGFkZHMgYXJyYXlzIGZvciBjb252ZW5pZW5jZSBmb3IgYWNjZXNzaW5nIGFsbCBjbGFzc2VzIG9yIGFsbCBhdHRyaWJ1dGVzIG9mIGEgY2xhc3MuXG4vL1xuZnVuY3Rpb24gY29tcGlsZU1vZGVsKG1vZGVsKXtcbiAgICAvLyBGaXJzdCBhZGQgY2xhc3NlcyB0aGF0IHJlcHJlc2VudCB0aGUgYmFzaWMgdHlwZVxuICAgIExFQUZUWVBFUy5mb3JFYWNoKGZ1bmN0aW9uKG4pe1xuICAgICAgICBtb2RlbC5jbGFzc2VzW25dID0ge1xuICAgICAgICAgICAgaXNMZWFmVHlwZTogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IG4sXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogbixcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgICAgICAgcmVmZXJlbmNlczogW10sXG4gICAgICAgICAgICBjb2xsZWN0aW9uczogW10sXG4gICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy9cbiAgICBtb2RlbC5hbGxDbGFzc2VzID0gb2JqMmFycmF5KG1vZGVsLmNsYXNzZXMpXG4gICAgdmFyIGNucyA9IE9iamVjdC5rZXlzKG1vZGVsLmNsYXNzZXMpO1xuICAgIGNucy5zb3J0KClcbiAgICBjbnMuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgIHZhciBjbHMgPSBtb2RlbC5jbGFzc2VzW2NuXTtcbiAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMgPSBvYmoyYXJyYXkoY2xzLmF0dHJpYnV0ZXMpXG4gICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMgPSBvYmoyYXJyYXkoY2xzLmNvbGxlY3Rpb25zKVxuICAgICAgICBjbHMuYWxsQXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImF0dHJpYnV0ZVwiOyB9KTtcbiAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImNvbGxlY3Rpb25cIjsgfSk7XG4gICAgICAgIGNscy5hbGxQYXJ0cyA9IGNscy5hbGxBdHRyaWJ1dGVzLmNvbmNhdChjbHMuYWxsUmVmZXJlbmNlcykuY29uY2F0KGNscy5hbGxDb2xsZWN0aW9ucyk7XG4gICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgbW9kZWwuYWxsQ2xhc3Nlcy5wdXNoKGNscyk7XG4gICAgICAgIC8vXG4gICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIHZhciBiYyA9IG1vZGVsLmNsYXNzZXNbZV07XG4gICAgICAgICAgICBpZiAoYmMuZXh0ZW5kZWRCeSkge1xuICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkucHVzaChjbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeSA9IFtjbHNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJjO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgT2JqZWN0LmtleXMoY2xzLnJlZmVyZW5jZXMpLmZvckVhY2goZnVuY3Rpb24ocm4pe1xuICAgICAgICAgICAgdmFyIHIgPSBjbHMucmVmZXJlbmNlc1tybl07XG4gICAgICAgICAgICByLnR5cGUgPSBtb2RlbC5jbGFzc2VzW3IucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICBPYmplY3Qua2V5cyhjbHMuY29sbGVjdGlvbnMpLmZvckVhY2goZnVuY3Rpb24oY24pe1xuICAgICAgICAgICAgdmFyIGMgPSBjbHMuY29sbGVjdGlvbnNbY25dO1xuICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbW9kZWw7XG59XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3VwZXJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChcbi8vIFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdXBlcmNsYXNzZXMoY2xzKXtcbiAgICBpZiAodHlwZW9mKGNscykgPT09IFwic3RyaW5nXCIgfHwgIWNsc1tcImV4dGVuZHNcIl0gfHwgY2xzW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBhbmMgPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdXBlcmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzW1wiZXh0ZW5kc1wiXS5jb25jYXQoYW5jLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgdmFyIGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3ViY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1YmNsYXNzZXMoY2xzKXtcbiAgICBpZiAodHlwZW9mKGNscykgPT09IFwic3RyaW5nXCIgfHwgIWNscy5leHRlbmRlZEJ5IHx8IGNscy5leHRlbmRlZEJ5Lmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgdmFyIGRlc2MgPSBjbHMuZXh0ZW5kZWRCeS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3ViY2xhc3NlcyhzYyk7IH0pO1xuICAgIHZhciBhbGwgPSBjbHMuZXh0ZW5kZWRCeS5jb25jYXQoZGVzYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWZmIHN1YiBpcyBhIHN1YmNsYXNzIG9mIHN1cC5cbmZ1bmN0aW9uIGlzU3ViY2xhc3Moc3ViLHN1cCkge1xuICAgIGlmIChzdWIgPT09IHN1cCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHR5cGVvZihzdWIpID09PSBcInN0cmluZ1wiIHx8ICFzdWJbXCJleHRlbmRzXCJdIHx8IHN1YltcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgciA9IHN1YltcImV4dGVuZHNcIl0uZmlsdGVyKGZ1bmN0aW9uKHgpeyByZXR1cm4geD09PXN1cCB8fCBpc1N1YmNsYXNzKHgsIHN1cCk7IH0pO1xuICAgIHJldHVybiByLmxlbmd0aCA+IDA7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIGxpc3QgaXMgdmFsaWQgYXMgYSBsaXN0IGNvbnN0cmFpbnQgb3B0aW9uIGZvclxuLy8gdGhlIG5vZGUgbi4gQSBsaXN0IGlzIHZhbGlkIHRvIHVzZSBpbiBhIGxpc3QgY29uc3RyYWludCBhdCBub2RlIG4gaWZmXG4vLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgZXF1YWwgdG8gb3IgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGVcbi8vICAgICAqIHRoZSBsaXN0J3MgdHlwZSBpcyBhIHN1cGVyY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlLiBJbiB0aGlzIGNhc2UsXG4vLyAgICAgICBlbGVtZW50cyBpbiB0aGUgbGlzdCB0aGF0IGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBub2RlJ3MgdHlwZVxuLy8gICAgICAgYXJlIGF1dG9tYXRpY2FsbHkgZmlsdGVyZWQgb3V0LlxuZnVuY3Rpb24gaXNWYWxpZExpc3RDb25zdHJhaW50KGxpc3QsIG4pe1xuICAgIHZhciBudCA9IG4uc3VidHlwZUNvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICBpZiAodHlwZW9mKG50KSA9PT0gXCJzdHJpbmdcIiApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgbHQgPSBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW2xpc3QudHlwZV07XG4gICAgcmV0dXJuIGlzU3ViY2xhc3MobHQsIG50KSB8fCBpc1N1YmNsYXNzKG50LCBsdCk7XG59XG5cbi8vIENvbXBpbGVzIGEgXCJyYXdcIiB0ZW1wbGF0ZSAtIHN1Y2ggYXMgb25lIHJldHVybmVkIGJ5IHRoZSAvdGVtcGxhdGVzIHdlYiBzZXJ2aWNlIC0gYWdhaW5zdFxuLy8gYSBtb2RlbC4gVGhlIG1vZGVsIHNob3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBjb21waWxlZC5cbi8vIEFyZ3M6XG4vLyAgIHRlbXBsYXRlIC0gYSB0ZW1wbGF0ZSBxdWVyeSBhcyBhIGpzb24gb2JqZWN0XG4vLyAgIG1vZGVsIC0gdGhlIG1pbmUncyBtb2RlbCwgYWxyZWFkeSBjb21waWxlZCAoc2VlIGNvbXBpbGVNb2RlbCkuXG4vLyBSZXR1cm5zOlxuLy8gICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIENyZWF0ZXMgYSB0cmVlIG9mIHF1ZXJ5IG5vZGVzIChzdWl0YWJsZSBmb3IgZHJhd2luZyBieSBkMywgQlRXKS5cbi8vICAgQWRkcyB0aGlzIHRyZWUgdG8gdGhlIHRlbXBsYXRlIG9iamVjdCBhcyBhdHRyaWJ1dGUgJ3F0cmVlJy5cbi8vICAgVHVybnMgZWFjaCAoc3RyaW5nKSBwYXRoIGludG8gYSByZWZlcmVuY2UgdG8gYSB0cmVlIG5vZGUgY29ycmVzcG9uZGluZyB0byB0aGF0IHBhdGguXG5mdW5jdGlvbiBjb21waWxlVGVtcGxhdGUodGVtcGxhdGUsIG1vZGVsKSB7XG4gICAgdmFyIHJvb3RzID0gW11cbiAgICB2YXIgdCA9IHRlbXBsYXRlO1xuICAgIC8vIHRoZSB0cmVlIG9mIG5vZGVzIHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcXVlcnkgd2lsbCBnbyBoZXJlXG4gICAgdC5xdHJlZSA9IG51bGw7XG4gICAgLy8gaW5kZXggb2YgY29kZSB0byBjb25zdHJhaW50IGdvcnMgaGVyZS5cbiAgICB0LmNvZGUyYyA9IHt9XG4gICAgLy8gbm9ybWFsaXplIHRoaW5ncyB0aGF0IG1heSBiZSB1bmRlZmluZWRcbiAgICB0LmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICB0LmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgIC8vXG4gICAgdmFyIHN1YmNsYXNzQ3MgPSBbXTtcbiAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgaWYgKGMudHlwZSkge1xuICAgICAgICAgICAgYy5vcCA9IFwiSVNBXCJcbiAgICAgICAgICAgIHN1YmNsYXNzQ3MucHVzaChjKTtcbiAgICAgICAgfVxuICAgICAgICBjLmN0eXBlID0gT1BJTkRFWFtjLm9wXS5jdHlwZTtcbiAgICAgICAgaWYgKGMuY29kZSkgdC5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcIm51bGxcIil7XG4gICAgICAgICAgICAvLyBXaXRoIG51bGwvbm90LW51bGwgY29uc3RyYWludHMsIElNIGhhcyBhIHdlaXJkIHF1aXJrIG9mIGZpbGxpbmcgdGhlIHZhbHVlIFxuICAgICAgICAgICAgLy8gZmllbGQgd2l0aCB0aGUgb3BlcmF0b3IuIEUuZy4sIGZvciBhbiBcIklTIE5PVCBOVUxMXCIgb3ByZWF0b3IsIHRoZSB2YWx1ZSBmaWVsZCBpc1xuICAgICAgICAgICAgLy8gYWxzbyBcIklTIE5PVCBOVUxMXCIuIFxuICAgICAgICAgICAgLy8gXG4gICAgICAgICAgICBjLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBkZWFsIHdpdGggZXh0cmFWYWx1ZSBoZXJlICg/KVxuICAgICAgICB9XG4gICAgfSlcbiAgICAvLyBtdXN0IHByb2Nlc3MgYW55IHN1YmNsYXNzIGNvbnN0cmFpbnRzIGZpcnN0LCBmcm9tIHNob3J0ZXN0IHRvIGxvbmdlc3QgcGF0aFxuICAgIHN1YmNsYXNzQ3NcbiAgICAgICAgLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnBhdGgubGVuZ3RoIC0gYi5wYXRoLmxlbmd0aDtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGMucGF0aCwgbW9kZWwpO1xuICAgICAgICAgICAgIHZhciBjbHMgPSBtb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgICAgIH0pO1xuICAgIC8vXG4gICAgdC53aGVyZSAmJiB0LndoZXJlLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBjLnBhdGgsIG1vZGVsKTtcbiAgICAgICAgaWYgKG4uY29uc3RyYWludHMpXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbi5jb25zdHJhaW50cyA9IFtjXTtcbiAgICB9KVxuXG4gICAgLy9cbiAgICB0LnNlbGVjdCAmJiB0LnNlbGVjdC5mb3JFYWNoKGZ1bmN0aW9uKHAsaSl7XG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBwLCBtb2RlbCk7XG4gICAgICAgIG4uc2VsZWN0KCk7XG4gICAgfSlcbiAgICB0LmpvaW5zICYmIHQuam9pbnMuZm9yRWFjaChmdW5jdGlvbihqKXtcbiAgICAgICAgdmFyIG4gPSBhZGRQYXRoKHQsIGosIG1vZGVsKTtcbiAgICAgICAgbi5qb2luID0gXCJvdXRlclwiO1xuICAgIH0pXG4gICAgdC5vcmRlckJ5ICYmIHQub3JkZXJCeS5mb3JFYWNoKGZ1bmN0aW9uKG8sIGkpe1xuICAgICAgICB2YXIgcCA9IE9iamVjdC5rZXlzKG8pWzBdXG4gICAgICAgIHZhciBkaXIgPSBvW3BdXG4gICAgICAgIHZhciBuID0gYWRkUGF0aCh0LCBwLCBtb2RlbCk7XG4gICAgICAgIG4uc29ydCA9IHsgZGlyOiBkaXIsIGxldmVsOiBpIH07XG4gICAgfSk7XG4gICAgaWYgKCF0LnF0cmVlKSB7XG4gICAgICAgIHRocm93IFwiTm8gcGF0aHMgaW4gcXVlcnkuXCJcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59XG5cbi8vIFR1cm5zIGEgcXRyZWUgc3RydWN0dXJlIGJhY2sgaW50byBhIFwicmF3XCIgdGVtcGxhdGUuIFxuLy9cbmZ1bmN0aW9uIHVuY29tcGlsZVRlbXBsYXRlKHRtcGx0KXtcbiAgICB2YXIgdCA9IHtcbiAgICAgICAgbmFtZTogdG1wbHQubmFtZSxcbiAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICBkZXNjcmlwdGlvbjogdG1wbHQuZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbW1lbnQ6IHRtcGx0LmNvbW1lbnQsXG4gICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgIG1vZGVsOiBkZWVwYyh0bXBsdC5tb2RlbCksXG4gICAgICAgIHRhZ3M6IGRlZXBjKHRtcGx0LnRhZ3MpLFxuICAgICAgICBzZWxlY3QgOiB0bXBsdC5zZWxlY3QuY29uY2F0KCksXG4gICAgICAgIHdoZXJlIDogW10sXG4gICAgICAgIGpvaW5zIDogW10sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYzogdG1wbHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCIsXG4gICAgICAgIG9yZGVyQnkgOiBbXVxuICAgIH1cbiAgICBmdW5jdGlvbiByZWFjaChuKXtcbiAgICAgICAgdmFyIHAgPSBuLnBhdGhcbiAgICAgICAgaWYgKG4uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gcGF0aCBzaG91bGQgYWxyZWFkeSBiZSB0aGVyZVxuICAgICAgICAgICAgaWYgKHQuc2VsZWN0LmluZGV4T2Yobi5wYXRoKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJBbm9tYWx5IGRldGVjdGVkIGluIHNlbGVjdCBsaXN0LlwiO1xuICAgICAgICB9XG4gICAgICAgIChuLmNvbnN0cmFpbnRzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgIGNjLm5vZGUgPSBudWxsO1xuICAgICAgICAgICAgIHQud2hlcmUucHVzaChjYylcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKG4uam9pbiA9PT0gXCJvdXRlclwiKSB7XG4gICAgICAgICAgICB0LmpvaW5zLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgbGV0IHMgPSB7fVxuICAgICAgICAgICAgc1twXSA9IG4uc29ydC5kaXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIHQub3JkZXJCeVtuLnNvcnQubGV2ZWxdID0gcztcbiAgICAgICAgfVxuICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVhY2gpO1xuICAgIH1cblxuICAgIHJlYWNoKHRtcGx0LnF0cmVlKTtcbiAgICB0Lm9yZGVyQnkgPSB0Lm9yZGVyQnkuZmlsdGVyKG8gPT4gbyk7XG4gICAgcmV0dXJuIHRcbn1cblxuLy9cbmNsYXNzIE5vZGUge1xuICAgIC8vIEFyZ3M6XG4gICAgLy8gICB0ZW1wbGF0ZSAoVGVtcGxhdGUgb2JqZWN0KSB0aGUgdGVtcGxhdGUgdGhhdCBvd25zIHRoaXMgbm9kZVxuICAgIC8vICAgcGFyZW50IChvYmplY3QpIFBhcmVudCBvZiB0aGUgbmV3IG5vZGUuXG4gICAgLy8gICBuYW1lIChzdHJpbmcpIE5hbWUgZm9yIHRoZSBub2RlXG4gICAgLy8gICBwY29tcCAob2JqZWN0KSBQYXRoIGNvbXBvbmVudCBmb3IgdGhlIHJvb3QsIHRoaXMgaXMgYSBjbGFzcy4gRm9yIG90aGVyIG5vZGVzLCBhbiBhdHRyaWJ1dGUsIFxuICAgIC8vICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uIGRlY3JpcHRvci5cbiAgICAvLyAgIHB0eXBlIChvYmplY3Qgb3Igc3RyaW5nKSBUeXBlIG9mIHBjb21wLlxuICAgIGNvbnN0cnVjdG9yICh0ZW1wbGF0ZSwgcGFyZW50LCBuYW1lLCBwY29tcCwgcHR5cGUpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlOyAvLyB0aGUgdGVtcGxhdGUgSSBiZWxvbmcgdG8uXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7ICAgICAvLyBkaXNwbGF5IG5hbWVcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdOyAgIC8vIGNoaWxkIG5vZGVzXG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50OyAvLyBwYXJlbnQgbm9kZVxuICAgICAgICB0aGlzLnBjb21wID0gcGNvbXA7ICAgLy8gcGF0aCBjb21wb25lbnQgcmVwcmVzZW50ZWQgYnkgdGhlIG5vZGUuIEF0IHJvb3QsIHRoaXMgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdGFydGluZyBjbGFzcy4gT3RoZXJ3aXNlLCBwb2ludHMgdG8gYW4gYXR0cmlidXRlIChzaW1wbGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uKS5cbiAgICAgICAgdGhpcy5wdHlwZSAgPSBwdHlwZTsgIC8vIHBhdGggdHlwZS4gVGhlIHR5cGUgb2YgdGhlIHBhdGggYXQgdGhpcyBub2RlLCBpLmUuIHRoZSB0eXBlIG9mIHBjb21wLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBzaW1wbGUgYXR0cmlidXRlcywgdGhpcyBpcyBhIHN0cmluZy4gT3RoZXJ3aXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsLiBNYXkgYmUgb3ZlcnJpZGVuIGJ5IHN1YmNsYXNzIGNvbnN0cmFpbnQuXG4gICAgICAgIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDsgLy8gc3ViY2xhc3MgY29uc3RyYWludCAoaWYgYW55KS4gUG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBzcGVjaWZpZWQsIG92ZXJyaWRlcyBwdHlwZSBhcyB0aGUgdHlwZSBvZiB0aGUgbm9kZS5cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IFtdOy8vIGFsbCBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsOyAgICAvLyBJZiBzZWxlY3RlZCBmb3IgcmV0dXJuLCB0aGlzIGlzIGl0cyBjb2x1bW4jLlxuICAgICAgICBwYXJlbnQgJiYgcGFyZW50LmNoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmlkID0gdGhpcy5wYXRoO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCByb290Tm9kZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLnF0cmVlO1xuICAgIH1cblxuICAgIC8vXG4gICAgZ2V0IHBhdGggKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucGF0aCArXCIuXCIgOiBcIlwiKSArIHRoaXMubmFtZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgbm9kZVR5cGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNCaW9FbnRpdHkgKCkge1xuICAgICAgICBsZXQgYmUgPSBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW1wiQmlvRW50aXR5XCJdO1xuICAgICAgICBsZXQgbnQgPSB0aGlzLm5vZGVUeXBlO1xuICAgICAgICByZXR1cm4gaXNTdWJjbGFzcyhudCwgYmUpO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc1NlbGVjdGVkICgpIHtcbiAgICAgICAgIHJldHVybiB0aGlzLnZpZXcgIT09IG51bGwgJiYgdGhpcy52aWV3ICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgdGhpcy52aWV3ID0gaSA+PSAwID8gaSA6ICh0LnNlbGVjdC5wdXNoKHApIC0gMSk7XG4gICAgfVxuICAgIHVuc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgcGF0aCBmcm9tIHRoZSBzZWxlY3QgbGlzdFxuICAgICAgICAgICAgdC5zZWxlY3Quc3BsaWNlKGksMSk7XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVudW1iZXIgbm9kZXMgaGVyZVxuICAgICAgICAgICAgdC5zZWxlY3Quc2xpY2UoaSkuZm9yRWFjaCggKHAsaikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBuID0gZ2V0Tm9kZUJ5UGF0aCh0aGlzLnRlbXBsYXRlLCBwKTtcbiAgICAgICAgICAgICAgICBuLnZpZXcgLT0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgfVxuICAgIHNldFNvcnQobmV3ZGlyKXtcbiAgICAgICAgbGV0IG9sZGRpciA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5kaXIgOiBcIm5vbmVcIjtcbiAgICAgICAgbGV0IG9sZGxldiA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICBsZXQgbWF4bGV2ID0gLTE7XG4gICAgICAgIGxldCByZW51bWJlciA9IGZ1bmN0aW9uIChuKXtcbiAgICAgICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkbGV2ID49IDAgJiYgbi5zb3J0LmxldmVsID4gb2xkbGV2KVxuICAgICAgICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICBtYXhsZXYgPSBNYXRoLm1heChtYXhsZXYsIG4uc29ydC5sZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVudW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbmV3ZGlyIHx8IG5ld2RpciA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBub3Qgc29ydGVkXG4gICAgICAgICAgICB0aGlzLnNvcnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gcmVudW1iZXIgYW55IGV4aXN0aW5nIHNvcnQgY2Zncy5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBzb3J0ZWRcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBub3Qgc29ydGVkIGJlZm9yZSwgbmVlZCB0byBmaW5kIG5leHQgbGV2ZWwuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICAgICAgb2xkbGV2ID0gbWF4bGV2ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc29ydCA9IHsgZGlyOm5ld2RpciwgbGV2ZWw6IG9sZGxldiB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IgKHQpIHtcbiAgICAgICAgdCA9IHQgfHwge31cbiAgICAgICAgdGhpcy5tb2RlbCA9IHQubW9kZWwgPyBkZWVwYyh0Lm1vZGVsKSA6IHsgbmFtZTogXCJnZW5vbWljXCIgfTtcbiAgICAgICAgdGhpcy5uYW1lID0gdC5uYW1lIHx8IFwiXCI7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0LnRpdGxlIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IHQuc2VsZWN0ID8gZGVlcGModC5zZWxlY3QpIDogW107XG4gICAgICAgIHRoaXMud2hlcmUgPSB0LndoZXJlID8gdC53aGVyZS5tYXAoIGMgPT4gYy5jbG9uZSA/IGMuY2xvbmUoKSA6IG5ldyBDb25zdHJhaW50KGMpICkgOiBbXTtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50TG9naWMgPSB0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiO1xuICAgICAgICB0aGlzLmpvaW5zID0gdC5qb2lucyA/IGRlZXBjKHQuam9pbnMpIDogW107XG4gICAgICAgIHRoaXMudGFncyA9IHQudGFncyA/IGRlZXBjKHQudGFncykgOiBbXTtcbiAgICAgICAgdGhpcy5vcmRlckJ5ID0gdC5vcmRlckJ5ID8gZGVlcGModC5vcmRlckJ5KSA6IFtdO1xuICAgIH1cblxuICAgIC8vIFRPRE86IEtlZXAgbW92aW5nIGZ1bmN0aW9ucyBpbnRvIG1ldGhvZHNcbiAgICAvLyBGSVhNRTogTm90IGFsbCB0ZW1wbGF0ZXMgYXJlIFRlbWFwbGF0ZXMgISEgKHNvbWUgYXJlIHN0aWxsIHBsYWluIG9iamVjdHMgY3JlYXRlZCBlbHNld2lzZSlcbn07XG5cbmZ1bmN0aW9uIGdldE5vZGVCeVBhdGggKHQscCkge1xuICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgIGlmICghcCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgbiA9IHQucXRyZWU7XG4gICAgICAgIGlmIChuLm5hbWUgIT09IHBhcnRzWzBdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY25hbWUgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGxldCBjID0gKG4uY2hpbGRyZW4gfHwgW10pLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gY25hbWUpWzBdO1xuICAgICAgICAgICAgaWYgKCFjKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIG4gPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuY2xhc3MgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKGMpIHtcbiAgICAgICAgYyA9IGMgfHwge31cbiAgICAgICAgLy8gc2F2ZSB0aGUgIG5vZGVcbiAgICAgICAgdGhpcy5ub2RlID0gYy5ub2RlIHx8IG51bGw7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gYy5wYXRoIHx8IGMubm9kZSAmJiBjLm5vZGUucGF0aCB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gYy5vcCB8fCBudWxsO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0XG4gICAgICAgIHRoaXMuY3R5cGUgPSBjLmN0eXBlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgYWxsIGV4Y2VwdCBzdWJjbGFzcyBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLmNvZGUgPSBjLmNvZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSB2YWx1ZSwgbGlzdFxuICAgICAgICB0aGlzLnZhbHVlID0gYy52YWx1ZSB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gYy5leHRyYVZhbHVlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgbXVsdGl2YWx1ZSBhbmQgcmFuZ2UgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBjLnZhbHVlcyAmJiBkZWVwYyhjLnZhbHVlcykgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBzdWJjbGFzcyBjb250cmFpbnRzXG4gICAgICAgIHRoaXMudHlwZSA9IGMudHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGZvciBjb25zdHJhaW50cyBpbiBhIHRlbXBsYXRlXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBjLmVkaXRhYmxlIHx8IG51bGw7XG4gICAgfVxuICAgIC8vIFJldHVybnMgYW4gdW5yZWdpc3RlcmVkIGNsb25lLiAobWVhbnM6IG5vIG5vZGUgcG9pbnRlcilcbiAgICBjbG9uZSAoKSB7XG4gICAgICAgIGxldCBjID0gbmV3IENvbnN0cmFpbnQodGhpcyk7XG4gICAgICAgIGMubm9kZSA9IG51bGw7XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICAvL1xuICAgIHNldE9wIChvLCBxdWlldGx5KSB7XG4gICAgICAgIGxldCBvcCA9IE9QSU5ERVhbb107XG4gICAgICAgIGlmICghb3ApIHRocm93IFwiVW5rbm93biBvcGVyYXRvcjogXCIgKyBvO1xuICAgICAgICB0aGlzLm9wID0gb3Aub3A7XG4gICAgICAgIHRoaXMuY3R5cGUgPSBvcC5jdHlwZTtcbiAgICAgICAgbGV0IHQgPSB0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnRlbXBsYXRlO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2RlICYmICFxdWlldGx5ICYmIHQpIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0LmNvZGUyY1t0aGlzLmNvZGVdO1xuICAgICAgICAgICAgdGhpcy5jb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb2RlKSBcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSB0ICYmIG5leHRBdmFpbGFibGVDb2RlKHQpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgIXF1aWV0bHkgJiYgdCAmJiBzZXRMb2dpY0V4cHJlc3Npb24odC5jb25zdHJhaW50TG9naWMsIHQpO1xuICAgIH1cbiAgICAvLyBmb3JtYXRzIHRoaXMgY29uc3RyYWludCBhcyB4bWxcbiAgICBjMnhtbCAocW9ubHkpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBsZXQgZSA9IHFvbmx5ID8gXCJcIiA6IGBlZGl0YWJsZT1cIiR7dGhpcy5lZGl0YWJsZSB8fCAnZmFsc2UnfVwiYDtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcImxpc3RcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKHRoaXMuZXh0cmFWYWx1ZSAmJiB0aGlzLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke3RoaXMuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIil7XG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgICAgICBoID0gdGhpcy52YWx1ZXMubWFwKCB2ID0+IGA8dmFsdWU+JHtlc2Modil9PC92YWx1ZT5gICkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgdHlwZT1cIiR7dGhpcy50eXBlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHt0aGlzLm9wfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgaWYoaClcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfT4ke2h9PC9jb25zdHJhaW50PlxcbmA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfSAvPlxcbmA7XG4gICAgfVxufVxuXG4vLyBBZGRzIGEgcGF0aCB0byB0aGUgY3VycmVudCBkaWFncmFtLiBQYXRoIGlzIHNwZWNpZmllZCBhcyBhIGRvdHRlZCBsaXN0IG9mIG5hbWVzLlxuLy8gQXJnczpcbi8vICAgdGVtcGxhdGUgKG9iamVjdCkgdGhlIHRlbXBsYXRlXG4vLyAgIHBhdGggKHN0cmluZykgdGhlIHBhdGggdG8gYWRkLiBcbi8vICAgbW9kZWwgb2JqZWN0IENvbXBpbGVkIGRhdGEgbW9kZWwuXG4vLyBSZXR1cm5zOlxuLy8gICBsYXN0IHBhdGggY29tcG9uZW50IGNyZWF0ZWQuIFxuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICBDcmVhdGVzIG5ldyBub2RlcyBhcyBuZWVkZWQgYW5kIGFkZHMgdGhlbSB0byB0aGUgcXRyZWUuXG5mdW5jdGlvbiBhZGRQYXRoKHRlbXBsYXRlLCBwYXRoLCBtb2RlbCl7XG4gICAgaWYgKHR5cGVvZihwYXRoKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgcGF0aCA9IHBhdGguc3BsaXQoXCIuXCIpO1xuICAgIHZhciBjbGFzc2VzID0gbW9kZWwuY2xhc3NlcztcbiAgICB2YXIgbGFzdHQgPSBudWxsXG4gICAgdmFyIG4gPSB0ZW1wbGF0ZS5xdHJlZTsgIC8vIGN1cnJlbnQgbm9kZSBwb2ludGVyXG5cbiAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgcmV0dXJuIGxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgpe3JldHVybiB4Lm5hbWUgPT09IG59KVswXVxuICAgIH1cblxuICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHJvb3QgYWxyZWFkeSBleGlzdHMsIG1ha2Ugc3VyZSBuZXcgcGF0aCBoYXMgc2FtZSByb290LlxuICAgICAgICAgICAgICAgIG4gPSB0ZW1wbGF0ZS5xdHJlZTtcbiAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNhbm5vdCBhZGQgcGF0aCBmcm9tIGRpZmZlcmVudCByb290LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgcGF0aCB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICAgIGNscyA9IGNsYXNzZXNbcF07XG4gICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgIG4gPSB0ZW1wbGF0ZS5xdHJlZSA9IG5ldyBOb2RlKCB0ZW1wbGF0ZSwgbnVsbCwgcCwgY2xzLCBjbHMgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgIHZhciBubiA9IGZpbmQobi5jaGlsZHJlbiwgcCk7XG4gICAgICAgICAgICBpZiAobm4pIHtcbiAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgIG4gPSBubjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gYWRkIGEgbmV3IG5vZGUgZm9yIHBcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCwgbG9va3VwIHBcbiAgICAgICAgICAgICAgICB2YXIgeDtcbiAgICAgICAgICAgICAgICB2YXIgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzLmF0dHJpYnV0ZXNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5hdHRyaWJ1dGVzW3BdO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGUgLy8gPC0tIEEgc3RyaW5nIVxuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF07XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IGNsYXNzZXNbeC5yZWZlcmVuY2VkVHlwZV0gLy8gPC0tXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzOiBcIiArIHA7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBtZW1iZXIgbmFtZWQgXCIgKyBwICsgXCIgaW4gY2xhc3MgXCIgKyBjbHMubmFtZSArIFwiLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IG5vZGUsIGFkZCBpdCB0byBuJ3MgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBubiA9IG5ldyBOb2RlKHRlbXBsYXRlLCBuLCBwLCB4LCBjbHMpO1xuICAgICAgICAgICAgICAgIG4gPSBubjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyByZXR1cm4gdGhlIGxhc3Qgbm9kZSBpbiB0aGUgcGF0aFxuICAgIHJldHVybiBuO1xufVxuXG5cbi8vIEFyZ3M6XG4vLyAgIG4gKG5vZGUpIFRoZSBub2RlIGhhdmluZyB0aGUgY29uc3RyYWludC5cbi8vICAgc2NOYW1lICh0eXBlKSBOYW1lIG9mIHN1YmNsYXNzLlxuZnVuY3Rpb24gc2V0U3ViY2xhc3NDb25zdHJhaW50KG4sIHNjTmFtZSl7XG4gICAgLy8gcmVtb3ZlIGFueSBleGlzdGluZyBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgbi5jb25zdHJhaW50cyA9IG4uY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uIChjKXsgcmV0dXJuIGMuY3R5cGUgIT09IFwic3ViY2xhc3NcIjsgfSk7XG4gICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgIGlmIChzY05hbWUpe1xuICAgICAgICBsZXQgY2xzID0gY3Vyck1pbmUubW9kZWwuY2xhc3Nlc1tzY05hbWVdO1xuICAgICAgICBpZighY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgc2NOYW1lO1xuICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goeyBjdHlwZTpcInN1YmNsYXNzXCIsIG9wOlwiSVNBXCIsIHBhdGg6bi5wYXRoLCB0eXBlOmNscy5uYW1lIH0pO1xuICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hlY2sobm9kZSwgcmVtb3ZlZCkge1xuICAgICAgICB2YXIgY2xzID0gbm9kZS5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbm9kZS5wdHlwZTtcbiAgICAgICAgdmFyIGMyID0gW107XG4gICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGlmKGMubmFtZSBpbiBjbHMuYXR0cmlidXRlcyB8fCBjLm5hbWUgaW4gY2xzLnJlZmVyZW5jZXMgfHwgYy5uYW1lIGluIGNscy5jb2xsZWN0aW9ucykge1xuICAgICAgICAgICAgICAgIGMyLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgY2hlY2soYywgcmVtb3ZlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGMpO1xuICAgICAgICB9KVxuICAgICAgICBub2RlLmNoaWxkcmVuID0gYzI7XG4gICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgIH1cbiAgICB2YXIgcmVtb3ZlZCA9IGNoZWNrKG4sW10pO1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICB1cGRhdGUobik7XG4gICAgaWYocmVtb3ZlZC5sZW5ndGggPiAwKVxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgYWxlcnQoXCJDb25zdHJhaW5pbmcgdG8gc3ViY2xhc3MgXCIgKyAoc2NOYW1lIHx8IG4ucHR5cGUubmFtZSlcbiAgICAgICAgICAgICsgXCIgY2F1c2VkIHRoZSBmb2xsb3dpbmcgcGF0aHMgdG8gYmUgcmVtb3ZlZDogXCIgXG4gICAgICAgICAgICArIHJlbW92ZWQubWFwKG4gPT4gbi5wYXRoKS5qb2luKFwiLCBcIikpOyBcbiAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xufVxuXG4vLyBSZW1vdmVzIHRoZSBjdXJyZW50IG5vZGUgYW5kIGFsbCBpdHMgZGVzY2VuZGFudHMuXG4vL1xuZnVuY3Rpb24gcmVtb3ZlTm9kZShuKSB7XG4gICAgLy8gRmlyc3QsIHJlbW92ZSBhbGwgY29uc3RyYWludHMgb24gbiBvciBpdHMgZGVzY2VuZGFudHNcbiAgICBmdW5jdGlvbiBybWMgKHgpIHtcbiAgICAgICAgeC51bnNlbGVjdCgpO1xuICAgICAgICB4LmNvbnN0cmFpbnRzLmZvckVhY2goYyA9PiByZW1vdmVDb25zdHJhaW50KHgsYykpO1xuICAgICAgICB4LmNoaWxkcmVuLmZvckVhY2gocm1jKTtcbiAgICB9XG4gICAgcm1jKG4pO1xuICAgIC8vIE5vdyByZW1vdmUgdGhlIHN1YnRyZWUgYXQgbi5cbiAgICB2YXIgcCA9IG4ucGFyZW50O1xuICAgIGlmIChwKSB7XG4gICAgICAgIHAuY2hpbGRyZW4uc3BsaWNlKHAuY2hpbGRyZW4uaW5kZXhPZihuKSwgMSk7XG4gICAgICAgIGhpZGVEaWFsb2coKTtcbiAgICAgICAgdXBkYXRlKHApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaGlkZURpYWxvZygpXG4gICAgfVxuICAgIC8vXG4gICAgc2F2ZVN0YXRlKCk7XG59XG5cbi8vIENhbGxlZCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSB0ZW1wbGF0ZSBmcm9tIHRoZSBsaXN0LlxuLy8gR2V0cyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgY3VycmVudCBtaW5lIGFuZCBidWlsZHMgYSBzZXQgb2Ygbm9kZXNcbi8vIGZvciBkMyB0cmVlIGRpc3BsYXkuXG4vL1xuZnVuY3Rpb24gZWRpdFRlbXBsYXRlICh0LCBub3NhdmUpIHtcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGVkaXRvciB3b3JrcyBvbiBhIGNvcHkgb2YgdGhlIHRlbXBsYXRlLlxuICAgIC8vXG4gICAgY3VyclRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHQpO1xuICAgIC8vXG4gICAgcm9vdCA9IGNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUsIGN1cnJNaW5lLm1vZGVsKS5xdHJlZVxuICAgIHJvb3QueDAgPSAwO1xuICAgIHJvb3QueTAgPSBoIC8gMjtcbiAgICAvL1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbigpO1xuXG4gICAgaWYgKCEgbm9zYXZlKSBzYXZlU3RhdGUoKTtcblxuICAgIC8vIEZpbGwgaW4gdGhlIGJhc2ljIHRlbXBsYXRlIGluZm9ybWF0aW9uIChuYW1lLCB0aXRsZSwgZGVzY3JpcHRpb24sIGV0Yy4pXG4gICAgLy9cbiAgICB2YXIgdGkgPSBkMy5zZWxlY3QoXCIjdEluZm9cIik7XG4gICAgdmFyIHhmZXIgPSBmdW5jdGlvbihuYW1lLCBlbHQpeyBjdXJyVGVtcGxhdGVbbmFtZV0gPSBlbHQudmFsdWU7IHVwZGF0ZVR0ZXh0KCk7IH07XG4gICAgLy8gTmFtZSAodGhlIGludGVybmFsIHVuaXF1ZSBuYW1lKVxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJuYW1lXCJdIGlucHV0JylcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdXJyVGVtcGxhdGUubmFtZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJuYW1lXCIsIHRoaXMpIH0pO1xuICAgIC8vIFRpdGxlICh3aGF0IHRoZSB1c2VyIHNlZXMpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cInRpdGxlXCJdIGlucHV0JylcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdXJyVGVtcGxhdGUudGl0bGUpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwidGl0bGVcIiwgdGhpcykgfSk7XG4gICAgLy8gRGVzY3JpcHRpb24gKHdoYXQgaXQgZG9lcyAtIGEgbGl0dGxlIGRvY3VtZW50YXRpb24pLlxuICAgIHRpLnNlbGVjdCgnW25hbWU9XCJkZXNjcmlwdGlvblwiXSB0ZXh0YXJlYScpXG4gICAgICAgIC50ZXh0KGN1cnJUZW1wbGF0ZS5kZXNjcmlwdGlvbilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJkZXNjcmlwdGlvblwiLCB0aGlzKSB9KTtcbiAgICAvLyBDb21tZW50IC0gZm9yIHdoYXRldmVyLCBJIGd1ZXNzLiBcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiY29tbWVudFwiXSB0ZXh0YXJlYScpXG4gICAgICAgIC50ZXh0KGN1cnJUZW1wbGF0ZS5jb21tZW50KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImNvbW1lbnRcIiwgdGhpcykgfSk7XG5cbiAgICAvLyBMb2dpYyBleHByZXNzaW9uIC0gd2hpY2ggdGllcyB0aGUgaW5kaXZpZHVhbCBjb25zdHJhaW50cyB0b2dldGhlclxuICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljIH0pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2V0TG9naWNFeHByZXNzaW9uKHRoaXMudmFsdWUsIGN1cnJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB4ZmVyKFwiY29uc3RyYWludExvZ2ljXCIsIHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgLy9cbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG4vLyBTZXRzIHRoZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJlc3Npb24gZm9yIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbi8vIEluIHRoZSBwcm9jZXNzLCBhbHNvIFwiY29ycmVjdHNcIiB0aGUgZXhwcmVzc2lvbiBhcyBmb2xsb3dzOlxuLy8gICAgKiBhbnkgY29kZXMgaW4gdGhlIGV4cHJlc3Npb24gdGhhdCBhcmUgbm90IGFzc29jaWF0ZWQgd2l0aFxuLy8gICAgICBhbnkgY29uc3RyYWludCBpbiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBhcmUgcmVtb3ZlZCBhbmQgdGhlXG4vLyAgICAgIGV4cHJlc3Npb24gbG9naWMgdXBkYXRlZCBhY2NvcmRpbmdseVxuLy8gICAgKiBhbmQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHRoYXQgYXJlIG5vdCBpbiB0aGUgZXhwcmVzc2lvblxuLy8gICAgICBhcmUgQU5EZWQgdG8gdGhlIGVuZC5cbi8vIEZvciBleGFtcGxlLCBpZiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoYXMgY29kZXMgQSwgQiwgYW5kIEMsIGFuZFxuLy8gdGhlIGV4cHJlc3Npb24gaXMgXCIoQSBvciBEKSBhbmQgQlwiLCB0aGUgRCBkcm9wcyBvdXQgYW5kIEMgaXNcbi8vIGFkZGVkLCByZXN1bHRpbmcgaW4gXCJBIGFuZCBCIGFuZCBDXCIuIFxuLy8gQXJnczpcbi8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbi8vICAgdG1wbHQgKG9iaikgdGhlIHRlbXBsYXRlXG4vLyBSZXR1cm5zOlxuLy8gICB0aGUgXCJjb3JyZWN0ZWRcIiBleHByZXNzaW9uXG4vLyAgIFxuZnVuY3Rpb24gc2V0TG9naWNFeHByZXNzaW9uKGV4LCB0bXBsdCl7XG4gICAgdG1wbHQgPSB0bXBsdCA/IHRtcGx0IDogY3VyclRlbXBsYXRlO1xuICAgIGV4ID0gZXggPyBleCA6ICh0bXBsdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIilcbiAgICB2YXIgYXN0OyAvLyBhYnN0cmFjdCBzeW50YXggdHJlZVxuICAgIHZhciBzZWVuID0gW107XG4gICAgZnVuY3Rpb24gcmVhY2gobixsZXYpe1xuICAgICAgICBpZiAodHlwZW9mKG4pID09PSBcInN0cmluZ1wiICl7XG4gICAgICAgICAgICAvLyBjaGVjayB0aGF0IG4gaXMgYSBjb25zdHJhaW50IGNvZGUgaW4gdGhlIHRlbXBsYXRlLiBcbiAgICAgICAgICAgIC8vIElmIG5vdCwgcmVtb3ZlIGl0IGZyb20gdGhlIGV4cHIuXG4gICAgICAgICAgICAvLyBBbHNvIHJlbW92ZSBpdCBpZiBpdCdzIHRoZSBjb2RlIGZvciBhIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgICAgIHNlZW4ucHVzaChuKTtcbiAgICAgICAgICAgIHJldHVybiAobiBpbiB0bXBsdC5jb2RlMmMgJiYgdG1wbHQuY29kZTJjW25dLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpID8gbiA6IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNtcyA9IG4uY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKGMpe3JldHVybiByZWFjaChjLCBsZXYrMSk7fSkuZmlsdGVyKGZ1bmN0aW9uKHgpe3JldHVybiB4O30pOztcbiAgICAgICAgdmFyIGNtc3MgPSBjbXMuam9pbihcIiBcIituLm9wK1wiIFwiKTtcbiAgICAgICAgcmV0dXJuIGNtcy5sZW5ndGggPT09IDAgPyBcIlwiIDogbGV2ID09PSAwIHx8IGNtcy5sZW5ndGggPT09IDEgPyBjbXNzIDogXCIoXCIgKyBjbXNzICsgXCIpXCJcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXN0ID0gZXggPyBwYXJzZXIucGFyc2UoZXgpIDogbnVsbDtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBhbGVydChlcnIpO1xuICAgICAgICByZXR1cm4gdG1wbHQuY29uc3RyYWludExvZ2ljO1xuICAgIH1cbiAgICAvL1xuICAgIHZhciBsZXggPSBhc3QgPyByZWFjaChhc3QsMCkgOiBcIlwiO1xuICAgIC8vIGlmIGFueSBjb25zdHJhaW50IGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB3ZXJlIG5vdCBzZWVuIGluIHRoZSBleHByZXNzaW9uLFxuICAgIC8vIEFORCB0aGVtIGludG8gdGhlIGV4cHJlc3Npb24gKGV4Y2VwdCBJU0EgY29uc3RyYWludHMpLlxuICAgIHZhciB0b0FkZCA9IE9iamVjdC5rZXlzKHRtcGx0LmNvZGUyYykuZmlsdGVyKGZ1bmN0aW9uKGMpe1xuICAgICAgICByZXR1cm4gc2Vlbi5pbmRleE9mKGMpID09PSAtMSAmJiBjLm9wICE9PSBcIklTQVwiO1xuICAgICAgICB9KTtcbiAgICBpZiAodG9BZGQubGVuZ3RoID4gMCkge1xuICAgICAgICAgaWYoYXN0ICYmIGFzdC5vcCAmJiBhc3Qub3AgPT09IFwib3JcIilcbiAgICAgICAgICAgICBsZXggPSBgKCR7bGV4fSlgO1xuICAgICAgICAgaWYgKGxleCkgdG9BZGQudW5zaGlmdChsZXgpO1xuICAgICAgICAgbGV4ID0gdG9BZGQuam9pbihcIiBhbmQgXCIpO1xuICAgIH1cbiAgICAvL1xuICAgIHRtcGx0LmNvbnN0cmFpbnRMb2dpYyA9IGxleDtcblxuICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBsZXg7IH0pO1xuXG4gICAgcmV0dXJuIGxleDtcbn1cblxuLy8gRXh0ZW5kcyB0aGUgcGF0aCBmcm9tIGN1cnJOb2RlIHRvIHBcbi8vIEFyZ3M6XG4vLyAgIGN1cnJOb2RlIChub2RlKSBOb2RlIHRvIGV4dGVuZCBmcm9tXG4vLyAgIG1vZGUgKHN0cmluZykgb25lIG9mIFwic2VsZWN0XCIsIFwiY29uc3RyYWluXCIgb3IgXCJvcGVuXCJcbi8vICAgcCAoc3RyaW5nKSBOYW1lIG9mIGFuIGF0dHJpYnV0ZSwgcmVmLCBvciBjb2xsZWN0aW9uXG4vLyBSZXR1cm5zOlxuLy8gICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgIElmIHRoZSBzZWxlY3RlZCBpdGVtIGlzIG5vdCBhbHJlYWR5IGluIHRoZSBkaXNwbGF5LCBpdCBlbnRlcnNcbi8vICAgYXMgYSBuZXcgY2hpbGQgKGdyb3dpbmcgb3V0IGZyb20gdGhlIHBhcmVudCBub2RlLlxuLy8gICBUaGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkIG9uIHRoZSBjaGlsZCBub2RlLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK3NlbGVjdFwiIGJ1dHRvbiwgdGhlIGNoaWxkIGlzIHNlbGVjdGVkLlxuLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK2NvbnN0cmFpblwiIGJ1dHRvbiwgYSBuZXcgY29uc3RyYWludCBpcyBhZGRlZCB0byB0aGVcbi8vICAgY2hpbGQsIGFuZCB0aGUgY29uc3RyYWludCBlZGl0b3Igb3BlbmVkICBvbiB0aGF0IGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gc2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBtb2RlLCBwKXtcbiAgICBsZXQgbjtcbiAgICBsZXQgY2M7XG4gICAgbGV0IHNmcztcbiAgICBpZiAobW9kZSA9PT0gXCJzdW1tYXJ5ZmllbGRzXCIpIHtcbiAgICAgICAgc2ZzID0gY3Vyck1pbmUuc3VtbWFyeUZpZWxkc1tjdXJyTm9kZS5ub2RlVHlwZS5uYW1lXXx8W107XG4gICAgICAgIHNmcy5mb3JFYWNoKGZ1bmN0aW9uKHNmLCBpKXtcbiAgICAgICAgICAgIHNmID0gc2YucmVwbGFjZSgvXlteLl0rLywgY3Vyck5vZGUucGF0aCk7XG4gICAgICAgICAgICBsZXQgbSA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBzZiwgY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbS5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwID0gY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgbiA9IGFkZFBhdGgoY3VyclRlbXBsYXRlLCBwLCBjdXJyTWluZS5tb2RlbCApO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJzZWxlY3RlZFwiKVxuICAgICAgICAgICAgIW4uaXNTZWxlY3RlZCAmJiBuLnNlbGVjdCgpO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJjb25zdHJhaW5lZFwiKSB7XG4gICAgICAgICAgICBjYyA9IGFkZENvbnN0cmFpbnQobiwgZmFsc2UpXG4gICAgICAgIH1cbiAgICB9XG4gICAgaGlkZURpYWxvZygpO1xuICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgaWYgKG1vZGUgIT09IFwib3BlblwiKVxuICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICBpZiAobW9kZSAhPT0gXCJzdW1tYXJ5ZmllbGRzXCIpIFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzaG93RGlhbG9nKG4pO1xuICAgICAgICAgICAgY2MgJiYgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVkaXRDb25zdHJhaW50KGNjLCBuKVxuICAgICAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgXG59XG4vLyBSZXR1cm5zIGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBhIGNvbnN0cmFpbnRcbi8vXG5mdW5jdGlvbiBjb25zdHJhaW50VGV4dChjKSB7XG4gICB2YXIgdCA9IFwiP1wiO1xuICAgaWYgKCFjKSByZXR1cm4gdDtcbiAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpe1xuICAgICAgIHQgPSBcIklTQSBcIiArIChjLnR5cGUgfHwgXCI/XCIpO1xuICAgfVxuICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgIH1cbiAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZTtcbiAgICAgICBpZiAoYy5leHRyYVZhbHVlKSB0ID0gdCArIFwiIElOIFwiICsgYy5leHRyYVZhbHVlO1xuICAgfVxuICAgZWxzZSBpZiAoYy52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIChjLm9wLmluY2x1ZGVzKFwiTlVMTFwiKSA/IFwiXCIgOiBcIiBcIiArIGMudmFsdWUpXG4gICB9XG4gICBlbHNlIGlmIChjLnZhbHVlcyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICB0ID0gYy5vcCArIFwiIFwiICsgYy52YWx1ZXNcbiAgIH1cbiAgIHJldHVybiAoYy5jb2RlID8gXCIoXCIrYy5jb2RlK1wiKSBcIiA6IFwiXCIpICsgdDtcbn1cblxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgdmFyIHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vXG5mdW5jdGlvbiBvcFZhbGlkRm9yKG9wLCBuKXtcbiAgICBpZighbi5wYXJlbnQgJiYgIW9wLnZhbGlkRm9yUm9vdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHR5cGVvZihuLnB0eXBlKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgaWYoISBvcC52YWxpZEZvckF0dHIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKG4ucHR5cGUpID09IC0xKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmKG4ucHR5cGUubmFtZSAmJiAhIG9wLnZhbGlkRm9yQ2xhc3MpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUNFaW5wdXRzKGMsIG9wKXtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKS50ZXh0KGMuY29kZSk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbn1cblxuLy8gQXJnczpcbi8vICAgc2VsZWN0b3IgKHN0cmluZykgRm9yIHNlbGVjdGluZyB0aGUgPHNlbGVjdD4gZWxlbWVudFxuLy8gICBkYXRhIChsaXN0KSBEYXRhIHRvIGJpbmQgdG8gb3B0aW9uc1xuLy8gICBjZmcgKG9iamVjdCkgQWRkaXRpb25hbCBvcHRpb25hbCBjb25maWdzOlxuLy8gICAgICAgdGl0bGUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIGZvciBzZXR0aW5nIHRoZSB0ZXh0IG9mIHRoZSBvcHRpb24uIFxuLy8gICAgICAgdmFsdWUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIHNldHRpbmcgdGhlIHZhbHVlIG9mIHRoZSBvcHRpb25cbi8vICAgICAgIHNlbGVjdGVkIC0gZnVuY3Rpb24gb3IgYXJyYXkgb3Igc3RyaW5nIGZvciBkZWNpZGluZyB3aGljaCBvcHRpb24ocykgYXJlIHNlbGVjdGVkXG4vLyAgICAgICAgICBJZiBmdW5jdGlvbiwgY2FsbGVkIGZvciBlYWNoIG9wdGlvbi5cbi8vICAgICAgICAgIElmIGFycmF5LCBzcGVjaWZpZXMgdGhlIHZhbHVlcyB0aGUgc2VsZWN0LlxuLy8gICAgICAgICAgSWYgc3RyaW5nLCBzcGVjaWZpZXMgd2hpY2ggdmFsdWUgaXMgc2VsZWN0ZWRcbi8vICAgICAgIGVtcHR5TWVzc2FnZSAtIGEgbWVzc2FnZSB0byBzaG93IGlmIHRoZSBkYXRhIGxpc3QgaXMgZW1wdHlcbi8vICAgICAgIG11bHRpcGxlIC0gaWYgdHJ1ZSwgbWFrZSBpdCBhIG11bHRpLXNlbGVjdCBsaXN0XG4vL1xuZnVuY3Rpb24gaW5pdE9wdGlvbkxpc3Qoc2VsZWN0b3IsIGRhdGEsIGNmZyl7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgdmFyIGlkZW50ID0gKHg9PngpO1xuICAgIHZhciBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy8gSW5pdGlhbGl6ZXMgdGhlIGlucHV0IGVsZW1lbnRzIGluIHRoZSBjb25zdHJhaW50IGVkaXRvciBmcm9tIHRoZSBnaXZlbiBjb25zdHJhaW50LlxuLy9cbmZ1bmN0aW9uIGluaXRDRWlucHV0cyhuLCBjLCBjdHlwZSkge1xuXG4gICAgLy8gUG9wdWxhdGUgdGhlIG9wZXJhdG9yIHNlbGVjdCBsaXN0IHdpdGggb3BzIGFwcHJvcHJpYXRlIGZvciB0aGUgcGF0aFxuICAgIC8vIGF0IHRoaXMgbm9kZS5cbiAgICBpZiAoIWN0eXBlKSBcbiAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJvcFwiXScsIFxuICAgICAgICBPUFMuZmlsdGVyKGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG9wVmFsaWRGb3Iob3AsIG4pOyB9KSxcbiAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBkID0+IGQub3AsXG4gICAgICAgIHRpdGxlOiBkID0+IGQub3AsXG4gICAgICAgIHNlbGVjdGVkOmMub3BcbiAgICAgICAgfSk7XG4gICAgLy9cbiAgICAvL1xuICAgIGN0eXBlID0gY3R5cGUgfHwgYy5jdHlwZTtcblxuICAgIGxldCBjZSA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpO1xuICAgIGxldCBzbXpkID0gY2UuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG4gICAgY2UuYXR0cihcImNsYXNzXCIsIFwib3BlbiBcIiArIGN0eXBlKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgc216ZClcbiAgICAgICAgLmNsYXNzZWQoXCJiaW9lbnRpdHlcIiwgIG4uaXNCaW9FbnRpdHkpO1xuXG4gXG4gICAgLy9cbiAgICAvLyBzZXQvcmVtb3ZlIHRoZSBcIm11bHRpcGxlXCIgYXR0cmlidXRlIG9mIHRoZSBzZWxlY3QgZWxlbWVudCBhY2NvcmRpbmcgdG8gY3R5cGVcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgLmF0dHIoXCJtdWx0aXBsZVwiLCBmdW5jdGlvbigpeyByZXR1cm4gY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiIHx8IG51bGw7IH0pO1xuXG4gICAgLy9cbiAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIFtcIkFueVwiXS5jb25jYXQoY3Vyck1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICApO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBvcHRpb24gbGlzdCBvZiBzdWJjbGFzcyBuYW1lc1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBuLnBhcmVudCA/IGdldFN1YmNsYXNzZXMobi5wY29tcC5raW5kID8gbi5wY29tcC50eXBlIDogbi5wY29tcCkgOiBbXSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBvbmUgd2hvc2UgbmFtZSBtYXRjaGVzIHRoZSBub2RlJ3MgdHlwZSBhbmQgc2V0IGl0cyBzZWxlY3RlZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBjdXJyTWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGlzVmFsaWRMaXN0Q29uc3RyYWludChsLCBjdXJyTm9kZSk7IH0pLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gbGlzdHMpXCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICAgICAgLy9sZXQgYWNzID0gZ2V0TG9jYWwoXCJhdXRvY29tcGxldGVcIiwgdHJ1ZSwgW10pO1xuICAgICAgICAvLyBkaXNhYmxlIHRoaXMgZm9yIG5vdy5cbiAgICAgICAgbGV0IGFjcyA9IFtdO1xuICAgICAgICBpZiAoYWNzLmluZGV4T2YoYXR0cikgIT09IC0xKVxuICAgICAgICAgICAgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIlVucmVjb2duaXplZCBjdHlwZTogXCIgKyBjdHlwZVxuICAgIH1cbiAgICBcbn1cblxuLy8gT3BlbnMgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZvciBjb25zdHJhaW50IGMgb2Ygbm9kZSBuLlxuLy9cbmZ1bmN0aW9uIG9wZW5Db25zdHJhaW50RWRpdG9yKGMsIG4pe1xuXG4gICAgLy8gTm90ZSBpZiB0aGlzIGlzIGhhcHBlbmluZyBhdCB0aGUgcm9vdCBub2RlXG4gICAgdmFyIGlzcm9vdCA9ICEgbi5wYXJlbnQ7XG4gXG4gICAgLy8gRmluZCB0aGUgZGl2IGZvciBjb25zdHJhaW50IGMgaW4gdGhlIGRpYWxvZyBsaXN0aW5nLiBXZSB3aWxsXG4gICAgLy8gb3BlbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb24gdG9wIG9mIGl0LlxuICAgIHZhciBjZGl2O1xuICAgIGQzLnNlbGVjdEFsbChcIiNkaWFsb2cgLmNvbnN0cmFpbnRcIilcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oY2MpeyBpZihjYyA9PT0gYykgY2RpdiA9IHRoaXM7IH0pO1xuICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgY29uc3RyYWludCdzIGNvbnRhaW5lciBkaXZcbiAgICB2YXIgY2JiID0gY2Rpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGFwcCdzIG1haW4gYm9keSBlbGVtZW50XG4gICAgdmFyIGRiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAvLyBwb3NpdGlvbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb3ZlciB0aGUgY29uc3RyYWludCBpbiB0aGUgZGlhbG9nXG4gICAgdmFyIGNlZCA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgYy5jdHlwZSlcbiAgICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIHRydWUpXG4gICAgICAgIC5zdHlsZShcInRvcFwiLCAoY2JiLnRvcCAtIGRiYi50b3ApK1wicHhcIilcbiAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoY2JiLmxlZnQgLSBkYmIubGVmdCkrXCJweFwiKVxuICAgICAgICA7XG5cbiAgICAvLyBJbml0IHRoZSBjb25zdHJhaW50IGNvZGUgXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAudGV4dChjLmNvZGUpO1xuXG4gICAgaW5pdENFaW5wdXRzKG4sIGMpO1xuXG4gICAgLy8gV2hlbiB1c2VyIHNlbGVjdHMgYW4gb3BlcmF0b3IsIGFkZCBhIGNsYXNzIHRvIHRoZSBjLmUuJ3MgY29udGFpbmVyXG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgb3AgPSBPUElOREVYW3RoaXMudmFsdWVdO1xuICAgICAgICAgICAgaW5pdENFaW5wdXRzKG4sIGMsIG9wLmN0eXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgY2FuY2VsQ29uc3RyYWludEVkaXRvcihuLCBjKSB9KTtcblxuICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc2F2ZVwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBzYXZlQ29uc3RyYWludEVkaXRzKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zeW5jXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKSB9KTtcblxufVxuLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbi8vIEFyZ3M6XG4vLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbi8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbi8vIE5COiBPbmx5IHZhbHVlIGFuZCBtdWx0aXZhdWUgY29uc3RyYWludHMgY2FuIGJlIHN1bW1hcml6ZWQgaW4gdGhpcyB3YXkuICBcbmZ1bmN0aW9uIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKXtcbiAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgIC8vIEJVVCBOT1RFLCB3ZSBoYXZlIHRvIHJ1biB0aGUgcXVlcnkgKndpdGhvdXQqIGNvbnN0cmFpbnQgYyEhXG4gICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgIC8vIHN5bmMgYnV0dG9uIHRvIGdldCBhIGxpc3QuIElmIHdlIHJ1biB0aGUgcXVlcnkgd2l0aCBjIGludGFjdCwgd2UnbGwgZ2V0IGEgbGlzdFxuICAgIC8vIGNvbnRhaW5pbnQgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAvLyBoZXJlIGlzIHRvIGVuc3VyZSBpdCBieSBhZGRpbmcgdGhlIHBhdGggdG8gdGhlIHZpZXcgbGlzdC5cblxuICAgIGxldCBjdmFscyA9IFtdO1xuICAgIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBjdmFscyA9IGMudmFsdWVzO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgY3ZhbHMgPSBbIGMudmFsdWUgXTtcbiAgICB9XG5cbiAgICAvLyBTYXZlIHRoaXMgY2hvaWNlIGluIGxvY2FsU3RvcmFnZVxuICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgIGxldCBrZXkgPSBcImF1dG9jb21wbGV0ZVwiO1xuICAgIGxldCBsc3Q7XG4gICAgbHN0ID0gZ2V0TG9jYWwoa2V5LCB0cnVlLCBbXSk7XG4gICAgaWYobHN0LmluZGV4T2YoYXR0cikgPT09IC0xKSBsc3QucHVzaChhdHRyKTtcbiAgICBzZXRMb2NhbChrZXksIGxzdCwgdHJ1ZSk7XG5cbiAgICBjbGVhckxvY2FsKCk7XG5cbiAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgIC8vXG4gICAgbGV0IGxleCA9IGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWM7IC8vIHNhdmUgY29uc3RyYWludCBsb2dpYyBleHByXG4gICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCBmYWxzZSk7IC8vIHRlbXBvcmFyaWx5IHJlbW92ZSB0aGUgY29uc3RyYWludFxuICAgIGxldCBqID0gdW5jb21waWxlVGVtcGxhdGUoY3VyclRlbXBsYXRlKTtcbiAgICBqLnNlbGVjdC5wdXNoKHApOyAvLyBtYWtlIHN1cmUgcCBpcyBwYXJ0IG9mIHRoZSBxdWVyeVxuICAgIGN1cnJUZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgPSBsZXg7IC8vIHJlc3RvcmUgdGhlIGxvZ2ljIGV4cHJcbiAgICBhZGRDb25zdHJhaW50KG4sIGZhbHNlLCBjKTsgLy8gcmUtYWRkIHRoZSBjb25zdHJhaW50XG5cbiAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgbGV0IHggPSBqc29uMnhtbChqLCB0cnVlKTtcbiAgICBsZXQgZSA9IGVuY29kZVVSSUNvbXBvbmVudCh4KTtcbiAgICBsZXQgdXJsID0gYCR7Y3Vyck1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICBsZXQgdGhyZXNob2xkID0gMjUwO1xuXG4gICAgLy8gc2lnbmFsIHRoYXQgd2UncmUgc3RhcnRpbmdcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgIC8vIGdvIVxuICAgIGQzanNvblByb21pc2UodXJsKS50aGVuKGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAvLyBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgaW4ganNvbi5yZXVsdHMuXG4gICAgICAgIC8vIEVhY2ggbGlzdCBpdGVtIGxvb2tzIGxpa2U6IHsgaXRlbTogXCJzb21lc3RyaW5nXCIsIGNvdW50OiAxNyB9XG4gICAgICAgIC8vIChZZXMsIHdlIGdldCBjb3VudHMgZm9yIGZyZWUhIE91Z2h0IHRvIG1ha2UgdXNlIG9mIHRoaXMuKVxuICAgICAgICAvL1xuICAgICAgICBsZXQgcmVzID0ganNvbi5yZXN1bHRzLm1hcChyID0+IHIuaXRlbSkuc29ydCgpO1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgbGV0IGFucyA9IHByb21wdChgVGhlcmUgYXJlICR7cmVzLmxlbmd0aH0gcmVzdWx0cywgd2hpY2ggZXhjZWVkcyB0aGUgdGhyZXNob2xkIG9mICR7dGhyZXNob2xkfS4gSG93IG1hbnkgZG8geW91IHdhbnQgdG8gc2hvdz9gLCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgIGlmIChpc05hTihhbnMpIHx8IGFucyA8PSAwKSByZXR1cm47XG4gICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgfVxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJylcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCB0cnVlKTtcbiAgICAgICAgbGV0IG9wdHMgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YShyZXMpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgZCA9PiBkKVxuICAgICAgICAgICAgLnRleHQoIGQgPT4gZCApXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIG51bGwpXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY3ZhbHMuaW5kZXhPZihkKSAhPT0gLTEgfHwgbnVsbCk7XG4gICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICB9KVxufVxuLy9cbmZ1bmN0aW9uIGNhbmNlbENvbnN0cmFpbnRFZGl0b3IobiwgYyl7XG4gICAgaWYgKCEgYy5zYXZlZCkge1xuICAgICAgICByZW1vdmVDb25zdHJhaW50KG4sIGMsIHRydWUpO1xuICAgIH1cbiAgICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xufVxuZnVuY3Rpb24gaGlkZUNvbnN0cmFpbnRFZGl0b3IoKXtcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5jbGFzc2VkKFwib3BlblwiLCBudWxsKTtcbn1cbi8vXG5mdW5jdGlvbiBlZGl0Q29uc3RyYWludChjLCBuKXtcbiAgICBvcGVuQ29uc3RyYWludEVkaXRvcihjLCBuKTtcbn1cbi8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbi8vIHVzZWQgaW4gdGhlIGdpdmVuIHRlbXBsYXRlLlxuLy9cbmZ1bmN0aW9uIG5leHRBdmFpbGFibGVDb2RlKHRtcGx0KXtcbiAgICBmb3IodmFyIGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICBpZiAoISAoYyBpbiB0bXBsdC5jb2RlMmMpKVxuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG4vLyBBZGRzIGEgbmV3IGNvbnN0cmFpbnQgdG8gYSBub2RlIGFuZCByZXR1cm5zIGl0LlxuLy8gQXJnczpcbi8vICAgbiAobm9kZSkgVGhlIG5vZGUgdG8gYWRkIHRoZSBjb25zdHJhaW50IHRvLiBSZXF1aXJlZC5cbi8vICAgdXBkYXRlVUkgKGJvb2xlYW4pIElmIHRydWUsIHVwZGF0ZSB0aGUgZGlzcGxheS4gSWYgZmFsc2Ugb3Igbm90IHNwZWNpZmllZCwgbm8gdXBkYXRlLlxuLy8gICBjIChjb25zdHJhaW50KSBJZiBnaXZlbiwgdXNlIHRoYXQgY29uc3RyYWludC4gT3RoZXJ3aXNlIGF1dG9nZW5lcmF0ZS5cbi8vIFJldHVybnM6XG4vLyAgIFRoZSBuZXcgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBhZGRDb25zdHJhaW50KG4sIHVwZGF0ZVVJLCBjKSB7XG4gICAgaWYgKGMpIHtcbiAgICAgICAgLy8ganVzdCB0byBiZSBzdXJlXG4gICAgICAgIGMubm9kZSA9IG47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgb3AgPSBPUElOREVYW24ucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIiA/IFwiPVwiIDogXCJMT09LVVBcIl07XG4gICAgICAgIGMgPSBuZXcgQ29uc3RyYWludCh7bm9kZTpuLCBvcDpvcC5vcCwgY3R5cGU6IG9wLmN0eXBlfSk7XG4gICAgfVxuICAgIG4uY29uc3RyYWludHMucHVzaChjKTtcbiAgICBuLnRlbXBsYXRlLndoZXJlLnB1c2goYyk7XG4gICAgaWYgKGMuY3R5cGUgIT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICBjLmNvZGUgPSBuZXh0QXZhaWxhYmxlQ29kZShuLnRlbXBsYXRlKTtcbiAgICAgICAgbi50ZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgICAgIHNldExvZ2ljRXhwcmVzc2lvbihuLnRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYywgbi50ZW1wbGF0ZSk7XG4gICAgfVxuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgfVxuICAgIC8vXG4gICAgcmV0dXJuIGM7XG59XG5cbi8vXG5mdW5jdGlvbiByZW1vdmVDb25zdHJhaW50KG4sIGMsIHVwZGF0ZVVJKXtcbiAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGN1cnJUZW1wbGF0ZS53aGVyZSA9IGN1cnJUZW1wbGF0ZS53aGVyZS5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgIGRlbGV0ZSBjdXJyVGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgIHNldExvZ2ljRXhwcmVzc2lvbihjdXJyVGVtcGxhdGUuY29uc3RyYWludExvZ2ljLCBjdXJyVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgaWYgKHVwZGF0ZVVJKSB7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG4vL1xuZnVuY3Rpb24gc2F2ZUNvbnN0cmFpbnRFZGl0cyhuLCBjKXtcbiAgICAvL1xuICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgYy5zZXRPcChvKTtcbiAgICBjLnNhdmVkID0gdHJ1ZTtcbiAgICAvL1xuICAgIGxldCB2YWwgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZTtcbiAgICBsZXQgdmFscyA9IFtdO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgIC5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB2YWxzLnB1c2godGhpcy52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgbGV0IHogPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJykuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG5cbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgYy50eXBlID0gdmFsc1swXVxuICAgICAgICBjLnZhbHVlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICBzZXRTdWJjbGFzc0NvbnN0cmFpbnQobiwgYy50eXBlKVxuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB2YWw7XG4gICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgYy5leHRyYVZhbHVlID0gdmFsc1swXSA9PT0gXCJBbnlcIiA/IG51bGwgOiB2YWxzWzBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBjLnZhbHVlID0gdmFsc1swXTtcbiAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB6ID8gdmFsc1swXSA6IHZhbDtcbiAgICAgICAgYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJVbmtub3duIGN0eXBlOiBcIitjLmN0eXBlO1xuICAgIH1cbiAgICBoaWRlQ29uc3RyYWludEVkaXRvcigpO1xuICAgIHVwZGF0ZShuKTtcbiAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgIHNhdmVTdGF0ZSgpO1xufVxuXG4vLyBPcGVucyBhIGRpYWxvZyBvbiB0aGUgc3BlY2lmaWVkIG5vZGUuXG4vLyBBbHNvIG1ha2VzIHRoYXQgbm9kZSB0aGUgY3VycmVudCBub2RlLlxuLy8gQXJnczpcbi8vICAgbiAgICB0aGUgbm9kZVxuLy8gICBlbHQgIHRoZSBET00gZWxlbWVudCAoZS5nLiBhIGNpcmNsZSlcbi8vIFJldHVybnNcbi8vICAgc3RyaW5nXG4vLyBTaWRlIGVmZmVjdDpcbi8vICAgc2V0cyBnbG9iYWwgY3Vyck5vZGVcbi8vXG5mdW5jdGlvbiBzaG93RGlhbG9nKG4sIGVsdCwgcmVmcmVzaE9ubHkpe1xuICBpZiAoIWVsdCkgZWx0ID0gZmluZERvbUJ5RGF0YU9iaihuKTtcbiAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiBcbiAgLy8gU2V0IHRoZSBnbG9iYWwgY3Vyck5vZGVcbiAgY3Vyck5vZGUgPSBuO1xuICB2YXIgaXNyb290ID0gISBjdXJyTm9kZS5wYXJlbnQ7XG4gIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIikuZGF0dW0obik7XG4gIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICB2YXIgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgZWJiID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgdmFyIGIgPSAoYmJiLmJvdHRvbSAtIGViYi5ib3R0b20pICsgZWJiLndpZHRoLzI7XG4gIHZhciBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICB2YXIgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAvLyBOQjogY2FuJ3QgZ2V0IG9wZW5pbmcgdXAgdG8gd29yaywgc28gaGFyZCB3aXJlIGl0IHRvIGRvd24uIDotXFxcblxuICAvL1xuICBkaWFsb2dcbiAgICAgIC5zdHlsZShcImxlZnRcIiwgbCtcInB4XCIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgLmNsYXNzZWQoXCJpc3Jvb3RcIiwgaXNyb290KVxuICAgICAgO1xuICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm0tb3JpZ2luXCIsIFwiMCUgMCVcIikgO1xuICBlbHNlXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gIC8vIFNldCB0aGUgZGlhbG9nIHRpdGxlIHRvIG5vZGUgbmFtZVxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgLnRleHQobi5uYW1lKTtcbiAgLy8gU2hvdyB0aGUgZnVsbCBwYXRoXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgIC50ZXh0KG4ucGF0aCk7XG4gIC8vIFR5cGUgYXQgdGhpcyBub2RlXG4gIHZhciB0cCA9IG4ucHR5cGUubmFtZSB8fCBuLnB0eXBlO1xuICB2YXIgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gIHZhciB0c3RyaW5nID0gc3RwICYmIGA8c3BhbiBzdHlsZT1cImNvbG9yOiBwdXJwbGU7XCI+JHtzdHB9PC9zcGFuPiAoJHt0cH0pYCB8fCB0cFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gIC8vIFdpcmUgdXAgYWRkIGNvbnN0cmFpbnQgYnV0dG9uXG4gIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBhZGRDb25zdHJhaW50KG4sIHRydWUpOyB9KTtcblxuICAvLyBGaWxsIG91dCB0aGUgY29uc3RyYWludHMgc2VjdGlvbi4gRmlyc3QsIHNlbGVjdCBhbGwgY29uc3RyYWludHMuXG4gIHZhciBjb25zdHJzID0gZGlhbG9nLnNlbGVjdChcIi5jb25zdHJhaW50U2VjdGlvblwiKVxuICAgICAgLnNlbGVjdEFsbChcIi5jb25zdHJhaW50XCIpXG4gICAgICAuZGF0YShuLmNvbnN0cmFpbnRzKTtcbiAgLy8gRW50ZXIoKTogY3JlYXRlIGRpdnMgZm9yIGVhY2ggY29uc3RyYWludCB0byBiZSBkaXNwbGF5ZWQgIChUT0RPOiB1c2UgYW4gSFRNTDUgdGVtcGxhdGUgaW5zdGVhZClcbiAgLy8gMS4gY29udGFpbmVyXG4gIHZhciBjZGl2cyA9IGNvbnN0cnMuZW50ZXIoKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsXCJjb25zdHJhaW50XCIpIDtcbiAgLy8gMi4gb3BlcmF0b3JcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwib3BcIikgO1xuICAvLyAzLiB2YWx1ZVxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJ2YWx1ZVwiKSA7XG4gIC8vIDQuIGNvbnN0cmFpbnQgY29kZVxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJjb2RlXCIpIDtcbiAgLy8gNS4gYnV0dG9uIHRvIGVkaXQgdGhpcyBjb25zdHJhaW50XG4gIGNkaXZzLmFwcGVuZChcImlcIikuYXR0cihcImNsYXNzXCIsIFwibWF0ZXJpYWwtaWNvbnMgZWRpdFwiKS50ZXh0KFwibW9kZV9lZGl0XCIpLmF0dHIoXCJ0aXRsZVwiLFwiRWRpdCB0aGlzIGNvbnN0cmFpbnRcIik7XG4gIC8vIDYuIGJ1dHRvbiB0byByZW1vdmUgdGhpcyBjb25zdHJhaW50XG4gIGNkaXZzLmFwcGVuZChcImlcIikuYXR0cihcImNsYXNzXCIsIFwibWF0ZXJpYWwtaWNvbnMgY2FuY2VsXCIpLnRleHQoXCJkZWxldGVfZm9yZXZlclwiKS5hdHRyKFwidGl0bGVcIixcIlJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcIik7XG5cbiAgLy8gUmVtb3ZlIGV4aXRpbmdcbiAgY29uc3Rycy5leGl0KCkucmVtb3ZlKCkgO1xuXG4gIC8vIFNldCB0aGUgdGV4dCBmb3IgZWFjaCBjb25zdHJhaW50XG4gIGNvbnN0cnNcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oYykgeyByZXR1cm4gXCJjb25zdHJhaW50IFwiICsgYy5jdHlwZTsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLmNvZGUgfHwgXCI/XCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJvcFwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMub3AgfHwgXCJJU0FcIjsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cInZhbHVlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpe1xuICAgICAgICAgIC8vIEZJWE1FIFxuICAgICAgICAgIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlICsgKGMuZXh0cmFWYWx1ZSA/IFwiIGluIFwiICsgYy5leHRyYVZhbHVlIDogXCJcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgfHwgKGMudmFsdWVzICYmIGMudmFsdWVzLmpvaW4oXCIsXCIpKSB8fCBjLnR5cGU7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmVkaXRcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGMpeyBcbiAgICAgICAgICBlZGl0Q29uc3RyYWludChjLCBuKTtcbiAgICAgIH0pO1xuICBjb25zdHJzLnNlbGVjdChcImkuY2FuY2VsXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgcmVtb3ZlQ29uc3RyYWludChuLCBjLCB0cnVlKTtcbiAgICAgICAgICBzYXZlU3RhdGUoKTtcbiAgICAgIH0pXG5cblxuICAvLyBUcmFuc2l0aW9uIHRvIFwiZ3Jvd1wiIHRoZSBkaWFsb2cgb3V0IG9mIHRoZSBub2RlXG4gIGRpYWxvZy50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMS4wKVwiKTtcblxuICAvL1xuICB2YXIgdCA9IG4ucGNvbXAudHlwZTtcbiAgaWYgKHR5cGVvZih0KSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgLy8gZGlhbG9nIGZvciBzaW1wbGUgYXR0cmlidXRlcy5cbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsdHJ1ZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlLm5hbWUgfHwgbi5wY29tcC50eXBlICk7XG4gICAgICAvLyBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic2VsZWN0LWN0cmxcIl0nKVxuICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24obil7IHJldHVybiBuLmlzU2VsZWN0ZWQgfSk7XG4gICAgICAvLyBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic29ydC1jdHJsXCJdJylcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRhc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImFzY1wiKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIERpYWxvZyBmb3IgY2xhc3Nlc1xuICAgICAgZGlhbG9nXG4gICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIixmYWxzZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlID8gbi5wY29tcC50eXBlLm5hbWUgOiBuLnBjb21wLm5hbWUpO1xuXG4gICAgICAvLyB3aXJlIHVwIHRoZSBidXR0b24gdG8gc2hvdyBzdW1tYXJ5IGZpZWxkc1xuICAgICAgZGlhbG9nLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNob3dTdW1tYXJ5XCJdJylcbiAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwic3VtbWFyeWZpZWxkc1wiKSk7XG5cbiAgICAgIC8vIEZpbGwgaW4gdGhlIHRhYmxlIGxpc3RpbmcgYWxsIHRoZSBhdHRyaWJ1dGVzL3JlZnMvY29sbGVjdGlvbnMuXG4gICAgICB2YXIgdGJsID0gZGlhbG9nLnNlbGVjdChcInRhYmxlLmF0dHJpYnV0ZXNcIik7XG4gICAgICB2YXIgcm93cyA9IHRibC5zZWxlY3RBbGwoXCJ0clwiKVxuICAgICAgICAgIC5kYXRhKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5hbGxQYXJ0cylcbiAgICAgICAgICA7XG4gICAgICByb3dzLmVudGVyKCkuYXBwZW5kKFwidHJcIik7XG4gICAgICByb3dzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIHZhciBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAuZGF0YShmdW5jdGlvbihjb21wKSB7XG4gICAgICAgICAgICAgIGlmIChjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJTZWxlY3QgdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdzZWxlY3RzaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzZWxlY3RlZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJDb25zdHJhaW4gdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdjb25zdHJhaW5zaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJjb25zdHJhaW5lZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJGb2xsb3cgdGhpcyAke2NvbXAua2luZH1cIj5wbGF5X2Fycm93PC9pPmAsXG4gICAgICAgICAgICAgICAgICBjbHM6ICdvcGVubmV4dCcsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcIm9wZW5cIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIDtcbiAgICAgIGNlbGxzLmVudGVyKCkuYXBwZW5kKFwidGRcIik7XG4gICAgICBjZWxsc1xuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuY2xzO30pXG4gICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5jbGljayAmJiBkLmNsaWNrKCk7IH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZXhpdCgpLnJlbW92ZSgpO1xuICB9XG59XG5cbi8vIEhpZGVzIHRoZSBkaWFsb2cuIFNldHMgdGhlIGN1cnJlbnQgbm9kZSB0byBudWxsLlxuLy8gQXJnczpcbi8vICAgbm9uZVxuLy8gUmV0dXJuc1xuLy8gIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICBIaWRlcyB0aGUgZGlhbG9nLlxuLy8gIFNldHMgY3Vyck5vZGUgdG8gbnVsbC5cbi8vXG5mdW5jdGlvbiBoaWRlRGlhbG9nKCl7XG4gIGN1cnJOb2RlID0gbnVsbDtcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIHRydWUpXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24vMilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMWUtNilcIilcbiAgICAgIDtcbiAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgIC5jbGFzc2VkKFwib3BlblwiLCBudWxsKVxuICAgICAgO1xufVxuXG4vLyBTZXQgdGhlIGVkaXRpbmcgdmlldy4gVmlldyBpcyBvbmUgb2Y6XG4vLyBBcmdzOlxuLy8gICAgIHZpZXcgKHN0cmluZykgT25lIG9mOiBxdWVyeU1haW4sIGNvbnN0cmFpbnRMb2dpYywgY29sdW1uT3JkZXIsIHNvcnRPcmRlclxuLy8gUmV0dXJuczpcbi8vICAgICBOb3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgICAgQ2hhbmdlcyB0aGUgbGF5b3V0IGFuZCB1cGRhdGVzIHRoZSB2aWV3LlxuZnVuY3Rpb24gc2V0RWRpdFZpZXcodmlldyl7XG4gICAgbGV0IHYgPSBlZGl0Vmlld3Nbdmlld107XG4gICAgaWYgKCF2KSB0aHJvdyBcIlVucmVjb2duaXplZCB2aWV3IHR5cGU6IFwiICsgdmlldztcbiAgICBlZGl0VmlldyA9IHY7XG4gICAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgdi5uYW1lKTtcbiAgICB1cGRhdGUocm9vdCk7XG59XG5cbmZ1bmN0aW9uIGRvTGF5b3V0KHJvb3Qpe1xuICB2YXIgbGF5b3V0O1xuICBsZXQgbGVhdmVzID0gW107XG4gIFxuICBpZiAoZWRpdFZpZXcubGF5b3V0U3R5bGUgPT09IFwidHJlZVwiKSB7XG4gICAgICAvLyBkMyBsYXlvdXQgYXJyYW5nZXMgbm9kZXMgdG9wLXRvLWJvdHRvbSwgYnV0IHdlIHdhbnQgbGVmdC10by1yaWdodC5cbiAgICAgIC8vIFNvLi4ucmV2ZXJzZSB3aWR0aCBhbmQgaGVpZ2h0LCBhbmQgZG8gdGhlIGxheW91dC4gVGhlbiwgcmV2ZXJzZSB0aGUgeCx5IGNvb3JkcyBpbiB0aGUgcmVzdWx0cy5cbiAgICAgIGxheW91dCA9IGQzLmxheW91dC50cmVlKCkuc2l6ZShbaCwgd10pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICAvLyBSZXZlcnNlIHggYW5kIHkuIEFsc28sIG5vcm1hbGl6ZSB4IGZvciBmaXhlZC1kZXB0aC5cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wO1xuICAgICAgICAgIGQueCA9IGQuZGVwdGggKiAxODA7XG4gICAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIGRlbmRyb2dyYW1cbiAgICAgIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgbGVhdmVzLnB1c2gobik7XG4gICAgICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gICAgICB9O1xuICAgICAgbGV0IG1heGQgPSBtZChyb290KTsgLy8gbWF4IGRlcHRoLCAxLWJhc2VkXG4gICAgICBsYXlvdXQgPSBkMy5sYXlvdXQuY2x1c3RlcigpXG4gICAgICAgICAgLnNlcGFyYXRpb24oKGEsYikgPT4gMSlcbiAgICAgICAgICAuc2l6ZShbaCwgbWF4ZCAqIDE4MF0pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICBub2Rlcy5mb3JFYWNoKCBkID0+IHsgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7IH0pO1xuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFJlYXJyYW5nZSB5LXBvc2l0aW9ucyBvZiBsZWFmIG5vZGVzLiBcbiAgICAgIGxldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB5OiBuLnksIHkwOiBuLnkwIH07IH0pO1xuXG4gICAgICBsZWF2ZXMuc29ydChlZGl0Vmlldy5ub2RlQ29tcCk7XG5cbiAgICAgIC8vIHJlYXNzaWduIHRoZSBZIHBvc2l0aW9uc1xuICAgICAgbGVhdmVzLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgICAgbi55ID0gcG9zW2ldLnk7XG4gICAgICAgICAgbi55MCA9IHBvc1tpXS55MDtcbiAgICAgIH0pO1xuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbGVhdmVzIGhhdmUgYmVlbiByZWFycmFuZ2VkLCBidXQgdGhlIGludGVyaW9yIG5vZGVzIGhhdmVuJ3QuXG4gICAgICAvLyBIZXIgd2UgbW92ZSBpbnRlcmlvciBub2RlcyB0b3dhcmQgdGhlaXIgXCJjZW50ZXIgb2YgZ3Jhdml0eVwiIGFzIGRlZmluZWRcbiAgICAgIC8vIGJ5IHRoZSBwb3NpdGlvbnMgb2YgdGhlaXIgY2hpbGRyZW4uIEFwcGx5IHRoaXMgcmVjdXJzaXZlbHkgdXAgdGhlIHRyZWUuXG4gICAgICAvLyBcbiAgICAgIC8vIE5PVEUgdGhhdCB4IGFuZCB5IGNvb3JkaW5hdGVzIGFyZSBvcHBvc2l0ZSBhdCB0aGlzIHBvaW50IVxuICAgICAgLy9cbiAgICAgIC8vIE1haW50YWluIGEgbWFwIG9mIG9jY3VwaWVkIHBvc2l0aW9uczpcbiAgICAgIGxldCBvY2N1cGllZCA9IHt9IDsgIC8vIG9jY3VwaWVkW3ggcG9zaXRpb25dID09IFtsaXN0IG9mIG5vZGVzXVxuICAgICAgZnVuY3Rpb24gY29nIChuKSB7XG4gICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAvLyBjb21wdXRlIG15IGMuby5nLiBhcyB0aGUgYXZlcmFnZSBvZiBteSBraWRzJyBwb3NpdGlvbnNcbiAgICAgICAgICAgICAgbGV0IG15Q29nID0gKG4uY2hpbGRyZW4ubWFwKGNvZykucmVkdWNlKCh0LGMpID0+IHQrYywgMCkpL24uY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICBpZihuLnBhcmVudCkgbi55ID0gbXlDb2c7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBkZCA9IG9jY3VwaWVkW24ueV0gPSAob2NjdXBpZWRbbi55XSB8fCBbXSk7XG4gICAgICAgICAgZGQucHVzaChuLnkpO1xuICAgICAgICAgIHJldHVybiBuLnk7XG4gICAgICB9XG4gICAgICBjb2cocm9vdCk7XG5cbiAgICAgIC8vIFRPRE86IEZpbmFsIGFkanVzdG1lbnRzXG4gICAgICAvLyAxLiBJZiB3ZSBleHRlbmQgb2ZmIHRoZSByaWdodCBlZGdlLCBjb21wcmVzcy5cbiAgICAgIC8vIDIuIElmIGl0ZW1zIGF0IHNhbWUgeCBvdmVybGFwLCBzcHJlYWQgdGhlbSBvdXQgaW4geS5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB9XG5cbiAgLy8gc2F2ZSBsaW5rcyBpbiBnbG9iYWxcbiAgbGlua3MgPSBsYXlvdXQubGlua3Mobm9kZXMpO1xuXG4gIHJldHVybiBbbm9kZXMsIGxpbmtzXVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gdXBkYXRlKG4pIFxuLy8gVGhlIG1haW4gZHJhd2luZyByb3V0aW5lLiBcbi8vIFVwZGF0ZXMgdGhlIFNWRywgdXNpbmcgbiBhcyB0aGUgc291cmNlIG9mIGFueSBlbnRlcmluZy9leGl0aW5nIGFuaW1hdGlvbnMuXG4vL1xuZnVuY3Rpb24gdXBkYXRlKHNvdXJjZSkge1xuICAvL1xuICBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyXCIpLmF0dHIoXCJjbGFzc1wiLCBlZGl0Vmlldy5uYW1lKTtcblxuICAvL1xuICBkb0xheW91dChyb290KTtcbiAgdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSk7XG4gIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpO1xuICB1cGRhdGVUdGV4dCgpO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSl7XG4gIGxldCBub2RlR3JwcyA9IHZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgO1xuXG4gIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAuYXR0cihcImlkXCIsIG4gPT4gbi5wYXRoLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54MCArIFwiLFwiICsgc291cmNlLnkwICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICBub2RlRW50ZXIuYXBwZW5kKGZ1bmN0aW9uKGQpe1xuICAgICAgdmFyIHNoYXBlID0gKGQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiID8gXCJyZWN0XCIgOiBcImNpcmNsZVwiKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgfSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuOyBcbiAgICAgICAgICBpZiAoY3Vyck5vZGUgIT09IGQpIHNob3dEaWFsb2coZCwgdGhpcyk7XG4gICAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9KTtcbiAgbm9kZUVudGVyLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcbiAgbm9kZUVudGVyLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieFwiLCAtOC41KVxuICAgICAgLmF0dHIoXCJ5XCIsIC04LjUpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgIDtcblxuICAvLyBBZGQgdGV4dCBmb3Igbm9kZSBuYW1lXG4gIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuY2hpbGRyZW4gPyAtMTAgOiAxMDsgfSlcbiAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBuZWFybHkgdHJhbnNwYXJlbnRcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVOYW1lXCIpXG4gICAgICA7XG5cbiAgLy8gUGxhY2Vob2xkZXIgZm9yIGljb24vdGV4dCB0byBhcHBlYXIgaW5zaWRlIG5vZGVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cignY2xhc3MnLCAnbm9kZUljb24nKVxuICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgIDtcblxuICAvLyBBZGQgbm9kZSBoYW5kbGVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cignY2xhc3MnLCAnaGFuZGxlJylcbiAgICAgIC5hdHRyKCdkeCcsIDEwKVxuICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgIDtcblxuICBsZXQgbm9kZVVwZGF0ZSA9IG5vZGVHcnBzXG4gICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIG4gPT4gbi5pc1NlbGVjdGVkKVxuICAgICAgLmNsYXNzZWQoXCJjb25zdHJhaW5lZFwiLCBuID0+IG4uY29uc3RyYWludHMubGVuZ3RoID4gMClcbiAgICAgIC5jbGFzc2VkKFwic29ydGVkXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5sZXZlbCA+PSAwKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRhc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImFzY1wiKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRkZXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJkZXNjXCIpXG4gICAgLy8gVHJhbnNpdGlvbiBub2RlcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24obikgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBuLnggKyBcIixcIiArIG4ueSArIFwiKVwiOyB9KVxuICAgICAgO1xuXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5oYW5kbGVcIilcbiAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIGVkaXRWaWV3LmhhbmRsZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgLnRleHQoZWRpdFZpZXcuaGFuZGxlSWNvbi50ZXh0IHx8IFwiXCIpIFxuICAgICAgLmF0dHIoXCJzdHJva2VcIiwgZWRpdFZpZXcuaGFuZGxlSWNvbi5zdHJva2UgfHwgbnVsbClcbiAgICAgIC5hdHRyKFwiZmlsbFwiLCBlZGl0Vmlldy5oYW5kbGVJY29uLmZpbGwgfHwgbnVsbCk7XG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5ub2RlSWNvblwiKVxuICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgZWRpdFZpZXcubm9kZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgLnRleHQoZWRpdFZpZXcubm9kZUljb24udGV4dCB8fCBcIlwiKSA7XG5cbiAgbm9kZVVwZGF0ZS5zZWxlY3RBbGwoXCJ0ZXh0Lm5vZGVOYW1lXCIpXG4gICAgICAudGV4dChuID0+IG4ubmFtZSk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gTWFrZSBzZWxlY3RlZCBub2RlcyBkcmFnZ2FibGUuXG4gIC8vIENsZWFyIG91dCBhbGwgZXhpdGluZyBkcmFnIGhhbmRsZXJzXG4gIGQzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCBmYWxzZSlcbiAgICAgIC5vbihcIi5kcmFnXCIsIG51bGwpOyBcbiAgLy8gTm93IG1ha2UgZXZlcnl0aGluZyBkcmFnZ2FibGUgdGhhdCBzaG91bGQgYmVcbiAgaWYgKGVkaXRWaWV3LmRyYWdnYWJsZSlcbiAgICAgIGQzLnNlbGVjdEFsbChlZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgdHJ1ZSlcbiAgICAgICAgICAuY2FsbChkcmFnQmVoYXZpb3IpO1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEFkZCB0ZXh0IGZvciBjb25zdHJhaW50c1xuICBsZXQgY3QgPSBub2RlR3Jwcy5zZWxlY3RBbGwoXCJ0ZXh0LmNvbnN0cmFpbnRcIilcbiAgICAgIC5kYXRhKGZ1bmN0aW9uKG4peyByZXR1cm4gbi5jb25zdHJhaW50czsgfSk7XG4gIGN0LmVudGVyKCkuYXBwZW5kKFwic3ZnOnRleHRcIikuYXR0cihcImNsYXNzXCIsIFwiY29uc3RyYWludFwiKTtcbiAgY3QuZXhpdCgpLnJlbW92ZSgpO1xuICBjdC50ZXh0KCBjID0+IGNvbnN0cmFpbnRUZXh0KGMpIClcbiAgICAgICAuYXR0cihcInhcIiwgMClcbiAgICAgICAuYXR0cihcImR5XCIsIChjLGkpID0+IGAkeyhpKzEpKjEuN31lbWApXG4gICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLFwic3RhcnRcIilcbiAgICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIGZ1bGwgc2l6ZVxuICBub2RlVXBkYXRlLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDguNSApXG4gICAgICA7XG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxNyApXG4gICAgICAuYXR0cihcImhlaWdodFwiLCAxNyApXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIGZ1bGx5IG9wYXF1ZVxuICBub2RlVXBkYXRlLnNlbGVjdChcInRleHRcIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxKVxuICAgICAgO1xuXG4gIC8vXG4gIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICBsZXQgbm9kZUV4aXQgPSBub2RlR3Jwcy5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54ICsgXCIsXCIgKyBzb3VyY2UueSArIFwiKVwiOyB9KVxuICAgICAgLnJlbW92ZSgpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIHRpbnkgcmFkaXVzXG4gIG5vZGVFeGl0LnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpXG4gICAgICA7XG5cbiAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIHRyYW5zcGFyZW50XG4gIG5vZGVFeGl0LnNlbGVjdChcInRleHRcIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KVxuICAgICAgO1xuICAvLyBTdGFzaCB0aGUgb2xkIHBvc2l0aW9ucyBmb3IgdHJhbnNpdGlvbi5cbiAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgZC54MCA9IGQueDtcbiAgICBkLnkwID0gZC55O1xuICB9KTtcbiAgLy9cblxufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTGlua3MobGlua3MsIHNvdXJjZSkge1xuICBsZXQgbGluayA9IHZpcy5zZWxlY3RBbGwoXCJwYXRoLmxpbmtcIilcbiAgICAgIC5kYXRhKGxpbmtzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC5pZDsgfSlcbiAgICAgIDtcblxuICAvLyBFbnRlciBhbnkgbmV3IGxpbmtzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cbiAgbGV0IG5ld1BhdGhzID0gbGluay5lbnRlcigpLmluc2VydChcInN2ZzpwYXRoXCIsIFwiZ1wiKTtcbiAgbGV0IGxpbmtUaXRsZSA9IGZ1bmN0aW9uKGwpe1xuICAgICAgbGV0IGNsaWNrID0gXCJcIjtcbiAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kICE9PSBcImF0dHJpYnV0ZVwiKXtcbiAgICAgICAgICBjbGljayA9IGBDbGljayB0byBtYWtlIHRoaXMgcmVsYXRpb25zaGlwICR7bC50YXJnZXQuam9pbiA/IFwiUkVRVUlSRURcIiA6IFwiT1BUSU9OQUxcIn0uIGA7XG4gICAgICB9XG4gICAgICBsZXQgYWx0Y2xpY2sgPSBcIkFsdC1jbGljayB0byBjdXQgbGluay5cIjtcbiAgICAgIHJldHVybiBjbGljayArIGFsdGNsaWNrO1xuICB9XG4gIC8vIHNldCB0aGUgdG9vbHRpcFxuICBuZXdQYXRocy5hcHBlbmQoXCJzdmc6dGl0bGVcIikudGV4dChsaW5rVGl0bGUpO1xuICBuZXdQYXRoc1xuICAgICAgLmF0dHIoXCJ0YXJnZXRcIiwgZCA9PiBkLnRhcmdldC5pZC5yZXBsYWNlKC9cXC4vZywgXCJfXCIpKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIilcbiAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHNvdXJjZS54MCwgeTogc291cmNlLnkwfTtcbiAgICAgICAgcmV0dXJuIGRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgfSlcbiAgICAgIC5jbGFzc2VkKFwiYXR0cmlidXRlXCIsIGZ1bmN0aW9uKGwpIHsgcmV0dXJuIGwudGFyZ2V0LnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCI7IH0pXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihsKXsgXG4gICAgICAgICAgaWYgKGQzLmV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICAvLyBhIHNoaWZ0LWNsaWNrIGN1dHMgdGhlIHRyZWUgYXQgdGhpcyBlZGdlXG4gICAgICAgICAgICAgIHJlbW92ZU5vZGUobC50YXJnZXQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiKSByZXR1cm47XG4gICAgICAgICAgICAgIC8vIHJlZ3VsYXIgY2xpY2sgb24gYSByZWxhdGlvbnNoaXAgZWRnZSBpbnZlcnRzIHdoZXRoZXJcbiAgICAgICAgICAgICAgLy8gdGhlIGpvaW4gaXMgaW5uZXIgb3Igb3V0ZXIuIFxuICAgICAgICAgICAgICBsLnRhcmdldC5qb2luID0gKGwudGFyZ2V0LmpvaW4gPyBudWxsIDogXCJvdXRlclwiKTtcbiAgICAgICAgICAgICAgLy8gcmUtc2V0IHRoZSB0b29sdGlwXG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJ0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICAgICAgICAgIHVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgICAgIHNhdmVTdGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoXCJkXCIsIGRpYWdvbmFsKVxuICAgICAgO1xuIFxuICBcbiAgLy8gVHJhbnNpdGlvbiBsaW5rcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gIGxpbmsuY2xhc3NlZChcIm91dGVyXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4udGFyZ2V0LmpvaW4gPT09IFwib3V0ZXJcIjsgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGluay5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgbyA9IHt4OiBzb3VyY2UueCwgeTogc291cmNlLnl9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLnJlbW92ZSgpXG4gICAgICA7XG5cbn1cbi8vXG4vLyBGdW5jdGlvbiB0byBlc2NhcGUgJzwnICdcIicgYW5kICcmJyBjaGFyYWN0ZXJzXG5mdW5jdGlvbiBlc2Mocyl7XG4gICAgaWYgKCFzKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIik7IFxufVxuXG4vLyBUdXJucyBhIGpzb24gcmVwcmVzZW50YXRpb24gb2YgYSB0ZW1wbGF0ZSBpbnRvIFhNTCwgc3VpdGFibGUgZm9yIGltcG9ydGluZyBpbnRvIHRoZSBJbnRlcm1pbmUgUUIuXG5mdW5jdGlvbiBqc29uMnhtbCh0LCBxb25seSl7XG4gICAgdmFyIHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7IFxuICAgICAgICB2YXIgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICB2YXIgdiA9IHhba11cbiAgICAgICAgcmV0dXJuIHMgKyBgJHtrfSAke3Z9IGA7XG4gICAgfSwgXCJcIik7XG5cbiAgICAvLyBDb252ZXJ0cyBhbiBvdXRlciBqb2luIHBhdGggdG8geG1sLlxuICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICB9XG5cbiAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgIHZhciBxcGFydCA9IFxuYDxxdWVyeVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgbW9kZWw9XCIkeyh0Lm1vZGVsICYmIHQubW9kZWwubmFtZSkgfHwgJyd9XCJcbiAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gIHNvcnRPcmRlcj1cIiR7c28gfHwgJyd9XCJcbiAgJHt0LmNvbnN0cmFpbnRMb2dpYyAmJiAnY29uc3RyYWludExvZ2ljPVwiJyt0LmNvbnN0cmFpbnRMb2dpYysnXCInIHx8ICcnfVxuPlxuICAkeyh0LmpvaW5zIHx8IFtdKS5tYXAob2oyeG1sKS5qb2luKFwiIFwiKX1cbiAgJHsodC53aGVyZSB8fCBbXSkubWFwKGMgPT4gYy5jMnhtbChxb25seSkpLmpvaW4oXCIgXCIpfVxuPC9xdWVyeT5gO1xuICAgIC8vIHRoZSB3aG9sZSB0ZW1wbGF0ZVxuICAgIHZhciB0bXBsdCA9IFxuYDx0ZW1wbGF0ZVxuICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgdGl0bGU9XCIke2VzYyh0LnRpdGxlIHx8ICcnKX1cIlxuICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAke3FwYXJ0fVxuPC90ZW1wbGF0ZT5cbmA7XG4gICAgcmV0dXJuIHFvbmx5ID8gcXBhcnQgOiB0bXBsdFxufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlVHRleHQoKXtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQ7XG4gIC8vXG4gIGxldCB0aXRsZSA9IHZpcy5zZWxlY3RBbGwoXCIjcXRpdGxlXCIpXG4gICAgICAuZGF0YShbcm9vdC50ZW1wbGF0ZS50aXRsZV0pO1xuICB0aXRsZS5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKFwiaWRcIixcInF0aXRsZVwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIC00MClcbiAgICAgIC5hdHRyKFwieVwiLCAxNSlcbiAgICAgIDtcbiAgdGl0bGUuaHRtbCh0ID0+IHtcbiAgICAgIGxldCBwYXJ0cyA9IHQuc3BsaXQoLygtLT4pLyk7XG4gICAgICByZXR1cm4gcGFydHMubWFwKChwLGkpID0+IHtcbiAgICAgICAgICBpZiAocCA9PT0gXCItLT5cIikgXG4gICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9MTAgZm9udC1mYW1pbHk9XCJNYXRlcmlhbCBJY29uc1wiPiR7Y29kZXBvaW50c1snZm9yd2FyZCddfTwvdHNwYW4+YFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGA8dHNwYW4geT00PiR7cH08L3RzcGFuPmBcbiAgICAgIH0pLmpvaW4oXCJcIik7XG4gIH0pO1xuXG4gIC8vXG4gIGlmKCBkMy5zZWxlY3QoXCIjdHRleHRcIikuY2xhc3NlZChcImpzb25cIikgKVxuICAgICAgdHh0ID0gSlNPTi5zdHJpbmdpZnkodWN0LCBudWxsLCAyKTtcbiAgZWxzZVxuICAgICAgdHh0ID0ganNvbjJ4bWwodWN0KTtcbiAgZDMuc2VsZWN0KFwiI3R0ZXh0ZGl2XCIpIFxuICAgICAgLnRleHQodHh0KVxuICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCB0cnVlKTtcbiAgICAgICAgICBzZWxlY3RUZXh0KFwidHRleHRkaXZcIik7XG4gICAgICB9KVxuICAgICAgLm9uKFwiYmx1clwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBkMy5zZWxlY3QoXCIjZHJhd2VyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgLy9cbiAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgIHVwZGF0ZUNvdW50KCk7XG59XG5cbmZ1bmN0aW9uIHJ1bmF0bWluZSgpIHtcbiAgbGV0IHVjdCA9IHVuY29tcGlsZVRlbXBsYXRlKGN1cnJUZW1wbGF0ZSk7XG4gIGxldCB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gIGxldCBsaW5rdXJsID0gY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KCl7XG4gIGxldCB1Y3QgPSB1bmNvbXBpbGVUZW1wbGF0ZShjdXJyVGVtcGxhdGUpO1xuICBsZXQgcXR4dCA9IGpzb24yeG1sKHVjdCwgdHJ1ZSk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gIGxldCBjb3VudFVybCA9IGN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gIGQzanNvblByb21pc2UoY291bnRVcmwpXG4gICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCBzcGFuJykudGV4dChuKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIHRydWUpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgIH0pO1xufVxuXG4vLyBUaGUgY2FsbCB0aGF0IGdldHMgaXQgYWxsIGdvaW5nLi4uXG5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBDb25zdHJhaW50cyBvbiBhdHRyaWJ1dGVzOlxuLy8gLSB2YWx1ZSAoY29tcGFyaW5nIGFuIGF0dHJpYnV0ZSB0byBhIHZhbHVlLCB1c2luZyBhbiBvcGVyYXRvcilcbi8vICAgICAgPiA+PSA8IDw9ID0gIT0gTElLRSBOT1QtTElLRSBDT05UQUlOUyBET0VTLU5PVC1DT05UQUlOXG4vLyAtIG11bHRpdmFsdWUgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgbXVsdGlwbGUgdmFsdWUpXG4vLyAgICAgIE9ORS1PRiBOT1QtT05FIE9GXG4vLyAtIHJhbmdlIChzdWJ0eXBlIG9mIG11bHRpdmFsdWUsIGZvciBjb29yZGluYXRlIHJhbmdlcylcbi8vICAgICAgV0lUSElOIE9VVFNJREUgT1ZFUkxBUFMgRE9FUy1OT1QtT1ZFUkxBUFxuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwpXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vXG4vLyBDb25zdHJhaW50cyBvbiByZWZlcmVuY2VzL2NvbGxlY3Rpb25zXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTCByZWYvZW1wdHkgY29sbGVjdGlvbilcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy8gLSBsb29rdXAgKFxuLy8gICAgICBMT09LVVBcbi8vIC0gc3ViY2xhc3Ncbi8vICAgICAgSVNBXG4vLyAtIGxpc3Rcbi8vICAgICAgSU4gTk9ULUlOXG4vLyAtIGxvb3AgKFRPRE8pXG5cbnZhciBOVU1FUklDVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCJcbl07XG5cbnZhciBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbnZhciBMRUFGVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiLFxuICAgIFwiamF2YS5sYW5nLk9iamVjdFwiLFxuICAgIFwiT2JqZWN0XCJcbl1cblxuXG52YXIgT1BTID0gW1xuXG4gICAgLy8gVmFsaWQgZm9yIGFueSBhdHRyaWJ1dGVcbiAgICAvLyBBbHNvIHRoZSBvcGVyYXRvcnMgZm9yIGxvb3AgY29uc3RyYWludHMgKG5vdCB5ZXQgaW1wbGVtZW50ZWQpLlxuICAgIHtcbiAgICBvcDogXCI9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0se1xuICAgIG9wOiBcIiE9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIG51bWVyaWMgYW5kIGRhdGUgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCI+XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI+PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPFwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPD1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIHN0cmluZyBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIkNPTlRBSU5TXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG5cbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBDT05UQUlOXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgZm9yIExvY2F0aW9uIG5vZGVzXG4gICAge1xuICAgIG9wOiBcIldJVEhJTlwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVkVSTEFQU1wiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBPVkVSTEFQXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9VVFNJREVcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSxcbiBcbiAgICAvLyBOVUxMIGNvbnN0cmFpbnRzLiBWYWxpZCBmb3IgYW55IG5vZGUgZXhjZXB0IHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiSVMgTk9UIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgKGkuZS4sIHRoZSByb290LCBvciBhbnkgXG4gICAgLy8gcmVmZXJlbmNlIG9yIGNvbGxlY3Rpb24gbm9kZSkuXG4gICAge1xuICAgIG9wOiBcIkxPT0tVUFwiLFxuICAgIGN0eXBlOiBcImxvb2t1cFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIElOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgZXhjZXB0IHRoZSByb290LlxuICAgIHtcbiAgICBvcDogXCJJU0FcIixcbiAgICBjdHlwZTogXCJzdWJjbGFzc1wiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfV07XG4vL1xudmFyIE9QSU5ERVggPSBPUFMucmVkdWNlKGZ1bmN0aW9uKHgsbyl7XG4gICAgeFtvLm9wXSA9IG87XG4gICAgcmV0dXJuIHg7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0geyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9vcHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG4vLyBQcm9taXNpZmllcyBhIGNhbGwgdG8gZDMuanNvbi5cbi8vIEFyZ3M6XG4vLyAgIHVybCAoc3RyaW5nKSBUaGUgdXJsIG9mIHRoZSBqc29uIHJlc291cmNlXG4vLyBSZXR1cm5zOlxuLy8gICBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUganNvbiBvYmplY3QgdmFsdWUsIG9yIHJlamVjdHMgd2l0aCBhbiBlcnJvclxuZnVuY3Rpb24gZDNqc29uUHJvbWlzZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGQzLmpzb24odXJsLCBmdW5jdGlvbihlcnJvciwganNvbil7XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdCh7IHN0YXR1czogZXJyb3Iuc3RhdHVzLCBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0fSkgOiByZXNvbHZlKGpzb24pO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG4vLyBTZWxlY3RzIGFsbCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLiBcbi8vIFRoZSBjb250YWluZXIgbXVzdCBoYXZlIGFuIGlkLlxuLy8gQ29waWVkIGZyb206XG4vLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjc3NDUxL2hvdy10by1zZWxlY3QtZGl2LXRleHQtb24tYnV0dG9uLWNsaWNrXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGNvbnRhaW5lcmlkKSB7XG4gICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICByYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59XG5cbi8vIENvbnZlcnRzIGFuIEludGVyTWluZSBxdWVyeSBpbiBQYXRoUXVlcnkgWE1MIGZvcm1hdCB0byBhIEpTT04gb2JqZWN0IHJlcHJlc2VudGF0aW9uLlxuLy9cbmZ1bmN0aW9uIHBhcnNlUGF0aFF1ZXJ5KHhtbCl7XG4gICAgLy8gVHVybnMgdGhlIHF1YXNpLWxpc3Qgb2JqZWN0IHJldHVybmVkIGJ5IHNvbWUgRE9NIG1ldGhvZHMgaW50byBhY3R1YWwgbGlzdHMuXG4gICAgZnVuY3Rpb24gZG9tbGlzdDJhcnJheShsc3QpIHtcbiAgICAgICAgbGV0IGEgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8bHN0Lmxlbmd0aDsgaSsrKSBhLnB1c2gobHN0W2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIC8vIHBhcnNlIHRoZSBYTUxcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBkb20gPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgXCJ0ZXh0L3htbFwiKTtcblxuICAgIC8vIGdldCB0aGUgcGFydHMuIFVzZXIgbWF5IHBhc3RlIGluIGEgPHRlbXBsYXRlPiBvciBhIDxxdWVyeT5cbiAgICAvLyAoaS5lLiwgdGVtcGxhdGUgbWF5IGJlIG51bGwpXG4gICAgbGV0IHRlbXBsYXRlID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IHRpdGxlID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikgfHwgXCJcIjtcbiAgICBsZXQgY29tbWVudCA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcImNvbW1lbnRcIikgfHwgXCJcIjtcbiAgICBsZXQgcXVlcnkgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJxdWVyeVwiKVswXTtcbiAgICBsZXQgbW9kZWwgPSB7IG5hbWU6IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm1vZGVsXCIpIHx8IFwiZ2Vub21pY1wiIH07XG4gICAgbGV0IG5hbWUgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpIHx8IFwiXCI7XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibG9uZ0Rlc2NyaXRpb25cIikgfHwgXCJcIjtcbiAgICBsZXQgc2VsZWN0ID0gKHF1ZXJ5LmdldEF0dHJpYnV0ZShcInZpZXdcIikgfHwgXCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgbGV0IGNvbnN0cmFpbnRzID0gZG9tbGlzdDJhcnJheShkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnN0cmFpbnQnKSk7XG4gICAgbGV0IGNvbnN0cmFpbnRMb2dpYyA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImNvbnN0cmFpbnRMb2dpY1wiKTtcbiAgICBsZXQgam9pbnMgPSBkb21saXN0MmFycmF5KHF1ZXJ5LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiam9pblwiKSk7XG4gICAgbGV0IHNvcnRPcmRlciA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKSB8fCBcIlwiO1xuICAgIC8vXG4gICAgLy9cbiAgICBsZXQgd2hlcmUgPSBjb25zdHJhaW50cy5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgb3AgPSBjLmdldEF0dHJpYnV0ZShcIm9wXCIpO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjLmdldEF0dHJpYnV0ZShcInR5cGVcIik7XG4gICAgICAgICAgICAgICAgb3AgPSBcIklTQVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbHMgPSBkb21saXN0MmFycmF5KGMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ2YWx1ZVwiKSkubWFwKCB2ID0+IHYuaW5uZXJIVE1MICk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjLmdldEF0dHJpYnV0ZShcInBhdGhcIiksXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA6IHZhbHMsXG4gICAgICAgICAgICAgICAgdHlwZSA6IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjLmdldEF0dHJpYnV0ZShcImNvZGVcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGU6IGMuZ2V0QXR0cmlidXRlKFwiZWRpdGFibGVcIikgfHwgXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAvLyBDaGVjazogaWYgdGhlcmUgaXMgb25seSBvbmUgY29uc3RyYWludCwgKGFuZCBpdCdzIG5vdCBhbiBJU0EpLCBzb21ldGltZXMgdGhlIGNvbnN0cmFpbnRMb2dpYyBcbiAgICAvLyBhbmQvb3IgdGhlIGNvbnN0cmFpbnQgY29kZSBhcmUgbWlzc2luZy5cbiAgICBpZiAod2hlcmUubGVuZ3RoID09PSAxICYmIHdoZXJlWzBdLm9wICE9PSBcIklTQVwiICYmICF3aGVyZVswXS5jb2RlKXtcbiAgICAgICAgd2hlcmVbMF0uY29kZSA9IGNvbnN0cmFpbnRMb2dpYyA9IFwiQVwiO1xuICAgIH1cblxuICAgIC8vIG91dGVyIGpvaW5zLiBUaGV5IGxvb2sgbGlrZSB0aGlzOlxuICAgIC8vICAgICAgIDxqb2luIHBhdGg9XCJHZW5lLnNlcXVlbmNlT250b2xvZ3lUZXJtXCIgc3R5bGU9XCJPVVRFUlwiLz5cbiAgICBqb2lucyA9IGpvaW5zLm1hcCggaiA9PiBqLmdldEF0dHJpYnV0ZShcInBhdGhcIikgKTtcblxuICAgIGxldCBvcmRlckJ5ID0gbnVsbDtcbiAgICBpZiAoc29ydE9yZGVyKSB7XG4gICAgICAgIC8vIFRoZSBqc29uIGZvcm1hdCBmb3Igb3JkZXJCeSBpcyBhIGJpdCB3ZWlyZC5cbiAgICAgICAgLy8gSWYgdGhlIHhtbCBvcmRlckJ5IGlzOiBcIkEuYi5jIGFzYyBBLmQuZSBkZXNjXCIsXG4gICAgICAgIC8vIHRoZSBqc29uIHNob3VsZCBiZTogWyB7XCJBLmIuY1wiOlwiYXNjXCJ9LCB7XCJBLmQuZVwiOlwiZGVzY30gXVxuICAgICAgICAvLyBcbiAgICAgICAgLy8gVGhlIG9yZGVyYnkgc3RyaW5nIHRva2VucywgZS5nLiBbXCJBLmIuY1wiLCBcImFzY1wiLCBcIkEuZC5lXCIsIFwiZGVzY1wiXVxuICAgICAgICBsZXQgb2IgPSBzb3J0T3JkZXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIC8vIHNhbml0eSBjaGVjazpcbiAgICAgICAgaWYgKG9iLmxlbmd0aCAlIDIgKVxuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgcGFyc2UgdGhlIG9yZGVyQnkgY2xhdXNlOiBcIiArIHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKTtcbiAgICAgICAgLy8gY29udmVydCB0b2tlbnMgdG8ganNvbiBvcmRlckJ5IFxuICAgICAgICBvcmRlckJ5ID0gb2IucmVkdWNlKGZ1bmN0aW9uKGFjYywgY3VyciwgaSl7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApe1xuICAgICAgICAgICAgICAgIC8vIG9kZC4gY3VyciBpcyBhIHBhdGguIFB1c2ggaXQuXG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY3VycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGV2ZW4uIFBvcCB0aGUgcGF0aCwgY3JlYXRlIHRoZSB7fSwgYW5kIHB1c2ggaXQuXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB7fVxuICAgICAgICAgICAgICAgIGxldCBwID0gYWNjLnBvcCgpXG4gICAgICAgICAgICAgICAgdltwXSA9IGN1cnI7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYyxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgam9pbnMsXG4gICAgICAgIG9yZGVyQnlcbiAgICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZGVlcCBjb3B5IG9mIG9iamVjdCBvLiBcbi8vIEFyZ3M6XG4vLyAgIG8gIChvYmplY3QpIE11c3QgYmUgYSBKU09OIG9iamVjdCAobm8gY3VyY3VsYXIgcmVmcywgbm8gZnVuY3Rpb25zKS5cbi8vIFJldHVybnM6XG4vLyAgIGEgZGVlcCBjb3B5IG9mIG9cbmZ1bmN0aW9uIGRlZXBjKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBvO1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTtcbn1cblxuLy9cbmxldCBQUkVGSVg9XCJvcmcubWdpLmFwcHMucWJcIjtcbmZ1bmN0aW9uIHRlc3RMb2NhbChhdHRyKSB7XG4gICAgcmV0dXJuIChQUkVGSVgrXCIuXCIrYXR0cikgaW4gbG9jYWxTdG9yYWdlO1xufVxuZnVuY3Rpb24gc2V0TG9jYWwoYXR0ciwgdmFsLCBlbmNvZGUpe1xuICAgIGxvY2FsU3RvcmFnZVtQUkVGSVgrXCIuXCIrYXR0cl0gPSBlbmNvZGUgPyBKU09OLnN0cmluZ2lmeSh2YWwpIDogdmFsO1xufVxuZnVuY3Rpb24gZ2V0TG9jYWwoYXR0ciwgZGVjb2RlLCBkZmx0KXtcbiAgICBsZXQga2V5ID0gUFJFRklYK1wiLlwiK2F0dHI7XG4gICAgaWYgKGtleSBpbiBsb2NhbFN0b3JhZ2Upe1xuICAgICAgICBsZXQgdiA9IGxvY2FsU3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAoZGVjb2RlKSB2ID0gSlNPTi5wYXJzZSh2KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZGZsdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhckxvY2FsKCkge1xuICAgIGxldCBybXYgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoUFJFRklYKSk7XG4gICAgcm12LmZvckVhY2goIGsgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oaykgKTtcbn1cblxuLy9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibGV0IHMgPSBgXG4zZF9yb3RhdGlvbiBlODRkXG5hY191bml0IGViM2JcbmFjY2Vzc19hbGFybSBlMTkwXG5hY2Nlc3NfYWxhcm1zIGUxOTFcbmFjY2Vzc190aW1lIGUxOTJcbmFjY2Vzc2liaWxpdHkgZTg0ZVxuYWNjZXNzaWJsZSBlOTE0XG5hY2NvdW50X2JhbGFuY2UgZTg0ZlxuYWNjb3VudF9iYWxhbmNlX3dhbGxldCBlODUwXG5hY2NvdW50X2JveCBlODUxXG5hY2NvdW50X2NpcmNsZSBlODUzXG5hZGIgZTYwZVxuYWRkIGUxNDVcbmFkZF9hX3Bob3RvIGU0MzlcbmFkZF9hbGFybSBlMTkzXG5hZGRfYWxlcnQgZTAwM1xuYWRkX2JveCBlMTQ2XG5hZGRfY2lyY2xlIGUxNDdcbmFkZF9jaXJjbGVfb3V0bGluZSBlMTQ4XG5hZGRfbG9jYXRpb24gZTU2N1xuYWRkX3Nob3BwaW5nX2NhcnQgZTg1NFxuYWRkX3RvX3Bob3RvcyBlMzlkXG5hZGRfdG9fcXVldWUgZTA1Y1xuYWRqdXN0IGUzOWVcbmFpcmxpbmVfc2VhdF9mbGF0IGU2MzBcbmFpcmxpbmVfc2VhdF9mbGF0X2FuZ2xlZCBlNjMxXG5haXJsaW5lX3NlYXRfaW5kaXZpZHVhbF9zdWl0ZSBlNjMyXG5haXJsaW5lX3NlYXRfbGVncm9vbV9leHRyYSBlNjMzXG5haXJsaW5lX3NlYXRfbGVncm9vbV9ub3JtYWwgZTYzNFxuYWlybGluZV9zZWF0X2xlZ3Jvb21fcmVkdWNlZCBlNjM1XG5haXJsaW5lX3NlYXRfcmVjbGluZV9leHRyYSBlNjM2XG5haXJsaW5lX3NlYXRfcmVjbGluZV9ub3JtYWwgZTYzN1xuYWlycGxhbmVtb2RlX2FjdGl2ZSBlMTk1XG5haXJwbGFuZW1vZGVfaW5hY3RpdmUgZTE5NFxuYWlycGxheSBlMDU1XG5haXJwb3J0X3NodXR0bGUgZWIzY1xuYWxhcm0gZTg1NVxuYWxhcm1fYWRkIGU4NTZcbmFsYXJtX29mZiBlODU3XG5hbGFybV9vbiBlODU4XG5hbGJ1bSBlMDE5XG5hbGxfaW5jbHVzaXZlIGViM2RcbmFsbF9vdXQgZTkwYlxuYW5kcm9pZCBlODU5XG5hbm5vdW5jZW1lbnQgZTg1YVxuYXBwcyBlNWMzXG5hcmNoaXZlIGUxNDlcbmFycm93X2JhY2sgZTVjNFxuYXJyb3dfZG93bndhcmQgZTVkYlxuYXJyb3dfZHJvcF9kb3duIGU1YzVcbmFycm93X2Ryb3BfZG93bl9jaXJjbGUgZTVjNlxuYXJyb3dfZHJvcF91cCBlNWM3XG5hcnJvd19mb3J3YXJkIGU1YzhcbmFycm93X3Vwd2FyZCBlNWQ4XG5hcnRfdHJhY2sgZTA2MFxuYXNwZWN0X3JhdGlvIGU4NWJcbmFzc2Vzc21lbnQgZTg1Y1xuYXNzaWdubWVudCBlODVkXG5hc3NpZ25tZW50X2luZCBlODVlXG5hc3NpZ25tZW50X2xhdGUgZTg1ZlxuYXNzaWdubWVudF9yZXR1cm4gZTg2MFxuYXNzaWdubWVudF9yZXR1cm5lZCBlODYxXG5hc3NpZ25tZW50X3R1cm5lZF9pbiBlODYyXG5hc3Npc3RhbnQgZTM5ZlxuYXNzaXN0YW50X3Bob3RvIGUzYTBcbmF0dGFjaF9maWxlIGUyMjZcbmF0dGFjaF9tb25leSBlMjI3XG5hdHRhY2htZW50IGUyYmNcbmF1ZGlvdHJhY2sgZTNhMVxuYXV0b3JlbmV3IGU4NjNcbmF2X3RpbWVyIGUwMWJcbmJhY2tzcGFjZSBlMTRhXG5iYWNrdXAgZTg2NFxuYmF0dGVyeV9hbGVydCBlMTljXG5iYXR0ZXJ5X2NoYXJnaW5nX2Z1bGwgZTFhM1xuYmF0dGVyeV9mdWxsIGUxYTRcbmJhdHRlcnlfc3RkIGUxYTVcbmJhdHRlcnlfdW5rbm93biBlMWE2XG5iZWFjaF9hY2Nlc3MgZWIzZVxuYmVlbmhlcmUgZTUyZFxuYmxvY2sgZTE0YlxuYmx1ZXRvb3RoIGUxYTdcbmJsdWV0b290aF9hdWRpbyBlNjBmXG5ibHVldG9vdGhfY29ubmVjdGVkIGUxYThcbmJsdWV0b290aF9kaXNhYmxlZCBlMWE5XG5ibHVldG9vdGhfc2VhcmNoaW5nIGUxYWFcbmJsdXJfY2lyY3VsYXIgZTNhMlxuYmx1cl9saW5lYXIgZTNhM1xuYmx1cl9vZmYgZTNhNFxuYmx1cl9vbiBlM2E1XG5ib29rIGU4NjVcbmJvb2ttYXJrIGU4NjZcbmJvb2ttYXJrX2JvcmRlciBlODY3XG5ib3JkZXJfYWxsIGUyMjhcbmJvcmRlcl9ib3R0b20gZTIyOVxuYm9yZGVyX2NsZWFyIGUyMmFcbmJvcmRlcl9jb2xvciBlMjJiXG5ib3JkZXJfaG9yaXpvbnRhbCBlMjJjXG5ib3JkZXJfaW5uZXIgZTIyZFxuYm9yZGVyX2xlZnQgZTIyZVxuYm9yZGVyX291dGVyIGUyMmZcbmJvcmRlcl9yaWdodCBlMjMwXG5ib3JkZXJfc3R5bGUgZTIzMVxuYm9yZGVyX3RvcCBlMjMyXG5ib3JkZXJfdmVydGljYWwgZTIzM1xuYnJhbmRpbmdfd2F0ZXJtYXJrIGUwNmJcbmJyaWdodG5lc3NfMSBlM2E2XG5icmlnaHRuZXNzXzIgZTNhN1xuYnJpZ2h0bmVzc18zIGUzYThcbmJyaWdodG5lc3NfNCBlM2E5XG5icmlnaHRuZXNzXzUgZTNhYVxuYnJpZ2h0bmVzc182IGUzYWJcbmJyaWdodG5lc3NfNyBlM2FjXG5icmlnaHRuZXNzX2F1dG8gZTFhYlxuYnJpZ2h0bmVzc19oaWdoIGUxYWNcbmJyaWdodG5lc3NfbG93IGUxYWRcbmJyaWdodG5lc3NfbWVkaXVtIGUxYWVcbmJyb2tlbl9pbWFnZSBlM2FkXG5icnVzaCBlM2FlXG5idWJibGVfY2hhcnQgZTZkZFxuYnVnX3JlcG9ydCBlODY4XG5idWlsZCBlODY5XG5idXJzdF9tb2RlIGU0M2NcbmJ1c2luZXNzIGUwYWZcbmJ1c2luZXNzX2NlbnRlciBlYjNmXG5jYWNoZWQgZTg2YVxuY2FrZSBlN2U5XG5jYWxsIGUwYjBcbmNhbGxfZW5kIGUwYjFcbmNhbGxfbWFkZSBlMGIyXG5jYWxsX21lcmdlIGUwYjNcbmNhbGxfbWlzc2VkIGUwYjRcbmNhbGxfbWlzc2VkX291dGdvaW5nIGUwZTRcbmNhbGxfcmVjZWl2ZWQgZTBiNVxuY2FsbF9zcGxpdCBlMGI2XG5jYWxsX3RvX2FjdGlvbiBlMDZjXG5jYW1lcmEgZTNhZlxuY2FtZXJhX2FsdCBlM2IwXG5jYW1lcmFfZW5oYW5jZSBlOGZjXG5jYW1lcmFfZnJvbnQgZTNiMVxuY2FtZXJhX3JlYXIgZTNiMlxuY2FtZXJhX3JvbGwgZTNiM1xuY2FuY2VsIGU1YzlcbmNhcmRfZ2lmdGNhcmQgZThmNlxuY2FyZF9tZW1iZXJzaGlwIGU4ZjdcbmNhcmRfdHJhdmVsIGU4ZjhcbmNhc2lubyBlYjQwXG5jYXN0IGUzMDdcbmNhc3RfY29ubmVjdGVkIGUzMDhcbmNlbnRlcl9mb2N1c19zdHJvbmcgZTNiNFxuY2VudGVyX2ZvY3VzX3dlYWsgZTNiNVxuY2hhbmdlX2hpc3RvcnkgZTg2YlxuY2hhdCBlMGI3XG5jaGF0X2J1YmJsZSBlMGNhXG5jaGF0X2J1YmJsZV9vdXRsaW5lIGUwY2JcbmNoZWNrIGU1Y2FcbmNoZWNrX2JveCBlODM0XG5jaGVja19ib3hfb3V0bGluZV9ibGFuayBlODM1XG5jaGVja19jaXJjbGUgZTg2Y1xuY2hldnJvbl9sZWZ0IGU1Y2JcbmNoZXZyb25fcmlnaHQgZTVjY1xuY2hpbGRfY2FyZSBlYjQxXG5jaGlsZF9mcmllbmRseSBlYjQyXG5jaHJvbWVfcmVhZGVyX21vZGUgZTg2ZFxuY2xhc3MgZTg2ZVxuY2xlYXIgZTE0Y1xuY2xlYXJfYWxsIGUwYjhcbmNsb3NlIGU1Y2RcbmNsb3NlZF9jYXB0aW9uIGUwMWNcbmNsb3VkIGUyYmRcbmNsb3VkX2NpcmNsZSBlMmJlXG5jbG91ZF9kb25lIGUyYmZcbmNsb3VkX2Rvd25sb2FkIGUyYzBcbmNsb3VkX29mZiBlMmMxXG5jbG91ZF9xdWV1ZSBlMmMyXG5jbG91ZF91cGxvYWQgZTJjM1xuY29kZSBlODZmXG5jb2xsZWN0aW9ucyBlM2I2XG5jb2xsZWN0aW9uc19ib29rbWFyayBlNDMxXG5jb2xvcl9sZW5zIGUzYjdcbmNvbG9yaXplIGUzYjhcbmNvbW1lbnQgZTBiOVxuY29tcGFyZSBlM2I5XG5jb21wYXJlX2Fycm93cyBlOTE1XG5jb21wdXRlciBlMzBhXG5jb25maXJtYXRpb25fbnVtYmVyIGU2MzhcbmNvbnRhY3RfbWFpbCBlMGQwXG5jb250YWN0X3Bob25lIGUwY2ZcbmNvbnRhY3RzIGUwYmFcbmNvbnRlbnRfY29weSBlMTRkXG5jb250ZW50X2N1dCBlMTRlXG5jb250ZW50X3Bhc3RlIGUxNGZcbmNvbnRyb2xfcG9pbnQgZTNiYVxuY29udHJvbF9wb2ludF9kdXBsaWNhdGUgZTNiYlxuY29weXJpZ2h0IGU5MGNcbmNyZWF0ZSBlMTUwXG5jcmVhdGVfbmV3X2ZvbGRlciBlMmNjXG5jcmVkaXRfY2FyZCBlODcwXG5jcm9wIGUzYmVcbmNyb3BfMTZfOSBlM2JjXG5jcm9wXzNfMiBlM2JkXG5jcm9wXzVfNCBlM2JmXG5jcm9wXzdfNSBlM2MwXG5jcm9wX2RpbiBlM2MxXG5jcm9wX2ZyZWUgZTNjMlxuY3JvcF9sYW5kc2NhcGUgZTNjM1xuY3JvcF9vcmlnaW5hbCBlM2M0XG5jcm9wX3BvcnRyYWl0IGUzYzVcbmNyb3Bfcm90YXRlIGU0MzdcbmNyb3Bfc3F1YXJlIGUzYzZcbmRhc2hib2FyZCBlODcxXG5kYXRhX3VzYWdlIGUxYWZcbmRhdGVfcmFuZ2UgZTkxNlxuZGVoYXplIGUzYzdcbmRlbGV0ZSBlODcyXG5kZWxldGVfZm9yZXZlciBlOTJiXG5kZWxldGVfc3dlZXAgZTE2Y1xuZGVzY3JpcHRpb24gZTg3M1xuZGVza3RvcF9tYWMgZTMwYlxuZGVza3RvcF93aW5kb3dzIGUzMGNcbmRldGFpbHMgZTNjOFxuZGV2ZWxvcGVyX2JvYXJkIGUzMGRcbmRldmVsb3Blcl9tb2RlIGUxYjBcbmRldmljZV9odWIgZTMzNVxuZGV2aWNlcyBlMWIxXG5kZXZpY2VzX290aGVyIGUzMzdcbmRpYWxlcl9zaXAgZTBiYlxuZGlhbHBhZCBlMGJjXG5kaXJlY3Rpb25zIGU1MmVcbmRpcmVjdGlvbnNfYmlrZSBlNTJmXG5kaXJlY3Rpb25zX2JvYXQgZTUzMlxuZGlyZWN0aW9uc19idXMgZTUzMFxuZGlyZWN0aW9uc19jYXIgZTUzMVxuZGlyZWN0aW9uc19yYWlsd2F5IGU1MzRcbmRpcmVjdGlvbnNfcnVuIGU1NjZcbmRpcmVjdGlvbnNfc3Vid2F5IGU1MzNcbmRpcmVjdGlvbnNfdHJhbnNpdCBlNTM1XG5kaXJlY3Rpb25zX3dhbGsgZTUzNlxuZGlzY19mdWxsIGU2MTBcbmRucyBlODc1XG5kb19ub3RfZGlzdHVyYiBlNjEyXG5kb19ub3RfZGlzdHVyYl9hbHQgZTYxMVxuZG9fbm90X2Rpc3R1cmJfb2ZmIGU2NDNcbmRvX25vdF9kaXN0dXJiX29uIGU2NDRcbmRvY2sgZTMwZVxuZG9tYWluIGU3ZWVcbmRvbmUgZTg3NlxuZG9uZV9hbGwgZTg3N1xuZG9udXRfbGFyZ2UgZTkxN1xuZG9udXRfc21hbGwgZTkxOFxuZHJhZnRzIGUxNTFcbmRyYWdfaGFuZGxlIGUyNWRcbmRyaXZlX2V0YSBlNjEzXG5kdnIgZTFiMlxuZWRpdCBlM2M5XG5lZGl0X2xvY2F0aW9uIGU1NjhcbmVqZWN0IGU4ZmJcbmVtYWlsIGUwYmVcbmVuaGFuY2VkX2VuY3J5cHRpb24gZTYzZlxuZXF1YWxpemVyIGUwMWRcbmVycm9yIGUwMDBcbmVycm9yX291dGxpbmUgZTAwMVxuZXVyb19zeW1ib2wgZTkyNlxuZXZfc3RhdGlvbiBlNTZkXG5ldmVudCBlODc4XG5ldmVudF9hdmFpbGFibGUgZTYxNFxuZXZlbnRfYnVzeSBlNjE1XG5ldmVudF9ub3RlIGU2MTZcbmV2ZW50X3NlYXQgZTkwM1xuZXhpdF90b19hcHAgZTg3OVxuZXhwYW5kX2xlc3MgZTVjZVxuZXhwYW5kX21vcmUgZTVjZlxuZXhwbGljaXQgZTAxZVxuZXhwbG9yZSBlODdhXG5leHBvc3VyZSBlM2NhXG5leHBvc3VyZV9uZWdfMSBlM2NiXG5leHBvc3VyZV9uZWdfMiBlM2NjXG5leHBvc3VyZV9wbHVzXzEgZTNjZFxuZXhwb3N1cmVfcGx1c18yIGUzY2VcbmV4cG9zdXJlX3plcm8gZTNjZlxuZXh0ZW5zaW9uIGU4N2JcbmZhY2UgZTg3Y1xuZmFzdF9mb3J3YXJkIGUwMWZcbmZhc3RfcmV3aW5kIGUwMjBcbmZhdm9yaXRlIGU4N2RcbmZhdm9yaXRlX2JvcmRlciBlODdlXG5mZWF0dXJlZF9wbGF5X2xpc3QgZTA2ZFxuZmVhdHVyZWRfdmlkZW8gZTA2ZVxuZmVlZGJhY2sgZTg3ZlxuZmliZXJfZHZyIGUwNWRcbmZpYmVyX21hbnVhbF9yZWNvcmQgZTA2MVxuZmliZXJfbmV3IGUwNWVcbmZpYmVyX3BpbiBlMDZhXG5maWJlcl9zbWFydF9yZWNvcmQgZTA2MlxuZmlsZV9kb3dubG9hZCBlMmM0XG5maWxlX3VwbG9hZCBlMmM2XG5maWx0ZXIgZTNkM1xuZmlsdGVyXzEgZTNkMFxuZmlsdGVyXzIgZTNkMVxuZmlsdGVyXzMgZTNkMlxuZmlsdGVyXzQgZTNkNFxuZmlsdGVyXzUgZTNkNVxuZmlsdGVyXzYgZTNkNlxuZmlsdGVyXzcgZTNkN1xuZmlsdGVyXzggZTNkOFxuZmlsdGVyXzkgZTNkOVxuZmlsdGVyXzlfcGx1cyBlM2RhXG5maWx0ZXJfYl9hbmRfdyBlM2RiXG5maWx0ZXJfY2VudGVyX2ZvY3VzIGUzZGNcbmZpbHRlcl9kcmFtYSBlM2RkXG5maWx0ZXJfZnJhbWVzIGUzZGVcbmZpbHRlcl9oZHIgZTNkZlxuZmlsdGVyX2xpc3QgZTE1MlxuZmlsdGVyX25vbmUgZTNlMFxuZmlsdGVyX3RpbHRfc2hpZnQgZTNlMlxuZmlsdGVyX3ZpbnRhZ2UgZTNlM1xuZmluZF9pbl9wYWdlIGU4ODBcbmZpbmRfcmVwbGFjZSBlODgxXG5maW5nZXJwcmludCBlOTBkXG5maXJzdF9wYWdlIGU1ZGNcbmZpdG5lc3NfY2VudGVyIGViNDNcbmZsYWcgZTE1M1xuZmxhcmUgZTNlNFxuZmxhc2hfYXV0byBlM2U1XG5mbGFzaF9vZmYgZTNlNlxuZmxhc2hfb24gZTNlN1xuZmxpZ2h0IGU1MzlcbmZsaWdodF9sYW5kIGU5MDRcbmZsaWdodF90YWtlb2ZmIGU5MDVcbmZsaXAgZTNlOFxuZmxpcF90b19iYWNrIGU4ODJcbmZsaXBfdG9fZnJvbnQgZTg4M1xuZm9sZGVyIGUyYzdcbmZvbGRlcl9vcGVuIGUyYzhcbmZvbGRlcl9zaGFyZWQgZTJjOVxuZm9sZGVyX3NwZWNpYWwgZTYxN1xuZm9udF9kb3dubG9hZCBlMTY3XG5mb3JtYXRfYWxpZ25fY2VudGVyIGUyMzRcbmZvcm1hdF9hbGlnbl9qdXN0aWZ5IGUyMzVcbmZvcm1hdF9hbGlnbl9sZWZ0IGUyMzZcbmZvcm1hdF9hbGlnbl9yaWdodCBlMjM3XG5mb3JtYXRfYm9sZCBlMjM4XG5mb3JtYXRfY2xlYXIgZTIzOVxuZm9ybWF0X2NvbG9yX2ZpbGwgZTIzYVxuZm9ybWF0X2NvbG9yX3Jlc2V0IGUyM2JcbmZvcm1hdF9jb2xvcl90ZXh0IGUyM2NcbmZvcm1hdF9pbmRlbnRfZGVjcmVhc2UgZTIzZFxuZm9ybWF0X2luZGVudF9pbmNyZWFzZSBlMjNlXG5mb3JtYXRfaXRhbGljIGUyM2ZcbmZvcm1hdF9saW5lX3NwYWNpbmcgZTI0MFxuZm9ybWF0X2xpc3RfYnVsbGV0ZWQgZTI0MVxuZm9ybWF0X2xpc3RfbnVtYmVyZWQgZTI0MlxuZm9ybWF0X3BhaW50IGUyNDNcbmZvcm1hdF9xdW90ZSBlMjQ0XG5mb3JtYXRfc2hhcGVzIGUyNWVcbmZvcm1hdF9zaXplIGUyNDVcbmZvcm1hdF9zdHJpa2V0aHJvdWdoIGUyNDZcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX2xfdG9fciBlMjQ3XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9yX3RvX2wgZTI0OFxuZm9ybWF0X3VuZGVybGluZWQgZTI0OVxuZm9ydW0gZTBiZlxuZm9yd2FyZCBlMTU0XG5mb3J3YXJkXzEwIGUwNTZcbmZvcndhcmRfMzAgZTA1N1xuZm9yd2FyZF81IGUwNThcbmZyZWVfYnJlYWtmYXN0IGViNDRcbmZ1bGxzY3JlZW4gZTVkMFxuZnVsbHNjcmVlbl9leGl0IGU1ZDFcbmZ1bmN0aW9ucyBlMjRhXG5nX3RyYW5zbGF0ZSBlOTI3XG5nYW1lcGFkIGUzMGZcbmdhbWVzIGUwMjFcbmdhdmVsIGU5MGVcbmdlc3R1cmUgZTE1NVxuZ2V0X2FwcCBlODg0XG5naWYgZTkwOFxuZ29sZl9jb3Vyc2UgZWI0NVxuZ3BzX2ZpeGVkIGUxYjNcbmdwc19ub3RfZml4ZWQgZTFiNFxuZ3BzX29mZiBlMWI1XG5ncmFkZSBlODg1XG5ncmFkaWVudCBlM2U5XG5ncmFpbiBlM2VhXG5ncmFwaGljX2VxIGUxYjhcbmdyaWRfb2ZmIGUzZWJcbmdyaWRfb24gZTNlY1xuZ3JvdXAgZTdlZlxuZ3JvdXBfYWRkIGU3ZjBcbmdyb3VwX3dvcmsgZTg4NlxuaGQgZTA1MlxuaGRyX29mZiBlM2VkXG5oZHJfb24gZTNlZVxuaGRyX3N0cm9uZyBlM2YxXG5oZHJfd2VhayBlM2YyXG5oZWFkc2V0IGUzMTBcbmhlYWRzZXRfbWljIGUzMTFcbmhlYWxpbmcgZTNmM1xuaGVhcmluZyBlMDIzXG5oZWxwIGU4ODdcbmhlbHBfb3V0bGluZSBlOGZkXG5oaWdoX3F1YWxpdHkgZTAyNFxuaGlnaGxpZ2h0IGUyNWZcbmhpZ2hsaWdodF9vZmYgZTg4OFxuaGlzdG9yeSBlODg5XG5ob21lIGU4OGFcbmhvdF90dWIgZWI0NlxuaG90ZWwgZTUzYVxuaG91cmdsYXNzX2VtcHR5IGU4OGJcbmhvdXJnbGFzc19mdWxsIGU4OGNcbmh0dHAgZTkwMlxuaHR0cHMgZTg4ZFxuaW1hZ2UgZTNmNFxuaW1hZ2VfYXNwZWN0X3JhdGlvIGUzZjVcbmltcG9ydF9jb250YWN0cyBlMGUwXG5pbXBvcnRfZXhwb3J0IGUwYzNcbmltcG9ydGFudF9kZXZpY2VzIGU5MTJcbmluYm94IGUxNTZcbmluZGV0ZXJtaW5hdGVfY2hlY2tfYm94IGU5MDlcbmluZm8gZTg4ZVxuaW5mb19vdXRsaW5lIGU4OGZcbmlucHV0IGU4OTBcbmluc2VydF9jaGFydCBlMjRiXG5pbnNlcnRfY29tbWVudCBlMjRjXG5pbnNlcnRfZHJpdmVfZmlsZSBlMjRkXG5pbnNlcnRfZW1vdGljb24gZTI0ZVxuaW5zZXJ0X2ludml0YXRpb24gZTI0ZlxuaW5zZXJ0X2xpbmsgZTI1MFxuaW5zZXJ0X3Bob3RvIGUyNTFcbmludmVydF9jb2xvcnMgZTg5MVxuaW52ZXJ0X2NvbG9yc19vZmYgZTBjNFxuaXNvIGUzZjZcbmtleWJvYXJkIGUzMTJcbmtleWJvYXJkX2Fycm93X2Rvd24gZTMxM1xua2V5Ym9hcmRfYXJyb3dfbGVmdCBlMzE0XG5rZXlib2FyZF9hcnJvd19yaWdodCBlMzE1XG5rZXlib2FyZF9hcnJvd191cCBlMzE2XG5rZXlib2FyZF9iYWNrc3BhY2UgZTMxN1xua2V5Ym9hcmRfY2Fwc2xvY2sgZTMxOFxua2V5Ym9hcmRfaGlkZSBlMzFhXG5rZXlib2FyZF9yZXR1cm4gZTMxYlxua2V5Ym9hcmRfdGFiIGUzMWNcbmtleWJvYXJkX3ZvaWNlIGUzMWRcbmtpdGNoZW4gZWI0N1xubGFiZWwgZTg5MlxubGFiZWxfb3V0bGluZSBlODkzXG5sYW5kc2NhcGUgZTNmN1xubGFuZ3VhZ2UgZTg5NFxubGFwdG9wIGUzMWVcbmxhcHRvcF9jaHJvbWVib29rIGUzMWZcbmxhcHRvcF9tYWMgZTMyMFxubGFwdG9wX3dpbmRvd3MgZTMyMVxubGFzdF9wYWdlIGU1ZGRcbmxhdW5jaCBlODk1XG5sYXllcnMgZTUzYlxubGF5ZXJzX2NsZWFyIGU1M2NcbmxlYWtfYWRkIGUzZjhcbmxlYWtfcmVtb3ZlIGUzZjlcbmxlbnMgZTNmYVxubGlicmFyeV9hZGQgZTAyZVxubGlicmFyeV9ib29rcyBlMDJmXG5saWJyYXJ5X211c2ljIGUwMzBcbmxpZ2h0YnVsYl9vdXRsaW5lIGU5MGZcbmxpbmVfc3R5bGUgZTkxOVxubGluZV93ZWlnaHQgZTkxYVxubGluZWFyX3NjYWxlIGUyNjBcbmxpbmsgZTE1N1xubGlua2VkX2NhbWVyYSBlNDM4XG5saXN0IGU4OTZcbmxpdmVfaGVscCBlMGM2XG5saXZlX3R2IGU2MzlcbmxvY2FsX2FjdGl2aXR5IGU1M2ZcbmxvY2FsX2FpcnBvcnQgZTUzZFxubG9jYWxfYXRtIGU1M2VcbmxvY2FsX2JhciBlNTQwXG5sb2NhbF9jYWZlIGU1NDFcbmxvY2FsX2Nhcl93YXNoIGU1NDJcbmxvY2FsX2NvbnZlbmllbmNlX3N0b3JlIGU1NDNcbmxvY2FsX2RpbmluZyBlNTU2XG5sb2NhbF9kcmluayBlNTQ0XG5sb2NhbF9mbG9yaXN0IGU1NDVcbmxvY2FsX2dhc19zdGF0aW9uIGU1NDZcbmxvY2FsX2dyb2Nlcnlfc3RvcmUgZTU0N1xubG9jYWxfaG9zcGl0YWwgZTU0OFxubG9jYWxfaG90ZWwgZTU0OVxubG9jYWxfbGF1bmRyeV9zZXJ2aWNlIGU1NGFcbmxvY2FsX2xpYnJhcnkgZTU0YlxubG9jYWxfbWFsbCBlNTRjXG5sb2NhbF9tb3ZpZXMgZTU0ZFxubG9jYWxfb2ZmZXIgZTU0ZVxubG9jYWxfcGFya2luZyBlNTRmXG5sb2NhbF9waGFybWFjeSBlNTUwXG5sb2NhbF9waG9uZSBlNTUxXG5sb2NhbF9waXp6YSBlNTUyXG5sb2NhbF9wbGF5IGU1NTNcbmxvY2FsX3Bvc3Rfb2ZmaWNlIGU1NTRcbmxvY2FsX3ByaW50c2hvcCBlNTU1XG5sb2NhbF9zZWUgZTU1N1xubG9jYWxfc2hpcHBpbmcgZTU1OFxubG9jYWxfdGF4aSBlNTU5XG5sb2NhdGlvbl9jaXR5IGU3ZjFcbmxvY2F0aW9uX2Rpc2FibGVkIGUxYjZcbmxvY2F0aW9uX29mZiBlMGM3XG5sb2NhdGlvbl9vbiBlMGM4XG5sb2NhdGlvbl9zZWFyY2hpbmcgZTFiN1xubG9jayBlODk3XG5sb2NrX29wZW4gZTg5OFxubG9ja19vdXRsaW5lIGU4OTlcbmxvb2tzIGUzZmNcbmxvb2tzXzMgZTNmYlxubG9va3NfNCBlM2ZkXG5sb29rc181IGUzZmVcbmxvb2tzXzYgZTNmZlxubG9va3Nfb25lIGU0MDBcbmxvb2tzX3R3byBlNDAxXG5sb29wIGUwMjhcbmxvdXBlIGU0MDJcbmxvd19wcmlvcml0eSBlMTZkXG5sb3lhbHR5IGU4OWFcbm1haWwgZTE1OFxubWFpbF9vdXRsaW5lIGUwZTFcbm1hcCBlNTViXG5tYXJrdW5yZWFkIGUxNTlcbm1hcmt1bnJlYWRfbWFpbGJveCBlODliXG5tZW1vcnkgZTMyMlxubWVudSBlNWQyXG5tZXJnZV90eXBlIGUyNTJcbm1lc3NhZ2UgZTBjOVxubWljIGUwMjlcbm1pY19ub25lIGUwMmFcbm1pY19vZmYgZTAyYlxubW1zIGU2MThcbm1vZGVfY29tbWVudCBlMjUzXG5tb2RlX2VkaXQgZTI1NFxubW9uZXRpemF0aW9uX29uIGUyNjNcbm1vbmV5X29mZiBlMjVjXG5tb25vY2hyb21lX3Bob3RvcyBlNDAzXG5tb29kIGU3ZjJcbm1vb2RfYmFkIGU3ZjNcbm1vcmUgZTYxOVxubW9yZV9ob3JpeiBlNWQzXG5tb3JlX3ZlcnQgZTVkNFxubW90b3JjeWNsZSBlOTFiXG5tb3VzZSBlMzIzXG5tb3ZlX3RvX2luYm94IGUxNjhcbm1vdmllIGUwMmNcbm1vdmllX2NyZWF0aW9uIGU0MDRcbm1vdmllX2ZpbHRlciBlNDNhXG5tdWx0aWxpbmVfY2hhcnQgZTZkZlxubXVzaWNfbm90ZSBlNDA1XG5tdXNpY192aWRlbyBlMDYzXG5teV9sb2NhdGlvbiBlNTVjXG5uYXR1cmUgZTQwNlxubmF0dXJlX3Blb3BsZSBlNDA3XG5uYXZpZ2F0ZV9iZWZvcmUgZTQwOFxubmF2aWdhdGVfbmV4dCBlNDA5XG5uYXZpZ2F0aW9uIGU1NWRcbm5lYXJfbWUgZTU2OVxubmV0d29ya19jZWxsIGUxYjlcbm5ldHdvcmtfY2hlY2sgZTY0MFxubmV0d29ya19sb2NrZWQgZTYxYVxubmV0d29ya193aWZpIGUxYmFcbm5ld19yZWxlYXNlcyBlMDMxXG5uZXh0X3dlZWsgZTE2YVxubmZjIGUxYmJcbm5vX2VuY3J5cHRpb24gZTY0MVxubm9fc2ltIGUwY2Ncbm5vdF9pbnRlcmVzdGVkIGUwMzNcbm5vdGUgZTA2Zlxubm90ZV9hZGQgZTg5Y1xubm90aWZpY2F0aW9ucyBlN2Y0XG5ub3RpZmljYXRpb25zX2FjdGl2ZSBlN2Y3XG5ub3RpZmljYXRpb25zX25vbmUgZTdmNVxubm90aWZpY2F0aW9uc19vZmYgZTdmNlxubm90aWZpY2F0aW9uc19wYXVzZWQgZTdmOFxub2ZmbGluZV9waW4gZTkwYVxub25kZW1hbmRfdmlkZW8gZTYzYVxub3BhY2l0eSBlOTFjXG5vcGVuX2luX2Jyb3dzZXIgZTg5ZFxub3Blbl9pbl9uZXcgZTg5ZVxub3Blbl93aXRoIGU4OWZcbnBhZ2VzIGU3ZjlcbnBhZ2V2aWV3IGU4YTBcbnBhbGV0dGUgZTQwYVxucGFuX3Rvb2wgZTkyNVxucGFub3JhbWEgZTQwYlxucGFub3JhbWFfZmlzaF9leWUgZTQwY1xucGFub3JhbWFfaG9yaXpvbnRhbCBlNDBkXG5wYW5vcmFtYV92ZXJ0aWNhbCBlNDBlXG5wYW5vcmFtYV93aWRlX2FuZ2xlIGU0MGZcbnBhcnR5X21vZGUgZTdmYVxucGF1c2UgZTAzNFxucGF1c2VfY2lyY2xlX2ZpbGxlZCBlMDM1XG5wYXVzZV9jaXJjbGVfb3V0bGluZSBlMDM2XG5wYXltZW50IGU4YTFcbnBlb3BsZSBlN2ZiXG5wZW9wbGVfb3V0bGluZSBlN2ZjXG5wZXJtX2NhbWVyYV9taWMgZThhMlxucGVybV9jb250YWN0X2NhbGVuZGFyIGU4YTNcbnBlcm1fZGF0YV9zZXR0aW5nIGU4YTRcbnBlcm1fZGV2aWNlX2luZm9ybWF0aW9uIGU4YTVcbnBlcm1faWRlbnRpdHkgZThhNlxucGVybV9tZWRpYSBlOGE3XG5wZXJtX3Bob25lX21zZyBlOGE4XG5wZXJtX3NjYW5fd2lmaSBlOGE5XG5wZXJzb24gZTdmZFxucGVyc29uX2FkZCBlN2ZlXG5wZXJzb25fb3V0bGluZSBlN2ZmXG5wZXJzb25fcGluIGU1NWFcbnBlcnNvbl9waW5fY2lyY2xlIGU1NmFcbnBlcnNvbmFsX3ZpZGVvIGU2M2JcbnBldHMgZTkxZFxucGhvbmUgZTBjZFxucGhvbmVfYW5kcm9pZCBlMzI0XG5waG9uZV9ibHVldG9vdGhfc3BlYWtlciBlNjFiXG5waG9uZV9mb3J3YXJkZWQgZTYxY1xucGhvbmVfaW5fdGFsayBlNjFkXG5waG9uZV9pcGhvbmUgZTMyNVxucGhvbmVfbG9ja2VkIGU2MWVcbnBob25lX21pc3NlZCBlNjFmXG5waG9uZV9wYXVzZWQgZTYyMFxucGhvbmVsaW5rIGUzMjZcbnBob25lbGlua19lcmFzZSBlMGRiXG5waG9uZWxpbmtfbG9jayBlMGRjXG5waG9uZWxpbmtfb2ZmIGUzMjdcbnBob25lbGlua19yaW5nIGUwZGRcbnBob25lbGlua19zZXR1cCBlMGRlXG5waG90byBlNDEwXG5waG90b19hbGJ1bSBlNDExXG5waG90b19jYW1lcmEgZTQxMlxucGhvdG9fZmlsdGVyIGU0M2JcbnBob3RvX2xpYnJhcnkgZTQxM1xucGhvdG9fc2l6ZV9zZWxlY3RfYWN0dWFsIGU0MzJcbnBob3RvX3NpemVfc2VsZWN0X2xhcmdlIGU0MzNcbnBob3RvX3NpemVfc2VsZWN0X3NtYWxsIGU0MzRcbnBpY3R1cmVfYXNfcGRmIGU0MTVcbnBpY3R1cmVfaW5fcGljdHVyZSBlOGFhXG5waWN0dXJlX2luX3BpY3R1cmVfYWx0IGU5MTFcbnBpZV9jaGFydCBlNmM0XG5waWVfY2hhcnRfb3V0bGluZWQgZTZjNVxucGluX2Ryb3AgZTU1ZVxucGxhY2UgZTU1ZlxucGxheV9hcnJvdyBlMDM3XG5wbGF5X2NpcmNsZV9maWxsZWQgZTAzOFxucGxheV9jaXJjbGVfb3V0bGluZSBlMDM5XG5wbGF5X2Zvcl93b3JrIGU5MDZcbnBsYXlsaXN0X2FkZCBlMDNiXG5wbGF5bGlzdF9hZGRfY2hlY2sgZTA2NVxucGxheWxpc3RfcGxheSBlMDVmXG5wbHVzX29uZSBlODAwXG5wb2xsIGU4MDFcbnBvbHltZXIgZThhYlxucG9vbCBlYjQ4XG5wb3J0YWJsZV93aWZpX29mZiBlMGNlXG5wb3J0cmFpdCBlNDE2XG5wb3dlciBlNjNjXG5wb3dlcl9pbnB1dCBlMzM2XG5wb3dlcl9zZXR0aW5nc19uZXcgZThhY1xucHJlZ25hbnRfd29tYW4gZTkxZVxucHJlc2VudF90b19hbGwgZTBkZlxucHJpbnQgZThhZFxucHJpb3JpdHlfaGlnaCBlNjQ1XG5wdWJsaWMgZTgwYlxucHVibGlzaCBlMjU1XG5xdWVyeV9idWlsZGVyIGU4YWVcbnF1ZXN0aW9uX2Fuc3dlciBlOGFmXG5xdWV1ZSBlMDNjXG5xdWV1ZV9tdXNpYyBlMDNkXG5xdWV1ZV9wbGF5X25leHQgZTA2NlxucmFkaW8gZTAzZVxucmFkaW9fYnV0dG9uX2NoZWNrZWQgZTgzN1xucmFkaW9fYnV0dG9uX3VuY2hlY2tlZCBlODM2XG5yYXRlX3JldmlldyBlNTYwXG5yZWNlaXB0IGU4YjBcbnJlY2VudF9hY3RvcnMgZTAzZlxucmVjb3JkX3ZvaWNlX292ZXIgZTkxZlxucmVkZWVtIGU4YjFcbnJlZG8gZTE1YVxucmVmcmVzaCBlNWQ1XG5yZW1vdmUgZTE1YlxucmVtb3ZlX2NpcmNsZSBlMTVjXG5yZW1vdmVfY2lyY2xlX291dGxpbmUgZTE1ZFxucmVtb3ZlX2Zyb21fcXVldWUgZTA2N1xucmVtb3ZlX3JlZF9leWUgZTQxN1xucmVtb3ZlX3Nob3BwaW5nX2NhcnQgZTkyOFxucmVvcmRlciBlOGZlXG5yZXBlYXQgZTA0MFxucmVwZWF0X29uZSBlMDQxXG5yZXBsYXkgZTA0MlxucmVwbGF5XzEwIGUwNTlcbnJlcGxheV8zMCBlMDVhXG5yZXBsYXlfNSBlMDViXG5yZXBseSBlMTVlXG5yZXBseV9hbGwgZTE1ZlxucmVwb3J0IGUxNjBcbnJlcG9ydF9wcm9ibGVtIGU4YjJcbnJlc3RhdXJhbnQgZTU2Y1xucmVzdGF1cmFudF9tZW51IGU1NjFcbnJlc3RvcmUgZThiM1xucmVzdG9yZV9wYWdlIGU5MjlcbnJpbmdfdm9sdW1lIGUwZDFcbnJvb20gZThiNFxucm9vbV9zZXJ2aWNlIGViNDlcbnJvdGF0ZV85MF9kZWdyZWVzX2NjdyBlNDE4XG5yb3RhdGVfbGVmdCBlNDE5XG5yb3RhdGVfcmlnaHQgZTQxYVxucm91bmRlZF9jb3JuZXIgZTkyMFxucm91dGVyIGUzMjhcbnJvd2luZyBlOTIxXG5yc3NfZmVlZCBlMGU1XG5ydl9ob29rdXAgZTY0Mlxuc2F0ZWxsaXRlIGU1NjJcbnNhdmUgZTE2MVxuc2Nhbm5lciBlMzI5XG5zY2hlZHVsZSBlOGI1XG5zY2hvb2wgZTgwY1xuc2NyZWVuX2xvY2tfbGFuZHNjYXBlIGUxYmVcbnNjcmVlbl9sb2NrX3BvcnRyYWl0IGUxYmZcbnNjcmVlbl9sb2NrX3JvdGF0aW9uIGUxYzBcbnNjcmVlbl9yb3RhdGlvbiBlMWMxXG5zY3JlZW5fc2hhcmUgZTBlMlxuc2RfY2FyZCBlNjIzXG5zZF9zdG9yYWdlIGUxYzJcbnNlYXJjaCBlOGI2XG5zZWN1cml0eSBlMzJhXG5zZWxlY3RfYWxsIGUxNjJcbnNlbmQgZTE2M1xuc2VudGltZW50X2Rpc3NhdGlzZmllZCBlODExXG5zZW50aW1lbnRfbmV1dHJhbCBlODEyXG5zZW50aW1lbnRfc2F0aXNmaWVkIGU4MTNcbnNlbnRpbWVudF92ZXJ5X2Rpc3NhdGlzZmllZCBlODE0XG5zZW50aW1lbnRfdmVyeV9zYXRpc2ZpZWQgZTgxNVxuc2V0dGluZ3MgZThiOFxuc2V0dGluZ3NfYXBwbGljYXRpb25zIGU4YjlcbnNldHRpbmdzX2JhY2t1cF9yZXN0b3JlIGU4YmFcbnNldHRpbmdzX2JsdWV0b290aCBlOGJiXG5zZXR0aW5nc19icmlnaHRuZXNzIGU4YmRcbnNldHRpbmdzX2NlbGwgZThiY1xuc2V0dGluZ3NfZXRoZXJuZXQgZThiZVxuc2V0dGluZ3NfaW5wdXRfYW50ZW5uYSBlOGJmXG5zZXR0aW5nc19pbnB1dF9jb21wb25lbnQgZThjMFxuc2V0dGluZ3NfaW5wdXRfY29tcG9zaXRlIGU4YzFcbnNldHRpbmdzX2lucHV0X2hkbWkgZThjMlxuc2V0dGluZ3NfaW5wdXRfc3ZpZGVvIGU4YzNcbnNldHRpbmdzX292ZXJzY2FuIGU4YzRcbnNldHRpbmdzX3Bob25lIGU4YzVcbnNldHRpbmdzX3Bvd2VyIGU4YzZcbnNldHRpbmdzX3JlbW90ZSBlOGM3XG5zZXR0aW5nc19zeXN0ZW1fZGF5ZHJlYW0gZTFjM1xuc2V0dGluZ3Nfdm9pY2UgZThjOFxuc2hhcmUgZTgwZFxuc2hvcCBlOGM5XG5zaG9wX3R3byBlOGNhXG5zaG9wcGluZ19iYXNrZXQgZThjYlxuc2hvcHBpbmdfY2FydCBlOGNjXG5zaG9ydF90ZXh0IGUyNjFcbnNob3dfY2hhcnQgZTZlMVxuc2h1ZmZsZSBlMDQzXG5zaWduYWxfY2VsbHVsYXJfNF9iYXIgZTFjOFxuc2lnbmFsX2NlbGx1bGFyX2Nvbm5lY3RlZF9ub19pbnRlcm5ldF80X2JhciBlMWNkXG5zaWduYWxfY2VsbHVsYXJfbm9fc2ltIGUxY2VcbnNpZ25hbF9jZWxsdWxhcl9udWxsIGUxY2ZcbnNpZ25hbF9jZWxsdWxhcl9vZmYgZTFkMFxuc2lnbmFsX3dpZmlfNF9iYXIgZTFkOFxuc2lnbmFsX3dpZmlfNF9iYXJfbG9jayBlMWQ5XG5zaWduYWxfd2lmaV9vZmYgZTFkYVxuc2ltX2NhcmQgZTMyYlxuc2ltX2NhcmRfYWxlcnQgZTYyNFxuc2tpcF9uZXh0IGUwNDRcbnNraXBfcHJldmlvdXMgZTA0NVxuc2xpZGVzaG93IGU0MWJcbnNsb3dfbW90aW9uX3ZpZGVvIGUwNjhcbnNtYXJ0cGhvbmUgZTMyY1xuc21va2VfZnJlZSBlYjRhXG5zbW9raW5nX3Jvb21zIGViNGJcbnNtcyBlNjI1XG5zbXNfZmFpbGVkIGU2MjZcbnNub296ZSBlMDQ2XG5zb3J0IGUxNjRcbnNvcnRfYnlfYWxwaGEgZTA1M1xuc3BhIGViNGNcbnNwYWNlX2JhciBlMjU2XG5zcGVha2VyIGUzMmRcbnNwZWFrZXJfZ3JvdXAgZTMyZVxuc3BlYWtlcl9ub3RlcyBlOGNkXG5zcGVha2VyX25vdGVzX29mZiBlOTJhXG5zcGVha2VyX3Bob25lIGUwZDJcbnNwZWxsY2hlY2sgZThjZVxuc3RhciBlODM4XG5zdGFyX2JvcmRlciBlODNhXG5zdGFyX2hhbGYgZTgzOVxuc3RhcnMgZThkMFxuc3RheV9jdXJyZW50X2xhbmRzY2FwZSBlMGQzXG5zdGF5X2N1cnJlbnRfcG9ydHJhaXQgZTBkNFxuc3RheV9wcmltYXJ5X2xhbmRzY2FwZSBlMGQ1XG5zdGF5X3ByaW1hcnlfcG9ydHJhaXQgZTBkNlxuc3RvcCBlMDQ3XG5zdG9wX3NjcmVlbl9zaGFyZSBlMGUzXG5zdG9yYWdlIGUxZGJcbnN0b3JlIGU4ZDFcbnN0b3JlX21hbGxfZGlyZWN0b3J5IGU1NjNcbnN0cmFpZ2h0ZW4gZTQxY1xuc3RyZWV0dmlldyBlNTZlXG5zdHJpa2V0aHJvdWdoX3MgZTI1N1xuc3R5bGUgZTQxZFxuc3ViZGlyZWN0b3J5X2Fycm93X2xlZnQgZTVkOVxuc3ViZGlyZWN0b3J5X2Fycm93X3JpZ2h0IGU1ZGFcbnN1YmplY3QgZThkMlxuc3Vic2NyaXB0aW9ucyBlMDY0XG5zdWJ0aXRsZXMgZTA0OFxuc3Vid2F5IGU1NmZcbnN1cGVydmlzb3JfYWNjb3VudCBlOGQzXG5zdXJyb3VuZF9zb3VuZCBlMDQ5XG5zd2FwX2NhbGxzIGUwZDdcbnN3YXBfaG9yaXogZThkNFxuc3dhcF92ZXJ0IGU4ZDVcbnN3YXBfdmVydGljYWxfY2lyY2xlIGU4ZDZcbnN3aXRjaF9jYW1lcmEgZTQxZVxuc3dpdGNoX3ZpZGVvIGU0MWZcbnN5bmMgZTYyN1xuc3luY19kaXNhYmxlZCBlNjI4XG5zeW5jX3Byb2JsZW0gZTYyOVxuc3lzdGVtX3VwZGF0ZSBlNjJhXG5zeXN0ZW1fdXBkYXRlX2FsdCBlOGQ3XG50YWIgZThkOFxudGFiX3Vuc2VsZWN0ZWQgZThkOVxudGFibGV0IGUzMmZcbnRhYmxldF9hbmRyb2lkIGUzMzBcbnRhYmxldF9tYWMgZTMzMVxudGFnX2ZhY2VzIGU0MjBcbnRhcF9hbmRfcGxheSBlNjJiXG50ZXJyYWluIGU1NjRcbnRleHRfZmllbGRzIGUyNjJcbnRleHRfZm9ybWF0IGUxNjVcbnRleHRzbXMgZTBkOFxudGV4dHVyZSBlNDIxXG50aGVhdGVycyBlOGRhXG50aHVtYl9kb3duIGU4ZGJcbnRodW1iX3VwIGU4ZGNcbnRodW1ic191cF9kb3duIGU4ZGRcbnRpbWVfdG9fbGVhdmUgZTYyY1xudGltZWxhcHNlIGU0MjJcbnRpbWVsaW5lIGU5MjJcbnRpbWVyIGU0MjVcbnRpbWVyXzEwIGU0MjNcbnRpbWVyXzMgZTQyNFxudGltZXJfb2ZmIGU0MjZcbnRpdGxlIGUyNjRcbnRvYyBlOGRlXG50b2RheSBlOGRmXG50b2xsIGU4ZTBcbnRvbmFsaXR5IGU0MjdcbnRvdWNoX2FwcCBlOTEzXG50b3lzIGUzMzJcbnRyYWNrX2NoYW5nZXMgZThlMVxudHJhZmZpYyBlNTY1XG50cmFpbiBlNTcwXG50cmFtIGU1NzFcbnRyYW5zZmVyX3dpdGhpbl9hX3N0YXRpb24gZTU3MlxudHJhbnNmb3JtIGU0MjhcbnRyYW5zbGF0ZSBlOGUyXG50cmVuZGluZ19kb3duIGU4ZTNcbnRyZW5kaW5nX2ZsYXQgZThlNFxudHJlbmRpbmdfdXAgZThlNVxudHVuZSBlNDI5XG50dXJuZWRfaW4gZThlNlxudHVybmVkX2luX25vdCBlOGU3XG50diBlMzMzXG51bmFyY2hpdmUgZTE2OVxudW5kbyBlMTY2XG51bmZvbGRfbGVzcyBlNWQ2XG51bmZvbGRfbW9yZSBlNWQ3XG51cGRhdGUgZTkyM1xudXNiIGUxZTBcbnZlcmlmaWVkX3VzZXIgZThlOFxudmVydGljYWxfYWxpZ25fYm90dG9tIGUyNThcbnZlcnRpY2FsX2FsaWduX2NlbnRlciBlMjU5XG52ZXJ0aWNhbF9hbGlnbl90b3AgZTI1YVxudmlicmF0aW9uIGU2MmRcbnZpZGVvX2NhbGwgZTA3MFxudmlkZW9fbGFiZWwgZTA3MVxudmlkZW9fbGlicmFyeSBlMDRhXG52aWRlb2NhbSBlMDRiXG52aWRlb2NhbV9vZmYgZTA0Y1xudmlkZW9nYW1lX2Fzc2V0IGUzMzhcbnZpZXdfYWdlbmRhIGU4ZTlcbnZpZXdfYXJyYXkgZThlYVxudmlld19jYXJvdXNlbCBlOGViXG52aWV3X2NvbHVtbiBlOGVjXG52aWV3X2NvbWZ5IGU0MmFcbnZpZXdfY29tcGFjdCBlNDJiXG52aWV3X2RheSBlOGVkXG52aWV3X2hlYWRsaW5lIGU4ZWVcbnZpZXdfbGlzdCBlOGVmXG52aWV3X21vZHVsZSBlOGYwXG52aWV3X3F1aWx0IGU4ZjFcbnZpZXdfc3RyZWFtIGU4ZjJcbnZpZXdfd2VlayBlOGYzXG52aWduZXR0ZSBlNDM1XG52aXNpYmlsaXR5IGU4ZjRcbnZpc2liaWxpdHlfb2ZmIGU4ZjVcbnZvaWNlX2NoYXQgZTYyZVxudm9pY2VtYWlsIGUwZDlcbnZvbHVtZV9kb3duIGUwNGRcbnZvbHVtZV9tdXRlIGUwNGVcbnZvbHVtZV9vZmYgZTA0Zlxudm9sdW1lX3VwIGUwNTBcbnZwbl9rZXkgZTBkYVxudnBuX2xvY2sgZTYyZlxud2FsbHBhcGVyIGUxYmNcbndhcm5pbmcgZTAwMlxud2F0Y2ggZTMzNFxud2F0Y2hfbGF0ZXIgZTkyNFxud2JfYXV0byBlNDJjXG53Yl9jbG91ZHkgZTQyZFxud2JfaW5jYW5kZXNjZW50IGU0MmVcbndiX2lyaWRlc2NlbnQgZTQzNlxud2Jfc3VubnkgZTQzMFxud2MgZTYzZFxud2ViIGUwNTFcbndlYl9hc3NldCBlMDY5XG53ZWVrZW5kIGUxNmJcbndoYXRzaG90IGU4MGVcbndpZGdldHMgZTFiZFxud2lmaSBlNjNlXG53aWZpX2xvY2sgZTFlMVxud2lmaV90ZXRoZXJpbmcgZTFlMlxud29yayBlOGY5XG53cmFwX3RleHQgZTI1YlxueW91dHViZV9zZWFyY2hlZF9mb3IgZThmYVxuem9vbV9pbiBlOGZmXG56b29tX291dCBlOTAwXG56b29tX291dF9tYXAgZTU2YlxuYDtcblxubGV0IGNvZGVwb2ludHMgPSBzLnRyaW0oKS5zcGxpdChcIlxcblwiKS5yZWR1Y2UoZnVuY3Rpb24oY3YsIG52KXtcbiAgICBsZXQgcGFydHMgPSBudi5zcGxpdCgvICsvKTtcbiAgICBsZXQgdWMgPSAnXFxcXHUnICsgcGFydHNbMV07XG4gICAgY3ZbcGFydHNbMF1dID0gZXZhbCgnXCInICsgdWMgKyAnXCInKTtcbiAgICByZXR1cm4gY3Y7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvZGVwb2ludHNcbn1cblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgVW5kb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxpbWl0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgY2xlYXIgKCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludGVyID0gLTE7XG4gICAgfVxuICAgIGdldCBjdXJyZW50U3RhdGUgKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyIDwgMClcbiAgICAgICAgICAgIHRocm93IFwiTm8gY3VycmVudCBzdGF0ZS5cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICBnZXQgaGFzU3RhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID49IDA7XG4gICAgfVxuICAgIGdldCBjYW5VbmRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+IDA7XG4gICAgfVxuICAgIGdldCBjYW5SZWRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU3RhdGUgJiYgdGhpcy5wb2ludGVyIDwgdGhpcy5oaXN0b3J5Lmxlbmd0aC0xO1xuICAgIH1cbiAgICBhZGQgKHMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFERFwiKTtcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdID0gcztcbiAgICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSh0aGlzLnBvaW50ZXIrMSk7XG4gICAgfVxuICAgIHVuZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVU5ET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5VbmRvKSB0aHJvdyBcIk5vIHVuZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgcmVkbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRURPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblJlZG8pIHRocm93IFwiTm8gcmVkby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVW5kb01hbmFnZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9