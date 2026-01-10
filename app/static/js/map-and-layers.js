/**
 * map-and-layers.js
 * -------------------------
 * Everything about map and layers creation
 * 
 *
**/

import {
    IRS_DEFAULTS,
    STROKE_COLOR,
    STROKE_WIDTH,
    UNIT_DICT,
    RLS_PATH,
    RTS_PATH,
    RSS_PATH,
    MAIN_URL
} from "./global.js";
import {
    addAlert,
    wait,
    getNameWithYear
} from "./utils.js";
import { addLegendItem } from "./components/legend.js";
import {
    graphUpdateBellcurve,
    graphUpdateCorrelations,
    graphUpdateTimeseries
} from "./components/charts.js";
import { initTourStepContent, startTour } from "./components/guided-tour.js";


// Style functions
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
var focusStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#01060cff',
        width: 4
    })
});
function getStyleEtablissements(feature) {
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
export function getStyleMain(feature, resolution, data_dict, steps, palette, nb, TS = false) {
    let code = feature.get('code');
    code = parseInt(code);

    let value;
    let thisColor;

    if (TS == false) {
        value = data_dict[code]['avg'];
    } else {
        value = data_dict[code][nb]['avg'];
    }
    if (value == null) {
        return null;
    }
    else if (value >= steps[0] && value < steps[1]) {
        thisColor = palette[0]
    }
    else if (steps[1] && value < steps[2]) {
        thisColor = palette[1]
    }
    else if (value >= steps[2] && value < steps[3]) {
        thisColor = palette[2]
    }
    else if (value >= steps[3] && value < steps[4]) {
        thisColor = palette[3]
    }
    else if (value >= steps[4] && value < steps[5]) {
        thisColor = palette[4]
    }
    else if (value >= steps[5] && value < steps[6]) {
        thisColor = palette[5]
    }
    else if (value >= steps[6] && value < steps[7]) {
        thisColor = palette[6]
    }
    else if (value >= steps[7] && value < steps[8]) {
        thisColor = palette[7]
    }
    else if (value >= steps[8] && value < steps[9]) {
        thisColor = palette[8]
    }
    else if (value >= steps[9] && value <= steps[10]) {
        thisColor = palette[9]
    }
    let style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: thisColor
        }),
        stroke: new ol.style.Stroke({
            color: STROKE_COLOR,
            width: STROKE_WIDTH
        })
    });
    feature.setStyle(style);
};


// Basemap layers
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
const satLayerW = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
    }),
    title: 'satLayerW',
    visible: false
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
export const BASEMAP_NEXT = {
    'googleStreets': ['esriStand', esriStand],
    'esriStand': ['satLayer', satLayer],
    'satLayer': ['satLayerW', satLayerW],
    'satLayerW': ['positron', positron],
    'positron': ['googleStreets', googleStreets]
}
export const BASE_LAYERS = {
    googleStreets,
    satLayer,
    satLayerW,
    esriStand,
    positron
};
export const RLSLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: RLS_PATH,
        format: new ol.format.GeoJSON(),
    }),
    style: RLSStyleFunction,
    title: 'RLS',
    zIndex: 8,
    visible: false
});
export const RTSLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: RTS_PATH,
        format: new ol.format.GeoJSON(),
    }),
    style: RLSStyleFunction,
    title: 'RTS',
    zIndex: 8,
    visible: false
});
export const RSSLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: RSS_PATH,
        format: new ol.format.GeoJSON(),
    }),
    style: RLSStyleFunction,
    title: 'RSS',
    zIndex: 8,
    visible: false
});




