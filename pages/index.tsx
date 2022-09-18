import type { NextPage } from 'next'
import Head from 'next/head'
import MdEditorCom from '../components/MdEditorCom'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MdEditorCom />
    </div>
  )
}

export default Home




