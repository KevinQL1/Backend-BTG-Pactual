const UserEntity = require('#entities/userEntity.js');
const DynamoDbAdapter = require('#adapters/dynamoAdapter.js');

module.exports = class UserService {
    constructor() {
        this.dbAdapter = new DynamoDbAdapter();
    }

    async createUser(data) {
        const userId = data.pk.includes('#') ? data.pk.split('#')[1] : data.pk;

        const existingUser = await this.dbAdapter.getItemByPrimaryKey(`USER#${userId}`, 'PROFILE');
        if (existingUser) {
            throw new Error(`User with ID ${userId} already exists`);
        }

        if (data.email) {
            const existingEmail = await this.dbAdapter.getByAttribute('PROFILE', 'email', data.email);
            if (existingEmail) throw new Error(`User with email ${data.email} already exists`);
        }

        if (data.phone) {
            const existingPhone = await this.dbAdapter.getByAttribute('PROFILE', 'phone', data.phone);
            if (existingPhone) throw new Error(`User with phone ${data.phone} already exists`);
        }

        if (data.balance < 500000) {
            throw new Error('The balance could not be less than $500,000');
        }

        const user = new UserEntity(data);
        const item = {
            pk: `USER#${user.id}`,
            sk: 'PROFILE',
            name: user.name,
            balance: user.balance,
            notificationType: user.notificationType,
            email: user.email,
            phone: user.phone
        };

        return await this.dbAdapter.saveItem(item);
    }

    async getUserById(userId) {
        const record = await this.dbAdapter.getItemByPrimaryKey(`USER#${userId}`, 'PROFILE');
        if (!record) throw new Error("User not found");

        return new UserEntity(record);
    }

    async getAllUsers() {
        const records = await this.dbAdapter.getAllBySkPrefix('PROFILE');
        return records.map(r => new UserEntity(r));
    }

    async getUserByName(name) {
        const records = await this.dbAdapter.getByName('PROFILE', name);

        if (!records || records.length === 0) {
            throw new Error(`No users found containing the name: ${name}`);
        }

        return records.map(record => new UserEntity(record));
    }

    async updateUser(userId, data) {
        if (!(await this.getUserById(userId))) {
            throw new Error("User not found");
        }

        if (data.balance && data.balance < 500000) {
            throw new Error('The balance could not be less than $500,000');
        }

        return await this.dbAdapter.updateItem(`USER#${userId}`, 'PROFILE', data);
    }

    async deleteUser(userId) {
        if (!(await this.getUserById(userId))) {
            throw new Error("User not found");
        }

        return await this.dbAdapter.deleteItem(`USER#${userId}`, 'PROFILE');
    }

    async validateUserBalance(user, amount) {
        if (!user.canSubscribe(amount)) {
            throw new Error(`No tiene saldo disponible para vincularse al fondo`);
        }
        return user.getNewBalance(amount);
    }

    async getUserHistory(userId) {
        const records = await this.dbAdapter.getHistoryByPk(`USER#${userId}`, 'HISTORY#');
        if (!records) throw new Error("User not found");

        return records.map(record => ({
            ...record,
            idTransaction: record.sk.replace('HISTORY#', ''),
        }));
    }

    async getUserByContact(type, value) {
        if (!['email', 'phone'].includes(type)) throw new Error('Invalid contact type, only PHONE or EMAIL');
        const record = await this.dbAdapter.getByAttribute('PROFILE', type, value);
        if (!record) throw new Error(`User with ${type} ${value} not found`);
        return new UserEntity(record);
    }
};