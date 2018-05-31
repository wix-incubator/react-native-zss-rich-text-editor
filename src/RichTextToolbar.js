import { Component } from 'react';
import * as constants from './const';

const defaultActions = [
  constants.actions.insertImage,
  constants.actions.setBold,
  constants.actions.setItalic,
  constants.actions.insertBulletsList,
  constants.actions.insertOrderedList,
  constants.actions.insertLink
];
const noop = () => {}
export default class RichTextToolbar extends Component {
  static defaultProps = {
    actions: defaultActions,
    onPressAddLink: noop,
    onPressAddImage: noop,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedActions: [],
      actions: this.props.actions
    };
  }

  componentDidMount() {
    const editor = this.props.getEditor();
    editor.registerToolbar((selectedActions) => this.setState({
      ...this.state,
      selectedActions
    }));
    this.editor = editor;
  }

  onPressAction = (action) => {
    switch(action) {
      case constants.actions.setBold:
      case constants.actions.setItalic:
      case constants.actions.insertBulletsList:
      case constants.actions.insertOrderedList:
      case constants.actions.setUnderline:
      case constants.actions.heading1:
      case constants.actions.heading2:
      case constants.actions.heading3:
      case constants.actions.heading4:
      case constants.actions.heading5:
      case constants.actions.heading6:
      case constants.actions.setParagraph:
      case constants.actions.removeFormat:
      case constants.actions.alignLeft:
      case constants.actions.alignCenter:
      case constants.actions.alignRight:
      case constants.actions.alignFull:
      case constants.actions.setSubscript:
      case constants.actions.setSuperscript:
      case constants.actions.setStrikethrough:
      case constants.actions.setHR:
      case constants.actions.setIndent:
      case constants.actions.setOutdent:
        this.editor._sendAction(action);
        break;
      case constants.actions.insertLink:
        this.editor.prepareInsert();
        if(this.props.onPressAddLink) {
          this.props.onPressAddLink();
        } else {
          this.editor.getSelectedText().then(selectedText => {
            this.editor.showLinkDialog(selectedText);
          });
        }
        break;
      case constants.actions.insertImage:
        this.editor.prepareInsert();
        if(this.props.onPressAddImage) {
          this.props.onPressAddImage();
        }
        break;
      default:
        break;
    }
  }

  render() {
    if (!this.editor || !this.props.children) return null;
    const actionsMapped = this.props.actions.map(action => ({
      action,
      selected: this.state.selectedActions.includes(action)
    }));
    return this.props.children({
      onPressAction: this.onPressAction,
      actions: actionsMapped
    })
  }
}
