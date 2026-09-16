/* ============================================================
   NEXVORA CORE
   Motor principal del sistema
   Arquitectura: Usuario → NEXVORA → Autorización → Acción
   ============================================================ */

"use strict";

/* ============================================================
   ESTADO PRINCIPAL
   ============================================================ */

const sistema = {
    estado: "ACTIVO",
    modo: "ASISTIDO",

    energia: 100,
    estabilidad: 100,
    errores: 0,
    tareas: 0,

    prioridad: "BAJA",
    nivelIA: 1,

    memoriaUso: 0,
    cpuUso: 0,

    ultimaRevision: "--:--:--",
    diagnostico: "Sistema iniciando...",

    accionPendiente: null
};


/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

const configuracion = {

    inicioAutomatico: true,
    guardadoAutomatico: true,

    frecuenciaRevision: 5,
    capacidadMemoria: 100,

    aprendizajeActivo: true,

    tema: "oscuro",
    modoSeguro: false,

    permisos: {
        diagnostico: true,
        optimizacion: true,
        procesos: true,
        configuracion: false,
        memoria: false
    }
};


/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

const estadisticas = {

    tiempoActivo: 0,
    revisiones: 0,
    decisiones: 0,
    erroresDetectados: 0,
    correcciones: 0,
    aprendizajes: 0,

    tareasCompletadas: 0,
    accionesEjecutadas: 0,
    procesosEjecutados: 0,
    cambiosRealizados: 0
};


/* ============================================================
   VARIABLES DEL MOTOR
   ============================================================ */

let intervaloPrincipal = null;
let intervaloTiempo = null;

let sesionActual = null;

let procesos = [];
let tareas = [];

let terminalHistorial = [];


/* ============================================================
   REFERENCIAS DOM
   ============================================================ */

const $ = (id) => document.getElementById(id);


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

document.addEventListener("DOMContentLoaded", iniciarNexvora);


function iniciarNexvora() {

    cargarDatosGuardados();

    configurarNavegacion();

    configurarModos();

    configurarControles();

    configurarTerminal();

    configurarConfiguracion();

    iniciarSesion();

    actualizarInterfaz();

    escribirTerminal(
        "[NEXVORA] CORE ONLINE",
        "system"
    );

    escribirTerminal(
        "[NEXVORA] MODO " + sistema.modo,
        "system"
    );

    escribirTerminal(
        "[NEXVORA] ESPERANDO INSTRUCCIÓN DEL OPERADOR...",
        "system"
    );

    registrarEvento(
        "SYSTEM",
        "NEXVORA iniciado correctamente."
    );

    iniciarReloj();

    if (configuracion.inicioAutomatico) {
        iniciarMotor();
    }
}


/* ============================================================
   NAVEGACIÓN
   ============================================================ */

function configurarNavegacion() {

    const botones = document.querySelectorAll(".nav-button");

    botones.forEach((boton) => {

        boton.addEventListener("click", () => {

            const destino = boton.dataset.section;

            document
                .querySelectorAll(".nav-button")
                .forEach(btn => btn.classList.remove("active"));

            document
                .querySelectorAll(".page-section")
                .forEach(section => section.classList.remove("active"));

            boton.classList.add("active");

            const seccion = $(destino);

            if (seccion) {
                seccion.classList.add("active");
            }

        });

    });
}


/* ============================================================
   MODOS OPERATIVOS
   ============================================================ */

function configurarModos() {

    const botones = document.querySelectorAll(".mode-button");

    botones.forEach((boton) => {

        boton.addEventListener("click", () => {

            const nuevoModo = boton.dataset.mode;

            cambiarModo(nuevoModo);

        });

    });
}


function cambiarModo(nuevoModo) {

    const modosPermitidos = [
        "MANUAL",
        "ASISTIDO",
        "AUTOMATICO",
        "SEGURO",
        "EMERGENCIA"
    ];

    if (!modosPermitidos.includes(nuevoModo)) {
        return;
    }

    const anterior = sistema.modo;

    sistema.modo = nuevoModo;

    configuracion.modoSeguro =
        nuevoModo === "SEGURO";


    document
        .querySelectorAll(".mode-button")
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.mode === nuevoModo
            );

        });


    const descripcion = document.querySelector(".mode-description");

    if (descripcion) {

        const mensajes = {

            MANUAL:
                "NEXVORA espera instrucciones directas del operador.",

            ASISTIDO:
                "NEXVORA analiza y recomienda. El operador autoriza las acciones.",

            AUTOMATICO:
                "NEXVORA puede ejecutar acciones previamente autorizadas.",

            SEGURO:
                "Las acciones sensibles requieren autorización del operador.",

            EMERGENCIA:
                "Procesos limitados. Prioridad máxima a la estabilización."
        };

        descripcion.textContent =
            mensajes[nuevoModo] || "";
    }


    registrarCambio(
        "modo",
        anterior,
        nuevoModo,
        "USUARIO"
    );

    registrarEvento(
        "MODE",
        `Modo cambiado: ${anterior} → ${nuevoModo}`
    );

    escribirTerminal(
        `[NEXVORA] MODO CAMBIADO A ${nuevoModo}`,
        "system"
    );

    actualizarInterfaz();
}


