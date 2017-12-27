// Main module: default UI

// Export submodules for browser environments

exports.filter = require('./ui/filter');
exports.markdown = require('./ui/markdown');
exports.tags = require('./ui/tags');
exports.textselector = require('./ui/textselector');
exports.widget = require('./ui/widget');

//drug mention
exports.editor = require('./drugPlugin/editor');
exports.viewer = require('./drugPlugin/viewer');
exports.adder = require('./drugPlugin/adder');
exports.highlighter = require('./drugPlugin/highlighter');

//ddiPlugin
exports.ddieditor = require('./ddiPlugin/editor');
exports.ddiviewer = require('./ddiPlugin/viewer');
exports.ddiadder = require('./ddiPlugin/adder');
exports.ddihighlighter = require('./ddiPlugin/highlighter');
exports.ddimain = require('./ui/ddimain').main;

// mpPlugin  uncomment below for mpPlugin (comment ddiPlugin)
// exports.mpeditor = require('./mpPlugin/editor');
// exports.mpviewer = require('./mpPlugin/viewer');
// exports.mpadder = require('./mpPlugin/adder');
// exports.mphighlighter = require('./mpPlugin/highlighter');
// exports.mpmain = require('./ui/mpmain').main;

