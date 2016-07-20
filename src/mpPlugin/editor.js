"use strict";
var Widget = require('./../ui/widget').Widget;
var util = require('../util');
var Template = require('./template').Template;
var $ = util.$;
var Range = require('xpath-range').Range;

var _t = util.gettext;
var Promise = util.Promise;
var NS = "annotator-editor";

// bring storage in
var HttpStorage = require('../storage').HttpStorage;
// storage query options 
var queryOptStr = '{"emulateHTTP":false,"emulateJSON":false,"headers":{},"prefix":"http://' + config.annotator.host + '/annotatorstore","urls":{"create":"/annotations","update":"/annotations/{id}","destroy":"/annotations/{id}","search":"/search"}}';

// id returns an identifier unique within this session
var id = (function () {
    var counter;
    counter = -1;
    return function () {
        return counter += 1;
    };
}());



// preventEventDefault prevents an event's default, but handles the condition
// that the event is null or doesn't have a preventDefault function.
function preventEventDefault(event) {
    if (typeof event !== 'undefined' &&
        event !== null &&
        typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
}


// Public: Creates an element for editing annotations.
//var mpEditor = exports.mpEditor = Editor.extend({
var mpEditor = exports.mpEditor = Widget.extend({

    constructor: function (options) {
        Widget.call(this, options);
        var editorSelf = this;
        this.fields = [];
        this.annotation = {};
        console.log("[INFO] mpeditor - constructor");

        if (this.options.defaultFields) {

            this.addField({
                // type: 'div',
                // label: _t('Comments') + '\u2026',
                // id: 'quote',
                load: function (field, annotation, annotations) {               
                    
                    var claim = annotation.argues;

                    // load MP Claim
                    if(currFormType == "claim"){
                        console.log("mpeditor - load - claim");
                        
                        // clean claim editor
                        $("#quote").empty();
                        $("#method")[0].selectedIndex = 0;
                        $("#relationship")[0].selectedIndex = 0;

                        $("#enzyme")[0].selectedIndex = 0;
                        $("#enzyme").hide();
                        $("#enzymesection1").hide();

                        $('input[type=radio][name=precipitant]').show();
                        $('.precipitantLabel').show();
                        $('input[name=precipitant][id=drug1precipitant]').prop('checked', false);
                        $('input[name=precipitant][id=drug2precipitant]').prop('checked', false);

                        $('#Drug1 option').remove();
                        $('#Drug2 option').remove();

                        var nodes = [];
                        nodes = annotation.childNodes;
                        console.log(nodes);

                        //--------------generate quote-----------------
                        $('#quote').empty();

                        var quoteobject = $("<div id='quotearea'/>");
                        var p = document.createElement("p");

                        //generate quote: add new annotation
                        if(annotation.id==undefined) {
                            var childrenInQuote = nodes;
                            var goodChild;
                            var prevNode = null;
                            for (var qi = 0; qi < childrenInQuote.length; qi++) {
                                var tempContent = $(childrenInQuote[qi]).text();
                                while(childrenInQuote[qi].parentNode.className=="annotator-hl"||
                                childrenInQuote[qi].parentNode.className=="annotator-currhl") {
                                    childrenInQuote[qi]= childrenInQuote[qi].parentNode;
                                }
                                if(!childrenInQuote[qi].isEqualNode(prevNode)) {
                                    prevNode = childrenInQuote[qi];
                                    goodChild = prevNode.cloneNode(true);
                                    goodChild.innerHTML = tempContent;
                                    p.appendChild(goodChild);
                                }
                            }
                            console.log(p);
                            //generate quote: edit an existed annotation
                        } else {
                            var tempChildrenOfClaim = [];
                            var prevNode = null;
                            tempChildrenOfClaim = $(".annotator-currhl"); //used to store childrens in claim
                            var childrenOfClaim = [];
                            for(var i=0;i<tempChildrenOfClaim.length;i++) {
                                var tempContent = $(tempChildrenOfClaim[i]).text();
                                while(tempChildrenOfClaim[i].parentNode.className== "annotator-hl") {
                                    tempChildrenOfClaim[i]= tempChildrenOfClaim[i].parentNode;
                                }
                                if(!tempChildrenOfClaim[i].isEqualNode(prevNode)) {
                                    var goodChild = tempChildrenOfClaim[i].cloneNode(true);
                                    goodChild.innerHTML = tempContent;
                                    p.appendChild(goodChild);
                                }
                            }
                        }

                        $(quoteobject).append(p);
                        var quotecontent = $(quoteobject).html();
                        console.log(quotecontent);

                        while(quotecontent.indexOf("annotator-currhl")!=-1) {
                            quotecontent = quotecontent.split("annotator-currhl").join("");
                            console.log(quotecontent);
                        }
                        while(quotecontent.indexOf("annotator-mp")!=-1) {
                            quotecontent = quotecontent.split("class=\"annotator-hl\" name=\"annotator-mp\"").join("");
                            quotecontent = quotecontent.split("name=\"annotator-mp\" class=\"annotator-hl\"").join("");
                            console.log(quotecontent);
                        }

                        while(quotecontent.indexOf(" name=\"annotator-hl\"")!=-1) {
                            quotecontent = quotecontent.split(" name=\"annotator-hl\"").join("");
                            console.log(quotecontent);
                        }
                        console.log(quotecontent);
                        $(quoteobject).html(quotecontent);
                        $('#quote').append(quoteobject);

                        //find drugs which only be highlighted in this claim
                        //--------------- generate list and listid array ----------------
                        var list = [];//used to store drugs
                        var listid = [];
                        var drugList = document.getElementsByName('annotator-hl');



                        var selectedNodes = [];
                        //console.log(nodes);
                        var selectedList = [];
                        var prev = "";
                        var prevNode = null;
                        var parent;
                        var childID = 0;

                        if(annotation.id==undefined) {
                             //store node whose classname is "annotator-hl"
                            for(var i=0;i<nodes.length;i++) {
                                //filter annotator-mp
                                var currnode = nodes[i];
                                while(nodes[i].parentNode.className=="annotator-hl"||
                                nodes[i].parentNode.className=="annotator-currhl") {
                                    nodes[i]= nodes[i].parentNode;
                                }
                                if($(nodes[i]).attr("name") == "annotator-hl") {
                                    selectedList.push(nodes[i].cloneNode(true));
                                    selectedNodes.push(currnode);
                                }
                            }

                            //console.log(selectedList);

                            for(var i=0;i<selectedList.length;i++) {
                                if(prev != selectedList[i].id) {
                                    prev = selectedList[i].id;
                                    prevNode = selectedList[i];
                                    parent = selectedList[i];

                                    childID = 0;
                                    while (parent.childNodes.length > 0)
                                        parent = parent.childNodes[0];
                                    list.push(parent.textContent);
                                    listid.push(selectedList[i].id);
                                }else {
                                    //console.log(selectedList[i].isEqualNode(prevNode));
                                    if(!selectedList[i].isEqualNode(prevNode)) {
                                        parent = selectedList[i];
                                        while (parent.childNodes.length > 0)
                                            parent = parent.childNodes[0];
                                        var temp = list.pop();
                                        temp += parent.textContent;
                                        list.push(temp);
                                    }else {
                                        var temp = list.pop();
                                        temp += selectedNodes[i].textContent;
                                        list.push(temp);
                                    }
                                }
                            }

                        }else{
                            selectedList = $('.annotator-currhl');
                            var drugNodes = [];
                            for(var i=0;i<selectedList.length;i++) {
                                //filter annotator-mp
                                while(selectedList[i].parentNode.className=="annotator-hl"||
                                selectedList[i].parentNode.className=="annotator-currhl") {
                                    selectedList[i]= selectedList[i].parentNode;
                                }
                                if($(selectedList[i]).attr("name") == "annotator-hl") {
                                    drugNodes.push(selectedList[i].cloneNode(true));
                                }
                            }
                            //console.log(drugNodes);
                            for(var i=0;i<drugNodes.length;i++) {
                                if(prev != drugNodes[i].id) {
                                    prev = drugNodes[i].id;
                                    prevNode = drugNodes[i];
                                    parent = drugNodes[i];

                                    childID = 0;
                                    while (parent.childNodes.length > 0)
                                        parent = parent.childNodes[0];
                                    list.push(parent.textContent);
                                    listid.push(drugNodes[i].id);
                                }else {
                                    //console.log(drugNodes[i].isEqualNode(prevNode));
                                    if(!drugNodes[i].isEqualNode(prevNode)) {
                                        parent = drugNodes[i];
                                        while (parent.childNodes.length > 0)
                                            parent = parent.childNodes[0];
                                        var temp = list.pop();
                                        temp += parent.textContent;
                                        list.push(temp);
                                    }else {
                                        var temp = list.pop();
                                        temp += drugNodes[i].textContent;
                                        list.push(drugNodes[i].textContent);
                                    }
                                }
                            }
                        }
                        //console.log("[mpPlugin/editor.js--drugList]");
                        //console.log(list);
                        //console.log(listid);





                        var flag = 0;                        


                        //var quoteobject = $('#quotearea');
                        //var quotecontent = $('#quotearea').html();

                        //check drug list
                        var allHighlightedDrug = [];
                        var anns = annotations.slice();
                        for (var i = 0, len = anns.length; i < len; i++) {
                            if (anns[i].annotationType == "DrugMention") {
                                allHighlightedDrug.push(anns[i].argues.hasTarget.hasSelector.exact);
                            }
                        }
                        for(var i=0;i<list.length;i++) {
                            if(allHighlightedDrug.indexOf(list[i].trim())==-1) {
                                list.splice(i, 1);
                                listid.splice(i,1);
                            }
                        }
                        //console.log(allHighlightedDrug);
                        //console.log(list);


                        var index = 0;
                        for (var i = 0, len = list.length; i < len; i++) {
                            // avoid replacing span itself
                            // add to dropdown box
                            $('#Drug1').append($('<option>', {
                                value: listid[i],
                                text: list[i]
                            }));
                            $('#Drug2').append($('<option>', {
                                value: listid[i],
                                text: list[i]
                            }));
                            flag = flag + 1;

                            /*if (quotecontent.indexOf(list[i]) >= 0 && "<span class=\"highlightdrug\">".indexOf(list[i]) < 0) {
                                index++;
                                quotecontent = quotecontent.replace(list[i], "<span class=\"highlightdrug\">" + list[i] + "</span>");
                            }*/
                        }

                        
                        if (flag < 2) {
                            alert("please highlight two different drugs in the text span you selected!");
                            editorSelf.cancel();
                            $('.btn-success').click();
                        }

                        // load method
                        if (claim.method != null) {
                            $("#method > option").each(function () {
                                if (this.value === claim.method) $(this).prop('selected', true);
                            });
                        }

                        if(claim.qualifiedBy!=undefined) {
                            //load fields from annotation.claim
                            $("#Drug1 > option").each(function () {
                                if (this.value === claim.qualifiedBy.drug1ID) $(this).prop('selected', true);
                            });
                            $('#Drug2 > option').each(function () {
                                if (this.value === claim.qualifiedBy.drug2ID) $(this).prop('selected', true);
                            });
                        }

                        var drug1 = $('#Drug1 option:selected').text();
                        var drug2 = $('#Drug2 option:selected').text();
                        var drug1ID = $('#Drug1 option:selected').val();
                        var drug2ID = $('#Drug2 option:selected').val();
                        console.log("id=\""+drug2ID+"\" class=\"annotator-hl\" name=\"annotator-hl\"");
                        quotecontent = quotecontent.split("class=\"annotator-hl\" id=\""+drug1ID+"\"").join("class=\"highlightdrug\" id=\""+drug1ID+"\"");
                        quotecontent = quotecontent.split("class=\"annotator-hl\" id=\""+drug2ID+"\"").join("class=\"highlightdrug\" id=\""+drug2ID+"\"");
                        quotecontent = quotecontent.split("id=\""+drug1ID+"\" class=\"annotator-hl\"").join("class=\"highlightdrug\" id=\""+drug1ID+"\"");
                        quotecontent = quotecontent.split("id=\""+drug2ID+"\" class=\"annotator-hl\"").join("class=\"highlightdrug\" id=\""+drug2ID+"\"");
                        //console.log(quotecontent);
                        $(quoteobject).html(quotecontent);
                        $('#quote').append(quoteobject);

                        // highlight drug selections on text quote
                        //console.log(claim.qualifiedBy);
                        if (claim.qualifiedBy != null) {
                            /*if (claim.qualifiedBy.drug1ID != "") {
                                var quotestring = quoteobject.html();
                                quotestring = quotestring.replace("class=\"annotator-hl\" name=\"annotator-hl\" id=\""+claim.qualifiedBy.drug1ID+"\"", "class=\"highlightdrug\" id=\""+claim.qualifiedBy.drug1ID+"\"");
                                quoteobject.html(quotestring);
                                //console.log(quotestring);
                            }
                            if (claim.qualifiedBy.drug2ID != "") {
                                var quotestring = quoteobject.html();
                                quotestring = quotestring.replace("class=\"annotator-hl\" name=\"annotator-hl\" id=\""+claim.qualifiedBy.drug2ID+"\"", "class=\"highlightdrug\" id=\""+claim.qualifiedBy.drug2ID+"\"");
                                quoteobject.html(quotestring);
                                //console.log(quotestring);
                            }
                            */
                            //$(field).find('#quote').css('background', '#d1d1d1');

                            $('#relationship > option').each(function () {
                                if (this.value == claim.qualifiedBy.relationship) {
                                    $(this).prop('selected', true);
                                }
                                else {
                                    $(this).prop('selected', false);
                                }
                            });
                            // show enzyme if relationship is inhibits/substrate of
                            // show precipitant if relationship is interact with 
                            if(claim.qualifiedBy.relationship == "inhibits" || claim.qualifiedBy.relationship == "substrate of")
                            {
                                $("#enzyme").show();
                                $("#enzymesection1").show();

                                $('#enzyme option').each(function () {
                                    if (this.value == claim.qualifiedBy.enzyme) {
                                        $(this).prop('selected', true);            
                                    } else {
                                        $(this).prop('selected', false);
                                    }
                                });

                                $('input[type=radio][name=precipitant]').hide();
                                $('.precipitantLabel').hide();
                                
                            } else if (claim.qualifiedBy.relationship == "interact with") {                                     
                                $('input[type=radio][name=precipitant]').show();
                                $('.precipitantLabel').show();
                                if (claim.qualifiedBy.precipitant == "drug1")
                                    $('input[name=precipitant][id=drug1precipitant]').prop('checked', true);
                                else if (claim.qualifiedBy.precipitant == "drug2")
                                    $('input[name=precipitant][id=drug2precipitant]').prop('checked', true);      
                                else 
                                    console.log("precipitant information not avaliable");
                            }                      
                        }
                        
                    } else { // if editing data, then update claim label and drug names to data fields nav
                        var drug1doseLabel = claim.qualifiedBy.drug1 + " Dose in MG: ";
                        var drug2doseLabel = claim.qualifiedBy.drug2 + " Dose in MG: ";

                        if (claim.qualifiedBy.relationship == "interact with") {
                            if (claim.qualifiedBy.precipitant == "drug1")
                                drug1doseLabel += " (precipitant)";                                
                            else if (claim.qualifiedBy.precipitant == "drug2")
                                drug2doseLabel += " (precipitant)";                                
                            }
                        
                        $("#drug1-dose-switch-btn").html(drug1doseLabel);
                        $("#drug2-dose-switch-btn").html(drug2doseLabel);
                        $("#drug1Dose-label").html(drug1doseLabel);
                        $("#drug2Dose-label").html(drug2doseLabel);
                        $("#claim-label-data-editor").html("<strong>Claim: </strong>" + claim.label.replace(/\_/g,' '));

                    }

                    // load MP list of data 
                    if (annotation.argues.supportsBy.length > 0 && currDataNum !== "") {                   
                        console.log("mpeditor - load data - num: " + currDataNum);   
                        var loadData = annotation.argues.supportsBy[currDataNum];

                        // clean material : participants, dose1, dose2
                        $("#participants").empty();
                        $("#drug1Dose").empty();
                        $("#drug1Duration").empty();
                        $("#drug1Formulation")[0].selectedIndex = -1;
                        $("#drug1Regimens")[0].selectedIndex = -1;
                        $("#drug2Dose").empty();
                        $("#drug2Duration").empty();
                        $("#drug2Formulation")[0].selectedIndex = -1;
                        $("#drug2Regimens")[0].selectedIndex = -1;   

                        // clean data : auc, cmax, cl, half life
                        $("#auc").empty();
                        $("#aucType")[0].selectedIndex = -1;
                        $("#aucDirection")[0].selectedIndex = -1;
                        $('#auc-unchanged-checkbox').attr('checked',false);

                        $("#cmax").empty();
                        $("#cmaxType")[0].selectedIndex = -1;
                        $("#cmaxDirection")[0].selectedIndex = -1;
                        $('#cmax-unchanged-checkbox').attr('checked',false);

                        $("#clearance").empty();
                        $("#clearanceType")[0].selectedIndex = -1;
                        $("#clearanceDirection")[0].selectedIndex = -1;
                        $('#clearance-unchanged-checkbox').attr('checked',false);

                        $("#halflife").empty();
                        $("#halflifeType")[0].selectedIndex = -1;
                        $("#halflifeDirection")[0].selectedIndex = -1;
                        $('#halflife-unchanged-checkbox').attr('checked',false);

                        // clean evidence relationship
                        $('input[name=evRelationship]').prop('checked', false);


                        // load mp material field  
                        $("#participants").val(loadData.supportsBy.supportsBy.participants.value);  
                        if (loadData.supportsBy.supportsBy.participants.hasTarget != null) {
                            $('#participantsquote').html(loadData.supportsBy.supportsBy.participants.hasTarget.hasSelector.exact || '');
                        } 
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#participantsquote').html(cachedOATarget.hasSelector.exact || '');          
                            else 
                                $('#participantsquote').html('');         
                        }

                        $("#drug1Dose").val(loadData.supportsBy.supportsBy.drug1Dose.value);
                        $("#drug1Duration").val(loadData.supportsBy.supportsBy.drug1Dose.duration);
                        $("#drug1Formulation > option").each(function () {
                            if (this.value === loadData.supportsBy.supportsBy.drug1Dose.formulation) {
                                $(this).prop('selected', true);                                                  }
                        });
                        $("#drug1Regimens > option").each(function () {
                            if (this.value === loadData.supportsBy.supportsBy.drug1Dose.regimens) {
                                $(this).prop('selected', true);                                                  }
                        });
                        if (loadData.supportsBy.supportsBy.drug1Dose.hasTarget != null) {
                            $('#dose1quote').html(loadData.supportsBy.supportsBy.drug1Dose.hasTarget.hasSelector.exact || '');       
                        } 
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#dose1quote').html(cachedOATarget.hasSelector.exact || '');       
                            else
                                $('#dose1quote').html('');
                        }

                        
                        $("#drug2Dose").val(loadData.supportsBy.supportsBy.drug2Dose.value);
                        $("#drug2Duration").val(loadData.supportsBy.supportsBy.drug2Dose.duration);
                        $("#drug2Formulation > option").each(function () {
                            if (this.value === loadData.supportsBy.supportsBy.drug2Dose.formulation) {
                                $(this).prop('selected', true);                                                  }
                        });
                        $("#drug2Regimens > option").each(function () {
                            if (this.value === loadData.supportsBy.supportsBy.drug2Dose.regimens) {
                                $(this).prop('selected', true);                                                  }
                        });
                        if (loadData.supportsBy.supportsBy.drug2Dose.hasTarget != null) {
                            $('#dose2quote').html(loadData.supportsBy.supportsBy.drug2Dose.hasTarget.hasSelector.exact || '');     
                        } 
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#dose2quote').html(cachedOATarget.hasSelector.exact || '');       
                            else 
                                $('#dose2quote').html('');                      
                        }  

                        // load mp data fields

                        // evidence relationship
                        if (loadData.evRelationship == "refutes")
                            $('input[name=evRelationship][value=refutes]').prop('checked', true);               
                        else if (loadData.evRelationship == "supports")
                            $('input[name=evRelationship][value=supports]').prop('checked', true);                


                        // AUC: if unchanged then mark on checkbox, else load auc
                        if (loadData.auc.value == "unchanged") {
                            $('#auc-unchanged-checkbox').prop("checked", true);
                        } else {
                            $("#auc").val(loadData.auc.value);
                            $("#aucType > option").each(function () {
                                if (this.value === loadData.auc.type) {
                                    $(this).prop('selected', true);                                                  }
                            });
                            $("#aucDirection > option").each(function () {
                                if (this.value === loadData.auc.direction) {
                                    $(this).prop('selected', true);                                                  }
                            });
                        }
                        if (loadData.auc.hasTarget != null) {
                            $('#aucquote').html(loadData.auc.hasTarget.hasSelector.exact || ''); 
                        } 
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#aucquote').html(cachedOATarget.hasSelector.exact || '');       
                            else 
                                $('#aucquote').html('');                             
                        }      


                        // CMAX: if unchanged then mark on checkbox, else load cmax
                        if (loadData.cmax.value == "unchanged") {
                            $('#cmax-unchanged-checkbox').prop("checked", true);
                        } else {
                            $("#cmax").val(loadData.cmax.value);
                            $("#cmaxType > option").each(function () {
                                if (this.value === loadData.cmax.type) {
                                    $(this).prop('selected', true);                                                  }
                            });
                            $("#cmaxDirection > option").each(function () {
                                if (this.value === loadData.cmax.direction) {
                                    $(this).prop('selected', true);                                                  }
                            });
                        }
                        if (loadData.cmax.hasTarget != null) {
                            $('#cmaxquote').html(loadData.cmax.hasTarget.hasSelector.exact || ''); 
                        } 
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#cmaxquote').html(cachedOATarget.hasSelector.exact || '');       
                            else 
                                $('#cmaxquote').html('');                        
                        }      

                        // CLEARANCE: if unchanged then mark on checkbox, else load clearance
                        if (loadData.clearance.value == "unchanged") {
                            $('#clearance-unchanged-checkbox').prop("checked", true);
                        } else {
                            $("#clearance").val(loadData.clearance.value);
                            $("#clearanceType > option").each(function () {
                                if (this.value === loadData.clearance.type) {
                                    $(this).prop('selected', true);                                                  }
                            });
                            $("#clearanceDirection > option").each(function () {
                                if (this.value === loadData.clearance.direction) {
                                    $(this).prop('selected', true);                                                  }
                            });
                        }
                        if (loadData.clearance.hasTarget != null) {
                            $('#clearancequote').html(loadData.clearance.hasTarget.hasSelector.exact || ''); 
                        }
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#clearancequote').html(cachedOATarget.hasSelector.exact || '');       
                            else
                                $('#clearancequote').html('');            
                        }      

                        // HALFLIFE: if unchanged then mark on checkbox, else load halflife
                        if (loadData.halflife.value == "unchanged") {
                            $('#halflife-unchanged-checkbox').prop("checked", true);
                        } else {
                            $("#halflife").val(loadData.halflife.value);
                            $("#halflifeType > option").each(function () {
                                if (this.value === loadData.halflife.type) {
                                    $(this).prop('selected', true);                                                  }
                            });
                            $("#halflifeDirection > option").each(function () {
                                if (this.value === loadData.halflife.direction) {
                                    $(this).prop('selected', true);                                                  }
                            });
                        }
                        if (loadData.halflife.hasTarget != null) {
                            $('#halflifequote').html(loadData.halflife.hasTarget.hasSelector.exact || ''); 
                        }
                        else {
                            if (cachedOATarget.hasSelector != null)
                                $('#halflifequote').html(cachedOATarget.hasSelector.exact || '');       
                            else
                                $('#halflifequote').html('');              
                        }      

                    }                     
                },
                
                submit:function (field, annotation) {

                    if (currFormType == "claim"){

                        // MP Claim
                        if($('#Drug1 option:selected').text()==$('#Drug2 option:selected').text()){
                            alert("Should highlight two different drugs.");
                            editorSelf.cancel();
                            $('.btn-success').click();
                        }
                        
                        annotation.annotationType = "MP";

                        // MP method - keep with claim
                        annotation.argues.method = $('#method option:selected').text();                        
                        // MP argues claim, claim qualified by ?s ?p ?o
                        if (annotation.argues.qualifiedBy != null)
                            var qualifiedBy = annotation.argues.qualifiedBy;
                        else
                            var qualifiedBy = {drug1 : "", drug2 : "", relationship : "", enzyme : "", precipitant : ""};                    

                        qualifiedBy.drug1 = $('#Drug1 option:selected').text();
                        qualifiedBy.drug2 = $('#Drug2 option:selected').text();
                        qualifiedBy.drug1ID = $('#Drug1 option:selected').val();
                        qualifiedBy.drug2ID = $('#Drug2 option:selected').val();
                        qualifiedBy.relationship = $('#relationship option:selected').text();
                        var claimStatement = qualifiedBy.drug1 + "_" + qualifiedBy.relationship + "_" + qualifiedBy.drug2;
                        
                        if(qualifiedBy.relationship == "inhibits" || qualifiedBy.relationship == "substrate of") {
                            qualifiedBy.enzyme = $('#enzyme option:selected').text();
                        }  else if (qualifiedBy.relationship == "interact with") {                           
                            qualifiedBy.precipitant = $("input[name=precipitant]:checked").val();
                        }

                        annotation.argues.qualifiedBy = qualifiedBy;
                        annotation.argues.type = "mp:claim";
                        annotation.argues.label = claimStatement;
                        
                        if (annotation.argues.supportsBy == null)
                            annotation.argues.supportsBy = [];                  

                    } else if (currFormType != "claim" && currAnnotationId != null && annotation.argues.supportsBy.length > 0) { 

                        // console.log("mpeditor update data & material - num: " + currDataNum);
                        var mpData = annotation.argues.supportsBy[currDataNum];
                        // Evidence relationship
                        mpData.evRelationship = $("input[name=evRelationship]:checked").val();

                        // MP add data-method-material 
                        var partTmp = mpData.supportsBy.supportsBy.participants;
                        if ($('#participants').val().trim() != "" &&  partTmp.value != $('#participants').val()) {                            
                            partTmp.value = $('#participants').val();

                            // if field not binded with text, then assign current span to it
                            if (partTmp.ranges == null && partTmp.hasTarget == null  && cachedOATarget != null && cachedOARanges != null) {
                                partTmp.ranges = cachedOARanges;           
                                partTmp.hasTarget = cachedOATarget;    
                            }
                            mpData.supportsBy.supportsBy.participants = partTmp;
                        }

                        var dose1Tmp = mpData.supportsBy.supportsBy.drug1Dose;
                        var drug1V = $('#drug1Dose').val();
                        var drug1F = $('#drug1Formulation option:selected').text();
                        var drug1D = $('#drug1Duration').val();
                        var drug1R = $('#drug1Regimens option:selected').text();
                        if ((drug1V != "") && (drug1D != "") && (drug1F != "") && (drug1R != "")) {
                                     
                            dose1Tmp.value = drug1V;
                            dose1Tmp.formulation = drug1F;
                            dose1Tmp.duration = drug1D;
                            dose1Tmp.regimens = drug1R;
                            if (dose1Tmp.ranges == null && dose1Tmp.hasTarget == null) {
                                dose1Tmp.hasTarget = cachedOATarget;
                                dose1Tmp.ranges = cachedOARanges;
                            }
                            mpData.supportsBy.supportsBy.drug1Dose = dose1Tmp;   
                        }

                        var dose2Tmp = mpData.supportsBy.supportsBy.drug2Dose;
                        var drug2V = $('#drug2Dose').val();
                        var drug2F = $('#drug2Formulation option:selected').text();
                        var drug2D = $('#drug2Duration').val();
                        var drug2R = $('#drug2Regimens option:selected').text();
                        if ((drug2V != "") && (drug2D != "") && (drug2F != "") && (drug2R != "")) {
                                     
                            dose2Tmp.value = drug2V;
                            dose2Tmp.formulation = drug2F;
                            dose2Tmp.duration = drug2D;
                            dose2Tmp.regimens = drug2R;
                            if (dose2Tmp.ranges == null && dose2Tmp.hasTarget == null) {
                                dose2Tmp.hasTarget = cachedOATarget;
                                dose2Tmp.ranges = cachedOARanges;
                            }
                            mpData.supportsBy.supportsBy.drug2Dose = dose2Tmp;   
                        }


                        var aucUnchanged = $('#auc-unchanged-checkbox').is(':checked');
                        var aucValue = $('#auc').val().trim();
                        var aucType = $('#aucType option:selected').text();
                        var aucDirection = $('#aucDirection option:selected').text();

                        if (aucUnchanged || (aucValue != "" && aucType != "" && aucDirection != "")) {
                            if (aucUnchanged) {
                                mpData.auc.value = "unchanged";            
                                mpData.auc.type = "";
                                mpData.auc.direction = "";      
                            }
                            else {
                                mpData.auc.value = aucValue;
                                mpData.auc.type = aucType;
                                mpData.auc.direction = aucDirection;      
                            }
                            if (mpData.auc.ranges == null && mpData.auc.hasTarget == null) {
                                mpData.auc.hasTarget = cachedOATarget;
                                mpData.auc.ranges = cachedOARanges;
                            }                            
                        } else {
                            console.log("[WARNING] auc required fields not filled!");
                        }                        

                        var cmaxUnchanged = $('#cmax-unchanged-checkbox').is(':checked');
                        var cmaxValue = $('#cmax').val().trim();
                        var cmaxType = $('#cmaxType option:selected').text();
                        var cmaxDirection = $('#cmaxDirection option:selected').text();

                        if (cmaxUnchanged || (cmaxValue != "" && cmaxType != "" && cmaxDirection != "")) {
                            if (cmaxUnchanged) {
                                mpData.cmax.value = "unchanged";            
                                mpData.cmax.type = "";
                                mpData.cmax.direction = "";      
                            }
                            else {
                                mpData.cmax.value = cmaxValue;
                                mpData.cmax.type = cmaxType;
                                mpData.cmax.direction = cmaxDirection;      
                            }
                            if (mpData.cmax.ranges == null && mpData.cmax.hasTarget == null) {
                                mpData.cmax.hasTarget = cachedOATarget;
                                mpData.cmax.ranges = cachedOARanges;
                            }                            
                        } else {
                            console.log("[WARNING] cmax required fields not filled!");
                        }                


                        var clearanceUnchanged = $('#clearance-unchanged-checkbox').is(':checked');
                        var clearanceValue = $('#clearance').val().trim();
                        var clearanceType = $('#clearanceType option:selected').text();
                        var clearanceDirection = $('#clearanceDirection option:selected').text();

                        if (clearanceUnchanged || (clearanceValue != "" && clearanceType != "" && clearanceDirection != "")) {
                            if (clearanceUnchanged) {
                                mpData.clearance.value = "unchanged";            
                                mpData.clearance.type = "";
                                mpData.clearance.direction = "";      
                            }
                            else {
                                mpData.clearance.value = clearanceValue;
                                mpData.clearance.type = clearanceType;
                                mpData.clearance.direction = clearanceDirection;      
                            }
                            if (mpData.clearance.ranges == null && mpData.clearance.hasTarget == null) {
                                mpData.clearance.hasTarget = cachedOATarget;
                                mpData.clearance.ranges = cachedOARanges;
                            }                            
                        } else {
                            console.log("[WARNING] clearance required fields not filled!");
                        }                


                        var halflifeUnchanged = $('#halflife-unchanged-checkbox').is(':checked');
                        var halflifeValue = $('#halflife').val().trim();
                        var halflifeType = $('#halflifeType option:selected').text();
                        var halflifeDirection = $('#halflifeDirection option:selected').text();

                        if (halflifeUnchanged || (halflifeValue != "" && halflifeType != "" && halflifeDirection != "")) {
                            if (halflifeUnchanged) {
                                mpData.halflife.value = "unchanged";            
                                mpData.halflife.type = "";
                                mpData.halflife.direction = "";      
                            }
                            else {
                                mpData.halflife.value = halflifeValue;
                                mpData.halflife.type = halflifeType;
                                mpData.halflife.direction = halflifeDirection;      
                            }
                            if (mpData.halflife.ranges == null && mpData.halflife.hasTarget == null) {
                                mpData.halflife.hasTarget = cachedOATarget;
                                mpData.halflife.ranges = cachedOARanges;
                            }                            
                        } else {
                            console.log("[WARNING] halflife required fields not filled!");
                        }                

                        annotation.argues.supportsBy[currDataNum] = mpData;
                    }
                    // clean editor status
                    currFormType = "";
                }                
            });            
        }
        
        var self = this;
        
        this.element
            .on("submit." + NS, 'form', function (e) {
                self._onFormSubmit(e);
            })
            .on("click." + NS, '.annotator-save', function (e) {
                self._onSaveClick(e);
            })
            .on("click." + NS, '.annotator-save-close', function (e) {
                self._onSaveCloseClick(e);
                self.hide();
            })
            .on("click." + NS, '.annotator-delete', function (e) {
                self._onDeleteClick(e);
            })
            .on("click." + NS, '.annotator-cancel', function (e) {
                self._onCancelClick(e);
            })
            .on("mouseover." + NS, '.annotator-cancel', function (e) {
                self._onCancelMouseover(e);
            })
            .on("keydown." + NS, 'textarea', function (e) {
                self._onTextareaKeydown(e);
            });
    },



    destroy: function () {
        this.element.off("." + NS);
        Widget.prototype.destroy.call(this);
    },

    // Public: Show the editor.
    //
    // position - An Object specifying the position in which to show the editor
    //            (optional).
    //
    // Examples
    //
    //   editor.show()
    //   editor.hide()
    //   editor.show({top: '100px', left: '80px'})
    //
    // Returns nothing.
    show: function (position) {

        //if (typeof position !== 'undefined' && position !== null) {
        if (typeof position !== 'undefined') {
            this.element.css({
                //top: position.top,
                //left: position.left
                bottom:50,
                right:100
            });

            $( window ).resize(function() {
                $( "body" ).css('height','600px');
            });

            //console.log(window.screen.height);
            //console.log(window.screen.availHeight);
        }

        this.element
            .find('.annotator-save')
            .addClass(this.classes.focus);

        Widget.prototype.show.call(this);

        // give main textarea focus
        this.element.find(":input:first").focus();

        this._setupDraggables();
    },

    // Public: Load an annotation into the editor and display it.
    //
    // annotation - An annotation Object to display for editing.
    // position - An Object specifying the position in which to show the editor
    //            (optional).
    //
    // Returns a Promise that is resolved when the editor is submitted, or
    // rejected if editing is cancelled.
    load: function (position, annotation) {
        this.annotation = annotation;

        var claim = annotation.argues;        

        if(claim.hasTarget.hasSelector.exact.length>1600){
            alert("[INFO] Exceeding max lengh of text 1600!");
            $('.btn-success').click();
            this.cancel();
        }
        
        var annotations;
        if(getURLParameter("sourceURL")==null)
            var sourceURL = getURLParameter("file").trim();
        else
            var sourceURL = getURLParameter("sourceURL").trim();
        var source = sourceURL.replace(/[\/\\\-\:\.]/g, "")
        var email = getURLParameter("email");

        var queryObj = JSON.parse('{"uri":"'+source+'","email":"'+email+'"}');

        var annhost = config.annotator.host;

        // call apache for request annotator store
        var storage = new HttpStorage(JSON.parse(queryOptStr));

        var self = this;
        storage.query(queryObj)
            .then(function(data){
                annotations = data.results;
                for (var i = 0, len = self.fields.length; i < len; i++) {
                    var field = self.fields[i];
                    field.load(field.element, self.annotation,annotations);
                }
            });
        
        var self = this;
        return new Promise(function (resolve, reject) {
            self.dfd = {resolve: resolve, reject: reject};
            self.show(position);
        });

    },

    // Public: Submits the editor and saves any changes made to the annotation.
    //
    // Returns nothing.
    submit: function () {
        console.log("mpeditor - submit called");

        for (var i = 0, len = this.fields.length; i < len; i++) {
            var field = this.fields[i];

            field.submit(field.element, this.annotation);
        }
        console.log("submit success");
        // clean cached text selection
        isTextSelected = false;
        cachedOATarget = "";
        cachedOARanges = "";
        //TODO: do I need delete above snippet

        
        if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
            this.dfd.resolve();
        }
        undrawCurrhighlighter();
        this.hide();
    },
    // Public: Submits the editor and saves any changes made to the annotation.
    //
    // Returns nothing.
    submitNotClose: function () {
        console.log("mpeditor - submitNotClose called");
        for (var i = 0, len = this.fields.length; i < len; i++) {
            var field = this.fields[i];

            field.submit(field.element, this.annotation);
        }

        if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
            this.dfd.resolve();
        }

        showEditor();
        app.annotations.update(this.annotation);
    },


    // Public: Submits the editor and delete specific data field to the annotation.
    // @input: data field from currFormType
    // Returns nothing.
    // deleteDataSubmit: function (currFormType) {
    // },
    
    // Public: Cancels the editing process, discarding any edits made to the
    // annotation.
    //
    // Returns itself.
    cancel: function () {  

        if (typeof this.dfd !== 'undefined' && this.dfd !== null) {
            this.dfd.reject('editing cancelled');

            // clean editor status
            currFormType = "";
        }
        undrawCurrhighlighter();
        this.hide();
        showAnnTable();
    },

    // Public: Adds an additional form field to the editor. Callbacks can be
    // provided to update the view and anotations on load and submission.
    //
    // options - An options Object. Options are as follows:
    //           id     - A unique id for the form element will also be set as
    //                    the "for" attribute of a label if there is one.
    //                    (default: "annotator-field-{number}")
    //           type   - Input type String. One of "input", "textarea",
    //                    "checkbox", "select" (default: "input")
    //           label  - Label to display either in a label Element or as
    //                    placeholder text depending on the type. (default: "")
    //           load   - Callback Function called when the editor is loaded
    //                    with a new annotation. Receives the field <li> element
    //                    and the annotation to be loaded.
    //           submit - Callback Function called when the editor is submitted.
    //                    Receives the field <li> element and the annotation to
    //                    be updated.

    // Returns the created <li> Element.
    addField: function (options) {
        var field = $.extend({
            id: 'annotator-field-' + id(),
            type: 'input',
            label: '',
            load: function () {},
            submit: function () {}
        }, options);

        var input = null,
            element = $('<li class="annotator-item" />');

        field.element = element[0];

        if (field.type === 'textarea') {
            input = $('<textarea />');
        } else if (field.type === 'checkbox') {
            input = $('<input type="checkbox" />');
        } else if (field.type === 'input') {
            input = $('<input />');
        } else if (field.type === 'select') {
            input = $('<select />');
        } else if (field.type === 'div') {
            input = $('<div class = "quoteborder" />');
        }

        element.append(input);

        input.attr({
            id: field.id,
            placeholder: field.label
        });


        if (field.type === 'div') {
            input.attr({
                html: field.label
            });
        }

        if (field.type === 'checkbox') {
            element.addClass('annotator-checkbox');
            element.append($('<label />', {
                'for': field.id,
                'html': field.label
            }));
        }

        this.element.find('ul:first').append(element);
        this.fields.push(field);

        return field.element;
    },

    checkOrientation: function () {
        Widget.prototype.checkOrientation.call(this);

        var list = this.element.find('ul').first();
        var controls = this.element.find('.annotator-controls1');
        var tabs = this.element.find('#tabs');
        controls.insertAfter(tabs);
        /*if (this.element.hasClass(this.classes.invert.y)) {
         controls.insertBefore(list);
         } else if (controls.is(':first-child')) {
         controls.insertAfter(list);
         }*/

        return this;
    },

    // Event callback: called when a user clicks the editor form (by pressing
    // return, for example).
    //
    // Returns nothing
    _onFormSubmit: function (event) {
        preventEventDefault(event);
        this.submit();
    },

    // Event callback: called when a user clicks the editor's save and close button.
    //
    // Returns nothing
    _onSaveCloseClick: function (event) {

        preventEventDefault(event);
        showAnnTable();    
        this.submit();

        // clean cached text selection
        isTextSelected = false;
        cachedOATarget = "";
        cachedOARanges = ""; 

        // reset unsave status
        unsaved = false;
    },
    // Event callback: called when a user clicks the editor's save button.
    //
    // Returns nothing
    _onSaveClick: function (event) {
        preventEventDefault(event);
        this.submitNotClose();

        // reset unsave status
        unsaved = false;
    },

    // Event callback: called when a user clicks the editor's delete button.
    //
    // Returns nothing
    // if it's data form, delete current data
    // if claim form, delete claim and data
    _onDeleteClick: function (event) {
        preventEventDefault(event);
        this.options.onDelete(this.annotation);
        undrawCurrhighlighter();

        // reset unsave status
        unsaved = false;
    },

    // Event callback: called when a user clicks the editor's cancel button.
    //
    // Returns nothing
    _onCancelClick: function (event) {

        // clean cached text selection
        isTextSelected = false;
        cachedOATarget = "";
        cachedOARanges = "";      

        // reset unsave status
        unsaved = false;

        preventEventDefault(event);
        this.cancel();
    },

    // Event callback: called when a user mouses over the editor's cancel
    // button.
    //
    // Returns nothing
    _onCancelMouseover: function () {
        this.element
            .find('.' + this.classes.focus)
            .removeClass(this.classes.focus);
    },

    // Event callback: listens for the following special keypresses.
    // - escape: Hides the editor
    // - enter:  Submits the editor
    //
    // event - A keydown Event object.
    //
    // Returns nothing
    _onTextareaKeydown: function (event) {
        if (event.which === 27) {
            // "Escape" key => abort.
            this.cancel();
        } else if (event.which === 13 && !event.shiftKey) {
            // If "return" was pressed without the shift key, we're done.
            this.submit();
        }
    },

    // Sets up mouse events for resizing and dragging the editor window.
    //
    // Returns nothing.
    _setupDraggables: function () {
        if (typeof this._resizer !== 'undefined' && this._resizer !== null) {
            this._resizer.destroy();
        }
        if (typeof this._mover !== 'undefined' && this._mover !== null) {
            this._mover.destroy();
        }

        this.element.find('.annotator-resize').remove();

        // Find the first/last item element depending on orientation
        var cornerItem;
        if (this.element.hasClass(this.classes.invert.y)) {
            cornerItem = this.element.find('.annotator-item:last');
        } else {
            cornerItem = this.element.find('.annotator-item:first');
        }

        /*if (cornerItem) {
            $('<span class="annotator-resize"></span>').appendTo(cornerItem);
        }*/

        //var controls = this.element.find('.annotator-controls')[0];
 /*        var   textarea = this.element.find('textarea:first')[0],
            resizeHandle = this.element.find('.annotator-resize')[0],
            self = this;

        this._resizer = resizer(textarea, resizeHandle, {
            invertedX: function () {
                return self.element.hasClass(self.classes.invert.x);
            },
            invertedY: function () {
                return self.element.hasClass(self.classes.invert.y);
            }
        });
*/
        //this._mover = mover(this.element[0], controls);
    }
});


