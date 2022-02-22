import db from '../database';
import bcrypt from 'bcrypt';

export type User = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string; 
};

export class UserStore {
    async index(): Promise<User[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT id, first_name, last_name, username FROM users';
            const result = await conn.query(sql);
            conn.release();
            let users = result.rows;
            users = users.map(el => {return {id: el.id, first_name: el.first_name, last_name: el.last_name, username: el.username, password: ''}});
            return users; 
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`)
        }
    }

    async show(id: string): Promise<User> {
        try {
            const sql = 'SELECT id, first_name, last_name, username FROM users WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            const user = result.rows[0];
            if (user) {
                user.password = '';
            }
            return user;
        } catch (err) {
            throw new Error(`Could not find user ${id}. Error: ${err}`)
        }
      }

      async create(user: User): Promise<User> {
        try {
          const sql = 'INSERT INTO users (first_name, last_name, username, password_digest) VALUES($1, $2, $3, $4) RETURNING *';
          const conn = await db.connect();
          const hash = this.#hashPassword(user.password);
          const result = await conn.query(sql, [user.first_name, user.last_name, user.username, hash]);
          const newUser = result.rows[0];
          delete newUser.password_digest;
          newUser.password = '';
          conn.release();
          return newUser;
        } catch (err) {
            throw new Error(`Could not add new user ${user.username}. Error: ${err}`)
        }
    }
  
    async update(user: User): Promise<User> {
        try {

            // Scan parameter for properties to be updated
            let argCount = 1;
            let argList = []; 
            let sql = 'UPDATE users SET';
            type argType = 'first_name' | 'last_name' | 'username';
            let args: argType[] = ['first_name', 'last_name', 'username'];
            for (let i = 0; i < args.length; i++) {
                const prop: argType = args[i];
                if(user[prop]) {
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
            throw new Error(`Could not update user ${user.username}. Error: ${err}`);
        }
    }

    async delete(id: string): Promise<User> {
        try {
          const sql = 'DELETE FROM users WHERE id=($1) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [id]);
          const user = result.rows[0];
          delete user.password_digest;
          user.password = '';
          conn.release();
          return user;
        } catch (err) {
            throw new Error(`Could not delete user ${id}. Error: ${err}`)
        }
    }

    async authenticate(username: string, password: string): Promise<User | null> {
        const conn = await db.connect();
        const sql = 'SELECT password_digest FROM users WHERE username = ($1)';
        const result = await conn.query(sql, [username]);

        if (result.rows.length) {
            const user = result.rows[0];

            if (bcrypt.compareSync(password + process.env.BCRYPT_PASSWORD, user.password_digest)) {
                delete user.password_digest;
                user.password = '';
                return user;
            }
        }

        return null;
    }

    #hashPassword(password: string) : string {
        return bcrypt.hashSync(password + process.env.BCRYPT_PASSWORD, parseInt(process.env.SALT_ROUNDS as string));
    }
}