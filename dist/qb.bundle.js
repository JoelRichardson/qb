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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return esc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return d3jsonPromise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return selectText; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return deepc; });
/* unused harmony export getLocal */
/* unused harmony export setLocal */
/* unused harmony export testLocal */
/* unused harmony export clearLocal */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return parsePathQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return obj2array; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return initOptionList; });

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
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
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
    var ks = Object.keys(o);
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

    var ident = (x=>x);
    var opts;
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
var NUMERICTYPES= [
    "int", "java.lang.Integer",
    "short", "java.lang.Short",
    "long", "java.lang.Long",
    "float", "java.lang.Float",
    "double", "java.lang.Double",
    "java.math.BigDecimal",
    "java.util.Date"
];

// all the base types that can have null values
var NULLABLETYPES= [
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
var LEAFTYPES= [
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
    "Object"
]


var OPS = [

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
var OPINDEX = OPS.reduce(function(x,o){
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return getSubclasses; });
/* unused harmony export getSuperclasses */
/* unused harmony export isSubclass */
/* unused harmony export Node */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Template; });
/* unused harmony export Constraint */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parser_js__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parser_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__parser_js__);




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
        this.classes = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(cfg.classes);

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
        this.allClasses = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(this.classes)
        var cns = Object.keys(this.classes);
        cns.sort()
        cns.forEach(function(cn){
            var cls = model.classes[cn];
            cls.allAttributes = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(cls.attributes)
            cls.allReferences = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(cls.references)
            cls.allCollections = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(cls.collections)
            cls.allAttributes.forEach(function(x){ x.kind = "attribute"; });
            cls.allReferences.forEach(function(x){ x.kind = "reference"; });
            cls.allCollections.forEach(function(x){ x.kind = "collection"; });
            cls.allParts = cls.allAttributes.concat(cls.allReferences).concat(cls.allCollections);
            cls.allParts.sort(function(a,b){ return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
            model.allClasses.push(cls);
            //
            cls["extends"] = cls["extends"].map(function(e){
                var bc = model.classes[e];
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
                r.type = model.classes[r.referencedType]
            });
            //
            Object.keys(cls.collections).forEach(function(cn){
                var c = cls.collections[cn];
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
    var anc = cls["extends"].map(function(sc){ return getSuperclasses(sc); });
    var all = cls["extends"].concat(anc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(ans);
}

// Returns a list of all the subclasses of the given class.
// (The returned list does *not* contain cls.)
// Args:
//    cls (object)  A class from a compiled model
// Returns:
//    list of class objects, sorted by class name
function getSubclasses(cls){
    if (typeof(cls) === "string" || !cls.extendedBy || cls.extendedBy.length == 0) return [];
    var desc = cls.extendedBy.map(function(sc){ return getSubclasses(sc); });
    var all = cls.extendedBy.concat(desc.reduce(function(acc, elt){ return acc.concat(elt); }, []));
    var ans = all.reduce(function(acc,elt){ acc[elt.name] = elt; return acc; }, {});
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(ans);
}

// Returns true iff sub is a subclass of sup.
function isSubclass(sub,sup) {
    if (sub === sup) return true;
    if (typeof(sub) === "string" || !sub["extends"] || sub["extends"].length == 0) return false;
    var r = sub["extends"].filter(function(x){ return x===sup || isSubclass(x, sup); });
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
        var nt = this.subtypeConstraint || this.ptype;
        if (typeof(nt) === "string" ) return false;
        var lt = this.template.model.classes[list.type];
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
            if (cls.name === "BioEntity") return true;
            for (let i = 0; i < cls.extends; i++) {
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
        this.select = t.select ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.select) : [];
        this.where = t.where ? t.where.map( c => {
            let cc = new Constraint(c) ;
            cc.node = null;
            return cc;
        }) : [];
        this.constraintLogic = t.constraintLogic || "";
        this.joins = t.joins ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.joins) : [];
        this.tags = t.tags ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.tags) : [];
        this.orderBy = t.orderBy ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.orderBy) : [];
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
                 var n = t.addPath(c.path);
                 var cls = self.model.classes[c.type];
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
            tags: Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(tmplt.tags),
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
        for(var i= "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++){
            var c = String.fromCharCode(i);
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
        var ast; // abstract syntax tree
        var seen = [];
        var tmplt = this;
        function reach(n,lev){
            if (typeof(n) === "string" ){
                // check that n is a constraint code in the template. 
                // If not, remove it from the expr.
                // Also remove it if it's the code for a subclass constraint
                seen.push(n);
                return (n in tmplt.code2c && tmplt.code2c[n].ctype !== "subclass") ? n : "";
            }
            var cms = n.children.map(function(c){return reach(c, lev+1);}).filter(function(x){return x;});;
            var cmss = cms.join(" "+n.op+" ");
            return cms.length === 0 ? "" : lev === 0 || cms.length === 1 ? cmss : "(" + cmss + ")"
        }
        try {
            ast = ex ? __WEBPACK_IMPORTED_MODULE_2__parser_js___default.a.parse(ex) : null;
        }
        catch (err) {
            alert(err);
            return this.constraintLogic;
        }
        //
        var lex = ast ? reach(ast,0) : "";
        // if any constraint codes in the template were not seen in the expression,
        // AND them into the expression (except ISA constraints).
        var toAdd = Object.keys(this.code2c).filter(function(c){
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
        var so = (t.orderBy || []).reduce(function(s,x){ 
            var k = Object.keys(x)[0];
            var v = x[k]
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
      longDescription="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(t.description || '')}"
      sortOrder="${so || ''}"
      ${t.constraintLogic && 'constraintLogic="'+t.constraintLogic+'"' || ''}
    >
      ${(t.joins || []).map(oj2xml).join(" ")}
      ${(t.where || []).map(c => c.c2xml(qonly)).join(" ")}
    </query>`;
        // the whole template
        var tmplt = 
    `<template
      name="${t.name || ''}"
      title="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(t.title || '')}"
      comment="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(t.comment || '')}">
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
        this.ctype = this.op && __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][this.op].ctype || null;
        // used by all except subclass constraints
        this.code = this.ctype !== "subclass" && c.code || null;
        // used by value, list
        this.value = c.value || "";
        // used by LOOKUP on BioEntity and subclasses
        this.extraValue = this.ctype === "lookup" && c.extraValue || null;
        // used by multivalue and range constraints
        this.values = c.values && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(c.values) || null;
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
            g = `path="${this.path}" op="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(this.op)}" value="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(this.value)}" code="${this.code}" ${e}`;
        else if (this.ctype === "lookup"){
            let ev = (this.extraValue && this.extraValue !== "Any") ? `extraValue="${this.extraValue}"` : "";
            g = `path="${this.path}" op="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(this.op)}" value="${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(this.value)}" ${ev} code="${this.code}" ${e}`;
        }
        else if (this.ctype === "multivalue"){
            g = `path="${this.path}" op="${this.op}" code="${this.code}" ${e}`;
            h = this.values.map( v => `<value>${Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["c" /* esc */])(v)}</value>` ).join('');
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
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__undoManager_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__registry_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__editViews_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__constraintEditor_js__ = __webpack_require__(9);

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









let VERSION = "0.1.0";

let currMine;
let currTemplate;
let currNode;

let name2mine;
let m;
let w;
let h;
let i;
let root;
let diagonal;
let vis;
let nodes;
let links;
let dragBehavior = null;
let animationDuration = 250; // ms
let defaultColors = { header: { main: "#595455", text: "#fff" } };
let defaultLogo = "https://cdn.rawgit.com/intermine/design-materials/78a13db5/logos/intermine/squareish/45x45.png";
let undoMgr = new __WEBPACK_IMPORTED_MODULE_3__undoManager_js__["a" /* default */]();
// Starting edit view is the main query view.
let editView = __WEBPACK_IMPORTED_MODULE_6__editViews_js__["a" /* editViews */].queryMain;
//
let constraintEditor = 
    new __WEBPACK_IMPORTED_MODULE_7__constraintEditor_js__["a" /* ConstraintEditor */](n => {
        showDialog(n, null, true);
        saveState(n);
        update(n);
    });

// Setup function
function setup(){
    m = [20, 120, 20, 120]
    w = 1280 - m[1] - m[3]
    h = 800 - m[0] - m[2]
    i = 0

    //
    d3.select('#footer [name="version"]')
        .text(`QB v${VERSION}`);

    // thanks to: https://stackoverflow.com/questions/15007877/how-to-use-the-d3-diagonal-function-to-draw-curved-lines
    diagonal = d3.svg.diagonal()
        .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })     
        .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
        .projection(function(d) { return [d.y, d.x]; });
    
    // create the SVG container
    vis = d3.select("#svgContainer svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .on("click", hideDialog)
      .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    //
    d3.select('.button[name="openclose"]')
        .on("click", function(){ 
            let t = d3.select("#tInfoBar");
            let wasClosed = t.classed("closed");
            let isClosed = !wasClosed;
            let d = d3.select('#drawer')[0][0]
            if (isClosed)
                // save the current height just before closing
                d.__saved_height = d.getBoundingClientRect().height;
            else if (d.__saved_height)
               // on open, restore the saved height
               d3.select('#drawer').style("height", d.__saved_height);
                
            t.classed("closed", isClosed);
            d3.select(this).classed("closed", isClosed);
        });

    Object(__WEBPACK_IMPORTED_MODULE_5__registry_js__["a" /* initRegistry */])(initMines);

    d3.selectAll("#ttext label span")
        .on('click', function(){
            d3.select('#ttext').attr('class', 'flexcolumn '+this.innerText.toLowerCase());
            updateTtext(currTemplate);
        });
    d3.select('#runatmine')
        .on('click', () => runatmine(currTemplate));
    d3.select('#querycount .button.sync')
        .on('click', function(){
            let t = d3.select(this);
            let turnSyncOff = t.text() === "sync";
            t.text( turnSyncOff ? "sync_disabled" : "sync" )
             .attr("title", () =>
                 `Count autosync is ${ turnSyncOff ? "OFF" : "ON" }. Click to turn it ${ turnSyncOff ? "ON" : "OFF" }.`);
            !turnSyncOff && updateCount(currTemplate);
        d3.select('#querycount').classed("syncoff", turnSyncOff);
        });
    d3.select("#xmltextarea")
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* selectText */])("xmltextarea")});
    d3.select("#jsontextarea")
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* selectText */])("jsontextarea")});

  //
  dragBehavior = d3.behavior.drag()
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
      ll.attr("d", diagonal);
      })
    .on("dragend", function () {
      // on dragend, resort the draggable nodes according to their Y position
      let nodes = d3.selectAll(editView.draggable).data()
      nodes.sort( (a, b) => a.y - b.y );
      // the node that was dragged
      let dragged = d3.select(this).data()[0];
      // callback for specific drag-end behavior
      editView.afterDrag && editView.afterDrag(nodes, dragged);
      //
      saveState(dragged);
      update();
      //
      d3.event.sourceEvent.preventDefault();
      d3.event.sourceEvent.stopPropagation();
  });
}

function initMines(j_mines) {
    var mines = j_mines.instances;
    name2mine = {};
    mines.forEach(function(m){ name2mine[m.name] = m; });
    currMine = mines[0];
    currTemplate = null;

    var ml = d3.select("#mlist").selectAll("option").data(mines);
    var selectMine = "MouseMine";
    ml.enter().append("option")
        .attr("value", function(d){return d.name;})
        .attr("disabled", function(d){
            var w = window.location.href.startsWith("https");
            var m = d.url.startsWith("https");
            var v = (w && !m) || null;
            return v;
        })
        .attr("selected", function(d){ return d.name===selectMine || null; })
        .text(function(d){ return d.name; });
    //
    // when a mine is selected from the list
    d3.select("#mlist")
        .on("change", function(){ selectedMine(this.value); });
    //
    var dg = d3.select("#dialog");
    dg.classed("hidden",true)
    dg.select(".button.close").on("click", hideDialog);
    dg.select(".button.remove").on("click", () => removeNode(currNode));

    // 
    //
    d3.select("#editView select")
        .on("change", function () { setEditView(this.value); })
        ;

    // Wire up select button in dialog
    d3.select('#dialog [name="select-ctrl"] .swatch')
        .on("click", function() {
            currNode.isSelected ? currNode.unselect() : currNode.select();
            d3.select('#dialog [name="select-ctrl"]')
                .classed("selected", currNode.isSelected);
            saveState(currNode);
            update(currNode);
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
            currNode.setSort(newsort);
            saveState(currNode);
            update(currNode);
        });

    // start with the first mine by default.
    selectedMine(selectMine);
}
//
function clearState() {
    undoMgr.clear();
}
function saveState(n) {
    let s = JSON.stringify(n.template.uncompileTemplate());
    if (!undoMgr.hasState || undoMgr.currentState !== s)
        // only save state if it has changed
        undoMgr.add(s);
}
function undo() { undoredo("undo") }
function redo() { undoredo("redo") }
function undoredo(which){
    try {
        let s = JSON.parse(undoMgr[which]());
        editTemplate(s, true);
    }
    catch (err) {
        console.log(err);
    }
}

// Called when user selects a mine from the option list
// Loads that mine's data model and all its templates.
// Then initializes display to show the first termplate's query.
function selectedMine(mname){
    if(!name2mine[mname]) throw "No mine named: " + mname;
    let cm = currMine = name2mine[mname];
    clearState();
    let url = cm.url;
    let turl, murl, lurl, burl, surl, ourl;
    cm.tnames = []
    cm.templates = []
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
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(murl),
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(turl),
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(lurl),
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(burl),
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(surl),
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(ourl)
    ]).then( function(data) {
        var j_model = data[0];
        var j_templates = data[1];
        var j_lists = data[2];
        var j_branding = data[3];
        var j_summary = data[4];
        var j_organisms = data[5];
        //
        cm.model = new __WEBPACK_IMPORTED_MODULE_4__model_js__["a" /* Model */](j_model.model, cm)
        cm.templates = j_templates.templates;
        cm.lists = j_lists.lists;
        cm.summaryFields = j_summary.classes;
        cm.organismList = j_organisms.results.map(o => o.shortName);
        //
        cm.tlist = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* obj2array */])(cm.templates)
        cm.tlist.sort(function(a,b){ 
            return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
        });
        cm.tnames = Object.keys( cm.templates );
        cm.tnames.sort();
        // Fill in the selection list of templates for this mine.
        var tl = d3.select("#tlist select")
            .selectAll('option')
            .data( cm.tlist );
        tl.enter().append('option')
        tl.exit().remove()
        tl.attr("value", function(d){ return d.name; })
          .text(function(d){return d.title;});
        d3.selectAll('[name="editTarget"] [name="in"]')
            .on("change", startEdit);
        editTemplate(cm.templates[cm.tlist[0].name]);
        // Apply branding
        let clrs = cm.colors || defaultColors;
        let bgc = clrs.header ? clrs.header.main : clrs.main.fg;
        let txc = clrs.header ? clrs.header.text : clrs.main.bg;
        let logo = cm.images.logo || defaultLogo;
        d3.select("#tooltray")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#tInfoBar")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#mineLogo")
            .attr("src", logo);
        d3.selectAll('#svgContainer [name="minename"]')
            .text(cm.name);
        // populate class list 
        let clist = Object.keys(cm.model.classes).filter(cn => ! cm.model.classes[cn].isLeafType);
        clist.sort();
        Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])("#newqclist select", clist);
        d3.select('#editSourceSelector [name="in"]')
            .call(function(){ this[0][0].selectedIndex = 1; })
            .on("change", function(){ selectedEditSource(this.value); startEdit(); });
        d3.select("#xmltextarea")[0][0].value = "";
        d3.select("#jsontextarea").value = "";
        selectedEditSource( "tlist" );

    }, function(error){
        alert(`Could not access ${cm.name}. Status=${error.status}. Error=${error.statusText}. (If there is no error message, then its probably a CORS issue.)`);
    });
}

// Begins an edit, based on user controls.
function startEdit() {
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
        editTemplate(currMine.templates[val]);
    }
    else if (inputId === "newqclist") {
        // a new query from a selected starting class
        let nt = new __WEBPACK_IMPORTED_MODULE_4__model_js__["b" /* Template */]();
        nt.select.push(val+".id");
        editTemplate(nt);
    }
    else if (inputId === "importxml") {
        // import xml query
        val && editTemplate(Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* parsePathQuery */])(val));
    }
    else if (inputId === "importjson") {
        // import json query
        val && editTemplate(JSON.parse(val));
    }
    else
        throw "Unknown edit source."
}

// 
function selectedEditSource(show){
    d3.selectAll('[name="editTarget"] > div.option')
        .style("display", function(){ return this.id === show ? null : "none"; });
}

// Removes the current node and all its descendants.
//
function removeNode(n) {
    n.remove();
    hideDialog();
    saveState(n);
    update(n.parent || n);
}

// Called when the user selects a template from the list.
// Gets the template from the current mine and builds a set of nodes
// for d3 tree display.
//
function editTemplate (t, nosave) {
    // Make sure the editor works on a copy of the template.
    //
    let ct = currTemplate = new __WEBPACK_IMPORTED_MODULE_4__model_js__["b" /* Template */](t, currMine.model);
    //
    root = ct.qtree
    root.x0 = 0;
    root.y0 = h / 2;
    //
    ct.setLogicExpression();

    if (! nosave) saveState(ct.qtree);

    // Fill in the basic template information (name, title, description, etc.)
    //
    var ti = d3.select("#tInfo");
    var xfer = function(name, elt){ ct[name] = elt.value; updateTtext(ct); };
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
    hideDialog();
    update(root);
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
function selectedNext(currNode, mode, p){
    let n;
    let cc;
    let sfs;
    let ct = currNode.template;
    if (mode === "summaryfields") {
        sfs = currMine.summaryFields[currNode.nodeType.name]||[];
        sfs.forEach(function(sf, i){
            sf = sf.replace(/^[^.]+/, currNode.path);
            let m = ct.addPath(sf);
            if (! m.isSelected) {
                m.select();
            }
        });
    }
    else {
        p = currNode.path + "." + p;
        n = ct.addPath(p);
        if (mode === "selected")
            !n.isSelected && n.select();
        if (mode === "constrained") {
            cc = n.addConstraint()
        }
    }
    hideDialog();
    if (mode !== "open")
        saveState(currNode);
    if (mode !== "summaryfields") 
        setTimeout(function(){
            showDialog(n);
            cc && setTimeout(function(){
                constraintEditor.open(cc, n)
            }, animationDuration);
        }, animationDuration);
    update(currNode);
    
}
// Returns  the DOM element corresponding to the given data object.
//
function findDomByDataObj(d){
    var x = d3.selectAll(".nodegroup .node").filter(function(dd){ return dd === d; });
    return x[0][0];
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
  constraintEditor.hide();
 
  // Set the global currNode
  currNode = n;
  var isroot = ! currNode.parent;
  // Make node the data obj for the dialog
  var dialog = d3.select("#dialog").datum(n);
  // Calculate dialog's position
  var dbb = dialog[0][0].getBoundingClientRect();
  var ebb = elt.getBoundingClientRect();
  var bbb = d3.select("#qb")[0][0].getBoundingClientRect();
  var t = (ebb.top - bbb.top) + ebb.width/2;
  var b = (bbb.bottom - ebb.bottom) + ebb.width/2;
  var l = (ebb.left - bbb.left) + ebb.height/2;
  var dir = "d" ; // "d" or "u"
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
  // Type at this node
  var tp = n.ptype.name || n.ptype;
  var stp = (n.subclassConstraint && n.subclassConstraint.name) || null;
  var tstring = stp && `<span style="color: purple;">${stp}</span> (${tp})` || tp
  dialog.select('[name="header"] [name="type"] div')
      .html(tstring);

  // Wire up add constraint button
  dialog.select("#dialog .constraintSection .add-button")
        .on("click", function(){
            let c = n.addConstraint();
            saveState(n);
            update(n);
            showDialog(n, null, true);
            constraintEditor.open(c, n);
        });

  // Fill out the constraints section. First, select all constraints.
  var constrs = dialog.select(".constraintSection")
      .selectAll(".constraint")
      .data(n.constraints);
  // Enter(): create divs for each constraint to be displayed  (TODO: use an HTML5 template instead)
  // 1. container
  var cdivs = constrs.enter().append("div").attr("class","constraint") ;
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
          constraintEditor.open(c, n);
      });
  constrs.select("i.cancel")
      .on("click", function(c){ 
          n.removeConstraint(c);
          saveState(n);
          update(n);
          showDialog(n, null, true);
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
          .on("click", () => selectedNext(currNode, "summaryfields"));

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
                  name: '<i class="material-icons" title="Select this attribute">play_arrow</i>',
                  cls: 'selectsimple',
                  click: function (){selectedNext(currNode, "selected", comp.name); }
                  },{
                  name: '<i class="material-icons" title="Constrain this attribute">play_arrow</i>',
                  cls: 'constrainsimple',
                  click: function (){selectedNext(currNode, "constrained", comp.name); }
                  }];
              }
              else {
              return [{
                  name: comp.name,
                  cls: ''
                  },{
                  name: `<i class="material-icons" title="Follow this ${comp.kind}">play_arrow</i>`,
                  cls: 'opennext',
                  click: function (){selectedNext(currNode, "open", comp.name); }
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

// Set the editing view. View is one of:
// Args:
//     view (string) One of: queryMain, constraintLogic, columnOrder, sortOrder
// Returns:
//     Nothing
// Side effects:
//     Changes the layout and updates the view.
function setEditView(view){
    let v = __WEBPACK_IMPORTED_MODULE_6__editViews_js__["a" /* editViews */][view];
    if (!v) throw "Unrecognized view type: " + view;
    editView = v;
    d3.select("#svgContainer").attr("class", v.name);
    update(root);
}

function doLayout(root){
  var layout;
  let leaves = [];
  
  function md (n) { // max depth
      if (n.children.length === 0) leaves.push(n);
      return 1 + (n.children.length ? Math.max.apply(null, n.children.map(md)) : 0);
  };
  let maxd = md(root); // max depth, 1-based

  //
  if (editView.layoutStyle === "tree") {
      // d3 layout arranges nodes top-to-bottom, but we want left-to-right.
      // So...reverse width and height, and do the layout. Then, reverse the x,y coords in the results.
      layout = d3.layout.tree().size([h, w]);
      // Save nodes in global.
      nodes = layout.nodes(root).reverse();
      // Reverse x and y. Also, normalize x for fixed-depth.
      nodes.forEach(function(d) {
          let tmp = d.x; d.x = d.y; d.y = tmp;
          let dx = Math.min(180, w / Math.max(1,maxd-1))
          d.x = d.depth * dx 
      });
  }
  else {
      // dendrogram
      layout = d3.layout.cluster()
          .separation((a,b) => 1)
          .size([h, Math.min(w, maxd * 180)]);
      // Save nodes in global.
      nodes = layout.nodes(root).reverse();
      nodes.forEach( d => { let tmp = d.x; d.x = d.y; d.y = tmp; });

      // ------------------------------------------------------
      // Rearrange y-positions of leaf nodes. 
      let pos = leaves.map(function(n){ return { y: n.y, y0: n.y0 }; });

      leaves.sort(editView.nodeComp);

      // reassign the Y positions
      leaves.forEach(function(n, i){
          n.y = pos[i].y;
          n.y0 = pos[i].y0;
      });
      // At this point, leaves have been rearranged, but the interior nodes haven't.
      // Her we move interior nodes toward their "center of gravity" as defined
      // by the positions of their children. Apply this recursively up the tree.
      // 
      // NOTE that x and y coordinates are opposite at this point!
      //
      // Maintain a map of occupied positions:
      let occupied = {} ;  // occupied[x position] == [list of nodes]
      function cog (n) {
          if (n.children.length > 0) {
              // compute my c.o.g. as the average of my kids' positions
              let myCog = (n.children.map(cog).reduce((t,c) => t+c, 0))/n.children.length;
              if(n.parent) n.y = myCog;
          }
          let dd = occupied[n.y] = (occupied[n.y] || []);
          dd.push(n.y);
          return n.y;
      }
      cog(root);

      // TODO: Final adjustments
      // 1. If we extend off the right edge, compress.
      // 2. If items at same x overlap, spread them out in y.
      // ------------------------------------------------------
  }

  // save links in global
  links = layout.links(nodes);

  return [nodes, links]
}

// --------------------------------------------------------------------------
// update(n) 
// The main drawing routine. 
// Updates the SVG, using n as the source of any entering/exiting animations.
//
function update(source) {
  //
  d3.select("#svgContainer").attr("class", editView.name);

  d3.select("#undoButton")
      .classed("disabled", () => ! undoMgr.canUndo)
      .on("click", undoMgr.canUndo && undo || null);
  d3.select("#redoButton")
      .classed("disabled", () => ! undoMgr.canRedo)
      .on("click", undoMgr.canRedo && redo || null);
  //
  doLayout(root);
  updateNodes(nodes, source);
  updateLinks(links, source);
  updateTtext(currTemplate);
}

//
function updateNodes(nodes, source){
  let nodeGrps = vis.selectAll("g.nodegroup")
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
      if (currNode !== n) showDialog(n, this);
      d3.event.stopPropagation();
  };
  // Add glyph for the node
  nodeEnter.append(function(d){
      var shape = (d.pcomp.kind == "attribute" ? "rect" : "circle");
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
      .duration(animationDuration)
      .attr("transform", function(n) { return "translate(" + n.x + "," + n.y + ")"; })
      ;

  nodeUpdate.select("text.handle")
      .attr('font-family', editView.handleIcon.fontFamily || null)
      .text(editView.handleIcon.text || "") 
      .attr("stroke", editView.handleIcon.stroke || null)
      .attr("fill", editView.handleIcon.fill || null);
  nodeUpdate.select("text.nodeIcon")
      .attr('font-family', editView.nodeIcon.fontFamily || null)
      .text(editView.nodeIcon.text || "") 
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
  if (editView.draggable)
      d3.selectAll(editView.draggable)
          .classed("draggable", true)
          .call(dragBehavior);
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
      .duration(animationDuration)
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
function updateLinks(links, source) {
  let link = vis.selectAll("path.link")
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
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .classed("attribute", function(l) { return l.target.pcomp.kind === "attribute"; })
      .on("click", function(l){ 
          if (d3.event.altKey) {
              // a shift-click cuts the tree at this edge
              removeNode(l.target)
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
              update(l.source);
              saveState(l.source);
          }
      })
      .transition()
        .duration(animationDuration)
        .attr("d", diagonal)
      ;
 
  
  // Transition links to their new position.
  link.classed("outer", function(n) { return n.target.join === "outer"; })
      .transition()
      .duration(animationDuration)
      .attr("d", diagonal)
      ;

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(animationDuration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove()
      ;

}
//
function updateTtext(t){
  //
  let title = vis.selectAll("#qtitle")
      .data([root.template.title]);
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
          d3.select("#drawer").classed("expanded", true);
          Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["g" /* selectText */])("ttextdiv");
      })
      .on("blur", function() {
          d3.select("#drawer").classed("expanded", false);
      });
  //
  if (d3.select('#querycount .button.sync').text() === "sync")
      updateCount(t);
}

function runatmine(t) {
  let uct = t.uncompileTemplate();
  let txt = t.getXml();
  let urlTxt = encodeURIComponent(txt);
  let linkurl = currMine.url + "/loadQuery.do?trail=%7Cquery&method=xml";
  let editurl = linkurl + "&query=" + urlTxt;
  let runurl = linkurl + "&skipBuilder=true&query=" + urlTxt;
  window.open( d3.event.altKey ? editurl : runurl, '_blank' );
}

function updateCount(t){
  let uct = t.uncompileTemplate();
  let qtxt = t.getXml(true);
  let urlTxt = encodeURIComponent(qtxt);
  let countUrl = currMine.url + `/service/query/results?query=${urlTxt}&format=count`;
  d3.select('#querycount').classed("running", true);
  Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(countUrl)
      .then(function(n){
          d3.select('#querycount').classed("error", false).classed("running", false);
          d3.select('#querycount span').text(n)
      })
      .catch(function(e){
          d3.select('#querycount').classed("error", true).classed("running", false);
          console.log("ERROR::", qtxt)
      });
}

// The call that gets it all going...
setup()
//


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
}

/* harmony default export */ __webpack_exports__["a"] = (UndoManager);


/***/ }),
/* 6 */
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
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return initRegistry; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(0);


let registryUrl = "http://registry.intermine.org/service/instances";
let registryFileUrl = "./resources/testdata/registry.json";

function initRegistry (cb) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* d3jsonPromise */])(registryUrl)
      .then(cb)
      .catch(() => {
          alert(`Could not access registry at ${registryUrl}. Trying ${registryFileUrl}.`);
          Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* d3jsonPromise */])(registryFileUrl)
              .then(initMines)
              .catch(() => {
                  alert("Cannot access registry file. This is not your lucky day.");
                  });
      });
}


class RegistryEntry {
    constructor () {
        this.name = "";
        this.url = null;
    }
}




