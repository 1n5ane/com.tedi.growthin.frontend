const {defineConfig} = require('@vue/cli-service');
const fs = require('fs');
const path = require('path');

// generate private key for CA
// openssl genpkey -algorithm RSA -out ca-key.pem

// Create a self-signed CA certificate
// openssl req -x509 -new -nodes -key ca-key.pem -sha256 -days 365 -out ca-cert.pem -subj "/CN=TEDI"

//Generate private key for server (no passphrase)
//openssl genpkey -algorithm RSA -out localhost-key.pem

// Create Certificate Signing Request for server certificate
// openssl req -new -key localhost-key.pem -out localhost.csr -subj "/CN=localhost"

//Create self signed certificate
// openssl x509 -req -in localhost.csr -signkey localhost-key.pem -out localhost-cert.pem -days 365

//Sign with CA
// openssl x509 -req -in localhost.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out localhost-cert.pem -days 365 -sha256
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-cert.pem')),
        ca: fs.existsSync(path.resolve(__dirname, 'certs/ca-cert.pem')) ? fs.readFileSync(path.resolve(__dirname, 'certs/ca-cert.pem')) : undefined, // Optional
      },
    },
    headers: {
      'Strict-Transport-Security': 'max-age=0' // Disable HSTS header
    },
    hot: true,
  }
});
