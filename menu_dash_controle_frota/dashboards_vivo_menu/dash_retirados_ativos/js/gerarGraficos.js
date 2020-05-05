import { listarDadosRetiradosAtivos } from "../../dados/js/requisicoes.js";
import { cleanTable, cleanTableFilterSelection } from "../../helper/cleanTable.js";
// import { print_filter } from "../../helper/patterns/printFilter.js";
import { tooltip } from "../../helper/patterns/tooltip.js";
import { colorOptions } from "../../helper/patterns/patternsColors.js";
import {formatBr, dateFormat} from "../../helper/patterns/dateFormat.js";
import { showMenu } from "../../template/menu.js";
import { chartOptions } from "../../helper/patterns/chartsPatterns.js"
import { apply_resizing } from "../../helper/dc-resizing.js";

// parametro referente ao calendário
showMenu();

// eslint-disable-next-line no-undef
listarDadosRetiradosAtivos().then(json=>{    
    console.log(chartOptions.getPatternWidthChart('#test'));
     
let auxFilter = [];    
const patternWidth = document.querySelector("#stackedarea .content").clientWidth;
const widthEigthWideColumn = document.querySelector(".ui.two.cards .content").clientWidth;

    //set Charts    
    const chartStackedGroup = new dc.BarChart('#chart-stacked-group');
    const table =  new dc.DataTable('#table');
    const stackedAreaChart = new dc.LineChart('#test');    

    json.forEach(d => d.dataRetiradaAtivacao = new Date(d.dataRetiradaAtivacao));
    

    //set Crossfilter
    const ndx = crossfilter(json);    
    
    //set Dimensions
    const dimStatus = ndx.dimension(d => d.status);    
    const dimGrupo = ndx.dimension(d => d.grupo);
    const dimCategoria = ndx.dimension(d => d.categoria);
    //dimension stacked area   
    const dimensionDataRetiradaAtivacao = ndx.dimension(d=>d.dataRetiradaAtivacao);

    //group stacked area
    const group = dimensionDataRetiradaAtivacao.group().reduce(function(p, v) {
        p[v.status] = (p[v.status] || 0) + 1;
        return p;
    }, function(p, v) {
        p[v.status] = (p[v.status] || 0) - 1;
        return p;
    }, function() {
        return {};
    });

    // //array filtrado para inserção no gráfico
    const arrayXdim = [...new Set (json.map(objeto=>objeto.grupo))].sort();          
    
    const yDimension = dimGrupo.group().reduce(            
        (p, d) => {
            p[d.categoria] = (p[d.categoria]|| 0) + 1;            
            return p;
        },
        (p, d) => {
            p[d.categoria] = (p[d.categoria]|| 0) -1;
            return p;
        },
        () => ({}))
        let arrayLegendItemStacked = [];
    chartStackedGroup
        .height(chartOptions.patternHeightChart).barPadding(.6)
        .x(d3.scaleBand().domain(arrayXdim))
        .dimension(dimGrupo)        
        .group(yDimension,'Leve',d =>  d.value['leve']||0)
        .stack(yDimension,'Médio',d => d.value['medio']||0)
        .stack(yDimension,'Pesado',d => d.value['pesado']||0)        
        .transitionDuration(500)
        .renderLabel(true)        
        .yAxisPadding('10%')
        .transitionDuration(1500)
        .turnOnControls(true)            
        .ordinalColors(colorOptions.colorPatternCategoryVivo)    
        .renderTitle(false)
        .label(function (d) {
            return d.y1;
        })
        .on('renderlet', chartStackedGroup => {
            apply_resizing(chartStackedGroup, "#chart-stacked-group");
            chartStackedGroup.selectAll('.stack rect.bar').on("mouseover", d => tooltip.text(`${d.x} - ${d.layer} : ${d.y}`).style("visibility", "visible"));
            chartStackedGroup.selectAll('.stack rect.bar').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            chartStackedGroup.selectAll('.stack rect.bar').on("mouseout", d => tooltip.style("visibility", "hidden"));})
        .on('renderlet', chartStackedGroup => {
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
        .legend(new dc.HtmlLegend().container('#legend-stackedBar').horizontal(true).highlightSelected(true))
        .xUnits(dc.units.ordinal);
        chartStackedGroup.render();

    table
        .dimension(dimStatus)
        .sortBy(d => d.grupo)
        .showSections(false)
        .order(d3.descending)
        .size(10)
        .columns(['placa','grupo', 'status', {
            label: "Categoria",
            format: d=> {
            if(d.categoria === 'medio'){
                return 'Médio'
            }else if(d.categoria === 'leve'){
                return 'Leve'
            }else{
                return 'Pesado'
            }
        }
    }]);
    table.render();

    stackedAreaChart
        .width(patternWidth)
        .yAxisPadding('10%')
        .height(chartOptions.patternHeightChart)
        .x(d3.scaleTime().domain([moment(json[0].dataRetiradaAtivacao).subtract(10, 'hour'), moment(json.slice(-1)[0].dataRetiradaAtivacao).add(10, 'hours')]))        
        .renderArea(true)
        .brushOn(false)
        .mouseZoomable(true)
        .renderHorizontalGridLines(true)
        // .transitionDuration(1500)
        .renderDataPoints({fillOpacity: 0.8, strokeOpacity: 0.8, radius: 3})
        .zoomScale([1, 100])
        .renderTitle(false)
        .zoomOutRestrict(true)
        .curve(d3.curveCardinal)
        .dimension(dimensionDataRetiradaAtivacao)
        .xUnits(d3.timeMonths).ordinalColors(colorOptions.colorPatternRetiradosAtivo)
        .elasticY(true)
        .controlsUseVisibility(true)                
        .legend(new dc.HtmlLegend().container('#legend-retirado-area').horizontal(true).highlightSelected(true))
        .group(group, "Ativo", d => d.value["Ativo"]||0)
        .stack(group, "Retirado", d => d.value["Retirado"]||0)                
        .on('pretransition.hideshow', legendToggle)
        .on('renderlet', stackedAreaChart => {
            apply_resizing(stackedAreaChart, "#test");
            stackedAreaChart.selectAll('.dc-tooltip-list .dot').on("mouseover", d => tooltip.text(`${dateFormat(d.x)} - ${d.layer} : ${d.y}`).style("visibility", "visible"));
            stackedAreaChart.selectAll('.dc-tooltip-list .dot').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            stackedAreaChart.selectAll('.dc-tooltip-list .dot').on("mouseout", d => tooltip.style("visibility", "hidden"));            
            stackedAreaChart.selectAll('g path').on("mousemove", (d => {event.target.classList.add('highlight')})) ;
            stackedAreaChart.selectAll('g path').on("mouseout", (d => {event.target.classList.remove('highlight')})) ;           
        })
        stackedAreaChart.yAxis().ticks(6);     
        
        stackedAreaChart.render();
        
        

        function legendToggle(chart) {
            const legenda = document.querySelectorAll('#legend-retirado-area .dc-legend-item-horizontal');
            legenda.forEach(legend => {
                legend.addEventListener("click", (event) => {
                    const filtroLegenda = legend.lastChild.getAttribute('title');
                    
                    const path_1 = document.querySelectorAll("#test ._1");
                    const path_0 = document.querySelectorAll("#test ._0");
                    console.log(path_1);
                    if(auxFilter.length === 0 || auxFilter.length === 2){
                        setTimeout(() => {
                            if (filtroLegenda.toLowerCase() === "ativo") {
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
                        dimStatus.filter(filtroLegenda);
                        dc.redrawAll();                                            
                    }else{                        
                        path_0.forEach(element => {
                            element.classList.remove('d-none');
                        })                                                    
                        path_1.forEach(element => {
                            element.classList.remove('d-none');
                        })                                                         
                        auxFilter.push(filtroLegenda);
                        dimStatus.filter();
                        dc.redrawAll();                        
                    }                
                })
            })
        }      
})