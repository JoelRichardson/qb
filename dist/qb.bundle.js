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
              d3.select("#tInfoBar").classed("expanded", true);
              Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["i" /* selectText */])("ttextdiv");
          })
          .on("blur", function() {
              d3.select("#tInfoBar").classed("expanded", false);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTE4NzU4NWFlMDY0MDEwNmMyNjIiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3RlbXBsYXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL25vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3JlZ2lzdHJ5LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29uc3RyYWludEVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLHdCQUF3QixHO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU0sYUFBYSxRQUFRO0FBQzNDO0FBQ0EsWUFBWSxZQUFZLEdBQUcsYUFBYTtBQUN4QztBQUNBLFlBQVksdUJBQXVCLEdBQUcsd0JBQXdCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLGlCQUFpQixFQUFFO0FBQ3BGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFlQTs7Ozs7Ozs7Ozs7O0FDN1JBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVHOzs7Ozs7O0FDcE9SO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUw7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDaDdCb0I7QUFDTzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELHNCQUFzQixFQUFFO0FBQzFFLGtEQUFrRCxzQkFBc0IsRUFBRTtBQUMxRSxtREFBbUQsdUJBQXVCLEVBQUU7QUFDNUU7QUFDQSw0Q0FBNEMsdURBQXVELEVBQUU7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBLENBQUM7OztBQUdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4Qyw0QkFBNEIsRUFBRTtBQUM1RSxrRUFBa0Usd0JBQXdCLEVBQUU7QUFDNUYsMkNBQTJDLHFCQUFxQixZQUFZLEVBQUUsSUFBSTtBQUNsRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsMEJBQTBCLEVBQUU7QUFDM0UsbUVBQW1FLHdCQUF3QixFQUFFO0FBQzdGLDJDQUEyQyxxQkFBcUIsWUFBWSxFQUFFLElBQUk7QUFDbEY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxzQ0FBc0MsRUFBRTtBQUN0RjtBQUNBOzs7QUFRQTs7Ozs7Ozs7Ozs7QUN4SGtCO0FBQ0c7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyx5QkFBeUI7QUFDbkU7QUFDQSx5QkFBeUIsVUFBVSxRQUFRLHdFQUFhLFdBQVcsMkVBQWdCLFVBQVUsVUFBVSxJQUFJLEVBQUU7QUFDN0c7QUFDQSxxRkFBcUYsZ0JBQWdCO0FBQ3JHLHlCQUF5QixVQUFVLFFBQVEsd0VBQWEsV0FBVywyRUFBZ0IsSUFBSSxHQUFHLFNBQVMsVUFBVSxJQUFJLEVBQUU7QUFDbkg7QUFDQTtBQUNBLHlCQUF5QixVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsSUFBSSxFQUFFO0FBQzdFLGdEQUFnRCxrRUFBTztBQUN2RDtBQUNBO0FBQ0EseUJBQXlCLFVBQVUsVUFBVSxVQUFVLElBQUksRUFBRTtBQUM3RDtBQUNBLHlCQUF5QixVQUFVLFFBQVEsUUFBUSxVQUFVLFVBQVUsSUFBSSxFQUFFO0FBQzdFO0FBQ0Esa0NBQWtDLEVBQUUsR0FBRyxFQUFFO0FBQ3pDO0FBQ0Esa0NBQWtDLEVBQUU7QUFDcEM7QUFDQSxDQUFDOztBQUVPOzs7Ozs7Ozs7QUN4R1I7QUFBQTtBQUNBO0FBQ0E7O0FBRW1COztBQUVuQjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUitEO0FBVTlEO0FBQ29CO0FBQ0M7QUFDTjtBQUNHO0FBQ0k7QUFDSDtBQUNIO0FBQ1U7O0FBRTNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQztBQUNyQyw4QkFBOEIsVUFBVSxnQ0FBZ0M7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixRQUFROztBQUVqQztBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhOztBQUViOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsNkJBQTZCLHFCQUFxQiw2QkFBNkI7QUFDekg7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLG9DQUFvQyxvR0FBeUM7QUFDN0U7QUFDQSxvQ0FBb0MscUdBQTBDOztBQUU5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsSUFBSSxHQUFHLElBQUk7QUFDN0MsV0FBVztBQUNYO0FBQ0Esa0RBQWtELG1CQUFtQjtBQUNyRTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxlQUFlO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsMENBQTBDLG9DQUFvQyxFQUFFO0FBQ2hGLDhCQUE4QixlQUFlLEVBQUU7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQ7QUFDM0Q7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJEO0FBQzNEO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLFFBQVEsV0FBVyxhQUFhLFVBQVUsaUJBQWlCO0FBQ2pHLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qiw4QkFBOEIsRUFBRTtBQUM3RCxxQ0FBcUMscUNBQXFDLGtCQUFrQixFQUFFO0FBQzlGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLFFBQVE7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUFtQyxxQkFBcUI7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLHlDQUF5QyxFQUFFO0FBQ3BGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QyxzQkFBc0Isc0JBQXNCO0FBQ25GO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxxQkFBcUI7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHNCQUFzQjtBQUMzRDtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsNEJBQTRCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyx3QkFBd0I7O0FBRTdEO0FBQ0E7QUFDQSw2QkFBNkIsd0NBQXdDO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUNBQWlDLFNBQVMsZ0NBQWdDLEVBQUU7QUFDNUUsaUNBQWlDLFNBQVMsZ0NBQWdDLEVBQUU7QUFDNUUscUNBQXFDLG1CQUFtQixFQUFFO0FBQzFEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0EsK0JBQStCOztBQUUvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixXQUFXO0FBQ3ZDO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxlQUFlLFdBQVcsV0FBVyxFQUFFOztBQUUzRTtBQUNBO0FBQ0EsMkNBQTJDLFNBQVMsb0JBQW9CLEVBQUU7O0FBRTFFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsRUFBRTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTs7QUFFZjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyw2QkFBNkIsRUFBRTtBQUNuRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLHlEQUF5RCxFQUFFO0FBQ3JHOztBQUVBO0FBQ0EsZ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQ0FBa0MsOEJBQThCLEVBQUU7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLDZDQUE2QyxFQUFFO0FBQ3pGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0QkFBNEIsc0JBQXNCLEVBQUU7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsVUFBVTtBQUM3QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsdURBQXVELEVBQUU7QUFDbkc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLG9CQUFvQixFQUFFO0FBQzFEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsd0NBQXdDO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGtDQUFrQyxxQkFBcUI7QUFDdkQsV0FBVztBQUNYLDZDQUE2Qyw0Q0FBNEMsRUFBRTtBQUMzRixtQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0EseUNBQXlDLGtDQUFrQyxFQUFFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGtDQUFrQyxxQkFBcUI7QUFDdkQsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFFQUFxRSxvRkFBc0I7QUFDM0Y7QUFDQSx1Q0FBdUMsRUFBRTtBQUN6QyxXQUFXO0FBQ1gsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsT0FBTztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBOztBQUVROzs7Ozs7OztBQzMxQlI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLGdDQUFnQztBQUM3QyxxQkFBcUIsa0JBQWtCO0FBQ3ZDO0FBQ0E7QUFDQSxhQUFhLGdDQUFnQztBQUM3QyxxQkFBcUIsa0JBQWtCO0FBQ3ZDO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUI7QUFDakIsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRVE7Ozs7Ozs7Ozs7Ozs7O0FDbkVhO0FBQ3JCO0FBQ2U7QUFDTTs7QUFFckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IseUJBQXlCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0EsNENBQTRDLG9CQUFvQjtBQUNoRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHdCQUF3QjtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlELHdCQUF3QixxQkFBcUIsVUFBVTtBQUN4RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsMkJBQTJCLElBQUk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZCQUE2Qix3QkFBd0IsRUFBRTs7QUFFdkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3RDtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsRUFBRSxHQUFHLEVBQUU7QUFDakMsU0FBUzs7QUFFVDtBQUNBO0FBQ0Esa0NBQWtDLEdBQUc7QUFDckM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxhQUFhO0FBQzNCLGVBQWUsZ0NBQWdDO0FBQy9DLGNBQWMsbUJBQW1CO0FBQ2pDLHlCQUF5QixvRkFBeUI7QUFDbEQsbUJBQW1CLFNBQVM7QUFDNUIsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsYUFBYTtBQUMzQixlQUFlLDhFQUFtQjtBQUNsQyxpQkFBaUIsZ0ZBQXFCO0FBQ3RDLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOztBQUVPOzs7Ozs7O0FDclZSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EscUJBQXFCLDBCQUEwQjtBQUMvQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7O0FBRUEsdUJBQXVCLDhCQUE4QjtBQUNyRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QseUJBQXlCLEVBQUU7QUFDbkYsd0RBQXdELHlCQUF5QixFQUFFO0FBQ25GOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELHlCQUF5QixFQUFFO0FBQ25GLHdEQUF3RCx5QkFBeUIsRUFBRTtBQUNuRjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlCQUFpQixxQkFBcUI7QUFDdEM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLDBCQUEwQix5QkFBeUI7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsdUJBQXVCOztBQUV2QixrQ0FBa0Msa0NBQWtDO0FBQ3BFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUM7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsYUFBYSxFQUFFO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qiw2QkFBNkIsRUFBRTtBQUM3RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlDQUFpQyxxQkFBcUI7QUFDdEQ7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXlDLFFBQVE7O0FBRWpEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSwwQ0FBMEMsa0JBQWtCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQSw0Q0FBNEMsa0JBQWtCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsNENBQTRDLGtCQUFrQjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsOENBQThDLGtCQUFrQjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBLHdDQUF3QyxrQkFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLDBDQUEwQyxrQkFBa0I7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSwwQ0FBMEMsa0JBQWtCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQSw0Q0FBNEMsa0JBQWtCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0Esb0NBQW9DLG1CQUFtQjtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0EsNENBQTRDLG1CQUFtQjtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esc0NBQXNDLG1CQUFtQjtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsbUJBQW1CO0FBQ3ZEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0Esb0NBQW9DLG1CQUFtQjtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxzQ0FBc0MsbUJBQW1CO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsbUJBQW1CO0FBQ3ZEOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUcseUJBQXlCO0FBQ3ZDOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7OztBQ3JyQmlCO0FBQ0c7O0FBRXJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUN6QiwyQkFBMkI7QUFDM0IsNkJBQTZCO0FBQzdCLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQSw4QkFBOEI7QUFDOUIseUJBQXlCO0FBQ3pCOztBQUVBLHlCQUF5Qjs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQix3QkFBd0I7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELDRDQUE0QyxFQUFFO0FBQ3pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdGQUFnQyxxQ0FBcUM7QUFDckU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0VBQWdFLGlCQUFpQixFQUFFO0FBQ25GLHNFQUFzRSxpQkFBaUIsRUFBRTtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFTzs7Ozs7Ozs7OztBQzVRZ0I7O0FBRXhCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsWUFBWSxXQUFXLGdCQUFnQjtBQUN2RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQixPQUFPO0FBQ1A7O0FBRVE7Ozs7Ozs7Ozs7O0FDbEJXOztBQUVuQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxrQ0FBa0MsYUFBYTtBQUMvQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVROzs7Ozs7Ozs7OztBQzlHbUI7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBLHFCQUFxQiwwQkFBMEIscUNBQXFDLEVBQUUseUJBQXlCLEVBQUU7QUFDakg7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxXQUFXLDJDQUEyQyxVQUFVO0FBQzlHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixpREFBaUQ7O0FBRXRFLFNBQVM7QUFDVCxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRDtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOztBQUVPIiwiZmlsZSI6InFiLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGUxODc1ODVhZTA2NDAxMDZjMjYyIiwiXG4vL1xuLy8gRnVuY3Rpb24gdG8gZXNjYXBlICc8JyAnXCInIGFuZCAnJicgY2hhcmFjdGVyc1xuZnVuY3Rpb24gZXNjKHMpe1xuICAgIGlmICghcykgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpOyBcbn1cblxuLy8gUHJvbWlzaWZpZXMgYSBjYWxsIHRvIGQzLmpzb24uXG4vLyBBcmdzOlxuLy8gICB1cmwgKHN0cmluZykgVGhlIHVybCBvZiB0aGUganNvbiByZXNvdXJjZVxuLy8gUmV0dXJuczpcbi8vICAgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGpzb24gb2JqZWN0IHZhbHVlLCBvciByZWplY3RzIHdpdGggYW4gZXJyb3JcbmZ1bmN0aW9uIGQzanNvblByb21pc2UodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkMy5qc29uKHVybCwgZnVuY3Rpb24oZXJyb3IsIGpzb24pe1xuICAgICAgICAgICAgZXJyb3IgPyByZWplY3QoeyBzdGF0dXM6IGVycm9yLnN0YXR1cywgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dH0pIDogcmVzb2x2ZShqc29uKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbn1cblxuLy8gU2VsZWN0cyBhbGwgdGhlIHRleHQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci4gXG4vLyBUaGUgY29udGFpbmVyIG11c3QgaGF2ZSBhbiBpZC5cbi8vIENvcGllZCBmcm9tOlxuLy8gICBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMTY3NzQ1MS9ob3ctdG8tc2VsZWN0LWRpdi10ZXh0LW9uLWJ1dHRvbi1jbGlja1xuZnVuY3Rpb24gc2VsZWN0VGV4dChjb250YWluZXJpZCkge1xuICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgcmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KCk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZShyYW5nZSk7XG4gICAgfVxufVxuXG4vLyBDb252ZXJ0cyBhbiBJbnRlck1pbmUgcXVlcnkgaW4gUGF0aFF1ZXJ5IFhNTCBmb3JtYXQgdG8gYSBKU09OIG9iamVjdCByZXByZXNlbnRhdGlvbi5cbi8vXG5mdW5jdGlvbiBwYXJzZVBhdGhRdWVyeSh4bWwpe1xuICAgIC8vIFR1cm5zIHRoZSBxdWFzaS1saXN0IG9iamVjdCByZXR1cm5lZCBieSBzb21lIERPTSBtZXRob2RzIGludG8gYWN0dWFsIGxpc3RzLlxuICAgIGZ1bmN0aW9uIGRvbWxpc3QyYXJyYXkobHN0KSB7XG4gICAgICAgIGxldCBhID0gW107XG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGxzdC5sZW5ndGg7IGkrKykgYS5wdXNoKGxzdFtpXSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICAvLyBwYXJzZSB0aGUgWE1MXG4gICAgbGV0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZG9tID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh4bWwsIFwidGV4dC94bWxcIik7XG5cbiAgICAvLyBnZXQgdGhlIHBhcnRzLiBVc2VyIG1heSBwYXN0ZSBpbiBhIDx0ZW1wbGF0ZT4gb3IgYSA8cXVlcnk+XG4gICAgLy8gKGkuZS4sIHRlbXBsYXRlIG1heSBiZSBudWxsKVxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRlbXBsYXRlXCIpWzBdO1xuICAgIGxldCB0aXRsZSA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcInRpdGxlXCIpIHx8IFwiXCI7XG4gICAgbGV0IGNvbW1lbnQgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJjb21tZW50XCIpIHx8IFwiXCI7XG4gICAgbGV0IHF1ZXJ5ID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicXVlcnlcIilbMF07XG4gICAgbGV0IG1vZGVsID0geyBuYW1lOiBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJtb2RlbFwiKSB8fCBcImdlbm9taWNcIiB9O1xuICAgIGxldCBuYW1lID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSB8fCBcIlwiO1xuICAgIGxldCBkZXNjcmlwdGlvbiA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImxvbmdEZXNjcml0aW9uXCIpIHx8IFwiXCI7XG4gICAgbGV0IHNlbGVjdCA9IChxdWVyeS5nZXRBdHRyaWJ1dGUoXCJ2aWV3XCIpIHx8IFwiXCIpLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgIGxldCBjb25zdHJhaW50cyA9IGRvbWxpc3QyYXJyYXkoZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjb25zdHJhaW50JykpO1xuICAgIGxldCBjb25zdHJhaW50TG9naWMgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJjb25zdHJhaW50TG9naWNcIik7XG4gICAgbGV0IGpvaW5zID0gZG9tbGlzdDJhcnJheShxdWVyeS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImpvaW5cIikpO1xuICAgIGxldCBzb3J0T3JkZXIgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIikgfHwgXCJcIjtcbiAgICAvL1xuICAgIC8vXG4gICAgbGV0IHdoZXJlID0gY29uc3RyYWludHMubWFwKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgbGV0IG9wID0gYy5nZXRBdHRyaWJ1dGUoXCJvcFwiKTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO1xuICAgICAgICAgICAgICAgIG9wID0gXCJJU0FcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2YWxzID0gZG9tbGlzdDJhcnJheShjLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidmFsdWVcIikpLm1hcCggdiA9PiB2LmlubmVySFRNTCApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcDogb3AsXG4gICAgICAgICAgICAgICAgcGF0aDogYy5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogYy5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgOiB2YWxzLFxuICAgICAgICAgICAgICAgIHR5cGUgOiBjLmdldEF0dHJpYnV0ZShcInR5cGVcIiksXG4gICAgICAgICAgICAgICAgY29kZTogYy5nZXRBdHRyaWJ1dGUoXCJjb2RlXCIpLFxuICAgICAgICAgICAgICAgIGVkaXRhYmxlOiBjLmdldEF0dHJpYnV0ZShcImVkaXRhYmxlXCIpIHx8IFwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgLy8gQ2hlY2s6IGlmIHRoZXJlIGlzIG9ubHkgb25lIGNvbnN0cmFpbnQsIChhbmQgaXQncyBub3QgYW4gSVNBKSwgc29tZXRpbWVzIHRoZSBjb25zdHJhaW50TG9naWMgXG4gICAgLy8gYW5kL29yIHRoZSBjb25zdHJhaW50IGNvZGUgYXJlIG1pc3NpbmcuXG4gICAgaWYgKHdoZXJlLmxlbmd0aCA9PT0gMSAmJiB3aGVyZVswXS5vcCAhPT0gXCJJU0FcIiAmJiAhd2hlcmVbMF0uY29kZSl7XG4gICAgICAgIHdoZXJlWzBdLmNvZGUgPSBjb25zdHJhaW50TG9naWMgPSBcIkFcIjtcbiAgICB9XG5cbiAgICAvLyBvdXRlciBqb2lucy4gVGhleSBsb29rIGxpa2UgdGhpczpcbiAgICAvLyAgICAgICA8am9pbiBwYXRoPVwiR2VuZS5zZXF1ZW5jZU9udG9sb2d5VGVybVwiIHN0eWxlPVwiT1VURVJcIi8+XG4gICAgam9pbnMgPSBqb2lucy5tYXAoIGogPT4gai5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpICk7XG5cbiAgICBsZXQgb3JkZXJCeSA9IG51bGw7XG4gICAgaWYgKHNvcnRPcmRlcikge1xuICAgICAgICAvLyBUaGUganNvbiBmb3JtYXQgZm9yIG9yZGVyQnkgaXMgYSBiaXQgd2VpcmQuXG4gICAgICAgIC8vIElmIHRoZSB4bWwgb3JkZXJCeSBpczogXCJBLmIuYyBhc2MgQS5kLmUgZGVzY1wiLFxuICAgICAgICAvLyB0aGUganNvbiBzaG91bGQgYmU6IFsge1wiQS5iLmNcIjpcImFzY1wifSwge1wiQS5kLmVcIjpcImRlc2N9IF1cbiAgICAgICAgLy8gXG4gICAgICAgIC8vIFRoZSBvcmRlcmJ5IHN0cmluZyB0b2tlbnMsIGUuZy4gW1wiQS5iLmNcIiwgXCJhc2NcIiwgXCJBLmQuZVwiLCBcImRlc2NcIl1cbiAgICAgICAgbGV0IG9iID0gc29ydE9yZGVyLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2s6XG4gICAgICAgIGlmIChvYi5sZW5ndGggJSAyIClcbiAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IHBhcnNlIHRoZSBvcmRlckJ5IGNsYXVzZTogXCIgKyBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIik7XG4gICAgICAgIC8vIGNvbnZlcnQgdG9rZW5zIHRvIGpzb24gb3JkZXJCeSBcbiAgICAgICAgb3JkZXJCeSA9IG9iLnJlZHVjZShmdW5jdGlvbihhY2MsIGN1cnIsIGkpe1xuICAgICAgICAgICAgaWYgKGkgJSAyID09PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBvZGQuIGN1cnIgaXMgYSBwYXRoLiBQdXNoIGl0LlxuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGN1cnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBldmVuLiBQb3AgdGhlIHBhdGgsIGNyZWF0ZSB0aGUge30sIGFuZCBwdXNoIGl0LlxuICAgICAgICAgICAgICAgIGxldCB2ID0ge31cbiAgICAgICAgICAgICAgICBsZXQgcCA9IGFjYy5wb3AoKVxuICAgICAgICAgICAgICAgIHZbcF0gPSBjdXJyO1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBjb25zdHJhaW50TG9naWMsXG4gICAgICAgIHNlbGVjdCxcbiAgICAgICAgd2hlcmUsXG4gICAgICAgIGpvaW5zLFxuICAgICAgICBvcmRlckJ5XG4gICAgfTtcbn1cblxuLy8gUmV0dXJucyBhIGRlZXAgY29weSBvZiBvYmplY3Qgby4gXG4vLyBBcmdzOlxuLy8gICBvICAob2JqZWN0KSBNdXN0IGJlIGEgSlNPTiBvYmplY3QgKG5vIGN1cmN1bGFyIHJlZnMsIG5vIGZ1bmN0aW9ucykuXG4vLyBSZXR1cm5zOlxuLy8gICBhIGRlZXAgY29weSBvZiBvXG5mdW5jdGlvbiBkZWVwYyhvKSB7XG4gICAgaWYgKCFvKSByZXR1cm4gbztcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvKSk7XG59XG5cbi8vXG5sZXQgUFJFRklYPVwib3JnLm1naS5hcHBzLnFiXCI7XG5mdW5jdGlvbiB0ZXN0TG9jYWwoYXR0cikge1xuICAgIHJldHVybiAoUFJFRklYK1wiLlwiK2F0dHIpIGluIGxvY2FsU3RvcmFnZTtcbn1cbmZ1bmN0aW9uIHNldExvY2FsKGF0dHIsIHZhbCwgZW5jb2RlKXtcbiAgICBsb2NhbFN0b3JhZ2VbUFJFRklYK1wiLlwiK2F0dHJdID0gZW5jb2RlID8gSlNPTi5zdHJpbmdpZnkodmFsKSA6IHZhbDtcbn1cbmZ1bmN0aW9uIGdldExvY2FsKGF0dHIsIGRlY29kZSwgZGZsdCl7XG4gICAgbGV0IGtleSA9IFBSRUZJWCtcIi5cIithdHRyO1xuICAgIGlmIChrZXkgaW4gbG9jYWxTdG9yYWdlKXtcbiAgICAgICAgbGV0IHYgPSBsb2NhbFN0b3JhZ2Vba2V5XTtcbiAgICAgICAgaWYgKGRlY29kZSkgdiA9IEpTT04ucGFyc2Uodik7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRmbHQ7XG4gICAgfVxufVxuZnVuY3Rpb24gY2xlYXJMb2NhbCgpIHtcbiAgICBsZXQgcm12ID0gT2JqZWN0LmtleXMobG9jYWxTdG9yYWdlKS5maWx0ZXIoa2V5ID0+IGtleS5zdGFydHNXaXRoKFBSRUZJWCkpO1xuICAgIHJtdi5mb3JFYWNoKCBrID0+IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGspICk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gb2JqZWN0LlxuLy8gVGhlIGxpc3QgaXMgc29ydGVkIGJ5IHRoZSBpdGVtIGtleXMuXG4vLyBJZiBuYW1lQXR0ciBpcyBzcGVjaWZpZWQsIHRoZSBpdGVtIGtleSBpcyBhbHNvIGFkZGVkIHRvIGVhY2ggZWxlbWVudFxuLy8gYXMgYW4gYXR0cmlidXRlIChvbmx5IHdvcmtzIGlmIHRob3NlIGl0ZW1zIGFyZSB0aGVtc2VsdmVzIG9iamVjdHMpLlxuLy8gRXhhbXBsZXM6XG4vLyAgICBzdGF0ZXMgPSB7J01FJzp7bmFtZTonTWFpbmUnfSwgJ0lBJzp7bmFtZTonSW93YSd9fVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnfSwge25hbWU6J01haW5lJ31dXG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzLCAnYWJicmV2JykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnLGFiYnJldidJQSd9LCB7bmFtZTonTWFpbmUnLGFiYnJldidNRSd9XVxuLy8gQXJnczpcbi8vICAgIG8gIChvYmplY3QpIFRoZSBvYmplY3QuXG4vLyAgICBuYW1lQXR0ciAoc3RyaW5nKSBJZiBzcGVjaWZpZWQsIGFkZHMgdGhlIGl0ZW0ga2V5IGFzIGFuIGF0dHJpYnV0ZSB0byBlYWNoIGxpc3QgZWxlbWVudC5cbi8vIFJldHVybjpcbi8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSBvXG5mdW5jdGlvbiBvYmoyYXJyYXkobywgbmFtZUF0dHIpe1xuICAgIGxldCBrcyA9IE9iamVjdC5rZXlzKG8pO1xuICAgIGtzLnNvcnQoKTtcbiAgICByZXR1cm4ga3MubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChuYW1lQXR0cikgb1trXS5uYW1lID0gaztcbiAgICAgICAgcmV0dXJuIG9ba107XG4gICAgfSk7XG59O1xuXG4vLyBBcmdzOlxuLy8gICBzZWxlY3RvciAoc3RyaW5nKSBGb3Igc2VsZWN0aW5nIHRoZSA8c2VsZWN0PiBlbGVtZW50XG4vLyAgIGRhdGEgKGxpc3QpIERhdGEgdG8gYmluZCB0byBvcHRpb25zXG4vLyAgIGNmZyAob2JqZWN0KSBBZGRpdGlvbmFsIG9wdGlvbmFsIGNvbmZpZ3M6XG4vLyAgICAgICB0aXRsZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgZm9yIHNldHRpbmcgdGhlIHRleHQgb2YgdGhlIG9wdGlvbi4gXG4vLyAgICAgICB2YWx1ZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgc2V0dGluZyB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvblxuLy8gICAgICAgc2VsZWN0ZWQgLSBmdW5jdGlvbiBvciBhcnJheSBvciBzdHJpbmcgZm9yIGRlY2lkaW5nIHdoaWNoIG9wdGlvbihzKSBhcmUgc2VsZWN0ZWRcbi8vICAgICAgICAgIElmIGZ1bmN0aW9uLCBjYWxsZWQgZm9yIGVhY2ggb3B0aW9uLlxuLy8gICAgICAgICAgSWYgYXJyYXksIHNwZWNpZmllcyB0aGUgdmFsdWVzIHRvIHNlbGVjdC5cbi8vICAgICAgICAgIElmIHN0cmluZywgc3BlY2lmaWVzIHdoaWNoIHZhbHVlIGlzIHNlbGVjdGVkXG4vLyAgICAgICBlbXB0eU1lc3NhZ2UgLSBhIG1lc3NhZ2UgdG8gc2hvdyBpZiB0aGUgZGF0YSBsaXN0IGlzIGVtcHR5XG4vLyAgICAgICBtdWx0aXBsZSAtIGlmIHRydWUsIG1ha2UgaXQgYSBtdWx0aS1zZWxlY3QgbGlzdFxuLy9cbmZ1bmN0aW9uIGluaXRPcHRpb25MaXN0IChzZWxlY3RvciwgZGF0YSwgY2ZnKSB7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgbGV0IGlkZW50ID0gKHg9PngpO1xuICAgIGxldCBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgbGV0IHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vXG5mdW5jdGlvbiBjb3B5T2JqKHRndCwgc3JjLCBkaXIpIHtcbiAgICBkaXIgPSBkaXIgfHwgdGd0O1xuICAgIGZvciggbGV0IG4gaW4gZGlyIClcbiAgICAgICAgdGd0W25dID0gKG4gaW4gc3JjKSA/IHNyY1tuXSA6IGRpcltuXTtcbiAgICByZXR1cm4gdGd0O1xufVxuXG4vL1xuZXhwb3J0IHtcbiAgICBlc2MsXG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5LFxuICAgIG9iajJhcnJheSxcbiAgICBpbml0T3B0aW9uTGlzdCxcbiAgICBmaW5kRG9tQnlEYXRhT2JqLFxuICAgIGNvcHlPYmpcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFZhbGlkIGNvbnN0cmFpbnQgdHlwZXMgKGN0eXBlKTpcbi8vICAgbnVsbCwgbG9va3VwLCBzdWJjbGFzcywgbGlzdCwgbG9vcCwgdmFsdWUsIG11bHRpdmFsdWUsIHJhbmdlXG4vL1xuLy8gQ29uc3RyYWludHMgb24gYXR0cmlidXRlczpcbi8vIC0gdmFsdWUgKGNvbXBhcmluZyBhbiBhdHRyaWJ1dGUgdG8gYSB2YWx1ZSwgdXNpbmcgYW4gb3BlcmF0b3IpXG4vLyAgICAgID4gPj0gPCA8PSA9ICE9IExJS0UgTk9ULUxJS0UgQ09OVEFJTlMgRE9FUy1OT1QtQ09OVEFJTlxuLy8gLSBtdWx0aXZhbHVlIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIG11bHRpcGxlIHZhbHVlKVxuLy8gICAgICBPTkUtT0YgTk9ULU9ORSBPRlxuLy8gLSByYW5nZSAoc3VidHlwZSBvZiBtdWx0aXZhbHVlLCBmb3IgY29vcmRpbmF0ZSByYW5nZXMpXG4vLyAgICAgIFdJVEhJTiBPVVRTSURFIE9WRVJMQVBTIERPRVMtTk9ULU9WRVJMQVBcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vL1xuLy8gQ29uc3RyYWludHMgb24gcmVmZXJlbmNlcy9jb2xsZWN0aW9uc1xuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwgcmVmL2VtcHR5IGNvbGxlY3Rpb24pXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vIC0gbG9va3VwIChcbi8vICAgICAgTE9PS1VQXG4vLyAtIHN1YmNsYXNzXG4vLyAgICAgIElTQVxuLy8gLSBsaXN0XG4vLyAgICAgIElOIE5PVC1JTlxuLy8gLSBsb29wIChUT0RPKVxuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBhcmUgbnVtZXJpY1xubGV0IE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgY2FuIGhhdmUgbnVsbCB2YWx1ZXNcbmxldCBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGFuIGF0dHJpYnV0ZSBjYW4gaGF2ZVxubGV0IExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJvcmcuaW50ZXJtaW5lLm9iamVjdHN0b3JlLnF1ZXJ5LkNsb2JBY2Nlc3NcIixcbiAgICBcIk9iamVjdFwiXG5dXG5cblxubGV0IE9QUyA9IFtcblxuICAgIC8vIFZhbGlkIGZvciBhbnkgYXR0cmlidXRlXG4gICAgLy8gQWxzbyB0aGUgb3BlcmF0b3JzIGZvciBsb29wIGNvbnN0cmFpbnRzIChub3QgeWV0IGltcGxlbWVudGVkKS5cbiAgICB7XG4gICAgb3A6IFwiPVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9LHtcbiAgICBvcDogXCIhPVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGZvciBudW1lcmljIGFuZCBkYXRlIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiPlwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIjxcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIjw9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGZvciBzdHJpbmcgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCJDT05UQUlOU1wiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuXG4gICAgfSx7XG4gICAgb3A6IFwiRE9FUyBOT1QgQ09OVEFJTlwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIkxJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT1QgTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk9ORSBPRlwiLFxuICAgIGN0eXBlOiBcIm11bHRpdmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9ORSBPRlwiLFxuICAgIGN0eXBlOiBcIm11bHRpdmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGZvciBMb2NhdGlvbiBub2Rlc1xuICAgIHtcbiAgICBvcDogXCJXSVRISU5cIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1ZFUkxBUFNcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiRE9FUyBOT1QgT1ZFUkxBUFwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVVRTSURFXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0sXG4gXG4gICAgLy8gTlVMTCBjb25zdHJhaW50cy4gVmFsaWQgZm9yIGFueSBub2RlIGV4Y2VwdCByb290LlxuICAgIHtcbiAgICBvcDogXCJJUyBOVUxMXCIsXG4gICAgY3R5cGU6IFwibnVsbFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVMTEFCTEVUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIklTIE5PVCBOVUxMXCIsXG4gICAgY3R5cGU6IFwibnVsbFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVMTEFCTEVUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBhdCBhbnkgbm9uLWF0dHJpYnV0ZSBub2RlIChpLmUuLCB0aGUgcm9vdCwgb3IgYW55IFxuICAgIC8vIHJlZmVyZW5jZSBvciBjb2xsZWN0aW9uIG5vZGUpLlxuICAgIHtcbiAgICBvcDogXCJMT09LVVBcIixcbiAgICBjdHlwZTogXCJsb29rdXBcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBhdCBhbnkgbm9uLWF0dHJpYnV0ZSBub2RlIGV4Y2VwdCB0aGUgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVNBXCIsXG4gICAgY3R5cGU6IFwic3ViY2xhc3NcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH1dO1xuLy9cbmxldCBPUElOREVYID0gT1BTLnJlZHVjZShmdW5jdGlvbih4LG8pe1xuICAgIHhbby5vcF0gPSBvO1xuICAgIHJldHVybiB4O1xufSwge30pO1xuXG5leHBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9vcHMuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibGV0IHMgPSBgXG4zZF9yb3RhdGlvbiBlODRkXG5hY191bml0IGViM2JcbmFjY2Vzc19hbGFybSBlMTkwXG5hY2Nlc3NfYWxhcm1zIGUxOTFcbmFjY2Vzc190aW1lIGUxOTJcbmFjY2Vzc2liaWxpdHkgZTg0ZVxuYWNjZXNzaWJsZSBlOTE0XG5hY2NvdW50X2JhbGFuY2UgZTg0ZlxuYWNjb3VudF9iYWxhbmNlX3dhbGxldCBlODUwXG5hY2NvdW50X2JveCBlODUxXG5hY2NvdW50X2NpcmNsZSBlODUzXG5hZGIgZTYwZVxuYWRkIGUxNDVcbmFkZF9hX3Bob3RvIGU0MzlcbmFkZF9hbGFybSBlMTkzXG5hZGRfYWxlcnQgZTAwM1xuYWRkX2JveCBlMTQ2XG5hZGRfY2lyY2xlIGUxNDdcbmFkZF9jaXJjbGVfb3V0bGluZSBlMTQ4XG5hZGRfbG9jYXRpb24gZTU2N1xuYWRkX3Nob3BwaW5nX2NhcnQgZTg1NFxuYWRkX3RvX3Bob3RvcyBlMzlkXG5hZGRfdG9fcXVldWUgZTA1Y1xuYWRqdXN0IGUzOWVcbmFpcmxpbmVfc2VhdF9mbGF0IGU2MzBcbmFpcmxpbmVfc2VhdF9mbGF0X2FuZ2xlZCBlNjMxXG5haXJsaW5lX3NlYXRfaW5kaXZpZHVhbF9zdWl0ZSBlNjMyXG5haXJsaW5lX3NlYXRfbGVncm9vbV9leHRyYSBlNjMzXG5haXJsaW5lX3NlYXRfbGVncm9vbV9ub3JtYWwgZTYzNFxuYWlybGluZV9zZWF0X2xlZ3Jvb21fcmVkdWNlZCBlNjM1XG5haXJsaW5lX3NlYXRfcmVjbGluZV9leHRyYSBlNjM2XG5haXJsaW5lX3NlYXRfcmVjbGluZV9ub3JtYWwgZTYzN1xuYWlycGxhbmVtb2RlX2FjdGl2ZSBlMTk1XG5haXJwbGFuZW1vZGVfaW5hY3RpdmUgZTE5NFxuYWlycGxheSBlMDU1XG5haXJwb3J0X3NodXR0bGUgZWIzY1xuYWxhcm0gZTg1NVxuYWxhcm1fYWRkIGU4NTZcbmFsYXJtX29mZiBlODU3XG5hbGFybV9vbiBlODU4XG5hbGJ1bSBlMDE5XG5hbGxfaW5jbHVzaXZlIGViM2RcbmFsbF9vdXQgZTkwYlxuYW5kcm9pZCBlODU5XG5hbm5vdW5jZW1lbnQgZTg1YVxuYXBwcyBlNWMzXG5hcmNoaXZlIGUxNDlcbmFycm93X2JhY2sgZTVjNFxuYXJyb3dfZG93bndhcmQgZTVkYlxuYXJyb3dfZHJvcF9kb3duIGU1YzVcbmFycm93X2Ryb3BfZG93bl9jaXJjbGUgZTVjNlxuYXJyb3dfZHJvcF91cCBlNWM3XG5hcnJvd19mb3J3YXJkIGU1YzhcbmFycm93X3Vwd2FyZCBlNWQ4XG5hcnRfdHJhY2sgZTA2MFxuYXNwZWN0X3JhdGlvIGU4NWJcbmFzc2Vzc21lbnQgZTg1Y1xuYXNzaWdubWVudCBlODVkXG5hc3NpZ25tZW50X2luZCBlODVlXG5hc3NpZ25tZW50X2xhdGUgZTg1ZlxuYXNzaWdubWVudF9yZXR1cm4gZTg2MFxuYXNzaWdubWVudF9yZXR1cm5lZCBlODYxXG5hc3NpZ25tZW50X3R1cm5lZF9pbiBlODYyXG5hc3Npc3RhbnQgZTM5ZlxuYXNzaXN0YW50X3Bob3RvIGUzYTBcbmF0dGFjaF9maWxlIGUyMjZcbmF0dGFjaF9tb25leSBlMjI3XG5hdHRhY2htZW50IGUyYmNcbmF1ZGlvdHJhY2sgZTNhMVxuYXV0b3JlbmV3IGU4NjNcbmF2X3RpbWVyIGUwMWJcbmJhY2tzcGFjZSBlMTRhXG5iYWNrdXAgZTg2NFxuYmF0dGVyeV9hbGVydCBlMTljXG5iYXR0ZXJ5X2NoYXJnaW5nX2Z1bGwgZTFhM1xuYmF0dGVyeV9mdWxsIGUxYTRcbmJhdHRlcnlfc3RkIGUxYTVcbmJhdHRlcnlfdW5rbm93biBlMWE2XG5iZWFjaF9hY2Nlc3MgZWIzZVxuYmVlbmhlcmUgZTUyZFxuYmxvY2sgZTE0YlxuYmx1ZXRvb3RoIGUxYTdcbmJsdWV0b290aF9hdWRpbyBlNjBmXG5ibHVldG9vdGhfY29ubmVjdGVkIGUxYThcbmJsdWV0b290aF9kaXNhYmxlZCBlMWE5XG5ibHVldG9vdGhfc2VhcmNoaW5nIGUxYWFcbmJsdXJfY2lyY3VsYXIgZTNhMlxuYmx1cl9saW5lYXIgZTNhM1xuYmx1cl9vZmYgZTNhNFxuYmx1cl9vbiBlM2E1XG5ib29rIGU4NjVcbmJvb2ttYXJrIGU4NjZcbmJvb2ttYXJrX2JvcmRlciBlODY3XG5ib3JkZXJfYWxsIGUyMjhcbmJvcmRlcl9ib3R0b20gZTIyOVxuYm9yZGVyX2NsZWFyIGUyMmFcbmJvcmRlcl9jb2xvciBlMjJiXG5ib3JkZXJfaG9yaXpvbnRhbCBlMjJjXG5ib3JkZXJfaW5uZXIgZTIyZFxuYm9yZGVyX2xlZnQgZTIyZVxuYm9yZGVyX291dGVyIGUyMmZcbmJvcmRlcl9yaWdodCBlMjMwXG5ib3JkZXJfc3R5bGUgZTIzMVxuYm9yZGVyX3RvcCBlMjMyXG5ib3JkZXJfdmVydGljYWwgZTIzM1xuYnJhbmRpbmdfd2F0ZXJtYXJrIGUwNmJcbmJyaWdodG5lc3NfMSBlM2E2XG5icmlnaHRuZXNzXzIgZTNhN1xuYnJpZ2h0bmVzc18zIGUzYThcbmJyaWdodG5lc3NfNCBlM2E5XG5icmlnaHRuZXNzXzUgZTNhYVxuYnJpZ2h0bmVzc182IGUzYWJcbmJyaWdodG5lc3NfNyBlM2FjXG5icmlnaHRuZXNzX2F1dG8gZTFhYlxuYnJpZ2h0bmVzc19oaWdoIGUxYWNcbmJyaWdodG5lc3NfbG93IGUxYWRcbmJyaWdodG5lc3NfbWVkaXVtIGUxYWVcbmJyb2tlbl9pbWFnZSBlM2FkXG5icnVzaCBlM2FlXG5idWJibGVfY2hhcnQgZTZkZFxuYnVnX3JlcG9ydCBlODY4XG5idWlsZCBlODY5XG5idXJzdF9tb2RlIGU0M2NcbmJ1c2luZXNzIGUwYWZcbmJ1c2luZXNzX2NlbnRlciBlYjNmXG5jYWNoZWQgZTg2YVxuY2FrZSBlN2U5XG5jYWxsIGUwYjBcbmNhbGxfZW5kIGUwYjFcbmNhbGxfbWFkZSBlMGIyXG5jYWxsX21lcmdlIGUwYjNcbmNhbGxfbWlzc2VkIGUwYjRcbmNhbGxfbWlzc2VkX291dGdvaW5nIGUwZTRcbmNhbGxfcmVjZWl2ZWQgZTBiNVxuY2FsbF9zcGxpdCBlMGI2XG5jYWxsX3RvX2FjdGlvbiBlMDZjXG5jYW1lcmEgZTNhZlxuY2FtZXJhX2FsdCBlM2IwXG5jYW1lcmFfZW5oYW5jZSBlOGZjXG5jYW1lcmFfZnJvbnQgZTNiMVxuY2FtZXJhX3JlYXIgZTNiMlxuY2FtZXJhX3JvbGwgZTNiM1xuY2FuY2VsIGU1YzlcbmNhcmRfZ2lmdGNhcmQgZThmNlxuY2FyZF9tZW1iZXJzaGlwIGU4ZjdcbmNhcmRfdHJhdmVsIGU4ZjhcbmNhc2lubyBlYjQwXG5jYXN0IGUzMDdcbmNhc3RfY29ubmVjdGVkIGUzMDhcbmNlbnRlcl9mb2N1c19zdHJvbmcgZTNiNFxuY2VudGVyX2ZvY3VzX3dlYWsgZTNiNVxuY2hhbmdlX2hpc3RvcnkgZTg2YlxuY2hhdCBlMGI3XG5jaGF0X2J1YmJsZSBlMGNhXG5jaGF0X2J1YmJsZV9vdXRsaW5lIGUwY2JcbmNoZWNrIGU1Y2FcbmNoZWNrX2JveCBlODM0XG5jaGVja19ib3hfb3V0bGluZV9ibGFuayBlODM1XG5jaGVja19jaXJjbGUgZTg2Y1xuY2hldnJvbl9sZWZ0IGU1Y2JcbmNoZXZyb25fcmlnaHQgZTVjY1xuY2hpbGRfY2FyZSBlYjQxXG5jaGlsZF9mcmllbmRseSBlYjQyXG5jaHJvbWVfcmVhZGVyX21vZGUgZTg2ZFxuY2xhc3MgZTg2ZVxuY2xlYXIgZTE0Y1xuY2xlYXJfYWxsIGUwYjhcbmNsb3NlIGU1Y2RcbmNsb3NlZF9jYXB0aW9uIGUwMWNcbmNsb3VkIGUyYmRcbmNsb3VkX2NpcmNsZSBlMmJlXG5jbG91ZF9kb25lIGUyYmZcbmNsb3VkX2Rvd25sb2FkIGUyYzBcbmNsb3VkX29mZiBlMmMxXG5jbG91ZF9xdWV1ZSBlMmMyXG5jbG91ZF91cGxvYWQgZTJjM1xuY29kZSBlODZmXG5jb2xsZWN0aW9ucyBlM2I2XG5jb2xsZWN0aW9uc19ib29rbWFyayBlNDMxXG5jb2xvcl9sZW5zIGUzYjdcbmNvbG9yaXplIGUzYjhcbmNvbW1lbnQgZTBiOVxuY29tcGFyZSBlM2I5XG5jb21wYXJlX2Fycm93cyBlOTE1XG5jb21wdXRlciBlMzBhXG5jb25maXJtYXRpb25fbnVtYmVyIGU2MzhcbmNvbnRhY3RfbWFpbCBlMGQwXG5jb250YWN0X3Bob25lIGUwY2ZcbmNvbnRhY3RzIGUwYmFcbmNvbnRlbnRfY29weSBlMTRkXG5jb250ZW50X2N1dCBlMTRlXG5jb250ZW50X3Bhc3RlIGUxNGZcbmNvbnRyb2xfcG9pbnQgZTNiYVxuY29udHJvbF9wb2ludF9kdXBsaWNhdGUgZTNiYlxuY29weXJpZ2h0IGU5MGNcbmNyZWF0ZSBlMTUwXG5jcmVhdGVfbmV3X2ZvbGRlciBlMmNjXG5jcmVkaXRfY2FyZCBlODcwXG5jcm9wIGUzYmVcbmNyb3BfMTZfOSBlM2JjXG5jcm9wXzNfMiBlM2JkXG5jcm9wXzVfNCBlM2JmXG5jcm9wXzdfNSBlM2MwXG5jcm9wX2RpbiBlM2MxXG5jcm9wX2ZyZWUgZTNjMlxuY3JvcF9sYW5kc2NhcGUgZTNjM1xuY3JvcF9vcmlnaW5hbCBlM2M0XG5jcm9wX3BvcnRyYWl0IGUzYzVcbmNyb3Bfcm90YXRlIGU0MzdcbmNyb3Bfc3F1YXJlIGUzYzZcbmRhc2hib2FyZCBlODcxXG5kYXRhX3VzYWdlIGUxYWZcbmRhdGVfcmFuZ2UgZTkxNlxuZGVoYXplIGUzYzdcbmRlbGV0ZSBlODcyXG5kZWxldGVfZm9yZXZlciBlOTJiXG5kZWxldGVfc3dlZXAgZTE2Y1xuZGVzY3JpcHRpb24gZTg3M1xuZGVza3RvcF9tYWMgZTMwYlxuZGVza3RvcF93aW5kb3dzIGUzMGNcbmRldGFpbHMgZTNjOFxuZGV2ZWxvcGVyX2JvYXJkIGUzMGRcbmRldmVsb3Blcl9tb2RlIGUxYjBcbmRldmljZV9odWIgZTMzNVxuZGV2aWNlcyBlMWIxXG5kZXZpY2VzX290aGVyIGUzMzdcbmRpYWxlcl9zaXAgZTBiYlxuZGlhbHBhZCBlMGJjXG5kaXJlY3Rpb25zIGU1MmVcbmRpcmVjdGlvbnNfYmlrZSBlNTJmXG5kaXJlY3Rpb25zX2JvYXQgZTUzMlxuZGlyZWN0aW9uc19idXMgZTUzMFxuZGlyZWN0aW9uc19jYXIgZTUzMVxuZGlyZWN0aW9uc19yYWlsd2F5IGU1MzRcbmRpcmVjdGlvbnNfcnVuIGU1NjZcbmRpcmVjdGlvbnNfc3Vid2F5IGU1MzNcbmRpcmVjdGlvbnNfdHJhbnNpdCBlNTM1XG5kaXJlY3Rpb25zX3dhbGsgZTUzNlxuZGlzY19mdWxsIGU2MTBcbmRucyBlODc1XG5kb19ub3RfZGlzdHVyYiBlNjEyXG5kb19ub3RfZGlzdHVyYl9hbHQgZTYxMVxuZG9fbm90X2Rpc3R1cmJfb2ZmIGU2NDNcbmRvX25vdF9kaXN0dXJiX29uIGU2NDRcbmRvY2sgZTMwZVxuZG9tYWluIGU3ZWVcbmRvbmUgZTg3NlxuZG9uZV9hbGwgZTg3N1xuZG9udXRfbGFyZ2UgZTkxN1xuZG9udXRfc21hbGwgZTkxOFxuZHJhZnRzIGUxNTFcbmRyYWdfaGFuZGxlIGUyNWRcbmRyaXZlX2V0YSBlNjEzXG5kdnIgZTFiMlxuZWRpdCBlM2M5XG5lZGl0X2xvY2F0aW9uIGU1NjhcbmVqZWN0IGU4ZmJcbmVtYWlsIGUwYmVcbmVuaGFuY2VkX2VuY3J5cHRpb24gZTYzZlxuZXF1YWxpemVyIGUwMWRcbmVycm9yIGUwMDBcbmVycm9yX291dGxpbmUgZTAwMVxuZXVyb19zeW1ib2wgZTkyNlxuZXZfc3RhdGlvbiBlNTZkXG5ldmVudCBlODc4XG5ldmVudF9hdmFpbGFibGUgZTYxNFxuZXZlbnRfYnVzeSBlNjE1XG5ldmVudF9ub3RlIGU2MTZcbmV2ZW50X3NlYXQgZTkwM1xuZXhpdF90b19hcHAgZTg3OVxuZXhwYW5kX2xlc3MgZTVjZVxuZXhwYW5kX21vcmUgZTVjZlxuZXhwbGljaXQgZTAxZVxuZXhwbG9yZSBlODdhXG5leHBvc3VyZSBlM2NhXG5leHBvc3VyZV9uZWdfMSBlM2NiXG5leHBvc3VyZV9uZWdfMiBlM2NjXG5leHBvc3VyZV9wbHVzXzEgZTNjZFxuZXhwb3N1cmVfcGx1c18yIGUzY2VcbmV4cG9zdXJlX3plcm8gZTNjZlxuZXh0ZW5zaW9uIGU4N2JcbmZhY2UgZTg3Y1xuZmFzdF9mb3J3YXJkIGUwMWZcbmZhc3RfcmV3aW5kIGUwMjBcbmZhdm9yaXRlIGU4N2RcbmZhdm9yaXRlX2JvcmRlciBlODdlXG5mZWF0dXJlZF9wbGF5X2xpc3QgZTA2ZFxuZmVhdHVyZWRfdmlkZW8gZTA2ZVxuZmVlZGJhY2sgZTg3ZlxuZmliZXJfZHZyIGUwNWRcbmZpYmVyX21hbnVhbF9yZWNvcmQgZTA2MVxuZmliZXJfbmV3IGUwNWVcbmZpYmVyX3BpbiBlMDZhXG5maWJlcl9zbWFydF9yZWNvcmQgZTA2MlxuZmlsZV9kb3dubG9hZCBlMmM0XG5maWxlX3VwbG9hZCBlMmM2XG5maWx0ZXIgZTNkM1xuZmlsdGVyXzEgZTNkMFxuZmlsdGVyXzIgZTNkMVxuZmlsdGVyXzMgZTNkMlxuZmlsdGVyXzQgZTNkNFxuZmlsdGVyXzUgZTNkNVxuZmlsdGVyXzYgZTNkNlxuZmlsdGVyXzcgZTNkN1xuZmlsdGVyXzggZTNkOFxuZmlsdGVyXzkgZTNkOVxuZmlsdGVyXzlfcGx1cyBlM2RhXG5maWx0ZXJfYl9hbmRfdyBlM2RiXG5maWx0ZXJfY2VudGVyX2ZvY3VzIGUzZGNcbmZpbHRlcl9kcmFtYSBlM2RkXG5maWx0ZXJfZnJhbWVzIGUzZGVcbmZpbHRlcl9oZHIgZTNkZlxuZmlsdGVyX2xpc3QgZTE1MlxuZmlsdGVyX25vbmUgZTNlMFxuZmlsdGVyX3RpbHRfc2hpZnQgZTNlMlxuZmlsdGVyX3ZpbnRhZ2UgZTNlM1xuZmluZF9pbl9wYWdlIGU4ODBcbmZpbmRfcmVwbGFjZSBlODgxXG5maW5nZXJwcmludCBlOTBkXG5maXJzdF9wYWdlIGU1ZGNcbmZpdG5lc3NfY2VudGVyIGViNDNcbmZsYWcgZTE1M1xuZmxhcmUgZTNlNFxuZmxhc2hfYXV0byBlM2U1XG5mbGFzaF9vZmYgZTNlNlxuZmxhc2hfb24gZTNlN1xuZmxpZ2h0IGU1MzlcbmZsaWdodF9sYW5kIGU5MDRcbmZsaWdodF90YWtlb2ZmIGU5MDVcbmZsaXAgZTNlOFxuZmxpcF90b19iYWNrIGU4ODJcbmZsaXBfdG9fZnJvbnQgZTg4M1xuZm9sZGVyIGUyYzdcbmZvbGRlcl9vcGVuIGUyYzhcbmZvbGRlcl9zaGFyZWQgZTJjOVxuZm9sZGVyX3NwZWNpYWwgZTYxN1xuZm9udF9kb3dubG9hZCBlMTY3XG5mb3JtYXRfYWxpZ25fY2VudGVyIGUyMzRcbmZvcm1hdF9hbGlnbl9qdXN0aWZ5IGUyMzVcbmZvcm1hdF9hbGlnbl9sZWZ0IGUyMzZcbmZvcm1hdF9hbGlnbl9yaWdodCBlMjM3XG5mb3JtYXRfYm9sZCBlMjM4XG5mb3JtYXRfY2xlYXIgZTIzOVxuZm9ybWF0X2NvbG9yX2ZpbGwgZTIzYVxuZm9ybWF0X2NvbG9yX3Jlc2V0IGUyM2JcbmZvcm1hdF9jb2xvcl90ZXh0IGUyM2NcbmZvcm1hdF9pbmRlbnRfZGVjcmVhc2UgZTIzZFxuZm9ybWF0X2luZGVudF9pbmNyZWFzZSBlMjNlXG5mb3JtYXRfaXRhbGljIGUyM2ZcbmZvcm1hdF9saW5lX3NwYWNpbmcgZTI0MFxuZm9ybWF0X2xpc3RfYnVsbGV0ZWQgZTI0MVxuZm9ybWF0X2xpc3RfbnVtYmVyZWQgZTI0MlxuZm9ybWF0X3BhaW50IGUyNDNcbmZvcm1hdF9xdW90ZSBlMjQ0XG5mb3JtYXRfc2hhcGVzIGUyNWVcbmZvcm1hdF9zaXplIGUyNDVcbmZvcm1hdF9zdHJpa2V0aHJvdWdoIGUyNDZcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX2xfdG9fciBlMjQ3XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9yX3RvX2wgZTI0OFxuZm9ybWF0X3VuZGVybGluZWQgZTI0OVxuZm9ydW0gZTBiZlxuZm9yd2FyZCBlMTU0XG5mb3J3YXJkXzEwIGUwNTZcbmZvcndhcmRfMzAgZTA1N1xuZm9yd2FyZF81IGUwNThcbmZyZWVfYnJlYWtmYXN0IGViNDRcbmZ1bGxzY3JlZW4gZTVkMFxuZnVsbHNjcmVlbl9leGl0IGU1ZDFcbmZ1bmN0aW9ucyBlMjRhXG5nX3RyYW5zbGF0ZSBlOTI3XG5nYW1lcGFkIGUzMGZcbmdhbWVzIGUwMjFcbmdhdmVsIGU5MGVcbmdlc3R1cmUgZTE1NVxuZ2V0X2FwcCBlODg0XG5naWYgZTkwOFxuZ29sZl9jb3Vyc2UgZWI0NVxuZ3BzX2ZpeGVkIGUxYjNcbmdwc19ub3RfZml4ZWQgZTFiNFxuZ3BzX29mZiBlMWI1XG5ncmFkZSBlODg1XG5ncmFkaWVudCBlM2U5XG5ncmFpbiBlM2VhXG5ncmFwaGljX2VxIGUxYjhcbmdyaWRfb2ZmIGUzZWJcbmdyaWRfb24gZTNlY1xuZ3JvdXAgZTdlZlxuZ3JvdXBfYWRkIGU3ZjBcbmdyb3VwX3dvcmsgZTg4NlxuaGQgZTA1MlxuaGRyX29mZiBlM2VkXG5oZHJfb24gZTNlZVxuaGRyX3N0cm9uZyBlM2YxXG5oZHJfd2VhayBlM2YyXG5oZWFkc2V0IGUzMTBcbmhlYWRzZXRfbWljIGUzMTFcbmhlYWxpbmcgZTNmM1xuaGVhcmluZyBlMDIzXG5oZWxwIGU4ODdcbmhlbHBfb3V0bGluZSBlOGZkXG5oaWdoX3F1YWxpdHkgZTAyNFxuaGlnaGxpZ2h0IGUyNWZcbmhpZ2hsaWdodF9vZmYgZTg4OFxuaGlzdG9yeSBlODg5XG5ob21lIGU4OGFcbmhvdF90dWIgZWI0NlxuaG90ZWwgZTUzYVxuaG91cmdsYXNzX2VtcHR5IGU4OGJcbmhvdXJnbGFzc19mdWxsIGU4OGNcbmh0dHAgZTkwMlxuaHR0cHMgZTg4ZFxuaW1hZ2UgZTNmNFxuaW1hZ2VfYXNwZWN0X3JhdGlvIGUzZjVcbmltcG9ydF9jb250YWN0cyBlMGUwXG5pbXBvcnRfZXhwb3J0IGUwYzNcbmltcG9ydGFudF9kZXZpY2VzIGU5MTJcbmluYm94IGUxNTZcbmluZGV0ZXJtaW5hdGVfY2hlY2tfYm94IGU5MDlcbmluZm8gZTg4ZVxuaW5mb19vdXRsaW5lIGU4OGZcbmlucHV0IGU4OTBcbmluc2VydF9jaGFydCBlMjRiXG5pbnNlcnRfY29tbWVudCBlMjRjXG5pbnNlcnRfZHJpdmVfZmlsZSBlMjRkXG5pbnNlcnRfZW1vdGljb24gZTI0ZVxuaW5zZXJ0X2ludml0YXRpb24gZTI0ZlxuaW5zZXJ0X2xpbmsgZTI1MFxuaW5zZXJ0X3Bob3RvIGUyNTFcbmludmVydF9jb2xvcnMgZTg5MVxuaW52ZXJ0X2NvbG9yc19vZmYgZTBjNFxuaXNvIGUzZjZcbmtleWJvYXJkIGUzMTJcbmtleWJvYXJkX2Fycm93X2Rvd24gZTMxM1xua2V5Ym9hcmRfYXJyb3dfbGVmdCBlMzE0XG5rZXlib2FyZF9hcnJvd19yaWdodCBlMzE1XG5rZXlib2FyZF9hcnJvd191cCBlMzE2XG5rZXlib2FyZF9iYWNrc3BhY2UgZTMxN1xua2V5Ym9hcmRfY2Fwc2xvY2sgZTMxOFxua2V5Ym9hcmRfaGlkZSBlMzFhXG5rZXlib2FyZF9yZXR1cm4gZTMxYlxua2V5Ym9hcmRfdGFiIGUzMWNcbmtleWJvYXJkX3ZvaWNlIGUzMWRcbmtpdGNoZW4gZWI0N1xubGFiZWwgZTg5MlxubGFiZWxfb3V0bGluZSBlODkzXG5sYW5kc2NhcGUgZTNmN1xubGFuZ3VhZ2UgZTg5NFxubGFwdG9wIGUzMWVcbmxhcHRvcF9jaHJvbWVib29rIGUzMWZcbmxhcHRvcF9tYWMgZTMyMFxubGFwdG9wX3dpbmRvd3MgZTMyMVxubGFzdF9wYWdlIGU1ZGRcbmxhdW5jaCBlODk1XG5sYXllcnMgZTUzYlxubGF5ZXJzX2NsZWFyIGU1M2NcbmxlYWtfYWRkIGUzZjhcbmxlYWtfcmVtb3ZlIGUzZjlcbmxlbnMgZTNmYVxubGlicmFyeV9hZGQgZTAyZVxubGlicmFyeV9ib29rcyBlMDJmXG5saWJyYXJ5X211c2ljIGUwMzBcbmxpZ2h0YnVsYl9vdXRsaW5lIGU5MGZcbmxpbmVfc3R5bGUgZTkxOVxubGluZV93ZWlnaHQgZTkxYVxubGluZWFyX3NjYWxlIGUyNjBcbmxpbmsgZTE1N1xubGlua2VkX2NhbWVyYSBlNDM4XG5saXN0IGU4OTZcbmxpdmVfaGVscCBlMGM2XG5saXZlX3R2IGU2MzlcbmxvY2FsX2FjdGl2aXR5IGU1M2ZcbmxvY2FsX2FpcnBvcnQgZTUzZFxubG9jYWxfYXRtIGU1M2VcbmxvY2FsX2JhciBlNTQwXG5sb2NhbF9jYWZlIGU1NDFcbmxvY2FsX2Nhcl93YXNoIGU1NDJcbmxvY2FsX2NvbnZlbmllbmNlX3N0b3JlIGU1NDNcbmxvY2FsX2RpbmluZyBlNTU2XG5sb2NhbF9kcmluayBlNTQ0XG5sb2NhbF9mbG9yaXN0IGU1NDVcbmxvY2FsX2dhc19zdGF0aW9uIGU1NDZcbmxvY2FsX2dyb2Nlcnlfc3RvcmUgZTU0N1xubG9jYWxfaG9zcGl0YWwgZTU0OFxubG9jYWxfaG90ZWwgZTU0OVxubG9jYWxfbGF1bmRyeV9zZXJ2aWNlIGU1NGFcbmxvY2FsX2xpYnJhcnkgZTU0YlxubG9jYWxfbWFsbCBlNTRjXG5sb2NhbF9tb3ZpZXMgZTU0ZFxubG9jYWxfb2ZmZXIgZTU0ZVxubG9jYWxfcGFya2luZyBlNTRmXG5sb2NhbF9waGFybWFjeSBlNTUwXG5sb2NhbF9waG9uZSBlNTUxXG5sb2NhbF9waXp6YSBlNTUyXG5sb2NhbF9wbGF5IGU1NTNcbmxvY2FsX3Bvc3Rfb2ZmaWNlIGU1NTRcbmxvY2FsX3ByaW50c2hvcCBlNTU1XG5sb2NhbF9zZWUgZTU1N1xubG9jYWxfc2hpcHBpbmcgZTU1OFxubG9jYWxfdGF4aSBlNTU5XG5sb2NhdGlvbl9jaXR5IGU3ZjFcbmxvY2F0aW9uX2Rpc2FibGVkIGUxYjZcbmxvY2F0aW9uX29mZiBlMGM3XG5sb2NhdGlvbl9vbiBlMGM4XG5sb2NhdGlvbl9zZWFyY2hpbmcgZTFiN1xubG9jayBlODk3XG5sb2NrX29wZW4gZTg5OFxubG9ja19vdXRsaW5lIGU4OTlcbmxvb2tzIGUzZmNcbmxvb2tzXzMgZTNmYlxubG9va3NfNCBlM2ZkXG5sb29rc181IGUzZmVcbmxvb2tzXzYgZTNmZlxubG9va3Nfb25lIGU0MDBcbmxvb2tzX3R3byBlNDAxXG5sb29wIGUwMjhcbmxvdXBlIGU0MDJcbmxvd19wcmlvcml0eSBlMTZkXG5sb3lhbHR5IGU4OWFcbm1haWwgZTE1OFxubWFpbF9vdXRsaW5lIGUwZTFcbm1hcCBlNTViXG5tYXJrdW5yZWFkIGUxNTlcbm1hcmt1bnJlYWRfbWFpbGJveCBlODliXG5tZW1vcnkgZTMyMlxubWVudSBlNWQyXG5tZXJnZV90eXBlIGUyNTJcbm1lc3NhZ2UgZTBjOVxubWljIGUwMjlcbm1pY19ub25lIGUwMmFcbm1pY19vZmYgZTAyYlxubW1zIGU2MThcbm1vZGVfY29tbWVudCBlMjUzXG5tb2RlX2VkaXQgZTI1NFxubW9uZXRpemF0aW9uX29uIGUyNjNcbm1vbmV5X29mZiBlMjVjXG5tb25vY2hyb21lX3Bob3RvcyBlNDAzXG5tb29kIGU3ZjJcbm1vb2RfYmFkIGU3ZjNcbm1vcmUgZTYxOVxubW9yZV9ob3JpeiBlNWQzXG5tb3JlX3ZlcnQgZTVkNFxubW90b3JjeWNsZSBlOTFiXG5tb3VzZSBlMzIzXG5tb3ZlX3RvX2luYm94IGUxNjhcbm1vdmllIGUwMmNcbm1vdmllX2NyZWF0aW9uIGU0MDRcbm1vdmllX2ZpbHRlciBlNDNhXG5tdWx0aWxpbmVfY2hhcnQgZTZkZlxubXVzaWNfbm90ZSBlNDA1XG5tdXNpY192aWRlbyBlMDYzXG5teV9sb2NhdGlvbiBlNTVjXG5uYXR1cmUgZTQwNlxubmF0dXJlX3Blb3BsZSBlNDA3XG5uYXZpZ2F0ZV9iZWZvcmUgZTQwOFxubmF2aWdhdGVfbmV4dCBlNDA5XG5uYXZpZ2F0aW9uIGU1NWRcbm5lYXJfbWUgZTU2OVxubmV0d29ya19jZWxsIGUxYjlcbm5ldHdvcmtfY2hlY2sgZTY0MFxubmV0d29ya19sb2NrZWQgZTYxYVxubmV0d29ya193aWZpIGUxYmFcbm5ld19yZWxlYXNlcyBlMDMxXG5uZXh0X3dlZWsgZTE2YVxubmZjIGUxYmJcbm5vX2VuY3J5cHRpb24gZTY0MVxubm9fc2ltIGUwY2Ncbm5vdF9pbnRlcmVzdGVkIGUwMzNcbm5vdGUgZTA2Zlxubm90ZV9hZGQgZTg5Y1xubm90aWZpY2F0aW9ucyBlN2Y0XG5ub3RpZmljYXRpb25zX2FjdGl2ZSBlN2Y3XG5ub3RpZmljYXRpb25zX25vbmUgZTdmNVxubm90aWZpY2F0aW9uc19vZmYgZTdmNlxubm90aWZpY2F0aW9uc19wYXVzZWQgZTdmOFxub2ZmbGluZV9waW4gZTkwYVxub25kZW1hbmRfdmlkZW8gZTYzYVxub3BhY2l0eSBlOTFjXG5vcGVuX2luX2Jyb3dzZXIgZTg5ZFxub3Blbl9pbl9uZXcgZTg5ZVxub3Blbl93aXRoIGU4OWZcbnBhZ2VzIGU3ZjlcbnBhZ2V2aWV3IGU4YTBcbnBhbGV0dGUgZTQwYVxucGFuX3Rvb2wgZTkyNVxucGFub3JhbWEgZTQwYlxucGFub3JhbWFfZmlzaF9leWUgZTQwY1xucGFub3JhbWFfaG9yaXpvbnRhbCBlNDBkXG5wYW5vcmFtYV92ZXJ0aWNhbCBlNDBlXG5wYW5vcmFtYV93aWRlX2FuZ2xlIGU0MGZcbnBhcnR5X21vZGUgZTdmYVxucGF1c2UgZTAzNFxucGF1c2VfY2lyY2xlX2ZpbGxlZCBlMDM1XG5wYXVzZV9jaXJjbGVfb3V0bGluZSBlMDM2XG5wYXltZW50IGU4YTFcbnBlb3BsZSBlN2ZiXG5wZW9wbGVfb3V0bGluZSBlN2ZjXG5wZXJtX2NhbWVyYV9taWMgZThhMlxucGVybV9jb250YWN0X2NhbGVuZGFyIGU4YTNcbnBlcm1fZGF0YV9zZXR0aW5nIGU4YTRcbnBlcm1fZGV2aWNlX2luZm9ybWF0aW9uIGU4YTVcbnBlcm1faWRlbnRpdHkgZThhNlxucGVybV9tZWRpYSBlOGE3XG5wZXJtX3Bob25lX21zZyBlOGE4XG5wZXJtX3NjYW5fd2lmaSBlOGE5XG5wZXJzb24gZTdmZFxucGVyc29uX2FkZCBlN2ZlXG5wZXJzb25fb3V0bGluZSBlN2ZmXG5wZXJzb25fcGluIGU1NWFcbnBlcnNvbl9waW5fY2lyY2xlIGU1NmFcbnBlcnNvbmFsX3ZpZGVvIGU2M2JcbnBldHMgZTkxZFxucGhvbmUgZTBjZFxucGhvbmVfYW5kcm9pZCBlMzI0XG5waG9uZV9ibHVldG9vdGhfc3BlYWtlciBlNjFiXG5waG9uZV9mb3J3YXJkZWQgZTYxY1xucGhvbmVfaW5fdGFsayBlNjFkXG5waG9uZV9pcGhvbmUgZTMyNVxucGhvbmVfbG9ja2VkIGU2MWVcbnBob25lX21pc3NlZCBlNjFmXG5waG9uZV9wYXVzZWQgZTYyMFxucGhvbmVsaW5rIGUzMjZcbnBob25lbGlua19lcmFzZSBlMGRiXG5waG9uZWxpbmtfbG9jayBlMGRjXG5waG9uZWxpbmtfb2ZmIGUzMjdcbnBob25lbGlua19yaW5nIGUwZGRcbnBob25lbGlua19zZXR1cCBlMGRlXG5waG90byBlNDEwXG5waG90b19hbGJ1bSBlNDExXG5waG90b19jYW1lcmEgZTQxMlxucGhvdG9fZmlsdGVyIGU0M2JcbnBob3RvX2xpYnJhcnkgZTQxM1xucGhvdG9fc2l6ZV9zZWxlY3RfYWN0dWFsIGU0MzJcbnBob3RvX3NpemVfc2VsZWN0X2xhcmdlIGU0MzNcbnBob3RvX3NpemVfc2VsZWN0X3NtYWxsIGU0MzRcbnBpY3R1cmVfYXNfcGRmIGU0MTVcbnBpY3R1cmVfaW5fcGljdHVyZSBlOGFhXG5waWN0dXJlX2luX3BpY3R1cmVfYWx0IGU5MTFcbnBpZV9jaGFydCBlNmM0XG5waWVfY2hhcnRfb3V0bGluZWQgZTZjNVxucGluX2Ryb3AgZTU1ZVxucGxhY2UgZTU1ZlxucGxheV9hcnJvdyBlMDM3XG5wbGF5X2NpcmNsZV9maWxsZWQgZTAzOFxucGxheV9jaXJjbGVfb3V0bGluZSBlMDM5XG5wbGF5X2Zvcl93b3JrIGU5MDZcbnBsYXlsaXN0X2FkZCBlMDNiXG5wbGF5bGlzdF9hZGRfY2hlY2sgZTA2NVxucGxheWxpc3RfcGxheSBlMDVmXG5wbHVzX29uZSBlODAwXG5wb2xsIGU4MDFcbnBvbHltZXIgZThhYlxucG9vbCBlYjQ4XG5wb3J0YWJsZV93aWZpX29mZiBlMGNlXG5wb3J0cmFpdCBlNDE2XG5wb3dlciBlNjNjXG5wb3dlcl9pbnB1dCBlMzM2XG5wb3dlcl9zZXR0aW5nc19uZXcgZThhY1xucHJlZ25hbnRfd29tYW4gZTkxZVxucHJlc2VudF90b19hbGwgZTBkZlxucHJpbnQgZThhZFxucHJpb3JpdHlfaGlnaCBlNjQ1XG5wdWJsaWMgZTgwYlxucHVibGlzaCBlMjU1XG5xdWVyeV9idWlsZGVyIGU4YWVcbnF1ZXN0aW9uX2Fuc3dlciBlOGFmXG5xdWV1ZSBlMDNjXG5xdWV1ZV9tdXNpYyBlMDNkXG5xdWV1ZV9wbGF5X25leHQgZTA2NlxucmFkaW8gZTAzZVxucmFkaW9fYnV0dG9uX2NoZWNrZWQgZTgzN1xucmFkaW9fYnV0dG9uX3VuY2hlY2tlZCBlODM2XG5yYXRlX3JldmlldyBlNTYwXG5yZWNlaXB0IGU4YjBcbnJlY2VudF9hY3RvcnMgZTAzZlxucmVjb3JkX3ZvaWNlX292ZXIgZTkxZlxucmVkZWVtIGU4YjFcbnJlZG8gZTE1YVxucmVmcmVzaCBlNWQ1XG5yZW1vdmUgZTE1YlxucmVtb3ZlX2NpcmNsZSBlMTVjXG5yZW1vdmVfY2lyY2xlX291dGxpbmUgZTE1ZFxucmVtb3ZlX2Zyb21fcXVldWUgZTA2N1xucmVtb3ZlX3JlZF9leWUgZTQxN1xucmVtb3ZlX3Nob3BwaW5nX2NhcnQgZTkyOFxucmVvcmRlciBlOGZlXG5yZXBlYXQgZTA0MFxucmVwZWF0X29uZSBlMDQxXG5yZXBsYXkgZTA0MlxucmVwbGF5XzEwIGUwNTlcbnJlcGxheV8zMCBlMDVhXG5yZXBsYXlfNSBlMDViXG5yZXBseSBlMTVlXG5yZXBseV9hbGwgZTE1ZlxucmVwb3J0IGUxNjBcbnJlcG9ydF9wcm9ibGVtIGU4YjJcbnJlc3RhdXJhbnQgZTU2Y1xucmVzdGF1cmFudF9tZW51IGU1NjFcbnJlc3RvcmUgZThiM1xucmVzdG9yZV9wYWdlIGU5MjlcbnJpbmdfdm9sdW1lIGUwZDFcbnJvb20gZThiNFxucm9vbV9zZXJ2aWNlIGViNDlcbnJvdGF0ZV85MF9kZWdyZWVzX2NjdyBlNDE4XG5yb3RhdGVfbGVmdCBlNDE5XG5yb3RhdGVfcmlnaHQgZTQxYVxucm91bmRlZF9jb3JuZXIgZTkyMFxucm91dGVyIGUzMjhcbnJvd2luZyBlOTIxXG5yc3NfZmVlZCBlMGU1XG5ydl9ob29rdXAgZTY0Mlxuc2F0ZWxsaXRlIGU1NjJcbnNhdmUgZTE2MVxuc2Nhbm5lciBlMzI5XG5zY2hlZHVsZSBlOGI1XG5zY2hvb2wgZTgwY1xuc2NyZWVuX2xvY2tfbGFuZHNjYXBlIGUxYmVcbnNjcmVlbl9sb2NrX3BvcnRyYWl0IGUxYmZcbnNjcmVlbl9sb2NrX3JvdGF0aW9uIGUxYzBcbnNjcmVlbl9yb3RhdGlvbiBlMWMxXG5zY3JlZW5fc2hhcmUgZTBlMlxuc2RfY2FyZCBlNjIzXG5zZF9zdG9yYWdlIGUxYzJcbnNlYXJjaCBlOGI2XG5zZWN1cml0eSBlMzJhXG5zZWxlY3RfYWxsIGUxNjJcbnNlbmQgZTE2M1xuc2VudGltZW50X2Rpc3NhdGlzZmllZCBlODExXG5zZW50aW1lbnRfbmV1dHJhbCBlODEyXG5zZW50aW1lbnRfc2F0aXNmaWVkIGU4MTNcbnNlbnRpbWVudF92ZXJ5X2Rpc3NhdGlzZmllZCBlODE0XG5zZW50aW1lbnRfdmVyeV9zYXRpc2ZpZWQgZTgxNVxuc2V0dGluZ3MgZThiOFxuc2V0dGluZ3NfYXBwbGljYXRpb25zIGU4YjlcbnNldHRpbmdzX2JhY2t1cF9yZXN0b3JlIGU4YmFcbnNldHRpbmdzX2JsdWV0b290aCBlOGJiXG5zZXR0aW5nc19icmlnaHRuZXNzIGU4YmRcbnNldHRpbmdzX2NlbGwgZThiY1xuc2V0dGluZ3NfZXRoZXJuZXQgZThiZVxuc2V0dGluZ3NfaW5wdXRfYW50ZW5uYSBlOGJmXG5zZXR0aW5nc19pbnB1dF9jb21wb25lbnQgZThjMFxuc2V0dGluZ3NfaW5wdXRfY29tcG9zaXRlIGU4YzFcbnNldHRpbmdzX2lucHV0X2hkbWkgZThjMlxuc2V0dGluZ3NfaW5wdXRfc3ZpZGVvIGU4YzNcbnNldHRpbmdzX292ZXJzY2FuIGU4YzRcbnNldHRpbmdzX3Bob25lIGU4YzVcbnNldHRpbmdzX3Bvd2VyIGU4YzZcbnNldHRpbmdzX3JlbW90ZSBlOGM3XG5zZXR0aW5nc19zeXN0ZW1fZGF5ZHJlYW0gZTFjM1xuc2V0dGluZ3Nfdm9pY2UgZThjOFxuc2hhcmUgZTgwZFxuc2hvcCBlOGM5XG5zaG9wX3R3byBlOGNhXG5zaG9wcGluZ19iYXNrZXQgZThjYlxuc2hvcHBpbmdfY2FydCBlOGNjXG5zaG9ydF90ZXh0IGUyNjFcbnNob3dfY2hhcnQgZTZlMVxuc2h1ZmZsZSBlMDQzXG5zaWduYWxfY2VsbHVsYXJfNF9iYXIgZTFjOFxuc2lnbmFsX2NlbGx1bGFyX2Nvbm5lY3RlZF9ub19pbnRlcm5ldF80X2JhciBlMWNkXG5zaWduYWxfY2VsbHVsYXJfbm9fc2ltIGUxY2VcbnNpZ25hbF9jZWxsdWxhcl9udWxsIGUxY2ZcbnNpZ25hbF9jZWxsdWxhcl9vZmYgZTFkMFxuc2lnbmFsX3dpZmlfNF9iYXIgZTFkOFxuc2lnbmFsX3dpZmlfNF9iYXJfbG9jayBlMWQ5XG5zaWduYWxfd2lmaV9vZmYgZTFkYVxuc2ltX2NhcmQgZTMyYlxuc2ltX2NhcmRfYWxlcnQgZTYyNFxuc2tpcF9uZXh0IGUwNDRcbnNraXBfcHJldmlvdXMgZTA0NVxuc2xpZGVzaG93IGU0MWJcbnNsb3dfbW90aW9uX3ZpZGVvIGUwNjhcbnNtYXJ0cGhvbmUgZTMyY1xuc21va2VfZnJlZSBlYjRhXG5zbW9raW5nX3Jvb21zIGViNGJcbnNtcyBlNjI1XG5zbXNfZmFpbGVkIGU2MjZcbnNub296ZSBlMDQ2XG5zb3J0IGUxNjRcbnNvcnRfYnlfYWxwaGEgZTA1M1xuc3BhIGViNGNcbnNwYWNlX2JhciBlMjU2XG5zcGVha2VyIGUzMmRcbnNwZWFrZXJfZ3JvdXAgZTMyZVxuc3BlYWtlcl9ub3RlcyBlOGNkXG5zcGVha2VyX25vdGVzX29mZiBlOTJhXG5zcGVha2VyX3Bob25lIGUwZDJcbnNwZWxsY2hlY2sgZThjZVxuc3RhciBlODM4XG5zdGFyX2JvcmRlciBlODNhXG5zdGFyX2hhbGYgZTgzOVxuc3RhcnMgZThkMFxuc3RheV9jdXJyZW50X2xhbmRzY2FwZSBlMGQzXG5zdGF5X2N1cnJlbnRfcG9ydHJhaXQgZTBkNFxuc3RheV9wcmltYXJ5X2xhbmRzY2FwZSBlMGQ1XG5zdGF5X3ByaW1hcnlfcG9ydHJhaXQgZTBkNlxuc3RvcCBlMDQ3XG5zdG9wX3NjcmVlbl9zaGFyZSBlMGUzXG5zdG9yYWdlIGUxZGJcbnN0b3JlIGU4ZDFcbnN0b3JlX21hbGxfZGlyZWN0b3J5IGU1NjNcbnN0cmFpZ2h0ZW4gZTQxY1xuc3RyZWV0dmlldyBlNTZlXG5zdHJpa2V0aHJvdWdoX3MgZTI1N1xuc3R5bGUgZTQxZFxuc3ViZGlyZWN0b3J5X2Fycm93X2xlZnQgZTVkOVxuc3ViZGlyZWN0b3J5X2Fycm93X3JpZ2h0IGU1ZGFcbnN1YmplY3QgZThkMlxuc3Vic2NyaXB0aW9ucyBlMDY0XG5zdWJ0aXRsZXMgZTA0OFxuc3Vid2F5IGU1NmZcbnN1cGVydmlzb3JfYWNjb3VudCBlOGQzXG5zdXJyb3VuZF9zb3VuZCBlMDQ5XG5zd2FwX2NhbGxzIGUwZDdcbnN3YXBfaG9yaXogZThkNFxuc3dhcF92ZXJ0IGU4ZDVcbnN3YXBfdmVydGljYWxfY2lyY2xlIGU4ZDZcbnN3aXRjaF9jYW1lcmEgZTQxZVxuc3dpdGNoX3ZpZGVvIGU0MWZcbnN5bmMgZTYyN1xuc3luY19kaXNhYmxlZCBlNjI4XG5zeW5jX3Byb2JsZW0gZTYyOVxuc3lzdGVtX3VwZGF0ZSBlNjJhXG5zeXN0ZW1fdXBkYXRlX2FsdCBlOGQ3XG50YWIgZThkOFxudGFiX3Vuc2VsZWN0ZWQgZThkOVxudGFibGV0IGUzMmZcbnRhYmxldF9hbmRyb2lkIGUzMzBcbnRhYmxldF9tYWMgZTMzMVxudGFnX2ZhY2VzIGU0MjBcbnRhcF9hbmRfcGxheSBlNjJiXG50ZXJyYWluIGU1NjRcbnRleHRfZmllbGRzIGUyNjJcbnRleHRfZm9ybWF0IGUxNjVcbnRleHRzbXMgZTBkOFxudGV4dHVyZSBlNDIxXG50aGVhdGVycyBlOGRhXG50aHVtYl9kb3duIGU4ZGJcbnRodW1iX3VwIGU4ZGNcbnRodW1ic191cF9kb3duIGU4ZGRcbnRpbWVfdG9fbGVhdmUgZTYyY1xudGltZWxhcHNlIGU0MjJcbnRpbWVsaW5lIGU5MjJcbnRpbWVyIGU0MjVcbnRpbWVyXzEwIGU0MjNcbnRpbWVyXzMgZTQyNFxudGltZXJfb2ZmIGU0MjZcbnRpdGxlIGUyNjRcbnRvYyBlOGRlXG50b2RheSBlOGRmXG50b2xsIGU4ZTBcbnRvbmFsaXR5IGU0MjdcbnRvdWNoX2FwcCBlOTEzXG50b3lzIGUzMzJcbnRyYWNrX2NoYW5nZXMgZThlMVxudHJhZmZpYyBlNTY1XG50cmFpbiBlNTcwXG50cmFtIGU1NzFcbnRyYW5zZmVyX3dpdGhpbl9hX3N0YXRpb24gZTU3MlxudHJhbnNmb3JtIGU0MjhcbnRyYW5zbGF0ZSBlOGUyXG50cmVuZGluZ19kb3duIGU4ZTNcbnRyZW5kaW5nX2ZsYXQgZThlNFxudHJlbmRpbmdfdXAgZThlNVxudHVuZSBlNDI5XG50dXJuZWRfaW4gZThlNlxudHVybmVkX2luX25vdCBlOGU3XG50diBlMzMzXG51bmFyY2hpdmUgZTE2OVxudW5kbyBlMTY2XG51bmZvbGRfbGVzcyBlNWQ2XG51bmZvbGRfbW9yZSBlNWQ3XG51cGRhdGUgZTkyM1xudXNiIGUxZTBcbnZlcmlmaWVkX3VzZXIgZThlOFxudmVydGljYWxfYWxpZ25fYm90dG9tIGUyNThcbnZlcnRpY2FsX2FsaWduX2NlbnRlciBlMjU5XG52ZXJ0aWNhbF9hbGlnbl90b3AgZTI1YVxudmlicmF0aW9uIGU2MmRcbnZpZGVvX2NhbGwgZTA3MFxudmlkZW9fbGFiZWwgZTA3MVxudmlkZW9fbGlicmFyeSBlMDRhXG52aWRlb2NhbSBlMDRiXG52aWRlb2NhbV9vZmYgZTA0Y1xudmlkZW9nYW1lX2Fzc2V0IGUzMzhcbnZpZXdfYWdlbmRhIGU4ZTlcbnZpZXdfYXJyYXkgZThlYVxudmlld19jYXJvdXNlbCBlOGViXG52aWV3X2NvbHVtbiBlOGVjXG52aWV3X2NvbWZ5IGU0MmFcbnZpZXdfY29tcGFjdCBlNDJiXG52aWV3X2RheSBlOGVkXG52aWV3X2hlYWRsaW5lIGU4ZWVcbnZpZXdfbGlzdCBlOGVmXG52aWV3X21vZHVsZSBlOGYwXG52aWV3X3F1aWx0IGU4ZjFcbnZpZXdfc3RyZWFtIGU4ZjJcbnZpZXdfd2VlayBlOGYzXG52aWduZXR0ZSBlNDM1XG52aXNpYmlsaXR5IGU4ZjRcbnZpc2liaWxpdHlfb2ZmIGU4ZjVcbnZvaWNlX2NoYXQgZTYyZVxudm9pY2VtYWlsIGUwZDlcbnZvbHVtZV9kb3duIGUwNGRcbnZvbHVtZV9tdXRlIGUwNGVcbnZvbHVtZV9vZmYgZTA0Zlxudm9sdW1lX3VwIGUwNTBcbnZwbl9rZXkgZTBkYVxudnBuX2xvY2sgZTYyZlxud2FsbHBhcGVyIGUxYmNcbndhcm5pbmcgZTAwMlxud2F0Y2ggZTMzNFxud2F0Y2hfbGF0ZXIgZTkyNFxud2JfYXV0byBlNDJjXG53Yl9jbG91ZHkgZTQyZFxud2JfaW5jYW5kZXNjZW50IGU0MmVcbndiX2lyaWRlc2NlbnQgZTQzNlxud2Jfc3VubnkgZTQzMFxud2MgZTYzZFxud2ViIGUwNTFcbndlYl9hc3NldCBlMDY5XG53ZWVrZW5kIGUxNmJcbndoYXRzaG90IGU4MGVcbndpZGdldHMgZTFiZFxud2lmaSBlNjNlXG53aWZpX2xvY2sgZTFlMVxud2lmaV90ZXRoZXJpbmcgZTFlMlxud29yayBlOGY5XG53cmFwX3RleHQgZTI1YlxueW91dHViZV9zZWFyY2hlZF9mb3IgZThmYVxuem9vbV9pbiBlOGZmXG56b29tX291dCBlOTAwXG56b29tX291dF9tYXAgZTU2YlxuYDtcblxubGV0IGNvZGVwb2ludHMgPSBzLnRyaW0oKS5zcGxpdChcIlxcblwiKS5yZWR1Y2UoZnVuY3Rpb24oY3YsIG52KXtcbiAgICBsZXQgcGFydHMgPSBudi5zcGxpdCgvICsvKTtcbiAgICBsZXQgdWMgPSAnXFxcXHUnICsgcGFydHNbMV07XG4gICAgY3ZbcGFydHNbMF1dID0gZXZhbCgnXCInICsgdWMgKyAnXCInKTtcbiAgICByZXR1cm4gY3Y7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvZGVwb2ludHNcbn1cblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgTEVBRlRZUEVTIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgZGVlcGMsIG9iajJhcnJheSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLyBBIE1vZGVsIHJlcHJlc2VudHMgdGhlIGRhdGEgbW9kZWwgb2YgYSBtaW5lLiBJdCBpcyBhIGNsYXNzLWlmaWVkIGFuZCBleHBhbmRlZFxuLy8gdmVyc2lvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmUgcmV0dXJuZWQgYnkgdGhlIC9tb2RlbCBzZXJ2aWNlIGNhbGwuXG4vL1xuY2xhc3MgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yIChjZmcsIG1pbmUpIHtcbiAgICAgICAgbGV0IG1vZGVsID0gdGhpcztcbiAgICAgICAgdGhpcy5taW5lID0gbWluZTtcbiAgICAgICAgdGhpcy5wYWNrYWdlID0gY2ZnLnBhY2thZ2U7XG4gICAgICAgIHRoaXMubmFtZSA9IGNmZy5uYW1lO1xuICAgICAgICB0aGlzLmNsYXNzZXMgPSBkZWVwYyhjZmcuY2xhc3Nlcyk7XG5cbiAgICAgICAgLy8gRmlyc3QgYWRkIGNsYXNzZXMgdGhhdCByZXByZXNlbnQgdGhlIGJhc2ljIHR5cGVcbiAgICAgICAgTEVBRlRZUEVTLmZvckVhY2goIG4gPT4ge1xuICAgICAgICAgICAgdGhpcy5jbGFzc2VzW25dID0ge1xuICAgICAgICAgICAgICAgIGlzTGVhZlR5cGU6IHRydWUsICAgLy8gZGlzdGluZ3Vpc2hlcyB0aGVzZSBmcm9tIG1vZGVsIGNsYXNzZXNcbiAgICAgICAgICAgICAgICBuYW1lOiBuLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBuLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZXM6IFtdLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hbGxDbGFzc2VzID0gb2JqMmFycmF5KHRoaXMuY2xhc3NlcylcbiAgICAgICAgbGV0IGNucyA9IE9iamVjdC5rZXlzKHRoaXMuY2xhc3Nlcyk7XG4gICAgICAgIGNucy5zb3J0KClcbiAgICAgICAgY25zLmZvckVhY2goZnVuY3Rpb24oY24peyAvLyBmb3IgZWFjaCBjbGFzcyBuYW1lXG4gICAgICAgICAgICBsZXQgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhcnJheXMgZm9yIGNvbnZlbmllbnQgYWNjZXNzXG4gICAgICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAgICAgLy8gQ29udmVydCBleHRlbmRzIGZyb20gYSBsaXN0IG9mIG5hbWVzIHRvIGEgbGlzdCBvZiBjbGFzcyBvYmplY3RzLlxuICAgICAgICAgICAgLy8gQWxzbyBhZGQgdGhlIGludmVyc2UgbGlzdCwgZXh0ZW5kZWRCeS5cbiAgICAgICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICBsZXQgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgICAgIGlmICghYmMpIHRocm93IFwiTm8gY2xhc3MgbmFtZWQ6IFwiICsgZTtcbiAgICAgICAgICAgICAgICBpZiAoYmMuZXh0ZW5kZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5LnB1c2goY2xzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkgPSBbY2xzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJjO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBdHRyaWJ1dGVzOiBzdG9yZSBjbGFzcyBvYmogb2YgcmVmZXJlbmNlZFR5cGVcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNscy5hdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGFuKXtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGNscy5hdHRyaWJ1dGVzW2FuXTtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IG1vZGVsLmNsYXNzZXNbYS50eXBlXTtcbiAgICAgICAgICAgICAgICBpZiAoIXQpIHRocm93IFwiTm8gY2xhc3MgbmFtZWQ6IFwiICsgYS50eXBlO1xuICAgICAgICAgICAgICAgIGEudHlwZSA9IHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXM6IHN0b3JlIGNsYXNzIG9iaiBvZiByZWZlcmVuY2VkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLnJlZmVyZW5jZXMpLmZvckVhY2goZnVuY3Rpb24ocm4pe1xuICAgICAgICAgICAgICAgIGxldCByID0gY2xzLnJlZmVyZW5jZXNbcm5dO1xuICAgICAgICAgICAgICAgIHIudHlwZSA9IG1vZGVsLmNsYXNzZXNbci5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ29sbGVjdGlvbnM6IHN0b3JlIGNsYXNzIG9iaiBvZiByZWZlcmVuY2VkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE1vZGVsXG5cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdXBlcmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFxuLy8gVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1cGVyY2xhc3NlcyhjbHMpe1xuICAgIGlmIChjbHMuaXNMZWFmVHlwZSB8fCAhY2xzW1wiZXh0ZW5kc1wiXSB8fCBjbHNbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgbGV0IGFuYyA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1cGVyY2xhc3NlcyhzYyk7IH0pO1xuICAgIGxldCBhbGwgPSBjbHNbXCJleHRlbmRzXCJdLmNvbmNhdChhbmMucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICBsZXQgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdWJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3ViY2xhc3NlcyhjbHMpe1xuICAgIGlmIChjbHMuaXNMZWFmVHlwZSB8fCAhY2xzLmV4dGVuZGVkQnkgfHwgY2xzLmV4dGVuZGVkQnkubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICBsZXQgZGVzYyA9IGNscy5leHRlbmRlZEJ5Lm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdWJjbGFzc2VzKHNjKTsgfSk7XG4gICAgbGV0IGFsbCA9IGNscy5leHRlbmRlZEJ5LmNvbmNhdChkZXNjLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgbGV0IGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgc3ViIGlzIGEgc3ViY2xhc3Mgb2Ygc3VwLlxuZnVuY3Rpb24gaXNTdWJjbGFzcyhzdWIsc3VwKSB7XG4gICAgaWYgKHN1YiA9PT0gc3VwKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoc3ViLmlzTGVhZlR5cGUgfHwgIXN1YltcImV4dGVuZHNcIl0gfHwgc3ViW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIGxldCByID0gc3ViW1wiZXh0ZW5kc1wiXS5maWx0ZXIoZnVuY3Rpb24oeCl7IHJldHVybiB4PT09c3VwIHx8IGlzU3ViY2xhc3MoeCwgc3VwKTsgfSk7XG4gICAgcmV0dXJuIHIubGVuZ3RoID4gMDtcbn1cblxuXG5leHBvcnQge1xuICAgIE1vZGVsLFxuICAgIGdldFN1YmNsYXNzZXMsXG4gICAgZ2V0U3VwZXJjbGFzc2VzLFxuICAgIGlzU3ViY2xhc3Ncbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21vZGVsLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBlc2MsIGRlZXBjIH0gZnJvbSAnLi91dGlscy5qcyc7XG5jbGFzcyBDb25zdHJhaW50IHtcbiAgICBjb25zdHJ1Y3RvciAoYykge1xuICAgICAgICBjID0gYyB8fCB7fVxuICAgICAgICAvLyBzYXZlIHRoZSAgbm9kZVxuICAgICAgICB0aGlzLm5vZGUgPSBjLm5vZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gYWxsIGNvbnN0cmFpbnRzIGhhdmUgdGhpc1xuICAgICAgICB0aGlzLnBhdGggPSBjLnBhdGggfHwgYy5ub2RlICYmIGMubm9kZS5wYXRoIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgYWxsIGV4Y2VwdCBzdWJjbGFzcyBjb25zdHJhaW50cyAod2Ugc2V0IGl0IHRvIFwiSVNBXCIpXG4gICAgICAgIHRoaXMub3AgPSBjLm9wIHx8IGMudHlwZSAmJiBcIklTQVwiIHx8IG51bGw7XG4gICAgICAgIC8vIG9uZSBvZjogbnVsbCwgdmFsdWUsIG11bHRpdmFsdWUsIHN1YmNsYXNzLCBsb29rdXAsIGxpc3QsIHJhbmdlLCBsb29wXG4gICAgICAgIC8vIHRocm93cyBhbiBleGNlcHRpb24gaWYgdGhpcy5vcCBpcyBkZWZpbmVkLCBidXQgbm90IGluIE9QSU5ERVhcbiAgICAgICAgdGhpcy5jdHlwZSA9IHRoaXMub3AgJiYgT1BJTkRFWFt0aGlzLm9wXS5jdHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy5jb2RlID0gdGhpcy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiICYmIGMuY29kZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHZhbHVlLCBsaXN0XG4gICAgICAgIHRoaXMudmFsdWUgPSBjLnZhbHVlIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgTE9PS1VQIG9uIEJpb0VudGl0eSBhbmQgc3ViY2xhc3Nlc1xuICAgICAgICB0aGlzLmV4dHJhVmFsdWUgPSB0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiICYmIGMuZXh0cmFWYWx1ZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IG11bHRpdmFsdWUgYW5kIHJhbmdlIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmFsdWVzID0gYy52YWx1ZXMgJiYgZGVlcGMoYy52YWx1ZXMpIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgYnkgc3ViY2xhc3MgY29udHJhaW50c1xuICAgICAgICB0aGlzLnR5cGUgPSB0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIgJiYgYy50eXBlIHx8IG51bGw7XG4gICAgICAgIC8vIHVzZWQgZm9yIGNvbnN0cmFpbnRzIGluIGEgdGVtcGxhdGVcbiAgICAgICAgdGhpcy5lZGl0YWJsZSA9IGMuZWRpdGFibGUgfHwgbnVsbDtcblxuICAgICAgICAvLyBXaXRoIG51bGwvbm90LW51bGwgY29uc3RyYWludHMsIElNIGhhcyBhIHdlaXJkIHF1aXJrIG9mIGZpbGxpbmcgdGhlIHZhbHVlIFxuICAgICAgICAvLyBmaWVsZCB3aXRoIHRoZSBvcGVyYXRvci4gRS5nLiwgZm9yIGFuIFwiSVMgTk9UIE5VTExcIiBvcHJlYXRvciwgdGhlIHZhbHVlIGZpZWxkIGlzXG4gICAgICAgIC8vIGFsc28gXCJJUyBOT1QgTlVMTFwiLiBcbiAgICAgICAgLy8gXG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIilcbiAgICAgICAgICAgIGMudmFsdWUgPSBcIlwiO1xuICAgIH1cbiAgICAvL1xuICAgIHNldE9wIChvLCBxdWlldGx5KSB7XG4gICAgICAgIGxldCBvcCA9IE9QSU5ERVhbb107XG4gICAgICAgIGlmICghb3ApIHRocm93IFwiVW5rbm93biBvcGVyYXRvcjogXCIgKyBvO1xuICAgICAgICB0aGlzLm9wID0gb3Aub3A7XG4gICAgICAgIHRoaXMuY3R5cGUgPSBvcC5jdHlwZTtcbiAgICAgICAgbGV0IHQgPSB0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnRlbXBsYXRlO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2RlICYmICFxdWlldGx5ICYmIHQpIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0LmNvZGUyY1t0aGlzLmNvZGVdO1xuICAgICAgICAgICAgdGhpcy5jb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb2RlKSBcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSB0ICYmIHQubmV4dEF2YWlsYWJsZUNvZGUoKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgICFxdWlldGx5ICYmIHQgJiYgdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgLy8gUmV0dXJucyBhIHRleHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbnN0cmFpbnQgc3VpdGFibGUgZm9yIGEgbGFiZWxcbiAgICAvL1xuICAgIGdldCBsYWJlbFRleHQgKCkge1xuICAgICAgIGxldCB0ID0gXCI/XCI7XG4gICAgICAgbGV0IGMgPSB0aGlzO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0LCByYW5nZSwgbG9vcFxuICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpe1xuICAgICAgICAgICB0ID0gXCJJU0EgXCIgKyAodGhpcy50eXBlIHx8IFwiP1wiKTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsaXN0XCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlO1xuICAgICAgICAgICBpZiAodGhpcy5leHRyYVZhbHVlKSB0ID0gdCArIFwiIElOIFwiICsgdGhpcy5leHRyYVZhbHVlO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWVzO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcDtcbiAgICAgICB9XG5cbiAgICAgICByZXR1cm4gKHRoaXMuY3R5cGUgIT09IFwic3ViY2xhc3NcIiA/IFwiKFwiK3RoaXMuY29kZStcIikgXCIgOiBcIlwiKSArIHQ7XG4gICAgfVxuXG4gICAgLy8gZm9ybWF0cyB0aGlzIGNvbnN0cmFpbnQgYXMgeG1sXG4gICAgYzJ4bWwgKHFvbmx5KXtcbiAgICAgICAgbGV0IGcgPSAnJztcbiAgICAgICAgbGV0IGggPSAnJztcbiAgICAgICAgbGV0IGUgPSBxb25seSA/IFwiXCIgOiBgZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGUgfHwgJ2ZhbHNlJ31cImA7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInZhbHVlXCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJsaXN0XCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7ZXNjKHRoaXMub3ApfVwiIHZhbHVlPVwiJHtlc2ModGhpcy52YWx1ZSl9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiKXtcbiAgICAgICAgICAgIGxldCBldiA9ICh0aGlzLmV4dHJhVmFsdWUgJiYgdGhpcy5leHRyYVZhbHVlICE9PSBcIkFueVwiKSA/IGBleHRyYVZhbHVlPVwiJHt0aGlzLmV4dHJhVmFsdWV9XCJgIDogXCJcIjtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiAke2V2fSBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICAgICAgaCA9IHRoaXMudmFsdWVzLm1hcCggdiA9PiBgPHZhbHVlPiR7ZXNjKHYpfTwvdmFsdWU+YCApLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIHR5cGU9XCIke3RoaXMudHlwZX1cIiAke2V9YDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGlmKGgpXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30+JHtofTwvY29uc3RyYWludD5cXG5gO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30gLz5cXG5gO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIENvbnN0cmFpbnRcblxuZXhwb3J0IHsgQ29uc3RyYWludCB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvY29uc3RyYWludC5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvL1xuLy8gcWIuanNcbi8vXG5cbmltcG9ydCB7IFFCRWRpdG9yIH0gZnJvbSAnLi9xYmVkaXRvci5qcyc7XG5cbmxldCBxYiA9IG5ldyBRQkVkaXRvcigpO1xucWIuc2V0dXAoKVxuLy9cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3FiLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQge1xuICAgIGVzYyxcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgcGFyc2VQYXRoUXVlcnksXG4gICAgb2JqMmFycmF5LFxuICAgIGluaXRPcHRpb25MaXN0LFxuICAgIGNvcHlPYmpcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBjb2RlcG9pbnRzIH0gZnJvbSAnLi9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanMnO1xuaW1wb3J0IHsgVW5kb01hbmFnZXIgfSBmcm9tICcuL3VuZG9NYW5hZ2VyLmpzJztcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnLi9tb2RlbC5qcyc7XG5pbXBvcnQgeyBUZW1wbGF0ZSB9IGZyb20gJy4vdGVtcGxhdGUuanMnO1xuaW1wb3J0IHsgaW5pdFJlZ2lzdHJ5IH0gZnJvbSAnLi9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBlZGl0Vmlld3MgfSBmcm9tICcuL2VkaXRWaWV3cy5qcyc7XG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2RpYWxvZy5qcyc7XG5pbXBvcnQgeyBDb25zdHJhaW50RWRpdG9yIH0gZnJvbSAnLi9jb25zdHJhaW50RWRpdG9yLmpzJztcblxubGV0IFZFUlNJT04gPSBcIjAuMS4wXCI7XG5cbmNsYXNzIFFCRWRpdG9yIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMuY3Vyck1pbmUgPSBudWxsO1xuICAgICAgICB0aGlzLmN1cnJUZW1wbGF0ZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5uYW1lMm1pbmUgPSBudWxsO1xuICAgICAgICB0aGlzLnN2ZyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAgICAgIDEyODAsXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICA4MDAsXG4gICAgICAgICAgICBtbGVmdDogICAgICAxMjAsXG4gICAgICAgICAgICBtcmlnaHQ6ICAgICAxMjAsXG4gICAgICAgICAgICBtdG9wOiAgICAgICAyMCxcbiAgICAgICAgICAgIG1ib3R0b206ICAgIDIwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIHRoaXMuZGlhZ29uYWwgPSBudWxsO1xuICAgICAgICB0aGlzLnZpcyA9IG51bGw7XG4gICAgICAgIHRoaXMubm9kZXMgPSBudWxsO1xuICAgICAgICB0aGlzLmxpbmtzID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnQmVoYXZpb3IgPSBudWxsO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkR1cmF0aW9uID0gMjUwOyAvLyBtc1xuICAgICAgICB0aGlzLmRlZmF1bHRDb2xvcnMgPSB7IGhlYWRlcjogeyBtYWluOiBcIiM1OTU0NTVcIiwgdGV4dDogXCIjZmZmXCIgfSB9O1xuICAgICAgICB0aGlzLmRlZmF1bHRMb2dvID0gXCJodHRwczovL2Nkbi5yYXdnaXQuY29tL2ludGVybWluZS9kZXNpZ24tbWF0ZXJpYWxzLzc4YTEzZGI1L2xvZ29zL2ludGVybWluZS9zcXVhcmVpc2gvNDV4NDUucG5nXCI7XG4gICAgICAgIHRoaXMudW5kb01nciA9IG5ldyBVbmRvTWFuYWdlcigpO1xuICAgICAgICAvLyBTdGFydGluZyBlZGl0IHZpZXcgaXMgdGhlIG1haW4gcXVlcnkgdmlldy5cbiAgICAgICAgdGhpcy5lZGl0Vmlld3MgPSBlZGl0Vmlld3M7XG4gICAgICAgIHRoaXMuZWRpdFZpZXcgPSB0aGlzLmVkaXRWaWV3cy5xdWVyeU1haW47XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvciA9IFxuICAgICAgICAgICAgbmV3IENvbnN0cmFpbnRFZGl0b3IobiA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWFsb2cuc2hvdyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVuZG9NZ3Iuc2F2ZVN0YXRlKG4pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKG4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoZSBub2RlIGRpYWxvZ1xuICAgICAgICB0aGlzLmRpYWxvZyA9IG5ldyBEaWFsb2codGhpcyk7XG4gICAgfVxuICAgIHNldHVwICgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoJyNmb290ZXIgW25hbWU9XCJ2ZXJzaW9uXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGBRQiB2JHtWRVJTSU9OfWApO1xuXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuaW5pdFN2ZygpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdCgnLmJ1dHRvbltuYW1lPVwib3BlbmNsb3NlXCJdJylcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IFxuICAgICAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpO1xuICAgICAgICAgICAgICAgIGxldCB3YXNDbG9zZWQgPSB0LmNsYXNzZWQoXCJjbG9zZWRcIik7XG4gICAgICAgICAgICAgICAgbGV0IGlzQ2xvc2VkID0gIXdhc0Nsb3NlZDtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IGQzLnNlbGVjdCgnI3RJbmZvQmFyJylbMF1bMF1cbiAgICAgICAgICAgICAgICBpZiAoaXNDbG9zZWQpXG4gICAgICAgICAgICAgICAgICAgIC8vIHNhdmUgdGhlIGN1cnJlbnQgaGVpZ2h0IGp1c3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgICAgICAgICAgICAgICAgZC5fX3NhdmVkX2hlaWdodCA9IGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGQuX19zYXZlZF9oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgLy8gb24gb3BlbiwgcmVzdG9yZSB0aGUgc2F2ZWQgaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjdEluZm9CYXInKS5zdHlsZShcImhlaWdodFwiLCBkLl9fc2F2ZWRfaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdC5jbGFzc2VkKFwiY2xvc2VkXCIsIGlzQ2xvc2VkKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpbml0UmVnaXN0cnkodGhpcy5pbml0TWluZXMuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiI3R0ZXh0IGxhYmVsIHNwYW5cIilcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlVHRleHQoc2VsZi5jdXJyVGVtcGxhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3J1bmF0bWluZScpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgKCkgPT4gc2VsZi5ydW5hdG1pbmUoc2VsZi5jdXJyVGVtcGxhdGUpKTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgICAgIHQudGV4dCggdHVyblN5bmNPZmYgPyBcInN5bmNfZGlzYWJsZWRcIiA6IFwic3luY1wiIClcbiAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0aXRsZVwiLCAoKSA9PlxuICAgICAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgICAgICF0dXJuU3luY09mZiAmJiBzZWxmLnVwZGF0ZUNvdW50KHNlbGYuY3VyclRlbXBsYXRlKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpXG4gICAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgICAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpXG4gICAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJqc29udGV4dGFyZWFcIil9KTtcblxuICAgICAgLy9cbiAgICAgIHRoaXMuZHJhZ0JlaGF2aW9yID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgIC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIG9uIGRyYWcsIGZvbGxvdyB0aGUgbW91c2UgaW4gdGhlIFkgZGltZW5zaW9uLlxuICAgICAgICAgIC8vIERyYWcgY2FsbGJhY2sgaXMgYXR0YWNoZWQgdG8gdGhlIGRyYWcgaGFuZGxlLlxuICAgICAgICAgIGxldCBub2RlR3JwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgIC8vIHVwZGF0ZSBub2RlJ3MgeS1jb29yZGluYXRlXG4gICAgICAgICAgbm9kZUdycC5hdHRyKFwidHJhbnNmb3JtXCIsIChuKSA9PiB7XG4gICAgICAgICAgICAgIG4ueSA9IGQzLmV2ZW50Lnk7XG4gICAgICAgICAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7bi54fSwke24ueX0pYDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIG5vZGUncyBsaW5rXG4gICAgICAgICAgbGV0IGxsID0gZDMuc2VsZWN0KGBwYXRoLmxpbmtbdGFyZ2V0PVwiJHtub2RlR3JwLmF0dHIoJ2lkJyl9XCJdYCk7XG4gICAgICAgICAgbGwuYXR0cihcImRcIiwgc2VsZi5kaWFnb25hbCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgLm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gb24gZHJhZ2VuZCwgcmVzb3J0IHRoZSBkcmFnZ2FibGUgbm9kZXMgYWNjb3JkaW5nIHRvIHRoZWlyIFkgcG9zaXRpb25cbiAgICAgICAgICBsZXQgbm9kZXMgPSBkMy5zZWxlY3RBbGwoc2VsZi5lZGl0Vmlldy5kcmFnZ2FibGUpLmRhdGEoKVxuICAgICAgICAgIG5vZGVzLnNvcnQoIChhLCBiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgICAgICAvLyB0aGUgbm9kZSB0aGF0IHdhcyBkcmFnZ2VkXG4gICAgICAgICAgbGV0IGRyYWdnZWQgPSBkMy5zZWxlY3QodGhpcykuZGF0YSgpWzBdO1xuICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBzcGVjaWZpYyBkcmFnLWVuZCBiZWhhdmlvclxuICAgICAgICAgIHNlbGYuZWRpdFZpZXcuYWZ0ZXJEcmFnICYmIHNlbGYuZWRpdFZpZXcuYWZ0ZXJEcmFnKG5vZGVzLCBkcmFnZ2VkKTtcbiAgICAgICAgICAvL1xuICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoZHJhZ2dlZCk7XG4gICAgICAgICAgc2VsZi51cGRhdGUoKTtcbiAgICAgICAgICAvL1xuICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0TWluZXMgKGpfbWluZXMpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLm5hbWUybWluZSA9IHt9O1xuICAgICAgICBsZXQgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICAgICAgbWluZXMuZm9yRWFjaChtID0+IHRoaXMubmFtZTJtaW5lW20ubmFtZV0gPSBtICk7XG4gICAgICAgIHRoaXMuY3Vyck1pbmUgPSBtaW5lc1swXTtcbiAgICAgICAgdGhpcy5jdXJyVGVtcGxhdGUgPSBudWxsO1xuXG4gICAgICAgIGxldCBtbCA9IGQzLnNlbGVjdChcIiNtbGlzdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShtaW5lcyk7XG4gICAgICAgIGxldCBzZWxlY3RNaW5lID0gXCJNb3VzZU1pbmVcIjtcbiAgICAgICAgbWwuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICBsZXQgdyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgbSA9IGQudXJsLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgdiA9ICh3ICYmICFtKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU9PT1zZWxlY3RNaW5lIHx8IG51bGw7IH0pXG4gICAgICAgICAgICAudGV4dChmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHdoZW4gYSBtaW5lIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3RcbiAgICAgICAgZDMuc2VsZWN0KFwiI21saXN0XCIpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAvLyByZW1pbmRlcjogdGhpcz09PXRoZSBsaXN0IGlucHV0IGVsZW1lbnQ7IHNlbGY9PT10aGUgZWRpdG9yIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgc2VsZi5zZWxlY3RlZE1pbmUodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgXG4gICAgICAgIC8vIFxuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoXCIjZWRpdFZpZXcgc2VsZWN0XCIpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIHJlbWluZGVyOiB0aGlzPT09dGhlIGxpc3QgaW5wdXQgZWxlbWVudDsgc2VsZj09PXRoZSBlZGl0b3IgaW5zdGFuY2VcbiAgICAgICAgICAgICAgICBzZWxmLnNldEVkaXRWaWV3KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcblxuICAgICAgICAvLyBzdGFydCB3aXRoIHRoZSBmaXJzdCBtaW5lIGJ5IGRlZmF1bHQuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRNaW5lKHNlbGVjdE1pbmUpO1xuICAgIH1cbiAgICAvLyBDYWxsZWQgd2hlbiB1c2VyIHNlbGVjdHMgYSBtaW5lIGZyb20gdGhlIG9wdGlvbiBsaXN0XG4gICAgLy8gTG9hZHMgdGhhdCBtaW5lJ3MgZGF0YSBtb2RlbCBhbmQgYWxsIGl0cyB0ZW1wbGF0ZXMuXG4gICAgLy8gVGhlbiBpbml0aWFsaXplcyBkaXNwbGF5IHRvIHNob3cgdGhlIGZpcnN0IHRlcm1wbGF0ZSdzIHF1ZXJ5LlxuICAgIHNlbGVjdGVkTWluZSAobW5hbWUpIHtcbiAgICAgICAgaWYoIXRoaXMubmFtZTJtaW5lW21uYW1lXSkgdGhyb3cgXCJObyBtaW5lIG5hbWVkOiBcIiArIG1uYW1lO1xuICAgICAgICB0aGlzLmN1cnJNaW5lID0gdGhpcy5uYW1lMm1pbmVbbW5hbWVdO1xuICAgICAgICB0aGlzLnVuZG9NZ3IuY2xlYXIoKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMuY3Vyck1pbmUudXJsO1xuICAgICAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICAgICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikgeyBcbiAgICAgICAgICAgIHR1cmwgPSB1cmwgKyBcIi90ZW1wbGF0ZXMuanNvblwiO1xuICAgICAgICAgICAgbXVybCA9IHVybCArIFwiL21vZGVsLmpzb25cIjtcbiAgICAgICAgICAgIGx1cmwgPSB1cmwgKyBcIi9saXN0cy5qc29uXCI7XG4gICAgICAgICAgICBidXJsID0gdXJsICsgXCIvYnJhbmRpbmcuanNvblwiO1xuICAgICAgICAgICAgc3VybCA9IHVybCArIFwiL3N1bW1hcnlmaWVsZHMuanNvblwiO1xuICAgICAgICAgICAgb3VybCA9IHVybCArIFwiL29yZ2FuaXNtbGlzdC5qc29uXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0dXJsID0gdXJsICsgXCIvc2VydmljZS90ZW1wbGF0ZXM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgICAgIG11cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL21vZGVsP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgICAgICBsdXJsID0gdXJsICsgXCIvc2VydmljZS9saXN0cz9mb3JtYXQ9anNvblwiO1xuICAgICAgICAgICAgYnVybCA9IHVybCArIFwiL3NlcnZpY2UvYnJhbmRpbmdcIjtcbiAgICAgICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3N1bW1hcnlmaWVsZHNcIjtcbiAgICAgICAgICAgIG91cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JTNDcXVlcnkrbmFtZSUzRCUyMiUyMittb2RlbCUzRCUyMmdlbm9taWMlMjIrdmlldyUzRCUyMk9yZ2FuaXNtLnNob3J0TmFtZSUyMitsb25nRGVzY3JpcHRpb24lM0QlMjIlMjIlM0UlM0MlMkZxdWVyeSUzRSZmb3JtYXQ9anNvbm9iamVjdHNcIjtcbiAgICAgICAgfVxuICAgICAgICAvLyBnZXQgdGhlIG1vZGVsXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyByZXNvdXJjZXMgZnJvbSBcIiArIHVybCApO1xuICAgICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKG11cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZSh0dXJsKSxcbiAgICAgICAgICAgIGQzanNvblByb21pc2UobHVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKGJ1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShzdXJsKSxcbiAgICAgICAgICAgIGQzanNvblByb21pc2Uob3VybClcbiAgICAgICAgXSkudGhlbihcbiAgICAgICAgICAgIHRoaXMuaW5pdE1pbmVEYXRhLmJpbmQodGhpcyksXG4gICAgICAgICAgICBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyAke2NtLm5hbWV9LiBTdGF0dXM9JHtlcnJvci5zdGF0dXN9LiBFcnJvcj0ke2Vycm9yLnN0YXR1c1RleHR9LiAoSWYgdGhlcmUgaXMgbm8gZXJyb3IgbWVzc2FnZSwgdGhlbiBpdHMgcHJvYmFibHkgYSBDT1JTIGlzc3VlLilgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdE1pbmVEYXRhIChkYXRhKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGpfbW9kZWwgPSBkYXRhWzBdO1xuICAgICAgICBsZXQgal90ZW1wbGF0ZXMgPSBkYXRhWzFdO1xuICAgICAgICBsZXQgal9saXN0cyA9IGRhdGFbMl07XG4gICAgICAgIGxldCBqX2JyYW5kaW5nID0gZGF0YVszXTtcbiAgICAgICAgbGV0IGpfc3VtbWFyeSA9IGRhdGFbNF07XG4gICAgICAgIGxldCBqX29yZ2FuaXNtcyA9IGRhdGFbNV07XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBjbSA9IHRoaXMuY3Vyck1pbmU7XG4gICAgICAgIGNtLnRuYW1lcyA9IFtdXG4gICAgICAgIGNtLnRlbXBsYXRlcyA9IFtdXG4gICAgICAgIGNtLm1vZGVsID0gbmV3IE1vZGVsKGpfbW9kZWwubW9kZWwsIGNtKVxuICAgICAgICBjbS50ZW1wbGF0ZXMgPSBqX3RlbXBsYXRlcy50ZW1wbGF0ZXM7XG4gICAgICAgIGNtLmxpc3RzID0gal9saXN0cy5saXN0cztcbiAgICAgICAgY20uc3VtbWFyeUZpZWxkcyA9IGpfc3VtbWFyeS5jbGFzc2VzO1xuICAgICAgICBjbS5vcmdhbmlzbUxpc3QgPSBqX29yZ2FuaXNtcy5yZXN1bHRzLm1hcChvID0+IG8uc2hvcnROYW1lKTtcbiAgICAgICAgLy9cbiAgICAgICAgY20udGxpc3QgPSBvYmoyYXJyYXkoY20udGVtcGxhdGVzKVxuICAgICAgICBjbS50bGlzdC5zb3J0KGZ1bmN0aW9uKGEsYil7IFxuICAgICAgICAgICAgcmV0dXJuIGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiBhLnRpdGxlID4gYi50aXRsZSA/IDEgOiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgY20udG5hbWVzID0gT2JqZWN0LmtleXMoIGNtLnRlbXBsYXRlcyApO1xuICAgICAgICBjbS50bmFtZXMuc29ydCgpO1xuICAgICAgICAvLyBGaWxsIGluIHRoZSBzZWxlY3Rpb24gbGlzdCBvZiB0ZW1wbGF0ZXMgZm9yIHRoaXMgbWluZS5cbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXCIjdGxpc3Qgc2VsZWN0XCIsIGNtLnRsaXN0LCB7XG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLnRpdGxlIH0pO1xuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCAoKSA9PiB0aGlzLnN0YXJ0RWRpdCgpKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5lZGl0VGVtcGxhdGUoY20udGVtcGxhdGVzW2NtLnRsaXN0WzBdLm5hbWVdKTtcbiAgICAgICAgLy8gQXBwbHkgYnJhbmRpbmdcbiAgICAgICAgbGV0IGNscnMgPSBjbS5jb2xvcnMgfHwgdGhpcy5kZWZhdWx0Q29sb3JzO1xuICAgICAgICBsZXQgYmdjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci5tYWluIDogY2xycy5tYWluLmZnO1xuICAgICAgICBsZXQgdHhjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci50ZXh0IDogY2xycy5tYWluLmJnO1xuICAgICAgICBsZXQgbG9nbyA9IGNtLmltYWdlcy5sb2dvIHx8IHRoaXMuZGVmYXVsdExvZ287XG4gICAgICAgIGQzLnNlbGVjdChcIiN0b29sdHJheVwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI21pbmVMb2dvXCIpXG4gICAgICAgICAgICAuYXR0cihcInNyY1wiLCBsb2dvKTtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCcjdG9vbHRyYXkgW25hbWU9XCJtaW5lbmFtZVwiXScpXG4gICAgICAgICAgICAudGV4dChjbS5uYW1lKTtcbiAgICAgICAgLy8gcG9wdWxhdGUgY2xhc3MgbGlzdC4gRXhjbHVkZSB0aGUgc2ltcGxlIGF0dHJpYnV0ZSB0eXBlcy5cbiAgICAgICAgbGV0IGNsaXN0ID0gT2JqZWN0LmtleXMoY20ubW9kZWwuY2xhc3NlcykuZmlsdGVyKGNuID0+ICEgY20ubW9kZWwuY2xhc3Nlc1tjbl0uaXNMZWFmVHlwZSk7XG4gICAgICAgIGNsaXN0LnNvcnQoKTtcbiAgICAgICAgaW5pdE9wdGlvbkxpc3QoXCIjbmV3cWNsaXN0IHNlbGVjdFwiLCBjbGlzdCk7XG4gICAgICAgIGQzLnNlbGVjdCgnI2VkaXRTb3VyY2VTZWxlY3RvciBbbmFtZT1cImluXCJdJylcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDE7IH0pXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZi5zZWxlY3RlZEVkaXRTb3VyY2UodGhpcy52YWx1ZSk7IHNlbGYuc3RhcnRFZGl0KCk7IH0pO1xuICAgICAgICBkMy5zZWxlY3QoXCIjeG1sdGV4dGFyZWFcIilbMF1bMF0udmFsdWUgPSBcIlwiO1xuICAgICAgICBkMy5zZWxlY3QoXCIjanNvbnRleHRhcmVhXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEVkaXRTb3VyY2UoIFwidGxpc3RcIiApO1xuICAgIH1cblxuICAgIC8vIEJlZ2lucyBhbiBlZGl0LCBiYXNlZCBvbiB1c2VyIGNvbnRyb2xzLlxuICAgIHN0YXJ0RWRpdCAoKSB7XG4gICAgICAgIC8vIHNlbGVjdG9yIGZvciBjaG9vc2luZyBlZGl0IGlucHV0IHNvdXJjZSwgYW5kIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgICAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgICAgIC8vIHRoZSBjaG9zZW4gZWRpdCBzb3VyY2VcbiAgICAgICAgbGV0IGlucHV0SWQgPSBzcmNTZWxlY3RvclswXVswXS52YWx1ZTtcbiAgICAgICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgICAgIGxldCBzcmMgPSBkMy5zZWxlY3QoYCMke2lucHV0SWR9IFtuYW1lPVwiaW5cIl1gKTtcbiAgICAgICAgLy8gdGhlIHF1ZXJ5IHN0YXJ0aW5nIHBvaW50XG4gICAgICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICAgICAgaWYgKGlucHV0SWQgPT09IFwidGxpc3RcIikge1xuICAgICAgICAgICAgLy8gYSBzYXZlZCBxdWVyeSBvciB0ZW1wbGF0ZVxuICAgICAgICAgICAgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy5jdXJyTWluZS50ZW1wbGF0ZXNbdmFsXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAgICAgLy8gYSBuZXcgcXVlcnkgZnJvbSBhIHNlbGVjdGVkIHN0YXJ0aW5nIGNsYXNzXG4gICAgICAgICAgICBsZXQgbnQgPSBuZXcgVGVtcGxhdGUoeyBzZWxlY3Q6IFt2YWwrXCIuaWRcIl19LCB0aGlzLmN1cnJNaW5lLm1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdFRlbXBsYXRlKG50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbnB1dElkID09PSBcImltcG9ydHhtbFwiKSB7XG4gICAgICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgICAgICB2YWwgJiYgdGhpcy5lZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnRqc29uXCIpIHtcbiAgICAgICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgICAgICB2YWwgJiYgdGhpcy5lZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbiAgICB9XG5cbiAgICAvLyBcbiAgICBzZWxlY3RlZEVkaXRTb3VyY2UgKHNob3cpIHtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuaWQgPT09IHNob3cgPyBudWxsIDogXCJub25lXCI7IH0pO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbiAgICAvL1xuICAgIHJlbW92ZU5vZGUgKG4pIHtcbiAgICAgICAgbi5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5kaWFsb2cuaGlkZSgpO1xuICAgICAgICB0aGlzLnVuZG9NZ3Iuc2F2ZVN0YXRlKG4pO1xuICAgICAgICB0aGlzLnVwZGF0ZShuLnBhcmVudCB8fCBuKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbiAgICAvLyBHZXRzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjdXJyZW50IG1pbmUgYW5kIGJ1aWxkcyBhIHNldCBvZiBub2Rlc1xuICAgIC8vIGZvciBkMyB0cmVlIGRpc3BsYXkuXG4gICAgLy9cbiAgICBlZGl0VGVtcGxhdGUgKHQsIG5vc2F2ZSkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWRpdG9yIHdvcmtzIG9uIGEgY29weSBvZiB0aGUgdGVtcGxhdGUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBjdCA9IHRoaXMuY3VyclRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHQsIHRoaXMuY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnJvb3QgPSBjdC5xdHJlZVxuICAgICAgICB0aGlzLnJvb3QueDAgPSAwO1xuICAgICAgICB0aGlzLnJvb3QueTAgPSB0aGlzLnN2Zy5oZWlnaHQgLyAyO1xuICAgICAgICAvL1xuICAgICAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcblxuICAgICAgICBpZiAoISBub3NhdmUpIHRoaXMudW5kb01nci5zYXZlU3RhdGUoY3QucXRyZWUpO1xuXG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIGJhc2ljIHRlbXBsYXRlIGluZm9ybWF0aW9uIChuYW1lLCB0aXRsZSwgZGVzY3JpcHRpb24sIGV0Yy4pXG4gICAgICAgIC8vXG4gICAgICAgIGxldCB0aSA9IGQzLnNlbGVjdChcIiN0SW5mb1wiKTtcbiAgICAgICAgbGV0IHhmZXIgPSBmdW5jdGlvbihuYW1lLCBlbHQpeyBjdFtuYW1lXSA9IGVsdC52YWx1ZTsgc2VsZi51cGRhdGVUdGV4dChjdCk7IH07XG4gICAgICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cIm5hbWVcIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC5uYW1lKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJuYW1lXCIsIHRoaXMpIH0pO1xuICAgICAgICAvLyBUaXRsZSAod2hhdCB0aGUgdXNlciBzZWVzKVxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwidGl0bGVcIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC50aXRsZSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwidGl0bGVcIiwgdGhpcykgfSk7XG4gICAgICAgIC8vIERlc2NyaXB0aW9uICh3aGF0IGl0IGRvZXMgLSBhIGxpdHRsZSBkb2N1bWVudGF0aW9uKS5cbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgICAgIC50ZXh0KGN0LmRlc2NyaXB0aW9uKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJkZXNjcmlwdGlvblwiLCB0aGlzKSB9KTtcbiAgICAgICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy4gXG4gICAgICAgIHRpLnNlbGVjdCgnW25hbWU9XCJjb21tZW50XCJdIHRleHRhcmVhJylcbiAgICAgICAgICAgIC50ZXh0KGN0LmNvbW1lbnQpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImNvbW1lbnRcIiwgdGhpcykgfSk7XG5cbiAgICAgICAgLy8gTG9naWMgZXhwcmVzc2lvbiAtIHdoaWNoIHRpZXMgdGhlIGluZGl2aWR1YWwgY29uc3RyYWludHMgdG9nZXRoZXJcbiAgICAgICAgZDMuc2VsZWN0KCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBjdC5jb25zdHJhaW50TG9naWMgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGN0LnNldExvZ2ljRXhwcmVzc2lvbih0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB4ZmVyKFwiY29uc3RyYWludExvZ2ljXCIsIHRoaXMpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBDbGVhciB0aGUgcXVlcnkgY291bnRcbiAgICAgICAgZDMuc2VsZWN0KFwiI3F1ZXJ5Y291bnQgc3BhblwiKS50ZXh0KFwiXCIpO1xuXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZGlhbG9nLmhpZGUoKTtcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5yb290KTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGVkaXRpbmcgdmlldy4gVmlldyBpcyBvbmUgb2Y6XG4gICAgLy8gQXJnczpcbiAgICAvLyAgICAgdmlldyAoc3RyaW5nKSBPbmUgb2Y6IHF1ZXJ5TWFpbiwgY29uc3RyYWludExvZ2ljLCBjb2x1bW5PcmRlciwgc29ydE9yZGVyXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgICAgTm90aGluZ1xuICAgIC8vIFNpZGUgZWZmZWN0czpcbiAgICAvLyAgICAgQ2hhbmdlcyB0aGUgbGF5b3V0IGFuZCB1cGRhdGVzIHRoZSB2aWV3LlxuICAgIHNldEVkaXRWaWV3ICh2aWV3KXtcbiAgICAgICAgbGV0IHYgPSB0aGlzLmVkaXRWaWV3c1t2aWV3XTtcbiAgICAgICAgaWYgKCF2KSB0aHJvdyBcIlVucmVjb2duaXplZCB2aWV3IHR5cGU6IFwiICsgdmlldztcbiAgICAgICAgdGhpcy5lZGl0VmlldyA9IHY7XG4gICAgICAgIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIHYubmFtZSk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucm9vdCk7XG4gICAgfVxuXG4gICAgLy8gR3Jvd3Mgb3Igc2hyaW5rcyB0aGUgc2l6ZSBvZiB0aGUgU1ZHIGRyYXdpbmcgYXJlYSBhbmQgcmVkcmF3cyB0aGUgZGlhZ3JhbS5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgcGN0WCAobnVtYmVyKSBBIHBlcmNlbnRhZ2UgdG8gZ3JvdyBvciBzaHJpbmsgaW4gdGhlIFggZGltZW5zaW9uLiBJZiA+MCxcbiAgICAvLyAgICAgICAgICAgICAgICAgZ3Jvd3MgYnkgdGhhdCBwZXJjZW50YWdlLiBJZiA8MCwgc2hyaW5rcyBieSB0aGF0IHBlcmNlbnRhZ2UuXG4gICAgLy8gICAgICAgICAgICAgICAgIElmIDAsIHJlbWFpbnMgdW5jaGFuZ2VkLlxuICAgIC8vICAgcGN0WSAobnVtYmVyKSBBIHBlcmNlbnRhZ2UgdG8gZ3JvdyBvciBzaHJpbmsgaW4gdGhlIFkgZGltZW5zaW9uLiBJZiBub3RcbiAgICAvLyAgICAgICAgICAgICAgICAgc3BlY2lmaWVkLCB1c2VzIHBjdFguXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBwZXJjZW50YWdlcyBhcHBseSB0byB0aGUgbWFyZ2lucyBhcyB3ZWxsLlxuICAgIC8vXG4gICAgZ3Jvd1N2ZyAocGN0WCwgcGN0WSkge1xuICAgICAgICBwY3RZID0gcGN0WSA9PT0gdW5kZWZpbmVkID8gcGN0WCA6IHBjdFk7XG4gICAgICAgIGxldCBteCA9IDEgKyBwY3RYIC8gMTAwLjA7XG4gICAgICAgIGxldCBteSA9IDEgKyBwY3RZIC8gMTAwLjA7XG4gICAgICAgIGxldCBzeiA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAgICAgIG14ICogdGhpcy5zdmcud2lkdGgsXG4gICAgICAgICAgICBtbGVmdDogICAgICBteCAqIHRoaXMuc3ZnLm1sZWZ0LFxuICAgICAgICAgICAgbXJpZ2h0OiAgICAgbXggKiB0aGlzLnN2Zy5tcmlnaHQsXG4gICAgICAgICAgICBoZWlnaHQ6ICAgICBteSAqIHRoaXMuc3ZnLmhlaWdodCxcbiAgICAgICAgICAgIG10b3A6ICAgICAgIG15ICogdGhpcy5zdmcubXRvcCxcbiAgICAgICAgICAgIG1ib3R0b206ICAgIG15ICogdGhpcy5zdmcubWJvdHRvbVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldFN2Z1NpemUoc3opO1xuICAgIH1cblxuICAgIC8vIFNldHMgdGhlIHNpemUgb2YgdGhlIFNWRyBkcmF3aW5nIGFyZWEgYW5kIHJlZHJhd3MgdGhlIGRpYWdyYW0uXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHN6IChvYmopIEFuIG9iamVjdCBkZWZpbmluZyBhbnkvYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcy5zdmcsIHRvIHdpdDpcbiAgICAvLyAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsIG1sZWZ0LCBtcmlnaHQsIG10b3AsIG1ib3R0b21cbiAgICBzZXRTdmdTaXplIChzeikge1xuICAgICAgICBjb3B5T2JqKHRoaXMuc3ZnLCBzeik7XG4gICAgICAgIHRoaXMuaW5pdFN2ZygpO1xuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBTVkcgZHJhd2luZyBhcmVhXG4gICAgaW5pdFN2ZyAoKSB7XG4gICAgICAgIC8vIGluaXQgdGhlIFNWRyBjb250YWluZXJcbiAgICAgICAgdGhpcy52aXMgPSBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyIHN2Z1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzLnN2Zy53aWR0aCArIHRoaXMuc3ZnLm1sZWZ0ICsgdGhpcy5zdmcubXJpZ2h0KVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgdGhpcy5zdmcuaGVpZ2h0ICsgdGhpcy5zdmcubXRvcCArIHRoaXMuc3ZnLm1ib3R0b20pXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLmRpYWxvZy5oaWRlKCkpXG4gICAgICAgICAgLnNlbGVjdChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdGhpcy5zdmcubWxlZnQgKyBcIixcIiArIHRoaXMuc3ZnLm10b3AgKyBcIilcIik7XG4gXG4gICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MDA3ODc3L2hvdy10by11c2UtdGhlLWQzLWRpYWdvbmFsLWZ1bmN0aW9uLXRvLWRyYXctY3VydmVkLWxpbmVzXG4gICAgICAgIHRoaXMuZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAgICAgLnNvdXJjZShmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC5zb3VyY2UueSwgXCJ5XCI6ZC5zb3VyY2UueH07IH0pICAgICBcbiAgICAgICAgICAgIC50YXJnZXQoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQudGFyZ2V0LnksIFwieVwiOmQudGFyZ2V0Lnh9OyB9KVxuICAgICAgICAgICAgLnByb2plY3Rpb24oZnVuY3Rpb24oZCkgeyByZXR1cm4gW2QueSwgZC54XTsgfSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlcyBwb3NpdGlvbnMgZm9yIG5vZGVzIGFuZCBwYXRocyBmb3IgbGlua3MuXG4gICAgZG9MYXlvdXQgKCkge1xuICAgICAgbGV0IGxheW91dDtcbiAgICAgIC8vXG4gICAgICBsZXQgbGVhdmVzID0gW107XG4gICAgICBmdW5jdGlvbiBtZCAobikgeyAvLyBtYXggZGVwdGhcbiAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPT09IDApIGxlYXZlcy5wdXNoKG4pO1xuICAgICAgICAgIHJldHVybiAxICsgKG4uY2hpbGRyZW4ubGVuZ3RoID8gTWF0aC5tYXguYXBwbHkobnVsbCwgbi5jaGlsZHJlbi5tYXAobWQpKSA6IDApO1xuICAgICAgfTtcbiAgICAgIGxldCBtYXhkID0gbWQodGhpcy5yb290KTsgLy8gbWF4IGRlcHRoLCAxLWJhc2VkXG5cbiAgICAgIC8vXG4gICAgICBpZiAodGhpcy5lZGl0Vmlldy5sYXlvdXRTdHlsZSA9PT0gXCJ0cmVlXCIpIHtcbiAgICAgICAgICAvLyBkMyBsYXlvdXQgYXJyYW5nZXMgbm9kZXMgdG9wLXRvLWJvdHRvbSwgYnV0IHdlIHdhbnQgbGVmdC10by1yaWdodC5cbiAgICAgICAgICAvLyBTby4uLmRvIHRoZSBsYXlvdXQsIHJldmVyc2luZyB3aWR0aCBhbmQgaGVpZ2h0LiBcbiAgICAgICAgICAvLyBUaGVuIHJldmVyc2UgdGhlIHgseSBjb29yZHMgaW4gdGhlIHJlc3VsdHMuXG4gICAgICAgICAgdGhpcy5sYXlvdXQgPSBkMy5sYXlvdXQudHJlZSgpLnNpemUoW3RoaXMuc3ZnLmhlaWdodCwgdGhpcy5zdmcud2lkdGhdKTtcbiAgICAgICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5sYXlvdXQubm9kZXModGhpcy5yb290KS5yZXZlcnNlKCk7XG4gICAgICAgICAgLy8gUmV2ZXJzZSB4IGFuZCB5LiBBbHNvLCBub3JtYWxpemUgeCBmb3IgZml4ZWQtZGVwdGguXG4gICAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7XG4gICAgICAgICAgICAgIGxldCBkeCA9IE1hdGgubWluKDE4MCwgdGhpcy5zdmcud2lkdGggLyBNYXRoLm1heCgxLG1heGQtMSkpXG4gICAgICAgICAgICAgIGQueCA9IGQuZGVwdGggKiBkeCBcbiAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGRlbmRyb2dyYW1cbiAgICAgICAgICB0aGlzLmxheW91dCA9IGQzLmxheW91dC5jbHVzdGVyKClcbiAgICAgICAgICAgICAgLnNlcGFyYXRpb24oKGEsYikgPT4gMSlcbiAgICAgICAgICAgICAgLnNpemUoW3RoaXMuc3ZnLmhlaWdodCwgTWF0aC5taW4odGhpcy5zdmcud2lkdGgsIG1heGQgKiAxODApXSk7XG4gICAgICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMubGF5b3V0Lm5vZGVzKHRoaXMucm9vdCkucmV2ZXJzZSgpO1xuICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCggZCA9PiB7IGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wOyB9KTtcblxuICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgIC8vIFJlYXJyYW5nZSB5LXBvc2l0aW9ucyBvZiBsZWFmIG5vZGVzLiBcbiAgICAgICAgICBsZXQgcG9zID0gbGVhdmVzLm1hcChmdW5jdGlvbihuKXsgcmV0dXJuIHsgeTogbi55LCB5MDogbi55MCB9OyB9KTtcblxuICAgICAgICAgIGxlYXZlcy5zb3J0KHRoaXMuZWRpdFZpZXcubm9kZUNvbXApO1xuXG4gICAgICAgICAgLy8gcmVhc3NpZ24gdGhlIFkgcG9zaXRpb25zXG4gICAgICAgICAgbGVhdmVzLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgICAgICAgIG4ueSA9IHBvc1tpXS55O1xuICAgICAgICAgICAgICBuLnkwID0gcG9zW2ldLnkwO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIGxlYXZlcyBoYXZlIGJlZW4gcmVhcnJhbmdlZCwgYnV0IHRoZSBpbnRlcmlvciBub2RlcyBoYXZlbid0LlxuICAgICAgICAgIC8vIEhlcmUgd2UgbW92ZSBpbnRlcmlvciBub2RlcyB1cCBvciBkb3duIHRvd2FyZCB0aGVpciBcImNlbnRlciBvZiBncmF2aXR5XCIgYXMgZGVmaW5lZFxuICAgICAgICAgIC8vIGJ5IHRoZSBZLXBvc2l0aW9ucyBvZiB0aGVpciBjaGlsZHJlbi4gQXBwbHkgdGhpcyByZWN1cnNpdmVseSB1cCB0aGUgdHJlZS5cbiAgICAgICAgICAvLyBcbiAgICAgICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBvY2N1cGllZCBwb3NpdGlvbnM6XG4gICAgICAgICAgbGV0IG9jY3VwaWVkID0ge30gOyAgLy8gb2NjdXBpZWRbeCBwb3NpdGlvbl0gPT0gW2xpc3Qgb2Ygbm9kZXNdXG4gICAgICAgICAgZnVuY3Rpb24gY29nIChuKSB7XG4gICAgICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIC8vIGNvbXB1dGUgbXkgYy5vLmcuIGFzIHRoZSBhdmVyYWdlIG9mIG15IGtpZHMnIHktcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICBsZXQgbXlDb2cgPSAobi5jaGlsZHJlbi5tYXAoY29nKS5yZWR1Y2UoKHQsYykgPT4gdCtjLCAwKSkvbi5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICBuLnkgPSBteUNvZztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgZGQgPSBvY2N1cGllZFtuLnhdID0gKG9jY3VwaWVkW24ueF0gfHwgW10pO1xuICAgICAgICAgICAgICBkZC5wdXNoKG4pO1xuICAgICAgICAgICAgICByZXR1cm4gbi55O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb2codGhpcy5yb290KTtcblxuICAgICAgICAgIC8vIElmIGludGVybWVkaWF0ZSBub2RlcyBhdCB0aGUgc2FtZSB4IG92ZXJsYXAsIHNwcmVhZCB0aGVtIG91dCBpbiB5LlxuICAgICAgICAgIGZvcihsZXQgeCBpbiBvY2N1cGllZCkge1xuICAgICAgICAgICAgICAvLyBnZXQgdGhlIG5vZGVzIGF0IHRoaXMgeC1yYW5rLCBhbmQgc29ydCBieSB5IHBvc2l0aW9uXG4gICAgICAgICAgICAgIGxldCBub2RlcyA9IG9jY3VwaWVkW3hdO1xuICAgICAgICAgICAgICBub2Rlcy5zb3J0KCAoYSxiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgICAgICAgICAgLy8gTm93IG1ha2UgYSBwYXNzIGFuZCBlbnN1cmUgdGhhdCBlYWNoIG5vZGUgaXMgc2VwYXJhdGVkIGZyb20gdGhlXG4gICAgICAgICAgICAgIC8vIHByZXZpb3VzIG5vZGUgYnkgYXQgbGVhc3QgTUlOU0VQXG4gICAgICAgICAgICAgIGxldCBwcmV2ID0gbnVsbDtcbiAgICAgICAgICAgICAgbGV0IE1JTlNFUCA9IDMwO1xuICAgICAgICAgICAgICBub2Rlcy5mb3JFYWNoKCBuID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChwcmV2ICYmIChuLnkgLSBwcmV2LnkgPCBNSU5TRVApKVxuICAgICAgICAgICAgICAgICAgICAgIG4ueSA9IHByZXYueSArIE1JTlNFUDtcbiAgICAgICAgICAgICAgICAgIHByZXYgPSBuO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB9XG5cbiAgICAgIC8vIHNhdmUgbGlua3MgaW4gZ2xvYmFsXG4gICAgICB0aGlzLmxpbmtzID0gdGhpcy5sYXlvdXQubGlua3ModGhpcy5ub2Rlcyk7XG5cbiAgICAgIHJldHVybiBbdGhpcy5ub2RlcywgdGhpcy5saW5rc11cbiAgICB9XG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIHVwZGF0ZShzb3VyY2UpIFxuICAgIC8vIFRoZSBtYWluIGRyYXdpbmcgcm91dGluZS4gXG4gICAgLy8gVXBkYXRlcyB0aGUgU1ZHLCB1c2luZyBzb3VyY2UgKGEgTm9kZSkgYXMgdGhlIGZvY3VzIG9mIGFueSBlbnRlcmluZy9leGl0aW5nIGFuaW1hdGlvbnMuXG4gICAgLy9cbiAgICB1cGRhdGUgKHNvdXJjZSkge1xuICAgICAgLy9cbiAgICAgIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIHRoaXMuZWRpdFZpZXcubmFtZSk7XG5cbiAgICAgIGQzLnNlbGVjdChcIiN1bmRvQnV0dG9uXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHRoaXMudW5kb01nci5jYW5VbmRvKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy51bmRvTWdyLmNhblVuZG8gJiYgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy51bmRvTWdyLnVuZG9TdGF0ZSgpLCB0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGQzLnNlbGVjdChcIiNyZWRvQnV0dG9uXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHRoaXMudW5kb01nci5jYW5SZWRvKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy51bmRvTWdyLmNhblJlZG8gJiYgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy51bmRvTWdyLnJlZG9TdGF0ZSgpLCB0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgIC8vXG4gICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgICB0aGlzLnVwZGF0ZU5vZGVzKHRoaXMubm9kZXMsIHNvdXJjZSk7XG4gICAgICB0aGlzLnVwZGF0ZUxpbmtzKHRoaXMubGlua3MsIHNvdXJjZSk7XG4gICAgICB0aGlzLnVwZGF0ZVR0ZXh0KHRoaXMuY3VyclRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIHVwZGF0ZU5vZGVzIChub2Rlcywgc291cmNlKSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBsZXQgbm9kZUdycHMgPSB0aGlzLnZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgICAgIC5kYXRhKG5vZGVzLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLmlkIHx8IChuLmlkID0gKytpKTsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICAgICAgbGV0IG5vZGVFbnRlciA9IG5vZGVHcnBzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsIG4gPT4gbi5wYXRoLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVncm91cFwiKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLngwICsgXCIsXCIgKyBzb3VyY2UueTAgKyBcIilcIjsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIGxldCBjbGlja05vZGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjsgXG4gICAgICAgICAgaWYgKHNlbGYuZGlhbG9nLmN1cnJOb2RlICE9PSBuKSBzZWxmLmRpYWxvZy5zaG93KG4sIHRoaXMpO1xuICAgICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfTtcbiAgICAgIC8vIEFkZCBnbHlwaCBmb3IgdGhlIG5vZGVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgbGV0IHNoYXBlID0gKGQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiID8gXCJyZWN0XCIgOiBcImNpcmNsZVwiKTtcbiAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgc2hhcGUpO1xuICAgICAgICB9KVxuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVcIilcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBjbGlja05vZGUpO1xuICAgICAgbm9kZUVudGVyLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICAgICAgO1xuICAgICAgbm9kZUVudGVyLnNlbGVjdChcInJlY3RcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgLTguNSlcbiAgICAgICAgICAuYXR0cihcInlcIiwgLTguNSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBBZGQgdGV4dCBmb3Igbm9kZSBuYW1lXG4gICAgICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5jaGlsZHJlbiA/IC0xMCA6IDEwOyB9KVxuICAgICAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxuICAgICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KSAvLyBzdGFydCBvZmYgbmVhcmx5IHRyYW5zcGFyZW50XG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZU5hbWVcIilcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFBsYWNlaG9sZGVyIGZvciBpY29uL3RleHQgdG8gYXBwZWFyIGluc2lkZSBub2RlXG4gICAgICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbm9kZUljb24nKVxuICAgICAgICAgIC5hdHRyKCdkeScsIDUpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBBZGQgbm9kZSBoYW5kbGVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdoYW5kbGUnKVxuICAgICAgICAgIC5hdHRyKCdkeCcsIDEwKVxuICAgICAgICAgIC5hdHRyKCdkeScsIDUpXG4gICAgICAgICAgO1xuXG4gICAgICBsZXQgbm9kZVVwZGF0ZSA9IG5vZGVHcnBzXG4gICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBuID0+IG4uaXNTZWxlY3RlZClcbiAgICAgICAgICAuY2xhc3NlZChcImNvbnN0cmFpbmVkXCIsIG4gPT4gbi5jb25zdHJhaW50cy5sZW5ndGggPiAwKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGVkXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5sZXZlbCA+PSAwKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGVkYXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRlZGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgICAgICAgLy8gVHJhbnNpdGlvbiBub2RlcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIG4ueCArIFwiLFwiICsgbi55ICsgXCIpXCI7IH0pXG4gICAgICAgICAgO1xuXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcInRleHQuaGFuZGxlXCIpXG4gICAgICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgdGhpcy5lZGl0Vmlldy5oYW5kbGVJY29uLmZvbnRGYW1pbHkgfHwgbnVsbClcbiAgICAgICAgICAudGV4dCh0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24udGV4dCB8fCBcIlwiKSBcbiAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCB0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24uc3Ryb2tlIHx8IG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi5maWxsIHx8IG51bGwpO1xuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0Lm5vZGVJY29uXCIpXG4gICAgICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgdGhpcy5lZGl0Vmlldy5ub2RlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAgICAgLnRleHQodGhpcy5lZGl0Vmlldy5ub2RlSWNvbi50ZXh0IHx8IFwiXCIpIFxuICAgICAgICAgIDtcblxuICAgICAgZDMuc2VsZWN0QWxsKFwiLm5vZGVJY29uXCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgY2xpY2tOb2RlKTtcblxuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3RBbGwoXCJ0ZXh0Lm5vZGVOYW1lXCIpXG4gICAgICAgICAgLnRleHQobiA9PiBuLm5hbWUpO1xuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gTWFrZSBzZWxlY3RlZCBub2RlcyBkcmFnZ2FibGUuXG4gICAgICAvLyBDbGVhciBvdXQgYWxsIGV4aXRpbmcgZHJhZyBoYW5kbGVyc1xuICAgICAgZDMuc2VsZWN0QWxsKFwiZy5ub2RlZ3JvdXBcIilcbiAgICAgICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCBmYWxzZSlcbiAgICAgICAgICAub24oXCIuZHJhZ1wiLCBudWxsKTsgXG4gICAgICAvLyBOb3cgbWFrZSBldmVyeXRoaW5nIGRyYWdnYWJsZSB0aGF0IHNob3VsZCBiZVxuICAgICAgaWYgKHRoaXMuZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgICAgIGQzLnNlbGVjdEFsbCh0aGlzLmVkaXRWaWV3LmRyYWdnYWJsZSlcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgLmNhbGwodGhpcy5kcmFnQmVoYXZpb3IpO1xuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgLy8gQWRkIHRleHQgZm9yIGNvbnN0cmFpbnRzXG4gICAgICBsZXQgY3QgPSBub2RlR3Jwcy5zZWxlY3RBbGwoXCJ0ZXh0LmNvbnN0cmFpbnRcIilcbiAgICAgICAgICAuZGF0YShmdW5jdGlvbihuKXsgcmV0dXJuIG4uY29uc3RyYWludHM7IH0pO1xuICAgICAgY3QuZW50ZXIoKS5hcHBlbmQoXCJzdmc6dGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb25zdHJhaW50XCIpO1xuICAgICAgY3QuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgY3QudGV4dCggYyA9PiBjLmxhYmVsVGV4dCApXG4gICAgICAgICAgIC5hdHRyKFwieFwiLCAwKVxuICAgICAgICAgICAuYXR0cihcImR5XCIsIChjLGkpID0+IGAkeyhpKzEpKjEuN31lbWApXG4gICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIixcInN0YXJ0XCIpXG4gICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIGZ1bGwgc2l6ZVxuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgICAgICAuYXR0cihcInJcIiwgOC41IClcbiAgICAgICAgICA7XG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcInJlY3RcIilcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDE3IClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAxNyApXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gZnVsbHkgb3BhcXVlXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcInRleHRcIilcbiAgICAgICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vXG4gICAgICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgICAgIGxldCBub2RlRXhpdCA9IG5vZGVHcnBzLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54ICsgXCIsXCIgKyBzb3VyY2UueSArIFwiKVwiOyB9KVxuICAgICAgICAgIC5yZW1vdmUoKVxuICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiBjaXJjbGVzIHRvIHRpbnkgcmFkaXVzXG4gICAgICBub2RlRXhpdC5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgICAgICAuYXR0cihcInJcIiwgMWUtNilcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gdGV4dCB0byB0cmFuc3BhcmVudFxuICAgICAgbm9kZUV4aXQuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KVxuICAgICAgICAgIDtcbiAgICAgIC8vIFN0YXNoIHRoZSBvbGQgcG9zaXRpb25zIGZvciB0cmFuc2l0aW9uLlxuICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgIGQueDAgPSBkLng7XG4gICAgICAgIGQueTAgPSBkLnk7XG4gICAgICB9KTtcbiAgICAgIC8vXG5cbiAgICB9XG5cbiAgICAvL1xuICAgIHVwZGF0ZUxpbmtzIChsaW5rcywgc291cmNlKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGxldCBsaW5rID0gdGhpcy52aXMuc2VsZWN0QWxsKFwicGF0aC5saW5rXCIpXG4gICAgICAgICAgLmRhdGEobGlua3MsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0LmlkOyB9KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gRW50ZXIgYW55IG5ldyBsaW5rcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gICAgICBsZXQgbmV3UGF0aHMgPSBsaW5rLmVudGVyKCkuaW5zZXJ0KFwic3ZnOnBhdGhcIiwgXCJnXCIpO1xuICAgICAgbGV0IGxpbmtUaXRsZSA9IGZ1bmN0aW9uKGwpe1xuICAgICAgICAgIGxldCBjbGljayA9IFwiXCI7XG4gICAgICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpe1xuICAgICAgICAgICAgICBjbGljayA9IGBDbGljayB0byBtYWtlIHRoaXMgcmVsYXRpb25zaGlwICR7bC50YXJnZXQuam9pbiA/IFwiUkVRVUlSRURcIiA6IFwiT1BUSU9OQUxcIn0uIGA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBhbHRjbGljayA9IFwiQWx0LWNsaWNrIHRvIGN1dCBsaW5rLlwiO1xuICAgICAgICAgIHJldHVybiBjbGljayArIGFsdGNsaWNrO1xuICAgICAgfVxuICAgICAgLy8gc2V0IHRoZSB0b29sdGlwXG4gICAgICBuZXdQYXRocy5hcHBlbmQoXCJzdmc6dGl0bGVcIikudGV4dChsaW5rVGl0bGUpO1xuICAgICAgbmV3UGF0aHNcbiAgICAgICAgICAuYXR0cihcInRhcmdldFwiLCBkID0+IGQudGFyZ2V0LmlkLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIilcbiAgICAgICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgbGV0IG8gPSB7eDogc291cmNlLngwLCB5OiBzb3VyY2UueTB9O1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2xhc3NlZChcImF0dHJpYnV0ZVwiLCBmdW5jdGlvbihsKSB7IHJldHVybiBsLnRhcmdldC5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiOyB9KVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGwpeyBcbiAgICAgICAgICAgICAgaWYgKGQzLmV2ZW50LmFsdEtleSkge1xuICAgICAgICAgICAgICAgICAgLy8gYSBzaGlmdC1jbGljayBjdXRzIHRoZSB0cmVlIGF0IHRoaXMgZWRnZVxuICAgICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVOb2RlKGwudGFyZ2V0KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgLy8gcmVndWxhciBjbGljayBvbiBhIHJlbGF0aW9uc2hpcCBlZGdlIGludmVydHMgd2hldGhlclxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGpvaW4gaXMgaW5uZXIgb3Igb3V0ZXIuIFxuICAgICAgICAgICAgICAgICAgbC50YXJnZXQuam9pbiA9IChsLnRhcmdldC5qb2luID8gbnVsbCA6IFwib3V0ZXJcIik7XG4gICAgICAgICAgICAgICAgICAvLyByZS1zZXQgdGhlIHRvb2x0aXBcbiAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJ0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICAgICAgICAgICAgICAvLyBpZiBvdXRlciBqb2luLCByZW1vdmUgYW55IHNvcnQgb3JkZXJzIGluIG4gb3IgZGVzY2VuZGFudHNcbiAgICAgICAgICAgICAgICAgIGlmIChsLnRhcmdldC5qb2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IHJzbyA9IGZ1bmN0aW9uKG0pIHsgLy8gcmVtb3ZlIHNvcnQgb3JkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbS5zZXRTb3J0KFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jaGlsZHJlbi5mb3JFYWNoKHJzbyk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJzbyhsLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKGwuc291cmNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuYXR0cihcImRcIiwgdGhpcy5kaWFnb25hbClcbiAgICAgICAgICA7XG4gICAgIFxuICAgICAgXG4gICAgICAvLyBUcmFuc2l0aW9uIGxpbmtzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAgIGxpbmsuY2xhc3NlZChcIm91dGVyXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4udGFyZ2V0LmpvaW4gPT09IFwib3V0ZXJcIjsgfSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgLmF0dHIoXCJkXCIsIHRoaXMuZGlhZ29uYWwpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgICAgIGxpbmsuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBsZXQgbyA9IHt4OiBzb3VyY2UueCwgeTogc291cmNlLnl9O1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAucmVtb3ZlKClcbiAgICAgICAgICA7XG5cbiAgICB9XG4gICAgLy9cbiAgICB1cGRhdGVUdGV4dCAodCkge1xuICAgICAgLy9cbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGxldCB0aXRsZSA9IHRoaXMudmlzLnNlbGVjdEFsbChcIiNxdGl0bGVcIilcbiAgICAgICAgICAuZGF0YShbdGhpcy5jdXJyVGVtcGxhdGUudGl0bGVdKTtcbiAgICAgIHRpdGxlLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsXCJxdGl0bGVcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgLTQwKVxuICAgICAgICAgIC5hdHRyKFwieVwiLCAxNSlcbiAgICAgICAgICA7XG4gICAgICB0aXRsZS5odG1sKHQgPT4ge1xuICAgICAgICAgIGxldCBwYXJ0cyA9IHQuc3BsaXQoLygtLT4pLyk7XG4gICAgICAgICAgcmV0dXJuIHBhcnRzLm1hcCgocCxpKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwID09PSBcIi0tPlwiKSBcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9MTAgZm9udC1mYW1pbHk9XCJNYXRlcmlhbCBJY29uc1wiPiR7Y29kZXBvaW50c1snZm9yd2FyZCddfTwvdHNwYW4+YFxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYDx0c3BhbiB5PTQ+JHtwfTwvdHNwYW4+YFxuICAgICAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgICB9KTtcblxuICAgICAgLy9cbiAgICAgIGxldCB0eHQgPSBkMy5zZWxlY3QoXCIjdHRleHRcIikuY2xhc3NlZChcImpzb25cIikgPyB0LmdldEpzb24oKSA6IHQuZ2V0WG1sKCk7XG4gICAgICAvL1xuICAgICAgLy9cbiAgICAgIGQzLnNlbGVjdChcIiN0dGV4dGRpdlwiKSBcbiAgICAgICAgICAudGV4dCh0eHQpXG4gICAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgc2VsZWN0VGV4dChcInR0ZXh0ZGl2XCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9uKFwiYmx1clwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAvL1xuICAgICAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgICAgICBzZWxmLnVwZGF0ZUNvdW50KHQpO1xuICAgIH1cblxuICAgIHJ1bmF0bWluZSAodCkge1xuICAgICAgbGV0IHVjdCA9IHQudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgIGxldCB0eHQgPSB0LmdldFhtbCgpO1xuICAgICAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudCh0eHQpO1xuICAgICAgbGV0IGxpbmt1cmwgPSB0aGlzLmN1cnJNaW5lLnVybCArIFwiL2xvYWRRdWVyeS5kbz90cmFpbD0lN0NxdWVyeSZtZXRob2Q9eG1sXCI7XG4gICAgICBsZXQgZWRpdHVybCA9IGxpbmt1cmwgKyBcIiZxdWVyeT1cIiArIHVybFR4dDtcbiAgICAgIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgICAgIHdpbmRvdy5vcGVuKCBkMy5ldmVudC5hbHRLZXkgPyBlZGl0dXJsIDogcnVudXJsLCAnX2JsYW5rJyApO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvdW50ICh0KSB7XG4gICAgICBsZXQgdWN0ID0gdC51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICAgICAgbGV0IHF0eHQgPSB0LmdldFhtbCh0cnVlKTtcbiAgICAgIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gICAgICBsZXQgY291bnRVcmwgPSB0aGlzLmN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJydW5uaW5nXCIsIHRydWUpO1xuICAgICAgZDNqc29uUHJvbWlzZShjb3VudFVybClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCBmYWxzZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IHNwYW4nKS50ZXh0KG4pXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwiZXJyb3JcIiwgdHJ1ZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IFFCRWRpdG9yIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBVbmRvTWFuYWdlciBtYWludGFpbnMgYSBoaXN0b3J5IHN0YWNrIG9mIHN0YXRlcyAoYXJiaXRyYXJ5IG9iamVjdHMpLlxuLy9cbmNsYXNzIFVuZG9NYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihsaW1pdCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIGNsZWFyICgpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgICAgIHRoaXMucG9pbnRlciA9IC0xO1xuICAgIH1cbiAgICBnZXQgY3VycmVudFN0YXRlICgpIHtcbiAgICAgICAgaWYgKHRoaXMucG9pbnRlciA8IDApXG4gICAgICAgICAgICB0aHJvdyBcIk5vIGN1cnJlbnQgc3RhdGUuXCI7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgZ2V0IGhhc1N0YXRlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+PSAwO1xuICAgIH1cbiAgICBnZXQgY2FuVW5kbyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPiAwO1xuICAgIH1cbiAgICBnZXQgY2FuUmVkbyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1N0YXRlICYmIHRoaXMucG9pbnRlciA8IHRoaXMuaGlzdG9yeS5sZW5ndGgtMTtcbiAgICB9XG4gICAgYWRkIChzKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJBRERcIik7XG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXSA9IHM7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5zcGxpY2UodGhpcy5wb2ludGVyKzEpO1xuICAgIH1cbiAgICB1bmRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlVORE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuVW5kbykgdGhyb3cgXCJObyB1bmRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciAtPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIHJlZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiUkVET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5SZWRvKSB0aHJvdyBcIk5vIHJlZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzYXZlU3RhdGUgKG4pIHtcbiAgICAgICAgbGV0IHMgPSBKU09OLnN0cmluZ2lmeShuLnRlbXBsYXRlLnVuY29tcGlsZVRlbXBsYXRlKCkpO1xuICAgICAgICBpZiAoIXRoaXMuaGFzU3RhdGUgfHwgdGhpcy5jdXJyZW50U3RhdGUgIT09IHMpXG4gICAgICAgICAgICAvLyBvbmx5IHNhdmUgc3RhdGUgaWYgaXQgaGFzIGNoYW5nZWRcbiAgICAgICAgICAgIHRoaXMuYWRkKHMpO1xuICAgIH1cbiAgICB1bmRvU3RhdGUgKCkge1xuICAgICAgICB0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnVuZG8oKSk7IH1cbiAgICAgICAgY2F0Y2ggKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gICAgfVxuICAgIHJlZG9TdGF0ZSAoKSB7XG4gICAgICAgIHRyeSB7IHJldHVybiBKU09OLnBhcnNlKHRoaXMucmVkbygpKTsgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7IGNvbnNvbGUubG9nKGVycik7IH1cbiAgICB9XG59XG5cbi8vXG5mdW5jdGlvbiB1bmRvKCkgeyB1bmRvcmVkbyhcInVuZG9cIikgfVxuZnVuY3Rpb24gcmVkbygpIHsgdW5kb3JlZG8oXCJyZWRvXCIpIH1cbmZ1bmN0aW9uIHVuZG9yZWRvKHdoaWNoKXtcbn1cblxuZXhwb3J0IHsgVW5kb01hbmFnZXIgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGVzYywgZGVlcGMgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4vbm9kZS5qcyc7XG5pbXBvcnQgeyBDb25zdHJhaW50IH0gZnJvbSAnLi9jb25zdHJhaW50LmpzJztcblxuY2xhc3MgVGVtcGxhdGUge1xuICAgIGNvbnN0cnVjdG9yICh0LCBtb2RlbCkge1xuICAgICAgICB0ID0gdCB8fCB7fVxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIHRoaXMubmFtZSA9IHQubmFtZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLnRpdGxlID0gdC50aXRsZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSB0LnNlbGVjdCA/IGRlZXBjKHQuc2VsZWN0KSA6IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gdC53aGVyZSA/IHQud2hlcmUubWFwKCBjID0+IHtcbiAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpIDtcbiAgICAgICAgICAgIGNjLm5vZGUgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGNjO1xuICAgICAgICB9KSA6IFtdO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCI7XG4gICAgICAgIHRoaXMuam9pbnMgPSB0LmpvaW5zID8gZGVlcGModC5qb2lucykgOiBbXTtcbiAgICAgICAgdGhpcy50YWdzID0gdC50YWdzID8gZGVlcGModC50YWdzKSA6IFtdO1xuICAgICAgICB0aGlzLm9yZGVyQnkgPSB0Lm9yZGVyQnkgPyBkZWVwYyh0Lm9yZGVyQnkpIDogW107XG4gICAgICAgIHRoaXMuY29tcGlsZSgpO1xuICAgIH1cblxuICAgIGNvbXBpbGUgKCkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCByb290cyA9IFtdXG4gICAgICAgIGxldCB0ID0gdGhpcztcbiAgICAgICAgLy8gdGhlIHRyZWUgb2Ygbm9kZXMgcmVwcmVzZW50aW5nIHRoZSBjb21waWxlZCBxdWVyeSB3aWxsIGdvIGhlcmVcbiAgICAgICAgdC5xdHJlZSA9IG51bGw7XG4gICAgICAgIC8vIGluZGV4IG9mIGNvZGUgdG8gY29uc3RyYWludCBnb3JzIGhlcmUuXG4gICAgICAgIHQuY29kZTJjID0ge31cbiAgICAgICAgLy8gbm9ybWFsaXplIHRoaW5ncyB0aGF0IG1heSBiZSB1bmRlZmluZWRcbiAgICAgICAgdC5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgICAgIHQuZGVzY3JpcHRpb24gPSB0LmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBzdWJjbGFzc0NzID0gW107XG4gICAgICAgIHQud2hlcmUgPSAodC53aGVyZSB8fCBbXSkubWFwKGMgPT4ge1xuICAgICAgICAgICAgLy8gY29udmVydCByYXcgY29udHJhaW50IGNvbmZpZ3MgdG8gQ29uc3RyYWludCBvYmplY3RzLlxuICAgICAgICAgICAgbGV0IGNjID0gbmV3IENvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICBpZiAoY2MuY29kZSkgdC5jb2RlMmNbY2MuY29kZV0gPSBjYztcbiAgICAgICAgICAgIGNjLmN0eXBlID09PSBcInN1YmNsYXNzXCIgJiYgc3ViY2xhc3NDcy5wdXNoKGNjKTtcbiAgICAgICAgICAgIHJldHVybiBjYztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gbXVzdCBwcm9jZXNzIGFueSBzdWJjbGFzcyBjb25zdHJhaW50cyBmaXJzdCwgZnJvbSBzaG9ydGVzdCB0byBsb25nZXN0IHBhdGhcbiAgICAgICAgc3ViY2xhc3NDc1xuICAgICAgICAgICAgLnNvcnQoZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wYXRoLmxlbmd0aCAtIGIucGF0aC5sZW5ndGg7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGMucGF0aCk7XG4gICAgICAgICAgICAgICAgIGxldCBjbHMgPSBzZWxmLm1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgoYy5wYXRoKTtcbiAgICAgICAgICAgIGlmIChuLmNvbnN0cmFpbnRzKVxuICAgICAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG4uY29uc3RyYWludHMgPSBbY107XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy9cbiAgICAgICAgdC5zZWxlY3QgJiYgdC5zZWxlY3QuZm9yRWFjaChmdW5jdGlvbihwLGkpe1xuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBuLnNlbGVjdCgpO1xuICAgICAgICB9KVxuICAgICAgICB0LmpvaW5zICYmIHQuam9pbnMuZm9yRWFjaChmdW5jdGlvbihqKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGopO1xuICAgICAgICAgICAgbi5qb2luID0gXCJvdXRlclwiO1xuICAgICAgICB9KVxuICAgICAgICB0Lm9yZGVyQnkgJiYgdC5vcmRlckJ5LmZvckVhY2goZnVuY3Rpb24obywgaSl7XG4gICAgICAgICAgICBsZXQgcCA9IE9iamVjdC5rZXlzKG8pWzBdXG4gICAgICAgICAgICBsZXQgZGlyID0gb1twXVxuICAgICAgICAgICAgbGV0IG4gPSB0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBuLnNvcnQgPSB7IGRpcjogZGlyLCBsZXZlbDogaSB9O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0LnF0cmVlKSB7XG4gICAgICAgICAgICB0aHJvdyBcIk5vIHBhdGhzIGluIHF1ZXJ5LlwiXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdGVtcGxhdGUgYXMgYSBzaW1wbGUganNvbiBvYmplY3QuXG4gICAgLy9cbiAgICB1bmNvbXBpbGVUZW1wbGF0ZSAoKXtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgbGV0IHQgPSB7XG4gICAgICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgICAgICBtb2RlbDogeyBuYW1lOiB0bXBsdC5tb2RlbC5uYW1lIH0sXG4gICAgICAgICAgICB0YWdzOiBkZWVwYyh0bXBsdC50YWdzKSxcbiAgICAgICAgICAgIHNlbGVjdCA6IHRtcGx0LnNlbGVjdC5jb25jYXQoKSxcbiAgICAgICAgICAgIHdoZXJlIDogW10sXG4gICAgICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICAgICAgY29uc3RyYWludExvZ2ljOiB0bXBsdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIixcbiAgICAgICAgICAgIG9yZGVyQnkgOiBbXVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlYWNoKG4pe1xuICAgICAgICAgICAgbGV0IHAgPSBuLnBhdGhcbiAgICAgICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHNob3VsZCBhbHJlYWR5IGJlIHRoZXJlXG4gICAgICAgICAgICAgICAgaWYgKHQuc2VsZWN0LmluZGV4T2Yobi5wYXRoKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIChuLmNvbnN0cmFpbnRzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICAgICAgY2Mubm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgIHQud2hlcmUucHVzaChjYylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAobi5qb2luID09PSBcIm91dGVyXCIpIHtcbiAgICAgICAgICAgICAgICB0LmpvaW5zLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHMgPSB7fVxuICAgICAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlYWNoKTtcbiAgICAgICAgfVxuICAgICAgICByZWFjaCh0bXBsdC5xdHJlZSk7XG4gICAgICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICAgICAgcmV0dXJuIHRcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBOb2RlIGF0IHBhdGggcCwgb3IgbnVsbCBpZiB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY3VycmVudCBxdHJlZS5cbiAgICAvL1xuICAgIGdldE5vZGVCeVBhdGggKHApIHtcbiAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICBpZiAoIXApIHJldHVybiBudWxsO1xuICAgICAgICBsZXQgcGFydHMgPSBwLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnF0cmVlO1xuICAgICAgICBpZiAobi5uYW1lICE9PSBwYXJ0c1swXSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGNuYW1lID0gcGFydHNbaV07XG4gICAgICAgICAgICBsZXQgYyA9IChuLmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoeCA9PiB4Lm5hbWUgPT09IGNuYW1lKVswXTtcbiAgICAgICAgICAgIGlmICghYykgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBuID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG5cbiAgICAvLyBBZGRzIGEgcGF0aCB0byB0aGUgcXRyZWUgZm9yIHRoaXMgdGVtcGxhdGUuIFBhdGggaXMgc3BlY2lmaWVkIGFzIGEgZG90dGVkIGxpc3Qgb2YgbmFtZXMuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHBhdGggKHN0cmluZykgdGhlIHBhdGggdG8gYWRkLiBcbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgbGFzdCBwYXRoIGNvbXBvbmVudCBjcmVhdGVkLiBcbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBDcmVhdGVzIG5ldyBub2RlcyBhcyBuZWVkZWQgYW5kIGFkZHMgdGhlbSB0byB0aGUgcXRyZWUuXG4gICAgYWRkUGF0aCAocGF0aCl7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBjbGFzc2VzID0gdGhpcy5tb2RlbC5jbGFzc2VzO1xuICAgICAgICBsZXQgbGFzdHQgPSBudWxsO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIGxldCBjbHM7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgICAgICBsZXQgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGUgXG4gICAgICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5yZWZlcmVuY2VzW3BdIHx8IGNscy5jb2xsZWN0aW9uc1twXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNscyA9IGNsYXNzZXNbeC5yZWZlcmVuY2VkVHlwZV0gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgbWVtYmVyIG5hbWVkIFwiICsgcCArIFwiIGluIGNsYXNzIFwiICsgY2xzLm5hbWUgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IG5vZGUsIGFkZCBpdCB0byBuJ3MgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgbm4gPSBuZXcgTm9kZSh0ZW1wbGF0ZSwgbiwgcCwgeCwgY2xzKTtcbiAgICAgICAgICAgICAgICAgICAgbiA9IG5uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyByZXR1cm4gdGhlIGxhc3Qgbm9kZSBpbiB0aGUgcGF0aFxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gXG4gICAgLy8gUmV0dXJucyBhIHNpbmdsZSBjaGFyYWN0ZXIgY29uc3RyYWludCBjb2RlIGluIHRoZSByYW5nZSBBLVogdGhhdCBpcyBub3QgYWxyZWFkeVxuICAgIC8vIHVzZWQgaW4gdGhlIGdpdmVuIHRlbXBsYXRlLlxuICAgIC8vXG4gICAgbmV4dEF2YWlsYWJsZUNvZGUgKCl7XG4gICAgICAgIGZvcihsZXQgaT0gXCJBXCIuY2hhckNvZGVBdCgwKTsgaSA8PSBcIlpcIi5jaGFyQ29kZUF0KDApOyBpKyspe1xuICAgICAgICAgICAgbGV0IGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgICAgICAgaWYgKCEgKGMgaW4gdGhpcy5jb2RlMmMpKVxuICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuXG5cbiAgICAvLyBTZXRzIHRoZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJlc3Npb24gZm9yIHRoaXMgdGVtcGxhdGUuXG4gICAgLy8gSW4gdGhlIHByb2Nlc3MsIGFsc28gXCJjb3JyZWN0c1wiIHRoZSBleHByZXNzaW9uIGFzIGZvbGxvd3M6XG4gICAgLy8gICAgKiBhbnkgY29kZXMgaW4gdGhlIGV4cHJlc3Npb24gdGhhdCBhcmUgbm90IGFzc29jaWF0ZWQgd2l0aFxuICAgIC8vICAgICAgYW55IGNvbnN0cmFpbnQgaW4gdGhlIGN1cnJlbnQgdGVtcGxhdGUgYXJlIHJlbW92ZWQgYW5kIHRoZVxuICAgIC8vICAgICAgZXhwcmVzc2lvbiBsb2dpYyB1cGRhdGVkIGFjY29yZGluZ2x5XG4gICAgLy8gICAgKiBhbmQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHRoYXQgYXJlIG5vdCBpbiB0aGUgZXhwcmVzc2lvblxuICAgIC8vICAgICAgYXJlIEFORGVkIHRvIHRoZSBlbmQuXG4gICAgLy8gRm9yIGV4YW1wbGUsIGlmIHRoZSBjdXJyZW50IHRlbXBsYXRlIGhhcyBjb2RlcyBBLCBCLCBhbmQgQywgYW5kXG4gICAgLy8gdGhlIGV4cHJlc3Npb24gaXMgXCIoQSBvciBEKSBhbmQgQlwiLCB0aGUgRCBkcm9wcyBvdXQgYW5kIEMgaXNcbiAgICAvLyBhZGRlZCwgcmVzdWx0aW5nIGluIFwiQSBhbmQgQiBhbmQgQ1wiLiBcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuICAgIC8vICAgXG4gICAgc2V0TG9naWNFeHByZXNzaW9uIChleCkge1xuICAgICAgICBleCA9IGV4ID8gZXggOiAodGhpcy5jb25zdHJhaW50TG9naWMgfHwgXCJcIilcbiAgICAgICAgbGV0IGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICAgICAgbGV0IHNlZW4gPSBbXTtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgZnVuY3Rpb24gcmVhY2gobixsZXYpe1xuICAgICAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuIFxuICAgICAgICAgICAgICAgIC8vIElmIG5vdCwgcmVtb3ZlIGl0IGZyb20gdGhlIGV4cHIuXG4gICAgICAgICAgICAgICAgLy8gQWxzbyByZW1vdmUgaXQgaWYgaXQncyB0aGUgY29kZSBmb3IgYSBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgICAgICAgICAgICAgc2Vlbi5wdXNoKG4pO1xuICAgICAgICAgICAgICAgIHJldHVybiAobiBpbiB0bXBsdC5jb2RlMmMgJiYgdG1wbHQuY29kZTJjW25dLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpID8gbiA6IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY21zID0gbi5jaGlsZHJlbi5tYXAoZnVuY3Rpb24oYyl7cmV0dXJuIHJlYWNoKGMsIGxldisxKTt9KS5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHg7fSk7O1xuICAgICAgICAgICAgbGV0IGNtc3MgPSBjbXMuam9pbihcIiBcIituLm9wK1wiIFwiKTtcbiAgICAgICAgICAgIHJldHVybiBjbXMubGVuZ3RoID09PSAwID8gXCJcIiA6IGxldiA9PT0gMCB8fCBjbXMubGVuZ3RoID09PSAxID8gY21zcyA6IFwiKFwiICsgY21zcyArIFwiKVwiXG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFzdCA9IGV4ID8gcGFyc2VyLnBhcnNlKGV4KSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYWxlcnQoZXJyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbnRMb2dpYztcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBsZXQgbGV4ID0gYXN0ID8gcmVhY2goYXN0LDApIDogXCJcIjtcbiAgICAgICAgLy8gaWYgYW55IGNvbnN0cmFpbnQgY29kZXMgaW4gdGhlIHRlbXBsYXRlIHdlcmUgbm90IHNlZW4gaW4gdGhlIGV4cHJlc3Npb24sXG4gICAgICAgIC8vIEFORCB0aGVtIGludG8gdGhlIGV4cHJlc3Npb24gKGV4Y2VwdCBJU0EgY29uc3RyYWludHMpLlxuICAgICAgICBsZXQgdG9BZGQgPSBPYmplY3Qua2V5cyh0aGlzLmNvZGUyYykuZmlsdGVyKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgcmV0dXJuIHNlZW4uaW5kZXhPZihjKSA9PT0gLTEgJiYgYy5vcCAhPT0gXCJJU0FcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodG9BZGQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgIGlmKGFzdCAmJiBhc3Qub3AgJiYgYXN0Lm9wID09PSBcIm9yXCIpXG4gICAgICAgICAgICAgICAgIGxleCA9IGAoJHtsZXh9KWA7XG4gICAgICAgICAgICAgaWYgKGxleCkgdG9BZGQudW5zaGlmdChsZXgpO1xuICAgICAgICAgICAgIGxleCA9IHRvQWRkLmpvaW4oXCIgYW5kIFwiKTtcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRMb2dpYyA9IGxleDtcblxuICAgICAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGxleDsgfSk7XG5cbiAgICAgICAgcmV0dXJuIGxleDtcbiAgICB9XG4gXG4gICAgLy8gXG4gICAgZ2V0WG1sIChxb25seSkge1xuICAgICAgICBsZXQgdCA9IHRoaXMudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgICAgbGV0IHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7IFxuICAgICAgICAgICAgbGV0IGsgPSBPYmplY3Qua2V5cyh4KVswXTtcbiAgICAgICAgICAgIGxldCB2ID0geFtrXVxuICAgICAgICAgICAgcmV0dXJuIHMgKyBgJHtrfSAke3Z9IGA7XG4gICAgICAgIH0sIFwiXCIpO1xuXG4gICAgICAgIC8vIENvbnZlcnRzIGFuIG91dGVyIGpvaW4gcGF0aCB0byB4bWwuXG4gICAgICAgIGZ1bmN0aW9uIG9qMnhtbChvail7XG4gICAgICAgICAgICByZXR1cm4gYDxqb2luIHBhdGg9XCIke29qfVwiIHN0eWxlPVwiT1VURVJcIiAvPmA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGUgcXVlcnkgcGFydFxuICAgICAgICBsZXQgcXBhcnQgPSBcbiAgICBgPHF1ZXJ5XG4gICAgICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgICAgIG1vZGVsPVwiJHsodC5tb2RlbCAmJiB0Lm1vZGVsLm5hbWUpIHx8ICcnfVwiXG4gICAgICB2aWV3PVwiJHt0LnNlbGVjdC5qb2luKCcgJyl9XCJcbiAgICAgIGxvbmdEZXNjcmlwdGlvbj1cIiR7ZXNjKHQuZGVzY3JpcHRpb24gfHwgJycpfVwiXG4gICAgICBzb3J0T3JkZXI9XCIke3NvIHx8ICcnfVwiXG4gICAgICAke3QuY29uc3RyYWludExvZ2ljICYmICdjb25zdHJhaW50TG9naWM9XCInK3QuY29uc3RyYWludExvZ2ljKydcIicgfHwgJyd9XG4gICAgPlxuICAgICAgJHsodC5qb2lucyB8fCBbXSkubWFwKG9qMnhtbCkuam9pbihcIiBcIil9XG4gICAgICAkeyh0LndoZXJlIHx8IFtdKS5tYXAoYyA9PiBjLmMyeG1sKHFvbmx5KSkuam9pbihcIiBcIil9XG4gICAgPC9xdWVyeT5gO1xuICAgICAgICAvLyB0aGUgd2hvbGUgdGVtcGxhdGVcbiAgICAgICAgbGV0IHRtcGx0ID0gXG4gICAgYDx0ZW1wbGF0ZVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gICAgICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAgICAgJHtxcGFydH1cbiAgICA8L3RlbXBsYXRlPlxuICAgIGA7XG4gICAgICAgIHJldHVybiBxb25seSA/IHFwYXJ0IDogdG1wbHRcbiAgICB9XG5cbiAgICBnZXRKc29uICgpIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0LCBudWxsLCAyKTtcbiAgICB9XG5cbn0gLy8gZW5kIG9mIGNsYXNzIFRlbXBsYXRlXG5cbmV4cG9ydCB7IFRlbXBsYXRlIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy90ZW1wbGF0ZS5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBDb25zdHJhaW50IH0gZnJvbSAnLi9jb25zdHJhaW50LmpzJztcblxuLy9cbmNsYXNzIE5vZGUge1xuICAgIC8vIEFyZ3M6XG4gICAgLy8gICB0ZW1wbGF0ZSAoVGVtcGxhdGUgb2JqZWN0KSB0aGUgdGVtcGxhdGUgdGhhdCBvd25zIHRoaXMgbm9kZVxuICAgIC8vICAgcGFyZW50IChvYmplY3QpIFBhcmVudCBvZiB0aGUgbmV3IG5vZGUuXG4gICAgLy8gICBuYW1lIChzdHJpbmcpIE5hbWUgZm9yIHRoZSBub2RlXG4gICAgLy8gICBwY29tcCAob2JqZWN0KSBQYXRoIGNvbXBvbmVudCBmb3IgdGhlIHJvb3QsIHRoaXMgaXMgYSBjbGFzcy4gRm9yIG90aGVyIG5vZGVzLCBhbiBhdHRyaWJ1dGUsIFxuICAgIC8vICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uIGRlY3JpcHRvci5cbiAgICAvLyAgIHB0eXBlIChvYmplY3QpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsIG9yIGEgXCJsZWFmXCIgY2xhc3MgKGVnIGphdmEubGFuZy5TdHJpbmcpLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcblxuICAgICAgICB0aGlzLmpvaW4gPSBudWxsOyAvLyBpZiB0cnVlLCB0aGVuIHRoZSBsaW5rIGJldHdlZW4gbXkgcGFyZW50IGFuZCBtZSBpcyBhbiBvdXRlciBqb2luXG4gICAgICAgIFxuICAgICAgICB0aGlzLmlkID0gdGhpcy5wYXRoO1xuICAgIH1cbiAgICBnZXQgaXNSb290ICgpIHtcbiAgICAgICAgcmV0dXJuICEgdGhpcy5wYXJlbnQ7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gb3BlcmF0b3IgaXMgdmFsaWQgZm9yIHRoaXMgbm9kZS5cbiAgICBvcFZhbGlkIChvcCl7XG4gICAgICAgIGlmICh0aGlzLmlzUm9vdCAmJiAhb3AudmFsaWRGb3JSb290KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlIGlmICh0aGlzLnB0eXBlLmlzTGVhZlR5cGUpIHtcbiAgICAgICAgICAgIGlmKCEgb3AudmFsaWRGb3JBdHRyKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKHRoaXMucHR5cGUubmFtZSkgPT0gLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoISBvcC52YWxpZEZvckNsYXNzKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBsaXN0IGlzIHZhbGlkIGFzIGEgbGlzdCBjb25zdHJhaW50IG9wdGlvbiBmb3JcbiAgICAvLyB0aGUgbm9kZSBuLiBBIGxpc3QgaXMgdmFsaWQgdG8gdXNlIGluIGEgbGlzdCBjb25zdHJhaW50IGF0IG5vZGUgbiBpZmZcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgZXF1YWwgdG8gb3IgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGVcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgYSBzdXBlcmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZS4gSW4gdGhpcyBjYXNlLFxuICAgIC8vICAgICAgIGVsZW1lbnRzIGluIHRoZSBsaXN0IHRoYXQgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICAgYXJlIGF1dG9tYXRpY2FsbHkgZmlsdGVyZWQgb3V0LlxuICAgIGxpc3RWYWxpZCAobGlzdCl7XG4gICAgICAgIGxldCBudCA9IHRoaXMuc3VidHlwZUNvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICAgICAgaWYgKG50LmlzTGVhZlR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IGx0ID0gdGhpcy50ZW1wbGF0ZS5tb2RlbC5jbGFzc2VzW2xpc3QudHlwZV07XG4gICAgICAgIHJldHVybiBpc1N1YmNsYXNzKGx0LCBudCkgfHwgaXNTdWJjbGFzcyhudCwgbHQpO1xuICAgIH1cblxuXG4gICAgLy9cbiAgICBnZXQgcGF0aCAoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wYXRoICtcIi5cIiA6IFwiXCIpICsgdGhpcy5uYW1lO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBub2RlVHlwZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YmNsYXNzQ29uc3RyYWludCB8fCB0aGlzLnB0eXBlO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc0Jpb0VudGl0eSAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIGNrKGNscykge1xuICAgICAgICAgICAgLy8gc2ltcGxlIGF0dHJpYnV0ZSAtIG5vcGVcbiAgICAgICAgICAgIGlmIChjbHMuaXNMZWFmVHlwZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgLy8gQmlvRW50aXR5IC0geXVwXG4gICAgICAgICAgICBpZiAoY2xzLm5hbWUgPT09IFwiQmlvRW50aXR5XCIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgLy8gbmVpdGhlciAtIGNoZWNrIGFuY2VzdG9yc1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbHMuZXh0ZW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjayhjbHMuZXh0ZW5kc1tpXSkpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayh0aGlzLm5vZGVUeXBlKTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNTZWxlY3RlZCAoKSB7XG4gICAgICAgICByZXR1cm4gdGhpcy52aWV3ICE9PSBudWxsICYmIHRoaXMudmlldyAhPT0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBzZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIHRoaXMudmlldyA9IGkgPj0gMCA/IGkgOiAodC5zZWxlY3QucHVzaChwKSAtIDEpO1xuICAgIH1cbiAgICB1bnNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHBhdGggZnJvbSB0aGUgc2VsZWN0IGxpc3RcbiAgICAgICAgICAgIHQuc2VsZWN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgLy8gRklYTUU6IHJlbnVtYmVyIG5vZGVzIGhlcmVcbiAgICAgICAgICAgIHQuc2VsZWN0LnNsaWNlKGkpLmZvckVhY2goIChwLGopID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IHRoaXMudGVtcGxhdGUuZ2V0Tm9kZUJ5UGF0aChwKTtcbiAgICAgICAgICAgICAgICBuLnZpZXcgLT0gMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0cnVlIGlmZiB0aGlzIG5vZGUgY2FuIGJlIHNvcnRlZCBvbiwgd2hpY2ggaXMgdHJ1ZSBpZmYgdGhlIG5vZGUgaXMgYW5cbiAgICAvLyBhdHRyaWJ1dGUsIGFuZCB0aGVyZSBhcmUgbm8gb3V0ZXIgam9pbnMgYmV0d2VlbiBpdCBhbmQgdGhlIHJvb3RcbiAgICBjYW5Tb3J0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgbiA9IHRoaXM7XG4gICAgICAgIHdoaWxlIChuKSB7XG4gICAgICAgICAgICBpZiAobi5qb2luKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBuID0gbi5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc2V0U29ydChuZXdkaXIpe1xuICAgICAgICBsZXQgb2xkZGlyID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmRpciA6IFwibm9uZVwiO1xuICAgICAgICBsZXQgb2xkbGV2ID0gdGhpcy5zb3J0ID8gdGhpcy5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgIGxldCBtYXhsZXYgPSAtMTtcbiAgICAgICAgbGV0IHJlbnVtYmVyID0gZnVuY3Rpb24gKG4pe1xuICAgICAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCAmJiBuLnNvcnQubGV2ZWwgPiBvbGRsZXYpXG4gICAgICAgICAgICAgICAgICAgIG4uc29ydC5sZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIG1heGxldiA9IE1hdGgubWF4KG1heGxldiwgbi5zb3J0LmxldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZW51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFuZXdkaXIgfHwgbmV3ZGlyID09PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgLy8gc2V0IHRvIG5vdCBzb3J0ZWRcbiAgICAgICAgICAgIHRoaXMuc29ydCA9IG51bGw7XG4gICAgICAgICAgICBpZiAob2xkbGV2ID49IDApe1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgc29ydGVkIGJlZm9yZSwgbmVlZCB0byByZW51bWJlciBhbnkgZXhpc3Rpbmcgc29ydCBjZmdzLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0IHRvIHNvcnRlZFxuICAgICAgICAgICAgaWYgKG9sZGxldiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIG5vdCBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIGZpbmQgbmV4dCBsZXZlbC5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgICAgICBvbGRsZXYgPSBtYXhsZXYgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zb3J0ID0geyBkaXI6bmV3ZGlyLCBsZXZlbDogb2xkbGV2IH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXRzIHRoZSBzdWJjbGFzcyBjb25zdHJhaW50IGF0IHRoaXMgbm9kZSwgb3IgcmVtb3ZlcyBpdCBpZiBubyBzdWJjbGFzcyBnaXZlbi4gQSBub2RlIG1heVxuICAgIC8vIGhhdmUgZXhhY3RseSAwIG9yIDEgc3ViY2xhc3MgY29uc3RyYWludC4gQXNzdW1lcyB0aGUgc3ViY2xhc3MgaXMgYWN0dWFsbHkgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzXG4gICAgLy8gdHlwZSAoc2hvdWxkIGNoZWNrIHRoaXMpLlxuICAgIC8vXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIGMgKENvbnN0cmFpbnQpIFRoZSBzdWJjbGFzcyBDb25zdHJhaW50IG9yIG51bGwuIFNldHMgdGhlIHN1YmNsYXNzIGNvbnN0cmFpbnQgb24gdGhlIGN1cnJlbnQgbm9kZSB0b1xuICAgIC8vICAgICAgIHRoZSB0eXBlIG5hbWVkIGluIGMuIFJlbW92ZXMgdGhlIHByZXZpb3VzIHN1YmNsYXNzIGNvbnN0cmFpbnQgaWYgYW55LiBJZiBudWxsLCBqdXN0IHJlbW92ZXNcbiAgICAvLyAgICAgICBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgTGlzdCBvZiBhbnkgbm9kZXMgdGhhdCB3ZXJlIHJlbW92ZWQgYmVjYXVzZSB0aGUgbmV3IGNvbnN0cmFpbnQgY2F1c2VkIHRoZW0gdG8gYmVjb21lIGludmFsaWQuXG4gICAgLy9cbiAgICBzZXRTdWJjbGFzc0NvbnN0cmFpbnQgKGMpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzO1xuICAgICAgICAvLyByZW1vdmUgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgaWYgKGMgJiYgbi5jb25zdHJhaW50cy5pbmRleE9mKGMpID09PSAtMSlcbiAgICAgICAgICAgIG4uY29uc3RyYWludHMucHVzaChjKTtcbiAgICAgICAgbi5jb25zdHJhaW50cyA9IG4uY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uIChjYyl7IHJldHVybiBjYy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiIHx8IGNjID09PSBjOyB9KTtcbiAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsO1xuICAgICAgICBpZiAoYyl7XG4gICAgICAgICAgICAvLyBsb29rdXAgdGhlIHN1YmNsYXNzIG5hbWVcbiAgICAgICAgICAgIGxldCBjbHMgPSB0aGlzLnRlbXBsYXRlLm1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgIGlmKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAvLyBhZGQgdGhlIGNvbnN0cmFpbnRcbiAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICB9XG4gICAgICAgIC8vIGxvb2tzIGZvciBpbnZhbGlkYXRlZCBwYXRocyBcbiAgICAgICAgZnVuY3Rpb24gY2hlY2sobm9kZSwgcmVtb3ZlZCkge1xuICAgICAgICAgICAgbGV0IGNscyA9IG5vZGUuc3ViY2xhc3NDb25zdHJhaW50IHx8IG5vZGUucHR5cGU7XG4gICAgICAgICAgICBsZXQgYzIgPSBbXTtcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICBpZihjLm5hbWUgaW4gY2xzLmF0dHJpYnV0ZXMgfHwgYy5uYW1lIGluIGNscy5yZWZlcmVuY2VzIHx8IGMubmFtZSBpbiBjbHMuY29sbGVjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgYzIucHVzaChjKTtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2soYywgcmVtb3ZlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSBjMjtcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZW1vdmVkID0gY2hlY2sobixbXSk7XG4gICAgICAgIHJldHVybiByZW1vdmVkO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgdGhpcyBub2RlIGZyb20gdGhlIHF1ZXJ5LlxuICAgIHJlbW92ZSAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIGlmICghcCkgcmV0dXJuO1xuICAgICAgICAvLyBGaXJzdCwgcmVtb3ZlIGFsbCBjb25zdHJhaW50cyBvbiB0aGlzIG9yIGRlc2NlbmRhbnRzXG4gICAgICAgIGZ1bmN0aW9uIHJtYyAoeCkge1xuICAgICAgICAgICAgeC51bnNlbGVjdCgpO1xuICAgICAgICAgICAgeC5jb25zdHJhaW50cy5mb3JFYWNoKGMgPT4geC5yZW1vdmVDb25zdHJhaW50KGMpKTtcbiAgICAgICAgICAgIHguY2hpbGRyZW4uZm9yRWFjaChybWMpO1xuICAgICAgICB9XG4gICAgICAgIHJtYyh0aGlzKTtcbiAgICAgICAgLy8gTm93IHJlbW92ZSB0aGUgc3VidHJlZSBhdCBuLlxuICAgICAgICBwLmNoaWxkcmVuLnNwbGljZShwLmNoaWxkcmVuLmluZGV4T2YodGhpcyksIDEpO1xuICAgIH1cblxuICAgIC8vIEFkZHMgYSBuZXcgY29uc3RyYWludCB0byBhIG5vZGUgYW5kIHJldHVybnMgaXQuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIGMgKGNvbnN0cmFpbnQpIElmIGdpdmVuLCB1c2UgdGhhdCBjb25zdHJhaW50LiBPdGhlcndpc2UsIGNyZWF0ZSBkZWZhdWx0LlxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICBUaGUgbmV3IGNvbnN0cmFpbnQuXG4gICAgLy9cbiAgICBhZGRDb25zdHJhaW50IChjKSB7XG4gICAgICAgIGlmIChjKSB7XG4gICAgICAgICAgICAvLyBqdXN0IHRvIGJlIHN1cmVcbiAgICAgICAgICAgIGMubm9kZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgb3AgPSBPUElOREVYW3RoaXMucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIiA/IFwiPVwiIDogXCJMT09LVVBcIl07XG4gICAgICAgICAgICBjID0gbmV3IENvbnN0cmFpbnQoe25vZGU6dGhpcywgb3A6b3Aub3AsIGN0eXBlOiBvcC5jdHlwZX0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29uc3RyYWludHMucHVzaChjKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS53aGVyZS5wdXNoKGMpO1xuXG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3ViY2xhc3NDb25zdHJhaW50KGMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYy5jb2RlID0gdGhpcy50ZW1wbGF0ZS5uZXh0QXZhaWxhYmxlQ29kZSgpO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXSA9IGM7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cblxuICAgIHJlbW92ZUNvbnN0cmFpbnQgKGMpe1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gdGhpcy5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLndoZXJlID0gdGhpcy50ZW1wbGF0ZS53aGVyZS5maWx0ZXIoZnVuY3Rpb24oY2MpeyByZXR1cm4gY2MgIT09IGM7IH0pO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgdGhpcy5zZXRTdWJjbGFzc0NvbnN0cmFpbnQobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE5vZGVcblxuZXhwb3J0IHsgTm9kZSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbm9kZS5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgZDNqc29uUHJvbWlzZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgcmVnaXN0cnlVcmwgPSBcImh0dHA6Ly9yZWdpc3RyeS5pbnRlcm1pbmUub3JnL3NlcnZpY2UvaW5zdGFuY2VzXCI7XG5sZXQgcmVnaXN0cnlGaWxlVXJsID0gXCIuL3Jlc291cmNlcy90ZXN0ZGF0YS9yZWdpc3RyeS5qc29uXCI7XG5cbmZ1bmN0aW9uIGluaXRSZWdpc3RyeSAoY2IpIHtcbiAgICByZXR1cm4gZDNqc29uUHJvbWlzZShyZWdpc3RyeVVybClcbiAgICAgIC50aGVuKGNiKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBhbGVydChgQ291bGQgbm90IGFjY2VzcyByZWdpc3RyeSBhdCAke3JlZ2lzdHJ5VXJsfS4gVHJ5aW5nICR7cmVnaXN0cnlGaWxlVXJsfS5gKTtcbiAgICAgICAgICBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5RmlsZVVybClcbiAgICAgICAgICAgICAgLnRoZW4oY2IpXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBhbGVydChcIkNhbm5vdCBhY2Nlc3MgcmVnaXN0cnkgZmlsZS4gVGhpcyBpcyBub3QgeW91ciBsdWNreSBkYXkuXCIpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbn1cblxuZXhwb3J0IHsgaW5pdFJlZ2lzdHJ5IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9yZWdpc3RyeS5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHtjb2RlcG9pbnRzfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5cbmxldCBlZGl0Vmlld3MgPSB7IHF1ZXJ5TWFpbjoge1xuICAgICAgICBuYW1lOiBcInF1ZXJ5TWFpblwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCIsXG4gICAgICAgIG5vZGVDb21wOiBudWxsLFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3Ryb2tlOiBcIiNlMjhiMjhcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICB9XG4gICAgfSxcbiAgICBjb2x1bW5PcmRlcjoge1xuICAgICAgICBuYW1lOiBcImNvbHVtbk9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNlbGVjdGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbHVtbiBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzZWxlY3Rpb24tbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuaXNTZWxlY3RlZClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IGEudmlldyAtIGIudmlldyA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBkcmFnIGluIGNvbHVtbk9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgY29sdW1uIG9yZGVyIChkdWghKVxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7IG4udmlldyA9IGkgfSk7XG4gICAgICAgICAgZHJhZ2dlZC50ZW1wbGF0ZS5zZWxlY3QgPSBub2Rlcy5tYXAoIG49PiBuLnBhdGggKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IG51bGwsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IG4udmlldyA6IFwiXCJcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc29ydE9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwic29ydE9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNvcnRlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBzb3J0IG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzb3J0LWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5zb3J0KVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gYS5zb3J0LmxldmVsIC0gYi5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICAvLyBkcmFnIGluIHNvcnRPcmRlciB2aWV3IGNoYW5nZXMgdGhlIHNvcnQgb3JkZXIgKGR1aCEpXG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7XG4gICAgICAgICAgICAgIG4uc29ydC5sZXZlbCA9IGlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLnNvcnQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBuLnNvcnQgPyBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgY2MgPSBjb2RlcG9pbnRzWyBkaXIgPT09IFwiYXNjXCIgPyBcImFycm93X3Vwd2FyZFwiIDogZGlyID09PSBcImRlc2NcIiA/IFwiYXJyb3dfZG93bndhcmRcIiA6IFwiXCIgXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2MgPyBjYyA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29uc3RyYWludExvZ2ljOiB7XG4gICAgICAgIG5hbWU6IFwiY29uc3RyYWludExvZ2ljXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29uc3RyYWludCBsb2dpYyB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIGNvbnN0cmFpbmVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBjb2RlIG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgbGV0IGFjb25zdCA9IGEuY29uc3RyYWludHMgJiYgYS5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBhY29kZSA9IGFjb25zdCA/IGEuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgbGV0IGJjb25zdCA9IGIuY29uc3RyYWludHMgJiYgYi5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBiY29kZSA9IGJjb25zdCA/IGIuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgaWYgKGFjb25zdClcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IChhY29kZSA8IGJjb2RlID8gLTEgOiBhY29kZSA+IGJjb2RlID8gMSA6IDApIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gMSA6IG5hbWVDb21wKGEsIGIpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb21wYXJhdG9yIGZ1bmN0aW9uLCBmb3Igc29ydGluZyBhIGxpc3Qgb2Ygbm9kZXMgYnkgbmFtZS4gQ2FzZS1pbnNlbnNpdGl2ZS5cbi8vXG5sZXQgbmFtZUNvbXAgPSBmdW5jdGlvbihhLGIpIHtcbiAgICBsZXQgbmEgPSBhLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgbmIgPSBiLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gbmEgPCBuYiA/IC0xIDogbmEgPiBuYiA/IDEgOiAwO1xufTtcblxuZXhwb3J0IHsgZWRpdFZpZXdzIH07XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2VkaXRWaWV3cy5qc1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgZmluZERvbUJ5RGF0YU9iaiB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jbGFzcyBEaWFsb2cge1xuICAgIGNvbnN0cnVjdG9yIChlZGl0b3IpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBlZGl0b3I7XG4gICAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvciA9IGVkaXRvci5jb25zdHJhaW50RWRpdG9yO1xuICAgICAgICB0aGlzLnVuZG9NZ3IgPSBlZGl0b3IudW5kb01ncjtcbiAgICAgICAgdGhpcy5jdXJyTm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZGcgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpO1xuICAgICAgICB0aGlzLmRnLmNsYXNzZWQoXCJoaWRkZW5cIix0cnVlKVxuICAgICAgICB0aGlzLmRnLnNlbGVjdChcIi5idXR0b24uY2xvc2VcIikub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLmhpZGUoKSk7XG4gICAgICAgIHRoaXMuZGcuc2VsZWN0KFwiLmJ1dHRvbi5yZW1vdmVcIikub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLmVkaXRvci5yZW1vdmVOb2RlKHRoaXMuY3Vyck5vZGUpKTtcblxuICAgICAgICAvLyBXaXJlIHVwIHNlbGVjdCBidXR0b24gaW4gZGlhbG9nXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmN1cnJOb2RlLmlzU2VsZWN0ZWQgPyBzZWxmLmN1cnJOb2RlLnVuc2VsZWN0KCkgOiBzZWxmLmN1cnJOb2RlLnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBzZWxmLmN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vIFdpcmUgdXAgc29ydCBmdW5jdGlvbiBpbiBkaWFsb2dcbiAgICAgICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNjLmNsYXNzZWQoXCJkaXNhYmxlZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGxldCBvbGRzb3J0ID0gY2MuY2xhc3NlZChcInNvcnRhc2NcIikgPyBcImFzY1wiIDogY2MuY2xhc3NlZChcInNvcnRkZXNjXCIpID8gXCJkZXNjXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgbmV3c29ydCA9IG9sZHNvcnQgPT09IFwiYXNjXCIgPyBcImRlc2NcIiA6IG9sZHNvcnQgPT09IFwiZGVzY1wiID8gXCJub25lXCIgOiBcImFzY1wiO1xuICAgICAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG5ld3NvcnQgPT09IFwiYXNjXCIpO1xuICAgICAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuZXdzb3J0ID09PSBcImRlc2NcIik7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJyTm9kZS5zZXRTb3J0KG5ld3NvcnQpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEhpZGVzIHRoZSBkaWFsb2cuIFNldHMgdGhlIGN1cnJlbnQgbm9kZSB0byBudWxsLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBub25lXG4gICAgLy8gUmV0dXJuc1xuICAgIC8vICBub3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICBIaWRlcyB0aGUgZGlhbG9nLlxuICAgIC8vICBTZXRzIGN1cnJOb2RlIHRvIG51bGwuXG4gICAgLy9cbiAgICBoaWRlICgpe1xuICAgICAgdGhpcy5jdXJyTm9kZSA9IG51bGw7XG4gICAgICB0aGlzLmRnXG4gICAgICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgdHJ1ZSlcbiAgICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZWRpdG9yLmFuaW1hdGlvbkR1cmF0aW9uLzIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxZS02KVwiKVxuICAgICAgICAgIDtcbiAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvci5oaWRlKCk7XG4gICAgfVxuXG4gICAgLy8gT3BlbnMgYSBkaWFsb2cgb24gdGhlIHNwZWNpZmllZCBub2RlLlxuICAgIC8vIEFsc28gbWFrZXMgdGhhdCBub2RlIHRoZSBjdXJyZW50IG5vZGUuXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIG4gICAgdGhlIG5vZGVcbiAgICAvLyAgIGVsdCAgdGhlIERPTSBlbGVtZW50IChlLmcuIGEgY2lyY2xlKVxuICAgIC8vIFJldHVybnNcbiAgICAvLyAgIHN0cmluZ1xuICAgIC8vIFNpZGUgZWZmZWN0OlxuICAgIC8vICAgc2V0cyBnbG9iYWwgY3Vyck5vZGVcbiAgICAvL1xuICAgIHNob3cgKG4sIGVsdCwgcmVmcmVzaE9ubHkpIHtcbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIGlmICghZWx0KSBlbHQgPSBmaW5kRG9tQnlEYXRhT2JqKG4pO1xuICAgICAgdGhpcy5jb25zdHJhaW50RWRpdG9yLmhpZGUoKTtcbiAgICAgIHRoaXMuY3Vyck5vZGUgPSBuO1xuXG4gICAgICBsZXQgaXNyb290ID0gISB0aGlzLmN1cnJOb2RlLnBhcmVudDtcbiAgICAgIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgICAgIGxldCBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpLmRhdHVtKG4pO1xuICAgICAgLy8gQ2FsY3VsYXRlIGRpYWxvZydzIHBvc2l0aW9uXG4gICAgICBsZXQgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGV0IGViYiA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCBiYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBsZXQgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgICAgIGxldCBiID0gKGJiYi5ib3R0b20gLSBlYmIuYm90dG9tKSArIGViYi53aWR0aC8yO1xuICAgICAgbGV0IGwgPSAoZWJiLmxlZnQgLSBiYmIubGVmdCkgKyBlYmIuaGVpZ2h0LzI7XG4gICAgICBsZXQgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAgICAgLy8gTkI6IGNhbid0IGdldCBvcGVuaW5nIHVwIHRvIHdvcmssIHNvIGhhcmQgd2lyZSBpdCB0byBkb3duLiA6LVxcXG5cbiAgICAgIC8vXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIGwrXCJweFwiKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLCByZWZyZXNoT25seT9cInNjYWxlKDEpXCI6XCJzY2FsZSgxZS02KVwiKVxuICAgICAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgICAgIC5jbGFzc2VkKFwiaXNyb290XCIsIGlzcm9vdClcbiAgICAgICAgICA7XG4gICAgICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIHQrXCJweFwiKVxuICAgICAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDAlXCIpIDtcbiAgICAgIGVsc2VcbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIG51bGwpXG4gICAgICAgICAgICAgIC5zdHlsZShcImJvdHRvbVwiLCBiK1wicHhcIilcbiAgICAgICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gICAgICAvLyBTZXQgdGhlIGRpYWxvZyB0aXRsZSB0byBub2RlIG5hbWVcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZGlhbG9nVGl0bGVcIl0gc3BhbicpXG4gICAgICAgICAgLnRleHQobi5uYW1lKTtcbiAgICAgIC8vIFNob3cgdGhlIGZ1bGwgcGF0aFxuICAgICAgZGlhbG9nLnNlbGVjdCgnW25hbWU9XCJoZWFkZXJcIl0gW25hbWU9XCJmdWxsUGF0aFwiXSBkaXYnKVxuICAgICAgICAgIC50ZXh0KG4ucGF0aCk7XG4gICAgICAvLyBUeXBlIG5hbWUgYXQgdGhpcyBub2RlXG4gICAgICBsZXQgdHAgPSBuLnB0eXBlLm5hbWU7XG4gICAgICBsZXQgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gICAgICBsZXQgdHN0cmluZyA9IHN0cCAmJiBgPHNwYW4gc3R5bGU9XCJjb2xvcjogcHVycGxlO1wiPiR7c3RwfTwvc3Bhbj4gKCR7dHB9KWAgfHwgdHBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwidHlwZVwiXSBkaXYnKVxuICAgICAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gICAgICAvLyBXaXJlIHVwIGFkZCBjb25zdHJhaW50IGJ1dHRvblxuICAgICAgZGlhbG9nLnNlbGVjdChcIiNkaWFsb2cgLmNvbnN0cmFpbnRTZWN0aW9uIC5hZGQtYnV0dG9uXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCBjID0gbi5hZGRDb25zdHJhaW50KCk7XG4gICAgICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgICAgICBzZWxmLmVkaXRvci51cGRhdGUobik7XG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KG4sIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuY29uc3RyYWludEVkaXRvci5vcGVuKGMsIG4pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgIC8vIEZpbGwgb3V0IHRoZSBjb25zdHJhaW50cyBzZWN0aW9uLiBGaXJzdCwgc2VsZWN0IGFsbCBjb25zdHJhaW50cy5cbiAgICAgIGxldCBjb25zdHJzID0gZGlhbG9nLnNlbGVjdChcIi5jb25zdHJhaW50U2VjdGlvblwiKVxuICAgICAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgICAgIC5kYXRhKG4uY29uc3RyYWludHMpO1xuICAgICAgLy8gRW50ZXIoKTogY3JlYXRlIGRpdnMgZm9yIGVhY2ggY29uc3RyYWludCB0byBiZSBkaXNwbGF5ZWQgIChUT0RPOiB1c2UgYW4gSFRNTDUgdGVtcGxhdGUgaW5zdGVhZClcbiAgICAgIC8vIDEuIGNvbnRhaW5lclxuICAgICAgbGV0IGNkaXZzID0gY29uc3Rycy5lbnRlcigpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIixcImNvbnN0cmFpbnRcIikgO1xuICAgICAgLy8gMi4gb3BlcmF0b3JcbiAgICAgIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgICAgIC8vIDMuIHZhbHVlXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJ2YWx1ZVwiKSA7XG4gICAgICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgICAgIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcImNvZGVcIikgO1xuICAgICAgLy8gNS4gYnV0dG9uIHRvIGVkaXQgdGhpcyBjb25zdHJhaW50XG4gICAgICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKS5hdHRyKFwidGl0bGVcIixcIkVkaXQgdGhpcyBjb25zdHJhaW50XCIpO1xuICAgICAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgICAgIGNkaXZzLmFwcGVuZChcImlcIikuYXR0cihcImNsYXNzXCIsIFwibWF0ZXJpYWwtaWNvbnMgY2FuY2VsXCIpLnRleHQoXCJkZWxldGVfZm9yZXZlclwiKS5hdHRyKFwidGl0bGVcIixcIlJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcIik7XG5cbiAgICAgIC8vIFJlbW92ZSBleGl0aW5nXG4gICAgICBjb25zdHJzLmV4aXQoKS5yZW1vdmUoKSA7XG5cbiAgICAgIC8vIFNldCB0aGUgdGV4dCBmb3IgZWFjaCBjb25zdHJhaW50XG4gICAgICBjb25zdHJzXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihjKSB7IHJldHVybiBcImNvbnN0cmFpbnQgXCIgKyBjLmN0eXBlOyB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMub3AgfHwgXCJJU0FcIjsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgIC8vIEZJWE1FIFxuICAgICAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgKyAoYy5leHRyYVZhbHVlID8gXCIgaW4gXCIgKyBjLmV4dHJhVmFsdWUgOiBcIlwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSB8fCAoYy52YWx1ZXMgJiYgYy52YWx1ZXMuam9pbihcIixcIikpIHx8IGMudHlwZTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjLCBuKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGNvbnN0cnMuc2VsZWN0KFwiaS5jYW5jZWxcIilcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKG4pO1xuICAgICAgICAgICAgICBzZWxmLnNob3cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgfSlcblxuXG4gICAgICAvLyBUcmFuc2l0aW9uIHRvIFwiZ3Jvd1wiIHRoZSBkaWFsb2cgb3V0IG9mIHRoZSBub2RlXG4gICAgICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZWRpdG9yLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMS4wKVwiKTtcblxuICAgICAgLy9cbiAgICAgIGxldCB0eXAgPSBuLnBjb21wLnR5cGUgfHwgbi5wY29tcDsgLy8gdHlwZSBvZiB0aGUgbm9kZS4gQ2FzZSBmb3IgaWYgcm9vdCBub2RlLlxuICAgICAgaWYgKHR5cC5pc0xlYWZUeXBlKSB7XG4gICAgICAgICAgLy8gZGlhbG9nIGZvciBzaW1wbGUgYXR0cmlidXRlcy5cbiAgICAgICAgICBkaWFsb2dcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzaW1wbGVcIix0cnVlKTtcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgICAgIC8vIFxuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic2VsZWN0LWN0cmxcIl0nKVxuICAgICAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkIH0pO1xuICAgICAgICAgIC8vIFxuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic29ydC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCBuID0+ICFuLmNhblNvcnQoKSlcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gRGlhbG9nIGZvciBjbGFzc2VzXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsZmFsc2UpO1xuICAgICAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAgICAgLnRleHQobi5wY29tcC50eXBlID8gbi5wY29tcC50eXBlLm5hbWUgOiBuLnBjb21wLm5hbWUpO1xuXG4gICAgICAgICAgLy8gd2lyZSB1cCB0aGUgYnV0dG9uIHRvIHNob3cgc3VtbWFyeSBmaWVsZHNcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2hvd1N1bW1hcnlcIl0nKVxuICAgICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNlbGVjdGVkTmV4dChcInN1bW1hcnlmaWVsZHNcIikpO1xuXG4gICAgICAgICAgLy8gRmlsbCBpbiB0aGUgdGFibGUgbGlzdGluZyBhbGwgdGhlIGF0dHJpYnV0ZXMvcmVmcy9jb2xsZWN0aW9ucy5cbiAgICAgICAgICBsZXQgdGJsID0gZGlhbG9nLnNlbGVjdChcInRhYmxlLmF0dHJpYnV0ZXNcIik7XG4gICAgICAgICAgbGV0IHJvd3MgPSB0Ymwuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAgICAgLmRhdGEoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLmFsbFBhcnRzKVxuICAgICAgICAgICAgICA7XG4gICAgICAgICAgcm93cy5lbnRlcigpLmFwcGVuZChcInRyXCIpO1xuICAgICAgICAgIHJvd3MuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICAgIGxldCBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKFwidGRcIilcbiAgICAgICAgICAgICAgLmRhdGEoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICAgICAgICAgICAgaWYgKGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiU2VsZWN0IHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJ3NlbGVjdHNpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwic2VsZWN0ZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICc8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJDb25zdHJhaW4gdGhpcyBhdHRyaWJ1dGVcIj5wbGF5X2Fycm93PC9pPicsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnY29uc3RyYWluc2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZi5zZWxlY3RlZE5leHQoXCJjb25zdHJhaW5lZFwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogYDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkZvbGxvdyB0aGlzICR7Y29tcC5raW5kfVwiPnBsYXlfYXJyb3c8L2k+YCxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdvcGVubmV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwib3BlblwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICBjZWxscy5lbnRlcigpLmFwcGVuZChcInRkXCIpO1xuICAgICAgICAgIGNlbGxzXG4gICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuY2xzO30pXG4gICAgICAgICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLmNsaWNrICYmIGQuY2xpY2soKTsgfSlcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgIGNlbGxzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjdXJyTm9kZSAobm9kZSkgTm9kZSB0byBleHRlbmQgZnJvbVxuICAgIC8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuICAgIC8vICAgcCAoc3RyaW5nKSBOYW1lIG9mIGFuIGF0dHJpYnV0ZSwgcmVmLCBvciBjb2xsZWN0aW9uXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIG5vdGhpbmdcbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBJZiB0aGUgc2VsZWN0ZWQgaXRlbSBpcyBub3QgYWxyZWFkeSBpbiB0aGUgZGlzcGxheSwgaXQgZW50ZXJzXG4gICAgLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4gICAgLy8gICBUaGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkIG9uIHRoZSBjaGlsZCBub2RlLlxuICAgIC8vICAgSWYgdGhlIHVzZXIgY2xpY2tlZCBvbiBhIFwib3BlbitzZWxlY3RcIiBidXR0b24sIHRoZSBjaGlsZCBpcyBzZWxlY3RlZC5cbiAgICAvLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuICAgIC8vICAgY2hpbGQsIGFuZCB0aGUgY29uc3RyYWludCBlZGl0b3Igb3BlbmVkICBvbiB0aGF0IGNvbnN0cmFpbnQuXG4gICAgLy9cbiAgICBzZWxlY3RlZE5leHQgKG1vZGUsIHApIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgbjtcbiAgICAgICAgbGV0IGNjO1xuICAgICAgICBsZXQgc2ZzO1xuICAgICAgICBsZXQgY3QgPSB0aGlzLmN1cnJOb2RlLnRlbXBsYXRlO1xuICAgICAgICBpZiAobW9kZSA9PT0gXCJzdW1tYXJ5ZmllbGRzXCIpIHtcbiAgICAgICAgICAgIHNmcyA9IHRoaXMuZWRpdG9yLmN1cnJNaW5lLnN1bW1hcnlGaWVsZHNbdGhpcy5jdXJyTm9kZS5ub2RlVHlwZS5uYW1lXXx8W107XG4gICAgICAgICAgICBzZnMuZm9yRWFjaChmdW5jdGlvbihzZiwgaSl7XG4gICAgICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBzZWxmLmN1cnJOb2RlLnBhdGgpO1xuICAgICAgICAgICAgICAgIGxldCBtID0gY3QuYWRkUGF0aChzZik7XG4gICAgICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG0uc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwID0gc2VsZi5jdXJyTm9kZS5wYXRoICsgXCIuXCIgKyBwO1xuICAgICAgICAgICAgbiA9IGN0LmFkZFBhdGgocCk7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gXCJzZWxlY3RlZFwiKVxuICAgICAgICAgICAgICAgICFuLmlzU2VsZWN0ZWQgJiYgbi5zZWxlY3QoKTtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBcImNvbnN0cmFpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBjYyA9IG4uYWRkQ29uc3RyYWludCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vZGUgIT09IFwib3BlblwiKVxuICAgICAgICAgICAgc2VsZi51bmRvTWdyLnNhdmVTdGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgaWYgKG1vZGUgIT09IFwic3VtbWFyeWZpZWxkc1wiKSBcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBzZWxmLnNob3cobik7XG4gICAgICAgICAgICAgICAgY2MgJiYgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjYywgbilcbiAgICAgICAgICAgICAgICB9LCBzZWxmLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgICAgICB9LCBzZWxmLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZSh0aGlzLmN1cnJOb2RlKTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIFxuICAgIH1cbn1cblxuZXhwb3J0IHsgRGlhbG9nIH0gO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvZGlhbG9nLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbmltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBkM2pzb25Qcm9taXNlLCBpbml0T3B0aW9uTGlzdCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgZ2V0U3ViY2xhc3NlcyB9IGZyb20gJy4vbW9kZWwuanMnO1xuXG5jbGFzcyBDb25zdHJhaW50RWRpdG9yIHtcblxuICAgIGNvbnN0cnVjdG9yIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmFmdGVyU2F2ZSA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIC8vIE9wZW5zIHRoZSBjb25zdHJhaW50IGVkaXRvciBmb3IgY29uc3RyYWludCBjIG9mIG5vZGUgbi5cbiAgICAvL1xuICAgIG9wZW4oYywgbikge1xuXG4gICAgICAgIC8vIE5vdGUgaWYgdGhpcyBpcyBoYXBwZW5pbmcgYXQgdGhlIHJvb3Qgbm9kZVxuICAgICAgICBsZXQgaXNyb290ID0gISBuLnBhcmVudDtcbiAgICAgXG4gICAgICAgIC8vIEZpbmQgdGhlIGRpdiBmb3IgY29uc3RyYWludCBjIGluIHRoZSBkaWFsb2cgbGlzdGluZy4gV2Ugd2lsbFxuICAgICAgICAvLyBvcGVuIHRoZSBjb25zdHJhaW50IGVkaXRvciBvbiB0b3Agb2YgaXQuXG4gICAgICAgIGxldCBjZGl2O1xuICAgICAgICBkMy5zZWxlY3RBbGwoXCIjZGlhbG9nIC5jb25zdHJhaW50XCIpXG4gICAgICAgICAgICAuZWFjaChmdW5jdGlvbihjYyl7IGlmKGNjID09PSBjKSBjZGl2ID0gdGhpczsgfSk7XG4gICAgICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgY29uc3RyYWludCdzIGNvbnRhaW5lciBkaXZcbiAgICAgICAgbGV0IGNiYiA9IGNkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIC8vIGJvdW5kaW5nIGJveCBvZiB0aGUgYXBwJ3MgbWFpbiBib2R5IGVsZW1lbnRcbiAgICAgICAgbGV0IGRiYiA9IGQzLnNlbGVjdChcIiNxYlwiKVswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgLy8gcG9zaXRpb24gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG92ZXIgdGhlIGNvbnN0cmFpbnQgaW4gdGhlIGRpYWxvZ1xuICAgICAgICBsZXQgY2VkID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgYy5jdHlwZSlcbiAgICAgICAgICAgIC5jbGFzc2VkKFwib3BlblwiLCB0cnVlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIGMuc3VtbWFyeUxpc3QpXG4gICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgKGNiYi50b3AgLSBkYmIudG9wKStcInB4XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChjYmIubGVmdCAtIGRiYi5sZWZ0KStcInB4XCIpXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy8gSW5pdCB0aGUgY29uc3RyYWludCBjb2RlIFxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpXG4gICAgICAgICAgICAudGV4dChjLmNvZGUpO1xuXG4gICAgICAgIHRoaXMuaW5pdElucHV0cyhuLCBjKTtcblxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIFdoZW4gdXNlciBzZWxlY3RzIGFuIG9wZXJhdG9yLCBhZGQgYSBjbGFzcyB0byB0aGUgYy5lLidzIGNvbnRhaW5lclxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3AgPSBPUElOREVYW3RoaXMudmFsdWVdO1xuICAgICAgICAgICAgICAgIHNlbGYuaW5pdElucHV0cyhuLCBjLCBvcC5jdHlwZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uY2FuY2VsXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY2FuY2VsKG4sIGMpIH0pO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc2F2ZVwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLnNhdmVFZGl0cyhuLCBjKSB9KTtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnN5bmNcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5nZW5lcmF0ZU9wdGlvbkxpc3QobiwgYykudGhlbigoKSA9PiB0aGlzLmluaXRJbnB1dHMobiwgYykpIH0pO1xuXG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIGlucHV0IGVsZW1lbnRzIGluIHRoZSBjb25zdHJhaW50IGVkaXRvciBmcm9tIHRoZSBnaXZlbiBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgaW5pdElucHV0cyAobiwgYywgY3R5cGUpIHtcblxuICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgb3BlcmF0b3Igc2VsZWN0IGxpc3Qgd2l0aCBvcHMgYXBwcm9wcmlhdGUgZm9yIHRoZSBwYXRoXG4gICAgICAgIC8vIGF0IHRoaXMgbm9kZS5cbiAgICAgICAgaWYgKCFjdHlwZSkgXG4gICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJvcFwiXScsIFxuICAgICAgICAgICAgT1BTLmZpbHRlcihmdW5jdGlvbihvcCl7IHJldHVybiBuLm9wVmFsaWQob3ApOyB9KSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5vcCxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQub3AsXG4gICAgICAgICAgICBzZWxlY3RlZDpjLm9wXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgY3R5cGUgPSBjdHlwZSB8fCBjLmN0eXBlO1xuXG4gICAgICAgIGxldCBjZSA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpO1xuICAgICAgICBsZXQgc216ZCA9IGNlLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuICAgICAgICBjZS5hdHRyKFwiY2xhc3NcIiwgXCJvcGVuIFwiICsgY3R5cGUpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgIHNtemQpXG4gICAgICAgICAgICAuY2xhc3NlZChcImJpb2VudGl0eVwiLCAgbi5pc0Jpb0VudGl0eSk7XG4gICAgIFxuICAgICAgICAvL1xuICAgICAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBbXCJBbnlcIl0uY29uY2F0KG4udGVtcGxhdGUubW9kZWwubWluZS5vcmdhbmlzbUxpc3QpLFxuICAgICAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYW4gb3B0aW9uIGxpc3Qgb2Ygc3ViY2xhc3MgbmFtZXNcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgbi5wYXJlbnQgPyBnZXRTdWJjbGFzc2VzKG4ucGNvbXAua2luZCA/IG4ucGNvbXAudHlwZSA6IG4ucGNvbXApIDogW10sXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIHN1YmNsYXNzZXMpXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgb25lIHdob3NlIG5hbWUgbWF0Y2hlcyB0aGUgbm9kZSdzIHR5cGUgYW5kIHNldCBpdHMgc2VsZWN0ZWQgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaGVzID0gZC5uYW1lID09PSAoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLm5hbWUgfHwgbi5wdHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgbi50ZW1wbGF0ZS5tb2RlbC5taW5lLmxpc3RzLmZpbHRlcihmdW5jdGlvbiAobCkgeyByZXR1cm4gbi5saXN0VmFsaWQobCk7IH0pLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiKE5vIGxpc3RzKVwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgfHwgYy52YWx1ZXMgfHwgW2MudmFsdWVdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIGxpc3RcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZXMgfHwgW2MudmFsdWVdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCB8fCBbYy52YWx1ZV0sXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIHJlc3VsdHNcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcIm51bGxcIikge1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJVbnJlY29nbml6ZWQgY3R5cGU6IFwiICsgY3R5cGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgLypcbiAgICAvL1xuICAgIHVwZGF0ZUNFaW5wdXRzIChjLCBvcCkge1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJjb2RlXCJdJykudGV4dChjLmNvZGUpO1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy5jdHlwZT09PVwibnVsbFwiID8gXCJcIiA6IGMudmFsdWU7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbiAgICB9XG4gICAgKi9cblxuXG4gICAgLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgbiAgKG5vZGUpICBUaGUgbm9kZSB3ZSdyZSB3b3JraW5nIG9uLiBNdXN0IGJlIGFuIGF0dHJpYnV0ZSBub2RlLlxuICAgIC8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbiAgICAvLyBOQjogT25seSB2YWx1ZSBhbmQgbXVsdGl2YXVlIGNvbnN0cmFpbnRzIGNhbiBiZSBzdW1tYXJpemVkIGluIHRoaXMgd2F5LiAgXG4gICAgZ2VuZXJhdGVPcHRpb25MaXN0IChuLCBjKSB7XG4gICAgICAgIC8vIFRvIGdldCB0aGUgbGlzdCwgd2UgaGF2ZSB0byBydW4gdGhlIGN1cnJlbnQgcXVlcnkgd2l0aCBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciwgXG4gICAgICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgICAgICAvLyBCVVQgTk9URSwgd2UgaGF2ZSB0byBydW4gdGhlIHF1ZXJ5ICp3aXRob3V0KiBjb25zdHJhaW50IGMhIVxuICAgICAgICAvLyBFeGFtcGxlOiBzdXBwb3NlIHdlIGhhdmUgYSBxdWVyeSB3aXRoIGEgY29uc3RyYWludCBhbGxlbGVUeXBlPVRhcmdldGVkLFxuICAgICAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgICAgICAvLyBzeW5jIGJ1dHRvbiB0byBnZXQgYSBsaXN0LiBJZiB3ZSBydW4gdGhlIHF1ZXJ5IHdpdGggYyBpbnRhY3QsIHdlJ2xsIGdldCBhIGxpc3RcbiAgICAgICAgLy8gY29udGFpbmluZyBvbmx5IFwiVGFyZ2V0ZWRcIi4gRG9oIVxuICAgICAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAgICAgLy8gaGVyZSBpcyB0byBlbnN1cmUgaXQgYnkgYWRkaW5nIHRoZSBwYXRoIHRvIHRoZSB2aWV3IGxpc3QuXG5cbiAgICAgICAgLypcbiAgICAgICAgLy8gU2F2ZSB0aGlzIGNob2ljZSBpbiBsb2NhbFN0b3JhZ2VcbiAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgIGxldCBrZXkgPSBcImF1dG9jb21wbGV0ZVwiO1xuICAgICAgICBsZXQgbHN0O1xuICAgICAgICBsc3QgPSBnZXRMb2NhbChrZXksIHRydWUsIFtdKTtcbiAgICAgICAgaWYobHN0LmluZGV4T2YoYXR0cikgPT09IC0xKSBsc3QucHVzaChhdHRyKTtcbiAgICAgICAgc2V0TG9jYWwoa2V5LCBsc3QsIHRydWUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIC8vIGJ1aWxkIHRoZSBxdWVyeVxuICAgICAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgICAgICAvL1xuICAgICAgICBsZXQgbGV4ID0gbi50ZW1wbGF0ZS5jb25zdHJhaW50TG9naWM7IC8vIHNhdmUgY29uc3RyYWludCBsb2dpYyBleHByXG4gICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTsgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIHRoZSBjb25zdHJhaW50XG4gICAgICAgIG4udGVtcGxhdGUuc2VsZWN0LnB1c2gocCk7IC8vIC8vIG1ha2Ugc3VyZSBwIGlzIHBhcnQgb2YgdGhlIHF1ZXJ5XG4gICAgICAgIC8vIGdldCB0aGUgeG1sXG4gICAgICAgIGxldCB4ID0gbi50ZW1wbGF0ZS5nZXRYbWwodHJ1ZSk7XG4gICAgICAgIC8vIHJlc3RvcmUgdGhlIHRlbXBsYXRlXG4gICAgICAgIG4udGVtcGxhdGUuc2VsZWN0LnBvcCgpO1xuICAgICAgICBuLnRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyA9IGxleDsgLy8gcmVzdG9yZSB0aGUgbG9naWMgZXhwclxuICAgICAgICBuLmFkZENvbnN0cmFpbnQoYyk7IC8vIHJlLWFkZCB0aGUgY29uc3RyYWludFxuXG4gICAgICAgIC8vIGJ1aWxkIHRoZSB1cmxcbiAgICAgICAgbGV0IGUgPSBlbmNvZGVVUklDb21wb25lbnQoeCk7XG4gICAgICAgIGxldCB1cmwgPSBgJHtuLnRlbXBsYXRlLm1vZGVsLm1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICAgICAgbGV0IHRocmVzaG9sZCA9IDI1MDtcblxuICAgICAgICAvLyBjdmFscyBjb250YWludHMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZShzKVxuICAgICAgICBsZXQgY3ZhbHMgPSBbXTtcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjdmFscyA9IGMudmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgY3ZhbHMgPSBbIGMudmFsdWUgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNpZ25hbCB0aGF0IHdlJ3JlIHN0YXJ0aW5nXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgICAgICAvLyBnbyFcbiAgICAgICAgbGV0IHByb20gPSBkM2pzb25Qcm9taXNlKHVybCkudGhlbihmdW5jdGlvbihqc29uKXtcbiAgICAgICAgICAgIC8vIFRoZSBsaXN0IG9mIHZhbHVlcyBpcyBpbiBqc29uLnJldWx0cy5cbiAgICAgICAgICAgIC8vIEVhY2ggbGlzdCBpdGVtIGxvb2tzIGxpa2U6IHsgaXRlbTogXCJzb21lc3RyaW5nXCIsIGNvdW50OiAxNyB9XG4gICAgICAgICAgICAvLyAoWWVzLCB3ZSBnZXQgY291bnRzIGZvciBmcmVlISBPdWdodCB0byBtYWtlIHVzZSBvZiB0aGlzLilcbiAgICAgICAgICAgIGxldCByZXMgPSBqc29uLnJlc3VsdHMubWFwKHIgPT4gci5pdGVtKS5zb3J0KCk7XG4gICAgICAgICAgICAvLyBjaGVjayBzaXplIG9mIHJlc3VsdFxuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAvLyB0b28gYmlnLiBhc2sgdXNlciB3aGF0IHRvIGRvLlxuICAgICAgICAgICAgICAgIGxldCBhbnMgPSBwcm9tcHQoYFRoZXJlIGFyZSAke3Jlcy5sZW5ndGh9IHJlc3VsdHMsIHdoaWNoIGV4Y2VlZHMgdGhlIHRocmVzaG9sZCBvZiAke3RocmVzaG9sZH0uIEhvdyBtYW55IGRvIHlvdSB3YW50IHRvIHNob3c/YCwgdGhyZXNob2xkKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5zID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZXIgc2V6IGNhbmNlbFxuICAgICAgICAgICAgICAgICAgICAvLyBTaWduYWwgdGhhdCB3ZSdyZSBkb25lLlxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oYW5zKSB8fCBhbnMgPD0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vIHVzZXIgd2FudHMgdGhpcyBtYW55IHJlc3VsdHNcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBjLnN1bW1hcnlMaXN0ID0gcmVzO1xuXG4gICAgICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHRydWUpO1xuXG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCwgXG4gICAgICAgICAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGQgPT4gY3ZhbHMuaW5kZXhPZihkKSAhPT0gLTEgfHwgbnVsbCB9KTtcblxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb207IC8vIHNvIGNhbGxlciBjYW4gY2hhaW5cbiAgICB9XG4gICAgLy9cbiAgICBjYW5jZWwgKG4sIGMpIHtcbiAgICAgICAgaWYgKCEgYy5zYXZlZCkge1xuICAgICAgICAgICAgbi5yZW1vdmVDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgdGhpcy5hZnRlclNhdmUobik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpO1xuICAgIH1cbiAgICAvL1xuICAgIHNhdmVFZGl0cyhuLCBjKSB7XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgICAgIGMuc2V0T3Aobyk7XG4gICAgICAgIGMuc2F2ZWQgPSB0cnVlO1xuICAgICAgICAvL1xuICAgICAgICBsZXQgdmFsID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWU7XG4gICAgICAgIGxldCB2YWxzID0gW107XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB2YWxzLnB1c2godGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBsZXQgeiA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3InKS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcblxuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGMudHlwZSA9IHZhbHNbMF1cbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlZCA9IG4uc2V0U3ViY2xhc3NDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgaWYocmVtb3ZlZC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiQ29uc3RyYWluaW5nIHRvIHN1YmNsYXNzIFwiICsgKGMudHlwZSB8fCBuLnB0eXBlLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICsgXCIgY2F1c2VkIHRoZSBmb2xsb3dpbmcgcGF0aHMgdG8gYmUgcmVtb3ZlZDogXCIgXG4gICAgICAgICAgICAgICAgICAgICsgcmVtb3ZlZC5tYXAobiA9PiBuLnBhdGgpLmpvaW4oXCIsIFwiKSk7IFxuICAgICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHZhbDtcbiAgICAgICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgICAgIGMuZXh0cmFWYWx1ZSA9IHZhbHNbMF0gPT09IFwiQW55XCIgPyBudWxsIDogdmFsc1swXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHZhbHNbMF07XG4gICAgICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlID0geiA/IHZhbHNbMF0gOiB2YWw7XG4gICAgICAgICAgICBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIlVua25vd24gY3R5cGU6IFwiK2MuY3R5cGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMuYWZ0ZXJTYXZlICYmIHRoaXMuYWZ0ZXJTYXZlKG4pO1xuICAgIH1cblxufSAvLyBjbGFzcyBDb25zdHJhaW50RWRpdG9yXG5cbmV4cG9ydCB7IENvbnN0cmFpbnRFZGl0b3IgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnRFZGl0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=