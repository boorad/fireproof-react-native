import {
  bs,
  ensureLogger,
  Falsy,
  LoggerOpts
} from '@fireproof/core';
import { format, parse, ToString } from '@ipld/dag-json';
import { MMKV } from 'react-native-mmkv';

const buildURL = (type: string, name: string, opts: bs.StoreOpts): URL => {
  const url = new URL(`mmkv+fp://${name}`);
  url.searchParams.set("type", type);
  if (opts.isIndex) {
    url.searchParams.set("index", String(opts.isIndex));
  }
  return url;
};

export const ReactNativeStoreFactory = (sopts: bs.StoreOpts & LoggerOpts = {}): bs.StoreFactory => ({
  makeDataStore: async (loader: bs.Loadable): Promise<bs.DataStore> => {
    return new DataStore(loader.name, buildURL("data", loader.name, sopts), sopts);
  },
  makeMetaStore: async (loader: bs.Loadable): Promise<bs.MetaStore> => {
    return new MetaStore(loader.name, buildURL("meta", loader.name, sopts), sopts);
  },
  makeRemoteWAL: async (loader: bs.Loadable): Promise<bs.RemoteWAL> => {
    return new RemoteWAL(loader, buildURL("wal", loader.name, sopts), sopts);
  },
});

class DataStore extends bs.DataStore {
  store: MMKV;

  constructor(name: string, url: URL, logger: LoggerOpts) {
    super(name, url, ensureLogger(logger, "ReactNativeDataStore", { name, url }));
  }

  async start(): Promise<void> {
    if (!this.store) {
      this.store = new MMKV({
        id: `fp.${this.STORAGE_VERSION}.${this.name}`,
      });
    }
  }

  async load(cid: bs.AnyLink): Promise<bs.AnyBlock> {
    const bytes = this.store.getBuffer(cid.toString());
    if (!bytes) throw new Error(`missing db block ${cid.toString()}`);
    return { cid, bytes };
  }

  async save(car: bs.AnyBlock): Promise<void> {
      this.store.set(car.cid.toString(), car.bytes);
  }

  async remove(cid: bs.AnyLink): Promise<void> {
      this.store.delete(cid.toString());
  }

  async close(): Promise<void> {
    // no-op
  }

  async destroy(): Promise<void> {
    this.store.clearAll();
  }
}

export class RemoteWAL extends bs.RemoteWAL {
  store: MMKV;

  constructor(loader: bs.Loadable, url: URL, logger: LoggerOpts) {
    super(loader, url, ensureLogger(logger, "ReactNativeRemoteWAL", { name: loader.name, url }));
  }

  async start(): Promise<void> {
    if (!this.store) {
      this.store = new MMKV({
        id: `fp.wal`,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async _load(branch = 'main'): Promise<bs.WALState | Falsy> {
    const doc = this.store.getString(this.headerKey(branch));
    if (!doc) return null;
    return parse<bs.WALState>(doc);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async _save(state: bs.WALState, branch = 'main'): Promise<void> {
    const encoded: ToString<bs.WALState> = format(state);
    this.store.set(this.headerKey(branch), encoded);
  }

  async _close(): Promise<void> {
    // no-op
  }

  async _destroy(): Promise<void> {
    this.store.clearAll();
  }

  headerKey(branch: string) {
    // remove 'public' on next storage version bump
    return `fp.wal.${this.loader.name}.${branch}`;
  }

}

export class MetaStore extends bs.MetaStore {
  store: MMKV;

  constructor(name: string, url: URL, logger: LoggerOpts) {
    super(name, url, ensureLogger(logger, "ReactNativeMetaStore", { name, url }));
  }

  async start(): Promise<void> {
    if (!this.store) {
      this.store = new MMKV({
        id: `fp.${this.STORAGE_VERSION}.meta`,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async load(branch: string = 'main'): Promise<bs.DbMeta[] | Falsy> {
    const doc = this.store.getString(this.headerKey(branch));
    if (!doc) return null;
    // TODO: react native wrt below?
    // browser assumes a single writer process
    // to support concurrent updates to the same database across multiple tabs
    // we need to implement the same kind of mvcc.crdt solution as in store-fs and connect-s3
    return [this.parseHeader(doc)];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async save(meta: bs.DbMeta, branch: string = 'main'): Promise<bs.DbMeta[] | Falsy> {
    const headerKey = this.headerKey(branch);
    const bytes = this.makeHeader(meta);
    this.store.set(headerKey, bytes);
    return null;
  }

  async close(): Promise<void> {
    // no-op
  }

  async destroy(): Promise<void> {
    this.store.clearAll();
  }

  headerKey(branch: string) {
    return `fp.${this.STORAGE_VERSION}.meta.${this.name}.${branch}`;
  }
}
