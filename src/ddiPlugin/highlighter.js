"use strict";

var Range = require('xpath-range').Range;

var util = require('../util');

var $ = util.$;
var Promise = util.Promise;


// DS for highlight div information and xpath ranges
// range - xpath range
// field - field name for claim or data (ex. auc, cmax, etc)
// dataNum - the index of data for specific claim (begin with 0) 
function DataRange(range, field, dataNum) {
    this.range = range;
    this.field = field;
    this.dataNum = dataNum;
}



// highlightRange wraps the DOM Nodes within the provided range with a highlight
// element of the specified class and returns the highlight Elements.
//
// normedRange - A NormalizedRange to be highlighted.
// cssClass - A CSS class to use for the highlight (default: 'annotator-hl')
// dataRange - DS for range, div field information and data index
// Returns an array of highlight Elements.
function highlightRange(normedRange, cssClass, dataRange) {
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
            var ddihl = global.document.createElement('span');
            ddihl.className = cssClass;
            ddihl.setAttribute("name", "annotator-ddi");
            // add data field and data num for ddi highlights 
            ddihl.setAttribute("fieldName", dataRange.field);
            ddihl.setAttribute("dataNum", dataRange.dataNum);
            node.parentNode.replaceChild(ddihl, node);
            ddihl.appendChild(node);
            results.push(ddihl);
        }
    }
    return results;
}


