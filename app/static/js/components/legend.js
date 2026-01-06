/**
 * legend.js
 * -------------------------
 * Functions regarding the legend
 * 
 *
**/

import {
    removeLayer,
    THEMATIC_LAYER_DICT,
    makeFirstInLayerGroup,
    displayStepsWithDelay,
    checkIfLayerFirst,
    initIonRange
} from "../map-and-layers.js";
import {
    reduceIndicatorBox,
    formatNumber,
    addAlert
} from "../utils.js";
import { CATEGORY_DICT } from "../global.js";



function updateMetadataModal(indicatorKey) {
    const rootKey = indicatorKey?.split('.')?.[0];
    const thisObject = indicatorsKeyRef?.[rootKey];
    if (!thisObject) return;

    const ignore = new Set(['low_good', 'ranking']);

    Object.keys(thisObject).forEach(field => {
        if (ignore.has(field)) return;

        const $target = $(`#mr-val-${field}`);
        if (!$target.length) return;

        if (field === 'category') {
            const entry = CATEGORY_DICT?.[thisObject[field]];
            if (!entry) {
                $target.text(thisObject[field] ?? '');
                return;
            }
            $target.html(`<div class="ind-badge ${entry[0]}">${entry[1]}</div>`);
        } else {
            $target.text(thisObject[field] ?? '');
        }
    });
}

$(document).on('click', '.leg-ind-icon-box.opacity', function () {
    $(this).closest('.leg-ind-ctn').toggleClass('opacity-active');
});
$(document).on('click', '.leg-ind-icon-box.metadata', function () {
    let name = $(this).parent().attr('name');
    updateMetadataModal(name);
    $('#metadataModal').modal('show');
});
$(document).on('click', '.leg-ind-icon-box.remove', function () {
    $(this).tooltip('dispose');
    let layer_key = $(this).closest('.leg-ind-ctn').attr('name');
    let layer_type = $(this).closest('.leg-ind-ctn').data('type');
    removeLayer(layer_key, layer_type);
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
    } else {
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
new Sortable(sortableCtn, {
    animation: 150,
    onEnd: function () {
        makeFirstInLayerGroup(sortableCtn.firstElementChild.getAttribute('name'));
    }
});



export function addLegendItemThematic(key) {
    let leg_item;
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

    if (key == 'installations') {
        leg_item = `
            <div class="leg-ind-ctn actual sortable-item" name="${key}" data-type="thematic">
                <div class="leg-ind-top">
                    <div class="leg-ind-label">${THEMATIC_LAYER_DICT[key]['title']}</div>
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
export function addLegendItem(key, ind_name, ind_year, ind_unit, steps, ind_lowgood) {

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
    indicatorIdToInfoDict[key] = [colors, gradClass, ind_unit];
    let idx = 0;
    if (isRange) {
        indicatorIdRangeRef[key] = {};
        for (let year = startYear; year <= endYear; year++) {
            indicatorIdRangeRef[key][year] = idx++;
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
    <div class="leg-ind-icon-box metadata" data-bs-toggle="tooltip" data-bs-placement="top"
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
        if (is_first) {
            displayStepsWithDelay(Object.values(indicatorIdRangeRef[layer_key]), layer_key)
        } else {
            addAlert('info', "Veuillez déplacer cette couche en 1re position pour pouvoir partir le timelapse");
        }
    });

    initIonRange($('.js-irs'));
    new bootstrap.Tooltip(document.body, { selector: '[data-bs-toggle="tooltip"]', html: true });
}