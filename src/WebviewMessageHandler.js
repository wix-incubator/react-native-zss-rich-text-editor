import {actions} from './const';

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
      }
    };
  }
`;