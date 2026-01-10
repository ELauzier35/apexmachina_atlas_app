/**
 * cohort.js
 * -------------------------
 * Everything about cohort mapbox
 * 
 *
**/
import { 
    addAlert,
    capitalizeFirstLetter
} from "../utils.js";
import { 
    DIM_OPACITY,
    BASE_OPACITY,
    THICK_WIDTH
} from "../global.js";
import { dispersionChart } from "./charts.js";
import { 
    signClass, 
    formatPercent, 
    formatNumberTendency 
} from "./tendency.js";


var current_dispersion_indicator = null;

function retrieveDispersionInput() {
    const dispersion_indicator = $('input[name="lsp-indicators-disp"]:checked').val();
    return [dispersion_indicator];
}
window.computeDispersionStats = function (
        seriesByCode,
        startYear = 1996,
        endYear = 2022,
        window = 5,
        baseYear = 1996
    ) {
    const round = (x, n = 3) => (x == null ? null : Number(x.toFixed(n)));
    const out = {};

    let startIdx = startYear - baseYear;
    let endIdx = endYear - baseYear;

    if (startIdx > endIdx) [startIdx, endIdx] = [endIdx, startIdx];

    const sliceByYears = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        const s = Math.max(0, Math.min(arr.length - 1, startIdx));
        const e = Math.max(0, Math.min(arr.length - 1, endIdx));
        if (e < s) return [];
        return arr.slice(s, e + 1);
    };

    for (const [code, rawArr] of Object.entries(seriesByCode)) {
        const arr = sliceByYears(rawArr);
        if (arr.length === 0) continue;

        const first = arr[0];
        const last = arr[arr.length - 1];

        const total_variation =
            first == null || first === 0 || last == null
                ? null
                : ((last - first) / first) * 100;

        const wStartIdx = Math.max(0, arr.length - window);
        const wStart = arr[wStartIdx];

        const five_var =
            wStart == null || last == null || wStart === 0
                ? null
                : ((last - wStart) / wStart) * 100;

        // Moyenne sur la période (valeurs non nulles)
        let sum = 0;
        let count = 0;
        for (const v of arr) {
            if (v != null) {
                sum += v;
                count++;
            }
        }
        const mean = count === 0 ? null : sum / count;

        // Max year dans la période
        let maxIdxLocal = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > arr[maxIdxLocal]) maxIdxLocal = i;
        }
        const max_year = startYear + maxIdxLocal;

        out[code] = {
            total_variation: round(total_variation),
            variation_5y: round(five_var),
            avg: round(mean),
            max_year
        };
    }

    return out;
};
function displayDispersionStats(dispersionStats, {
        currency = null,
        showPercentSign = false,
    } = {}) {
    let html = '';

    for (const [type, stats] of Object.entries(dispersionStats)) {
        const name = capitalizeFirstLetter(type);

        const tv = stats.total_variation;
        const tv5 = stats.variation_5y;
        const avg = stats.avg;
        const maxYear = stats.max_year;
        

        const tvClass = signClass(tv);
        const tvClass5 = signClass(tv5);
        const tvText = formatPercent(tv, { showSign: showPercentSign });
        const tvText5 = formatPercent(tv5, { showSign: showPercentSign });
        const avgText = avg.toFixed(3);
        const maxYearText = maxYear ?? '—';

        html += `
        <div class="rls-stats-section stats-sec-coh" data-id="${String(type)}">
            <div class="mb-sub-title just-flex-start">
                <i class="fa-solid fa-chart-pie" style="color:var(--primary)"></i>
                <span>${name}</span>
            </div>
            <div class="grid-4">
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
                        title="Évolution observée sur les cinq dernières années.">
                        Variation 5 ans
                    </div>
                    <div class="mb-sb-val">
                    <div class="mb-sb-pb ${tvClass5}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${tvClass5}">${tvText5}</div>
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
function updateDispersionChart(seriesByType) {
    dispersionChart.series.slice().forEach(s => s.remove());
    for (const [type, arr] of Object.entries(seriesByType)) {
        dispersionChart.addSeries({
            name: capitalizeFirstLetter(String(type)),
            data: arr,
            id: capitalizeFirstLetter(String(type))
        });
    }
}



$('#view-dispersion').on('click', async function () {
    const [indicatorId] = retrieveDispersionInput()

    if (!indicatorId) return addAlert('info', 'Veuillez choisir un indicateur');

    addAlert('loading', 'Nous calculons vos dispersion');
    current_dispersion_indicator = indicatorId;

    try {
        const res = await fetch('/dispersion_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([indicatorId]),
        });
        const data = await res.json();
        console.log(data);


        // 1) Compute statistics for each RLS
        let dispersionStats = computeDispersionStats(data);

        // 2) Display statistics in result-map-box
        document.querySelector('.dispersion-stats-grid').innerHTML = displayDispersionStats(dispersionStats, {
            showPercentSign: false,
        });

        // Tooltips (only for newly inserted nodes)
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            bootstrap.Tooltip.getOrCreateInstance(el, { html: true });
        });

        // 3) Update tendency chart
        updateDispersionChart(data);

        // 5) Display the result-map-box
        $('#dispersionIndicatorName').html((indicatorIdToNameDict[indicatorId] || '').toLowerCase());
        $('.result-map-box[data-nav="dispersion"]').removeClass('novis');
        $('.map-box[data-nav="dispersion"]').removeClass('enlarge').addClass('novis');
        $('.nav-link').removeClass('active');

        addAlert('success', 'Vos dispersions sont prêtes');
    } catch (err) {
        console.log(err);
        addAlert('error', 'Erreur lors du calcul des dispersions');
    }
});