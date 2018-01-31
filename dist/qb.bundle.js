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
        this.extraValue = this.ctype === "lookup" && c.extraValue || undefined;
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
        d3.select('#runquery')
            .on('click', () => self.runquery(self.currTemplate));
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
        let self = this;
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
            alert(`Could not access ${self.currMine.name}. Status=${error.status}. Error=${error.statusText}.`);
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
        // first, clear out the div within with the im-table query was generated
        d3.select('#imTablesQuery').html(null);
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

    updateCount (t) {
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

    runquery (t) {
      if (d3.event.altKey || d3.event.shiftKey) 
          this.runatmine(t);
      else
          this.runatqb(t);
    }

    runatmine (t) {
      let txt = t.getXml();
      let urlTxt = encodeURIComponent(txt);
      let linkurl = this.currMine.url + "/loadQuery.do?trail=%7Cquery&method=xml";
      let editurl = linkurl + "&query=" + urlTxt;
      let runurl = linkurl + "&skipBuilder=true&query=" + urlTxt;
      window.open( d3.event.altKey ? editurl : runurl, '_blank' );
    }

    runatqb (t) {
      let qjson = t.getJson(true);
      let service = { root: this.currMine.url + '/service' };

      imtables.configure('DefaultPageSize', 10);
      imtables.configure('TableResults.CacheFactor', 20);
      imtables.configure('TableCell.IndicateOffHostLinks', false);

      imtables.loadTable(
        '#imTablesQuery',
        {start: 0, size: 10},
        {service: service, query: qjson}
      ).then(
        function (table) { 
            //console.log('Table loaded', table);
            d3.select('#imTablesQueryAfter')[0][0].scrollIntoView();
        },
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
      ${(t.where || []).map(c => (new __WEBPACK_IMPORTED_MODULE_3__constraint_js__["a" /* Constraint */](c)).c2xml(qonly)).join(" ")}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDRmMzBkOTA2YjU0NmZjYjAzOTUiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9xYmVkaXRvci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvdW5kb01hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3RlbXBsYXRlLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL25vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3JlZ2lzdHJ5LmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvY29uc3RyYWludEVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLHdCQUF3QixHO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU0sYUFBYSxRQUFRO0FBQzNDO0FBQ0EsWUFBWSxZQUFZLEdBQUcsYUFBYTtBQUN4QztBQUNBLFlBQVksdUJBQXVCLEdBQUcsd0JBQXdCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUVBQWlFLGlCQUFpQixFQUFFO0FBQ3BGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFlQTs7Ozs7Ozs7Ozs7O0FDN1JBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVHOzs7Ozs7O0FDcE9SO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQix3QkFBd0I7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELDRDQUE0QyxFQUFFO0FBQ3pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdGQUFnQyxxQ0FBcUM7QUFDckU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0VBQWdFLGlCQUFpQixFQUFFO0FBQ25GLHNFQUFzRSxpQkFBaUIsRUFBRTtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFTzs7Ozs7Ozs7OztBQzVRZ0I7O0FBRXhCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsWUFBWSxXQUFXLGdCQUFnQjtBQUN2RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQixPQUFPO0FBQ1A7O0FBRVE7Ozs7Ozs7Ozs7O0FDbEJXOztBQUVuQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxrQ0FBa0MsYUFBYTtBQUMvQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVROzs7Ozs7Ozs7OztBQzlHbUI7O0FBRTNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxJQUFJLElBQUksV0FBVyxHQUFHO0FBQzdFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQ0FBc0MsZ0NBQWdDLEVBQUU7QUFDeEU7QUFDQSw0QkFBNEIsc0JBQXNCLEVBQUU7QUFDcEQ7QUFDQSw0QkFBNEIsc0JBQXNCLEVB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QSwyRDtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOztBQUVPIiwiZmlsZSI6InFiLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGQ0ZjMwZDkwNmI1NDZmY2IwMzk1IiwiXG4vL1xuLy8gRnVuY3Rpb24gdG8gZXNjYXBlICc8JyAnXCInIGFuZCAnJicgY2hhcmFjdGVyc1xuZnVuY3Rpb24gZXNjKHMpe1xuICAgIGlmICghcykgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpOyBcbn1cblxuLy8gUHJvbWlzaWZpZXMgYSBjYWxsIHRvIGQzLmpzb24uXG4vLyBBcmdzOlxuLy8gICB1cmwgKHN0cmluZykgVGhlIHVybCBvZiB0aGUganNvbiByZXNvdXJjZVxuLy8gUmV0dXJuczpcbi8vICAgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGpzb24gb2JqZWN0IHZhbHVlLCBvciByZWplY3RzIHdpdGggYW4gZXJyb3JcbmZ1bmN0aW9uIGQzanNvblByb21pc2UodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkMy5qc29uKHVybCwgZnVuY3Rpb24oZXJyb3IsIGpzb24pe1xuICAgICAgICAgICAgZXJyb3IgPyByZWplY3QoeyBzdGF0dXM6IGVycm9yLnN0YXR1cywgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dH0pIDogcmVzb2x2ZShqc29uKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbn1cblxuLy8gU2VsZWN0cyBhbGwgdGhlIHRleHQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci4gXG4vLyBUaGUgY29udGFpbmVyIG11c3QgaGF2ZSBhbiBpZC5cbi8vIENvcGllZCBmcm9tOlxuLy8gICBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMTY3NzQ1MS9ob3ctdG8tc2VsZWN0LWRpdi10ZXh0LW9uLWJ1dHRvbi1jbGlja1xuZnVuY3Rpb24gc2VsZWN0VGV4dChjb250YWluZXJpZCkge1xuICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgcmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KCk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZShyYW5nZSk7XG4gICAgfVxufVxuXG4vLyBDb252ZXJ0cyBhbiBJbnRlck1pbmUgcXVlcnkgaW4gUGF0aFF1ZXJ5IFhNTCBmb3JtYXQgdG8gYSBKU09OIG9iamVjdCByZXByZXNlbnRhdGlvbi5cbi8vXG5mdW5jdGlvbiBwYXJzZVBhdGhRdWVyeSh4bWwpe1xuICAgIC8vIFR1cm5zIHRoZSBxdWFzaS1saXN0IG9iamVjdCByZXR1cm5lZCBieSBzb21lIERPTSBtZXRob2RzIGludG8gYWN0dWFsIGxpc3RzLlxuICAgIGZ1bmN0aW9uIGRvbWxpc3QyYXJyYXkobHN0KSB7XG4gICAgICAgIGxldCBhID0gW107XG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGxzdC5sZW5ndGg7IGkrKykgYS5wdXNoKGxzdFtpXSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICAvLyBwYXJzZSB0aGUgWE1MXG4gICAgbGV0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZG9tID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh4bWwsIFwidGV4dC94bWxcIik7XG5cbiAgICAvLyBnZXQgdGhlIHBhcnRzLiBVc2VyIG1heSBwYXN0ZSBpbiBhIDx0ZW1wbGF0ZT4gb3IgYSA8cXVlcnk+XG4gICAgLy8gKGkuZS4sIHRlbXBsYXRlIG1heSBiZSBudWxsKVxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRlbXBsYXRlXCIpWzBdO1xuICAgIGxldCB0aXRsZSA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcInRpdGxlXCIpIHx8IFwiXCI7XG4gICAgbGV0IGNvbW1lbnQgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJjb21tZW50XCIpIHx8IFwiXCI7XG4gICAgbGV0IHF1ZXJ5ID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicXVlcnlcIilbMF07XG4gICAgbGV0IG1vZGVsID0geyBuYW1lOiBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJtb2RlbFwiKSB8fCBcImdlbm9taWNcIiB9O1xuICAgIGxldCBuYW1lID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSB8fCBcIlwiO1xuICAgIGxldCBkZXNjcmlwdGlvbiA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImxvbmdEZXNjcml0aW9uXCIpIHx8IFwiXCI7XG4gICAgbGV0IHNlbGVjdCA9IChxdWVyeS5nZXRBdHRyaWJ1dGUoXCJ2aWV3XCIpIHx8IFwiXCIpLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgIGxldCBjb25zdHJhaW50cyA9IGRvbWxpc3QyYXJyYXkoZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjb25zdHJhaW50JykpO1xuICAgIGxldCBjb25zdHJhaW50TG9naWMgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJjb25zdHJhaW50TG9naWNcIik7XG4gICAgbGV0IGpvaW5zID0gZG9tbGlzdDJhcnJheShxdWVyeS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImpvaW5cIikpO1xuICAgIGxldCBzb3J0T3JkZXIgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIikgfHwgXCJcIjtcbiAgICAvL1xuICAgIC8vXG4gICAgbGV0IHdoZXJlID0gY29uc3RyYWludHMubWFwKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgbGV0IG9wID0gYy5nZXRBdHRyaWJ1dGUoXCJvcFwiKTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO1xuICAgICAgICAgICAgICAgIG9wID0gXCJJU0FcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2YWxzID0gZG9tbGlzdDJhcnJheShjLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidmFsdWVcIikpLm1hcCggdiA9PiB2LmlubmVySFRNTCApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcDogb3AsXG4gICAgICAgICAgICAgICAgcGF0aDogYy5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogYy5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgOiB2YWxzLFxuICAgICAgICAgICAgICAgIHR5cGUgOiBjLmdldEF0dHJpYnV0ZShcInR5cGVcIiksXG4gICAgICAgICAgICAgICAgY29kZTogYy5nZXRBdHRyaWJ1dGUoXCJjb2RlXCIpLFxuICAgICAgICAgICAgICAgIGVkaXRhYmxlOiBjLmdldEF0dHJpYnV0ZShcImVkaXRhYmxlXCIpIHx8IFwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgLy8gQ2hlY2s6IGlmIHRoZXJlIGlzIG9ubHkgb25lIGNvbnN0cmFpbnQsIChhbmQgaXQncyBub3QgYW4gSVNBKSwgc29tZXRpbWVzIHRoZSBjb25zdHJhaW50TG9naWMgXG4gICAgLy8gYW5kL29yIHRoZSBjb25zdHJhaW50IGNvZGUgYXJlIG1pc3NpbmcuXG4gICAgaWYgKHdoZXJlLmxlbmd0aCA9PT0gMSAmJiB3aGVyZVswXS5vcCAhPT0gXCJJU0FcIiAmJiAhd2hlcmVbMF0uY29kZSl7XG4gICAgICAgIHdoZXJlWzBdLmNvZGUgPSBjb25zdHJhaW50TG9naWMgPSBcIkFcIjtcbiAgICB9XG5cbiAgICAvLyBvdXRlciBqb2lucy4gVGhleSBsb29rIGxpa2UgdGhpczpcbiAgICAvLyAgICAgICA8am9pbiBwYXRoPVwiR2VuZS5zZXF1ZW5jZU9udG9sb2d5VGVybVwiIHN0eWxlPVwiT1VURVJcIi8+XG4gICAgam9pbnMgPSBqb2lucy5tYXAoIGogPT4gai5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpICk7XG5cbiAgICBsZXQgb3JkZXJCeSA9IG51bGw7XG4gICAgaWYgKHNvcnRPcmRlcikge1xuICAgICAgICAvLyBUaGUganNvbiBmb3JtYXQgZm9yIG9yZGVyQnkgaXMgYSBiaXQgd2VpcmQuXG4gICAgICAgIC8vIElmIHRoZSB4bWwgb3JkZXJCeSBpczogXCJBLmIuYyBhc2MgQS5kLmUgZGVzY1wiLFxuICAgICAgICAvLyB0aGUganNvbiBzaG91bGQgYmU6IFsge1wiQS5iLmNcIjpcImFzY1wifSwge1wiQS5kLmVcIjpcImRlc2N9IF1cbiAgICAgICAgLy8gXG4gICAgICAgIC8vIFRoZSBvcmRlcmJ5IHN0cmluZyB0b2tlbnMsIGUuZy4gW1wiQS5iLmNcIiwgXCJhc2NcIiwgXCJBLmQuZVwiLCBcImRlc2NcIl1cbiAgICAgICAgbGV0IG9iID0gc29ydE9yZGVyLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2s6XG4gICAgICAgIGlmIChvYi5sZW5ndGggJSAyIClcbiAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IHBhcnNlIHRoZSBvcmRlckJ5IGNsYXVzZTogXCIgKyBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIik7XG4gICAgICAgIC8vIGNvbnZlcnQgdG9rZW5zIHRvIGpzb24gb3JkZXJCeSBcbiAgICAgICAgb3JkZXJCeSA9IG9iLnJlZHVjZShmdW5jdGlvbihhY2MsIGN1cnIsIGkpe1xuICAgICAgICAgICAgaWYgKGkgJSAyID09PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBvZGQuIGN1cnIgaXMgYSBwYXRoLiBQdXNoIGl0LlxuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGN1cnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBldmVuLiBQb3AgdGhlIHBhdGgsIGNyZWF0ZSB0aGUge30sIGFuZCBwdXNoIGl0LlxuICAgICAgICAgICAgICAgIGxldCB2ID0ge31cbiAgICAgICAgICAgICAgICBsZXQgcCA9IGFjYy5wb3AoKVxuICAgICAgICAgICAgICAgIHZbcF0gPSBjdXJyO1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBjb25zdHJhaW50TG9naWMsXG4gICAgICAgIHNlbGVjdCxcbiAgICAgICAgd2hlcmUsXG4gICAgICAgIGpvaW5zLFxuICAgICAgICBvcmRlckJ5XG4gICAgfTtcbn1cblxuLy8gUmV0dXJucyBhIGRlZXAgY29weSBvZiBvYmplY3Qgby4gXG4vLyBBcmdzOlxuLy8gICBvICAob2JqZWN0KSBNdXN0IGJlIGEgSlNPTiBvYmplY3QgKG5vIGN1cmN1bGFyIHJlZnMsIG5vIGZ1bmN0aW9ucykuXG4vLyBSZXR1cm5zOlxuLy8gICBhIGRlZXAgY29weSBvZiBvXG5mdW5jdGlvbiBkZWVwYyhvKSB7XG4gICAgaWYgKCFvKSByZXR1cm4gbztcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvKSk7XG59XG5cbi8vXG5sZXQgUFJFRklYPVwib3JnLm1naS5hcHBzLnFiXCI7XG5mdW5jdGlvbiB0ZXN0TG9jYWwoYXR0cikge1xuICAgIHJldHVybiAoUFJFRklYK1wiLlwiK2F0dHIpIGluIGxvY2FsU3RvcmFnZTtcbn1cbmZ1bmN0aW9uIHNldExvY2FsKGF0dHIsIHZhbCwgZW5jb2RlKXtcbiAgICBsb2NhbFN0b3JhZ2VbUFJFRklYK1wiLlwiK2F0dHJdID0gZW5jb2RlID8gSlNPTi5zdHJpbmdpZnkodmFsKSA6IHZhbDtcbn1cbmZ1bmN0aW9uIGdldExvY2FsKGF0dHIsIGRlY29kZSwgZGZsdCl7XG4gICAgbGV0IGtleSA9IFBSRUZJWCtcIi5cIithdHRyO1xuICAgIGlmIChrZXkgaW4gbG9jYWxTdG9yYWdlKXtcbiAgICAgICAgbGV0IHYgPSBsb2NhbFN0b3JhZ2Vba2V5XTtcbiAgICAgICAgaWYgKGRlY29kZSkgdiA9IEpTT04ucGFyc2Uodik7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRmbHQ7XG4gICAgfVxufVxuZnVuY3Rpb24gY2xlYXJMb2NhbCgpIHtcbiAgICBsZXQgcm12ID0gT2JqZWN0LmtleXMobG9jYWxTdG9yYWdlKS5maWx0ZXIoa2V5ID0+IGtleS5zdGFydHNXaXRoKFBSRUZJWCkpO1xuICAgIHJtdi5mb3JFYWNoKCBrID0+IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGspICk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gb2JqZWN0LlxuLy8gVGhlIGxpc3QgaXMgc29ydGVkIGJ5IHRoZSBpdGVtIGtleXMuXG4vLyBJZiBuYW1lQXR0ciBpcyBzcGVjaWZpZWQsIHRoZSBpdGVtIGtleSBpcyBhbHNvIGFkZGVkIHRvIGVhY2ggZWxlbWVudFxuLy8gYXMgYW4gYXR0cmlidXRlIChvbmx5IHdvcmtzIGlmIHRob3NlIGl0ZW1zIGFyZSB0aGVtc2VsdmVzIG9iamVjdHMpLlxuLy8gRXhhbXBsZXM6XG4vLyAgICBzdGF0ZXMgPSB7J01FJzp7bmFtZTonTWFpbmUnfSwgJ0lBJzp7bmFtZTonSW93YSd9fVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnfSwge25hbWU6J01haW5lJ31dXG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzLCAnYWJicmV2JykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnLGFiYnJldidJQSd9LCB7bmFtZTonTWFpbmUnLGFiYnJldidNRSd9XVxuLy8gQXJnczpcbi8vICAgIG8gIChvYmplY3QpIFRoZSBvYmplY3QuXG4vLyAgICBuYW1lQXR0ciAoc3RyaW5nKSBJZiBzcGVjaWZpZWQsIGFkZHMgdGhlIGl0ZW0ga2V5IGFzIGFuIGF0dHJpYnV0ZSB0byBlYWNoIGxpc3QgZWxlbWVudC5cbi8vIFJldHVybjpcbi8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSBvXG5mdW5jdGlvbiBvYmoyYXJyYXkobywgbmFtZUF0dHIpe1xuICAgIGxldCBrcyA9IE9iamVjdC5rZXlzKG8pO1xuICAgIGtzLnNvcnQoKTtcbiAgICByZXR1cm4ga3MubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChuYW1lQXR0cikgb1trXS5uYW1lID0gaztcbiAgICAgICAgcmV0dXJuIG9ba107XG4gICAgfSk7XG59O1xuXG4vLyBBcmdzOlxuLy8gICBzZWxlY3RvciAoc3RyaW5nKSBGb3Igc2VsZWN0aW5nIHRoZSA8c2VsZWN0PiBlbGVtZW50XG4vLyAgIGRhdGEgKGxpc3QpIERhdGEgdG8gYmluZCB0byBvcHRpb25zXG4vLyAgIGNmZyAob2JqZWN0KSBBZGRpdGlvbmFsIG9wdGlvbmFsIGNvbmZpZ3M6XG4vLyAgICAgICB0aXRsZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgZm9yIHNldHRpbmcgdGhlIHRleHQgb2YgdGhlIG9wdGlvbi4gXG4vLyAgICAgICB2YWx1ZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgc2V0dGluZyB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvblxuLy8gICAgICAgc2VsZWN0ZWQgLSBmdW5jdGlvbiBvciBhcnJheSBvciBzdHJpbmcgZm9yIGRlY2lkaW5nIHdoaWNoIG9wdGlvbihzKSBhcmUgc2VsZWN0ZWRcbi8vICAgICAgICAgIElmIGZ1bmN0aW9uLCBjYWxsZWQgZm9yIGVhY2ggb3B0aW9uLlxuLy8gICAgICAgICAgSWYgYXJyYXksIHNwZWNpZmllcyB0aGUgdmFsdWVzIHRvIHNlbGVjdC5cbi8vICAgICAgICAgIElmIHN0cmluZywgc3BlY2lmaWVzIHdoaWNoIHZhbHVlIGlzIHNlbGVjdGVkXG4vLyAgICAgICBlbXB0eU1lc3NhZ2UgLSBhIG1lc3NhZ2UgdG8gc2hvdyBpZiB0aGUgZGF0YSBsaXN0IGlzIGVtcHR5XG4vLyAgICAgICBtdWx0aXBsZSAtIGlmIHRydWUsIG1ha2UgaXQgYSBtdWx0aS1zZWxlY3QgbGlzdFxuLy9cbmZ1bmN0aW9uIGluaXRPcHRpb25MaXN0IChzZWxlY3RvciwgZGF0YSwgY2ZnKSB7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgbGV0IGlkZW50ID0gKHg9PngpO1xuICAgIGxldCBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgbGV0IHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vXG5mdW5jdGlvbiBjb3B5T2JqKHRndCwgc3JjLCBkaXIpIHtcbiAgICBkaXIgPSBkaXIgfHwgdGd0O1xuICAgIGZvciggbGV0IG4gaW4gZGlyIClcbiAgICAgICAgdGd0W25dID0gKG4gaW4gc3JjKSA/IHNyY1tuXSA6IGRpcltuXTtcbiAgICByZXR1cm4gdGd0O1xufVxuXG4vL1xuZXhwb3J0IHtcbiAgICBlc2MsXG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIGdldExvY2FsLFxuICAgIHNldExvY2FsLFxuICAgIHRlc3RMb2NhbCxcbiAgICBjbGVhckxvY2FsLFxuICAgIHBhcnNlUGF0aFF1ZXJ5LFxuICAgIG9iajJhcnJheSxcbiAgICBpbml0T3B0aW9uTGlzdCxcbiAgICBmaW5kRG9tQnlEYXRhT2JqLFxuICAgIGNvcHlPYmpcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFZhbGlkIGNvbnN0cmFpbnQgdHlwZXMgKGN0eXBlKTpcbi8vICAgbnVsbCwgbG9va3VwLCBzdWJjbGFzcywgbGlzdCwgbG9vcCwgdmFsdWUsIG11bHRpdmFsdWUsIHJhbmdlXG4vL1xuLy8gQ29uc3RyYWludHMgb24gYXR0cmlidXRlczpcbi8vIC0gdmFsdWUgKGNvbXBhcmluZyBhbiBhdHRyaWJ1dGUgdG8gYSB2YWx1ZSwgdXNpbmcgYW4gb3BlcmF0b3IpXG4vLyAgICAgID4gPj0gPCA8PSA9ICE9IExJS0UgTk9ULUxJS0UgQ09OVEFJTlMgRE9FUy1OT1QtQ09OVEFJTlxuLy8gLSBtdWx0aXZhbHVlIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIG11bHRpcGxlIHZhbHVlKVxuLy8gICAgICBPTkUtT0YgTk9ULU9ORSBPRlxuLy8gLSByYW5nZSAoc3VidHlwZSBvZiBtdWx0aXZhbHVlLCBmb3IgY29vcmRpbmF0ZSByYW5nZXMpXG4vLyAgICAgIFdJVEhJTiBPVVRTSURFIE9WRVJMQVBTIERPRVMtTk9ULU9WRVJMQVBcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vL1xuLy8gQ29uc3RyYWludHMgb24gcmVmZXJlbmNlcy9jb2xsZWN0aW9uc1xuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwgcmVmL2VtcHR5IGNvbGxlY3Rpb24pXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vIC0gbG9va3VwIChcbi8vICAgICAgTE9PS1VQXG4vLyAtIHN1YmNsYXNzXG4vLyAgICAgIElTQVxuLy8gLSBsaXN0XG4vLyAgICAgIElOIE5PVC1JTlxuLy8gLSBsb29wIChUT0RPKVxuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBhcmUgbnVtZXJpY1xubGV0IE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgY2FuIGhhdmUgbnVsbCB2YWx1ZXNcbmxldCBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGFuIGF0dHJpYnV0ZSBjYW4gaGF2ZVxubGV0IExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJvcmcuaW50ZXJtaW5lLm9iamVjdHN0b3JlLnF1ZXJ5LkNsb2JBY2Nlc3NcIixcbiAgICBcIk9iamVjdFwiXG5dXG5cblxubGV0IE9QUyA9IFtcblxuICAgIC8vIFZhbGlkIGZvciBhbnkgYXR0cmlidXRlXG4gICAgLy8gQWxzbyB0aGUgb3BlcmF0b3JzIGZvciBsb29wIGNvbnN0cmFpbnRzIChub3QgeWV0IGltcGxlbWVudGVkKS5cbiAgICB7XG4gICAgb3A6IFwiPVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9LHtcbiAgICBvcDogXCIhPVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGZvciBudW1lcmljIGFuZCBkYXRlIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiPlwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIjxcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIjw9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGZvciBzdHJpbmcgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCJDT05UQUlOU1wiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuXG4gICAgfSx7XG4gICAgb3A6IFwiRE9FUyBOT1QgQ09OVEFJTlwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIkxJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT1QgTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk9ORSBPRlwiLFxuICAgIGN0eXBlOiBcIm11bHRpdmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9ORSBPRlwiLFxuICAgIGN0eXBlOiBcIm11bHRpdmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGZvciBMb2NhdGlvbiBub2Rlc1xuICAgIHtcbiAgICBvcDogXCJXSVRISU5cIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1ZFUkxBUFNcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiRE9FUyBOT1QgT1ZFUkxBUFwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVVRTSURFXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0sXG4gXG4gICAgLy8gTlVMTCBjb25zdHJhaW50cy4gVmFsaWQgZm9yIGFueSBub2RlIGV4Y2VwdCByb290LlxuICAgIHtcbiAgICBvcDogXCJJUyBOVUxMXCIsXG4gICAgY3R5cGU6IFwibnVsbFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVMTEFCTEVUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIklTIE5PVCBOVUxMXCIsXG4gICAgY3R5cGU6IFwibnVsbFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVMTEFCTEVUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBhdCBhbnkgbm9uLWF0dHJpYnV0ZSBub2RlIChpLmUuLCB0aGUgcm9vdCwgb3IgYW55IFxuICAgIC8vIHJlZmVyZW5jZSBvciBjb2xsZWN0aW9uIG5vZGUpLlxuICAgIHtcbiAgICBvcDogXCJMT09LVVBcIixcbiAgICBjdHlwZTogXCJsb29rdXBcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBhdCBhbnkgbm9uLWF0dHJpYnV0ZSBub2RlIGV4Y2VwdCB0aGUgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVNBXCIsXG4gICAgY3R5cGU6IFwic3ViY2xhc3NcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH1dO1xuLy9cbmxldCBPUElOREVYID0gT1BTLnJlZHVjZShmdW5jdGlvbih4LG8pe1xuICAgIHhbby5vcF0gPSBvO1xuICAgIHJldHVybiB4O1xufSwge30pO1xuXG5leHBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9vcHMuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibGV0IHMgPSBgXG4zZF9yb3RhdGlvbiBlODRkXG5hY191bml0IGViM2JcbmFjY2Vzc19hbGFybSBlMTkwXG5hY2Nlc3NfYWxhcm1zIGUxOTFcbmFjY2Vzc190aW1lIGUxOTJcbmFjY2Vzc2liaWxpdHkgZTg0ZVxuYWNjZXNzaWJsZSBlOTE0XG5hY2NvdW50X2JhbGFuY2UgZTg0ZlxuYWNjb3VudF9iYWxhbmNlX3dhbGxldCBlODUwXG5hY2NvdW50X2JveCBlODUxXG5hY2NvdW50X2NpcmNsZSBlODUzXG5hZGIgZTYwZVxuYWRkIGUxNDVcbmFkZF9hX3Bob3RvIGU0MzlcbmFkZF9hbGFybSBlMTkzXG5hZGRfYWxlcnQgZTAwM1xuYWRkX2JveCBlMTQ2XG5hZGRfY2lyY2xlIGUxNDdcbmFkZF9jaXJjbGVfb3V0bGluZSBlMTQ4XG5hZGRfbG9jYXRpb24gZTU2N1xuYWRkX3Nob3BwaW5nX2NhcnQgZTg1NFxuYWRkX3RvX3Bob3RvcyBlMzlkXG5hZGRfdG9fcXVldWUgZTA1Y1xuYWRqdXN0IGUzOWVcbmFpcmxpbmVfc2VhdF9mbGF0IGU2MzBcbmFpcmxpbmVfc2VhdF9mbGF0X2FuZ2xlZCBlNjMxXG5haXJsaW5lX3NlYXRfaW5kaXZpZHVhbF9zdWl0ZSBlNjMyXG5haXJsaW5lX3NlYXRfbGVncm9vbV9leHRyYSBlNjMzXG5haXJsaW5lX3NlYXRfbGVncm9vbV9ub3JtYWwgZTYzNFxuYWlybGluZV9zZWF0X2xlZ3Jvb21fcmVkdWNlZCBlNjM1XG5haXJsaW5lX3NlYXRfcmVjbGluZV9leHRyYSBlNjM2XG5haXJsaW5lX3NlYXRfcmVjbGluZV9ub3JtYWwgZTYzN1xuYWlycGxhbmVtb2RlX2FjdGl2ZSBlMTk1XG5haXJwbGFuZW1vZGVfaW5hY3RpdmUgZTE5NFxuYWlycGxheSBlMDU1XG5haXJwb3J0X3NodXR0bGUgZWIzY1xuYWxhcm0gZTg1NVxuYWxhcm1fYWRkIGU4NTZcbmFsYXJtX29mZiBlODU3XG5hbGFybV9vbiBlODU4XG5hbGJ1bSBlMDE5XG5hbGxfaW5jbHVzaXZlIGViM2RcbmFsbF9vdXQgZTkwYlxuYW5kcm9pZCBlODU5XG5hbm5vdW5jZW1lbnQgZTg1YVxuYXBwcyBlNWMzXG5hcmNoaXZlIGUxNDlcbmFycm93X2JhY2sgZTVjNFxuYXJyb3dfZG93bndhcmQgZTVkYlxuYXJyb3dfZHJvcF9kb3duIGU1YzVcbmFycm93X2Ryb3BfZG93bl9jaXJjbGUgZTVjNlxuYXJyb3dfZHJvcF91cCBlNWM3XG5hcnJvd19mb3J3YXJkIGU1YzhcbmFycm93X3Vwd2FyZCBlNWQ4XG5hcnRfdHJhY2sgZTA2MFxuYXNwZWN0X3JhdGlvIGU4NWJcbmFzc2Vzc21lbnQgZTg1Y1xuYXNzaWdubWVudCBlODVkXG5hc3NpZ25tZW50X2luZCBlODVlXG5hc3NpZ25tZW50X2xhdGUgZTg1ZlxuYXNzaWdubWVudF9yZXR1cm4gZTg2MFxuYXNzaWdubWVudF9yZXR1cm5lZCBlODYxXG5hc3NpZ25tZW50X3R1cm5lZF9pbiBlODYyXG5hc3Npc3RhbnQgZTM5ZlxuYXNzaXN0YW50X3Bob3RvIGUzYTBcbmF0dGFjaF9maWxlIGUyMjZcbmF0dGFjaF9tb25leSBlMjI3XG5hdHRhY2htZW50IGUyYmNcbmF1ZGlvdHJhY2sgZTNhMVxuYXV0b3JlbmV3IGU4NjNcbmF2X3RpbWVyIGUwMWJcbmJhY2tzcGFjZSBlMTRhXG5iYWNrdXAgZTg2NFxuYmF0dGVyeV9hbGVydCBlMTljXG5iYXR0ZXJ5X2NoYXJnaW5nX2Z1bGwgZTFhM1xuYmF0dGVyeV9mdWxsIGUxYTRcbmJhdHRlcnlfc3RkIGUxYTVcbmJhdHRlcnlfdW5rbm93biBlMWE2XG5iZWFjaF9hY2Nlc3MgZWIzZVxuYmVlbmhlcmUgZTUyZFxuYmxvY2sgZTE0YlxuYmx1ZXRvb3RoIGUxYTdcbmJsdWV0b290aF9hdWRpbyBlNjBmXG5ibHVldG9vdGhfY29ubmVjdGVkIGUxYThcbmJsdWV0b290aF9kaXNhYmxlZCBlMWE5XG5ibHVldG9vdGhfc2VhcmNoaW5nIGUxYWFcbmJsdXJfY2lyY3VsYXIgZTNhMlxuYmx1cl9saW5lYXIgZTNhM1xuYmx1cl9vZmYgZTNhNFxuYmx1cl9vbiBlM2E1XG5ib29rIGU4NjVcbmJvb2ttYXJrIGU4NjZcbmJvb2ttYXJrX2JvcmRlciBlODY3XG5ib3JkZXJfYWxsIGUyMjhcbmJvcmRlcl9ib3R0b20gZTIyOVxuYm9yZGVyX2NsZWFyIGUyMmFcbmJvcmRlcl9jb2xvciBlMjJiXG5ib3JkZXJfaG9yaXpvbnRhbCBlMjJjXG5ib3JkZXJfaW5uZXIgZTIyZFxuYm9yZGVyX2xlZnQgZTIyZVxuYm9yZGVyX291dGVyIGUyMmZcbmJvcmRlcl9yaWdodCBlMjMwXG5ib3JkZXJfc3R5bGUgZTIzMVxuYm9yZGVyX3RvcCBlMjMyXG5ib3JkZXJfdmVydGljYWwgZTIzM1xuYnJhbmRpbmdfd2F0ZXJtYXJrIGUwNmJcbmJyaWdodG5lc3NfMSBlM2E2XG5icmlnaHRuZXNzXzIgZTNhN1xuYnJpZ2h0bmVzc18zIGUzYThcbmJyaWdodG5lc3NfNCBlM2E5XG5icmlnaHRuZXNzXzUgZTNhYVxuYnJpZ2h0bmVzc182IGUzYWJcbmJyaWdodG5lc3NfNyBlM2FjXG5icmlnaHRuZXNzX2F1dG8gZTFhYlxuYnJpZ2h0bmVzc19oaWdoIGUxYWNcbmJyaWdodG5lc3NfbG93IGUxYWRcbmJyaWdodG5lc3NfbWVkaXVtIGUxYWVcbmJyb2tlbl9pbWFnZSBlM2FkXG5icnVzaCBlM2FlXG5idWJibGVfY2hhcnQgZTZkZFxuYnVnX3JlcG9ydCBlODY4XG5idWlsZCBlODY5XG5idXJzdF9tb2RlIGU0M2NcbmJ1c2luZXNzIGUwYWZcbmJ1c2luZXNzX2NlbnRlciBlYjNmXG5jYWNoZWQgZTg2YVxuY2FrZSBlN2U5XG5jYWxsIGUwYjBcbmNhbGxfZW5kIGUwYjFcbmNhbGxfbWFkZSBlMGIyXG5jYWxsX21lcmdlIGUwYjNcbmNhbGxfbWlzc2VkIGUwYjRcbmNhbGxfbWlzc2VkX291dGdvaW5nIGUwZTRcbmNhbGxfcmVjZWl2ZWQgZTBiNVxuY2FsbF9zcGxpdCBlMGI2XG5jYWxsX3RvX2FjdGlvbiBlMDZjXG5jYW1lcmEgZTNhZlxuY2FtZXJhX2FsdCBlM2IwXG5jYW1lcmFfZW5oYW5jZSBlOGZjXG5jYW1lcmFfZnJvbnQgZTNiMVxuY2FtZXJhX3JlYXIgZTNiMlxuY2FtZXJhX3JvbGwgZTNiM1xuY2FuY2VsIGU1YzlcbmNhcmRfZ2lmdGNhcmQgZThmNlxuY2FyZF9tZW1iZXJzaGlwIGU4ZjdcbmNhcmRfdHJhdmVsIGU4ZjhcbmNhc2lubyBlYjQwXG5jYXN0IGUzMDdcbmNhc3RfY29ubmVjdGVkIGUzMDhcbmNlbnRlcl9mb2N1c19zdHJvbmcgZTNiNFxuY2VudGVyX2ZvY3VzX3dlYWsgZTNiNVxuY2hhbmdlX2hpc3RvcnkgZTg2YlxuY2hhdCBlMGI3XG5jaGF0X2J1YmJsZSBlMGNhXG5jaGF0X2J1YmJsZV9vdXRsaW5lIGUwY2JcbmNoZWNrIGU1Y2FcbmNoZWNrX2JveCBlODM0XG5jaGVja19ib3hfb3V0bGluZV9ibGFuayBlODM1XG5jaGVja19jaXJjbGUgZTg2Y1xuY2hldnJvbl9sZWZ0IGU1Y2JcbmNoZXZyb25fcmlnaHQgZTVjY1xuY2hpbGRfY2FyZSBlYjQxXG5jaGlsZF9mcmllbmRseSBlYjQyXG5jaHJvbWVfcmVhZGVyX21vZGUgZTg2ZFxuY2xhc3MgZTg2ZVxuY2xlYXIgZTE0Y1xuY2xlYXJfYWxsIGUwYjhcbmNsb3NlIGU1Y2RcbmNsb3NlZF9jYXB0aW9uIGUwMWNcbmNsb3VkIGUyYmRcbmNsb3VkX2NpcmNsZSBlMmJlXG5jbG91ZF9kb25lIGUyYmZcbmNsb3VkX2Rvd25sb2FkIGUyYzBcbmNsb3VkX29mZiBlMmMxXG5jbG91ZF9xdWV1ZSBlMmMyXG5jbG91ZF91cGxvYWQgZTJjM1xuY29kZSBlODZmXG5jb2xsZWN0aW9ucyBlM2I2XG5jb2xsZWN0aW9uc19ib29rbWFyayBlNDMxXG5jb2xvcl9sZW5zIGUzYjdcbmNvbG9yaXplIGUzYjhcbmNvbW1lbnQgZTBiOVxuY29tcGFyZSBlM2I5XG5jb21wYXJlX2Fycm93cyBlOTE1XG5jb21wdXRlciBlMzBhXG5jb25maXJtYXRpb25fbnVtYmVyIGU2MzhcbmNvbnRhY3RfbWFpbCBlMGQwXG5jb250YWN0X3Bob25lIGUwY2ZcbmNvbnRhY3RzIGUwYmFcbmNvbnRlbnRfY29weSBlMTRkXG5jb250ZW50X2N1dCBlMTRlXG5jb250ZW50X3Bhc3RlIGUxNGZcbmNvbnRyb2xfcG9pbnQgZTNiYVxuY29udHJvbF9wb2ludF9kdXBsaWNhdGUgZTNiYlxuY29weXJpZ2h0IGU5MGNcbmNyZWF0ZSBlMTUwXG5jcmVhdGVfbmV3X2ZvbGRlciBlMmNjXG5jcmVkaXRfY2FyZCBlODcwXG5jcm9wIGUzYmVcbmNyb3BfMTZfOSBlM2JjXG5jcm9wXzNfMiBlM2JkXG5jcm9wXzVfNCBlM2JmXG5jcm9wXzdfNSBlM2MwXG5jcm9wX2RpbiBlM2MxXG5jcm9wX2ZyZWUgZTNjMlxuY3JvcF9sYW5kc2NhcGUgZTNjM1xuY3JvcF9vcmlnaW5hbCBlM2M0XG5jcm9wX3BvcnRyYWl0IGUzYzVcbmNyb3Bfcm90YXRlIGU0MzdcbmNyb3Bfc3F1YXJlIGUzYzZcbmRhc2hib2FyZCBlODcxXG5kYXRhX3VzYWdlIGUxYWZcbmRhdGVfcmFuZ2UgZTkxNlxuZGVoYXplIGUzYzdcbmRlbGV0ZSBlODcyXG5kZWxldGVfZm9yZXZlciBlOTJiXG5kZWxldGVfc3dlZXAgZTE2Y1xuZGVzY3JpcHRpb24gZTg3M1xuZGVza3RvcF9tYWMgZTMwYlxuZGVza3RvcF93aW5kb3dzIGUzMGNcbmRldGFpbHMgZTNjOFxuZGV2ZWxvcGVyX2JvYXJkIGUzMGRcbmRldmVsb3Blcl9tb2RlIGUxYjBcbmRldmljZV9odWIgZTMzNVxuZGV2aWNlcyBlMWIxXG5kZXZpY2VzX290aGVyIGUzMzdcbmRpYWxlcl9zaXAgZTBiYlxuZGlhbHBhZCBlMGJjXG5kaXJlY3Rpb25zIGU1MmVcbmRpcmVjdGlvbnNfYmlrZSBlNTJmXG5kaXJlY3Rpb25zX2JvYXQgZTUzMlxuZGlyZWN0aW9uc19idXMgZTUzMFxuZGlyZWN0aW9uc19jYXIgZTUzMVxuZGlyZWN0aW9uc19yYWlsd2F5IGU1MzRcbmRpcmVjdGlvbnNfcnVuIGU1NjZcbmRpcmVjdGlvbnNfc3Vid2F5IGU1MzNcbmRpcmVjdGlvbnNfdHJhbnNpdCBlNTM1XG5kaXJlY3Rpb25zX3dhbGsgZTUzNlxuZGlzY19mdWxsIGU2MTBcbmRucyBlODc1XG5kb19ub3RfZGlzdHVyYiBlNjEyXG5kb19ub3RfZGlzdHVyYl9hbHQgZTYxMVxuZG9fbm90X2Rpc3R1cmJfb2ZmIGU2NDNcbmRvX25vdF9kaXN0dXJiX29uIGU2NDRcbmRvY2sgZTMwZVxuZG9tYWluIGU3ZWVcbmRvbmUgZTg3NlxuZG9uZV9hbGwgZTg3N1xuZG9udXRfbGFyZ2UgZTkxN1xuZG9udXRfc21hbGwgZTkxOFxuZHJhZnRzIGUxNTFcbmRyYWdfaGFuZGxlIGUyNWRcbmRyaXZlX2V0YSBlNjEzXG5kdnIgZTFiMlxuZWRpdCBlM2M5XG5lZGl0X2xvY2F0aW9uIGU1NjhcbmVqZWN0IGU4ZmJcbmVtYWlsIGUwYmVcbmVuaGFuY2VkX2VuY3J5cHRpb24gZTYzZlxuZXF1YWxpemVyIGUwMWRcbmVycm9yIGUwMDBcbmVycm9yX291dGxpbmUgZTAwMVxuZXVyb19zeW1ib2wgZTkyNlxuZXZfc3RhdGlvbiBlNTZkXG5ldmVudCBlODc4XG5ldmVudF9hdmFpbGFibGUgZTYxNFxuZXZlbnRfYnVzeSBlNjE1XG5ldmVudF9ub3RlIGU2MTZcbmV2ZW50X3NlYXQgZTkwM1xuZXhpdF90b19hcHAgZTg3OVxuZXhwYW5kX2xlc3MgZTVjZVxuZXhwYW5kX21vcmUgZTVjZlxuZXhwbGljaXQgZTAxZVxuZXhwbG9yZSBlODdhXG5leHBvc3VyZSBlM2NhXG5leHBvc3VyZV9uZWdfMSBlM2NiXG5leHBvc3VyZV9uZWdfMiBlM2NjXG5leHBvc3VyZV9wbHVzXzEgZTNjZFxuZXhwb3N1cmVfcGx1c18yIGUzY2VcbmV4cG9zdXJlX3plcm8gZTNjZlxuZXh0ZW5zaW9uIGU4N2JcbmZhY2UgZTg3Y1xuZmFzdF9mb3J3YXJkIGUwMWZcbmZhc3RfcmV3aW5kIGUwMjBcbmZhdm9yaXRlIGU4N2RcbmZhdm9yaXRlX2JvcmRlciBlODdlXG5mZWF0dXJlZF9wbGF5X2xpc3QgZTA2ZFxuZmVhdHVyZWRfdmlkZW8gZTA2ZVxuZmVlZGJhY2sgZTg3ZlxuZmliZXJfZHZyIGUwNWRcbmZpYmVyX21hbnVhbF9yZWNvcmQgZTA2MVxuZmliZXJfbmV3IGUwNWVcbmZpYmVyX3BpbiBlMDZhXG5maWJlcl9zbWFydF9yZWNvcmQgZTA2MlxuZmlsZV9kb3dubG9hZCBlMmM0XG5maWxlX3VwbG9hZCBlMmM2XG5maWx0ZXIgZTNkM1xuZmlsdGVyXzEgZTNkMFxuZmlsdGVyXzIgZTNkMVxuZmlsdGVyXzMgZTNkMlxuZmlsdGVyXzQgZTNkNFxuZmlsdGVyXzUgZTNkNVxuZmlsdGVyXzYgZTNkNlxuZmlsdGVyXzcgZTNkN1xuZmlsdGVyXzggZTNkOFxuZmlsdGVyXzkgZTNkOVxuZmlsdGVyXzlfcGx1cyBlM2RhXG5maWx0ZXJfYl9hbmRfdyBlM2RiXG5maWx0ZXJfY2VudGVyX2ZvY3VzIGUzZGNcbmZpbHRlcl9kcmFtYSBlM2RkXG5maWx0ZXJfZnJhbWVzIGUzZGVcbmZpbHRlcl9oZHIgZTNkZlxuZmlsdGVyX2xpc3QgZTE1MlxuZmlsdGVyX25vbmUgZTNlMFxuZmlsdGVyX3RpbHRfc2hpZnQgZTNlMlxuZmlsdGVyX3ZpbnRhZ2UgZTNlM1xuZmluZF9pbl9wYWdlIGU4ODBcbmZpbmRfcmVwbGFjZSBlODgxXG5maW5nZXJwcmludCBlOTBkXG5maXJzdF9wYWdlIGU1ZGNcbmZpdG5lc3NfY2VudGVyIGViNDNcbmZsYWcgZTE1M1xuZmxhcmUgZTNlNFxuZmxhc2hfYXV0byBlM2U1XG5mbGFzaF9vZmYgZTNlNlxuZmxhc2hfb24gZTNlN1xuZmxpZ2h0IGU1MzlcbmZsaWdodF9sYW5kIGU5MDRcbmZsaWdodF90YWtlb2ZmIGU5MDVcbmZsaXAgZTNlOFxuZmxpcF90b19iYWNrIGU4ODJcbmZsaXBfdG9fZnJvbnQgZTg4M1xuZm9sZGVyIGUyYzdcbmZvbGRlcl9vcGVuIGUyYzhcbmZvbGRlcl9zaGFyZWQgZTJjOVxuZm9sZGVyX3NwZWNpYWwgZTYxN1xuZm9udF9kb3dubG9hZCBlMTY3XG5mb3JtYXRfYWxpZ25fY2VudGVyIGUyMzRcbmZvcm1hdF9hbGlnbl9qdXN0aWZ5IGUyMzVcbmZvcm1hdF9hbGlnbl9sZWZ0IGUyMzZcbmZvcm1hdF9hbGlnbl9yaWdodCBlMjM3XG5mb3JtYXRfYm9sZCBlMjM4XG5mb3JtYXRfY2xlYXIgZTIzOVxuZm9ybWF0X2NvbG9yX2ZpbGwgZTIzYVxuZm9ybWF0X2NvbG9yX3Jlc2V0IGUyM2JcbmZvcm1hdF9jb2xvcl90ZXh0IGUyM2NcbmZvcm1hdF9pbmRlbnRfZGVjcmVhc2UgZTIzZFxuZm9ybWF0X2luZGVudF9pbmNyZWFzZSBlMjNlXG5mb3JtYXRfaXRhbGljIGUyM2ZcbmZvcm1hdF9saW5lX3NwYWNpbmcgZTI0MFxuZm9ybWF0X2xpc3RfYnVsbGV0ZWQgZTI0MVxuZm9ybWF0X2xpc3RfbnVtYmVyZWQgZTI0MlxuZm9ybWF0X3BhaW50IGUyNDNcbmZvcm1hdF9xdW90ZSBlMjQ0XG5mb3JtYXRfc2hhcGVzIGUyNWVcbmZvcm1hdF9zaXplIGUyNDVcbmZvcm1hdF9zdHJpa2V0aHJvdWdoIGUyNDZcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX2xfdG9fciBlMjQ3XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9yX3RvX2wgZTI0OFxuZm9ybWF0X3VuZGVybGluZWQgZTI0OVxuZm9ydW0gZTBiZlxuZm9yd2FyZCBlMTU0XG5mb3J3YXJkXzEwIGUwNTZcbmZvcndhcmRfMzAgZTA1N1xuZm9yd2FyZF81IGUwNThcbmZyZWVfYnJlYWtmYXN0IGViNDRcbmZ1bGxzY3JlZW4gZTVkMFxuZnVsbHNjcmVlbl9leGl0IGU1ZDFcbmZ1bmN0aW9ucyBlMjRhXG5nX3RyYW5zbGF0ZSBlOTI3XG5nYW1lcGFkIGUzMGZcbmdhbWVzIGUwMjFcbmdhdmVsIGU5MGVcbmdlc3R1cmUgZTE1NVxuZ2V0X2FwcCBlODg0XG5naWYgZTkwOFxuZ29sZl9jb3Vyc2UgZWI0NVxuZ3BzX2ZpeGVkIGUxYjNcbmdwc19ub3RfZml4ZWQgZTFiNFxuZ3BzX29mZiBlMWI1XG5ncmFkZSBlODg1XG5ncmFkaWVudCBlM2U5XG5ncmFpbiBlM2VhXG5ncmFwaGljX2VxIGUxYjhcbmdyaWRfb2ZmIGUzZWJcbmdyaWRfb24gZTNlY1xuZ3JvdXAgZTdlZlxuZ3JvdXBfYWRkIGU3ZjBcbmdyb3VwX3dvcmsgZTg4NlxuaGQgZTA1MlxuaGRyX29mZiBlM2VkXG5oZHJfb24gZTNlZVxuaGRyX3N0cm9uZyBlM2YxXG5oZHJfd2VhayBlM2YyXG5oZWFkc2V0IGUzMTBcbmhlYWRzZXRfbWljIGUzMTFcbmhlYWxpbmcgZTNmM1xuaGVhcmluZyBlMDIzXG5oZWxwIGU4ODdcbmhlbHBfb3V0bGluZSBlOGZkXG5oaWdoX3F1YWxpdHkgZTAyNFxuaGlnaGxpZ2h0IGUyNWZcbmhpZ2hsaWdodF9vZmYgZTg4OFxuaGlzdG9yeSBlODg5XG5ob21lIGU4OGFcbmhvdF90dWIgZWI0NlxuaG90ZWwgZTUzYVxuaG91cmdsYXNzX2VtcHR5IGU4OGJcbmhvdXJnbGFzc19mdWxsIGU4OGNcbmh0dHAgZTkwMlxuaHR0cHMgZTg4ZFxuaW1hZ2UgZTNmNFxuaW1hZ2VfYXNwZWN0X3JhdGlvIGUzZjVcbmltcG9ydF9jb250YWN0cyBlMGUwXG5pbXBvcnRfZXhwb3J0IGUwYzNcbmltcG9ydGFudF9kZXZpY2VzIGU5MTJcbmluYm94IGUxNTZcbmluZGV0ZXJtaW5hdGVfY2hlY2tfYm94IGU5MDlcbmluZm8gZTg4ZVxuaW5mb19vdXRsaW5lIGU4OGZcbmlucHV0IGU4OTBcbmluc2VydF9jaGFydCBlMjRiXG5pbnNlcnRfY29tbWVudCBlMjRjXG5pbnNlcnRfZHJpdmVfZmlsZSBlMjRkXG5pbnNlcnRfZW1vdGljb24gZTI0ZVxuaW5zZXJ0X2ludml0YXRpb24gZTI0ZlxuaW5zZXJ0X2xpbmsgZTI1MFxuaW5zZXJ0X3Bob3RvIGUyNTFcbmludmVydF9jb2xvcnMgZTg5MVxuaW52ZXJ0X2NvbG9yc19vZmYgZTBjNFxuaXNvIGUzZjZcbmtleWJvYXJkIGUzMTJcbmtleWJvYXJkX2Fycm93X2Rvd24gZTMxM1xua2V5Ym9hcmRfYXJyb3dfbGVmdCBlMzE0XG5rZXlib2FyZF9hcnJvd19yaWdodCBlMzE1XG5rZXlib2FyZF9hcnJvd191cCBlMzE2XG5rZXlib2FyZF9iYWNrc3BhY2UgZTMxN1xua2V5Ym9hcmRfY2Fwc2xvY2sgZTMxOFxua2V5Ym9hcmRfaGlkZSBlMzFhXG5rZXlib2FyZF9yZXR1cm4gZTMxYlxua2V5Ym9hcmRfdGFiIGUzMWNcbmtleWJvYXJkX3ZvaWNlIGUzMWRcbmtpdGNoZW4gZWI0N1xubGFiZWwgZTg5MlxubGFiZWxfb3V0bGluZSBlODkzXG5sYW5kc2NhcGUgZTNmN1xubGFuZ3VhZ2UgZTg5NFxubGFwdG9wIGUzMWVcbmxhcHRvcF9jaHJvbWVib29rIGUzMWZcbmxhcHRvcF9tYWMgZTMyMFxubGFwdG9wX3dpbmRvd3MgZTMyMVxubGFzdF9wYWdlIGU1ZGRcbmxhdW5jaCBlODk1XG5sYXllcnMgZTUzYlxubGF5ZXJzX2NsZWFyIGU1M2NcbmxlYWtfYWRkIGUzZjhcbmxlYWtfcmVtb3ZlIGUzZjlcbmxlbnMgZTNmYVxubGlicmFyeV9hZGQgZTAyZVxubGlicmFyeV9ib29rcyBlMDJmXG5saWJyYXJ5X211c2ljIGUwMzBcbmxpZ2h0YnVsYl9vdXRsaW5lIGU5MGZcbmxpbmVfc3R5bGUgZTkxOVxubGluZV93ZWlnaHQgZTkxYVxubGluZWFyX3NjYWxlIGUyNjBcbmxpbmsgZTE1N1xubGlua2VkX2NhbWVyYSBlNDM4XG5saXN0IGU4OTZcbmxpdmVfaGVscCBlMGM2XG5saXZlX3R2IGU2MzlcbmxvY2FsX2FjdGl2aXR5IGU1M2ZcbmxvY2FsX2FpcnBvcnQgZTUzZFxubG9jYWxfYXRtIGU1M2VcbmxvY2FsX2JhciBlNTQwXG5sb2NhbF9jYWZlIGU1NDFcbmxvY2FsX2Nhcl93YXNoIGU1NDJcbmxvY2FsX2NvbnZlbmllbmNlX3N0b3JlIGU1NDNcbmxvY2FsX2RpbmluZyBlNTU2XG5sb2NhbF9kcmluayBlNTQ0XG5sb2NhbF9mbG9yaXN0IGU1NDVcbmxvY2FsX2dhc19zdGF0aW9uIGU1NDZcbmxvY2FsX2dyb2Nlcnlfc3RvcmUgZTU0N1xubG9jYWxfaG9zcGl0YWwgZTU0OFxubG9jYWxfaG90ZWwgZTU0OVxubG9jYWxfbGF1bmRyeV9zZXJ2aWNlIGU1NGFcbmxvY2FsX2xpYnJhcnkgZTU0YlxubG9jYWxfbWFsbCBlNTRjXG5sb2NhbF9tb3ZpZXMgZTU0ZFxubG9jYWxfb2ZmZXIgZTU0ZVxubG9jYWxfcGFya2luZyBlNTRmXG5sb2NhbF9waGFybWFjeSBlNTUwXG5sb2NhbF9waG9uZSBlNTUxXG5sb2NhbF9waXp6YSBlNTUyXG5sb2NhbF9wbGF5IGU1NTNcbmxvY2FsX3Bvc3Rfb2ZmaWNlIGU1NTRcbmxvY2FsX3ByaW50c2hvcCBlNTU1XG5sb2NhbF9zZWUgZTU1N1xubG9jYWxfc2hpcHBpbmcgZTU1OFxubG9jYWxfdGF4aSBlNTU5XG5sb2NhdGlvbl9jaXR5IGU3ZjFcbmxvY2F0aW9uX2Rpc2FibGVkIGUxYjZcbmxvY2F0aW9uX29mZiBlMGM3XG5sb2NhdGlvbl9vbiBlMGM4XG5sb2NhdGlvbl9zZWFyY2hpbmcgZTFiN1xubG9jayBlODk3XG5sb2NrX29wZW4gZTg5OFxubG9ja19vdXRsaW5lIGU4OTlcbmxvb2tzIGUzZmNcbmxvb2tzXzMgZTNmYlxubG9va3NfNCBlM2ZkXG5sb29rc181IGUzZmVcbmxvb2tzXzYgZTNmZlxubG9va3Nfb25lIGU0MDBcbmxvb2tzX3R3byBlNDAxXG5sb29wIGUwMjhcbmxvdXBlIGU0MDJcbmxvd19wcmlvcml0eSBlMTZkXG5sb3lhbHR5IGU4OWFcbm1haWwgZTE1OFxubWFpbF9vdXRsaW5lIGUwZTFcbm1hcCBlNTViXG5tYXJrdW5yZWFkIGUxNTlcbm1hcmt1bnJlYWRfbWFpbGJveCBlODliXG5tZW1vcnkgZTMyMlxubWVudSBlNWQyXG5tZXJnZV90eXBlIGUyNTJcbm1lc3NhZ2UgZTBjOVxubWljIGUwMjlcbm1pY19ub25lIGUwMmFcbm1pY19vZmYgZTAyYlxubW1zIGU2MThcbm1vZGVfY29tbWVudCBlMjUzXG5tb2RlX2VkaXQgZTI1NFxubW9uZXRpemF0aW9uX29uIGUyNjNcbm1vbmV5X29mZiBlMjVjXG5tb25vY2hyb21lX3Bob3RvcyBlNDAzXG5tb29kIGU3ZjJcbm1vb2RfYmFkIGU3ZjNcbm1vcmUgZTYxOVxubW9yZV9ob3JpeiBlNWQzXG5tb3JlX3ZlcnQgZTVkNFxubW90b3JjeWNsZSBlOTFiXG5tb3VzZSBlMzIzXG5tb3ZlX3RvX2luYm94IGUxNjhcbm1vdmllIGUwMmNcbm1vdmllX2NyZWF0aW9uIGU0MDRcbm1vdmllX2ZpbHRlciBlNDNhXG5tdWx0aWxpbmVfY2hhcnQgZTZkZlxubXVzaWNfbm90ZSBlNDA1XG5tdXNpY192aWRlbyBlMDYzXG5teV9sb2NhdGlvbiBlNTVjXG5uYXR1cmUgZTQwNlxubmF0dXJlX3Blb3BsZSBlNDA3XG5uYXZpZ2F0ZV9iZWZvcmUgZTQwOFxubmF2aWdhdGVfbmV4dCBlNDA5XG5uYXZpZ2F0aW9uIGU1NWRcbm5lYXJfbWUgZTU2OVxubmV0d29ya19jZWxsIGUxYjlcbm5ldHdvcmtfY2hlY2sgZTY0MFxubmV0d29ya19sb2NrZWQgZTYxYVxubmV0d29ya193aWZpIGUxYmFcbm5ld19yZWxlYXNlcyBlMDMxXG5uZXh0X3dlZWsgZTE2YVxubmZjIGUxYmJcbm5vX2VuY3J5cHRpb24gZTY0MVxubm9fc2ltIGUwY2Ncbm5vdF9pbnRlcmVzdGVkIGUwMzNcbm5vdGUgZTA2Zlxubm90ZV9hZGQgZTg5Y1xubm90aWZpY2F0aW9ucyBlN2Y0XG5ub3RpZmljYXRpb25zX2FjdGl2ZSBlN2Y3XG5ub3RpZmljYXRpb25zX25vbmUgZTdmNVxubm90aWZpY2F0aW9uc19vZmYgZTdmNlxubm90aWZpY2F0aW9uc19wYXVzZWQgZTdmOFxub2ZmbGluZV9waW4gZTkwYVxub25kZW1hbmRfdmlkZW8gZTYzYVxub3BhY2l0eSBlOTFjXG5vcGVuX2luX2Jyb3dzZXIgZTg5ZFxub3Blbl9pbl9uZXcgZTg5ZVxub3Blbl93aXRoIGU4OWZcbnBhZ2VzIGU3ZjlcbnBhZ2V2aWV3IGU4YTBcbnBhbGV0dGUgZTQwYVxucGFuX3Rvb2wgZTkyNVxucGFub3JhbWEgZTQwYlxucGFub3JhbWFfZmlzaF9leWUgZTQwY1xucGFub3JhbWFfaG9yaXpvbnRhbCBlNDBkXG5wYW5vcmFtYV92ZXJ0aWNhbCBlNDBlXG5wYW5vcmFtYV93aWRlX2FuZ2xlIGU0MGZcbnBhcnR5X21vZGUgZTdmYVxucGF1c2UgZTAzNFxucGF1c2VfY2lyY2xlX2ZpbGxlZCBlMDM1XG5wYXVzZV9jaXJjbGVfb3V0bGluZSBlMDM2XG5wYXltZW50IGU4YTFcbnBlb3BsZSBlN2ZiXG5wZW9wbGVfb3V0bGluZSBlN2ZjXG5wZXJtX2NhbWVyYV9taWMgZThhMlxucGVybV9jb250YWN0X2NhbGVuZGFyIGU4YTNcbnBlcm1fZGF0YV9zZXR0aW5nIGU4YTRcbnBlcm1fZGV2aWNlX2luZm9ybWF0aW9uIGU4YTVcbnBlcm1faWRlbnRpdHkgZThhNlxucGVybV9tZWRpYSBlOGE3XG5wZXJtX3Bob25lX21zZyBlOGE4XG5wZXJtX3NjYW5fd2lmaSBlOGE5XG5wZXJzb24gZTdmZFxucGVyc29uX2FkZCBlN2ZlXG5wZXJzb25fb3V0bGluZSBlN2ZmXG5wZXJzb25fcGluIGU1NWFcbnBlcnNvbl9waW5fY2lyY2xlIGU1NmFcbnBlcnNvbmFsX3ZpZGVvIGU2M2JcbnBldHMgZTkxZFxucGhvbmUgZTBjZFxucGhvbmVfYW5kcm9pZCBlMzI0XG5waG9uZV9ibHVldG9vdGhfc3BlYWtlciBlNjFiXG5waG9uZV9mb3J3YXJkZWQgZTYxY1xucGhvbmVfaW5fdGFsayBlNjFkXG5waG9uZV9pcGhvbmUgZTMyNVxucGhvbmVfbG9ja2VkIGU2MWVcbnBob25lX21pc3NlZCBlNjFmXG5waG9uZV9wYXVzZWQgZTYyMFxucGhvbmVsaW5rIGUzMjZcbnBob25lbGlua19lcmFzZSBlMGRiXG5waG9uZWxpbmtfbG9jayBlMGRjXG5waG9uZWxpbmtfb2ZmIGUzMjdcbnBob25lbGlua19yaW5nIGUwZGRcbnBob25lbGlua19zZXR1cCBlMGRlXG5waG90byBlNDEwXG5waG90b19hbGJ1bSBlNDExXG5waG90b19jYW1lcmEgZTQxMlxucGhvdG9fZmlsdGVyIGU0M2JcbnBob3RvX2xpYnJhcnkgZTQxM1xucGhvdG9fc2l6ZV9zZWxlY3RfYWN0dWFsIGU0MzJcbnBob3RvX3NpemVfc2VsZWN0X2xhcmdlIGU0MzNcbnBob3RvX3NpemVfc2VsZWN0X3NtYWxsIGU0MzRcbnBpY3R1cmVfYXNfcGRmIGU0MTVcbnBpY3R1cmVfaW5fcGljdHVyZSBlOGFhXG5waWN0dXJlX2luX3BpY3R1cmVfYWx0IGU5MTFcbnBpZV9jaGFydCBlNmM0XG5waWVfY2hhcnRfb3V0bGluZWQgZTZjNVxucGluX2Ryb3AgZTU1ZVxucGxhY2UgZTU1ZlxucGxheV9hcnJvdyBlMDM3XG5wbGF5X2NpcmNsZV9maWxsZWQgZTAzOFxucGxheV9jaXJjbGVfb3V0bGluZSBlMDM5XG5wbGF5X2Zvcl93b3JrIGU5MDZcbnBsYXlsaXN0X2FkZCBlMDNiXG5wbGF5bGlzdF9hZGRfY2hlY2sgZTA2NVxucGxheWxpc3RfcGxheSBlMDVmXG5wbHVzX29uZSBlODAwXG5wb2xsIGU4MDFcbnBvbHltZXIgZThhYlxucG9vbCBlYjQ4XG5wb3J0YWJsZV93aWZpX29mZiBlMGNlXG5wb3J0cmFpdCBlNDE2XG5wb3dlciBlNjNjXG5wb3dlcl9pbnB1dCBlMzM2XG5wb3dlcl9zZXR0aW5nc19uZXcgZThhY1xucHJlZ25hbnRfd29tYW4gZTkxZVxucHJlc2VudF90b19hbGwgZTBkZlxucHJpbnQgZThhZFxucHJpb3JpdHlfaGlnaCBlNjQ1XG5wdWJsaWMgZTgwYlxucHVibGlzaCBlMjU1XG5xdWVyeV9idWlsZGVyIGU4YWVcbnF1ZXN0aW9uX2Fuc3dlciBlOGFmXG5xdWV1ZSBlMDNjXG5xdWV1ZV9tdXNpYyBlMDNkXG5xdWV1ZV9wbGF5X25leHQgZTA2NlxucmFkaW8gZTAzZVxucmFkaW9fYnV0dG9uX2NoZWNrZWQgZTgzN1xucmFkaW9fYnV0dG9uX3VuY2hlY2tlZCBlODM2XG5yYXRlX3JldmlldyBlNTYwXG5yZWNlaXB0IGU4YjBcbnJlY2VudF9hY3RvcnMgZTAzZlxucmVjb3JkX3ZvaWNlX292ZXIgZTkxZlxucmVkZWVtIGU4YjFcbnJlZG8gZTE1YVxucmVmcmVzaCBlNWQ1XG5yZW1vdmUgZTE1YlxucmVtb3ZlX2NpcmNsZSBlMTVjXG5yZW1vdmVfY2lyY2xlX291dGxpbmUgZTE1ZFxucmVtb3ZlX2Zyb21fcXVldWUgZTA2N1xucmVtb3ZlX3JlZF9leWUgZTQxN1xucmVtb3ZlX3Nob3BwaW5nX2NhcnQgZTkyOFxucmVvcmRlciBlOGZlXG5yZXBlYXQgZTA0MFxucmVwZWF0X29uZSBlMDQxXG5yZXBsYXkgZTA0MlxucmVwbGF5XzEwIGUwNTlcbnJlcGxheV8zMCBlMDVhXG5yZXBsYXlfNSBlMDViXG5yZXBseSBlMTVlXG5yZXBseV9hbGwgZTE1ZlxucmVwb3J0IGUxNjBcbnJlcG9ydF9wcm9ibGVtIGU4YjJcbnJlc3RhdXJhbnQgZTU2Y1xucmVzdGF1cmFudF9tZW51IGU1NjFcbnJlc3RvcmUgZThiM1xucmVzdG9yZV9wYWdlIGU5MjlcbnJpbmdfdm9sdW1lIGUwZDFcbnJvb20gZThiNFxucm9vbV9zZXJ2aWNlIGViNDlcbnJvdGF0ZV85MF9kZWdyZWVzX2NjdyBlNDE4XG5yb3RhdGVfbGVmdCBlNDE5XG5yb3RhdGVfcmlnaHQgZTQxYVxucm91bmRlZF9jb3JuZXIgZTkyMFxucm91dGVyIGUzMjhcbnJvd2luZyBlOTIxXG5yc3NfZmVlZCBlMGU1XG5ydl9ob29rdXAgZTY0Mlxuc2F0ZWxsaXRlIGU1NjJcbnNhdmUgZTE2MVxuc2Nhbm5lciBlMzI5XG5zY2hlZHVsZSBlOGI1XG5zY2hvb2wgZTgwY1xuc2NyZWVuX2xvY2tfbGFuZHNjYXBlIGUxYmVcbnNjcmVlbl9sb2NrX3BvcnRyYWl0IGUxYmZcbnNjcmVlbl9sb2NrX3JvdGF0aW9uIGUxYzBcbnNjcmVlbl9yb3RhdGlvbiBlMWMxXG5zY3JlZW5fc2hhcmUgZTBlMlxuc2RfY2FyZCBlNjIzXG5zZF9zdG9yYWdlIGUxYzJcbnNlYXJjaCBlOGI2XG5zZWN1cml0eSBlMzJhXG5zZWxlY3RfYWxsIGUxNjJcbnNlbmQgZTE2M1xuc2VudGltZW50X2Rpc3NhdGlzZmllZCBlODExXG5zZW50aW1lbnRfbmV1dHJhbCBlODEyXG5zZW50aW1lbnRfc2F0aXNmaWVkIGU4MTNcbnNlbnRpbWVudF92ZXJ5X2Rpc3NhdGlzZmllZCBlODE0XG5zZW50aW1lbnRfdmVyeV9zYXRpc2ZpZWQgZTgxNVxuc2V0dGluZ3MgZThiOFxuc2V0dGluZ3NfYXBwbGljYXRpb25zIGU4YjlcbnNldHRpbmdzX2JhY2t1cF9yZXN0b3JlIGU4YmFcbnNldHRpbmdzX2JsdWV0b290aCBlOGJiXG5zZXR0aW5nc19icmlnaHRuZXNzIGU4YmRcbnNldHRpbmdzX2NlbGwgZThiY1xuc2V0dGluZ3NfZXRoZXJuZXQgZThiZVxuc2V0dGluZ3NfaW5wdXRfYW50ZW5uYSBlOGJmXG5zZXR0aW5nc19pbnB1dF9jb21wb25lbnQgZThjMFxuc2V0dGluZ3NfaW5wdXRfY29tcG9zaXRlIGU4YzFcbnNldHRpbmdzX2lucHV0X2hkbWkgZThjMlxuc2V0dGluZ3NfaW5wdXRfc3ZpZGVvIGU4YzNcbnNldHRpbmdzX292ZXJzY2FuIGU4YzRcbnNldHRpbmdzX3Bob25lIGU4YzVcbnNldHRpbmdzX3Bvd2VyIGU4YzZcbnNldHRpbmdzX3JlbW90ZSBlOGM3XG5zZXR0aW5nc19zeXN0ZW1fZGF5ZHJlYW0gZTFjM1xuc2V0dGluZ3Nfdm9pY2UgZThjOFxuc2hhcmUgZTgwZFxuc2hvcCBlOGM5XG5zaG9wX3R3byBlOGNhXG5zaG9wcGluZ19iYXNrZXQgZThjYlxuc2hvcHBpbmdfY2FydCBlOGNjXG5zaG9ydF90ZXh0IGUyNjFcbnNob3dfY2hhcnQgZTZlMVxuc2h1ZmZsZSBlMDQzXG5zaWduYWxfY2VsbHVsYXJfNF9iYXIgZTFjOFxuc2lnbmFsX2NlbGx1bGFyX2Nvbm5lY3RlZF9ub19pbnRlcm5ldF80X2JhciBlMWNkXG5zaWduYWxfY2VsbHVsYXJfbm9fc2ltIGUxY2VcbnNpZ25hbF9jZWxsdWxhcl9udWxsIGUxY2ZcbnNpZ25hbF9jZWxsdWxhcl9vZmYgZTFkMFxuc2lnbmFsX3dpZmlfNF9iYXIgZTFkOFxuc2lnbmFsX3dpZmlfNF9iYXJfbG9jayBlMWQ5XG5zaWduYWxfd2lmaV9vZmYgZTFkYVxuc2ltX2NhcmQgZTMyYlxuc2ltX2NhcmRfYWxlcnQgZTYyNFxuc2tpcF9uZXh0IGUwNDRcbnNraXBfcHJldmlvdXMgZTA0NVxuc2xpZGVzaG93IGU0MWJcbnNsb3dfbW90aW9uX3ZpZGVvIGUwNjhcbnNtYXJ0cGhvbmUgZTMyY1xuc21va2VfZnJlZSBlYjRhXG5zbW9raW5nX3Jvb21zIGViNGJcbnNtcyBlNjI1XG5zbXNfZmFpbGVkIGU2MjZcbnNub296ZSBlMDQ2XG5zb3J0IGUxNjRcbnNvcnRfYnlfYWxwaGEgZTA1M1xuc3BhIGViNGNcbnNwYWNlX2JhciBlMjU2XG5zcGVha2VyIGUzMmRcbnNwZWFrZXJfZ3JvdXAgZTMyZVxuc3BlYWtlcl9ub3RlcyBlOGNkXG5zcGVha2VyX25vdGVzX29mZiBlOTJhXG5zcGVha2VyX3Bob25lIGUwZDJcbnNwZWxsY2hlY2sgZThjZVxuc3RhciBlODM4XG5zdGFyX2JvcmRlciBlODNhXG5zdGFyX2hhbGYgZTgzOVxuc3RhcnMgZThkMFxuc3RheV9jdXJyZW50X2xhbmRzY2FwZSBlMGQzXG5zdGF5X2N1cnJlbnRfcG9ydHJhaXQgZTBkNFxuc3RheV9wcmltYXJ5X2xhbmRzY2FwZSBlMGQ1XG5zdGF5X3ByaW1hcnlfcG9ydHJhaXQgZTBkNlxuc3RvcCBlMDQ3XG5zdG9wX3NjcmVlbl9zaGFyZSBlMGUzXG5zdG9yYWdlIGUxZGJcbnN0b3JlIGU4ZDFcbnN0b3JlX21hbGxfZGlyZWN0b3J5IGU1NjNcbnN0cmFpZ2h0ZW4gZTQxY1xuc3RyZWV0dmlldyBlNTZlXG5zdHJpa2V0aHJvdWdoX3MgZTI1N1xuc3R5bGUgZTQxZFxuc3ViZGlyZWN0b3J5X2Fycm93X2xlZnQgZTVkOVxuc3ViZGlyZWN0b3J5X2Fycm93X3JpZ2h0IGU1ZGFcbnN1YmplY3QgZThkMlxuc3Vic2NyaXB0aW9ucyBlMDY0XG5zdWJ0aXRsZXMgZTA0OFxuc3Vid2F5IGU1NmZcbnN1cGVydmlzb3JfYWNjb3VudCBlOGQzXG5zdXJyb3VuZF9zb3VuZCBlMDQ5XG5zd2FwX2NhbGxzIGUwZDdcbnN3YXBfaG9yaXogZThkNFxuc3dhcF92ZXJ0IGU4ZDVcbnN3YXBfdmVydGljYWxfY2lyY2xlIGU4ZDZcbnN3aXRjaF9jYW1lcmEgZTQxZVxuc3dpdGNoX3ZpZGVvIGU0MWZcbnN5bmMgZTYyN1xuc3luY19kaXNhYmxlZCBlNjI4XG5zeW5jX3Byb2JsZW0gZTYyOVxuc3lzdGVtX3VwZGF0ZSBlNjJhXG5zeXN0ZW1fdXBkYXRlX2FsdCBlOGQ3XG50YWIgZThkOFxudGFiX3Vuc2VsZWN0ZWQgZThkOVxudGFibGV0IGUzMmZcbnRhYmxldF9hbmRyb2lkIGUzMzBcbnRhYmxldF9tYWMgZTMzMVxudGFnX2ZhY2VzIGU0MjBcbnRhcF9hbmRfcGxheSBlNjJiXG50ZXJyYWluIGU1NjRcbnRleHRfZmllbGRzIGUyNjJcbnRleHRfZm9ybWF0IGUxNjVcbnRleHRzbXMgZTBkOFxudGV4dHVyZSBlNDIxXG50aGVhdGVycyBlOGRhXG50aHVtYl9kb3duIGU4ZGJcbnRodW1iX3VwIGU4ZGNcbnRodW1ic191cF9kb3duIGU4ZGRcbnRpbWVfdG9fbGVhdmUgZTYyY1xudGltZWxhcHNlIGU0MjJcbnRpbWVsaW5lIGU5MjJcbnRpbWVyIGU0MjVcbnRpbWVyXzEwIGU0MjNcbnRpbWVyXzMgZTQyNFxudGltZXJfb2ZmIGU0MjZcbnRpdGxlIGUyNjRcbnRvYyBlOGRlXG50b2RheSBlOGRmXG50b2xsIGU4ZTBcbnRvbmFsaXR5IGU0MjdcbnRvdWNoX2FwcCBlOTEzXG50b3lzIGUzMzJcbnRyYWNrX2NoYW5nZXMgZThlMVxudHJhZmZpYyBlNTY1XG50cmFpbiBlNTcwXG50cmFtIGU1NzFcbnRyYW5zZmVyX3dpdGhpbl9hX3N0YXRpb24gZTU3MlxudHJhbnNmb3JtIGU0MjhcbnRyYW5zbGF0ZSBlOGUyXG50cmVuZGluZ19kb3duIGU4ZTNcbnRyZW5kaW5nX2ZsYXQgZThlNFxudHJlbmRpbmdfdXAgZThlNVxudHVuZSBlNDI5XG50dXJuZWRfaW4gZThlNlxudHVybmVkX2luX25vdCBlOGU3XG50diBlMzMzXG51bmFyY2hpdmUgZTE2OVxudW5kbyBlMTY2XG51bmZvbGRfbGVzcyBlNWQ2XG51bmZvbGRfbW9yZSBlNWQ3XG51cGRhdGUgZTkyM1xudXNiIGUxZTBcbnZlcmlmaWVkX3VzZXIgZThlOFxudmVydGljYWxfYWxpZ25fYm90dG9tIGUyNThcbnZlcnRpY2FsX2FsaWduX2NlbnRlciBlMjU5XG52ZXJ0aWNhbF9hbGlnbl90b3AgZTI1YVxudmlicmF0aW9uIGU2MmRcbnZpZGVvX2NhbGwgZTA3MFxudmlkZW9fbGFiZWwgZTA3MVxudmlkZW9fbGlicmFyeSBlMDRhXG52aWRlb2NhbSBlMDRiXG52aWRlb2NhbV9vZmYgZTA0Y1xudmlkZW9nYW1lX2Fzc2V0IGUzMzhcbnZpZXdfYWdlbmRhIGU4ZTlcbnZpZXdfYXJyYXkgZThlYVxudmlld19jYXJvdXNlbCBlOGViXG52aWV3X2NvbHVtbiBlOGVjXG52aWV3X2NvbWZ5IGU0MmFcbnZpZXdfY29tcGFjdCBlNDJiXG52aWV3X2RheSBlOGVkXG52aWV3X2hlYWRsaW5lIGU4ZWVcbnZpZXdfbGlzdCBlOGVmXG52aWV3X21vZHVsZSBlOGYwXG52aWV3X3F1aWx0IGU4ZjFcbnZpZXdfc3RyZWFtIGU4ZjJcbnZpZXdfd2VlayBlOGYzXG52aWduZXR0ZSBlNDM1XG52aXNpYmlsaXR5IGU4ZjRcbnZpc2liaWxpdHlfb2ZmIGU4ZjVcbnZvaWNlX2NoYXQgZTYyZVxudm9pY2VtYWlsIGUwZDlcbnZvbHVtZV9kb3duIGUwNGRcbnZvbHVtZV9tdXRlIGUwNGVcbnZvbHVtZV9vZmYgZTA0Zlxudm9sdW1lX3VwIGUwNTBcbnZwbl9rZXkgZTBkYVxudnBuX2xvY2sgZTYyZlxud2FsbHBhcGVyIGUxYmNcbndhcm5pbmcgZTAwMlxud2F0Y2ggZTMzNFxud2F0Y2hfbGF0ZXIgZTkyNFxud2JfYXV0byBlNDJjXG53Yl9jbG91ZHkgZTQyZFxud2JfaW5jYW5kZXNjZW50IGU0MmVcbndiX2lyaWRlc2NlbnQgZTQzNlxud2Jfc3VubnkgZTQzMFxud2MgZTYzZFxud2ViIGUwNTFcbndlYl9hc3NldCBlMDY5XG53ZWVrZW5kIGUxNmJcbndoYXRzaG90IGU4MGVcbndpZGdldHMgZTFiZFxud2lmaSBlNjNlXG53aWZpX2xvY2sgZTFlMVxud2lmaV90ZXRoZXJpbmcgZTFlMlxud29yayBlOGY5XG53cmFwX3RleHQgZTI1YlxueW91dHViZV9zZWFyY2hlZF9mb3IgZThmYVxuem9vbV9pbiBlOGZmXG56b29tX291dCBlOTAwXG56b29tX291dF9tYXAgZTU2YlxuYDtcblxubGV0IGNvZGVwb2ludHMgPSBzLnRyaW0oKS5zcGxpdChcIlxcblwiKS5yZWR1Y2UoZnVuY3Rpb24oY3YsIG52KXtcbiAgICBsZXQgcGFydHMgPSBudi5zcGxpdCgvICsvKTtcbiAgICBsZXQgdWMgPSAnXFxcXHUnICsgcGFydHNbMV07XG4gICAgY3ZbcGFydHNbMF1dID0gZXZhbCgnXCInICsgdWMgKyAnXCInKTtcbiAgICByZXR1cm4gY3Y7XG59LCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvZGVwb2ludHNcbn1cblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgTEVBRlRZUEVTIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgZGVlcGMsIG9iajJhcnJheSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG4vLyBBIE1vZGVsIHJlcHJlc2VudHMgdGhlIGRhdGEgbW9kZWwgb2YgYSBtaW5lLiBJdCBpcyBhIGNsYXNzLWlmaWVkIGFuZCBleHBhbmRlZFxuLy8gdmVyc2lvbiBvZiB0aGUgZGF0YSBzdHJ1Y3R1cmUgcmV0dXJuZWQgYnkgdGhlIC9tb2RlbCBzZXJ2aWNlIGNhbGwuXG4vL1xuY2xhc3MgTW9kZWwge1xuICAgIGNvbnN0cnVjdG9yIChjZmcsIG1pbmUpIHtcbiAgICAgICAgbGV0IG1vZGVsID0gdGhpcztcbiAgICAgICAgdGhpcy5taW5lID0gbWluZTtcbiAgICAgICAgdGhpcy5wYWNrYWdlID0gY2ZnLnBhY2thZ2U7XG4gICAgICAgIHRoaXMubmFtZSA9IGNmZy5uYW1lO1xuICAgICAgICB0aGlzLmNsYXNzZXMgPSBkZWVwYyhjZmcuY2xhc3Nlcyk7XG5cbiAgICAgICAgLy8gRmlyc3QgYWRkIGNsYXNzZXMgdGhhdCByZXByZXNlbnQgdGhlIGJhc2ljIHR5cGVcbiAgICAgICAgTEVBRlRZUEVTLmZvckVhY2goIG4gPT4ge1xuICAgICAgICAgICAgdGhpcy5jbGFzc2VzW25dID0ge1xuICAgICAgICAgICAgICAgIGlzTGVhZlR5cGU6IHRydWUsICAgLy8gZGlzdGluZ3Vpc2hlcyB0aGVzZSBmcm9tIG1vZGVsIGNsYXNzZXNcbiAgICAgICAgICAgICAgICBuYW1lOiBuLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBuLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZXM6IFtdLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hbGxDbGFzc2VzID0gb2JqMmFycmF5KHRoaXMuY2xhc3NlcylcbiAgICAgICAgbGV0IGNucyA9IE9iamVjdC5rZXlzKHRoaXMuY2xhc3Nlcyk7XG4gICAgICAgIGNucy5zb3J0KClcbiAgICAgICAgY25zLmZvckVhY2goZnVuY3Rpb24oY24peyAvLyBmb3IgZWFjaCBjbGFzcyBuYW1lXG4gICAgICAgICAgICBsZXQgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgICAgICAvLyBnZW5lcmF0ZSBhcnJheXMgZm9yIGNvbnZlbmllbnQgYWNjZXNzXG4gICAgICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAgICAgLy8gQ29udmVydCBleHRlbmRzIGZyb20gYSBsaXN0IG9mIG5hbWVzIHRvIGEgbGlzdCBvZiBjbGFzcyBvYmplY3RzLlxuICAgICAgICAgICAgLy8gQWxzbyBhZGQgdGhlIGludmVyc2UgbGlzdCwgZXh0ZW5kZWRCeS5cbiAgICAgICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICBsZXQgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgICAgIGlmICghYmMpIHRocm93IFwiTm8gY2xhc3MgbmFtZWQ6IFwiICsgZTtcbiAgICAgICAgICAgICAgICBpZiAoYmMuZXh0ZW5kZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICBiYy5leHRlbmRlZEJ5LnB1c2goY2xzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkgPSBbY2xzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJjO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBBdHRyaWJ1dGVzOiBzdG9yZSBjbGFzcyBvYmogb2YgcmVmZXJlbmNlZFR5cGVcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNscy5hdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGFuKXtcbiAgICAgICAgICAgICAgICBsZXQgYSA9IGNscy5hdHRyaWJ1dGVzW2FuXTtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IG1vZGVsLmNsYXNzZXNbYS50eXBlXTtcbiAgICAgICAgICAgICAgICBpZiAoIXQpIHRocm93IFwiTm8gY2xhc3MgbmFtZWQ6IFwiICsgYS50eXBlO1xuICAgICAgICAgICAgICAgIGEudHlwZSA9IHQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXM6IHN0b3JlIGNsYXNzIG9iaiBvZiByZWZlcmVuY2VkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLnJlZmVyZW5jZXMpLmZvckVhY2goZnVuY3Rpb24ocm4pe1xuICAgICAgICAgICAgICAgIGxldCByID0gY2xzLnJlZmVyZW5jZXNbcm5dO1xuICAgICAgICAgICAgICAgIHIudHlwZSA9IG1vZGVsLmNsYXNzZXNbci5yZWZlcmVuY2VkVHlwZV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ29sbGVjdGlvbnM6IHN0b3JlIGNsYXNzIG9iaiBvZiByZWZlcmVuY2VkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE1vZGVsXG5cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdXBlcmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFxuLy8gVGhlIHJldHVybmVkIGxpc3QgZG9lcyAqbm90KiBjb250YWluIGNscy4pXG4vLyBBcmdzOlxuLy8gICAgY2xzIChvYmplY3QpICBBIGNsYXNzIGZyb20gYSBjb21waWxlZCBtb2RlbFxuLy8gUmV0dXJuczpcbi8vICAgIGxpc3Qgb2YgY2xhc3Mgb2JqZWN0cywgc29ydGVkIGJ5IGNsYXNzIG5hbWVcbmZ1bmN0aW9uIGdldFN1cGVyY2xhc3NlcyhjbHMpe1xuICAgIGlmIChjbHMuaXNMZWFmVHlwZSB8fCAhY2xzW1wiZXh0ZW5kc1wiXSB8fCBjbHNbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gW107XG4gICAgbGV0IGFuYyA9IGNsc1tcImV4dGVuZHNcIl0ubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1cGVyY2xhc3NlcyhzYyk7IH0pO1xuICAgIGxldCBhbGwgPSBjbHNbXCJleHRlbmRzXCJdLmNvbmNhdChhbmMucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICBsZXQgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBzdWJjbGFzc2VzIG9mIHRoZSBnaXZlbiBjbGFzcy5cbi8vIChUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3ViY2xhc3NlcyhjbHMpe1xuICAgIGlmIChjbHMuaXNMZWFmVHlwZSB8fCAhY2xzLmV4dGVuZGVkQnkgfHwgY2xzLmV4dGVuZGVkQnkubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICBsZXQgZGVzYyA9IGNscy5leHRlbmRlZEJ5Lm1hcChmdW5jdGlvbihzYyl7IHJldHVybiBnZXRTdWJjbGFzc2VzKHNjKTsgfSk7XG4gICAgbGV0IGFsbCA9IGNscy5leHRlbmRlZEJ5LmNvbmNhdChkZXNjLnJlZHVjZShmdW5jdGlvbihhY2MsIGVsdCl7IHJldHVybiBhY2MuY29uY2F0KGVsdCk7IH0sIFtdKSk7XG4gICAgbGV0IGFucyA9IGFsbC5yZWR1Y2UoZnVuY3Rpb24oYWNjLGVsdCl7IGFjY1tlbHQubmFtZV0gPSBlbHQ7IHJldHVybiBhY2M7IH0sIHt9KTtcbiAgICByZXR1cm4gb2JqMmFycmF5KGFucyk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZmYgc3ViIGlzIGEgc3ViY2xhc3Mgb2Ygc3VwLlxuZnVuY3Rpb24gaXNTdWJjbGFzcyhzdWIsc3VwKSB7XG4gICAgaWYgKHN1YiA9PT0gc3VwKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoc3ViLmlzTGVhZlR5cGUgfHwgIXN1YltcImV4dGVuZHNcIl0gfHwgc3ViW1wiZXh0ZW5kc1wiXS5sZW5ndGggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgIGxldCByID0gc3ViW1wiZXh0ZW5kc1wiXS5maWx0ZXIoZnVuY3Rpb24oeCl7IHJldHVybiB4PT09c3VwIHx8IGlzU3ViY2xhc3MoeCwgc3VwKTsgfSk7XG4gICAgcmV0dXJuIHIubGVuZ3RoID4gMDtcbn1cblxuXG5leHBvcnQge1xuICAgIE1vZGVsLFxuICAgIGdldFN1YmNsYXNzZXMsXG4gICAgZ2V0U3VwZXJjbGFzc2VzLFxuICAgIGlzU3ViY2xhc3Ncbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21vZGVsLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBlc2MsIGRlZXBjIH0gZnJvbSAnLi91dGlscy5qcyc7XG5jbGFzcyBDb25zdHJhaW50IHtcbiAgICBjb25zdHJ1Y3RvciAoYykge1xuICAgICAgICBjID0gYyB8fCB7fVxuICAgICAgICAvLyBzYXZlIHRoZSAgbm9kZVxuICAgICAgICB0aGlzLm5vZGUgPSBjLm5vZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gYWxsIGNvbnN0cmFpbnRzIGhhdmUgdGhpc1xuICAgICAgICB0aGlzLnBhdGggPSBjLnBhdGggfHwgYy5ub2RlICYmIGMubm9kZS5wYXRoIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgYWxsIGV4Y2VwdCBzdWJjbGFzcyBjb25zdHJhaW50cyAod2Ugc2V0IGl0IHRvIFwiSVNBXCIpXG4gICAgICAgIHRoaXMub3AgPSBjLm9wIHx8IGMudHlwZSAmJiBcIklTQVwiIHx8IG51bGw7XG4gICAgICAgIC8vIG9uZSBvZjogbnVsbCwgdmFsdWUsIG11bHRpdmFsdWUsIHN1YmNsYXNzLCBsb29rdXAsIGxpc3QsIHJhbmdlLCBsb29wXG4gICAgICAgIC8vIHRocm93cyBhbiBleGNlcHRpb24gaWYgdGhpcy5vcCBpcyBkZWZpbmVkLCBidXQgbm90IGluIE9QSU5ERVhcbiAgICAgICAgdGhpcy5jdHlwZSA9IHRoaXMub3AgJiYgT1BJTkRFWFt0aGlzLm9wXS5jdHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy5jb2RlID0gdGhpcy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiICYmIGMuY29kZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHZhbHVlLCBsaXN0XG4gICAgICAgIHRoaXMudmFsdWUgPSBjLnZhbHVlIHx8IFwiXCI7XG4gICAgICAgIC8vIHVzZWQgYnkgTE9PS1VQIG9uIEJpb0VudGl0eSBhbmQgc3ViY2xhc3Nlc1xuICAgICAgICB0aGlzLmV4dHJhVmFsdWUgPSB0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiICYmIGMuZXh0cmFWYWx1ZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgIC8vIHVzZWQgYnkgbXVsdGl2YWx1ZSBhbmQgcmFuZ2UgY29uc3RyYWludHNcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBjLnZhbHVlcyAmJiBkZWVwYyhjLnZhbHVlcykgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBzdWJjbGFzcyBjb250cmFpbnRzXG4gICAgICAgIHRoaXMudHlwZSA9IHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIiAmJiBjLnR5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBmb3IgY29uc3RyYWludHMgaW4gYSB0ZW1wbGF0ZVxuICAgICAgICB0aGlzLmVkaXRhYmxlID0gYy5lZGl0YWJsZSB8fCBudWxsO1xuXG4gICAgICAgIC8vIFdpdGggbnVsbC9ub3QtbnVsbCBjb25zdHJhaW50cywgSU0gaGFzIGEgd2VpcmQgcXVpcmsgb2YgZmlsbGluZyB0aGUgdmFsdWUgXG4gICAgICAgIC8vIGZpZWxkIHdpdGggdGhlIG9wZXJhdG9yLiBFLmcuLCBmb3IgYW4gXCJJUyBOT1QgTlVMTFwiIG9wcmVhdG9yLCB0aGUgdmFsdWUgZmllbGQgaXNcbiAgICAgICAgLy8gYWxzbyBcIklTIE5PVCBOVUxMXCIuIFxuICAgICAgICAvLyBcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKVxuICAgICAgICAgICAgYy52YWx1ZSA9IFwiXCI7XG4gICAgfVxuICAgIC8vXG4gICAgc2V0T3AgKG8sIHF1aWV0bHkpIHtcbiAgICAgICAgbGV0IG9wID0gT1BJTkRFWFtvXTtcbiAgICAgICAgaWYgKCFvcCkgdGhyb3cgXCJVbmtub3duIG9wZXJhdG9yOiBcIiArIG87XG4gICAgICAgIHRoaXMub3AgPSBvcC5vcDtcbiAgICAgICAgdGhpcy5jdHlwZSA9IG9wLmN0eXBlO1xuICAgICAgICBsZXQgdCA9IHRoaXMubm9kZSAmJiB0aGlzLm5vZGUudGVtcGxhdGU7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvZGUgJiYgIXF1aWV0bHkgJiYgdCkgXG4gICAgICAgICAgICAgICAgZGVsZXRlIHQuY29kZTJjW3RoaXMuY29kZV07XG4gICAgICAgICAgICB0aGlzLmNvZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvZGUpIFxuICAgICAgICAgICAgICAgIHRoaXMuY29kZSA9IHQgJiYgdC5uZXh0QXZhaWxhYmxlQ29kZSgpIHx8IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgIXF1aWV0bHkgJiYgdCAmJiB0LnNldExvZ2ljRXhwcmVzc2lvbigpO1xuICAgIH1cbiAgICAvLyBSZXR1cm5zIGEgdGV4dCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29uc3RyYWludCBzdWl0YWJsZSBmb3IgYSBsYWJlbFxuICAgIC8vXG4gICAgZ2V0IGxhYmVsVGV4dCAoKSB7XG4gICAgICAgbGV0IHQgPSBcIj9cIjtcbiAgICAgICBsZXQgYyA9IHRoaXM7XG4gICAgICAgIC8vIG9uZSBvZjogbnVsbCwgdmFsdWUsIG11bHRpdmFsdWUsIHN1YmNsYXNzLCBsb29rdXAsIGxpc3QsIHJhbmdlLCBsb29wXG4gICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIil7XG4gICAgICAgICAgIHQgPSBcIklTQSBcIiArICh0aGlzLnR5cGUgfHwgXCI/XCIpO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxpc3RcIiB8fCB0aGlzLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWU7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWU7XG4gICAgICAgICAgIGlmICh0aGlzLmV4dHJhVmFsdWUpIHQgPSB0ICsgXCIgSU4gXCIgKyB0aGlzLmV4dHJhVmFsdWU7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiIHx8IHRoaXMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZXM7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wO1xuICAgICAgIH1cblxuICAgICAgIHJldHVybiAodGhpcy5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiID8gXCIoXCIrdGhpcy5jb2RlK1wiKSBcIiA6IFwiXCIpICsgdDtcbiAgICB9XG5cbiAgICAvL1xuICAgIGdldEpzb24gKCkge1xuICAgICAgICBsZXQgamMgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcImxpc3RcIil7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhdGg6ICB0aGlzLnBhdGgsXG4gICAgICAgICAgICAgICAgb3A6ICAgIHRoaXMub3AsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICAgICAgICAgICAgY29kZTogIHRoaXMuY29kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAgdGhpcy5wYXRoLFxuICAgICAgICAgICAgICAgIG9wOiAgICB0aGlzLm9wLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICAgICAgICAgIGNvZGU6ICB0aGlzLmNvZGUsXG4gICAgICAgICAgICAgICAgZXh0cmFWYWx1ZTogdGhpcy5leHRyYVZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAgdGhpcy5wYXRoLFxuICAgICAgICAgICAgICAgIG9wOiAgICB0aGlzLm9wLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcy52YWx1ZXMuY29uY2F0ZShbXSksXG4gICAgICAgICAgICAgICAgY29kZTogIHRoaXMuY29kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIil7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhdGg6ICB0aGlzLnBhdGgsXG4gICAgICAgICAgICAgICAgdHlwZTogIHRoaXMudHlwZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGF0aDogIHRoaXMucGF0aCxcbiAgICAgICAgICAgICAgICBvcDogICAgdGhpcy5vcCxcbiAgICAgICAgICAgICAgICBjb2RlOiAgdGhpcy5jb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmb3JtYXRzIHRoaXMgY29uc3RyYWludCBhcyB4bWxcbiAgICBjMnhtbCAocW9ubHkpe1xuICAgICAgICBsZXQgZyA9ICcnO1xuICAgICAgICBsZXQgaCA9ICcnO1xuICAgICAgICBsZXQgZSA9IHFvbmx5ID8gXCJcIiA6IGBlZGl0YWJsZT1cIiR7dGhpcy5lZGl0YWJsZSB8fCAnZmFsc2UnfVwiYDtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcImxpc3RcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibG9va3VwXCIpe1xuICAgICAgICAgICAgbGV0IGV2ID0gKHRoaXMuZXh0cmFWYWx1ZSAmJiB0aGlzLmV4dHJhVmFsdWUgIT09IFwiQW55XCIpID8gYGV4dHJhVmFsdWU9XCIke3RoaXMuZXh0cmFWYWx1ZX1cImAgOiBcIlwiO1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiICR7ZXZ9IGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIil7XG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgICAgICBoID0gdGhpcy52YWx1ZXMubWFwKCB2ID0+IGA8dmFsdWU+JHtlc2Modil9PC92YWx1ZT5gICkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgdHlwZT1cIiR7dGhpcy50eXBlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHt0aGlzLm9wfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgaWYoaClcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfT4ke2h9PC9jb25zdHJhaW50PlxcbmA7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBgPGNvbnN0cmFpbnQgJHtnfSAvPlxcbmA7XG4gICAgfVxufSAvLyBlbmQgb2YgY2xhc3MgQ29uc3RyYWludFxuXG5leHBvcnQgeyBDb25zdHJhaW50IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9jb25zdHJhaW50LmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vXG4vLyBxYi5qc1xuLy9cblxuaW1wb3J0IHsgUUJFZGl0b3IgfSBmcm9tICcuL3FiZWRpdG9yLmpzJztcblxubGV0IHFiID0gbmV3IFFCRWRpdG9yKCk7XG5xYi5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7XG4gICAgZXNjLFxuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBwYXJzZVBhdGhRdWVyeSxcbiAgICBvYmoyYXJyYXksXG4gICAgaW5pdE9wdGlvbkxpc3QsXG4gICAgY29weU9ialxufSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGNvZGVwb2ludHMgfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5pbXBvcnQgeyBVbmRvTWFuYWdlciB9IGZyb20gJy4vdW5kb01hbmFnZXIuanMnO1xuaW1wb3J0IHsgTW9kZWwgfSBmcm9tICcuL21vZGVsLmpzJztcbmltcG9ydCB7IFRlbXBsYXRlIH0gZnJvbSAnLi90ZW1wbGF0ZS5qcyc7XG5pbXBvcnQgeyBpbml0UmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGVkaXRWaWV3cyB9IGZyb20gJy4vZWRpdFZpZXdzLmpzJztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4vZGlhbG9nLmpzJztcbmltcG9ydCB7IENvbnN0cmFpbnRFZGl0b3IgfSBmcm9tICcuL2NvbnN0cmFpbnRFZGl0b3IuanMnO1xuXG5sZXQgVkVSU0lPTiA9IFwiMC4xLjBcIjtcblxuY2xhc3MgUUJFZGl0b3Ige1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5jdXJyTWluZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgICAgICB0aGlzLm5hbWUybWluZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3ZnID0ge1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgMTI4MCxcbiAgICAgICAgICAgIGhlaWdodDogICAgIDgwMCxcbiAgICAgICAgICAgIG1sZWZ0OiAgICAgIDEyMCxcbiAgICAgICAgICAgIG1yaWdodDogICAgIDEyMCxcbiAgICAgICAgICAgIG10b3A6ICAgICAgIDIwLFxuICAgICAgICAgICAgbWJvdHRvbTogICAgMjBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgdGhpcy5kaWFnb25hbCA9IG51bGw7XG4gICAgICAgIHRoaXMudmlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5ub2RlcyA9IG51bGw7XG4gICAgICAgIHRoaXMubGlua3MgPSBudWxsO1xuICAgICAgICB0aGlzLmRyYWdCZWhhdmlvciA9IG51bGw7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRHVyYXRpb24gPSAyNTA7IC8vIG1zXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbG9ycyA9IHsgaGVhZGVyOiB7IG1haW46IFwiIzU5NTQ1NVwiLCB0ZXh0OiBcIiNmZmZcIiB9IH07XG4gICAgICAgIHRoaXMuZGVmYXVsdExvZ28gPSBcImh0dHBzOi8vY2RuLnJhd2dpdC5jb20vaW50ZXJtaW5lL2Rlc2lnbi1tYXRlcmlhbHMvNzhhMTNkYjUvbG9nb3MvaW50ZXJtaW5lL3NxdWFyZWlzaC80NXg0NS5wbmdcIjtcbiAgICAgICAgdGhpcy51bmRvTWdyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XG4gICAgICAgIC8vIFN0YXJ0aW5nIGVkaXQgdmlldyBpcyB0aGUgbWFpbiBxdWVyeSB2aWV3LlxuICAgICAgICB0aGlzLmVkaXRWaWV3cyA9IGVkaXRWaWV3cztcbiAgICAgICAgdGhpcy5lZGl0VmlldyA9IHRoaXMuZWRpdFZpZXdzLnF1ZXJ5TWFpbjtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5jb25zdHJhaW50RWRpdG9yID1cbiAgICAgICAgICAgIG5ldyBDb25zdHJhaW50RWRpdG9yKG4gPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nLnNob3cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy51bmRvTWdyLnNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZShuKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyB0aGUgbm9kZSBkaWFsb2dcbiAgICAgICAgdGhpcy5kaWFsb2cgPSBuZXcgRGlhbG9nKHRoaXMpO1xuICAgIH1cbiAgICBzZXR1cCAoKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0KCcjZm9vdGVyIFtuYW1lPVwidmVyc2lvblwiXScpXG4gICAgICAgICAgICAudGV4dChgUUIgdiR7VkVSU0lPTn1gKTtcblxuICAgICAgICAvL1xuICAgICAgICB0aGlzLmluaXRTdmcoKTtcblxuICAgICAgICAvL1xuICAgICAgICBkMy5zZWxlY3QoJy5idXR0b25bbmFtZT1cIm9wZW5jbG9zZVwiXScpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpO1xuICAgICAgICAgICAgICAgIGxldCB3YXNDbG9zZWQgPSB0LmNsYXNzZWQoXCJjbG9zZWRcIik7XG4gICAgICAgICAgICAgICAgbGV0IGlzQ2xvc2VkID0gIXdhc0Nsb3NlZDtcbiAgICAgICAgICAgICAgICBsZXQgZCA9IGQzLnNlbGVjdCgnI3RJbmZvQmFyJylbMF1bMF1cbiAgICAgICAgICAgICAgICBpZiAoaXNDbG9zZWQpXG4gICAgICAgICAgICAgICAgICAgIC8vIHNhdmUgdGhlIGN1cnJlbnQgaGVpZ2h0IGp1c3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgICAgICAgICAgICAgICAgZC5fX3NhdmVkX2hlaWdodCA9IGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGQuX19zYXZlZF9oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgLy8gb24gb3BlbiwgcmVzdG9yZSB0aGUgc2F2ZWQgaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjdEluZm9CYXInKS5zdHlsZShcImhlaWdodFwiLCBkLl9fc2F2ZWRfaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIHQuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KCcuYnV0dG9uW25hbWU9XCJ0dGV4dEV4cGFuZFwiXScpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgIHQuY2xhc3NlZChcImNsb3NlZFwiLCAhIHQuY2xhc3NlZChcImNsb3NlZFwiKSk7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpLmNsYXNzZWQoXCJleHBhbmRlZFwiLCAhIHQuY2xhc3NlZChcImNsb3NlZFwiKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpbml0UmVnaXN0cnkodGhpcy5pbml0TWluZXMuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiI3R0ZXh0IGxhYmVsIHNwYW5cIilcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlVHRleHQoc2VsZi5jdXJyVGVtcGxhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3J1bnF1ZXJ5JylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiBzZWxmLnJ1bnF1ZXJ5KHNlbGYuY3VyclRlbXBsYXRlKSk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJylcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCB0dXJuU3luY09mZiA9IHQudGV4dCgpID09PSBcInN5bmNcIjtcbiAgICAgICAgICAgICAgICB0LnRleHQoIHR1cm5TeW5jT2ZmID8gXCJzeW5jX2Rpc2FibGVkXCIgOiBcInN5bmNcIiApXG4gICAgICAgICAgICAgICAgIC5hdHRyKFwidGl0bGVcIiwgKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgIGBDb3VudCBhdXRvc3luYyBpcyAkeyB0dXJuU3luY09mZiA/IFwiT0ZGXCIgOiBcIk9OXCIgfS4gQ2xpY2sgdG8gdHVybiBpdCAkeyB0dXJuU3luY09mZiA/IFwiT05cIiA6IFwiT0ZGXCIgfS5gKTtcbiAgICAgICAgICAgICAgICAhdHVyblN5bmNPZmYgJiYgc2VsZi51cGRhdGVDb3VudChzZWxmLmN1cnJUZW1wbGF0ZSk7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInN5bmNvZmZcIiwgdHVyblN5bmNPZmYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVxuICAgICAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwieG1sdGV4dGFyZWFcIil9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKVxuICAgICAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwianNvbnRleHRhcmVhXCIpfSk7XG5cbiAgICAgIC8vXG4gICAgICB0aGlzLmRyYWdCZWhhdmlvciA9IGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAub24oXCJkcmFnXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBvbiBkcmFnLCBmb2xsb3cgdGhlIG1vdXNlIGluIHRoZSBZIGRpbWVuc2lvbi5cbiAgICAgICAgICAvLyBEcmFnIGNhbGxiYWNrIGlzIGF0dGFjaGVkIHRvIHRoZSBkcmFnIGhhbmRsZS5cbiAgICAgICAgICBsZXQgbm9kZUdycCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgICAgICAvLyB1cGRhdGUgbm9kZSdzIHktY29vcmRpbmF0ZVxuICAgICAgICAgIG5vZGVHcnAuYXR0cihcInRyYW5zZm9ybVwiLCAobikgPT4ge1xuICAgICAgICAgICAgICBuLnkgPSBkMy5ldmVudC55O1xuICAgICAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke24ueH0sJHtuLnl9KWA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBub2RlJ3MgbGlua1xuICAgICAgICAgIGxldCBsbCA9IGQzLnNlbGVjdChgcGF0aC5saW5rW3RhcmdldD1cIiR7bm9kZUdycC5hdHRyKCdpZCcpfVwiXWApO1xuICAgICAgICAgIGxsLmF0dHIoXCJkXCIsIHNlbGYuZGlhZ29uYWwpO1xuICAgICAgICAgIH0pXG4gICAgICAgIC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIG9uIGRyYWdlbmQsIHJlc29ydCB0aGUgZHJhZ2dhYmxlIG5vZGVzIGFjY29yZGluZyB0byB0aGVpciBZIHBvc2l0aW9uXG4gICAgICAgICAgbGV0IG5vZGVzID0gZDMuc2VsZWN0QWxsKHNlbGYuZWRpdFZpZXcuZHJhZ2dhYmxlKS5kYXRhKClcbiAgICAgICAgICBub2Rlcy5zb3J0KCAoYSwgYikgPT4gYS55IC0gYi55ICk7XG4gICAgICAgICAgLy8gdGhlIG5vZGUgdGhhdCB3YXMgZHJhZ2dlZFxuICAgICAgICAgIGxldCBkcmFnZ2VkID0gZDMuc2VsZWN0KHRoaXMpLmRhdGEoKVswXTtcbiAgICAgICAgICAvLyBjYWxsYmFjayBmb3Igc3BlY2lmaWMgZHJhZy1lbmQgYmVoYXZpb3JcbiAgICAgICAgICBzZWxmLmVkaXRWaWV3LmFmdGVyRHJhZyAmJiBzZWxmLmVkaXRWaWV3LmFmdGVyRHJhZyhub2RlcywgZHJhZ2dlZCk7XG4gICAgICAgICAgLy9cbiAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKGRyYWdnZWQpO1xuICAgICAgICAgIHNlbGYudXBkYXRlKCk7XG4gICAgICAgICAgLy9cbiAgICAgICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdE1pbmVzIChqX21pbmVzKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5uYW1lMm1pbmUgPSB7fTtcbiAgICAgICAgbGV0IG1pbmVzID0gal9taW5lcy5pbnN0YW5jZXM7XG4gICAgICAgIG1pbmVzLmZvckVhY2gobSA9PiB0aGlzLm5hbWUybWluZVttLm5hbWVdID0gbSApO1xuICAgICAgICB0aGlzLmN1cnJNaW5lID0gbWluZXNbMF07XG4gICAgICAgIHRoaXMuY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgICAgICBsZXQgbWwgPSBkMy5zZWxlY3QoXCIjbWxpc3RcIikuc2VsZWN0QWxsKFwib3B0aW9uXCIpLmRhdGEobWluZXMpO1xuICAgICAgICBsZXQgc2VsZWN0TWluZSA9IFwiTW91c2VNaW5lXCI7XG4gICAgICAgIG1sLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuYXR0cihcInZhbHVlXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAgICAgbGV0IHcgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICAgICAgbGV0IG0gPSBkLnVybC5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICAgICAgbGV0IHYgPSAodyAmJiAhbSkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lPT09c2VsZWN0TWluZSB8fCBudWxsOyB9KVxuICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pO1xuICAgICAgICAvL1xuICAgICAgICAvLyB3aGVuIGEgbWluZSBpcyBzZWxlY3RlZCBmcm9tIHRoZSBsaXN0XG4gICAgICAgIGQzLnNlbGVjdChcIiNtbGlzdFwiKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgLy8gcmVtaW5kZXI6IHRoaXM9PT10aGUgbGlzdCBpbnB1dCBlbGVtZW50OyBzZWxmPT09dGhlIGVkaXRvciBpbnN0YW5jZVxuICAgICAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRNaW5lKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy9cbiAgICAgICAgZDMuc2VsZWN0KFwiI2VkaXRWaWV3IHNlbGVjdFwiKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyByZW1pbmRlcjogdGhpcz09PXRoZSBsaXN0IGlucHV0IGVsZW1lbnQ7IHNlbGY9PT10aGUgZWRpdG9yIGluc3RhbmNlXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRFZGl0Vmlldyh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgLy8gc3RhcnQgd2l0aCB0aGUgZmlyc3QgbWluZSBieSBkZWZhdWx0LlxuICAgICAgICB0aGlzLnNlbGVjdGVkTWluZShzZWxlY3RNaW5lKTtcbiAgICB9XG4gICAgLy8gQ2FsbGVkIHdoZW4gdXNlciBzZWxlY3RzIGEgbWluZSBmcm9tIHRoZSBvcHRpb24gbGlzdFxuICAgIC8vIExvYWRzIHRoYXQgbWluZSdzIGRhdGEgbW9kZWwgYW5kIGFsbCBpdHMgdGVtcGxhdGVzLlxuICAgIC8vIFRoZW4gaW5pdGlhbGl6ZXMgZGlzcGxheSB0byBzaG93IHRoZSBmaXJzdCB0ZXJtcGxhdGUncyBxdWVyeS5cbiAgICBzZWxlY3RlZE1pbmUgKG1uYW1lKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYoIXRoaXMubmFtZTJtaW5lW21uYW1lXSkgdGhyb3cgXCJObyBtaW5lIG5hbWVkOiBcIiArIG1uYW1lO1xuICAgICAgICB0aGlzLmN1cnJNaW5lID0gdGhpcy5uYW1lMm1pbmVbbW5hbWVdO1xuICAgICAgICB0aGlzLnVuZG9NZ3IuY2xlYXIoKTtcbiAgICAgICAgbGV0IHVybCA9IHRoaXMuY3Vyck1pbmUudXJsO1xuICAgICAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICAgICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikge1xuICAgICAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICAgICAgbHVybCA9IHVybCArIFwiL2xpc3RzLmpzb25cIjtcbiAgICAgICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgICAgICBvdXJsID0gdXJsICsgXCIvb3JnYW5pc21saXN0Lmpzb25cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3RlbXBsYXRlcz9mb3JtYXQ9anNvblwiO1xuICAgICAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgICAgICBidXJsID0gdXJsICsgXCIvc2VydmljZS9icmFuZGluZ1wiO1xuICAgICAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICAgICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShsdXJsKSxcbiAgICAgICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICAgICAgZDNqc29uUHJvbWlzZShvdXJsKVxuICAgICAgICBdKS50aGVuKFxuICAgICAgICAgICAgdGhpcy5pbml0TWluZURhdGEuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7c2VsZi5jdXJyTWluZS5uYW1lfS4gU3RhdHVzPSR7ZXJyb3Iuc3RhdHVzfS4gRXJyb3I9JHtlcnJvci5zdGF0dXNUZXh0fS5gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdE1pbmVEYXRhIChkYXRhKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IGpfbW9kZWwgPSBkYXRhWzBdO1xuICAgICAgICBsZXQgal90ZW1wbGF0ZXMgPSBkYXRhWzFdO1xuICAgICAgICBsZXQgal9saXN0cyA9IGRhdGFbMl07XG4gICAgICAgIGxldCBqX2JyYW5kaW5nID0gZGF0YVszXTtcbiAgICAgICAgbGV0IGpfc3VtbWFyeSA9IGRhdGFbNF07XG4gICAgICAgIGxldCBqX29yZ2FuaXNtcyA9IGRhdGFbNV07XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBjbSA9IHRoaXMuY3Vyck1pbmU7XG4gICAgICAgIGNtLnRuYW1lcyA9IFtdXG4gICAgICAgIGNtLnRlbXBsYXRlcyA9IFtdXG4gICAgICAgIGNtLm1vZGVsID0gbmV3IE1vZGVsKGpfbW9kZWwubW9kZWwsIGNtKVxuICAgICAgICBjbS50ZW1wbGF0ZXMgPSBqX3RlbXBsYXRlcy50ZW1wbGF0ZXM7XG4gICAgICAgIGNtLmxpc3RzID0gal9saXN0cy5saXN0cztcbiAgICAgICAgY20uc3VtbWFyeUZpZWxkcyA9IGpfc3VtbWFyeS5jbGFzc2VzO1xuICAgICAgICBjbS5vcmdhbmlzbUxpc3QgPSBqX29yZ2FuaXNtcy5yZXN1bHRzLm1hcChvID0+IG8uc2hvcnROYW1lKTtcbiAgICAgICAgLy9cbiAgICAgICAgY20udGxpc3QgPSBvYmoyYXJyYXkoY20udGVtcGxhdGVzKVxuICAgICAgICBjbS50bGlzdC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICByZXR1cm4gYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBjbS50bmFtZXMgPSBPYmplY3Qua2V5cyggY20udGVtcGxhdGVzICk7XG4gICAgICAgIGNtLnRuYW1lcy5zb3J0KCk7XG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIHNlbGVjdGlvbiBsaXN0IG9mIHRlbXBsYXRlcyBmb3IgdGhpcyBtaW5lLlxuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiN0bGlzdCBzZWxlY3RcIiwgY20udGxpc3QsIHtcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgIHRpdGxlOiBkID0+IGQudGl0bGUgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsICgpID0+IHRoaXMuc3RhcnRFZGl0KCkpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmVkaXRUZW1wbGF0ZShjbS50ZW1wbGF0ZXNbY20udGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGNtLmNvbG9ycyB8fCB0aGlzLmRlZmF1bHRDb2xvcnM7XG4gICAgICAgIGxldCBiZ2MgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLm1haW4gOiBjbHJzLm1haW4uZmc7XG4gICAgICAgIGxldCB0eGMgPSBjbHJzLmhlYWRlciA/IGNscnMuaGVhZGVyLnRleHQgOiBjbHJzLm1haW4uYmc7XG4gICAgICAgIGxldCBsb2dvID0gY20uaW1hZ2VzLmxvZ28gfHwgdGhpcy5kZWZhdWx0TG9nbztcbiAgICAgICAgZDMuc2VsZWN0KFwiI3Rvb2x0cmF5XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKVxuICAgICAgICAgICAgLnN0eWxlKFwiYmFja2dyb3VuZC1jb2xvclwiLCBiZ2MpXG4gICAgICAgICAgICAuc3R5bGUoXCJjb2xvclwiLCB0eGMpO1xuICAgICAgICBkMy5zZWxlY3QoXCIjbWluZUxvZ29cIilcbiAgICAgICAgICAgIC5hdHRyKFwic3JjXCIsIGxvZ28pO1xuICAgICAgICBkMy5zZWxlY3RBbGwoJyN0b29sdHJheSBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGNtLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0LiBFeGNsdWRlIHRoZSBzaW1wbGUgYXR0cmlidXRlIHR5cGVzLlxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjbS5tb2RlbC5jbGFzc2VzKS5maWx0ZXIoY24gPT4gISBjbS5tb2RlbC5jbGFzc2VzW2NuXS5pc0xlYWZUeXBlKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxmLnNlbGVjdGVkRWRpdFNvdXJjZSh0aGlzLnZhbHVlKTsgc2VsZi5zdGFydEVkaXQoKTsgfSk7XG4gICAgICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVswXVswXS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB0aGlzLnNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG4gICAgfVxuXG4gICAgLy8gQmVnaW5zIGFuIGVkaXQsIGJhc2VkIG9uIHVzZXIgY29udHJvbHMuXG4gICAgc3RhcnRFZGl0ICgpIHtcbiAgICAgICAgLy8gZmlyc3QsIGNsZWFyIG91dCB0aGUgZGl2IHdpdGhpbiB3aXRoIHRoZSBpbS10YWJsZSBxdWVyeSB3YXMgZ2VuZXJhdGVkXG4gICAgICAgIGQzLnNlbGVjdCgnI2ltVGFibGVzUXVlcnknKS5odG1sKG51bGwpO1xuICAgICAgICAvLyBzZWxlY3RvciBmb3IgY2hvb3NpbmcgZWRpdCBpbnB1dCBzb3VyY2UsIGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICAgICAgbGV0IHNyY1NlbGVjdG9yID0gZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gW25hbWU9XCJpblwiXScpO1xuICAgICAgICAvLyB0aGUgY2hvc2VuIGVkaXQgc291cmNlXG4gICAgICAgIGxldCBpbnB1dElkID0gc3JjU2VsZWN0b3JbMF1bMF0udmFsdWU7XG4gICAgICAgIC8vIHRoZSBxdWVyeSBpbnB1dCBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNlbGVjdGVkIHNvdXJjZVxuICAgICAgICBsZXQgc3JjID0gZDMuc2VsZWN0KGAjJHtpbnB1dElkfSBbbmFtZT1cImluXCJdYCk7XG4gICAgICAgIC8vIHRoZSBxdWVyeSBzdGFydGluZyBwb2ludFxuICAgICAgICBsZXQgdmFsID0gc3JjWzBdWzBdLnZhbHVlXG4gICAgICAgIGlmIChpbnB1dElkID09PSBcInRsaXN0XCIpIHtcbiAgICAgICAgICAgIC8vIGEgc2F2ZWQgcXVlcnkgb3IgdGVtcGxhdGVcbiAgICAgICAgICAgIHRoaXMuZWRpdFRlbXBsYXRlKHRoaXMuY3Vyck1pbmUudGVtcGxhdGVzW3ZhbF0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwibmV3cWNsaXN0XCIpIHtcbiAgICAgICAgICAgIC8vIGEgbmV3IHF1ZXJ5IGZyb20gYSBzZWxlY3RlZCBzdGFydGluZyBjbGFzc1xuICAgICAgICAgICAgbGV0IG50ID0gbmV3IFRlbXBsYXRlKHsgc2VsZWN0OiBbdmFsK1wiLmlkXCJdfSwgdGhpcy5jdXJyTWluZS5tb2RlbCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRUZW1wbGF0ZShudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnR4bWxcIikge1xuICAgICAgICAgICAgLy8gaW1wb3J0IHhtbCBxdWVyeVxuICAgICAgICAgICAgdmFsICYmIHRoaXMuZWRpdFRlbXBsYXRlKHBhcnNlUGF0aFF1ZXJ5KHZhbCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0anNvblwiKSB7XG4gICAgICAgICAgICAvLyBpbXBvcnQganNvbiBxdWVyeVxuICAgICAgICAgICAgdmFsICYmIHRoaXMuZWRpdFRlbXBsYXRlKEpTT04ucGFyc2UodmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgXCJVbmtub3duIGVkaXQgc291cmNlLlwiXG4gICAgfVxuXG4gICAgLy9cbiAgICBzZWxlY3RlZEVkaXRTb3VyY2UgKHNob3cpIHtcbiAgICAgICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgICAgIC5zdHlsZShcImRpc3BsYXlcIiwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXMuaWQgPT09IHNob3cgPyBudWxsIDogXCJub25lXCI7IH0pO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbiAgICAvL1xuICAgIHJlbW92ZU5vZGUgKG4pIHtcbiAgICAgICAgbi5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5kaWFsb2cuaGlkZSgpO1xuICAgICAgICB0aGlzLnVuZG9NZ3Iuc2F2ZVN0YXRlKG4pO1xuICAgICAgICB0aGlzLnVwZGF0ZShuLnBhcmVudCB8fCBuKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbiAgICAvLyBHZXRzIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSBjdXJyZW50IG1pbmUgYW5kIGJ1aWxkcyBhIHNldCBvZiBub2Rlc1xuICAgIC8vIGZvciBkMyB0cmVlIGRpc3BsYXkuXG4gICAgLy9cbiAgICBlZGl0VGVtcGxhdGUgKHQsIG5vc2F2ZSkge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWRpdG9yIHdvcmtzIG9uIGEgY29weSBvZiB0aGUgdGVtcGxhdGUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBjdCA9IHRoaXMuY3VyclRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHQsIHRoaXMuY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnJvb3QgPSBjdC5xdHJlZVxuICAgICAgICB0aGlzLnJvb3QueDAgPSAwO1xuICAgICAgICB0aGlzLnJvb3QueTAgPSB0aGlzLnN2Zy5oZWlnaHQgLyAyO1xuICAgICAgICAvL1xuICAgICAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcblxuICAgICAgICBpZiAoISBub3NhdmUpIHRoaXMudW5kb01nci5zYXZlU3RhdGUoY3QucXRyZWUpO1xuXG4gICAgICAgIC8vIEZpbGwgaW4gdGhlIGJhc2ljIHRlbXBsYXRlIGluZm9ybWF0aW9uIChuYW1lLCB0aXRsZSwgZGVzY3JpcHRpb24sIGV0Yy4pXG4gICAgICAgIC8vXG4gICAgICAgIGxldCB0aSA9IGQzLnNlbGVjdChcIiN0SW5mb1wiKTtcbiAgICAgICAgbGV0IHhmZXIgPSBmdW5jdGlvbihuYW1lLCBlbHQpeyBjdFtuYW1lXSA9IGVsdC52YWx1ZTsgc2VsZi51cGRhdGVUdGV4dChjdCk7IH07XG4gICAgICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cIm5hbWVcIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC5uYW1lKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJuYW1lXCIsIHRoaXMpIH0pO1xuICAgICAgICAvLyBUaXRsZSAod2hhdCB0aGUgdXNlciBzZWVzKVxuICAgICAgICB0aS5zZWxlY3QoJ1tuYW1lPVwidGl0bGVcIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC50aXRsZSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwidGl0bGVcIiwgdGhpcykgfSk7XG4gICAgICAgIC8vIERlc2NyaXB0aW9uICh3aGF0IGl0IGRvZXMgLSBhIGxpdHRsZSBkb2N1bWVudGF0aW9uKS5cbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgICAgIC50ZXh0KGN0LmRlc2NyaXB0aW9uKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJkZXNjcmlwdGlvblwiLCB0aGlzKSB9KTtcbiAgICAgICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy5cbiAgICAgICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAgICAgLnRleHQoY3QuY29tbWVudClcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiY29tbWVudFwiLCB0aGlzKSB9KTtcblxuICAgICAgICAvLyBMb2dpYyBleHByZXNzaW9uIC0gd2hpY2ggdGllcyB0aGUgaW5kaXZpZHVhbCBjb25zdHJhaW50cyB0b2dldGhlclxuICAgICAgICBkMy5zZWxlY3QoJyNzdmdDb250YWluZXIgW25hbWU9XCJsb2dpY0V4cHJlc3Npb25cIl0gaW5wdXQnKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS52YWx1ZSA9IGN0LmNvbnN0cmFpbnRMb2dpYyB9KVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3Quc2V0TG9naWNFeHByZXNzaW9uKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIHhmZXIoXCJjb25zdHJhaW50TG9naWNcIiwgdGhpcylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENsZWFyIHRoZSBxdWVyeSBjb3VudFxuICAgICAgICBkMy5zZWxlY3QoXCIjcXVlcnljb3VudCBzcGFuXCIpLnRleHQoXCJcIik7XG5cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5kaWFsb2cuaGlkZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZWRpdGluZyB2aWV3LiBWaWV3IGlzIG9uZSBvZjpcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgICB2aWV3IChzdHJpbmcpIE9uZSBvZjogcXVlcnlNYWluLCBjb25zdHJhaW50TG9naWMsIGNvbHVtbk9yZGVyLCBzb3J0T3JkZXJcbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgICBOb3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgICBDaGFuZ2VzIHRoZSBsYXlvdXQgYW5kIHVwZGF0ZXMgdGhlIHZpZXcuXG4gICAgc2V0RWRpdFZpZXcgKHZpZXcpe1xuICAgICAgICBsZXQgdiA9IHRoaXMuZWRpdFZpZXdzW3ZpZXddO1xuICAgICAgICBpZiAoIXYpIHRocm93IFwiVW5yZWNvZ25pemVkIHZpZXcgdHlwZTogXCIgKyB2aWV3O1xuICAgICAgICB0aGlzLmVkaXRWaWV3ID0gdjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lclwiKS5hdHRyKFwiY2xhc3NcIiwgdi5uYW1lKTtcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5yb290KTtcbiAgICB9XG5cbiAgICAvLyBHcm93cyBvciBzaHJpbmtzIHRoZSBzaXplIG9mIHRoZSBTVkcgZHJhd2luZyBhcmVhIGFuZCByZWRyYXdzIHRoZSBkaWFncmFtLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBwY3RYIChudW1iZXIpIEEgcGVyY2VudGFnZSB0byBncm93IG9yIHNocmluayBpbiB0aGUgWCBkaW1lbnNpb24uIElmID4wLFxuICAgIC8vICAgICAgICAgICAgICAgICBncm93cyBieSB0aGF0IHBlcmNlbnRhZ2UuIElmIDwwLCBzaHJpbmtzIGJ5IHRoYXQgcGVyY2VudGFnZS5cbiAgICAvLyAgICAgICAgICAgICAgICAgSWYgMCwgcmVtYWlucyB1bmNoYW5nZWQuXG4gICAgLy8gICBwY3RZIChudW1iZXIpIEEgcGVyY2VudGFnZSB0byBncm93IG9yIHNocmluayBpbiB0aGUgWSBkaW1lbnNpb24uIElmIG5vdFxuICAgIC8vICAgICAgICAgICAgICAgICBzcGVjaWZpZWQsIHVzZXMgcGN0WC5cbiAgICAvLyBOb3RlIHRoYXQgdGhlIHBlcmNlbnRhZ2VzIGFwcGx5IHRvIHRoZSBtYXJnaW5zIGFzIHdlbGwuXG4gICAgLy9cbiAgICBncm93U3ZnIChwY3RYLCBwY3RZKSB7XG4gICAgICAgIHBjdFkgPSBwY3RZID09PSB1bmRlZmluZWQgPyBwY3RYIDogcGN0WTtcbiAgICAgICAgbGV0IG14ID0gMSArIHBjdFggLyAxMDAuMDtcbiAgICAgICAgbGV0IG15ID0gMSArIHBjdFkgLyAxMDAuMDtcbiAgICAgICAgbGV0IHN6ID0ge1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgbXggKiB0aGlzLnN2Zy53aWR0aCxcbiAgICAgICAgICAgIG1sZWZ0OiAgICAgIG14ICogdGhpcy5zdmcubWxlZnQsXG4gICAgICAgICAgICBtcmlnaHQ6ICAgICBteCAqIHRoaXMuc3ZnLm1yaWdodCxcbiAgICAgICAgICAgIGhlaWdodDogICAgIG15ICogdGhpcy5zdmcuaGVpZ2h0LFxuICAgICAgICAgICAgbXRvcDogICAgICAgbXkgKiB0aGlzLnN2Zy5tdG9wLFxuICAgICAgICAgICAgbWJvdHRvbTogICAgbXkgKiB0aGlzLnN2Zy5tYm90dG9tXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0U3ZnU2l6ZShzeik7XG4gICAgfVxuXG4gICAgLy8gU2V0cyB0aGUgc2l6ZSBvZiB0aGUgU1ZHIGRyYXdpbmcgYXJlYSBhbmQgcmVkcmF3cyB0aGUgZGlhZ3JhbS5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgc3ogKG9iaikgQW4gb2JqZWN0IGRlZmluaW5nIGFueS9hbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzLnN2ZywgdG8gd2l0OlxuICAgIC8vICAgICAgICAgICAgd2lkdGgsIGhlaWdodCwgbWxlZnQsIG1yaWdodCwgbXRvcCwgbWJvdHRvbVxuICAgIHNldFN2Z1NpemUgKHN6KSB7XG4gICAgICAgIGNvcHlPYmoodGhpcy5zdmcsIHN6KTtcbiAgICAgICAgdGhpcy5pbml0U3ZnKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucm9vdCk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZXMgdGhlIFNWRyBkcmF3aW5nIGFyZWFcbiAgICBpbml0U3ZnICgpIHtcbiAgICAgICAgLy8gaW5pdCB0aGUgU1ZHIGNvbnRhaW5lclxuICAgICAgICB0aGlzLnZpcyA9IGQzLnNlbGVjdChcIiNzdmdDb250YWluZXIgc3ZnXCIpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHRoaXMuc3ZnLndpZHRoICsgdGhpcy5zdmcubWxlZnQgKyB0aGlzLnN2Zy5tcmlnaHQpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCB0aGlzLnN2Zy5oZWlnaHQgKyB0aGlzLnN2Zy5tdG9wICsgdGhpcy5zdmcubWJvdHRvbSlcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHRoaXMuZGlhbG9nLmhpZGUoKSlcbiAgICAgICAgICAuc2VsZWN0KFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnN2Zy5tbGVmdCArIFwiLFwiICsgdGhpcy5zdmcubXRvcCArIFwiKVwiKTtcblxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNTAwNzg3Ny9ob3ctdG8tdXNlLXRoZS1kMy1kaWFnb25hbC1mdW5jdGlvbi10by1kcmF3LWN1cnZlZC1saW5lc1xuICAgICAgICB0aGlzLmRpYWdvbmFsID0gZDMuc3ZnLmRpYWdvbmFsKClcbiAgICAgICAgICAgIC5zb3VyY2UoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQuc291cmNlLnksIFwieVwiOmQuc291cmNlLnh9OyB9KVxuICAgICAgICAgICAgLnRhcmdldChmdW5jdGlvbihkKSB7IHJldHVybiB7XCJ4XCI6ZC50YXJnZXQueSwgXCJ5XCI6ZC50YXJnZXQueH07IH0pXG4gICAgICAgICAgICAucHJvamVjdGlvbihmdW5jdGlvbihkKSB7IHJldHVybiBbZC55LCBkLnhdOyB9KTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGVzIHBvc2l0aW9ucyBmb3Igbm9kZXMgYW5kIHBhdGhzIGZvciBsaW5rcy5cbiAgICBkb0xheW91dCAoKSB7XG4gICAgICBsZXQgbGF5b3V0O1xuICAgICAgLy9cbiAgICAgIGxldCBsZWF2ZXMgPSBbXTtcbiAgICAgIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgICAgIGlmIChuLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgbGVhdmVzLnB1c2gobik7XG4gICAgICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gICAgICB9O1xuICAgICAgbGV0IG1heGQgPSBtZCh0aGlzLnJvb3QpOyAvLyBtYXggZGVwdGgsIDEtYmFzZWRcblxuICAgICAgLy9cbiAgICAgIGlmICh0aGlzLmVkaXRWaWV3LmxheW91dFN0eWxlID09PSBcInRyZWVcIikge1xuICAgICAgICAgIC8vIGQzIGxheW91dCBhcnJhbmdlcyBub2RlcyB0b3AtdG8tYm90dG9tLCBidXQgd2Ugd2FudCBsZWZ0LXRvLXJpZ2h0LlxuICAgICAgICAgIC8vIFNvLi4uZG8gdGhlIGxheW91dCwgcmV2ZXJzaW5nIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICAgICAgLy8gVGhlbiByZXZlcnNlIHRoZSB4LHkgY29vcmRzIGluIHRoZSByZXN1bHRzLlxuICAgICAgICAgIHRoaXMubGF5b3V0ID0gZDMubGF5b3V0LnRyZWUoKS5zaXplKFt0aGlzLnN2Zy5oZWlnaHQsIHRoaXMuc3ZnLndpZHRoXSk7XG4gICAgICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMubGF5b3V0Lm5vZGVzKHRoaXMucm9vdCkucmV2ZXJzZSgpO1xuICAgICAgICAgIC8vIFJldmVyc2UgeCBhbmQgeS4gQWxzbywgbm9ybWFsaXplIHggZm9yIGZpeGVkLWRlcHRoLlxuICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wO1xuICAgICAgICAgICAgICBsZXQgZHggPSBNYXRoLm1pbigxODAsIHRoaXMuc3ZnLndpZHRoIC8gTWF0aC5tYXgoMSxtYXhkLTEpKVxuICAgICAgICAgICAgICBkLnggPSBkLmRlcHRoICogZHhcbiAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGRlbmRyb2dyYW1cbiAgICAgICAgICB0aGlzLmxheW91dCA9IGQzLmxheW91dC5jbHVzdGVyKClcbiAgICAgICAgICAgICAgLnNlcGFyYXRpb24oKGEsYikgPT4gMSlcbiAgICAgICAgICAgICAgLnNpemUoW3RoaXMuc3ZnLmhlaWdodCwgTWF0aC5taW4odGhpcy5zdmcud2lkdGgsIG1heGQgKiAxODApXSk7XG4gICAgICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMubGF5b3V0Lm5vZGVzKHRoaXMucm9vdCkucmV2ZXJzZSgpO1xuICAgICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCggZCA9PiB7IGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wOyB9KTtcblxuICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgIC8vIFJlYXJyYW5nZSB5LXBvc2l0aW9ucyBvZiBsZWFmIG5vZGVzLlxuICAgICAgICAgIGxldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB5OiBuLnksIHkwOiBuLnkwIH07IH0pO1xuXG4gICAgICAgICAgbGVhdmVzLnNvcnQodGhpcy5lZGl0Vmlldy5ub2RlQ29tcCk7XG5cbiAgICAgICAgICAvLyByZWFzc2lnbiB0aGUgWSBwb3NpdGlvbnNcbiAgICAgICAgICBsZWF2ZXMuZm9yRWFjaChmdW5jdGlvbihuLCBpKXtcbiAgICAgICAgICAgICAgbi55ID0gcG9zW2ldLnk7XG4gICAgICAgICAgICAgIG4ueTAgPSBwb3NbaV0ueTA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbGVhdmVzIGhhdmUgYmVlbiByZWFycmFuZ2VkLCBidXQgdGhlIGludGVyaW9yIG5vZGVzIGhhdmVuJ3QuXG4gICAgICAgICAgLy8gSGVyZSB3ZSBtb3ZlIGludGVyaW9yIG5vZGVzIHVwIG9yIGRvd24gdG93YXJkIHRoZWlyIFwiY2VudGVyIG9mIGdyYXZpdHlcIiBhcyBkZWZpbmVkXG4gICAgICAgICAgLy8gYnkgdGhlIFktcG9zaXRpb25zIG9mIHRoZWlyIGNoaWxkcmVuLiBBcHBseSB0aGlzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gTWFpbnRhaW4gYSBtYXAgb2Ygb2NjdXBpZWQgcG9zaXRpb25zOlxuICAgICAgICAgIGxldCBvY2N1cGllZCA9IHt9IDsgIC8vIG9jY3VwaWVkW3ggcG9zaXRpb25dID09IFtsaXN0IG9mIG5vZGVzXVxuICAgICAgICAgIGZ1bmN0aW9uIGNvZyAobikge1xuICAgICAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAvLyBjb21wdXRlIG15IGMuby5nLiBhcyB0aGUgYXZlcmFnZSBvZiBteSBraWRzJyB5LXBvc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgbGV0IG15Q29nID0gKG4uY2hpbGRyZW4ubWFwKGNvZykucmVkdWNlKCh0LGMpID0+IHQrYywgMCkpL24uY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgbi55ID0gbXlDb2c7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGV0IGRkID0gb2NjdXBpZWRbbi54XSA9IChvY2N1cGllZFtuLnhdIHx8IFtdKTtcbiAgICAgICAgICAgICAgZGQucHVzaChuKTtcbiAgICAgICAgICAgICAgcmV0dXJuIG4ueTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29nKHRoaXMucm9vdCk7XG5cbiAgICAgICAgICAvLyBJZiBpbnRlcm1lZGlhdGUgbm9kZXMgYXQgdGhlIHNhbWUgeCBvdmVybGFwLCBzcHJlYWQgdGhlbSBvdXQgaW4geS5cbiAgICAgICAgICBmb3IobGV0IHggaW4gb2NjdXBpZWQpIHtcbiAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBub2RlcyBhdCB0aGlzIHgtcmFuaywgYW5kIHNvcnQgYnkgeSBwb3NpdGlvblxuICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBvY2N1cGllZFt4XTtcbiAgICAgICAgICAgICAgbm9kZXMuc29ydCggKGEsYikgPT4gYS55IC0gYi55ICk7XG4gICAgICAgICAgICAgIC8vIE5vdyBtYWtlIGEgcGFzcyBhbmQgZW5zdXJlIHRoYXQgZWFjaCBub2RlIGlzIHNlcGFyYXRlZCBmcm9tIHRoZVxuICAgICAgICAgICAgICAvLyBwcmV2aW91cyBub2RlIGJ5IGF0IGxlYXN0IE1JTlNFUFxuICAgICAgICAgICAgICBsZXQgcHJldiA9IG51bGw7XG4gICAgICAgICAgICAgIGxldCBNSU5TRVAgPSAzMDtcbiAgICAgICAgICAgICAgbm9kZXMuZm9yRWFjaCggbiA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAocHJldiAmJiAobi55IC0gcHJldi55IDwgTUlOU0VQKSlcbiAgICAgICAgICAgICAgICAgICAgICBuLnkgPSBwcmV2LnkgKyBNSU5TRVA7XG4gICAgICAgICAgICAgICAgICBwcmV2ID0gbjtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIH1cblxuICAgICAgLy8gc2F2ZSBsaW5rcyBpbiBnbG9iYWxcbiAgICAgIHRoaXMubGlua3MgPSB0aGlzLmxheW91dC5saW5rcyh0aGlzLm5vZGVzKTtcblxuICAgICAgcmV0dXJuIFt0aGlzLm5vZGVzLCB0aGlzLmxpbmtzXVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gdXBkYXRlKHNvdXJjZSlcbiAgICAvLyBUaGUgbWFpbiBkcmF3aW5nIHJvdXRpbmUuXG4gICAgLy8gVXBkYXRlcyB0aGUgU1ZHLCB1c2luZyBzb3VyY2UgKGEgTm9kZSkgYXMgdGhlIGZvY3VzIG9mIGFueSBlbnRlcmluZy9leGl0aW5nIGFuaW1hdGlvbnMuXG4gICAgLy9cbiAgICB1cGRhdGUgKHNvdXJjZSkge1xuICAgICAgLy9cbiAgICAgIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIHRoaXMuZWRpdFZpZXcubmFtZSk7XG5cbiAgICAgIGQzLnNlbGVjdChcIiN1bmRvQnV0dG9uXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHRoaXMudW5kb01nci5jYW5VbmRvKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy51bmRvTWdyLmNhblVuZG8gJiYgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy51bmRvTWdyLnVuZG9TdGF0ZSgpLCB0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgIGQzLnNlbGVjdChcIiNyZWRvQnV0dG9uXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHRoaXMudW5kb01nci5jYW5SZWRvKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy51bmRvTWdyLmNhblJlZG8gJiYgdGhpcy5lZGl0VGVtcGxhdGUodGhpcy51bmRvTWdyLnJlZG9TdGF0ZSgpLCB0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgIC8vXG4gICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgICB0aGlzLnVwZGF0ZU5vZGVzKHRoaXMubm9kZXMsIHNvdXJjZSk7XG4gICAgICB0aGlzLnVwZGF0ZUxpbmtzKHRoaXMubGlua3MsIHNvdXJjZSk7XG4gICAgICB0aGlzLnVwZGF0ZVR0ZXh0KHRoaXMuY3VyclRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICAvL1xuICAgIHVwZGF0ZU5vZGVzIChub2Rlcywgc291cmNlKSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBsZXQgbm9kZUdycHMgPSB0aGlzLnZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgICAgIC5kYXRhKG5vZGVzLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLmlkIHx8IChuLmlkID0gKytpKTsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICAgICAgbGV0IG5vZGVFbnRlciA9IG5vZGVHcnBzLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsIG4gPT4gbi5wYXRoLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVncm91cFwiKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLngwICsgXCIsXCIgKyBzb3VyY2UueTAgKyBcIilcIjsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIGxldCBjbGlja05vZGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgICAgaWYgKGQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAoc2VsZi5kaWFsb2cuY3Vyck5vZGUgIT09IG4pIHNlbGYuZGlhbG9nLnNob3cobiwgdGhpcyk7XG4gICAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9O1xuICAgICAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChmdW5jdGlvbihkKXtcbiAgICAgICAgICBsZXQgc2hhcGUgPSAoZC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIgPyBcInJlY3RcIiA6IFwiY2lyY2xlXCIpO1xuICAgICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZVwiKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGNsaWNrTm9kZSk7XG4gICAgICBub2RlRW50ZXIuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgICAgICA7XG4gICAgICBub2RlRW50ZXIuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCAtOC41KVxuICAgICAgICAgIC5hdHRyKFwieVwiLCAtOC41KVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBpbnZpc2libHkgc21hbGxcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIEFkZCB0ZXh0IGZvciBub2RlIG5hbWVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmNoaWxkcmVuID8gLTEwIDogMTA7IH0pXG4gICAgICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpIC8vIHN0YXJ0IG9mZiBuZWFybHkgdHJhbnNwYXJlbnRcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlTmFtZVwiKVxuICAgICAgICAgIDtcblxuICAgICAgLy8gUGxhY2Vob2xkZXIgZm9yIGljb24vdGV4dCB0byBhcHBlYXIgaW5zaWRlIG5vZGVcbiAgICAgIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlSWNvbicpXG4gICAgICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIEFkZCBub2RlIGhhbmRsZVxuICAgICAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2hhbmRsZScpXG4gICAgICAgICAgLmF0dHIoJ2R4JywgMTApXG4gICAgICAgICAgLmF0dHIoJ2R5JywgNSlcbiAgICAgICAgICA7XG5cbiAgICAgIGxldCBub2RlVXBkYXRlID0gbm9kZUdycHNcbiAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIG4gPT4gbi5pc1NlbGVjdGVkKVxuICAgICAgICAgIC5jbGFzc2VkKFwiY29uc3RyYWluZWRcIiwgbiA9PiBuLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDApXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmxldmVsID49IDApXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRhc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImFzY1wiKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGVkZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICAgICAgICAvLyBUcmFuc2l0aW9uIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbi54ICsgXCIsXCIgKyBuLnkgKyBcIilcIjsgfSlcbiAgICAgICAgICA7XG5cbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5oYW5kbGVcIilcbiAgICAgICAgICAuYXR0cignZm9udC1mYW1pbHknLCB0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgICAgIC50ZXh0KHRoaXMuZWRpdFZpZXcuaGFuZGxlSWNvbi50ZXh0IHx8IFwiXCIpXG4gICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgdGhpcy5lZGl0Vmlldy5oYW5kbGVJY29uLnN0cm9rZSB8fCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCB0aGlzLmVkaXRWaWV3LmhhbmRsZUljb24uZmlsbCB8fCBudWxsKTtcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dC5ub2RlSWNvblwiKVxuICAgICAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIHRoaXMuZWRpdFZpZXcubm9kZUljb24uZm9udEZhbWlseSB8fCBudWxsKVxuICAgICAgICAgIC50ZXh0KHRoaXMuZWRpdFZpZXcubm9kZUljb24udGV4dCB8fCBcIlwiKVxuICAgICAgICAgIDtcblxuICAgICAgZDMuc2VsZWN0QWxsKFwiLm5vZGVJY29uXCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgY2xpY2tOb2RlKTtcblxuICAgICAgbm9kZVVwZGF0ZS5zZWxlY3RBbGwoXCJ0ZXh0Lm5vZGVOYW1lXCIpXG4gICAgICAgICAgLnRleHQobiA9PiBuLm5hbWUpO1xuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gTWFrZSBzZWxlY3RlZCBub2RlcyBkcmFnZ2FibGUuXG4gICAgICAvLyBDbGVhciBvdXQgYWxsIGV4aXRpbmcgZHJhZyBoYW5kbGVyc1xuICAgICAgZDMuc2VsZWN0QWxsKFwiZy5ub2RlZ3JvdXBcIilcbiAgICAgICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCBmYWxzZSlcbiAgICAgICAgICAub24oXCIuZHJhZ1wiLCBudWxsKTtcbiAgICAgIC8vIE5vdyBtYWtlIGV2ZXJ5dGhpbmcgZHJhZ2dhYmxlIHRoYXQgc2hvdWxkIGJlXG4gICAgICBpZiAodGhpcy5lZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICAgICAgZDMuc2VsZWN0QWxsKHRoaXMuZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgICAgICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCB0cnVlKVxuICAgICAgICAgICAgICAuY2FsbCh0aGlzLmRyYWdCZWhhdmlvcik7XG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAvLyBBZGQgdGV4dCBmb3IgY29uc3RyYWludHNcbiAgICAgIGxldCBjdCA9IG5vZGVHcnBzLnNlbGVjdEFsbChcInRleHQuY29uc3RyYWludFwiKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKG4peyByZXR1cm4gbi5jb25zdHJhaW50czsgfSk7XG4gICAgICBjdC5lbnRlcigpLmFwcGVuZChcInN2Zzp0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbnN0cmFpbnRcIik7XG4gICAgICBjdC5leGl0KCkucmVtb3ZlKCk7XG4gICAgICBjdC50ZXh0KCBjID0+IGMubGFiZWxUZXh0IClcbiAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgICAgIC5hdHRyKFwiZHlcIiwgKGMsaSkgPT4gYCR7KGkrMSkqMS43fWVtYClcbiAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLFwic3RhcnRcIilcbiAgICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gZnVsbCBzaXplXG4gICAgICBub2RlVXBkYXRlLnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCA4LjUgKVxuICAgICAgICAgIDtcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTcgKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDE3IClcbiAgICAgICAgICA7XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gdGV4dCB0byBmdWxseSBvcGFxdWVcbiAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxKVxuICAgICAgICAgIDtcblxuICAgICAgLy9cbiAgICAgIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICAgICAgbGV0IG5vZGVFeGl0ID0gbm9kZUdycHMuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLnggKyBcIixcIiArIHNvdXJjZS55ICsgXCIpXCI7IH0pXG4gICAgICAgICAgLnJlbW92ZSgpXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gdGlueSByYWRpdXNcbiAgICAgIG5vZGVFeGl0LnNlbGVjdChcImNpcmNsZVwiKVxuICAgICAgICAgIC5hdHRyKFwiclwiLCAxZS02KVxuICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiB0ZXh0IHRvIHRyYW5zcGFyZW50XG4gICAgICBub2RlRXhpdC5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpXG4gICAgICAgICAgO1xuICAgICAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgZC54MCA9IGQueDtcbiAgICAgICAgZC55MCA9IGQueTtcbiAgICAgIH0pO1xuICAgICAgLy9cblxuICAgIH1cblxuICAgIC8vXG4gICAgdXBkYXRlTGlua3MgKGxpbmtzLCBzb3VyY2UpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgbGV0IGxpbmsgPSB0aGlzLnZpcy5zZWxlY3RBbGwoXCJwYXRoLmxpbmtcIilcbiAgICAgICAgICAuZGF0YShsaW5rcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQuaWQ7IH0pXG4gICAgICAgICAgO1xuXG4gICAgICAvLyBFbnRlciBhbnkgbmV3IGxpbmtzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cbiAgICAgIGxldCBuZXdQYXRocyA9IGxpbmsuZW50ZXIoKS5pbnNlcnQoXCJzdmc6cGF0aFwiLCBcImdcIik7XG4gICAgICBsZXQgbGlua1RpdGxlID0gZnVuY3Rpb24obCl7XG4gICAgICAgICAgbGV0IGNsaWNrID0gXCJcIjtcbiAgICAgICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIil7XG4gICAgICAgICAgICAgIGNsaWNrID0gYENsaWNrIHRvIG1ha2UgdGhpcyByZWxhdGlvbnNoaXAgJHtsLnRhcmdldC5qb2luID8gXCJSRVFVSVJFRFwiIDogXCJPUFRJT05BTFwifS4gYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGFsdGNsaWNrID0gXCJBbHQtY2xpY2sgdG8gY3V0IGxpbmsuXCI7XG4gICAgICAgICAgcmV0dXJuIGNsaWNrICsgYWx0Y2xpY2s7XG4gICAgICB9XG4gICAgICAvLyBzZXQgdGhlIHRvb2x0aXBcbiAgICAgIG5ld1BhdGhzLmFwcGVuZChcInN2Zzp0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICBuZXdQYXRoc1xuICAgICAgICAgIC5hdHRyKFwidGFyZ2V0XCIsIGQgPT4gZC50YXJnZXQuaWQucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGlua1wiKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBsZXQgbyA9IHt4OiBzb3VyY2UueDAsIHk6IHNvdXJjZS55MH07XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5kaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jbGFzc2VkKFwiYXR0cmlidXRlXCIsIGZ1bmN0aW9uKGwpIHsgcmV0dXJuIGwudGFyZ2V0LnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCI7IH0pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24obCl7XG4gICAgICAgICAgICAgIGlmIChkMy5ldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgICAgIC8vIGEgc2hpZnQtY2xpY2sgY3V0cyB0aGUgdHJlZSBhdCB0aGlzIGVkZ2VcbiAgICAgICAgICAgICAgICAgIHNlbGYucmVtb3ZlTm9kZShsLnRhcmdldClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIC8vIHJlZ3VsYXIgY2xpY2sgb24gYSByZWxhdGlvbnNoaXAgZWRnZSBpbnZlcnRzIHdoZXRoZXJcbiAgICAgICAgICAgICAgICAgIC8vIHRoZSBqb2luIGlzIGlubmVyIG9yIG91dGVyLlxuICAgICAgICAgICAgICAgICAgbC50YXJnZXQuam9pbiA9IChsLnRhcmdldC5qb2luID8gbnVsbCA6IFwib3V0ZXJcIik7XG4gICAgICAgICAgICAgICAgICAvLyByZS1zZXQgdGhlIHRvb2x0aXBcbiAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJ0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gICAgICAgICAgICAgICAgICAvLyBpZiBvdXRlciBqb2luLCByZW1vdmUgYW55IHNvcnQgb3JkZXJzIGluIG4gb3IgZGVzY2VuZGFudHNcbiAgICAgICAgICAgICAgICAgIGlmIChsLnRhcmdldC5qb2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbGV0IHJzbyA9IGZ1bmN0aW9uKG0pIHsgLy8gcmVtb3ZlIHNvcnQgb3JkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbS5zZXRTb3J0KFwibm9uZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jaGlsZHJlbi5mb3JFYWNoKHJzbyk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJzbyhsLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKGwuc291cmNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgICAgLmR1cmF0aW9uKHRoaXMuYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAgICAgICAuYXR0cihcImRcIiwgdGhpcy5kaWFnb25hbClcbiAgICAgICAgICA7XG5cblxuICAgICAgLy8gVHJhbnNpdGlvbiBsaW5rcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gICAgICBsaW5rLmNsYXNzZWQoXCJvdXRlclwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBuLnRhcmdldC5qb2luID09PSBcIm91dGVyXCI7IH0pXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAgIC5hdHRyKFwiZFwiLCB0aGlzLmRpYWdvbmFsKVxuICAgICAgICAgIDtcblxuICAgICAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gICAgICBsaW5rLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgICAgICAuZHVyYXRpb24odGhpcy5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgbGV0IG8gPSB7eDogc291cmNlLngsIHk6IHNvdXJjZS55fTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmRpYWdvbmFsKHtzb3VyY2U6IG8sIHRhcmdldDogb30pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnJlbW92ZSgpXG4gICAgICAgICAgO1xuXG4gICAgfVxuICAgIC8vXG4gICAgdXBkYXRlVHRleHQgKHQpIHtcbiAgICAgIC8vXG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBsZXQgdGl0bGUgPSB0aGlzLnZpcy5zZWxlY3RBbGwoXCIjcXRpdGxlXCIpXG4gICAgICAgICAgLmRhdGEoW3RoaXMuY3VyclRlbXBsYXRlLnRpdGxlXSk7XG4gICAgICB0aXRsZS5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoXCJpZFwiLFwicXRpdGxlXCIpXG4gICAgICAgICAgLmF0dHIoXCJ4XCIsIC00MClcbiAgICAgICAgICAuYXR0cihcInlcIiwgMTUpXG4gICAgICAgICAgO1xuICAgICAgdGl0bGUuaHRtbCh0ID0+IHtcbiAgICAgICAgICBsZXQgcGFydHMgPSB0LnNwbGl0KC8oLS0+KS8pO1xuICAgICAgICAgIHJldHVybiBwYXJ0cy5tYXAoKHAsaSkgPT4ge1xuICAgICAgICAgICAgICBpZiAocCA9PT0gXCItLT5cIilcbiAgICAgICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9MTAgZm9udC1mYW1pbHk9XCJNYXRlcmlhbCBJY29uc1wiPiR7Y29kZXBvaW50c1snZm9yd2FyZCddfTwvdHNwYW4+YFxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYDx0c3BhbiB5PTQ+JHtwfTwvdHNwYW4+YFxuICAgICAgICAgIH0pLmpvaW4oXCJcIik7XG4gICAgICB9KTtcblxuICAgICAgLy9cbiAgICAgIGxldCB0eHQgPSBkMy5zZWxlY3QoXCIjdHRleHRcIikuY2xhc3NlZChcImpzb25cIikgPyB0LmdldEpzb24oKSA6IHQuZ2V0WG1sKCk7XG4gICAgICAvL1xuICAgICAgLy9cbiAgICAgIGQzLnNlbGVjdChcIiN0dGV4dGRpdlwiKVxuICAgICAgICAgIC50ZXh0KHR4dClcbiAgICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBzZWxlY3RUZXh0KFwidHRleHRkaXZcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAvL1xuICAgICAgaWYgKGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgLmJ1dHRvbi5zeW5jJykudGV4dCgpID09PSBcInN5bmNcIilcbiAgICAgICAgICBzZWxmLnVwZGF0ZUNvdW50KHQpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvdW50ICh0KSB7XG4gICAgICBsZXQgcXR4dCA9IHQuZ2V0WG1sKHRydWUpO1xuICAgICAgbGV0IHVybFR4dCA9IGVuY29kZVVSSUNvbXBvbmVudChxdHh0KTtcbiAgICAgIGxldCBjb3VudFVybCA9IHRoaXMuY3Vyck1pbmUudXJsICsgYC9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/cXVlcnk9JHt1cmxUeHR9JmZvcm1hdD1jb3VudGA7XG4gICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gICAgICBkM2pzb25Qcm9taXNlKGNvdW50VXJsKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG4pe1xuICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgc3BhbicpLnRleHQobilcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCB0cnVlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1I6OlwiLCBxdHh0KVxuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJ1bnF1ZXJ5ICh0KSB7XG4gICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5IHx8IGQzLmV2ZW50LnNoaWZ0S2V5KSBcbiAgICAgICAgICB0aGlzLnJ1bmF0bWluZSh0KTtcbiAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLnJ1bmF0cWIodCk7XG4gICAgfVxuXG4gICAgcnVuYXRtaW5lICh0KSB7XG4gICAgICBsZXQgdHh0ID0gdC5nZXRYbWwoKTtcbiAgICAgIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQodHh0KTtcbiAgICAgIGxldCBsaW5rdXJsID0gdGhpcy5jdXJyTWluZS51cmwgKyBcIi9sb2FkUXVlcnkuZG8/dHJhaWw9JTdDcXVlcnkmbWV0aG9kPXhtbFwiO1xuICAgICAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gICAgICBsZXQgcnVudXJsID0gbGlua3VybCArIFwiJnNraXBCdWlsZGVyPXRydWUmcXVlcnk9XCIgKyB1cmxUeHQ7XG4gICAgICB3aW5kb3cub3BlbiggZDMuZXZlbnQuYWx0S2V5ID8gZWRpdHVybCA6IHJ1bnVybCwgJ19ibGFuaycgKTtcbiAgICB9XG5cbiAgICBydW5hdHFiICh0KSB7XG4gICAgICBsZXQgcWpzb24gPSB0LmdldEpzb24odHJ1ZSk7XG4gICAgICBsZXQgc2VydmljZSA9IHsgcm9vdDogdGhpcy5jdXJyTWluZS51cmwgKyAnL3NlcnZpY2UnIH07XG5cbiAgICAgIGltdGFibGVzLmNvbmZpZ3VyZSgnRGVmYXVsdFBhZ2VTaXplJywgMTApO1xuICAgICAgaW10YWJsZXMuY29uZmlndXJlKCdUYWJsZVJlc3VsdHMuQ2FjaGVGYWN0b3InLCAyMCk7XG4gICAgICBpbXRhYmxlcy5jb25maWd1cmUoJ1RhYmxlQ2VsbC5JbmRpY2F0ZU9mZkhvc3RMaW5rcycsIGZhbHNlKTtcblxuICAgICAgaW10YWJsZXMubG9hZFRhYmxlKFxuICAgICAgICAnI2ltVGFibGVzUXVlcnknLFxuICAgICAgICB7c3RhcnQ6IDAsIHNpemU6IDEwfSxcbiAgICAgICAge3NlcnZpY2U6IHNlcnZpY2UsIHF1ZXJ5OiBxanNvbn1cbiAgICAgICkudGhlbihcbiAgICAgICAgZnVuY3Rpb24gKHRhYmxlKSB7IFxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnVGFibGUgbG9hZGVkJywgdGFibGUpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjaW1UYWJsZXNRdWVyeUFmdGVyJylbMF1bMF0uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7IGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBsb2FkIHRhYmxlJywgZXJyb3IpOyB9XG4gICAgICApO1xuXG4gICAgfVxufVxuXG5leHBvcnQgeyBRQkVkaXRvciB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWJlZGl0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gVW5kb01hbmFnZXIgbWFpbnRhaW5zIGEgaGlzdG9yeSBzdGFjayBvZiBzdGF0ZXMgKGFyYml0cmFyeSBvYmplY3RzKS5cbi8vXG5jbGFzcyBVbmRvTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IobGltaXQpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50ZXIgPSAtMTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnRTdGF0ZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCAwKVxuICAgICAgICAgICAgdGhyb3cgXCJObyBjdXJyZW50IHN0YXRlLlwiO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIGdldCBoYXNTdGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPj0gMDtcbiAgICB9XG4gICAgZ2V0IGNhblVuZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID4gMDtcbiAgICB9XG4gICAgZ2V0IGNhblJlZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTdGF0ZSAmJiB0aGlzLnBvaW50ZXIgPCB0aGlzLmhpc3RvcnkubGVuZ3RoLTE7XG4gICAgfVxuICAgIGFkZCAocykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQUREXCIpO1xuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl0gPSBzO1xuICAgICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKHRoaXMucG9pbnRlcisxKTtcbiAgICB9XG4gICAgdW5kbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVTkRPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblVuZG8pIHRocm93IFwiTm8gdW5kby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICByZWRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJFRE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuUmVkbykgdGhyb3cgXCJObyByZWRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgc2F2ZVN0YXRlIChuKSB7XG4gICAgICAgIGxldCBzID0gSlNPTi5zdHJpbmdpZnkobi50ZW1wbGF0ZS51bmNvbXBpbGVUZW1wbGF0ZSgpKTtcbiAgICAgICAgaWYgKCF0aGlzLmhhc1N0YXRlIHx8IHRoaXMuY3VycmVudFN0YXRlICE9PSBzKVxuICAgICAgICAgICAgLy8gb25seSBzYXZlIHN0YXRlIGlmIGl0IGhhcyBjaGFuZ2VkXG4gICAgICAgICAgICB0aGlzLmFkZChzKTtcbiAgICB9XG4gICAgdW5kb1N0YXRlICgpIHtcbiAgICAgICAgdHJ5IHsgcmV0dXJuIEpTT04ucGFyc2UodGhpcy51bmRvKCkpOyB9XG4gICAgICAgIGNhdGNoIChlcnIpIHsgY29uc29sZS5sb2coZXJyKTsgfVxuICAgIH1cbiAgICByZWRvU3RhdGUgKCkge1xuICAgICAgICB0cnkgeyByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnJlZG8oKSk7IH1cbiAgICAgICAgY2F0Y2ggKGVycikgeyBjb25zb2xlLmxvZyhlcnIpOyB9XG4gICAgfVxufVxuXG4vL1xuZnVuY3Rpb24gdW5kbygpIHsgdW5kb3JlZG8oXCJ1bmRvXCIpIH1cbmZ1bmN0aW9uIHJlZG8oKSB7IHVuZG9yZWRvKFwicmVkb1wiKSB9XG5mdW5jdGlvbiB1bmRvcmVkbyh3aGljaCl7XG59XG5cbmV4cG9ydCB7IFVuZG9NYW5hZ2VyIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBlc2MsIGRlZXBjIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgcGFyc2VyIGZyb20gJy4vcGFyc2VyLmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUuanMnO1xuaW1wb3J0IHsgQ29uc3RyYWludCB9IGZyb20gJy4vY29uc3RyYWludC5qcyc7XG5cbmNsYXNzIFRlbXBsYXRlIHtcbiAgICBjb25zdHJ1Y3RvciAodCwgbW9kZWwpIHtcbiAgICAgICAgdCA9IHQgfHwge31cbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICB0aGlzLm5hbWUgPSB0Lm5hbWUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy50aXRsZSA9IHQudGl0bGUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgdGhpcy5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gdC5zZWxlY3QgPyBkZWVwYyh0LnNlbGVjdCkgOiBbXTtcbiAgICAgICAgdGhpcy53aGVyZSA9IHQud2hlcmUgPyB0LndoZXJlLm1hcCggYyA9PiB7XG4gICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKSA7XG4gICAgICAgICAgICBjYy5ub2RlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBjYztcbiAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50TG9naWMgPSB0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiO1xuICAgICAgICB0aGlzLmpvaW5zID0gdC5qb2lucyA/IGRlZXBjKHQuam9pbnMpIDogW107XG4gICAgICAgIHRoaXMudGFncyA9IHQudGFncyA/IGRlZXBjKHQudGFncykgOiBbXTtcbiAgICAgICAgdGhpcy5vcmRlckJ5ID0gdC5vcmRlckJ5ID8gZGVlcGModC5vcmRlckJ5KSA6IFtdO1xuICAgICAgICB0aGlzLmNvbXBpbGUoKTtcbiAgICB9XG5cbiAgICBjb21waWxlICgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgcm9vdHMgPSBbXVxuICAgICAgICBsZXQgdCA9IHRoaXM7XG4gICAgICAgIC8vIHRoZSB0cmVlIG9mIG5vZGVzIHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcXVlcnkgd2lsbCBnbyBoZXJlXG4gICAgICAgIHQucXRyZWUgPSBudWxsO1xuICAgICAgICAvLyBpbmRleCBvZiBjb2RlIHRvIGNvbnN0cmFpbnQgZ29ycyBoZXJlLlxuICAgICAgICB0LmNvZGUyYyA9IHt9XG4gICAgICAgIC8vIG5vcm1hbGl6ZSB0aGluZ3MgdGhhdCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgICAgIHQuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgICAgICB0LmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICAvL1xuICAgICAgICBsZXQgc3ViY2xhc3NDcyA9IFtdO1xuICAgICAgICB0LndoZXJlID0gKHQud2hlcmUgfHwgW10pLm1hcChjID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgcmF3IGNvbnRyYWludCBjb25maWdzIHRvIENvbnN0cmFpbnQgb2JqZWN0cy5cbiAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgaWYgKGNjLmNvZGUpIHQuY29kZTJjW2NjLmNvZGVdID0gY2M7XG4gICAgICAgICAgICBjYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIHN1YmNsYXNzQ3MucHVzaChjYyk7XG4gICAgICAgICAgICByZXR1cm4gY2M7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG11c3QgcHJvY2VzcyBhbnkgc3ViY2xhc3MgY29uc3RyYWludHMgZmlyc3QsIGZyb20gc2hvcnRlc3QgdG8gbG9uZ2VzdCBwYXRoXG4gICAgICAgIHN1YmNsYXNzQ3NcbiAgICAgICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucGF0aC5sZW5ndGggLSBiLnBhdGgubGVuZ3RoO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChjLnBhdGgpO1xuICAgICAgICAgICAgICAgICBsZXQgY2xzID0gc2VsZi5tb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGMucGF0aCk7XG4gICAgICAgICAgICBpZiAobi5jb25zdHJhaW50cylcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzID0gW2NdO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vXG4gICAgICAgIHQuc2VsZWN0ICYmIHQuc2VsZWN0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgbi5zZWxlY3QoKTtcbiAgICAgICAgfSlcbiAgICAgICAgdC5qb2lucyAmJiB0LmpvaW5zLmZvckVhY2goZnVuY3Rpb24oail7XG4gICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChqKTtcbiAgICAgICAgICAgIG4uam9pbiA9IFwib3V0ZXJcIjtcbiAgICAgICAgfSlcbiAgICAgICAgdC5vcmRlckJ5ICYmIHQub3JkZXJCeS5mb3JFYWNoKGZ1bmN0aW9uKG8sIGkpe1xuICAgICAgICAgICAgbGV0IHAgPSBPYmplY3Qua2V5cyhvKVswXVxuICAgICAgICAgICAgbGV0IGRpciA9IG9bcF1cbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgbi5zb3J0ID0geyBkaXI6IGRpciwgbGV2ZWw6IGkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdC5xdHJlZSkge1xuICAgICAgICAgICAgdGhyb3cgXCJObyBwYXRocyBpbiBxdWVyeS5cIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIHRlbXBsYXRlIGFzIGEgc2ltcGxlIGpzb24gb2JqZWN0LlxuICAgIC8vXG4gICAgdW5jb21waWxlVGVtcGxhdGUgKCl7XG4gICAgICAgIGxldCB0bXBsdCA9IHRoaXM7XG4gICAgICAgIGxldCB0ID0ge1xuICAgICAgICAgICAgbmFtZTogdG1wbHQubmFtZSxcbiAgICAgICAgICAgIHRpdGxlOiB0bXBsdC50aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0bXBsdC5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIGNvbW1lbnQ6IHRtcGx0LmNvbW1lbnQsXG4gICAgICAgICAgICByYW5rOiB0bXBsdC5yYW5rLFxuICAgICAgICAgICAgbW9kZWw6IHsgbmFtZTogdG1wbHQubW9kZWwubmFtZSB9LFxuICAgICAgICAgICAgdGFnczogZGVlcGModG1wbHQudGFncyksXG4gICAgICAgICAgICBzZWxlY3QgOiB0bXBsdC5zZWxlY3QuY29uY2F0KCksXG4gICAgICAgICAgICB3aGVyZSA6IFtdLFxuICAgICAgICAgICAgam9pbnMgOiBbXSxcbiAgICAgICAgICAgIGNvbnN0cmFpbnRMb2dpYzogdG1wbHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCIsXG4gICAgICAgICAgICBvcmRlckJ5IDogW11cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZWFjaChuKXtcbiAgICAgICAgICAgIGxldCBwID0gbi5wYXRoXG4gICAgICAgICAgICBpZiAobi5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gcGF0aCBzaG91bGQgYWxyZWFkeSBiZSB0aGVyZVxuICAgICAgICAgICAgICAgIGlmICh0LnNlbGVjdC5pbmRleE9mKG4ucGF0aCkgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkFub21hbHkgZGV0ZWN0ZWQgaW4gc2VsZWN0IGxpc3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAobi5jb25zdHJhaW50cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICAgdC53aGVyZS5wdXNoKGMuZ2V0SnNvbigpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmIChuLmpvaW4gPT09IFwib3V0ZXJcIikge1xuICAgICAgICAgICAgICAgIHQuam9pbnMucHVzaChwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcyA9IHt9XG4gICAgICAgICAgICAgICAgc1twXSA9IG4uc29ydC5kaXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB0Lm9yZGVyQnlbbi5zb3J0LmxldmVsXSA9IHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVhY2gpO1xuICAgICAgICB9XG4gICAgICAgIHJlYWNoKHRtcGx0LnF0cmVlKTtcbiAgICAgICAgdC5vcmRlckJ5ID0gdC5vcmRlckJ5LmZpbHRlcihvID0+IG8pO1xuICAgICAgICByZXR1cm4gdFxuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIE5vZGUgYXQgcGF0aCBwLCBvciBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IGV4aXN0IGluIHRoZSBjdXJyZW50IHF0cmVlLlxuICAgIC8vXG4gICAgZ2V0Tm9kZUJ5UGF0aCAocCkge1xuICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgIGlmICghcCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7XG4gICAgICAgIGlmIChuLm5hbWUgIT09IHBhcnRzWzBdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY25hbWUgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGxldCBjID0gKG4uY2hpbGRyZW4gfHwgW10pLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gY25hbWUpWzBdO1xuICAgICAgICAgICAgaWYgKCFjKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIG4gPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIC8vIEFkZHMgYSBwYXRoIHRvIHRoZSBxdHJlZSBmb3IgdGhpcyB0ZW1wbGF0ZS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgcGF0aCAoc3RyaW5nKSB0aGUgcGF0aCB0byBhZGQuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC5cbiAgICAvLyBTaWRlIGVmZmVjdHM6XG4gICAgLy8gICBDcmVhdGVzIG5ldyBub2RlcyBhcyBuZWVkZWQgYW5kIGFkZHMgdGhlbSB0byB0aGUgcXRyZWUuXG4gICAgYWRkUGF0aCAocGF0aCl7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2YocGF0aCkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBjbGFzc2VzID0gdGhpcy5tb2RlbC5jbGFzc2VzO1xuICAgICAgICBsZXQgbGFzdHQgPSBudWxsO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIGxldCBjbHM7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgICAgICBsZXQgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBtZW1iZXIgbmFtZWQgXCIgKyBwICsgXCIgaW4gY2xhc3MgXCIgKyBjbHMubmFtZSArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSwgYWRkIGl0IHRvIG4ncyBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBubiA9IG5ldyBOb2RlKHRlbXBsYXRlLCBuLCBwLCB4LCBjbHMpO1xuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIHJldHVybiB0aGUgbGFzdCBub2RlIGluIHRoZSBwYXRoXG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbiAgICAvLyB1c2VkIGluIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIG5leHRBdmFpbGFibGVDb2RlICgpe1xuICAgICAgICBmb3IobGV0IGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAgICAgICAgIGlmICghIChjIGluIHRoaXMuY29kZTJjKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxuXG4gICAgLy8gU2V0cyB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGlzIHRlbXBsYXRlLlxuICAgIC8vIEluIHRoZSBwcm9jZXNzLCBhbHNvIFwiY29ycmVjdHNcIiB0aGUgZXhwcmVzc2lvbiBhcyBmb2xsb3dzOlxuICAgIC8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbiAgICAvLyAgICAgIGFueSBjb25zdHJhaW50IGluIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFyZSByZW1vdmVkIGFuZCB0aGVcbiAgICAvLyAgICAgIGV4cHJlc3Npb24gbG9naWMgdXBkYXRlZCBhY2NvcmRpbmdseVxuICAgIC8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbiAgICAvLyAgICAgIGFyZSBBTkRlZCB0byB0aGUgZW5kLlxuICAgIC8vIEZvciBleGFtcGxlLCBpZiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoYXMgY29kZXMgQSwgQiwgYW5kIEMsIGFuZFxuICAgIC8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4gICAgLy8gYWRkZWQsIHJlc3VsdGluZyBpbiBcIkEgYW5kIEIgYW5kIENcIi5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgZXggKHN0cmluZykgdGhlIGV4cHJlc3Npb25cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgdGhlIFwiY29ycmVjdGVkXCIgZXhwcmVzc2lvblxuICAgIC8vXG4gICAgc2V0TG9naWNFeHByZXNzaW9uIChleCkge1xuICAgICAgICBleCA9IGV4ID8gZXggOiAodGhpcy5jb25zdHJhaW50TG9naWMgfHwgXCJcIilcbiAgICAgICAgbGV0IGFzdDsgLy8gYWJzdHJhY3Qgc3ludGF4IHRyZWVcbiAgICAgICAgbGV0IHNlZW4gPSBbXTtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgZnVuY3Rpb24gcmVhY2gobixsZXYpe1xuICAgICAgICAgICAgaWYgKHR5cGVvZihuKSA9PT0gXCJzdHJpbmdcIiApe1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgbiBpcyBhIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgdGVtcGxhdGUuXG4gICAgICAgICAgICAgICAgLy8gSWYgbm90LCByZW1vdmUgaXQgZnJvbSB0aGUgZXhwci5cbiAgICAgICAgICAgICAgICAvLyBBbHNvIHJlbW92ZSBpdCBpZiBpdCdzIHRoZSBjb2RlIGZvciBhIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChuIGluIHRtcGx0LmNvZGUyYyAmJiB0bXBsdC5jb2RlMmNbbl0uY3R5cGUgIT09IFwic3ViY2xhc3NcIikgPyBuIDogXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgICAgICBsZXQgY21zcyA9IGNtcy5qb2luKFwiIFwiK24ub3ArXCIgXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGNtcy5sZW5ndGggPT09IDAgPyBcIlwiIDogbGV2ID09PSAwIHx8IGNtcy5sZW5ndGggPT09IDEgPyBjbXNzIDogXCIoXCIgKyBjbXNzICsgXCIpXCJcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXN0ID0gZXggPyBwYXJzZXIucGFyc2UoZXgpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBhbGVydChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RyYWludExvZ2ljO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIGxldCBsZXggPSBhc3QgPyByZWFjaChhc3QsMCkgOiBcIlwiO1xuICAgICAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAgICAgLy8gQU5EIHRoZW0gaW50byB0aGUgZXhwcmVzc2lvbiAoZXhjZXB0IElTQSBjb25zdHJhaW50cykuXG4gICAgICAgIGxldCB0b0FkZCA9IE9iamVjdC5rZXlzKHRoaXMuY29kZTJjKS5maWx0ZXIoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICByZXR1cm4gc2Vlbi5pbmRleE9mKGMpID09PSAtMSAmJiBjLm9wICE9PSBcIklTQVwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0b0FkZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgaWYoYXN0ICYmIGFzdC5vcCAmJiBhc3Qub3AgPT09IFwib3JcIilcbiAgICAgICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgICAgICBpZiAobGV4KSB0b0FkZC51bnNoaWZ0KGxleCk7XG4gICAgICAgICAgICAgbGV4ID0gdG9BZGQuam9pbihcIiBhbmQgXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gbGV4O1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gbGV4OyB9KTtcblxuICAgICAgICByZXR1cm4gbGV4O1xuICAgIH1cblxuICAgIC8vXG4gICAgZ2V0WG1sIChxb25seSkge1xuICAgICAgICBsZXQgdCA9IHRoaXMudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgICAgbGV0IHNvID0gKHQub3JkZXJCeSB8fCBbXSkucmVkdWNlKGZ1bmN0aW9uKHMseCl7XG4gICAgICAgICAgICBsZXQgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICAgICAgbGV0IHYgPSB4W2tdXG4gICAgICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICAgICAgfSwgXCJcIik7XG5cbiAgICAgICAgLy8gQ29udmVydHMgYW4gb3V0ZXIgam9pbiBwYXRoIHRvIHhtbC5cbiAgICAgICAgZnVuY3Rpb24gb2oyeG1sKG9qKXtcbiAgICAgICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBxdWVyeSBwYXJ0XG4gICAgICAgIGxldCBxcGFydCA9XG4gICAgYDxxdWVyeVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICBtb2RlbD1cIiR7KHQubW9kZWwgJiYgdC5tb2RlbC5uYW1lKSB8fCAnJ31cIlxuICAgICAgdmlldz1cIiR7dC5zZWxlY3Quam9pbignICcpfVwiXG4gICAgICBsb25nRGVzY3JpcHRpb249XCIke2VzYyh0LmRlc2NyaXB0aW9uIHx8ICcnKX1cIlxuICAgICAgc29ydE9yZGVyPVwiJHtzbyB8fCAnJ31cIlxuICAgICAgJHt0LmNvbnN0cmFpbnRMb2dpYyAmJiAnY29uc3RyYWludExvZ2ljPVwiJyt0LmNvbnN0cmFpbnRMb2dpYysnXCInIHx8ICcnfVxuICAgID5cbiAgICAgICR7KHQuam9pbnMgfHwgW10pLm1hcChvajJ4bWwpLmpvaW4oXCIgXCIpfVxuICAgICAgJHsodC53aGVyZSB8fCBbXSkubWFwKGMgPT4gKG5ldyBDb25zdHJhaW50KGMpKS5jMnhtbChxb25seSkpLmpvaW4oXCIgXCIpfVxuICAgIDwvcXVlcnk+YDtcbiAgICAgICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgICAgIGxldCB0bXBsdCA9XG4gICAgYDx0ZW1wbGF0ZVxuICAgICAgbmFtZT1cIiR7dC5uYW1lIHx8ICcnfVwiXG4gICAgICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gICAgICBjb21tZW50PVwiJHtlc2ModC5jb21tZW50IHx8ICcnKX1cIj5cbiAgICAgJHtxcGFydH1cbiAgICA8L3RlbXBsYXRlPlxuICAgIGA7XG4gICAgICAgIHJldHVybiBxb25seSA/IHFwYXJ0IDogdG1wbHRcbiAgICB9XG5cbiAgICBnZXRKc29uIChhc2pzb24pIHtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgICAgIHJldHVybiBhc2pzb24gPyB0IDogSlNPTi5zdHJpbmdpZnkodCwgbnVsbCwgMik7XG4gICAgfVxuXG59IC8vIGVuZCBvZiBjbGFzcyBUZW1wbGF0ZVxuXG5leHBvcnQgeyBUZW1wbGF0ZSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvdGVtcGxhdGUuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgQ29uc3RyYWludCB9IGZyb20gJy4vY29uc3RyYWludC5qcyc7XG5cbi8vXG5jbGFzcyBOb2RlIHtcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgdGVtcGxhdGUgKFRlbXBsYXRlIG9iamVjdCkgdGhlIHRlbXBsYXRlIHRoYXQgb3ducyB0aGlzIG5vZGVcbiAgICAvLyAgIHBhcmVudCAob2JqZWN0KSBQYXJlbnQgb2YgdGhlIG5ldyBub2RlLlxuICAgIC8vICAgbmFtZSAoc3RyaW5nKSBOYW1lIGZvciB0aGUgbm9kZVxuICAgIC8vICAgcGNvbXAgKG9iamVjdCkgUGF0aCBjb21wb25lbnQgZm9yIHRoZSByb290LCB0aGlzIGlzIGEgY2xhc3MuIEZvciBvdGhlciBub2RlcywgYW4gYXR0cmlidXRlLCBcbiAgICAvLyAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZSwgb3IgY29sbGVjdGlvbiBkZWNyaXB0b3IuXG4gICAgLy8gICBwdHlwZSAob2JqZWN0KSBUeXBlIG9mIHBjb21wLlxuICAgIGNvbnN0cnVjdG9yICh0ZW1wbGF0ZSwgcGFyZW50LCBuYW1lLCBwY29tcCwgcHR5cGUpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlOyAvLyB0aGUgdGVtcGxhdGUgSSBiZWxvbmcgdG8uXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7ICAgICAvLyBkaXNwbGF5IG5hbWVcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdOyAgIC8vIGNoaWxkIG5vZGVzXG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50OyAvLyBwYXJlbnQgbm9kZVxuICAgICAgICB0aGlzLnBjb21wID0gcGNvbXA7ICAgLy8gcGF0aCBjb21wb25lbnQgcmVwcmVzZW50ZWQgYnkgdGhlIG5vZGUuIEF0IHJvb3QsIHRoaXMgaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdGFydGluZyBjbGFzcy4gT3RoZXJ3aXNlLCBwb2ludHMgdG8gYW4gYXR0cmlidXRlIChzaW1wbGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVmZXJlbmNlLCBvciBjb2xsZWN0aW9uKS5cbiAgICAgICAgdGhpcy5wdHlwZSAgPSBwdHlwZTsgIC8vIHBhdGggdHlwZS4gVGhlIHR5cGUgb2YgdGhlIHBhdGggYXQgdGhpcyBub2RlLCBpLmUuIHRoZSB0eXBlIG9mIHBjb21wLiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvaW50cyB0byBhIGNsYXNzIGluIHRoZSBtb2RlbCBvciBhIFwibGVhZlwiIGNsYXNzIChlZyBqYXZhLmxhbmcuU3RyaW5nKS4gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXkgYmUgb3ZlcnJpZGVuIGJ5IHN1YmNsYXNzIGNvbnN0cmFpbnQuXG4gICAgICAgIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDsgLy8gc3ViY2xhc3MgY29uc3RyYWludCAoaWYgYW55KS4gUG9pbnRzIHRvIGEgY2xhc3MgaW4gdGhlIG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBzcGVjaWZpZWQsIG92ZXJyaWRlcyBwdHlwZSBhcyB0aGUgdHlwZSBvZiB0aGUgbm9kZS5cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IFtdOy8vIGFsbCBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZpZXcgPSBudWxsOyAgICAvLyBJZiBzZWxlY3RlZCBmb3IgcmV0dXJuLCB0aGlzIGlzIGl0cyBjb2x1bW4jLlxuICAgICAgICBwYXJlbnQgJiYgcGFyZW50LmNoaWxkcmVuLnB1c2godGhpcyk7XG5cbiAgICAgICAgdGhpcy5qb2luID0gbnVsbDsgLy8gaWYgdHJ1ZSwgdGhlbiB0aGUgbGluayBiZXR3ZWVuIG15IHBhcmVudCBhbmQgbWUgaXMgYW4gb3V0ZXIgam9pblxuICAgICAgICBcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMucGF0aDtcbiAgICB9XG4gICAgZ2V0IGlzUm9vdCAoKSB7XG4gICAgICAgIHJldHVybiAhIHRoaXMucGFyZW50O1xuICAgIH1cbiAgICAvL1xuICAgIGdldCByb290Tm9kZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLnF0cmVlO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIG9wZXJhdG9yIGlzIHZhbGlkIGZvciB0aGlzIG5vZGUuXG4gICAgb3BWYWxpZCAob3Ape1xuICAgICAgICBpZiAodGhpcy5pc1Jvb3QgJiYgIW9wLnZhbGlkRm9yUm9vdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5wdHlwZS5pc0xlYWZUeXBlKSB7XG4gICAgICAgICAgICBpZighIG9wLnZhbGlkRm9yQXR0cilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBlbHNlIGlmKCBvcC52YWxpZFR5cGVzICYmIG9wLnZhbGlkVHlwZXMuaW5kZXhPZih0aGlzLnB0eXBlLm5hbWUpID09IC0xKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKCEgb3AudmFsaWRGb3JDbGFzcylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gbGlzdCBpcyB2YWxpZCBhcyBhIGxpc3QgY29uc3RyYWludCBvcHRpb24gZm9yXG4gICAgLy8gdGhlIG5vZGUgbi4gQSBsaXN0IGlzIHZhbGlkIHRvIHVzZSBpbiBhIGxpc3QgY29uc3RyYWludCBhdCBub2RlIG4gaWZmXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGVxdWFsIHRvIG9yIGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGEgc3VwZXJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGUuIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICAgICBlbGVtZW50cyBpbiB0aGUgbGlzdCB0aGF0IGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBub2RlJ3MgdHlwZVxuICAgIC8vICAgICAgIGFyZSBhdXRvbWF0aWNhbGx5IGZpbHRlcmVkIG91dC5cbiAgICBsaXN0VmFsaWQgKGxpc3Qpe1xuICAgICAgICBsZXQgbnQgPSB0aGlzLnN1YnR5cGVDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgICAgIGlmIChudC5pc0xlYWZUeXBlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCBsdCA9IHRoaXMudGVtcGxhdGUubW9kZWwuY2xhc3Nlc1tsaXN0LnR5cGVdO1xuICAgICAgICByZXR1cm4gaXNTdWJjbGFzcyhsdCwgbnQpIHx8IGlzU3ViY2xhc3MobnQsIGx0KTtcbiAgICB9XG5cblxuICAgIC8vXG4gICAgZ2V0IHBhdGggKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucGF0aCArXCIuXCIgOiBcIlwiKSArIHRoaXMubmFtZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgbm9kZVR5cGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNCaW9FbnRpdHkgKCkge1xuICAgICAgICBmdW5jdGlvbiBjayhjbHMpIHtcbiAgICAgICAgICAgIC8vIHNpbXBsZSBhdHRyaWJ1dGUgLSBub3BlXG4gICAgICAgICAgICBpZiAoY2xzLmlzTGVhZlR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIC8vIEJpb0VudGl0eSAtIHl1cFxuICAgICAgICAgICAgaWYgKGNscy5uYW1lID09PSBcIkJpb0VudGl0eVwiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIC8vIG5laXRoZXIgLSBjaGVjayBhbmNlc3RvcnNcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xzLmV4dGVuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2soY2xzLmV4dGVuZHNbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sodGhpcy5ub2RlVHlwZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyAhPT0gbnVsbCAmJiB0aGlzLnZpZXcgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICB0aGlzLnZpZXcgPSBpID49IDAgPyBpIDogKHQuc2VsZWN0LnB1c2gocCkgLSAxKTtcbiAgICB9XG4gICAgdW5zZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwYXRoIGZyb20gdGhlIHNlbGVjdCBsaXN0XG4gICAgICAgICAgICB0LnNlbGVjdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW51bWJlciBub2RlcyBoZXJlXG4gICAgICAgICAgICB0LnNlbGVjdC5zbGljZShpKS5mb3JFYWNoKCAocCxqKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnRlbXBsYXRlLmdldE5vZGVCeVBhdGgocCk7XG4gICAgICAgICAgICAgICAgbi52aWV3IC09IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdHJ1ZSBpZmYgdGhpcyBub2RlIGNhbiBiZSBzb3J0ZWQgb24sIHdoaWNoIGlzIHRydWUgaWZmIHRoZSBub2RlIGlzIGFuXG4gICAgLy8gYXR0cmlidXRlLCBhbmQgdGhlcmUgYXJlIG5vIG91dGVyIGpvaW5zIGJldHdlZW4gaXQgYW5kIHRoZSByb290XG4gICAgY2FuU29ydCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IG4gPSB0aGlzO1xuICAgICAgICB3aGlsZSAobikge1xuICAgICAgICAgICAgaWYgKG4uam9pbikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgbiA9IG4ucGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHNldFNvcnQobmV3ZGlyKXtcbiAgICAgICAgbGV0IG9sZGRpciA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5kaXIgOiBcIm5vbmVcIjtcbiAgICAgICAgbGV0IG9sZGxldiA9IHRoaXMuc29ydCA/IHRoaXMuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICBsZXQgbWF4bGV2ID0gLTE7XG4gICAgICAgIGxldCByZW51bWJlciA9IGZ1bmN0aW9uIChuKXtcbiAgICAgICAgICAgIGlmIChuLnNvcnQpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkbGV2ID49IDAgJiYgbi5zb3J0LmxldmVsID4gb2xkbGV2KVxuICAgICAgICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICBtYXhsZXYgPSBNYXRoLm1heChtYXhsZXYsIG4uc29ydC5sZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuLmNoaWxkcmVuLmZvckVhY2gocmVudW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbmV3ZGlyIHx8IG5ld2RpciA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBub3Qgc29ydGVkXG4gICAgICAgICAgICB0aGlzLnNvcnQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSB3ZXJlIHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gcmVudW1iZXIgYW55IGV4aXN0aW5nIHNvcnQgY2Zncy5cbiAgICAgICAgICAgICAgICByZW51bWJlcih0aGlzLnRlbXBsYXRlLnF0cmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNldCB0byBzb3J0ZWRcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBub3Qgc29ydGVkIGJlZm9yZSwgbmVlZCB0byBmaW5kIG5leHQgbGV2ZWwuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICAgICAgb2xkbGV2ID0gbWF4bGV2ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc29ydCA9IHsgZGlyOm5ld2RpciwgbGV2ZWw6IG9sZGxldiB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0cyB0aGUgc3ViY2xhc3MgY29uc3RyYWludCBhdCB0aGlzIG5vZGUsIG9yIHJlbW92ZXMgaXQgaWYgbm8gc3ViY2xhc3MgZ2l2ZW4uIEEgbm9kZSBtYXlcbiAgICAvLyBoYXZlIGV4YWN0bHkgMCBvciAxIHN1YmNsYXNzIGNvbnN0cmFpbnQuIEFzc3VtZXMgdGhlIHN1YmNsYXNzIGlzIGFjdHVhbGx5IGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUnc1xuICAgIC8vIHR5cGUgKHNob3VsZCBjaGVjayB0aGlzKS5cbiAgICAvL1xuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjIChDb25zdHJhaW50KSBUaGUgc3ViY2xhc3MgQ29uc3RyYWludCBvciBudWxsLiBTZXRzIHRoZSBzdWJjbGFzcyBjb25zdHJhaW50IG9uIHRoZSBjdXJyZW50IG5vZGUgdG9cbiAgICAvLyAgICAgICB0aGUgdHlwZSBuYW1lZCBpbiBjLiBSZW1vdmVzIHRoZSBwcmV2aW91cyBzdWJjbGFzcyBjb25zdHJhaW50IGlmIGFueS4gSWYgbnVsbCwganVzdCByZW1vdmVzXG4gICAgLy8gICAgICAgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnQuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIExpc3Qgb2YgYW55IG5vZGVzIHRoYXQgd2VyZSByZW1vdmVkIGJlY2F1c2UgdGhlIG5ldyBjb25zdHJhaW50IGNhdXNlZCB0aGVtIHRvIGJlY29tZSBpbnZhbGlkLlxuICAgIC8vXG4gICAgc2V0U3ViY2xhc3NDb25zdHJhaW50IChjKSB7XG4gICAgICAgIGxldCBuID0gdGhpcztcbiAgICAgICAgLy8gcmVtb3ZlIGFueSBleGlzdGluZyBzdWJjbGFzcyBjb25zdHJhaW50XG4gICAgICAgIGlmIChjICYmIG4uY29uc3RyYWludHMuaW5kZXhPZihjKSA9PT0gLTEpXG4gICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYyk7XG4gICAgICAgIG4uY29uc3RyYWludHMgPSBuLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbiAoY2MpeyByZXR1cm4gY2MuY3R5cGUgIT09IFwic3ViY2xhc3NcIiB8fCBjYyA9PT0gYzsgfSk7XG4gICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGMpe1xuICAgICAgICAgICAgLy8gbG9va3VwIHRoZSBzdWJjbGFzcyBuYW1lXG4gICAgICAgICAgICBsZXQgY2xzID0gdGhpcy50ZW1wbGF0ZS5tb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICBpZighY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgLy8gYWRkIHRoZSBjb25zdHJhaW50XG4gICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgfVxuICAgICAgICAvLyBsb29rcyBmb3IgaW52YWxpZGF0ZWQgcGF0aHMgXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgICAgIGxldCBjbHMgPSBub2RlLnN1YmNsYXNzQ29uc3RyYWludCB8fCBub2RlLnB0eXBlO1xuICAgICAgICAgICAgbGV0IGMyID0gW107XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgaWYoYy5uYW1lIGluIGNscy5hdHRyaWJ1dGVzIHx8IGMubmFtZSBpbiBjbHMucmVmZXJlbmNlcyB8fCBjLm5hbWUgaW4gY2xzLmNvbGxlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGMyLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuID0gYzI7XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVtb3ZlZCA9IGNoZWNrKG4sW10pO1xuICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmVzIHRoaXMgbm9kZSBmcm9tIHRoZSBxdWVyeS5cbiAgICByZW1vdmUgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGFyZW50O1xuICAgICAgICBpZiAoIXApIHJldHVybjtcbiAgICAgICAgLy8gRmlyc3QsIHJlbW92ZSBhbGwgY29uc3RyYWludHMgb24gdGhpcyBvciBkZXNjZW5kYW50c1xuICAgICAgICBmdW5jdGlvbiBybWMgKHgpIHtcbiAgICAgICAgICAgIHgudW5zZWxlY3QoKTtcbiAgICAgICAgICAgIHguY29uc3RyYWludHMuZm9yRWFjaChjID0+IHgucmVtb3ZlQ29uc3RyYWludChjKSk7XG4gICAgICAgICAgICB4LmNoaWxkcmVuLmZvckVhY2gocm1jKTtcbiAgICAgICAgfVxuICAgICAgICBybWModGhpcyk7XG4gICAgICAgIC8vIE5vdyByZW1vdmUgdGhlIHN1YnRyZWUgYXQgbi5cbiAgICAgICAgcC5jaGlsZHJlbi5zcGxpY2UocC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpLCAxKTtcbiAgICB9XG5cbiAgICAvLyBBZGRzIGEgbmV3IGNvbnN0cmFpbnQgdG8gYSBub2RlIGFuZCByZXR1cm5zIGl0LlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBjIChjb25zdHJhaW50KSBJZiBnaXZlbiwgdXNlIHRoYXQgY29uc3RyYWludC4gT3RoZXJ3aXNlLCBjcmVhdGUgZGVmYXVsdC5cbiAgICAvLyBSZXR1cm5zOlxuICAgIC8vICAgVGhlIG5ldyBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgYWRkQ29uc3RyYWludCAoYykge1xuICAgICAgICBpZiAoYykge1xuICAgICAgICAgICAgLy8ganVzdCB0byBiZSBzdXJlXG4gICAgICAgICAgICBjLm5vZGUgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IG9wID0gT1BJTkRFWFt0aGlzLnBjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIgPyBcIj1cIiA6IFwiTE9PS1VQXCJdO1xuICAgICAgICAgICAgYyA9IG5ldyBDb25zdHJhaW50KHtub2RlOnRoaXMsIG9wOm9wLm9wLCBjdHlwZTogb3AuY3R5cGV9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzLnB1c2goYyk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUud2hlcmUucHVzaChjKTtcblxuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN1YmNsYXNzQ29uc3RyYWludChjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGMuY29kZSA9IHRoaXMudGVtcGxhdGUubmV4dEF2YWlsYWJsZUNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG5cbiAgICByZW1vdmVDb25zdHJhaW50IChjKXtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IHRoaXMuY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS53aGVyZSA9IHRoaXMudGVtcGxhdGUud2hlcmUuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIilcbiAgICAgICAgICAgIHRoaXMuc2V0U3ViY2xhc3NDb25zdHJhaW50KG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRlbXBsYXRlLmNvZGUyY1tjLmNvZGVdO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG59IC8vIGVuZCBvZiBjbGFzcyBOb2RlXG5cbmV4cG9ydCB7IE5vZGUgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL25vZGUuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGQzanNvblByb21pc2UgfSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5mdW5jdGlvbiBpbml0UmVnaXN0cnkgKGNiKSB7XG4gICAgcmV0dXJuIGQzanNvblByb21pc2UocmVnaXN0cnlVcmwpXG4gICAgICAudGhlbihjYilcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgcmVnaXN0cnkgYXQgJHtyZWdpc3RyeVVybH0uIFRyeWluZyAke3JlZ2lzdHJ5RmlsZVVybH0uYCk7XG4gICAgICAgICAgZDNqc29uUHJvbWlzZShyZWdpc3RyeUZpbGVVcmwpXG4gICAgICAgICAgICAgIC50aGVuKGNiKVxuICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgYWxlcnQoXCJDYW5ub3QgYWNjZXNzIHJlZ2lzdHJ5IGZpbGUuIFRoaXMgaXMgbm90IHlvdXIgbHVja3kgZGF5LlwiKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG59XG5cbmV4cG9ydCB7IGluaXRSZWdpc3RyeSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcmVnaXN0cnkuanNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7Y29kZXBvaW50c30gZnJvbSAnLi9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanMnO1xuXG5sZXQgZWRpdFZpZXdzID0geyBxdWVyeU1haW46IHtcbiAgICAgICAgbmFtZTogXCJxdWVyeU1haW5cIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwidHJlZVwiLFxuICAgICAgICBub2RlQ29tcDogbnVsbCxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0cm9rZTogXCIjZTI4YjI4XCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29sdW1uT3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJjb2x1bW5PcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zZWxlY3RlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb2x1bW4gb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc2VsZWN0aW9uLWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zZWxlY3RlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLmlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyBhLnZpZXcgLSBiLnZpZXcgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLmlzU2VsZWN0ZWQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZHJhZyBpbiBjb2x1bW5PcmRlciB2aWV3IGNoYW5nZXMgdGhlIGNvbHVtbiBvcmRlciAoZHVoISlcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4geyBuLnZpZXcgPSBpIH0pO1xuICAgICAgICAgIGRyYWdnZWQudGVtcGxhdGUuc2VsZWN0ID0gbm9kZXMubWFwKCBuPT4gbi5wYXRoICk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBudWxsLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBuLnZpZXcgOiBcIlwiXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNvcnRPcmRlcjoge1xuICAgICAgICBuYW1lOiBcInNvcnRPcmRlclwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIGRyYWdnYWJsZTogXCJnLm5vZGVncm91cC5zb3J0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gc29ydCBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gc29ydC1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuc29ydClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IGEuc29ydC5sZXZlbCAtIGIuc29ydC5sZXZlbCA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuc29ydCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgLy8gZHJhZyBpbiBzb3J0T3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBzb3J0IG9yZGVyIChkdWghKVxuICAgICAgICAgIG5vZGVzLmZvckVhY2goKG4saSkgPT4ge1xuICAgICAgICAgICAgICBuLnNvcnQubGV2ZWwgPSBpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5zb3J0ID8gY29kZXBvaW50c1tcInJlb3JkZXJcIl0gOiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbnN0cmFpbnRMb2dpYzoge1xuICAgICAgICBuYW1lOiBcImNvbnN0cmFpbnRMb2dpY1wiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJkZW5kcm9ncmFtXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbnN0cmFpbnQgbG9naWMgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBjb25zdHJhaW5lZCBub2RlcyBhcmUgYXQgdGhlIHRvcCwgaW4gY29kZSBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGxldCBhY29uc3QgPSBhLmNvbnN0cmFpbnRzICYmIGEuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYWNvZGUgPSBhY29uc3QgPyBhLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGxldCBiY29uc3QgPSBiLmNvbnN0cmFpbnRzICYmIGIuY29uc3RyYWludHMubGVuZ3RoID4gMDtcbiAgICAgICAgICBsZXQgYmNvZGUgPSBiY29uc3QgPyBiLmNvbnN0cmFpbnRzWzBdLmNvZGUgOiBudWxsO1xuICAgICAgICAgIGlmIChhY29uc3QpXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAoYWNvZGUgPCBiY29kZSA/IC0xIDogYWNvZGUgPiBiY29kZSA/IDEgOiAwKSA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IDEgOiBuYW1lQ29tcChhLCBiKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gQ29tcGFyYXRvciBmdW5jdGlvbiwgZm9yIHNvcnRpbmcgYSBsaXN0IG9mIG5vZGVzIGJ5IG5hbWUuIENhc2UtaW5zZW5zaXRpdmUuXG4vL1xubGV0IG5hbWVDb21wID0gZnVuY3Rpb24oYSxiKSB7XG4gICAgbGV0IG5hID0gYS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IG5iID0gYi5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG5hIDwgbmIgPyAtMSA6IG5hID4gbmIgPyAxIDogMDtcbn07XG5cbmV4cG9ydCB7IGVkaXRWaWV3cyB9O1xuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9lZGl0Vmlld3MuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGZpbmREb21CeURhdGFPYmogfSBmcm9tICcuL3V0aWxzLmpzJztcblxuY2xhc3MgRGlhbG9nIHtcbiAgICBjb25zdHJ1Y3RvciAoZWRpdG9yKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yO1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRFZGl0b3IgPSBlZGl0b3IuY29uc3RyYWludEVkaXRvcjtcbiAgICAgICAgdGhpcy51bmRvTWdyID0gZWRpdG9yLnVuZG9NZ3I7XG4gICAgICAgIHRoaXMuY3Vyck5vZGUgPSBudWxsO1xuICAgICAgICB0aGlzLmRnID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKTtcbiAgICAgICAgdGhpcy5kZy5jbGFzc2VkKFwiaGlkZGVuXCIsdHJ1ZSlcbiAgICAgICAgdGhpcy5kZy5zZWxlY3QoXCIuYnV0dG9uLmNsb3NlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5oaWRlKCkpO1xuICAgICAgICB0aGlzLmRnLnNlbGVjdChcIi5idXR0b24ucmVtb3ZlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5lZGl0b3IucmVtb3ZlTm9kZSh0aGlzLmN1cnJOb2RlKSk7XG5cbiAgICAgICAgLy8gV2lyZSB1cCBzZWxlY3QgYnV0dG9uIGluIGRpYWxvZ1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdIC5zd2F0Y2gnKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJyTm9kZS5pc1NlbGVjdGVkID8gc2VsZi5jdXJyTm9kZS51bnNlbGVjdCgpIDogc2VsZi5jdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzZWxlY3QtY3RybFwiXScpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgc2VsZi5jdXJyTm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyBXaXJlIHVwIHNvcnQgZnVuY3Rpb24gaW4gZGlhbG9nXG4gICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXSAuc3dhdGNoJylcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNvcnQtY3RybFwiXScpO1xuICAgICAgICAgICAgICAgIGlmIChjYy5jbGFzc2VkKFwiZGlzYWJsZWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBsZXQgb2xkc29ydCA9IGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIpID8gXCJhc2NcIiA6IGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiKSA/IFwiZGVzY1wiIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IG5ld3NvcnQgPSBvbGRzb3J0ID09PSBcImFzY1wiID8gXCJkZXNjXCIgOiBvbGRzb3J0ID09PSBcImRlc2NcIiA/IFwibm9uZVwiIDogXCJhc2NcIjtcbiAgICAgICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGFzY1wiLCBuZXdzb3J0ID09PSBcImFzY1wiKTtcbiAgICAgICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGRlc2NcIiwgbmV3c29ydCA9PT0gXCJkZXNjXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuY3Vyck5vZGUuc2V0U29ydChuZXdzb3J0KTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuZG9NZ3Iuc2F2ZVN0YXRlKHNlbGYuY3Vyck5vZGUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShzZWxmLmN1cnJOb2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBIaWRlcyB0aGUgZGlhbG9nLiBTZXRzIHRoZSBjdXJyZW50IG5vZGUgdG8gbnVsbC5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgbm9uZVxuICAgIC8vIFJldHVybnNcbiAgICAvLyAgbm90aGluZ1xuICAgIC8vIFNpZGUgZWZmZWN0czpcbiAgICAvLyAgSGlkZXMgdGhlIGRpYWxvZy5cbiAgICAvLyAgU2V0cyBjdXJyTm9kZSB0byBudWxsLlxuICAgIC8vXG4gICAgaGlkZSAoKXtcbiAgICAgIHRoaXMuY3Vyck5vZGUgPSBudWxsO1xuICAgICAgdGhpcy5kZ1xuICAgICAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIHRydWUpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbi8yKVxuICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMWUtNilcIilcbiAgICAgICAgICA7XG4gICAgICB0aGlzLmNvbnN0cmFpbnRFZGl0b3IuaGlkZSgpO1xuICAgIH1cblxuICAgIC8vIE9wZW5zIGEgZGlhbG9nIG9uIHRoZSBzcGVjaWZpZWQgbm9kZS5cbiAgICAvLyBBbHNvIG1ha2VzIHRoYXQgbm9kZSB0aGUgY3VycmVudCBub2RlLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBuICAgIHRoZSBub2RlXG4gICAgLy8gICBlbHQgIHRoZSBET00gZWxlbWVudCAoZS5nLiBhIGNpcmNsZSlcbiAgICAvLyBSZXR1cm5zXG4gICAgLy8gICBzdHJpbmdcbiAgICAvLyBTaWRlIGVmZmVjdDpcbiAgICAvLyAgIHNldHMgZ2xvYmFsIGN1cnJOb2RlXG4gICAgLy9cbiAgICBzaG93IChuLCBlbHQsIHJlZnJlc2hPbmx5KSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAoIWVsdCkgZWx0ID0gZmluZERvbUJ5RGF0YU9iaihuKTtcbiAgICAgIHRoaXMuY29uc3RyYWludEVkaXRvci5oaWRlKCk7XG4gICAgICB0aGlzLmN1cnJOb2RlID0gbjtcblxuICAgICAgbGV0IGlzcm9vdCA9ICEgdGhpcy5jdXJyTm9kZS5wYXJlbnQ7XG4gICAgICAvLyBNYWtlIG5vZGUgdGhlIGRhdGEgb2JqIGZvciB0aGUgZGlhbG9nXG4gICAgICBsZXQgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKS5kYXR1bShuKTtcbiAgICAgIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICAgICAgbGV0IGRiYiA9IGRpYWxvZ1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCBlYmIgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBsZXQgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGV0IHQgPSAoZWJiLnRvcCAtIGJiYi50b3ApICsgZWJiLndpZHRoLzI7XG4gICAgICBsZXQgYiA9IChiYmIuYm90dG9tIC0gZWJiLmJvdHRvbSkgKyBlYmIud2lkdGgvMjtcbiAgICAgIGxldCBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICAgICAgbGV0IGRpciA9IFwiZFwiIDsgLy8gXCJkXCIgb3IgXCJ1XCJcbiAgICAgIC8vIE5COiBjYW4ndCBnZXQgb3BlbmluZyB1cCB0byB3b3JrLCBzbyBoYXJkIHdpcmUgaXQgdG8gZG93bi4gOi1cXFxuXG4gICAgICAvL1xuICAgICAgZGlhbG9nXG4gICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCBsK1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgICAgICAuY2xhc3NlZChcImhpZGRlblwiLCBmYWxzZSlcbiAgICAgICAgICAuY2xhc3NlZChcImlzcm9vdFwiLCBpc3Jvb3QpXG4gICAgICAgICAgO1xuICAgICAgaWYgKGRpciA9PT0gXCJkXCIpXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAgICAgLnN0eWxlKFwiYm90dG9tXCIsIG51bGwpXG4gICAgICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAwJVwiKSA7XG4gICAgICBlbHNlXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCBudWxsKVxuICAgICAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgICAgIC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgXCIwJSAxMDAlXCIpIDtcblxuICAgICAgLy8gU2V0IHRoZSBkaWFsb2cgdGl0bGUgdG8gbm9kZSBuYW1lXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgICAgIC50ZXh0KG4ubmFtZSk7XG4gICAgICAvLyBTaG93IHRoZSBmdWxsIHBhdGhcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgICAgICAudGV4dChuLnBhdGgpO1xuICAgICAgLy8gVHlwZSBuYW1lIGF0IHRoaXMgbm9kZVxuICAgICAgbGV0IHRwID0gbi5wdHlwZS5uYW1lO1xuICAgICAgbGV0IHN0cCA9IChuLnN1YmNsYXNzQ29uc3RyYWludCAmJiBuLnN1YmNsYXNzQ29uc3RyYWludC5uYW1lKSB8fCBudWxsO1xuICAgICAgbGV0IHRzdHJpbmcgPSBzdHAgJiYgYDxzcGFuIHN0eWxlPVwiY29sb3I6IHB1cnBsZTtcIj4ke3N0cH08L3NwYW4+ICgke3RwfSlgIHx8IHRwXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgICAgICAuaHRtbCh0c3RyaW5nKTtcblxuICAgICAgLy8gV2lyZSB1cCBhZGQgY29uc3RyYWludCBidXR0b25cbiAgICAgIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBsZXQgYyA9IG4uYWRkQ29uc3RyYWludCgpO1xuICAgICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgICAgICAgICAgc2VsZi5lZGl0b3IudXBkYXRlKG4pO1xuICAgICAgICAgICAgICAgIHNlbGYuc2hvdyhuLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbnN0cmFpbnRFZGl0b3Iub3BlbihjLCBuKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAvLyBGaWxsIG91dCB0aGUgY29uc3RyYWludHMgc2VjdGlvbi4gRmlyc3QsIHNlbGVjdCBhbGwgY29uc3RyYWludHMuXG4gICAgICBsZXQgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgICAgICAuc2VsZWN0QWxsKFwiLmNvbnN0cmFpbnRcIilcbiAgICAgICAgICAuZGF0YShuLmNvbnN0cmFpbnRzKTtcbiAgICAgIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gICAgICAvLyAxLiBjb250YWluZXJcbiAgICAgIGxldCBjZGl2cyA9IGNvbnN0cnMuZW50ZXIoKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsXCJjb25zdHJhaW50XCIpIDtcbiAgICAgIC8vIDIuIG9wZXJhdG9yXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJvcFwiKSA7XG4gICAgICAvLyAzLiB2YWx1ZVxuICAgICAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAgICAgLy8gNC4gY29uc3RyYWludCBjb2RlXG4gICAgICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJjb2RlXCIpIDtcbiAgICAgIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICAgICAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBlZGl0XCIpLnRleHQoXCJtb2RlX2VkaXRcIikuYXR0cihcInRpdGxlXCIsXCJFZGl0IHRoaXMgY29uc3RyYWludFwiKTtcbiAgICAgIC8vIDYuIGJ1dHRvbiB0byByZW1vdmUgdGhpcyBjb25zdHJhaW50XG4gICAgICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGNhbmNlbFwiKS50ZXh0KFwiZGVsZXRlX2ZvcmV2ZXJcIikuYXR0cihcInRpdGxlXCIsXCJSZW1vdmUgdGhpcyBjb25zdHJhaW50XCIpO1xuXG4gICAgICAvLyBSZW1vdmUgZXhpdGluZ1xuICAgICAgY29uc3Rycy5leGl0KCkucmVtb3ZlKCkgO1xuXG4gICAgICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICAgICAgY29uc3Ryc1xuICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oYykgeyByZXR1cm4gXCJjb25zdHJhaW50IFwiICsgYy5jdHlwZTsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMuY29kZSB8fCBcIj9cIjsgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJvcFwiXScpXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICAgICAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwidmFsdWVcIl0nKVxuICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlICsgKGMuZXh0cmFWYWx1ZSA/IFwiIGluIFwiICsgYy5leHRyYVZhbHVlIDogXCJcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgfHwgKGMudmFsdWVzICYmIGMudmFsdWVzLmpvaW4oXCIsXCIpKSB8fCBjLnR5cGU7XG4gICAgICAgICAgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdChcImkuZWRpdFwiKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGMpeyBcbiAgICAgICAgICAgICAgc2VsZi5jb25zdHJhaW50RWRpdG9yLm9wZW4oYywgbik7XG4gICAgICAgICAgfSk7XG4gICAgICBjb25zdHJzLnNlbGVjdChcImkuY2FuY2VsXCIpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgICAgICBuLnJlbW92ZUNvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUobik7XG4gICAgICAgICAgICAgIHNlbGYuZWRpdG9yLnVwZGF0ZShuKTtcbiAgICAgICAgICAgICAgc2VsZi5zaG93KG4sIG51bGwsIHRydWUpO1xuICAgICAgICAgIH0pXG5cblxuICAgICAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICAgICAgZGlhbG9nLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmVkaXRvci5hbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgICAgIC8vXG4gICAgICBsZXQgdHlwID0gbi5wY29tcC50eXBlIHx8IG4ucGNvbXA7IC8vIHR5cGUgb2YgdGhlIG5vZGUuIENhc2UgZm9yIGlmIHJvb3Qgbm9kZS5cbiAgICAgIGlmICh0eXAuaXNMZWFmVHlwZSkge1xuICAgICAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgZGlhbG9nXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsdHJ1ZSk7XG4gICAgICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUubmFtZSB8fCBuLnBjb21wLnR5cGUgKTtcbiAgICAgICAgICAvLyBcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihuKXsgcmV0dXJuIG4uaXNTZWxlY3RlZCB9KTtcbiAgICAgICAgICAvLyBcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNvcnQtY3RybFwiXScpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwiZGlzYWJsZWRcIiwgbiA9PiAhbi5jYW5Tb3J0KCkpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic29ydGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAgICAgICAgIC5jbGFzc2VkKFwic29ydGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIERpYWxvZyBmb3IgY2xhc3Nlc1xuICAgICAgICAgIGRpYWxvZ1xuICAgICAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLGZhbHNlKTtcbiAgICAgICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZSA/IG4ucGNvbXAudHlwZS5uYW1lIDogbi5wY29tcC5uYW1lKTtcblxuICAgICAgICAgIC8vIHdpcmUgdXAgdGhlIGJ1dHRvbiB0byBzaG93IHN1bW1hcnkgZmllbGRzXG4gICAgICAgICAgZGlhbG9nLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNob3dTdW1tYXJ5XCJdJylcbiAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5zZWxlY3RlZE5leHQoXCJzdW1tYXJ5ZmllbGRzXCIpKTtcblxuICAgICAgICAgIC8vIEZpbGwgaW4gdGhlIHRhYmxlIGxpc3RpbmcgYWxsIHRoZSBhdHRyaWJ1dGVzL3JlZnMvY29sbGVjdGlvbnMuXG4gICAgICAgICAgbGV0IHRibCA9IGRpYWxvZy5zZWxlY3QoXCJ0YWJsZS5hdHRyaWJ1dGVzXCIpO1xuICAgICAgICAgIGxldCByb3dzID0gdGJsLnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgICAgIC5kYXRhKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5hbGxQYXJ0cylcbiAgICAgICAgICAgICAgO1xuICAgICAgICAgIHJvd3MuZW50ZXIoKS5hcHBlbmQoXCJ0clwiKTtcbiAgICAgICAgICByb3dzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgICBsZXQgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICAgICAgICAgIGlmIChjb21wLmtpbmQgPT09IFwiYXR0cmlidXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIlNlbGVjdCB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzZWxlY3RzaW1wbGUnLFxuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxmLnNlbGVjdGVkTmV4dChcInNlbGVjdGVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiQ29uc3RyYWluIHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgICAgIGNsczogJ2NvbnN0cmFpbnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGYuc2VsZWN0ZWROZXh0KFwiY29uc3RyYWluZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb21wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGA8aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCIgdGl0bGU9XCJGb2xsb3cgdGhpcyAke2NvbXAua2luZH1cIj5wbGF5X2Fycm93PC9pPmAsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnb3Blbm5leHQnLFxuICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxmLnNlbGVjdGVkTmV4dChcIm9wZW5cIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICA7XG4gICAgICAgICAgY2VsbHMuZW50ZXIoKS5hcHBlbmQoXCJ0ZFwiKTtcbiAgICAgICAgICBjZWxsc1xuICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLmNsczt9KVxuICAgICAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5jbGljayAmJiBkLmNsaWNrKCk7IH0pXG4gICAgICAgICAgICAgIDtcbiAgICAgICAgICBjZWxscy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kcyB0aGUgcGF0aCBmcm9tIGN1cnJOb2RlIHRvIHBcbiAgICAvLyBBcmdzOlxuICAgIC8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbiAgICAvLyAgIG1vZGUgKHN0cmluZykgb25lIG9mIFwic2VsZWN0XCIsIFwiY29uc3RyYWluXCIgb3IgXCJvcGVuXCJcbiAgICAvLyAgIHAgKHN0cmluZykgTmFtZSBvZiBhbiBhdHRyaWJ1dGUsIHJlZiwgb3IgY29sbGVjdGlvblxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICBub3RoaW5nXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuICAgIC8vICAgYXMgYSBuZXcgY2hpbGQgKGdyb3dpbmcgb3V0IGZyb20gdGhlIHBhcmVudCBub2RlLlxuICAgIC8vICAgVGhlbiB0aGUgZGlhbG9nIGlzIG9wZW5lZCBvbiB0aGUgY2hpbGQgbm9kZS5cbiAgICAvLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4gICAgLy8gICBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgXCJvcGVuK2NvbnN0cmFpblwiIGJ1dHRvbiwgYSBuZXcgY29uc3RyYWludCBpcyBhZGRlZCB0byB0aGVcbiAgICAvLyAgIGNoaWxkLCBhbmQgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9wZW5lZCAgb24gdGhhdCBjb25zdHJhaW50LlxuICAgIC8vXG4gICAgc2VsZWN0ZWROZXh0IChtb2RlLCBwKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgbGV0IG47XG4gICAgICAgIGxldCBjYztcbiAgICAgICAgbGV0IHNmcztcbiAgICAgICAgbGV0IGN0ID0gdGhpcy5jdXJyTm9kZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwic3VtbWFyeWZpZWxkc1wiKSB7XG4gICAgICAgICAgICBzZnMgPSB0aGlzLmVkaXRvci5jdXJyTWluZS5zdW1tYXJ5RmllbGRzW3RoaXMuY3Vyck5vZGUubm9kZVR5cGUubmFtZV18fFtdO1xuICAgICAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgICAgIHNmID0gc2YucmVwbGFjZSgvXlteLl0rLywgc2VsZi5jdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgICAgICBsZXQgbSA9IGN0LmFkZFBhdGgoc2YpO1xuICAgICAgICAgICAgICAgIGlmICghIG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBtLnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcCA9IHNlbGYuY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgICAgIG4gPSBjdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IFwic2VsZWN0ZWRcIilcbiAgICAgICAgICAgICAgICAhbi5pc1NlbGVjdGVkICYmIG4uc2VsZWN0KCk7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gXCJjb25zdHJhaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgY2MgPSBuLmFkZENvbnN0cmFpbnQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlICE9PSBcIm9wZW5cIilcbiAgICAgICAgICAgIHNlbGYudW5kb01nci5zYXZlU3RhdGUoc2VsZi5jdXJyTm9kZSk7XG4gICAgICAgIGlmIChtb2RlICE9PSBcInN1bW1hcnlmaWVsZHNcIikgXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KG4pO1xuICAgICAgICAgICAgICAgIGNjICYmIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb25zdHJhaW50RWRpdG9yLm9wZW4oY2MsIG4pXG4gICAgICAgICAgICAgICAgfSwgc2VsZi5lZGl0b3IuYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICAgICAgfSwgc2VsZi5lZGl0b3IuYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgICAgICB0aGlzLmVkaXRvci51cGRhdGUodGhpcy5jdXJyTm9kZSk7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICBcbiAgICB9XG59XG5cbmV4cG9ydCB7IERpYWxvZyB9IDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2RpYWxvZy5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHsgZDNqc29uUHJvbWlzZSwgaW5pdE9wdGlvbkxpc3QgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGdldFN1YmNsYXNzZXMgfSBmcm9tICcuL21vZGVsLmpzJztcblxuY2xhc3MgQ29uc3RyYWludEVkaXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvciAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5hZnRlclNhdmUgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICAvLyBPcGVucyB0aGUgY29uc3RyYWludCBlZGl0b3IgZm9yIGNvbnN0cmFpbnQgYyBvZiBub2RlIG4uXG4gICAgLy9cbiAgICBvcGVuKGMsIG4pIHtcblxuICAgICAgICAvLyBOb3RlIGlmIHRoaXMgaXMgaGFwcGVuaW5nIGF0IHRoZSByb290IG5vZGVcbiAgICAgICAgbGV0IGlzcm9vdCA9ICEgbi5wYXJlbnQ7XG4gICAgIFxuICAgICAgICAvLyBGaW5kIHRoZSBkaXYgZm9yIGNvbnN0cmFpbnQgYyBpbiB0aGUgZGlhbG9nIGxpc3RpbmcuIFdlIHdpbGxcbiAgICAgICAgLy8gb3BlbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb24gdG9wIG9mIGl0LlxuICAgICAgICBsZXQgY2RpdjtcbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiI2RpYWxvZyAuY29uc3RyYWludFwiKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oY2MpeyBpZihjYyA9PT0gYykgY2RpdiA9IHRoaXM7IH0pO1xuICAgICAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGNvbnN0cmFpbnQncyBjb250YWluZXIgZGl2XG4gICAgICAgIGxldCBjYmIgPSBjZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGFwcCdzIG1haW4gYm9keSBlbGVtZW50XG4gICAgICAgIGxldCBkYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBjb25zdHJhaW50IGVkaXRvciBvdmVyIHRoZSBjb25zdHJhaW50IGluIHRoZSBkaWFsb2dcbiAgICAgICAgbGV0IGNlZCA9IGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGMuY3R5cGUpXG4gICAgICAgICAgICAuY2xhc3NlZChcIm9wZW5cIiwgdHJ1ZSlcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCBjLnN1bW1hcnlMaXN0KVxuICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIChjYmIudG9wIC0gZGJiLnRvcCkrXCJweFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoY2JiLmxlZnQgLSBkYmIubGVmdCkrXCJweFwiKVxuICAgICAgICAgICAgO1xuXG4gICAgICAgIC8vIEluaXQgdGhlIGNvbnN0cmFpbnQgY29kZSBcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKVxuICAgICAgICAgICAgLnRleHQoYy5jb2RlKTtcblxuICAgICAgICB0aGlzLmluaXRJbnB1dHMobiwgYyk7XG5cbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyBXaGVuIHVzZXIgc2VsZWN0cyBhbiBvcGVyYXRvciwgYWRkIGEgY2xhc3MgdG8gdGhlIGMuZS4ncyBjb250YWluZXJcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wID0gT1BJTkRFWFt0aGlzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRJbnB1dHMobiwgYywgb3AuY3R5cGUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLmNhbmNlbChuLCBjKSB9KTtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnNhdmVcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5zYXZlRWRpdHMobiwgYykgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zeW5jXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpLnRoZW4oKCkgPT4gdGhpcy5pbml0SW5wdXRzKG4sIGMpKSB9KTtcblxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemVzIHRoZSBpbnB1dCBlbGVtZW50cyBpbiB0aGUgY29uc3RyYWludCBlZGl0b3IgZnJvbSB0aGUgZ2l2ZW4gY29uc3RyYWludC5cbiAgICAvL1xuICAgIGluaXRJbnB1dHMgKG4sIGMsIGN0eXBlKSB7XG5cbiAgICAgICAgLy8gUG9wdWxhdGUgdGhlIG9wZXJhdG9yIHNlbGVjdCBsaXN0IHdpdGggb3BzIGFwcHJvcHJpYXRlIGZvciB0aGUgcGF0aFxuICAgICAgICAvLyBhdCB0aGlzIG5vZGUuXG4gICAgICAgIGlmICghY3R5cGUpIFxuICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwib3BcIl0nLCBcbiAgICAgICAgICAgIE9QUy5maWx0ZXIoZnVuY3Rpb24ob3ApeyByZXR1cm4gbi5vcFZhbGlkKG9wKTsgfSksXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQub3AsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLm9wLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6Yy5vcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vXG4gICAgICAgIGN0eXBlID0gY3R5cGUgfHwgYy5jdHlwZTtcblxuICAgICAgICBsZXQgY2UgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKTtcbiAgICAgICAgbGV0IHNtemQgPSBjZS5jbGFzc2VkKFwic3VtbWFyaXplZFwiKTtcbiAgICAgICAgY2UuYXR0cihcImNsYXNzXCIsIFwib3BlbiBcIiArIGN0eXBlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsICBzbXpkKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJiaW9lbnRpdHlcIiwgIG4uaXNCaW9FbnRpdHkpO1xuICAgICBcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKGN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIGlucHV0W25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlID0gYy52YWx1ZTtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgW1wiQW55XCJdLmNvbmNhdChuLnRlbXBsYXRlLm1vZGVsLm1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgICAgICB7IHNlbGVjdGVkOiBjLmV4dHJhVmFsdWUgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIG9wdGlvbiBsaXN0IG9mIHN1YmNsYXNzIG5hbWVzXG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIG4ucGFyZW50ID8gZ2V0U3ViY2xhc3NlcyhuLnBjb21wLmtpbmQgPyBuLnBjb21wLnR5cGUgOiBuLnBjb21wKSA6IFtdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBkID0+IGQubmFtZSxcbiAgICAgICAgICAgICAgICB0aXRsZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBmdW5jdGlvbihkKXsgXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG9uZSB3aG9zZSBuYW1lIG1hdGNoZXMgdGhlIG5vZGUncyB0eXBlIGFuZCBzZXQgaXRzIHNlbGVjdGVkIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIG4udGVtcGxhdGUubW9kZWwubWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIG4ubGlzdFZhbGlkKGwpOyB9KSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBsaXN0cylcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBjLnN1bW1hcnlMaXN0IHx8IGMudmFsdWVzIHx8IFtjLnZhbHVlXSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBsaXN0XCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWVzIHx8IFtjLnZhbHVlXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgfHwgW2MudmFsdWVdLFxuICAgICAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyByZXN1bHRzXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiVW5yZWNvZ25pemVkIGN0eXBlOiBcIiArIGN0eXBlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIC8qXG4gICAgLy9cbiAgICB1cGRhdGVDRWlucHV0cyAoYywgb3ApIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWUgPSBvcCB8fCBjLm9wO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpLnRleHQoYy5jb2RlKTtcblxuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylbMF1bMF0udmFsdWUgPSBkZWVwYyhjLnZhbHVlcyk7XG4gICAgfVxuICAgICovXG5cblxuICAgIC8vIEdlbmVyYXRlcyBhbiBvcHRpb24gbGlzdCBvZiBkaXN0aW5jdCB2YWx1ZXMgdG8gc2VsZWN0IGZyb20uXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbiAgICAvLyAgIGMgIChjb25zdHJhaW50KSBUaGUgY29uc3RyYWludCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBmb3IuXG4gICAgLy8gTkI6IE9ubHkgdmFsdWUgYW5kIG11bHRpdmF1ZSBjb25zdHJhaW50cyBjYW4gYmUgc3VtbWFyaXplZCBpbiB0aGlzIHdheS4gIFxuICAgIGdlbmVyYXRlT3B0aW9uTGlzdCAobiwgYykge1xuICAgICAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgICAgICAvLyBzdW1tYXJ5UGF0aCwgd2hpY2ggaXMgdGhlIHBhdGggd2Ugd2FudCBkaXN0aW5jdCB2YWx1ZXMgZm9yLiBcbiAgICAgICAgLy8gQlVUIE5PVEUsIHdlIGhhdmUgdG8gcnVuIHRoZSBxdWVyeSAqd2l0aG91dCogY29uc3RyYWludCBjISFcbiAgICAgICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAgICAgLy8gYW5kIHdlIHdhbnQgdG8gY2hhbmdlIGl0IHRvIFNwb250YW5lb3VzLiBXZSBvcGVuIHRoZSBjLmUuLCBhbmQgdGhlbiBjbGljayB0aGVcbiAgICAgICAgLy8gc3luYyBidXR0b24gdG8gZ2V0IGEgbGlzdC4gSWYgd2UgcnVuIHRoZSBxdWVyeSB3aXRoIGMgaW50YWN0LCB3ZSdsbCBnZXQgYSBsaXN0XG4gICAgICAgIC8vIGNvbnRhaW5pbmcgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAgICAgLy8gQU5PVEhFUiBOT1RFOiB0aGUgcGF0aCBpbiBzdW1tYXJ5UGF0aCBtdXN0IGJlIHBhcnQgb2YgdGhlIHF1ZXJ5IHByb3Blci4gVGhlIGFwcHJvYWNoXG4gICAgICAgIC8vIGhlcmUgaXMgdG8gZW5zdXJlIGl0IGJ5IGFkZGluZyB0aGUgcGF0aCB0byB0aGUgdmlldyBsaXN0LlxuXG4gICAgICAgIC8qXG4gICAgICAgIC8vIFNhdmUgdGhpcyBjaG9pY2UgaW4gbG9jYWxTdG9yYWdlXG4gICAgICAgIGxldCBhdHRyID0gKG4ucGFyZW50LnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnBhcmVudC5wdHlwZSkubmFtZSArIFwiLlwiICsgbi5wY29tcC5uYW1lO1xuICAgICAgICBsZXQga2V5ID0gXCJhdXRvY29tcGxldGVcIjtcbiAgICAgICAgbGV0IGxzdDtcbiAgICAgICAgbHN0ID0gZ2V0TG9jYWwoa2V5LCB0cnVlLCBbXSk7XG4gICAgICAgIGlmKGxzdC5pbmRleE9mKGF0dHIpID09PSAtMSkgbHN0LnB1c2goYXR0cik7XG4gICAgICAgIHNldExvY2FsKGtleSwgbHN0LCB0cnVlKTtcbiAgICAgICAgKi9cblxuICAgICAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICAgICAgbGV0IHAgPSBuLnBhdGg7IC8vIHdoYXQgd2Ugd2FudCB0byBzdW1tYXJpemVcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGxleCA9IG4udGVtcGxhdGUuY29uc3RyYWludExvZ2ljOyAvLyBzYXZlIGNvbnN0cmFpbnQgbG9naWMgZXhwclxuICAgICAgICBuLnJlbW92ZUNvbnN0cmFpbnQoYyk7IC8vIHRlbXBvcmFyaWx5IHJlbW92ZSB0aGUgY29uc3RyYWludFxuICAgICAgICBuLnRlbXBsYXRlLnNlbGVjdC5wdXNoKHApOyAvLyAvLyBtYWtlIHN1cmUgcCBpcyBwYXJ0IG9mIHRoZSBxdWVyeVxuICAgICAgICAvLyBnZXQgdGhlIHhtbFxuICAgICAgICBsZXQgeCA9IG4udGVtcGxhdGUuZ2V0WG1sKHRydWUpO1xuICAgICAgICAvLyByZXN0b3JlIHRoZSB0ZW1wbGF0ZVxuICAgICAgICBuLnRlbXBsYXRlLnNlbGVjdC5wb3AoKTtcbiAgICAgICAgbi50ZW1wbGF0ZS5jb25zdHJhaW50TG9naWMgPSBsZXg7IC8vIHJlc3RvcmUgdGhlIGxvZ2ljIGV4cHJcbiAgICAgICAgbi5hZGRDb25zdHJhaW50KGMpOyAvLyByZS1hZGQgdGhlIGNvbnN0cmFpbnRcblxuICAgICAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgICAgIGxldCBlID0gZW5jb2RlVVJJQ29tcG9uZW50KHgpO1xuICAgICAgICBsZXQgdXJsID0gYCR7bi50ZW1wbGF0ZS5tb2RlbC5taW5lLnVybH0vc2VydmljZS9xdWVyeS9yZXN1bHRzP3N1bW1hcnlQYXRoPSR7cH0mZm9ybWF0PWpzb25yb3dzJnF1ZXJ5PSR7ZX1gXG4gICAgICAgIGxldCB0aHJlc2hvbGQgPSAyNTA7XG5cbiAgICAgICAgLy8gY3ZhbHMgY29udGFpbnRzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUocylcbiAgICAgICAgbGV0IGN2YWxzID0gW107XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICAgICAgY3ZhbHMgPSBjLnZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgIGN2YWxzID0gWyBjLnZhbHVlIF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzaWduYWwgdGhhdCB3ZSdyZSBzdGFydGluZ1xuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCB0cnVlKTtcbiAgICAgICAgLy8gZ28hXG4gICAgICAgIGxldCBwcm9tID0gZDNqc29uUHJvbWlzZSh1cmwpLnRoZW4oZnVuY3Rpb24oanNvbil7XG4gICAgICAgICAgICAvLyBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgaW4ganNvbi5yZXVsdHMuXG4gICAgICAgICAgICAvLyBFYWNoIGxpc3QgaXRlbSBsb29rcyBsaWtlOiB7IGl0ZW06IFwic29tZXN0cmluZ1wiLCBjb3VudDogMTcgfVxuICAgICAgICAgICAgLy8gKFllcywgd2UgZ2V0IGNvdW50cyBmb3IgZnJlZSEgT3VnaHQgdG8gbWFrZSB1c2Ugb2YgdGhpcy4pXG4gICAgICAgICAgICBsZXQgcmVzID0ganNvbi5yZXN1bHRzLm1hcChyID0+IHIuaXRlbSkuc29ydCgpO1xuICAgICAgICAgICAgLy8gY2hlY2sgc2l6ZSBvZiByZXN1bHRcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgLy8gdG9vIGJpZy4gYXNrIHVzZXIgd2hhdCB0byBkby5cbiAgICAgICAgICAgICAgICBsZXQgYW5zID0gcHJvbXB0KGBUaGVyZSBhcmUgJHtyZXMubGVuZ3RofSByZXN1bHRzLCB3aGljaCBleGNlZWRzIHRoZSB0aHJlc2hvbGQgb2YgJHt0aHJlc2hvbGR9LiBIb3cgbWFueSBkbyB5b3Ugd2FudCB0byBzaG93P2AsIHRocmVzaG9sZCk7XG4gICAgICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB1c2VyIHNleiBjYW5jZWxcbiAgICAgICAgICAgICAgICAgICAgLy8gU2lnbmFsIHRoYXQgd2UncmUgZG9uZS5cbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFucyA9IHBhcnNlSW50KGFucyk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGFucykgfHwgYW5zIDw9IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyB1c2VyIHdhbnRzIHRoaXMgbWFueSByZXN1bHRzXG4gICAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGFucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCA9IHJlcztcblxuICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCB0cnVlKTtcblxuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QsIFxuICAgICAgICAgICAgICAgICAgICB7IHNlbGVjdGVkOiBkID0+IGN2YWxzLmluZGV4T2YoZCkgIT09IC0xIHx8IG51bGwgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9tOyAvLyBzbyBjYWxsZXIgY2FuIGNoYWluXG4gICAgfVxuICAgIC8vXG4gICAgY2FuY2VsIChuLCBjKSB7XG4gICAgICAgIGlmICghIGMuc2F2ZWQpIHtcbiAgICAgICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgIHRoaXMuYWZ0ZXJTYXZlKG4pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgICBoaWRlKCkge1xuICAgICAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKS5jbGFzc2VkKFwib3BlblwiLCBudWxsKTtcbiAgICB9XG4gICAgLy9cbiAgICBzYXZlRWRpdHMobiwgYykge1xuICAgICAgICAvL1xuICAgICAgICBsZXQgbyA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlO1xuICAgICAgICBjLnNldE9wKG8pO1xuICAgICAgICBjLnNhdmVkID0gdHJ1ZTtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IHZhbCA9IGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZVwiXScpWzBdWzBdLnZhbHVlO1xuICAgICAgICBsZXQgdmFscyA9IFtdO1xuICAgICAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVzXCJdJylcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkgdmFscy5wdXNoKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHogPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJykuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG5cbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibnVsbFwiKXtcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICBjLnR5cGUgPSB2YWxzWzBdXG4gICAgICAgICAgICBjLnZhbHVlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBuLnNldFN1YmNsYXNzQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgIGlmKHJlbW92ZWQubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBhbGVydChcIkNvbnN0cmFpbmluZyB0byBzdWJjbGFzcyBcIiArIChjLnR5cGUgfHwgbi5wdHlwZS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICArIFwiIGNhdXNlZCB0aGUgZm9sbG93aW5nIHBhdGhzIHRvIGJlIHJlbW92ZWQ6IFwiIFxuICAgICAgICAgICAgICAgICAgICArIHJlbW92ZWQubWFwKG4gPT4gbi5wYXRoKS5qb2luKFwiLCBcIikpOyBcbiAgICAgICAgICAgICAgICB9LCAyNTApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWUgPSB2YWw7XG4gICAgICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgICAgICBjLmV4dHJhVmFsdWUgPSB2YWxzWzBdID09PSBcIkFueVwiID8gbnVsbCA6IHZhbHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJsaXN0XCIpIHtcbiAgICAgICAgICAgIGMudmFsdWUgPSB2YWxzWzBdO1xuICAgICAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgYy52YWx1ZSA9IHogPyB2YWxzWzBdIDogdmFsO1xuICAgICAgICAgICAgYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJVbmtub3duIGN0eXBlOiBcIitjLmN0eXBlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLmFmdGVyU2F2ZSAmJiB0aGlzLmFmdGVyU2F2ZShuKTtcbiAgICB9XG5cbn0gLy8gY2xhc3MgQ29uc3RyYWludEVkaXRvclxuXG5leHBvcnQgeyBDb25zdHJhaW50RWRpdG9yIH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9jb25zdHJhaW50RWRpdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9