"use strict";

var Range = require('xpath-range').Range;
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
var currHighlighter = exports.currHighlighter = function Highlighter(element, options) {
    this.element = element;
    this.options = $.extend(true, {}, Highlighter.options, options);
};

currHighlighter.prototype.destroy = function () {
    $(this.element)
        .find("." + this.options.highlightClass)
        .each(function (_, el) {
            $(el).contents().insertBefore(el);
            $(el).remove();
        });
};


// Return customized options for mark.js highlight 
function markCurrOptions(fieldType, dataNum, hldivL) {

    return {
        "element": "span",
        "className": "annotator-currhl",
        "separateWordSearch": false,
        "acrossElements": true,
        "accuracy": "partially",
        "each": function(elem) {

            $(elem).attr('name', "annotator-currhl");
            $(elem).attr('fieldname', fieldType);
            $(elem).attr('datanum', dataNum);        
            $(elem).attr('data-markjs', false);   
            //console.log(elem);
        }                
    };
}


// Public: Draw highlights for the MP annotation.
// Including: claim, [{data, method, material}, {..}]
// annotation - An annotation Object for which to draw highlights.
//
// Returns an Array of drawn highlight elements.
currHighlighter.prototype.draw = function (annotation, inputType) {

    if(annotation.annotationType!=undefined) {
        if (annotation.annotationType != "MP")
            return null;
    }

    var hldivL = [];

    try {

        // mark context
        var context = document.querySelector("#subcontent");          
        var markObj = new Mark(context);

        if(currFormType == "claim" || inputType == "add") {
            
            console.log("temphighlighter - claim");

            // draw MP claim        
            var claimSelector = annotation.argues.hasTarget.hasSelector;          
            markObj.mark(claimSelector.exact, markCurrOptions("claim", 0, hldivL));
            
        } else {
            // draw MP data
            if (annotation.argues.supportsBy.length != 0) {
                
                var dataL = annotation.argues.supportsBy;
                var data = dataL[currDataNum];

                if (data.auc.hasTarget != null) {
                    var aucSelector = data.auc.hasTarget.hasSelector;
                    markObj.mark(aucSelector.exact, markCurrOptions("auc",currDataNum, hldivL));
                }

                if (data.cmax.hasTarget != null) {
                    var cmaxSelector = data.cmax.hasTarget.hasSelector;
                    markObj.mark(cmaxSelector.exact, markCurrOptions("cmax",currDataNum, hldivL));
                }

                if (data.clearance.hasTarget != null) {
                    var clearanceSelector = data.clearance.hasTarget.hasSelector;
                    markObj.mark(clearanceSelector.exact, markCurrOptions("clearance",currDataNum, hldivL));
                }

                if (data.halflife.hasTarget != null) {
                    var halflifeSelector = data.halflife.hasTarget.hasSelector;
                    markObj.mark(halflifeSelector.exact, markCurrOptions("halflife",currDataNum, hldivL));
                }
                
                // draw MP Material
                var material = data.supportsBy.supportsBy;

                if (material != null){                    
                    if (material.participants.hasTarget != null) {
                        var partSelector = material.participants.hasTarget.hasSelector;
                        markObj.mark(partSelector.exact, markCurrOptions("participants",currDataNum, hldivL));           
                    }

                    if (material.drug1Dose.hasTarget != null) {
                        var dose1Selector = material.drug1Dose.hasTarget.hasSelector;
                        markObj.mark(dose1Selector.exact, markCurrOptions("drug1Dose",currDataNum, hldivL));           
                    }

                    if (material.drug2Dose.hasTarget != null) {
                        var dose2Selector = material.drug2Dose.hasTarget.hasSelector;
                        markObj.mark(dose2Selector.exact, markCurrOptions("drug2Dose",currDataNum, hldivL));           
                    }                                     
                }                

            }
        }
    } catch (err) {
        console.log(err);
    }

    //deselect browser's highlight
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }

};

// Public: Remove the drawn highlights for the given MP annotation.
// annotation - An annotation Object for which to purge highlights.
// if local highlights is null, find all span by annotaiton id, then replace with child Nodes
// currHighlighter.prototype.undraw = function (annotation) {

//     var hasHighlights = (typeof annotation._local !== 'undefined' && annotation._local !== null && typeof annotation._local.highlights !== 'undefined' && annotation._local.highlights !== null);

//     // when add mp data, annotation._local.highlights is null
//     // find highlights of MP annotation, clean span 
//     if (!hasHighlights) {
//         var localhighlights = $('span[id^="'+annotation.id+'"]');
//         for (i = 0; i < localhighlights.length; i++){
//             var mpSpan = localhighlights[i];
//             if (mpSpan.parentNode !== null)
//                 $(mpSpan).replaceWith(mpSpan.childNodes);
//         }
//     } else {
//         for (var i = 0, len = annotation._local.highlights.length; i < len; i++)
//         {
//             var h = annotation._local.highlights[i];
//             if (h.parentNode !== null) {
//                 $(h).replaceWith(h.childNodes);
//             }
//         }
//         delete annotation._local.highlights;
//     }
// };

// currHighlighter.options = {
//     // The CSS class to apply to drawn mp
//     highlightClass: 'annotator-currhl',
//     // Number of annotations to draw at once
//     chunkSize: 200,
//     // Time (in ms) to pause between drawing chunks of annotations
//     chunkDelay: 1
// };


// // standalone is a module that uses the Highlighter to draw/undraw highlights
// // automatically when annotations are created and removed.
// exports.standalone = function standalone(element, options) {
//     var widget = exports.Highlighter(element, options);

//     return {
//         destroy: function () { widget.destroy(); },
//         annotationCreated: function (ann) { widget.draw(ann); },
//         annotationDeleted: function (ann) { widget.undraw(ann); }
//     };

// };

