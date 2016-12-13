"use strict";

var Handlebars = require('handlebars');
var extend = require('backbone-extend-standalone');
var Template = function(){console.log("success");};
var $ = require('jquery');


// JSON fields configuration
// Claim form
var context1 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"quote",
            html: "table",
            options:[],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Drug1: ",
            id:"Drug1",
            html: "table",
            options:[],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Precipitant: ",
            classname: "precipitant",
            id:"drug1precipitant",
            html: "table",
            options:["drug1"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Relationship: ",
            id:"relationship",
            html: "table",
            options:["interact with","inhibits","substrate of"],
            optionsID:["r0","r1","r2"]
        },
        {
            type:"dropdown",
            name:"Method: ",
            id:"method",
            html: "table",
            options:["DDI clinical trial", "Phenotype clinical study", "Case Report", "statement"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Drug2: ",
            id:"Drug2",
            html: "table",
            options:[],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Precipitant: ",
            classname: "precipitant",
            id:"drug2precipitant",
            html: "table",
            options:["drug2"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Enzyme: ",
            id:"enzyme",
            html: "table",
            options:["UNK","cyp1a1","cyp1a2","cyp1b1","cyp2a6","cyp2a13","cyp2b6","cyp2c8","cyp2c9","cyp2c19","cyp2d6","cyp2e1","cyp2j2","cyp3a4","cyp3a5","cyp4a11","cyp2c8","cyp2c9","cyp2c19"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Negation: ",
            classname: "negation",
            id:"negation",
            html: "table",
            options:["supports","refutes"],
            optionsID:[]
        },
        {
            type:"space",
            html: "table",
            name:""
        },
        {
            type:"checkbox",
            name:"Rejected Evidence",
            id:"rejected-evidence",
            html: "table",
            value: "rejectedevidence"
        },
        {
            type:"dropdown",
            name:"Reject Reason: ",
            id:"reject-reason",
            html: "table",
            options:["UNK","DIPS score is too low (less than 5)","Poor Methodology", "Non-relevant evidence item"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Comment: ",
            id: "reject-reason-comment",
            html: "table"
        }
    ]
};

// Data - Number of participants form
var context2 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"participantsquote",
            options:[],
            optionsID:[]
        },
        {
            type: "input",
            name: "Number of Participants: ",
            id: "participants"
        }
    ]
};

// Data - Drug 1 dosage form
var context3 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"dose1quote",
            options:[],
            optionsID:[]
        },
        {
            type: "input",
            name: "Dose in MG: ",
            id: "drug1Dose"
        },
        {
            type:"dropdown",
            name:"Formulation: ",
            id:"drug1Formulation",
            options:["UNK","Oral","IV","transdermal"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Duration in days: ",
            id: "drug1Duration"
        },
        {
            type:"dropdown",
            name:"Regimens: ",
            id:"drug1Regimens",
            options:["UNK","SD","QD","BID", "TID", "QID", "Q12", "Q8", "Q6", "Daily"],
            optionsID:[]
        }
    ]
};

// Data - Drug 2 dosage form
var context4 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"dose2quote",
            options:[],
            optionsID:[]
        },
        {
            type: "input",
            name: "Dose in MG: ",
            id: "drug2Dose"
        },
        {
            type:"dropdown",
            name:"Formulation: ",
            id:"drug2Formulation",
            options:["UNK","Oral","IV","transdermal"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Duration in days: ",
            id: "drug2Duration"
        },
        {
            type:"dropdown",
            name:"Regimens: ",
            id:"drug2Regimens",
            options:["UNK","SD","QD","BID", "TID", "QID", "Q22", "Q8", "Q6", "Daily"],
            optionsID:[]
        },

    ]
};

// Data - Phenotype form 
//(when method is phenotype and relationship is inhibits or substrate of)
var context4b = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"phenotypequote",
            options:[],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Type: ",
            classname: "phenotypeGenre",
            id:"phenotypeGenre",
            options:["Genotype", "Drug Phenotype"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Gene Family: ",
            id:"geneFamily",
            options:["UNK","ALK","BAFF/TNFSF13B","BCR/ABL1","BRAF","CCR5","CFTR","CYB5R1-4","CYP1A2","CYP2C19","CYP2C9","CYP2D6",
            "del (5q)","DPYD","EGFR","ERBB2","ESR1","ESR1, PGR","F2","F5","FIP1L1/PDGFRA","G6PD","GBA","HLA-A","HLA-B",
            "HPRT1","IFNL3","IL2RA","KIT","KRAS","LDLR","MS4A1","NAGS","NAGS, CPS1, ASS1, OTC, ASL, ABL2","NAT1-2","PDGFRB",
            "Ph Chromosome","PML/RARA","POLG","SERPINC1","TNFRSF8","TPMT","UGT1A1","VKORC1"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Marker Drug: ",
            id:"markerDrug",
            options:["UNK"],
            optionsID:[],
            newline:"yes"
        },
        {
            type:"radiobutton",
            name:"Metabolizer: ",
            classname: "phenotypeMetabolizer",
            id:"phenotypeMetabolizer",
            options:["Poor Metabolizer","Extensive Metabolizer", "Ultrarapid Metabolizer"],
            optionsID:[],
            newline:"yes"
        },
        {
            type:"radiobutton",
            name:"Population: ",
            classname: "phenotypePopulation",
            id:"phenotypePopulation",
            options:["Asian","African","Caucasian","Native American"],
            optionsID:[],
            newline:"yes"
        }
    ]
};


