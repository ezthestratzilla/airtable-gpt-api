require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",  
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization"
}));

const PORT = process.env.PORT || 3000;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

// 🔹 Fetch Brand Voice for a Specific Brand
app.get("/brand-voice/:brandName", async (req, res) => {
    const { brandName } = req.params;
    const filterFormula = `filterByFormula={Brand Name}='${brandName}'`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Brand%20Voices?${filterFormula}`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });

        if (response.data.records.length === 0) {
            return res.status(404).json({ error: "Brand not found" });
        }

        const brandData = response.data.records[0].fields;
        res.json({
            brand: brandData["Brand Name"],
            tone_style: brandData["Tone & Style"]
        });

    } catch (error) {
        console.error("Error fetching Brand Voice:", error);
        res.status(500).json({ error: "Failed to fetch Brand Voice data" });
    }
});

// 🔹 Fetch Active Campaigns for a Brand
app.get("/campaigns/:brandName", async (req, res) => {
    const { brandName } = req.params;
    const filterFormula = `filterByFormula={Associated Brand}='${brandName}'`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Campaigns?${filterFormula}`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });

        res.json(response.data.records.map(record => record.fields));

    } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ error: "Failed to fetch campaign data" });
    }
});

// 🔹 Fetch Persona Details
app.get("/personas/:personaName", async (req, res) => {
    const { personaName } = req.params;
    const filterFormula = `filterByFormula={Persona Name}='${personaName}'`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Persona%20Library?${filterFormula}`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });

        if (response.data.records.length === 0) {
            return res.status(404).json({ error: "Persona not found" });
        }

        const personaData = response.data.records[0].fields;
        res.json(personaData);

    } catch (error) {
        console.error("Error fetching persona details:", error);
        res.status(500).json({ error: "Failed to fetch persona data" });
    }
});

// 🔹 Fetch Content Library Best Practices
app.get("/content-library/:contentType", async (req, res) => {
    const { contentType } = req.params;
    const filterFormula = `filterByFormula={Content Type}='${contentType}'`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Content%20Library?${filterFormula}`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
        });

        if (response.data.records.length === 0) {
            return res.status(404).json({ error: "Content type not found" });
        }

        const contentData = response.data.records[0].fields;
        res.json(contentData);

    } catch (error) {
        console.error("Error fetching content library details:", error);
        res.status(500).json({ error: "Failed to fetch content data" });
    }
});

// 🔹 Fetch Full Brand Overview (Combining Brand, Campaigns, and Personas)
app.get("/brand-overview/:brandName", async (req, res) => {
    const { brandName } = req.params;
    const brandVoiceUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Brand%20Voices?filterByFormula={Brand Name}='${brandName}'`;
    const campaignsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Campaigns?filterByFormula={Associated Brand}='${brandName}'`;
    const personasUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Persona%20Library`;

    try {
        const [brandVoiceResponse, campaignsResponse, personasResponse] = await Promise.all([
            axios.get(brandVoiceUrl, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
            axios.get(campaignsUrl, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
            axios.get(personasUrl, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } })
        ]);

        if (brandVoiceResponse.data.records.length === 0) {
            return res.status(404).json({ error: "Brand not found" });
        }

        const brandVoiceData = brandVoiceResponse.data.records[0].fields;
        const campaignsData = campaignsResponse.data.records.map(record => record.fields);
        const personasData = personasResponse.data.records.map(record => record.fields);

        res.json({
            brand: brandVoiceData["Brand Name"],
            tone_style: brandVoiceData["Tone & Style"],
            active_campaigns: campaignsData,
            personas: personasData
        });

    } catch (error) {
        console.error("Error fetching brand overview:", error);
        res.status(500).json({ error: "Failed to fetch brand overview" });
    }
});

// 🔹 Start the API Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

