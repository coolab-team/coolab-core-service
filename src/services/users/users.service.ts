import crypto from 'node:crypto';

import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';

class UsersService {
  public getPicturePath(sourcePath: string) {
    const id = crypto.createHash('sha256').update(sourcePath).digest('hex');
    const path: FlyTigrisSourcePath = `user-pictures/${id}.png`;
    return path;
  }

  public async copyPicture(sourcePath: string) {
    const path = this.getPicturePath(sourcePath);
    const result = await FlyTigrisSource.copy({
      destinationPath: path,
      sourcePath,
    });
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
