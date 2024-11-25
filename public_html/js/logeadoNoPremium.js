document.addEventListener('DOMContentLoaded', function () {
    var nombreUsuario = sessionStorage.getItem('nombre');
    var fotoUsuario = sessionStorage.getItem('foto');
    var mensajeBienvenida = document.getElementById("mensajeBienvenida");
    mensajeBienvenida.textContent = "Bienvenido/a, " + nombreUsuario;
    var fotoUsuarioElement = document.getElementById("fotoUsuario");
    if (fotoUsuario) {
        fotoUsuarioElement.src = fotoUsuario; 
        fotoUsuarioElement.style.display = "block"; 
    } else {
        fotoUsuarioElement.style.display = "none"; 
    }
    
});


document.getElementById("cerrarSesionBtn").addEventListener("click", cerrarSesion);
function cerrarSesion() {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('foto');
    sessionStorage.removeItem('ciudad');
    sessionStorage.removeItem('lat');
    sessionStorage.removeItem('long');
    window.location.href = 'index.html';
}

document.getElementById("modificarPerfilBtn").addEventListener('click', function () {
    window.location.href ='modificarPerfil.html';
});

document.getElementById("buscarBtn").addEventListener('click', function () {
    window.location.href ='buscarNormal.html';
});

document.getElementById("buscarMapaBtn").addEventListener('click', function () {
    window.location.href ='buscarPorUbicacion.html';
});

document.getElementById("buscarAfiBtn").addEventListener('click', function () {
    window.location.href ='buscarPorAficion.html';
});

document.getElementById("misLikesBtn").addEventListener('click', function(){
    console.log("mis likes");
    var contenedorLikes = document.getElementById("contenedorLikes");
    contenedorLikes.value = '';
    mostrarLikes();
});

