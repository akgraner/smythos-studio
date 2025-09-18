import { Component } from './Component.class';

export class MemoryDeleteKeyVal extends Component {
  protected async init() {
    // #region [ Settings config ] ==================
    this.settings = {
      memoryName: {
        type: 'input',
        label: 'name',
        value: '',
        validate: `required maxlength=100`,
        validateMessage: 'Enter a non-empty name, not more than 100 characters.',
        attributes: { 'data-template-vars': 'true' },
      },
      key: {
        type: 'input',
        label: 'Key',
        value: '{{Key}}',
        hint: 'Key to delete from memory',
        validate: `maxlength=50`,
        attributes: { 'data-template-vars': 'true' },
        help: 'Select the key-value store containing the key to delete. <a href="#" target="_blank" class="text-blue-600 hover:text-blue-800">Go to Docs</a>',
        validateMessage: 'Enter a non-empty name, not more than 50 characters.',
      },
      scope: {
        type: 'select',
        label: 'Scope',
        help: 'Choose the scope where the key should be removed. <a href="#" target="_blank" class="text-blue-600 hover:text-blue-800">Go to Docs</a>',
        value: 'Session',
        options: ['Session'],
      },
    };

    const dataEntries = ['memoryName', 'key'];
    for (let item of dataEntries) {
      if (typeof this.data[item] === 'undefined') this.data[item] = this.settings[item].value;
    }

    //this.data = {};
    // #endregion

    // #region [ I/O config ] ==================
    this.properties.defaultOutputs = ['Key'];
    this.properties.defaultInputs = [];
    if (this.properties.inputs.length == 0) this.properties.inputs = ['Key'];
    // #endregion

    // #region [ Draw config ] ==================
    //this.drawSettings.showSettings = false;
    this.drawSettings.iconCSSClass = 'svg-icon Memory ' + this.constructor.name;
    this.drawSettings.addOutputButton = ' ';
    // this.drawSettings.addInputButton = ' + Entry';
    this.drawSettings.addInputButton = 'Mem Entry';
    this.drawSettings.addOutputButtonLabel = ' ';
    // #endregion
  }
}
