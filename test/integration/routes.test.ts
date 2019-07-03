import assert from 'assert';
import { Context } from 'koa';
import supertest from 'supertest';
import Application from '../../src/Application';
import { end, load } from './fixture';

describe('Routes', (): void => {
    let server;
    let dbConnection;
    beforeEach(async (): Promise<void> => {
        dbConnection = await load();
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

    it('should should delete book', async (): Promise<void> => {
        await supertest(server)
            .delete('/books/1')
            .expect(200);
        const [result] = await dbConnection.query('SELECT id FROM books WHERE id = ?', [1]);
        assert.strictEqual(result.length, 0);
    });

    it('should should update book', async (): Promise<void> => {
        await supertest(server)
            .put('/books/1')
            .send({
                title: 'title',
                autor: 'pushkin',
                description: 'fairy tail',
                image: '/img/src.jpg'
            })
            .expect(200);

        const [result] = await dbConnection.query('SELECT * FROM books WHERE id = ?', [1]);
        assert.strictEqual(result[0].title, 'title');
        assert.strictEqual(result[0].autor, 'pushkin');
    });

    it('should should create book', async (): Promise<void> => {
        await supertest(server)
            .post('/books')
            .send({
                title: 'title',
                autor: 'pushkin'
            })
            .expect(201);
        const [result] = await dbConnection.query('SELECT * FROM books ORDER BY id DESC LIMIT 1');
        assert.strictEqual(result[0].title, 'title');
        assert.strictEqual(result[0].autor, 'pushkin');
    });
});
