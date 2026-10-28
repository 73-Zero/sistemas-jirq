// --- BLOQUEOS DE SEGURIDAD ---
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
       (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Te espero aqui 🥺​🤲​";
    } else {
        document.title = "Tablero Principal - Sistema JIRQ";
    }
});

// --- CONTROL DE MODALES Y FUNCIONES ---
function abrirModal(idModal) {
    document.getElementById(idModal).style.display = 'flex';
    if(idModal === 'modalListadoFunciones') {
        filtrarTabla();
    }
}

function cerrarModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

function abrirTutorial(num) {
    document.getElementById('tituloTutorial').innerText = ":: Tutorial del Proceso #" + num + " ::";
    abrirModal('modalTutorial');
}

function cambiarTab(evt, tabId) {
    let contents = document.querySelectorAll('#modalAyuda .tab-content');
    contents.forEach(c => c.classList.remove('active'));

    let buttons = document.querySelectorAll('#modalAyuda .tab-btn');
    buttons.forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function cambiarTabBQ(evt, tabId) {
    let contents = document.querySelectorAll('#modalBigquery .bq-content');
    contents.forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
    });

    let buttons = document.querySelectorAll('#modalBigquery .tab-btn');
    buttons.forEach(b => b.classList.remove('active'));

    let activeTab = document.getElementById(tabId);
    activeTab.style.display = 'block';
    activeTab.classList.add('active');
    evt.currentTarget.classList.add('active');
}

function evaluarTurno(input) {
    let val = input.value.trim();
    if (val === "1") {
        input.value = "✔";
        input.classList.add('has-check');
    } else if (val === "✔") {
        input.classList.add('has-check');
    } else {
        input.classList.remove('has-check');
    }
}

function eliminarFila(btn) {
    let row = btn.closest('tr');
    row.classList.add('fade-out');
    setTimeout(() => {
        row.remove();
        actualizarNumeracion();
        filtrarTabla();
    }, 300);
}

function actualizarNumeracion() {
    let filas = document.querySelectorAll('#cuerpoTabla tr');
    filas.forEach((row, index) => {
        let link = row.querySelector('td:nth-child(2) a');
        if(link) {
            link.innerText = index + 1;
            link.setAttribute("onclick", `abrirTutorial(${index + 1}); return false;`);
        }
    });
}

function agregarNuevaFila() {
    let tbody = document.getElementById('cuerpoTabla');
    let totalFilas = tbody.rows.length + 1;
    
    let nuevaTr = document.createElement('tr');
    nuevaTr.setAttribute('draggable', 'true');
    nuevaTr.setAttribute('ondragstart', 'dragStart(event)');
    nuevaTr.setAttribute('ondragover', 'dragOver(event)');
    nuevaTr.setAttribute('ondrop', 'drop(event)');

    nuevaTr.innerHTML = `
            <td>${totalFilas}</td>
            <td><input type="text" value="${idNombre}" style="width: 50px; text-align: center;"></td>
            <td><input type="text" value="${correo}"></td>
            <td><input type="text" value="Pendiente" style="font-family: monospace; color: #d97706; font-size: 11px;" readonly></td>
            <td>
                <select class="select-estado">
                    <option value="1" selected>Activo</option>
                    <option value="0">Inactivo</option>
                </select>
            </td>
            <td><input type="text" value="Pendiente" style="color: #d97706; text-align: center;" readonly></td>
            <td><input type="text" value="Pendiente" style="color: #d97706; text-align: center; font-size: 11px;" readonly></td>
            <td>
                <div class="permisos-checks-grid">
                    <label title="Listado Funciones"><input type="checkbox" checked> Func.</label>
                    <label title="Calcular Datos"><input type="checkbox" checked> Calc.</label>
                    <label title="Ayuda Rápida"><input type="checkbox" checked> Ayu.</label>
                    <label title="Conteo Tablas"><input type="checkbox" checked> Cont.</label>
                    <label title="Metas Entel"><input type="checkbox" checked> Met.</label>
                    <label title="Querys variadas"><input type="checkbox" checked> Var.</label>
                </div>
            </td>
            <td><button class="delete-row-btn" onclick="this.closest('tr').remove();">✕</button></td>
        `;

    tbody.appendChild(nuevaTr);

    let container = document.getElementById('tablaContainer');
    container.scrollTop = container.scrollHeight;

    let inputPrincipal = nuevaTr.querySelector('td:nth-child(3) input');
    inputPrincipal.focus();

    setTimeout(() => {
        inputPrincipal.classList.remove('highlight-new');
    }, 3000);
    
    filtrarTabla();
}

