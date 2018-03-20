const textNode = (contents, target) => {
	if (contents) {
		contents = contents.replace(/[	 \n\t]{2,}/g, ' ');
		if (contents !== ' ' && contents) target.push({ type: 'TEXT', contents});
	}
	return '';
};

const commentNode = (input, cursor, target) => {
	target.push({
		type: 'COMMENT',
		contents: input.substring(cursor + 3, cursor = input.indexOf('-->', cursor + 3))
	});
	cursor += 3;

	return { cursor };
};

const attributeNode = () => {

};

const elementNode = (input, cursor, stack, stacks) => {
	let goChild, goParent;

	if (input[cursor] !== '/') {

		let rawContents = input.substring(cursor, cursor = input.indexOf('>', cursor));
		goChild = input[cursor - 1] === '/';

		if (goChild) {
			rawContents = rawContents.substr(0, rawContents.length - 1);
		}
		rawContents = rawContents.trim();

		const name = rawContents.includes(' ') ? rawContents.substring(0, rawContents.indexOf(' ')) : rawContents;

		const node = {
			type: 'ELEMENT',
			name,
			children: goChild ? null : [],
		};

		stack.children.push(node);

		if (!goChild) {
			stacks.push({ node, parent: stack });

		}
		cursor++;

	} else if (input[cursor] === '/') {
		if (stack.name === input.substring(cursor + 1, input.indexOf('>', cursor))) {
			goParent = true;
			cursor = input.indexOf('>', cursor) + 1;

		} else {
			throw Error('Parsing Error!');

		}
	}

	return { cursor, goChild, goParent };
};

const parser = html => {
	const result = { type: 'ROOT', children: [] }, stacks = [];
	let text = '', cursor = 0, stack = result;

	while (cursor < html.length) {
		const char = html[cursor++];
		if (char === '<') {
			text = textNode(text, stack.children);

			if (html.substr(cursor, 3) === '!--') {
				({ cursor } = commentNode(html, cursor, stack.children));

			} else {
				({ cursor, goChild, goParent } = elementNode(html, cursor, stack, stacks));

				if (!goChild && !goParent) {
					const _tempStack = stacks.pop();
					stack = _tempStack.node;
					stack.parent = _tempStack.parent;
				}

				if (goParent) {
					stack = stack.parent;
				}
			}

		} else {
			text += char;

		}
	}

	return result;
};