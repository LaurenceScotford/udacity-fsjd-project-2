import dotenv from 'dotenv';
dotenv.config();

import getForeignKey from '../helpers/get_foreign_key';
import { ProductStore } from '../../../src/models/products';

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

    it('should have a productsByCategory method', () => {
        expect(store.productsByCategory).toBeDefined();
    });

    it('should have a topProducts method', () => {
        expect(store.topProducts).toBeDefined();
    });

    it('should add a product when the create method is invoked', async () => {
        const catId = await getForeignKey('category');
        const result = await store.create({
            id: '',
            name: 'Toothbrush',
            price: 2.99,
            url: 'fhdiuhafhuaierhf.com/toothbrush',
            description: 'For cleaning your teeth.',
            category: catId
        });
        expect(result).toEqual({
            id: result.id,
            name: 'Toothbrush',
            price: 2.99,
            url: 'fhdiuhafhuaierhf.com/toothbrush',
            description: 'For cleaning your teeth.',
            category: catId
        });
    });

    it('should return a list of products when the index method is invoked', async () => {
        const catId = await getForeignKey('category');
        await store.create({
            id: '',
            name: 'Beach Ball',
            price: 2.00,
            url: 'fhdiuhafhuaierhf.com/beachball',
            description: 'For fun in the sun.',
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
            url: 'fhdiuhafhuaierhf.com/satnav',
            description: 'For finding your way.',
            category: catId
        });
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: test_data.id,
            name: 'SatNav',
            price: 199.00,
            url: 'fhdiuhafhuaierhf.com/satnav',
            description: 'For finding your way.',
            category: catId
        });
    });

    it('should update the product name, price and category when the update method is invoked', async () => {
        const catId1 = await getForeignKey('category');
        const catId2 = await getForeignKey('category');
        const newProd = await store.create({
            id: '',
            name: 'Tomato',
            price: 2.00,
            url: 'fhdiuhafhuaierhf.com/tomato',
            description: 'For eating.',
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
            url: 'fhdiuhafhuaierhf.com/tomato',
            description: 'For eating.',
            category: catId2
        });
    });

    it('should remove the product when the delete method is invoked', async () => {
        const catId = await getForeignKey('category');
        const newProd = await store.create({
            id: '',
            name: 'Watering Can',
            price: 19.75,
            url: 'fhdiuhafhuaierhf.com/wateringcan',
            description: 'For helping your garden to grow.',
            category: catId
        });
        const id = newProd.id;
        const deletedProduct = await store.delete(id);
        expect(deletedProduct).toEqual({
            id: id,
            name: 'Watering Can',
            price: 19.75,
            url: 'fhdiuhafhuaierhf.com/wateringcan',
            description: 'For helping your garden to grow.',
            category: catId
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });

    it('should show all the products in a category when the productsByCategory method is invoked', async () => {
        const catId = await getForeignKey('category');
        const newProd = await store.create({
            id: '',
            name: 'Smart Phone',
            price: 399.95,
            url: 'fhdiuhafhuaierhf.com/smartphone',
            description: 'For staying in touch.',
            category: catId
        });
        const newProd2 = await store.create({
            id: '',
            name: 'Tablet Computer',
            price: 299.95,
            url: 'fhdiuhafhuaierhf.com/tabletcomputer',
            description: 'For being productive.',
            category: catId
        });
        const productsByCategory = await store.productsByCategory(catId);
        expect(productsByCategory).toEqual([
            {
                id: newProd.id,
                name: 'Smart Phone',
                url: 'fhdiuhafhuaierhf.com/smartphone',
                description: 'For staying in touch.',
                price: 399.95,
                category: catId
            },
            {
                id: newProd2.id,
                name: 'Tablet Computer',
                price: 299.95,
                url: 'fhdiuhafhuaierhf.com/tabletcomputer',
                description: 'For being productive.',
                category: catId
            }
        ]);
    });

    it('should show up to x top products when the topProducts(x) method is invoked', async () => {
        await getForeignKey('order');
        const topProducts = await store.topProducts(1);
        expect(topProducts).not.toBe([]);
    });
});