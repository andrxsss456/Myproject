"use strict";

/* ============================================================
AUTOCORE V2
Núcleo de monitorización, análisis, decisión y aprendizaje
============================================================ */

/* ============================================================
CONFIGURACIÓN
============================================================ */

const CONFIG = {

```
frecuenciaRevision: 5000,

capacidadMemoria: 1000,

maxEventosVisibles: 100,

intervaloTiempo: 1000,

probabilidadError: 0.08,

energiaMinima: 0,

energiaMaxima: 100
```

};

/* ============================================================
ESTADO PRINCIPAL DEL SISTEMA
============================================================ */

const sistema = {

```
estado: "ACTIVO",

modo: "NORMAL",

energia: 100,

estabilidad: 100,

errores: 0,

tareas: 0,

prioridad: "BAJA",

nivelIA: 1,

memoriaUso: 0,

cpuUso: 8,

ultimaRevision: "--:--:--",

diagnostico: "Inicializando...",

accionPendiente: null,

inicio: Date.now(),

ciclos: 0,

aprendizajeActivo: true,

modoSeguro: false
```

};

/* ============================================================
ESTADÍSTICAS
============================================================ */

const estadisticas = {

```
tiempoActivo: 0,

revisiones: 0,

decisiones: 0,

erroresDetectados: 0,

correcciones: 0,

aprendizajes: 0,

tareasCompletadas: 0
```

};

/* ============================================================
MEMORIA
============================================================ */

const memoria = {

```
eventos: [],

decisiones: [],

aprendizajes: [],

historialEstados: [],

tareasCompletadas: 0
```

};

/* ============================================================
CONTROL DE INTERVALOS
============================================================ */

let cicloIntervalo = null;

let relojIntervalo = null;

/* ============================================================
UTILIDADES
============================================================ */

function obtenerHora() {

```
return new Date().toLocaleTimeString("es-CO");
```

}

function limitar(valor, minimo, maximo) {

```
return Math.min(
    Math.max(valor, minimo),
    maximo
);
```

}

function obtenerElemento(id) {

```
return document.getElementById(id);
```

}

/* ============================================================
REGISTRO DE EVENTOS
============================================================ */

function registrar(tipo, mensaje) {

```
const evento = {

    id: Date.now() + Math.random(),

    hora: obtenerHora(),

    tipo: tipo,

    mensaje: mensaje

};

memoria.eventos.push(evento);


/* Limitar memoria */

if (
    memoria.eventos.length >
    CONFIG.capacidadMemoria
) {

    memoria.eventos.shift();

}


actualizarRegistroUI();
```

}

/* ============================================================
MONITOR
============================================================ */

function revisarEnergia() {

```
let consumo = 0;


/* El consumo depende de la carga */

if (sistema.cpuUso > 80) {

    consumo += 2;

}

else if (sistema.cpuUso > 50) {

    consumo += 1;

}


if (sistema.tareas > 7) {

    consumo += 1;

}


if (sistema.modo === "AHORRO") {

    consumo = Math.max(
        0,
        consumo - 1
    );

}


if (sistema.modoSeguro) {

    consumo = Math.max(
        0,
        consumo - 1
    );

}


/* Consumo mínimo ocasional */

if (consumo === 0 && Math.random() < 0.35) {

    consumo = 1;

}


sistema.energia = limitar(

    sistema.energia - consumo,

    CONFIG.energiaMinima,

    CONFIG.energiaMaxima

);
```

}

/* ============================================================
MONITOR DE CPU Y TAREAS
============================================================ */

function revisarCarga() {

```
const variacionCPU =
    Math.floor(Math.random() * 31) - 15;


sistema.cpuUso = limitar(

    sistema.cpuUso + variacionCPU,

    5,

    100

);


/* Las tareas dependen parcialmente de CPU */

let tareasBase =
    Math.floor(
        sistema.cpuUso / 12
    );


const variacionTareas =
    Math.floor(Math.random() * 3) - 1;


sistema.tareas = limitar(

    tareasBase + variacionTareas,

    0,

    10

);


/* Modo ahorro */

if (sistema.modo === "AHORRO") {

    sistema.cpuUso =
        Math.min(
            sistema.cpuUso,
            55
        );

}


/* Modo seguro */

if (sistema.modoSeguro) {

    sistema.cpuUso =
        Math.min(
            sistema.cpuUso,
            45
        );

    sistema.tareas =
        Math.min(
            sistema.tareas,
            5
        );

}
```

}

