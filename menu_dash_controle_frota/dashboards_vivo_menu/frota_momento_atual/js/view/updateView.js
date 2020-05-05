const titles = document.querySelectorAll("[data-title]");


export function updateView(statusValue){
    titles.forEach( title => {
        title.innerHTML = statusValue;
    })       
}
