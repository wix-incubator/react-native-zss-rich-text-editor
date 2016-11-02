import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import RichTextEditor from 'react-native-ZSSRichTextEditor'

export default class RichTextExample extends Component {

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
              initialHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
          />
        </View>
    );
  }

  async getHTML() {
    const html = await this.richtext.getHtml();
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

