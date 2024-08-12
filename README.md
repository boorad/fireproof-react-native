# @fireproof/react-native

React Native bindings for Fireproof

## Installation

* Add `@fireproof/react-native` dependency. We also need to add any native module dependencies so they autolink properly.

      pnpm add @fireproof/react-native react-native-quick-crypto react-native-mmkv react-native-fast-encoder
      pnpm pods

## Development

To develop your application, run

    pnpm start

in its root directory. Then select `i` or `a` to run iOS or Android simulators respectively. You might need to build with XCode or Android Studio at first, to properly compile the native modules.

See the `example/` app for a working code sample.

## Usage
```js
import { useFireproof } from '@fireproof/react-native';
const { database, useDocument } = useFireproof('TodoDB');
```
