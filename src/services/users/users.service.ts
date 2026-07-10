import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

class UsersService {

  public async copyPicture(sourcePath: string) {
    const path = this.buildPicturePath();

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

  private buildPicturePath() {
    const id = RandomizeUtil.uuid();
    const path: FlyTigrisSourcePath = `user-pictures/${id}.png`;
    return path;
  }

}

const service = new UsersService();

export { service as UsersService };
