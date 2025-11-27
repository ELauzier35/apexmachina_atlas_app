// Global Variables
var current_indicator_step = 'year';
var currentStep = 0;
window.current_basemap;
const RLS_PATH = '../static/data/atlas/RLS_rmv_nd_join.geojson';
const CATEGORY_DICT = {
    "Indicateurs de coûts et de performance": ["performance", "Performance"],
    "Caractéristiques de la patientèle": ["patientele", "Patientèle"],
    "Indicateurs d'accès aux services de santé": ["access", "Accès aux services de santé"],
    "Indicateurs socio-économiques": ["socio", "Socio-économique"],
    "Indicateurs géospatiaux": ["geospatial", "Géospatiale"]
}
const SOURCE_DICT = {
    "RAMQ/Med-Echo": ["ramq"],
    "Données Québec": ["dq"],
    "Statistiques Canada": ["sc"],
    "CANUE": ["canue"],
    "Environnement Canada": ["ec"],
    "Recensement" : ["census"]
}
const UNIT_DICT = {
    'Pourcentage': '%',
    '$ CAN moyen': '$',
    'Nombre moyen': 'None',
    'Nombre': 'None',
    NaN: 'None',
    'Jours moyens': 'j.',
    'Taux': 'None',
    "Indice moyen (pas d'unité)": 'None',
    'Années': 'an.',
    'Ans': 'ans',
    'km': 'km',
    '$': '$',
    'Personnes' : 'pers.',
    'Degrés Celsius': '°C',
    'Unités de NIRRU': 'Unités de NIRRU'
}

function formatNumber(number) {
    const sign = number < 0 ? "-" : ""; // Check for negative numbers
    number = Math.abs(number); // Take the absolute value to handle the rest

    if (number >= 1000) {
        const suffixes = ["", "k", "M", "G", "T", "P", "E"];
        const suffixNum = Math.floor(("" + number).length / 3);
        const shortValue = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toFixed(2));
        return sign + shortValue + suffixes[suffixNum]; // Add the sign back to the result
    }

    return sign + number; // Return the number with its original sign
}
function addAlert(type, message) {
    try {
        clearTimeout(theTimeout);
    } catch (err) {
        // pass
    }
    $('#mainAlert').removeClass();
    $('#mainAlert').addClass(type);
    $('.alert-msg').html(message);
    if (type != 'loading') {
        theTimeout = setTimeout(() => {
            $("#mainAlert").addClass('novis');
        }, "3500");
    }
}
window.closeAllMapBoxes = function(){
    $('.map-box').addClass('novis');
    $('.result-map-box').addClass('novis');
    $('.nav-link').removeClass('active');
}
function getQueryLayerById(layerId) {
    for (const layer of queryLayerGroup.getLayers().getArray()) {
        if (layer.get('title') === layerId) {
            return layer;
        }
    }
    return null;
}

