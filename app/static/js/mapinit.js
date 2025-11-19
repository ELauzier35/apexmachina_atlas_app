const RLSStyleFunction = (feature) => new ol.style.Style({
    fill: new ol.style.Fill({
        color: "#2e30326e"
    }),
    stroke: new ol.style.Stroke({
        color: "#3c82fa",
        width: 2
    }),
    text: new ol.style.Text({
        text: feature.get('label') || '',
        font: 'bold 12px "Inter", Roboto, sans-serif',
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 1)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
            width: 3
        })
    })
});
var selectedStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: "#99c2ff7e"
    }),
    stroke: new ol.style.Stroke({
        color: "#2F6DDB",
        width: 2
    })
});
getStyleEtablissements = function (feature) {
    var the_style;
    var type = feature.get('STATUT_COD');
    if (type == '1') {
        the_style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.1, 0.2],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '../../../static/image/icons/icon-public.svg',
                // the real size of your icon
                size: [400, 400],
                // the scale factor
                scale: 0.2
            }),
        });
    } else if (type == '2') {
        the_style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.1, 0.2],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '../../../static/image/icons/icon-private.svg',
                // the real size of your icon
                size: [400, 400],
                // the scale factor
                scale: 0.2
            }),
        });
    }
    return the_style;
}

// ============== BASEMAP LAYERS =================
const googleStreets = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    }),
    title: 'googleStreets',
    visible: false
});
const satLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        maxZoom: 19,
    }),
    title: 'satLayer',
    visible: true
});
const esriStand = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
    }),
    title: 'esriStand',
    visible: false
});
const positron = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'http://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        maxZoom: 19,
    }),
    title: 'positron',
    visible: false
});
window.BASE_LAYERS = {
  googleStreets,
  satLayer,
  esriStand,
  positron
};
RLSSource = new ol.source.Vector({
    url: '../static/data/atlas/RLS_rmv_nd_join.geojson',
    format: new ol.format.GeoJSON(),
});
RLSLayer = new ol.layer.Vector({
    source: RLSSource,
    style: RLSStyleFunction,
    title: 'RLS',
    zIndex: 8,
    visible: false
});

// ============== THEMATIC LAYERS =================
var styleCache = {};
// etablissementsSante = new ol.layer.Vector({
//     source: new ol.source.Vector({
//         url: '../static/data/atlas/etablissements_sante.geojson',
//         format: new ol.format.GeoJSON(),
//     }),
//     style: function (feature) {
//         return getStyleEtablissements(feature);
//     },
//     title: 'Etablissements',
//     minZoom: 11,
//     zIndex: 22,
//     visible: false
// });
// etablissementsCluster = new ol.source.Cluster({
//     distance: 40,
//     minDistance: 20,
//     source: new ol.source.Vector({
//         url: '../static/data/atlas/etablissements_sante.geojson',
//         format: new ol.format.GeoJSON(),
//     }),
// });
// etablissementsSanteCluster = new ol.layer.Vector({
//     source: etablissementsCluster,
//     title: 'etablissements_clusters',
//     maxZoom: 11,
//     zIndex: 22,
//     visible: false,
//     style: function (feature) {
//         const size = feature.get('features').length;
//         if (size < 10) {
//             var radius = 13;
//         }
//         else if (size >= 10 && size <= 99) {
//             var radius = 15;
//         }
//         else if (size >= 100 && size <= 999) {
//             var radius = 17;
//         }
//         else if (size >= 1000) {
//             var radius = 19;
//         }
//         let style = styleCache[size];
//         if (!style) {
//             style = new ol.style.Style({
//                 image: new ol.style.Circle({
//                     radius: radius,
//                     stroke: new ol.style.Stroke({
//                         color: '#000b16',
//                         width: 3
//                     }),
//                     fill: new ol.style.Fill({
//                         color: '#1E293B',
//                     }),
//                 }),
//                 text: new ol.style.Text({
//                     text: size.toString(),
//                     font: 'Gotham-Bold',
//                     fill: new ol.style.Fill({
//                         color: '#fff',
//                     }),
//                 }),
//             });
//             styleCache[size] = style;
//         }
//         return style;
//     },
// });
installationsSante = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '../static/data/atlas/installations_sante.geojson',
        format: new ol.format.GeoJSON(),
    }),
    style: function (feature) {
        return getStyleEtablissements(feature);
    },
    title: 'Installations',
    type: 'thematicLayer',
    minZoom: 11,
    zIndex: 22,
    visible: false
});
installationsCluster = new ol.source.Cluster({
    distance: 40,
    minDistance: 20,
    source: new ol.source.Vector({
        url: '../static/data/atlas/installations_sante.geojson',
        format: new ol.format.GeoJSON(),
    }),
});
installationsSanteCluster = new ol.layer.Vector({
    source: installationsCluster,
    title: 'installations_clusters',
    maxZoom: 11,
    zIndex: 22,
    visible: false,
    style: function (feature) {
        const size = feature.get('features').length;
        if (size < 10) {
            var radius = 13;
        }
        else if (size >= 10 && size <= 99) {
            var radius = 15;
        }
        else if (size >= 100 && size <= 999) {
            var radius = 17;
        }
        else if (size >= 1000) {
            var radius = 19;
        }
        let style = styleCache[size];
        if (!style) {
            style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: '#000b16',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: '#1E293B',
                    }),
                }),
                text: new ol.style.Text({
                    text: size.toString(),
                    font: 'Gotham-Bold',
                    fill: new ol.style.Fill({
                        color: '#fff',
                    }),
                }),
            });
            styleCache[size] = style;
        }
        return style;
    },
});


// ============== LAYER GROUPS =================
const thematicLayerGroup = new ol.layer.Group({
    layers: [installationsSante, installationsSanteCluster],
    title: 'baseLayerGroup'
});
const baseLayerGroup = new ol.layer.Group({
    layers: [satLayer, esriStand, googleStreets, positron],
    title: 'baseLayerGroup'
});
window.queryLayerGroup = new ol.layer.Group({
    layers: [],
    title: 'queryLayerGroup'
});

// ============== MAP & VIEW =================
const view = new ol.View({
    center: [-8192885.349628, 5701866.863917],
    zoom: 12,
});
const map = new ol.Map({
    layers: [baseLayerGroup, RLSLayer, thematicLayerGroup, queryLayerGroup],
    target: 'map',
    view: view,
});

window.layers_on_map = [];


window.seeSpecificBasemap = function(layertitle) {
    if (layertitle != 'satLayer'){
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(0, 11, 22, 0.7)');
    }
    baseLayerGroup.getLayers().forEach(function (element) {
        let baseLayerTitle = element.get('title');
        if (baseLayerTitle == layertitle) {
            thumbpath = "url('../../../static/image/thumbnails/thumbnail_" + String(layertitle) + ".JPG')";
            element.setVisible(true);
            $('#basemap-preview').css('background-image', thumbpath);
        } else {
            element.setVisible(false);
        }
    })
}