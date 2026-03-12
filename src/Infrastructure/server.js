const express = require('express');
const { serverError } = require('#utils/httpResponse.js');
const schemaValidator = require('#utils/schemaValidator.js');

// Importación de Esquemas
const userCreateSchema = require('#schemas/users/userCreateSchema.js');
const userUpdateSchema = require('#schemas/users/userUpdateSchema.js');
const fundCreateSchema = require('#schemas/funds/fundCreateSchema.js');
const fundUpdateSchema = require('#schemas/funds/fundUpdateSchema.js');
const subscriptionSchema = require('#schemas/funds/transactions/subscriptionSchema.js');

// Importación de Handlers Users
const userCreate = require('#handlers/users/userCreate.js');
const userGetAll = require('#handlers/users/userGetAll.js');
const userGetById = require('#handlers/users/userGetById.js');
const userUpdate = require('#handlers/users/userUpdate.js');
const userDelete = require('#handlers/users/userDelete.js');
const userGetByName = require('#handlers/users/userGetByName.js');
const userGetHistory = require('#handlers/users/userGetHistory.js');
const userGetByContact = require('#handlers/users/userGetByContact.js');
const userGetTransactionById = require('#infrastructure/Handlers/Users/userGetTransactionById.js');


// Importación de Handlers Funds
const fundCreate = require('#handlers/funds/fundCreate.js');
const fundGetAll = require('#handlers/funds/fundGetAll.js');
const fundGetById = require('#handlers/funds/fundGetById.js');
const fundUpdate = require('#handlers/funds/fundUpdate.js');
const fundDelete = require('#handlers/funds/fundDelete.js');
const fundGetByName = require('#handlers/funds/fundGetByName.js');
const fundSubscribe = require('#handlers/funds/transactions/fundSubscribe.js');
const fundUnsubscribe = require('#handlers/funds/transactions/fundUnsubscribe.js');

const app = express();
app.use(express.json());

// RUTAS DE USUARIOS
app.get('/api/users/contact', userGetByContact)
app.get('/api/users/search', userGetByName);
app.post('/api/users', schemaValidator(userCreateSchema), userCreate);
app.get('/api/users/getAll', userGetAll);
app.get('/api/users/:userId/history', userGetHistory);
app.get('/api/users/:userId/history/:transactionId', userGetTransactionById);
app.get('/api/users/:userId', userGetById);
app.put('/api/users/:userId', schemaValidator(userUpdateSchema), userUpdate);
app.delete('/api/users/:userId', userDelete);

// RUTAS DE TRANSACCIONES
app.post('/api/funds/subscribe', schemaValidator(subscriptionSchema), fundSubscribe);
app.delete('/api/funds/unsubscribe', schemaValidator(subscriptionSchema), fundUnsubscribe);

// RUTAS DE FONDOS
app.get('/api/funds/search', fundGetByName);
app.post('/api/funds', schemaValidator(fundCreateSchema), fundCreate);
app.get('/api/funds/getAll', fundGetAll);
app.get('/api/funds/:fundId', fundGetById);
app.put('/api/funds/:fundId', schemaValidator(fundUpdateSchema), fundUpdate);
app.delete('/api/funds/:fundId', fundDelete);

// Middleware de Error
app.use((err, req, res, next) => {
  console.error(err);
  return serverError(res, req.originalUrl);
});

module.exports = app;