// Thematic layers
var styleCache = {};
const installationsSante = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: MAIN_URL + '/static/data/atlas/installations_sante.geojson',
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
const installationsCluster = new ol.source.Cluster({
    distance: 40,
    minDistance: 20,
    source: new ol.source.Vector({
        url: MAIN_URL + 'static/data/atlas/installations_sante.geojson',
        format: new ol.format.GeoJSON(),
    }),
});
const installationsSanteCluster = new ol.layer.Vector({
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
export const THEMATIC_LAYER_DICT = {
    'installations': {
        'mainLayer': installationsSante,
        'clusterLayer': installationsSanteCluster,
        'title': 'Installations de santé'
    }
}


// Layers groups
const thematicLayerGroup = new ol.layer.Group({
    layers: [installationsSante, installationsSanteCluster],
    title: 'baseLayerGroup'
});
const baseLayerGroup = new ol.layer.Group({
    layers: [satLayer, satLayerW, esriStand, googleStreets, positron],
    title: 'baseLayerGroup'
});
export const queryLayerGroup = new ol.layer.Group({
    layers: [],
    title: 'queryLayerGroup'
});

// Map & view
const view = new ol.View({
    center: [-8192885.349628, 5701866.863917],
    zoom: 12,
});
export const map = new ol.Map({
    layers: [
        baseLayerGroup,
        RLSLayer,
        RTSLayer,
        RSSLayer,
        thematicLayerGroup,
        queryLayerGroup],
    target: 'map',
    view: view,
});

// Map events
map.on('pointermove', function (event) {
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getViewport().style.cursor = hit ? 'pointer' : '';
});
map.on('singleclick', function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        // Handle le cas où c'est une couche de query
        if (layer.get('type') == 'queryLayer') {
            const code = String(feature.get('code') ?? feature.getId() ?? '');
            if (!code) return false;

            // Extract feature infos
            let feature_code = code;
            let feature_name = feature.get('label');
            let feature_pop = feature.get('population_tot');
            let feature_pop_dens = parseInt(feature.get('densite_population'));
            let feature_age = feature.get('age_median');

            // Extract the layer title and feature value
            let infoPanelIndicatorClicked = layer.get('title');
            let feature_val;

            if (infoPanelIndicatorClicked.includes('-')) {
                let currentStep = indicatorIdToStep[infoPanelIndicatorClicked];
                feature_val = trailingOutput[infoPanelIndicatorClicked][feature_code][currentStep]['avg'];
                graphUpdateTimeseries(infoPanelIndicatorClicked, feature_code);
            } else {
                feature_val = trailingOutput[infoPanelIndicatorClicked][feature_code]['avg'];
            }


            // Remove queryFocusLayer if allready there
            try { map.removeLayer(queryFocusLayer) }
            catch (err) { console.log(err) }

            // Create the queryFocusLayer
            var geometry = feature.getGeometry();
            queryFocusFeature = new ol.Feature({
                geometry: geometry,
                name: 'selected'
            });
            queryFocusFeature.setStyle(focusStyle);
            queryFocusSource = new ol.source.Vector({
                features: [queryFocusFeature],
            });
            queryFocusLayer = new ol.layer.Vector({
                source: queryFocusSource,
                title: 'queryFocusLayer',
                zIndex: 50
            });
            map.addLayer(queryFocusLayer);

            // Update les infos du info-panel
            let full_name_with_year = getNameWithYear(infoPanelIndicatorClicked);
            $('.info-panel-indicator').html(full_name_with_year);
            $('#info-panel-label').html(feature_name);
            $('#info-panel-pop').html(new Intl.NumberFormat('fr-FR').format(feature_pop));
            $('#info-panel-pop-dens').html(new Intl.NumberFormat('fr-FR').format(feature_pop_dens));
            $('#info-panel-age-med').html(parseFloat(feature_age).toFixed(1));


            // Update le(s) graphique(s)
            setTimeout(() => {
                graphUpdateBellcurve(infoPanelIndicatorClicked, feature_val);
                graphUpdateCorrelations(infoPanelIndicatorClicked);
            }, 100);

            // ✅ Stop after handling the first queryLayer feature
            return true;
        }
        else if (layer.get('type') == 'thematicLayer') {

            console.log('this is a thematic layer');
            // ✅ Stop after handling the first queryLayer feature
            return true;
        }
        else {
            return false;
        }


    });
});


