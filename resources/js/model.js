import { NUMERICTYPES, NULLABLETYPES, LEAFTYPES, OPS, OPINDEX } from './ops.js';
import { esc, deepc, obj2array } from './utils.js';
import parser from './parser.js';

// Add direct cross references to named types. (E.g., where the
// model says that Gene.alleles is a collection whose referencedType
// is the string "Allele", add a direct reference to the Allele class)
// Also adds arrays for convenience for accessing all classes or all attributes of a class.
//
class Model {
    constructor (cfg, mine) {
        let model = this;
        this.mine = mine;
        this.package = cfg.package;
        this.name = cfg.name;
        this.classes = deepc(cfg.classes);

        // First add classes that represent the basic type
        LEAFTYPES.forEach( n => {
            this.classes[n] = {
                isLeafType: true,   // distinguishes these from model classes
                name: n,
                displayName: n,
                attributes: [],
                references: [],
                collections: [],
                extends: []
            }
        });
        //
        this.allClasses = obj2array(this.classes)
        let cns = Object.keys(this.classes);
        cns.sort()
        cns.forEach(function(cn){
            let cls = model.classes[cn];
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
                let bc = model.classes[e];
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
                let r = cls.references[rn];
                r.type = model.classes[r.referencedType]
            });
            //
            Object.keys(cls.collections).forEach(function(cn){
                let c = cls.collections[cn];
                c.type = model.classes[c.referencedType]
            });
        });
    }
} // end of class Model

//
class Class {
} // end of class Class

