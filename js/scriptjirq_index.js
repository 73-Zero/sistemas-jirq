import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuracion segura de conexion con Firebase Realtime Database
const firebaseConfig = {
    apiKey: "AIzaSyDmM8-8C3fxkPdSY3pVgudP35mVOcGdg9E",
    authDomain: "sistemas-jirq.firebaseapp.com",
    databaseURL: "https://sistemas-jirq-default-rtdb.firebaseio.com",
    projectId: "sistemas-jirq",
    storageBucket: "sistemas-jirq.firebasestorage.app",
    messagingSenderId: "556134226398",
    appId: "1:556134226398:web:f42fde5a0a9d733b7c254f",
    measurementId: "G-0XSVPF2LRH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let correoGlobal = "";
let claveRealFirebase = "";
let intentosFallidos = 0;
let nodoEncontradoKey = "";
let usuarioDataCache = null;

// URL del Web App de Google Apps Script para notificaciones de seguridad
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxOaipfJ-Jfmm44xxTzJ5bR_rRpwZ8SFFucK1Pmqx3ywuXhmRi5yc32hindxhs62OpG/exec";

// Funcion principal que controla las fases de autenticacion, validacion y registro automatico
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const inputVal = document.getElementById('userInput').value.trim();
    const btnAction = document.getElementById('btnAction');
    const tituloHeader = document.getElementById('tituloSistema');
    const inputField = document.getElementById('userInput');
    const labelIcon = document.getElementById('inputLabelIcon');
    const btnSalirIngresar = document.getElementById('btnSalirIngresar');

    if (!inputVal) return;

    const estadoActual = btnAction.getAttribute('data-estado');

    // FASE 1: Verificacion del correo ingresado reconociendo claves Base64 o IDs directos
    if (estadoActual === "ingresar_correo") {
        correoGlobal = inputVal.toLowerCase();
        const safeEmailKey = btoa(correoGlobal).replace(/=/g, '');

        try {
            let userData = null;
            nodoEncontradoKey = "";

            // Intento 1: Buscar directamente si existe como llave Base64 (Caso Administrador)
            const refAdmin = ref(db, 'usuarios/' + safeEmailKey);
            const snapAdmin = await get(refAdmin);

            if (snapAdmin.exists()) {
                userData = snapAdmin.val();
                nodoEncontradoKey = safeEmailKey;
            } else {
                // Intento 2: Si no esta en Base64, recorrer los nodos hijos buscando coincidencia en el campo 'usuario' (Caso Invitados / Nuevos)
                const refGeneral = ref(db, 'usuarios');
                const snapGeneral = await get(refGeneral);

                if (snapGeneral.exists()) {
                    snapGeneral.forEach((childSnap) => {
                        const data = childSnap.val();
                        if (data.usuario && data.usuario.toLowerCase() === correoGlobal) {
                            userData = data;
                            nodoEncontradoKey = childSnap.key;
                        }
                    });
                }
            }

            // Si despues de ambas busquedas no se encuentra el usuario
            if (!userData || !nodoEncontradoKey) {
                intentosFallidos++;
                if (intentosFallidos >= 3) {
                    enviarAlertaCorreo("Correo inexistente bloqueado");
                    return;
                }
                inputField.value = "";
                return;
            }

            // Validar que el estado del usuario sea activo (1)
            if (userData.estado !== 1 && userData.estado !== "activo") {
                alert("Su cuenta se encuentra inactiva.");
                return;
            }

            // Guardar en cache local del script los datos del usuario hallado
            usuarioDataCache = userData;

            // Verificar si los campos clave, pais y fecha_hora estan pendientes (Usuario Nuevo)
            const esUsuarioNuevo = !userData.clave || userData.clave.trim() === "" || userData.clave === "Pendiente";

            if (esUsuarioNuevo) {
                // Generar contraseña automatica segun reglas del negocio
                const limpio = correoGlobal.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                const primeras7 = limpio.substring(0, 7);
                
                const ahora = new Date();
                const anio = ahora.getFullYear();
                const mes = String(ahora.getMonth() + 1).padStart(2, '0');
                const dia = String(ahora.getDate()).padStart(2, '0');
                const hora = String(ahora.getHours()).padStart(2, '0');
                const minuto = String(ahora.getMinutes()).padStart(2, '0');
                const fechaHoraStr = `${anio}${mes}${dia}${hora}${minuto}`;
                
                const especiales = ['!', '@', '#', '$', '%', '&', '*'];
                const charAzar = especiales[Math.floor(Math.random() * especiales.length)];
                
                const claveAutogenerada = `${primeras7}_${fechaHoraStr}${charAzar}`;
                
                // Obtener pais mediante geolocalizacion por IP publica
                let paisDetectado = "Peru";
                try {
                    const ipResponse = await fetch('https://ipapi.co/json/');
                    const ipData = await ipResponse.json();
                    if (ipData && ipData.country_name) {
                        paisDetectado = ipData.country_name;
                    }
                } catch (e) {
                    console.error("Error al obtener ubicacion por IP:", e);
                }

                const fechaHoraGlobalRegistro = ahora.toISOString();

                // Actualizar automaticamente en Firebase el nodo correspondiente
                await update(ref(db, 'usuarios/' + nodoEncontradoKey), {
                    clave: claveAutogenerada,
                    pais: paisDetectado,
                    fecha_hora: fechaHoraGlobalRegistro
                });

                // Actualizar cache con la clave recien generada
                usuarioDataCache.clave = claveAutogenerada;

                // Cambiar interfaz a modo Contraseña Autogenerada y boton Copiar
                inputField.value = claveAutogenerada;
                inputField.type = "text";
                tituloHeader.textContent = "Contraseña autogenerada";
                btnAction.setAttribute('data-estado', "copiar_clave");
                btnAction.querySelector('span').textContent = "Copiar";

                // Cambiar boton inferior de Salir a Ingresar
                btnSalirIngresar.querySelector('span').textContent = "Ingresar";
                btnSalirIngresar.onclick = reiniciarInicio;

                labelIcon.innerHTML = '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>';
                return;
            }

            // Si el usuario ya cuenta con todos sus datos registrados, solicitar contraseña
            claveRealFirebase = userData.clave;

            inputField.value = "";
            inputField.type = "password";
            inputField.placeholder = "Ingrese su contraseña";
            tituloHeader.textContent = "Ingrese su Contraseña";
            btnAction.setAttribute('data-estado', "ingresar_clave");
            
            labelIcon.innerHTML = '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>';

        } catch (error) {
            console.error("Error en conexion con Firebase:", error);
        }
    } 
    // FASE 2: Accion de copiar la contraseña autogenerada al portapapeles
    else if (estadoActual === "copiar_clave") {
        navigator.clipboard.writeText(inputField.value);
        alert("¡Contraseña copiada al portapapeles!");
    }
    // FASE 3: Validacion de la contraseña ingresada para permitir acceso al tablero
    else if (estadoActual === "ingresar_clave") {
        if (inputVal === claveRealFirebase) {
            // Guardar datos de sesion del usuario autenticado para consumo del tablero
            const idUsuario = usuarioDataCache.id || "invitado";
            const esAdmin = (idUsuario.toLowerCase() === "admin");

            sessionStorage.setItem("usuario_sesion_id", idUsuario);
            sessionStorage.setItem("usuario_sesion_admin", esAdmin ? "true" : "false");
            sessionStorage.setItem("usuario_sesion_permisos", JSON.stringify(usuarioDataCache.permisos || {}));

            window.location.href = "tablero.html";
        } else {
            intentosFallidos++;
            if (intentosFallidos >= 3) {
                enviarAlertaCorreo("Bloqueo por 3 intentos fallidos de contraseña");
                return;
            }
            inputField.value = "";
            inputField.focus();
        }
    }
}

