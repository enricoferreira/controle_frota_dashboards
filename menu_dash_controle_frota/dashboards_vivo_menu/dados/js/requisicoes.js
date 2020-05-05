const listarDadosFrotaMomentoAtual = () => fetch('https://cache.1gps.com.br/infoGrafico_multiportal/dashboards_vivo_menu/frota_momento_atual/dados.json')
    .then(r => r.json())
    .then(json => json);

const listarDadosRetiradosAtivos = ()=>fetch('https://cache.1gps.com.br/infoGrafico_multiportal/dashboards_vivo_menu/dash_retirados_ativos/dados.json')
    .then(r=>r.json())
    .then(json=>json);

const listarDadosDistanciaPercorrida = ()=>fetch('https://cache.1gps.com.br/infoGrafico_multiportal/dashboards_vivo_menu/dash_distancia_percorrida/dados.json')
    .then(r=>r.json())
    .then(json=>json)

const listarDadosPrevencaoMulta = () => fetch('https://cache.1gps.com.br/infoGrafico_multiportal/dashboards_vivo_menu/dash_prevencao_multa/js/dados.json')
    .then(r => r.json())
    .then(json => json);

export {listarDadosDistanciaPercorrida, listarDadosFrotaMomentoAtual, listarDadosPrevencaoMulta, listarDadosRetiradosAtivos};