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
var queryOptStr = '{"emulateHTTP":false,"emulateJSON":false,"headers":{},"prefix":"' + config.protocal + '://' + config.apache2.host + ':' + config.apache2.port + '/annotatorstore","urls":{"create":"/annotations","update":"/annotations/{id}","destroy":"/annotations/{id}","search":"/search"}}';

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
//var ddiEditor = exports.ddiEditor = Editor.extend({
var ddiEditor = exports.ddiEditor = Widget.extend({

    constructor: function (options) {
        Widget.call(this, options);
        var editorSelf = this;
        this.fields = [];
        this.annotation = {};
        console.log("[INFO] ddieditor - constructor");

        if (this.options.defaultFields) {

            this.addField({
                load: function (field, annotation, annotations) {               

                    var claim = annotation.argues;

                    // load MP Claim
                    if(currFormType == "claim"){
                        
                        // clean claim editor
                        cleanClaimForm();
                
                        //--------------generate quote-----------------
                        var childrenInQuote = $(".annotator-currhl"); // when highlighting in red, get all text nodes by class name annotator-currhl
                        var quoteobject = $("<div id='quotearea'/>"); // quote area as DOM obj

                        //find drugs which only be highlighted in this claim
                        var list = []; //store drug name in this quote
                        var listid = []; //store corresponding drug index in this quote


                        //----------------generate drug dropdown list---------------
                        var flag = 0;
                        //check drug list
                        var allHighlightedDrug = [];
                        var anns = annotations.slice();

                        for (var i = 0, len = anns.length; i < len; i++) {
                            if (anns[i].annotationType == "DrugMention") {
				allHighlightedDrug.push(anns[i].argues.hasTarget.hasSelector.exact);
                            }
                        }

                        var quoteDiv = generateQuote(annotation.argues.hasTarget.hasSelector.exact, allHighlightedDrug, list, listid);
                        $(quoteobject).append(quoteDiv);
                        var quotecontent = $(quoteobject).html();
                        $('#quote').append(quoteobject);

                        //check if drug in store (case sensitive)
                        for(var i=0;i<list.length;i++) {
                            if(allHighlightedDrug.indexOf(list[i].trim())==-1) {
                                list.splice(i, 1);
                                listid.splice(i,1);
                            }
                        }

                        //add N/A to drug2 drop down list
                        $('#Drug2').append($('<option>', {
                            value: "N/A",
                            text: "N/A"
                        }));

                        //add drugs to drug1 and drug2 drop down list
                        var index = 0;
                        for (var i = 0, len = list.length; i < len; i++) {
                            // avoid replacing span itself add to dropdown box
                            $('#Drug1').append($('<option>', {
                                value: list[i] + "_" + listid[i],
                                text: list[i]
                            }));
                            $('#Drug2').append($('<option>', {
                                value: list[i] + "_" + listid[i],
                                text: list[i]
                            }));
                            flag = flag + 1;
                        }
                        if (claim.qualifiedBy != undefined) {
                            if (!list.includes(claim.qualifiedBy.drug1) && claim.qualifiedBy.drug1 != undefined) {
                                $('#Drug1').append($('<option>', {
                                    value: claim.qualifiedBy.drug1 + "_0",
                                    text: claim.qualifiedBy.drug1
                                }));
                            }
                            if (!list.includes(claim.qualifiedBy.drug2) && claim.qualifiedBy.drug2 != "N/A" && claim.qualifiedBy.drug2 != undefined) {
                                $('#Drug2').append($('<option>', {
                                    value: claim.qualifiedBy.drug2 + "_0",
                                    text: claim.qualifiedBy.drug2
                                }));
                            }
                        }

                        $("#Drug1")[0].selectedIndex = 0;
                        $("#Drug2")[0].selectedIndex = 0;

                        //add N/A to object metabolite drop down list
                        $('#object-metabolite').append($('<option>', {
                            value: "N/A",
                            text: "N/A"
                        }));
                        //add drugs to object metabolite
                        var distinctDrug = new Set();
                        for (var i = 0; i < allHighlightedDrug.length; i++) {
                            // if (!distinctDrug.has(allHighlightedDrug[i].toLowerCase())) {
                            //     distinctDrug.add(allHighlightedDrug[i].toLowerCase());
                            if (!distinctDrug.has(allHighlightedDrug[i])) {
                                distinctDrug.add(allHighlightedDrug[i]);
                                $('#object-metabolite').append($('<option>', {
                                    value: allHighlightedDrug[i],
                                    text: allHighlightedDrug[i]
                                }));
                            }
                        }

                        // load method
                        if (claim.method != null) {
                            $("#method > option").each(function () {
                                if (this.value === claim.method) $(this).prop('selected', true);
                            });
                        }
                       
                        if(claim.qualifiedBy!=undefined) {
			    loadDrugsForClaim(claim.qualifiedBy);
                        }

                        var drug1 = $('#Drug1 option:selected').text();
                        var drug2 = $('#Drug2 option:selected').text();
                        var drug1ID;
                        var drug1Index;
                        if ($("#Drug1")[0].selectedIndex != -1) {
                            drug1ID = $('#Drug1 option:selected').val();
                            drug1Index = drug1ID == undefined ? 0 : parseInt(drug1ID.split("_")[1]);
                        } else {
                            drug1 = "";
                        }

                        //initial & load: add currHighlight to quote
                        var drug2ID;
                        var drug2Index;

                        if ($("#Drug2")[0].selectedIndex != -1) {
                            drug2ID = $('#Drug2 option:selected').val();
                            drug2Index = drug2ID == undefined ? 0 : parseInt(drug2ID.split("_")[1]);
                        } else {
                            drug2 = "";
                        }

                        function findIndex(string, old, no) {
                            var i = 0;
                            var pos = -1;
                            while(i <= no && (pos = string.indexOf(old, pos + 1)) != -1) {
                                i++;
                            }
                            return pos;
                        }
                        function replaceIndex(string, at, old, repl) {
                            return string.replace(new RegExp(old, 'g'), function(match, i) {
                                if( i === at ) return repl;
                                return match;
                            });
                        }
                        drug1Index = drug1 == "" ? -1 : findIndex(quotecontent, drug1, drug1Index);
                        drug2Index = drug2 == "" ? drug1Index : findIndex(quotecontent, drug2, drug2Index);
                        var drug1End = drug1Index + drug1.length;
                        var drug2End = drug2Index + drug2.length;
                        if (drug1Index != -1 && drug2Index != -1) {
                            if ((drug1Index <= drug2Index && drug1End >= drug2Index) || (drug2Index <= drug1Index && drug2End >= drug1Index)) {
                                var end = Math.max(drug1End, drug2End);
                                var start = Math.min(drug1Index, drug2Index);
                                quotecontent = quotecontent.substring(0, start) + "<span class=\"highlightdrug\">" + quotecontent.substring(start, end) + "</span>" + quotecontent.substring(end, quotecontent.length);
                            } else {
                                if (drug1Index <= drug2Index) {
                                    quotecontent = quotecontent.substring(0, drug1Index) + "<span class=\"highlightdrug\">" + drug1 + "</span>" +
                                                    quotecontent.substring(drug1End, drug2Index) + "<span class=\"highlightdrug\">" + drug2 + "</span>" +
                                                    quotecontent.substring(drug2End, quotecontent.length);
                                } else {
                                    quotecontent = quotecontent.substring(0, drug2Index) + "<span class=\"highlightdrug\">" + drug2 + "</span>" +
                                                    quotecontent.substring(drug2End, drug1Index) + "<span class=\"highlightdrug\">" + drug1 + "</span>" +
                                                    quotecontent.substring(drug1End, quotecontent.length);
                                }
                            }
                        } else if (drug1Index != -1) {
                            quotecontent = quotecontent.substring(0, drug1Index) + "<span class=\"highlightdrug\">" + drug1 + "</span>" +
                            quotecontent.substring(drug1End, quotecontent.length);
                        } else if (drug2Index != -1) {
                            quotecontent = quotecontent.substring(0, drug2Index) + "<span class=\"highlightdrug\">" + drug2 + "</span>" +
                            quotecontent.substring(drug2End, quotecontent.length);
                        }

                        $(quoteobject).html(quotecontent);
                        $('#quote').append(quoteobject);

                        // highlight drug selections on text quote
                        if (claim.qualifiedBy != null) {
                            // console.log(claim.qualifiedBy.relationship);
                            // Claim relationship, precipitant and enzyme
                            $('#relationship > option').each(function () {
                                if (this.value == claim.qualifiedBy.relationship) {
                                    $(this).prop('selected', true);
                                } else {
                                    $(this).prop('selected', false);
                                }
                            });
                            //parent compound
                            var drug1PC = claim.qualifiedBy.drug1PC;
                            var drug2PC = claim.qualifiedBy.drug2PC;
                            var isEnan = false;
                            var isMeta = false;
                            if (drug1PC != null) {
                                if (drug1PC.includes("|")) {
                                    isEnan = true;
                                    isMeta = true;
                                } else if (drug1PC === "enantiomer") {
                                    isEnan = true;
                                } else if (drug1PC === "metabolite") {
                                    isMeta = true;
                                }
                            }
                            if (isEnan) {
                                $('#drug1enantiomer').prop('checked', true);
                            }
                            if (isMeta) {
                                $('#drug1metabolite').prop('checked', true);
                            }
                            isEnan = false;
                            isMeta = false;

			    if (claim.method == "Phenotype clinical study") {
				//Method: (Phenotype: substrate of, inhibit)

				if (claim.qualifiedBy.relationship == "inhibits" || claim.qualifiedBy.relationship == "substrate of") {
				    showSingleDrugForClaim();
				    loadEnzymeForClaim(claim.qualifiedBy);
				    
                                    $("#relationship option[value = 'interact with']").attr('disabled', 'disabled');
                                    $("#relationship option[value = 'interact with']").hide();
                                    if ($("#relationship option:selected").text() == "interact with") {
					$("#relationship option:selected").prop("selected", false);
                                    }
				} 

			    } else if (claim.method == "Statement") {
				//Method: (Statement: interact with, inhibits, substrate of)

				if (claim.qualifiedBy.relationship == "inhibits" || claim.qualifiedBy.relationship == "substrate of") {
				    showSingleDrugForClaim();
				    loadEnzymeForClaim(claim.qualifiedBy);

				} else if (claim.qualifiedBy.relationship == "interact with") {
				    loadPrecipitantForClaim(claim.qualifiedBy);
				}

				// Claim statement and negation
                                $('#negation-label').parent().show();
                                $('#negationdiv').parent().show();
				
                                if (claim.negation == "Yes")
                                    $('input[name=negation][value=Yes]').prop('checked', true);                                   
                                else if (claim.negation == "No")
                                    $('input[name=negation][value=No]').prop('checked', true);                                
                            

			    } else if (claim.method == "DDI clinical trial") {
				//Method: (DDI clinical trial: interact with, inhibits, substrate of)

				if (claim.qualifiedBy.relationship == "inhibits" || claim.qualifiedBy.relationship == "substrate of") {
				    loadPrecipitantForClaim(claim.qualifiedBy);
				    loadEnzymeForClaim(claim.qualifiedBy);

				} else if (claim.qualifiedBy.relationship == "interact with") {
				    loadPrecipitantForClaim(claim.qualifiedBy);
				}

			    } else if (claim.method == "Case Report") {
				//Method: (Case Report: interact with)

				if (claim.qualifiedBy.relationship == "interact with") {
				    loadPrecipitantForClaim(claim.qualifiedBy);

				    $("#relationship option[value = 'inhibits']").attr('disabled', 'disabled');
				    $("#relationship option[value = 'inhibits']").hide();
				    $("#relationship option[value = 'substrate of']").attr('disabled', 'disabled');
				    $("#relationship option[value = 'substrate of']").hide();
                                    if ($("#relationship option:selected").text() == "inhibits" || $("#relationship option:selected").text() == "substrate of") {
					$("#relationship option:selected").prop("selected", false);
                                    }
				}

			    } else if (claim.method == "Experiment") {
				//Method: (Experiment: inhibits, substrate of, has metabolite, controls formation of, inhibition constant)
				var relation = claim.qualifiedBy.relationship
				if (relation == "inhibits" || relation == "substrate of" || relation == "controls formation of" || relation == "inhibition constant") {
				    loadEnzymeForClaim(claim.qualifiedBy);
				} 
				loadPrecipitantForClaim(claim.qualifiedBy);

                                $("#relationship option").removeAttr('disabled');
                                $("#relationship option").show();
                                $("#relationship option[value = 'interact with']").attr('disabled', 'disabled');
                                $("#relationship option[value = 'interact with']").hide();
                                if ($("#relationship option:selected").text() == "interact with") {
                                    $("#relationship option:selected").prop("selected", false);
                                    $("#relationship option[value='inhibits']").prop("selected", true);
                                }

				loadObjectMetabolateForClaim(distinctDrug, claim.qualifiedBy);
			    }

                            //parent compound
                            if (!$('#drug2').parent().is(':hidden')) {
                                if (drug2PC != null) {
                                    if (drug2PC.includes("|")) {
                                        isEnan = true;
                                        isMeta = true;
                                    } else if (drug2PC === "enantiomer") {
                                        isEnan = true;
                                    } else if (drug2PC === "metabolite") {
                                        isMeta = true;
                                    }
                                }
                                if (isEnan) {
                                    $('#drug2enantiomer').prop('checked', true);
                                }
                                if (isMeta) {
                                    $('#drug2metabolite').prop('checked', true);
                                }
                            }
                        }

			loadRjectedFieldsForClaim(annotation.rejected);
                        
                    } else { // if editing data, then update claim label and drug names to data fields nav
                        //extract highlight drug from text
                        var allHighlightedDrug = [];
                        var anns = annotations.slice();
                        for (var i = 0, len = anns.length; i < len; i++) {
                            if (anns[i].annotationType == "DrugMention") {
                                allHighlightedDrug.push(anns[i].argues.hasTarget.hasSelector.exact);
                            }
                        }
			
                        // load MP list of data 
                        if (annotation.argues.supportsBy.length > 0 && currDataNum !== "") {                     
                            var loadData = annotation.argues.supportsBy[currDataNum];

                            // clean material : participants, dose1, dose2...
                            cleanDataForm();
                            //Load data form
                            if (annotation.argues.method == "Experiment") {
                                loadExperimentFromAnnotation(loadData, annotation.argues.qualifiedBy.relationship);
                            } else if (annotation.argues.method != "Case Report") {
                                loadDataItemFromAnnotation(loadData, allHighlightedDrug);
                            } else {
                                if (loadData != undefined) {
                                    loadDipsFromAnnotation(loadData);
                                } else {
                                    $("#author-total").val('NA');
                                }
                            }
                            
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
                            loadUnchangedMode();
                            postDataForm(currFormType);
                        }

                        showSaveButton(currFormType);
                    }                     
                    delete annotation.childNodes;
                },
                
                submit:function (field, annotation) {

                    if (currFormType == "claim"){

                        console.log("[editor.js] ddieditor submit claim");                       
                        annotation.annotationType = "DDI";

                        // MP method - keep with claim
                        annotation.argues.method = $('#method option:selected').text();   
			var method = annotation.argues.method
                     
                        // MP argues claim, claim qualified by ?s ?p ?o
                        if (annotation.argues.qualifiedBy != null) {
                            var qualifiedBy = annotation.argues.qualifiedBy;
                            //dose info needs to follow drug, if users make a switch in the claim editor
                            var supportsBys = annotation.argues.supportsBy;
                            var allrelationOfDose = [];
                            for (var i = 0; i < supportsBys.length; i++) {
                                var relationOfDose = {};
                                var supportsBy = supportsBys[i].supportsBy.supportsBy;
                                if (supportsBy.drug1Dose != null) {
                                    relationOfDose[qualifiedBy.drug1] = supportsBy.drug1Dose;
                                }
                                if (supportsBy.drug2Dose != null) {
                                    relationOfDose[qualifiedBy.drug2] = supportsBy.drug2Dose;
                                }
                                allrelationOfDose.push(relationOfDose);
                            }
                        } else {
                            var qualifiedBy = {drug1 : "", drug2 : "", relationship : "", enzyme : "", precipitant : ""};
			}
                        qualifiedBy.relationship = $('#relationship option:selected').text();

                        //parent compound - drug1
                        var isEnantiomer = $('#drug1enantiomer').is(':checked');
                        var isMetabolite = $('#drug1metabolite').is(':checked');
                        if (isEnantiomer && isMetabolite) {
                            qualifiedBy.drug1PC = "enantiomer|metabolite";
                        } else if (isMetabolite) {
                            qualifiedBy.drug1PC = "metabolite";
                        } else if (isEnantiomer) {
                            qualifiedBy.drug1PC = "enantiomer";
                        } else {
                            qualifiedBy.drug1PC = "";
                        }

			// TODO: refactoring by method/relationship
			// single drug 
                        if ((qualifiedBy.relationship == "inhibits" || qualifiedBy.relationship == "substrate of") && (method == "Phenotype clinical study" || method == "Statement")) {
                            qualifiedBy.drug1 = $('#Drug1 option:selected').text();
                            qualifiedBy.drug1ID = $('#Drug1 option:selected').val();
                            qualifiedBy.drug2 = "";
                            qualifiedBy.drug2ID = "";
                            qualifiedBy.drug2PC = "";			
                        } else {
			// two drugs
                            qualifiedBy.drug1 = $('#Drug1 option:selected').text();
                            qualifiedBy.drug2 = $('#Drug2 option:selected').text();
                            qualifiedBy.drug1ID = $('#Drug1 option:selected').val();
                            qualifiedBy.drug2ID = $('#Drug2 option:selected').val();
                            //parent compound - drug2
                            isEnantiomer = $('#drug2enantiomer').is(':checked');
                            isMetabolite = $('#drug2metabolite').is(':checked');
                            if (isEnantiomer && isMetabolite) {
                                qualifiedBy.drug2PC = "enantiomer|metabolite";
                            } else if (isMetabolite) {
                                qualifiedBy.drug2PC = "metabolite";
                            } else if (isEnantiomer) {
                                qualifiedBy.drug2PC = "enantiomer";
                            } else {
                                qualifiedBy.drug2PC = "";
                            }
                        }

                        //Method: Statement, DDI clinical trial, Phenotype clinical study, Case Report, Experiment
			var relation = qualifiedBy.relationship;
			if (method == "Statement") {
			    // statement negation
                            var negationVal = $("input[name=negation]:checked").val();
                            annotation.argues.negation = negationVal;
			    if (relation == "interact with") {
				qualifiedBy.precipitant = $("input[name=precipitant]:checked").val();
			    } else if (relation == "inhibits" || relation == "substrate of") {
				qualifiedBy.enzyme = $('#enzyme option:selected').text();
			    }

			} else if (method == "DDI clinical trial") {
                            qualifiedBy.precipitant = $("input[name=precipitant]:checked").val();
                            if (relation == "inhibits" || relation == "substrate of") {
				qualifiedBy.enzyme = $('#enzyme option:selected').text();
			    }

			} else if (method == "Phenotype clinical study") {
			    qualifiedBy.enzyme = $('#enzyme option:selected').text();

			} else if (method == "Case Report") {
                            qualifiedBy.precipitant = $("input[name=precipitant]:checked").val();

			} else if (method == "Experiment") {
			    if (relation == "inhibits" || relation == "substrate of" || relation == "controls formation of" || relation == "inhibition constant") {
				qualifiedBy.enzyme = $('#enzyme option:selected').text();
			    } 
                            qualifiedBy.precipitant = $("input[name=precipitant]:checked").val();
                            qualifiedBy.objectMetabolite = $('#object-metabolite option:selected').text();
			}


                        //relation of drug and drugDose
                        if (annotation.argues.supportsBy.length != 0) {  //has data or material
                            for (var i = 0; i < allrelationOfDose.length; i++) {
                                if (qualifiedBy.drug1 in allrelationOfDose[i]) {
                                    supportsBys[i].supportsBy.supportsBy.drug1Dose = allrelationOfDose[i][qualifiedBy.drug1];
                                } else {
                                    supportsBys[i].supportsBy.supportsBy.drug1Dose = {};
                                }
                                if (qualifiedBy.drug2 in allrelationOfDose[i]) {
                                    supportsBys[i].supportsBy.supportsBy.drug2Dose = allrelationOfDose[i][qualifiedBy.drug2];
                                } else {
                                    supportsBys[i].supportsBy.supportsBy.drug2Dose = {};
                                }
                            }
                        }
                        
                        var claimLabel = generateClaimLabel(annotation.argues.method, qualifiedBy);

                        annotation.argues.qualifiedBy = qualifiedBy;
                        annotation.argues.type = "mp:claim";
                        annotation.argues.label = claimLabel;
                        
                        var rejectedEvidence = $('#rejected-evidence').is(':checked');
                        var rejectReason  = $('#reject-reason').val() + "|" + $('#reject-reason-comment').val();
                        if (rejectedEvidence) {
                            annotation.rejected = {reason: rejectReason};
                        } else {
                            annotation.rejected = null;
                        }

                        if (annotation.argues.supportsBy == null)
                            annotation.argues.supportsBy = [];        
          
		    // submit data form
                    } else if (currFormType != "claim" && currAnnotationId != null) { 
                        if (annotation.argues.supportsBy.length == 0) {
                            var data = {type : "mp:data", evRelationship: "", auc : {}, cmax : {}, clearance : {}, halflife : {}, reviewer: {}, dips: {}, cellSystem: {}, metaboliteRateWith: {}, metaboliteRateWithout: {}, measurement: {}, supportsBy : {type : "mp:method", supportsBy : {type : "mp:material", participants : {}, drug1Dose : {}, drug2Dose: {}, phenotype: {}}}, grouprandom: "", parallelgroup: ""};
                            annotation.argues.supportsBy.push(data);
                        }

                        console.log("ddieditor update data & material - num: " + currDataNum);

                        var mpData = annotation.argues.supportsBy[currDataNum];
                        
                        // Evidence relationship
                        mpData.evRelationship = $("input[name=evRelationship]:checked").val();

                        // MP add data-method-material 
                        var partTmp = mpData.supportsBy.supportsBy.participants;
                        if ($('#participants').val().trim() != "" &&  partTmp.value != $('#participants').val()) {                            
                            partTmp.value = $('#participants').val();

                            if (partTmp.ranges == null) {
                                partTmp.ranges = cachedOARanges;
                            }
                            if (partTmp.hasTarget == null) {
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

                            if (dose1Tmp.ranges == null) {
                                dose1Tmp.ranges = cachedOARanges;
                            }
                            if (dose1Tmp.hasTarget == null) {
                                dose1Tmp.hasTarget = cachedOATarget;
                            }
                            mpData.supportsBy.supportsBy.drug1Dose = dose1Tmp;    
                        }

                        //material: dose2
                        var dose2Tmp = mpData.supportsBy.supportsBy.drug2Dose;
                        console.log(dose2Tmp);
                        var drug2V = $('#drug2Dose').val();
                        var drug2F = $('#drug2Formulation option:selected').text();
                        var drug2D = $('#drug2Duration').val();
                        var drug2R = $('#drug2Regimens option:selected').text();
                        if ((drug2V != "") && (drug2D != "") && (drug2F != "") && (drug2R != "")) {
                                     
                            dose2Tmp.value = drug2V;
                            dose2Tmp.formulation = drug2F;
                            dose2Tmp.duration = drug2D;
                            dose2Tmp.regimens = drug2R;

                            if (dose2Tmp.ranges == null) {
                                dose2Tmp.ranges = cachedOARanges;
                            }
                            if (dose2Tmp.hasTarget == null) {
                                dose2Tmp.hasTarget = cachedOATarget;
                            }
                            mpData.supportsBy.supportsBy.drug2Dose = dose2Tmp;   
                        }

                        // method: when method is Experiment
                        if (annotation.argues.method == "Experiment") {
                            if (currFormType == "cellSystem") {
                                //cellSystem
                                if (mpData.cellSystem == null || mpData.cellSystem.ranges == null) {
                                    var cellSystemTmp = {};
                                    cellSystemTmp['value'] = $('#cellSystem option:selected').text();
                                    cellSystemTmp['ranges'] = cachedOARanges;
                                    cellSystemTmp['hasTarget'] = cachedOATarget;
                                    mpData.cellSystem = cellSystemTmp;
                                } else {
                                    mpData.cellSystem.value = $('#cellSystem option:selected').text();
                                }
                            } else if (currFormType == "rateWith") {
                                //metabolite rate with
                                if (mpData.metaboliteRateWith == null || mpData.metaboliteRateWith.ranges == null) {
                                    var rateWithTmp = {};
                                    rateWithTmp['value'] = $('#rateWithVal').val();
                                    rateWithTmp['ranges'] = cachedOARanges;
                                    rateWithTmp['hasTarget'] = cachedOATarget;
                                    mpData.metaboliteRateWith = rateWithTmp;
                                } else {
                                    mpData.metaboliteRateWith.value = $('#rateWithVal').val();
                                }
                            } else if (currFormType == "rateWithout") {
                                //metabolite rate without
                                if (mpData.metaboliteRateWithout == null || mpData.metaboliteRateWithout.ranges == null) {
                                    var rateWithoutTmp = {};
                                    rateWithoutTmp['value'] = $('#rateWithoutVal').val();
                                    rateWithoutTmp['ranges'] = cachedOARanges;
                                    rateWithoutTmp['hasTarget'] = cachedOATarget;
                                    mpData.metaboliteRateWithout = rateWithoutTmp;
                                } else {
                                    mpData.metaboliteRateWithout.value = $('#rateWithoutVal').val();
                                }
                            } else if (currFormType == "cl" || currFormType == "vmax" || currFormType == "km" || currFormType == "ki" || currFormType == "inhibition" || currFormType == "kinact" || currFormType == "ic50") {

                                var clUnit = $('#'+currFormType+'Unit option:selected').text();
                                var clValue = $('#'+currFormType+'Value').val();
                                var clUnchanged = $('#'+currFormType+'-unchanged-checkbox').is(':checked');

                                if (clUnchanged) {
                                    clValue = "unchanged";            
                                    clUnit = "";      
                                }

                                if (mpData.measurement == null) {
                                    var measurementTmp = {};
                                    mpData.measurement = measurementTmp;
                                }
                                console.log(cachedOARanges);
                                if (mpData.measurement[currFormType] == null) {
                                    var clTmp = {};
                                    clTmp['value'] = clValue;
                                    clTmp['unit'] = clUnit;
                                    clTmp['ranges'] = cachedOARanges;
                                    clTmp['hasTarget'] = cachedOATarget;
                                    mpData.measurement[currFormType] = clTmp;
                                } else {
                                    mpData.measurement[currFormType].value = clValue;
                                    mpData.measurement[currFormType].unit = clUnit;
                                }
                            }
                        }

                        // method: when method is case report
                        if (annotation.argues.method == "Case Report") {
                            //reviewer
                            var reviewerTmp = mpData.reviewer;
                            var reviewerValue = $("input[name=dips-reviewer]:checked").val();
                            if (reviewerValue != "") {
                                reviewerTmp.reviewer = reviewerValue;
                                reviewerTmp.date = $('#datepicker').val().trim();
                                if (reviewerValue == "Author") {
                                    reviewerTmp.lackInfo = $("#author-lackscore").is(':checked');
                                    if (reviewerTmp.lackInfo) {
                                        reviewerTmp.total = $("#author-total").val().trim();
                                    } else {
                                        $("#author-total").val('NA');
                                        reviewerTmp.total = $("#author-total").val().trim();
                                    }
                                } else {
                                    reviewerTmp.lackInfo = false;
                                    reviewerTmp.total = $("#author-total").val().trim();
                                }
                            }
                            mpData.reviewer = reviewerTmp;

                            // submit dips question
                            submitDipsScore(mpData.dips);
                            //check availability of question info
                            if (!reviewerTmp.lackInfo) {
                                calculateDips(annotation);
                            }
                        }

                        //material: phenotype
                        var phenotypeTmp = mpData.supportsBy.supportsBy.phenotype;
                        var type = $("input[name=phenotypeGenre]:checked").val();
                        if (type != "" && type != undefined) {
                            if (type == "Genotype") {
                                phenotypeTmp.typeVal = $('#geneFamily option:selected').text();
                            } else {
                                phenotypeTmp.typeVal = $('#markerDrug option:selected').text();
                            }
                            phenotypeTmp.type = type;
                            phenotypeTmp.metabolizer = $("input[name=phenotypeMetabolizer]:checked").val();
                            phenotypeTmp.population = $("input[name=phenotypePopulation]:checked").val();
                            if (phenotypeTmp.ranges == null) {
                                phenotypeTmp.ranges = cachedOARanges;
                            }
                            if (phenotypeTmp.hasTarget == null) {
                                phenotypeTmp.hasTarget = cachedOATarget;
                            }
                            mpData.supportsBy.supportsBy.phenotype = phenotypeTmp;
                        }


                        mpData.grouprandom = $("input[name=grouprandom]:checked").val();  
                        mpData.parallelgroup = $("input[name=parallelgroup]:checked").val();

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

                            if (mpData.auc.ranges == null) {
                                mpData.auc.ranges = cachedOARanges;
                            }
                            if (mpData.auc.hasTarget == null) {
                                mpData.auc.hasTarget = cachedOATarget;
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

                            if (mpData.cmax.ranges == null) {
                                mpData.cmax.ranges = cachedOARanges;
                            }
                            if (mpData.cmax.hasTarget == null) {
                                mpData.cmax.hasTarget = cachedOATarget;
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

                            if (mpData.clearance.ranges == null) {
                                mpData.clearance.ranges = cachedOARanges;
                            }
                            if (mpData.clearance.hasTarget == null) {
                                mpData.clearance.hasTarget = cachedOATarget;
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

                            if (mpData.halflife.ranges == null) {
                                mpData.halflife.ranges = cachedOARanges;
                            }
                            if (mpData.halflife.hasTarget == null) {
                                mpData.halflife.hasTarget = cachedOATarget;
                            }                           
                        } else {
                            console.log("[WARNING] halflife required fields not filled!");
                        }                

                        annotation.argues.supportsBy[currDataNum] = mpData;
                    }
                }                
            });            
        }
        
        var self = this;
        
        this.element
            .on("submit." + NS, 'form', function (e) {
                self._onFormSubmit(e);
            })
            .on("click." + NS, '.annotator-save', function (e) {
                if (self._onFormValid(e)) {
                    self._onSaveClick(e);
                }
            })
            .on("click." + NS, '.annotator-save-close', function (e) {
                if (self._onFormValid(e)) {
                    self._onSaveCloseClick(e);
                    self.hide();
                }
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
        
        var annotations = [];
        if(getURLParameter("sourceURL")==null)
            var sourceURL = getURLParameter("file").trim();
        else
            var sourceURL = getURLParameter("sourceURL").trim();
        var source = sourceURL.replace(/[\/\\\-\:\.]/g, "")

        var queryObj = JSON.parse('{"uri":"'+source+'"}');

        var annhost = config.apache2.host;

        // call apache for request annotator store
        var storage = new HttpStorage(JSON.parse(queryOptStr));

        var self = this;
        storage.query(queryObj)
            .then(function(data){
                //filter druglist by selected userEmails
                for (var i = 0; i < data.results.length; i++) {
                    var ann = data.results[i];
                    if (userEmails.has(ann.email)) {
                        annotations.push(ann);
                    }
                }

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
        console.log("ddieditor - submit called");

        for (var i = 0, len = this.fields.length; i < len; i++) {
            var field = this.fields[i];
            console.log(this.annotation);
            field.submit(field.element, this.annotation);
        }

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
        console.log("ddieditor - submitNotClose called");
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

    /**
    Claim and Data Form Validation: check the fields is not empty
    Event callback: called when a user clicks the editor's save button
    Returns Boolean: True if form valid, otherwise False  
    **/
    _onFormValid: function (event) {
        preventEventDefault(event);
	console.log("editor.js: form validation");
        var valid = true;

	if (currFormType == 'claim') { // validate claim form	    
            var method = $('#method option:selected').text();
            var relationship = $('#relationship option:selected').text();

	    if (method == 'Statement') {
		if (relationship == 'interact with') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#Drug2')[0], true)) || (!this._isRatioButtonFilled('precipitant')))
			valid = false;
		} else if (relationship == 'inhibits' || relationship == 'substrate of') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#enzyme')[0], false)))
			valid = false;
		} 
	    } else if (method == 'DDI clinical trial') {
		if (relationship == 'interact with') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#Drug2')[0], true)) || (!this._isRatioButtonFilled('precipitant')))
			valid = false;
		} else if (relationship == 'inhibits' || relationship == 'substrate of') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#Drug2')[0], true)) || (!this._isRatioButtonFilled('precipitant')) || (!this._isListboxFilled($('#enzyme')[0], false)))
			valid = false;
		} 
	    } else if (method == 'Case Report') {
		if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#Drug2')[0], true)))
		    valid = false;
	    } else if (method == 'Phenotype clinical study') {
		if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#enzyme')[0], false)))
		    valid = false;
	    } else if (method == 'Experiment') {
		if (relationship == 'inhibits' || relationship == 'substrate of') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#enzyme')[0], false)))
			valid = false;
		} else if (relationship == 'has metabolite') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#object-metabolite')[0], false)))
			valid = false;
		} else if (relationship == 'controls formation of') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#object-metabolite')[0], false)) || (!this._isListboxFilled($('#enzyme')[0], false)))
			valid = false;
		} else if (relationship == 'inhibition constant') {
		    if ((!this._isListboxFilled($('#Drug1')[0], true)) || (!this._isListboxFilled($('#enzyme')[0], false)))
			valid = false;
		}
	    }
	} else { //validate data form
            var fields = $("#mp-data-form-" + currFormType).children();
            //data form validation rule
            for(var i = 0; i < fields.length; i++) {
		var ns = fields[i].tagName;
		//unchanged checkbox
		if (fields[i].type == "checkbox") {
                    if ($(fields[i]).is(":checked")) {
			return valid;
                    }
		//input box
		} else if (ns == "INPUT" && fields[i].style.display != 'none') {
		    if (!this._isInputBoxFilled(fields[i]))
			valid = false
		//select box
		} else if (ns == "SELECT") {
		    if(!this._isListboxFilled(fields[i], true))
			valid = false;
		}
	    }
        }

        // reset unsave status
        unsaved = false;
        if(!valid) {
            $('.form-validation-alert').show();
        } else {
            $('.form-validation-alert').hide();
        }
        return valid;
    },

    // validate if drop down listbox selected
    // field: listbox JS object
    // allowedDefault: False for not allowing select first option as default (ex. UNK in some cases)
    // return boolean: true if listbox selected, otherwise return false
    _isListboxFilled: function(field, allowedDefault) {
	if (field.selectedIndex == -1 || (field.selectedIndex == 0 && !allowedDefault)) {
	    $(field).css("background-color", "#f9dcd9");
	    return false;
	} else {
	    $(field).css("background-color", "");
	    return true;
	}
    },

    // validate if input box filled
    // return boolean: true if input box filled, otherwise return false
    _isInputBoxFilled: function(field) {
	if (field.value.trim() == "") {
	    $(field).css("background-color", "#f9dcd9");
	    return false;
	} else {
	    $(field).css("background-color", "");
	    return true;
	}
    },

    // validate if ratio button group filled
    _isRatioButtonFilled: function(name) {
	if (!$("input[name='" + name + "']:checked").val()) {
	    $("input[name='" + name + "']:checked").css("background-color", "#f9dcd9");
	    return false;   
	} else {
	    $("input[name='" + name + "']:checked").css("background-color", "");
	    return true;
	}
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

        // clean editor status
        currFormType = "";
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

        console.log("ddieditor - _onDeleteClick:")
        if (this.annotation.annotationType == "DDI") {
            console.log(this.annotation);
            
            preventEventDefault(event);
            this.options.onDelete(this.annotation);
            undrawCurrhighlighter();
        }

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


ddiEditor.template = Template.content;

// Configuration options
ddiEditor.options = {
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


//load dips from annotation
function loadDipsFromAnnotation(loadData) {
    //1.load reviewer info
    if (loadData.reviewer != undefined && loadData.reviewer.length != 0) {
        var reviewerTmp = loadData.reviewer;
        $('input[name=dips-reviewer][value="'+ reviewerTmp.reviewer +'"]').prop('checked', true);
        if(reviewerTmp.date != undefined) {
            $('#datepicker').val(reviewerTmp.date);
        }
        if (reviewerTmp.reviewer == "Author") {
            $('#author-lackscore').show();
            $('#author-lackscore-label').show();
            if (reviewerTmp.lackInfo != undefined && reviewerTmp.lackInfo) {
                $('#author-lackscore').prop("checked", true);
                $('#author-total').show();
                $('#author-total-label').show();
                $('#author-total').val(reviewerTmp.total);
            } else {
                $("#author-total").val('NA');
            }
        }
    } else {
        $("#author-total").val('NA');
    }

    //2. dose1 & dose2
    if (loadData.supportsBy.supportsBy.drug1Dose != null) {
        $("#drug1Dose").val(loadData.supportsBy.supportsBy.drug1Dose.value);
        $("#drug1Duration").val(loadData.supportsBy.supportsBy.drug1Dose.duration);
        $("#drug1Formulation > option").each(function () {
            if (this.value === loadData.supportsBy.supportsBy.drug1Dose.formulation) {
                $(this).prop('selected', true);                                       
            }
        });
        $("#drug1Regimens > option").each(function () {
            if (this.value === loadData.supportsBy.supportsBy.drug1Dose.regimens) {
                $(this).prop('selected', true);                                                  
            }
        });
        if (loadData.supportsBy.supportsBy.drug1Dose.hasTarget != null) {
            $('#dose1quote').html(loadData.supportsBy.supportsBy.drug1Dose.hasTarget.hasSelector.exact || '');       
        } else {
            if (cachedOATarget.hasSelector != null)
                $('#dose1quote').html(cachedOATarget.hasSelector.exact || '');       
            else
                $('#dose1quote').html('');
        }
    }
    if (loadData.supportsBy.supportsBy.drug2Dose != null) {
        $("#drug2Dose").val(loadData.supportsBy.supportsBy.drug2Dose.value);
        $("#drug2Duration").val(loadData.supportsBy.supportsBy.drug2Dose.duration);
        $("#drug2Formulation > option").each(function () {
            if (this.value === loadData.supportsBy.supportsBy.drug2Dose.formulation) {
                $(this).prop('selected', true);                                                  
            }
        });
        $("#drug2Regimens > option").each(function () {
            if (this.value === loadData.supportsBy.supportsBy.drug2Dose.regimens) {
                $(this).prop('selected', true);                                                  
            }
        });
        if (loadData.supportsBy.supportsBy.drug2Dose.hasTarget != null) {
            $('#dose2quote').html(loadData.supportsBy.supportsBy.drug2Dose.hasTarget.hasSelector.exact || '');     
        } else {
            if (cachedOATarget.hasSelector != null)
                $('#dose2quote').html(cachedOATarget.hasSelector.exact || '');       
            else 
                $('#dose2quote').html('');                      
        }  
    }
    //3. dips questions
    if (loadData.dips != null) {
        for (var i = 1; i <= 10; i++) {
            if (loadData.dips["q" + i] != null && loadData.dips["q" + i] != "") {
                //console.log(i + ":" + loadData.dips["q" + i]);
                $('input[name=dips-q' + i + '][value="' + loadData.dips["q"+i] + '"]').prop('checked', true);
            }
        }
    }
}

// load one experiment item from mp annotation
function loadExperimentFromAnnotation(loadData, relationship) {
    //change "precipitant" or "inhibit" based on relationship
    if (relationship == "inhibits") {
        $('#nav-rateWith-btn').text("Metabolite Rate With Precipitant");
        $('#nav-rateWithout-btn').text("Metabolite Rate Without Precipitant");
        $('#rateWithVal-label').text("Metabolite rate with precipitant (µL/min/mg): ");
        $('#rateWithoutVal-label').text("Metabolite rate without precipitant (µL/min/mg): ");
    } else if (relationship == "substrate of"){
        $('#nav-rateWith-btn').text("Metabolite Rate With Inhibition");
        $('#nav-rateWithout-btn').text("Metabolite Rate Without Inhibition");
        $('#rateWithVal-label').text("Metabolite rate with inhibition (µL/min/mg): ");
        $('#rateWithoutVal-label').text("Metabolite rate without inhibition (µL/min/mg): ");
    }

    if (loadData.cellSystem != null && loadData.cellSystem.hasTarget != null) {
        $('#cellSystemquote').html(loadData.cellSystem.hasTarget.hasSelector.exact || '');
        $("#cellSystem").val(loadData.cellSystem.value);
    } else {
        if (cachedOATarget.hasSelector != null)
            $('#cellSystemquote').html(cachedOATarget.hasSelector.exact || '');       
        else
            $('#cellSystemquote').html('');
    }

    if (loadData.metaboliteRateWith != null && loadData.metaboliteRateWith.hasTarget != null) {
        $('#rateWithquote').html(loadData.metaboliteRateWith.hasTarget.hasSelector.exact || '');
        $("#rateWithVal").val(loadData.metaboliteRateWith.value);
    } else {
        if (cachedOATarget.hasSelector != null)
            $('#rateWithquote').html(cachedOATarget.hasSelector.exact || '');       
        else
            $('#rateWithquote').html('');
    }

    if (loadData.metaboliteRateWithout != null && loadData.metaboliteRateWithout.hasTarget != null) {
        $('#rateWithoutquote').html(loadData.metaboliteRateWithout.hasTarget.hasSelector.exact || '');
        $("#rateWithoutVal").val(loadData.metaboliteRateWithout.value);
    } else {
        if (cachedOATarget.hasSelector != null)
            $('#rateWithoutquote').html(cachedOATarget.hasSelector.exact || '');       
        else
            $('#rateWithoutquote').html('');
    }

    if (loadData.measurement != null) {
        var mTypes = ["cl", "vmax", "km", "ki", "inhibition", "kinact", "ic50"];
        for (var i = 0; i < mTypes.length; i++) {
            var mType = mTypes[i];
            
            if (loadData.measurement[mType] == null || loadData.measurement[mType].hasTarget == null) {
                //quote context can be used multiple times
                if (cachedOATarget.hasSelector != null)
                    $('#'+mType+'quote').html(cachedOATarget.hasSelector.exact || '');       
                else
                    $('#'+mType+'quote').html('');
            } else {
                //quote
                $('#'+mType+'quote').html(loadData.measurement[mType].hasTarget.hasSelector.exact || '');
                if (loadData.measurement[mType].value == "unchanged") {
                    //unchanged
                    $('#'+mType+'-unchanged-checkbox').prop("checked", true);
                } else {
                    //value
                    $("#"+mType+"Value").val(loadData.measurement[mType].value);
                    //unit - some options are added by users
                    if (loadData.measurement[mType].unit != null) {
                        var tempval = loadData.measurement[mType].unit;
                        if ($('#'+mType+'Unit option[value = \"'+tempval+'\"]').length == 0) {
                            $('#'+mType+'Unit').append($('<option>', {
                                value: tempval,
                                text: tempval
                            }));
                        }
                    }
                    $("#"+mType+"Unit").val(loadData.measurement[mType].unit);
                }
            }
        }
    }

    // evidence relationship
    if (loadData.evRelationship == "refutes")
        $('input[name=evRelationship][value=refutes]').prop('checked', true);               
    else if (loadData.evRelationship == "supports")
        $('input[name=evRelationship][value=supports]').prop('checked', true); 

    // questions for dictating method type
    if (loadData.grouprandom == "yes")
        $('input[name=grouprandom][value=yes]').prop('checked', true);  
    else if (loadData.grouprandom == "no")
        $('input[name=grouprandom][value=no]').prop('checked', true);  
    if (loadData.parallelgroup == "yes")
        $('input[name=parallelgroup][value=yes]').prop('checked', true);  
    else if (loadData.parallelgroup == "no")
        $('input[name=parallelgroup][value=no]').prop('checked', true);   

    if (annotation.argues.method != null) {
        $("#evidencetype-method > option").each(function () {
            if (this.value === annotation.argues.method) $(this).prop('selected', true);
        });
    }   
}

// load one data item from mp annotation
function loadDataItemFromAnnotation(loadData, allHighlightedDrug) {

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
            $(this).prop('selected', true);                                       
        }
    });
    $("#drug1Regimens > option").each(function () {
        if (this.value === loadData.supportsBy.supportsBy.drug1Dose.regimens) {
            $(this).prop('selected', true);                                                  
        }
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
    //data - dose2
    $("#drug2Dose").val(loadData.supportsBy.supportsBy.drug2Dose.value);
    $("#drug2Duration").val(loadData.supportsBy.supportsBy.drug2Dose.duration);
    $("#drug2Formulation > option").each(function () {
        if (this.value === loadData.supportsBy.supportsBy.drug2Dose.formulation) {
            $(this).prop('selected', true);                                                  
        }
    });
    $("#drug2Regimens > option").each(function () {
        if (this.value === loadData.supportsBy.supportsBy.drug2Dose.regimens) {
            $(this).prop('selected', true);                                                  
        }
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
    //data - phenotype
    //load quote
    var exact = '';
    if (loadData.supportsBy.supportsBy.phenotype != null && loadData.supportsBy.supportsBy.phenotype.hasTarget != null) {
        exact = (loadData.supportsBy.supportsBy.phenotype.hasTarget.hasSelector.exact || '');
    } else if (cachedOATarget.hasSelector != null) {
        exact = (cachedOATarget.hasSelector.exact || '');                        
    } 
    $('#phenotypequote').html(exact); 
    //generate maker drug dropdown list
    var markerDrugList = [];
    for (var i = 0; i < allHighlightedDrug.length; i++) {
        if (exact.indexOf(allHighlightedDrug[i]) != -1) {
            markerDrugList.push(allHighlightedDrug[i]);
        }
    }
    $('#markerDrug').append($('<option>', {
        value: 'UNK',
        text: 'UNK'
    }));
    for (var i = 0; i < markerDrugList.length; i++) {
        $('#markerDrug').append($('<option>', {
            value: markerDrugList[i],
            text: markerDrugList[i]
        }));
    }
    if (loadData.supportsBy.supportsBy.phenotype != null) {

        var phenotypeType = loadData.supportsBy.supportsBy.phenotype;
        //load value
        //widget show or hide
        $('input[name=phenotypeGenre][value="'+ phenotypeType.type +'"]').prop('checked', true);
        if (phenotypeType.type == "Genotype") {
            $("#geneFamily > option").each(function () {
                if (this.value === loadData.supportsBy.supportsBy.phenotype.typeVal) {
                    $(this).prop('selected', true);                                                  
                }
            });
            $('#geneFamily').show();
            $('#geneFamily-label').show();
            $('#markerDrug').hide();
            $('#markerDrug-label').hide();
        } else if (phenotypeType.type == "Drug Phenotype"){
            $("#markerDrug > option").each(function () {
                if (this.value === loadData.supportsBy.supportsBy.phenotype.typeVal) {
                    $(this).prop('selected', true);                                                  
                }
            });
            $('#geneFamily').hide();
            $('#geneFamily-label').hide();
            $('#markerDrug').show();
            $('#markerDrug-label').show();
        } else {
            $('#geneFamily').hide();
            $('#geneFamily-label').hide();
            $('#markerDrug').hide();
            $('#markerDrug-label').hide();
        }
        $('input[name=phenotypeMetabolizer][value="'+ phenotypeType.metabolizer +'"]').prop('checked', true);
        $('input[name=phenotypePopulation][value="'+ phenotypeType.population +'"]').prop('checked', true);
    }


    // load mp data fields

    // evidence relationship
    if (loadData.evRelationship == "refutes")
        $('input[name=evRelationship][value=refutes]').prop('checked', true);               
    else if (loadData.evRelationship == "supports")
        $('input[name=evRelationship][value=supports]').prop('checked', true);                  

    // questions for dictating method type
    if (loadData.grouprandom == "yes")
        $('input[name=grouprandom][value=yes]').prop('checked', true);  
    else if (loadData.grouprandom == "no")
        $('input[name=grouprandom][value=no]').prop('checked', true);  
    if (loadData.parallelgroup == "yes")
        $('input[name=parallelgroup][value=yes]').prop('checked', true);  
    else if (loadData.parallelgroup == "no")
        $('input[name=parallelgroup][value=no]').prop('checked', true);   

    if (annotation.argues.method != null) {
        $("#evidencetype-method > option").each(function () {
            if (this.value === annotation.argues.method) $(this).prop('selected', true);
        });
    }                      


    // AUC: if unchanged then mark on checkbox, else load auc
    if (loadData.auc.value == "unchanged") {
        $('#auc-unchanged-checkbox').prop("checked", true);
    } else {
        $("#auc").val(loadData.auc.value);
        $("#aucType > option").each(function () {
            if (this.value === loadData.auc.type) {
                $(this).prop('selected', true);                                                  
            }            
        });
        $("#aucDirection > option").each(function () {
            if (this.value === loadData.auc.direction) {
                $(this).prop('selected', true);                                                  
            }
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
                $(this).prop('selected', true);                                                  
            }
        });
        $("#cmaxDirection > option").each(function () {
            if (this.value === loadData.cmax.direction) {
                $(this).prop('selected', true);                                                  
            }
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
                $(this).prop('selected', true);                                                  
            }
        });
        $("#clearanceDirection > option").each(function () {
            if (this.value === loadData.clearance.direction) {
                $(this).prop('selected', true);                                                  
            }
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
                $(this).prop('selected', true);                                                  
            }
        });
        $("#halflifeDirection > option").each(function () {
            if (this.value === loadData.halflife.direction) {
                $(this).prop('selected', true);                                                  
            }
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

function showSaveButton(field) {
    $(".annotator-save").hide();
    if (field != "evRelationship" && field != "studytype") {
        $(".annotator-save").show();
    } 
}

/** post process data form (
    1.show current data form and hide others. 
    2.show delete button if there are value been load. 
    3.hide nav list for ev relationship and study type data form)
**/
function postDataForm(targetField) {

    console.log("ddieditor - postDataForm: " + targetField);
    $("#mp-claim-form").hide();

    // field name and actual div id mapping
    var fieldM = {"reviewer":"reviewer", "evRelationship":"evRelationship", "participants":"participants", "dose1":"drug1Dose", "dose2":"drug2Dose", "phenotype":"phenotype", "auc":"auc", "cmax":"cmax", "clearance":"clearance", "halflife":"halflife", "studytype":"studytype",
    "q1":"q1", "q2":"q2", "q3":"q3", "q4":"q4", "q5":"q5", "q6":"q6", "q7":"q7", "q8":"q8", "q9":"q9", "q10":"q10", "cellSystem":"cellSystem", "rateWith":"rateWithVal", "rateWithout":"rateWithoutVal", "cl":"cl", "vmax":"vmax", "km":"km", "ki":"ki", "inhibition":"inhibition",
    "kinact":"kinact", "ic50":"ic50"};
    var showDeleteBtn = false;

    for (var field in fieldM) {       
        var dataid = "mp-data-form-"+field;
        var fieldVal = "";
        if (field === targetField) {
            $("#"+dataid).show();  // show specific data form 
            // inspect that is target form has value filled 

            if (field == "evRelationship" || field =="studytype") { // when field is radio button
                fieldVal = $("input[name="+field+"]:checked").val();
            } else if (field == "auc" || field == "cmax" || field == "clearance" || field == "halflife") { // when field is checkbox
                $("#mp-data-nav").show();
                if ($('#' + field + '-unchanged-checkbox').is(':checked')) 
                    showDeleteBtn = true;                    
                fieldVal = $("#" + fieldM[field]).val();
            } else if (currAnnotation.argues.method == "Case Report"){
                $("#mp-dips-nav").show();
                fieldVal = $("#dips-" + fieldM[field]).val();
            } else if (field == "cl" || field == "vmax" || field == "km" || field == "ki" || field == "inhibition" || field == "kinact" || field == "ic50") {
                if ($('#' + field + '-unchanged-checkbox').is(':checked')) 
                    showDeleteBtn = true; 
                experimentNav();
                fieldVal = $("#" + fieldM[field] + "Value").val();
            } else if (currAnnotation.argues.method == "Experiment"){
                experimentNav();
                fieldVal = $("#" + fieldM[field]).val();
            }  else if (field == "phenotype"){ // when field is text input
                $("#mp-data-nav").show();
                fieldVal = $("#" + fieldM[field] + "Genre").val();
            }  else { // when field is text input
                $("#mp-data-nav").show();
                fieldVal = $("#" + fieldM[field]).val();
            }
                
            if (fieldVal !=null && fieldVal != "")
                $("#annotator-delete").show();
            else if (showDeleteBtn)
                $("#annotator-delete").show();
            else 
                $("#annotator-delete").hide();
            focusOnDataField(targetField);
        }                        
        else {
            cleanFocusOnDataField(field);
            $("#"+dataid).hide();
        }
    }
}

function experimentNav() {
    var withRateLabel = $("#withRate-label").text();
    var withoutRateLabel = $("#withoutRate-label").text();
    $("#nav-rateWith-btn").text(withRateLabel);
    if (withoutRateLabel == "") {
        $("#nav-rateWithout-btn").hide();
        $("#rateWithoutArrow").hide();
    } else {
        $("#nav-rateWithout-btn").text(withoutRateLabel);
        $("#nav-rateWithout-btn").show();
        $("#rateWithoutArrow").show();
    }
    $("#mp-experiment-nav").show();

}

//initial load unchanged mode
//fields allowed: auc, cmax, clearance, halflife
function loadUnchangedMode() {
    var fields = ["auc", "cmax", "clearance", "halflife"];
    for (var i = 0; i < fields.length; i++) {
        if ($('#' + fields[i] + '-unchanged-checkbox').is(':checked')) {
            $('#'+fields[i]).attr('disabled', true);
            $('#'+fields[i]+'Type').attr('disabled', true);
            $('#'+fields[i]+'Direction').attr('disabled', true);  
        } else {
            $('#'+fields[i]).attr('disabled', false);
            $('#'+fields[i]+'Type').attr('disabled', false);
            $('#'+fields[i]+'Direction').attr('disabled', false);  
        }
    }

    var fields = ["cl", "vmax", "km", "ki", "inhibition", "kinact", "ic50"];
    for (var i = 0; i < fields.length; i++) {
        if ($('#' + fields[i] + '-unchanged-checkbox').is(':checked')) {
            $('#'+fields[i]+'Unit').attr('disabled', true);
            $('#'+fields[i]+'Value').attr('disabled', true);  
        } else {
            $('#'+fields[i]+'Unit').attr('disabled', false);
            $('#'+fields[i]+'Value').attr('disabled', false);  
        }
    }
}

// clean all value of claim form
function cleanClaimForm() {
    console.log("[editor.js] clean claim form");
    // clean form validation format
    $('.form-validation-alert').hide();

    var allClaimFields = ["#Drug1", "#Drug2"];
    for (var i = 0; i < allClaimFields.length; i++) {
        $(allClaimFields[i]).css("background-color", "");
    }

    $("#quote").empty();
    // Method
    $("#method")[0].selectedIndex = 0;

    // Relationship
    $("#relationship option").removeAttr('disabled');
    $("#relationship option").show();
    $("#relationship")[0].selectedIndex = 0;
    //default: hide (has metabolite, controls formation of, inhibition constant)
    $("#relationship option[value = 'has metabolite']").attr('disabled', 'disabled');
    $("#relationship option[value = 'has metabolite']").hide();
    $("#relationship option[value = 'controls formation of']").attr('disabled', 'disabled');
    $("#relationship option[value = 'controls formation of']").hide();
    $("#relationship option[value = 'inhibition constant']").attr('disabled', 'disabled');
    $("#relationship option[value = 'inhibition constant']").hide();
    
    // Enzyme
    $("#enzyme")[0].selectedIndex = 0;
    $("#enzyme").hide();
    $("#enzymesection1").hide();
    
    $('input[type=radio][name=precipitant]').parent().show();
    $('.precipitantLabel').parent().show();
    $('input[name=precipitant][id=drug1precipitant]').prop('checked', false);
    $('input[name=precipitant][id=drug2precipitant]').prop('checked', false);

    $('#drug1metabolite').prop('checked', false);
    $('#drug1enantiomer').prop('checked', false);
    $('#drug2metabolite').prop('checked', false);
    $('#drug2enantiomer').prop('checked', false);
    $("#drug2enantiomerLabel").parent().show();
    $("#drug2enantiomer").parent().show();
    $("#drug2metaboliteLabel").parent().show();
    $("#drug2metabolite").parent().show();

    $('#negationdiv').parent().hide();
    $('#negation-label').parent().hide();
    $('input[name=negation]').prop('checked', false);
    
    $('#Drug1 option').remove();
    $('#Drug2 option').remove();
    $('#object-metabolite option').remove();

    $('#object-metabolite').parent().hide();
    $('#object-metabolite-label').parent().hide();
    $("#Drug1-label").html("Drug1: ");
    $("#Drug2-label").parent().show();
    $("#Drug2").parent().show(); 

    // Reject Evidence
    $('#rejected-evidence').prop('checked', false);
    $('#reject-reason-comment').val('');
    $('#reject-reason')[0].selectedIndex = 0;
}

// clean all value of data form
function cleanDataForm() {
    //clean form validation format
    $(".form-validation-alert").hide();

    var allDataFields = ["#cellSystem", "#rateWithVal", "rateWithoutVal", "cl", "vmax", "km", "ki", "inhibition", "kinact", "ic50", "#dips-reviewer", "#datepicker", "#participants", "#drug1Dose", "#drug1Duration", "#drug1Formulation", "#drug1Regimens", "#drug2Dose", "#drug2Duration", "#drug2Formulation", "#drug2Regimens", "#auc", "#aucType", "#aucDirection", "#cmax", "#cmaxType", "#cmaxDirection", "#clearance", "#clearanceType", "#clearanceDirection", "#halflife", "#halflifeType", "#halflifeDirection"];
    for (var i = 0; i < allDataFields.length; i++) {
        $(allDataFields[i]).css("background-color", "");
    }

    //clean reviewer
    $('#dips-reviewer').attr('checked',false);
    $("#author-lackscore").prop('checked', false);
    $("#author-lackscore").hide();
    $("#author-lackscore-label").hide();
    $("#author-total").val('NA');
    $("#author-total").hide();
    $("#author-total-label").hide();
    var today = getCurrentDate();
    $("#datepicker").val(today);

    //clean questionList
    for (var i = 1; i <= 10; i++) {
        $('input[name=dips-q' + i + ']').prop('checked', false);
    }

    //clean experiment data
    $("#cellSystem").val('');
    $("#rateWithVal").val('');
    $("#rateWithoutVal").val('');
    $("#clValue").val('');
    $('#cl-unchanged-checkbox').attr('checked',false);
    $("#clUnit")[0].selectedIndex = -1;
    $("#vmaxValue").val('');
    $('#vmax-unchanged-checkbox').attr('checked',false);
    $("#vmaxUnit")[0].selectedIndex = -1;
    $("#kmValue").val('');
    $('#km-unchanged-checkbox').attr('checked',false);
    $("#kmUnit")[0].selectedIndex = -1;
    $("#kiValue").val('');
    $('#ki-unchanged-checkbox').attr('checked',false);
    $("#kiUnit")[0].selectedIndex = -1;
    $("#inhibitionValue").val('');
    $('#inhibition-unchanged-checkbox').attr('checked',false);
    $("#inhibitionUnit")[0].selectedIndex = -1;
    $("#kinactValue").val('');
    $('#kinact-unchanged-checkbox').attr('checked',false);
    $("#kinactUnit")[0].selectedIndex = -1;
    $("#ic50Value").val('');
    $('#ic50-unchanged-checkbox').attr('checked',false);
    $("#ic50Unit")[0].selectedIndex = -1;

    //clean material
    $("#participants").val('');
    $("#drug1Dose").val('');
    $("#drug1Duration").val('');
    $("#drug1Formulation")[0].selectedIndex = -1;
    $("#drug1Regimens")[0].selectedIndex = -1;
    $("#drug2Dose").val('');
    $("#drug2Duration").val('');
    $("#drug2Formulation")[0].selectedIndex = -1;
    $("#drug2Regimens")[0].selectedIndex = -1;
    $('input[name=phenotypeGenre]').prop('checked', false);
    $('input[name=phenotypeMetabolizer]').prop('checked', false);
    $('input[name=phenotypePopulation]').prop('checked', false);
    $('#geneFamily')[0].selectedIndex = 0;
    $('#markerDrug option').remove();

    // clean data : auc, cmax, cl, half life
    $("#auc").val('');
    $("#aucType")[0].selectedIndex = -1;
    $("#aucDirection")[0].selectedIndex = -1;
    $('#auc-unchanged-checkbox').attr('checked',false);

    $("#cmax").val('');
    $("#cmaxType")[0].selectedIndex = -1;
    $("#cmaxDirection")[0].selectedIndex = -1;
    $('#cmax-unchanged-checkbox').attr('checked',false);
    
    $("#clearance").val('');
    $("#clearanceType")[0].selectedIndex = -1;
    $("#clearanceDirection")[0].selectedIndex = -1;
    $('#clearance-unchanged-checkbox').attr('checked',false);
    
    $("#halflife").val('');
    $("#halflifeType")[0].selectedIndex = -1;
    $("#halflifeDirection")[0].selectedIndex = -1;
    $('#halflife-unchanged-checkbox').attr('checked',false);
    
    // clean evidence relationship
    $('input[name=evRelationship]').prop('checked', false);
    
    // study type questions
    $('input[name=grouprandom]').prop('checked', false);
    $('input[name=parallelgroup]').prop('checked', false);    
}

// return not-none child node 
function moveToChildNode(parent) {
    // move to most inner span node
    while (parent.childNodes.length > 0) {
        var innerNode = null;
        // find inner span that not none 
        for (var j=0; j<parent.childNodes.length; j++) {
            if (parent.childNodes[j].textContent != "") {
                innerNode = parent.childNodes[j];
                break;
            }
        }
        if (innerNode != null) 
            parent = innerNode;  
        else 
            break;
    }
    return parent;
}

// generate claim label based on method and relationship, drug, enzyme, metabolite information comes from qualifiers list 
// if precipitant is not available, use drug 1 as precipitant by default (however, precipitant suppose to provide)
// return claim label
function generateClaimLabel(method, qualifiers) {
    var claimLabel = "";
    if (method == "Statement") {
	if (qualifiers.relationship == "interact with") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.drug1;
	    } else {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.drug2;	    
	    }
	} else if (qualifiers.relationship == "inhibits" || qualifiers.relationship == "substrate of") {
	    claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	}
    } else if (method == "DDI clinical trial") {
	if (qualifiers.relationship == "interact with") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.drug1;
	    } else {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.drug2;
	    }
	} else if (qualifiers.relationship == "inhibits") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    } else { 
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    }
	} else if (qualifiers.relationship == "substrate of") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    } else { 
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    }
	}
    } else if (method == "Phenotype clinical study") {	
	claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
    } else if (method == "Case Report") {
	if (qualifiers.precipitant == "drug2") {
	    claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.drug1;
	} else {
	    claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.drug2;
	}
    } else if (method == "Experiment") {
	if (qualifiers.relationship == "inhibits") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    } else { 
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    }
	} else if (qualifiers.relationship == "substrate of") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    } else { 
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    }
	} else if (qualifiers.relationship == "has metabolite") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.objectMetabolite;
	    } else {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.objectMetabolite;
	    }
	} else if (qualifiers.relationship == "controls formation of") {
	    claimLabel = qualifiers.enzyme + "_" + qualifiers.relationship + "_" + qualifiers.objectMetabolite;
	} else if (qualifiers.relationship == "inhibition constant") {
	    if (qualifiers.precipitant == "drug2") {
		claimLabel = qualifiers.drug2 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    } else {
		claimLabel = qualifiers.drug1 + "_" + qualifiers.relationship + "_" + qualifiers.enzyme;
	    }
	}
    }
    return claimLabel;
}


