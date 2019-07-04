import fs from 'fs';
import readline, { Interface } from 'readline';
import { dirname } from 'path';

class FileManager {
    private readonly pathToFile: string;

    public constructor(pathToFile: string) {
        this.pathToFile = pathToFile;
        FileManager.createFileInNotExists(pathToFile);
    }

    public write(data: string[]): void
    {
        fs.appendFileSync(this.pathToFile, data.join('\n') + '\n');
    }

    public read(): Interface {
        return readline.createInterface(
            fs.createReadStream(this.pathToFile, { encoding :'utf8' })
        );

    }

    private static createFileInNotExists(pathToFile: string): void {
        if (!fs.existsSync(dirname(pathToFile))) {
            fs.mkdirSync(dirname(pathToFile), { recursive: true });
        }

        if (!fs.existsSync(pathToFile)) {
            fs.appendFileSync(pathToFile, '');
        }

    }
}

export default FileManager;
