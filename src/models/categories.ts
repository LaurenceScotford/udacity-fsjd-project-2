import db from '../database';

export type Category = {
    id: string;
    category: string;
};

export class CategoryStore {
    async index(): Promise<Category[]> {
        try {
            const conn = await db.connect();
            const sql = 'SELECT * FROM categories';
            const result = await conn.query(sql);
            conn.release();
            return result.rows
        } catch (err) {
            throw new Error(`Could not get categories. ${err}`)
        }
    }

    async show(id: string): Promise<Category> {
        try {
            const sql = 'SELECT * FROM categories WHERE id = ($1)';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find category ${id}. ${err}`)
        }
    }

    async create(cat: Category): Promise<Category> {
        try {
            const sql = 'INSERT INTO categories (category) VALUES($1) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [cat.category]);
            const category = result.rows[0];
            conn.release();
            return category;
        } catch (err) {
            throw new Error(`Could not add new category ${cat}. ${err}`)
        }
    }

    async update(cat: Category): Promise<Category> {
        try {
            const sql = 'UPDATE categories SET category = ($1) WHERE id = ($2) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [cat.category, cat.id]);
            const category = result.rows[0];
            conn.release();
            return category;
        } catch (err) {
            throw new Error(`Could not update category ${cat.category}. ${err}`)
        }
    }

    async delete(id: string): Promise<Category> {
        try {
            const sql = 'DELETE FROM categories WHERE id=($1) RETURNING *';
            const conn = await db.connect();
            const result = await conn.query(sql, [id]);
            const category = result.rows[0];
            conn.release();
            return category;
        } catch (err) {
            throw new Error(`Could not delete category ${id}. ${err}`)
        }
    }
}