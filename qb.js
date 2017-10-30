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
(function(){
var mines = [{
    "name" : "MouseMine",
    "url" : "http://www.mousemine.org/mousemine/",
    "templates" : null,
    "model" : null
    },{
    "name" : "RatMine",
    "url" : "http://ratmine.mcw.edu/ratmine/",
    "templates" : null,
    "model" : null
    },{
    "name" : "FlyMine",
    "url" : "http://www.flymine.org/query/",
    "templates" : null,
    "model" : null
    }];



var mines, name2mine, currMine, m, w, h, i, root, layoutStyle, diagonal, vis, currNode;
var layoutStyle = "tree";

setup()

function setup(){
    name2mine = {};
    mines.forEach(function(m){ name2mine[m.name] = m; });
    currMine = mines[0];

    m = [20, 120, 20, 120]
    w = 1280 - m[1] - m[3]
    h = 800 - m[0] - m[2]
    i = 0

    diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    // create the SVG container
    vis = d3.select("#body").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    //
    d3.select("#body").select("svg")
        .on("click", hideDialog)
        ;
    // populate the option list of mines
    var ml = d3.select("#mlist").selectAll("option").data(mines);
    ml.enter().append("option")
        .attr("value", function(d){return d.name;})
        .text(function(d){ return d.name; });
    // when a mine is selected from the list
    d3.select("#mlist")
        .on("change", function(){ selectedMine(this.value); });
    //
    var dg = d3.select("#dialog");
    dg.style("display","none");
    dg.select(".closeButton").on("click", hideDialog);
    dg.select(".removeButton").on("click", removeNode);

    // 
    //
    d3.select("#layoutstyle")
        .on("change", function () { setLayout(this.value); })
        ;

    // start with the first mine by default.
    selectedMine(mines[0].name);
}

// Extends the path from currNode to p
// Args:
//   currNode (node) Node to extend from
//   p (string) Name of an attribute, ref, or collection
function selectedNext(currNode,p){
    p = [ p ]
    for(var n = currNode; n; n = n.parent){
        p.unshift(n.name);
    }
    var n = addPath( [root], p.join(".") );
    n.view = true;
    hideDialog();
    update(currNode);
}

// Called when user selects a mine from the option list
// Loads that mine's data model and all its templates.
// Then initializes display to show the first termplate's query.
function selectedMine(mname){
    currMine = name2mine[mname]
    if(!currMine) return;
    url = currMine.url
    currMine.tnames = []
    currMine.templates = []
    turl = url + "service/templates?format=json";
    murl = url + "service/model?format=json";
    // get the model
    d3.json(murl, function(model) {
        if( ! model || ! model.wasSuccessful ){
            alert("Could not load model from resource: " + murl);
            return;
        }
        createModelXrefs(model)
        currMine.model = model;
        // get the templates
        d3.json(turl, function(json) {
            if( ! json || ! json.wasSuccessful ){
                alert("Could not load templates from resource: " + turl);
                return;
            }
            currMine.templates = json.templates;
            currMine.tnames = Object.keys( currMine.templates );
            currMine.tnames.sort();
            var tl = d3.select("#tlist").selectAll('option').data( currMine.tnames );
            tl.enter().append('option')
            tl.text(function(d){return d;});
            tl.exit().remove()
            d3.select("#tlist").on("change", function(){ selectedTemplate(this.value); });
            selectedTemplate(currMine.tnames[0]);
            })
    })
}

function obj2array(o, nameAttr){
    var ks = Object.keys(o);
    ks.sort();
    return ks.map(function (k) {
        if (nameAttr) o[k].name = k;
        return o[k];
    });
}

// Add direct cross references to named types. (E.g., where the
// model says that Gene.alleles is a collection whose referencedType
// is the string "Allele", add a direct reference to the Allele class)
// Also adds arrays for convenience for accessing all classes or all attributes of a class.
//
function createModelXrefs(model){
    model.model.allClasses = obj2array(model.model.classes)
    var cns = Object.keys(model.model.classes);
    cns.sort()
    cns.forEach(function(cn){
        var cls = model.model.classes[cn];
        cls.type = cls;
        cls.allAttributes = obj2array(cls.attributes)
        cls.allReferences = obj2array(cls.references)
        cls.allCollections = obj2array(cls.collections)
        cls.allAttributes.forEach(function(x){ x.kind = "attribute"; });
        cls.allReferences.forEach(function(x){ x.kind = "reference"; });
        cls.allCollections.forEach(function(x){ x.kind = "collection"; });
        cls.allParts = cls.allAttributes.concat(cls.allReferences).concat(cls.allCollections);
        cls.allParts.sort(function(a,b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
        model.model.allClasses.push(cls);
        //
        cls["extends"] = cls["extends"].map(function(e){
            return model.model.classes[e]
        });
        //
        Object.keys(cls.references).forEach(function(rn){
            var r = cls.references[rn];
            r.type = model.model.classes[r.referencedType]
        });
        //
        Object.keys(cls.collections).forEach(function(cn){
            var c = cls.collections[cn];
            c.type = model.model.classes[c.referencedType]
        });
    });
    console.log(model)
}

// Given a (string) path and a model, traces the path through the model and returns the
// corresponding list of model components: the first item is the starting class, and
// successive items are reference, collection, and attribute descriptors, 
//
function getPathComponents(path, model){
    if (typeof(path) === "string") path = path.split(".");
    var classes = model.model.classes;
    var cls ;
    var components = path.map(function(p, i){
        if (i===0) {
            // First component in a path is the starting class name
            cls = classes[p];
            if (!cls) throw RuntimeError("Could not find class: " + p);
            return cls
        }
        else {
            // successive components name attributes, references, or collections
            var x;
            if (cls.attributes[p]) {
                x = cls.attributes[p];
                cls = x.type
                return x
            } 
            else if (cls.references[p] || cls.collections[p]) {
                x = cls.references[p] || cls.collections[p];
                cls = classes[x.referencedType]
                if (!cls) throw RuntimeError("Could not find class: " + p);
                return x
            }
        }
    });
    return components;
}

// Adds a path to the current diagram. Path is specified as a dotted list of names.
// Args:
//   trees (list) the current list of roots of path trees. 
//   path (string) the path to add. 
// Returns:
//   last path component created. 
// Side effects:
//   The path is added, either to an existing trees or as a new tree..
//
function addPath(trees, path){
    var cpath = getPathComponents(path, currMine.model);
    function find(list, n){
         return list.filter(function(x){return x.name === n})[0]
    }
    var parts = path.split(".");
    var lastt = null
    var lst = trees;
    parts.forEach(function(p,j){ 
        var t = find(lst, p);
        if(!t){
            t = { name: p, children: [], pcomp: cpath[j] }
            lst.push(t)
        }
        lastt = t
        lst = t.children
    });
    return lastt
}

// Removes the current node and all its descendants.
//
function removeNode() {
    console.log(currNode);
    var p = currNode.parent;
    if (p) {
        p.children.splice(p.children.indexOf(currNode), 1);
        hideDialog();
        update(p);
    }
    else {
        hideDialog()
    }
}

// Called when the user selects a template from the list.
// Gets the template from the current mine and builds a set of nodes
// for d3 tree display.
//
function selectedTemplate (tname) {
    var t = currMine.templates[tname];
    console.log(tname, t);
    if (!t) {
        return;
    }
    var ti = d3.select("#tInfo");
    ti.select(".title").text(t.title)
    ti.select(".description").text(t.description)
    ti.select(".comment").text(t.comment)

    var roots = []
    t.select && t.select.forEach(function(p){
        var n = addPath(roots, p);
        n.view = true;
    })
    t.where && t.where.forEach(function(c){
        var n = addPath(roots, c.path);
        n.constraint = c;
    })
    t.joins && t.joins.forEach(function(j){
        var n = addPath(roots, j);
        n.join = "outer";
    })
    draw(roots[0]);
}

function draw(json) {
  root = json;
  root.x0 = h / 2;
  root.y0 = 0;

  update(root);
}

function constraintText(c) {
   var t = "";
   if (!c) return "";
   if (!c.op){
       t = c.type ? "ISA " + c.type : "?";
   }
   else if (c.value !== undefined){
       t = c.op + (c.op.includes("NULL") ? "" : " " + c.value)
   }
   else if (c.values !== undefined){
       t = c.op + " " + c.values
   }
   return (c.code ? "("+c.code+") " : "") + t;
}

function showDialog(n, elt){
  currNode = n;
  var dialog = d3.select("#dialog");
  //
  var dbb = dialog[0][0].getBoundingClientRect();
  var ebb = elt.getBoundingClientRect();
  var bbb = d3.select("body")[0][0].getBoundingClientRect();
  var t = (ebb.top - bbb.top) + ebb.width/2;
  var l = (ebb.left - bbb.left) + ebb.height/2;

  //
  dialog
      .style("top", t+"px")
      .style("left", l+"px")
      .style("display","block")
      .style("transform", "scale(1e-6)")
      .style("transform-origin", "0% 0%")
      ;
  dialog.transition()
      .duration(500)
      .style("transform","scale(1.0)");
  var t = n.pcomp.type;
  if (typeof(t) === "string") {
      // simple attributes.
      dialog.select("span.clsName")
          .text(n.pcomp.type.name || n.pcomp.type );
      dialog.select("table.attributes")
          .style("display","none");
  }
  else {
      // classes
      dialog.select("span.clsName")
          .text(n.pcomp.type.name || n.pcomp.type );
      var tbl = dialog.select("table.attributes");
      tbl.style("display","block");
      var rows = tbl.selectAll("tr")
          .data(n.pcomp.type.allParts)
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
                  name: "S",
                  cls: 'select',
                  click: function (){selectedNext(currNode,comp.name); }
                  },{
                  name: "C",
                  cls: 'constraint',
                  click: function (){selectedNext(currNode,comp.name); }
                  }];
              }
              else {
              return [{
                  name: comp.name,
                  cls: ''
                  },{
                  name: ">",
                  cls: '',
                  click: function (){selectedNext(currNode,comp.name); }
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
          .text(function(d){return d.name;})
          .on("click", function(d){ return d.click && d.click(); })
          ;
      cells.exit().remove();
  }
}

function hideDialog(){
  currNode = null;
  var dialog = d3.select("#dialog");
  dialog
      .transition()
      .duration(250)
      .style("transform","scale(1e-6)")
      ;
  //dialog .style("display","none") ;
}

function setLayout(style){
    layoutStyle = style;
    doLayout(root);
    update(root);
}

function doLayout(root){
  var layout;
  
  if (layoutStyle === "tree") {
      layout = d3.layout.tree()
          .size([h, w]);
  }
  else {
      var maxd = 0;
      function md (n) { maxd = Math.max(maxd, n.depth); n.children.forEach( md ) };
      md(root);
      layout = d3.layout.cluster()
          .size([h, maxd * 180]);
  }

  // Compute the new layout.
  var nodes = layout.nodes(root).reverse();

  // Normalize for fixed-depth.
  if (layoutStyle === "tree")
      nodes.forEach(function(d) { d.y = d.depth * 180; });

  var links = layout.links(nodes);

  return [nodes, links]
}

// --------------------------------------------------------------------------
// update(n) 
// The main drawing routine. 
// Updates the SVG, using n as the source of any entering/exiting animations.
//
function update(source) {
  // User can slow things down by holding the altKey on clicks and such.
  var duration = d3.event && d3.event.altKey ? 2000 : 250;

  var nl = doLayout(root);
  var nodes = nl[0];
  var links = nl[1];

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); })
      ;

  // Create new nodes at the parent's previous position.
  var nodeEnter = node.enter()
      .append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      ;

  // Add glyph for the node
  //nodeEnter.append("svg:circle")
  nodeEnter.append(function(d){
      var shape = (d.pcomp.kind == "attribute" ? "rect" : "circle");
      return document.createElementNS("http://www.w3.org/2000/svg", shape);
      })
      .style("fill", function(d) { return d.view ? "green" : "#fff"; })
      .style("stroke-width", function(d) { return d.constraint ? "2" : "1"})
      .style("stroke", function(d) { return d.constraint ? "purple" : "black"})
      .on("mouseover", function(d) { if (currNode !== d) showDialog(d, this); })
      ;
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
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6) // start off nearly transparent
      ;

  // Add text for constraints
  nodeEnter.append("svg:text")
       .attr("x", 0)
       .attr("dy", "1.7em")
       .attr("text-anchor","start")
       .text(function(d){
           var c = d.constraint;
           return constraintText(c)
       })
       .attr("stroke","purple")
       ;

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
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
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
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

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(links, function(d) { return d.target.id; })
      ;

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .style("stroke-dasharray", function(d) { return d.target.join === "outer" ? "3 3" : "none"; })
      .style("stroke", function(d) { return d.target.join === "outer" ? "orange" : "#ccc"; })
      .style("stroke-width", function(d) { return d.target.join === "outer" ? "3" : "1.5"; })
    .transition()
      .duration(duration)
      .attr("d", diagonal)
      ;

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal)
      ;

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove()
      ;

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

})()
