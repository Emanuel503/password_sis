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
            $('#url').val("");

            const regex1 = /^http[s]?\b:\/\/\bsiap-(\w+)\.salud.gob.sv/gs;
            const regex2 = /^http[s]?\b:\/\/\bsis-(\w+)\.salud.gob.sv/gs;
            
            const matches1 = url.match(regex1);
            const matches2 = url.match(regex2);

            if (!matches1 && !matches2) {
                toastr.error('Ingresa una URL valida. Ej. https://siap-uzacamil.salud.gob.sv/');
                return
            }

            const nombre = url.split('-')[1].split('.')[0]
            const ssh = "ssh siap@"+url.split('/')[2]

            const password1 = `s1s${nombre.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0')}-s14p`
            const password2 = `s14p${nombre.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0')}-s14p`

            let id = JSON.parse(localStorage.getItem('id'))
            let mensaje = "";
            let establecimiento = validarExistencia(nombre);
            let correcta = null

            if(!establecimiento){
                mensaje = "Establecimiento guardado correctamente"
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
                    correcta: null,
                }
    
                data.push(estab)
    
                localStorage.setItem('id', JSON.stringify(parseInt(id) + 1))
                localStorage.setItem('data', JSON.stringify(data))

                cargarDatos(obtenerDatos())
                toastr.success('Establecimiento guardado correctamente');
            }else{
                mensaje = "Este establecimiento ya esta guardado"
                id = establecimiento.id; 
                correcta = establecimiento.correcta;
                toastr.info('Este establecimiento ya esta guardado');
            }

            $('#boton_modal').show();
            mostrarModal(id, nombre, url, ssh, password1, password2, correcta, mensaje)
        }catch(err){
            console.log(err);
        }
    })

    //Funcion para cargar los datos en la tabla
    function cargarDatos(data){
        $('.copy').tooltip();
        $('#datos').empty();

        let table = `
            <table id="table" class="table table-bordered table-hover table-sm text-center mt-2">
                <thead class="table-primary">
                    <th class="text-center">ID</th>
                    <th width="50px" class="text-center">Nombre establecimiento</th>
                    <th width="400px" class="text-center">Comando</th>
                    <th class="text-center">Password 1</th>
                    <th class="text-center">Password 2</th>
                    <th class="text-center">Acciones</th>
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
                        <input class="pass ${estab.correcta == "password1" ? 'correcta': ''}" readonly value="${estab.password1}">
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copiar al portapapeles" class="btn btn-success btn-sm float-end mx-2 copy"><img src="img/save-copy-24-filled.svg"></button>
                    </td>
                    <td>
                        <input class="pass ${estab.correcta == "password2" ? 'correcta': ''}" readonly value="${estab.password2}">
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copiar al portapapeles" class="btn btn-success btn-sm float-end mx-2 copy"><img src="img/save-copy-24-filled.svg"></button>
                    </td>
                    <td>
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Ver" onclick="mostrarModal('${estab.id}','${estab.nombre}', '${estab.url}', '${estab.ssh}', '${estab.password1}', '${estab.password2}', '${estab.correcta}')" class="btn btn-primary btn-sm"><img src="img/eye.svg"></button>
                        <button data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eliminar" onclick="confimarEliminar(${estab.id})" class="btn btn-danger btn-sm"><img src="img/x-bold.svg"></button>
                    </td>
                </tr>
            `)
        });

        new DataTable('#table',{
            order: [[0, 'desc']]
        });
    }
    
    //Copiar al portapapeles
    $('#content').on('click', '.copy', function () {
        $('.copy').tooltip();
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
            tooltip.setContent({ '.tooltip-inner': 'Copiar al portapapeles' })
        }, 3000);

        toastr.success('Copiado al porta papeles');
    });

    //Valida si existe el establecimiento
    function validarExistencia(nombre){
        datos = obtenerDatos()
        const resultado = datos.find(estab => estab.nombre === nombre)

        return resultado;
    }

    //Funcion para eliminar el establecimiento
    $('#btn_confirmar_eliminar').on('click', function(){
        $('#eliminar').modal('hide')
        const id = $('#id_eliminar').val()
        datos = obtenerDatos()
        const index = datos.findIndex(estab => estab.id === id)
        datos.splice(index, 1)
        localStorage.setItem('data',JSON.stringify(datos));
        cargarDatos(datos);
        toastr.success('Establecimiento eliminado correctamente');
    })

    //Funcion para escoger password correcta
    $('#content').on('click', '.buena', function () {
        let id = $(this).data("data-id");
        let idElemento = $(this).prop("id")
               
        datos = obtenerDatos()
        const index = datos.findIndex(estab => estab.id == id);
        
        if(idElemento == "btn_buena_1"){
            datos[index].correcta = "password1";
            $('#password2_modal').removeClass("correcta")
            $('#password1_modal').addClass("correcta")
            
        }else{
            datos[index].correcta = "password2";
            $('#password1_modal').removeClass("correcta")
            $('#password2_modal').addClass("correcta")
        }
        
        localStorage.setItem('data', JSON.stringify(datos))
        cargarDatos(datos)
        toastr.success('Contraseña valida guardada correctamente');
    });
})

//Funcion para obtener los datos guardados
function obtenerDatos(){
    let data = JSON.parse(localStorage.getItem('data'))
    
    if(!data){
        localStorage.setItem('data', JSON.stringify([]))
        data = [];
    }
    
    return data
}

//Funcion para mostrar el modal de confirmacion de eliminar
function confimarEliminar(id){
    datos = obtenerDatos()
    const estab = datos.find(estab => estab.id === id)
    $('#nombre_eliminar').text(estab.nombre)
    $('#id_eliminar').val(estab.id)
    $('#datos_eliminar').html(`
        <a target="_blank" href="${estab.url}">${estab.url}</a><br><br>
        <strong>Comando:</strong> ${estab.ssh}<br>
        <strong>Password 1:</strong> ${estab.password1}<br>
        <strong>Password 2:</strong> ${estab.password2}
    `)
    $('#eliminar').modal('show')
}

//Funcion para mostrar el modal
function mostrarModal(id, nombre, url, ssh, password1, password2, correcta, mensaje = null){
    $('#url_modal').text(nombre).attr('href', url)
    $('#comando_modal').val(ssh)
    $('#password1_modal').val(password1)
    $('#password2_modal').val(password2)
    $('#mensaje_modal').text(mensaje)
    $('#btn_buena_1').data("data-id", id);
    $('#btn_buena_2').data("data-id", id);

    $('#password1_modal').removeClass("correcta")
    $('#password2_modal').removeClass("correcta")

    if(correcta == "password1"){
        $('#password1_modal').addClass("correcta")
    }

    if(correcta == "password2"){
        $('#password2_modal').addClass("correcta")
    }

    $('#detalles').modal('show');
}