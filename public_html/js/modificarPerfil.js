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

document.getElementById('modificarUsuarioBtn').addEventListener('click', function (event) {
    event.preventDefault(); // Evitar recargar la página

    // Recopilar los campos del formulario
    var email = sessionStorage.getItem('email');
    var ciudad = document.getElementById('ciudad').value;
    var foto = document.getElementById('foto').files;

    // Si se ha seleccionado una foto, la convertimos a base64
    if (foto.length > 0) {
        convertirArchivoABase64(foto[0], function(base64) {
            if (base64) {
                // Aquí puedes usar el base64 para actualizar la foto
                actualizarUsuario(email, base64, ciudad);  // Llamada a la función de actualización
            } else {
                console.log("No se pudo convertir el archivo a base64.");
            }
        });
    } else {
        // Si no se selecciona una foto, solo actualizamos la ciudad
        actualizarUsuario(email, null, ciudad);
    }
});

// Función para actualizar un usuario
function actualizarUsuario(email, fotoBase64, ciudad) {
    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;

        var transaction = db.transaction(['Usuario'], 'readwrite');
        var usuarioStore = transaction.objectStore('Usuario');

        // Buscar al usuario por su email
        var emailIndex = usuarioStore.index("email");  // Utiliza el índice de 'email'
        var cursor = emailIndex.get(email);
        console.log(email);
        cursor.onsuccess = function () {
            var usuario = cursor.result;
            console.log(usuario);
            if (usuario) {
                // Actualizar solo los campos que cambiaron
                if (fotoBase64) {
                    usuario.foto = fotoBase64;// Actualizar la foto
                    sessionStorage.setItem('foto', usuario.foto);
                }
                if (ciudad) {
                    usuario.ciudad = ciudad;  // Actualizar la ciudad
                }

                // Usamos `put()` para actualizar el usuario en lugar de `add()`
                var modificarRequest = usuarioStore.put(usuario);

                modificarRequest.onsuccess = function () {
                    Swal.fire({
                        text: 'El usuario ha sido modificado correctamente.',
                        confirmButtonText: 'Aceptar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Redirigir a una URL específica después de modificar
                            window.location.href = 'logeadoNoPremium.html';
                        }
                    });
                };

                modificarRequest.onerror = function () {
                    console.error('Error al actualizar el usuario');
                };
            } else {
                Swal.fire("No se encontró un usuario con ese correo electrónico.");
            }
        };

        cursor.onerror = function () {
            console.error('Error al buscar el usuario');
        };
    };

    solicitud.onerror = function () {
        console.error('Error al abrir la base de datos');
    };
}
   

function convertirArchivoABase64(file, callback) {
    var reader = new FileReader();
    
    reader.onload = function(event) {
        callback(event.target.result);  // Llama al callback con el resultado base64
    };

    reader.onerror = function(error) {
        console.error("Error al leer el archivo:", error);
        callback(null);
    };

    reader.readAsDataURL(file);  // Convierte el archivo a base64
}

document.getElementById('foto').addEventListener('change', function (event) {
   
    var foto = event.target.files;
    console.log(foto);
    if (foto.length > 0) {
        convertirArchivoABase64(foto[0], function (base64) {
            if (base64) {
                // Mostrar la imagen convertida en el elemento <img>
                var fotoUsuarioElement = document.getElementById("fotoNueva");                
                fotoUsuarioElement.src = base64;                
            } else {
                console.log("No se pudo convertir el archivo a base64.");
            }
        });
    }
});