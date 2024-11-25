document.addEventListener('DOMContentLoaded', function () {
    var nombreUsuario = sessionStorage.getItem('nombre');
    var fotoUsuario = sessionStorage.getItem('foto');
    var mensajeBienvenida = document.getElementById("mensajeBienvenida");
    mensajeBienvenida.textContent = "Bienvenido/a, " + nombreUsuario;
    var fotoUsuarioElement = document.getElementById("fotoUsuario");
        if (fotoUsuario) {
        fotoUsuarioElement.src = fotoUsuario;  // Asignar la foto si existe
        fotoUsuarioElement.style.display = "block";  // Asegurarse de que la foto se muestre
        } else {
            fotoUsuarioElement.style.display = "none";  // Ocultar la foto si no existe
        }
    
});

document.getElementById("cerrarSesionBtn").addEventListener("click", cerrarSesion);
document.getElementById("volverBtn").addEventListener("click", volver);

function cerrarSesion() {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('foto');
    sessionStorage.removeItem('ciudad');
    sessionStorage.removeItem('lat');
    sessionStorage.removeItem('long');
    window.location.href = 'index.html';
}

function volver() {
    window.location.href = 'logeadoNoPremium.html';
}

document.getElementById("verAficionesBtn").addEventListener('click', function(){
    var contenedorAficiones = document.getElementById("contenedorAficiones");
    contenedorAficiones.value = '';
    mostrarAficiones();
});

document.getElementById("añadirAficionesBtn").addEventListener('click', function(){
    var contenedorAficiones = document.getElementById("contenedorAficiones");
    contenedorAficiones.value = '';
    mostrarAficionesNoAsociadas();    
});



function mostrarAficiones(){
    var contenedorAficiones = document.getElementById("contenedorAficiones");
    contenedorAficiones.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);
    
    solicitud.onsuccess= function(evento){
        var db = evento.target.result;
        var transaccion = db.transaction(["AficionUsuario"], "readonly");
        var aficionUsuarioStore = transaccion.objectStore("AficionUsuario");
        var cursor = aficionUsuarioStore.openCursor();

        var tienesAficiones = false;
        var hayAficionesEnTabla = false;
        var emailUsuario = sessionStorage.getItem('email');
        
        cursor.onsuccess= function(eventoCursor){
            var resultado = eventoCursor.target.result;
            if(resultado){
                hayAficionesEnTabla=true;
                var aficion = resultado.value;
                if(aficion.email===emailUsuario){
                    tienesAficiones = true;
                    añadirAficionALaTabla(aficion);
                }
                resultado.continue();
            }else {
                // Cuando el cursor termina de recorrer la tabla
                if (!hayAficionesEnTabla) {
                    Swal.fire("No hay aficiones!");
                } else if (!tienesAficiones) {
                    Swal.fire("No tienes aficiones en tu perfil!\n :/");
                }
            }
        };
        cursor.onerror = function () {
            console.error("Error al abrir el cursor.");
        };
    };
    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
    };
}

function añadirAficionALaTabla(aficion){
    var contenedorAficiones=document.getElementById("contenedorAficiones");
    
    var tablaAficiones= document.querySelector(".tabla-aficiones");
    if(!tablaAficiones){
        tablaAficiones=document.createElement("table");
        tablaAficiones.className= "tabla-aficiones";

        var filaCabecera= document.createElement("tr");

        var idCabecera= document.createElement("th");
        idCabecera.textContent="ID";

        var aficionCabecera=document.createElement("th");
        aficionCabecera.textContent="Aficion";

        filaCabecera.appendChild(idCabecera);
        filaCabecera.appendChild(aficionCabecera);
        tablaAficiones.appendChild(filaCabecera);
    }
        var filaAficion=document.createElement("tr");
        filaAficion.id=aficion.id;
        
        var idCelda=document.createElement("td");
        idCelda.textContent=aficion.idAfi;

        var aficionCelda=document.createElement("td");

        a=aficion.idAfi;

        obtenerNombreAficion(a,function(nombre){
            if(nombre){
                aficionCelda.textContent=nombre;
            }else{
                console.log("Aficion no encontrada");
            }
        });
        
        var botonBorrar = document.createElement("button");
            botonBorrar.textContent = "Borrar";
            botonBorrar.addEventListener("click", function () {
            borrarAficion(aficion);
        });
        filaAficion.appendChild(idCelda);
        filaAficion.appendChild(aficionCelda);
        filaAficion.appendChild(botonBorrar);
        tablaAficiones.appendChild(filaAficion);
        contenedorAficiones.appendChild(tablaAficiones);

}

function obtenerNombreAficion(id, callback) {
    if (!id) {
        console.error("ID no válido para obtenerNombreAficion:", id);
        callback(null);
        return;
    }

    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Aficion"], "readonly");
        var aficionStore = transaccion.objectStore("Aficion");

        var cursor = aficionStore.get(id);
        cursor.onsuccess = function (eventoCursor) {
            var resultado = eventoCursor.target.result;

            if (resultado) {
                console.log("Nombre de la afición encontrado:", resultado.nombre);
                callback(resultado.nombre);
            } else {
                console.error("Afición no encontrada para ID:", id);
                callback(null);
            }
        };
        cursor.onerror = function () {
            console.error("Error al buscar la afición con ID:", id);
            callback(null);
        };
    };

    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
        callback(null);
    };
}

