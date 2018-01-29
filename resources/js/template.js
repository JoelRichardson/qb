import { esc, deepc } from './utils.js';
import parser from './parser.js';
import { Node } from './node.js';
import { Constraint } from './constraint.js';

class Template {
    constructor (t, model) {
        t = t || {}
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

    // Returns the template as a simple json object.
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
                 t.where.push(c.getJson())
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

    // Returns the Node at path p, or null if the path does not exist in the current qtree.
    //
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
                        cls = x.type
                    }
                    else if (cls.references[p] || cls.collections[p]) {
                        x = cls.references[p] || cls.collections[p];
                        cls = classes[x.referencedType]
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
      ${(t.where || []).map(c => (new Constraint(c)).c2xml(qonly)).join(" ")}
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

    getJson (asjson) {
        let t = this.uncompileTemplate();
        return asjson ? t : JSON.stringify(t, null, 2);
    }

} // end of class Template

export { Template };
