/*package annotator.ui */
"use strict";

var util = require('../util');
var xUtil = require('../xutil');
var textselector = require('./textselector');

// mp
var mpadder = require('./../mpPlugin/adder');
var mphighlighter = require('./../mpPlugin/highlighter');
var currhighlighter = require('./temphighlighter');

var mpeditor = require('./../mpPlugin/editor');
var mpviewer = require('./../mpPlugin/viewer');

// highlight
var hladder = require('./../drugPlugin/adder');
var hleditor = require('./../drugPlugin/editor');
var hlhighlighter = require('./../drugPlugin/highlighter');
var hlviewer = require('./../drugPlugin/viewer');

var _t = util.gettext;
var rangeChildNodes = [];
var hlAnnotation;
var publics;

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
            //console.log(ranges);
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
            }
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

            //alert('mp main - load - user ident:' + u)

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

    console.log("[INFO] mpmain start()");

    if (typeof options === 'undefined' || options === null) {
        options = {};
    }

    options.element = options.element || global.document.body;
    options.editorExtensions = options.editorExtensions || [];
    options.viewerExtensions = options.viewerExtensions || [];

    // Local helpers
    var makeHLAnnotation = annotationFactory(options.element, '.annotator-hl');
    //var makeMPAnnotation = annotationFactory(options.element, '.annotator-mp');

    // Object to hold local state
    var s = {
        interactionPoint: null
    };
    publics = s;
    function start(app) {
        var ident = app.registry.getUtility('identityPolicy');
        var authz = app.registry.getUtility('authorizationPolicy');

        // mp adder
        s.mpadder = new mpadder.mpAdder({
            onCreate: function (ann) {
                app.annotations.create(ann);
            },
            onUpdate: function (ann) {
                app.annotations.update(ann);
            }
        });
        s.mpadder.attach();

        // highlight adder
        s.hladder = new hladder.Adder({
            onCreate: function (ann) {
                app.annotations.create(ann);
            },
            onUpdate: function (ann) {
                app.annotations.update(ann);
            }
        });
        s.hladder.attach();

        // mp editor
        s.mpeditor = new mpeditor.mpEditor({
            extensions: options.editorExtensions,
            onDelete: function (ann) {

                currAnnotation = ann;
                if (currFormType == "claim") { 
                    // delete confirmation for claim
                    $( "#dialog-claim-delete-confirm" ).show();

                } else {

                    // delete confirmation for data & material
                    $("#dialog-data-delete-confirm").show();
                }
            }
        });
        s.mpeditor.attach();

        s.hleditor = new hleditor.Editor({
            extensions: options.editorExtensions
        });
        s.hleditor.attach();

        addPermissionsCheckboxes(s.mpeditor, ident, authz);
        //addPermissionsCheckboxes(s.hleditor, ident, authz);

        //highlighter
        s.hlhighlighter = new hlhighlighter.Highlighter(options.element);
        s.mphighlighter = new mphighlighter.mpHighlighter(options.element);
        s.currhighlighter = new currhighlighter.currHighlighter(options.element);

        // select text, then load normed ranges to adder
        s.textselector = new textselector.TextSelector(options.element, {
            onSelection: function (ranges, event) {
                console.log("mpmain - textselector - onSelection");
                //global variable: rangeChildNodes
                rangeChildNodes = ranges.childNodes;
                if (ranges.length > 0) {
                    //var mpAnnotation = makeMPAnnotation(ranges);
                    hlAnnotation = makeHLAnnotation(ranges);
                    s.interactionPoint = util.mousePosition(event);
                    s.hladder.load(hlAnnotation, s.interactionPoint);
                    s.mpadder.load(hlAnnotation, s.interactionPoint);
                    //s.mpadder.load(mpAnnotation, s.interactionPoint);

                } else {
                    s.hladder.hide();
                    s.mpadder.hide();
                }
            }
        });

        // mp viewer
        s.mpviewer = new mpviewer.mpViewer({
            onEdit: function (ann, field, dataNum) {
                // Copy the interaction point from the shown viewer:
                s.interactionPoint = util.$(s.mpviewer.element)
                    .css(['top', 'left']);

                $("#annotator-delete").show();
                if (ann.annotationType == "MP"){
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
        s.mpviewer.attach();


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
            s.mpadder.destroy();
            s.mpeditor.destroy();
            s.mphighlighter.destroy();
            s.mpviewer.destroy();
            s.currhighlighter.destroy();
            removeDynamicStyle();
        },

        annotationsLoaded: function (anns, pageNumber) {
            if(pageNumber != undefined) {
                console.log("[load page " + pageNumber + "]");
                var annsByPage = [];
                for (var i = 0; i < anns.length; i++) {
                    if (anns[i].argues.ranges[0].start.substring(47, 48) == pageNumber)
                        annsByPage.push(anns[i]);
                }
                console.log("[num of annotations: " + annsByPage.length + "]")
                s.hlhighlighter.drawAll(annsByPage);
                s.mphighlighter.drawAll(annsByPage);
            } else {
                s.hlhighlighter.drawAll(anns);
                s.mphighlighter.drawAll(anns);
            }
        },

        beforeAnnotationCreated: function (annotation) {
            // Editor#load returns a promise that is resolved if editing
            // completes, and rejected if editing is cancelled. We return it
            // here to "stall" the annotation process until the editing is
            // done.
            //console.log("[mpmain--beforeAnnotationCreated]")
            //s.mphighlighter.draw(annotation);//enhancement

		    annotation.rawurl = options.source;
    		annotation.uri = options.source.replace(/[\/\\\-\:\.]/g, "");		
		    annotation.email = options.email;
            annotation.childNodes = rangeChildNodes;
            // call different editor based on annotation type
            if (annotation.annotationType == "MP"){
                s.currhighlighter.draw(annotation, "add");
                //hlAnnotation = undefined; //clean cached textSelected ranges
                return s.mpeditor.load(s.interactionPoint,annotation);
            } else if (annotation.annotationType == "DrugMention") {
                // return s.hleditor.load(annotation, s.interactionPoint);
                // not show editor when typed as Drug mention
                //hlAnnotation = undefined; //clean cached textSelected ranges
                return null;
            } else {
                //return s.mpeditor.load(annotation, s.interactionPoint);
                //hlAnnotation = undefined; //clean cached textSelected ranges
                return null;
            }
        },
        annotationCreated: function (ann) {
            if (ann.annotationType == "MP"){
                console.log("mpmain - annotationCreated called");
                s.mphighlighter.draw(ann);
                currAnnotationId = ann.id;
                annotationTable(ann.rawurl, ann.email);

                // show dialog for adding multiple claim/data on the same span
                addClaimDataDialog(ann);
         
            } else if (ann.annotationType == "DrugMention"){
                s.hlhighlighter.draw(ann);
            } else {
                alert('[WARNING] main.js - annotationCreated - annot type not defined: ' + ann.annotationType);
            }
        },
        beforeAnnotationUpdated: function (annotation) {

            if (annotation.annotationType == "MP"){

                console.log("mpmain - beforeAnnotationUpdated")
                if(hlAnnotation==undefined) {
                    s.currhighlighter.draw(annotation, "edit");

                } else {
                    s.currhighlighter.draw(hlAnnotation, "add");

                }
                hlAnnotation = undefined; //clean cached textSelected ranges
                return s.mpeditor.load(s.interactionPoint,annotation);
            } else if (annotation.annotationType == "DrugMention") {
                // return s.hleditor.load(annotation, s.interactionPoint);
                return null;
            } else {
                return null;
            }
        },
        annotationUpdated: function (ann) {
            console.log("mpmain - annotationUpdated called");
            if (ann.annotationType == "MP"){
                hlAnnotation = undefined;
                s.mphighlighter.redraw(ann);
                currAnnotationId = ann.id;
                annotationTable(ann.rawurl, ann.email);
           
            } else if (ann.annotationType == "DrugMention"){
                s.hlhighlighter.redraw(ann);
            } else {
                alert('[WARNING] main.js - annotationUpdated - annot type not defined: ' + ann.annotationType);
            }
        },
        beforeAnnotationDeleted: function (ann) {
            s.mphighlighter.undraw(ann);
            s.hlhighlighter.undraw(ann);            
        }
        ,
        annotationDeleted: function (ann) {
            console.log("mpmain - annotationDeleted called");
            console.log(ann);
            showAnnTable();
            setTimeout(function(){
                annotationTable(options.source, options.email);
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
    //s.mphighlighter.undraw(currAnnotation);

});
$( "#claim-delete-cancel-btn" ).click(function() {
    $( "#dialog-claim-delete-confirm" ).hide();
});
$( "#claim-delete-dialog-close" ).click(function() {
    $( "#dialog-claim-delete-confirm" ).hide();
});

//delete data confirmation
$( "#data-delete-confirm-btn" ).click(function() {
    //console.log("delete data: id = "+currAnnotation.id);
    $("#dialog-data-delete-confirm").hide();
    if (currFormType == "participants") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.participants = {};
    } else if (currFormType == "dose1") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug1Dose = {};
    } else if (currFormType == "dose2") {
        currAnnotation.argues.supportsBy[currDataNum].supportsBy.supportsBy.drug2Dose = {};
    } else if (currFormType == "auc" || currFormType == "cmax" || currFormType == "clearance" || currFormType == "halflife") {
        currAnnotation.argues.supportsBy[currDataNum][currFormType] = {};
    } else if (currFormType == "evRelationship") {
        currAnnotation.argues.supportsBy[currDataNum].evRelationship = '';
    } else {
        alert("[ERROR] editor type is not avaliable!");
    }

    // after deletion, if this row is empty, then delete
    var boo = isDataRowEmpty(currAnnotation.argues.supportsBy[currDataNum]);
    if (boo) {
        //console.log("delete data empty row!");
        currAnnotation.argues.supportsBy.splice(currDataNum, 1);
        totalDataNum = totalDataNum -1;
    }

// clean cached text selection
// isTextSelected = false;
// cachedOATarget = "";
// cachedOARanges = "";

    if (typeof publics.mpeditor.dfd !== 'undefined' && publics.mpeditor.dfd !== null) {
     publics.mpeditor.dfd.resolve();
     }
    showAnnTable();
});

$( "#data-delete-cancel-btn" ).click(function() {
    $( "#dialog-data-delete-confirm" ).hide();
});
$( "#data-delete-dialog-close" ).click(function() {
    $( "#dialog-data-delete-confirm" ).hide();
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
        addDataCellByEditor("participants", 0);                    
    }
    
    addClaimBtn.onclick = function() {
        claimDialog.style.display = "none";
        showEditor();
        claimEditorLoad();
        currFormType = "claim";
        var newAnn = (JSON.parse(JSON.stringify(ann)));
        newAnn.argues.qualifiedBy = {};
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




exports.main = main;
