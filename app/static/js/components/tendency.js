/**
 * tendency.js
 * -------------------------
 * Functions regarding the tendency mapbox
 * 
 *
**/
import {
    DIM_OPACITY,
    BASE_OPACITY,
    THICK_WIDTH,
    RLS_PATH,
    RTS_PATH,
    RSS_PATH
} from "../global.js";
import { tendencyChart } from "./charts.js";
import { addAlert } from "../utils.js";
import {
    LEVELS,
    wireCheckboxes
} from "./tendency-checkbox.js";

var current_tendency_indicator = null;

async function createLevelsListFor({ path, listSelector, checkboxName, codeToNameDict }) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const geojsonData = await res.json();
        const $list = $(listSelector);
        const frag = document.createDocumentFragment();

        for (const feature of geojsonData.features) {
            const { label, code } = feature.properties;

            if (codeToNameDict) codeToNameDict[code] = label;

            const box = document.createElement('div');
            box.className = 'lsp-bubble-box';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = code;
            input.name = checkboxName;
            input.value = code;

            const lab = document.createElement('label');
            lab.htmlFor = code;
            lab.className = 'lsp-indicators-label';

            const checkDisp = document.createElement('div');
            checkDisp.className = 'check-disp';

            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-check';

            checkDisp.appendChild(icon);
            lab.appendChild(checkDisp);
            lab.appendChild(document.createTextNode(label));

            box.appendChild(input);
            box.appendChild(lab);

            frag.appendChild(box);
        }

        $list.append(frag);
    } catch (err) {
        console.error(`Error loading GeoJSON data (${path}):`, err);
    }
}
let lvlToNameDict = {}
export async function createLevelsLists() {
    await Promise.all([
        createLevelsListFor({
            path: RLS_PATH,
            listSelector: '#lspRLSList',
            checkboxName: 'lsp-rls',
            codeToNameDict: RLSCodeToNameDict
        }),
        createLevelsListFor({
            path: RTS_PATH,
            listSelector: '#lspRTSList',
            checkboxName: 'lsp-rts',
            codeToNameDict: RTSCodeToNameDict
        }),
        createLevelsListFor({
            path: RSS_PATH,
            listSelector: '#lspRSSList',
            checkboxName: 'lsp-rss',
            codeToNameDict: RSSCodeToNameDict
        })
    ]);
    lvlToNameDict = {
        'RLS': RLSCodeToNameDict,
        'RTS': RTSCodeToNameDict,
        'RSS': RSSCodeToNameDict,
    }
    wireCheckboxes(); // si ça s'applique aux 3 listes
}


function retrieveTendencyInputs() {
    const tendency_indicator = $('input[name="lsp-indicators"]:checked').val();
    const tendency_codes = $(`input[name="lsp-${currentTendencyLevel.toLowerCase()}"]:checked`).map(function () {
        return this.value;
    }).get();

    return [tendency_indicator, tendency_codes];
}
window.computeTendencyStats = function (
    seriesByCode,
    provSeries,
    startYear = 1996,
    endYear = 2022,
    window = 5,
    baseYear = 1996
    ) {
    const round = (x, n = 3) => (x == null ? null : Number(x.toFixed(n)));
    const out = {};

    // Convert selected years to indices relative to the underlying arrays
    let startIdx = startYear - baseYear;
    let endIdx = endYear - baseYear;

    // Ensure startIdx <= endIdx
    if (startIdx > endIdx) [startIdx, endIdx] = [endIdx, startIdx];

    // Helper: safely slice between startIdx and endIdx (inclusive)
    const sliceByYears = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        const s = Math.max(0, Math.min(arr.length - 1, startIdx));
        const e = Math.max(0, Math.min(arr.length - 1, endIdx));
        if (e < s) return [];
        return arr.slice(s, e + 1);
    };

    // Province sliced to selected [startYear..endYear]
    const provArr = sliceByYears(provSeries);
    const provOk = provArr.length > 0;

    const provFirst = provOk ? provArr[0] : null;
    const provLast = provOk ? provArr[provArr.length - 1] : null;

    // Province 5y variation within the selected range
    const provWStartIdx = provOk ? Math.max(0, provArr.length - window) : null;
    const provWStart = provOk ? provArr[provWStartIdx] : null;

    const provFiveVar =
        !provOk || provWStart == null || provLast == null || provWStart === 0
            ? null
            : ((provLast - provWStart) / provWStart) * 100;

    for (const [code, rawArr] of Object.entries(seriesByCode)) {
        const arr = sliceByYears(rawArr);
        if (arr.length === 0) continue;

        const first = arr[0];
        const last = arr[arr.length - 1];

        // Total variation over selected range
        const total_variation =
            first == null || first === 0 || last == null ? null : ((last - first) / first) * 100;

        // 5y variation over selected range (last N points of the selected range)
        const wStartIdx = Math.max(0, arr.length - window);
        const wStart = arr[wStartIdx];

        const five_var =
            wStart == null || last == null || wStart === 0 ? null : ((last - wStart) / wStart) * 100;

        // Delta vs province at selected endYear (last point of selected range)
        const delta_vs_prov =
            provLast == null || last == null || provLast === 0 ? null : ((last - provLast) / provLast) * 100;

        // Divergence vs province (5y): difference in 5y variations (percentage points)
        const divergence_vs_province_5y =
            five_var == null || provFiveVar == null ? null : (five_var - provFiveVar);

        // Max year within the selected range
        let maxIdxLocal = 0;
        for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxIdxLocal]) maxIdxLocal = i;

        const max_year = startYear + maxIdxLocal; // because arr[0] corresponds to startYear

        out[code] = {
            total_variation: round(total_variation),
            variation_5y: round(five_var),
            delta_vs_province: round(delta_vs_prov),
            divergence_vs_province_5y: round(divergence_vs_province_5y),
            max_year
        };
    }

    return out;
};
window.setTendencyRangeByYears = function (startYear, endYear) {
    let BASE_YEAR = 1996;
    const xAxis = tendencyChart.xAxis[0];
    const minIdx = startYear - BASE_YEAR;
    const maxIdx = endYear - BASE_YEAR;
    xAxis.setExtremes(minIdx, maxIdx, true, false);
}

