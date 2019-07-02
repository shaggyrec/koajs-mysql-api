import { sqlConnection } from '../../settings.json';
import db from '../../src/services/db';

let dbConnection;
export const load = async (): Promise<object> => {
    return dbConnection = await db(sqlConnection);
};

export const end = (): void => {
    dbConnection.end();
};
