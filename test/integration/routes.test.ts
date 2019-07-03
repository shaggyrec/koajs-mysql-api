import assert from 'assert';
import { Context } from 'koa';
import supertest from 'supertest';
import Application from '../../src/Application';
import { end, load } from './fixture';

describe('Routes', (): void => {
    let server;

    beforeEach(async (): Promise<void> => {
        const dbConnection = await load();
        server = (new Application(dbConnection)).run(5858);
    });

    afterEach((): void => {
        server.close();
        end();
    });

    it('GET /books returns the list of books', async (): Promise<void> => {
        await supertest(server)
            .get('/books')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((ctx: Context): void => {
                assert.strictEqual(ctx.body.length, 100);
            });
    });

    it('should consider sorting and filtering', async (): Promise<void> => {
        await supertest(server)
            .get('/books?orderBy=id&orderDirection=DESC&filterBy=autor&filterValue=Dustin')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((ctx: Context): void => {
                assert.strictEqual(ctx.body.length, 2);
                assert(ctx.body[0].id > ctx.body[1].id);
            });
    });

    it('should should throw bad request when bad params', async (): Promise<void> => {
        await supertest(server)
            .get('/books?orderBy=asd')
            .expect(400);
    });
});
