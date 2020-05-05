var find_query = function () {
    var _map = window.location.search.substr(1).split('&').map(function (a) {
        return a.split('=');
    }).reduce(function (p, v) {
        if (v.length > 1)
            p[v[0]] = decodeURIComponent(v[1].replace(/\+/g, " "));
        else
            p[v[0]] = true;
        return p;
    }, {});
    return function (field) {
        return _map[field] || null;
    };
}();
var resizeMode = find_query('resize') || 'widhei';

import { chartOptions } from "../helper/patterns/chartsPatterns.js";
export function apply_resizing(chart, selector, widthPattern, heightPattern) {
    const width = widthPattern;
    const height = heightPattern;

    // adjustX = adjustX || 0;
    // adjustY = adjustY || adjustX || 0;
    // chart
    //     .width(chartOptions.getPatternWidthChart('.ui.one.cards .content'))
    // .height(chartOptions.patternHeightChart);
    window.onresize = function () {
        console.log(chartOptions.getPatternWidthChart(selector));
        
        chart
            .width(chartOptions.getPatternWidthChart(selector))
            .height(chartOptions.patternHeightChart);

        if (chart.rescale) {
            chart.rescale();
        }
        dc.redrawAll();
    };
}
