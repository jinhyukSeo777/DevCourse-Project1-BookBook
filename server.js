const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());

app.get("/api/search", async (req, res) => {
  try {
    const { query, page } = req.query;
    const apiUrl = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

    const response = await axios.get(apiUrl, {
      params: {
        TTBKey: "ttbtjwlsgur25561745001",
        Query: query,
        Start: page,
        MaxResults: 8,
        Output: "js",
        Version: "20131101",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Aladin API" });
  }
});

app.get("/api/newitem", async (req, res) => {
  try {
    const { category, page } = req.query;
    const apiUrl = "https://www.aladin.co.kr/ttb/api/ItemList.aspx";

    const response = await axios.get(apiUrl, {
      params: {
        TTBKey: "ttbtjwlsgur25561745001",
        QueryType: "ItemNewAll",
        CategoryId: category || 0,
        SearchTarget: "Book",
        Start: page,
        MaxResults: 8,
        output: "js",
        Version: "20131101",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Aladin API" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
