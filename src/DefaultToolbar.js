import React from 'react';
import styled from 'styled-components';
import * as constants from './const';

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
	[constants.actions.insertImage]: require('../img/icon_format_media.png'),
	[constants.actions.setBold]: require('../img/icon_format_bold.png'),
	[constants.actions.setItalic]: require('../img/icon_format_italic.png'),
	[constants.actions.insertBulletsList]: require('../img/icon_format_ul.png'),
	[constants.actions.insertOrderedList]: require('../img/icon_format_ol.png'),
	[constants.actions.insertLink]: require('../img/icon_format_link.png'),
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
