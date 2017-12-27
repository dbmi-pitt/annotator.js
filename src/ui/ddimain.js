/*package annotator.ui */
"use strict";

var util = require('../util');
var xUtil = require('../xutil');
var textselector = require('./textselector');
var crpgadder = require('./../ddiPlugin/crosspageadder');
var cancelcrpgadder = require('./../ddiPlugin/cancelcrosspageadder');
// ddi
var ddiadder = require('./../ddiPlugin/adder');
var ddihighlighter = require('./../ddiPlugin/highlighter');
var currhighlighter = require('./temphighlighter');
var ddieditor = require('./../ddiPlugin/editor');
var ddiviewer = require('./../ddiPlugin/viewer');

// highlight
var hladder = require('./../drugPlugin/adder');
var hleditor = require('./../drugPlugin/editor');
var hlhighlighter = require('./../drugPlugin/highlighter');
var hlviewer = require('./../drugPlugin/viewer');

var _t = util.gettext;
var rangeChildNodes = [];
var hlAnnotation;  //a dummy annotation, used to store textSelected ranges
var adderClick = false;  //to mark the adder is clicked, can be used to distinguish update annotation or add new data
var publicsddi;

// trim strips whitespace from either end of a string.
//
// This usually exists in native code, but not in IE8.
function trim(s) {
    if (typeof String.prototype.trim === 'function') {
        return String.prototype.trim.call(s);
    } else {
        return s.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    }
}

// annotationFactory returns a function that can be used to construct an
// annotation from a list of selected ranges.
function annotationFactory(contextEl, ignoreSelector) {
    return function (ranges) {
        var text = [],
            serializedRanges = [];

        for (var i = 0, len = ranges.length; i < len; i++) {
            var r = ranges[i];
            text.push(trim(r.text()));
            var serializedRange = r.serialize(contextEl, ignoreSelector)
            serializedRanges.push(serializedRange);
        }

        var prefix = "", suffix = "";
        prefix = getTxtFromNode(ranges[0].start, false, ignoreSelector, 50);
        suffix = getTxtFromNode(ranges[0].end, true, ignoreSelector, 50);
        return {
            argues : {
                ranges: serializedRanges,
                hasTarget: {
                    hasSelector: {
                        "@type": "TextQuoteSelector",
                        "exact": text.join(' / '),
                        "prefix": prefix,
                        "suffix": suffix
                    }
                },
                supportsBy : []
            },
            rawurl: sourceURL
        };
    };
}


// maxZIndex returns the maximum z-index of all elements in the provided set.
function maxZIndex(elements) {
    var max = -1;
    for (var i = 0, len = elements.length; i < len; i++) {
        var $el = util.$(elements[i]);
        if ($el.css('position') !== 'static') {
            // Use parseFloat since we may get scientific notation for large
            // values.
            var zIndex = parseFloat($el.css('z-index'));
            if (zIndex > max) {
                max = zIndex;
            }
        }
    }
    return max;
}


// Helper function to inject CSS into the page that ensures Annotator elements
// are displayed with the highest z-index.
function injectDynamicStyle() {

    util.$('#annotator-dynamic-style').remove();

    var sel = '*' +
        ':not(annotator-adder)' +
        ':not(annotator-outer)' +
        ':not(annotator-notice)' +
        ':not(annotator-filter)';

    // use the maximum z-index in the page
    var max = maxZIndex(util.$(global.document.body).find(sel).get());

    // but don't go smaller than 1010, because this isn't bulletproof --
    // dynamic elements in the page (notifications, dialogs, etc.) may well
    // have high z-indices that we can't catch using the above method.
    max = Math.max(max, 1000);

    var rules = [
        ".annotator-adder, .annotator-outer, .annotator-notice {",
        "  z-index: " + (max + 20) + ";",
        "}",
        ".annotator-filter {",
        "  z-index: " + (max + 10) + ";",
        "}"
    ].join("\n");

    util.$('<style>' + rules + '</style>')
        .attr('id', 'annotator-dynamic-style')
        .attr('type', 'text/css')
        .appendTo('head');
}


// Helper function to remove dynamic stylesheets
function removeDynamicStyle() {
    util.$('#annotator-dynamic-style').remove();
}


