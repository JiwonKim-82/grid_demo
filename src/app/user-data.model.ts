export class UserData {
    constructor(
      public contact_level: string = '',
      public location: string = '',
      public phone_number: string = '',
      public email_address: string = '',
      public distributor: string = '',
      public annual_premium: number | null = null,
      public client_count: number | null = null,
      public face_amount: number | null = null,
      public first_name: string = '',
      public gross_premium_amt_itd: number | null = null,
      public last_name: string | null = '',
      public net_death_benefit_amt: number | null = null,
      public policy_count: number | null = null
    ) {}
  
    getPropertyType(propertyName: keyof UserData): 'string' | 'number' {
        const type = typeof this[propertyName];
    
        if (type === null) {
          return 'string';
        } else if (type === 'number') {
          return 'number';
        } else if (type === 'string') {
          return 'string';
        } else {
          return 'string'; 
        }
      }

    get fullName(): string {
        return `${this.first_name} ${this.last_name}`;
      }
  }
  
  
  