import { IMemoryDb } from 'pg-mem';

declare global {
  var testDb: IMemoryDb | undefined;
}