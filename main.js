// Arranque. Se carga como script normal (comparte variables con los demás archivos): el orden importa, ver index.html.
draw();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
