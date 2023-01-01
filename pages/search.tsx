import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Post from '../components/Post'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import { generalSearch, SearchByCategory, SearchByTag } from '../api'
import { IPostProps } from '../types/post'
import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'


const Search = () => {
    const [posts, setPosts] = useState<IPostProps[] | null>(null);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tag, setTag] = useState("")
    const [category, setCategory] = useState("")

    const router = useRouter();

    useEffect(() => {
        setSearch(window.location.href.split("?search=")[1])
        setTag(window.location.href.split("?tag=")[1])
        setCategory(window.location.href.split("?category=")[1])
    }, [router])

    const handelSearch = useCallback(async () => {
        if (tag || search || category) setIsLoading(true);

        if (search) await generalSearch(search)
        .then((res) => {
            setPosts(res.data.posts);
            if (res.data.posts) setIsLoading(false)
        })

        else if (tag) await SearchByTag(tag)
        .then((res) => {
            setPosts(res.data.posts.posts);
            if (res.data.posts.posts) setIsLoading(false)
        })

        else if (category) await SearchByCategory(category)
        .then((res) => {
            setPosts(res.data.posts);
            if (res.data.posts) setIsLoading(false)
        })
    }, [category, search, tag])



    useEffect(() => {
        handelSearch();
    }, [handelSearch])

    return (
        <>
            <Head>
                <title>{search || tag || category}</title>
                <meta name="description" content={search || tag || category} />
                <meta name="keywords" content={search || tag || category} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="w-full min-h-[75vh] flex my-10 p-16 min-w-full justify-center items-center">
                {isLoading ? <CircularProgress /> : (
                    <Grid container spacing={4}>
                        {(posts && posts.length > 0) ? (
                                <Box className="gap-4 grid w-full grid-cols-1 sm:grid-cols-2 ">

                                    {posts.map((post) => (
                                        <div key={post.title} className="w-full">
                                            <Post key={post.title} post={post} />
                                        </div>
                                    ))}
                                </Box>
                            ) : (
                                <div className="w-full flex items-center justify-center">
                                    <Typography variant='h4' component='h1'> Sorry No Posts Found </Typography>
                                </div>
                            )}
                    </Grid>
                )}
            </div>
        </>
    )
}

export default Search;
