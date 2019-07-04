import { Connection } from 'mysql2';
import { BookInterface } from '../dataTypes/Book';
import NothingAffected from './errors/NothingAffected';

interface UpdatingData {
    title?: string;
    autor?: string;
    description?: string;
    image?: string;
}

class Book {
    private dbConnection: Connection;
    public static readonly DB_FIELDS: string[] = ['title', 'date', 'autor', 'description', 'image'];

    public constructor(dbConnection: Connection) {
        this.dbConnection = dbConnection;
    }

    public async delete(id: number): Promise<void> {
        const [ result ] = await this.dbConnection.query('DELETE FROM books WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new NothingAffected(`Book with id ${id} does not exist`);
        }
    }

    public async create(book: BookInterface): Promise<void> {
        const commaSeparatedDbFields = Book.DB_FIELDS.join(',');
        const commaSeparatedPlaceHolders = Book.DB_FIELDS.map((): string => '?').join(',');
        await this.dbConnection.query(
            `INSERT INTO books (${commaSeparatedDbFields}) VALUES (${commaSeparatedPlaceHolders})`,
            [
                book.title,
                book.date,
                book.autor,
                book.description,
                book.image
            ]
        );
    }

    public async update(id: number, data: UpdatingData): Promise<void> {
        const commaSeparatedFieldsWithPlaceholders = Object
            .keys(data)
            .map((field: string): string => field + ' = ?')
            .join(',');
        const [ result ] = await this.dbConnection.query(
            `UPDATE books SET ${commaSeparatedFieldsWithPlaceholders} WHERE id = ?`,
            [...Object.values(data), id]
        );

        if (result.changedRows === 0) {
            throw new NothingAffected(`Book with id ${id} does not exist`);
        }
    }

}

export default Book;
