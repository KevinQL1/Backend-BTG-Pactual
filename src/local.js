const app = require('#infrastructure/server.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`🚀 Servidor Local corriendo en: http://localhost:${PORT}`);
    console.log(`✅ Base de Datos: ${process.env.DYNAMODB_TABLE}`);
    console.log('--------------------------------------------------');
});