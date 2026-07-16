import { PlatformSocketEvents } from '@self/events';
import { RandomizeUtil } from '@self/utils';

type Result = {
  id: string;
  timestamp: number;
};

export const notifyNewPlatformVersionHelpersApplication = async (): Promise<Result> => {
  const id = RandomizeUtil.uuid();
  const timestamp = Date.now();

  await PlatformSocketEvents.emit({
    id,
    name: 'new-version-available',
    payload: {
      timestamp,
    },
  });

  const result = {
    id,
    timestamp,
  };
  return result;
};
