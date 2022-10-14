import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../libs/prisma'
import { GetUserIdMiddleware } from '../../../middleware'
import { IChangeBlogName, IChangePassword, ISocil, IUpdateProfileGeneralInformation } from '../../../types/profile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { error, id } = await GetUserIdMiddleware(req)
            if (error) return res.status(400).json({ massage: error });
            const user = await prisma.user.findFirst({
                where: {
                    id: id
                },
                select: {
                    Avter: {
                        select: {
                            fileUrl: true
                        },
                    },
                    firstName: true,
                    lastName: true,
                    title: true,
                    about: true,
                    email: true,
                    blogName: true,
                    phoneNumber: true,
                    country: true,
                    city: true,
                    socil: {
                        select: {
                            name: true,
                            link: true
                        },
                    },
                },
            })

            if (!user) return res.status(404).json({ massage: "user Not Found" });

            return res.status(200).json({ user })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }
    if (req.method === "PATCH") {
        try {
            const data: IUpdateProfileGeneralInformation = req.body;
            if (data.phoneNumber && typeof Number(data.phoneNumber) !== 'number') return res.status(400).json({ massage: "Phone Number must be a number" });

            const { error, id } = await GetUserIdMiddleware(req);
            if (error) return res.status(400).json({ massage: error });

            const user = await prisma.user.findFirst({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                },
            })

            if (!user) return res.status(404).json({ massage: "user Not Found" });

            await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    country: data.country,
                    city: data.city,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: Number(data.phoneNumber) || null,
                    title: data.title,
                    about: data.about,
                },
            })

            return res.status(200).json({ massage: 'Success to update data' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }

    if (req.method === "PUT") {
        if (req.query["password"] === "true") {
            const data: IChangePassword = req.body;
            try {
                const { error, id } = await GetUserIdMiddleware(req);
                if (error) return res.status(400).json({ massage: error });
                const user = await prisma.user.findFirst({
                    where: {
                        id: id,
                    },
                    select: {
                        id: true,
                        password: true,
                    },
                })

                if (!user) return res.status(404).json({ massage: "user Not Found" });

                const isMatch = compareSync(data.currentPassword, user.password)
                
                if (!isMatch) return res.status(400).json({ error: `password is incorrect` })

                const salt = genSaltSync(10);
                const hashPassword = hashSync(data.newPassword, salt)

                await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        password: hashPassword,
                    },
                })

                return res.status(200).json({ massage: 'Success' });
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error });
            }
        }

        if (req.query["blogName"] === "true") {
            try {
                const data: IChangeBlogName = req.body
                const { error, id } = await GetUserIdMiddleware(req);
                if (error) return res.status(400).json({ massage: error });

                const user = await prisma.user.findFirst({
                    where: {
                        id: id,
                    },
                    select: {
                        id: true,
                    },
                })

                const isFoundSameName = await prisma.user.findFirst({
                    where: {
                        blogName: data.blogName,
                    },
                    select: {
                        id: true,
                    },
                })

                if (!user) return res.status(404).json({ massage: "user Not Found" });

                if (isFoundSameName) return res.status(400).json({ massage: "blog Name Is All ready exist" });

                await prisma.user.update({
                    where: {
                        id: id,
                    },
                    data: {
                        blogName: data.blogName,
                    },
                })
                return res.status(200).json({ massage: 'Success' })
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error });
            }
        }
    }

    if (req.method === "POST") {
        try {

            const { error, id } = await GetUserIdMiddleware(req);
            if (error) return res.status(400).json({ massage: error });
            if (id === undefined) return res.status(400).json({ massage: "Bad Request" });

            const user = await prisma.user.findFirst({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                },
            })

            if (!user) return res.status(404).json({ massage: "user Not Found" });

            const data: ISocil = req.body;
            const isFound = await prisma.user.findFirst({
                where: {
                    id: id
                },
                select: {
                    socil: {
                        where: {
                            name: data.name,
                            userId: id,
                        },
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            })

            if (isFound?.socil) {
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        socil: {
                            create: {
                                name: data.name,
                                link: data.link
                            },
                        },
                    },
                })
            } else {
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        socil: {
                            update: {
                                where: {
                                    name: data.name,
                                },
                                data: {
                                    link: data.link,
                                },
                            },
                        },
                    },
                })
            }

            return res.status(200).json({ massage: 'Success' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }
    return res.status(200).json({ massage: 'hello world' })
}