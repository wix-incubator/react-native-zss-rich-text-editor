import React, {Component, PropTypes} from 'react';
import WebViewBridge from 'react-native-webview-bridge-updated';
import {InjectedMessageHandler} from './WebviewMessageHandler';
import {actions, messages} from './const';

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;

export default class RichTextEditor extends Component {
  static propTypes = {
    initialTitleHTML: PropTypes.string,
    initialContentHTML: PropTypes.string,
    editorInitializedCallback: PropTypes.func
  };

  constructor(props) {
    super(props);
    this._sendAction = this._sendAction.bind(this);
  }

  onBridgeMessage(str){
    try {
      const message = JSON.parse(str);

      switch (message.type) {
        case messages.TITLE_HTML_RESPONSE:
          if (this.titleResolve) {
            this.titleResolve(message.data);
            this.titleResolve = undefined;
            this.titleReject = undefined;
            if (this.pendingTitleHtml) {
              clearTimeout(this.pendingTitleHtml);
              this.pendingTitleHtml = undefined;
            }
          }
          break;
        case messages.CONTENT_HTML_RESPONSE:
          if (this.contentResolve) {
            this.contentResolve(message.data);
            this.contentResolve = undefined;
            this.contentReject = undefined;
            if (this.pendingContentHtml) {
              clearTimeout(this.pendingContentHtml);
              this.pendingContentHtml = undefined;
            }
          }
          break;
        case messages.ZSS_INITIALIZED:
          this.setTitleHTML(this.props.initialTitleHTML);
          this.setContentHTML(this.props.initialContentHTML);
          this.props.editorInitializedCallback && this.props.editorInitializedCallback();
          break;
        case messages.LOG:
          console.log('FROM ZSS', message.data);
          break;
        case messages.SCROLL:
          this.webviewBridge.setNativeProps({contentOffset: {y: message.data}});
          break;
        case messages.TITLE_FOCUSED:
          this.titleFocusHandler && this.titleFocusHandler();
          break;
        case messages.CONTENT_FOCUSED:
          this.contentFocusHandler && this.contentFocusHandler();
          break;
      }
    } catch(e) {
      //alert('NON JSON MESSAGE');
    }
  }

  render() {
    return (
      <WebViewBridge
        {...this.props}
        hideKeyboardAccessoryView={true}
        ref={(r) => {this.webviewBridge = r}}
        onBridgeMessage={(message) => this.onBridgeMessage(message)}
        injectedJavaScript={injectScript}
        source={require('./editor.html')}
      />
    );
  }

  _sendAction(action, data) {
    this.webviewBridge.sendToBridge(JSON.stringify({type: action, data}));
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  setTitleHTML(html) {
    this._sendAction(actions.setTitleHtml, html);
  }

  setContentHTML(html) {
    this._sendAction(actions.setContentHtml, html);
  }

  blurTitleEditor() {
    this._sendAction(actions.blurTitleEditor);
  }

  blurContentEditor() {
    this._sendAction(actions.blurContentEditor);
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

  insertLink(url, title) {
    this._sendAction(actions.insertLink, {url, title});
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

  setTitlePlaceholder() {
    this._sendAction(actions.setTitlePlaceholder);
  }

  setContentPlaceholder() {
    this._sendAction(actions.setContentPlaceholder);
  }

  async getTitleHtml() {
    return new Promise((resolve, reject) => {
      this.titleResolve = resolve;
      this.titleReject = reject;
      this._sendAction(actions.getTitleHtml);

      this.pendingTitleHtml = setTimeout(() => {
        if (this.titleReject) {
          this.titleReject('timeout')
        }
      }, 5000);
    });
  }

  async getContentHtml() {
    return new Promise((resolve, reject) => {
      this.contentResolve = resolve;
      this.contentReject = reject;
      this._sendAction(actions.getContentHtml);

      this.pendingContentHtml = setTimeout(() => {
        if (this.contentReject) {
          this.contentReject('timeout')
        }
      }, 5000);
    });
  }

  setTitleFocusHandler(callbackHandler) {
    this.titleFocusHandler = callbackHandler;
    this._sendAction(actions.setTitleFocusHandler);
  }

  setContentFocusHandler(callbackHandler) {
    this.contentFocusHandler = callbackHandler;
    this._sendAction(actions.setContentFocusHandler);
  }
}