const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const COUPONS_TABLE = process.env.COUPONS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get("/coupons", async (req, res) => {
    const params = {
      TableName: COUPONS_TABLE
    };
  
    try {
        const command = new ScanCommand(params);
        const { Items } = await docClient.send(command);
        
        if (Items && Items.length > 0) {
          const coupons = Items.map(item => ({
            couponId: item.couponId,
            name: item.name
          }));
          res.json({ coupons });
        } else {
          res.json({ coupons: [] });
        }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not retrieve coupon" });
    }
  });

exports.coupons = serverless(app);