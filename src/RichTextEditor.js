import React, { Component } from "react";
import PropTypes from "prop-types";
import WebViewBridge from "react-native-webview-bridge";
import { InjectedMessageHandler } from "./WebviewMessageHandler";
import { actions, messages } from "./const";
import { Dimensions, Keyboard, Platform, View } from "react-native";

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;

const PlatformIOS = Platform.OS === 'ios';

export default class RichTextEditor extends Component {
  static propTypes = {
    initialTitleHTML: PropTypes.string,
    initialContentHTML: PropTypes.string,
    titlePlaceholder: PropTypes.string,
    contentPlaceholder: PropTypes.string,
    editorInitializedCallback: PropTypes.func,
    customCSS: PropTypes.string,
    hiddenTitle: PropTypes.bool,
    enableOnChange: PropTypes.bool,
    footerHeight: PropTypes.number,
    contentInset: PropTypes.object
  };

  static defaultProps = {
    contentInset: {},
    style: {}
  };

  constructor(props) {
    super(props);
    this._sendAction = this._sendAction.bind(this);
    this.registerToolbar = this.registerToolbar.bind(this);
    this.onBridgeMessage = this.onBridgeMessage.bind(this);
    this._onKeyboardWillShow = this._onKeyboardWillShow.bind(this);
    this._onKeyboardWillHide = this._onKeyboardWillHide.bind(this);
    this.state = {
      selectionChangeListeners: [],
      onChange: [],
      linkInitialUrl: '',
      linkTitle: '',
      linkUrl: '',
      keyboardHeight: 0
    };
    this._selectedTextChangeListeners = [];
    this.inputFieldResolves = {};
    this.inputFieldRejects = {};
    this.inputFieldTimers = {};
  }