/* ============================================================
DETECCIÓN DE ERRORES
============================================================ */

function revisarErrores() {

```
let probabilidad =
    CONFIG.probabilidadError;


if (sistema.cpuUso > 85) {

    probabilidad += 0.06;

}


if (sistema.estabilidad < 60) {

    probabilidad += 0.04;

}


if (Math.random() < probabilidad) {

    sistema.errores++;

    estadisticas.erroresDetectados++;


    registrar(

        "ERROR",

        "Anomalía detectada durante la monitorización."

    );

}
```

}

/* ============================================================
ESTABILIDAD
============================================================ */

function revisarEstabilidad() {

```
let nuevaEstabilidad = 100;


nuevaEstabilidad -=
    sistema.errores * 5;


if (sistema.cpuUso > 90) {

    nuevaEstabilidad -= 10;

}

else if (sistema.cpuUso > 75) {

    nuevaEstabilidad -= 5;

}


if (sistema.energia < 20) {

    nuevaEstabilidad -= 10;

}


if (sistema.modo === "EMERGENCIA") {

    nuevaEstabilidad = 100;

}


sistema.estabilidad = limitar(

    nuevaEstabilidad,

    0,

    100

);
```

}

/* ============================================================
MONITOR PRINCIPAL
============================================================ */

function monitor() {

```
revisarCarga();

revisarEnergia();

revisarErrores();

revisarEstabilidad();


sistema.ultimaRevision =
    obtenerHora();


sistema.ciclos++;

estadisticas.revisiones++;


registrar(

    "ANALISIS",

    "Revisión #" +
    sistema.ciclos +
    " completada."

);


guardarEstado();
```

}

/* ============================================================
DIAGNÓSTICO
============================================================ */

function obtenerDiagnostico() {

```
if (sistema.errores >= 10) {

    return "Sistema crítico";

}


if (sistema.modo === "EMERGENCIA") {

    return "Protocolo de emergencia activo";

}


if (sistema.energia < 20) {

    return "Energía baja";

}


if (sistema.estabilidad < 50) {

    return "Estabilidad comprometida";

}


if (sistema.cpuUso > 85) {

    return "Carga elevada";

}


if (sistema.tareas > 8) {

    return "Exceso de tareas";

}


return "Funcionamiento normal";
```

}

/* ============================================================
ANALIZADOR
============================================================ */

function analizar() {

```
/* Prioridad */

if (sistema.energia < 20) {

    sistema.prioridad = "CRÍTICA";

}

else if (
    sistema.errores >= 5 ||
    sistema.estabilidad < 50
) {

    sistema.prioridad = "ALTA";

}

else if (
    sistema.energia < 60 ||
    sistema.cpuUso > 75
) {

    sistema.prioridad = "MEDIA";

}

else {

    sistema.prioridad = "BAJA";

}


sistema.diagnostico =
    obtenerDiagnostico();


actualizarEstadoSistema();
```

}

/* ============================================================
DECISOR
============================================================ */

