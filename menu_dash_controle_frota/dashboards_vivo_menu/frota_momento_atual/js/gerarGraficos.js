import { cleanTable, cleanTableFilterSelection } from "../../helper/cleanTable.js";
import { print_filter } from "../../helper/patterns/printFilter.js";
import { tooltip } from "../../helper/patterns/tooltip.js";
import { colorOptions } from "../../helper/patterns/patternsColors.js";
import { showMenu } from "../../template/menu.js";
import { listarDadosFrotaMomentoAtual } from "../../dados/js/requisicoes.js";
import { updateView } from "./view/updateView.js";
import { chartOptions } from "../../helper/patterns/chartsPatterns.js";


// parametro referente ao calendário
showMenu(false);
export function generateChart(statusParameter = "ON"){
        let auxArray = [];
        const widthPatternChartPie = document.querySelector("#chart-pie").parentElement.clientWidth;
        const widthPatternChartPieColumns = document.querySelector("#chart-pie-total").clientWidth;
    listarDadosFrotaMomentoAtual().then(json=>{         
    
    //instancia crossfilter
    const ndx = crossfilter(json);
    const ndxTotal = crossfilter(json);
    const ndxOn = crossfilter(json);
    const ndxOff = crossfilter(json);

    //instancia dimensão dados
    const all = ndxTotal.dimension(d => d.total);
    const allPlaca = ndxTotal.dimension(d => d.placa);
    const allON = ndxOn.dimension(d => d.total);
    const allONPlaca = ndxOn.dimension(d => d.placa);
    const allOFF = ndxOff.dimension(d => d.total);
    const allOFFPlaca = ndxOff.dimension(d => d.placa);
    const dimensionStatusOn = ndxOn.dimension(d => d.status);
    const dimensionStatusOff = ndxOff.dimension(d => d.status);


    const dimensionCategoria = ndx.dimension(d => d.categoria);
    const dimensionGrupo = ndx.dimension(d => d.grupo);
    const dimensionPlaca = ndx.dimension(d => d.placa);
    const dimensionStatus = ndx.dimension(d => d.status);
    
    //instancia grupos    
    const total = all.group();
    const totalOn = allON.group();
    const totalOff = allOFF.group();

    //filtros para seleção
    
    let filterStatus = 0;   

    //grupos
    const grupoGrupo = dimensionGrupo.group();
    const grp_all  = ndx.groupAll().reduce((p, d) => {
        if(auxArray.indexOf(d.placa) === -1){
            auxArray.push(d.placa);
            p[d.categoria] = (p[d.categoria]|| 0) + 1;                         
        }else{
            p[d.categoria] = (p[d.categoria]|| 0) + 0;    
            const elementIndex = auxArray.indexOf(d.placa);
            auxArray.splice(elementIndex, 1);
        }        
        return p
    },
    (p, d) => {    
        if(auxArray.indexOf(d.placa) === -1){
            auxArray.push(d.placa);
            p[d.categoria] = (p[d.categoria]|| 0) - 0;                                        
        }else{
            p[d.categoria] = (p[d.categoria]|| 0) - 1;    
            const elementIndex = auxArray.indexOf(d.placa);
            auxArray.splice(elementIndex, 1);
        }
        return p
    },
    () => ({}))

    //set Charts
    const chartPieDonut = new dc.PieChart('#chart-pie');
    const chartTable = new dc.DataTable('#table');    
    const boxNDLeve = new dc.NumberDisplay("#number-leve");    
    const boxNDMedio = new dc.NumberDisplay("#number-medio");    
    const boxNDPesado = new dc.NumberDisplay("#number-pesado");    
    const chartPieTotal = new dc.PieChart('#chart-pie-total', 'chartGroup');
    const chartPieOn = new dc.PieChart('#chart-pie-on', 'chartGroup');
    const chartPieOff = new dc.PieChart('#chart-pie-off', 'chartGroup');

function filterDuplicatePlates(dimen){
    let arrayPlacas = []
    dimen.filter(d => {
        if(arrayPlacas.indexOf(d) === -1){
            arrayPlacas.push(d);
            return d;
        }        
    })
}

    chartPieTotal
        .width(widthPatternChartPieColumns)
        .height(250)                
        .dimension(all)
        .group(total)
        .innerRadius(90)            
        .externalLabels(-125)
        .renderTitle(false)                
        .controlsUseVisibility(false)
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(d => d.data.value)            
        })
        .on('preRender', function(chart) {
            filterDuplicatePlates(allPlaca);
        })
        .on('renderlet', chartPieDonut => {                     
            chartPieDonut.selectAll('path').on("click", d => {generateChart("TOTAL")});
        });                
        
        chartPieOn
        .width(widthPatternChartPieColumns)
        .height(250)
        .dimension(allON)
        .group(totalOn)
        .innerRadius(90)             
        .externalLabels(-115)
        .renderTitle(false)             
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(d => d.data.value)
        })     
        .controlsUseVisibility(false)                        
        .on('renderlet', chartPieOn => {            
            chartPieOn.selectAll('path').on("click", d => generateChart("ON"));
        })
        .on('preRender', function(chart) {
            filterDuplicatePlates(allONPlaca);
            const filterStatusOn = dimensionStatusOn.filter(d => d === 'ON');
        })
        .label(d => '');

        chartPieOff
        .width(widthPatternChartPieColumns)
        .height(250)                
        .dimension(allOFF)
        .group(totalOff)
        .innerRadius(90)    
        .slicesCap(2)             
        .externalLabels(-125)
        .renderTitle(true)
        .controlsUseVisibility(false)
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(d => d.data.value)
            
        })        
        .on('renderlet', chartPieOff => {            
            chartPieOff.selectAll('path').on("click", d => generateChart("OFF"));                        
            
        })
        .on('preRender', function(chart) {
            filterDuplicatePlates(allOFFPlaca);
            const filterStatusOff = dimensionStatusOff.filter(d => d === 'OFF');
            
        })
        .label(d => '');
        
        if(statusParameter === "ON"){
            filterStatus = dimensionStatus.filter(d => d === statusParameter);
            chartPieOn.ordinalColors(colorOptions.colorPatternOn) && chartPieOff.ordinalColors(colorOptions.colorPatternInactive) && chartPieTotal.ordinalColors(colorOptions.colorPatternInactive);
        }else if(statusParameter === "OFF"){
            filterStatus = dimensionStatus.filter(d => d === statusParameter);
            chartPieOn.ordinalColors(colorOptions.colorPatternInactive) && chartPieOff.ordinalColors(colorOptions.colorPatternOff) && chartPieTotal.ordinalColors(colorOptions.colorPatternInactive);
        }else{
            chartPieOn.ordinalColors(colorOptions.colorPatternInactive) && chartPieOff.ordinalColors(colorOptions.colorPatternInactive) && chartPieTotal.ordinalColors(colorOptions.colorPatternPrimary);
        }

    boxNDLeve
    .formatNumber(d3.format(".1"))    
    .valueAccessor(d => d["Leve"])
    .group(grp_all)

    boxNDMedio
    .formatNumber(d3.format(".1"))    
    .valueAccessor(d => d["Medio"])
    .group(grp_all)
    
    boxNDPesado
    .formatNumber(d3.format(".1"))    
    .valueAccessor(d => d["Pesado"])
    .group(grp_all)        

    chartPieDonut
        .width(widthPatternChartPie)
        .height(chartOptions.patternHeightChart)        
        .legend(new dc.HtmlLegend().container('#year-legend').horizontal(true))
        .dimension(dimensionGrupo)
        .ordering(d => d.key)
        .transitionDuration(500)
        .group(grupoGrupo)
        .innerRadius(140)    
        .ordinalColors(colorOptions.colorPatternArrayVivo)        
        .externalLabels(20)
        .renderTitle(false)
        .label(d => {                        
            return `${d.key.toUpperCase()} - ${  d.value}`;
        })
        .controlsUseVisibility(false)        
        .on('renderlet', chartPieDonut => {
            chartPieDonut.selectAll('path').on("mouseover", d => tooltip.text(`${d.data.key}\n${d.data.value}`).style("visibility", "visible"));            
            chartPieDonut.selectAll('path').on("mousemove", d => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"));
            chartPieDonut.selectAll('path').on("mouseout", d => tooltip.style("visibility", "hidden"));            
        });            
            
        
        
    chartTable
        .dimension(dimensionGrupo)
        .sortBy(d => d.dataHoraUltimaPosicao)
        .order(d3.descending)
        .size(10)        
        .on('postRedraw', chartTable => {
            callbackCleanTable();
        })
        .on('preRender', chartTable => {
            callbackCleanTable();
        })
        .showSections(false)
        .columns(['placa',{
            label: 'Data/Hora - Ultima Posição',
            format: d => {
                return d.dataHoraUltimaPosicao;
            }
        }]);    

    dc.renderAll('chartGroup');
    dc.renderAll();
    
    const chartSlice = document.querySelectorAll(".pie-slice-group .pie-slice path");
    updateView(statusParameter);
    cleanTable(".dc-table-column._0", chartSlice);
})
}
generateChart();

function callbackCleanTable(){
    const chartSlice = document.querySelectorAll(".pie-slice-group .pie-slice path");
    const chartLegend = document.querySelectorAll(".dc-legend-item-label");            
    cleanTable(".dc-table-column._0", chartSlice);
    cleanTableFilterSelection(chartLegend);
}