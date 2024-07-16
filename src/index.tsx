import {
  type ConfigOpts,
  type Database,
  FireproofCtx,
  useDocument,
  useFireproof as useFireproofReact,
  useLiveQuery,
} from 'use-fireproof';

import { registerMMKVStore } from './store-mmkv';
registerMMKVStore();

// override with a new 'useFireproof' for React Native
const useFireproof = (name?: string | Database | undefined, config?: ConfigOpts | undefined) => {
  const base = 'mmkv://fireproof';
  return useFireproofReact(name, {
    ...config,
    store: {
      stores: {
        base,
        data: base + '/data',
        meta: base + '/meta',
        remoteWAL: base + '/wal',
        // index: base + '/index',
      },
    },
  });
};

// TODO: do 'fireproof' in addition to 'useFireproof'?

export { FireproofCtx, useDocument, useFireproof, useLiveQuery };
