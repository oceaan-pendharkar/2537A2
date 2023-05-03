const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
require('dotenv').config();

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/comp2537w2');
    // await mongoose.connect(`mongodb+srv://${process.env.ATLAS_DB_USER}:${process.env.ATLAS_DB_PASSWORD}@clustera3.9w3qrna.mongodb.net/Comp2537?retryWrites=true&w=majority`);
    console.log('connected to db');

    app.listen(process.env.PORT || 3000, () => {
        console.log('Example app listening on port 3000!');
    });
}
