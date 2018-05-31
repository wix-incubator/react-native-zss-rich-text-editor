import React from 'react';
import { WebView } from 'react-native';

const patchPostMessageFunction = () => {
  var originalPostMessage 
	= window.postMessage;
  var patchedPostMessage = function(message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };

  patchedPostMessage.toString = () => {
    return String(Object.hasOwnProperty).replace(
      'hasOwnProperty',
      'postMessage'
    );
  };
  window.postMessage = patchedPostMessage;
};

const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';

export default class MessageWebView extends React.Component {
  constructor(props) {
    super(props);
    this.postMessage = this.postMessage.bind(this);
  }
  postMessage(action) {
    this.WebView.postMessage(action);
  }
  render() {
    const { source, onMessage, injectedJavaScript, ...props } = this.props;
    return (
      <WebView
        {...props}
        javaScriptEnabled
        injectedJavaScript={`${patchPostMessageJsCode} ${injectedJavaScript}`}
        source={source}
        ref={x => {
          this.WebView = x;
        }}
        onMessage={e => onMessage(e.nativeEvent.data)}
      />
    );
  }
}
