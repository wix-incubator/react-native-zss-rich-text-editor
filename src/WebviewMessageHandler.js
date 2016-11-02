import {actions} from './const';

export const InjectedMessageHandler = `
  if (WebViewBridge) {
    WebViewBridge.onMessage = function (message) {
      const action = JSON.parse(message);
      switch(action.type) {
        case '${actions.setHtml}':
          zss_editor.setHTML(action.data);
          break;
      }
    };
  }
`;