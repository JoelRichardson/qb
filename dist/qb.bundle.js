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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return esc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return d3jsonPromise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return selectText; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return deepc; });
/* unused harmony export getLocal */
/* unused harmony export setLocal */
/* unused harmony export testLocal */
/* unused harmony export clearLocal */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return parsePathQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return obj2array; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return initOptionList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return findDomByDataObj; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return copyObj; });

//
// Function to escape '<' '"' and '&' characters
function esc(s){
    if (!s) return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); 
}

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
        let range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        let range = document.createRange();
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
    let ks = Object.keys(o);
    ks.sort();
    return ks.map(function (k) {
        if (nameAttr) o[k].name = k;
        return o[k];
    });
};

// Args:
//   selector (string) For selecting the <select> element
//   data (list) Data to bind to options
//   cfg (object) Additional optional configs:
//       title - function or literal for setting the text of the option. 
//       value - function or literal setting the value of the option
//       selected - function or array or string for deciding which option(s) are selected
//          If function, called for each option.
//          If array, specifies the values to select.
//          If string, specifies which value is selected
//       emptyMessage - a message to show if the data list is empty
//       multiple - if true, make it a multi-select list
//
function initOptionList (selector, data, cfg) {
    
    cfg = cfg || {};

    let ident = (x=>x);
    let opts;
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

// Returns  the DOM element corresponding to the given data object.
//
function findDomByDataObj(d){
    let x = d3.selectAll(".nodegroup .node").filter(function(dd){ return dd === d; });
    return x[0][0];
}

//
function copyObj(tgt, src, dir) {
    dir = dir || tgt;
    for( let n in dir )
        tgt[n] = (n in src) ? src[n] : dir[n];
    return tgt;
}

//



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export NUMERICTYPES */
/* unused harmony export NULLABLETYPES */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LEAFTYPES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return OPS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return OPINDEX; });
// Valid constraint types (ctype):
//   null, lookup, subclass, list, loop, value, multivalue, range
//
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

// all the base types that are numeric
let NUMERICTYPES= [
    "int", "java.lang.Integer",
    "short", "java.lang.Short",
    "long", "java.lang.Long",
    "float", "java.lang.Float",
    "double", "java.lang.Double",
    "java.math.BigDecimal",
    "java.util.Date"
];

// all the base types that can have null values
let NULLABLETYPES= [
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

// all the base types that an attribute can have
let LEAFTYPES= [
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
    "org.intermine.objectstore.query.ClobAccess",
    "Object"
]


let OPS = [

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
let OPINDEX = OPS.reduce(function(x,o){
    x[o.op] = o;
    return x;
}, {});




/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Model; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getSubclasses; });
/* unused harmony export getSuperclasses */
/* unused harmony export isSubclass */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);



// A Model represents the data model of a mine. It is a class-ified and expanded
// version of the data structure returned by the /model service call.
//
class Model {
    constructor (cfg, mine) {
        let model = this;
        this.mine = mine;
        this.package = cfg.package;
        this.name = cfg.name;
        this.classes = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* deepc */])(cfg.classes);

        // First add classes that represent the basic type
        __WEBPACK_IMPORTED_MODULE_0__ops_js__["a" /* LEAFTYPES */].forEach( n => {
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
        this.allClasses = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(this.classes)
        let cns = Object.keys(this.classes);
        cns.sort()
        cns.forEach(function(cn){ // for each class name
            let cls = model.classes[cn];
            // generate arrays for convenient access
            cls.allAttributes = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(cls.attributes)
            cls.allReferences = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(cls.references)
            cls.allCollections = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(cls.collections)
            cls.allAttributes.forEach(function(x){ x.kind = "attribute"; });
            cls.allReferences.forEach(function(x){ x.kind = "reference"; });
            cls.allCollections.forEach(function(x){ x.kind = "collection"; });
            cls.allParts = cls.allAttributes.concat(cls.allReferences).concat(cls.allCollections);
            cls.allParts.sort(function(a,b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
            model.allClasses.push(cls);
            // Convert extends from a list of names to a list of class objects.
            // Also add the inverse list, extendedBy.
            cls["extends"] = cls["extends"].map(function(e){
                let bc = model.classes[e];
                if (!bc) throw "No class named: " + e;
                if (bc.extendedBy) {
                    bc.extendedBy.push(cls);
                }
                else {
                    bc.extendedBy = [cls];
                }
                return bc;
            });
            // Attributes: store class obj of referencedType
            Object.keys(cls.attributes).forEach(function(an){
                let a = cls.attributes[an];
                let t = model.classes[a.type];
                if (!t) throw "No class named: " + a.type;
                a.type = t;
            });
            // References: store class obj of referencedType
            Object.keys(cls.references).forEach(function(rn){
                let r = cls.references[rn];
                r.type = model.classes[r.referencedType]
            });
            // Collections: store class obj of referencedType
            Object.keys(cls.collections).forEach(function(cn){
                let c = cls.collections[cn];
                c.type = model.classes[c.referencedType]
            });
        });
    }
} // end of class Model


// Returns a list of all the superclasses of the given class.
// (
// The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSuperclasses(cls){
    if (cls.isLeafType || !cls["extends"] || cls["extends"].length == 0) return [];
    let anc = cls["extends"].map(function(sc){ return getSuperclasses(sc); });
    let all = cls["extends"].concat(anc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    let ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(ans);
}

// Returns a list of all the subclasses of the given class.
// (The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSubclasses(cls){
    if (cls.isLeafType || !cls.extendedBy || cls.extendedBy.length == 0) return [];
    let desc = cls.extendedBy.map(function(sc){ return getSubclasses(sc); });
    let all = cls.extendedBy.concat(desc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    let ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(ans);
}

// Returns true iff sub is a subclass of sup.
function isSubclass(sub,sup) {
    if (sub === sup) return true;
    if (sub.isLeafType || !sub["extends"] || sub["extends"].length == 0) return false;
    let r = sub["extends"].filter(function(x){ return x===sup || isSubclass(x, sup); });
    return r.length > 0;
}





/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Constraint; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);


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
        this.ctype = this.op && __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][this.op].ctype || null;
        // used by all except subclass constraints
        this.code = this.ctype !== "subclass" && c.code || null;
        // used by value, list
        this.value = c.value || "";
        // used by LOOKUP on BioEntity and subclasses
        this.extraValue = this.ctype === "lookup" && c.extraValue || null;
        // used by multivalue and range constraints
        this.values = c.values && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* deepc */])(c.values) || null;
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
        let op = __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][o];
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
            g = `path="${this.path}" op="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* esc */])(this.op)}" value="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* esc */])(this.value)}" code="${this.code}" ${e}`;
        else if (this.ctype === "lookup"){
            let ev = (this.extraValue && this.extraValue !== "Any") ? `extraValue="${this.extraValue}"` : "";
            g = `path="${this.path}" op="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* esc */])(this.op)}" value="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* esc */])(this.value)}" ${ev} code="${this.code}" ${e}`;
        }
        else if (this.ctype === "multivalue"){
            g = `path="${this.path}" op="${this.op}" code="${this.code}" ${e}`;
            h = this.values.map( v => `<value>${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* esc */])(v)}</value>` ).join('');
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




/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__qbeditor_js__ = __webpack_require__(6);
//
// qb.js
//



let qb = new __WEBPACK_IMPORTED_MODULE_0__qbeditor_js__["a" /* QBEditor */]();
qb.setup()
//


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return QBEditor; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__undoManager_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__template_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__registry_js__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__editViews_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__dialog_js__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__constraintEditor_js__ = __webpack_require__(14);











let VERSION = "0.1.0";

class QBEditor {
    constructor () {
        this.currMine = null;
        this.currTemplate = null;

        this.name2mine = null;
        this.svg = {
            width:      1280,
            height:     800,
            mleft:      120,
            mright:     120,
            mtop:       20,
            mbottom:    20
        };
        this.root = null;
        this.diagonal = null;
        this.vis = null;
        this.nodes = null;
        this.links = null;
        this.dragBehavior = null;
        this.animationDuration = 250; // ms
        this.defaultColors = { header: { main: "#595455", text: "#fff" } };
        this.defaultLogo = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png";
        this.undoMgr = new __WEBPACK_IMPORTED_MODULE_3__undoManager_js__["a" /* UndoManager */]();
        // Starting edit view is the main query view.
        this.editViews = __WEBPACK_IMPORTED_MODULE_7__editViews_js__["a" /* editViews */];
        this.editView = this.editViews.queryMain;
        //
        this.constraintEditor =
            new __WEBPACK_IMPORTED_MODULE_9__constraintEditor_js__["a" /* ConstraintEditor */](n => {
                this.dialog.show(n, null, true);
                this.undoMgr.saveState(n);
                this.update(n);
            });
        // the node dialog
        this.dialog = new __WEBPACK_IMPORTED_MODULE_8__dialog_js__["a" /* Dialog */](this);
    }
    setup () {
        let self = this;
        //
        d3.select('#footer [name="version"]')
            .text(`QB v${VERSION}`);

        //
        this.initSvg();

        //
        d3.select('.button[name="openclose"]')
            .on("click", function(){
                let t = d3.select("#tInfoBar");
                let wasClosed = t.classed("closed");
                let isClosed = !wasClosed;
                let d = d3.select('#tInfoBar')[0][0]
                if (isClosed)
                    // save the current height just before closing
                    d.__saved_height = d.getBoundingClientRect().height;
                else if (d.__saved_height)
                   // on open, restore the saved height
                   d3.select('#tInfoBar').style("height", d.__saved_height);

                t.classed("closed", isClosed);
                d3.select(this).classed("closed", isClosed);
            });

        d3.select('.button[name="ttextExpand"]')
            .on("click", function(){
                let t = d3.select(this);
                t.classed("closed", ! t.classed("closed"));
                d3.select("#tInfoBar").classed("expanded", ! t.classed("closed"));
            });

        Object(__WEBPACK_IMPORTED_MODULE_6__registry_js__["a" /* initRegistry */])(this.initMines.bind(this));

        d3.selectAll("#ttext label span")
            .on('click', function(){
                d3.select('#ttext').attr('class', 'flexcolumn '+this.innerText.toLowerCase());
                self.updateTtext(self.currTemplate);
            });
        d3.select('#runatmine')
            .on('click', () => self.runatmine(self.currTemplate));
        d3.select('#runatqb')
            .on('click', () => self.runatqb(self.currTemplate));
        d3.select('#querycount .button.sync')
            .on('click', function(){
                let t = d3.select(this);
                let turnSyncOff = t.text() === "sync";
                t.text( turnSyncOff ? "sync_disabled" : "sync" )
                 .attr("title", () =>
                     `Count autosync is ${ turnSyncOff ? "OFF" : "ON" }. Click to turn it ${ turnSyncOff ? "ON" : "OFF" }.`);
                !turnSyncOff && self.updateCount(self.currTemplate);
            d3.select('#querycount').classed("syncoff", turnSyncOff);
            });
        d3.select("#xmltextarea")
            .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["i" /* selectText */])("xmltextarea")});
        d3.select("#jsontextarea")
            .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["i" /* selectText */])("jsontextarea")});

      //
      this.dragBehavior = d3.behavior.drag()
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
          ll.attr("d", self.diagonal);
          })
        .on("dragend", function () {
          // on dragend, resort the draggable nodes according to their Y position
          let nodes = d3.selectAll(self.editView.draggable).data()
          nodes.sort( (a, b) => a.y - b.y );
          // the node that was dragged
          let dragged = d3.select(this).data()[0];
          // callback for specific drag-end behavior
          self.editView.afterDrag && self.editView.afterDrag(nodes, dragged);
          //
          self.undoMgr.saveState(dragged);
          self.update();
          //
          d3.event.sourceEvent.preventDefault();
          d3.event.sourceEvent.stopPropagation();
      });
    }

    initMines (j_mines) {
        let self = this;
        this.name2mine = {};
        let mines = j_mines.instances;
        mines.forEach(m => this.name2mine[m.name] = m );
        this.currMine = mines[0];
        this.currTemplate = null;

        let ml = d3.select("#mlist").selectAll("option").data(mines);
        let selectMine = "MouseMine";
        ml.enter().append("option")
            .attr("value", function(d){return d.name;})
            .attr("disabled", function(d){
                let w = window.location.href.startsWith("https");
                let m = d.url.startsWith("https");
                let v = (w && !m) || null;
                return v;
            })
            .attr("selected", function(d){ return d.name===selectMine || null; })
            .text(function(d){ return d.name; });
        //
        // when a mine is selected from the list
        d3.select("#mlist")
            .on("change", function(){
                // reminder: this===the list input element; self===the editor instance
                self.selectedMine(this.value);
            });

        //
        //
        d3.select("#editView select")
            .on("change", function () {
                // reminder: this===the list input element; self===the editor instance
                self.setEditView(this.value);
            })
            ;

        // start with the first mine by default.
        this.selectedMine(selectMine);
    }
    // Called when user selects a mine from the option list
    // Loads that mine's data model and all its templates.
    // Then initializes display to show the first termplate's query.
    selectedMine (mname) {
        if(!this.name2mine[mname]) throw "No mine named: " + mname;
        this.currMine = this.name2mine[mname];
        this.undoMgr.clear();
        let url = this.currMine.url;
        let turl, murl, lurl, burl, surl, ourl;
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
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(murl),
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(turl),
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(lurl),
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(burl),
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(surl),
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(ourl)
        ]).then(
            this.initMineData.bind(this),
            function(error){
            alert(`Could not access ${cm.name}. Status=${error.status}. Error=${error.statusText}. (If there is no error message, then its probably a CORS issue.)`);
        });
    }

    initMineData (data) {
        let self = this;
        let j_model = data[0];
        let j_templates = data[1];
        let j_lists = data[2];
        let j_branding = data[3];
        let j_summary = data[4];
        let j_organisms = data[5];
        //
        let cm = this.currMine;
        cm.tnames = []
        cm.templates = []
        cm.model = new __WEBPACK_IMPORTED_MODULE_4__model_js__["a" /* Model */](j_model.model, cm)
        cm.templates = j_templates.templates;
        cm.lists = j_lists.lists;
        cm.summaryFields = j_summary.classes;
        cm.organismList = j_organisms.results.map(o => o.shortName);
        //
        cm.tlist = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* obj2array */])(cm.templates)
        cm.tlist.sort(function(a,b){
            return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
        });
        cm.tnames = Object.keys( cm.templates );
        cm.tnames.sort();
        // Fill in the selection list of templates for this mine.
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])("#tlist select", cm.tlist, {
            value: d => d.name,
            title: d => d.title });
        //
        d3.selectAll('[name="editTarget"] [name="in"]')
            .on("change", () => this.startEdit());
        //
        this.editTemplate(cm.templates[cm.tlist[0].name]);
        // Apply branding
        let clrs = cm.colors || this.defaultColors;
        let bgc = clrs.header ? clrs.header.main : clrs.main.fg;
        let txc = clrs.header ? clrs.header.text : clrs.main.bg;
        let logo = cm.images.logo || this.defaultLogo;
        d3.select("#tooltray")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#tInfoBar")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#mineLogo")
            .attr("src", logo);
        d3.selectAll('#tooltray [name="minename"]')
            .text(cm.name);
        // populate class list. Exclude the simple attribute types.
        let clist = Object.keys(cm.model.classes).filter(cn => ! cm.model.classes[cn].isLeafType);
        clist.sort();
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])("#newqclist select", clist);
        d3.select('#editSourceSelector [name="in"]')
            .call(function(){ this[0][0].selectedIndex = 1; })
            .on("change", function(){ self.selectedEditSource(this.value); self.startEdit(); });
        d3.select("#xmltextarea")[0][0].value = "";
        d3.select("#jsontextarea").value = "";
        this.selectedEditSource( "tlist" );
    }

    // Begins an edit, based on user controls.
    startEdit () {
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
            this.editTemplate(this.currMine.templates[val]);
        }
        else if (inputId === "newqclist") {
            // a new query from a selected starting class
            let nt = new __WEBPACK_IMPORTED_MODULE_5__template_js__["a" /* Template */]({ select: [val+".id"]}, this.currMine.model);
            this.editTemplate(nt);
        }
        else if (inputId === "importxml") {
            // import xml query
            val && this.editTemplate(Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["h" /* parsePathQuery */])(val));
        }
        else if (inputId === "importjson") {
            // import json query
            val && this.editTemplate(JSON.parse(val));
        }
        else
            throw "Unknown edit source."
    }

    //
    selectedEditSource (show) {
        d3.selectAll('[name="editTarget"] > div.option')
            .style("display", function(){ return this.id === show ? null : "none"; });
    }

    // Removes the current node and all its descendants.
    //
    removeNode (n) {
        n.remove();
        this.dialog.hide();
        this.undoMgr.saveState(n);
        this.update(n.parent || n);
    }

    // Called when the user selects a template from the list.
    // Gets the template from the current mine and builds a set of nodes
    // for d3 tree display.
    //
    editTemplate (t, nosave) {
        let self = this;
        // Make sure the editor works on a copy of the template.
        //
        let ct = this.currTemplate = new __WEBPACK_IMPORTED_MODULE_5__template_js__["a" /* Template */](t, this.currMine.model);
        //
        this.root = ct.qtree
        this.root.x0 = 0;
        this.root.y0 = this.svg.height / 2;
        //
        ct.setLogicExpression();

        if (! nosave) this.undoMgr.saveState(ct.qtree);

        // Fill in the basic template information (name, title, description, etc.)
        //
        let ti = d3.select("#tInfo");
        let xfer = function(name, elt){ ct[name] = elt.value; self.updateTtext(ct); };
        // Name (the internal unique name)
        ti.select('[name="name"] input')
            .attr("value", ct.name)
            .on("change", function(){ xfer("name", this) });
        // Title (what the user sees)
        ti.select('[name="title"] input')
            .attr("value", ct.title)
            .on("change", function(){ xfer("title", this) });
        // Description (what it does - a little documentation).
        ti.select('[name="description"] textarea')
            .text(ct.description)
            .on("change", function(){ xfer("description", this) });
        // Comment - for whatever, I guess.
        ti.select('[name="comment"] textarea')
            .text(ct.comment)
            .on("change", function(){ xfer("comment", this) });

        // Logic expression - which ties the individual constraints together
        d3.select('#svgContainer [name="logicExpression"] input')
            .call(function(){ this[0][0].value = ct.constraintLogic })
            .on("change", function(){
                ct.setLogicExpression(this.value);
                xfer("constraintLogic", this)
            });

        // Clear the query count
        d3.select("#querycount span").text("");

        //
        this.dialog.hide();
        this.update(this.root);
    }

    // Set the editing view. View is one of:
    // Args:
    //     view (string) One of: queryMain, constraintLogic, columnOrder, sortOrder
    // Returns:
    //     Nothing
    // Side effects:
    //     Changes the layout and updates the view.
    setEditView (view){
        let v = this.editViews[view];
        if (!v) throw "Unrecognized view type: " + view;
        this.editView = v;
        d3.select("#svgContainer").attr("class", v.name);
        this.update(this.root);
    }

    // Grows or shrinks the size of the SVG drawing area and redraws the diagram.
    // Args:
    //   pctX (number) A percentage to grow or shrink in the X dimension. If >0,
    //                 grows by that percentage. If <0, shrinks by that percentage.
    //                 If 0, remains unchanged.
    //   pctY (number) A percentage to grow or shrink in the Y dimension. If not
    //                 specified, uses pctX.
    // Note that the percentages apply to the margins as well.
    //
    growSvg (pctX, pctY) {
        pctY = pctY === undefined ? pctX : pctY;
        let mx = 1 + pctX / 100.0;
        let my = 1 + pctY / 100.0;
        let sz = {
            width:      mx * this.svg.width,
            mleft:      mx * this.svg.mleft,
            mright:     mx * this.svg.mright,
            height:     my * this.svg.height,
            mtop:       my * this.svg.mtop,
            mbottom:    my * this.svg.mbottom
        };
        this.setSvgSize(sz);
    }

    // Sets the size of the SVG drawing area and redraws the diagram.
    // Args:
    //   sz (obj) An object defining any/all of the values in this.svg, to wit:
    //            width, height, mleft, mright, mtop, mbottom
    setSvgSize (sz) {
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* copyObj */])(this.svg, sz);
        this.initSvg();
        this.update(this.root);
    }

    // Initializes the SVG drawing area
    initSvg () {
        // init the SVG container
        this.vis = d3.select("#svgContainer svg")
            .attr("width", this.svg.width + this.svg.mleft + this.svg.mright)
            .attr("height", this.svg.height + this.svg.mtop + this.svg.mbottom)
            .on("click", () => this.dialog.hide())
          .select("g")
            .attr("transform", "translate(" + this.svg.mleft + "," + this.svg.mtop + ")");

        // https://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
        this.diagonal = d3.svg.diagonal()
            .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })
            .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
            .projection(function(d) { return [d.y, d.x]; });
    }

    // Calculates positions for nodes and paths for links.
    doLayout () {
      let layout;
      //
      let leaves = [];
      function md (n) { // max depth
          if (n.children.length === 0) leaves.push(n);
          return 1 + (n.children.length ? Math.max.apply(null, n.children.map(md)) : 0);
      };
      let maxd = md(this.root); // max depth, 1-based

      //
      if (this.editView.layoutStyle === "tree") {
          // d3 layout arranges nodes top-to-bottom, but we want left-to-right.
          // So...do the layout, reversing width and height.
          // Then reverse the x,y coords in the results.
          this.layout = d3.layout.tree().size([this.svg.height, this.svg.width]);
          // Save nodes in global.
          this.nodes = this.layout.nodes(this.root).reverse();
          // Reverse x and y. Also, normalize x for fixed-depth.
          this.nodes.forEach(function(d) {
              let tmp = d.x; d.x = d.y; d.y = tmp;
              let dx = Math.min(180, this.svg.width / Math.max(1,maxd-1))
              d.x = d.depth * dx
          }, this);
      }
      else {
          // dendrogram
          this.layout = d3.layout.cluster()
              .separation((a,b) => 1)
              .size([this.svg.height, Math.min(this.svg.width, maxd * 180)]);
          // Save nodes in global.
          this.nodes = this.layout.nodes(this.root).reverse();
          this.nodes.forEach( d => { let tmp = d.x; d.x = d.y; d.y = tmp; });

          // ------------------------------------------------------
          // Rearrange y-positions of leaf nodes.
          let pos = leaves.map(function(n){ return { y: n.y, y0: n.y0 }; });

          leaves.sort(this.editView.nodeComp);

          // reassign the Y positions
          leaves.forEach(function(n, i){
              n.y = pos[i].y;
              n.y0 = pos[i].y0;
          });
          // At this point, leaves have been rearranged, but the interior nodes haven't.
          // Here we move interior nodes up or down toward their "center of gravity" as defined
          // by the Y-positions of their children. Apply this recursively up the tree.
          //
          // Maintain a map of occupied positions:
          let occupied = {} ;  // occupied[x position] == [list of nodes]
          function cog (n) {
              if (n.children.length > 0) {
                  // compute my c.o.g. as the average of my kids' y-positions
                  let myCog = (n.children.map(cog).reduce((t,c) => t+c, 0))/n.children.length;
                  n.y = myCog;
              }
              let dd = occupied[n.x] = (occupied[n.x] || []);
              dd.push(n);
              return n.y;
          }
          cog(this.root);

          // If intermediate nodes at the same x overlap, spread them out in y.
          for(let x in occupied) {
              // get the nodes at this x-rank, and sort by y position
              let nodes = occupied[x];
              nodes.sort( (a,b) => a.y - b.y );
              // Now make a pass and ensure that each node is separated from the
              // previous node by at least MINSEP
              let prev = null;
              let MINSEP = 30;
              nodes.forEach( n => {
                  if (prev && (n.y - prev.y < MINSEP))
                      n.y = prev.y + MINSEP;
                  prev = n;
              });

          }

          // ------------------------------------------------------
      }

      // save links in global
      this.links = this.layout.links(this.nodes);

      return [this.nodes, this.links]
    }

    // --------------------------------------------------------------------------
    // update(source)
    // The main drawing routine.
    // Updates the SVG, using source (a Node) as the focus of any entering/exiting animations.
    //
    update (source) {
      //
      d3.select("#svgContainer").attr("class", this.editView.name);

      d3.select("#undoButton")
          .classed("disabled", () => ! this.undoMgr.canUndo)
          .on("click", () => {
              this.undoMgr.canUndo && this.editTemplate(this.undoMgr.undoState(), true);
          });
      d3.select("#redoButton")
          .classed("disabled", () => ! this.undoMgr.canRedo)
          .on("click", () => {
              this.undoMgr.canRedo && this.editTemplate(this.undoMgr.redoState(), true);
          });
      //
      this.doLayout();
      this.updateNodes(this.nodes, source);
      this.updateLinks(this.links, source);
      this.updateTtext(this.currTemplate);
    }

    //
    updateNodes (nodes, source) {
      let self = this;
      let nodeGrps = this.vis.selectAll("g.nodegroup")
          .data(nodes, function(n) { return n.id || (n.id = ++i); })
          ;

      // Create new nodes at the parent's previous position.
      let nodeEnter = nodeGrps.enter()
          .append("svg:g")
          .attr("id", n => n.path.replace(/\./g, "_"))
          .attr("class", "nodegroup")
          .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
          ;

      let clickNode = function(n) {
          if (d3.event.defaultPrevented) return;
          if (self.dialog.currNode !== n) self.dialog.show(n, this);
          d3.event.stopPropagation();
      };
      // Add glyph for the node
      nodeEnter.append(function(d){
          let shape = (d.pcomp.kind == "attribute" ? "rect" : "circle");
          return document.createElementNS("http://www.w3.org/2000/svg", shape);
        })
          .attr("class","node")
          .on("click", clickNode);
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
          .duration(this.animationDuration)
          .attr("transform", function(n) { return "translate(" + n.x + "," + n.y + ")"; })
          ;

      nodeUpdate.select("text.handle")
          .attr('font-family', this.editView.handleIcon.fontFamily || null)
          .text(this.editView.handleIcon.text || "")
          .attr("stroke", this.editView.handleIcon.stroke || null)
          .attr("fill", this.editView.handleIcon.fill || null);
      nodeUpdate.select("text.nodeIcon")
          .attr('font-family', this.editView.nodeIcon.fontFamily || null)
          .text(this.editView.nodeIcon.text || "")
          ;

      d3.selectAll(".nodeIcon")
          .on("click", clickNode);

      nodeUpdate.selectAll("text.nodeName")
          .text(n => n.name);

      // --------------------------------------------------
      // Make selected nodes draggable.
      // Clear out all exiting drag handlers
      d3.selectAll("g.nodegroup")
          .classed("draggable", false)
          .on(".drag", null);
      // Now make everything draggable that should be
      if (this.editView.draggable)
          d3.selectAll(this.editView.draggable)
              .classed("draggable", true)
              .call(this.dragBehavior);
      // --------------------------------------------------

      // Add text for constraints
      let ct = nodeGrps.selectAll("text.constraint")
          .data(function(n){ return n.constraints; });
      ct.enter().append("svg:text").attr("class", "constraint");
      ct.exit().remove();
      ct.text( c => c.labelText )
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
          .duration(this.animationDuration)
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
    updateLinks (links, source) {
        let self = this;
      let link = this.vis.selectAll("path.link")
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
            let o = {x: source.x0, y: source.y0};
            return self.diagonal({source: o, target: o});
          })
          .classed("attribute", function(l) { return l.target.pcomp.kind === "attribute"; })
          .on("click", function(l){
              if (d3.event.altKey) {
                  // a shift-click cuts the tree at this edge
                  self.removeNode(l.target)
              }
              else {
                  if (l.target.pcomp.kind == "attribute") return;
                  // regular click on a relationship edge inverts whether
                  // the join is inner or outer.
                  l.target.join = (l.target.join ? null : "outer");
                  // re-set the tooltip
                  d3.select(this).select("title").text(linkTitle);
                  // if outer join, remove any sort orders in n or descendants
                  if (l.target.join) {
                      let rso = function(m) { // remove sort order
                          m.setSort("none");
                          m.children.forEach(rso);
                      }
                      rso(l.target);
                  }
                  self.update(l.source);
                  self.undoMgr.saveState(l.source);
              }
          })
          .transition()
            .duration(this.animationDuration)
            .attr("d", this.diagonal)
          ;


      // Transition links to their new position.
      link.classed("outer", function(n) { return n.target.join === "outer"; })
          .transition()
          .duration(this.animationDuration)
          .attr("d", this.diagonal)
          ;

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
          .duration(this.animationDuration)
          .attr("d", function(d) {
            let o = {x: source.x, y: source.y};
            return self.diagonal({source: o, target: o});
          })
          .remove()
          ;

    }
    //
    updateTtext (t) {
      //
      let self = this;
      let title = this.vis.selectAll("#qtitle")
          .data([this.currTemplate.title]);
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
                  return `<tspan y=10 font-family="Material Icons">${__WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__["codepoints"]['forward']}</tspan>`
              else
                  return `<tspan y=4>${p}</tspan>`
          }).join("");
      });

      //
      let txt = d3.select("#ttext").classed("json") ? t.getJson() : t.getXml();
      //
      //
      d3.select("#ttextdiv")
          .text(txt)
          .on("focus", function(){
              Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["i" /* selectText */])("ttextdiv");
          });
      //
      if (d3.select('#querycount .button.sync').text() === "sync")
          self.updateCount(t);
    }

    runatmine (t) {
      let uct = t.uncompileTemplate();
      let txt = t.getXml();
      let urlTxt = encodeURIComponent(txt);
      let linkurl = this.currMine.url + "/loadQuery.do?trail=%7Cquery&method=xml";
      let editurl = linkurl + "&query=" + urlTxt;
      let runurl = linkurl + "&skipBuilder=true&query=" + urlTxt;
      window.open( d3.event.altKey ? editurl : runurl, '_blank' );
    }

    updateCount (t) {
      let uct = t.uncompileTemplate();
      let qtxt = t.getXml(true);
      let urlTxt = encodeURIComponent(qtxt);
      let countUrl = this.currMine.url + `/service/query/results?query=${urlTxt}&format=count`;
      d3.select('#querycount').classed("running", true);
      Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(countUrl)
          .then(function(n){
              d3.select('#querycount').classed("error", false).classed("running", false);
              d3.select('#querycount span').text(n)
          })
          .catch(function(e){
              d3.select('#querycount').classed("error", true).classed("running", false);
              console.log("ERROR::", qtxt)
          });
    }

    runatqb (t) {
      let qjson = t.getJson(true);
      console.log(qjson);

      let service = { root: this.currMine.url + '/service' };
      imtables.configure('DefaultPageSize', 10);
      imtables.configure('TableResults.CacheFactor', 20);
      imtables.configure('TableCell.IndicateOffHostLinks', false);

      imtables.loadTable(
        '#imTablesQuery',
        {start: 0, size: 10},
        {service: service, query: qjson}
      ).then(
        function (table) { console.log('Table loaded', table); },
        function (error) { console.error('Could not load table', error); }
      );
    }
}




/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UndoManager; });
// UndoManager maintains a history stack of states (arbitrary objects).
//
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

    //-----------------------------------------------------------

    saveState (n) {
        let s = JSON.stringify(n.template.uncompileTemplate());
        if (!this.hasState || this.currentState !== s)
            // only save state if it has changed
            this.add(s);
    }
    undoState () {
        try { return JSON.parse(this.undo()); }
        catch (err) { console.log(err); }
    }
    redoState () {
        try { return JSON.parse(this.redo()); }
        catch (err) { console.log(err); }
    }
}

//
function undo() { undoredo("undo") }
function redo() { undoredo("redo") }
function undoredo(which){
}




/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Template; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parser_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parser_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__parser_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__node_js__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__constraint_js__ = __webpack_require__(4);





class Template {
    constructor (t, model) {
        t = t || {}
        this.model = model;
        this.name = t.name || "";
        this.title = t.title || "";
        this.description = t.description || "";
        this.comment = t.comment || "";
        this.select = t.select ? Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* deepc */])(t.select) : [];
        this.where = t.where ? t.where.map( c => {
            let cc = new __WEBPACK_IMPORTED_MODULE_3__constraint_js__["a" /* Constraint */](c) ;
            cc.node = null;
            return cc;
        }) : [];
        this.constraintLogic = t.constraintLogic || "";
        this.joins = t.joins ? Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* deepc */])(t.joins) : [];
        this.tags = t.tags ? Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* deepc */])(t.tags) : [];
        this.orderBy = t.orderBy ? Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* deepc */])(t.orderBy) : [];
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
            let cc = new __WEBPACK_IMPORTED_MODULE_3__constraint_js__["a" /* Constraint */](c);
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
            tags: Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* deepc */])(tmplt.tags),
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
                 let cc = new __WEBPACK_IMPORTED_MODULE_3__constraint_js__["a" /* Constraint */](c);
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
                    n = template.qtree = new __WEBPACK_IMPORTED_MODULE_2__node_js__["a" /* Node */]( template, null, p, cls, cls );
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
                    nn = new __WEBPACK_IMPORTED_MODULE_2__node_js__["a" /* Node */](template, n, p, x, cls);
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
            ast = ex ? __WEBPACK_IMPORTED_MODULE_1__parser_js___default.a.parse(ex) : null;
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
      longDescription="${Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["d" /* esc */])(t.description || '')}"
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
      title="${Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["d" /* esc */])(t.title || '')}"
      comment="${Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["d" /* esc */])(t.comment || '')}">
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




/***/ }),
/* 9 */
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
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Node; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__constraint_js__ = __webpack_require__(4);



//
class Node {
    // Args:
    //   template (Template object) the template that owns this node
    //   parent (object) Parent of the new node.
    //   name (string) Name for the node
    //   pcomp (object) Path component for the root, this is a class. For other nodes, an attribute, 
    //                  reference, or collection decriptor.
    //   ptype (object) Type of pcomp.
    constructor (template, parent, name, pcomp, ptype) {
        this.template = template; // the template I belong to.
        this.name = name;     // display name
        this.children = [];   // child nodes
        this.parent = parent; // parent node
        this.pcomp = pcomp;   // path component represented by the node. At root, this is
                              // the starting class. Otherwise, points to an attribute (simple, 
                              // reference, or collection).
        this.ptype  = ptype;  // path type. The type of the path at this node, i.e. the type of pcomp. 
                              // Points to a class in the model or a "leaf" class (eg java.lang.String). 
                              // May be overriden by subclass constraint.
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
        if (this.isRoot && !op.validForRoot)
            return false;
        else if (this.ptype.isLeafType) {
            if(! op.validForAttr)
                return false;
            else if( op.validTypes && op.validTypes.indexOf(this.ptype.name) == -1)
                return false;
            else
                return true;
        }
        else if(! op.validForClass)
            return false;
        else
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
        if (nt.isLeafType) return false;
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
            if (cls.isLeafType) return false;
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
            let op = __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][this.pcomp.kind === "attribute" ? "=" : "LOOKUP"];
            c = new __WEBPACK_IMPORTED_MODULE_1__constraint_js__["a" /* Constraint */]({node:this, op:op.op, ctype: op.ctype});
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




/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return initRegistry; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(0);


let registryUrl = "http://registry.intermine.org/service/instances";
let registryFileUrl = "./resources/testdata/registry.json";

function initRegistry (cb) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["b" /* d3jsonPromise */])(registryUrl)
      .then(cb)
      .catch(() => {
          alert(`Could not access registry at ${registryUrl}. Trying ${registryFileUrl}.`);
          Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["b" /* d3jsonPromise */])(registryFileUrl)
              .then(cb)
              .catch(() => {
                  alert("Cannot access registry file. This is not your lucky day.");
                  });
      });
}




/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return editViews; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__);


