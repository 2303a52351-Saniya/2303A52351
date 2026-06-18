const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const BASE_URL = "http://4.224.186.213/evaluation-service";

async function getToken() {
  const response = await axios.post(`${BASE_URL}/auth`, {
    email: "2303a52351@sru.edu.in",
    name: "Saniya Begum",
    rollNo: "2303a52351",
    accessCode: "bDreAq",
    clientID: "72786ad9-fe34-4920-bc21-042a4ef6df72",
    clientSecret: "YzsxqXfhkbZcJVhu"
  });

  return response.data.access_token;
}

function knapsack(vehicles, capacity) {
  const n = vehicles.length;

  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const duration = vehicles[i - 1].Duration;
    const impact = vehicles[i - 1].Impact;

    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];

      if (duration <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - duration] + impact
        );
      }
    }
  }

  let w = capacity;
  const selectedVehicles = [];

  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedVehicles.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return {
    maxScore: dp[n][capacity],
    selectedVehicles
  };
}

app.get("/schedule", async (req, res) => {
  try {
    const token = await getToken();

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const [depotRes, vehicleRes] = await Promise.all([
      axios.get(`${BASE_URL}/depots`, { headers }),
      axios.get(`${BASE_URL}/vehicles`, { headers })
    ]);

    const depots = depotRes.data.depots;
    const vehicles = vehicleRes.data.vehicles;

    console.log("Depots:", depots.length);
    console.log("Vehicles:", vehicles.length);

    const results = depots.map((depot) => {
      const result = knapsack(
        vehicles,
        depot.MechanicHours
      );

      const hoursUsed = result.selectedVehicles.reduce(
        (sum, vehicle) => sum + vehicle.Duration,
        0
      );

      return {
        depotId: depot.ID,
        mechanicHours: depot.MechanicHours,
        hoursUsed,
        maxScore: result.maxScore,
        selectedTaskIds: result.selectedVehicles.map(
          (vehicle) => vehicle.TaskID
        )
      };
    });

    res.json({
      success: true,
      depotsCount: depots.length,
      vehiclesCount: vehicles.length,
      results
    });

  } catch (err) {
    console.error(
      "ERROR:",
      err.response?.status,
      err.response?.data || err.message
    );

    res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});