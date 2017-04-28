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
            type:"checkbox",
            name:"Enantiomer: ",
            classname: "enantiomer",
            id:"drug1enantiomer",
            html: "table",
            options:["drug1"],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"Metabolite: ",
            classname: "metabolite",
            id:"drug1metabolite",
            html: "table",
            options:["drug1"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Relationship: ",
            id:"relationship",
            html: "table",
            options:["interact with","inhibits","substrate of","has metabolite","controls formation of","inhibition constant"],
            optionsID:["r0","r1","r2"]
        },
        {
            type:"dropdown",
            name:"Method: ",
            id:"method",
            html: "table",
            options:["DDI clinical trial", "Phenotype clinical study", "Case Report", "Statement", "Experiment"],
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
            type:"checkbox",
            name:"Enantiomer: ",
            classname: "enantiomer",
            id:"drug2enantiomer",
            html: "table",
            options:["drug1"],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"Metabolite: ",
            classname: "metabolite",
            id:"drug2metabolite",
            html: "table",
            options:["drug1"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Enzyme/Protein: ",
            id:"enzyme",
            html: "table",
            options:["UNK","cyp1a1","cyp1a2","cyp1b1","cyp2a6","cyp2a13","cyp2b6","cyp2c8","cyp2c9","cyp2c19","cyp2d6","cyp2e1","cyp2j2","cyp3a4","cyp3a5","cyp4a11","cyp2c8","cyp2c9","cyp2c19","OATP1B1","OATP1B3","P_Glycoprotein","SLCO1B1"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Negate this claim: ",
            classname: "negation",
            id:"negation",
            html: "table",
            options:["Yes","No"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Object metabolite: ",
            id:"object-metabolite",
            html: "table",
            options:[],
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
            value: "rejectedevidence"
        },
        {
            type:"dropdown",
            name:"Reject Reason: ",
            id:"reject-reason",
            options:["UNK","DIPS score is too low (less than 5)","Poor Methodology", "Non-relevant evidence item"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Comment: ",
            id: "reject-reason-comment"
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
            options:["UNK","Oral","IV","transdermal", "IM"],
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
            options:["UNK","Oral","IV","transdermal","IM"],
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
            "Ph Chromosome","PML/RARA","POLG","SERPINC1","SLC01B1","TNFRSF8","TPMT","UGT1A1","VKORC1"],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Marker Drug: ",
            id:"markerDrug",
            options:["UNK"],
            optionsID:[],
            newline:"no"
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
            optionsLabel: ["supports", "challenges"],
            optionsID:[]
        }
    ]
};

// Data - questions about evidence type
var context10 = {
    questions: [
        {
            type:"dropdown",
            name:"Method:        ",
            id:"evidencetype-method",
            options:["DDI clinical trial", "Phenotype clinical study", "Case Report", "Statement", "Experiment"],
            optionsID:[],
            newline: "yes",
            isTable: true
        },
        {
            type:"radiobutton",
            name:"Is there group randomization?",
            classname: "grouprandom",
            id:"grouprandom",
            newline: "yes",
            options:["yes","no"],
            optionsID:[],
            isTable: true
        },
        {
            type:"radiobutton",
            name:"Is there parallel group design?",
            classname: "parallelgroup",
            id:"parallelgroup",
            newline: "yes",
            options:["yes","no"],
            optionsID:[],
            isTable: true
        },
        {
            type:"button",
            name:"clear",
            classname: "",
            id:"study-type-qs-clear",
        }
    ]
};

//DIPS score reviewer
var reviewer = {
    questions: [
        {
            type:"radiobutton",
            name:"Reviewer: ",
            classname: "dips-reviewer",
            id:"dips-reviewer",
            newline: "no",
            options:["Author","External"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Date: ",
            id: "datepicker",
            newline: "no"
        },
        {
            type: "hint",
            name: "(Format: 'mm/yyyy' or 'dd/mm/yyyy')",
            id: "dateHint",
            newline: "yes"
        },
        {
            type:"checkbox",
            name:"question scores not provided: ",
            id:"author-lackscore",
            html: "table",
            value: "author-lackscore",
            newline: "no"
        },
        {
            type: "input",
            name: "Total Score: ",
            id: "author-total",
            newline: "yes"
        }
    ]
};

//DIPS score questions:
var questionList = {
    questions: [
        {
            type:"radiobutton",
            name:"Q1. Are there previous credible reports in humans?",
            hint: [
                   "If there are case reports or prospective studies that clearly provide evidence supporting the interaction, answer YES. For case reports, at least one case should have a “possible” DIPS rating (score of 2 or higher). ",
                   "If a study appropriately designed to test for the interaction shows no evidence of an interaction, answer NO.",
                   "If no other studies or case reports exist, answer NA (not applicable)."
            ],
            classname: "dips-q1",
            id:"dips-q1",
            newline: "yes",
            options:["Yes","No","NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q2. Is the interaction consistent with known interactive properties of the precipitant drug?",
            hint: [
                    "Assess the mechanism of the interaction and know the properties of the precipitant drug to properly answer this question.",
                    "If the interaction is consistent with known properties of the precipitant drug, answer YES.",
                    "For example, there are data that support that the precipitant drug is an inhibitor of a metabolic pathway responsible for the metabolism of the object drug.",
                    "Although lists of enzyme inhibitors are now common, caution is necessary when evaluating in vitro evidence of enzyme inhibition due to the potential differences in precipitant drug concentrations compared with in vivo values.",
                    "If the interaction is inconsistent with known properties of the precipitant drug, answer NO",
                    "If you are unsure of the precipitant drug properties or data are insufficient to evaluate whether the interaction is consistent with the precipitant properties, answer Unk."
            ],
            classname: "dips-q2",
            id:"dips-q2",
            newline: "yes",
            options:["Yes","No","UNK"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q3. Is the interaction consistent with known interactive properties of the object drug?",
            hint: [
                    "You need to understand the pharmacokinetic and pharmacologic properties of the object drug to adequately answer this question.",
                    "Pharmacokinetic properties to consider are routes of elimination, percentage of total metabolism via each elimination pathway, transporting proteins involved, extent of first-pass metabolism, genetic polymorphism that affects the disposition and pharmacodynamic response, physiological events (e.g., inflammatory responses) that affect the activities of the primary enzyme/transport protein,",
                    "Pharmacologic properties to consider are receptor polymorphism and potential effects of concurrent diseases.",
                    "Answering this question based on an incomplete understanding of the object drug can lead to incorrect assessment of causation. Adverse reactions occurring with drugs whose pharmacodynamic responses are affected by many factors (eg, warfarin) are more likely to be mislabeled as interactions. If the potential interaction is not consistent with known properties of the object drug, answer the question NO.",
                    "If unsure of the object drug properties or data are insufficient to evaluate whether the interaction is consistent with the object drug properties and known possible effects of the precipitant drug, answer Unk or NA. The case evaluator must know the properties of the object drug to properly answer this question."
            ],
            classname: "dips-q3",
            id:"dips-q3",
            newline: "yes",
            options:["Yes","No","UNK/NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q4. Is the event consistent with the known or reasonable time course of the interaction (onset and/or offset)?",
            hint: [
                    "The time course of drug interactions is usually quite predictable.",
                    "The half-life of the precipitant drug will provide an estimate of the length of time for maximum inhibition to occur, and the inhibited half-life of the object drug will indicate when the maximum change in object drug concentration can be expected. If the time to the onset of the interaction does not fit with the properties of the drugs, one should look for an alternative reason for the interaction. If the interaction time course is inconsistent with what would be expected, answer NO.",
                    "If unable to estimate expected time course or insufficient data are available to assess the time course, answer Unk or NA."
            ],
            classname: "dips-q4",
            id:"dips-q4",
            newline: "yes",
            options:["Yes","No","UNK/NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q5. Did the interaction remit upon de-challenge of the precipitant drug with no change in the object drug?  (if no de-challenge, use Unknown or NA and skip Question 6)",
            hint: [
                    "Stopping the precipitant drug should bring about resolution of the interaction, even if the object drug is continued without change. Often, the response to a potential interaction is the discontinuation of both the object and precipitant drugs. While the clinical situation may demand such action, changing the dosage of the object drug limits the ability to assess the potential role of the precipitant drug. However, a positive dechallenge of the precipitant drug is an important indication that the interaction was related to the administration of the precipitant drug. If precipitant drug dechallenge without change in object drug produces no change in the interaction, alternative causes for the alteration in the object drug are likely. The evaluator should also consider changes in other factors including disease activity, diet, or other drugs that may occur simultaneously with dechallenge of the precipitant drug and affect the object drug. If the doses of both medications are changed, dechallenge cannot be assessed.",
                    "If dechallenge of the precipitant drug without a change in object drug did not result in remission of the interaction, answer NO.",
                    "If no dechallenge occurred, the doses of both drugs were altered, or no information on dechallenge is provided, answer NA."
            ],
            classname: "dips-q5",
            id:"dips-q5",
            newline: "yes",
            options:["Yes","No","NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q6. Did the interaction reappear when the precipitant drug was re-administered with continued use of object drug?",
            hint: [
                    "A positive rechallenge with the precipitant drug is a strong indicator of causation. Concerns for patient safety often preclude rechallenge, but occasional reports of deliberate or inadvertent rechallenge have appeared.",
                    "Rechallenges done with appropriate patient monitoring will be unlikely to result in adverse outcomes. If the precipitant drug was readministered in the presence of the object drug and no interaction occurred, answer NO.",
                    "If no rechallenge with the precipitant drug was attempted or no data were provided, answer Unk or NA."
            ],
            classname: "dips-q6",
            id:"dips-q6",
            newline: "yes",
            options:["Yes","No","UNK/NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q7. Are there reasonable alternative causes?",
            hint: [
                    "Consider clinical conditions, other interacting drugs, lack of adhrence, risk factor. A NO answer presumes that enough information was presented so that one would expect any alternative causes to be mentioned. When in doubt, use Unknown or NA.",
                    "This is perhaps the most difficult question in the DIPS to answer. Assessing alternative causes requires knowledge of the object and precipitant drugs, other agents the patient may be taking, the potential influence of disease states, adherence to drug regimens, and the presence of other risk factors that might alter drug pharmacokinetics or pharmacodynamics. Failure to assess alternative causes for observed effects is one of the most common shortcomings of drug interaction evaluations. It occurs frequently in the clinical setting and can often be detected in published case reports. Limited drug knowledge, combined with a preconceived notion of the cause of a potential interaction, merge to prevent adequate assessment of alternative explanations for the observed outcome.",
                    "Answer this question NO only if you are confident that no other reasonable causes exist.",
                    "If unsure, answer Unk or NA."
            ],
            classname: "dips-q7",
            id:"dips-q7",
            newline: "yes",
            options:["Yes","No","UNK/NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q8. Was the object drug detected in the blood or other fluids in concentrations consistent with the interaction?",
            hint: [
                    "This question assesses the relationship between the expected outcome of the interaction and measured outcomes. For example, if one suspects an inhibition of object drug metabolism, measured concentrations should reflect decreased clearance.",
                    "If object drug concentrations are not consistent with the interaction, answer NO.",
                    "If object drug concentrations are not measured, answer NA. Pharmacodynamic drug interactions generally do not involve a change in object drug concentrations, so the response to this question would be NA for such interactions."
            ],
            classname: "dips-q8",
            id:"dips-q8",
            newline: "yes",
            options:["Yes","No","UNK/NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q9. Was the drug interaction confirmed by objective evidence consistent with the effects on the object drug (other than from question 8)?",
            hint: [
                    "Objective evidence of the interaction could be clinical evidence such as changed physiological parameters or an adverse reaction that is consistent with the known pharmacology of the object drug. The answer to this question may reflect the magnitude of the interaction, since drugs with broad therapeutic windows may not demonstrate easily measured changes in patient response in the presence of altered plasma concentrations.",
                    "Assessment of pharmacodynamics interactions will occur here.",
                    "If response to the object drug was assessed but no changed was observed, answer NO.",
                    "If no assessment was made or reported, answer NA."
            ],
            classname: "dips-q9",
            id:"dips-q9",
            newline: "yes",
            options:["Yes","No","NA"],
            optionsID:[]
        },
        {
            type:"radiobutton",
            name:"Q10. Was the interaction greater when the precipitant drug dose was increased or less when the precipitant drug dose was decreased?",
            hint: [
                    "This question simply assesses the effect of the precipitant drug dose on the magnitude of the interaction.",
                    "While data are not often available to answer this question, when the dose–response relationship can be assessed, it provides important insight to causation. This is particularly important for inhibitors that exhibit variable inhibitory properties at different doses/serum concentration.",
                    "Answer NO if precipitant drug doses are changed without a change in object drug response.",
                    "If the effect of precipitant drug dose changes on the object drug was not assessed, answer NA."
            ],
            classname: "dips-q10",
            id:"dips-q10",
            newline: "yes",
            options:["Yes","No","NA"],
            optionsID:[]
        }
    ]
};

// Experiment Data - Cell System form
var cellSystem = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"cellSystemquote",
            options:[],
            optionsID:[]
        },
        {
            type:"dropdown",
            name:"Cell System: ",
            id:"cellSystem",
            options:["Not available", "Baculovirus-insect cells", "BC2 cell line", "Caco-2 Cells", "CHO transfected cells", "Cryopreserved Hepatocytes", "E.coli", "Fa2N-4 cell line", "HEK293 transfected cells", "HeLa transfected cells", "HepaRG cell line", "HepG2 cell line", "HepG2 transfected cells", "Human cryopreserved hepatocytes", "Human freshly isolated hepatocytes", "Human intestine cytosolic fraction", "Human intestine S9 fraction", "Human liver cytosolic fraction", "Human liver S9 fraction", "Individual human intestinal microsomes", "Individual Human liver microsomes", "Inside-out Membrane Vesicles", "Intestinal Epithelial Cells", "LLC-PK1 transfected cells", "MDCK transfected cells", "Pooled human intestinal microsomes", "Pooled Human liver microsomes", "Primary Hepatocytes", "Recombinant Enzyme System(NOS)", "Sandwich Cultured Hepatocytes", "siRNA Knock-out Caco-2 Cells", "siRNA Knock-out Hepatocytes", "siRNA Knock-out Other Cells", "Transgenic animal hepatocytes", "Transgenic Animal Model", "X.laevis Oocytes injected", "Yeast"],
            optionsID:[]
        }
    ]
};

// Experiment Data - Metabolite Rate with precipitant
var rateWith = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"rateWithquote",
            options:[],
            optionsID:[]
        },
        {
            type: "input",
            name: "Metabolite rate with precipitant (µL/min/mg): ",
            id: "rateWithVal"
        }
    ]
};

// Experiment Data - Metabolite Rate without precipitant
var rateWithout = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"rateWithoutquote",
            options:[],
            optionsID:[]
        },
        {
            type: "input",
            name: "Metabolite rate without precipitant (µL/min/mg): ",
            id: "rateWithoutVal"
        }
    ]
};

// Experiment Data - CLint total
var cl = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"clquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"cl-unchanged-checkbox",
            value: "clunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"clUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol P450","pmol/min/pmol P450","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "clValue"
        }
    ]
};

