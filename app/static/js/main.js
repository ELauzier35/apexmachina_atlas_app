// import { 
//     createCohList,
//     createIndicatorListCohorte
// } from "./components/cohort.js"
import { 
    RLSLayer,
    queryLayerGroup,
    map,
    seeSpecificBasemap,
    initIonRange,
} from "./map-and-layers.js";
import { 
    LEVELS
} from "./components/tendency-checkbox.js";
import {
    createLevelsLists
} from "./components/tendency.js";
import { 
    createIndicatorList,
    resetChangeEvents,
    passQueryIndicator
} from "./components/map-indicators.js";
import {
    initProject,
    initProjectList
} from "./components/project.js";
import { startTour } from "./components/guided-tour.js";
import {} from "./components/dispersion.js";


// Global Variables
// Tell what if the current user "timeframe" for map indicator ("year" or "serie")
window.currentIndicatorStep = 'year';
// Tell what level of tendency is select
window.currentTendencyLevel = 'RLS';
// Current tendency data displayed and tendency indicator Id
window.currentTendencyData = null;
window.currentTendencyId = null;
window.currentTendencyEndYear = '2022';
// Dict that stores the provincial timeseries for indicatorId
window.provincialTimeseries = {};
// The basemap currently activated
window.currentBasemap = 'satLayer';
// Global variable for the timeout used in the alert
window.theTimeout = null;
// Dict that links RLS, RTS and RSS codes to their label
// { 112 : 'RLS de Rivière-du-Loup', etc. }
window.RLSCodeToNameDict = {}
window.RTSCodeToNameDict = {}
window.RSSCodeToNameDict = {}
// Dict that links the indicators codes to their label
// { age : 'Âge médian', etc. }
window.indicatorIdToNameDict = {}
// Dict that links the cohort indicators to their label
// { age : 'Âge', etc. }
window.indicatorIdToNameCohortDict = {}
// Dict that stores the data-dict for all the query indicators asked during the session
window.trailingOutput = {};
// The main dict storing data, steps, indicator name & ind_lowgood
// { 'coutactes.2022' : [data_dict, steps, name, ind_lowgood ], etc. }
window.masterDict = {}
// Dict that stores gradient, gradient-class and unit
// { 'coutactes.2022' : [gradient_array, gradient_css_class, unit], etc. }
window.indicatorIdToInfoDict = {}
// For TS indicators, dict that links the actual year to a numerical index
// { 'coutactes.2018-2022' : { 2018 : 0, 2019 : 1, 2020 : 2, 2021 : 3, 2022 : 4}}
window.indicatorIdRangeRef = {}
// For TS indicators, dict that stores at which steps the indicator is currently at
// { 'coutactes.2018-2022' : 2 } ex. The indicator is at step 2, so year 2020
window.indicatorIdToStep = {}
// Queue for the queryIndicators
window.queryQueue = [];
// Boolean that tells if a query is currently in progress
window.isQueryInProgress = false;
// Global feature, source and layer for the query layer creation
window.queryFocusFeature = null;
window.queryFocusSource = null;
window.queryFocusLayer = null;
// Stores the ID of the current indicator displayed in the info-panel
window.infoPanelIndicator = 'None';
// Stores the list of ID of indicators currently displayed on the map
window.layersOnMap = [];
// Boolean that tells if the tendency mapbox is currently opened
window.tendencyActivated = false;
window.pageInit = true;


// Main navigation
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
            LEVELS[currentTendencyLevel].layer.setVisible(false);
            LEVELS[currentTendencyLevel].focus.layer.setVisible(false);
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
        tendencyActivated = true;
        console.log(LEVELS[currentTendencyLevel])
        LEVELS[currentTendencyLevel].focus.layer.setVisible(true);
        LEVELS[currentTendencyLevel].layer.setVisible(true);
        queryLayerGroup.setVisible(false);
        try {map.removeLayer(queryFocusLayer)}
        catch (err) {console.log(err)}
    } else {
        tendencyActivated = false;
        queryLayerGroup.setVisible(true);
        LEVELS[currentTendencyLevel].focus.layer.setVisible(false);
        LEVELS[currentTendencyLevel].layer.setVisible(false);
    }
});


// Document ready initialisation
$(document).ready(function () {
    initProjectList();
    // createCohList();
    createLevelsLists();
    createIndicatorList(project ? project.indicators : "all");
    // createIndicatorListCohorte();
    resetChangeEvents();
    initIonRange($('.main-ion'));

    // Init tooltip
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]', html: true });

    const hasQuery = window.location.search !== "";
    if (!hasQuery || project != null) {
        const indsValue = project == null ? "+" : init_inds;
        const newUrl = `${window.location.pathname}?inds=${indsValue}&base=satLayer`;

        if (newUrl !== window.location.pathname + window.location.search) {
            window.history.replaceState(null, "", newUrl);
        }
    }
    // Récupère les infos de l'URL
    currentBasemap = init_base;
    seeSpecificBasemap(init_base);
    // Execute la requête AJAX selon les indicateurs dans l'URL
    if (init_inds != '+') {
        tourInAction = false;
        init_inds = init_inds.split("+").filter(Boolean).map(s => `${s}`);
        for (const element of init_inds) {
            passQueryIndicator(element.split('.')[0], [element], true);
        }
    }
    initProject();
    if (tourInAction){
        startTour();
    }

});