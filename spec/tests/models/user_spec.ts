import dotenv from 'dotenv';
dotenv.config();

import { UserStore } from '../../../src/models/users';

const {
    SUPERUSER_AUTHLEVEL
} = process.env;

const store = new UserStore();

describe('User Model', () => {
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
            auth_level: 1,
            first_name: 'John',
            last_name: 'Wanamaker',
            username: 'jwanamaker',
            password: 'duishfewn398u243fewn@~@'
        });
        expect(result).toEqual({
            id: result.id,
            auth_level: 1,
            first_name: 'John',
            last_name: 'Wanamaker',
            username: 'jwanamaker',
            password: ''
        });
    });

    it('should return a list of users when the index method is invoked', async () => {
        await store.create({
            id: '',
            auth_level: 1,
            first_name: 'Sam',
            last_name: 'Walton',
            username: 'swalton',
            password: 'jioed8u43%*&okop'
        });
        const result = await store.index(SUPERUSER_AUTHLEVEL as string);
        expect(result).not.toBe([]);
    });

    it('should return the correct user when the show method is invoked', async () => {
        const result = await store.create({
            id: '',
            auth_level: 1,
            first_name: 'Harry',
            last_name: 'Selfridge',
            username: 'hselfridge',
            password: 'nyasrfuh8997%^$dfnweh'
        });
        const test_data = await store.show(result.id, SUPERUSER_AUTHLEVEL as string);
        expect(test_data).toEqual({
            id: test_data.id,
            auth_level: 1,
            first_name: 'Harry',
            last_name: 'Selfridge',
            username: 'hselfridge',
            password: ''
        });
    });

    it('should update the user auth_level, first_name, last_name, username, password_digest and rt when the update method is invoked', async () => {
        const newUser = await store.create({
            id: '',
            auth_level: 2,
            first_name: 'Richard',
            last_name: 'Sears',
            username: 'rsears',
            password: 'bnyteg974uhweu^hed6%R'
        });
        newUser.auth_level = 1;
        newUser.first_name = 'Alvah';
        newUser.last_name = 'Roebuck';
        newUser.username = 'aroebuck';
        newUser.password = 'njxczvyur897u^%R$Rhbdfs67*&';
        const result = await store.update(newUser, SUPERUSER_AUTHLEVEL as string);
        expect(result).toEqual({
            id: result.id,
            auth_level: 1,
            first_name: 'Alvah',
            last_name: 'Roebuck',
            username: 'aroebuck',
            password: ''
        });
    });

    it('should update selective properties when the update method is invoked with not all properties present', async () => {
        const newUser = await store.create({
            id: '',
            auth_level: 1,
            first_name: 'Frank',
            last_name: 'Woolworth',
            username: 'fwoolworth',
            password: 'dasufh78945u87^^uighedw'
        });
        newUser.auth_level = '';
        newUser.first_name = '';
        newUser.last_name = '';
        newUser.username = 'frankw';
        newUser.password = '';
        const result = await store.update(newUser, SUPERUSER_AUTHLEVEL as string);
        expect(result).toEqual({
            id: result.id,
            auth_level: 1,
            first_name: 'Frank',
            last_name: 'Woolworth',
            username: 'frankw',
            password: ''
        });
    });

    it('should remove the user when the delete method is invoked', async () => {
        const newUser = await store.create({
            id: '',
            auth_level: 1,
            first_name: 'Sebastian',
            last_name: 'Kresge',
            username: 'skresge',
            password: 'ndsa79342de8d3(*&^iwuehd'
        });
        const id = newUser.id;
        const deletedUser = await store.delete(id, SUPERUSER_AUTHLEVEL as string);
        expect(deletedUser).toEqual({
            id: id,
            auth_level: 1,
            first_name: 'Sebastian',
            last_name: 'Kresge',
            username: 'skresge',
            password: ''
        });
        const result = await store.show(id, SUPERUSER_AUTHLEVEL as string);
        expect(result).toBeUndefined();
    });
});