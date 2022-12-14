import Compress from 'react-image-file-resizer'

const toBase64 = async (file: File, width = 600, hight = 600): Promise<string> => new Promise((resolve, reject) => {
    try {
        Compress.imageFileResizer(
            file,
            width,
            hight,
            "WEBP",
            80,
            0,
            (uri) => resolve(uri as string),
            "base64"
        );
    } catch (error) {
        reject(error)
    }
});

export default toBase64;
