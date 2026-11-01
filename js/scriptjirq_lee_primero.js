/* ========================================================================== */
/* MÓDULO LÉEME PRIMERO: LÓGICA DE APERTURA Y CIERRE */
/* ========================================================================== */

// Función para abrir de forma exclusiva el modal de Léeme Primero
function abrirModalLeemePrimero_lee_primero(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función para cerrar de forma exclusiva el modal de Léeme Primero
function cerrarModalLeemePrimero_lee_primero(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}