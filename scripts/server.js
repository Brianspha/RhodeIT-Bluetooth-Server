/**===================== API load Code Start =====================*/
var express = require("express");
var gpio = require("rpi-gpio");
const Joi = require("@hapi/joi");
var web3 = require('web3');
var schemaObject = require("node-schema-object");
const app = express();
web3 = new web3('ws://localhost:12000')
app.use(express.json());
var gpiop = gpio.promise;
const abi=[{'constant':false,'inputs':[{'name':'bicycleId','type':'string'},{'name':'dockingStation','type':'string'}],'name':'rentBicycle','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function','signature':'0x13248d51'},{'constant':false,'inputs':[{'name':'studentno_staff_no','type':'string'}],'name':'addUser','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function','signature':'0x18b8275a'},{'constant':false,'inputs':[{'name':'bicycleId','type':'string'},{'name':'dockingStation','type':'string'}],'name':'dockBicycle','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function','signature':'0x2d6b4005'},{'constant':true,'inputs':[{'name':'bicycleId','type':'string'}],'name':'getBicycle','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x3843e770'},{'constant':true,'inputs':[],'name':'getRegisteredBicycleKeys','outputs':[{'name':'','type':'string[]'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x397c08a2'},{'constant':true,'inputs':[{'name':'bicycleId','type':'string'}],'name':'bicycleDocked','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x515e5238'},{'constant':true,'inputs':[],'name':'getAllRegisteredUserKeys','outputs':[{'name':'','type':'address[]'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x647f2753'},{'constant':true,'inputs':[{'name':'name','type':'string'}],'name':'dockingStationExists','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x6e787ca5'},{'constant':false,'inputs':[{'name':'bicycleId','type':'string'},{'name':'dockingStation','type':'string'}],'name':'registerNewBicycle','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function','signature':'0x72b6f6a6'},{'constant':true,'inputs':[{'name':'stationName','type':'string'}],'name':'getDockingStation','outputs':[{'name':'name','type':'string'},{'name':'latitude','type':'string'},{'name':'longitude','type':'string'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x7a64bfff'},{'constant':false,'inputs':[],'name':'updateCredit','outputs':[{'name':'','type':'bool'}],'payable':true,'stateMutability':'payable','type':'function','signature':'0x804d6b38'},{'constant':true,'inputs':[],'name':'getUsercredit','outputs':[{'name':'','type':'uint256'}],'payable':false,'stateMutability':'view','type':'function','signature':'0x9ded3f92'},{'constant':false,'inputs':[{'name':'name','type':'string'},{'name':'latitude','type':'string'},{'name':'longitude','type':'string'}],'name':'registerDockingStation','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'nonpayable','type':'function','signature':'0xab84f853'},{'constant':true,'inputs':[],'name':'userExists','outputs':[{'name':'','type':'bool'}],'payable':false,'stateMutability':'view','type':'function','signature':'0xeae6d4da'},{'constant':true,'inputs':[],'name':'getRegisteredDockingStationKeys','outputs':[{'name':'','type':'string[]'}],'payable':false,'stateMutability':'view','type':'function','signature':'0xec99d823'},{'inputs':[],'payable':false,'stateMutability':'nonpayable','type':'constructor','signature':'constructor'},{'anonymous':false,'inputs':[{'indexed':true,'name':'results','type':'bool'}],'name':'addUserLogger','type':'event','signature':'0x26ebfdc8a1dc10c24a4e10ad4f118805e32277e7897d15016a4c4ddb58db6903'},{'anonymous':false,'inputs':[{'indexed':true,'name':'tHash','type':'string'},{'indexed':true,'name':'results','type':'bool'}],'name':'userExistsLogger','type':'event','signature':'0x2b8bf7028312094fd665dba3ac68e167e0d1bf2c8a4eae069e1bc1f722ea5fa3'},{'anonymous':false,'inputs':[{'indexed':true,'name':'tHash','type':'string'},{'indexed':true,'name':'results','type':'bool'}],'name':'addDockingStationLogger','type':'event','signature':'0xf446255339bd4ab9e7636e2518cc31e0941654a8a74334e0edbf7a7c9c4ce148'},{'anonymous':false,'inputs':[{'indexed':true,'name':'tHash','type':'string'},{'indexed':true,'name':'results','type':'bool'}],'name':'dockingStationExistsLogger','type':'event','signature':'0x0a8e17507c443525dbb4f1b61bfcf3d8b410cfcd454d644d73ff945dadbc6d8f'},{'anonymous':false,'inputs':[{'indexed':true,'name':'name','type':'string'},{'indexed':true,'name':'latitude','type':'string'},{'indexed':true,'name':'longitude','type':'string'}],'name':'foundDockingStationEvent','type':'event','signature':'0x3b41c28dd98b6ee5d63f401a4fd41b4cc6a8423e29496ee32b9a1d171234700b'}]
const rhodeitContractAddress="0x2E58898E630333520467D88116649D13DA44BAE0";
var rhodeitContract = new web3.eth.Contract(abi,rhodeitContractAddress)
console.log(rhodeitContract)
/**===================== Handler Methods Code Start =====================*/
app.put("/rent", async (req, res) => {
  var available=  await isAvailable(req.body)
  let rcpt=''
  if (VerifyRentObject(req.body)&& available) {
    gpiop
      .setup(21, gpio.DIR_OUT)
      .then(() => {
        rhodeitContract.methods.rentBicycle(req.body.bikeId,req.body.dockingStation).send({gas:8000000,from:req.body.eth_address}).then((receipt,err)=>{
          if(!err){
            console.log(`user ${req.body.eth_address}  rental for bicycle docked at ${req.body.dockingStation}\n TransactionReceipt: ${receipt}`)
            res.status(200).send({msg:"Succesfull bicycle rental",tReceipt:receipt,error:false});
            return gpiop.write(21, false);
          }
          rcpt=receipt;
        }).catch((err)=>{
          console.log(`something went wrong whilst processing rental for user ${req.body.eth_address}`)
          res.status(404).send({msg:"error whislt processing rental",tReceipt:rcpt,error:true});
        })
      })
      .catch(err => {
        console.log("Error: ", err.toString());
      });
  } else {
    res.status(404).send("Invalid user details");
  }
});
app.put("/dock", (req, res) => {
  let rcpt=''
  if (VerifyDockObject(req.body)) {
    gpiop
      .setup(21, gpio.DIR_OUT)
      .then(() => {
        rhodeitContract.methods.dockBicycle(req.body.bikeId,req.body.dockingStation).send({gas:8000000,from:req.body.eth_address}).then((receipt,err)=>{
            if(!err){
            console.log(`user ${req.body.eth_address}  docked bicycle at ${req.body.dockingStation}\n TransactionReceipt: ${receipt}`)
            res.status(200).send({msg:"Succesfully docked bicycle",tReceipt:receipt,error:false});
            return gpiop.write(21, false);
          }
        rcpt=receipt
        }).catch((err)=>{
          console.log(`something went wrong whilst docking bicycle for user ${req.body.eth_address} at ${req.body.dockingStation}`)
          res.status(404).send({msg:"error whislt docking bicycle",tReceipt:rcpt,error:true});        
        })
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
      eth_address: Joi.string()
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
        .required()
    })
    .with("eth_address", ["bikeId", "dockingStation"]);
  const result = Joi.validate(rent, schema);
  console.log(`valid rent object`, !result.error);
  return !result.error;
}

function VerifyDockObject(docking) {
  const schema = Joi.object()
    .keys({
      eth_address: Joi.string()
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
    })
    .with("eth_address", [
      "bikeId",
      "dockingStation"
    ]);
  const result = Joi.validate(docking, schema);
  console.log(`valid dock object`, !result.error);
  return !result.error;
}
async function isAvailable(rent){
  rhodeitContract.methods.bicycleDOcked(rent.bikeId).call({gas:8000000,from:rent.eth_address}).then((docked,err)=>{
    if(!err){
      return docked
    }
  }).catch((err)=>{
    console.log("something went wrong: ",err)
  })
}

app.listen(8000, "0.0.0.0");
