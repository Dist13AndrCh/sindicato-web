Sistema de Control Sindical - Gestión de Pagos y Socios

Este es un sistema web moderno diseñado para la gestión administrativa de sindicatos. Permite el control de afiliados, registro de aportes mensuales, generación de reportes de deudas y comunicación de avisos importantes.

🚀 Características

Consulta Pública: Los socios pueden buscar su estado de cuenta ingresando su nombre.

Panel Administrativo: Acceso restringido mediante autenticación para la directiva.

Gestión de Socios: Registro, edición y eliminación de afiliados.

Control de Pagos: Registro de aportes por gestión y cálculo automático de montos.

Reportes: Generación de estados de cuenta individuales y listas generales de deudores (listos para imprimir o guardar en PDF).

Diseño Moderno: Interfaz oscura (Dark Mode) optimizada para dispositivos móviles y escritorio.

🏗️ Arquitectura (MVC)

El proyecto ha sido organizado siguiendo el patrón Modelo-Vista-Controlador para facilitar su mantenimiento:

Vista (index.html + styles.css): Contiene la estructura HTML y toda la capa estética y de diseño.

Modelo (model.js): Gestiona la conexión con Firebase y la estructura de las colecciones de datos.

Controlador (controller.js): Contiene la lógica de negocio, manejo de eventos de usuario y renderizado dinámico de la interfaz.

🛠️ Tecnologías Utilizadas

Frontend: HTML5, CSS3 (Variables y Flexbox), JavaScript Vanilla.

Backend: Firebase (Firestore para base de datos y Authentication para el acceso).

Hosting: Compatible con GitHub Pages, Vercel o Netlify.

⚙️ Configuración y Despliegue

1. Requisitos Previos

Tener una cuenta en Firebase y crear un proyecto nuevo.

2. Base de Datos (Firestore)

Crear la siguiente estructura de colecciones en Firestore:
artifacts > sindicato-pagos-v1 > public > data > [socios, pagos, gestiones, avisos]

3. Autenticación

Activar el método de inicio de sesión Correo electrónico/contraseña en la consola de Firebase y crear un usuario administrador manualmente.

4. Configuración del Código

En el archivo model.js, actualiza el objeto firebaseConfig con las credenciales de tu proyecto.

5. Dominios Autorizados

Si publicas el sitio en GitHub Pages o Vercel, recuerda añadir el dominio (ej: tuusuario.github.io) en la sección Settings > Authorized domains dentro de Firebase Authentication.

📄 Licencia

Este proyecto es de uso privado para la gestión sindical.

Desarrollado para optimizar la transparencia y administración sindical. 🐧