// Main layer creation functions 
export function totalLayerCreation(final_output) {
    // Ajoute couches et legendes
    for (let [key, value] of Object.entries(final_output)) {
        let ind_split = key.split('.')
        let ind_id = ind_split[0];
        let ind_year = ind_split[1];

        var only_vals = [];
        var real_only_vals;
        if (ind_year.includes('-')) {
            indicatorIdToStep[key] = 0;
            for (const my_key in value) {
                only_vals.push(...value[my_key].map(v => v.avg));
            }
        } else {
            only_vals = Object.values(value).map(v => v.avg);
        }
        real_only_vals = only_vals.flat(1).filter(val => val !== null);
        let this_ind = indicatorsKeyRef[ind_id];
        let ind_name = this_ind['title'];
        let ind_unit = UNIT_DICT[this_ind['unit']];
        let ind_lowgood = this_ind['low_good'];
        let steps;
        let min_val = Math.min(...real_only_vals);
        let max_val = Math.max(...real_only_vals);
        let step = (max_val - min_val) / 10;
        steps = [min_val, min_val + (1 * step), min_val + (2 * step), min_val + (3 * step), min_val + (4 * step), min_val + (5 * step), min_val + (6 * step),
            min_val + (7 * step), min_val + (8 * step), min_val + (9 * step), max_val];
        masterDict[key] = [value, steps, ind_name, ind_lowgood];
        createAndAddLayer(key, ind_lowgood, masterDict);
        layersOnMap.push(String(key));
        addLegendItem(key, ind_name, ind_year, ind_unit, steps, ind_lowgood);

    }
}
function createAndAddLayer(key, ind_lowgood, masterDict) {
    const [minVal, maxVal] = masterDict[key] || [undefined, undefined];
    const reverseBreaks = key.includes('-');
    const colors = ind_lowgood ? BLUES_COLORS : BLUES_COLORS_REV;

    const style_fct = (feature, resolution) =>
        getStyleMain(feature, resolution, minVal, maxVal, colors, 0, reverseBreaks);

    const layer_source = new ol.source.Vector({
        url: RLS_PATH,
        format: new ol.format.GeoJSON(),
    });

    const layer = new ol.layer.Vector({
        source: layer_source,
        style: style_fct,
        title: String(key),
        type: 'queryLayer',
        zIndex: 8,
    });

    queryLayerGroup.getLayers().push(layer);

    // Once first render occurs, fit view to (padded) extent and notify
    layer.once('postrender', function () {
        try {
            const extent = layer_source.getExtent();
            const PAD = 200000;
            const padded = [
                extent[0] - PAD,
                extent[1] - PAD,
                extent[2] + PAD,
                extent[3] + PAD,
            ];

            map.getView().fit(padded, {
                duration: 1000,
                callback: function () {
                    addAlert('success', 'Votre indicateur est prêt');
                    isQueryInProgress = false;
                    if (tourInAction){
                        console.log('here');
                        startTour();
                        currentTourStep += 1;
                        initTourStepContent(currentTourStep)
                    }
                }
            });
        } catch (err) {
            // no-op: extent may be invalid or view not ready
        }
    });

    return layer;
}



