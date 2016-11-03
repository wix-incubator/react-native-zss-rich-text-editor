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

  _getButton(action, selected) {
    return (
      <TouchableOpacity
          key={action}
          style={{flex: 1, backgroundColor: 'blue', justifyContent: 'center'}}
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
        {defaultActions.map((action) => this._getButton(action, false))}
      </View>
    );
  }

  _onPress(action) {
    switch(action) {
      case actions.setBold:
        this.props.getEditor().setBold();
        break;
      case actions.setItalic:
        this.props.getEditor().setItalic();
        break;
      case actions.insertBulletsList:
        this.props.getEditor().insertBulletsList();
        break;
      case actions.insertOrderedList:
        this.props.getEditor().insertOrderedList();
        break;
    }
  }
}