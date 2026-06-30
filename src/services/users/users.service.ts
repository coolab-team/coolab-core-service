import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

const picturePrefix = 'data:image/png;base64,';

class UsersService {
  public async uploadPicture(buffer: Buffer) {
    const path: FlyTigrisSourcePath = `user-pictures/${RandomizeUtil.uuid()}.png`;
    await FlyTigrisSource.upload(buffer, path);

    return path;
  }

  public async uploadPictureBase64(base64: string) {
    const buffer = Buffer.from(base64.replace(picturePrefix, ''), 'base64');
    const result = await this.uploadPicture(buffer);
    return result;
  }

  public deletePicture(path: string) {
    const result = FlyTigrisSource.delete(path);
    return result;
  }

  public async ensurePictureUrl<T extends { picture: string | null }>(user: T) {
    const mapped = {
      ...user,
      picture: user.picture
        ? await FlyTigrisSource.getSignedUrl(user.picture)
        : null,
    };

    return mapped;
  }

}

const service = new UsersService();

export { service as UsersService };
