// server.js
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let sock;

app.get('/qr', async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection } = update;
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      res.send(`<html><body style="background:black;text-align:center;color:white;">
        <h2>Scanner le QR Code</h2>
        <img src='${qrImage}' />
        <br><a href='/' style='color:lime;'>Retour</a>
      </body></html>`);
    } else if (connection === 'open') {
      res.redirect('/');
    }
  });
});

app.get('/pairing', (req, res) => {
  res.send('Fonction de pairing non activée. Implémente si nécessaire.');
});

app.get('/error', (req, res) => {
  res.send('<h1 style="color:red;text-align:center;">Une erreur est survenue. Réessaie.</h1>');
});

app.listen(PORT, () => console.log(`Serveur en ligne sur http://localhost:${PORT}`));
      
