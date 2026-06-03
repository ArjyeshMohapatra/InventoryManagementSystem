import { Product } from "../../products/models/product.model";
export interface InventoryTransaction {
    id: string;
    productId: Product["id"];
    type: 'ADD' | 'REMOVE';
    quantity: number;
    date: string;
}