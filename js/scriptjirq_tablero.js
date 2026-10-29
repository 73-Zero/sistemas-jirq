// --- CONFIGURACIÓN DE SEGURIDAD Y FIREBASE ---
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
       (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
    }
});

const firebaseConfig = {
    databaseURL: "https://sistemas-jirq-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Referencias a los nodos en la base de datos de Firebase
const dbRefUsuarios = firebase.database().ref('usuarios');
const dbRefFunciones = firebase.database().ref('funciones');

document.addEventListener("DOMContentLoaded", () => {
    aplicarControlDeAccesoYPermisos();
    cargarUsuariosFirebase();
    cargarFuncionesFirebase();
});

function aplicarControlDeAccesoYPermisos() {
    const usuarioId = sessionStorage.getItem("usuario_sesion_id") || "invitado";
    const esAdmin = sessionStorage.getItem("usuario_sesion_admin") === "true";
    let permisos = {};

    try {
        permisos = JSON.parse(sessionStorage.getItem("usuario_sesion_permisos") || "{}");
    } catch (e) {
        permisos = {};
    }

    const bannerContainer = document.getElementById('welcomeMessageBanner');
    if (bannerContainer) {
        if (esAdmin) {
            bannerContainer.textContent = "Bienvenido mi Admin";
        } else {
            bannerContainer.textContent = `Bienvenido(a) ${usuarioId}`;
        }
    }

    const btnRegistroUsuarios = document.getElementById('btnRegistroUsuarios');
    if (btnRegistroUsuarios) {
        btnRegistroUsuarios.style.display = esAdmin ? "flex" : "none";
    }

    const botonesModulos = document.querySelectorAll('.modules-grid .module-btn[data-permiso]');
    botonesModulos.forEach(boton => {
        const nombrePermiso = boton.getAttribute('data-permiso');
        if (permisos[nombrePermiso] === false) {
            boton.style.display = "none";
        } else {
            boton.style.display = "flex";
        }
    });
}

// --- SINCRONIZACIÓN EN TIEMPO REAL DEL MÓDULO LISTADO DE FUNCIONES ---

function cargarFuncionesFirebase() {
    let tbody = document.getElementById('cuerpoTablaFunciones');
    if (!tbody) return;

    dbRefFunciones.on('value', (snapshot) => {
        tbody.innerHTML = "";
        let data = snapshot.val();

        if (!data) {
            tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:15px; color:#64748b;">No hay funciones registradas. Haga clic en "+ Nueva Función".</td></tr>`;
            return;
        }

        let index = 1;
        Object.keys(data).forEach(key => {
            let func = data[key];
            let nombre = func.nombre || "";
            let platInicial = func.plat_inicial || "";
            let platFinal = func.plat_final || "";
            let t89 = func.t_8_9 || "";
            let t1011 = func.t_10_11 || "";
            let t121 = func.t_12_1 || "";
            let t23 = func.t_2_3 || "";
            let t45 = func.t_4_5 || "";
            let funcionTexto = func.funcion || "";
            let detalle = func.detalle || "";
            let estado = func.estado || "Activo";
            let dias = func.dias || "";

            let check89 = t89 === "✓" ? "has-check" : "";
            let check1011 = t1011 === "✓" ? "has-check" : "";
            let check121 = t121 === "✓" ? "has-check" : "";
            let check23 = t23 === "✓" ? "has-check" : "";
            let check45 = t45 === "✓" ? "has-check" : "";

            let tr = document.createElement('tr');
            tr.setAttribute('data-id', key);
            tr.draggable = true;
            tr.setAttribute('ondragstart', 'drag(event)');
            tr.setAttribute('ondragover', 'allowDrop(event)');
            tr.setAttribute('ondrop', 'drop(event)');
            tr.style.opacity = (estado === "Activo") ? "1" : "0.7";

            tr.innerHTML = `
                <td class="drag-handle" title="Arrastrar para mover">⠿</td>
                <td class="num-fila">${index++}</td>
                <td><input type="text" value="${nombre}" onchange="actualizarFuncionFirebase('${key}', 'nombre', this.value)"></td>
                <td><input type="text" value="${platInicial}" onchange="actualizarFuncionFirebase('${key}', 'plat_inicial', this.value)"></td>
                <td><input type="text" value="${platFinal}" onchange="actualizarFuncionFirebase('${key}', 'plat_final', this.value)"></td>
                <td><input type="text" class="input-turn ${check89}" value="${t89}" onclick="toggleCheckTurnRealtime(this, '${key}', 't_8_9')" oninput="gestionarEntradaTurnoRealtime(this, '${key}', 't_8_9')"></td>
                <td><input type="text" class="input-turn ${check1011}" value="${t1011}" onclick="toggleCheckTurnRealtime(this, '${key}', 't_10_11')" oninput="gestionarEntradaTurnoRealtime(this, '${key}', 't_10_11')"></td>
                <td><input type="text" class="input-turn ${check121}" value="${t121}" onclick="toggleCheckTurnRealtime(this, '${key}', 't_12_1')" oninput="gestionarEntradaTurnoRealtime(this, '${key}', 't_12_1')"></td>
                <td><input type="text" class="input-turn ${check23}" value="${t23}" onclick="toggleCheckTurnRealtime(this, '${key}', 't_2_3')" oninput="gestionarEntradaTurnoRealtime(this, '${key}', 't_2_3')"></td>
                <td><input type="text" class="input-turn ${check45}" value="${t45}" onclick="toggleCheckTurnRealtime(this, '${key}', 't_4_5')" oninput="gestionarEntradaTurnoRealtime(this, '${key}', 't_4_5')"></td>
                <td><input type="text" value="${funcionTexto}" onchange="actualizarFuncionFirebase('${key}', 'funcion', this.value)"></td>
                <td><input type="text" value="${detalle}" onchange="actualizarFuncionFirebase('${key}', 'detalle', this.value)"></td>
                <td>
                    <select class="select-estado" onchange="actualizarFuncionFirebase('${key}', 'estado', this.value)">
                        <option value="Activo" ${estado === 'Activo' ? 'selected' : ''}>Activo</option>
                        <option value="Inactivo" ${estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </td>
                <td><input type="text" value="${dias}" onchange="actualizarFuncionFirebase('${key}', 'dias', this.value)"></td>
                <td><button class="delete-row-btn" onclick="eliminarFuncionFirebase('${key}')">✕</button></td>
            `;
            tbody.appendChild(tr);
        });

        filtrarFuncionesTabla();
    });
}

// Agregar nueva función directamente a Firebase en blanco
function agregarNuevaFilaFuncion() {
    let nuevaKey = dbRefFunciones.push().key;
    let nuevaFuncionData = {
        id: nuevaKey,
        nombre: "",
        plat_inicial: "",
        plat_final: "",
        t_8_9: "",
        t_10_11: "",
        t_12_1: "",
        t_2_3: "",
        t_4_5: "",
        funcion: "",
        detalle: "",
        estado: "Activo",
        dias: ""
    };

    dbRefFunciones.child(nuevaKey).set(nuevaFuncionData).then(() => {
        setTimeout(() => {
            let trs = document.querySelectorAll('#cuerpoTablaFunciones tr');
            if (trs.length > 0) {
                let ultimoTr = trs[trs.length - 1];
                let primerInput = ultimoTr.querySelector('td:nth-child(3) input');
                if (primerInput) primerInput.focus();
            }
        }, 100);
    });
}

function actualizarFuncionFirebase(key, campo, valor) {
    dbRefFunciones.child(key).update({ [campo]: valor });
}

function toggleCheckTurnRealtime(input, key, campoHorario) {
    let nuevoValor = (input.value === "✓") ? "" : "✓";
    actualizarFuncionFirebase(key, campoHorario, nuevoValor);
}

function gestionarEntradaTurnoRealtime(input, key, campoHorario) {
    let val = input.value.trim();
    let nuevoValor = "";
    if (val === "1") {
        nuevoValor = "✓";
    } else if (val.includes("✓")) {
        nuevoValor = "✓";
    } else {
        nuevoValor = "";
    }
    actualizarFuncionFirebase(key, campoHorario, nuevoValor);
}

function eliminarFuncionFirebase(key) {
    if (confirm("¿Estás seguro de eliminar esta función de la base de datos?")) {
        dbRefFunciones.child(key).remove();
    }
}

function cambiarEstadoFila(select) {
    let tr = select.closest('tr');
    tr.style.opacity = (select.value === "Activo") ? "1" : "0.7";
}

function filtrarFuncionesTabla() {
    let filtroTexto = document.getElementById('buscadorFunciones').value.toLowerCase();
    let filtroEstado = document.getElementById('filtroEstadoFunciones').value;
    let filas = document.querySelectorAll('#cuerpoTablaFunciones tr');

    filas.forEach(tr => {
        let inputListado = tr.querySelector('td:nth-child(3) input');
        let textoListado = inputListado ? inputListado.value.toLowerCase() : "";
        let selectEstado = tr.querySelector('.select-estado');
        let estadoFila = selectEstado ? selectEstado.value : "";

        let coincideTexto = textoListado.includes(filtroTexto);
        let coincideEstado = (filtroEstado === "" || estadoFila === filtroEstado);

        tr.style.display = (coincideTexto && coincideEstado) ? "" : "none";
    });
}

function reindexarFilasFunciones() {
    let filas = document.querySelectorAll('#cuerpoTablaFunciones tr');
    filas.forEach((tr, index) => {
        let tdNum = tr.querySelector('.num-fila');
        if (tdNum) {
            tdNum.textContent = index + 1;
        }
    });
}

// Drag & Drop para reordenar filas
let filaArrastrada = null;
function drag(event) {
    filaArrastrada = event.target.closest('tr');
}
function allowDrop(event) {
    event.preventDefault();
}
function drop(event) {
    event.preventDefault();
    let filaDestino = event.target.closest('tr');
    if (filaArrastrada && filaDestino && filaArrastrada !== filaDestino) {
        let tbody = document.getElementById('cuerpoTablaFunciones');
        let todasFilas = Array.from(tbody.querySelectorAll('tr'));
        let indexOrigen = todasFilas.indexOf(filaArrastrada);
        let indexDestino = todasFilas.indexOf(filaDestino);

        if (indexOrigen < indexDestino) {
            tbody.insertBefore(filaArrastrada, filaDestino.nextSibling);
        } else {
            tbody.insertBefore(filaArrastrada, filaDestino);
        }
        reindexarFilasFunciones();
    }
}


// --- GESTIÓN DE USUARIOS EN TIEMPO REAL DESDE FIREBASE ---

function cargarUsuariosFirebase() {
    let tbody = document.getElementById('cuerpoTablaUsuarios');
    if (!tbody) return;

    dbRefUsuarios.on('value', (snapshot) => {
        tbody.innerHTML = "";
        let data = snapshot.val();
        
        if (!data) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:15px; color:#64748b;">No hay usuarios registrados en Firebase.</td></tr>`;
            return;
        }

        let index = 1;
        Object.keys(data).forEach(key => {
            let user = data[key];
            let idNombre = user.id || key;
            let correo = user.usuario || "";
            let clave = user.clave && user.clave !== "" ? user.clave : "Pendiente";
            let estado = user.estado !== undefined ? user.estado : 1;
            let pais = user.pais && user.pais !== "" ? user.pais : "Pendiente";
            let fechaHora = user.fecha_hora && user.fecha_hora !== "" ? user.fecha_hora : "Pendiente";
            
            let permisos = user.permisos || {};
            let chkFunc = permisos.listado_funciones ? "checked" : "";
            let chkCalc = permisos.calcular_datos ? "checked" : "";
            let chkAyu = permisos.ayuda_rapida ? "checked" : "";
            let chkCont = permisos.conteo_tablas ? "checked" : "";
            let chkMet = permisos.metas_entel ? "checked" : "";
            let chkVar = permisos.querys_variadas ? "checked" : "";

            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index++}</td>
                <td><input type="text" value="${idNombre}" style="width: 50px; text-align: center;" onchange="actualizarUsuarioFirebase('${key}', 'id', this.value)"></td>
                <td><input type="text" value="${correo}" onchange="actualizarUsuarioFirebase('${key}', 'usuario', this.value)"></td>
                <td><input type="text" value="${clave}" style="font-family: monospace; color: ${clave === 'Pendiente' ? '#d97706' : '#0284c7'};" readonly></td>
                <td>
                    <select class="select-estado" onchange="actualizarUsuarioFirebase('${key}', 'estado', parseInt(this.value))">
                        <option value="1" ${estado === 1 ? 'selected' : ''}>Activo</option>
                        <option value="0" ${estado === 0 ? 'selected' : ''}>Inactivo</option>
                    </select>
                </td>
                <td><input type="text" value="${pais}" style="text-align: center; color: ${pais === 'Pendiente' ? '#d97706' : '#000'};" onchange="actualizarUsuarioFirebase('${key}', 'pais', this.value)"></td>
                <td><input type="text" value="${fechaHora}" style="text-align: center; font-size: 11px; color: ${fechaHora === 'Pendiente' ? '#d97706' : '#000'};" readonly></td>
                <td>
                    <div class="permisos-checks-grid" style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; font-size: 11px;">
                        <label title="Listado Funciones"><input type="checkbox" ${chkFunc} onchange="actualizarPermisoFirebase('${key}', 'listado_funciones', this.checked)"> Func.</label>
                        <label title="Calcular Datos"><input type="checkbox" ${chkCalc} onchange="actualizarPermisoFirebase('${key}', 'calcular_datos', this.checked)"> Calc.</label>
                        <label title="Ayuda Rápida"><input type="checkbox" ${chkAyu} onchange="actualizarPermisoFirebase('${key}', 'ayuda_rapida', this.checked)"> Ayu.</label>
                        <label title="Conteo Tablas"><input type="checkbox" ${chkCont} onchange="actualizarPermisoFirebase('${key}', 'conteo_tablas', this.checked)"> Cont.</label>
                        <label title="Metas Entel"><input type="checkbox" ${chkMet} onchange="actualizarPermisoFirebase('${key}', 'metas_entel', this.checked)"> Met.</label>
                        <label title="Querys variadas"><input type="checkbox" ${chkVar} onchange="actualizarPermisoFirebase('${key}', 'querys_variadas', this.checked)"> Var.</label>
                    </div>
                </td>
                <td><button class="delete-row-btn" onclick="eliminarUsuarioFirebase('${key}')">✕</button></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function guardarNuevoUsuario() {
    let inputCorreo = document.getElementById('nuevoCorreo');
    let inputId = document.getElementById('nuevoId');
    
    let correo = inputCorreo.value.trim();
    let idNombre = inputId.value.trim();
    
    if (correo === "") {
        alert("Por favor ingresa un correo electrónico válido.");
        inputCorreo.focus();
        return;
    }
    
    if (idNombre === "") {
        idNombre = correo.split('@')[0];
    }
    
    let nuevoUsuarioData = {
        id: idNombre,
        usuario: correo,
        estado: 1,
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

    dbRefUsuarios.child(idNombre).set(nuevoUsuarioData)
        .then(() => {
            inputCorreo.value = "";
            inputId.value = "";
            cerrarModal('modalNuevoUsuarioForm');
        })
        .catch((error) => {
            alert("Error al guardar en Firebase: " + error.message);
        });
}

function actualizarUsuarioFirebase(userKey, campo, valor) {
    dbRefUsuarios.child(userKey).update({ [campo]: valor });
}

function actualizarPermisoFirebase(userKey, modulo, valor) {
    dbRefUsuarios.child(userKey).child('permisos').update({ [modulo]: valor });
}

function eliminarUsuarioFirebase(userKey) {
    if (confirm("¿Estás seguro de eliminar este usuario del sistema?")) {
        dbRefUsuarios.child(userKey).remove();
    }
}

// --- GESTIÓN GENERAL DE MODALES ---
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}

function abrirModulo(nombreModulo) {
    alert(`Abriendo módulo: ${nombreModulo}`);
}

function exportarUsuariosCSV() {
    let filas = document.querySelectorAll('#cuerpoTablaUsuarios tr');
    if (filas.length === 0) {
        alert("No hay usuarios para exportar.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,ID,Correo,Clave,Estado,Pais,Fecha_Hora\n";
    
    filas.forEach(row => {
        let inputs = row.querySelectorAll('input[type="text"]');
        let selectEstado = row.querySelector('select');
        
        if (inputs.length >= 5) {
            let id = inputs[0].value;
            let correo = inputs[1].value;
            let clave = inputs[2].value;
            let estado = selectEstado ? selectEstado.value : "1";
            let pais = inputs[3].value;
            let fechaHora = inputs[4].value;
            
            csvContent += `"${id}","${correo}","${clave}","${estado}","${pais}","${fechaHora}"\n`;
        }
    });
    
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "usuarios_sistema_jirq.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}