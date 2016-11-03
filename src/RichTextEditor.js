import React, {Component, PropTypes} from 'react';
import WebViewBridge from 'react-native-webview-bridge-updated';
import {InjectedMessageHandler} from './WebviewMessageHandler';
import {actions, messages} from './const';
import {Modal, View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;

export default class RichTextEditor extends Component {
  static propTypes = {
    initialTitleHTML: PropTypes.string,
    initialContentHTML: PropTypes.string,
    editorInitializedCallback: PropTypes.func,
    customCSS: PropTypes.string
  };

  constructor(props) {
    super(props);
    this._sendAction = this._sendAction.bind(this);
    this.registerToolbar = this.registerToolbar.bind(this);
    this.onBridgeMessage = this.onBridgeMessage.bind(this);
    this.state = {
      listeners: [],
      showLinkDialog: false,
      linkTitle: '',
      linkUrl: ''
    };
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
          if (this.props.customCSS) {
            this.setCustomCSS(this.props.customCSS);
          }
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
        case messages.SELECTION_CHANGE:
          const items = message.data.items;
          this.state.listeners.map((listener) => listener(items));
          break
      }
    } catch(e) {
      //alert('NON JSON MESSAGE');
    }
  }

  _renderLinkModal() {
    return (
        <Modal
            animationType={"fade"}
            transparent
            visible={this.state.showLinkDialog}
            onRequestClose={() => this.setState({showLinkDialog: false})}
        >
          <View style={styles.modal}>


            <View style={styles.innerModal}>

              <Text>Title</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                    style={{height: 20}}
                    onChangeText={(text) => this.setState({linkTitle: text})}
                    value={this.state.linkTitle}
                />
              </View>

              <Text style={{marginTop: 10}}>URL</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                    style={{height: 20}}
                    onChangeText={(text) => this.setState({linkUrl: text})}
                    value={this.state.linkUrl}
                />
              </View>

              {this._renderModalButtons()}
            </View>
          </View>
        </Modal>
    );
  }

  _hideModal() {
    this.setState({
      showLinkDialog: false,
      linkTitle: '',
      linkUrl: ''
    })
  }

  _renderModalButtons() {
    return (
      <View style={{paddingTop: 10, alignSelf: 'stretch', flexDirection: 'row'}}>
        <View style={{flex: 1}}/>
        <TouchableOpacity
            onPress={() => this._hideModal()}
        >
          <Text style={[styles.button, {paddingRight: 10}]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
              this.insertLink(this.state.linkUrl, this.state.linkTitle);
              this._hideModal();
            }}
        >
          <Text style={styles.button}>
            OK
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <WebViewBridge
          style={{flex: 1}}
          {...this.props}
          hideKeyboardAccessoryView={true}
          ref={(r) => {this.webviewBridge = r}}
          onBridgeMessage={(message) => this.onBridgeMessage(message)}
          injectedJavaScript={injectScript}
          source={require('./editor.html')}
        />
        {this._renderLinkModal()}
      </View>
    );
  }

  escapeJSONString = function(string) {
    return string
      .replace(/[\\]/g, '\\\\')
      .replace(/[\"]/g, '\\\"')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t');
  };

  _sendAction(action, data) {
    let jsonString = JSON.stringify({type: action, data});
    jsonString = this.escapeJSONString(jsonString);
    this.webviewBridge.sendToBridge(jsonString);
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  showLinkDialog() {
    this.setState({
      showLinkDialog: true
    });
  }

  focusTitle() {
    this._sendAction(actions.focusTitle);
  }

  focusContent() {
    this._sendAction(actions.focusContent);
  }

  registerToolbar(listener) {
    this.setState({
      listeners: [...this.state.listeners, listener]
    });
  }

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

  insertImage(url, alt) {
    this._sendAction(actions.insertImage, {url, alt});
    this.prepareInsert(); //This must be called BEFORE insertImage. But WebViewBridge uses a stack :/
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

  setCustomCSS(css) {
    this._sendAction(actions.setCustomCSS, css);
  }

  prepareInsert() {
    this._sendAction(actions.prepareInsert);
  }

  restoreSelection() {
    this._sendAction(actions.restoreSelection);
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

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  innerModal: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignSelf: 'stretch',
    margin: 40
  },
  button: {
    fontSize: 16
  },
  inputWrapper: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomColor: '#000000',
    borderBottomWidth: 1
  }
});