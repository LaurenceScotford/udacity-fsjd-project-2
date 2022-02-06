import db from '../database';

export type User = {
    id: string;
    first_name: string;
    last_name: string;
    password_digest: string; 
};

export class UserStore {
    async index(): Promise<User[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM users';
            const result = await conn.query(sql);
            conn.release();
            return result.rows 
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`)
        }
    }

    async show(id: string): Promise<User> {
        try {
            const sql = 'SELECT * FROM users WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find user ${id}. Error: ${err}`)
        }
      }

      async create(user: User): Promise<User> {
        try {
          const sql = 'INSERT INTO users (first_name, last_name, password_digest) VALUES($1, $2, $3) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [user.first_name, user.last_name, user.password_digest]);
          const newUser = result.rows[0];
          conn.release();
          return newUser;
        } catch (err) {
            throw new Error(`Could not add new user ${user.first_name} ${user.last_name}. Error: ${err}`)
        }
    }
  
    async update(user: User): Promise<User> {
        try {
          const sql = 'UPDATE users SET first_name = ($1), last_name = ($2), password_digest = ($3) WHERE id = ($4) RETURNING *';
          const conn = await db.connect();
          const result = await conn.query(sql, [user.first_name, user.last_name, user.password_digest, user.id]);
          const updatedUser = result.rows[0];
          conn.release();
          return updatedUser;
        } catch (err) {
            throw new Error(`Could not update user ${user.first_name} ${user.last_name}. Error: ${err}`)
        }
    }

    async delete(id: string): Promise<User> {
        try {
          const sql = 'DELETE FROM users WHERE id=($1)';
          const conn = await db.connect();
          const result = await conn.query(sql, [id]);
          const user = result.rows[0];
          conn.release();
          return user;
        } catch (err) {
            throw new Error(`Could not delete user ${id}. Error: ${err}`)
        }
    }
}