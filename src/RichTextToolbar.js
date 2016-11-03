import React, {Component, PropTypes} from 'react';
import {ListView, View, TouchableOpacity, Text} from 'react-native';
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
    getEditor: PropTypes.func.isRequired,
    actions: PropTypes.array,
    onPressAddLink: PropTypes.func,
    onPressAddImage: PropTypes.func
  };

  constructor(props) {
    super(props);
    const actions = this.props.actions ? this.props.actions : defaultActions;
    this.state = {
      editor: undefined,
      selectedItems: [],
      actions,
      ds: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows(this.getRows(actions, []))
    };
  }

  componentDidReceiveProps(newProps) {
    const actions = newProps.actions ? newProps.actions : defaultActions;
    this.setState({
      actions,
      ds: this.state.ds.cloneWithRows(this.getRows(actions, this.state.selectedItems))
    });
  }

  getRows(actions, selectedItems) {
    return actions.map((action) => {return {action, selected: selectedItems.includes(action)};});
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
    if (selectedItems !== this.state.selectedItems) {
      this.setState({
        selectedItems,
        ds: this.state.ds.cloneWithRows(this.getRows(this.state.actions, selectedItems))
      });
    }
  }



  _renderAction(action, selected) {
    return (
      <TouchableOpacity
          key={action}
          style={{height: 50, width: 50, backgroundColor: selected? 'red' : undefined, justifyContent: 'center'}}
          onPress={() => this._onPress(action)}
      >
        <Text style={{textAlign: 'center'}}>
          {getDefaultIconText()[action] ? getDefaultIconText()[action] : action.slice(0,1)}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View
          style={[{height: 50, backgroundColor: '#D3D3D3', alignItems: 'center'}, this.props.style]}
      >
        <ListView
            horizontal
            contentContainerStyle={{flexDirection: 'row'}}
            dataSource={this.state.ds}
            renderRow= {(row) => this._renderAction(row.action, row.selected)}
        />
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
        if(this.props.onPressAddLink) {
          this.props.onPressAddLink();
        }
        break;
      case actions.insertImage:
        if(this.props.onPressAddImage) {
          this.props.onPressAddImage();
        }
        break;
        break;
    }
  }
}