const chokidar = require('chokidar');
const { processCssFile } = require('./build-styles');
const { exec } = require('child_process');

let log = console.log;

console.log = function () {
	let first_parameter = arguments[0];
	let other_parameters = Array.prototype.slice.call(arguments, 1);

	function formatConsoleDate(date) {
		let hour = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();
		let milliseconds = date.getMilliseconds();

		return (
			'[' +
			(hour < 10 ? '0' + hour : hour) +
			':' +
			(minutes < 10 ? '0' + minutes : minutes) +
			':' +
			(seconds < 10 ? '0' + seconds : seconds) +
			'.' +
			('00' + milliseconds).slice(-3) +
			'] '
		);
	}

	log.apply(
		console,
		[formatConsoleDate(new Date()) + first_parameter].concat(
			other_parameters
		)
	);
};

/**
 * Watch for style changes in CSS files
 * Build CSS files for use in component files when change detected
 */
chokidar
	.watch('./src/components/**/*.css')
	.on('change', (path) => {
		console.log(`Styling change detected in ${path}`);
		processCssFile(path);
	})
	.on('add', (path) => {
		console.log(`CSS file added ${path}`);
		processCssFile(path);
	});

/**
 * Watch for style changes in component TS files
 * Build custom-elements manifest when change detected
 */
chokidar
	.watch('./src/components/**/*.ts', {
		ignored: /(^|[\/\\])[^.]+\.css\.ts$/, // ignore files ending with .css.ts
	})
	.on('change', (path) => {
		console.log(`Component change detected in ${path}; Updating Manifest`);
		exec(`npm run analyze`);
	});

console.log('Watching for changes...');
