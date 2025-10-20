import DOMPurify from 'dompurify';
import { Tooltip } from 'flowbite-react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { delay } from '../../utils';

declare var Metro;

/**
 * Global registry for datalist options.
 * Options are stored as functions to avoid loading large data modules during app initialization.
 * The functions are called synchronously on first focus to ensure immediate availability.
 */
const datalistRegistry: Map<string, () => Array<string | { text: string; value: string }>> =
  new Map();

/**
 * Register a datalist options provider by datalist ID.
 * The provider function is called synchronously when the field is first focused.
 *
 * @param datalistId - Unique ID for the datalist
 * @param optionsProvider - Function that returns the options array
 */
export const registerDatalistOptions = (
  datalistId: string,
  optionsProvider: () => Array<string | { text: string; value: string }>,
): void => {
  datalistRegistry.set(datalistId, optionsProvider);
};

export const createInput = (value: string = ''): HTMLInputElement => {
  const fieldElm = document.createElement('input');
  fieldElm.setAttribute('data-role', 'input');
  fieldElm.setAttribute('value', value || '');

  return fieldElm;
};

export const createHiddenInput = (value: string = ''): HTMLInputElement => {
  const fieldElm = document.createElement('input');
  fieldElm.setAttribute('type', 'hidden');
  fieldElm.setAttribute('value', value || '');

  return fieldElm;
};

/**
 * Creates a text input with datalist autocomplete support.
 * The datalist is created synchronously on first user interaction (mousedown, touchstart, or focus).
 * Using mousedown ensures the datalist is ready BEFORE focus, making it work on the first try.
 * This keeps initial render fast while ensuring the field works immediately.
 *
 * @param value - Initial value for the input
 * @param datalistId - ID for the datalist element (used to lookup options in registry)
 * @returns HTMLInputElement with datalist support
 */
export const createDatalistInput = (value: string = '', datalistId?: string): HTMLInputElement => {
  const fieldElm = document.createElement('input');
  fieldElm.setAttribute('data-role', 'input');
  fieldElm.setAttribute('type', 'text');
  fieldElm.setAttribute('value', value || '');

  // Set up datalist if datalistId is provided
  if (datalistId) {
    fieldElm.setAttribute('list', datalistId);

    let datalistCreated = false;

    // Create datalist on first interaction - synchronously so it's ready immediately
    const createDatalistOnce = (): void => {
      // Prevent multiple calls
      if (datalistCreated) {
        return;
      }

      // Check if datalist already exists
      if (document.getElementById(datalistId)) {
        datalistCreated = true;
        return;
      }

      // Get options provider from registry
      const optionsProvider = datalistRegistry.get(datalistId);
      if (!optionsProvider) {
        console.warn(`Datalist options not registered for ID: ${datalistId}`);
        datalistCreated = true;
        return;
      }

      // Create datalist SYNCHRONOUSLY (no setTimeout/requestIdleCallback)
      // This ensures the datalist exists before the browser tries to show the dropdown
      const options = optionsProvider();

      const datalist = document.createElement('datalist');
      datalist.id = datalistId;

      // Use DocumentFragment for batch DOM operations (much faster)
      const fragment = document.createDocumentFragment();

      options.forEach((option) => {
        const optionEl = document.createElement('option');
        if (typeof option === 'string') {
          optionEl.value = option;
        } else {
          optionEl.value = option.value;
          if (option.text) {
            optionEl.textContent = option.text;
          }
        }
        fragment.appendChild(optionEl);
      });

      datalist.appendChild(fragment);
      document.body.appendChild(datalist);
      datalistCreated = true;
    };

    // Listen to multiple events to catch interaction as early as possible
    // mousedown fires BEFORE focus, ensuring datalist is ready
    fieldElm.addEventListener('mousedown', createDatalistOnce, { once: true });
    fieldElm.addEventListener('focus', createDatalistOnce, { once: true });
    // Also handle touch devices
    fieldElm.addEventListener('touchstart', createDatalistOnce, { once: true, passive: true });
  }

  return fieldElm;
};

/*
 * Note:
 * Currently, the 'options()' function does not support badges. To enable this feature,
 * maybe we can extend the 'addOption()' function in 'static/metroui/js/metro.js' at line #30083.
 */
