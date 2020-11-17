"use strict"

var view = new ol.View({
	center: [0,0],
	zoom: 0
});

var geolocation = new ol.Geolocation({
	projection: view.getProjection(),
	tracking: true
});
var positionFeature = new ol.Feature();
positionFeature.setStyle(
	new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#3399CC"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	})
);
geolocation.on("change:position", function() {
	let coords = geolocation.getPosition();
	positionFeature.setGeometry(coords ? new ol.geom.Point(coords) : null);
});

var map = new ol.Map({
	target: "map",
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		}),
		new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [positionFeature]
			})
		})
	],
	view: view
});
