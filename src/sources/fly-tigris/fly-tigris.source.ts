import { Readable } from 'node:stream';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@self/consts';
import { BadRequestException } from '@self/exceptions';

type EphemeralFolder = 'uploads';
type Folder = EphemeralFolder | 'user-pictures' | 'workspace-pictures';
type Extension = 'png';
type UUID = string;

export type Path = `${Folder}/${UUID}.${Extension}`;

const signedUrlExpiresIn = 60 * 60 * 24 * 7;

class FlyTigrisSource {
  public client: S3Client;

  private readonly bucket = env.BUCKET_NAME;
  private readonly ephemeralBucket = env.EPHEMERAL_BUCKET_NAME;

  constructor() {
    this.client = new S3Client();
  }

  private getBucket(path: string) {
    const isEphemeral = path.startsWith('uploads/');
    const bucket = isEphemeral ? this.ephemeralBucket : this.bucket;

    return bucket;
  }

  private getContentType(path: Path) {
    const extension = path.split('.').pop();
    const contentTypeByExtension: Record<Extension, string> = {
      png: 'image/png',
    };

    if(!extension || !(extension in contentTypeByExtension)) {
      return 'application/octet-stream';
    }

    const contentType = contentTypeByExtension[extension as Extension];
    return contentType;
  }

  public async upload(buffer: Buffer, path: Path) {
    const fileStream = Readable.from(buffer);
    const bucket = this.getBucket(path);

    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Body: fileStream,
          Bucket: bucket,
          ContentType: this.getContentType(path),
          Key: path,
        },
      });

      const result = await upload.done();
      return result;
    } catch (error) {
      fileStream.destroy();
      throw error;
    }
  }

  public async delete(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucket(path),
      Key: path,
    });

    await this.client.send(command);
  }

  public async copy(params: {
    destinationPath: Path;
    sourcePath: string;
  }) {
    const sourceBucket = this.getBucket(params.sourcePath);
    const destinationBucket = this.getBucket(params.destinationPath);
    const copySource = `${sourceBucket}/${encodeURIComponent(params.sourcePath)}`;
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      ContentType: this.getContentType(params.destinationPath),
      CopySource: copySource,
      Key: params.destinationPath,
      MetadataDirective: 'REPLACE',
    });

    await this.client.send(command);

    const result = params.destinationPath;
    return result;
  }

  public async getSignedUrl(path: string) {
    if(path.startsWith('https://')) {
      throw new BadRequestException({
        feedback: {
          enUs: 'Path must not be a URL.',
          esEs: 'La ruta no debe ser una URL.',
          ptBr: 'O caminho não deve ser uma URL.',
        },
        message: 'Path must not be a URL.',
      });
    }

    const command = new GetObjectCommand({
      Bucket: this.getBucket(path),
      Key: path,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: signedUrlExpiresIn,
    });
    return url;
  }
}

const source = new FlyTigrisSource();

export { source as FlyTigrisSource };
