import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

const picturePrefix = 'data:image/png;base64,';

class WorkspacesService {
  public async uploadPicture(buffer: Buffer) {
    const path: FlyTigrisSourcePath = `workspace-pictures/${RandomizeUtil.uuid()}.png`;
    await FlyTigrisSource.upload(buffer, path);

    return path;
  }

  public uploadPictureBase64(base64: string) {
    const buffer = Buffer.from(base64.replace(picturePrefix, ''), 'base64');
    const result = this.uploadPicture(buffer);
    return result;
  }

  public deletePicture(path: string) {
    const result = FlyTigrisSource.delete(path);
    return result;
  }

  public async ensurePictureUrl<T extends { picture: string | null }>(workspace: T) {
    const mapped = {
      ...workspace,
      picture: workspace.picture
        ? await FlyTigrisSource.getSignedUrl(workspace.picture)
        : null,
    };

    return mapped;
  }

  public ensurePicturesUrl<T extends { picture: string | null }>(workspaces: Array<T>) {
    const mapped = Promise.all(workspaces.map(workspace => this.ensurePictureUrl(workspace)));
    return mapped;
  }
}

const service = new WorkspacesService();

export { service as WorkspacesService };
