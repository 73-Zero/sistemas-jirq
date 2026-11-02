/* ========================================================================== */
/* MÓDULO LISTADO DE FUNCIONES: LÓGICA Y FIREBASE EN TIEMPO REAL             */
/* ========================================================================== */

let filaActivaSubidaKey_lis_funciones = null;
let ordenActivoSubida_lis_funciones = null;

// Función para abrir el modal de listado de funciones desde el tablero
function abrirModal_lis_funciones(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
        cargarFuncionesDesdeFirebase_lis_funciones();
    }
}

// Función para cerrar el modal
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

        const keysOrdenadas = Object.keys(data).sort((a, b) => {
            const ordenA = data[a].orden !== undefined ? data[a].orden : 9999;
            const ordenB = data[b].orden !== undefined ? data[b].orden : 9999;
            return ordenA - ordenB;
        });

        let contadorVisual = 1; // Numeración estricta desde 1

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
            const numeroOrdenReal = contadorVisual++; 

            const tr = document.createElement('tr');
            tr.setAttribute('draggable', 'true');
            tr.dataset.firebaseKey = firebaseKey;

            // Eventos de arrastrar y reordenar (Drag & Drop)
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

            // Lógica de guardado al salir completamente de la fila
            tr.addEventListener('focusout', (e) => {
                if (!tr.contains(e.relatedTarget)) {
                    guardarFilaCompleta_lis_funciones(tr, firebaseKey);
                }
            });

            // Botón de subir o ver el archivo existente (Izquierda)
            let botonArchivoHTML = '';
            if (func.archivo_url) {
                botonArchivoHTML = `<a href="${func.archivo_url}" target="_blank" class="btn-subir-archivo_lis_funciones" title="Ver archivo en el navegador">📎</a>`;
            } else {
                botonArchivoHTML = `<button type="button" class="btn-subir-archivo_lis_funciones" onclick="dispararSelectorArchivo_lis_funciones('${firebaseKey}', ${numeroOrdenReal})" title="Subir archivo (.xlsx, .docx, .pdf, .jpg)">📁</button>`;
            }

            // Botón de descarga en el medio (Fuerza la descarga directa en Windows y macOS)
            let botonDescargaHTML = '';
            if (func.archivo_url && func.archivo_url.trim() !== "") {
                // Insertamos 'fl_attachment' en la URL de Cloudinary para que el navegador entienda que es una descarga obligatoria
                let urlDescargaForzada = func.archivo_url;
                if (urlDescargaForzada.includes('/upload/')) {
                    urlDescargaForzada = urlDescargaForzada.replace('/upload/', '/upload/fl_attachment/');
                }

                botonDescargaHTML = `<a href="${urlDescargaForzada}" download="${func.archivo_nombre || 'archivo.xlsx'}" class="btn-subir-archivo_lis_funciones" title="Descargar: ${func.archivo_nombre || 'Archivo'}">⬇️</a>`;
            } else {
                botonDescargaHTML = `<button type="button" class="btn-subir-archivo_lis_funciones" disabled style="opacity: 0.4; cursor: not-allowed;" title="No hay archivo adjunto para descargar">⬇️</button>`;
            }

            tr.innerHTML = `
                <td style="cursor: grab; text-align:center;" title="Arrastrar para mover posición">⋮⋮</td>
                <td style="color: #64748b; font-weight: 500;">${numeroOrdenReal}</td>
                <td>
                    <input type="text" data-campo="nombre" value="${nombreVal}" 
                           onmouseenter="mostrarTooltipExcel(event, '${nombreVal.replace(/'/g, "\\'")}')" 
                           onmouseleave="ocultarTooltipExcel()">
                </td>
                <td><input type="text" data-campo="plat_inicial" value="${func.plat_inicial || func.plataforma_inicial || ''}"></td>
                <td><input type="text" data-campo="plat_final" value="${func.plat_final || func.plataforma_final || ''}"></td>
                
                <td><input type="text" data-campo="t_8_9" style="text-align:center;" value="${formatearCheck(func.t_8_9 || func.h_8_9)}" onblur="procesarEscrituraCheck_lis_funciones(this)"></td>
                <td><input type="text" data-campo="t_10_11" style="text-align:center;" value="${formatearCheck(func.t_10_11 || func.h_10_11)}" onblur="procesarEscrituraCheck_lis_funciones(this)"></td>
                <td><input type="text" data-campo="t_12_1" style="text-align:center;" value="${formatearCheck(func.t_12_1 || func.h_12_1)}" onblur="procesarEscrituraCheck_lis_funciones(this)"></td>
                <td><input type="text" data-campo="t_2_3" style="text-align:center;" value="${formatearCheck(func.t_2_3 || func.h_2_3)}" onblur="procesarEscrituraCheck_lis_funciones(this)"></td>
                <td><input type="text" data-campo="t_4_5" style="text-align:center;" value="${formatearCheck(func.t_4_5 || func.h_4_5)}" onblur="procesarEscrituraCheck_lis_funciones(this)"></td>

                <td><input type="text" data-campo="funcion" value="${func.funcion || ''}"></td>
                <td>
                    <input type="text" data-campo="detalle" value="${detalleVal}" 
                           onmouseenter="mostrarTooltipExcel(event, '${detalleVal.replace(/'/g, "\\'")}')" 
                           onmouseleave="ocultarTooltipExcel()">
                </td>
                <td>
                    <select class="select-estado-excel_lis_funciones" data-campo="estado">
                        <option value="Activo" ${func.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                        <option value="Inactivo" ${func.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </td>
                <td><input type="text" data-campo="dias" value="${func.dias || ''}"></td>
                <td>
                    <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
                        ${botonArchivoHTML}
                        ${botonDescargaHTML}
                        <button type="button" class="btn-eliminar-fila_lis_funciones" onclick="confirmarEliminarFuncion_lis_funciones('${firebaseKey}')" title="Eliminar Fila">✕</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function guardarFilaCompleta_lis_funciones(trElemento, firebaseKey) {
    const inputs = trElemento.querySelectorAll('input[data-campo], select[data-campo]');
    const datosActualizados = {};

    inputs.forEach(input => {
        const campo = input.dataset.campo;
        datosActualizados[campo] = input.value;
    });

    firebase.database().ref('funciones/' + firebaseKey).update(datosActualizados).catch(error => {
        console.error("Error al actualizar la fila: ", error);
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

function procesarEscrituraCheck_lis_funciones(inputElement) {
    const val = inputElement.value.trim().toLowerCase();
    if (val === '1' || val === 'true' || val === '✓' || val === '✔' || val === '✅') {
        inputElement.value = '✅';
    } else if (val !== '✅') {
        inputElement.value = '';
    }
}

function agregarNuevaFilaFuncion_lis_funciones() {
    const dbRef = firebase.database().ref('funciones');
    dbRef.once('value', (snapshot) => {
        const data = snapshot.val();
        
        let nuevoOrden = 0;
        if (data) {
            const keys = Object.keys(data);
            const ordenesExistentes = keys.map(k => data[k].orden !== undefined ? data[k].orden : 0);
            const minOrden = Math.min(...ordenesExistentes);
            nuevoOrden = minOrden - 1; 
        }

        const nuevaFuncion = {
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
            dias: "",
            orden: nuevoOrden
        };

        dbRef.push(nuevaFuncion).then(() => {
            setTimeout(() => {
                const primeraFilaInput = document.querySelector('#cuerpoTablaFunciones_lis_funciones tr td:nth-child(3) input[type="text"]');
                if (primeraFilaInput) {
                    primeraFilaInput.focus();
                }
            }, 300);
        }).catch(error => {
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
/* MÓDULO DE SUBIDA DE ARCHIVOS ADAPTADO A CLOUDINARY (SIN TARJETA)           */
/* ========================================================================== */

function dispararSelectorArchivo_lis_funciones(firebaseKey, numeroOrden) {
    filaActivaSubidaKey_lis_funciones = firebaseKey;
    ordenActivoSubida_lis_funciones = numeroOrden;
    const inputOculto = document.getElementById('inputArchivoOculto_lis_funciones');
    if (inputOculto) {
        inputOculto.value = ''; 
        inputOculto.click(); 
    }
}

async function procesarSubidaArchivo_lis_funciones(inputElement) {
    const archivo = inputElement.files[0];
    if (!archivo || !filaActivaSubidaKey_lis_funciones) return;

    const firebaseKey = filaActivaSubidaKey_lis_funciones;
    const modalCarga = document.getElementById('modalCargaSubida_lis_funciones');
    const barraProgreso = document.getElementById('barraProgresoSubida_lis_funciones');
    const textoPorcentaje = document.getElementById('textoPorcentajeCarga_lis_funciones');
    
    if (modalCarga) modalCarga.style.display = 'flex';
    if (barraProgreso) barraProgreso.style.width = '30%';
    if (textoPorcentaje) textoPorcentaje.textContent = `Subiendo "${archivo.name}" a Cloudinary...`;

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "preset_sistema_jirq"); // Tu preset sin firmar

    try {
        if (barraProgreso) barraProgreso.style.width = '60%';

        const respuesta = await fetch("https://api.cloudinary.com/v1_1/q44rf4mr/auto/upload", {
            method: "POST",
            body: formData
        });

        const datos = await respuesta.json();

        if (datos.secure_url) {
            if (barraProgreso) barraProgreso.style.width = '100%';
            
            await firebase.database().ref('funciones/' + firebaseKey).update({
                archivo_url: datos.secure_url,
                archivo_nombre: archivo.name
            });

            setTimeout(() => {
                if (modalCarga) modalCarga.style.display = 'none';
                filaActivaSubidaKey_lis_funciones = null;
            }, 500);

        } else {
            throw new Error(datos.error?.message || "Error al procesar la subida.");
        }

    } catch (error) {
        console.error("Error en subida:", error);
        if (modalCarga) modalCarga.style.display = 'none';
        alert("No se pudo subir el archivo: " + error.message);
    }
}

function cancelarSubidaArchivo_lis_funciones() {
    const modalCarga = document.getElementById('modalCargaSubida_lis_funciones');
    if (modalCarga) {
        modalCarga.style.display = 'none';
    }
    const inputOculto = document.getElementById('inputArchivoOculto_lis_funciones');
    if (inputOculto) {
        inputOculto.value = '';
    }
    filaActivaSubidaKey_lis_funciones = null;
    console.log("Subida cancelada por el usuario.");
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
        // Si la fila está oculta por el buscador o filtros, la ignoramos
        if (fila.style.display === 'none') return;
        
        const cols = fila.querySelectorAll('th, td');
        let filaDatos = [];

        cols.forEach((col, cIdx) => {
            // Omitimos la primera columna de arrastrar (::) y la última de acciones
            if (cIdx === 0 || cIdx === cols.length - 1) return;

            let texto = "";
            const input = col.querySelector('input[type="text"]');
            const select = col.querySelector('select');

            if (input) {
                texto = input.value;
                // Si es una columna de horario (checks), asegurémonos de exportarla limpia con el icono si está marcada
                if (cIdx >= 5 && cIdx <= 9) {
                    const v = texto.trim().toLowerCase();
                    if (v === '1' || v === 'true' || v === '✓' || v === '✔' || v === '✅') {
                        texto = '✅';
                    } else {
                        texto = '';
                    }
                }
            } else if (select) {
                texto = select.value;
            } else {
                texto = col.innerText;
            }

            // Limpiamos comillas dobles para evitar romper el formato CSV
            texto = texto.replace(/"/g, '""');
            filaDatos.push(`"${texto}"`);
        });

        csv.push(filaDatos.join(","));
    });

    // Creamos el archivo con codificación UTF-8 y extensión .csv (compatible perfectamente con Excel)
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