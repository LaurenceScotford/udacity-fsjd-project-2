import { PoolConfig, Pool } from 'pg';
import bcrypt from 'bcryptjs';

const {
    ENV,
    SUPERUSER_USERNAME,
    SUPERUSER_PASSWORD,
    SUPERUSER_AUTH_LEVEL
} = process.env;

let config: PoolConfig;
let postgres_host, postgres_port, postgres_db, postgres_user, postgres_password;

switch ((ENV as string).trim()) {
    case 'prod':
        postgres_host = process.env.PROD_POSTGRES_HOST;
        postgres_port = process.env.PROD_POSTGRES_PORT;
        postgres_db = process.env.PROD_POSTGRES_DB;
        postgres_user = process.env.PROD_POSTGRES_USER;
        postgres_password = process.env.PROD_POSTGRES_PASSWORD;
        break;
    case 'dev':
        postgres_host = process.env.DEV_POSTGRES_HOST;
        postgres_port = process.env.DEV_POSTGRES_PORT;
        postgres_db = process.env.DEV_POSTGRES_DB;
        postgres_user = process.env.DEV_POSTGRES_USER;
        postgres_password = process.env.DEV_POSTGRES_PASSWORD;
        break;
    case 'test':
        postgres_host = process.env.TEST_POSTGRES_HOST;
        postgres_port = process.env.TEST_POSTGRES_PORT;
        postgres_db = process.env.TEST_POSTGRES_DB;
        postgres_user = process.env.TEST_POSTGRES_USER;
        postgres_password = process.env.TEST_POSTGRES_PASSWORD;
        break;
    default:
        throw new Error(`The environment ${ENV} is not supported.`)
}

config = {
    host: postgres_host,
    port: parseInt(postgres_port as string),
    database: postgres_db,
    user: postgres_user,
    password: postgres_password
};
const db = new Pool(config);

// Create superuser if it doesn't exist
(async () => {
    try {
        const check_sql = 'SELECT * FROM users WHERE username = ($1)';
        const conn = await db.connect();
        if (!(await conn.query(check_sql, [SUPERUSER_USERNAME])).rowCount) {
            const sql = 'INSERT INTO users (auth_level, first_name, last_name, username, password_digest) VALUES($1, $2, $3, $4, $5)';
            await conn.query(sql, [SUPERUSER_AUTH_LEVEL, 'Super', 'User', SUPERUSER_USERNAME, bcrypt.hashSync((SUPERUSER_PASSWORD as string) + process.env.BCRYPT_PASSWORD, parseInt(process.env.SALT_ROUNDS as string))]);
        }
    } catch (err) {
        throw new Error(`Could not create superuser. ${err}`);
    }
})();

export default db;