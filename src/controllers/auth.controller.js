const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailservice = require('../services/email.service');
const accountModel = require('../models/accounts.model');
const tokenBlackListModel = require("../models/blackList.model")


async function userRegisterController(req, res) {
    const { email, name, password } = req.body;

    const isExists = await userModel.findOne({
        email: email
    });

    if (isExists) {
        return res.status(422).json({
            message: "User already exists with this email",
            status: "fail"
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    });


    // Create a default account for this user at registration time
    await accountModel.create({
        user: user._id,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });
    
    await emailservice.sendRegistrationEmail(user.email, user.name);

    return res.cookie('token', token).status(201).json({
      user :{
        _id: user._id,
        email: user.email,
        name: user.name
      },
      message: "User registered successfully",
        token
    })


}


async function userLoginController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email
    }).select('+password'); //to include the password field in the result

        if(!user){
            return res.status(404).json({
                message: "User not found with this email",
                status: "fail"
            })
        }

        const isValidPassword = await user.comparePassword(password);

        if(!isValidPassword){
            return res.status(401).json({
                message: "Invalid password",
                status: "fail"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '3d'
        });

        return res.cookie('token', token).status(200).json({
            message: "User logged in successfully",
            user :{
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

        









}


/**
 * - User Logout Controller
 * - POST /api/auth/logout
  */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

}




module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}