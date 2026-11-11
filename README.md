# Registro y control · U.E.P. Travesuras de Simón

Archivos: `index.html` (panel general), `admin.html` (administrativo + GitHub), `calculadora.html` (tasa y matrícula), `style.css`, `app.js`, `logo.png`, `data.json`.

## Puesta en marcha
1. Crea un repositorio de GitHub y sube **todos** los archivos (las 3 páginas comparten `app.js`, `style.css` y `data.json`).
2. Genera un token fine-grained solo para ese repositorio con *Contents: Read and write*.
3. Abre `admin.html` → *Conexión GitHub*: usuario, repositorio, rama, archivo (`data.json`) y token. Queda guardado en ese dispositivo y lo usan las 3 páginas.
4. En *Administrativo*: sube el Excel de matrícula (sirve directamente el archivo interno `.xlsm`), define mensualidad ($ y Bs), primer mes y día de vencimiento, y registra abonos.
5. Pulsa **Guardar en GitHub** al terminar. En otros dispositivos, ⟳ trae los cambios. El texto junto a la tasa avisa «cambios sin publicar».

## Tasa BCV
- Se escribe **solo en Administrativo** (4 decimales) y se registra con *Registrar tasa del día*; cada día queda en el registro. El panel general y la calculadora la toman de ahí.
- *Traer tasa del BCV* consulta `ve.dolarapi.com`, que replica la tasa oficial. Revisa el valor contra bcv.org.ve antes de registrarla. Si falla, escríbela a mano.
- Si la tasa no es de hoy, el encabezado muestra «desactualizada».

## Privacidad
Hay cédulas, teléfonos y datos de menores. Usa repositorio **privado** (con Pages gratis un repositorio privado no se publica; abre las páginas desde el repo o un hosting propio) y no compartas el token.

## Contraseña del panel administrativo
`admin.html` pide contraseña (se guarda como huella SHA-256, no en texto). Es un candado de pantalla, no seguridad real: la protección verdadera es el repositorio privado y el token. Para cambiarla: `echo -n 'nueva' | sha256sum` y reemplaza el valor `H` en `admin.html`.

## Excel de matrícula
- Las columnas se reconocen **por su título**, no por su posición: Nombres y apellidos, C. escolar o Cédula, Unificada o Fecha de nacimiento, Edad, Sexo, Grado, Nombres y apellidos del representante, Cédula de identidad, Dirección y Teléfono. Puedes agregar o mover columnas sin romper la carga.
- Los grados se unifican solos («Grupo 1», «1er grupo» y «Primer Grupo» quedan como «1er Grupo»; igual con Grado y Año).
- Estudiantes sin grado aparecen en el estante «Por asignar» del panel general, para que nadie quede fuera del reporte.
- Al cargar se muestra un resumen: cuántos por nivel, quiénes no tienen grado o cédula, y si algún abono quedó sin estudiante.
- La cédula escolar es el identificador que enlaza los abonos: no la cambies a un estudiante que ya tiene pagos.