export const createSelectBox = (
  options: Array<{ value: string; text: string }> | any,
  value: string,
  dropdownHeight?: number,
): HTMLSelectElement => {
  const select = document.createElement('select');
  select.setAttribute('data-role', 'select');

  if (dropdownHeight) {
    select.setAttribute('data-drop-height', `${dropdownHeight}`);
  }

  let entries = [];

  //get options from function
  if (typeof options === 'function') {
    setTimeout(() => {
      const div = select.closest('.form-box');
      if (div) div.classList.add('loading');
    }, 300);
    options().then((data) => {
      entries = data;

      const selectElem = Metro.getPlugin(select, 'select');
      selectElem.removeOptions([...selectElem?.elem?.options].map((o) => o.value)); //remove all options
      data.forEach((option) => {
        const _text = option.text !== undefined ? option.text : option?.value || option; // handle empty string ''
        const _value = option.value !== undefined ? option.value : option; // handle empty string ''
        const _selected = value == _value;
        selectElem.addOption(_value, _text, _selected);
      });

      const div = select.closest('.form-box');
      if (div) {
        setTimeout(() => {
          div.classList.remove('loading');
        }, 300);
      }
    });
  } else {
    entries = options;
  }

  //create the default select element, leave it empty if no value is provided or if we're fetching options from a function
  select.innerHTML = entries
    .map((option) => {
      const _text = option.text !== undefined ? option.text : option?.value || option; // handle empty string ''
      const _value = option.value !== undefined ? option.value : option; // handle empty string ''
      const _badge = option?.badge || '';
      let template = '';

      if (_badge) {
        template = `data-template="$1 ${_badge.replace(/\"/g, `'`)}"`;
      }

      return `<option value="${_value}" ${
        value == _value ? 'selected' : ''
      } ${template}>${_text}</option>`;
    })
    .join('');

  return select;
};

export const createCheckbox = (label: string, value: string): HTMLInputElement => {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('data-role', 'checkbox');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('data-caption', label);
  //formElement.setAttribute('data-caption-position', 'left');
  if (value) checkbox.setAttribute('checked', '');
  else checkbox.removeAttribute('checked');

  return checkbox;
};

export const createCheckboxGroup = (
  options: Array<{ value: string; text: string; checked: boolean; readonly: boolean }>,
  value: string[],
): HTMLDivElement => {
  const group = document.createElement('div');
  group.setAttribute('data-role', 'checkbox-group');

  // value example: ['1', '2']
  group.innerHTML = options
    .map((option) => {
      const checkbox = document.createElement('input');
      checkbox.setAttribute('data-role', 'checkbox');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('data-caption', option.text);
      checkbox.setAttribute('value', option.value);

      if ((value && Array.isArray(value) && value.includes(option.value)) || option?.checked) {
        checkbox.setAttribute('checked', 'checked');
      }

      if (option?.readonly) {
        checkbox.setAttribute('disabled', 'disabled');
      }

      return checkbox.outerHTML;
    })
    .join('');

  return group;
};

/**
 * Type definition for textarea elements with an attached code editor instance
 */
interface TextAreaWithEditor extends HTMLTextAreaElement {
  _editor?: {
    getValue: () => string;
    setValue: (value: string) => void;
    focus: () => void;
  };
}

/**
 * Cached imports for modal and editor functionality to avoid repeated dynamic imports
 */
let cachedTwModalDialog: typeof import('../tw-dialogs').twModalDialog | null = null;
let cachedSetCodeEditor: typeof import('../dom').setCodeEditor | null = null;

/**
 * Lazy load and cache modal-related imports
 * This avoids circular dependencies while maintaining performance
 * Imports are cached separately to handle both code editor and non-code editor cases
 */
async function getModalImports(needsCodeEditor: boolean): Promise<{
  twModalDialog: typeof import('../tw-dialogs').twModalDialog;
  setCodeEditor: typeof import('../dom').setCodeEditor | null;
}> {
  // Load dialog module if not cached
  if (!cachedTwModalDialog) {
    const dialogModule = await import('../tw-dialogs');
    cachedTwModalDialog = dialogModule.twModalDialog;
  }

  // Load code editor module if needed and not cached
  if (needsCodeEditor && !cachedSetCodeEditor) {
    const domModule = await import('../dom');
    cachedSetCodeEditor = domModule.setCodeEditor;
  }

  return {
    twModalDialog: cachedTwModalDialog,
    setCodeEditor: needsCodeEditor ? cachedSetCodeEditor : null,
  };
}

