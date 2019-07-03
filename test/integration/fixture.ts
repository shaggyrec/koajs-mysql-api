import { sqlConnection } from '../../settings.json';
import db from '../../src/services/db';

let dbConnection;
export const load = async (): Promise<object> => {
    dbConnection = await db(sqlConnection);
    await dbConnection.beginTransaction();
    return dbConnection;
};

export const end = async (): Promise<void> => {
    await dbConnection.rollback();
    dbConnection.end();
};
