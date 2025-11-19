var tendency_activated = false;
var current_tendency_indicator = null;
window.BASE_OPACITY = 0.6; // normal state
window.DIM_OPACITY  = 0.2; // dimmed state
window.THICK_WIDTH  = 3;   // hovered series width

function retrieveTendencyInputs() {
    const tendency_indicator = $('input[name="lsp-indicators"]:checked').val();
    const tendency_codes = $('input[name="lsp-rls"]:checked').map(function () {
        return this.value;
    }).get();

    return [tendency_indicator, tendency_codes];
}
function computeTendencyStats(seriesByCode, startYear = 1996, window = 5) {
    const round = (x, n = 3) => (x == null ? null : Number(x.toFixed(n)));
    const out = {};

    for (const [code, arr] of Object.entries(seriesByCode)) {
        if (!Array.isArray(arr) || arr.length === 0) continue;

        const first = arr[0];
        const last = arr[arr.length - 1];
        const total_variation = first === 0 ? null : ((last - first) / first) * 100;

        // “last 5 values” = % change from the first of the last N values to the last value
        const wStartIdx = Math.max(0, arr.length - window);
        const wStart = arr[wStartIdx];
        const five_var = wStart === 0 ? null : ((last - wStart) / wStart) * 100;

        const avg = arr.reduce((s, v) => s + v, 0) / arr.length;

        let maxIdx = 0;
        for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxIdx]) maxIdx = i;
        const max_year = startYear + maxIdx;

        out[code] = {
            "total_variation": round(total_variation),
            "5year_variation": round(five_var),
            "avg": round(avg),
            "max_year": max_year
        };
    }
    return out;
}
const nfNumber = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 });
const nfPercent1 = new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 1 });
window.signClass = function(value) {
    if (value == null || isNaN(value)) return ''; // no class if unknown
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
}
window.formatPercent = function(value, { showSign = false } = {}) {
    if (value == null || isNaN(value)) return '—';
    const abs = Math.abs(value);
    const base = nfPercent1.format(abs) + '%';
    if (!showSign) return base;
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return sign + base;
}
window.formatNumberTendency = function(value, { currency = null } = {}) {
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
window.formatOrdinalFr = function(n) {
    if (n == null || isNaN(n)) return '—';
    return n === 1 ? '1<sup>ere</sup>' : `${n}<sup>e</sup>`;
}
function displayTendencyStats(tendencyStats, {
    rlsNameMap = RLS_code_to_name_dict,
    currency = null,
    showPercentSign = false,
    } = {}) {
    let html = '';

    for (const [code, stats] of Object.entries(tendencyStats)) {
        const name = rlsNameMap?.[code] ?? code;

        const tv = stats.total_variation;
        const fv = stats["5year_variation"];
        const avg = stats.avg;
        const maxYear = stats.max_year;
        try{
            rank = indicatorsKeyRef[current_tendency_indicator]['ranking'][code];
        } catch(err){
            rank = 'N/A';
        }
        

        const tvClass = signClass(tv);  // "up" | "down" | "flat" | ""
        const fvClass = signClass(fv);

        const tvText = formatPercent(tv, { showSign: showPercentSign });
        const fvText = formatPercent(fv, { showSign: showPercentSign });
        const avgText = formatNumberTendency(avg, { currency });
        const rankText = formatOrdinalFr(rank);
        const maxYearText = maxYear ?? '—';

        html += `
        <div class="rls-stats-section stats-sec" data-id="${String(code)}">
            <div class="mb-sub-title just-flex-start">
                <i class="fa-solid fa-location-dot" style="color:var(--primary)"></i>
                <span>${name}</span>
            </div>
            <div class="grid-5">
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
                        Variation (5 ans)
                    </div>
                    <div class="mb-sb-val">
                    <div class="mb-sb-pb ${fvClass}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="mb-sb-val-actual ${fvClass}">${fvText}</div>
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

                <div class="mb-stats-box">
                    <div class="mb-sb-title" data-bs-toggle="tooltip" data-bs-placement="top"
                        data-bs-html="true"
                        title="Classement relatif de cette RLS parmi l’ensemble des RLS du Québec (86 total) pour l’indicateur sélectionné. Utilisation de la valeur de 2022.">
                        Classement RLS
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
function updateTendencyChart(seriesByCode) {
    window.tendencyChart.series.slice().forEach(s => s.remove());
    for (const [code, arr] of Object.entries(seriesByCode)) {
        window.tendencyChart.addSeries({
            name: RLS_code_to_name_dict[code],
            data: arr,
            id: String(code)
        });
    }
}
$('#view-tendency').click(function () {
    let result = retrieveTendencyInputs();
    if (result[0] == undefined) {
        addAlert('info', 'Veuillez choisir un indicateur');
    } else if (result[1].length == 0){
        addAlert('info', 'Veuillez choisir une ou plusieurs RLS');
    }else {
        addAlert('loading', 'Nous calculons vos tendances');
        current_tendency_indicator = result[0];
        fetch('/tendency_query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([result[0], result[1]]),
            })
            .then(response => response.json())
            .then(data => {
                // 1) Compute statistics for each RLS
                tendencyStats = computeTendencyStats(data);
                // 2) Display statistics in result-map-box
                if (indicatorsKeyRef[current_tendency_indicator]['unit'] == '$ CAN moyen') {
                    this_currency = "CAD";
                } else {
                    this_currency = null;
                }
                const html = displayTendencyStats(tendencyStats, {
                    rlsNameMap: RLS_code_to_name_dict,
                    currency: this_currency,         
                    showPercentSign: false,
                    includeRank: false
                });
                document.querySelector('.rls-stats-grid').innerHTML = html;
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
                tooltipTriggerList.map(function (tooltipTriggerEl) {
                    return new bootstrap.Tooltip(tooltipTriggerEl, {
                        html: true,
                    })
                })
                $(".stats-sec").off('hover');
                $(".stats-sec").hover(
                    function () {
                        const id = String($(this).data("id"));
                        const target = tendencyChart.get(id);
                        if (!target) return;

                        (tendencyChart.series || []).forEach(s => {
                        if (!s.visible || !s.group) return;

                        const isTarget = s === target;
                        s.group.attr({ opacity: isTarget ? 1 : DIM_OPACITY });

                        const baseWidth = (s.options && s.options.lineWidth) || 2;
                        if (s.graph) s.graph.attr({ "stroke-width": isTarget ? THICK_WIDTH : baseWidth });
                        });
                    },
                    function () {
                        (tendencyChart.series || []).forEach(s => {
                        if (!s.visible || !s.group) return;

                        s.group.attr({ opacity: BASE_OPACITY });

                        const baseWidth = (s.options && s.options.lineWidth) || 2;
                        if (s.graph) s.graph.attr({ "stroke-width": baseWidth });
                        });
                    }
                );
                // 3) Update tendency chart
                updateTendencyChart(data);
                // 4) Display the result-map-box
                $('#tendencyIndicatorName').html(indicator_id_to_name_dict[result[0]].toLowerCase());
                $('.result-map-box[data-nav="tendency"]').removeClass('novis');
                $('.map-box[data-nav="tendency"]').removeClass('enlarge');
                $('.map-box[data-nav="tendency"]').addClass('novis');
                $('.nav-link').removeClass('active');
                focusLayer.setVisible(false);
                RLSLayer.setVisible(false);
                addAlert('success', 'Vos tendances sont prêtes');
            })
            .catch(error => {
                console.log(error);
                addAlert('error', 'Erreur lors du calcul des tendances');
            });
    }

})