import crypto from 'node:crypto';

class RandomizeUtil {
  public static uuid() {
    const uuid = crypto.randomUUID();
    return uuid;
  }
}

export { RandomizeUtil };
