const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const tokenBlackListModel = require("../models/blackList.model")



const authMiddleware = async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access , token is missing",
            status: "fail"
        })
    }


    const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access",
                status: "fail"
            })
        }

        req.user = user;
        return next();


    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access , token is invalid",
            status: "fail"
        })
    }
}

const authSystemUserMiddleware = async (req, res, next) => {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access , token is missing",
            status: "fail"
        })
    }


    const isBlacklisted = await tokenBlackListModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');

        if (!user || !user.systemUser) {
            return res.status(401).json({
                message: "Unauthorized access",
                status: "fail"
            })
        }

        req.user = user;
        return next();
    }
    catch {
        return res.status(401).json({
            message: "Unauthorized access , token is invalid",
            status: "fail"
        })
    }
}


module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};