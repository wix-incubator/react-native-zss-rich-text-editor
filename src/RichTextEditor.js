import React, {Component, PropTypes} from 'react';
import WebViewBridge from 'react-native-webview-bridge-updated';
import {InjectedMessageHandler} from './WebviewMessageHandler';
import {actions} from './const';

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
    console.log('RichTextEditor', 'bridge message: ', message);
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

  //-------------------------------------------------------------------------------
  //--------------- Public API

  _sendAction(action, data) {
    this.webviewBridge.sendToBridge(JSON.stringify({type: action, data}));
  }

  setHTML(html) {
    this._sendAction(actions.setHtml, html);
  }

  blurEditor() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.blurEditor();`);
  }

  setBold() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setBold();`);
  }

  setItalic() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setItalic();`);
  }

  setUnderline() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setUnderline();`);
  }

  heading1() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h1');`);
  }

  heading2() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h2');`);
  }

  heading3() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h3');`);
  }

  heading4() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h4');`);
  }

  heading5() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h5');`);
  }

  heading6() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHeading('h6');`);
  }

  setParagraph() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setParagraph();`);
  }

  removeFormat() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.removeFormating();`);
  }

  alignLeft() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setJustifyLeft();`);
  }

  alignCenter() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setJustifyCenter();`);
  }

  alignRight() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setJustifyRight();`);
  }

  alignFull() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setJustifyFull();`);
  }

  insertBulletsList() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setUnorderedList();`);
  }

  insertOrderedList() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setOrderedList();`);
  }

  setSubscript() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setSubscript();`);
  }
  setSuperscript() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setSuperscript();`);
  }
  setStrikethrough() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setStrikeThrough();`);
  }
  setHR() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setHorizontalRule();`);
  }
  setIndent() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setIndent();`);
  }
  setOutdent() {
    this.refs.webviewbridge.sendToBridge(`zss_editor.setOutdent();`);
  }
}