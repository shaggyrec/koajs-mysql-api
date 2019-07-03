import { Connection } from 'mysql2';
import { BookInterface } from '../dataTypes/Book';

class BookList {
    private db: Connection;
    private dbQuery: string;
    private dbQueryLimit: string = '100';
    private dbQueryOffset: string = '0';
    private dbQueryOrderBy: string = 'id';
    private dbQueryOrderDirection: string = 'ASC';
    private dbQueryWhereClause: string = '';

    public constructor(db: Connection) {
        this.db = db;
    }

    public list(): BookList {
        this.dbQuery = 'SELECT * FROM books';
        return this;
    }

    public limit(limit: number): BookList {
        this.dbQueryLimit = `${this.db.escape(limit)}`;
        return this;
    }

    public skip(offset: number): BookList {
        this.dbQueryOffset = `${this.db.escape(offset)}`;
        return this;
    }

    public sort(field: string, direction: string): BookList {
        this.dbQueryOrderBy = field;
        this.dbQueryOrderDirection = direction;
        return this;
    }

    public filter(field: string, value: string): BookList {
        this.dbQueryWhereClause = `WHERE ${field} = ${this.db.escape(value)}`;
        return this;
    }

    public async execute(): Promise<BookInterface[]> {
        const [ bookslist ] = await this.db.query(
            `${this.dbQuery} ${this.dbQueryWhereClause} ORDER BY ${this.dbQueryOrderBy} ${this.dbQueryOrderDirection} LIMIT ${this.dbQueryLimit} OFFSET ${this.dbQueryOffset}`
        );
        return bookslist;
    }
}

export default BookList;
