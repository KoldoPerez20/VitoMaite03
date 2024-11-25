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
    
    var fotoDetalles=sessionStorage.getItem('fotoDetalles');
    var fotoDetallesElement = document.getElementById("fotoDetalles");
        if (fotoDetalles) {
        fotoDetallesElement.src = fotoDetalles;
        fotoDetallesElement.style.display = "block";
        } else {
        fotoDetallesElement.style.display = "none";  
        }
    var nombreDetalles = sessionStorage.getItem('nombreDetalles');
    var nombreUsuDetalles = document.getElementById("nombreDetalles");
    nombreUsuDetalles.textContent = nombreDetalles;
    var edadDetalles = sessionStorage.getItem('edadDetalles');
    var edadUsuDetalles = document.getElementById("edadDetalles");
    edadUsuDetalles.textContent = "Edad: " + edadDetalles;

});

function initMap() {
    const lat = parseFloat(sessionStorage.getItem('latDetalles'));
    const long = parseFloat(sessionStorage.getItem('longDetalles'));
    console.log(lat, long);
        if (isNaN(lat) || isNaN(long)) {
        console.error("Latitud o longitud inválidas en el sessionStorage.");
        return;
    }
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12, 
        center: { lat: lat, lng: long }
    });

    const marker = new google.maps.Marker({
        position: {lat: lat, lng: long},
        map
    });

}

window.onload = initMap;


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
    sessionStorage.removeItem('emailDetalles');
    sessionStorage.removeItem('edadDetalles');
    sessionStorage.removeItem('fotoDetalles');
    sessionStorage.removeItem('nombreDetalles');
    window.location.href = 'logeadoNoPremium.html';
}

