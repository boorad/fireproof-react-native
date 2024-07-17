import {
  bs,
  ensureLogger,
  exception2Result,
  exceptionWrapper,
  getKey,
  Logger,
  Result
} from 'use-fireproof';
import { MMKV } from 'react-native-mmkv';
import { MMKVDB_VERSION } from './store-mmkv-version';

export const registerMMKVStore = () => {
  bs.registerStoreProtocol({
    protocol: 'mmkv',
    overrideBaseURL: "mmkv://fireproof",
    data: async (logger: Logger) => {
      return new MMKVDataGateway(logger);
    },
    meta: async (logger: Logger) => {
      return new MMKVMetaGateway(logger);
    },
    wal: async (logger: Logger) => {
      return new MMKVWalGateway(logger);
    },
    test: async (logger: Logger) => {
      return {} as unknown as bs.TestStore;
    },
  })
}

function ensureVersion(url: URL): URL {
  const ret = new URL(url.toString());
  ret.searchParams.set("version", url.searchParams.get("version") || MMKVDB_VERSION);
  return ret;
}

export const getMMKVDBName = (iurl: URL): string => {
  const url = ensureVersion(iurl);
  return url.searchParams.get("name") || "main";
}

export abstract class MMKVGateway implements bs.Gateway {
  store?: MMKV;

  constructor(readonly logger: Logger) {}

  abstract buildUrl(baseUrl: URL, key: string): Promise<Result<URL>>;

  async start(baseUrl: URL): Promise<bs.VoidResult> {
    return exception2Result(async () => {
      if (!this.store) {
        this.store = new MMKV({
          id: getMMKVDBName(baseUrl),
        });
        this.logger.Debug().Url(baseUrl).Msg("starting");
      }
      baseUrl.searchParams.set("version", baseUrl.searchParams.get("version") || "v0.1-mmkv");
      return Result.Ok(undefined);
    });
  }

  async close(baseUrl: URL): Promise<bs.VoidResult> {
    // no-op
    return Result.Ok(undefined);
  }

  async destroy(baseUrl: URL): Promise<bs.VoidResult> {
    this.store?.clearAll();
    this.logger.Debug().Url(baseUrl).Msg("destroying");
    return Result.Ok(undefined);
  }

  put(url: URL, body: Uint8Array): Promise<bs.VoidResult> {
    return exception2Result(async () => {
      const cid = getKey(url, this.logger);
      this.logger.Debug().Url(url).Str("cid", cid).Msg("getting");
      this.store?.set(cid, body);
      return Result.Ok(undefined);
    });
  }

  get(url: URL): Promise<Result<Uint8Array, Error | bs.NotFoundError>> {
    return exceptionWrapper(async () => {
      const cid = getKey(url, this.logger);
      this.logger.Debug().Url(url).Str("cid", cid).Msg("putting");
      const bytes = this.store?.getBuffer(cid);
      if (!bytes) {
        return Result.Err(new bs.NotFoundError(`missing db block ${cid}`));
      }
      return Result.Ok(bytes);
    });
  }

  delete(url: URL): Promise<bs.VoidResult> {
    return exception2Result(async () => {
      const cid = getKey(url, this.logger);
      this.logger.Debug().Url(url).Str("cid", cid).Msg("deleting");
      this.store?.delete(cid);
      return Result.Ok(undefined);
    });
  }

}

export class MMKVDataGateway extends MMKVGateway {
  constructor(logger: Logger) {
    super(ensureLogger(logger, "MMKVDataStore"));
  }

  async buildUrl(baseUrl: URL, key: string): Promise<Result<URL>> {
    const url = new URL(baseUrl.toString());
    url.searchParams.set("key", key);
    return Result.Ok(url);
  }
}

export class MMKVMetaGateway extends MMKVGateway {
  constructor(logger: Logger) {
    super(ensureLogger(logger, "MMKVMetaStore"));
  }

  async buildUrl(baseUrl: URL, key: string): Promise<Result<URL>> {
    const url = new URL(baseUrl.toString());
    url.searchParams.set("key", key);
    return Result.Ok(url);
  }
}

export class MMKVWalGateway extends MMKVGateway {
  readonly branches = new Set<string>();

  constructor(logger: Logger) {
    super(ensureLogger(logger, "MMKVRemoteWAL"));
  }

  async buildUrl(baseUrl: URL, key: string): Promise<Result<URL>> {
    const url = new URL(baseUrl.toString());
    this.branches.add(key);
    url.searchParams.set("key", key);
    return Result.Ok(url);
  }
}
