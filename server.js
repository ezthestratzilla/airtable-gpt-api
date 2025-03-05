require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

// 🔹 Fetch Client Feedback from Airtable
app.get("/client-feedback/:clientName", async (req, res) => {
    const { clientName } = req.params;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={Client Name}='${clientName}'`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });
        res.json(response.data.records);
    } catch (error) {
        console.error("Error fetching Airtable data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// 🔹 Add New Feedback to Airtable
app.post("/add-feedback", async (req, res) => {
    const { clientName, asset, feedbackText } = req.body;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    try {
        const response = await axios.post(url, {
            records: [
                {
                    fields: {
                        "Client Name": clientName,
                        "Asset Name": asset,
                        "Feedback": feedbackText,
                        "Date": new Date().toISOString()
                    }
                }
            ]
        }, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}`, "Content-Type": "application/json" }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error adding feedback:", error);
        res.status(500).json({ error: "Failed to add feedback" });
    }
});

// 🔹 Start the API Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

