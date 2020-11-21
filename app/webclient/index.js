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

var binPinLayer = new ol.layer.Vector({
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#CC3399"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	}),
	maxResolution: 3
});
fetch("/bincoords/?returnall=true")
	.then(r => r.json())
	// turn list of {lon:x,lat:y} into list of ol.Feature
	.then(bins => {
		return bins.map(bin => ol.proj.fromLonLat([bin.lon,bin.lat]))
			.map(coord => new ol.geom.Point(coord))
			.map(geom => new ol.Feature({geometry: geom}));
	})
	// set binPinSource
	.then(bins => {
		binPinLayer.setSource(new ol.source.Vector({features:bins}));
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
		}),
		binPinLayer
	],
	view: view
});
