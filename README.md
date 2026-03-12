# BTG Pactual

Este proyecto es una solución **Backend Serverless** desarrollada para **BTG Pactual**. Permite a los clientes gestionar sus fondos de inversión (suscripción, cancelación e historial) e integra notificaciones automáticas vía Email (Resend) y SMS (Twilio).

## 🏗️ Arquitectura del Proyecto

Se ha implementado una **Arquitectura Hexagonal (Puertos y Adaptadores)** combinada con patrones de **Clean Architecture**. Esta estructura garantiza que la lógica de negocio sea independiente de las herramientas externas como la base de datos o APIs de terceros.

### Estructura de Carpetas:
* **`src/Entities`**: Modelos de dominio y reglas de negocio críticas.
* **`src/Infrastructure`**: Adaptadores para DynamoDB, Express Server y Handlers de AWS Lambda.
* **`src/Schemas`**: Validaciones de esquemas (AJV) para garantizar la integridad de los datos de entrada.
* **`src/Services`**: Lógica de aplicación que orquestra el flujo de datos.
* **`src/Utils`**: Helpers para respuestas HTTP estandarizadas y utilitarios generales.

## 🛠️ Tecnologías Utilizadas

* **Node.js 20**: Entorno de ejecución.
* **Express**: Framework web para la estructura de rutas.
* **Serverless Framework (v3)**: Gestión de infraestructura como código (IaC) para despliegue en AWS.
* **AWS Lambda & API Gateway**: Computación serverless para el cumplimiento de los requerimientos de escalabilidad.
* **Amazon DynamoDB**: Base de Datos NoSQL diseñada bajo el patrón de **Single Table Design**.
* **Resend API**: Notificaciones por correo electrónico.
* **Twilio**: Notificaciones por SMS.
* **Jest & Supertest**: Suite de pruebas unitarias y de integración.

## ⚠️ Nota Importante

### Notificaciones SMS (Twilio)
> Debido a que se utiliza una **cuenta gratuita de Twilio**, los mensajes SMS solo pueden ser enviados a números que hayan sido previamente verificados en la consola de Twilio. Para realizar pruebas con un número celular real, por favor suministrar el número para agregarlo a la lista de remitentes permitidos.

## 🚀 Comandos del Proyecto

### Desarrollo y Ejecución
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor local usando `nodemon` y `src/local.js`. |
| `npm run start` | Ejecuta el punto de entrada principal con el flag de variables de entorno. |

### Pruebas (Testing)
| Comando | Descripción |
| :--- | :--- |
| `npm run test` | Ejecuta todos los tests en modo detallado (`verbose`). |
| `npm run test:watch` | Mantiene Jest en modo escucha para cambios en caliente. |
| `npm run test:ci` | **Genera el reporte de cobertura**. Actualmente el proyecto cuenta con un **+94% de coverage**. |

## 📊 Cobertura de Tests
El proyecto cuenta con una robusta suite de **169 pruebas** que cubren:
* Validación de esquemas y payloads.
* Lógica de negocio (Saldos iniciales de $500.000, montos mínimos de vinculación, etc.).
* Integración con servicios de notificación (Mocks).
* Endpoints de la API (Supertest).

## ⚙️ Pruebas con Postman

Para facilitar la validación de los endpoints, he adjuntado la colección de solicitudes y el archivo de variables de entorno (Environment). Puedes importarlos directamente en Postman:

* [📂 Descargar Postman Collection](https://drive.google.com/file/d/1EfvudP3pjzr4G_ZbJcnbSZvnVX9OLzj9/view?usp=drive_link)
* [🌐 Descargar Postman Environment](https://drive.google.com/file/d/1ZaBfokusr0B-w_jxW7H9OOSiujIILces/view?usp=drive_link)

> **Nota:** Asegúrate de seleccionar el Environment **"Personal Soft Backend Environment"** en Postman para que las peticiones apunten automáticamente al endpoint desplegado en Lambda o local.

## 🗄️ SQL (Parte 2 - 20%)
Resolución de la consulta solicitada en la sección teórica:

```sql
SELECT DISTINCT c.nombre, c.apellidos
FROM cliente c
JOIN inscripcion i ON c.id = i.idCliente
JOIN disponibilidad d ON i.idProducto = d.idProducto
JOIN visitan v ON v.idCliente = c.id AND v.idSucursal = d.idSucursal;