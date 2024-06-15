const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

let zipName = '';

app.post('/upload', upload.array('files'), async (req, res) => {
    const type = req.query.type;
    zipName = `uploads/${Date.now()}.zip`;
    const output = fs.createWriteStream(zipName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        res.sendStatus(200);
    });

    archive.on('error', (err) => {
        console.error('Error during file compression:', err);
        res.status(500).send({ error: 'Error during file compression.' });
    });

    archive.pipe(output);

    for (const file of req.files) {
        const filePath = path.join('uploads', file.filename);
        const compressedPath = path.join('uploads', `compressed-${file.filename}`);

        try {
            if (file.mimetype.startsWith('image/')) {
                await sharp(filePath)
                    .resize(800) // Resize to a width of 800px
                    .toFile(compressedPath);
                archive.file(compressedPath, { name: file.originalname });
            } else {
                archive.file(filePath, { name: file.originalname });
            }
        } catch (err) {
            console.error('Error during image compression:', err);
            res.status(500).send({ error: 'Error during image compression.' });
        }
    }

    archive.finalize();
});

app.get('/download', (req, res) => {
    if (zipName) {
        res.download(zipName, (err) => {
            if (err) {
                console.error('Error during file download:', err);
                res.status(500).send({ error: 'Error during file download.' });
            } else {
                fs.unlinkSync(zipName);
                zipName = '';
            }
        });
    } else {
        res.status(404).send({ error: 'No file available for download.' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
