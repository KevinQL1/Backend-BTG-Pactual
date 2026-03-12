module.exports = class FundEntity {
  constructor({ pk, name, minimumAmount, category }) {
    this.internalId = pk; 
    this.code = pk ? pk.replace('FUND#', '') : undefined;
    this.name = name;
    this.minimumAmount = minimumAmount;
    this.category = category;
    
    this.validate();
  }

  validate() {
    if (!this.internalId) {
      throw new Error('The database identifier (PK) is required');
    }

    if (!this.name || this.name.trim() === '') {
      throw new Error('The fund name is required');
    }

    if (this.minimumAmount === undefined || typeof this.minimumAmount !== 'number') {
      throw new Error('The minimum amount must be a numeric value');
    }
  }
};