// reanchorRange will attempt to normalize a range, swallowing Range.RangeErrors
// for those ranges which are not reanchorable in the current document.
function reanchorRange(range, rootElement) {
    try {

        //console.log("reanchorRange");
        return Range.sniff(range).normalize(rootElement);
    } catch (e) {

        if (!(e instanceof Range.RangeError)) {
            // Oh Javascript, why you so crap? This will lose the traceback.
            throw(e);
        }
        // Otherwise, we simply swallow the error. Callers are responsible
        // for only trying to draw valid annotations.
        console.log(e);
    }

    console.log("[ERROR] ddihighlighter - reanchorRange - return null");
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
var ddiHighlighter = exports.ddiHighlighter = function Highlighter(element, options) {
    this.element = element;
    this.options = $.extend(true, {}, Highlighter.options, options);
};

ddiHighlighter.prototype.destroy = function () {
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
// pageNumber - only in PDF, highlight sections which in this pageNumber, avoid duplicates
//
// Returns nothing.
ddiHighlighter.prototype.drawAll = function (annotations, pageNumber) {
    var self = this;

    var p = new Promise(function (resolve) {
        var highlights = [];

        function loader(annList) {
            if (typeof annList === 'undefined' || annList === null) {
                annList = [];
            }
            var now = annList.splice(0, self.options.chunkSize);
            for (var i = 0, len = now.length; i < len; i++) {
                if (now[i].annotationType == "DDI")
                    highlights = highlights.concat(self.draw(now[i], pageNumber));
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
// fieldType - claim or data field name
// dataNum - data index
// hldivL - list for holding span wrapped text nodes
function markOptions(fieldType, dataNum, hldivL) {
    return {
        "element": "span",
        "className": "annotator-hl",
        "separateWordSearch": false,
        "acrossElements": true,
        "accuracy": "partially",
        "caseSensitive": true,
        "exclude": ["table", "tr", "td", "img","script","style","meta","title","button"],
        "each": function(elem) {            
            $(elem).attr('name', "annotator-ddi");
            $(elem).attr('fieldname', fieldType);
            $(elem).attr('datanum', dataNum);     
            $(elem).attr('data-markjs', false);  
            hldivL.push($(elem)[0]);
        }                
    };
}

// Private: Draw single field for mp claim, data or material. Use xpath range to draw first, oa selector as 2nd option. 
// obj - field block with attributes ranges and hasTarget 
// field - name of specific field for claim, data or material (ex auc, cmax, etc)  
// idx - data index (0 if it's claim)
// dataRanges - list of xpath ranges
// hldivL - list of span text nodes
// mode - deprecated: (1) regular: apply mark.js for whole article, (2) dailymed: apply for each section by find p tag with className First 
  
ddiHighlighter.prototype.drawField = function (obj, field, idx, dataRangesL, hldivL, pageNumber) {

    //console.log("ddihighlighter - drawField - called");
    //console.log(obj);

    if (obj.ranges.length > 0) { // draw by xpath range
        for (var i = 0, ilen = obj.ranges.length; i < ilen; i++) {

            // when pdf.js render pdf doc, the page num represents in xpath range in offset (47 - 49)
            if (pageNumber == undefined || obj.ranges[i].start.substring(19, 21).replace("]", "") == pageNumber) {
                var r = reanchorRange(obj.ranges[i], this.element);   
                if (r !== null) { 
                    dataRangesL.push(new DataRange(r, field, idx));                
                } else 
                    console.log("[Error]: draw by xpath failed: " + field);
            }
        }
        
    } else if (obj.hasTarget != null) { // draw by oa selector
        var oaselector = obj.hasTarget.hasSelector;

        var instance = new Mark($("#subcontent")[0]);   
        instance.mark(oaselector.exact, markOptions(field, idx, hldivL)); 
    } else {
        console.log("[Warning]: draw failed on field: " + field);
        console.log(obj);
    }

}


// Public: Draw highlights for the DDI annotation.
// Including: claim, [{data, method, material}, {..}]
// annotation - An annotation Object for which to draw highlights.
//
// Returns an Array of drawn highlight elements.

ddiHighlighter.prototype.draw = function (annotation, pageNumber) {

    var self = this;

    if(annotation.annotationType!=undefined) {
        if (annotation.annotationType != "DDI")
            return null;
    }

    var hldivL = [];
    var dataRangesL = [];

    try {       
        //console.log("ddihighlighter - draw");
        // var mode = "regular";  
        // if (annotation.rawurl.indexOf("/DDI-labels/") > 0) 
        //     mode = "dailymed"; // dailymed labels in 'DDI-labels' directory

        // draw MP claim        
        self.drawField(annotation.argues, "claim", 0, dataRangesL, hldivL, pageNumber);

        // draw MP data
        if (annotation.argues.supportsBy.length != 0){
           
            var dataL = annotation.argues.supportsBy;
            for (var idx = 0; idx < dataL.length; idx++) {
                var data = dataL[idx];

                if (data.auc.ranges != null || data.auc.hasTarget != null) 
                    self.drawField(data.auc, "auc", idx, dataRangesL, hldivL, pageNumber);     
                if (data.cmax.ranges != null || data.cmax.hasTarget != null) 
                    self.drawField(data.cmax, "cmax", idx, dataRangesL, hldivL, pageNumber);                
                if (data.clearance.ranges != null || data.clearance.hasTarget != null)
                    self.drawField(data.clearance, "clearance", idx, dataRangesL, hldivL, pageNumber);                
                if (data.halflife.ranges != null || data.halflife.hasTarget !=null) 
                    self.drawField(data.halflife, "halflife", idx, dataRangesL, hldivL, pageNumber);                                
                if (data.cellSystem != null && (data.cellSystem.ranges != null || data.cellSystem.hasTarget !=null)) 
                    self.drawField(data.cellSystem, "cellSystem", idx, dataRangesL, hldivL, pageNumber);
                if (data.metaboliteRateWith != null && (data.metaboliteRateWith.ranges != null || data.metaboliteRateWith.hasTarget !=null)) 
                    self.drawField(data.metaboliteRateWith, "metaboliteRateWith", idx, dataRangesL, hldivL, pageNumber);
                if (data.metaboliteRateWithout != null && (data.metaboliteRateWithout.ranges != null || data.metaboliteRateWithout.hasTarget !=null)) 
                    self.drawField(data.metaboliteRateWithout, "metaboliteRateWithout", idx, dataRangesL, hldivL, pageNumber);
                if (data.measurement != null) {
                    var mTypes = ["cl", "vmax", "km", "ki", "inhibition", "kinact", "ic50"];
                    for (var i = 0; i < mTypes.length; i++) {
                        var mType = mTypes[i];
                        if (data.measurement[mType] != null && (data.measurement[mType].ranges != null || data.measurement[mType].hasTarget !=null)) 
                            self.drawField(data.measurement[mType], mType, idx, dataRangesL, hldivL, pageNumber);
                    }
                }

                // draw MP Material
                var material = data.supportsBy.supportsBy;

                if (material != null){                    

                    if (material.participants.ranges != null || material.participants.hasTarget != null)
                        self.drawField(material.participants, "participants", idx, dataRangesL, hldivL, pageNumber);                    
                    if (material.drug1Dose.ranges != null || material.drug1Dose.hasTarget != null) 
                        self.drawField(material.drug1Dose, "dose1", idx, dataRangesL, hldivL, pageNumber);                    
                    if (material.drug2Dose.ranges != null || material.drug2Dose.hasTarget != null) 
                        self.drawField(material.drug2Dose, "dose2", idx, dataRangesL, hldivL, pageNumber);                    
                    if (material.phenotype.ranges != null || material.phenotype.hasTarget != null) 
                        self.drawField(material.phenotype, "phenotype", idx, dataRangesL, hldivL, pageNumber);                    
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

    // add span divs from oaselector to annotation._local
    $.merge(annotation._local.highlights, hldivL);    

    // add span divs from xpath to annotation._local
    for (var j = 0, jlen = dataRangesL.length; j < jlen; j++) {
        var dataNormed = dataRangesL[j];
        $.merge(
            annotation._local.highlights,
            highlightRange(dataNormed.range, this.options.highlightClass, dataNormed));
    }
    
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
ddiHighlighter.prototype.undraw = function (annotation) {
    console.log("ddihighlighter - undraw");

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
ddiHighlighter.prototype.redraw = function (annotation) {
    if (annotation.annotationType == "DDI"){
    this.undraw(annotation);
    return this.draw(annotation);
    }
};

ddiHighlighter.options = {
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

