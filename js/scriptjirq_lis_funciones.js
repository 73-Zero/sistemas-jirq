/* ========================================================================== */
/* MÓDULO LISTADO DE FUNCIONES: LÓGICA Y FIREBASE EN TIEMPO REAL             */
/* ========================================================================== */

let filaActivaSubidaKey_lis_funciones = null;
let ordenActivoSubida_lis_funciones = null;

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

    dbRef.orderByChild('orden').on('value', (snapshot) => {
        tbody.innerHTML = '';
        const data = snapshot.val();
        if (!data) {
            tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:20px; color:#64748b; font-family:'Roboto',sans-serif;">No hay funciones registradas. Haga clic en "+ Nueva Función" para comenzar.</td></tr>`;
            return;
        }

        let contador = 1;
        const keysOrdenadas = Object.keys(data).sort((a, b) => {
            const ordenA = data[a].orden !== undefined ? data[a].orden : 9999;
            const ordenB = data[b].orden !== undefined ? data[b].orden : 9999;
            return ordenA - ordenB;
        });

        keysOrdenadas.forEach(firebaseKey => {
            const func = data[firebaseKey];

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
            const numeroOrdenReal = (func.orden !== undefined) ? (func.orden + 1) : contador++;

            const tr = document.createElement('tr');
            tr.setAttribute('draggable', 'true');
            tr.dataset.firebaseKey = firebaseKey;

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

            // Definir botón de archivo adjunto (si ya tiene archivo subido, se muestra diferente o con enlace directo)
            let botonArchivoHTML = '';
            if (func.archivo_url) {
                botonArchivoHTML = `<a href="${func.archivo_url}" target="_blank" class="btn-subir-archivo_lis_funciones" title="Ver/Descargar archivo: ${func.archivo_nombre || 'Manual'}">📎</a>`;
            } else {
                botonArchivoHTML = `<button type="button" class="btn-subir-archivo_lis_funciones" onclick="dispararSelectorArchivo_lis_funciones('${firebaseKey}', ${numeroOrdenReal})" title="Subir archivo (.xlsx, .docx, .pdf, .jpg)">📁</button>`;
            }

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
                    <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
                        ${botonArchivoHTML}
                        <button type="button" class="btn-eliminar-fila_lis_funciones" onclick="confirmarEliminarFuncion_lis_funciones('${firebaseKey}')" title="Eliminar Fila">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function actualizarDatoFuncion_lis_funciones(firebaseKey, campo, valor) {
    firebase.database().ref('funciones/' + firebaseKey).update({
        [campo]: valor
    }).catch(error => {
        console.error("Error al actualizar campo: ", error);
    });
}

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

function procesarEscrituraCheck_lis_funciones(inputElement, firebaseKey, campoHorario) {
    const val = inputElement.value.trim().toLowerCase();
    let valorAGuardar = '';

    if (val === '1' || val === 'true' || val === '✓' || val === '✔' || val === '✅') {
        inputElement.value = '✅';
        valorAGuardar = '✅';
    } else {
        inputElement.value = '';
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
            orden: totalItems
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

/* ========================================================================== */
/* LÓGICA DE SUBIDA DE ARCHIVOS A FIREBASE STORAGE (REEMPLAZO AUTOMÁTICO)      */
/* ========================================================================== */

function dispararSelectorArchivo_lis_funciones(firebaseKey, numeroOrden) {
    filaActivaSubidaKey_lis_funciones = firebaseKey;
    ordenActivoSubida_lis_funciones = numeroOrden;
    const inputOculto = document.getElementById('inputArchivoOculto_lis_funciones');
    if (inputOculto) {
        inputOculto.value = ''; // Limpiar para permitir re-seleccionar el mismo archivo
        inputOculto.click(); // Abre carpetas de la laptop
    }
}

function procesarSubidaArchivo_lis_funciones(inputElement) {
    const archivo = inputElement.files[0];
    if (!archivo || !filaActivaSubidaKey_lis_funciones) return;

    const firebaseKey = filaActivaSubidaKey_lis_funciones;
    const numeroOrden = ordenActivoSubida_lis_funciones;

    // Mostrar modal de carga
    const modalCarga = document.getElementById('modalCargaSubida_lis_funciones');
    const barraProgreso = document.getElementById('barraProgresoSubida_lis_funciones');
    const textoPorcentaje = document.getElementById('textoPorcentajeCarga_lis_funciones');
    
    if (modalCarga) modalCarga.style.display = 'flex';
    if (barraProgreso) barraProgreso.style.width = '0%';
    if (textoPorcentaje) textoPorcentaje.textContent = `Iniciando subida de "${archivo.name}"... (0%)`;

    // Ruta en Firebase Storage: manuales_funciones/funcion_01.ext (Reemplaza automáticamente si ya existe)
    const extension = archivo.name.split('.').pop().toLowerCase();
    const rutaStorage = `manuales_funciones/funcion_${numeroOrden}.${extension}`;
    const storageRef = firebase.storage().ref().child(rutaStorage);

    const uploadTask = storageRef.put(archivo);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progreso = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (barraProgreso) barraProgreso.style.width = progreso + '%';
            if (textoPorcentaje) textoPorcentaje.textContent = `Subiendo archivo... (${progreso}%)`;
        },
        (error) => {
            if (modalCarga) modalCarga.style.display = 'none';
            alert("Error al subir el archivo: " + error.message);
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                firebase.database().ref('funciones/' + firebaseKey).update({
                    archivo_url: downloadURL,
                    archivo_nombre: archivo.name
                }).then(() => {
                    if (modalCarga) modalCarga.style.display = 'none';
                    // Al terminar se cierra solito y vuelve al listado
                });
            });
        }
    );
}

function filtrarFuncionesTabla_lis_funciones() {
    const buscadorInput = document.getElementById('buscadorFunciones_lis_funciones');
    const estadoSelect = document.getElementById('filtroEstadoFunciones_lis_funciones');
    
    const filtroTexto = buscadorInput ? buscadorInput.value.toLowerCase().trim() : '';
    const filtroEstado = estadoSelect ? estadoSelect.value : '';
    
    const filas = document.querySelectorAll('#cuerpoTablaFunciones_lis_funciones tr');

    filas.forEach(fila => {
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
    const tabla = document.getElementById('tablaFunciones_lis_funciones');
    if (!tabla) return;

    let csv = [];
    const filas = tabla.querySelectorAll('tr');

    filas.forEach((fila, idx) => {
        if (fila.style.display === 'none') return; // Omitir filtrados ocultos
        const cols = fila.querySelectorAll('th, td');
        let filaDatos = [];

        cols.forEach((col, cIdx) => {
            // Omitir la primera columna (arrastre ::) y última columna (Acciones)
            if (cIdx === 0 || cIdx === cols.length - 1) return;

            let texto = "";
            const input = col.querySelector('input[type="text"]');
            const select = col.querySelector('select');

            if (input) {
                texto = input.value;
            } else if (select) {
                texto = select.value;
            } else {
                texto = col.innerText;
            }

            // Limpiar comillas y saltos
            texto = texto.replace(/"/g, '""');
            filaDatos.push(`"${texto}"`);
        });

        csv.push(filaDatos.join(","));
    });

    const csvBlob = new Blob(["\ufeff" + csv.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Listado_Funciones_KIWOX_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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