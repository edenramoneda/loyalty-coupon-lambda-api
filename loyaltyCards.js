const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const LOYALTY_CARDS_TABLE = process.env.LOYALTY_CARDS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get("/loyalty-cards", async (req, res) => {
    const params = {
      TableName: LOYALTY_CARDS_TABLE
    };
  
    try {
        const command = new ScanCommand(params);
        const { Items } = await docClient.send(command);
        
        if (Items && Items.length > 0) {
          const coupons = Items.map(item => ({
            loyaltyCardId: item.loyaltyCardId,
            name: item.name
          }));
          res.json({ coupons });
        } else {
          res.json({ coupons: [] });
        }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not retrieve loyalty cards " . error});
    }
  });


app.post("/loyalty-card", async (req, res) => {
    const { loyaltyCardId, name } = req.body;
    if (typeof loyaltyCardId !== "string") {
       res.status(400).json({ error: '"loyaltyCardId" must be a string' });
    } else if (typeof name !== "string") {
       res.status(400).json({ error: '"name" must be a string' });
    }
  
    const params = {
      TableName: LOYALTY_CARDS_TABLE,
      Item: { loyaltyCardId, name },
    };
  
    try {
      const command = new PutCommand(params);
      await docClient.send(command);
      res.json({ loyaltyCardId, name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Could not create loyalty card" });
    }
  });
  

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

  
exports.loyaltyCards = serverless(app);