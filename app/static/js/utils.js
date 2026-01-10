/**
 * utils.js
 * -------------------------
 * Collection of general-purpose helper functions used across the application.
 * 
 * This module contains:
 * - formatting utilities (numbers, strings, dates)
 * - URL and parameter parsing helpers
 * - small reusable functions with no dependencies
 *
**/


export function formatNumber(number) {
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
export function addAlert(type, message) {
    if (theTimeout) clearTimeout(theTimeout);

    const $alert = $("#mainAlert");

    // ensure it becomes visible
    $alert.removeClass("novis");

    // set state class (keep novis separate)
    $alert.removeClass("loading success error info warning"); // list your possible types
    $alert.addClass(type);

    $(".alert-msg").html(message);

    if (type !== "loading") {
        theTimeout = setTimeout(() => {
            $alert.addClass("novis");
        }, 3500);
    }
}
export function getNameWithYear(key) {
    let ind_split = key.split('.');
    let name;
    if (ind_split[1].includes('-')) {
        let currentStep = indicatorIdToStep[key];
        let currentYear = Object.keys(indicatorIdRangeRef[key])[currentStep];
        name = indicatorsKeyRef[ind_split[0]]['title'] + ' - ' + currentYear;
    } else {
        name = indicatorsKeyRef[ind_split[0]]['title'] + ' - ' + ind_split[1];
    }
    return name;
}
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const key = 'pk.eyJ1IjoiZXRpZW5uZWxhdXppZXIiLCJhIjoiY2t3YmViMGt3MnJwZzJ1bXAzb2pxemw3eiJ9.at1eB1bjMUzZvOx9FvzCDA'
export function pearsonCorrelation(prefs, p1, p2) {
    var si = [];

    for (var key in prefs[p1]) {
        if (prefs[p2][key] !== null && prefs[p1][key] !== null && prefs[p2][key] !== undefined && prefs[p1][key] !== undefined) {
            si.push(key);
        }
    }

    var n = si.length;

    if (n == 0) return 0;

    var sum1 = 0;
    for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

    var sum2 = 0;
    for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

    var sum1Sq = 0;
    for (var i = 0; i < si.length; i++) {
        sum1Sq += Math.pow(prefs[p1][si[i]], 2);
    }

    var sum2Sq = 0;
    for (var i = 0; i < si.length; i++) {
        sum2Sq += Math.pow(prefs[p2][si[i]], 2);
    }

    var pSum = 0;
    for (var i = 0; i < si.length; i++) {
        pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
    }

    var num = pSum - (sum1 * sum2 / n);
    var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
        (sum2Sq - Math.pow(sum2, 2) / n));

    if (den == 0) return 0;

    return num / den;
}

export function closeAllMapBoxes() {
    $('.map-box').addClass('novis');
    $('.result-map-box').addClass('novis');
    $('.nav-link').removeClass('active');
}

export function generateYearList(dateRange) {
    const [startDate, endDate] = dateRange.split('-');

    const startYear = parseInt(startDate);
    const endYear = parseInt(endDate);

    const yearList = [];

    for (let year = startYear; year <= endYear; year++) {
        yearList.push(year);
    }

    return yearList;
}
export function enlargeIndicatorBox(nav) {
    if (nav == 'tendency') {
        $(`.result-map-box[data-nav="tendency"]`).addClass('novis');
    }
    $(`.map-box[data-nav="${nav}"]`).addClass('enlarge');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip('dispose');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).attr('title', 'Réduire');
    $(`.map-box[data-nav="${nav}"] .enlarge-mb`).tooltip();
}
export function reduceIndicatorBox(nav) {
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
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function updateIndicatorsInURL(selected_indicators_merge) {
    let ind_string = '';
    for (const element of selected_indicators_merge) {
        ind_string += element + '+';
    }
    let current_url = window.location.href;
    let startMarker = "inds=";
    let endMarker = "&";

    let startIndex = current_url.indexOf(startMarker) + startMarker.length;
    let endIndex = current_url.indexOf(endMarker, startIndex);

    let current_indicators = current_url.substring(startIndex, endIndex);
    if (current_indicators == '+') {
        let new_url = current_url.replace(current_indicators, ind_string);
        window.history.pushState(null, null, new_url);
    }
    else {
        let merge_str = current_indicators + ind_string;
        let new_url = current_url.replace(current_indicators, merge_str);
        window.history.pushState(null, null, new_url);
    }
}



$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});
$(window).click(function () {
    $('#filter-indicators-box').addClass('novis');
    $('.project-sp').removeClass('open');
});