/* ============================================================
   CONTROLES PRINCIPALES
   ============================================================ */

function configurarControles() {

    if ($("btnDiagnostico")) {

        $("btnDiagnostico").addEventListener(
            "click",
            () => solicitarAccion("DIAGNOSTICO")
        );

    }


    if ($("btnAnalizar")) {

        $("btnAnalizar").addEventListener(
            "click",
            () => analizarSistema(true)
        );

    }


    if ($("btnOptimizar")) {

        $("btnOptimizar").addEventListener(
            "click",
            () => solicitarAccion("OPTIMIZACION")
        );

    }


    if ($("btnNuevaTarea")) {

        $("btnNuevaTarea").addEventListener(
            "click",
            crearTareaDesdeUsuario
        );

    }


    if ($("btnDetener")) {

        $("btnDetener").addEventListener(
            "click",
            detenerProcesos
        );

    }


    if ($("btnAutorizar")) {

        $("btnAutorizar").addEventListener(
            "click",
            autorizarAccion
        );

    }


    if ($("btnCancelar")) {

        $("btnCancelar").addEventListener(
            "click",
            cancelarAccion
        );

    }


    if ($("btnCrearProceso")) {

        $("btnCrearProceso").addEventListener(
            "click",
            abrirModalProceso
        );

    }


    if ($("closeProcessModal")) {

        $("closeProcessModal").addEventListener(
            "click",
            cerrarModalProceso
        );

    }


    if ($("cancelProcess")) {

        $("cancelProcess").addEventListener(
            "click",
            cerrarModalProceso
        );

    }


    if ($("processForm")) {

        $("processForm").addEventListener(
            "submit",
            crearProceso
        );

    }


    if ($("limpiarLog")) {

        $("limpiarLog").addEventListener(
            "click",
            limpiarVistaLog
        );

    }
}


/* ============================================================
   MOTOR PRINCIPAL
   ============================================================ */

function iniciarMotor() {

    detenerMotor();

    const segundos = Math.max(
        1,
        Number(configuracion.frecuenciaRevision) || 5
    );


    intervaloPrincipal = setInterval(
        cicloPrincipal,
        segundos * 1000
    );

}


function detenerMotor() {

    if (intervaloPrincipal) {

        clearInterval(intervaloPrincipal);

        intervaloPrincipal = null;
    }
}


function cicloPrincipal() {

    revisarSistema();

    actualizarInterfaz();

    guardarDatos();

}


/* ============================================================
   REVISIÓN
   ============================================================ */

function revisarSistema() {

    estadisticas.revisiones++;

    sistema.ultimaRevision =
        obtenerHora();


    revisarEnergia();

    revisarEstabilidad();

    revisarErrores();


    if (sistema.estabilidad < 30) {

        sistema.prioridad = "ALTA";

    } else if (sistema.estabilidad < 60) {

        sistema.prioridad = "MEDIA";

    } else {

        sistema.prioridad = "BAJA";
    }


    registrarRevision({
        energia: sistema.energia,
        estabilidad: sistema.estabilidad,
        errores: sistema.errores
    });


    registrarEvento(
        "REVISION",
        "Revisión automática completada."
    );
}


/* ============================================================
   ENERGÍA
   ============================================================ */

function revisarEnergia() {

    if (sistema.energia > 0) {

        sistema.energia =
            Math.max(
                0,
                sistema.energia - 1
            );
    }


    if (sistema.energia < 20) {

        registrarEvento(
            "WARNING",
            "Nivel de energía bajo."
        );

        escribirTerminal(
            "[WARNING] ENERGÍA BAJA",
            "warning"
        );


        if (
            sistema.modo === "AUTOMATICO" &&
            configuracion.permisos.optimizacion
        ) {

            solicitarAccion("AHORRO_ENERGIA");
        }
    }
}