// Helper function to add permissions checkboxes to the editor
function addPermissionsCheckboxes(editor, ident, authz) {

    function createLoadCallback(action) {
        return function loadCallback(field, annotation) {
            field = util.$(field).show();

            var u = ident.who();
            var input = field.find('input');

            //alert('ddi main - load - user ident:' + u)

            // Do not show field if no user is set
            if (typeof u === 'undefined' || u === null || u == "") {
                field.hide();
            }

            // Do not show field if current user is not admin.
            if (!(authz.permits('admin', annotation, u))) {
                field.hide();
            }

            // See if we can authorise without a user.
            if (authz.permits(action, annotation, null)) {
                input.attr('checked', 'checked');
            } else {
                input.removeAttr('checked');
            }
        };
    }

    function createSubmitCallback(action) {
        return function submitCallback(field, annotation) {
            var u = ident.who();

            // Don't do anything if no user is set
            if (typeof u === 'undefined' || u === null || u == "") {
                return;
            }

            if (!annotation.permissions) {
                annotation.permissions = {};
            }

            if (util.$(field).find('input').is(':checked')) {
                delete annotation.permissions[action];
            } else {
                // While the permissions model allows for more complex entries
                // than this, our UI presents a checkbox, so we can only
                // interpret "prevent others from viewing" as meaning "allow
                // only me to view". This may want changing in the future.
                annotation.permissions[action] = [
                    authz.authorizedUserId(u)
                ];
            }
        };
    }
/*
    editor.addField({
        type: 'checkbox',
        label: _t('Allow anyone to <strong>view</strong> this annotation'),
        load: createLoadCallback('read'),
        submit: createSubmitCallback('read')
    });

    editor.addField({
        type: 'checkbox',
        label: _t('Allow anyone to <strong>edit</strong> this annotation'),
        load: createLoadCallback('update'),
        submit: createSubmitCallback('update')
    });

    // add checkbox for set delete permission 
    editor.addField({
        type: 'checkbox',
        label: _t('Allow anyone to <strong>delete</strong> this annotation'),
        load: createLoadCallback('delete'),
        submit: createSubmitCallback('delete')
    });
    */
}


/**

 */