const BASEMAP_NEXT = {
    'googleStreets' : ['esriStand', esriStand],
    'esriStand' : ['satLayer', satLayer],
    'satLayer' : ['positron', positron],
    'positron' : ['googleStreets', googleStreets]
}
$('#switcher').click(function () {
    BASE_LAYERS[current_basemap].setVisible(false);
    BASEMAP_NEXT[current_basemap][1].setVisible(true);
    thumbpath = "url('../../../static/image/thumbnails/thumbnail_" + BASEMAP_NEXT[current_basemap][0] + ".JPG')";
    current_basemap = BASEMAP_NEXT[current_basemap][0];
    if (current_basemap == 'satLayer'){
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(30, 38, 47, 0.3)');
    } else{
        document.documentElement.style.setProperty('--mapbox-bg', 'rgba(0, 11, 22, 0.7)');
    }
    var new_url = window.location.href.replace(/base=[^&]+/, 'base=' + current_basemap+'/');
    window.history.pushState(null, null, new_url);
    $('#basemap-preview').css('background-image', thumbpath);

})
$('#filter-indicators').click(function (event) {
    event.stopPropagation();
    $('#filter-indicators-box').toggleClass('novis');
})
$('#filter-indicators-box').click(function (event) {
    event.stopPropagation();
})
function enlargeIndicatorBox(nav) {
    if (nav == 'tendency') {
        $(`.result-map-box[data-nav="tendency"]`).addClass('novis');
    }
    $(`.map-box[data-nav="${nav}"]`).addClass('enlarge');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip('dispose');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).attr('title', 'Réduire');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip();
}
function reduceIndicatorBox(nav) {
    console.log(nav);
    $(`.map-box[data-nav="${nav}"]`).removeClass('enlarge');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip('dispose');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).attr('title', 'Grossir');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip();
}
$('.enlarge-mb').click(function (event) {
    const nav = $(this).parent().data('nav');
    if ($(`.map-box[data-nav="${nav}"]`).hasClass('enlarge')) {
        reduceIndicatorBox(nav);
    } else {
        enlargeIndicatorBox(nav);
        $('.legend').removeClass('open');
    }
    $(this).tooltip();
})
$(document).on('click', '.leg-ind-icon-box.opacity', function () {
    $(this).closest('.leg-ind-ctn').toggleClass('opacity-active');
});
$(document).on('click', '.leg-ind-icon-box.remove', function () {
    $(this).tooltip('dispose');
    layer_key = $(this).closest('.leg-ind-ctn').attr('name');
    layer_type = $(this).closest('.leg-ind-ctn').data('type');
    removeLayer(layer_key, layer_type);
});
$(document).on('click', '.nav-link', function () {
    const nav = $(this).data('nav');
    if (nav != 'indicator' && nav != 'layer') {
        $('.legend').removeClass('open');
    }

    // If this tab is already active, turn everything off
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $('.map-box, .result-map-box').addClass('novis');
        try {
            RLSLayer.setVisible(false);
            focusLayer.setVisible(false);
        } catch (err) {
            console.log(err);
        }
        return;

    }
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('.map-box, .result-map-box').addClass('novis');
    $(`.map-box[data-nav="${nav}"]`).removeClass('novis');


    if (nav == 'tendency') {
        tendency_activated = true;
        focusLayer.setVisible(true);
        RLSLayer.setVisible(true);
        queryLayerGroup.setVisible(false);
        try {map.removeLayer(queryFocusLayer)}
        catch (err) {console.log(err)}
    } else {
        endency_activated = false;
        queryLayerGroup.setVisible(true);
        focusLayer.setVisible(false);
        RLSLayer.setVisible(false);
    }
});
$('#legendBtn').click(function () {
    if ($('.legend').hasClass('open')) {
        $('.legend').removeClass('open');
    } else {
        $('.legend').addClass('open');
        reduceIndicatorBox('indicator');
        reduceIndicatorBox('tendency');
        reduceIndicatorBox('cohort');
    }

})
$('#nameSearch').click(function(){
    $('#nameSearchRow').toggleClass('visible');
})
thematicLayerDict = {
    // 'etablissements': {
    //     'mainLayer' : etablissementsSante,
    //     'clusterLayer':  etablissementsSanteCluster,
    //     'title' : 'Établissements de santé'
    // },
    'installations': {
        'mainLayer' : installationsSante,
        'clusterLayer':  installationsSanteCluster,
        'title' : 'Installations de santé'
    }
}
$('.ind-plus-box-thematic').click(function () {
    const thisLayer = $(this).data('layer');
    if ($(this).hasClass('onmap')) {
        thematicLayerDict[thisLayer]['mainLayer'].setVisible(false);
        thematicLayerDict[thisLayer]['clusterLayer'].setVisible(false);
        $(this).removeClass('onmap');
        $(`.leg-ind-ctn[name="${thisLayer}"`).remove();
    } else {
        thematicLayerDict[thisLayer]['mainLayer'].setVisible(true);
        thematicLayerDict[thisLayer]['clusterLayer'].setVisible(true);
        $(this).addClass('onmap');
        addLegendItemThematic(thisLayer);
    }
})



$('.tab-el').click(function () {
    const targetTab = $(this).data('tab');
    if ($(this).hasClass('active') == false) {
        $('.tab-el').removeClass('active');
        $(this).addClass('active');
        $('.year-dropdown').removeClass('visible');
        $(`.year-dropdown[data-tab="${targetTab}"]`).addClass('visible');
        current_indicator_step = targetTab;
    }
})
$('.close-mb').click(function () {
    const targetClass = $(this).data('close');
    const targetNav = $(this).data('nav');
    $(`.${targetClass}[data-nav="${targetNav}"]`).addClass('novis');
    if (targetNav == 'info'){
        try {map.removeLayer(queryFocusLayer)}
        catch (err) {console.log(err)}
    }
});
function resetChangeEvents() {
    // Update le count d'indicateur sélectionnés pour les tendances
    document.querySelectorAll('input[name="lsp-indicators"]').forEach(input => {
        input.addEventListener('change', () => {
            const selectedCount = document.querySelectorAll('input[name="lsp-indicators"]:checked').length;
            const text = selectedCount === 1
                ? `${selectedCount} sélectionné`
                : `${selectedCount} sélectionnés`;
            document.getElementById('indicatorCount').textContent = text;
        });
    });
    // Update le count d'indicateur sélectionnés pour les cohortes
    document.querySelectorAll('input[name="lsp-indicators-coh"]').forEach(input => {
        input.addEventListener('change', () => {
            const selectedCount = document.querySelectorAll('input[name="lsp-indicators-coh"]:checked').length;
            const text = selectedCount === 1
                ? `${selectedCount} sélectionné`
                : `${selectedCount} sélectionnés`;
            document.getElementById('indicatorCountCohort').textContent = text;
        });
    });
    // Update le count de cohortes sélectionnées
    document.querySelectorAll('input[name="lsp-coh"]').forEach(input => {
        input.addEventListener('change', () => {
            const selectedCount = document.querySelectorAll('input[name="lsp-coh"]:checked').length;
            const text = selectedCount === 1
                ? `${selectedCount} sélectionné`
                : `${selectedCount} sélectionnés`;
            document.getElementById('countCohort').textContent = text;
        });
    });
    // Cache les indicateurs en fonction de l'interaction avec les filtres
    const searchInput = document.getElementById("nameSearchInput");
    const typeInputs = document.querySelectorAll('input[name="filter-ind-type"]');

    function applyFilters() {
        const searchValue = searchInput.value.toLowerCase().trim();

        // which types are currently active (checked)?
        const activeTypes = Array.from(typeInputs)
            .filter(input => input.checked)
            .map(input => input.value);

        document.querySelectorAll(".indicator-box").forEach(box => {
            const title = box.getAttribute("data-title").toLowerCase();
            const type = box.getAttribute("data-type");

            const matchesSearch = title.includes(searchValue);

            // If no type selected → nothing matches
            const matchesType =
                activeTypes.length > 0 && activeTypes.includes(type);

            if (matchesSearch && matchesType) {
                box.classList.remove("hidden");
            } else {
                box.classList.add("hidden");
            }
        });
    }

    // 🔁 Hook both search and type filters to the same logic
    searchInput.addEventListener("keyup", applyFilters);
    typeInputs.forEach(input => {
        input.addEventListener("change", applyFilters);
    });
}


