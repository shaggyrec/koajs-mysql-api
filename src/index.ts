import { sqlConnection } from '../settings.json';
import Application from './Application';
import dbConnection from './services/db';

(async (): Promise<void> => {
    const app = new Application(await dbConnection(sqlConnection));
    app.run(3080);
})();
