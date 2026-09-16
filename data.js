/* ============================================================
   NEXVORA DATA CORE
   Sistema central de memoria, historial y persistencia
   ============================================================ */

"use strict";


/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

const NEXVORA_STORAGE_KEY = "nexvora_data_v3";

const NEXVORA_MAX_HISTORY = 5000;


/* ============================================================
   ESTRUCTURA PRINCIPAL DE DATOS
   ============================================================ */

const NEXVORAData = {

    version: 3,

    sistema: {

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
    },


    /* ========================================================
       CONFIGURACIÓN
       ======================================================== */

    configuracion: {

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
    },


    /* ========================================================
       OPERADOR
       ======================================================== */

    operador: {

        activo: true,

        nombre: "USER",

        nivelAcceso: 1,

        ultimaActividad: null,

        accionesRealizadas: 0,

        autorizaciones: 0,

        cancelaciones: 0
    },


    /* ========================================================
       PROCESOS
       ======================================================== */

    procesos: [],


    /* ========================================================
       TAREAS
       ======================================================== */

    tareas: [],


    /* ========================================================
       ACCIONES
       ======================================================== */

    acciones: [],


    /* ========================================================
       DECISIONES
       ======================================================== */

    decisiones: [],


    /* ========================================================
       EVENTOS
       ======================================================== */

    eventos: [],


    /* ========================================================
       ERRORES
       ======================================================== */

    errores: [],


    /* ========================================================
       CORRECCIONES
       ======================================================== */

    correcciones: [],


    /* ========================================================
       APRENDIZAJES
       ======================================================== */

    aprendizajes: [],


    /* ========================================================
       CAMBIOS
       ======================================================== */

    cambios: [],


    /* ========================================================
       REVISIONES
       ======================================================== */

    revisiones: [],


    /* ========================================================
       AUTORIZACIONES
       ======================================================== */

    autorizaciones: [],


    /* ========================================================
       SESIONES
       ======================================================== */

    sesiones: [],


    /* ========================================================
       COMANDOS DEL OPERADOR
       ======================================================== */

    comandos: [],


    /* ========================================================
       ESTADÍSTICAS
       ======================================================== */

    estadisticas: {

        tiempoActivo: 0,

        revisiones: 0,

        decisiones: 0,

        erroresDetectados: 0,

        correcciones: 0,

        aprendizajes: 0,

        tareasCompletadas: 0,

        accionesEjecutadas: 0,

        procesosEjecutados: 0,

        cambiosRealizados: 0,

        autorizaciones: 0,

        cancelaciones: 0,

        comandosEjecutados: 0
    },


    /* ========================================================
       SISTEMA DE APRENDIZAJE
       ======================================================== */

    aprendizaje: {

        activo: true,

        conocimientos: 0,

        patronesDetectados: 0,

        confianzaPromedio: 0
    }
};


/* ============================================================
   UTILIDADES
   ============================================================ */

function nexvoraTimestamp() {

    return new Date().toISOString();
}


function nexvoraTime() {

    return new Date()
        .toLocaleTimeString(
            "es-CO",
            {
                hour12: false
            }
        );
}


function nexvoraDate() {

    return new Date()
        .toLocaleDateString(
            "es-CO"
        );
}


function nexvoraId(prefijo = "NX") {

    return (
        prefijo +
        "-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()
    );
}


function nexvoraClone(objeto) {

    return JSON.parse(
        JSON.stringify(objeto)
    );
}


function limitarHistorial(lista) {

    if (!Array.isArray(lista)) {
        return;
    }


    if (
        lista.length >
        NEXVORA_MAX_HISTORY
    ) {

        lista.splice(
            0,
            lista.length -
            NEXVORA_MAX_HISTORY
        );
    }
}


/* ============================================================
   PERSISTENCIA
   ============================================================ */

