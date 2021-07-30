/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/mindset/wm/receiving/receiving/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});