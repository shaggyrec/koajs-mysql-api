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

        const stream = new Readable({
            read(): boolean {
                return true;
            }
        });

        await new Promise((resolve, reject): void => {
            this.fileManager.read()
                .on('line', (line: string): void => {
                    if (ctx.query.text) {
                        if (line.indexOf(ctx.query.text) !== -1) {
                            stream.push(line);
                        }
                    } else {
                        stream.push(line);
                    }
                })
                .on('close', (): void => {
                    stream.push(null);
                    resolve();
                })
                .on('error', (e): void => {
                    reject(e);
                });
        });

        ctx.body = stream;
    }
}

export default FileController;
