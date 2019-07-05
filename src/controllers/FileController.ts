import { Context } from 'koa';
import FileManager from '../services/FileManager';
import { Readable } from 'stream';

class FileController {
    private fileManager: FileManager;
    public constructor(fileManager: FileManager) {
        this.fileManager = fileManager;
    }

    public async write(ctx: Context): Promise<void> {
        this.fileManager.write(ctx.request.body);
        ctx.status = 200;
    }

    public async read(ctx: Context): Promise<void> {
        ctx.response.set('content-type', 'text/plain');

        const stream = new Readable({ read: (): boolean => true });

        this.fileManager.read()
            .on('line', (line: string): void => {
                if (ctx.query.text) {
                    if (line.indexOf(ctx.query.text) !== -1) {
                        stream.push(line + '\n');
                    }
                } else {
                    stream.push(line + '\n');
                }
            })
            .on('close', (): void => {
                stream.push(null);
            })
            .on('error', (e): void => {
                throw new e;
            });

        ctx.body = stream;
    }
}

export default FileController;
