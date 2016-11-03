import React, {Component, PropTypes} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {actions} from './const';

const defaultActions = [
  actions.insertImage,
  actions.setBold,
  actions.setItalic,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.insertLink
];

function getDefaultIconText() {
  const texts = {};
  texts[actions.insertImage] = 'IMG';
  texts[actions.setBold] = 'B';
  texts[actions.setItalic] = 'I';
  texts[actions.insertBulletsList] = '0';
  texts[actions.insertOrderedList] = '1';
  texts[actions.insertLink] = '<a>';
  return texts;
}

export default class RichTextToolbar extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      editor: undefined,
      selectedItems: []
    };
  }

  componentDidMount() {
    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error('Toolbar has no editor!');
    } else {
      editor.registerToolbar((selectedItems) => this.setSelectedItems(selectedItems));
      this.setState({editor});
    }
  }

  setSelectedItems(selectedItems) {
    this.setState({
      selectedItems
    });
  }



  _getButton(action, selected) {
    return (
      <TouchableOpacity
          key={action}
          style={{flex: 1, backgroundColor: selected? 'red' : '#D3D3D3', justifyContent: 'center'}}
          onPress={() => this._onPress(action)}
      >
        <Text style={{textAlign: 'center'}}>
          {getDefaultIconText()[action]}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flexDirection: 'row', height: 50}}>
        {defaultActions.map((action) => this._getButton(action, this.state.selectedItems.includes(action)))}
      </View>
    );
  }

  _onPress(action) {
    switch(action) {
      case actions.setBold:
      case actions.setItalic:
      case actions.insertBulletsList:
      case actions.insertOrderedList:
      case actions.setUnderline:
      case actions.heading1:
      case actions.heading2:
      case actions.heading3:
      case actions.heading4:
      case actions.heading5:
      case actions.heading6:
      case actions.setParagraph:
      case actions.removeFormat:
      case actions.alignLeft:
      case actions.alignCenter:
      case actions.alignRight:
      case actions.alignFull:
      case actions.setSubscript:
      case actions.setSuperscript:
      case actions.setStrikethrough:
      case actions.setHR:
      case actions.setIndent:
      case actions.setOutdent:
        this.state.editor._sendAction(action);
        break;
      case actions.insertLink:
      case actions.insertImage:
        break;
    }
  }
}