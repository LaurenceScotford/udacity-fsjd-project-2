import {Category, CategoryStore} from '../../../src/models/categories';
import {Product, ProductStore} from '../../../src/models/products';

const categories = new CategoryStore();
const store = new ProductStore();


describe("Product Model", () => {
    it('should have an index method', () => {
        expect(store.index).toBeDefined();
    });

    it('should have a show method', () => {
        expect(store.show).toBeDefined();
    });

    it('should have a create method', () => {
        expect(store.create).toBeDefined();
    });

    it('should have a update method', () => {
        expect(store.update).toBeDefined();
    });

    it('should have a delete method', () => {
        expect(store.delete).toBeDefined();
    });

    it('should add a product when the create method is invoked', async () => {
        const category = await categories.create({
            id: '',
            category: 'Dental'
        });
        const catId = category.id.toString();
        const result = await store.create({
            id: '',
            name: 'Toothbrush', 
            price: '2.99',
            category: category.id
        });
        expect(result).toEqual({
            id: result.id,
            name: 'Toothbrush',
            price: '2.99',
            category: catId
        });
    });

    it('should return a list of products when the index method is invoked', async () => {
        const category = await categories.create({
            id: '',
            category: 'Lesiure'
        });
        await store.create({
            id: '',
            name: 'Beach Ball', 
            price: '2.00', 
            category: category.id
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct product when the show method is invoked', async () => {
        const category = await categories.create({
            id: '',
            category: 'Motoring'
        });
        const result = await store.create({
            id: '',
            name: 'SatNav',
            price: '199.00', 
            category: category.id
        });
        const catId = category.id.toString();
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: test_data.id,
            name: 'SatNav',
            price: '199.00',
            category: catId
        });
    });

    it('should update the product name, price and category when the update method is invoked', async () => {
        const category1 = await categories.create({
            id: '',
            category: 'Vegetables'
        });
        const category2 = await categories.create({
            id: '',
            category: 'Fruit'
        });
        const newProd = await store.create({
            id: '',
            name: 'Tomatoe', 
            price: '2.00', 
            category: category1.id
        });
        newProd.name = 'Tomato';
        newProd.price = '0.20';
        newProd.category = category2.id;
        const catId = category2.id.toString();
        const result = await store.update(newProd);
        expect(result).toEqual({
            id: result.id,
            name: 'Tomato',
            price: '0.20',
            category: catId
        });
    });

    it('should remove the product when the delete method is invoked', async () => {
        const category = await categories.create({
            id: '',
            category: 'Garden'
        });
        const newProd = await store.create({
            id: '',
            name: 'Watering Can', 
            price: '19.75', 
            category: category.id
        });
        const id = newProd.id;
        await store.delete(id);
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});