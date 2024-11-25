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



document.getElementById("buscarBtn").addEventListener('click', function () {
    var aficionesSeleccionadas = [];
    document.querySelectorAll('input[name="aficion"]:checked').forEach((aficion) => {
        aficionesSeleccionadas.push(aficion.value);
    });

    if (aficionesSeleccionadas.length === 0) {
        Swal.fire("Debe seleccionar al menos una afición.");
        return;
    }
    console.log(aficionesSeleccionadas);
    var contenedorUsuarios = document.getElementById("contenedorUsuarios");
    contenedorUsuarios.value = '';

    mostrarUsuarios(aficionesSeleccionadas);
});

function mostrarUsuarios(aficionesSeleccionadas) {
    var contenedorUsuarios = document.getElementById("contenedorUsuarios");
    contenedorUsuarios.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);
    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Usuario", "AficionUsuario"], "readonly"); 
        var usuarioStore = transaccion.objectStore("Usuario");
        var aficionUsuarioStore = transaccion.objectStore("AficionUsuario");

        var cursor = usuarioStore.openCursor();

        var usuarioCumpleAficiones = false;
        var hayUsuarios = false;
        
        if (!db.objectStoreNames.contains("Usuario")) {
            console.error("El objectStore 'Usuario' no existe.");
            return;
        }

        cursor.onsuccess = function (eventoCursor) {
            var resultado = eventoCursor.target.result;

            if (resultado) {
                hayUsuarios = true; 
                
                var usuario = resultado.value;console.log(usuario);
                var genero = document.getElementById('genero').value;

                var cumpleGenero = (usuario.genero === genero);

                var cumpleAficiones = false;

                var aficionesDelUsuario = [];
                var indexAficiones = aficionUsuarioStore.index("email");
                var cursorAficion = indexAficiones.openCursor(IDBKeyRange.only(usuario.email));

                cursorAficion.onsuccess = function (eventoCursorAficion) {
                    var resultadoAficion = eventoCursorAficion.target.result;
                    if (resultadoAficion) {
                        aficionesDelUsuario.push(resultadoAficion.value.idAfi);
                        console.log(aficionesDelUsuario);
                        resultadoAficion.continue();
                    } else {
                        cumpleAficiones = aficionesDelUsuario.some(afi => aficionesSeleccionadas.includes(afi.toString()));
                        if (cumpleGenero && cumpleAficiones) {
                            var emailUsuario = sessionStorage.getItem('email');
                            if (emailUsuario !== usuario.email) {
                                usuarioCumpleAficiones = true;
                                añadirUsuarioALaTabla(usuario);
                            }
                        }
                    }
                };
                cursorAficion.onerror = function () {
                    console.error("Error al obtener las aficiones del usuario.");
                };
                resultado.continue();
            } else {
                if (!hayUsuarios) {
                    Swal.fire("No hay usuarios!");
                } else if (!usuarioCumpleAficiones) {
                    Swal.fire("No hay usuarios con esos criterios.");
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

function añadirUsuarioALaTabla(usuario) {
    var contenedorUsuarios = document.getElementById("contenedorUsuarios");

    var tablaUsuarios = document.querySelector(".tabla-usuarios");

    if (!tablaUsuarios) {
        tablaUsuarios = document.createElement("table");
        tablaUsuarios.className = "tabla-usuarios";

        var filaCabecera = document.createElement("tr");

        var nombreCabecera = document.createElement("th");
        nombreCabecera.textContent = "Nombre";
        var edadCabecera = document.createElement("th");
        edadCabecera.textContent = "Edad";
        var fotoCabecera = document.createElement("th");
        fotoCabecera.textContent = "Foto";

        filaCabecera.appendChild(fotoCabecera);
        filaCabecera.appendChild(nombreCabecera);
        filaCabecera.appendChild(edadCabecera);

        tablaUsuarios.appendChild(filaCabecera);

        contenedorUsuarios.appendChild(tablaUsuarios);
    }

    var filaUsuario = document.createElement("tr");
    filaUsuario.id = usuario.id;

    var fotoCelda = document.createElement("td");
    if (usuario.foto) {
        var fotoUsuario = document.createElement("img");
        fotoUsuario.src = usuario.foto;
        fotoUsuario.alt = "Foto del usuario";
        fotoCelda.appendChild(fotoUsuario);
    } else {
        fotoCelda.textContent = "Sin foto";
    }
    
    fotoCelda.appendChild(fotoUsuario);
    var nombreCelda = document.createElement("td");
    nombreCelda.textContent = usuario.nombre;
    var edadCelda = document.createElement("td");
    edadCelda.textContent = usuario.edad;

    var botonDetalles = document.createElement("button");
    botonDetalles.textContent = "Detalles";
    botonDetalles.addEventListener("click", function () {
        mostrarDetallesUsuario(usuario); 
    });
    
    filaUsuario.appendChild(fotoCelda);
    filaUsuario.appendChild(nombreCelda);
    filaUsuario.appendChild(edadCelda);
    filaUsuario.appendChild(botonDetalles);

    tablaUsuarios.appendChild(filaUsuario);
}

function mostrarDetallesUsuario(usuario) {
    sessionStorage.setItem('emailDetalles', usuario.email);
    sessionStorage.setItem('edadDetalles', usuario.edad);
    sessionStorage.setItem('fotoDetalles', usuario.foto);
    sessionStorage.setItem('nombreDetalles', usuario.nombre);
    sessionStorage.setItem('latDetalles', usuario.latitud);
    sessionStorage.setItem('longDetalles', usuario.longitud);
    window.location.href='perfilUsuario.html';
}


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


