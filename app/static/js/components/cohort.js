/**
 * cohort.js
 * -------------------------
 * Everything about cohort mapbox
 * 
 *
**/
import { addAlert } from "../utils.js";
import { 
    COH_CODE_TO_NAME_DICT,
    DIM_OPACITY,
    BASE_OPACITY,
    THICK_WIDTH
} from "../global.js";
import { cohortChart } from "./charts.js";
import { 
    signClass, 
    formatPercent, 
    formatNumberTendency 
} from "./tendency.js";


var current_cohort_indicator = null;


export function createIndicatorListCohorte() {
    atlas_indicators_cohorte.forEach(function (indicator) {
        indicatorIdToNameCohortDict[indicator['id']] = indicator['title'];
        let lsp_ind_el = `<div class="lsp-bubble-box">
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
}
export function createCohList() {
    for (const [key, value] of Object.entries(COH_CODE_TO_NAME_DICT)) {
        COH_CODE_TO_NAME_DICT[key] = value;
        let lsp_coh_el = `<div class="lsp-bubble-box">
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
}


function retrieveCohortInputs() {
    const cohort_indicator = $('input[name="lsp-indicators-coh"]:checked').val();
    const cohort_codes = $('input[name="lsp-coh"]:checked').map(function () {
        return this.value;
    }).get();

    return [cohort_indicator, cohort_codes];
}
function computeCohortStats(seriesByCode, startYear = 1996, window = 5) {
    const round = (x, n = 3) => (x == null ? null : Number(x.toFixed(n)));
    const out = {};

    for (const [code, arr] of Object.entries(seriesByCode)) {
        if (!Array.isArray(arr) || arr.length === 0) continue;

        // Find first and last non-null indices
        let firstIdx = null;
        let lastIdx = null;

        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (v == null) continue;
            if (firstIdx === null) firstIdx = i;
            lastIdx = i;
        }

        // If everything is null, skip this code
        if (firstIdx === null) continue;

        const first = arr[firstIdx];
        const last = arr[lastIdx];

        const total_variation =
            first === 0 ? null : ((last - first) / first) * 100;

        // Average over non-null values only
        const nonNullValues = arr.filter(v => v != null);
        const avg =
            nonNullValues.reduce((s, v) => s + v, 0) / nonNullValues.length;

        // Max over non-null values between firstIdx and lastIdx
        let maxIdx = firstIdx;
        for (let i = firstIdx + 1; i <= lastIdx; i++) {
            const v = arr[i];
            if (v != null && v > arr[maxIdx]) {
                maxIdx = i;
            }
        }
        const max_year = startYear + maxIdx;

        out[code] = {
            total_variation: round(total_variation),
            avg: round(avg),
            max_year: max_year
        };
    }
    return out;
}
function displayCohortStats(tendencyStats, {
    cohNameMap = COH_CODE_TO_NAME_DICT,
    currency = null,
    showPercentSign = false,
    } = {}) {
    let html = '';

    for (const [code, stats] of Object.entries(tendencyStats)) {
        const name = cohNameMap?.[code] ?? code;

        const tv = stats.total_variation;
        const avg = stats.avg;
        const maxYear = stats.max_year;
        

        const tvClass = signClass(tv);  // "up" | "down" | "flat" | ""

        const tvText = formatPercent(tv, { showSign: showPercentSign });
        const avgText = formatNumberTendency(avg, { currency });
        const maxYearText = maxYear ?? '—';

        html += `
        <div class="rls-stats-section stats-sec-coh" data-id="${String(code)}">
            <div class="mb-sub-title just-flex-start">
                <i class="fa-solid fa-users" style="color:var(--primary)"></i>
                <span>Cohorte ${name}</span>
            </div>
            <div class="grid-3">
                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Évolution entre le début et la fin de la période observée.">
                        Variation totale
                    </div>
                    <div class="mb-sb-val">
                    <div class="mb-sb-pb ${tvClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${tvClass}">${tvText}</div>
                    </div>
                </div>

                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Valeur moyenne de l’indicateur sur la période.">
                        Moyenne
                    </div>
                    <div class="mb-sb-val">
                    <div class="mb-sb-val-actual">${avgText}</div>
                    </div>
                </div>

                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Année où l’indicateur atteint sa valeur la plus élevée.">
                        Année max
                    </div>
                    <div class="mb-sb-val">
                    <div class="mb-sb-val-actual">${maxYearText}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    return html;
}
function updateCohortChart(seriesByCode) {
    cohortChart.series.slice().forEach(s => s.remove());
    for (const [code, arr] of Object.entries(seriesByCode)) {
        cohortChart.addSeries({
            name: COH_CODE_TO_NAME_DICT[code],
            data: arr,
            id: String(code)
        });
    }
}



$('#view-cohort').click(function () {
    let result = retrieveCohortInputs();
    if (result[0] == undefined) {
        addAlert('info', 'Veuillez choisir un indicateur');
    } else if (result[1].length == 0){
        addAlert('info', 'Veuillez choisir une ou plusieurs cohorte(s)');
    }else {
        addAlert('loading', 'Nous calculons vos tendances par cohorte');
        current_cohort_indicator = result[0];
        fetch('/cohort_query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([result[0], result[1]]),
            })
            .then(response => response.json())
            .then(data => {
                // 1) Compute statistics for each RLS
                let cohortStats = computeCohortStats(data);
                // 2) Display statistics in result-map-box
                let this_currency
                if (indicatorsKeyRef[current_cohort_indicator]['unit'] == '$ CAN moyen') {
                    this_currency = "CAD";
                } else {
                    this_currency = null;
                }
                const html = displayCohortStats(cohortStats, {
                    cohNameMap: COH_CODE_TO_NAME_DICT,
                    currency: this_currency,         
                    showPercentSign: false,
                    includeRank: false
                });
                document.querySelector('.cohort-stats-grid').innerHTML = html;
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl, {
                        html: true,
                    })
                })
                $(".stats-sec-coh").off('hover');
                $(".stats-sec-coh").hover(
                    function () {
                        const id = String($(this).data("id"));
                        const target = cohortChart.get(id);
                        if (!target) return;

                        (cohortChart.series || []).forEach(s => {
                        if (!s.visible || !s.group) return;

                        const isTarget = s === target;
                        s.group.attr({ opacity: isTarget ? 1 : DIM_OPACITY });

                        const baseWidth = (s.options && s.options.lineWidth) || 2;
                        if (s.graph) s.graph.attr({ "stroke-width": isTarget ? THICK_WIDTH : baseWidth });
                        });
                    },
                    function () {
                        (cohortChart.series || []).forEach(s => {
                        if (!s.visible || !s.group) return;

                        s.group.attr({ opacity: BASE_OPACITY });

                        const baseWidth = (s.options && s.options.lineWidth) || 2;
                        if (s.graph) s.graph.attr({ "stroke-width": baseWidth });
                        });
                    }
                );
                // 3) Update tendency chart
                updateCohortChart(data);
                // 4) Display the result-map-box
                $('#cohortIndicatorName').html(indicatorIdToNameDict[result[0]].toLowerCase());
                $('.result-map-box[data-nav="cohort"]').removeClass('novis');
                $('.map-box[data-nav="cohort"]').removeClass('enlarge');
                $('.map-box[data-nav="cohort"]').addClass('novis');
                $('.nav-link').removeClass('active');
                addAlert('success', 'Vos tendances par cohorte sont prêtes');
            })
            .catch(error => {
                console.log(error);
                addAlert('error', 'Erreur lors du calcul des tendances par cohorte');
            });
    }

})