/**
 * Creates an expand button element with proper styling and accessibility
 * Uses passive event listeners for hover effect to avoid blocking the main thread
 */
function createExpandButton(): HTMLButtonElement {
  const expandButton = document.createElement('button');
  expandButton.type = 'button';
  expandButton.classList.add('expand-textarea-btn');
  expandButton.setAttribute('aria-label', 'Expand textarea');

  // Apply inline styles - opacity transition handled by CSS
  expandButton.style.cssText = `
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  `;

  // Add expand icon SVG
  expandButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 3 21 3 21 9"></polyline>
      <polyline points="9 21 3 21 3 15"></polyline>
      <line x1="21" y1="3" x2="14" y2="10"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    </svg>
  `;

  // Add hover effect using passive event listeners for better performance
  expandButton.addEventListener(
    'pointerenter',
    () => {
      expandButton.style.opacity = '1';
    },
    { passive: true },
  );

  expandButton.addEventListener(
    'pointerleave',
    () => {
      expandButton.style.opacity = '0.5';
    },
    { passive: true },
  );

  return expandButton;
}

/**
 * Apply styles to a textarea element based on whether it's a code editor or regular textarea
 */
function applyTextareaStyles(textarea: HTMLTextAreaElement, isCodeEditor: boolean): void {
  if (isCodeEditor) {
    // Minimal styles for code editor - the editor handles most styling
    textarea.style.cssText = `
      width: 100%;
      min-height: 400px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    `;
  } else {
    // Full styling for regular textarea
    textarea.style.cssText = `
      width: 100%;
      min-height: 300px;
      padding: 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      transition: border-color 0.15s ease-in-out;
    `;
  }
}

/**
 * Synchronize values between modal textarea and original textarea
 * Handles both regular textareas and code editor instances
 */
function syncTextareaValues(
  modalTextarea: TextAreaWithEditor,
  originalTextarea: TextAreaWithEditor,
  hasCodeEditor: boolean,
): void {
  let valueToSync = modalTextarea.value;

  // If it's a code editor, get value from the editor instance
  if (hasCodeEditor && modalTextarea._editor) {
    valueToSync = modalTextarea._editor.getValue();
  }

  // Update the original textarea
  originalTextarea.value = valueToSync;

  // If original textarea has an editor, update it too
  if (originalTextarea._editor) {
    originalTextarea._editor.setValue(valueToSync);
  }

  // Trigger input event to notify any listeners
  const changeEvent = new Event('input', { bubbles: true });
  originalTextarea.dispatchEvent(changeEvent);
}

/**
 * Initialize code editor in a textarea element
 * Uses requestAnimationFrame for optimal DOM readiness detection
 */
async function initializeCodeEditor(
  textarea: TextAreaWithEditor,
  setCodeEditor: typeof import('../dom').setCodeEditor,
  mode: string,
  theme: string,
  disableWorker: boolean | undefined,
  initialValue: string,
): Promise<void> {
  // Wait for DOM to be ready using requestAnimationFrame instead of setTimeout
  await new Promise((resolve) => requestAnimationFrame(resolve));

  // Initialize the code editor
  setCodeEditor(textarea, mode, theme, disableWorker);

  // Wait for editor initialization and set value
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (textarea._editor) {
    textarea._editor.setValue(initialValue);
    textarea._editor.focus();
  }
}

/**
 * Initialize a regular textarea by focusing and positioning cursor at the end
 */
function initializeRegularTextarea(textarea: HTMLTextAreaElement): void {
  // Use requestAnimationFrame for optimal timing instead of setTimeout
  requestAnimationFrame(() => {
    textarea.focus();
    // Set cursor at the end
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  });
}

/**
 * Handles the expansion of a textarea into a modal dialog
 * Creates modal content, handles code editor initialization, and manages value synchronization
 */
async function handleExpandTextarea(
  originalTextarea: TextAreaWithEditor,
  label: string | undefined,
  code: { mode?: string; theme?: string; disableWorker?: boolean } | undefined,
  attributes: Record<string, string> | undefined,
): Promise<void> {
  // Load required modules
  const { twModalDialog, setCodeEditor } = await getModalImports(!!code);
  const hasCodeEditor = !!code;

  // Create modal content container

  // Create modal textarea
  const modalTextarea = document.createElement('textarea') as TextAreaWithEditor;
  modalTextarea.value = originalTextarea.value;
  modalTextarea.classList.add('form-control', 'h-full');

  // Apply styles based on editor type
  applyTextareaStyles(modalTextarea, hasCodeEditor);

  // Add focus handlers for regular textarea (not needed for code editor)
  if (!hasCodeEditor) {
    modalTextarea.addEventListener('focus', () => {
      modalTextarea.style.borderColor = '#3b82f6';
    });
    modalTextarea.addEventListener('blur', () => {
      modalTextarea.style.borderColor = '#d1d5db';
    });
  }


  // Open modal dialog (content must be HTML string, not element)
  await twModalDialog({
    title: label || 'Edit',
    content: modalTextarea.outerHTML,
    size: {
      width: '80vw',
      height: '80vh',
      maxWidth: '1200px',
      maxHeight: '800px',
    },
    actions: [
      {
        label: 'Done',
        cssClass: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600',
        callback: (dialogElm: HTMLElement) => {
          const modalTextareaInDialog = dialogElm.querySelector('textarea') as TextAreaWithEditor;

          if (modalTextareaInDialog) {
            syncTextareaValues(modalTextareaInDialog, originalTextarea, hasCodeEditor);
          }
        },
      },
    ],
    onLoad: async (dialogElm: HTMLElement) => {
      const modalTextareaInDialog = dialogElm.querySelector('textarea') as TextAreaWithEditor;

      if (!modalTextareaInDialog) {
        return;
      }

      // Set initial value
      modalTextareaInDialog.value = originalTextarea.value;

      // Apply all attributes to the modal textarea
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          modalTextareaInDialog.setAttribute(key, value);
        });
      }

      // Initialize based on editor type
      if (hasCodeEditor && code && setCodeEditor) {
        const mode = code.mode || '';
        const theme = code.theme || 'tomorrow';
        const disableWorker = code.disableWorker;

        await initializeCodeEditor(
          modalTextareaInDialog,
          setCodeEditor,
          mode,
          theme,
          disableWorker,
          originalTextarea.value,
        );
      } else {
        initializeRegularTextarea(modalTextareaInDialog);
      }
    },
  });
}

/**
 * Creates a textarea element with optional expand functionality
 * @param entry - Configuration object for the textarea
 * @param entry.value - Initial value for the textarea
 * @param entry.fieldCls - Additional CSS classes for the textarea
 * @param entry.autoSize - Whether to enable auto-size functionality
 * @param entry.expandable - Whether to show an expand button for modal editing
 * @param entry.label - Label for the modal title
 * @param entry.attributes - Additional attributes for the textarea
 * @param entry.code - Code editor configuration (mode, theme, disableWorker)
 * @returns Object containing the textarea element and optional container wrapper
 */
export const createTextArea = (entry: {
  label?: string;
  value?: string;
  fieldCls?: string;
  autoSize?: boolean;
  expandable?: boolean;
  attributes?: Record<string, string>;
  code?: {
    mode?: string;
    theme?: string;
    disableWorker?: boolean;
  };
}): HTMLTextAreaElement | { textarea: HTMLTextAreaElement; container: HTMLDivElement } => {
  const { value = '', fieldCls = '', autoSize = true, expandable, label, attributes, code } = entry;
  const textarea = document.createElement('textarea');
  textarea.setAttribute('data-role', 'textarea');
  textarea.innerHTML = value;
  textarea.classList.add('form-control');

  if (fieldCls) {
    textarea.setAttribute('data-cls-textarea', fieldCls);
  }

  textarea.setAttribute('data-auto-size', `${autoSize}`);

  // Apply all attributes to the textarea
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      textarea.setAttribute(key, value);
    });
  }

  // If expandable is true, wrap textarea with container and add expand button
  if (expandable) {
    const container = document.createElement('div');
    container.classList.add('relative');
    container.style.position = 'relative';

    // Create expand button with CSS-based hover effects
    const expandButton = createExpandButton();

    // Add click handler to open modal (async handler with error handling)
    expandButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await handleExpandTextarea(textarea, label, code, attributes);
      } catch (error) {
        console.error('Error opening textarea modal:', error);
      }
    });

    container.appendChild(textarea);
    container.appendChild(expandButton);

    return { textarea, container };
  }

  return textarea;
};

export const createButton = (label: string, value: string): HTMLButtonElement => {
  const button = document.createElement('button');
  button.classList.add('button');
  button.innerHTML = label || value;

  return button;
};

export const createColorInput = (value: string): HTMLInputElement => {
  const colorInput = createInput(value);

  colorInput.setAttribute('data-clear-button', 'false');
  colorInput.setAttribute('type', 'text');
  colorInput.classList.add('coloris');

  return colorInput;
};

export function createInfoButton(
  text,
  {
    cls = '',
    clsHint = '',
    position,
    tooltipClasses = '',
    arrowClasses = '',
  }: {
    cls?: string;
    clsHint?: string;
    position?: string;
    tooltipClasses?: string;
    arrowClasses?: string;
  },
  entryIndex = 0,
) {
  // Calculate width based on text length, but allow more space for tooltips with links
  const hasLinks = text.includes('<a ');
  let estimatedWidth = text.length * 2 > 48 ? 48 : text.length * 2;

  // If tooltip contains links, use a more generous width calculation
  if (hasLinks) {
    estimatedWidth = Math.min(60, Math.max(40, text.length * 1.8));
  }
  // TODO: This is a temporary fix to avoid the tooltip being cutoff in the sidebar and showing it on the top.
  // if (entryIndex < 2) {
  //   position = position || 'bottom';
  // }

  // Enforce consistent tooltip placement above to avoid cutoff in the sidebar
  position = 'top';

  // Create a container for the React component
  const tooltipContainer = document.createElement('div');
  tooltipContainer.className = 'inline-block align-middle ' + cls;

  // Create the info icon as a React element
  const iconElement = React.createElement('img', {
    className: 'opacity-80 hover:opacity-100',
    style: {
      width: '16px',
      height: '16px',
    },
    src: '/img/icons/Info.svg',
  });

  // Sanitize the HTML content to prevent XSS attacks
  // DOMPurify's default configuration already allows all safe HTML tags
  // and blocks dangerous elements like <script>, event handlers, etc.
  const sanitizedText = DOMPurify.sanitize(text);

  // Render the Tooltip component
  const root = createRoot(tooltipContainer);
  root.render(
    React.createElement(
      Tooltip,
      {
        content: React.createElement('div', {
          dangerouslySetInnerHTML: { __html: sanitizedText },
        }),
        placement: position as any,
        className:
          clsHint +
          ' whitespace-normal text-xs ' +
          (tooltipClasses || (hasLinks ? `min-w-52 max-w-96` : `w-${estimatedWidth}`)) +
          ' [&_a]:whitespace-nowrap [&_a]:inline-block',
        style: 'dark',
        arrow: true,
      },
      iconElement,
    ),
  );

  // Add cleanup when the button is removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach((node) => {
          // Check if the removed node is our specific info button
          if (node === tooltipContainer || node.contains(tooltipContainer)) {
            root.unmount();
            observer.disconnect();
          }
        });
      }
    });
  });

  // Find the sidebar container and start observing
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    observer.observe(sidebarContainer, {
      childList: true,
      subtree: true, // Enable subtree observation to catch nested removals
    });
  }

  return tooltipContainer;
}

type RangeEntry = {
  name: string;
  min: number;
  max: number;
  value: number;
  step?: number;
};
export function createRangeInput({ name, min, max, value, step }: RangeEntry) {
  // create range input
  const range = document.createElement('input');
  range.type = 'range';

  /* Set step if provided
       We must set the step before setting the value to keep fraction part */
  if (step) {
    range.step = `${step}`;
  }

  range.min = `${min}`;
  range.max = `${max}`;
  range.value = `${value}`; // value must be set after min, mix and step
  range.className = 'form-control w-[75%] h-2 cursor-pointer mx-2 my-3.5 rounded';

  // create number input
  const input = document.createElement('input');
  input.setAttribute('data-role', 'input');
  input.setAttribute('data-clear-button', 'false');
  input.type = 'number';

  /* Set step if provided
       We must set the step before setting the value to keep fraction part */
  if (step) {
    input.step = `${step}`;
  }

  input.min = `${min}`;
  input.max = `${max}`;
  input.value = `${value}`; // value must be set after min, mix and step
  input.setAttribute('data-rel', `#${name}`);
  input.className = 'form-control w-[30%] ml-1 rounded';

  // sync the number input with range
  range.addEventListener('input', (event) => {
    const elm = event.target as HTMLInputElement;

    input.value = elm.value;
  });

  // sync the range with number input
  input.addEventListener('keydown', async (event) => {
    const elm = event.target as HTMLInputElement;

    // Need to a slight delay get the updated value
    await delay(50);

    range.value = elm.value;
  });

  // sync the range with number input
  input.addEventListener('wheel', async (event) => {
    const elm = event.target as HTMLInputElement;

    // Need to a slight delay get the updated value
    await delay(50);

    range.value = elm.value;
  });

  return { rangeInput: range, numberInput: input };
}
/**
 * Creates a toggle switch input element with associated label
 * @param label - The label text for the toggle
 * @param value - The initial checked state of the toggle
 * @param hintOnSelect - Optional hint text to show when toggle is checked
 * @returns HTMLDivElement - The configured toggle input element with hint
 */
