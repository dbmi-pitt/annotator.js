"use strict";

var extend = require('backbone-extend-standalone');
var Template = function(){console.log("success");};
Template.content = [
  //'<script src="./js/backups/jquery-1.11.1.min.js"></script>',
  //'<script>function() {$( "#tabs" ).tabs();}</script>',
  '<style>#tabs-1 {color:#000000;font-size:12px;font-weight:670;line-height:155%;}',
  '.annotator-widget {font-size:115%;} input[type="radio"] { -webkit-appearance: radio; }</style>',

  '<script type="text/javascript">',
  '$(document).ready(function () {',
   '$("#firstsection").show();$("#altersection").hide();',
   '});',
    'function editorload() {',
    '$("#firstsection").show();',
    '$("#altersection").hide();',
    '}',
  'function selectDrug() {',
  'var drug1 = $("#Drug1").val();',
  'var drug2 = $("#Drug2").val();',
  'var quotestring = $("#quote").html();',
  'quotestring = quotestring.replace(drug2, "<span class=\'selecteddrug\'>"+drug2+"</span>");',
  'quotestring = quotestring.replace(drug1, "<span class=\'selecteddrug\'>"+drug1+"</span>");',
  '$("#quote").html(quotestring);',
  '}',
  'function deselectDrug() {',
  'var drug1 = $("#Drug1").val();',
  'var drug2 = $("#Drug2").val();',
  'var quotestring = $("#quote").html();',
  'quotestring = quotestring.replace(\'<span class="selecteddrug">\'+drug2+\'</span>\', drug2);',
  'quotestring = quotestring.replace(\'<span class="selecteddrug">\'+drug1+\'</span>\', drug1);',
  '$("#quote").html(quotestring);',
  '}',
  'function changeFunc() {',
  'if($("#assertion_type option:selected").text()=="DDI clinical trial"){ $("#firstsection").hide(); $("#altersection").show();var object = $("#Drug1 option:selected").text(); $("#objectinalter").html("Object: "+object);var precipt = $("#Drug2 option:selected").text(); $("#preciptinalter").html("Precipt: "+precipt);',
  '$("#back").show();var modal = $("#Modality:checked").val();$("#modalityinalter").html("Modality: "+modal);var evid = $("#Evidence_modality:checked").val();$("#evidenceinalter").html("Evidence: "+evid);}',
  'else{ $("#altersection").hide();$("#forward").hide();}',
  //'$("#splitter").jqxSplitter({ width: "100%", height: 650, orientation: "horizontal", panels: [{ size: "50%", min: 100 }, { size: "50%", min: 50}] });',
  '}',
  'function flipdrug() {',
  'var object = $("#Drug1 option:selected").text();',
  'var precip = $("#Drug2 option:selected").text();',
    '$("#Drug1 option").removeAttr("selected");$("#Drug2 option").removeAttr("selected");',
  '$("#Drug1 > option").each(function () {if ($(this).text() == precip){ $(this).prop("selected", "selected");}});$("#Drug2 > option").each(function () {if ($(this).text() == object) $(this).prop("selected", "selected");});',
  '}',
  'function backtofirst() {',
  '$("#firstsection").show(); $("#altersection").hide();$("#forward").show();$("#back").hide();}',
  'function forwardtosecond() {',
  '$("#firstsection").hide(); $("#altersection").show();$("#forward").hide();$("#back").show();',
  'var object = $("#Drug1 option:selected").text(); $("#objectinalter").html("Object: "+object);var precipt = $("#Drug2 option:selected").text(); $("#preciptinalter").html("Precipt: "+precipt);',
  'var modal = $("#Modality:checked").val();$("#modalityinalter").html("Modality: "+modal);var evid = $("#Evidence_modality:checked").val();$("#evidenceinalter").html("Evidence: "+evid);',
  '}',

  'function changeRole1(role) {',
  '$(".Role2").each(function(){ if(this.value != role) this.checked = true; else this.checked = false;});}',

  'function changeRole2(role) {',
  '$(".Role1").each(function(){ if(this.value != role) this.checked = true; else this.checked = false;});}',

  '</script>',
  '<div class="annotator-outer annotator-editor annotator-invert-y annotator-invert-x">',
  '  <form class="annotator-widget">',
  '    <ul class="annotator-listing"></ul>',
  '<div class="annotationbody" style="margin-left:5px;margin-right:0px;height:100%;line-height:200%;margin-top:0px;overflow-y: hidden">',
  '<div id="tabs">',
  //'<ul>',
  //'<li><a href="#tabs-1">PK DDI</a></li>',
  //'</ul>',
  '<div id="tabs-1" style="margin-bottom:0px;">',
  '<div id="firstsection" style="margin-top:10px;margin-left:5px;">',
  '<div onclick="flipdrug()" style="float:left" class="flipicon"></div>',
  '<table class="clear-user-agent-styles"><tr><td width="40px"><strong>Object: </strong></td>',
  '<td><select id="Drug1" onmousedown="deselectDrug()" onchange="selectDrug()">',
  //'<option value="simvastatin">simvastatin</option>',
  //'<option value="ketoconazole">ketoconazole</option>',
  '</select>',
  '</td>',

  '<td><strong>Type: </strong></td>',
  '<td><input type="radio" name="Type1" id="Type1" class="Type1" value="active ingredient">active ingredient',
  '<input type="radio" name="Type1" id="Type1" class="Type1" value="metabolite">metabolite',
  '<input type="radio" name="Type1" id="Type1" class="Type1" value="drug product">drug product',
  '<input type="radio" name="Type1" id="Type1" class="Type1" value="drug group">drug group',
  '</td></tr>',

  '<tr><td><strong>Precipitant: </strong></td>',
  '<td><select id="Drug2" onmousedown="deselectDrug()" onchange="selectDrug()">',
  //'<option value="simvastatin">simvastatin</option>',
  //'<option value="ketoconazole">ketoconazole</option>',
  '</select>',
  '</td>',

  '<td width="40px"><strong>Type: </strong></td>',
  '<td><input type="radio" name="Type2" id="Type2" class="Type2" value="active ingredient">active ingredient',
  '<input type="radio" name="Type2" id="Type2" class="Type2" value="metabolite">metabolite',
  '<input type="radio" name="Type2" id="Type2" class="Type2" value="drug product">drug product',
  '<input type="radio" name="Type2" id="Type2" class="Type2" value="drug group">drug group',
  '</td></tr>',
  //'</table>',

  //'<table class="clear-user-agent-styles">',
  '<tr><td><strong>Evidence: </strong></td><td>',
  '<input type="radio" name="Evidence_modality" id="Evidence_modality" class="Evidence_modality" value="for">For',
  '<input type="radio" name="Evidence_modality" id="Evidence_modality" class="Evidence_modality" value="against">Against',
  '</td>',

  '<td><strong>Assertion Type: </strong></td><td>',
  '<select id="assertion_type" onchange="changeFunc();">',
  '<option id="DDI" value="Drug Drug Interaction">Drug Drug Interaction</option>',
  '<option id="clinical" value="DDI clinical trial">DDI clinical trial</option>',
  '</select></td></tr>',

  '<tr><td width="40px"><strong>Modality: </strong></td><td>',
  '<input type="radio" name="Modality" id="Modality" class="Modality" value="Positive">Positive',
  '<input type="radio" name="Modality" id="Modality" class="Modality" value="Negative">Negative',
  '</td>',


  '<td width="40px"><strong>Comment: </strong></td><td>',
  '<textarea id="Comment" class="Comment"></textarea>',
  '</td></tr>',


  '</table>',

  '</div>',

  '<div style="margin-left: 0px;">',
  '<div id = "altersection" style="display: none;">',

  '<div style="float:left">',
  '<div><strong>Clinical Trial: </strong><strong id="modalityinalter"></strong>&nbsp<strong id="evidenceinalter"></strong></div>',
  '<strong id="objectinalter"></strong>',
  '<div>',
  'Dose in MG: <input style="width:30px;" type="text" id="DoseMG_precipitant">',
  'Formulation: <select id="FormulationP">',
  '<option value="UNK">UNK</option>',
  '<option value="Oral">Oral</option>',
  '<option value="IV">IV</option>',
  '<option value="transdermal">transdermal</option>',
  '</select>',
  'Duration(days): <input style="width:30px;" type="text" id="Duration_precipitant">',
  'Regiments: <select id="RegimentsP">',
  '<option value="UNK">UNK</option>',
  '<option value="SD">SD</option>',
  '<option value="QD">QD</option>',
  '<option value="BID">BID</option>',
  '<option value="TID">TID</option>',
  '<option value="QID">QID</option>',
  '<option value="Q12">Q12</option>',
  '<option value="Q8">Q8</option>',
  '<option value="Q6">Q6</option>',
  '<option value="Daily">Daily</option>',
  '</select>',
  '</div>',

  '<strong id="preciptinalter"></strong>',
  '<div>',
  'Dose in MG: <input style="width:30px;" type="text" id="DoseMG_object">',
  'Formulation: <select id="FormulationO">',
  '<option value="UNK">UNK</option>',
  '<option value="Oral">Oral</option>',
  '<option value="IV">IV</option>',
  '<option value="transdermal">transdermal</option>',
  '</select>',
  'Duration(days): <input style="width:30px;" type="text" id="Duration_object">',
  'Regiments: <select id="RegimentsO">',
  '<option value="UNK">UNK</option>',
  '<option value="SD">SD</option>',
  '<option value="QD">QD</option>',
  '<option value="BID">BID</option>',
  '<option value="TID">TID</option>',
  '<option value="QID">QID</option>',
  '<option value="Q12">Q12</option>',
  '<option value="Q8">Q8</option>',
  '<option value="Q6">Q6</option>',
  '<option value="Daily">Daily</option>',
  '</select>',
  '</div></div>',
  '<div><div><strong>The number of participants: </strong>',
  '<input type="text" id="Number_participants">',
  '</div>',
  '<table class="clear-user-agent-styles auc"><tr><td width="70px"><strong>AUC_i/AUC: </strong></td>',
  '<td>Auc: <input style="width:30px;" type="text" id="Auc"></td>',
  '<td>Type: <select id="AucType">',
  '<option value="UNK">UNK</option>',
  '<option value="Percent">Percent</option>',
  '<option value="Fold">Fold</option>',
  '</select></td>',
  '<td>Direction: <select id="AucDirection">',
  '<option value="UNK">UNK</option>',
  '<option value="Increase">Increase</option>',
  '<option value="Decrease">Decrease</option>',
  '</select>',
  '</td></tr>',

  '<tr><td width="70px"><strong>CL_i/CL: </strong></td>',
  '<td>Cl: <input style="width:30px;" type="text" id="Cl"></td>',
  '<td>Type: <select id="ClType">',
  '<option value="UNK">UNK</option>',
  '<option value="Percent">Percent</option>',
  '<option value="Fold">Fold</option>',
  '</select></td>',
  '<td>Direction: <select id="ClDirection">',
  '<option value="UNK">UNK</option>',
  '<option value="Increase">Increase</option>',
  '<option value="Decrease">Decrease</option>',
  '</select>',
  '</td></tr>',

  '<tr><td width="70px"><strong>Cmax:</strong></td>',
  '<td>cmax: <input style="width:30px;" type="text" id="cmax"></td>',
  '<td>Type: <select id="cmaxType">',
  '<option value="UNK">UNK</option>',
  '<option value="Percent">Percent</option>',
  '<option value="Fold">Fold</option>',
  '</select></td>',
  '<td>Direction: <select id="cmaxDirection">',
  '<option value="UNK">UNK</option>',
  '<option value="Increase">Increase</option>',
  '<option value="Decrease">Decrease</option>',
  '</select>',
  '</td></tr>',

  '<tr><td width="70px"><strong>Cmin:</strong></td>',
  '<td>cmin: <input style="width:30px;" type="text" id="cmin"></td>',
  '<td>Type: <select id="cminType">',
  '<option value="UNK">UNK</option>',
  '<option value="Percent">Percent</option>',
  '<option value="Fold">Fold</option>',
  '</select></td>',
  '<td>Direction: <select id="cminDirection">',
  '<option value="UNK">UNK</option>',
  '<option value="Increase">Increase</option>',
  '<option value="Decrease">Decrease</option>',
  '</select>',
  '</td></tr>',

  '<tr><td width="70px"><strong>T1/2:</strong></td>',
  '<td>t12: <input style="width:30px;" type="text" id="t12"></td>',
  '<td>Type: <select id="t12Type">',
  '<option value="UNK">UNK</option>',
  '<option value="Percent">Percent</option>',
  '<option value="Fold">Fold</option>',
  '</select></td>',
  '<td>Direction: <select id="t12Direction">',
  '<option value="UNK">UNK</option>',
  '<option value="Increase">Increase</option>',
  '<option value="Decrease">Decrease</option>',
  '</select>',
  '</td></tr></table></div>',
  '</div>',
  '</div>',

  '</div>',
  '</div>',
  '</div>',
  '    <div class="annotator-controls1">',
  '     <a href="#cancel" class="annotator-cancel" onclick="showrightbyvalue()" id="annotator-cancel">',
  'Cancel',
  '</a>',
  '      <a href="#save"',
  '         class="annotator-save annotator-focus" onclick="showrightbyvalue()">',
  'Save',
  '</a>',
  '         <a class="annotator-back" id="back" onclick="backtofirst()" style="display:none">',
  'Back',
  '</a>',
  '         <a class="annotator-next" id="forward" onclick="forwardtosecond()" style="display:none">',
  'Next',
  '</a>',
  '    </div>',
  '  </form>',
  '</div>'
].join('\n');


Template.extend = extend;
exports.Template = Template;
