const axios = require("axios");

const BASE_URL = "http://4.224.186.213/evaluation-service";

async function run() {
  try {
    const auth = await axios.post(`${BASE_URL}/auth`, {
      email: "2303a52351@sru.edu.in",
      name: "Saniya Begum",
      rollNo: "2303a52351",
      accessCode: "bDreAq",
      clientID: "72786ad9-fe34-4920-bc21-042a4ef6df72",
      clientSecret: "YzsxqXfhkbZcJVhu"
    });

    const token = auth.data.access_token;

    console.log("TOKEN OK");

    const depots = await axios.get(
      `${BASE_URL}/depots`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("DEPOTS SUCCESS");
    console.log(depots.data);

  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
  }
}

run();