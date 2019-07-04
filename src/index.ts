import { sqlConnection } from '../settings.json';
import Application from './Application';
import dbConnection from './services/db';
import appRoot from 'app-root-path'

const pathToFile = appRoot + '/files/file.txt';
const port = 3080;

(async (): Promise<void> => {
    const app = new Application(await dbConnection(sqlConnection), pathToFile);
    app.run(port);
})();
