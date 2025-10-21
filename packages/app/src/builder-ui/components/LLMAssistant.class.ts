import { LLMFormController } from '../helpers/LLMFormController.helper';
import { createBadge } from '../ui/badges';
import { IconArrowRight, IconConfigure } from '../ui/icons';
import { handleElementClick, refreshLLMModels, saveApiKey, setupSidebarTooltips } from '../utils';
import { delay } from '../utils/general.utils';
import { Component } from './Component.class';

declare var Metro;

export class LLMAssistant extends Component {
  private modelOptions: string[];
  private defaultModel: string;

  protected async prepare() {
    const modelOptions = LLMFormController.prepareModelSelectOptionsByFeatures(['text']);

    this.defaultModel = LLMFormController.getDefaultModel(modelOptions);

    const model = this.data.model || this.defaultModel;

    //prevent losing the previously set model
    if (model && ![...modelOptions.map((item) => item?.value || item)].includes(model)) {
      modelOptions.push({
        text: model + '&nbsp;&nbsp', // Add non-breaking space entities to create visual spacing between model name and badge
        value: model,
        badge: createBadge('Removed', 'text-smyth-red-500 border-smyth-red-500'),
      });
    }
    // TODO: set warning if the model is not available

    //remove undefined models
    this.modelOptions = modelOptions.filter((e) => e);

    return true;
  }

  protected async init() {
    this.settings = {
      model: {
        type: 'select',
        label: 'Select a Model',
        help: `Choose the chat model for this assistant; balance speed, cost, and context.`,
        hintPosition: 'bottom',
        tooltipClasses: 'w-56 ',
        arrowClasses: '-ml-11',
        value: this.defaultModel,
        options: this.modelOptions,
        dropdownHeight: 350, // In pixels

        events: {
          change: (e) => {
            if (!e.target.value) return;
            const modelInfo = document.querySelector('#right-sidebar #modelInfo');
            modelInfo.innerHTML = this.renderModelInfo(e.target.value);
          },
        },

        //#region // ! DEPRECATED, will be removed in the future
        // loading: true,
        // actions: [
        //   {
        //     label: 'Custom Model',
        //     icon: 'fa-regular fa-plus',
        //     id: 'customModelAddButton',
        //     classes: 'custom_model_add_btn',
        //     shouldDisplay: async () => {
        //       try {
        //         const shouldDisplay = await customModelHelper.shouldDisplayAddButton();

        //         return shouldDisplay;
        //       } finally {
        //         // * This is a quick solution to show the spinner using the 'loading' attribute and remove it here after checking if the button should be displayed or not
        //         const modelElm = document.getElementById('model');
        //         const formGroupElm = modelElm?.closest('.form-group');
        //         const spinnerElm = formGroupElm?.querySelector('.field-spinner');
        //         spinnerElm?.remove();
        //       }
        //     },
        //     afterCreation: () => {
        //       const model = document.getElementById('model');
        //       const modelWrapperElm = model?.closest('.select.smt-input-select');
        //       const dropdownIconElm = modelWrapperElm?.querySelector(
        //         '.dropdown-toggle',
        //       ) as HTMLElement;

        //       if (dropdownIconElm) {
        //         dropdownIconElm.style.right = '115px';
        //       }
        //     },
        //     events: {
        //       click: (event) => customModelHelper.addButtonClickHandler(this, event),
        //     },
        //   },
        // ],
        //#endregion

        actions: [
          {
            label: 'Configure more models',
            icons: {
              left: {
                svg: IconConfigure,
                classes: 'mr-2',
              },
              right: {
                svg: IconArrowRight,
                classes: 'absolute right-4',
              },
            },
            position: 'after-dropdown',
            id: 'configureMoreModelsBtn',
            classes: 'custom_model_add_btn',
            events: {
              click: () => {
                window.open('/vault', '_blank');
              },
            },
          },
        ],
      },
      modelInfo: {
        type: 'div',
        cls: 'model-info',
        label: 'Model Info',
        html: this.renderModelInfo.bind(this),
      },

      behavior: {
        type: 'textarea',
        expandable: true,
        label: 'Behavior',
        class: '',
        validate: `required maxlength=30000`,
        validateMessage: `The behavior prompt should be a non empty text of less than 30,000 characters`,
        value: 'You are a helpful assistant that helps people with their questions',
        attributes: { 'data-template-vars': 'true' },
        help: 'Set the assistant’s tone, rules, and actions so replies fit the intended use case. <a href="https://smythos.com/docs/agent-studio/components/advanced/llm-assistant/?utm_source=studio&utm_medium=tooltip&utm_campaign=llm-assistant&utm_content=behavior#step-2-define-the-behavior" target="_blank" class="text-blue-600 hover:text-blue-800">See behaviour examples</a>',
        tooltipClasses: 'w-56 ',
        arrowClasses: '-ml-11',
      },
      passthrough: {
        type: 'checkbox',
        label: 'Passthrough',
        value: false,
        attributes: { 'data-supported-models': 'all' },
        section: 'Advanced',
        help: `Send raw replies into the workflow for filtering or transformation before display. <a href="https://smythos.com/docs/agent-studio/components/advanced/llm-assistant/?utm_source=studio&utm_medium=tooltip&utm_campaign=llm-assistant&utm_content=passthrough#step-4-configure-advanced-settings" target="_blank" class="text-blue-600 hover:text-blue-800">See passthrough controls</a>`,
        tooltipClasses: 'w-56 ',
        arrowClasses: '-ml-11',
      },

      // prompt_select:{
      //     type:'input-selector',
      //     options:['Input'],
      //     rel:'prompt'
      // }
    };

    const dataEntries = ['model', 'behavior'];
    for (let item of dataEntries) {
      if (typeof this.data[item] === 'undefined') this.data[item] = this.settings[item].value;
    }

    // #region [ Output config ] ==================
    this.outputSettings = {
      ...this.outputSettings,
      description: { type: 'string', default: '', editConfig: { type: 'textarea' } },
    };
    // #endregion

    this.properties.defaultInputs = ['UserId', 'ConversationId', 'UserInput'];
    if (this.properties.inputs.length == 0)
      this.properties.inputs = ['UserId', 'ConversationId', 'UserInput'];
    if (!this.properties.inputProps) this.properties.inputProps = [];
    const convInputProps = this.properties.inputProps?.find((c) => c.name === 'ConversationId');
    if (!convInputProps)
      this.properties.inputProps.push({ name: 'ConversationId', optional: true });
    else convInputProps.optional = true;

    const userIdInputProps = this.properties.inputProps?.find((c) => c.name === 'UserId');
    if (!userIdInputProps) this.properties.inputProps.push({ name: 'UserId', optional: true });
    else userIdInputProps.optional = true;

    this.properties.defaultOutputs = ['Response'];

    this.drawSettings.displayName = 'LLM Assistant';
    this.drawSettings.iconCSSClass = 'svg-icon ' + this.constructor.name;

    this.drawSettings.componentDescription = 'Use LLM to handle a chat conversation';
    this.drawSettings.shortDescription = 'LLM Assistant - Handles a chat conversation';
    this.drawSettings.color = '#65a698';

    this._ready = true;
  }

