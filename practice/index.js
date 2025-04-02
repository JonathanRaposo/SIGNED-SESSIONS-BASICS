
const fs = require('fs').promises;
const path = require('path');

async function readFile(filePath, content) {

    try {
        await fs.access(filePath);
        console.log('File exists. Reading File...')
        const data = await fs.readFile(path.join(filePath), 'utf-8')
        console.log(data)
    } catch (err) {
        console.log(err.message)
        if (err.code === 'ENOENT') {
            console.log('File does not exists. creating File...')
            await fs.writeFile(filePath, JSON.stringify(content), 'utf-8');
            console.log('File created.')
        } else {
            console.error('An error occurred:', err.message)
        }

    }
}

readFile(path.join(__dirname, '..', 'db', 'sessions.json'), {});