// Experiment Data - Vmax
var vmax = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"vmaxquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"vmax-unchanged-checkbox",
            value: "vmaxunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"vmaxUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol P450","pmol/min/pmol P450","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "vmaxValue"
        }
    ]
};

// Experiment Data - km
var km = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"kmquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"km-unchanged-checkbox",
            value: "kmunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"kmUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol P450","pmol/min/pmol P450","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "kmValue"
        }
    ]
};

// Experiment Data - inhibition
var inhibition = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"inhibitionquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"inhibition-unchanged-checkbox",
            value: "inhibitionunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"inhibitionUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol P450","pmol/min/pmol P450","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "inhibitionValue"
        }
    ]
};

// Experiment Data - ki
var ki = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"kiquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"ki-unchanged-checkbox",
            value: "kiunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"kiUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol","pmol/min/pmol","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "kiValue"
        }
    ]
};

// Experiment Data - k(inact)
var kinact = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"kinactquote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"kinact-unchanged-checkbox",
            value: "kinactunchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"kinactUnit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol","pmol/min/pmol","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "kinactValue"
        }
    ]
};

// Experiment Data - IC(50)
var ic50 = {
    questions: [
        {
            type:"quote",
            name:"Quote: ",
            id:"ic50quote",
            options:[],
            optionsID:[]
        },
        {
            type:"checkbox",
            name:"unchanged: ",
            id:"ic50-unchanged-checkbox",
            value: "ic50unchanged"
        },
        {
            type:"dropdown",
            name:"Unit: ",
            id:"ic50Unit",
            options:["UNK","%","min(-1)","µM","nM","μmol/L","μL/min/pmol","pmol/min/pmol","microliters/min/mg"],
            optionsID:[]
        },
        {
            type: "input",
            name: "Value: ",
            id: "ic50Value"
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
            if (((i)%7==0))
                out = out + "<tr>";
            // add label 
            if (items[i].id == "enzyme") 
                out += "<td><strong id='enzymesection1'>" + items[i].name +"</strong></td><td>";
            else if (items[i].id == "drug1precipitant" || items[i].id == "drug2precipitant") 
                out += "<td><strong class='precipitantLabel'>" + items[i].name +"</strong>";
            else if (items[i].id == "rejected-evidence") {
                out += "<td><input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input></td>";
                out += "<td><strong>" + items[i].name + "</strong></td>";
            } else if (items[i].type=="checkbox"){
                out += "<td><strong id='"+items[i].id+"Label'>" + items[i].name + "</strong></td>";
                out += "<td><input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input></td>";
            } else {
                out = out + "<td><strong id = '" + items[i].id + "-label'>" + items[i].name +"</strong></td><td>";
            }
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
                if (items[i].id == "Drug1" || items[i].id == "Drug2") {
                    out += "<input style='width:110px;height=11px;display:none;float:left;' type='text' id='"+items[i].id+"-input'>";
                    out += "<img id='edit" + items[i].id + "' src='img/edit-button.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;'>";
                    out += "<img id='commit" + items[i].id + "' src='img/check.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;display:none;'>";
                } else if (items[i].id == "object-metabolite") {
                    out += "<input style='width:110px;height=11px;display:none;float:left;' type='text' id='"+items[i].id+"-input'>";
                    out += "<img id='edit-" + items[i].id + "' src='img/edit-button.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;'>";
                    out += "<img id='commit-" + items[i].id + "' src='img/check.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;display:none;'>";
                }
            } else if (items[i].type=="textarea") {
                out = out + "<textarea id='" + items[i].id + "' class='" + items[i].id + "'></textarea>";
            } else if(items[i].type=="input") {
                out += "<input style='width:120px;height=11px;' type='text' id='"+items[i].id+"'>";
            }
            
            out = out + "</td>";

            if(((i+1)%7==0))
                out = out + "</tr>";
        } else {
            if (items[i].id == "rejected-evidence") {
                out +="</table>";
                out += "<input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input>";
                out += "<strong>" + items[i].name + "</strong>";
            } else if (items[i].type=="dropdown") {
                out += "<strong id = '" + items[i].id + "-label'>" + items[i].name +"</strong>";
                out += "<select id='" + items[i].id + "'>";
                for(var j = 0, sl = items[i].options.length; j<sl; j++) {
                    if (items[i].optionsID.length==0)
                        out += "<option value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                    else
                        out += "<option id='" + items[i].optionsID[j] + "' value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                }
                out = out + "</select>";
            } else {
                out += "<strong id = '" + items[i].id + "-label'>" + items[i].name +"</strong>";
                out += "<input style='width:120px;height=11px;' type='text' id='"+items[i].id+"'>";
            }
        }
    }
    
    
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
            else if(items[i].type=="input") {
                if (items[i].id == "datepicker") {
                    out += "<input style='width:80px; height:20px;' type='text' id='"+items[i].id+"'>";
                } else if (items[i].id == "evidence-type") {
                    out += "<input style='width:220px; height:15px;' type='text' id='"+items[i].id+"'>";
                } else {
                    out += "<input style='width:30px; height:20px;' type='text' id='"+items[i].id+"'>";
                }
            } else if (items[i].type=="dropdown") {
                out = out + "<select id='" + items[i].id + "'>";
                for(var j = 0, sl = items[i].options.length; j<sl; j++) {
                    if(items[i].optionsID.length==0)
                        out = out + "<option value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                    else
                        out = out + "<option id='" + items[i].optionsID[j] + "' value='" + items[i].options[j] + "'>" + items[i].options[j] + "</option>";
                }
                out = out + "</select>";
                if (items[i].name == "Unit: ") {
                    out += "<input style='width:110px;height=11px;display:none;' type='text' id='"+items[i].id+"-input'>";
                    out += "<img id='edit-" + items[i].id + "' src='img/edit-button.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;'>";
                    out += "<img id='commit-" + items[i].id + "' src='img/check.png' style='margin-right:10px;margin-top:5px;width:16px;height:16px;display:none;'>";
                }
            }
            else if (items[i].type=="radiobutton") {
                if (items[i].classname == "evRelationship") {
                    for (var j = 0, sl = items[i].options.length; j < sl; j++) {
                        out += "<input type='radio' name='" + items[i].id + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].optionsLabel[j];
                        out += "&nbsp&nbsp</input>";
                    }
                } else {
                    for (var j = 0, sl = items[i].options.length; j < sl; j++) {
                        out += "<input type='radio' name='" + items[i].id + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].options[j];
                        out += "&nbsp&nbsp</input>";
                    }
                }
            } 
            else if (items[i].type=="checkbox") {
                out += "<input type='checkbox' id='" + items[i].id + "' value='" + items[i].value + "'></input>";                    
            }
            else if (items[i].type=="button") {
                if (items[i].id == "evidence-type-qs-clear" || items[i].id == "generate-evidence-type") {
                    out += "<button onclick='clearStudyTypeQuestions()' id=" +items[i].id+ ">" + items[i].name + "</button>";   
                } else if (items[i].id == "study-type-qs-clear") {
                    out += "<a onclick='clearStudyTypeQuestions()' id=" +items[i].id+ ">Clear</a>";
                } else {
                    out += "<a onclick='' id=" +items[i].id+ ">" + items[i].name + "</a>"; 
                }
            }

            if (items[i].newline == "yes")
                    out += "<br>";
            else if (items[i].newline == "no")
                out += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }
    }
    return out;
});