mpEditor.template = Template.content;

// Configuration options
mpEditor.options = {
    // Add the default field(s) to the editor.
    defaultFields: true,
    appendTo: '.mpeditorsection',
    // Callback, called when the user clicks the delete button for an
    // annotation.
    onDelete: function () {}
};

// dragTracker is a function which allows a callback to track changes made to
// the position of a draggable "handle" element.
//
// handle - A DOM element to make draggable
// callback - Callback function
//
// Callback arguments:
//
// delta - An Object with two properties, "x" and "y", denoting the amount the
//         mouse has moved since the last (tracked) call.
//
// Callback returns: Boolean indicating whether to track the last movement. If
// the movement is not tracked, then the amount the mouse has moved will be
// accumulated and passed to the next mousemove event.
//
var dragTracker = exports.dragTracker = function dragTracker(handle, callback) {
    var lastPos = null,
        throttled = false;

    // Event handler for mousemove
    function mouseMove(e) {
        if (throttled || lastPos === null) {
            return;
        }

        var delta = {
            //y: e.pageY - lastPos.top,
            //x: e.pageX - lastPos.left
            y:200,
            x:200
        };
        //console.log(e.pageX);

        var trackLastMove = true;
        // The callback function can return false to indicate that the tracker
        // shouldn't keep updating the last position. This can be used to
        // implement "walls" beyond which (for example) resizing has no effect.
        if (typeof callback === 'function') {
            trackLastMove = callback(delta);
        }

        if (trackLastMove !== false) {
            lastPos = {
                //top: e.pageY,
                //left: e.pageX
                top:200,
                left:200
            };
        }

        // Throttle repeated mousemove events
        throttled = true;
        setTimeout(function () { throttled = false; }, 1000 / 60);
    }


    // Event handler for mouseup
    function mouseUp() {
        lastPos = null;
        $(handle.ownerDocument)
            .off('mouseup', mouseUp)
            .off('mousemove', mouseMove);
    }

    // Event handler for mousedown -- starts drag tracking
    function mouseDown(e) {
        if (e.target !== handle) {
            return;
        }

        lastPos = {
            //top: e.pageY,
            //left: e.pageX
            top:200,
            left:200
        };

        $(handle.ownerDocument)
            .on('mouseup', mouseUp)
            .on('mousemove', mouseMove);

        e.preventDefault();
    }

    // Public: turn off drag tracking for this dragTracker object.
    function destroy() {
        $(handle).off('mousedown', mouseDown);
    }

    $(handle).on('mousedown', mouseDown);

    return {destroy: destroy};
};


