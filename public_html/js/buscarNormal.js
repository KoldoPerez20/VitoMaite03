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
    
    var opcionEdadMin = document.getElementById('edadMin');
    for (var i = 18; i <= 75; i++) {
        var optionMin = document.createElement('option');
        optionMin.value = i;
        optionMin.textContent = i;
        opcionEdadMin.appendChild(optionMin);
    }
    var opcionEdadMax = document.getElementById('edadMax');
    for (var i = 18; i <= 75; i++) {
        var optionMax = document.createElement('option');
        optionMax.value = i;
        optionMax.textContent = i;
        opcionEdadMax.appendChild(optionMax);
    }
});

document.getElementById("buscarBtn").addEventListener('click', function () {

    var contenedorUsuarios = document.getElementById("contenedorUsuarios");
    //borrar la tabla
    contenedorUsuarios.value = '';
    mostrarUsuarios();
}
);

function mostrarUsuarios() {
    var contenedorUsuarios = document.getElementById("contenedorUsuarios");
    contenedorUsuarios.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);
    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Usuario"], "readonly");
        var usuarioStore = transaccion.objectStore("Usuario");

        var cursor = usuarioStore.openCursor();

        var usuarioCumpleCriterios = false;
        var hayUsuarios = false;

        if (!db.objectStoreNames.contains("Usuario")) {
            console.error("El objectStore 'Usuario' no existe.");
            return;
        }

        cursor.onsuccess = function (eventoCursor) {

            var resultado = eventoCursor.target.result;

            if (resultado) {
                hayUsuarios = true;
                var usuario = resultado.value;

                var genero = document.getElementById('genero').value;
                var edadMinima = document.getElementById('edadMin').value;
                var edadMaxima = document.getElementById('edadMax').value;
                var ciudad = document.getElementById('ciudad').value;
                
                var cumpleCriterios =
                        (usuario.genero === genero &&
                                usuario.edad >= edadMinima &&
                                usuario.edad <= edadMaxima &&
                                usuario.ciudad === ciudad);

                if (cumpleCriterios) {
                    var emailUsuario = sessionStorage.getItem('email');
                    if(emailUsuario!==usuario.email){
                    usuarioCumpleCriterios = true;
                    añadirUsuarioALaTabla(usuario);
                    }

                }

                resultado.continue();

            } else {
                if (!hayUsuarios) {
                    Swal.fire("No hay usuarios!");
                } else if (!usuarioCumpleCriterios) {
                    Swal.fire("No hay usuarios con esos criterios\n ");
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
    console.log(filaUsuario.id);

    var fotoCelda = document.createElement("td");
    if (usuario.foto) {
        var fotoUsuario = document.createElement("img");
        fotoUsuario.src = usuario.foto;
        fotoUsuario.alt = "Foto del usuario";
        fotoCelda.appendChild(fotoUsuario);
    } else {
        fotoCelda.textContent = "Sin foto";
    }
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
    