// Helper functions
export function seeSpecificBasemap(layertitle) {
    if (layertitle == 'satLayer') {
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(0, 11, 22, 0.45)');
    }
    baseLayerGroup.getLayers().forEach(function (element) {
        let baseLayerTitle = element.get('title');
        if (baseLayerTitle == layertitle) {
            let thumbpath = "url('../../../static/image/thumbnails/thumbnail_" + String(layertitle) + ".jpg')";
            element.setVisible(true);
            $('#basemap-preview').css('background-image', thumbpath);
        } else {
            element.setVisible(false);
        }
    })
}
export function getQueryLayerById(layerId) {
    for (const layer of queryLayerGroup.getLayers().getArray()) {
        if (layer.get('title') === layerId) {
            return layer;
        }
    }
    return null;
}
export function removeLayer(key, layer_type) {
    $('.info-panel').addClass('novis');

    $(`.leg-ind-ctn[name="${key}"]`).remove();

    if (layer_type == 'query') {
        try { map.removeLayer(queryFocusLayer) }
        catch (err) { console.log(err) }
        let thisLayer = getQueryLayerById(key);
        queryLayerGroup.getLayers().remove(thisLayer);
        layersOnMap = layersOnMap.filter(item => item !== key);
    } else if (layer_type == 'thematic') {
        THEMATIC_LAYER_DICT[key]['mainLayer'].setVisible(false);
        THEMATIC_LAYER_DICT[key]['clusterLayer'].setVisible(false);
        $(`.ind-plus-box-thematic[data-layer="${key}"]`).removeClass('onmap');
    }

    if (layersOnMap.length == 0) {
        let new_url = window.location.href.replace(key + '+', '+');
        window.history.pushState(null, null, new_url);
    }
    else {
        let new_url = window.location.href.replace(key + '+', '');
        window.history.pushState(null, null, new_url);
    }
}
export function makeFirstInLayerGroup(name) {
    const layers = queryLayerGroup.getLayers();
    const arr = layers.getArray();
    const idx = arr.findIndex(l => l.get('title') === name);

    if (idx === -1) {
        console.warn(`Layer "${name}" not found in queryLayerGroup.`);
        return;
    }

    const layer = layers.item(idx);
    layers.removeAt(idx);
    layers.insertAt(layers.getLength(), layer);
}
export function checkIfLayerFirst(layer_key) {
    const firstChild = $("#query-layers").children().first();
    const firstName = firstChild.attr("name");
    return firstName === layer_key ? true : false;
}


// Ion range sliders functions and init
export function changeLayerOpacity(name, opacity) {
    let thisLayer = getQueryLayerById(name);
    thisLayer.setOpacity(opacity / 100);
}
export function changeLayerYearViz(name, new_year) {
    if (name.includes("-range")) {
        name = name.replace("-range", "");
    }
    let thisLayer = getQueryLayerById(name);
    let source = thisLayer.getSource();
    indicatorIdToStep[name] = indicatorIdRangeRef[name][new_year]
    source.forEachFeature((feature) => {
        const colors = masterDict[name][3] ? BLUES_COLORS : BLUES_COLORS_REV;
        getStyleMain(
            feature,
            null,
            masterDict[name][0],
            masterDict[name][1],
            colors,
            indicatorIdRangeRef[name][new_year],
            true);
    })
}
export function initIonRange($input, opts = {}) {
    if (!$input || !$input.length) return;

    // ✅ Always destroy existing instance to avoid double-init / stacked handlers
    const existing = $input.data('ionRangeSlider');
    if (existing) {
        existing.destroy();
        $input.removeData('ionRangeSlider'); // optional but clean
    }

    // Support data-* attributes on the input (optional)
    const dataOpts = {
        min: $input.data('min'),
        max: $input.data('max'),
        from: $input.data('from'),
        step: $input.data('step'),
        postfix: $input.data('postfix'),
        max_postfix: $input.data('maxPostfix'),
        skin: $input.data('skin'),
        extra_classes: $input.data('extraClasses')
    };
    Object.keys(dataOpts).forEach(k => dataOpts[k] === undefined && delete dataOpts[k]);

    $input.ionRangeSlider({
        ...IRS_DEFAULTS,
        ...dataOpts,
        ...opts,

        // ✅ Live updates while dragging (lightweight actions only)
        onChange: function (data) {
            const input = data.input;
            const name = input.attr("name");
            const type = input.data("atlas");

            if (type === 'opacity') {
                changeLayerOpacity(name, data.from);

            } else if (type === 'year-range') {
                changeLayerYearViz(name, data.from);

            } else if (type === 'year-sel-slider') {
                selectedYear = data.from;

            } else if (type === 'year-range-slider') {
                selectedYearTS1 = data.from;
                selectedYearTS2 = data.to;

            } else if (type === 'tendency-range-slider') {
                // lightweight: just update the chart range while dragging
                setTendencyRangeByYears(data.from, data.to);
            }
        },

        // ✅ Heavy updates only when user releases mouse (single call)
        onFinish: function (data) {
            const input = data.input;
            const name = input.attr("name");
            const type = input.data("atlas");

            if (type === 'tendency-range-slider') {
                const tendencyStart = data.from;
                const tendencyEnd = data.to;

                currentTendencyEndYear = tendencyEnd;

                // ensure final extremes are set (in case of any missed onChange)
                setTendencyRangeByYears(tendencyStart, tendencyEnd);

                const newTendencyStats = computeTendencyStats(
                    currentTendencyData,
                    provincialTimeseries[currentTendencyId],
                    tendencyStart,
                    tendencyEnd
                );

                updateTendencyStats(newTendencyStats);
            }
        }
    });

    return $input.data('ionRangeSlider');
}

