# Registro y control · U.E.P. Travesuras de Simón

Archivos: `index.html` (panel general), `admin.html` (administrativo + GitHub), `calculadora.html` (tasa y matrícula), `style.css`, `app.js`, `logo.png`, `data.json`.

## Puesta en marcha
1. Crea un repositorio de GitHub y sube **todos** los archivos (las 3 páginas comparten `app.js`, `style.css` y `data.json`).
2. Genera un token fine-grained solo para ese repositorio con *Contents: Read and write*.
3. Abre `admin.html` → *Conexión GitHub*: usuario, repositorio, rama, archivo (`data.json`) y token. Queda guardado en ese dispositivo y lo usan las 3 páginas.
4. En *Administrativo*: sube el Excel de matrícula, define mensualidad ($ y Bs), primer mes y día de vencimiento, y registra abonos.
5. Pulsa **Guardar en GitHub** al terminar. En otros dispositivos, ⟳ trae los cambios. El texto junto a la tasa avisa «cambios sin publicar».

## Tasa BCV
- Se escribe **solo en Administrativo** (4 decimales) y se registra con *Registrar tasa del día*; cada día queda en el registro. El panel general y la calculadora la toman de ahí.
- *Traer tasa del BCV* consulta `ve.dolarapi.com`, que replica la tasa oficial. Revisa el valor contra bcv.org.ve antes de registrarla. Si falla, escríbela a mano.
- Si la tasa no es de hoy, el encabezado muestra «desactualizada».

## Privacidad
Hay cédulas, teléfonos y datos de menores. Usa repositorio **privado** (con Pages gratis un repositorio privado no se publica; abre las páginas desde el repo o un hosting propio) y no compartas el token.

## Contraseña del panel administrativo
`admin.html` pide contraseña (se guarda como huella SHA-256, no en texto). Es un candado de pantalla, no seguridad real: la protección verdadera es el repositorio privado y el token. Para cambiarla: `echo -n 'nueva' | sha256sum` y reemplaza el valor `H` en `admin.html`.
