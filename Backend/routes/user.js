const { Router } = require("express");
const { createUser, loginUser, getUser, updateUser } = require("../controller/user");
const { auth } = require("../middleware/middleware");


const userRouter = Router();

userRouter
    .post("/register", createUser)
    .post("/login", loginUser)
    .get("/getuser", auth, getUser)
    .put("/updateuser", auth, updateUser);

module.exports = { userRouter };