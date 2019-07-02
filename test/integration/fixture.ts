import { sqlConnection } from '../../settings.json';
import * as db from '../../src/services/db';

let dbConnection;
export const load = async (): Promise<void> => {
    return dbConnection = await db.dbConnection(sqlConnection);
};

export const end = (): void => {
    dbConnection.end();
};
