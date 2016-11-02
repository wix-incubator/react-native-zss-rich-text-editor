import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import RichTextEditor from 'react-native-ZSSRichTextEditor'

class RichTextExample extends Component {

  constructor(props) {
    super(props);
    this.getHTML = this.getHTML.bind(this);
  }

  render() {
    return (
      <View style={styles.container}>
        <RichTextEditor
          ref={(r)=>this.richtext = r}
          style={styles.richText}
          initialHTML={'Hello <b>World</b> <p>this is a new paragraph</p>'}
        />
      </View>
    );
  }

  async getHTML() {
    const html = await this.richtext.getHtml();
    alert(html);
  }

  componentDidMount() {

    setTimeout(()=>{
      this.getHTML();
    }, 3000);
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
