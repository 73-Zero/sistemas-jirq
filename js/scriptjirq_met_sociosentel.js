/* ========================================================================== */
/* MÓDULO 7: METAS ENTEL Y SOCIOS - LÓGICA CON FIREBASE REALTIME DATABASE     */
/* ========================================================================== */

const queriesDefault_met_sociosentel = {
    general_mensual: `--- METAS CAPTURA Y RENO PARA ENTEL Y SOCIOS GENERAL ---
--- DECLARAMOS LAS VARIABLES COMO STRING PARA COMPARAR CON LA COLUMNA Fecha
DECLARE MES_INICIO STRING DEFAULT '2026-11-01';
DECLARE MES_FIN STRING DEFAULT '2026-11-30';
DECLARE GRUPO_CANAL_SELECCIONADO STRING DEFAULT 'Online Público - Socios';
-- DECLARE GRUPO_CANAL_SELECCIONADO STRING DEFAULT 'Online Privado - Socios'; -- Descomentar para usar

--- INICIO DE LA CONSULTA UNIFICADA ---

WITH
-- 1. BASE DE DATOS COMPLETA CON FILTROS COMUNES (PARA CAPTURA Y RENO)
datos_base_publico_privado AS (
  SELECT
    Tipo_Meta,
    Grupo_Can`,
    por_dias: `SELECT 
  DATE(fecha) AS dia,
  COUNT(1) AS cantidad
FROM \`your_project.your_dataset.tabla_diaria\`
WHERE fecha >= CURRENT_DATE('America/Lima') - 30
GROUP BY dia
ORDER BY dia DESC;`,
    por_fuente: `SELECT 
  fuente,
  COUNT(*) AS total_registros
FROM \`your_project.your_dataset.tabla_fuentes\`
GROUP BY fuente
ORDER BY total_registros DESC;`
};

let pestanaActiva_met_sociosentel = 'general_mensual';
let queriesCargadas_met_sociosentel = { ...queriesDefault_met_sociosentel };
let listenerRef_met_sociosentel = null;

function abrirModalMetas_met_sociosentel() {
    const modal = document.getElementById('modalMetasEntel_met_sociosentel');
    if (modal) {
        modal.style.display = 'flex';
        cargarQueryActual_met_sociosentel();
    }
}

function cerrarModal_met_sociosentel(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
    if (listenerRef_met_sociosentel) {
        listenerRef_met_sociosentel.off();
        listenerRef_met_sociosentel = null;
    }
}

function cargarQueryActual_met_sociosentel() {
    const textarea = document.getElementById('textareaQuery_met_sociosentel');
    if (textarea) textarea.value = "Cargando consulta...";

    const dbRef = firebase.database().ref('metas_entel_socios/' + pestanaActiva_met_sociosentel);

    if (listenerRef_met_sociosentel) {
        listenerRef_met_sociosentel.off();
    }

    dbRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        
        let codigoFinal = "";
        if (data && data.codigo !== undefined) {
            codigoFinal = data.codigo;
        } else {
            codigoFinal = queriesDefault_met_sociosentel[pestanaActiva_met_sociosentel];
        }
        
        queriesCargadas_met_sociosentel[pestanaActiva_met_sociosentel] = codigoFinal;
        
        if (textarea) {
            textarea.value = codigoFinal;
            textarea.setSelectionRange(0, 0);
            textarea.scrollTop = 0;
        }
    }).catch((error) => {
        console.error("Error al cargar:", error);
        if (textarea) textarea.value = "Error al cargar. Revisa tu conexión.";
    });
}

function cambiarPestana_met_sociosentel(pestanaKey) {
    pestanaActiva_met_sociosentel = pestanaKey;

    const botones = document.querySelectorAll('.tab-btn_met_sociosentel');
    botones.forEach(btn => {
        btn.classList.remove('active_met_sociosentel');
        if (btn.getAttribute('onclick').includes(pestanaKey)) {
            btn.classList.add('active_met_sociosentel');
        }
    });

    cargarQueryActual_met_sociosentel();
}

function copiarQuery_met_sociosentel() {
    const textarea = document.getElementById('textareaQuery_met_sociosentel');
    if (!textarea) return;

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textarea.value).then(() => {
        mostrarAvisoActualizado_met_sociosentel("¡Código copiado!");
    }).catch(() => {
        document.execCommand('copy');
        mostrarAvisoActualizado_met_sociosentel("¡Código copiado!");
    });
}

function guardarQuery_met_sociosentel() {
    const textarea = document.getElementById('textareaQuery_met_sociosentel');
    if (!textarea) return;

    const nuevoCodigo = textarea.value;

    if (nuevoCodigo.trim() === "") {
        mostrarAvisoActualizado_met_sociosentel("El código no puede estar vacío", true);
        return;
    }

    mostrarAvisoActualizado_met_sociosentel("Guardando en Firebase...");

    const dbRef = firebase.database().ref('metas_entel_socios/' + pestanaActiva_met_sociosentel);
    
    dbRef.update({
        codigo: nuevoCodigo,
        ultima_actualizacion: new Date().toISOString()
    }).then(() => {
        queriesCargadas_met_sociosentel[pestanaActiva_met_sociosentel] = nuevoCodigo;
        mostrarAvisoActualizado_met_sociosentel("Script guardado correctamente");
    }).catch((error) => {
        console.error("Error al guardar:", error);
        mostrarAvisoActualizado_met_sociosentel("Error al guardar. Intenta de nuevo.", true);
    });
}

function mostrarAvisoActualizado_met_sociosentel(mensaje = "Script actualizado", esError = false) {
    // Buscamos el div que ya estará creado en el HTML
    let aviso = document.getElementById("notif-script-actualizado-met-sociosentel");
    let textoAviso = document.getElementById("texto-notif-met-sociosentel");
    
    if (aviso && textoAviso) {
        textoAviso.innerText = mensaje;
        
        // Color verde o rojo según el caso
        if (esError) {
            aviso.style.backgroundColor = "#ef4444";
        } else {
            aviso.style.backgroundColor = "#22c55e";
        }

        aviso.classList.add("visible");

        clearTimeout(aviso.timeoutId);
        aviso.timeoutId = setTimeout(() => {
            aviso.classList.remove("visible");
        }, 3000);
    }
}