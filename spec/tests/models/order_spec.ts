import getForeignKey from '../helpers/get_foreign_key';
import {OrderStore} from '../../../src/models/orders';

const store = new OrderStore();


describe('Order Model', () => {
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

    it('should have a currentOrder method', () => {
        expect(store.currentOrder).toBeDefined();
    });

    it('should have a completedOrders method', () => {
        expect(store.completedOrders).toBeDefined();
    });

    it('should add an order when the create method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId = await getForeignKey('product');
        const result = await store.create({
            id: '',
            user_id: userId, 
            status: 'active',
            products: [
                {product_id: productId, quantity: 1}
            ]
        });
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active',
            products: [
                {product_id: productId, quantity: 1}
            ]
        });
    });

    it('should return a list of orders when the index method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId = await getForeignKey('product');
        await store.create({
            id: '',
            user_id: userId, 
            status: 'active',
            products: [
                {product_id: productId, quantity: 1}
            ]
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct order when the show method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId = await getForeignKey('product');
        const result = await store.create({
            id: '',
            user_id: userId, 
            status: 'active',
            products: [
                {product_id: productId, quantity: 1}
            ]
        });
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active',
            products: [
                {product_id: productId, quantity: 1}
            ]
        });
    });

    it('should update the user_id, status and products when the update method is invoked', async () => {
        const userId1 = await getForeignKey('user');
        const productId1 = await getForeignKey('product');
        const newOrder = await store.create({
            id: '',
            user_id: userId1,  
            status: 'active',
            products: [
                {product_id: productId1, quantity: 1}
            ]
        });
        const userId2 = await getForeignKey('user');
        const productId2 = await getForeignKey('product');
        newOrder.user_id = userId2;
        newOrder.status = 'complete';
        newOrder.products = [
            {product_id: productId2, quantity: 2}
        ];
        const result = await store.update(newOrder);
        expect(result).toEqual({
            id: result.id,
            user_id: userId2,
            status: 'complete',
            products: [
                {product_id: productId2, quantity: 2}
            ]
        });
    });

    it('should update selective properties when the update method is invoked with not all properties present', async () => {
        const userId = await getForeignKey('user');
        const productId1 = await getForeignKey('product');
        const newOrder = await store.create({
            id: '',
            user_id: userId,  
            status: 'active',
            products: [
                {product_id: productId1, quantity: 1}
            ]
        });
        newOrder.user_id = '';
        newOrder.status = 'complete';
        newOrder.products = [];
        const result = await store.update(newOrder);
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'complete',
            products: [
                {product_id: productId1, quantity: 1}
            ]
        });
        const productId2 = await getForeignKey('product');
        newOrder.user_id = '';
        newOrder.status = '';
        newOrder.products = [
            {product_id: productId2, quantity: 2}
        ];
        const result2 = await store.update(newOrder);
        expect(result2).toEqual({
            id: result.id,
            user_id: userId,
            status: 'complete',
            products: [
                {product_id: productId2, quantity: 2}
            ]
        });
    });

    it('should remove the order when the delete method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId = await getForeignKey('product');
        const newOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'complete',
            products: [
                {product_id: productId, quantity: 2}
            ]
        });
        const id = newOrder.id;
        const deletedOrder = await store.delete(id);
        expect(deletedOrder).toEqual({
            id: id,
            user_id: userId, 
            status: 'complete',
            products: [
                {product_id: productId, quantity: 2}
            ]
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });

    it('should show the active order for a customer when the currentOrder method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId1 = await getForeignKey('product');
        const productId2 = await getForeignKey('product');
        const completedOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'complete',
            products: [
                {product_id: productId1, quantity: 2}
            ]
        });
        const activeOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'active',
            products: [
                {product_id: productId2, quantity: 1}
            ]
        });
        const result = await store.currentOrder(userId);
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active',
            products: [
                {product_id: productId2, quantity: 1}
            ]
        });
    });

    it('should list completed orders for a customer when the completedOrders method is invoked', async () => {
        const userId = await getForeignKey('user');
        const productId1 = await getForeignKey('product');
        const productId2 = await getForeignKey('product');
        const completedOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'complete',
            products: [
                {product_id: productId1, quantity: 2}
            ]
        });
        const activeOrder = await store.create({
            id: '',
            user_id: userId, 
            status: 'active',
            products: [
                {product_id: productId2, quantity: 1}
            ]
        });
        const results = await store.completedOrders(userId);
        expect(results[0]).toEqual({
            id: results[0].id,
            user_id: userId,
            status: 'complete',
            products: [
                {product_id: productId1, quantity: 2}
            ]
        });
    });
});