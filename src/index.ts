import {
  type ConfigOpts,
  type Database,
  ensureLogger,
  FireproofCtx,
  useDocument,
  useFireproof as useFireproofReact,
  useLiveQuery,
} from 'use-fireproof';
import { polyfills } from './polyfills';
import { registerMMKVStore } from './store-mmkv';

polyfills();
ensureLogger({}, "fireproof-react-native").SetDebug("useFireproof", "Index");
registerMMKVStore();

// override with a new 'useFireproof' for React Native
const useFireproof = (name?: string | Database | undefined, config?: ConfigOpts | undefined) => {
  return useFireproofReact(name, {
    ...config,
    crypto: config?.crypto, // || rnCrypto,
    store: {
      ...config?.store,
      stores: {
        ...config?.store?.stores,
      },
    },
  });
};

export { FireproofCtx, useDocument, useFireproof, useLiveQuery, polyfills };