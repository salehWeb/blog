import prisma from '../../../libs/prisma/index';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';

interface ILogin {
    email: string
    password: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === "POST") {
        const { email, password } = req.body as ILogin;
        const UserData = await prisma.user.findUnique({ where: { email: email } });
        try {

            if (!UserData) return res.status(400).json({ error: `user with this email ${email} dose not exist` })

            else {
                if (password && email && UserData.password) {
                    const isMatch = compareSync(password, UserData.password)
                    if (!isMatch) return res.status(400).json({ error: `password is incorrect` })
                    else {
                        const token = jwt.sign({ id: UserData.id, role: UserData.role }, process.env.SECRET_KEY as string, { expiresIn: '2h' })

                        const fullYear = 1000 * 60 * 60 * 24 * 365;

                        const refreshToken = jwt.sign({ id: UserData.id }, process.env.SECRET_KEY as string, { expiresIn: fullYear })


                        setCookie("refresh-token", refreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "strict",
                            maxAge: fullYear, // full year
                            expires: new Date(Date.now() + fullYear),
                            path: "/",
                            req,
                            res
                        })
                        const data = { 
                            id: UserData.id, 
                            createdAt: UserData.createdAt, 
                            email: UserData.email, 
                            name: UserData.name, 
                            role: UserData.role, 
                            token
                         } 
                        return res.status(200).json({data, massage: "login success" })
                    }
                }
                else return res.status(400).json({ error: 'you must fill all fields or sing up with google or github' })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ massage: 'server error' });
        }
    } else return res.status(404).json({ massage: `this method ${req.method} is not allowed` });
}

export default handler;