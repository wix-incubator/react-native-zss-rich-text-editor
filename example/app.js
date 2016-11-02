import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import {RichTextEditor, RichTextToolbar} from 'react-native-ZSSRichTextEditor'
import KeyboardSpacer from 'react-native-keyboard-spacer';

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
              initialTitleHTML={'Title!!'}
              initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
          />
          <RichTextToolbar
            getEditor={() => this.richtext}
          />
          <KeyboardSpacer/>
        </View>
    );
  }

  async getHTML() {
    const titleHtml = await this.richtext.getTitleHtml();
    const contentHtml = await this.richtext.getContentHtml();
    //alert(titleHtml + ' ' + contentHtml)
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