/***/ }),
/* 8 */
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
/* 9 */
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
          Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
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
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                ["Any"].concat(n.template.model.mine.organismList),
                { selected: c.extraValue }
                );
        }
        else if (ctype === "subclass") {
            // Create an option list of subclass names
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                n.parent ? Object(__WEBPACK_IMPORTED_MODULE_2__model_js__["c" /* getSubclasses */])(n.pcomp.kind ? n.pcomp.type : n.pcomp) : [],
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
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
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
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
                '#constraintEditor select[name="values"]',
                c.summaryList || c.values || [c.value],
                { multiple: true,
                emptyMessage: "No list",
                selected: c.values || [c.value]
                });
        } else if (ctype === "value") {
            let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
            d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
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
        let prom = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["a" /* d3jsonPromise */])(url).then(function(json){
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

            Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* initOptionList */])(
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzYzODM5MmFlNTcxYzc1NmUxZGMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3FiLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9yZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvZWRpdFZpZXdzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9jb25zdHJhaW50RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLHdCQUF3QixHO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0RBQW9EO0FBQ2hGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLGNBQWMsR0FBRyxjQUFjO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU0sYUFBYSxRQUFRO0FBQzNDO0FBQ0EsWUFBWSxZQUFZLEdBQUcsYUFBYTtBQUN4QztBQUNBLFlBQVksdUJBQXVCLEdBQUcsd0JBQXdCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFhQTs7Ozs7Ozs7Ozs7O0FDNVFBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsSUFBSTs7QUFFRzs7Ozs7OztBQ25PUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QztBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6QywyQkFBMkI7O0FBRTNCO0FBQ0E7QUFDQSxxQkFBcUIsMEJBQTBCLHFDQUFxQyxFQUFFLHlCQUF5QixFQUFFO0FBQ2pIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsV0FBVywyQ0FBMkMsVUFBVTtBQUM5RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsaURBQWlEOztBQUV0RSxTQUFTO0FBQ1Qsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkQ7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQztBQUNPIiwiZmlsZSI6InFiLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDQpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDM2MzgzOTJhZTU3MWM3NTZlMWRjIiwiXG4vL1xuLy8gRnVuY3Rpb24gdG8gZXNjYXBlICc8JyAnXCInIGFuZCAnJicgY2hhcmFjdGVyc1xuZnVuY3Rpb24gZXNjKHMpe1xuICAgIGlmICghcykgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpOyBcbn1cblxuLy8gUHJvbWlzaWZpZXMgYSBjYWxsIHRvIGQzLmpzb24uXG4vLyBBcmdzOlxuLy8gICB1cmwgKHN0cmluZykgVGhlIHVybCBvZiB0aGUganNvbiByZXNvdXJjZVxuLy8gUmV0dXJuczpcbi8vICAgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGpzb24gb2JqZWN0IHZhbHVlLCBvciByZWplY3RzIHdpdGggYW4gZXJyb3JcbmZ1bmN0aW9uIGQzanNvblByb21pc2UodXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBkMy5qc29uKHVybCwgZnVuY3Rpb24oZXJyb3IsIGpzb24pe1xuICAgICAgICAgICAgZXJyb3IgPyByZWplY3QoeyBzdGF0dXM6IGVycm9yLnN0YXR1cywgc3RhdHVzVGV4dDogZXJyb3Iuc3RhdHVzVGV4dH0pIDogcmVzb2x2ZShqc29uKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbn1cblxuLy8gU2VsZWN0cyBhbGwgdGhlIHRleHQgaW4gdGhlIGdpdmVuIGNvbnRhaW5lci4gXG4vLyBUaGUgY29udGFpbmVyIG11c3QgaGF2ZSBhbiBpZC5cbi8vIENvcGllZCBmcm9tOlxuLy8gICBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMTY3NzQ1MS9ob3ctdG8tc2VsZWN0LWRpdi10ZXh0LW9uLWJ1dHRvbi1jbGlja1xuZnVuY3Rpb24gc2VsZWN0VGV4dChjb250YWluZXJpZCkge1xuICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgcmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyaWQpKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KCk7XG4gICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZShyYW5nZSk7XG4gICAgfVxufVxuXG4vLyBDb252ZXJ0cyBhbiBJbnRlck1pbmUgcXVlcnkgaW4gUGF0aFF1ZXJ5IFhNTCBmb3JtYXQgdG8gYSBKU09OIG9iamVjdCByZXByZXNlbnRhdGlvbi5cbi8vXG5mdW5jdGlvbiBwYXJzZVBhdGhRdWVyeSh4bWwpe1xuICAgIC8vIFR1cm5zIHRoZSBxdWFzaS1saXN0IG9iamVjdCByZXR1cm5lZCBieSBzb21lIERPTSBtZXRob2RzIGludG8gYWN0dWFsIGxpc3RzLlxuICAgIGZ1bmN0aW9uIGRvbWxpc3QyYXJyYXkobHN0KSB7XG4gICAgICAgIGxldCBhID0gW107XG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGxzdC5sZW5ndGg7IGkrKykgYS5wdXNoKGxzdFtpXSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICAvLyBwYXJzZSB0aGUgWE1MXG4gICAgbGV0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBsZXQgZG9tID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh4bWwsIFwidGV4dC94bWxcIik7XG5cbiAgICAvLyBnZXQgdGhlIHBhcnRzLiBVc2VyIG1heSBwYXN0ZSBpbiBhIDx0ZW1wbGF0ZT4gb3IgYSA8cXVlcnk+XG4gICAgLy8gKGkuZS4sIHRlbXBsYXRlIG1heSBiZSBudWxsKVxuICAgIGxldCB0ZW1wbGF0ZSA9IGRvbS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRlbXBsYXRlXCIpWzBdO1xuICAgIGxldCB0aXRsZSA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcInRpdGxlXCIpIHx8IFwiXCI7XG4gICAgbGV0IGNvbW1lbnQgPSB0ZW1wbGF0ZSAmJiB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoXCJjb21tZW50XCIpIHx8IFwiXCI7XG4gICAgbGV0IHF1ZXJ5ID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicXVlcnlcIilbMF07XG4gICAgbGV0IG1vZGVsID0geyBuYW1lOiBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJtb2RlbFwiKSB8fCBcImdlbm9taWNcIiB9O1xuICAgIGxldCBuYW1lID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSB8fCBcIlwiO1xuICAgIGxldCBkZXNjcmlwdGlvbiA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImxvbmdEZXNjcml0aW9uXCIpIHx8IFwiXCI7XG4gICAgbGV0IHNlbGVjdCA9IChxdWVyeS5nZXRBdHRyaWJ1dGUoXCJ2aWV3XCIpIHx8IFwiXCIpLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgIGxldCBjb25zdHJhaW50cyA9IGRvbWxpc3QyYXJyYXkoZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjb25zdHJhaW50JykpO1xuICAgIGxldCBjb25zdHJhaW50TG9naWMgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJjb25zdHJhaW50TG9naWNcIik7XG4gICAgbGV0IGpvaW5zID0gZG9tbGlzdDJhcnJheShxdWVyeS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImpvaW5cIikpO1xuICAgIGxldCBzb3J0T3JkZXIgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIikgfHwgXCJcIjtcbiAgICAvL1xuICAgIC8vXG4gICAgbGV0IHdoZXJlID0gY29uc3RyYWludHMubWFwKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgbGV0IG9wID0gYy5nZXRBdHRyaWJ1dGUoXCJvcFwiKTtcbiAgICAgICAgICAgIGxldCB0eXBlID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gYy5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO1xuICAgICAgICAgICAgICAgIG9wID0gXCJJU0FcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2YWxzID0gZG9tbGlzdDJhcnJheShjLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidmFsdWVcIikpLm1hcCggdiA9PiB2LmlubmVySFRNTCApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcDogb3AsXG4gICAgICAgICAgICAgICAgcGF0aDogYy5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlIDogYy5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSxcbiAgICAgICAgICAgICAgICB2YWx1ZXMgOiB2YWxzLFxuICAgICAgICAgICAgICAgIHR5cGUgOiBjLmdldEF0dHJpYnV0ZShcInR5cGVcIiksXG4gICAgICAgICAgICAgICAgY29kZTogYy5nZXRBdHRyaWJ1dGUoXCJjb2RlXCIpLFxuICAgICAgICAgICAgICAgIGVkaXRhYmxlOiBjLmdldEF0dHJpYnV0ZShcImVkaXRhYmxlXCIpIHx8IFwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgLy8gQ2hlY2s6IGlmIHRoZXJlIGlzIG9ubHkgb25lIGNvbnN0cmFpbnQsIChhbmQgaXQncyBub3QgYW4gSVNBKSwgc29tZXRpbWVzIHRoZSBjb25zdHJhaW50TG9naWMgXG4gICAgLy8gYW5kL29yIHRoZSBjb25zdHJhaW50IGNvZGUgYXJlIG1pc3NpbmcuXG4gICAgaWYgKHdoZXJlLmxlbmd0aCA9PT0gMSAmJiB3aGVyZVswXS5vcCAhPT0gXCJJU0FcIiAmJiAhd2hlcmVbMF0uY29kZSl7XG4gICAgICAgIHdoZXJlWzBdLmNvZGUgPSBjb25zdHJhaW50TG9naWMgPSBcIkFcIjtcbiAgICB9XG5cbiAgICAvLyBvdXRlciBqb2lucy4gVGhleSBsb29rIGxpa2UgdGhpczpcbiAgICAvLyAgICAgICA8am9pbiBwYXRoPVwiR2VuZS5zZXF1ZW5jZU9udG9sb2d5VGVybVwiIHN0eWxlPVwiT1VURVJcIi8+XG4gICAgam9pbnMgPSBqb2lucy5tYXAoIGogPT4gai5nZXRBdHRyaWJ1dGUoXCJwYXRoXCIpICk7XG5cbiAgICBsZXQgb3JkZXJCeSA9IG51bGw7XG4gICAgaWYgKHNvcnRPcmRlcikge1xuICAgICAgICAvLyBUaGUganNvbiBmb3JtYXQgZm9yIG9yZGVyQnkgaXMgYSBiaXQgd2VpcmQuXG4gICAgICAgIC8vIElmIHRoZSB4bWwgb3JkZXJCeSBpczogXCJBLmIuYyBhc2MgQS5kLmUgZGVzY1wiLFxuICAgICAgICAvLyB0aGUganNvbiBzaG91bGQgYmU6IFsge1wiQS5iLmNcIjpcImFzY1wifSwge1wiQS5kLmVcIjpcImRlc2N9IF1cbiAgICAgICAgLy8gXG4gICAgICAgIC8vIFRoZSBvcmRlcmJ5IHN0cmluZyB0b2tlbnMsIGUuZy4gW1wiQS5iLmNcIiwgXCJhc2NcIiwgXCJBLmQuZVwiLCBcImRlc2NcIl1cbiAgICAgICAgbGV0IG9iID0gc29ydE9yZGVyLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2s6XG4gICAgICAgIGlmIChvYi5sZW5ndGggJSAyIClcbiAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IHBhcnNlIHRoZSBvcmRlckJ5IGNsYXVzZTogXCIgKyBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJzb3J0T3JkZXJcIik7XG4gICAgICAgIC8vIGNvbnZlcnQgdG9rZW5zIHRvIGpzb24gb3JkZXJCeSBcbiAgICAgICAgb3JkZXJCeSA9IG9iLnJlZHVjZShmdW5jdGlvbihhY2MsIGN1cnIsIGkpe1xuICAgICAgICAgICAgaWYgKGkgJSAyID09PSAwKXtcbiAgICAgICAgICAgICAgICAvLyBvZGQuIGN1cnIgaXMgYSBwYXRoLiBQdXNoIGl0LlxuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGN1cnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBldmVuLiBQb3AgdGhlIHBhdGgsIGNyZWF0ZSB0aGUge30sIGFuZCBwdXNoIGl0LlxuICAgICAgICAgICAgICAgIGxldCB2ID0ge31cbiAgICAgICAgICAgICAgICBsZXQgcCA9IGFjYy5wb3AoKVxuICAgICAgICAgICAgICAgIHZbcF0gPSBjdXJyO1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICBjb25zdHJhaW50TG9naWMsXG4gICAgICAgIHNlbGVjdCxcbiAgICAgICAgd2hlcmUsXG4gICAgICAgIGpvaW5zLFxuICAgICAgICBvcmRlckJ5XG4gICAgfTtcbn1cblxuLy8gUmV0dXJucyBhIGRlZXAgY29weSBvZiBvYmplY3Qgby4gXG4vLyBBcmdzOlxuLy8gICBvICAob2JqZWN0KSBNdXN0IGJlIGEgSlNPTiBvYmplY3QgKG5vIGN1cmN1bGFyIHJlZnMsIG5vIGZ1bmN0aW9ucykuXG4vLyBSZXR1cm5zOlxuLy8gICBhIGRlZXAgY29weSBvZiBvXG5mdW5jdGlvbiBkZWVwYyhvKSB7XG4gICAgaWYgKCFvKSByZXR1cm4gbztcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvKSk7XG59XG5cbi8vXG5sZXQgUFJFRklYPVwib3JnLm1naS5hcHBzLnFiXCI7XG5mdW5jdGlvbiB0ZXN0TG9jYWwoYXR0cikge1xuICAgIHJldHVybiAoUFJFRklYK1wiLlwiK2F0dHIpIGluIGxvY2FsU3RvcmFnZTtcbn1cbmZ1bmN0aW9uIHNldExvY2FsKGF0dHIsIHZhbCwgZW5jb2RlKXtcbiAgICBsb2NhbFN0b3JhZ2VbUFJFRklYK1wiLlwiK2F0dHJdID0gZW5jb2RlID8gSlNPTi5zdHJpbmdpZnkodmFsKSA6IHZhbDtcbn1cbmZ1bmN0aW9uIGdldExvY2FsKGF0dHIsIGRlY29kZSwgZGZsdCl7XG4gICAgbGV0IGtleSA9IFBSRUZJWCtcIi5cIithdHRyO1xuICAgIGlmIChrZXkgaW4gbG9jYWxTdG9yYWdlKXtcbiAgICAgICAgbGV0IHYgPSBsb2NhbFN0b3JhZ2Vba2V5XTtcbiAgICAgICAgaWYgKGRlY29kZSkgdiA9IEpTT04ucGFyc2Uodik7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRmbHQ7XG4gICAgfVxufVxuZnVuY3Rpb24gY2xlYXJMb2NhbCgpIHtcbiAgICBsZXQgcm12ID0gT2JqZWN0LmtleXMobG9jYWxTdG9yYWdlKS5maWx0ZXIoa2V5ID0+IGtleS5zdGFydHNXaXRoKFBSRUZJWCkpO1xuICAgIHJtdi5mb3JFYWNoKCBrID0+IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGspICk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSB0aGUgZ2l2ZW4gb2JqZWN0LlxuLy8gVGhlIGxpc3QgaXMgc29ydGVkIGJ5IHRoZSBpdGVtIGtleXMuXG4vLyBJZiBuYW1lQXR0ciBpcyBzcGVjaWZpZWQsIHRoZSBpdGVtIGtleSBpcyBhbHNvIGFkZGVkIHRvIGVhY2ggZWxlbWVudFxuLy8gYXMgYW4gYXR0cmlidXRlIChvbmx5IHdvcmtzIGlmIHRob3NlIGl0ZW1zIGFyZSB0aGVtc2VsdmVzIG9iamVjdHMpLlxuLy8gRXhhbXBsZXM6XG4vLyAgICBzdGF0ZXMgPSB7J01FJzp7bmFtZTonTWFpbmUnfSwgJ0lBJzp7bmFtZTonSW93YSd9fVxuLy8gICAgb2JqMmFycmF5KHN0YXRlcykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnfSwge25hbWU6J01haW5lJ31dXG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzLCAnYWJicmV2JykgPT5cbi8vICAgICAgICBbe25hbWU6J0lvd2EnLGFiYnJldidJQSd9LCB7bmFtZTonTWFpbmUnLGFiYnJldidNRSd9XVxuLy8gQXJnczpcbi8vICAgIG8gIChvYmplY3QpIFRoZSBvYmplY3QuXG4vLyAgICBuYW1lQXR0ciAoc3RyaW5nKSBJZiBzcGVjaWZpZWQsIGFkZHMgdGhlIGl0ZW0ga2V5IGFzIGFuIGF0dHJpYnV0ZSB0byBlYWNoIGxpc3QgZWxlbWVudC5cbi8vIFJldHVybjpcbi8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgaXRlbSB2YWx1ZXMgZnJvbSBvXG5mdW5jdGlvbiBvYmoyYXJyYXkobywgbmFtZUF0dHIpe1xuICAgIHZhciBrcyA9IE9iamVjdC5rZXlzKG8pO1xuICAgIGtzLnNvcnQoKTtcbiAgICByZXR1cm4ga3MubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIGlmIChuYW1lQXR0cikgb1trXS5uYW1lID0gaztcbiAgICAgICAgcmV0dXJuIG9ba107XG4gICAgfSk7XG59O1xuXG4vLyBBcmdzOlxuLy8gICBzZWxlY3RvciAoc3RyaW5nKSBGb3Igc2VsZWN0aW5nIHRoZSA8c2VsZWN0PiBlbGVtZW50XG4vLyAgIGRhdGEgKGxpc3QpIERhdGEgdG8gYmluZCB0byBvcHRpb25zXG4vLyAgIGNmZyAob2JqZWN0KSBBZGRpdGlvbmFsIG9wdGlvbmFsIGNvbmZpZ3M6XG4vLyAgICAgICB0aXRsZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgZm9yIHNldHRpbmcgdGhlIHRleHQgb2YgdGhlIG9wdGlvbi4gXG4vLyAgICAgICB2YWx1ZSAtIGZ1bmN0aW9uIG9yIGxpdGVyYWwgc2V0dGluZyB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvblxuLy8gICAgICAgc2VsZWN0ZWQgLSBmdW5jdGlvbiBvciBhcnJheSBvciBzdHJpbmcgZm9yIGRlY2lkaW5nIHdoaWNoIG9wdGlvbihzKSBhcmUgc2VsZWN0ZWRcbi8vICAgICAgICAgIElmIGZ1bmN0aW9uLCBjYWxsZWQgZm9yIGVhY2ggb3B0aW9uLlxuLy8gICAgICAgICAgSWYgYXJyYXksIHNwZWNpZmllcyB0aGUgdmFsdWVzIHRvIHNlbGVjdC5cbi8vICAgICAgICAgIElmIHN0cmluZywgc3BlY2lmaWVzIHdoaWNoIHZhbHVlIGlzIHNlbGVjdGVkXG4vLyAgICAgICBlbXB0eU1lc3NhZ2UgLSBhIG1lc3NhZ2UgdG8gc2hvdyBpZiB0aGUgZGF0YSBsaXN0IGlzIGVtcHR5XG4vLyAgICAgICBtdWx0aXBsZSAtIGlmIHRydWUsIG1ha2UgaXQgYSBtdWx0aS1zZWxlY3QgbGlzdFxuLy9cbmZ1bmN0aW9uIGluaXRPcHRpb25MaXN0IChzZWxlY3RvciwgZGF0YSwgY2ZnKSB7XG4gICAgXG4gICAgY2ZnID0gY2ZnIHx8IHt9O1xuXG4gICAgdmFyIGlkZW50ID0gKHg9PngpO1xuICAgIHZhciBvcHRzO1xuICAgIGlmKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKXtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKGRhdGEpO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIC8vXG4gICAgICAgIG9wdHMuYXR0cihcInZhbHVlXCIsIGNmZy52YWx1ZSB8fCBpZGVudClcbiAgICAgICAgICAgIC50ZXh0KGNmZy50aXRsZSB8fCBpZGVudClcbiAgICAgICAgICAgIC5hdHRyKFwic2VsZWN0ZWRcIiwgbnVsbClcbiAgICAgICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgbnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YoY2ZnLnNlbGVjdGVkKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBmdW5jdGlvbiBzYXlzIHNvXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZChkKXx8bnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjZmcuc2VsZWN0ZWQpKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3RlZCBpZiB0aGUgb3B0J3MgdmFsdWUgaXMgaW4gdGhlIGFycmF5XG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+IGNmZy5zZWxlY3RlZC5pbmRleE9mKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpKSAhPSAtMSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZmcuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBtYXRjaGVzXG4gICAgICAgICAgICBvcHRzLmF0dHIoXCJzZWxlY3RlZFwiLCBkID0+ICgoY2ZnLnZhbHVlIHx8IGlkZW50KShkKSA9PT0gY2ZnLnNlbGVjdGVkKSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxlY3RvcilbMF1bMF0uc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdHMgPSBkMy5zZWxlY3Qoc2VsZWN0b3IpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZGF0YShbY2ZnLmVtcHR5TWVzc2FnZXx8XCJlbXB0eSBsaXN0XCJdKTtcbiAgICAgICAgb3B0cy5lbnRlcigpLmFwcGVuZCgnb3B0aW9uJyk7XG4gICAgICAgIG9wdHMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBvcHRzLnRleHQoaWRlbnQpLmF0dHIoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gc2V0IG11bHRpIHNlbGVjdCAob3Igbm90KVxuICAgIGQzLnNlbGVjdChzZWxlY3RvcikuYXR0cihcIm11bHRpcGxlXCIsIGNmZy5tdWx0aXBsZSB8fCBudWxsKTtcbiAgICAvLyBhbGxvdyBjYWxsZXIgdG8gY2hhaW5cbiAgICByZXR1cm4gb3B0cztcbn1cblxuLy9cbmV4cG9ydCB7XG4gICAgZXNjLFxuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBnZXRMb2NhbCxcbiAgICBzZXRMb2NhbCxcbiAgICB0ZXN0TG9jYWwsXG4gICAgY2xlYXJMb2NhbCxcbiAgICBwYXJzZVBhdGhRdWVyeSxcbiAgICBvYmoyYXJyYXksXG4gICAgaW5pdE9wdGlvbkxpc3Rcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFZhbGlkIGNvbnN0cmFpbnQgdHlwZXMgKGN0eXBlKTpcbi8vICAgbnVsbCwgbG9va3VwLCBzdWJjbGFzcywgbGlzdCwgbG9vcCwgdmFsdWUsIG11bHRpdmFsdWUsIHJhbmdlXG4vL1xuLy8gQ29uc3RyYWludHMgb24gYXR0cmlidXRlczpcbi8vIC0gdmFsdWUgKGNvbXBhcmluZyBhbiBhdHRyaWJ1dGUgdG8gYSB2YWx1ZSwgdXNpbmcgYW4gb3BlcmF0b3IpXG4vLyAgICAgID4gPj0gPCA8PSA9ICE9IExJS0UgTk9ULUxJS0UgQ09OVEFJTlMgRE9FUy1OT1QtQ09OVEFJTlxuLy8gLSBtdWx0aXZhbHVlIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIG11bHRpcGxlIHZhbHVlKVxuLy8gICAgICBPTkUtT0YgTk9ULU9ORSBPRlxuLy8gLSByYW5nZSAoc3VidHlwZSBvZiBtdWx0aXZhbHVlLCBmb3IgY29vcmRpbmF0ZSByYW5nZXMpXG4vLyAgICAgIFdJVEhJTiBPVVRTSURFIE9WRVJMQVBTIERPRVMtTk9ULU9WRVJMQVBcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vL1xuLy8gQ29uc3RyYWludHMgb24gcmVmZXJlbmNlcy9jb2xsZWN0aW9uc1xuLy8gLSBudWxsIChzdWJ0eXBlIG9mIHZhbHVlIGNvbnN0cmFpbnQsIGZvciB0ZXN0aW5nIE5VTEwgcmVmL2VtcHR5IGNvbGxlY3Rpb24pXG4vLyAgICAgIE5VTEwgSVMtTk9ULU5VTExcbi8vIC0gbG9va3VwIChcbi8vICAgICAgTE9PS1VQXG4vLyAtIHN1YmNsYXNzXG4vLyAgICAgIElTQVxuLy8gLSBsaXN0XG4vLyAgICAgIElOIE5PVC1JTlxuLy8gLSBsb29wIChUT0RPKVxuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBhcmUgbnVtZXJpY1xudmFyIE5VTUVSSUNUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIlxuXTtcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgY2FuIGhhdmUgbnVsbCB2YWx1ZXNcbnZhciBOVUxMQUJMRVRZUEVTPSBbXG4gICAgXCJqYXZhLmxhbmcuSW50ZWdlclwiLFxuICAgIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJqYXZhLmxhbmcuTG9uZ1wiLFxuICAgIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCJcbl07XG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGFuIGF0dHJpYnV0ZSBjYW4gaGF2ZVxudmFyIExFQUZUWVBFUz0gW1xuICAgIFwiaW50XCIsIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcInNob3J0XCIsIFwiamF2YS5sYW5nLlNob3J0XCIsXG4gICAgXCJsb25nXCIsIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImZsb2F0XCIsIFwiamF2YS5sYW5nLkZsb2F0XCIsXG4gICAgXCJkb3VibGVcIiwgXCJqYXZhLmxhbmcuRG91YmxlXCIsXG4gICAgXCJqYXZhLm1hdGguQmlnRGVjaW1hbFwiLFxuICAgIFwiamF2YS51dGlsLkRhdGVcIixcbiAgICBcImphdmEubGFuZy5TdHJpbmdcIixcbiAgICBcImphdmEubGFuZy5Cb29sZWFuXCIsXG4gICAgXCJqYXZhLmxhbmcuT2JqZWN0XCIsXG4gICAgXCJPYmplY3RcIlxuXVxuXG5cbnZhciBPUFMgPSBbXG5cbiAgICAvLyBWYWxpZCBmb3IgYW55IGF0dHJpYnV0ZVxuICAgIC8vIEFsc28gdGhlIG9wZXJhdG9ycyBmb3IgbG9vcCBjb25zdHJhaW50cyAobm90IHlldCBpbXBsZW1lbnRlZCkuXG4gICAge1xuICAgIG9wOiBcIj1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSx7XG4gICAgb3A6IFwiIT1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3IgbnVtZXJpYyBhbmQgZGF0ZSBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIj5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0se1xuICAgIG9wOiBcIj49XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI8PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBmb3Igc3RyaW5nIGF0dHJpYnV0ZXNcbiAgICB7XG4gICAgb3A6IFwiQ09OVEFJTlNcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cblxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIENPTlRBSU5cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIExJS0VcIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJPTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PTkUgT0ZcIixcbiAgICBjdHlwZTogXCJtdWx0aXZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgb25seSBmb3IgTG9jYXRpb24gbm9kZXNcbiAgICB7XG4gICAgb3A6IFwiV0lUSElOXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9WRVJMQVBTXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIkRPRVMgTk9UIE9WRVJMQVBcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSx7XG4gICAgb3A6IFwiT1VUU0lERVwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LFxuIFxuICAgIC8vIE5VTEwgY29uc3RyYWludHMuIFZhbGlkIGZvciBhbnkgbm9kZSBleGNlcHQgcm9vdC5cbiAgICB7XG4gICAgb3A6IFwiSVMgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCJJUyBOT1QgTlVMTFwiLFxuICAgIGN0eXBlOiBcIm51bGxcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTExBQkxFVFlQRVNcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSAoaS5lLiwgdGhlIHJvb3QsIG9yIGFueSBcbiAgICAvLyByZWZlcmVuY2Ugb3IgY29sbGVjdGlvbiBub2RlKS5cbiAgICB7XG4gICAgb3A6IFwiTE9PS1VQXCIsXG4gICAgY3R5cGU6IFwibG9va3VwXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0se1xuICAgIG9wOiBcIklOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJOT1QgSU5cIixcbiAgICBjdHlwZTogXCJsaXN0XCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogdHJ1ZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgYXQgYW55IG5vbi1hdHRyaWJ1dGUgbm9kZSBleGNlcHQgdGhlIHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTQVwiLFxuICAgIGN0eXBlOiBcInN1YmNsYXNzXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IGZhbHNlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2VcbiAgICB9XTtcbi8vXG52YXIgT1BJTkRFWCA9IE9QUy5yZWR1Y2UoZnVuY3Rpb24oeCxvKXtcbiAgICB4W28ub3BdID0gbztcbiAgICByZXR1cm4geDtcbn0sIHt9KTtcblxuZXhwb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvb3BzLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImxldCBzID0gYFxuM2Rfcm90YXRpb24gZTg0ZFxuYWNfdW5pdCBlYjNiXG5hY2Nlc3NfYWxhcm0gZTE5MFxuYWNjZXNzX2FsYXJtcyBlMTkxXG5hY2Nlc3NfdGltZSBlMTkyXG5hY2Nlc3NpYmlsaXR5IGU4NGVcbmFjY2Vzc2libGUgZTkxNFxuYWNjb3VudF9iYWxhbmNlIGU4NGZcbmFjY291bnRfYmFsYW5jZV93YWxsZXQgZTg1MFxuYWNjb3VudF9ib3ggZTg1MVxuYWNjb3VudF9jaXJjbGUgZTg1M1xuYWRiIGU2MGVcbmFkZCBlMTQ1XG5hZGRfYV9waG90byBlNDM5XG5hZGRfYWxhcm0gZTE5M1xuYWRkX2FsZXJ0IGUwMDNcbmFkZF9ib3ggZTE0NlxuYWRkX2NpcmNsZSBlMTQ3XG5hZGRfY2lyY2xlX291dGxpbmUgZTE0OFxuYWRkX2xvY2F0aW9uIGU1NjdcbmFkZF9zaG9wcGluZ19jYXJ0IGU4NTRcbmFkZF90b19waG90b3MgZTM5ZFxuYWRkX3RvX3F1ZXVlIGUwNWNcbmFkanVzdCBlMzllXG5haXJsaW5lX3NlYXRfZmxhdCBlNjMwXG5haXJsaW5lX3NlYXRfZmxhdF9hbmdsZWQgZTYzMVxuYWlybGluZV9zZWF0X2luZGl2aWR1YWxfc3VpdGUgZTYzMlxuYWlybGluZV9zZWF0X2xlZ3Jvb21fZXh0cmEgZTYzM1xuYWlybGluZV9zZWF0X2xlZ3Jvb21fbm9ybWFsIGU2MzRcbmFpcmxpbmVfc2VhdF9sZWdyb29tX3JlZHVjZWQgZTYzNVxuYWlybGluZV9zZWF0X3JlY2xpbmVfZXh0cmEgZTYzNlxuYWlybGluZV9zZWF0X3JlY2xpbmVfbm9ybWFsIGU2MzdcbmFpcnBsYW5lbW9kZV9hY3RpdmUgZTE5NVxuYWlycGxhbmVtb2RlX2luYWN0aXZlIGUxOTRcbmFpcnBsYXkgZTA1NVxuYWlycG9ydF9zaHV0dGxlIGViM2NcbmFsYXJtIGU4NTVcbmFsYXJtX2FkZCBlODU2XG5hbGFybV9vZmYgZTg1N1xuYWxhcm1fb24gZTg1OFxuYWxidW0gZTAxOVxuYWxsX2luY2x1c2l2ZSBlYjNkXG5hbGxfb3V0IGU5MGJcbmFuZHJvaWQgZTg1OVxuYW5ub3VuY2VtZW50IGU4NWFcbmFwcHMgZTVjM1xuYXJjaGl2ZSBlMTQ5XG5hcnJvd19iYWNrIGU1YzRcbmFycm93X2Rvd253YXJkIGU1ZGJcbmFycm93X2Ryb3BfZG93biBlNWM1XG5hcnJvd19kcm9wX2Rvd25fY2lyY2xlIGU1YzZcbmFycm93X2Ryb3BfdXAgZTVjN1xuYXJyb3dfZm9yd2FyZCBlNWM4XG5hcnJvd191cHdhcmQgZTVkOFxuYXJ0X3RyYWNrIGUwNjBcbmFzcGVjdF9yYXRpbyBlODViXG5hc3Nlc3NtZW50IGU4NWNcbmFzc2lnbm1lbnQgZTg1ZFxuYXNzaWdubWVudF9pbmQgZTg1ZVxuYXNzaWdubWVudF9sYXRlIGU4NWZcbmFzc2lnbm1lbnRfcmV0dXJuIGU4NjBcbmFzc2lnbm1lbnRfcmV0dXJuZWQgZTg2MVxuYXNzaWdubWVudF90dXJuZWRfaW4gZTg2MlxuYXNzaXN0YW50IGUzOWZcbmFzc2lzdGFudF9waG90byBlM2EwXG5hdHRhY2hfZmlsZSBlMjI2XG5hdHRhY2hfbW9uZXkgZTIyN1xuYXR0YWNobWVudCBlMmJjXG5hdWRpb3RyYWNrIGUzYTFcbmF1dG9yZW5ldyBlODYzXG5hdl90aW1lciBlMDFiXG5iYWNrc3BhY2UgZTE0YVxuYmFja3VwIGU4NjRcbmJhdHRlcnlfYWxlcnQgZTE5Y1xuYmF0dGVyeV9jaGFyZ2luZ19mdWxsIGUxYTNcbmJhdHRlcnlfZnVsbCBlMWE0XG5iYXR0ZXJ5X3N0ZCBlMWE1XG5iYXR0ZXJ5X3Vua25vd24gZTFhNlxuYmVhY2hfYWNjZXNzIGViM2VcbmJlZW5oZXJlIGU1MmRcbmJsb2NrIGUxNGJcbmJsdWV0b290aCBlMWE3XG5ibHVldG9vdGhfYXVkaW8gZTYwZlxuYmx1ZXRvb3RoX2Nvbm5lY3RlZCBlMWE4XG5ibHVldG9vdGhfZGlzYWJsZWQgZTFhOVxuYmx1ZXRvb3RoX3NlYXJjaGluZyBlMWFhXG5ibHVyX2NpcmN1bGFyIGUzYTJcbmJsdXJfbGluZWFyIGUzYTNcbmJsdXJfb2ZmIGUzYTRcbmJsdXJfb24gZTNhNVxuYm9vayBlODY1XG5ib29rbWFyayBlODY2XG5ib29rbWFya19ib3JkZXIgZTg2N1xuYm9yZGVyX2FsbCBlMjI4XG5ib3JkZXJfYm90dG9tIGUyMjlcbmJvcmRlcl9jbGVhciBlMjJhXG5ib3JkZXJfY29sb3IgZTIyYlxuYm9yZGVyX2hvcml6b250YWwgZTIyY1xuYm9yZGVyX2lubmVyIGUyMmRcbmJvcmRlcl9sZWZ0IGUyMmVcbmJvcmRlcl9vdXRlciBlMjJmXG5ib3JkZXJfcmlnaHQgZTIzMFxuYm9yZGVyX3N0eWxlIGUyMzFcbmJvcmRlcl90b3AgZTIzMlxuYm9yZGVyX3ZlcnRpY2FsIGUyMzNcbmJyYW5kaW5nX3dhdGVybWFyayBlMDZiXG5icmlnaHRuZXNzXzEgZTNhNlxuYnJpZ2h0bmVzc18yIGUzYTdcbmJyaWdodG5lc3NfMyBlM2E4XG5icmlnaHRuZXNzXzQgZTNhOVxuYnJpZ2h0bmVzc181IGUzYWFcbmJyaWdodG5lc3NfNiBlM2FiXG5icmlnaHRuZXNzXzcgZTNhY1xuYnJpZ2h0bmVzc19hdXRvIGUxYWJcbmJyaWdodG5lc3NfaGlnaCBlMWFjXG5icmlnaHRuZXNzX2xvdyBlMWFkXG5icmlnaHRuZXNzX21lZGl1bSBlMWFlXG5icm9rZW5faW1hZ2UgZTNhZFxuYnJ1c2ggZTNhZVxuYnViYmxlX2NoYXJ0IGU2ZGRcbmJ1Z19yZXBvcnQgZTg2OFxuYnVpbGQgZTg2OVxuYnVyc3RfbW9kZSBlNDNjXG5idXNpbmVzcyBlMGFmXG5idXNpbmVzc19jZW50ZXIgZWIzZlxuY2FjaGVkIGU4NmFcbmNha2UgZTdlOVxuY2FsbCBlMGIwXG5jYWxsX2VuZCBlMGIxXG5jYWxsX21hZGUgZTBiMlxuY2FsbF9tZXJnZSBlMGIzXG5jYWxsX21pc3NlZCBlMGI0XG5jYWxsX21pc3NlZF9vdXRnb2luZyBlMGU0XG5jYWxsX3JlY2VpdmVkIGUwYjVcbmNhbGxfc3BsaXQgZTBiNlxuY2FsbF90b19hY3Rpb24gZTA2Y1xuY2FtZXJhIGUzYWZcbmNhbWVyYV9hbHQgZTNiMFxuY2FtZXJhX2VuaGFuY2UgZThmY1xuY2FtZXJhX2Zyb250IGUzYjFcbmNhbWVyYV9yZWFyIGUzYjJcbmNhbWVyYV9yb2xsIGUzYjNcbmNhbmNlbCBlNWM5XG5jYXJkX2dpZnRjYXJkIGU4ZjZcbmNhcmRfbWVtYmVyc2hpcCBlOGY3XG5jYXJkX3RyYXZlbCBlOGY4XG5jYXNpbm8gZWI0MFxuY2FzdCBlMzA3XG5jYXN0X2Nvbm5lY3RlZCBlMzA4XG5jZW50ZXJfZm9jdXNfc3Ryb25nIGUzYjRcbmNlbnRlcl9mb2N1c193ZWFrIGUzYjVcbmNoYW5nZV9oaXN0b3J5IGU4NmJcbmNoYXQgZTBiN1xuY2hhdF9idWJibGUgZTBjYVxuY2hhdF9idWJibGVfb3V0bGluZSBlMGNiXG5jaGVjayBlNWNhXG5jaGVja19ib3ggZTgzNFxuY2hlY2tfYm94X291dGxpbmVfYmxhbmsgZTgzNVxuY2hlY2tfY2lyY2xlIGU4NmNcbmNoZXZyb25fbGVmdCBlNWNiXG5jaGV2cm9uX3JpZ2h0IGU1Y2NcbmNoaWxkX2NhcmUgZWI0MVxuY2hpbGRfZnJpZW5kbHkgZWI0MlxuY2hyb21lX3JlYWRlcl9tb2RlIGU4NmRcbmNsYXNzIGU4NmVcbmNsZWFyIGUxNGNcbmNsZWFyX2FsbCBlMGI4XG5jbG9zZSBlNWNkXG5jbG9zZWRfY2FwdGlvbiBlMDFjXG5jbG91ZCBlMmJkXG5jbG91ZF9jaXJjbGUgZTJiZVxuY2xvdWRfZG9uZSBlMmJmXG5jbG91ZF9kb3dubG9hZCBlMmMwXG5jbG91ZF9vZmYgZTJjMVxuY2xvdWRfcXVldWUgZTJjMlxuY2xvdWRfdXBsb2FkIGUyYzNcbmNvZGUgZTg2ZlxuY29sbGVjdGlvbnMgZTNiNlxuY29sbGVjdGlvbnNfYm9va21hcmsgZTQzMVxuY29sb3JfbGVucyBlM2I3XG5jb2xvcml6ZSBlM2I4XG5jb21tZW50IGUwYjlcbmNvbXBhcmUgZTNiOVxuY29tcGFyZV9hcnJvd3MgZTkxNVxuY29tcHV0ZXIgZTMwYVxuY29uZmlybWF0aW9uX251bWJlciBlNjM4XG5jb250YWN0X21haWwgZTBkMFxuY29udGFjdF9waG9uZSBlMGNmXG5jb250YWN0cyBlMGJhXG5jb250ZW50X2NvcHkgZTE0ZFxuY29udGVudF9jdXQgZTE0ZVxuY29udGVudF9wYXN0ZSBlMTRmXG5jb250cm9sX3BvaW50IGUzYmFcbmNvbnRyb2xfcG9pbnRfZHVwbGljYXRlIGUzYmJcbmNvcHlyaWdodCBlOTBjXG5jcmVhdGUgZTE1MFxuY3JlYXRlX25ld19mb2xkZXIgZTJjY1xuY3JlZGl0X2NhcmQgZTg3MFxuY3JvcCBlM2JlXG5jcm9wXzE2XzkgZTNiY1xuY3JvcF8zXzIgZTNiZFxuY3JvcF81XzQgZTNiZlxuY3JvcF83XzUgZTNjMFxuY3JvcF9kaW4gZTNjMVxuY3JvcF9mcmVlIGUzYzJcbmNyb3BfbGFuZHNjYXBlIGUzYzNcbmNyb3Bfb3JpZ2luYWwgZTNjNFxuY3JvcF9wb3J0cmFpdCBlM2M1XG5jcm9wX3JvdGF0ZSBlNDM3XG5jcm9wX3NxdWFyZSBlM2M2XG5kYXNoYm9hcmQgZTg3MVxuZGF0YV91c2FnZSBlMWFmXG5kYXRlX3JhbmdlIGU5MTZcbmRlaGF6ZSBlM2M3XG5kZWxldGUgZTg3MlxuZGVsZXRlX2ZvcmV2ZXIgZTkyYlxuZGVsZXRlX3N3ZWVwIGUxNmNcbmRlc2NyaXB0aW9uIGU4NzNcbmRlc2t0b3BfbWFjIGUzMGJcbmRlc2t0b3Bfd2luZG93cyBlMzBjXG5kZXRhaWxzIGUzYzhcbmRldmVsb3Blcl9ib2FyZCBlMzBkXG5kZXZlbG9wZXJfbW9kZSBlMWIwXG5kZXZpY2VfaHViIGUzMzVcbmRldmljZXMgZTFiMVxuZGV2aWNlc19vdGhlciBlMzM3XG5kaWFsZXJfc2lwIGUwYmJcbmRpYWxwYWQgZTBiY1xuZGlyZWN0aW9ucyBlNTJlXG5kaXJlY3Rpb25zX2Jpa2UgZTUyZlxuZGlyZWN0aW9uc19ib2F0IGU1MzJcbmRpcmVjdGlvbnNfYnVzIGU1MzBcbmRpcmVjdGlvbnNfY2FyIGU1MzFcbmRpcmVjdGlvbnNfcmFpbHdheSBlNTM0XG5kaXJlY3Rpb25zX3J1biBlNTY2XG5kaXJlY3Rpb25zX3N1YndheSBlNTMzXG5kaXJlY3Rpb25zX3RyYW5zaXQgZTUzNVxuZGlyZWN0aW9uc193YWxrIGU1MzZcbmRpc2NfZnVsbCBlNjEwXG5kbnMgZTg3NVxuZG9fbm90X2Rpc3R1cmIgZTYxMlxuZG9fbm90X2Rpc3R1cmJfYWx0IGU2MTFcbmRvX25vdF9kaXN0dXJiX29mZiBlNjQzXG5kb19ub3RfZGlzdHVyYl9vbiBlNjQ0XG5kb2NrIGUzMGVcbmRvbWFpbiBlN2VlXG5kb25lIGU4NzZcbmRvbmVfYWxsIGU4NzdcbmRvbnV0X2xhcmdlIGU5MTdcbmRvbnV0X3NtYWxsIGU5MThcbmRyYWZ0cyBlMTUxXG5kcmFnX2hhbmRsZSBlMjVkXG5kcml2ZV9ldGEgZTYxM1xuZHZyIGUxYjJcbmVkaXQgZTNjOVxuZWRpdF9sb2NhdGlvbiBlNTY4XG5lamVjdCBlOGZiXG5lbWFpbCBlMGJlXG5lbmhhbmNlZF9lbmNyeXB0aW9uIGU2M2ZcbmVxdWFsaXplciBlMDFkXG5lcnJvciBlMDAwXG5lcnJvcl9vdXRsaW5lIGUwMDFcbmV1cm9fc3ltYm9sIGU5MjZcbmV2X3N0YXRpb24gZTU2ZFxuZXZlbnQgZTg3OFxuZXZlbnRfYXZhaWxhYmxlIGU2MTRcbmV2ZW50X2J1c3kgZTYxNVxuZXZlbnRfbm90ZSBlNjE2XG5ldmVudF9zZWF0IGU5MDNcbmV4aXRfdG9fYXBwIGU4NzlcbmV4cGFuZF9sZXNzIGU1Y2VcbmV4cGFuZF9tb3JlIGU1Y2ZcbmV4cGxpY2l0IGUwMWVcbmV4cGxvcmUgZTg3YVxuZXhwb3N1cmUgZTNjYVxuZXhwb3N1cmVfbmVnXzEgZTNjYlxuZXhwb3N1cmVfbmVnXzIgZTNjY1xuZXhwb3N1cmVfcGx1c18xIGUzY2RcbmV4cG9zdXJlX3BsdXNfMiBlM2NlXG5leHBvc3VyZV96ZXJvIGUzY2ZcbmV4dGVuc2lvbiBlODdiXG5mYWNlIGU4N2NcbmZhc3RfZm9yd2FyZCBlMDFmXG5mYXN0X3Jld2luZCBlMDIwXG5mYXZvcml0ZSBlODdkXG5mYXZvcml0ZV9ib3JkZXIgZTg3ZVxuZmVhdHVyZWRfcGxheV9saXN0IGUwNmRcbmZlYXR1cmVkX3ZpZGVvIGUwNmVcbmZlZWRiYWNrIGU4N2ZcbmZpYmVyX2R2ciBlMDVkXG5maWJlcl9tYW51YWxfcmVjb3JkIGUwNjFcbmZpYmVyX25ldyBlMDVlXG5maWJlcl9waW4gZTA2YVxuZmliZXJfc21hcnRfcmVjb3JkIGUwNjJcbmZpbGVfZG93bmxvYWQgZTJjNFxuZmlsZV91cGxvYWQgZTJjNlxuZmlsdGVyIGUzZDNcbmZpbHRlcl8xIGUzZDBcbmZpbHRlcl8yIGUzZDFcbmZpbHRlcl8zIGUzZDJcbmZpbHRlcl80IGUzZDRcbmZpbHRlcl81IGUzZDVcbmZpbHRlcl82IGUzZDZcbmZpbHRlcl83IGUzZDdcbmZpbHRlcl84IGUzZDhcbmZpbHRlcl85IGUzZDlcbmZpbHRlcl85X3BsdXMgZTNkYVxuZmlsdGVyX2JfYW5kX3cgZTNkYlxuZmlsdGVyX2NlbnRlcl9mb2N1cyBlM2RjXG5maWx0ZXJfZHJhbWEgZTNkZFxuZmlsdGVyX2ZyYW1lcyBlM2RlXG5maWx0ZXJfaGRyIGUzZGZcbmZpbHRlcl9saXN0IGUxNTJcbmZpbHRlcl9ub25lIGUzZTBcbmZpbHRlcl90aWx0X3NoaWZ0IGUzZTJcbmZpbHRlcl92aW50YWdlIGUzZTNcbmZpbmRfaW5fcGFnZSBlODgwXG5maW5kX3JlcGxhY2UgZTg4MVxuZmluZ2VycHJpbnQgZTkwZFxuZmlyc3RfcGFnZSBlNWRjXG5maXRuZXNzX2NlbnRlciBlYjQzXG5mbGFnIGUxNTNcbmZsYXJlIGUzZTRcbmZsYXNoX2F1dG8gZTNlNVxuZmxhc2hfb2ZmIGUzZTZcbmZsYXNoX29uIGUzZTdcbmZsaWdodCBlNTM5XG5mbGlnaHRfbGFuZCBlOTA0XG5mbGlnaHRfdGFrZW9mZiBlOTA1XG5mbGlwIGUzZThcbmZsaXBfdG9fYmFjayBlODgyXG5mbGlwX3RvX2Zyb250IGU4ODNcbmZvbGRlciBlMmM3XG5mb2xkZXJfb3BlbiBlMmM4XG5mb2xkZXJfc2hhcmVkIGUyYzlcbmZvbGRlcl9zcGVjaWFsIGU2MTdcbmZvbnRfZG93bmxvYWQgZTE2N1xuZm9ybWF0X2FsaWduX2NlbnRlciBlMjM0XG5mb3JtYXRfYWxpZ25fanVzdGlmeSBlMjM1XG5mb3JtYXRfYWxpZ25fbGVmdCBlMjM2XG5mb3JtYXRfYWxpZ25fcmlnaHQgZTIzN1xuZm9ybWF0X2JvbGQgZTIzOFxuZm9ybWF0X2NsZWFyIGUyMzlcbmZvcm1hdF9jb2xvcl9maWxsIGUyM2FcbmZvcm1hdF9jb2xvcl9yZXNldCBlMjNiXG5mb3JtYXRfY29sb3JfdGV4dCBlMjNjXG5mb3JtYXRfaW5kZW50X2RlY3JlYXNlIGUyM2RcbmZvcm1hdF9pbmRlbnRfaW5jcmVhc2UgZTIzZVxuZm9ybWF0X2l0YWxpYyBlMjNmXG5mb3JtYXRfbGluZV9zcGFjaW5nIGUyNDBcbmZvcm1hdF9saXN0X2J1bGxldGVkIGUyNDFcbmZvcm1hdF9saXN0X251bWJlcmVkIGUyNDJcbmZvcm1hdF9wYWludCBlMjQzXG5mb3JtYXRfcXVvdGUgZTI0NFxuZm9ybWF0X3NoYXBlcyBlMjVlXG5mb3JtYXRfc2l6ZSBlMjQ1XG5mb3JtYXRfc3RyaWtldGhyb3VnaCBlMjQ2XG5mb3JtYXRfdGV4dGRpcmVjdGlvbl9sX3RvX3IgZTI0N1xuZm9ybWF0X3RleHRkaXJlY3Rpb25fcl90b19sIGUyNDhcbmZvcm1hdF91bmRlcmxpbmVkIGUyNDlcbmZvcnVtIGUwYmZcbmZvcndhcmQgZTE1NFxuZm9yd2FyZF8xMCBlMDU2XG5mb3J3YXJkXzMwIGUwNTdcbmZvcndhcmRfNSBlMDU4XG5mcmVlX2JyZWFrZmFzdCBlYjQ0XG5mdWxsc2NyZWVuIGU1ZDBcbmZ1bGxzY3JlZW5fZXhpdCBlNWQxXG5mdW5jdGlvbnMgZTI0YVxuZ190cmFuc2xhdGUgZTkyN1xuZ2FtZXBhZCBlMzBmXG5nYW1lcyBlMDIxXG5nYXZlbCBlOTBlXG5nZXN0dXJlIGUxNTVcbmdldF9hcHAgZTg4NFxuZ2lmIGU5MDhcbmdvbGZfY291cnNlIGViNDVcbmdwc19maXhlZCBlMWIzXG5ncHNfbm90X2ZpeGVkIGUxYjRcbmdwc19vZmYgZTFiNVxuZ3JhZGUgZTg4NVxuZ3JhZGllbnQgZTNlOVxuZ3JhaW4gZTNlYVxuZ3JhcGhpY19lcSBlMWI4XG5ncmlkX29mZiBlM2ViXG5ncmlkX29uIGUzZWNcbmdyb3VwIGU3ZWZcbmdyb3VwX2FkZCBlN2YwXG5ncm91cF93b3JrIGU4ODZcbmhkIGUwNTJcbmhkcl9vZmYgZTNlZFxuaGRyX29uIGUzZWVcbmhkcl9zdHJvbmcgZTNmMVxuaGRyX3dlYWsgZTNmMlxuaGVhZHNldCBlMzEwXG5oZWFkc2V0X21pYyBlMzExXG5oZWFsaW5nIGUzZjNcbmhlYXJpbmcgZTAyM1xuaGVscCBlODg3XG5oZWxwX291dGxpbmUgZThmZFxuaGlnaF9xdWFsaXR5IGUwMjRcbmhpZ2hsaWdodCBlMjVmXG5oaWdobGlnaHRfb2ZmIGU4ODhcbmhpc3RvcnkgZTg4OVxuaG9tZSBlODhhXG5ob3RfdHViIGViNDZcbmhvdGVsIGU1M2FcbmhvdXJnbGFzc19lbXB0eSBlODhiXG5ob3VyZ2xhc3NfZnVsbCBlODhjXG5odHRwIGU5MDJcbmh0dHBzIGU4OGRcbmltYWdlIGUzZjRcbmltYWdlX2FzcGVjdF9yYXRpbyBlM2Y1XG5pbXBvcnRfY29udGFjdHMgZTBlMFxuaW1wb3J0X2V4cG9ydCBlMGMzXG5pbXBvcnRhbnRfZGV2aWNlcyBlOTEyXG5pbmJveCBlMTU2XG5pbmRldGVybWluYXRlX2NoZWNrX2JveCBlOTA5XG5pbmZvIGU4OGVcbmluZm9fb3V0bGluZSBlODhmXG5pbnB1dCBlODkwXG5pbnNlcnRfY2hhcnQgZTI0YlxuaW5zZXJ0X2NvbW1lbnQgZTI0Y1xuaW5zZXJ0X2RyaXZlX2ZpbGUgZTI0ZFxuaW5zZXJ0X2Vtb3RpY29uIGUyNGVcbmluc2VydF9pbnZpdGF0aW9uIGUyNGZcbmluc2VydF9saW5rIGUyNTBcbmluc2VydF9waG90byBlMjUxXG5pbnZlcnRfY29sb3JzIGU4OTFcbmludmVydF9jb2xvcnNfb2ZmIGUwYzRcbmlzbyBlM2Y2XG5rZXlib2FyZCBlMzEyXG5rZXlib2FyZF9hcnJvd19kb3duIGUzMTNcbmtleWJvYXJkX2Fycm93X2xlZnQgZTMxNFxua2V5Ym9hcmRfYXJyb3dfcmlnaHQgZTMxNVxua2V5Ym9hcmRfYXJyb3dfdXAgZTMxNlxua2V5Ym9hcmRfYmFja3NwYWNlIGUzMTdcbmtleWJvYXJkX2NhcHNsb2NrIGUzMThcbmtleWJvYXJkX2hpZGUgZTMxYVxua2V5Ym9hcmRfcmV0dXJuIGUzMWJcbmtleWJvYXJkX3RhYiBlMzFjXG5rZXlib2FyZF92b2ljZSBlMzFkXG5raXRjaGVuIGViNDdcbmxhYmVsIGU4OTJcbmxhYmVsX291dGxpbmUgZTg5M1xubGFuZHNjYXBlIGUzZjdcbmxhbmd1YWdlIGU4OTRcbmxhcHRvcCBlMzFlXG5sYXB0b3BfY2hyb21lYm9vayBlMzFmXG5sYXB0b3BfbWFjIGUzMjBcbmxhcHRvcF93aW5kb3dzIGUzMjFcbmxhc3RfcGFnZSBlNWRkXG5sYXVuY2ggZTg5NVxubGF5ZXJzIGU1M2JcbmxheWVyc19jbGVhciBlNTNjXG5sZWFrX2FkZCBlM2Y4XG5sZWFrX3JlbW92ZSBlM2Y5XG5sZW5zIGUzZmFcbmxpYnJhcnlfYWRkIGUwMmVcbmxpYnJhcnlfYm9va3MgZTAyZlxubGlicmFyeV9tdXNpYyBlMDMwXG5saWdodGJ1bGJfb3V0bGluZSBlOTBmXG5saW5lX3N0eWxlIGU5MTlcbmxpbmVfd2VpZ2h0IGU5MWFcbmxpbmVhcl9zY2FsZSBlMjYwXG5saW5rIGUxNTdcbmxpbmtlZF9jYW1lcmEgZTQzOFxubGlzdCBlODk2XG5saXZlX2hlbHAgZTBjNlxubGl2ZV90diBlNjM5XG5sb2NhbF9hY3Rpdml0eSBlNTNmXG5sb2NhbF9haXJwb3J0IGU1M2RcbmxvY2FsX2F0bSBlNTNlXG5sb2NhbF9iYXIgZTU0MFxubG9jYWxfY2FmZSBlNTQxXG5sb2NhbF9jYXJfd2FzaCBlNTQyXG5sb2NhbF9jb252ZW5pZW5jZV9zdG9yZSBlNTQzXG5sb2NhbF9kaW5pbmcgZTU1NlxubG9jYWxfZHJpbmsgZTU0NFxubG9jYWxfZmxvcmlzdCBlNTQ1XG5sb2NhbF9nYXNfc3RhdGlvbiBlNTQ2XG5sb2NhbF9ncm9jZXJ5X3N0b3JlIGU1NDdcbmxvY2FsX2hvc3BpdGFsIGU1NDhcbmxvY2FsX2hvdGVsIGU1NDlcbmxvY2FsX2xhdW5kcnlfc2VydmljZSBlNTRhXG5sb2NhbF9saWJyYXJ5IGU1NGJcbmxvY2FsX21hbGwgZTU0Y1xubG9jYWxfbW92aWVzIGU1NGRcbmxvY2FsX29mZmVyIGU1NGVcbmxvY2FsX3BhcmtpbmcgZTU0ZlxubG9jYWxfcGhhcm1hY3kgZTU1MFxubG9jYWxfcGhvbmUgZTU1MVxubG9jYWxfcGl6emEgZTU1MlxubG9jYWxfcGxheSBlNTUzXG5sb2NhbF9wb3N0X29mZmljZSBlNTU0XG5sb2NhbF9wcmludHNob3AgZTU1NVxubG9jYWxfc2VlIGU1NTdcbmxvY2FsX3NoaXBwaW5nIGU1NThcbmxvY2FsX3RheGkgZTU1OVxubG9jYXRpb25fY2l0eSBlN2YxXG5sb2NhdGlvbl9kaXNhYmxlZCBlMWI2XG5sb2NhdGlvbl9vZmYgZTBjN1xubG9jYXRpb25fb24gZTBjOFxubG9jYXRpb25fc2VhcmNoaW5nIGUxYjdcbmxvY2sgZTg5N1xubG9ja19vcGVuIGU4OThcbmxvY2tfb3V0bGluZSBlODk5XG5sb29rcyBlM2ZjXG5sb29rc18zIGUzZmJcbmxvb2tzXzQgZTNmZFxubG9va3NfNSBlM2ZlXG5sb29rc182IGUzZmZcbmxvb2tzX29uZSBlNDAwXG5sb29rc190d28gZTQwMVxubG9vcCBlMDI4XG5sb3VwZSBlNDAyXG5sb3dfcHJpb3JpdHkgZTE2ZFxubG95YWx0eSBlODlhXG5tYWlsIGUxNThcbm1haWxfb3V0bGluZSBlMGUxXG5tYXAgZTU1YlxubWFya3VucmVhZCBlMTU5XG5tYXJrdW5yZWFkX21haWxib3ggZTg5YlxubWVtb3J5IGUzMjJcbm1lbnUgZTVkMlxubWVyZ2VfdHlwZSBlMjUyXG5tZXNzYWdlIGUwYzlcbm1pYyBlMDI5XG5taWNfbm9uZSBlMDJhXG5taWNfb2ZmIGUwMmJcbm1tcyBlNjE4XG5tb2RlX2NvbW1lbnQgZTI1M1xubW9kZV9lZGl0IGUyNTRcbm1vbmV0aXphdGlvbl9vbiBlMjYzXG5tb25leV9vZmYgZTI1Y1xubW9ub2Nocm9tZV9waG90b3MgZTQwM1xubW9vZCBlN2YyXG5tb29kX2JhZCBlN2YzXG5tb3JlIGU2MTlcbm1vcmVfaG9yaXogZTVkM1xubW9yZV92ZXJ0IGU1ZDRcbm1vdG9yY3ljbGUgZTkxYlxubW91c2UgZTMyM1xubW92ZV90b19pbmJveCBlMTY4XG5tb3ZpZSBlMDJjXG5tb3ZpZV9jcmVhdGlvbiBlNDA0XG5tb3ZpZV9maWx0ZXIgZTQzYVxubXVsdGlsaW5lX2NoYXJ0IGU2ZGZcbm11c2ljX25vdGUgZTQwNVxubXVzaWNfdmlkZW8gZTA2M1xubXlfbG9jYXRpb24gZTU1Y1xubmF0dXJlIGU0MDZcbm5hdHVyZV9wZW9wbGUgZTQwN1xubmF2aWdhdGVfYmVmb3JlIGU0MDhcbm5hdmlnYXRlX25leHQgZTQwOVxubmF2aWdhdGlvbiBlNTVkXG5uZWFyX21lIGU1Njlcbm5ldHdvcmtfY2VsbCBlMWI5XG5uZXR3b3JrX2NoZWNrIGU2NDBcbm5ldHdvcmtfbG9ja2VkIGU2MWFcbm5ldHdvcmtfd2lmaSBlMWJhXG5uZXdfcmVsZWFzZXMgZTAzMVxubmV4dF93ZWVrIGUxNmFcbm5mYyBlMWJiXG5ub19lbmNyeXB0aW9uIGU2NDFcbm5vX3NpbSBlMGNjXG5ub3RfaW50ZXJlc3RlZCBlMDMzXG5ub3RlIGUwNmZcbm5vdGVfYWRkIGU4OWNcbm5vdGlmaWNhdGlvbnMgZTdmNFxubm90aWZpY2F0aW9uc19hY3RpdmUgZTdmN1xubm90aWZpY2F0aW9uc19ub25lIGU3ZjVcbm5vdGlmaWNhdGlvbnNfb2ZmIGU3ZjZcbm5vdGlmaWNhdGlvbnNfcGF1c2VkIGU3Zjhcbm9mZmxpbmVfcGluIGU5MGFcbm9uZGVtYW5kX3ZpZGVvIGU2M2Fcbm9wYWNpdHkgZTkxY1xub3Blbl9pbl9icm93c2VyIGU4OWRcbm9wZW5faW5fbmV3IGU4OWVcbm9wZW5fd2l0aCBlODlmXG5wYWdlcyBlN2Y5XG5wYWdldmlldyBlOGEwXG5wYWxldHRlIGU0MGFcbnBhbl90b29sIGU5MjVcbnBhbm9yYW1hIGU0MGJcbnBhbm9yYW1hX2Zpc2hfZXllIGU0MGNcbnBhbm9yYW1hX2hvcml6b250YWwgZTQwZFxucGFub3JhbWFfdmVydGljYWwgZTQwZVxucGFub3JhbWFfd2lkZV9hbmdsZSBlNDBmXG5wYXJ0eV9tb2RlIGU3ZmFcbnBhdXNlIGUwMzRcbnBhdXNlX2NpcmNsZV9maWxsZWQgZTAzNVxucGF1c2VfY2lyY2xlX291dGxpbmUgZTAzNlxucGF5bWVudCBlOGExXG5wZW9wbGUgZTdmYlxucGVvcGxlX291dGxpbmUgZTdmY1xucGVybV9jYW1lcmFfbWljIGU4YTJcbnBlcm1fY29udGFjdF9jYWxlbmRhciBlOGEzXG5wZXJtX2RhdGFfc2V0dGluZyBlOGE0XG5wZXJtX2RldmljZV9pbmZvcm1hdGlvbiBlOGE1XG5wZXJtX2lkZW50aXR5IGU4YTZcbnBlcm1fbWVkaWEgZThhN1xucGVybV9waG9uZV9tc2cgZThhOFxucGVybV9zY2FuX3dpZmkgZThhOVxucGVyc29uIGU3ZmRcbnBlcnNvbl9hZGQgZTdmZVxucGVyc29uX291dGxpbmUgZTdmZlxucGVyc29uX3BpbiBlNTVhXG5wZXJzb25fcGluX2NpcmNsZSBlNTZhXG5wZXJzb25hbF92aWRlbyBlNjNiXG5wZXRzIGU5MWRcbnBob25lIGUwY2RcbnBob25lX2FuZHJvaWQgZTMyNFxucGhvbmVfYmx1ZXRvb3RoX3NwZWFrZXIgZTYxYlxucGhvbmVfZm9yd2FyZGVkIGU2MWNcbnBob25lX2luX3RhbGsgZTYxZFxucGhvbmVfaXBob25lIGUzMjVcbnBob25lX2xvY2tlZCBlNjFlXG5waG9uZV9taXNzZWQgZTYxZlxucGhvbmVfcGF1c2VkIGU2MjBcbnBob25lbGluayBlMzI2XG5waG9uZWxpbmtfZXJhc2UgZTBkYlxucGhvbmVsaW5rX2xvY2sgZTBkY1xucGhvbmVsaW5rX29mZiBlMzI3XG5waG9uZWxpbmtfcmluZyBlMGRkXG5waG9uZWxpbmtfc2V0dXAgZTBkZVxucGhvdG8gZTQxMFxucGhvdG9fYWxidW0gZTQxMVxucGhvdG9fY2FtZXJhIGU0MTJcbnBob3RvX2ZpbHRlciBlNDNiXG5waG90b19saWJyYXJ5IGU0MTNcbnBob3RvX3NpemVfc2VsZWN0X2FjdHVhbCBlNDMyXG5waG90b19zaXplX3NlbGVjdF9sYXJnZSBlNDMzXG5waG90b19zaXplX3NlbGVjdF9zbWFsbCBlNDM0XG5waWN0dXJlX2FzX3BkZiBlNDE1XG5waWN0dXJlX2luX3BpY3R1cmUgZThhYVxucGljdHVyZV9pbl9waWN0dXJlX2FsdCBlOTExXG5waWVfY2hhcnQgZTZjNFxucGllX2NoYXJ0X291dGxpbmVkIGU2YzVcbnBpbl9kcm9wIGU1NWVcbnBsYWNlIGU1NWZcbnBsYXlfYXJyb3cgZTAzN1xucGxheV9jaXJjbGVfZmlsbGVkIGUwMzhcbnBsYXlfY2lyY2xlX291dGxpbmUgZTAzOVxucGxheV9mb3Jfd29yayBlOTA2XG5wbGF5bGlzdF9hZGQgZTAzYlxucGxheWxpc3RfYWRkX2NoZWNrIGUwNjVcbnBsYXlsaXN0X3BsYXkgZTA1ZlxucGx1c19vbmUgZTgwMFxucG9sbCBlODAxXG5wb2x5bWVyIGU4YWJcbnBvb2wgZWI0OFxucG9ydGFibGVfd2lmaV9vZmYgZTBjZVxucG9ydHJhaXQgZTQxNlxucG93ZXIgZTYzY1xucG93ZXJfaW5wdXQgZTMzNlxucG93ZXJfc2V0dGluZ3NfbmV3IGU4YWNcbnByZWduYW50X3dvbWFuIGU5MWVcbnByZXNlbnRfdG9fYWxsIGUwZGZcbnByaW50IGU4YWRcbnByaW9yaXR5X2hpZ2ggZTY0NVxucHVibGljIGU4MGJcbnB1Ymxpc2ggZTI1NVxucXVlcnlfYnVpbGRlciBlOGFlXG5xdWVzdGlvbl9hbnN3ZXIgZThhZlxucXVldWUgZTAzY1xucXVldWVfbXVzaWMgZTAzZFxucXVldWVfcGxheV9uZXh0IGUwNjZcbnJhZGlvIGUwM2VcbnJhZGlvX2J1dHRvbl9jaGVja2VkIGU4MzdcbnJhZGlvX2J1dHRvbl91bmNoZWNrZWQgZTgzNlxucmF0ZV9yZXZpZXcgZTU2MFxucmVjZWlwdCBlOGIwXG5yZWNlbnRfYWN0b3JzIGUwM2ZcbnJlY29yZF92b2ljZV9vdmVyIGU5MWZcbnJlZGVlbSBlOGIxXG5yZWRvIGUxNWFcbnJlZnJlc2ggZTVkNVxucmVtb3ZlIGUxNWJcbnJlbW92ZV9jaXJjbGUgZTE1Y1xucmVtb3ZlX2NpcmNsZV9vdXRsaW5lIGUxNWRcbnJlbW92ZV9mcm9tX3F1ZXVlIGUwNjdcbnJlbW92ZV9yZWRfZXllIGU0MTdcbnJlbW92ZV9zaG9wcGluZ19jYXJ0IGU5MjhcbnJlb3JkZXIgZThmZVxucmVwZWF0IGUwNDBcbnJlcGVhdF9vbmUgZTA0MVxucmVwbGF5IGUwNDJcbnJlcGxheV8xMCBlMDU5XG5yZXBsYXlfMzAgZTA1YVxucmVwbGF5XzUgZTA1YlxucmVwbHkgZTE1ZVxucmVwbHlfYWxsIGUxNWZcbnJlcG9ydCBlMTYwXG5yZXBvcnRfcHJvYmxlbSBlOGIyXG5yZXN0YXVyYW50IGU1NmNcbnJlc3RhdXJhbnRfbWVudSBlNTYxXG5yZXN0b3JlIGU4YjNcbnJlc3RvcmVfcGFnZSBlOTI5XG5yaW5nX3ZvbHVtZSBlMGQxXG5yb29tIGU4YjRcbnJvb21fc2VydmljZSBlYjQ5XG5yb3RhdGVfOTBfZGVncmVlc19jY3cgZTQxOFxucm90YXRlX2xlZnQgZTQxOVxucm90YXRlX3JpZ2h0IGU0MWFcbnJvdW5kZWRfY29ybmVyIGU5MjBcbnJvdXRlciBlMzI4XG5yb3dpbmcgZTkyMVxucnNzX2ZlZWQgZTBlNVxucnZfaG9va3VwIGU2NDJcbnNhdGVsbGl0ZSBlNTYyXG5zYXZlIGUxNjFcbnNjYW5uZXIgZTMyOVxuc2NoZWR1bGUgZThiNVxuc2Nob29sIGU4MGNcbnNjcmVlbl9sb2NrX2xhbmRzY2FwZSBlMWJlXG5zY3JlZW5fbG9ja19wb3J0cmFpdCBlMWJmXG5zY3JlZW5fbG9ja19yb3RhdGlvbiBlMWMwXG5zY3JlZW5fcm90YXRpb24gZTFjMVxuc2NyZWVuX3NoYXJlIGUwZTJcbnNkX2NhcmQgZTYyM1xuc2Rfc3RvcmFnZSBlMWMyXG5zZWFyY2ggZThiNlxuc2VjdXJpdHkgZTMyYVxuc2VsZWN0X2FsbCBlMTYyXG5zZW5kIGUxNjNcbnNlbnRpbWVudF9kaXNzYXRpc2ZpZWQgZTgxMVxuc2VudGltZW50X25ldXRyYWwgZTgxMlxuc2VudGltZW50X3NhdGlzZmllZCBlODEzXG5zZW50aW1lbnRfdmVyeV9kaXNzYXRpc2ZpZWQgZTgxNFxuc2VudGltZW50X3Zlcnlfc2F0aXNmaWVkIGU4MTVcbnNldHRpbmdzIGU4YjhcbnNldHRpbmdzX2FwcGxpY2F0aW9ucyBlOGI5XG5zZXR0aW5nc19iYWNrdXBfcmVzdG9yZSBlOGJhXG5zZXR0aW5nc19ibHVldG9vdGggZThiYlxuc2V0dGluZ3NfYnJpZ2h0bmVzcyBlOGJkXG5zZXR0aW5nc19jZWxsIGU4YmNcbnNldHRpbmdzX2V0aGVybmV0IGU4YmVcbnNldHRpbmdzX2lucHV0X2FudGVubmEgZThiZlxuc2V0dGluZ3NfaW5wdXRfY29tcG9uZW50IGU4YzBcbnNldHRpbmdzX2lucHV0X2NvbXBvc2l0ZSBlOGMxXG5zZXR0aW5nc19pbnB1dF9oZG1pIGU4YzJcbnNldHRpbmdzX2lucHV0X3N2aWRlbyBlOGMzXG5zZXR0aW5nc19vdmVyc2NhbiBlOGM0XG5zZXR0aW5nc19waG9uZSBlOGM1XG5zZXR0aW5nc19wb3dlciBlOGM2XG5zZXR0aW5nc19yZW1vdGUgZThjN1xuc2V0dGluZ3Nfc3lzdGVtX2RheWRyZWFtIGUxYzNcbnNldHRpbmdzX3ZvaWNlIGU4YzhcbnNoYXJlIGU4MGRcbnNob3AgZThjOVxuc2hvcF90d28gZThjYVxuc2hvcHBpbmdfYmFza2V0IGU4Y2JcbnNob3BwaW5nX2NhcnQgZThjY1xuc2hvcnRfdGV4dCBlMjYxXG5zaG93X2NoYXJ0IGU2ZTFcbnNodWZmbGUgZTA0M1xuc2lnbmFsX2NlbGx1bGFyXzRfYmFyIGUxYzhcbnNpZ25hbF9jZWxsdWxhcl9jb25uZWN0ZWRfbm9faW50ZXJuZXRfNF9iYXIgZTFjZFxuc2lnbmFsX2NlbGx1bGFyX25vX3NpbSBlMWNlXG5zaWduYWxfY2VsbHVsYXJfbnVsbCBlMWNmXG5zaWduYWxfY2VsbHVsYXJfb2ZmIGUxZDBcbnNpZ25hbF93aWZpXzRfYmFyIGUxZDhcbnNpZ25hbF93aWZpXzRfYmFyX2xvY2sgZTFkOVxuc2lnbmFsX3dpZmlfb2ZmIGUxZGFcbnNpbV9jYXJkIGUzMmJcbnNpbV9jYXJkX2FsZXJ0IGU2MjRcbnNraXBfbmV4dCBlMDQ0XG5za2lwX3ByZXZpb3VzIGUwNDVcbnNsaWRlc2hvdyBlNDFiXG5zbG93X21vdGlvbl92aWRlbyBlMDY4XG5zbWFydHBob25lIGUzMmNcbnNtb2tlX2ZyZWUgZWI0YVxuc21va2luZ19yb29tcyBlYjRiXG5zbXMgZTYyNVxuc21zX2ZhaWxlZCBlNjI2XG5zbm9vemUgZTA0Nlxuc29ydCBlMTY0XG5zb3J0X2J5X2FscGhhIGUwNTNcbnNwYSBlYjRjXG5zcGFjZV9iYXIgZTI1Nlxuc3BlYWtlciBlMzJkXG5zcGVha2VyX2dyb3VwIGUzMmVcbnNwZWFrZXJfbm90ZXMgZThjZFxuc3BlYWtlcl9ub3Rlc19vZmYgZTkyYVxuc3BlYWtlcl9waG9uZSBlMGQyXG5zcGVsbGNoZWNrIGU4Y2VcbnN0YXIgZTgzOFxuc3Rhcl9ib3JkZXIgZTgzYVxuc3Rhcl9oYWxmIGU4MzlcbnN0YXJzIGU4ZDBcbnN0YXlfY3VycmVudF9sYW5kc2NhcGUgZTBkM1xuc3RheV9jdXJyZW50X3BvcnRyYWl0IGUwZDRcbnN0YXlfcHJpbWFyeV9sYW5kc2NhcGUgZTBkNVxuc3RheV9wcmltYXJ5X3BvcnRyYWl0IGUwZDZcbnN0b3AgZTA0N1xuc3RvcF9zY3JlZW5fc2hhcmUgZTBlM1xuc3RvcmFnZSBlMWRiXG5zdG9yZSBlOGQxXG5zdG9yZV9tYWxsX2RpcmVjdG9yeSBlNTYzXG5zdHJhaWdodGVuIGU0MWNcbnN0cmVldHZpZXcgZTU2ZVxuc3RyaWtldGhyb3VnaF9zIGUyNTdcbnN0eWxlIGU0MWRcbnN1YmRpcmVjdG9yeV9hcnJvd19sZWZ0IGU1ZDlcbnN1YmRpcmVjdG9yeV9hcnJvd19yaWdodCBlNWRhXG5zdWJqZWN0IGU4ZDJcbnN1YnNjcmlwdGlvbnMgZTA2NFxuc3VidGl0bGVzIGUwNDhcbnN1YndheSBlNTZmXG5zdXBlcnZpc29yX2FjY291bnQgZThkM1xuc3Vycm91bmRfc291bmQgZTA0OVxuc3dhcF9jYWxscyBlMGQ3XG5zd2FwX2hvcml6IGU4ZDRcbnN3YXBfdmVydCBlOGQ1XG5zd2FwX3ZlcnRpY2FsX2NpcmNsZSBlOGQ2XG5zd2l0Y2hfY2FtZXJhIGU0MWVcbnN3aXRjaF92aWRlbyBlNDFmXG5zeW5jIGU2MjdcbnN5bmNfZGlzYWJsZWQgZTYyOFxuc3luY19wcm9ibGVtIGU2MjlcbnN5c3RlbV91cGRhdGUgZTYyYVxuc3lzdGVtX3VwZGF0ZV9hbHQgZThkN1xudGFiIGU4ZDhcbnRhYl91bnNlbGVjdGVkIGU4ZDlcbnRhYmxldCBlMzJmXG50YWJsZXRfYW5kcm9pZCBlMzMwXG50YWJsZXRfbWFjIGUzMzFcbnRhZ19mYWNlcyBlNDIwXG50YXBfYW5kX3BsYXkgZTYyYlxudGVycmFpbiBlNTY0XG50ZXh0X2ZpZWxkcyBlMjYyXG50ZXh0X2Zvcm1hdCBlMTY1XG50ZXh0c21zIGUwZDhcbnRleHR1cmUgZTQyMVxudGhlYXRlcnMgZThkYVxudGh1bWJfZG93biBlOGRiXG50aHVtYl91cCBlOGRjXG50aHVtYnNfdXBfZG93biBlOGRkXG50aW1lX3RvX2xlYXZlIGU2MmNcbnRpbWVsYXBzZSBlNDIyXG50aW1lbGluZSBlOTIyXG50aW1lciBlNDI1XG50aW1lcl8xMCBlNDIzXG50aW1lcl8zIGU0MjRcbnRpbWVyX29mZiBlNDI2XG50aXRsZSBlMjY0XG50b2MgZThkZVxudG9kYXkgZThkZlxudG9sbCBlOGUwXG50b25hbGl0eSBlNDI3XG50b3VjaF9hcHAgZTkxM1xudG95cyBlMzMyXG50cmFja19jaGFuZ2VzIGU4ZTFcbnRyYWZmaWMgZTU2NVxudHJhaW4gZTU3MFxudHJhbSBlNTcxXG50cmFuc2Zlcl93aXRoaW5fYV9zdGF0aW9uIGU1NzJcbnRyYW5zZm9ybSBlNDI4XG50cmFuc2xhdGUgZThlMlxudHJlbmRpbmdfZG93biBlOGUzXG50cmVuZGluZ19mbGF0IGU4ZTRcbnRyZW5kaW5nX3VwIGU4ZTVcbnR1bmUgZTQyOVxudHVybmVkX2luIGU4ZTZcbnR1cm5lZF9pbl9ub3QgZThlN1xudHYgZTMzM1xudW5hcmNoaXZlIGUxNjlcbnVuZG8gZTE2NlxudW5mb2xkX2xlc3MgZTVkNlxudW5mb2xkX21vcmUgZTVkN1xudXBkYXRlIGU5MjNcbnVzYiBlMWUwXG52ZXJpZmllZF91c2VyIGU4ZThcbnZlcnRpY2FsX2FsaWduX2JvdHRvbSBlMjU4XG52ZXJ0aWNhbF9hbGlnbl9jZW50ZXIgZTI1OVxudmVydGljYWxfYWxpZ25fdG9wIGUyNWFcbnZpYnJhdGlvbiBlNjJkXG52aWRlb19jYWxsIGUwNzBcbnZpZGVvX2xhYmVsIGUwNzFcbnZpZGVvX2xpYnJhcnkgZTA0YVxudmlkZW9jYW0gZTA0YlxudmlkZW9jYW1fb2ZmIGUwNGNcbnZpZGVvZ2FtZV9hc3NldCBlMzM4XG52aWV3X2FnZW5kYSBlOGU5XG52aWV3X2FycmF5IGU4ZWFcbnZpZXdfY2Fyb3VzZWwgZThlYlxudmlld19jb2x1bW4gZThlY1xudmlld19jb21meSBlNDJhXG52aWV3X2NvbXBhY3QgZTQyYlxudmlld19kYXkgZThlZFxudmlld19oZWFkbGluZSBlOGVlXG52aWV3X2xpc3QgZThlZlxudmlld19tb2R1bGUgZThmMFxudmlld19xdWlsdCBlOGYxXG52aWV3X3N0cmVhbSBlOGYyXG52aWV3X3dlZWsgZThmM1xudmlnbmV0dGUgZTQzNVxudmlzaWJpbGl0eSBlOGY0XG52aXNpYmlsaXR5X29mZiBlOGY1XG52b2ljZV9jaGF0IGU2MmVcbnZvaWNlbWFpbCBlMGQ5XG52b2x1bWVfZG93biBlMDRkXG52b2x1bWVfbXV0ZSBlMDRlXG52b2x1bWVfb2ZmIGUwNGZcbnZvbHVtZV91cCBlMDUwXG52cG5fa2V5IGUwZGFcbnZwbl9sb2NrIGU2MmZcbndhbGxwYXBlciBlMWJjXG53YXJuaW5nIGUwMDJcbndhdGNoIGUzMzRcbndhdGNoX2xhdGVyIGU5MjRcbndiX2F1dG8gZTQyY1xud2JfY2xvdWR5IGU0MmRcbndiX2luY2FuZGVzY2VudCBlNDJlXG53Yl9pcmlkZXNjZW50IGU0MzZcbndiX3N1bm55IGU0MzBcbndjIGU2M2RcbndlYiBlMDUxXG53ZWJfYXNzZXQgZTA2OVxud2Vla2VuZCBlMTZiXG53aGF0c2hvdCBlODBlXG53aWRnZXRzIGUxYmRcbndpZmkgZTYzZVxud2lmaV9sb2NrIGUxZTFcbndpZmlfdGV0aGVyaW5nIGUxZTJcbndvcmsgZThmOVxud3JhcF90ZXh0IGUyNWJcbnlvdXR1YmVfc2VhcmNoZWRfZm9yIGU4ZmFcbnpvb21faW4gZThmZlxuem9vbV9vdXQgZTkwMFxuem9vbV9vdXRfbWFwIGU1NmJcbmA7XG5cbmxldCBjb2RlcG9pbnRzID0gcy50cmltKCkuc3BsaXQoXCJcXG5cIikucmVkdWNlKGZ1bmN0aW9uKGN2LCBudil7XG4gICAgbGV0IHBhcnRzID0gbnYuc3BsaXQoLyArLyk7XG4gICAgbGV0IHVjID0gJ1xcXFx1JyArIHBhcnRzWzFdO1xuICAgIGN2W3BhcnRzWzBdXSA9IGV2YWwoJ1wiJyArIHVjICsgJ1wiJyk7XG4gICAgcmV0dXJuIGN2O1xufSwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb2RlcG9pbnRzXG59XG5cblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBlc2MsIGRlZXBjLCBvYmoyYXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuXG4vLyBBZGQgZGlyZWN0IGNyb3NzIHJlZmVyZW5jZXMgdG8gbmFtZWQgdHlwZXMuIChFLmcuLCB3aGVyZSB0aGVcbi8vIG1vZGVsIHNheXMgdGhhdCBHZW5lLmFsbGVsZXMgaXMgYSBjb2xsZWN0aW9uIHdob3NlIHJlZmVyZW5jZWRUeXBlXG4vLyBpcyB0aGUgc3RyaW5nIFwiQWxsZWxlXCIsIGFkZCBhIGRpcmVjdCByZWZlcmVuY2UgdG8gdGhlIEFsbGVsZSBjbGFzcylcbi8vIEFsc28gYWRkcyBhcnJheXMgZm9yIGNvbnZlbmllbmNlIGZvciBhY2Nlc3NpbmcgYWxsIGNsYXNzZXMgb3IgYWxsIGF0dHJpYnV0ZXMgb2YgYSBjbGFzcy5cbi8vXG5jbGFzcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IgKGNmZywgbWluZSkge1xuICAgICAgICBsZXQgbW9kZWwgPSB0aGlzO1xuICAgICAgICB0aGlzLm1pbmUgPSBtaW5lO1xuICAgICAgICB0aGlzLnBhY2thZ2UgPSBjZmcucGFja2FnZTtcbiAgICAgICAgdGhpcy5uYW1lID0gY2ZnLm5hbWU7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IGRlZXBjKGNmZy5jbGFzc2VzKTtcblxuICAgICAgICAvLyBGaXJzdCBhZGQgY2xhc3NlcyB0aGF0IHJlcHJlc2VudCB0aGUgYmFzaWMgdHlwZVxuICAgICAgICBMRUFGVFlQRVMuZm9yRWFjaCggbiA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzZXNbbl0gPSB7XG4gICAgICAgICAgICAgICAgaXNMZWFmVHlwZTogdHJ1ZSwgICAvLyBkaXN0aW5ndWlzaGVzIHRoZXNlIGZyb20gbW9kZWwgY2xhc3Nlc1xuICAgICAgICAgICAgICAgIG5hbWU6IG4sXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG4sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlczogW10sXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmFsbENsYXNzZXMgPSBvYmoyYXJyYXkodGhpcy5jbGFzc2VzKVxuICAgICAgICB2YXIgY25zID0gT2JqZWN0LmtleXModGhpcy5jbGFzc2VzKTtcbiAgICAgICAgY25zLnNvcnQoKVxuICAgICAgICBjbnMuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICB2YXIgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgICAgIGlmIChiYy5leHRlbmRlZEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkucHVzaChjbHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeSA9IFtjbHNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYmM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbHMucmVmZXJlbmNlcykuZm9yRWFjaChmdW5jdGlvbihybil7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBjbHMucmVmZXJlbmNlc1tybl07XG4gICAgICAgICAgICAgICAgci50eXBlID0gbW9kZWwuY2xhc3Nlc1tyLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE1vZGVsXG5cbi8vXG5jbGFzcyBDbGFzcyB7XG59IC8vIGVuZCBvZiBjbGFzcyBDbGFzc1xuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1cGVyY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoXG4vLyBUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHNbXCJleHRlbmRzXCJdIHx8IGNsc1tcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgYW5jID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3VwZXJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNsc1tcImV4dGVuZHNcIl0uY29uY2F0KGFuYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1YmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdWJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHMuZXh0ZW5kZWRCeSB8fCBjbHMuZXh0ZW5kZWRCeS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBkZXNjID0gY2xzLmV4dGVuZGVkQnkubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1YmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzLmV4dGVuZGVkQnkuY29uY2F0KGRlc2MucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiBzdWIgaXMgYSBzdWJjbGFzcyBvZiBzdXAuXG5mdW5jdGlvbiBpc1N1YmNsYXNzKHN1YixzdXApIHtcbiAgICBpZiAoc3ViID09PSBzdXApIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2Yoc3ViKSA9PT0gXCJzdHJpbmdcIiB8fCAhc3ViW1wiZXh0ZW5kc1wiXSB8fCBzdWJbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHIgPSBzdWJbXCJleHRlbmRzXCJdLmZpbHRlcihmdW5jdGlvbih4KXsgcmV0dXJuIHg9PT1zdXAgfHwgaXNTdWJjbGFzcyh4LCBzdXApOyB9KTtcbiAgICByZXR1cm4gci5sZW5ndGggPiAwO1xufVxuXG4vL1xuY2xhc3MgTm9kZSB7XG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHRlbXBsYXRlIChUZW1wbGF0ZSBvYmplY3QpIHRoZSB0ZW1wbGF0ZSB0aGF0IG93bnMgdGhpcyBub2RlXG4gICAgLy8gICBwYXJlbnQgKG9iamVjdCkgUGFyZW50IG9mIHRoZSBuZXcgbm9kZS5cbiAgICAvLyAgIG5hbWUgKHN0cmluZykgTmFtZSBmb3IgdGhlIG5vZGVcbiAgICAvLyAgIHBjb21wIChvYmplY3QpIFBhdGggY29tcG9uZW50IGZvciB0aGUgcm9vdCwgdGhpcyBpcyBhIGNsYXNzLiBGb3Igb3RoZXIgbm9kZXMsIGFuIGF0dHJpYnV0ZSwgXG4gICAgLy8gICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24gZGVjcmlwdG9yLlxuICAgIC8vICAgcHR5cGUgKG9iamVjdCBvciBzdHJpbmcpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHNpbXBsZSBhdHRyaWJ1dGVzLCB0aGlzIGlzIGEgc3RyaW5nLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWwuIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcblxuICAgICAgICB0aGlzLmpvaW4gPSBudWxsOyAvLyBpZiB0cnVlLCB0aGVuIHRoZSBsaW5rIGJldHdlZW4gbXkgcGFyZW50IGFuZCBtZSBpcyBhbiBvdXRlciBqb2luXG4gICAgICAgIFxuICAgICAgICB0aGlzLmlkID0gdGhpcy5wYXRoO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCByb290Tm9kZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLnF0cmVlO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIG9wZXJhdG9yIGlzIHZhbGlkIGZvciB0aGlzIG5vZGUuXG4gICAgb3BWYWxpZCAob3Ape1xuICAgICAgICBpZighdGhpcy5wYXJlbnQgJiYgIW9wLnZhbGlkRm9yUm9vdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZih0eXBlb2YodGhpcy5wdHlwZSkgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICBpZighIG9wLnZhbGlkRm9yQXR0cilcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBlbHNlIGlmKCBvcC52YWxpZFR5cGVzICYmIG9wLnZhbGlkVHlwZXMuaW5kZXhPZih0aGlzLnB0eXBlKSA9PSAtMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMucHR5cGUubmFtZSAmJiAhIG9wLnZhbGlkRm9yQ2xhc3MpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gbGlzdCBpcyB2YWxpZCBhcyBhIGxpc3QgY29uc3RyYWludCBvcHRpb24gZm9yXG4gICAgLy8gdGhlIG5vZGUgbi4gQSBsaXN0IGlzIHZhbGlkIHRvIHVzZSBpbiBhIGxpc3QgY29uc3RyYWludCBhdCBub2RlIG4gaWZmXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGVxdWFsIHRvIG9yIGEgc3ViY2xhc3Mgb2YgdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICogdGhlIGxpc3QncyB0eXBlIGlzIGEgc3VwZXJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGUuIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICAgICBlbGVtZW50cyBpbiB0aGUgbGlzdCB0aGF0IGFyZSBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBub2RlJ3MgdHlwZVxuICAgIC8vICAgICAgIGFyZSBhdXRvbWF0aWNhbGx5IGZpbHRlcmVkIG91dC5cbiAgICBsaXN0VmFsaWQgKGxpc3Qpe1xuICAgICAgICB2YXIgbnQgPSB0aGlzLnN1YnR5cGVDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgICAgIGlmICh0eXBlb2YobnQpID09PSBcInN0cmluZ1wiICkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgbHQgPSB0aGlzLnRlbXBsYXRlLm1vZGVsLmNsYXNzZXNbbGlzdC50eXBlXTtcbiAgICAgICAgcmV0dXJuIGlzU3ViY2xhc3MobHQsIG50KSB8fCBpc1N1YmNsYXNzKG50LCBsdCk7XG4gICAgfVxuXG5cbiAgICAvL1xuICAgIGdldCBwYXRoICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LnBhdGggK1wiLlwiIDogXCJcIikgKyB0aGlzLm5hbWU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IG5vZGVUeXBlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50IHx8IHRoaXMucHR5cGU7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzQmlvRW50aXR5ICgpIHtcbiAgICAgICAgZnVuY3Rpb24gY2soY2xzKSB7XG4gICAgICAgICAgICBpZiAoY2xzLm5hbWUgPT09IFwiQmlvRW50aXR5XCIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbHMuZXh0ZW5kczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNrKGNscy5leHRlbmRzW2ldKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNrKHRoaXMubm9kZVR5cGUpO1xuICAgIH1cbiAgICAvL1xuICAgIGdldCBpc1NlbGVjdGVkICgpIHtcbiAgICAgICAgIHJldHVybiB0aGlzLnZpZXcgIT09IG51bGwgJiYgdGhpcy52aWV3ICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHNlbGVjdCAoKSB7XG4gICAgICAgIGxldCBwID0gdGhpcy5wYXRoO1xuICAgICAgICBsZXQgdCA9IHRoaXMudGVtcGxhdGU7XG4gICAgICAgIGxldCBpID0gdC5zZWxlY3QuaW5kZXhPZihwKTtcbiAgICAgICAgdGhpcy52aWV3ID0gaSA+PSAwID8gaSA6ICh0LnNlbGVjdC5wdXNoKHApIC0gMSk7XG4gICAgfVxuICAgIHVuc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgcGF0aCBmcm9tIHRoZSBzZWxlY3QgbGlzdFxuICAgICAgICAgICAgdC5zZWxlY3Quc3BsaWNlKGksMSk7XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVudW1iZXIgbm9kZXMgaGVyZVxuICAgICAgICAgICAgdC5zZWxlY3Quc2xpY2UoaSkuZm9yRWFjaCggKHAsaikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBuID0gdGhpcy50ZW1wbGF0ZS5nZXROb2RlQnlQYXRoKHApO1xuICAgICAgICAgICAgICAgIG4udmlldyAtPSAxO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm5zIHRydWUgaWZmIHRoaXMgbm9kZSBjYW4gYmUgc29ydGVkIG9uLCB3aGljaCBpcyB0cnVlIGlmZiB0aGUgbm9kZSBpcyBhblxuICAgIC8vIGF0dHJpYnV0ZSwgYW5kIHRoZXJlIGFyZSBubyBvdXRlciBqb2lucyBiZXR3ZWVuIGl0IGFuZCB0aGUgcm9vdFxuICAgIGNhblNvcnQgKCkge1xuICAgICAgICBpZiAodGhpcy5wY29tcC5raW5kICE9PSBcImF0dHJpYnV0ZVwiKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCBuID0gdGhpcztcbiAgICAgICAgd2hpbGUgKG4pIHtcbiAgICAgICAgICAgIGlmIChuLmpvaW4pIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIG4gPSBuLnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXRTb3J0KG5ld2Rpcil7XG4gICAgICAgIGxldCBvbGRkaXIgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQuZGlyIDogXCJub25lXCI7XG4gICAgICAgIGxldCBvbGRsZXYgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgbGV0IG1heGxldiA9IC0xO1xuICAgICAgICBsZXQgcmVudW1iZXIgPSBmdW5jdGlvbiAobil7XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwICYmIG4uc29ydC5sZXZlbCA+IG9sZGxldilcbiAgICAgICAgICAgICAgICAgICAgbi5zb3J0LmxldmVsIC09IDE7XG4gICAgICAgICAgICAgICAgbWF4bGV2ID0gTWF0aC5tYXgobWF4bGV2LCBuLnNvcnQubGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlbnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5ld2RpciB8fCBuZXdkaXIgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gbm90IHNvcnRlZFxuICAgICAgICAgICAgdGhpcy5zb3J0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCl7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIHJlbnVtYmVyIGFueSBleGlzdGluZyBzb3J0IGNmZ3MuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gc29ydGVkXG4gICAgICAgICAgICBpZiAob2xkbGV2ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgbm90IHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gZmluZCBuZXh0IGxldmVsLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgICAgIG9sZGxldiA9IG1heGxldiArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNvcnQgPSB7IGRpcjpuZXdkaXIsIGxldmVsOiBvbGRsZXYgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldHMgdGhlIHN1YmNsYXNzIGNvbnN0cmFpbnQgYXQgdGhpcyBub2RlLCBvciByZW1vdmVzIGl0IGlmIG5vIHN1YmNsYXNzIGdpdmVuLiBBIG5vZGUgbWF5XG4gICAgLy8gaGF2ZSBleGFjdGx5IDAgb3IgMSBzdWJjbGFzcyBjb25zdHJhaW50LiBBc3N1bWVzIHRoZSBzdWJjbGFzcyBpcyBhY3R1YWxseSBhIHN1YmNsYXNzIG9mIHRoZSBub2RlJ3NcbiAgICAvLyB0eXBlIChzaG91bGQgY2hlY2sgdGhpcykuXG4gICAgLy9cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgYyAoQ29uc3RyYWludCkgVGhlIHN1YmNsYXNzIENvbnN0cmFpbnQgb3IgbnVsbC4gU2V0cyB0aGUgc3ViY2xhc3MgY29uc3RyYWludCBvbiB0aGUgY3VycmVudCBub2RlIHRvXG4gICAgLy8gICAgICAgdGhlIHR5cGUgbmFtZWQgaW4gYy4gUmVtb3ZlcyB0aGUgcHJldmlvdXMgc3ViY2xhc3MgY29uc3RyYWludCBpZiBhbnkuIElmIG51bGwsIGp1c3QgcmVtb3Zlc1xuICAgIC8vICAgICAgIGFueSBleGlzdGluZyBzdWJjbGFzcyBjb25zdHJhaW50LlxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICBMaXN0IG9mIGFueSBub2RlcyB0aGF0IHdlcmUgcmVtb3ZlZCBiZWNhdXNlIHRoZSBuZXcgY29uc3RyYWludCBjYXVzZWQgdGhlbSB0byBiZWNvbWUgaW52YWxpZC5cbiAgICAvL1xuICAgIHNldFN1YmNsYXNzQ29uc3RyYWludCAoYykge1xuICAgICAgICBsZXQgbiA9IHRoaXM7XG4gICAgICAgIC8vIHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3ViY2xhc3MgY29uc3RyYWludFxuICAgICAgICBpZiAoYyAmJiBuLmNvbnN0cmFpbnRzLmluZGV4T2YoYykgPT09IC0xKVxuICAgICAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKGMpO1xuICAgICAgICBuLmNvbnN0cmFpbnRzID0gbi5jb25zdHJhaW50cy5maWx0ZXIoZnVuY3Rpb24gKGNjKXsgcmV0dXJuIGNjLmN0eXBlICE9PSBcInN1YmNsYXNzXCIgfHwgY2MgPT09IGM7IH0pO1xuICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IG51bGw7XG4gICAgICAgIGlmIChjKXtcbiAgICAgICAgICAgIC8vIGxvb2t1cCB0aGUgc3ViY2xhc3MgbmFtZVxuICAgICAgICAgICAgbGV0IGNscyA9IHRoaXMudGVtcGxhdGUubW9kZWwuY2xhc3Nlc1tjLnR5cGVdO1xuICAgICAgICAgICAgaWYoIWNscykgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzcyBcIiArIGMudHlwZTtcbiAgICAgICAgICAgIC8vIGFkZCB0aGUgY29uc3RyYWludFxuICAgICAgICAgICAgbi5zdWJjbGFzc0NvbnN0cmFpbnQgPSBjbHM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbG9va3MgZm9yIGludmFsaWRhdGVkIHBhdGhzIFxuICAgICAgICBmdW5jdGlvbiBjaGVjayhub2RlLCByZW1vdmVkKSB7XG4gICAgICAgICAgICBsZXQgY2xzID0gbm9kZS5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbm9kZS5wdHlwZTtcbiAgICAgICAgICAgIGxldCBjMiA9IFtdO1xuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgIGlmKGMubmFtZSBpbiBjbHMuYXR0cmlidXRlcyB8fCBjLm5hbWUgaW4gY2xzLnJlZmVyZW5jZXMgfHwgYy5uYW1lIGluIGNscy5jb2xsZWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBjMi5wdXNoKGMpO1xuICAgICAgICAgICAgICAgICAgICBjaGVjayhjLCByZW1vdmVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IGMyO1xuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlbW92ZWQgPSBjaGVjayhuLFtdKTtcbiAgICAgICAgcmV0dXJuIHJlbW92ZWQ7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlcyB0aGlzIG5vZGUgZnJvbSB0aGUgcXVlcnkuXG4gICAgcmVtb3ZlICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhcmVudDtcbiAgICAgICAgaWYgKCFwKSByZXR1cm47XG4gICAgICAgIC8vIEZpcnN0LCByZW1vdmUgYWxsIGNvbnN0cmFpbnRzIG9uIHRoaXMgb3IgZGVzY2VuZGFudHNcbiAgICAgICAgZnVuY3Rpb24gcm1jICh4KSB7XG4gICAgICAgICAgICB4LnVuc2VsZWN0KCk7XG4gICAgICAgICAgICB4LmNvbnN0cmFpbnRzLmZvckVhY2goYyA9PiB4LnJlbW92ZUNvbnN0cmFpbnQoYykpO1xuICAgICAgICAgICAgeC5jaGlsZHJlbi5mb3JFYWNoKHJtYyk7XG4gICAgICAgIH1cbiAgICAgICAgcm1jKHRoaXMpO1xuICAgICAgICAvLyBOb3cgcmVtb3ZlIHRoZSBzdWJ0cmVlIGF0IG4uXG4gICAgICAgIHAuY2hpbGRyZW4uc3BsaWNlKHAuY2hpbGRyZW4uaW5kZXhPZih0aGlzKSwgMSk7XG4gICAgfVxuXG4gICAgLy8gQWRkcyBhIG5ldyBjb25zdHJhaW50IHRvIGEgbm9kZSBhbmQgcmV0dXJucyBpdC5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgYyAoY29uc3RyYWludCkgSWYgZ2l2ZW4sIHVzZSB0aGF0IGNvbnN0cmFpbnQuIE90aGVyd2lzZSwgY3JlYXRlIGRlZmF1bHQuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIFRoZSBuZXcgY29uc3RyYWludC5cbiAgICAvL1xuICAgIGFkZENvbnN0cmFpbnQgKGMpIHtcbiAgICAgICAgaWYgKGMpIHtcbiAgICAgICAgICAgIC8vIGp1c3QgdG8gYmUgc3VyZVxuICAgICAgICAgICAgYy5ub2RlID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvcCA9IE9QSU5ERVhbdGhpcy5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiID8gXCI9XCIgOiBcIkxPT0tVUFwiXTtcbiAgICAgICAgICAgIGMgPSBuZXcgQ29uc3RyYWludCh7bm9kZTp0aGlzLCBvcDpvcC5vcCwgY3R5cGU6IG9wLmN0eXBlfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cy5wdXNoKGMpO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLndoZXJlLnB1c2goYyk7XG5cbiAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdWJjbGFzc0NvbnN0cmFpbnQoYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjLmNvZGUgPSB0aGlzLnRlbXBsYXRlLm5leHRBdmFpbGFibGVDb2RlKCk7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlLmNvZGUyY1tjLmNvZGVdID0gYztcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuc2V0TG9naWNFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ29uc3RyYWludCAoYyl7XG4gICAgICAgIHRoaXMuY29uc3RyYWludHMgPSB0aGlzLmNvbnN0cmFpbnRzLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUud2hlcmUgPSB0aGlzLnRlbXBsYXRlLndoZXJlLmZpbHRlcihmdW5jdGlvbihjYyl7IHJldHVybiBjYyAhPT0gYzsgfSk7XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICB0aGlzLnNldFN1YmNsYXNzQ29uc3RyYWludChudWxsKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50ZW1wbGF0ZS5jb2RlMmNbYy5jb2RlXTtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuc2V0TG9naWNFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxufSAvLyBlbmQgb2YgY2xhc3MgTm9kZVxuXG5jbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IgKHQsIG1vZGVsKSB7XG4gICAgICAgIHQgPSB0IHx8IHt9XG4gICAgICAgIC8vdGhpcy5tb2RlbCA9IHQubW9kZWwgPyBkZWVwYyh0Lm1vZGVsKSA6IHsgbmFtZTogXCJnZW5vbWljXCIgfTtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICB0aGlzLm5hbWUgPSB0Lm5hbWUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy50aXRsZSA9IHQudGl0bGUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IHQuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgdGhpcy5jb21tZW50ID0gdC5jb21tZW50IHx8IFwiXCI7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gdC5zZWxlY3QgPyBkZWVwYyh0LnNlbGVjdCkgOiBbXTtcbiAgICAgICAgdGhpcy53aGVyZSA9IHQud2hlcmUgPyB0LndoZXJlLm1hcCggYyA9PiB7XG4gICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKSA7XG4gICAgICAgICAgICBjYy5ub2RlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBjYztcbiAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50TG9naWMgPSB0LmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiO1xuICAgICAgICB0aGlzLmpvaW5zID0gdC5qb2lucyA/IGRlZXBjKHQuam9pbnMpIDogW107XG4gICAgICAgIHRoaXMudGFncyA9IHQudGFncyA/IGRlZXBjKHQudGFncykgOiBbXTtcbiAgICAgICAgdGhpcy5vcmRlckJ5ID0gdC5vcmRlckJ5ID8gZGVlcGModC5vcmRlckJ5KSA6IFtdO1xuICAgICAgICB0aGlzLmNvbXBpbGUoKTtcbiAgICB9XG5cbiAgICBjb21waWxlICgpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICBsZXQgcm9vdHMgPSBbXVxuICAgICAgICBsZXQgdCA9IHRoaXM7XG4gICAgICAgIC8vIHRoZSB0cmVlIG9mIG5vZGVzIHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcXVlcnkgd2lsbCBnbyBoZXJlXG4gICAgICAgIHQucXRyZWUgPSBudWxsO1xuICAgICAgICAvLyBpbmRleCBvZiBjb2RlIHRvIGNvbnN0cmFpbnQgZ29ycyBoZXJlLlxuICAgICAgICB0LmNvZGUyYyA9IHt9XG4gICAgICAgIC8vIG5vcm1hbGl6ZSB0aGluZ3MgdGhhdCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgICAgIHQuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgICAgICB0LmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICAvL1xuICAgICAgICBsZXQgc3ViY2xhc3NDcyA9IFtdO1xuICAgICAgICB0LndoZXJlID0gKHQud2hlcmUgfHwgW10pLm1hcChjID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgcmF3IGNvbnRyYWludCBjb25maWdzIHRvIENvbnN0cmFpbnQgb2JqZWN0cy5cbiAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgaWYgKGNjLmNvZGUpIHQuY29kZTJjW2NjLmNvZGVdID0gY2M7XG4gICAgICAgICAgICBjYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIHN1YmNsYXNzQ3MucHVzaChjYyk7XG4gICAgICAgICAgICByZXR1cm4gY2M7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG11c3QgcHJvY2VzcyBhbnkgc3ViY2xhc3MgY29uc3RyYWludHMgZmlyc3QsIGZyb20gc2hvcnRlc3QgdG8gbG9uZ2VzdCBwYXRoXG4gICAgICAgIHN1YmNsYXNzQ3NcbiAgICAgICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucGF0aC5sZW5ndGggLSBiLnBhdGgubGVuZ3RoO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICB2YXIgbiA9IHQuYWRkUGF0aChjLnBhdGgpO1xuICAgICAgICAgICAgICAgICB2YXIgY2xzID0gc2VsZi5tb2RlbC5jbGFzc2VzW2MudHlwZV07XG4gICAgICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgYy50eXBlO1xuICAgICAgICAgICAgICAgICBuLnN1YmNsYXNzQ29uc3RyYWludCA9IGNscztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0LndoZXJlICYmIHQud2hlcmUuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKGMucGF0aCk7XG4gICAgICAgICAgICBpZiAobi5jb25zdHJhaW50cylcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzID0gW2NdO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vXG4gICAgICAgIHQuc2VsZWN0ICYmIHQuc2VsZWN0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgbi5zZWxlY3QoKTtcbiAgICAgICAgfSlcbiAgICAgICAgdC5qb2lucyAmJiB0LmpvaW5zLmZvckVhY2goZnVuY3Rpb24oail7XG4gICAgICAgICAgICBsZXQgbiA9IHQuYWRkUGF0aChqKTtcbiAgICAgICAgICAgIG4uam9pbiA9IFwib3V0ZXJcIjtcbiAgICAgICAgfSlcbiAgICAgICAgdC5vcmRlckJ5ICYmIHQub3JkZXJCeS5mb3JFYWNoKGZ1bmN0aW9uKG8sIGkpe1xuICAgICAgICAgICAgbGV0IHAgPSBPYmplY3Qua2V5cyhvKVswXVxuICAgICAgICAgICAgbGV0IGRpciA9IG9bcF1cbiAgICAgICAgICAgIGxldCBuID0gdC5hZGRQYXRoKHApO1xuICAgICAgICAgICAgbi5zb3J0ID0geyBkaXI6IGRpciwgbGV2ZWw6IGkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdC5xdHJlZSkge1xuICAgICAgICAgICAgdGhyb3cgXCJObyBwYXRocyBpbiBxdWVyeS5cIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuXG4gICAgLy8gVHVybnMgYSBxdHJlZSBzdHJ1Y3R1cmUgYmFjayBpbnRvIGEgXCJyYXdcIiB0ZW1wbGF0ZS4gXG4gICAgLy9cbiAgICB1bmNvbXBpbGVUZW1wbGF0ZSAoKXtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgbGV0IHQgPSB7XG4gICAgICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgICAgICBtb2RlbDogeyBuYW1lOiB0bXBsdC5tb2RlbC5uYW1lIH0sXG4gICAgICAgICAgICB0YWdzOiBkZWVwYyh0bXBsdC50YWdzKSxcbiAgICAgICAgICAgIHNlbGVjdCA6IHRtcGx0LnNlbGVjdC5jb25jYXQoKSxcbiAgICAgICAgICAgIHdoZXJlIDogW10sXG4gICAgICAgICAgICBqb2lucyA6IFtdLFxuICAgICAgICAgICAgY29uc3RyYWludExvZ2ljOiB0bXBsdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIixcbiAgICAgICAgICAgIG9yZGVyQnkgOiBbXVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlYWNoKG4pe1xuICAgICAgICAgICAgbGV0IHAgPSBuLnBhdGhcbiAgICAgICAgICAgIGlmIChuLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHNob3VsZCBhbHJlYWR5IGJlIHRoZXJlXG4gICAgICAgICAgICAgICAgaWYgKHQuc2VsZWN0LmluZGV4T2Yobi5wYXRoKSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiQW5vbWFseSBkZXRlY3RlZCBpbiBzZWxlY3QgbGlzdC5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIChuLmNvbnN0cmFpbnRzIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICBsZXQgY2MgPSBuZXcgQ29uc3RyYWludChjKTtcbiAgICAgICAgICAgICAgICAgY2Mubm9kZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgIHQud2hlcmUucHVzaChjYylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAobi5qb2luID09PSBcIm91dGVyXCIpIHtcbiAgICAgICAgICAgICAgICB0LmpvaW5zLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgbGV0IHMgPSB7fVxuICAgICAgICAgICAgICAgIHNbcF0gPSBuLnNvcnQuZGlyLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgdC5vcmRlckJ5W24uc29ydC5sZXZlbF0gPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlYWNoKTtcbiAgICAgICAgfVxuICAgICAgICByZWFjaCh0bXBsdC5xdHJlZSk7XG4gICAgICAgIHQub3JkZXJCeSA9IHQub3JkZXJCeS5maWx0ZXIobyA9PiBvKTtcbiAgICAgICAgcmV0dXJuIHRcbiAgICB9XG5cbiAgICBnZXROb2RlQnlQYXRoIChwKSB7XG4gICAgICAgIHAgPSBwLnRyaW0oKTtcbiAgICAgICAgaWYgKCFwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IHBhcnRzID0gcC5zcGxpdChcIi5cIik7XG4gICAgICAgIGxldCBuID0gdGhpcy5xdHJlZTtcbiAgICAgICAgaWYgKG4ubmFtZSAhPT0gcGFydHNbMF0pIHJldHVybiBudWxsO1xuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBjbmFtZSA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgbGV0IGMgPSAobi5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKHggPT4geC5uYW1lID09PSBjbmFtZSlbMF07XG4gICAgICAgICAgICBpZiAoIWMpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuXG4gICAgLy8gQWRkcyBhIHBhdGggdG8gdGhlIHF0cmVlIGZvciB0aGlzIHRlbXBsYXRlLiBQYXRoIGlzIHNwZWNpZmllZCBhcyBhIGRvdHRlZCBsaXN0IG9mIG5hbWVzLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBwYXRoIChzdHJpbmcpIHRoZSBwYXRoIHRvIGFkZC4gXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC4gXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgQ3JlYXRlcyBuZXcgbm9kZXMgYXMgbmVlZGVkIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHF0cmVlLlxuICAgIGFkZFBhdGggKHBhdGgpe1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSB0aGlzO1xuICAgICAgICBpZiAodHlwZW9mKHBhdGgpID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgcGF0aCA9IHBhdGguc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgY2xhc3NlcyA9IHRoaXMubW9kZWwuY2xhc3NlcztcbiAgICAgICAgbGV0IGxhc3R0ID0gbnVsbDtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnF0cmVlOyAgLy8gY3VycmVudCBub2RlIHBvaW50ZXJcbiAgICAgICAgZnVuY3Rpb24gZmluZChsaXN0LCBuKXtcbiAgICAgICAgICAgICByZXR1cm4gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCl7cmV0dXJuIHgubmFtZSA9PT0gbn0pWzBdXG4gICAgICAgIH1cblxuICAgICAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24ocCwgaSl7XG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZS5xdHJlZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb290IGFscmVhZHkgZXhpc3RzLCBtYWtlIHN1cmUgbmV3IHBhdGggaGFzIHNhbWUgcm9vdC5cbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocCAhPT0gbi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW5ub3QgYWRkIHBhdGggZnJvbSBkaWZmZXJlbnQgcm9vdC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0IHBhdGggdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1twXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpXG4gICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgbiA9IHRlbXBsYXRlLnF0cmVlID0gbmV3IE5vZGUoIHRlbXBsYXRlLCBudWxsLCBwLCBjbHMsIGNscyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG4gaXMgcG9pbnRpbmcgdG8gdGhlIHBhcmVudCwgYW5kIHAgaXMgdGhlIG5leHQgbmFtZSBpbiB0aGUgcGF0aC5cbiAgICAgICAgICAgICAgICB2YXIgbm4gPSBmaW5kKG4uY2hpbGRyZW4sIHApO1xuICAgICAgICAgICAgICAgIGlmIChubikge1xuICAgICAgICAgICAgICAgICAgICAvLyBwIGlzIGFscmVhZHkgYSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIGFkZCBhIG5ldyBub2RlIGZvciBwXG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBsb29rdXAgcFxuICAgICAgICAgICAgICAgICAgICB2YXIgeDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNscyA9IG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbHMuYXR0cmlidXRlc1twXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IGNscy5hdHRyaWJ1dGVzW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xzID0geC50eXBlIC8vIDwtLSBBIHN0cmluZyFcbiAgICAgICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLnJlZmVyZW5jZXNbcF0gfHwgY2xzLmNvbGxlY3Rpb25zW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xzID0gY2xhc3Nlc1t4LnJlZmVyZW5jZWRUeXBlXSAvLyA8LS1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzOiBcIiArIHA7XG4gICAgICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBtZW1iZXIgbmFtZWQgXCIgKyBwICsgXCIgaW4gY2xhc3MgXCIgKyBjbHMubmFtZSArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgbm9kZSwgYWRkIGl0IHRvIG4ncyBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBubiA9IG5ldyBOb2RlKHRlbXBsYXRlLCBuLCBwLCB4LCBjbHMpO1xuICAgICAgICAgICAgICAgICAgICBuID0gbm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIHJldHVybiB0aGUgbGFzdCBub2RlIGluIHRoZSBwYXRoXG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiBcbiAgICAvLyBSZXR1cm5zIGEgc2luZ2xlIGNoYXJhY3RlciBjb25zdHJhaW50IGNvZGUgaW4gdGhlIHJhbmdlIEEtWiB0aGF0IGlzIG5vdCBhbHJlYWR5XG4gICAgLy8gdXNlZCBpbiB0aGUgZ2l2ZW4gdGVtcGxhdGUuXG4gICAgLy9cbiAgICBuZXh0QXZhaWxhYmxlQ29kZSAoKXtcbiAgICAgICAgZm9yKHZhciBpPSBcIkFcIi5jaGFyQ29kZUF0KDApOyBpIDw9IFwiWlwiLmNoYXJDb2RlQXQoMCk7IGkrKyl7XG4gICAgICAgICAgICB2YXIgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaSk7XG4gICAgICAgICAgICBpZiAoISAoYyBpbiB0aGlzLmNvZGUyYykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG5cblxuICAgIC8vIFNldHMgdGhlIGNvbnN0cmFpbnQgbG9naWMgZXhwcmVzc2lvbiBmb3IgdGhpcyB0ZW1wbGF0ZS5cbiAgICAvLyBJbiB0aGUgcHJvY2VzcywgYWxzbyBcImNvcnJlY3RzXCIgdGhlIGV4cHJlc3Npb24gYXMgZm9sbG93czpcbiAgICAvLyAgICAqIGFueSBjb2RlcyBpbiB0aGUgZXhwcmVzc2lvbiB0aGF0IGFyZSBub3QgYXNzb2NpYXRlZCB3aXRoXG4gICAgLy8gICAgICBhbnkgY29uc3RyYWludCBpbiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBhcmUgcmVtb3ZlZCBhbmQgdGhlXG4gICAgLy8gICAgICBleHByZXNzaW9uIGxvZ2ljIHVwZGF0ZWQgYWNjb3JkaW5nbHlcbiAgICAvLyAgICAqIGFuZCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgdGhhdCBhcmUgbm90IGluIHRoZSBleHByZXNzaW9uXG4gICAgLy8gICAgICBhcmUgQU5EZWQgdG8gdGhlIGVuZC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgaWYgdGhlIGN1cnJlbnQgdGVtcGxhdGUgaGFzIGNvZGVzIEEsIEIsIGFuZCBDLCBhbmRcbiAgICAvLyB0aGUgZXhwcmVzc2lvbiBpcyBcIihBIG9yIEQpIGFuZCBCXCIsIHRoZSBEIGRyb3BzIG91dCBhbmQgQyBpc1xuICAgIC8vIGFkZGVkLCByZXN1bHRpbmcgaW4gXCJBIGFuZCBCIGFuZCBDXCIuIFxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBleCAoc3RyaW5nKSB0aGUgZXhwcmVzc2lvblxuICAgIC8vIFJldHVybnM6XG4gICAgLy8gICB0aGUgXCJjb3JyZWN0ZWRcIiBleHByZXNzaW9uXG4gICAgLy8gICBcbiAgICBzZXRMb2dpY0V4cHJlc3Npb24gKGV4KSB7XG4gICAgICAgIGV4ID0gZXggPyBleCA6ICh0aGlzLmNvbnN0cmFpbnRMb2dpYyB8fCBcIlwiKVxuICAgICAgICB2YXIgYXN0OyAvLyBhYnN0cmFjdCBzeW50YXggdHJlZVxuICAgICAgICB2YXIgc2VlbiA9IFtdO1xuICAgICAgICB2YXIgdG1wbHQgPSB0aGlzO1xuICAgICAgICBmdW5jdGlvbiByZWFjaChuLGxldil7XG4gICAgICAgICAgICBpZiAodHlwZW9mKG4pID09PSBcInN0cmluZ1wiICl7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhhdCBuIGlzIGEgY29uc3RyYWludCBjb2RlIGluIHRoZSB0ZW1wbGF0ZS4gXG4gICAgICAgICAgICAgICAgLy8gSWYgbm90LCByZW1vdmUgaXQgZnJvbSB0aGUgZXhwci5cbiAgICAgICAgICAgICAgICAvLyBBbHNvIHJlbW92ZSBpdCBpZiBpdCdzIHRoZSBjb2RlIGZvciBhIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgICAgICAgICBzZWVuLnB1c2gobik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChuIGluIHRtcGx0LmNvZGUyYyAmJiB0bXBsdC5jb2RlMmNbbl0uY3R5cGUgIT09IFwic3ViY2xhc3NcIikgPyBuIDogXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjbXMgPSBuLmNoaWxkcmVuLm1hcChmdW5jdGlvbihjKXtyZXR1cm4gcmVhY2goYywgbGV2KzEpO30pLmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geDt9KTs7XG4gICAgICAgICAgICB2YXIgY21zcyA9IGNtcy5qb2luKFwiIFwiK24ub3ArXCIgXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGNtcy5sZW5ndGggPT09IDAgPyBcIlwiIDogbGV2ID09PSAwIHx8IGNtcy5sZW5ndGggPT09IDEgPyBjbXNzIDogXCIoXCIgKyBjbXNzICsgXCIpXCJcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXN0ID0gZXggPyBwYXJzZXIucGFyc2UoZXgpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBhbGVydChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RyYWludExvZ2ljO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBsZXggPSBhc3QgPyByZWFjaChhc3QsMCkgOiBcIlwiO1xuICAgICAgICAvLyBpZiBhbnkgY29uc3RyYWludCBjb2RlcyBpbiB0aGUgdGVtcGxhdGUgd2VyZSBub3Qgc2VlbiBpbiB0aGUgZXhwcmVzc2lvbixcbiAgICAgICAgLy8gQU5EIHRoZW0gaW50byB0aGUgZXhwcmVzc2lvbiAoZXhjZXB0IElTQSBjb25zdHJhaW50cykuXG4gICAgICAgIHZhciB0b0FkZCA9IE9iamVjdC5rZXlzKHRoaXMuY29kZTJjKS5maWx0ZXIoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICByZXR1cm4gc2Vlbi5pbmRleE9mKGMpID09PSAtMSAmJiBjLm9wICE9PSBcIklTQVwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0b0FkZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgaWYoYXN0ICYmIGFzdC5vcCAmJiBhc3Qub3AgPT09IFwib3JcIilcbiAgICAgICAgICAgICAgICAgbGV4ID0gYCgke2xleH0pYDtcbiAgICAgICAgICAgICBpZiAobGV4KSB0b0FkZC51bnNoaWZ0KGxleCk7XG4gICAgICAgICAgICAgbGV4ID0gdG9BZGQuam9pbihcIiBhbmQgXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gbGV4O1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpeyB0aGlzWzBdWzBdLnZhbHVlID0gbGV4OyB9KTtcblxuICAgICAgICByZXR1cm4gbGV4O1xuICAgIH1cbiBcbiAgICAvLyBcbiAgICBnZXRYbWwgKHFvbmx5KSB7XG4gICAgICAgIGxldCB0ID0gdGhpcy51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICAgICAgICB2YXIgc28gPSAodC5vcmRlckJ5IHx8IFtdKS5yZWR1Y2UoZnVuY3Rpb24ocyx4KXsgXG4gICAgICAgICAgICB2YXIgayA9IE9iamVjdC5rZXlzKHgpWzBdO1xuICAgICAgICAgICAgdmFyIHYgPSB4W2tdXG4gICAgICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICAgICAgfSwgXCJcIik7XG5cbiAgICAgICAgLy8gQ29udmVydHMgYW4gb3V0ZXIgam9pbiBwYXRoIHRvIHhtbC5cbiAgICAgICAgZnVuY3Rpb24gb2oyeG1sKG9qKXtcbiAgICAgICAgICAgIHJldHVybiBgPGpvaW4gcGF0aD1cIiR7b2p9XCIgc3R5bGU9XCJPVVRFUlwiIC8+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBxdWVyeSBwYXJ0XG4gICAgICAgIGxldCBxcGFydCA9IFxuICAgIGA8cXVlcnlcbiAgICAgIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICAgICAgbW9kZWw9XCIkeyh0Lm1vZGVsICYmIHQubW9kZWwubmFtZSkgfHwgJyd9XCJcbiAgICAgIHZpZXc9XCIke3Quc2VsZWN0LmpvaW4oJyAnKX1cIlxuICAgICAgbG9uZ0Rlc2NyaXB0aW9uPVwiJHtlc2ModC5kZXNjcmlwdGlvbiB8fCAnJyl9XCJcbiAgICAgIHNvcnRPcmRlcj1cIiR7c28gfHwgJyd9XCJcbiAgICAgICR7dC5jb25zdHJhaW50TG9naWMgJiYgJ2NvbnN0cmFpbnRMb2dpYz1cIicrdC5jb25zdHJhaW50TG9naWMrJ1wiJyB8fCAnJ31cbiAgICA+XG4gICAgICAkeyh0LmpvaW5zIHx8IFtdKS5tYXAob2oyeG1sKS5qb2luKFwiIFwiKX1cbiAgICAgICR7KHQud2hlcmUgfHwgW10pLm1hcChjID0+IGMuYzJ4bWwocW9ubHkpKS5qb2luKFwiIFwiKX1cbiAgICA8L3F1ZXJ5PmA7XG4gICAgICAgIC8vIHRoZSB3aG9sZSB0ZW1wbGF0ZVxuICAgICAgICB2YXIgdG1wbHQgPSBcbiAgICBgPHRlbXBsYXRlXG4gICAgICBuYW1lPVwiJHt0Lm5hbWUgfHwgJyd9XCJcbiAgICAgIHRpdGxlPVwiJHtlc2ModC50aXRsZSB8fCAnJyl9XCJcbiAgICAgIGNvbW1lbnQ9XCIke2VzYyh0LmNvbW1lbnQgfHwgJycpfVwiPlxuICAgICAke3FwYXJ0fVxuICAgIDwvdGVtcGxhdGU+XG4gICAgYDtcbiAgICAgICAgcmV0dXJuIHFvbmx5ID8gcXBhcnQgOiB0bXBsdFxuICAgIH1cblxuICAgIGdldEpzb24gKCkge1xuICAgICAgICBsZXQgdCA9IHRoaXMudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHQsIG51bGwsIDIpO1xuICAgIH1cblxufSAvLyBlbmQgb2YgY2xhc3MgVGVtcGxhdGVcblxuY2xhc3MgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKGMpIHtcbiAgICAgICAgYyA9IGMgfHwge31cbiAgICAgICAgLy8gc2F2ZSB0aGUgIG5vZGVcbiAgICAgICAgdGhpcy5ub2RlID0gYy5ub2RlIHx8IG51bGw7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gYy5wYXRoIHx8IGMubm9kZSAmJiBjLm5vZGUucGF0aCB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gYy5vcCB8fCBjLnR5cGUgJiYgXCJJU0FcIiB8fCBudWxsO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0LCByYW5nZSwgbG9vcFxuICAgICAgICAvLyB0aHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoaXMub3AgaXMgZGVmaW5lZCwgYnV0IG5vdCBpbiBPUElOREVYXG4gICAgICAgIHRoaXMuY3R5cGUgPSB0aGlzLm9wICYmIE9QSU5ERVhbdGhpcy5vcF0uY3R5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMuY29kZSA9IHRoaXMuY3R5cGUgIT09IFwic3ViY2xhc3NcIiAmJiBjLmNvZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSB2YWx1ZSwgbGlzdFxuICAgICAgICB0aGlzLnZhbHVlID0gYy52YWx1ZSB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gdGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIiAmJiBjLmV4dHJhVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IGMudmFsdWVzICYmIGRlZXBjKGMudmFsdWVzKSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHN1YmNsYXNzIGNvbnRyYWludHNcbiAgICAgICAgdGhpcy50eXBlID0gdGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIGMudHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGZvciBjb25zdHJhaW50cyBpbiBhIHRlbXBsYXRlXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBjLmVkaXRhYmxlIHx8IG51bGw7XG5cbiAgICAgICAgLy8gV2l0aCBudWxsL25vdC1udWxsIGNvbnN0cmFpbnRzLCBJTSBoYXMgYSB3ZWlyZCBxdWlyayBvZiBmaWxsaW5nIHRoZSB2YWx1ZSBcbiAgICAgICAgLy8gZmllbGQgd2l0aCB0aGUgb3BlcmF0b3IuIEUuZy4sIGZvciBhbiBcIklTIE5PVCBOVUxMXCIgb3ByZWF0b3IsIHRoZSB2YWx1ZSBmaWVsZCBpc1xuICAgICAgICAvLyBhbHNvIFwiSVMgTk9UIE5VTExcIi4gXG4gICAgICAgIC8vIFxuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBjLnZhbHVlID0gXCJcIjtcbiAgICB9XG4gICAgLy9cbiAgICBzZXRPcCAobywgcXVpZXRseSkge1xuICAgICAgICBsZXQgb3AgPSBPUElOREVYW29dO1xuICAgICAgICBpZiAoIW9wKSB0aHJvdyBcIlVua25vd24gb3BlcmF0b3I6IFwiICsgbztcbiAgICAgICAgdGhpcy5vcCA9IG9wLm9wO1xuICAgICAgICB0aGlzLmN0eXBlID0gb3AuY3R5cGU7XG4gICAgICAgIGxldCB0ID0gdGhpcy5ub2RlICYmIHRoaXMubm9kZS50ZW1wbGF0ZTtcbiAgICAgICAgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29kZSAmJiAhcXVpZXRseSAmJiB0KSBcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5jb2RlMmNbdGhpcy5jb2RlXTtcbiAgICAgICAgICAgIHRoaXMuY29kZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY29kZSkgXG4gICAgICAgICAgICAgICAgdGhpcy5jb2RlID0gdCAmJiB0Lm5leHRBdmFpbGFibGVDb2RlKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAhcXVpZXRseSAmJiB0ICYmIHQuc2V0TG9naWNFeHByZXNzaW9uKCk7XG4gICAgfVxuICAgIC8vIFJldHVybnMgYSB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb25zdHJhaW50IHN1aXRhYmxlIGZvciBhIGxhYmVsXG4gICAgLy9cbiAgICBnZXQgbGFiZWxUZXh0ICgpIHtcbiAgICAgICBsZXQgdCA9IFwiP1wiO1xuICAgICAgIGxldCBjID0gdGhpcztcbiAgICAgICAgLy8gb25lIG9mOiBudWxsLCB2YWx1ZSwgbXVsdGl2YWx1ZSwgc3ViY2xhc3MsIGxvb2t1cCwgbGlzdCwgcmFuZ2UsIGxvb3BcbiAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKXtcbiAgICAgICAgICAgdCA9IFwiSVNBIFwiICsgKHRoaXMudHlwZSB8fCBcIj9cIik7XG4gICAgICAgfVxuICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibGlzdFwiIHx8IHRoaXMuY3R5cGUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcCArIFwiIFwiICsgdGhpcy52YWx1ZTtcbiAgICAgICAgICAgaWYgKHRoaXMuZXh0cmFWYWx1ZSkgdCA9IHQgKyBcIiBJTiBcIiArIHRoaXMuZXh0cmFWYWx1ZTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlcztcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3A7XG4gICAgICAgfVxuXG4gICAgICAgcmV0dXJuICh0aGlzLmN0eXBlICE9PSBcInN1YmNsYXNzXCIgPyBcIihcIit0aGlzLmNvZGUrXCIpIFwiIDogXCJcIikgKyB0O1xuICAgIH1cblxuICAgIC8vIGZvcm1hdHMgdGhpcyBjb25zdHJhaW50IGFzIHhtbFxuICAgIGMyeG1sIChxb25seSl7XG4gICAgICAgIGxldCBnID0gJyc7XG4gICAgICAgIGxldCBoID0gJyc7XG4gICAgICAgIGxldCBlID0gcW9ubHkgPyBcIlwiIDogYGVkaXRhYmxlPVwiJHt0aGlzLmVkaXRhYmxlIHx8ICdmYWxzZSd9XCJgO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiIHx8IHRoaXMuY3R5cGUgPT09IFwibGlzdFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke2VzYyh0aGlzLm9wKX1cIiB2YWx1ZT1cIiR7ZXNjKHRoaXMudmFsdWUpfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIil7XG4gICAgICAgICAgICBsZXQgZXYgPSAodGhpcy5leHRyYVZhbHVlICYmIHRoaXMuZXh0cmFWYWx1ZSAhPT0gXCJBbnlcIikgPyBgZXh0cmFWYWx1ZT1cIiR7dGhpcy5leHRyYVZhbHVlfVwiYCA6IFwiXCI7XG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7ZXNjKHRoaXMub3ApfVwiIHZhbHVlPVwiJHtlc2ModGhpcy52YWx1ZSl9XCIgJHtldn0gY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKXtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHt0aGlzLm9wfVwiIGNvZGU9XCIke3RoaXMuY29kZX1cIiAke2V9YDtcbiAgICAgICAgICAgIGggPSB0aGlzLnZhbHVlcy5tYXAoIHYgPT4gYDx2YWx1ZT4ke2VzYyh2KX08L3ZhbHVlPmAgKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiB0eXBlPVwiJHt0aGlzLnR5cGV9XCIgJHtlfWA7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwibnVsbFwiKVxuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICBpZihoKVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9PiR7aH08L2NvbnN0cmFpbnQ+XFxuYDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGA8Y29uc3RyYWludCAke2d9IC8+XFxuYDtcbiAgICB9XG59IC8vIGVuZCBvZiBjbGFzcyBDb25zdHJhaW50XG5cbmV4cG9ydCB7XG4gICAgTW9kZWwsXG4gICAgZ2V0U3ViY2xhc3NlcyxcbiAgICBnZXRTdXBlcmNsYXNzZXMsXG4gICAgaXNTdWJjbGFzcyxcbiAgICBOb2RlLFxuICAgIFRlbXBsYXRlLFxuICAgIENvbnN0cmFpbnRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21vZGVsLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuLypcbiAqIERhdGEgc3RydWN0dXJlczpcbiAqICAgMC4gVGhlIGRhdGEgbW9kZWwgZm9yIGEgbWluZSBpcyBhIGdyYXBoIG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIFxuICogICBjbGFzc2VzLCB0aGVpciBjb21wb25lbnRzIChhdHRyaWJ1dGVzLCByZWZlcmVuY2VzLCBjb2xsZWN0aW9ucyksIGFuZCByZWxhdGlvbnNoaXBzLlxuICogICAxLiBUaGUgcXVlcnkgaXMgcmVwcmVzZW50ZWQgYnkgYSBkMy1zdHlsZSBoaWVyYXJjaHkgc3RydWN0dXJlOiBhIGxpc3Qgb2ZcbiAqICAgbm9kZXMsIHdoZXJlIGVhY2ggbm9kZSBoYXMgYSBuYW1lIChzdHJpbmcpLCBhbmQgYSBjaGlsZHJlbiBsaXN0IChwb3NzaWJseSBlbXB0eSBcbiAqICAgbGlzdCBvZiBub2RlcykuIFRoZSBub2RlcyBhbmQgdGhlIHBhcmVudC9jaGlsZCByZWxhdGlvbnNoaXBzIG9mIHRoaXMgc3RydWN0dXJlIFxuICogICBhcmUgd2hhdCBkcml2ZSB0aGUgZGlzbGF5LlxuICogICAyLiBFYWNoIG5vZGUgaW4gdGhlIGRpYWdyYW0gY29ycmVzcG9uZHMgdG8gYSBjb21wb25lbnQgaW4gYSBwYXRoLCB3aGVyZSBlYWNoXG4gKiAgIHBhdGggc3RhcnRzIHdpdGggdGhlIHJvb3QgY2xhc3MsIG9wdGlvbmFsbHkgcHJvY2VlZHMgdGhyb3VnaCByZWZlcmVuY2VzIGFuZCBjb2xsZWN0aW9ucyxcbiAqICAgYW5kIG9wdGlvbmFsbHkgZW5kcyBhdCBhbiBhdHRyaWJ1dGUuXG4gKlxuICovXG5pbXBvcnQgeyBOVU1FUklDVFlQRVMsIE5VTExBQkxFVFlQRVMsIExFQUZUWVBFUywgT1BTLCBPUElOREVYIH0gZnJvbSAnLi9vcHMuanMnO1xuaW1wb3J0IHtcbiAgICBlc2MsXG4gICAgZDNqc29uUHJvbWlzZSxcbiAgICBzZWxlY3RUZXh0LFxuICAgIGRlZXBjLFxuICAgIHBhcnNlUGF0aFF1ZXJ5LFxuICAgIG9iajJhcnJheSxcbiAgICBpbml0T3B0aW9uTGlzdFxufSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7Y29kZXBvaW50c30gZnJvbSAnLi9tYXRlcmlhbF9pY29uX2NvZGVwb2ludHMuanMnO1xuaW1wb3J0IFVuZG9NYW5hZ2VyIGZyb20gJy4vdW5kb01hbmFnZXIuanMnO1xuaW1wb3J0IHtcbiAgICBNb2RlbCxcbiAgICBnZXRTdWJjbGFzc2VzLFxuICAgIE5vZGUsXG4gICAgVGVtcGxhdGUsXG4gICAgQ29uc3RyYWludFxufSBmcm9tICcuL21vZGVsLmpzJztcbmltcG9ydCB7IGluaXRSZWdpc3RyeSB9IGZyb20gJy4vcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgZWRpdFZpZXdzIH0gZnJvbSAnLi9lZGl0Vmlld3MuanMnO1xuaW1wb3J0IHsgQ29uc3RyYWludEVkaXRvciB9IGZyb20gJy4vY29uc3RyYWludEVkaXRvci5qcyc7XG5cbmxldCBWRVJTSU9OID0gXCIwLjEuMFwiO1xuXG5sZXQgY3Vyck1pbmU7XG5sZXQgY3VyclRlbXBsYXRlO1xubGV0IGN1cnJOb2RlO1xuXG5sZXQgbmFtZTJtaW5lO1xubGV0IG07XG5sZXQgdztcbmxldCBoO1xubGV0IGk7XG5sZXQgcm9vdDtcbmxldCBkaWFnb25hbDtcbmxldCB2aXM7XG5sZXQgbm9kZXM7XG5sZXQgbGlua3M7XG5sZXQgZHJhZ0JlaGF2aW9yID0gbnVsbDtcbmxldCBhbmltYXRpb25EdXJhdGlvbiA9IDI1MDsgLy8gbXNcbmxldCBkZWZhdWx0Q29sb3JzID0geyBoZWFkZXI6IHsgbWFpbjogXCIjNTk1NDU1XCIsIHRleHQ6IFwiI2ZmZlwiIH0gfTtcbmxldCBkZWZhdWx0TG9nbyA9IFwiaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9pbnRlcm1pbmUvZGVzaWduLW1hdGVyaWFscy83OGExM2RiNS9sb2dvcy9pbnRlcm1pbmUvc3F1YXJlaXNoLzQ1eDQ1LnBuZ1wiO1xubGV0IHVuZG9NZ3IgPSBuZXcgVW5kb01hbmFnZXIoKTtcbi8vIFN0YXJ0aW5nIGVkaXQgdmlldyBpcyB0aGUgbWFpbiBxdWVyeSB2aWV3LlxubGV0IGVkaXRWaWV3ID0gZWRpdFZpZXdzLnF1ZXJ5TWFpbjtcbi8vXG5sZXQgY29uc3RyYWludEVkaXRvciA9IFxuICAgIG5ldyBDb25zdHJhaW50RWRpdG9yKG4gPT4ge1xuICAgICAgICBzaG93RGlhbG9nKG4sIG51bGwsIHRydWUpO1xuICAgICAgICBzYXZlU3RhdGUobik7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICB9KTtcblxuLy8gU2V0dXAgZnVuY3Rpb25cbmZ1bmN0aW9uIHNldHVwKCl7XG4gICAgbSA9IFsyMCwgMTIwLCAyMCwgMTIwXVxuICAgIHcgPSAxMjgwIC0gbVsxXSAtIG1bM11cbiAgICBoID0gODAwIC0gbVswXSAtIG1bMl1cbiAgICBpID0gMFxuXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoJyNmb290ZXIgW25hbWU9XCJ2ZXJzaW9uXCJdJylcbiAgICAgICAgLnRleHQoYFFCIHYke1ZFUlNJT059YCk7XG5cbiAgICAvLyB0aGFua3MgdG86IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1MDA3ODc3L2hvdy10by11c2UtdGhlLWQzLWRpYWdvbmFsLWZ1bmN0aW9uLXRvLWRyYXctY3VydmVkLWxpbmVzXG4gICAgZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKVxuICAgICAgICAuc291cmNlKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnNvdXJjZS55LCBcInlcIjpkLnNvdXJjZS54fTsgfSkgICAgIFxuICAgICAgICAudGFyZ2V0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHtcInhcIjpkLnRhcmdldC55LCBcInlcIjpkLnRhcmdldC54fTsgfSlcbiAgICAgICAgLnByb2plY3Rpb24oZnVuY3Rpb24oZCkgeyByZXR1cm4gW2QueSwgZC54XTsgfSk7XG4gICAgXG4gICAgLy8gY3JlYXRlIHRoZSBTVkcgY29udGFpbmVyXG4gICAgdmlzID0gZDMuc2VsZWN0KFwiI3N2Z0NvbnRhaW5lciBzdmdcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3ICsgbVsxXSArIG1bM10pXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGggKyBtWzBdICsgbVsyXSlcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgaGlkZURpYWxvZylcbiAgICAgIC5hcHBlbmQoXCJzdmc6Z1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1bM10gKyBcIixcIiArIG1bMF0gKyBcIilcIik7XG4gICAgLy9cbiAgICBkMy5zZWxlY3QoJy5idXR0b25bbmFtZT1cIm9wZW5jbG9zZVwiXScpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IFxuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QoXCIjdEluZm9CYXJcIik7XG4gICAgICAgICAgICBsZXQgd2FzQ2xvc2VkID0gdC5jbGFzc2VkKFwiY2xvc2VkXCIpO1xuICAgICAgICAgICAgbGV0IGlzQ2xvc2VkID0gIXdhc0Nsb3NlZDtcbiAgICAgICAgICAgIGxldCBkID0gZDMuc2VsZWN0KCcjZHJhd2VyJylbMF1bMF1cbiAgICAgICAgICAgIGlmIChpc0Nsb3NlZClcbiAgICAgICAgICAgICAgICAvLyBzYXZlIHRoZSBjdXJyZW50IGhlaWdodCBqdXN0IGJlZm9yZSBjbG9zaW5nXG4gICAgICAgICAgICAgICAgZC5fX3NhdmVkX2hlaWdodCA9IGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgZWxzZSBpZiAoZC5fX3NhdmVkX2hlaWdodClcbiAgICAgICAgICAgICAgIC8vIG9uIG9wZW4sIHJlc3RvcmUgdGhlIHNhdmVkIGhlaWdodFxuICAgICAgICAgICAgICAgZDMuc2VsZWN0KCcjZHJhd2VyJykuc3R5bGUoXCJoZWlnaHRcIiwgZC5fX3NhdmVkX2hlaWdodCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0LmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoXCJjbG9zZWRcIiwgaXNDbG9zZWQpO1xuICAgICAgICB9KTtcblxuICAgIGluaXRSZWdpc3RyeShpbml0TWluZXMpO1xuXG4gICAgZDMuc2VsZWN0QWxsKFwiI3R0ZXh0IGxhYmVsIHNwYW5cIilcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBkMy5zZWxlY3QoJyN0dGV4dCcpLmF0dHIoJ2NsYXNzJywgJ2ZsZXhjb2x1bW4gJyt0aGlzLmlubmVyVGV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIHVwZGF0ZVR0ZXh0KGN1cnJUZW1wbGF0ZSk7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdCgnI3J1bmF0bWluZScpXG4gICAgICAgIC5vbignY2xpY2snLCAoKSA9PiBydW5hdG1pbmUoY3VyclRlbXBsYXRlKSk7XG4gICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCB0ID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHR1cm5TeW5jT2ZmID0gdC50ZXh0KCkgPT09IFwic3luY1wiO1xuICAgICAgICAgICAgdC50ZXh0KCB0dXJuU3luY09mZiA/IFwic3luY19kaXNhYmxlZFwiIDogXCJzeW5jXCIgKVxuICAgICAgICAgICAgIC5hdHRyKFwidGl0bGVcIiwgKCkgPT5cbiAgICAgICAgICAgICAgICAgYENvdW50IGF1dG9zeW5jIGlzICR7IHR1cm5TeW5jT2ZmID8gXCJPRkZcIiA6IFwiT05cIiB9LiBDbGljayB0byB0dXJuIGl0ICR7IHR1cm5TeW5jT2ZmID8gXCJPTlwiIDogXCJPRkZcIiB9LmApO1xuICAgICAgICAgICAgIXR1cm5TeW5jT2ZmICYmIHVwZGF0ZUNvdW50KGN1cnJUZW1wbGF0ZSk7XG4gICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQnKS5jbGFzc2VkKFwic3luY29mZlwiLCB0dXJuU3luY09mZik7XG4gICAgICAgIH0pO1xuICAgIGQzLnNlbGVjdChcIiN4bWx0ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJ4bWx0ZXh0YXJlYVwiKX0pO1xuICAgIGQzLnNlbGVjdChcIiNqc29udGV4dGFyZWFcIilcbiAgICAgICAgLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKXsgdGhpcy52YWx1ZSAmJiBzZWxlY3RUZXh0KFwianNvbnRleHRhcmVhXCIpfSk7XG5cbiAgLy9cbiAgZHJhZ0JlaGF2aW9yID0gZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgLm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBvbiBkcmFnLCBmb2xsb3cgdGhlIG1vdXNlIGluIHRoZSBZIGRpbWVuc2lvbi5cbiAgICAgIC8vIERyYWcgY2FsbGJhY2sgaXMgYXR0YWNoZWQgdG8gdGhlIGRyYWcgaGFuZGxlLlxuICAgICAgbGV0IG5vZGVHcnAgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAvLyB1cGRhdGUgbm9kZSdzIHktY29vcmRpbmF0ZVxuICAgICAgbm9kZUdycC5hdHRyKFwidHJhbnNmb3JtXCIsIChuKSA9PiB7XG4gICAgICAgICAgbi55ID0gZDMuZXZlbnQueTtcbiAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke24ueH0sJHtuLnl9KWA7XG4gICAgICB9KTtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgbm9kZSdzIGxpbmtcbiAgICAgIGxldCBsbCA9IGQzLnNlbGVjdChgcGF0aC5saW5rW3RhcmdldD1cIiR7bm9kZUdycC5hdHRyKCdpZCcpfVwiXWApO1xuICAgICAgbGwuYXR0cihcImRcIiwgZGlhZ29uYWwpO1xuICAgICAgfSlcbiAgICAub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIG9uIGRyYWdlbmQsIHJlc29ydCB0aGUgZHJhZ2dhYmxlIG5vZGVzIGFjY29yZGluZyB0byB0aGVpciBZIHBvc2l0aW9uXG4gICAgICBsZXQgbm9kZXMgPSBkMy5zZWxlY3RBbGwoZWRpdFZpZXcuZHJhZ2dhYmxlKS5kYXRhKClcbiAgICAgIG5vZGVzLnNvcnQoIChhLCBiKSA9PiBhLnkgLSBiLnkgKTtcbiAgICAgIC8vIHRoZSBub2RlIHRoYXQgd2FzIGRyYWdnZWRcbiAgICAgIGxldCBkcmFnZ2VkID0gZDMuc2VsZWN0KHRoaXMpLmRhdGEoKVswXTtcbiAgICAgIC8vIGNhbGxiYWNrIGZvciBzcGVjaWZpYyBkcmFnLWVuZCBiZWhhdmlvclxuICAgICAgZWRpdFZpZXcuYWZ0ZXJEcmFnICYmIGVkaXRWaWV3LmFmdGVyRHJhZyhub2RlcywgZHJhZ2dlZCk7XG4gICAgICAvL1xuICAgICAgc2F2ZVN0YXRlKGRyYWdnZWQpO1xuICAgICAgdXBkYXRlKCk7XG4gICAgICAvL1xuICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdE1pbmVzKGpfbWluZXMpIHtcbiAgICB2YXIgbWluZXMgPSBqX21pbmVzLmluc3RhbmNlcztcbiAgICBuYW1lMm1pbmUgPSB7fTtcbiAgICBtaW5lcy5mb3JFYWNoKGZ1bmN0aW9uKG0peyBuYW1lMm1pbmVbbS5uYW1lXSA9IG07IH0pO1xuICAgIGN1cnJNaW5lID0gbWluZXNbMF07XG4gICAgY3VyclRlbXBsYXRlID0gbnVsbDtcblxuICAgIHZhciBtbCA9IGQzLnNlbGVjdChcIiNtbGlzdFwiKS5zZWxlY3RBbGwoXCJvcHRpb25cIikuZGF0YShtaW5lcyk7XG4gICAgdmFyIHNlbGVjdE1pbmUgPSBcIk1vdXNlTWluZVwiO1xuICAgIG1sLmVudGVyKCkuYXBwZW5kKFwib3B0aW9uXCIpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7cmV0dXJuIGQubmFtZTt9KVxuICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5zdGFydHNXaXRoKFwiaHR0cHNcIik7XG4gICAgICAgICAgICB2YXIgbSA9IGQudXJsLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgIHZhciB2ID0gKHcgJiYgIW0pIHx8IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZT09PXNlbGVjdE1pbmUgfHwgbnVsbDsgfSlcbiAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pO1xuICAgIC8vXG4gICAgLy8gd2hlbiBhIG1pbmUgaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdFxuICAgIGQzLnNlbGVjdChcIiNtbGlzdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgc2VsZWN0ZWRNaW5lKHRoaXMudmFsdWUpOyB9KTtcbiAgICAvL1xuICAgIHZhciBkZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIik7XG4gICAgZGcuY2xhc3NlZChcImhpZGRlblwiLHRydWUpXG4gICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5jbG9zZVwiKS5vbihcImNsaWNrXCIsIGhpZGVEaWFsb2cpO1xuICAgIGRnLnNlbGVjdChcIi5idXR0b24ucmVtb3ZlXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4gcmVtb3ZlTm9kZShjdXJyTm9kZSkpO1xuXG4gICAgLy8gXG4gICAgLy9cbiAgICBkMy5zZWxlY3QoXCIjZWRpdFZpZXcgc2VsZWN0XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7IHNldEVkaXRWaWV3KHRoaXMudmFsdWUpOyB9KVxuICAgICAgICA7XG5cbiAgICAvLyBXaXJlIHVwIHNlbGVjdCBidXR0b24gaW4gZGlhbG9nXG4gICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3Vyck5vZGUuaXNTZWxlY3RlZCA/IGN1cnJOb2RlLnVuc2VsZWN0KCkgOiBjdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgICAgIH0pO1xuICAgIC8vIFdpcmUgdXAgc29ydCBmdW5jdGlvbiBpbiBkaWFsb2dcbiAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzb3J0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGNjID0gZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdJyk7XG4gICAgICAgICAgICBpZiAoY2MuY2xhc3NlZChcImRpc2FibGVkXCIpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGxldCBvbGRzb3J0ID0gY2MuY2xhc3NlZChcInNvcnRhc2NcIikgPyBcImFzY1wiIDogY2MuY2xhc3NlZChcInNvcnRkZXNjXCIpID8gXCJkZXNjXCIgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgIGxldCBuZXdzb3J0ID0gb2xkc29ydCA9PT0gXCJhc2NcIiA/IFwiZGVzY1wiIDogb2xkc29ydCA9PT0gXCJkZXNjXCIgPyBcIm5vbmVcIiA6IFwiYXNjXCI7XG4gICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGFzY1wiLCBuZXdzb3J0ID09PSBcImFzY1wiKTtcbiAgICAgICAgICAgIGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuZXdzb3J0ID09PSBcImRlc2NcIik7XG4gICAgICAgICAgICBjdXJyTm9kZS5zZXRTb3J0KG5ld3NvcnQpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgZmlyc3QgbWluZSBieSBkZWZhdWx0LlxuICAgIHNlbGVjdGVkTWluZShzZWxlY3RNaW5lKTtcbn1cbi8vXG5mdW5jdGlvbiBjbGVhclN0YXRlKCkge1xuICAgIHVuZG9NZ3IuY2xlYXIoKTtcbn1cbmZ1bmN0aW9uIHNhdmVTdGF0ZShuKSB7XG4gICAgbGV0IHMgPSBKU09OLnN0cmluZ2lmeShuLnRlbXBsYXRlLnVuY29tcGlsZVRlbXBsYXRlKCkpO1xuICAgIGlmICghdW5kb01nci5oYXNTdGF0ZSB8fCB1bmRvTWdyLmN1cnJlbnRTdGF0ZSAhPT0gcylcbiAgICAgICAgLy8gb25seSBzYXZlIHN0YXRlIGlmIGl0IGhhcyBjaGFuZ2VkXG4gICAgICAgIHVuZG9NZ3IuYWRkKHMpO1xufVxuZnVuY3Rpb24gdW5kbygpIHsgdW5kb3JlZG8oXCJ1bmRvXCIpIH1cbmZ1bmN0aW9uIHJlZG8oKSB7IHVuZG9yZWRvKFwicmVkb1wiKSB9XG5mdW5jdGlvbiB1bmRvcmVkbyh3aGljaCl7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHMgPSBKU09OLnBhcnNlKHVuZG9NZ3Jbd2hpY2hdKCkpO1xuICAgICAgICBlZGl0VGVtcGxhdGUocywgdHJ1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbi8vIENhbGxlZCB3aGVuIHVzZXIgc2VsZWN0cyBhIG1pbmUgZnJvbSB0aGUgb3B0aW9uIGxpc3Rcbi8vIExvYWRzIHRoYXQgbWluZSdzIGRhdGEgbW9kZWwgYW5kIGFsbCBpdHMgdGVtcGxhdGVzLlxuLy8gVGhlbiBpbml0aWFsaXplcyBkaXNwbGF5IHRvIHNob3cgdGhlIGZpcnN0IHRlcm1wbGF0ZSdzIHF1ZXJ5LlxuZnVuY3Rpb24gc2VsZWN0ZWRNaW5lKG1uYW1lKXtcbiAgICBpZighbmFtZTJtaW5lW21uYW1lXSkgdGhyb3cgXCJObyBtaW5lIG5hbWVkOiBcIiArIG1uYW1lO1xuICAgIGxldCBjbSA9IGN1cnJNaW5lID0gbmFtZTJtaW5lW21uYW1lXTtcbiAgICBjbGVhclN0YXRlKCk7XG4gICAgbGV0IHVybCA9IGNtLnVybDtcbiAgICBsZXQgdHVybCwgbXVybCwgbHVybCwgYnVybCwgc3VybCwgb3VybDtcbiAgICBjbS50bmFtZXMgPSBbXVxuICAgIGNtLnRlbXBsYXRlcyA9IFtdXG4gICAgaWYgKG1uYW1lID09PSBcInRlc3RcIikgeyBcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3RlbXBsYXRlcy5qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9tb2RlbC5qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9saXN0cy5qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9icmFuZGluZy5qc29uXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zdW1tYXJ5ZmllbGRzLmpzb25cIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL29yZ2FuaXNtbGlzdC5qc29uXCI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0dXJsID0gdXJsICsgXCIvc2VydmljZS90ZW1wbGF0ZXM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbXVybCA9IHVybCArIFwiL3NlcnZpY2UvbW9kZWw/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgbHVybCA9IHVybCArIFwiL3NlcnZpY2UvbGlzdHM/Zm9ybWF0PWpzb25cIjtcbiAgICAgICAgYnVybCA9IHVybCArIFwiL3NlcnZpY2UvYnJhbmRpbmdcIjtcbiAgICAgICAgc3VybCA9IHVybCArIFwiL3NlcnZpY2Uvc3VtbWFyeWZpZWxkc1wiO1xuICAgICAgICBvdXJsID0gdXJsICsgXCIvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSUzQ3F1ZXJ5K25hbWUlM0QlMjIlMjIrbW9kZWwlM0QlMjJnZW5vbWljJTIyK3ZpZXclM0QlMjJPcmdhbmlzbS5zaG9ydE5hbWUlMjIrbG9uZ0Rlc2NyaXB0aW9uJTNEJTIyJTIyJTNFJTNDJTJGcXVlcnklM0UmZm9ybWF0PWpzb25vYmplY3RzXCI7XG4gICAgfVxuICAgIC8vIGdldCB0aGUgbW9kZWxcbiAgICBjb25zb2xlLmxvZyhcIkxvYWRpbmcgcmVzb3VyY2VzIGZyb20gXCIgKyB1cmwgKTtcbiAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGQzanNvblByb21pc2UobXVybCksXG4gICAgICAgIGQzanNvblByb21pc2UodHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UobHVybCksXG4gICAgICAgIGQzanNvblByb21pc2UoYnVybCksXG4gICAgICAgIGQzanNvblByb21pc2Uoc3VybCksXG4gICAgICAgIGQzanNvblByb21pc2Uob3VybClcbiAgICBdKS50aGVuKCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBqX21vZGVsID0gZGF0YVswXTtcbiAgICAgICAgdmFyIGpfdGVtcGxhdGVzID0gZGF0YVsxXTtcbiAgICAgICAgdmFyIGpfbGlzdHMgPSBkYXRhWzJdO1xuICAgICAgICB2YXIgal9icmFuZGluZyA9IGRhdGFbM107XG4gICAgICAgIHZhciBqX3N1bW1hcnkgPSBkYXRhWzRdO1xuICAgICAgICB2YXIgal9vcmdhbmlzbXMgPSBkYXRhWzVdO1xuICAgICAgICAvL1xuICAgICAgICBjbS5tb2RlbCA9IG5ldyBNb2RlbChqX21vZGVsLm1vZGVsLCBjbSlcbiAgICAgICAgY20udGVtcGxhdGVzID0gal90ZW1wbGF0ZXMudGVtcGxhdGVzO1xuICAgICAgICBjbS5saXN0cyA9IGpfbGlzdHMubGlzdHM7XG4gICAgICAgIGNtLnN1bW1hcnlGaWVsZHMgPSBqX3N1bW1hcnkuY2xhc3NlcztcbiAgICAgICAgY20ub3JnYW5pc21MaXN0ID0gal9vcmdhbmlzbXMucmVzdWx0cy5tYXAobyA9PiBvLnNob3J0TmFtZSk7XG4gICAgICAgIC8vXG4gICAgICAgIGNtLnRsaXN0ID0gb2JqMmFycmF5KGNtLnRlbXBsYXRlcylcbiAgICAgICAgY20udGxpc3Quc29ydChmdW5jdGlvbihhLGIpeyBcbiAgICAgICAgICAgIHJldHVybiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogYS50aXRsZSA+IGIudGl0bGUgPyAxIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNtLnRuYW1lcyA9IE9iamVjdC5rZXlzKCBjbS50ZW1wbGF0ZXMgKTtcbiAgICAgICAgY20udG5hbWVzLnNvcnQoKTtcbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgc2VsZWN0aW9uIGxpc3Qgb2YgdGVtcGxhdGVzIGZvciB0aGlzIG1pbmUuXG4gICAgICAgIHZhciB0bCA9IGQzLnNlbGVjdChcIiN0bGlzdCBzZWxlY3RcIilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YSggY20udGxpc3QgKTtcbiAgICAgICAgdGwuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpXG4gICAgICAgIHRsLmV4aXQoKS5yZW1vdmUoKVxuICAgICAgICB0bC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7cmV0dXJuIGQudGl0bGU7fSk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIHN0YXJ0RWRpdCk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShjbS50ZW1wbGF0ZXNbY20udGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGNtLmNvbG9ycyB8fCBkZWZhdWx0Q29sb3JzO1xuICAgICAgICBsZXQgYmdjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci5tYWluIDogY2xycy5tYWluLmZnO1xuICAgICAgICBsZXQgdHhjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci50ZXh0IDogY2xycy5tYWluLmJnO1xuICAgICAgICBsZXQgbG9nbyA9IGNtLmltYWdlcy5sb2dvIHx8IGRlZmF1bHRMb2dvO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdG9vbHRyYXlcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNtaW5lTG9nb1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgbG9nbyk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGNtLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0IFxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjbS5tb2RlbC5jbGFzc2VzKS5maWx0ZXIoY24gPT4gISBjbS5tb2RlbC5jbGFzc2VzW2NuXS5pc0xlYWZUeXBlKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZEVkaXRTb3VyY2UodGhpcy52YWx1ZSk7IHN0YXJ0RWRpdCgpOyB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpWzBdWzBdLnZhbHVlID0gXCJcIjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG5cbiAgICB9LCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y20ubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgIH0pO1xufVxuXG4vLyBCZWdpbnMgYW4gZWRpdCwgYmFzZWQgb24gdXNlciBjb250cm9scy5cbmZ1bmN0aW9uIHN0YXJ0RWRpdCgpIHtcbiAgICAvLyBzZWxlY3RvciBmb3IgY2hvb3NpbmcgZWRpdCBpbnB1dCBzb3VyY2UsIGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgLy8gdGhlIGNob3NlbiBlZGl0IHNvdXJjZVxuICAgIGxldCBpbnB1dElkID0gc3JjU2VsZWN0b3JbMF1bMF0udmFsdWU7XG4gICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgbGV0IHNyYyA9IGQzLnNlbGVjdChgIyR7aW5wdXRJZH0gW25hbWU9XCJpblwiXWApO1xuICAgIC8vIHRoZSBxdWVyeSBzdGFydGluZyBwb2ludFxuICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICBpZiAoaW5wdXRJZCA9PT0gXCJ0bGlzdFwiKSB7XG4gICAgICAgIC8vIGEgc2F2ZWQgcXVlcnkgb3IgdGVtcGxhdGVcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1t2YWxdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAvLyBhIG5ldyBxdWVyeSBmcm9tIGEgc2VsZWN0ZWQgc3RhcnRpbmcgY2xhc3NcbiAgICAgICAgbGV0IG50ID0gbmV3IFRlbXBsYXRlKCk7XG4gICAgICAgIG50LnNlbGVjdC5wdXNoKHZhbCtcIi5pZFwiKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKG50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnR4bWxcIikge1xuICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0anNvblwiKSB7XG4gICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbn1cblxuLy8gXG5mdW5jdGlvbiBzZWxlY3RlZEVkaXRTb3VyY2Uoc2hvdyl7XG4gICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG59XG5cbi8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbi8vXG5mdW5jdGlvbiByZW1vdmVOb2RlKG4pIHtcbiAgICBuLnJlbW92ZSgpO1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICBzYXZlU3RhdGUobik7XG4gICAgdXBkYXRlKG4ucGFyZW50IHx8IG4pO1xufVxuXG4vLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbi8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4vLyBmb3IgZDMgdHJlZSBkaXNwbGF5LlxuLy9cbmZ1bmN0aW9uIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIGxldCBjdCA9IGN1cnJUZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZSh0LCBjdXJyTWluZS5tb2RlbCk7XG4gICAgLy9cbiAgICByb290ID0gY3QucXRyZWVcbiAgICByb290LngwID0gMDtcbiAgICByb290LnkwID0gaCAvIDI7XG4gICAgLy9cbiAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcblxuICAgIGlmICghIG5vc2F2ZSkgc2F2ZVN0YXRlKGN0LnF0cmVlKTtcblxuICAgIC8vIEZpbGwgaW4gdGhlIGJhc2ljIHRlbXBsYXRlIGluZm9ybWF0aW9uIChuYW1lLCB0aXRsZSwgZGVzY3JpcHRpb24sIGV0Yy4pXG4gICAgLy9cbiAgICB2YXIgdGkgPSBkMy5zZWxlY3QoXCIjdEluZm9cIik7XG4gICAgdmFyIHhmZXIgPSBmdW5jdGlvbihuYW1lLCBlbHQpeyBjdFtuYW1lXSA9IGVsdC52YWx1ZTsgdXBkYXRlVHRleHQoY3QpOyB9O1xuICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3QubmFtZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJuYW1lXCIsIHRoaXMpIH0pO1xuICAgIC8vIFRpdGxlICh3aGF0IHRoZSB1c2VyIHNlZXMpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cInRpdGxlXCJdIGlucHV0JylcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC50aXRsZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBEZXNjcmlwdGlvbiAod2hhdCBpdCBkb2VzIC0gYSBsaXR0bGUgZG9jdW1lbnRhdGlvbikuXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3QuZGVzY3JpcHRpb24pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiZGVzY3JpcHRpb25cIiwgdGhpcykgfSk7XG4gICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy4gXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdC5jb21tZW50KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImNvbW1lbnRcIiwgdGhpcykgfSk7XG5cbiAgICAvLyBMb2dpYyBleHByZXNzaW9uIC0gd2hpY2ggdGllcyB0aGUgaW5kaXZpZHVhbCBjb25zdHJhaW50cyB0b2dldGhlclxuICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBjdC5jb25zdHJhaW50TG9naWMgfSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB4ZmVyKFwiY29uc3RyYWludExvZ2ljXCIsIHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgLy8gQ2xlYXIgdGhlIHF1ZXJ5IGNvdW50XG4gICAgZDMuc2VsZWN0KFwiI3F1ZXJ5Y291bnQgc3BhblwiKS50ZXh0KFwiXCIpO1xuXG4gICAgLy9cbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG4vLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuLy8gQXJnczpcbi8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbi8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuLy8gICBwIChzdHJpbmcpIE5hbWUgb2YgYW4gYXR0cmlidXRlLCByZWYsIG9yIGNvbGxlY3Rpb25cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4vLyAgIFRoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQgb24gdGhlIGNoaWxkIG5vZGUuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuLy8gICBjaGlsZCwgYW5kIHRoZSBjb25zdHJhaW50IGVkaXRvciBvcGVuZWQgIG9uIHRoYXQgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIG1vZGUsIHApe1xuICAgIGxldCBuO1xuICAgIGxldCBjYztcbiAgICBsZXQgc2ZzO1xuICAgIGxldCBjdCA9IGN1cnJOb2RlLnRlbXBsYXRlO1xuICAgIGlmIChtb2RlID09PSBcInN1bW1hcnlmaWVsZHNcIikge1xuICAgICAgICBzZnMgPSBjdXJyTWluZS5zdW1tYXJ5RmllbGRzW2N1cnJOb2RlLm5vZGVUeXBlLm5hbWVdfHxbXTtcbiAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBjdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgIGxldCBtID0gY3QuYWRkUGF0aChzZik7XG4gICAgICAgICAgICBpZiAoISBtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBtLnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHAgPSBjdXJyTm9kZS5wYXRoICsgXCIuXCIgKyBwO1xuICAgICAgICBuID0gY3QuYWRkUGF0aChwKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwic2VsZWN0ZWRcIilcbiAgICAgICAgICAgICFuLmlzU2VsZWN0ZWQgJiYgbi5zZWxlY3QoKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwiY29uc3RyYWluZWRcIikge1xuICAgICAgICAgICAgY2MgPSBuLmFkZENvbnN0cmFpbnQoKVxuICAgICAgICB9XG4gICAgfVxuICAgIGhpZGVEaWFsb2coKTtcbiAgICBpZiAobW9kZSAhPT0gXCJvcGVuXCIpXG4gICAgICAgIHNhdmVTdGF0ZShjdXJyTm9kZSk7XG4gICAgaWYgKG1vZGUgIT09IFwic3VtbWFyeWZpZWxkc1wiKSBcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2hvd0RpYWxvZyhuKTtcbiAgICAgICAgICAgIGNjICYmIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW50RWRpdG9yLm9wZW4oY2MsIG4pXG4gICAgICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbiAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgIFxufVxuLy8gUmV0dXJucyAgdGhlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIGRhdGEgb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGZpbmREb21CeURhdGFPYmooZCl7XG4gICAgdmFyIHggPSBkMy5zZWxlY3RBbGwoXCIubm9kZWdyb3VwIC5ub2RlXCIpLmZpbHRlcihmdW5jdGlvbihkZCl7IHJldHVybiBkZCA9PT0gZDsgfSk7XG4gICAgcmV0dXJuIHhbMF1bMF07XG59XG5cbi8vIE9wZW5zIGEgZGlhbG9nIG9uIHRoZSBzcGVjaWZpZWQgbm9kZS5cbi8vIEFsc28gbWFrZXMgdGhhdCBub2RlIHRoZSBjdXJyZW50IG5vZGUuXG4vLyBBcmdzOlxuLy8gICBuICAgIHRoZSBub2RlXG4vLyAgIGVsdCAgdGhlIERPTSBlbGVtZW50IChlLmcuIGEgY2lyY2xlKVxuLy8gUmV0dXJuc1xuLy8gICBzdHJpbmdcbi8vIFNpZGUgZWZmZWN0OlxuLy8gICBzZXRzIGdsb2JhbCBjdXJyTm9kZVxuLy9cbmZ1bmN0aW9uIHNob3dEaWFsb2cobiwgZWx0LCByZWZyZXNoT25seSl7XG4gIGlmICghZWx0KSBlbHQgPSBmaW5kRG9tQnlEYXRhT2JqKG4pO1xuICBjb25zdHJhaW50RWRpdG9yLmhpZGUoKTtcbiBcbiAgLy8gU2V0IHRoZSBnbG9iYWwgY3Vyck5vZGVcbiAgY3Vyck5vZGUgPSBuO1xuICB2YXIgaXNyb290ID0gISBjdXJyTm9kZS5wYXJlbnQ7XG4gIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIikuZGF0dW0obik7XG4gIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICB2YXIgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgZWJiID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgdmFyIGIgPSAoYmJiLmJvdHRvbSAtIGViYi5ib3R0b20pICsgZWJiLndpZHRoLzI7XG4gIHZhciBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICB2YXIgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAvLyBOQjogY2FuJ3QgZ2V0IG9wZW5pbmcgdXAgdG8gd29yaywgc28gaGFyZCB3aXJlIGl0IHRvIGRvd24uIDotXFxcblxuICAvL1xuICBkaWFsb2dcbiAgICAgIC5zdHlsZShcImxlZnRcIiwgbCtcInB4XCIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgLmNsYXNzZWQoXCJpc3Jvb3RcIiwgaXNyb290KVxuICAgICAgO1xuICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm0tb3JpZ2luXCIsIFwiMCUgMCVcIikgO1xuICBlbHNlXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gIC8vIFNldCB0aGUgZGlhbG9nIHRpdGxlIHRvIG5vZGUgbmFtZVxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgLnRleHQobi5uYW1lKTtcbiAgLy8gU2hvdyB0aGUgZnVsbCBwYXRoXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgIC50ZXh0KG4ucGF0aCk7XG4gIC8vIFR5cGUgYXQgdGhpcyBub2RlXG4gIHZhciB0cCA9IG4ucHR5cGUubmFtZSB8fCBuLnB0eXBlO1xuICB2YXIgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gIHZhciB0c3RyaW5nID0gc3RwICYmIGA8c3BhbiBzdHlsZT1cImNvbG9yOiBwdXJwbGU7XCI+JHtzdHB9PC9zcGFuPiAoJHt0cH0pYCB8fCB0cFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gIC8vIFdpcmUgdXAgYWRkIGNvbnN0cmFpbnQgYnV0dG9uXG4gIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGMgPSBuLmFkZENvbnN0cmFpbnQoKTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICBjb25zdHJhaW50RWRpdG9yLm9wZW4oYywgbik7XG4gICAgICAgIH0pO1xuXG4gIC8vIEZpbGwgb3V0IHRoZSBjb25zdHJhaW50cyBzZWN0aW9uLiBGaXJzdCwgc2VsZWN0IGFsbCBjb25zdHJhaW50cy5cbiAgdmFyIGNvbnN0cnMgPSBkaWFsb2cuc2VsZWN0KFwiLmNvbnN0cmFpbnRTZWN0aW9uXCIpXG4gICAgICAuc2VsZWN0QWxsKFwiLmNvbnN0cmFpbnRcIilcbiAgICAgIC5kYXRhKG4uY29uc3RyYWludHMpO1xuICAvLyBFbnRlcigpOiBjcmVhdGUgZGl2cyBmb3IgZWFjaCBjb25zdHJhaW50IHRvIGJlIGRpc3BsYXllZCAgKFRPRE86IHVzZSBhbiBIVE1MNSB0ZW1wbGF0ZSBpbnN0ZWFkKVxuICAvLyAxLiBjb250YWluZXJcbiAgdmFyIGNkaXZzID0gY29uc3Rycy5lbnRlcigpLmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIixcImNvbnN0cmFpbnRcIikgO1xuICAvLyAyLiBvcGVyYXRvclxuICBjZGl2cy5hcHBlbmQoXCJkaXZcIikuYXR0cihcIm5hbWVcIiwgXCJvcFwiKSA7XG4gIC8vIDMuIHZhbHVlXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcInZhbHVlXCIpIDtcbiAgLy8gNC4gY29uc3RyYWludCBjb2RlXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcImNvZGVcIikgO1xuICAvLyA1LiBidXR0b24gdG8gZWRpdCB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBlZGl0XCIpLnRleHQoXCJtb2RlX2VkaXRcIikuYXR0cihcInRpdGxlXCIsXCJFZGl0IHRoaXMgY29uc3RyYWludFwiKTtcbiAgLy8gNi4gYnV0dG9uIHRvIHJlbW92ZSB0aGlzIGNvbnN0cmFpbnRcbiAgY2RpdnMuYXBwZW5kKFwiaVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXRlcmlhbC1pY29ucyBjYW5jZWxcIikudGV4dChcImRlbGV0ZV9mb3JldmVyXCIpLmF0dHIoXCJ0aXRsZVwiLFwiUmVtb3ZlIHRoaXMgY29uc3RyYWludFwiKTtcblxuICAvLyBSZW1vdmUgZXhpdGluZ1xuICBjb25zdHJzLmV4aXQoKS5yZW1vdmUoKSA7XG5cbiAgLy8gU2V0IHRoZSB0ZXh0IGZvciBlYWNoIGNvbnN0cmFpbnRcbiAgY29uc3Ryc1xuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihjKSB7IHJldHVybiBcImNvbnN0cmFpbnQgXCIgKyBjLmN0eXBlOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwiY29kZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXsgcmV0dXJuIGMuY29kZSB8fCBcIj9cIjsgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KCdbbmFtZT1cIm9wXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5vcCB8fCBcIklTQVwiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwidmFsdWVcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgLy8gRklYTUUgXG4gICAgICAgICAgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGMudmFsdWUgKyAoYy5leHRyYVZhbHVlID8gXCIgaW4gXCIgKyBjLmV4dHJhVmFsdWUgOiBcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSB8fCAoYy52YWx1ZXMgJiYgYy52YWx1ZXMuam9pbihcIixcIikpIHx8IGMudHlwZTtcbiAgICAgIH0pO1xuICBjb25zdHJzLnNlbGVjdChcImkuZWRpdFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIGNvbnN0cmFpbnRFZGl0b3Iub3BlbihjLCBuKTtcbiAgICAgIH0pO1xuICBjb25zdHJzLnNlbGVjdChcImkuY2FuY2VsXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgbi5yZW1vdmVDb25zdHJhaW50KGMpO1xuICAgICAgICAgIHNhdmVTdGF0ZShuKTtcbiAgICAgICAgICB1cGRhdGUobik7XG4gICAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICAgIH0pXG5cblxuICAvLyBUcmFuc2l0aW9uIHRvIFwiZ3Jvd1wiIHRoZSBkaWFsb2cgb3V0IG9mIHRoZSBub2RlXG4gIGRpYWxvZy50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5zdHlsZShcInRyYW5zZm9ybVwiLFwic2NhbGUoMS4wKVwiKTtcblxuICAvL1xuICB2YXIgdCA9IG4ucGNvbXAudHlwZTtcbiAgaWYgKHR5cGVvZih0KSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgLy8gZGlhbG9nIGZvciBzaW1wbGUgYXR0cmlidXRlcy5cbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsdHJ1ZSk7XG4gICAgICBkaWFsb2cuc2VsZWN0KFwic3Bhbi5jbHNOYW1lXCIpXG4gICAgICAgICAgLnRleHQobi5wY29tcC50eXBlLm5hbWUgfHwgbi5wY29tcC50eXBlICk7XG4gICAgICAvLyBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic2VsZWN0LWN0cmxcIl0nKVxuICAgICAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24obil7IHJldHVybiBuLmlzU2VsZWN0ZWQgfSk7XG4gICAgICAvLyBcbiAgICAgIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwic29ydC1jdHJsXCJdJylcbiAgICAgICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsIG4gPT4gIW4uY2FuU29ydCgpKVxuICAgICAgICAgIC5jbGFzc2VkKFwic29ydGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0ZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICB9XG4gIGVsc2Uge1xuICAgICAgLy8gRGlhbG9nIGZvciBjbGFzc2VzXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLGZhbHNlKTtcbiAgICAgIGRpYWxvZy5zZWxlY3QoXCJzcGFuLmNsc05hbWVcIilcbiAgICAgICAgICAudGV4dChuLnBjb21wLnR5cGUgPyBuLnBjb21wLnR5cGUubmFtZSA6IG4ucGNvbXAubmFtZSk7XG5cbiAgICAgIC8vIHdpcmUgdXAgdGhlIGJ1dHRvbiB0byBzaG93IHN1bW1hcnkgZmllbGRzXG4gICAgICBkaWFsb2cuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2hvd1N1bW1hcnlcIl0nKVxuICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHNlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJzdW1tYXJ5ZmllbGRzXCIpKTtcblxuICAgICAgLy8gRmlsbCBpbiB0aGUgdGFibGUgbGlzdGluZyBhbGwgdGhlIGF0dHJpYnV0ZXMvcmVmcy9jb2xsZWN0aW9ucy5cbiAgICAgIHZhciB0YmwgPSBkaWFsb2cuc2VsZWN0KFwidGFibGUuYXR0cmlidXRlc1wiKTtcbiAgICAgIHZhciByb3dzID0gdGJsLnNlbGVjdEFsbChcInRyXCIpXG4gICAgICAgICAgLmRhdGEoKG4uc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucHR5cGUpLmFsbFBhcnRzKVxuICAgICAgICAgIDtcbiAgICAgIHJvd3MuZW50ZXIoKS5hcHBlbmQoXCJ0clwiKTtcbiAgICAgIHJvd3MuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgdmFyIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoXCJ0ZFwiKVxuICAgICAgICAgIC5kYXRhKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICAgICAgaWYgKGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIikge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIlNlbGVjdCB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ3NlbGVjdHNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcInNlbGVjdGVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogJzxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkNvbnN0cmFpbiB0aGlzIGF0dHJpYnV0ZVwiPnBsYXlfYXJyb3c8L2k+JyxcbiAgICAgICAgICAgICAgICAgIGNsczogJ2NvbnN0cmFpbnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24gKCl7c2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcImNvbnN0cmFpbmVkXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbXAubmFtZSxcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogYDxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIiB0aXRsZT1cIkZvbGxvdyB0aGlzICR7Y29tcC5raW5kfVwiPnBsYXlfYXJyb3c8L2k+YCxcbiAgICAgICAgICAgICAgICAgIGNsczogJ29wZW5uZXh0JyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwib3BlblwiLCBjb21wLm5hbWUpOyB9XG4gICAgICAgICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICBjbHM6ICcnXG4gICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgO1xuICAgICAgY2VsbHMuZW50ZXIoKS5hcHBlbmQoXCJ0ZFwiKTtcbiAgICAgIGNlbGxzXG4gICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5jbHM7fSlcbiAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLmNsaWNrICYmIGQuY2xpY2soKTsgfSlcbiAgICAgICAgICA7XG4gICAgICBjZWxscy5leGl0KCkucmVtb3ZlKCk7XG4gIH1cbn1cblxuLy8gSGlkZXMgdGhlIGRpYWxvZy4gU2V0cyB0aGUgY3VycmVudCBub2RlIHRvIG51bGwuXG4vLyBBcmdzOlxuLy8gICBub25lXG4vLyBSZXR1cm5zXG4vLyAgbm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gIEhpZGVzIHRoZSBkaWFsb2cuXG4vLyAgU2V0cyBjdXJyTm9kZSB0byBudWxsLlxuLy9cbmZ1bmN0aW9uIGhpZGVEaWFsb2coKXtcbiAgY3Vyck5vZGUgPSBudWxsO1xuICB2YXIgZGlhbG9nID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKVxuICAgICAgLmNsYXNzZWQoXCJoaWRkZW5cIiwgdHJ1ZSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbi8yKVxuICAgICAgLnN0eWxlKFwidHJhbnNmb3JtXCIsXCJzY2FsZSgxZS02KVwiKVxuICAgICAgO1xuICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIG51bGwpXG4gICAgICA7XG59XG5cbi8vIFNldCB0aGUgZWRpdGluZyB2aWV3LiBWaWV3IGlzIG9uZSBvZjpcbi8vIEFyZ3M6XG4vLyAgICAgdmlldyAoc3RyaW5nKSBPbmUgb2Y6IHF1ZXJ5TWFpbiwgY29uc3RyYWludExvZ2ljLCBjb2x1bW5PcmRlciwgc29ydE9yZGVyXG4vLyBSZXR1cm5zOlxuLy8gICAgIE5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgICBDaGFuZ2VzIHRoZSBsYXlvdXQgYW5kIHVwZGF0ZXMgdGhlIHZpZXcuXG5mdW5jdGlvbiBzZXRFZGl0Vmlldyh2aWV3KXtcbiAgICBsZXQgdiA9IGVkaXRWaWV3c1t2aWV3XTtcbiAgICBpZiAoIXYpIHRocm93IFwiVW5yZWNvZ25pemVkIHZpZXcgdHlwZTogXCIgKyB2aWV3O1xuICAgIGVkaXRWaWV3ID0gdjtcbiAgICBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyXCIpLmF0dHIoXCJjbGFzc1wiLCB2Lm5hbWUpO1xuICAgIHVwZGF0ZShyb290KTtcbn1cblxuZnVuY3Rpb24gZG9MYXlvdXQocm9vdCl7XG4gIHZhciBsYXlvdXQ7XG4gIGxldCBsZWF2ZXMgPSBbXTtcbiAgXG4gIGZ1bmN0aW9uIG1kIChuKSB7IC8vIG1heCBkZXB0aFxuICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID09PSAwKSBsZWF2ZXMucHVzaChuKTtcbiAgICAgIHJldHVybiAxICsgKG4uY2hpbGRyZW4ubGVuZ3RoID8gTWF0aC5tYXguYXBwbHkobnVsbCwgbi5jaGlsZHJlbi5tYXAobWQpKSA6IDApO1xuICB9O1xuICBsZXQgbWF4ZCA9IG1kKHJvb3QpOyAvLyBtYXggZGVwdGgsIDEtYmFzZWRcblxuICAvL1xuICBpZiAoZWRpdFZpZXcubGF5b3V0U3R5bGUgPT09IFwidHJlZVwiKSB7XG4gICAgICAvLyBkMyBsYXlvdXQgYXJyYW5nZXMgbm9kZXMgdG9wLXRvLWJvdHRvbSwgYnV0IHdlIHdhbnQgbGVmdC10by1yaWdodC5cbiAgICAgIC8vIFNvLi4ucmV2ZXJzZSB3aWR0aCBhbmQgaGVpZ2h0LCBhbmQgZG8gdGhlIGxheW91dC4gVGhlbiwgcmV2ZXJzZSB0aGUgeCx5IGNvb3JkcyBpbiB0aGUgcmVzdWx0cy5cbiAgICAgIGxheW91dCA9IGQzLmxheW91dC50cmVlKCkuc2l6ZShbaCwgd10pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICAvLyBSZXZlcnNlIHggYW5kIHkuIEFsc28sIG5vcm1hbGl6ZSB4IGZvciBmaXhlZC1kZXB0aC5cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGxldCB0bXAgPSBkLng7IGQueCA9IGQueTsgZC55ID0gdG1wO1xuICAgICAgICAgIGxldCBkeCA9IE1hdGgubWluKDE4MCwgdyAvIE1hdGgubWF4KDEsbWF4ZC0xKSlcbiAgICAgICAgICBkLnggPSBkLmRlcHRoICogZHggXG4gICAgICB9KTtcbiAgfVxuICBlbHNlIHtcbiAgICAgIC8vIGRlbmRyb2dyYW1cbiAgICAgIGxheW91dCA9IGQzLmxheW91dC5jbHVzdGVyKClcbiAgICAgICAgICAuc2VwYXJhdGlvbigoYSxiKSA9PiAxKVxuICAgICAgICAgIC5zaXplKFtoLCBNYXRoLm1pbih3LCBtYXhkICogMTgwKV0pO1xuICAgICAgLy8gU2F2ZSBub2RlcyBpbiBnbG9iYWwuXG4gICAgICBub2RlcyA9IGxheW91dC5ub2Rlcyhyb290KS5yZXZlcnNlKCk7XG4gICAgICBub2Rlcy5mb3JFYWNoKCBkID0+IHsgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7IH0pO1xuXG4gICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIFJlYXJyYW5nZSB5LXBvc2l0aW9ucyBvZiBsZWFmIG5vZGVzLiBcbiAgICAgIGxldCBwb3MgPSBsZWF2ZXMubWFwKGZ1bmN0aW9uKG4peyByZXR1cm4geyB5OiBuLnksIHkwOiBuLnkwIH07IH0pO1xuXG4gICAgICBsZWF2ZXMuc29ydChlZGl0Vmlldy5ub2RlQ29tcCk7XG5cbiAgICAgIC8vIHJlYXNzaWduIHRoZSBZIHBvc2l0aW9uc1xuICAgICAgbGVhdmVzLmZvckVhY2goZnVuY3Rpb24obiwgaSl7XG4gICAgICAgICAgbi55ID0gcG9zW2ldLnk7XG4gICAgICAgICAgbi55MCA9IHBvc1tpXS55MDtcbiAgICAgIH0pO1xuICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbGVhdmVzIGhhdmUgYmVlbiByZWFycmFuZ2VkLCBidXQgdGhlIGludGVyaW9yIG5vZGVzIGhhdmVuJ3QuXG4gICAgICAvLyBIZXIgd2UgbW92ZSBpbnRlcmlvciBub2RlcyB0b3dhcmQgdGhlaXIgXCJjZW50ZXIgb2YgZ3Jhdml0eVwiIGFzIGRlZmluZWRcbiAgICAgIC8vIGJ5IHRoZSBwb3NpdGlvbnMgb2YgdGhlaXIgY2hpbGRyZW4uIEFwcGx5IHRoaXMgcmVjdXJzaXZlbHkgdXAgdGhlIHRyZWUuXG4gICAgICAvLyBcbiAgICAgIC8vIE5PVEUgdGhhdCB4IGFuZCB5IGNvb3JkaW5hdGVzIGFyZSBvcHBvc2l0ZSBhdCB0aGlzIHBvaW50IVxuICAgICAgLy9cbiAgICAgIC8vIE1haW50YWluIGEgbWFwIG9mIG9jY3VwaWVkIHBvc2l0aW9uczpcbiAgICAgIGxldCBvY2N1cGllZCA9IHt9IDsgIC8vIG9jY3VwaWVkW3ggcG9zaXRpb25dID09IFtsaXN0IG9mIG5vZGVzXVxuICAgICAgZnVuY3Rpb24gY29nIChuKSB7XG4gICAgICAgICAgaWYgKG4uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAvLyBjb21wdXRlIG15IGMuby5nLiBhcyB0aGUgYXZlcmFnZSBvZiBteSBraWRzJyBwb3NpdGlvbnNcbiAgICAgICAgICAgICAgbGV0IG15Q29nID0gKG4uY2hpbGRyZW4ubWFwKGNvZykucmVkdWNlKCh0LGMpID0+IHQrYywgMCkpL24uY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICBpZihuLnBhcmVudCkgbi55ID0gbXlDb2c7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBkZCA9IG9jY3VwaWVkW24ueV0gPSAob2NjdXBpZWRbbi55XSB8fCBbXSk7XG4gICAgICAgICAgZGQucHVzaChuLnkpO1xuICAgICAgICAgIHJldHVybiBuLnk7XG4gICAgICB9XG4gICAgICBjb2cocm9vdCk7XG5cbiAgICAgIC8vIFRPRE86IEZpbmFsIGFkanVzdG1lbnRzXG4gICAgICAvLyAxLiBJZiB3ZSBleHRlbmQgb2ZmIHRoZSByaWdodCBlZGdlLCBjb21wcmVzcy5cbiAgICAgIC8vIDIuIElmIGl0ZW1zIGF0IHNhbWUgeCBvdmVybGFwLCBzcHJlYWQgdGhlbSBvdXQgaW4geS5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB9XG5cbiAgLy8gc2F2ZSBsaW5rcyBpbiBnbG9iYWxcbiAgbGlua3MgPSBsYXlvdXQubGlua3Mobm9kZXMpO1xuXG4gIHJldHVybiBbbm9kZXMsIGxpbmtzXVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gdXBkYXRlKG4pIFxuLy8gVGhlIG1haW4gZHJhd2luZyByb3V0aW5lLiBcbi8vIFVwZGF0ZXMgdGhlIFNWRywgdXNpbmcgbiBhcyB0aGUgc291cmNlIG9mIGFueSBlbnRlcmluZy9leGl0aW5nIGFuaW1hdGlvbnMuXG4vL1xuZnVuY3Rpb24gdXBkYXRlKHNvdXJjZSkge1xuICAvL1xuICBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyXCIpLmF0dHIoXCJjbGFzc1wiLCBlZGl0Vmlldy5uYW1lKTtcblxuICBkMy5zZWxlY3QoXCIjdW5kb0J1dHRvblwiKVxuICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHVuZG9NZ3IuY2FuVW5kbylcbiAgICAgIC5vbihcImNsaWNrXCIsIHVuZG9NZ3IuY2FuVW5kbyAmJiB1bmRvIHx8IG51bGwpO1xuICBkMy5zZWxlY3QoXCIjcmVkb0J1dHRvblwiKVxuICAgICAgLmNsYXNzZWQoXCJkaXNhYmxlZFwiLCAoKSA9PiAhIHVuZG9NZ3IuY2FuUmVkbylcbiAgICAgIC5vbihcImNsaWNrXCIsIHVuZG9NZ3IuY2FuUmVkbyAmJiByZWRvIHx8IG51bGwpO1xuICAvL1xuICBkb0xheW91dChyb290KTtcbiAgdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSk7XG4gIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpO1xuICB1cGRhdGVUdGV4dChjdXJyVGVtcGxhdGUpO1xufVxuXG4vL1xuZnVuY3Rpb24gdXBkYXRlTm9kZXMobm9kZXMsIHNvdXJjZSl7XG4gIGxldCBub2RlR3JwcyA9IHZpcy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4uaWQgfHwgKG4uaWQgPSArK2kpOyB9KVxuICAgICAgO1xuXG4gIC8vIENyZWF0ZSBuZXcgbm9kZXMgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbm9kZUVudGVyID0gbm9kZUdycHMuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAuYXR0cihcImlkXCIsIG4gPT4gbi5wYXRoLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZWdyb3VwXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHNvdXJjZS54MCArIFwiLFwiICsgc291cmNlLnkwICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgbGV0IGNsaWNrTm9kZSA9IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGlmIChkMy5ldmVudC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47IFxuICAgICAgaWYgKGN1cnJOb2RlICE9PSBuKSBzaG93RGlhbG9nKG4sIHRoaXMpO1xuICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH07XG4gIC8vIEFkZCBnbHlwaCBmb3IgdGhlIG5vZGVcbiAgbm9kZUVudGVyLmFwcGVuZChmdW5jdGlvbihkKXtcbiAgICAgIHZhciBzaGFwZSA9IChkLnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIiA/IFwicmVjdFwiIDogXCJjaXJjbGVcIik7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgc2hhcGUpO1xuICAgIH0pXG4gICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBjbGlja05vZGUpO1xuICBub2RlRW50ZXIuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuICBub2RlRW50ZXIuc2VsZWN0KFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIC04LjUpXG4gICAgICAuYXR0cihcInlcIiwgLTguNSlcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIGludmlzaWJseSBzbWFsbFxuICAgICAgO1xuXG4gIC8vIEFkZCB0ZXh0IGZvciBub2RlIG5hbWVcbiAgbm9kZUVudGVyLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5jaGlsZHJlbiA/IC0xMCA6IDEwOyB9KVxuICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNikgLy8gc3RhcnQgb2ZmIG5lYXJseSB0cmFuc3BhcmVudFxuICAgICAgLmF0dHIoXCJjbGFzc1wiLFwibm9kZU5hbWVcIilcbiAgICAgIDtcblxuICAvLyBQbGFjZWhvbGRlciBmb3IgaWNvbi90ZXh0IHRvIGFwcGVhciBpbnNpZGUgbm9kZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlSWNvbicpXG4gICAgICAuYXR0cignZHknLCA1KVxuICAgICAgO1xuXG4gIC8vIEFkZCBub2RlIGhhbmRsZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdoYW5kbGUnKVxuICAgICAgLmF0dHIoJ2R4JywgMTApXG4gICAgICAuYXR0cignZHknLCA1KVxuICAgICAgO1xuXG4gIGxldCBub2RlVXBkYXRlID0gbm9kZUdycHNcbiAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgbiA9PiBuLmlzU2VsZWN0ZWQpXG4gICAgICAuY2xhc3NlZChcImNvbnN0cmFpbmVkXCIsIG4gPT4gbi5jb25zdHJhaW50cy5sZW5ndGggPiAwKVxuICAgICAgLmNsYXNzZWQoXCJzb3J0ZWRcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmxldmVsID49IDApXG4gICAgICAuY2xhc3NlZChcInNvcnRlZGFzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiYXNjXCIpXG4gICAgICAuY2xhc3NlZChcInNvcnRlZGRlc2NcIiwgbiA9PiBuLnNvcnQgJiYgbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpID09PSBcImRlc2NcIilcbiAgICAvLyBUcmFuc2l0aW9uIG5vZGVzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgICAudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihuKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIG4ueCArIFwiLFwiICsgbi55ICsgXCIpXCI7IH0pXG4gICAgICA7XG5cbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0LmhhbmRsZVwiKVxuICAgICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgZWRpdFZpZXcuaGFuZGxlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAudGV4dChlZGl0Vmlldy5oYW5kbGVJY29uLnRleHQgfHwgXCJcIikgXG4gICAgICAuYXR0cihcInN0cm9rZVwiLCBlZGl0Vmlldy5oYW5kbGVJY29uLnN0cm9rZSB8fCBudWxsKVxuICAgICAgLmF0dHIoXCJmaWxsXCIsIGVkaXRWaWV3LmhhbmRsZUljb24uZmlsbCB8fCBudWxsKTtcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0Lm5vZGVJY29uXCIpXG4gICAgICAuYXR0cignZm9udC1mYW1pbHknLCBlZGl0Vmlldy5ub2RlSWNvbi5mb250RmFtaWx5IHx8IG51bGwpXG4gICAgICAudGV4dChlZGl0Vmlldy5ub2RlSWNvbi50ZXh0IHx8IFwiXCIpIFxuICAgICAgO1xuXG4gIGQzLnNlbGVjdEFsbChcIi5ub2RlSWNvblwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgY2xpY2tOb2RlKTtcblxuICBub2RlVXBkYXRlLnNlbGVjdEFsbChcInRleHQubm9kZU5hbWVcIilcbiAgICAgIC50ZXh0KG4gPT4gbi5uYW1lKTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBNYWtlIHNlbGVjdGVkIG5vZGVzIGRyYWdnYWJsZS5cbiAgLy8gQ2xlYXIgb3V0IGFsbCBleGl0aW5nIGRyYWcgaGFuZGxlcnNcbiAgZDMuc2VsZWN0QWxsKFwiZy5ub2RlZ3JvdXBcIilcbiAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIGZhbHNlKVxuICAgICAgLm9uKFwiLmRyYWdcIiwgbnVsbCk7IFxuICAvLyBOb3cgbWFrZSBldmVyeXRoaW5nIGRyYWdnYWJsZSB0aGF0IHNob3VsZCBiZVxuICBpZiAoZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgZDMuc2VsZWN0QWxsKGVkaXRWaWV3LmRyYWdnYWJsZSlcbiAgICAgICAgICAuY2xhc3NlZChcImRyYWdnYWJsZVwiLCB0cnVlKVxuICAgICAgICAgIC5jYWxsKGRyYWdCZWhhdmlvcik7XG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQWRkIHRleHQgZm9yIGNvbnN0cmFpbnRzXG4gIGxldCBjdCA9IG5vZGVHcnBzLnNlbGVjdEFsbChcInRleHQuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEoZnVuY3Rpb24obil7IHJldHVybiBuLmNvbnN0cmFpbnRzOyB9KTtcbiAgY3QuZW50ZXIoKS5hcHBlbmQoXCJzdmc6dGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb25zdHJhaW50XCIpO1xuICBjdC5leGl0KCkucmVtb3ZlKCk7XG4gIGN0LnRleHQoIGMgPT4gYy5sYWJlbFRleHQgKVxuICAgICAgIC5hdHRyKFwieFwiLCAwKVxuICAgICAgIC5hdHRyKFwiZHlcIiwgKGMsaSkgPT4gYCR7KGkrMSkqMS43fWVtYClcbiAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsXCJzdGFydFwiKVxuICAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gZnVsbCBzaXplXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgOC41IClcbiAgICAgIDtcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIDE3IClcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDE3IClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gZnVsbHkgb3BhcXVlXG4gIG5vZGVVcGRhdGUuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDEpXG4gICAgICA7XG5cbiAgLy9cbiAgLy8gVHJhbnNpdGlvbiBleGl0aW5nIG5vZGVzIHRvIHRoZSBwYXJlbnQncyBuZXcgcG9zaXRpb24uXG4gIGxldCBub2RlRXhpdCA9IG5vZGVHcnBzLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLnggKyBcIixcIiArIHNvdXJjZS55ICsgXCIpXCI7IH0pXG4gICAgICAucmVtb3ZlKClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGNpcmNsZXMgdG8gdGlueSByYWRpdXNcbiAgbm9kZUV4aXQuc2VsZWN0KFwiY2lyY2xlXCIpXG4gICAgICAuYXR0cihcInJcIiwgMWUtNilcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIHRleHQgdG8gdHJhbnNwYXJlbnRcbiAgbm9kZUV4aXQuc2VsZWN0KFwidGV4dFwiKVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDFlLTYpXG4gICAgICA7XG4gIC8vIFN0YXNoIHRoZSBvbGQgcG9zaXRpb25zIGZvciB0cmFuc2l0aW9uLlxuICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLngwID0gZC54O1xuICAgIGQueTAgPSBkLnk7XG4gIH0pO1xuICAvL1xuXG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVMaW5rcyhsaW5rcywgc291cmNlKSB7XG4gIGxldCBsaW5rID0gdmlzLnNlbGVjdEFsbChcInBhdGgubGlua1wiKVxuICAgICAgLmRhdGEobGlua3MsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0LmlkOyB9KVxuICAgICAgO1xuXG4gIC8vIEVudGVyIGFueSBuZXcgbGlua3MgYXQgdGhlIHBhcmVudCdzIHByZXZpb3VzIHBvc2l0aW9uLlxuICBsZXQgbmV3UGF0aHMgPSBsaW5rLmVudGVyKCkuaW5zZXJ0KFwic3ZnOnBhdGhcIiwgXCJnXCIpO1xuICBsZXQgbGlua1RpdGxlID0gZnVuY3Rpb24obCl7XG4gICAgICBsZXQgY2xpY2sgPSBcIlwiO1xuICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgIT09IFwiYXR0cmlidXRlXCIpe1xuICAgICAgICAgIGNsaWNrID0gYENsaWNrIHRvIG1ha2UgdGhpcyByZWxhdGlvbnNoaXAgJHtsLnRhcmdldC5qb2luID8gXCJSRVFVSVJFRFwiIDogXCJPUFRJT05BTFwifS4gYDtcbiAgICAgIH1cbiAgICAgIGxldCBhbHRjbGljayA9IFwiQWx0LWNsaWNrIHRvIGN1dCBsaW5rLlwiO1xuICAgICAgcmV0dXJuIGNsaWNrICsgYWx0Y2xpY2s7XG4gIH1cbiAgLy8gc2V0IHRoZSB0b29sdGlwXG4gIG5ld1BhdGhzLmFwcGVuZChcInN2Zzp0aXRsZVwiKS50ZXh0KGxpbmtUaXRsZSk7XG4gIG5ld1BhdGhzXG4gICAgICAuYXR0cihcInRhcmdldFwiLCBkID0+IGQudGFyZ2V0LmlkLnJlcGxhY2UoL1xcLi9nLCBcIl9cIikpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGlua1wiKVxuICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIG8gPSB7eDogc291cmNlLngwLCB5OiBzb3VyY2UueTB9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLmNsYXNzZWQoXCJhdHRyaWJ1dGVcIiwgZnVuY3Rpb24obCkgeyByZXR1cm4gbC50YXJnZXQucGNvbXAua2luZCA9PT0gXCJhdHRyaWJ1dGVcIjsgfSlcbiAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGwpeyBcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICAgIC8vIGEgc2hpZnQtY2xpY2sgY3V0cyB0aGUgdHJlZSBhdCB0aGlzIGVkZ2VcbiAgICAgICAgICAgICAgcmVtb3ZlTm9kZShsLnRhcmdldClcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChsLnRhcmdldC5wY29tcC5raW5kID09IFwiYXR0cmlidXRlXCIpIHJldHVybjtcbiAgICAgICAgICAgICAgLy8gcmVndWxhciBjbGljayBvbiBhIHJlbGF0aW9uc2hpcCBlZGdlIGludmVydHMgd2hldGhlclxuICAgICAgICAgICAgICAvLyB0aGUgam9pbiBpcyBpbm5lciBvciBvdXRlci4gXG4gICAgICAgICAgICAgIGwudGFyZ2V0LmpvaW4gPSAobC50YXJnZXQuam9pbiA/IG51bGwgOiBcIm91dGVyXCIpO1xuICAgICAgICAgICAgICAvLyByZS1zZXQgdGhlIHRvb2x0aXBcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcInRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgICAgICAgICAgICAgLy8gaWYgb3V0ZXIgam9pbiwgcmVtb3ZlIGFueSBzb3J0IG9yZGVycyBpbiBuIG9yIGRlc2NlbmRhbnRzXG4gICAgICAgICAgICAgIGlmIChsLnRhcmdldC5qb2luKSB7XG4gICAgICAgICAgICAgICAgICBsZXQgcnNvID0gZnVuY3Rpb24obSkgeyAvLyByZW1vdmUgc29ydCBvcmRlclxuICAgICAgICAgICAgICAgICAgICAgIG0uc2V0U29ydChcIm5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgbS5jaGlsZHJlbi5mb3JFYWNoKHJzbyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByc28obC50YXJnZXQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHVwZGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgICAgIHNhdmVTdGF0ZShsLnNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgICAuYXR0cihcImRcIiwgZGlhZ29uYWwpXG4gICAgICA7XG4gXG4gIFxuICAvLyBUcmFuc2l0aW9uIGxpbmtzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cbiAgbGluay5jbGFzc2VkKFwib3V0ZXJcIiwgZnVuY3Rpb24obikgeyByZXR1cm4gbi50YXJnZXQuam9pbiA9PT0gXCJvdXRlclwiOyB9KVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJkXCIsIGRpYWdvbmFsKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxuICBsaW5rLmV4aXQoKS50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciBvID0ge3g6IHNvdXJjZS54LCB5OiBzb3VyY2UueX07XG4gICAgICAgIHJldHVybiBkaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgIH0pXG4gICAgICAucmVtb3ZlKClcbiAgICAgIDtcblxufVxuLy9cbmZ1bmN0aW9uIHVwZGF0ZVR0ZXh0KHQpe1xuICAvL1xuICBsZXQgdGl0bGUgPSB2aXMuc2VsZWN0QWxsKFwiI3F0aXRsZVwiKVxuICAgICAgLmRhdGEoW3Jvb3QudGVtcGxhdGUudGl0bGVdKTtcbiAgdGl0bGUuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2Zzp0ZXh0XCIpXG4gICAgICAuYXR0cihcImlkXCIsXCJxdGl0bGVcIilcbiAgICAgIC5hdHRyKFwieFwiLCAtNDApXG4gICAgICAuYXR0cihcInlcIiwgMTUpXG4gICAgICA7XG4gIHRpdGxlLmh0bWwodCA9PiB7XG4gICAgICBsZXQgcGFydHMgPSB0LnNwbGl0KC8oLS0+KS8pO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcCgocCxpKSA9PiB7XG4gICAgICAgICAgaWYgKHAgPT09IFwiLS0+XCIpIFxuICAgICAgICAgICAgICByZXR1cm4gYDx0c3BhbiB5PTEwIGZvbnQtZmFtaWx5PVwiTWF0ZXJpYWwgSWNvbnNcIj4ke2NvZGVwb2ludHNbJ2ZvcndhcmQnXX08L3RzcGFuPmBcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBgPHRzcGFuIHk9ND4ke3B9PC90c3Bhbj5gXG4gICAgICB9KS5qb2luKFwiXCIpO1xuICB9KTtcblxuICAvL1xuICBsZXQgdHh0ID0gZDMuc2VsZWN0KFwiI3R0ZXh0XCIpLmNsYXNzZWQoXCJqc29uXCIpID8gdC5nZXRKc29uKCkgOiB0LmdldFhtbCgpO1xuICAvL1xuICAvL1xuICBkMy5zZWxlY3QoXCIjdHRleHRkaXZcIikgXG4gICAgICAudGV4dCh0eHQpXG4gICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIHRydWUpO1xuICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAvL1xuICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgdXBkYXRlQ291bnQodCk7XG59XG5cbmZ1bmN0aW9uIHJ1bmF0bWluZSh0KSB7XG4gIGxldCB1Y3QgPSB0LnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gIGxldCB0eHQgPSB0LmdldFhtbCgpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gIGxldCBsaW5rdXJsID0gY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KHQpe1xuICBsZXQgdWN0ID0gdC51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICBsZXQgcXR4dCA9IHQuZ2V0WG1sKHRydWUpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHF0eHQpO1xuICBsZXQgY291bnRVcmwgPSBjdXJyTWluZS51cmwgKyBgL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0ke3VybFR4dH0mZm9ybWF0PWNvdW50YDtcbiAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJydW5uaW5nXCIsIHRydWUpO1xuICBkM2pzb25Qcm9taXNlKGNvdW50VXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24obil7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCBmYWxzZSkuY2xhc3NlZChcInJ1bm5pbmdcIiwgZmFsc2UpO1xuICAgICAgICAgIGQzLnNlbGVjdCgnI3F1ZXJ5Y291bnQgc3BhbicpLnRleHQobilcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJlcnJvclwiLCB0cnVlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUjo6XCIsIHF0eHQpXG4gICAgICB9KTtcbn1cblxuLy8gVGhlIGNhbGwgdGhhdCBnZXRzIGl0IGFsbCBnb2luZy4uLlxuc2V0dXAoKVxuLy9cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3FiLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIFVuZG9NYW5hZ2VyIG1haW50YWlucyBhIGhpc3Rvcnkgc3RhY2sgb2Ygc3RhdGVzIChhcmJpdHJhcnkgb2JqZWN0cykuXG4vL1xuY2xhc3MgVW5kb01hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxpbWl0KSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgY2xlYXIgKCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludGVyID0gLTE7XG4gICAgfVxuICAgIGdldCBjdXJyZW50U3RhdGUgKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyIDwgMClcbiAgICAgICAgICAgIHRocm93IFwiTm8gY3VycmVudCBzdGF0ZS5cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICBnZXQgaGFzU3RhdGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID49IDA7XG4gICAgfVxuICAgIGdldCBjYW5VbmRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlciA+IDA7XG4gICAgfVxuICAgIGdldCBjYW5SZWRvICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU3RhdGUgJiYgdGhpcy5wb2ludGVyIDwgdGhpcy5oaXN0b3J5Lmxlbmd0aC0xO1xuICAgIH1cbiAgICBhZGQgKHMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkFERFwiKTtcbiAgICAgICAgdGhpcy5wb2ludGVyICs9IDE7XG4gICAgICAgIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdID0gcztcbiAgICAgICAgdGhpcy5oaXN0b3J5LnNwbGljZSh0aGlzLnBvaW50ZXIrMSk7XG4gICAgfVxuICAgIHVuZG8gKCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiVU5ET1wiKTtcbiAgICAgICAgaWYgKCEgdGhpcy5jYW5VbmRvKSB0aHJvdyBcIk5vIHVuZG8uXCJcbiAgICAgICAgdGhpcy5wb2ludGVyIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5wb2ludGVyXTtcbiAgICB9XG4gICAgcmVkbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJSRURPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblJlZG8pIHRocm93IFwiTm8gcmVkby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVW5kb01hbmFnZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91bmRvTWFuYWdlci5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IC8qXHJcbiAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC4xMC4wLlxyXG4gKlxyXG4gKiBodHRwOi8vcGVnanMub3JnL1xyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBmdW5jdGlvbiBwZWckc3ViY2xhc3MoY2hpbGQsIHBhcmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9XHJcbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XHJcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgIHRoaXMubWVzc2FnZSAgPSBtZXNzYWdlO1xyXG4gICAgdGhpcy5leHBlY3RlZCA9IGV4cGVjdGVkO1xyXG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xyXG4gICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xyXG4gICAgdGhpcy5uYW1lICAgICA9IFwiU3ludGF4RXJyb3JcIjtcclxuXHJcbiAgICBpZiAodHlwZW9mIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgcGVnJFN5bnRheEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHBlZyRzdWJjbGFzcyhwZWckU3ludGF4RXJyb3IsIEVycm9yKTtcclxuXHJcbiAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZSA9IGZ1bmN0aW9uKGV4cGVjdGVkLCBmb3VuZCkge1xyXG4gICAgdmFyIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOUyA9IHtcclxuICAgICAgICAgIGxpdGVyYWw6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZXhwZWN0YXRpb24udGV4dCkgKyBcIlxcXCJcIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgXCJjbGFzc1wiOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZXNjYXBlZFBhcnRzID0gXCJcIixcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0YXRpb24ucGFydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBlc2NhcGVkUGFydHMgKz0gZXhwZWN0YXRpb24ucGFydHNbaV0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICAgICAgICAgICAgPyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVswXSkgKyBcIi1cIiArIGNsYXNzRXNjYXBlKGV4cGVjdGF0aW9uLnBhcnRzW2ldWzFdKVxyXG4gICAgICAgICAgICAgICAgOiBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIltcIiArIChleHBlY3RhdGlvbi5pbnZlcnRlZCA/IFwiXlwiIDogXCJcIikgKyBlc2NhcGVkUGFydHMgKyBcIl1cIjtcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgYW55OiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJhbnkgY2hhcmFjdGVyXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGVuZDogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIG90aGVyOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24uZGVzY3JpcHRpb247XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBoZXgoY2gpIHtcclxuICAgICAgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGl0ZXJhbEVzY2FwZShzKSB7XHJcbiAgICAgIHJldHVybiBzXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcclxuICAgICAgICAucmVwbGFjZSgvXCIvZywgICdcXFxcXCInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXDAvZywgJ1xcXFwwJylcclxuICAgICAgICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcclxuICAgICAgICAucmVwbGFjZSgvW1xceDAwLVxceDBGXS9nLCAgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4MCcgKyBoZXgoY2gpOyB9KVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg3Ri1cXHg5Rl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3NFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcXS9nLCAnXFxcXF0nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF4vZywgJ1xcXFxeJylcclxuICAgICAgICAucmVwbGFjZSgvLS9nLCAgJ1xcXFwtJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgcmV0dXJuIERFU0NSSUJFX0VYUEVDVEFUSU9OX0ZOU1tleHBlY3RhdGlvbi50eXBlXShleHBlY3RhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkge1xyXG4gICAgICB2YXIgZGVzY3JpcHRpb25zID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXHJcbiAgICAgICAgICBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGVzY3JpcHRpb25zW2ldID0gZGVzY3JpYmVFeHBlY3RhdGlvbihleHBlY3RlZFtpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlc2NyaXB0aW9ucy5zb3J0KCk7XHJcblxyXG4gICAgICBpZiAoZGVzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGkgPSAxLCBqID0gMTsgaSA8IGRlc2NyaXB0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uc1tpIC0gMV0gIT09IGRlc2NyaXB0aW9uc1tpXSkge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbnNbal0gPSBkZXNjcmlwdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGorKztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZGVzY3JpcHRpb25zLmxlbmd0aCA9IGo7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnNbMF0gKyBcIiBvciBcIiArIGRlc2NyaXB0aW9uc1sxXTtcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbnMuc2xpY2UoMCwgLTEpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICArIFwiLCBvciBcIlxyXG4gICAgICAgICAgICArIGRlc2NyaXB0aW9uc1tkZXNjcmlwdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUZvdW5kKGZvdW5kKSB7XHJcbiAgICAgIHJldHVybiBmb3VuZCA/IFwiXFxcIlwiICsgbGl0ZXJhbEVzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBkZXNjcmliZUV4cGVjdGVkKGV4cGVjdGVkKSArIFwiIGJ1dCBcIiArIGRlc2NyaWJlRm91bmQoZm91bmQpICsgXCIgZm91bmQuXCI7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyAhPT0gdm9pZCAwID8gb3B0aW9ucyA6IHt9O1xyXG5cclxuICAgIHZhciBwZWckRkFJTEVEID0ge30sXHJcblxyXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMgPSB7IEV4cHJlc3Npb246IHBlZyRwYXJzZUV4cHJlc3Npb24gfSxcclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gID0gcGVnJHBhcnNlRXhwcmVzc2lvbixcclxuXHJcbiAgICAgICAgcGVnJGMwID0gXCJvclwiLFxyXG4gICAgICAgIHBlZyRjMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJvclwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMyID0gXCJPUlwiLFxyXG4gICAgICAgIHBlZyRjMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJPUlwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkgeyBcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwib3JcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzUgPSBcImFuZFwiLFxyXG4gICAgICAgIHBlZyRjNiA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJhbmRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNyA9IFwiQU5EXCIsXHJcbiAgICAgICAgcGVnJGM4ID0gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbihcIkFORFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGM5ID0gZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcm9wYWdhdGUoXCJhbmRcIiwgaGVhZCwgdGFpbClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBwZWckYzEwID0gXCIoXCIsXHJcbiAgICAgICAgcGVnJGMxMSA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIoXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzEyID0gXCIpXCIsXHJcbiAgICAgICAgcGVnJGMxMyA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCIpXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzE0ID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gZXhwcjsgfSxcclxuICAgICAgICBwZWckYzE1ID0gcGVnJG90aGVyRXhwZWN0YXRpb24oXCJjb2RlXCIpLFxyXG4gICAgICAgIHBlZyRjMTYgPSAvXltBLVphLXpdLyxcclxuICAgICAgICBwZWckYzE3ID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1tcIkFcIiwgXCJaXCJdLCBbXCJhXCIsIFwielwiXV0sIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxOCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGV4dCgpLnRvVXBwZXJDYXNlKCk7IH0sXHJcbiAgICAgICAgcGVnJGMxOSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwid2hpdGVzcGFjZVwiKSxcclxuICAgICAgICBwZWckYzIwID0gL15bIFxcdFxcblxccl0vLFxyXG4gICAgICAgIHBlZyRjMjEgPSBwZWckY2xhc3NFeHBlY3RhdGlvbihbXCIgXCIsIFwiXFx0XCIsIFwiXFxuXCIsIFwiXFxyXCJdLCBmYWxzZSwgZmFsc2UpLFxyXG5cclxuICAgICAgICBwZWckY3VyclBvcyAgICAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJHNhdmVkUG9zICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGUgID0gW3sgbGluZTogMSwgY29sdW1uOiAxIH1dLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zICAgICAgID0gMCxcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxyXG4gICAgICAgIHBlZyRzaWxlbnRGYWlscyAgICAgID0gMCxcclxuXHJcbiAgICAgICAgcGVnJHJlc3VsdDtcclxuXHJcbiAgICBpZiAoXCJzdGFydFJ1bGVcIiBpbiBvcHRpb25zKSB7XHJcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgc3RhcnQgcGFyc2luZyBmcm9tIHJ1bGUgXFxcIlwiICsgb3B0aW9ucy5zdGFydFJ1bGUgKyBcIlxcXCIuXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb24gPSBwZWckc3RhcnRSdWxlRnVuY3Rpb25zW29wdGlvbnMuc3RhcnRSdWxlXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0KCkge1xyXG4gICAgICByZXR1cm4gaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKCkge1xyXG4gICAgICByZXR1cm4gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbiwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoXHJcbiAgICAgICAgW3BlZyRvdGhlckV4cGVjdGF0aW9uKGRlc2NyaXB0aW9uKV0sXHJcbiAgICAgICAgaW5wdXQuc3Vic3RyaW5nKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXJyb3IobWVzc2FnZSwgbG9jYXRpb24pIHtcclxuICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbiAhPT0gdm9pZCAwID8gbG9jYXRpb24gOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRzYXZlZFBvcywgcGVnJGN1cnJQb3MpXHJcblxyXG4gICAgICB0aHJvdyBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGxpdGVyYWxFeHBlY3RhdGlvbih0ZXh0LCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB0ZXh0OiB0ZXh0LCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGNsYXNzRXhwZWN0YXRpb24ocGFydHMsIGludmVydGVkLCBpZ25vcmVDYXNlKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiY2xhc3NcIiwgcGFydHM6IHBhcnRzLCBpbnZlcnRlZDogaW52ZXJ0ZWQsIGlnbm9yZUNhc2U6IGlnbm9yZUNhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYW55RXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiYW55XCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckZW5kRXhwZWN0YXRpb24oKSB7XHJcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiZW5kXCIgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcclxuICAgICAgdmFyIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3Bvc10sIHA7XHJcblxyXG4gICAgICBpZiAoZGV0YWlscykge1xyXG4gICAgICAgIHJldHVybiBkZXRhaWxzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHAgPSBwb3MgLSAxO1xyXG4gICAgICAgIHdoaWxlICghcGVnJHBvc0RldGFpbHNDYWNoZVtwXSkge1xyXG4gICAgICAgICAgcC0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGV0YWlscyA9IHBlZyRwb3NEZXRhaWxzQ2FjaGVbcF07XHJcbiAgICAgICAgZGV0YWlscyA9IHtcclxuICAgICAgICAgIGxpbmU6ICAgZGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBkZXRhaWxzLmNvbHVtblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdoaWxlIChwIDwgcG9zKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwKSA9PT0gMTApIHtcclxuICAgICAgICAgICAgZGV0YWlscy5saW5lKys7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uID0gMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMuY29sdW1uKys7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdID0gZGV0YWlscztcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlTG9jYXRpb24oc3RhcnRQb3MsIGVuZFBvcykge1xyXG4gICAgICB2YXIgc3RhcnRQb3NEZXRhaWxzID0gcGVnJGNvbXB1dGVQb3NEZXRhaWxzKHN0YXJ0UG9zKSxcclxuICAgICAgICAgIGVuZFBvc0RldGFpbHMgICA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhlbmRQb3MpO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBzdGFydFBvcyxcclxuICAgICAgICAgIGxpbmU6ICAgc3RhcnRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IHN0YXJ0UG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZDoge1xyXG4gICAgICAgICAgb2Zmc2V0OiBlbmRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIGVuZFBvc0RldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZW5kUG9zRGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcclxuICAgICAgaWYgKHBlZyRjdXJyUG9zIDwgcGVnJG1heEZhaWxQb3MpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCA9IFtdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRidWlsZFNpbXBsZUVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgcGVnJFN5bnRheEVycm9yKG1lc3NhZ2UsIG51bGwsIG51bGwsIGxvY2F0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTdHJ1Y3R1cmVkRXJyb3IoZXhwZWN0ZWQsIGZvdW5kLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihcclxuICAgICAgICBwZWckU3ludGF4RXJyb3IuYnVpbGRNZXNzYWdlKGV4cGVjdGVkLCBmb3VuZCksXHJcbiAgICAgICAgZXhwZWN0ZWQsXHJcbiAgICAgICAgZm91bmQsXHJcbiAgICAgICAgbG9jYXRpb25cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VFeHByZXNzaW9uKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gW107XHJcbiAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxKTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzIpIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHMzLnB1c2goczQpO1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMCkge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzA7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMyO1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMyk7IH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzOCA9IHBlZyRwYXJzZVRlcm0oKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgczUgPSBbczUsIHM2LCBzNywgczhdO1xyXG4gICAgICAgICAgICAgICAgICAgIHM0ID0gczU7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczEgPSBwZWckYzQoczIsIHMzKTtcclxuICAgICAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlVGVybSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcclxuXHJcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgIHMxID0gcGVnJHBhcnNlRmFjdG9yKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMyID0gW107XHJcbiAgICAgICAgczMgPSBwZWckY3VyclBvcztcclxuICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzUpIHtcclxuICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRjNztcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczQgPSBbczQsIHM1LCBzNiwgczddO1xyXG4gICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMi5wdXNoKHMzKTtcclxuICAgICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzU7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNykge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjOCk7IH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgICAgczMgPSBzNDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMztcclxuICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGM5KHMxLCBzMik7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZUZhY3RvcigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQwKSB7XHJcbiAgICAgICAgczEgPSBwZWckYzEwO1xyXG4gICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHMzID0gcGVnJHBhcnNlRXhwcmVzc2lvbigpO1xyXG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQxKSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMTI7XHJcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTMpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMpO1xyXG4gICAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAgPSBwZWckcGFyc2VDb2RlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VDb2RlKCkge1xyXG4gICAgICB2YXIgczAsIHMxLCBzMjtcclxuXHJcbiAgICAgIHBlZyRzaWxlbnRGYWlscysrO1xyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgaWYgKHBlZyRjMTYudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczIgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczIgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzE3KTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgczEgPSBwZWckYzE4KCk7XHJcbiAgICAgICAgICBzMCA9IHMxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZV8oKSB7XHJcbiAgICAgIHZhciBzMCwgczE7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBbXTtcclxuICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMjEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczAucHVzaChzMSk7XHJcbiAgICAgICAgaWYgKHBlZyRjMjAudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xyXG4gICAgICAgICAgczEgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcclxuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxOSk7IH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHByb3BhZ2F0ZShvcCwgaGVhZCwgdGFpbCkge1xyXG4gICAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwKSByZXR1cm4gaGVhZDtcclxuICAgICAgICAgIHJldHVybiB0YWlsLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNoaWxkcmVuLnB1c2goZWxlbWVudFszXSk7XHJcbiAgICAgICAgICAgIHJldHVybiAgcmVzdWx0O1xyXG4gICAgICAgICAgfSwge1wib3BcIjpvcCwgY2hpbGRyZW46W2hlYWRdfSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgcGVnJHJlc3VsdCA9IHBlZyRzdGFydFJ1bGVGdW5jdGlvbigpO1xyXG5cclxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIHBlZyRyZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgIHBlZyRmYWlsKHBlZyRlbmRFeHBlY3RhdGlvbigpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGggPyBpbnB1dC5jaGFyQXQocGVnJG1heEZhaWxQb3MpIDogbnVsbCxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA8IGlucHV0Lmxlbmd0aFxyXG4gICAgICAgICAgPyBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcyArIDEpXHJcbiAgICAgICAgICA6IHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJG1heEZhaWxQb3MsIHBlZyRtYXhGYWlsUG9zKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsXHJcbiAgICBwYXJzZTogICAgICAgcGVnJHBhcnNlXHJcbiAgfTtcclxufSkoKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IGQzanNvblByb21pc2UgfSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IHJlZ2lzdHJ5VXJsID0gXCJodHRwOi8vcmVnaXN0cnkuaW50ZXJtaW5lLm9yZy9zZXJ2aWNlL2luc3RhbmNlc1wiO1xubGV0IHJlZ2lzdHJ5RmlsZVVybCA9IFwiLi9yZXNvdXJjZXMvdGVzdGRhdGEvcmVnaXN0cnkuanNvblwiO1xuXG5mdW5jdGlvbiBpbml0UmVnaXN0cnkgKGNiKSB7XG4gICAgcmV0dXJuIGQzanNvblByb21pc2UocmVnaXN0cnlVcmwpXG4gICAgICAudGhlbihjYilcbiAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYENvdWxkIG5vdCBhY2Nlc3MgcmVnaXN0cnkgYXQgJHtyZWdpc3RyeVVybH0uIFRyeWluZyAke3JlZ2lzdHJ5RmlsZVVybH0uYCk7XG4gICAgICAgICAgZDNqc29uUHJvbWlzZShyZWdpc3RyeUZpbGVVcmwpXG4gICAgICAgICAgICAgIC50aGVuKGluaXRNaW5lcylcbiAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiQ2Fubm90IGFjY2VzcyByZWdpc3RyeSBmaWxlLiBUaGlzIGlzIG5vdCB5b3VyIGx1Y2t5IGRheS5cIik7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH0pO1xufVxuXG5cbmNsYXNzIFJlZ2lzdHJ5RW50cnkge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy51cmwgPSBudWxsO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgaW5pdFJlZ2lzdHJ5IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy9yZWdpc3RyeS5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQge2NvZGVwb2ludHN9IGZyb20gJy4vbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzJztcblxubGV0IGVkaXRWaWV3cyA9IHsgcXVlcnlNYWluOiB7XG4gICAgICAgIG5hbWU6IFwicXVlcnlNYWluXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcInRyZWVcIixcbiAgICAgICAgbm9kZUNvbXA6IG51bGwsXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBuLnNvcnQgPyBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgY2MgPSBjb2RlcG9pbnRzWyBkaXIgPT09IFwiYXNjXCIgPyBcImFycm93X3Vwd2FyZFwiIDogZGlyID09PSBcImRlc2NcIiA/IFwiYXJyb3dfZG93bndhcmRcIiA6IFwiXCIgXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2MgPyBjYyA6IFwiXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHJva2U6IFwiI2UyOGIyOFwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNvbHVtbk9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwiY29sdW1uT3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc2VsZWN0ZWRcIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29sdW1uIG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNlbGVjdGlvbi1saXN0IG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc2VsZWN0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5pc1NlbGVjdGVkKVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gYS52aWV3IC0gYi52aWV3IDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5pc1NlbGVjdGVkID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGRyYWcgaW4gY29sdW1uT3JkZXIgdmlldyBjaGFuZ2VzIHRoZSBjb2x1bW4gb3JkZXIgKGR1aCEpXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHsgbi52aWV3ID0gaSB9KTtcbiAgICAgICAgICBkcmFnZ2VkLnRlbXBsYXRlLnNlbGVjdCA9IG5vZGVzLm1hcCggbj0+IG4ucGF0aCApO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogbnVsbCxcbiAgICAgICAgICAgIHRleHQ6IG4gPT4gbi5pc1NlbGVjdGVkID8gbi52aWV3IDogXCJcIlxuICAgICAgICB9XG4gICAgfSxcbiAgICBzb3J0T3JkZXI6IHtcbiAgICAgICAgbmFtZTogXCJzb3J0T3JkZXJcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBkcmFnZ2FibGU6IFwiZy5ub2RlZ3JvdXAuc29ydGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIHNvcnQgb3JkZXIgdmlldzpcbiAgICAgICAgICAvLyAgICAgLSBzb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIHNvcnQtbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNvcnRlZCBub2RlcyBhcmUgYXQgdGhlIGJvdHRvbSwgaW4gYWxwaGEgb3JkZXIgYnkgbmFtZVxuICAgICAgICAgIGlmIChhLnNvcnQpXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyBhLnNvcnQubGV2ZWwgLSBiLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiLnNvcnQgPyAxIDogbmFtZUNvbXAoYSxiKTtcbiAgICAgICAgfSxcbiAgICAgICAgYWZ0ZXJEcmFnOiBmdW5jdGlvbihub2RlcywgZHJhZ2dlZCkge1xuICAgICAgICAgIC8vIGRyYWcgaW4gc29ydE9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgc29ydCBvcmRlciAoZHVoISlcbiAgICAgICAgICBub2Rlcy5mb3JFYWNoKChuLGkpID0+IHtcbiAgICAgICAgICAgICAgbi5zb3J0LmxldmVsID0gaVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uc29ydCA/IGNvZGVwb2ludHNbXCJyZW9yZGVyXCJdIDogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IG4uc29ydCA/IG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA6IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIGxldCBjYyA9IGNvZGVwb2ludHNbIGRpciA9PT0gXCJhc2NcIiA/IFwiYXJyb3dfdXB3YXJkXCIgOiBkaXIgPT09IFwiZGVzY1wiID8gXCJhcnJvd19kb3dud2FyZFwiIDogXCJcIiBdO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYyA/IGNjIDogXCJcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBjb25zdHJhaW50TG9naWM6IHtcbiAgICAgICAgbmFtZTogXCJjb25zdHJhaW50TG9naWNcIixcbiAgICAgICAgbGF5b3V0U3R5bGU6IFwiZGVuZHJvZ3JhbVwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBjb25zdHJhaW50IGxvZ2ljIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gY29uc3RyYWluZWQgbm9kZXMgYXJlIGF0IHRoZSB0b3AsIGluIGNvZGUgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBsZXQgYWNvbnN0ID0gYS5jb25zdHJhaW50cyAmJiBhLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGFjb2RlID0gYWNvbnN0ID8gYS5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBsZXQgYmNvbnN0ID0gYi5jb25zdHJhaW50cyAmJiBiLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgbGV0IGJjb2RlID0gYmNvbnN0ID8gYi5jb25zdHJhaW50c1swXS5jb2RlIDogbnVsbDtcbiAgICAgICAgICBpZiAoYWNvbnN0KVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gKGFjb2RlIDwgYmNvZGUgPyAtMSA6IGFjb2RlID4gYmNvZGUgPyAxIDogMCkgOiAtMTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBiY29uc3QgPyAxIDogbmFtZUNvbXAoYSwgYik7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIENvbXBhcmF0b3IgZnVuY3Rpb24sIGZvciBzb3J0aW5nIGEgbGlzdCBvZiBub2RlcyBieSBuYW1lLiBDYXNlLWluc2Vuc2l0aXZlLlxuLy9cbmxldCBuYW1lQ29tcCA9IGZ1bmN0aW9uKGEsYikge1xuICAgIGxldCBuYSA9IGEubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBuYiA9IGIubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBuYSA8IG5iID8gLTEgOiBuYSA+IG5iID8gMSA6IDA7XG59O1xuXG5leHBvcnQgeyBlZGl0Vmlld3MgfTtcblxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvZWRpdFZpZXdzLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxuaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7IGQzanNvblByb21pc2UsIGluaXRPcHRpb25MaXN0IH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBnZXRTdWJjbGFzc2VzIH0gZnJvbSAnLi9tb2RlbC5qcyc7XG5cbmNsYXNzIENvbnN0cmFpbnRFZGl0b3Ige1xuXG4gICAgY29uc3RydWN0b3IgKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuYWZ0ZXJTYXZlID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgLy8gT3BlbnMgdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZvciBjb25zdHJhaW50IGMgb2Ygbm9kZSBuLlxuICAgIC8vXG4gICAgb3BlbihjLCBuKSB7XG5cbiAgICAgICAgLy8gTm90ZSBpZiB0aGlzIGlzIGhhcHBlbmluZyBhdCB0aGUgcm9vdCBub2RlXG4gICAgICAgIGxldCBpc3Jvb3QgPSAhIG4ucGFyZW50O1xuICAgICBcbiAgICAgICAgLy8gRmluZCB0aGUgZGl2IGZvciBjb25zdHJhaW50IGMgaW4gdGhlIGRpYWxvZyBsaXN0aW5nLiBXZSB3aWxsXG4gICAgICAgIC8vIG9wZW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9uIHRvcCBvZiBpdC5cbiAgICAgICAgbGV0IGNkaXY7XG4gICAgICAgIGQzLnNlbGVjdEFsbChcIiNkaWFsb2cgLmNvbnN0cmFpbnRcIilcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGNjKXsgaWYoY2MgPT09IGMpIGNkaXYgPSB0aGlzOyB9KTtcbiAgICAgICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBjb25zdHJhaW50J3MgY29udGFpbmVyIGRpdlxuICAgICAgICBsZXQgY2JiID0gY2Rpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBhcHAncyBtYWluIGJvZHkgZWxlbWVudFxuICAgICAgICBsZXQgZGJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAvLyBwb3NpdGlvbiB0aGUgY29uc3RyYWludCBlZGl0b3Igb3ZlciB0aGUgY29uc3RyYWludCBpbiB0aGUgZGlhbG9nXG4gICAgICAgIGxldCBjZWQgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBjLmN0eXBlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJvcGVuXCIsIHRydWUpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgYy5zdW1tYXJ5TGlzdClcbiAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCAoY2JiLnRvcCAtIGRiYi50b3ApK1wicHhcIilcbiAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgKGNiYi5sZWZ0IC0gZGJiLmxlZnQpK1wicHhcIilcbiAgICAgICAgICAgIDtcblxuICAgICAgICAvLyBJbml0IHRoZSBjb25zdHJhaW50IGNvZGUgXG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJjb2RlXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGMuY29kZSk7XG5cbiAgICAgICAgdGhpcy5pbml0SW5wdXRzKG4sIGMpO1xuXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gV2hlbiB1c2VyIHNlbGVjdHMgYW4gb3BlcmF0b3IsIGFkZCBhIGNsYXNzIHRvIHRoZSBjLmUuJ3MgY29udGFpbmVyXG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpXG4gICAgICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCBvcCA9IE9QSU5ERVhbdGhpcy52YWx1ZV07XG4gICAgICAgICAgICAgICAgc2VsZi5pbml0SW5wdXRzKG4sIGMsIG9wLmN0eXBlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5jYW5jZWxcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5jYW5jZWwobiwgYykgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zYXZlXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuc2F2ZUVkaXRzKG4sIGMpIH0pO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yIC5idXR0b24uc3luY1wiKVxuICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLmdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKS50aGVuKCgpID0+IHRoaXMuaW5pdElucHV0cyhuLCBjKSkgfSk7XG5cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplcyB0aGUgaW5wdXQgZWxlbWVudHMgaW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZyb20gdGhlIGdpdmVuIGNvbnN0cmFpbnQuXG4gICAgLy9cbiAgICBpbml0SW5wdXRzIChuLCBjLCBjdHlwZSkge1xuXG4gICAgICAgIC8vIFBvcHVsYXRlIHRoZSBvcGVyYXRvciBzZWxlY3QgbGlzdCB3aXRoIG9wcyBhcHByb3ByaWF0ZSBmb3IgdGhlIHBhdGhcbiAgICAgICAgLy8gYXQgdGhpcyBub2RlLlxuICAgICAgICBpZiAoIWN0eXBlKSBcbiAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cIm9wXCJdJywgXG4gICAgICAgICAgICBPUFMuZmlsdGVyKGZ1bmN0aW9uKG9wKXsgcmV0dXJuIG4ub3BWYWxpZChvcCk7IH0pLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTogZCA9PiBkLm9wLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5vcCxcbiAgICAgICAgICAgIHNlbGVjdGVkOmMub3BcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICBjdHlwZSA9IGN0eXBlIHx8IGMuY3R5cGU7XG5cbiAgICAgICAgbGV0IGNlID0gZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIik7XG4gICAgICAgIGxldCBzbXpkID0gY2UuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG4gICAgICAgIGNlLmF0dHIoXCJjbGFzc1wiLCBcIm9wZW4gXCIgKyBjdHlwZSlcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXplZFwiLCAgc216ZClcbiAgICAgICAgICAgIC5jbGFzc2VkKFwiYmlvZW50aXR5XCIsICBuLmlzQmlvRW50aXR5KTtcbiAgICAgXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChjdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3Igc2VsZWN0W25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgIFtcIkFueVwiXS5jb25jYXQobi50ZW1wbGF0ZS5tb2RlbC5taW5lLm9yZ2FuaXNtTGlzdCksXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RlZDogYy5leHRyYVZhbHVlIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBvcHRpb24gbGlzdCBvZiBzdWJjbGFzcyBuYW1lc1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBuLnBhcmVudCA/IGdldFN1YmNsYXNzZXMobi5wY29tcC5raW5kID8gbi5wY29tcC50eXBlIDogbi5wY29tcCkgOiBbXSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZCA9PiBkLm5hbWUsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gc3ViY2xhc3NlcylcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogZnVuY3Rpb24oZCl7IFxuICAgICAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBvbmUgd2hvc2UgbmFtZSBtYXRjaGVzIHRoZSBub2RlJ3MgdHlwZSBhbmQgc2V0IGl0cyBzZWxlY3RlZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoZXMgPSBkLm5hbWUgPT09ICgobi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZSkubmFtZSB8fCBuLnB0eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXMgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBuLnRlbXBsYXRlLm1vZGVsLm1pbmUubGlzdHMuZmlsdGVyKGZ1bmN0aW9uIChsKSB7IHJldHVybiBuLmxpc3RWYWxpZChsKTsgfSksXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC50aXRsZSxcbiAgICAgICAgICAgICAgICB0aXRsZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCIoTm8gbGlzdHMpXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGMudmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCB8fCBjLnZhbHVlcyB8fCBbYy52YWx1ZV0sXG4gICAgICAgICAgICAgICAgeyBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiTm8gbGlzdFwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlcyB8fCBbYy52YWx1ZV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgICAgICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgICAgICBjLnN1bW1hcnlMaXN0IHx8IFtjLnZhbHVlXSxcbiAgICAgICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbXB0eU1lc3NhZ2U6IFwiTm8gcmVzdWx0c1wiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUgPT09IFwibnVsbFwiKSB7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIlVucmVjb2duaXplZCBjdHlwZTogXCIgKyBjdHlwZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cbiAgICAvKlxuICAgIC8vXG4gICAgdXBkYXRlQ0VpbnB1dHMgKGMsIG9wKSB7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJvcFwiXScpWzBdWzBdLnZhbHVlID0gb3AgfHwgYy5vcDtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKS50ZXh0KGMuY29kZSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLmN0eXBlPT09XCJudWxsXCIgPyBcIlwiIDogYy52YWx1ZTtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpWzBdWzBdLnZhbHVlID0gZGVlcGMoYy52YWx1ZXMpO1xuICAgIH1cbiAgICAqL1xuXG5cbiAgICAvLyBHZW5lcmF0ZXMgYW4gb3B0aW9uIGxpc3Qgb2YgZGlzdGluY3QgdmFsdWVzIHRvIHNlbGVjdCBmcm9tLlxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBuICAobm9kZSkgIFRoZSBub2RlIHdlJ3JlIHdvcmtpbmcgb24uIE11c3QgYmUgYW4gYXR0cmlidXRlIG5vZGUuXG4gICAgLy8gICBjICAoY29uc3RyYWludCkgVGhlIGNvbnN0cmFpbnQgdG8gZ2VuZXJhdGUgdGhlIGxpc3QgZm9yLlxuICAgIC8vIE5COiBPbmx5IHZhbHVlIGFuZCBtdWx0aXZhdWUgY29uc3RyYWludHMgY2FuIGJlIHN1bW1hcml6ZWQgaW4gdGhpcyB3YXkuICBcbiAgICBnZW5lcmF0ZU9wdGlvbkxpc3QgKG4sIGMpIHtcbiAgICAgICAgLy8gVG8gZ2V0IHRoZSBsaXN0LCB3ZSBoYXZlIHRvIHJ1biB0aGUgY3VycmVudCBxdWVyeSB3aXRoIGFuIGFkZGl0aW9uYWwgcGFyYW1ldGVyLCBcbiAgICAgICAgLy8gc3VtbWFyeVBhdGgsIHdoaWNoIGlzIHRoZSBwYXRoIHdlIHdhbnQgZGlzdGluY3QgdmFsdWVzIGZvci4gXG4gICAgICAgIC8vIEJVVCBOT1RFLCB3ZSBoYXZlIHRvIHJ1biB0aGUgcXVlcnkgKndpdGhvdXQqIGNvbnN0cmFpbnQgYyEhXG4gICAgICAgIC8vIEV4YW1wbGU6IHN1cHBvc2Ugd2UgaGF2ZSBhIHF1ZXJ5IHdpdGggYSBjb25zdHJhaW50IGFsbGVsZVR5cGU9VGFyZ2V0ZWQsXG4gICAgICAgIC8vIGFuZCB3ZSB3YW50IHRvIGNoYW5nZSBpdCB0byBTcG9udGFuZW91cy4gV2Ugb3BlbiB0aGUgYy5lLiwgYW5kIHRoZW4gY2xpY2sgdGhlXG4gICAgICAgIC8vIHN5bmMgYnV0dG9uIHRvIGdldCBhIGxpc3QuIElmIHdlIHJ1biB0aGUgcXVlcnkgd2l0aCBjIGludGFjdCwgd2UnbGwgZ2V0IGEgbGlzdFxuICAgICAgICAvLyBjb250YWluaW5nIG9ubHkgXCJUYXJnZXRlZFwiLiBEb2ghXG4gICAgICAgIC8vIEFOT1RIRVIgTk9URTogdGhlIHBhdGggaW4gc3VtbWFyeVBhdGggbXVzdCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBwcm9wZXIuIFRoZSBhcHByb2FjaFxuICAgICAgICAvLyBoZXJlIGlzIHRvIGVuc3VyZSBpdCBieSBhZGRpbmcgdGhlIHBhdGggdG8gdGhlIHZpZXcgbGlzdC5cblxuICAgICAgICAvKlxuICAgICAgICAvLyBTYXZlIHRoaXMgY2hvaWNlIGluIGxvY2FsU3RvcmFnZVxuICAgICAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICAgICAgbGV0IGtleSA9IFwiYXV0b2NvbXBsZXRlXCI7XG4gICAgICAgIGxldCBsc3Q7XG4gICAgICAgIGxzdCA9IGdldExvY2FsKGtleSwgdHJ1ZSwgW10pO1xuICAgICAgICBpZihsc3QuaW5kZXhPZihhdHRyKSA9PT0gLTEpIGxzdC5wdXNoKGF0dHIpO1xuICAgICAgICBzZXRMb2NhbChrZXksIGxzdCwgdHJ1ZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgLy8gYnVpbGQgdGhlIHF1ZXJ5XG4gICAgICAgIGxldCBwID0gbi5wYXRoOyAvLyB3aGF0IHdlIHdhbnQgdG8gc3VtbWFyaXplXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBsZXggPSBuLnRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYzsgLy8gc2F2ZSBjb25zdHJhaW50IGxvZ2ljIGV4cHJcbiAgICAgICAgbi5yZW1vdmVDb25zdHJhaW50KGMpOyAvLyB0ZW1wb3JhcmlseSByZW1vdmUgdGhlIGNvbnN0cmFpbnRcbiAgICAgICAgbi50ZW1wbGF0ZS5zZWxlY3QucHVzaChwKTsgLy8gLy8gbWFrZSBzdXJlIHAgaXMgcGFydCBvZiB0aGUgcXVlcnlcbiAgICAgICAgLy8gZ2V0IHRoZSB4bWxcbiAgICAgICAgbGV0IHggPSBuLnRlbXBsYXRlLmdldFhtbCh0cnVlKTtcbiAgICAgICAgLy8gcmVzdG9yZSB0aGUgdGVtcGxhdGVcbiAgICAgICAgbi50ZW1wbGF0ZS5zZWxlY3QucG9wKCk7XG4gICAgICAgIG4udGVtcGxhdGUuY29uc3RyYWludExvZ2ljID0gbGV4OyAvLyByZXN0b3JlIHRoZSBsb2dpYyBleHByXG4gICAgICAgIG4uYWRkQ29uc3RyYWludChjKTsgLy8gcmUtYWRkIHRoZSBjb25zdHJhaW50XG5cbiAgICAgICAgLy8gYnVpbGQgdGhlIHVybFxuICAgICAgICBsZXQgZSA9IGVuY29kZVVSSUNvbXBvbmVudCh4KTtcbiAgICAgICAgbGV0IHVybCA9IGAke24udGVtcGxhdGUubW9kZWwubWluZS51cmx9L3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9zdW1tYXJ5UGF0aD0ke3B9JmZvcm1hdD1qc29ucm93cyZxdWVyeT0ke2V9YFxuICAgICAgICBsZXQgdGhyZXNob2xkID0gMjUwO1xuXG4gICAgICAgIC8vIGN2YWxzIGNvbnRhaW50cyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlKHMpXG4gICAgICAgIGxldCBjdmFscyA9IFtdO1xuICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgICAgIGN2YWxzID0gYy52YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgICBjdmFscyA9IFsgYy52YWx1ZSBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2lnbmFsIHRoYXQgd2UncmUgc3RhcnRpbmdcbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgIC5jbGFzc2VkKFwic3VtbWFyaXppbmdcIiwgdHJ1ZSk7XG4gICAgICAgIC8vIGdvIVxuICAgICAgICBsZXQgcHJvbSA9IGQzanNvblByb21pc2UodXJsKS50aGVuKGZ1bmN0aW9uKGpzb24pe1xuICAgICAgICAgICAgLy8gVGhlIGxpc3Qgb2YgdmFsdWVzIGlzIGluIGpzb24ucmV1bHRzLlxuICAgICAgICAgICAgLy8gRWFjaCBsaXN0IGl0ZW0gbG9va3MgbGlrZTogeyBpdGVtOiBcInNvbWVzdHJpbmdcIiwgY291bnQ6IDE3IH1cbiAgICAgICAgICAgIC8vIChZZXMsIHdlIGdldCBjb3VudHMgZm9yIGZyZWUhIE91Z2h0IHRvIG1ha2UgdXNlIG9mIHRoaXMuKVxuICAgICAgICAgICAgbGV0IHJlcyA9IGpzb24ucmVzdWx0cy5tYXAociA9PiByLml0ZW0pLnNvcnQoKTtcbiAgICAgICAgICAgIC8vIGNoZWNrIHNpemUgb2YgcmVzdWx0XG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIC8vIHRvbyBiaWcuIGFzayB1c2VyIHdoYXQgdG8gZG8uXG4gICAgICAgICAgICAgICAgbGV0IGFucyA9IHByb21wdChgVGhlcmUgYXJlICR7cmVzLmxlbmd0aH0gcmVzdWx0cywgd2hpY2ggZXhjZWVkcyB0aGUgdGhyZXNob2xkIG9mICR7dGhyZXNob2xkfS4gSG93IG1hbnkgZG8geW91IHdhbnQgdG8gc2hvdz9gLCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgICAgIGlmIChhbnMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlciBzZXogY2FuY2VsXG4gICAgICAgICAgICAgICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhbnMgPSBwYXJzZUludChhbnMpO1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihhbnMpIHx8IGFucyA8PSAwKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gdXNlciB3YW50cyB0aGlzIG1hbnkgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBhbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgPSByZXM7XG5cbiAgICAgICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICAgICAnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nLFxuICAgICAgICAgICAgICAgICAgICBjLnN1bW1hcnlMaXN0LCBcbiAgICAgICAgICAgICAgICAgICAgeyBzZWxlY3RlZDogZCA9PiBjdmFscy5pbmRleE9mKGQpICE9PSAtMSB8fCBudWxsIH0pO1xuXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbTsgLy8gc28gY2FsbGVyIGNhbiBjaGFpblxuICAgIH1cbiAgICAvL1xuICAgIGNhbmNlbCAobiwgYykge1xuICAgICAgICBpZiAoISBjLnNhdmVkKSB7XG4gICAgICAgICAgICBuLnJlbW92ZUNvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICB0aGlzLmFmdGVyU2F2ZShuKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG4gICAgaGlkZSgpIHtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIikuY2xhc3NlZChcIm9wZW5cIiwgbnVsbCk7XG4gICAgfVxuICAgIC8vXG4gICAgc2F2ZUVkaXRzKG4sIGMpIHtcbiAgICAgICAgLy9cbiAgICAgICAgbGV0IG8gPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZTtcbiAgICAgICAgYy5zZXRPcChvKTtcbiAgICAgICAgYy5zYXZlZCA9IHRydWU7XG4gICAgICAgIC8vXG4gICAgICAgIGxldCB2YWwgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZTtcbiAgICAgICAgbGV0IHZhbHMgPSBbXTtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgICAgICAuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHZhbHMucHVzaCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGxldCB6ID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvcicpLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuXG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcIm51bGxcIil7XG4gICAgICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwic3ViY2xhc3NcIikge1xuICAgICAgICAgICAgYy50eXBlID0gdmFsc1swXVxuICAgICAgICAgICAgYy52YWx1ZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgICAgIGxldCByZW1vdmVkID0gbi5zZXRTdWJjbGFzc0NvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICBpZihyZW1vdmVkLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJDb25zdHJhaW5pbmcgdG8gc3ViY2xhc3MgXCIgKyAoYy50eXBlIHx8IG4ucHR5cGUubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgKyBcIiBjYXVzZWQgdGhlIGZvbGxvd2luZyBwYXRocyB0byBiZSByZW1vdmVkOiBcIiBcbiAgICAgICAgICAgICAgICAgICAgKyByZW1vdmVkLm1hcChuID0+IG4ucGF0aCkuam9pbihcIiwgXCIpKTsgXG4gICAgICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlID0gdmFsO1xuICAgICAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICAgICAgYy5leHRyYVZhbHVlID0gdmFsc1swXSA9PT0gXCJBbnlcIiA/IG51bGwgOiB2YWxzWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlID0gdmFsc1swXTtcbiAgICAgICAgICAgIGMudmFsdWVzID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIikge1xuICAgICAgICAgICAgYy52YWx1ZXMgPSB2YWxzO1xuICAgICAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJyYW5nZVwiKSB7XG4gICAgICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgICAgIGMudmFsdWUgPSB6ID8gdmFsc1swXSA6IHZhbDtcbiAgICAgICAgICAgIGMudHlwZSA9IGMudmFsdWVzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiVW5rbm93biBjdHlwZTogXCIrYy5jdHlwZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgdGhpcy5hZnRlclNhdmUgJiYgdGhpcy5hZnRlclNhdmUobik7XG4gICAgfVxuXG59IC8vIGNsYXNzIENvbnN0cmFpbnRFZGl0b3JcbmV4cG9ydCB7IENvbnN0cmFpbnRFZGl0b3IgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2NvbnN0cmFpbnRFZGl0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==