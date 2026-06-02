import { Category } from "../../categories/models/category.model";
import { Supplier } from "../../suppliers/models/supplier.model";
export interface Product {
    id: string;
    name: string;
    price: number; 
    quantity: number;
    category: Category["id"];
    supplierId: Supplier["id"];
    order: number;
}
5