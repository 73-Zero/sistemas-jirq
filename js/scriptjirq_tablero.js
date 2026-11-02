/* ========================================================================== */
/* MÓDULO GENERAL TABLERO: CONFIGURACIÓN FIREBASE (SIN BLOQUEO DE F12)        */
/* ========================================================================== */

// Configuración de conexión a Firebase Realtime Database[cite: 8]
const firebaseConfig = {
    databaseURL: "https://sistemas-jirq-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Inicialización general al cargar el documento del tablero[cite: 8]
document.addEventListener("DOMContentLoaded", () => {
    aplicarControlDeAccesoYPermisos_tablero();
});

// Control de roles (Administrador vs Invitado) y visualización del banner de bienvenida[cite: 8]
function aplicarControlDeAccesoYPermisos_tablero() {
    const usuarioId = sessionStorage.getItem("usuario_sesion_id") || "invitado";
    const esAdmin = sessionStorage.getItem("usuario_sesion_admin") === "true";
    let permisos = {};

    try {
        permisos = JSON.parse(sessionStorage.getItem("usuario_sesion_permisos") || "{}");
    } catch (e) {
        permisos = {};
    }

    // Mostrar mensaje de bienvenida personalizado en el banner[cite: 8]
    const bannerContainer = document.getElementById('welcomeMessageBanner_reg_usuarios');
    if (bannerContainer) {
        if (esAdmin) {
            bannerContainer.textContent = "Bienvenido mi Admin";
        } else {
            bannerContainer.textContent = `Bienvenido(a) ${usuarioId}`;
        }
    }

    // Control de visibilidad del botón de Registro de Usuarios (Exclusivo Administrador)[cite: 8]
    const btnRegistroUsuarios = document.getElementById('btnRegistroUsuarios');
    if (btnRegistroUsuarios) {
        btnRegistroUsuarios.style.display = esAdmin ? "flex" : "none";
    }

    // Control de permisos dinámicos por módulo para usuarios invitados[cite: 8]
    const botonesModulos = document.querySelectorAll('.modules-grid_tablero .module-btn_tablero[data-permiso]');
    botonesModulos.forEach(boton => {
        const nombrePermiso = boton.getAttribute('data-permiso');
        if (!esAdmin && permisos[nombrePermiso] === false) {
            boton.style.display = "none";
        } else {
            boton.style.display = "flex";
        }
    });
}

/* ========================================================================== */
/* FUNCIONES GLOBALES DE NAVEGACIÓN Y APERTURA DE MÓDULOS                    */
/* ========================================================================== */

function abrirModulo(nombreModulo) {
    if (nombreModulo === 'leeme_primero') {
        abrirModalLeemePrimero_lee_primero('modalLeemePrimero_lee_primero');
        return;
    }
    // ... tus otros modulos
}

// Función general para abrir modales que aún no se han independizado[cite: 8]
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función general para cerrar modales[cite: 8]
function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}


/* ========================================================================== */
/* APERTURA ESPECÍFICA PARA EL MÓDULO LÉEME PRIMERO                           */
/* ========================================================================== */

function abrirModalLeemePrimero_lee_primero(idModal, evento) {
    if (evento && evento.stopPropagation) {
        evento.stopPropagation();
    }
    const modal = document.getElementById(idModal || 'modalLeemePrimero_lee_primero');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '0', 'important');
        modal.style.setProperty('left', '0', 'important');
        modal.style.setProperty('width', '100vw', 'important');
        modal.style.setProperty('height', '100vh', 'important');
    } else {
        console.warn("No se encontró el modal de Léeme Primero.");
    }
}

function cerrarModalLeemePrimero_lee_primero(idModal, evento) {
    if (evento && evento.stopPropagation) {
        evento.stopPropagation();
    }
    const modal = document.getElementById(idModal || 'modalLeemePrimero_lee_primero');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
    }
}