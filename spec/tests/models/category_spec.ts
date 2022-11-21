import dotenv from 'dotenv';
dotenv.config();

import { CategoryStore } from '../../../src/models/categories';

const store = new CategoryStore();

describe('Category Model', () => {
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

    it('should add a category when the create method is invoked', async () => {
        const result = await store.create({
            id: '',
            category: 'Groceries'
        });
        expect(result.category).toEqual('Groceries');
    });

    it('should return a list of categories when the index method is invoked', async () => {
        await store.create({
            id: '',
            category: 'Fitness'
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct category when the show method is invoked', async () => {
        const result = await store.create({
            id: '',
            category: 'Health'
        });
        const test_data = await store.show(result.id);
        expect(test_data.category).toEqual('Health');
    });

    it('should update the category name when the update method is invoked', async () => {
        const newCat = await store.create({
            id: '',
            category: 'Toys'
        });
        newCat.category = 'Games';
        const result = await store.update(newCat);
        expect(result.category).toEqual('Games');
    });

    it('should remove the category when the delete method is invoked', async () => {
        const newCat = await store.create({
            id: '',
            category: 'Clothing'
        });
        const id = newCat.id;
        const deletedCat = await store.delete(id);
        expect(deletedCat).toEqual({
            id: id,
            category: 'Clothing'
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});