// Time series
export async function displayStepsWithDelay(stepList, layerName) {
    addAlert('loading', 'Timelapse en cours');
    $(".leg-ind-ctn[name='" + layerName + "']").addClass('ts-running');
    let loop_step = 0;
    let thisLayer = getQueryLayerById(layerName);
    let source = thisLayer.getSource();
    for (const step of stepList) {
        source.forEachFeature((feature) => {
            const colors = masterDict[layerName][3] ? BLUES_COLORS : BLUES_COLORS_REV;
            getStyleMain(
                feature,
                null,
                masterDict[layerName][0],
                masterDict[layerName][1],
                colors,
                loop_step,
                true);
        })
        let $input = $("input[name='" + layerName + "-range']");
        let slider = $input.data("ionRangeSlider");
        slider.update({
            from: Object.keys(indicatorIdRangeRef[layerName])[loop_step]
        });
        await wait(1000);
        loop_step += 1;
    }
    // Timelapse is finished, going back to first value
    source.forEachFeature((feature) => {
        const colors = masterDict[layerName][3] ? BLUES_COLORS : BLUES_COLORS_REV;
        getStyleMain(
            feature,
            null,
            masterDict[layerName][0],
            masterDict[layerName][1],
            colors,
            0,
            true);
    })
    $("input[name='" + layerName + "-range']").data("ionRangeSlider").update({
        from: Object.keys(indicatorIdRangeRef[layerName])[0]
    });
    $(".leg-ind-ctn[name='" + layerName + "']").removeClass('ts-running');
    addAlert('success', 'Timelapse terminé');
}


// Basemap switcher
$('#switcher').click(function () {
    BASE_LAYERS[currentBasemap].setVisible(false);
    BASEMAP_NEXT[currentBasemap][1].setVisible(true);
    let thumbpath = "url('../../../static/image/thumbnails/thumbnail_" + BASEMAP_NEXT[currentBasemap][0] + ".jpg')";
    currentBasemap = BASEMAP_NEXT[currentBasemap][0];
    if (currentBasemap == 'satLayer') {
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(0, 11, 22, 0.45)');
    } else {
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(0, 11, 22, 0.6)');
    }
    var new_url = window.location.href.replace(/base=[^&]+/, 'base=' + currentBasemap );
    window.history.pushState(null, null, new_url);
    $('#basemap-preview').css('background-image', thumbpath);
})


$('.close-mb').click(function () {
    const targetClass = $(this).data('close');
    const targetNav = $(this).data('nav');
    $(`.${targetClass}[data-nav="${targetNav}"]`).addClass('novis');
    if (targetNav == 'info') {
        try { map.removeLayer(queryFocusLayer) }
        catch (err) { console.log(err) }
    }
});