// Funcion para restablecer el formulario a su estado inicial de ingreso de correo
function reiniciarInicio() {
    const inputField = document.getElementById('userInput');
    const btnAction = document.getElementById('btnAction');
    const tituloHeader = document.getElementById('tituloSistema');
    const labelIcon = document.getElementById('inputLabelIcon');
    const btnSalirIngresar = document.getElementById('btnSalirIngresar');

    inputField.value = "";
    inputField.type = "text";
    inputField.placeholder = "Ingrese su correo";
    tituloHeader.textContent = "Sistema de Acceso";
    btnAction.setAttribute('data-estado', "ingresar_correo");
    btnAction.querySelector('span').textContent = "Continuar";

    btnSalirIngresar.querySelector('span').textContent = "Salir";
    btnSalirIngresar.onclick = () => window.close();

    labelIcon.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>';
    intentosFallidos = 0;
}

// Funcion para envio de alertas de seguridad y registro de IP publica
async function enviarAlertaCorreo(motivo) {
    bloquearSistema();
    
    let ipPublica = "Desconocida";
    let ciudad = "Desconocida";
    let region = "Desconocida";
    let pais = "Desconocido";
    let googleMapsLink = "No disponible";
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.ip) {
            ipPublica = data.ip;
            ciudad = data.city || 'Desconocida';
            region = data.region || 'Desconocida';
            if (data.country_name) pais = data.country_name;
            
            const lat = data.latitude;
            const lon = data.longitude;
            if (lat && lon) {
                googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
            }
        }
    } catch (e) {
        console.error("No se pudo obtener la IP:", e);
    }

    const payload = {
        correo: correoGlobal || 'No ingresado',
        motivo: motivo,
        ip: ipPublica,
        region: `${ciudad}, ${region}`,
        pais: pais,
        maps: googleMapsLink,
        fecha: new Date().toLocaleString()
    };

    try {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Error al enviar alerta:", err);
    }
}

// Bloqueo visual y funcional total de la interfaz ante fallos de seguridad
function bloquearSistema() {
    document.body.classList.add('bloqueado-gris');
    document.documentElement.classList.add('bloqueado-gris');
    
    const loginCard = document.querySelector('.login-card');
    if (loginCard) loginCard.classList.add('tarjeta-bloqueada');
    
    const inputField = document.getElementById('userInput');
    const btnAction = document.getElementById('btnAction');
    if (inputField) {
        inputField.disabled = true;
        inputField.value = "";
    }
    if (btnAction) {
        btnAction.disabled = true;
        btnAction.style.opacity = "0.4";
        btnAction.style.cursor = "not-allowed";
    }
}

// Detector de cambio de pestana del navegador para mostrar mensaje personalizado
const tituloOriginalIndex = document.title;
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Te espero aqui";
    } else {
        document.title = tituloOriginalIndex;
    }
});