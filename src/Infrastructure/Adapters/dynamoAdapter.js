const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  TransactWriteCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');

module.exports = class DynamoDbAdapter {
  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_TABLE;
  }

  // Crear usuario o fondo
  async saveItem(item) {
    try {
      await this.docClient.send(new PutCommand({
        TableName: this.tableName,
        Item: item
      }));
      return item;
    } catch (error) {
      throw new Error(`Error en saveItem: ${error.message}`);
    }
  }

  // Buscar por ID
  async getItemByPrimaryKey(pk, sk) {
    try {
      const { Item } = await this.docClient.send(new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk }
      }));
      return Item || null;
    } catch (error) {
      throw new Error(`Error en getItemByPrimaryKey: ${error.message}`);
    }
  }

  // Buscar todos
  async getAllBySkPrefix(skPrefix) {
    try {
      const { Items } = await this.docClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "begins_with(sk, :prefix)",
        ExpressionAttributeValues: { ":prefix": skPrefix }
      }));
      return Items || [];
    } catch (error) {
      throw new Error(`Error en getAllBySkPrefix: ${error.message}`);
    }
  }

  // Buscar por nombre
  async getByName(skPrefix, nameValue) {
    try {
      const { Items } = await this.docClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "begins_with(sk, :prefix) AND contains(#n, :nameValue)",
        ExpressionAttributeNames: { "#n": "name" },
        ExpressionAttributeValues: {
          ":prefix": skPrefix,
          ":nameValue": nameValue
        }
      }));
      return Items || [];
    } catch (error) {
      throw new Error(`Error en getByName: ${error.message}`);
    }
  }

  // Buscar por email o phone
  async getByAttribute(skPrefix, attributeName, attributeValue) {
    try {
      const { Items } = await this.docClient.send(new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "begins_with(sk, :prefix) AND #attr = :val",
        ExpressionAttributeNames: { "#attr": attributeName },
        ExpressionAttributeValues: {
          ":prefix": skPrefix,
          ":val": attributeValue
        }
      }));
      return Items[0] || null;
    } catch (error) {
      throw new Error(`Error en getByAttribute (${attributeName}): ${error.message}`);
    }
  }

  //Obtener el historial por ID del usuario
  async getHistoryByPk(pk, skPrefix) {
    try {
      const params = {
        TableName: this.tableName,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":skPrefix": skPrefix
        }
      };
      const { Items } = await this.docClient.send(new QueryCommand(params));
      return Items || [];
    } catch (error) {
      throw new Error(`Error en getHistoryByPk: ${error.message}`);
    }
  }

  // Eliminar
  async deleteItem(pk, sk) {
    try {
      await this.docClient.send(new DeleteCommand({
        TableName: this.tableName,
        Key: { pk, sk }
      }));
      return { deleted: true };
    } catch (error) {
      throw new Error(`Error en deleteItem: ${error.message}`);
    }
  }

  //Actualiza usuario o fondo
  async updateItem(pk, sk, attributes) {
    try {
      const updateParts = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = {};

      Object.entries(attributes).forEach(([key, value]) => {
        updateParts.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      });

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { pk, sk },
        UpdateExpression: `SET ${updateParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
      });

      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      throw new Error(`Error en updateItem: ${error.message}`);
    }
  }

  // Transacción (Apertura de fondo)
  async executeSubscriptionTransaction(userId, fundId, fundName, newBalance, transactionId) {
    const timestamp = new Date().toISOString();
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: this.tableName,
            Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
            UpdateExpression: 'SET balance = :newBalance',
            ExpressionAttributeValues: { ':newBalance': newBalance }
          }
        },
        {
          Put: {
            TableName: this.tableName,
            Item: {
              pk: `USER#${userId}`,
              sk: `SUBSCRIPTION#${fundId}`,
              fundName,
              subscribedAt: timestamp
            }
          }
        },
        {
          Put: {
            TableName: this.tableName,
            Item: {
              pk: `USER#${userId}`,
              sk: `HISTORY#${transactionId}`,
              type: 'APERTURA',
              fundId,
              fundName,
              date: timestamp
            }
          }
        }
      ]
    };

    try {
      await this.docClient.send(new TransactWriteCommand(params));
      return { transactionId, timestamp };
    } catch (error) {
      throw new Error(`Error en transaction: ${error.message}`);
    }
  }

  // Transacción (cancelación de fondo)
  async executeCancelationTransaction(userId, fundId, fundName, refundAmount, newBalance, transactionId) {
    const timestamp = new Date().toISOString();
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: this.tableName,
            Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
            UpdateExpression: 'SET balance = :newBalance',
            ExpressionAttributeValues: { ':newBalance': newBalance }
          }
        },
        {
          Delete: {
            TableName: this.tableName,
            Key: { pk: `USER#${userId}`, sk: `SUBSCRIPTION#${fundId}` }
          }
        },
        {
          Put: {
            TableName: this.tableName,
            Item: {
              pk: `USER#${userId}`,
              sk: `HISTORY#${transactionId}`,
              type: 'CANCELACION',
              fundId,
              fundName,
              amount: refundAmount,
              date: timestamp
            }
          }
        }
      ]
    };

    try {
      await this.docClient.send(new TransactWriteCommand(params));
      return { transactionId, timestamp };
    } catch (error) {
      throw new Error(`Error en la transacción de cancelación: ${error.message}`);
    }
  }
};