function guardarNexvoraData() {

    try {

        NEXVORAData.ultimaActualizacion =
            nexvoraTimestamp();


        localStorage.setItem(

            NEXVORA_STORAGE_KEY,

            JSON.stringify(
                NEXVORAData
            )
        );


        return true;

    } catch (error) {

        console.error(
            "[NEXVORA DATA] Error guardando datos:",
            error
        );

        return false;
    }
}


/* ============================================================
   CARGAR DATOS
   ============================================================ */

function cargarNexvoraData() {

    try {

        const datosGuardados =
            localStorage.getItem(
                NEXVORA_STORAGE_KEY
            );


        if (!datosGuardados) {

            guardarNexvoraData();

            return NEXVORAData;
        }


        const datos =
            JSON.parse(
                datosGuardados
            );


        fusionarDatos(
            NEXVORAData,
            datos
        );


        console.log(
            "[NEXVORA DATA] Memoria restaurada."
        );


        return NEXVORAData;

    } catch (error) {

        console.error(
            "[NEXVORA DATA] Error cargando datos:",
            error
        );


        return NEXVORAData;
    }
}


/* ============================================================
   FUSIÓN SEGURA
   ============================================================ */

function fusionarDatos(
    destino,
    origen
) {

    Object.keys(origen)
        .forEach(clave => {

            if (
                origen[clave] &&
                typeof origen[clave] === "object" &&
                !Array.isArray(origen[clave])
            ) {

                if (
                    !destino[clave] ||
                    typeof destino[clave] !== "object"
                ) {

                    destino[clave] = {};
                }


                fusionarDatos(
                    destino[clave],
                    origen[clave]
                );

            } else {

                destino[clave] =
                    origen[clave];
            }

        });
}


/* ============================================================
   EVENTOS
   ============================================================ */

function registrarEvento(
    tipo,
    mensaje,
    datos = {},
    origen = "NEXVORA"
) {

    const evento = {

        id: nexvoraId("EVT"),

        fecha:
            nexvoraTimestamp(),

        hora:
            nexvoraTime(),

        tipo,

        mensaje,

        origen,

        datos:
            nexvoraClone(datos)
    };


    NEXVORAData.eventos.push(
        evento
    );


    limitarHistorial(
        NEXVORAData.eventos
    );


    guardarNexvoraData();


    return evento;
}


/* ============================================================
   ACCIONES
   ============================================================ */

function registrarAccion(
    accion,
    resultado,
    datos = {}
) {

    const registro = {

        id: nexvoraId("ACT"),

        fecha:
            nexvoraTimestamp(),

        hora:
            nexvoraTime(),

        accion,

        resultado,

        origen:
            datos.origen ||
            "NEXVORA",

        autorizado:
            datos.autorizado ??
            true,

        autorizadoPor:
            datos.autorizadaPor ||
            null,

        estado:
            datos.estado ||
            "COMPLETADA",

        datos:
            nexvoraClone(datos)
    };


    NEXVORAData.acciones.push(
        registro
    );


    NEXVORAData.operador.accionesRealizadas++;


    limitarHistorial(
        NEXVORAData.acciones
    );


    guardarNexvoraData();


    return registro;
}


/* ============================================================
   PROCESOS
   ============================================================ */

function registrarProceso(
    nombre,
    estado,
    datos = {}
) {

    const proceso = {

        id:
            datos.id ||
            nexvoraId("PROC"),

        fecha:
            nexvoraTimestamp(),

        nombre,

        estado,

        prioridad:
            datos.prioridad ||
            "MEDIA",

        creadoPor:
            datos.creadoPor ||
            "NEXVORA",

        inicio:
            datos.inicio ||
            null,

        fin:
            datos.fin ||
            null,

        descripcion:
            datos.descripcion ||
            "",

        resultado:
            datos.resultado ||
            null
    };


    NEXVORAData.procesos.push(
        proceso
    );


    limitarHistorial(
        NEXVORAData.procesos
    );


    if (
        estado === "COMPLETADO"
    ) {

        NEXVORAData.estadisticas
            .procesosEjecutados++;
    }


    guardarNexvoraData();


    return proceso;
}


