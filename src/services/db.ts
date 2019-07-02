import mysql from 'mysql2/promise';

export default async (settings: object): Promise<object> => {
    return await mysql.createConnection(settings);
};