// Returns a list of all the superclasses of the given class.
// (
// The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSuperclasses(cls){
    if (typeof(cls) === "string" || !cls["extends"] || cls["extends"].length == 0) return [];
    let anc = cls["extends"].map(function(sc){ return getSuperclasses(sc); });
    let all = cls["extends"].concat(anc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    let ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
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
    let desc = cls.extendedBy.map(function(sc){ return getSubclasses(sc); });
    let all = cls.extendedBy.concat(desc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    let ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return obj2array(ans);
}

// Returns true iff sub is a subclass of sup.
function isSubclass(sub,sup) {
    if (sub === sup) return true;
    if (typeof(sub) === "string" || !sub["extends"] || sub["extends"].length == 0) return false;
    let r = sub["extends"].filter(function(x){ return x===sup || isSubclass(x, sup); });
    return r.length > 0;
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

        this.join = null; // if true, then the link between my parent and me is an outer join
        
        this.id = this.path;
    }
    get isRoot () {
        return ! this.parent;
    }
    //
    get rootNode () {
        return this.template.qtree;
    }

    // Returns true iff the given operator is valid for this node.
    opValid (op){
        if(!this.parent && !op.validForRoot) return false;
        if(typeof(this.ptype) === "string")
            if(! op.validForAttr)
                return false;
            else if( op.validTypes && op.validTypes.indexOf(this.ptype) == -1)
                return false;
        if(this.ptype.name && ! op.validForClass) return false;
        return true;
    }

    // Returns true iff the given list is valid as a list constraint option for
    // the node n. A list is valid to use in a list constraint at node n iff
    //     * the list's type is equal to or a subclass of the node's type
    //     * the list's type is a superclass of the node's type. In this case,
    //       elements in the list that are not compatible with the node's type
    //       are automatically filtered out.
    listValid (list){
        let nt = this.subtypeConstraint || this.ptype;
        if (typeof(nt) === "string" ) return false;
        let lt = this.template.model.classes[list.type];
        return isSubclass(lt, nt) || isSubclass(nt, lt);
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
        function ck(cls) {
            // simple attribute - nope
            if (typeof(cls) === "string") return false;
            // BioEntity - yup
            if (cls.name === "BioEntity") return true;
            // neither - check ancestors
            for (let i = 0; i < cls.extends.length; i++) {
                if (ck(cls.extends[i])) return true;
            }
            return false;
        }
        return ck(this.nodeType);
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
                let n = this.template.getNodeByPath(p);
                n.view -= 1;
            });
        }
        this.view = null;
    }

    // returns true iff this node can be sorted on, which is true iff the node is an
    // attribute, and there are no outer joins between it and the root
    canSort () {
        if (this.pcomp.kind !== "attribute") return false;
        let n = this;
        while (n) {
            if (n.join) return false;
            n = n.parent;
        }
        return true;
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

    // Sets the subclass constraint at this node, or removes it if no subclass given. A node may
    // have exactly 0 or 1 subclass constraint. Assumes the subclass is actually a subclass of the node's
    // type (should check this).
    //
    // Args:
    //   c (Constraint) The subclass Constraint or null. Sets the subclass constraint on the current node to
    //       the type named in c. Removes the previous subclass constraint if any. If null, just removes
    //       any existing subclass constraint.
    // Returns:
    //   List of any nodes that were removed because the new constraint caused them to become invalid.
    //
    setSubclassConstraint (c) {
        let n = this;
        // remove any existing subclass constraint
        if (c && n.constraints.indexOf(c) === -1)
            n.constraints.push(c);
        n.constraints = n.constraints.filter(function (cc){ return cc.ctype !== "subclass" || cc === c; });
        n.subclassConstraint = null;
        if (c){
            // lookup the subclass name
            let cls = this.template.model.classes[c.type];
            if(!cls) throw "Could not find class " + c.type;
            // add the constraint
            n.subclassConstraint = cls;
        }
        // looks for invalidated paths 
        function check(node, removed) {
            let cls = node.subclassConstraint || node.ptype;
            let c2 = [];
            node.children.forEach(function(c){
                if(c.name in cls.attributes || c.name in cls.references || c.name in cls.collections) {
                    c2.push(c);
                    check(c, removed);
                }
                else {
                    c.remove();
                    removed.push(c);
                }
            })
            node.children = c2;
            return removed;
        }
        let removed = check(n,[]);
        return removed;
    }

    // Removes this node from the query.
    remove () {
        let p = this.parent;
        if (!p) return;
        // First, remove all constraints on this or descendants
        function rmc (x) {
            x.unselect();
            x.constraints.forEach(c => x.removeConstraint(c));
            x.children.forEach(rmc);
        }
        rmc(this);
        // Now remove the subtree at n.
        p.children.splice(p.children.indexOf(this), 1);
    }

    // Adds a new constraint to a node and returns it.
    // Args:
    //   c (constraint) If given, use that constraint. Otherwise, create default.
    // Returns:
    //   The new constraint.
    //
    addConstraint (c) {
        if (c) {
            // just to be sure
            c.node = this;
        }
        else {
            let op = OPINDEX[this.pcomp.kind === "attribute" ? "=" : "LOOKUP"];
            c = new Constraint({node:this, op:op.op, ctype: op.ctype});
        }
        this.constraints.push(c);
        this.template.where.push(c);

        if (c.ctype === "subclass") {
            this.setSubclassConstraint(c);
        }
        else {
            c.code = this.template.nextAvailableCode();
            this.template.code2c[c.code] = c;
            this.template.setLogicExpression();
        }
        return c;
    }

    removeConstraint (c){
        this.constraints = this.constraints.filter(function(cc){ return cc !== c; });
        this.template.where = this.template.where.filter(function(cc){ return cc !== c; });
        if (c.ctype === "subclass")
            this.setSubclassConstraint(null);
        else {
            delete this.template.code2c[c.code];
            this.template.setLogicExpression();
        }
        return c;
    }
} // end of class Node

class Template {
    constructor (t, model) {
        t = t || {}
        //this.model = t.model ? deepc(t.model) : { name: "genomic" };
        this.model = model;
        this.name = t.name || "";
        this.title = t.title || "";
        this.description = t.description || "";
        this.comment = t.comment || "";
        this.select = t.select ? deepc(t.select) : [];
        this.where = t.where ? t.where.map( c => {
            let cc = new Constraint(c) ;
            cc.node = null;
            return cc;
        }) : [];
        this.constraintLogic = t.constraintLogic || "";
        this.joins = t.joins ? deepc(t.joins) : [];
        this.tags = t.tags ? deepc(t.tags) : [];
        this.orderBy = t.orderBy ? deepc(t.orderBy) : [];
        this.compile();
    }

