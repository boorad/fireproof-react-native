import {
  bs,
  type ConfigOpts,
  type Database,
  FireproofCtx,
  useDocument,
  useFireproof as useFireproofReact,
  useLiveQuery,
} from 'use-fireproof';

import { registerMMKVStore } from './store-mmkv';
registerMMKVStore();

class ReactNativeCrypto implements bs.CryptoOpts {
  importKey(
    format: KeyFormat,
    keyData: JsonWebKey,
    algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm,
    extractable: boolean,
    keyUsages: ReadonlyArray<KeyUsage>
  ): Promise<CryptoKey> {
    return Promise.resolve(new CryptoKey());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  decrypt(
    algo: {
      name: string;
      iv: Uint8Array;
      tagLength: number;
    },
    key: CryptoKey,
    data: Uint8Array
  ): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encrypt(
    algo: {
      name: string;
      iv: Uint8Array;
      tagLength: number;
    },
    key: CryptoKey,
    data: Uint8Array
  ): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  digestSHA256(data: Uint8Array): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  randomBytes(size: number): Uint8Array {
    return new Uint8Array(size);
  }
}

const rnc = new ReactNativeCrypto();

// override with a new 'useFireproof' for React Native
const useFireproof = (name?: string | Database | undefined, config?: ConfigOpts | undefined) => {
  return useFireproofReact(name, {
    ...config,
    crypto: config?.crypto || rnc,
    store: {
      ...config?.store,
      stores: {
        ...config?.store?.stores,
      },
    },
  });
};

// TODO: do 'fireproof' in addition to 'useFireproof'?

export { FireproofCtx, useDocument, useFireproof, useLiveQuery };
