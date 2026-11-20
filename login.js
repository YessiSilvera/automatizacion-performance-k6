
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate } from 'k6/metrics';

// ==========================================
// EJERCICIO 1: PERFORMANCE
// Herramienta: Grafana k6
// Servicio: POST /auth/login
// ==========================================

// 1. Cargar los 5 usuarios desde CSV
const usuarios = new SharedArray('usuarios', function () {
  return open('./usuarios.csv')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((linea) => {
      const [user, passwd] = linea.split(',');

      return {
        user: user.trim(),
        passwd: passwd.trim(),
      };
    });
});

// 2. Metricas personalizadas
const loginsExitosos = new Counter('logins_exitosos');
const erroresLogin = new Rate('errores_login');

// 3. Configuracion de carga
export const options = {
  scenarios: {
    login_carga: {
      executor: 'constant-arrival-rate',

      // 21 solicitudes por segundo
      // Objetivo minimo requerido: 20 TPS
      rate: 21,
      timeUnit: '1s',

      // Duracion de la prueba
      duration: '30s',

      // Usuarios virtuales disponibles
      preAllocatedVUs: 30,
      maxVUs: 60,
    },
  },

  // 4. Requisitos de aceptacion
  thresholds: {
    // Tiempo maximo permitido: 1.5 segundos
    http_req_duration: ['max<=1500'],

    // Tasa de errores inferior al 3%
    http_req_failed: ['rate<0.03'],
    errores_login: ['rate<0.03'],

    // Minimo 20 transacciones por segundo
    http_reqs: ['rate>=20'],

    // No perder iteraciones por falta de VUs
    dropped_iterations: ['count==0'],
  },
};

// 5. Ejecutar login
export default function () {
  const usuario = usuarios[__ITER % usuarios.length];

  const payload = JSON.stringify({
    username: usuario.user,
    password: usuario.passwd,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '60s',
  };

  const respuesta = http.post(
    'https://fakestoreapi.com/auth/login',
    payload,
    params
  );

  // 6. Validar autenticacion
  let tokenValido = false;

  if (respuesta.status === 200 || respuesta.status === 201) {
    try {
      const token = respuesta.json('token');

      tokenValido =
        typeof token === 'string' && token.length > 0;
    } catch (e) {
      tokenValido = false;
    }
  }

  const loginCorrecto = tokenValido;
  const tiempoCorrecto =
    respuesta.timings.duration <= 1500;

  check(respuesta, {
    'Login exitoso con token': () => loginCorrecto,

    'Tiempo menor o igual a 1.5 segundos': () =>
      tiempoCorrecto,

    'Respuesta HTTP recibida': (r) =>
      r.status !== 0,
  });

  if (loginCorrecto) {
    loginsExitosos.add(1);
  }

  erroresLogin.add(!loginCorrecto);
}

// 7. Exportar resumen
export function handleSummary(data) {
  return {
    'resumen.json': JSON.stringify(data, null, 2),
  };
}

