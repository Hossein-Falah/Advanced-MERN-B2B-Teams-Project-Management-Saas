import { extname } from "path";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, ServiceUnavailableException } from "../../common/errors/app-error";
import { MESSAGES } from "../../common/constants/message.constant";

interface S3ServiceConfig {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    endpoint: string;
    bucket: string;
}

export class S3Service {
    private client: S3Client;
    private bucket: string;

    constructor(config: S3ServiceConfig) {
        this.bucket = config.bucket;

        this.client = new S3Client({
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            region: config.region,
            endpoint: `https://${config.endpoint}`
        });
    }

    private handleError(error: any): never {
        console.log(error);
        
        if (error.code === "ENOTFOUND" || error.name === "TimeoutError") {
            throw new ServiceUnavailableException(MESSAGES.UPLOAD.SERVICE_UNAVAILABLE.message);
        }

        throw new BadRequestException(MESSAGES.UPLOAD.FAILED.message);
    }

    public async upload(file: Express.Multer.File, folderName: string): Promise<string> {
        try {
            const ext = extname(file.originalname);
            const key = `${folderName}/${randomUUID()}${ext}`;

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read"
            });

            await this.client.send(command);
            return key;

        } catch (error) {
            this.handleError(error);
        }
    }

    public async delete(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
            });

            await this.client.send(command);
        } catch (error) {
            this.handleError(error);
        }
    }
}