function main(options) {

    console.log("[INFO] ddimain start()");

    if (typeof options === 'undefined' || options === null) {
        options = {};
    }

    options.element = options.element || global.document.body;
    options.editorExtensions = options.editorExtensions || [];
    options.viewerExtensions = options.viewerExtensions || [];

    // Local helpers
    var makeHLAnnotation = annotationFactory(options.element, '.annotator-hl');
    //var makeDDIAnnotation = annotationFactory(options.element, '.annotator-ddi');

    // Object to hold local state
    var s = {
        interactionPoint: null
    };
    publicsddi = s;
    function start(app) {
        var ident = app.registry.getUtility('identityPolicy');
        var authz = app.registry.getUtility('authorizationPolicy');

        // ddi adder
        s.ddiadder = new ddiadder.ddiAdder({
            onCreate: function (ann) {
                app.annotations.create(ann);
                adderClick = true;
            },
            onUpdate: function (ann) {
                app.annotations.update(ann);
            }
        });
        s.ddiadder.attach();

        // highlight adder
        s.hladder = new hladder.Adder({
            onCreate: function (ann) {
                app.annotations.create(ann);
                adderClick = true;
            },
            onUpdate: function (ann) {
                app.annotations.update(ann);
            }
        });
        s.hladder.attach();

        // ddi editor
        s.ddieditor = new ddieditor.ddiEditor({
            extensions: options.editorExtensions,
            onDelete: function (ann) {
                if (ann.annotationType == "DDI") {
                    currAnnotation = ann;
                    if (currFormType == "claim") { 
                        // delete confirmation for claim
                        $( "#dialog-claim-delete-confirm" ).show();
                    } else if (currFormType == "reviewer") {
                        $( "#dialog-dips-delete-confirm" ).show();
                    } else {
                        // delete confirmation for data & material
                        $( "#dialog-data-delete-confirm" ).show();
                    }
                }
            }
        });
        s.ddieditor.attach();

        // highlight editor
        s.hleditor = new hleditor.Editor({
            extensions: options.editorExtensions
        });
        s.hleditor.attach();

        // multi select adder (will not create annotation)
        s.crpgadder = new crpgadder.Adder({

            onCreate: function (ann) {               
                undrawCurrhighlighter();
                s.currhighlighter.draw(currAnnotation, "add");
                if (currAnnotation != undefined && multiSelected) {
                    s.cancelcrpgadder.show(s.interactionPoint);
                }
                //app.annotations.create(ann);
            },
            onUpdate: function (ann) {
                //app.annotations.update(ann);
            }
        });
        s.crpgadder.attach();

        // cancel multi select adder (will not create annotation)
        s.cancelcrpgadder = new cancelcrpgadder.Adder({
            onCreate: function () {
                undrawCurrhighlighter();
                if (currAnnotation == undefined || !multiSelected) {
                    s.cancelcrpgadder.hide();
                } else {
                    s.currhighlighter.draw(currAnnotation, "add");
                }
                console.log("cancel multi select adder >>");
                console.log(multiSelected);
                console.log(currAnnotation);
                //app.annotations.create(ann);
            },
            onUpdate: function (ann) {
                //app.annotations.update(ann);
            }
        });
        s.cancelcrpgadder.attach();
        
        addPermissionsCheckboxes(s.ddieditor, ident, authz);
        //addPermissionsCheckboxes(s.hleditor, ident, authz);

        //highlighter
        s.hlhighlighter = new hlhighlighter.Highlighter(options.element);
        s.ddihighlighter = new ddihighlighter.ddiHighlighter(options.element);
        s.currhighlighter = new currhighlighter.currHighlighter(options.element);

        // select text, then load normed ranges to adder
        s.textselector = new textselector.TextSelector(options.element, {
            onSelection: function (ranges, event) {
                //console.log("ddimain - textselector - onSelection");

                //global variable: rangeChildNodes
                rangeChildNodes = ranges.childNodes;
                //console.log($("#__p2"));
                //console.log(rangeChildNodes);

                if (ranges.length > 0) {
                    hlAnnotation = makeHLAnnotation(ranges);
                    s.interactionPoint = util.mousePosition(event);
                    s.hladder.load(hlAnnotation, s.interactionPoint);
                    s.ddiadder.load(hlAnnotation, s.interactionPoint);
                    if (sourceURL.match(/\.pdf/g)) {
                        s.crpgadder.load(hlAnnotation, s.interactionPoint);
                        if (currAnnotation != undefined && multiSelected) {
                            s.cancelcrpgadder.show(s.interactionPoint); //duplicate show, but this can update adder position
                        }
                    }
                    //console.log(currAnnotation);
                } else {
                    s.hladder.hide();
                    s.ddiadder.hide();
                    s.crpgadder.hide();
                    if (currAnnotation == undefined || !multiSelected) {
                        s.cancelcrpgadder.hide();
                    }
                }
            }
        });

        // ddi viewer
        s.ddiviewer = new ddiviewer.ddiViewer({
            onEdit: function (ann, field, dataNum) {
                hlAnnotation = undefined; //clean cached textSelected ranges
                // Copy the interaction point from the shown viewer:
                s.interactionPoint = util.$(s.ddiviewer.element)
                    .css(['top', 'left']);

                $("#annotator-delete").show();
                if (ann.annotationType == "DDI"){
                    var annotationId = ann.id;

                    if (field == "claim") {
                        $('#quote').show();
                        claimEditorLoad();
                    } else { 
                        $("#claim-label-data-editor").show();
                        $('#quote').hide();
                        switchDataForm(field, true);   
                        currDataNum = dataNum;
                    }
                    app.annotations.update(ann);
                }
            },
            onDelete: function (ann) {
                app.annotations['delete'](ann);
            },
            permitEdit: function (ann) {
                return authz.permits('update', ann, ident.who());
            },
            permitDelete: function (ann) {
                return authz.permits('delete', ann, ident.who());
            },
            autoViewHighlights: options.element,
            extensions: options.viewerExtensions
        });
        s.ddiviewer.attach();


        // highlight viewer
        s.hlviewer = new hlviewer.Viewer({
            onEdit: function (ann) {
                // Copy the interaction point from the shown viewer:
                s.interactionPoint = util.$(s.hlviewer.element)
                    .css(['top', 'left']);
                if (ann.annotationType == "DrugMention"){
                    app.annotations.update(ann);
                }
            },
            onDelete: function (ann) {
                app.annotations['delete'](ann);
            },
            permitEdit: function (ann) {
                return authz.permits('update', ann, ident.who());
            },
            permitDelete: function (ann) {
                return authz.permits('delete', ann, ident.who());
            },
            autoViewHighlights: options.element,
            extensions: options.viewerExtensions
        });
        s.hlviewer.attach();


        injectDynamicStyle();
    }

    return {
        start: start,

        destroy: function () {
            s.hleditor.destroy();
            s.hlhighlighter.destroy();
            s.hladder.destroy();
            s.textselector.destroy();
            s.hlviewer.destroy();
            s.ddiadder.destroy();
            s.ddieditor.destroy();
            s.ddihighlighter.destroy();
            s.ddiviewer.destroy();
            s.currhighlighter.destroy();
            removeDynamicStyle();
        },

        annotationsLoaded: function (anns, pageNumber) {
            //highlight existed annotations
            if(pageNumber != undefined) {
                //load by page
                console.log("[load page " + pageNumber + "]");
                var annsByPage = [];
                for (var i = 0; i < anns.length; i++) {

                    if (anns[i].annotationType == "DrugMention") {
                        annsByPage.push(anns[i]);
                    } else {
                        var ranges = anns[i].argues.ranges;
                        var flag = false;
                        for (var j = 0; j < ranges.length; j++) {
                            if (ranges[j].start.substring(19, 21).replace("]", "") == pageNumber) {
                                annsByPage.push(anns[i]);
                                flag = true;
                                break;
                            }
                        }

                        //data(not claim) in this annotation may appear in different pages
                        //In order to load them successfully, check them every time
                        if (!flag && anns[i].argues.supportsBy.length != 0) {
                            var data = anns[i].argues.supportsBy;
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].auc != undefined && data[j].auc.ranges != undefined &&
                                    (data[j].auc.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].cmax.ranges != "undefined" &&
                                    (data[j].cmax.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].halflife.ranges != "undefined" &&
                                    (data[j].halflife.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].clearance.ranges != "undefined" &&
                                    (data[j].clearance.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].supportsBy.supportsBy.drug1Dose.ranges != "undefined" &&
                                    (data[j].supportsBy.supportsBy.drug1Dose.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].supportsBy.supportsBy.drug2Dose.ranges != "undefined" &&
                                    (data[j].supportsBy.supportsBy.drug2Dose.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (typeof data[j].supportsBy.supportsBy.participants.ranges != "undefined" &&
                                    (data[j].supportsBy.supportsBy.participants.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (data[j].supportsBy.supportsBy.phenotype != undefined && data[j].supportsBy.supportsBy.phenotype.ranges != undefined && 
                                    (data[j].supportsBy.supportsBy.phenotype.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                                    annsByPage.push(anns[i]);
                                } else if (isInPage(data[j], pageNumber, anns[i].argues.method)) {
                                    annsByPage.push(anns[i]);
                                }
                            }
                        }
                    }
                }
                console.log("[num of annotations: " + annsByPage.length + "]");
                //console.log(annsByPage);
                s.hlhighlighter.drawAll(annsByPage, pageNumber);
                s.ddihighlighter.drawAll(annsByPage, pageNumber);
            } else {
                //load one time
                s.hlhighlighter.drawAll(anns);
                s.ddihighlighter.drawAll(anns);
            }
        },

        beforeAnnotationCreated: function (annotation) {
            // Editor#load returns a promise that is resolved if editing
            // completes, and rejected if editing is cancelled. We return it
            // here to "stall" the annotation process until the editing is
            // done.

	    annotation.rawurl = options.source;
    	    annotation.uri = options.source.replace(/[\/\\\-\:\.]/g, "");
	    annotation.email = options.email;

            console.log("beforeAnnotationCreated");

            // keep text selection in annotation for draw current annotating text
            annotation.childNodes = rangeChildNodes; 
            // call different editor based on annotation type
            s.cancelcrpgadder.hide();
            if (annotation.annotationType == "DDI"){
                s.currhighlighter.draw(annotation, "add");
                adderClick = false;
                hlAnnotation = undefined; //clean cached textSelected ranges
                return s.ddieditor.load(s.interactionPoint,annotation);
            } else if (annotation.annotationType == "DrugMention") {
                // return s.hleditor.load(annotation, s.interactionPoint);
                // not show editor when typed as Drug mention
                //hlAnnotation = undefined; //clean cached textSelected ranges
                return null;
            } else {
                //return s.ddieditor.load(annotation, s.interactionPoint);
                //hlAnnotation = undefined; //clean cached textSelected ranges
                return null;
            }
        },
        annotationCreated: function (ann) {
            if (ann.annotationType == "DDI"){
                console.log("ddimain - annotationCreated called!");

                s.ddihighlighter.draw(ann);
                currAnnotationId = ann.id;

                // add current user to email list for import and update ann table
                if (!userEmails.has(ann.email)) { 
                    userEmails.add(ann.email);
                }

                updateAnnTable(ann.rawurl);

                // show dialog for adding multiple claim/data on the same span
                // skip statement
                if (ann.argues.method != "Statement")
                    addClaimDataDialog(ann);
         
            } else if (ann.annotationType == "DrugMention"){
                s.hlhighlighter.draw(ann);
            } else {
                alert('[WARNING] main.js - annotationCreated - annot type not defined: ' + ann.annotationType);
            }
        },
        beforeAnnotationUpdated: function (annotation) {
            console.log(">>>>>>currAnnotationId<<<<<" + currAnnotationId);
            currAnnotationId = annotation.id;
            currAnnotation = annotation;

            if (annotation.annotationType == "DDI"){
                /*Parameters:
                    annotation: the original annotation, already existed one
                    hlAnnotation: a dummy annotation, used to store textSelected ranges
                */
                console.log("ddimain - beforeAnnotationUpdated");

                if ((sourceURL.indexOf(".pdf") != -1 && !adderClick) || hlAnnotation == undefined) {
                    //edit claim or data of current annotation
                    console.log("[test-annotation ] "+ multiSelected + adderClick + hlAnnotation);
                    console.log(currAnnotation);
                    if (multiSelected) {
                        s.currhighlighter.draw(currAnnotation, "add");
                    } else {
                        s.currhighlighter.draw(annotation, "edit");
                    }
                } else {
                    //add new data to current annotation
                    console.log("[test-hlAnnotation ] "+ multiSelected);
                    console.log(currAnnotation);
                    s.currhighlighter.draw(hlAnnotation, "add");
                }
                s.cancelcrpgadder.hide();
                multiSelected = false; //TODO
                adderClick = false;
                hlAnnotation = undefined; //clean cached textSelected ranges
                return s.ddieditor.load(s.interactionPoint,annotation);
            } else {
                //console.log(annotation);
                //s.hlhighlighter.undraw(annotation);
                //console.log(hlAnnotation);
                return null;
            }
        },
        annotationUpdated: function (ann) {
            console.log("ddimain - annotationUpdated called");
            if (ann.annotationType == "DDI"){
                s.ddihighlighter.redraw(ann);
                currAnnotationId = ann.id;
                updateAnnTable(ann.rawurl);
           
            } else if (ann.annotationType == "DrugMention"){
                s.hlhighlighter.redraw(ann);
            } else {
                alert('[WARNING] main.js - annotationUpdated - annot type not defined: ' + ann.annotationType);
            }
        },
        beforeAnnotationDeleted: function (ann) {
            s.ddihighlighter.undraw(ann);
            s.hlhighlighter.undraw(ann);            
        }
        ,
        annotationDeleted: function (ann) {
            //console.log("ddimain - annotationDeleted called");
            showAnnTable();
            setTimeout(function(){
                updateAnnTable(options.source);
            },1000);
        }
    };
}

//delete claim confirmation
$( "#claim-delete-confirm-btn" ).click(function() {
    $( "#dialog-claim-delete-confirm" ).hide();
    //console.log("confirm deletion");
    //console.log(currAnnotation.id);
    // clean cached text selection
    isTextSelected = false;
    cachedOATarget = "";
    cachedOARanges = "";
    // clean field name and annotation id
    currFormType = "";
    currAnnotationId = "";

    app.annotations.delete(currAnnotation);
    showAnnTable();
    //s.ddihighlighter.undraw(currAnnotation);

});
$( "#claim-delete-cancel-btn" ).click(function() {
    $( "#dialog-claim-delete-confirm" ).hide();
});
$( "#claim-delete-dialog-close" ).click(function() {
    $( "#dialog-claim-delete-confirm" ).hide();
});

//delete data confirmation
$( "#data-delete-confirm-btn" ).click(function() {

    $("#dialog-data-delete-confirm").hide();
    if (currFormType == "participants") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.participants = {};
    } else if (currFormType == "dose1") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug1Dose = {};
    } else if (currFormType == "dose2") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug2Dose = {};
    } else if (currFormType == "auc" || currFormType == "cmax" || currFormType == "clearance" || currFormType == "halflife" || currFormType == "cellSystem") {
        currAnnotation.argues.supportsBy[currDataNum][currFormType] = {};
    } else if (currFormType == "rateWith" || currFormType == "rateWithout") {
        var temp = {'rateWith': 'metaboliteRateWith', 'rateWithout': 'metaboliteRateWithout'};
        currAnnotation.argues.supportsBy[currDataNum][temp[currFormType]] = {};
    } else if (currFormType == "cl" || currFormType == "vmax" || currFormType == "km" || currFormType == "ki" || currFormType == "inhibition" || currFormType == "kinact" || currFormType == "ic50") {
        currAnnotation.argues.supportsBy[currDataNum].measurement[currFormType] = {};
    } else if (currFormType == "evRelationship") {
        currAnnotation.argues.supportsBy[currDataNum].evRelationship = '';
    } else if (currFormType == "phenotype") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.phenotype = {};
    } else if (currFormType == "reviewer") {
        currAnnotation.argues.supportsBy[currDataNum].reviewer = '';
        currAnnotation.argues.supportsBy[currDataNum].dips = '';
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug1Dose = {};
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug2Dose = {};
    } else {
        alert("[ERROR] editor type is not avaliable! - " + currFormType);
    }

    // after deletion, if this row is empty, then delete
    var boo = isDataRowEmpty(currAnnotation.argues.supportsBy[currDataNum]);
    if (boo) {
        //console.log("delete data empty row!");
        currAnnotation.argues.supportsBy.splice(currDataNum, 1);
        totalDataNum = totalDataNum -1;
    }

    if (typeof publicsddi.ddieditor.dfd !== 'undefined' && publicsddi.ddieditor.dfd !== null) {
     publicsddi.ddieditor.dfd.resolve();
     }
    showAnnTable();
});