  private renderModelInfo(modelId = this.data.model) {
    let html = '';
    const LLMModels = window['__LLM_MODELS__'];

    if (LLMModels) {
      const model = LLMModels[modelId];
      if (model) {
        html += `<ul>`;

        html += `<li><b>Provider: </b> ${model?.llm ? model.llm : 'Unknown'}</li>`;
        html += `<li><b>Context Window Size: </b> ${model?.tokens ? model.tokens : 'Unknown'}</li>`;
        html += `<li><b>Maximum Output Tokens: </b> ${
          model?.completionTokens ? model.completionTokens : 'Unknown'
        }</li>`;
        html += `</ul>`;

        // Hide the API Key message for custom LLMs since they do not require it.
        if (!model.hasKey && !model.isCustomLLM) {
          html +=
            '<hr/><p>The capabilities of this model are limited, enter an API Key to raise the limits</p>';
        }
      }
    }

    return html;
  }
  protected async run() {
    this.addEventListener('settingsOpened', this.handleSettingsOpened.bind(this));
  }

  private async handleSettingsOpened(sidebar, component) {
    if (component !== this) return;
    await delay(200);
    await setupSidebarTooltips(sidebar, this);

    const modelElm = sidebar.querySelector('#model');
    // customModelHelper.actionsHandler(this, modelElm); // ! DEPRECATED
  }

  private async handleElementClick(event) {
    await handleElementClick(event, this);
  }

  private async saveApiKey(serviceKey, serviceLabel, formData) {
    return await saveApiKey(
      serviceKey,
      serviceLabel,
      formData,
      this.workspace,
      this.refreshLLMModels.bind(this),
    );
  }

  private async refreshLLMModels() {
    await refreshLLMModels(
      this.workspace,
      this.prepare.bind(this),
      this.init.bind(this),
      this.refreshSettingsSidebar.bind(this),
    );
  }
}
