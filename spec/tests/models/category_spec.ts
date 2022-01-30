import {Category, CategoryStore} from '../../../src/models/categories';

const store = new CategoryStore();

describe("Category Model", () => {
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
        const result = await store.create('Groceries');
        expect(result).toEqual({
            id: 1,
            category: 'Groceries'
        });
    });

    it('should return a list of categories when the index method is invoked', async () => {
        const result = await store.index();
        expect(result).toEqual([{
            id: 1,
            category: 'Groceries'
        }]);
    });

    let test_data : Category;

    it('should return the correct category when the show method is invoked', async () => {
        test_data = await store.show('1');
        expect(test_data).toEqual({
            id: 1,
            category: 'Groceries'
        });
    });

    it('should update the category name when the update method is invoked', async () => {
        test_data.category = 'Clothing';
        const result = await store.update(test_data);
        expect(result).toEqual({
            id: 1,
            category: 'Clothing'
        });
    });

    it('should remove the category when the delete method is invoked', async () => {
        await store.delete('1');
        const result = await store.index();
        expect(result).toEqual([]);
    });
});