function mostrarLikes(){
    var contenedorLikes = document.getElementById("contenedorLikes");
    contenedorLikes.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);
    
    solicitud.onsuccess= function(evento){
        
        var db = evento.target.result;
        var transaccion = db.transaction(["Like"], "readonly");
        var likeStore = transaccion.objectStore("Like");
        var cursor = likeStore.openCursor();
        
        var tienesLikes = false;
        var hayLikesEnTabla = false;
        var emailUsuario = sessionStorage.getItem('email');
        
        cursor.onsuccess= function(eventoCursor){
            
            var resultado = eventoCursor.target.result;
            if(resultado){
                hayLikesEnTabla=true;
                var like = resultado.value;
                if(like.email2===emailUsuario){
                    tienesLikes = true;
                    añadirLikeALaTabla(like);
                }
                resultado.continue();
            }else {

                if (!hayLikesEnTabla) {
                    Swal.fire("No hay likes!");
                } else if (!tienesLikes) {
                    Swal.fire("No tienes likes a tu perfil!");
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

function añadirLikeALaTabla(like){
    var contenedorLikes = document.getElementById("contenedorLikes");
    var tablaLikes= document.querySelector(".tabla-likes");
    
    if(!tablaLikes){
        var tablaLikes = document.createElement("table");
        tablaLikes.className = "tabla-likes";

        var filaCabecera = document.createElement("tr");

        var leGustasCabecera = document.createElement("th");
        leGustasCabecera.textContent = "Le gustas a:";

        filaCabecera.appendChild(leGustasCabecera);
        tablaLikes.appendChild(filaCabecera);
    }
    var filaLike = document.createElement("tr");

    var usuarioCelda = document.createElement("td");

    emailUsuario = like.email1;

    obtenerNombreUsuario(emailUsuario, function (usuario) {
        if (usuario) {
            leGustasA = usuario.nombre;
            usuarioCelda.textContent = leGustasA;

        } else {
            console.log("Usuario no encontrado o error al buscar.");
        }
    });

    filaLike.appendChild(usuarioCelda);
    tablaLikes.appendChild(filaLike);
    contenedorLikes.appendChild(tablaLikes);
}

function obtenerNombreUsuario(email,callback){
    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Usuario"], "readonly");
        var usuarioStore = transaccion.objectStore("Usuario");

        var indiceEmail = usuarioStore.index("email");
        var cursor = indiceEmail.openCursor(IDBKeyRange.only(email));

        cursor.onsuccess = function (eventoCursor) {
            var resultado = eventoCursor.target.result;
            if (resultado) {
                callback(resultado.value);
            } else {

                callback(null);
            }
        };
        cursor.onerror = function () {
            console.error("Error al buscar el usuario");
            callback(null);
        };
    };
    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos");
        callback(null);
    };
}

document.getElementById("misMatchBtn").addEventListener('click', function(){
    console.log("mis match");
    var contenedorMatch = document.getElementById("contenedorMatch");
    contenedorMatch.value = '';
    mostrarMatch();
});

function mostrarMatch() {
    var contenedorMatch = document.getElementById("contenedorMatch");
    contenedorMatch.innerHTML = "";

    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Like"], "readonly");
        var likeStore = transaccion.objectStore("Like");
        var cursor = likeStore.openCursor();

        var emailUsuario = sessionStorage.getItem('email'); 
        var hayMatch = false;

        var totalLikes = 0;
        var procesados = 0;

        cursor.onsuccess = function (eventoCursor) {
            var resultado = eventoCursor.target.result;

            if (resultado) {
                totalLikes++; 
                var like = resultado.value;

                if (like.email2 === emailUsuario) {
                    verificarMatchConCursor(db, like, emailUsuario, function (esMatch) {
                        if (esMatch) {
                            añadirLikeALaTablaMutuo(like);
                            hayMatch = true; 
                        }
                        procesados++;
                        if (procesados === totalLikes) {
                            if (!hayMatch) {
                                Swal.fire("No tienes Match!");
                            }
                        }
                    });
                }
                resultado.continue(); 
            } else {
                if (procesados === totalLikes && !hayMatch) {
                    Swal.fire("No tienes Match!");
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


function verificarMatchConCursor(db, like, emailUsuario, callback) {
    var transaccion = db.transaction(["Like"], "readonly");
    var likeStore = transaccion.objectStore("Like");

    var cursor = likeStore.openCursor();

    cursor.onsuccess = function (eventoCursor) {
        var resultado = eventoCursor.target.result;

        if (resultado) {
            var registro = resultado.value;
            if (registro.email1 === emailUsuario && registro.email2 === like.email1) {
                callback(true); 
                return;
            }
            resultado.continue(); 
        } else {
            callback(false);
        }
    };

    cursor.onerror = function () {
        console.error("Error al recorrer el cursor para verificar match.");
        callback(false);
    };
}

function añadirLikeALaTablaMutuo(like) {
    var contenedorMatch = document.getElementById("contenedorMatch");
    var tablaMatch = document.querySelector(".tabla-match");

    // Crear tabla si no existe
    if (!tablaMatch) {
        tablaMatch = document.createElement("table");
        tablaMatch.className = "tabla-match";

        var filaCabecera = document.createElement("tr");
        var leGustasCabecera = document.createElement("th");
        leGustasCabecera.textContent = "Le gustas a:";

        var matchCabecera = document.createElement("th");
        matchCabecera.textContent = "Match";

        filaCabecera.appendChild(leGustasCabecera);
        filaCabecera.appendChild(matchCabecera);
        tablaMatch.appendChild(filaCabecera);
    }

    var filaLike = document.createElement("tr");

    var usuarioCelda = document.createElement("td");
    var emailUsuario = like.email1;

    obtenerNombreUsuario(emailUsuario, function (usuario) {
        if (usuario) {
            usuarioCelda.textContent = usuario.nombre; 
        } else {
            usuarioCelda.textContent = emailUsuario; 
        }

        filaLike.appendChild(usuarioCelda);

        var celdaMatch = document.createElement("td");
        var iconoCorazon = document.createElement("img");
        iconoCorazon.src = "img/like.png"; 
        iconoCorazon.alt = "Like Mutuo";
        iconoCorazon.style.width = "20px";
        celdaMatch.appendChild(iconoCorazon);
        filaLike.appendChild(celdaMatch);

        tablaMatch.appendChild(filaLike);
        contenedorMatch.appendChild(tablaMatch);
    });
}

document.getElementById("aficionesBtn").addEventListener('click',function(){
    window.location.href="aficiones.html";
});

    