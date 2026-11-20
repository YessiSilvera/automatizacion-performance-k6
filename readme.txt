# PRUEBA TÉCNICA  - EJERCICIO 1: PERFORMANCE

## 1. Descripción del proyecto

Este proyecto implementa una prueba de carga automatizada sobre el servicio REST de autenticación de Fake Store API, utilizando Grafana k6.

La prueba permite evaluar el rendimiento del endpoint de login mediante usuarios parametrizados desde un archivo CSV.

**Endpoint:** https://fakestoreapi.com/auth/login

**Método HTTP:** POST

**Content-Type:** application/json

## 2. Herramientas utilizadas

- Grafana k6 versión 2.4.0
- Windows
- PowerShell
- Editor de texto
- GitHub para almacenar el proyecto y las evidencias

No se requiere Java, Maven ni instalar dependencias adicionales para ejecutar este script.

## 3. Estructura del proyecto

PruebaTecnicaPerformance/
- login.js — Script de pruebas de carga.
- usuarios.csv — Archivo con los cinco usuarios de prueba.
- readme.txt — Instrucciones de instalación y ejecución.
- conclusiones.txt — Resultados, hallazgos y conclusiones.
- evidencias/
  - resultado-carga.txt — Registro de la primera ejecución.
  - resultado-carga-prueba2.txt — Registro de la segunda ejecución.
  - resumen-k6.json — Resumen de la primera ejecución.
  - resumen-k6-prueba2.json — Resumen de la segunda ejecución.

El script también genera un archivo `resumen.json` con el resumen de la última ejecución.

## 4. Datos de entrada

Los usuarios se parametrizan mediante `usuarios.csv`, con las columnas:

user,passwd

Se utilizan los cinco usuarios proporcionados en la consigna. El script lee el archivo automáticamente y utiliza sus registros para realizar las solicitudes.

## 5. Instalación de k6

En Windows, abrir PowerShell y ejecutar:

`winget install --id GrafanaLabs.k6 --exact --source winget`

Una vez instalado, abrir una nueva terminal y verificar:

`k6 version`

Versión utilizada durante el desarrollo: k6 2.4.0.

Si PowerShell no reconoce el comando, verificar la instalación y agregar la carpeta que contiene `k6.exe` a la variable de entorno PATH.

## 6. Instrucciones de ejecución

**Paso 1.** Descargar o clonar el repositorio desde GitHub.

**Paso 2.** Abrir PowerShell dentro de la carpeta del proyecto.

**Paso 3.** Verificar que `login.js` y `usuarios.csv` estén en el mismo directorio.

**Paso 4.** Inspeccionar la configuración sin generar tráfico:

`k6 inspect login.js`

**Paso 5.** Una vez confirmada la autorización para ejecutar carga sobre el servicio, iniciar la prueba:

`k6 run login.js`

El escenario está configurado para iniciar 21 iteraciones por segundo durante 30 segundos. Se utiliza una iteración por solicitud de login.

**Paso 6.** Para guardar el resumen en JSON, ejecutar:

`k6 run --summary-export evidencias\resumen-k6-nueva.json login.js`

La carpeta `evidencias` debe existir antes de ejecutar este último comando.

## 7. Configuración de carga

El escenario utiliza el ejecutor `constant-arrival-rate` con los siguientes parámetros:

- Tasa configurada: 21 iteraciones por segundo.
- Duración: 30 segundos.
- Usuarios virtuales preasignados: 30.
- Usuarios virtuales máximos: 60.
- Endpoint: POST /auth/login.

La tasa configurada de 21 iteraciones por segundo proporciona un margen sobre el objetivo mínimo de 20 TPS. El rendimiento efectivo se verifica mediante las métricas generadas por k6.

## 8. Criterios de aceptación

Los requisitos establecidos para la prueba son:

- Rendimiento mínimo: 20 transacciones por segundo.
- Tiempo máximo de respuesta: 1500 milisegundos.
- Tasa de errores: inferior al 3 %.

Adicionalmente, se valida que las respuestas de autenticación incluyan un token y que no se descarten iteraciones por falta de usuarios virtuales disponibles.

## 9. Resultados obtenidos

Se realizaron dos ejecuciones de carga.

**Primera ejecución:**

- Carga configurada: 20 iteraciones por segundo.
- Solicitudes completadas: 601.
- TPS promedio medido: 19,779.
- Tiempo promedio: 413,65 ms.
- Tiempo máximo: 732,28 ms.
- Errores HTTP: 0 %.

La primera ejecución cumplió los límites de tiempo y errores, pero no alcanzó el mínimo de 20 TPS promedio medidos.

**Segunda ejecución:**

- Carga configurada: 21 iteraciones por segundo.
- Solicitudes completadas: 631.
- TPS promedio medido: 20,541.
- Tiempo promedio: 416,02 ms.
- Tiempo máximo: 706,06 ms.
- Percentil 95: 485,16 ms.
- Errores HTTP: 0 %.
- Errores de autenticación: 0 %.
- Iteraciones descartadas: 0.

La segunda ejecución cumplió todos los criterios de aceptación definidos para el ejercicio.

## 10. Evidencias

Los archivos de la carpeta `evidencias` permiten revisar las ejecuciones realizadas y sus métricas.

Los resultados corresponden al entorno y momento en que se ejecutaron las pruebas. Pueden variar según la conectividad, la disponibilidad del servicio y las condiciones de carga.

## 11. Conclusión

La implementación permitió parametrizar los cinco usuarios, automatizar el proceso de autenticación y medir el comportamiento del servicio bajo carga.

Tras ajustar la tasa configurada de 20 a 21 iteraciones por segundo, la segunda ejecución alcanzó 20,54 TPS promedio, mantuvo el tiempo máximo de respuesta por debajo de 1,5 segundos y registró una tasa de errores del 0 %.

Para obtener el análisis detallado, consultar `conclusiones.txt`.