function filtrarTabla() {
    let filtroEstado = document.getElementById('filtroEstado').value.trim().toLowerCase();
    let filtroTexto = document.getElementById('filtroBuscar').value.trim().toLowerCase();
    let filas = document.querySelectorAll('#cuerpoTabla tr');

    filas.forEach(row => {
        let inputFuncion = row.querySelector('td:nth-child(3) input');
        let selectEstado = row.querySelector('td:nth-child(13) select');

        let textoFuncion = inputFuncion ? inputFuncion.value.trim().toLowerCase() : "";
        let valorEstado = selectEstado ? selectEstado.value.trim().toLowerCase() : "";

        let coincideEstado = (filtroEstado === "" || valorEstado === filtroEstado);
        let coincideTexto = (filtroTexto === "" || textoFuncion.includes(filtroTexto));

        if (coincideEstado && coincideTexto) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

let filaArrastrada = null;

function dragStart(e) {
    filaArrastrada = e.target.closest('tr');
    e.dataTransfer.effectAllowed = 'move';
    filaArrastrada.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    let filaActual = e.target.closest('tr');
    if (filaActual && filaActual !== filaArrastrada) {
        let tbody = document.getElementById('cuerpoTabla');
        let rect = filaActual.getBoundingClientRect();
        let midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
            tbody.insertBefore(filaArrastrada, filaActual);
        } else {
            tbody.insertBefore(filaArrastrada, filaActual.nextSibling);
        }
    }
}

function drop(e) {
    e.preventDefault();
    if (filaArrastrada) {
        filaArrastrada.classList.remove('dragging');
        actualizarNumeracion();
        filaArrastrada = null;
    }
}

// --- ACCIONES PARA LOS OTROS MÓDULOS ---
function abrirModulo(nombreModulo) {
    switch (nombreModulo) {
        case 'registro_usuarios':
            alert('Abriendo módulo: Registro de Usuarios');
            break;
        case 'calcular_datos':
            alert('Abriendo módulo: Calcular Datos');
            break;
        case 'leeme_primero':
            alert('¡Bienvenido! Haz clicado: Léeme primero');
            break;
        case 'metas_entel':
            alert('Abriendo módulo: Metas Entel y Socios');
            break;
        case 'query_variadas':
            alert('Abriendo módulo: Query Variadas');
            break;
        default:
            console.log('Módulo no reconocido');
    }
}


// --- LÓGICA DEL MÓDULO: REGISTRO DE USUARIOS ---

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
    
    // Si no puso ID, usamos la parte antes del @ como ID por defecto
    if (idNombre === "") {
        idNombre = correo.split('@')[0];
    }
    
    // Estado por defecto: 1 (Activo)
    let estadoDefault = 1;
    
    // Capturar el estado de los permisos (checks) actuales de la interfaz
    // (Puedes ajustar esto si luego deseas leer los checks reales del formulario)
    let permisos = {
        listado_funciones: true,
        calcular_datos: true,
        ayuda_rapida: true,
        conteo_tablas: true,
        metas_entel: true,
        querys_variadas: true
    };

    // Objeto exacto que se enviará a Firebase con campos pendientes
    let nuevoUsuarioData = {
        id: idNombre,
        usuario: correo,
        estado: estadoDefault,
        clave: "",         // Vacío hasta que index.html lo genere
        pais: "",          // Vacío / Pendiente
        fecha_hora: "",    // Vacío / Pendiente hasta el primer login
        permisos: permisos
    };

    console.log("Guardando en Firebase con campos pendientes:", nuevoUsuarioData);
    
    // AQUÍ ES DONDE SE CONECTARÁ CON FIREBASE (Pronto añadiremos esta línea de Firebase SDK)
    // database.ref('usuarios/' + idNombre).set(nuevoUsuarioData);

    // Insertar nueva fila en la tabla visual del tablero
    let tablaUsuarios = document.querySelector('#modalRegistroUsuarios tbody');
    if (tablaUsuarios) {
        let totalFilas = tablaUsuarios.rows.length + 1;
        let nuevaTr = document.createElement('tr');
        
        nuevaTr.innerHTML = `
            <td>${totalFilas}</td>
            <td><input type="text" value="${idNombre}"></td>
            <td><input type="text" value="${correo}"></td>
            <td><input type="text" value="Pendiente" style="font-family: monospace; color: #d97706; font-size: 11px;" readonly></td>
            <td>
                <select class="select-estado">
                    <option value="1" selected>Activo</option>
                    <option value="0">Inactivo</option>
                </select>
            </td>
            <td><input type="text" value="Pendiente" style="color: #d97706;" readonly></td>
            <td>
                <div class="permisos-checks-grid">
                    <label title="Listado Funciones"><input type="checkbox" checked> Func.</label>
                    <label title="Calcular Datos"><input type="checkbox" checked> Calc.</label>
                    <label title="Ayuda Rápida"><input type="checkbox" checked> Ayu.</label>
                    <label title="Conteo Tablas"><input type="checkbox" checked> Cont.</label>
                    <label title="Metas Entel"><input type="checkbox" checked> Met.</label>
                    <label title="Querys variadas"><input type="checkbox" checked> Var.</label>
                </div>
            </td>
            <td><button class="delete-row-btn" onclick="this.closest('tr').remove();">✕</button></td>
        `;
        
        tablaUsuarios.appendChild(nuevaTr);
    }
    
    // Limpiar formulario y cerrar submodal silenciosamente
    inputCorreo.value = "";
    inputId.value = "";
    cerrarModal('modalNuevoUsuarioForm');
}

// Exportar usuarios a formato CSV
function exportarUsuariosCSV() {
    let filas = document.querySelectorAll('#modalRegistroUsuarios table tbody tr');
    if (filas.length === 0) {
        alert("No hay usuarios para exportar.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,ID,Correo,Clave,Estado,Pais\n";
    
    filas.forEach(row => {
        let inputs = row.querySelectorAll('input[type="text"]');
        let selectEstado = row.querySelector('select');
        
        if (inputs.length >= 3) {
            let id = inputs[0].value;
            let correo = inputs[1].value;
            let clave = inputs[2].value;
            let estado = selectEstado ? selectEstado.value : "1";
            let pais = inputs[3] ? inputs[3].value : "Peru";
            
            csvContent += `"${id}","${correo}","${clave}","${estado}","${pais}"\n`;
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