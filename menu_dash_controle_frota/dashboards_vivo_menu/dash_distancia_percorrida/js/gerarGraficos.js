// eslint-disable-next-line no-undef
import {listarDadosDistanciaPercorrida} from '../../dados/js/requisicoes.js';
import { formatBr, dateFormat} from "../../helper/patterns/dateFormat.js";
import { tooltip } from "../../helper/patterns/tooltip.js";
import { colorOptions } from "../../helper/patterns/patternsColors.js";
import { print_filter } from "../../helper/patterns/printFilter.js";
import { showMenu } from "../../template/menu.js";
import { chartOptions } from "../../helper/patterns/chartsPatterns.js";
import { apply_resizing } from "../../helper/dc-resizing.js";

// parametro referente ao calendário
showMenu();

listarDadosDistanciaPercorrida().then(json=>{
    
    let auxFilter = [];

    //Padrão de altura e largura
    const patternWidthArea = document.querySelector("#chart-stacked-area").clientWidth;
    const patternWidthBar = document.querySelector("#stacked-bar .content").clientWidth;        

    //set Charts    
    const chartStackedBar = new dc.BarChart('#chart-stacked-bar');
    const table =  new dc.DataTable('#table');
    const chartStackedArea = new dc.LineChart('#chart-stacked-area');   

    //Padrão de data para o dc.js
    json.forEach(d => d.dataLeitura = new Date(d.dataLeitura));

    //set Crossfilter
    const ndx = crossfilter(json);    
    
    //set Dimensions
    const dimTipoVia = ndx.dimension(d => d.tipoVia);
    const dimData = ndx.dimension(d => d.dataLeitura);
    const dimGrupo = ndx.dimension(d => d.grupo);
    const dimKm = ndx.dimension(d => d.kmRodado);
    const dimCategoria = ndx.dimension(d => d.categoria);
    
    //Reduce para o stackedArea
    const groupData = dimData.group().reduce(function(p, v) {
        p[v.tipoVia] = (p[v.tipoVia] || 0) + v.kmRodado;
        return p;
    }, function(p, v) {
        p[v.tipoVia] = (p[v.tipoVia] || 0) - v.kmRodado;
        return p;
    }, function() {
        return {};
    });

    //Reduce para o stackedBar
    const groupGrupo = dimGrupo.group().reduce((p, v)=>{        
        p[v.categoria] = (p[v.categoria] || 0) + v.kmRodado;        
        return p;
    },
    function(p, v) {
        p[v.categoria] = (p[v.categoria] || 0) - v.kmRodado;        
        return p
    },
    function() {
        return {};
    });
    
    // //array filtrado para inserção no gráfico Alfabeticamente
    const arrayXdim = [...new Set (json.map(objeto=>objeto.grupo))].sort();      
  
        //StackedBar
        let arrayLegendItemStacked = [];
    chartStackedBar
        .width(patternWidthBar).height(chartOptions.patternHeightChart).barPadding(0.6)
        .x(d3.scaleBand().domain(arrayXdim))        
        .dimension(dimGrupo)        
        .group(groupGrupo,'Leve',d =>  d.value['leve']||0)
        .stack(groupGrupo,'Médio',d => d.value['medio']||0)
        .stack(groupGrupo,'Pesado',d => d.value['pesado']||0)        
        .transitionDuration(1500)
        .renderLabel(true)
        .yAxisPadding('5%')
        .margins({left: 40, top: 0, right: 40, bottom: 20})
        .turnOnControls(true)    
        .ordinalColors(colorOptions.colorPatternCategoryVivo)            
        .label(function (d) {
            return  d.y1;
        })
        .renderTitle(false)
        .on('renderlet', chartStackedGroup => {
            apply_resizing(chartStackedBar, "#chart-stacked-bar");
            chartStackedGroup.selectAll('.stack rect.bar').on("mouseover", d => tooltip.text(`${d.x} - ${d.layer} : ${d.y}`).style("visibility", "visible"));
            chartStackedGroup.selectAll('.stack rect.bar').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            chartStackedGroup.selectAll('.stack rect.bar').on("mouseout", d => tooltip.style("visibility", "hidden"));})
        .legend(new dc.HtmlLegend().container('#legend-stackedBar').horizontal(true).highlightSelected(true))
        .on('renderlet', chartStackedBar => {
            const legendItens = document.querySelectorAll('#legend-stackedBar .dc-legend-item-horizontal');
            legendItens.forEach(legendItem => {
                legendItem.addEventListener('click', ()=>{
                    const filtroLegenda = legendItem.innerText.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');                    
                    if(arrayLegendItemStacked.length === 0 || arrayLegendItemStacked.length === 3){
                        arrayLegendItemStacked = [];
                        arrayLegendItemStacked.push(filtroLegenda);
                        dimCategoria.filter(d=>{
                            return d === arrayLegendItemStacked[0];
                        });                        
                    }else if(arrayLegendItemStacked.length === 1 || arrayLegendItemStacked.length === 2){
                        if (arrayLegendItemStacked.includes(filtroLegenda) != 1) {
                            arrayLegendItemStacked.push(filtroLegenda);
                            dimCategoria.filter(d=>{
                                return d === arrayLegendItemStacked[0] || d === arrayLegendItemStacked[1] || d === arrayLegendItemStacked[2];
                            });
                        }else{
                            const indexToRemove = arrayLegendItemStacked.indexOf(filtroLegenda);
                            arrayLegendItemStacked.splice(indexToRemove, 1);
                            dimCategoria.filter(d=>{
                                return d === arrayLegendItemStacked[0] || d === arrayLegendItemStacked[1] || d === arrayLegendItemStacked[2];
                            })
                        }
                    }
                    dc.redrawAll();
                })
            })
        })
        .xUnits(dc.units.ordinal);
    // chartStackedBar.yAxis().ticks(2);
    chartStackedBar.render();

    //Table
    table
        .dimension(dimGrupo)
        .sortBy(d => d.kmRodado)
        .showSections(false)        
        .order(d3.descending)        
        .size(10)
        .columns(['placa', {
            label: "Km Rodado",
            format: d =>  d.kmRodado + ' km'            
        }]);
        table.render();
        
    //StackedArea
    chartStackedArea    
        // .width(patternWidthArea)
        .height(chartOptions.patternHeightChart)        
        .x(d3.scaleTime().domain([json[0].dataLeitura, moment(json.slice(-1)[0].dataLeitura).add(10, "hour")]))
        .margins({left: 40, top: 0, right: 10, bottom: 20})
        .renderArea(true)
        .brushOn(false)
        .renderDataPoints({fillOpacity: 0.8, strokeOpacity: 0.8, radius: 3.5})        
        .mouseZoomable(true)
        .yAxisPadding('10%')
        .zoomScale([1, 10])
        .zoomOutRestrict(true)
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)        
        // .transitionDuration(1500)
        .renderHorizontalGridLines(true)        
        .dimension(dimData)
        .xUnits(d3.timeMonths)
        .ordinalColors(colorOptions.colorPatternRodoviarioUrbano)        
        .legend(new dc.HtmlLegend().container('#legend-retirado-area').horizontal(true))
        .group(groupData, "Urbano", d => d.value["Urbano"]||0)                
        .xyTipsOn(true)        
        .stack(groupData, "Rodoviario", d => d.value["Rodoviario"]||0)        
        .on('pretransition.hideshow', legendToggle)
        .on('renderlet', chartStackedArea => {
            apply_resizing(chartStackedArea, "#chart-stacked-area");
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mouseover", d => tooltip.text(`${dateFormat(d.x)} - ${d.layer} : ${d.y}`).style("visibility", "visible"));
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            chartStackedArea.selectAll('.dc-tooltip-list .dot').on("mouseout", d => tooltip.style("visibility", "hidden"));})
        // chartStackedArea.yAxis().ticks(4)
        chartStackedArea.label(function(d) { return d.key; });
        chartStackedArea.render();

        function legendToggle(chart) {
            const legenda = document.querySelectorAll('#legend-retirado-area .dc-legend-item-horizontal');
            legenda.forEach(legend => {
                legend.addEventListener("click", (event) => {
                    const filtroLegenda = legend.lastChild.getAttribute('title');
                    const path_1 = document.querySelectorAll("#chart-stacked-area ._1");
                    const path_0 = document.querySelectorAll("#chart-stacked-area ._0");
                    if(auxFilter.length === 0 || auxFilter.length === 2){
                        setTimeout(()=>{                        
                            if(filtroLegenda.toLowerCase()==="urbano"){
                                path_1.forEach(element => {
                                    element.classList.toggle('d-none');
                                })
                            }else{
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
  
})