// Data - AUC form
var context5 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"aucquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"auc-unchanged-checkbox",
            value: "aucunchanged"
        },
        {
            type: "input",
            name: "AUC ratio: ",
            id: "auc"
        },
        {
            type:"dropdown",
            name:"Type: ",
            id:"aucType",
            options:["UNK","Percent","Fold"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Direction: ",
            id:"aucDirection",
            options:["UNK","Increase","Decrease"],
            optionsID:[]
        }
    ]
};

// Data - CMAX form
var context6 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"cmaxquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"cmax-unchanged-checkbox",
            value: "cmaxunchanged"
        },
        {
            type: "input",
            name: "CMAX: ",
            id: "cmax"
        },
        {
            type:"dropdown",
            name:"Type: ",
            id:"cmaxType",
            options:["UNK","Percent","Fold"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Direction: ",
            id:"cmaxDirection",
            options:["UNK","Increase","Decrease"],
            optionsID:[]
        }
    ]
};


// Data - Clearance form
var context7 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"clearancequote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"clearance-unchanged-checkbox",
            value: "clearanceunchanged"
        },
        {
            type: "input",
            name: "Clearance: ",
            id: "clearance"
        },
        {
            type:"dropdown",
            name:"Type: ",
            id:"clearanceType",
            options:["UNK","Percent","Fold"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Direction: ",
            id:"clearanceDirection",
            options:["UNK","Increase","Decrease"],
            optionsID:[]
        }
    ]
};



// Data - half life form
var context8 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"halflifequote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"halflife-unchanged-checkbox",
            value: "halflifeunchanged"
        },
        {
            type: "input",
            name: "Half life: ",
            id: "halflife"
        },
        {
            type:"dropdown",
            name:"Type: ",
            id:"halflifeType",
            options:["UNK","Percent","Fold"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Direction: ",
            id:"halflifeDirection",
            options:["UNK","Increase","Decrease"],
            optionsID:[]
        }
    ]
};


// Data - evidence supports or refutes
var context9 = {
    questions: [
        {
            type:"radiobutton",
            name:"Evidence: ",
            classname: "evRelationship",
            id:"evRelationship",
            options:["supports","refutes"],
            optionsID:[]
        }
    ]
};

