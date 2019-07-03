import { createConnection, Connection } from 'mysql2/promise';

export default async (settings: object): Promise<Connection> => {
    return await createConnection(settings);
};
