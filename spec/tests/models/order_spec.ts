import getForeignKey from '../helpers/get_foreign_key';
import {OrderStore} from '../../../src/models/orders';

const store = new OrderStore();


describe("Order Model", () => {
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

    it('should add an order when the create method is invoked', async () => {
        const userId = await getForeignKey('user');
        const result = await store.create({
            id: '',
            user_id: userId, 
            status: 'active'
        });
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active'
        });
    });

    it('should return a list of orders when the index method is invoked', async () => {
        const userId = await getForeignKey('user');
        await store.create({
            id: '',
            user_id: userId, 
            status: 'active'
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct order when the show method is invoked', async () => {
        const userId = await getForeignKey('user');
        const result = await store.create({
            id: '',
            user_id: userId, 
            status: 'active'
        });
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active'
        });
    });

    it('should update the user_id and status when the update method is invoked', async () => {
        const userId1 = await getForeignKey('user');
        const newOrder = await store.create({
            id: '',
            user_id: userId1,  
            status: 'active'
        });
        const userId2 = await getForeignKey('user');
        newOrder.user_id = userId2;
        newOrder.status = 'complete';
        const result = await store.update(newOrder);
        expect(result).toEqual({
            id: result.id,
            user_id: userId2,
            status: 'complete'
        });
    });

    it('should update selective properties when the update method is invoked with not all properties present', async () => {
        const userId = await getForeignKey('user');
        const newOrder = await store.create({
            id: '',
            user_id: userId,  
            status: 'active'
        });
        newOrder.status = 'complete';
        const result = await store.update(newOrder);
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'complete'
        });
    });

    it('should remove the order when the delete method is invoked', async () => {
        const userId = await getForeignKey('user');
        const newOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'complete'
        });
        const id = newOrder.id;
        const deletedOrder = await store.delete(id);
        expect(deletedOrder).toEqual({
            id: id,
            user_id: userId, 
            status: 'complete'
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});