function borrarAficion(aficion) {
    var solicitud = indexedDB.open("vitomaite03"); 
    solicitud.onsuccess = function (event) {
        var db = event.target.result;
        var transaccion = db.transaction("AficionUsuario", "readwrite");
        var aficionUsuarioStore = transaccion.objectStore("AficionUsuario");

        var borrarSolicitud = aficionUsuarioStore.delete(aficion.id);
        borrarSolicitud.onsuccess = function () {
            var fila = document.getElementById(aficion.id);
            if (fila) {
                fila.remove(); 
            }
            Swal.fire("Afición borrada correctamente.");
        };
        borrarSolicitud.onerror = function () {
            console.error("Error al borrar la afición");
        };
    };
    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
    };
}
function mostrarAficionesNoAsociadas() {
    var contenedorAficiones = document.getElementById("contenedorAficiones");
    contenedorAficiones.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;

        // Abre una transacción para ambos objectStores
        var transaccion = db.transaction(["Aficion", "AficionUsuario"], "readonly");
        var aficionStore = transaccion.objectStore("Aficion");
        var aficionUsuarioStore = transaccion.objectStore("AficionUsuario");

        var todasLasAficiones = [];
        var aficionesUsuario = [];

        // Paso 1: Obtener todas las aficiones posibles
        aficionStore.getAll().onsuccess = function (eventoAficiones) {
            todasLasAficiones = eventoAficiones.target.result;
        console.log("Todas las aficiones:", todasLasAficiones); // Depuración
            // Paso 2: Obtener las aficiones del usuario actual
            var emailUsuario = sessionStorage.getItem("email");
            aficionUsuarioStore.openCursor().onsuccess = function (eventoCursor) {
                var cursor = eventoCursor.target.result;
                if (cursor) {
                    var aficion = cursor.value;
                    if (aficion.email === emailUsuario) {
                        aficionesUsuario.push(aficion.id);
                    }
                    cursor.continue();
                } else {
                    console.log("Aficiones del usuario:", aficionesUsuario); // Depuración
                    // Paso 3: Filtrar las aficiones no asociadas
                    var aficionesNoAsociadas = todasLasAficiones.filter(function (aficion) {
                        return !aficionesUsuario.includes(aficion.id);
                    });
                    console.log("Aficiones no asociadas:", aficionesNoAsociadas); // Depuració
                    // Paso 4: Mostrar las aficiones no asociadas
                    if (aficionesNoAsociadas.length > 0) {
                        aficionesNoAsociadas.forEach(function (aficion) {
                            añadirAficionNoAsociadaALaTabla(aficion);
                        });
                    } else {
                        Swal.fire("Todas las aficiones están asociadas a tu perfil.");
                    }
                }
            };
        };
    };

    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
    };
}

function añadirAficionNoAsociadaALaTabla(aficion) {
    var contenedorAficiones = document.getElementById("contenedorAficiones");
    
    var tablaAficiones = document.querySelector(".tabla-aficiones");
    if (!tablaAficiones) {
        tablaAficiones = document.createElement("table");
        tablaAficiones.className = "tabla-aficiones";

        var filaCabecera = document.createElement("tr");

        var idCabecera = document.createElement("th");
        idCabecera.textContent = "ID";

        var aficionCabecera = document.createElement("th");
        aficionCabecera.textContent = "Afición";

        filaCabecera.appendChild(idCabecera);
        filaCabecera.appendChild(aficionCabecera);
        tablaAficiones.appendChild(filaCabecera);
    }

    var filaAficion = document.createElement("tr");
    filaAficion.id = aficion.id;

    var idCelda = document.createElement("td");
    idCelda.textContent = aficion.id;

    var aficionCelda = document.createElement("td");

    var a = aficion.id;

    obtenerNombreAficion(a, function (nombre) {
        if (nombre) {
            aficionCelda.textContent = nombre;
        } else {
            console.log("Afición no encontrada");
        }
    });

    // Añadir solo el botón para asociar la afición al usuario
    var botonAsociar = document.createElement("button");
    botonAsociar.textContent = "Añadir";
    botonAsociar.addEventListener("click", function () {
        asociarAficion(aficion); // Función que asociará la afición al usuario
    });

    filaAficion.appendChild(idCelda);
    filaAficion.appendChild(aficionCelda);
    filaAficion.appendChild(botonAsociar);
    tablaAficiones.appendChild(filaAficion);
    contenedorAficiones.appendChild(tablaAficiones);
}

function asociarAficion(aficion) {
    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;

        // Abre una transacción para el objectStore de AficionUsuario
        var transaccion = db.transaction(["AficionUsuario"], "readwrite");
        var aficionUsuarioStore = transaccion.objectStore("AficionUsuario");

        var emailUsuario = sessionStorage.getItem("email");

        // Crea un objeto para asociar la afición al usuario
        var asociacion = {
            email: emailUsuario,
            idAfi: aficion.id
        };

        // Añade la afición asociada al usuario
        var añadirSolicitud = aficionUsuarioStore.add(asociacion);

        añadirSolicitud.onsuccess = function () {
            var fila = document.getElementById(aficion.id);
            if (fila) {
                fila.remove(); 
            }
            Swal.fire("Afición añadida correctamente.");
        };

        añadirSolicitud.onerror = function () {
            console.error("Error al asociar la afición:");
        };
    };

    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
    };
}