    compile () {
        let self = this;
        let roots = []
        let t = this;
        // the tree of nodes representing the compiled query will go here
        t.qtree = null;
        // index of code to constraint gors here.
        t.code2c = {}
        // normalize things that may be undefined
        t.comment = t.comment || "";
        t.description = t.description || "";
        //
        let subclassCs = [];
        t.where = (t.where || []).map(c => {
            // convert raw contraint configs to Constraint objects.
            let cc = new Constraint(c);
            if (cc.code) t.code2c[cc.code] = cc;
            cc.ctype === "subclass" && subclassCs.push(cc);
            return cc;
        });

        // must process any subclass constraints first, from shortest to longest path
        subclassCs
            .sort(function(a,b){
                return a.path.length - b.path.length;
            })
            .forEach(function(c){
                 let n = t.addPath(c.path);
                 let cls = self.model.classes[c.type];
                 if (!cls) throw "Could not find class " + c.type;
                 n.subclassConstraint = cls;
            });
        //
        t.where && t.where.forEach(function(c){
            let n = t.addPath(c.path);
            if (n.constraints)
                n.constraints.push(c)
            else
                n.constraints = [c];
        })

        //
        t.select && t.select.forEach(function(p,i){
            let n = t.addPath(p);
            n.select();
        })
        t.joins && t.joins.forEach(function(j){
            let n = t.addPath(j);
            n.join = "outer";
        })
        t.orderBy && t.orderBy.forEach(function(o, i){
            let p = Object.keys(o)[0]
            let dir = o[p]
            let n = t.addPath(p);
            n.sort = { dir: dir, level: i };
        });
        if (!t.qtree) {
            throw "No paths in query."
        }
        return t;
    }


