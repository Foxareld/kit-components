import { css } from 'lit';
export default css`
	:where(
			:not(html, iframe, canvas, img, svg, video, audio):not(
					svg *,
					symbol *
				)
		) {
		all: unset;
		display: revert;
	}
	*,
	:after,
	:before {
		box-sizing: border-box;
	}
	a,
	button {
		cursor: revert;
	}
	menu,
	ol,
	ul {
		list-style: none;
	}
	img {
		max-block-size: 100%;
		max-inline-size: 100%;
	}
	table {
		border-collapse: collapse;
	}
	input,
	textarea {
		-webkit-user-select: auto;
	}
	textarea {
		white-space: revert;
	}
	meter {
		-webkit-appearance: revert;
		appearance: revert;
	}
	:where(pre) {
		all: revert;
	}
	::placeholder {
		color: unset;
	}
	::marker {
		content: normal;
	}
	:where([hidden]) {
		display: none;
	}
	:where([contenteditable]:not([contenteditable='false'])) {
		-moz-user-modify: read-write;
		-webkit-user-modify: read-write;
		-webkit-line-break: after-white-space;
		overflow-wrap: break-word;
		-webkit-user-select: auto;
	}
	:where([draggable='true']) {
		-webkit-user-drag: element;
	}
	:where(dialog:modal) {
		all: revert;
	}
`;