/* ============================================================
   ESTABILIDAD
   ============================================================ */

function revisarEstabilidad() {

    if (sistema.errores > 0) {

        sistema.estabilidad =
            Math.max(
                0,
                sistema.estabilidad - 1
            );

    } else if (sistema.estabilidad < 100) {

        sistema.estabilidad =
            Math.min(
                100,
                sistema.estabilidad + 0.5
            );
    }


    if (sistema.estabilidad < 40) {

        registrarEvento(
            "WARNING",
            "Estabilidad del sistema reducida."
        );
    }


    if (sistema.estabilidad <= 0) {

        sistema.estado = "INACTIVO";

        registrarEvento(
            "CRITICAL",
            "Estabilidad crítica."
        );
    }
}


/* ============================================================
   ERRORES
   ============================================================ */

function revisarErrores() {

    if (sistema.errores > 0) {

        estadisticas.erroresDetectados =
            sistema.errores;

    }

}


/* ============================================================
   ANÁLISIS
   ============================================================ */

function analizarSistema(ordenUsuario = false) {

    estadisticas.decisiones++;

    const nivelEstabilidad =
        sistema.estabilidad;

    const nivelEnergia =
        sistema.energia;

    let diagnostico = "";
    let recomendacion = "";


    if (sistema.errores > 0) {

        diagnostico =
            "Se detectaron errores pendientes.";

        recomendacion =
            "Ejecutar diagnóstico y revisar errores.";

    } else if (nivelEstabilidad < 40) {

        diagnostico =
            "Estabilidad crítica.";

        recomendacion =
            "Reducir carga del sistema.";

    } else if (nivelEnergia < 20) {

        diagnostico =
            "Nivel energético bajo.";

        recomendacion =
            "Activar protocolo de ahorro.";

    } else if (nivelEstabilidad < 70) {

        diagnostico =
            "Sistema estable con degradación moderada.";

        recomendacion =
            "Considerar una optimización.";

    } else {

        diagnostico =
            "Sistema estable.";

        recomendacion =
            "No se requiere intervención inmediata.";
    }


    sistema.diagnostico = diagnostico;


    registrarEvento(
        "ANALISIS",
        diagnostico
    );


    escribirTerminal(
        "[ANÁLISIS] " + diagnostico,
        "system"
    );


    if (ordenUsuario) {

        escribirTerminal(
            "[RECOMENDACIÓN] " + recomendacion,
            "system"
        );

    }


    actualizarInterfaz();


    return {
        diagnostico,
        recomendacion
    };
}


/* ============================================================
   SISTEMA DE ACCIONES
   ============================================================ */

function solicitarAccion(tipo) {

    const acciones = {

        DIAGNOSTICO: {
            nombre: "Ejecutar diagnóstico",
            motivo: "El operador solicitó un diagnóstico.",
            permiso: "diagnostico"
        },

        OPTIMIZACION: {
            nombre: "Optimizar sistema",
            motivo: "El operador solicitó una optimización.",
            permiso: "optimizacion"
        },

        AHORRO_ENERGIA: {
            nombre: "Activar ahorro de energía",
            motivo: "El nivel de energía es bajo.",
            permiso: "optimizacion"
        },

        REDUCIR_CARGA: {
            nombre: "Reducir carga del sistema",
            motivo: "La estabilidad está por debajo del nivel recomendado.",
            permiso: "optimizacion"
        }
    };


    const accion = acciones[tipo];

    if (!accion) {
        return;
    }


    if (
        configuracion.modoSeguro &&
        tipo !== "DIAGNOSTICO"
    ) {

        registrarEvento(
            "SECURITY",
            "Acción bloqueada por modo seguro."
        );

        escribirTerminal(
            "[SEGURIDAD] ACCIÓN BLOQUEADA",
            "warning"
        );

        return;
    }


    if (
        !configuracion.permisos[
            accion.permiso
        ]
    ) {

        registrarEvento(
            "SECURITY",
            `Permiso insuficiente: ${tipo}`
        );

        escribirTerminal(
            "[SEGURIDAD] PERMISO DENEGADO",
            "warning"
        );

        return;
    }


    sistema.accionPendiente = {

        id: generarId("ACT"),

        tipo,

        nombre: accion.nombre,

        motivo: accion.motivo,

        creada: new Date().toISOString(),

        origen: "NEXVORA",

        estado: "PENDIENTE"
    };


    registrarEvento(
        "ACTION",
        `Acción pendiente: ${accion.nombre}`
    );


    escribirTerminal(
        `[NEXVORA] ACCIÓN PROPUESTA: ${accion.nombre}`,
        "system"
    );


    actualizarAccionPendiente();

}


