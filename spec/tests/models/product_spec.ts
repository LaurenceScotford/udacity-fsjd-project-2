import getForeignKey from '../helpers/get_foreign_key';
import {ProductStore} from '../../../src/models/products';

const store = new ProductStore();


describe('Product Model', () => {
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
        const catId = await getForeignKey('category');
        const result = await store.create({
            id: '',
            name: 'Toothbrush', 
            price: 2.99,
            category: catId
        });
        expect(result).toEqual({
            id: result.id,
            name: 'Toothbrush',
            price: 2.99,
            category: catId
        });
    });

    it('should return a list of products when the index method is invoked', async () => {
        const catId = await getForeignKey('category');
        await store.create({
            id: '',
            name: 'Beach Ball', 
            price: 2.00, 
            category: catId
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct product when the show method is invoked', async () => {
        const catId = await getForeignKey('category');
        const result = await store.create({
            id: '',
            name: 'SatNav',
            price: 199.00, 
            category: catId
        });
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: test_data.id,
            name: 'SatNav',
            price: 199.00,
            category: catId
        });
    });

    it('should update the product name, price and category when the update method is invoked', async () => {
        const catId1 = await getForeignKey('category');
        const catId2 = await getForeignKey('category');
        const newProd = await store.create({
            id: '',
            name: 'Tomatoe', 
            price: 2.00, 
            category: catId1
        });
        newProd.name = 'Tomato';
        newProd.price = 0.20;
        newProd.category = catId2;
        const result = await store.update(newProd);
        expect(result).toEqual({
            id: result.id,
            name: 'Tomato',
            price: 0.20,
            category: catId2
        });
    });

    it('should remove the product when the delete method is invoked', async () => {
        const catId = await getForeignKey('category');
        const newProd = await store.create({
            id: '',
            name: 'Watering Can', 
            price: 19.75, 
            category: catId
        });
        const id = newProd.id;
        const deletedProduct = await store.delete(id);
        expect(deletedProduct).toEqual({
            id: id,
            name: 'Watering Can', 
            price: 19.75, 
            category: catId
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});