import Application from './Application';
import dbConnection from './services/db';
import { sqlConnection } from '../settings.json';

(async (): Promise<void> => {
    const app = new Application(await dbConnection(sqlConnection));
    app.run(3080);
})();
