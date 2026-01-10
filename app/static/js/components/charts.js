/**
 * chart.js
 * -------------------------
 * Functions regarding charts initialisation and update
 * 
 *
**/

import { 
    closeAllMapBoxes, 
    getNameWithYear, 
    pearsonCorrelation,
    generateYearList
} from "../utils.js";

var data = [
    2895,
    2955,
    2993,
    3178,
    2437,
    3390,
    3142,
    3222,
    2287,
    3841,
    3028,
    3388,
    2605,
    3944,
    2841,
    4152,
    3259,
    2411,
    3735,
    3198,
    4084,
    3899,
    4042,
    4000,
    4335,
    4556,
    4702
];
var data2 = [
    2598,
    2104,
    2060,
    1957,
    1442,
    1883,
    1697,
    1650,
    1411,
    1532,
    1475,
    1328,
    1209,
    1165,
    1214,
    1152,
    1110,
    1063,
    958,
    835,
    732,
    892,
    1002,
    1000,
    902,
    852,
    813,
];
var data0 = [
    111,
    107,
    100,
    107,
    114,
    115,
    111,
    97,
    100,
    112,
    104,
    89,
    104,
    102,
    91,
    114,
    114,
    103,
    106,
    105,
    113,
    109,
    108,
    113,
    130,
    128,
    128,
    118,
    113,
    120,
    132,
    111,
    124,
    127,
    128,
    136,
    106,
    118,
    119,
    123,
    124,
    126,
    116,
    127,
    119,
    97,
    86,
    102,
    110,
    120,
    103,
    115,
    93,
    72,
    111,
    103,
    123,
    79,
    119,
    110,
    110,
    107,
    74,
    105,
    112,
    105,
    110,
    107,
    103,
    77,
    98,
    90,
    96,
    112,
    112,
    114,
    93,
    106
];
var data0_c = [
    3105,
    2810,
    3299,
    3588,
    2944,
    3762,
    3988,
    3421,
    3610,
    2895,
    4012,
    4230,
    3695,
    3550,
    3312,
    3877,
    4120,
    4284,
    3659,
    3441,
    3928,
    4166,
    4511,
    4390,
    4720,
    4588,
    4902
];
var data1_c = [
    1955,
    2230,
    2142,
    2280,
    2410,
    2633,
    2511,
    2320,
    2655,
    2788,
    2599,
    2425,
    2260,
    2199,
    2333,
    2490,
    2388,
    2222,
    2088,
    1935,
    1790,
    1850,
    2015,
    2166,
    2355,
    2412,
    2590
];
export const bellCurveChart = Highcharts.chart('container-bellcurve', {
    chart: {
        backgroundColor: null,
        marginBottom: 30,
        style: {
            fontFamily: 'Inter',
            fontSize: "0.8rem"
        },
        height: null,
    },
    title: {
        text: '',
    },
    xAxis: [
        {
            title: { text: 'Data' },
            alignTicks: false,
            visible: false,
        },
        {
            title: { text: '' },
            alignTicks: false,
            opposite: false,
            lineColor: "#97909067",
            labels: {
                style: {
                    color: '#979090'
                }
            },
        }
    ],
    yAxis: [
        {
            title: {
                text: ''
            },
            alignTicks: false,
            visible: false
        },
        {
            title: { text: '' },
            opposite: true,
            visible: false
        }
    ],
    legend: {
        enabled: false
    },
    exporting: { enabled: false },
    credits: { enabled: false },
    tooltip: {
        formatter() {
            // console.log(this.x.toFixed(2), this.series.basePointRange.toFixed(2));
            const x1 = this.x.toFixed(2);
            const x2 = (this.x + this.series.basePointRange).toFixed(2);
            const header = `<div style="font-size:10px;display:flex;justify-content:center;align-items:center;width:100%;">${x1} - ${x2}</div><table style="margin-top:5px">`
            const body = `<tr>
            <td style="color:${this.series.color};padding:0">${this.series.name} : </td>
            <td style="padding:0 0 0 5px"> <b>${this.y}</b></td>
          </tr>`

            const footer = '</table>'

            return header + body + footer
        },
        useHTML: true
    },
    series: [{
        name: 'Nb. observation',
        type: 'histogram',
        xAxis: 1,
        yAxis: 1,
        baseSeries: 's1',
        zIndex: -1,
        color: {
            linearGradient: [0, 0, 0, 100],
            stops: [
                [0, '#2F6DDB'],
                [1, '#2f6edb63']
            ]
        },
        borderColor: 'rgba(13, 33, 56, 0.5)',
    }, {
        name: 'Data',
        type: 'scatter',
        data: data0,
        id: 's1',
        enableMouseTracking: false,
        marker: {
            radius: 0
        }
    }]
});
export const correlationsChart = Highcharts.chart('container-correlation', {
    chart: {
        type: 'columnrange',
        inverted: true,
        backgroundColor: null,
        marginBottom: 30,
        style: {
            fontFamily: 'Inter',
            fontSize: "0.8rem"
        },
        height: null,
        spacingLeft: 10,
        plotAreaWidth: 100,
    },

    title: {
        text: ''
    },
    exporting: { enabled: false },
    credits: { enabled: false },
    xAxis: {
        categories: ['Précipiations mensuelles', 'Indice de végétation', "Taux d'handicap", 'Profondeur de la pauvreté', "Taux d'emploi", "Taux de dépendance démographique", "Indice de sécheresse",
            "Indice d'eau", 'Taux de chômage'],
        labels: {
            zIndex: 1,
            style: {
                width: 85,
                textOverflow: 'ellipsis',
                color: '#979090'
            },
            align: 'left',
            reserveSpace: true,
            distance: '125%',
            x: 10,
        },
        offset: 50,
        lineColor: '#transparent'
    },
    yAxis: {
        title: {
            text: 'Coefficient de Pearson (R2)'
        },
        max: 1,
        min: -1,
        plotLines: [{
            color: '#97909067',
            width: 2,
            value: 0,
            zIndex: 9,
        }],
        labels: {
            style: {
                color: '#979090'
            }
        },
        gridLineColor: '#97909067'
    },
    plotOptions: {
        columnrange: {
            borderRadius: '25%',
            dataLabels: {
                enabled: false,
            }
        },
    },
    tooltip: {
        valueSuffix: '',
        formatter: function () {

            if (this.point.low == 0) {
                return this.point.category + '<br><div class="error_number" style="color:#2F6DDB;font-size:10px;padding-right:10px;">&#8226;</div><div style="position:relative;bottom:5px;">Corrélation (R<sup>2</sup>): <b>' + this.point.high.toFixed(3) + '</b></div>';
            } else {
                return this.point.category + '<br><div class="error_number" style="color:#2F6DDB;font-size:15px;margin-right:15px;">&#8226;</div><div style="position:relative;bottom:5px;">Corrélation (R<sup>2</sup>): <b>' + this.point.low.toFixed(3) + '</b></div>';
            }

        },
        className: 'tooltiper'
    },
    legend: {
        enabled: false,
    },
    series: [{
        name: 'Corrélations (R2)',
        data: [
            [-.139, 0],
            [-.167, 0],
            [0, 0.97],
            [-.44, 0],
            [-.21, 0],
            [0, .294],
            [0, .291],
            [0, .254],
            [0, .216]
        ],
        color: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 1,
                y2: 0
            },
            stops: [
                [0, '#2F6DDB'],
                [1, '#2f6edb63']
            ]
        },
        borderColor: 'transparent',
    }]

});
export const timeSeriesChart = Highcharts.chart('container-timeseries', {
    chart: {
        type: 'line',
        backgroundColor: null,
        marginBottom: 40,
        style: {
            fontFamily: 'Inter',
            fontSize: "0.8rem"
        },
        height: null,
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: ['2020', '2021', '2022'],
        labels: {
            style: {
                color: '#979090'
            },
        },
    },
    yAxis: {
        title: {
            text: ''
        },
        labels: {
            style: {
                color: '#979090'
            },
        },
        gridLineColor: '#97909067'
    },
    exporting: {
        enabled: false
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false,
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'Série temporelle',
        data: [0.2, 0.25, 0.22],
        color: '#2F6DDB'
    },]
});

