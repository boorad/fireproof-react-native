import { polyfillGlobal } from './PolyfillFunctions';
import { Buffer } from '@craftzdog/react-native-buffer';
import RNQC from 'react-native-quick-crypto';
import RNFE from 'react-native-fast-encoder';
import { Event } from 'event-target-shim';
import {WritableStream} from 'web-streams-polyfill';
import 'react-native-url-polyfill/auto';

// React-Native polyfills for Fireproof
const log = (polyfill: string) => {
  console.info(`@fireproof/react-native polyfill: ${polyfill}`);
};

export const polyfills = () => {
  // buffer
  polyfillGlobal('buffer', () => Buffer);
  log('buffer');

  // crypto
  polyfillGlobal('crypto', () => RNQC);
  log('crypto');

  // encoding
  polyfillGlobal('TextEncoder', () => RNFE);
  polyfillGlobal('TextDecoder', () => RNFE);
  log('encoding');

  // events
  polyfillGlobal('Event', () => Event);
  log('event');

  // stream
  polyfillGlobal('WritableStream', () => WritableStream);
  if (WritableStream) {
    log('writable-stream');
  }
};
