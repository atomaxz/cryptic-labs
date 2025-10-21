import { exec } from "child_process";
import express from "express";
import fs from "fs";
import cors from "cors";
import joi from "joi";
import bodyParser from "body-parser";

const app = express();

const corsConfig = {
  origin: "*",
};

app.use(cors(corsConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/abi_json", express.static("abi_json"));

const validateCreateContract = (requestData) => {
  const createContract = joi
    .object({
      network: joi.string().required(),
      url_api_key: joi.string().required(),
      private_key_account: joi.string().hex().required(),
    })
    .options({ abortEarly: false });
  return createContract.validate(requestData);
};

const sendResponse = (status, message, response = []) => {
  const payload = {
    status: status,
    message: message,
  };
  if (
    Object.keys(response).length > 0 ||
    (typeof response !== "undefined" && response.length > 0)
  )
    payload.data = response;

  return payload;
};

const responseServer400 = (res, msg) =>
  res.status(400).json(sendResponse(false, msg));

const responseServer404 = (res, msg) =>
  res.status(404).json(sendResponse(false, msg));

const responseServer200 = (res, msg, data = "") =>
  res.status(200).json(sendResponse(true, msg, data));

const responseServer500 = (res, msg, data = "") =>
  res.status(500).json(sendResponse(false, msg, data));

app.post("/createSmartContract", (req, res) => {
  const response_error = {};
  const { error } = validateCreateContract(req.body);
  if (error) {
    error.details.forEach((err_msg) => {
      response_error[err_msg.path[0]] = err_msg.message;
    });
  } else {
    fs.writeFileSync(
      ".env",
      `NETWORK=${req.body.network}\r\nURL=${req.body.url_api_key}\r\nACCOUNTS=${req.body.private_key_account}`
    );
    fs.writeFileSync(
      "run_hardhat.sh",
      `npx hardhat run scripts/deploy.js --network ${req.body.network}`
    );
  }
  Object.keys(response_error).length === 0
    ? exec("sh run_hardhat.sh", (error, stdout, stderr) => {
        if (error !== null)
          return responseServer500(res, "Process Failure", stderr);
        if (!fs.existsSync("abi_json")) fs.mkdirSync("abi_json");

        const nameFile = `ABI_FILE_JSON_SMARTCONTRACT.json`;
        if (!fs.existsSync(`abi_json/${nameFile}`)) {
          fs.copyFileSync(
            "artifacts/contracts/SmartContract.sol/SmartContract.json",
            `abi_json/${nameFile}`
          );
        }

        const abi_url = `${req.protocol}://${req.get(
          "host"
        )}/abi_json/${nameFile}`;

        const response = {
          address_contract: stdout.split("\n")[2],
          abi_json_url: abi_url,
        };
        return responseServer200(res, "Process Successfully", response);
      })
    : responseServer500(
        res,
        "failed to process endpoint",
        JSON.parse(JSON.stringify(response_error).replace(/\\"/g, ""))
      );
});

app.use("/", (req, res) => {
  return responseServer500(res, "Something Wrong!, Check Again!");
});

app.listen(3000, () => {
  console.log(`server runing on http://localhost:3000`);
});