const IRS_DEFAULTS = {
    skin: 'material',
    min: 0,
    max: 100,
    step: 1,
    postfix: '',
    max_postfix: '',
    extra_classes: 'flex-fill',
    prettify_enabled: false   
};
function initIonRange($input, opts = {}) {
    if (!$input || !$input.length) return;

    // Prevent double-init: if already initialized, just update
    const instance = $input.data('ionRangeSlider');
    const merged = { ...IRS_DEFAULTS, ...opts };

    if (instance) {
        instance.update(merged);
        return instance;
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

    $input.ionRangeSlider({ ...IRS_DEFAULTS, ...dataOpts, ...opts,
        onChange: function (data) {
            let input = data.input;
            let name = input.attr("name");
            let type = input.data("atlas");
            if (type == 'opacity'){
                changeLayerOpacity(name, data.from);
            } else if (type == 'year-range'){
                changeLayerYearViz(name, data.from);
            } else if (type == 'year-sel-slider'){
                selected_year = data.from;
                console.log("Selected year:", selected_year);
            } else if (type == 'year-range-slider'){
                selected_year_ts1 = data.from;
                selected_year_ts2 = data.to;
                console.log("Start:", selected_year_ts1, "End:", selected_year_ts2);
            }
        }
     });
    return $input.data('ionRangeSlider');
}
function initSlidersIn($root, opts = {}) {
    $root.find('input.js-irs').each(function () {
        initIonRange($(this), opts);
    });
}
function destroySlidersIn($root) {
    $root.find('input.js-irs').each(function () {
        const inst = $(this).data('ionRangeSlider');
        if (inst) inst.destroy();
    });
}


// Dynamically create indicators, RLS and cohorte list at the loading of the page
indicator_id_to_name_dict = {}
indicator_id_to_name_cohorte_dict = {}
function sortIndicatorBoxes() {
    // 1. Define the desired order of types
    const typeOrder = {
        performance: 1,
        patientele: 2,
        access: 3,
        socio: 4,
        geospatial: 5
    };

    // 2. Select the container that holds all the indicator boxes
    // 🔧 Change this selector to match your real container
    const container = document.querySelector("#indicatorList");

    if (!container) return;

    // 3. Get all boxes as an array
    const boxes = Array.from(container.querySelectorAll(".indicator-box"));

    // 4. Sort them
    boxes.sort((a, b) => {
        const typeA = a.getAttribute("data-type") || "";
        const typeB = b.getAttribute("data-type") || "";

        const orderA = typeOrder[typeA] ?? 999;
        const orderB = typeOrder[typeB] ?? 999;

        // First: compare by type order
        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // Second: compare by data-title alphabetically
        const titleA = (a.getAttribute("data-title") || "").toLowerCase();
        const titleB = (b.getAttribute("data-title") || "").toLowerCase();

        return titleA.localeCompare(titleB, "fr", { sensitivity: "base" });
    });

    // 5. Re-append in sorted order
    boxes.forEach(box => container.appendChild(box));
}
function createIndicatorList() {
    atlas_indicators.forEach(function (indicator) {
        indicator_id_to_name_dict[indicator['id']] = indicator['title'];
        ind_el = `<div id="` + indicator['id'] + `" class="indicator-box" 
                    data-type="` + CATEGORY_DICT[indicator['category']][0] + `" 
                    data-source="` + SOURCE_DICT[indicator['source']][0] + `" 
                    data-title="` + indicator['title'] + `">
                    <div class="ind-top-row">
                        <div class="ind-badge `+ CATEGORY_DICT[indicator['category']][0] + `">` + CATEGORY_DICT[indicator['category']][1] + `</div>
                        <div class="ind-plus-box" data-bs-toggle="tooltip" data-bs-placement="top"
                            title="Ajouter" data-bs-original-title="Ajouter">
                            <i class="fa-solid fa-plus"></i>
                        </div>
                    </div>
                    <div class="ind-main-section">
                        <div class="ind-main-top">
                            <div class="ind-title">`+ indicator['title'] + `</div>
                            <div class="ind-subtitle">`+ indicator['short_description'] + `
                            </div>
                        </div>
                        <div class="ind-source">Source : `+ indicator['source'] + `</div>
                    </div>
                </div>`
        $('#indicatorList').append(ind_el);

        lsp_ind_el = `<div class="lsp-bubble-box">
                            <input type="radio" id="R`+ indicator['id'] + `" name="lsp-indicators" value="` + indicator['id'] + `" />
                            <label for="R`+ indicator['id'] + `" class="lsp-indicators-label">
                                <div class="check-disp">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                <span class="lsp-ind-title">`+ indicator['title'] + `</span>
                            </label>
                        </div>`
        $('#lspIndicatorList').append(lsp_ind_el);
    })
    sortIndicatorBoxes();

    // Add indicator event
    $('.ind-plus-box').off('click');
    $('.ind-plus-box').click(function () {
        let viz_type = current_indicator_step;
        let ind_id = $(this).parent().parent().attr('id');
        if (viz_type == 'year') {
            ind_key = ind_id + '.' + selected_year
        } else if (viz_type == 'serie') {
            ind_key = ind_id + '.' + selected_year_ts1 + '-' + selected_year_ts2
        }
        if (layers_on_map.includes(ind_key)) {
            addAlert('info', "L'indicateur sélectionné est déjà sur la carte pour cette année");
        } else {
            requested_indicator = [ind_key];
            addAlert('loading', 'Nous préparons votre indicateur');
            passQueryIndicator(ind_id, requested_indicator);
        }
    })
}
function createIndicatorListCohorte() {
    atlas_indicators_cohorte.forEach(function (indicator) {
        indicator_id_to_name_cohorte_dict[indicator['id']] = indicator['title'];
        lsp_ind_el = `<div class="lsp-bubble-box">
                            <input type="radio" id="C`+ indicator['id'] + `" name="lsp-indicators-coh" value="` + indicator['id'] + `" />
                            <label for="C`+ indicator['id'] + `" class="lsp-indicators-label">
                                <div class="check-disp">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                `+ indicator['title'] + `
                            </label>
                        </div>`
        $('#lspIndicatorListCohorte').append(lsp_ind_el);
    })
    // $('input[name="lsp-indicators-coh"]').first().prop('checked', true);
}
const coh_code_to_name_dict = {
    '0': 'Ensemble',
    '1': '1897-1901',
    '2': '1902-1906',
    '3': '1907-1911',
    '4': '1912-1916',
    '5': '1917-1921',
    '6': '1922-1926',
    '7': '1927-1931',
    '8': '1932-1936',
    '9': '1937-1941',
    '10': '1942-1946',
    '11': '1947-1951',
    '12': '1952-1956',
    '13': '1957-1961',
    '14': '1962-1966',
    '15': '1967-1971',
    '16': '1972-1976',
    '17': '1977-1981',
    '18': '1982-1986',
    '19': '1987-1991',
    '20': '1992-1996',
    '21': '1997-2001',
    '22': '2002-2006',
    '23': '2007-2011'
};
const RLS_code_to_name_dict = {}
function createRLSList() {

    // Fetch the GeoJSON data from the URL
    fetch(RLS_PATH)
        .then(response => response.json())  // Parse the JSON from the response
        .then(geojsonData => {
            // Loop through each feature and extract the 'code2' attribute
            geojsonData.features.forEach(function (feature) {
                const label = feature.properties.label;
                const code = feature.properties.code;
                RLS_code_to_name_dict[code] = label;
                lsp_ind_el = `<div class="lsp-bubble-box">
                        <input type="checkbox" id="`+ code + `" name="lsp-rls" value="` + code + `" />
                        <label for="`+ code + `" class="lsp-indicators-label">
                            <div class="check-disp">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            `+ label + `
                        </label>
                    </div>`
                $('#lspRLSList').append(lsp_ind_el);
            });
            wireCheckboxes();
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
}
function createCohList() {
    for (const [key, value] of Object.entries(coh_code_to_name_dict)) {
        coh_code_to_name_dict[key] = value;
        lsp_coh_el = `<div class="lsp-bubble-box">
                            <input type="checkbox" id="C`+ key + `" name="lsp-coh" value="` + key + `" />
                            <label for="C`+ key + `" class="lsp-indicators-label">
                                <div class="check-disp">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                `+ value + `
                            </label>
                        </div>`
        $('#lspCohorteList').append(lsp_coh_el);
    }
    // $('input[name="lsp-coh"]').first().prop('checked', true);
}



// =========== MAIN INDICATOR QUERY ===============
var trailing_output = {};
var master_dict = {}
let queryQueue = [];
let isQueryInProgress = false;
function passQueryIndicator(ind_id, requested_indicator, page_init = false) {
    // Push the new query into the queue
    queryQueue.push({ ind_id, requested_indicator });

    // If no query is currently in progress, start processing the queue
    if (!isQueryInProgress) {
        processQueue(page_init);
    }
}
function processQueue(page_init) {
    if (queryQueue.length === 0) {
        // No queries in the queue
        isQueryInProgress = false;
        return;
    }

    // Set the flag to true indicating that a query is in progress
    isQueryInProgress = true;

    // Get the next query from the queue
    var { ind_id, requested_indicator } = queryQueue.shift();

    addAlert('info', 'Nous préparons votre indicateur');


    fetch('/indicator_query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([requested_indicator]),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var final_output = data;
        trailing_output = { ...trailing_output, ...final_output };
        totalLayerCreation(final_output);
        if (page_init == false) {
            updateIndicatorsInURL(requested_indicator);
        }
        $('.map-box[data-nav="indicator"]').addClass('novis');
        $('.map-box[data-nav="indicator"]').removeClass('enlarge');
        $('.nav-link').removeClass('active');
        isQueryInProgress = false;
    })
    .catch(error => {
        console.log(error);
        addAlert('error', 'Erreur lors de la préparation de votre indicateur');
    })
    .finally(() => {
        // After the query is complete, check if there are more queries in the queue
        processQueue();
    });
}
const stroke_color = [50, 50, 50, 0.8];
const stroke_width = 0.3;
getStyleRedYelBlue = function (feature, resolution, data_dict, steps, palette, nb, TS = false) {
    code = feature.get('code');
    code = parseInt(code);

    if (TS == false) {
        var value = data_dict[code]['avg'];
    } else {
        var value = data_dict[code][nb]['avg'];
    }
    if (value == null) {
        return null;
    }
    else if (value >= steps[0] && value < steps[1]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[0]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (steps[1] && value < steps[2]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[1]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[2] && value < steps[3]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[2]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[3] && value < steps[4]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[3]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[4] && value < steps[5]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[4]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[5] && value < steps[6]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[5]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[6] && value < steps[7]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[6]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[7] && value < steps[8]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[7]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[8] && value < steps[9]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[8]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    else if (value >= steps[9] && value <= steps[10]) {
        style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: palette[9]
            }),
            stroke: new ol.style.Stroke({
                color: stroke_color,
                width: stroke_width
            })
        });
    }
    feature.setStyle(style);
};
function totalLayerCreation(final_output) {
    // Ajoute couches et legendes
    to_remove = [];
    for (let [key, value] of Object.entries(final_output)) {
        var ind_name;
        var ind_unit;
        let ind_split = key.split('.')
        let ind_id = ind_split[0];
        let ind_year = ind_split[1];

        var only_vals = [];
        var real_only_vals;
        if (ind_year.includes('-')) {
            for (const my_key in value) {
                only_vals.push(...value[my_key].map(v => v.avg));
            }
        } else {
            only_vals = Object.values(value).map(v => v.avg);
        }
        real_only_vals = only_vals.flat(1).filter(val => val !== null);
        this_ind = indicatorsKeyRef[ind_id];
        ind_name = this_ind['title'];
        ind_unit = UNIT_DICT[this_ind['unit']];
        ind_lowgood = this_ind['low_good'];
        var steps;
        var min_val = Math.min(...real_only_vals);
        var max_val = Math.max(...real_only_vals);
        var step = (max_val - min_val) / 10;
        steps = [min_val, min_val + (1 * step), min_val + (2 * step), min_val + (3 * step), min_val + (4 * step), min_val + (5 * step), min_val + (6 * step),
            min_val + (7 * step), min_val + (8 * step), min_val + (9 * step), max_val];
        master_dict[key] = [value, steps, ind_name, ind_lowgood];
        createAndAddLayer(key, ind_lowgood, master_dict);
        layers_on_map.push(String(key));
        addLegendItem(key, ind_name, ind_year, ind_unit, steps, ind_lowgood);

    }
}
function createAndAddLayer(key, ind_lowgood, master_dict) {
    const [minVal, maxVal] = master_dict[key] || [undefined, undefined];
    const reverseBreaks = key.includes('-');
    const colors = ind_lowgood ? BLUES_COLORS : BLUES_COLORS_REV;
    console.log(colors);

    const style_fct = (feature, resolution) =>
        getStyleRedYelBlue(feature, resolution, minVal, maxVal, colors, 0, reverseBreaks);

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
                }
            });
        } catch (err) {
            // no-op: extent may be invalid or view not ready
        }
    });

    return layer;
}
indicator_id_to_info_dict = {}
indicator_id_range_ref = {}
function addLegendItem(key, ind_name, ind_year, ind_unit, steps, ind_lowgood) {

    // ---------- helpers ----------
    const isRange = ind_year.includes('-');
    const [startYear, endYear] = isRange ? ind_year.split('-').map(Number) : [Number(ind_year), Number(ind_year)];
    const formatThousands = steps.some((n) => n > 1000);

    const formatStep = (n) => {
        if (formatThousands) return formatNumber(parseInt(n, 10)); // user-defined formatter
        return Number(n).toFixed(2);
    };

    const makeStepsRow = (vals) => {
        return `
      <div class="bottomvalspecial">
        ${vals
                .map((v, i) => {
                    const first = i === 0 ? 'boldy' : '';
                    const last = i === vals.length - 1 ? 'boldy last' : '';
                    const cls = [first || '', last || ''].join(' ').trim();
                    return `<span class="leg-sm-val ${cls}">${formatStep(v)}</span>`;
                })
                .join('')}
      </div>`;
    };

    const makeDateContainer = () => {
        if (!isRange) return '';
        return `
        <div class="leg-ind-range-row">
            <span class="leg-ind-ltitle">Année de visualisation</span>
            <input type="text" class="js-irs year-range" value="${startYear}" data-min="${startYear}" data-max="${endYear}" data-step="1"
                data-from="${startYear}" name="${key}-range" data-atlas="year-range">
       </div>`;
    };

    // ---------- color / gradient selection + registry ----------
    const gradClass = ind_lowgood ? 'yb-gradient' : 'by-gradient';
    const colors = ind_lowgood ? BLUES_COLORS : BLUES_COLORS_REV;
    indicator_id_to_info_dict[key] = [colors, gradClass, ind_unit];
    let idx = 0;
    if (isRange){
        indicator_id_range_ref[key] = {};
        for (let year = startYear; year <= endYear; year++) {
            indicator_id_range_ref[key][year] = idx++;
        }
    }

    // ---------- name / unit ----------
    const unitHTML = ind_unit === 'None' ? '' : `(${ind_unit})`;
    const finalName = ind_name;

    // ---------- value row ----------
    const bottomValSpecial = makeStepsRow(steps);

    // ---------- date container (range only) ----------
    const dateContainerHTML = makeDateContainer();

    // ---------- shared top icons ----------
    const iconsBase = `
    <div class="leg-ind-icon-box opacity" data-bs-toggle="tooltip"
        data-bs-placement="top" title="Opacité">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-contrast-icon lucide-contrast">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 18a6 6 0 0 0 0-12v12z" />
        </svg>
    </div>
    <div class="leg-ind-icon-box" data-bs-toggle="tooltip" data-bs-placement="top"
        title="À propos de cette couche">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-info-icon lucide-info">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    </div>
    <div class="leg-ind-icon-box remove" data-bs-toggle="tooltip" data-bs-placement="top"
        title="Supprimer la couche">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-trash2-icon lucide-trash-2">
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    </div>`;

    const timelapseBtn = `
    <div data-bs-toggle="tooltip" data-bs-placement="top"
        title="Partir le timelapse" class="timelapse-btn leg-ind-icon-box">
      <i class="fa-solid fa-play legend-icon legend-icon-play"></i>
    </div>`;

    const iconsHTML = isRange ? (timelapseBtn + iconsBase) : iconsBase;

    // ---------- legend block ----------
    const legendHTML = `
    <div class="leg-ind-ctn actual sortable-item"
         name="${key}" data-type="query">

      <div class="leg-ind-top">
        <div class="leg-ind-label">${finalName} ${unitHTML} - ${ind_year}</div>
        <div class="leg-ind-icons" name="${key}">
          ${iconsHTML}
        </div>
      </div>

      <div class="leg-ind-opacity-row">
            <span class="leg-ind-ltitle">Contrôle de l'opacité</span>
            <input type="text" class="js-irs" value="100" data-min="0" data-max="100" data-step="5"
                data-from="100" name="${key}" data-atlas="opacity">
       </div>

      ${dateContainerHTML}

      <div class="leg-ind-bot">
        <div class="${gradClass} gradient"></div>
        ${bottomValSpecial}
      </div>
    </div>`;

    // ---------- DOM insertion ----------
    $('#query-layers').prepend(legendHTML);

    // Timelapse: delegate + single binding per key
    const timeBtnSelector = `.leg-ind-icons[name="${key}"] .timelapse-btn`;
    $('#query-layers').off('click', timeBtnSelector).on('click', timeBtnSelector, function () {
        const layer_key = this.closest('.leg-ind-ctn').getAttribute('name');
        let is_first = checkIfLayerFirst(layer_key);
        if (is_first){
            displayStepsWithDelay(Object.values(indicator_id_range_ref[layer_key]), layer_key)
        } else{
            addAlert('info', "Veuillez déplacer cette couche en 1re position pour pouvoir partir le timelapse");
        }
    });

    initIonRange($('.js-irs'));
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]', html: true });
}
function addLegendItemThematic(key){
    // ---------- shared top icons ----------
    const iconsBase = `
        <div class="leg-ind-icon-box" data-bs-toggle="tooltip" data-bs-placement="top"
            title="À propos de cette couche">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-info-icon lucide-info">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
        </div>
        <div class="leg-ind-icon-box remove" data-bs-toggle="tooltip" data-bs-placement="top"
            title="Supprimer la couche">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-trash2-icon lucide-trash-2">
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
        </div>
    `;
    
    if (key == 'installations'){
        leg_item = `
            <div class="leg-ind-ctn actual sortable-item" name="${key}" data-type="thematic">
                <div class="leg-ind-top">
                    <div class="leg-ind-label">${thematicLayerDict[key]['title']}</div>
                    <div class="leg-ind-icons" name="${key}">
                        ${iconsBase}
                    </div>
                </div>
                <div class="leg-ind-bot gap-2rem them">
                    <div class="leg-ind-bot-group">
                        <img src="../../../static/image/icons/icon-public.svg" alt=""
                        class="thematic-svg">
                        <span class="leg-ind-bot-text">Installations publiques</span>
                    </div>
                    <div class="leg-ind-bot-group">
                        <img src="../../../static/image/icons/icon-private.svg" alt=""
                        class="thematic-svg">
                        <span class="leg-ind-bot-text">Installations privées</span>
                    </div>
                </div>
            </div>
        `
    }
    // ---------- DOM insertion ----------
    $('#thematic-layers').prepend(leg_item);
}
function removeLayer(key, layer_type){
    console.log(key, layer_type);
    $('.info-panel').addClass('novis');

    $(`.leg-ind-ctn[name="${key}"]`).remove();

    if (layer_type == 'query'){
        try {map.removeLayer(queryFocusLayer)}
        catch (err) {console.log(err)}
        thisLayer = getQueryLayerById(key);
        queryLayerGroup.getLayers().remove(thisLayer);
        layers_on_map = layers_on_map.filter(item => item !== key);
    } else if (layer_type == 'thematic'){
        thematicLayerDict[key]['mainLayer'].setVisible(false);
        thematicLayerDict[key]['clusterLayer'].setVisible(false);
        $(`.ind-plus-box-thematic[data-layer="${key}"]`).removeClass('onmap');
    }
    
    if (layers_on_map.length == 0) {
        let new_url = window.location.href.replace(key+'+', '+');
        window.history.pushState(null, null, new_url);
    }
    else {
        let new_url = window.location.href.replace(key+'+', '');
        window.history.pushState(null, null, new_url);
    }
}
function changeLayerOpacity(name, opacity){
    let thisLayer = getQueryLayerById(name);
    thisLayer.setOpacity(opacity/100);
}
function changeLayerYearViz(name, new_year){
    if (name.includes("-range")) {
        name = name.replace("-range", "");
    }
    let thisLayer = getQueryLayerById(name);
    let source = thisLayer.getSource();
    source.forEachFeature((feature) => {
        const colors = master_dict[name][3] ? BLUES_COLORS : BLUES_COLORS_REV;
        getStyleRedYelBlue(
            feature, 
            null, 
            master_dict[name][0],
            master_dict[name][1], 
            colors, 
            indicator_id_range_ref[name][new_year], 
            true);
    })
}
function makeFirstInLayerGroup(name){
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
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function displayStepsWithDelay(stepList, layerName) {
    addAlert('loading', 'Timelapse en cours');
    $(".leg-ind-ctn[name='" + layerName + "']").addClass('ts-running');
    loop_step = 0;
    thisLayer = getQueryLayerById(layerName);
    source = thisLayer.getSource();
    for (const step of stepList) {
        source.forEachFeature((feature) => {
            const colors = master_dict[layerName][3] ? BLUES_COLORS : BLUES_COLORS_REV;
            getStyleRedYelBlue(
                feature, 
                null, 
                master_dict[layerName][0],
                master_dict[layerName][1], 
                colors, 
                loop_step, 
                true);
        })
        let $input = $("input[name='" + layerName + "-range']");
        let slider = $input.data("ionRangeSlider");
        slider.update({
            from: Object.keys(indicator_id_range_ref[layerName])[loop_step]
        });
        await wait(1000);
        loop_step += 1;
    }
    // Timelapse is finished, going back to first value
    source.forEachFeature((feature) => {
        const colors = master_dict[layerName][3] ? BLUES_COLORS : BLUES_COLORS_REV;
        getStyleRedYelBlue(
            feature, 
            null, 
            master_dict[layerName][0],
            master_dict[layerName][1], 
            colors, 
            0, 
            true);
    })
    $("input[name='" + layerName + "-range']").data("ionRangeSlider").update({
        from: Object.keys(indicator_id_range_ref[layerName])[0]
    });
    $(".leg-ind-ctn[name='" + layerName + "']").removeClass('ts-running');
    addAlert('success', 'Timelapse terminé');
}
function checkIfLayerFirst(layer_key) {
    const firstChild = $("#query-layers").children().first();
    const firstName = firstChild.attr("name");
    return firstName === layer_key ? true : false;
}

// ====== Handle subtree changes in legend =========
function handleSubtreeChanges() {
    var $query = $('#query-layers');
    var $thematic = $('#thematic-layers');

    var len_query = $query.children().length;
    var len_thematic = $thematic.children().length;

    // --- New logic: hide or show each block ---
    if (len_query === 0) {
        $query.addClass('force-hidden');
    } else {
        $query.removeClass('force-hidden');
    }

    if (len_thematic === 0) {
        $thematic.addClass('force-hidden');
    } else {
        $thematic.removeClass('force-hidden');
    }
    // -----------------------------------------

    // Existing logic for .legend
    if (len_query === 0 && len_thematic === 0) {
        $('.legend').addClass('novis');
        $('.legend').removeClass('open');
    } else{
        $('.legend').removeClass('novis');
        $('.legend').addClass('open');
    }
}
var queryObserver = new MutationObserver(handleSubtreeChanges);
var thematicObserver = new MutationObserver(handleSubtreeChanges);
var observerConfig = { childList: true, subtree: true };
queryObserver.observe(document.getElementById('query-layers'), observerConfig);
thematicObserver.observe(document.getElementById('thematic-layers'), observerConfig);


// ============ Sortable legend items ========
const sortableCtn = document.getElementById('query-layers');
const sortable = new Sortable(sortableCtn, {
    animation: 150,
    onEnd: function () {
        makeFirstInLayerGroup(sortableCtn.firstElementChild.getAttribute('name'));
    }
});

function updateIndicatorsInURL(selected_indicators_merge) {
    var ind_string = '';
    for (const element of selected_indicators_merge) {
        ind_string += element + '+';
    }
    var current_url = window.location.href;
    var startMarker = "inds=";
    var endMarker = "&";

    var startIndex = current_url.indexOf(startMarker) + startMarker.length;
    var endIndex = current_url.indexOf(endMarker, startIndex);

    var current_indicators = current_url.substring(startIndex, endIndex);
    if (current_indicators == '+') {
        var new_url = current_url.replace(current_indicators, ind_string);
        window.history.pushState(null, null, new_url);
    }
    else {
        var merge_str = current_indicators + ind_string;
        var new_url = current_url.replace(current_indicators, merge_str);
        window.history.pushState(null, null, new_url);
    }
}


$(document).ready(function () {
    createCohList();
    createRLSList();
    createIndicatorList();
    createIndicatorListCohorte();
    resetChangeEvents();
    initIonRange($('.main-ion'));

    // Init tooltip
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]', html: true });

    if (window.location.pathname == '/') {
        var current_url = window.location.href;
        var new_url = current_url + 'inds=+&base=satLayer/'
        window.history.pushState(null, null, new_url);
    }
    // Récupère les infos de l'URL
    var url_inds = window.location.href.split('inds=')[1].split('+').slice(0, -1);
    var url_basemap = window.location.href.split('base=')[1].split('&')[0].slice(0, -1);
    current_basemap = url_basemap;
    seeSpecificBasemap(current_basemap);
    // Execute la requête AJAX selon les indicateurs dans l'URL
    if (url_inds[0] != '') {
        for (const element of url_inds) {
            let list_of_url_ind = [];
            list_of_url_ind.push(element);
            passQueryIndicator(element.split('.')[0], list_of_url_ind, true);
        }
    }
});