export function createToggle(label: string, value: boolean | string, hintOnSelect?: string) {
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';

  if (value) toggle.setAttribute('checked', '');
  else toggle.removeAttribute('checked');

  toggle.className = [
    'relative w-[35px] h-[20px] items-center',
    'bg-[#757575] border-transparent text-transparent rounded-3xl',
    'cursor-pointer transition-colors ease-in-out duration-200',
    'disabled:opacity-50 disabled:pointer-events-none',
    'checked:bg-none checked:text-blue-600 checked:border-blue-600 checked:bg-blue-600',
    'focus:ring-0 focus:ring-offset-0 focus:ring-offset-transparent',
    'before:inline-block before:w-4 before:h-4 before:bg-white',
    'before:rounded-full before:shadow before:transform before:ring-0',
    'before:transition before:ease-in-out before:duration-200 before:mt-[1px]',
    'before:ml-[1px] before:translate-x-px checked:before:translate-x-full',
    'checked:before:bg-blue-200 checked:before:ml-0',
  ].join(' ');

  return toggle;
}

export function createTagInput({ maxTags, value }: { maxTags: number; value: string }) {
  const input = document.createElement('input');
  input.setAttribute('data-role', 'taginput');
  input.setAttribute('data-max-tags', `${maxTags}`);
  input.value = value;

  return input;
}

