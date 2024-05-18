const mongoose = require('mongoose');
const pln = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ownerDB")
.then(()=>{
  console.log('ownerDB connected')
})
.catch(()=>{
  console.log('failed')
})

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
});

userSchema.plugin(pln);
const Owner = mongoose.model('Owner', userSchema);

module.exports = Owner;