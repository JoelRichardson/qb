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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return esc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return d3jsonPromise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return selectText; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return deepc; });
/* unused harmony export getLocal */
/* unused harmony export setLocal */
/* unused harmony export testLocal */
/* unused harmony export clearLocal */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return parsePathQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return obj2array; });

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
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ops_js__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__material_icon_codepoints_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__undoManager_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__model_js__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__registry_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__editViews_js__ = __webpack_require__(8);

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
//import { mines } from './mines.js';








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
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* selectText */])("xmltextarea")});
    d3.select("#jsontextarea")
        .on("focus", function(){ this.value && Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* selectText */])("jsontextarea")});

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

    //
    d3.select("#dialog .subclassConstraint select")
        .on("change", function(){ currNode.setSubclassConstraint(this.value); });
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
            let currSort = cc.classed
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
    currMine = name2mine[mname];
    clearState();
    let url = currMine.url;
    let turl, murl, lurl, burl, surl, ourl;
    currMine.tnames = []
    currMine.templates = []
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
        currMine.model = new __WEBPACK_IMPORTED_MODULE_4__model_js__["a" /* Model */](j_model.model)
        currMine.templates = j_templates.templates;
        currMine.lists = j_lists.lists;
        currMine.summaryFields = j_summary.classes;
        currMine.organismList = j_organisms.results.map(o => o.shortName);
        //
        currMine.tlist = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(currMine.templates)
        currMine.tlist.sort(function(a,b){ 
            return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
        });
        currMine.tnames = Object.keys( currMine.templates );
        currMine.tnames.sort();
        // Fill in the selection list of templates for this mine.
        var tl = d3.select("#tlist select")
            .selectAll('option')
            .data( currMine.tlist );
        tl.enter().append('option')
        tl.exit().remove()
        tl.attr("value", function(d){ return d.name; })
          .text(function(d){return d.title;});
        d3.selectAll('[name="editTarget"] [name="in"]')
            .on("change", startEdit);
        editTemplate(currMine.templates[currMine.tlist[0].name]);
        // Apply branding
        let clrs = currMine.colors || defaultColors;
        let bgc = clrs.header ? clrs.header.main : clrs.main.fg;
        let txc = clrs.header ? clrs.header.text : clrs.main.bg;
        let logo = currMine.images.logo || defaultLogo;
        d3.select("#tooltray")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#tInfoBar")
            .style("background-color", bgc)
            .style("color", txc);
        d3.select("#mineLogo")
            .attr("src", logo);
        d3.selectAll('#svgContainer [name="minename"]')
            .text(currMine.name);
        // populate class list 
        let clist = Object.keys(currMine.model.classes).filter(cn => ! currMine.model.classes[cn].isLeafType);
        clist.sort();
        initOptionList("#newqclist select", clist);
        d3.select('#editSourceSelector [name="in"]')
            .call(function(){ this[0][0].selectedIndex = 1; })
            .on("change", function(){ selectedEditSource(this.value); startEdit(); });
        d3.select("#xmltextarea")[0][0].value = "";
        d3.select("#jsontextarea").value = "";
        selectedEditSource( "tlist" );

    }, function(error){
        alert(`Could not access ${currMine.name}. Status=${error.status}. Error=${error.statusText}. (If there is no error message, then its probably a CORS issue.)`);
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
        val && editTemplate(Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["e" /* parsePathQuery */])(val));
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
            let m = ct.addPath(sf, currMine.model);
            if (! m.isSelected) {
                m.select();
            }
        });
    }
    else {
        p = currNode.path + "." + p;
        n = ct.addPath(p, currMine.model );
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
                editConstraint(cc, n)
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

//
function updateCEinputs(c, op){
    d3.select('#constraintEditor [name="op"]')[0][0].value = op || c.op;
    d3.select('#constraintEditor [name="code"]').text(c.code);

    d3.select('#constraintEditor [name="value"]')[0][0].value = c.ctype==="null" ? "" : c.value;
    d3.select('#constraintEditor [name="values"]')[0][0].value = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(c.values);
}

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
function initOptionList(selector, data, cfg){
    
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

// Initializes the input elements in the constraint editor from the given constraint.
//
function initCEinputs(n, c, ctype) {

    // Populate the operator select list with ops appropriate for the path
    // at this node.
    if (!ctype) 
      initOptionList(
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
        initOptionList(
            '#constraintEditor select[name="values"]',
            ["Any"].concat(currMine.organismList),
            { selected: c.extraValue }
            );
    }
    else if (ctype === "subclass") {
        // Create an option list of subclass names
        initOptionList(
            '#constraintEditor select[name="values"]',
            n.parent ? Object(__WEBPACK_IMPORTED_MODULE_4__model_js__["c" /* getSubclasses */])(n.pcomp.kind ? n.pcomp.type : n.pcomp) : [],
            { multiple: false,
            value: d => d.name,
            title: d => d.name,
            emptyMessage: "(No subclasses)",
            selected: function(d){ 
                // Find the one whose name matches the node's type and set its selected attribute
                var matches = d.name === ((n.subclassConstraint || n.ptype).name || n.ptype);
                return matches || null;
                }
            });
    }
    else if (ctype === "list") {
        initOptionList(
            '#constraintEditor select[name="values"]',
            currMine.lists.filter(function (l) { return currNode.listValid(l); }),
            { multiple: false,
            value: d => d.title,
            title: d => d.title,
            emptyMessage: "(No lists)",
            selected: c.value
            });
    }
    else if (ctype === "multivalue") {
        initOptionList(
            '#constraintEditor select[name="values"]',
            c.summaryList || c.values || [c.value],
            { multiple: true,
            emptyMessage: "No list",
            selected: c.values || [c.value]
            });
    } else if (ctype === "value") {
        let attr = (n.parent.subclassConstraint || n.parent.ptype).name + "." + n.pcomp.name;
        d3.select('#constraintEditor input[name="value"]')[0][0].value = c.value;
        initOptionList(
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

// Opens the constraint editor for constraint c of node n.
//
function openConstraintEditor(c, n){

    // Note if this is happening at the root node
    var isroot = ! n.parent;
 
    // Find the div for constraint c in the dialog listing. We will
    // open the constraint editor on top of it.
    var cdiv;
    d3.selectAll("#dialog .constraint")
        .each(function(cc){ if(cc === c) cdiv = this; });
    // bounding box of the constraint's container div
    var cbb = cdiv.getBoundingClientRect();
    // bounding box of the app's main body element
    var dbb = d3.select("#qb")[0][0].getBoundingClientRect();
    // position the constraint editor over the constraint in the dialog
    var ced = d3.select("#constraintEditor")
        .attr("class", c.ctype)
        .classed("open", true)
        .classed("summarized", c.summaryList)
        .style("top", (cbb.top - dbb.top)+"px")
        .style("left", (cbb.left - dbb.left)+"px")
        ;

    // Init the constraint code 
    d3.select('#constraintEditor [name="code"]')
        .text(c.code);

    initCEinputs(n, c);

    // When user selects an operator, add a class to the c.e.'s container
    d3.select('#constraintEditor [name="op"]')
        .on("change", function(){
            var op = __WEBPACK_IMPORTED_MODULE_0__ops_js__["b" /* OPINDEX */][this.value];
            initCEinputs(n, c, op.ctype);
        })
        ;

    d3.select("#constraintEditor .button.cancel")
        .on("click", function(){ cancelConstraintEditor(n, c) });

    d3.select("#constraintEditor .button.save")
        .on("click", function(){ saveConstraintEdits(n, c) });

    d3.select("#constraintEditor .button.sync")
        .on("click", function(){ generateOptionList(n, c).then(() => initCEinputs(n, c)) });

}
// Generates an option list of distinct values to select from.
// Args:
//   n  (node)  The node we're working on. Must be an attribute node.
//   c  (constraint) The constraint to generate the list for.
// NB: Only value and multivaue constraints can be summarized in this way.  
function generateOptionList(n, c){
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
    let j = n.template.uncompileTemplate();
    j.select.push(p); // make sure p is part of the query
    n.template.constraintLogic = lex; // restore the logic expr
    n.addConstraint(c); // re-add the constraint

    // build the url
    let x = json2xml(j, true);
    let e = encodeURIComponent(x);
    let url = `${currMine.url}/service/query/results?summaryPath=${p}&format=jsonrows&query=${e}`
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

        initOptionList(
                '#constraintEditor [name="values"]',
                c.summaryList, 
                { selected: d => cvals.indexOf(d) !== -1 || null });

    });
    return prom; // so caller can chain
}
//
function cancelConstraintEditor(n, c){
    if (! c.saved) {
        n.removeConstraint(c);
        saveState(n);
        update(n);
        showDialog(n, null, true);
    }
    hideConstraintEditor();
}
function hideConstraintEditor(){
    d3.select("#constraintEditor").classed("open", null);
}
//
function editConstraint(c, n){
    openConstraintEditor(c, n);
}
//
function saveConstraintEdits(n, c){
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
        n.setSubclassConstraint(c.type)
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
    hideConstraintEditor();
    showDialog(n, null, true);
    saveState(n);
    update(n);
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
            editConstraint(c, n);
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
          editConstraint(c, n);
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
// Turns a json representation of a template into XML, suitable for importing into the Intermine QB.
function json2xml(t, qonly){
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
    var qpart = 
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

//
function updateTtext(t){
  let uct = t.uncompileTemplate();
  let txt;
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
  if( d3.select("#ttext").classed("json") )
      txt = JSON.stringify(uct, null, 2);
  else
      txt = json2xml(uct);
  //
  d3.select("#ttextdiv") 
      .text(txt)
      .on("focus", function(){
          d3.select("#drawer").classed("expanded", true);
          Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["f" /* selectText */])("ttextdiv");
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
  let txt = json2xml(uct);
  let urlTxt = encodeURIComponent(txt);
  let linkurl = currMine.url + "/loadQuery.do?trail=%7Cquery&method=xml";
  let editurl = linkurl + "&query=" + urlTxt;
  let runurl = linkurl + "&skipBuilder=true&query=" + urlTxt;
  window.open( d3.event.altKey ? editurl : runurl, '_blank' );
}

function updateCount(t){
  let uct = t.uncompileTemplate();
  let qtxt = json2xml(uct, true);
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
/* 4 */
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
/* 5 */
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
    constructor (cfg) {
        let model = this;
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
        this.allClasses = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(this.classes)
        var cns = Object.keys(this.classes);
        cns.sort()
        cns.forEach(function(cn){
            var cls = model.classes[cn];
            cls.allAttributes = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(cls.attributes)
            cls.allReferences = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(cls.references)
            cls.allCollections = Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(cls.collections)
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
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(ans);
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
    return Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["d" /* obj2array */])(ans);
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

    // Args:
    //   scName (type) Name of subclass.
    setSubclassConstraint (scName) {
        let n = this;
        // remove any existing subclass constraint
        n.constraints = n.constraints.filter(function (c){ return c.ctype !== "subclass"; });
        n.subclassConstraint = null;
        if (scName){
            let cls = this.template.model.classes[scName];
            if(!cls) throw "Could not find class " + scName;
            n.constraints.push({ ctype:"subclass", op:"ISA", path:n.path, type:cls.name });
            n.subclassConstraint = cls;
        }
        function check(node, removed) {
            let cls = node.subclassConstraint || node.ptype;
            let c2 = [];
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
        let removed = check(n,[]);
        hideDialog();
        update(n);
        if(removed.length > 0)
            window.setTimeout(function(){
                alert("Constraining to subclass " + (scName || n.ptype.name)
                + " caused the following paths to be removed: " 
                + removed.map(n => n.path).join(", ")); 
            }, animationDuration);
    }

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
    //   c (constraint) If given, use that constraint. Otherwise autogenerate.
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
        if (c.ctype !== "subclass") {
            c.code = this.template.nextAvailableCode();
            this.template.code2c[c.code] = c;
            this.template.setLogicExpression();
        }
        return c;
    }

    removeConstraint (c){
        this.constraints = this.constraints.filter(function(cc){ return cc !== c; });
        this.template.where = this.template.where.filter(function(cc){ return cc !== c; });
        delete this.template.code2c[c.code];
        if (c.ctype === "subclass") this.subclassConstraint = null;
        this.template.setLogicExpression();
        return c;
    }
} // end of class Node

class Template {
    constructor (t, model) {
        t = t || {}
        this.model = t.model ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.model) : { name: "genomic" };
        this.name = t.name || "";
        this.title = t.title || "";
        this.description = t.description || "";
        this.comment = t.comment || "";
        this.select = t.select ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.select) : [];
        this.where = t.where ? t.where.map( c => c.clone ? c.clone() : new Constraint(c) ) : [];
        this.constraintLogic = t.constraintLogic || "";
        this.joins = t.joins ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.joins) : [];
        this.tags = t.tags ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.tags) : [];
        this.orderBy = t.orderBy ? Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(t.orderBy) : [];
        this.compile(model);
    }

    compile (model) {
        var roots = []
        var t = this;
        // the tree of nodes representing the compiled query will go here
        t.qtree = null;
        // index of code to constraint gors here.
        t.code2c = {}
        // normalize things that may be undefined
        t.comment = t.comment || "";
        t.description = t.description || "";
        //
        var subclassCs = [];
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
                 var n = t.addPath(c.path, model);
                 var cls = model.classes[c.type];
                 if (!cls) throw "Could not find class " + c.type;
                 n.subclassConstraint = cls;
            });
        //
        t.where && t.where.forEach(function(c){
            var n = t.addPath(c.path, model);
            if (n.constraints)
                n.constraints.push(c)
            else
                n.constraints = [c];
        })

        //
        t.select && t.select.forEach(function(p,i){
            var n = t.addPath(p, model);
            n.select();
        })
        t.joins && t.joins.forEach(function(j){
            var n = t.addPath(j, model);
            n.join = "outer";
        })
        t.orderBy && t.orderBy.forEach(function(o, i){
            var p = Object.keys(o)[0]
            var dir = o[p]
            var n = t.addPath(p, model);
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
            model: Object(__WEBPACK_IMPORTED_MODULE_1__utils_js__["b" /* deepc */])(tmplt.model),
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
    //   model object Compiled data model.
    // Returns:
    //   last path component created. 
    // Side effects:
    //   Creates new nodes as needed and adds them to the qtree.
    addPath (path, model){
        let template = this;
        if (typeof(path) === "string")
            path = path.split(".");
        let classes = model.classes;
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

    // TODO: Keep moving functions into methods
    // FIXME: Not all templates are Temaplates !! (some are still plain objects created elsewise)
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
    // Returns an unregistered clone. (means: no node pointer)
    clone () {
        let c = new Constraint(this);
        c.node = null;
        return c;
    }
    /*
    get json () { 
        let j = {
            ctype: this.ctype,
            path: this.path
        }
        if (this.ctype !== "subclass"){
            j.op = this.op;
            j.code = this.code;
            if (this.ctype === "lookup" && this.extraValue) {
                j.extraValue = this.extraValue;
            }
        }
        else {
            j.type = this.type;
        }
       
    }
    */
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





/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMTAxMTJjZDY0YjhlMWU1NmVkM2MiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9vcHMuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvcWIuanMiLCJ3ZWJwYWNrOi8vLy4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9tb2RlbC5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvcGFyc2VyLmpzIiwid2VicGFjazovLy8uL3Jlc291cmNlcy9qcy9yZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly8vLi9yZXNvdXJjZXMvanMvZWRpdFZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxzQkFBc0Isd0JBQXdCLEc7QUFDL0U7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixvREFBb0Q7QUFDaEYsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixjQUFjO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsY0FBYyxHQUFHLGNBQWM7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsTUFBTSxhQUFhLFFBQVE7QUFDM0M7QUFDQSxZQUFZLFlBQVksR0FBRyxhQUFhO0FBQ3hDO0FBQ0EsWUFBWSx1QkFBdUIsR0FBRyx3QkFBd0I7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQVlBOzs7Ozs7Ozs7Ozs7QUMvTUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVHOzs7Ozs7O0FDbk9SO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7O0FBRUw7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy82QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDNkM7QUFROUQ7QUFDa0I7QUFDbkI7QUFPQztBQUNzQjtBQUNIOztBQUVwQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRC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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGtDQUFrQyxhQUFhO0FBQy9DO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRVEiLCJmaWxlIjoicWIuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMTAxMTJjZDY0YjhlMWU1NmVkM2MiLCJcbi8vXG4vLyBGdW5jdGlvbiB0byBlc2NhcGUgJzwnICdcIicgYW5kICcmJyBjaGFyYWN0ZXJzXG5mdW5jdGlvbiBlc2Mocyl7XG4gICAgaWYgKCFzKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIik7IFxufVxuXG4vLyBQcm9taXNpZmllcyBhIGNhbGwgdG8gZDMuanNvbi5cbi8vIEFyZ3M6XG4vLyAgIHVybCAoc3RyaW5nKSBUaGUgdXJsIG9mIHRoZSBqc29uIHJlc291cmNlXG4vLyBSZXR1cm5zOlxuLy8gICBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUganNvbiBvYmplY3QgdmFsdWUsIG9yIHJlamVjdHMgd2l0aCBhbiBlcnJvclxuZnVuY3Rpb24gZDNqc29uUHJvbWlzZSh1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGQzLmpzb24odXJsLCBmdW5jdGlvbihlcnJvciwganNvbil7XG4gICAgICAgICAgICBlcnJvciA/IHJlamVjdCh7IHN0YXR1czogZXJyb3Iuc3RhdHVzLCBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0fSkgOiByZXNvbHZlKGpzb24pO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG4vLyBTZWxlY3RzIGFsbCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4gY29udGFpbmVyLiBcbi8vIFRoZSBjb250YWluZXIgbXVzdCBoYXZlIGFuIGlkLlxuLy8gQ29waWVkIGZyb206XG4vLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjc3NDUxL2hvdy10by1zZWxlY3QtZGl2LXRleHQtb24tYnV0dG9uLWNsaWNrXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGNvbnRhaW5lcmlkKSB7XG4gICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICByYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJpZCkpO1xuICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcbiAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHJhbmdlKTtcbiAgICB9XG59XG5cbi8vIENvbnZlcnRzIGFuIEludGVyTWluZSBxdWVyeSBpbiBQYXRoUXVlcnkgWE1MIGZvcm1hdCB0byBhIEpTT04gb2JqZWN0IHJlcHJlc2VudGF0aW9uLlxuLy9cbmZ1bmN0aW9uIHBhcnNlUGF0aFF1ZXJ5KHhtbCl7XG4gICAgLy8gVHVybnMgdGhlIHF1YXNpLWxpc3Qgb2JqZWN0IHJldHVybmVkIGJ5IHNvbWUgRE9NIG1ldGhvZHMgaW50byBhY3R1YWwgbGlzdHMuXG4gICAgZnVuY3Rpb24gZG9tbGlzdDJhcnJheShsc3QpIHtcbiAgICAgICAgbGV0IGEgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8bHN0Lmxlbmd0aDsgaSsrKSBhLnB1c2gobHN0W2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIC8vIHBhcnNlIHRoZSBYTUxcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIGxldCBkb20gPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgXCJ0ZXh0L3htbFwiKTtcblxuICAgIC8vIGdldCB0aGUgcGFydHMuIFVzZXIgbWF5IHBhc3RlIGluIGEgPHRlbXBsYXRlPiBvciBhIDxxdWVyeT5cbiAgICAvLyAoaS5lLiwgdGVtcGxhdGUgbWF5IGJlIG51bGwpXG4gICAgbGV0IHRlbXBsYXRlID0gZG9tLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGVtcGxhdGVcIilbMF07XG4gICAgbGV0IHRpdGxlID0gdGVtcGxhdGUgJiYgdGVtcGxhdGUuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikgfHwgXCJcIjtcbiAgICBsZXQgY29tbWVudCA9IHRlbXBsYXRlICYmIHRlbXBsYXRlLmdldEF0dHJpYnV0ZShcImNvbW1lbnRcIikgfHwgXCJcIjtcbiAgICBsZXQgcXVlcnkgPSBkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJxdWVyeVwiKVswXTtcbiAgICBsZXQgbW9kZWwgPSB7IG5hbWU6IHF1ZXJ5LmdldEF0dHJpYnV0ZShcIm1vZGVsXCIpIHx8IFwiZ2Vub21pY1wiIH07XG4gICAgbGV0IG5hbWUgPSBxdWVyeS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpIHx8IFwiXCI7XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gcXVlcnkuZ2V0QXR0cmlidXRlKFwibG9uZ0Rlc2NyaXRpb25cIikgfHwgXCJcIjtcbiAgICBsZXQgc2VsZWN0ID0gKHF1ZXJ5LmdldEF0dHJpYnV0ZShcInZpZXdcIikgfHwgXCJcIikudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgbGV0IGNvbnN0cmFpbnRzID0gZG9tbGlzdDJhcnJheShkb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NvbnN0cmFpbnQnKSk7XG4gICAgbGV0IGNvbnN0cmFpbnRMb2dpYyA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcImNvbnN0cmFpbnRMb2dpY1wiKTtcbiAgICBsZXQgam9pbnMgPSBkb21saXN0MmFycmF5KHF1ZXJ5LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiam9pblwiKSk7XG4gICAgbGV0IHNvcnRPcmRlciA9IHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKSB8fCBcIlwiO1xuICAgIC8vXG4gICAgLy9cbiAgICBsZXQgd2hlcmUgPSBjb25zdHJhaW50cy5tYXAoZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICBsZXQgb3AgPSBjLmdldEF0dHJpYnV0ZShcIm9wXCIpO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjLmdldEF0dHJpYnV0ZShcInR5cGVcIik7XG4gICAgICAgICAgICAgICAgb3AgPSBcIklTQVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZhbHMgPSBkb21saXN0MmFycmF5KGMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ2YWx1ZVwiKSkubWFwKCB2ID0+IHYuaW5uZXJIVE1MICk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBjLmdldEF0dHJpYnV0ZShcInBhdGhcIiksXG4gICAgICAgICAgICAgICAgdmFsdWUgOiBjLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA6IHZhbHMsXG4gICAgICAgICAgICAgICAgdHlwZSA6IGMuZ2V0QXR0cmlidXRlKFwidHlwZVwiKSxcbiAgICAgICAgICAgICAgICBjb2RlOiBjLmdldEF0dHJpYnV0ZShcImNvZGVcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGU6IGMuZ2V0QXR0cmlidXRlKFwiZWRpdGFibGVcIikgfHwgXCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAvLyBDaGVjazogaWYgdGhlcmUgaXMgb25seSBvbmUgY29uc3RyYWludCwgKGFuZCBpdCdzIG5vdCBhbiBJU0EpLCBzb21ldGltZXMgdGhlIGNvbnN0cmFpbnRMb2dpYyBcbiAgICAvLyBhbmQvb3IgdGhlIGNvbnN0cmFpbnQgY29kZSBhcmUgbWlzc2luZy5cbiAgICBpZiAod2hlcmUubGVuZ3RoID09PSAxICYmIHdoZXJlWzBdLm9wICE9PSBcIklTQVwiICYmICF3aGVyZVswXS5jb2RlKXtcbiAgICAgICAgd2hlcmVbMF0uY29kZSA9IGNvbnN0cmFpbnRMb2dpYyA9IFwiQVwiO1xuICAgIH1cblxuICAgIC8vIG91dGVyIGpvaW5zLiBUaGV5IGxvb2sgbGlrZSB0aGlzOlxuICAgIC8vICAgICAgIDxqb2luIHBhdGg9XCJHZW5lLnNlcXVlbmNlT250b2xvZ3lUZXJtXCIgc3R5bGU9XCJPVVRFUlwiLz5cbiAgICBqb2lucyA9IGpvaW5zLm1hcCggaiA9PiBqLmdldEF0dHJpYnV0ZShcInBhdGhcIikgKTtcblxuICAgIGxldCBvcmRlckJ5ID0gbnVsbDtcbiAgICBpZiAoc29ydE9yZGVyKSB7XG4gICAgICAgIC8vIFRoZSBqc29uIGZvcm1hdCBmb3Igb3JkZXJCeSBpcyBhIGJpdCB3ZWlyZC5cbiAgICAgICAgLy8gSWYgdGhlIHhtbCBvcmRlckJ5IGlzOiBcIkEuYi5jIGFzYyBBLmQuZSBkZXNjXCIsXG4gICAgICAgIC8vIHRoZSBqc29uIHNob3VsZCBiZTogWyB7XCJBLmIuY1wiOlwiYXNjXCJ9LCB7XCJBLmQuZVwiOlwiZGVzY30gXVxuICAgICAgICAvLyBcbiAgICAgICAgLy8gVGhlIG9yZGVyYnkgc3RyaW5nIHRva2VucywgZS5nLiBbXCJBLmIuY1wiLCBcImFzY1wiLCBcIkEuZC5lXCIsIFwiZGVzY1wiXVxuICAgICAgICBsZXQgb2IgPSBzb3J0T3JkZXIudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgIC8vIHNhbml0eSBjaGVjazpcbiAgICAgICAgaWYgKG9iLmxlbmd0aCAlIDIgKVxuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgcGFyc2UgdGhlIG9yZGVyQnkgY2xhdXNlOiBcIiArIHF1ZXJ5LmdldEF0dHJpYnV0ZShcInNvcnRPcmRlclwiKTtcbiAgICAgICAgLy8gY29udmVydCB0b2tlbnMgdG8ganNvbiBvcmRlckJ5IFxuICAgICAgICBvcmRlckJ5ID0gb2IucmVkdWNlKGZ1bmN0aW9uKGFjYywgY3VyciwgaSl7XG4gICAgICAgICAgICBpZiAoaSAlIDIgPT09IDApe1xuICAgICAgICAgICAgICAgIC8vIG9kZC4gY3VyciBpcyBhIHBhdGguIFB1c2ggaXQuXG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY3VycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGV2ZW4uIFBvcCB0aGUgcGF0aCwgY3JlYXRlIHRoZSB7fSwgYW5kIHB1c2ggaXQuXG4gICAgICAgICAgICAgICAgbGV0IHYgPSB7fVxuICAgICAgICAgICAgICAgIGxldCBwID0gYWNjLnBvcCgpXG4gICAgICAgICAgICAgICAgdltwXSA9IGN1cnI7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBtb2RlbCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIGNvbnN0cmFpbnRMb2dpYyxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgam9pbnMsXG4gICAgICAgIG9yZGVyQnlcbiAgICB9O1xufVxuXG4vLyBSZXR1cm5zIGEgZGVlcCBjb3B5IG9mIG9iamVjdCBvLiBcbi8vIEFyZ3M6XG4vLyAgIG8gIChvYmplY3QpIE11c3QgYmUgYSBKU09OIG9iamVjdCAobm8gY3VyY3VsYXIgcmVmcywgbm8gZnVuY3Rpb25zKS5cbi8vIFJldHVybnM6XG4vLyAgIGEgZGVlcCBjb3B5IG9mIG9cbmZ1bmN0aW9uIGRlZXBjKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBvO1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKTtcbn1cblxuLy9cbmxldCBQUkVGSVg9XCJvcmcubWdpLmFwcHMucWJcIjtcbmZ1bmN0aW9uIHRlc3RMb2NhbChhdHRyKSB7XG4gICAgcmV0dXJuIChQUkVGSVgrXCIuXCIrYXR0cikgaW4gbG9jYWxTdG9yYWdlO1xufVxuZnVuY3Rpb24gc2V0TG9jYWwoYXR0ciwgdmFsLCBlbmNvZGUpe1xuICAgIGxvY2FsU3RvcmFnZVtQUkVGSVgrXCIuXCIrYXR0cl0gPSBlbmNvZGUgPyBKU09OLnN0cmluZ2lmeSh2YWwpIDogdmFsO1xufVxuZnVuY3Rpb24gZ2V0TG9jYWwoYXR0ciwgZGVjb2RlLCBkZmx0KXtcbiAgICBsZXQga2V5ID0gUFJFRklYK1wiLlwiK2F0dHI7XG4gICAgaWYgKGtleSBpbiBsb2NhbFN0b3JhZ2Upe1xuICAgICAgICBsZXQgdiA9IGxvY2FsU3RvcmFnZVtrZXldO1xuICAgICAgICBpZiAoZGVjb2RlKSB2ID0gSlNPTi5wYXJzZSh2KTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gZGZsdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhckxvY2FsKCkge1xuICAgIGxldCBybXYgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgoUFJFRklYKSk7XG4gICAgcm12LmZvckVhY2goIGsgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oaykgKTtcbn1cblxuLy8gUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBvYmplY3QuXG4vLyBUaGUgbGlzdCBpcyBzb3J0ZWQgYnkgdGhlIGl0ZW0ga2V5cy5cbi8vIElmIG5hbWVBdHRyIGlzIHNwZWNpZmllZCwgdGhlIGl0ZW0ga2V5IGlzIGFsc28gYWRkZWQgdG8gZWFjaCBlbGVtZW50XG4vLyBhcyBhbiBhdHRyaWJ1dGUgKG9ubHkgd29ya3MgaWYgdGhvc2UgaXRlbXMgYXJlIHRoZW1zZWx2ZXMgb2JqZWN0cykuXG4vLyBFeGFtcGxlczpcbi8vICAgIHN0YXRlcyA9IHsnTUUnOntuYW1lOidNYWluZSd9LCAnSUEnOntuYW1lOidJb3dhJ319XG4vLyAgICBvYmoyYXJyYXkoc3RhdGVzKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YSd9LCB7bmFtZTonTWFpbmUnfV1cbi8vICAgIG9iajJhcnJheShzdGF0ZXMsICdhYmJyZXYnKSA9PlxuLy8gICAgICAgIFt7bmFtZTonSW93YScsYWJicmV2J0lBJ30sIHtuYW1lOidNYWluZScsYWJicmV2J01FJ31dXG4vLyBBcmdzOlxuLy8gICAgbyAgKG9iamVjdCkgVGhlIG9iamVjdC5cbi8vICAgIG5hbWVBdHRyIChzdHJpbmcpIElmIHNwZWNpZmllZCwgYWRkcyB0aGUgaXRlbSBrZXkgYXMgYW4gYXR0cmlidXRlIHRvIGVhY2ggbGlzdCBlbGVtZW50LlxuLy8gUmV0dXJuOlxuLy8gICAgbGlzdCBjb250YWluaW5nIHRoZSBpdGVtIHZhbHVlcyBmcm9tIG9cbmZ1bmN0aW9uIG9iajJhcnJheShvLCBuYW1lQXR0cil7XG4gICAgdmFyIGtzID0gT2JqZWN0LmtleXMobyk7XG4gICAga3Muc29ydCgpO1xuICAgIHJldHVybiBrcy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG5hbWVBdHRyKSBvW2tdLm5hbWUgPSBrO1xuICAgICAgICByZXR1cm4gb1trXTtcbiAgICB9KTtcbn07XG5cbi8vXG5leHBvcnQge1xuICAgIGVzYyxcbiAgICBkM2pzb25Qcm9taXNlLFxuICAgIHNlbGVjdFRleHQsXG4gICAgZGVlcGMsXG4gICAgZ2V0TG9jYWwsXG4gICAgc2V0TG9jYWwsXG4gICAgdGVzdExvY2FsLFxuICAgIGNsZWFyTG9jYWwsXG4gICAgcGFyc2VQYXRoUXVlcnksXG4gICAgb2JqMmFycmF5XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3Jlc291cmNlcy9qcy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBWYWxpZCBjb25zdHJhaW50IHR5cGVzIChjdHlwZSk6XG4vLyAgIG51bGwsIGxvb2t1cCwgc3ViY2xhc3MsIGxpc3QsIGxvb3AsIHZhbHVlLCBtdWx0aXZhbHVlLCByYW5nZVxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIGF0dHJpYnV0ZXM6XG4vLyAtIHZhbHVlIChjb21wYXJpbmcgYW4gYXR0cmlidXRlIHRvIGEgdmFsdWUsIHVzaW5nIGFuIG9wZXJhdG9yKVxuLy8gICAgICA+ID49IDwgPD0gPSAhPSBMSUtFIE5PVC1MSUtFIENPTlRBSU5TIERPRVMtTk9ULUNPTlRBSU5cbi8vIC0gbXVsdGl2YWx1ZSAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBtdWx0aXBsZSB2YWx1ZSlcbi8vICAgICAgT05FLU9GIE5PVC1PTkUgT0Zcbi8vIC0gcmFuZ2UgKHN1YnR5cGUgb2YgbXVsdGl2YWx1ZSwgZm9yIGNvb3JkaW5hdGUgcmFuZ2VzKVxuLy8gICAgICBXSVRISU4gT1VUU0lERSBPVkVSTEFQUyBET0VTLU5PVC1PVkVSTEFQXG4vLyAtIG51bGwgKHN1YnR5cGUgb2YgdmFsdWUgY29uc3RyYWludCwgZm9yIHRlc3RpbmcgTlVMTClcbi8vICAgICAgTlVMTCBJUy1OT1QtTlVMTFxuLy9cbi8vIENvbnN0cmFpbnRzIG9uIHJlZmVyZW5jZXMvY29sbGVjdGlvbnNcbi8vIC0gbnVsbCAoc3VidHlwZSBvZiB2YWx1ZSBjb25zdHJhaW50LCBmb3IgdGVzdGluZyBOVUxMIHJlZi9lbXB0eSBjb2xsZWN0aW9uKVxuLy8gICAgICBOVUxMIElTLU5PVC1OVUxMXG4vLyAtIGxvb2t1cCAoXG4vLyAgICAgIExPT0tVUFxuLy8gLSBzdWJjbGFzc1xuLy8gICAgICBJU0Fcbi8vIC0gbGlzdFxuLy8gICAgICBJTiBOT1QtSU5cbi8vIC0gbG9vcCAoVE9ETylcblxuLy8gYWxsIHRoZSBiYXNlIHR5cGVzIHRoYXQgYXJlIG51bWVyaWNcbnZhciBOVU1FUklDVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCJcbl07XG5cbi8vIGFsbCB0aGUgYmFzZSB0eXBlcyB0aGF0IGNhbiBoYXZlIG51bGwgdmFsdWVzXG52YXIgTlVMTEFCTEVUWVBFUz0gW1xuICAgIFwiamF2YS5sYW5nLkludGVnZXJcIixcbiAgICBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwiamF2YS5sYW5nLkxvbmdcIixcbiAgICBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiXG5dO1xuXG4vLyBhbGwgdGhlIGJhc2UgdHlwZXMgdGhhdCBhbiBhdHRyaWJ1dGUgY2FuIGhhdmVcbnZhciBMRUFGVFlQRVM9IFtcbiAgICBcImludFwiLCBcImphdmEubGFuZy5JbnRlZ2VyXCIsXG4gICAgXCJzaG9ydFwiLCBcImphdmEubGFuZy5TaG9ydFwiLFxuICAgIFwibG9uZ1wiLCBcImphdmEubGFuZy5Mb25nXCIsXG4gICAgXCJmbG9hdFwiLCBcImphdmEubGFuZy5GbG9hdFwiLFxuICAgIFwiZG91YmxlXCIsIFwiamF2YS5sYW5nLkRvdWJsZVwiLFxuICAgIFwiamF2YS5tYXRoLkJpZ0RlY2ltYWxcIixcbiAgICBcImphdmEudXRpbC5EYXRlXCIsXG4gICAgXCJqYXZhLmxhbmcuU3RyaW5nXCIsXG4gICAgXCJqYXZhLmxhbmcuQm9vbGVhblwiLFxuICAgIFwiamF2YS5sYW5nLk9iamVjdFwiLFxuICAgIFwiT2JqZWN0XCJcbl1cblxuXG52YXIgT1BTID0gW1xuXG4gICAgLy8gVmFsaWQgZm9yIGFueSBhdHRyaWJ1dGVcbiAgICAvLyBBbHNvIHRoZSBvcGVyYXRvcnMgZm9yIGxvb3AgY29uc3RyYWludHMgKG5vdCB5ZXQgaW1wbGVtZW50ZWQpLlxuICAgIHtcbiAgICBvcDogXCI9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0se1xuICAgIG9wOiBcIiE9XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZVxuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIG51bWVyaWMgYW5kIGRhdGUgYXR0cmlidXRlc1xuICAgIHtcbiAgICBvcDogXCI+XCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVU1FUklDVFlQRVNcbiAgICB9LHtcbiAgICBvcDogXCI+PVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPFwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogTlVNRVJJQ1RZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiPD1cIixcbiAgICBjdHlwZTogXCJ2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IE5VTUVSSUNUWVBFU1xuICAgIH0sXG4gICAgXG4gICAgLy8gVmFsaWQgZm9yIHN0cmluZyBhdHRyaWJ1dGVzXG4gICAge1xuICAgIG9wOiBcIkNPTlRBSU5TXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG5cbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBDT05UQUlOXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiTElLRVwiLFxuICAgIGN0eXBlOiBcInZhbHVlXCIsXG4gICAgdmFsaWRGb3JDbGFzczogZmFsc2UsXG4gICAgdmFsaWRGb3JBdHRyOiB0cnVlLFxuICAgIHZhbGlkRm9yUm9vdDogZmFsc2UsXG4gICAgdmFsaWRUeXBlczogW1wiamF2YS5sYW5nLlN0cmluZ1wiXVxuICAgIH0se1xuICAgIG9wOiBcIk5PVCBMSUtFXCIsXG4gICAgY3R5cGU6IFwidmFsdWVcIixcbiAgICB2YWxpZEZvckNsYXNzOiBmYWxzZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBbXCJqYXZhLmxhbmcuU3RyaW5nXCJdXG4gICAgfSx7XG4gICAgb3A6IFwiT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LHtcbiAgICBvcDogXCJOT05FIE9GXCIsXG4gICAgY3R5cGU6IFwibXVsdGl2YWx1ZVwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IGZhbHNlLFxuICAgIHZhbGlkRm9yQXR0cjogdHJ1ZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlLFxuICAgIHZhbGlkVHlwZXM6IFtcImphdmEubGFuZy5TdHJpbmdcIl1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIG9ubHkgZm9yIExvY2F0aW9uIG5vZGVzXG4gICAge1xuICAgIG9wOiBcIldJVEhJTlwiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJPVkVSTEFQU1wiLFxuICAgIGN0eXBlOiBcInJhbmdlXCJcbiAgICB9LHtcbiAgICBvcDogXCJET0VTIE5PVCBPVkVSTEFQXCIsXG4gICAgY3R5cGU6IFwicmFuZ2VcIlxuICAgIH0se1xuICAgIG9wOiBcIk9VVFNJREVcIixcbiAgICBjdHlwZTogXCJyYW5nZVwiXG4gICAgfSxcbiBcbiAgICAvLyBOVUxMIGNvbnN0cmFpbnRzLiBWYWxpZCBmb3IgYW55IG5vZGUgZXhjZXB0IHJvb3QuXG4gICAge1xuICAgIG9wOiBcIklTIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSx7XG4gICAgb3A6IFwiSVMgTk9UIE5VTExcIixcbiAgICBjdHlwZTogXCJudWxsXCIsXG4gICAgdmFsaWRGb3JDbGFzczogdHJ1ZSxcbiAgICB2YWxpZEZvckF0dHI6IHRydWUsXG4gICAgdmFsaWRGb3JSb290OiBmYWxzZSxcbiAgICB2YWxpZFR5cGVzOiBOVUxMQUJMRVRZUEVTXG4gICAgfSxcbiAgICBcbiAgICAvLyBWYWxpZCBvbmx5IGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgKGkuZS4sIHRoZSByb290LCBvciBhbnkgXG4gICAgLy8gcmVmZXJlbmNlIG9yIGNvbGxlY3Rpb24gbm9kZSkuXG4gICAge1xuICAgIG9wOiBcIkxPT0tVUFwiLFxuICAgIGN0eXBlOiBcImxvb2t1cFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LHtcbiAgICBvcDogXCJJTlwiLFxuICAgIGN0eXBlOiBcImxpc3RcIixcbiAgICB2YWxpZEZvckNsYXNzOiB0cnVlLFxuICAgIHZhbGlkRm9yQXR0cjogZmFsc2UsXG4gICAgdmFsaWRGb3JSb290OiB0cnVlXG4gICAgfSx7XG4gICAgb3A6IFwiTk9UIElOXCIsXG4gICAgY3R5cGU6IFwibGlzdFwiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IHRydWVcbiAgICB9LFxuICAgIFxuICAgIC8vIFZhbGlkIGF0IGFueSBub24tYXR0cmlidXRlIG5vZGUgZXhjZXB0IHRoZSByb290LlxuICAgIHtcbiAgICBvcDogXCJJU0FcIixcbiAgICBjdHlwZTogXCJzdWJjbGFzc1wiLFxuICAgIHZhbGlkRm9yQ2xhc3M6IHRydWUsXG4gICAgdmFsaWRGb3JBdHRyOiBmYWxzZSxcbiAgICB2YWxpZEZvclJvb3Q6IGZhbHNlXG4gICAgfV07XG4vL1xudmFyIE9QSU5ERVggPSBPUFMucmVkdWNlKGZ1bmN0aW9uKHgsbyl7XG4gICAgeFtvLm9wXSA9IG87XG4gICAgcmV0dXJuIHg7XG59LCB7fSk7XG5cbmV4cG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL29wcy5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJsZXQgcyA9IGBcbjNkX3JvdGF0aW9uIGU4NGRcbmFjX3VuaXQgZWIzYlxuYWNjZXNzX2FsYXJtIGUxOTBcbmFjY2Vzc19hbGFybXMgZTE5MVxuYWNjZXNzX3RpbWUgZTE5MlxuYWNjZXNzaWJpbGl0eSBlODRlXG5hY2Nlc3NpYmxlIGU5MTRcbmFjY291bnRfYmFsYW5jZSBlODRmXG5hY2NvdW50X2JhbGFuY2Vfd2FsbGV0IGU4NTBcbmFjY291bnRfYm94IGU4NTFcbmFjY291bnRfY2lyY2xlIGU4NTNcbmFkYiBlNjBlXG5hZGQgZTE0NVxuYWRkX2FfcGhvdG8gZTQzOVxuYWRkX2FsYXJtIGUxOTNcbmFkZF9hbGVydCBlMDAzXG5hZGRfYm94IGUxNDZcbmFkZF9jaXJjbGUgZTE0N1xuYWRkX2NpcmNsZV9vdXRsaW5lIGUxNDhcbmFkZF9sb2NhdGlvbiBlNTY3XG5hZGRfc2hvcHBpbmdfY2FydCBlODU0XG5hZGRfdG9fcGhvdG9zIGUzOWRcbmFkZF90b19xdWV1ZSBlMDVjXG5hZGp1c3QgZTM5ZVxuYWlybGluZV9zZWF0X2ZsYXQgZTYzMFxuYWlybGluZV9zZWF0X2ZsYXRfYW5nbGVkIGU2MzFcbmFpcmxpbmVfc2VhdF9pbmRpdmlkdWFsX3N1aXRlIGU2MzJcbmFpcmxpbmVfc2VhdF9sZWdyb29tX2V4dHJhIGU2MzNcbmFpcmxpbmVfc2VhdF9sZWdyb29tX25vcm1hbCBlNjM0XG5haXJsaW5lX3NlYXRfbGVncm9vbV9yZWR1Y2VkIGU2MzVcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX2V4dHJhIGU2MzZcbmFpcmxpbmVfc2VhdF9yZWNsaW5lX25vcm1hbCBlNjM3XG5haXJwbGFuZW1vZGVfYWN0aXZlIGUxOTVcbmFpcnBsYW5lbW9kZV9pbmFjdGl2ZSBlMTk0XG5haXJwbGF5IGUwNTVcbmFpcnBvcnRfc2h1dHRsZSBlYjNjXG5hbGFybSBlODU1XG5hbGFybV9hZGQgZTg1NlxuYWxhcm1fb2ZmIGU4NTdcbmFsYXJtX29uIGU4NThcbmFsYnVtIGUwMTlcbmFsbF9pbmNsdXNpdmUgZWIzZFxuYWxsX291dCBlOTBiXG5hbmRyb2lkIGU4NTlcbmFubm91bmNlbWVudCBlODVhXG5hcHBzIGU1YzNcbmFyY2hpdmUgZTE0OVxuYXJyb3dfYmFjayBlNWM0XG5hcnJvd19kb3dud2FyZCBlNWRiXG5hcnJvd19kcm9wX2Rvd24gZTVjNVxuYXJyb3dfZHJvcF9kb3duX2NpcmNsZSBlNWM2XG5hcnJvd19kcm9wX3VwIGU1YzdcbmFycm93X2ZvcndhcmQgZTVjOFxuYXJyb3dfdXB3YXJkIGU1ZDhcbmFydF90cmFjayBlMDYwXG5hc3BlY3RfcmF0aW8gZTg1YlxuYXNzZXNzbWVudCBlODVjXG5hc3NpZ25tZW50IGU4NWRcbmFzc2lnbm1lbnRfaW5kIGU4NWVcbmFzc2lnbm1lbnRfbGF0ZSBlODVmXG5hc3NpZ25tZW50X3JldHVybiBlODYwXG5hc3NpZ25tZW50X3JldHVybmVkIGU4NjFcbmFzc2lnbm1lbnRfdHVybmVkX2luIGU4NjJcbmFzc2lzdGFudCBlMzlmXG5hc3Npc3RhbnRfcGhvdG8gZTNhMFxuYXR0YWNoX2ZpbGUgZTIyNlxuYXR0YWNoX21vbmV5IGUyMjdcbmF0dGFjaG1lbnQgZTJiY1xuYXVkaW90cmFjayBlM2ExXG5hdXRvcmVuZXcgZTg2M1xuYXZfdGltZXIgZTAxYlxuYmFja3NwYWNlIGUxNGFcbmJhY2t1cCBlODY0XG5iYXR0ZXJ5X2FsZXJ0IGUxOWNcbmJhdHRlcnlfY2hhcmdpbmdfZnVsbCBlMWEzXG5iYXR0ZXJ5X2Z1bGwgZTFhNFxuYmF0dGVyeV9zdGQgZTFhNVxuYmF0dGVyeV91bmtub3duIGUxYTZcbmJlYWNoX2FjY2VzcyBlYjNlXG5iZWVuaGVyZSBlNTJkXG5ibG9jayBlMTRiXG5ibHVldG9vdGggZTFhN1xuYmx1ZXRvb3RoX2F1ZGlvIGU2MGZcbmJsdWV0b290aF9jb25uZWN0ZWQgZTFhOFxuYmx1ZXRvb3RoX2Rpc2FibGVkIGUxYTlcbmJsdWV0b290aF9zZWFyY2hpbmcgZTFhYVxuYmx1cl9jaXJjdWxhciBlM2EyXG5ibHVyX2xpbmVhciBlM2EzXG5ibHVyX29mZiBlM2E0XG5ibHVyX29uIGUzYTVcbmJvb2sgZTg2NVxuYm9va21hcmsgZTg2NlxuYm9va21hcmtfYm9yZGVyIGU4NjdcbmJvcmRlcl9hbGwgZTIyOFxuYm9yZGVyX2JvdHRvbSBlMjI5XG5ib3JkZXJfY2xlYXIgZTIyYVxuYm9yZGVyX2NvbG9yIGUyMmJcbmJvcmRlcl9ob3Jpem9udGFsIGUyMmNcbmJvcmRlcl9pbm5lciBlMjJkXG5ib3JkZXJfbGVmdCBlMjJlXG5ib3JkZXJfb3V0ZXIgZTIyZlxuYm9yZGVyX3JpZ2h0IGUyMzBcbmJvcmRlcl9zdHlsZSBlMjMxXG5ib3JkZXJfdG9wIGUyMzJcbmJvcmRlcl92ZXJ0aWNhbCBlMjMzXG5icmFuZGluZ193YXRlcm1hcmsgZTA2YlxuYnJpZ2h0bmVzc18xIGUzYTZcbmJyaWdodG5lc3NfMiBlM2E3XG5icmlnaHRuZXNzXzMgZTNhOFxuYnJpZ2h0bmVzc180IGUzYTlcbmJyaWdodG5lc3NfNSBlM2FhXG5icmlnaHRuZXNzXzYgZTNhYlxuYnJpZ2h0bmVzc183IGUzYWNcbmJyaWdodG5lc3NfYXV0byBlMWFiXG5icmlnaHRuZXNzX2hpZ2ggZTFhY1xuYnJpZ2h0bmVzc19sb3cgZTFhZFxuYnJpZ2h0bmVzc19tZWRpdW0gZTFhZVxuYnJva2VuX2ltYWdlIGUzYWRcbmJydXNoIGUzYWVcbmJ1YmJsZV9jaGFydCBlNmRkXG5idWdfcmVwb3J0IGU4NjhcbmJ1aWxkIGU4NjlcbmJ1cnN0X21vZGUgZTQzY1xuYnVzaW5lc3MgZTBhZlxuYnVzaW5lc3NfY2VudGVyIGViM2ZcbmNhY2hlZCBlODZhXG5jYWtlIGU3ZTlcbmNhbGwgZTBiMFxuY2FsbF9lbmQgZTBiMVxuY2FsbF9tYWRlIGUwYjJcbmNhbGxfbWVyZ2UgZTBiM1xuY2FsbF9taXNzZWQgZTBiNFxuY2FsbF9taXNzZWRfb3V0Z29pbmcgZTBlNFxuY2FsbF9yZWNlaXZlZCBlMGI1XG5jYWxsX3NwbGl0IGUwYjZcbmNhbGxfdG9fYWN0aW9uIGUwNmNcbmNhbWVyYSBlM2FmXG5jYW1lcmFfYWx0IGUzYjBcbmNhbWVyYV9lbmhhbmNlIGU4ZmNcbmNhbWVyYV9mcm9udCBlM2IxXG5jYW1lcmFfcmVhciBlM2IyXG5jYW1lcmFfcm9sbCBlM2IzXG5jYW5jZWwgZTVjOVxuY2FyZF9naWZ0Y2FyZCBlOGY2XG5jYXJkX21lbWJlcnNoaXAgZThmN1xuY2FyZF90cmF2ZWwgZThmOFxuY2FzaW5vIGViNDBcbmNhc3QgZTMwN1xuY2FzdF9jb25uZWN0ZWQgZTMwOFxuY2VudGVyX2ZvY3VzX3N0cm9uZyBlM2I0XG5jZW50ZXJfZm9jdXNfd2VhayBlM2I1XG5jaGFuZ2VfaGlzdG9yeSBlODZiXG5jaGF0IGUwYjdcbmNoYXRfYnViYmxlIGUwY2FcbmNoYXRfYnViYmxlX291dGxpbmUgZTBjYlxuY2hlY2sgZTVjYVxuY2hlY2tfYm94IGU4MzRcbmNoZWNrX2JveF9vdXRsaW5lX2JsYW5rIGU4MzVcbmNoZWNrX2NpcmNsZSBlODZjXG5jaGV2cm9uX2xlZnQgZTVjYlxuY2hldnJvbl9yaWdodCBlNWNjXG5jaGlsZF9jYXJlIGViNDFcbmNoaWxkX2ZyaWVuZGx5IGViNDJcbmNocm9tZV9yZWFkZXJfbW9kZSBlODZkXG5jbGFzcyBlODZlXG5jbGVhciBlMTRjXG5jbGVhcl9hbGwgZTBiOFxuY2xvc2UgZTVjZFxuY2xvc2VkX2NhcHRpb24gZTAxY1xuY2xvdWQgZTJiZFxuY2xvdWRfY2lyY2xlIGUyYmVcbmNsb3VkX2RvbmUgZTJiZlxuY2xvdWRfZG93bmxvYWQgZTJjMFxuY2xvdWRfb2ZmIGUyYzFcbmNsb3VkX3F1ZXVlIGUyYzJcbmNsb3VkX3VwbG9hZCBlMmMzXG5jb2RlIGU4NmZcbmNvbGxlY3Rpb25zIGUzYjZcbmNvbGxlY3Rpb25zX2Jvb2ttYXJrIGU0MzFcbmNvbG9yX2xlbnMgZTNiN1xuY29sb3JpemUgZTNiOFxuY29tbWVudCBlMGI5XG5jb21wYXJlIGUzYjlcbmNvbXBhcmVfYXJyb3dzIGU5MTVcbmNvbXB1dGVyIGUzMGFcbmNvbmZpcm1hdGlvbl9udW1iZXIgZTYzOFxuY29udGFjdF9tYWlsIGUwZDBcbmNvbnRhY3RfcGhvbmUgZTBjZlxuY29udGFjdHMgZTBiYVxuY29udGVudF9jb3B5IGUxNGRcbmNvbnRlbnRfY3V0IGUxNGVcbmNvbnRlbnRfcGFzdGUgZTE0ZlxuY29udHJvbF9wb2ludCBlM2JhXG5jb250cm9sX3BvaW50X2R1cGxpY2F0ZSBlM2JiXG5jb3B5cmlnaHQgZTkwY1xuY3JlYXRlIGUxNTBcbmNyZWF0ZV9uZXdfZm9sZGVyIGUyY2NcbmNyZWRpdF9jYXJkIGU4NzBcbmNyb3AgZTNiZVxuY3JvcF8xNl85IGUzYmNcbmNyb3BfM18yIGUzYmRcbmNyb3BfNV80IGUzYmZcbmNyb3BfN181IGUzYzBcbmNyb3BfZGluIGUzYzFcbmNyb3BfZnJlZSBlM2MyXG5jcm9wX2xhbmRzY2FwZSBlM2MzXG5jcm9wX29yaWdpbmFsIGUzYzRcbmNyb3BfcG9ydHJhaXQgZTNjNVxuY3JvcF9yb3RhdGUgZTQzN1xuY3JvcF9zcXVhcmUgZTNjNlxuZGFzaGJvYXJkIGU4NzFcbmRhdGFfdXNhZ2UgZTFhZlxuZGF0ZV9yYW5nZSBlOTE2XG5kZWhhemUgZTNjN1xuZGVsZXRlIGU4NzJcbmRlbGV0ZV9mb3JldmVyIGU5MmJcbmRlbGV0ZV9zd2VlcCBlMTZjXG5kZXNjcmlwdGlvbiBlODczXG5kZXNrdG9wX21hYyBlMzBiXG5kZXNrdG9wX3dpbmRvd3MgZTMwY1xuZGV0YWlscyBlM2M4XG5kZXZlbG9wZXJfYm9hcmQgZTMwZFxuZGV2ZWxvcGVyX21vZGUgZTFiMFxuZGV2aWNlX2h1YiBlMzM1XG5kZXZpY2VzIGUxYjFcbmRldmljZXNfb3RoZXIgZTMzN1xuZGlhbGVyX3NpcCBlMGJiXG5kaWFscGFkIGUwYmNcbmRpcmVjdGlvbnMgZTUyZVxuZGlyZWN0aW9uc19iaWtlIGU1MmZcbmRpcmVjdGlvbnNfYm9hdCBlNTMyXG5kaXJlY3Rpb25zX2J1cyBlNTMwXG5kaXJlY3Rpb25zX2NhciBlNTMxXG5kaXJlY3Rpb25zX3JhaWx3YXkgZTUzNFxuZGlyZWN0aW9uc19ydW4gZTU2NlxuZGlyZWN0aW9uc19zdWJ3YXkgZTUzM1xuZGlyZWN0aW9uc190cmFuc2l0IGU1MzVcbmRpcmVjdGlvbnNfd2FsayBlNTM2XG5kaXNjX2Z1bGwgZTYxMFxuZG5zIGU4NzVcbmRvX25vdF9kaXN0dXJiIGU2MTJcbmRvX25vdF9kaXN0dXJiX2FsdCBlNjExXG5kb19ub3RfZGlzdHVyYl9vZmYgZTY0M1xuZG9fbm90X2Rpc3R1cmJfb24gZTY0NFxuZG9jayBlMzBlXG5kb21haW4gZTdlZVxuZG9uZSBlODc2XG5kb25lX2FsbCBlODc3XG5kb251dF9sYXJnZSBlOTE3XG5kb251dF9zbWFsbCBlOTE4XG5kcmFmdHMgZTE1MVxuZHJhZ19oYW5kbGUgZTI1ZFxuZHJpdmVfZXRhIGU2MTNcbmR2ciBlMWIyXG5lZGl0IGUzYzlcbmVkaXRfbG9jYXRpb24gZTU2OFxuZWplY3QgZThmYlxuZW1haWwgZTBiZVxuZW5oYW5jZWRfZW5jcnlwdGlvbiBlNjNmXG5lcXVhbGl6ZXIgZTAxZFxuZXJyb3IgZTAwMFxuZXJyb3Jfb3V0bGluZSBlMDAxXG5ldXJvX3N5bWJvbCBlOTI2XG5ldl9zdGF0aW9uIGU1NmRcbmV2ZW50IGU4NzhcbmV2ZW50X2F2YWlsYWJsZSBlNjE0XG5ldmVudF9idXN5IGU2MTVcbmV2ZW50X25vdGUgZTYxNlxuZXZlbnRfc2VhdCBlOTAzXG5leGl0X3RvX2FwcCBlODc5XG5leHBhbmRfbGVzcyBlNWNlXG5leHBhbmRfbW9yZSBlNWNmXG5leHBsaWNpdCBlMDFlXG5leHBsb3JlIGU4N2FcbmV4cG9zdXJlIGUzY2FcbmV4cG9zdXJlX25lZ18xIGUzY2JcbmV4cG9zdXJlX25lZ18yIGUzY2NcbmV4cG9zdXJlX3BsdXNfMSBlM2NkXG5leHBvc3VyZV9wbHVzXzIgZTNjZVxuZXhwb3N1cmVfemVybyBlM2NmXG5leHRlbnNpb24gZTg3YlxuZmFjZSBlODdjXG5mYXN0X2ZvcndhcmQgZTAxZlxuZmFzdF9yZXdpbmQgZTAyMFxuZmF2b3JpdGUgZTg3ZFxuZmF2b3JpdGVfYm9yZGVyIGU4N2VcbmZlYXR1cmVkX3BsYXlfbGlzdCBlMDZkXG5mZWF0dXJlZF92aWRlbyBlMDZlXG5mZWVkYmFjayBlODdmXG5maWJlcl9kdnIgZTA1ZFxuZmliZXJfbWFudWFsX3JlY29yZCBlMDYxXG5maWJlcl9uZXcgZTA1ZVxuZmliZXJfcGluIGUwNmFcbmZpYmVyX3NtYXJ0X3JlY29yZCBlMDYyXG5maWxlX2Rvd25sb2FkIGUyYzRcbmZpbGVfdXBsb2FkIGUyYzZcbmZpbHRlciBlM2QzXG5maWx0ZXJfMSBlM2QwXG5maWx0ZXJfMiBlM2QxXG5maWx0ZXJfMyBlM2QyXG5maWx0ZXJfNCBlM2Q0XG5maWx0ZXJfNSBlM2Q1XG5maWx0ZXJfNiBlM2Q2XG5maWx0ZXJfNyBlM2Q3XG5maWx0ZXJfOCBlM2Q4XG5maWx0ZXJfOSBlM2Q5XG5maWx0ZXJfOV9wbHVzIGUzZGFcbmZpbHRlcl9iX2FuZF93IGUzZGJcbmZpbHRlcl9jZW50ZXJfZm9jdXMgZTNkY1xuZmlsdGVyX2RyYW1hIGUzZGRcbmZpbHRlcl9mcmFtZXMgZTNkZVxuZmlsdGVyX2hkciBlM2RmXG5maWx0ZXJfbGlzdCBlMTUyXG5maWx0ZXJfbm9uZSBlM2UwXG5maWx0ZXJfdGlsdF9zaGlmdCBlM2UyXG5maWx0ZXJfdmludGFnZSBlM2UzXG5maW5kX2luX3BhZ2UgZTg4MFxuZmluZF9yZXBsYWNlIGU4ODFcbmZpbmdlcnByaW50IGU5MGRcbmZpcnN0X3BhZ2UgZTVkY1xuZml0bmVzc19jZW50ZXIgZWI0M1xuZmxhZyBlMTUzXG5mbGFyZSBlM2U0XG5mbGFzaF9hdXRvIGUzZTVcbmZsYXNoX29mZiBlM2U2XG5mbGFzaF9vbiBlM2U3XG5mbGlnaHQgZTUzOVxuZmxpZ2h0X2xhbmQgZTkwNFxuZmxpZ2h0X3Rha2VvZmYgZTkwNVxuZmxpcCBlM2U4XG5mbGlwX3RvX2JhY2sgZTg4MlxuZmxpcF90b19mcm9udCBlODgzXG5mb2xkZXIgZTJjN1xuZm9sZGVyX29wZW4gZTJjOFxuZm9sZGVyX3NoYXJlZCBlMmM5XG5mb2xkZXJfc3BlY2lhbCBlNjE3XG5mb250X2Rvd25sb2FkIGUxNjdcbmZvcm1hdF9hbGlnbl9jZW50ZXIgZTIzNFxuZm9ybWF0X2FsaWduX2p1c3RpZnkgZTIzNVxuZm9ybWF0X2FsaWduX2xlZnQgZTIzNlxuZm9ybWF0X2FsaWduX3JpZ2h0IGUyMzdcbmZvcm1hdF9ib2xkIGUyMzhcbmZvcm1hdF9jbGVhciBlMjM5XG5mb3JtYXRfY29sb3JfZmlsbCBlMjNhXG5mb3JtYXRfY29sb3JfcmVzZXQgZTIzYlxuZm9ybWF0X2NvbG9yX3RleHQgZTIzY1xuZm9ybWF0X2luZGVudF9kZWNyZWFzZSBlMjNkXG5mb3JtYXRfaW5kZW50X2luY3JlYXNlIGUyM2VcbmZvcm1hdF9pdGFsaWMgZTIzZlxuZm9ybWF0X2xpbmVfc3BhY2luZyBlMjQwXG5mb3JtYXRfbGlzdF9idWxsZXRlZCBlMjQxXG5mb3JtYXRfbGlzdF9udW1iZXJlZCBlMjQyXG5mb3JtYXRfcGFpbnQgZTI0M1xuZm9ybWF0X3F1b3RlIGUyNDRcbmZvcm1hdF9zaGFwZXMgZTI1ZVxuZm9ybWF0X3NpemUgZTI0NVxuZm9ybWF0X3N0cmlrZXRocm91Z2ggZTI0NlxuZm9ybWF0X3RleHRkaXJlY3Rpb25fbF90b19yIGUyNDdcbmZvcm1hdF90ZXh0ZGlyZWN0aW9uX3JfdG9fbCBlMjQ4XG5mb3JtYXRfdW5kZXJsaW5lZCBlMjQ5XG5mb3J1bSBlMGJmXG5mb3J3YXJkIGUxNTRcbmZvcndhcmRfMTAgZTA1NlxuZm9yd2FyZF8zMCBlMDU3XG5mb3J3YXJkXzUgZTA1OFxuZnJlZV9icmVha2Zhc3QgZWI0NFxuZnVsbHNjcmVlbiBlNWQwXG5mdWxsc2NyZWVuX2V4aXQgZTVkMVxuZnVuY3Rpb25zIGUyNGFcbmdfdHJhbnNsYXRlIGU5MjdcbmdhbWVwYWQgZTMwZlxuZ2FtZXMgZTAyMVxuZ2F2ZWwgZTkwZVxuZ2VzdHVyZSBlMTU1XG5nZXRfYXBwIGU4ODRcbmdpZiBlOTA4XG5nb2xmX2NvdXJzZSBlYjQ1XG5ncHNfZml4ZWQgZTFiM1xuZ3BzX25vdF9maXhlZCBlMWI0XG5ncHNfb2ZmIGUxYjVcbmdyYWRlIGU4ODVcbmdyYWRpZW50IGUzZTlcbmdyYWluIGUzZWFcbmdyYXBoaWNfZXEgZTFiOFxuZ3JpZF9vZmYgZTNlYlxuZ3JpZF9vbiBlM2VjXG5ncm91cCBlN2VmXG5ncm91cF9hZGQgZTdmMFxuZ3JvdXBfd29yayBlODg2XG5oZCBlMDUyXG5oZHJfb2ZmIGUzZWRcbmhkcl9vbiBlM2VlXG5oZHJfc3Ryb25nIGUzZjFcbmhkcl93ZWFrIGUzZjJcbmhlYWRzZXQgZTMxMFxuaGVhZHNldF9taWMgZTMxMVxuaGVhbGluZyBlM2YzXG5oZWFyaW5nIGUwMjNcbmhlbHAgZTg4N1xuaGVscF9vdXRsaW5lIGU4ZmRcbmhpZ2hfcXVhbGl0eSBlMDI0XG5oaWdobGlnaHQgZTI1ZlxuaGlnaGxpZ2h0X29mZiBlODg4XG5oaXN0b3J5IGU4ODlcbmhvbWUgZTg4YVxuaG90X3R1YiBlYjQ2XG5ob3RlbCBlNTNhXG5ob3VyZ2xhc3NfZW1wdHkgZTg4YlxuaG91cmdsYXNzX2Z1bGwgZTg4Y1xuaHR0cCBlOTAyXG5odHRwcyBlODhkXG5pbWFnZSBlM2Y0XG5pbWFnZV9hc3BlY3RfcmF0aW8gZTNmNVxuaW1wb3J0X2NvbnRhY3RzIGUwZTBcbmltcG9ydF9leHBvcnQgZTBjM1xuaW1wb3J0YW50X2RldmljZXMgZTkxMlxuaW5ib3ggZTE1NlxuaW5kZXRlcm1pbmF0ZV9jaGVja19ib3ggZTkwOVxuaW5mbyBlODhlXG5pbmZvX291dGxpbmUgZTg4ZlxuaW5wdXQgZTg5MFxuaW5zZXJ0X2NoYXJ0IGUyNGJcbmluc2VydF9jb21tZW50IGUyNGNcbmluc2VydF9kcml2ZV9maWxlIGUyNGRcbmluc2VydF9lbW90aWNvbiBlMjRlXG5pbnNlcnRfaW52aXRhdGlvbiBlMjRmXG5pbnNlcnRfbGluayBlMjUwXG5pbnNlcnRfcGhvdG8gZTI1MVxuaW52ZXJ0X2NvbG9ycyBlODkxXG5pbnZlcnRfY29sb3JzX29mZiBlMGM0XG5pc28gZTNmNlxua2V5Ym9hcmQgZTMxMlxua2V5Ym9hcmRfYXJyb3dfZG93biBlMzEzXG5rZXlib2FyZF9hcnJvd19sZWZ0IGUzMTRcbmtleWJvYXJkX2Fycm93X3JpZ2h0IGUzMTVcbmtleWJvYXJkX2Fycm93X3VwIGUzMTZcbmtleWJvYXJkX2JhY2tzcGFjZSBlMzE3XG5rZXlib2FyZF9jYXBzbG9jayBlMzE4XG5rZXlib2FyZF9oaWRlIGUzMWFcbmtleWJvYXJkX3JldHVybiBlMzFiXG5rZXlib2FyZF90YWIgZTMxY1xua2V5Ym9hcmRfdm9pY2UgZTMxZFxua2l0Y2hlbiBlYjQ3XG5sYWJlbCBlODkyXG5sYWJlbF9vdXRsaW5lIGU4OTNcbmxhbmRzY2FwZSBlM2Y3XG5sYW5ndWFnZSBlODk0XG5sYXB0b3AgZTMxZVxubGFwdG9wX2Nocm9tZWJvb2sgZTMxZlxubGFwdG9wX21hYyBlMzIwXG5sYXB0b3Bfd2luZG93cyBlMzIxXG5sYXN0X3BhZ2UgZTVkZFxubGF1bmNoIGU4OTVcbmxheWVycyBlNTNiXG5sYXllcnNfY2xlYXIgZTUzY1xubGVha19hZGQgZTNmOFxubGVha19yZW1vdmUgZTNmOVxubGVucyBlM2ZhXG5saWJyYXJ5X2FkZCBlMDJlXG5saWJyYXJ5X2Jvb2tzIGUwMmZcbmxpYnJhcnlfbXVzaWMgZTAzMFxubGlnaHRidWxiX291dGxpbmUgZTkwZlxubGluZV9zdHlsZSBlOTE5XG5saW5lX3dlaWdodCBlOTFhXG5saW5lYXJfc2NhbGUgZTI2MFxubGluayBlMTU3XG5saW5rZWRfY2FtZXJhIGU0Mzhcbmxpc3QgZTg5NlxubGl2ZV9oZWxwIGUwYzZcbmxpdmVfdHYgZTYzOVxubG9jYWxfYWN0aXZpdHkgZTUzZlxubG9jYWxfYWlycG9ydCBlNTNkXG5sb2NhbF9hdG0gZTUzZVxubG9jYWxfYmFyIGU1NDBcbmxvY2FsX2NhZmUgZTU0MVxubG9jYWxfY2FyX3dhc2ggZTU0MlxubG9jYWxfY29udmVuaWVuY2Vfc3RvcmUgZTU0M1xubG9jYWxfZGluaW5nIGU1NTZcbmxvY2FsX2RyaW5rIGU1NDRcbmxvY2FsX2Zsb3Jpc3QgZTU0NVxubG9jYWxfZ2FzX3N0YXRpb24gZTU0NlxubG9jYWxfZ3JvY2VyeV9zdG9yZSBlNTQ3XG5sb2NhbF9ob3NwaXRhbCBlNTQ4XG5sb2NhbF9ob3RlbCBlNTQ5XG5sb2NhbF9sYXVuZHJ5X3NlcnZpY2UgZTU0YVxubG9jYWxfbGlicmFyeSBlNTRiXG5sb2NhbF9tYWxsIGU1NGNcbmxvY2FsX21vdmllcyBlNTRkXG5sb2NhbF9vZmZlciBlNTRlXG5sb2NhbF9wYXJraW5nIGU1NGZcbmxvY2FsX3BoYXJtYWN5IGU1NTBcbmxvY2FsX3Bob25lIGU1NTFcbmxvY2FsX3BpenphIGU1NTJcbmxvY2FsX3BsYXkgZTU1M1xubG9jYWxfcG9zdF9vZmZpY2UgZTU1NFxubG9jYWxfcHJpbnRzaG9wIGU1NTVcbmxvY2FsX3NlZSBlNTU3XG5sb2NhbF9zaGlwcGluZyBlNTU4XG5sb2NhbF90YXhpIGU1NTlcbmxvY2F0aW9uX2NpdHkgZTdmMVxubG9jYXRpb25fZGlzYWJsZWQgZTFiNlxubG9jYXRpb25fb2ZmIGUwYzdcbmxvY2F0aW9uX29uIGUwYzhcbmxvY2F0aW9uX3NlYXJjaGluZyBlMWI3XG5sb2NrIGU4OTdcbmxvY2tfb3BlbiBlODk4XG5sb2NrX291dGxpbmUgZTg5OVxubG9va3MgZTNmY1xubG9va3NfMyBlM2ZiXG5sb29rc180IGUzZmRcbmxvb2tzXzUgZTNmZVxubG9va3NfNiBlM2ZmXG5sb29rc19vbmUgZTQwMFxubG9va3NfdHdvIGU0MDFcbmxvb3AgZTAyOFxubG91cGUgZTQwMlxubG93X3ByaW9yaXR5IGUxNmRcbmxveWFsdHkgZTg5YVxubWFpbCBlMTU4XG5tYWlsX291dGxpbmUgZTBlMVxubWFwIGU1NWJcbm1hcmt1bnJlYWQgZTE1OVxubWFya3VucmVhZF9tYWlsYm94IGU4OWJcbm1lbW9yeSBlMzIyXG5tZW51IGU1ZDJcbm1lcmdlX3R5cGUgZTI1MlxubWVzc2FnZSBlMGM5XG5taWMgZTAyOVxubWljX25vbmUgZTAyYVxubWljX29mZiBlMDJiXG5tbXMgZTYxOFxubW9kZV9jb21tZW50IGUyNTNcbm1vZGVfZWRpdCBlMjU0XG5tb25ldGl6YXRpb25fb24gZTI2M1xubW9uZXlfb2ZmIGUyNWNcbm1vbm9jaHJvbWVfcGhvdG9zIGU0MDNcbm1vb2QgZTdmMlxubW9vZF9iYWQgZTdmM1xubW9yZSBlNjE5XG5tb3JlX2hvcml6IGU1ZDNcbm1vcmVfdmVydCBlNWQ0XG5tb3RvcmN5Y2xlIGU5MWJcbm1vdXNlIGUzMjNcbm1vdmVfdG9faW5ib3ggZTE2OFxubW92aWUgZTAyY1xubW92aWVfY3JlYXRpb24gZTQwNFxubW92aWVfZmlsdGVyIGU0M2Fcbm11bHRpbGluZV9jaGFydCBlNmRmXG5tdXNpY19ub3RlIGU0MDVcbm11c2ljX3ZpZGVvIGUwNjNcbm15X2xvY2F0aW9uIGU1NWNcbm5hdHVyZSBlNDA2XG5uYXR1cmVfcGVvcGxlIGU0MDdcbm5hdmlnYXRlX2JlZm9yZSBlNDA4XG5uYXZpZ2F0ZV9uZXh0IGU0MDlcbm5hdmlnYXRpb24gZTU1ZFxubmVhcl9tZSBlNTY5XG5uZXR3b3JrX2NlbGwgZTFiOVxubmV0d29ya19jaGVjayBlNjQwXG5uZXR3b3JrX2xvY2tlZCBlNjFhXG5uZXR3b3JrX3dpZmkgZTFiYVxubmV3X3JlbGVhc2VzIGUwMzFcbm5leHRfd2VlayBlMTZhXG5uZmMgZTFiYlxubm9fZW5jcnlwdGlvbiBlNjQxXG5ub19zaW0gZTBjY1xubm90X2ludGVyZXN0ZWQgZTAzM1xubm90ZSBlMDZmXG5ub3RlX2FkZCBlODljXG5ub3RpZmljYXRpb25zIGU3ZjRcbm5vdGlmaWNhdGlvbnNfYWN0aXZlIGU3Zjdcbm5vdGlmaWNhdGlvbnNfbm9uZSBlN2Y1XG5ub3RpZmljYXRpb25zX29mZiBlN2Y2XG5ub3RpZmljYXRpb25zX3BhdXNlZCBlN2Y4XG5vZmZsaW5lX3BpbiBlOTBhXG5vbmRlbWFuZF92aWRlbyBlNjNhXG5vcGFjaXR5IGU5MWNcbm9wZW5faW5fYnJvd3NlciBlODlkXG5vcGVuX2luX25ldyBlODllXG5vcGVuX3dpdGggZTg5ZlxucGFnZXMgZTdmOVxucGFnZXZpZXcgZThhMFxucGFsZXR0ZSBlNDBhXG5wYW5fdG9vbCBlOTI1XG5wYW5vcmFtYSBlNDBiXG5wYW5vcmFtYV9maXNoX2V5ZSBlNDBjXG5wYW5vcmFtYV9ob3Jpem9udGFsIGU0MGRcbnBhbm9yYW1hX3ZlcnRpY2FsIGU0MGVcbnBhbm9yYW1hX3dpZGVfYW5nbGUgZTQwZlxucGFydHlfbW9kZSBlN2ZhXG5wYXVzZSBlMDM0XG5wYXVzZV9jaXJjbGVfZmlsbGVkIGUwMzVcbnBhdXNlX2NpcmNsZV9vdXRsaW5lIGUwMzZcbnBheW1lbnQgZThhMVxucGVvcGxlIGU3ZmJcbnBlb3BsZV9vdXRsaW5lIGU3ZmNcbnBlcm1fY2FtZXJhX21pYyBlOGEyXG5wZXJtX2NvbnRhY3RfY2FsZW5kYXIgZThhM1xucGVybV9kYXRhX3NldHRpbmcgZThhNFxucGVybV9kZXZpY2VfaW5mb3JtYXRpb24gZThhNVxucGVybV9pZGVudGl0eSBlOGE2XG5wZXJtX21lZGlhIGU4YTdcbnBlcm1fcGhvbmVfbXNnIGU4YThcbnBlcm1fc2Nhbl93aWZpIGU4YTlcbnBlcnNvbiBlN2ZkXG5wZXJzb25fYWRkIGU3ZmVcbnBlcnNvbl9vdXRsaW5lIGU3ZmZcbnBlcnNvbl9waW4gZTU1YVxucGVyc29uX3Bpbl9jaXJjbGUgZTU2YVxucGVyc29uYWxfdmlkZW8gZTYzYlxucGV0cyBlOTFkXG5waG9uZSBlMGNkXG5waG9uZV9hbmRyb2lkIGUzMjRcbnBob25lX2JsdWV0b290aF9zcGVha2VyIGU2MWJcbnBob25lX2ZvcndhcmRlZCBlNjFjXG5waG9uZV9pbl90YWxrIGU2MWRcbnBob25lX2lwaG9uZSBlMzI1XG5waG9uZV9sb2NrZWQgZTYxZVxucGhvbmVfbWlzc2VkIGU2MWZcbnBob25lX3BhdXNlZCBlNjIwXG5waG9uZWxpbmsgZTMyNlxucGhvbmVsaW5rX2VyYXNlIGUwZGJcbnBob25lbGlua19sb2NrIGUwZGNcbnBob25lbGlua19vZmYgZTMyN1xucGhvbmVsaW5rX3JpbmcgZTBkZFxucGhvbmVsaW5rX3NldHVwIGUwZGVcbnBob3RvIGU0MTBcbnBob3RvX2FsYnVtIGU0MTFcbnBob3RvX2NhbWVyYSBlNDEyXG5waG90b19maWx0ZXIgZTQzYlxucGhvdG9fbGlicmFyeSBlNDEzXG5waG90b19zaXplX3NlbGVjdF9hY3R1YWwgZTQzMlxucGhvdG9fc2l6ZV9zZWxlY3RfbGFyZ2UgZTQzM1xucGhvdG9fc2l6ZV9zZWxlY3Rfc21hbGwgZTQzNFxucGljdHVyZV9hc19wZGYgZTQxNVxucGljdHVyZV9pbl9waWN0dXJlIGU4YWFcbnBpY3R1cmVfaW5fcGljdHVyZV9hbHQgZTkxMVxucGllX2NoYXJ0IGU2YzRcbnBpZV9jaGFydF9vdXRsaW5lZCBlNmM1XG5waW5fZHJvcCBlNTVlXG5wbGFjZSBlNTVmXG5wbGF5X2Fycm93IGUwMzdcbnBsYXlfY2lyY2xlX2ZpbGxlZCBlMDM4XG5wbGF5X2NpcmNsZV9vdXRsaW5lIGUwMzlcbnBsYXlfZm9yX3dvcmsgZTkwNlxucGxheWxpc3RfYWRkIGUwM2JcbnBsYXlsaXN0X2FkZF9jaGVjayBlMDY1XG5wbGF5bGlzdF9wbGF5IGUwNWZcbnBsdXNfb25lIGU4MDBcbnBvbGwgZTgwMVxucG9seW1lciBlOGFiXG5wb29sIGViNDhcbnBvcnRhYmxlX3dpZmlfb2ZmIGUwY2VcbnBvcnRyYWl0IGU0MTZcbnBvd2VyIGU2M2NcbnBvd2VyX2lucHV0IGUzMzZcbnBvd2VyX3NldHRpbmdzX25ldyBlOGFjXG5wcmVnbmFudF93b21hbiBlOTFlXG5wcmVzZW50X3RvX2FsbCBlMGRmXG5wcmludCBlOGFkXG5wcmlvcml0eV9oaWdoIGU2NDVcbnB1YmxpYyBlODBiXG5wdWJsaXNoIGUyNTVcbnF1ZXJ5X2J1aWxkZXIgZThhZVxucXVlc3Rpb25fYW5zd2VyIGU4YWZcbnF1ZXVlIGUwM2NcbnF1ZXVlX211c2ljIGUwM2RcbnF1ZXVlX3BsYXlfbmV4dCBlMDY2XG5yYWRpbyBlMDNlXG5yYWRpb19idXR0b25fY2hlY2tlZCBlODM3XG5yYWRpb19idXR0b25fdW5jaGVja2VkIGU4MzZcbnJhdGVfcmV2aWV3IGU1NjBcbnJlY2VpcHQgZThiMFxucmVjZW50X2FjdG9ycyBlMDNmXG5yZWNvcmRfdm9pY2Vfb3ZlciBlOTFmXG5yZWRlZW0gZThiMVxucmVkbyBlMTVhXG5yZWZyZXNoIGU1ZDVcbnJlbW92ZSBlMTViXG5yZW1vdmVfY2lyY2xlIGUxNWNcbnJlbW92ZV9jaXJjbGVfb3V0bGluZSBlMTVkXG5yZW1vdmVfZnJvbV9xdWV1ZSBlMDY3XG5yZW1vdmVfcmVkX2V5ZSBlNDE3XG5yZW1vdmVfc2hvcHBpbmdfY2FydCBlOTI4XG5yZW9yZGVyIGU4ZmVcbnJlcGVhdCBlMDQwXG5yZXBlYXRfb25lIGUwNDFcbnJlcGxheSBlMDQyXG5yZXBsYXlfMTAgZTA1OVxucmVwbGF5XzMwIGUwNWFcbnJlcGxheV81IGUwNWJcbnJlcGx5IGUxNWVcbnJlcGx5X2FsbCBlMTVmXG5yZXBvcnQgZTE2MFxucmVwb3J0X3Byb2JsZW0gZThiMlxucmVzdGF1cmFudCBlNTZjXG5yZXN0YXVyYW50X21lbnUgZTU2MVxucmVzdG9yZSBlOGIzXG5yZXN0b3JlX3BhZ2UgZTkyOVxucmluZ192b2x1bWUgZTBkMVxucm9vbSBlOGI0XG5yb29tX3NlcnZpY2UgZWI0OVxucm90YXRlXzkwX2RlZ3JlZXNfY2N3IGU0MThcbnJvdGF0ZV9sZWZ0IGU0MTlcbnJvdGF0ZV9yaWdodCBlNDFhXG5yb3VuZGVkX2Nvcm5lciBlOTIwXG5yb3V0ZXIgZTMyOFxucm93aW5nIGU5MjFcbnJzc19mZWVkIGUwZTVcbnJ2X2hvb2t1cCBlNjQyXG5zYXRlbGxpdGUgZTU2Mlxuc2F2ZSBlMTYxXG5zY2FubmVyIGUzMjlcbnNjaGVkdWxlIGU4YjVcbnNjaG9vbCBlODBjXG5zY3JlZW5fbG9ja19sYW5kc2NhcGUgZTFiZVxuc2NyZWVuX2xvY2tfcG9ydHJhaXQgZTFiZlxuc2NyZWVuX2xvY2tfcm90YXRpb24gZTFjMFxuc2NyZWVuX3JvdGF0aW9uIGUxYzFcbnNjcmVlbl9zaGFyZSBlMGUyXG5zZF9jYXJkIGU2MjNcbnNkX3N0b3JhZ2UgZTFjMlxuc2VhcmNoIGU4YjZcbnNlY3VyaXR5IGUzMmFcbnNlbGVjdF9hbGwgZTE2Mlxuc2VuZCBlMTYzXG5zZW50aW1lbnRfZGlzc2F0aXNmaWVkIGU4MTFcbnNlbnRpbWVudF9uZXV0cmFsIGU4MTJcbnNlbnRpbWVudF9zYXRpc2ZpZWQgZTgxM1xuc2VudGltZW50X3ZlcnlfZGlzc2F0aXNmaWVkIGU4MTRcbnNlbnRpbWVudF92ZXJ5X3NhdGlzZmllZCBlODE1XG5zZXR0aW5ncyBlOGI4XG5zZXR0aW5nc19hcHBsaWNhdGlvbnMgZThiOVxuc2V0dGluZ3NfYmFja3VwX3Jlc3RvcmUgZThiYVxuc2V0dGluZ3NfYmx1ZXRvb3RoIGU4YmJcbnNldHRpbmdzX2JyaWdodG5lc3MgZThiZFxuc2V0dGluZ3NfY2VsbCBlOGJjXG5zZXR0aW5nc19ldGhlcm5ldCBlOGJlXG5zZXR0aW5nc19pbnB1dF9hbnRlbm5hIGU4YmZcbnNldHRpbmdzX2lucHV0X2NvbXBvbmVudCBlOGMwXG5zZXR0aW5nc19pbnB1dF9jb21wb3NpdGUgZThjMVxuc2V0dGluZ3NfaW5wdXRfaGRtaSBlOGMyXG5zZXR0aW5nc19pbnB1dF9zdmlkZW8gZThjM1xuc2V0dGluZ3Nfb3ZlcnNjYW4gZThjNFxuc2V0dGluZ3NfcGhvbmUgZThjNVxuc2V0dGluZ3NfcG93ZXIgZThjNlxuc2V0dGluZ3NfcmVtb3RlIGU4YzdcbnNldHRpbmdzX3N5c3RlbV9kYXlkcmVhbSBlMWMzXG5zZXR0aW5nc192b2ljZSBlOGM4XG5zaGFyZSBlODBkXG5zaG9wIGU4YzlcbnNob3BfdHdvIGU4Y2FcbnNob3BwaW5nX2Jhc2tldCBlOGNiXG5zaG9wcGluZ19jYXJ0IGU4Y2NcbnNob3J0X3RleHQgZTI2MVxuc2hvd19jaGFydCBlNmUxXG5zaHVmZmxlIGUwNDNcbnNpZ25hbF9jZWxsdWxhcl80X2JhciBlMWM4XG5zaWduYWxfY2VsbHVsYXJfY29ubmVjdGVkX25vX2ludGVybmV0XzRfYmFyIGUxY2RcbnNpZ25hbF9jZWxsdWxhcl9ub19zaW0gZTFjZVxuc2lnbmFsX2NlbGx1bGFyX251bGwgZTFjZlxuc2lnbmFsX2NlbGx1bGFyX29mZiBlMWQwXG5zaWduYWxfd2lmaV80X2JhciBlMWQ4XG5zaWduYWxfd2lmaV80X2Jhcl9sb2NrIGUxZDlcbnNpZ25hbF93aWZpX29mZiBlMWRhXG5zaW1fY2FyZCBlMzJiXG5zaW1fY2FyZF9hbGVydCBlNjI0XG5za2lwX25leHQgZTA0NFxuc2tpcF9wcmV2aW91cyBlMDQ1XG5zbGlkZXNob3cgZTQxYlxuc2xvd19tb3Rpb25fdmlkZW8gZTA2OFxuc21hcnRwaG9uZSBlMzJjXG5zbW9rZV9mcmVlIGViNGFcbnNtb2tpbmdfcm9vbXMgZWI0Ylxuc21zIGU2MjVcbnNtc19mYWlsZWQgZTYyNlxuc25vb3plIGUwNDZcbnNvcnQgZTE2NFxuc29ydF9ieV9hbHBoYSBlMDUzXG5zcGEgZWI0Y1xuc3BhY2VfYmFyIGUyNTZcbnNwZWFrZXIgZTMyZFxuc3BlYWtlcl9ncm91cCBlMzJlXG5zcGVha2VyX25vdGVzIGU4Y2RcbnNwZWFrZXJfbm90ZXNfb2ZmIGU5MmFcbnNwZWFrZXJfcGhvbmUgZTBkMlxuc3BlbGxjaGVjayBlOGNlXG5zdGFyIGU4MzhcbnN0YXJfYm9yZGVyIGU4M2FcbnN0YXJfaGFsZiBlODM5XG5zdGFycyBlOGQwXG5zdGF5X2N1cnJlbnRfbGFuZHNjYXBlIGUwZDNcbnN0YXlfY3VycmVudF9wb3J0cmFpdCBlMGQ0XG5zdGF5X3ByaW1hcnlfbGFuZHNjYXBlIGUwZDVcbnN0YXlfcHJpbWFyeV9wb3J0cmFpdCBlMGQ2XG5zdG9wIGUwNDdcbnN0b3Bfc2NyZWVuX3NoYXJlIGUwZTNcbnN0b3JhZ2UgZTFkYlxuc3RvcmUgZThkMVxuc3RvcmVfbWFsbF9kaXJlY3RvcnkgZTU2M1xuc3RyYWlnaHRlbiBlNDFjXG5zdHJlZXR2aWV3IGU1NmVcbnN0cmlrZXRocm91Z2hfcyBlMjU3XG5zdHlsZSBlNDFkXG5zdWJkaXJlY3RvcnlfYXJyb3dfbGVmdCBlNWQ5XG5zdWJkaXJlY3RvcnlfYXJyb3dfcmlnaHQgZTVkYVxuc3ViamVjdCBlOGQyXG5zdWJzY3JpcHRpb25zIGUwNjRcbnN1YnRpdGxlcyBlMDQ4XG5zdWJ3YXkgZTU2Zlxuc3VwZXJ2aXNvcl9hY2NvdW50IGU4ZDNcbnN1cnJvdW5kX3NvdW5kIGUwNDlcbnN3YXBfY2FsbHMgZTBkN1xuc3dhcF9ob3JpeiBlOGQ0XG5zd2FwX3ZlcnQgZThkNVxuc3dhcF92ZXJ0aWNhbF9jaXJjbGUgZThkNlxuc3dpdGNoX2NhbWVyYSBlNDFlXG5zd2l0Y2hfdmlkZW8gZTQxZlxuc3luYyBlNjI3XG5zeW5jX2Rpc2FibGVkIGU2MjhcbnN5bmNfcHJvYmxlbSBlNjI5XG5zeXN0ZW1fdXBkYXRlIGU2MmFcbnN5c3RlbV91cGRhdGVfYWx0IGU4ZDdcbnRhYiBlOGQ4XG50YWJfdW5zZWxlY3RlZCBlOGQ5XG50YWJsZXQgZTMyZlxudGFibGV0X2FuZHJvaWQgZTMzMFxudGFibGV0X21hYyBlMzMxXG50YWdfZmFjZXMgZTQyMFxudGFwX2FuZF9wbGF5IGU2MmJcbnRlcnJhaW4gZTU2NFxudGV4dF9maWVsZHMgZTI2MlxudGV4dF9mb3JtYXQgZTE2NVxudGV4dHNtcyBlMGQ4XG50ZXh0dXJlIGU0MjFcbnRoZWF0ZXJzIGU4ZGFcbnRodW1iX2Rvd24gZThkYlxudGh1bWJfdXAgZThkY1xudGh1bWJzX3VwX2Rvd24gZThkZFxudGltZV90b19sZWF2ZSBlNjJjXG50aW1lbGFwc2UgZTQyMlxudGltZWxpbmUgZTkyMlxudGltZXIgZTQyNVxudGltZXJfMTAgZTQyM1xudGltZXJfMyBlNDI0XG50aW1lcl9vZmYgZTQyNlxudGl0bGUgZTI2NFxudG9jIGU4ZGVcbnRvZGF5IGU4ZGZcbnRvbGwgZThlMFxudG9uYWxpdHkgZTQyN1xudG91Y2hfYXBwIGU5MTNcbnRveXMgZTMzMlxudHJhY2tfY2hhbmdlcyBlOGUxXG50cmFmZmljIGU1NjVcbnRyYWluIGU1NzBcbnRyYW0gZTU3MVxudHJhbnNmZXJfd2l0aGluX2Ffc3RhdGlvbiBlNTcyXG50cmFuc2Zvcm0gZTQyOFxudHJhbnNsYXRlIGU4ZTJcbnRyZW5kaW5nX2Rvd24gZThlM1xudHJlbmRpbmdfZmxhdCBlOGU0XG50cmVuZGluZ191cCBlOGU1XG50dW5lIGU0MjlcbnR1cm5lZF9pbiBlOGU2XG50dXJuZWRfaW5fbm90IGU4ZTdcbnR2IGUzMzNcbnVuYXJjaGl2ZSBlMTY5XG51bmRvIGUxNjZcbnVuZm9sZF9sZXNzIGU1ZDZcbnVuZm9sZF9tb3JlIGU1ZDdcbnVwZGF0ZSBlOTIzXG51c2IgZTFlMFxudmVyaWZpZWRfdXNlciBlOGU4XG52ZXJ0aWNhbF9hbGlnbl9ib3R0b20gZTI1OFxudmVydGljYWxfYWxpZ25fY2VudGVyIGUyNTlcbnZlcnRpY2FsX2FsaWduX3RvcCBlMjVhXG52aWJyYXRpb24gZTYyZFxudmlkZW9fY2FsbCBlMDcwXG52aWRlb19sYWJlbCBlMDcxXG52aWRlb19saWJyYXJ5IGUwNGFcbnZpZGVvY2FtIGUwNGJcbnZpZGVvY2FtX29mZiBlMDRjXG52aWRlb2dhbWVfYXNzZXQgZTMzOFxudmlld19hZ2VuZGEgZThlOVxudmlld19hcnJheSBlOGVhXG52aWV3X2Nhcm91c2VsIGU4ZWJcbnZpZXdfY29sdW1uIGU4ZWNcbnZpZXdfY29tZnkgZTQyYVxudmlld19jb21wYWN0IGU0MmJcbnZpZXdfZGF5IGU4ZWRcbnZpZXdfaGVhZGxpbmUgZThlZVxudmlld19saXN0IGU4ZWZcbnZpZXdfbW9kdWxlIGU4ZjBcbnZpZXdfcXVpbHQgZThmMVxudmlld19zdHJlYW0gZThmMlxudmlld193ZWVrIGU4ZjNcbnZpZ25ldHRlIGU0MzVcbnZpc2liaWxpdHkgZThmNFxudmlzaWJpbGl0eV9vZmYgZThmNVxudm9pY2VfY2hhdCBlNjJlXG52b2ljZW1haWwgZTBkOVxudm9sdW1lX2Rvd24gZTA0ZFxudm9sdW1lX211dGUgZTA0ZVxudm9sdW1lX29mZiBlMDRmXG52b2x1bWVfdXAgZTA1MFxudnBuX2tleSBlMGRhXG52cG5fbG9jayBlNjJmXG53YWxscGFwZXIgZTFiY1xud2FybmluZyBlMDAyXG53YXRjaCBlMzM0XG53YXRjaF9sYXRlciBlOTI0XG53Yl9hdXRvIGU0MmNcbndiX2Nsb3VkeSBlNDJkXG53Yl9pbmNhbmRlc2NlbnQgZTQyZVxud2JfaXJpZGVzY2VudCBlNDM2XG53Yl9zdW5ueSBlNDMwXG53YyBlNjNkXG53ZWIgZTA1MVxud2ViX2Fzc2V0IGUwNjlcbndlZWtlbmQgZTE2Ylxud2hhdHNob3QgZTgwZVxud2lkZ2V0cyBlMWJkXG53aWZpIGU2M2VcbndpZmlfbG9jayBlMWUxXG53aWZpX3RldGhlcmluZyBlMWUyXG53b3JrIGU4ZjlcbndyYXBfdGV4dCBlMjViXG55b3V0dWJlX3NlYXJjaGVkX2ZvciBlOGZhXG56b29tX2luIGU4ZmZcbnpvb21fb3V0IGU5MDBcbnpvb21fb3V0X21hcCBlNTZiXG5gO1xuXG5sZXQgY29kZXBvaW50cyA9IHMudHJpbSgpLnNwbGl0KFwiXFxuXCIpLnJlZHVjZShmdW5jdGlvbihjdiwgbnYpe1xuICAgIGxldCBwYXJ0cyA9IG52LnNwbGl0KC8gKy8pO1xuICAgIGxldCB1YyA9ICdcXFxcdScgKyBwYXJ0c1sxXTtcbiAgICBjdltwYXJ0c1swXV0gPSBldmFsKCdcIicgKyB1YyArICdcIicpO1xuICAgIHJldHVybiBjdjtcbn0sIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY29kZXBvaW50c1xufVxuXG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qXG4gKiBEYXRhIHN0cnVjdHVyZXM6XG4gKiAgIDAuIFRoZSBkYXRhIG1vZGVsIGZvciBhIG1pbmUgaXMgYSBncmFwaCBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBcbiAqICAgY2xhc3NlcywgdGhlaXIgY29tcG9uZW50cyAoYXR0cmlidXRlcywgcmVmZXJlbmNlcywgY29sbGVjdGlvbnMpLCBhbmQgcmVsYXRpb25zaGlwcy5cbiAqICAgMS4gVGhlIHF1ZXJ5IGlzIHJlcHJlc2VudGVkIGJ5IGEgZDMtc3R5bGUgaGllcmFyY2h5IHN0cnVjdHVyZTogYSBsaXN0IG9mXG4gKiAgIG5vZGVzLCB3aGVyZSBlYWNoIG5vZGUgaGFzIGEgbmFtZSAoc3RyaW5nKSwgYW5kIGEgY2hpbGRyZW4gbGlzdCAocG9zc2libHkgZW1wdHkgXG4gKiAgIGxpc3Qgb2Ygbm9kZXMpLiBUaGUgbm9kZXMgYW5kIHRoZSBwYXJlbnQvY2hpbGQgcmVsYXRpb25zaGlwcyBvZiB0aGlzIHN0cnVjdHVyZSBcbiAqICAgYXJlIHdoYXQgZHJpdmUgdGhlIGRpc2xheS5cbiAqICAgMi4gRWFjaCBub2RlIGluIHRoZSBkaWFncmFtIGNvcnJlc3BvbmRzIHRvIGEgY29tcG9uZW50IGluIGEgcGF0aCwgd2hlcmUgZWFjaFxuICogICBwYXRoIHN0YXJ0cyB3aXRoIHRoZSByb290IGNsYXNzLCBvcHRpb25hbGx5IHByb2NlZWRzIHRocm91Z2ggcmVmZXJlbmNlcyBhbmQgY29sbGVjdGlvbnMsXG4gKiAgIGFuZCBvcHRpb25hbGx5IGVuZHMgYXQgYW4gYXR0cmlidXRlLlxuICpcbiAqL1xuLy9pbXBvcnQgeyBtaW5lcyB9IGZyb20gJy4vbWluZXMuanMnO1xuaW1wb3J0IHsgTlVNRVJJQ1RZUEVTLCBOVUxMQUJMRVRZUEVTLCBMRUFGVFlQRVMsIE9QUywgT1BJTkRFWCB9IGZyb20gJy4vb3BzLmpzJztcbmltcG9ydCB7XG4gICAgZXNjLFxuICAgIGQzanNvblByb21pc2UsXG4gICAgc2VsZWN0VGV4dCxcbiAgICBkZWVwYyxcbiAgICBwYXJzZVBhdGhRdWVyeSxcbiAgICBvYmoyYXJyYXlcbn0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQge2NvZGVwb2ludHN9IGZyb20gJy4vbWF0ZXJpYWxfaWNvbl9jb2RlcG9pbnRzLmpzJztcbmltcG9ydCBVbmRvTWFuYWdlciBmcm9tICcuL3VuZG9NYW5hZ2VyLmpzJztcbmltcG9ydCB7XG4gICAgTW9kZWwsXG4gICAgZ2V0U3ViY2xhc3NlcyxcbiAgICBOb2RlLFxuICAgIFRlbXBsYXRlLFxuICAgIENvbnN0cmFpbnRcbn0gZnJvbSAnLi9tb2RlbC5qcyc7XG5pbXBvcnQgeyBpbml0UmVnaXN0cnkgfSBmcm9tICcuL3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGVkaXRWaWV3cyB9IGZyb20gJy4vZWRpdFZpZXdzLmpzJztcblxubGV0IFZFUlNJT04gPSBcIjAuMS4wXCI7XG5cbmxldCBjdXJyTWluZTtcbmxldCBjdXJyVGVtcGxhdGU7XG5sZXQgY3Vyck5vZGU7XG5cbmxldCBuYW1lMm1pbmU7XG5sZXQgbTtcbmxldCB3O1xubGV0IGg7XG5sZXQgaTtcbmxldCByb290O1xubGV0IGRpYWdvbmFsO1xubGV0IHZpcztcbmxldCBub2RlcztcbmxldCBsaW5rcztcbmxldCBkcmFnQmVoYXZpb3IgPSBudWxsO1xubGV0IGFuaW1hdGlvbkR1cmF0aW9uID0gMjUwOyAvLyBtc1xubGV0IGRlZmF1bHRDb2xvcnMgPSB7IGhlYWRlcjogeyBtYWluOiBcIiM1OTU0NTVcIiwgdGV4dDogXCIjZmZmXCIgfSB9O1xubGV0IGRlZmF1bHRMb2dvID0gXCJodHRwczovL2Nkbi5yYXdnaXQuY29tL2ludGVybWluZS9kZXNpZ24tbWF0ZXJpYWxzLzc4YTEzZGI1L2xvZ29zL2ludGVybWluZS9zcXVhcmVpc2gvNDV4NDUucG5nXCI7XG5sZXQgdW5kb01nciA9IG5ldyBVbmRvTWFuYWdlcigpO1xuLy8gU3RhcnRpbmcgZWRpdCB2aWV3IGlzIHRoZSBtYWluIHF1ZXJ5IHZpZXcuXG5sZXQgZWRpdFZpZXcgPSBlZGl0Vmlld3MucXVlcnlNYWluO1xuXG4vLyBTZXR1cCBmdW5jdGlvblxuZnVuY3Rpb24gc2V0dXAoKXtcbiAgICBtID0gWzIwLCAxMjAsIDIwLCAxMjBdXG4gICAgdyA9IDEyODAgLSBtWzFdIC0gbVszXVxuICAgIGggPSA4MDAgLSBtWzBdIC0gbVsyXVxuICAgIGkgPSAwXG5cbiAgICAvL1xuICAgIGQzLnNlbGVjdCgnI2Zvb3RlciBbbmFtZT1cInZlcnNpb25cIl0nKVxuICAgICAgICAudGV4dChgUUIgdiR7VkVSU0lPTn1gKTtcblxuICAgIC8vIHRoYW5rcyB0bzogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTUwMDc4NzcvaG93LXRvLXVzZS10aGUtZDMtZGlhZ29uYWwtZnVuY3Rpb24tdG8tZHJhdy1jdXJ2ZWQtbGluZXNcbiAgICBkaWFnb25hbCA9IGQzLnN2Zy5kaWFnb25hbCgpXG4gICAgICAgIC5zb3VyY2UoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQuc291cmNlLnksIFwieVwiOmQuc291cmNlLnh9OyB9KSAgICAgXG4gICAgICAgIC50YXJnZXQoZnVuY3Rpb24oZCkgeyByZXR1cm4ge1wieFwiOmQudGFyZ2V0LnksIFwieVwiOmQudGFyZ2V0Lnh9OyB9KVxuICAgICAgICAucHJvamVjdGlvbihmdW5jdGlvbihkKSB7IHJldHVybiBbZC55LCBkLnhdOyB9KTtcbiAgICBcbiAgICAvLyBjcmVhdGUgdGhlIFNWRyBjb250YWluZXJcbiAgICB2aXMgPSBkMy5zZWxlY3QoXCIjc3ZnQ29udGFpbmVyIHN2Z1wiKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIHcgKyBtWzFdICsgbVszXSlcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaCArIG1bMF0gKyBtWzJdKVxuICAgICAgICAub24oXCJjbGlja1wiLCBoaWRlRGlhbG9nKVxuICAgICAgLmFwcGVuZChcInN2ZzpnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbVszXSArIFwiLFwiICsgbVswXSArIFwiKVwiKTtcbiAgICAvL1xuICAgIGQzLnNlbGVjdCgnLmJ1dHRvbltuYW1lPVwib3BlbmNsb3NlXCJdJylcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgXG4gICAgICAgICAgICBsZXQgdCA9IGQzLnNlbGVjdChcIiN0SW5mb0JhclwiKTtcbiAgICAgICAgICAgIGxldCB3YXNDbG9zZWQgPSB0LmNsYXNzZWQoXCJjbG9zZWRcIik7XG4gICAgICAgICAgICBsZXQgaXNDbG9zZWQgPSAhd2FzQ2xvc2VkO1xuICAgICAgICAgICAgbGV0IGQgPSBkMy5zZWxlY3QoJyNkcmF3ZXInKVswXVswXVxuICAgICAgICAgICAgaWYgKGlzQ2xvc2VkKVxuICAgICAgICAgICAgICAgIC8vIHNhdmUgdGhlIGN1cnJlbnQgaGVpZ2h0IGp1c3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgICAgICAgICAgICBkLl9fc2F2ZWRfaGVpZ2h0ID0gZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICBlbHNlIGlmIChkLl9fc2F2ZWRfaGVpZ2h0KVxuICAgICAgICAgICAgICAgLy8gb24gb3BlbiwgcmVzdG9yZSB0aGUgc2F2ZWQgaGVpZ2h0XG4gICAgICAgICAgICAgICBkMy5zZWxlY3QoJyNkcmF3ZXInKS5zdHlsZShcImhlaWdodFwiLCBkLl9fc2F2ZWRfaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHQuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuY2xhc3NlZChcImNsb3NlZFwiLCBpc0Nsb3NlZCk7XG4gICAgICAgIH0pO1xuXG4gICAgaW5pdFJlZ2lzdHJ5KGluaXRNaW5lcyk7XG5cbiAgICBkMy5zZWxlY3RBbGwoXCIjdHRleHQgbGFiZWwgc3BhblwiKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI3R0ZXh0JykuYXR0cignY2xhc3MnLCAnZmxleGNvbHVtbiAnK3RoaXMuaW5uZXJUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgdXBkYXRlVHRleHQoY3VyclRlbXBsYXRlKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KCcjcnVuYXRtaW5lJylcbiAgICAgICAgLm9uKCdjbGljaycsICgpID0+IHJ1bmF0bWluZShjdXJyVGVtcGxhdGUpKTtcbiAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50IC5idXR0b24uc3luYycpXG4gICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IHQgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgICAgICBsZXQgdHVyblN5bmNPZmYgPSB0LnRleHQoKSA9PT0gXCJzeW5jXCI7XG4gICAgICAgICAgICB0LnRleHQoIHR1cm5TeW5jT2ZmID8gXCJzeW5jX2Rpc2FibGVkXCIgOiBcInN5bmNcIiApXG4gICAgICAgICAgICAgLmF0dHIoXCJ0aXRsZVwiLCAoKSA9PlxuICAgICAgICAgICAgICAgICBgQ291bnQgYXV0b3N5bmMgaXMgJHsgdHVyblN5bmNPZmYgPyBcIk9GRlwiIDogXCJPTlwiIH0uIENsaWNrIHRvIHR1cm4gaXQgJHsgdHVyblN5bmNPZmYgPyBcIk9OXCIgOiBcIk9GRlwiIH0uYCk7XG4gICAgICAgICAgICAhdHVyblN5bmNPZmYgJiYgdXBkYXRlQ291bnQoY3VyclRlbXBsYXRlKTtcbiAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCcpLmNsYXNzZWQoXCJzeW5jb2ZmXCIsIHR1cm5TeW5jT2ZmKTtcbiAgICAgICAgfSk7XG4gICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpXG4gICAgICAgIC5vbihcImZvY3VzXCIsIGZ1bmN0aW9uKCl7IHRoaXMudmFsdWUgJiYgc2VsZWN0VGV4dChcInhtbHRleHRhcmVhXCIpfSk7XG4gICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKVxuICAgICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpeyB0aGlzLnZhbHVlICYmIHNlbGVjdFRleHQoXCJqc29udGV4dGFyZWFcIil9KTtcblxuICAvL1xuICBkcmFnQmVoYXZpb3IgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAub24oXCJkcmFnXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIG9uIGRyYWcsIGZvbGxvdyB0aGUgbW91c2UgaW4gdGhlIFkgZGltZW5zaW9uLlxuICAgICAgLy8gRHJhZyBjYWxsYmFjayBpcyBhdHRhY2hlZCB0byB0aGUgZHJhZyBoYW5kbGUuXG4gICAgICBsZXQgbm9kZUdycCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgIC8vIHVwZGF0ZSBub2RlJ3MgeS1jb29yZGluYXRlXG4gICAgICBub2RlR3JwLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKG4pID0+IHtcbiAgICAgICAgICBuLnkgPSBkMy5ldmVudC55O1xuICAgICAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7bi54fSwke24ueX0pYDtcbiAgICAgIH0pO1xuICAgICAgLy8gdXBkYXRlIHRoZSBub2RlJ3MgbGlua1xuICAgICAgbGV0IGxsID0gZDMuc2VsZWN0KGBwYXRoLmxpbmtbdGFyZ2V0PVwiJHtub2RlR3JwLmF0dHIoJ2lkJyl9XCJdYCk7XG4gICAgICBsbC5hdHRyKFwiZFwiLCBkaWFnb25hbCk7XG4gICAgICB9KVxuICAgIC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gb24gZHJhZ2VuZCwgcmVzb3J0IHRoZSBkcmFnZ2FibGUgbm9kZXMgYWNjb3JkaW5nIHRvIHRoZWlyIFkgcG9zaXRpb25cbiAgICAgIGxldCBub2RlcyA9IGQzLnNlbGVjdEFsbChlZGl0Vmlldy5kcmFnZ2FibGUpLmRhdGEoKVxuICAgICAgbm9kZXMuc29ydCggKGEsIGIpID0+IGEueSAtIGIueSApO1xuICAgICAgLy8gdGhlIG5vZGUgdGhhdCB3YXMgZHJhZ2dlZFxuICAgICAgbGV0IGRyYWdnZWQgPSBkMy5zZWxlY3QodGhpcykuZGF0YSgpWzBdO1xuICAgICAgLy8gY2FsbGJhY2sgZm9yIHNwZWNpZmljIGRyYWctZW5kIGJlaGF2aW9yXG4gICAgICBlZGl0Vmlldy5hZnRlckRyYWcgJiYgZWRpdFZpZXcuYWZ0ZXJEcmFnKG5vZGVzLCBkcmFnZ2VkKTtcbiAgICAgIC8vXG4gICAgICBzYXZlU3RhdGUoZHJhZ2dlZCk7XG4gICAgICB1cGRhdGUoKTtcbiAgICAgIC8vXG4gICAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0TWluZXMoal9taW5lcykge1xuICAgIHZhciBtaW5lcyA9IGpfbWluZXMuaW5zdGFuY2VzO1xuICAgIG5hbWUybWluZSA9IHt9O1xuICAgIG1pbmVzLmZvckVhY2goZnVuY3Rpb24obSl7IG5hbWUybWluZVttLm5hbWVdID0gbTsgfSk7XG4gICAgY3Vyck1pbmUgPSBtaW5lc1swXTtcbiAgICBjdXJyVGVtcGxhdGUgPSBudWxsO1xuXG4gICAgdmFyIG1sID0gZDMuc2VsZWN0KFwiI21saXN0XCIpLnNlbGVjdEFsbChcIm9wdGlvblwiKS5kYXRhKG1pbmVzKTtcbiAgICB2YXIgc2VsZWN0TWluZSA9IFwiTW91c2VNaW5lXCI7XG4gICAgbWwuZW50ZXIoKS5hcHBlbmQoXCJvcHRpb25cIilcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5uYW1lO30pXG4gICAgICAgIC5hdHRyKFwiZGlzYWJsZWRcIiwgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN0YXJ0c1dpdGgoXCJodHRwc1wiKTtcbiAgICAgICAgICAgIHZhciBtID0gZC51cmwuc3RhcnRzV2l0aChcImh0dHBzXCIpO1xuICAgICAgICAgICAgdmFyIHYgPSAodyAmJiAhbSkgfHwgbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9KVxuICAgICAgICAuYXR0cihcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gZC5uYW1lPT09c2VsZWN0TWluZSB8fCBudWxsOyB9KVxuICAgICAgICAudGV4dChmdW5jdGlvbihkKXsgcmV0dXJuIGQubmFtZTsgfSk7XG4gICAgLy9cbiAgICAvLyB3aGVuIGEgbWluZSBpcyBzZWxlY3RlZCBmcm9tIHRoZSBsaXN0XG4gICAgZDMuc2VsZWN0KFwiI21saXN0XCIpXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZE1pbmUodGhpcy52YWx1ZSk7IH0pO1xuICAgIC8vXG4gICAgdmFyIGRnID0gZDMuc2VsZWN0KFwiI2RpYWxvZ1wiKTtcbiAgICBkZy5jbGFzc2VkKFwiaGlkZGVuXCIsdHJ1ZSlcbiAgICBkZy5zZWxlY3QoXCIuYnV0dG9uLmNsb3NlXCIpLm9uKFwiY2xpY2tcIiwgaGlkZURpYWxvZyk7XG4gICAgZGcuc2VsZWN0KFwiLmJ1dHRvbi5yZW1vdmVcIikub24oXCJjbGlja1wiLCAoKSA9PiByZW1vdmVOb2RlKGN1cnJOb2RlKSk7XG5cbiAgICAvLyBcbiAgICAvL1xuICAgIGQzLnNlbGVjdChcIiNlZGl0VmlldyBzZWxlY3RcIilcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHsgc2V0RWRpdFZpZXcodGhpcy52YWx1ZSk7IH0pXG4gICAgICAgIDtcblxuICAgIC8vXG4gICAgZDMuc2VsZWN0KFwiI2RpYWxvZyAuc3ViY2xhc3NDb25zdHJhaW50IHNlbGVjdFwiKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgY3Vyck5vZGUuc2V0U3ViY2xhc3NDb25zdHJhaW50KHRoaXMudmFsdWUpOyB9KTtcbiAgICAvLyBXaXJlIHVwIHNlbGVjdCBidXR0b24gaW4gZGlhbG9nXG4gICAgZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic2VsZWN0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY3Vyck5vZGUuaXNTZWxlY3RlZCA/IGN1cnJOb2RlLnVuc2VsZWN0KCkgOiBjdXJyTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnI2RpYWxvZyBbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGN1cnJOb2RlLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgc2F2ZVN0YXRlKGN1cnJOb2RlKTtcbiAgICAgICAgICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgICAgIH0pO1xuICAgIC8vIFdpcmUgdXAgc29ydCBmdW5jdGlvbiBpbiBkaWFsb2dcbiAgICBkMy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzb3J0LWN0cmxcIl0gLnN3YXRjaCcpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IGNjID0gZDMuc2VsZWN0KCcjZGlhbG9nIFtuYW1lPVwic29ydC1jdHJsXCJdJyk7XG4gICAgICAgICAgICBsZXQgY3VyclNvcnQgPSBjYy5jbGFzc2VkXG4gICAgICAgICAgICBsZXQgb2xkc29ydCA9IGNjLmNsYXNzZWQoXCJzb3J0YXNjXCIpID8gXCJhc2NcIiA6IGNjLmNsYXNzZWQoXCJzb3J0ZGVzY1wiKSA/IFwiZGVzY1wiIDogXCJub25lXCI7XG4gICAgICAgICAgICBsZXQgbmV3c29ydCA9IG9sZHNvcnQgPT09IFwiYXNjXCIgPyBcImRlc2NcIiA6IG9sZHNvcnQgPT09IFwiZGVzY1wiID8gXCJub25lXCIgOiBcImFzY1wiO1xuICAgICAgICAgICAgY2MuY2xhc3NlZChcInNvcnRhc2NcIiwgbmV3c29ydCA9PT0gXCJhc2NcIik7XG4gICAgICAgICAgICBjYy5jbGFzc2VkKFwic29ydGRlc2NcIiwgbmV3c29ydCA9PT0gXCJkZXNjXCIpO1xuICAgICAgICAgICAgY3Vyck5vZGUuc2V0U29ydChuZXdzb3J0KTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZShjdXJyTm9kZSk7XG4gICAgICAgICAgICB1cGRhdGUoY3Vyck5vZGUpO1xuICAgICAgICB9KTtcblxuICAgIC8vIHN0YXJ0IHdpdGggdGhlIGZpcnN0IG1pbmUgYnkgZGVmYXVsdC5cbiAgICBzZWxlY3RlZE1pbmUoc2VsZWN0TWluZSk7XG59XG4vL1xuZnVuY3Rpb24gY2xlYXJTdGF0ZSgpIHtcbiAgICB1bmRvTWdyLmNsZWFyKCk7XG59XG5mdW5jdGlvbiBzYXZlU3RhdGUobikge1xuICAgIGxldCBzID0gSlNPTi5zdHJpbmdpZnkobi50ZW1wbGF0ZS51bmNvbXBpbGVUZW1wbGF0ZSgpKTtcbiAgICBpZiAoIXVuZG9NZ3IuaGFzU3RhdGUgfHwgdW5kb01nci5jdXJyZW50U3RhdGUgIT09IHMpXG4gICAgICAgIC8vIG9ubHkgc2F2ZSBzdGF0ZSBpZiBpdCBoYXMgY2hhbmdlZFxuICAgICAgICB1bmRvTWdyLmFkZChzKTtcbn1cbmZ1bmN0aW9uIHVuZG8oKSB7IHVuZG9yZWRvKFwidW5kb1wiKSB9XG5mdW5jdGlvbiByZWRvKCkgeyB1bmRvcmVkbyhcInJlZG9cIikgfVxuZnVuY3Rpb24gdW5kb3JlZG8od2hpY2gpe1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzID0gSlNPTi5wYXJzZSh1bmRvTWdyW3doaWNoXSgpKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKHMsIHRydWUpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG4vLyBDYWxsZWQgd2hlbiB1c2VyIHNlbGVjdHMgYSBtaW5lIGZyb20gdGhlIG9wdGlvbiBsaXN0XG4vLyBMb2FkcyB0aGF0IG1pbmUncyBkYXRhIG1vZGVsIGFuZCBhbGwgaXRzIHRlbXBsYXRlcy5cbi8vIFRoZW4gaW5pdGlhbGl6ZXMgZGlzcGxheSB0byBzaG93IHRoZSBmaXJzdCB0ZXJtcGxhdGUncyBxdWVyeS5cbmZ1bmN0aW9uIHNlbGVjdGVkTWluZShtbmFtZSl7XG4gICAgaWYoIW5hbWUybWluZVttbmFtZV0pIHRocm93IFwiTm8gbWluZSBuYW1lZDogXCIgKyBtbmFtZTtcbiAgICBjdXJyTWluZSA9IG5hbWUybWluZVttbmFtZV07XG4gICAgY2xlYXJTdGF0ZSgpO1xuICAgIGxldCB1cmwgPSBjdXJyTWluZS51cmw7XG4gICAgbGV0IHR1cmwsIG11cmwsIGx1cmwsIGJ1cmwsIHN1cmwsIG91cmw7XG4gICAgY3Vyck1pbmUudG5hbWVzID0gW11cbiAgICBjdXJyTWluZS50ZW1wbGF0ZXMgPSBbXVxuICAgIGlmIChtbmFtZSA9PT0gXCJ0ZXN0XCIpIHsgXG4gICAgICAgIHR1cmwgPSB1cmwgKyBcIi90ZW1wbGF0ZXMuanNvblwiO1xuICAgICAgICBtdXJsID0gdXJsICsgXCIvbW9kZWwuanNvblwiO1xuICAgICAgICBsdXJsID0gdXJsICsgXCIvbGlzdHMuanNvblwiO1xuICAgICAgICBidXJsID0gdXJsICsgXCIvYnJhbmRpbmcuanNvblwiO1xuICAgICAgICBzdXJsID0gdXJsICsgXCIvc3VtbWFyeWZpZWxkcy5qc29uXCI7XG4gICAgICAgIG91cmwgPSB1cmwgKyBcIi9vcmdhbmlzbWxpc3QuanNvblwiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdHVybCA9IHVybCArIFwiL3NlcnZpY2UvdGVtcGxhdGVzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIG11cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL21vZGVsP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGx1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2xpc3RzP2Zvcm1hdD1qc29uXCI7XG4gICAgICAgIGJ1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL2JyYW5kaW5nXCI7XG4gICAgICAgIHN1cmwgPSB1cmwgKyBcIi9zZXJ2aWNlL3N1bW1hcnlmaWVsZHNcIjtcbiAgICAgICAgb3VybCA9IHVybCArIFwiL3NlcnZpY2UvcXVlcnkvcmVzdWx0cz9xdWVyeT0lM0NxdWVyeStuYW1lJTNEJTIyJTIyK21vZGVsJTNEJTIyZ2Vub21pYyUyMit2aWV3JTNEJTIyT3JnYW5pc20uc2hvcnROYW1lJTIyK2xvbmdEZXNjcmlwdGlvbiUzRCUyMiUyMiUzRSUzQyUyRnF1ZXJ5JTNFJmZvcm1hdD1qc29ub2JqZWN0c1wiO1xuICAgIH1cbiAgICAvLyBnZXQgdGhlIG1vZGVsXG4gICAgY29uc29sZS5sb2coXCJMb2FkaW5nIHJlc291cmNlcyBmcm9tIFwiICsgdXJsICk7XG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBkM2pzb25Qcm9taXNlKG11cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHR1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGx1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKGJ1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKHN1cmwpLFxuICAgICAgICBkM2pzb25Qcm9taXNlKG91cmwpXG4gICAgXSkudGhlbiggZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgal9tb2RlbCA9IGRhdGFbMF07XG4gICAgICAgIHZhciBqX3RlbXBsYXRlcyA9IGRhdGFbMV07XG4gICAgICAgIHZhciBqX2xpc3RzID0gZGF0YVsyXTtcbiAgICAgICAgdmFyIGpfYnJhbmRpbmcgPSBkYXRhWzNdO1xuICAgICAgICB2YXIgal9zdW1tYXJ5ID0gZGF0YVs0XTtcbiAgICAgICAgdmFyIGpfb3JnYW5pc21zID0gZGF0YVs1XTtcbiAgICAgICAgLy9cbiAgICAgICAgY3Vyck1pbmUubW9kZWwgPSBuZXcgTW9kZWwoal9tb2RlbC5tb2RlbClcbiAgICAgICAgY3Vyck1pbmUudGVtcGxhdGVzID0gal90ZW1wbGF0ZXMudGVtcGxhdGVzO1xuICAgICAgICBjdXJyTWluZS5saXN0cyA9IGpfbGlzdHMubGlzdHM7XG4gICAgICAgIGN1cnJNaW5lLnN1bW1hcnlGaWVsZHMgPSBqX3N1bW1hcnkuY2xhc3NlcztcbiAgICAgICAgY3Vyck1pbmUub3JnYW5pc21MaXN0ID0gal9vcmdhbmlzbXMucmVzdWx0cy5tYXAobyA9PiBvLnNob3J0TmFtZSk7XG4gICAgICAgIC8vXG4gICAgICAgIGN1cnJNaW5lLnRsaXN0ID0gb2JqMmFycmF5KGN1cnJNaW5lLnRlbXBsYXRlcylcbiAgICAgICAgY3Vyck1pbmUudGxpc3Quc29ydChmdW5jdGlvbihhLGIpeyBcbiAgICAgICAgICAgIHJldHVybiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogYS50aXRsZSA+IGIudGl0bGUgPyAxIDogMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJNaW5lLnRuYW1lcyA9IE9iamVjdC5rZXlzKCBjdXJyTWluZS50ZW1wbGF0ZXMgKTtcbiAgICAgICAgY3Vyck1pbmUudG5hbWVzLnNvcnQoKTtcbiAgICAgICAgLy8gRmlsbCBpbiB0aGUgc2VsZWN0aW9uIGxpc3Qgb2YgdGVtcGxhdGVzIGZvciB0aGlzIG1pbmUuXG4gICAgICAgIHZhciB0bCA9IGQzLnNlbGVjdChcIiN0bGlzdCBzZWxlY3RcIilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoJ29wdGlvbicpXG4gICAgICAgICAgICAuZGF0YSggY3Vyck1pbmUudGxpc3QgKTtcbiAgICAgICAgdGwuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpXG4gICAgICAgIHRsLmV4aXQoKS5yZW1vdmUoKVxuICAgICAgICB0bC5hdHRyKFwidmFsdWVcIiwgZnVuY3Rpb24oZCl7IHJldHVybiBkLm5hbWU7IH0pXG4gICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCl7cmV0dXJuIGQudGl0bGU7fSk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnW25hbWU9XCJlZGl0VGFyZ2V0XCJdIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLm9uKFwiY2hhbmdlXCIsIHN0YXJ0RWRpdCk7XG4gICAgICAgIGVkaXRUZW1wbGF0ZShjdXJyTWluZS50ZW1wbGF0ZXNbY3Vyck1pbmUudGxpc3RbMF0ubmFtZV0pO1xuICAgICAgICAvLyBBcHBseSBicmFuZGluZ1xuICAgICAgICBsZXQgY2xycyA9IGN1cnJNaW5lLmNvbG9ycyB8fCBkZWZhdWx0Q29sb3JzO1xuICAgICAgICBsZXQgYmdjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci5tYWluIDogY2xycy5tYWluLmZnO1xuICAgICAgICBsZXQgdHhjID0gY2xycy5oZWFkZXIgPyBjbHJzLmhlYWRlci50ZXh0IDogY2xycy5tYWluLmJnO1xuICAgICAgICBsZXQgbG9nbyA9IGN1cnJNaW5lLmltYWdlcy5sb2dvIHx8IGRlZmF1bHRMb2dvO1xuICAgICAgICBkMy5zZWxlY3QoXCIjdG9vbHRyYXlcIilcbiAgICAgICAgICAgIC5zdHlsZShcImJhY2tncm91bmQtY29sb3JcIiwgYmdjKVxuICAgICAgICAgICAgLnN0eWxlKFwiY29sb3JcIiwgdHhjKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3RJbmZvQmFyXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGJnYylcbiAgICAgICAgICAgIC5zdHlsZShcImNvbG9yXCIsIHR4Yyk7XG4gICAgICAgIGQzLnNlbGVjdChcIiNtaW5lTG9nb1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJzcmNcIiwgbG9nbyk7XG4gICAgICAgIGQzLnNlbGVjdEFsbCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cIm1pbmVuYW1lXCJdJylcbiAgICAgICAgICAgIC50ZXh0KGN1cnJNaW5lLm5hbWUpO1xuICAgICAgICAvLyBwb3B1bGF0ZSBjbGFzcyBsaXN0IFxuICAgICAgICBsZXQgY2xpc3QgPSBPYmplY3Qua2V5cyhjdXJyTWluZS5tb2RlbC5jbGFzc2VzKS5maWx0ZXIoY24gPT4gISBjdXJyTWluZS5tb2RlbC5jbGFzc2VzW2NuXS5pc0xlYWZUeXBlKTtcbiAgICAgICAgY2xpc3Quc29ydCgpO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcIiNuZXdxY2xpc3Qgc2VsZWN0XCIsIGNsaXN0KTtcbiAgICAgICAgZDMuc2VsZWN0KCcjZWRpdFNvdXJjZVNlbGVjdG9yIFtuYW1lPVwiaW5cIl0nKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXsgdGhpc1swXVswXS5zZWxlY3RlZEluZGV4ID0gMTsgfSlcbiAgICAgICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyBzZWxlY3RlZEVkaXRTb3VyY2UodGhpcy52YWx1ZSk7IHN0YXJ0RWRpdCgpOyB9KTtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3htbHRleHRhcmVhXCIpWzBdWzBdLnZhbHVlID0gXCJcIjtcbiAgICAgICAgZDMuc2VsZWN0KFwiI2pzb250ZXh0YXJlYVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHNlbGVjdGVkRWRpdFNvdXJjZSggXCJ0bGlzdFwiICk7XG5cbiAgICB9LCBmdW5jdGlvbihlcnJvcil7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzICR7Y3Vyck1pbmUubmFtZX0uIFN0YXR1cz0ke2Vycm9yLnN0YXR1c30uIEVycm9yPSR7ZXJyb3Iuc3RhdHVzVGV4dH0uIChJZiB0aGVyZSBpcyBubyBlcnJvciBtZXNzYWdlLCB0aGVuIGl0cyBwcm9iYWJseSBhIENPUlMgaXNzdWUuKWApO1xuICAgIH0pO1xufVxuXG4vLyBCZWdpbnMgYW4gZWRpdCwgYmFzZWQgb24gdXNlciBjb250cm9scy5cbmZ1bmN0aW9uIHN0YXJ0RWRpdCgpIHtcbiAgICAvLyBzZWxlY3RvciBmb3IgY2hvb3NpbmcgZWRpdCBpbnB1dCBzb3VyY2UsIGFuZCB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAgICBsZXQgc3JjU2VsZWN0b3IgPSBkMy5zZWxlY3RBbGwoJ1tuYW1lPVwiZWRpdFRhcmdldFwiXSBbbmFtZT1cImluXCJdJyk7XG4gICAgLy8gdGhlIGNob3NlbiBlZGl0IHNvdXJjZVxuICAgIGxldCBpbnB1dElkID0gc3JjU2VsZWN0b3JbMF1bMF0udmFsdWU7XG4gICAgLy8gdGhlIHF1ZXJ5IGlucHV0IGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0ZWQgc291cmNlXG4gICAgbGV0IHNyYyA9IGQzLnNlbGVjdChgIyR7aW5wdXRJZH0gW25hbWU9XCJpblwiXWApO1xuICAgIC8vIHRoZSBxdWVyeSBzdGFydGluZyBwb2ludFxuICAgIGxldCB2YWwgPSBzcmNbMF1bMF0udmFsdWVcbiAgICBpZiAoaW5wdXRJZCA9PT0gXCJ0bGlzdFwiKSB7XG4gICAgICAgIC8vIGEgc2F2ZWQgcXVlcnkgb3IgdGVtcGxhdGVcbiAgICAgICAgZWRpdFRlbXBsYXRlKGN1cnJNaW5lLnRlbXBsYXRlc1t2YWxdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJuZXdxY2xpc3RcIikge1xuICAgICAgICAvLyBhIG5ldyBxdWVyeSBmcm9tIGEgc2VsZWN0ZWQgc3RhcnRpbmcgY2xhc3NcbiAgICAgICAgbGV0IG50ID0gbmV3IFRlbXBsYXRlKCk7XG4gICAgICAgIG50LnNlbGVjdC5wdXNoKHZhbCtcIi5pZFwiKTtcbiAgICAgICAgZWRpdFRlbXBsYXRlKG50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5wdXRJZCA9PT0gXCJpbXBvcnR4bWxcIikge1xuICAgICAgICAvLyBpbXBvcnQgeG1sIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUocGFyc2VQYXRoUXVlcnkodmFsKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0SWQgPT09IFwiaW1wb3J0anNvblwiKSB7XG4gICAgICAgIC8vIGltcG9ydCBqc29uIHF1ZXJ5XG4gICAgICAgIHZhbCAmJiBlZGl0VGVtcGxhdGUoSlNPTi5wYXJzZSh2YWwpKTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB0aHJvdyBcIlVua25vd24gZWRpdCBzb3VyY2UuXCJcbn1cblxuLy8gXG5mdW5jdGlvbiBzZWxlY3RlZEVkaXRTb3VyY2Uoc2hvdyl7XG4gICAgZDMuc2VsZWN0QWxsKCdbbmFtZT1cImVkaXRUYXJnZXRcIl0gPiBkaXYub3B0aW9uJylcbiAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5pZCA9PT0gc2hvdyA/IG51bGwgOiBcIm5vbmVcIjsgfSk7XG59XG5cbi8vIFJlbW92ZXMgdGhlIGN1cnJlbnQgbm9kZSBhbmQgYWxsIGl0cyBkZXNjZW5kYW50cy5cbi8vXG5mdW5jdGlvbiByZW1vdmVOb2RlKG4pIHtcbiAgICBuLnJlbW92ZSgpO1xuICAgIGhpZGVEaWFsb2coKTtcbiAgICBzYXZlU3RhdGUobik7XG4gICAgdXBkYXRlKG4ucGFyZW50IHx8IG4pO1xufVxuXG4vLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgdGVtcGxhdGUgZnJvbSB0aGUgbGlzdC5cbi8vIEdldHMgdGhlIHRlbXBsYXRlIGZyb20gdGhlIGN1cnJlbnQgbWluZSBhbmQgYnVpbGRzIGEgc2V0IG9mIG5vZGVzXG4vLyBmb3IgZDMgdHJlZSBkaXNwbGF5LlxuLy9cbmZ1bmN0aW9uIGVkaXRUZW1wbGF0ZSAodCwgbm9zYXZlKSB7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBlZGl0b3Igd29ya3Mgb24gYSBjb3B5IG9mIHRoZSB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIGxldCBjdCA9IGN1cnJUZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZSh0LCBjdXJyTWluZS5tb2RlbCk7XG4gICAgLy9cbiAgICByb290ID0gY3QucXRyZWVcbiAgICByb290LngwID0gMDtcbiAgICByb290LnkwID0gaCAvIDI7XG4gICAgLy9cbiAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcblxuICAgIGlmICghIG5vc2F2ZSkgc2F2ZVN0YXRlKGN0LnF0cmVlKTtcblxuICAgIC8vIEZpbGwgaW4gdGhlIGJhc2ljIHRlbXBsYXRlIGluZm9ybWF0aW9uIChuYW1lLCB0aXRsZSwgZGVzY3JpcHRpb24sIGV0Yy4pXG4gICAgLy9cbiAgICB2YXIgdGkgPSBkMy5zZWxlY3QoXCIjdEluZm9cIik7XG4gICAgdmFyIHhmZXIgPSBmdW5jdGlvbihuYW1lLCBlbHQpeyBjdFtuYW1lXSA9IGVsdC52YWx1ZTsgdXBkYXRlVHRleHQoY3QpOyB9O1xuICAgIC8vIE5hbWUgKHRoZSBpbnRlcm5hbCB1bmlxdWUgbmFtZSlcbiAgICB0aS5zZWxlY3QoJ1tuYW1lPVwibmFtZVwiXSBpbnB1dCcpXG4gICAgICAgIC5hdHRyKFwidmFsdWVcIiwgY3QubmFtZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJuYW1lXCIsIHRoaXMpIH0pO1xuICAgIC8vIFRpdGxlICh3aGF0IHRoZSB1c2VyIHNlZXMpXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cInRpdGxlXCJdIGlucHV0JylcbiAgICAgICAgLmF0dHIoXCJ2YWx1ZVwiLCBjdC50aXRsZSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7IHhmZXIoXCJ0aXRsZVwiLCB0aGlzKSB9KTtcbiAgICAvLyBEZXNjcmlwdGlvbiAod2hhdCBpdCBkb2VzIC0gYSBsaXR0bGUgZG9jdW1lbnRhdGlvbikuXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImRlc2NyaXB0aW9uXCJdIHRleHRhcmVhJylcbiAgICAgICAgLnRleHQoY3QuZGVzY3JpcHRpb24pXG4gICAgICAgIC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpeyB4ZmVyKFwiZGVzY3JpcHRpb25cIiwgdGhpcykgfSk7XG4gICAgLy8gQ29tbWVudCAtIGZvciB3aGF0ZXZlciwgSSBndWVzcy4gXG4gICAgdGkuc2VsZWN0KCdbbmFtZT1cImNvbW1lbnRcIl0gdGV4dGFyZWEnKVxuICAgICAgICAudGV4dChjdC5jb21tZW50KVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXsgeGZlcihcImNvbW1lbnRcIiwgdGhpcykgfSk7XG5cbiAgICAvLyBMb2dpYyBleHByZXNzaW9uIC0gd2hpY2ggdGllcyB0aGUgaW5kaXZpZHVhbCBjb25zdHJhaW50cyB0b2dldGhlclxuICAgIGQzLnNlbGVjdCgnI3N2Z0NvbnRhaW5lciBbbmFtZT1cImxvZ2ljRXhwcmVzc2lvblwiXSBpbnB1dCcpXG4gICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBjdC5jb25zdHJhaW50TG9naWMgfSlcbiAgICAgICAgLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjdC5zZXRMb2dpY0V4cHJlc3Npb24odGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB4ZmVyKFwiY29uc3RyYWludExvZ2ljXCIsIHRoaXMpXG4gICAgICAgIH0pO1xuXG4gICAgLy8gQ2xlYXIgdGhlIHF1ZXJ5IGNvdW50XG4gICAgZDMuc2VsZWN0KFwiI3F1ZXJ5Y291bnQgc3BhblwiKS50ZXh0KFwiXCIpO1xuXG4gICAgLy9cbiAgICBoaWRlRGlhbG9nKCk7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG4vLyBFeHRlbmRzIHRoZSBwYXRoIGZyb20gY3Vyck5vZGUgdG8gcFxuLy8gQXJnczpcbi8vICAgY3Vyck5vZGUgKG5vZGUpIE5vZGUgdG8gZXh0ZW5kIGZyb21cbi8vICAgbW9kZSAoc3RyaW5nKSBvbmUgb2YgXCJzZWxlY3RcIiwgXCJjb25zdHJhaW5cIiBvciBcIm9wZW5cIlxuLy8gICBwIChzdHJpbmcpIE5hbWUgb2YgYW4gYXR0cmlidXRlLCByZWYsIG9yIGNvbGxlY3Rpb25cbi8vIFJldHVybnM6XG4vLyAgIG5vdGhpbmdcbi8vIFNpZGUgZWZmZWN0czpcbi8vICAgSWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IGFscmVhZHkgaW4gdGhlIGRpc3BsYXksIGl0IGVudGVyc1xuLy8gICBhcyBhIG5ldyBjaGlsZCAoZ3Jvd2luZyBvdXQgZnJvbSB0aGUgcGFyZW50IG5vZGUuXG4vLyAgIFRoZW4gdGhlIGRpYWxvZyBpcyBvcGVuZWQgb24gdGhlIGNoaWxkIG5vZGUuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rc2VsZWN0XCIgYnV0dG9uLCB0aGUgY2hpbGQgaXMgc2VsZWN0ZWQuXG4vLyAgIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBcIm9wZW4rY29uc3RyYWluXCIgYnV0dG9uLCBhIG5ldyBjb25zdHJhaW50IGlzIGFkZGVkIHRvIHRoZVxuLy8gICBjaGlsZCwgYW5kIHRoZSBjb25zdHJhaW50IGVkaXRvciBvcGVuZWQgIG9uIHRoYXQgY29uc3RyYWludC5cbi8vXG5mdW5jdGlvbiBzZWxlY3RlZE5leHQoY3Vyck5vZGUsIG1vZGUsIHApe1xuICAgIGxldCBuO1xuICAgIGxldCBjYztcbiAgICBsZXQgc2ZzO1xuICAgIGxldCBjdCA9IGN1cnJOb2RlLnRlbXBsYXRlO1xuICAgIGlmIChtb2RlID09PSBcInN1bW1hcnlmaWVsZHNcIikge1xuICAgICAgICBzZnMgPSBjdXJyTWluZS5zdW1tYXJ5RmllbGRzW2N1cnJOb2RlLm5vZGVUeXBlLm5hbWVdfHxbXTtcbiAgICAgICAgc2ZzLmZvckVhY2goZnVuY3Rpb24oc2YsIGkpe1xuICAgICAgICAgICAgc2YgPSBzZi5yZXBsYWNlKC9eW14uXSsvLCBjdXJyTm9kZS5wYXRoKTtcbiAgICAgICAgICAgIGxldCBtID0gY3QuYWRkUGF0aChzZiwgY3Vyck1pbmUubW9kZWwpO1xuICAgICAgICAgICAgaWYgKCEgbS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgbS5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwID0gY3Vyck5vZGUucGF0aCArIFwiLlwiICsgcDtcbiAgICAgICAgbiA9IGN0LmFkZFBhdGgocCwgY3Vyck1pbmUubW9kZWwgKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwic2VsZWN0ZWRcIilcbiAgICAgICAgICAgICFuLmlzU2VsZWN0ZWQgJiYgbi5zZWxlY3QoKTtcbiAgICAgICAgaWYgKG1vZGUgPT09IFwiY29uc3RyYWluZWRcIikge1xuICAgICAgICAgICAgY2MgPSBuLmFkZENvbnN0cmFpbnQoKVxuICAgICAgICB9XG4gICAgfVxuICAgIGhpZGVEaWFsb2coKTtcbiAgICBpZiAobW9kZSAhPT0gXCJvcGVuXCIpXG4gICAgICAgIHNhdmVTdGF0ZShjdXJyTm9kZSk7XG4gICAgaWYgKG1vZGUgIT09IFwic3VtbWFyeWZpZWxkc1wiKSBcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2hvd0RpYWxvZyhuKTtcbiAgICAgICAgICAgIGNjICYmIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBlZGl0Q29uc3RyYWludChjYywgbilcbiAgICAgICAgICAgIH0sIGFuaW1hdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgfSwgYW5pbWF0aW9uRHVyYXRpb24pO1xuICAgIHVwZGF0ZShjdXJyTm9kZSk7XG4gICAgXG59XG4vLyBSZXR1cm5zICB0aGUgRE9NIGVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gZGF0YSBvYmplY3QuXG4vL1xuZnVuY3Rpb24gZmluZERvbUJ5RGF0YU9iaihkKXtcbiAgICB2YXIgeCA9IGQzLnNlbGVjdEFsbChcIi5ub2RlZ3JvdXAgLm5vZGVcIikuZmlsdGVyKGZ1bmN0aW9uKGRkKXsgcmV0dXJuIGRkID09PSBkOyB9KTtcbiAgICByZXR1cm4geFswXVswXTtcbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUNFaW5wdXRzKGMsIG9wKXtcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVswXVswXS52YWx1ZSA9IG9wIHx8IGMub3A7XG4gICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cImNvZGVcIl0nKS50ZXh0KGMuY29kZSk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMuY3R5cGU9PT1cIm51bGxcIiA/IFwiXCIgOiBjLnZhbHVlO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVswXVswXS52YWx1ZSA9IGRlZXBjKGMudmFsdWVzKTtcbn1cblxuLy8gQXJnczpcbi8vICAgc2VsZWN0b3IgKHN0cmluZykgRm9yIHNlbGVjdGluZyB0aGUgPHNlbGVjdD4gZWxlbWVudFxuLy8gICBkYXRhIChsaXN0KSBEYXRhIHRvIGJpbmQgdG8gb3B0aW9uc1xuLy8gICBjZmcgKG9iamVjdCkgQWRkaXRpb25hbCBvcHRpb25hbCBjb25maWdzOlxuLy8gICAgICAgdGl0bGUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIGZvciBzZXR0aW5nIHRoZSB0ZXh0IG9mIHRoZSBvcHRpb24uIFxuLy8gICAgICAgdmFsdWUgLSBmdW5jdGlvbiBvciBsaXRlcmFsIHNldHRpbmcgdGhlIHZhbHVlIG9mIHRoZSBvcHRpb25cbi8vICAgICAgIHNlbGVjdGVkIC0gZnVuY3Rpb24gb3IgYXJyYXkgb3Igc3RyaW5nIGZvciBkZWNpZGluZyB3aGljaCBvcHRpb24ocykgYXJlIHNlbGVjdGVkXG4vLyAgICAgICAgICBJZiBmdW5jdGlvbiwgY2FsbGVkIGZvciBlYWNoIG9wdGlvbi5cbi8vICAgICAgICAgIElmIGFycmF5LCBzcGVjaWZpZXMgdGhlIHZhbHVlcyB0byBzZWxlY3QuXG4vLyAgICAgICAgICBJZiBzdHJpbmcsIHNwZWNpZmllcyB3aGljaCB2YWx1ZSBpcyBzZWxlY3RlZFxuLy8gICAgICAgZW1wdHlNZXNzYWdlIC0gYSBtZXNzYWdlIHRvIHNob3cgaWYgdGhlIGRhdGEgbGlzdCBpcyBlbXB0eVxuLy8gICAgICAgbXVsdGlwbGUgLSBpZiB0cnVlLCBtYWtlIGl0IGEgbXVsdGktc2VsZWN0IGxpc3Rcbi8vXG5mdW5jdGlvbiBpbml0T3B0aW9uTGlzdChzZWxlY3RvciwgZGF0YSwgY2ZnKXtcbiAgICBcbiAgICBjZmcgPSBjZmcgfHwge307XG5cbiAgICB2YXIgaWRlbnQgPSAoeD0+eCk7XG4gICAgdmFyIG9wdHM7XG4gICAgaWYoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApe1xuICAgICAgICBvcHRzID0gZDMuc2VsZWN0KHNlbGVjdG9yKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcIm9wdGlvblwiKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSk7XG4gICAgICAgIG9wdHMuZW50ZXIoKS5hcHBlbmQoJ29wdGlvbicpO1xuICAgICAgICBvcHRzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgLy9cbiAgICAgICAgb3B0cy5hdHRyKFwidmFsdWVcIiwgY2ZnLnZhbHVlIHx8IGlkZW50KVxuICAgICAgICAgICAgLnRleHQoY2ZnLnRpdGxlIHx8IGlkZW50KVxuICAgICAgICAgICAgLmF0dHIoXCJzZWxlY3RlZFwiLCBudWxsKVxuICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBudWxsKTtcbiAgICAgICAgaWYgKHR5cGVvZihjZmcuc2VsZWN0ZWQpID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIGZ1bmN0aW9uIHNheXMgc29cbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkKGQpfHxudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNmZy5zZWxlY3RlZCkpIHtcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGlmIHRoZSBvcHQncyB2YWx1ZSBpcyBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gY2ZnLnNlbGVjdGVkLmluZGV4T2YoKGNmZy52YWx1ZSB8fCBpZGVudCkoZCkpICE9IC0xIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNmZy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gc2VsZWN0ZWQgaWYgdGhlIG9wdCdzIHZhbHVlIG1hdGNoZXNcbiAgICAgICAgICAgIG9wdHMuYXR0cihcInNlbGVjdGVkXCIsIGQgPT4gKChjZmcudmFsdWUgfHwgaWRlbnQpKGQpID09PSBjZmcuc2VsZWN0ZWQpIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZDMuc2VsZWN0KHNlbGVjdG9yKVswXVswXS5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb3B0cyA9IGQzLnNlbGVjdChzZWxlY3RvcilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgICAgIC5kYXRhKFtjZmcuZW1wdHlNZXNzYWdlfHxcImVtcHR5IGxpc3RcIl0pO1xuICAgICAgICBvcHRzLmVudGVyKCkuYXBwZW5kKCdvcHRpb24nKTtcbiAgICAgICAgb3B0cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIG9wdHMudGV4dChpZGVudCkuYXR0cihcImRpc2FibGVkXCIsIHRydWUpO1xuICAgIH1cbiAgICAvLyBzZXQgbXVsdGkgc2VsZWN0IChvciBub3QpXG4gICAgZDMuc2VsZWN0KHNlbGVjdG9yKS5hdHRyKFwibXVsdGlwbGVcIiwgY2ZnLm11bHRpcGxlIHx8IG51bGwpO1xuICAgIC8vIGFsbG93IGNhbGxlciB0byBjaGFpblxuICAgIHJldHVybiBvcHRzO1xufVxuXG4vLyBJbml0aWFsaXplcyB0aGUgaW5wdXQgZWxlbWVudHMgaW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIGZyb20gdGhlIGdpdmVuIGNvbnN0cmFpbnQuXG4vL1xuZnVuY3Rpb24gaW5pdENFaW5wdXRzKG4sIGMsIGN0eXBlKSB7XG5cbiAgICAvLyBQb3B1bGF0ZSB0aGUgb3BlcmF0b3Igc2VsZWN0IGxpc3Qgd2l0aCBvcHMgYXBwcm9wcmlhdGUgZm9yIHRoZSBwYXRoXG4gICAgLy8gYXQgdGhpcyBub2RlLlxuICAgIGlmICghY3R5cGUpIFxuICAgICAgaW5pdE9wdGlvbkxpc3QoXG4gICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cIm9wXCJdJywgXG4gICAgICAgIE9QUy5maWx0ZXIoZnVuY3Rpb24ob3ApeyByZXR1cm4gbi5vcFZhbGlkKG9wKTsgfSksXG4gICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZCA9PiBkLm9wLFxuICAgICAgICB0aXRsZTogZCA9PiBkLm9wLFxuICAgICAgICBzZWxlY3RlZDpjLm9wXG4gICAgICAgIH0pO1xuICAgIC8vXG4gICAgLy9cbiAgICBjdHlwZSA9IGN0eXBlIHx8IGMuY3R5cGU7XG5cbiAgICBsZXQgY2UgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKTtcbiAgICBsZXQgc216ZCA9IGNlLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIpO1xuICAgIGNlLmF0dHIoXCJjbGFzc1wiLCBcIm9wZW4gXCIgKyBjdHlwZSlcbiAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsICBzbXpkKVxuICAgICAgICAuY2xhc3NlZChcImJpb2VudGl0eVwiLCAgbi5pc0Jpb0VudGl0eSk7XG4gXG4gICAgLy9cbiAgICBpZiAoY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBpbnB1dFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZSA9IGMudmFsdWU7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIFtcIkFueVwiXS5jb25jYXQoY3Vyck1pbmUub3JnYW5pc21MaXN0KSxcbiAgICAgICAgICAgIHsgc2VsZWN0ZWQ6IGMuZXh0cmFWYWx1ZSB9XG4gICAgICAgICAgICApO1xuICAgIH1cbiAgICBlbHNlIGlmIChjdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBvcHRpb24gbGlzdCBvZiBzdWJjbGFzcyBuYW1lc1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBuLnBhcmVudCA/IGdldFN1YmNsYXNzZXMobi5wY29tcC5raW5kID8gbi5wY29tcC50eXBlIDogbi5wY29tcCkgOiBbXSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IGQgPT4gZC5uYW1lLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBzdWJjbGFzc2VzKVwiLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uKGQpeyBcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBvbmUgd2hvc2UgbmFtZSBtYXRjaGVzIHRoZSBub2RlJ3MgdHlwZSBhbmQgc2V0IGl0cyBzZWxlY3RlZCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGQubmFtZSA9PT0gKChuLnN1YmNsYXNzQ29uc3RyYWludCB8fCBuLnB0eXBlKS5uYW1lIHx8IG4ucHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGN0eXBlID09PSBcImxpc3RcIikge1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBjdXJyTWluZS5saXN0cy5maWx0ZXIoZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGN1cnJOb2RlLmxpc3RWYWxpZChsKTsgfSksXG4gICAgICAgICAgICB7IG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiBkID0+IGQudGl0bGUsXG4gICAgICAgICAgICB0aXRsZTogZCA9PiBkLnRpdGxlLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihObyBsaXN0cylcIixcbiAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgJyNjb25zdHJhaW50RWRpdG9yIHNlbGVjdFtuYW1lPVwidmFsdWVzXCJdJyxcbiAgICAgICAgICAgIGMuc3VtbWFyeUxpc3QgfHwgYy52YWx1ZXMgfHwgW2MudmFsdWVdLFxuICAgICAgICAgICAgeyBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBsaXN0XCIsXG4gICAgICAgICAgICBzZWxlY3RlZDogYy52YWx1ZXMgfHwgW2MudmFsdWVdXG4gICAgICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgbGV0IGF0dHIgPSAobi5wYXJlbnQuc3ViY2xhc3NDb25zdHJhaW50IHx8IG4ucGFyZW50LnB0eXBlKS5uYW1lICsgXCIuXCIgKyBuLnBjb21wLm5hbWU7XG4gICAgICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgaW5wdXRbbmFtZT1cInZhbHVlXCJdJylbMF1bMF0udmFsdWUgPSBjLnZhbHVlO1xuICAgICAgICBpbml0T3B0aW9uTGlzdChcbiAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBzZWxlY3RbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICBjLnN1bW1hcnlMaXN0IHx8IFtjLnZhbHVlXSxcbiAgICAgICAgICAgIHsgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIHJlc3VsdHNcIixcbiAgICAgICAgICAgIHNlbGVjdGVkOiBjLnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGN0eXBlID09PSBcIm51bGxcIikge1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJVbnJlY29nbml6ZWQgY3R5cGU6IFwiICsgY3R5cGVcbiAgICB9XG4gICAgXG59XG5cbi8vIE9wZW5zIHRoZSBjb25zdHJhaW50IGVkaXRvciBmb3IgY29uc3RyYWludCBjIG9mIG5vZGUgbi5cbi8vXG5mdW5jdGlvbiBvcGVuQ29uc3RyYWludEVkaXRvcihjLCBuKXtcblxuICAgIC8vIE5vdGUgaWYgdGhpcyBpcyBoYXBwZW5pbmcgYXQgdGhlIHJvb3Qgbm9kZVxuICAgIHZhciBpc3Jvb3QgPSAhIG4ucGFyZW50O1xuIFxuICAgIC8vIEZpbmQgdGhlIGRpdiBmb3IgY29uc3RyYWludCBjIGluIHRoZSBkaWFsb2cgbGlzdGluZy4gV2Ugd2lsbFxuICAgIC8vIG9wZW4gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG9uIHRvcCBvZiBpdC5cbiAgICB2YXIgY2RpdjtcbiAgICBkMy5zZWxlY3RBbGwoXCIjZGlhbG9nIC5jb25zdHJhaW50XCIpXG4gICAgICAgIC5lYWNoKGZ1bmN0aW9uKGNjKXsgaWYoY2MgPT09IGMpIGNkaXYgPSB0aGlzOyB9KTtcbiAgICAvLyBib3VuZGluZyBib3ggb2YgdGhlIGNvbnN0cmFpbnQncyBjb250YWluZXIgZGl2XG4gICAgdmFyIGNiYiA9IGNkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgLy8gYm91bmRpbmcgYm94IG9mIHRoZSBhcHAncyBtYWluIGJvZHkgZWxlbWVudFxuICAgIHZhciBkYmIgPSBkMy5zZWxlY3QoXCIjcWJcIilbMF1bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgLy8gcG9zaXRpb24gdGhlIGNvbnN0cmFpbnQgZWRpdG9yIG92ZXIgdGhlIGNvbnN0cmFpbnQgaW4gdGhlIGRpYWxvZ1xuICAgIHZhciBjZWQgPSBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIGMuY3R5cGUpXG4gICAgICAgIC5jbGFzc2VkKFwib3BlblwiLCB0cnVlKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6ZWRcIiwgYy5zdW1tYXJ5TGlzdClcbiAgICAgICAgLnN0eWxlKFwidG9wXCIsIChjYmIudG9wIC0gZGJiLnRvcCkrXCJweFwiKVxuICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIChjYmIubGVmdCAtIGRiYi5sZWZ0KStcInB4XCIpXG4gICAgICAgIDtcblxuICAgIC8vIEluaXQgdGhlIGNvbnN0cmFpbnQgY29kZSBcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwiY29kZVwiXScpXG4gICAgICAgIC50ZXh0KGMuY29kZSk7XG5cbiAgICBpbml0Q0VpbnB1dHMobiwgYyk7XG5cbiAgICAvLyBXaGVuIHVzZXIgc2VsZWN0cyBhbiBvcGVyYXRvciwgYWRkIGEgY2xhc3MgdG8gdGhlIGMuZS4ncyBjb250YWluZXJcbiAgICBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwib3BcIl0nKVxuICAgICAgICAub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBvcCA9IE9QSU5ERVhbdGhpcy52YWx1ZV07XG4gICAgICAgICAgICBpbml0Q0VpbnB1dHMobiwgYywgb3AuY3R5cGUpO1xuICAgICAgICB9KVxuICAgICAgICA7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLmNhbmNlbFwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpeyBjYW5jZWxDb25zdHJhaW50RWRpdG9yKG4sIGMpIH0pO1xuXG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3IgLmJ1dHRvbi5zYXZlXCIpXG4gICAgICAgIC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCl7IHNhdmVDb25zdHJhaW50RWRpdHMobiwgYykgfSk7XG5cbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvciAuYnV0dG9uLnN5bmNcIilcbiAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXsgZ2VuZXJhdGVPcHRpb25MaXN0KG4sIGMpLnRoZW4oKCkgPT4gaW5pdENFaW5wdXRzKG4sIGMpKSB9KTtcblxufVxuLy8gR2VuZXJhdGVzIGFuIG9wdGlvbiBsaXN0IG9mIGRpc3RpbmN0IHZhbHVlcyB0byBzZWxlY3QgZnJvbS5cbi8vIEFyZ3M6XG4vLyAgIG4gIChub2RlKSAgVGhlIG5vZGUgd2UncmUgd29ya2luZyBvbi4gTXVzdCBiZSBhbiBhdHRyaWJ1dGUgbm9kZS5cbi8vICAgYyAgKGNvbnN0cmFpbnQpIFRoZSBjb25zdHJhaW50IHRvIGdlbmVyYXRlIHRoZSBsaXN0IGZvci5cbi8vIE5COiBPbmx5IHZhbHVlIGFuZCBtdWx0aXZhdWUgY29uc3RyYWludHMgY2FuIGJlIHN1bW1hcml6ZWQgaW4gdGhpcyB3YXkuICBcbmZ1bmN0aW9uIGdlbmVyYXRlT3B0aW9uTGlzdChuLCBjKXtcbiAgICAvLyBUbyBnZXQgdGhlIGxpc3QsIHdlIGhhdmUgdG8gcnVuIHRoZSBjdXJyZW50IHF1ZXJ5IHdpdGggYW4gYWRkaXRpb25hbCBwYXJhbWV0ZXIsIFxuICAgIC8vIHN1bW1hcnlQYXRoLCB3aGljaCBpcyB0aGUgcGF0aCB3ZSB3YW50IGRpc3RpbmN0IHZhbHVlcyBmb3IuIFxuICAgIC8vIEJVVCBOT1RFLCB3ZSBoYXZlIHRvIHJ1biB0aGUgcXVlcnkgKndpdGhvdXQqIGNvbnN0cmFpbnQgYyEhXG4gICAgLy8gRXhhbXBsZTogc3VwcG9zZSB3ZSBoYXZlIGEgcXVlcnkgd2l0aCBhIGNvbnN0cmFpbnQgYWxsZWxlVHlwZT1UYXJnZXRlZCxcbiAgICAvLyBhbmQgd2Ugd2FudCB0byBjaGFuZ2UgaXQgdG8gU3BvbnRhbmVvdXMuIFdlIG9wZW4gdGhlIGMuZS4sIGFuZCB0aGVuIGNsaWNrIHRoZVxuICAgIC8vIHN5bmMgYnV0dG9uIHRvIGdldCBhIGxpc3QuIElmIHdlIHJ1biB0aGUgcXVlcnkgd2l0aCBjIGludGFjdCwgd2UnbGwgZ2V0IGEgbGlzdFxuICAgIC8vIGNvbnRhaW5pbmcgb25seSBcIlRhcmdldGVkXCIuIERvaCFcbiAgICAvLyBBTk9USEVSIE5PVEU6IHRoZSBwYXRoIGluIHN1bW1hcnlQYXRoIG11c3QgYmUgcGFydCBvZiB0aGUgcXVlcnkgcHJvcGVyLiBUaGUgYXBwcm9hY2hcbiAgICAvLyBoZXJlIGlzIHRvIGVuc3VyZSBpdCBieSBhZGRpbmcgdGhlIHBhdGggdG8gdGhlIHZpZXcgbGlzdC5cblxuICAgIC8qXG4gICAgLy8gU2F2ZSB0aGlzIGNob2ljZSBpbiBsb2NhbFN0b3JhZ2VcbiAgICBsZXQgYXR0ciA9IChuLnBhcmVudC5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wYXJlbnQucHR5cGUpLm5hbWUgKyBcIi5cIiArIG4ucGNvbXAubmFtZTtcbiAgICBsZXQga2V5ID0gXCJhdXRvY29tcGxldGVcIjtcbiAgICBsZXQgbHN0O1xuICAgIGxzdCA9IGdldExvY2FsKGtleSwgdHJ1ZSwgW10pO1xuICAgIGlmKGxzdC5pbmRleE9mKGF0dHIpID09PSAtMSkgbHN0LnB1c2goYXR0cik7XG4gICAgc2V0TG9jYWwoa2V5LCBsc3QsIHRydWUpO1xuICAgICovXG5cbiAgICAvLyBidWlsZCB0aGUgcXVlcnlcbiAgICBsZXQgcCA9IG4ucGF0aDsgLy8gd2hhdCB3ZSB3YW50IHRvIHN1bW1hcml6ZVxuICAgIC8vXG4gICAgbGV0IGxleCA9IG4udGVtcGxhdGUuY29uc3RyYWludExvZ2ljOyAvLyBzYXZlIGNvbnN0cmFpbnQgbG9naWMgZXhwclxuICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTsgLy8gdGVtcG9yYXJpbHkgcmVtb3ZlIHRoZSBjb25zdHJhaW50XG4gICAgbGV0IGogPSBuLnRlbXBsYXRlLnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gICAgai5zZWxlY3QucHVzaChwKTsgLy8gbWFrZSBzdXJlIHAgaXMgcGFydCBvZiB0aGUgcXVlcnlcbiAgICBuLnRlbXBsYXRlLmNvbnN0cmFpbnRMb2dpYyA9IGxleDsgLy8gcmVzdG9yZSB0aGUgbG9naWMgZXhwclxuICAgIG4uYWRkQ29uc3RyYWludChjKTsgLy8gcmUtYWRkIHRoZSBjb25zdHJhaW50XG5cbiAgICAvLyBidWlsZCB0aGUgdXJsXG4gICAgbGV0IHggPSBqc29uMnhtbChqLCB0cnVlKTtcbiAgICBsZXQgZSA9IGVuY29kZVVSSUNvbXBvbmVudCh4KTtcbiAgICBsZXQgdXJsID0gYCR7Y3Vyck1pbmUudXJsfS9zZXJ2aWNlL3F1ZXJ5L3Jlc3VsdHM/c3VtbWFyeVBhdGg9JHtwfSZmb3JtYXQ9anNvbnJvd3MmcXVlcnk9JHtlfWBcbiAgICBsZXQgdGhyZXNob2xkID0gMjUwO1xuXG4gICAgLy8gY3ZhbHMgY29udGFpbnRzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUocylcbiAgICBsZXQgY3ZhbHMgPSBbXTtcbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpIHtcbiAgICAgICAgY3ZhbHMgPSBjLnZhbHVlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoYy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIGN2YWxzID0gWyBjLnZhbHVlIF07XG4gICAgfVxuXG4gICAgLy8gc2lnbmFsIHRoYXQgd2UncmUgc3RhcnRpbmdcbiAgICBkMy5zZWxlY3QoXCIjY29uc3RyYWludEVkaXRvclwiKVxuICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIHRydWUpO1xuICAgIC8vIGdvIVxuICAgIGxldCBwcm9tID0gZDNqc29uUHJvbWlzZSh1cmwpLnRoZW4oZnVuY3Rpb24oanNvbil7XG4gICAgICAgIC8vIFRoZSBsaXN0IG9mIHZhbHVlcyBpcyBpbiBqc29uLnJldWx0cy5cbiAgICAgICAgLy8gRWFjaCBsaXN0IGl0ZW0gbG9va3MgbGlrZTogeyBpdGVtOiBcInNvbWVzdHJpbmdcIiwgY291bnQ6IDE3IH1cbiAgICAgICAgLy8gKFllcywgd2UgZ2V0IGNvdW50cyBmb3IgZnJlZSEgT3VnaHQgdG8gbWFrZSB1c2Ugb2YgdGhpcy4pXG4gICAgICAgIGxldCByZXMgPSBqc29uLnJlc3VsdHMubWFwKHIgPT4gci5pdGVtKS5zb3J0KCk7XG4gICAgICAgIC8vIGNoZWNrIHNpemUgb2YgcmVzdWx0XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAvLyB0b28gYmlnLiBhc2sgdXNlciB3aGF0IHRvIGRvLlxuICAgICAgICAgICAgbGV0IGFucyA9IHByb21wdChgVGhlcmUgYXJlICR7cmVzLmxlbmd0aH0gcmVzdWx0cywgd2hpY2ggZXhjZWVkcyB0aGUgdGhyZXNob2xkIG9mICR7dGhyZXNob2xkfS4gSG93IG1hbnkgZG8geW91IHdhbnQgdG8gc2hvdz9gLCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgaWYgKGFucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIHVzZXIgc2V6IGNhbmNlbFxuICAgICAgICAgICAgICAgIC8vIFNpZ25hbCB0aGF0IHdlJ3JlIGRvbmUuXG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5zID0gcGFyc2VJbnQoYW5zKTtcbiAgICAgICAgICAgIGlmIChpc05hTihhbnMpIHx8IGFucyA8PSAwKSByZXR1cm47XG4gICAgICAgICAgICAvLyB1c2VyIHdhbnRzIHRoaXMgbWFueSByZXN1bHRzXG4gICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgYW5zKTtcbiAgICAgICAgfVxuICAgICAgICAvL1xuICAgICAgICBjLnN1bW1hcnlMaXN0ID0gcmVzO1xuXG4gICAgICAgIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAgICAgICAuY2xhc3NlZChcInN1bW1hcml6aW5nXCIsIGZhbHNlKVxuICAgICAgICAgICAgLmNsYXNzZWQoXCJzdW1tYXJpemVkXCIsIHRydWUpO1xuXG4gICAgICAgIGluaXRPcHRpb25MaXN0KFxuICAgICAgICAgICAgICAgICcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cInZhbHVlc1wiXScsXG4gICAgICAgICAgICAgICAgYy5zdW1tYXJ5TGlzdCwgXG4gICAgICAgICAgICAgICAgeyBzZWxlY3RlZDogZCA9PiBjdmFscy5pbmRleE9mKGQpICE9PSAtMSB8fCBudWxsIH0pO1xuXG4gICAgfSk7XG4gICAgcmV0dXJuIHByb207IC8vIHNvIGNhbGxlciBjYW4gY2hhaW5cbn1cbi8vXG5mdW5jdGlvbiBjYW5jZWxDb25zdHJhaW50RWRpdG9yKG4sIGMpe1xuICAgIGlmICghIGMuc2F2ZWQpIHtcbiAgICAgICAgbi5yZW1vdmVDb25zdHJhaW50KGMpO1xuICAgICAgICBzYXZlU3RhdGUobik7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbn1cbmZ1bmN0aW9uIGhpZGVDb25zdHJhaW50RWRpdG9yKCl7XG4gICAgZDMuc2VsZWN0KFwiI2NvbnN0cmFpbnRFZGl0b3JcIikuY2xhc3NlZChcIm9wZW5cIiwgbnVsbCk7XG59XG4vL1xuZnVuY3Rpb24gZWRpdENvbnN0cmFpbnQoYywgbil7XG4gICAgb3BlbkNvbnN0cmFpbnRFZGl0b3IoYywgbik7XG59XG4vL1xuZnVuY3Rpb24gc2F2ZUNvbnN0cmFpbnRFZGl0cyhuLCBjKXtcbiAgICAvL1xuICAgIGxldCBvID0gZDMuc2VsZWN0KCcjY29uc3RyYWludEVkaXRvciBbbmFtZT1cIm9wXCJdJylbMF1bMF0udmFsdWU7XG4gICAgYy5zZXRPcChvKTtcbiAgICBjLnNhdmVkID0gdHJ1ZTtcbiAgICAvL1xuICAgIGxldCB2YWwgPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yIFtuYW1lPVwidmFsdWVcIl0nKVswXVswXS52YWx1ZTtcbiAgICBsZXQgdmFscyA9IFtdO1xuICAgIGQzLnNlbGVjdCgnI2NvbnN0cmFpbnRFZGl0b3IgW25hbWU9XCJ2YWx1ZXNcIl0nKVxuICAgICAgICAuc2VsZWN0QWxsKFwib3B0aW9uXCIpXG4gICAgICAgIC5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB2YWxzLnB1c2godGhpcy52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgbGV0IHogPSBkMy5zZWxlY3QoJyNjb25zdHJhaW50RWRpdG9yJykuY2xhc3NlZChcInN1bW1hcml6ZWRcIik7XG5cbiAgICBpZiAoYy5jdHlwZSA9PT0gXCJudWxsXCIpe1xuICAgICAgICBjLnZhbHVlID0gYy50eXBlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgYy50eXBlID0gdmFsc1swXVxuICAgICAgICBjLnZhbHVlID0gYy52YWx1ZXMgPSBudWxsO1xuICAgICAgICBuLnNldFN1YmNsYXNzQ29uc3RyYWludChjLnR5cGUpXG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibG9va3VwXCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHZhbDtcbiAgICAgICAgYy52YWx1ZXMgPSBjLnR5cGUgPSBudWxsO1xuICAgICAgICBjLmV4dHJhVmFsdWUgPSB2YWxzWzBdID09PSBcIkFueVwiID8gbnVsbCA6IHZhbHNbMF07XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibGlzdFwiKSB7XG4gICAgICAgIGMudmFsdWUgPSB2YWxzWzBdO1xuICAgICAgICBjLnZhbHVlcyA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwibXVsdGl2YWx1ZVwiKSB7XG4gICAgICAgIGMudmFsdWVzID0gdmFscztcbiAgICAgICAgYy52YWx1ZSA9IGMudHlwZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMuY3R5cGUgPT09IFwicmFuZ2VcIikge1xuICAgICAgICBjLnZhbHVlcyA9IHZhbHM7XG4gICAgICAgIGMudmFsdWUgPSBjLnR5cGUgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmIChjLmN0eXBlID09PSBcInZhbHVlXCIpIHtcbiAgICAgICAgYy52YWx1ZSA9IHogPyB2YWxzWzBdIDogdmFsO1xuICAgICAgICBjLnR5cGUgPSBjLnZhbHVlcyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBcIlVua25vd24gY3R5cGU6IFwiK2MuY3R5cGU7XG4gICAgfVxuICAgIGhpZGVDb25zdHJhaW50RWRpdG9yKCk7XG4gICAgc2hvd0RpYWxvZyhuLCBudWxsLCB0cnVlKTtcbiAgICBzYXZlU3RhdGUobik7XG4gICAgdXBkYXRlKG4pO1xufVxuXG4vLyBPcGVucyBhIGRpYWxvZyBvbiB0aGUgc3BlY2lmaWVkIG5vZGUuXG4vLyBBbHNvIG1ha2VzIHRoYXQgbm9kZSB0aGUgY3VycmVudCBub2RlLlxuLy8gQXJnczpcbi8vICAgbiAgICB0aGUgbm9kZVxuLy8gICBlbHQgIHRoZSBET00gZWxlbWVudCAoZS5nLiBhIGNpcmNsZSlcbi8vIFJldHVybnNcbi8vICAgc3RyaW5nXG4vLyBTaWRlIGVmZmVjdDpcbi8vICAgc2V0cyBnbG9iYWwgY3Vyck5vZGVcbi8vXG5mdW5jdGlvbiBzaG93RGlhbG9nKG4sIGVsdCwgcmVmcmVzaE9ubHkpe1xuICBpZiAoIWVsdCkgZWx0ID0gZmluZERvbUJ5RGF0YU9iaihuKTtcbiAgaGlkZUNvbnN0cmFpbnRFZGl0b3IoKTtcbiBcbiAgLy8gU2V0IHRoZSBnbG9iYWwgY3Vyck5vZGVcbiAgY3Vyck5vZGUgPSBuO1xuICB2YXIgaXNyb290ID0gISBjdXJyTm9kZS5wYXJlbnQ7XG4gIC8vIE1ha2Ugbm9kZSB0aGUgZGF0YSBvYmogZm9yIHRoZSBkaWFsb2dcbiAgdmFyIGRpYWxvZyA9IGQzLnNlbGVjdChcIiNkaWFsb2dcIikuZGF0dW0obik7XG4gIC8vIENhbGN1bGF0ZSBkaWFsb2cncyBwb3NpdGlvblxuICB2YXIgZGJiID0gZGlhbG9nWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgZWJiID0gZWx0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgYmJiID0gZDMuc2VsZWN0KFwiI3FiXCIpWzBdWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgdCA9IChlYmIudG9wIC0gYmJiLnRvcCkgKyBlYmIud2lkdGgvMjtcbiAgdmFyIGIgPSAoYmJiLmJvdHRvbSAtIGViYi5ib3R0b20pICsgZWJiLndpZHRoLzI7XG4gIHZhciBsID0gKGViYi5sZWZ0IC0gYmJiLmxlZnQpICsgZWJiLmhlaWdodC8yO1xuICB2YXIgZGlyID0gXCJkXCIgOyAvLyBcImRcIiBvciBcInVcIlxuICAvLyBOQjogY2FuJ3QgZ2V0IG9wZW5pbmcgdXAgdG8gd29yaywgc28gaGFyZCB3aXJlIGl0IHRvIGRvd24uIDotXFxcblxuICAvL1xuICBkaWFsb2dcbiAgICAgIC5zdHlsZShcImxlZnRcIiwgbCtcInB4XCIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIiwgcmVmcmVzaE9ubHk/XCJzY2FsZSgxKVwiOlwic2NhbGUoMWUtNilcIilcbiAgICAgIC5jbGFzc2VkKFwiaGlkZGVuXCIsIGZhbHNlKVxuICAgICAgLmNsYXNzZWQoXCJpc3Jvb3RcIiwgaXNyb290KVxuICAgICAgO1xuICBpZiAoZGlyID09PSBcImRcIilcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB0K1wicHhcIilcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm0tb3JpZ2luXCIsIFwiMCUgMCVcIikgO1xuICBlbHNlXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgbnVsbClcbiAgICAgICAgICAuc3R5bGUoXCJib3R0b21cIiwgYitcInB4XCIpXG4gICAgICAgICAgLnN0eWxlKFwidHJhbnNmb3JtLW9yaWdpblwiLCBcIjAlIDEwMCVcIikgO1xuXG4gIC8vIFNldCB0aGUgZGlhbG9nIHRpdGxlIHRvIG5vZGUgbmFtZVxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cImRpYWxvZ1RpdGxlXCJdIHNwYW4nKVxuICAgICAgLnRleHQobi5uYW1lKTtcbiAgLy8gU2hvdyB0aGUgZnVsbCBwYXRoXG4gIGRpYWxvZy5zZWxlY3QoJ1tuYW1lPVwiaGVhZGVyXCJdIFtuYW1lPVwiZnVsbFBhdGhcIl0gZGl2JylcbiAgICAgIC50ZXh0KG4ucGF0aCk7XG4gIC8vIFR5cGUgYXQgdGhpcyBub2RlXG4gIHZhciB0cCA9IG4ucHR5cGUubmFtZSB8fCBuLnB0eXBlO1xuICB2YXIgc3RwID0gKG4uc3ViY2xhc3NDb25zdHJhaW50ICYmIG4uc3ViY2xhc3NDb25zdHJhaW50Lm5hbWUpIHx8IG51bGw7XG4gIHZhciB0c3RyaW5nID0gc3RwICYmIGA8c3BhbiBzdHlsZT1cImNvbG9yOiBwdXJwbGU7XCI+JHtzdHB9PC9zcGFuPiAoJHt0cH0pYCB8fCB0cFxuICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cImhlYWRlclwiXSBbbmFtZT1cInR5cGVcIl0gZGl2JylcbiAgICAgIC5odG1sKHRzdHJpbmcpO1xuXG4gIC8vIFdpcmUgdXAgYWRkIGNvbnN0cmFpbnQgYnV0dG9uXG4gIGRpYWxvZy5zZWxlY3QoXCIjZGlhbG9nIC5jb25zdHJhaW50U2VjdGlvbiAuYWRkLWJ1dHRvblwiKVxuICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGMgPSBuLmFkZENvbnN0cmFpbnQoKTtcbiAgICAgICAgICAgIHNhdmVTdGF0ZShuKTtcbiAgICAgICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICBlZGl0Q29uc3RyYWludChjLCBuKTtcbiAgICAgICAgfSk7XG5cbiAgLy8gRmlsbCBvdXQgdGhlIGNvbnN0cmFpbnRzIHNlY3Rpb24uIEZpcnN0LCBzZWxlY3QgYWxsIGNvbnN0cmFpbnRzLlxuICB2YXIgY29uc3RycyA9IGRpYWxvZy5zZWxlY3QoXCIuY29uc3RyYWludFNlY3Rpb25cIilcbiAgICAgIC5zZWxlY3RBbGwoXCIuY29uc3RyYWludFwiKVxuICAgICAgLmRhdGEobi5jb25zdHJhaW50cyk7XG4gIC8vIEVudGVyKCk6IGNyZWF0ZSBkaXZzIGZvciBlYWNoIGNvbnN0cmFpbnQgdG8gYmUgZGlzcGxheWVkICAoVE9ETzogdXNlIGFuIEhUTUw1IHRlbXBsYXRlIGluc3RlYWQpXG4gIC8vIDEuIGNvbnRhaW5lclxuICB2YXIgY2RpdnMgPSBjb25zdHJzLmVudGVyKCkuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLFwiY29uc3RyYWludFwiKSA7XG4gIC8vIDIuIG9wZXJhdG9yXG4gIGNkaXZzLmFwcGVuZChcImRpdlwiKS5hdHRyKFwibmFtZVwiLCBcIm9wXCIpIDtcbiAgLy8gMy4gdmFsdWVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwidmFsdWVcIikgO1xuICAvLyA0LiBjb25zdHJhaW50IGNvZGVcbiAgY2RpdnMuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJuYW1lXCIsIFwiY29kZVwiKSA7XG4gIC8vIDUuIGJ1dHRvbiB0byBlZGl0IHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGVkaXRcIikudGV4dChcIm1vZGVfZWRpdFwiKS5hdHRyKFwidGl0bGVcIixcIkVkaXQgdGhpcyBjb25zdHJhaW50XCIpO1xuICAvLyA2LiBidXR0b24gdG8gcmVtb3ZlIHRoaXMgY29uc3RyYWludFxuICBjZGl2cy5hcHBlbmQoXCJpXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hdGVyaWFsLWljb25zIGNhbmNlbFwiKS50ZXh0KFwiZGVsZXRlX2ZvcmV2ZXJcIikuYXR0cihcInRpdGxlXCIsXCJSZW1vdmUgdGhpcyBjb25zdHJhaW50XCIpO1xuXG4gIC8vIFJlbW92ZSBleGl0aW5nXG4gIGNvbnN0cnMuZXhpdCgpLnJlbW92ZSgpIDtcblxuICAvLyBTZXQgdGhlIHRleHQgZm9yIGVhY2ggY29uc3RyYWludFxuICBjb25zdHJzXG4gICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGMpIHsgcmV0dXJuIFwiY29uc3RyYWludCBcIiArIGMuY3R5cGU7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJjb2RlXCJdJylcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5jb2RlIHx8IFwiP1wiOyB9KTtcbiAgY29uc3Rycy5zZWxlY3QoJ1tuYW1lPVwib3BcIl0nKVxuICAgICAgLnRleHQoZnVuY3Rpb24oYyl7IHJldHVybiBjLm9wIHx8IFwiSVNBXCI7IH0pO1xuICBjb25zdHJzLnNlbGVjdCgnW25hbWU9XCJ2YWx1ZVwiXScpXG4gICAgICAudGV4dChmdW5jdGlvbihjKXtcbiAgICAgICAgICAvLyBGSVhNRSBcbiAgICAgICAgICBpZiAoYy5jdHlwZSA9PT0gXCJsb29rdXBcIikge1xuICAgICAgICAgICAgICByZXR1cm4gYy52YWx1ZSArIChjLmV4dHJhVmFsdWUgPyBcIiBpbiBcIiArIGMuZXh0cmFWYWx1ZSA6IFwiXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBjLnZhbHVlIHx8IChjLnZhbHVlcyAmJiBjLnZhbHVlcy5qb2luKFwiLFwiKSkgfHwgYy50eXBlO1xuICAgICAgfSk7XG4gIGNvbnN0cnMuc2VsZWN0KFwiaS5lZGl0XCIpXG4gICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihjKXsgXG4gICAgICAgICAgZWRpdENvbnN0cmFpbnQoYywgbik7XG4gICAgICB9KTtcbiAgY29uc3Rycy5zZWxlY3QoXCJpLmNhbmNlbFwiKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oYyl7IFxuICAgICAgICAgIG4ucmVtb3ZlQ29uc3RyYWludChjKTtcbiAgICAgICAgICBzYXZlU3RhdGUobik7XG4gICAgICAgICAgdXBkYXRlKG4pO1xuICAgICAgICAgIHNob3dEaWFsb2cobiwgbnVsbCwgdHJ1ZSk7XG4gICAgICB9KVxuXG5cbiAgLy8gVHJhbnNpdGlvbiB0byBcImdyb3dcIiB0aGUgZGlhbG9nIG91dCBvZiB0aGUgbm9kZVxuICBkaWFsb2cudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDEuMClcIik7XG5cbiAgLy9cbiAgdmFyIHQgPSBuLnBjb21wLnR5cGU7XG4gIGlmICh0eXBlb2YodCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIC8vIGRpYWxvZyBmb3Igc2ltcGxlIGF0dHJpYnV0ZXMuXG4gICAgICBkaWFsb2dcbiAgICAgICAgICAuY2xhc3NlZChcInNpbXBsZVwiLHRydWUpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZS5uYW1lIHx8IG4ucGNvbXAudHlwZSApO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNlbGVjdC1jdHJsXCJdJylcbiAgICAgICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKG4peyByZXR1cm4gbi5pc1NlbGVjdGVkIH0pO1xuICAgICAgLy8gXG4gICAgICBkaWFsb2cuc2VsZWN0KCdbbmFtZT1cInNvcnQtY3RybFwiXScpXG4gICAgICAgICAgLmNsYXNzZWQoXCJzb3J0YXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgICAgICAuY2xhc3NlZChcInNvcnRkZXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJkZXNjXCIpXG4gIH1cbiAgZWxzZSB7XG4gICAgICAvLyBEaWFsb2cgZm9yIGNsYXNzZXNcbiAgICAgIGRpYWxvZ1xuICAgICAgICAgIC5jbGFzc2VkKFwic2ltcGxlXCIsZmFsc2UpO1xuICAgICAgZGlhbG9nLnNlbGVjdChcInNwYW4uY2xzTmFtZVwiKVxuICAgICAgICAgIC50ZXh0KG4ucGNvbXAudHlwZSA/IG4ucGNvbXAudHlwZS5uYW1lIDogbi5wY29tcC5uYW1lKTtcblxuICAgICAgLy8gd2lyZSB1cCB0aGUgYnV0dG9uIHRvIHNob3cgc3VtbWFyeSBmaWVsZHNcbiAgICAgIGRpYWxvZy5zZWxlY3QoJyNkaWFsb2cgW25hbWU9XCJzaG93U3VtbWFyeVwiXScpXG4gICAgICAgICAgLm9uKFwiY2xpY2tcIiwgKCkgPT4gc2VsZWN0ZWROZXh0KGN1cnJOb2RlLCBcInN1bW1hcnlmaWVsZHNcIikpO1xuXG4gICAgICAvLyBGaWxsIGluIHRoZSB0YWJsZSBsaXN0aW5nIGFsbCB0aGUgYXR0cmlidXRlcy9yZWZzL2NvbGxlY3Rpb25zLlxuICAgICAgdmFyIHRibCA9IGRpYWxvZy5zZWxlY3QoXCJ0YWJsZS5hdHRyaWJ1dGVzXCIpO1xuICAgICAgdmFyIHJvd3MgPSB0Ymwuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgICAuZGF0YSgobi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZSkuYWxsUGFydHMpXG4gICAgICAgICAgO1xuICAgICAgcm93cy5lbnRlcigpLmFwcGVuZChcInRyXCIpO1xuICAgICAgcm93cy5leGl0KCkucmVtb3ZlKCk7XG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgICAgLmRhdGEoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICAgICAgICBpZiAoY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiU2VsZWN0IHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnc2VsZWN0c2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwic2VsZWN0ZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiAnPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiQ29uc3RyYWluIHRoaXMgYXR0cmlidXRlXCI+cGxheV9hcnJvdzwvaT4nLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnY29uc3RyYWluc2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAoKXtzZWxlY3RlZE5leHQoY3Vyck5vZGUsIFwiY29uc3RyYWluZWRcIiwgY29tcC5uYW1lKTsgfVxuICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgbmFtZTogY29tcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnJ1xuICAgICAgICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBgPGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiIHRpdGxlPVwiRm9sbG93IHRoaXMgJHtjb21wLmtpbmR9XCI+cGxheV9hcnJvdzwvaT5gLFxuICAgICAgICAgICAgICAgICAgY2xzOiAnb3Blbm5leHQnLFxuICAgICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICgpe3NlbGVjdGVkTmV4dChjdXJyTm9kZSwgXCJvcGVuXCIsIGNvbXAubmFtZSk7IH1cbiAgICAgICAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgICAgbmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICAgIGNsczogJydcbiAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICA7XG4gICAgICBjZWxscy5lbnRlcigpLmFwcGVuZChcInRkXCIpO1xuICAgICAgY2VsbHNcbiAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpe3JldHVybiBkLmNsczt9KVxuICAgICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpe3JldHVybiBkLm5hbWU7fSlcbiAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihkKXsgcmV0dXJuIGQuY2xpY2sgJiYgZC5jbGljaygpOyB9KVxuICAgICAgICAgIDtcbiAgICAgIGNlbGxzLmV4aXQoKS5yZW1vdmUoKTtcbiAgfVxufVxuXG4vLyBIaWRlcyB0aGUgZGlhbG9nLiBTZXRzIHRoZSBjdXJyZW50IG5vZGUgdG8gbnVsbC5cbi8vIEFyZ3M6XG4vLyAgIG5vbmVcbi8vIFJldHVybnNcbi8vICBub3RoaW5nXG4vLyBTaWRlIGVmZmVjdHM6XG4vLyAgSGlkZXMgdGhlIGRpYWxvZy5cbi8vICBTZXRzIGN1cnJOb2RlIHRvIG51bGwuXG4vL1xuZnVuY3Rpb24gaGlkZURpYWxvZygpe1xuICBjdXJyTm9kZSA9IG51bGw7XG4gIHZhciBkaWFsb2cgPSBkMy5zZWxlY3QoXCIjZGlhbG9nXCIpXG4gICAgICAuY2xhc3NlZChcImhpZGRlblwiLCB0cnVlKVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uLzIpXG4gICAgICAuc3R5bGUoXCJ0cmFuc2Zvcm1cIixcInNjYWxlKDFlLTYpXCIpXG4gICAgICA7XG4gIGQzLnNlbGVjdChcIiNjb25zdHJhaW50RWRpdG9yXCIpXG4gICAgICAuY2xhc3NlZChcIm9wZW5cIiwgbnVsbClcbiAgICAgIDtcbn1cblxuLy8gU2V0IHRoZSBlZGl0aW5nIHZpZXcuIFZpZXcgaXMgb25lIG9mOlxuLy8gQXJnczpcbi8vICAgICB2aWV3IChzdHJpbmcpIE9uZSBvZjogcXVlcnlNYWluLCBjb25zdHJhaW50TG9naWMsIGNvbHVtbk9yZGVyLCBzb3J0T3JkZXJcbi8vIFJldHVybnM6XG4vLyAgICAgTm90aGluZ1xuLy8gU2lkZSBlZmZlY3RzOlxuLy8gICAgIENoYW5nZXMgdGhlIGxheW91dCBhbmQgdXBkYXRlcyB0aGUgdmlldy5cbmZ1bmN0aW9uIHNldEVkaXRWaWV3KHZpZXcpe1xuICAgIGxldCB2ID0gZWRpdFZpZXdzW3ZpZXddO1xuICAgIGlmICghdikgdGhyb3cgXCJVbnJlY29nbml6ZWQgdmlldyB0eXBlOiBcIiArIHZpZXc7XG4gICAgZWRpdFZpZXcgPSB2O1xuICAgIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIHYubmFtZSk7XG4gICAgdXBkYXRlKHJvb3QpO1xufVxuXG5mdW5jdGlvbiBkb0xheW91dChyb290KXtcbiAgdmFyIGxheW91dDtcbiAgbGV0IGxlYXZlcyA9IFtdO1xuICBcbiAgZnVuY3Rpb24gbWQgKG4pIHsgLy8gbWF4IGRlcHRoXG4gICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPT09IDApIGxlYXZlcy5wdXNoKG4pO1xuICAgICAgcmV0dXJuIDEgKyAobi5jaGlsZHJlbi5sZW5ndGggPyBNYXRoLm1heC5hcHBseShudWxsLCBuLmNoaWxkcmVuLm1hcChtZCkpIDogMCk7XG4gIH07XG4gIGxldCBtYXhkID0gbWQocm9vdCk7IC8vIG1heCBkZXB0aCwgMS1iYXNlZFxuXG4gIC8vXG4gIGlmIChlZGl0Vmlldy5sYXlvdXRTdHlsZSA9PT0gXCJ0cmVlXCIpIHtcbiAgICAgIC8vIGQzIGxheW91dCBhcnJhbmdlcyBub2RlcyB0b3AtdG8tYm90dG9tLCBidXQgd2Ugd2FudCBsZWZ0LXRvLXJpZ2h0LlxuICAgICAgLy8gU28uLi5yZXZlcnNlIHdpZHRoIGFuZCBoZWlnaHQsIGFuZCBkbyB0aGUgbGF5b3V0LiBUaGVuLCByZXZlcnNlIHRoZSB4LHkgY29vcmRzIGluIHRoZSByZXN1bHRzLlxuICAgICAgbGF5b3V0ID0gZDMubGF5b3V0LnRyZWUoKS5zaXplKFtoLCB3XSk7XG4gICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgIG5vZGVzID0gbGF5b3V0Lm5vZGVzKHJvb3QpLnJldmVyc2UoKTtcbiAgICAgIC8vIFJldmVyc2UgeCBhbmQgeS4gQWxzbywgbm9ybWFsaXplIHggZm9yIGZpeGVkLWRlcHRoLlxuICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgbGV0IHRtcCA9IGQueDsgZC54ID0gZC55OyBkLnkgPSB0bXA7XG4gICAgICAgICAgbGV0IGR4ID0gTWF0aC5taW4oMTgwLCB3IC8gTWF0aC5tYXgoMSxtYXhkLTEpKVxuICAgICAgICAgIGQueCA9IGQuZGVwdGggKiBkeCBcbiAgICAgIH0pO1xuICB9XG4gIGVsc2Uge1xuICAgICAgLy8gZGVuZHJvZ3JhbVxuICAgICAgbGF5b3V0ID0gZDMubGF5b3V0LmNsdXN0ZXIoKVxuICAgICAgICAgIC5zZXBhcmF0aW9uKChhLGIpID0+IDEpXG4gICAgICAgICAgLnNpemUoW2gsIE1hdGgubWluKHcsIG1heGQgKiAxODApXSk7XG4gICAgICAvLyBTYXZlIG5vZGVzIGluIGdsb2JhbC5cbiAgICAgIG5vZGVzID0gbGF5b3V0Lm5vZGVzKHJvb3QpLnJldmVyc2UoKTtcbiAgICAgIG5vZGVzLmZvckVhY2goIGQgPT4geyBsZXQgdG1wID0gZC54OyBkLnggPSBkLnk7IGQueSA9IHRtcDsgfSk7XG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gUmVhcnJhbmdlIHktcG9zaXRpb25zIG9mIGxlYWYgbm9kZXMuIFxuICAgICAgbGV0IHBvcyA9IGxlYXZlcy5tYXAoZnVuY3Rpb24obil7IHJldHVybiB7IHk6IG4ueSwgeTA6IG4ueTAgfTsgfSk7XG5cbiAgICAgIGxlYXZlcy5zb3J0KGVkaXRWaWV3Lm5vZGVDb21wKTtcblxuICAgICAgLy8gcmVhc3NpZ24gdGhlIFkgcG9zaXRpb25zXG4gICAgICBsZWF2ZXMuZm9yRWFjaChmdW5jdGlvbihuLCBpKXtcbiAgICAgICAgICBuLnkgPSBwb3NbaV0ueTtcbiAgICAgICAgICBuLnkwID0gcG9zW2ldLnkwO1xuICAgICAgfSk7XG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCBsZWF2ZXMgaGF2ZSBiZWVuIHJlYXJyYW5nZWQsIGJ1dCB0aGUgaW50ZXJpb3Igbm9kZXMgaGF2ZW4ndC5cbiAgICAgIC8vIEhlciB3ZSBtb3ZlIGludGVyaW9yIG5vZGVzIHRvd2FyZCB0aGVpciBcImNlbnRlciBvZiBncmF2aXR5XCIgYXMgZGVmaW5lZFxuICAgICAgLy8gYnkgdGhlIHBvc2l0aW9ucyBvZiB0aGVpciBjaGlsZHJlbi4gQXBwbHkgdGhpcyByZWN1cnNpdmVseSB1cCB0aGUgdHJlZS5cbiAgICAgIC8vIFxuICAgICAgLy8gTk9URSB0aGF0IHggYW5kIHkgY29vcmRpbmF0ZXMgYXJlIG9wcG9zaXRlIGF0IHRoaXMgcG9pbnQhXG4gICAgICAvL1xuICAgICAgLy8gTWFpbnRhaW4gYSBtYXAgb2Ygb2NjdXBpZWQgcG9zaXRpb25zOlxuICAgICAgbGV0IG9jY3VwaWVkID0ge30gOyAgLy8gb2NjdXBpZWRbeCBwb3NpdGlvbl0gPT0gW2xpc3Qgb2Ygbm9kZXNdXG4gICAgICBmdW5jdGlvbiBjb2cgKG4pIHtcbiAgICAgICAgICBpZiAobi5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIC8vIGNvbXB1dGUgbXkgYy5vLmcuIGFzIHRoZSBhdmVyYWdlIG9mIG15IGtpZHMnIHBvc2l0aW9uc1xuICAgICAgICAgICAgICBsZXQgbXlDb2cgPSAobi5jaGlsZHJlbi5tYXAoY29nKS5yZWR1Y2UoKHQsYykgPT4gdCtjLCAwKSkvbi5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgIGlmKG4ucGFyZW50KSBuLnkgPSBteUNvZztcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGRkID0gb2NjdXBpZWRbbi55XSA9IChvY2N1cGllZFtuLnldIHx8IFtdKTtcbiAgICAgICAgICBkZC5wdXNoKG4ueSk7XG4gICAgICAgICAgcmV0dXJuIG4ueTtcbiAgICAgIH1cbiAgICAgIGNvZyhyb290KTtcblxuICAgICAgLy8gVE9ETzogRmluYWwgYWRqdXN0bWVudHNcbiAgICAgIC8vIDEuIElmIHdlIGV4dGVuZCBvZmYgdGhlIHJpZ2h0IGVkZ2UsIGNvbXByZXNzLlxuICAgICAgLy8gMi4gSWYgaXRlbXMgYXQgc2FtZSB4IG92ZXJsYXAsIHNwcmVhZCB0aGVtIG91dCBpbiB5LlxuICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIH1cblxuICAvLyBzYXZlIGxpbmtzIGluIGdsb2JhbFxuICBsaW5rcyA9IGxheW91dC5saW5rcyhub2Rlcyk7XG5cbiAgcmV0dXJuIFtub2RlcywgbGlua3NdXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB1cGRhdGUobikgXG4vLyBUaGUgbWFpbiBkcmF3aW5nIHJvdXRpbmUuIFxuLy8gVXBkYXRlcyB0aGUgU1ZHLCB1c2luZyBuIGFzIHRoZSBzb3VyY2Ugb2YgYW55IGVudGVyaW5nL2V4aXRpbmcgYW5pbWF0aW9ucy5cbi8vXG5mdW5jdGlvbiB1cGRhdGUoc291cmNlKSB7XG4gIC8vXG4gIGQzLnNlbGVjdChcIiNzdmdDb250YWluZXJcIikuYXR0cihcImNsYXNzXCIsIGVkaXRWaWV3Lm5hbWUpO1xuXG4gIGQzLnNlbGVjdChcIiN1bmRvQnV0dG9uXCIpXG4gICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdW5kb01nci5jYW5VbmRvKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgdW5kb01nci5jYW5VbmRvICYmIHVuZG8gfHwgbnVsbCk7XG4gIGQzLnNlbGVjdChcIiNyZWRvQnV0dG9uXCIpXG4gICAgICAuY2xhc3NlZChcImRpc2FibGVkXCIsICgpID0+ICEgdW5kb01nci5jYW5SZWRvKVxuICAgICAgLm9uKFwiY2xpY2tcIiwgdW5kb01nci5jYW5SZWRvICYmIHJlZG8gfHwgbnVsbCk7XG4gIC8vXG4gIGRvTGF5b3V0KHJvb3QpO1xuICB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKTtcbiAgdXBkYXRlTGlua3MobGlua3MsIHNvdXJjZSk7XG4gIHVwZGF0ZVR0ZXh0KGN1cnJUZW1wbGF0ZSk7XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVOb2Rlcyhub2Rlcywgc291cmNlKXtcbiAgbGV0IG5vZGVHcnBzID0gdmlzLnNlbGVjdEFsbChcImcubm9kZWdyb3VwXCIpXG4gICAgICAuZGF0YShub2RlcywgZnVuY3Rpb24obikgeyByZXR1cm4gbi5pZCB8fCAobi5pZCA9ICsraSk7IH0pXG4gICAgICA7XG5cbiAgLy8gQ3JlYXRlIG5ldyBub2RlcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBub2RlRW50ZXIgPSBub2RlR3Jwcy5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwic3ZnOmdcIilcbiAgICAgIC5hdHRyKFwiaWRcIiwgbiA9PiBuLnBhdGgucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlZ3JvdXBcIilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgc291cmNlLngwICsgXCIsXCIgKyBzb3VyY2UueTAgKyBcIilcIjsgfSlcbiAgICAgIDtcblxuICBsZXQgY2xpY2tOb2RlID0gZnVuY3Rpb24obikge1xuICAgICAgaWYgKGQzLmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjsgXG4gICAgICBpZiAoY3Vyck5vZGUgIT09IG4pIHNob3dEaWFsb2cobiwgdGhpcyk7XG4gICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfTtcbiAgLy8gQWRkIGdseXBoIGZvciB0aGUgbm9kZVxuICBub2RlRW50ZXIuYXBwZW5kKGZ1bmN0aW9uKGQpe1xuICAgICAgdmFyIHNoYXBlID0gKGQucGNvbXAua2luZCA9PSBcImF0dHJpYnV0ZVwiID8gXCJyZWN0XCIgOiBcImNpcmNsZVwiKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBzaGFwZSk7XG4gICAgfSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIixcIm5vZGVcIilcbiAgICAgIC5vbihcImNsaWNrXCIsIGNsaWNrTm9kZSk7XG4gIG5vZGVFbnRlci5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICA7XG4gIG5vZGVFbnRlci5zZWxlY3QoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInhcIiwgLTguNSlcbiAgICAgIC5hdHRyKFwieVwiLCAtOC41KVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICAuYXR0cihcImhlaWdodFwiLCAxZS02KSAvLyBzdGFydCBvZmYgaW52aXNpYmx5IHNtYWxsXG4gICAgICA7XG5cbiAgLy8gQWRkIHRleHQgZm9yIG5vZGUgbmFtZVxuICBub2RlRW50ZXIuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmNoaWxkcmVuID8gLTEwIDogMTA7IH0pXG4gICAgICAuYXR0cihcImR5XCIsIFwiLjM1ZW1cIilcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxZS02KSAvLyBzdGFydCBvZmYgbmVhcmx5IHRyYW5zcGFyZW50XG4gICAgICAuYXR0cihcImNsYXNzXCIsXCJub2RlTmFtZVwiKVxuICAgICAgO1xuXG4gIC8vIFBsYWNlaG9sZGVyIGZvciBpY29uL3RleHQgdG8gYXBwZWFyIGluc2lkZSBub2RlXG4gIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGVJY29uJylcbiAgICAgIC5hdHRyKCdkeScsIDUpXG4gICAgICA7XG5cbiAgLy8gQWRkIG5vZGUgaGFuZGxlXG4gIG5vZGVFbnRlci5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2hhbmRsZScpXG4gICAgICAuYXR0cignZHgnLCAxMClcbiAgICAgIC5hdHRyKCdkeScsIDUpXG4gICAgICA7XG5cbiAgbGV0IG5vZGVVcGRhdGUgPSBub2RlR3Jwc1xuICAgICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBuID0+IG4uaXNTZWxlY3RlZClcbiAgICAgIC5jbGFzc2VkKFwiY29uc3RyYWluZWRcIiwgbiA9PiBuLmNvbnN0cmFpbnRzLmxlbmd0aCA+IDApXG4gICAgICAuY2xhc3NlZChcInNvcnRlZFwiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQubGV2ZWwgPj0gMClcbiAgICAgIC5jbGFzc2VkKFwic29ydGVkYXNjXCIsIG4gPT4gbi5zb3J0ICYmIG4uc29ydC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gXCJhc2NcIilcbiAgICAgIC5jbGFzc2VkKFwic29ydGVkZGVzY1wiLCBuID0+IG4uc29ydCAmJiBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgPT09IFwiZGVzY1wiKVxuICAgIC8vIFRyYW5zaXRpb24gbm9kZXMgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxuICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbi54ICsgXCIsXCIgKyBuLnkgKyBcIilcIjsgfSlcbiAgICAgIDtcblxuICBub2RlVXBkYXRlLnNlbGVjdChcInRleHQuaGFuZGxlXCIpXG4gICAgICAuYXR0cignZm9udC1mYW1pbHknLCBlZGl0Vmlldy5oYW5kbGVJY29uLmZvbnRGYW1pbHkgfHwgbnVsbClcbiAgICAgIC50ZXh0KGVkaXRWaWV3LmhhbmRsZUljb24udGV4dCB8fCBcIlwiKSBcbiAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIGVkaXRWaWV3LmhhbmRsZUljb24uc3Ryb2tlIHx8IG51bGwpXG4gICAgICAuYXR0cihcImZpbGxcIiwgZWRpdFZpZXcuaGFuZGxlSWNvbi5maWxsIHx8IG51bGwpO1xuICBub2RlVXBkYXRlLnNlbGVjdChcInRleHQubm9kZUljb25cIilcbiAgICAgIC5hdHRyKCdmb250LWZhbWlseScsIGVkaXRWaWV3Lm5vZGVJY29uLmZvbnRGYW1pbHkgfHwgbnVsbClcbiAgICAgIC50ZXh0KGVkaXRWaWV3Lm5vZGVJY29uLnRleHQgfHwgXCJcIikgXG4gICAgICA7XG5cbiAgZDMuc2VsZWN0QWxsKFwiLm5vZGVJY29uXCIpXG4gICAgICAub24oXCJjbGlja1wiLCBjbGlja05vZGUpO1xuXG4gIG5vZGVVcGRhdGUuc2VsZWN0QWxsKFwidGV4dC5ub2RlTmFtZVwiKVxuICAgICAgLnRleHQobiA9PiBuLm5hbWUpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE1ha2Ugc2VsZWN0ZWQgbm9kZXMgZHJhZ2dhYmxlLlxuICAvLyBDbGVhciBvdXQgYWxsIGV4aXRpbmcgZHJhZyBoYW5kbGVyc1xuICBkMy5zZWxlY3RBbGwoXCJnLm5vZGVncm91cFwiKVxuICAgICAgLmNsYXNzZWQoXCJkcmFnZ2FibGVcIiwgZmFsc2UpXG4gICAgICAub24oXCIuZHJhZ1wiLCBudWxsKTsgXG4gIC8vIE5vdyBtYWtlIGV2ZXJ5dGhpbmcgZHJhZ2dhYmxlIHRoYXQgc2hvdWxkIGJlXG4gIGlmIChlZGl0Vmlldy5kcmFnZ2FibGUpXG4gICAgICBkMy5zZWxlY3RBbGwoZWRpdFZpZXcuZHJhZ2dhYmxlKVxuICAgICAgICAgIC5jbGFzc2VkKFwiZHJhZ2dhYmxlXCIsIHRydWUpXG4gICAgICAgICAgLmNhbGwoZHJhZ0JlaGF2aW9yKTtcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBZGQgdGV4dCBmb3IgY29uc3RyYWludHNcbiAgbGV0IGN0ID0gbm9kZUdycHMuc2VsZWN0QWxsKFwidGV4dC5jb25zdHJhaW50XCIpXG4gICAgICAuZGF0YShmdW5jdGlvbihuKXsgcmV0dXJuIG4uY29uc3RyYWludHM7IH0pO1xuICBjdC5lbnRlcigpLmFwcGVuZChcInN2Zzp0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbnN0cmFpbnRcIik7XG4gIGN0LmV4aXQoKS5yZW1vdmUoKTtcbiAgY3QudGV4dCggYyA9PiBjLmxhYmVsVGV4dCApXG4gICAgICAgLmF0dHIoXCJ4XCIsIDApXG4gICAgICAgLmF0dHIoXCJkeVwiLCAoYyxpKSA9PiBgJHsoaSsxKSoxLjd9ZW1gKVxuICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIixcInN0YXJ0XCIpXG4gICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byBmdWxsIHNpemVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCA4LjUgKVxuICAgICAgO1xuICBub2RlVXBkYXRlLnNlbGVjdChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTcgKVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMTcgKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byBmdWxseSBvcGFxdWVcbiAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMSlcbiAgICAgIDtcblxuICAvL1xuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGV0IG5vZGVFeGl0ID0gbm9kZUdycHMuZXhpdCgpLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGFuaW1hdGlvbkR1cmF0aW9uKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBzb3VyY2UueCArIFwiLFwiICsgc291cmNlLnkgKyBcIilcIjsgfSlcbiAgICAgIC5yZW1vdmUoKVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gY2lyY2xlcyB0byB0aW55IHJhZGl1c1xuICBub2RlRXhpdC5zZWxlY3QoXCJjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiclwiLCAxZS02KVxuICAgICAgO1xuXG4gIC8vIFRyYW5zaXRpb24gdGV4dCB0byB0cmFuc3BhcmVudFxuICBub2RlRXhpdC5zZWxlY3QoXCJ0ZXh0XCIpXG4gICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMWUtNilcbiAgICAgIDtcbiAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXG4gIG5vZGVzLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGQueDAgPSBkLng7XG4gICAgZC55MCA9IGQueTtcbiAgfSk7XG4gIC8vXG5cbn1cblxuLy9cbmZ1bmN0aW9uIHVwZGF0ZUxpbmtzKGxpbmtzLCBzb3VyY2UpIHtcbiAgbGV0IGxpbmsgPSB2aXMuc2VsZWN0QWxsKFwicGF0aC5saW5rXCIpXG4gICAgICAuZGF0YShsaW5rcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQuaWQ7IH0pXG4gICAgICA7XG5cbiAgLy8gRW50ZXIgYW55IG5ldyBsaW5rcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXG4gIGxldCBuZXdQYXRocyA9IGxpbmsuZW50ZXIoKS5pbnNlcnQoXCJzdmc6cGF0aFwiLCBcImdcIik7XG4gIGxldCBsaW5rVGl0bGUgPSBmdW5jdGlvbihsKXtcbiAgICAgIGxldCBjbGljayA9IFwiXCI7XG4gICAgICBpZiAobC50YXJnZXQucGNvbXAua2luZCAhPT0gXCJhdHRyaWJ1dGVcIil7XG4gICAgICAgICAgY2xpY2sgPSBgQ2xpY2sgdG8gbWFrZSB0aGlzIHJlbGF0aW9uc2hpcCAke2wudGFyZ2V0LmpvaW4gPyBcIlJFUVVJUkVEXCIgOiBcIk9QVElPTkFMXCJ9LiBgO1xuICAgICAgfVxuICAgICAgbGV0IGFsdGNsaWNrID0gXCJBbHQtY2xpY2sgdG8gY3V0IGxpbmsuXCI7XG4gICAgICByZXR1cm4gY2xpY2sgKyBhbHRjbGljaztcbiAgfVxuICAvLyBzZXQgdGhlIHRvb2x0aXBcbiAgbmV3UGF0aHMuYXBwZW5kKFwic3ZnOnRpdGxlXCIpLnRleHQobGlua1RpdGxlKTtcbiAgbmV3UGF0aHNcbiAgICAgIC5hdHRyKFwidGFyZ2V0XCIsIGQgPT4gZC50YXJnZXQuaWQucmVwbGFjZSgvXFwuL2csIFwiX1wiKSlcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5rXCIpXG4gICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgbyA9IHt4OiBzb3VyY2UueDAsIHk6IHNvdXJjZS55MH07XG4gICAgICAgIHJldHVybiBkaWFnb25hbCh7c291cmNlOiBvLCB0YXJnZXQ6IG99KTtcbiAgICAgIH0pXG4gICAgICAuY2xhc3NlZChcImF0dHJpYnV0ZVwiLCBmdW5jdGlvbihsKSB7IHJldHVybiBsLnRhcmdldC5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiOyB9KVxuICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24obCl7IFxuICAgICAgICAgIGlmIChkMy5ldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgLy8gYSBzaGlmdC1jbGljayBjdXRzIHRoZSB0cmVlIGF0IHRoaXMgZWRnZVxuICAgICAgICAgICAgICByZW1vdmVOb2RlKGwudGFyZ2V0KVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGwudGFyZ2V0LnBjb21wLmtpbmQgPT0gXCJhdHRyaWJ1dGVcIikgcmV0dXJuO1xuICAgICAgICAgICAgICAvLyByZWd1bGFyIGNsaWNrIG9uIGEgcmVsYXRpb25zaGlwIGVkZ2UgaW52ZXJ0cyB3aGV0aGVyXG4gICAgICAgICAgICAgIC8vIHRoZSBqb2luIGlzIGlubmVyIG9yIG91dGVyLiBcbiAgICAgICAgICAgICAgbC50YXJnZXQuam9pbiA9IChsLnRhcmdldC5qb2luID8gbnVsbCA6IFwib3V0ZXJcIik7XG4gICAgICAgICAgICAgIC8vIHJlLXNldCB0aGUgdG9vbHRpcFxuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0KFwidGl0bGVcIikudGV4dChsaW5rVGl0bGUpO1xuICAgICAgICAgICAgICB1cGRhdGUobC5zb3VyY2UpO1xuICAgICAgICAgICAgICBzYXZlU3RhdGUobC5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgICAgLmF0dHIoXCJkXCIsIGRpYWdvbmFsKVxuICAgICAgO1xuIFxuICBcbiAgLy8gVHJhbnNpdGlvbiBsaW5rcyB0byB0aGVpciBuZXcgcG9zaXRpb24uXG4gIGxpbmsuY2xhc3NlZChcIm91dGVyXCIsIGZ1bmN0aW9uKG4pIHsgcmV0dXJuIG4udGFyZ2V0LmpvaW4gPT09IFwib3V0ZXJcIjsgfSlcbiAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgIC5kdXJhdGlvbihhbmltYXRpb25EdXJhdGlvbilcbiAgICAgIC5hdHRyKFwiZFwiLCBkaWFnb25hbClcbiAgICAgIDtcblxuICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cbiAgbGluay5leGl0KCkudHJhbnNpdGlvbigpXG4gICAgICAuZHVyYXRpb24oYW5pbWF0aW9uRHVyYXRpb24pXG4gICAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgbyA9IHt4OiBzb3VyY2UueCwgeTogc291cmNlLnl9O1xuICAgICAgICByZXR1cm4gZGlhZ29uYWwoe3NvdXJjZTogbywgdGFyZ2V0OiBvfSk7XG4gICAgICB9KVxuICAgICAgLnJlbW92ZSgpXG4gICAgICA7XG5cbn1cbi8vIFR1cm5zIGEganNvbiByZXByZXNlbnRhdGlvbiBvZiBhIHRlbXBsYXRlIGludG8gWE1MLCBzdWl0YWJsZSBmb3IgaW1wb3J0aW5nIGludG8gdGhlIEludGVybWluZSBRQi5cbmZ1bmN0aW9uIGpzb24yeG1sKHQsIHFvbmx5KXtcbiAgICB2YXIgc28gPSAodC5vcmRlckJ5IHx8IFtdKS5yZWR1Y2UoZnVuY3Rpb24ocyx4KXsgXG4gICAgICAgIHZhciBrID0gT2JqZWN0LmtleXMoeClbMF07XG4gICAgICAgIHZhciB2ID0geFtrXVxuICAgICAgICByZXR1cm4gcyArIGAke2t9ICR7dn0gYDtcbiAgICB9LCBcIlwiKTtcblxuICAgIC8vIENvbnZlcnRzIGFuIG91dGVyIGpvaW4gcGF0aCB0byB4bWwuXG4gICAgZnVuY3Rpb24gb2oyeG1sKG9qKXtcbiAgICAgICAgcmV0dXJuIGA8am9pbiBwYXRoPVwiJHtvan1cIiBzdHlsZT1cIk9VVEVSXCIgLz5gO1xuICAgIH1cblxuICAgIC8vIHRoZSBxdWVyeSBwYXJ0XG4gICAgdmFyIHFwYXJ0ID0gXG5gPHF1ZXJ5XG4gIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICBtb2RlbD1cIiR7KHQubW9kZWwgJiYgdC5tb2RlbC5uYW1lKSB8fCAnJ31cIlxuICB2aWV3PVwiJHt0LnNlbGVjdC5qb2luKCcgJyl9XCJcbiAgbG9uZ0Rlc2NyaXB0aW9uPVwiJHtlc2ModC5kZXNjcmlwdGlvbiB8fCAnJyl9XCJcbiAgc29ydE9yZGVyPVwiJHtzbyB8fCAnJ31cIlxuICAke3QuY29uc3RyYWludExvZ2ljICYmICdjb25zdHJhaW50TG9naWM9XCInK3QuY29uc3RyYWludExvZ2ljKydcIicgfHwgJyd9XG4+XG4gICR7KHQuam9pbnMgfHwgW10pLm1hcChvajJ4bWwpLmpvaW4oXCIgXCIpfVxuICAkeyh0LndoZXJlIHx8IFtdKS5tYXAoYyA9PiBjLmMyeG1sKHFvbmx5KSkuam9pbihcIiBcIil9XG48L3F1ZXJ5PmA7XG4gICAgLy8gdGhlIHdob2xlIHRlbXBsYXRlXG4gICAgdmFyIHRtcGx0ID0gXG5gPHRlbXBsYXRlXG4gIG5hbWU9XCIke3QubmFtZSB8fCAnJ31cIlxuICB0aXRsZT1cIiR7ZXNjKHQudGl0bGUgfHwgJycpfVwiXG4gIGNvbW1lbnQ9XCIke2VzYyh0LmNvbW1lbnQgfHwgJycpfVwiPlxuICR7cXBhcnR9XG48L3RlbXBsYXRlPlxuYDtcbiAgICByZXR1cm4gcW9ubHkgPyBxcGFydCA6IHRtcGx0XG59XG5cbi8vXG5mdW5jdGlvbiB1cGRhdGVUdGV4dCh0KXtcbiAgbGV0IHVjdCA9IHQudW5jb21waWxlVGVtcGxhdGUoKTtcbiAgbGV0IHR4dDtcbiAgLy9cbiAgbGV0IHRpdGxlID0gdmlzLnNlbGVjdEFsbChcIiNxdGl0bGVcIilcbiAgICAgIC5kYXRhKFtyb290LnRlbXBsYXRlLnRpdGxlXSk7XG4gIHRpdGxlLmVudGVyKClcbiAgICAgIC5hcHBlbmQoXCJzdmc6dGV4dFwiKVxuICAgICAgLmF0dHIoXCJpZFwiLFwicXRpdGxlXCIpXG4gICAgICAuYXR0cihcInhcIiwgLTQwKVxuICAgICAgLmF0dHIoXCJ5XCIsIDE1KVxuICAgICAgO1xuICB0aXRsZS5odG1sKHQgPT4ge1xuICAgICAgbGV0IHBhcnRzID0gdC5zcGxpdCgvKC0tPikvKTtcbiAgICAgIHJldHVybiBwYXJ0cy5tYXAoKHAsaSkgPT4ge1xuICAgICAgICAgIGlmIChwID09PSBcIi0tPlwiKSBcbiAgICAgICAgICAgICAgcmV0dXJuIGA8dHNwYW4geT0xMCBmb250LWZhbWlseT1cIk1hdGVyaWFsIEljb25zXCI+JHtjb2RlcG9pbnRzWydmb3J3YXJkJ119PC90c3Bhbj5gXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYDx0c3BhbiB5PTQ+JHtwfTwvdHNwYW4+YFxuICAgICAgfSkuam9pbihcIlwiKTtcbiAgfSk7XG5cbiAgLy9cbiAgaWYoIGQzLnNlbGVjdChcIiN0dGV4dFwiKS5jbGFzc2VkKFwianNvblwiKSApXG4gICAgICB0eHQgPSBKU09OLnN0cmluZ2lmeSh1Y3QsIG51bGwsIDIpO1xuICBlbHNlXG4gICAgICB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICAvL1xuICBkMy5zZWxlY3QoXCIjdHRleHRkaXZcIikgXG4gICAgICAudGV4dCh0eHQpXG4gICAgICAub24oXCJmb2N1c1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIHRydWUpO1xuICAgICAgICAgIHNlbGVjdFRleHQoXCJ0dGV4dGRpdlwiKTtcbiAgICAgIH0pXG4gICAgICAub24oXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGQzLnNlbGVjdChcIiNkcmF3ZXJcIikuY2xhc3NlZChcImV4cGFuZGVkXCIsIGZhbHNlKTtcbiAgICAgIH0pO1xuICAvL1xuICBpZiAoZDMuc2VsZWN0KCcjcXVlcnljb3VudCAuYnV0dG9uLnN5bmMnKS50ZXh0KCkgPT09IFwic3luY1wiKVxuICAgICAgdXBkYXRlQ291bnQodCk7XG59XG5cbmZ1bmN0aW9uIHJ1bmF0bWluZSh0KSB7XG4gIGxldCB1Y3QgPSB0LnVuY29tcGlsZVRlbXBsYXRlKCk7XG4gIGxldCB0eHQgPSBqc29uMnhtbCh1Y3QpO1xuICBsZXQgdXJsVHh0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHR4dCk7XG4gIGxldCBsaW5rdXJsID0gY3Vyck1pbmUudXJsICsgXCIvbG9hZFF1ZXJ5LmRvP3RyYWlsPSU3Q3F1ZXJ5Jm1ldGhvZD14bWxcIjtcbiAgbGV0IGVkaXR1cmwgPSBsaW5rdXJsICsgXCImcXVlcnk9XCIgKyB1cmxUeHQ7XG4gIGxldCBydW51cmwgPSBsaW5rdXJsICsgXCImc2tpcEJ1aWxkZXI9dHJ1ZSZxdWVyeT1cIiArIHVybFR4dDtcbiAgd2luZG93Lm9wZW4oIGQzLmV2ZW50LmFsdEtleSA/IGVkaXR1cmwgOiBydW51cmwsICdfYmxhbmsnICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvdW50KHQpe1xuICBsZXQgdWN0ID0gdC51bmNvbXBpbGVUZW1wbGF0ZSgpO1xuICBsZXQgcXR4dCA9IGpzb24yeG1sKHVjdCwgdHJ1ZSk7XG4gIGxldCB1cmxUeHQgPSBlbmNvZGVVUklDb21wb25lbnQocXR4dCk7XG4gIGxldCBjb3VudFVybCA9IGN1cnJNaW5lLnVybCArIGAvc2VydmljZS9xdWVyeS9yZXN1bHRzP3F1ZXJ5PSR7dXJsVHh0fSZmb3JtYXQ9Y291bnRgO1xuICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcInJ1bm5pbmdcIiwgdHJ1ZSk7XG4gIGQzanNvblByb21pc2UoY291bnRVcmwpXG4gICAgICAudGhlbihmdW5jdGlvbihuKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIGZhbHNlKS5jbGFzc2VkKFwicnVubmluZ1wiLCBmYWxzZSk7XG4gICAgICAgICAgZDMuc2VsZWN0KCcjcXVlcnljb3VudCBzcGFuJykudGV4dChuKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICBkMy5zZWxlY3QoJyNxdWVyeWNvdW50JykuY2xhc3NlZChcImVycm9yXCIsIHRydWUpLmNsYXNzZWQoXCJydW5uaW5nXCIsIGZhbHNlKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SOjpcIiwgcXR4dClcbiAgICAgIH0pO1xufVxuXG4vLyBUaGUgY2FsbCB0aGF0IGdldHMgaXQgYWxsIGdvaW5nLi4uXG5zZXR1cCgpXG4vL1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcWIuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8gVW5kb01hbmFnZXIgbWFpbnRhaW5zIGEgaGlzdG9yeSBzdGFjayBvZiBzdGF0ZXMgKGFyYml0cmFyeSBvYmplY3RzKS5cbi8vXG5jbGFzcyBVbmRvTWFuYWdlciB7XG4gICAgY29uc3RydWN0b3IobGltaXQpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50ZXIgPSAtMTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnRTdGF0ZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXIgPCAwKVxuICAgICAgICAgICAgdGhyb3cgXCJObyBjdXJyZW50IHN0YXRlLlwiO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxuICAgIGdldCBoYXNTdGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXIgPj0gMDtcbiAgICB9XG4gICAgZ2V0IGNhblVuZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyID4gMDtcbiAgICB9XG4gICAgZ2V0IGNhblJlZG8gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTdGF0ZSAmJiB0aGlzLnBvaW50ZXIgPCB0aGlzLmhpc3RvcnkubGVuZ3RoLTE7XG4gICAgfVxuICAgIGFkZCAocykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQUREXCIpO1xuICAgICAgICB0aGlzLnBvaW50ZXIgKz0gMTtcbiAgICAgICAgdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl0gPSBzO1xuICAgICAgICB0aGlzLmhpc3Rvcnkuc3BsaWNlKHRoaXMucG9pbnRlcisxKTtcbiAgICB9XG4gICAgdW5kbyAoKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJVTkRPXCIpO1xuICAgICAgICBpZiAoISB0aGlzLmNhblVuZG8pIHRocm93IFwiTm8gdW5kby5cIlxuICAgICAgICB0aGlzLnBvaW50ZXIgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLnBvaW50ZXJdO1xuICAgIH1cbiAgICByZWRvICgpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJFRE9cIik7XG4gICAgICAgIGlmICghIHRoaXMuY2FuUmVkbykgdGhyb3cgXCJObyByZWRvLlwiXG4gICAgICAgIHRoaXMucG9pbnRlciArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5oaXN0b3J5W3RoaXMucG9pbnRlcl07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBVbmRvTWFuYWdlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3VuZG9NYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7IE5VTUVSSUNUWVBFUywgTlVMTEFCTEVUWVBFUywgTEVBRlRZUEVTLCBPUFMsIE9QSU5ERVggfSBmcm9tICcuL29wcy5qcyc7XG5pbXBvcnQgeyBlc2MsIGRlZXBjLCBvYmoyYXJyYXkgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCBwYXJzZXIgZnJvbSAnLi9wYXJzZXIuanMnO1xuXG4vLyBBZGQgZGlyZWN0IGNyb3NzIHJlZmVyZW5jZXMgdG8gbmFtZWQgdHlwZXMuIChFLmcuLCB3aGVyZSB0aGVcbi8vIG1vZGVsIHNheXMgdGhhdCBHZW5lLmFsbGVsZXMgaXMgYSBjb2xsZWN0aW9uIHdob3NlIHJlZmVyZW5jZWRUeXBlXG4vLyBpcyB0aGUgc3RyaW5nIFwiQWxsZWxlXCIsIGFkZCBhIGRpcmVjdCByZWZlcmVuY2UgdG8gdGhlIEFsbGVsZSBjbGFzcylcbi8vIEFsc28gYWRkcyBhcnJheXMgZm9yIGNvbnZlbmllbmNlIGZvciBhY2Nlc3NpbmcgYWxsIGNsYXNzZXMgb3IgYWxsIGF0dHJpYnV0ZXMgb2YgYSBjbGFzcy5cbi8vXG5jbGFzcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IgKGNmZykge1xuICAgICAgICBsZXQgbW9kZWwgPSB0aGlzO1xuICAgICAgICB0aGlzLnBhY2thZ2UgPSBjZmcucGFja2FnZTtcbiAgICAgICAgdGhpcy5uYW1lID0gY2ZnLm5hbWU7XG4gICAgICAgIHRoaXMuY2xhc3NlcyA9IGRlZXBjKGNmZy5jbGFzc2VzKTtcblxuICAgICAgICAvLyBGaXJzdCBhZGQgY2xhc3NlcyB0aGF0IHJlcHJlc2VudCB0aGUgYmFzaWMgdHlwZVxuICAgICAgICBMRUFGVFlQRVMuZm9yRWFjaCggbiA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsYXNzZXNbbl0gPSB7XG4gICAgICAgICAgICAgICAgaXNMZWFmVHlwZTogdHJ1ZSwgICAvLyBkaXN0aW5ndWlzaGVzIHRoZXNlIGZyb20gbW9kZWwgY2xhc3Nlc1xuICAgICAgICAgICAgICAgIG5hbWU6IG4sXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG4sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlczogW10sXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmFsbENsYXNzZXMgPSBvYmoyYXJyYXkodGhpcy5jbGFzc2VzKVxuICAgICAgICB2YXIgY25zID0gT2JqZWN0LmtleXModGhpcy5jbGFzc2VzKTtcbiAgICAgICAgY25zLnNvcnQoKVxuICAgICAgICBjbnMuZm9yRWFjaChmdW5jdGlvbihjbil7XG4gICAgICAgICAgICB2YXIgY2xzID0gbW9kZWwuY2xhc3Nlc1tjbl07XG4gICAgICAgICAgICBjbHMuYWxsQXR0cmlidXRlcyA9IG9iajJhcnJheShjbHMuYXR0cmlidXRlcylcbiAgICAgICAgICAgIGNscy5hbGxSZWZlcmVuY2VzID0gb2JqMmFycmF5KGNscy5yZWZlcmVuY2VzKVxuICAgICAgICAgICAgY2xzLmFsbENvbGxlY3Rpb25zID0gb2JqMmFycmF5KGNscy5jb2xsZWN0aW9ucylcbiAgICAgICAgICAgIGNscy5hbGxBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oeCl7IHgua2luZCA9IFwiYXR0cmlidXRlXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJyZWZlcmVuY2VcIjsgfSk7XG4gICAgICAgICAgICBjbHMuYWxsQ29sbGVjdGlvbnMuZm9yRWFjaChmdW5jdGlvbih4KXsgeC5raW5kID0gXCJjb2xsZWN0aW9uXCI7IH0pO1xuICAgICAgICAgICAgY2xzLmFsbFBhcnRzID0gY2xzLmFsbEF0dHJpYnV0ZXMuY29uY2F0KGNscy5hbGxSZWZlcmVuY2VzKS5jb25jYXQoY2xzLmFsbENvbGxlY3Rpb25zKTtcbiAgICAgICAgICAgIGNscy5hbGxQYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsYil7IHJldHVybiBhLm5hbWUgPCBiLm5hbWUgPyAtMSA6IGEubmFtZSA+IGIubmFtZSA/IDEgOiAwOyB9KTtcbiAgICAgICAgICAgIG1vZGVsLmFsbENsYXNzZXMucHVzaChjbHMpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGNsc1tcImV4dGVuZHNcIl0gPSBjbHNbXCJleHRlbmRzXCJdLm1hcChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICB2YXIgYmMgPSBtb2RlbC5jbGFzc2VzW2VdO1xuICAgICAgICAgICAgICAgIGlmIChiYy5leHRlbmRlZEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJjLmV4dGVuZGVkQnkucHVzaChjbHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmMuZXh0ZW5kZWRCeSA9IFtjbHNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYmM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjbHMucmVmZXJlbmNlcykuZm9yRWFjaChmdW5jdGlvbihybil7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBjbHMucmVmZXJlbmNlc1tybl07XG4gICAgICAgICAgICAgICAgci50eXBlID0gbW9kZWwuY2xhc3Nlc1tyLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2xzLmNvbGxlY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGNuKXtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IGNscy5jb2xsZWN0aW9uc1tjbl07XG4gICAgICAgICAgICAgICAgYy50eXBlID0gbW9kZWwuY2xhc3Nlc1tjLnJlZmVyZW5jZWRUeXBlXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIE1vZGVsXG5cbi8vXG5jbGFzcyBDbGFzcyB7XG59IC8vIGVuZCBvZiBjbGFzcyBDbGFzc1xuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1cGVyY2xhc3NlcyBvZiB0aGUgZ2l2ZW4gY2xhc3MuXG4vLyAoXG4vLyBUaGUgcmV0dXJuZWQgbGlzdCBkb2VzICpub3QqIGNvbnRhaW4gY2xzLilcbi8vIEFyZ3M6XG4vLyAgICBjbHMgKG9iamVjdCkgIEEgY2xhc3MgZnJvbSBhIGNvbXBpbGVkIG1vZGVsXG4vLyBSZXR1cm5zOlxuLy8gICAgbGlzdCBvZiBjbGFzcyBvYmplY3RzLCBzb3J0ZWQgYnkgY2xhc3MgbmFtZVxuZnVuY3Rpb24gZ2V0U3VwZXJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHNbXCJleHRlbmRzXCJdIHx8IGNsc1tcImV4dGVuZHNcIl0ubGVuZ3RoID09IDApIHJldHVybiBbXTtcbiAgICB2YXIgYW5jID0gY2xzW1wiZXh0ZW5kc1wiXS5tYXAoZnVuY3Rpb24oc2MpeyByZXR1cm4gZ2V0U3VwZXJjbGFzc2VzKHNjKTsgfSk7XG4gICAgdmFyIGFsbCA9IGNsc1tcImV4dGVuZHNcIl0uY29uY2F0KGFuYy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlbHQpeyByZXR1cm4gYWNjLmNvbmNhdChlbHQpOyB9LCBbXSkpO1xuICAgIHZhciBhbnMgPSBhbGwucmVkdWNlKGZ1bmN0aW9uKGFjYyxlbHQpeyBhY2NbZWx0Lm5hbWVdID0gZWx0OyByZXR1cm4gYWNjOyB9LCB7fSk7XG4gICAgcmV0dXJuIG9iajJhcnJheShhbnMpO1xufVxuXG4vLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIHN1YmNsYXNzZXMgb2YgdGhlIGdpdmVuIGNsYXNzLlxuLy8gKFRoZSByZXR1cm5lZCBsaXN0IGRvZXMgKm5vdCogY29udGFpbiBjbHMuKVxuLy8gQXJnczpcbi8vICAgIGNscyAob2JqZWN0KSAgQSBjbGFzcyBmcm9tIGEgY29tcGlsZWQgbW9kZWxcbi8vIFJldHVybnM6XG4vLyAgICBsaXN0IG9mIGNsYXNzIG9iamVjdHMsIHNvcnRlZCBieSBjbGFzcyBuYW1lXG5mdW5jdGlvbiBnZXRTdWJjbGFzc2VzKGNscyl7XG4gICAgaWYgKHR5cGVvZihjbHMpID09PSBcInN0cmluZ1wiIHx8ICFjbHMuZXh0ZW5kZWRCeSB8fCBjbHMuZXh0ZW5kZWRCeS5sZW5ndGggPT0gMCkgcmV0dXJuIFtdO1xuICAgIHZhciBkZXNjID0gY2xzLmV4dGVuZGVkQnkubWFwKGZ1bmN0aW9uKHNjKXsgcmV0dXJuIGdldFN1YmNsYXNzZXMoc2MpOyB9KTtcbiAgICB2YXIgYWxsID0gY2xzLmV4dGVuZGVkQnkuY29uY2F0KGRlc2MucmVkdWNlKGZ1bmN0aW9uKGFjYywgZWx0KXsgcmV0dXJuIGFjYy5jb25jYXQoZWx0KTsgfSwgW10pKTtcbiAgICB2YXIgYW5zID0gYWxsLnJlZHVjZShmdW5jdGlvbihhY2MsZWx0KXsgYWNjW2VsdC5uYW1lXSA9IGVsdDsgcmV0dXJuIGFjYzsgfSwge30pO1xuICAgIHJldHVybiBvYmoyYXJyYXkoYW5zKTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmZiBzdWIgaXMgYSBzdWJjbGFzcyBvZiBzdXAuXG5mdW5jdGlvbiBpc1N1YmNsYXNzKHN1YixzdXApIHtcbiAgICBpZiAoc3ViID09PSBzdXApIHJldHVybiB0cnVlO1xuICAgIGlmICh0eXBlb2Yoc3ViKSA9PT0gXCJzdHJpbmdcIiB8fCAhc3ViW1wiZXh0ZW5kc1wiXSB8fCBzdWJbXCJleHRlbmRzXCJdLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHIgPSBzdWJbXCJleHRlbmRzXCJdLmZpbHRlcihmdW5jdGlvbih4KXsgcmV0dXJuIHg9PT1zdXAgfHwgaXNTdWJjbGFzcyh4LCBzdXApOyB9KTtcbiAgICByZXR1cm4gci5sZW5ndGggPiAwO1xufVxuXG4vL1xuY2xhc3MgTm9kZSB7XG4gICAgLy8gQXJnczpcbiAgICAvLyAgIHRlbXBsYXRlIChUZW1wbGF0ZSBvYmplY3QpIHRoZSB0ZW1wbGF0ZSB0aGF0IG93bnMgdGhpcyBub2RlXG4gICAgLy8gICBwYXJlbnQgKG9iamVjdCkgUGFyZW50IG9mIHRoZSBuZXcgbm9kZS5cbiAgICAvLyAgIG5hbWUgKHN0cmluZykgTmFtZSBmb3IgdGhlIG5vZGVcbiAgICAvLyAgIHBjb21wIChvYmplY3QpIFBhdGggY29tcG9uZW50IGZvciB0aGUgcm9vdCwgdGhpcyBpcyBhIGNsYXNzLiBGb3Igb3RoZXIgbm9kZXMsIGFuIGF0dHJpYnV0ZSwgXG4gICAgLy8gICAgICAgICAgICAgICAgICByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24gZGVjcmlwdG9yLlxuICAgIC8vICAgcHR5cGUgKG9iamVjdCBvciBzdHJpbmcpIFR5cGUgb2YgcGNvbXAuXG4gICAgY29uc3RydWN0b3IgKHRlbXBsYXRlLCBwYXJlbnQsIG5hbWUsIHBjb21wLCBwdHlwZSkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHRoZSB0ZW1wbGF0ZSBJIGJlbG9uZyB0by5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTsgICAgIC8vIGRpc3BsYXkgbmFtZVxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107ICAgLy8gY2hpbGQgbm9kZXNcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7IC8vIHBhcmVudCBub2RlXG4gICAgICAgIHRoaXMucGNvbXAgPSBwY29tcDsgICAvLyBwYXRoIGNvbXBvbmVudCByZXByZXNlbnRlZCBieSB0aGUgbm9kZS4gQXQgcm9vdCwgdGhpcyBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0aW5nIGNsYXNzLiBPdGhlcndpc2UsIHBvaW50cyB0byBhbiBhdHRyaWJ1dGUgKHNpbXBsZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWZlcmVuY2UsIG9yIGNvbGxlY3Rpb24pLlxuICAgICAgICB0aGlzLnB0eXBlICA9IHB0eXBlOyAgLy8gcGF0aCB0eXBlLiBUaGUgdHlwZSBvZiB0aGUgcGF0aCBhdCB0aGlzIG5vZGUsIGkuZS4gdGhlIHR5cGUgb2YgcGNvbXAuIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHNpbXBsZSBhdHRyaWJ1dGVzLCB0aGlzIGlzIGEgc3RyaW5nLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWwuIE1heSBiZSBvdmVycmlkZW4gYnkgc3ViY2xhc3MgY29uc3RyYWludC5cbiAgICAgICAgdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgPSBudWxsOyAvLyBzdWJjbGFzcyBjb25zdHJhaW50IChpZiBhbnkpLiBQb2ludHMgdG8gYSBjbGFzcyBpbiB0aGUgbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHNwZWNpZmllZCwgb3ZlcnJpZGVzIHB0eXBlIGFzIHRoZSB0eXBlIG9mIHRoZSBub2RlLlxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gW107Ly8gYWxsIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMudmlldyA9IG51bGw7ICAgIC8vIElmIHNlbGVjdGVkIGZvciByZXR1cm4sIHRoaXMgaXMgaXRzIGNvbHVtbiMuXG4gICAgICAgIHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLnBhdGg7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IHJvb3ROb2RlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGUucXRyZWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gb3BlcmF0b3IgaXMgdmFsaWQgZm9yIHRoaXMgbm9kZS5cbiAgICBvcFZhbGlkIChvcCl7XG4gICAgICAgIGlmKCF0aGlzLnBhcmVudCAmJiAhb3AudmFsaWRGb3JSb290KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKHR5cGVvZih0aGlzLnB0eXBlKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgIGlmKCEgb3AudmFsaWRGb3JBdHRyKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgaWYoIG9wLnZhbGlkVHlwZXMgJiYgb3AudmFsaWRUeXBlcy5pbmRleE9mKHRoaXMucHR5cGUpID09IC0xKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYodGhpcy5wdHlwZS5uYW1lICYmICEgb3AudmFsaWRGb3JDbGFzcykgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBsaXN0IGlzIHZhbGlkIGFzIGEgbGlzdCBjb25zdHJhaW50IG9wdGlvbiBmb3JcbiAgICAvLyB0aGUgbm9kZSBuLiBBIGxpc3QgaXMgdmFsaWQgdG8gdXNlIGluIGEgbGlzdCBjb25zdHJhaW50IGF0IG5vZGUgbiBpZmZcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgZXF1YWwgdG8gb3IgYSBzdWJjbGFzcyBvZiB0aGUgbm9kZSdzIHR5cGVcbiAgICAvLyAgICAgKiB0aGUgbGlzdCdzIHR5cGUgaXMgYSBzdXBlcmNsYXNzIG9mIHRoZSBub2RlJ3MgdHlwZS4gSW4gdGhpcyBjYXNlLFxuICAgIC8vICAgICAgIGVsZW1lbnRzIGluIHRoZSBsaXN0IHRoYXQgYXJlIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIG5vZGUncyB0eXBlXG4gICAgLy8gICAgICAgYXJlIGF1dG9tYXRpY2FsbHkgZmlsdGVyZWQgb3V0LlxuICAgIGxpc3RWYWxpZCAobGlzdCl7XG4gICAgICAgIHZhciBudCA9IHRoaXMuc3VidHlwZUNvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICAgICAgaWYgKHR5cGVvZihudCkgPT09IFwic3RyaW5nXCIgKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBsdCA9IHRoaXMudGVtcGxhdGUubW9kZWwuY2xhc3Nlc1tsaXN0LnR5cGVdO1xuICAgICAgICByZXR1cm4gaXNTdWJjbGFzcyhsdCwgbnQpIHx8IGlzU3ViY2xhc3MobnQsIGx0KTtcbiAgICB9XG5cblxuICAgIC8vXG4gICAgZ2V0IHBhdGggKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucGF0aCArXCIuXCIgOiBcIlwiKSArIHRoaXMubmFtZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgbm9kZVR5cGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgdGhpcy5wdHlwZTtcbiAgICB9XG4gICAgLy9cbiAgICBnZXQgaXNCaW9FbnRpdHkgKCkge1xuICAgICAgICBmdW5jdGlvbiBjayhjbHMpIHtcbiAgICAgICAgICAgIGlmIChjbHMubmFtZSA9PT0gXCJCaW9FbnRpdHlcIikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNscy5leHRlbmRzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2soY2xzLmV4dGVuZHNbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sodGhpcy5ub2RlVHlwZSk7XG4gICAgfVxuICAgIC8vXG4gICAgZ2V0IGlzU2VsZWN0ZWQgKCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmlldyAhPT0gbnVsbCAmJiB0aGlzLnZpZXcgIT09IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgc2VsZWN0ICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhdGg7XG4gICAgICAgIGxldCB0ID0gdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgbGV0IGkgPSB0LnNlbGVjdC5pbmRleE9mKHApO1xuICAgICAgICB0aGlzLnZpZXcgPSBpID49IDAgPyBpIDogKHQuc2VsZWN0LnB1c2gocCkgLSAxKTtcbiAgICB9XG4gICAgdW5zZWxlY3QgKCkge1xuICAgICAgICBsZXQgcCA9IHRoaXMucGF0aDtcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRlbXBsYXRlO1xuICAgICAgICBsZXQgaSA9IHQuc2VsZWN0LmluZGV4T2YocCk7XG4gICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBwYXRoIGZyb20gdGhlIHNlbGVjdCBsaXN0XG4gICAgICAgICAgICB0LnNlbGVjdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW51bWJlciBub2RlcyBoZXJlXG4gICAgICAgICAgICB0LnNlbGVjdC5zbGljZShpKS5mb3JFYWNoKCAocCxqKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnRlbXBsYXRlLmdldE5vZGVCeVBhdGgocCk7XG4gICAgICAgICAgICAgICAgbi52aWV3IC09IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xuICAgIH1cbiAgICBzZXRTb3J0KG5ld2Rpcil7XG4gICAgICAgIGxldCBvbGRkaXIgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQuZGlyIDogXCJub25lXCI7XG4gICAgICAgIGxldCBvbGRsZXYgPSB0aGlzLnNvcnQgPyB0aGlzLnNvcnQubGV2ZWwgOiAtMTtcbiAgICAgICAgbGV0IG1heGxldiA9IC0xO1xuICAgICAgICBsZXQgcmVudW1iZXIgPSBmdW5jdGlvbiAobil7XG4gICAgICAgICAgICBpZiAobi5zb3J0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZGxldiA+PSAwICYmIG4uc29ydC5sZXZlbCA+IG9sZGxldilcbiAgICAgICAgICAgICAgICAgICAgbi5zb3J0LmxldmVsIC09IDE7XG4gICAgICAgICAgICAgICAgbWF4bGV2ID0gTWF0aC5tYXgobWF4bGV2LCBuLnNvcnQubGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbi5jaGlsZHJlbi5mb3JFYWNoKHJlbnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5ld2RpciB8fCBuZXdkaXIgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gbm90IHNvcnRlZFxuICAgICAgICAgICAgdGhpcy5zb3J0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChvbGRsZXYgPj0gMCl7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSBzb3J0ZWQgYmVmb3JlLCBuZWVkIHRvIHJlbnVtYmVyIGFueSBleGlzdGluZyBzb3J0IGNmZ3MuXG4gICAgICAgICAgICAgICAgcmVudW1iZXIodGhpcy50ZW1wbGF0ZS5xdHJlZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBzZXQgdG8gc29ydGVkXG4gICAgICAgICAgICBpZiAob2xkbGV2ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgbm90IHNvcnRlZCBiZWZvcmUsIG5lZWQgdG8gZmluZCBuZXh0IGxldmVsLlxuICAgICAgICAgICAgICAgIHJlbnVtYmVyKHRoaXMudGVtcGxhdGUucXRyZWUpO1xuICAgICAgICAgICAgICAgIG9sZGxldiA9IG1heGxldiArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNvcnQgPSB7IGRpcjpuZXdkaXIsIGxldmVsOiBvbGRsZXYgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFyZ3M6XG4gICAgLy8gICBzY05hbWUgKHR5cGUpIE5hbWUgb2Ygc3ViY2xhc3MuXG4gICAgc2V0U3ViY2xhc3NDb25zdHJhaW50IChzY05hbWUpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzO1xuICAgICAgICAvLyByZW1vdmUgYW55IGV4aXN0aW5nIHN1YmNsYXNzIGNvbnN0cmFpbnRcbiAgICAgICAgbi5jb25zdHJhaW50cyA9IG4uY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uIChjKXsgcmV0dXJuIGMuY3R5cGUgIT09IFwic3ViY2xhc3NcIjsgfSk7XG4gICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHNjTmFtZSl7XG4gICAgICAgICAgICBsZXQgY2xzID0gdGhpcy50ZW1wbGF0ZS5tb2RlbC5jbGFzc2VzW3NjTmFtZV07XG4gICAgICAgICAgICBpZighY2xzKSB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIGNsYXNzIFwiICsgc2NOYW1lO1xuICAgICAgICAgICAgbi5jb25zdHJhaW50cy5wdXNoKHsgY3R5cGU6XCJzdWJjbGFzc1wiLCBvcDpcIklTQVwiLCBwYXRoOm4ucGF0aCwgdHlwZTpjbHMubmFtZSB9KTtcbiAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrKG5vZGUsIHJlbW92ZWQpIHtcbiAgICAgICAgICAgIGxldCBjbHMgPSBub2RlLnN1YmNsYXNzQ29uc3RyYWludCB8fCBub2RlLnB0eXBlO1xuICAgICAgICAgICAgbGV0IGMyID0gW107XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gICAgICAgICAgICAgICAgaWYoYy5uYW1lIGluIGNscy5hdHRyaWJ1dGVzIHx8IGMubmFtZSBpbiBjbHMucmVmZXJlbmNlcyB8fCBjLm5hbWUgaW4gY2xzLmNvbGxlY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGMyLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrKGMsIHJlbW92ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQucHVzaChjKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuID0gYzI7XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVtb3ZlZCA9IGNoZWNrKG4sW10pO1xuICAgICAgICBoaWRlRGlhbG9nKCk7XG4gICAgICAgIHVwZGF0ZShuKTtcbiAgICAgICAgaWYocmVtb3ZlZC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBhbGVydChcIkNvbnN0cmFpbmluZyB0byBzdWJjbGFzcyBcIiArIChzY05hbWUgfHwgbi5wdHlwZS5uYW1lKVxuICAgICAgICAgICAgICAgICsgXCIgY2F1c2VkIHRoZSBmb2xsb3dpbmcgcGF0aHMgdG8gYmUgcmVtb3ZlZDogXCIgXG4gICAgICAgICAgICAgICAgKyByZW1vdmVkLm1hcChuID0+IG4ucGF0aCkuam9pbihcIiwgXCIpKTsgXG4gICAgICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgfVxuXG4gICAgcmVtb3ZlICgpIHtcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBhcmVudDtcbiAgICAgICAgaWYgKCFwKSByZXR1cm47XG4gICAgICAgIC8vIEZpcnN0LCByZW1vdmUgYWxsIGNvbnN0cmFpbnRzIG9uIHRoaXMgb3IgZGVzY2VuZGFudHNcbiAgICAgICAgZnVuY3Rpb24gcm1jICh4KSB7XG4gICAgICAgICAgICB4LnVuc2VsZWN0KCk7XG4gICAgICAgICAgICB4LmNvbnN0cmFpbnRzLmZvckVhY2goYyA9PiB4LnJlbW92ZUNvbnN0cmFpbnQoYykpO1xuICAgICAgICAgICAgeC5jaGlsZHJlbi5mb3JFYWNoKHJtYyk7XG4gICAgICAgIH1cbiAgICAgICAgcm1jKHRoaXMpO1xuICAgICAgICAvLyBOb3cgcmVtb3ZlIHRoZSBzdWJ0cmVlIGF0IG4uXG4gICAgICAgIHAuY2hpbGRyZW4uc3BsaWNlKHAuY2hpbGRyZW4uaW5kZXhPZih0aGlzKSwgMSk7XG4gICAgfVxuXG4gICAgLy8gQWRkcyBhIG5ldyBjb25zdHJhaW50IHRvIGEgbm9kZSBhbmQgcmV0dXJucyBpdC5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgYyAoY29uc3RyYWludCkgSWYgZ2l2ZW4sIHVzZSB0aGF0IGNvbnN0cmFpbnQuIE90aGVyd2lzZSBhdXRvZ2VuZXJhdGUuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIFRoZSBuZXcgY29uc3RyYWludC5cbiAgICAvL1xuICAgIGFkZENvbnN0cmFpbnQgKGMpIHtcbiAgICAgICAgaWYgKGMpIHtcbiAgICAgICAgICAgIC8vIGp1c3QgdG8gYmUgc3VyZVxuICAgICAgICAgICAgYy5ub2RlID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvcCA9IE9QSU5ERVhbdGhpcy5wY29tcC5raW5kID09PSBcImF0dHJpYnV0ZVwiID8gXCI9XCIgOiBcIkxPT0tVUFwiXTtcbiAgICAgICAgICAgIGMgPSBuZXcgQ29uc3RyYWludCh7bm9kZTp0aGlzLCBvcDpvcC5vcCwgY3R5cGU6IG9wLmN0eXBlfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25zdHJhaW50cy5wdXNoKGMpO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLndoZXJlLnB1c2goYyk7XG4gICAgICAgIGlmIChjLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpIHtcbiAgICAgICAgICAgIGMuY29kZSA9IHRoaXMudGVtcGxhdGUubmV4dEF2YWlsYWJsZUNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV0gPSBjO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYztcbiAgICB9XG5cbiAgICByZW1vdmVDb25zdHJhaW50IChjKXtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cyA9IHRoaXMuY29uc3RyYWludHMuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS53aGVyZSA9IHRoaXMudGVtcGxhdGUud2hlcmUuZmlsdGVyKGZ1bmN0aW9uKGNjKXsgcmV0dXJuIGNjICE9PSBjOyB9KTtcbiAgICAgICAgZGVsZXRlIHRoaXMudGVtcGxhdGUuY29kZTJjW2MuY29kZV07XG4gICAgICAgIGlmIChjLmN0eXBlID09PSBcInN1YmNsYXNzXCIpIHRoaXMuc3ViY2xhc3NDb25zdHJhaW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxufSAvLyBlbmQgb2YgY2xhc3MgTm9kZVxuXG5jbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IgKHQsIG1vZGVsKSB7XG4gICAgICAgIHQgPSB0IHx8IHt9XG4gICAgICAgIHRoaXMubW9kZWwgPSB0Lm1vZGVsID8gZGVlcGModC5tb2RlbCkgOiB7IG5hbWU6IFwiZ2Vub21pY1wiIH07XG4gICAgICAgIHRoaXMubmFtZSA9IHQubmFtZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLnRpdGxlID0gdC50aXRsZSB8fCBcIlwiO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSB0LmNvbW1lbnQgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSB0LnNlbGVjdCA/IGRlZXBjKHQuc2VsZWN0KSA6IFtdO1xuICAgICAgICB0aGlzLndoZXJlID0gdC53aGVyZSA/IHQud2hlcmUubWFwKCBjID0+IGMuY2xvbmUgPyBjLmNsb25lKCkgOiBuZXcgQ29uc3RyYWludChjKSApIDogW107XG4gICAgICAgIHRoaXMuY29uc3RyYWludExvZ2ljID0gdC5jb25zdHJhaW50TG9naWMgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5qb2lucyA9IHQuam9pbnMgPyBkZWVwYyh0LmpvaW5zKSA6IFtdO1xuICAgICAgICB0aGlzLnRhZ3MgPSB0LnRhZ3MgPyBkZWVwYyh0LnRhZ3MpIDogW107XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IHQub3JkZXJCeSA/IGRlZXBjKHQub3JkZXJCeSkgOiBbXTtcbiAgICAgICAgdGhpcy5jb21waWxlKG1vZGVsKTtcbiAgICB9XG5cbiAgICBjb21waWxlIChtb2RlbCkge1xuICAgICAgICB2YXIgcm9vdHMgPSBbXVxuICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgIC8vIHRoZSB0cmVlIG9mIG5vZGVzIHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcXVlcnkgd2lsbCBnbyBoZXJlXG4gICAgICAgIHQucXRyZWUgPSBudWxsO1xuICAgICAgICAvLyBpbmRleCBvZiBjb2RlIHRvIGNvbnN0cmFpbnQgZ29ycyBoZXJlLlxuICAgICAgICB0LmNvZGUyYyA9IHt9XG4gICAgICAgIC8vIG5vcm1hbGl6ZSB0aGluZ3MgdGhhdCBtYXkgYmUgdW5kZWZpbmVkXG4gICAgICAgIHQuY29tbWVudCA9IHQuY29tbWVudCB8fCBcIlwiO1xuICAgICAgICB0LmRlc2NyaXB0aW9uID0gdC5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICAvL1xuICAgICAgICB2YXIgc3ViY2xhc3NDcyA9IFtdO1xuICAgICAgICB0LndoZXJlID0gKHQud2hlcmUgfHwgW10pLm1hcChjID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgcmF3IGNvbnRyYWludCBjb25maWdzIHRvIENvbnN0cmFpbnQgb2JqZWN0cy5cbiAgICAgICAgICAgIGxldCBjYyA9IG5ldyBDb25zdHJhaW50KGMpO1xuICAgICAgICAgICAgaWYgKGNjLmNvZGUpIHQuY29kZTJjW2NjLmNvZGVdID0gY2M7XG4gICAgICAgICAgICBjYy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIHN1YmNsYXNzQ3MucHVzaChjYyk7XG4gICAgICAgICAgICByZXR1cm4gY2M7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG11c3QgcHJvY2VzcyBhbnkgc3ViY2xhc3MgY29uc3RyYWludHMgZmlyc3QsIGZyb20gc2hvcnRlc3QgdG8gbG9uZ2VzdCBwYXRoXG4gICAgICAgIHN1YmNsYXNzQ3NcbiAgICAgICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucGF0aC5sZW5ndGggLSBiLnBhdGgubGVuZ3RoO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgICAgICB2YXIgbiA9IHQuYWRkUGF0aChjLnBhdGgsIG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgdmFyIGNscyA9IG1vZGVsLmNsYXNzZXNbYy50eXBlXTtcbiAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3MgXCIgKyBjLnR5cGU7XG4gICAgICAgICAgICAgICAgIG4uc3ViY2xhc3NDb25zdHJhaW50ID0gY2xzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vXG4gICAgICAgIHQud2hlcmUgJiYgdC53aGVyZS5mb3JFYWNoKGZ1bmN0aW9uKGMpe1xuICAgICAgICAgICAgdmFyIG4gPSB0LmFkZFBhdGgoYy5wYXRoLCBtb2RlbCk7XG4gICAgICAgICAgICBpZiAobi5jb25zdHJhaW50cylcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzLnB1c2goYylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBuLmNvbnN0cmFpbnRzID0gW2NdO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vXG4gICAgICAgIHQuc2VsZWN0ICYmIHQuc2VsZWN0LmZvckVhY2goZnVuY3Rpb24ocCxpKXtcbiAgICAgICAgICAgIHZhciBuID0gdC5hZGRQYXRoKHAsIG1vZGVsKTtcbiAgICAgICAgICAgIG4uc2VsZWN0KCk7XG4gICAgICAgIH0pXG4gICAgICAgIHQuam9pbnMgJiYgdC5qb2lucy5mb3JFYWNoKGZ1bmN0aW9uKGope1xuICAgICAgICAgICAgdmFyIG4gPSB0LmFkZFBhdGgoaiwgbW9kZWwpO1xuICAgICAgICAgICAgbi5qb2luID0gXCJvdXRlclwiO1xuICAgICAgICB9KVxuICAgICAgICB0Lm9yZGVyQnkgJiYgdC5vcmRlckJ5LmZvckVhY2goZnVuY3Rpb24obywgaSl7XG4gICAgICAgICAgICB2YXIgcCA9IE9iamVjdC5rZXlzKG8pWzBdXG4gICAgICAgICAgICB2YXIgZGlyID0gb1twXVxuICAgICAgICAgICAgdmFyIG4gPSB0LmFkZFBhdGgocCwgbW9kZWwpO1xuICAgICAgICAgICAgbi5zb3J0ID0geyBkaXI6IGRpciwgbGV2ZWw6IGkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdC5xdHJlZSkge1xuICAgICAgICAgICAgdGhyb3cgXCJObyBwYXRocyBpbiBxdWVyeS5cIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH1cblxuXG4gICAgLy8gVHVybnMgYSBxdHJlZSBzdHJ1Y3R1cmUgYmFjayBpbnRvIGEgXCJyYXdcIiB0ZW1wbGF0ZS4gXG4gICAgLy9cbiAgICB1bmNvbXBpbGVUZW1wbGF0ZSAoKXtcbiAgICAgICAgbGV0IHRtcGx0ID0gdGhpcztcbiAgICAgICAgbGV0IHQgPSB7XG4gICAgICAgICAgICBuYW1lOiB0bXBsdC5uYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRtcGx0LnRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRtcGx0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgY29tbWVudDogdG1wbHQuY29tbWVudCxcbiAgICAgICAgICAgIHJhbms6IHRtcGx0LnJhbmssXG4gICAgICAgICAgICBtb2RlbDogZGVlcGModG1wbHQubW9kZWwpLFxuICAgICAgICAgICAgdGFnczogZGVlcGModG1wbHQudGFncyksXG4gICAgICAgICAgICBzZWxlY3QgOiB0bXBsdC5zZWxlY3QuY29uY2F0KCksXG4gICAgICAgICAgICB3aGVyZSA6IFtdLFxuICAgICAgICAgICAgam9pbnMgOiBbXSxcbiAgICAgICAgICAgIGNvbnN0cmFpbnRMb2dpYzogdG1wbHQuY29uc3RyYWludExvZ2ljIHx8IFwiXCIsXG4gICAgICAgICAgICBvcmRlckJ5IDogW11cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZWFjaChuKXtcbiAgICAgICAgICAgIGxldCBwID0gbi5wYXRoXG4gICAgICAgICAgICBpZiAobi5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gcGF0aCBzaG91bGQgYWxyZWFkeSBiZSB0aGVyZVxuICAgICAgICAgICAgICAgIGlmICh0LnNlbGVjdC5pbmRleE9mKG4ucGF0aCkgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkFub21hbHkgZGV0ZWN0ZWQgaW4gc2VsZWN0IGxpc3QuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAobi5jb25zdHJhaW50cyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihjKXtcbiAgICAgICAgICAgICAgICAgbGV0IGNjID0gbmV3IENvbnN0cmFpbnQoYyk7XG4gICAgICAgICAgICAgICAgIGNjLm5vZGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICB0LndoZXJlLnB1c2goY2MpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaWYgKG4uam9pbiA9PT0gXCJvdXRlclwiKSB7XG4gICAgICAgICAgICAgICAgdC5qb2lucy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG4uc29ydCkge1xuICAgICAgICAgICAgICAgIGxldCBzID0ge31cbiAgICAgICAgICAgICAgICBzW3BdID0gbi5zb3J0LmRpci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHQub3JkZXJCeVtuLnNvcnQubGV2ZWxdID0gcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG4uY2hpbGRyZW4uZm9yRWFjaChyZWFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVhY2godG1wbHQucXRyZWUpO1xuICAgICAgICB0Lm9yZGVyQnkgPSB0Lm9yZGVyQnkuZmlsdGVyKG8gPT4gbyk7XG4gICAgICAgIHJldHVybiB0XG4gICAgfVxuXG4gICAgZ2V0Tm9kZUJ5UGF0aCAocCkge1xuICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgIGlmICghcCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGxldCBwYXJ0cyA9IHAuc3BsaXQoXCIuXCIpO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7XG4gICAgICAgIGlmIChuLm5hbWUgIT09IHBhcnRzWzBdKSByZXR1cm4gbnVsbDtcbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgY25hbWUgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGxldCBjID0gKG4uY2hpbGRyZW4gfHwgW10pLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gY25hbWUpWzBdO1xuICAgICAgICAgICAgaWYgKCFjKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIG4gPSBjO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cblxuICAgIC8vIEFkZHMgYSBwYXRoIHRvIHRoZSBxdHJlZSBmb3IgdGhpcyB0ZW1wbGF0ZS4gUGF0aCBpcyBzcGVjaWZpZWQgYXMgYSBkb3R0ZWQgbGlzdCBvZiBuYW1lcy5cbiAgICAvLyBBcmdzOlxuICAgIC8vICAgcGF0aCAoc3RyaW5nKSB0aGUgcGF0aCB0byBhZGQuIFxuICAgIC8vICAgbW9kZWwgb2JqZWN0IENvbXBpbGVkIGRhdGEgbW9kZWwuXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIGxhc3QgcGF0aCBjb21wb25lbnQgY3JlYXRlZC4gXG4gICAgLy8gU2lkZSBlZmZlY3RzOlxuICAgIC8vICAgQ3JlYXRlcyBuZXcgbm9kZXMgYXMgbmVlZGVkIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHF0cmVlLlxuICAgIGFkZFBhdGggKHBhdGgsIG1vZGVsKXtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gdGhpcztcbiAgICAgICAgaWYgKHR5cGVvZihwYXRoKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgbGV0IGNsYXNzZXMgPSBtb2RlbC5jbGFzc2VzO1xuICAgICAgICBsZXQgbGFzdHQgPSBudWxsO1xuICAgICAgICBsZXQgbiA9IHRoaXMucXRyZWU7ICAvLyBjdXJyZW50IG5vZGUgcG9pbnRlclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGxpc3QsIG4pe1xuICAgICAgICAgICAgIHJldHVybiBsaXN0LmZpbHRlcihmdW5jdGlvbih4KXtyZXR1cm4geC5uYW1lID09PSBufSlbMF1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGguZm9yRWFjaChmdW5jdGlvbihwLCBpKXtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlLnF0cmVlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHJvb3QgYWxyZWFkeSBleGlzdHMsIG1ha2Ugc3VyZSBuZXcgcGF0aCBoYXMgc2FtZSByb290LlxuICAgICAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwICE9PSBuLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNhbm5vdCBhZGQgcGF0aCBmcm9tIGRpZmZlcmVudCByb290LlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QgcGF0aCB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3BdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNscylcbiAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgZmluZCBjbGFzczogXCIgKyBwO1xuICAgICAgICAgICAgICAgICAgICBuID0gdGVtcGxhdGUucXRyZWUgPSBuZXcgTm9kZSggdGVtcGxhdGUsIG51bGwsIHAsIGNscywgY2xzICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbiBpcyBwb2ludGluZyB0byB0aGUgcGFyZW50LCBhbmQgcCBpcyB0aGUgbmV4dCBuYW1lIGluIHRoZSBwYXRoLlxuICAgICAgICAgICAgICAgIHZhciBubiA9IGZpbmQobi5jaGlsZHJlbiwgcCk7XG4gICAgICAgICAgICAgICAgaWYgKG5uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHAgaXMgYWxyZWFkeSBhIGNoaWxkXG4gICAgICAgICAgICAgICAgICAgIG4gPSBubjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gYWRkIGEgbmV3IG5vZGUgZm9yIHBcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QsIGxvb2t1cCBwXG4gICAgICAgICAgICAgICAgICAgIHZhciB4O1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xzID0gbi5zdWJjbGFzc0NvbnN0cmFpbnQgfHwgbi5wdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNscy5hdHRyaWJ1dGVzW3BdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gY2xzLmF0dHJpYnV0ZXNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSB4LnR5cGUgLy8gPC0tIEEgc3RyaW5nIVxuICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBjbHMucmVmZXJlbmNlc1twXSB8fCBjbHMuY29sbGVjdGlvbnNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHMgPSBjbGFzc2VzW3gucmVmZXJlbmNlZFR5cGVdIC8vIDwtLVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjbHMpIHRocm93IFwiQ291bGQgbm90IGZpbmQgY2xhc3M6IFwiICsgcDtcbiAgICAgICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBmaW5kIG1lbWJlciBuYW1lZCBcIiArIHAgKyBcIiBpbiBjbGFzcyBcIiArIGNscy5uYW1lICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBub2RlLCBhZGQgaXQgdG8gbidzIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIG5uID0gbmV3IE5vZGUodGVtcGxhdGUsIG4sIHAsIHgsIGNscyk7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBubjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSBsYXN0IG5vZGUgaW4gdGhlIHBhdGhcbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuIFxuICAgIC8vIFJldHVybnMgYSBzaW5nbGUgY2hhcmFjdGVyIGNvbnN0cmFpbnQgY29kZSBpbiB0aGUgcmFuZ2UgQS1aIHRoYXQgaXMgbm90IGFscmVhZHlcbiAgICAvLyB1c2VkIGluIHRoZSBnaXZlbiB0ZW1wbGF0ZS5cbiAgICAvL1xuICAgIG5leHRBdmFpbGFibGVDb2RlICgpe1xuICAgICAgICBmb3IodmFyIGk9IFwiQVwiLmNoYXJDb2RlQXQoMCk7IGkgPD0gXCJaXCIuY2hhckNvZGVBdCgwKTsgaSsrKXtcbiAgICAgICAgICAgIHZhciBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShpKTtcbiAgICAgICAgICAgIGlmICghIChjIGluIHRoaXMuY29kZTJjKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxuXG4gICAgLy8gU2V0cyB0aGUgY29uc3RyYWludCBsb2dpYyBleHByZXNzaW9uIGZvciB0aGlzIHRlbXBsYXRlLlxuICAgIC8vIEluIHRoZSBwcm9jZXNzLCBhbHNvIFwiY29ycmVjdHNcIiB0aGUgZXhwcmVzc2lvbiBhcyBmb2xsb3dzOlxuICAgIC8vICAgICogYW55IGNvZGVzIGluIHRoZSBleHByZXNzaW9uIHRoYXQgYXJlIG5vdCBhc3NvY2lhdGVkIHdpdGhcbiAgICAvLyAgICAgIGFueSBjb25zdHJhaW50IGluIHRoZSBjdXJyZW50IHRlbXBsYXRlIGFyZSByZW1vdmVkIGFuZCB0aGVcbiAgICAvLyAgICAgIGV4cHJlc3Npb24gbG9naWMgdXBkYXRlZCBhY2NvcmRpbmdseVxuICAgIC8vICAgICogYW5kIGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB0aGF0IGFyZSBub3QgaW4gdGhlIGV4cHJlc3Npb25cbiAgICAvLyAgICAgIGFyZSBBTkRlZCB0byB0aGUgZW5kLlxuICAgIC8vIEZvciBleGFtcGxlLCBpZiB0aGUgY3VycmVudCB0ZW1wbGF0ZSBoYXMgY29kZXMgQSwgQiwgYW5kIEMsIGFuZFxuICAgIC8vIHRoZSBleHByZXNzaW9uIGlzIFwiKEEgb3IgRCkgYW5kIEJcIiwgdGhlIEQgZHJvcHMgb3V0IGFuZCBDIGlzXG4gICAgLy8gYWRkZWQsIHJlc3VsdGluZyBpbiBcIkEgYW5kIEIgYW5kIENcIi4gXG4gICAgLy8gQXJnczpcbiAgICAvLyAgIGV4IChzdHJpbmcpIHRoZSBleHByZXNzaW9uXG4gICAgLy8gUmV0dXJuczpcbiAgICAvLyAgIHRoZSBcImNvcnJlY3RlZFwiIGV4cHJlc3Npb25cbiAgICAvLyAgIFxuICAgIHNldExvZ2ljRXhwcmVzc2lvbiAoZXgpIHtcbiAgICAgICAgZXggPSBleCA/IGV4IDogKHRoaXMuY29uc3RyYWludExvZ2ljIHx8IFwiXCIpXG4gICAgICAgIHZhciBhc3Q7IC8vIGFic3RyYWN0IHN5bnRheCB0cmVlXG4gICAgICAgIHZhciBzZWVuID0gW107XG4gICAgICAgIHZhciB0bXBsdCA9IHRoaXM7XG4gICAgICAgIGZ1bmN0aW9uIHJlYWNoKG4sbGV2KXtcbiAgICAgICAgICAgIGlmICh0eXBlb2YobikgPT09IFwic3RyaW5nXCIgKXtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGF0IG4gaXMgYSBjb25zdHJhaW50IGNvZGUgaW4gdGhlIHRlbXBsYXRlLiBcbiAgICAgICAgICAgICAgICAvLyBJZiBub3QsIHJlbW92ZSBpdCBmcm9tIHRoZSBleHByLlxuICAgICAgICAgICAgICAgIC8vIEFsc28gcmVtb3ZlIGl0IGlmIGl0J3MgdGhlIGNvZGUgZm9yIGEgc3ViY2xhc3MgY29uc3RyYWludFxuICAgICAgICAgICAgICAgIHNlZW4ucHVzaChuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG4gaW4gdG1wbHQuY29kZTJjICYmIHRtcGx0LmNvZGUyY1tuXS5jdHlwZSAhPT0gXCJzdWJjbGFzc1wiKSA/IG4gOiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNtcyA9IG4uY2hpbGRyZW4ubWFwKGZ1bmN0aW9uKGMpe3JldHVybiByZWFjaChjLCBsZXYrMSk7fSkuZmlsdGVyKGZ1bmN0aW9uKHgpe3JldHVybiB4O30pOztcbiAgICAgICAgICAgIHZhciBjbXNzID0gY21zLmpvaW4oXCIgXCIrbi5vcCtcIiBcIik7XG4gICAgICAgICAgICByZXR1cm4gY21zLmxlbmd0aCA9PT0gMCA/IFwiXCIgOiBsZXYgPT09IDAgfHwgY21zLmxlbmd0aCA9PT0gMSA/IGNtc3MgOiBcIihcIiArIGNtc3MgKyBcIilcIlxuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhc3QgPSBleCA/IHBhcnNlci5wYXJzZShleCkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KGVycik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJhaW50TG9naWM7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGxleCA9IGFzdCA/IHJlYWNoKGFzdCwwKSA6IFwiXCI7XG4gICAgICAgIC8vIGlmIGFueSBjb25zdHJhaW50IGNvZGVzIGluIHRoZSB0ZW1wbGF0ZSB3ZXJlIG5vdCBzZWVuIGluIHRoZSBleHByZXNzaW9uLFxuICAgICAgICAvLyBBTkQgdGhlbSBpbnRvIHRoZSBleHByZXNzaW9uIChleGNlcHQgSVNBIGNvbnN0cmFpbnRzKS5cbiAgICAgICAgdmFyIHRvQWRkID0gT2JqZWN0LmtleXModGhpcy5jb2RlMmMpLmZpbHRlcihmdW5jdGlvbihjKXtcbiAgICAgICAgICAgIHJldHVybiBzZWVuLmluZGV4T2YoYykgPT09IC0xICYmIGMub3AgIT09IFwiSVNBXCI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRvQWRkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICBpZihhc3QgJiYgYXN0Lm9wICYmIGFzdC5vcCA9PT0gXCJvclwiKVxuICAgICAgICAgICAgICAgICBsZXggPSBgKCR7bGV4fSlgO1xuICAgICAgICAgICAgIGlmIChsZXgpIHRvQWRkLnVuc2hpZnQobGV4KTtcbiAgICAgICAgICAgICBsZXggPSB0b0FkZC5qb2luKFwiIGFuZCBcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5jb25zdHJhaW50TG9naWMgPSBsZXg7XG5cbiAgICAgICAgZDMuc2VsZWN0KCcjc3ZnQ29udGFpbmVyIFtuYW1lPVwibG9naWNFeHByZXNzaW9uXCJdIGlucHV0JylcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7IHRoaXNbMF1bMF0udmFsdWUgPSBsZXg7IH0pO1xuXG4gICAgICAgIHJldHVybiBsZXg7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogS2VlcCBtb3ZpbmcgZnVuY3Rpb25zIGludG8gbWV0aG9kc1xuICAgIC8vIEZJWE1FOiBOb3QgYWxsIHRlbXBsYXRlcyBhcmUgVGVtYXBsYXRlcyAhISAoc29tZSBhcmUgc3RpbGwgcGxhaW4gb2JqZWN0cyBjcmVhdGVkIGVsc2V3aXNlKVxufSAvLyBlbmQgb2YgY2xhc3MgVGVtcGxhdGVcblxuY2xhc3MgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKGMpIHtcbiAgICAgICAgYyA9IGMgfHwge31cbiAgICAgICAgLy8gc2F2ZSB0aGUgIG5vZGVcbiAgICAgICAgdGhpcy5ub2RlID0gYy5ub2RlIHx8IG51bGw7XG4gICAgICAgIC8vIGFsbCBjb25zdHJhaW50cyBoYXZlIHRoaXNcbiAgICAgICAgdGhpcy5wYXRoID0gYy5wYXRoIHx8IGMubm9kZSAmJiBjLm5vZGUucGF0aCB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IGFsbCBleGNlcHQgc3ViY2xhc3MgY29uc3RyYWludHMgKHdlIHNldCBpdCB0byBcIklTQVwiKVxuICAgICAgICB0aGlzLm9wID0gYy5vcCB8fCBjLnR5cGUgJiYgXCJJU0FcIiB8fCBudWxsO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0LCByYW5nZSwgbG9vcFxuICAgICAgICAvLyB0aHJvd3MgYW4gZXhjZXB0aW9uIGlmIHRoaXMub3AgaXMgZGVmaW5lZCwgYnV0IG5vdCBpbiBPUElOREVYXG4gICAgICAgIHRoaXMuY3R5cGUgPSB0aGlzLm9wICYmIE9QSU5ERVhbdGhpcy5vcF0uY3R5cGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBhbGwgZXhjZXB0IHN1YmNsYXNzIGNvbnN0cmFpbnRzXG4gICAgICAgIHRoaXMuY29kZSA9IHRoaXMuY3R5cGUgIT09IFwic3ViY2xhc3NcIiAmJiBjLmNvZGUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSB2YWx1ZSwgbGlzdFxuICAgICAgICB0aGlzLnZhbHVlID0gYy52YWx1ZSB8fCBcIlwiO1xuICAgICAgICAvLyB1c2VkIGJ5IExPT0tVUCBvbiBCaW9FbnRpdHkgYW5kIHN1YmNsYXNzZXNcbiAgICAgICAgdGhpcy5leHRyYVZhbHVlID0gdGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIiAmJiBjLmV4dHJhVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgLy8gdXNlZCBieSBtdWx0aXZhbHVlIGFuZCByYW5nZSBjb25zdHJhaW50c1xuICAgICAgICB0aGlzLnZhbHVlcyA9IGMudmFsdWVzICYmIGRlZXBjKGMudmFsdWVzKSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGJ5IHN1YmNsYXNzIGNvbnRyYWludHNcbiAgICAgICAgdGhpcy50eXBlID0gdGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiICYmIGMudHlwZSB8fCBudWxsO1xuICAgICAgICAvLyB1c2VkIGZvciBjb25zdHJhaW50cyBpbiBhIHRlbXBsYXRlXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBjLmVkaXRhYmxlIHx8IG51bGw7XG5cbiAgICAgICAgLy8gV2l0aCBudWxsL25vdC1udWxsIGNvbnN0cmFpbnRzLCBJTSBoYXMgYSB3ZWlyZCBxdWlyayBvZiBmaWxsaW5nIHRoZSB2YWx1ZSBcbiAgICAgICAgLy8gZmllbGQgd2l0aCB0aGUgb3BlcmF0b3IuIEUuZy4sIGZvciBhbiBcIklTIE5PVCBOVUxMXCIgb3ByZWF0b3IsIHRoZSB2YWx1ZSBmaWVsZCBpc1xuICAgICAgICAvLyBhbHNvIFwiSVMgTk9UIE5VTExcIi4gXG4gICAgICAgIC8vIFxuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBjLnZhbHVlID0gXCJcIjtcbiAgICB9XG4gICAgLy8gUmV0dXJucyBhbiB1bnJlZ2lzdGVyZWQgY2xvbmUuIChtZWFuczogbm8gbm9kZSBwb2ludGVyKVxuICAgIGNsb25lICgpIHtcbiAgICAgICAgbGV0IGMgPSBuZXcgQ29uc3RyYWludCh0aGlzKTtcbiAgICAgICAgYy5ub2RlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIC8qXG4gICAgZ2V0IGpzb24gKCkgeyBcbiAgICAgICAgbGV0IGogPSB7XG4gICAgICAgICAgICBjdHlwZTogdGhpcy5jdHlwZSxcbiAgICAgICAgICAgIHBhdGg6IHRoaXMucGF0aFxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmN0eXBlICE9PSBcInN1YmNsYXNzXCIpe1xuICAgICAgICAgICAgai5vcCA9IHRoaXMub3A7XG4gICAgICAgICAgICBqLmNvZGUgPSB0aGlzLmNvZGU7XG4gICAgICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJsb29rdXBcIiAmJiB0aGlzLmV4dHJhVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBqLmV4dHJhVmFsdWUgPSB0aGlzLmV4dHJhVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBqLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAgICAgIH1cbiAgICAgICBcbiAgICB9XG4gICAgKi9cbiAgICAvL1xuICAgIHNldE9wIChvLCBxdWlldGx5KSB7XG4gICAgICAgIGxldCBvcCA9IE9QSU5ERVhbb107XG4gICAgICAgIGlmICghb3ApIHRocm93IFwiVW5rbm93biBvcGVyYXRvcjogXCIgKyBvO1xuICAgICAgICB0aGlzLm9wID0gb3Aub3A7XG4gICAgICAgIHRoaXMuY3R5cGUgPSBvcC5jdHlwZTtcbiAgICAgICAgbGV0IHQgPSB0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLnRlbXBsYXRlO1xuICAgICAgICBpZiAodGhpcy5jdHlwZSA9PT0gXCJzdWJjbGFzc1wiKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2RlICYmICFxdWlldGx5ICYmIHQpIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0LmNvZGUyY1t0aGlzLmNvZGVdO1xuICAgICAgICAgICAgdGhpcy5jb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb2RlKSBcbiAgICAgICAgICAgICAgICB0aGlzLmNvZGUgPSB0ICYmIHQubmV4dEF2YWlsYWJsZUNvZGUoKSB8fCBudWxsO1xuICAgICAgICB9XG4gICAgICAgICFxdWlldGx5ICYmIHQgJiYgdC5zZXRMb2dpY0V4cHJlc3Npb24oKTtcbiAgICB9XG4gICAgLy8gUmV0dXJucyBhIHRleHQgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbnN0cmFpbnQgc3VpdGFibGUgZm9yIGEgbGFiZWxcbiAgICAvL1xuICAgIGdldCBsYWJlbFRleHQgKCkge1xuICAgICAgIGxldCB0ID0gXCI/XCI7XG4gICAgICAgbGV0IGMgPSB0aGlzO1xuICAgICAgICAvLyBvbmUgb2Y6IG51bGwsIHZhbHVlLCBtdWx0aXZhbHVlLCBzdWJjbGFzcywgbG9va3VwLCBsaXN0LCByYW5nZSwgbG9vcFxuICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInN1YmNsYXNzXCIpe1xuICAgICAgICAgICB0ID0gXCJJU0EgXCIgKyAodGhpcy50eXBlIHx8IFwiP1wiKTtcbiAgICAgICB9XG4gICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJsaXN0XCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiKSB7XG4gICAgICAgICAgIHQgPSB0aGlzLm9wICsgXCIgXCIgKyB0aGlzLnZhbHVlO1xuICAgICAgICAgICBpZiAodGhpcy5leHRyYVZhbHVlKSB0ID0gdCArIFwiIElOIFwiICsgdGhpcy5leHRyYVZhbHVlO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm11bHRpdmFsdWVcIiB8fCB0aGlzLmN0eXBlID09PSBcInJhbmdlXCIpIHtcbiAgICAgICAgICAgdCA9IHRoaXMub3AgKyBcIiBcIiArIHRoaXMudmFsdWVzO1xuICAgICAgIH1cbiAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcIm51bGxcIikge1xuICAgICAgICAgICB0ID0gdGhpcy5vcDtcbiAgICAgICB9XG5cbiAgICAgICByZXR1cm4gKHRoaXMuY3R5cGUgIT09IFwic3ViY2xhc3NcIiA/IFwiKFwiK3RoaXMuY29kZStcIikgXCIgOiBcIlwiKSArIHQ7XG4gICAgfVxuXG4gICAgLy8gZm9ybWF0cyB0aGlzIGNvbnN0cmFpbnQgYXMgeG1sXG4gICAgYzJ4bWwgKHFvbmx5KXtcbiAgICAgICAgbGV0IGcgPSAnJztcbiAgICAgICAgbGV0IGggPSAnJztcbiAgICAgICAgbGV0IGUgPSBxb25seSA/IFwiXCIgOiBgZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGUgfHwgJ2ZhbHNlJ31cImA7XG4gICAgICAgIGlmICh0aGlzLmN0eXBlID09PSBcInZhbHVlXCIgfHwgdGhpcy5jdHlwZSA9PT0gXCJsaXN0XCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7ZXNjKHRoaXMub3ApfVwiIHZhbHVlPVwiJHtlc2ModGhpcy52YWx1ZSl9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICBlbHNlIGlmICh0aGlzLmN0eXBlID09PSBcImxvb2t1cFwiKXtcbiAgICAgICAgICAgIGxldCBldiA9ICh0aGlzLmV4dHJhVmFsdWUgJiYgdGhpcy5leHRyYVZhbHVlICE9PSBcIkFueVwiKSA/IGBleHRyYVZhbHVlPVwiJHt0aGlzLmV4dHJhVmFsdWV9XCJgIDogXCJcIjtcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIG9wPVwiJHtlc2ModGhpcy5vcCl9XCIgdmFsdWU9XCIke2VzYyh0aGlzLnZhbHVlKX1cIiAke2V2fSBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJtdWx0aXZhbHVlXCIpe1xuICAgICAgICAgICAgZyA9IGBwYXRoPVwiJHt0aGlzLnBhdGh9XCIgb3A9XCIke3RoaXMub3B9XCIgY29kZT1cIiR7dGhpcy5jb2RlfVwiICR7ZX1gO1xuICAgICAgICAgICAgaCA9IHRoaXMudmFsdWVzLm1hcCggdiA9PiBgPHZhbHVlPiR7ZXNjKHYpfTwvdmFsdWU+YCApLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY3R5cGUgPT09IFwic3ViY2xhc3NcIilcbiAgICAgICAgICAgIGcgPSBgcGF0aD1cIiR7dGhpcy5wYXRofVwiIHR5cGU9XCIke3RoaXMudHlwZX1cIiAke2V9YDtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5jdHlwZSA9PT0gXCJudWxsXCIpXG4gICAgICAgICAgICBnID0gYHBhdGg9XCIke3RoaXMucGF0aH1cIiBvcD1cIiR7dGhpcy5vcH1cIiBjb2RlPVwiJHt0aGlzLmNvZGV9XCIgJHtlfWA7XG4gICAgICAgIGlmKGgpXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30+JHtofTwvY29uc3RyYWludD5cXG5gO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYDxjb25zdHJhaW50ICR7Z30gLz5cXG5gO1xuICAgIH1cbn0gLy8gZW5kIG9mIGNsYXNzIENvbnN0cmFpbnRcblxuZXhwb3J0IHtcbiAgICBNb2RlbCxcbiAgICBnZXRTdWJjbGFzc2VzLFxuICAgIGdldFN1cGVyY2xhc3NlcyxcbiAgICBpc1N1YmNsYXNzLFxuICAgIE5vZGUsXG4gICAgVGVtcGxhdGUsXG4gICAgQ29uc3RyYWludFxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvbW9kZWwuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSAvKlxyXG4gKiBHZW5lcmF0ZWQgYnkgUEVHLmpzIDAuMTAuMC5cclxuICpcclxuICogaHR0cDovL3BlZ2pzLm9yZy9cclxuICovXHJcbihmdW5jdGlvbigpIHtcclxuICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcclxuICAgIGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfVxyXG4gICAgY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlO1xyXG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBleHBlY3RlZCwgZm91bmQsIGxvY2F0aW9uKSB7XHJcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcclxuICAgIHRoaXMuZXhwZWN0ZWQgPSBleHBlY3RlZDtcclxuICAgIHRoaXMuZm91bmQgICAgPSBmb3VuZDtcclxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvbjtcclxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHBlZyRTeW50YXhFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwZWckc3ViY2xhc3MocGVnJFN5bnRheEVycm9yLCBFcnJvcik7XHJcblxyXG4gIHBlZyRTeW50YXhFcnJvci5idWlsZE1lc3NhZ2UgPSBmdW5jdGlvbihleHBlY3RlZCwgZm91bmQpIHtcclxuICAgIHZhciBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlMgPSB7XHJcbiAgICAgICAgICBsaXRlcmFsOiBmdW5jdGlvbihleHBlY3RhdGlvbikge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJcXFwiXCIgKyBsaXRlcmFsRXNjYXBlKGV4cGVjdGF0aW9uLnRleHQpICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIFwiY2xhc3NcIjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGVzY2FwZWRQYXJ0cyA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGV4cGVjdGF0aW9uLnBhcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgZXNjYXBlZFBhcnRzICs9IGV4cGVjdGF0aW9uLnBhcnRzW2ldIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgID8gY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV1bMF0pICsgXCItXCIgKyBjbGFzc0VzY2FwZShleHBlY3RhdGlvbi5wYXJ0c1tpXVsxXSlcclxuICAgICAgICAgICAgICAgIDogY2xhc3NFc2NhcGUoZXhwZWN0YXRpb24ucGFydHNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gXCJbXCIgKyAoZXhwZWN0YXRpb24uaW52ZXJ0ZWQgPyBcIl5cIiA6IFwiXCIpICsgZXNjYXBlZFBhcnRzICsgXCJdXCI7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGFueTogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiYW55IGNoYXJhY3RlclwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBvdGhlcjogZnVuY3Rpb24oZXhwZWN0YXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gaGV4KGNoKSB7XHJcbiAgICAgIHJldHVybiBjaC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpdGVyYWxFc2NhcGUocykge1xyXG4gICAgICByZXR1cm4gc1xyXG4gICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICAnXFxcXFwiJylcclxuICAgICAgICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcclxuICAgICAgICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwRl0vZywgICAgICAgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcclxuICAgICAgICAucmVwbGFjZSgvW1xceDEwLVxceDFGXFx4N0YtXFx4OUZdL2csIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgnICArIGhleChjaCk7IH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzRXNjYXBlKHMpIHtcclxuICAgICAgcmV0dXJuIHNcclxuICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXF0vZywgJ1xcXFxdJylcclxuICAgICAgICAucmVwbGFjZSgvXFxeL2csICdcXFxcXicpXHJcbiAgICAgICAgLnJlcGxhY2UoLy0vZywgICdcXFxcLScpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXHQvZywgJ1xcXFx0JylcclxuICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcci9nLCAnXFxcXHInKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFx4MDAtXFx4MEZdL2csICAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHgwJyArIGhleChjaCk7IH0pXHJcbiAgICAgICAgLnJlcGxhY2UoL1tcXHgxMC1cXHgxRlxceDdGLVxceDlGXS9nLCBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx4JyAgKyBoZXgoY2gpOyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZXNjcmliZUV4cGVjdGF0aW9uKGV4cGVjdGF0aW9uKSB7XHJcbiAgICAgIHJldHVybiBERVNDUklCRV9FWFBFQ1RBVElPTl9GTlNbZXhwZWN0YXRpb24udHlwZV0oZXhwZWN0YXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlc2NyaWJlRXhwZWN0ZWQoZXhwZWN0ZWQpIHtcclxuICAgICAgdmFyIGRlc2NyaXB0aW9ucyA9IG5ldyBBcnJheShleHBlY3RlZC5sZW5ndGgpLFxyXG4gICAgICAgICAgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBleHBlY3RlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uc1tpXSA9IGRlc2NyaWJlRXhwZWN0YXRpb24oZXhwZWN0ZWRbaV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZXNjcmlwdGlvbnMuc29ydCgpO1xyXG5cclxuICAgICAgaWYgKGRlc2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yIChpID0gMSwgaiA9IDE7IGkgPCBkZXNjcmlwdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbnNbaSAtIDFdICE9PSBkZXNjcmlwdGlvbnNbaV0pIHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25zW2pdID0gZGVzY3JpcHRpb25zW2ldO1xyXG4gICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlc2NyaXB0aW9ucy5sZW5ndGggPSBqO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdO1xyXG5cclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zWzBdICsgXCIgb3IgXCIgKyBkZXNjcmlwdGlvbnNbMV07XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gZGVzY3JpcHRpb25zLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcclxuICAgICAgICAgICAgKyBcIiwgb3IgXCJcclxuICAgICAgICAgICAgKyBkZXNjcmlwdGlvbnNbZGVzY3JpcHRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVzY3JpYmVGb3VuZChmb3VuZCkge1xyXG4gICAgICByZXR1cm4gZm91bmQgPyBcIlxcXCJcIiArIGxpdGVyYWxFc2NhcGUoZm91bmQpICsgXCJcXFwiXCIgOiBcImVuZCBvZiBpbnB1dFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBcIkV4cGVjdGVkIFwiICsgZGVzY3JpYmVFeHBlY3RlZChleHBlY3RlZCkgKyBcIiBidXQgXCIgKyBkZXNjcmliZUZvdW5kKGZvdW5kKSArIFwiIGZvdW5kLlwiO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHBlZyRwYXJzZShpbnB1dCwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgIT09IHZvaWQgMCA/IG9wdGlvbnMgOiB7fTtcclxuXHJcbiAgICB2YXIgcGVnJEZBSUxFRCA9IHt9LFxyXG5cclxuICAgICAgICBwZWckc3RhcnRSdWxlRnVuY3Rpb25zID0geyBFeHByZXNzaW9uOiBwZWckcGFyc2VFeHByZXNzaW9uIH0sXHJcbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uICA9IHBlZyRwYXJzZUV4cHJlc3Npb24sXHJcblxyXG4gICAgICAgIHBlZyRjMCA9IFwib3JcIixcclxuICAgICAgICBwZWckYzEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwib3JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMiA9IFwiT1JcIixcclxuICAgICAgICBwZWckYzMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiT1JcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjNCA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHsgXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3BhZ2F0ZShcIm9yXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGM1ID0gXCJhbmRcIixcclxuICAgICAgICBwZWckYzYgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiYW5kXCIsIGZhbHNlKSxcclxuICAgICAgICBwZWckYzcgPSBcIkFORFwiLFxyXG4gICAgICAgIHBlZyRjOCA9IHBlZyRsaXRlcmFsRXhwZWN0YXRpb24oXCJBTkRcIiwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjOSA9IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcHJvcGFnYXRlKFwiYW5kXCIsIGhlYWQsIHRhaWwpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgcGVnJGMxMCA9IFwiKFwiLFxyXG4gICAgICAgIHBlZyRjMTEgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKFwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxMiA9IFwiKVwiLFxyXG4gICAgICAgIHBlZyRjMTMgPSBwZWckbGl0ZXJhbEV4cGVjdGF0aW9uKFwiKVwiLCBmYWxzZSksXHJcbiAgICAgICAgcGVnJGMxNCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIGV4cHI7IH0sXHJcbiAgICAgICAgcGVnJGMxNSA9IHBlZyRvdGhlckV4cGVjdGF0aW9uKFwiY29kZVwiKSxcclxuICAgICAgICBwZWckYzE2ID0gL15bQS1aYS16XS8sXHJcbiAgICAgICAgcGVnJGMxNyA9IHBlZyRjbGFzc0V4cGVjdGF0aW9uKFtbXCJBXCIsIFwiWlwiXSwgW1wiYVwiLCBcInpcIl1dLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHBlZyRjMTggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRleHQoKS50b1VwcGVyQ2FzZSgpOyB9LFxyXG4gICAgICAgIHBlZyRjMTkgPSBwZWckb3RoZXJFeHBlY3RhdGlvbihcIndoaXRlc3BhY2VcIiksXHJcbiAgICAgICAgcGVnJGMyMCA9IC9eWyBcXHRcXG5cXHJdLyxcclxuICAgICAgICBwZWckYzIxID0gcGVnJGNsYXNzRXhwZWN0YXRpb24oW1wiIFwiLCBcIlxcdFwiLCBcIlxcblwiLCBcIlxcclwiXSwgZmFsc2UsIGZhbHNlKSxcclxuXHJcbiAgICAgICAgcGVnJGN1cnJQb3MgICAgICAgICAgPSAwLFxyXG4gICAgICAgIHBlZyRzYXZlZFBvcyAgICAgICAgID0gMCxcclxuICAgICAgICBwZWckcG9zRGV0YWlsc0NhY2hlICA9IFt7IGxpbmU6IDEsIGNvbHVtbjogMSB9XSxcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyAgICAgICA9IDAsXHJcbiAgICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZCAgPSBbXSxcclxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXHJcblxyXG4gICAgICAgIHBlZyRyZXN1bHQ7XHJcblxyXG4gICAgaWYgKFwic3RhcnRSdWxlXCIgaW4gb3B0aW9ucykge1xyXG4gICAgICBpZiAoIShvcHRpb25zLnN0YXJ0UnVsZSBpbiBwZWckc3RhcnRSdWxlRnVuY3Rpb25zKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcclxuICAgICAgcmV0dXJuIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsb2NhdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlTG9jYXRpb24ocGVnJHNhdmVkUG9zLCBwZWckY3VyclBvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXhwZWN0ZWQoZGVzY3JpcHRpb24sIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKFxyXG4gICAgICAgIFtwZWckb3RoZXJFeHBlY3RhdGlvbihkZXNjcmlwdGlvbildLFxyXG4gICAgICAgIGlucHV0LnN1YnN0cmluZyhwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKSxcclxuICAgICAgICBsb2NhdGlvblxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UsIGxvY2F0aW9uKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gbG9jYXRpb24gIT09IHZvaWQgMCA/IGxvY2F0aW9uIDogcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckc2F2ZWRQb3MsIHBlZyRjdXJyUG9zKVxyXG5cclxuICAgICAgdGhyb3cgcGVnJGJ1aWxkU2ltcGxlRXJyb3IobWVzc2FnZSwgbG9jYXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRsaXRlcmFsRXhwZWN0YXRpb24odGV4dCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdGV4dDogdGV4dCwgaWdub3JlQ2FzZTogaWdub3JlQ2FzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRjbGFzc0V4cGVjdGF0aW9uKHBhcnRzLCBpbnZlcnRlZCwgaWdub3JlQ2FzZSkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImNsYXNzXCIsIHBhcnRzOiBwYXJ0cywgaW52ZXJ0ZWQ6IGludmVydGVkLCBpZ25vcmVDYXNlOiBpZ25vcmVDYXNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGFueUV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImFueVwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGVuZEV4cGVjdGF0aW9uKCkge1xyXG4gICAgICByZXR1cm4geyB0eXBlOiBcImVuZFwiIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJG90aGVyRXhwZWN0YXRpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvdGhlclwiLCBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSB7XHJcbiAgICAgIHZhciBkZXRhaWxzID0gcGVnJHBvc0RldGFpbHNDYWNoZVtwb3NdLCBwO1xyXG5cclxuICAgICAgaWYgKGRldGFpbHMpIHtcclxuICAgICAgICByZXR1cm4gZGV0YWlscztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwID0gcG9zIC0gMTtcclxuICAgICAgICB3aGlsZSAoIXBlZyRwb3NEZXRhaWxzQ2FjaGVbcF0pIHtcclxuICAgICAgICAgIHAtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRldGFpbHMgPSBwZWckcG9zRGV0YWlsc0NhY2hlW3BdO1xyXG4gICAgICAgIGRldGFpbHMgPSB7XHJcbiAgICAgICAgICBsaW5lOiAgIGRldGFpbHMubGluZSxcclxuICAgICAgICAgIGNvbHVtbjogZGV0YWlscy5jb2x1bW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aGlsZSAocCA8IHBvcykge1xyXG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocCkgPT09IDEwKSB7XHJcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbiA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHArKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBlZyRwb3NEZXRhaWxzQ2FjaGVbcG9zXSA9IGRldGFpbHM7XHJcbiAgICAgICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckY29tcHV0ZUxvY2F0aW9uKHN0YXJ0UG9zLCBlbmRQb3MpIHtcclxuICAgICAgdmFyIHN0YXJ0UG9zRGV0YWlscyA9IHBlZyRjb21wdXRlUG9zRGV0YWlscyhzdGFydFBvcyksXHJcbiAgICAgICAgICBlbmRQb3NEZXRhaWxzICAgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMoZW5kUG9zKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc3RhcnQ6IHtcclxuICAgICAgICAgIG9mZnNldDogc3RhcnRQb3MsXHJcbiAgICAgICAgICBsaW5lOiAgIHN0YXJ0UG9zRGV0YWlscy5saW5lLFxyXG4gICAgICAgICAgY29sdW1uOiBzdGFydFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmQ6IHtcclxuICAgICAgICAgIG9mZnNldDogZW5kUG9zLFxyXG4gICAgICAgICAgbGluZTogICBlbmRQb3NEZXRhaWxzLmxpbmUsXHJcbiAgICAgICAgICBjb2x1bW46IGVuZFBvc0RldGFpbHMuY29sdW1uXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRmYWlsKGV4cGVjdGVkKSB7XHJcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgaWYgKHBlZyRjdXJyUG9zID4gcGVnJG1heEZhaWxQb3MpIHtcclxuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcGVnJG1heEZhaWxFeHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckYnVpbGRTaW1wbGVFcnJvcihtZXNzYWdlLCBsb2NhdGlvbikge1xyXG4gICAgICByZXR1cm4gbmV3IHBlZyRTeW50YXhFcnJvcihtZXNzYWdlLCBudWxsLCBudWxsLCBsb2NhdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkU3RydWN0dXJlZEVycm9yKGV4cGVjdGVkLCBmb3VuZCwgbG9jYXRpb24pIHtcclxuICAgICAgcmV0dXJuIG5ldyBwZWckU3ludGF4RXJyb3IoXHJcbiAgICAgICAgcGVnJFN5bnRheEVycm9yLmJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpLFxyXG4gICAgICAgIGV4cGVjdGVkLFxyXG4gICAgICAgIGZvdW5kLFxyXG4gICAgICAgIGxvY2F0aW9uXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlRXhwcmVzc2lvbigpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNywgczg7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IFtdO1xyXG4gICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICBzNiA9IHBlZyRjMDtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgPT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGMyKSB7XHJcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlVGVybSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgczQgPSBzNTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNDtcclxuICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHdoaWxlIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzMy5wdXNoKHM0KTtcclxuICAgICAgICAgICAgczQgPSBwZWckY3VyclBvcztcclxuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDIpID09PSBwZWckYzApIHtcclxuICAgICAgICAgICAgICAgIHM2ID0gcGVnJGMwO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjMikge1xyXG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRjMjtcclxuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHM2ID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMpOyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgICAgczggPSBwZWckcGFyc2VUZXJtKCk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzOCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHM1ID0gW3M1LCBzNiwgczcsIHM4XTtcclxuICAgICAgICAgICAgICAgICAgICBzNCA9IHM1O1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHM0O1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczQ7XHJcbiAgICAgICAgICAgICAgczQgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMxID0gcGVnJGM0KHMyLCBzMyk7XHJcbiAgICAgICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHMwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZVRlcm0oKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczc7XHJcblxyXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICBzMSA9IHBlZyRwYXJzZUZhY3RvcigpO1xyXG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICBzMiA9IFtdO1xyXG4gICAgICAgIHMzID0gcGVnJGN1cnJQb3M7XHJcbiAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM1KSB7XHJcbiAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyArPSAzO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAzKSA9PT0gcGVnJGM3KSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckYzc7XHJcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzNSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM2ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcclxuICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgczIucHVzaChzMyk7XHJcbiAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xyXG4gICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMykgPT09IHBlZyRjNSkge1xyXG4gICAgICAgICAgICAgIHM1ID0gcGVnJGM1O1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM2KTsgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDMpID09PSBwZWckYzcpIHtcclxuICAgICAgICAgICAgICAgIHM1ID0gcGVnJGM3O1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlXygpO1xyXG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VGYWN0b3IoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzNyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2LCBzN107XHJcbiAgICAgICAgICAgICAgICAgIHMzID0gczQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XHJcbiAgICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xyXG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgcGVnJHNhdmVkUG9zID0gczA7XHJcbiAgICAgICAgICBzMSA9IHBlZyRjOShzMSwgczIpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VGYWN0b3IoKSB7XHJcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1O1xyXG5cclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MCkge1xyXG4gICAgICAgIHMxID0gcGVnJGMxMDtcclxuICAgICAgICBwZWckY3VyclBvcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZUV4cHJlc3Npb24oKTtcclxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcclxuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0MSkge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckYzEyO1xyXG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgczUgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcclxuICAgICAgICAgICAgICAgIHBlZyRzYXZlZFBvcyA9IHMwO1xyXG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzE0KHMzKTtcclxuICAgICAgICAgICAgICAgIHMwID0gczE7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xyXG4gICAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XHJcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwID0gcGVnJHBhcnNlQ29kZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gczA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlQ29kZSgpIHtcclxuICAgICAgdmFyIHMwLCBzMSwgczI7XHJcblxyXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcclxuICAgICAgczAgPSBwZWckY3VyclBvcztcclxuICAgICAgczEgPSBwZWckcGFyc2VfKCk7XHJcbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIGlmIChwZWckYzE2LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNyk7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XHJcbiAgICAgICAgICBwZWckc2F2ZWRQb3MgPSBzMDtcclxuICAgICAgICAgIHMxID0gcGVnJGMxOCgpO1xyXG4gICAgICAgICAgczAgPSBzMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICAgIHMwID0gcGVnJEZBSUxFRDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcclxuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTUpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwZWckcGFyc2VfKCkge1xyXG4gICAgICB2YXIgczAsIHMxO1xyXG5cclxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XHJcbiAgICAgIHMwID0gW107XHJcbiAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XHJcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XHJcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIxKTsgfVxyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlIChzMSAhPT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMwLnB1c2goczEpO1xyXG4gICAgICAgIGlmIChwZWckYzIwLnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcclxuICAgICAgICAgIHMxID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcclxuICAgICAgICAgIHBlZyRjdXJyUG9zKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMSk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcGVnJHNpbGVudEZhaWxzLS07XHJcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xyXG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcclxuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTkpOyB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgICBmdW5jdGlvbiBwcm9wYWdhdGUob3AsIGhlYWQsIHRhaWwpIHtcclxuICAgICAgICAgIGlmICh0YWlsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhlYWQ7XHJcbiAgICAgICAgICByZXR1cm4gdGFpbC5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5jaGlsZHJlbi5wdXNoKGVsZW1lbnRbM10pO1xyXG4gICAgICAgICAgICByZXR1cm4gIHJlc3VsdDtcclxuICAgICAgICAgIH0sIHtcIm9wXCI6b3AsIGNoaWxkcmVuOltoZWFkXX0pO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcclxuXHJcbiAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA9PT0gaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHBlZyRyZXN1bHQgIT09IHBlZyRGQUlMRUQgJiYgcGVnJGN1cnJQb3MgPCBpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICBwZWckZmFpbChwZWckZW5kRXhwZWN0YXRpb24oKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IHBlZyRidWlsZFN0cnVjdHVyZWRFcnJvcihcclxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkLFxyXG4gICAgICAgIHBlZyRtYXhGYWlsUG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBlZyRtYXhGYWlsUG9zKSA6IG51bGwsXHJcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgPCBpbnB1dC5sZW5ndGhcclxuICAgICAgICAgID8gcGVnJGNvbXB1dGVMb2NhdGlvbihwZWckbWF4RmFpbFBvcywgcGVnJG1heEZhaWxQb3MgKyAxKVxyXG4gICAgICAgICAgOiBwZWckY29tcHV0ZUxvY2F0aW9uKHBlZyRtYXhGYWlsUG9zLCBwZWckbWF4RmFpbFBvcylcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBTeW50YXhFcnJvcjogcGVnJFN5bnRheEVycm9yLFxyXG4gICAgcGFyc2U6ICAgICAgIHBlZyRwYXJzZVxyXG4gIH07XHJcbn0pKCk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL3BhcnNlci5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgeyBkM2pzb25Qcm9taXNlIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCByZWdpc3RyeVVybCA9IFwiaHR0cDovL3JlZ2lzdHJ5LmludGVybWluZS5vcmcvc2VydmljZS9pbnN0YW5jZXNcIjtcbmxldCByZWdpc3RyeUZpbGVVcmwgPSBcIi4vcmVzb3VyY2VzL3Rlc3RkYXRhL3JlZ2lzdHJ5Lmpzb25cIjtcblxuZnVuY3Rpb24gaW5pdFJlZ2lzdHJ5IChjYikge1xuICAgIHJldHVybiBkM2pzb25Qcm9taXNlKHJlZ2lzdHJ5VXJsKVxuICAgICAgLnRoZW4oY2IpXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgYWNjZXNzIHJlZ2lzdHJ5IGF0ICR7cmVnaXN0cnlVcmx9LiBUcnlpbmcgJHtyZWdpc3RyeUZpbGVVcmx9LmApO1xuICAgICAgICAgIGQzanNvblByb21pc2UocmVnaXN0cnlGaWxlVXJsKVxuICAgICAgICAgICAgICAudGhlbihpbml0TWluZXMpXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBhbGVydChcIkNhbm5vdCBhY2Nlc3MgcmVnaXN0cnkgZmlsZS4gVGhpcyBpcyBub3QgeW91ciBsdWNreSBkYXkuXCIpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9KTtcbn1cblxuXG5jbGFzcyBSZWdpc3RyeUVudHJ5IHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCB7IGluaXRSZWdpc3RyeSB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9yZXNvdXJjZXMvanMvcmVnaXN0cnkuanNcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHtjb2RlcG9pbnRzfSBmcm9tICcuL21hdGVyaWFsX2ljb25fY29kZXBvaW50cy5qcyc7XG5cbmxldCBlZGl0Vmlld3MgPSB7IHF1ZXJ5TWFpbjoge1xuICAgICAgICBuYW1lOiBcInF1ZXJ5TWFpblwiLFxuICAgICAgICBsYXlvdXRTdHlsZTogXCJ0cmVlXCIsXG4gICAgICAgIG5vZGVDb21wOiBudWxsLFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk1hdGVyaWFsIEljb25zXCIsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gbi5zb3J0ID8gbi5zb3J0LmRpci50b0xvd2VyQ2FzZSgpIDogXCJub25lXCI7XG4gICAgICAgICAgICAgICAgbGV0IGNjID0gY29kZXBvaW50c1sgZGlyID09PSBcImFzY1wiID8gXCJhcnJvd191cHdhcmRcIiA6IGRpciA9PT0gXCJkZXNjXCIgPyBcImFycm93X2Rvd253YXJkXCIgOiBcIlwiIF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNjID8gY2MgOiBcIlwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3Ryb2tlOiBcIiNlMjhiMjhcIlxuICAgICAgICB9LFxuICAgICAgICBub2RlSWNvbjoge1xuICAgICAgICB9XG4gICAgfSxcbiAgICBjb2x1bW5PcmRlcjoge1xuICAgICAgICBuYW1lOiBcImNvbHVtbk9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNlbGVjdGVkXCIsXG4gICAgICAgIG5vZGVDb21wOiBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgIC8vIENvbXBhcmF0b3IgZnVuY3Rpb24uIEluIGNvbHVtbiBvcmRlciB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIHNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzZWxlY3Rpb24tbGlzdCBvcmRlciAodG9wLXRvLWJvdHRvbSlcbiAgICAgICAgICAvLyAgICAgLSB1bnNlbGVjdGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgaWYgKGEuaXNTZWxlY3RlZClcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IGEudmlldyAtIGIudmlldyA6IC0xO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIGIuaXNTZWxlY3RlZCA/IDEgOiBuYW1lQ29tcChhLGIpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBkcmFnIGluIGNvbHVtbk9yZGVyIHZpZXcgY2hhbmdlcyB0aGUgY29sdW1uIG9yZGVyIChkdWghKVxuICAgICAgICBhZnRlckRyYWc6IGZ1bmN0aW9uKG5vZGVzLCBkcmFnZ2VkKSB7XG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7IG4udmlldyA9IGkgfSk7XG4gICAgICAgICAgZHJhZ2dlZC50ZW1wbGF0ZS5zZWxlY3QgPSBub2Rlcy5tYXAoIG49PiBuLnBhdGggKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLmlzU2VsZWN0ZWQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IG51bGwsXG4gICAgICAgICAgICB0ZXh0OiBuID0+IG4uaXNTZWxlY3RlZCA/IG4udmlldyA6IFwiXCJcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc29ydE9yZGVyOiB7XG4gICAgICAgIG5hbWU6IFwic29ydE9yZGVyXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgZHJhZ2dhYmxlOiBcImcubm9kZWdyb3VwLnNvcnRlZFwiLFxuICAgICAgICBub2RlQ29tcDogZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAvLyBDb21wYXJhdG9yIGZ1bmN0aW9uLiBJbiBzb3J0IG9yZGVyIHZpZXc6XG4gICAgICAgICAgLy8gICAgIC0gc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBzb3J0LWxpc3Qgb3JkZXIgKHRvcC10by1ib3R0b20pXG4gICAgICAgICAgLy8gICAgIC0gdW5zb3J0ZWQgbm9kZXMgYXJlIGF0IHRoZSBib3R0b20sIGluIGFscGhhIG9yZGVyIGJ5IG5hbWVcbiAgICAgICAgICBpZiAoYS5zb3J0KVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gYS5zb3J0LmxldmVsIC0gYi5zb3J0LmxldmVsIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYi5zb3J0ID8gMSA6IG5hbWVDb21wKGEsYik7XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyRHJhZzogZnVuY3Rpb24obm9kZXMsIGRyYWdnZWQpIHtcbiAgICAgICAgICAvLyBkcmFnIGluIHNvcnRPcmRlciB2aWV3IGNoYW5nZXMgdGhlIHNvcnQgb3JkZXIgKGR1aCEpXG4gICAgICAgICAgbm9kZXMuZm9yRWFjaCgobixpKSA9PiB7XG4gICAgICAgICAgICAgIG4uc29ydC5sZXZlbCA9IGlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlSWNvbjoge1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJNYXRlcmlhbCBJY29uc1wiLFxuICAgICAgICAgICAgdGV4dDogbiA9PiBuLnNvcnQgPyBjb2RlcG9pbnRzW1wicmVvcmRlclwiXSA6IFwiXCJcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZUljb246IHtcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiTWF0ZXJpYWwgSWNvbnNcIixcbiAgICAgICAgICAgIHRleHQ6IG4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBuLnNvcnQgPyBuLnNvcnQuZGlyLnRvTG93ZXJDYXNlKCkgOiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBsZXQgY2MgPSBjb2RlcG9pbnRzWyBkaXIgPT09IFwiYXNjXCIgPyBcImFycm93X3Vwd2FyZFwiIDogZGlyID09PSBcImRlc2NcIiA/IFwiYXJyb3dfZG93bndhcmRcIiA6IFwiXCIgXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2MgPyBjYyA6IFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgY29uc3RyYWludExvZ2ljOiB7XG4gICAgICAgIG5hbWU6IFwiY29uc3RyYWludExvZ2ljXCIsXG4gICAgICAgIGxheW91dFN0eWxlOiBcImRlbmRyb2dyYW1cIixcbiAgICAgICAgbm9kZUNvbXA6IGZ1bmN0aW9uKGEsYil7XG4gICAgICAgICAgLy8gQ29tcGFyYXRvciBmdW5jdGlvbi4gSW4gY29uc3RyYWludCBsb2dpYyB2aWV3OlxuICAgICAgICAgIC8vICAgICAtIGNvbnN0cmFpbmVkIG5vZGVzIGFyZSBhdCB0aGUgdG9wLCBpbiBjb2RlIG9yZGVyICh0b3AtdG8tYm90dG9tKVxuICAgICAgICAgIC8vICAgICAtIHVuc29ydGVkIG5vZGVzIGFyZSBhdCB0aGUgYm90dG9tLCBpbiBhbHBoYSBvcmRlciBieSBuYW1lXG4gICAgICAgICAgbGV0IGFjb25zdCA9IGEuY29uc3RyYWludHMgJiYgYS5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBhY29kZSA9IGFjb25zdCA/IGEuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgbGV0IGJjb25zdCA9IGIuY29uc3RyYWludHMgJiYgYi5jb25zdHJhaW50cy5sZW5ndGggPiAwO1xuICAgICAgICAgIGxldCBiY29kZSA9IGJjb25zdCA/IGIuY29uc3RyYWludHNbMF0uY29kZSA6IG51bGw7XG4gICAgICAgICAgaWYgKGFjb25zdClcbiAgICAgICAgICAgICAgcmV0dXJuIGJjb25zdCA/IChhY29kZSA8IGJjb2RlID8gLTEgOiBhY29kZSA+IGJjb2RlID8gMSA6IDApIDogLTE7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gYmNvbnN0ID8gMSA6IG5hbWVDb21wKGEsIGIpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH0sXG4gICAgICAgIG5vZGVJY29uOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBDb21wYXJhdG9yIGZ1bmN0aW9uLCBmb3Igc29ydGluZyBhIGxpc3Qgb2Ygbm9kZXMgYnkgbmFtZS4gQ2FzZS1pbnNlbnNpdGl2ZS5cbi8vXG5sZXQgbmFtZUNvbXAgPSBmdW5jdGlvbihhLGIpIHtcbiAgICBsZXQgbmEgPSBhLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgbmIgPSBiLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gbmEgPCBuYiA/IC0xIDogbmEgPiBuYiA/IDEgOiAwO1xufTtcblxuZXhwb3J0IHsgZWRpdFZpZXdzIH07XG5cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vcmVzb3VyY2VzL2pzL2VkaXRWaWV3cy5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9