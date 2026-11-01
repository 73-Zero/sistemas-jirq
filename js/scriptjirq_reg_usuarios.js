/* ========================================================================== */
/* MÓDULO GESTIÓN Y REGISTRO DE USUARIOS: LÓGICA Y FIREBASE */
/* ========================================================================== */

// Función para abrir de forma exclusiva el modal de usuarios
function abrirModal_reg_usuarios(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
        if (idModal === 'modalRegistroUsuarios_reg_usuarios') {
            cargarUsuariosFirebase_reg_usuarios();
        }
    }
}

// Función para cerrar de forma exclusiva el modal de usuarios
function cerrarModal_reg_usuarios(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cargar y renderizar usuarios desde Firebase Realtime Database
function cargarUsuariosFirebase_reg_usuarios() {
    const dbRef = firebase.database().ref('usuarios');
    const tbody = document.getElementById('cuerpoTablaUsuarios_reg_usuarios');
    if (!tbody) return;

    dbRef.on('value', (snapshot) => {
        tbody.innerHTML = '';
        const data = snapshot.val();
        if (!data) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#64748b;">No hay usuarios registrados en la base de datos.</td></tr>`;
            return;
        }

        let contador = 1;
        Object.keys(data).forEach(firebaseKey => {
            const user = data[firebaseKey];
            
            const idValor = user.id || user.usuario || '';
            const correoValor = user.correo || user.email || user.usuario || '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${contador++}</td>
                <td><input type="text" value="${idValor}" onchange="actualizarDatoUsuario_reg_usuarios('${firebaseKey}', 'id', this.value)"></td>
                <td><input type="text" value="${correoValor}" onchange="actualizarDatoUsuario_reg_usuarios('${firebaseKey}', 'correo', this.value)"></td>
                <td><a href="#" onclick="navigator.clipboard.writeText('${user.clave || ''}'); return false;" style="color:#7c3aed; text-decoration:none; font-weight:600;" title="Copiar Clave">${user.clave || ''}</a></td>
                <td>
                    <select class="usuarios-select-estado_reg_usuarios" onchange="actualizarDatoUsuario_reg_usuarios('${firebaseKey}', 'estado', parseInt(this.value))">
                        <option value="1" ${user.estado == 1 ? 'selected' : ''}>Activo</option>
                        <option value="0" ${user.estado == 0 ? 'selected' : ''}>Inactivo</option>
                    </select>
                </td>
                <td>${user.pais || ''}</td>
                <td>${user.fecha_hora || ''}</td>
                <td style="text-align: left; font-size: 11px; line-height: 1.5;">
                    <label style="display:inline-block; margin-right:8px;"><input type="checkbox" ${user.permisos?.listado_funciones ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'listado_funciones', this.checked)"> Func.</label>
                    <label style="display:inline-block; margin-right:8px;"><input type="checkbox" ${user.permisos?.calcular_datos ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'calcular_datos', this.checked)"> Calc.</label>
                    <label style="display:inline-block;"><input type="checkbox" ${user.permisos?.ayuda_rapida ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'ayuda_rapida', this.checked)"> Ayu.</label><br>
                    <label style="display:inline-block; margin-right:8px;"><input type="checkbox" ${user.permisos?.conteo_tablas ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'conteo_tablas', this.checked)"> Cont.</label>
                    <label style="display:inline-block; margin-right:8px;"><input type="checkbox" ${user.permisos?.metas_entel ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'metas_entel', this.checked)"> Met.</label>
                    <label style="display:inline-block;"><input type="checkbox" ${user.permisos?.querys_variadas ? 'checked' : ''} onchange="actualizarPermisoUsuario_reg_usuarios('${firebaseKey}', 'querys_variadas', this.checked)"> Var.</label>
                </td>
                <td>
                    <button type="button" onclick="solicitarEliminarUsuario_reg_usuarios('${firebaseKey}')" style="background:#fee2e2; border:none; border-radius:6px; width:28px; height:28px; cursor:pointer; color:#ef4444; font-weight:bold;" title="Eliminar Usuario">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// Mantener compatibilidad con la otra variante por si se llama desde el HTML
function cargarUsuariosDesdeFirebase_reg_usuarios() {
    cargarUsuariosFirebase_reg_usuarios();
}

// Actualizar un campo específico del usuario en Firebase
function actualizarDatoUsuario_reg_usuarios(firebaseKey, campo, valor) {
    firebase.database().ref('usuarios/' + firebaseKey).update({
        [campo]: valor
    }).catch(error => {
        alert("Error al actualizar: " + error.message);
    });
}

// Actualizar permisos modulares en Firebase
function actualizarPermisoUsuario_reg_usuarios(firebaseKey, modulo, estado) {
    firebase.database().ref(`usuarios/${firebaseKey}/permisos/${modulo}`).set(estado).catch(error => {
        alert("Error al actualizar permiso: " + error.message);
    });
}

// Función para guardar un nuevo usuario sin alertas molestas (el botón no hace nada si falta algún campo)
function guardarNuevoUsuario_reg_usuarios() {
    const inputCorreo = document.getElementById('nuevoCorreo_reg_usuarios');
    const inputId = document.getElementById('nuevoId_reg_usuarios');

    if (!inputCorreo || !inputId) return;

    const correo = inputCorreo.value.trim();
    const id = inputId.value.trim();

    // Si falta alguno de los dos campos, el botón no hace nada de forma silenciosa
    if (!correo || !id) {
        return;
    }

    const nuevoUsuarioData = {
        correo: correo,
        email: correo,
        usuario: id,
        id: id,
        estado: "1",
        clave: "",
        pais: "",
        fecha_hora: "",
        permisos: {
            listado_funciones: true,
            calcular_datos: true,
            ayuda_rapida: true,
            conteo_tablas: true,
            metas_entel: true,
            querys_variadas: true
        }
    };

    firebase.database().ref('usuarios').push(nuevoUsuarioData)
        .then(() => {
            inputCorreo.value = '';
            inputId.value = '';
            cerrarModal_reg_usuarios('modalNuevoUsuarioForm_reg_usuarios');
            cargarUsuariosFirebase_reg_usuarios();
        })
        .catch((error) => {
            console.error("Error al guardar el usuario: ", error);
        });
}

// Control del Modal Personalizado de Eliminación
let usuarioKeyPendienteEliminar = null;

function solicitarEliminarUsuario_reg_usuarios(userKey) {
    usuarioKeyPendienteEliminar = userKey;
    const modal = document.getElementById('modalAlertaEliminarUsuario_reg_usuarios');
    if (modal) modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmar = document.getElementById('btnConfirmarEliminacionUsuario_reg_usuarios');
    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            if (usuarioKeyPendienteEliminar) {
                firebase.database().ref('usuarios/' + usuarioKeyPendienteEliminar).remove()
                    .then(() => {
                        cerrarModal_reg_usuarios('modalAlertaEliminarUsuario_reg_usuarios');
                        usuarioKeyPendienteEliminar = null;
                        cargarUsuariosFirebase_reg_usuarios();
                    })
                    .catch((error) => {
                        console.error("Error al eliminar usuario:", error);
                    });
            }
        };
    }
});

// Exportar usuarios a formato CSV usando Blob (Soluciona el problema de la barra de descarga colgada)
function exportarUsuariosCSV_reg_usuarios() {
    const dbRef = firebase.database().ref('usuarios');
    dbRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            alert("No hay datos para exportar.");
            return;
        }

        // Cabeceras del CSV incluyendo los permisos modulares
        let csvContent = "ID/Nombre,Correo,Estado,Pais,FechaHora,ListadoFunciones,CalcularDatos,AyudaRapida,ConteoTablas,MetasEntel,QuerysVariadas\n";
        
        Object.values(data).forEach(user => {
            const cVal = user.usuario || user.correo || user.email || "";
            const p = user.permisos || {};
            
            const listadoFunciones = p.listado_funciones !== undefined ? p.listado_funciones : true;
            const calcularDatos = p.calcular_datos !== undefined ? p.calcular_datos : true;
            const ayudaRapida = p.ayuda_rapida !== undefined ? p.ayuda_rapida : true;
            const conteoTablas = p.conteo_tablas !== undefined ? p.conteo_tablas : true;
            const metasEntel = p.metas_entel !== undefined ? p.metas_entel : true;
            const querysVariadas = p.querys_variadas !== undefined ? p.querys_variadas : true;

            csvContent += `"${user.id || ''}","${cVal}",${user.estado !== undefined ? user.estado : 1},"${user.pais || ''}","${user.fecha_hora || ''}",${listadoFunciones},${calcularDatos},${ayudaRapida},${conteoTablas},${metasEntel},${querysVariadas}\n`;
        });

        // Crear un Blob con codificación UTF-8 para evitar problemas con tildes o eñes
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "usuarios_sistema_jirq.csv");
        document.body.appendChild(link);
        link.click();
        
        // Limpiar el objeto URL en memoria al terminar
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    });
}

