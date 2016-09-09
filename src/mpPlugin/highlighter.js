"use strict";

//var Range = require('xpath-range').Range;

var util = require('../util');

var $ = util.$;
var Promise = util.Promise;

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

// Return customized options for mark.js highlight 
function markOptions(fieldType, dataNum, hldivL) {

    return {
        "element": "span",
        "className": "annotator-hl",
        "separateWordSearch": false,
        "acrossElements": true,
        "accuracy": "partially",
        "each": function(elem) {
            
            $(elem).attr('name', "annotator-mp");
            $(elem).attr('fieldname', fieldType);
            $(elem).attr('datanum', dataNum);     
            $(elem).attr('data-markjs', false);  
            hldivL.push($(elem)[0]);
        }                
    };
}


// Public: Draw highlights for the MP annotation.
// Including: claim, [{data, method, material}, {..}]
// annotation - An annotation Object for which to draw highlights.
//
// Returns an Array of drawn highlight elements.
mpHighlighter.prototype.draw = function (annotation) {

    if(annotation.annotationType!=undefined) {
        if (annotation.annotationType != "MP")
            return null;
    }

    console.log("mphighlighter - draw");
    var hldivL = [];

    try {       
        //console.log(annotation);

        // mark context
        var context = document.querySelector("#subcontent");          
        var markObj = new Mark(context);

        // draw MP claim        
        var claimSelector = annotation.argues.hasTarget.hasSelector;          
        markObj.mark(claimSelector.exact, markOptions("claim",0, hldivL));

        // draw MP data
        if (annotation.argues.supportsBy.length != 0){            
            var dataL = annotation.argues.supportsBy;
            for (var idx = 0; idx < dataL.length; idx++) {
                var data = dataL[idx];

                if (data.auc.hasTarget != null) {
                    var aucSelector = data.auc.hasTarget.hasSelector;
                    markObj.mark(aucSelector.exact, markOptions("auc",idx, hldivL));
                }

                if (data.cmax.hasTarget != null) {
                    var cmaxSelector = data.cmax.hasTarget.hasSelector;
                    markObj.mark(cmaxSelector.exact, markOptions("cmax",idx, hldivL));
                }

                if (data.clearance.hasTarget != null) {
                    var clearanceSelector = data.clearance.hasTarget.hasSelector;
                    markObj.mark(clearanceSelector.exact, markOptions("clearance",idx, hldivL));
                }

                if (data.halflife.hasTarget != null) {
                    var halflifeSelector = data.halflife.hasTarget.hasSelector;
                    markObj.mark(halflifeSelector.exact, markOptions("halflife",idx, hldivL));
                }
                
                // draw MP Material
                var material = data.supportsBy.supportsBy;

                if (material != null){                    
                    if (material.participants.hasTarget != null) {
                        var partSelector = material.participants.hasTarget.hasSelector;
                        markObj.mark(partSelector.exact, markOptions("participants",idx, hldivL));           
                    }

                    if (material.drug1Dose.hasTarget != null) {
                        var dose1Selector = material.drug1Dose.hasTarget.hasSelector;
                        markObj.mark(dose1Selector.exact, markOptions("drug1Dose",idx, hldivL));           
                    }

                    if (material.drug2Dose.hasTarget != null) {
                        var dose2Selector = material.drug2Dose.hasTarget.hasSelector;
                        markObj.mark(dose2Selector.exact, markOptions("drug2Dose",idx, hldivL));           
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
    var hasHighlights = (typeof annotation._local.highlights !== 'undefined' && annotation._local.highlights === null);

    if (!hasHighlights) {
        annotation._local.highlights = [];
    }

    console.log("TEST3");
    console.log(hldivL);

    // add highlight span divs to annotation._local
    $.merge(annotation._local.highlights, hldivL);    

    //Save the annotation data on each highlighter element.
    $(annotation._local.highlights).data('annotation', annotation);

    //Add a data attribute for annotation id if the annotation has one
    if (typeof annotation.id !== 'undefined' && annotation.id !== null) {
        $(annotation._local.highlights).attr('id', annotation.id);
    }
    if (typeof annotation.id !== 'undefined' && annotation.id !== null) {
        for (var p =0; p < annotation._local.highlights.length; p++) {
            var fieldName = annotation._local.highlights[p].getAttribute("fieldName");
            var dataNum = annotation._local.highlights[p].getAttribute("dataNum");
            annotation._local.highlights[p].setAttribute("id", annotation.id + "-" + fieldName + "-" + dataNum);
        }
    }

    return annotation._local.highlights;
};

// Public: Remove the drawn highlights for the given MP annotation.
// annotation - An annotation Object for which to purge highlights.
// if local highlights is null, find all span by annotaiton id, then replace with child Nodes
mpHighlighter.prototype.undraw = function (annotation) {
    console.log("mphighlighter - undraw");

    var hasHighlights = (typeof annotation._local !== 'undefined' && annotation._local !== null && typeof annotation._local.highlights !== 'undefined' && annotation._local.highlights !== null);

    // when add mp data, annotation._local.highlights is null
    // find highlights of MP annotation, clean span 
    if (!hasHighlights) {

        var localhighlights = $('span[id^="'+annotation.id+'"]');

        for (i = 0; i < localhighlights.length; i++){
            var mpSpan = localhighlights[i];

            if (mpSpan.parentNode !== null) 
                $(mpSpan).replaceWith(mpSpan.childNodes);
        }

    } else {        

        for (var i = 0, len = annotation._local.highlights.length; i < len; i++) 
        {
            var h = annotation._local.highlights[i];
            if (h.parentNode !== null) {
                $(h).replaceWith(h.childNodes);
            }
        }
        delete annotation._local.highlights;
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

