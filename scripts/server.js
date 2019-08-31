/**===================== API load Code Start =====================*/
var express = require("express");
var gpio = require("rpi-gpio");
const Joi = require("@hapi/joi");
var SchemaObject = require("node-schema-object");
const app = express();
app.use(express.json());
var gpiop = gpio.promise;
/**===================== Handler Methods Code Start =====================*/
app.put("/rent", (req, res) => {
  if (VerifyRentObject(req.body)) {
    gpiop
      .setup(21, gpio.DIR_OUT)
      .then(() => {
        res.status(200).send("Succesfully docked bicycle");
        return gpiop.write(21, false);
      })
      .catch(err => {
        console.log("Error: ", err.toString());
      });
  } else {
    res.status(404).send("Invalid user details");
  }
});
app.put("/dock", (req, res) => {
  if (VerifyDockObject(req.body)) {
    gpiop
      .setup(21, gpio.DIR_OUT)
      .then(() => {
        res.status(200).send("Succesfully docked bicycle");
        return gpiop.write(21, false);
      })
      .catch(err => {
        console.log("Error: ", err.toString());
      });
  } else {
    res.status(404).send("Invalid user details");
  }
});

/**===================== MISC Methods Code Start =====================*/
function VerifyRentObject(rent) {
  const schema = Joi.object()
    .keys({
      studentNumber: Joi.string()
        .alphanum()
        .min(8)
        .max(8)
        .required(),
      bikeId: Joi.string()
        .alphanum()
        .min(16)
        .max(16)
        .required(),
      dockingStation: Joi.string()
        .alphanum()
        .min(5)
        .max(100)
        .required(),
      dateBorrowed: Joi.number().integer()
    })
    .with("studentNumber", ["bikeId", "dockingStation", "dateBorrowed"]);
  const result = Joi.validate(rent, schema);
  console.log(`valid rent object`, !result.error);
  return !result.error;
}

function VerifyDockObject(docking) {
  const schema = Joi.object()
    .keys({
      studentNumber: Joi.string()
        .alphanum()
        .min(8)
        .max(8)
        .required(),
      bikeId: Joi.string()
        .alphanum()
        .min(16)
        .max(16)
        .required(),
      dockingStation: Joi.string()
        .alphanum()
        .min(5)
        .max(100)
        .required(),
      dateBorrowed: Joi.number().integer(),
      dateReturned: Joi.number().integer()
    })
    .with("studentNumber", [
      "bikeId",
      "dockingStation",
      "dateReturned",
      "dateReturned"
    ]);
  const result = Joi.validate(docking, schema);
  console.log(`valid dock object`, !result.error);
  return !result.error;
}

app.listen(3000, "0.0.0.0");
