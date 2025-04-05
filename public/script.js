let data = null;

window.onload = async function() {
    try {
        const configRes = await fetch('/drone');
        const configDroneId = await configRes.json();
        const droneId = configDroneId.droneId;

        if (!droneId) {
            console.error("droneId not found in config");
            return;
        }


        const page = document.body.getAttribute("data-page");
        switch (page) {
            case "page1":
                console.log("Fetched droneId:", droneId); 
                data = await fetchData(droneId);
                console.log("Data:", data);
                displayDroneData();
                break;
            case "page2":
                console.log("Page 2");
                break;
            case "page3":
                console.log("Page 3")
                console.log("Fetched droneId:", droneId); 
                data = await fetchDataLogs(droneId);
                console.log("Data:", data);
                displaydronelog();
                break
            default:
        }
    } catch (error) {
        console.error("Error fetching config:", error);
    }
};

async function fetchData(droneId) {

    const url = `/config/${droneId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function fetchDataLogs(droneId) {

    const url = `/logs/${droneId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function displayDroneData() {
    try {
        const resultDiv = document.getElementById("droneInfo");
        resultDiv.innerHTML = "";
        data.forEach(drone => {
            const droneInfo = `
                <div class="drone-card">
                    <h2>${drone.drone_name} (ID: ${drone.drone_id})</h2>
                    <p><strong>Light:</strong> ${drone.light}</p>
                    <p><strong>Country:</strong> ${drone.country}</p>
                </div>
            `;
            resultDiv.innerHTML += droneInfo;
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("result").innerHTML = "<p style='color:red;'>Error fetching data</p>";
    }
};


async function postDroneData() {
    const temperatureInput = document.getElementById("droneIdInput").value.trim();
    const configRes = await fetch('/drone');
    const configDroneId = await configRes.json();
    const droneId = configDroneId.droneId;
    console.log(droneId);

    try {
        if (!droneId) {
            console.error("Error: droneId not found.");
            alert("Drone ID not found. Please try again.");
            return;
        }

        const droneData = await fetchData(droneId);

        console.log("Drone Data: ",droneData);
        

        const dataPOST = {
            celsius: parseFloat(temperatureInput) || 0.0,
            drone_id: String(droneData[0].drone_id || ""),  
            drone_name: String(droneData[0].drone_name || ""),
            country: String(droneData[0].country || ""),
        };

        console.log("Sending Data:", dataPOST); 

    
        const response = await fetch("/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataPOST)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("✅ Success:", result);
            alert("Temperature recorded successfully!");
        } else {
            console.error("❌ Failed to record temperature");
            alert("Error recording temperature.");
        }
    } catch (error) {
        console.error("⚠️ Error:", error);
        alert("An error occurred while recording temperature.");
    
}}


async function displaydronelog() {
    try {
        const tableBody = document.getElementById("dronelogs-body");
        tableBody.innerHTML = ""; 

        data.sort()

        data.forEach(drone => {
            const row = `
                <tr align="center">
                    <td>${drone.create}</td>
                    <td>${drone.country}</td>
                    <td>${drone.drone_ID}</td>
                    <td>${drone.drone_name}</td>
                    <td>${drone.Celsius}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error displaying data:", error);
    }
}
