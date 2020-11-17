"use strict"

var view = new ol.View({
	center: [0,0],
	zoom: 0
});

var map = new ol.Map({
	target: "map",
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	view: view
});
