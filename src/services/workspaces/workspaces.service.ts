import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

class WorkspacesService {
  public async copyPicture(sourcePath: string) {
    const path = this.buildPicturePath();
    const result = await FlyTigrisSource.copy({
      destinationPath: path,
      sourcePath,
    });
    return result;
  }

  private buildPicturePath() {
    const id = RandomizeUtil.uuid();
    const path: FlyTigrisSourcePath = `workspace-pictures/${id}.png`;
    return path;
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