const nfNumber = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 });
const nfPercent1 = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 });
export function signClass(value) {
    if (value == null || isNaN(value)) return ''; // no class if unknown
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
}
export function formatPercent(value, { showSign = false } = {}) {
    if (value == null || isNaN(value)) return '—';
    const abs = Math.abs(value);
    const base = nfPercent1.format(abs) + '%';
    if (!showSign) return base;
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return sign + base;
}
export function formatNumberTendency(value, { currency = null } = {}) {
    if (value == null || isNaN(value)) return '—';

    // Determine decimal precision dynamically
    const decimals = value > 0 && value < 1 ? 3 : 1;

    if (currency) {
        return new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value)
    }

    // If you have a plain number formatter, adjust it too
    return new Intl.NumberFormat('fr-CA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}
// Minimal ordinal in French for small integers (1er, 2e, etc.)
function formatOrdinalFr(n) {
    if (n == null || isNaN(n)) return '—';
    return n === 1 ? '1<sup>ere</sup>' : `${n}<sup>e</sup>`;
}
function displayTendencyStats(tendencyStats, {
    rlsNameMap = RLSCodeToNameDict,
    showPercentSign = false,
    } = {}) {
    let html = '';

    for (let [code, stats] of Object.entries(tendencyStats)) {
        let name = rlsNameMap?.[code] ?? code;

        let tv = stats.total_variation;
        let fv = stats.variation_5y;
        let ecart = stats.delta_vs_province;
        let div = stats.divergence_vs_province_5y;
        let rank;
        try {
            rank = indicatorsKeyRef[current_tendency_indicator]['ranking'][currentTendencyLevel][code];
        } catch (err) {
            rank = 'N/A';
        }


        let tvClass = signClass(tv);  // "up" | "down" | "flat" | ""
        let fvClass = signClass(fv);
        let ecClass = signClass(ecart);
        let divClass = signClass(div);

        let tvText = formatPercent(tv, { showSign: showPercentSign });
        let fvText = formatPercent(fv, { showSign: showPercentSign });
        let ecText = formatPercent(ecart, { showSign: showPercentSign });
        let divText = formatPercent(div, { showSign: showPercentSign });
        let rankText = formatOrdinalFr(rank);

        html += `
        <div class="rls-stats-section stats-sec" data-id="${String(code)}">
            <div class="mb-sub-title space-between">
                    <div class="just-flex-start">
                        <i class="fa-solid fa-location-dot" style="color:var(--primary)"></i>
                        <span>${name}</span>
                    </div>
                    <div class="remove-grid-item" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true" title="Supprimer">
                        <i class="fa-solid fa-trash-can"></i>
                    </div>
            </div>
            <div class="grid-5">
                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Évolution entre le début et la fin de la période observée.">
                        Variation totale
                    </div>
                    <div class="mb-sb-val" data-name="total_variation">
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
                        title="Évolution observée sur les cinq dernières années.">
                        Variation (5 ans)
                    </div>
                    <div class="mb-sb-val" data-name="variation_5y">
                        <div class="mb-sb-pb ${fvClass}">
                            <i class="fa-solid fa-arrow-up"></i>
                            <i class="fa-solid fa-arrow-down"></i>
                        </div>
                        <div class="mb-sb-val-actual ${fvClass}">${fvText}</div>
                    </div>
                </div>

                <div class="mb-stats-box">
                    <div class="mb-sb-title ecart-vs-prov" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Écart par rapport à la moyenne provinciale (2022)">
                        Écart vs province
                    </div>
                    <div class="mb-sb-val" data-name="delta_vs_province">
                        <div class="mb-sb-pb ${ecClass}">
                            <i class="fa-solid fa-arrow-up"></i>
                            <i class="fa-solid fa-arrow-down"></i>
                        </div>
                        <div class="mb-sb-val-actual ${ecClass}">${ecText}</div>
                    </div>
                </div>

                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Différence entre l'évolution de la RLS et celle de la province sur les cinq dernières années">
                        Divergence (5 ans)
                    </div>
                    <div class="mb-sb-val" data-name="divergence_vs_province_5y">
                        <div class="mb-sb-pb ${divClass}">
                            <i class="fa-solid fa-arrow-up"></i>
                            <i class="fa-solid fa-arrow-down"></i>
                        </div>
                        <div class="mb-sb-val-actual ${divClass}">${divText}</div>
                    </div>
                </div>

                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Classement relatif de cette ${currentTendencyLevel} parmi l’ensemble des ${currentTendencyLevel} du Québec pour l’indicateur sélectionné. Utilisation de la valeur de 2022.">
                        Classement ${currentTendencyLevel}
                    </div>
                    <div class="mb-sb-val">
                        <div class="mb-sb-val-actual">${rankText}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    return html;
}
window.updateTendencyStats = function (tendencyStats, {
    showPercentSign = false,
    } = {}) {

    for (const [code, stats] of Object.entries(tendencyStats)) {
        let tv = stats.total_variation;
        let fv = stats.variation_5y;
        let ecart = stats.delta_vs_province;
        let div = stats.divergence_vs_province_5y;

        let tvClass = signClass(tv);  // "up" | "down" | "flat" | ""
        let fvClass = signClass(fv);
        let ecClass = signClass(ecart);
        let divClass = signClass(div);

        let tvText = formatPercent(tv, { showSign: showPercentSign });
        let fvText = formatPercent(fv, { showSign: showPercentSign });
        let ecText = formatPercent(ecart, { showSign: showPercentSign });
        let divText = formatPercent(div, { showSign: showPercentSign });

        const $el = $(`.stats-sec[data-id="${code}"]`)

        $el.find('.mb-sb-val[data-name="total_variation"]')
            .html(`<div class="mb-sb-pb ${tvClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${tvClass}">${tvText}</div>`)
        $el.find('.mb-sb-val[data-name="variation_5y"]')
            .html(`<div class="mb-sb-pb ${fvClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${fvClass}">${fvText}</div>`)
        $el.find('.mb-sb-val[data-name="delta_vs_province"]')
            .html(`<div class="mb-sb-pb ${ecClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${ecClass}">${ecText}</div>`)
        $('.ecart-vs-prov').attr('title', `Écart par rapport à la moyenne provinciale (${currentTendencyEndYear})`).tooltip('dispose').tooltip();
        $el.find('.mb-sb-val[data-name="divergence_vs_province_5y"]')
            .html(`<div class="mb-sb-pb ${divClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${divClass}">${divText}</div>`)




    }
}
function updateTendencyChart(seriesByCode) {
    tendencyChart.series.slice().forEach(s => s.remove());
    for (const [code, arr] of Object.entries(seriesByCode)) {
        tendencyChart.addSeries({
            name: RLSCodeToNameDict[code],
            data: arr,
            id: String(code)
        });
    }
}

$('.tab-el.level').click(function () {
    let targetLvl = $(this).data('name');
    if ($(this).hasClass('active') == false) {
        // Activate the proper tab element
        $('.tab-el.level').removeClass('active');
        $(this).addClass('active');
        // Show the proper level list
        $('.lsp-bubble-selection.tendency').addClass('hidden');
        $(`#lsp${targetLvl}List`).removeClass('hidden');
        // Show the correct name
        $('.tendency-level-name').html(targetLvl);
        currentTendencyLevel = targetLvl;
        // Show the correct count-badge
        $('.count-badge-level').addClass('hidden');
        $(`#${targetLvl.toLowerCase()}Count`).removeClass('hidden');

        let allLvls = ['RLS', 'RTS', 'RSS']

        for (const lvl of allLvls) {
            if (lvl == targetLvl) {
                LEVELS[lvl].layer.setVisible(true);
                LEVELS[lvl].focus.layer.setVisible(true);
            } else {
                LEVELS[lvl].layer.setVisible(false);
                LEVELS[lvl].focus.layer.setVisible(false);
            }
        }
    }
})