//delete dips question score confirmation
$( "#dips-delete-confirm-btn" ).click(function() {
    $("#dialog-dips-delete-confirm").hide();
    if (currFormType == "reviewer") {
        currAnnotation.argues.supportsBy[currDataNum].reviewer = '';
        currAnnotation.argues.supportsBy[currDataNum].dips = '';
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug1Dose = {};
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug2Dose = {};
    } else {
        currAnnotation.argues.supportsBy[currDataNum].dips = '';
    }

    // after deletion, if this row is empty, then delete
    var boo = isDataRowEmpty(currAnnotation.argues.supportsBy[currDataNum]);
    if (boo) {
        //console.log("delete data empty row!");
        currAnnotation.argues.supportsBy.splice(currDataNum, 1);
        totalDataNum = totalDataNum -1;
    }

    if (typeof publicsddi.ddieditor.dfd !== 'undefined' && publicsddi.ddieditor.dfd !== null) {
        publicsddi.ddieditor.dfd.resolve();
    }
    showAnnTable();
});

$( "#data-delete-cancel-btn" ).click(function() {
    $( "#dialog-data-delete-confirm" ).hide();
});
$( "#data-delete-dialog-close" ).click(function() {
    $( "#dialog-data-delete-confirm" ).hide();
});
$( "#dips-delete-dialog-close" ).click(function() {
    $( "#dialog-dips-delete-confirm" ).hide();
});
$( "#dips-delete-cancel-btn" ).click(function() {
    $( "#dialog-dips-delete-confirm" ).hide();
});