// inputs: text of current highlights
// return quote content as list of DOM node, drugList, drugListID
function generateQuote(highlightText, drugList, list, listid) {
    var drugIndexList = []; // use to store drug entries
    var processedText = ""; // use to store highlightText with added span

    //DrugEntry class
    function DrugEntry (drugName, drugStart, drugNo) {
        this.drugName = drugName;
        this.drugStart = drugStart; //indexOf(), start offset of first character
        this.drugEnd = drugStart + drugName.length - 1; //end offset of last character
        this.drugNo = drugNo; //No. of drug(1, 2, 3..)
    }
    //build drug index array
    for (var i = 0; i < drugList.length; i++) {
        var index = -1;
        var no = 0;
        while((index = highlightText.indexOf(drugList[i], index + 1)) != -1) {
            drugIndexList.push(new DrugEntry(drugList[i], index, no++));
        }
    }
    //sort drugIndexList by drugStart offset
    drugIndexList.sort(function(a, b) {
        return a.drugStart - b.drugStart;
    });

    //generate items in drop down list
    for (var i = 0; i < drugIndexList.length; i++) {
        list.push(drugIndexList[i].drugName);
        listid.push(drugIndexList[i].drugNo);
    }

    //generate highlight span intervals
    var intervals = [];
    for (var i = 0; i < drugIndexList.length; i++) {
        var start = drugIndexList[i].drugStart;
        var end = drugIndexList[i].drugEnd;
        while (i + 1 < drugIndexList.length && drugIndexList[i+1].drugStart < end) { //nextStart < currEnd --> has overlap
            //end = max(currEnd, nextEnd)
            end = Math.max(end, drugIndexList[i+1].drugEnd);
            i++;
        }
        //console.log(start + ":" + end);
        intervals.push({
            start: start,
            end: end
        });
    }
    
    //add span to text
    var pos = 0;
    for (var i = 0; i < intervals.length; i++) {
        //plain text
        var temp = highlightText.substring(pos, intervals[i].start);

        //add span
        temp += "<span class='annotator-hl' >";
        temp += highlightText.substring(intervals[i].start, intervals[i].end + 1);
        temp += "</span>";
        processedText += temp;
        pos = intervals[i].end + 1;
    }
    if (pos < highlightText.length) {
        processedText += highlightText.substring(pos, highlightText.length);
    }
    var p = document.createElement("p");

/* //PDF plugin
    var prevNode = null; 
    var goodChild; // good child means drug highlights with new parent node
    var indexDict = {}; //hashmap<drugName, drugIndex>
    var drugMap = {}; //hashmap<nodeID, nodeTextContent>, used in combining two drugs
    var combines = []; //used in combining two drugs
    
    for (var qi = 0; qi < childrenInQuote.length; qi++) { 
        var tempContent = $(childrenInQuote[qi]).text().trim();
        
        // if parent node is hl or currhl, then move up to parent
        while(childrenInQuote[qi].parentNode.className=="annotator-hl" || childrenInQuote[qi].parentNode.className=="annotator-currhl") {
            childrenInQuote[qi]= childrenInQuote[qi].parentNode;
        }
        
        // if previous node and current node having the same parent, then skip. else, add current node to quote
        if (!childrenInQuote[qi].isEqualNode(prevNode)) {
            prevNode = childrenInQuote[qi];
            goodChild = prevNode.cloneNode(true);
            goodChild.innerHTML = tempContent;

            //change drugMention elements' id to "drugName-drugIndex", e.g. terazosin-0
            if (goodChild.getAttribute("name") == "annotator-hl") {
                if (tempContent in indexDict) {
                    indexDict[tempContent] = indexDict[tempContent] + 1;
                    goodChild.id = tempContent + "_" + indexDict[tempContent];
                    list.push(tempContent);
                    listid.push(indexDict[tempContent]);
                } else {
                    indexDict[tempContent] = 0;
                    goodChild.id = tempContent + "_" + indexDict[tempContent];
                    list.push(tempContent);
                    listid.push(indexDict[tempContent]);
                }
                //fing two drugs which need to combine
                if (prevNode.id in drugMap && drugMap[prevNode.id] != tempContent) {
                    combines.push(drugMap[prevNode.id]); //section1.drugname
                    combines.push(indexDict[drugMap[prevNode.id]]); //section1.drugid
                    combines.push(tempContent); //section2.drugname
                    combines.push(0); //section2.drugid
                } else {
                    drugMap[prevNode.id] = tempContent;
                }
                */
    p.innerHTML = processedText;
    
    return p;
}

