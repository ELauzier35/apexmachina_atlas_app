/**
 * map-indicators.js
 * -------------------------
 * Functions regarding the map indicators mapbox
 * 
 *
**/

import {
    addAlert,
    updateIndicatorsInURL
} from "../utils.js";
import {
    CATEGORY_DICT,
    SOURCE_DICT,
    DISPERSION_INDICATORS
} from "../global.js";
import {
    THEMATIC_LAYER_DICT,
    totalLayerCreation
} from "../map-and-layers.js";
import {
    addLegendItemThematic,
} from "./legend.js";
import { closeTour } from "./guided-tour.js";


// Dynamically create indicators, RLS and cohorte list at the loading of the page
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
export async function createIndicatorList(ind_list = "all") {

    // Clear containers if you recreate the list multiple times
    $("#indicatorList").empty();
    $("#lspIndicatorListDispersion").empty();
    $("#lspIndicatorList").empty();

    const allowedIds =
        ind_list === "all"
            ? null
            : new Set(Array.isArray(ind_list) ? ind_list : []);

    atlas_indicators
        .filter(ind => allowedIds === null || allowedIds.has(ind.id))
        .forEach(function (indicator) {
            indicatorIdToNameDict[indicator["id"]] = indicator["title"];

            let ind_el = `<div id="${indicator["id"]}" class="indicator-box"
                    data-type="${CATEGORY_DICT[indicator["category"]][0]}"
                    data-source="${SOURCE_DICT[indicator["source"]][0]}"
                    data-title="${indicator["title"]}">
                    <div class="ind-top-row">
                        <div class="ind-badge ${CATEGORY_DICT[indicator["category"]][0]}">${CATEGORY_DICT[indicator["category"]][1]}</div>
                        <div class="ind-plus-box" data-bs-toggle="tooltip" data-bs-placement="top"
                            title="Ajouter" data-bs-original-title="Ajouter">
                            <i class="fa-solid fa-plus"></i>
                        </div>
                    </div>
                    <div class="ind-main-section">
                        <div class="ind-main-top">
                            <div class="ind-title">${indicator["title"]}</div>
                            <div class="ind-subtitle">${indicator["short_description"]}</div>
                        </div>
                        <div class="ind-source">Source : ${indicator["source"]}</div>
                    </div>
                </div>`;

            $("#indicatorList").append(ind_el);

            if (DISPERSION_INDICATORS.includes(indicator["id"])){
                let lsp_ind_el_disp = `<div class="lsp-bubble-box">
                            <input type="radio" id="D${indicator["id"]}" name="lsp-indicators-disp" value="${indicator["id"]}" />
                            <label for="D${indicator["id"]}" class="lsp-indicators-label">
                                <div class="check-disp">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                <span class="lsp-ind-title">${indicator["title"]}</span>
                            </label>
                        </div>`;

                $("#lspIndicatorListDispersion").append(lsp_ind_el_disp);
            }

            let lsp_ind_el = `<div class="lsp-bubble-box">
                            <input type="radio" id="R${indicator["id"]}" name="lsp-indicators" value="${indicator["id"]}" />
                            <label for="R${indicator["id"]}" class="lsp-indicators-label">
                                <div class="check-disp">
                                    <i class="fa-solid fa-check"></i>
                                </div>
                                <span class="lsp-ind-title">${indicator["title"]}</span>
                            </label>
                        </div>`;

            $("#lspIndicatorList").append(lsp_ind_el);
        });

    sortIndicatorBoxes();

    // Add indicator event
    $(".ind-plus-box").off("click").on("click", function () {
        let viz_type = currentIndicatorStep;
        let ind_id = $(this).closest(".indicator-box").attr("id");

        let ind_key;
        if (viz_type === "year") {
            ind_key = ind_id + "." + selectedYear;
        } else if (viz_type === "serie") {
            ind_key = ind_id + "." + selectedYearTS1 + "-" + selectedYearTS2;
        }

        if (layersOnMap.includes(ind_key)) {
            addAlert("info", "L'indicateur sélectionné est déjà sur la carte pour cette année");
        } else {
            if (isQueryInProgress == false){
                let requested_indicator = [ind_key];
                addAlert("loading", "Nous préparons votre indicateur");
                passQueryIndicator(ind_id, requested_indicator);
                if (tourInAction){
                    closeTour(false);
                }
            }
        }
    });
}

// Reset the change events for badge count and filters
export function resetChangeEvents() {
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



$('#filter-indicators').click(function (event) {
    event.stopPropagation();
    $('#filter-indicators-box').toggleClass('novis');
})
$('#filter-indicators-box').click(function (event) {
    event.stopPropagation();
})
$('#nameSearch').click(function () {
    $('#nameSearchRow').toggleClass('visible');
})

$('.tab-el.map-ind').click(function () {
    let targetTab = $(this).data('tab');
    if ($(this).hasClass('active') == false) {
        $('.tab-el.map-ind').removeClass('active');
        $(this).addClass('active');
        $('.year-dropdown').removeClass('visible');
        $(`.year-dropdown[data-tab="${targetTab}"]`).addClass('visible');
        currentIndicatorStep = targetTab;
    }
})

$('.ind-plus-box-thematic').click(function () {
    const thisLayer = $(this).data('layer');
    if ($(this).hasClass('onmap')) {
        THEMATIC_LAYER_DICT[thisLayer]['mainLayer'].setVisible(false);
        THEMATIC_LAYER_DICT[thisLayer]['clusterLayer'].setVisible(false);
        $(this).removeClass('onmap');
        $(`.leg-ind-ctn[name="${thisLayer}"`).remove();
    } else {
        THEMATIC_LAYER_DICT[thisLayer]['mainLayer'].setVisible(true);
        THEMATIC_LAYER_DICT[thisLayer]['clusterLayer'].setVisible(true);
        $(this).addClass('onmap');
        addLegendItemThematic(thisLayer);
    }
})



// =========== MAIN INDICATOR QUERY ===============
export function passQueryIndicator(ind_id, requested_indicator, page_init = false) {
    // Push the new query into the queue
    queryQueue.push({ ind_id, requested_indicator });

    // If no query is currently in progress, start processing the queue
    if (!isQueryInProgress) {
        processQueue(page_init);
    }
}
function processQueue(page_init) {
    if (queryQueue.length === 0) {
        return;
    }

    // Set the flag to true indicating that a query is in progress
    isQueryInProgress = true;

    // Get the next query from the queue
    var { ind_id, requested_indicator } = queryQueue.shift();

    addAlert('loading', 'Nous préparons votre indicateur');


    fetch('/indicator_query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([requested_indicator]),
    })
        .then(response => response.json())
        .then(data => {
            let final_output = data;
            trailingOutput = { ...trailingOutput, ...final_output };
            totalLayerCreation(final_output);
            if (page_init == false) {
                updateIndicatorsInURL(requested_indicator);
            }
            $('.map-box[data-nav="indicator"]').addClass('novis');
            $('.map-box[data-nav="indicator"]').removeClass('enlarge');
            $('.nav-link').removeClass('active');
        })
        .catch(error => {
            addAlert('error', 'Erreur lors de la préparation de votre indicateur');
        })
        .finally(() => {
            // After the query is complete, check if there are more queries in the queue
            processQueue();
        });
}