let editViews = { queryMain: {
        name: "queryMain",
        layoutStyle: "tree",
        nodeComp: null,
        handleIcon: {
            fontFamily: "Material Icons",
            text: n => {
                let dir = n.sort ? n.sort.dir.toLowerCase() : "none";
                let cc = __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__["codepoints"][ dir === "asc" ? "arrow_upward" : dir === "desc" ? "arrow_downward" : "" ];
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
            text: n => n.isSelected ? __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__["codepoints"]["reorder"] : ""
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
            text: n => n.sort ? __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__["codepoints"]["reorder"] : ""
        },
        nodeIcon: {
            fontFamily: "Material Icons",
            text: n => {
                let dir = n.sort ? n.sort.dir.toLowerCase() : "none";
                let cc = __WEBPACK_IMPORTED_MODULE_0__material_icon_codepoints_js__["codepoints"][ dir === "asc" ? "arrow_upward" : dir === "desc" ? "arrow_downward" : "" ];
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





/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dialog; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(0);


class Dialog {
    constructor (editor) {
        this.editor = editor;
        this.constraintEditor = editor.constraintEditor;
        this.undoMgr = editor.undoMgr;
        this.currNode = null;
        this.dg = d3.select("#dialog");
        this.dg.classed("hidden",true)
        this.dg.select(".button.close").on("click", () => this.hide());
        this.dg.select(".button.remove").on("click", () => this.editor.removeNode(this.currNode));

        // Wire up select button in dialog
        let self = this;
        d3.select('#dialog [name="select-ctrl"] .swatch')
            .on("click", function() {
                self.currNode.isSelected ? self.currNode.unselect() : self.currNode.select();
                d3.select('#dialog [name="select-ctrl"]')
                    .classed("selected", self.currNode.isSelected);
                self.undoMgr.saveState(self.currNode);
                self.editor.update(self.currNode);
            });
        // Wire up sort function in dialog
        d3.select('#dialog [name="sort-ctrl"] .swatch')
            .on("click", function() {
                let cc = d3.select('#dialog [name="sort-ctrl"]');
                if (cc.classed("disabled"))
                    return;
                let oldsort = cc.classed("sortasc") ? "asc" : cc.classed("sortdesc") ? "desc" : "none";
                let newsort = oldsort === "asc" ? "desc" : oldsort === "desc" ? "none" : "asc";
                cc.classed("sortasc", newsort === "asc");
                cc.classed("sortdesc", newsort === "desc");
                self.currNode.setSort(newsort);
                self.undoMgr.saveState(self.currNode);
                self.editor.update(self.currNode);
            });
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
    hide (){
      this.currNode = null;
      this.dg
          .classed("hidden", true)
          .transition()
          .duration(this.editor.animationDuration/2)
          .style("transform","scale(1e-6)")
          ;
      this.constraintEditor.hide();
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
    show (n, elt, refreshOnly) {
      let self = this;
      if (!elt) elt = Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["e" /* findDomByDataObj */])(n);
      this.constraintEditor.hide();
      this.currNode = n;

      let isroot = ! this.currNode.parent;
      // Make node the data obj for the dialog
      let dialog = d3.select("#dialog").datum(n);
      // Calculate dialog's position
      let dbb = dialog[0][0].getBoundingClientRect();
      let ebb = elt.getBoundingClientRect();
      let bbb = d3.select("#qb")[0][0].getBoundingClientRect();
      let t = (ebb.top - bbb.top) + ebb.width/2;
      let b = (bbb.bottom - ebb.bottom) + ebb.width/2;
      let l = (ebb.left - bbb.left) + ebb.height/2;
      let dir = "d" ; // "d" or "u"
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
      // Type name at this node
      let tp = n.ptype.name;
      let stp = (n.subclassConstraint && n.subclassConstraint.name) || null;
      let tstring = stp && `<span style="color: purple;">${stp}</span> (${tp})` || tp
      dialog.select('[name="header"] [name="type"] div')
          .html(tstring);

      // Wire up add constraint button
      dialog.select("#dialog .constraintSection .add-button")
            .on("click", function(){
                let c = n.addConstraint();
                self.undoMgr.saveState(n);
                self.editor.update(n);
                self.show(n, null, true);
                self.constraintEditor.open(c, n);
            });

      // Fill out the constraints section. First, select all constraints.
      let constrs = dialog.select(".constraintSection")
          .selectAll(".constraint")
          .data(n.constraints);
      // Enter(): create divs for each constraint to be displayed  (TODO: use an HTML5 template instead)
      // 1. container
      let cdivs = constrs.enter().append("div").attr("class","constraint") ;
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
              self.constraintEditor.open(c, n);
          });
      constrs.select("i.cancel")
          .on("click", function(c){ 
              n.removeConstraint(c);
              self.undoMgr.saveState(n);
              self.editor.update(n);
              self.show(n, null, true);
          })


      // Transition to "grow" the dialog out of the node
      dialog.transition()
          .duration(this.editor.animationDuration)
          .style("transform","scale(1.0)");

      //
      let typ = n.pcomp.type || n.pcomp; // type of the node. Case for if root node.
      if (typ.isLeafType) {
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
              .classed("disabled", n => !n.canSort())
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
              .on("click", () => this.selectedNext("summaryfields"));

          // Fill in the table listing all the attributes/refs/collections.
          let tbl = dialog.select("table.attributes");
          let rows = tbl.selectAll("tr")
              .data((n.subclassConstraint || n.ptype).allParts)
              ;
          rows.enter().append("tr");
          rows.exit().remove();
          let cells = rows.selectAll("td")
              .data(function(comp) {
                  if (comp.kind === "attribute") {
                  return [{
                      name: comp.name,
                      cls: ''
                      },{
                      name: '<i class="material-icons" title="Select this attribute">play_arrow</i>',
                      cls: 'selectsimple',
                      click: function (){self.selectedNext("selected", comp.name); }
                      },{
                      name: '<i class="material-icons" title="Constrain this attribute">play_arrow</i>',
                      cls: 'constrainsimple',
                      click: function (){self.selectedNext("constrained", comp.name); }
                      }];
                  }
                  else {
                  return [{
                      name: comp.name,
                      cls: ''
                      },{
                      name: `<i class="material-icons" title="Follow this ${comp.kind}">play_arrow</i>`,
                      cls: 'opennext',
                      click: function (){self.selectedNext("open", comp.name); }
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
    selectedNext (mode, p) {
        let self = this;
        let n;
        let cc;
        let sfs;
        let ct = this.currNode.template;
        if (mode === "summaryfields") {
            sfs = this.editor.currMine.summaryFields[this.currNode.nodeType.name]||[];
            sfs.forEach(function(sf, i){
                sf = sf.replace(/^[^.]+/, self.currNode.path);
                let m = ct.addPath(sf);
                if (! m.isSelected) {
                    m.select();
                }
            });
        }
        else {
            p = self.currNode.path + "." + p;
            n = ct.addPath(p);
            if (mode === "selected")
                !n.isSelected && n.select();
            if (mode === "constrained") {
                cc = n.addConstraint()
            }
        }
        if (mode !== "open")
            self.undoMgr.saveState(self.currNode);
        if (mode !== "summaryfields") 
            setTimeout(function(){
                self.show(n);
                cc && setTimeout(function(){
                    self.constraintEditor.open(cc, n)
                }, self.editor.animationDuration);
            }, self.editor.animationDuration);
        this.editor.update(this.currNode);
        this.hide();
        
    }
}




/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConstraintEditor; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__model_js__ = __webpack_require__(3);





class ConstraintEditor {

    constructor (callback) {
        this.afterSave = callback;
    }

    // Opens the constraint editor for constraint c of node n.
    //
    open(c, n) {

        // Note if this is happening at the root node
        let isroot = ! n.parent;
     
        // Find the div for constraint c in the dialog listing. We will
        // open the constraint editor on top of it.
        let cdiv;
        d3.selectAll("#dialog .constraint")
            .each(function(cc){ if(cc === c) cdiv = this; });
        // bounding box of the constraint's container div
        let cbb = cdiv.getBoundingClientRect();
        // bounding box of the app's main body element
        let dbb = d3.select("#qb")[0][0].getBoundingClientRect();
        // position the constraint editor over the constraint in the dialog
        let ced = d3.select("#constraintEditor")
            .attr("class", c.ctype)
            .classed("open", true)
            .classed("summarized", c.summaryList)
            .style("top", (cbb.top - dbb.top)+"px")
            .style("left", (cbb.left - dbb.left)+"px")
            ;

        // Init the constraint code 
        d3.select('#constraintEditor [name="code"]')
            .text(c.code);

        this.initInputs(n, c);

        let self = this;
        // When user selects an operator, add a class to the c.e.'s container
        d3.select('#constraintEditor [name="op"]')
            .on("change", function () {
                let op = __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][this.value];
                self.initInputs(n, c, op.ctype);
            })
            ;

        d3.select("#constraintEditor .button.cancel")
            .on("click", () => { this.cancel(n, c) });

        d3.select("#constraintEditor .button.save")
            .on("click", () => { this.saveEdits(n, c) });

        d3.select("#constraintEditor .button.sync")
            .on("click", () => { this.generateOptionList(n, c).then(() => this.initInputs(n, c)) });

    }

    // Initializes the input elements in the constraint editor from the given constraint.
    //
    initInputs (n, c, ctype) {

        // Populate the operator select list with ops appropriate for the path
        // at this node.
        if (!ctype) 
          Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
            '#constraintEditor select[name="op"]', 
            __WEBPACK_IMPORTED_MODULE_0__ops_js__["c" /* OPS */].filter(function(op){ return n.opValid(op); }),
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
            .classed("summarized",  smzd)
            .classed("bioentity",  n.isBioEntity);
     
        //
        if (ctype === "lookup") {
            d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                ["Any"].concat(n.template.model.mine.organismList),
                { selected: c.extraValue }
                );
        }
        else if (ctype === "subclass") {
            // Create an option list of subclass names
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                n.parent ? Object(__WEBPACK_IMPORTED_MODULE_2__model_js__["b" /* getSubclasses */])(n.pcomp.kind ? n.pcomp.type : n.pcomp) : [],
                { multiple: false,
                value: d => d.name,
                title: d => d.name,
                emptyMessage: "(No subclasses)",
                selected: function(d){ 
                    // Find the one whose name matches the node's type and set its selected attribute
                    let matches = d.name === ((n.subclassConstraint || n.ptype).name || n.ptype);
                    return matches || null;
                    }
                });
        }
        else if (ctype === "list") {
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                n.template.model.mine.lists.filter(function (l) { return n.listValid(l); }),
                { multiple: false,
                value: d => d.title,
                title: d => d.title,
                emptyMessage: "(No lists)",
                selected: c.value
                });
        }
        else if (ctype === "multivalue") {
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                c.summaryList || c.values || [c.value],
                { multiple: true,
                emptyMessage: "No list",
                selected: c.values || [c.value]
                });
        } else if (ctype === "value") {
            let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
            d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                c.summaryList || [c.value],
                { multiple: false,
                emptyMessage: "No results",
                selected: c.value
                });
        } else if (ctype === "null") {
        }
        else {
            throw "Unrecognized ctype: " + ctype
        }
        
    }
    /*
    //
    updateCEinputs (c, op) {
        d3.select('#constraintEditor [name="op"]')[0][0].value = op || c.op;
        d3.select('#constraintEditor [name="code"]').text(c.code);

        d3.select('#constraintEditor [name="value"]')[0][0].value = c.ctype==="null" ? "" : c.value;
        d3.select('#constraintEditor [name="values"]')[0][0].value = deepc(c.values);
    }
    */


    // Generates an option list of distinct values to select from.
    // Args:
    //   n  (node)  The node we're working on. Must be an attribute node.
    //   c  (constraint) The constraint to generate the list for.
    // NB: Only value and multivaue constraints can be summarized in this way.  
    generateOptionList (n, c) {
        // To get the list, we have to run the current query with an additional parameter, 
        // summaryPath, which is the path we want distinct values for. 
        // BUT NOTE, we have to run the query *without* constraint c!!
        // Example: suppose we have a query with a constraint alleleType=Targeted,
        // and we want to change it to Spontaneous. We open the c.e., and then click the
        // sync button to get a list. If we run the query with c intact, we'll get a list
        // containing only "Targeted". Doh!
        // ANOTHER NOTE: the path in summaryPath must be part of the query proper. The approach
        // here is to ensure it by adding the path to the view list.

        /*
        // Save this choice in localStorage
        let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
        let key = "autocomplete";
        let lst;
        lst = getLocal(key, true, []);
        if(lst.indexOf(attr) === -1) lst.push(attr);
        setLocal(key, lst, true);
        */

        // build the query
        let p = n.path; // what we want to summarize
        //
        let lex = n.template.constraintLogic; // save constraint logic expr
        n.removeConstraint(c); // temporarily remove the constraint
        n.template.select.push(p); // // make sure p is part of the query
        // get the xml
        let x = n.template.getXml(true);
        // restore the template
        n.template.select.pop();
        n.template.constraintLogic = lex; // restore the logic expr
        n.addConstraint(c); // re-add the constraint

        // build the url
        let e = encodeURIComponent(x);
        let url = `${n.template.model.mine.url}/service/query/results?summaryPath=${p}&format=jsonrows&query=${e}`
        let threshold = 250;

        // cvals containts the currently selected value(s)
        let cvals = [];
        if (c.ctype === "multivalue") {
            cvals = c.values;
        }
        else if (c.ctype === "value") {
            cvals = [ c.value ];
        }

        // signal that we're starting
        d3.select("#constraintEditor")
            .classed("summarizing", true);
        // go!
        let prom = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* d3jsonPromise */])(url).then(function(json){
            // The list of values is in json.reults.
            // Each list item looks like: { item: "somestring", count: 17 }
            // (Yes, we get counts for free! Ought to make use of this.)
            let res = json.results.map(r => r.item).sort();
            // check size of result
            if (res.length > threshold) {
                // too big. ask user what to do.
                let ans = prompt(`There are ${res.length} results, which exceeds the threshold of ${threshold}. How many do you want to show?`, threshold);
                if (ans === null) {
                    // user sez cancel
                    // Signal that we're done.
                    d3.select("#constraintEditor")
                        .classed("summarizing", false);
                    return;
                }
                ans = parseInt(ans);
                if (isNaN(ans) || ans <= 0) return;
                // user wants this many results
                res = res.slice(0, ans);
            }
            //
            c.summaryList = res;

            d3.select("#constraintEditor")
                .classed("summarizing", false)
                .classed("summarized", true);

            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* initOptionList */])(
                    '#constraintEditor [name="values"]',
                    c.summaryList, 
                    { selected: d => cvals.indexOf(d) !== -1 || null });

        });
        return prom; // so caller can chain
    }
    //
    cancel (n, c) {
        if (! c.saved) {
            n.removeConstraint(c);
            this.afterSave(n);
        }
        this.hide();
    }
    hide() {
        d3.select("#constraintEditor").classed("open", null);
    }
    //
    saveEdits(n, c) {
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
            let removed = n.setSubclassConstraint(c);
            if(removed.length > 0)
                window.setTimeout(function(){
                    alert("Constraining to subclass " + (c.type || n.ptype.name)
                    + " caused the following paths to be removed: " 
                    + removed.map(n => n.path).join(", ")); 
                }, 250);
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
        this.hide();
        this.afterSave && this.afterSave(n);
    }

} // class ConstraintEditor




/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGY1YjI5MmNkOGM1MWZiZGM1NmUiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3RlbXBsYXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL25vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3JlZ2lzdHJ5LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29uc3RyYWludEVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLHdCQUF3QixHO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU0sYUFBYSxRQUFRO0FBQzNDO0FBQ0EsWUFBWSxZQUFZLEdBQUcsYUFBYTtBQUN4QztBQUNBLFlBQVksdUJBQXVCLEdBQUcsd0JBQXdCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLGlCQUFpQixFQUFFO0FBQ3BGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFlQTs7Ozs7Ozs7Ozs7O0FDN1JBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVHOzs7Ozs7O0FDcE9SO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUw7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDaDdCb0I7QUFDTzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELHNCQUFzQixFQUFFO0FBQzFFLGtEQUFrRCxzQkFBc0IsRUFBRTtBQUMxRSxtREFBbUQsdUJBQXVCLEVBQUU7QUFDNUU7QUFDQSw0Q0FBNEMsdURBQXVELEVBQUU7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBLENBQUM7OztBQUdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4Qyw0QkFBNEIsRUFBRTtBQUM1RSxrRUFBa0Usd0JBQXdCLEVBQUU7QUFDNUYsMkNBQTJDLHFCQUFxQixZQUFZLEVBQUUsSUFBSTtBQUNsRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsMEJBQTBCLEVBQUU7QUFDM0UsbUVBQW1FLHdCQUF3QixFQUFFO0FBQzdGLDJDQUEyQyxxQkFBcUIsWUFBWSxFQUFFLElBQUk7QUFDbEY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxzQ0FBc0MsRUFBRTtBQUN0RjtBQUNBOzs7QUFRQTs7Ozs7Ozs7Ozs7QUN4SGtCO0FBQ0c7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx5QkFBeUI7QUFDbkU7QUFDQSx5QkFBeUIsVUFBVSxRQUFRLHdFQUFhLFdBQVcsMkVBQWdCLFVBQVUsVUFBVSxJQUFJLEVBQUU7QUFDN0c7QUFDQSxxRkFBcUYsZ0JBQWdCO0FBQ3JHLHlCQUF5QixVQUFVLFFBQVEsd0VBQWEsV0FBVywyRUFBZ0IsSUFBSSxHQUFHLFNBQVMsVUFBVSxJQUFJLEVBQUU7QUFDbkg7QUFDQTtBQUNBLHlCQUF5QixVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsSUFBSSxFQUFFO0FBQzdFLGdEQUFnRCxrRUFBTztBQUN2RDtBQUNBO0FBQ0EseUJBQXlCLFVBQVUsVUFBVSxVQUFVLElBQUksRUFBRTtBQUM3RDtBQUNBLHlCQUF5QixVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsSUFBSSxFQUFFO0FBQzdFO0FBQ0Esa0NBQWtDLEVBQUUsR0FBRyxFQUFFO0FBQ3pDO0FBQ0Esa0NBQWtDLEVBQUU7QUFDcEM7QUFDQSxDQUFDOztBQUVPOzs7Ozs7Ozs7QUN4R1I7QUFBQTtBQUNBO0FBQ0E7O0FBRW1COztBQUVuQjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUitEO0FBVTlEO0FBQ29CO0FBQ0M7QUFDTjtBQUNHO0FBQ0k7QUFDSDtBQUNIO0FBQ1U7O0FBRTNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQztBQUNyQyw4QkFBOEIsVUFBVSxnQ0FBZ0M7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixRQUFROztBQUVqQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLDZCQUE2QixxQkFBcUIsNkJBQTZCO0FBQ3pIO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxvQ0FBb0Msb0dBQXlDO0FBQzdFO0FBQ0Esb0NBQW9DLHFHQUEwQzs7QUFFOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLElBQUksR0FBRyxJQUFJO0FBQzdDLFdBQVc7QUFDWDtBQUNBLGtEQUFrRCxtQkFBbUI7QUFDckU7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsZUFBZTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLDBDQUEwQyxvQ0FBb0MsRUFBRTtBQUNoRiw4QkFBOEIsZUFBZSxFQUFFO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJEO0FBQzNEO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRDtBQUMzRDtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxRQUFRLFdBQVcsYUFBYSxVQUFVLGlCQUFpQjtBQUNqRyxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsOEJBQThCLEVBQUU7QUFDN0QscUNBQXFDLHFDQUFxQyxrQkFBa0IsRUFBRTtBQUM5RjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsUUFBUTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQW1DLHFCQUFxQjtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMseUNBQXlDLEVBQUU7QUFDcEY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLHNCQUFzQixzQkFBc0I7QUFDbkY7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHFCQUFxQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsc0JBQXNCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyw0QkFBNEI7QUFDakU7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHdCQUF3Qjs7QUFFN0Q7QUFDQTtBQUNBLDZCQUE2Qix3Q0FBd0M7QUFDckU7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQ0FBaUMsU0FBUyxnQ0FBZ0MsRUFBRTtBQUM1RSxpQ0FBaUMsU0FBUyxnQ0FBZ0MsRUFBRTtBQUM1RSxxQ0FBcUMsbUJBQW1CLEVBQUU7QUFDMUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0I7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFdBQVc7QUFDdkM7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGVBQWUsV0FBVyxXQUFXLEVBQUU7O0FBRTNFO0FBQ0E7QUFDQSwyQ0FBMkMsU0FBUyxvQkFBb0IsRUFBRTs7QUFFMUU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixFQUFFO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlOztBQUVmOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLDZCQUE2QixFQUFFO0FBQ25FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMseURBQXlELEVBQUU7QUFDckc7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtDQUFrQyw4QkFBOEIsRUFBRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsNkNBQTZDLEVBQUU7QUFDekY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRCQUE0QixzQkFBc0IsRUFBRTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxVQUFVO0FBQzdDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx1REFBdUQsRUFBRTtBQUNuRztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0Msb0JBQW9CLEVBQUU7QUFDMUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RCx3Q0FBd0M7QUFDakc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsa0NBQWtDLHFCQUFxQjtBQUN2RCxXQUFXO0FBQ1gsNkNBQTZDLDRDQUE0QyxFQUFFO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQSx5Q0FBeUMsa0NBQWtDLEVBQUU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsa0NBQWtDLHFCQUFxQjtBQUN2RCxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUVBQXFFLG9GQUFzQjtBQUMzRjtBQUNBLHVDQUF1QyxFQUFFO0FBQ3pDLFdBQVc7QUFDWCxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLE9BQU87QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVMsbUJBQW1CO0FBQzVCLFNBQVM7QUFDVDtBQUNBLDBCQUEwQixvQ0FBb0MsRUFBRTtBQUNoRSwwQkFBMEIsOENBQThDO0FBQ3hFO0FBQ0E7QUFDQTs7QUFFUTs7Ozs7Ozs7QUNyM0JSO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxnQ0FBZ0M7QUFDN0MscUJBQXFCLGtCQUFrQjtBQUN2QztBQUNBO0FBQ0EsYUFBYSxnQ0FBZ0M7QUFDN0MscUJBQXFCLGtCQUFrQjtBQUN2QztBQUNBOztBQUVBO0FBQ0EsaUJBQWlCO0FBQ2pCLGlCQUFpQjtBQUNqQjtBQUNBOztBQUVROzs7Ozs7Ozs7Ozs7OztBQ25FYTtBQUNyQjtBQUNlO0FBQ007O0FBRXJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHlCQUF5QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGtCQUFrQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBLDRDQUE0QyxvQkFBb0I7QUFDaEU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyx3QkFBd0I7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCx3QkFBd0IscUJBQXFCLFVBQVU7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLDJCQUEyQixJQUFJO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNkIsd0JBQXdCLEVBQUU7O0FBRXZEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO0FBQ2pDLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLGtDQUFrQyxHQUFHO0FBQ3JDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsYUFBYTtBQUMzQixlQUFlLGdDQUFnQztBQUMvQyxjQUFjLG1CQUFtQjtBQUNqQyx5QkFBeUIsb0ZBQXlCO0FBQ2xELG1CQUFtQixTQUFTO0FBQzVCLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUixRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGFBQWE7QUFDM0IsZUFBZSw4RUFBbUI7QUFDbEMsaUJBQWlCLGdGQUFxQjtBQUN0QyxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7QUFFTzs7Ozs7OztBQ3JWUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQiwwQkFBMEI7QUFDL0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBOztBQUVBLHVCQUF1Qiw4QkFBOEI7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELHlCQUF5QixFQUFFO0FBQ25GLHdEQUF3RCx5QkFBeUIsRUFBRTtBQUNuRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCx5QkFBeUIsRUFBRTtBQUNuRix3REFBd0QseUJBQXlCLEVBQUU7QUFDbkY7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIscUJBQXFCO0FBQ3RDO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSwwQkFBMEIseUJBQXlCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHVCQUF1Qjs7QUFFdkIsa0NBQWtDLGtDQUFrQztBQUNwRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGFBQWEsRUFBRTtBQUNqRDtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsNkJBQTZCLEVBQUU7QUFDN0Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQ0FBaUMscUJBQXFCO0FBQ3REO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0EsY0FBYztBQUNkOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHlDQUF5QyxRQUFROztBQUVqRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsMENBQTBDLGtCQUFrQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsNENBQTRDLGtCQUFrQjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBLDRDQUE0QyxrQkFBa0I7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLDhDQUE4QyxrQkFBa0I7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQSx3Q0FBd0Msa0JBQWtCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSwwQ0FBMEMsa0JBQWtCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsMENBQTBDLGtCQUFrQjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsNENBQTRDLGtCQUFrQjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLG9DQUFvQyxtQkFBbUI7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBLDRDQUE0QyxtQkFBbUI7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLHNDQUFzQyxtQkFBbUI7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLG1CQUFtQjtBQUN2RDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLG9DQUFvQyxtQkFBbUI7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esc0NBQXNDLG1CQUFtQjtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLG1CQUFtQjtBQUN2RDs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxHQUFHLHlCQUF5QjtBQUN2Qzs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7QUNyckJpQjtBQUNHOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQyx5QkFBeUI7QUFDekIsMkJBQTJCO0FBQzNCLDZCQUE2QjtBQUM3QiwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0EsOEJBQThCO0FBQzlCLHlCQUF5QjtBQUN6Qjs7QUFFQSx5QkFBeUI7O0FBRXpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsd0JBQXdCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCw0Q0FBNEMsRUFBRTtBQUN6RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RkFBZ0MscUNBQXFDO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdFQUFnRSxpQkFBaUIsRUFBRTtBQUNuRixzRUFBc0UsaUJBQWlCLEVBQUU7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRU87Ozs7Ozs7Ozs7QUM1UWdCOztBQUV4QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFlBQVksV0FBVyxnQkFBZ0I7QUFDdkY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsT0FBTztBQUNQOztBQUVROzs7Ozs7Ozs7OztBQ2xCVzs7QUFFbkIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0Esa0NBQWtDLGFBQWE7QUFDL0M7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFUTs7Ozs7Ozs7Ozs7QUM5R21COztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsSUFBSSxJQUFJLFdBQVcsR0FBRztBQUM3RTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0NBQXNDLGdDQUFnQyxFQUFFO0FBQ3hFO0FBQ0EsNEJBQTRCLHNCQUFzQixFQUFFO0FBQ3BEO0FBQ0EsNEJBQTRCLHNCQUFzQixFQUFFO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQSxtQztBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsbUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7OztBQUdYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0NBQXdDO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0Msc0JBQXNCO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBLHlDQUF5Qyx5Q0FBeUM7QUFDbEYsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQSx5Q0FBeUMsNENBQTRDO0FBQ3JGLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCLDRFQUE0RSxVQUFVO0FBQ3RGO0FBQ0EseUNBQXlDLHFDQUFxQztBQUM5RSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsY0FBYztBQUN2RCxnQ0FBZ0MsZUFBZTtBQUMvQyx1Q0FBdUMsNkJBQTZCLEVBQUU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7O0FBRWlCOzs7Ozs7Ozs7Ozs7O0FDelQ4QztBQUN2QjtBQUNoQjs7QUFFeEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDBCQUEwQixFQUFFO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0EsZ0NBQWdDLG9CQUFvQjs7QUFFcEQ7QUFDQSxnQ0FBZ0MsdUJBQXVCOztBQUV2RDtBQUNBLGdDQUFnQyxrRUFBa0U7O0FBRWxHOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUZBQW9DLHNCQUFzQixFQUFFO0FBQzVELGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUUsdUJBQXVCLEVBQUU7QUFDMUYsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQSw2Q0FBNkM7QUFDN0MsOEJBQThCO0FBQzlCLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6QywyQkFBMkI7O0FBRTNCO0FBQ0E7QUFDQSxxQkFBcUIsMEJBQTBCLHFDQUFxQyxFQUFFLHlCQUF5QixFQUFFO0FBQ2pIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsV0FBVywyQ0FBMkMsVUFBVTtBQUM5RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsaURBQWlEOztBQUV0RSxTQUFTO0FBQ1Qsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkQ7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7QUFFTyIsImZpbGUiOiJxYi5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBkZjViMjkyY2Q4YzUxZmJkYzU2ZSIsIlxuLy9cbi8vIEZ1bmN0aW9uIHRvIGVzY2FwZSAnPCcgJ1wiJyBhbmQgJyYnIGNoYXJhY3RlcnNcbmZ1bmN0aW9uIGVzYyhzKXtcbiAgICBpZiAoIXMpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBzLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKTsgXG59XG5cbi8vIFByb21pc2lmaWVzIGEgY2FsbCB0byBkMy5qc29uLlxuLy8gQXJnczpcbi8vICAgdXJsIChzdHJpbmcpIFRoZSB1cmwgb2YgdGhlIGpzb24gcmVzb3VyY2Vcbi8vIFJldHVybnM6XG4vLyAgIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBqc29uIG9iamVjdCB2YWx1ZSwgb3IgcmVqZWN0cyB3aXRoIGFuIGVycm9yXG5mdW5jdGlvbiBkM2pzb25Qcm9taXNlKHVybCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZDMuanNvbih1cmwsIGZ1bmN0aW9uKGVycm9yLCBqc29uKXtcbiAgICAgICAgICAgIGVycm9yID8gcmVqZWN0KHsgc3RhdHVzOiBlcnJvci5zdGF0dXMsIHN0YXR1c1RleHQ6IGVycm9yLnN0YXR1c1RleHR9KSA6IHJlc29sdmUoanNvbik7XG4gICAgICAgIH0pXG4gICAgfSk7XG59XG5cbi8vIFNlbGVjdHMgYWxsIHRoZSB0ZXh0IGluIHRoZSBnaXZlbiBjb250YWluZXIuIFxuLy8gVGhlIGNvbnRhaW5lciBtdXN0IGhhdmUgYW4gaWQuXG4vLyBDb3BpZWQgZnJvbTpcbi8vICAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzE2Nzc0NTEvaG93LXRvLXNlbGVjdC1kaXYtdGV4dC1vbi1idXR0b24tY2xpY2tcbmZ1bmN0aW9uIHNlbGVjdFRleHQoY29udGFpbmVyaWQpIHtcbiAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHJhbmdlLnNlbGVjdCgpO1xuICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcmlkKSk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH1cbn1cblxuLy8gQ29udmVydHMgYW4gSW50ZXJNaW5lIHF1ZXJ5IGluIFBhdGhRdWVyeSBYTUwgZm9ybWF0IHRvIGEgSlNPTiBvYmplY3QgcmVwcmVzZW50YXRpb24uXG4vL1xuZnVuY3Rpb24gcGFyc2VQYXRoUXVlcnkoeG1sKXtcbiAgICAvLyBUdXJucyB0aGUgcXVhc2ktbGlzdCBvYmplY3QgcmV0dXJuZWQgYnkgc29tZSBET00gbWV0aG9kcyBpbnRvIGFjdHVhbCBsaXN0cy5cbiAgICBmdW5jdGlvbiBkb21saXN0MmFycmF5KGxzdCkge1xuICAgICAgICBsZXQgYSA9IFtdO1xuICAgICAgICBmb3IobGV0IGk9MDsgaTxsc3QubGVuZ3RoOyBpKyspIGEucHVzaChsc3RbaV0pO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgLy8gcGFyc2UgdGhlIFhNTFxuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgbGV0IGRvbSA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoeG1sLCBcInRleHQveG1sXCIpO1xuXG4gICAgLy8gZ2V0IHRoZSBwYXJ0cy4gVXNlciBtYXkgcGFzdGUgaW4gYSA8dGVtcGxhdGU+IG9yIGEgPHF1ZXJ5PlxuICAgIC8vIChpLmUuLCB0ZW1wbGF0ZSBtYXkgYmUgbnVsbClcbiAgICBsZXQgdGVtcGxhdGUgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0ZW1wbGF0ZVwiKVswXTtcbiAgICBsZXQgdGl0bGUgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSB8fCBcIlwiO1xuICAgIGxldCBjb21tZW50ID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwiY29tbWVudFwiKSB8fCBcIlwiO1xuICAgIGxldCBxdWVyeSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInF1ZXJ5XCIpWzBdO1xuICAgIGxldCBtb2RlbCA9IHsgbmFtZTogcXVlcnkuZ2V0QXR0cmlidXRlKFwibW9kZWxcIikgfHwgXCJnZW5vbWljXCIgfTtcbiAgICBsZXQgbmFtZSA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm5hbWVcIikgfHwgXCJcIjtcbiAgICBsZXQgZGVzY3JpcHRpb24gPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJsb25nRGVzY3JpdGlvblwiKSB8fCBcIlwiO1xuICAgIGxldCBzZWxlY3QgPSAocXVlcnkuZ2V0QXR0cmlidXRlKFwidmlld1wiKSB8fCBcIlwiKS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICBsZXQgY29uc3RyYWludHMgPSBkb21saXN0MmFycmF5KGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY29uc3RyYWludCcpKTtcbiAgICBsZXQgY29uc3RyYWludExvZ2ljID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwiY29uc3RyYWludExvZ2ljXCIpO1xuICAgIGxldCBqb2lucyA9IGRvbWxpc3QyYXJyYXkocXVlcnkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJqb2luXCIpKTtcbiAgICBsZXQgc29ydE9yZGVyID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpIHx8IFwiXCI7XG4gICAgLy9cbiAgICAvL1xuICAgIGxldCB3aGVyZSA9IGNvbnN0cmFpbnRzLm1hcChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBvcCA9IGMuZ2V0QXR0cmlidXRlKFwib3BcIik7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIW9wKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKTtcbiAgICAgICAgICAgICAgICBvcCA9IFwiSVNBXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdmFscyA9IGRvbWxpc3QyYXJyYXkoYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInZhbHVlXCIpKS5tYXAoIHYgPT4gdi5pbm5lckhUTUwgKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3A6IG9wLFxuICAgICAgICAgICAgICAgIHBhdGg6IGMuZ2V0QXR0cmlidXRlKFwicGF0aFwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA6IGMuZ2V0QXR0cmlidXRlKFwidmFsdWVcIiksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogdmFscyxcbiAgICAgICAgICAgICAgICB0eXBlIDogYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpLFxuICAgICAgICAgICAgICAgIGNvZGU6IGMuZ2V0QXR0cmlidXRlKFwiY29kZVwiKSxcbiAgICAgICAgICAgICAgICBlZGl0YWJsZTogYy5nZXRBdHRyaWJ1dGUoXCJlZGl0YWJsZVwiKSB8fCBcInRydWVcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIC8vIENoZWNrOiBpZiB0aGVyZSBpcyBvbmx5IG9uZSBjb25zdHJhaW50LCAoYW5kIGl0J3Mgbm90IGFuIElTQSksIHNvbWV0aW1lcyB0aGUgY29uc3RyYWludExvZ2ljIFxuICAgIC8vIGFuZC9vciB0aGUgY29uc3RyYWludCBjb2RlIGFyZSBtaXNzaW5nLlxuICAgIGlmICh3aGVyZS5sZW5ndGggPT09IDEgJiYgd2hlcmVbMF0ub3AgIT09IFwiSVNBXCIgJiYgIXdoZXJlWzBdLmNvZGUpe1xuICAgICAgICB3aGVyZVswXS5jb2RlID0gY29uc3RyYWludExvZ2ljID0gXCJBXCI7XG4gICAgfVxuXG4gICAgLy8gb3V0ZXIgam9pbnMuIFRoZXkgbG9vayBsaWtlIHRoaXM6XG4gICAgLy8gICAgICAgPGpvaW4gcGF0aD1cIkdlbmUuc2VxdWVuY2VPbnRvbG9neVRlcm1cIiBzdHlsZT1cIk9VVEVSXCIvPlxuICAgIGpvaW5zID0gam9pbnMubWFwKCBqID0+IGouZ2V0QXR0cmlidXRlKFwicGF0aFwiKSApO1xuXG4gICAgbGV0IG9yZGVyQnkgPSBudWxsO1xuICAgIGlmIChzb3J0T3JkZXIpIHtcbiAgICAgICAgLy8gVGhlIGpzb24gZm9ybWF0IGZvciBvcmRlckJ5IGlzIGEgYml0IHdlaXJkLlxuICAgICAgICAvLyBJZiB0aGUgeG1sIG9yZGVyQnkgaXM6IFwiQS5iLmMgYXNjIEEuZC5lIGRlc2NcIixcbiAgICAgICAgLy8gdGhlIGpzb24gc2hvdWxkIGJlOiBbIHtcIkEuYi5jXCI6XCJhc2NcIn0sIHtcIkEuZC5lXCI6XCJkZXNjfSBdXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBUaGUgb3JkZXJieSBzdHJpbmcgdG9rZW5zLCBlLmcuIFtcIkEuYi5jXCIsIFwiYXNjXCIsIFwiQS5kLmVcIiwgXCJkZXNjXCJdXG4gICAgICAgIGxldCBvYiA9IHNvcnRPcmRlci50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrOlxuICAgICAgICBpZiAob2IubGVuZ3RoICUgMiApXG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBwYXJzZSB0aGUgb3JkZXJCeSBjbGF1c2U6IFwiICsgcXVlcnkuZ2V0QXR0cmlidXRlKFwic29ydE9yZGVyXCIpO1xuICAgICAgICAvLyBjb252ZXJ0IHRva2VucyB0byBqc29uIG9yZGVyQnkgXG4gICAgICAgIG9yZGVyQnkgPSBvYi5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBjdXJyLCBpKXtcbiAgICAgICAgICAgIGlmIChpICUgMiA9PT0gMCl7XG4gICAgICAgICAgICAgICAgLy8gb2RkLiBjdXJyIGlzIGEgcGF0aC4gUHVzaCBpdC5cbiAgICAgICAgICAgICAgICBhY2MucHVzaChjdXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZXZlbi4gUG9wIHRoZSBwYXRoLCBjcmVhdGUgdGhlIHt9LCBhbmQgcHVzaCBpdC5cbiAgICAgICAgICAgICAgICBsZXQgdiA9IHt9XG4gICAgICAgICAgICAgICAgbGV0IHAgPSBhY2MucG9wKClcbiAgICAgICAgICAgICAgICB2W3BdID0gY3VycjtcbiAgICAgICAgICAgICAgICBhY2MucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIG1vZGVsLFxuICAgICAgICBuYW1lLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgY29uc3RyYWludExvZ2ljLFxuICAgICAgICBzZWxlY3QsXG4gICAgICAgIHdoZXJlLFxuICAgICAgICBqb2lucyxcbiAgICAgICAgb3JkZXJCeVxuICAgIH07XG59XG5cbi8vIFJldHVybnMgYSBkZWVwIGNvcHkgb2Ygb2JqZWN0IG8uIFxuLy8gQXJnczpcbi8vICAgbyAgKG9iamVjdCkgTXVzdCBiZSBhIEpTT04gb2JqZWN0IChubyBjdXJjdWxhciByZWZzLCBubyBmdW5jdGlvbnMpLlxuLy8gUmV0dXJuczpcbi8vICAgYSBkZWVwIGNvcHkgb2Ygb1xuZnVuY3Rpb24gZGVlcGMobykge1xuICAgIGlmICghbykgcmV0dXJuIG87XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobykpO1xufVxuXG4vL1xubGV0IFBSRUZJWD1cIm9yZy5tZ2kuYXBwcy5xYlwiO1xuZnVuY3Rpb24gdGVzdExvY2FsKGF0dHIpIHtcbiAgICByZXR1cm4gKFBSRUZJWCtcIi5cIithdHRyKSBpbiBsb2NhbFN0b3JhZ2U7XG59XG5mdW5jdGlvbiBzZXRMb2NhbChhdHRyLCB2YWwsIGVuY29kZSl7XG4gICAgbG9jYWxTdG9yYWdlW1BSRUZJWCtcIi5cIithdHRyXSA9IGVuY29kZSA/IEpTT04uc3RyaW5naWZ5KHZhbCkgOiB2YWw7XG59XG5mdW5jdGlvbiBnZXRMb2NhbChhdHRyLCBkZWNvZGUsIGRmbHQpe1xuICAgIGxldCBrZXkgPSBQUkVGSVgrXCIuXCIrYXR0cjtcbiAgICBpZiAoa2V5IGluIGxvY2FsU3RvcmFnZSl7XG4gICAgICAgIGxldCB2ID0gbG9jYWxTdG9yYWdlW2tleV07XG4gICAgICAgIGlmIChkZWNvZGUpIHYgPSBKU09OLnBhcnNlKHYpO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBkZmx0O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyTG9jYWwoKSB7XG4gICAgbGV0IHJtdiA9IE9iamVjdC5rZXlzKGxvY2FsU3RvcmFnZSkuZmlsdGVyKGtleSA9PiBrZXkuc3RhcnRzV2l0aChQUkVGSVgpKTtcbiAgICBybXYuZm9yRWFjaCggayA9PiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrKSApO1xufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gdGhlIGdpdmVuIG9iamVjdC5cbi8vIFRoZSBsaXN0IGlzIHNvcnRlZCBieSB0aGUgaXRlbSBrZXlzLlxuLy8gSWYgbmFtZUF0dHIgaXMgc3BlY2lmaWVkLCB0aGUgaXRlbSBrZXkgaXMgYWxzbyBhZGRlZCB0byBlYWNoIGVsZW1lbnRcbi8vIGFzIGFuIGF0dHJpYnV0ZSAob25seSB3b3JrcyBpZiB0aG9zZSBpdGVtcyBhcmUgdGhlbXNlbHZlcyBvYmplY3RzKS5cbi8vIEV4YW1wbGVzOlxuLy8gICAgc3RhdGVzID0geydNRSc6e25hbWU6J01haW5lJ30sICdJQSc6e25hbWU6J0lvd2EnfX1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJ30sIHtuYW1lOidNYWluZSd9XVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcywgJ2FiYnJldicpID0+XG4vLyAgICAgICAgW3tuYW1lOidJb3dhJyxhYmJyZXYnSUEnfSwge25hbWU6J01haW5lJyxhYmJyZXYnTUUnfV1cbi8vIEFyZ3M6XG4vLyAgICBvICAob2JqZWN0KSBUaGUgb2JqZWN0LlxuLy8gICAgbmFtZUF0dHIgKHN0cmluZykgSWYgc3BlY2lmaWVkLCBhZGRzIHRoZSBpdGVtIGtleSBhcyBhbiBhdHRyaWJ1dGUgdG8gZWFjaCBsaXN0IGVsZW1lbnQuXG4vLyBSZXR1cm46XG4vLyAgICBsaXN0IGNvbnRhaW5pbmcgdGhlIGl0ZW0gdmFsdWVzIGZyb20gb1xuZnVuY3Rpb24gb2JqMmFycmF5KG8sIG5hbWVBdHRyKXtcbiAgICBsZXQga3MgPSBPYmplY3Qua2V5cyhvKTtcbiAgICBrcy5zb3J0KCk7XG4gICAgcmV0dXJuIGtzLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICBpZiAobmFtZUF0dHIpIG9ba10ubmFtZSA9IGs7XG4gICAgICAgIHJldHVybiBvW2tdO1xuICAgIH0pO1xufTtcblxuLy8gQXJnczpcbi8vICAgc2VsZWN0b3IgKHN0cmluZykgRm9yIHNlbGVjdGluZyB0aGUgPHNlbGVjdD4gZWxlbWVudFxuLy8gICBkYXRhIChsaXN0KSBEYXRhIHRvIGJpbmQgdG8gb3B0aW9uc1xuLy8gICBjZmcgKG9iamVjdCkgQWRkaXRpb25hbCBvcHRpb25hbCBjb25maWdzOlxuLy8gICAgICAgdGl0bGUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIGZvciBzZXR0aW5nIHRoZSB0ZXh0IG9mIHRoZSBvcHRpb24uIFxuLy8gICAgICAgdmFsdWUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIHNldHRpbmcgdGhlIHZhbHVlIG9mIHRoZSBvcHRpb25cbi8vICAgICAgIHNlbGVjdGVkIC0gZnVuY3Rpb24gb3IgYXJyYXkgb3Igc3RyaW5nIGZvciBkZWNpZGluZyB3aGljaCBvcHRpb24ocykgYXJlIHNlbGVjdGVkXG4vLyAgICAgICAgICBJZiBmdW5jdGlvbiwgY2FsbGVkIGZvciBlYWNoIG9wdGlvbi5cbi8vICAgICAgICAgIElmIGFycmF5LCBzcGVjaWZpZXMgdGhlIHZhbHVlcyB0byBzZWxlY3QuXG4vLyAgICAgICAgICBJZiBzdHJpbmcsIHNwZWNpZmllcyB3aGljaCB2YWx1ZSBpcyBzZWxlY3RlZFxuLy8gICAgICAgZW1wdHlNZXNzYWdlIC0gYSBtZXNzYWdlIHRvIHNob3cgaWYgdGhlIGRhdGEgbGlzdCBpcyBlbXB0eVxuLy8gICAgICAgbXVsdGlwbGUgLSBpZiB0cnVlLCBtYWtlIGl0IGEgbXVsdGktc2VsZWN0IGxpc3Rcbi8vXG5mdW5jdGlvbiBpbml0T3B0aW9uTGlzdCAoc2VsZWN0b3IsIGRhdGEsIGNmZykge1xuICAgIFxuICAgIGNmZyA9IGNmZyB8fCB7fTtcblxuICAgIGxldCBpZGVudCA9ICh4PT54KTtcbiAgICBsZXQgb3B0cztcbiAgICBpZihkYXRhICYmIGRhdGEubGVuZ3RoID4gMCl7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShkYXRhKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICAvL1xuICAgICAgICBvcHRzLmF0dHIoXCJ2YWx1ZVwiLCBjZmcudmFsdWUgfHwgaWRlbnQpXG4gICAgICAgICAgICAudGV4dChjZmcudGl0bGUgfHwgaWRlbnQpXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIG51bGwpXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIG51bGwpO1xuICAgICAgICBpZiAodHlwZW9mKGNmZy5zZWxlY3RlZCkgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgZnVuY3Rpb24gc2F5cyBzb1xuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjZmcuc2VsZWN0ZWQoZCl8fG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoY2ZnLnNlbGVjdGVkKSkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIGlzIGluIHRoZSBhcnJheVxuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiBjZmcuc2VsZWN0ZWQuaW5kZXhPZigoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSkgIT0gLTEgfHwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ZnLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgbWF0Y2hlc1xuICAgICAgICAgICAgb3B0cy5hdHRyKFwic2VsZWN0ZWRcIiwgZCA9PiAoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkgPT09IGNmZy5zZWxlY3RlZCkgfHwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkMy5zZWxlY3Qoc2VsZWN0b3IpWzBdWzBdLnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoW2NmZy5lbXB0eU1lc3NhZ2V8fFwiZW1wdHkgbGlzdFwiXSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgb3B0cy50ZXh0KGlkZW50KS5hdHRyKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIHNldCBtdWx0aSBzZWxlY3QgKG9yIG5vdClcbiAgICBkMy5zZWxlY3Qoc2VsZWN0b3IpLmF0dHIoXCJtdWx0aXBsZVwiLCBjZmcubXVsdGlwbGUgfHwgbnVsbCk7XG4gICAgLy8gYWxsb3cgY2FsbGVyIHRvIGNoYWluXG4gICAgcmV0dXJuIG9wdHM7XG59XG5cbi8vIFJldHVybnMgIHRoZSBET00gZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBkYXRhIG9iamVjdC5cbi8vXG5mdW5jdGlvbiBmaW5kRG9tQnlEYXRhT2JqKGQpe1xuICAgIGxldCB4ID0gZDMuc2VsZWN0QWxsKFwiLm5vZGVncm91cCAubm9kZVwiKS5maWx0ZXIoZnVuY3Rpb24oZGQpeyByZXR1cm4gZGQgPT09IGQ7IH0pO1xuICAgIHJldHVybiB4WzBdWzBdO1xufVxuXG4vL1xuZnVuY3Rpb24gY29weU9iaih0Z3QsIHNyYywgZGlyKSB7XG4gICAgZGlyID0gZGlyIHx8IHRndDtcbiAgICBmb3IoIGxldCBuIGluIGRpciApXG4gICAgICAgIHRndFtuXSA9IChuIGluIHNyYykgPyBzcmNbbl0gOiBkaXJbbl07XG4gICAgcmV0dXJuIHRndDtcbn1cblxuLy9cbmV4cG9ydCB7XG4gICAgZXNjLFxuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeSxcbiAgICBvYmoyYXJyYXksXG4gICAgaW5pdE9wdGlvbkxpc3QsXG4gICAgZmluZERvbUJ5RGF0YU9iaixcbiAgICBjb3B5T2JqXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBWYWxpZCBjb25zdHJhaW50IHR5cGVzIChjdHlwZSk6XG4vLyAgIG51bGwsIGxvb2t1cCwgc3ViY2xhc3MsIGxpc3QsIGxvb3AsIHZhbHVlLCBtdWx0aXZhbHVlLCByYW5nZVxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIGF0dHJpYnV0ZXM6XG4vLyAtIHZhbHVlIChjb21wYXJpbmcgYW4gYXR0cmlidXRlIHRvIGEgdmFsdWUsIHVzaW5nIGFuIG9wZXJhdG9yKVxuLy8gICAgICA+ID49IDwgPD0gPSAhPSBMSUtFIE5PVC1MSUtFIENPTlRBSU5TIERPRVMtTk9ULUNPTlRBSU5cbi8vIC0gbXVsdGl2YWx1ZSAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBtdWx0aXBsZSB2YWx1ZSlcbi8vICAgICAgT05FLU9GIE5PVC1PTkUgT0Zcbi8vIC0gcmFuZ2UgKHN1YnR5cGUgb2YgbXVsdGl2YWx1ZSwgZm9yIGNvb3JkaW5hdGUgcmFuZ2VzKVxuLy8gICAgICBXSVRISU4gT1VUU0lERSBPVkVSTEFQUyBET0VTLU5PVC1PVkVSTEFQXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTClcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIHJlZmVyZW5jZXMvY29sbGVjdGlvbnNcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMIHJlZi9lbXB0eSBjb2xsZWN0aW9uKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vLyAtIGxvb2t1cCAoXG4vLyAgICAgIExPT0tVUFxuLy8gLSBzdWJjbGFzc1xuLy8gICAgICBJU0Fcbi8vIC0gbGlzdFxuLy8gICAgICBJTiBOT1QtSU5cbi8vIC0gbG9vcCAoVE9ETylcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgYXJlIG51bWVyaWNcbmxldCBOVU1FUklDVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCJcbl07XG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGNhbiBoYXZlIG51bGwgdmFsdWVzXG5sZXQgTlVMTEFCTEVUWVBFUz0gW1xuICAgIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiXG5dO1xuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBhbiBhdHRyaWJ1dGUgY2FuIGhhdmVcbmxldCBMRUFGVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiLFxuICAgIFwiamF2YS5sYW5nLk9iamVjdFwiLFxuICAgIFwib3JnLmludGVybWluZS5vYmplY3RzdG9yZS5xdWVyeS5DbG9iQWNjZXNzXCIsXG4gICAgXCJPYmplY3RcIlxuXVxuXG5cbmxldCBPUFMgPSBbXG5cbiAgICAvLyBWYWxpZCBmb3IgYW55IGF0dHJpYnV0ZVxuICAgIC8vIEFsc28gdGhlIG9wZXJhdG9ycyBmb3IgbG9vcCBjb25zdHJhaW50cyAobm90IHlldCBpbXBsZW1lbnRlZCkuXG4gICAge1xuICAgIG9wOiBcIj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSx7XG4gICAgb3A6IFwiIT1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3IgbnVtZXJpYyBhbmQgZGF0ZSBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIj5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIj49XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3Igc3RyaW5nIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiQ09OVEFJTlNcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cblxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIENPTlRBSU5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIExJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJPTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBmb3IgTG9jYXRpb24gbm9kZXNcbiAgICB7XG4gICAgb3A6IFwiV0lUSElOXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9WRVJMQVBTXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIE9WRVJMQVBcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1VUU0lERVwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LFxuIFxuICAgIC8vIE5VTEwgY29uc3RyYWludHMuIFZhbGlkIGZvciBhbnkgbm9kZSBleGNlcHQgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVMgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCJJUyBOT1QgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSAoaS5lLiwgdGhlIHJvb3QsIG9yIGFueSBcbiAgICAvLyByZWZlcmVuY2Ugb3IgY29sbGVjdGlvbiBub2RlKS5cbiAgICB7XG4gICAgb3A6IFwiTE9PS1VQXCIsXG4gICAgY3R5cGU6IFwibG9va3VwXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIklOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJOT1QgSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSBleGNlcHQgdGhlIHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTQVwiLFxuICAgIGN0eXBlOiBcInN1YmNsYXNzXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9XTtcbi8vXG5sZXQgT1BJTkRFWCA9IE9QUy5yZWR1Y2UoZnVuY3Rpb24oeCxvKXtcbiAgICB4W28ub3BdID0gbztcbiAgICByZXR1cm4geDtcbn0sIHt9KTtcblxuZXhwb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvb3BzLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImxldCBzID0gYFxuM2Rfcm90YXRpb24gZTg0ZFxuYWNfdW5pdCBlYjNiXG5hY2Nlc3NfYWxhcm0gZTE5MFxuYWNjZXNzX2FsYXJtcyBlMTkxXG5hY2Nlc3NfdGltZSBlMTkyXG5hY2Nlc3NpYmlsaXR5IGU4NGVcbmFjY2Vzc2libGUgZTkxNFxuYWNjb3VudF9iYWxhbmNlIGU4NGZcbmFjY291bnRfYmFsYW5jZV93YWxsZXQgZTg1MFxuYWNjb3VudF9ib3ggZTg1MVxuYWNjb3VudF9jaXJjbGUgZTg1M1xuYWRiIGU2MGVcbmFkZCBlMTQ1XG5hZGRfYV9waG90byBlNDM5XG5hZGRfYWxhcm0gZTE5M1xuYWRkX2FsZXJ0IGUwMDNcbmFkZF9ib3ggZTE0NlxuYWRkX2NpcmNsZSBlMTQ3XG5hZGRfY2lyY2xlX291dGxpbmUgZTE0OFxuYWRkX2xvY2F0aW9uIGU1NjdcbmFkZF9zaG9wcGluZ19jYXJ0IGU4NTRcbmFkZF90b19waG90b3MgZTM5ZFxuYWRkX3RvX3F1ZXVlIGUwNWNcbmFkanVzdCBlMzllXG5haXJsaW5lX3NlYXRfZmxhdCBlNjMwXG5haXJsaW5lX3NlYXRfZmxhdF9hbmdsZWQgZTYzMVxuYWlybGluZV9zZWF0X2luZGl2aWR1YWxfc3VpdGUgZTYzMlxuYWlybGluZV9zZWF0X2xlZ3Jvb21fZXh0cmEgZTYzM1xuYWlybGluZV9zZWF0X2xlZ3Jvb21fbm9ybWFsIGU2MzRcbmFpcmxpbmVfc2VhdF9sZWdyb29tX3JlZHVjZWQgZTYzNVxuYWlybGluZV9zZWF0X3JlY2xpbmVfZXh0cmEgZTYzNlxuYWlybGluZV9zZWF0X3JlY2xpbmVfbm9ybWFsIGU2MzdcbmFpcnBsYW5lbW9kZV9hY3RpdmUgZTE5NVxuYWlycGxhbmVtb2RlX2luYWN0aXZlIGUxOTRcbmFpcnBsYXkgZTA1NVxuYWlycG9ydF9zaHV0dGxlIGViM2NcbmFsYXJtIGU4NTVcbmFsYXJtX2FkZCBlODU2XG5hbGFybV9vZmYgZTg1N1xuYWxhcm1fb24gZTg1OFxuYWxidW0gZTAxOVxuYWxsX2luY2x1c2l2ZSBlYjNkXG5hbGxfb3V0IGU5MGJcbmFuZHJvaWQgZTg1OVxuYW5ub3VuY2VtZW50IGU4NWFcbmFwcHMgZTVjM1xuYXJjaGl2ZSBlMTQ5XG5hcnJvd19iYWNrIGU1YzRcbmFycm93X2Rvd253YXJkIGU1ZGJcbmFycm93X2Ryb3BfZG93biBlNWM1XG5hcnJvd19kcm9wX2Rvd25fY2lyY2xlIGU1YzZcbmFycm93X2Ryb3BfdXAgZTVjN1xuYXJyb3dfZm9yd2FyZCBlNWM4XG5hcnJvd191cHdhcmQgZTVkOFxuYXJ0X3RyYWNrIGUwNjBcbmFzcGVjdF9yYXRpbyBlODViXG5hc3Nlc3NtZW50IGU4NWNcbmFzc2lnbm1lbnQgZTg1ZFxuYXNzaWdubWVudF9pbmQgZTg1ZVxuYXNzaWdubWVudF9sYXRlIGU4NWZcbmFzc2lnbm1lbnRfcmV0dXJuIGU4NjBcbmFzc2lnbm1lbnRfcmV0dXJuZWQgZTg2MVxuYXNzaWdubWVudF90dXJuZWRfaW4gZTg2MlxuYXNzaXN0YW50IGUzOWZcbmFzc2lzdGFudF9waG90byBlM2EwXG5hdHRhY2hfZmlsZSBlMjI2XG5hdHRhY2hfbW9uZXkgZTIyN1xuYXR0YWNobWVudCBlMmJjXG5hdWRpb3RyYWNrIGUzYTFcbmF1dG9yZW5ldyBlODYzXG5hdl90aW1lciBlMDFiXG5iYWNrc3BhY2UgZTE0YVxuYmFja3VwIGU4NjRcbmJhdHRlcnlfYWxlcnQgZTE5Y1xuYmF0dGVyeV9jaGFyZ2luZ19mdWxsIGUxYTNcbmJhdHRlcnlfZnVsbCBlMWE0XG5iYXR0ZXJ5X3N0ZCBlMWE1XG5iYXR0ZXJ5X3Vua25vd24gZTFhNlxuYmVhY2hfYWNjZXNzIGViM2VcbmJlZW5oZXJlIGU1MmRcbmJsb2NrIGUxNGJcbmJsdWV0b290aCBlMWE3XG5ibHVldG9vdGhfYXVkaW8gZTYwZlxuYmx1ZXRvb3RoX2Nvbm5lY3RlZCBlMWE4XG5ibHVldG9vdGhfZGlzYWJsZWQgZTFhOVxuYmx1ZXRvb3RoX3NlYXJjaGluZyBlMWFhXG5ibHVyX2NpcmN1bGFyIGUzYTJcbmJsdXJfbGluZWFyIGUzYTNcbmJsdXJfb2ZmIGUzYTRcbmJsdXJfb24gZTNhNVxuYm9vayBlODY1XG5ib29rbWFyayBlODY2XG5ib29rbWFya19ib3JkZXIgZTg2N1xuYm9yZGVyX2FsbCBlMjI4XG5ib3JkZXJfYm90dG9tIGUyMjlcbmJvcmRlcl9jbGVhciBlMjJhXG5ib3JkZXJfY29sb3IgZTIyYlxuYm9yZGVyX2hvcml6b250YWwgZTIyY1xuYm9yZGVyX2lubmVyIGUyMmRcbmJvcmRlcl9sZWZ0IGUyMmVcbmJvcmRlcl9vdXRlciBlMjJmXG5ib3JkZXJfcmlnaHQgZTIzMFxuYm9yZGVyX3N0eWxlIGUyMzFcbmJvcmRlcl90b3AgZTIzMlxuYm9yZGVyX3ZlcnRpY2FsIGUyMzNcbmJyYW5kaW5nX3dhdGVybWFyayBlMDZiXG5icmlnaHRuZXNzXzEgZTNhNlxuYnJpZ2h0bmVzc18yIGUzYTdcbmJyaWdodG5lc3NfMyBlM2E4XG5icmlnaHRuZXNzXzQgZTNhOVxuYnJpZ2h0bmVzc181IGUzYWFcbmJyaWdodG5lc3NfNiBlM2FiXG5icmlnaHRuZXNzXzcgZTNhY1xuYnJpZ2h0bmVzc19hdXRvIGUxYWJcbmJyaWdodG5lc3NfaGlnaCBlMWFjXG5icmlnaHRuZXNzX2xvdyBlMWFkXG5icmlnaHRuZXNzX21lZGl1bSBlMWFlXG5icm9rZW5faW1hZ2UgZTNhZFxuYnJ1c2ggZTNhZVxuYnViYmxlX2NoYXJ0IGU2ZGRcbmJ1Z19yZXBvcnQgZTg2OFxuYnVpbGQgZTg2OVxuYnVyc3RfbW9kZSBlNDNjXG5idXNpbmVzcyBlMGFmXG5idXNpbmVzc19jZW50ZXIgZWIzZlxuY2FjaGVkIGU4NmFcbmNha2UgZTdlOVxuY2FsbCBlMGIwXG5jYWxsX2VuZCBlMGIxXG5jYWxsX21hZGUgZTBiMlxuY2FsbF9tZXJnZSBlMGIzXG5jYWxsX21pc3NlZCBlMGI0XG5jYWxsX21pc3NlZF9vdXRnb2luZyBlMGU0XG5jYWxsX3JlY2VpdmVkIGUwYjVcbmNhbGxfc3BsaXQgZTBiNlxuY2FsbF90b19hY3Rpb24gZTA2Y1xuY2FtZXJhIGUzYWZcbmNhbWVyYV9hbHQgZTNiMFxuY2FtZXJhX2VuaGFuY2UgZThmY1xuY2FtZXJhX2Zyb250IGUzYjFcbmNhbWVyYV9yZWFyIGUzYjJcbmNhbWVyYV9yb2xsIGUzYjNcbmNhbmNlbCBlNWM5XG5jYXJkX2dpZnRjYXJkIGU4ZjZcbmNhcmRfbWVtYmVyc2hpcCBlOGY3XG5jYXJkX3RyYXZlbCBlOGY4XG5jYXNpbm8gZWI0MFxuY2FzdCBlMzA3XG5jYXN0X2Nvbm5lY3RlZCBlMzA4XG5jZW50ZXJfZm9jdXNfc3Ryb25nIGUzYjRcbmNlbnRlcl9mb2N1c193ZWFrIGUzYjVcbmNoYW5nZV9oaXN0b3J5IGU4NmJcbmNoYXQgZTBiN1xuY2hhdF9idWJibGUgZTBjYVxuY2hhdF9idWJibGVfb3V0bGluZSBlMGNiXG5jaGVjayBlNWNhXG5jaGVja19ib3ggZTgzNFxuY2hlY2tfYm94X291dGxpbmVfYmxhbmsgZTgzNVxuY2hlY2tfY2lyY2xlIGU4NmNcbmNoZXZyb25fbGVmdCBlNWNiXG5jaGV2cm9uX3JpZ2h0IGU1Y2NcbmNoaWxkX2NhcmUgZWI0MVxuY2hpbGRfZnJpZW5kbHkgZWI0MlxuY2hyb21lX3JlYWRlcl9tb2RlIGU4NmRcbmNsYXNzIGU4NmVcbmNsZWFyIGUxNGNcbmNsZWFyX2FsbCBlMGI4XG5jbG9zZSBlNWNkXG5jbG9zZWRfY2FwdGlvbiBlMDFjXG5jbG91ZCBlMmJkXG5jbG91ZF9jaXJjbGUgZTJiZVxuY2xvdWRfZG9uZSBlMmJmXG5jbG91ZF9kb3dubG9hZCBlMmMwXG5jbG91ZF9vZmYgZTJjMVxuY2xvdWRfcXVldWUgZTJjMlxuY2xvdWRfdXBsb2FkIGUyYzNcbmNvZGUgZTg2ZlxuY29sbGVjdGlvbnMgZTNiNlxuY29sbGVjdGlvbnNfYm9va21hcmsgZTQzMVxuY29sb3JfbGVucyBlM2I3XG5jb2xvcml6ZSBlM2I4XG5jb21tZW50IGUwYjlcbmNvbXBhcmUgZTNiOVxuY29tcGFyZV9hcnJvd3MgZTkxNVxuY29tcHV0ZXIgZTMwYVxuY29uZmlybWF0aW9uX251bWJlciBlNjM4XG5jb250YWN0X21haWwgZTBkMFxuY29udGFjdF9waG9uZSBlMGNmXG5jb250YWN0cyBlMGJhXG5jb250ZW50X2NvcHkgZTE0ZFxuY29udGVudF9jdXQgZTE0ZVxuY29udGVudF9wYXN0ZSBlMTRmXG5jb250cm9sX3BvaW50IGUzYmFcbmNvbnRyb2xfcG9pbnRfZHVwbGljYXRlIGUzYmJcbmNvcHlyaWdodCBlOTBjXG5jcmVhdGUgZTE1MFxuY3JlYXRlX25ld19mb2xkZXIgZTJjY1xuY3JlZGl0X2NhcmQgZTg3MFxuY3JvcCBlM2JlXG5jcm9wXzE2XzkgZTNiY1xuY3JvcF8zXzIgZTNiZFxuY3JvcF81XzQgZTNiZlxuY3JvcF83XzUgZTNjMFxuY3JvcF9kaW4gZTNjMVxuY3JvcF9mcmVlIGUzYzJcbmNyb3BfbGFuZHNjYXBlIGUzYzNcbmNyb3Bfb3JpZ2luYWwgZTNjNFxuY3JvcF9wb3J0cmFpdCBlM2M1XG5jcm9wX3JvdGF0ZSBlNDM3XG5jcm9wX3NxdWFyZSBlM2M2XG5kYXNoYm9hcmQgZTg3MVxuZGF0YV91c2FnZSBlMWFmXG5kYXRlX3JhbmdlIGU5MTZcbmRlaGF6ZSBlM2M3XG5kZWxldGUgZTg3MlxuZGVsZXRlX2ZvcmV2ZXIgZTkyYlxuZGVsZXRlX3N3ZWVwIGUxNmNcbmRlc2NyaXB0aW9uIGU4NzNcbmRlc2t0b3BfbWFjIGUzMGJcbmRlc2t0b3Bfd2luZG93cyBlMzBjXG5kZXRhaWxzIGUzYzhcbmRldmVsb3Blcl9ib2FyZCBlMzBkXG5kZXZlbG9wZXJfbW9kZSBlMWIwXG5kZXZpY2VfaHViIGUzMzVcbmRldmljZXMgZTFiMVxuZGV2aWNlc19vdGhlciBlMzM3XG5kaWFsZXJfc2lwIGUwYmJcbmRpYWxwYWQgZTBiY1xuZGlyZWN0aW9ucyBlNTJlXG5kaXJlY3Rpb25zX2Jpa2UgZTUyZlxuZGlyZWN0aW9uc19ib2F0IGU1MzJcbmRpcmVjdGlvbnNfYnVzIGU1MzBcbmRpcmVjdGlvbnNfY2FyIGU1MzFcbmRpcmVjdGlvbnNfcmFpbHdheSBlNTM0XG5kaXJlY3Rpb25zX3J1biBlNTY2XG5kaXJlY3Rpb25zX3N1YndheSBlNTMzXG5kaXJlY3Rpb25zX3RyYW5zaXQgZTUzNVxuZGlyZWN0aW9uc193YWxrIGU1MzZcbmRpc2NfZnVsbCBlNjEwXG5kbnMgZTg3NVxuZG9fbm90X2Rpc3R1cmIgZTYxMlxuZG9fbm90X2Rpc3R1cmJfYWx0IGU2MTFcbmRvX25vdF9kaXN0dXJiX29mZiBlNjQzXG5kb19ub3RfZGlzdHVyYl9vbiBlNjQ0XG5kb2NrIGUzMGVcbmRvbWFpbiBlN2VlXG5kb25lIGU4NzZcbmRvbmVfYWxsIGU4NzdcbmRvbnV0X2xhcmdlIGU5MTdcbmRvbnV0X3NtYWxsIGU5MThcbmRyYWZ0cyBlMTUxXG5kcmFnX2hhbmRsZSBlMjVkXG5kcml2ZV9ldGEgZTYxM1xuZHZyIGUxYjJcbmVkaXQgZTNjOVxuZWRpdF9sb2NhdGlvbiBlNTY4XG5lamVjdCBlOGZiXG5lbWFpbCBlMGJlXG5lbmhhbmNlZF9lbmNyeXB0aW9uIGU2M2ZcbmVxdWFsaXplciBlMDFkXG5lcnJvciBlMDAwXG5lcnJvcl9vdXRsaW5lIGUwMDFcbmV1cm9fc3ltYm9sIGU5MjZcbmV2X3N0YXRpb24gZTU2ZFxuZXZlbnQgZTg3OFxuZXZlbnRfYXZhaWxhYmxlIGU2MTRcbmV2ZW50X2J1c3kgZTYxNVxuZXZlbnRfbm90ZSBlNjE2XG5ldmVudF9zZWF0IGU5MDNcbmV4aXRfdG9fYXBwIGU4NzlcbmV4cGFuZF9sZXNzIGU1Y2VcbmV4cGFuZF9tb3JlIGU1Y2ZcbmV4cGxpY2l0IGUwMWVcbmV4cGxvcmUgZTg3YVxuZXhwb3N1cmUgZTNjYVxuZXhwb3N1cmVfbmVnXzEgZTNjYlxuZXhwb3N1cmVfbmVnXzIgZTNjY1xuZXhwb3N1cmVfcGx1c18xIGUzY2RcbmV4cG9zdXJlX3BsdXNfMiBlM2NlXG5leHBvc3VyZV96ZXJvIGUzY2ZcbmV4dGVuc2lvbiBlODdiXG5mYWNlIGU4N2NcbmZhc3RfZm9yd2FyZCBlMDFmXG5mYXN0X3Jld2luZCBlMDIwXG5mYXZvcml0ZSBlODdkXG5mYXZvcml0ZV9ib3JkZXIgZTg3ZVxuZmVhdHVyZWRfcGxheV9saXN0IGUwNmRcbmZlYXR1cmVkX3ZpZGVvIGUwNmVcbmZlZWRiYWNrIGU4N2ZcbmZpYmVyX2R2ciBlMDVkXG5maWJlcl9tYW51YWxfcmVjb3JkIGUwNjFcbmZpYmVyX25ldyBlMDVlXG5maWJlcl9waW4gZTA2YVxuZmliZXJfc21hcnRfcmVjb3JkIGUwNjJcbmZpbGVfZG93bmxvYWQgZTJjNFxuZmlsZV91cGxvYWQgZTJjNlxuZmlsdGVyIGUzZDNcbmZpbHRlcl8xIGUzZDBcbmZpbHRlcl8yIGUzZDFcbmZpbHRlcl8zIGUzZDJcbmZpbHRlcl80IGUzZDRcbmZpbHRlcl81IGUzZDVcbmZpbHRlcl82IGUzZDZcbmZpbHRlcl83IGUzZDdcbmZpbHRlcl84IGUzZDhcbmZpbHRlcl85IGUzZDlcbmZpbHRlcl85X3BsdXMgZTNkYVxuZmlsdGVyX2JfYW5kX3cgZTNkYlxuZmlsdGVyX2NlbnRlcl9mb2N1cyBlM2RjXG5maWx0ZXJfZHJhbWEgZTNkZFxuZmlsdGVyX2ZyYW1lcyBlM2RlXG5maWx0ZXJfaGRyIGUzZGZcbmZpbHRlcl9saXN0IGUxNTJcbmZpbHRlcl9ub25lIGUzZTBcbmZpbHRlcl90aWx0X3NoaWZ0IGUzZTJcbmZpbHRlcl92aW50YWdlIGUzZTNcbmZpbmRfaW5fcGFnZSBlODgwXG5maW5kX3JlcGxhY2UgZTg4MVxuZmluZ2VycHJpbnQgZTkwZFxuZmlyc3RfcGFnZSBlNWRjXG5maXRuZXNzX2NlbnRlciBlYjQzXG5mbGFnIGUxNTNcbmZsYXJlIGUzZTRcbmZsYXNoX2F1dG8gZTNlNVxuZmxhc2hfb2ZmIGUzZTZcbmZsYXNoX29uIGUzZTdcbmZsaWdodCBlNTM5XG5mbGlnaHRfbGFuZCBlOTA0XG5mbGlnaHRfdGFrZW9mZiBlOTA1XG5mbGlwIGUzZThcbmZsaXBfdG9fYmFjayBlODgyXG5mbGlwX3RvX2Zyb250IGU4ODNcbmZvbGRlciBlMmM3XG5mb2xkZXJfb3BlbiBlMmM4XG5mb2xkZXJfc2hhcmVkIGUyYzlcbmZvbGRlcl9zcGVjaWFsIGU2MTdcbmZvbnRfZG93bmxvYWQgZTE2N1xuZm9ybWF0X2FsaWduX2NlbnRlciBlMjM0XG5mb3JtYXRfYWxpZ25fanVzdGlmeSBlMjM1XG5mb3JtYXRfYWxpZ25fbGVmdCBlMjM2XG5mb3JtYXRfYWxpZ25fcmlnaHQgZTIzN1xuZm9ybWF0X2JvbGQgZTIzOFxuZm9ybWF0X2NsZWFyIGUyMzlcbmZvcm1hdF9jb2xvcl9maWxsIGUyM2FcbmZvcm1hdF9jb2xvcl9yZXNldCBlMjNiXG5mb3JtYXRfY29sb3JfdGV4dCBlMjNjXG5mb3JtYXRfaW5kZW50X2RlY3JlYXNlIGUyM2RcbmZvcm1hdF9pbmRlbnRfaW5jcmVhc2UgZTIzZVxuZm9ybWF0X2l0YWxpYyBlMjNmXG5mb3JtYXRfbGluZV9zcGFjaW5nIGUyNDBcbmZvcm1hdF9saXN0X2J1bGxldGVkIGUyNDFcbmZvcm1hdF9saXN0X251bWJlcmVkIGUyNDJcbmZvcm1hdF9wYWludCBlMjQzXG5mb3JtYXRfcXVvdGUgZTI0NFxuZm9ybWF0X3NoYXBlcyBlMjVlXG5mb3JtYXRfc2l6ZSBlMjQ1XG5mb3JtYXRfc3RyaWtldGhyb3VnaCBlMjQ2XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9sX3RvX3IgZTI0N1xuZm9ybWF0X3RleHRkaXJlY3Rpb25fcl90b19sIGUyNDhcbmZvcm1hdF91bmRlcmxpbmVkIGUyNDlcbmZvcnVtIGUwYmZcbmZvcndhcmQgZTE1NFxuZm9yd2FyZF8xMCBlMDU2XG5mb3J3YXJkXzMwIGUwNTdcbmZvcndhcmRfNSBlMDU4XG5mcmVlX2JyZWFrZmFzdCBlYjQ0XG5mdWxsc2NyZWVuIGU1ZDBcbmZ1bGxzY3JlZW5fZXhpdCBlNWQxXG5mdW5jdGlvbnMgZTI0YVxuZ190cmFuc2xhdGUgZTkyN1xuZ2FtZXBhZCBlMzBmXG5nYW1lcyBlMDIxXG5nYXZlbCBlOTBlXG5nZXN0dXJlIGUxNTVcbmdldF9hcHAgZTg4NFxuZ2lmIGU5MDhcbmdvbGZfY291cnNlIGViNDVcbmdwc19maXhlZCBlMWIzXG5ncHNfbm90X2ZpeGVkIGUxYjRcbmdwc19vZmYgZTFiNVxuZ3JhZGUgZTg4NVxuZ3JhZGllbnQgZTNlOVxuZ3JhaW4gZTNlYVxuZ3JhcGhpY19lcSBlMWI4XG5ncmlkX29mZiBlM2ViXG5ncmlkX29uIGUzZWNcbmdyb3VwIGU3ZWZcbmdyb3VwX2FkZCBlN2YwXG5ncm91cF93b3JrIGU4ODZcbmhkIGUwNTJcbmhkcl9vZmYgZTNlZFxuaGRyX29uIGUzZWVcbmhkcl9zdHJvbmcgZTNmMVxuaGRyX3dlYWsgZTNmMlxuaGVhZHNldCBlMzEwXG5oZWFkc2V0X21pYyBlMzExXG5oZWFsaW5nIGUzZjNcbmhlYXJpbmcgZTAyM1xuaGVscCBlODg3XG5oZWxwX291dGxpbmUgZThmZFxuaGlnaF9xdWFsaXR5IGUwMjRcbmhpZ2hsaWdodCBlMjVmXG5oaWdobGlnaHRfb2ZmIGU4ODhcbmhpc3RvcnkgZTg4OVxuaG9tZSBlODhhXG5ob3RfdHViIGViNDZcbmhvdGVsIGU1M2FcbmhvdXJnbGFzc19lbXB0eSBlODhiXG5ob3VyZ2xhc3NfZnVsbCBlODhjXG5odHRwIGU5MDJcbmh0dHBzIGU4OGRcbmltYWdlIGUzZjRcbmltYWdlX2FzcGVjdF9yYXRpbyBlM2Y1XG5pbXBvcnRfY29udGFjdHMgZTBlMFxuaW1wb3J0X2V4cG9ydCBlMGMzXG5pbXBvcnRhbnRfZGV2aWNlcyBlOTEyXG5pbmJveCBlMTU2XG5pbmRldGVybWluYXRlX2NoZWNrX2JveCBlOTA5XG5pbmZvIGU4OGVcbmluZm9fb3V0bGluZSBlODhmXG5pbnB1dCBlODkwXG5pbnNlcnRfY2hhcnQgZTI0YlxuaW5zZXJ0X2NvbW1lbnQgZTI0Y1xuaW5zZXJ0X2RyaXZlX2ZpbGUgZTI0ZFxuaW5zZXJ0X2Vtb3RpY29uIGUyNGVcbmluc2VydF9pbnZpdGF0aW9uIGUyNGZcbmluc2VydF9saW5rIGUyNTBcbmluc2VydF9waG90byBlMjUxXG5pbnZlcnRfY29sb3JzIGU4OTFcbmludmVydF9jb2xvcnNfb2ZmIGUwYzRcbmlzbyBlM2Y2XG5rZXlib2FyZCBlMzEyXG5rZXlib2FyZF9hcnJvd19kb3duIGUzMTNcbmtleWJvYXJkX2Fycm93X2xlZnQgZTMxNFxua2V5Ym9hcmRfYXJyb3dfcmlnaHQgZTMxNVxua2V5Ym9hcmRfYXJyb3dfdXAgZTMxNlxua2V5Ym9hcmRfYmFja3NwYWNlIGUzMTdcbmtleWJvYXJkX2NhcHNsb2NrIGUzMThcbmtleWJvYXJkX2hpZGUgZTMxYVxua2V5Ym9hcmRfcmV0dXJuIGUzMWJcbmtleWJvYXJkX3RhYiBlMzFjXG5rZXlib2FyZF92b2ljZSBlMzFkXG5raXRjaGVuIGViNDdcbmxhYmVsIGU4OTJcbmxhYmVsX291dGxpbmUgZTg5M1xubGFuZHNjYXBlIGUzZjdcbmxhbmd1YWdlIGU4OTRcbmxhcHRvcCBlMzFlXG5sYXB0b3BfY2hyb21lYm9vayBlMzFmXG5sYXB0b3BfbWFjIGUzMjBcbmxhcHRvcF93aW5kb3dzIGUzMjFcbmxhc3RfcGFnZSBlNWRkXG5sYXVuY2ggZTg5NVxubGF5ZXJzIGU1M2JcbmxheWVyc19jbGVhciBlNTNjXG5sZWFrX2FkZCBlM2Y4XG5sZWFrX3JlbW92ZSBlM2Y5XG5sZW5zIGUzZmFcbmxpYnJhcnlfYWRkIGUwMmVcbmxpYnJhcnlfYm9va3MgZTAyZlxubGlicmFyeV9tdXNpYyBlMDMwXG5saWdodGJ1bGJfb3V0bGluZSBlOTBmXG5saW5lX3N0eWxlIGU5MTlcbmxpbmVfd2VpZ2h0IGU5MWFcbmxpbmVhcl9zY2FsZSBlMjYwXG5saW5rIGUxNTdcbmxpbmtlZF9jYW1lcmEgZTQzOFxubGlzdCBlODk2XG5saXZlX2hlbHAgZTBjNlxubGl2ZV90diBlNjM5XG5sb2NhbF9hY3Rpdml0eSBlNTNmXG5sb2NhbF9haXJwb3J0IGU1M2RcbmxvY2FsX2F0bSBlNTNlXG5sb2NhbF9iYXIgZTU0MFxubG9jYWxfY2FmZSBlNTQxXG5sb2NhbF9jYXJfd2FzaCBlNTQyXG5sb2NhbF9jb252ZW5pZW5jZV9zdG9yZSBlNTQzXG5sb2NhbF9kaW5pbmcgZTU1NlxubG9jYWxfZHJpbmsgZTU0NFxubG9jYWxfZmxvcmlzdCBlNTQ1XG5sb2NhbF9nYXNfc3RhdGlvbiBlNTQ2XG5sb2NhbF9ncm9jZXJ5X3N0b3JlIGU1NDdcbmxvY2FsX2hvc3BpdGFsIGU1NDhcbmxvY2FsX2hvdGVsIGU1NDlcbmxvY2FsX2xhdW5kcnlfc2VydmljZSBlNTRhXG5sb2NhbF9saWJyYXJ5IGU1NGJcbmxvY2FsX21hbGwgZTU0Y1xubG9jYWxfbW92aWVzIGU1NGRcbmxvY2FsX29mZmVyIGU1NGVcbmxvY2FsX3BhcmtpbmcgZTU0ZlxubG9jYWxfcGhhcm1hY3kgZTU1MFxubG9jYWxfcGhvbmUgZTU1MVxubG9jYWxfcGl6emEgZTU1MlxubG9jYWxfcGxheSBlNTUzXG5sb2NhbF9wb3N0X29mZmljZSBlNTU0XG5sb2NhbF9wcmludHNob3AgZTU1NVxubG9jYWxfc2VlIGU1NTdcbmxvY2FsX3NoaXBwaW5nIGU1NThcbmxvY2FsX3RheGkgZTU1OVxubG9jYXRpb25fY2l0eSBlN2YxXG5sb2NhdGlvbl9kaXNhYmxlZCBlMWI2XG5sb2NhdGlvbl9vZmYgZTBjN1xubG9jYXRpb25fb24gZTBjOFxubG9jYXRpb25fc2VhcmNoaW5nIGUxYjdcbmxvY2sgZTg5N1xubG9ja19vcGVuIGU4OThcbmxvY2tfb3V0bGluZSBlODk5XG5sb29rcyBlM2ZjXG5sb29rc18zIGUzZmJcbmxvb2tzXzQgZTNmZFxubG9va3NfNSBlM2ZlXG5sb29rc182IGUzZmZcbmxvb2tzX29uZSBlNDAwXG5sb29rc190d28gZTQwMVxubG9vcCBlMDI4XG5sb3VwZSBlNDAyXG5sb3dfcHJpb3JpdHkgZTE2ZFxubG95YWx0eSBlODlhXG5tYWlsIGUxNThcbm1haWxfb3V0bGluZSBlMGUxXG5tYXAgZTU1YlxubWFya3VucmVhZCBlMTU5XG5tYXJrdW5yZWFkX21haWxib3ggZTg5YlxubWVtb3J5IGUzMjJcbm1lbnUgZTVkMlxubWVyZ2VfdHlwZSBlMjUyXG5tZXNzYWdlIGUwYzlcbm1pYyBlMDI5XG5taWNfbm9uZSBlMDJhXG5taWNfb2ZmIGUwMmJcbm1tcyBlNjE4XG5tb2RlX2NvbW1lbnQgZTI1M1xubW9kZV9lZGl0IGUyNTRcbm1vbmV0aXphdGlvbl9vbiBlMjYzXG5tb25leV9vZmYgZTI1Y1xubW9ub2Nocm9tZV9waG90b3MgZTQwM1xubW9vZCBlN2YyXG5tb29kX2JhZCBlN2YzXG5tb3JlIGU2MTlcbm1vcmVfaG9yaXogZTVkM1xubW9yZV92ZXJ0IGU1ZDRcbm1vdG9yY3ljbGUgZTkxYlxubW91c2UgZTMyM1xubW92ZV90b19pbmJveCBlMTY4XG5tb3ZpZSBlMDJjXG5tb3ZpZV9jcmVhdGlvbiBlNDA0XG5tb3ZpZV9maWx0ZXIgZTQzYVxubXVsdGlsaW5lX2NoYXJ0IGU2ZGZcbm11c2ljX25vdGUgZTQwNVxubXVzaWNfdmlkZW8gZTA2M1xubXlfbG9jYXRpb24gZTU1Y1xubmF0dXJlIGU0MDZcbm5hdHVyZV9wZW9wbGUgZTQwN1xubmF2aWdhdGVfYmVmb3JlIGU0MDhcbm5hdmlnYXRlX25leHQgZTQwOVxubmF2aWdhdGlvbiBlNTVkXG5uZWFyX21lIGU1Njlcbm5ldHdvcmtfY2VsbCBlMWI5XG5uZXR3b3JrX2NoZWNrIGU2NDBcbm5ldHdvcmtfbG9ja2VkIGU2MWFcbm5ldHdvcmtfd2lmaSBlMWJhXG5uZXdfcmVsZWFzZXMgZTAzMVxubmV4dF93ZWVrIGUxNmFcbm5mYyBlMWJiXG5ub19lbmNyeXB0aW9uIGU2NDFcbm5vX3NpbSBlMGNjXG5ub3RfaW50ZXJlc3RlZCBlMDMzXG5ub3RlIGUwNmZcbm5vdGVfYWRkIGU4OWNcbm5vdGlmaWNhdGlvbnMgZTdmNFxubm90aWZpY2F0aW9uc19hY3RpdmUgZTdmN1xubm90aWZpY2F0aW9uc19ub25lIGU3ZjVcbm5vdGlmaWNhdGlvbnNfb2ZmIGU3ZjZcbm5vdGlmaWNhdGlvbnNfcGF1c2VkIGU3Zjhcbm9mZmxpbmVfcGluIGU5MGFcbm9uZGVtYW5kX3ZpZGVvIGU2M2Fcbm9wYWNpdHkgZTkxY1xub3Blbl9pbl9icm93c2VyIGU4OWRcbm9wZW5faW5fbmV3IGU4OWVcbm9wZW5fd2l0aCBlODlmXG5wYWdlcyBlN2Y5XG5wYWdldmlldyBlOGEwXG5wYWxldHRlIGU0MGFcbnBhbl90b29sIGU5MjVcbnBhbm9yYW1hIGU0MGJcbnBhbm9yYW1hX2Zpc2hfZXllIGU0MGNcbnBhbm9yYW1hX2hvcml6b250YWwgZTQwZFxucGFub3JhbWFfdmVydGljYWwgZTQwZVxucGFub3JhbWFfd2lkZV9hbmdsZSBlNDBmXG5wYXJ0eV9tb2RlIGU3ZmFcbnBhdXNlIGUwMzRcbnBhdXNlX2NpcmNsZV9maWxsZWQgZTAzNVxucGF1c2VfY2lyY2xlX291dGxpbmUgZTAzNlxucGF5bWVudCBlOGExXG5wZW9wbGUgZTdmYlxucGVvcGxlX291dGxpbmUgZTdmY1xucGVybV9jYW1lcmFfbWljIGU4YTJcbnBlcm1fY29udGFjdF9jYWxlbmRhciBlOGEzXG5wZXJtX2RhdGFfc2V0dGluZyBlOGE0XG5wZXJtX2RldmljZV9pbmZvcm1hdGlvbiBlOGE1XG5wZXJtX2lkZW50aXR5IGU4YTZcbnBlcm1fbWVkaWEgZThhN1xucGVybV9waG9uZV9tc2cgZThhOFxucGVybV9zY2FuX3dpZmkgZThhOVxucGVyc29uIGU3ZmRcbnBlcnNvbl9hZGQgZTdmZVxucGVyc29uX291dGxpbmUgZTdmZlxucGVyc29uX3BpbiBlNTVhXG5wZXJzb25fcGluX2NpcmNsZSBlNTZhXG5wZXJzb25hbF92aWRlbyBlNjNiXG5wZXRzIGU5MWRcbnBob25lIGUwY2RcbnBob25lX2FuZHJvaWQgZTMyNFxucGhvbmVfYmx1ZXRvb3RoX3NwZWFrZXIgZTYxYlxucGhvbmVfZm9yd2FyZGVkIGU2MWNcbnBob25lX2luX3RhbGsgZTYxZFxucGhvbmVfaXBob25lIGUzMjVcbnBob25lX2xvY2tlZCBlNjFlXG5waG9uZV9taXNzZWQgZTYxZlxucGhvbmVfcGF1c2VkIGU2MjBcbnBob25lbGluayBlMzI2XG5waG9uZWxpbmtfZXJhc2UgZTBkYlxucGhvbmVsaW5rX2xvY2sgZTBkY1xucGhvbmVsaW5rX29mZiBlMzI3XG5waG9uZWxpbmtfcmluZyBlMGRkXG5waG9uZWxpbmtfc2V0dXAgZTBkZVxucGhvdG8gZTQxMFxucGhvdG9fYWxidW0gZTQxMVxucGhvdG9fY2FtZXJhIGU0MTJcbnBob3RvX2ZpbHRlciBlNDNiXG5waG90b19saWJyYXJ5IGU0MTNcbnBob3RvX3NpemVfc2VsZWN0X2FjdHVhbCBlNDMyXG5waG90b19zaXplX3NlbGVjdF9sYXJnZSBlNDMzXG5waG90b19zaXplX3NlbGVjdF9zbWFsbCBlNDM0XG5waWN0dXJlX2FzX3BkZiBlNDE1XG5waWN0dXJlX2luX3BpY3R1cmUgZThhYVxucGljdHVyZV9pbl9waWN0dXJlX2FsdCBlOTExXG5waWVfY2hhcnQgZTZjNFxucGllX2NoYXJ0X291dGxpbmVkIGU2YzVcbnBpbl9kcm9wIGU1NWVcbnBsYWNlIGU1NWZcbnBsYXlfYXJyb3cgZTAzN1xucGxheV9jaXJjbGVfZmlsbGVkIGUwMzhcbnBsYXlfY2lyY2xlX291dGxpbmUgZTAzOVxucGxheV9mb3Jfd29yayBlOTA2XG5wbGF5bGlzdF9hZGQgZTAzYlxucGxheWxpc3RfYWRkX2NoZWNrIGUwNjVcbnBsYXlsaXN0X3BsYXkgZTA1ZlxucGx1c19vbmUgZTgwMFxucG9sbCBlODAxXG5wb2x5bWVyIGU4YWJcbnBvb2wgZWI0OFxucG9ydGFibGVfd2lmaV9vZmYgZTBjZVxucG9ydHJhaXQgZTQxNlxucG93ZXIgZTYzY1xucG93ZXJfaW5wdXQgZTMzNlxucG93ZXJfc2V0dGluZ3NfbmV3IGU4YWNcbnByZWduYW50X3dvbWFuIGU5MWVcbnByZXNlbnRfdG9fYWxsIGUwZGZcbnByaW50IGU4YWRcbnByaW9yaXR5X2hpZ2ggZTY0NVxucHVibGljIGU4MGJcbnB1Ymxpc2ggZTI1NVxucXVlcnlfYnVpbGRlciBlOGFlXG5xdWVzdGlvbl9hbnN3ZXIgZThhZlxucXVldWUgZTAzY1xucXVldWVfbXVzaWMgZTAzZFxucXVldWVfcGxheV9uZXh0IGUwNjZcbnJhZGlvIGUwM2VcbnJhZGlvX2J1dHRvbl9jaGVja2VkIGU4MzdcbnJhZGlvX2J1dHRvbl91bmNoZWNrZWQgZTgzNlxucmF0ZV9yZXZpZXcgZTU2MFxucmVjZWlwdCBlOGIwXG5yZWNlbnRfYWN0b3JzIGUwM2ZcbnJlY29yZF92b2ljZV9vdmVyIGU5MWZcbnJlZGVlbSBlOGIxXG5yZWRvIGUxNWFcbnJlZnJlc2ggZTVkNVxucmVtb3ZlIGUxNWJcbnJlbW92ZV9jaXJjbGUgZTE1Y1xucmVtb3ZlX2NpcmNsZV9vdXRsaW5lIGUxNWRcbnJlbW92ZV9mcm9tX3F1ZXVlIGUwNjdcbnJlbW92ZV9yZWRfZXllIGU0MTdcbnJlbW92ZV9zaG9wcGluZ19jYXJ0IGU5MjhcbnJlb3JkZXIgZThmZVxucmVwZWF0IGUwNDBcbnJlcGVhdF9vbmUgZTA0MVxucmVwbGF5IGUwNDJcbnJlcGxheV8xMCBlMDU5XG5yZXBsYXlfMzAgZTA1YVxucmVwbGF5XzUgZTA1YlxucmVwbHkgZTE1ZVxucmVwbHlfYWxsIGUxNWZcbnJlcG9ydCBlMTYwXG5yZXBvcnRfcHJvYmxlbSBlOGIyXG5yZXN0YXVyYW50IGU1NmNcbnJlc3RhdXJhbnRfbWVudSBlNTYxXG5yZXN0b3JlIGU4YjNcbnJlc3RvcmVfcGFnZSBlOTI5XG5yaW5nX3ZvbHVtZSBlMGQxXG5yb29tIGU4YjRcbnJvb21fc2VydmljZSBlYjQ5XG5yb3RhdGVfOTBfZGVncmVlc19jY3cgZTQxOFxucm90YXRlX2xlZnQgZTQxOVxucm90YXRlX3JpZ2h0IGU0MWFcbnJvdW5kZWRfY29ybmVyIGU5MjBcbnJvdXRlciBlMzI4XG5yb3dpbmcgZTkyMVxucnNzX2ZlZWQgZTBlNVxucnZfaG9va3VwIGU2NDJcbnNhdGVsbGl0ZSBlNTYyXG5zYXZlIGUxNjFcbnNjYW5uZXIgZTMyOVxuc2NoZWR1bGUgZThiNVxuc2Nob29sIGU4MGNcbnNjcmVlbl9sb2NrX2xhbmRzY2FwZSBlMWJlXG5zY3JlZW5fbG9ja19wb3J0cmFpdCBlMWJmXG5zY3JlZW5fbG9ja19yb3RhdGlvbiBlMWMwXG5zY3JlZW5fcm90YXRpb24gZTFjMVxuc2NyZWVuX3NoYXJlIGUwZTJcbnNkX2NhcmQgZTYyM1xuc2Rfc3RvcmFnZSBlMWMyXG5zZWFyY2ggZThiNlxuc2VjdXJpdHkgZTMyYVxuc2VsZWN0X2FsbCBlMTYyXG5zZW5kIGUxNjNcbnNlbnRpbWVudF9kaXNzYXRpc2ZpZWQgZTgxMVxuc2VudGltZW50X25ldXRyYWwgZTgxMlxuc2VudGltZW50X3NhdGlzZmllZCBlODEzXG5zZW50aW1lbnRfdmVyeV9kaXNzYXRpc2ZpZWQgZTgxNFxuc2VudGltZW50X3Zlcnlfc2F0aXNmaWVkIGU4MTVcbnNldHRpbmdzIGU4YjhcbnNldHRpbmdzX2FwcGxpY2F0aW9ucyBlOGI5XG5zZXR0aW5nc19iYWNrdXBfcmVzdG9yZSBlOGJhXG5zZXR0aW5nc19ibHVldG9vdGggZThiYlxuc2V0dGluZ3NfYnJpZ2h0bmVzcyBlOGJkXG5zZXR0aW5nc19jZWxsIGU4YmNcbnNldHRpbmdzX2V0aGVybmV0IGU4YmVcbnNldHRpbmdzX2lucHV0X2FudGVubmEgZThiZlxuc2V0dGluZ3NfaW5wdXRfY29tcG9uZW50IGU4YzBcbnNldHRpbmdzX2lucHV0X2NvbXBvc2l0ZSBlOGMxXG5zZXR0aW5nc19pbnB1dF9oZG1pIGU4YzJcbnNldHRpbmdzX2lucHV0X3N2aWRlbyBlOGMzXG5zZXR0aW5nc19vdmVyc2NhbiBlOGM0XG5zZXR0aW5nc19waG9uZSBlOGM1XG5zZXR0aW5nc19wb3dlciBlOGM2XG5zZXR0aW5nc19yZW1vdGUgZThjN1xuc2V0dGluZ3Nfc3lzdGVtX2RheWRyZWFtIGUxYzNcbnNldHRpbmdzX3ZvaWNlIGU4YzhcbnNoYXJlIGU4MGRcbnNob3AgZThjOVxuc2hvcF90d28gZThjYVxuc2hvcHBpbmdfYmFza2V0IGU4Y2JcbnNob3BwaW5nX2NhcnQgZThjY1xuc2hvcnRfdGV4dCBlMjYxXG5zaG93X2NoYXJ0IGU2ZTFcbnNodWZmbGUgZTA0M1xuc2lnbmFsX2NlbGx1bGFyXzRfYmFyIGUxYzhcbnNpZ25hbF9jZWxsdWxhcl9jb25uZWN0ZWRfbm9faW50ZXJuZXRfNF9iYXIgZTFjZFxuc2lnbmFsX2NlbGx1bGFyX25vX3NpbSBlMWNlXG5zaWduYWxfY2VsbHVsYXJfbnVsbCBlMWNmXG5zaWduYWxfY2VsbHVsYXJfb2ZmIGUxZDBcbnNpZ25hbF93aWZpXzRfYmFyIGUxZDhcbnNpZ25hbF93aWZpXzRfYmFyX2xvY2sgZTFkOVxuc2lnbmFsX3dpZmlfb2ZmIGUxZGFcbnNpbV9jYXJkIGUzMmJcbnNpbV9jYXJkX2FsZXJ0IGU2MjRcbnNraXBfbmV4dCBlMDQ0XG5za2lwX3ByZXZpb3VzIGUwNDVcbnNsaWRlc2hvdyBlNDFiXG5zbG93X21vdGlvbl92aWRlbyBlMDY4XG5zbWFydHBob25lIGUzMmNcbnNtb2tlX2ZyZWUgZWI0YVxuc21va2luZ19yb29tcyBlYjRiXG5zbXMgZTYyNVxuc21zX2ZhaWxlZCBlNjI2XG5zbm9vemUgZTA0Nlxuc29ydCBlMTY0XG5zb3J0X2J5X2FscGhhIGUwNTNcbnNwYSBlYjRjXG5zcGFjZV9iYXIgZTI1Nlxuc3BlYWtlciBlMzJkXG5zcGVha2VyX2dyb3VwIGUzMmVcbnNwZWFrZXJfbm90ZXMgZThjZFxuc3BlYWtlcl9ub3Rlc19vZmYgZTkyYVxuc3BlYWtlcl9waG9uZSBlMGQyXG5zcGVsbGNoZWNrIGU4Y2VcbnN0YXIgZTgzOFxuc3Rhcl9ib3JkZXIgZTgzYVxuc3Rhcl9oYWxmIGU4MzlcbnN0YXJzIGU4ZDBcbnN0YXlfY3VycmVudF9sYW5kc2NhcGUgZTBkM1xuc3RheV9jdXJyZW50X3BvcnRyYWl0IGUwZDRcbnN0YXlfcHJpbWFyeV9sYW5kc2NhcGUgZTBkNVxuc3RheV9wcmltYXJ5X3BvcnRyYWl0IGUwZDZcbnN0b3AgZTA0N1xuc3RvcF9zY3JlZW5fc2hhcmUgZTBlM1xuc3RvcmFnZSBlMWRiXG5zdG9yZSBlOGQxXG5zdG9yZV9tYWxsX2RpcmVjdG9yeSBlNTYzXG5zdHJhaWdodGVuIGU0MWNcbnN0cmVldHZpZXcgZTU2ZVxuc3RyaWtldGhyb3VnaF9zIGUyNTdcbnN0eWxlIGU0MWRcbnN1YmRpcmVjdG9yeV9hcnJvd19sZWZ0IGU1ZDlcbnN1YmRpcmVjdG9yeV9hcnJvd19yaWdodCBlNWRhXG5zdWJqZWN0IGU4ZDJcbnN1YnNjcmlwdGlvbnMgZTA2NFxuc3VidGl0bGVzIGUwNDhcbnN1YndheSBlNTZmXG5zdXBlcnZpc29yX2FjY291bnQgZThkM1xuc3Vycm91bmRfc291bmQgZTA0OVxuc3dhcF9jYWxscyBlMGQ3XG5zd2FwX2hvcml6IGU4ZDRcbnN3YXBfdmVydCBlOGQ1XG5zd2FwX3ZlcnRpY2FsX2NpcmNsZSBlOGQ2XG5zd2l0Y2hfY2FtZXJhIGU0MWVcbnN3aXRjaF92aWRlbyBlNDFmXG5zeW5jIGU2MjdcbnN5bmNfZGlzYWJsZWQgZTYyOFxuc3luY19wcm9ibGVtIGU2MjlcbnN5c3RlbV91cGRhdGUgZTYyYVxuc3lzdGVtX3VwZGF0ZV9hbHQgZThkN1xudGFiIGU4ZDhcbnRhYl91bnNlbGVjdGVkIGU4ZDlcbnRhYmxldCBlMzJmXG50YWJsZXRfYW5kcm9pZCBlMzMwXG50YWJsZXRfbWFjIGUzMzFcbnRhZ19mYWNlcyBlNDIwXG50YXBfYW5kX3BsYXkgZTYyYlxudGVycmFpbiBlNTY0XG50ZXh0X2ZpZWxkcyBlMjYyXG50ZXh0X2Zvcm1hdCBlMTY1XG50ZXh0c21zIGUwZDhcbnRleHR1cmUgZTQyMVxudGhlYXRlcnMgZThkYVxudGh1bWJfZG93biBlOGRiXG50aHVtYl91cCBlOGRjXG50aHVtYnNfdXBfZG93biBlOGRkXG50aW1lX3RvX2xlYXZlIGU2MmNcbnRpbWVsYXBzZSBlNDIyXG50aW1lbGluZSBlOTIyXG50aW1lciBlNDI1XG50aW1lcl8xMCBlNDIzXG50aW1lcl8zIGU0MjRcbnRpbWVyX29mZiBlNDI2XG50aXRsZSBlMjY0XG50b2MgZThkZVxudG9kYXkgZThkZlxudG9sbCBlOGUwXG50b25hbGl0eSBlNDI3XG50b3VjaF9hcHAgZTkxM1xudG95cyBlMzMyXG50cmFja19jaGFuZ2VzIGU4ZTFcbnRyYWZmaWMgZTU2NVxudHJhaW4gZTU3MFxudHJhbSBlNTcxXG50cmFuc2Zlcl93aXRoaW5fYV9zdGF0aW9uIGU1NzJcbnRyYW5zZm9ybSBlNDI4XG50cmFuc2xhdGUgZThlMlxudHJlbmRpbmdfZG93biBlOGUzXG50cmVuZGluZ19mbGF0IGU4ZTRcbnRyZW5kaW5nX3VwIGU4ZTVcbnR1bmUgZTQyOVxudHVybmVkX2luIGU4ZTZcbnR1cm5lZF9pbl9ub3QgZThlN1xudHYgZTMzM1xudW5hcmNoaXZlIGUxNjlcbnVuZG8gZTE2NlxudW5mb2xkX2xlc3MgZTVkNlxudW5mb2xkX21vcmUgZTVkN1xudXBkYXRlIGU5MjNcbnVzYiBlMWUwXG52ZXJpZmllZF91c2VyIGU4ZThcbnZlcnRpY2FsX2FsaWduX2JvdHRvbSBlMjU4XG52ZXJ0aWNhbF9hbGlnbl9jZW50ZXIgZTI1OVxudmVydGljYWxfYWxpZ25fdG9wIGUyNWFcbnZpYnJhdGlvbiBlNjJkXG52aWRlb19jYWxsIGUwNzBcbnZpZGVvX2xhYmVsIGUwNzFcbnZpZGVvX2xpYnJhcnkgZTA0YVxudmlkZW9jYW0gZTA0YlxudmlkZW9jYW1fb2ZmIGUwNGNcbnZpZGVvZ2FtZV9hc3NldCBlMzM4XG52aWV3X2FnZW5kYSBlOGU5XG52aWV3X2FycmF5IGU4ZWFcbnZpZXdfY2Fyb3VzZWwgZThlYlxudmlld19jb2x1bW4gZThlY1xudmlld19jb21meSBlNDJhXG52aWV3X2NvbXBhY3QgZTQyYlxudmlld19kYXkgZThlZFxudmlld19oZWFkbGluZSBlOGVlXG52aWV3X2xpc3QgZThlZlxudmlld19tb2R1bGUgZThmMFxudmlld19xdWlsdCBlOGYxXG52aWV3X3N0cmVhbSBlOGYyXG52aWV3X3dlZWsgZThmM1xudmlnbmV0dGUgZTQzNVxudmlzaWJpbGl0eSBlOGY0XG52aXNpYmlsaXR5X29mZiBlOGY1XG52b2ljZV9jaGF0IGU2MmVcbnZvaWNlbWFpbCBlMGQ5XG52b2x1bWVfZG93biBlMDRkXG52b2x1bWVfbXV0ZSBlMDRlXG52b2x1bWVfb2ZmIGUwNGZcbnZvbHVtZV91cCBlMDUwXG52cG5fa2V5IGUwZGFcbnZwbl9sb2NrIGU2MmZcbndhbGxwYXBlciBlMWJjXG53YXJuaW5nIGUwMDJcbndhdGNoIGUzMzRcbndhdGNoX2xhdGVyIGU5MjRcbndiX2F1dG8gZTQyY1xud2JfY2xvdWR5IGU0MmRcbndiX2luY2FuZGVzY2VudCBlNDJlXG53Yl9pcmlkZXNjZW50IGU0MzZcbndiX3N1bm55IGU0MzBcbndjIGU2M2RcbndlYiBlMDUxXG53ZWJfYXNzZXQgZTA2OVxud2Vla2VuZCBlMTZiXG53aGF0c2hvdCBlODBlXG53aWRnZXRzIGUxYmRcbndpZmkgZTYzZVxud2lmaV9sb2NrIGUxZTFcbndpZmlfdGV0aGVyaW5nIGUxZTJcbndvcmsgZThmOVxud3JhcF90ZXh0IGUyNWJcbnlvdXR1YmVfc2VhcmNoZWRfZm9yIGU4ZmFcbnpvb21faW4gZThmZlxuem9vbV9vdXQgZTkwMFxuem9vbV9vdXRfbWFwIGU1NmJcbmA7XG5cbmxldCBjb2RlcG9pbnRzID0gcy50cmltKCkuc3BsaXQoXCJcXG5cIikucmVkdWNlKGZ1bmN0aW9uKGN2LCBudil7XG4gICAgbGV0IHBhcnRzID0gbnYuc3BsaXQoLyArLyk7XG4gICAgbGV0IHVjID0gJ1xcXFx1JyArIHBhcnRzWzFdO1xuICAgIGN2W3BhcnRzWzBdXSA9IGV2YWwoJ1wiJyArIHVjICsgJ1wiJyk7XG4gICAgcmV0dXJuIGN2O1xufSwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb2RlcG9pbnRzXG59XG5cblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IExFQUZUWVBFUyB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7IGRlZXBjLCBvYmoyYXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuLy8gQSBNb2RlbCByZXByZXNlbnRzIHRoZSBkYXRhIG1vZGVsIG9mIGEgbWluZS4gSXQgaXMgYSBjbGFzcy1pZmllZCBhbmQgZXhwYW5kZWRcbi8vIHZlcnNpb24gb2YgdGhlIGRhdGEgc3RydWN0dXJlIHJldHVybmVkIGJ5IHRoZSAvbW9kZWwgc2VydmljZSBjYWxsLlxuLy9cbmNsYXNzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3RvciAoY2ZnLCBtaW5lKSB7XG4gICAgICAgIGxldCBtb2RlbCA9IHRoaXM7XG4gICAgICAgIHRoaXMubWluZSA9IG1pbmU7XG4gICAgICAgIHRoaXMucGFja2FnZSA9IGNmZy5wYWNrYWdlO1xuICAgICAgICB0aGlzLm5hbWUgPSBjZmcubmFtZTtcbiAgICAgICAgdGhpcy5jbGFzc2VzID0gZGVlcGMoY2ZnLmNsYXNzZXMpO1xuXG4gICAgICAgIC8vIEZpcnN0IGFkZCBjbGFzc2VzIHRoYXQgcmVwcmVzZW50IHRoZSBiYXNpYyB0eXBlXG4gICAgICAgIExFQUZUWVBFUy5mb3JFYWNoKCBuID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2xhc3Nlc1tuXSA9IHtcbiAgICAgICAgICAgICAgICBpc0xlYWZUeXBlOiB0cnVlLCAgIC8vIGRpc3Rpbmd1aXNoZXMgdGhlc2UgZnJvbSBtb2RlbCBjbGFzc2VzXG4gICAgICAgICAgICAgICAgbmFtZTogbixcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogbixcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbXSxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VzOiBbXSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uczogW10sXG4gICAgICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYWxsQ2xhc3NlcyA9IG9iajJhcnJheSh0aGlzLmNsYXNzZXMpXG4gICAgICAgIGxldCBjbnMgPSBPYmplY3Qua2V5cyh0aGlzLmNsYXNzZXMpO1xuICAgICAgICBjbnMuc29ydCgpXG4gICAgICAgIGNucy5mb3JFYWNoKGZ1bmN0aW9uKGNuKXsgLy8gZm9yIGVhY2ggY2xhc3MgbmFtZVxuICAgICAgICAgICAgbGV0IGNscyA9IG1vZGVsLmNsYXNzZXNbY25dO1xuICAgICAgICAgICAgLy8gZ2VuZXJhdGUgYXJyYXlzIGZvciBjb252ZW5pZW50IGFjY2Vzc1xuICAgICAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMgPSBvYmoyYXJyYXkoY2xzLmF0dHJpYnV0ZXMpXG4gICAgICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcyA9IG9iajJhcnJheShjbHMucmVmZXJlbmNlcylcbiAgICAgICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucyA9IG9iajJhcnJheShjbHMuY29sbGVjdGlvbnMpXG4gICAgICAgICAgICBjbHMuYWxsQXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImF0dHJpYnV0ZVwiOyB9KTtcbiAgICAgICAgICAgIGNscy5hbGxSZWZlcmVuY2VzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwicmVmZXJlbmNlXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiY29sbGVjdGlvblwiOyB9KTtcbiAgICAgICAgICAgIGNscy5hbGxQYXJ0cyA9IGNscy5hbGxBdHRyaWJ1dGVzLmNvbmNhdChjbHMuYWxsUmVmZXJlbmNlcykuY29uY2F0KGNscy5hbGxDb2xsZWN0aW9ucyk7XG4gICAgICAgICAgICBjbHMuYWxsUGFydHMuc29ydChmdW5jdGlvbihhLGIpeyByZXR1cm4gYS5uYW1lIDwgYi5uYW1lID8gLTEgOiBhLm5hbWUgPiBiLm5hbWUgPyAxIDogMDsgfSk7XG4gICAgICAgICAgICBtb2RlbC5hbGxDbGFzc2VzLnB1c2goY2xzKTtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgZXh0ZW5kcyBmcm9tIGEgbGlzdCBvZiBuYW1lcyB0byBhIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cy5cbiAgICAgICAgICAgIC8vIEFsc28gYWRkIHRoZSBpbnZlcnNlIGxpc3QsIGV4dGVuZGVkQnkuXG4gICAgICAgICAgICBjbHNbXCJleHRlbmRzXCJdID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgbGV0IGJjID0gbW9kZWwuY2xhc3Nlc1tlXTtcbiAgICAgICAgICAgICAgICBpZiAoIWJjKSB0aHJvdyBcIk5vIGNsYXNzIG5hbWVkOiBcIiArIGU7XG4gICAgICAgICAgICAgICAgaWYgKGJjLmV4dGVuZGVkQnkpIHtcbiAgICAgICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeS5wdXNoKGNscyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5ID0gW2Nsc107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBiYztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQXR0cmlidXRlczogc3RvcmUgY2xhc3Mgb2JqIG9mIHJlZmVyZW5jZWRUeXBlXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbHMuYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbihhbil7XG4gICAgICAgICAgICAgICAgbGV0IGEgPSBjbHMuYXR0cmlidXRlc1thbl07XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBtb2RlbC5jbGFzc2VzW2EudHlwZV07XG4gICAgICAgICAgICAgICAgaWYgKCF0KSB0aHJvdyBcIk5vIGNsYXNzIG5hbWVkOiBcIiArIGEudHlwZTtcbiAgICAgICAgICAgICAgICBhLnR5cGUgPSB0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzOiBzdG9yZSBjbGFzcyBvYmogb2YgcmVmZXJlbmNlZFR5cGVcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNscy5yZWZlcmVuY2VzKS5mb3JFYWNoKGZ1bmN0aW9uKHJuKXtcbiAgICAgICAgICAgICAgICBsZXQgciA9IGNscy5yZWZlcmVuY2VzW3JuXTtcbiAgICAgICAgICAgICAgICByLnR5cGUgPSBtb2RlbC5jbGFzc2VzW3IucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIENvbGxlY3Rpb25zOiBzdG9yZSBjbGFzcyBvYmogb2YgcmVmZXJlbmNlZFR5cGVcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNscy5jb2xsZWN0aW9ucykuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgICAgICAgICAgbGV0IGMgPSBjbHMuY29sbGVjdGlvbnNbY25dO1xuICAgICAgICAgICAgICAgIGMudHlwZSA9IG1vZGVsLmNsYXNzZXNbYy5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59IC8vIGVuZCBvZiBjbGFzcyBNb2RlbFxuXG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3VwZXJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChcbi8vIFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdXBlcmNsYXNzZXMoY2xzKXtcbiAgICBpZiAoY2xzLmlzTGVhZlR5cGUgfHwgIWNsc1tcImV4dGVuZHNcIl0gfHwgY2xzW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIGxldCBhbmMgPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdXBlcmNsYXNzZXMoc2MpOyB9KTtcbiAgICBsZXQgYWxsID0gY2xzW1wiZXh0ZW5kc1wiXS5jb25jYXQoYW5jLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgbGV0IGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgc3ViY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1YmNsYXNzZXMoY2xzKXtcbiAgICBpZiAoY2xzLmlzTGVhZlR5cGUgfHwgIWNscy5leHRlbmRlZEJ5IHx8IGNscy5leHRlbmRlZEJ5Lmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgbGV0IGRlc2MgPSBjbHMuZXh0ZW5kZWRCeS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3ViY2xhc3NlcyhzYyk7IH0pO1xuICAgIGxldCBhbGwgPSBjbHMuZXh0ZW5kZWRCeS5jb25jYXQoZGVzYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIGxldCBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWZmIHN1YiBpcyBhIHN1YmNsYXNzIG9mIHN1cC5cbmZ1bmN0aW9uIGlzU3ViY2xhc3Moc3ViLHN1cCkge1xuICAgIGlmIChzdWIgPT09IHN1cCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKHN1Yi5pc0xlYWZUeXBlIHx8ICFzdWJbXCJleHRlbmRzXCJdIHx8IHN1YltcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgICBsZXQgciA9IHN1YltcImV4dGVuZHNcIl0uZmlsdGVyKGZ1bmN0aW9uKHgpeyByZXR1cm4geD09PXN1cCB8fCBpc1N1YmNsYXNzKHgsIHN1cCk7IH0pO1xuICAgIHJldHVybiByLmxlbmd0aCA+IDA7XG59XG5cblxuZXhwb3J0IHtcbiAgICBNb2RlbCxcbiAgICBnZXRTdWJjbGFzc2VzLFxuICAgIGdldFN1cGVyY2xhc3NlcyxcbiAgICBpc1N1YmNsYXNzXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9tb2RlbC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgZXNjLCBkZWVwYyB9IGZyb20gJy4vdXRpbHMuanMnO1xuY2xhc3MgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKGMpIHtcbiAgICAgICAgYyA9IGMgfHwge31cbiAgICAgICAgLy8gc2F2ZSB0aGUgIG5vZGVcbiAgICAgICAgdGhpcy5ub2RlID0gYy5ub2RlIHx8IG51bGw7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gYy5wYXRoIHx8IGMubm9kZSAmJiBjLm5vZGUucGF0aCB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gYy5vcCB8fCBjLnR5cGUgJiYgXCJJU0FcIiB8fCBudWxsO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0LCByYW5nZSwgbG9vcFxuICAgICAgICAvLyB0aHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoaXMub3AgaXMgZGVmaW5lZCwgYnV0IG5vdCBpbiBPUElOREVYXG4gICAgICAgIHRoaXMuY3R5cGUgPSB0aGlzLm9wICYmIE9QSU5ERVhbdGhpcy5vcF0uY3R5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMuY29kZSA9IHRoaXMuY3R5cGUgIT09IFwic3ViY2xhc3NcIiAmJiBjLmNvZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSB2YWx1ZSwgbGlzdFxuICAgICAgICB0aGlzLnZhbHVlID0gYy52YWx1ZSB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gdGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIiAmJiBjLmV4dHJhVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IGMudmFsdWVzICYmIGRlZXBjKGMudmFsdWVzKSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHN1YmNsYXNzIGNvbnRyYWludHNcbiAgICAgICAgdGhpcy50eXBlID0gdGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIGMudHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGZvciBjb25zdHJhaW50cyBpbiBhIHRlbXBsYXRlXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBjLmVkaXRhYmxlIHx8IG51bGw7XG5cbiAgICAgICAgLy8gV2l0aCBudWxsL25vdC1udWxsIGNvbnN0cmFpbnRzLCBJTSBoYXMgYSB3ZWlyZCBxdWlyayBvZiBmaWxsaW5nIHRoZSB2YWx1ZSBcbiAgICAgICAgLy8gZmllbGQgd2l0aCB0aGUgb3BlcmF0b3IuIEUuZy4sIGZvciBhbiBcIklTIE5PVCBOVUxMXCIgb3ByZWF0b3IsIHRoZSB2YWx1ZSBmaWVsZCBpc1xuICAgICAgICAvLyBhbHNvIFwiSVMgTk9UIE5VTExcIi4gXG4gICAgICAgIC8vIFxuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBjLnZhbHVlID0gXCJcIjtcbiAgICB9XG4gICAgLy9cbiAgICBzZXRPcCAobywgcXVpZXRseSkge1xuICAgICAgICBsZXQgb3AgPSBPUElOREVYW29dO1xuICAgICAgICBpZiAoIW9wKSB0aHJvdyBcIlVua25vd24gb3BlcmF0b3I6IFwiICsgbztcbiAgICAgICAgdGhpcy5vcCA9IG9wLm9wO1xuICAgICAgICB0aGlzLmN0eXBlID0gb3AuY3R5cGU7XG4gICAgICAgIGxldCB0ID0gdGhpcy5ub2RlICYmIHRoaXMubm9kZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29kZSAmJiAhcXVpZXRseSAmJiB0KSBcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5jb2RlMmNbdGhpcy5jb2RlXTtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY29kZSkgXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gdCAmJiB0Lm5leHRBdmFpbGFibGVDb2RlKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAhcXVpZXRseSAmJiB0ICYmIHQuc2V0TG9naWNFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIC8vIFJldHVybnMgYSB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb25zdHJhaW50IHN1aXRhYmxlIGZvciBhIGxhYmVsXG4gICAgLy9cbiAgICBnZXQgbGFiZWxUZXh0ICgpIHtcbiAgICAgICBsZXQgdCA9IFwiP1wiO1xuICAgICAgIGxldCBjID0gdGhpcztcbiAgICAgICAgLy8gb25lIG9mOiBudWxsLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgc3ViY2xhc3MsIGxvb2t1cCwgbGlzdCwgcmFuZ2UsIGxvb3BcbiAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKXtcbiAgICAgICAgICAgdCA9IFwiSVNBIFwiICsgKHRoaXMudHlwZSB8fCBcIj9cIik7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibGlzdFwiIHx8IHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZTtcbiAgICAgICAgICAgaWYgKHRoaXMuZXh0cmFWYWx1ZSkgdCA9IHQgKyBcIiBJTiBcIiArIHRoaXMuZXh0cmFWYWx1ZTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlcztcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3A7XG4gICAgICAgfVxuXG4gICAgICAgcmV0dXJuICh0aGlzLmN0eXBlICE9PSBcInN1YmNsYXNzXCIgPyBcIihcIit0aGlzLmNvZGUrXCIpIFwiIDogXCJcIikgKyB0O1xuICAgIH1cblxuICAgIC8vIGZvcm1hdHMgdGhpcyBjb25zdHJhaW50IGFzIHhtbFxuICAgIGMyeG1sIChxb25seSl7XG4gICAgICAgIGxldCBnID0gJyc7XG4gICAgICAgIGxldCBoID0gJyc7XG4gICAgICAgIGxldCBlID0gcW9ubHkgPyBcIlwiIDogYGVkaXRhYmxlPVwiJHt0aGlzLmVkaXRhYmxlIHx8ICdmYWxzZSd9XCJgO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiIHx8IHRoaXMuY3R5cGUgPT09IFwibGlzdFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIil7XG4gICAgICAgICAgICBsZXQgZXYgPSAodGhpcy5leHRyYVZhbHVlICYmIHRoaXMuZXh0cmFWYWx1ZSAhPT0gXCJBbnlcIikgPyBgZXh0cmFWYWx1ZT1cIiR7dGhpcy5leHRyYVZhbHVlfVwiYCA6IFwiXCI7XG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7ZXNjKHRoaXMub3ApfVwiIHZhbHVlPVwiJHtlc2ModGhpcy52YWx1ZSl9XCIgJHtldn0gY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKXtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHt0aGlzLm9wfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgICAgIGggPSB0aGlzLnZhbHVlcy5tYXAoIHYgPT4gYDx2YWx1ZT4ke2VzYyh2KX08L3ZhbHVlPmAgKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiB0eXBlPVwiJHt0aGlzLnR5cGV9XCIgJHtlfWA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICBpZihoKVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9PiR7aH08L2NvbnN0cmFpbnQ+XFxuYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9IC8+XFxuYDtcbiAgICB9XG59IC8vIGVuZCBvZiBjbGFzcyBDb25zdHJhaW50XG5cbmV4cG9ydCB7IENvbnN0cmFpbnQgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnQuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy9cbi8vIHFiLmpzXG4vL1xuXG5pbXBvcnQgeyBRQkVkaXRvciB9IGZyb20gJy4vcWJlZGl0b3IuanMnO1xuXG5sZXQgcWIgPSBuZXcgUUJFZGl0b3IoKTtcbnFiLnNldHVwKClcbi8vXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYi5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHtcbiAgICBlc2MsXG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIHBhcnNlUGF0aFF1ZXJ5LFxuICAgIG9iajJhcnJheSxcbiAgICBpbml0T3B0aW9uTGlzdCxcbiAgICBjb3B5T2JqXG59IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgY29kZXBvaW50cyB9IGZyb20gJy4vbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzJztcbmltcG9ydCB7IFVuZG9NYW5hZ2VyIH0gZnJvbSAnLi91bmRvTWFuYWdlci5qcyc7XG5pbXBvcnQgeyBNb2RlbCB9IGZyb20gJy4vbW9kZWwuanMnO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLmpzJztcbmltcG9ydCB7IGluaXRSZWdpc3RyeSB9IGZyb20gJy4vcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgZWRpdFZpZXdzIH0gZnJvbSAnLi9lZGl0Vmlld3MuanMnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnLi9kaWFsb2cuanMnO1xuaW1wb3J0IHsgQ29uc3RyYWludEVkaXRvciB9IGZyb20gJy4vY29uc3RyYWludEVkaXRvci5qcyc7XG5cbmxldCBWRVJTSU9OID0gXCIwLjEuMFwiO1xuXG5jbGFzcyBRQkVkaXRvciB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICB0aGlzLmN1cnJNaW5lID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdXJyVGVtcGxhdGUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMubmFtZTJtaW5lID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdmcgPSB7XG4gICAgICAgICAgICB3aWR0aDogICAgICAxMjgwLFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgODAwLFxuICAgICAgICAgICAgbWxlZnQ6ICAgICAgMTIwLFxuICAgICAgICAgICAgbXJpZ2h0OiAgICAgMTIwLFxuICAgICAgICAgICAgbXRvcDogICAgICAgMjAsXG4gICAgICAgICAgICBtYm90dG9tOiAgICAyMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgICAgICB0aGlzLmRpYWdvbmFsID0gbnVsbDtcbiAgICAgICAgdGhpcy52aXMgPSBudWxsO1xuICAgICAgICB0aGlzLm5vZGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5saW5rcyA9IG51bGw7XG4gICAgICAgIHRoaXMuZHJhZ0JlaGF2aW9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5hbmltYXRpb25EdXJhdGlvbiA9IDI1MDsgLy8gbXNcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29sb3JzID0geyBoZWFkZXI6IHsgbWFpbjogXCIjNTk1NDU1XCIsIHRleHQ6IFwiI2ZmZlwiIH0gfTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9nbyA9IFwiaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9pbnRlcm1pbmUvZGVzaWduLW1hdGVyaWFscy83OGExM2RiNS9sb2dvcy9pbnRlcm1pbmUvc3F1YXJlaXNoLzQ1eDQ1LnBuZ1wiO1xuICAgICAgICB0aGlzLnVuZG9NZ3IgPSBuZXcgVW5kb01hbmFnZXIoKTtcbiAgICAgICAgLy8gU3RhcnRpbmcgZWRpdCB2aWV3IGlzIHRoZSBtYWluIHF1ZXJ5IHZpZXcuXG4gICAgICAgIHRoaXMuZWRpdFZpZXdzID0gZWRpdFZpZXdzO1xuICAgICAgICB0aGlzLmVkaXRWaWV3ID0gdGhpcy5lZGl0Vmlld3MucXVlcnlNYWluO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRFZGl0b3IgPVxuICAgICAgICAgICAgbmV3IENvbnN0cmFpbnRFZGl0b3IobiA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWFsb2cuc2hvdyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3Iuc2F2ZVN0YXRlKG4pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKG4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoZSBub2RlIGRpYWxvZ1xuICAgICAgICB0aGlzLmRpYWxvZyA9IG5ldyBEaWFsb2codGhpcyk7XG4gICAgfVxuICAgIHNldHVwICgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoJyNmb290ZXIgW25hbWU9XCJ2ZXJzaW9uXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGBRQiB2JHtWRVJTSU9OfWApO1xuXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuaW5pdFN2ZygpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdCgnLmJ1dHRvbltuYW1lPVwib3BlbmNsb3NlXCJdJylcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIik7XG4gICAgICAgICAgICAgICAgbGV0IHdhc0Nsb3NlZCA9IHQuY2xhc3NlZChcImNsb3NlZFwiKTtcbiAgICAgICAgICAgICAgICBsZXQgaXNDbG9zZWQgPSAhd2FzQ2xvc2VkO1xuICAgICAgICAgICAgICAgIGxldCBkID0gZDMuc2VsZWN0KCcjdEluZm9CYXInKVswXVswXVxuICAgICAgICAgICAgICAgIGlmIChpc0Nsb3NlZClcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSB0aGUgY3VycmVudCBoZWlnaHQganVzdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgICAgICAgICAgICAgICBkLl9fc2F2ZWRfaGVpZ2h0ID0gZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZC5fX3NhdmVkX2hlaWdodClcbiAgICAgICAgICAgICAgICAgICAvLyBvbiBvcGVuLCByZXN0b3JlIHRoZSBzYXZlZCBoZWlnaHRcbiAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyN0SW5mb0JhcicpLnN0eWxlKFwiaGVpZ2h0XCIsIGQuX19zYXZlZF9oZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsIGlzQ2xvc2VkKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkMy5zZWxlY3QoJy5idXR0b25bbmFtZT1cInR0ZXh0RXhwYW5kXCJdJylcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsICEgdC5jbGFzc2VkKFwiY2xvc2VkXCIpKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsICEgdC5jbGFzc2VkKFwiY2xvc2VkXCIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGluaXRSZWdpc3RyeSh0aGlzLmluaXRNaW5lcy5iaW5kKHRoaXMpKTtcblxuICAgICAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjdHRleHQnKS5hdHRyKCdjbGFzcycsICdmbGV4Y29sdW1uICcrdGhpcy5pbm5lclRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgc2VsZi51cGRhdGVUdGV4dChzZWxmLmN1cnJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiBzZWxmLnJ1bmF0bWluZShzZWxmLmN1cnJUZW1wbGF0ZSkpO1xuICAgICAgICBkMy5zZWxlY3QoJyNydW5hdHFiJylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiBzZWxmLnJ1bmF0cWIoc2VsZi5jdXJyVGVtcGxhdGUpKTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgICAgIHQudGV4dCggdHVyblN5bmNPZmYgPyBcInN5bmNfZGlzYWJsZWRcIiA6IFwic3luY1wiIClcbiAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0aXRsZVwiLCAoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgICAgICF0dXJuU3luY09mZiAmJiBzZWxmLnVwZGF0ZUNvdW50KHNlbGYuY3VyclRlbXBsYXRlKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpXG4gICAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgICAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpXG4gICAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJqc29udGV4dGFyZWFcIil9KTtcblxuICAgICAgLy9cbiAgICAgIHRoaXMuZHJhZ0JlaGF2aW9yID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIG9uIGRyYWcsIGZvbGxvdyB0aGUgbW91c2UgaW4gdGhlIFkgZGltZW5zaW9uLlxuICAgICAgICAgIC8vIERyYWcgY2FsbGJhY2sgaXMgYXR0YWNoZWQgdG8gdGhlIGRyYWcgaGFuZGxlLlxuICAgICAgICAgIGxldCBub2RlR3JwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgIC8vIHVwZGF0ZSBub2RlJ3MgeS1jb29yZGluYXRlXG4gICAgICAgICAgbm9kZUdycC5hdHRyKFwidHJhbnNmb3JtXCIsIChuKSA9PiB7XG4gICAgICAgICAgICAgIG4ueSA9IGQzLmV2ZW50Lnk7XG4gICAgICAgICAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7bi54fSwke24ueX0pYDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIG5vZGUncyBsaW5rXG4gICAgICAgICAgbGV0IGxsID0gZDMuc2VsZWN0KGBwYXRoLmxpbmtbdGFyZ2V0PVwiJHtub2RlR3JwLmF0dHIoJ2lkJyl9XCJdYCk7XG4gICAgICAgICAgbGwuYXR0cihcImRcIiwgc2VsZi5kaWFnb25hbCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgLm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gb24gZHJhZ2VuZCwgcmVzb3J0IHRoZSBkcmFnZ2FibGUgbm9kZXMgYWNjb3JkaW5nIHRvIHRoZWlyIFkgcG9zaXRpb25cbiAgICAgICAgICBsZXQgbm9kZXMgPSBkMy5zZWxlY3RBbGwoc2VsZi5lZGl0Vmlldy5kcmFnZ2FibGUpLmRhdGEoKVxuICAgICAgICAgIG5vZGVzLnNvcnQoIChhLCBiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgICAgICAvLyB0aGUgbm9kZSB0aGF0IHdhcyBkcmFnZ2VkXG4gICAgICAgICAgbGV0IGRyYWdnZWQgPSBkMy5zZWxlY3QodGhpcykuZGF0YSgpWzBdO1xuICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBzcGVjaWZpYyBkcmFnLWVuZCBiZWhhdmlvclxuICAgICAgICAgIHNlbGYuZWRpdFZpZXcuYWZ0ZXJEcmFnICYmIHNlbGYuZWRpdFZpZXcuYWZ0ZXJEcmFnKG5vZGVzLCBkcmFnZ2VkKTtcbiAgICAgICAgICAvL1xuICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoZHJhZ2dlZCk7XG4gICAgICAgICAgc2VsZi51cGRhdGUoKTtcbiAgICAgICAgICAvL1xuICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0TWluZXMgKGpfbWluZXMpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLm5hbWUybWluZSA9IHt9O1xuICAgICAgICBsZXQgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICAgICAgbWluZXMuZm9yRWFjaChtID0+IHRoaXMubmFtZTJtaW5lW20ubmFtZV0gPSBtICk7XG4gICAgICAgIHRoaXMuY3Vyck1pbmUgPSBtaW5lc1swXTtcbiAgICAgICAgdGhpcy5jdXJyVGVtcGxhdGUgPSBudWxsO1xuXG4gICAgICAgIGxldCBtbCA9IGQzLnNlbGVjdChcIiNtbGlzdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShtaW5lcyk7XG4gICAgICAgIGxldCBzZWxlY3RNaW5lID0gXCJNb3VzZU1pbmVcIjtcbiAgICAgICAgbWwuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICBsZXQgdyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgbSA9IGQudXJsLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgdiA9ICh3ICYmICFtKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU9PT1zZWxlY3RNaW5lIHx8IG51bGw7IH0pXG4gICAgICAgICAgICAudGV4dChmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHdoZW4gYSBtaW5lIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3RcbiAgICAgICAgZDMuc2VsZWN0KFwiI21saXN0XCIpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAvLyByZW1pbmRlcjogdGhpcz09PXRoZSBsaXN0IGlucHV0IGVsZW1lbnQ7IHNlbGY9PT10aGUgZWRpdG9yIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgc2VsZi5zZWxlY3RlZE1pbmUodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoXCIjZWRpdFZpZXcgc2VsZWN0XCIpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIHJlbWluZGVyOiB0aGlzPT09dGhlIGxpc3QgaW5wdXQgZWxlbWVudDsgc2VsZj09PXRoZSBlZGl0b3IgaW5zdGFuY2VcbiAgICAgICAgICAgICAgICBzZWxmLnNldEVkaXRWaWV3KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcblxuICAgICAgICAvLyBzdGFydCB3aXRoIHRoZSBmaXJzdCBtaW5lIGJ5IGRlZmF1bHQuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRNaW5lKHNlbGVjdE1pbmUpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgd2hlbiB1c2VyIHNlbGVjdHMgYSBtaW5lIGZyb20gdGhlIG9wdGlvbiBsaXN0XG4gICAgLy8gTG9hZHMgdGhhdCBtaW5lJ3MgZGF0YSBtb2RlbCBhbmQgYWxsIGl0cyB0ZW1wbGF0ZXMuXG4gICAgLy8gVGhlbiBpbml0aWFsaXplcyBkaXNwbGF5IHRvIHNob3cgdGhlIGZpcnN0IHRlcm1wbGF0ZSdzIHF1ZXJ5LlxuICAgIHNlbGVjdGVkTWluZSAobW5hbWUpIHtcbiAgICAgICAgaWYoIXRoaXMubmFtZTJtaW5lW21uYW1lXSkgdGhyb3cgXCJObyBtaW5lIG5hbWVkOiBcIiArIG1uYW1lO1xuICAgICAgICB0aGlzLmN1cnJNaW5lID0gdGhpcy5uYW1lMm1pbmVbbW5hbWVdO1xuICAgICAgICB0aGlzLnVuZG9NZ3IuY2xlYXIoKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMuY3Vyck1pbmUudXJsO1xuICAgICAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICAgICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikge1xuICAgICAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICAgICAgbHVybCA9IHVybCArIFwiL2xpc3RzLmpzb25cIjtcbiAgICAgICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgICAgICBvdXJsID0gdXJsICsgXCIvb3JnYW5pc21saXN0Lmpzb25cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3RlbXBsYXRlcz9mb3JtYXQ9anNvblwiO1xuICAgICAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgICAgICBidXJsID0gdXJsICsgXCIvc2VydmljZS9icmFuZGluZ1wiO1xuICAgICAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICAgICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShsdXJsKSxcbiAgICAgICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShvdXJsKVxuICAgICAgICBdKS50aGVuKFxuICAgICAgICAgICAgdGhpcy5pbml0TWluZURhdGEuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y20ubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0TWluZURhdGEgKGRhdGEpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgal9tb2RlbCA9IGRhdGFbMF07XG4gICAgICAgIGxldCBqX3RlbXBsYXRlcyA9IGRhdGFbMV07XG4gICAgICAgIGxldCBqX2xpc3RzID0gZGF0YVsyXTtcbiAgICAgICAgbGV0IGpfYnJhbmRpbmcgPSBkYXRhWzNdO1xuICAgICAgICBsZXQgal9zdW1tYXJ5ID0gZGF0YVs0XTtcbiAgICAgICAgbGV0IGpfb3JnYW5pc21zID0gZGF0YVs1XTtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGNtID0gdGhpcy5jdXJyTWluZTtcbiAgICAgICAgY20udG5hbWVzID0gW11cbiAgICAgICAgY20udGVtcGxhdGVzID0gW11cbiAgICAgICAgY20ubW9kZWwgPSBuZXcgTW9kZWwoal9tb2RlbC5tb2RlbCwgY20pXG4gICAgICAgIGNtLnRlbXBsYXRlcyA9IGpfdGVtcGxhdGVzLnRlbXBsYXRlcztcbiAgICAgICAgY20ubGlzdHMgPSBqX2xpc3RzLmxpc3RzO1xuICAgICAgICBjbS5zdW1tYXJ5RmllbGRzID0gal9zdW1tYXJ5LmNsYXNzZXM7XG4gICAgICAgIGNtLm9yZ2FuaXNtTGlzdCA9IGpfb3JnYW5pc21zLnJlc3VsdHMubWFwKG8gPT4gby5zaG9ydE5hbWUpO1xuICAgICAgICAvL1xuICAgICAgICBjbS50bGlzdCA9IG9iajJhcnJheShjbS50ZW1wbGF0ZXMpXG4gICAgICAgIGNtLnRsaXN0LnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogYS50aXRsZSA+IGIudGl0bGUgPyAxIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNtLnRuYW1lcyA9IE9iamVjdC5rZXlzKCBjbS50ZW1wbGF0ZXMgKTtcbiAgICAgICAgY20udG5hbWVzLnNvcnQoKTtcbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgc2VsZWN0aW9uIGxpc3Qgb2YgdGVtcGxhdGVzIGZvciB0aGlzIG1pbmUuXG4gICAgICAgIGluaXRPcHRpb25MaXN0KFwiI3RsaXN0IHNlbGVjdFwiLCBjbS50bGlzdCwge1xuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgKCkgPT4gdGhpcy5zdGFydEVkaXQoKSk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZWRpdFRlbXBsYXRlKGNtLnRlbXBsYXRlc1tjbS50bGlzdFswXS5uYW1lXSk7XG4gICAgICAgIC8vIEFwcGx5IGJyYW5kaW5nXG4gICAgICAgIGxldCBjbHJzID0gY20uY29sb3JzIHx8IHRoaXMuZGVmYXVsdENvbG9ycztcbiAgICAgICAgbGV0IGJnYyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIubWFpbiA6IGNscnMubWFpbi5mZztcbiAgICAgICAgbGV0IHR4YyA9IGNscnMuaGVhZGVyID8gY2xycy5oZWFkZXIudGV4dCA6IGNscnMubWFpbi5iZztcbiAgICAgICAgbGV0IGxvZ28gPSBjbS5pbWFnZXMubG9nbyB8fCB0aGlzLmRlZmF1bHRMb2dvO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdG9vbHRyYXlcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNtaW5lTG9nb1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgbG9nbyk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnI3Rvb2x0cmF5IFtuYW1lPVwibWluZW5hbWVcIl0nKVxuICAgICAgICAgICAgLnRleHQoY20ubmFtZSk7XG4gICAgICAgIC8vIHBvcHVsYXRlIGNsYXNzIGxpc3QuIEV4Y2x1ZGUgdGhlIHNpbXBsZSBhdHRyaWJ1dGUgdHlwZXMuXG4gICAgICAgIGxldCBjbGlzdCA9IE9iamVjdC5rZXlzKGNtLm1vZGVsLmNsYXNzZXMpLmZpbHRlcihjbiA9PiAhIGNtLm1vZGVsLmNsYXNzZXNbY25dLmlzTGVhZlR5cGUpO1xuICAgICAgICBjbGlzdC5zb3J0KCk7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFwiI25ld3FjbGlzdCBzZWxlY3RcIiwgY2xpc3QpO1xuICAgICAgICBkMy5zZWxlY3QoJyNlZGl0U291cmNlU2VsZWN0b3IgW25hbWU9XCJpblwiXScpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnNlbGVjdGVkSW5kZXggPSAxOyB9KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHNlbGYuc2VsZWN0ZWRFZGl0U291cmNlKHRoaXMudmFsdWUpOyBzZWxmLnN0YXJ0RWRpdCgpOyB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpWzBdWzBdLnZhbHVlID0gXCJcIjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRFZGl0U291cmNlKCBcInRsaXN0XCIgKTtcbiAgICB9XG5cbiAgICAvLyBCZWdpbnMgYW4gZWRpdCwgYmFzZWQgb24gdXNlciBjb250cm9scy5cbiAgICBzdGFydEVkaXQgKCkge1xuICAgICAgICAvLyBmaXJzdCwgY2xlYXIgb3V0IHRoZSBkaXYgd2l0aGluIHdpdGggdGhlIGltLXRhYmxlIHF1ZXJ5IHdhcyBnZW5lcmF0ZWRcbiAgICAgICAgZDMuc2VsZWN0KCcjaW1UYWJsZXNRdWVyeScpLmh0bWwobnVsbCk7XG4gICAgICAgIC8vIHNlbGVjdG9yIGZvciBjaG9vc2luZyBlZGl0IGlucHV0IHNvdXJjZSwgYW5kIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgICAgIC8vIHRoZSBjaG9zZW4gZWRpdCBzb3VyY2VcbiAgICAgICAgbGV0IGlucHV0SWQgPSBzcmNTZWxlY3RvclswXVswXS52YWx1ZTtcbiAgICAgICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgICAgIGxldCBzcmMgPSBkMy5zZWxlY3QoYCMke2lucHV0SWR9IFtuYW1lPVwiaW5cIl1gKTtcbiAgICAgICAgLy8gdGhlIHF1ZXJ5IHN0YXJ0aW5nIHBvaW50XG4gICAgICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICAgICAgaWYgKGlucHV0SWQgPT09IFwidGxpc3RcIikge1xuICAgICAgICAgICAgLy8gYSBzYXZlZCBxdWVyeSBvciB0ZW1wbGF0ZVxuICAgICAgICAgICAgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy5jdXJyTWluZS50ZW1wbGF0ZXNbdmFsXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAgICAgLy8gYSBuZXcgcXVlcnkgZnJvbSBhIHNlbGVjdGVkIHN0YXJ0aW5nIGNsYXNzXG4gICAgICAgICAgICBsZXQgbnQgPSBuZXcgVGVtcGxhdGUoeyBzZWxlY3Q6IFt2YWwrXCIuaWRcIl19LCB0aGlzLmN1cnJNaW5lLm1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdFRlbXBsYXRlKG50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydHhtbFwiKSB7XG4gICAgICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgICAgICB2YWwgJiYgdGhpcy5lZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnRqc29uXCIpIHtcbiAgICAgICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgICAgICB2YWwgJiYgdGhpcy5lZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbiAgICB9XG5cbiAgICAvL1xuICAgIHNlbGVjdGVkRWRpdFNvdXJjZSAoc2hvdykge1xuICAgICAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSA+IGRpdi5vcHRpb24nKVxuICAgICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlcyB0aGUgY3VycmVudCBub2RlIGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuICAgIC8vXG4gICAgcmVtb3ZlTm9kZSAobikge1xuICAgICAgICBuLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmRpYWxvZy5oaWRlKCk7XG4gICAgICAgIHRoaXMudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgIHRoaXMudXBkYXRlKG4ucGFyZW50IHx8IG4pO1xuICAgIH1cblxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSB0ZW1wbGF0ZSBmcm9tIHRoZSBsaXN0LlxuICAgIC8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4gICAgLy8gZm9yIGQzIHRyZWUgZGlzcGxheS5cbiAgICAvL1xuICAgIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGN0ID0gdGhpcy5jdXJyVGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodCwgdGhpcy5jdXJyTWluZS5tb2RlbCk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMucm9vdCA9IGN0LnF0cmVlXG4gICAgICAgIHRoaXMucm9vdC54MCA9IDA7XG4gICAgICAgIHRoaXMucm9vdC55MCA9IHRoaXMuc3ZnLmhlaWdodCAvIDI7XG4gICAgICAgIC8vXG4gICAgICAgIGN0LnNldExvZ2ljRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGlmICghIG5vc2F2ZSkgdGhpcy51bmRvTWdyLnNhdmVTdGF0ZShjdC5xdHJlZSk7XG5cbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgYmFzaWMgdGVtcGxhdGUgaW5mb3JtYXRpb24gKG5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbiwgZXRjLilcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHRpID0gZDMuc2VsZWN0KFwiI3RJbmZvXCIpO1xuICAgICAgICBsZXQgeGZlciA9IGZ1bmN0aW9uKG5hbWUsIGVsdCl7IGN0W25hbWVdID0gZWx0LnZhbHVlOyBzZWxmLnVwZGF0ZVR0ZXh0KGN0KTsgfTtcbiAgICAgICAgLy8gTmFtZSAodGhlIGludGVybmFsIHVuaXF1ZSBuYW1lKVxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN0Lm5hbWUpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcIm5hbWVcIiwgdGhpcykgfSk7XG4gICAgICAgIC8vIFRpdGxlICh3aGF0IHRoZSB1c2VyIHNlZXMpXG4gICAgICAgIHRpLnNlbGVjdCgnW25hbWU9XCJ0aXRsZVwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN0LnRpdGxlKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAgICAgLy8gRGVzY3JpcHRpb24gKHdoYXQgaXQgZG9lcyAtIGEgbGl0dGxlIGRvY3VtZW50YXRpb24pLlxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiZGVzY3JpcHRpb25cIl0gdGV4dGFyZWEnKVxuICAgICAgICAgICAgLnRleHQoY3QuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImRlc2NyaXB0aW9uXCIsIHRoaXMpIH0pO1xuICAgICAgICAvLyBDb21tZW50IC0gZm9yIHdoYXRldmVyLCBJIGd1ZXNzLlxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiY29tbWVudFwiXSB0ZXh0YXJlYScpXG4gICAgICAgICAgICAudGV4dChjdC5jb21tZW50KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJjb21tZW50XCIsIHRoaXMpIH0pO1xuXG4gICAgICAgIC8vIExvZ2ljIGV4cHJlc3Npb24gLSB3aGljaCB0aWVzIHRoZSBpbmRpdmlkdWFsIGNvbnN0cmFpbnRzIHRvZ2V0aGVyXG4gICAgICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gY3QuY29uc3RyYWludExvZ2ljIH0pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgeGZlcihcImNvbnN0cmFpbnRMb2dpY1wiLCB0aGlzKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2xlYXIgdGhlIHF1ZXJ5IGNvdW50XG4gICAgICAgIGQzLnNlbGVjdChcIiNxdWVyeWNvdW50IHNwYW5cIikudGV4dChcIlwiKTtcblxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRpYWxvZy5oaWRlKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucm9vdCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBlZGl0aW5nIHZpZXcuIFZpZXcgaXMgb25lIG9mOlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICAgIHZpZXcgKHN0cmluZykgT25lIG9mOiBxdWVyeU1haW4sIGNvbnN0cmFpbnRMb2dpYywgY29sdW1uT3JkZXIsIHNvcnRPcmRlclxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICAgIE5vdGhpbmdcbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICAgIENoYW5nZXMgdGhlIGxheW91dCBhbmQgdXBkYXRlcyB0aGUgdmlldy5cbiAgICBzZXRFZGl0VmlldyAodmlldyl7XG4gICAgICAgIGxldCB2ID0gdGhpcy5lZGl0Vmlld3Nbdmlld107XG4gICAgICAgIGlmICghdikgdGhyb3cgXCJVbnJlY29nbml6ZWQgdmlldyB0eXBlOiBcIiArIHZpZXc7XG4gICAgICAgIHRoaXMuZWRpdFZpZXcgPSB2O1xuICAgICAgICBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyXCIpLmF0dHIoXCJjbGFzc1wiLCB2Lm5hbWUpO1xuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIC8vIEdyb3dzIG9yIHNocmlua3MgdGhlIHNpemUgb2YgdGhlIFNWRyBkcmF3aW5nIGFyZWEgYW5kIHJlZHJhd3MgdGhlIGRpYWdyYW0uXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHBjdFggKG51bWJlcikgQSBwZXJjZW50YWdlIHRvIGdyb3cgb3Igc2hyaW5rIGluIHRoZSBYIGRpbWVuc2lvbi4gSWYgPjAsXG4gICAgLy8gICAgICAgICAgICAgICAgIGdyb3dzIGJ5IHRoYXQgcGVyY2VudGFnZS4gSWYgPDAsIHNocmlua3MgYnkgdGhhdCBwZXJjZW50YWdlLlxuICAgIC8vICAgICAgICAgICAgICAgICBJZiAwLCByZW1haW5zIHVuY2hhbmdlZC5cbiAgICAvLyAgIHBjdFkgKG51bWJlcikgQSBwZXJjZW50YWdlIHRvIGdyb3cgb3Igc2hyaW5rIGluIHRoZSBZIGRpbWVuc2lvbi4gSWYgbm90XG4gICAgLy8gICAgICAgICAgICAgICAgIHNwZWNpZmllZCwgdXNlcyBwY3RYLlxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcGVyY2VudGFnZXMgYXBwbHkgdG8gdGhlIG1hcmdpbnMgYXMgd2VsbC5cbiAgICAvL1xuICAgIGdyb3dTdmcgKHBjdFgsIHBjdFkpIHtcbiAgICAgICAgcGN0WSA9IHBjdFkgPT09IHVuZGVmaW5lZCA/IHBjdFggOiBwY3RZO1xuICAgICAgICBsZXQgbXggPSAxICsgcGN0WCAvIDEwMC4wO1xuICAgICAgICBsZXQgbXkgPSAxICsgcGN0WSAvIDEwMC4wO1xuICAgICAgICBsZXQgc3ogPSB7XG4gICAgICAgICAgICB3aWR0aDogICAgICBteCAqIHRoaXMuc3ZnLndpZHRoLFxuICAgICAgICAgICAgbWxlZnQ6ICAgICAgbXggKiB0aGlzLnN2Zy5tbGVmdCxcbiAgICAgICAgICAgIG1yaWdodDogICAgIG14ICogdGhpcy5zdmcubXJpZ2h0LFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgbXkgKiB0aGlzLnN2Zy5oZWlnaHQsXG4gICAgICAgICAgICBtdG9wOiAgICAgICBteSAqIHRoaXMuc3ZnLm10b3AsXG4gICAgICAgICAgICBtYm90dG9tOiAgICBteSAqIHRoaXMuc3ZnLm1ib3R0b21cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRTdmdTaXplKHN6KTtcbiAgICB9XG5cbiAgICAvLyBTZXRzIHRoZSBzaXplIG9mIHRoZSBTVkcgZHJhd2luZyBhcmVhIGFuZCByZWRyYXdzIHRoZSBkaWFncmFtLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBzeiAob2JqKSBBbiBvYmplY3QgZGVmaW5pbmcgYW55L2FsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMuc3ZnLCB0byB3aXQ6XG4gICAgLy8gICAgICAgICAgICB3aWR0aCwgaGVpZ2h0LCBtbGVmdCwgbXJpZ2h0LCBtdG9wLCBtYm90dG9tXG4gICAgc2V0U3ZnU2l6ZSAoc3opIHtcbiAgICAgICAgY29weU9iaih0aGlzLnN2Zywgc3opO1xuICAgICAgICB0aGlzLmluaXRTdmcoKTtcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5yb290KTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyB0aGUgU1ZHIGRyYXdpbmcgYXJlYVxuICAgIGluaXRTdmcgKCkge1xuICAgICAgICAvLyBpbml0IHRoZSBTVkcgY29udGFpbmVyXG4gICAgICAgIHRoaXMudmlzID0gZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lciBzdmdcIilcbiAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgdGhpcy5zdmcud2lkdGggKyB0aGlzLnN2Zy5tbGVmdCArIHRoaXMuc3ZnLm1yaWdodClcbiAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIHRoaXMuc3ZnLmhlaWdodCArIHRoaXMuc3ZnLm10b3AgKyB0aGlzLnN2Zy5tYm90dG9tKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5kaWFsb2cuaGlkZSgpKVxuICAgICAgICAgIC5zZWxlY3QoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHRoaXMuc3ZnLm1sZWZ0ICsgXCIsXCIgKyB0aGlzLnN2Zy5tdG9wICsgXCIpXCIpO1xuXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MDA3ODc3L2hvdy10by11c2UtdGhlLWQzLWRpYWdvbmFsLWZ1bmN0aW9uLXRvLWRyYXctY3VydmVkLWxpbmVzXG4gICAgICAgIHRoaXMuZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAgICAgLnNvdXJjZShmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC5zb3VyY2UueSwgXCJ5XCI6ZC5zb3VyY2UueH07IH0pXG4gICAgICAgICAgICAudGFyZ2V0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnRhcmdldC55LCBcInlcIjpkLnRhcmdldC54fTsgfSlcbiAgICAgICAgICAgIC5wcm9qZWN0aW9uKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFtkLnksIGQueF07IH0pO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZXMgcG9zaXRpb25zIGZvciBub2RlcyBhbmQgcGF0aHMgZm9yIGxpbmtzLlxuICAgIGRvTGF5b3V0ICgpIHtcbiAgICAgIGxldCBsYXlvdXQ7XG4gICAgICAvL1xuICAgICAgbGV0IGxlYXZlcyA9IFtdO1xuICAgICAgZnVuY3Rpb24gbWQgKG4pIHsgLy8gbWF4IGRlcHRoXG4gICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID09PSAwKSBsZWF2ZXMucHVzaChuKTtcbiAgICAgICAgICByZXR1cm4gMSArIChuLmNoaWxkcmVuLmxlbmd0aCA/IE1hdGgubWF4LmFwcGx5KG51bGwsIG4uY2hpbGRyZW4ubWFwKG1kKSkgOiAwKTtcbiAgICAgIH07XG4gICAgICBsZXQgbWF4ZCA9IG1kKHRoaXMucm9vdCk7IC8vIG1heCBkZXB0aCwgMS1iYXNlZFxuXG4gICAgICAvL1xuICAgICAgaWYgKHRoaXMuZWRpdFZpZXcubGF5b3V0U3R5bGUgPT09IFwidHJlZVwiKSB7XG4gICAgICAgICAgLy8gZDMgbGF5b3V0IGFycmFuZ2VzIG5vZGVzIHRvcC10by1ib3R0b20sIGJ1dCB3ZSB3YW50IGxlZnQtdG8tcmlnaHQuXG4gICAgICAgICAgLy8gU28uLi5kbyB0aGUgbGF5b3V0LCByZXZlcnNpbmcgd2lkdGggYW5kIGhlaWdodC5cbiAgICAgICAgICAvLyBUaGVuIHJldmVyc2UgdGhlIHgseSBjb29yZHMgaW4gdGhlIHJlc3VsdHMuXG4gICAgICAgICAgdGhpcy5sYXlvdXQgPSBkMy5sYXlvdXQudHJlZSgpLnNpemUoW3RoaXMuc3ZnLmhlaWdodCwgdGhpcy5zdmcud2lkdGhdKTtcbiAgICAgICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5sYXlvdXQubm9kZXModGhpcy5yb290KS5yZXZlcnNlKCk7XG4gICAgICAgICAgLy8gUmV2ZXJzZSB4IGFuZCB5LiBBbHNvLCBub3JtYWxpemUgeCBmb3IgZml4ZWQtZGVwdGguXG4gICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7XG4gICAgICAgICAgICAgIGxldCBkeCA9IE1hdGgubWluKDE4MCwgdGhpcy5zdmcud2lkdGggLyBNYXRoLm1heCgxLG1heGQtMSkpXG4gICAgICAgICAgICAgIGQueCA9IGQuZGVwdGggKiBkeFxuICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZGVuZHJvZ3JhbVxuICAgICAgICAgIHRoaXMubGF5b3V0ID0gZDMubGF5b3V0LmNsdXN0ZXIoKVxuICAgICAgICAgICAgICAuc2VwYXJhdGlvbigoYSxiKSA9PiAxKVxuICAgICAgICAgICAgICAuc2l6ZShbdGhpcy5zdmcuaGVpZ2h0LCBNYXRoLm1pbih0aGlzLnN2Zy53aWR0aCwgbWF4ZCAqIDE4MCldKTtcbiAgICAgICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5sYXlvdXQubm9kZXModGhpcy5yb290KS5yZXZlcnNlKCk7XG4gICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKCBkID0+IHsgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7IH0pO1xuXG4gICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuXG4gICAgICAgICAgbGV0IHBvcyA9IGxlYXZlcy5tYXAoZnVuY3Rpb24obil7IHJldHVybiB7IHk6IG4ueSwgeTA6IG4ueTAgfTsgfSk7XG5cbiAgICAgICAgICBsZWF2ZXMuc29ydCh0aGlzLmVkaXRWaWV3Lm5vZGVDb21wKTtcblxuICAgICAgICAgIC8vIHJlYXNzaWduIHRoZSBZIHBvc2l0aW9uc1xuICAgICAgICAgIGxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uKG4sIGkpe1xuICAgICAgICAgICAgICBuLnkgPSBwb3NbaV0ueTtcbiAgICAgICAgICAgICAgbi55MCA9IHBvc1tpXS55MDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCBsZWF2ZXMgaGF2ZSBiZWVuIHJlYXJyYW5nZWQsIGJ1dCB0aGUgaW50ZXJpb3Igbm9kZXMgaGF2ZW4ndC5cbiAgICAgICAgICAvLyBIZXJlIHdlIG1vdmUgaW50ZXJpb3Igbm9kZXMgdXAgb3IgZG93biB0b3dhcmQgdGhlaXIgXCJjZW50ZXIgb2YgZ3Jhdml0eVwiIGFzIGRlZmluZWRcbiAgICAgICAgICAvLyBieSB0aGUgWS1wb3NpdGlvbnMgb2YgdGhlaXIgY2hpbGRyZW4uIEFwcGx5IHRoaXMgcmVjdXJzaXZlbHkgdXAgdGhlIHRyZWUuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBvY2N1cGllZCBwb3NpdGlvbnM6XG4gICAgICAgICAgbGV0IG9jY3VwaWVkID0ge30gOyAgLy8gb2NjdXBpZWRbeCBwb3NpdGlvbl0gPT0gW2xpc3Qgb2Ygbm9kZXNdXG4gICAgICAgICAgZnVuY3Rpb24gY29nIChuKSB7XG4gICAgICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbXB1dGUgbXkgYy5vLmcuIGFzIHRoZSBhdmVyYWdlIG9mIG15IGtpZHMnIHktcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICBsZXQgbXlDb2cgPSAobi5jaGlsZHJlbi5tYXAoY29nKS5yZWR1Y2UoKHQsYykgPT4gdCtjLCAwKSkvbi5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICBuLnkgPSBteUNvZztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgZGQgPSBvY2N1cGllZFtuLnhdID0gKG9jY3VwaWVkW24ueF0gfHwgW10pO1xuICAgICAgICAgICAgICBkZC5wdXNoKG4pO1xuICAgICAgICAgICAgICByZXR1cm4gbi55O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb2codGhpcy5yb290KTtcblxuICAgICAgICAgIC8vIElmIGludGVybWVkaWF0ZSBub2RlcyBhdCB0aGUgc2FtZSB4IG92ZXJsYXAsIHNwcmVhZCB0aGVtIG91dCBpbiB5LlxuICAgICAgICAgIGZvcihsZXQgeCBpbiBvY2N1cGllZCkge1xuICAgICAgICAgICAgICAvLyBnZXQgdGhlIG5vZGVzIGF0IHRoaXMgeC1yYW5rLCBhbmQgc29ydCBieSB5IHBvc2l0aW9uXG4gICAgICAgICAgICAgIGxldCBub2RlcyA9IG9jY3VwaWVkW3hdO1xuICAgICAgICAgICAgICBub2Rlcy5zb3J0KCAoYSxiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgICAgICAgICAgLy8gTm93IG1ha2UgYSBwYXNzIGFuZCBlbnN1cmUgdGhhdCBlYWNoIG5vZGUgaXMgc2VwYXJhdGVkIGZyb20gdGhlXG4gICAgICAgICAgICAgIC8vIHByZXZpb3VzIG5vZGUgYnkgYXQgbGVhc3QgTUlOU0VQXG4gICAgICAgICAgICAgIGxldCBwcmV2ID0gbnVsbDtcbiAgICAgICAgICAgICAgbGV0IE1JTlNFUCA9IDMwO1xuICAgICAgICAgICAgICBub2Rlcy5mb3JFYWNoKCBuID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcmV2ICYmIChuLnkgLSBwcmV2LnkgPCBNSU5TRVApKVxuICAgICAgICAgICAgICAgICAgICAgIG4ueSA9IHByZXYueSArIE1JTlNFUDtcbiAgICAgICAgICAgICAgICAgIHByZXYgPSBuO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgfVxuXG4gICAgICAvLyBzYXZlIGxpbmtzIGluIGdsb2JhbFxuICAgICAgdGhpcy5saW5rcyA9IHRoaXMubGF5b3V0LmxpbmtzKHRoaXMubm9kZXMpO1xuXG4gICAgICByZXR1cm4gW3RoaXMubm9kZXMsIHRoaXMubGlua3NdXG4gICAgfVxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyB1cGRhdGUoc291cmNlKVxuICAgIC8vIFRoZSBtYWluIGRyYXdpbmcgcm91dGluZS5cbiAgICAvLyBVcGRhdGVzIHRoZSBTVkcsIHVzaW5nIHNvdXJjZSAoYSBOb2RlKSBhcyB0aGUgZm9jdXMgb2YgYW55IGVudGVyaW5nL2V4aXRpbmcgYW5pbWF0aW9ucy5cbiAgICAvL1xuICAgIHVwZGF0ZSAoc291cmNlKSB7XG4gICAgICAvL1xuICAgICAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgdGhpcy5lZGl0Vmlldy5uYW1lKTtcblxuICAgICAgZDMuc2VsZWN0KFwiI3VuZG9CdXR0b25cIilcbiAgICAgICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdGhpcy51bmRvTWdyLmNhblVuZG8pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3IuY2FuVW5kbyAmJiB0aGlzLmVkaXRUZW1wbGF0ZSh0aGlzLnVuZG9NZ3IudW5kb1N0YXRlKCksIHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgZDMuc2VsZWN0KFwiI3JlZG9CdXR0b25cIilcbiAgICAgICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdGhpcy51bmRvTWdyLmNhblJlZG8pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3IuY2FuUmVkbyAmJiB0aGlzLmVkaXRUZW1wbGF0ZSh0aGlzLnVuZG9NZ3IucmVkb1N0YXRlKCksIHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgLy9cbiAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICAgIHRoaXMudXBkYXRlTm9kZXModGhpcy5ub2Rlcywgc291cmNlKTtcbiAgICAgIHRoaXMudXBkYXRlTGlua3ModGhpcy5saW5rcywgc291cmNlKTtcbiAgICAgIHRoaXMudXBkYXRlVHRleHQodGhpcy5jdXJyVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8vXG4gICAgdXBkYXRlTm9kZXMgKG5vZGVzLCBzb3VyY2UpIHtcbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGxldCBub2RlR3JwcyA9IHRoaXMudmlzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBub2RlcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gICAgICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgbiA9PiBuLnBhdGgucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueDAgKyBcIixcIiArIHNvdXJjZS55MCArIFwiKVwiOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgbGV0IGNsaWNrTm9kZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuICAgICAgICAgIGlmIChzZWxmLmRpYWxvZy5jdXJyTm9kZSAhPT0gbikgc2VsZi5kaWFsb2cuc2hvdyhuLCB0aGlzKTtcbiAgICAgICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH07XG4gICAgICAvLyBBZGQgZ2x5cGggZm9yIHRoZSBub2RlXG4gICAgICBub2RlRW50ZXIuYXBwZW5kKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgIGxldCBzaGFwZSA9IChkLnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIiA/IFwicmVjdFwiIDogXCJjaXJjbGVcIik7XG4gICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIHNoYXBlKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlXCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgY2xpY2tOb2RlKTtcbiAgICAgIG5vZGVFbnRlci5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgICAgICAuYXR0cihcInJcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgICAgIDtcbiAgICAgIG5vZGVFbnRlci5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIC04LjUpXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIC04LjUpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgICAgIDtcblxuICAgICAgLy8gQWRkIHRleHQgZm9yIG5vZGUgbmFtZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuY2hpbGRyZW4gPyAtMTAgOiAxMDsgfSlcbiAgICAgICAgICAuYXR0cihcImR5XCIsIFwiLjM1ZW1cIilcbiAgICAgICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIG5lYXJseSB0cmFuc3BhcmVudFxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVOYW1lXCIpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBQbGFjZWhvbGRlciBmb3IgaWNvbi90ZXh0IHRvIGFwcGVhciBpbnNpZGUgbm9kZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGVJY29uJylcbiAgICAgICAgICAuYXR0cignZHknLCA1KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gQWRkIG5vZGUgaGFuZGxlXG4gICAgICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnaGFuZGxlJylcbiAgICAgICAgICAuYXR0cignZHgnLCAxMClcbiAgICAgICAgICAuYXR0cignZHknLCA1KVxuICAgICAgICAgIDtcblxuICAgICAgbGV0IG5vZGVVcGRhdGUgPSBub2RlR3Jwc1xuICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgbiA9PiBuLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgLmNsYXNzZWQoXCJjb25zdHJhaW5lZFwiLCBuID0+IG4uY29uc3RyYWludHMubGVuZ3RoID4gMClcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRlZFwiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQubGV2ZWwgPj0gMClcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRlZGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRkZXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJkZXNjXCIpXG4gICAgICAgIC8vIFRyYW5zaXRpb24gbm9kZXMgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24obikgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBuLnggKyBcIixcIiArIG4ueSArIFwiKVwiOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0LmhhbmRsZVwiKVxuICAgICAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAgICAgLnRleHQodGhpcy5lZGl0Vmlldy5oYW5kbGVJY29uLnRleHQgfHwgXCJcIilcbiAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24uc3Ryb2tlIHx8IG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi5maWxsIHx8IG51bGwpO1xuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0Lm5vZGVJY29uXCIpXG4gICAgICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgdGhpcy5lZGl0Vmlldy5ub2RlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAgICAgLnRleHQodGhpcy5lZGl0Vmlldy5ub2RlSWNvbi50ZXh0IHx8IFwiXCIpXG4gICAgICAgICAgO1xuXG4gICAgICBkMy5zZWxlY3RBbGwoXCIubm9kZUljb25cIilcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBjbGlja05vZGUpO1xuXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdEFsbChcInRleHQubm9kZU5hbWVcIilcbiAgICAgICAgICAudGV4dChuID0+IG4ubmFtZSk7XG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBNYWtlIHNlbGVjdGVkIG5vZGVzIGRyYWdnYWJsZS5cbiAgICAgIC8vIENsZWFyIG91dCBhbGwgZXhpdGluZyBkcmFnIGhhbmRsZXJzXG4gICAgICBkMy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIGZhbHNlKVxuICAgICAgICAgIC5vbihcIi5kcmFnXCIsIG51bGwpO1xuICAgICAgLy8gTm93IG1ha2UgZXZlcnl0aGluZyBkcmFnZ2FibGUgdGhhdCBzaG91bGQgYmVcbiAgICAgIGlmICh0aGlzLmVkaXRWaWV3LmRyYWdnYWJsZSlcbiAgICAgICAgICBkMy5zZWxlY3RBbGwodGhpcy5lZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIHRydWUpXG4gICAgICAgICAgICAgIC5jYWxsKHRoaXMuZHJhZ0JlaGF2aW9yKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIC8vIEFkZCB0ZXh0IGZvciBjb25zdHJhaW50c1xuICAgICAgbGV0IGN0ID0gbm9kZUdycHMuc2VsZWN0QWxsKFwidGV4dC5jb25zdHJhaW50XCIpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24obil7IHJldHVybiBuLmNvbnN0cmFpbnRzOyB9KTtcbiAgICAgIGN0LmVudGVyKCkuYXBwZW5kKFwic3ZnOnRleHRcIikuYXR0cihcImNsYXNzXCIsIFwiY29uc3RyYWludFwiKTtcbiAgICAgIGN0LmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIGN0LnRleHQoIGMgPT4gYy5sYWJlbFRleHQgKVxuICAgICAgICAgICAuYXR0cihcInhcIiwgMClcbiAgICAgICAgICAgLmF0dHIoXCJkeVwiLCAoYyxpKSA9PiBgJHsoaSsxKSoxLjd9ZW1gKVxuICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsXCJzdGFydFwiKVxuICAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byBmdWxsIHNpemVcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDguNSApXG4gICAgICAgICAgO1xuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxNyApXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMTcgKVxuICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIGZ1bGx5IG9wYXF1ZVxuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDEpXG4gICAgICAgICAgO1xuXG4gICAgICAvL1xuICAgICAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gICAgICBsZXQgbm9kZUV4aXQgPSBub2RlR3Jwcy5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueCArIFwiLFwiICsgc291cmNlLnkgKyBcIilcIjsgfSlcbiAgICAgICAgICAucmVtb3ZlKClcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byB0aW55IHJhZGl1c1xuICAgICAgbm9kZUV4aXQuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gdHJhbnNwYXJlbnRcbiAgICAgIG5vZGVFeGl0LnNlbGVjdChcInRleHRcIilcbiAgICAgICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNilcbiAgICAgICAgICA7XG4gICAgICAvLyBTdGFzaCB0aGUgb2xkIHBvc2l0aW9ucyBmb3IgdHJhbnNpdGlvbi5cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICBkLngwID0gZC54O1xuICAgICAgICBkLnkwID0gZC55O1xuICAgICAgfSk7XG4gICAgICAvL1xuXG4gICAgfVxuXG4gICAgLy9cbiAgICB1cGRhdGVMaW5rcyAobGlua3MsIHNvdXJjZSkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBsZXQgbGluayA9IHRoaXMudmlzLnNlbGVjdEFsbChcInBhdGgubGlua1wiKVxuICAgICAgICAgIC5kYXRhKGxpbmtzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC5pZDsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIEVudGVyIGFueSBuZXcgbGlua3MgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICAgICAgbGV0IG5ld1BhdGhzID0gbGluay5lbnRlcigpLmluc2VydChcInN2ZzpwYXRoXCIsIFwiZ1wiKTtcbiAgICAgIGxldCBsaW5rVGl0bGUgPSBmdW5jdGlvbihsKXtcbiAgICAgICAgICBsZXQgY2xpY2sgPSBcIlwiO1xuICAgICAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kICE9PSBcImF0dHJpYnV0ZVwiKXtcbiAgICAgICAgICAgICAgY2xpY2sgPSBgQ2xpY2sgdG8gbWFrZSB0aGlzIHJlbGF0aW9uc2hpcCAke2wudGFyZ2V0LmpvaW4gPyBcIlJFUVVJUkVEXCIgOiBcIk9QVElPTkFMXCJ9LiBgO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgYWx0Y2xpY2sgPSBcIkFsdC1jbGljayB0byBjdXQgbGluay5cIjtcbiAgICAgICAgICByZXR1cm4gY2xpY2sgKyBhbHRjbGljaztcbiAgICAgIH1cbiAgICAgIC8vIHNldCB0aGUgdG9vbHRpcFxuICAgICAgbmV3UGF0aHMuYXBwZW5kKFwic3ZnOnRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgIG5ld1BhdGhzXG4gICAgICAgICAgLmF0dHIoXCJ0YXJnZXRcIiwgZCA9PiBkLnRhcmdldC5pZC5yZXBsYWNlKC9cXC4vZywgXCJfXCIpKVxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5rXCIpXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGxldCBvID0ge3g6IHNvdXJjZS54MCwgeTogc291cmNlLnkwfTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNsYXNzZWQoXCJhdHRyaWJ1dGVcIiwgZnVuY3Rpb24obCkgeyByZXR1cm4gbC50YXJnZXQucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIjsgfSlcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihsKXtcbiAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICAgICAgLy8gYSBzaGlmdC1jbGljayBjdXRzIHRoZSB0cmVlIGF0IHRoaXMgZWRnZVxuICAgICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVOb2RlKGwudGFyZ2V0KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgLy8gcmVndWxhciBjbGljayBvbiBhIHJlbGF0aW9uc2hpcCBlZGdlIGludmVydHMgd2hldGhlclxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGpvaW4gaXMgaW5uZXIgb3Igb3V0ZXIuXG4gICAgICAgICAgICAgICAgICBsLnRhcmdldC5qb2luID0gKGwudGFyZ2V0LmpvaW4gPyBudWxsIDogXCJvdXRlclwiKTtcbiAgICAgICAgICAgICAgICAgIC8vIHJlLXNldCB0aGUgdG9vbHRpcFxuICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcInRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgICAgICAgICAgICAgIC8vIGlmIG91dGVyIGpvaW4sIHJlbW92ZSBhbnkgc29ydCBvcmRlcnMgaW4gbiBvciBkZXNjZW5kYW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LmpvaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgcnNvID0gZnVuY3Rpb24obSkgeyAvLyByZW1vdmUgc29ydCBvcmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtLnNldFNvcnQoXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNoaWxkcmVuLmZvckVhY2gocnNvKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgcnNvKGwudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGwuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobC5zb3VyY2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5hdHRyKFwiZFwiLCB0aGlzLmRpYWdvbmFsKVxuICAgICAgICAgIDtcblxuXG4gICAgICAvLyBUcmFuc2l0aW9uIGxpbmtzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAgIGxpbmsuY2xhc3NlZChcIm91dGVyXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4udGFyZ2V0LmpvaW4gPT09IFwib3V0ZXJcIjsgfSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIHRoaXMuZGlhZ29uYWwpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgICAgIGxpbmsuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBsZXQgbyA9IHt4OiBzb3VyY2UueCwgeTogc291cmNlLnl9O1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAucmVtb3ZlKClcbiAgICAgICAgICA7XG5cbiAgICB9XG4gICAgLy9cbiAgICB1cGRhdGVUdGV4dCAodCkge1xuICAgICAgLy9cbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGxldCB0aXRsZSA9IHRoaXMudmlzLnNlbGVjdEFsbChcIiNxdGl0bGVcIilcbiAgICAgICAgICAuZGF0YShbdGhpcy5jdXJyVGVtcGxhdGUudGl0bGVdKTtcbiAgICAgIHRpdGxlLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsXCJxdGl0bGVcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgLTQwKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCAxNSlcbiAgICAgICAgICA7XG4gICAgICB0aXRsZS5odG1sKHQgPT4ge1xuICAgICAgICAgIGxldCBwYXJ0cyA9IHQuc3BsaXQoLygtLT4pLyk7XG4gICAgICAgICAgcmV0dXJuIHBhcnRzLm1hcCgocCxpKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwID09PSBcIi0tPlwiKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8dHNwYW4geT0xMCBmb250LWZhbWlseT1cIk1hdGVyaWFsIEljb25zXCI+JHtjb2RlcG9pbnRzWydmb3J3YXJkJ119PC90c3Bhbj5gXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9ND4ke3B9PC90c3Bhbj5gXG4gICAgICAgICAgfSkuam9pbihcIlwiKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1xuICAgICAgbGV0IHR4dCA9IGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSA/IHQuZ2V0SnNvbigpIDogdC5nZXRYbWwoKTtcbiAgICAgIC8vXG4gICAgICAvL1xuICAgICAgZDMuc2VsZWN0KFwiI3R0ZXh0ZGl2XCIpXG4gICAgICAgICAgLnRleHQodHh0KVxuICAgICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIC8vXG4gICAgICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgICAgIHNlbGYudXBkYXRlQ291bnQodCk7XG4gICAgfVxuXG4gICAgcnVuYXRtaW5lICh0KSB7XG4gICAgICBsZXQgdWN0ID0gdC51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICAgICAgbGV0IHR4dCA9IHQuZ2V0WG1sKCk7XG4gICAgICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gICAgICBsZXQgbGlua3VybCA9IHRoaXMuY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgICAgIGxldCBlZGl0dXJsID0gbGlua3VybCArIFwiJnF1ZXJ5PVwiICsgdXJsVHh0O1xuICAgICAgbGV0IHJ1bnVybCA9IGxpbmt1cmwgKyBcIiZza2lwQnVpbGRlcj10cnVlJnF1ZXJ5PVwiICsgdXJsVHh0O1xuICAgICAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ291bnQgKHQpIHtcbiAgICAgIGxldCB1Y3QgPSB0LnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgICBsZXQgcXR4dCA9IHQuZ2V0WG1sKHRydWUpO1xuICAgICAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudChxdHh0KTtcbiAgICAgIGxldCBjb3VudFVybCA9IHRoaXMuY3Vyck1pbmUudXJsICsgYC9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JHt1cmxUeHR9JmZvcm1hdD1jb3VudGA7XG4gICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gICAgICBkM2pzb25Qcm9taXNlKGNvdW50VXJsKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG4pe1xuICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgc3BhbicpLnRleHQobilcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCB0cnVlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6OlwiLCBxdHh0KVxuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJ1bmF0cWIgKHQpIHtcbiAgICAgIGxldCBxanNvbiA9IHQuZ2V0SnNvbih0cnVlKTtcbiAgICAgIGNvbnNvbGUubG9nKHFqc29uKTtcblxuICAgICAgbGV0IHNlcnZpY2UgPSB7IHJvb3Q6IHRoaXMuY3Vyck1pbmUudXJsICsgJy9zZXJ2aWNlJyB9O1xuICAgICAgaW10YWJsZXMuY29uZmlndXJlKCdEZWZhdWx0UGFnZVNpemUnLCAxMCk7XG4gICAgICBpbXRhYmxlcy5jb25maWd1cmUoJ1RhYmxlUmVzdWx0cy5DYWNoZUZhY3RvcicsIDIwKTtcbiAgICAgIGltdGFibGVzLmNvbmZpZ3VyZSgnVGFibGVDZWxsLkluZGljYXRlT2ZmSG9zdExpbmtzJywgZmFsc2UpO1xuXG4gICAgICBpbXRhYmxlcy5sb2FkVGFibGUoXG4gICAgICAgICcjaW1UYWJsZXNRdWVyeScsXG4gICAgICAgIHtzdGFydDogMCwgc2l6ZTogMTB9LFxuICAgICAgICB7c2VydmljZTogc2VydmljZSwgcXVlcnk6IHFqc29ufVxuICAgICAgKS50aGVuKFxuICAgICAgICBmdW5jdGlvbiAodGFibGUpIHsgY29uc29sZS5sb2coJ1RhYmxlIGxvYWRlZCcsIHRhYmxlKTsgfSxcbiAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBsb2FkIHRhYmxlJywgZXJyb3IpOyB9XG4gICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgUUJFZGl0b3IgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3FiZWRpdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFVuZG9NYW5hZ2VyIG1haW50YWlucyBhIGhpc3Rvcnkgc3RhY2sgb2Ygc3RhdGVzIChhcmJpdHJhcnkgb2JqZWN0cykuXG4vL1xuY2xhc3MgVW5kb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxpbWl0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgY2xlYXIgKCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludGVyID0gLTE7XG4gICAgfVxuICAgIGdldCBjdXJyZW50U3RhdGUgKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyIDwgMClcbiAgICAgICAgICAgIHRocm93IFwiTm8gY3VycmVudCBzdGF0ZS5cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICBnZXQgaGFzU3RhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID49IDA7XG4gICAgfVxuICAgIGdldCBjYW5VbmRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+IDA7XG4gICAgfVxuICAgIGdldCBjYW5SZWRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU3RhdGUgJiYgdGhpcy5wb2ludGVyIDwgdGhpcy5oaXN0b3J5Lmxlbmd0aC0xO1xuICAgIH1cbiAgICBhZGQgKHMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFERFwiKTtcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdID0gcztcbiAgICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSh0aGlzLnBvaW50ZXIrMSk7XG4gICAgfVxuICAgIHVuZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVU5ET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5VbmRvKSB0aHJvdyBcIk5vIHVuZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgcmVkbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRURPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblJlZG8pIHRocm93IFwiTm8gcmVkby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHNhdmVTdGF0ZSAobikge1xuICAgICAgICBsZXQgcyA9IEpTT04uc3RyaW5naWZ5KG4udGVtcGxhdGUudW5jb21waWxlVGVtcGxhdGUoKSk7XG4gICAgICAgIGlmICghdGhpcy5oYXNTdGF0ZSB8fCB0aGlzLmN1cnJlbnRTdGF0ZSAhPT0gcylcbiAgICAgICAgICAgIC8vIG9ubHkgc2F2ZSBzdGF0ZSBpZiBpdCBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgdGhpcy5hZGQocyk7XG4gICAgfVxuICAgIHVuZG9TdGF0ZSAoKSB7XG4gICAgICAgIHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHRoaXMudW5kbygpKTsgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7IGNvbnNvbGUubG9nKGVycik7IH1cbiAgICB9XG4gICAgcmVkb1N0YXRlICgpIHtcbiAgICAgICAgdHJ5IHsgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5yZWRvKCkpOyB9XG4gICAgICAgIGNhdGNoIChlcnIpIHsgY29uc29sZS5sb2coZXJyKTsgfVxuICAgIH1cbn1cblxuLy9cbmZ1bmN0aW9uIHVuZG8oKSB7IHVuZG9yZWRvKFwidW5kb1wiKSB9XG5mdW5jdGlvbiByZWRvKCkgeyB1bmRvcmVkbyhcInJlZG9cIikgfVxuZnVuY3Rpb24gdW5kb3JlZG8od2hpY2gpe1xufVxuXG5leHBvcnQgeyBVbmRvTWFuYWdlciB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgZXNjLCBkZWVwYyB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHBhcnNlciBmcm9tICcuL3BhcnNlci5qcyc7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi9ub2RlLmpzJztcbmltcG9ydCB7IENvbnN0cmFpbnQgfSBmcm9tICcuL2NvbnN0cmFpbnQuanMnO1xuXG5jbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IgKHQsIG1vZGVsKSB7XG4gICAgICAgIHQgPSB0IHx8IHt9XG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICAgICAgdGhpcy5uYW1lID0gdC5uYW1lIHx8IFwiXCI7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0LnRpdGxlIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdCA9IHQuc2VsZWN0ID8gZGVlcGModC5zZWxlY3QpIDogW107XG4gICAgICAgIHRoaXMud2hlcmUgPSB0LndoZXJlID8gdC53aGVyZS5tYXAoIGMgPT4ge1xuICAgICAgICAgICAgbGV0IGNjID0gbmV3IENvbnN0cmFpbnQoYykgO1xuICAgICAgICAgICAgY2Mubm9kZSA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gY2M7XG4gICAgICAgIH0pIDogW107XG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5qb2lucyA9IHQuam9pbnMgPyBkZWVwYyh0LmpvaW5zKSA6IFtdO1xuICAgICAgICB0aGlzLnRhZ3MgPSB0LnRhZ3MgPyBkZWVwYyh0LnRhZ3MpIDogW107XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IHQub3JkZXJCeSA/IGRlZXBjKHQub3JkZXJCeSkgOiBbXTtcbiAgICAgICAgdGhpcy5jb21waWxlKCk7XG4gICAgfVxuXG4gICAgY29tcGlsZSAoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IHJvb3RzID0gW11cbiAgICAgICAgbGV0IHQgPSB0aGlzO1xuICAgICAgICAvLyB0aGUgdHJlZSBvZiBub2RlcyByZXByZXNlbnRpbmcgdGhlIGNvbXBpbGVkIHF1ZXJ5IHdpbGwgZ28gaGVyZVxuICAgICAgICB0LnF0cmVlID0gbnVsbDtcbiAgICAgICAgLy8gaW5kZXggb2YgY29kZSB0byBjb25zdHJhaW50IGdvcnMgaGVyZS5cbiAgICAgICAgdC5jb2RlMmMgPSB7fVxuICAgICAgICAvLyBub3JtYWxpemUgdGhpbmdzIHRoYXQgbWF5IGJlIHVuZGVmaW5lZFxuICAgICAgICB0LmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICAgICAgdC5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHN1YmNsYXNzQ3MgPSBbXTtcbiAgICAgICAgdC53aGVyZSA9ICh0LndoZXJlIHx8IFtdKS5tYXAoYyA9PiB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHJhdyBjb250cmFpbnQgY29uZmlncyB0byBDb25zdHJhaW50IG9iamVjdHMuXG4gICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgIGlmIChjYy5jb2RlKSB0LmNvZGUyY1tjYy5jb2RlXSA9IGNjO1xuICAgICAgICAgICAgY2MuY3R5cGUgPT09IFwic3ViY2xhc3NcIiAmJiBzdWJjbGFzc0NzLnB1c2goY2MpO1xuICAgICAgICAgICAgcmV0dXJuIGNjO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBtdXN0IHByb2Nlc3MgYW55IHN1YmNsYXNzIGNvbnN0cmFpbnRzIGZpcnN0LCBmcm9tIHNob3J0ZXN0IHRvIGxvbmdlc3QgcGF0aFxuICAgICAgICBzdWJjbGFzc0NzXG4gICAgICAgICAgICAuc29ydChmdW5jdGlvbihhLGIpe1xuICAgICAgICAgICAgICAgIHJldHVybiBhLnBhdGgubGVuZ3RoIC0gYi5wYXRoLmxlbmd0aDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgoYy5wYXRoKTtcbiAgICAgICAgICAgICAgICAgbGV0IGNscyA9IHNlbGYubW9kZWwuY2xhc3Nlc1tjLnR5cGVdO1xuICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIGMudHlwZTtcbiAgICAgICAgICAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgdC53aGVyZSAmJiB0LndoZXJlLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChjLnBhdGgpO1xuICAgICAgICAgICAgaWYgKG4uY29uc3RyYWludHMpXG4gICAgICAgICAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKGMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbi5jb25zdHJhaW50cyA9IFtjXTtcbiAgICAgICAgfSlcblxuICAgICAgICAvL1xuICAgICAgICB0LnNlbGVjdCAmJiB0LnNlbGVjdC5mb3JFYWNoKGZ1bmN0aW9uKHAsaSl7XG4gICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChwKTtcbiAgICAgICAgICAgIG4uc2VsZWN0KCk7XG4gICAgICAgIH0pXG4gICAgICAgIHQuam9pbnMgJiYgdC5qb2lucy5mb3JFYWNoKGZ1bmN0aW9uKGope1xuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgoaik7XG4gICAgICAgICAgICBuLmpvaW4gPSBcIm91dGVyXCI7XG4gICAgICAgIH0pXG4gICAgICAgIHQub3JkZXJCeSAmJiB0Lm9yZGVyQnkuZm9yRWFjaChmdW5jdGlvbihvLCBpKXtcbiAgICAgICAgICAgIGxldCBwID0gT2JqZWN0LmtleXMobylbMF1cbiAgICAgICAgICAgIGxldCBkaXIgPSBvW3BdXG4gICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChwKTtcbiAgICAgICAgICAgIG4uc29ydCA9IHsgZGlyOiBkaXIsIGxldmVsOiBpIH07XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXQucXRyZWUpIHtcbiAgICAgICAgICAgIHRocm93IFwiTm8gcGF0aHMgaW4gcXVlcnkuXCJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB0ZW1wbGF0ZSBhcyBhIHNpbXBsZSBqc29uIG9iamVjdC5cbiAgICAvL1xuICAgIHVuY29tcGlsZVRlbXBsYXRlICgpe1xuICAgICAgICBsZXQgdG1wbHQgPSB0aGlzO1xuICAgICAgICBsZXQgdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IHRtcGx0Lm5hbWUsXG4gICAgICAgICAgICB0aXRsZTogdG1wbHQudGl0bGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdG1wbHQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBjb21tZW50OiB0bXBsdC5jb21tZW50LFxuICAgICAgICAgICAgcmFuazogdG1wbHQucmFuayxcbiAgICAgICAgICAgIG1vZGVsOiB7IG5hbWU6IHRtcGx0Lm1vZGVsLm5hbWUgfSxcbiAgICAgICAgICAgIHRhZ3M6IGRlZXBjKHRtcGx0LnRhZ3MpLFxuICAgICAgICAgICAgc2VsZWN0IDogdG1wbHQuc2VsZWN0LmNvbmNhdCgpLFxuICAgICAgICAgICAgd2hlcmUgOiBbXSxcbiAgICAgICAgICAgIGpvaW5zIDogW10sXG4gICAgICAgICAgICBjb25zdHJhaW50TG9naWM6IHRtcGx0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiLFxuICAgICAgICAgICAgb3JkZXJCeSA6IFtdXG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcmVhY2gobil7XG4gICAgICAgICAgICBsZXQgcCA9IG4ucGF0aFxuICAgICAgICAgICAgaWYgKG4uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIC8vIHBhdGggc2hvdWxkIGFscmVhZHkgYmUgdGhlcmVcbiAgICAgICAgICAgICAgICBpZiAodC5zZWxlY3QuaW5kZXhPZihuLnBhdGgpID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJBbm9tYWx5IGRldGVjdGVkIGluIHNlbGVjdCBsaXN0LlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKG4uY29uc3RyYWludHMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgICAgICBjYy5ub2RlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgdC53aGVyZS5wdXNoKGNjKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmIChuLmpvaW4gPT09IFwib3V0ZXJcIikge1xuICAgICAgICAgICAgICAgIHQuam9pbnMucHVzaChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcyA9IHt9XG4gICAgICAgICAgICAgICAgc1twXSA9IG4uc29ydC5kaXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0Lm9yZGVyQnlbbi5zb3J0LmxldmVsXSA9IHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVhY2gpO1xuICAgICAgICB9XG4gICAgICAgIHJlYWNoKHRtcGx0LnF0cmVlKTtcbiAgICAgICAgdC5vcmRlckJ5ID0gdC5vcmRlckJ5LmZpbHRlcihvID0+IG8pO1xuICAgICAgICByZXR1cm4gdFxuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIE5vZGUgYXQgcGF0aCBwLCBvciBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IGV4aXN0IGluIHRoZSBjdXJyZW50IHF0cmVlLlxuICAgIC8vXG4gICAgZ2V0Tm9kZUJ5UGF0aCAocCkge1xuICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgIGlmICghcCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7XG4gICAgICAgIGlmIChuLm5hbWUgIT09IHBhcnRzWzBdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY25hbWUgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGxldCBjID0gKG4uY2hpbGRyZW4gfHwgW10pLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gY25hbWUpWzBdO1xuICAgICAgICAgICAgaWYgKCFjKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIG4gPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIC8vIEFkZHMgYSBwYXRoIHRvIHRoZSBxdHJlZSBmb3IgdGhpcyB0ZW1wbGF0ZS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgcGF0aCAoc3RyaW5nKSB0aGUgcGF0aCB0byBhZGQuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC5cbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBDcmVhdGVzIG5ldyBub2RlcyBhcyBuZWVkZWQgYW5kIGFkZHMgdGhlbSB0byB0aGUgcXRyZWUuXG4gICAgYWRkUGF0aCAocGF0aCl7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBjbGFzc2VzID0gdGhpcy5tb2RlbC5jbGFzc2VzO1xuICAgICAgICBsZXQgbGFzdHQgPSBudWxsO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIGxldCBjbHM7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgICAgICBsZXQgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBtZW1iZXIgbmFtZWQgXCIgKyBwICsgXCIgaW4gY2xhc3MgXCIgKyBjbHMubmFtZSArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSwgYWRkIGl0IHRvIG4ncyBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBubiA9IG5ldyBOb2RlKHRlbXBsYXRlLCBuLCBwLCB4LCBjbHMpO1xuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIHJldHVybiB0aGUgbGFzdCBub2RlIGluIHRoZSBwYXRoXG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbiAgICAvLyB1c2VkIGluIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIG5leHRBdmFpbGFibGVDb2RlICgpe1xuICAgICAgICBmb3IobGV0IGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAgICAgICAgIGlmICghIChjIGluIHRoaXMuY29kZTJjKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxuXG4gICAgLy8gU2V0cyB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGlzIHRlbXBsYXRlLlxuICAgIC8vIEluIHRoZSBwcm9jZXNzLCBhbHNvIFwiY29ycmVjdHNcIiB0aGUgZXhwcmVzc2lvbiBhcyBmb2xsb3dzOlxuICAgIC8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbiAgICAvLyAgICAgIGFueSBjb25zdHJhaW50IGluIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFyZSByZW1vdmVkIGFuZCB0aGVcbiAgICAvLyAgICAgIGV4cHJlc3Npb24gbG9naWMgdXBkYXRlZCBhY2NvcmRpbmdseVxuICAgIC8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbiAgICAvLyAgICAgIGFyZSBBTkRlZCB0byB0aGUgZW5kLlxuICAgIC8vIEZvciBleGFtcGxlLCBpZiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoYXMgY29kZXMgQSwgQiwgYW5kIEMsIGFuZFxuICAgIC8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4gICAgLy8gYWRkZWQsIHJlc3VsdGluZyBpbiBcIkEgYW5kIEIgYW5kIENcIi5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuICAgIC8vXG4gICAgc2V0TG9naWNFeHByZXNzaW9uIChleCkge1xuICAgICAgICBleCA9IGV4ID8gZXggOiAodGhpcy5jb25zdHJhaW50TG9naWMgfHwgXCJcIilcbiAgICAgICAgbGV0IGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICAgICAgbGV0IHNlZW4gPSBbXTtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgZnVuY3Rpb24gcmVhY2gobixsZXYpe1xuICAgICAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuXG4gICAgICAgICAgICAgICAgLy8gSWYgbm90LCByZW1vdmUgaXQgZnJvbSB0aGUgZXhwci5cbiAgICAgICAgICAgICAgICAvLyBBbHNvIHJlbW92ZSBpdCBpZiBpdCdzIHRoZSBjb2RlIGZvciBhIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChuIGluIHRtcGx0LmNvZGUyYyAmJiB0bXBsdC5jb2RlMmNbbl0uY3R5cGUgIT09IFwic3ViY2xhc3NcIikgPyBuIDogXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgICAgICBsZXQgY21zcyA9IGNtcy5qb2luKFwiIFwiK24ub3ArXCIgXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGNtcy5sZW5ndGggPT09IDAgPyBcIlwiIDogbGV2ID09PSAwIHx8IGNtcy5sZW5ndGggPT09IDEgPyBjbXNzIDogXCIoXCIgKyBjbXNzICsgXCIpXCJcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXN0ID0gZXggPyBwYXJzZXIucGFyc2UoZXgpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBhbGVydChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RyYWludExvZ2ljO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBsZXggPSBhc3QgPyByZWFjaChhc3QsMCkgOiBcIlwiO1xuICAgICAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAgICAgLy8gQU5EIHRoZW0gaW50byB0aGUgZXhwcmVzc2lvbiAoZXhjZXB0IElTQSBjb25zdHJhaW50cykuXG4gICAgICAgIGxldCB0b0FkZCA9IE9iamVjdC5rZXlzKHRoaXMuY29kZTJjKS5maWx0ZXIoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICByZXR1cm4gc2Vlbi5pbmRleE9mKGMpID09PSAtMSAmJiBjLm9wICE9PSBcIklTQVwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0b0FkZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgaWYoYXN0ICYmIGFzdC5vcCAmJiBhc3Qub3AgPT09IFwib3JcIilcbiAgICAgICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgICAgICBpZiAobGV4KSB0b0FkZC51bnNoaWZ0KGxleCk7XG4gICAgICAgICAgICAgbGV4ID0gdG9BZGQuam9pbihcIiBhbmQgXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gbGV4O1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gbGV4OyB9KTtcblxuICAgICAgICByZXR1cm4gbGV4O1xuICAgIH1cblxuICAgIC8vXG4gICAgZ2V0WG1sIChxb25seSkge1xuICAgICAgICBsZXQgdCA9IHRoaXMudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgICAgbGV0IHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7XG4gICAgICAgICAgICBsZXQgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICAgICAgbGV0IHYgPSB4W2tdXG4gICAgICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICAgICAgfSwgXCJcIik7XG5cbiAgICAgICAgLy8gQ29udmVydHMgYW4gb3V0ZXIgam9pbiBwYXRoIHRvIHhtbC5cbiAgICAgICAgZnVuY3Rpb24gb2oyeG1sKG9qKXtcbiAgICAgICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBxdWVyeSBwYXJ0XG4gICAgICAgIGxldCBxcGFydCA9XG4gICAgYDxxdWVyeVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICBtb2RlbD1cIiR7KHQubW9kZWwgJiYgdC5tb2RlbC5uYW1lKSB8fCAnJ31cIlxuICAgICAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gICAgICBsb25nRGVzY3JpcHRpb249XCIke2VzYyh0LmRlc2NyaXB0aW9uIHx8ICcnKX1cIlxuICAgICAgc29ydE9yZGVyPVwiJHtzbyB8fCAnJ31cIlxuICAgICAgJHt0LmNvbnN0cmFpbnRMb2dpYyAmJiAnY29uc3RyYWludExvZ2ljPVwiJyt0LmNvbnN0cmFpbnRMb2dpYysnXCInIHx8ICcnfVxuICAgID5cbiAgICAgICR7KHQuam9pbnMgfHwgW10pLm1hcChvajJ4bWwpLmpvaW4oXCIgXCIpfVxuICAgICAgJHsodC53aGVyZSB8fCBbXSkubWFwKGMgPT4gYy5jMnhtbChxb25seSkpLmpvaW4oXCIgXCIpfVxuICAgIDwvcXVlcnk+YDtcbiAgICAgICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgICAgIGxldCB0bXBsdCA9XG4gICAgYDx0ZW1wbGF0ZVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gICAgICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAgICAgJHtxcGFydH1cbiAgICA8L3RlbXBsYXRlPlxuICAgIGA7XG4gICAgICAgIHJldHVybiBxb25seSA/IHFwYXJ0IDogdG1wbHRcbiAgICB9XG5cbiAgICBnZXRKc29uIChhc2pzb24pIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgICAgIHJldHVybiBhc2pzb24gPyB0IDogSlNPTi5zdHJpbmdpZnkodCwgbnVsbCwgMik7XG4gICAgfVxuXG59IC8vIGVuZCBvZiBjbGFzcyBUZW1wbGF0ZVxuXG5leHBvcnQgeyBUZW1wbGF0ZSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdGVtcGxhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgQ29uc3RyYWludCB9IGZyb20gJy4vY29uc3RyYWludC5qcyc7XG5cbi8vXG5jbGFzcyBOb2RlIHtcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgdGVtcGxhdGUgKFRlbXBsYXRlIG9iamVjdCkgdGhlIHRlbXBsYXRlIHRoYXQgb3ducyB0aGlzIG5vZGVcbiAgICAvLyAgIHBhcmVudCAob2JqZWN0KSBQYXJlbnQgb2YgdGhlIG5ldyBub2RlLlxuICAgIC8vICAgbmFtZSAoc3RyaW5nKSBOYW1lIGZvciB0aGUgbm9kZVxuICAgIC8vICAgcGNvbXAgKG9iamVjdCkgUGF0aCBjb21wb25lbnQgZm9yIHRoZSByb290LCB0aGlzIGlzIGEgY2xhc3MuIEZvciBvdGhlciBub2RlcywgYW4gYXR0cmlidXRlLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbiBkZWNyaXB0b3IuXG4gICAgLy8gICBwdHlwZSAob2JqZWN0KSBUeXBlIG9mIHBjb21wLlxuICAgIGNvbnN0cnVjdG9yICh0ZW1wbGF0ZSwgcGFyZW50LCBuYW1lLCBwY29tcCwgcHR5cGUpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlOyAvLyB0aGUgdGVtcGxhdGUgSSBiZWxvbmcgdG8uXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7ICAgICAvLyBkaXNwbGF5IG5hbWVcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdOyAgIC8vIGNoaWxkIG5vZGVzXG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50OyAvLyBwYXJlbnQgbm9kZVxuICAgICAgICB0aGlzLnBjb21wID0gcGNvbXA7ICAgLy8gcGF0aCBjb21wb25lbnQgcmVwcmVzZW50ZWQgYnkgdGhlIG5vZGUuIEF0IHJvb3QsIHRoaXMgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdGFydGluZyBjbGFzcy4gT3RoZXJ3aXNlLCBwb2ludHMgdG8gYW4gYXR0cmlidXRlIChzaW1wbGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uKS5cbiAgICAgICAgdGhpcy5wdHlwZSAgPSBwdHlwZTsgIC8vIHBhdGggdHlwZS4gVGhlIHR5cGUgb2YgdGhlIHBhdGggYXQgdGhpcyBub2RlLCBpLmUuIHRoZSB0eXBlIG9mIHBjb21wLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbCBvciBhIFwibGVhZlwiIGNsYXNzIChlZyBqYXZhLmxhbmcuU3RyaW5nKS4gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXkgYmUgb3ZlcnJpZGVuIGJ5IHN1YmNsYXNzIGNvbnN0cmFpbnQuXG4gICAgICAgIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDsgLy8gc3ViY2xhc3MgY29uc3RyYWludCAoaWYgYW55KS4gUG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBzcGVjaWZpZWQsIG92ZXJyaWRlcyBwdHlwZSBhcyB0aGUgdHlwZSBvZiB0aGUgbm9kZS5cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IFtdOy8vIGFsbCBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsOyAgICAvLyBJZiBzZWxlY3RlZCBmb3IgcmV0dXJuLCB0aGlzIGlzIGl0cyBjb2x1bW4jLlxuICAgICAgICBwYXJlbnQgJiYgcGFyZW50LmNoaWxkcmVuLnB1c2godGhpcyk7XG5cbiAgICAgICAgdGhpcy5qb2luID0gbnVsbDsgLy8gaWYgdHJ1ZSwgdGhlbiB0aGUgbGluayBiZXR3ZWVuIG15IHBhcmVudCBhbmQgbWUgaXMgYW4gb3V0ZXIgam9pblxuICAgICAgICBcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMucGF0aDtcbiAgICB9XG4gICAgZ2V0IGlzUm9vdCAoKSB7XG4gICAgICAgIHJldHVybiAhIHRoaXMucGFyZW50O1xuICAgIH1cbiAgICAvL1xuICAgIGdldCByb290Tm9kZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLnF0cmVlO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIG9wZXJhdG9yIGlzIHZhbGlkIGZvciB0aGlzIG5vZGUuXG4gICAgb3BWYWxpZCAob3Ape1xuICAgICAgICBpZiAodGhpcy5pc1Jvb3QgJiYgIW9wLnZhbGlkRm9yUm9vdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5wdHlwZS5pc0xlYWZUeXBlKSB7XG4gICAgICAgICAgICBpZighIG9wLnZhbGlkRm9yQXR0cilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBlbHNlIGlmKCBvcC52YWxpZFR5cGVzICYmIG9wLnZhbGlkVHlwZXMuaW5kZXhPZih0aGlzLnB0eXBlLm5hbWUpID09IC0xKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKCEgb3AudmFsaWRGb3JDbGFzcylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gbGlzdCBpcyB2YWxpZCBhcyBhIGxpc3QgY29uc3RyYWludCBvcHRpb24gZm9yXG4gICAgLy8gdGhlIG5vZGUgbi4gQSBsaXN0IGlzIHZhbGlkIHRvIHVzZSBpbiBhIGxpc3QgY29uc3RyYWludCBhdCBub2RlIG4gaWZmXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGVxdWFsIHRvIG9yIGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGEgc3VwZXJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGUuIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICAgICBlbGVtZW50cyBpbiB0aGUgbGlzdCB0aGF0IGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBub2RlJ3MgdHlwZVxuICAgIC8vICAgICAgIGFyZSBhdXRvbWF0aWNhbGx5IGZpbHRlcmVkIG91dC5cbiAgICBsaXN0VmFsaWQgKGxpc3Qpe1xuICAgICAgICBsZXQgbnQgPSB0aGlzLnN1YnR5cGVDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgICAgIGlmIChudC5pc0xlYWZUeXBlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCBsdCA9IHRoaXMudGVtcGxhdGUubW9kZWwuY2xhc3Nlc1tsaXN0LnR5cGVdO1xuICAgICAgICByZXR1cm4gaXNTdWJjbGFzcyhsdCwgbnQpIHx8IGlzU3ViY2xhc3MobnQsIGx0KTtcbiAgICB9XG5cblxuICAgIC8vXG4gICAgZ2V0IHBhdGggKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucGF0aCArXCIuXCIgOiBcIlwiKSArIHRoaXMubmFtZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgbm9kZVR5cGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNCaW9FbnRpdHkgKCkge1xuICAgICAgICBmdW5jdGlvbiBjayhjbHMpIHtcbiAgICAgICAgICAgIC8vIHNpbXBsZSBhdHRyaWJ1dGUgLSBub3BlXG4gICAgICAgICAgICBpZiAoY2xzLmlzTGVhZlR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIC8vIEJpb0VudGl0eSAtIHl1cFxuICAgICAgICAgICAgaWYgKGNscy5uYW1lID09PSBcIkJpb0VudGl0eVwiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIC8vIG5laXRoZXIgLSBjaGVjayBhbmNlc3RvcnNcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xzLmV4dGVuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2soY2xzLmV4dGVuZHNbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sodGhpcy5ub2RlVHlwZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyAhPT0gbnVsbCAmJiB0aGlzLnZpZXcgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICB0aGlzLnZpZXcgPSBpID49IDAgPyBpIDogKHQuc2VsZWN0LnB1c2gocCkgLSAxKTtcbiAgICB9XG4gICAgdW5zZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwYXRoIGZyb20gdGhlIHNlbGVjdCBsaXN0XG4gICAgICAgICAgICB0LnNlbGVjdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW51bWJlciBub2RlcyBoZXJlXG4gICAgICAgICAgICB0LnNlbGVjdC5zbGljZShpKS5mb3JFYWNoKCAocCxqKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnRlbXBsYXRlLmdldE5vZGVCeVBhdGgocCk7XG4gICAgICAgICAgICAgICAgbi52aWV3IC09IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdHJ1ZSBpZmYgdGhpcyBub2RlIGNhbiBiZSBzb3J0ZWQgb24sIHdoaWNoIGlzIHRydWUgaWZmIHRoZSBub2RlIGlzIGFuXG4gICAgLy8gYXR0cmlidXRlLCBhbmQgdGhlcmUgYXJlIG5vIG91dGVyIGpvaW5zIGJldHdlZW4gaXQgYW5kIHRoZSByb290XG4gICAgY2FuU29ydCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IG4gPSB0aGlzO1xuICAgICAgICB3aGlsZSAobikge1xuICAgICAgICAgICAgaWYgKG4uam9pbikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgbiA9IG4ucGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHNldFNvcnQobmV3ZGlyKXtcbiAgICAgICAgbGV0IG9sZGRpciA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5kaXIgOiBcIm5vbmVcIjtcbiAgICAgICAgbGV0IG9sZGxldiA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICBsZXQgbWF4bGV2ID0gLTE7XG4gICAgICAgIGxldCByZW51bWJlciA9IGZ1bmN0aW9uIChuKXtcbiAgICAgICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkbGV2ID49IDAgJiYgbi5zb3J0LmxldmVsID4gb2xkbGV2KVxuICAgICAgICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICBtYXhsZXYgPSBNYXRoLm1heChtYXhsZXYsIG4uc29ydC5sZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVudW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbmV3ZGlyIHx8IG5ld2RpciA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBub3Qgc29ydGVkXG4gICAgICAgICAgICB0aGlzLnNvcnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gcmVudW1iZXIgYW55IGV4aXN0aW5nIHNvcnQgY2Zncy5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBzb3J0ZWRcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBub3Qgc29ydGVkIGJlZm9yZSwgbmVlZCB0byBmaW5kIG5leHQgbGV2ZWwuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICAgICAgb2xkbGV2ID0gbWF4bGV2ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc29ydCA9IHsgZGlyOm5ld2RpciwgbGV2ZWw6IG9sZGxldiB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0cyB0aGUgc3ViY2xhc3MgY29uc3RyYWludCBhdCB0aGlzIG5vZGUsIG9yIHJlbW92ZXMgaXQgaWYgbm8gc3ViY2xhc3MgZ2l2ZW4uIEEgbm9kZSBtYXlcbiAgICAvLyBoYXZlIGV4YWN0bHkgMCBvciAxIHN1YmNsYXNzIGNvbnN0cmFpbnQuIEFzc3VtZXMgdGhlIHN1YmNsYXNzIGlzIGFjdHVhbGx5IGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUnc1xuICAgIC8vIHR5cGUgKHNob3VsZCBjaGVjayB0aGlzKS5cbiAgICAvL1xuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjIChDb25zdHJhaW50KSBUaGUgc3ViY2xhc3MgQ29uc3RyYWludCBvciBudWxsLiBTZXRzIHRoZSBzdWJjbGFzcyBjb25zdHJhaW50IG9uIHRoZSBjdXJyZW50IG5vZGUgdG9cbiAgICAvLyAgICAgICB0aGUgdHlwZSBuYW1lZCBpbiBjLiBSZW1vdmVzIHRoZSBwcmV2aW91cyBzdWJjbGFzcyBjb25zdHJhaW50IGlmIGFueS4gSWYgbnVsbCwganVzdCByZW1vdmVzXG4gICAgLy8gICAgICAgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnQuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIExpc3Qgb2YgYW55IG5vZGVzIHRoYXQgd2VyZSByZW1vdmVkIGJlY2F1c2UgdGhlIG5ldyBjb25zdHJhaW50IGNhdXNlZCB0aGVtIHRvIGJlY29tZSBpbnZhbGlkLlxuICAgIC8vXG4gICAgc2V0U3ViY2xhc3NDb25zdHJhaW50IChjKSB7XG4gICAgICAgIGxldCBuID0gdGhpcztcbiAgICAgICAgLy8gcmVtb3ZlIGFueSBleGlzdGluZyBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgICAgIGlmIChjICYmIG4uY29uc3RyYWludHMuaW5kZXhPZihjKSA9PT0gLTEpXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYyk7XG4gICAgICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbiAoY2MpeyByZXR1cm4gY2MuY3R5cGUgIT09IFwic3ViY2xhc3NcIiB8fCBjYyA9PT0gYzsgfSk7XG4gICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGMpe1xuICAgICAgICAgICAgLy8gbG9va3VwIHRoZSBzdWJjbGFzcyBuYW1lXG4gICAgICAgICAgICBsZXQgY2xzID0gdGhpcy50ZW1wbGF0ZS5tb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICBpZighY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgLy8gYWRkIHRoZSBjb25zdHJhaW50XG4gICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgfVxuICAgICAgICAvLyBsb29rcyBmb3IgaW52YWxpZGF0ZWQgcGF0aHMgXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgICAgIGxldCBjbHMgPSBub2RlLnN1YmNsYXNzQ29uc3RyYWludCB8fCBub2RlLnB0eXBlO1xuICAgICAgICAgICAgbGV0IGMyID0gW107XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgaWYoYy5uYW1lIGluIGNscy5hdHRyaWJ1dGVzIHx8IGMubmFtZSBpbiBjbHMucmVmZXJlbmNlcyB8fCBjLm5hbWUgaW4gY2xzLmNvbGxlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGMyLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuID0gYzI7XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVtb3ZlZCA9IGNoZWNrKG4sW10pO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmVzIHRoaXMgbm9kZSBmcm9tIHRoZSBxdWVyeS5cbiAgICByZW1vdmUgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGFyZW50O1xuICAgICAgICBpZiAoIXApIHJldHVybjtcbiAgICAgICAgLy8gRmlyc3QsIHJlbW92ZSBhbGwgY29uc3RyYWludHMgb24gdGhpcyBvciBkZXNjZW5kYW50c1xuICAgICAgICBmdW5jdGlvbiBybWMgKHgpIHtcbiAgICAgICAgICAgIHgudW5zZWxlY3QoKTtcbiAgICAgICAgICAgIHguY29uc3RyYWludHMuZm9yRWFjaChjID0+IHgucmVtb3ZlQ29uc3RyYWludChjKSk7XG4gICAgICAgICAgICB4LmNoaWxkcmVuLmZvckVhY2gocm1jKTtcbiAgICAgICAgfVxuICAgICAgICBybWModGhpcyk7XG4gICAgICAgIC8vIE5vdyByZW1vdmUgdGhlIHN1YnRyZWUgYXQgbi5cbiAgICAgICAgcC5jaGlsZHJlbi5zcGxpY2UocC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpLCAxKTtcbiAgICB9XG5cbiAgICAvLyBBZGRzIGEgbmV3IGNvbnN0cmFpbnQgdG8gYSBub2RlIGFuZCByZXR1cm5zIGl0LlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjIChjb25zdHJhaW50KSBJZiBnaXZlbiwgdXNlIHRoYXQgY29uc3RyYWludC4gT3RoZXJ3aXNlLCBjcmVhdGUgZGVmYXVsdC5cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgVGhlIG5ldyBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgYWRkQ29uc3RyYWludCAoYykge1xuICAgICAgICBpZiAoYykge1xuICAgICAgICAgICAgLy8ganVzdCB0byBiZSBzdXJlXG4gICAgICAgICAgICBjLm5vZGUgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IG9wID0gT1BJTkRFWFt0aGlzLnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIgPyBcIj1cIiA6IFwiTE9PS1VQXCJdO1xuICAgICAgICAgICAgYyA9IG5ldyBDb25zdHJhaW50KHtub2RlOnRoaXMsIG9wOm9wLm9wLCBjdHlwZTogb3AuY3R5cGV9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzLnB1c2goYyk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUud2hlcmUucHVzaChjKTtcblxuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN1YmNsYXNzQ29uc3RyYWludChjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGMuY29kZSA9IHRoaXMudGVtcGxhdGUubmV4dEF2YWlsYWJsZUNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG5cbiAgICByZW1vdmVDb25zdHJhaW50IChjKXtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IHRoaXMuY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS53aGVyZSA9IHRoaXMudGVtcGxhdGUud2hlcmUuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIilcbiAgICAgICAgICAgIHRoaXMuc2V0U3ViY2xhc3NDb25zdHJhaW50KG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRlbXBsYXRlLmNvZGUyY1tjLmNvZGVdO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG59IC8vIGVuZCBvZiBjbGFzcyBOb2RlXG5cbmV4cG9ydCB7IE5vZGUgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL25vZGUuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGQzanNvblByb21pc2UgfSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5mdW5jdGlvbiBpbml0UmVnaXN0cnkgKGNiKSB7XG4gICAgcmV0dXJuIGQzanNvblByb21pc2UocmVnaXN0cnlVcmwpXG4gICAgICAudGhlbihjYilcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgcmVnaXN0cnkgYXQgJHtyZWdpc3RyeVVybH0uIFRyeWluZyAke3JlZ2lzdHJ5RmlsZVVybH0uYCk7XG4gICAgICAgICAgZDNqc29uUHJvbWlzZShyZWdpc3RyeUZpbGVVcmwpXG4gICAgICAgICAgICAgIC50aGVuKGNiKVxuICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgYWxlcnQoXCJDYW5ub3QgYWNjZXNzIHJlZ2lzdHJ5IGZpbGUuIFRoaXMgaXMgbm90IHlvdXIgbHVja3kgZGF5LlwiKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG59XG5cbmV4cG9ydCB7IGluaXRSZWdpc3RyeSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcmVnaXN0cnkuanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7Y29kZXBvaW50c30gZnJvbSAnLi9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanMnO1xuXG5sZXQgZWRpdFZpZXdzID0geyBxdWVyeU1haW46IHtcbiAgICAgICAgbmFtZTogXCJxdWVyeU1haW5cIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwidHJlZVwiLFxuICAgICAgICBub2RlQ29tcDogbnVsbCxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0cm9rZTogXCIjZTI4YjI4XCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29sdW1uT3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJjb2x1bW5PcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zZWxlY3RlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb2x1bW4gb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc2VsZWN0aW9uLWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyBhLnZpZXcgLSBiLnZpZXcgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZHJhZyBpbiBjb2x1bW5PcmRlciB2aWV3IGNoYW5nZXMgdGhlIGNvbHVtbiBvcmRlciAoZHVoISlcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4geyBuLnZpZXcgPSBpIH0pO1xuICAgICAgICAgIGRyYWdnZWQudGVtcGxhdGUuc2VsZWN0ID0gbm9kZXMubWFwKCBuPT4gbi5wYXRoICk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBudWxsLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBuLnZpZXcgOiBcIlwiXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNvcnRPcmRlcjoge1xuICAgICAgICBuYW1lOiBcInNvcnRPcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zb3J0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gc29ydCBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc29ydC1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuc29ydClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IGEuc29ydC5sZXZlbCAtIGIuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgLy8gZHJhZyBpbiBzb3J0T3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBzb3J0IG9yZGVyIChkdWghKVxuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4ge1xuICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgPSBpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5zb3J0ID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnN0cmFpbnRMb2dpYzoge1xuICAgICAgICBuYW1lOiBcImNvbnN0cmFpbnRMb2dpY1wiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbnN0cmFpbnQgbG9naWMgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBjb25zdHJhaW5lZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gY29kZSBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGxldCBhY29uc3QgPSBhLmNvbnN0cmFpbnRzICYmIGEuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYWNvZGUgPSBhY29uc3QgPyBhLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGxldCBiY29uc3QgPSBiLmNvbnN0cmFpbnRzICYmIGIuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYmNvZGUgPSBiY29uc3QgPyBiLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGlmIChhY29uc3QpXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAoYWNvZGUgPCBiY29kZSA/IC0xIDogYWNvZGUgPiBiY29kZSA/IDEgOiAwKSA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IDEgOiBuYW1lQ29tcChhLCBiKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29tcGFyYXRvciBmdW5jdGlvbiwgZm9yIHNvcnRpbmcgYSBsaXN0IG9mIG5vZGVzIGJ5IG5hbWUuIENhc2UtaW5zZW5zaXRpdmUuXG4vL1xubGV0IG5hbWVDb21wID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgbGV0IG5hID0gYS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IG5iID0gYi5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG5hIDwgbmIgPyAtMSA6IG5hID4gbmIgPyAxIDogMDtcbn07XG5cbmV4cG9ydCB7IGVkaXRWaWV3cyB9O1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGZpbmREb21CeURhdGFPYmogfSBmcm9tICcuL3V0aWxzLmpzJztcblxuY2xhc3MgRGlhbG9nIHtcbiAgICBjb25zdHJ1Y3RvciAoZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRFZGl0b3IgPSBlZGl0b3IuY29uc3RyYWludEVkaXRvcjtcbiAgICAgICAgdGhpcy51bmRvTWdyID0gZWRpdG9yLnVuZG9NZ3I7XG4gICAgICAgIHRoaXMuY3Vyck5vZGUgPSBudWxsO1xuICAgICAgICB0aGlzLmRnID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKTtcbiAgICAgICAgdGhpcy5kZy5jbGFzc2VkKFwiaGlkZGVuXCIsdHJ1ZSlcbiAgICAgICAgdGhpcy5kZy5zZWxlY3QoXCIuYnV0dG9uLmNsb3NlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5oaWRlKCkpO1xuICAgICAgICB0aGlzLmRnLnNlbGVjdChcIi5idXR0b24ucmVtb3ZlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5lZGl0b3IucmVtb3ZlTm9kZSh0aGlzLmN1cnJOb2RlKSk7XG5cbiAgICAgICAgLy8gV2lyZSB1cCBzZWxlY3QgYnV0dG9uIGluIGRpYWxvZ1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJyTm9kZS5pc1NlbGVjdGVkID8gc2VsZi5jdXJyTm9kZS51bnNlbGVjdCgpIDogc2VsZi5jdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzZWxlY3QtY3RybFwiXScpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgc2VsZi5jdXJyTm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyBXaXJlIHVwIHNvcnQgZnVuY3Rpb24gaW4gZGlhbG9nXG4gICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXSAuc3dhdGNoJylcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXScpO1xuICAgICAgICAgICAgICAgIGlmIChjYy5jbGFzc2VkKFwiZGlzYWJsZWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBsZXQgb2xkc29ydCA9IGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIpID8gXCJhc2NcIiA6IGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiKSA/IFwiZGVzY1wiIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IG5ld3NvcnQgPSBvbGRzb3J0ID09PSBcImFzY1wiID8gXCJkZXNjXCIgOiBvbGRzb3J0ID09PSBcImRlc2NcIiA/IFwibm9uZVwiIDogXCJhc2NcIjtcbiAgICAgICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGFzY1wiLCBuZXdzb3J0ID09PSBcImFzY1wiKTtcbiAgICAgICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGRlc2NcIiwgbmV3c29ydCA9PT0gXCJkZXNjXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuY3Vyck5vZGUuc2V0U29ydChuZXdzb3J0KTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBIaWRlcyB0aGUgZGlhbG9nLiBTZXRzIHRoZSBjdXJyZW50IG5vZGUgdG8gbnVsbC5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgbm9uZVxuICAgIC8vIFJldHVybnNcbiAgICAvLyAgbm90aGluZ1xuICAgIC8vIFNpZGUgZWZmZWN0czpcbiAgICAvLyAgSGlkZXMgdGhlIGRpYWxvZy5cbiAgICAvLyAgU2V0cyBjdXJyTm9kZSB0byBudWxsLlxuICAgIC8vXG4gICAgaGlkZSAoKXtcbiAgICAgIHRoaXMuY3Vyck5vZGUgPSBudWxsO1xuICAgICAgdGhpcy5kZ1xuICAgICAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIHRydWUpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbi8yKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMWUtNilcIilcbiAgICAgICAgICA7XG4gICAgICB0aGlzLmNvbnN0cmFpbnRFZGl0b3IuaGlkZSgpO1xuICAgIH1cblxuICAgIC8vIE9wZW5zIGEgZGlhbG9nIG9uIHRoZSBzcGVjaWZpZWQgbm9kZS5cbiAgICAvLyBBbHNvIG1ha2VzIHRoYXQgbm9kZSB0aGUgY3VycmVudCBub2RlLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBuICAgIHRoZSBub2RlXG4gICAgLy8gICBlbHQgIHRoZSBET00gZWxlbWVudCAoZS5nLiBhIGNpcmNsZSlcbiAgICAvLyBSZXR1cm5zXG4gICAgLy8gICBzdHJpbmdcbiAgICAvLyBTaWRlIGVmZmVjdDpcbiAgICAvLyAgIHNldHMgZ2xvYmFsIGN1cnJOb2RlXG4gICAgLy9cbiAgICBzaG93IChuLCBlbHQsIHJlZnJlc2hPbmx5KSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAoIWVsdCkgZWx0ID0gZmluZERvbUJ5RGF0YU9iaihuKTtcbiAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvci5oaWRlKCk7XG4gICAgICB0aGlzLmN1cnJOb2RlID0gbjtcblxuICAgICAgbGV0IGlzcm9vdCA9ICEgdGhpcy5jdXJyTm9kZS5wYXJlbnQ7XG4gICAgICAvLyBNYWtlIG5vZGUgdGhlIGRhdGEgb2JqIGZvciB0aGUgZGlhbG9nXG4gICAgICBsZXQgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKS5kYXR1bShuKTtcbiAgICAgIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICAgICAgbGV0IGRiYiA9IGRpYWxvZ1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCBlYmIgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBsZXQgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGV0IHQgPSAoZWJiLnRvcCAtIGJiYi50b3ApICsgZWJiLndpZHRoLzI7XG4gICAgICBsZXQgYiA9IChiYmIuYm90dG9tIC0gZWJiLmJvdHRvbSkgKyBlYmIud2lkdGgvMjtcbiAgICAgIGxldCBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICAgICAgbGV0IGRpciA9IFwiZFwiIDsgLy8gXCJkXCIgb3IgXCJ1XCJcbiAgICAgIC8vIE5COiBjYW4ndCBnZXQgb3BlbmluZyB1cCB0byB3b3JrLCBzbyBoYXJkIHdpcmUgaXQgdG8gZG93bi4gOi1cXFxuXG4gICAgICAvL1xuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCBsK1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgICAgICAuY2xhc3NlZChcImhpZGRlblwiLCBmYWxzZSlcbiAgICAgICAgICAuY2xhc3NlZChcImlzcm9vdFwiLCBpc3Jvb3QpXG4gICAgICAgICAgO1xuICAgICAgaWYgKGRpciA9PT0gXCJkXCIpXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIG51bGwpXG4gICAgICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAwJVwiKSA7XG4gICAgICBlbHNlXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCBudWxsKVxuICAgICAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAxMDAlXCIpIDtcblxuICAgICAgLy8gU2V0IHRoZSBkaWFsb2cgdGl0bGUgdG8gbm9kZSBuYW1lXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgICAgIC50ZXh0KG4ubmFtZSk7XG4gICAgICAvLyBTaG93IHRoZSBmdWxsIHBhdGhcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgICAgICAudGV4dChuLnBhdGgpO1xuICAgICAgLy8gVHlwZSBuYW1lIGF0IHRoaXMgbm9kZVxuICAgICAgbGV0IHRwID0gbi5wdHlwZS5uYW1lO1xuICAgICAgbGV0IHN0cCA9IChuLnN1YmNsYXNzQ29uc3RyYWludCAmJiBuLnN1YmNsYXNzQ29uc3RyYWludC5uYW1lKSB8fCBudWxsO1xuICAgICAgbGV0IHRzdHJpbmcgPSBzdHAgJiYgYDxzcGFuIHN0eWxlPVwiY29sb3I6IHB1cnBsZTtcIj4ke3N0cH08L3NwYW4+ICgke3RwfSlgIHx8IHRwXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgICAgICAuaHRtbCh0c3RyaW5nKTtcblxuICAgICAgLy8gV2lyZSB1cCBhZGQgY29uc3RyYWludCBidXR0b25cbiAgICAgIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IG4uYWRkQ29uc3RyYWludCgpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKG4pO1xuICAgICAgICAgICAgICAgIHNlbGYuc2hvdyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjLCBuKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIG91dCB0aGUgY29uc3RyYWludHMgc2VjdGlvbi4gRmlyc3QsIHNlbGVjdCBhbGwgY29uc3RyYWludHMuXG4gICAgICBsZXQgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgICAgICAuc2VsZWN0QWxsKFwiLmNvbnN0cmFpbnRcIilcbiAgICAgICAgICAuZGF0YShuLmNvbnN0cmFpbnRzKTtcbiAgICAgIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gICAgICAvLyAxLiBjb250YWluZXJcbiAgICAgIGxldCBjZGl2cyA9IGNvbnN0cnMuZW50ZXIoKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsXCJjb25zdHJhaW50XCIpIDtcbiAgICAgIC8vIDIuIG9wZXJhdG9yXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJvcFwiKSA7XG4gICAgICAvLyAzLiB2YWx1ZVxuICAgICAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAgICAgLy8gNC4gY29uc3RyYWludCBjb2RlXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJjb2RlXCIpIDtcbiAgICAgIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICAgICAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBlZGl0XCIpLnRleHQoXCJtb2RlX2VkaXRcIikuYXR0cihcInRpdGxlXCIsXCJFZGl0IHRoaXMgY29uc3RyYWludFwiKTtcbiAgICAgIC8vIDYuIGJ1dHRvbiB0byByZW1vdmUgdGhpcyBjb25zdHJhaW50XG4gICAgICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGNhbmNlbFwiKS50ZXh0KFwiZGVsZXRlX2ZvcmV2ZXJcIikuYXR0cihcInRpdGxlXCIsXCJSZW1vdmUgdGhpcyBjb25zdHJhaW50XCIpO1xuXG4gICAgICAvLyBSZW1vdmUgZXhpdGluZ1xuICAgICAgY29uc3Rycy5leGl0KCkucmVtb3ZlKCkgO1xuXG4gICAgICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICAgICAgY29uc3Ryc1xuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oYykgeyByZXR1cm4gXCJjb25zdHJhaW50IFwiICsgYy5jdHlwZTsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMuY29kZSB8fCBcIj9cIjsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJvcFwiXScpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICAgICAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwidmFsdWVcIl0nKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlICsgKGMuZXh0cmFWYWx1ZSA/IFwiIGluIFwiICsgYy5leHRyYVZhbHVlIDogXCJcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgfHwgKGMudmFsdWVzICYmIGMudmFsdWVzLmpvaW4oXCIsXCIpKSB8fCBjLnR5cGU7XG4gICAgICAgICAgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdChcImkuZWRpdFwiKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGMpeyBcbiAgICAgICAgICAgICAgc2VsZi5jb25zdHJhaW50RWRpdG9yLm9wZW4oYywgbik7XG4gICAgICAgICAgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdChcImkuY2FuY2VsXCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgICAgICBuLnJlbW92ZUNvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShuKTtcbiAgICAgICAgICAgICAgc2VsZi5zaG93KG4sIG51bGwsIHRydWUpO1xuICAgICAgICAgIH0pXG5cblxuICAgICAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICAgICAgZGlhbG9nLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgICAgIC8vXG4gICAgICBsZXQgdHlwID0gbi5wY29tcC50eXBlIHx8IG4ucGNvbXA7IC8vIHR5cGUgb2YgdGhlIG5vZGUuIENhc2UgZm9yIGlmIHJvb3Qgbm9kZS5cbiAgICAgIGlmICh0eXAuaXNMZWFmVHlwZSkge1xuICAgICAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsdHJ1ZSk7XG4gICAgICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUubmFtZSB8fCBuLnBjb21wLnR5cGUgKTtcbiAgICAgICAgICAvLyBcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZCB9KTtcbiAgICAgICAgICAvLyBcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNvcnQtY3RybFwiXScpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwiZGlzYWJsZWRcIiwgbiA9PiAhbi5jYW5Tb3J0KCkpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic29ydGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic29ydGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIERpYWxvZyBmb3IgY2xhc3Nlc1xuICAgICAgICAgIGRpYWxvZ1xuICAgICAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLGZhbHNlKTtcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZSA/IG4ucGNvbXAudHlwZS5uYW1lIDogbi5wY29tcC5uYW1lKTtcblxuICAgICAgICAgIC8vIHdpcmUgdXAgdGhlIGJ1dHRvbiB0byBzaG93IHN1bW1hcnkgZmllbGRzXG4gICAgICAgICAgZGlhbG9nLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNob3dTdW1tYXJ5XCJdJylcbiAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5zZWxlY3RlZE5leHQoXCJzdW1tYXJ5ZmllbGRzXCIpKTtcblxuICAgICAgICAgIC8vIEZpbGwgaW4gdGhlIHRhYmxlIGxpc3RpbmcgYWxsIHRoZSBhdHRyaWJ1dGVzL3JlZnMvY29sbGVjdGlvbnMuXG4gICAgICAgICAgbGV0IHRibCA9IGRpYWxvZy5zZWxlY3QoXCJ0YWJsZS5hdHRyaWJ1dGVzXCIpO1xuICAgICAgICAgIGxldCByb3dzID0gdGJsLnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgICAgIC5kYXRhKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5hbGxQYXJ0cylcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgIHJvd3MuZW50ZXIoKS5hcHBlbmQoXCJ0clwiKTtcbiAgICAgICAgICByb3dzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgICBsZXQgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICAgICAgICAgIGlmIChjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIlNlbGVjdCB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzZWxlY3RzaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxmLnNlbGVjdGVkTmV4dChcInNlbGVjdGVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiQ29uc3RyYWluIHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2NvbnN0cmFpbnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwiY29uc3RyYWluZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJGb2xsb3cgdGhpcyAke2NvbXAua2luZH1cIj5wbGF5X2Fycm93PC9pPmAsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnb3Blbm5leHQnLFxuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxmLnNlbGVjdGVkTmV4dChcIm9wZW5cIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICA7XG4gICAgICAgICAgY2VsbHMuZW50ZXIoKS5hcHBlbmQoXCJ0ZFwiKTtcbiAgICAgICAgICBjZWxsc1xuICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLmNsczt9KVxuICAgICAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5jbGljayAmJiBkLmNsaWNrKCk7IH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICBjZWxscy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kcyB0aGUgcGF0aCBmcm9tIGN1cnJOb2RlIHRvIHBcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbiAgICAvLyAgIG1vZGUgKHN0cmluZykgb25lIG9mIFwic2VsZWN0XCIsIFwiY29uc3RyYWluXCIgb3IgXCJvcGVuXCJcbiAgICAvLyAgIHAgKHN0cmluZykgTmFtZSBvZiBhbiBhdHRyaWJ1dGUsIHJlZiwgb3IgY29sbGVjdGlvblxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICBub3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuICAgIC8vICAgYXMgYSBuZXcgY2hpbGQgKGdyb3dpbmcgb3V0IGZyb20gdGhlIHBhcmVudCBub2RlLlxuICAgIC8vICAgVGhlbiB0aGUgZGlhbG9nIGlzIG9wZW5lZCBvbiB0aGUgY2hpbGQgbm9kZS5cbiAgICAvLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4gICAgLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK2NvbnN0cmFpblwiIGJ1dHRvbiwgYSBuZXcgY29uc3RyYWludCBpcyBhZGRlZCB0byB0aGVcbiAgICAvLyAgIGNoaWxkLCBhbmQgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9wZW5lZCAgb24gdGhhdCBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgc2VsZWN0ZWROZXh0IChtb2RlLCBwKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IG47XG4gICAgICAgIGxldCBjYztcbiAgICAgICAgbGV0IHNmcztcbiAgICAgICAgbGV0IGN0ID0gdGhpcy5jdXJyTm9kZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwic3VtbWFyeWZpZWxkc1wiKSB7XG4gICAgICAgICAgICBzZnMgPSB0aGlzLmVkaXRvci5jdXJyTWluZS5zdW1tYXJ5RmllbGRzW3RoaXMuY3Vyck5vZGUubm9kZVR5cGUubmFtZV18fFtdO1xuICAgICAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgICAgIHNmID0gc2YucmVwbGFjZSgvXlteLl0rLywgc2VsZi5jdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgICAgICBsZXQgbSA9IGN0LmFkZFBhdGgoc2YpO1xuICAgICAgICAgICAgICAgIGlmICghIG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBtLnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcCA9IHNlbGYuY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgICAgIG4gPSBjdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IFwic2VsZWN0ZWRcIilcbiAgICAgICAgICAgICAgICAhbi5pc1NlbGVjdGVkICYmIG4uc2VsZWN0KCk7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gXCJjb25zdHJhaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgY2MgPSBuLmFkZENvbnN0cmFpbnQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlICE9PSBcIm9wZW5cIilcbiAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgIGlmIChtb2RlICE9PSBcInN1bW1hcnlmaWVsZHNcIikgXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KG4pO1xuICAgICAgICAgICAgICAgIGNjICYmIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25zdHJhaW50RWRpdG9yLm9wZW4oY2MsIG4pXG4gICAgICAgICAgICAgICAgfSwgc2VsZi5lZGl0b3IuYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICAgICAgfSwgc2VsZi5lZGl0b3IuYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICB0aGlzLmVkaXRvci51cGRhdGUodGhpcy5jdXJyTm9kZSk7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmV4cG9ydCB7IERpYWxvZyB9IDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgZDNqc29uUHJvbWlzZSwgaW5pdE9wdGlvbkxpc3QgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldFN1YmNsYXNzZXMgfSBmcm9tICcuL21vZGVsLmpzJztcblxuY2xhc3MgQ29uc3RyYWludEVkaXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvciAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5hZnRlclNhdmUgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICAvLyBPcGVucyB0aGUgY29uc3RyYWludCBlZGl0b3IgZm9yIGNvbnN0cmFpbnQgYyBvZiBub2RlIG4uXG4gICAgLy9cbiAgICBvcGVuKGMsIG4pIHtcblxuICAgICAgICAvLyBOb3RlIGlmIHRoaXMgaXMgaGFwcGVuaW5nIGF0IHRoZSByb290IG5vZGVcbiAgICAgICAgbGV0IGlzcm9vdCA9ICEgbi5wYXJlbnQ7XG4gICAgIFxuICAgICAgICAvLyBGaW5kIHRoZSBkaXYgZm9yIGNvbnN0cmFpbnQgYyBpbiB0aGUgZGlhbG9nIGxpc3RpbmcuIFdlIHdpbGxcbiAgICAgICAgLy8gb3BlbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb24gdG9wIG9mIGl0LlxuICAgICAgICBsZXQgY2RpdjtcbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiI2RpYWxvZyAuY29uc3RyYWludFwiKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oY2MpeyBpZihjYyA9PT0gYykgY2RpdiA9IHRoaXM7IH0pO1xuICAgICAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGNvbnN0cmFpbnQncyBjb250YWluZXIgZGl2XG4gICAgICAgIGxldCBjYmIgPSBjZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGFwcCdzIG1haW4gYm9keSBlbGVtZW50XG4gICAgICAgIGxldCBkYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBjb25zdHJhaW50IGVkaXRvciBvdmVyIHRoZSBjb25zdHJhaW50IGluIHRoZSBkaWFsb2dcbiAgICAgICAgbGV0IGNlZCA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGMuY3R5cGUpXG4gICAgICAgICAgICAuY2xhc3NlZChcIm9wZW5cIiwgdHJ1ZSlcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCBjLnN1bW1hcnlMaXN0KVxuICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIChjYmIudG9wIC0gZGJiLnRvcCkrXCJweFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoY2JiLmxlZnQgLSBkYmIubGVmdCkrXCJweFwiKVxuICAgICAgICAgICAgO1xuXG4gICAgICAgIC8vIEluaXQgdGhlIGNvbnN0cmFpbnQgY29kZSBcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAgICAgLnRleHQoYy5jb2RlKTtcblxuICAgICAgICB0aGlzLmluaXRJbnB1dHMobiwgYyk7XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyBXaGVuIHVzZXIgc2VsZWN0cyBhbiBvcGVyYXRvciwgYWRkIGEgY2xhc3MgdG8gdGhlIGMuZS4ncyBjb250YWluZXJcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wID0gT1BJTkRFWFt0aGlzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRJbnB1dHMobiwgYywgb3AuY3R5cGUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLmNhbmNlbChuLCBjKSB9KTtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnNhdmVcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5zYXZlRWRpdHMobiwgYykgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zeW5jXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpLnRoZW4oKCkgPT4gdGhpcy5pbml0SW5wdXRzKG4sIGMpKSB9KTtcblxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBpbnB1dCBlbGVtZW50cyBpbiB0aGUgY29uc3RyYWludCBlZGl0b3IgZnJvbSB0aGUgZ2l2ZW4gY29uc3RyYWludC5cbiAgICAvL1xuICAgIGluaXRJbnB1dHMgKG4sIGMsIGN0eXBlKSB7XG5cbiAgICAgICAgLy8gUG9wdWxhdGUgdGhlIG9wZXJhdG9yIHNlbGVjdCBsaXN0IHdpdGggb3BzIGFwcHJvcHJpYXRlIGZvciB0aGUgcGF0aFxuICAgICAgICAvLyBhdCB0aGlzIG5vZGUuXG4gICAgICAgIGlmICghY3R5cGUpIFxuICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwib3BcIl0nLCBcbiAgICAgICAgICAgIE9QUy5maWx0ZXIoZnVuY3Rpb24ob3ApeyByZXR1cm4gbi5vcFZhbGlkKG9wKTsgfSksXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQub3AsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLm9wLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6Yy5vcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vXG4gICAgICAgIGN0eXBlID0gY3R5cGUgfHwgYy5jdHlwZTtcblxuICAgICAgICBsZXQgY2UgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKTtcbiAgICAgICAgbGV0IHNtemQgPSBjZS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcbiAgICAgICAgY2UuYXR0cihcImNsYXNzXCIsIFwib3BlbiBcIiArIGN0eXBlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsICBzbXpkKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJiaW9lbnRpdHlcIiwgIG4uaXNCaW9FbnRpdHkpO1xuICAgICBcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKGN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgW1wiQW55XCJdLmNvbmNhdChuLnRlbXBsYXRlLm1vZGVsLm1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgICAgICB7IHNlbGVjdGVkOiBjLmV4dHJhVmFsdWUgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9wdGlvbiBsaXN0IG9mIHN1YmNsYXNzIG5hbWVzXG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIG4ucGFyZW50ID8gZ2V0U3ViY2xhc3NlcyhuLnBjb21wLmtpbmQgPyBuLnBjb21wLnR5cGUgOiBuLnBjb21wKSA6IFtdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgICAgICB0aXRsZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBmdW5jdGlvbihkKXsgXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG9uZSB3aG9zZSBuYW1lIG1hdGNoZXMgdGhlIG5vZGUncyB0eXBlIGFuZCBzZXQgaXRzIHNlbGVjdGVkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIG4udGVtcGxhdGUubW9kZWwubWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIG4ubGlzdFZhbGlkKGwpOyB9KSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBsaXN0cylcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBjLnN1bW1hcnlMaXN0IHx8IGMudmFsdWVzIHx8IFtjLnZhbHVlXSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBsaXN0XCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWVzIHx8IFtjLnZhbHVlXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgfHwgW2MudmFsdWVdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyByZXN1bHRzXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiVW5yZWNvZ25pemVkIGN0eXBlOiBcIiArIGN0eXBlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIC8qXG4gICAgLy9cbiAgICB1cGRhdGVDRWlucHV0cyAoYywgb3ApIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWUgPSBvcCB8fCBjLm9wO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpLnRleHQoYy5jb2RlKTtcblxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylbMF1bMF0udmFsdWUgPSBkZWVwYyhjLnZhbHVlcyk7XG4gICAgfVxuICAgICovXG5cblxuICAgIC8vIEdlbmVyYXRlcyBhbiBvcHRpb24gbGlzdCBvZiBkaXN0aW5jdCB2YWx1ZXMgdG8gc2VsZWN0IGZyb20uXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbiAgICAvLyAgIGMgIChjb25zdHJhaW50KSBUaGUgY29uc3RyYWludCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBmb3IuXG4gICAgLy8gTkI6IE9ubHkgdmFsdWUgYW5kIG11bHRpdmF1ZSBjb25zdHJhaW50cyBjYW4gYmUgc3VtbWFyaXplZCBpbiB0aGlzIHdheS4gIFxuICAgIGdlbmVyYXRlT3B0aW9uTGlzdCAobiwgYykge1xuICAgICAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgICAgICAvLyBzdW1tYXJ5UGF0aCwgd2hpY2ggaXMgdGhlIHBhdGggd2Ugd2FudCBkaXN0aW5jdCB2YWx1ZXMgZm9yLiBcbiAgICAgICAgLy8gQlVUIE5PVEUsIHdlIGhhdmUgdG8gcnVuIHRoZSBxdWVyeSAqd2l0aG91dCogY29uc3RyYWludCBjISFcbiAgICAgICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAgICAgLy8gYW5kIHdlIHdhbnQgdG8gY2hhbmdlIGl0IHRvIFNwb250YW5lb3VzLiBXZSBvcGVuIHRoZSBjLmUuLCBhbmQgdGhlbiBjbGljayB0aGVcbiAgICAgICAgLy8gc3luYyBidXR0b24gdG8gZ2V0IGEgbGlzdC4gSWYgd2UgcnVuIHRoZSBxdWVyeSB3aXRoIGMgaW50YWN0LCB3ZSdsbCBnZXQgYSBsaXN0XG4gICAgICAgIC8vIGNvbnRhaW5pbmcgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAgICAgLy8gQU5PVEhFUiBOT1RFOiB0aGUgcGF0aCBpbiBzdW1tYXJ5UGF0aCBtdXN0IGJlIHBhcnQgb2YgdGhlIHF1ZXJ5IHByb3Blci4gVGhlIGFwcHJvYWNoXG4gICAgICAgIC8vIGhlcmUgaXMgdG8gZW5zdXJlIGl0IGJ5IGFkZGluZyB0aGUgcGF0aCB0byB0aGUgdmlldyBsaXN0LlxuXG4gICAgICAgIC8qXG4gICAgICAgIC8vIFNhdmUgdGhpcyBjaG9pY2UgaW4gbG9jYWxTdG9yYWdlXG4gICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICBsZXQga2V5ID0gXCJhdXRvY29tcGxldGVcIjtcbiAgICAgICAgbGV0IGxzdDtcbiAgICAgICAgbHN0ID0gZ2V0TG9jYWwoa2V5LCB0cnVlLCBbXSk7XG4gICAgICAgIGlmKGxzdC5pbmRleE9mKGF0dHIpID09PSAtMSkgbHN0LnB1c2goYXR0cik7XG4gICAgICAgIHNldExvY2FsKGtleSwgbHN0LCB0cnVlKTtcbiAgICAgICAgKi9cblxuICAgICAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICAgICAgbGV0IHAgPSBuLnBhdGg7IC8vIHdoYXQgd2Ugd2FudCB0byBzdW1tYXJpemVcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGxleCA9IG4udGVtcGxhdGUuY29uc3RyYWludExvZ2ljOyAvLyBzYXZlIGNvbnN0cmFpbnQgbG9naWMgZXhwclxuICAgICAgICBuLnJlbW92ZUNvbnN0cmFpbnQoYyk7IC8vIHRlbXBvcmFyaWx5IHJlbW92ZSB0aGUgY29uc3RyYWludFxuICAgICAgICBuLnRlbXBsYXRlLnNlbGVjdC5wdXNoKHApOyAvLyAvLyBtYWtlIHN1cmUgcCBpcyBwYXJ0IG9mIHRoZSBxdWVyeVxuICAgICAgICAvLyBnZXQgdGhlIHhtbFxuICAgICAgICBsZXQgeCA9IG4udGVtcGxhdGUuZ2V0WG1sKHRydWUpO1xuICAgICAgICAvLyByZXN0b3JlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICBuLnRlbXBsYXRlLnNlbGVjdC5wb3AoKTtcbiAgICAgICAgbi50ZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgPSBsZXg7IC8vIHJlc3RvcmUgdGhlIGxvZ2ljIGV4cHJcbiAgICAgICAgbi5hZGRDb25zdHJhaW50KGMpOyAvLyByZS1hZGQgdGhlIGNvbnN0cmFpbnRcblxuICAgICAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgICAgIGxldCBlID0gZW5jb2RlVVJJQ29tcG9uZW50KHgpO1xuICAgICAgICBsZXQgdXJsID0gYCR7bi50ZW1wbGF0ZS5tb2RlbC5taW5lLnVybH0vc2VydmljZS9xdWVyeS9yZXN1bHRzP3N1bW1hcnlQYXRoPSR7cH0mZm9ybWF0PWpzb25yb3dzJnF1ZXJ5PSR7ZX1gXG4gICAgICAgIGxldCB0aHJlc2hvbGQgPSAyNTA7XG5cbiAgICAgICAgLy8gY3ZhbHMgY29udGFpbnRzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUocylcbiAgICAgICAgbGV0IGN2YWxzID0gW107XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICAgICAgY3ZhbHMgPSBjLnZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgIGN2YWxzID0gWyBjLnZhbHVlIF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaWduYWwgdGhhdCB3ZSdyZSBzdGFydGluZ1xuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCB0cnVlKTtcbiAgICAgICAgLy8gZ28hXG4gICAgICAgIGxldCBwcm9tID0gZDNqc29uUHJvbWlzZSh1cmwpLnRoZW4oZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICAvLyBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgaW4ganNvbi5yZXVsdHMuXG4gICAgICAgICAgICAvLyBFYWNoIGxpc3QgaXRlbSBsb29rcyBsaWtlOiB7IGl0ZW06IFwic29tZXN0cmluZ1wiLCBjb3VudDogMTcgfVxuICAgICAgICAgICAgLy8gKFllcywgd2UgZ2V0IGNvdW50cyBmb3IgZnJlZSEgT3VnaHQgdG8gbWFrZSB1c2Ugb2YgdGhpcy4pXG4gICAgICAgICAgICBsZXQgcmVzID0ganNvbi5yZXN1bHRzLm1hcChyID0+IHIuaXRlbSkuc29ydCgpO1xuICAgICAgICAgICAgLy8gY2hlY2sgc2l6ZSBvZiByZXN1bHRcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgLy8gdG9vIGJpZy4gYXNrIHVzZXIgd2hhdCB0byBkby5cbiAgICAgICAgICAgICAgICBsZXQgYW5zID0gcHJvbXB0KGBUaGVyZSBhcmUgJHtyZXMubGVuZ3RofSByZXN1bHRzLCB3aGljaCBleGNlZWRzIHRoZSB0aHJlc2hvbGQgb2YgJHt0aHJlc2hvbGR9LiBIb3cgbWFueSBkbyB5b3Ugd2FudCB0byBzaG93P2AsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2VyIHNleiBjYW5jZWxcbiAgICAgICAgICAgICAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFucyA9IHBhcnNlSW50KGFucyk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGFucykgfHwgYW5zIDw9IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyB1c2VyIHdhbnRzIHRoaXMgbWFueSByZXN1bHRzXG4gICAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGFucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCA9IHJlcztcblxuICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCB0cnVlKTtcblxuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QsIFxuICAgICAgICAgICAgICAgICAgICB7IHNlbGVjdGVkOiBkID0+IGN2YWxzLmluZGV4T2YoZCkgIT09IC0xIHx8IG51bGwgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9tOyAvLyBzbyBjYWxsZXIgY2FuIGNoYWluXG4gICAgfVxuICAgIC8vXG4gICAgY2FuY2VsIChuLCBjKSB7XG4gICAgICAgIGlmICghIGMuc2F2ZWQpIHtcbiAgICAgICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXJTYXZlKG4pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgICBoaWRlKCkge1xuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5jbGFzc2VkKFwib3BlblwiLCBudWxsKTtcbiAgICB9XG4gICAgLy9cbiAgICBzYXZlRWRpdHMobiwgYykge1xuICAgICAgICAvL1xuICAgICAgICBsZXQgbyA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlO1xuICAgICAgICBjLnNldE9wKG8pO1xuICAgICAgICBjLnNhdmVkID0gdHJ1ZTtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHZhbCA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlO1xuICAgICAgICBsZXQgdmFscyA9IFtdO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkgdmFscy5wdXNoKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHogPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJykuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG5cbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICBjLnR5cGUgPSB2YWxzWzBdXG4gICAgICAgICAgICBjLnZhbHVlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBuLnNldFN1YmNsYXNzQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgIGlmKHJlbW92ZWQubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBhbGVydChcIkNvbnN0cmFpbmluZyB0byBzdWJjbGFzcyBcIiArIChjLnR5cGUgfHwgbi5wdHlwZS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICArIFwiIGNhdXNlZCB0aGUgZm9sbG93aW5nIHBhdGhzIHRvIGJlIHJlbW92ZWQ6IFwiIFxuICAgICAgICAgICAgICAgICAgICArIHJlbW92ZWQubWFwKG4gPT4gbi5wYXRoKS5qb2luKFwiLCBcIikpOyBcbiAgICAgICAgICAgICAgICB9LCAyNTApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWUgPSB2YWw7XG4gICAgICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgICAgICBjLmV4dHJhVmFsdWUgPSB2YWxzWzBdID09PSBcIkFueVwiID8gbnVsbCA6IHZhbHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgICAgIGMudmFsdWUgPSB2YWxzWzBdO1xuICAgICAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHogPyB2YWxzWzBdIDogdmFsO1xuICAgICAgICAgICAgYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJVbmtub3duIGN0eXBlOiBcIitjLmN0eXBlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLmFmdGVyU2F2ZSAmJiB0aGlzLmFmdGVyU2F2ZShuKTtcbiAgICB9XG5cbn0gLy8gY2xhc3MgQ29uc3RyYWludEVkaXRvclxuXG5leHBvcnQgeyBDb25zdHJhaW50RWRpdG9yIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9jb25zdHJhaW50RWRpdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9