// submit dips score into store
function submitDipsScore(dipsTmp) {
    if (dipsTmp == null) {
        dipsTmp = {"q1":"","q2":"","q3":"","q4":"","q5":"","q6":"","q7":"","q8":"","q9":"","q10":""};
    }
    for (var i = 1; i <= 10; i++) {
        var qValue = $('input[name=dips-q' + i + ']:checked').val();
        if (qValue != "") {
            dipsTmp["q" + i] = qValue;
        } else {
            dipsTmp["q" + i] = "";
        }
    }
}

// calculator for dips score
function calculateDips(annotation) {
    var total = 0;
    var dipsTmp = annotation.argues.supportsBy[currDataNum].dips;
    //score of every question
    var scoreList = [
        {
            Yes: 1, No: -1, NA: 0
        },
        {
            Yes: 1, No: -1, UNK: 0
        },
        {
            Yes: 1, No: -1, "UNK/NA": 0
        },
        {
            Yes: 1, No: -1, "UNK/NA": 0
        },
        {
            Yes: 1, No: -2, NA: 0
        },
        {
            Yes: 2, No: -1, "UNK/NA": 0
        },
        {
            Yes: -1, No: 1, "UNK/NA": 0
        },
        {
            Yes: 1, No: 0, "UNK/NA": 0
        },
        {
            Yes: 1, No: 0, NA: 0
        },
        {
            Yes: 1, No: -1, NA: 0
        }
    ];
    if (dipsTmp != null) {
        for (var i = 1; i <= 10; i++) {
            if (dipsTmp['q'+i] != null && dipsTmp['q'+i] != "") {
                var curr = dipsTmp['q'+i];
                total += scoreList[i-1][curr];
            } else {
                //not all questions are answered
                return;
            }
        }

    /* //PDF plugin
    }
    //combine two drugs (1. change nodeID in quote, 2. change list & listid)
    if (combines.length > 0) {
        var tempid = combines[0] + "_" + combines[1];
        var newContent = combines[0] + combines[2];
        p.innerHTML = p.innerHTML.replace(tempid, newContent + "_0");
        tempid = "\"" + combines[2] + "_" + combines[3] + "\"";
        p.innerHTML = p.innerHTML.replace(tempid, "\"" + newContent + "_0\"");
        list.push(newContent);
        listid.push(0);
    }
    return p;*/
        annotation.argues.supportsBy[currDataNum].reviewer.total = total;
        //console.log(total);
    }
    return;
}

