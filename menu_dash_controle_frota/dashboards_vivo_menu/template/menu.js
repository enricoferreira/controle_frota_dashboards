import {toggleMenu} from './semantic_functions.js';
import {modalToggle , calendarToggle} from '../template/modal-calendar.js';


export const showMenu = (hasCalendar = true, hasDownload = true, hasClear = true) =>{
    const body = document.querySelector("body");
    const pageContent = document.querySelector("#page");
    
    const htmlMainMenu = 
        `<div class="ui top large attached menu menu-sticky grid">
                <div class="ui dropdown icon item">
                    <i class="sidebar large icon"></i>
                    <div class="menu">
                        <div class="item">
                            <i class="dropdown icon"></i>
                            <span class="text">Rastreamento Recuperação</span>
                            <div class="menu">
                                <a class="item" href="./index.html">
                                    <i class="pie chart huge icon"></i>
                                    Frota Momento Atual
                                </a>
                                <a class="item" href="./distancia_percorrida.html">
                                    <i class="chart area huge icon"></i>
                                    Distância Percorrida
                                </a>
                                <a class="item" href="./retirados_ativos.html">
                                    <i class="chart bar huge icon"></i>
                                    Retirados e Ativos
                                </a>                         
                            </div>
                        </div>
                        <div class="item">
                            <i class="dropdown icon"></i>
                            <span class="text">Prevenção Multas</span>
                            <div class="menu">
                            <a class="item" href="./prevencao_multas.html">
                                <i class="chart bar huge icon"></i>
                                Infrações
                            </a>                            
                            </div>
                        </div>          
                        <div class="item">
                            <i class="dropdown icon"></i>
                            <span class="text">Controle de Gastos</span>
                            <div class="menu">
                            <a class="item disabled" href="#">
                                <i class="chart bar huge icon"></i>
                                Má Utilização
                            </a>
                            <a class="item disabled" href="#">
                                <i class="chart bar huge icon"></i>
                                Ranking Infrações por Motorista
                            </a>
                            </div>
                        </div>    
                        <div class="item">
                            <i class="dropdown icon"></i>
                            <span class="text">Manutenção Preventiva</span>
                            <div class="menu">
                            <a class="item disabled" href="#">
                                <i class="chart bar huge icon"></i>
                                Idade da Frota - Ano Fabricação
                            </a>
                            <a class="item disabled" href="#">
                                <i class="chart bar huge icon"></i>
                                Idade da Frota - Odômetro
                            </a>
                            <a class="item disabled" href="#">
                                <i class="chart bar huge icon"></i>
                                Indicação - Man. Preventiva
                            </a>
                            </div>
                        </div>              
                    </div>                    
                </div>
                <div class="center menu computer-only-menu">
                    ${hasCalendar ? 
                        '<a class="calendar-toggle item"><i class="sprite-calendar-p r-icon"></i>Calendário</a>' : ''}
                    ${hasClear ? 
                        '<a id="cleanBtn" href="javascript:dc.filterAll(); dc.renderAll();" class="item"><i class="sprite-clear-p r-icon"></i>Limpar Tudo</a>' : ''}
                    ${hasDownload ? 
                        `<a id="printBtn" type="button" class="item"
                            onclick="printJS({printable: 'page' ,css: ['https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.2/dist/semantic.min.css', 'http://127.0.0.1:5500/dashboards_vivo_menu/helper/crossfilterjs/css/dc.css', 'http://127.0.0.1:5500/dashboards_vivo_menu/frota_momento_atual/css/style.css' ]})">
                            <i class="sprite-upload-p r-icon rotate-180"></i>Download
                        </a>` : ''}
                </div>
                <div class="right menu mob-tablet-menu p-r-0">
                    <div class="ui dropdown icon item">
                        <i class="ellipsis horizontal large icon"></i>
                        <div class="menu">                                                                                
                            ${hasCalendar ? 
                                '<a class="calendar-toggle item"><i class="sprite-calendar-p r-icon"></i>Calendário</a>' : ''}
                            ${hasClear ? 
                                '<a id="cleanBtn" href="javascript:dc.filterAll(); dc.renderAll();" class="item"><i class="sprite-clear-p r-icon"></i>Limpar Tudo</a>' : ''}
                            ${hasDownload ? 
                                `<a id="printBtn" type="button" class="item"
                                    onclick="printJS({printable: 'page',type: 'html' , style: '#categoria { height: 100%; }' ,css: ['https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.2/dist/semantic.min.css', 'http://127.0.0.1:5500/dashboards_vivo_menu/helper/crossfilterjs/css/dc.css', 'http://127.0.0.1:5500/dashboards_vivo_menu/frota_momento_atual/css/style.css' ]})">
                                    <i class="sprite-upload-p r-icon rotate-180"></i>Download
                                </a>` : ''}                        
                        </div>
                    </div>                  
                </div>
            </div>
            <div class="ui bottom attached">
                <div id="content-selection">
                </div>
            </div>
            ${hasCalendar ? `
            <div class="ui small modal transition hidden">
                <div class="header">
                    Data de Pesquisa
                </div>
                <div class="content">
                <div class="ui form">
                <div class="two fields">
                    <div class="field">                                    
                    <div class="ui calendar" id="rangestart">
                        <div class="ui input left icon">
                        <i class="calendar icon"></i>
                        <input type="text" placeholder="Data Início">
                        </div>
                    </div>
                    </div>
                    <div class="field">                                    
                    <div class="ui calendar" id="rangeend">
                        <div class="ui input left icon">
                        <i class="calendar icon"></i>
                        <input type="text" placeholder="Data fim">
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                </div>
                <div class="actions">                                
                <div class="ui positive right labeled icon button">
                    Search
                    <i class="search icon"></i>
                </div>
                </div>
            </div>                            
            ` : ''}
            
            `;
    body.insertAdjacentHTML('afterbegin', htmlMainMenu);
    const contentBox = document.querySelector("#content-selection");
    contentBox.appendChild(pageContent);

    hasCalendar ? modalToggle() : false;
    hasCalendar ? calendarToggle() : false;
    
    toggleMenu();    

}
