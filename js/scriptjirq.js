import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
let paisFirebase = "";

// URL DE TU GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxOaipfJ-Jfmm44xxTzJ5bR_rRpwZ8SFFucK1Pmqx3ywuXhmRi5yc32hindxhs62OpG/exec";

window.handleLogin = async function(event) {
    event.preventDefault();
    
    const inputVal = document.getElementById('userInput').value.trim();
    const btnAction = document.getElementById('btnAction');
    const tituloHeader = document.getElementById('tituloSistema');
    const inputField = document.getElementById('userInput');
    const labelIcon = document.getElementById('inputLabelIcon');

    if (!inputVal) return;

    // FASE 1: Verificar el Correo
    if (btnAction.getAttribute('data-estado') === "ingresar_correo") {
        correoGlobal = inputVal.toLowerCase();

        try {
            const safeEmailKey = btoa(correoGlobal).replace(/=/g, '');
            const userRef = ref(db, 'usuarios/' + safeEmailKey);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                intentosFallidos++;
                if (intentosFallidos >= 3) {
                    enviarAlertaCorreo("Correo inexistente bloqueado");
                    return;
                }
                inputField.value = "";
                return;
            }

            const userData = snapshot.val();
            paisFirebase = userData.pais || "No registrado";

            if (userData.estado !== 1 && userData.estado !== "activo") {
                return;
            }

            // Guardamos la clave real de Firebase
            claveRealFirebase = userData.clave;

            // CAMBIO DE MÁSCARA: Transicionar a ingresar contraseña
            inputField.value = "";
            inputField.type = "password";
            inputField.placeholder = "Ingrese su contraseña";
            tituloHeader.textContent = "Ingrese su Contraseña";
            btnAction.setAttribute('data-estado', "ingresar_clave");
            
            // Cambiar icono a candado
            labelIcon.innerHTML = '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>';

        } catch (error) {
            console.error("Error:", error);
        }
    } 
    // FASE 2: Verificar la Contraseña
    else if (btnAction.getAttribute('data-estado') === "ingresar_clave") {
        if (inputVal === claveRealFirebase) {
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

// FUNCIÓN PARA OBTENER IP, UBICACIÓN Y ENVIAR ALERTA A GMAIL VÍA SCRIPT
async function enviarAlertaCorreo(motivo) {
    bloquearSistema();
    
    let ipPublica = "Desconocida";
    let ciudad = "Desconocida";
    let region = "Desconocida";
    let pais = paisFirebase || "Desconocido";
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

    const fechaHoraActual = new Date().toLocaleString();
    
    const payload = {
        correo: correoGlobal || 'No ingresado',
        motivo: motivo,
        ip: ipPublica,
        region: `${ciudad}, ${region}`,
        pais: pais,
        maps: googleMapsLink,
        fecha: fechaHoraActual
    };

    try {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Error al enviar la alerta al servidor de Google:", err);
    }
}

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

// 4. DETECTOR DE CAMBIO DE PESTAÑA (VISIBILITY CHANGE)
const tituloOriginal = document.title;
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Vuelve Pronto 😩👐";
    } else {
        document.title = tituloOriginal;
    }
});