import assert from 'assert';
import { Context } from 'koa';
import supertest from 'supertest';
import Application from '../../src/Application';
import { end, load } from './fixture';

describe('Application', (): void => {
    describe('Routes test', (): void => {
        let server;

        beforeEach((): void => {
            server = (new Application()).run(5858);
        });

        afterEach((): void => {
            server.close();
        });

        it('GET / returns the main page', async (): Promise<void> => {
            await supertest(server)
                .get('/')
                .expect(200)
                .expect((ctx: Context): void => {
                    assert.strictEqual(ctx.res.text , 'Hello api');
                });
        });
    });

    describe('Db test', (): void => {
        let dbConnection;
        beforeEach(async (): Promise<void> => {
            dbConnection = await load();
        });

        afterEach((): void => {
            end();
        });

        it('should check DB', async (): Promise<void>  => {
            const [rows] = await dbConnection.query('SELECT 1 as response');
            assert.deepStrictEqual(rows[0].response, 1);
        });
    });
});
