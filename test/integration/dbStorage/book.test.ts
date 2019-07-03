import * as assert from 'assert';
import Book from '../../../src/dbStorage/Book';
import { end, load } from '../fixture';

describe('Book Db Storage', (): void => {
    let storage;
    let db;
    beforeEach(async (): Promise<void> => {
        db = await load();
        storage = new Book(db);
    });

    afterEach(async (): Promise<void> => {
        await end();
    });

    it('should delete book', async (): Promise<void> =>  {
        await storage.delete(1);
        const [result] = await db.query('SELECT id FROM books WHERE id = ?', [1]);
        assert.strictEqual(result.length, 0);
    });

    it('should add book', async (): Promise<void> =>  {
        const newBookData = {
            title: 'title',
            autor: 'pushkin',
            description: 'fairy tail',
            image: '/img/src.jpg',
        };
        await storage.create(newBookData);
        const [result] = await db.query('SELECT * FROM books ORDER BY id DESC LIMIT 1');
        assert.strictEqual(result[0].title, newBookData.title);
        assert.strictEqual(result[0].autor, newBookData.autor);
    });

    it('should update book', async (): Promise<void> =>  {
        const newBookData = {
            title: 'title',
            autor: 'pushkin',
        };
        await storage.update(1, newBookData);
        const [result] = await db.query('SELECT * FROM books WHERE id = ?', [1]);
        assert.strictEqual(result[0].title, newBookData.title);
        assert.strictEqual(result[0].autor, newBookData.autor);
    });
});
