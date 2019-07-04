import { Server } from 'http';
import { Context } from 'koa';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import BookController from './controllers/BookController';
import FileController from './controllers/FileController';
import Book from './dbStorage/Book';
import errorHandler from './middlewares/errorHandler';
import FileManager from './services/FileManager';

export default class Application {
    private app: Koa;
    private router: Router;
    private readonly dbConnection: object;
    private readonly pathToFile: string;

    public constructor(dbConnection: object, pathToFile: string = null) {
        this.dbConnection = dbConnection;
        this.pathToFile = pathToFile;
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
        this.app.use(bodyParser());
        this.app.use(errorHandler);
        this.app.use(this.router.routes());
    }

    private setUpRoutes(): void {

        const bookController = new BookController(this.dbConnection, new Book(this.dbConnection));

        this.router.get('/', (ctx: Context): void => {
            ctx.body = 'Hello api';
        });

        this.router.get('/books', (ctx: Context): Promise<void> => bookController.list(ctx));
        this.router.delete('/books/:id', (ctx: Context): Promise<void> => bookController.delete(ctx));
        this.router.post('/books', (ctx: Context): Promise<void> => bookController.create(ctx));
        this.router.put('/books/:id', (ctx: Context): Promise<void> => bookController.update(ctx));
        if (this.pathToFile) {
            const fileController = new FileController(new FileManager(this.pathToFile));

            this.router.put('/file', (ctx: Context): Promise<void> => fileController.write(ctx));
            this.router.get('/file', (ctx: Context): Promise<void> => fileController.read(ctx));
        }
    }
}
