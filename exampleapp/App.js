import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Platform
} from 'react-native';
import {Editor, ToolBar, ToolBarStyled} from 'react-native-zss-rich-text-editor';
import KeyboardSpacer from 'react-native-keyboard-spacer';
// import CustomToolBar from './CustomToolBar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 40
  },
  richText: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default class RichTextExample extends Component {

  constructor(props) {
    super(props);
    this.getHTML = this.getHTML.bind(this);
    this.setFocusHandlers = this.setFocusHandlers.bind(this);
  }

  onEditorInitialized() {
    this.setFocusHandlers();
    this.getHTML();
  }

  async getHTML() {
    const titleHtml = await this.richtext.getTitleHtml();
    const contentHtml = await this.richtext.getContentHtml();
    // alert(titleHtml + ' ' + contentHtml) //eslint-disable-line
  }

  setFocusHandlers() {
    this.richtext.setTitleFocusHandler(() => {
      //alert('title focus');
    });
    this.richtext.setContentFocusHandler(() => {
      //alert('content focus');
    });
  }

  render() {
    return (
        <View style={styles.container}>
          <Editor
              ref={(r)=>{ this.richtext = r}}
              style={styles.richText}
              initialTitleHTML="Title!!"
              initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
              editorInitializedCallback={() => this.onEditorInitialized()}
          />
          <ToolBar getEditor={() => this.richtext}>
            {props => <ToolBarStyled {...props}/>}
          </ToolBar>
          {Platform.OS === 'ios' && <KeyboardSpacer/>}
        </View>
    );
  }
}
