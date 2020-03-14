const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

let allNotesString = fs.readFileSync(path.join(__dirname, "db/db.json"));
let allNotesArr = JSON.parse(allNotesString);


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

app.get("/api/notes", function (req, res) {
    return res.send(allNotesArr);
});

app.get("/api/notes/:id", function (req, res) {
    let chosen = req.params.id;
    console.log(`Chosen id: ${chosen}`);

    for (let i = 0; i < allNotesArr.length; i++) {

        if (chosen === allNotesArr[i].id) {
            return res.json(allNotesArr[i]);
        }
    }

    return res.json(false);
});

app.post("/api/notes", function (req, res) {
    const newNote = req.body;

    newNote.id = newNote.title.replace(/\s+/g, "").toLowerCase();

    console.log(`Note that was just posted:`);
    console.log(newNote);

    allNotesArr.push(newNote);

    console.log("All notes Array after push: ");
    console.log(allNotesArr);

    fs.writeFile(path.join(__dirname, "db/db.json"), JSON.stringify(allNotesArr), function (err) {
        if (err) {
            throw err;
        }
        console.log('Successfully written to db.json file!');
        res.json(newNote);
    })
});

app.delete('/api/notes/:id', (request, response) => {
    const noteId = request.params.id;

    let newNotes = allNotesArr.filter((note) => note.id != noteId);

    if (!newNotes) {
        response.status(500).send('Note is not found.');
    } else {
        allNotesArr = newNotes;
        console.log(`All notes Array after Delete: `);
        console.log(allNotesArr);

        fs.writeFile(path.join(__dirname, "db/db.json"), JSON.stringify(allNotesArr), function (err) {
            if (err) {
                throw err;
            }
            console.log('Successfully deleted from db.json file!');
            response.send(allNotesArr);
        })
    }
});

app.listen(PORT, function () {
    console.log("App lostening on port " + PORT);
});