export const tendencyChart = Highcharts.chart('container-tendency', {
    title: {
        text: "",
    },
    chart: {
        backgroundColor: null,
        marginBottom: 70,
        height: 'null',
        type: "line",
        style: {
            fontFamily: 'Gotham-Book',
            fontSize: "0.8rem"
        },
    },
    yAxis: {
        title: {
            text: "",
            style: {
                color: "#979090",
            }
        },
        labels: {
            style: {
                color: '#979090' // Blue labels
            }
        },
        lineWidth: 1,
        lineColor: "#979090",
        gridLineWidth: 0
    },
    credits: {
        enabled: false,
    },
    xAxis: {
        categories: ['1996', '1997', '1998', '1999', '2000', '2001',
            '2002', '2003', '2004', '2005', '2006', '2007', '2008',
            '2009', '2010', '2011', '2012', '2013', '2014', '2015',
            '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        title: {
            text: "Années",
            style: {
                color: "#979090",
            }
        },
        labels: {
            style: {
                color: '#979090'
            }
        },
        lineColor: "#979090",
        accessibility: {
            rangeDescription: "Période : 1996 to 2016",
        },
        gridLineWidth: 0,
        tickLength: 0,

    },
    legend: {
        layout: "horizontal",
        align: "center",
        itemDistance: 40,
        verticalAlign: "bottom",
        y: 25,
        itemStyle: {
            color: '#fff'
        }
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false,
            },
        },
        line: {
            marker: {
                enabled: false
            }
        }
    },
    series: [{
        name: 'RLS de Rivière-du-Loup',
        data: data,
        color: '#2F6DDB'
    },
    {
        name: 'RLS de Jonquière',
        data: data2,
        color: '#750bdfff'
    }],
    responsive: {
        rules: [
            {
                condition: {
                    maxWidth: 500,
                },
                chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom",
                    },
                },
            },
        ],
    },
    exporting: {
        enabled: false
    }
});
export const dispersionChart = Highcharts.chart('container-dispersion', {
    title: {
        text: "",
    },
    chart: {
        backgroundColor: null,
        marginBottom: 70,
        height: 'null',
        type: "line",
        style: {
            fontFamily: 'Gotham-Book',
            fontSize: "0.8rem"
        },
    },
    yAxis: {
        title: {
            text: "",
            style: {
                color: "#979090",
            }
        },
        labels: {
            style: {
                color: '#979090' // Blue labels
            }
        },
        lineWidth: 1,
        lineColor: "#979090",
        gridLineWidth: 0
    },
    credits: {
        enabled: false,
    },
    xAxis: {
        categories: ['1996', '1997', '1998', '1999', '2000', '2001',
            '2002', '2003', '2004', '2005', '2006', '2007', '2008',
            '2009', '2010', '2011', '2012', '2013', '2014', '2015',
            '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
        title: {
            text: "Années",
            style: {
                color: "#979090",
            }
        },
        labels: {
            style: {
                color: '#979090'
            }
        },
        lineColor: "#979090",
        accessibility: {
            rangeDescription: "Période : 1996 to 2016",
        },
        gridLineWidth: 0,
        tickLength: 0,

    },
    legend: {
        layout: "horizontal",
        align: "center",
        itemDistance: 40,
        verticalAlign: "bottom",
        y: 25,
        itemStyle: {
            color: '#fff'
        }
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false,
            },
        },
        line: {
            marker: {
                enabled: false
            }
        }
    },
    series: [{
        name: 'Décile',
        data: data,
        color: '#2F6DDB'
    },
    {
        name: 'Quartile',
        data: data2,
        color: '#750bdfff'
    }],
    responsive: {
        rules: [
            {
                condition: {
                    maxWidth: 500,
                },
                chartOptions: {
                    legend: {
                        layout: "horizontal",
                        align: "center",
                        verticalAlign: "bottom",
                    },
                },
            },
        ],
    },
    exporting: {
        enabled: false
    }
});
// export const cohortChart = Highcharts.chart('container-cohort', {
//     title: {
//         text: "",
//     },
//     chart: {
//         backgroundColor: null,
//         marginBottom: 70,
//         height: null,
//         type: "line",
//         style: {
//             fontFamily: 'Gotham-Book',
//             fontSize: "0.8rem"
//         },
//     },
//     yAxis: {
//         title: {
//             text: "",
//             style: {
//                 color: "#979090",
//             }
//         },
//         labels: {
//             style: {
//                 color: '#979090' // Blue labels
//             }
//         },
//         lineWidth: 1,
//         lineColor: "#979090",
//         gridLineWidth: 0
//     },
//     credits: {
//         enabled: false,
//     },
//     xAxis: {
//         categories: ['1996', '1997', '1998', '1999', '2000', '2001',
//             '2002', '2003', '2004', '2005', '2006', '2007', '2008',
//             '2009', '2010', '2011', '2012', '2013', '2014', '2015',
//             '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
//         title: {
//             text: "Années",
//             style: {
//                 color: "#979090",
//             }
//         },
//         labels: {
//             style: {
//                 color: '#979090'
//             }
//         },
//         lineColor: "#979090",
//         accessibility: {
//             rangeDescription: "Période : 1996 to 2016",
//         },
//         gridLineWidth: 0,
//         tickLength: 0,