// Funciones de cierre de sesión seguro
function cerrarSesionSistema_reg_usuarios() {
    abrirModal_reg_usuarios('modalAlertaCerrarSesion_reg_usuarios');
}

function ejecutarCerrarSesion_reg_usuarios() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

// Función para filtrar usuarios en tiempo real por ID o Correo
function filtrarUsuarios_reg_usuarios() {
    const input = document.getElementById('filtroBuscarUsuario_reg_usuarios');
    if (!input) return;
    const filtro = input.value.toLowerCase();
    const tbody = document.getElementById('cuerpoTablaUsuarios_reg_usuarios');
    if (!tbody) return;

    const filas = tbody.getElementsByTagName('tr');

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        if (fila.cells.length < 3) continue;

        const tdId = fila.cells[1].getElementsByTagName('input')[0];
        const tdCorreo = fila.cells[2].getElementsByTagName('input')[0];

        const textoId = tdId ? tdId.value.toLowerCase() : '';
        const textoCorreo = tdCorreo ? tdCorreo.value.toLowerCase() : '';

        if (textoId.includes(filtro) || textoCorreo.includes(filtro)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    }
}

// Función para filtrar usuarios por Estado (Todos, Activo, Inactivo)
function filtrarEstadoUsuarios_reg_usuarios() {
    const selectEstado = document.getElementById('filtroEstadoUsuarios_reg_usuarios');
    if (!selectEstado) return;
    const valorEstado = selectEstado.value;
    const tbody = document.getElementById('cuerpoTablaUsuarios_reg_usuarios');
    if (!tbody) return;

    const filas = tbody.getElementsByTagName('tr');

    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        if (fila.cells.length < 5) continue;

        const selectFila = fila.cells[4].getElementsByTagName('select')[0];
        const estadoFila = selectFila ? selectFila.value : '';

        if (valorEstado === "" || estadoFila === valorEstado) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    }
}

// Alias de compatibilidad para asegurar los clics de los botones[cite: 16]
function exportarUsuariosCSV() {
    exportarUsuariosCSV_reg_usuarios();
}