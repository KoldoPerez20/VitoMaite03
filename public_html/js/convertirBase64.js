
//******* CONVERTIR A BASE 64 **************************
function convertirArchivoABase64(file, callback) {
    var reader = new FileReader();

    reader.onload = function (event) {
        callback(event.target.result);  // Llama al callback con el resultado base64
    };

    reader.onerror = function (error) {
        console.error("Error al leer el archivo:", error);
        callback(null);
    };

    reader.readAsDataURL(file);  // Convierte el archivo a base64
}

//******************************************************************************

document.getElementById('convertirBase64Btn').addEventListener('click', function (event) {

    //event.preventDefault(); // Evitar recargar la página

    var foto = document.getElementById('foto').files;

//************************* TEST ******************************************
    if (foto.length > 0) {
        convertirArchivoABase64(foto[0], function (base64) {
            if (base64) {
                console.log("Archivo en base64:", base64);
                // Aquí puedes hacer algo con el archivo base64
                var contenedorFoto = document.getElementById("contenedorFoto");
                contenedorFoto.textContent = base64;

            } else {
                console.log("No se pudo convertir el archivo a base64.");
            }
        });
    }

});

// Evento 'change' para actualizar la imagen inmediatamente después de seleccionarla
document.getElementById('foto').addEventListener('change', function (event) {
   
    var foto = event.target.files;

    if (foto.length > 0) {
        convertirArchivoABase64(foto[0], function (base64) {
            if (base64) {
                // Mostrar la imagen convertida en el elemento <img>
                var fotoUsuarioElement = document.getElementById("fotoUsuario");
                fotoUsuarioElement.src = base64;

                
            } else {
                console.log("No se pudo convertir el archivo a base64.");
            }
        });
    }
});