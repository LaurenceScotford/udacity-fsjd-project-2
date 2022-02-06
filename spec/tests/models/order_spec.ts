import {User, UserStore} from '../../../src/models/users';
import {Order, OrderStore} from '../../../src/models/orders';

const users = new UserStore();
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
        const user = await users.create({
            id: '',
            first_name: 'Albert',
            last_name: 'One',
            password_digest: 'oljfioewq899877%$&^' 
        });
        const userId = user.id.toString();
        const result = await store.create({
            id: '',
            user_id: user.id, 
            status: 'active'
        });
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'active'
        });
    });

    it('should return a list of orders when the index method is invoked', async () => {
        const user = await users.create({
            id: '',
            first_name: 'Betty',
            last_name: 'Two',
            password_digest: 'hduihwqefnqeriuhjndjkbnweqhj' 
        });
        await store.create({
            id: '',
            user_id: user.id, 
            status: 'active'
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct product when the show method is invoked', async () => {
        const user = await users.create({
            id: '',
            first_name: 'Carlos',
            last_name: 'Three',
            password_digest: '8978ghyu8G&^T^(*)gyugvf' 
        });
        const result = await store.create({
            id: '',
            user_id: user.id, 
            status: 'active'
        });
        const userId = user.id.toString();
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: test_data.id,
            user_id: userId,
            status: 'active'
        });
    });

    it('should update the user_id and status when the update method is invoked', async () => {
        const user1 = await users.create({
            id: '',
            first_name: 'Debbie',
            last_name: 'Four',
            password_digest: 'ndftydhd7857%^78rh&^' 
        });
        const user2 = await users.create({
            id: '',
            first_name: 'Ewan',
            last_name: 'Five',
            password_digest: 'nfyrtfgt8uyw674735$%%^7rfgy67wq6%' 
        });
        const newOrder = await store.create({
            id: '',
            user_id: user1.id,  
            status: 'active'
        });
        newOrder.user_id = user2.id;
        newOrder.status = 'complete';
        const userId = user2.id.toString();
        const result = await store.update(newOrder);
        expect(result).toEqual({
            id: result.id,
            user_id: userId,
            status: 'complete'
        });
    });

    it('should remove the order when the delete method is invoked', async () => {
        const user = await users.create({
            id: '',
            first_name: 'Frances',
            last_name: 'Six',
            password_digest: 'ksurh*^77565&*(jhd76d' 
        });
        const newOrder = await store.create({
            id: '',
            user_id: user.id, 
            status: 'complete'
        });
        const id = newOrder.id;
        await store.delete(id);
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});