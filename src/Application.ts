import { Server } from 'http';
import { Context } from 'koa';
import Koa from 'koa';
import Router from 'koa-router';
import errorHandler from './middlewares/errorHandler';

export default class Application {
    private app: Koa;
    private router: Router;
    private dbConnection: object;

    public constructor(dbConnection: object) {
        this.dbConnection = dbConnection;
        this.app = new Koa();
        this.router = new Router();
        this.setUpRoutes();
    }

    public run(port: number): Server {
        this.applyMiddlewares();
        // eslint-disable-next-line no-console
        return this.app.listen(port, (): void => console.log(`Application run on the ${port} port`));
    }

    private applyMiddlewares(): void {
        this.app.use(errorHandler);
        this.app.use(this.router.routes());
    }

    private setUpRoutes(): void {
        this.router.get('/', (ctx: Context): void => {
            ctx.body = 'Hello api';
        });
    }
}