  componentDidMount() {
    if(PlatformIOS) {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardWillShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardWillHide', this._onKeyboardWillHide)
      ];
    } else {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardDidHide', this._onKeyboardWillHide)
      ];
    }
  }

  componentWillUnmount() {
    if (this.keyboardEventListeners) {
      this.keyboardEventListeners.forEach((eventListener) => eventListener.remove());
    }
  }

  _onKeyboardWillShow(event) {
    console.log('!!!!', event);
    const newKeyboardHeight = event.endCoordinates.height;
    if (this.state.keyboardHeight === newKeyboardHeight) {
      return;
    }
    if (newKeyboardHeight) {
      this.setEditorAvailableHeightBasedOnKeyboardHeight(newKeyboardHeight);
    }
    this.setState({keyboardHeight: newKeyboardHeight});
  }

  _onKeyboardWillHide(event) {
    this.setState({keyboardHeight: 0});
  }

  setEditorAvailableHeightBasedOnKeyboardHeight(keyboardHeight) {
    const {top = 0, bottom = 0} = this.props.contentInset;
    const {marginTop = 0, marginBottom = 0} = this.props.style;
    const spacing = marginTop + marginBottom + top + bottom;
    const zibi = Dimensions.get('window').height- spacing -keyboardHeight

    const editorAvailableHeight = Dimensions.get('window').height - keyboardHeight*2 - spacing;
    console.log('xzx original', editorAvailableHeight)
    console.log('xzx elad ', zibi)
    // this.setEditorHeight(zibi);
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
        case messages.TITLE_TEXT_RESPONSE:
          if (this.titleTextResolve) {
            this.titleTextResolve(message.data);
            this.titleTextResolve = undefined;
            this.titleTextReject = undefined;
            if (this.pendingTitleText) {
              clearTimeout(this.pendingTitleText);
              this.pendingTitleText = undefined;
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
        case messages.INPUT_FIELD_TEXT_RESPONSE:
          let key = message.key;
          if (this.inputFieldResolves[key]) {
            this.inputFieldResolves[key](message.data);
            this.inputFieldRejects[key] = undefined;
            if (this.inputFieldTimers[key]) {
              clearTimeout(this.inputFieldTimers[key]);
              this.inputFieldTimers[key] = undefined;
            }
          }
          break;
        case messages.SELECTED_TEXT_RESPONSE:
          if (this.selectedTextResolve) {
            this.selectedTextResolve(message.data);
            this.selectedTextResolve = undefined;
            this.selectedTextReject = undefined;
            if (this.pendingSelectedText) {
              clearTimeout(this.pendingSelectedText);
              this.pendingSelectedText = undefined;
            }
          }
          break;
        case messages.ZSS_INITIALIZED:
          if (this.props.customCSS) {
            this.setCustomCSS(this.props.customCSS);
          }
          this.setTitlePlaceholder(this.props.titlePlaceholder);
          this.setInputFields(this.props.inputFields);
          this.setContentPlaceholder(this.props.contentPlaceholder);
          this.setTitleHTML(this.props.initialTitleHTML);
          this.setContentHTML(this.props.initialContentHTML);

          this.props.hiddenTitle && this.hideTitle();
          this.props.enableOnChange && this.enableOnChange();

          this.props.editorInitializedCallback && this.props.editorInitializedCallback();

          break;
        case messages.TOP_REACHED:
          this.thresholdHandler && this.thresholdHandler({top:true})
          break;
        case messages.BOTTOM_REACHED:
          this.thresholdHandler && this.thresholdHandler({bottom:true})
          break;
        case messages.LINK_TOUCHED:
          this.prepareInsert();
          const {title, url} = message.data;
          this.showLinkDialog(title, url);
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
        case messages.INPUT_FIELD_FOCUSED:
          let specialKey = message.data;
          let focusFieldName = 'inputFieldFocusHandler_' + specialKey;
          this[focusFieldName] && this[focusFieldName]();
          break;
        case messages.SELECTION_CHANGE: {
          const items = message.data.items;
          this.state.selectionChangeListeners.map((listener) => {
            listener(items);
          });
          break;
        }
        case messages.CONTENT_CHANGE: {
          const content = message.data.content;
          this.state.onChange.map((listener) => listener(content));
          break;
        }
        case messages.SELECTED_TEXT_CHANGED: {

          const selectedText = message.data;

          this._selectedTextChangeListeners.forEach((listener) => {

            listener(selectedText);
          });
          break;
        }
        case messages.ADD_RECIPIENT:{
          this.props.addRecipient && this.props.addRecipient();
          break;
        }
        case messages.CANCEL_SCHEDULE_SEND:{
          this.props.cancelScheduleSend && this.props.cancelScheduleSend();
          break;
        }

        case messages.OPEN_SCHEDULE_MENU:{
          this.props.openScheduleEmail && this.props.openScheduleEmail();
          break;
        }
      }
    } catch(e) {
      //alert('NON JSON MESSAGE');
    }
  }

  render() {
    //in release build, external html files in Android can't be required, so they must be placed in the assets folder and accessed via uri
    const pageSource = PlatformIOS ? (this.props.source ? this.props.source:require('./editor.html')) : { uri: 'file:///android_asset/editor.html' };
    return (
        <View style={{flex: 1}}>
          <WebViewBridge
              {...this.props}
              hideKeyboardAccessoryView={true}
              keyboardDisplayRequiresUserAction={false}
              ref={(r) => {this.webviewBridge = r}}
              onBridgeMessage={(message) => this.onBridgeMessage(message)}
              injectedJavaScript={injectScript}
              source={pageSource}
              onLoad={() => this.init()}
          />
        </View>
    );
  }

  escapeJSONString = function(string) {
    return string
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\’]/g, '\'')
        .replace(/[\']/g, '\\\'')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
  };

  _sendAction(action, data) {

    let jsonString = JSON.stringify({type: action, data});
    let test = this.btoa(unescape(encodeURIComponent(jsonString)));
    this.webviewBridge.sendToBridge(test);
  }

  btoa(input= '') {
    const CHARS =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let map;
    let i = 0;
    let block = 0;
    let output = '';
    for (
        block = 0, i = 0, map = CHARS;
        input.charAt(i | 0) || ((map = '='), i % 1);
        output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      const charCode = input.charCodeAt((i += 3 / 4));
      if (charCode > 0xff) {
        throw new Error(
            "'RNFirebase.utils.btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
        );
      }
      block = (block << 8) | charCode;
    }
    return output;
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  showLinkDialog(optionalTitle = "", optionalUrl = "") {
    if (this.props.showModal) {
      this.props.showModal(
          optionalTitle,
          optionalUrl,
          (url, title) => {
            this.insertLink(url, title);
          }
      );
    }
  }

  focusTitle() {
    this._sendAction(actions.focusTitle);
  }

  focusContent() {
    this._sendAction(actions.focusContent);
  }

  registerToolbar(listener) {
    this.setState({
      selectionChangeListeners: [...this.state.selectionChangeListeners, listener]
    });
  }

  enableOnChange() {
    this._sendAction(actions.enableOnChange);
  }

  registerContentChangeListener(listener) {
    this.setState({
      onChange: [...this.state.onChange, listener]
    });
  }

  setTitleHTML(html) {
    this._sendAction(actions.setTitleHtml, html);
  }
  hideTitle() {
    this._sendAction(actions.hideTitle);
  }
  showTitle() {
    this._sendAction(actions.showTitle);
  }
  toggleTitle() {
    this._sendAction(actions.toggleTitle);
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

  updateLink(url, title) {
    this._sendAction(actions.updateLink, {url, title});
  }

  insertImage(attributes) {
    this._sendAction(actions.insertImage, attributes);
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

  setBackgroundColor(color) {
    this._sendAction(actions.setBackgroundColor, color);
  }

  setTextColor(color) {
    this._sendAction(actions.setTextColor, color);
  }

  setTitlePlaceholder(placeholder) {
    this._sendAction(actions.setTitlePlaceholder, placeholder);
  }

  setInputFields(inputFields) {
    if (inputFields && Array.isArray(inputFields)) {
      if (PlatformIOS) {
        inputFields.reverse(); //iOS reverses the provided order
      }
      for (let i = 0; i < inputFields.length; i++) {
        this._sendAction(actions.insertInputField, inputFields[i]);
      }
    }
  }

  setContentPlaceholder(placeholder) {
    this._sendAction(actions.setContentPlaceholder, placeholder);
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

  init() {
    this._sendAction(actions.init);
    this.setPlatform();
    if (this.props.footerHeight) {
      this.setFooterHeight();
    }
  }

  setEditorHeight(height) {
    this._sendAction(actions.setEditorHeight, height);
  }

  setFooterHeight() {
    this._sendAction(actions.setFooterHeight, this.props.footerHeight);
  }

  setPlatform() {
    this._sendAction(actions.setPlatform, Platform.OS);
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

  async getTitleText() {
    return new Promise((resolve, reject) => {
      this.titleTextResolve = resolve;
      this.titleTextReject = reject;
      this._sendAction(actions.getTitleText);

      this.pendingTitleText = setTimeout(() => {
        if (this.titleTextReject) {
          this.titleTextReject('timeout');
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

  async setScheduleSendDate(scheduleObj) {
    this._sendAction(actions.setScheduleSendDate, scheduleObj);
  }

  async getInputFieldText(fieldKey) {
    return new Promise((resolve, reject) => {
      this.inputFieldResolves[fieldKey] = resolve;
      this.inputFieldRejects[fieldKey] = reject;
      this.inputFieldTimers[fieldKey] = reject;
      this._sendAction(actions.getInputFieldText, fieldKey);

      this.inputFieldTimers[fieldKey] = setTimeout(() => {
        if (this.inputFieldRejects[fieldKey]) {
          this.inputFieldRejects[fieldKey]('timeout')
        }
      }, 5000);
    });
  }

  setInputFieldText(fieldKey, text) {
    this._sendAction(actions.setInputFieldText, {key: fieldKey, text});
  }

  deleteScheduleSend() {
    this._sendAction(actions.deleteScheduleSend);
  }

  focusInputField(fieldKey) {
    this._sendAction(actions.focusInputField, fieldKey);
  }

  blurInputField(fieldKey) {
    this._sendAction(actions.blurInputField, fieldKey);
  }

  async getSelectedText() {
    return new Promise((resolve, reject) => {
      this.selectedTextResolve = resolve;
      this.selectedTextReject = reject;
      this._sendAction(actions.getSelectedText);

      this.pendingSelectedText = setTimeout(() => {
        if (this.selectedTextReject) {
          this.selectedTextReject('timeout')
        }
      }, 5000);
    });
  }

  setTitleFocusHandler(callbackHandler) {
    this.titleFocusHandler = callbackHandler;
    this._sendAction(actions.setTitleFocusHandler);
  }

  setThresholdHandler(callbackHandler) {
    this.thresholdHandler = callbackHandler;
  }

  setContentFocusHandler(callbackHandler) {
    this.contentFocusHandler = callbackHandler;
    this._sendAction(actions.setContentFocusHandler);
  }

  setInputFieldFocusHandler(fieldKey, callbackHandler){
    this['inputFieldFocusHandler_'+fieldKey] = callbackHandler;
  }

  addSelectedTextChangeListener(listener) {
    this._selectedTextChangeListeners.push(listener);
  }
}
