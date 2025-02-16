const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

class Imagen {
    constructor(url, descripcion) {
        // generar numero random de 3 digitos
        this.id = Math.floor(100 + Math.random() * 900);
        this.url = url;
        this.descripcion = descripcion;
        this.fechaSubida = new Date().toLocaleString();
    }
}

// metodo que recibe los datos del formulario al presionar el evento submit
document
    .getElementById("imageForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        let imagen = getFormData();
        //si no es null o undefine
        if (imagen) {
            GuardarImagen(imagen);
            CargarImagenes();
            resetModal("imageModal");
        }
    });
function resetModal(idModal) {
    let modalElement = document.getElementById(idModal);
    let modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    modalElement
        .querySelectorAll("input")
        .forEach((input) => (input.value = ""));
}

// DEBERIA LLAMARSE CREAR IMAGEN O ALGO ASI
function getFormData() {
    let urlImagen = document.getElementById("imageUrl").value;
    if (!validarInputUrl(urlImagen, urlPattern)) {
        alert("La url no es valida");
        return;
    }
    let descripcionImagen =
        document.getElementById("imageDescription").value;
    let imagen = new Imagen(urlImagen, descripcionImagen);
    console.log(imagen);
    return imagen;
}

function GuardarImagen(imagen) {
    fetch("/imagen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(imagen),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            CargarImagenes();
            resetModal();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function ObtenerImagenes() {
    return fetch("/imagenes")
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error("Error:", error);
            return [];
        });
}
function CargarImagenes() {
    ObtenerImagenes().then((imagenes) => {
        crearElementoImagenHtml(imagenes);
    });
}

function crearElementoImagenHtml(imagenes) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    imagenes.forEach((imagen) => {
        const colDiv = document.createElement("div");
        colDiv.className = "col-md-4";

        colDiv.innerHTML = `
     <div class="card mb-4 shadow-sm">
     <div class="card-img-top position-relative  hover-container" style="width: 100%; height: 200px; overflow: hidden;">
    <img src="${imagen.url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${imagen.descripcion}" onclick="mostrarModalDescripcion(${imagen.id}, '${imagen.descripcion}')">
    <div class="hover-overlay">
      <p class="hover-text">Presione para cambiar la descripcion</p>
     </div>
      </div>
     <div class="card-body">
    <strong>Descripción</strong>
    <p class="card-text"> ${imagen.descripcion}</p>
    <small class="text-muted">Subida el: ${imagen.fechaSubida}</small>
    </div>

   <div class="btn-group p-3">
    <button class="btn btn-sm btn-outline-danger" onclick="EliminarImagen(${imagen.id})">Eliminar</button>
    </div>
  </div>
`;
        gallery.appendChild(colDiv);
    });
}

function mostrarModalDescripcion(id, descripcionActual) {
    const modal = new bootstrap.Modal(
        document.getElementById("descripcionModal")
    );
    document.getElementById("descripcionInput").value = descripcionActual;
    document.getElementById("guardarDescripcionBtn").onclick = function () {
        const nuevaDescripcion =
            document.getElementById("descripcionInput").value;
        actualizarDescripcion(id, nuevaDescripcion);
    };
    modal.show();
}

function actualizarDescripcion(id, nuevaDescripcion) {
    fetch(`/imagen/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ descripcion: nuevaDescripcion }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            CargarImagenes(); 
            resetModal("descripcionModal");
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function EliminarImagen(id) {
    fetch(`/imagen/${id}`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Success:", data);
            CargarImagenes();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function validarInputUrl(inputValue) {
    if (!urlPattern.test(inputValue)) {
        return false;
    }
    return true;
}

// CARGAR IMAGENES
document.addEventListener("DOMContentLoaded", CargarImagenes);
