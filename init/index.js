const mongoose = require("mongoose");

const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://vaibhav:vaibhav@cluster0.azhpv.mongodb.net/";


main().then(()=>{
    console.log("connected to DB");
    
}).catch((err)=>{
    console.log(err);
    
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("data was initialized");
    
}

initDB();