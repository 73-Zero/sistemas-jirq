/* ========================================================================== */
/* MÓDULO GENERAL TABLERO: SEGURIDAD MÁXIMA Y CONFIGURACIÓN FIREBASE */
/* ========================================================================== */

// Bloqueo total de menú contextual (clic derecho) para proteger el sistema
document.addEventListener('contextmenu', event => event.preventDefault());

// Blindaje anti-hackers e inspectores (Bloqueo de F12, Ctrl+Shift+I/J/C, Ctrl+U/S)
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
       (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        return false;
    }
});

// Configuración de conexión a Firebase Realtime Database
const firebaseConfig = {
    databaseURL: "https://sistemas-jirq-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Inicialización general al cargar el documento del tablero
document.addEventListener("DOMContentLoaded", () => {
    aplicarControlDeAccesoYPermisos_tablero();
});

// Control de roles (Administrador vs Invitado) y visualización del banner de bienvenida
function aplicarControlDeAccesoYPermisos_tablero() {
    const usuarioId = sessionStorage.getItem("usuario_sesion_id") || "invitado";
    const esAdmin = sessionStorage.getItem("usuario_sesion_admin") === "true";
    let permisos = {};

    try {
        permisos = JSON.parse(sessionStorage.getItem("usuario_sesion_permisos") || "{}");
    } catch (e) {
        permisos = {};
    }

    // Mostrar mensaje de bienvenida personalizado en el banner
    const bannerContainer = document.getElementById('welcomeMessageBanner_reg_usuarios');
    if (bannerContainer) {
        if (esAdmin) {
            bannerContainer.textContent = "Bienvenido mi Admin";
        } else {
            bannerContainer.textContent = `Bienvenido(a) ${usuarioId}`;
        }
    }

    // Control de visibilidad del botón de Registro de Usuarios (Exclusivo Administrador)
    const btnRegistroUsuarios = document.getElementById('btnRegistroUsuarios');
    if (btnRegistroUsuarios) {
        btnRegistroUsuarios.style.display = esAdmin ? "flex" : "none";
    }

    // Control de permisos dinámicos por módulo para usuarios invitados
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
/* FUNCIONES GLOBALES DE NAVEGACIÓN Y APERTURA DE MÓDULOS */
/* ========================================================================== */

function abrirModulo(nombreModulo) {
    alert(`Abriendo módulo: ${nombreModulo}`);
}

// Función general para abrir modales que aún no se han independizado
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función general para cerrar modales
function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}


