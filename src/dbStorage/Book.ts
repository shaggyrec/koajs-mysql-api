import { Connection } from 'mysql2';
import { BookInterface } from '../dataTypes/Book';

interface UpdatingData {
    title?: string;
    autor?: string;
    description?: string;
    image?: string;
}

class Book {
    private dbConnection: Connection;
    private readonly DB_FIELDS: string[] = ['title', 'date', 'autor', 'description', 'image'];

    public constructor(dbConnection: Connection) {
        this.dbConnection = dbConnection;
    }

    public async delete(id: number): Promise<void> {
        await this.dbConnection.query('DELETE FROM books WHERE id = ?', [id]);
    }

    public async create(book: BookInterface): Promise<void> {
        const commaSeparatedDbFields = this.DB_FIELDS.join(',');
        const commaSeparatedPlaceHolders = this.DB_FIELDS.map((): string => '?').join(',');
        await this.dbConnection.query(
            `INSERT INTO books (${commaSeparatedDbFields}) VALUES (${commaSeparatedPlaceHolders})`,
            [
                book.title,
                new Date(),
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
        await this.dbConnection.query(
            `UPDATE books SET ${commaSeparatedFieldsWithPlaceholders} WHERE id = ?`,
            [...Object.values(data), id]
        );
    }

}

export default Book;
