import { Category } from "../../categories/models/category.model";
export interface Product {
    id: string;
    name: string;
    price: number; 
    quantity: number;
    category: Category["id"];
    order: number;
}