//disable dips questions input
function freezeQuestions() {
    //document.getElementById('mp-dips-tb').style.pointerEvents = 'auto';
    $('.dipsQuestion').prop('disabled', true);
}

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = mm+'/'+dd+'/'+yyyy;
    return today;
}

// On claim form, show enzyme widget and load value if applicable 
// qualifier: claim.qualifiedBy
function loadEnzymeForClaim(qualifier) {
    $("#enzyme").show();
    $("#enzymesection1").show();				    
    $('#enzyme option').each(function () {
	if (this.value == qualifier.enzyme) {
            $(this).prop('selected', true);            
	} else {
            $(this).prop('selected', false);
	}
    });
}

// On claim form, show precipitant radio buttons for drug1 and drug2 and load value if applicable 
// qualifier: claim.qualifiedBy
function loadPrecipitantForClaim(qualifier) {
    console.log("editor.js: load Precipitant for claim - " + qualifier.precipitant);
    
    $('input[type=radio][name=precipitant]').parent().show();
    $('.precipitantLabel').parent().show();
    if (qualifier.precipitant == "drug1")
	$('input[name=precipitant][id=drug1precipitant]').prop('checked', true);
    else if (qualifier.precipitant == "drug2")
	$('input[name=precipitant][id=drug2precipitant]').prop('checked', true);      
    else 
	console.log("precipitant information not avaliable");
}

