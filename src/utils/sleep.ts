export const sleep = async (time = 5 * 1000) => new Promise<void>((resolve) => setTimeout(resolve, time));
