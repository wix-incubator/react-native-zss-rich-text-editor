import React, {Component, PropTypes} from 'react';
import WebViewBridge from 'react-native-webview-bridge-updated';
import {InjectedMessageHandler} from './WebviewMessageHandler';
import {actions} from './const';
import * as consts from './const';

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;

export default class RichTextEditor extends Component {
  static propTypes = {
    initialHTML: PropTypes.string
  };

  constructor(props) {
    super(props);
    this._sendAction = this._sendAction.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.setHTML(this.props.initialHTML);
    }, 1000);
  }

  onBridgeMessage(message){
    // handle other callbacks
    const json = JSON.parse(message);
    if (json && json.type && json.type === consts.HTML_RESPONSE) {
      if (this.resolve) {
        this.resolve(json.data);
        this.resolve = undefined;
        this.reject = undefined;
        if (this.pendingHtml) {
          clearTimeout(this.pendingHtml);
          this.pendingHtml = undefined;
        }
      }
    }
  }

  onShouldStartLoadRequest(event) {
    console.log('RichTextEditor', 'should start load request event: ', event);
    return (event.url.indexOf("editor.html") != -1);
  }

  render() {
    return (
      <WebViewBridge
        {...this.props}
        hideKeyboardAccessoryView={true}
        ref={(r) => {this.webviewBridge = r}}
        onBridgeMessage={(message) => this.onBridgeMessage(message)}
        onShouldStartLoadWithRequest={(event) => this.onShouldStartLoadRequest(event)}
        source={require('./editor.html')}
        injectedJavaScript={injectScript}
      />
    );
  }

  _sendAction(action, data) {
    this.webviewBridge.sendToBridge(JSON.stringify({type: action, data}));
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  setHTML(html) {
    this._sendAction(actions.setHtml, html);
  }

  blurEditor() {
    this._sendAction(actions.blurEditor);
  }

  setBold() {
    this._sendAction(actions.setBold);
  }

  setItalic() {
    this._sendAction(actions.setItalic);
  }

  setUnderline() {
    this._sendAction(actions.setUnderline);
  }

  heading1() {
    this._sendAction(actions.heading1);
  }

  heading2() {
    this._sendAction(actions.heading2);
  }

  heading3() {
    this._sendAction(actions.heading3);
  }

  heading4() {
    this._sendAction(actions.heading4);
  }

  heading5() {
    this._sendAction(actions.heading5);
  }

  heading6() {
    this._sendAction(actions.heading6);
  }

  setParagraph() {
    this._sendAction(actions.setParagraph);
  }

  removeFormat() {
    this._sendAction(actions.removeFormat);
  }

  alignLeft() {
    this._sendAction(actions.alignLeft);
  }

  alignCenter() {
    this._sendAction(actions.alignCenter);
  }

  alignRight() {
    this._sendAction(actions.alignRight);
  }

  alignFull() {
    this._sendAction(actions.alignFull);
  }

  insertBulletsList() {
    this._sendAction(actions.insertBulletsList);
  }

  insertOrderedList() {
    this._sendAction(actions.insertOrderedList);
  }

  setSubscript() {
    this._sendAction(actions.setSubscript);
  }

  setSuperscript() {
    this._sendAction(actions.setSuperscript);
  }

  setStrikethrough() {
    this._sendAction(actions.setStrikethrough);
  }

  setHR() {
    this._sendAction(actions.setHR);
  }

  setIndent() {
    this._sendAction(actions.setIndent);
  }

  setOutdent() {
    this._sendAction(actions.setOutdent);
  }

  setPlaceholder() {
    this._sendAction(actions.setPlaceholder);
  }

  async getHtml() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this._sendAction(actions.getHtml);

      this.pendingHtml = setTimeout(() => {
        if (this.reject) {
          this.reject('timeout')
        }
      }, 5000);
    });
  }

}