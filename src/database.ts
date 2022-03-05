import dotenv from 'dotenv';
import { PoolConfig, Pool } from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const {
    ENV,
    PROD_POSTGRES_HOST,
    PROD_POSTGRES_PORT,
    PROD_POSTGRES_DB,
    PROD_POSTGRES_USER,
    PROD_POSTGRES_PASSWORD,
    TEST_POSTGRES_HOST,
    TEST_POSTGRES_PORT,
    TEST_POSTGRES_DB,
    TEST_POSTGRES_USER,
    TEST_POSTGRES_PASSWORD,
    SUPERUSER_USERNAME,
    SUPERUSER_PASSWORD,
    SUPERUSER_AUTH_LEVEL
} = process.env;

let config : PoolConfig;

switch((ENV as string).trim()) {
    case 'dev':
        config = {
            host: PROD_POSTGRES_HOST,
            port: parseInt(PROD_POSTGRES_PORT as string),
            database: PROD_POSTGRES_DB,
            user: PROD_POSTGRES_USER,
            password: PROD_POSTGRES_PASSWORD
        };
        break;
    case 'test':
        config = {
            host: TEST_POSTGRES_HOST,
            port: parseInt(TEST_POSTGRES_PORT as string),
            database: TEST_POSTGRES_DB,
            user: TEST_POSTGRES_USER,
            password: TEST_POSTGRES_PASSWORD
        };
        break;
    default:
        throw new Error(`The environment ${ENV} is not supported.`)
}

const db = new Pool(config);

// Create superuser if it doesn't exist
(async () => {
    try {
        const check_sql = 'SELECT * FROM users WHERE username = ($1)';
        const conn = await db.connect();
        if (! (await conn.query(check_sql, [SUPERUSER_USERNAME])).rowCount) {
            const sql = 'INSERT INTO users (auth_level, first_name, last_name, username, password_digest) VALUES($1, $2, $3, $4, $5)';
            await conn.query(sql, [SUPERUSER_AUTH_LEVEL, 'Super', 'User', SUPERUSER_USERNAME, bcrypt.hashSync((SUPERUSER_PASSWORD as string) + process.env.BCRYPT_PASSWORD, parseInt(process.env.SALT_ROUNDS as string))]);
        }
    } catch (err) {
        throw new Error(`Could not create superuser. Error: ${err}`);
    }
})();

export default db;