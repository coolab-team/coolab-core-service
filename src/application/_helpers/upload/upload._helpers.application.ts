import { FlyTigrisSource, FlyTigrisSourcePath } from '@self/sources';
import { RandomizeUtil } from '@self/utils';

type Params = {
  buffer: Buffer;
};

export const uploadHelpersApplication = async (params: Params) => {
  const path: FlyTigrisSourcePath = `uploads/${RandomizeUtil.uuid()}.png`;
  await FlyTigrisSource.upload(params.buffer, path);

  const url = await FlyTigrisSource.getSignedUrl(path);
  const result = {
    path,
    url,
  };
  return result;
};
