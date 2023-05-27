import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenInterface {
    user: {
        id: string;
        auth_level: number;
        own?: boolean;
    }
}

export function verifyAuthToken(minLevel: number, allAccessLevel: number, compareType: string | null) {
    return (req: Request, res: Response, next: Function) => {
        try {
            const payload = getPayload(req);
            if (payload && payload.user) {
                const authLevel = payload.user.auth_level;
                // Check that the user is at the required authorisation level
                if (authLevel >= minLevel) {
                    // If user is at a lower level than the all access level, then check they own the record being accessed
                    if (authLevel < allAccessLevel) {
                        if (compareType) {
                            const compareValue = compareType == 'userid' ? req.body.user_id : req.params.id;
                            const userId = payload.user.id;
                            if (userId != compareValue) {
                                throw new Error('You are not permitted to access records that you don\'t own');
                            }
                        } else {
                            payload.user.own = true;
                        }
                    }

                    // If user is authorised, save the decoded authorisation payload and proceed with route
                    res.locals.payload = payload;
                    next();
                } else {
                    throw new Error("You are not permitted to access this operation");
                }
            } else {
                // If we fall through here, either there was no authorisation header or
                // there was no jwt token in the header
                throw new Error("Authorisation token not found!");
            }
        } catch (err) {
            next(err);
        }
    }
}

const getPayload = (req: Request): TokenInterface | undefined => {
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
    } catch (err) {
        throw new Error(`Unable to get authorisation token. ${err}`);
    }
}

export default verifyAuthToken;