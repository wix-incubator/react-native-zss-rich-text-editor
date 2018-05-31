import React from 'react';
import styled from 'styled-components';
import * as ZSSEditor from 'react-native-zss-rich-text-editor'
export const Wrapper = styled.ScrollView`
	max-height: 50;
	background: ${({bg}) => bg};
`;

const ActionWrapper = styled.TouchableOpacity`
	height: 50;
	width: 50;
	justify-content: center;
	background: ${({selected, selectedColor, bg}) => selected ? selectedColor : bg};
`

const DEFAULT_ICONS = {
	[ZSSEditor.actions.insertImage]: require('./img/icon_format_media.png'),
	[ZSSEditor.actions.setBold]: require('./img/icon_format_bold.png'),
	[ZSSEditor.actions.setItalic]: require('./img/icon_format_italic.png'),
	[ZSSEditor.actions.insertBulletsList]: require('./img/icon_format_ul.png'),
	[ZSSEditor.actions.insertOrderedList]: require('./img/icon_format_ol.png'),
	[ZSSEditor.actions.insertLink]: require('./img/icon_format_link.png'),
};

const Image = styled.Image``;


const Action = ({onPress, action, icons, bg, selected, selectedColor}) =>
	<ActionWrapper onPress={() => onPress(action)} bg={bg} selected={selected} selectedColor={selectedColor}>
		{icons[action] && <Image source={icons[action]} style={{tintColor: 'white'}}/>}
	</ActionWrapper>


const DefaultToolbar = ({onPressAction, actions, bg, selectedColor, icons}) =>
<Wrapper
	contentContainerStyle={{
		alignItems: 'center',
		flexDirection: 'row',
	}}
	horizontal
	bg={bg}>
{actions.map(action =>
	<Action
		onPress={onPressAction}
		key={action.action}
		action={action.action}
		selected={action.selected}
		selectedColor={selectedColor}
		bg={bg}
		icons={icons}
	/>)}
</Wrapper>


DefaultToolbar.defaultProps = {
	bg: '#D3D3D3',
	selectedColor: 'red',
	selectedIconColor: 'green',
	icons: DEFAULT_ICONS,
}

export default DefaultToolbar;