    // Turns a qtree structure back into a "raw" template. 
    //
    uncompileTemplate (){
        let tmplt = this;
        let t = {
            name: tmplt.name,
            title: tmplt.title,
            description: tmplt.description,
            comment: tmplt.comment,
            rank: tmplt.rank,
            model: { name: tmplt.model.name },
            tags: deepc(tmplt.tags),
            select : tmplt.select.concat(),
            where : [],
            joins : [],
            constraintLogic: tmplt.constraintLogic || "",
            orderBy : []
        }
        function reach(n){
            let p = n.path
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

    getNodeByPath (p) {
        p = p.trim();
        if (!p) return null;
        let parts = p.split(".");
        let n = this.qtree;
        if (n.name !== parts[0]) return null;
        for( let i = 1; i < parts.length; i++){
            let cname = parts[i];
            let c = (n.children || []).filter(x => x.name === cname)[0];
            if (!c) return null;
            n = c;
        }
        return n;
    }

    // Adds a path to the qtree for this template. Path is specified as a dotted list of names.
    // Args:
    //   path (string) the path to add. 
    // Returns:
    //   last path component created. 
    // Side effects:
    //   Creates new nodes as needed and adds them to the qtree.
    addPath (path){
        let template = this;
        if (typeof(path) === "string")
            path = path.split(".");
        let classes = this.model.classes;
        let lastt = null;
        let n = this.qtree;  // current node pointer
        function find(list, n){
             return list.filter(function(x){return x.name === n})[0]
        }

        path.forEach(function(p, i){
            let cls;
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
                let nn = find(n.children, p);
                if (nn) {
                    // p is already a child
                    n = nn;
                }
                else {
                    // need to add a new node for p
                    // First, lookup p
                    let x;
                    cls = n.subclassConstraint || n.ptype;
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
 
    // Returns a single character constraint code in the range A-Z that is not already
    // used in the given template.
    //
    nextAvailableCode (){
        for(let i= "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++){
            let c = String.fromCharCode(i);
            if (! (c in this.code2c))
                return c;
        }
        return null;
    }



    // Sets the constraint logic expression for this template.
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
    // Returns:
    //   the "corrected" expression
    //   
    setLogicExpression (ex) {
        ex = ex ? ex : (this.constraintLogic || "")
        let ast; // abstract syntax tree
        let seen = [];
        let tmplt = this;
        function reach(n,lev){
            if (typeof(n) === "string" ){
                // check that n is a constraint code in the template. 
                // If not, remove it from the expr.
                // Also remove it if it's the code for a subclass constraint
                seen.push(n);
                return (n in tmplt.code2c && tmplt.code2c[n].ctype !== "subclass") ? n : "";
            }
            let cms = n.children.map(function(c){return reach(c, lev+1);}).filter(function(x){return x;});;
            let cmss = cms.join(" "+n.op+" ");
            return cms.length === 0 ? "" : lev === 0 || cms.length === 1 ? cmss : "(" + cmss + ")"
        }
        try {
            ast = ex ? parser.parse(ex) : null;
        }
        catch (err) {
            alert(err);
            return this.constraintLogic;
        }
        //
        let lex = ast ? reach(ast,0) : "";
        // if any constraint codes in the template were not seen in the expression,
        // AND them into the expression (except ISA constraints).
        let toAdd = Object.keys(this.code2c).filter(function(c){
            return seen.indexOf(c) === -1 && c.op !== "ISA";
            });
        if (toAdd.length > 0) {
             if(ast && ast.op && ast.op === "or")
                 lex = `(${lex})`;
             if (lex) toAdd.unshift(lex);
             lex = toAdd.join(" and ");
        }
        //
        this.constraintLogic = lex;

        d3.select('#svgContainer [name="logicExpression"] input')
            .call(function(){ this[0][0].value = lex; });

        return lex;
    }
 
    // 
    getXml (qonly) {
        let t = this.uncompileTemplate();
        let so = (t.orderBy || []).reduce(function(s,x){ 
            let k = Object.keys(x)[0];
            let v = x[k]
            return s + `${k} ${v} `;
        }, "");

        // Converts an outer join path to xml.
        function oj2xml(oj){
            return `<join path="${oj}" style="OUTER" />`;
        }

        // the query part
        let qpart = 
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
        let tmplt = 
    `<template
      name="${t.name || ''}"
      title="${esc(t.title || '')}"
      comment="${esc(t.comment || '')}">
     ${qpart}
    </template>
    `;
        return qonly ? qpart : tmplt
    }

    getJson () {
        let t = this.uncompileTemplate();
        return JSON.stringify(t, null, 2);
    }

} // end of class Template

class Constraint {
    constructor (c) {
        c = c || {}
        // save the  node
        this.node = c.node || null;
        // all constraints have this
        this.path = c.path || c.node && c.node.path || "";
        // used by all except subclass constraints (we set it to "ISA")
        this.op = c.op || c.type && "ISA" || null;
        // one of: null, value, multivalue, subclass, lookup, list, range, loop
        // throws an exception if this.op is defined, but not in OPINDEX
        this.ctype = this.op && OPINDEX[this.op].ctype || null;
        // used by all except subclass constraints
        this.code = this.ctype !== "subclass" && c.code || null;
        // used by value, list
        this.value = c.value || "";
        // used by LOOKUP on BioEntity and subclasses
        this.extraValue = this.ctype === "lookup" && c.extraValue || null;
        // used by multivalue and range constraints
        this.values = c.values && deepc(c.values) || null;
        // used by subclass contraints
        this.type = this.ctype === "subclass" && c.type || null;
        // used for constraints in a template
        this.editable = c.editable || null;

        // With null/not-null constraints, IM has a weird quirk of filling the value 
        // field with the operator. E.g., for an "IS NOT NULL" opreator, the value field is
        // also "IS NOT NULL". 
        // 
        if (this.ctype === "null")
            c.value = "";
    }
    //
    setOp (o, quietly) {
        let op = OPINDEX[o];
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
                this.code = t && t.nextAvailableCode() || null;
        }
        !quietly && t && t.setLogicExpression();
    }
    // Returns a text representation of the constraint suitable for a label
    //
    get labelText () {
       let t = "?";
       let c = this;
        // one of: null, value, multivalue, subclass, lookup, list, range, loop
       if (this.ctype === "subclass"){
           t = "ISA " + (this.type || "?");
       }
       else if (this.ctype === "list" || this.ctype === "value") {
           t = this.op + " " + this.value;
       }
       else if (this.ctype === "lookup") {
           t = this.op + " " + this.value;
           if (this.extraValue) t = t + " IN " + this.extraValue;
       }
       else if (this.ctype === "multivalue" || this.ctype === "range") {
           t = this.op + " " + this.values;
       }
       else if (this.ctype === "null") {
           t = this.op;
       }

       return (this.ctype !== "subclass" ? "("+this.code+") " : "") + t;
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
} // end of class Constraint

export {
    Model,
    getSubclasses,
    getSuperclasses,
    isSubclass,
    Node,
    Template,
    Constraint
}
