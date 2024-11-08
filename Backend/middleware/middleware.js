const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();
const jwtSecret = process.env.JWT_SECRET
const test = "FlO9yja5F9IuoY0otX0v4pax+zE=";

const auth = (req, res, next) => {

    try {
        const cookieToken = req.headers.cookie.split('=');
        const cookieTokensplit = cookieToken[1];
        
        // const token = req.headers['authorization'];
        // console.log('this is token');
        // console.log(token);
        // const splitToken = token.split(' ');
        // const bearer = splitToken?.[0];
        // if(bearer !== 'Bearer') {
        //     const message = new Error('authorised user');
        //     err.statusCode = 400;
        //     throw message;
        // }

        // const jwtToken = splitToken?.[1];
        const result = jwt.verify(cookieTokensplit,test);
        //const result = jwt.verify(jwtToken, jwtSecret);
        console.log('this is result')
        console.log(result);
        const userId = result?.id;
        console.log(userId)

        req.id = userId;

        //res.write(JSON.stringify(result));
        next();
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