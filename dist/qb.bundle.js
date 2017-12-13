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

    getJson () {
        let t = this.uncompileTemplate();
        return JSON.stringify(t, null, 2);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTI4MGJiYjViMDZiY2ZkNzU5Y2MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3RlbXBsYXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL25vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3JlZ2lzdHJ5LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29uc3RyYWludEVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLHdCQUF3QixHO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU0sYUFBYSxRQUFRO0FBQzNDO0FBQ0EsWUFBWSxZQUFZLEdBQUcsYUFBYTtBQUN4QztBQUNBLFlBQVksdUJBQXVCLEdBQUcsd0JBQXdCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLGlCQUFpQixFQUFFO0FBQ3BGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFlQTs7Ozs7Ozs7Ozs7O0FDN1JBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVHOzs7Ozs7O0FDcE9SO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGtDQUFrQyxhQUFhO0FBQy9DO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRVE7Ozs7Ozs7Ozs7O0FDOUdtQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtB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OztBQUUzQjtBQUNBO0FBQ0EscUJBQXFCLDBCQUEwQixxQ0FBcUMsRUFBRSx5QkFBeUIsRUFBRTtBQUNqSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFdBQVcsMkNBQTJDLFVBQVU7QUFDOUc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLGlEQUFpRDs7QUFFdEUsU0FBUztBQUNULG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUM7O0FBRU8iLCJmaWxlIjoicWIuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMTI4MGJiYjViMDZiY2ZkNzU5Y2MiLCJcbi8vXG4vLyBGdW5jdGlvbiB0byBlc2NhcGUgJzwnICdcIicgYW5kICcmJyBjaGFyYWN0ZXJzXG5mdW5jdGlvbiBlc2Mocyl7XG4gICAgaWYgKCFzKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIik7IFxufVxuXG4vLyBQcm9taXNpZmllcyBhIGNhbGwgdG8gZDMuanNvbi5cbi8vIEFyZ3M6XG4vLyAgIHVybCAoc3RyaW5nKSBUaGUgdXJsIG9mIHRoZSBqc29uIHJlc291cmNlXG4vLyBSZXR1cm5zOlxuLy8gICBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUganNvbiBvYmplY3QgdmFsdWUsIG9yIHJlamVjdHMgd2l0aCBhbiBlcnJvclxuZnVuY3Rpb24gZDNqc29uUHJvbWlzZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGQzLmpzb24odXJsLCBmdW5jdGlvbihlcnJvciwganNvbil7XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdCh7IHN0YXR1czogZXJyb3Iuc3RhdHVzLCBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0fSkgOiByZXNvbHZlKGpzb24pO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG4vLyBTZWxlY3RzIGFsbCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLiBcbi8vIFRoZSBjb250YWluZXIgbXVzdCBoYXZlIGFuIGlkLlxuLy8gQ29waWVkIGZyb206XG4vLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjc3NDUxL2hvdy10by1zZWxlY3QtZGl2LXRleHQtb24tYnV0dG9uLWNsaWNrXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGNvbnRhaW5lcmlkKSB7XG4gICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICByYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59XG5cbi8vIENvbnZlcnRzIGFuIEludGVyTWluZSBxdWVyeSBpbiBQYXRoUXVlcnkgWE1MIGZvcm1hdCB0byBhIEpTT04gb2JqZWN0IHJlcHJlc2VudGF0aW9uLlxuLy9cbmZ1bmN0aW9uIHBhcnNlUGF0aFF1ZXJ5KHhtbCl7XG4gICAgLy8gVHVybnMgdGhlIHF1YXNpLWxpc3Qgb2JqZWN0IHJldHVybmVkIGJ5IHNvbWUgRE9NIG1ldGhvZHMgaW50byBhY3R1YWwgbGlzdHMuXG4gICAgZnVuY3Rpb24gZG9tbGlzdDJhcnJheShsc3QpIHtcbiAgICAgICAgbGV0IGEgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8bHN0Lmxlbmd0aDsgaSsrKSBhLnB1c2gobHN0W2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIC8vIHBhcnNlIHRoZSBYTUxcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBkb20gPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgXCJ0ZXh0L3htbFwiKTtcblxuICAgIC8vIGdldCB0aGUgcGFydHMuIFVzZXIgbWF5IHBhc3RlIGluIGEgPHRlbXBsYXRlPiBvciBhIDxxdWVyeT5cbiAgICAvLyAoaS5lLiwgdGVtcGxhdGUgbWF5IGJlIG51bGwpXG4gICAgbGV0IHRlbXBsYXRlID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IHRpdGxlID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikgfHwgXCJcIjtcbiAgICBsZXQgY29tbWVudCA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcImNvbW1lbnRcIikgfHwgXCJcIjtcbiAgICBsZXQgcXVlcnkgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJxdWVyeVwiKVswXTtcbiAgICBsZXQgbW9kZWwgPSB7IG5hbWU6IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm1vZGVsXCIpIHx8IFwiZ2Vub21pY1wiIH07XG4gICAgbGV0IG5hbWUgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpIHx8IFwiXCI7XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibG9uZ0Rlc2NyaXRpb25cIikgfHwgXCJcIjtcbiAgICBsZXQgc2VsZWN0ID0gKHF1ZXJ5LmdldEF0dHJpYnV0ZShcInZpZXdcIikgfHwgXCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgbGV0IGNvbnN0cmFpbnRzID0gZG9tbGlzdDJhcnJheShkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnN0cmFpbnQnKSk7XG4gICAgbGV0IGNvbnN0cmFpbnRMb2dpYyA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImNvbnN0cmFpbnRMb2dpY1wiKTtcbiAgICBsZXQgam9pbnMgPSBkb21saXN0MmFycmF5KHF1ZXJ5LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiam9pblwiKSk7XG4gICAgbGV0IHNvcnRPcmRlciA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKSB8fCBcIlwiO1xuICAgIC8vXG4gICAgLy9cbiAgICBsZXQgd2hlcmUgPSBjb25zdHJhaW50cy5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgb3AgPSBjLmdldEF0dHJpYnV0ZShcIm9wXCIpO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjLmdldEF0dHJpYnV0ZShcInR5cGVcIik7XG4gICAgICAgICAgICAgICAgb3AgPSBcIklTQVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbHMgPSBkb21saXN0MmFycmF5KGMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ2YWx1ZVwiKSkubWFwKCB2ID0+IHYuaW5uZXJIVE1MICk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjLmdldEF0dHJpYnV0ZShcInBhdGhcIiksXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA6IHZhbHMsXG4gICAgICAgICAgICAgICAgdHlwZSA6IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjLmdldEF0dHJpYnV0ZShcImNvZGVcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGU6IGMuZ2V0QXR0cmlidXRlKFwiZWRpdGFibGVcIikgfHwgXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAvLyBDaGVjazogaWYgdGhlcmUgaXMgb25seSBvbmUgY29uc3RyYWludCwgKGFuZCBpdCdzIG5vdCBhbiBJU0EpLCBzb21ldGltZXMgdGhlIGNvbnN0cmFpbnRMb2dpYyBcbiAgICAvLyBhbmQvb3IgdGhlIGNvbnN0cmFpbnQgY29kZSBhcmUgbWlzc2luZy5cbiAgICBpZiAod2hlcmUubGVuZ3RoID09PSAxICYmIHdoZXJlWzBdLm9wICE9PSBcIklTQVwiICYmICF3aGVyZVswXS5jb2RlKXtcbiAgICAgICAgd2hlcmVbMF0uY29kZSA9IGNvbnN0cmFpbnRMb2dpYyA9IFwiQVwiO1xuICAgIH1cblxuICAgIC8vIG91dGVyIGpvaW5zLiBUaGV5IGxvb2sgbGlrZSB0aGlzOlxuICAgIC8vICAgICAgIDxqb2luIHBhdGg9XCJHZW5lLnNlcXVlbmNlT250b2xvZ3lUZXJtXCIgc3R5bGU9XCJPVVRFUlwiLz5cbiAgICBqb2lucyA9IGpvaW5zLm1hcCggaiA9PiBqLmdldEF0dHJpYnV0ZShcInBhdGhcIikgKTtcblxuICAgIGxldCBvcmRlckJ5ID0gbnVsbDtcbiAgICBpZiAoc29ydE9yZGVyKSB7XG4gICAgICAgIC8vIFRoZSBqc29uIGZvcm1hdCBmb3Igb3JkZXJCeSBpcyBhIGJpdCB3ZWlyZC5cbiAgICAgICAgLy8gSWYgdGhlIHhtbCBvcmRlckJ5IGlzOiBcIkEuYi5jIGFzYyBBLmQuZSBkZXNjXCIsXG4gICAgICAgIC8vIHRoZSBqc29uIHNob3VsZCBiZTogWyB7XCJBLmIuY1wiOlwiYXNjXCJ9LCB7XCJBLmQuZVwiOlwiZGVzY30gXVxuICAgICAgICAvLyBcbiAgICAgICAgLy8gVGhlIG9yZGVyYnkgc3RyaW5nIHRva2VucywgZS5nLiBbXCJBLmIuY1wiLCBcImFzY1wiLCBcIkEuZC5lXCIsIFwiZGVzY1wiXVxuICAgICAgICBsZXQgb2IgPSBzb3J0T3JkZXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIC8vIHNhbml0eSBjaGVjazpcbiAgICAgICAgaWYgKG9iLmxlbmd0aCAlIDIgKVxuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgcGFyc2UgdGhlIG9yZGVyQnkgY2xhdXNlOiBcIiArIHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKTtcbiAgICAgICAgLy8gY29udmVydCB0b2tlbnMgdG8ganNvbiBvcmRlckJ5IFxuICAgICAgICBvcmRlckJ5ID0gb2IucmVkdWNlKGZ1bmN0aW9uKGFjYywgY3VyciwgaSl7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApe1xuICAgICAgICAgICAgICAgIC8vIG9kZC4gY3VyciBpcyBhIHBhdGguIFB1c2ggaXQuXG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY3VycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGV2ZW4uIFBvcCB0aGUgcGF0aCwgY3JlYXRlIHRoZSB7fSwgYW5kIHB1c2ggaXQuXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB7fVxuICAgICAgICAgICAgICAgIGxldCBwID0gYWNjLnBvcCgpXG4gICAgICAgICAgICAgICAgdltwXSA9IGN1cnI7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYyxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgam9pbnMsXG4gICAgICAgIG9yZGVyQnlcbiAgICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZGVlcCBjb3B5IG9mIG9iamVjdCBvLiBcbi8vIEFyZ3M6XG4vLyAgIG8gIChvYmplY3QpIE11c3QgYmUgYSBKU09OIG9iamVjdCAobm8gY3VyY3VsYXIgcmVmcywgbm8gZnVuY3Rpb25zKS5cbi8vIFJldHVybnM6XG4vLyAgIGEgZGVlcCBjb3B5IG9mIG9cbmZ1bmN0aW9uIGRlZXBjKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBvO1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTtcbn1cblxuLy9cbmxldCBQUkVGSVg9XCJvcmcubWdpLmFwcHMucWJcIjtcbmZ1bmN0aW9uIHRlc3RMb2NhbChhdHRyKSB7XG4gICAgcmV0dXJuIChQUkVGSVgrXCIuXCIrYXR0cikgaW4gbG9jYWxTdG9yYWdlO1xufVxuZnVuY3Rpb24gc2V0TG9jYWwoYXR0ciwgdmFsLCBlbmNvZGUpe1xuICAgIGxvY2FsU3RvcmFnZVtQUkVGSVgrXCIuXCIrYXR0cl0gPSBlbmNvZGUgPyBKU09OLnN0cmluZ2lmeSh2YWwpIDogdmFsO1xufVxuZnVuY3Rpb24gZ2V0TG9jYWwoYXR0ciwgZGVjb2RlLCBkZmx0KXtcbiAgICBsZXQga2V5ID0gUFJFRklYK1wiLlwiK2F0dHI7XG4gICAgaWYgKGtleSBpbiBsb2NhbFN0b3JhZ2Upe1xuICAgICAgICBsZXQgdiA9IGxvY2FsU3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAoZGVjb2RlKSB2ID0gSlNPTi5wYXJzZSh2KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZGZsdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhckxvY2FsKCkge1xuICAgIGxldCBybXYgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoUFJFRklYKSk7XG4gICAgcm12LmZvckVhY2goIGsgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oaykgKTtcbn1cblxuLy8gUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBvYmplY3QuXG4vLyBUaGUgbGlzdCBpcyBzb3J0ZWQgYnkgdGhlIGl0ZW0ga2V5cy5cbi8vIElmIG5hbWVBdHRyIGlzIHNwZWNpZmllZCwgdGhlIGl0ZW0ga2V5IGlzIGFsc28gYWRkZWQgdG8gZWFjaCBlbGVtZW50XG4vLyBhcyBhbiBhdHRyaWJ1dGUgKG9ubHkgd29ya3MgaWYgdGhvc2UgaXRlbXMgYXJlIHRoZW1zZWx2ZXMgb2JqZWN0cykuXG4vLyBFeGFtcGxlczpcbi8vICAgIHN0YXRlcyA9IHsnTUUnOntuYW1lOidNYWluZSd9LCAnSUEnOntuYW1lOidJb3dhJ319XG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YSd9LCB7bmFtZTonTWFpbmUnfV1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMsICdhYmJyZXYnKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YScsYWJicmV2J0lBJ30sIHtuYW1lOidNYWluZScsYWJicmV2J01FJ31dXG4vLyBBcmdzOlxuLy8gICAgbyAgKG9iamVjdCkgVGhlIG9iamVjdC5cbi8vICAgIG5hbWVBdHRyIChzdHJpbmcpIElmIHNwZWNpZmllZCwgYWRkcyB0aGUgaXRlbSBrZXkgYXMgYW4gYXR0cmlidXRlIHRvIGVhY2ggbGlzdCBlbGVtZW50LlxuLy8gUmV0dXJuOlxuLy8gICAgbGlzdCBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIG9cbmZ1bmN0aW9uIG9iajJhcnJheShvLCBuYW1lQXR0cil7XG4gICAgbGV0IGtzID0gT2JqZWN0LmtleXMobyk7XG4gICAga3Muc29ydCgpO1xuICAgIHJldHVybiBrcy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG5hbWVBdHRyKSBvW2tdLm5hbWUgPSBrO1xuICAgICAgICByZXR1cm4gb1trXTtcbiAgICB9KTtcbn07XG5cbi8vIEFyZ3M6XG4vLyAgIHNlbGVjdG9yIChzdHJpbmcpIEZvciBzZWxlY3RpbmcgdGhlIDxzZWxlY3Q+IGVsZW1lbnRcbi8vICAgZGF0YSAobGlzdCkgRGF0YSB0byBiaW5kIHRvIG9wdGlvbnNcbi8vICAgY2ZnIChvYmplY3QpIEFkZGl0aW9uYWwgb3B0aW9uYWwgY29uZmlnczpcbi8vICAgICAgIHRpdGxlIC0gZnVuY3Rpb24gb3IgbGl0ZXJhbCBmb3Igc2V0dGluZyB0aGUgdGV4dCBvZiB0aGUgb3B0aW9uLiBcbi8vICAgICAgIHZhbHVlIC0gZnVuY3Rpb24gb3IgbGl0ZXJhbCBzZXR0aW5nIHRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uXG4vLyAgICAgICBzZWxlY3RlZCAtIGZ1bmN0aW9uIG9yIGFycmF5IG9yIHN0cmluZyBmb3IgZGVjaWRpbmcgd2hpY2ggb3B0aW9uKHMpIGFyZSBzZWxlY3RlZFxuLy8gICAgICAgICAgSWYgZnVuY3Rpb24sIGNhbGxlZCBmb3IgZWFjaCBvcHRpb24uXG4vLyAgICAgICAgICBJZiBhcnJheSwgc3BlY2lmaWVzIHRoZSB2YWx1ZXMgdG8gc2VsZWN0LlxuLy8gICAgICAgICAgSWYgc3RyaW5nLCBzcGVjaWZpZXMgd2hpY2ggdmFsdWUgaXMgc2VsZWN0ZWRcbi8vICAgICAgIGVtcHR5TWVzc2FnZSAtIGEgbWVzc2FnZSB0byBzaG93IGlmIHRoZSBkYXRhIGxpc3QgaXMgZW1wdHlcbi8vICAgICAgIG11bHRpcGxlIC0gaWYgdHJ1ZSwgbWFrZSBpdCBhIG11bHRpLXNlbGVjdCBsaXN0XG4vL1xuZnVuY3Rpb24gaW5pdE9wdGlvbkxpc3QgKHNlbGVjdG9yLCBkYXRhLCBjZmcpIHtcbiAgICBcbiAgICBjZmcgPSBjZmcgfHwge307XG5cbiAgICBsZXQgaWRlbnQgPSAoeD0+eCk7XG4gICAgbGV0IG9wdHM7XG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApe1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgY2ZnLnZhbHVlIHx8IGlkZW50KVxuICAgICAgICAgICAgLnRleHQoY2ZnLnRpdGxlIHx8IGlkZW50KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBudWxsKVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBudWxsKTtcbiAgICAgICAgaWYgKHR5cGVvZihjZmcuc2VsZWN0ZWQpID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIGZ1bmN0aW9uIHNheXMgc29cbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkKGQpfHxudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNmZy5zZWxlY3RlZCkpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBpcyBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkLmluZGV4T2YoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkpICE9IC0xIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNmZy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIG1hdGNoZXNcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpID09PSBjZmcuc2VsZWN0ZWQpIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHNlbGVjdG9yKVswXVswXS5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKFtjZmcuZW1wdHlNZXNzYWdlfHxcImVtcHR5IGxpc3RcIl0pO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIG9wdHMudGV4dChpZGVudCkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cbiAgICAvLyBzZXQgbXVsdGkgc2VsZWN0IChvciBub3QpXG4gICAgZDMuc2VsZWN0KHNlbGVjdG9yKS5hdHRyKFwibXVsdGlwbGVcIiwgY2ZnLm11bHRpcGxlIHx8IG51bGwpO1xuICAgIC8vIGFsbG93IGNhbGxlciB0byBjaGFpblxuICAgIHJldHVybiBvcHRzO1xufVxuXG4vLyBSZXR1cm5zICB0aGUgRE9NIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gZGF0YSBvYmplY3QuXG4vL1xuZnVuY3Rpb24gZmluZERvbUJ5RGF0YU9iaihkKXtcbiAgICBsZXQgeCA9IGQzLnNlbGVjdEFsbChcIi5ub2RlZ3JvdXAgLm5vZGVcIikuZmlsdGVyKGZ1bmN0aW9uKGRkKXsgcmV0dXJuIGRkID09PSBkOyB9KTtcbiAgICByZXR1cm4geFswXVswXTtcbn1cblxuLy9cbmZ1bmN0aW9uIGNvcHlPYmoodGd0LCBzcmMsIGRpcikge1xuICAgIGRpciA9IGRpciB8fCB0Z3Q7XG4gICAgZm9yKCBsZXQgbiBpbiBkaXIgKVxuICAgICAgICB0Z3Rbbl0gPSAobiBpbiBzcmMpID8gc3JjW25dIDogZGlyW25dO1xuICAgIHJldHVybiB0Z3Q7XG59XG5cbi8vXG5leHBvcnQge1xuICAgIGVzYyxcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgZ2V0TG9jYWwsXG4gICAgc2V0TG9jYWwsXG4gICAgdGVzdExvY2FsLFxuICAgIGNsZWFyTG9jYWwsXG4gICAgcGFyc2VQYXRoUXVlcnksXG4gICAgb2JqMmFycmF5LFxuICAgIGluaXRPcHRpb25MaXN0LFxuICAgIGZpbmREb21CeURhdGFPYmosXG4gICAgY29weU9ialxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gVmFsaWQgY29uc3RyYWludCB0eXBlcyAoY3R5cGUpOlxuLy8gICBudWxsLCBsb29rdXAsIHN1YmNsYXNzLCBsaXN0LCBsb29wLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgcmFuZ2Vcbi8vXG4vLyBDb25zdHJhaW50cyBvbiBhdHRyaWJ1dGVzOlxuLy8gLSB2YWx1ZSAoY29tcGFyaW5nIGFuIGF0dHJpYnV0ZSB0byBhIHZhbHVlLCB1c2luZyBhbiBvcGVyYXRvcilcbi8vICAgICAgPiA+PSA8IDw9ID0gIT0gTElLRSBOT1QtTElLRSBDT05UQUlOUyBET0VTLU5PVC1DT05UQUlOXG4vLyAtIG11bHRpdmFsdWUgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgbXVsdGlwbGUgdmFsdWUpXG4vLyAgICAgIE9ORS1PRiBOT1QtT05FIE9GXG4vLyAtIHJhbmdlIChzdWJ0eXBlIG9mIG11bHRpdmFsdWUsIGZvciBjb29yZGluYXRlIHJhbmdlcylcbi8vICAgICAgV0lUSElOIE9VVFNJREUgT1ZFUkxBUFMgRE9FUy1OT1QtT1ZFUkxBUFxuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwpXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vXG4vLyBDb25zdHJhaW50cyBvbiByZWZlcmVuY2VzL2NvbGxlY3Rpb25zXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTCByZWYvZW1wdHkgY29sbGVjdGlvbilcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy8gLSBsb29rdXAgKFxuLy8gICAgICBMT09LVVBcbi8vIC0gc3ViY2xhc3Ncbi8vICAgICAgSVNBXG4vLyAtIGxpc3Rcbi8vICAgICAgSU4gTk9ULUlOXG4vLyAtIGxvb3AgKFRPRE8pXG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGFyZSBudW1lcmljXG5sZXQgTlVNRVJJQ1RZUEVTPSBbXG4gICAgXCJpbnRcIiwgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwic2hvcnRcIiwgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImxvbmdcIiwgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiZmxvYXRcIiwgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImRvdWJsZVwiLCBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiXG5dO1xuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBjYW4gaGF2ZSBudWxsIHZhbHVlc1xubGV0IE5VTExBQkxFVFlQRVM9IFtcbiAgICBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiLFxuICAgIFwiamF2YS5sYW5nLlN0cmluZ1wiLFxuICAgIFwiamF2YS5sYW5nLkJvb2xlYW5cIlxuXTtcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgYW4gYXR0cmlidXRlIGNhbiBoYXZlXG5sZXQgTEVBRlRZUEVTPSBbXG4gICAgXCJpbnRcIiwgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwic2hvcnRcIiwgXCJqYXZhLmxhbmcuU2hvcnRcIixcbiAgICBcImxvbmdcIiwgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiZmxvYXRcIiwgXCJqYXZhLmxhbmcuRmxvYXRcIixcbiAgICBcImRvdWJsZVwiLCBcImphdmEubGFuZy5Eb3VibGVcIixcbiAgICBcImphdmEubWF0aC5CaWdEZWNpbWFsXCIsXG4gICAgXCJqYXZhLnV0aWwuRGF0ZVwiLFxuICAgIFwiamF2YS5sYW5nLlN0cmluZ1wiLFxuICAgIFwiamF2YS5sYW5nLkJvb2xlYW5cIixcbiAgICBcImphdmEubGFuZy5PYmplY3RcIixcbiAgICBcIm9yZy5pbnRlcm1pbmUub2JqZWN0c3RvcmUucXVlcnkuQ2xvYkFjY2Vzc1wiLFxuICAgIFwiT2JqZWN0XCJcbl1cblxuXG5sZXQgT1BTID0gW1xuXG4gICAgLy8gVmFsaWQgZm9yIGFueSBhdHRyaWJ1dGVcbiAgICAvLyBBbHNvIHRoZSBvcGVyYXRvcnMgZm9yIGxvb3AgY29uc3RyYWludHMgKG5vdCB5ZXQgaW1wbGVtZW50ZWQpLlxuICAgIHtcbiAgICBvcDogXCI9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0se1xuICAgIG9wOiBcIiE9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIG51bWVyaWMgYW5kIGRhdGUgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCI+XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI+PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPFwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPD1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIHN0cmluZyBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIkNPTlRBSU5TXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG5cbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBDT05UQUlOXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgZm9yIExvY2F0aW9uIG5vZGVzXG4gICAge1xuICAgIG9wOiBcIldJVEhJTlwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVkVSTEFQU1wiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBPVkVSTEFQXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9VVFNJREVcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSxcbiBcbiAgICAvLyBOVUxMIGNvbnN0cmFpbnRzLiBWYWxpZCBmb3IgYW55IG5vZGUgZXhjZXB0IHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiSVMgTk9UIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgKGkuZS4sIHRoZSByb290LCBvciBhbnkgXG4gICAgLy8gcmVmZXJlbmNlIG9yIGNvbGxlY3Rpb24gbm9kZSkuXG4gICAge1xuICAgIG9wOiBcIkxPT0tVUFwiLFxuICAgIGN0eXBlOiBcImxvb2t1cFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIElOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgZXhjZXB0IHRoZSByb290LlxuICAgIHtcbiAgICBvcDogXCJJU0FcIixcbiAgICBjdHlwZTogXCJzdWJjbGFzc1wiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfV07XG4vL1xubGV0IE9QSU5ERVggPSBPUFMucmVkdWNlKGZ1bmN0aW9uKHgsbyl7XG4gICAgeFtvLm9wXSA9IG87XG4gICAgcmV0dXJuIHg7XG59LCB7fSk7XG5cbmV4cG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJsZXQgcyA9IGBcbjNkX3JvdGF0aW9uIGU4NGRcbmFjX3VuaXQgZWIzYlxuYWNjZXNzX2FsYXJtIGUxOTBcbmFjY2Vzc19hbGFybXMgZTE5MVxuYWNjZXNzX3RpbWUgZTE5MlxuYWNjZXNzaWJpbGl0eSBlODRlXG5hY2Nlc3NpYmxlIGU5MTRcbmFjY291bnRfYmFsYW5jZSBlODRmXG5hY2NvdW50X2JhbGFuY2Vfd2FsbGV0IGU4NTBcbmFjY291bnRfYm94IGU4NTFcbmFjY291bnRfY2lyY2xlIGU4NTNcbmFkYiBlNjBlXG5hZGQgZTE0NVxuYWRkX2FfcGhvdG8gZTQzOVxuYWRkX2FsYXJtIGUxOTNcbmFkZF9hbGVydCBlMDAzXG5hZGRfYm94IGUxNDZcbmFkZF9jaXJjbGUgZTE0N1xuYWRkX2NpcmNsZV9vdXRsaW5lIGUxNDhcbmFkZF9sb2NhdGlvbiBlNTY3XG5hZGRfc2hvcHBpbmdfY2FydCBlODU0XG5hZGRfdG9fcGhvdG9zIGUzOWRcbmFkZF90b19xdWV1ZSBlMDVjXG5hZGp1c3QgZTM5ZVxuYWlybGluZV9zZWF0X2ZsYXQgZTYzMFxuYWlybGluZV9zZWF0X2ZsYXRfYW5nbGVkIGU2MzFcbmFpcmxpbmVfc2VhdF9pbmRpdmlkdWFsX3N1aXRlIGU2MzJcbmFpcmxpbmVfc2VhdF9sZWdyb29tX2V4dHJhIGU2MzNcbmFpcmxpbmVfc2VhdF9sZWdyb29tX25vcm1hbCBlNjM0XG5haXJsaW5lX3NlYXRfbGVncm9vbV9yZWR1Y2VkIGU2MzVcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX2V4dHJhIGU2MzZcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX25vcm1hbCBlNjM3XG5haXJwbGFuZW1vZGVfYWN0aXZlIGUxOTVcbmFpcnBsYW5lbW9kZV9pbmFjdGl2ZSBlMTk0XG5haXJwbGF5IGUwNTVcbmFpcnBvcnRfc2h1dHRsZSBlYjNjXG5hbGFybSBlODU1XG5hbGFybV9hZGQgZTg1NlxuYWxhcm1fb2ZmIGU4NTdcbmFsYXJtX29uIGU4NThcbmFsYnVtIGUwMTlcbmFsbF9pbmNsdXNpdmUgZWIzZFxuYWxsX291dCBlOTBiXG5hbmRyb2lkIGU4NTlcbmFubm91bmNlbWVudCBlODVhXG5hcHBzIGU1YzNcbmFyY2hpdmUgZTE0OVxuYXJyb3dfYmFjayBlNWM0XG5hcnJvd19kb3dud2FyZCBlNWRiXG5hcnJvd19kcm9wX2Rvd24gZTVjNVxuYXJyb3dfZHJvcF9kb3duX2NpcmNsZSBlNWM2XG5hcnJvd19kcm9wX3VwIGU1YzdcbmFycm93X2ZvcndhcmQgZTVjOFxuYXJyb3dfdXB3YXJkIGU1ZDhcbmFydF90cmFjayBlMDYwXG5hc3BlY3RfcmF0aW8gZTg1YlxuYXNzZXNzbWVudCBlODVjXG5hc3NpZ25tZW50IGU4NWRcbmFzc2lnbm1lbnRfaW5kIGU4NWVcbmFzc2lnbm1lbnRfbGF0ZSBlODVmXG5hc3NpZ25tZW50X3JldHVybiBlODYwXG5hc3NpZ25tZW50X3JldHVybmVkIGU4NjFcbmFzc2lnbm1lbnRfdHVybmVkX2luIGU4NjJcbmFzc2lzdGFudCBlMzlmXG5hc3Npc3RhbnRfcGhvdG8gZTNhMFxuYXR0YWNoX2ZpbGUgZTIyNlxuYXR0YWNoX21vbmV5IGUyMjdcbmF0dGFjaG1lbnQgZTJiY1xuYXVkaW90cmFjayBlM2ExXG5hdXRvcmVuZXcgZTg2M1xuYXZfdGltZXIgZTAxYlxuYmFja3NwYWNlIGUxNGFcbmJhY2t1cCBlODY0XG5iYXR0ZXJ5X2FsZXJ0IGUxOWNcbmJhdHRlcnlfY2hhcmdpbmdfZnVsbCBlMWEzXG5iYXR0ZXJ5X2Z1bGwgZTFhNFxuYmF0dGVyeV9zdGQgZTFhNVxuYmF0dGVyeV91bmtub3duIGUxYTZcbmJlYWNoX2FjY2VzcyBlYjNlXG5iZWVuaGVyZSBlNTJkXG5ibG9jayBlMTRiXG5ibHVldG9vdGggZTFhN1xuYmx1ZXRvb3RoX2F1ZGlvIGU2MGZcbmJsdWV0b290aF9jb25uZWN0ZWQgZTFhOFxuYmx1ZXRvb3RoX2Rpc2FibGVkIGUxYTlcbmJsdWV0b290aF9zZWFyY2hpbmcgZTFhYVxuYmx1cl9jaXJjdWxhciBlM2EyXG5ibHVyX2xpbmVhciBlM2EzXG5ibHVyX29mZiBlM2E0XG5ibHVyX29uIGUzYTVcbmJvb2sgZTg2NVxuYm9va21hcmsgZTg2NlxuYm9va21hcmtfYm9yZGVyIGU4NjdcbmJvcmRlcl9hbGwgZTIyOFxuYm9yZGVyX2JvdHRvbSBlMjI5XG5ib3JkZXJfY2xlYXIgZTIyYVxuYm9yZGVyX2NvbG9yIGUyMmJcbmJvcmRlcl9ob3Jpem9udGFsIGUyMmNcbmJvcmRlcl9pbm5lciBlMjJkXG5ib3JkZXJfbGVmdCBlMjJlXG5ib3JkZXJfb3V0ZXIgZTIyZlxuYm9yZGVyX3JpZ2h0IGUyMzBcbmJvcmRlcl9zdHlsZSBlMjMxXG5ib3JkZXJfdG9wIGUyMzJcbmJvcmRlcl92ZXJ0aWNhbCBlMjMzXG5icmFuZGluZ193YXRlcm1hcmsgZTA2YlxuYnJpZ2h0bmVzc18xIGUzYTZcbmJyaWdodG5lc3NfMiBlM2E3XG5icmlnaHRuZXNzXzMgZTNhOFxuYnJpZ2h0bmVzc180IGUzYTlcbmJyaWdodG5lc3NfNSBlM2FhXG5icmlnaHRuZXNzXzYgZTNhYlxuYnJpZ2h0bmVzc183IGUzYWNcbmJyaWdodG5lc3NfYXV0byBlMWFiXG5icmlnaHRuZXNzX2hpZ2ggZTFhY1xuYnJpZ2h0bmVzc19sb3cgZTFhZFxuYnJpZ2h0bmVzc19tZWRpdW0gZTFhZVxuYnJva2VuX2ltYWdlIGUzYWRcbmJydXNoIGUzYWVcbmJ1YmJsZV9jaGFydCBlNmRkXG5idWdfcmVwb3J0IGU4NjhcbmJ1aWxkIGU4NjlcbmJ1cnN0X21vZGUgZTQzY1xuYnVzaW5lc3MgZTBhZlxuYnVzaW5lc3NfY2VudGVyIGViM2ZcbmNhY2hlZCBlODZhXG5jYWtlIGU3ZTlcbmNhbGwgZTBiMFxuY2FsbF9lbmQgZTBiMVxuY2FsbF9tYWRlIGUwYjJcbmNhbGxfbWVyZ2UgZTBiM1xuY2FsbF9taXNzZWQgZTBiNFxuY2FsbF9taXNzZWRfb3V0Z29pbmcgZTBlNFxuY2FsbF9yZWNlaXZlZCBlMGI1XG5jYWxsX3NwbGl0IGUwYjZcbmNhbGxfdG9fYWN0aW9uIGUwNmNcbmNhbWVyYSBlM2FmXG5jYW1lcmFfYWx0IGUzYjBcbmNhbWVyYV9lbmhhbmNlIGU4ZmNcbmNhbWVyYV9mcm9udCBlM2IxXG5jYW1lcmFfcmVhciBlM2IyXG5jYW1lcmFfcm9sbCBlM2IzXG5jYW5jZWwgZTVjOVxuY2FyZF9naWZ0Y2FyZCBlOGY2XG5jYXJkX21lbWJlcnNoaXAgZThmN1xuY2FyZF90cmF2ZWwgZThmOFxuY2FzaW5vIGViNDBcbmNhc3QgZTMwN1xuY2FzdF9jb25uZWN0ZWQgZTMwOFxuY2VudGVyX2ZvY3VzX3N0cm9uZyBlM2I0XG5jZW50ZXJfZm9jdXNfd2VhayBlM2I1XG5jaGFuZ2VfaGlzdG9yeSBlODZiXG5jaGF0IGUwYjdcbmNoYXRfYnViYmxlIGUwY2FcbmNoYXRfYnViYmxlX291dGxpbmUgZTBjYlxuY2hlY2sgZTVjYVxuY2hlY2tfYm94IGU4MzRcbmNoZWNrX2JveF9vdXRsaW5lX2JsYW5rIGU4MzVcbmNoZWNrX2NpcmNsZSBlODZjXG5jaGV2cm9uX2xlZnQgZTVjYlxuY2hldnJvbl9yaWdodCBlNWNjXG5jaGlsZF9jYXJlIGViNDFcbmNoaWxkX2ZyaWVuZGx5IGViNDJcbmNocm9tZV9yZWFkZXJfbW9kZSBlODZkXG5jbGFzcyBlODZlXG5jbGVhciBlMTRjXG5jbGVhcl9hbGwgZTBiOFxuY2xvc2UgZTVjZFxuY2xvc2VkX2NhcHRpb24gZTAxY1xuY2xvdWQgZTJiZFxuY2xvdWRfY2lyY2xlIGUyYmVcbmNsb3VkX2RvbmUgZTJiZlxuY2xvdWRfZG93bmxvYWQgZTJjMFxuY2xvdWRfb2ZmIGUyYzFcbmNsb3VkX3F1ZXVlIGUyYzJcbmNsb3VkX3VwbG9hZCBlMmMzXG5jb2RlIGU4NmZcbmNvbGxlY3Rpb25zIGUzYjZcbmNvbGxlY3Rpb25zX2Jvb2ttYXJrIGU0MzFcbmNvbG9yX2xlbnMgZTNiN1xuY29sb3JpemUgZTNiOFxuY29tbWVudCBlMGI5XG5jb21wYXJlIGUzYjlcbmNvbXBhcmVfYXJyb3dzIGU5MTVcbmNvbXB1dGVyIGUzMGFcbmNvbmZpcm1hdGlvbl9udW1iZXIgZTYzOFxuY29udGFjdF9tYWlsIGUwZDBcbmNvbnRhY3RfcGhvbmUgZTBjZlxuY29udGFjdHMgZTBiYVxuY29udGVudF9jb3B5IGUxNGRcbmNvbnRlbnRfY3V0IGUxNGVcbmNvbnRlbnRfcGFzdGUgZTE0ZlxuY29udHJvbF9wb2ludCBlM2JhXG5jb250cm9sX3BvaW50X2R1cGxpY2F0ZSBlM2JiXG5jb3B5cmlnaHQgZTkwY1xuY3JlYXRlIGUxNTBcbmNyZWF0ZV9uZXdfZm9sZGVyIGUyY2NcbmNyZWRpdF9jYXJkIGU4NzBcbmNyb3AgZTNiZVxuY3JvcF8xNl85IGUzYmNcbmNyb3BfM18yIGUzYmRcbmNyb3BfNV80IGUzYmZcbmNyb3BfN181IGUzYzBcbmNyb3BfZGluIGUzYzFcbmNyb3BfZnJlZSBlM2MyXG5jcm9wX2xhbmRzY2FwZSBlM2MzXG5jcm9wX29yaWdpbmFsIGUzYzRcbmNyb3BfcG9ydHJhaXQgZTNjNVxuY3JvcF9yb3RhdGUgZTQzN1xuY3JvcF9zcXVhcmUgZTNjNlxuZGFzaGJvYXJkIGU4NzFcbmRhdGFfdXNhZ2UgZTFhZlxuZGF0ZV9yYW5nZSBlOTE2XG5kZWhhemUgZTNjN1xuZGVsZXRlIGU4NzJcbmRlbGV0ZV9mb3JldmVyIGU5MmJcbmRlbGV0ZV9zd2VlcCBlMTZjXG5kZXNjcmlwdGlvbiBlODczXG5kZXNrdG9wX21hYyBlMzBiXG5kZXNrdG9wX3dpbmRvd3MgZTMwY1xuZGV0YWlscyBlM2M4XG5kZXZlbG9wZXJfYm9hcmQgZTMwZFxuZGV2ZWxvcGVyX21vZGUgZTFiMFxuZGV2aWNlX2h1YiBlMzM1XG5kZXZpY2VzIGUxYjFcbmRldmljZXNfb3RoZXIgZTMzN1xuZGlhbGVyX3NpcCBlMGJiXG5kaWFscGFkIGUwYmNcbmRpcmVjdGlvbnMgZTUyZVxuZGlyZWN0aW9uc19iaWtlIGU1MmZcbmRpcmVjdGlvbnNfYm9hdCBlNTMyXG5kaXJlY3Rpb25zX2J1cyBlNTMwXG5kaXJlY3Rpb25zX2NhciBlNTMxXG5kaXJlY3Rpb25zX3JhaWx3YXkgZTUzNFxuZGlyZWN0aW9uc19ydW4gZTU2NlxuZGlyZWN0aW9uc19zdWJ3YXkgZTUzM1xuZGlyZWN0aW9uc190cmFuc2l0IGU1MzVcbmRpcmVjdGlvbnNfd2FsayBlNTM2XG5kaXNjX2Z1bGwgZTYxMFxuZG5zIGU4NzVcbmRvX25vdF9kaXN0dXJiIGU2MTJcbmRvX25vdF9kaXN0dXJiX2FsdCBlNjExXG5kb19ub3RfZGlzdHVyYl9vZmYgZTY0M1xuZG9fbm90X2Rpc3R1cmJfb24gZTY0NFxuZG9jayBlMzBlXG5kb21haW4gZTdlZVxuZG9uZSBlODc2XG5kb25lX2FsbCBlODc3XG5kb251dF9sYXJnZSBlOTE3XG5kb251dF9zbWFsbCBlOTE4XG5kcmFmdHMgZTE1MVxuZHJhZ19oYW5kbGUgZTI1ZFxuZHJpdmVfZXRhIGU2MTNcbmR2ciBlMWIyXG5lZGl0IGUzYzlcbmVkaXRfbG9jYXRpb24gZTU2OFxuZWplY3QgZThmYlxuZW1haWwgZTBiZVxuZW5oYW5jZWRfZW5jcnlwdGlvbiBlNjNmXG5lcXVhbGl6ZXIgZTAxZFxuZXJyb3IgZTAwMFxuZXJyb3Jfb3V0bGluZSBlMDAxXG5ldXJvX3N5bWJvbCBlOTI2XG5ldl9zdGF0aW9uIGU1NmRcbmV2ZW50IGU4NzhcbmV2ZW50X2F2YWlsYWJsZSBlNjE0XG5ldmVudF9idXN5IGU2MTVcbmV2ZW50X25vdGUgZTYxNlxuZXZlbnRfc2VhdCBlOTAzXG5leGl0X3RvX2FwcCBlODc5XG5leHBhbmRfbGVzcyBlNWNlXG5leHBhbmRfbW9yZSBlNWNmXG5leHBsaWNpdCBlMDFlXG5leHBsb3JlIGU4N2FcbmV4cG9zdXJlIGUzY2FcbmV4cG9zdXJlX25lZ18xIGUzY2JcbmV4cG9zdXJlX25lZ18yIGUzY2NcbmV4cG9zdXJlX3BsdXNfMSBlM2NkXG5leHBvc3VyZV9wbHVzXzIgZTNjZVxuZXhwb3N1cmVfemVybyBlM2NmXG5leHRlbnNpb24gZTg3YlxuZmFjZSBlODdjXG5mYXN0X2ZvcndhcmQgZTAxZlxuZmFzdF9yZXdpbmQgZTAyMFxuZmF2b3JpdGUgZTg3ZFxuZmF2b3JpdGVfYm9yZGVyIGU4N2VcbmZlYXR1cmVkX3BsYXlfbGlzdCBlMDZkXG5mZWF0dXJlZF92aWRlbyBlMDZlXG5mZWVkYmFjayBlODdmXG5maWJlcl9kdnIgZTA1ZFxuZmliZXJfbWFudWFsX3JlY29yZCBlMDYxXG5maWJlcl9uZXcgZTA1ZVxuZmliZXJfcGluIGUwNmFcbmZpYmVyX3NtYXJ0X3JlY29yZCBlMDYyXG5maWxlX2Rvd25sb2FkIGUyYzRcbmZpbGVfdXBsb2FkIGUyYzZcbmZpbHRlciBlM2QzXG5maWx0ZXJfMSBlM2QwXG5maWx0ZXJfMiBlM2QxXG5maWx0ZXJfMyBlM2QyXG5maWx0ZXJfNCBlM2Q0XG5maWx0ZXJfNSBlM2Q1XG5maWx0ZXJfNiBlM2Q2XG5maWx0ZXJfNyBlM2Q3XG5maWx0ZXJfOCBlM2Q4XG5maWx0ZXJfOSBlM2Q5XG5maWx0ZXJfOV9wbHVzIGUzZGFcbmZpbHRlcl9iX2FuZF93IGUzZGJcbmZpbHRlcl9jZW50ZXJfZm9jdXMgZTNkY1xuZmlsdGVyX2RyYW1hIGUzZGRcbmZpbHRlcl9mcmFtZXMgZTNkZVxuZmlsdGVyX2hkciBlM2RmXG5maWx0ZXJfbGlzdCBlMTUyXG5maWx0ZXJfbm9uZSBlM2UwXG5maWx0ZXJfdGlsdF9zaGlmdCBlM2UyXG5maWx0ZXJfdmludGFnZSBlM2UzXG5maW5kX2luX3BhZ2UgZTg4MFxuZmluZF9yZXBsYWNlIGU4ODFcbmZpbmdlcnByaW50IGU5MGRcbmZpcnN0X3BhZ2UgZTVkY1xuZml0bmVzc19jZW50ZXIgZWI0M1xuZmxhZyBlMTUzXG5mbGFyZSBlM2U0XG5mbGFzaF9hdXRvIGUzZTVcbmZsYXNoX29mZiBlM2U2XG5mbGFzaF9vbiBlM2U3XG5mbGlnaHQgZTUzOVxuZmxpZ2h0X2xhbmQgZTkwNFxuZmxpZ2h0X3Rha2VvZmYgZTkwNVxuZmxpcCBlM2U4XG5mbGlwX3RvX2JhY2sgZTg4MlxuZmxpcF90b19mcm9udCBlODgzXG5mb2xkZXIgZTJjN1xuZm9sZGVyX29wZW4gZTJjOFxuZm9sZGVyX3NoYXJlZCBlMmM5XG5mb2xkZXJfc3BlY2lhbCBlNjE3XG5mb250X2Rvd25sb2FkIGUxNjdcbmZvcm1hdF9hbGlnbl9jZW50ZXIgZTIzNFxuZm9ybWF0X2FsaWduX2p1c3RpZnkgZTIzNVxuZm9ybWF0X2FsaWduX2xlZnQgZTIzNlxuZm9ybWF0X2FsaWduX3JpZ2h0IGUyMzdcbmZvcm1hdF9ib2xkIGUyMzhcbmZvcm1hdF9jbGVhciBlMjM5XG5mb3JtYXRfY29sb3JfZmlsbCBlMjNhXG5mb3JtYXRfY29sb3JfcmVzZXQgZTIzYlxuZm9ybWF0X2NvbG9yX3RleHQgZTIzY1xuZm9ybWF0X2luZGVudF9kZWNyZWFzZSBlMjNkXG5mb3JtYXRfaW5kZW50X2luY3JlYXNlIGUyM2VcbmZvcm1hdF9pdGFsaWMgZTIzZlxuZm9ybWF0X2xpbmVfc3BhY2luZyBlMjQwXG5mb3JtYXRfbGlzdF9idWxsZXRlZCBlMjQxXG5mb3JtYXRfbGlzdF9udW1iZXJlZCBlMjQyXG5mb3JtYXRfcGFpbnQgZTI0M1xuZm9ybWF0X3F1b3RlIGUyNDRcbmZvcm1hdF9zaGFwZXMgZTI1ZVxuZm9ybWF0X3NpemUgZTI0NVxuZm9ybWF0X3N0cmlrZXRocm91Z2ggZTI0NlxuZm9ybWF0X3RleHRkaXJlY3Rpb25fbF90b19yIGUyNDdcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX3JfdG9fbCBlMjQ4XG5mb3JtYXRfdW5kZXJsaW5lZCBlMjQ5XG5mb3J1bSBlMGJmXG5mb3J3YXJkIGUxNTRcbmZvcndhcmRfMTAgZTA1NlxuZm9yd2FyZF8zMCBlMDU3XG5mb3J3YXJkXzUgZTA1OFxuZnJlZV9icmVha2Zhc3QgZWI0NFxuZnVsbHNjcmVlbiBlNWQwXG5mdWxsc2NyZWVuX2V4aXQgZTVkMVxuZnVuY3Rpb25zIGUyNGFcbmdfdHJhbnNsYXRlIGU5MjdcbmdhbWVwYWQgZTMwZlxuZ2FtZXMgZTAyMVxuZ2F2ZWwgZTkwZVxuZ2VzdHVyZSBlMTU1XG5nZXRfYXBwIGU4ODRcbmdpZiBlOTA4XG5nb2xmX2NvdXJzZSBlYjQ1XG5ncHNfZml4ZWQgZTFiM1xuZ3BzX25vdF9maXhlZCBlMWI0XG5ncHNfb2ZmIGUxYjVcbmdyYWRlIGU4ODVcbmdyYWRpZW50IGUzZTlcbmdyYWluIGUzZWFcbmdyYXBoaWNfZXEgZTFiOFxuZ3JpZF9vZmYgZTNlYlxuZ3JpZF9vbiBlM2VjXG5ncm91cCBlN2VmXG5ncm91cF9hZGQgZTdmMFxuZ3JvdXBfd29yayBlODg2XG5oZCBlMDUyXG5oZHJfb2ZmIGUzZWRcbmhkcl9vbiBlM2VlXG5oZHJfc3Ryb25nIGUzZjFcbmhkcl93ZWFrIGUzZjJcbmhlYWRzZXQgZTMxMFxuaGVhZHNldF9taWMgZTMxMVxuaGVhbGluZyBlM2YzXG5oZWFyaW5nIGUwMjNcbmhlbHAgZTg4N1xuaGVscF9vdXRsaW5lIGU4ZmRcbmhpZ2hfcXVhbGl0eSBlMDI0XG5oaWdobGlnaHQgZTI1ZlxuaGlnaGxpZ2h0X29mZiBlODg4XG5oaXN0b3J5IGU4ODlcbmhvbWUgZTg4YVxuaG90X3R1YiBlYjQ2XG5ob3RlbCBlNTNhXG5ob3VyZ2xhc3NfZW1wdHkgZTg4YlxuaG91cmdsYXNzX2Z1bGwgZTg4Y1xuaHR0cCBlOTAyXG5odHRwcyBlODhkXG5pbWFnZSBlM2Y0XG5pbWFnZV9hc3BlY3RfcmF0aW8gZTNmNVxuaW1wb3J0X2NvbnRhY3RzIGUwZTBcbmltcG9ydF9leHBvcnQgZTBjM1xuaW1wb3J0YW50X2RldmljZXMgZTkxMlxuaW5ib3ggZTE1NlxuaW5kZXRlcm1pbmF0ZV9jaGVja19ib3ggZTkwOVxuaW5mbyBlODhlXG5pbmZvX291dGxpbmUgZTg4ZlxuaW5wdXQgZTg5MFxuaW5zZXJ0X2NoYXJ0IGUyNGJcbmluc2VydF9jb21tZW50IGUyNGNcbmluc2VydF9kcml2ZV9maWxlIGUyNGRcbmluc2VydF9lbW90aWNvbiBlMjRlXG5pbnNlcnRfaW52aXRhdGlvbiBlMjRmXG5pbnNlcnRfbGluayBlMjUwXG5pbnNlcnRfcGhvdG8gZTI1MVxuaW52ZXJ0X2NvbG9ycyBlODkxXG5pbnZlcnRfY29sb3JzX29mZiBlMGM0XG5pc28gZTNmNlxua2V5Ym9hcmQgZTMxMlxua2V5Ym9hcmRfYXJyb3dfZG93biBlMzEzXG5rZXlib2FyZF9hcnJvd19sZWZ0IGUzMTRcbmtleWJvYXJkX2Fycm93X3JpZ2h0IGUzMTVcbmtleWJvYXJkX2Fycm93X3VwIGUzMTZcbmtleWJvYXJkX2JhY2tzcGFjZSBlMzE3XG5rZXlib2FyZF9jYXBzbG9jayBlMzE4XG5rZXlib2FyZF9oaWRlIGUzMWFcbmtleWJvYXJkX3JldHVybiBlMzFiXG5rZXlib2FyZF90YWIgZTMxY1xua2V5Ym9hcmRfdm9pY2UgZTMxZFxua2l0Y2hlbiBlYjQ3XG5sYWJlbCBlODkyXG5sYWJlbF9vdXRsaW5lIGU4OTNcbmxhbmRzY2FwZSBlM2Y3XG5sYW5ndWFnZSBlODk0XG5sYXB0b3AgZTMxZVxubGFwdG9wX2Nocm9tZWJvb2sgZTMxZlxubGFwdG9wX21hYyBlMzIwXG5sYXB0b3Bfd2luZG93cyBlMzIxXG5sYXN0X3BhZ2UgZTVkZFxubGF1bmNoIGU4OTVcbmxheWVycyBlNTNiXG5sYXllcnNfY2xlYXIgZTUzY1xubGVha19hZGQgZTNmOFxubGVha19yZW1vdmUgZTNmOVxubGVucyBlM2ZhXG5saWJyYXJ5X2FkZCBlMDJlXG5saWJyYXJ5X2Jvb2tzIGUwMmZcbmxpYnJhcnlfbXVzaWMgZTAzMFxubGlnaHRidWxiX291dGxpbmUgZTkwZlxubGluZV9zdHlsZSBlOTE5XG5saW5lX3dlaWdodCBlOTFhXG5saW5lYXJfc2NhbGUgZTI2MFxubGluayBlMTU3XG5saW5rZWRfY2FtZXJhIGU0Mzhcbmxpc3QgZTg5NlxubGl2ZV9oZWxwIGUwYzZcbmxpdmVfdHYgZTYzOVxubG9jYWxfYWN0aXZpdHkgZTUzZlxubG9jYWxfYWlycG9ydCBlNTNkXG5sb2NhbF9hdG0gZTUzZVxubG9jYWxfYmFyIGU1NDBcbmxvY2FsX2NhZmUgZTU0MVxubG9jYWxfY2FyX3dhc2ggZTU0MlxubG9jYWxfY29udmVuaWVuY2Vfc3RvcmUgZTU0M1xubG9jYWxfZGluaW5nIGU1NTZcbmxvY2FsX2RyaW5rIGU1NDRcbmxvY2FsX2Zsb3Jpc3QgZTU0NVxubG9jYWxfZ2FzX3N0YXRpb24gZTU0NlxubG9jYWxfZ3JvY2VyeV9zdG9yZSBlNTQ3XG5sb2NhbF9ob3NwaXRhbCBlNTQ4XG5sb2NhbF9ob3RlbCBlNTQ5XG5sb2NhbF9sYXVuZHJ5X3NlcnZpY2UgZTU0YVxubG9jYWxfbGlicmFyeSBlNTRiXG5sb2NhbF9tYWxsIGU1NGNcbmxvY2FsX21vdmllcyBlNTRkXG5sb2NhbF9vZmZlciBlNTRlXG5sb2NhbF9wYXJraW5nIGU1NGZcbmxvY2FsX3BoYXJtYWN5IGU1NTBcbmxvY2FsX3Bob25lIGU1NTFcbmxvY2FsX3BpenphIGU1NTJcbmxvY2FsX3BsYXkgZTU1M1xubG9jYWxfcG9zdF9vZmZpY2UgZTU1NFxubG9jYWxfcHJpbnRzaG9wIGU1NTVcbmxvY2FsX3NlZSBlNTU3XG5sb2NhbF9zaGlwcGluZyBlNTU4XG5sb2NhbF90YXhpIGU1NTlcbmxvY2F0aW9uX2NpdHkgZTdmMVxubG9jYXRpb25fZGlzYWJsZWQgZTFiNlxubG9jYXRpb25fb2ZmIGUwYzdcbmxvY2F0aW9uX29uIGUwYzhcbmxvY2F0aW9uX3NlYXJjaGluZyBlMWI3XG5sb2NrIGU4OTdcbmxvY2tfb3BlbiBlODk4XG5sb2NrX291dGxpbmUgZTg5OVxubG9va3MgZTNmY1xubG9va3NfMyBlM2ZiXG5sb29rc180IGUzZmRcbmxvb2tzXzUgZTNmZVxubG9va3NfNiBlM2ZmXG5sb29rc19vbmUgZTQwMFxubG9va3NfdHdvIGU0MDFcbmxvb3AgZTAyOFxubG91cGUgZTQwMlxubG93X3ByaW9yaXR5IGUxNmRcbmxveWFsdHkgZTg5YVxubWFpbCBlMTU4XG5tYWlsX291dGxpbmUgZTBlMVxubWFwIGU1NWJcbm1hcmt1bnJlYWQgZTE1OVxubWFya3VucmVhZF9tYWlsYm94IGU4OWJcbm1lbW9yeSBlMzIyXG5tZW51IGU1ZDJcbm1lcmdlX3R5cGUgZTI1MlxubWVzc2FnZSBlMGM5XG5taWMgZTAyOVxubWljX25vbmUgZTAyYVxubWljX29mZiBlMDJiXG5tbXMgZTYxOFxubW9kZV9jb21tZW50IGUyNTNcbm1vZGVfZWRpdCBlMjU0XG5tb25ldGl6YXRpb25fb24gZTI2M1xubW9uZXlfb2ZmIGUyNWNcbm1vbm9jaHJvbWVfcGhvdG9zIGU0MDNcbm1vb2QgZTdmMlxubW9vZF9iYWQgZTdmM1xubW9yZSBlNjE5XG5tb3JlX2hvcml6IGU1ZDNcbm1vcmVfdmVydCBlNWQ0XG5tb3RvcmN5Y2xlIGU5MWJcbm1vdXNlIGUzMjNcbm1vdmVfdG9faW5ib3ggZTE2OFxubW92aWUgZTAyY1xubW92aWVfY3JlYXRpb24gZTQwNFxubW92aWVfZmlsdGVyIGU0M2Fcbm11bHRpbGluZV9jaGFydCBlNmRmXG5tdXNpY19ub3RlIGU0MDVcbm11c2ljX3ZpZGVvIGUwNjNcbm15X2xvY2F0aW9uIGU1NWNcbm5hdHVyZSBlNDA2XG5uYXR1cmVfcGVvcGxlIGU0MDdcbm5hdmlnYXRlX2JlZm9yZSBlNDA4XG5uYXZpZ2F0ZV9uZXh0IGU0MDlcbm5hdmlnYXRpb24gZTU1ZFxubmVhcl9tZSBlNTY5XG5uZXR3b3JrX2NlbGwgZTFiOVxubmV0d29ya19jaGVjayBlNjQwXG5uZXR3b3JrX2xvY2tlZCBlNjFhXG5uZXR3b3JrX3dpZmkgZTFiYVxubmV3X3JlbGVhc2VzIGUwMzFcbm5leHRfd2VlayBlMTZhXG5uZmMgZTFiYlxubm9fZW5jcnlwdGlvbiBlNjQxXG5ub19zaW0gZTBjY1xubm90X2ludGVyZXN0ZWQgZTAzM1xubm90ZSBlMDZmXG5ub3RlX2FkZCBlODljXG5ub3RpZmljYXRpb25zIGU3ZjRcbm5vdGlmaWNhdGlvbnNfYWN0aXZlIGU3Zjdcbm5vdGlmaWNhdGlvbnNfbm9uZSBlN2Y1XG5ub3RpZmljYXRpb25zX29mZiBlN2Y2XG5ub3RpZmljYXRpb25zX3BhdXNlZCBlN2Y4XG5vZmZsaW5lX3BpbiBlOTBhXG5vbmRlbWFuZF92aWRlbyBlNjNhXG5vcGFjaXR5IGU5MWNcbm9wZW5faW5fYnJvd3NlciBlODlkXG5vcGVuX2luX25ldyBlODllXG5vcGVuX3dpdGggZTg5ZlxucGFnZXMgZTdmOVxucGFnZXZpZXcgZThhMFxucGFsZXR0ZSBlNDBhXG5wYW5fdG9vbCBlOTI1XG5wYW5vcmFtYSBlNDBiXG5wYW5vcmFtYV9maXNoX2V5ZSBlNDBjXG5wYW5vcmFtYV9ob3Jpem9udGFsIGU0MGRcbnBhbm9yYW1hX3ZlcnRpY2FsIGU0MGVcbnBhbm9yYW1hX3dpZGVfYW5nbGUgZTQwZlxucGFydHlfbW9kZSBlN2ZhXG5wYXVzZSBlMDM0XG5wYXVzZV9jaXJjbGVfZmlsbGVkIGUwMzVcbnBhdXNlX2NpcmNsZV9vdXRsaW5lIGUwMzZcbnBheW1lbnQgZThhMVxucGVvcGxlIGU3ZmJcbnBlb3BsZV9vdXRsaW5lIGU3ZmNcbnBlcm1fY2FtZXJhX21pYyBlOGEyXG5wZXJtX2NvbnRhY3RfY2FsZW5kYXIgZThhM1xucGVybV9kYXRhX3NldHRpbmcgZThhNFxucGVybV9kZXZpY2VfaW5mb3JtYXRpb24gZThhNVxucGVybV9pZGVudGl0eSBlOGE2XG5wZXJtX21lZGlhIGU4YTdcbnBlcm1fcGhvbmVfbXNnIGU4YThcbnBlcm1fc2Nhbl93aWZpIGU4YTlcbnBlcnNvbiBlN2ZkXG5wZXJzb25fYWRkIGU3ZmVcbnBlcnNvbl9vdXRsaW5lIGU3ZmZcbnBlcnNvbl9waW4gZTU1YVxucGVyc29uX3Bpbl9jaXJjbGUgZTU2YVxucGVyc29uYWxfdmlkZW8gZTYzYlxucGV0cyBlOTFkXG5waG9uZSBlMGNkXG5waG9uZV9hbmRyb2lkIGUzMjRcbnBob25lX2JsdWV0b290aF9zcGVha2VyIGU2MWJcbnBob25lX2ZvcndhcmRlZCBlNjFjXG5waG9uZV9pbl90YWxrIGU2MWRcbnBob25lX2lwaG9uZSBlMzI1XG5waG9uZV9sb2NrZWQgZTYxZVxucGhvbmVfbWlzc2VkIGU2MWZcbnBob25lX3BhdXNlZCBlNjIwXG5waG9uZWxpbmsgZTMyNlxucGhvbmVsaW5rX2VyYXNlIGUwZGJcbnBob25lbGlua19sb2NrIGUwZGNcbnBob25lbGlua19vZmYgZTMyN1xucGhvbmVsaW5rX3JpbmcgZTBkZFxucGhvbmVsaW5rX3NldHVwIGUwZGVcbnBob3RvIGU0MTBcbnBob3RvX2FsYnVtIGU0MTFcbnBob3RvX2NhbWVyYSBlNDEyXG5waG90b19maWx0ZXIgZTQzYlxucGhvdG9fbGlicmFyeSBlNDEzXG5waG90b19zaXplX3NlbGVjdF9hY3R1YWwgZTQzMlxucGhvdG9fc2l6ZV9zZWxlY3RfbGFyZ2UgZTQzM1xucGhvdG9fc2l6ZV9zZWxlY3Rfc21hbGwgZTQzNFxucGljdHVyZV9hc19wZGYgZTQxNVxucGljdHVyZV9pbl9waWN0dXJlIGU4YWFcbnBpY3R1cmVfaW5fcGljdHVyZV9hbHQgZTkxMVxucGllX2NoYXJ0IGU2YzRcbnBpZV9jaGFydF9vdXRsaW5lZCBlNmM1XG5waW5fZHJvcCBlNTVlXG5wbGFjZSBlNTVmXG5wbGF5X2Fycm93IGUwMzdcbnBsYXlfY2lyY2xlX2ZpbGxlZCBlMDM4XG5wbGF5X2NpcmNsZV9vdXRsaW5lIGUwMzlcbnBsYXlfZm9yX3dvcmsgZTkwNlxucGxheWxpc3RfYWRkIGUwM2JcbnBsYXlsaXN0X2FkZF9jaGVjayBlMDY1XG5wbGF5bGlzdF9wbGF5IGUwNWZcbnBsdXNfb25lIGU4MDBcbnBvbGwgZTgwMVxucG9seW1lciBlOGFiXG5wb29sIGViNDhcbnBvcnRhYmxlX3dpZmlfb2ZmIGUwY2VcbnBvcnRyYWl0IGU0MTZcbnBvd2VyIGU2M2NcbnBvd2VyX2lucHV0IGUzMzZcbnBvd2VyX3NldHRpbmdzX25ldyBlOGFjXG5wcmVnbmFudF93b21hbiBlOTFlXG5wcmVzZW50X3RvX2FsbCBlMGRmXG5wcmludCBlOGFkXG5wcmlvcml0eV9oaWdoIGU2NDVcbnB1YmxpYyBlODBiXG5wdWJsaXNoIGUyNTVcbnF1ZXJ5X2J1aWxkZXIgZThhZVxucXVlc3Rpb25fYW5zd2VyIGU4YWZcbnF1ZXVlIGUwM2NcbnF1ZXVlX211c2ljIGUwM2RcbnF1ZXVlX3BsYXlfbmV4dCBlMDY2XG5yYWRpbyBlMDNlXG5yYWRpb19idXR0b25fY2hlY2tlZCBlODM3XG5yYWRpb19idXR0b25fdW5jaGVja2VkIGU4MzZcbnJhdGVfcmV2aWV3IGU1NjBcbnJlY2VpcHQgZThiMFxucmVjZW50X2FjdG9ycyBlMDNmXG5yZWNvcmRfdm9pY2Vfb3ZlciBlOTFmXG5yZWRlZW0gZThiMVxucmVkbyBlMTVhXG5yZWZyZXNoIGU1ZDVcbnJlbW92ZSBlMTViXG5yZW1vdmVfY2lyY2xlIGUxNWNcbnJlbW92ZV9jaXJjbGVfb3V0bGluZSBlMTVkXG5yZW1vdmVfZnJvbV9xdWV1ZSBlMDY3XG5yZW1vdmVfcmVkX2V5ZSBlNDE3XG5yZW1vdmVfc2hvcHBpbmdfY2FydCBlOTI4XG5yZW9yZGVyIGU4ZmVcbnJlcGVhdCBlMDQwXG5yZXBlYXRfb25lIGUwNDFcbnJlcGxheSBlMDQyXG5yZXBsYXlfMTAgZTA1OVxucmVwbGF5XzMwIGUwNWFcbnJlcGxheV81IGUwNWJcbnJlcGx5IGUxNWVcbnJlcGx5X2FsbCBlMTVmXG5yZXBvcnQgZTE2MFxucmVwb3J0X3Byb2JsZW0gZThiMlxucmVzdGF1cmFudCBlNTZjXG5yZXN0YXVyYW50X21lbnUgZTU2MVxucmVzdG9yZSBlOGIzXG5yZXN0b3JlX3BhZ2UgZTkyOVxucmluZ192b2x1bWUgZTBkMVxucm9vbSBlOGI0XG5yb29tX3NlcnZpY2UgZWI0OVxucm90YXRlXzkwX2RlZ3JlZXNfY2N3IGU0MThcbnJvdGF0ZV9sZWZ0IGU0MTlcbnJvdGF0ZV9yaWdodCBlNDFhXG5yb3VuZGVkX2Nvcm5lciBlOTIwXG5yb3V0ZXIgZTMyOFxucm93aW5nIGU5MjFcbnJzc19mZWVkIGUwZTVcbnJ2X2hvb2t1cCBlNjQyXG5zYXRlbGxpdGUgZTU2Mlxuc2F2ZSBlMTYxXG5zY2FubmVyIGUzMjlcbnNjaGVkdWxlIGU4YjVcbnNjaG9vbCBlODBjXG5zY3JlZW5fbG9ja19sYW5kc2NhcGUgZTFiZVxuc2NyZWVuX2xvY2tfcG9ydHJhaXQgZTFiZlxuc2NyZWVuX2xvY2tfcm90YXRpb24gZTFjMFxuc2NyZWVuX3JvdGF0aW9uIGUxYzFcbnNjcmVlbl9zaGFyZSBlMGUyXG5zZF9jYXJkIGU2MjNcbnNkX3N0b3JhZ2UgZTFjMlxuc2VhcmNoIGU4YjZcbnNlY3VyaXR5IGUzMmFcbnNlbGVjdF9hbGwgZTE2Mlxuc2VuZCBlMTYzXG5zZW50aW1lbnRfZGlzc2F0aXNmaWVkIGU4MTFcbnNlbnRpbWVudF9uZXV0cmFsIGU4MTJcbnNlbnRpbWVudF9zYXRpc2ZpZWQgZTgxM1xuc2VudGltZW50X3ZlcnlfZGlzc2F0aXNmaWVkIGU4MTRcbnNlbnRpbWVudF92ZXJ5X3NhdGlzZmllZCBlODE1XG5zZXR0aW5ncyBlOGI4XG5zZXR0aW5nc19hcHBsaWNhdGlvbnMgZThiOVxuc2V0dGluZ3NfYmFja3VwX3Jlc3RvcmUgZThiYVxuc2V0dGluZ3NfYmx1ZXRvb3RoIGU4YmJcbnNldHRpbmdzX2JyaWdodG5lc3MgZThiZFxuc2V0dGluZ3NfY2VsbCBlOGJjXG5zZXR0aW5nc19ldGhlcm5ldCBlOGJlXG5zZXR0aW5nc19pbnB1dF9hbnRlbm5hIGU4YmZcbnNldHRpbmdzX2lucHV0X2NvbXBvbmVudCBlOGMwXG5zZXR0aW5nc19pbnB1dF9jb21wb3NpdGUgZThjMVxuc2V0dGluZ3NfaW5wdXRfaGRtaSBlOGMyXG5zZXR0aW5nc19pbnB1dF9zdmlkZW8gZThjM1xuc2V0dGluZ3Nfb3ZlcnNjYW4gZThjNFxuc2V0dGluZ3NfcGhvbmUgZThjNVxuc2V0dGluZ3NfcG93ZXIgZThjNlxuc2V0dGluZ3NfcmVtb3RlIGU4YzdcbnNldHRpbmdzX3N5c3RlbV9kYXlkcmVhbSBlMWMzXG5zZXR0aW5nc192b2ljZSBlOGM4XG5zaGFyZSBlODBkXG5zaG9wIGU4YzlcbnNob3BfdHdvIGU4Y2FcbnNob3BwaW5nX2Jhc2tldCBlOGNiXG5zaG9wcGluZ19jYXJ0IGU4Y2NcbnNob3J0X3RleHQgZTI2MVxuc2hvd19jaGFydCBlNmUxXG5zaHVmZmxlIGUwNDNcbnNpZ25hbF9jZWxsdWxhcl80X2JhciBlMWM4XG5zaWduYWxfY2VsbHVsYXJfY29ubmVjdGVkX25vX2ludGVybmV0XzRfYmFyIGUxY2RcbnNpZ25hbF9jZWxsdWxhcl9ub19zaW0gZTFjZVxuc2lnbmFsX2NlbGx1bGFyX251bGwgZTFjZlxuc2lnbmFsX2NlbGx1bGFyX29mZiBlMWQwXG5zaWduYWxfd2lmaV80X2JhciBlMWQ4XG5zaWduYWxfd2lmaV80X2Jhcl9sb2NrIGUxZDlcbnNpZ25hbF93aWZpX29mZiBlMWRhXG5zaW1fY2FyZCBlMzJiXG5zaW1fY2FyZF9hbGVydCBlNjI0XG5za2lwX25leHQgZTA0NFxuc2tpcF9wcmV2aW91cyBlMDQ1XG5zbGlkZXNob3cgZTQxYlxuc2xvd19tb3Rpb25fdmlkZW8gZTA2OFxuc21hcnRwaG9uZSBlMzJjXG5zbW9rZV9mcmVlIGViNGFcbnNtb2tpbmdfcm9vbXMgZWI0Ylxuc21zIGU2MjVcbnNtc19mYWlsZWQgZTYyNlxuc25vb3plIGUwNDZcbnNvcnQgZTE2NFxuc29ydF9ieV9hbHBoYSBlMDUzXG5zcGEgZWI0Y1xuc3BhY2VfYmFyIGUyNTZcbnNwZWFrZXIgZTMyZFxuc3BlYWtlcl9ncm91cCBlMzJlXG5zcGVha2VyX25vdGVzIGU4Y2RcbnNwZWFrZXJfbm90ZXNfb2ZmIGU5MmFcbnNwZWFrZXJfcGhvbmUgZTBkMlxuc3BlbGxjaGVjayBlOGNlXG5zdGFyIGU4MzhcbnN0YXJfYm9yZGVyIGU4M2FcbnN0YXJfaGFsZiBlODM5XG5zdGFycyBlOGQwXG5zdGF5X2N1cnJlbnRfbGFuZHNjYXBlIGUwZDNcbnN0YXlfY3VycmVudF9wb3J0cmFpdCBlMGQ0XG5zdGF5X3ByaW1hcnlfbGFuZHNjYXBlIGUwZDVcbnN0YXlfcHJpbWFyeV9wb3J0cmFpdCBlMGQ2XG5zdG9wIGUwNDdcbnN0b3Bfc2NyZWVuX3NoYXJlIGUwZTNcbnN0b3JhZ2UgZTFkYlxuc3RvcmUgZThkMVxuc3RvcmVfbWFsbF9kaXJlY3RvcnkgZTU2M1xuc3RyYWlnaHRlbiBlNDFjXG5zdHJlZXR2aWV3IGU1NmVcbnN0cmlrZXRocm91Z2hfcyBlMjU3XG5zdHlsZSBlNDFkXG5zdWJkaXJlY3RvcnlfYXJyb3dfbGVmdCBlNWQ5XG5zdWJkaXJlY3RvcnlfYXJyb3dfcmlnaHQgZTVkYVxuc3ViamVjdCBlOGQyXG5zdWJzY3JpcHRpb25zIGUwNjRcbnN1YnRpdGxlcyBlMDQ4XG5zdWJ3YXkgZTU2Zlxuc3VwZXJ2aXNvcl9hY2NvdW50IGU4ZDNcbnN1cnJvdW5kX3NvdW5kIGUwNDlcbnN3YXBfY2FsbHMgZTBkN1xuc3dhcF9ob3JpeiBlOGQ0XG5zd2FwX3ZlcnQgZThkNVxuc3dhcF92ZXJ0aWNhbF9jaXJjbGUgZThkNlxuc3dpdGNoX2NhbWVyYSBlNDFlXG5zd2l0Y2hfdmlkZW8gZTQxZlxuc3luYyBlNjI3XG5zeW5jX2Rpc2FibGVkIGU2MjhcbnN5bmNfcHJvYmxlbSBlNjI5XG5zeXN0ZW1fdXBkYXRlIGU2MmFcbnN5c3RlbV91cGRhdGVfYWx0IGU4ZDdcbnRhYiBlOGQ4XG50YWJfdW5zZWxlY3RlZCBlOGQ5XG50YWJsZXQgZTMyZlxudGFibGV0X2FuZHJvaWQgZTMzMFxudGFibGV0X21hYyBlMzMxXG50YWdfZmFjZXMgZTQyMFxudGFwX2FuZF9wbGF5IGU2MmJcbnRlcnJhaW4gZTU2NFxudGV4dF9maWVsZHMgZTI2MlxudGV4dF9mb3JtYXQgZTE2NVxudGV4dHNtcyBlMGQ4XG50ZXh0dXJlIGU0MjFcbnRoZWF0ZXJzIGU4ZGFcbnRodW1iX2Rvd24gZThkYlxudGh1bWJfdXAgZThkY1xudGh1bWJzX3VwX2Rvd24gZThkZFxudGltZV90b19sZWF2ZSBlNjJjXG50aW1lbGFwc2UgZTQyMlxudGltZWxpbmUgZTkyMlxudGltZXIgZTQyNVxudGltZXJfMTAgZTQyM1xudGltZXJfMyBlNDI0XG50aW1lcl9vZmYgZTQyNlxudGl0bGUgZTI2NFxudG9jIGU4ZGVcbnRvZGF5IGU4ZGZcbnRvbGwgZThlMFxudG9uYWxpdHkgZTQyN1xudG91Y2hfYXBwIGU5MTNcbnRveXMgZTMzMlxudHJhY2tfY2hhbmdlcyBlOGUxXG50cmFmZmljIGU1NjVcbnRyYWluIGU1NzBcbnRyYW0gZTU3MVxudHJhbnNmZXJfd2l0aGluX2Ffc3RhdGlvbiBlNTcyXG50cmFuc2Zvcm0gZTQyOFxudHJhbnNsYXRlIGU4ZTJcbnRyZW5kaW5nX2Rvd24gZThlM1xudHJlbmRpbmdfZmxhdCBlOGU0XG50cmVuZGluZ191cCBlOGU1XG50dW5lIGU0MjlcbnR1cm5lZF9pbiBlOGU2XG50dXJuZWRfaW5fbm90IGU4ZTdcbnR2IGUzMzNcbnVuYXJjaGl2ZSBlMTY5XG51bmRvIGUxNjZcbnVuZm9sZF9sZXNzIGU1ZDZcbnVuZm9sZF9tb3JlIGU1ZDdcbnVwZGF0ZSBlOTIzXG51c2IgZTFlMFxudmVyaWZpZWRfdXNlciBlOGU4XG52ZXJ0aWNhbF9hbGlnbl9ib3R0b20gZTI1OFxudmVydGljYWxfYWxpZ25fY2VudGVyIGUyNTlcbnZlcnRpY2FsX2FsaWduX3RvcCBlMjVhXG52aWJyYXRpb24gZTYyZFxudmlkZW9fY2FsbCBlMDcwXG52aWRlb19sYWJlbCBlMDcxXG52aWRlb19saWJyYXJ5IGUwNGFcbnZpZGVvY2FtIGUwNGJcbnZpZGVvY2FtX29mZiBlMDRjXG52aWRlb2dhbWVfYXNzZXQgZTMzOFxudmlld19hZ2VuZGEgZThlOVxudmlld19hcnJheSBlOGVhXG52aWV3X2Nhcm91c2VsIGU4ZWJcbnZpZXdfY29sdW1uIGU4ZWNcbnZpZXdfY29tZnkgZTQyYVxudmlld19jb21wYWN0IGU0MmJcbnZpZXdfZGF5IGU4ZWRcbnZpZXdfaGVhZGxpbmUgZThlZVxudmlld19saXN0IGU4ZWZcbnZpZXdfbW9kdWxlIGU4ZjBcbnZpZXdfcXVpbHQgZThmMVxudmlld19zdHJlYW0gZThmMlxudmlld193ZWVrIGU4ZjNcbnZpZ25ldHRlIGU0MzVcbnZpc2liaWxpdHkgZThmNFxudmlzaWJpbGl0eV9vZmYgZThmNVxudm9pY2VfY2hhdCBlNjJlXG52b2ljZW1haWwgZTBkOVxudm9sdW1lX2Rvd24gZTA0ZFxudm9sdW1lX211dGUgZTA0ZVxudm9sdW1lX29mZiBlMDRmXG52b2x1bWVfdXAgZTA1MFxudnBuX2tleSBlMGRhXG52cG5fbG9jayBlNjJmXG53YWxscGFwZXIgZTFiY1xud2FybmluZyBlMDAyXG53YXRjaCBlMzM0XG53YXRjaF9sYXRlciBlOTI0XG53Yl9hdXRvIGU0MmNcbndiX2Nsb3VkeSBlNDJkXG53Yl9pbmNhbmRlc2NlbnQgZTQyZVxud2JfaXJpZGVzY2VudCBlNDM2XG53Yl9zdW5ueSBlNDMwXG53YyBlNjNkXG53ZWIgZTA1MVxud2ViX2Fzc2V0IGUwNjlcbndlZWtlbmQgZTE2Ylxud2hhdHNob3QgZTgwZVxud2lkZ2V0cyBlMWJkXG53aWZpIGU2M2VcbndpZmlfbG9jayBlMWUxXG53aWZpX3RldGhlcmluZyBlMWUyXG53b3JrIGU4ZjlcbndyYXBfdGV4dCBlMjViXG55b3V0dWJlX3NlYXJjaGVkX2ZvciBlOGZhXG56b29tX2luIGU4ZmZcbnpvb21fb3V0IGU5MDBcbnpvb21fb3V0X21hcCBlNTZiXG5gO1xuXG5sZXQgY29kZXBvaW50cyA9IHMudHJpbSgpLnNwbGl0KFwiXFxuXCIpLnJlZHVjZShmdW5jdGlvbihjdiwgbnYpe1xuICAgIGxldCBwYXJ0cyA9IG52LnNwbGl0KC8gKy8pO1xuICAgIGxldCB1YyA9ICdcXFxcdScgKyBwYXJ0c1sxXTtcbiAgICBjdltwYXJ0c1swXV0gPSBldmFsKCdcIicgKyB1YyArICdcIicpO1xuICAgIHJldHVybiBjdjtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29kZXBvaW50c1xufVxuXG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBMRUFGVFlQRVMgfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBkZWVwYywgb2JqMmFycmF5IH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbi8vIEEgTW9kZWwgcmVwcmVzZW50cyB0aGUgZGF0YSBtb2RlbCBvZiBhIG1pbmUuIEl0IGlzIGEgY2xhc3MtaWZpZWQgYW5kIGV4cGFuZGVkXG4vLyB2ZXJzaW9uIG9mIHRoZSBkYXRhIHN0cnVjdHVyZSByZXR1cm5lZCBieSB0aGUgL21vZGVsIHNlcnZpY2UgY2FsbC5cbi8vXG5jbGFzcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IgKGNmZywgbWluZSkge1xuICAgICAgICBsZXQgbW9kZWwgPSB0aGlzO1xuICAgICAgICB0aGlzLm1pbmUgPSBtaW5lO1xuICAgICAgICB0aGlzLnBhY2thZ2UgPSBjZmcucGFja2FnZTtcbiAgICAgICAgdGhpcy5uYW1lID0gY2ZnLm5hbWU7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IGRlZXBjKGNmZy5jbGFzc2VzKTtcblxuICAgICAgICAvLyBGaXJzdCBhZGQgY2xhc3NlcyB0aGF0IHJlcHJlc2VudCB0aGUgYmFzaWMgdHlwZVxuICAgICAgICBMRUFGVFlQRVMuZm9yRWFjaCggbiA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzZXNbbl0gPSB7XG4gICAgICAgICAgICAgICAgaXNMZWFmVHlwZTogdHJ1ZSwgICAvLyBkaXN0aW5ndWlzaGVzIHRoZXNlIGZyb20gbW9kZWwgY2xhc3Nlc1xuICAgICAgICAgICAgICAgIG5hbWU6IG4sXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG4sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlczogW10sXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmFsbENsYXNzZXMgPSBvYmoyYXJyYXkodGhpcy5jbGFzc2VzKVxuICAgICAgICBsZXQgY25zID0gT2JqZWN0LmtleXModGhpcy5jbGFzc2VzKTtcbiAgICAgICAgY25zLnNvcnQoKVxuICAgICAgICBjbnMuZm9yRWFjaChmdW5jdGlvbihjbil7IC8vIGZvciBlYWNoIGNsYXNzIG5hbWVcbiAgICAgICAgICAgIGxldCBjbHMgPSBtb2RlbC5jbGFzc2VzW2NuXTtcbiAgICAgICAgICAgIC8vIGdlbmVyYXRlIGFycmF5cyBmb3IgY29udmVuaWVudCBhY2Nlc3NcbiAgICAgICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzID0gb2JqMmFycmF5KGNscy5hdHRyaWJ1dGVzKVxuICAgICAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMgPSBvYmoyYXJyYXkoY2xzLnJlZmVyZW5jZXMpXG4gICAgICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMgPSBvYmoyYXJyYXkoY2xzLmNvbGxlY3Rpb25zKVxuICAgICAgICAgICAgY2xzLmFsbEF0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJhdHRyaWJ1dGVcIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsUmVmZXJlbmNlcy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcInJlZmVyZW5jZVwiOyB9KTtcbiAgICAgICAgICAgIGNscy5hbGxDb2xsZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHgpeyB4LmtpbmQgPSBcImNvbGxlY3Rpb25cIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsUGFydHMgPSBjbHMuYWxsQXR0cmlidXRlcy5jb25jYXQoY2xzLmFsbFJlZmVyZW5jZXMpLmNvbmNhdChjbHMuYWxsQ29sbGVjdGlvbnMpO1xuICAgICAgICAgICAgY2xzLmFsbFBhcnRzLnNvcnQoZnVuY3Rpb24oYSxiKXsgcmV0dXJuIGEubmFtZSA8IGIubmFtZSA/IC0xIDogYS5uYW1lID4gYi5uYW1lID8gMSA6IDA7IH0pO1xuICAgICAgICAgICAgbW9kZWwuYWxsQ2xhc3Nlcy5wdXNoKGNscyk7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IGV4dGVuZHMgZnJvbSBhIGxpc3Qgb2YgbmFtZXMgdG8gYSBsaXN0IG9mIGNsYXNzIG9iamVjdHMuXG4gICAgICAgICAgICAvLyBBbHNvIGFkZCB0aGUgaW52ZXJzZSBsaXN0LCBleHRlbmRlZEJ5LlxuICAgICAgICAgICAgY2xzW1wiZXh0ZW5kc1wiXSA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGxldCBiYyA9IG1vZGVsLmNsYXNzZXNbZV07XG4gICAgICAgICAgICAgICAgaWYgKCFiYykgdGhyb3cgXCJObyBjbGFzcyBuYW1lZDogXCIgKyBlO1xuICAgICAgICAgICAgICAgIGlmIChiYy5leHRlbmRlZEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkucHVzaChjbHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeSA9IFtjbHNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYmM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEF0dHJpYnV0ZXM6IHN0b3JlIGNsYXNzIG9iaiBvZiByZWZlcmVuY2VkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLmF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24oYW4pe1xuICAgICAgICAgICAgICAgIGxldCBhID0gY2xzLmF0dHJpYnV0ZXNbYW5dO1xuICAgICAgICAgICAgICAgIGxldCB0ID0gbW9kZWwuY2xhc3Nlc1thLnR5cGVdO1xuICAgICAgICAgICAgICAgIGlmICghdCkgdGhyb3cgXCJObyBjbGFzcyBuYW1lZDogXCIgKyBhLnR5cGU7XG4gICAgICAgICAgICAgICAgYS50eXBlID0gdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVmZXJlbmNlczogc3RvcmUgY2xhc3Mgb2JqIG9mIHJlZmVyZW5jZWRUeXBlXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbHMucmVmZXJlbmNlcykuZm9yRWFjaChmdW5jdGlvbihybil7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBjbHMucmVmZXJlbmNlc1tybl07XG4gICAgICAgICAgICAgICAgci50eXBlID0gbW9kZWwuY2xhc3Nlc1tyLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDb2xsZWN0aW9uczogc3RvcmUgY2xhc3Mgb2JqIG9mIHJlZmVyZW5jZWRUeXBlXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbHMuY29sbGVjdGlvbnMpLmZvckVhY2goZnVuY3Rpb24oY24pe1xuICAgICAgICAgICAgICAgIGxldCBjID0gY2xzLmNvbGxlY3Rpb25zW2NuXTtcbiAgICAgICAgICAgICAgICBjLnR5cGUgPSBtb2RlbC5jbGFzc2VzW2MucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufSAvLyBlbmQgb2YgY2xhc3MgTW9kZWxcblxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1cGVyY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoXG4vLyBUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKGNscyl7XG4gICAgaWYgKGNscy5pc0xlYWZUeXBlIHx8ICFjbHNbXCJleHRlbmRzXCJdIHx8IGNsc1tcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICBsZXQgYW5jID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3VwZXJjbGFzc2VzKHNjKTsgfSk7XG4gICAgbGV0IGFsbCA9IGNsc1tcImV4dGVuZHNcIl0uY29uY2F0KGFuYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIGxldCBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1YmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdWJjbGFzc2VzKGNscyl7XG4gICAgaWYgKGNscy5pc0xlYWZUeXBlIHx8ICFjbHMuZXh0ZW5kZWRCeSB8fCBjbHMuZXh0ZW5kZWRCeS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIGxldCBkZXNjID0gY2xzLmV4dGVuZGVkQnkubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1YmNsYXNzZXMoc2MpOyB9KTtcbiAgICBsZXQgYWxsID0gY2xzLmV4dGVuZGVkQnkuY29uY2F0KGRlc2MucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICBsZXQgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiBzdWIgaXMgYSBzdWJjbGFzcyBvZiBzdXAuXG5mdW5jdGlvbiBpc1N1YmNsYXNzKHN1YixzdXApIHtcbiAgICBpZiAoc3ViID09PSBzdXApIHJldHVybiB0cnVlO1xuICAgIGlmIChzdWIuaXNMZWFmVHlwZSB8fCAhc3ViW1wiZXh0ZW5kc1wiXSB8fCBzdWJbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgbGV0IHIgPSBzdWJbXCJleHRlbmRzXCJdLmZpbHRlcihmdW5jdGlvbih4KXsgcmV0dXJuIHg9PT1zdXAgfHwgaXNTdWJjbGFzcyh4LCBzdXApOyB9KTtcbiAgICByZXR1cm4gci5sZW5ndGggPiAwO1xufVxuXG5cbmV4cG9ydCB7XG4gICAgTW9kZWwsXG4gICAgZ2V0U3ViY2xhc3NlcyxcbiAgICBnZXRTdXBlcmNsYXNzZXMsXG4gICAgaXNTdWJjbGFzc1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbW9kZWwuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7IGVzYywgZGVlcGMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmNsYXNzIENvbnN0cmFpbnQge1xuICAgIGNvbnN0cnVjdG9yIChjKSB7XG4gICAgICAgIGMgPSBjIHx8IHt9XG4gICAgICAgIC8vIHNhdmUgdGhlICBub2RlXG4gICAgICAgIHRoaXMubm9kZSA9IGMubm9kZSB8fCBudWxsO1xuICAgICAgICAvLyBhbGwgY29uc3RyYWludHMgaGF2ZSB0aGlzXG4gICAgICAgIHRoaXMucGF0aCA9IGMucGF0aCB8fCBjLm5vZGUgJiYgYy5ub2RlLnBhdGggfHwgXCJcIjtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzICh3ZSBzZXQgaXQgdG8gXCJJU0FcIilcbiAgICAgICAgdGhpcy5vcCA9IGMub3AgfHwgYy50eXBlICYmIFwiSVNBXCIgfHwgbnVsbDtcbiAgICAgICAgLy8gb25lIG9mOiBudWxsLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgc3ViY2xhc3MsIGxvb2t1cCwgbGlzdCwgcmFuZ2UsIGxvb3BcbiAgICAgICAgLy8gdGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGlzLm9wIGlzIGRlZmluZWQsIGJ1dCBub3QgaW4gT1BJTkRFWFxuICAgICAgICB0aGlzLmN0eXBlID0gdGhpcy5vcCAmJiBPUElOREVYW3RoaXMub3BdLmN0eXBlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgYWxsIGV4Y2VwdCBzdWJjbGFzcyBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLmNvZGUgPSB0aGlzLmN0eXBlICE9PSBcInN1YmNsYXNzXCIgJiYgYy5jb2RlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgdmFsdWUsIGxpc3RcbiAgICAgICAgdGhpcy52YWx1ZSA9IGMudmFsdWUgfHwgXCJcIjtcbiAgICAgICAgLy8gdXNlZCBieSBMT09LVVAgb24gQmlvRW50aXR5IGFuZCBzdWJjbGFzc2VzXG4gICAgICAgIHRoaXMuZXh0cmFWYWx1ZSA9IHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIgJiYgYy5leHRyYVZhbHVlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgbXVsdGl2YWx1ZSBhbmQgcmFuZ2UgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBjLnZhbHVlcyAmJiBkZWVwYyhjLnZhbHVlcykgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBzdWJjbGFzcyBjb250cmFpbnRzXG4gICAgICAgIHRoaXMudHlwZSA9IHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIiAmJiBjLnR5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBmb3IgY29uc3RyYWludHMgaW4gYSB0ZW1wbGF0ZVxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gYy5lZGl0YWJsZSB8fCBudWxsO1xuXG4gICAgICAgIC8vIFdpdGggbnVsbC9ub3QtbnVsbCBjb25zdHJhaW50cywgSU0gaGFzIGEgd2VpcmQgcXVpcmsgb2YgZmlsbGluZyB0aGUgdmFsdWUgXG4gICAgICAgIC8vIGZpZWxkIHdpdGggdGhlIG9wZXJhdG9yLiBFLmcuLCBmb3IgYW4gXCJJUyBOT1QgTlVMTFwiIG9wcmVhdG9yLCB0aGUgdmFsdWUgZmllbGQgaXNcbiAgICAgICAgLy8gYWxzbyBcIklTIE5PVCBOVUxMXCIuIFxuICAgICAgICAvLyBcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKVxuICAgICAgICAgICAgYy52YWx1ZSA9IFwiXCI7XG4gICAgfVxuICAgIC8vXG4gICAgc2V0T3AgKG8sIHF1aWV0bHkpIHtcbiAgICAgICAgbGV0IG9wID0gT1BJTkRFWFtvXTtcbiAgICAgICAgaWYgKCFvcCkgdGhyb3cgXCJVbmtub3duIG9wZXJhdG9yOiBcIiArIG87XG4gICAgICAgIHRoaXMub3AgPSBvcC5vcDtcbiAgICAgICAgdGhpcy5jdHlwZSA9IG9wLmN0eXBlO1xuICAgICAgICBsZXQgdCA9IHRoaXMubm9kZSAmJiB0aGlzLm5vZGUudGVtcGxhdGU7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvZGUgJiYgIXF1aWV0bHkgJiYgdCkgXG4gICAgICAgICAgICAgICAgZGVsZXRlIHQuY29kZTJjW3RoaXMuY29kZV07XG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvZGUpIFxuICAgICAgICAgICAgICAgIHRoaXMuY29kZSA9IHQgJiYgdC5uZXh0QXZhaWxhYmxlQ29kZSgpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgIXF1aWV0bHkgJiYgdCAmJiB0LnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICAvLyBSZXR1cm5zIGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29uc3RyYWludCBzdWl0YWJsZSBmb3IgYSBsYWJlbFxuICAgIC8vXG4gICAgZ2V0IGxhYmVsVGV4dCAoKSB7XG4gICAgICAgbGV0IHQgPSBcIj9cIjtcbiAgICAgICBsZXQgYyA9IHRoaXM7XG4gICAgICAgIC8vIG9uZSBvZjogbnVsbCwgdmFsdWUsIG11bHRpdmFsdWUsIHN1YmNsYXNzLCBsb29rdXAsIGxpc3QsIHJhbmdlLCBsb29wXG4gICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIil7XG4gICAgICAgICAgIHQgPSBcIklTQSBcIiArICh0aGlzLnR5cGUgfHwgXCI/XCIpO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxpc3RcIiB8fCB0aGlzLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWU7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWU7XG4gICAgICAgICAgIGlmICh0aGlzLmV4dHJhVmFsdWUpIHQgPSB0ICsgXCIgSU4gXCIgKyB0aGlzLmV4dHJhVmFsdWU7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiIHx8IHRoaXMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZXM7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wO1xuICAgICAgIH1cblxuICAgICAgIHJldHVybiAodGhpcy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiID8gXCIoXCIrdGhpcy5jb2RlK1wiKSBcIiA6IFwiXCIpICsgdDtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXRzIHRoaXMgY29uc3RyYWludCBhcyB4bWxcbiAgICBjMnhtbCAocW9ubHkpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBsZXQgZSA9IHFvbmx5ID8gXCJcIiA6IGBlZGl0YWJsZT1cIiR7dGhpcy5lZGl0YWJsZSB8fCAnZmFsc2UnfVwiYDtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcImxpc3RcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKHRoaXMuZXh0cmFWYWx1ZSAmJiB0aGlzLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke3RoaXMuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIil7XG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgICAgICBoID0gdGhpcy52YWx1ZXMubWFwKCB2ID0+IGA8dmFsdWU+JHtlc2Modil9PC92YWx1ZT5gICkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgdHlwZT1cIiR7dGhpcy50eXBlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHt0aGlzLm9wfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgaWYoaClcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfT4ke2h9PC9jb25zdHJhaW50PlxcbmA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfSAvPlxcbmA7XG4gICAgfVxufSAvLyBlbmQgb2YgY2xhc3MgQ29uc3RyYWludFxuXG5leHBvcnQgeyBDb25zdHJhaW50IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9jb25zdHJhaW50LmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vLyBxYi5qc1xuLy9cblxuaW1wb3J0IHsgUUJFZGl0b3IgfSBmcm9tICcuL3FiZWRpdG9yLmpzJztcblxubGV0IHFiID0gbmV3IFFCRWRpdG9yKCk7XG5xYi5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7XG4gICAgZXNjLFxuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBwYXJzZVBhdGhRdWVyeSxcbiAgICBvYmoyYXJyYXksXG4gICAgaW5pdE9wdGlvbkxpc3QsXG4gICAgY29weU9ialxufSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGNvZGVwb2ludHMgfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5pbXBvcnQgeyBVbmRvTWFuYWdlciB9IGZyb20gJy4vdW5kb01hbmFnZXIuanMnO1xuaW1wb3J0IHsgTW9kZWwgfSBmcm9tICcuL21vZGVsLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5pbXBvcnQgeyBpbml0UmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGVkaXRWaWV3cyB9IGZyb20gJy4vZWRpdFZpZXdzLmpzJztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4vZGlhbG9nLmpzJztcbmltcG9ydCB7IENvbnN0cmFpbnRFZGl0b3IgfSBmcm9tICcuL2NvbnN0cmFpbnRFZGl0b3IuanMnO1xuXG5sZXQgVkVSU0lPTiA9IFwiMC4xLjBcIjtcblxuY2xhc3MgUUJFZGl0b3Ige1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5jdXJyTWluZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgICAgICB0aGlzLm5hbWUybWluZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3ZnID0ge1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgMTI4MCxcbiAgICAgICAgICAgIGhlaWdodDogICAgIDgwMCxcbiAgICAgICAgICAgIG1sZWZ0OiAgICAgIDEyMCxcbiAgICAgICAgICAgIG1yaWdodDogICAgIDEyMCxcbiAgICAgICAgICAgIG10b3A6ICAgICAgIDIwLFxuICAgICAgICAgICAgbWJvdHRvbTogICAgMjBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaWFnb25hbCA9IG51bGw7XG4gICAgICAgIHRoaXMudmlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5ub2RlcyA9IG51bGw7XG4gICAgICAgIHRoaXMubGlua3MgPSBudWxsO1xuICAgICAgICB0aGlzLmRyYWdCZWhhdmlvciA9IG51bGw7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSAyNTA7IC8vIG1zXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbG9ycyA9IHsgaGVhZGVyOiB7IG1haW46IFwiIzU5NTQ1NVwiLCB0ZXh0OiBcIiNmZmZcIiB9IH07XG4gICAgICAgIHRoaXMuZGVmYXVsdExvZ28gPSBcImh0dHBzOi8vY2RuLnJhd2dpdC5jb20vaW50ZXJtaW5lL2Rlc2lnbi1tYXRlcmlhbHMvNzhhMTNkYjUvbG9nb3MvaW50ZXJtaW5lL3NxdWFyZWlzaC80NXg0NS5wbmdcIjtcbiAgICAgICAgdGhpcy51bmRvTWdyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XG4gICAgICAgIC8vIFN0YXJ0aW5nIGVkaXQgdmlldyBpcyB0aGUgbWFpbiBxdWVyeSB2aWV3LlxuICAgICAgICB0aGlzLmVkaXRWaWV3cyA9IGVkaXRWaWV3cztcbiAgICAgICAgdGhpcy5lZGl0VmlldyA9IHRoaXMuZWRpdFZpZXdzLnF1ZXJ5TWFpbjtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5jb25zdHJhaW50RWRpdG9yID0gXG4gICAgICAgICAgICBuZXcgQ29uc3RyYWludEVkaXRvcihuID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpYWxvZy5zaG93KG4sIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUobik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gdGhlIG5vZGUgZGlhbG9nXG4gICAgICAgIHRoaXMuZGlhbG9nID0gbmV3IERpYWxvZyh0aGlzKTtcbiAgICB9XG4gICAgc2V0dXAgKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdCgnI2Zvb3RlciBbbmFtZT1cInZlcnNpb25cIl0nKVxuICAgICAgICAgICAgLnRleHQoYFFCIHYke1ZFUlNJT059YCk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5pbml0U3ZnKCk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0KCcuYnV0dG9uW25hbWU9XCJvcGVuY2xvc2VcIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIik7XG4gICAgICAgICAgICAgICAgbGV0IHdhc0Nsb3NlZCA9IHQuY2xhc3NlZChcImNsb3NlZFwiKTtcbiAgICAgICAgICAgICAgICBsZXQgaXNDbG9zZWQgPSAhd2FzQ2xvc2VkO1xuICAgICAgICAgICAgICAgIGxldCBkID0gZDMuc2VsZWN0KCcjdEluZm9CYXInKVswXVswXVxuICAgICAgICAgICAgICAgIGlmIChpc0Nsb3NlZClcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSB0aGUgY3VycmVudCBoZWlnaHQganVzdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgICAgICAgICAgICAgICBkLl9fc2F2ZWRfaGVpZ2h0ID0gZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZC5fX3NhdmVkX2hlaWdodClcbiAgICAgICAgICAgICAgICAgICAvLyBvbiBvcGVuLCByZXN0b3JlIHRoZSBzYXZlZCBoZWlnaHRcbiAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyN0SW5mb0JhcicpLnN0eWxlKFwiaGVpZ2h0XCIsIGQuX19zYXZlZF9oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0LmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKFwiY2xvc2VkXCIsIGlzQ2xvc2VkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGQzLnNlbGVjdCgnLmJ1dHRvbltuYW1lPVwidHRleHRFeHBhbmRcIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsICEgdC5jbGFzc2VkKFwiY2xvc2VkXCIpKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsICEgdC5jbGFzc2VkKFwiY2xvc2VkXCIpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGluaXRSZWdpc3RyeSh0aGlzLmluaXRNaW5lcy5iaW5kKHRoaXMpKTtcblxuICAgICAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjdHRleHQnKS5hdHRyKCdjbGFzcycsICdmbGV4Y29sdW1uICcrdGhpcy5pbm5lclRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgc2VsZi51cGRhdGVUdGV4dChzZWxmLmN1cnJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiBzZWxmLnJ1bmF0bWluZShzZWxmLmN1cnJUZW1wbGF0ZSkpO1xuICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IC5idXR0b24uc3luYycpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgdHVyblN5bmNPZmYgPSB0LnRleHQoKSA9PT0gXCJzeW5jXCI7XG4gICAgICAgICAgICAgICAgdC50ZXh0KCB0dXJuU3luY09mZiA/IFwic3luY19kaXNhYmxlZFwiIDogXCJzeW5jXCIgKVxuICAgICAgICAgICAgICAgICAuYXR0cihcInRpdGxlXCIsICgpID0+XG4gICAgICAgICAgICAgICAgICAgICBgQ291bnQgYXV0b3N5bmMgaXMgJHsgdHVyblN5bmNPZmYgPyBcIk9GRlwiIDogXCJPTlwiIH0uIENsaWNrIHRvIHR1cm4gaXQgJHsgdHVyblN5bmNPZmYgPyBcIk9OXCIgOiBcIk9GRlwiIH0uYCk7XG4gICAgICAgICAgICAgICAgIXR1cm5TeW5jT2ZmICYmIHNlbGYudXBkYXRlQ291bnQoc2VsZi5jdXJyVGVtcGxhdGUpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJzeW5jb2ZmXCIsIHR1cm5TeW5jT2ZmKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBkMy5zZWxlY3QoXCIjeG1sdGV4dGFyZWFcIilcbiAgICAgICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcInhtbHRleHRhcmVhXCIpfSk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIilcbiAgICAgICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcImpzb250ZXh0YXJlYVwiKX0pO1xuXG4gICAgICAvL1xuICAgICAgdGhpcy5kcmFnQmVoYXZpb3IgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAgICAgLm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gb24gZHJhZywgZm9sbG93IHRoZSBtb3VzZSBpbiB0aGUgWSBkaW1lbnNpb24uXG4gICAgICAgICAgLy8gRHJhZyBjYWxsYmFjayBpcyBhdHRhY2hlZCB0byB0aGUgZHJhZyBoYW5kbGUuXG4gICAgICAgICAgbGV0IG5vZGVHcnAgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgLy8gdXBkYXRlIG5vZGUncyB5LWNvb3JkaW5hdGVcbiAgICAgICAgICBub2RlR3JwLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKG4pID0+IHtcbiAgICAgICAgICAgICAgbi55ID0gZDMuZXZlbnQueTtcbiAgICAgICAgICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHtuLnh9LCR7bi55fSlgO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbm9kZSdzIGxpbmtcbiAgICAgICAgICBsZXQgbGwgPSBkMy5zZWxlY3QoYHBhdGgubGlua1t0YXJnZXQ9XCIke25vZGVHcnAuYXR0cignaWQnKX1cIl1gKTtcbiAgICAgICAgICBsbC5hdHRyKFwiZFwiLCBzZWxmLmRpYWdvbmFsKTtcbiAgICAgICAgICB9KVxuICAgICAgICAub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBvbiBkcmFnZW5kLCByZXNvcnQgdGhlIGRyYWdnYWJsZSBub2RlcyBhY2NvcmRpbmcgdG8gdGhlaXIgWSBwb3NpdGlvblxuICAgICAgICAgIGxldCBub2RlcyA9IGQzLnNlbGVjdEFsbChzZWxmLmVkaXRWaWV3LmRyYWdnYWJsZSkuZGF0YSgpXG4gICAgICAgICAgbm9kZXMuc29ydCggKGEsIGIpID0+IGEueSAtIGIueSApO1xuICAgICAgICAgIC8vIHRoZSBub2RlIHRoYXQgd2FzIGRyYWdnZWRcbiAgICAgICAgICBsZXQgZHJhZ2dlZCA9IGQzLnNlbGVjdCh0aGlzKS5kYXRhKClbMF07XG4gICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIHNwZWNpZmljIGRyYWctZW5kIGJlaGF2aW9yXG4gICAgICAgICAgc2VsZi5lZGl0Vmlldy5hZnRlckRyYWcgJiYgc2VsZi5lZGl0Vmlldy5hZnRlckRyYWcobm9kZXMsIGRyYWdnZWQpO1xuICAgICAgICAgIC8vXG4gICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShkcmFnZ2VkKTtcbiAgICAgICAgICBzZWxmLnVwZGF0ZSgpO1xuICAgICAgICAgIC8vXG4gICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRNaW5lcyAoal9taW5lcykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubmFtZTJtaW5lID0ge307XG4gICAgICAgIGxldCBtaW5lcyA9IGpfbWluZXMuaW5zdGFuY2VzO1xuICAgICAgICBtaW5lcy5mb3JFYWNoKG0gPT4gdGhpcy5uYW1lMm1pbmVbbS5uYW1lXSA9IG0gKTtcbiAgICAgICAgdGhpcy5jdXJyTWluZSA9IG1pbmVzWzBdO1xuICAgICAgICB0aGlzLmN1cnJUZW1wbGF0ZSA9IG51bGw7XG5cbiAgICAgICAgbGV0IG1sID0gZDMuc2VsZWN0KFwiI21saXN0XCIpLnNlbGVjdEFsbChcIm9wdGlvblwiKS5kYXRhKG1pbmVzKTtcbiAgICAgICAgbGV0IHNlbGVjdE1pbmUgPSBcIk1vdXNlTWluZVwiO1xuICAgICAgICBtbC5lbnRlcigpLmFwcGVuZChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIGxldCB3ID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgICAgIGxldCBtID0gZC51cmwuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgICAgIGxldCB2ID0gKHcgJiYgIW0pIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZT09PXNlbGVjdE1pbmUgfHwgbnVsbDsgfSlcbiAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lOyB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gd2hlbiBhIG1pbmUgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdFxuICAgICAgICBkMy5zZWxlY3QoXCIjbWxpc3RcIilcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIC8vIHJlbWluZGVyOiB0aGlzPT09dGhlIGxpc3QgaW5wdXQgZWxlbWVudDsgc2VsZj09PXRoZSBlZGl0b3IgaW5zdGFuY2VcbiAgICAgICAgICAgICAgICBzZWxmLnNlbGVjdGVkTWluZSh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICBcbiAgICAgICAgLy8gXG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdChcIiNlZGl0VmlldyBzZWxlY3RcIilcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtaW5kZXI6IHRoaXM9PT10aGUgbGlzdCBpbnB1dCBlbGVtZW50OyBzZWxmPT09dGhlIGVkaXRvciBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIHNlbGYuc2V0RWRpdFZpZXcodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuXG4gICAgICAgIC8vIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG1pbmUgYnkgZGVmYXVsdC5cbiAgICAgICAgdGhpcy5zZWxlY3RlZE1pbmUoc2VsZWN0TWluZSk7XG4gICAgfVxuICAgIC8vIENhbGxlZCB3aGVuIHVzZXIgc2VsZWN0cyBhIG1pbmUgZnJvbSB0aGUgb3B0aW9uIGxpc3RcbiAgICAvLyBMb2FkcyB0aGF0IG1pbmUncyBkYXRhIG1vZGVsIGFuZCBhbGwgaXRzIHRlbXBsYXRlcy5cbiAgICAvLyBUaGVuIGluaXRpYWxpemVzIGRpc3BsYXkgdG8gc2hvdyB0aGUgZmlyc3QgdGVybXBsYXRlJ3MgcXVlcnkuXG4gICAgc2VsZWN0ZWRNaW5lIChtbmFtZSkge1xuICAgICAgICBpZighdGhpcy5uYW1lMm1pbmVbbW5hbWVdKSB0aHJvdyBcIk5vIG1pbmUgbmFtZWQ6IFwiICsgbW5hbWU7XG4gICAgICAgIHRoaXMuY3Vyck1pbmUgPSB0aGlzLm5hbWUybWluZVttbmFtZV07XG4gICAgICAgIHRoaXMudW5kb01nci5jbGVhcigpO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy5jdXJyTWluZS51cmw7XG4gICAgICAgIGxldCB0dXJsLCBtdXJsLCBsdXJsLCBidXJsLCBzdXJsLCBvdXJsO1xuICAgICAgICBpZiAobW5hbWUgPT09IFwidGVzdFwiKSB7IFxuICAgICAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICAgICAgbHVybCA9IHVybCArIFwiL2xpc3RzLmpzb25cIjtcbiAgICAgICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgICAgICBvdXJsID0gdXJsICsgXCIvb3JnYW5pc21saXN0Lmpzb25cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3RlbXBsYXRlcz9mb3JtYXQ9anNvblwiO1xuICAgICAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgICAgICBidXJsID0gdXJsICsgXCIvc2VydmljZS9icmFuZGluZ1wiO1xuICAgICAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICAgICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShsdXJsKSxcbiAgICAgICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShvdXJsKVxuICAgICAgICBdKS50aGVuKFxuICAgICAgICAgICAgdGhpcy5pbml0TWluZURhdGEuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y20ubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0TWluZURhdGEgKGRhdGEpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgal9tb2RlbCA9IGRhdGFbMF07XG4gICAgICAgIGxldCBqX3RlbXBsYXRlcyA9IGRhdGFbMV07XG4gICAgICAgIGxldCBqX2xpc3RzID0gZGF0YVsyXTtcbiAgICAgICAgbGV0IGpfYnJhbmRpbmcgPSBkYXRhWzNdO1xuICAgICAgICBsZXQgal9zdW1tYXJ5ID0gZGF0YVs0XTtcbiAgICAgICAgbGV0IGpfb3JnYW5pc21zID0gZGF0YVs1XTtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGNtID0gdGhpcy5jdXJyTWluZTtcbiAgICAgICAgY20udG5hbWVzID0gW11cbiAgICAgICAgY20udGVtcGxhdGVzID0gW11cbiAgICAgICAgY20ubW9kZWwgPSBuZXcgTW9kZWwoal9tb2RlbC5tb2RlbCwgY20pXG4gICAgICAgIGNtLnRlbXBsYXRlcyA9IGpfdGVtcGxhdGVzLnRlbXBsYXRlcztcbiAgICAgICAgY20ubGlzdHMgPSBqX2xpc3RzLmxpc3RzO1xuICAgICAgICBjbS5zdW1tYXJ5RmllbGRzID0gal9zdW1tYXJ5LmNsYXNzZXM7XG4gICAgICAgIGNtLm9yZ2FuaXNtTGlzdCA9IGpfb3JnYW5pc21zLnJlc3VsdHMubWFwKG8gPT4gby5zaG9ydE5hbWUpO1xuICAgICAgICAvL1xuICAgICAgICBjbS50bGlzdCA9IG9iajJhcnJheShjbS50ZW1wbGF0ZXMpXG4gICAgICAgIGNtLnRsaXN0LnNvcnQoZnVuY3Rpb24oYSxiKXsgXG4gICAgICAgICAgICByZXR1cm4gYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBjbS50bmFtZXMgPSBPYmplY3Qua2V5cyggY20udGVtcGxhdGVzICk7XG4gICAgICAgIGNtLnRuYW1lcy5zb3J0KCk7XG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIHNlbGVjdGlvbiBsaXN0IG9mIHRlbXBsYXRlcyBmb3IgdGhpcyBtaW5lLlxuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiN0bGlzdCBzZWxlY3RcIiwgY20udGxpc3QsIHtcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQudGl0bGUgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsICgpID0+IHRoaXMuc3RhcnRFZGl0KCkpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmVkaXRUZW1wbGF0ZShjbS50ZW1wbGF0ZXNbY20udGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGNtLmNvbG9ycyB8fCB0aGlzLmRlZmF1bHRDb2xvcnM7XG4gICAgICAgIGxldCBiZ2MgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLm1haW4gOiBjbHJzLm1haW4uZmc7XG4gICAgICAgIGxldCB0eGMgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLnRleHQgOiBjbHJzLm1haW4uYmc7XG4gICAgICAgIGxldCBsb2dvID0gY20uaW1hZ2VzLmxvZ28gfHwgdGhpcy5kZWZhdWx0TG9nbztcbiAgICAgICAgZDMuc2VsZWN0KFwiI3Rvb2x0cmF5XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjbWluZUxvZ29cIilcbiAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGxvZ28pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJyN0b29sdHJheSBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGNtLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0LiBFeGNsdWRlIHRoZSBzaW1wbGUgYXR0cmlidXRlIHR5cGVzLlxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjbS5tb2RlbC5jbGFzc2VzKS5maWx0ZXIoY24gPT4gISBjbS5tb2RlbC5jbGFzc2VzW2NuXS5pc0xlYWZUeXBlKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxmLnNlbGVjdGVkRWRpdFNvdXJjZSh0aGlzLnZhbHVlKTsgc2VsZi5zdGFydEVkaXQoKTsgfSk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVswXVswXS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG4gICAgfVxuXG4gICAgLy8gQmVnaW5zIGFuIGVkaXQsIGJhc2VkIG9uIHVzZXIgY29udHJvbHMuXG4gICAgc3RhcnRFZGl0ICgpIHtcbiAgICAgICAgLy8gc2VsZWN0b3IgZm9yIGNob29zaW5nIGVkaXQgaW5wdXQgc291cmNlLCBhbmQgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgICAgIGxldCBzcmNTZWxlY3RvciA9IGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKTtcbiAgICAgICAgLy8gdGhlIGNob3NlbiBlZGl0IHNvdXJjZVxuICAgICAgICBsZXQgaW5wdXRJZCA9IHNyY1NlbGVjdG9yWzBdWzBdLnZhbHVlO1xuICAgICAgICAvLyB0aGUgcXVlcnkgaW5wdXQgZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RlZCBzb3VyY2VcbiAgICAgICAgbGV0IHNyYyA9IGQzLnNlbGVjdChgIyR7aW5wdXRJZH0gW25hbWU9XCJpblwiXWApO1xuICAgICAgICAvLyB0aGUgcXVlcnkgc3RhcnRpbmcgcG9pbnRcbiAgICAgICAgbGV0IHZhbCA9IHNyY1swXVswXS52YWx1ZVxuICAgICAgICBpZiAoaW5wdXRJZCA9PT0gXCJ0bGlzdFwiKSB7XG4gICAgICAgICAgICAvLyBhIHNhdmVkIHF1ZXJ5IG9yIHRlbXBsYXRlXG4gICAgICAgICAgICB0aGlzLmVkaXRUZW1wbGF0ZSh0aGlzLmN1cnJNaW5lLnRlbXBsYXRlc1t2YWxdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dElkID09PSBcIm5ld3FjbGlzdFwiKSB7XG4gICAgICAgICAgICAvLyBhIG5ldyBxdWVyeSBmcm9tIGEgc2VsZWN0ZWQgc3RhcnRpbmcgY2xhc3NcbiAgICAgICAgICAgIGxldCBudCA9IG5ldyBUZW1wbGF0ZSh7IHNlbGVjdDogW3ZhbCtcIi5pZFwiXX0sIHRoaXMuY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAgICAgdGhpcy5lZGl0VGVtcGxhdGUobnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0eG1sXCIpIHtcbiAgICAgICAgICAgIC8vIGltcG9ydCB4bWwgcXVlcnlcbiAgICAgICAgICAgIHZhbCAmJiB0aGlzLmVkaXRUZW1wbGF0ZShwYXJzZVBhdGhRdWVyeSh2YWwpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydGpzb25cIikge1xuICAgICAgICAgICAgLy8gaW1wb3J0IGpzb24gcXVlcnlcbiAgICAgICAgICAgIHZhbCAmJiB0aGlzLmVkaXRUZW1wbGF0ZShKU09OLnBhcnNlKHZhbCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IFwiVW5rbm93biBlZGl0IHNvdXJjZS5cIlxuICAgIH1cblxuICAgIC8vIFxuICAgIHNlbGVjdGVkRWRpdFNvdXJjZSAoc2hvdykge1xuICAgICAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSA+IGRpdi5vcHRpb24nKVxuICAgICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlcyB0aGUgY3VycmVudCBub2RlIGFuZCBhbGwgaXRzIGRlc2NlbmRhbnRzLlxuICAgIC8vXG4gICAgcmVtb3ZlTm9kZSAobikge1xuICAgICAgICBuLnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmRpYWxvZy5oaWRlKCk7XG4gICAgICAgIHRoaXMudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgIHRoaXMudXBkYXRlKG4ucGFyZW50IHx8IG4pO1xuICAgIH1cblxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSB0ZW1wbGF0ZSBmcm9tIHRoZSBsaXN0LlxuICAgIC8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4gICAgLy8gZm9yIGQzIHRyZWUgZGlzcGxheS5cbiAgICAvL1xuICAgIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGN0ID0gdGhpcy5jdXJyVGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUodCwgdGhpcy5jdXJyTWluZS5tb2RlbCk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMucm9vdCA9IGN0LnF0cmVlXG4gICAgICAgIHRoaXMucm9vdC54MCA9IDA7XG4gICAgICAgIHRoaXMucm9vdC55MCA9IHRoaXMuc3ZnLmhlaWdodCAvIDI7XG4gICAgICAgIC8vXG4gICAgICAgIGN0LnNldExvZ2ljRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGlmICghIG5vc2F2ZSkgdGhpcy51bmRvTWdyLnNhdmVTdGF0ZShjdC5xdHJlZSk7XG5cbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgYmFzaWMgdGVtcGxhdGUgaW5mb3JtYXRpb24gKG5hbWUsIHRpdGxlLCBkZXNjcmlwdGlvbiwgZXRjLilcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHRpID0gZDMuc2VsZWN0KFwiI3RJbmZvXCIpO1xuICAgICAgICBsZXQgeGZlciA9IGZ1bmN0aW9uKG5hbWUsIGVsdCl7IGN0W25hbWVdID0gZWx0LnZhbHVlOyBzZWxmLnVwZGF0ZVR0ZXh0KGN0KTsgfTtcbiAgICAgICAgLy8gTmFtZSAodGhlIGludGVybmFsIHVuaXF1ZSBuYW1lKVxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN0Lm5hbWUpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcIm5hbWVcIiwgdGhpcykgfSk7XG4gICAgICAgIC8vIFRpdGxlICh3aGF0IHRoZSB1c2VyIHNlZXMpXG4gICAgICAgIHRpLnNlbGVjdCgnW25hbWU9XCJ0aXRsZVwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGN0LnRpdGxlKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAgICAgLy8gRGVzY3JpcHRpb24gKHdoYXQgaXQgZG9lcyAtIGEgbGl0dGxlIGRvY3VtZW50YXRpb24pLlxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwiZGVzY3JpcHRpb25cIl0gdGV4dGFyZWEnKVxuICAgICAgICAgICAgLnRleHQoY3QuZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImRlc2NyaXB0aW9uXCIsIHRoaXMpIH0pO1xuICAgICAgICAvLyBDb21tZW50IC0gZm9yIHdoYXRldmVyLCBJIGd1ZXNzLiBcbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAgICAgLnRleHQoY3QuY29tbWVudClcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiY29tbWVudFwiLCB0aGlzKSB9KTtcblxuICAgICAgICAvLyBMb2dpYyBleHByZXNzaW9uIC0gd2hpY2ggdGllcyB0aGUgaW5kaXZpZHVhbCBjb25zdHJhaW50cyB0b2dldGhlclxuICAgICAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGN0LmNvbnN0cmFpbnRMb2dpYyB9KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3Quc2V0TG9naWNFeHByZXNzaW9uKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIHhmZXIoXCJjb25zdHJhaW50TG9naWNcIiwgdGhpcylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENsZWFyIHRoZSBxdWVyeSBjb3VudFxuICAgICAgICBkMy5zZWxlY3QoXCIjcXVlcnljb3VudCBzcGFuXCIpLnRleHQoXCJcIik7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kaWFsb2cuaGlkZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZWRpdGluZyB2aWV3LiBWaWV3IGlzIG9uZSBvZjpcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgICB2aWV3IChzdHJpbmcpIE9uZSBvZjogcXVlcnlNYWluLCBjb25zdHJhaW50TG9naWMsIGNvbHVtbk9yZGVyLCBzb3J0T3JkZXJcbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgICBOb3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgICBDaGFuZ2VzIHRoZSBsYXlvdXQgYW5kIHVwZGF0ZXMgdGhlIHZpZXcuXG4gICAgc2V0RWRpdFZpZXcgKHZpZXcpe1xuICAgICAgICBsZXQgdiA9IHRoaXMuZWRpdFZpZXdzW3ZpZXddO1xuICAgICAgICBpZiAoIXYpIHRocm93IFwiVW5yZWNvZ25pemVkIHZpZXcgdHlwZTogXCIgKyB2aWV3O1xuICAgICAgICB0aGlzLmVkaXRWaWV3ID0gdjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgdi5uYW1lKTtcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5yb290KTtcbiAgICB9XG5cbiAgICAvLyBHcm93cyBvciBzaHJpbmtzIHRoZSBzaXplIG9mIHRoZSBTVkcgZHJhd2luZyBhcmVhIGFuZCByZWRyYXdzIHRoZSBkaWFncmFtLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBwY3RYIChudW1iZXIpIEEgcGVyY2VudGFnZSB0byBncm93IG9yIHNocmluayBpbiB0aGUgWCBkaW1lbnNpb24uIElmID4wLFxuICAgIC8vICAgICAgICAgICAgICAgICBncm93cyBieSB0aGF0IHBlcmNlbnRhZ2UuIElmIDwwLCBzaHJpbmtzIGJ5IHRoYXQgcGVyY2VudGFnZS5cbiAgICAvLyAgICAgICAgICAgICAgICAgSWYgMCwgcmVtYWlucyB1bmNoYW5nZWQuXG4gICAgLy8gICBwY3RZIChudW1iZXIpIEEgcGVyY2VudGFnZSB0byBncm93IG9yIHNocmluayBpbiB0aGUgWSBkaW1lbnNpb24uIElmIG5vdFxuICAgIC8vICAgICAgICAgICAgICAgICBzcGVjaWZpZWQsIHVzZXMgcGN0WC5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIHBlcmNlbnRhZ2VzIGFwcGx5IHRvIHRoZSBtYXJnaW5zIGFzIHdlbGwuXG4gICAgLy9cbiAgICBncm93U3ZnIChwY3RYLCBwY3RZKSB7XG4gICAgICAgIHBjdFkgPSBwY3RZID09PSB1bmRlZmluZWQgPyBwY3RYIDogcGN0WTtcbiAgICAgICAgbGV0IG14ID0gMSArIHBjdFggLyAxMDAuMDtcbiAgICAgICAgbGV0IG15ID0gMSArIHBjdFkgLyAxMDAuMDtcbiAgICAgICAgbGV0IHN6ID0ge1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgbXggKiB0aGlzLnN2Zy53aWR0aCxcbiAgICAgICAgICAgIG1sZWZ0OiAgICAgIG14ICogdGhpcy5zdmcubWxlZnQsXG4gICAgICAgICAgICBtcmlnaHQ6ICAgICBteCAqIHRoaXMuc3ZnLm1yaWdodCxcbiAgICAgICAgICAgIGhlaWdodDogICAgIG15ICogdGhpcy5zdmcuaGVpZ2h0LFxuICAgICAgICAgICAgbXRvcDogICAgICAgbXkgKiB0aGlzLnN2Zy5tdG9wLFxuICAgICAgICAgICAgbWJvdHRvbTogICAgbXkgKiB0aGlzLnN2Zy5tYm90dG9tXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3ZnU2l6ZShzeik7XG4gICAgfVxuXG4gICAgLy8gU2V0cyB0aGUgc2l6ZSBvZiB0aGUgU1ZHIGRyYXdpbmcgYXJlYSBhbmQgcmVkcmF3cyB0aGUgZGlhZ3JhbS5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgc3ogKG9iaikgQW4gb2JqZWN0IGRlZmluaW5nIGFueS9hbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzLnN2ZywgdG8gd2l0OlxuICAgIC8vICAgICAgICAgICAgd2lkdGgsIGhlaWdodCwgbWxlZnQsIG1yaWdodCwgbXRvcCwgbWJvdHRvbVxuICAgIHNldFN2Z1NpemUgKHN6KSB7XG4gICAgICAgIGNvcHlPYmoodGhpcy5zdmcsIHN6KTtcbiAgICAgICAgdGhpcy5pbml0U3ZnKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucm9vdCk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIFNWRyBkcmF3aW5nIGFyZWFcbiAgICBpbml0U3ZnICgpIHtcbiAgICAgICAgLy8gaW5pdCB0aGUgU1ZHIGNvbnRhaW5lclxuICAgICAgICB0aGlzLnZpcyA9IGQzLnNlbGVjdChcIiNzdmdDb250YWluZXIgc3ZnXCIpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHRoaXMuc3ZnLndpZHRoICsgdGhpcy5zdmcubWxlZnQgKyB0aGlzLnN2Zy5tcmlnaHQpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCB0aGlzLnN2Zy5oZWlnaHQgKyB0aGlzLnN2Zy5tdG9wICsgdGhpcy5zdmcubWJvdHRvbSlcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHRoaXMuZGlhbG9nLmhpZGUoKSlcbiAgICAgICAgICAuc2VsZWN0KFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnN2Zy5tbGVmdCArIFwiLFwiICsgdGhpcy5zdmcubXRvcCArIFwiKVwiKTtcbiBcbiAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUwMDc4NzcvaG93LXRvLXVzZS10aGUtZDMtZGlhZ29uYWwtZnVuY3Rpb24tdG8tZHJhdy1jdXJ2ZWQtbGluZXNcbiAgICAgICAgdGhpcy5kaWFnb25hbCA9IGQzLnN2Zy5kaWFnb25hbCgpXG4gICAgICAgICAgICAuc291cmNlKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnNvdXJjZS55LCBcInlcIjpkLnNvdXJjZS54fTsgfSkgICAgIFxuICAgICAgICAgICAgLnRhcmdldChmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC50YXJnZXQueSwgXCJ5XCI6ZC50YXJnZXQueH07IH0pXG4gICAgICAgICAgICAucHJvamVjdGlvbihmdW5jdGlvbihkKSB7IHJldHVybiBbZC55LCBkLnhdOyB9KTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGVzIHBvc2l0aW9ucyBmb3Igbm9kZXMgYW5kIHBhdGhzIGZvciBsaW5rcy5cbiAgICBkb0xheW91dCAoKSB7XG4gICAgICBsZXQgbGF5b3V0O1xuICAgICAgLy9cbiAgICAgIGxldCBsZWF2ZXMgPSBbXTtcbiAgICAgIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgbGVhdmVzLnB1c2gobik7XG4gICAgICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gICAgICB9O1xuICAgICAgbGV0IG1heGQgPSBtZCh0aGlzLnJvb3QpOyAvLyBtYXggZGVwdGgsIDEtYmFzZWRcblxuICAgICAgLy9cbiAgICAgIGlmICh0aGlzLmVkaXRWaWV3LmxheW91dFN0eWxlID09PSBcInRyZWVcIikge1xuICAgICAgICAgIC8vIGQzIGxheW91dCBhcnJhbmdlcyBub2RlcyB0b3AtdG8tYm90dG9tLCBidXQgd2Ugd2FudCBsZWZ0LXRvLXJpZ2h0LlxuICAgICAgICAgIC8vIFNvLi4uZG8gdGhlIGxheW91dCwgcmV2ZXJzaW5nIHdpZHRoIGFuZCBoZWlnaHQuIFxuICAgICAgICAgIC8vIFRoZW4gcmV2ZXJzZSB0aGUgeCx5IGNvb3JkcyBpbiB0aGUgcmVzdWx0cy5cbiAgICAgICAgICB0aGlzLmxheW91dCA9IGQzLmxheW91dC50cmVlKCkuc2l6ZShbdGhpcy5zdmcuaGVpZ2h0LCB0aGlzLnN2Zy53aWR0aF0pO1xuICAgICAgICAgIC8vIFNhdmUgbm9kZXMgaW4gZ2xvYmFsLlxuICAgICAgICAgIHRoaXMubm9kZXMgPSB0aGlzLmxheW91dC5ub2Rlcyh0aGlzLnJvb3QpLnJldmVyc2UoKTtcbiAgICAgICAgICAvLyBSZXZlcnNlIHggYW5kIHkuIEFsc28sIG5vcm1hbGl6ZSB4IGZvciBmaXhlZC1kZXB0aC5cbiAgICAgICAgICB0aGlzLm5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDtcbiAgICAgICAgICAgICAgbGV0IGR4ID0gTWF0aC5taW4oMTgwLCB0aGlzLnN2Zy53aWR0aCAvIE1hdGgubWF4KDEsbWF4ZC0xKSlcbiAgICAgICAgICAgICAgZC54ID0gZC5kZXB0aCAqIGR4IFxuICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZGVuZHJvZ3JhbVxuICAgICAgICAgIHRoaXMubGF5b3V0ID0gZDMubGF5b3V0LmNsdXN0ZXIoKVxuICAgICAgICAgICAgICAuc2VwYXJhdGlvbigoYSxiKSA9PiAxKVxuICAgICAgICAgICAgICAuc2l6ZShbdGhpcy5zdmcuaGVpZ2h0LCBNYXRoLm1pbih0aGlzLnN2Zy53aWR0aCwgbWF4ZCAqIDE4MCldKTtcbiAgICAgICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5sYXlvdXQubm9kZXModGhpcy5yb290KS5yZXZlcnNlKCk7XG4gICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKCBkID0+IHsgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7IH0pO1xuXG4gICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuIFxuICAgICAgICAgIGxldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB5OiBuLnksIHkwOiBuLnkwIH07IH0pO1xuXG4gICAgICAgICAgbGVhdmVzLnNvcnQodGhpcy5lZGl0Vmlldy5ub2RlQ29tcCk7XG5cbiAgICAgICAgICAvLyByZWFzc2lnbiB0aGUgWSBwb3NpdGlvbnNcbiAgICAgICAgICBsZWF2ZXMuZm9yRWFjaChmdW5jdGlvbihuLCBpKXtcbiAgICAgICAgICAgICAgbi55ID0gcG9zW2ldLnk7XG4gICAgICAgICAgICAgIG4ueTAgPSBwb3NbaV0ueTA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbGVhdmVzIGhhdmUgYmVlbiByZWFycmFuZ2VkLCBidXQgdGhlIGludGVyaW9yIG5vZGVzIGhhdmVuJ3QuXG4gICAgICAgICAgLy8gSGVyZSB3ZSBtb3ZlIGludGVyaW9yIG5vZGVzIHVwIG9yIGRvd24gdG93YXJkIHRoZWlyIFwiY2VudGVyIG9mIGdyYXZpdHlcIiBhcyBkZWZpbmVkXG4gICAgICAgICAgLy8gYnkgdGhlIFktcG9zaXRpb25zIG9mIHRoZWlyIGNoaWxkcmVuLiBBcHBseSB0aGlzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgICAgICAgIC8vIFxuICAgICAgICAgIC8vIE1haW50YWluIGEgbWFwIG9mIG9jY3VwaWVkIHBvc2l0aW9uczpcbiAgICAgICAgICBsZXQgb2NjdXBpZWQgPSB7fSA7ICAvLyBvY2N1cGllZFt4IHBvc2l0aW9uXSA9PSBbbGlzdCBvZiBub2Rlc11cbiAgICAgICAgICBmdW5jdGlvbiBjb2cgKG4pIHtcbiAgICAgICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgLy8gY29tcHV0ZSBteSBjLm8uZy4gYXMgdGhlIGF2ZXJhZ2Ugb2YgbXkga2lkcycgeS1wb3NpdGlvbnNcbiAgICAgICAgICAgICAgICAgIGxldCBteUNvZyA9IChuLmNoaWxkcmVuLm1hcChjb2cpLnJlZHVjZSgodCxjKSA9PiB0K2MsIDApKS9uLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIG4ueSA9IG15Q29nO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxldCBkZCA9IG9jY3VwaWVkW24ueF0gPSAob2NjdXBpZWRbbi54XSB8fCBbXSk7XG4gICAgICAgICAgICAgIGRkLnB1c2gobik7XG4gICAgICAgICAgICAgIHJldHVybiBuLnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvZyh0aGlzLnJvb3QpO1xuXG4gICAgICAgICAgLy8gSWYgaW50ZXJtZWRpYXRlIG5vZGVzIGF0IHRoZSBzYW1lIHggb3ZlcmxhcCwgc3ByZWFkIHRoZW0gb3V0IGluIHkuXG4gICAgICAgICAgZm9yKGxldCB4IGluIG9jY3VwaWVkKSB7XG4gICAgICAgICAgICAgIC8vIGdldCB0aGUgbm9kZXMgYXQgdGhpcyB4LXJhbmssIGFuZCBzb3J0IGJ5IHkgcG9zaXRpb25cbiAgICAgICAgICAgICAgbGV0IG5vZGVzID0gb2NjdXBpZWRbeF07XG4gICAgICAgICAgICAgIG5vZGVzLnNvcnQoIChhLGIpID0+IGEueSAtIGIueSApO1xuICAgICAgICAgICAgICAvLyBOb3cgbWFrZSBhIHBhc3MgYW5kIGVuc3VyZSB0aGF0IGVhY2ggbm9kZSBpcyBzZXBhcmF0ZWQgZnJvbSB0aGVcbiAgICAgICAgICAgICAgLy8gcHJldmlvdXMgbm9kZSBieSBhdCBsZWFzdCBNSU5TRVBcbiAgICAgICAgICAgICAgbGV0IHByZXYgPSBudWxsO1xuICAgICAgICAgICAgICBsZXQgTUlOU0VQID0gMzA7XG4gICAgICAgICAgICAgIG5vZGVzLmZvckVhY2goIG4gPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHByZXYgJiYgKG4ueSAtIHByZXYueSA8IE1JTlNFUCkpXG4gICAgICAgICAgICAgICAgICAgICAgbi55ID0gcHJldi55ICsgTUlOU0VQO1xuICAgICAgICAgICAgICAgICAgcHJldiA9IG47XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIH1cblxuICAgICAgLy8gc2F2ZSBsaW5rcyBpbiBnbG9iYWxcbiAgICAgIHRoaXMubGlua3MgPSB0aGlzLmxheW91dC5saW5rcyh0aGlzLm5vZGVzKTtcblxuICAgICAgcmV0dXJuIFt0aGlzLm5vZGVzLCB0aGlzLmxpbmtzXVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gdXBkYXRlKHNvdXJjZSkgXG4gICAgLy8gVGhlIG1haW4gZHJhd2luZyByb3V0aW5lLiBcbiAgICAvLyBVcGRhdGVzIHRoZSBTVkcsIHVzaW5nIHNvdXJjZSAoYSBOb2RlKSBhcyB0aGUgZm9jdXMgb2YgYW55IGVudGVyaW5nL2V4aXRpbmcgYW5pbWF0aW9ucy5cbiAgICAvL1xuICAgIHVwZGF0ZSAoc291cmNlKSB7XG4gICAgICAvL1xuICAgICAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgdGhpcy5lZGl0Vmlldy5uYW1lKTtcblxuICAgICAgZDMuc2VsZWN0KFwiI3VuZG9CdXR0b25cIilcbiAgICAgICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdGhpcy51bmRvTWdyLmNhblVuZG8pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3IuY2FuVW5kbyAmJiB0aGlzLmVkaXRUZW1wbGF0ZSh0aGlzLnVuZG9NZ3IudW5kb1N0YXRlKCksIHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgZDMuc2VsZWN0KFwiI3JlZG9CdXR0b25cIilcbiAgICAgICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdGhpcy51bmRvTWdyLmNhblJlZG8pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3IuY2FuUmVkbyAmJiB0aGlzLmVkaXRUZW1wbGF0ZSh0aGlzLnVuZG9NZ3IucmVkb1N0YXRlKCksIHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgLy9cbiAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICAgIHRoaXMudXBkYXRlTm9kZXModGhpcy5ub2Rlcywgc291cmNlKTtcbiAgICAgIHRoaXMudXBkYXRlTGlua3ModGhpcy5saW5rcywgc291cmNlKTtcbiAgICAgIHRoaXMudXBkYXRlVHRleHQodGhpcy5jdXJyVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8vXG4gICAgdXBkYXRlTm9kZXMgKG5vZGVzLCBzb3VyY2UpIHtcbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGxldCBub2RlR3JwcyA9IHRoaXMudmlzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gQ3JlYXRlIG5ldyBub2RlcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gICAgICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgbiA9PiBuLnBhdGgucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueDAgKyBcIixcIiArIHNvdXJjZS55MCArIFwiKVwiOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgbGV0IGNsaWNrTm9kZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuOyBcbiAgICAgICAgICBpZiAoc2VsZi5kaWFsb2cuY3Vyck5vZGUgIT09IG4pIHNlbGYuZGlhbG9nLnNob3cobiwgdGhpcyk7XG4gICAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9O1xuICAgICAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChmdW5jdGlvbihkKXtcbiAgICAgICAgICBsZXQgc2hhcGUgPSAoZC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIgPyBcInJlY3RcIiA6IFwiY2lyY2xlXCIpO1xuICAgICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZVwiKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGNsaWNrTm9kZSk7XG4gICAgICBub2RlRW50ZXIuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgICAgICA7XG4gICAgICBub2RlRW50ZXIuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCAtOC41KVxuICAgICAgICAgIC5hdHRyKFwieVwiLCAtOC41KVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIEFkZCB0ZXh0IGZvciBub2RlIG5hbWVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmNoaWxkcmVuID8gLTEwIDogMTA7IH0pXG4gICAgICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBuZWFybHkgdHJhbnNwYXJlbnRcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlTmFtZVwiKVxuICAgICAgICAgIDtcblxuICAgICAgLy8gUGxhY2Vob2xkZXIgZm9yIGljb24vdGV4dCB0byBhcHBlYXIgaW5zaWRlIG5vZGVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlSWNvbicpXG4gICAgICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIEFkZCBub2RlIGhhbmRsZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2hhbmRsZScpXG4gICAgICAgICAgLmF0dHIoJ2R4JywgMTApXG4gICAgICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgICAgICA7XG5cbiAgICAgIGxldCBub2RlVXBkYXRlID0gbm9kZUdycHNcbiAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIG4gPT4gbi5pc1NlbGVjdGVkKVxuICAgICAgICAgIC5jbGFzc2VkKFwiY29uc3RyYWluZWRcIiwgbiA9PiBuLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmxldmVsID49IDApXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRhc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImFzY1wiKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGVkZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICAgICAgICAvLyBUcmFuc2l0aW9uIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbi54ICsgXCIsXCIgKyBuLnkgKyBcIilcIjsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5oYW5kbGVcIilcbiAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCB0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgICAgIC50ZXh0KHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi50ZXh0IHx8IFwiXCIpIFxuICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi5zdHJva2UgfHwgbnVsbClcbiAgICAgICAgICAuYXR0cihcImZpbGxcIiwgdGhpcy5lZGl0Vmlldy5oYW5kbGVJY29uLmZpbGwgfHwgbnVsbCk7XG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcInRleHQubm9kZUljb25cIilcbiAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCB0aGlzLmVkaXRWaWV3Lm5vZGVJY29uLmZvbnRGYW1pbHkgfHwgbnVsbClcbiAgICAgICAgICAudGV4dCh0aGlzLmVkaXRWaWV3Lm5vZGVJY29uLnRleHQgfHwgXCJcIikgXG4gICAgICAgICAgO1xuXG4gICAgICBkMy5zZWxlY3RBbGwoXCIubm9kZUljb25cIilcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBjbGlja05vZGUpO1xuXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdEFsbChcInRleHQubm9kZU5hbWVcIilcbiAgICAgICAgICAudGV4dChuID0+IG4ubmFtZSk7XG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBNYWtlIHNlbGVjdGVkIG5vZGVzIGRyYWdnYWJsZS5cbiAgICAgIC8vIENsZWFyIG91dCBhbGwgZXhpdGluZyBkcmFnIGhhbmRsZXJzXG4gICAgICBkMy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIGZhbHNlKVxuICAgICAgICAgIC5vbihcIi5kcmFnXCIsIG51bGwpOyBcbiAgICAgIC8vIE5vdyBtYWtlIGV2ZXJ5dGhpbmcgZHJhZ2dhYmxlIHRoYXQgc2hvdWxkIGJlXG4gICAgICBpZiAodGhpcy5lZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICAgICAgZDMuc2VsZWN0QWxsKHRoaXMuZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgICAgICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCB0cnVlKVxuICAgICAgICAgICAgICAuY2FsbCh0aGlzLmRyYWdCZWhhdmlvcik7XG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAvLyBBZGQgdGV4dCBmb3IgY29uc3RyYWludHNcbiAgICAgIGxldCBjdCA9IG5vZGVHcnBzLnNlbGVjdEFsbChcInRleHQuY29uc3RyYWludFwiKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKG4peyByZXR1cm4gbi5jb25zdHJhaW50czsgfSk7XG4gICAgICBjdC5lbnRlcigpLmFwcGVuZChcInN2Zzp0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbnN0cmFpbnRcIik7XG4gICAgICBjdC5leGl0KCkucmVtb3ZlKCk7XG4gICAgICBjdC50ZXh0KCBjID0+IGMubGFiZWxUZXh0IClcbiAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgICAgIC5hdHRyKFwiZHlcIiwgKGMsaSkgPT4gYCR7KGkrMSkqMS43fWVtYClcbiAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLFwic3RhcnRcIilcbiAgICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gZnVsbCBzaXplXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCA4LjUgKVxuICAgICAgICAgIDtcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTcgKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDE3IClcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gdGV4dCB0byBmdWxseSBvcGFxdWVcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxKVxuICAgICAgICAgIDtcblxuICAgICAgLy9cbiAgICAgIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICAgICAgbGV0IG5vZGVFeGl0ID0gbm9kZUdycHMuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLnggKyBcIixcIiArIHNvdXJjZS55ICsgXCIpXCI7IH0pXG4gICAgICAgICAgLnJlbW92ZSgpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gdGlueSByYWRpdXNcbiAgICAgIG5vZGVFeGl0LnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCAxZS02KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIHRyYW5zcGFyZW50XG4gICAgICBub2RlRXhpdC5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpXG4gICAgICAgICAgO1xuICAgICAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgZC54MCA9IGQueDtcbiAgICAgICAgZC55MCA9IGQueTtcbiAgICAgIH0pO1xuICAgICAgLy9cblxuICAgIH1cblxuICAgIC8vXG4gICAgdXBkYXRlTGlua3MgKGxpbmtzLCBzb3VyY2UpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgbGV0IGxpbmsgPSB0aGlzLnZpcy5zZWxlY3RBbGwoXCJwYXRoLmxpbmtcIilcbiAgICAgICAgICAuZGF0YShsaW5rcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQuaWQ7IH0pXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBFbnRlciBhbnkgbmV3IGxpbmtzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cbiAgICAgIGxldCBuZXdQYXRocyA9IGxpbmsuZW50ZXIoKS5pbnNlcnQoXCJzdmc6cGF0aFwiLCBcImdcIik7XG4gICAgICBsZXQgbGlua1RpdGxlID0gZnVuY3Rpb24obCl7XG4gICAgICAgICAgbGV0IGNsaWNrID0gXCJcIjtcbiAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIil7XG4gICAgICAgICAgICAgIGNsaWNrID0gYENsaWNrIHRvIG1ha2UgdGhpcyByZWxhdGlvbnNoaXAgJHtsLnRhcmdldC5qb2luID8gXCJSRVFVSVJFRFwiIDogXCJPUFRJT05BTFwifS4gYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGFsdGNsaWNrID0gXCJBbHQtY2xpY2sgdG8gY3V0IGxpbmsuXCI7XG4gICAgICAgICAgcmV0dXJuIGNsaWNrICsgYWx0Y2xpY2s7XG4gICAgICB9XG4gICAgICAvLyBzZXQgdGhlIHRvb2x0aXBcbiAgICAgIG5ld1BhdGhzLmFwcGVuZChcInN2Zzp0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICBuZXdQYXRoc1xuICAgICAgICAgIC5hdHRyKFwidGFyZ2V0XCIsIGQgPT4gZC50YXJnZXQuaWQucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGlua1wiKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBsZXQgbyA9IHt4OiBzb3VyY2UueDAsIHk6IHNvdXJjZS55MH07XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKFwiYXR0cmlidXRlXCIsIGZ1bmN0aW9uKGwpIHsgcmV0dXJuIGwudGFyZ2V0LnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCI7IH0pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24obCl7IFxuICAgICAgICAgICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAvLyBhIHNoaWZ0LWNsaWNrIGN1dHMgdGhlIHRyZWUgYXQgdGhpcyBlZGdlXG4gICAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZU5vZGUobC50YXJnZXQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAvLyByZWd1bGFyIGNsaWNrIG9uIGEgcmVsYXRpb25zaGlwIGVkZ2UgaW52ZXJ0cyB3aGV0aGVyXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgam9pbiBpcyBpbm5lciBvciBvdXRlci4gXG4gICAgICAgICAgICAgICAgICBsLnRhcmdldC5qb2luID0gKGwudGFyZ2V0LmpvaW4gPyBudWxsIDogXCJvdXRlclwiKTtcbiAgICAgICAgICAgICAgICAgIC8vIHJlLXNldCB0aGUgdG9vbHRpcFxuICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcInRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgICAgICAgICAgICAgIC8vIGlmIG91dGVyIGpvaW4sIHJlbW92ZSBhbnkgc29ydCBvcmRlcnMgaW4gbiBvciBkZXNjZW5kYW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LmpvaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICBsZXQgcnNvID0gZnVuY3Rpb24obSkgeyAvLyByZW1vdmUgc29ydCBvcmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICBtLnNldFNvcnQoXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNoaWxkcmVuLmZvckVhY2gocnNvKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgcnNvKGwudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGwuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobC5zb3VyY2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAgIC5hdHRyKFwiZFwiLCB0aGlzLmRpYWdvbmFsKVxuICAgICAgICAgIDtcbiAgICAgXG4gICAgICBcbiAgICAgIC8vIFRyYW5zaXRpb24gbGlua3MgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICAgICAgbGluay5jbGFzc2VkKFwib3V0ZXJcIiwgZnVuY3Rpb24obikgeyByZXR1cm4gbi50YXJnZXQuam9pbiA9PT0gXCJvdXRlclwiOyB9KVxuICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuYXR0cihcImRcIiwgdGhpcy5kaWFnb25hbClcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICAgICAgbGluay5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIGxldCBvID0ge3g6IHNvdXJjZS54LCB5OiBzb3VyY2UueX07XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5yZW1vdmUoKVxuICAgICAgICAgIDtcblxuICAgIH1cbiAgICAvL1xuICAgIHVwZGF0ZVR0ZXh0ICh0KSB7XG4gICAgICAvL1xuICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgbGV0IHRpdGxlID0gdGhpcy52aXMuc2VsZWN0QWxsKFwiI3F0aXRsZVwiKVxuICAgICAgICAgIC5kYXRhKFt0aGlzLmN1cnJUZW1wbGF0ZS50aXRsZV0pO1xuICAgICAgdGl0bGUuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIixcInF0aXRsZVwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCAtNDApXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIDE1KVxuICAgICAgICAgIDtcbiAgICAgIHRpdGxlLmh0bWwodCA9PiB7XG4gICAgICAgICAgbGV0IHBhcnRzID0gdC5zcGxpdCgvKC0tPikvKTtcbiAgICAgICAgICByZXR1cm4gcGFydHMubWFwKChwLGkpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHAgPT09IFwiLS0+XCIpIFxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8dHNwYW4geT0xMCBmb250LWZhbWlseT1cIk1hdGVyaWFsIEljb25zXCI+JHtjb2RlcG9pbnRzWydmb3J3YXJkJ119PC90c3Bhbj5gXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9ND4ke3B9PC90c3Bhbj5gXG4gICAgICAgICAgfSkuam9pbihcIlwiKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1xuICAgICAgbGV0IHR4dCA9IGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSA/IHQuZ2V0SnNvbigpIDogdC5nZXRYbWwoKTtcbiAgICAgIC8vXG4gICAgICAvL1xuICAgICAgZDMuc2VsZWN0KFwiI3R0ZXh0ZGl2XCIpIFxuICAgICAgICAgIC50ZXh0KHR4dClcbiAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBzZWxlY3RUZXh0KFwidHRleHRkaXZcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAvL1xuICAgICAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgICAgICBzZWxmLnVwZGF0ZUNvdW50KHQpO1xuICAgIH1cblxuICAgIHJ1bmF0bWluZSAodCkge1xuICAgICAgbGV0IHVjdCA9IHQudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgIGxldCB0eHQgPSB0LmdldFhtbCgpO1xuICAgICAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudCh0eHQpO1xuICAgICAgbGV0IGxpbmt1cmwgPSB0aGlzLmN1cnJNaW5lLnVybCArIFwiL2xvYWRRdWVyeS5kbz90cmFpbD0lN0NxdWVyeSZtZXRob2Q9eG1sXCI7XG4gICAgICBsZXQgZWRpdHVybCA9IGxpbmt1cmwgKyBcIiZxdWVyeT1cIiArIHVybFR4dDtcbiAgICAgIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgICAgIHdpbmRvdy5vcGVuKCBkMy5ldmVudC5hbHRLZXkgPyBlZGl0dXJsIDogcnVudXJsLCAnX2JsYW5rJyApO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvdW50ICh0KSB7XG4gICAgICBsZXQgdWN0ID0gdC51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICAgICAgbGV0IHF0eHQgPSB0LmdldFhtbCh0cnVlKTtcbiAgICAgIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gICAgICBsZXQgY291bnRVcmwgPSB0aGlzLmN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJydW5uaW5nXCIsIHRydWUpO1xuICAgICAgZDNqc29uUHJvbWlzZShjb3VudFVybClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCBmYWxzZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IHNwYW4nKS50ZXh0KG4pXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgdHJ1ZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFFCRWRpdG9yIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBVbmRvTWFuYWdlciBtYWludGFpbnMgYSBoaXN0b3J5IHN0YWNrIG9mIHN0YXRlcyAoYXJiaXRyYXJ5IG9iamVjdHMpLlxuLy9cbmNsYXNzIFVuZG9NYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihsaW1pdCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIGNsZWFyICgpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMucG9pbnRlciA9IC0xO1xuICAgIH1cbiAgICBnZXQgY3VycmVudFN0YXRlICgpIHtcbiAgICAgICAgaWYgKHRoaXMucG9pbnRlciA8IDApXG4gICAgICAgICAgICB0aHJvdyBcIk5vIGN1cnJlbnQgc3RhdGUuXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgZ2V0IGhhc1N0YXRlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+PSAwO1xuICAgIH1cbiAgICBnZXQgY2FuVW5kbyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPiAwO1xuICAgIH1cbiAgICBnZXQgY2FuUmVkbyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1N0YXRlICYmIHRoaXMucG9pbnRlciA8IHRoaXMuaGlzdG9yeS5sZW5ndGgtMTtcbiAgICB9XG4gICAgYWRkIChzKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJBRERcIik7XG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXSA9IHM7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5zcGxpY2UodGhpcy5wb2ludGVyKzEpO1xuICAgIH1cbiAgICB1bmRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlVORE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuVW5kbykgdGhyb3cgXCJObyB1bmRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciAtPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIHJlZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiUkVET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5SZWRvKSB0aHJvdyBcIk5vIHJlZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzYXZlU3RhdGUgKG4pIHtcbiAgICAgICAgbGV0IHMgPSBKU09OLnN0cmluZ2lmeShuLnRlbXBsYXRlLnVuY29tcGlsZVRlbXBsYXRlKCkpO1xuICAgICAgICBpZiAoIXRoaXMuaGFzU3RhdGUgfHwgdGhpcy5jdXJyZW50U3RhdGUgIT09IHMpXG4gICAgICAgICAgICAvLyBvbmx5IHNhdmUgc3RhdGUgaWYgaXQgaGFzIGNoYW5nZWRcbiAgICAgICAgICAgIHRoaXMuYWRkKHMpO1xuICAgIH1cbiAgICB1bmRvU3RhdGUgKCkge1xuICAgICAgICB0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnVuZG8oKSk7IH1cbiAgICAgICAgY2F0Y2ggKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gICAgfVxuICAgIHJlZG9TdGF0ZSAoKSB7XG4gICAgICAgIHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHRoaXMucmVkbygpKTsgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7IGNvbnNvbGUubG9nKGVycik7IH1cbiAgICB9XG59XG5cbi8vXG5mdW5jdGlvbiB1bmRvKCkgeyB1bmRvcmVkbyhcInVuZG9cIikgfVxuZnVuY3Rpb24gcmVkbygpIHsgdW5kb3JlZG8oXCJyZWRvXCIpIH1cbmZ1bmN0aW9uIHVuZG9yZWRvKHdoaWNoKXtcbn1cblxuZXhwb3J0IHsgVW5kb01hbmFnZXIgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGVzYywgZGVlcGMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbm9kZS5qcyc7XG5pbXBvcnQgeyBDb25zdHJhaW50IH0gZnJvbSAnLi9jb25zdHJhaW50LmpzJztcblxuY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yICh0LCBtb2RlbCkge1xuICAgICAgICB0ID0gdCB8fCB7fVxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIHRoaXMubmFtZSA9IHQubmFtZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLnRpdGxlID0gdC50aXRsZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSB0LnNlbGVjdCA/IGRlZXBjKHQuc2VsZWN0KSA6IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gdC53aGVyZSA/IHQud2hlcmUubWFwKCBjID0+IHtcbiAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpIDtcbiAgICAgICAgICAgIGNjLm5vZGUgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNjO1xuICAgICAgICB9KSA6IFtdO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuam9pbnMgPSB0LmpvaW5zID8gZGVlcGModC5qb2lucykgOiBbXTtcbiAgICAgICAgdGhpcy50YWdzID0gdC50YWdzID8gZGVlcGModC50YWdzKSA6IFtdO1xuICAgICAgICB0aGlzLm9yZGVyQnkgPSB0Lm9yZGVyQnkgPyBkZWVwYyh0Lm9yZGVyQnkpIDogW107XG4gICAgICAgIHRoaXMuY29tcGlsZSgpO1xuICAgIH1cblxuICAgIGNvbXBpbGUgKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCByb290cyA9IFtdXG4gICAgICAgIGxldCB0ID0gdGhpcztcbiAgICAgICAgLy8gdGhlIHRyZWUgb2Ygbm9kZXMgcmVwcmVzZW50aW5nIHRoZSBjb21waWxlZCBxdWVyeSB3aWxsIGdvIGhlcmVcbiAgICAgICAgdC5xdHJlZSA9IG51bGw7XG4gICAgICAgIC8vIGluZGV4IG9mIGNvZGUgdG8gY29uc3RyYWludCBnb3JzIGhlcmUuXG4gICAgICAgIHQuY29kZTJjID0ge31cbiAgICAgICAgLy8gbm9ybWFsaXplIHRoaW5ncyB0aGF0IG1heSBiZSB1bmRlZmluZWRcbiAgICAgICAgdC5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgICAgIHQuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBzdWJjbGFzc0NzID0gW107XG4gICAgICAgIHQud2hlcmUgPSAodC53aGVyZSB8fCBbXSkubWFwKGMgPT4ge1xuICAgICAgICAgICAgLy8gY29udmVydCByYXcgY29udHJhaW50IGNvbmZpZ3MgdG8gQ29uc3RyYWludCBvYmplY3RzLlxuICAgICAgICAgICAgbGV0IGNjID0gbmV3IENvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICBpZiAoY2MuY29kZSkgdC5jb2RlMmNbY2MuY29kZV0gPSBjYztcbiAgICAgICAgICAgIGNjLmN0eXBlID09PSBcInN1YmNsYXNzXCIgJiYgc3ViY2xhc3NDcy5wdXNoKGNjKTtcbiAgICAgICAgICAgIHJldHVybiBjYztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbXVzdCBwcm9jZXNzIGFueSBzdWJjbGFzcyBjb25zdHJhaW50cyBmaXJzdCwgZnJvbSBzaG9ydGVzdCB0byBsb25nZXN0IHBhdGhcbiAgICAgICAgc3ViY2xhc3NDc1xuICAgICAgICAgICAgLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wYXRoLmxlbmd0aCAtIGIucGF0aC5sZW5ndGg7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGMucGF0aCk7XG4gICAgICAgICAgICAgICAgIGxldCBjbHMgPSBzZWxmLm1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgoYy5wYXRoKTtcbiAgICAgICAgICAgIGlmIChuLmNvbnN0cmFpbnRzKVxuICAgICAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG4uY29uc3RyYWludHMgPSBbY107XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy9cbiAgICAgICAgdC5zZWxlY3QgJiYgdC5zZWxlY3QuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBuLnNlbGVjdCgpO1xuICAgICAgICB9KVxuICAgICAgICB0LmpvaW5zICYmIHQuam9pbnMuZm9yRWFjaChmdW5jdGlvbihqKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGopO1xuICAgICAgICAgICAgbi5qb2luID0gXCJvdXRlclwiO1xuICAgICAgICB9KVxuICAgICAgICB0Lm9yZGVyQnkgJiYgdC5vcmRlckJ5LmZvckVhY2goZnVuY3Rpb24obywgaSl7XG4gICAgICAgICAgICBsZXQgcCA9IE9iamVjdC5rZXlzKG8pWzBdXG4gICAgICAgICAgICBsZXQgZGlyID0gb1twXVxuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBuLnNvcnQgPSB7IGRpcjogZGlyLCBsZXZlbDogaSB9O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0LnF0cmVlKSB7XG4gICAgICAgICAgICB0aHJvdyBcIk5vIHBhdGhzIGluIHF1ZXJ5LlwiXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdGVtcGxhdGUgYXMgYSBzaW1wbGUganNvbiBvYmplY3QuXG4gICAgLy9cbiAgICB1bmNvbXBpbGVUZW1wbGF0ZSAoKXtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgbGV0IHQgPSB7XG4gICAgICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgICAgICBtb2RlbDogeyBuYW1lOiB0bXBsdC5tb2RlbC5uYW1lIH0sXG4gICAgICAgICAgICB0YWdzOiBkZWVwYyh0bXBsdC50YWdzKSxcbiAgICAgICAgICAgIHNlbGVjdCA6IHRtcGx0LnNlbGVjdC5jb25jYXQoKSxcbiAgICAgICAgICAgIHdoZXJlIDogW10sXG4gICAgICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICAgICAgY29uc3RyYWludExvZ2ljOiB0bXBsdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIixcbiAgICAgICAgICAgIG9yZGVyQnkgOiBbXVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlYWNoKG4pe1xuICAgICAgICAgICAgbGV0IHAgPSBuLnBhdGhcbiAgICAgICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHNob3VsZCBhbHJlYWR5IGJlIHRoZXJlXG4gICAgICAgICAgICAgICAgaWYgKHQuc2VsZWN0LmluZGV4T2Yobi5wYXRoKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIChuLmNvbnN0cmFpbnRzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICAgICAgY2Mubm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgIHQud2hlcmUucHVzaChjYylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAobi5qb2luID09PSBcIm91dGVyXCIpIHtcbiAgICAgICAgICAgICAgICB0LmpvaW5zLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHMgPSB7fVxuICAgICAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlYWNoKTtcbiAgICAgICAgfVxuICAgICAgICByZWFjaCh0bXBsdC5xdHJlZSk7XG4gICAgICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICAgICAgcmV0dXJuIHRcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBOb2RlIGF0IHBhdGggcCwgb3IgbnVsbCBpZiB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY3VycmVudCBxdHJlZS5cbiAgICAvL1xuICAgIGdldE5vZGVCeVBhdGggKHApIHtcbiAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICBpZiAoIXApIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgcGFydHMgPSBwLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnF0cmVlO1xuICAgICAgICBpZiAobi5uYW1lICE9PSBwYXJ0c1swXSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGNuYW1lID0gcGFydHNbaV07XG4gICAgICAgICAgICBsZXQgYyA9IChuLmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoeCA9PiB4Lm5hbWUgPT09IGNuYW1lKVswXTtcbiAgICAgICAgICAgIGlmICghYykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBuID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG5cbiAgICAvLyBBZGRzIGEgcGF0aCB0byB0aGUgcXRyZWUgZm9yIHRoaXMgdGVtcGxhdGUuIFBhdGggaXMgc3BlY2lmaWVkIGFzIGEgZG90dGVkIGxpc3Qgb2YgbmFtZXMuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHBhdGggKHN0cmluZykgdGhlIHBhdGggdG8gYWRkLiBcbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgbGFzdCBwYXRoIGNvbXBvbmVudCBjcmVhdGVkLiBcbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBDcmVhdGVzIG5ldyBub2RlcyBhcyBuZWVkZWQgYW5kIGFkZHMgdGhlbSB0byB0aGUgcXRyZWUuXG4gICAgYWRkUGF0aCAocGF0aCl7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBjbGFzc2VzID0gdGhpcy5tb2RlbC5jbGFzc2VzO1xuICAgICAgICBsZXQgbGFzdHQgPSBudWxsO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIGxldCBjbHM7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgICAgICBsZXQgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGUgXG4gICAgICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNscyA9IGNsYXNzZXNbeC5yZWZlcmVuY2VkVHlwZV0gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgbWVtYmVyIG5hbWVkIFwiICsgcCArIFwiIGluIGNsYXNzIFwiICsgY2xzLm5hbWUgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IG5vZGUsIGFkZCBpdCB0byBuJ3MgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgbm4gPSBuZXcgTm9kZSh0ZW1wbGF0ZSwgbiwgcCwgeCwgY2xzKTtcbiAgICAgICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyByZXR1cm4gdGhlIGxhc3Qgbm9kZSBpbiB0aGUgcGF0aFxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gXG4gICAgLy8gUmV0dXJucyBhIHNpbmdsZSBjaGFyYWN0ZXIgY29uc3RyYWludCBjb2RlIGluIHRoZSByYW5nZSBBLVogdGhhdCBpcyBub3QgYWxyZWFkeVxuICAgIC8vIHVzZWQgaW4gdGhlIGdpdmVuIHRlbXBsYXRlLlxuICAgIC8vXG4gICAgbmV4dEF2YWlsYWJsZUNvZGUgKCl7XG4gICAgICAgIGZvcihsZXQgaT0gXCJBXCIuY2hhckNvZGVBdCgwKTsgaSA8PSBcIlpcIi5jaGFyQ29kZUF0KDApOyBpKyspe1xuICAgICAgICAgICAgbGV0IGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICAgICAgaWYgKCEgKGMgaW4gdGhpcy5jb2RlMmMpKVxuICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuXG5cbiAgICAvLyBTZXRzIHRoZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJlc3Npb24gZm9yIHRoaXMgdGVtcGxhdGUuXG4gICAgLy8gSW4gdGhlIHByb2Nlc3MsIGFsc28gXCJjb3JyZWN0c1wiIHRoZSBleHByZXNzaW9uIGFzIGZvbGxvd3M6XG4gICAgLy8gICAgKiBhbnkgY29kZXMgaW4gdGhlIGV4cHJlc3Npb24gdGhhdCBhcmUgbm90IGFzc29jaWF0ZWQgd2l0aFxuICAgIC8vICAgICAgYW55IGNvbnN0cmFpbnQgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUgYXJlIHJlbW92ZWQgYW5kIHRoZVxuICAgIC8vICAgICAgZXhwcmVzc2lvbiBsb2dpYyB1cGRhdGVkIGFjY29yZGluZ2x5XG4gICAgLy8gICAgKiBhbmQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHRoYXQgYXJlIG5vdCBpbiB0aGUgZXhwcmVzc2lvblxuICAgIC8vICAgICAgYXJlIEFORGVkIHRvIHRoZSBlbmQuXG4gICAgLy8gRm9yIGV4YW1wbGUsIGlmIHRoZSBjdXJyZW50IHRlbXBsYXRlIGhhcyBjb2RlcyBBLCBCLCBhbmQgQywgYW5kXG4gICAgLy8gdGhlIGV4cHJlc3Npb24gaXMgXCIoQSBvciBEKSBhbmQgQlwiLCB0aGUgRCBkcm9wcyBvdXQgYW5kIEMgaXNcbiAgICAvLyBhZGRlZCwgcmVzdWx0aW5nIGluIFwiQSBhbmQgQiBhbmQgQ1wiLiBcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuICAgIC8vICAgXG4gICAgc2V0TG9naWNFeHByZXNzaW9uIChleCkge1xuICAgICAgICBleCA9IGV4ID8gZXggOiAodGhpcy5jb25zdHJhaW50TG9naWMgfHwgXCJcIilcbiAgICAgICAgbGV0IGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICAgICAgbGV0IHNlZW4gPSBbXTtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgZnVuY3Rpb24gcmVhY2gobixsZXYpe1xuICAgICAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuIFxuICAgICAgICAgICAgICAgIC8vIElmIG5vdCwgcmVtb3ZlIGl0IGZyb20gdGhlIGV4cHIuXG4gICAgICAgICAgICAgICAgLy8gQWxzbyByZW1vdmUgaXQgaWYgaXQncyB0aGUgY29kZSBmb3IgYSBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgICAgICAgICAgICAgc2Vlbi5wdXNoKG4pO1xuICAgICAgICAgICAgICAgIHJldHVybiAobiBpbiB0bXBsdC5jb2RlMmMgJiYgdG1wbHQuY29kZTJjW25dLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpID8gbiA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY21zID0gbi5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYyl7cmV0dXJuIHJlYWNoKGMsIGxldisxKTt9KS5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHg7fSk7O1xuICAgICAgICAgICAgbGV0IGNtc3MgPSBjbXMuam9pbihcIiBcIituLm9wK1wiIFwiKTtcbiAgICAgICAgICAgIHJldHVybiBjbXMubGVuZ3RoID09PSAwID8gXCJcIiA6IGxldiA9PT0gMCB8fCBjbXMubGVuZ3RoID09PSAxID8gY21zcyA6IFwiKFwiICsgY21zcyArIFwiKVwiXG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFzdCA9IGV4ID8gcGFyc2VyLnBhcnNlKGV4KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYWxlcnQoZXJyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbnRMb2dpYztcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBsZXQgbGV4ID0gYXN0ID8gcmVhY2goYXN0LDApIDogXCJcIjtcbiAgICAgICAgLy8gaWYgYW55IGNvbnN0cmFpbnQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHdlcmUgbm90IHNlZW4gaW4gdGhlIGV4cHJlc3Npb24sXG4gICAgICAgIC8vIEFORCB0aGVtIGludG8gdGhlIGV4cHJlc3Npb24gKGV4Y2VwdCBJU0EgY29uc3RyYWludHMpLlxuICAgICAgICBsZXQgdG9BZGQgPSBPYmplY3Qua2V5cyh0aGlzLmNvZGUyYykuZmlsdGVyKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgcmV0dXJuIHNlZW4uaW5kZXhPZihjKSA9PT0gLTEgJiYgYy5vcCAhPT0gXCJJU0FcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodG9BZGQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgIGlmKGFzdCAmJiBhc3Qub3AgJiYgYXN0Lm9wID09PSBcIm9yXCIpXG4gICAgICAgICAgICAgICAgIGxleCA9IGAoJHtsZXh9KWA7XG4gICAgICAgICAgICAgaWYgKGxleCkgdG9BZGQudW5zaGlmdChsZXgpO1xuICAgICAgICAgICAgIGxleCA9IHRvQWRkLmpvaW4oXCIgYW5kIFwiKTtcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IGxleDtcblxuICAgICAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGxleDsgfSk7XG5cbiAgICAgICAgcmV0dXJuIGxleDtcbiAgICB9XG4gXG4gICAgLy8gXG4gICAgZ2V0WG1sIChxb25seSkge1xuICAgICAgICBsZXQgdCA9IHRoaXMudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgICAgbGV0IHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7IFxuICAgICAgICAgICAgbGV0IGsgPSBPYmplY3Qua2V5cyh4KVswXTtcbiAgICAgICAgICAgIGxldCB2ID0geFtrXVxuICAgICAgICAgICAgcmV0dXJuIHMgKyBgJHtrfSAke3Z9IGA7XG4gICAgICAgIH0sIFwiXCIpO1xuXG4gICAgICAgIC8vIENvbnZlcnRzIGFuIG91dGVyIGpvaW4gcGF0aCB0byB4bWwuXG4gICAgICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgICAgICByZXR1cm4gYDxqb2luIHBhdGg9XCIke29qfVwiIHN0eWxlPVwiT1VURVJcIiAvPmA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgICAgICBsZXQgcXBhcnQgPSBcbiAgICBgPHF1ZXJ5XG4gICAgICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgICAgIG1vZGVsPVwiJHsodC5tb2RlbCAmJiB0Lm1vZGVsLm5hbWUpIHx8ICcnfVwiXG4gICAgICB2aWV3PVwiJHt0LnNlbGVjdC5qb2luKCcgJyl9XCJcbiAgICAgIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gICAgICBzb3J0T3JkZXI9XCIke3NvIHx8ICcnfVwiXG4gICAgICAke3QuY29uc3RyYWludExvZ2ljICYmICdjb25zdHJhaW50TG9naWM9XCInK3QuY29uc3RyYWludExvZ2ljKydcIicgfHwgJyd9XG4gICAgPlxuICAgICAgJHsodC5qb2lucyB8fCBbXSkubWFwKG9qMnhtbCkuam9pbihcIiBcIil9XG4gICAgICAkeyh0LndoZXJlIHx8IFtdKS5tYXAoYyA9PiBjLmMyeG1sKHFvbmx5KSkuam9pbihcIiBcIil9XG4gICAgPC9xdWVyeT5gO1xuICAgICAgICAvLyB0aGUgd2hvbGUgdGVtcGxhdGVcbiAgICAgICAgbGV0IHRtcGx0ID0gXG4gICAgYDx0ZW1wbGF0ZVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gICAgICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAgICAgJHtxcGFydH1cbiAgICA8L3RlbXBsYXRlPlxuICAgIGA7XG4gICAgICAgIHJldHVybiBxb25seSA/IHFwYXJ0IDogdG1wbHRcbiAgICB9XG5cbiAgICBnZXRKc29uICgpIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0LCBudWxsLCAyKTtcbiAgICB9XG5cbn0gLy8gZW5kIG9mIGNsYXNzIFRlbXBsYXRlXG5cbmV4cG9ydCB7IFRlbXBsYXRlIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy90ZW1wbGF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBDb25zdHJhaW50IH0gZnJvbSAnLi9jb25zdHJhaW50LmpzJztcblxuLy9cbmNsYXNzIE5vZGUge1xuICAgIC8vIEFyZ3M6XG4gICAgLy8gICB0ZW1wbGF0ZSAoVGVtcGxhdGUgb2JqZWN0KSB0aGUgdGVtcGxhdGUgdGhhdCBvd25zIHRoaXMgbm9kZVxuICAgIC8vICAgcGFyZW50IChvYmplY3QpIFBhcmVudCBvZiB0aGUgbmV3IG5vZGUuXG4gICAgLy8gICBuYW1lIChzdHJpbmcpIE5hbWUgZm9yIHRoZSBub2RlXG4gICAgLy8gICBwY29tcCAob2JqZWN0KSBQYXRoIGNvbXBvbmVudCBmb3IgdGhlIHJvb3QsIHRoaXMgaXMgYSBjbGFzcy4gRm9yIG90aGVyIG5vZGVzLCBhbiBhdHRyaWJ1dGUsIFxuICAgIC8vICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uIGRlY3JpcHRvci5cbiAgICAvLyAgIHB0eXBlIChvYmplY3QpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsIG9yIGEgXCJsZWFmXCIgY2xhc3MgKGVnIGphdmEubGFuZy5TdHJpbmcpLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcblxuICAgICAgICB0aGlzLmpvaW4gPSBudWxsOyAvLyBpZiB0cnVlLCB0aGVuIHRoZSBsaW5rIGJldHdlZW4gbXkgcGFyZW50IGFuZCBtZSBpcyBhbiBvdXRlciBqb2luXG4gICAgICAgIFxuICAgICAgICB0aGlzLmlkID0gdGhpcy5wYXRoO1xuICAgIH1cbiAgICBnZXQgaXNSb290ICgpIHtcbiAgICAgICAgcmV0dXJuICEgdGhpcy5wYXJlbnQ7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gb3BlcmF0b3IgaXMgdmFsaWQgZm9yIHRoaXMgbm9kZS5cbiAgICBvcFZhbGlkIChvcCl7XG4gICAgICAgIGlmICh0aGlzLmlzUm9vdCAmJiAhb3AudmFsaWRGb3JSb290KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmICh0aGlzLnB0eXBlLmlzTGVhZlR5cGUpIHtcbiAgICAgICAgICAgIGlmKCEgb3AudmFsaWRGb3JBdHRyKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKHRoaXMucHR5cGUubmFtZSkgPT0gLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoISBvcC52YWxpZEZvckNsYXNzKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBsaXN0IGlzIHZhbGlkIGFzIGEgbGlzdCBjb25zdHJhaW50IG9wdGlvbiBmb3JcbiAgICAvLyB0aGUgbm9kZSBuLiBBIGxpc3QgaXMgdmFsaWQgdG8gdXNlIGluIGEgbGlzdCBjb25zdHJhaW50IGF0IG5vZGUgbiBpZmZcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgZXF1YWwgdG8gb3IgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGVcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgYSBzdXBlcmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZS4gSW4gdGhpcyBjYXNlLFxuICAgIC8vICAgICAgIGVsZW1lbnRzIGluIHRoZSBsaXN0IHRoYXQgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICAgYXJlIGF1dG9tYXRpY2FsbHkgZmlsdGVyZWQgb3V0LlxuICAgIGxpc3RWYWxpZCAobGlzdCl7XG4gICAgICAgIGxldCBudCA9IHRoaXMuc3VidHlwZUNvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICAgICAgaWYgKG50LmlzTGVhZlR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IGx0ID0gdGhpcy50ZW1wbGF0ZS5tb2RlbC5jbGFzc2VzW2xpc3QudHlwZV07XG4gICAgICAgIHJldHVybiBpc1N1YmNsYXNzKGx0LCBudCkgfHwgaXNTdWJjbGFzcyhudCwgbHQpO1xuICAgIH1cblxuXG4gICAgLy9cbiAgICBnZXQgcGF0aCAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoICtcIi5cIiA6IFwiXCIpICsgdGhpcy5uYW1lO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBub2RlVHlwZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCB8fCB0aGlzLnB0eXBlO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc0Jpb0VudGl0eSAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIGNrKGNscykge1xuICAgICAgICAgICAgLy8gc2ltcGxlIGF0dHJpYnV0ZSAtIG5vcGVcbiAgICAgICAgICAgIGlmIChjbHMuaXNMZWFmVHlwZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgLy8gQmlvRW50aXR5IC0geXVwXG4gICAgICAgICAgICBpZiAoY2xzLm5hbWUgPT09IFwiQmlvRW50aXR5XCIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgLy8gbmVpdGhlciAtIGNoZWNrIGFuY2VzdG9yc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbHMuZXh0ZW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjayhjbHMuZXh0ZW5kc1tpXSkpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayh0aGlzLm5vZGVUeXBlKTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNTZWxlY3RlZCAoKSB7XG4gICAgICAgICByZXR1cm4gdGhpcy52aWV3ICE9PSBudWxsICYmIHRoaXMudmlldyAhPT0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIHRoaXMudmlldyA9IGkgPj0gMCA/IGkgOiAodC5zZWxlY3QucHVzaChwKSAtIDEpO1xuICAgIH1cbiAgICB1bnNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHBhdGggZnJvbSB0aGUgc2VsZWN0IGxpc3RcbiAgICAgICAgICAgIHQuc2VsZWN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgLy8gRklYTUU6IHJlbnVtYmVyIG5vZGVzIGhlcmVcbiAgICAgICAgICAgIHQuc2VsZWN0LnNsaWNlKGkpLmZvckVhY2goIChwLGopID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IHRoaXMudGVtcGxhdGUuZ2V0Tm9kZUJ5UGF0aChwKTtcbiAgICAgICAgICAgICAgICBuLnZpZXcgLT0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0cnVlIGlmZiB0aGlzIG5vZGUgY2FuIGJlIHNvcnRlZCBvbiwgd2hpY2ggaXMgdHJ1ZSBpZmYgdGhlIG5vZGUgaXMgYW5cbiAgICAvLyBhdHRyaWJ1dGUsIGFuZCB0aGVyZSBhcmUgbm8gb3V0ZXIgam9pbnMgYmV0d2VlbiBpdCBhbmQgdGhlIHJvb3RcbiAgICBjYW5Tb3J0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgbiA9IHRoaXM7XG4gICAgICAgIHdoaWxlIChuKSB7XG4gICAgICAgICAgICBpZiAobi5qb2luKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBuID0gbi5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc2V0U29ydChuZXdkaXIpe1xuICAgICAgICBsZXQgb2xkZGlyID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmRpciA6IFwibm9uZVwiO1xuICAgICAgICBsZXQgb2xkbGV2ID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgIGxldCBtYXhsZXYgPSAtMTtcbiAgICAgICAgbGV0IHJlbnVtYmVyID0gZnVuY3Rpb24gKG4pe1xuICAgICAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCAmJiBuLnNvcnQubGV2ZWwgPiBvbGRsZXYpXG4gICAgICAgICAgICAgICAgICAgIG4uc29ydC5sZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIG1heGxldiA9IE1hdGgubWF4KG1heGxldiwgbi5zb3J0LmxldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZW51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFuZXdkaXIgfHwgbmV3ZGlyID09PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgLy8gc2V0IHRvIG5vdCBzb3J0ZWRcbiAgICAgICAgICAgIHRoaXMuc29ydCA9IG51bGw7XG4gICAgICAgICAgICBpZiAob2xkbGV2ID49IDApe1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgc29ydGVkIGJlZm9yZSwgbmVlZCB0byByZW51bWJlciBhbnkgZXhpc3Rpbmcgc29ydCBjZmdzLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0IHRvIHNvcnRlZFxuICAgICAgICAgICAgaWYgKG9sZGxldiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIG5vdCBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIGZpbmQgbmV4dCBsZXZlbC5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgICAgICBvbGRsZXYgPSBtYXhsZXYgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zb3J0ID0geyBkaXI6bmV3ZGlyLCBsZXZlbDogb2xkbGV2IH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXRzIHRoZSBzdWJjbGFzcyBjb25zdHJhaW50IGF0IHRoaXMgbm9kZSwgb3IgcmVtb3ZlcyBpdCBpZiBubyBzdWJjbGFzcyBnaXZlbi4gQSBub2RlIG1heVxuICAgIC8vIGhhdmUgZXhhY3RseSAwIG9yIDEgc3ViY2xhc3MgY29uc3RyYWludC4gQXNzdW1lcyB0aGUgc3ViY2xhc3MgaXMgYWN0dWFsbHkgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzXG4gICAgLy8gdHlwZSAoc2hvdWxkIGNoZWNrIHRoaXMpLlxuICAgIC8vXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIGMgKENvbnN0cmFpbnQpIFRoZSBzdWJjbGFzcyBDb25zdHJhaW50IG9yIG51bGwuIFNldHMgdGhlIHN1YmNsYXNzIGNvbnN0cmFpbnQgb24gdGhlIGN1cnJlbnQgbm9kZSB0b1xuICAgIC8vICAgICAgIHRoZSB0eXBlIG5hbWVkIGluIGMuIFJlbW92ZXMgdGhlIHByZXZpb3VzIHN1YmNsYXNzIGNvbnN0cmFpbnQgaWYgYW55LiBJZiBudWxsLCBqdXN0IHJlbW92ZXNcbiAgICAvLyAgICAgICBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgTGlzdCBvZiBhbnkgbm9kZXMgdGhhdCB3ZXJlIHJlbW92ZWQgYmVjYXVzZSB0aGUgbmV3IGNvbnN0cmFpbnQgY2F1c2VkIHRoZW0gdG8gYmVjb21lIGludmFsaWQuXG4gICAgLy9cbiAgICBzZXRTdWJjbGFzc0NvbnN0cmFpbnQgKGMpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzO1xuICAgICAgICAvLyByZW1vdmUgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgaWYgKGMgJiYgbi5jb25zdHJhaW50cy5pbmRleE9mKGMpID09PSAtMSlcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKTtcbiAgICAgICAgbi5jb25zdHJhaW50cyA9IG4uY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uIChjYyl7IHJldHVybiBjYy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiIHx8IGNjID09PSBjOyB9KTtcbiAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgICAgICBpZiAoYyl7XG4gICAgICAgICAgICAvLyBsb29rdXAgdGhlIHN1YmNsYXNzIG5hbWVcbiAgICAgICAgICAgIGxldCBjbHMgPSB0aGlzLnRlbXBsYXRlLm1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgIGlmKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAvLyBhZGQgdGhlIGNvbnN0cmFpbnRcbiAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICB9XG4gICAgICAgIC8vIGxvb2tzIGZvciBpbnZhbGlkYXRlZCBwYXRocyBcbiAgICAgICAgZnVuY3Rpb24gY2hlY2sobm9kZSwgcmVtb3ZlZCkge1xuICAgICAgICAgICAgbGV0IGNscyA9IG5vZGUuc3ViY2xhc3NDb25zdHJhaW50IHx8IG5vZGUucHR5cGU7XG4gICAgICAgICAgICBsZXQgYzIgPSBbXTtcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICBpZihjLm5hbWUgaW4gY2xzLmF0dHJpYnV0ZXMgfHwgYy5uYW1lIGluIGNscy5yZWZlcmVuY2VzIHx8IGMubmFtZSBpbiBjbHMuY29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgYzIucHVzaChjKTtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2soYywgcmVtb3ZlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSBjMjtcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZW1vdmVkID0gY2hlY2sobixbXSk7XG4gICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgdGhpcyBub2RlIGZyb20gdGhlIHF1ZXJ5LlxuICAgIHJlbW92ZSAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIGlmICghcCkgcmV0dXJuO1xuICAgICAgICAvLyBGaXJzdCwgcmVtb3ZlIGFsbCBjb25zdHJhaW50cyBvbiB0aGlzIG9yIGRlc2NlbmRhbnRzXG4gICAgICAgIGZ1bmN0aW9uIHJtYyAoeCkge1xuICAgICAgICAgICAgeC51bnNlbGVjdCgpO1xuICAgICAgICAgICAgeC5jb25zdHJhaW50cy5mb3JFYWNoKGMgPT4geC5yZW1vdmVDb25zdHJhaW50KGMpKTtcbiAgICAgICAgICAgIHguY2hpbGRyZW4uZm9yRWFjaChybWMpO1xuICAgICAgICB9XG4gICAgICAgIHJtYyh0aGlzKTtcbiAgICAgICAgLy8gTm93IHJlbW92ZSB0aGUgc3VidHJlZSBhdCBuLlxuICAgICAgICBwLmNoaWxkcmVuLnNwbGljZShwLmNoaWxkcmVuLmluZGV4T2YodGhpcyksIDEpO1xuICAgIH1cblxuICAgIC8vIEFkZHMgYSBuZXcgY29uc3RyYWludCB0byBhIG5vZGUgYW5kIHJldHVybnMgaXQuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIGMgKGNvbnN0cmFpbnQpIElmIGdpdmVuLCB1c2UgdGhhdCBjb25zdHJhaW50LiBPdGhlcndpc2UsIGNyZWF0ZSBkZWZhdWx0LlxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICBUaGUgbmV3IGNvbnN0cmFpbnQuXG4gICAgLy9cbiAgICBhZGRDb25zdHJhaW50IChjKSB7XG4gICAgICAgIGlmIChjKSB7XG4gICAgICAgICAgICAvLyBqdXN0IHRvIGJlIHN1cmVcbiAgICAgICAgICAgIGMubm9kZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgb3AgPSBPUElOREVYW3RoaXMucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIiA/IFwiPVwiIDogXCJMT09LVVBcIl07XG4gICAgICAgICAgICBjID0gbmV3IENvbnN0cmFpbnQoe25vZGU6dGhpcywgb3A6b3Aub3AsIGN0eXBlOiBvcC5jdHlwZX0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29uc3RyYWludHMucHVzaChjKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS53aGVyZS5wdXNoKGMpO1xuXG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3ViY2xhc3NDb25zdHJhaW50KGMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYy5jb2RlID0gdGhpcy50ZW1wbGF0ZS5uZXh0QXZhaWxhYmxlQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbnN0cmFpbnQgKGMpe1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gdGhpcy5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLndoZXJlID0gdGhpcy50ZW1wbGF0ZS53aGVyZS5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgdGhpcy5zZXRTdWJjbGFzc0NvbnN0cmFpbnQobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE5vZGVcblxuZXhwb3J0IHsgTm9kZSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbm9kZS5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgZDNqc29uUHJvbWlzZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgcmVnaXN0cnlVcmwgPSBcImh0dHA6Ly9yZWdpc3RyeS5pbnRlcm1pbmUub3JnL3NlcnZpY2UvaW5zdGFuY2VzXCI7XG5sZXQgcmVnaXN0cnlGaWxlVXJsID0gXCIuL3Jlc291cmNlcy90ZXN0ZGF0YS9yZWdpc3RyeS5qc29uXCI7XG5cbmZ1bmN0aW9uIGluaXRSZWdpc3RyeSAoY2IpIHtcbiAgICByZXR1cm4gZDNqc29uUHJvbWlzZShyZWdpc3RyeVVybClcbiAgICAgIC50aGVuKGNiKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyByZWdpc3RyeSBhdCAke3JlZ2lzdHJ5VXJsfS4gVHJ5aW5nICR7cmVnaXN0cnlGaWxlVXJsfS5gKTtcbiAgICAgICAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5RmlsZVVybClcbiAgICAgICAgICAgICAgLnRoZW4oY2IpXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBhbGVydChcIkNhbm5vdCBhY2Nlc3MgcmVnaXN0cnkgZmlsZS4gVGhpcyBpcyBub3QgeW91ciBsdWNreSBkYXkuXCIpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbn1cblxuZXhwb3J0IHsgaW5pdFJlZ2lzdHJ5IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9yZWdpc3RyeS5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHtjb2RlcG9pbnRzfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5cbmxldCBlZGl0Vmlld3MgPSB7IHF1ZXJ5TWFpbjoge1xuICAgICAgICBuYW1lOiBcInF1ZXJ5TWFpblwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCIsXG4gICAgICAgIG5vZGVDb21wOiBudWxsLFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3Ryb2tlOiBcIiNlMjhiMjhcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICB9XG4gICAgfSxcbiAgICBjb2x1bW5PcmRlcjoge1xuICAgICAgICBuYW1lOiBcImNvbHVtbk9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNlbGVjdGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbHVtbiBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzZWxlY3Rpb24tbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuaXNTZWxlY3RlZClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IGEudmlldyAtIGIudmlldyA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBkcmFnIGluIGNvbHVtbk9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgY29sdW1uIG9yZGVyIChkdWghKVxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7IG4udmlldyA9IGkgfSk7XG4gICAgICAgICAgZHJhZ2dlZC50ZW1wbGF0ZS5zZWxlY3QgPSBub2Rlcy5tYXAoIG49PiBuLnBhdGggKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IG51bGwsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IG4udmlldyA6IFwiXCJcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc29ydE9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwic29ydE9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNvcnRlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBzb3J0IG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzb3J0LWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5zb3J0KVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gYS5zb3J0LmxldmVsIC0gYi5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICAvLyBkcmFnIGluIHNvcnRPcmRlciB2aWV3IGNoYW5nZXMgdGhlIHNvcnQgb3JkZXIgKGR1aCEpXG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7XG4gICAgICAgICAgICAgIG4uc29ydC5sZXZlbCA9IGlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLnNvcnQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBuLnNvcnQgPyBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgY2MgPSBjb2RlcG9pbnRzWyBkaXIgPT09IFwiYXNjXCIgPyBcImFycm93X3Vwd2FyZFwiIDogZGlyID09PSBcImRlc2NcIiA/IFwiYXJyb3dfZG93bndhcmRcIiA6IFwiXCIgXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2MgPyBjYyA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29uc3RyYWludExvZ2ljOiB7XG4gICAgICAgIG5hbWU6IFwiY29uc3RyYWludExvZ2ljXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29uc3RyYWludCBsb2dpYyB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIGNvbnN0cmFpbmVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBjb2RlIG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgbGV0IGFjb25zdCA9IGEuY29uc3RyYWludHMgJiYgYS5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBhY29kZSA9IGFjb25zdCA/IGEuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgbGV0IGJjb25zdCA9IGIuY29uc3RyYWludHMgJiYgYi5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBiY29kZSA9IGJjb25zdCA/IGIuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgaWYgKGFjb25zdClcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IChhY29kZSA8IGJjb2RlID8gLTEgOiBhY29kZSA+IGJjb2RlID8gMSA6IDApIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gMSA6IG5hbWVDb21wKGEsIGIpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb21wYXJhdG9yIGZ1bmN0aW9uLCBmb3Igc29ydGluZyBhIGxpc3Qgb2Ygbm9kZXMgYnkgbmFtZS4gQ2FzZS1pbnNlbnNpdGl2ZS5cbi8vXG5sZXQgbmFtZUNvbXAgPSBmdW5jdGlvbihhLGIpIHtcbiAgICBsZXQgbmEgPSBhLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgbmIgPSBiLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gbmEgPCBuYiA/IC0xIDogbmEgPiBuYiA/IDEgOiAwO1xufTtcblxuZXhwb3J0IHsgZWRpdFZpZXdzIH07XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2VkaXRWaWV3cy5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgZmluZERvbUJ5RGF0YU9iaiB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jbGFzcyBEaWFsb2cge1xuICAgIGNvbnN0cnVjdG9yIChlZGl0b3IpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvciA9IGVkaXRvci5jb25zdHJhaW50RWRpdG9yO1xuICAgICAgICB0aGlzLnVuZG9NZ3IgPSBlZGl0b3IudW5kb01ncjtcbiAgICAgICAgdGhpcy5jdXJyTm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZGcgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpO1xuICAgICAgICB0aGlzLmRnLmNsYXNzZWQoXCJoaWRkZW5cIix0cnVlKVxuICAgICAgICB0aGlzLmRnLnNlbGVjdChcIi5idXR0b24uY2xvc2VcIikub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLmhpZGUoKSk7XG4gICAgICAgIHRoaXMuZGcuc2VsZWN0KFwiLmJ1dHRvbi5yZW1vdmVcIikub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLmVkaXRvci5yZW1vdmVOb2RlKHRoaXMuY3Vyck5vZGUpKTtcblxuICAgICAgICAvLyBXaXJlIHVwIHNlbGVjdCBidXR0b24gaW4gZGlhbG9nXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmN1cnJOb2RlLmlzU2VsZWN0ZWQgPyBzZWxmLmN1cnJOb2RlLnVuc2VsZWN0KCkgOiBzZWxmLmN1cnJOb2RlLnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBzZWxmLmN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIFdpcmUgdXAgc29ydCBmdW5jdGlvbiBpbiBkaWFsb2dcbiAgICAgICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNjLmNsYXNzZWQoXCJkaXNhYmxlZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGxldCBvbGRzb3J0ID0gY2MuY2xhc3NlZChcInNvcnRhc2NcIikgPyBcImFzY1wiIDogY2MuY2xhc3NlZChcInNvcnRkZXNjXCIpID8gXCJkZXNjXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgbmV3c29ydCA9IG9sZHNvcnQgPT09IFwiYXNjXCIgPyBcImRlc2NcIiA6IG9sZHNvcnQgPT09IFwiZGVzY1wiID8gXCJub25lXCIgOiBcImFzY1wiO1xuICAgICAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG5ld3NvcnQgPT09IFwiYXNjXCIpO1xuICAgICAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuZXdzb3J0ID09PSBcImRlc2NcIik7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJyTm9kZS5zZXRTb3J0KG5ld3NvcnQpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEhpZGVzIHRoZSBkaWFsb2cuIFNldHMgdGhlIGN1cnJlbnQgbm9kZSB0byBudWxsLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBub25lXG4gICAgLy8gUmV0dXJuc1xuICAgIC8vICBub3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICBIaWRlcyB0aGUgZGlhbG9nLlxuICAgIC8vICBTZXRzIGN1cnJOb2RlIHRvIG51bGwuXG4gICAgLy9cbiAgICBoaWRlICgpe1xuICAgICAgdGhpcy5jdXJyTm9kZSA9IG51bGw7XG4gICAgICB0aGlzLmRnXG4gICAgICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgdHJ1ZSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZWRpdG9yLmFuaW1hdGlvbkR1cmF0aW9uLzIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxZS02KVwiKVxuICAgICAgICAgIDtcbiAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvci5oaWRlKCk7XG4gICAgfVxuXG4gICAgLy8gT3BlbnMgYSBkaWFsb2cgb24gdGhlIHNwZWNpZmllZCBub2RlLlxuICAgIC8vIEFsc28gbWFrZXMgdGhhdCBub2RlIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIG4gICAgdGhlIG5vZGVcbiAgICAvLyAgIGVsdCAgdGhlIERPTSBlbGVtZW50IChlLmcuIGEgY2lyY2xlKVxuICAgIC8vIFJldHVybnNcbiAgICAvLyAgIHN0cmluZ1xuICAgIC8vIFNpZGUgZWZmZWN0OlxuICAgIC8vICAgc2V0cyBnbG9iYWwgY3Vyck5vZGVcbiAgICAvL1xuICAgIHNob3cgKG4sIGVsdCwgcmVmcmVzaE9ubHkpIHtcbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGlmICghZWx0KSBlbHQgPSBmaW5kRG9tQnlEYXRhT2JqKG4pO1xuICAgICAgdGhpcy5jb25zdHJhaW50RWRpdG9yLmhpZGUoKTtcbiAgICAgIHRoaXMuY3Vyck5vZGUgPSBuO1xuXG4gICAgICBsZXQgaXNyb290ID0gISB0aGlzLmN1cnJOb2RlLnBhcmVudDtcbiAgICAgIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgICAgIGxldCBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpLmRhdHVtKG4pO1xuICAgICAgLy8gQ2FsY3VsYXRlIGRpYWxvZydzIHBvc2l0aW9uXG4gICAgICBsZXQgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGV0IGViYiA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCBiYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBsZXQgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgICAgIGxldCBiID0gKGJiYi5ib3R0b20gLSBlYmIuYm90dG9tKSArIGViYi53aWR0aC8yO1xuICAgICAgbGV0IGwgPSAoZWJiLmxlZnQgLSBiYmIubGVmdCkgKyBlYmIuaGVpZ2h0LzI7XG4gICAgICBsZXQgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAgICAgLy8gTkI6IGNhbid0IGdldCBvcGVuaW5nIHVwIHRvIHdvcmssIHNvIGhhcmQgd2lyZSBpdCB0byBkb3duLiA6LVxcXG5cbiAgICAgIC8vXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIGwrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLCByZWZyZXNoT25seT9cInNjYWxlKDEpXCI6XCJzY2FsZSgxZS02KVwiKVxuICAgICAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgICAgIC5jbGFzc2VkKFwiaXNyb290XCIsIGlzcm9vdClcbiAgICAgICAgICA7XG4gICAgICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIHQrXCJweFwiKVxuICAgICAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDAlXCIpIDtcbiAgICAgIGVsc2VcbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIG51bGwpXG4gICAgICAgICAgICAgIC5zdHlsZShcImJvdHRvbVwiLCBiK1wicHhcIilcbiAgICAgICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gICAgICAvLyBTZXQgdGhlIGRpYWxvZyB0aXRsZSB0byBub2RlIG5hbWVcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZGlhbG9nVGl0bGVcIl0gc3BhbicpXG4gICAgICAgICAgLnRleHQobi5uYW1lKTtcbiAgICAgIC8vIFNob3cgdGhlIGZ1bGwgcGF0aFxuICAgICAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJmdWxsUGF0aFwiXSBkaXYnKVxuICAgICAgICAgIC50ZXh0KG4ucGF0aCk7XG4gICAgICAvLyBUeXBlIG5hbWUgYXQgdGhpcyBub2RlXG4gICAgICBsZXQgdHAgPSBuLnB0eXBlLm5hbWU7XG4gICAgICBsZXQgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gICAgICBsZXQgdHN0cmluZyA9IHN0cCAmJiBgPHNwYW4gc3R5bGU9XCJjb2xvcjogcHVycGxlO1wiPiR7c3RwfTwvc3Bhbj4gKCR7dHB9KWAgfHwgdHBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwidHlwZVwiXSBkaXYnKVxuICAgICAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gICAgICAvLyBXaXJlIHVwIGFkZCBjb25zdHJhaW50IGJ1dHRvblxuICAgICAgZGlhbG9nLnNlbGVjdChcIiNkaWFsb2cgLmNvbnN0cmFpbnRTZWN0aW9uIC5hZGQtYnV0dG9uXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBjID0gbi5hZGRDb25zdHJhaW50KCk7XG4gICAgICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgICAgICBzZWxmLmVkaXRvci51cGRhdGUobik7XG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KG4sIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuY29uc3RyYWludEVkaXRvci5vcGVuKGMsIG4pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGwgb3V0IHRoZSBjb25zdHJhaW50cyBzZWN0aW9uLiBGaXJzdCwgc2VsZWN0IGFsbCBjb25zdHJhaW50cy5cbiAgICAgIGxldCBjb25zdHJzID0gZGlhbG9nLnNlbGVjdChcIi5jb25zdHJhaW50U2VjdGlvblwiKVxuICAgICAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgICAgIC5kYXRhKG4uY29uc3RyYWludHMpO1xuICAgICAgLy8gRW50ZXIoKTogY3JlYXRlIGRpdnMgZm9yIGVhY2ggY29uc3RyYWludCB0byBiZSBkaXNwbGF5ZWQgIChUT0RPOiB1c2UgYW4gSFRNTDUgdGVtcGxhdGUgaW5zdGVhZClcbiAgICAgIC8vIDEuIGNvbnRhaW5lclxuICAgICAgbGV0IGNkaXZzID0gY29uc3Rycy5lbnRlcigpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIixcImNvbnN0cmFpbnRcIikgO1xuICAgICAgLy8gMi4gb3BlcmF0b3JcbiAgICAgIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgICAgIC8vIDMuIHZhbHVlXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJ2YWx1ZVwiKSA7XG4gICAgICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgICAgIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcImNvZGVcIikgO1xuICAgICAgLy8gNS4gYnV0dG9uIHRvIGVkaXQgdGhpcyBjb25zdHJhaW50XG4gICAgICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKS5hdHRyKFwidGl0bGVcIixcIkVkaXQgdGhpcyBjb25zdHJhaW50XCIpO1xuICAgICAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgICAgIGNkaXZzLmFwcGVuZChcImlcIikuYXR0cihcImNsYXNzXCIsIFwibWF0ZXJpYWwtaWNvbnMgY2FuY2VsXCIpLnRleHQoXCJkZWxldGVfZm9yZXZlclwiKS5hdHRyKFwidGl0bGVcIixcIlJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcIik7XG5cbiAgICAgIC8vIFJlbW92ZSBleGl0aW5nXG4gICAgICBjb25zdHJzLmV4aXQoKS5yZW1vdmUoKSA7XG5cbiAgICAgIC8vIFNldCB0aGUgdGV4dCBmb3IgZWFjaCBjb25zdHJhaW50XG4gICAgICBjb25zdHJzXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihjKSB7IHJldHVybiBcImNvbnN0cmFpbnQgXCIgKyBjLmN0eXBlOyB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMub3AgfHwgXCJJU0FcIjsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgIC8vIEZJWE1FIFxuICAgICAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgKyAoYy5leHRyYVZhbHVlID8gXCIgaW4gXCIgKyBjLmV4dHJhVmFsdWUgOiBcIlwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSB8fCAoYy52YWx1ZXMgJiYgYy52YWx1ZXMuam9pbihcIixcIikpIHx8IGMudHlwZTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjLCBuKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KFwiaS5jYW5jZWxcIilcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKG4pO1xuICAgICAgICAgICAgICBzZWxmLnNob3cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgfSlcblxuXG4gICAgICAvLyBUcmFuc2l0aW9uIHRvIFwiZ3Jvd1wiIHRoZSBkaWFsb2cgb3V0IG9mIHRoZSBub2RlXG4gICAgICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZWRpdG9yLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMS4wKVwiKTtcblxuICAgICAgLy9cbiAgICAgIGxldCB0eXAgPSBuLnBjb21wLnR5cGUgfHwgbi5wY29tcDsgLy8gdHlwZSBvZiB0aGUgbm9kZS4gQ2FzZSBmb3IgaWYgcm9vdCBub2RlLlxuICAgICAgaWYgKHR5cC5pc0xlYWZUeXBlKSB7XG4gICAgICAgICAgLy8gZGlhbG9nIGZvciBzaW1wbGUgYXR0cmlidXRlcy5cbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIix0cnVlKTtcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgICAgIC8vIFxuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic2VsZWN0LWN0cmxcIl0nKVxuICAgICAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkIH0pO1xuICAgICAgICAgIC8vIFxuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic29ydC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCBuID0+ICFuLmNhblNvcnQoKSlcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gRGlhbG9nIGZvciBjbGFzc2VzXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsZmFsc2UpO1xuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAgICAgLnRleHQobi5wY29tcC50eXBlID8gbi5wY29tcC50eXBlLm5hbWUgOiBuLnBjb21wLm5hbWUpO1xuXG4gICAgICAgICAgLy8gd2lyZSB1cCB0aGUgYnV0dG9uIHRvIHNob3cgc3VtbWFyeSBmaWVsZHNcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2hvd1N1bW1hcnlcIl0nKVxuICAgICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNlbGVjdGVkTmV4dChcInN1bW1hcnlmaWVsZHNcIikpO1xuXG4gICAgICAgICAgLy8gRmlsbCBpbiB0aGUgdGFibGUgbGlzdGluZyBhbGwgdGhlIGF0dHJpYnV0ZXMvcmVmcy9jb2xsZWN0aW9ucy5cbiAgICAgICAgICBsZXQgdGJsID0gZGlhbG9nLnNlbGVjdChcInRhYmxlLmF0dHJpYnV0ZXNcIik7XG4gICAgICAgICAgbGV0IHJvd3MgPSB0Ymwuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAgICAgLmRhdGEoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLmFsbFBhcnRzKVxuICAgICAgICAgICAgICA7XG4gICAgICAgICAgcm93cy5lbnRlcigpLmFwcGVuZChcInRyXCIpO1xuICAgICAgICAgIHJvd3MuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICAgIGxldCBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAgICAgLmRhdGEoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICAgICAgICAgICAgaWYgKGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiU2VsZWN0IHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJ3NlbGVjdHNpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwic2VsZWN0ZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJDb25zdHJhaW4gdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnY29uc3RyYWluc2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZi5zZWxlY3RlZE5leHQoXCJjb25zdHJhaW5lZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogYDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkZvbGxvdyB0aGlzICR7Y29tcC5raW5kfVwiPnBsYXlfYXJyb3c8L2k+YCxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdvcGVubmV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwib3BlblwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICBjZWxscy5lbnRlcigpLmFwcGVuZChcInRkXCIpO1xuICAgICAgICAgIGNlbGxzXG4gICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuY2xzO30pXG4gICAgICAgICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLmNsaWNrICYmIGQuY2xpY2soKTsgfSlcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgIGNlbGxzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjdXJyTm9kZSAobm9kZSkgTm9kZSB0byBleHRlbmQgZnJvbVxuICAgIC8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuICAgIC8vICAgcCAoc3RyaW5nKSBOYW1lIG9mIGFuIGF0dHJpYnV0ZSwgcmVmLCBvciBjb2xsZWN0aW9uXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIG5vdGhpbmdcbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBJZiB0aGUgc2VsZWN0ZWQgaXRlbSBpcyBub3QgYWxyZWFkeSBpbiB0aGUgZGlzcGxheSwgaXQgZW50ZXJzXG4gICAgLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4gICAgLy8gICBUaGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkIG9uIHRoZSBjaGlsZCBub2RlLlxuICAgIC8vICAgSWYgdGhlIHVzZXIgY2xpY2tlZCBvbiBhIFwib3BlbitzZWxlY3RcIiBidXR0b24sIHRoZSBjaGlsZCBpcyBzZWxlY3RlZC5cbiAgICAvLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuICAgIC8vICAgY2hpbGQsIGFuZCB0aGUgY29uc3RyYWludCBlZGl0b3Igb3BlbmVkICBvbiB0aGF0IGNvbnN0cmFpbnQuXG4gICAgLy9cbiAgICBzZWxlY3RlZE5leHQgKG1vZGUsIHApIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgbjtcbiAgICAgICAgbGV0IGNjO1xuICAgICAgICBsZXQgc2ZzO1xuICAgICAgICBsZXQgY3QgPSB0aGlzLmN1cnJOb2RlLnRlbXBsYXRlO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJzdW1tYXJ5ZmllbGRzXCIpIHtcbiAgICAgICAgICAgIHNmcyA9IHRoaXMuZWRpdG9yLmN1cnJNaW5lLnN1bW1hcnlGaWVsZHNbdGhpcy5jdXJyTm9kZS5ub2RlVHlwZS5uYW1lXXx8W107XG4gICAgICAgICAgICBzZnMuZm9yRWFjaChmdW5jdGlvbihzZiwgaSl7XG4gICAgICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBzZWxmLmN1cnJOb2RlLnBhdGgpO1xuICAgICAgICAgICAgICAgIGxldCBtID0gY3QuYWRkUGF0aChzZik7XG4gICAgICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG0uc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwID0gc2VsZi5jdXJyTm9kZS5wYXRoICsgXCIuXCIgKyBwO1xuICAgICAgICAgICAgbiA9IGN0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gXCJzZWxlY3RlZFwiKVxuICAgICAgICAgICAgICAgICFuLmlzU2VsZWN0ZWQgJiYgbi5zZWxlY3QoKTtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBcImNvbnN0cmFpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBjYyA9IG4uYWRkQ29uc3RyYWludCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vZGUgIT09IFwib3BlblwiKVxuICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgaWYgKG1vZGUgIT09IFwic3VtbWFyeWZpZWxkc1wiKSBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBzZWxmLnNob3cobik7XG4gICAgICAgICAgICAgICAgY2MgJiYgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjYywgbilcbiAgICAgICAgICAgICAgICB9LCBzZWxmLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgICAgICB9LCBzZWxmLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZSh0aGlzLmN1cnJOb2RlKTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIFxuICAgIH1cbn1cblxuZXhwb3J0IHsgRGlhbG9nIH0gO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvZGlhbG9nLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBkM2pzb25Qcm9taXNlLCBpbml0T3B0aW9uTGlzdCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0U3ViY2xhc3NlcyB9IGZyb20gJy4vbW9kZWwuanMnO1xuXG5jbGFzcyBDb25zdHJhaW50RWRpdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmFmdGVyU2F2ZSA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8vIE9wZW5zIHRoZSBjb25zdHJhaW50IGVkaXRvciBmb3IgY29uc3RyYWludCBjIG9mIG5vZGUgbi5cbiAgICAvL1xuICAgIG9wZW4oYywgbikge1xuXG4gICAgICAgIC8vIE5vdGUgaWYgdGhpcyBpcyBoYXBwZW5pbmcgYXQgdGhlIHJvb3Qgbm9kZVxuICAgICAgICBsZXQgaXNyb290ID0gISBuLnBhcmVudDtcbiAgICAgXG4gICAgICAgIC8vIEZpbmQgdGhlIGRpdiBmb3IgY29uc3RyYWludCBjIGluIHRoZSBkaWFsb2cgbGlzdGluZy4gV2Ugd2lsbFxuICAgICAgICAvLyBvcGVuIHRoZSBjb25zdHJhaW50IGVkaXRvciBvbiB0b3Agb2YgaXQuXG4gICAgICAgIGxldCBjZGl2O1xuICAgICAgICBkMy5zZWxlY3RBbGwoXCIjZGlhbG9nIC5jb25zdHJhaW50XCIpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihjYyl7IGlmKGNjID09PSBjKSBjZGl2ID0gdGhpczsgfSk7XG4gICAgICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgY29uc3RyYWludCdzIGNvbnRhaW5lciBkaXZcbiAgICAgICAgbGV0IGNiYiA9IGNkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgYXBwJ3MgbWFpbiBib2R5IGVsZW1lbnRcbiAgICAgICAgbGV0IGRiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgLy8gcG9zaXRpb24gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG92ZXIgdGhlIGNvbnN0cmFpbnQgaW4gdGhlIGRpYWxvZ1xuICAgICAgICBsZXQgY2VkID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgYy5jdHlwZSlcbiAgICAgICAgICAgIC5jbGFzc2VkKFwib3BlblwiLCB0cnVlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIGMuc3VtbWFyeUxpc3QpXG4gICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgKGNiYi50b3AgLSBkYmIudG9wKStcInB4XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChjYmIubGVmdCAtIGRiYi5sZWZ0KStcInB4XCIpXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy8gSW5pdCB0aGUgY29uc3RyYWludCBjb2RlIFxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpXG4gICAgICAgICAgICAudGV4dChjLmNvZGUpO1xuXG4gICAgICAgIHRoaXMuaW5pdElucHV0cyhuLCBjKTtcblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIFdoZW4gdXNlciBzZWxlY3RzIGFuIG9wZXJhdG9yLCBhZGQgYSBjbGFzcyB0byB0aGUgYy5lLidzIGNvbnRhaW5lclxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3AgPSBPUElOREVYW3RoaXMudmFsdWVdO1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdElucHV0cyhuLCBjLCBvcC5jdHlwZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uY2FuY2VsXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY2FuY2VsKG4sIGMpIH0pO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc2F2ZVwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLnNhdmVFZGl0cyhuLCBjKSB9KTtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnN5bmNcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5nZW5lcmF0ZU9wdGlvbkxpc3QobiwgYykudGhlbigoKSA9PiB0aGlzLmluaXRJbnB1dHMobiwgYykpIH0pO1xuXG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIGlucHV0IGVsZW1lbnRzIGluIHRoZSBjb25zdHJhaW50IGVkaXRvciBmcm9tIHRoZSBnaXZlbiBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgaW5pdElucHV0cyAobiwgYywgY3R5cGUpIHtcblxuICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgb3BlcmF0b3Igc2VsZWN0IGxpc3Qgd2l0aCBvcHMgYXBwcm9wcmlhdGUgZm9yIHRoZSBwYXRoXG4gICAgICAgIC8vIGF0IHRoaXMgbm9kZS5cbiAgICAgICAgaWYgKCFjdHlwZSkgXG4gICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJvcFwiXScsIFxuICAgICAgICAgICAgT1BTLmZpbHRlcihmdW5jdGlvbihvcCl7IHJldHVybiBuLm9wVmFsaWQob3ApOyB9KSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5vcCxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQub3AsXG4gICAgICAgICAgICBzZWxlY3RlZDpjLm9wXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgY3R5cGUgPSBjdHlwZSB8fCBjLmN0eXBlO1xuXG4gICAgICAgIGxldCBjZSA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpO1xuICAgICAgICBsZXQgc216ZCA9IGNlLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuICAgICAgICBjZS5hdHRyKFwiY2xhc3NcIiwgXCJvcGVuIFwiICsgY3R5cGUpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgIHNtemQpXG4gICAgICAgICAgICAuY2xhc3NlZChcImJpb2VudGl0eVwiLCAgbi5pc0Jpb0VudGl0eSk7XG4gICAgIFxuICAgICAgICAvL1xuICAgICAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBbXCJBbnlcIl0uY29uY2F0KG4udGVtcGxhdGUubW9kZWwubWluZS5vcmdhbmlzbUxpc3QpLFxuICAgICAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYW4gb3B0aW9uIGxpc3Qgb2Ygc3ViY2xhc3MgbmFtZXNcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgbi5wYXJlbnQgPyBnZXRTdWJjbGFzc2VzKG4ucGNvbXAua2luZCA/IG4ucGNvbXAudHlwZSA6IG4ucGNvbXApIDogW10sXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIHN1YmNsYXNzZXMpXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgb25lIHdob3NlIG5hbWUgbWF0Y2hlcyB0aGUgbm9kZSdzIHR5cGUgYW5kIHNldCBpdHMgc2VsZWN0ZWQgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGVzID0gZC5uYW1lID09PSAoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLm5hbWUgfHwgbi5wdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgbi50ZW1wbGF0ZS5tb2RlbC5taW5lLmxpc3RzLmZpbHRlcihmdW5jdGlvbiAobCkgeyByZXR1cm4gbi5saXN0VmFsaWQobCk7IH0pLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIGxpc3RzKVwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgfHwgYy52YWx1ZXMgfHwgW2MudmFsdWVdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIGxpc3RcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZXMgfHwgW2MudmFsdWVdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCB8fCBbYy52YWx1ZV0sXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIHJlc3VsdHNcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcIm51bGxcIikge1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJVbnJlY29nbml6ZWQgY3R5cGU6IFwiICsgY3R5cGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgLypcbiAgICAvL1xuICAgIHVwZGF0ZUNFaW5wdXRzIChjLCBvcCkge1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJjb2RlXCJdJykudGV4dChjLmNvZGUpO1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy5jdHlwZT09PVwibnVsbFwiID8gXCJcIiA6IGMudmFsdWU7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbiAgICB9XG4gICAgKi9cblxuXG4gICAgLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgbiAgKG5vZGUpICBUaGUgbm9kZSB3ZSdyZSB3b3JraW5nIG9uLiBNdXN0IGJlIGFuIGF0dHJpYnV0ZSBub2RlLlxuICAgIC8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbiAgICAvLyBOQjogT25seSB2YWx1ZSBhbmQgbXVsdGl2YXVlIGNvbnN0cmFpbnRzIGNhbiBiZSBzdW1tYXJpemVkIGluIHRoaXMgd2F5LiAgXG4gICAgZ2VuZXJhdGVPcHRpb25MaXN0IChuLCBjKSB7XG4gICAgICAgIC8vIFRvIGdldCB0aGUgbGlzdCwgd2UgaGF2ZSB0byBydW4gdGhlIGN1cnJlbnQgcXVlcnkgd2l0aCBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciwgXG4gICAgICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgICAgICAvLyBCVVQgTk9URSwgd2UgaGF2ZSB0byBydW4gdGhlIHF1ZXJ5ICp3aXRob3V0KiBjb25zdHJhaW50IGMhIVxuICAgICAgICAvLyBFeGFtcGxlOiBzdXBwb3NlIHdlIGhhdmUgYSBxdWVyeSB3aXRoIGEgY29uc3RyYWludCBhbGxlbGVUeXBlPVRhcmdldGVkLFxuICAgICAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgICAgICAvLyBzeW5jIGJ1dHRvbiB0byBnZXQgYSBsaXN0LiBJZiB3ZSBydW4gdGhlIHF1ZXJ5IHdpdGggYyBpbnRhY3QsIHdlJ2xsIGdldCBhIGxpc3RcbiAgICAgICAgLy8gY29udGFpbmluZyBvbmx5IFwiVGFyZ2V0ZWRcIi4gRG9oIVxuICAgICAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAgICAgLy8gaGVyZSBpcyB0byBlbnN1cmUgaXQgYnkgYWRkaW5nIHRoZSBwYXRoIHRvIHRoZSB2aWV3IGxpc3QuXG5cbiAgICAgICAgLypcbiAgICAgICAgLy8gU2F2ZSB0aGlzIGNob2ljZSBpbiBsb2NhbFN0b3JhZ2VcbiAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgIGxldCBrZXkgPSBcImF1dG9jb21wbGV0ZVwiO1xuICAgICAgICBsZXQgbHN0O1xuICAgICAgICBsc3QgPSBnZXRMb2NhbChrZXksIHRydWUsIFtdKTtcbiAgICAgICAgaWYobHN0LmluZGV4T2YoYXR0cikgPT09IC0xKSBsc3QucHVzaChhdHRyKTtcbiAgICAgICAgc2V0TG9jYWwoa2V5LCBsc3QsIHRydWUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIC8vIGJ1aWxkIHRoZSBxdWVyeVxuICAgICAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgICAgICAvL1xuICAgICAgICBsZXQgbGV4ID0gbi50ZW1wbGF0ZS5jb25zdHJhaW50TG9naWM7IC8vIHNhdmUgY29uc3RyYWludCBsb2dpYyBleHByXG4gICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTsgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIHRoZSBjb25zdHJhaW50XG4gICAgICAgIG4udGVtcGxhdGUuc2VsZWN0LnB1c2gocCk7IC8vIC8vIG1ha2Ugc3VyZSBwIGlzIHBhcnQgb2YgdGhlIHF1ZXJ5XG4gICAgICAgIC8vIGdldCB0aGUgeG1sXG4gICAgICAgIGxldCB4ID0gbi50ZW1wbGF0ZS5nZXRYbWwodHJ1ZSk7XG4gICAgICAgIC8vIHJlc3RvcmUgdGhlIHRlbXBsYXRlXG4gICAgICAgIG4udGVtcGxhdGUuc2VsZWN0LnBvcCgpO1xuICAgICAgICBuLnRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyA9IGxleDsgLy8gcmVzdG9yZSB0aGUgbG9naWMgZXhwclxuICAgICAgICBuLmFkZENvbnN0cmFpbnQoYyk7IC8vIHJlLWFkZCB0aGUgY29uc3RyYWludFxuXG4gICAgICAgIC8vIGJ1aWxkIHRoZSB1cmxcbiAgICAgICAgbGV0IGUgPSBlbmNvZGVVUklDb21wb25lbnQoeCk7XG4gICAgICAgIGxldCB1cmwgPSBgJHtuLnRlbXBsYXRlLm1vZGVsLm1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICAgICAgbGV0IHRocmVzaG9sZCA9IDI1MDtcblxuICAgICAgICAvLyBjdmFscyBjb250YWludHMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZShzKVxuICAgICAgICBsZXQgY3ZhbHMgPSBbXTtcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjdmFscyA9IGMudmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgY3ZhbHMgPSBbIGMudmFsdWUgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNpZ25hbCB0aGF0IHdlJ3JlIHN0YXJ0aW5nXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgICAgICAvLyBnbyFcbiAgICAgICAgbGV0IHByb20gPSBkM2pzb25Qcm9taXNlKHVybCkudGhlbihmdW5jdGlvbihqc29uKXtcbiAgICAgICAgICAgIC8vIFRoZSBsaXN0IG9mIHZhbHVlcyBpcyBpbiBqc29uLnJldWx0cy5cbiAgICAgICAgICAgIC8vIEVhY2ggbGlzdCBpdGVtIGxvb2tzIGxpa2U6IHsgaXRlbTogXCJzb21lc3RyaW5nXCIsIGNvdW50OiAxNyB9XG4gICAgICAgICAgICAvLyAoWWVzLCB3ZSBnZXQgY291bnRzIGZvciBmcmVlISBPdWdodCB0byBtYWtlIHVzZSBvZiB0aGlzLilcbiAgICAgICAgICAgIGxldCByZXMgPSBqc29uLnJlc3VsdHMubWFwKHIgPT4gci5pdGVtKS5zb3J0KCk7XG4gICAgICAgICAgICAvLyBjaGVjayBzaXplIG9mIHJlc3VsdFxuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAvLyB0b28gYmlnLiBhc2sgdXNlciB3aGF0IHRvIGRvLlxuICAgICAgICAgICAgICAgIGxldCBhbnMgPSBwcm9tcHQoYFRoZXJlIGFyZSAke3Jlcy5sZW5ndGh9IHJlc3VsdHMsIHdoaWNoIGV4Y2VlZHMgdGhlIHRocmVzaG9sZCBvZiAke3RocmVzaG9sZH0uIEhvdyBtYW55IGRvIHlvdSB3YW50IHRvIHNob3c/YCwgdGhyZXNob2xkKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5zID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZXIgc2V6IGNhbmNlbFxuICAgICAgICAgICAgICAgICAgICAvLyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lLlxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oYW5zKSB8fCBhbnMgPD0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vIHVzZXIgd2FudHMgdGhpcyBtYW55IHJlc3VsdHNcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBjLnN1bW1hcnlMaXN0ID0gcmVzO1xuXG4gICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHRydWUpO1xuXG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCwgXG4gICAgICAgICAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGQgPT4gY3ZhbHMuaW5kZXhPZihkKSAhPT0gLTEgfHwgbnVsbCB9KTtcblxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb207IC8vIHNvIGNhbGxlciBjYW4gY2hhaW5cbiAgICB9XG4gICAgLy9cbiAgICBjYW5jZWwgKG4sIGMpIHtcbiAgICAgICAgaWYgKCEgYy5zYXZlZCkge1xuICAgICAgICAgICAgbi5yZW1vdmVDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgdGhpcy5hZnRlclNhdmUobik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpO1xuICAgIH1cbiAgICAvL1xuICAgIHNhdmVFZGl0cyhuLCBjKSB7XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgICAgIGMuc2V0T3Aobyk7XG4gICAgICAgIGMuc2F2ZWQgPSB0cnVlO1xuICAgICAgICAvL1xuICAgICAgICBsZXQgdmFsID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWU7XG4gICAgICAgIGxldCB2YWxzID0gW107XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB2YWxzLnB1c2godGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBsZXQgeiA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3InKS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcblxuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGMudHlwZSA9IHZhbHNbMF1cbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IG4uc2V0U3ViY2xhc3NDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgaWYocmVtb3ZlZC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiQ29uc3RyYWluaW5nIHRvIHN1YmNsYXNzIFwiICsgKGMudHlwZSB8fCBuLnB0eXBlLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICsgXCIgY2F1c2VkIHRoZSBmb2xsb3dpbmcgcGF0aHMgdG8gYmUgcmVtb3ZlZDogXCIgXG4gICAgICAgICAgICAgICAgICAgICsgcmVtb3ZlZC5tYXAobiA9PiBuLnBhdGgpLmpvaW4oXCIsIFwiKSk7IFxuICAgICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHZhbDtcbiAgICAgICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgICAgIGMuZXh0cmFWYWx1ZSA9IHZhbHNbMF0gPT09IFwiQW55XCIgPyBudWxsIDogdmFsc1swXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHZhbHNbMF07XG4gICAgICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlID0geiA/IHZhbHNbMF0gOiB2YWw7XG4gICAgICAgICAgICBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIlVua25vd24gY3R5cGU6IFwiK2MuY3R5cGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMuYWZ0ZXJTYXZlICYmIHRoaXMuYWZ0ZXJTYXZlKG4pO1xuICAgIH1cblxufSAvLyBjbGFzcyBDb25zdHJhaW50RWRpdG9yXG5cbmV4cG9ydCB7IENvbnN0cmFpbnRFZGl0b3IgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnRFZGl0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=