import { OPINDEX } from './ops.js';
import { esc, deepc } from './utils.js';
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
        this.extraValue = this.ctype === "lookup" && c.extraValue || undefined;
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

    //
    getJson () {
        let jc = {};
        if (this.ctype === "value" || this.ctype === "list"){
            return {
                path:  this.path,
                op:    this.op,
                value: this.value,
                code:  this.code
            }
        }
        else if (this.ctype === "lookup"){
            return {
                path:  this.path,
                op:    this.op,
                value: this.value,
                code:  this.code,
                extraValue: this.extraValue
            }
        }
        else if (this.ctype === "multivalue"){
            return {
                path:  this.path,
                op:    this.op,
                values: this.values.concate([]),
                code:  this.code
            }
        }
        else if (this.ctype === "subclass"){
            return {
                path:  this.path,
                type:  this.type
            }
        }
        else if (this.ctype === "null"){
            return {
                path:  this.path,
                op:    this.op,
                code:  this.code
            }
        }
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

export { Constraint };