// On Claim form, show object metabolite and load value if applicable
// distinctDrug: distinct drugs set
// qualifier: claim.qualifiedBy
function loadObjectMetabolateForClaim(distinctDrug, qualifier) {
    $('#object-metabolite').parent().show();
    $('#object-metabolite-label').parent().show();
    if (qualifier.objectMetabolite != null) {
        // if (!distinctDrug.has(qualifier.objectMetabolite.toLowerCase()) && qualifier.objectMetabolite.toLowerCase() != "n/a") {
        if (!distinctDrug.has(qualifier.objectMetabolite) && qualifier.objectMetabolite.toLowerCase() != "n/a") {
            $('#object-metabolite').append($('<option>', {
                value: qualifier.objectMetabolite,
                text: qualifier.objectMetabolite
            }));
        }
        $("#object-metabolite").val(qualifier.objectMetabolite);
    }
}

// On claim form, hide 2nd drug label, listbox, parent compound checkboxes, rename drug1 label
function showSingleDrugForClaim() {
    $("#Drug1-label").html("Drug: ");
    $("#Drug2-label").parent().hide();
    $("#Drug2").parent().hide();
    $('input[type=radio][name=precipitant]').parent().hide();
    $('.precipitantLabel').parent().hide();
    $("#drug2enantiomerLabel").parent().hide();
    $("#drug2enantiomer").parent().hide();
    $("#drug2metaboliteLabel").parent().hide();
    $("#drug2metabolite").parent().hide();    
}