// Data - questions about study type
var context10 = {
    questions: [
        {
            type:"radiobutton",
            name:"Is there group randomization?",
            classname: "grouprandom",
            id:"grouprandom",
            newline: "no",
            options:["yes","no"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Is there parallel group design? ",
            classname: "parallelgroup",
            id:"parallelgroup",
            newline: "no",
            options:["yes","no"],
        },
        {
            type:"button",
            name:"clear",
            classname: "",
            id:"study-type-qs-clear",
        }
    ]
};

// handlerbar - build form1 function
// @inputs: JSON config - context1
// @outputs: form1 in html
Handlebars.registerHelper('buildFormClaim', function(items, options) {
    var out = "";
    //var divHtml = "";
    if (items[0].type == "quote") {
        out += "<div id='" + items[0].id + "' class='claimquoteborder'></div>";
    }
    out += "<table class='clear-user-agent-styles'>";
    for (var i = 1, l=items.length; i<l; i++) {
        
        if (items[i].html == "table") {
            if (((i)%5==0))
                out = out + "<tr>";
            // add label 
            if (items[i].id == "enzyme") 
                out += "<td><strong id='enzymesection1'>" + items[i].name +"</strong></td><td>";
            else if (items[i].id == "drug1precipitant" || items[i].id == "drug2precipitant") 
                out += "<td><strong class='precipitantLabel'>" + items[i].name +"</strong></td><td>";
            else if (items[i].id == "rejected-evidence") {
                out += "<td><input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input></td>";
                out += "<td><strong>" + items[i].name + "</strong></td>";
            } else 
                out = out + "<td><strong id = '" + items[i].id + "-label'>" + items[i].name +"</strong></td><td>";
            // add field element
            if (items[i].type=="radiobutton") {
                if (items[i].classname == "precipitant") { // precipitant radio button (in different row)
                    for (var j = 0, sl = items[i].options.length; j < sl; j++)
                        out = out + "<input type='radio' name='" + items[i].classname + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'></input>";            
                } else { // normal radio button
                    out += "<div id='"+items[i].classname+"div'>";
                    for (var j = 0, sl = items[i].options.length; j < sl; j++)
                        out = out + "&nbsp;&nbsp;<input type='radio' name='" + items[i].classname + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].options[j]+"</input>";
                    out += "</div>";
                }
            } 
            else if (items[i].type=="dropdown") {
                out = out + "<select id='" + items[i].id + "'>";
                for(var j = 0, sl = items[i].options.length; j<sl; j++) {
                    if (items[i].optionsID.length==0)
                        out = out + "<option value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                    else
                        out = out + "<option id='" + items[i].optionsID[j] + "' value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                }
                out = out + "</select>";
            } 
            else if (items[i].type=="textarea") {
            out = out + "<textarea id='" + items[i].id + "' class='" + items[i].id + "'></textarea>";
            }
            else if(items[i].type=="input") {
                out += "<input style='width:120px;height=11px;' type='text' id='"+items[i].id+"'>";
            }
            
            out = out + "</td>";

            if(((i+1)%5==0))
                out = out + "</tr>";
        } 
    }
    out +="</table>";
    
    return out;
});
/*
Handlebars.registerHelper('buildFormDataPheno', function(items, options) {
    var out = "";
    for(var i=0, l=items.length; i<l; i++) {
        if (items[i].type == "quote") {
            out += "<div id='" + items[i].id + "' class='dataquoteborder'></div><table>";
        }
        else {
            out += "<tr>";
            if (items[i].type != "button")
                out += "<td><strong id='"+ items[i].id +"-label'>" + items[i].name +"</strong></td>";
            if (items[i].type=="radiobutton") {
                for (var j = 0, sl = items[i].options.length; j < sl; j++) {
                    out = out + "<td><input type='radio' name='" + items[i].classname + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].options[j]+"</input></td>";
                }
                if (items[i].newline == "yes")
                    out += "<br>";
                else if (items[i].newline == "no")
                    out += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            } 
            out += "</tr>";
        }
    }
    out += "</table>"
    return out;
});
*/

Handlebars.registerHelper('buildFormData', function(items, options) {
    var out = "";
    for(var i=0, l=items.length; i<l; i++) {
        if (items[i].type == "quote") {
            out += "<div id='" + items[i].id + "' class='dataquoteborder'></div>";
        }
        else {
            if (items[i].type != "button") {
                if (items[i].type == "radiobutton") {
                    out += "&nbsp;&nbsp;<strong id='"+ items[i].id +"-label'>" + items[i].name +"</strong>";
                } else {
                    out += "&nbsp;&nbsp;<strong id='"+ items[i].id +"-label'>" + items[i].name +"</strong>";
                }
            }

            if(items[i].type=="text")
                out += "<strong id='"+items[i].id+"'></strong><br>";
            else if(items[i].type=="input")
                out += "<input style='width:30px;' type='text' id='"+items[i].id+"'>";
            else if (items[i].type=="dropdown") {
                out = out + "<select id='" + items[i].id + "'>";
                for(var j = 0, sl = items[i].options.length; j<sl; j++) {
                    if(items[i].optionsID.length==0)
                        out = out + "<option value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                    else
                        out = out + "<option id='" + items[i].optionsID[j] + "' value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                }
                out = out + "</select>";
            }
            else if (items[i].type=="radiobutton") {
                for (var j = 0, sl = items[i].options.length; j < sl; j++) {
                    out += "<input type='radio' name='" + items[i].id + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].options[j];
                    out += "</input>";
                }
            } 
            else if (items[i].type=="checkbox") {
                out += "<input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input>";                    
            }
            else if (items[i].type=="button") {
                if (items[i].id == "study-type-qs-clear")
                    out += "<a onclick='clearStudyTypeQuestions()' id=" +items[i].id+ ">Clear</a>";                
            }
            if (items[i].newline == "yes")
                    out += "<br>";
            else if (items[i].newline == "no")
                out += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }
    }
    return out;
});

// Claim
var source = "{{#buildFormClaim questions}}{{/buildFormClaim}}";
var template = Handlebars.compile(source);
var form1 = template(context1);

// Data - number of participants
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form2 = template(context2);

// Data - dosage 1
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form3 = template(context3);

// Data - dosage 2
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form4 = template(context4);

// Data - phenotype
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form4b = template(context4b);

// Data - auc
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form5 = template(context5);

// Data - cmax
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form6 = template(context6);

// Data - cl
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form7 = template(context7);

// Data - half life
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form8 = template(context8);

// Data - evidence relationship
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form9 = template(context9);

// Data - study type questions
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var form10 = template(context10);

Template.content = [

    // '<div class="annotator-outer annotator-editor annotator-invert-y annotator-invert-x">',
    // '<form class="annotator-widget">',   // editor is not widget
    '<form class="annotator-editor-form">',
    // '<ul class="annotator-listing"></ul>',
    // '<div class="annotationbody" style="margin-left:35px;margin-right:0px;height:100%;line-height:200%;margin-top:0px;overflow-y: hidden">',
    '<div class="annotationbody" style="margin-left:20px;margin-right:20px;height:100%;margin-top:0px;overflow-y: hidden">',
    '<div id="tabs">',
    '<div id="tabs-1" style="margin-bottom:0px;">',

    // current claim label
    '<div id="claim-label-data-editor" style="display: none;"></div>',

    // links 
    '<div id="mp-data-nav" style="display: none;">',
    '<button id="nav-evRelationship-btn" type="button" onclick="switchDataForm(\'evRelationship\')" >Ev relationship</button> &nbsp;->&nbsp;',
    '<button id="nav-participants-btn" type="button" onclick="switchDataForm(\'participants\')" >Participants</button> &nbsp;->&nbsp;',
    '<button id="nav-dose1-btn" type="button" onclick="switchDataForm(\'dose1\')" >Drug 1 Dose</button> &nbsp;->&nbsp;',
    '<button id="nav-dose2-btn" type="button" onclick="switchDataForm(\'dose2\')" >Drug 2 Dose</button>&nbsp;->&nbsp;',
    '<button id="nav-phenotype-btn" type="button" onclick="switchDataForm(\'phenotype\')" >Phenotype</button>&nbsp;->&nbsp;',
    '<button id="nav-auc-btn" type="button" onclick="switchDataForm(\'auc\')" >Auc ratio</button> &nbsp;->&nbsp;',
    '<button id="nav-cmax-btn" type="button" onclick="switchDataForm(\'cmax\')" >Cmax</button> &nbsp;->&nbsp;',
    '<button id="nav-clearance-btn" type="button" onclick="switchDataForm(\'clearance\')" >Clearance</button> &nbsp;->&nbsp;',
    '<button id="nav-halflife-btn" type="button" onclick="switchDataForm(\'halflife\')" >Half-life</button>&nbsp;->&nbsp;',
    '<button id="nav-studytype-btn" type="button" onclick="switchDataForm(\'studytype\')" >study type</button>',
    '</div>',

    // Claim form
    '<div id="mp-claim-form" style="display: none;">',
    form1,
    '</div>',
    
    // Data & material - Num of Participants
    '<div id="mp-data-form-participants" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form2,
    '</div>',

    // Data & material - Drug1 Dosage
    '<div id="mp-data-form-dose1" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form3,
    '</div>',

    // Data & material - Drug2 Dosage
    '<div id="mp-data-form-dose2" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form4,
    '</div>',

    // Data & material - phenotype
    '<div id="mp-data-form-phenotype" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form4b,
    '</div>',

    // Data & material - AUC
    '<div id="mp-data-form-auc" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form5,
    '</div>',

    // Data & material - CMAX
    '<div id="mp-data-form-cmax" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form6,
    '</div>',

    // Data & material - Clearance
    '<div id="mp-data-form-clearance" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form7,
    '</div>',

    // Data & material - half life
    '<div id="mp-data-form-halflife" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form8,
    '</div>',

    // Data & material - evidence relationship
    '<div id="mp-data-form-evRelationship" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form9,
    '</div>',

    // Data & material - questions about study type
    '<div id="mp-data-form-studytype" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    form10,
    '</div>',
    
    '</div>',
    '</div>',
    '</div>',
    '    <div class="annotator-controls1">',
    '     <button class="annotator-cancel" onclick="exitEditorToAnnTable()" id="annotator-cancel">Cancel</button>',
    '     <button class="annotator-delete" id="annotator-delete">Delete</button>',
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
    '     <button class="annotator-save annotator-focus">Save</button>',
    '     <button class="annotator-save-close" id="annotator-save-close">Save and Close</button>',
    '    </div>',
    '<div class="form-validation-alert" style="display: none;">',
    '   <strong>Error submitting the form!</strong> Please complete all the red fields.',
    '</div>',
    '  </form>',
    // '</div>'
].join('\n');


Template.extend = extend;
exports.Template = Template;
