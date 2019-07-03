import assert from 'assert';
import BookList from '../../../src/dbQuery/BookList';
import { end, load } from '../fixture';

describe('Book Service', (): void => {
    let service;
    beforeEach(async (): Promise<void> => {
        const db = await load();
        service = new BookList(db);
    });

    afterEach((): void => {
        end()
    });

    it('should return list of books', async (): Promise<void> => {
        const booksList = await service.list().execute();
        assert.deepStrictEqual(booksList.length, 100);
    });

    it('should consider limit and offset', async (): Promise<void> => {
        const booksList = await service.list().skip(50).limit(50).execute();
        assert.deepStrictEqual(booksList.length, 50);
        assert.deepStrictEqual(booksList[0].id, 51);
    });

    it('should sort', async (): Promise<void> => {
        const booksList = await service
            .list()
            .limit(1)
            .sort('autor', 'DESC')
            .execute();
        assert.deepStrictEqual(booksList[0].autor, 'Zion');
    });

    it('should filter', async (): Promise<void> => {
        const booksList = await service
            .list()
            .filter('autor', 'Zion')
            .execute();
        assert.deepStrictEqual(booksList.length, 1);
    });
});
