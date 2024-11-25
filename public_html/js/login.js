document.addEventListener('DOMContentLoaded', function () {

});
    document.getElementById("iniciarSesionBtn").addEventListener("click", iniciarSesion);
    document.getElementById("volverBtn").addEventListener("click", volver);

    function iniciarSesion() {
        var email = document.getElementById("email").value;
        var password= document.getElementById("password").value;
        
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            var solicitud = indexedDB.open("vitomaite03", 1);
            
            solicitud.onsuccess = function(evento){
                var db = evento.target.result;
                var transaccion = db.transaction(["Usuario"], "readonly");
                var usuarioStore = transaccion.objectStore("Usuario");
                
                var indiceEmail= usuarioStore.index("email");
                //esto es para buscar ese exacto emaail
                var cursor = indiceEmail.openCursor(IDBKeyRange.only(email));
                
                cursor.onsuccess = function (eventoCursor) {
                 var resultado = eventoCursor.target.result;
                 //el email esta en la usuariostorage
                 if (resultado){
                     //si para el email que se a introducio coincide la contraseña se almacenan todos los datos en el session storage
                    if(resultado.value.password===password){
                         sessionStorage.setItem('email', resultado.value.email);
                         sessionStorage.setItem('nombre', resultado.value.nombre);
                         sessionStorage.setItem('ciudad', resultado.value.ciudad);
                         sessionStorage.setItem('foto', resultado.value.foto);
                         sessionStorage.setItem('lat', resultado.value.latitud);
                         sessionStorage.setItem('long', resultado.value.longitud);
                         window.location.href= 'logeadoNoPremium.html';
                    }else{
                        mostrarMensaje("La contraseña introducida es INCORRECTA. Vuelva a introducirla.");
                    }
                 }else{
                     mostrarMensaje("Error: Usuario no encontrado");
                 }
                };
            };
        }else{
             mostrarMensaje("Error: El formato del email no es correcto");
        }
    }
    function mostrarMensaje(mensaje){
        var mensajeDiv = document.getElementById("mensaje");
        mensajeDiv.innerHTML = mensaje;
    }

    function volver() {
        window.location.href = 'index.html';
    }