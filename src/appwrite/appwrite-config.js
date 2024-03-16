import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('65f04c3252981924741b');

export const account = new Account(client);
export const databases = new Databases(client, '65f058795179029c97a7');
// export { ID } from 'appwrite';
