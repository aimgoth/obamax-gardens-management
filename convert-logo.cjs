// Simple script to copy logo.jpg as logo.png for electron-builder
// electron-builder accepts PNG and converts to ICO automatically
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public', 'logo.jpg');
const dst = path.join(__dirname, 'public', 'logo.png');

if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log('logo.png created from logo.jpg');
} else {
    console.log('logo.jpg not found!');
}
