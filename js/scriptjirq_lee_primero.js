/* ========================================================================== */
/* MÓDULO LÉEME PRIMERO: APERTURA AISLADA E INDEPENDIENTE                     */
/* ========================================================================== */

function abrirModalLeemePrimero_lee_primero(evento) {
    if (evento && evento.stopPropagation) {
        evento.stopPropagation();
    }
    
    const modal = document.getElementById('modalLeemePrimero_lee_primero');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '0', 'important');
        modal.style.setProperty('left', '0', 'important');
        modal.style.setProperty('width', '100vw', 'important');
        modal.style.setProperty('height', '100vh', 'important');
    } else {
        console.error("No se encontró el modal modalLeemePrimero_lee_primero");
    }
}

function cerrarModalLeemePrimero_lee_primero(evento) {
    if (evento && evento.stopPropagation) {
        evento.stopPropagation();
    }
    
    const modal = document.getElementById('modalLeemePrimero_lee_primero');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
    }
}