Handlebars.registerHelper('buildFormDIPS', function(items, options) {
    var out = "";
    for(var i=0, l=items.length; i<l; i++) {
        out += '<div id="mp-data-form-q' + (i+1) + '" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">';
        //radio button
        out += "<strong id='"+ items[i].id +"-label'>" + items[i].name +"</strong>";
        out += "&nbsp<a href='#' title='" + items[i].hint.join("\n") + "'>Hint</a>"
        out += "<br>";
        for (var j = 0, sl = items[i].options.length; j < sl; j++) {
            out += "<input type='radio' name='" + items[i].id + "' id='" + items[i].id + "' value='" + items[i].options[j] + "'>"+items[i].options[j];
            out += "&nbsp&nbsp</input>";
        }
        out += '</div>';
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

// DIPS - reviewer
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formReviewer = template(reviewer);

//DIPS - questionList
source = "{{#buildFormDIPS questions}}{{/buildFormDIPS}}";
template = Handlebars.compile(source);
var formQuestion = template(questionList);

// Experiment - cellSystem
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formCellSystem = template(cellSystem);

// Experiment - rateWith
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formRateWith = template(rateWith);

// Experiment - rateWithout
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formRateWithout = template(rateWithout);

// Experiment - cl
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formCl = template(cl);

// Experiment - vmax
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formVmax = template(vmax);

// Experiment - km
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formKm = template(km);

// Experiment - ki
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formKi = template(ki);

// Experiment - inhibition
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formInhibition = template(inhibition);

// Experiment - kinact
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formKinact = template(kinact);

// Experiment - ic50
source = "{{#buildFormData questions}}{{/buildFormData}}";
template = Handlebars.compile(source);
var formIc50 = template(ic50);

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
    '<button id="nav-dose2-btn" type="button" onclick="switchDataForm(\'dose2\')" >Drug 2 Dose</button>',
    '<button id="nav-phenotype-btn" type="button" onclick="switchDataForm(\'phenotype\')" >Phenotype</button>&nbsp;->&nbsp;',
    '<button id="nav-auc-btn" type="button" onclick="switchDataForm(\'auc\')" >Auc ratio</button> &nbsp;->&nbsp;',
    '<button id="nav-cmax-btn" type="button" onclick="switchDataForm(\'cmax\')" >Cmax</button> &nbsp;->&nbsp;',
    '<button id="nav-clearance-btn" type="button" onclick="switchDataForm(\'clearance\')" >Clearance</button> &nbsp;->&nbsp;',
    '<button id="nav-halflife-btn" type="button" onclick="switchDataForm(\'halflife\')" >Half-life</button>&nbsp;->&nbsp;',
    '<button id="nav-studytype-btn" type="button" onclick="switchDataForm(\'studytype\')" >Evidence Type</button>',
    '</div>',

    '<div id="mp-dips-nav" style="display: none;">',
    '<button id="nav-reviewer-btn" type="button" onclick="switchDataForm(\'reviewer\')" >Reviewer</button> &nbsp;->&nbsp;',
    '<button id="nav-dose1-btn" type="button" onclick="switchDataForm(\'dose1\')" >Drug 1 Dose</button> &nbsp;->&nbsp;',
    '<button id="nav-dose2-btn" type="button" onclick="switchDataForm(\'dose2\')" >Drug 2 Dose</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q1-btn" type="button" onclick="switchDataForm(\'q1\')" >Q1</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q2-btn" type="button" onclick="switchDataForm(\'q2\')" >Q2</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q3-btn" type="button" onclick="switchDataForm(\'q3\')" >Q3</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q4-btn" type="button" onclick="switchDataForm(\'q4\')" >Q4</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q5-btn" type="button" onclick="switchDataForm(\'q5\')" >Q5</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q6-btn" type="button" onclick="switchDataForm(\'q6\')" >Q6</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q7-btn" type="button" onclick="switchDataForm(\'q7\')" >Q7</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q8-btn" type="button" onclick="switchDataForm(\'q8\')" >Q8</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q9-btn" type="button" onclick="switchDataForm(\'q9\')" >Q9</button> &nbsp;->&nbsp;',
    '<button class="dipsQuestion" id="nav-q10-btn" type="button" onclick="switchDataForm(\'q10\')" >Q10</button>',
    '</div>',

    '<div id="mp-experiment-nav" style="display: none;">',
    '<button id="nav-evRelationship-btn" type="button" onclick="switchDataForm(\'evRelationship\')" >Ev relationship</button> &nbsp;->&nbsp;',
    '<button id="nav-cellSystem-btn" type="button" onclick="switchDataForm(\'cellSystem\')" >Cell System</button> &nbsp;->&nbsp;',
    '<button id="nav-cl-btn" type="button" onclick="switchDataForm(\'cl\')" >CL<sub>int total</sub></button> &nbsp;->&nbsp;',
    '<button id="nav-vmax-btn" type="button" onclick="switchDataForm(\'vmax\')" >V<sub>max</sub></button> &nbsp;->&nbsp;',
    '<button id="nav-km-btn" type="button" onclick="switchDataForm(\'km\')" >K<sub>m total</sub></button> &nbsp;->&nbsp;',
    '<button id="nav-ki-btn" type="button" onclick="switchDataForm(\'ki\')" >Ki<sub>total</sub></button> &nbsp;->&nbsp;',
    '<button id="nav-inhibition-btn" type="button" onclick="switchDataForm(\'inhibition\')" >%Inhibition</button> &nbsp;->&nbsp;',
    '<button id="nav-kinact-btn" type="button" onclick="switchDataForm(\'kinact\')" >K(inact)</button> &nbsp;->&nbsp;',
    '<button id="nav-ic50-btn" type="button" onclick="switchDataForm(\'ic50\')" >IC(50)</button> &nbsp;->&nbsp;',
    '<button id="nav-rateWith-btn" type="button" onclick="switchDataForm(\'rateWith\')" >Metabolite rate with precipitant</button> &nbsp;->&nbsp;',
    '<button id="nav-rateWithout-btn" type="button" onclick="switchDataForm(\'rateWithout\')" >Metabolite rate without precipitant</button> <span id = "rateWithoutArrow">&nbsp;->&nbsp;</span>',
    '<button id="nav-studytype-btn" type="button" onclick="switchDataForm(\'studytype\')" >Evidence Type</button>',
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

    // DIPS - reviewer
    '<div id="mp-data-form-reviewer" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formReviewer,
    '</div>',

    // DIPS - question
    formQuestion,

    // Experiment - cellSystem
    '<div id="mp-data-form-cellSystem" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formCellSystem,
    '</div>',

    // Experiment - rateWith
    '<div id="mp-data-form-rateWith" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formRateWith,
    '</div>',

    // Experiment - rateWithout
    '<div id="mp-data-form-rateWithout" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formRateWithout,
    '</div>',

    // Experiment - cl
    '<div id="mp-data-form-cl" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formCl,
    '</div>',

    // Experiment - vmax
    '<div id="mp-data-form-vmax" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formVmax,
    '</div>',

    // Experiment - km
    '<div id="mp-data-form-km" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formKm,
    '</div>',

    // Experiment - ki
    '<div id="mp-data-form-ki" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formKi,
    '</div>',

    // Experiment - inhibition
    '<div id="mp-data-form-inhibition" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formInhibition,
    '</div>',

    // Experiment - kinact
    '<div id="mp-data-form-kinact" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formKinact,
    '</div>',

    // Experiment - ic50
    '<div id="mp-data-form-ic50" style="margin-top:7px;margin-buttom:7px;margin-left:25px;display: none;">',
    formIc50,
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
