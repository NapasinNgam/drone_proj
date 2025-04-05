import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import axios from 'axios';

const app = express();
app.use(express.json());

app.use(express.static('public'));

app.get('/drone', (req, res) => {

    res.json({ droneId: process.env.DRONE_ID });
});


// http://localhost:3000/config/65010507
app.get('/config/:yourDroneId',async (req,res) => {
    const yourDroneId = req.params.yourDroneId;
    const url ='https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec'

    try {
        const response = await axios.get(url);
        const data = response.data.data;
        const selectedItems = data
            .filter(item => item.drone_id == yourDroneId)
            .map(item => ({ 
                drone_id: item.drone_id, 
                drone_name: item.drone_name, 
                light: item.light, 
                country: item.country, 
                weight: item.weight 
            }));
        res.send(selectedItems);
    } catch (error) {
        console.log(error);
        res.send('Error');
    }
});

// http://localhost:3000/status/65010507
app.get('/status/:yourDroneId',async (req,res) => {
    const yourDroneId = req.params.yourDroneId;
    const url ='https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec'

    try {
        const response = await axios.get(url);
        const data = response.data.data;
        const selectedItems = data
            .filter(item => item.drone_id == yourDroneId)
            .map(item => ({ 
                condition: item.condition
            }));
        res.send(selectedItems);
    } catch (error) {
        console.log(error);
        res.send('Error');
    }
});




// http://localhost:3000/logs/65010057
app.get('/logs/:yourDroneId',async (req,res) => {
    const droneId = req.params.yourDroneId;
    try {
        const url = `https://app-tracking.pockethost.io/api/collections/drone_logs/records?filter=(drone_id=${droneId})`;

        //get : asyncronous function
        const response = await axios.get(url);
        const data = response.data;
        const items = data.items;

        const selectedItems = items
            .filter(item => item.drone_id == droneId)
            .map( item => 
                ({ drone_ID: item.drone_id, 
                    drone_name:item.drone_name,
                    create : item.created,
                    country: item.country,
                    Celsius: item.celsius 
                }));
        selectedItems.sort((a, b) => {
                    // Convert 'create' to Date object and compare
            const dateA = new Date(a.create);
            const dateB = new Date(b.create);
        
                    // Sort in descending order (latest date first)
            return dateB - dateA;
        });

        res.send(selectedItems);
    } catch (error) {
        console.log(error);
    }
});

app.post('/logs', async (req, res) => {
    const url = "https://app-tracking.pockethost.io/api/collections/drone_logs/records";
    const adminToken = "20250301efx"; // 🔥 ใส่ Token ที่ต้องใช้

    try {
        const { drone_id, drone_name, country, celsius } = req.body;

        const payload = {
            drone_id: Number(drone_id), 
            drone_name,
            country,
            celsius: parseFloat(celsius)
        };

        console.log("📤 Sending Data to PocketBase:", payload);

        const response = await fetch(url, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}` // ✅ เพิ่ม Token ตรงนี้
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json(); // แปลง response เป็น JSON

        if (!response.ok) {
            throw new Error(JSON.stringify(responseData)); // ถ้า error ให้แสดงรายละเอียด
        }

        console.log("✅ Response from PocketBase:", responseData);
        res.status(201).json(responseData);

    } catch (error) {
        console.error("❌ Error from PocketBase:", error.message);
        res.status(500).json({ error: "Failed to create record", details: error.message });
    }
});




app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});



const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});