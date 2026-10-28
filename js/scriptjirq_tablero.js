function abrirModal(idModal) {
    document.getElementById(idModal).style.display = 'flex';
    filtrarTabla();
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
        <td><span class="drag-handle" title="Arrastrar para mover">⠿</span></td>
        <td><a href="#" onclick="abrirTutorial(${totalFilas}); return false;" style="color:#7c3aed; font-weight:bold;">${totalFilas}</a></td>
        <td><input type="text" class="highlight-new" placeholder="Escribe la función aquí..." onkeyup="filtrarTabla()"></td>
        <td><input type="text" placeholder="Plat. Inicial"></td>
        <td><input type="text" placeholder="Plat. Final"></td>
        <td><input type="text" class="input-turn" value="" onkeyup="evaluarTurno(this)"></td>
        <td><input type="text" class="input-turn" value="" onkeyup="evaluarTurno(this)"></td>
        <td><input type="text" class="input-turn" value="" onkeyup="evaluarTurno(this)"></td>
        <td><input type="text" class="input-turn" value="" onkeyup="evaluarTurno(this)"></td>
        <td><input type="text" class="input-turn" value="" onkeyup="evaluarTurno(this)"></td>
        <td><input type="text" placeholder="Función"></td>
        <td><input type="text" placeholder="Detalle"></td>
        <td>
            <select class="select-estado" onchange="filtrarTabla()">
                <option value="activo" selected>Activo</option>
                <option value="inactivo">Inactivo</option>
            </select>
        </td>
        <td><input type="text" placeholder="Días"></td>
        <td><button class="delete-row-btn" onclick="eliminarFila(this)">✕</button></td>
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

// DETECTOR DE CAMBIO DE PESTAÑA CON MENSAJE PERSONALIZADO
const tituloOriginalTablero = document.title;
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Te espero aqui 🥺​🤲​";
    } else {
        document.title = tituloOriginalTablero;
    }
});