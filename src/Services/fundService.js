const { v4: uuidv4 } = require('uuid');
const FundEntity = require('#entities/fundEntity.js');
const UserService = require('#services/userService.js');
const DynamoDbAdapter = require('#adapters/dynamoAdapter.js');
const NotificationEmailService = require('#services/notificationEmailService.js');
const NotificationSMSService = require('#services/notificationSMSService.js');

module.exports = class FundService {
    constructor() {
        this.dbAdapter = new DynamoDbAdapter();
        this.userService = new UserService();
        this.emailService = new NotificationEmailService();
        this.smsService = new NotificationSMSService();
    }

    async createFund(data) {
        const fundId = data.code || (data.pk && data.pk.includes('#') ? data.pk.split('#')[1] : data.pk);

        const existingFunds = await this.dbAdapter.getByName('METADATA', data.name);
        if (existingFunds && existingFunds.length > 0) {
            throw new Error(`Fund with name "${data.name}" already exists`);
        }

        const existingFundById = await this.dbAdapter.getItemByPrimaryKey(`FUND#${fundId}`, 'METADATA');
        if (existingFundById) {
            throw new Error(`Fund with id ${fundId} already exists`);
        }

        const fund = new FundEntity(data);
        const item = {
            pk: `FUND#${fund.code}`,
            sk: 'METADATA',
            name: fund.name,
            minimumAmount: fund.minimumAmount,
            category: fund.category
        };
        return await this.dbAdapter.saveItem(item);
    }

    async getAllFunds() {
        const records = await this.dbAdapter.getAllBySkPrefix('METADATA');
        return records.map(r => new FundEntity(r));
    }

    async getFundById(fundId) {
        const record = await this.dbAdapter.getItemByPrimaryKey(`FUND#${fundId}`, 'METADATA');
        if (!record) throw new Error("Fund not found");
        return new FundEntity(record);
    }

    async getFundByName(name) {
        const records = await this.dbAdapter.getByName('METADATA', name);

        if (!records || records.length === 0) {
            throw new Error(`No funds found containing the name: ${name}`);
        }

        return records.map(record => new FundEntity(record));
    }

    async getTransactionById(userId, transactionId) {
        const record = await this.dbAdapter.getItemByPrimaryKey(`USER#${userId}`, `HISTORY#${transactionId}`);

        if (!record) {
            throw new Error(`Transaction ${transactionId} not found for this user`);
        }

        return {
            ...record,
            idTransaction: transactionId
        };
    }

    async updateFund(fundId, data) {
        if (!(await this.getFundById(fundId))) {
            throw new Error("Fund not found");
        }

        return await this.dbAdapter.updateItem(`FUND#${fundId}`, 'METADATA', data);
    }

    async deleteFund(fundId) {
        if (!(await this.getFundById(fundId))) {
            throw new Error("Fund not found");
        }

        return await this.dbAdapter.deleteItem(`FUND#${fundId}`, 'METADATA');
    }

    async notifyUser(user, fundName, actionType, newBalance) {
        const message = actionType === 'SUBSCRIPTION'
            ? `vinculación exitosa al fondo ${fundName}`
            : `cancelación exitosa del fondo ${fundName}`;

        if (user.notificationType === 'email') {
            this.emailService.send(user.email, user.name, fundName, actionType, newBalance);
        } else if (user.notificationType === 'sms') {
            this.smsService.send(user.phone, user.name, fundName, actionType, newBalance);
        }
    }

    async subscribeToFund(userId, fundId) {
        const user = await this.userService.getUserById(userId);
        const fundRecord = await this.dbAdapter.getItemByPrimaryKey(`FUND#${fundId}`, 'METADATA');

        if (!fundRecord) throw new Error("Fund not found");
        const fund = new FundEntity(fundRecord);

        let newBalance;
        try {
            newBalance = await this.userService.validateUserBalance(user, fund.minimumAmount);
        } catch (error) {
            throw new Error(`No tiene saldo disponible para vincularse al fondo ${fund.name}`);
        }

        const transactionId = uuidv4();
        await this.dbAdapter.executeSubscriptionTransaction(
            user.id,
            fund.code,
            fund.name,
            newBalance,
            transactionId
        );

        this.notifyUser(user, fund.name, 'SUBSCRIPTION', newBalance);

        return {
            transactionId,
            fundName: fund.name,
            newBalance
        };
    }

    async unsubscribeFromFund(userId, fundId) {
        const subscription = await this.dbAdapter.getItemByPrimaryKey(`USER#${userId}`, `SUBSCRIPTION#${fundId}`);
        if (!subscription) throw new Error("You are not subscribed to this fund");

        const user = await this.userService.getUserById(userId);
        const fundRecord = await this.dbAdapter.getItemByPrimaryKey(`FUND#${fundId}`, 'METADATA');
        const fund = new FundEntity(fundRecord);

        const refundAmount = Number(fund.minimumAmount);
        const currentBalance = Number(user.balance);
        const newBalance = currentBalance + refundAmount;
        const transactionId = uuidv4();

        const result = await this.dbAdapter.executeCancelationTransaction(
            userId,
            fundId,
            fund.name,
            refundAmount,
            newBalance,
            transactionId
        );

        this.notifyUser(user, fund.name, 'UNSUBSCRIBE', newBalance);

        return result;
    }
};