/* ============================================================
   TAREAS
   ============================================================ */

function registrarTarea(
    nombre,
    estado,
    prioridad = "MEDIA",
    datos = {}
) {

    const tarea = {

        id:
            datos.id ||
            nexvoraId("TASK"),

        fecha:
            nexvoraTimestamp(),

        nombre,

        estado,

        prioridad,

        creadaPor:
            datos.creadaPor ||
            "USUARIO",

        creadaEn:
            datos.creadaEn ||
            nexvoraTimestamp(),

        completadaEn:
            null
    };


    NEXVORAData.tareas.push(
        tarea
    );


    limitarHistorial(
        NEXVORAData.tareas
    );


    guardarNexvoraData();


    return tarea;
}


/* ============================================================
   DECISIONES
   ============================================================ */

function registrarDecision(
    decision,
    motivo,
    resultado = null
) {

    const registro = {

        id: nexvoraId("DEC"),

        fecha:
            nexvoraTimestamp(),

        decision,

        motivo,

        resultado,

        origen:
            "NEXVORA"
    };


    NEXVORAData.decisiones.push(
        registro
    );


    NEXVORAData.estadisticas
        .decisiones++;


    limitarHistorial(
        NEXVORAData.decisiones
    );


    guardarNexvoraData();


    return registro;
}


/* ============================================================
   ERRORES
   ============================================================ */

function registrarError(
    error,
    origen = "NEXVORA",
    gravedad = "MEDIA"
) {

    const registro = {

        id: nexvoraId("ERR"),

        fecha:
            nexvoraTimestamp(),

        mensaje:
            String(error),

        origen,

        gravedad,

        estado:
            "PENDIENTE",

        corregido:
            false
    };


    NEXVORAData.errores.push(
        registro
    );


    NEXVORAData.estadisticas
        .erroresDetectados++;


    limitarHistorial(
        NEXVORAData.errores
    );


    guardarNexvoraData();


    return registro;
}


/* ============================================================
   CORRECCIONES
   ============================================================ */

function registrarCorreccion(
    errorId,
    descripcion,
    resultado
) {

    const correccion = {

        id:
            nexvoraId("FIX"),

        fecha:
            nexvoraTimestamp(),

        errorId,

        descripcion,

        resultado,

        ejecutadoPor:
            "NEXVORA",

        estado:
            "COMPLETADA"
    };


    NEXVORAData.correcciones.push(
        correccion
    );


    const error =
        NEXVORAData.errores
            .find(
                item =>
                    item.id === errorId
            );


    if (error) {

        error.corregido =
            true;

        error.estado =
            "RESUELTO";
    }


    NEXVORAData.estadisticas
        .correcciones++;


    limitarHistorial(
        NEXVORAData.correcciones
    );


    guardarNexvoraData();


    return correccion;
}


/* ============================================================
   APRENDIZAJE
   ============================================================ */

function registrarAprendizaje(
    conocimiento,
    fuente = "EXPERIENCIA",
    confianza = 0.5
) {

    const aprendizaje = {

        id:
            nexvoraId("LRN"),

        fecha:
            nexvoraTimestamp(),

        conocimiento,

        fuente,

        confianza:

            Math.max(
                0,
                Math.min(
                    1,
                    Number(confianza)
                )
            ),

        frecuencia: 1,

        ultimaAplicacion:
            null
    };


    const existente =
        NEXVORAData.aprendizajes
            .find(
                item =>
                    item.conocimiento ===
                    conocimiento
            );


    if (existente) {

        existente.frecuencia++;

        existente.confianza =
            (
                existente.confianza +
                aprendizaje.confianza
            ) / 2;

        existente.ultimaAplicacion =
            nexvoraTimestamp();

    } else {

        NEXVORAData.aprendizajes.push(
            aprendizaje
        );
    }


    NEXVORAData.estadisticas
        .aprendizajes++;


    NEXVORAData.aprendizaje
        .conocimientos =
        NEXVORAData.aprendizajes.length;


    actualizarConfianzaPromedio();


    limitarHistorial(
        NEXVORAData.aprendizajes
    );


    guardarNexvoraData();


    return aprendizaje;
}


