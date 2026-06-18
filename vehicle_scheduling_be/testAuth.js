const axios = require("axios");

async function testAuth() {
  try {
    const res = await axios.post(
      "http://4.224.186.213/evaluation-service/auth",
      {
        email: "2303a52351@sru.edu.in",
        name: "Saniya Begum",
        rollNo: "2303a52351",
        accessCode: "bDreAq",
        clientID: "72786ad9-fe34-4920-bc21-042a4ef6df72",
        clientSecret: "YzsxqXfhkbZcJVhu"
      }
    );

    console.log("STATUS:", res.status);
    console.log("DATA:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
  }
}

testAuth();