function decidir() {

```
sistema.accionPendiente = null;


/* Emergencia */

if (sistema.errores >= 10) {

    sistema.accionPendiente =
        "EMERGENCIA";

    registrar(
        "DECISION",
        "Nivel crítico. Activando protocolo de emergencia."
    );

    return;

}


/* Reparación */

if (sistema.errores >= 5) {

    sistema.accionPendiente =
        "REPARAR";

    registrar(
        "DECISION",
        "Múltiples errores detectados. Reparación requerida."
    );

    return;

}


/* Energía */

if (sistema.energia < 20) {

    sistema.accionPendiente =
        "ACTIVAR_AHORRO";

    registrar(
        "DECISION",
        "Energía baja. Activando modo ahorro."
    );

    return;

}


/* Estabilidad */

if (sistema.estabilidad < 50) {

    sistema.accionPendiente =
        "OPTIMIZAR";

    registrar(
        "DECISION",
        "Estabilidad comprometida. Ejecutando optimización."
    );

    return;

}


/* Carga */

if (
    sistema.cpuUso > 80 ||
    sistema.tareas > 8
) {

    sistema.accionPendiente =
        "REDUCIR_CARGA";

    registrar(
        "DECISION",
        "Carga elevada. Reducción de carga recomendada."
    );

    return;

}


/* Sin intervención */

registrar(
    "DECISION",
    "No se requiere intervención."
);
```

}

/* ============================================================
MEMORIA: DECISIONES
============================================================ */

function guardarDecision(accion) {

```
memoria.decisiones.push({

    hora: obtenerHora(),

    accion: accion

});


if (
    memoria.decisiones.length >
    CONFIG.capacidadMemoria
) {

    memoria.decisiones.shift();

}
```

}

/* ============================================================
MEMORIA: ESTADOS
============================================================ */

function guardarEstado() {

```
memoria.historialEstados.push({

    hora: obtenerHora(),

    energia: sistema.energia,

    estabilidad: sistema.estabilidad,

    errores: sistema.errores,

    cpu: sistema.cpuUso,

    tareas: sistema.tareas,

    modo: sistema.modo

});


if (
    memoria.historialEstados.length >
    CONFIG.capacidadMemoria
) {

    memoria.historialEstados.shift();

}
```

}

/* ============================================================
APRENDIZAJE
============================================================ */

function aprender(regla) {

```
if (!sistema.aprendizajeActivo) {

    return;

}


memoria.aprendizajes.push({

    hora: obtenerHora(),

    regla: regla

});


estadisticas.aprendizajes++;


/* Cada cierto número de aprendizajes
   aumenta el nivel de IA */

if (
    estadisticas.aprendizajes % 10 === 0
) {

    sistema.nivelIA++;

    registrar(

        "APRENDIZAJE",

        "Nivel IA incrementado a " +
        sistema.nivelIA + "."

    );

}


if (
    memoria.aprendizajes.length >
    CONFIG.capacidadMemoria
) {

    memoria.aprendizajes.shift();

}
```

}

/* ============================================================
APRENDIZAJE AUTOMÁTICO
============================================================ */

function analizarAprendizaje() {

```
if (!sistema.aprendizajeActivo) {

    return;

}


if (sistema.cpuUso > 80) {

    aprender(
        "Las cargas elevadas requieren reducción de tareas."
    );

}


if (sistema.energia < 30) {

    aprender(
        "La energía baja aumenta la prioridad del modo ahorro."
    );

}


if (sistema.errores > 0) {

    aprender(
        "Los errores reducen la estabilidad del sistema."
    );

}


if (sistema.estabilidad >= 90) {

    aprender(
        "Los parámetros estables permiten mantener el modo normal."
    );

}
```

}

/* ============================================================
GUARDAR MEMORIA
============================================================ */

function guardarMemoria() {

```
try {

    localStorage.setItem(

        "autocore_memoria",

        JSON.stringify(memoria)

    );


    localStorage.setItem(

        "autocore_estadisticas",

        JSON.stringify(estadisticas)

    );


    localStorage.setItem(

        "autocore_config",

        JSON.stringify(CONFIG)

    );

}

catch (error) {

    console.warn(
        "No fue posible guardar la memoria.",
        error
    );

}
```

}

/* ============================================================
CARGAR MEMORIA
============================================================ */

function cargarMemoria() {

```
try {

    const datosMemoria =
        localStorage.getItem(
            "autocore_memoria"
        );


    if (datosMemoria) {

        const memoriaGuardada =
            JSON.parse(datosMemoria);


        Object.assign(
            memoria,
            memoriaGuardada
        );

    }


    const datosEstadisticas =
        localStorage.getItem(
            "autocore_estadisticas"
        );


    if (datosEstadisticas) {

        Object.assign(

            estadisticas,

            JSON.parse(
                datosEstadisticas
            )

        );

    }

}

catch (error) {

    console.warn(
        "La memoria almacenada no pudo cargarse.",
        error
    );

}
```

}

