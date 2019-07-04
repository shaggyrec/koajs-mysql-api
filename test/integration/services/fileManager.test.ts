import assert from 'assert';
import { exec } from 'child_process';
import fs from 'fs';
import { Interface } from 'readline';
import FileManager from '../../../src/services/FileManager';

const pathToDir = __dirname + '/../files';
const pathToFile = pathToDir + '/test.txt';

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

const consumeStream = (stream: Interface): Promise<string[]> => {
    return new Promise((resolve, reject): void => {
        let out = [];
        stream.on('line', (data): void => {
            out.push(data);
        });
        stream.on('close', (): void => {
            resolve(out);
        });
        stream.on('error', reject);
    });
};


describe(('FileManager service'), (): void => {
    afterEach((): void => {
        exec('rm -rf ' + pathToDir);
    });

    it('should create file and directory if not exists', (): void => {
        assert.strictEqual(fs.existsSync(pathToDir), false);
        assert.strictEqual(fs.existsSync(pathToFile), false);
        new FileManager(pathToFile);
        assert.strictEqual(fs.existsSync(pathToFile), true);
    });

    it('should write in the file', (): void => {
        const file = new FileManager(pathToFile);
        file.write(['text']);
        file.write(['string2']);
        assert.strictEqual(fs.readFileSync(pathToFile, 'utf8'), 'text\nstring2\n')
    });

    it('should read file', async (): Promise<void> => {
        const file = new FileManager(pathToFile);
        file.write(stringsArray);
        const data = await consumeStream(file.read());
        assert.deepStrictEqual(data, stringsArray);
    });
});