/**
 * Creates a hint element with sanitized HTML content
 * @param text - The HTML text content to display in the hint
 * @returns HTMLElement - The hint element with sanitized content
 */
export function createHint(text: string) {
  const elm = document.createElement('small');
  elm.classList.add('field-hint');

  // Sanitize the HTML content to prevent XSS attacks
  // DOMPurify's default configuration already allows all safe HTML tags
  // and blocks dangerous elements like <script>, event handlers, etc.
  const sanitizedText = DOMPurify.sanitize(text);

  elm.innerHTML = sanitizedText;

  return elm;
}

type RadioOption = {
  value: string;
  text: string;
  icon?: string;
  captionPosition?: 'left' | 'right';
  classes?: {
    radio?: string;
    caption?: string;
    check?: string;
  };
};
/**
 * Creates a group of radio buttons with Metro UI styling and optional custom icons
 * @param options - Array of radio options with value and text
 * @param value - Currently selected value
 * @param name - Group name to link radio buttons together
 * @returns HTMLDivElement containing the radio buttons
 */
export function createRadio({
  options,
  name,
  value,
  events,
  fieldCls = '',
  readonly = false,
}: {
  options: Array<RadioOption>;
  name: string;
  value: string;
  events: Record<string, Function>;
  fieldCls?: string;
  readonly?: boolean;
}) {
  const container = document.createElement('div');
  container.className = 'radio-container form-control';

  options.forEach((option) => {
    const radio = document.createElement('input');
    radio.setAttribute('data-role', 'radio');
    radio.name = name;
    radio.value = option.value;
    radio.checked = option?.value === value || false;
    if (readonly) radio.disabled = readonly;
    radio.setAttribute('data-caption', option.text);

    if (option.captionPosition) {
      radio.setAttribute('data-caption-position', option.captionPosition);
    }

    // Apply classes with icon-specific modifications
    const classConfigs = {
      'data-cls-radio': (option.classes?.radio || '') + ' ' + fieldCls,
      'data-cls-caption': option.classes?.caption || '',
      'data-cls-check': option.classes?.check || '',
    };

    // Set class attributes if they exist
    for (const [attr, classes] of Object.entries(classConfigs)) {
      if (classes) {
        radio.setAttribute(attr, `${classes}`.trim());
      }
    }

    // Only append if no icon (fixing the logic error in original code)
    container.appendChild(radio);

    // Add events to the radio button
    for (const [type, listener] of Object.entries(events)) {
      radio.addEventListener(type, listener as EventListener);
    }
  });

  return container;
}
