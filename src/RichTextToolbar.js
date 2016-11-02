import React, {Component, PropTypes} from 'react';
import {View, TouchableOpacity} from 'react-native';


export default class RichTextToolbar extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired
  };

  render() {
    return (
      <TouchableOpacity
        style={{
          height: 50,
          backgroundColor: 'red'
        }}
        onPress={() => this.props.getEditor().setBold()}
      />
    );
  }
}