// called when delete data
// return false if data row not empty, otherwise, return true
function isDataRowEmpty(data) {

    //console.log("delete data - call isDataRowEmpty");
    var fieldL = ["auc","cmax","clearance","halflife"];
    
    for (i = 0; i < fieldL.length; i++) {
        if (data[fieldL[i]].value != null)
            return false;
    }
    
    if (data.supportsBy.supportsBy.participants.value != null || data.supportsBy.supportsBy.drug1Dose.value != null || data.supportsBy.supportsBy.drug2Dose.value !=null)
        return false;

    if (data.cellSystem != null || data.metaboliteRateWith != null || data.metaboliteRateWithout != null) {
        return false;
    }

    return true   
}


// get text contents from DOM node
function getTxtFromNode(node, isSuffix, ignoreSelector, maxLength){

    var origParent;
    if (ignoreSelector) {
        origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0);
    } else {
        origParent = $(node).parent();
    }
    
    var textNodes = xUtil.getTextNodes(origParent);
    var nodes;
    var contents = "";

    if (!isSuffix){
        nodes = textNodes.slice(0, textNodes.index(node));
        for (var _i = 0, _len = nodes.length; _i < _len; _i++) {
            contents += nodes[_i].nodeValue;
        }
        if (contents.length > maxLength){
            contents = contents.substring(contents.length - maxLength);
        }

    } else {
        nodes = textNodes.slice(textNodes.index(node) + 1, textNodes.length);   
        for (var _i = 0, _len = nodes.length; _i < _len; _i++) {
            contents += nodes[_i].nodeValue;
        }
        if (contents.length > maxLength){
            contents = contents.substring(0, maxLength);
        }
        
    }

    return contents;
}

