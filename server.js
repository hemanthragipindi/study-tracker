const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DATA_FILE = "data.json";

// Create data.json file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Read data
function readData() {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

// Write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all topics
app.get("/topics", (req, res) => {
    const data = readData();
    res.json(data);
});

// Add new topic
app.post("/add", (req, res) => {
    const data = readData();

    const newTopic = {
        id: Date.now(),
        subject: req.body.subject,
        topic: req.body.topic,
        deadline: req.body.deadline,
        status: "Pending"
    };

    data.push(newTopic);
    writeData(data);

    res.json(newTopic);
});

// Update topic status
app.put("/update/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);

    const topic = data.find(t => t.id === id);

    if (topic) {
        topic.status = req.body.status;
        writeData(data);
        res.json({ message: "Updated" });
    } else {
        res.status(404).json({ message: "Not found" });
    }
});

// Delete topic
app.delete("/delete/:id", (req, res) => {
    let data = readData();
    const id = parseInt(req.params.id);

    data = data.filter(t => t.id !== id);
    writeData(data);

    res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
