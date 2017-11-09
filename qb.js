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

var mines;
var name2mine;
var currMine;
var m;
var w;
var h;
var i;
var root;
var layoutStyle;
var diagonal;
var vis;
var currTemplate;
var currNode;
var layoutStyle = "tree";
var animationDuration = 250; // ms

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
var OPS = [

    // Valid for any attribute
    // Also the operators for loop constraints (not yet implemented).
    {
    op: "=",
    ctype: "value"
    },{
    op: "!=",
    ctype: "value"
    },
    
    // Valid for numeric and date attributes
    {
    op: ">",
    ctype: "value"
    },{
    op: ">=",
    ctype: "value"
    },{
    op: "<",
    ctype: "value"
    },{
    op: "<=",
    ctype: "value"
    },
    
    // Valid for string attributes
    {
    op: "CONTAINS",
    ctype: "value"
    },{
    op: "DOES NOT CONTAIN",
    ctype: "value"
    },{
    op: "LIKE",
    ctype: "value"
    },{
    op: "NOT LIKE",
    ctype: "value"
    },{
    op: "ONE OF",
    ctype: "multivalue"
    },{
    op: "NONE OF",
    ctype: "multivalue"
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
    ctype: "null"
    },{
    op: "IS NOT NULL",
    ctype: "null"
    },
    
    // Valid only at any non-attribute node (i.e., the root, or any 
    // reference or collection node).
    {
    op: "LOOKUP",
    ctype: "lookup"
    },{
    op: "IN",
    ctype: "list"
    },{
    op: "NOT IN",
    ctype: "list"
    },
    
    // Valid at any non-attribute node except the root.
    {
    op: "ISA",
    ctype: "subclass"
    }];

setup()

