const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../model/model');
const { ethers } = require('ethers');


const env = require('dotenv');
env.config();
const jwtSecret = process.env.JWT_SECRET

const vaildationSchena = Joi.object({
    password: Joi.string().required('password is required').alphanum('characters must be alphanumeric')
})

const validationAddress = (address) => {
    console.log(address);
    console.log(ethers.isAddress(address));
    if (ethers.isAddress(address)) {
        console.log('Valid wallet address');
        return true;
      } else {
        console.log('Invalid wallet address');
        return false;
      }
} 

const createUser = async(req, res) => {
    try{
        console.log('create user');
        console.log(req.body);
        const { name, address, password } = req.body;
        const passwordobj = {password: password};
        const { error } = vaildationSchena.validate(passwordobj);
        if(error){
            console.log(error);
            const message = error.details[0].message;
            const err = new Error(message);
            err.statusCode = 400;
            throw err 
        }
        if(!validationAddress(address)){
            const err = new Error('Invalid wallet address');
            console.log(err);
            err.statusCode = 400;
            throw err;
        }
        console.log('validation done');
        let user = await User.findOne({address});

        if(user) throw new Error('User already exists');

        const salt = 10;
        const getSalt = await bcrypt.genSalt(salt);
        const hashedPassword = await bcrypt.hash(password, getSalt);

        user = new User({address, name, password});
        user.password = hashedPassword;
        await user.save();

        res.json({
            message: 'User created successfully',
            succeeded: true,
            data: user
        });


    }catch (error) {
        const message = error?.message;
		const statusCode = error?.statusCode;
		res.status(statusCode ?? 400).json({
			message,
			succeeded: false,
			data: null,
		});
    }

}



const loginUser = async(req, res) => {
    try{
        const { address, password } = req.body;
        console.log('in login')
        console.log(address);

        const passwordobj = {password: password};
        const { error } = vaildationSchena.validate(passwordobj);

        if(error){
            const message = error.details[0].message;
            const err = new Error(message);
            err.statusCode = 400;
            throw err 
        }

        if(!validationAddress(address)){
            const err = new Error('Invalid wallet address');
            err.statusCode = 400;
            throw err;
        }
        console.log('validation done');
        
        let user = await User.findOne({address: address});
        if(!user) throw new Error('User does not exist');

        const hashedPassword = user.password;

        const checkpassword = await bcrypt.compare(password, hashedPassword);

        if(!checkpassword) throw new Error('Invalid password');

        const token = await jwt.sign(
            {
                address: user.address,
                id: user?._id
            },
            jwtSecret,
        );

        // Set the token in an HTTP-Only cookie
        res.cookie('token', token, {
            httpOnly: true,  
            secure: true,    
            sameSite: 'None', 
            maxAge: 3600000*6   
        });

        res.status(200).json({
            message: 'User logged in successfully',
            succeeded: true,
            data: {
                email: user.email,
                token: token,
                username: user.name
            }
        })

    } catch (error) {
        const message = error?.message;
		const statusCode = error?.statusCode;
		res.status(statusCode ?? 400).json({
			message,
			succeeded: false,
			data: null,
		});
    }
}



// Protected route example
const protectedRoute = (req, res) => {
    console.log(0)
    console.log(req.headers.cookie)
    const tokensplit = req.headers.cookie.split('=');
    const token = tokensplit[1];
    console.log(token)
    console.log(1)
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
        console.log(2)
      //const decoded = jwt.verify(token, 'FlO9yja5F9IuoY0otX0v4pax+zE=');
      //console.log(decoded)
      return res.json({ message: 'Welcome to the protected route' });
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


const getUser = async(req, res) => {
    try {
        //get the user id set from auth
        const id = req.id;
        const user = await User.findOne({_id: id}).select(['address','name','_id','createdAt', 'updatedAt']).exec();
        if(!user) throw new Error('User not found');

        res.status(200).json({
            message: 'Get User successful',
            succeeded : true,
            data: user  
        })

    } catch (error) {
        const message = error?.message;
		const statusCode = error?.statusCode;
		res.status(statusCode ?? 400).json({
			message,
			succeeded: false,
			data: null,
		});
    }
}

const updateUser = async(req, res) => {
    try {
        const { name } = req.body;
        const id = req.id;
        const user = await User.findOneAndUpdate({_id: id}, {name}, {new: true}).select(['address','name','_id','createdAt', 'updatedAt']).exec();
        if(!user) throw new Error('User not found');

        res.status(200).json({
            message: 'Update User successful',
            succeeded : true,
            data: user  
        })

    } catch (error) {
        const message = error?.message;
        const statusCode = error?.statusCode;
        res.status(statusCode ?? 400).json({
            message,    
            succeeded: false,
            data: null,
        });
    }
}


module.exports = {
    createUser,
    loginUser,
    protectedRoute,
    getUser,
    updateUser
}