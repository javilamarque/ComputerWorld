# Computerworld — proyecto local para Windows

Esta es la copia editable del catálogo de Computerworld. Incluye la página, el panel, fotos ilustrativas, datos del local y consultas por WhatsApp. No tiene carrito.

## Primer inicio

1. Instalá **Node.js 24 LTS** para Windows desde https://nodejs.org/en/download. Usá el instalador oficial y dejá habilitada la opción de agregar Node al PATH. Si ya tenés Node 24 o superior, no hace falta reinstalarlo.
2. Extraé todo el ZIP en `C:\Computerworld`. No ejecutes los archivos dentro del ZIP.
3. Abrí `INSTALAR.bat` con doble clic. Esta instalación requiere internet y descarga las dependencias.
4. Cuando termine, abrí `INICIAR.bat`.
5. Si el navegador se abrió antes de que termine de iniciar, esperá a ver la dirección en la ventana y recargá la página.

Página: http://127.0.0.1:5173

Panel: http://127.0.0.1:5173/admin

Dejá abierta la ventana de comandos mientras trabajás. Para detenerlo, presioná Ctrl+C en esa ventana. Para volver a usarlo otro día, abrí solamente `INICIAR.bat`.

## Cambiar productos sin programar

Entrá al panel o tocá «Administración» al pie de la página.

- **Nuevo producto**: título, categoría, descripción y precio opcional.
- **Cambiar foto**: JPG, PNG o WebP de hasta 5 MB.
- **Destacado**: aparece primero en el catálogo.
- **Visible**: permite ocultar un producto sin borrarlo.
- **Guardar producto**: guarda los cambios en esta PC.
- **Guardar datos**: guarda dirección, WhatsApp y el aviso de imágenes ilustrativas.

Las fotos son referencias visuales y no confirman modelos, precios ni stock. Antes del lanzamiento comercial usaremos fotos autorizadas de los modelos que efectivamente vendés. Sus fuentes están en `public/assets/SOURCES.md`.

## Dónde se guardan los cambios

- Productos y datos del negocio: `data/catalog.json` (se crea al guardar por primera vez).
- Fotos subidas desde el panel: `data/uploads`.
- Imágenes iniciales: `public/assets`.

Los datos sobreviven al cierre del navegador y al reinicio del programa. Para hacer una copia de seguridad, detené el programa y copiá toda la carpeta `data` a otro disco. Conservá también una copia del proyecto. No borres `data` cuando reemplacemos archivos del código.

Esta copia local y la versión privada de revisión son independientes: sus cambios no se sincronizan automáticamente. Para continuar juntos, compartí el código modificado y la carpeta `data` o una copia completa del proyecto, excluyendo `node_modules` y `dist` para que pese menos.

## Cambiar diseño y código

Podés abrir la carpeta en un editor, por ejemplo Visual Studio Code.

- `src/catalog.tsx`: página, catálogo, panel y productos iniciales.
- `src/styles.css`: colores, fuentes y estilos para pantallas grandes y celulares.
- `src/main.tsx`: entrada de React y selección de la página o el panel.
- `server.mjs`: servidor local, guardado del catálogo y recepción de fotos.
- `public/assets`: imágenes y fuentes.
- `package.json`: dependencias y comandos.

Si editás los productos iniciales en el código después de guardar desde el panel, seguirá mostrándose lo que está guardado en `data/catalog.json`. Usá el panel para modificar esos productos.

## Comandos manuales

En una terminal dentro de esta carpeta:

```powershell
npm install
npm run dev
```

Para verificar la compilación:

```powershell
npm run build
npm test
npm run preview
```

`preview` muestra la compilación local y conserva los mismos datos. Detené `dev` antes de iniciar `preview`, porque ambos usan el puerto 5173.

## Alcance de esta entrega

Este paquete funciona solamente en esta PC: el servidor escucha en `127.0.0.1` y el panel local no pide contraseña. No abre el sitio a internet ni a otras computadoras de la red y no necesita una cuenta de ChatGPT, Cloudflare ni un dominio.

**Antes del lanzamiento público**: configurar autenticación exclusiva del administrador, elegir alojamiento, respaldos, dominio, fotos definitivas y datos comerciales. Esta copia no está preparada para exponer el panel directamente a internet. La compilación local tampoco configura esas funciones por sí sola.

La versión alojada anterior sigue siendo privada. Nada de lo que guardes aquí se publica automáticamente.

## Si aparece un problema

- «node no se reconoce»: instalá Node 24 LTS, cerrá las ventanas de comandos y volvé a intentar.
- Puerto ocupado: cerrá la otra ventana de Computerworld y ejecutá `INICIAR.bat` otra vez.
- Ventana del navegador vacía al iniciar: esperá a ver la dirección en la consola y recargá.
- Error al instalar: conservá el mensaje completo para revisarlo juntos. No desactives las protecciones de Windows para resolverlo.

Validado con Node 24 en Linux: compilación, servidor local, guardado y recuperación del catálogo y carga de fotos. Los accesos BAT fueron preparados para Windows, pero no se ejecutaron en Windows en este entorno.

## Corrección del instalador

Este paquete corrige las rutas internas del archivo package-lock.json y fuerza la instalación de dependencias de desarrollo. Si usaste la primera entrega, copiá los archivos de este ZIP sobre la carpeta del proyecto y ejecutá REPARAR.bat. No borres la carpeta data: la reparación conserva productos y fotos.
