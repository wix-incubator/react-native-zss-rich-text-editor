import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import RichTextEditor from 'react-native-ZSSRichTextEditor'

class RichTextExample extends Component {

  render() {
    return (
      <View style={styles.container}>
        <RichTextEditor
          style={styles.richText}
          initialHTML={'Hello <b>World</b> <p>this is a new paragraph</p>'}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
    paddingTop: 40
  },
  richText: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

AppRegistry.registerComponent('example', () => RichTextExample);
