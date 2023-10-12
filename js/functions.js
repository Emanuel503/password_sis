$(document).ready(function(){
    
    //Muetra los datos guardados en localStorage al cargar la pagina
    cargarDatos(obtenerDatos())

    //Inicio de los tooltip
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    
    //Envio de formulario
    $('#form').submit(function(e){
        try{
            e.preventDefault(e);

            const data = obtenerDatos();

            const url = $('#url').val()
            const nombre = url.split('-')[1].split('.')[0]
            const ssh = "ssh siap@"+url.split('/')[2]

            const password1 = `s1s${nombre.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0')}-s14p`
            const password2 = `s14p${nombre.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0')}-s14p`

            let id = JSON.parse(localStorage.getItem('id'))

            if(!id){
                localStorage.setItem('id', JSON.stringify(1))
                id = 1;
            }

            let estab = {
                id : id,
                url: url,
                nombre : nombre,
                ssh : ssh,
                password1: password1,
                password2: password2,
            }

            data.push(estab)

            localStorage.setItem('id', JSON.stringify(parseInt(id) + 1))
            localStorage.setItem('data', JSON.stringify(data))

            $('#url').val("");

            cargarDatos(obtenerDatos())
        }catch(err){
            console.log(err);
        }
    })

    //Funcion para cargar los datos en la tabla
    function cargarDatos(data){
        
        $('#datos').empty();

        let table = `
            <table id="table" class="table table-bordered table-hover table-sm text-center mt-2">
                <thead class="table-primary">
                    <th class="text-center">ID</th>
                    <th width="50px" class="text-center">Nombre establecimiento</th>
                    <th width="400px" class="text-center">Comando</th>
                    <th class="text-center">Password 1</th>
                    <th class="text-center">Password 2</th>
                </thead>
                <tbody id="table_password">
        
                </tbody>
            </table>`
        
        $('#datos').append(table);
        
        data.forEach(estab => {
            $('#table_password').append(`
                <tr>
                    <td>${estab.id}</td>
                    <td><a target='_blank' href="${estab.url}">${estab.nombre}</a></td>
                    <td>
                        <input class="pass" readonly value="${estab.ssh}">
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copiar al portapapeles" class="btn btn-success btn-sm float-end mx-2 copy"><img src="img/save-copy-24-filled.svg"></button>
                    </td>
                    <td>
                        <input class="pass" readonly value="${estab.password1}">
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copiar al portapapeles" class="btn btn-success btn-sm float-end mx-2 copy"><img src="img/save-copy-24-filled.svg"></button>
                    </td>
                    <td>
                        <input class="pass" readonly value="${estab.password2}">
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copiar al portapapeles" class="btn btn-success btn-sm float-end mx-2 copy"><img src="img/save-copy-24-filled.svg"></button>
                    </td>
                </tr>
            `)
        });

        new DataTable('#table',{
            order: [[0, 'desc']]
        });
    }

    //Funcion para obtener los datos guardados
    function obtenerDatos(){
        let data = JSON.parse(localStorage.getItem('data'))
        
        if(!data){
            localStorage.setItem('data', JSON.stringify([]))
            data = [];
        }
        
        return data
    }
    
    //Copiar al portapapeles
    $('#datos').on('click', '.copy', function () {
        let boton = this;
        let img = $(boton).children('img');

        img.attr("src", `img/check.svg`)
        const tooltip = bootstrap.Tooltip.getInstance(boton)
        tooltip.setContent({ '.tooltip-inner': 'Copiado!' })

        const padre = $(boton).parent();
        const input = padre.find('input');
        input.select();
        document.execCommand("copy");

        setTimeout(function() {
            img.attr("src", `img/save-copy-24-filled.svg`)
            const tooltip = bootstrap.Tooltip.getInstance(boton)
            tooltip.setContent({ '.tooltip-inner': 'Copiar al portapapeles' })
        }, 3000);
    });
})