/* ============================================================
   AUTORIZACIÓN
   ============================================================ */

function autorizarAccion() {

    const accion =
        sistema.accionPendiente;

    if (!accion) {
        return;
    }


    accion.estado = "AUTORIZADA";

    accion.autorizadaPor = "USUARIO";

    accion.autorizadaEn =
        new Date().toISOString();


    registrarEvento(
        "AUTH",
        `Usuario autorizó: ${accion.nombre}`
    );


    escribirTerminal(
        `[OPERADOR] AUTORIZACIÓN RECIBIDA: ${accion.nombre}`,
        "system"
    );


    ejecutarAccion(accion);
}


/* ============================================================
   EJECUCIÓN
   ============================================================ */

function ejecutarAccion(accion) {

    if (!accion) {
        return;
    }


    escribirTerminal(
        `[NEXVORA] EJECUTANDO: ${accion.nombre}`,
        "system"
    );


    let resultado = "";


    switch (accion.tipo) {

        case "DIAGNOSTICO":

            resultado =
                ejecutarDiagnostico();

            break;


        case "OPTIMIZACION":

            resultado =
                optimizarSistema();

            break;


        case "AHORRO_ENERGIA":

            resultado =
                activarAhorro();

            break;


        case "REDUCIR_CARGA":

            resultado =
                reducirCarga();

            break;


        default:

            resultado =
                "Acción desconocida.";
    }


    accion.estado = "COMPLETADA";

    accion.resultado = resultado;

    accion.completadaEn =
        new Date().toISOString();


    estadisticas.accionesEjecutadas++;


    registrarAccion(
        accion.nombre,
        resultado,
        accion
    );


    registrarEvento(
        "ACTION",
        `Acción completada: ${accion.nombre}`
    );


    escribirTerminal(
        `[NEXVORA] RESULTADO: ${resultado}`,
        "system"
    );


    sistema.accionPendiente = null;

    actualizarAccionPendiente();

    actualizarInterfaz();

    guardarDatos();
}


/* ============================================================
   DIAGNÓSTICO
   ============================================================ */

function ejecutarDiagnostico() {

    const resultado =
        analizarSistema(false);


    return resultado.diagnostico;
}


/* ============================================================
   OPTIMIZACIÓN
   ============================================================ */

function optimizarSistema() {

    const anterior =
        sistema.estabilidad;


    sistema.estabilidad =
        Math.min(
            100,
            sistema.estabilidad + 10
        );


    sistema.cpuUso =
        Math.max(
            0,
            sistema.cpuUso - 10
        );


    registrarCambio(
        "estabilidad",
        anterior,
        sistema.estabilidad,
        "NEXVORA"
    );


    return "Optimización completada.";
}


/* ============================================================
   AHORRO DE ENERGÍA
   ============================================================ */

function activarAhorro() {

    const anterior =
        sistema.energia;


    sistema.energia =
        Math.min(
            100,
            sistema.energia + 5
        );


    registrarCambio(
        "energia",
        anterior,
        sistema.energia,
        "NEXVORA"
    );


    return "Modo ahorro activado.";
}


/* ============================================================
   REDUCIR CARGA
   ============================================================ */

function reducirCarga() {

    const anterior =
        sistema.cpuUso;


    sistema.cpuUso =
        Math.max(
            0,
            sistema.cpuUso - 20
        );


    sistema.estabilidad =
        Math.min(
            100,
            sistema.estabilidad + 5
        );


    registrarCambio(
        "cpuUso",
        anterior,
        sistema.cpuUso,
        "NEXVORA"
    );


    return "Carga del sistema reducida.";
}


/* ============================================================
   CANCELAR ACCIÓN
   ============================================================ */

function cancelarAccion() {

    if (!sistema.accionPendiente) {
        return;
    }


    const nombre =
        sistema.accionPendiente.nombre;


    registrarEvento(
        "ACTION",
        `Acción cancelada por el usuario: ${nombre}`
    );


    escribirTerminal(
        `[OPERADOR] ACCIÓN CANCELADA: ${nombre}`,
        "warning"
    );


    sistema.accionPendiente = null;

    actualizarAccionPendiente();

}


/* ============================================================
   MOSTRAR ACCIÓN PENDIENTE
   ============================================================ */

function actualizarAccionPendiente
