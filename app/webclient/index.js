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
/**
* bins.json
* longitude and latitudes of waste separation bins.
* Addresses from <www.wastereduction.gov.hk/en/quickaccess/vicinity.htm?collection_type=bin> passed through <geocodeapi.io>
*/
fetch("./bins.json")
	.then(r => r.json())
	// turn list of {lon:x,lat:y} into list of ol.Feature
	.then(bins => {
		return bins.map(bin => new ol.Feature({
			geometry: new ol.geom.Point(
				ol.proj.fromLonLat([bin.lon,bin.lat])
			),
		}))
	})
	// set binPinSource
	.then(bins => {
		binPinLayer.setSource(new ol.source.Vector({features:bins}));
	});

var buildingLayer = new ol.layer.Vector({
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 8,
			fill: new ol.style.Fill({
				color: "#99CC33"
			}),
			stroke: new ol.style.Stroke({
				color: "#FFFFFF",
				width: 2
			})
		})
	}),
	minResolution: 5,
	maxResolution: 200
});
fetch("./point_ids.json")
	.then(r => r.json())
	// turn list of {lon:x,lat:y} into list of ol.Feature
	.then(bs => {
		return bs.map(b => {
			let feature = new ol.Feature({
				geometry: new ol.geom.Point(
					ol.proj.fromLonLat([b.lon,b.lat])
				)
			})
			feature.setId(b.id);
			return feature;
		})
	})
	.then(bs => {
		buildingLayer.setSource(new ol.source.Vector({features:bs}));
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
		binPinLayer,
		buildingLayer
	],
	view: view
});
