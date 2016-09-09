"use strict";

var Range = require('xpath-range').Range;
var xpath = require('xpath-range').xpath;
var util = require('../util');
var $ = util.$;
var Promise = util.Promise;
var HttpStorage = require('./../storage').HttpStorage;
var annhost = config.annotator.host;

// Highlighter provides a simple way to draw highlighted <span> tags over
// annotated ranges within a document.
//
// element - The root Element on which to dereference annotation ranges and
//           draw highlights.
// options - An options Object containing configuration options for the plugin.
//           See `Highlighter.options` for available options.
//
var Highlighter = exports.Highlighter = function Highlighter(element, options) {
    this.element = element;
    this.options = $.extend(true, {}, Highlighter.options, options);
};
Highlighter.prototype.destroy = function () {
    $(this.element)
        .find("." + this.options.highlightClass)
        .each(function (_, el) {
            $(el).contents().insertBefore(el);
            $(el).remove();
        });
};

// Public: Draw highlights for all the given annotations
//
// annotations - An Array of annotation Objects for which to draw highlights.
//
// Returns nothing.
Highlighter.prototype.drawAll = function (annotations) {
    var self = this;

    //alert("[INFO] hlhighlighter drawAll called")

    var p = new Promise(function (resolve) {
        var highlights = [];

        function loader(annList) {
            if (typeof annList === 'undefined' || annList === null) {
                annList = [];
            }

            var now = annList.splice(0, self.options.chunkSize);
            for (var i = 0, len = now.length; i < len; i++) {
                highlights = highlights.concat(self.draw(now[i]));
            }

            // If there are more to do, do them after a delay
            if (annList.length > 0) {
                setTimeout(function () {
                    loader(annList);
                }, self.options.chunkDelay);
            } else {
                resolve(highlights);
            }
        }

        var clone = annotations.slice();
        loader(clone);
    });

    return p;
};

// Public: Draw highlights for the annotation.
//
// annotation - An annotation Object for which to draw highlights.
//
// Returns an Array of drawn highlight elements.
Highlighter.prototype.draw = function (annotation) {

    console.log("draw drug");
    console.log(annotation);

    if (annotation.annotationType != "DrugMention")
        return null;

    //var normedRanges = [];
    var oaAnnotations = [];
    var hldivL = [];

    var options = {
        "element": "span",
        "className": "annotator-hl",
        "separateWordSearch": false,
        "acrossElements": true,
        "accuracy": "partially",
        "each": function(elem) {            
            $(elem).attr('name', "annotator-hl");                
            $(elem).attr('data-markjs', false);   
            hldivL.push($(elem)[0]);
        }                
    };


    // mark context
    var context = document.querySelector("#subcontent");          
    var markObj = new Mark(context);

    var drugSelector = annotation.argues.hasTarget.hasSelector;          
    markObj.mark(drugSelector.exact, options);

    var hasLocal = (typeof annotation._local !== 'undefined' &&
    annotation._local !== null);
    if (!hasLocal) {
        annotation._local = {};
    }
    var hasHighlights = (typeof annotation._local.highlights !== 'undefined' &&
    annotation._local.highlights === null);
    if (!hasHighlights) {
        annotation._local.highlights = [];
    }

    // add highlight divs to list for editing or deleting
    $.merge(annotation._local.highlights, hldivL);    

    // Save the annotation data on each highlighter element.
    $(annotation._local.highlights).data('annotation', annotation);

    // Add a data attribute for annotation id if the annotation has one
    if (typeof annotation.id !== 'undefined' && annotation.id !== null) {
        // $(annotation._local.highlights)
        //     .attr('data-annotation-id', annotation.id);
        $(annotation._local.highlights)
            .attr('id', annotation.id);
    }

    return annotation._local.highlights;
};

// Public: Remove the drawn highlights for the given annotation.
//
// annotation - An annotation Object for which to purge highlights.
//
// Returns nothing.
Highlighter.prototype.undraw = function (annotation) {
    var hasHighlights = (typeof annotation._local !== 'undefined' &&
    annotation._local !== null &&
    typeof annotation._local.highlights !== 'undefined' &&
    annotation._local.highlights !== null);

    console.log("drughighlighter - undraw");

    if (!hasHighlights) {
        return;
    }

    for (var i = 0, len = annotation._local.highlights.length; i < len; i++) {
        var h = annotation._local.highlights[i];
        if (h.parentNode !== null) {
            $(h).replaceWith(h.childNodes);
        }
    }
    delete annotation._local.highlights;
};

// Public: Redraw the highlights for the given annotation.
//
// annotation - An annotation Object for which to redraw highlights.
//
// Returns the list of newly-drawn highlights.
Highlighter.prototype.redraw = function (annotation) {
    this.undraw(annotation);
    return this.draw(annotation);
};

Highlighter.options = {
    // The CSS class to apply to drawn highlights
    highlightClass: 'annotator-hl',
    // Number of annotations to draw at once
    chunkSize: 200,
    // Time (in ms) to pause between drawing chunks of annotations
    chunkDelay: 1
};


// standalone is a module that uses the Highlighter to draw/undraw highlights
// automatically when annotations are created and removed.
exports.standalone = function standalone(element, options) {
    var widget = exports.Highlighter(element, options);

    return {
        destroy: function () { widget.destroy(); },
        annotationsLoaded: function (anns) { widget.drawAll(anns); },
        annotationCreated: function (ann) { widget.draw(ann); },
        annotationDeleted: function (ann) { widget.undraw(ann); },
        annotationUpdated: function (ann) { widget.redraw(ann); }
    };
};
