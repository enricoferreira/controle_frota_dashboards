import {listarDadosPrevencaoMulta} from '../../dados/js/requisicoes.js';
import {cleanTable} from '../../helper/cleanTable.js';
import { formatBr, dateFormat} from "../../helper/patterns/dateFormat.js";
import { tooltip } from "../../helper/patterns/tooltip.js";
import { colorOptions } from "../../helper/patterns/patternsColors.js";
import { print_filter } from "../../helper/patterns/printFilter.js";
import { showMenu } from "../../template/menu.js";
import { chartOptions } from "../../helper/patterns/chartsPatterns.js";
import { apply_resizing } from "../../helper/dc-resizing.js";

// parametro referente ao calendário
showMenu();

listarDadosPrevencaoMulta().then(json => { 
    json.forEach(d => d.dataLeitura = new Date(d.dataLeitura));
    let auxFilter = [];
    
//Padrão de altura e largura
const patternWidthArea = document.querySelector("#tipoVia").clientWidth;
const patternWidthPie = document.querySelector("#chart-pie").clientWidth;    
    //Instancia do Crossfilter
    const ndx = crossfilter(json);

    //Criação das dimensions
    const dimPlaca = ndx.dimension(d => d.placa);
    const dimGrupo = ndx.dimension(d => d.grupo);
    const dimData = ndx.dimension(d => d.dataLeitura);
    const dimTipoVia = ndx.dimension(d => d.tipoVia);
    const dimEvento = ndx.dimension(d => d.evento);

    //Criação dos grupos
    const groupGrupo = dimGrupo.group().reduceSum(d => d.infracoes);
    const groupEvento = dimEvento.group();
    const groupData = dimData.group().reduce(function(p, v) {
        p[v.tipoVia] = (p[v.tipoVia] || 0) + v.infracoes;
        return p;
    }, function(p, v) {
        p[v.tipoVia] = (p[v.tipoVia] || 0) - v.infracoes;
        return p;
    }, function() {
        return {};
    });
    //Instancia dos gráficos e tabelas
    const tablePlacas = new dc.DataTable("#table");
    const chartPieGroup = new dc.PieChart("#chart-pie");
    const chartStackedAreaTipoVia = new dc.LineChart("#tipoVia");
    const cboxCondicao = new dc.CboxMenu('#checkBox-condicao');

    cboxCondicao
        .dimension(dimEvento)
        .group(groupEvento)
        .promptText("Chuva e Seco")
        .title(d => d.key)
        .controlsUseVisibility(true);


    chartStackedAreaTipoVia
        .width(patternWidthArea)
        .height(chartOptions.patternHeightChart)
        // .margins({top: 30, right: 50, bottom: 30, left: 30})
        .x(d3.scaleTime().domain([json[0].dataLeitura, json.slice(-1)[0].dataLeitura]))
        .xAxisPaddingUnit('days')
        .xAxisPadding(2)
        .margins({left: 40, top: 0, right: 10, bottom: 20})
        // .margins({left: 50, top: 10, right: 10, bottom: 20})
        .renderArea(true)
        .brushOn(false)
        .renderDataPoints({fillOpacity: 0.8, strokeOpacity: 0.8, radius: 3})        
        .mouseZoomable(true)
        .zoomScale([1, 10])
        .zoomOutRestrict(true)
        .round(d3.timeMonth.round)
        // .transitionDuration(1500)
        .yAxisPadding('10%')          
        .renderHorizontalGridLines(true)        
        .dimension(dimData)
        .xUnits(d3.timeDays)
        .ordinalColors(colorOptions.colorPatternRodoviarioUrbano)
        .elasticY(true)                
        .legend(new dc.HtmlLegend().container('#legend-retirado-area').horizontal(true))
        .group(groupData, "Urbano", d => d.value["Urbano"]||0)        
        .title(d=> d.value.Urbano === undefined ? `${dateFormat(d.key)}\n${d.value.Rodoviario}` : `${dateFormat(d.key)}\n${d.value.Urbano}`)
        .xyTipsOn(true)        
        .stack(groupData, "Rodoviario", d => d.value["Rodoviario"]||0)
        .renderTitle(false)
        .on('pretransition.hideshow', legendToggle)
        .on('renderlet', chartStackedArea => {
            apply_resizing(chartStackedArea, "#tipoVia");
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mouseover", d => tooltip.text(`${dateFormat(d.x)} - ${d.layer} : ${d.y}`).style("visibility", "visible"));
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mouseout", d => tooltip.style("visibility", "hidden"));
            chartStackedArea.selectAll('g path').on("mousemove", (d => {event.target.classList.add('highlight')})) ;
            chartStackedArea.selectAll('g path').on("mouseout", (d => {event.target.classList.remove('highlight')})) ;
        })

        function legendToggle(chart) {
            const legenda = document.querySelectorAll('#legend-retirado-area .dc-legend-item-horizontal');
            legenda.forEach(legend => {
                legend.addEventListener("click", (event) => {
                    const filtroLegenda = legend.lastChild.getAttribute('title');
                    const path_1 = document.querySelectorAll("#tipoVia ._1");
                    const path_0 = document.querySelectorAll("#tipoVia ._0");
                    if(auxFilter.length === 0 || auxFilter.length === 2){
                        setTimeout(() => {
                            if (filtroLegenda.toLowerCase() === "urbano") {
                                path_1.forEach(element => {
                                    element.classList.toggle('d-none');
                                })
                            } else {
                                path_0.forEach(element => {
                                    element.classList.toggle('d-none');
                                })
                            }
                        }, 500)
                        auxFilter = [];
                        auxFilter.push(filtroLegenda);
                        dimTipoVia.filter(filtroLegenda);
                        dc.redrawAll();                    
                        
                    }else{
                        path_0.forEach(element => {                            
                                element.classList.remove('d-none');
                        })                                                    
                        path_1.forEach(element => {
                                element.classList.remove('d-none');                            
                        })                                                                 
                        auxFilter.push(filtroLegenda);
                        dimTipoVia.filter();
                        dc.redrawAll();                    
                    }                
                })
            })
        }

    tablePlacas
    .dimension(dimPlaca)
    .sortBy(d => d.infracoes)
    .showSections(false)        
    .order(d3.descending)
    .size(10)
    .columns(['placa', {
        label: "Infrações",
        format: d =>  d.infracoes            
    }]);

    chartPieGroup
    .width(patternWidthPie)
    .height(chartOptions.patternHeightChart)
    .renderTitle(false)
    .transitionDuration(1500)
    .innerRadius(140)
    .ordinalColors(colorOptions.colorPatternCategoryVivo)    
    .legend(new dc.HtmlLegend().container('#legend-pieChart').horizontal(true))
    .externalLabels(20)    
    .controlsUseVisibility(true)
    .ordering(d => d.key)
    .dimension(dimGrupo)
    .group(groupGrupo)
    .label(d => {                        
        return `${d.key.toUpperCase()} - ${  d.value}`;
    })
    .on('renderlet', chartPieDonut => {
        apply_resizing(chartPieGroup, "#chart-pie")
        chartPieDonut.selectAll('path').on("mouseover", d => tooltip.text(`${d.data.key}\n - ${d.data.value}`).style("visibility", "visible"));
        // chartPieDonut.selectAll('path').on("click", d => {console.log("asdasd");return cleanTable('.dc-table-column._0')});
        chartPieDonut.selectAll('path').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
        chartPieDonut.selectAll('path').on("mouseout", d => tooltip.style("visibility", "hidden"));});            

    dc.renderAll();    

})