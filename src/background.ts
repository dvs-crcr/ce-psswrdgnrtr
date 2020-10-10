type BgActionType = 'getOptions' | 'setOptions' | 'generatePassword'
type OptionsType = {
    passLength: number
    isUppercase: boolean
    isLowercase: boolean
    isNumbers: boolean
    isSpecialchars: boolean
    specialchars: string
    uppercase: string
    lowercase: string
    numbers: string
}

const defaultOptions: OptionsType = {
    passLength: 12,
    isUppercase: true,
    isLowercase: true,
    isNumbers: true,
    isSpecialchars: true,
    specialchars: '!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers: '0123456789'
}

new class PWDBG {
    rules: {
        name: keyof OptionsType;
        reg: RegExp;
    }[] = [
		{ name: 'isLowercase', reg: /[a-z]/ },
		{ name: 'isUppercase', reg: /[A-Z]/ },
		{ name: 'isNumbers', reg: /[0-9]/ },
		{ name: 'isSpecialchars', reg: /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/ }
	]
    
    constructor() {
        this.registerMessageListener()
    }

    registerMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (typeof request.action !== 'undefined') {
                switch (request.action as BgActionType) {
                    case 'getOptions':
                        this.getOptions((items: OptionsType) => {
                            sendResponse(items);
                        })
                        break;
                    case 'setOptions':
                        this.setOptions(request.params, (status: boolean) => {
                            sendResponse(status);
                        })
                        break;
                    case 'generatePassword':
                        this.generatePasswordHandler((password: string) => {
                            sendResponse(password);
                        })
                        break;
                    default:
                        break;
                }
            }
            return true
        })
    }

    getOptions = (callback: Function) => chrome.storage.sync.get(defaultOptions, (items) => callback(items))

    setOptions = (params: object, callback: Function): void => chrome.storage.sync.set({ ...params }, () => callback(true))

    generatePasswordHandler = (callback: Function) => {
        this.getOptions((options: OptionsType) => {
            callback(this.generatePassword(options))
        })
    }

    generatePassword = (options: OptionsType) => {
        let pool = (options.isUppercase ? options.uppercase : '')+(options.isLowercase ? options.lowercase : '')+(options.isNumbers ? options.numbers : '')+(options.isSpecialchars ? options.specialchars : '');
        
        let getRandomNumber = (maxLength: number): number => {
            return Math.floor(Math.random() * (maxLength + 1));
        }

        let generate = (options: OptionsType, pool: string): string => {
            let password = ''
            for (let i = 0; i < options.passLength; i++) {
                let randNumber = getRandomNumber((pool.length-1))
                password += pool[randNumber];
            }
            let fitsRules = this.rules.every((rule) => options[rule.name] === false ? true : (rule.name === 'isSpecialchars' && options.specialchars.length === 0 ? true : rule.reg.test(password)))
            return (!fitsRules ? generate(options, pool) : password)
        }

        let password = (pool === '' ? 'lolpassword' : generate(options, pool))
        return password
    }

    
}

