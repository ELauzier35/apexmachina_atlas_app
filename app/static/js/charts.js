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
window.bellCurveChart = Highcharts.chart('container-bellcurve', {
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
window.tendencyChart = Highcharts.chart('container-tendency', {
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
            pointStart: 1996,
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
window.cohortChart = Highcharts.chart('container-cohort', {
    title: {
        text: "",
    },
    chart: {
        backgroundColor: null,
        marginBottom: 70,
        height: null,
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
            pointStart: 1996,
        },
        line: {
            marker: {
                enabled: false
            }
        }
    },
    series: [{
        name: '1897-1901',
        data: data0_c,
        color: '#2F6DDB'
    },
    {
        name: '1922-1926',
        data: data1_c,
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

var stacked_bar_data, bell_curve_data, current_key;
window.graphUpdateBellcurve = function (trailing_output, key, the_value) {
    if (key != infoPanelIndicator) {
        if (key.includes('-')) {
            bell_curve_data = Object.values(trailing_output[key]);
            bell_curve_data = bell_curve_data.map(innerArray => innerArray[currentStep]['avg']);
        } else {
            bell_curve_data = Object.values(trailing_output[key]).map(v => v.avg);
            $('.timeseries').css('display', 'none');
        }
        the_object = trailing_output[key]
        stacked_bar_data = [];
        bell_curve_data = bell_curve_data.filter(item => item !== null);
        sum = bell_curve_data.reduce((accumulator, currentValue) => accumulator + currentValue);
        mean = sum / bell_curve_data.length;

        try {bellCurveChart.series[1].setData(bell_curve_data)} 
        catch (err) {console.log(err)}

        
        bellCurveChart.xAxis[1].removePlotLine('mean');
        bellCurveChart.xAxis[1].addPlotLine({
            value: mean,
            color: 'white',
            width: 1.75,
            id: 'mean',
            zIndex: 4,
            label: {
                text: 'Moy.',
                rotation: 0,
                style: {
                    color: 'white',
                    fontWeight: 'bold'
                }
            }
        });
    }
    bellCurveChart.xAxis[1].removePlotLine('first');
    bellCurveChart.xAxis[1].addPlotLine({
        value: the_value,
        color: 'var(--accent)',
        width: 2.5,
        id: 'first',
        zIndex: 4
    });
    current_key = key;
    infoPanelIndicator = key;
    closeAllMapBoxes();
    $('.info-panel').removeClass('novis');
}