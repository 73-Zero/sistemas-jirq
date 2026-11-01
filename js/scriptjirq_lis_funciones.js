/* ========================================================================== */
/* MÓDULO LISTADO DE FUNCIONES: LÓGICA Y FIREBASE EN TIEMPO REAL             */
/* ========================================================================== */

function abrirModal_lis_funciones(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
        cargarFuncionesDesdeFirebase_lis_funciones();
    }
}

function cerrarModal_lis_funciones(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}

function cargarFuncionesDesdeFirebase_lis_funciones() {
    const dbRef = firebase.database().ref('funciones');
    const tbody = document.getElementById('cuerpoTablaFunciones_lis_funciones');
    if (!tbody) return;

    // Escuchamos y ordenamos los registros basándonos en el campo 'orden' almacenado en Firebase
    dbRef.orderByChild('orden').on('value', (snapshot) => {
        tbody.innerHTML = '';
        const data = snapshot.val();
        if (!data) {
            tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:20px; color:#64748b; font-family:'Roboto',sans-serif;">No hay funciones registradas. Haga clic en "+ Nueva Función" para comenzar.</td></tr>`;
            return;
        }

        // Ordenamos las llaves asegurando que el índice local respete el orden guardado
        let contador = 1;
        const keysOrdenadas = Object.keys(data).sort((a, b) => {
            const ordenA = data[a].orden !== undefined ? data[a].orden : 9999;
            const ordenB = data[b].orden !== undefined ? data[b].orden : 9999;
            return ordenA - ordenB;
        });

        keysOrdenadas.forEach(firebaseKey => {
            const func = data[firebaseKey];

            /**
             * Convierte valores guardados (1, true, ✓, ✔, ✅) en el emoticón visual ✅.
             */
            const formatearCheck = (val) => {
                if (!val) return '';
                const v = String(val).trim().toLowerCase();
                if (v === '1' || v === 'true' || v === '✓' || v === '✔' || v === '✅') {
                    return '✅';
                }
                return val;
            };

            const nombreVal = func.nombre || '';
            const detalleVal = func.detalle || '';
            
            // Calculamos el número de orden real basado en Firebase o en el contador de respaldo
            const numeroOrdenReal = (func.orden !== undefined) ? (func.orden + 1) : contador++;

            const tr = document.createElement('tr');
            tr.setAttribute('draggable', 'true'); // Habilita el arrastre de fila
            tr.dataset.firebaseKey = firebaseKey;

            // Eventos de Drag & Drop para reordenar filas con los puntitos
            tr.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', firebaseKey);
                tr.classList.add('fila-arrastrando_lis_funciones');
            });

            tr.addEventListener('dragend', () => {
                tr.classList.remove('fila-arrastrando_lis_funciones');
            });

            tr.addEventListener('dragover', (e) => {
                e.preventDefault();
                tr.classList.add('fila-sobre_lis_funciones');
            });

            tr.addEventListener('dragleave', () => {
                tr.classList.remove('fila-sobre_lis_funciones');
            });

            tr.addEventListener('drop', (e) => {
                e.preventDefault();
                tr.classList.remove('fila-sobre_lis_funciones');
                const origenKey = e.dataTransfer.getData('text/plain');
                const destinoKey = firebaseKey;
                
                if (origenKey && destinoKey && origenKey !== destinoKey) {
                    intercambiarOrdenFilas_lis_funciones(origenKey, destinoKey, data);
                }
            });

            tr.innerHTML = `
                <td style="cursor: grab; text-align:center;" title="Arrastrar para mover posición">⋮⋮</td>
                <td style="color: #64748b; font-weight: 500;">${numeroOrdenReal}</td>
                <td>
                    <input type="text" value="${nombreVal}" 
                           onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'nombre', this.value)"
                           onmouseenter="mostrarTooltipExcel(event, '${nombreVal.replace(/'/g, "\\'")}')" 
                           onmouseleave="ocultarTooltipExcel()">
                </td>
                <td><input type="text" value="${func.plat_inicial || func.plataforma_inicial || ''}" onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'plat_inicial', this.value)"></td>
                <td><input type="text" value="${func.plat_final || func.plataforma_final || ''}" onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'plat_final', this.value)"></td>
                
                <!-- Casillas de horarios: Escribes '1' (o cualquier check) y se convierte automáticamente en ✅ -->
                <td><input type="text" style="text-align:center;" value="${formatearCheck(func.t_8_9 || func.h_8_9)}" onchange="procesarEscrituraCheck_lis_funciones(this, '${firebaseKey}', 't_8_9')"></td>
                <td><input type="text" style="text-align:center;" value="${formatearCheck(func.t_10_11 || func.h_10_11)}" onchange="procesarEscrituraCheck_lis_funciones(this, '${firebaseKey}', 't_10_11')"></td>
                <td><input type="text" style="text-align:center;" value="${formatearCheck(func.t_12_1 || func.h_12_1)}" onchange="procesarEscrituraCheck_lis_funciones(this, '${firebaseKey}', 't_12_1')"></td>
                <td><input type="text" style="text-align:center;" value="${formatearCheck(func.t_2_3 || func.h_2_3)}" onchange="procesarEscrituraCheck_lis_funciones(this, '${firebaseKey}', 't_2_3')"></td>
                <td><input type="text" style="text-align:center;" value="${formatearCheck(func.t_4_5 || func.h_4_5)}" onchange="procesarEscrituraCheck_lis_funciones(this, '${firebaseKey}', 't_4_5')"></td>

                <td><input type="text" value="${func.funcion || ''}" onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'funcion', this.value)"></td>
                <td>
                    <input type="text" value="${detalleVal}" 
                           onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'detalle', this.value)"
                           onmouseenter="mostrarTooltipExcel(event, '${detalleVal.replace(/'/g, "\\'")}')" 
                           onmouseleave="ocultarTooltipExcel()">
                </td>
                <td>
                    <select class="select-estado-excel_lis_funciones" onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'estado', this.value)">
                        <option value="Activo" ${func.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                        <option value="Inactivo" ${func.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </td>
                <td><input type="text" value="${func.dias || ''}" onchange="actualizarDatoFuncion_lis_funciones('${firebaseKey}', 'dias', this.value)"></td>
                <td>
                    <button type="button" class="btn-eliminar-fila_lis_funciones" onclick="confirmarEliminarFuncion_lis_funciones('${firebaseKey}')" title="Eliminar Fila">✕</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

/**
 * Actualiza un campo genérico directamente en Firebase.
 */
function actualizarDatoFuncion_lis_funciones(firebaseKey, campo, valor) {
    firebase.database().ref('funciones/' + firebaseKey).update({
        [campo]: valor
    }).catch(error => {
        console.error("Error al actualizar campo: ", error);
    });
}

/**
 * Reordena las posiciones en Firebase al arrastrar y soltar una fila.
 */
function intercambiarOrdenFilas_lis_funciones(origenKey, destinoKey, allData) {
    const keys = Object.keys(allData).sort((a, b) => {
        const ordenA = allData[a].orden !== undefined ? allData[a].orden : 9999;
        const ordenB = allData[b].orden !== undefined ? allData[b].orden : 9999;
        return ordenA - ordenB;
    });

    const indexOrigen = keys.indexOf(origenKey);
    const indexDestino = keys.indexOf(destinoKey);

    if (indexOrigen > -1 && indexDestino > -1) {
        keys.splice(indexOrigen, 1);
        keys.splice(indexDestino, 0, origenKey);

        const actualizaciones = {};
        keys.forEach((key, index) => {
            actualizaciones[key + '/orden'] = index;
        });

        firebase.database().ref('funciones').update(actualizaciones).catch(error => {
            console.error("Error al guardar el nuevo orden: ", error);
        });
    }
}

/**
 * Procesa cuando el usuario escribe '1' o un check en el input de horario,
 * transformándolo en ✅ al salir de la celda (con Tab o clic fuera).
 */
function procesarEscrituraCheck_lis_funciones(inputElement, firebaseKey, campoHorario) {
    const val = inputElement.value.trim().toLowerCase();
    let valorAGuardar = '';

    if (val === '1' || val === 'true' || val === '✓' || val === '✔' || val === '✅') {
        inputElement.value = '✅';
        valorAGuardar = '✅';
    } else {
        inputElement.value = ''; // Si escribe otra cosa o borra, queda vacío
        valorAGuardar = '';
    }

    actualizarDatoFuncion_lis_funciones(firebaseKey, campoHorario, valorAGuardar);
}

function agregarNuevaFilaFuncion_lis_funciones() {
    const dbRef = firebase.database().ref('funciones');
    dbRef.once('value', (snapshot) => {
        const data = snapshot.val();
        const totalItems = data ? Object.keys(data).length : 0;

        const nuevaFuncion = {
            nombre: "Nueva Función Registrada",
            plat_inicial: "KIWOX",
            plat_final: "ENTEL",
            t_8_9: "✅",
            t_10_11: "",
            t_12_1: "",
            t_2_3: "",
            t_4_5: "",
            funcion: "Actualización Data",
            detalle: "Detalle operativo",
            estado: "Activo",
            dias: "Lu a Vi",
            orden: totalItems // Se asigna al final de la lista
        };

        dbRef.push(nuevaFuncion).catch(error => {
            console.error("Error al crear nueva función: ", error);
        });
    });
}

function confirmarEliminarFuncion_lis_funciones(firebaseKey) {
    const modalAlerta = document.getElementById('modalAlertaEliminar_lis_funciones');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar_lis_funciones');
    
    if (modalAlerta && btnConfirmar) {
        modalAlerta.style.display = 'flex';
        btnConfirmar.onclick = () => {
            firebase.database().ref('funciones/' + firebaseKey).remove()
                .then(() => {
                    modalAlerta.style.display = 'none';
                })
                .catch(error => {
                    console.error("Error al eliminar función: ", error);
                });
        };
    }
}

/**
 * Filtra la tabla en tiempo real enfocándose específicamente en la columna "Listado de funciones" y por Estado.
 */
function filtrarFuncionesTabla_lis_funciones() {
    const buscadorInput = document.getElementById('buscadorFunciones_lis_funciones');
    const estadoSelect = document.getElementById('filtroEstadoFunciones_lis_funciones');
    
    const filtroTexto = buscadorInput ? buscadorInput.value.toLowerCase().trim() : '';
    const filtroEstado = estadoSelect ? estadoSelect.value : '';
    
    const filas = document.querySelectorAll('#cuerpoTablaFunciones_lis_funciones tr');

    filas.forEach(fila => {
        // Tomamos específicamente el valor del input de la columna "Listado de funciones" (tercera columna, índice 2)
        const inputNombreFuncion = fila.querySelector('td:nth-child(3) input[type="text"]');
        const textoNombreFuncion = inputNombreFuncion ? inputNombreFuncion.value.toLowerCase() : '';
        
        const selectEstado = fila.querySelector('.select-estado-excel_lis_funciones');
        const estadoFila = selectEstado ? selectEstado.value : '';

        const coincideTexto = textoNombreFuncion.includes(filtroTexto);
        const coincideEstado = !filtroEstado || filtroEstado === "[ Todos ]" || estadoFila === filtroEstado;

        if (coincideTexto && coincideEstado) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

function exportarFuncionesExcelXLSX_lis_funciones() {
    console.log("Función de exportación en desarrollo...");
}

function mostrarTooltipExcel(event, texto) {
    if (!texto || texto.trim() === "") return;
    const tooltip = document.getElementById('excelTooltipGlobal');
    if (!tooltip) return;
    tooltip.textContent = texto;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 12) + 'px';
    tooltip.style.top = (event.pageY + 12) + 'px';
}

function ocultarTooltipExcel() {
    const tooltip = document.getElementById('excelTooltipGlobal');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}