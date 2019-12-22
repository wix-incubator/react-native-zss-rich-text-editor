# React Native Rich Text Editor with react-native-webview

> Visit [original repo](https://github.com/wix/react-native-zss-rich-text-editor) first

This resolves [#171](https://github.com/wix/react-native-zss-rich-text-editor/issues/171), [#174](https://github.com/wix/react-native-zss-rich-text-editor/issues/174), and [#178](https://github.com/wix/react-native-zss-rich-text-editor/issues/178) 

## Inspirations

For now, the original library has problems of using two deprecated modules, ListView and react-native-webview-bridge-updated. ListView problem is solved by [Ankit-96](https://github.com/Ankit-96) 's [PR](https://github.com/wix/react-native-zss-rich-text-editor/pull/179). So I focused on removing react-native-webview-bridge-updated and making use of react-native-webview. 

## What I did

* Did just like what [Ankit-96](https://github.com/Ankit-96) did; replaced ListView with FlatList
* Replaced react-native-webview-bridge-updated with react-native-webview
  * Instead of injecting `MessageHandler` into webpage(WebViewBridge) and sending message through `sendToBridge`, I directly inject `zss_editor`'s function calls through `injectJavaScript`. To achieve that, I fixed `WebViewMessageHandler.js` to be mapper function, translating functions of `RichTextEditor` to those of `zss_editor`.
  * In `editor.html`, replace `WebViewBridge.send` with `ReactNativeWebView.postMessage`
* Added `./newExample`. You should `$ cd newExample; yarn; cd ios; pod install; cd ..; react-native run-ios;`.

## How to use it

* `$ yarn add https://github.com/jb-/react-native-zss-rich-text-editor`
* `$ yarn add react-native-webview` (I'm not sure why I have to do this)
* `$ cd ios; pod install;`

## Limitations

* Tested on RN 0.61.5, iOS only.

* Since I worked it for my project only, I did not test it on other versions or on Android platform. If any of you are familiar with both Android and iOS natives, please refer to my project and collaborate.

## References

* https://github.com/react-native-community/react-native-webview/blob/master/docs/Guide.md#communicating-between-js-and-native
