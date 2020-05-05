export const modalToggle = ()=>{
    const calendarBtns = document.querySelectorAll('.calendar-toggle');
    calendarBtns.forEach(calendarBtn =>{

        calendarBtn.addEventListener('click', ()=>{
            $('.ui.modal')
                .modal({
                    blurring: true
                }).modal('show')
            ;
        })
    })
}

export const calendarToggle = () => {
    $('#rangestart').calendar({
        type: 'date',
        endCalendar: $('#rangeend')
      });
      $('#rangeend').calendar({
        type: 'date',
        startCalendar: $('#rangestart')
      });
}

