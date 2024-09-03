const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Statisches Ausliefern der index.html-Datei
app.use(express.static('.'));

// Body-Parser für JSON-Anfragen
app.use(bodyParser.json());



async function getAllFilesInDirectory(dirPath) {
    let fileList = []; // Array zum Speichern aller Dateien

    try {
        // Lese den Inhalt des aktuellen Ordners
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        // Durchlaufe jede Datei oder jeden Ordner im aktuellen Verzeichnis
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                // Rekursiver Aufruf, um Dateien im Unterordner zu holen
                const subDirFiles = await getAllFilesInDirectory(filePath);
                fileList = fileList.concat(subDirFiles);
            } else {
                // Datei zum Array hinzufügen
                fileList.push(filePath);
            }
        }
    } catch (error) {
        console.error('Fehler beim Durchsuchen des Verzeichnisses:', error.message);
    }

    return fileList;
}
// Endpunkt zum Abrufen des Dateipfads
app.get('/get-file-path', async (req, res) => {
    const folderPath = path.join(__dirname, 'extracted_images');
    //const filenames = fs.readdirSync(folderPath)
    //const filenames =await  getAllFilesInDirectory(folderPath)

    const filenames = await fs.readdir(folderPath, { recursive: true }, (err) => err && console.error(err));
    
    //const filePath = path.join(folderPath, filename);

    // Überprüfen, ob die Datei existiert
    res.json({ filenames: filenames.filter(f=>f.endsWith(".jpg")) });
    /*if (fs.existsSync(filePath)) {
        
    } else {
        res.status(404).json({ error: 'File not found' });
    }*/
});

// Endpunkt zum Speichern der JSON-Daten als Datei
app.post('/save-json', async (req, res) => {
    const { name, data } = req.body;

    // Überprüfen, ob die benötigten Daten vorhanden sind
    if (!name || !data) {
        return res.status(400).json({ error: 'Name and data fields are required' });
    }

    const filePath = path.join(__dirname, 'hashes', `${name}`);

    try {
        await fs.access(filePath);
        console.log(`Die Datei "${filePath}" existiert.`);
        res.json({ message: 'File exsists', path: filePath });
        return true;
    } catch (error) {
        await fs.writeFile(filePath, JSON.stringify(data));
        res.json({ message: 'File saved successfully', path: filePath });
        return false;
    }

    //await fs.writeFile(filePath, JSON.stringify(data));
    //res.json({ message: 'File saved successfully', path: filePath });
    // Datei speichern
    /*fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file' });
        }

        res.json({ message: 'File saved successfully', path: filePath });
    });*/
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
