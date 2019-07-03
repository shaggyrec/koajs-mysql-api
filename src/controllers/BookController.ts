import { Context } from 'koa';
import { Connection } from 'mysql2';
import BookList from '../dbQuery/BookList';
import Book from '../dbStorage/Book';
import BadRequest from '../errors/BadRequest';

interface QueryParams {
    orderBy?: string;
    orderDirection?: string;
    filterBy?: string;
    filterValue?: string;
    limit?: string;
    offset?: string;
}

class BookController {
    private readonly dbConnection: Connection;
    private dbStorage: Book;

    public constructor(dbConnection: Connection, dbStorage: Book) {
        this.dbConnection = dbConnection;
        this.dbStorage = dbStorage;
    }

    public async list(ctx: Context): Promise<void> {
        const dbQuery = new BookList(this.dbConnection);
        BookController.assertQueryParametersAreValid(ctx.query);
        dbQuery.list();
        if (ctx.query.limit) {
            dbQuery.limit(ctx.query.limit);
        }
        if (ctx.query.offset) {
            dbQuery.skip(ctx.query.offset);
        }
        if (ctx.query.orderDirection && ctx.query.orderBy) {
            dbQuery.sort(ctx.query.orderBy, ctx.query.orderDirection);
        }

        if (ctx.query.filterBy && ctx.query.filterValue) {
            dbQuery.filter(ctx.query.filterBy, ctx.query.filterValue);
        }

        ctx.body = await dbQuery.execute();
    }

    public async delete(ctx: Context): Promise<void> {
        await this.dbStorage.delete(ctx.params.id);
        ctx.status = 200;
    }
    public async create(ctx: Context): Promise<void> {
        await this.dbStorage.create(ctx.request.body);
        ctx.status = 201;
    }
    public async update(ctx: Context): Promise<void> {
        await this.dbStorage.update(ctx.params.id, ctx.request.body);
        ctx.status = 200;
    }

    private static assertQueryParametersAreValid(queryParams: QueryParams): void {
        const dbFieldsComaSeparatedString = BookList.DB_FIELDS.join(',');
        if (queryParams.orderBy && BookList.DB_FIELDS.indexOf(queryParams.orderBy) === -1) {
            throw new BadRequest('Param orderBy must by one of ' + dbFieldsComaSeparatedString);
        }

        if (queryParams.orderDirection && ['ASC', 'DESC'].indexOf(queryParams.orderDirection) === -1) {
            throw new BadRequest('Param orderDirection must by one of ASC, DESC');
        }

        if (queryParams.filterBy && BookList.DB_FIELDS.indexOf(queryParams.orderBy) === -1) {
            throw new BadRequest('Param filterBy must by one of ' + dbFieldsComaSeparatedString);
        }

        // tslint:disable-next-line:radix
        if (queryParams.limit && isNaN(parseInt(queryParams.limit))) {
            throw new BadRequest('Param limit must integer');
        }

        // tslint:disable-next-line:radix
        if (queryParams.offset && isNaN(parseInt(queryParams.limit))) {
            throw new BadRequest('Param offset must integer');

        }
    }
}
export default BookController;