/* ============================================================
   CAMBIOS
   ============================================================ */

function registrarCambio(
    propiedad,
    valorAnterior,
    valorNuevo,
    origen = "USUARIO"
) {

    const cambio = {

        id:
            nexvoraId("CHG"),

        fecha:
            nexvoraTimestamp(),

        hora:
            nexvoraTime(),

        propiedad,

        valorAnterior:
            nexvoraClone(
                valorAnterior
            ),

        valorNuevo:
            nexvoraClone(
                valorNuevo
            ),

        origen
    };


    NEXVORAData.cambios.push(
        cambio
    );


    NEXVORAData.estadisticas
        .cambiosRealizados++;


    limitarHistorial(
        NEXVORAData.cambios
    );


    guardarNexvoraData();


    return cambio;
}


/* ============================================================
   REVISIONES
   ============================================================ */

function registrarRevision(
    datos = {}
) {

    const revision = {

        id:
            nexvoraId("REV"),

        fecha:
            nexvoraTimestamp(),

        hora:
            nexvoraTime(),

        energia:
            datos.energia ?? null,

        estabilidad:
            datos.estabilidad ?? null,

        errores:
            datos.errores ?? null,

        cpu:
            datos.cpu ?? null,

        estado:
            datos.estado ||
            "COMPLETADA"
    };


    NEXVORAData.revisiones.push(
        revision
    );


    NEXVORAData.estadisticas
        .revisiones++;


    limitarHistorial(
        NEXVORAData.revisiones
    );


    guardarNexvoraData();


    return revision;
}


/* ============================================================
   AUTORIZACIONES
   ============================================================ */

function registrarAutorizacion(
    accion,
    resultado = "AUTORIZADA",
    datos = {}
) {

    const autorizacion = {

        id:
            nexvoraId("AUTH"),

        fecha:
            nexvoraTimestamp(),

        accion,

        resultado,

        operador:
            "USER",

        datos:
            nexvoraClone(datos)
    };


    NEXVORAData.autorizaciones.push(
        autorizacion
    );


    if (
        resultado ===
        "AUTORIZADA"
    ) {

        NEXVORAData.operador
            .autorizaciones++;

        NEXVORAData.estadisticas
            .autorizaciones++;

    } else if (
        resultado ===
        "CANCELADA"
    ) {

        NEXVORAData.operador
            .cancelaciones++;

        NEXVORAData.estadisticas
            .cancelaciones++;
    }


    limitarHistorial(
        NEXVORAData.autorizaciones
    );


    guardarNexvoraData();


    return autorizacion;
}


/* ============================================================
   COMANDOS DEL OPERADOR
   ============================================================ */

function registrarComando(
    comando,
    resultado = null
) {

    const registro = {

        id:
            nexvoraId("CMD"),

        fecha:
            nexvoraTimestamp(),

        hora:
            nexvoraTime(),

        comando,

        operador:
            "USER",

        resultado
    };


    NEXVORAData.comandos.push(
        registro
    );


    NEXVORAData.estadisticas
        .comandosEjecutados++;


    NEXVORAData.operador
        .ultimaActividad =
        nexvoraTimestamp();


    limitarHistorial(
        NEXVORAData.comandos
    );


    guardarNexvoraData();


    return registro;
}


/* ============================================================
   ACTUALIZAR SISTEMA
   ============================================================ */

function actualizarDatosSistema(
    nuevosDatos,
    origen = "NEXVORA"
) {

    if (!nuevosDatos) {
        return;
    }


    const anteriores =
        nexvoraClone(
            NEXVORAData.sistema
        );


    Object.assign(
        NEXVORAData.sistema,
        nuevosDatos
    );


    registrarCambio(
      
