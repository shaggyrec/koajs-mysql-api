import mysql from 'mysql2/promise';

export const dbConnection = async (settings: object): Promise<any> => await mysql.createConnection(settings);
