import assert from 'assert';
import { Context } from 'koa';
import supertest from 'supertest';
import Application from '../../src/Application';
import { end, load } from './fixture';
import { execSync } from 'child_process';
import appRoot from 'app-root-path';
import fs from 'fs';

const pathToFile = appRoot + '/files/file.txt';

describe('Routes', (): void => {
    let server;
    let dbConnection;
    beforeEach(async (): Promise<void> => {
        await execSync('rm -rf ' + appRoot + '/files');
        dbConnection = await load();
        server = (new Application(dbConnection, pathToFile)).run(5858);
    });

    afterEach(async (): Promise<void> => {
        server.close();
        end();
        await execSync('rm -rf ' + appRoot + '/files');
    });

    describe('/books', (): void => {

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

        it('should throw bad request when bad params', async (): Promise<void> => {
            await supertest(server)
                .get('/books?orderBy=asd')
                .expect(400);
        });

        it('should delete book', async (): Promise<void> => {
            await supertest(server)
                .delete('/books/1')
                .expect(200);
            const [result] = await dbConnection.query('SELECT id FROM books WHERE id = ?', [1]);
            assert.strictEqual(result.length, 0);
        });

        it('should throw 400 when try to delete non existence book', async (): Promise<void> => {
            await supertest(server)
                .delete('/books/99999999')
                .expect(400);
        });

        it('should update book', async (): Promise<void> => {
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

        it('should return 400 when bad updating data', async (): Promise<void> => {
            await supertest(server)
                .put('/books/1')
                .expect(400);

            await supertest(server)
                .put('/books/1')
                .send({
                    bad: 'field'
                })
                .expect(400);
        });

        it('should return 400 when book not exists', async (): Promise<void> => {
            await supertest(server)
                .put('/books/9999999')
                .send({
                    title: 'title'
                })
                .expect(400);
        });

        it('should should create book', async (): Promise<void> => {
            await supertest(server)
                .post('/books')
                .send({
                    title: 'title',
                    autor: 'pushkin',
                    date: '2019-07-04',
                    description: 'description',
                    image: 'image'
                })
                .expect(201);

            const [result] = await dbConnection.query('SELECT * FROM books ORDER BY id DESC LIMIT 1');
            assert.strictEqual(result[0].title, 'title');
            assert.strictEqual(result[0].autor, 'pushkin');
        });

        it('should return 400 when bad creating data', async (): Promise<void> => {
            await supertest(server)
                .post('/books')
                .expect(400);

            await supertest(server)
                .post('/books')
                .send({
                    bad: 'field'
                })
                .expect(400);
        });
    });

    describe('/file', function (): void {
        const stringsArray = [
            'After school that day, Kamal took Amy and Tara up to the abandoned house',
            'No one had lived there for years',
            'There were piles of rubbish in the corners and weeds growing everywhere',
            'The windows were broken and the walls were covered with mould',
            'It was definitely creepy',
            'Amy didn’t like it there',
            'The boys had been working in one of the downstairs rooms',
            'They had cleared the rubbish out and the walls were covered in lurid paintings of zombies and skeletons',
            '“We’re going to take photos and enter them in the school competition,” said Kamal proudly',
            'Amy didn’t look too impressed',
            '“Very nice,” she said sarcastically',
            '“Where’s Grant, then?” asked Tara'
        ];

        it('should create directory and file and write text in this file', async (): Promise<void> => {
            await supertest(server)
                .put('/file')
                .send(['text'])
                .expect(200);
            assert.strictEqual(fs.readFileSync(pathToFile, 'utf8'), 'text\n');
        });

        it('should read all file', async (): Promise<void> => {
            await supertest(server)
                .put('/file')
                .send(stringsArray);

            await supertest(server)
                .get('/file')
                .expect(200)
                .buffer()
                .parse((ctx: Context, callback): void => {
                    let result = [];
                    ctx.on('data', (data: string): void => {
                        if (data) {
                            result.push(data + '');
                        }
                    });
                    ctx.on('end', (): void => {
                        assert.deepStrictEqual(result, stringsArray);
                        callback();
                    });
                });
        });

        it('should return lines contains the word', async (): Promise<void> => {
            await supertest(server)
                .put('/file')
                .send(stringsArray);

            await supertest(server)
                .get('/file?text=Amy')
                .expect(200)
                .buffer()
                .parse((ctx: Context, callback): void => {
                    let result = [];
                    ctx.on('data', (data: string): void => {
                        if (data) {
                            result.push(data + '');
                        }
                    });
                    ctx.on('end', (): void => {
                        assert.deepStrictEqual(
                            result,
                            [
                                'After school that day, Kamal took Amy and Tara up to the abandoned house',
                                'Amy didn’t like it there',
                                'Amy didn’t look too impressed'
                            ]
                        );
                        callback();
                    });
                });
        });
    });

});