/* ============================================================
EJECUTOR
============================================================ */

function activarAhorro() {

```
sistema.modo = "AHORRO";


sistema.cpuUso =
    Math.min(
        sistema.cpuUso,
        55
    );


registrar(

    "ACCION",

    "Modo ahorro activado."

);


aprender(
    "El modo ahorro reduce el consumo energético."
);
```

}

function repararSistema() {

```
sistema.errores = 0;


sistema.estabilidad =
    Math.min(
        100,
        sistema.estabilidad + 30
    );


estadisticas.correcciones++;


registrar(

    "ACCION",

    "Sistema reparado correctamente."

);


aprender(
    "La reparación restablece los errores detectados."
);
```

}

function optimizarSistema() {

```
sistema.estabilidad = 100;


sistema.cpuUso =
    Math.max(
        10,
        sistema.cpuUso - 20
    );


registrar(

    "ACCION",

    "Optimización completada."

);


aprender(
    "La optimización mejora la estabilidad y reduce la carga."
);
```

}

function reducirCarga() {

```
const cpuAnterior =
    sistema.cpuUso;


sistema.cpuUso =
    Math.max(
        10,
        sistema.cpuUso - 30
    );


sistema.tareas =
    Math.max(
        0,
        sistema.tareas - 3
    );


registrar(

    "ACCION",

    "Carga reducida de " +
    cpuAnterior +
    "% a " +
    sistema.cpuUso +
    "%."

);


aprender(
    "Reducir carga permite recuperar recursos del sistema."
);
```

}

function protocoloEmergencia() {

```
sistema.modo =
    "EMERGENCIA";


sistema.cpuUso = 10;

sistema.tareas = 0;

sistema.estabilidad = 100;

sistema.errores = 0;


registrar(

    "EMERGENCIA",

    "Protocolo de emergencia ejecutado."

);


aprender(
    "El protocolo de emergencia prioriza estabilidad y seguridad."
);
```

}

/* ============================================================
EJECUCIÓN
============================================================ */

function ejecutar() {

```
if (!sistema.accionPendiente) {

    return;

}


const accion =
    sistema.accionPendiente;


guardarDecision(accion);


switch (accion) {

    case "ACTIVAR_AHORRO":

        activarAhorro();

        break;


    case "REPARAR":

        repararSistema();

        break;


    case "OPTIMIZAR":

        optimizarSistema();

        break;


    case "REDUCIR_CARGA":

        reducirCarga();

        break;


    case "EMERGENCIA":

        protocoloEmergencia();

        break;

}


estadisticas.decisiones++;


sistema.accionPendiente = null;
```

}

/* ============================================================
FINALIZAR TAREAS
============================================================ */

function procesarTareas() {

```
if (sistema.tareas <= 0) {

    return;

}


if (Math.random() < 0.30) {

    sistema.tareas =
        Math.max(
            0,
            sistema.tareas - 1
        );


    estadisticas.tareasCompletadas++;

    memoria.tareasCompletadas =
        estadisticas.tareasCompletadas;


    registrar(

        "ACCION",

        "Tarea completada automáticamente."

    );

}
```

}

/* ============================================================
EFICIENCIA
============================================================ */

function calcularEficiencia() {

```
let eficiencia = 100;


eficiencia -=
    sistema.errores * 4;


eficiencia -=
    Math.max(
        0,
        sistema.cpuUso - 70
    ) * 0.2;


eficiencia -=
    Math.max(
        0,
        70 - sistema.estabilidad
    ) * 0.3;


return Math.round(
    limitar(
        eficiencia,
        0,
        100
    )
);
```

}

/* ============================================================
MEMORIA UTILIZADA
============================================================ */