// call to pop up dialog box for showing options during creating claim/data
function addClaimDataDialog(ann) {

    // dialog box for creating claim options 
    var claimDialog = document.getElementById('create-claim-dialog');
    
    // Get the button that opens the dialog
    var addDataBtn = document.getElementById("add-data-same-span-btn");
    var addClaimBtn = document.getElementById("add-claim-same-span-btn");
    var finishSameSpanBtn = document.getElementById("finish-same-span-btn");   
    
    var span = document.getElementById("create-claim-close");
    
    claimDialog.style.display = "block";
                
    // When the user clicks on <span> (x), close the dialog
    span.onclick = function() {
        claimDialog.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the dialog, close it
    window.onclick = function(event) {
        if (event.target == claimDialog) {
            claimDialog.style.display = "none";
        }
    }
    
    addDataBtn.onclick = function() {
        claimDialog.style.display = "none";
        isTextSelected = true;
        cachedOATarget = ann.argues.hasTarget;
        cachedOARanges = ann.argues.ranges; 
        if (ann.argues.method == "Case Report") {
            addDataCellByEditor("dose1", 0);
        } else if (ann.argues.method == "Experiment") {
            addDataCellByEditor("cellSystem", 0);
        } else {
            addDataCellByEditor("participants", 0);
        }                              
        //addDataCellByEditor("auc", 0);                    
    }
    
    addClaimBtn.onclick = function() {
        claimDialog.style.display = "none";
        showEditor();
        claimEditorLoad();
        currFormType = "claim";
        var newAnn = (JSON.parse(JSON.stringify(ann)));
        newAnn.argues.qualifiedBy = {};
        newAnn.argues.method = "";
        newAnn.rejected = null;
        app.annotations.create(newAnn);                   
    }
    
    finishSameSpanBtn.onclick = function() {
        claimDialog.style.display = "none";
        showAnnTable();  
        
        // clean cached text selection
        isTextSelected = false;
        cachedOATarget = "";
        cachedOARanges = "";
    }   
}

function isInPage(data, pageNumber, method) {
    if (method == "Experiment") {
        if (data.measurement != undefined) {
            var mTypes = ["cl", "vmax", "ki", "km", "inhibition", "kinact", "ic50"];
            for (var i = 0; i < mTypes.length; i++) {
                var mType = mTypes[i];
                if (data.measurement[mType] != undefined && data.measurement[mType].ranges != undefined &&
            (data.measurement[mType].ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
                    return true;
                }
            }
        }
        if (data.cellSystem != undefined && data.cellSystem.ranges != undefined &&
            (data.cellSystem.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
            return true;
        }
        if (data.metaboliteRateWithout != undefined && data.metaboliteRateWithout.ranges != undefined &&
            (data.metaboliteRateWithout.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
            return true;
        }
        if (data.metaboliteRateWith != undefined && data.metaboliteRateWith.ranges != undefined &&
            (data.metaboliteRateWith.ranges[0].start.substring(19, 21).replace("]", "") == pageNumber)) {
            return true;
        }
    }
    return false;
}



exports.main = main;
