import { extname } from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestException, ServiceUnavailableException } from "../common/errors/app-error";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION!,
    endpoint: `https://${process.env.AWS_ENDPOINT!}`,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;

export const uploadFileToS3 = async (file: Express.Multer.File, folderName: string) => {
    try {
        const ext = extname(file.originalname); // .png .jpg            
        const key = `${folderName}/${randomUUID()}${ext}`;   
    
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        });
    
        await s3Client.send(command);

        return key;
    } catch (error: any) {
        console.log(error);
        
        if (error.code === "ENOTFOUND" || error.name === "TimeoutError") {
            throw new ServiceUnavailableException("این سرویس فعلا در دسترس نیست لطفا بعدا تلاش کنید");
        }

        throw new BadRequestException("خطای در اپلود رخ داده");
    }
};

export const deleteFile = async (key: string): Promise<void> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
    } catch (error: any) {            
        if (error.code === "ENOTFOUND" || error.name === "TimeoutError") {
            throw new ServiceUnavailableException("این سرویس فعلا در دسترس نیست لطفا بعدا تلاش کنید");
        }

        throw new BadRequestException("خطای در اپلود رخ داده");
    }
}
