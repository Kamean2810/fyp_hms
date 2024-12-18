class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    };
};

export const errorMiddleware = (err,req,res,next)=>{
    err.message = err.message || "Internal Server Error...";
    err.statusCode = err.statusCode || 500;

    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    };
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, Please Try Again!..`;
        err = new ErrorHandler(message, 400);
    };
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is Expired, Please Try Again!..`;
        err = new ErrorHandler(message, 400);
    };
    if(err.name === "CastError"){
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    };
    
    const errorMessage = err.errors
    ? Object.values(err.errors)
    .map((error) => error.message)
    .join(" ")
    : err.message;


    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });

};

export default ErrorHandler;

/* We Use error class because we work in Node js
and also error class is exist in JavaScript which
is not duplicate so that's why we use error class..
*/

/* 11000 code is coming from DB and occured when we have same values
and the CastError is occured when we entered the data in worng form*/
