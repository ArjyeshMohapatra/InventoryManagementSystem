export interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    contactPerson: string;
    contactPersonGender: 'Male' | 'Female' | 'Other';
    website: string;
    gstNumber: string;
}