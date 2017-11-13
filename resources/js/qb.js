
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
import parser from './parser.js';
import { mines } from './mines.js';
import { NUMERICTYPES, NULLABLETYPES, OPS, OPINDEX } from './ops.js';

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
    var url = currMine.url;
    var turl, murl;
    currMine.tnames = []
    currMine.templates = []
    if (mname === "testing") { 
        turl = url + "templates.json"
        murl = url + "model.json"
    }
    else {
        turl = url + "service/templates?format=json";
        murl = url + "service/model?format=json";
    }
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
            currMine.tlist = obj2array(currMine.templates)
            currMine.tlist.sort(function(a,b){ 
                return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
            });
            currMine.tnames = Object.keys( currMine.templates );
            currMine.tnames.sort();
            var tl = d3.select("#tlist").selectAll('option').data( currMine.tlist );
            tl.enter().append('option')
            tl.exit().remove()
            tl.attr("value", function(d){ return d.name; })
              .text(function(d){return d.name;});
            d3.select("#tlist").on("change", function(){ selectedTemplate(this.value); });
            selectedTemplate(currMine.tlist[0].name);
            })
    })
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
//   Adds this tree to the template object as attribute 'qtree'.
//   Turns each (string) path into a reference to a tree node corresponding to that path.
function compileTemplate(template, model) {
    var roots = []
    var t = template;
    // the tree of nodes representing the compiled query will go here
    t.qtree = null;
    // index of code to constraint gors here.
    t.code2c = {}
    //
    var subclassCs = [];
    t.where && t.where.forEach(function(c){
        if (c.code) t.code2c[c.code] = c;
        if (c.type) {
            c.ctype = "subclass";
            c.op = "ISA"
            subclassCs.push(c);
        }
        else if (c.op === "LOOKUP")
            c.ctype = "lookup";
        else if (c.op === "IN" || c.op === "NOT IN")
            c.ctype = "list";
        else if (c.op === "IS NULL" || c.op === "IS NOT NULL")
            c.ctype = "null"
        else if (c.op === "ONE OF" || c.op === "NONE OF")
            c.ctype = "multivalue";
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

// Turns a qtree structure back into a raw template.
//
function uncompileTemplate(tmplt){
    var t = {
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
        constraintLogic: tmplt.constraintLogic || "",
        orderBy : deepc(tmplt.orderBy) || []
    }
    function reach(n){
        var p = getPath(n)
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
    return t
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
        code: nextAvailableCode(currTemplate),
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
                    throw "Cannot add path from different root.";
            }
            else {
                // First path to be added
                cls = classes[p];
                if (!cls)
                   throw "Could not find class: " + p;
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
                    if (!cls) throw "Could not find class: " + p;
                } 
                else {
                    throw "Could not find member named " + p + " in class " + cls.name + ".";
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
    // remove any existing subclass constraint
    n.constraints = n.constraints.filter(function (c){ return c.ctype !== "subclass"; });
    n.subclassConstraint = null;
    if (scName){
        let cls = currMine.model.model.classes[scName];
        if(!cls) throw "Could not find class " + scName;
        n.constraints.push({ ctype:"subclass", op:"ISA", path:getPath(n), type:cls.name });
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
            + removed.map(getPath).join(", ")); 
        }, animationDuration);
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
    if (!t) {
        return;
    }
    // Make sure the editor works on a copy of the template.
    //
    currTemplate = deepc(t);
    root = compileTemplate(currTemplate, currMine.model).qtree
    root.x0 = h / 2;
    root.y0 = 0;
    console.log(currTemplate);

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
    var ast;
    try {
        ast = parser.parse(ex);
    }
    catch (err) {
        alert(err);
        return tmplt.constraintLogic;
    }
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
    //
    var lex = reach(ast,0);
    // if any constraint codes in the template were not seen in the expression,
    // AND them into the expression (except ISA constraints).
    var toAdd = Object.keys(tmplt.code2c).filter(function(c){
        return seen.indexOf(c) === -1 && c.op !== "ISA";
    });

    lex = (lex ? [lex]:[]).concat(toAdd).join(" and ")
    //
    tmplt.constraintLogic = lex;

    d3.select('#tInfo [name="logicExpression"] input')
        .call(function(){ this[0][0].value = lex; });

    return lex;
}

// Extends the path from currNode to p
// Args:
//   currNode (node) Node to extend from
//   p (string) Name of an attribute, ref, or collection
//   mode (string) one of "select", "constrain" or "open"
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
function selectedNext(currNode,p,mode){
    var cc;
    p = [ p ]
    for(var n = currNode; n; n = n.parent){
        p.unshift(n.name);
    }
    var n = addPath(currTemplate, p.join("."), currMine.model );
    if (mode === "selected")
        n.view = true;
    if (mode === "constrained" && n.constraints.length === 0) {
        cc = addConstraint(n, false)
    }
    hideDialog();
    update(currNode);
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
   var t = "";
   if (!c) return "";
   if (c.op === "ISA"){
       t = "ISA " + (c.type || "?");
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

function openConstraintEditor(c, n){

    var isroot = ! n.parent;
 
    var cdiv;
    d3.selectAll("#dialog .constraint")
        .each(function(cc){
            if(cc === c) cdiv = this;
        });

    // bounding box of the constraint's container div
    var cbb = cdiv.getBoundingClientRect();
    // bounding box of the app's main body element
    var dbb = d3.select("#body")[0][0].getBoundingClientRect();

    var ced = d3.select("#constraintEditor")
        .attr("class", c.ctype)
        .classed("open", true)
        .style("top", (cbb.top - dbb.top)+"px")
        .style("left", (cbb.left - dbb.left)+"px")
        ;

    var o2; 
    var cops = d3.select('#constraintEditor select[name="op"]')
        .selectAll("option")
        .data(OPS.filter(function(op){ return opValidFor(op, n); }));
    cops.enter()
        .append("option");
    cops.exit()
        .remove();
    cops
        .text(function(o){ return o.op; }) ;

    // Fill in the subclass constraint selection list.
    // First find all the subclasses of the node's class.
    var scs = isroot ? [] : getSubclasses(n.pcomp.kind ? n.pcomp.type : n.pcomp);
    var scOpts = d3.select('#constraintEditor select[name="type"]')
        .selectAll("option")
        .data(scs) ;
    scOpts.enter()
        .append("option");
    scOpts.exit().remove();
    scOpts
        .attr("value", function(d,i){ return d.name; })
        .text(function(d){ return d.name; });
    scOpts.filter(function(d){ return d.name === ((n.subclassConstraint || n.ptype).name || n.ptype); })
        .attr("selected","true")
        ;

    d3.select('#constraintEditor [name="op"]')[0][0].value = c.op;
    d3.select('#constraintEditor [name="value"]')[0][0].value = c.ctype==="null" ? "" : c.value;
    d3.select('#constraintEditor [name="values"]')[0][0].value = deepc(c.values);
    d3.select('#constraintEditor [name="type"]')[0][0].value = c.type;
    d3.select('#constraintEditor [name="code"]').text(c.code);

    // When user selects an operator, add a class to the c.e.'s container
    d3.select('#constraintEditor [name="op"]')
        .on("change", function(c){
            var op = OPINDEX[this.value];
            d3.select("#constraintEditor")
                .attr("class", "open " + op.ctype)
        })
        ;

    d3.select("#constraintEditor .button.close")
        .on("click", hideConstraintEditor);

    d3.select("#constraintEditor .button.save")
        .on("click", function(){ saveConstraintEdits(n, c) });

}
//
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

//
function addConstraint(n, updateUI) {
    var c = newConstraint(n);
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
function removeConstraint(c, n){
    n.constraints = n.constraints.filter(function(cc){ return cc !== c; });
    currTemplate.where = currTemplate.where.filter(function(cc){ return cc !== c; });
    delete currTemplate.code2c[c.code];
    if (c.ctype === "subclass") n.subclassConstraint = null;
    setLogicExpression(currTemplate.constraintLogic, currTemplate);
    //
    update(n);
    showDialog(n, null, true);
}
//
function saveConstraintEdits(n, c){
    var xs = d3.selectAll("#constraintEditor .in")[0]
        .filter(function(x){ return d3.select(x).style("display") !== "none"; })
        ;
    xs.forEach(function(x){ c[x.name] = x.value; });
    c.ctype = OPINDEX[c.op].ctype;
    if (c.ctype === "null") 
        c.value = c.op;
    else if (c.ctype === "subclass"){
        setSubclassConstraint(n, c.type)
        c.value = n.subclassConstraint.name;
    }
    hideConstraintEditor();
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
  hideConstraintEditor();
 
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
  dialog.select('[name="header"] [name="dialogTitle"] span')
      .text(n.name);
  // Show the full path
  dialog.select('[name="header"] [name="fullPath"] div')
      .text(getPath(n));
  // Type at this node
  var tp = n.ptype.name || n.ptype;
  var stp = (n.subclassConstraint && n.subclassConstraint.name) || null;
  var tstring = stp && `<span style="color: purple;">${stp}</span> (${tp})` || tp
  dialog.select('[name="header"] [name="type"] div')
      .html(tstring);

  //
  dialog.select("#dialog .constraintSection .add-button")
        .on("click", function(){ addConstraint(n, true); });

  // Fill out the constraints section
  // (Don't list ISA constraint here. It is handled separately.)
  var constrs = dialog.select(".constraintSection")
      .selectAll(".constraint")
      .data(n.constraints);
  // Create divs for entering
  var cdivs = constrs.enter()
      .append("div")
      .attr("class","constraint")
      ;
  cdivs.append("div")
      .attr("name", "op")
      ;
  cdivs.append("div")
      .attr("name", "value")
      ;
  cdivs.append("div")
      .attr("name", "code")
      ;
  cdivs.append("i")
      .attr("class", "material-icons edit")
      .text("mode_edit")
      ;
  cdivs.append("i")
      .attr("class", "material-icons cancel")
      .text("delete_forever")
      ;

  // Remove exiting
  constrs.exit()
      .remove() ;

  // Set the text
  constrs
      .attr("class", function(c) { return "constraint " + c.ctype; });
  constrs.select('[name="code"]')
      .text(function(c){ return c.code || "?"; });
  constrs.select('[name="op"]')
      .text(function(c){ return c.op || "ISA"; });
  constrs.select('[name="value"]')
      .text(function(c){
          return c.value || (c.values && c.values.join(",")) || c.type;
      });
  constrs.select("i.edit")
      .on("click", function(c){ 
          editConstraint(c, n);
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
  
  if (layoutStyle === "tree") {
      layout = d3.layout.tree()
          .size([h, w]);
  }
  else {
      function md (n) {
          return 1 + (n.children.length ? Math.max.apply(null, n.children.map(md)) : 0);
      };
      var maxd = md(root);
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

  updateTtext();
}

// Turns a json representation of a template into XML, suitable for importing into the Intermine QB.
function json2xml(t){
    var so = t.orderBy.reduce(function(s,x){ 
        var k = Object.keys(x)[0];
        var v = x[k]
        return s + `${k} ${v} `;
    }, "");

    var esc = function(s){ return s.replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/&/g, "&amp;"); };
    function c2xml(c){
        var g;
        if (c.ctype === "value" || c.ctype === "lookup" || c.ctype === "list")
            g = `path="${c.path}" op="${esc(c.op)}" value="${esc(c.value)}" code="${c.code}" editable="${c.editable}"`
        else if (c.ctype === "multivalue")
            g = `path="${c.path}" op="${esc(c.op)}" value="${esc(c.values)}" code="${c.code}" editable="${c.editable}"`
        else if (c.ctype === "subclass")
            g = `path="${c.path}" type="${c.type}" editable="false"`
        else if (c.ctype === "null")
            g = `path="${c.path}" op="${c.op}" code="${c.code}" editable="${c.editable}"`
        return `<constraint ${g} />\n`
    }

    var qtmplt = 
    `<query
      name="${t.name}"
      model="${t.model.name}"
      view="${t.select.join(' ')}"
      longDescription="${esc(t.description)}"
      sortOrder="${so}"
      constraintLogic="${t.constraintLogic}"
      >
      ${t.where.map(c2xml).join(" ")}
    </query>
`;
    var tmplt = 
    `<template
      name="${t.name}"
      title="${esc(t.title)}"
      comment="${esc(t.comment)}"
      >
     ${qtmplt}
     </template>
`;
    return tmplt
}

//
function updateTtext(){
  var txt = json2xml(uncompileTemplate(currTemplate));
  var linkurl = currMine.url + "loadQuery.do?skipBuilder=true&method=xml&trail=%7Cquery&query=" 
      + encodeURIComponent(txt);
  d3.select('#ttext [name="runquery"]')
      .attr("href", linkurl);
  d3.select("#ttext textarea") 
      //.text(JSON.stringify(uncompileTemplate(currTemplate)));
      //.text(encodeURI(linkurl))
      //.text(linkurl)
      .text(txt)
      .on("focus", function(){ this.select() });
}

//
setup()
//
