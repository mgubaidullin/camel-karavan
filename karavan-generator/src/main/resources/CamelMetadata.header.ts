/**
 * Generated by karavan build tools - do NOT edit this file!
 */
export class ElementMeta {
    name: string = ''
    className: string = ''
    title: string = ''
    description: string = ''
    labels: string = ''
    properties: PropertyMeta[] = []


    constructor(name: string, className:string, title: string, description: string, labels: string, properties: PropertyMeta[]) {
        this.name = name;
        this.className = className;
        this.title = title;
        this.description = description;
        this.labels = labels;
        this.properties = properties;
    }
}

export class PropertyMeta {
    name: string = ''
    displayName: string = ''
    description: string = ''
    type: string = ''
    enumVals: string = ''
    defaultValue: string = ''
    required: boolean = false
    secret: boolean = false
    isArray: boolean = false
    isObject: boolean = false


    constructor(name: string, displayName: string, description: string, type: string, enumVals: string, defaultValue: string, required: boolean, secret: boolean, isArray: boolean, isObject: boolean) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.type = type;
        this.enumVals = enumVals;
        this.defaultValue = defaultValue;
        this.required = required;
        this.secret = secret;
        this.isArray = isArray;
        this.isObject = isObject;
    }
}

export class CamelMetadataApi {

    static getCamelModelMetadataByName = (name: string): ElementMeta | undefined => {
       return CamelModelMetadata.find(value => value.name === name);
    }

    static getCamelModelMetadataByClassName = (className: string): ElementMeta | undefined => {
        return CamelModelMetadata.find(value => value.className === className);
    }

    static getCamelDataFormatMetadataByName = (name: string): ElementMeta | undefined => {
        return CamelDataFormatMetadata.find(value => value.name === name);
    }

    static getCamelDataFormatMetadataByClassName = (className: string): ElementMeta | undefined => {
        return CamelDataFormatMetadata.find(value => value.className === className);
    }

    static getCamelLanguageMetadataByClassName = (className: string): ElementMeta | undefined => {
        return CamelLanguageMetadata.find(value => value.className === className);
    }

    static getCamelLanguageMetadataByName = (name: string): ElementMeta | undefined => {
        return CamelLanguageMetadata.find(value => value.name === name);
    }

    static getLanguage = (name: string): [string, string, string] | undefined => {
        return Languages.find(value => value[0] === name);
    }

    static hasLanguage = (name: string): boolean | undefined => {
        return Languages.filter(value => value[0] === name).length > 0;
    }
}