$(document)
.off('mouseenter.tendency mouseleave.tendency', '.stats-sec')
.on('mouseenter.tendency', '.stats-sec', function () {
    const id = String($(this).data('id'));
    const target = tendencyChart?.get(id);
    if (!target) return;

    (tendencyChart.series || []).forEach(s => {
        if (!s.visible || !s.group) return;

        const isTarget = s === target;
        s.group.attr({ opacity: isTarget ? 1 : DIM_OPACITY });

        const baseWidth = (s.options?.lineWidth) || 2;
        if (s.graph) s.graph.attr({ 'stroke-width': isTarget ? THICK_WIDTH : baseWidth });
    });
})
.on('mouseleave.tendency', '.stats-sec', function () {
    (tendencyChart.series || []).forEach(s => {
        if (!s.visible || !s.group) return;

        s.group.attr({ opacity: BASE_OPACITY });

        const baseWidth = (s.options?.lineWidth) || 2;
        if (s.graph) s.graph.attr({ 'stroke-width': baseWidth });
    });
})
.on('click.remove-grid-item', '.remove-grid-item', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const $removeBtn = $(this);

    // 🔥 1) Dispose Bootstrap tooltip if it exists
    const tooltipEl = this;
    const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipEl);
    if (tooltipInstance) {
        tooltipInstance.dispose();
    }

    // 2) Find container holding data-id
    const $row = $removeBtn.closest('[data-id]');
    const id = String($row.data('id'));
    if (!id) return;

    // 3) Remove Highcharts series
    const series = tendencyChart?.get?.(id);
    if (series) {
        series.remove(false);
        tendencyChart.redraw();
    }

    // 4) Remove series from currentTendencyData
    if (currentTendencyData && Object.prototype.hasOwnProperty.call(currentTendencyData, id)) {
        delete currentTendencyData[id];
    }

    // 5) Remove DOM node
    $row.remove();
});


