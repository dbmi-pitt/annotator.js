"use strict";

var Range = require('xpath-range').Range;

var util = require('../util');

var $ = util.$;
var Promise = util.Promise;


// highlightRange wraps the DOM Nodes within the provided range with a highlight
// element of the specified class and returns the highlight Elements.
//
// normedRange - A NormalizedRange to be highlighted.
// cssClass - A CSS class to use for the highlight (default: 'annotator-hl')
//
// Returns an array of highlight Elements.
function highlightRange(normedRange, cssClass) {
    if (typeof cssClass === 'undefined' || cssClass === null) {
        cssClass = 'annotator-hl';
    }
    var white = /^\s*$/;

    // Ignore text nodes that contain only whitespace characters. This prevents
    // spans being injected between elements that can only contain a restricted
    // subset of nodes such as table rows and lists. This does mean that there
    // may be the odd abandoned whitespace node in a paragraph that is skipped
    // but better than breaking table layouts.
    var nodes = normedRange.textNodes(),
        results = [];
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        if (!white.test(node.nodeValue)) {
            var mphl = global.document.createElement('span');
            mphl.className = cssClass;
            mphl.setAttribute("name", "annotator-mp");
            node.parentNode.replaceChild(mphl, node);
            mphl.appendChild(node);
            results.push(mphl);
        }
    }
    return results;
}


// reanchorRange will attempt to normalize a range, swallowing Range.RangeErrors
// for those ranges which are not reanchorable in the current document.
function reanchorRange(range, rootElement) {
    try {
        return Range.sniff(range).normalize(rootElement);
    } catch (e) {
        if (!(e instanceof Range.RangeError)) {
            // Oh Javascript, why you so crap? This will lose the traceback.
            throw(e);
        }
        // Otherwise, we simply swallow the error. Callers are responsible
        // for only trying to draw valid annotations.
    }
    return null;
}


// Highlighter provides a simple way to draw highlighted <span> tags over
// annotated ranges within a document.
//
// element - The root Element on which to dereference annotation ranges and
//           draw highlights.
// options - An options Object containing configuration options for the plugin.
//           See `Highlighter.options` for available options.
//
var mpHighlighter = exports.mpHighlighter = function Highlighter(element, options) {
    this.element = element;
    this.options = $.extend(true, {}, Highlighter.options, options);
};

mpHighlighter.prototype.destroy = function () {
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
mpHighlighter.prototype.drawAll = function (annotations) {
    var self = this;

    var p = new Promise(function (resolve) {
        var highlights = [];

        function loader(annList) {
            if (typeof annList === 'undefined' || annList === null) {
                annList = [];
            }

            var now = annList.splice(0, self.options.chunkSize);
            for (var i = 0, len = now.length; i < len; i++) {
                if (now[i].annotationType == "MP")
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

// Public: Draw highlights for the MP annotation.
// Including: claim, [{data, method, material}, {..}]
// annotation - An annotation Object for which to draw highlights.
//
// Returns an Array of drawn highlight elements.
mpHighlighter.prototype.draw = function (annotation) {

    if (annotation.annotationType != "MP")
        return null;

    console.log('mphighlighter - draw anntype: ' + annotation.annotationType);
    console.log(annotation);

    var normedRanges = [];

    // draw MP claim
    for (var i = 0, ilen = annotation.argues.ranges.length; i < ilen; i++) {
        var r = reanchorRange(annotation.argues.ranges[i], this.element);
        if (r !== null) {
            normedRanges.push(r);
        }
    }
    // draw MP data
    try {
        if (annotation.argues.supportsBy.length != 0){
            // draw MP Material
            var material = annotation.argues.supportsBy[0].supportsBy.supportsBy;
            if (material != null){
                if (material.participants.ranges != null) {
                    var r = reanchorRange(annotation.argues.supportsBy[0].supportsBy.supportsBy.participants.ranges[0], this.element);
                    if (r !== null) {
                        normedRanges.push(r);
                    }
                }
                if (material.drug1Dose.ranges != null) {
                    var r = reanchorRange(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug1Dose.ranges[0], this.element);
                    if (r !== null) {
                        normedRanges.push(r);
                    }
                }
                if (material.drug2Dose.ranges != null) {
                    var r = reanchorRange(annotation.argues.supportsBy[0].supportsBy.supportsBy.drug2Dose.ranges[0], this.element);
                    if (r !== null) {
                        normedRanges.push(r);
                    }
                }
                
                
            }
        }
    } catch (err) {
        console.log(err);
    }


    var hasLocal = (typeof annotation._local !== 'undefined' && annotation._local !== null);

    if (!hasLocal) {
        annotation._local = {};
    }
    var hasHighlights = (typeof annotation._local.highlights !== 'undefined' &&

    annotation._local.highlights === null);

    if (!hasHighlights) {
        annotation._local.highlights = [];
    }

    for (var j = 0, jlen = normedRanges.length; j < jlen; j++) {
        var normed = normedRanges[j];
        $.merge(
            annotation._local.highlights,
            highlightRange(normed, this.options.highlightClass)
        );
    }

    // Save the annotation data on each highlighter element.
    $(annotation._local.highlights).data('annotation', annotation);

    // Add a data attribute for annotation id if the annotation has one
    if (typeof annotation.id !== 'undefined' && annotation.id !== null) {
        //$(annotation._local.highlights)
        //    .attr('data-annotation-id', annotation.id);
        $(annotation._local.highlights).attr('id', annotation.id);
    }
    console.log(annotation._local.highlights);
    return annotation._local.highlights;
};

// Public: Remove the drawn highlights for the given MP annotation.
// annotation - An annotation Object for which to purge highlights.
// if local highlights is null, find all span by annotaiton id, then replace with child Nodes
mpHighlighter.prototype.undraw = function (annotation) {
    console.log("mphighlighter - undraw");
    console.log(annotation);

    try {
        var hasHighlights = (typeof annotation._local !== 'undefined' && annotation._local !== null && typeof annotation._local.highlights !== 'undefined' && annotation._local.highlights !== null);

        console.log(hasHighlights);
        // when add mp data, 
        // add all highlights to annotation._local.highlights           
        if (!hasHighlights) {
            var localhighlights = $('span[id^="'+annotation.id+'"]');
            for (i = 0; i < localhighlights.length; i++){
                var mpSpan = localhighlights[i];
                if (mpSpan.parentNode !== null) 
                    $(mpSpan).replaceWith(mpSpan.childNodes);
            }
        } else {        
            //console.log(annotation._local.highlights);
            for (var i = 0, len = annotation._local.highlights.length; i < len; i++) 
            {
                var h = annotation._local.highlights[i];
                if (h.parentNode !== null) {
                    $(h).replaceWith(h.childNodes);
                }
            }
            delete annotation._local.highlights;
        }        
    } catch (err) {
        console.log(err);
    }
};

// Public: Redraw the highlights for the given annotation.
//
// annotation - An annotation Object for which to redraw highlights.
//
// Returns the list of newly-drawn highlights.
mpHighlighter.prototype.redraw = function (annotation) {
    if (annotation.annotationType == "MP"){
    this.undraw(annotation);
    return this.draw(annotation);
    }
};

mpHighlighter.options = {
    // The CSS class to apply to drawn mp
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