$(window).on('load', function(){
     $('#loading-overlay').fadeOut('slow');
});


$(window).click(function () {
    $('#filter-indicators-box').addClass('novis');
});


map.on('pointermove', function (event) {
    var pixel = map.getEventPixel(event.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getViewport().style.cursor = hit ? 'pointer' : '';
});

var queryFocusFeature;
var queryFocusSource;
var queryFocusLayer;
window.infoPanelIndicator = 'None';
var focusStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#01060cff',
        width: 4
    })
});
map.on('singleclick', function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        // Handle le cas où c'est une couche de query
        if (layer.get('type') == 'queryLayer'){
            const code = String(feature.get('code') ?? feature.getId() ?? '');
            if (!code) return false;
            
            // Extract feature infos
            let feature_code = code;
            let feature_name = feature.get('label');
            let feature_pop = feature.get('population_tot');
            let feature_pop_dens = parseInt(feature.get('densite_population'));
            let feature_age = feature.get('age_median');

            // Extract the layer title and feature value
            infoPanelIndicatorClicked = layer.get('title');

            if (infoPanelIndicatorClicked.includes('-')){
                feature_val = trailing_output[infoPanelIndicatorClicked][feature_code][currentStep]['avg'];
            } else{
                feature_val = trailing_output[infoPanelIndicatorClicked][feature_code]['avg'];
            }
        

            // Remove queryFocusLayer if allready there
            try {map.removeLayer(queryFocusLayer)}
            catch (err) {console.log(err)}
            
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
            // addAlert('info', 'Nous mettons à jour les graphiques');

            // Update les infos du info-panel
            ind_split = infoPanelIndicatorClicked.split('.'); 
            $('#info-panel-indicator').html(indicatorsKeyRef[ind_split[0]]['title']+' - '+ind_split[1]);
            $('#info-panel-label').html(feature_name);
            $('#info-panel-pop').html(new Intl.NumberFormat('fr-FR').format(feature_pop));
            $('#info-panel-pop-dens').html(new Intl.NumberFormat('fr-FR').format(feature_pop_dens));
            $('#info-panel-age-med').html(parseFloat(feature_age).toFixed(1));


            // Update le(s) graphique(s)
            setTimeout(() => {
                graphUpdateBellcurve(trailing_output, infoPanelIndicatorClicked, feature_val);
            }, 100);

            // ✅ Stop after handling the first queryLayer feature
            return true;
        }
        else if (layer.get('type') == 'thematicLayer'){
            
            console.log('this is a thematic layer');
            // ✅ Stop after handling the first queryLayer feature
            return true;
        }
        else{
            return false;
        }


    });
});