$('#view-tendency').on('click', async function () {
    const [indicatorId, codeList = []] = retrieveTendencyInputs() || [];

    if (!indicatorId) return addAlert('info', 'Veuillez choisir un indicateur');
    if (!codeList.length) return addAlert('info', 'Veuillez choisir une ou plusieurs RLS');

    addAlert('loading', 'Nous calculons vos tendances');
    current_tendency_indicator = indicatorId;

    try {
        const res = await fetch('/tendency_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([indicatorId, codeList, currentTendencyLevel]),
        });
        const data = await res.json();
        currentTendencyData = data;
        currentTendencyId = indicatorId;


        // 0) Fetch the provincial data if not allready fetched and updates the chart to add the serie
        if (Object.prototype.hasOwnProperty.call(provincialTimeseries, indicatorId) == false) {
            const res = await fetch('/tendency_query_provincial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([indicatorId]),
            });
            const data = await res.json();
            provincialTimeseries[indicatorId] = data;
        }

        // 1) Compute statistics for each RLS
        let tendencyStats = computeTendencyStats(data, provincialTimeseries[indicatorId]);

        // 2) Display statistics in result-map-box
        document.querySelector('.rls-stats-grid').innerHTML = displayTendencyStats(tendencyStats, {
            rlsNameMap: lvlToNameDict[currentTendencyLevel],
            showPercentSign: false,
        });

        // Tooltips (only for newly inserted nodes)
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            bootstrap.Tooltip.getOrCreateInstance(el, { html: true });
        });

        // 3) Update tendency chart
        updateTendencyChart(data);
        tendencyChart.addSeries({
            name: 'Province',
            data: provincialTimeseries[indicatorId],
            id: String(-999),
            color: '#ffffff',
            dashStyle: 'Dash',
            lineWidth: 2
        });

        // 5) Display the result-map-box
        $('#tendencyIndicatorName').html((indicatorIdToNameDict[indicatorId] || '').toLowerCase());
        $('#currentTendencyLvl').html(currentTendencyLevel);
        $('.result-map-box[data-nav="tendency"]').removeClass('novis');
        $('.map-box[data-nav="tendency"]').removeClass('enlarge').addClass('novis');
        $('.nav-link').removeClass('active');
        LEVELS[currentTendencyLevel].focus.layer.setVisible(false);
        LEVELS[currentTendencyLevel].layer.setVisible(false);

        addAlert('success', 'Vos tendances sont prêtes');
    } catch (err) {
        console.log(err);
        addAlert('error', 'Erreur lors du calcul des tendances');
    }
});