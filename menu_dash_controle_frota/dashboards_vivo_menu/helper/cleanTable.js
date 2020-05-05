export const cleanTable = (columnClass)=>{
    const tds = document.querySelectorAll(columnClass);
    let auxArray = [];    
    tds.forEach(td => auxArray.indexOf(td.innerHTML) > -1 ? td.parentElement.remove() : auxArray.push(td.innerHTML))
}

export const cleanTableFilterSelection = (chartPieces) => {    
    chartPieces.forEach(piece=>{        
        piece.addEventListener("click", ()=>{           
            cleanTable(".dc-table-column._0")
        })
    })
}