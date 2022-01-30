import dotenv from 'dotenv';
import { PoolConfig, Pool } from 'pg';

dotenv.config();

const {
    ENV,
    PROD_POSTGRES_HOST,
    PROD_POSTGRES_DB,
    PROD_POSTGRES_USER,
    PROD_POSTGRES_PASSWORD,
    TEST_POSTGRES_HOST,
    TEST_POSTGRES_DB,
    TEST_POSTGRES_USER,
    TEST_POSTGRES_PASSWORD
} = process.env;

console.log('Env=' + ENV);

let config : PoolConfig;

switch((ENV as string).trim()) {
    case 'dev':
        config = {
            host: PROD_POSTGRES_HOST,
            database: PROD_POSTGRES_DB,
            user: PROD_POSTGRES_USER,
            password: PROD_POSTGRES_PASSWORD
        };
        break;
    case 'test':
        config = {
            host: TEST_POSTGRES_HOST,
            database: TEST_POSTGRES_DB,
            user: TEST_POSTGRES_USER,
            password: TEST_POSTGRES_PASSWORD
        };
        break;
    default:
        throw new Error(`The environment ${ENV} is not supported.`)
}

const db = new Pool(config);

export default db;