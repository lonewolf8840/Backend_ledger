const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

    email:{
        type: String,
        required: [true, 'Email is required for creating user'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email address'
         ], //to check the giver format of email is correct or not   
    },
    name :{
        type : String,
        required: [true, 'Name is required for creating user'],
    },
    password :{
        type: String,
        required: [true, 'Password is required for creating user'],
        minlength: 6,
        select : false //to not return the password when we fetch the user data
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable: true,
        select: false

    }
});

// Hash the password before saving the user
    userSchema.pre('save', async function(next){
        if(!this.isModified('password')){
            return next();
        }
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;

      return ;
    })

    userSchema.methods.comparePassword = async function(password){
        return await bcrypt.compare(password, this.password);
    }

    const userModel = mongoose.model('user', userSchema);

    module.exports = userModel;