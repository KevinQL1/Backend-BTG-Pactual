module.exports = class UserEntity {
  constructor({ pk, balance, name, notificationType, email, phone }) {
    this.id = pk ? pk.replace('USER#', '') : undefined;
    this.balance = balance;
    this.name = name;
    this.notificationType = notificationType;
    this.email = email;
    this.phone = phone;

    this.validate();
  }

  validate() {
    if (!this.id) throw new Error('User ID is required');
    if (this.balance === undefined || typeof this.balance !== 'number') {
      throw new Error('User balance is required and must be a number');
    }
    if (this.balance < 0) throw new Error('Balance cannot be negative');
    if (!this.name || this.name.trim() === '') throw new Error('User name is required');

    if (!this.notificationType) {
      throw new Error('notificationType is required (email or sms)');
    }

    if (this.notificationType === 'email' && (!this.email || !this.email.includes('@'))) {
      throw new Error('Email is required when notificationType is email');
    }

    if (this.notificationType === 'sms' && (!this.phone || this.phone.trim() === '')) {
      throw new Error('Phone is required when notificationType is sms');
    }
  }

  canSubscribe(fundMinimumAmount) {
    return this.balance >= fundMinimumAmount;
  }

  getNewBalance(fundMinimumAmount) {
    return this.balance - fundMinimumAmount;
  }
};