function setup(){
    name2mine = {};
    mines.forEach(function(m){ name2mine[m.name] = m; });
    currMine = mines[0];
    currTemplate = null;

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
    dg.classed("hidden",true)
    dg.select(".button.close").on("click", hideDialog);
    dg.select(".button.remove").on("click", removeNode);

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
            currNode.view = !currNode.view;
            update(currNode);
            d3.select("#dialog .select-ctrl").classed("selected", currNode.view);
        });

    // start with the first mine by default.
    selectedMine(mines[0].name);
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
    //turl = url + "service/templates?format=json";
    //murl = url + "service/model?format=json";
    turl = "./doc/templates.json"
    murl = "./doc/model.json"
    // get the model
    console.log("Loading resources:", murl, turl)
    d3.json(murl, function(model) {
        if( ! model || ! model.wasSuccessful ){
            alert("Could not load model from resource: " + murl);
            return;
        }
        compileModel(model)
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

// Returns an array containing the item values from the given object.
// The list is sorted by the item keys.
// If nameAttr is specified, those keys are also added to each element
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
    //
    model.model.allClasses = obj2array(model.model.classes)
    var cns = Object.keys(model.model.classes);
    cns.sort()
    cns.forEach(function(cn){
        var cls = model.model.classes[cn];
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
            var bc = model.model.classes[e];
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

function getSuperclasses(cls){
    if (!cls["extends"] || cls["extends"].length == 0) return [];
    var anc = cls["extends"].map(function(sc){ return getSuperclasses(sc); });
    var all = cls["extends"].concat(anc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return obj2array(ans);
}

// Returns a list of all the subclasses of the given class.
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSubclasses(cls){
    if (!cls.extendedBy || cls.extendedBy.length == 0) return [];
    var desc = cls.extendedBy.map(function(sc){ return getSubclasses(sc); });
    var all = cls.extendedBy.concat(desc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return obj2array(ans);
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
//   Turns each (string) path into a reference to a tree node corresponding to that path.
function compileTemplate(template, model) {
    var roots = []
    var t = template;
    // the tree of nodes representing the compiled query will go here
    t.qtree = null;
    // classify constraints
    var subclassCs = []
    t.where && t.where.forEach(function(c){
        if (c.type) {
            c.ctype = "subclass";
            subclassCs.push(c);
        }
        else if (c.op === "LOOKUP")
            c.ctype = "lookup";
        else if (c.op === "IN" || c.op === "NOT IN")
            c.ctype = "list";
        else if (c.op === "IS NULL" || c.op === "IS NOT NULL")
            c.ctype = "null"
        else
            c.ctype = "value";

    })
    // must process any subclass constraints first, from shortest to longest path
    subclassCs
        .sort(function(a,b){
            return a.path.length - b.path.length;
        })
        .forEach(function(c){
             var n = addPath(t, c.path, model);
             var cls = model.model.classes[c.type];
             if (!cls) throw RuntimeError("Could not find class " + c.type);
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
    t.select && t.select.forEach(function(p){
        var n = addPath(t, p, model);
        n.view = true;
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
    return t;
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
function uncompileTemplate(tmplt){
    t = {
        name: tmplt.name,
        title: tmplt.title,
        description: tmplt.description,
        comment: tmplt.comment,
        rank: tmplt.rank,
        model: deepc(tmplt.model),
        tags: deepc(tmplt.tags),
        select : [],
        where : [],
        joins : [],
        orderBy : deepc(tmplt.orderBy)
    }
    function reach(n){
        p = getPath(n)
        if (n.view) {
            t.select.push(p);
        }
        (n.constraints || []).forEach(function(c){
             t.where.push(c);
                
        })
        if (n.join === "outer") {
            t.joins.push(p);
        }
        n.children.forEach(reach);
    }
    reach(tmplt.qtree);
    return JSON.stringify(t);
}

//
function newNode(name, pcomp, ptype){
    return {
        name: name,     // display name
        children: [],   // child nodes
        parent: null,   // parent node
        pcomp: pcomp,   // path component represented by the node. At root, this is
                        // the starting class. Otherwise, points to an attribute (simple, 
                        // reference, or collection).
        ptype : ptype,  // path type. The type of the path at this node, i.e. the type of pcomp. 
                        // For simple attributes, this is a string. Otherwise,
                        // points to a class in the model. May be overriden by subclass constraint.
        subclassConstraint: null, // subclass constraint (if any). Points to a class in the model
                        // If specified, overrides ptype as the type of the node.
        constraints: [],// all constraints
        view: false     // attribute to be returned. Note only simple attributes can have view == true.
    };
}

function newConstraint(n) {
    return {
        ctype: "null",
        code: "?",
        path: getPath(n),
        op: "IS NOT NULL",
        value: "IS NOT NULL",
        values: null,
        type: null
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
//   The path is added, either to an existing trees or as a new tree..
//
function addPath(template, path, model){
    if (typeof(path) === "string")
        path = path.split(".");
    var classes = model.model.classes;
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
                    throw RuntimeError("Cannot add path from different root.");
            }
            else {
                // First path to be added
                cls = classes[p];
                if (!cls)
                   throw RuntimeError("Could not find class: " + p);
                n = template.qtree = newNode( p, cls, cls );
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
                    if (!cls) throw RuntimeError("Could not find class: " + p);
                } 
                else {
                    throw RuntimeError("Could not find member named " + p + " in class " + cls.name + ".");
                }
                // create new node, add it to n's children
                nn = newNode(p, x, cls);
                n.children.push(nn);
                n = nn;
            }
        }
    })

    // return the last node in the path
    return n;
}

//
function getPath(node){
    return (node.parent ? getPath(node.parent)+"." : "") + node.name;
}

// Args:
//   n (node) The node having the constraint.
//   scName (type) Name of subclass.
function setSubclassConstraint(n, scName){
    n.constraints = n.constraints.filter(function (c){ return c.ctype !== "subclass"; });
    if (scName === ""){
        n.subclassConstraint = null;
    }
    else {
        let cls = currMine.model.model.classes[scName];
        if(!cls) throw RuntimeError("Could not find class " + scName);
        n.subclassConstraint = cls;
        n.constraints.push({ ctype:"subclass", path:getPath(n), type:cls.name });
    }
    function check(node, removed) {
        var cls = n.subclassConstraint || node.ptype;
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
        console.log("Constraining to subclass " + scName 
                + " caused the following paths to be removed:", removed.map(getPath)); 
}

// Removes the current node and all its descendants.
//
function removeNode() {
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
    // Make sure the editor works on a copy of the template.
    //
    currTemplate = deepc(t);

    var ti = d3.select("#tInfo");
    ti.select(".name").select("input").attr("value", currTemplate.name)
    ti.select(".title").select("input").attr("value", currTemplate.title)
    ti.select(".description").select("textarea").text(currTemplate.description)
    ti.select(".comment").select("text").text(currTemplate.comment)

    root = compileTemplate(currTemplate, currMine.model).qtree
    root.x0 = h / 2;
    root.y0 = 0;
    update(root);
}

// Extends the path from currNode to p
// Args:
//   currNode (node) Node to extend from
//   p (string) Name of an attribute, ref, or collection
//   mode (string) one of "select", "constrain" or "open"
//
function selectedNext(currNode,p,mode){
    p = [ p ]
    for(var n = currNode; n; n = n.parent){
        p.unshift(n.name);
    }
    var n = addPath(currTemplate, p.join("."), currMine.model );
    if (mode === "selected")
        n.view = true;
    if (mode === "constrained" && n.constraints.length === 0) {
        n.constraints.push(newConstraint(n));
    }
    hideDialog();
    update(currNode);
    setTimeout(function(){ showDialog(n); }, animationDuration);
    
}

// Returns a text representation of a constraint
//
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

// Returns  the DOM element corresponding to the given data object.
//
function findDomByDataObj(d){
    var x = d3.selectAll(".nodegroup .node").filter(function(dd){ return dd === d; });
    return x[0][0];
}

//
function addConstraint(n) {
    n.constraints.push(newConstraint(n));
    update(n);
    showDialog(n, null, true);
}

//
function editConstraint(c, n, editBtn){
    console.log("Edit", c, n);

    var dbb = editBtn.parentElement.parentElement.parentElement.parentElement.getBoundingClientRect();
    var cbb = editBtn.parentElement.getBoundingClientRect();

    var ced = d3.select("#constraintEdit")
        .classed("open", true)
        .style("top", (cbb.top - dbb.top)+"px")
        .style("left", (cbb.left - dbb.left)+"px")
        ;

    var cops = d3.select("#constraintEdit select").selectAll("option").data(OPS);
    cops.enter()
        .append("option")
        .text(function(o){return o.op})
        ;

    d3.select("#constraintEdit .button.close")
        .on("click", function(){ d3.select("#constraintEdit").classed("open", null); });

}
//
function removeConstraint(c, n){
    n.constraints = n.constraints.filter(function(cc){ return cc !== c; });
    update(n);
    showDialog(n, null, true);
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
 
  // Set the global currNode
  currNode = n;
  var isroot = ! currNode.parent;
  //
  var dialog = d3.select("#dialog").datum(n);
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
      .style("transform", refreshOnly?"scale(1)":"scale(1e-6)")
      .style("transform-origin", "0% 0%")
      .classed("hidden", false)
      .classed("isroot", isroot)
      ;

  // Set the dialog title to node name
  dialog.select(".header .dialogTitle span")
      .text(n.name);
  // Show the full path
  dialog.select(".header .fullPath div")
      .text(getPath(n));

  //
  dialog.select("#dialog .constraintSection .add-button")
        .on("click", function(){ addConstraint(n); });

  // Fill out the constraints section
  // (Don't list ISA constraint here. It is handled separately.)
  var constrs = dialog.select(".constraintSection")
      .selectAll(".constraint")
      .data(n.constraints
          .filter(function(c){ return c.ctype != "subclass";})
          );
  // Create divs for entering
  var cdivs = constrs.enter()
      .append("div")
      .attr("class","constraint")
      ;
  cdivs.append("div")
      .attr("class", "op")
      ;
  cdivs.append("div")
      .attr("class", "value")
      ;
  cdivs.append("div")
      .attr("class", "code")
      ;
  cdivs.append("i")
      .attr("class", "material-icons edit")
      .text("mode_edit")
      ;
  cdivs.append("i")
      .attr("class", "material-icons cancel")
      .text("cancel")
      ;

  // Remove exiting
  constrs.exit()
      .remove() ;

  // Set the text
  constrs
      .attr("class", function(c) { return "constraint " + c.ctype; });
  constrs.select(".code")
      .text(function(c){ return "("+c.code+")" || ""; });
  constrs.select(".op")
      .text(function(c){ return c.op || "ISA"; });
  constrs.select(".value")
      .text(function(c){
          return c.value || (c.values && c.values.join(",")) || c.type;
      });
  constrs.select("i.edit")
      .on("click", function(c){ 
          editConstraint(c, n, this);
      });
  constrs.select("i.cancel")
      .on("click", function(c){ 
          removeConstraint(c, n);
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
          .classed("selected", function(n){ return n.view; });
  }
  else {
      // Dialog for classes
      dialog
          .classed("simple",false);
      dialog.select("span.clsName")
          .text(n.pcomp.type ? n.pcomp.type.name : n.pcomp.name);
      // Fill in the subclass constraint selection list.
      // First find all the subclasses of the node's class.
      var scs = isroot ? [] : getSubclasses(n.pcomp.kind ? n.pcomp.type : n.pcomp);
      scs.unshift(n.pcomp.kind ? n.pcomp.type : n.pcomp)
      var scOpts = dialog
          .select(".subclassConstraint select")
          .selectAll("option")
          .data(scs) ;
      scOpts.enter()
          .append("option");
      scOpts
          .attr("value", function(d,i){ return i === 0 ? "" : d.name; })
          .text(function(d){ return d.name; });
      scOpts.filter(function(d){ return d.name === ((n.subclassConstraint || n.ptype).name || n.ptype); })
          .attr("selected","true")
          ;
      scOpts.exit().remove();

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
                  name: '<i class="material-icons">play_arrow</i>',
                  cls: 'selectsimple',
                  click: function (){selectedNext(currNode,comp.name,"selected"); }
                  },{
                  name: '<i class="material-icons">play_arrow</i>',
                  cls: 'constrainsimple',
                  click: function (){selectedNext(currNode,comp.name,"constrained"); }
                  }];
              }
              else {
              return [{
                  name: comp.name,
                  cls: ''
                  },{
                  name: '<i class="material-icons">play_arrow</i>',
                  cls: 'opennext',
                  click: function (){selectedNext(currNode,comp.name,"open"); }
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
  d3.select("#constraintEdit")
      .classed("open", null)
      ;
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
  var duration = animationDuration * (d3.event && d3.event.altKey ? 10 : 1);


  var nl = doLayout(root);
  var nodes = nl[0];
  var links = nl[1];

  // Update the nodes…
  var nodeGrps = vis.selectAll("g.nodegroup")
      .data(nodes, function(d) { return d.id || (d.id = ++i); })
      ;

  // Create new nodes at the parent's previous position.
  var nodeEnter = nodeGrps.enter()
      .append("svg:g")
      .attr("class", "nodegroup")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      ;

  // Add glyph for the node
  //nodeEnter.append("svg:circle")
  nodeEnter.append(function(d){
      var shape = (d.pcomp.kind == "attribute" ? "rect" : "circle");
      return document.createElementNS("http://www.w3.org/2000/svg", shape);
      })
      .attr("class","node")
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
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6) // start off nearly transparent
      .attr("class","nodeName")
      ;

  // Transition nodes to their new position.
  var nodeUpdate = nodeGrps
      .classed("selected", function(n){ return n.view; })
      .classed("constrained", function(n){ return n.constraints.length > 0; })
      .transition()
      .duration(duration)
      .attr("transform", function(n) { return "translate(" + n.y + "," + n.x + ")"; })
      ;

  nodeGrps.selectAll("text.constraint").remove();

  // Add text for constraints
  nodeGrps.append("svg:text")
       .attr("x", 0)
       .attr("dy", "1.7em")
       .attr("text-anchor","start")
       .attr("class","constraint")
       .html(function(d){
           var strs = (d.constraints || []).map(constraintText);
           return strs.join(' / ');
       })
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
  var nodeExit = nodeGrps.exit().transition()
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
      .classed("attribute", function(n) { return n.target.pcomp.kind === "attribute"; })
      .on("click", function(l){ 
          if (l.target.pcomp.kind == "attribute") return;
          l.target.join = (l.target.join ? null : "outer");
          update(l.source);
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal)
      ;

  // Transition links to their new position.
  link.classed("outer", function(n) { return n.target.join === "outer"; })
      .transition()
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
  //
  d3.select("#ttext textarea")
      .text(uncompileTemplate(currTemplate));
}

})()
