class PWDGEN {
    options: OptionsType | null = null

    constructor() {
        this.localizeApp()
        this.getOptions().then(options => {
            this.options = { ...options }
            this.registerEventListeners()
            this.onGenerateClickHandler()
            this.fillOptions(options)
        })
    }

    /** Localization */
    localizeApp() {
        document.querySelectorAll('[data-locale]').forEach((el) => {
            el.innerHTML = chrome.i18n.getMessage(el.getAttribute('data-locale')!)
        })
    }

    /** Register Event Listeners */
    registerEventListeners() {
        document.getElementById('btnContainer__button')?.addEventListener('click', this.onGenerateClickHandler);
        document.getElementById('passwordField__copy')?.addEventListener('click', this.onCopyClickHandler);
        document.getElementById('optionSelect')?.addEventListener('change', (event) => this.onOptionsChangeHandle({passLength: parseInt((event.target as HTMLSelectElement).value)}))
        document.getElementById('optionUppercase')?.addEventListener('change', (event) => this.onOptionsChangeHandle({isUppercase: (event.target as HTMLInputElement).checked}))
        document.getElementById('optionLowercase')?.addEventListener('change', (event) => this.onOptionsChangeHandle({isLowercase: (event.target as HTMLInputElement).checked}))
        document.getElementById('optionNumbers')?.addEventListener('change', (event) => this.onOptionsChangeHandle({isNumbers: (event.target as HTMLInputElement).checked}))
        document.getElementById('optionSpecialchars')?.addEventListener('change', (event) => this.onOptionsChangeHandle({isSpecialchars: (event.target as HTMLInputElement).checked}))
        document.getElementById('inputSpecialchars')?.addEventListener('keydown', (event) => this.validateHandler(event))
        document.getElementById('inputSpecialchars')?.addEventListener('change', (event) => this.onOptionsChangeHandle({specialchars: (event.target as HTMLInputElement).value}))
    }

    /** Validate specialchars */
    validateHandler(event: KeyboardEvent) {
        let allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'End', 'Home']
        if (!allowedKeys.includes(event.key)) {
            if (/^[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]$/.test(event.key) === false) {
                event.preventDefault()
            }
        }
    }

    /** Handle options change */
    onOptionsChangeHandle = (options: object) => this.bg('setOptions', options).then(() => this.alertText(chrome.i18n.getMessage('appOptionsSaved')))

    /** Fill options with data */
    fillOptions = (options: OptionsType) => {
        document.getElementById('optionSelect')!.innerHTML = this.generateSelect(6, 96, options.passLength);
        (document.getElementById('inputSpecialchars') as HTMLInputElement).value = options.specialchars;
        options.isUppercase ? document.getElementById('optionUppercase')?.setAttribute('checked', 'checked') : null;
        options.isLowercase ? document.getElementById('optionLowercase')?.setAttribute('checked', 'checked') : null;
        options.isNumbers ? document.getElementById('optionNumbers')?.setAttribute('checked', 'checked') : null;
        options.isSpecialchars ? document.getElementById('optionSpecialchars')?.setAttribute('checked', 'checked') : null;
    }

    /** Handle click to GENERATE button */
    onGenerateClickHandler = () => {
        (this.bg('generatePassword') as Promise<string>)
            .then((response: string) => {
                let passwordField = document.getElementById('passwordField__input') as HTMLInputElement;
                passwordField.value = response
            })
    }

    /** Handle click to COPY button */
    onCopyClickHandler = () => {
        let passwordField = document.getElementById('passwordField__input') as HTMLInputElement;
        passwordField.select()
        passwordField.setSelectionRange(0, 99999)
        document.execCommand('copy')
        this.alertText(chrome.i18n.getMessage('appCopied'))
    }

    /** Generate password length selector */
    generateSelect = (start: number, end: number, selected?: number): string => {
        let options = []
        for (let i = start; i <= end; i++) {
            options.push(`<option ${(selected ? (i===selected ? 'selected="selected"' : '') : '')} value="${i}">${i}</option>`)
        }
        return options.join('')
    }

    /** Show text alert */
    alertText = (text: string, duration: number = 1000) => {
        let alertContainer = document.getElementById('alertContainer') as HTMLElement;
        alertContainer.innerHTML = text
        alertContainer.style.top = '0px'
        window.setTimeout(() => alertContainer.style.top = '-31px', duration)
    }

    /** Get sync options from BG */
    getOptions = (): Promise<OptionsType> => this.bg('getOptions') as Promise<OptionsType>

    /** Call background */
    bg(action: BgActionType, params?: object): Promise<OptionsType | string> {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action, params }, function(response) {
                resolve(response);
            });
        })
    }
}


window.onload = () => {
    new PWDGEN()
}