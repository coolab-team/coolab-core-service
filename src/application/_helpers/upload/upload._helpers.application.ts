import { PlatformEncryption } from '@self/encryptions';
import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

type Params = {
  buffer: Buffer;
  userId: string;
};

export const uploadHelpersApplication = async (params: Params) => {
  const path: FlyTigrisSourcePath = `uploads/${RandomizeUtil.uuid()}.png`;
  await FlyTigrisSource.upload(params.buffer, path);

  const encryptedPath = PlatformEncryption.encryptUploadPath({
    path,
    userId: params.userId,
  });

  const url = await FlyTigrisSource.getSignedUrl(path);

  const result = {
    path: encryptedPath,
    url,
  };

  return result;
};
