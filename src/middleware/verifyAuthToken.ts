import express, {Request, Response} from 'express';
import jwt from 'jsonwebtoken';

interface TokenInterface {
    id: string;
    auth_level: number;
}

export function verifyAuthToken(minLevel: number, allAccessLevel: number, compareType: string) {
    return (req: Request, res: Response, next: Function) => {
        try {
            const authorisationHeader = req.headers.authorization as string;
            if (authorisationHeader) {
                const token = authorisationHeader.split(' ')[1];
                if (token) {
                    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET as string);
                    const authLevel = (decodedToken as TokenInterface).auth_level;
                    
                    // Check that the user is at the required authorisation level
                    if (authLevel >= minLevel) {

                        // If user is at a lower level than the all access level, then check they own the record being accessed
                        if (authLevel < allAccessLevel) {
                            const compareValue = compareType == 'userid' ? req.body.user_id : req.params.id;
                            const userId = (decodedToken as TokenInterface).id;
                            if (userId != compareValue) {
                                throw new Error ('You are not permitted to access records that you don\'t own');
                            }
                        }
                        
                        // If user is authorised, proceed with route
                        next();
                    } 

                    throw new Error('You are not authorised to perform this operation');
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

// Reject attempts to create, modify or delete a user at a higher level than you
export const noLeapFrog = (req: Request, res: Response, next: Function) => {
    try {
        const payload = getPayload(req, res);
        if (payload && req.body.auth_level >= payload.auth_level) {
            // User is creating or modifying a user at the same or lower level
            next();
        }
    } catch(err) {
        res.status(401);
        next(err);
    }
}

const getPayload = (req: Request, res: Response): TokenInterface | undefined=> {
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