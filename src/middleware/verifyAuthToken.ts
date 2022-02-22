import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

const verifyAuthToken = (req: Request, res: Response, next: Function) => {
    try {
        const authorisationHeader = req.headers.authorization as string;
        if (authorisationHeader) {
            const token = authorisationHeader.split(' ')[1];
            if (token) {
                jwt.verify(token, process.env.TOKEN_SECRET as string);
                next();
                return;
            }
        }
        
        // If we fall through here, either there was no authorisation header or
        // there was no jwt token in the header
        throw new Error("Authorisation token not found!");
        
    } catch (error) {
        res.status(401);
        next(error);
    }
}

export default verifyAuthToken;