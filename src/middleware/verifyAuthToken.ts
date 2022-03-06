import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

interface TokenInterface {
    id: string;
    auth_level: number;
}

export function verifyAuthToken(minLevel: number, allAccessLevel: number, compareType: string | null) {
    return (req: Request, res: Response, next: Function) => {
        try {
            const payload = getPayload(req);
            if (payload) {
                const authLevel = payload.auth_level;
                // Check that the user is at the required authorisation level
                if (authLevel >= minLevel) {

                    // If user is at a lower level than the all access level, then check they own the record being accessed
                    if (compareType && authLevel < allAccessLevel) {
                        const compareValue = compareType == 'userid' ? req.body.user_id : req.params.id;
                        const userId = payload.id;
                        if (userId != compareValue) {
                            throw new Error ('You are not permitted to access records that you don\'t own');
                        }
                    }
                    
                    // If user is authorised, save the decoded authorisation payload and proceed with route
                    res.locals.payload = payload;
                    next();
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
} 

const getPayload = (req: Request): TokenInterface | undefined=> {
    try {
        const authorisationHeader = req.headers.authorization as string;
            if (authorisationHeader) {
                const token = authorisationHeader.split(' ')[1];
                if (token) {
                    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET as string);
                    return decodedToken as TokenInterface;
                }
            }
            // If we fall through here, either there was no authorisation header or
            // there was no jwt token in the header
            throw new Error("Authorisation token not found!");
            return ;
    } catch (err) {
        throw new Error(`Unable to get authorisation token. Error: ${err}`);
    }
}

export default verifyAuthToken;