function calcularMemoriaUso() {

```
const total =

    memoria.eventos.length +

    memoria.decisiones.length +

    memoria.aprendizajes.length +

    memoria.historialEstados.length;


sistema.memoriaUso =
    limitar(

        Math.round(
            (total /
                (CONFIG.capacidadMemoria * 4)
            ) * 100
        ),

        0,

        100

    );
```

}

/* ============================================================
ACTUALIZACIÓN DE UI
============================================================ */

function actualizarUI() {

```
calcularMemoriaUso();


const eficiencia =
    calcularEficiencia();


/* Estado */

actualizarTexto(
    "system-status",
    sistema.estado
);


actualizarTexto(
    "estadoGeneral",
    sistema.estado
);


actualizarTexto(
    "estadoSistema",
    sistema.estado
);


/* Modo */

actualizarTexto(
    "modoSistema",
    sistema.modo
);


actualizarTexto(
    "modoActual",
    sistema.modo
);


/* Energía */

actualizarTexto(
    "energiaActual",
    sistema.energia + "%"
);


actualizarTexto(
    "energiaGeneral",
    sistema.energia + "%"
);


/* Estabilidad */

actualizarTexto(
    "estabilidad",
    sistema.estabilidad + "%"
);


actualizarTexto(
    "estabilidadActual",
    sistema.estabilidad + "%"
);


actualizarTexto(
    "enginePercentage",
    sistema.estabilidad + "%"
);


/* Errores */

actualizarTexto(
    "erroresActuales",
    sistema.errores
);


/* CPU */

actualizarTexto(
    "cpuUso",
    sistema.cpuUso + "%"
);


actualizarTexto(
    "cpuActual",
    sistema.cpuUso + "%"
);


/* Tareas */

actualizarTexto(
    "tareasGeneral",
    sistema.tareas
);


actualizarTexto(
    "tareasActuales",
    sistema.tareas
);


/* Prioridad */

actualizarTexto(
    "prioridadGeneral",
    sistema.prioridad
);


actualizarTexto(
    "prioridadActual",
    sistema.prioridad
);


/* Diagnóstico */

actualizarTexto(
    "diagnosticoGeneral",
    sistema.diagnostico
);


/* Nivel IA */

actualizarTexto(
    "nivelIA",
    sistema.nivelIA
);


actualizarTexto(
    "nivelIAActual",
    sistema.nivelIA
);


actualizarTexto(
    "sidebarNivelIA",
    sistema.nivelIA
);


actualizarTexto(
    "nivelIAEstadistica",
    sistema.nivelIA
);


/* Última revisión */

actualizarTexto(
    "ultimaRevision",
    sistema.ultimaRevision
);


actualizarTexto(
    "footerRevision",
    sistema.ultimaRevision
);


/* Acción */

actualizarTexto(

    "accionPendiente",

    sistema.accionPendiente
        ? sistema.accionPendiente
        : "SIN ACCIÓN PENDIENTE"

);


/* Estadísticas */

actualizarTexto(
    "totalRevisiones",
    estadisticas.revisiones
);


actualizarTexto(
    "totalDecisiones",
    estadisticas.decisiones
);


actualizarTexto(
    "totalErrores",
    estadisticas.erroresDetectados
);


actualizarTexto(
    "totalCorrecciones",
    estadisticas.correcciones
);


actualizarTexto(
    "tareasCompletadas",
    estadisticas.tareasCompletadas
);


actualizarTexto(
    "aprendizajes",
    estadisticas.aprendizajes
);


actualizarTexto(
    "eficiencia",
    eficiencia + "%"
);


actualizarTexto(
    "eficienciaTexto",
    eficiencia + "%"
);


/* Memoria */

actualizarTexto(
    "memoriaUso",
    sistema.memoriaUso + "%"
);


/* Barras */

actualizarBarra(
    "estabilidadBarra",
    sistema.estabilidad
);


actualizarBarra(
    "memoriaBarra",
    sistema.memoriaUso
);


actualizarBarra(
    "barraEficiencia",
    eficiencia
);


actualizarBarra(
    "coreProgressBar",
    sistema.estabilidad
);


/* Estado de aprendizaje */

actualizarTexto(

    "aprendizajeEstado",

    sistema.aprendiza
