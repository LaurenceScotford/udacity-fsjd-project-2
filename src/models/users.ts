import db from '../database';
import bcrypt from 'bcryptjs';

const {
    SUPERUSER_AUTH_LEVEL
} = process.env;

export type User = {
    id: string;
    auth_level: string | number;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
};

export class UserStore {
    async index(auth_level: string | number): Promise<User[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT id, auth_level, first_name, last_name, username FROM users WHERE auth_level != ($1)';
            const result = await conn.query(sql, [SUPERUSER_AUTH_LEVEL]);
            conn.release();
            let users = result.rows;
            users = users.map(el => { return { id: el.id, auth_level: el.auth_level, first_name: el.first_name, last_name: el.last_name, username: el.username, password: '' } });
            users = users.filter(el => parseInt(el.auth_level) <= parseInt(auth_level as string));
            return users;
        } catch (err) {
            throw new Error(`Could not get users. ${err}`);
        }
    }

    async show(id: string, auth_level: string | number): Promise<User> {
        try {
            const sql = 'SELECT id, auth_level, first_name, last_name, username FROM users WHERE id = ($1) AND auth_level != ($2)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id, SUPERUSER_AUTH_LEVEL]);
            conn.release();
            const user = result.rows[0];
            if (user) {
                user.password = '';

                if (parseInt(user.auth_level) > parseInt(auth_level as string)) {
                    throw new Error('You are not authorised to view this user.')
                }
            }
            return user;
        } catch (err) {
            throw new Error(`Could not find user ${id}. ${err}`);
        }
    }

    async create(user: User): Promise<User> {
        try {
            //  Check for attempt to create a super user  
            if (parseInt(user.auth_level as string) >= parseInt(SUPERUSER_AUTH_LEVEL as string)) {
                throw new Error('Creation of users at this authorisation level is not permitted in the API');
            } else {
                const sql = 'INSERT INTO users (auth_level, first_name, last_name, username, password_digest) VALUES($1, $2, $3, $4, $5) RETURNING *';
                const conn = await db.connect();
                const hash = this.#hashPassword(user.password);
                const result = await conn.query(sql, [user.auth_level, user.first_name, user.last_name, user.username, hash]);
                const newUser = result.rows[0];
                delete newUser.password_digest;
                newUser.password = '';
                conn.release();
                return newUser;
            }
        } catch (err) {
            throw new Error(`Could not add new user ${user.username}. ${err}`);
        }
    }

    async update(user: User, auth_level: string | number): Promise<User> {
        const userTypes: string[] = ['user', 'admin', 'super'];

        try {
            // Check that this is not an attempt to update the superuser
            if (await this.#isSuperuser(user.id)) {
                throw new Error('Updates to this user are not authorised.');
            }

            // Check for attempt to modify a user at a higher authorisation level
            const conn = await db.connect();
            const checkSql = 'SELECT auth_level FROM users WHERE id = ($1)';
            const result = await conn.query(checkSql, [user.id]);
            if (parseInt(result.rows[0].auth_level) > parseInt(auth_level as string)) {
                throw new Error('You are not authorised to modify this user.');
            }

            // Scan parameter for properties to be updated
            let argCount = 1;
            let argList = [];
            let sql = 'UPDATE users SET';
            type argType = 'auth_level' | 'first_name' | 'last_name' | 'username';
            let args: argType[] = ['auth_level', 'first_name', 'last_name', 'username'];
            for (let i = 0; i < args.length; i++) {
                const prop: argType = args[i];
                if (user[prop]) {
                    sql += (argCount > 1 ? ', ' : ' ');
                    sql += `${prop} = ($${argCount++})`;
                    argList.push(user[prop]);
                }
            }

            // If password is being updated, create a hash from the password
            if (user.password) {
                const hash = this.#hashPassword(user.password);
                sql += (argCount > 1 ? ', ' : ' ');
                sql += `password_digest = ($${argCount++})`;
                argList.push(hash);
            }

            // If at least one property has been updated, do the update
            if (argList.length) {
                argList.push(user.id);
                sql += ` WHERE id = ($${argCount}) RETURNING *`;
                const conn = await db.connect();

                const result = await conn.query(sql, argList);
                const updatedUser = result.rows[0];
                delete updatedUser.password_digest;
                updatedUser.password = '';
                conn.release();
                return updatedUser;
            } else {
                throw new Error('No properties were passed in to update');
            }
        } catch (err) {
            throw new Error(`Could not update user ${user.username}. ${err}`);
        }
    }

    async delete(id: string, auth_level: string): Promise<User> {
        try {
            // Check that this is not an attempt to delete the superuser
            if (await this.#isSuperuser(id)) {
                throw new Error('Deletion of this user is not authorised');
            }

            // Check for attempt to delete a user at a higher authorisation level
            const conn = await db.connect();
            const checkSql = 'SELECT auth_level FROM users WHERE id = ($1)';
            const chkResult = await conn.query(checkSql, [id]);
            if (parseInt(chkResult.rows[0].auth_level) > parseInt(auth_level as string)) {
                throw new Error('You are not authorised to delete this user.');
            }

            const sql = 'DELETE FROM users WHERE id=($1) RETURNING *';
            const result = await conn.query(sql, [id]);
            const user = result.rows[0];
            delete user.password_digest;
            user.password = '';
            conn.release();
            return user;

        } catch (err) {
            throw new Error(`Could not delete user ${id}. ${err}`);
        }
    }

    // Returns true if a given username is available
    async checkUsername(username: string): Promise<Boolean> {
        const conn = await db.connect();
        const sql = 'SELECT * FROM users WHERE username = ($1)';
        const result = await conn.query(sql, [username]);
        return result.rowCount === 0;
    }

    async authenticate(username: string, password: string): Promise<User> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT id, auth_level, password_digest FROM users WHERE username = ($1)';
            const result = await conn.query(sql, [username]);

            if (result.rows.length) {
                const user = result.rows[0];

                if (bcrypt.compareSync(password + process.env.BCRYPT_PASSWORD, user.password_digest)) {
                    delete user.password_digest;
                    return user;
                }
            }

            throw new Error('No user found with those credentials');

        } catch (err) {
            throw new Error(`Could not authenticate user ${username}. ${err}`);
        }

    }

    // Return an encrypted version of the given password
    #hashPassword(password: string): string {
        return bcrypt.hashSync(password + process.env.BCRYPT_PASSWORD, parseInt(process.env.SALT_ROUNDS as string));
    }

    // Check if the given id belongs to the super user
    async #isSuperuser(id: string): Promise<boolean> {
        const conn = await db.connect();
        const sql = 'SELECT auth_level FROM users WHERE id = ($1)';
        const result = await conn.query(sql, [id]);
        return result.rows[0].auth_level == SUPERUSER_AUTH_LEVEL;
    }
}
