import Tab from './tab.class';
import FileList from './file-list.class';
import MK from 'matreshka';
import validate from '../util/validate';

const { dropFiles, file, className, dragOver } = MK.binders;

export default class Upload extends Tab {
	constructor(...args) {
		super(...args)
			.setClassFor('fileList', FileList)
			.bindNode({
				fileWrapper: ':sandbox .file-wrapper',
				files: [':bound(fileWrapper)', dropFiles('text')],
				dragovered: [':bound(fileWrapper)', dragOver()],
				'fileList.length': [':sandbox .clear, :sandbox .compress', {
					setValue(v) {
						this.disabled = !v;
					}
				}]
			})
			.bindNode({
				files: [':sandbox .file-input', file('text')],
				dragovered: [':bound(fileWrapper)', className('dragovered')]
			})
			.on({
				'change:files': () => {
					this.fileList.push(...this.files.map(
						({ name, readerResult }) => ({ name, readerResult })
					));
				},
				'click::(.clear)': () => {
					this.fileList.recreate();
					this.error = '';
				},
				'click::(.compress)': () => {
					const errors = [],
						results = [];

					for (const item of this.fileList) {
						const { readerResult, name } = item,
							{ isValid, error } = validate(readerResult);

						results.push(readerResult);

						if (!isValid) {
							errors.push(`File ${name}: ${error}`);
						}
					}

					if (errors.length) {
						this.error = errors.join('<br>');
					} else {
						this.error = '';

						this.trigger('submitCode', results.join(';'));
					}
				}
			});
	}
}
