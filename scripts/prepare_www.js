const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.resolve(rootDir, 'www');

// Asegurar carpeta www limpia
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Archivos y carpetas a copiar a www
const itemsToCopy = ['index.html', 'manifest.json', 'css', 'js', 'icons'];

for (const item of itemsToCopy) {
  const src = path.join(rootDir, item);
  const dest = path.join(wwwDir, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`✓ Copiado a www: ${item}`);
  }
}

// Aplicar parche a @capacitor/local-notifications para soporte background foreground:false
try {
  const patchNotifications = require('./patch_local_notifications');
  patchNotifications();
} catch (e) {
  console.warn('Advertencia al aplicar parche de notificaciones:', e.message);
}

console.log('✨ Build www completado para Capacitor Android!');