// resizer is a component that uses a dragTracker under the hood to track the
// dragging of a handle element, using that motion to resize another element.
//
// element - DOM Element to resize
// handle - DOM Element to use as a resize handle
// options - Object of options.
//
// Available options:
//
// invertedX - If this option is defined as a function, and that function
//             returns a truthy value, the horizontal sense of the drag will be
//             inverted. Useful if the drag handle is at the left of the
//             element, and so dragging left means "grow the element"
// invertedY - If this option is defined as a function, and that function
//             returns a truthy value, the vertical sense of the drag will be
//             inverted. Useful if the drag handle is at the bottom of the
//             element, and so dragging down means "grow the element"
var resizer = exports.resizer = function resizer(element, handle, options) {
    var $el = $(element);
    if (typeof options === 'undefined' || options === null) {
        options = {};
    }

    // Translate the delta supplied by dragTracker into a delta that takes
    // account of the invertedX and invertedY callbacks if defined.
    function translate(delta) {
        var directionX = 1,
            directionY = -1;

        if (typeof options.invertedX === 'function' && options.invertedX()) {
            directionX = -1;
        }
        if (typeof options.invertedY === 'function' && options.invertedY()) {
            directionY = 1;
        }

        return {
            x: delta.x * directionX,
            y: delta.y * directionY
        };
    }

    // Callback for dragTracker
    function resize(delta) {
        var height = $el.height(),
            width = $el.width(),
            translated = translate(delta);

        if (Math.abs(translated.x) > 0) {
            $el.width(width + translated.x);
        }
        if (Math.abs(translated.y) > 0) {
            $el.height(height + translated.y);
        }

        // Did the element dimensions actually change? If not, then we've
        // reached the minimum size, and we shouldn't track
        var didChange = ($el.height() !== height || $el.width() !== width);
        return didChange;
    }

    // We return the dragTracker object in order to expose its methods.
    return dragTracker(handle, resize);
};


// mover is a component that uses a dragTracker under the hood to track the
// dragging of a handle element, using that motion to move another element.
//
// element - DOM Element to move
// handle - DOM Element to use as a move handle
//
var mover = exports.mover = function mover(element, handle) {
    function move(delta) {
        $(element).css({
            top: parseInt($(element).css('top'), 10) + delta.y,
            left: parseInt($(element).css('left'), 10) + delta.x
        });
    }

    // We return the dragTracker object in order to expose its methods.
    return dragTracker(handle, move);
};
