/* ========================================================================== */
/* MÓDULO 6: BIGQUERY CONTEO - LÓGICA SEGURA CON FIREBASE REALTIME DATABASE   */
/* ========================================================================== */

// Textos por defecto (solo se usarán si la base de datos está vacía la primera vez)
const queriesDefault_big_conteo = {
    conteo_diario: `DECLARE anio INT64 DEFAULT 2026;
DECLARE d1 STRING DEFAULT '10Sab_31';
DECLARE d2 STRING DEFAULT '11Dom_01';
DECLARE d3 STRING DEFAULT '11Lun_02';

-- Rango de fechas para pruning de particiones
DECLARE fecha_inicio DATE;
DECLARE fecha_fin DATE;

SET fecha_inicio = PARSE_DATE('%m%d', CONCAT(SUBSTR(d1, 1, 2), RIGHT(d1, 2)));
SET fecha_fin = PARSE_DATE('%m%d', CONCAT(SUBSTR(d3, 1, 2), RIGHT(d3, 2)));

SELECT 
  table_name,
  TIMESTAMP_MILLIS(last_modified_time) AS ultima_modificacion
FROM \`your_project.your_dataset.__TABLES__\`;`,

    conteo_mensual: `SELECT 
  EXTRACT(MONTH FROM fecha) AS mes,
  COUNT(*) AS total_registros
FROM \`your_project.your_dataset.tabla_mensual\`
GROUP BY mes
ORDER BY mes ASC;`,

    dias_reg: `SELECT 
  DATE(fecha) AS dia,
  COUNT(1) AS cantidad
FROM \`your_project.your_dataset.tabla_diaria\`
WHERE fecha >= CURRENT_DATE('America/Lima') - 30
GROUP BY dia
ORDER BY dia DESC;`
};

let pestanaActiva_big_conteo = 'conteo_diario';
let queriesCargadas_big_conteo = { ...queriesDefault_big_conteo };
let listenerRef_big_conteo = null; // Referencia al listener actual

document.addEventListener("DOMContentLoaded", () => {
    crearContenedorNotificacion_big_conteo();
});

function abrirModalBigquery_big_conteo() {
    const modal = document.getElementById('modalBigqueryConteo_big_conteo');
    if (modal) {
        modal.style.display = 'flex';
        // Cargamos los datos al abrir
        cargarQueryActual_big_conteo();
    }
}

function cerrarModal_big_conteo(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
    // Desconectar el listener al cerrar para no consumir recursos
    if (listenerRef_big_conteo) {
        listenerRef_big_conteo.off();
        listenerRef_big_conteo = null;
    }
}

// ==========================================================================
// LÓGICA DE LECTURA Y ESCRITURA (FIREBASE REALTIME DATABASE)
// ==========================================================================

function cargarQueryActual_big_conteo() {
    const textarea = document.getElementById('textareaQuery_big_conteo');
    if (textarea) textarea.value = "Cargando consulta...";

    const dbRef = firebase.database().ref('bigquery_conteo/' + pestanaActiva_big_conteo);

    // Desconectamos el listener anterior si existe
    if (listenerRef_big_conteo) {
        listenerRef_big_conteo.off();
    }

    // Usamos .once() para leer solo una vez y evitar conflictos al escribir
    dbRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        
        let codigoFinal = "";
        if (data && data.codigo !== undefined) {
            codigoFinal = data.codigo;
        } else {
            codigoFinal = queriesDefault_big_conteo[pestanaActiva_big_conteo];
        }
        
        queriesCargadas_big_conteo[pestanaActiva_big_conteo] = codigoFinal;
        
        if (textarea) {
            textarea.value = codigoFinal;
            
            // --- CORRECCIÓN AQUÍ ---
            // Colocar el cursor y el scroll al principio del texto
            textarea.setSelectionRange(0, 0);
            textarea.scrollTop = 0;
        }
    }).catch((error) => {
        console.error("Error al cargar:", error);
        if (textarea) textarea.value = "Error al cargar. Revisa tu conexión.";
    });
}

function cambiarPestana_big_conteo(pestanaKey) {
    pestanaActiva_big_conteo = pestanaKey;

    // Actualizar clases visuales de los botones
    const botones = document.querySelectorAll('.tab-btn_big_conteo');
    botones.forEach(btn => {
        btn.classList.remove('active_big_conteo');
        if (btn.getAttribute('onclick').includes(pestanaKey)) {
            btn.classList.add('active_big_conteo');
        }
    });

    // Cargar el código de la nueva pestaña
    cargarQueryActual_big_conteo();
}

function copiarQuery_big_conteo() {
    const textarea = document.getElementById('textareaQuery_big_conteo');
    if (!textarea) return;

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textarea.value).then(() => {
        mostrarAvisoActualizado_big_conteo("¡Código copiado!");
    }).catch(() => {
        document.execCommand('copy');
        mostrarAvisoActualizado_big_conteo("¡Código copiado!");
    });
}

function guardarQuery_big_conteo() {
    const textarea = document.getElementById('textareaQuery_big_conteo');
    if (!textarea) return;

    const nuevoCodigo = textarea.value;

    if (nuevoCodigo.trim() === "") {
        mostrarAvisoActualizado_big_conteo("El código no puede estar vacío", true);
        return;
    }

    mostrarAvisoActualizado_big_conteo("Guardando en Firebase...");

    const dbRef = firebase.database().ref('bigquery_conteo/' + pestanaActiva_big_conteo);
    
    // Guardamos los datos
    dbRef.update({
        codigo: nuevoCodigo,
        ultima_actualizacion: new Date().toISOString()
    }).then(() => {
        queriesCargadas_big_conteo[pestanaActiva_big_conteo] = nuevoCodigo;
        mostrarAvisoActualizado_big_conteo("Script guardado correctamente");
    }).catch((error) => {
        console.error("Error al guardar:", error);
        mostrarAvisoActualizado_big_conteo("Error al guardar. Intenta de nuevo.", true);
    });
}

// ==========================================================================
// NOTIFICACIONES FLOTANTES (TOAST)
// ==========================================================================
function mostrarAvisoActualizado_big_conteo(mensaje = "Script actualizado", esError = false) {
    let aviso = document.getElementById("notif-script-actualizado");
    if (!aviso) {
        aviso = crearContenedorNotificacion_big_conteo();
    }

    aviso.innerText = mensaje;
    
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

function crearContenedorNotificacion_big_conteo() {
    let aviso = document.getElementById("notif-script-actualizado");
    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "notif-script-actualizado";
        document.body.appendChild(aviso);
    }
    return aviso;
}