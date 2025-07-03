const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
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
        const loyaltyCards = Items.map(item => ({
          loyaltyCardId: item.loyaltyCardId,
          customerName: item.customerName,
          email: item.email,
          pointsBalance: item.pointsBalance,
          tier: item.tier,
          signUpDate: item.signUpDate

        }));
        res.json({ loyaltyCards });
      } else {
        res.json({ loyaltyCards: [] });
      }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve loyalty cards " . error});
  }
});
  

app.post("/loyalty-card", async (req, res) => {
    const { 
      loyaltyCardId, 
      customerName,
      email,
      pointsBalance,
      tier,
      signUpDate 
    } = req.body;
    // if (typeof loyaltyCardId !== "string") {
    //    res.status(400).json({ error: '"loyaltyCardId" must be a string' });
    // } else if (typeof name !== "string") {
    //    res.status(400).json({ error: '"name" must be a string' });
    // }
  
    const params = {
      TableName: LOYALTY_CARDS_TABLE,
      Item: { loyaltyCardId, customerName,email,pointsBalance,tier,signUpDate },
    };
  
    try {
      const command = new PutCommand(params);
      await docClient.send(command);
      res.json({ loyaltyCardId, customerName, email, pointsBalance, tier, signUpDate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Could not create loyalty card " + error});
    }
  });
  

app.get("/loyalty-card/:loyaltyCardId", async (req, res) => {
  const params = {
    TableName: LOYALTY_CARDS_TABLE,
    Key: {
      loyaltyCardId: req.params.loyaltyCardId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { loyaltyCardId, customerName, email, pointsBalance, tier, signUpDate } = Item;
      res.json({ loyaltyCardId, customerName, email, pointsBalance, tier, signUpDate });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find loyalty card with provided "loyaltyCardId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve loyalty card" });
  }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

  
exports.loyaltyCards = serverless(app);