// On claim form, show reject fields
// rejected: annotation.rejected
function loadRjectedFieldsForClaim(rejected) {

    //show reject reason when reject checked
    if (rejected == null || rejected == undefined) {
        $('#reject-reason').hide();
        $('#reject-reason-comment').hide();
        $('#reject-reason-label').hide();
        $('#reject-reason-comment-label').hide();
    } else {
        $('#rejected-evidence').prop('checked', true);
        $('#reject-reason').show();
        $('#reject-reason-label').show();
        $('#reject-reason-comment').show();
        $('#reject-reason-comment-label').show();
        var comment = true;
        var rejectReason = rejected.reason.split('|');
        $('#reject-reason > option').each(function () {
            if (this.value == rejectReason[0]) {
                $(this).prop('selected', true);
            } else {
                $(this).prop('selected', false);
            }
        });
        $('#reject-reason-comment').val(rejectReason[1]);
    } 
}

// On claim form, load drug1 and drug2 information
// qualifier: claim.qualifiedBy
function loadDrugsForClaim(qualifier) {

    var existFlag = false; // if annotation has drugID info for drug 1
    $("#Drug1 > option").each(function () {
        if (this.value === qualifier.drug1ID) {
            $(this).prop('selected', true);
            existFlag = true;
        }
    });
    
    //highlight by drug 1 name when drugID not available from annotation
    if (!existFlag && qualifier.drug1 != undefined) {
        $("#Drug1").val(qualifier.drug1 + "_0");
    }
    
    existFlag = false; // if annotation has drugID info for drug 2
    $('#Drug2 > option').each(function () {
        if (this.value === qualifier.drug2ID) {
            $(this).prop('selected', true);
            existFlag = true;
        }
    });
    
    //highlight by drug 2 name when drugID not available from annotation
    if (!existFlag && qualifier.drug2 != undefined) {
        $("#Drug2").val(qualifier.drug2 + "_0");
    }
}

