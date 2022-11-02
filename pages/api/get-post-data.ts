import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../libs/prisma';
import { GetUserIdMiddleware } from '../../middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const data = req.query;
        const slug = data.slug;

        const { error, id } = GetUserIdMiddleware(req);

        if (slug && typeof slug === 'string') {
            const dataItem = await prisma.post.findFirst({
                where: {
                    slug: slug
                },
                select: {
                    id: true,
                    content: true,
                    title: true,
                    author: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                            blogName: true,
                            id: true,
                            Avter: {
                                select: {
                                    fileUrl: true
                                }
                            },
                            about: true,
                            socil: {
                                select: {
                                    name: true,
                                    link: true,
                                }
                            }
                        },
                    },
                    comments: {
                        select: {
                            createdAt: true,
                            id: true,
                            content: true,
                            authorId: true,
                            author: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    Avter: {
                                        select: {
                                            fileUrl: true
                                        },
                                    }
                                },
                            },
                        },
                    },
                    tags: {
                        select: {
                            name: true
                        },
                    },
                    category: {
                        select: {
                            name: true
                        },
                    },
                    createdAt: true,
                    backgroundImageUrl: true,
                    views: true,
                },
            });


            if (dataItem?.id && `${dataItem.views}`) { // i do the validation like this cus view count matey be zero 
                await prisma.post.update({
                    where: {
                        id: dataItem.id,
                    },
                    data: {
                        views: (Number(dataItem.views) + 1),
                    },
                })
            }


            return res.status(200).json({ dataItem, id })

        } else return res.status(400).json({ massage: "slug was not provide" })

    }

    return res.status(200).json({ name: 'John Doe' })
}
