import {User, UserStore} from '../../../src/models/users';

const store = new UserStore();


describe("User Model", () => {
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

    it('should add a user when the create method is invoked', async () => {
        const result = await store.create({
            id: '',
            first_name: 'John', 
            last_name: 'Wanamaker',
            username: 'jwanamaker',
            password: 'duishfewn398u243fewn@~@'
        });
        expect(result).toEqual({
            id: result.id,
            first_name: 'John',
            last_name: 'Wanamaker',
            username: 'jwanamaker',
            password: ''
        });
    });

    it('should return a list of users when the index method is invoked', async () => {
        await store.create({
            id: '',
            first_name: 'Sam', 
            last_name: 'Walton',
            username: 'swalton',
            password: 'jioed8u43%*&okop'
        });
        const result = await store.index();
        expect(result).not.toBe([]);
    });

    it('should return the correct user when the show method is invoked', async () => {
        const result = await store.create({
            id: '',
            first_name: 'Harry',
            last_name: 'Selfridge',
            username: 'hselfridge',
            password: 'nyasrfuh8997%^$dfnweh'
        });
        const test_data = await store.show(result.id);
        expect(test_data).toEqual({
            id: test_data.id,
            first_name: 'Harry',
            last_name: 'Selfridge',
            username: 'hselfridge',
            password: ''
        });
    });

    it('should update the user first_name, last_name, username and password_digest when the update method is invoked', async () => {
        const newUser = await store.create({
            id: '',
            first_name: 'Richard', 
            last_name: 'Sears',
            username: 'rsears',
            password: 'bnyteg974uhweu^hed6%R'
        });
        newUser.first_name = 'Alvah';
        newUser.last_name = 'Roebuck';
        newUser.username = 'aroebuck';
        newUser.password = 'njxczvyur897u^%R$Rhbdfs67*&';
        const result = await store.update(newUser);
        expect(result).toEqual({
            id: result.id,
            first_name: 'Alvah',
            last_name: 'Roebuck',
            username: 'aroebuck',
            password: ''
        });
    });

    it('should update selective properties when the update method is invoked with not all properties present', async () => {
        const newUser = await store.create({
            id: '',
            first_name: 'Frank', 
            last_name: 'Woolworth',
            username: 'fwoolworth',
            password: 'dasufh78945u87^^uighedw'
        });
        newUser.first_name = '';
        newUser.last_name = '';
        newUser.username = 'frankw';
        newUser.password = '';
        const result = await store.update(newUser);
        expect(result).toEqual({
            id: result.id,
            first_name: 'Frank',
            last_name: 'Woolworth',
            username: 'frankw',
            password: ''
        });
    });

    it('should remove the user when the delete method is invoked', async () => {
        const newUser = await store.create({
            id: '',
            first_name: 'Sebastian', 
            last_name: 'Kresge',
            username: 'skresge',
            password: 'ndsa79342de8d3(*&^iwuehd'
        });
        const id = newUser.id;
        const deletedUser = await store.delete(id);
        expect(deletedUser).toEqual({
            id: id,
            first_name: 'Sebastian', 
            last_name: 'Kresge',
            username: 'skresge', 
            password: ''
        });
        const result = await store.show(id);
        expect(result).toBeUndefined();
    });
});