//     },
//     legend: {
//         layout: "horizontal",
//         align: "center",
//         itemDistance: 40,
//         verticalAlign: "bottom",
//         y: 25,
//         itemStyle: {
//             color: '#fff'
//         }
//     },
//     plotOptions: {
//         series: {
//             label: {
//                 connectorAllowed: false,
//             },
//             pointStart: 1996,
//         },
//         line: {
//             marker: {
//                 enabled: false
//             }
//         }
//     },
//     series: [{
//         name: '1897-1901',
//         data: data0_c,
//         color: '#2F6DDB'
//     },
//     {
//         name: '1922-1926',
//         data: data1_c,
//         color: '#750bdfff'
//     }],
//     responsive: {
//         rules: [
//             {
//                 condition: {
//                     maxWidth: 500,
//                 },
//                 chartOptions: {
//                     legend: {
//                         layout: "horizontal",
//                         align: "center",
//                         verticalAlign: "bottom",
//                     },
//                 },
//             },
//         ],
//     },
//     exporting: {
//         enabled: false
//     }
// });


export function graphUpdateBellcurve(key, the_value) {
    const axis = bellCurveChart.xAxis[1];

    // Helper: (re)draw a plotline
    const setPlotLine = (id, opts) => {
        axis.removePlotLine(id);
        axis.addPlotLine({ id, zIndex: 4, ...opts });
    };

    // 1) Build data
    let data;

    if (key.includes('-')) {
        const step = indicatorIdToStep[key];
        data = Object.values(trailingOutput[key])
            .map(arr => arr?.[step]?.avg ?? null);
    } else {
        // Special case: selecting the same indicator again -> only move "first"
        if (key === infoPanelIndicator) {
            setPlotLine('first', { value: the_value, color: 'var(--accent)', width: 2.5 });
            closeAllMapBoxes();
            $('.info-panel').removeClass('novis');
            return;
        }

        data = Object.values(trailingOutput[key]).map(v => v?.avg ?? null);
        $('.timeseries').css('display', 'none');
    }

    // 2) Filter + compute mean in one pass (and handle empty)
    let sum = 0;
    let count = 0;
    const cleaned = [];

    for (const v of data) {
        if (v == null) continue; // filters null/undefined
        cleaned.push(v);
        sum += v;
        count++;
    }

    const mean = count ? sum / count : null;

    // 3) Update series if present (avoid try/catch)
    const series = bellCurveChart.series?.[1];
    if (series) series.setData(cleaned, false);

    // 4) Update plotlines
    if (mean != null) {
        setPlotLine('mean', {
            value: mean,
            color: 'white',
            width: 1.75,
            label: {
                text: 'Moy.',
                rotation: 0,
                style: { color: 'white', fontWeight: 'bold' }
            }
        });
    } else {
        axis.removePlotLine('mean');
    }

    setPlotLine('first', { value: the_value, color: 'var(--accent)', width: 2.5 });

    // 5) Redraw once
    bellCurveChart.redraw();

    infoPanelIndicator = key;
    closeAllMapBoxes();
    $('.info-panel').removeClass('novis');
};
window.correlation_base_indicator = null;
window.lastLayersOnMap = null;
export function graphUpdateCorrelations(key) {
    let correlations = [];
    let raw_name = getNameWithYear(key);
    correlation_base_indicator = raw_name;
    let cat_names = [];
    let graph_vals = [];
    let base_indicator_vals;
    if (key.includes('-')){
        let step = indicatorIdToStep[key];
        base_indicator_vals = Object.values(trailingOutput[key]).map(arr => arr[step]?.avg ?? null);
    }
    else{
        base_indicator_vals = Object.values(trailingOutput[key]).map(v => v.avg);
    }
    // Parcours tous les indicateurs du trailing output
    for (const new_key in trailingOutput) {
        // S'asssure que la couche est toujours sur la carte
        if (layersOnMap.includes(new_key)) {
            // S'assure qu'on sélection pas l'indicateur de base
            if (new_key != key) {
                // Skip les couches de changement TIME SERIES
                let correlate_vals;
                if (new_key.includes('-')){
                    let step = indicatorIdToStep[new_key];
                    correlate_vals = Object.values(trailingOutput[new_key]).map(arr => arr[step]?.avg ?? null);
                }
                else{
                    correlate_vals = Object.values(trailingOutput[new_key]).map(v => v.avg);
                }
                var correlate_vals_merged = [base_indicator_vals, correlate_vals]
                var pearson_coeff = pearsonCorrelation(correlate_vals_merged, 0, 1);
                let full_name = getNameWithYear(new_key);
                cat_names.push(full_name);
                if (pearson_coeff < 0) {
                    var graph_data = [pearson_coeff, 0]
                } else {
                    var graph_data = [0, pearson_coeff]
                }
                graph_vals.push(graph_data);
                correlations.push([full_name, pearson_coeff]);
            }
        }
    }
    lastLayersOnMap = Array.from(layersOnMap);
    correlationsChart.xAxis[0].categories = cat_names;
    correlationsChart.series[0].setData(graph_vals);
    correlationsChart.xAxis[0].redraw();
    correlationsChart.redraw();
    if (graph_vals.length === 0) {
        $('.correlations').css('display', 'none');
    } else {
        $('.correlations').css('display', 'flex');
    }
}
export function graphUpdateTimeseries(key, feature_id) {
    var new_cats = generateYearList(key.split('.')[1]);
    let values = trailingOutput[key][feature_id].map(v => v.avg);
    var roundedList = values.map(number => number === null ? null : Number(number.toFixed(2)));
    console.log(new_cats, roundedList);
    timeSeriesChart.xAxis[0].setCategories(new_cats);
    timeSeriesChart.series[0].setData(roundedList);
    timeSeriesChart.redraw();
    $('.info-panel-indicator-short').html(masterDict[key][2]);
    $('.timeseries').css('display', 'flex');
}