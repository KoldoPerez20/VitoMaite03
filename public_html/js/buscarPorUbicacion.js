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

    var opcionKm = document.getElementById('Km');
    for (var i = 10; i <= 200; i += 10) {
        var optionMin = document.createElement('option');
        optionMin.value = i;
        optionMin.textContent = i;
        opcionKm.appendChild(optionMin);
    }
});

document.getElementById("buscarBtn").addEventListener('click', function () {
    const radioSeleccionado = parseInt(document.getElementById('Km').value);
    
    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                    console.log(lat,long);
                // Llamar a la función con las coordenadas actuales
                añadirUsu(lat, long, radioSeleccionado);
            },
            (error) => {
                alert("Error al obtener la ubicación: " + error.message);
            }
        );
    } else {
        alert("Geolocalización no soportada por este navegador.");
    }
});

const puntos = [];

function añadirUsu(lat, long, radio) {
    var solicitud = indexedDB.open("vitomaite03", 1);

    solicitud.onsuccess = function (evento) {
        var db = evento.target.result;
        var transaccion = db.transaction(["Usuario"], "readonly");
        var usuarioStore = transaccion.objectStore("Usuario");
        var cursor = usuarioStore.openCursor();
        var puntos = [];
        cursor.onsuccess = function (eventoCursor) {
            var resultado = eventoCursor.target.result;

            if (resultado) {
                var usuario = resultado.value;

                var genero = document.getElementById('genero').value;
                if (usuario.genero === genero) {
                    var emailUsuario = sessionStorage.getItem('email');
                    if (emailUsuario !== usuario.email) {
                        puntos.push({
                            lat: usuario.latitud,
                            lon: usuario.longitud,
                            nombre: usuario.nombre,
                            edad: usuario.edad,
                            foto: usuario.foto,
                            email: usuario.email
                        });
                    }
                }
                resultado.continue();
            } else {
                const puntosDentro = puntos.filter((punto) => {
                    const distancia = calcularDistancia(
                        lat,
                        long,
                        punto.lat,
                        punto.lon
                        
                    );
                    
                    return distancia <= radio;
                    
                });
                console.log(puntosDentro);
                initMap(lat, long, puntosDentro, radio);
                console.log(lat,long);
            }
        };
        cursor.onerror = function () {
            console.error("Error al abrir el cursor.");
        };
    };
    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos.");
    };
}

// Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function initMap(lat, long, puntosDentro, radio) {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: lat, lng: long }
    });
    new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.2,
        map,
        center: { lat: lat, lng: long },
        radius: radio * 1000 // Convertir a metros
    });
    console.log(lat,long);
    puntosDentro.forEach((punto) => {
        const marker = new google.maps.Marker({
            position: { lat: punto.lat, lng: punto.lon },
            map,
            title: punto.nombre
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-size:14px;">
                        <strong>${punto.nombre}</strong><br>
                      </div>`
        });
        marker.addListener("mouseover", () => infoWindow.open(map, marker));
        marker.addListener("mouseout", () => infoWindow.close());
        marker.addListener("click", () => mostrarDetallesUsuario(punto));
    });
}

function mostrarDetallesUsuario(punto) {
    sessionStorage.setItem('emailDetalles', punto.email);
    sessionStorage.setItem('edadDetalles', punto.edad);
    sessionStorage.setItem('fotoDetalles', punto.foto);
    sessionStorage.setItem('nombreDetalles', punto.nombre);
    sessionStorage.setItem('latDetalles', punto.lat);
    sessionStorage.setItem('longDetalles', punto.lon);
    window.location.href = 'perfilUsuario.html';
}

document.getElementById("cerrarSesionBtn").addEventListener("click", cerrarSesion);
document.getElementById("volverBtn").addEventListener("click", volver);
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function volver() {
    window.location.href = 'logeadoNoPremium.html';
}