import {actions} from './const';
import * as consts from './const';

export const InjectedMessageHandler = `
  if (WebViewBridge) {
    WebViewBridge.onMessage = function (message) {
      const action = JSON.parse(message);
      switch(action.type) {
        case '${actions.setHtml}':
          zss_editor.setHTML(action.data);
          break;
        case '${actions.blurEditor}':
          zss_editor.blurEditor();
          break;
        case '${actions.setBold}':
          zss_editor.setBold();
          break;
        case '${actions.setItalic}':
          zss_editor.setItalic();
          break;
        case '${actions.setUnderline}':
          zss_editor.setUnderline();
          break;
        case '${actions.heading1}':
          zss_editor.setHeading('h1');
          break;
        case '${actions.heading2}':
          zss_editor.setHeading('h2');
          break;
        case '${actions.heading3}':
          zss_editor.setHeading('h3');
          break;
        case '${actions.heading4}':
          zss_editor.setHeading('h4');
          break;
        case '${actions.heading5}':
          zss_editor.setHeading('h5');
          break;
        case '${actions.heading6}':
          zss_editor.setHeading('h6');
          break;
        case '${actions.setParagraph}':
          zss_editor.setParagraph()
          break;
        case '${actions.removeFormat}':
          zss_editor.removeFormating();
          break;
        case '${actions.alignLeft}':
          zss_editor.setJustifyLeft();
          break;
        case '${actions.alignCenter}':
          zss_editor.setJustifyCenter();
          break;
        case '${actions.alignRight}':
          zss_editor.setJustifyRight();
          break;
        case '${actions.alignFull}':
          zss_editor.setJustifyFull();
          break;
        case '${actions.insertBulletsList}':
          zss_editor.setUnorderedList();
          break;
        case '${actions.insertOrderedList}':
          zss_editor.setOrderedList();
          break;
        case '${actions.setSubscript}':
          zss_editor.setSubscript();
          break;
        case '${actions.setSuperscript}':
          zss_editor.setSuperscript();
          break;
        case '${actions.setStrikethrough}':
          zss_editor.setStrikethrough();
          break;
        case '${actions.setHR}':
          zss_editor.setHorizontalRule();
          break;
        case '${actions.setIndent}':
          zss_editor.setIndent();
          break;
        case '${actions.setOutdent}':
          zss_editor.setOutdent();
          break;
        case '${actions.setPlaceholder}':
          zss_editor.setPlaceholder();
          break;
        case '${actions.getHtml}':
          const html = zss_editor.getHTML();
          WebViewBridge.send(JSON.stringify({type: '${consts.HTML_RESPONSE}', data: html}));
          break;
      }
    };
  }
`;