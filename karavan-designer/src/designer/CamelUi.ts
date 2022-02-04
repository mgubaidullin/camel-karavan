/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {KameletApi} from "karavan-core/lib/api/KameletApi";
import {KameletModel, Property} from "karavan-core/lib/model/KameletModels";
import {DslMetaModel} from "karavan-core/lib/model/DslMetaModel";
import {ComponentApi} from "karavan-core/lib/api/ComponentApi";
import {ComponentProperty} from "karavan-core/lib/model/ComponentModels";
import {CamelMetadataApi} from "karavan-core/lib/model/CamelMetadata";
import {CamelUtil} from "karavan-core/lib/api/CamelUtil";
import {CamelDefinitionApiExt} from "karavan-core/lib/api/CamelDefinitionApiExt";
import {CamelElement, KameletDefinition, RouteDefinition} from "karavan-core/lib/model/CamelDefinition";

const StepElements: string[] = [
    "AggregateDefinition",
    "ChoiceDefinition",
    "CircuitBreakerDefinition",
    "ConvertBodyDefinition",
    "TryDefinition",
    "EnrichDefinition",
    "FilterDefinition",
    "LogDefinition",
    "LoopDefinition",
    "MarshalDefinition",
    "MulticastDefinition",
    "PollEnrichDefinition",
    "RecipientListDefinition",
    "RemoveHeaderDefinition",
    "RemoveHeadersDefinition",
    "ResequenceDefinition",
    "SagaDefinition",
    "SetBodyDefinition",
    "SetHeaderDefinition",
    "SortDefinition",
    "SplitDefinition",
    "ThreadsDefinition",
    "ThrottleDefinition",
    "ToDynamicDefinition",
    "TransformDefinition",
    "TransactedDefinition",
    "UnmarshalDefinition",
    "ValidateDefinition",
    "WireTapDefinition"
];

const defaultIcon =
    "data:image/svg+xml,%3Csvg viewBox='0 0 130.21 130.01' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='333.48' x2='477' y1='702.6' y2='563.73' gradientTransform='translate(94.038 276.06) scale(.99206)' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23F69923' offset='0'/%3E%3Cstop stop-color='%23F79A23' offset='.11'/%3E%3Cstop stop-color='%23E97826' offset='.945'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' x1='333.48' x2='477' y1='702.6' y2='563.73' gradientTransform='translate(94.038 276.06) scale(.99206)' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23F69923' offset='0'/%3E%3Cstop stop-color='%23F79A23' offset='.08'/%3E%3Cstop stop-color='%23E97826' offset='.419'/%3E%3C/linearGradient%3E%3ClinearGradient id='c' x1='633.55' x2='566.47' y1='814.6' y2='909.12' gradientTransform='translate(-85.421 56.236)' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23f6e423' offset='0'/%3E%3Cstop stop-color='%23F79A23' offset='.412'/%3E%3Cstop stop-color='%23E97826' offset='.733'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cg transform='translate(-437.89 -835.29)'%3E%3Ccircle cx='503.1' cy='900.29' r='62.52' fill='url(%23a)' stroke='url(%23b)' stroke-linejoin='round' stroke-width='4.96'/%3E%3Cpath d='M487.89 873.64a89.53 89.53 0 0 0-2.688.031c-1.043.031-2.445.362-4.062.906 27.309 20.737 37.127 58.146 20.25 90.656.573.015 1.142.063 1.719.063 30.844 0 56.62-21.493 63.28-50.312-19.572-22.943-46.117-41.294-78.5-41.344z' fill='url(%23c)' opacity='.75'/%3E%3Cpath d='M481.14 874.58c-9.068 3.052-26.368 13.802-43 28.156 1.263 34.195 28.961 61.607 63.25 62.5 16.877-32.51 7.06-69.919-20.25-90.656z' fill='%2328170b' opacity='.75'/%3E%3Cpath d='M504.889 862.546c-.472-.032-.932.028-1.375.25-5.6 2.801 0 14 0 14-16.807 14.009-13.236 37.938-32.844 37.938-10.689 0-21.322-12.293-32.531-19.812-.144 1.773-.25 3.564-.25 5.375 0 24.515 13.51 45.863 33.469 57.063 5.583-.703 11.158-2.114 15.344-4.906 21.992-14.662 27.452-42.557 36.438-56.031 5.596-8.407 31.824-7.677 33.594-11.22 2.804-5.601-5.602-14-8.406-14h-22.406c-1.566 0-4.025-2.78-5.594-2.78h-8.406s-3.725-5.65-7.031-5.875z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E";

export class CamelUi {

    static getSelectorModelTypes = (parentDsl: string | undefined, showSteps: boolean = true): string[] => {
        const navs =  CamelUi.getSelectorModelsForParent(parentDsl, showSteps).map(dsl => dsl.navigation.split(","))
            .reduce((accumulator, value) => accumulator.concat(value), [])
            .filter((nav, i, arr) => arr.findIndex(l => l === nav) === i)
            .filter((nav, i, arr) => !['eip', 'dataformat'].includes(nav));
        const connectorNavs = ['routing', "transformation", "error", "configuration", "component", "kamelet"];
        const eipLabels = connectorNavs.filter(n => navs.includes(n));
        return eipLabels;
    }

    static dslHasSteps = (className: string): boolean => {
        return CamelDefinitionApiExt.getElementChildrenDefinition(className).filter(c => c.name === 'steps').length === 1;
    }

    static getSelectorModelsForParentFiltered = (parentDsl: string | undefined, navigation: string,  showSteps: boolean = true): DslMetaModel[] => {
        return CamelUi.getSelectorModelsForParent(parentDsl, showSteps)
            .filter(dsl => dsl.navigation.includes(navigation));
    }

    static getSelectorModelsForParent = (parentDsl: string | undefined, showSteps: boolean = true): DslMetaModel[] => {
        const result: DslMetaModel[] = [];
        if (!parentDsl){
            result.push(...CamelUi.getComponentsDslMetaModel("consumer"));
            result.push(...CamelUi.getKameletDslMetaModel("source"));
        } else {
            if (showSteps) {
                if (parentDsl && CamelDefinitionApiExt.getElementChildrenDefinition(parentDsl).filter(child => child.name === 'steps').length > 0) {
                    StepElements.forEach(se => {
                        result.push(CamelUi.getDslMetaModel(se));
                    })
                }
                result.push(...CamelUi.getComponentsDslMetaModel("producer"));
                result.push(...CamelUi.getKameletDslMetaModel("action"));
                result.push(...CamelUi.getKameletDslMetaModel("sink"));
            } else {
                const children = CamelDefinitionApiExt.getElementChildrenDefinition(parentDsl).filter(child => child.name !== 'steps')
                children.filter(child => {
                    const cc = CamelDefinitionApiExt.getElementChildrenDefinition(child.className);
                    return child.name === 'steps' || cc.filter(c => c.multiple).length > 0;
                })
                    .forEach(child => result.push(CamelUi.getDslMetaModel(child.className)));
            }
        }
        return result.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
    }

    static getDslMetaModel = (className: string): DslMetaModel => {
        const el = CamelMetadataApi.getCamelModelMetadataByClassName(className);
        return  new DslMetaModel({dsl: className, title: el?.title, description: el?.description, labels: el?.labels, navigation: el?.labels, type: "DSL"})
    }

    static getComponentsDslMetaModel = (type: 'consumer' | "producer"): DslMetaModel[] => {
        return ComponentApi.getComponents().filter((c) => type === 'consumer' ? !c.component.producerOnly : !c.component.consumerOnly)
            .map((c) =>
                new DslMetaModel({
                    dsl: type === 'consumer' ? "FromDefinition" : "ToDefinition",
                    uri: c.component.name,
                    navigation: "component",
                    labels: c.component.label,
                    type: type === 'consumer' ? 'consumer' : 'producer',
                    title: c.component.title,
                    description: c.component.description,
                    version: c.component.version,
                }));
    }

    static getKameletDslMetaModel = (type: 'source' | "sink" | "action"): DslMetaModel[] => {
        return KameletApi.getKamelets().filter((k) => k.metadata.labels["camel.apache.org/kamelet.type"] === type)
            .map((k) =>
                    new DslMetaModel({
                        dsl: type === 'source' ? "FromDefinition" : "KameletDefinition",
                        uri: "kamelet:" + k.metadata.name,
                        labels: k.type(),
                        navigation: "kamelet",
                        type: k.type(),
                        name: k.metadata.name,
                        title: k.title(),
                        description: k.title(),
                        version: k.version(),
                    })
            );
    }

    static nameFromTitle = (title: string): string => {
        return title.replace(/[^a-z0-9+]+/gi, "-").toLowerCase();
    }

    static titleFromName = (name?: string) => {
        return name
            ? name
                .replace(".yaml", "")
                .split("-")
                .map((value) => CamelUtil.capitalizeName(value))
                .reduce(
                    (previousValue, currentValue) => previousValue + " " + currentValue
                )
            : name;
    }

    static isKameletComponent = (element: CamelElement | undefined): boolean => {
        if (element?.dslName === 'KameletDefinition') {
            return true;
        } else if (element && ["FromDefinition", "ToDefinition"].includes(element.dslName)) {
            const uri: string = (element as any).uri;
            return uri !== undefined && uri.startsWith("kamelet:");
        } else {
            return false;
        }
    }

    static getKamelet = (element: CamelElement): KameletModel | undefined => {
        if (element.dslName === 'KameletDefinition') {
            return KameletApi.findKameletByName((element as KameletDefinition).name || '');
        } else if (["FromDefinition", "FromDefinition", "ToDefinition"].includes(element.dslName)) {
            const uri: string = (element as any).uri;
            const k =
                uri !== undefined ? KameletApi.findKameletByUri(uri) : undefined;
            return k;
        } else {
            return undefined;
        }
    }

    static getKameletProperties = (element: any): Property[] => {
        const kamelet = CamelUi.getKamelet(element)
        return kamelet
            ? KameletApi.getKameletProperties(kamelet?.metadata.name)
            : [];
    }

    static getComponentProperties = (element: any, advanced: boolean): ComponentProperty[] => {
        const dslName: string = (element as any).dslName;
       if (dslName === 'ToDynamicDefinition'){
           const component = ComponentApi.findByName(dslName);
           return component ? ComponentApi.getComponentProperties(component?.component.name,'producer', advanced) : [];
       } else {
           const uri: string = (element as any).uri;
           const name = ComponentApi.getComponentNameFromUri(uri);
           if (name){
               const component = ComponentApi.findByName(name);
               return component ? ComponentApi.getComponentProperties(component?.component.name, element.dslName === 'FromDefinition' ? 'consumer' : 'producer', advanced) : [];
           } else {
               return [];
           }
       }
    }

    static getTitle = (element: CamelElement): string => {
        const k: KameletModel | undefined = CamelUi.getKamelet(element);
        if (k) {
            return k.title();
        } else if (element.dslName === 'RouteDefinition') {
            const routeId = (element as RouteDefinition).id
            return routeId ? routeId : CamelUtil.capitalizeName((element as any).stepName);
        } else {
            const uri: string = (element as any).uri;
            return uri
                ? "" + ComponentApi.getComponentNameFromUri(uri)
                : CamelUtil.capitalizeName((element as any).stepName);
        }
    }

    static isShowExpressionTooltip = (element: CamelElement): boolean => {
        if (element.hasOwnProperty("expression")){
            const exp = CamelDefinitionApiExt.getExpressionValue((element as any).expression);
            return (exp !== undefined && (exp as any)?.expression?.trim().length > 0);
        }
        return false;
    }

    static isShowUriTooltip = (element: CamelElement): boolean => {
        const uri: string = (element as any).uri;
        return uri !== undefined && !uri.startsWith("kamelet");
    }

    static getExpressionTooltip = (element: CamelElement): string => {
        const e = (element as any).expression;
        const language = CamelDefinitionApiExt.getExpressionLanguageName(e) || '';
        const value = CamelDefinitionApiExt.getExpressionValue(e) || '';
        return language.concat(": ", (value as any)?.expression);
    }

    static getUriTooltip = (element: CamelElement): string => {
        return (element as any).uri;
    }

    static getKameletIconByUri = (uri: string | undefined): string => {
        return uri ? KameletApi.findKameletByUri(uri)?.icon() || "" : "";
    }

    static getKameletIconByName = (name: string | undefined): string => {
        return name ? KameletApi.findKameletByName(name)?.icon() || "" : "";
    }

    static getIconForName = (dslName: string): string => {
        switch (dslName) {
            case "FilterDefinition":
                return "data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='filter' class='svg-inline--fa fa-filter fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z'%3E%3C/path%3E%3C/svg%3E";
            case "OtherwiseDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Crect x='12' y='24' width='9' height='2'/%3E%3Crect x='13' y='28' width='6' height='2'/%3E%3Cpath d='M8.7832,18.9746l1.4177-1.418A6.9206,6.9206,0,0,1,8,12,7.99,7.99,0,0,1,21.5273,6.2305l1.4136-1.4136A9.9884,9.9884,0,0,0,6,12,8.9411,8.9411,0,0,0,8.7832,18.9746Z' transform='translate(0 0)'/%3E%3Cpath d='M30,3.4141,28.5859,2,2,28.5859,3.4141,30,23.6606,9.7534A7.7069,7.7069,0,0,1,24,12a7.2032,7.2032,0,0,1-2.8223,6.1426C20.1069,19.1348,19,20.1611,19,22h2c0-.9194.5264-1.45,1.5352-2.3857A9.193,9.193,0,0,0,26,12a9.8739,9.8739,0,0,0-.7764-3.81Z' transform='translate(0 0)'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "ChoiceDefinition":
                return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16px' height='16px' viewBox='0 0 16 16' fill='currentColor' class='bi bi-signpost-split-fill'%3E%3Cpath d='M7 16h2V6h5a1 1 0 0 0 .8-.4l.975-1.3a.5.5 0 0 0 0-.6L14.8 2.4A1 1 0 0 0 14 2H9v-.586a1 1 0 0 0-2 0V7H2a1 1 0 0 0-.8.4L.225 8.7a.5.5 0 0 0 0 .6l.975 1.3a1 1 0 0 0 .8.4h5v5z'/%3E%3C/svg%3E";
            case "WhenDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Eidea%3C/title%3E%3Crect x='11' y='24' width='10' height='2'/%3E%3Crect x='13' y='28' width='6' height='2'/%3E%3Cpath d='M16,2A10,10,0,0,0,6,12a9.19,9.19,0,0,0,3.46,7.62c1,.93,1.54,1.46,1.54,2.38h2c0-1.84-1.11-2.87-2.19-3.86A7.2,7.2,0,0,1,8,12a8,8,0,0,1,16,0,7.2,7.2,0,0,1-2.82,6.14c-1.07,1-2.18,2-2.18,3.86h2c0-.92.53-1.45,1.54-2.39A9.18,9.18,0,0,0,26,12,10,10,0,0,0,16,2Z' transform='translate(0 0)'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "AggregateDefinition":
                return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='512px' height='640px' viewBox='0 0 512 640' enable-background='new 0 0 512 640' xml:space='preserve'%3E%3Cimage id='image0' width='512' height='640' x='0' y='0' href='data:image/png;base64,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%0AAABJRU5ErkJggg==' /%3E%3C/svg%3E";
            case "SplitDefinition":
                return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='512px' height='640px' viewBox='0 0 512 640' enable-background='new 0 0 512 640' xml:space='preserve'%3E%3Cimage id='image0' width='512' height='640' x='0' y='0' href='data:image/png;base64,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' /%3E%3C/svg%3E%0A";
            case "SortDefinition":
                return "data:image/svg+xml,%0A%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='sort-amount-down' class='svg-inline--fa fa-sort-amount-down fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M304 416h-64a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-128-64h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.37 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352zm256-192H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-64 128H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM496 32H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h256a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z'%3E%3C/path%3E%3C/svg%3E";
            case "ResequenceDefinition":
                return "data:image/svg+xml,%0A%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='sort-numeric-down' class='svg-inline--fa fa-sort-numeric-down fa-w-14' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='currentColor' d='M304 96h16v64h-16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h96a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16h-16V48a16 16 0 0 0-16-16h-48a16 16 0 0 0-14.29 8.83l-16 32A16 16 0 0 0 304 96zm26.15 162.91a79 79 0 0 0-55 54.17c-14.25 51.05 21.21 97.77 68.85 102.53a84.07 84.07 0 0 1-20.85 12.91c-7.57 3.4-10.8 12.47-8.18 20.34l9.9 20c2.87 8.63 12.53 13.49 20.9 9.91 58-24.76 86.25-61.61 86.25-132V336c-.02-51.21-48.4-91.34-101.85-77.09zM352 356a20 20 0 1 1 20-20 20 20 0 0 1-20 20zm-176-4h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.36 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352z'%3E%3C/path%3E%3C/svg%3E";
            case "RecipientListDefinition":
                return "data:image/svg+xml,%0A%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='list-ul' class='svg-inline--fa fa-list-ul fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z'%3E%3C/path%3E%3C/svg%3E";
            case "LoopDefinition":
                return "data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 20.298 20.298' style='enable-background:new 0 0 20.298 20.298;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath style='fill:%23030104;' d='M0.952,11.102c0-0.264,0.213-0.474,0.475-0.474h2.421c0.262,0,0.475,0.21,0.475,0.474 c0,3.211,2.615,5.826,5.827,5.826s5.827-2.615,5.827-5.826c0-3.214-2.614-5.826-5.827-5.826c-0.34,0-0.68,0.028-1.016,0.089 v1.647c0,0.193-0.116,0.367-0.291,0.439C8.662,7.524,8.46,7.482,8.322,7.347L3.49,4.074c-0.184-0.185-0.184-0.482,0-0.667 l4.833-3.268c0.136-0.136,0.338-0.176,0.519-0.104c0.175,0.074,0.291,0.246,0.291,0.438V1.96c0.34-0.038,0.68-0.057,1.016-0.057 c5.071,0,9.198,4.127,9.198,9.198c0,5.07-4.127,9.197-9.198,9.197C5.079,20.299,0.952,16.172,0.952,11.102z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A";
            case "MulticastDefinition":
                return "data:image/svg+xml,%3Csvg width='433' height='366' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' enable-background='new 0 0 378.06 378.06' version='1.1' xml:space='preserve'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cg id='svg_1'%3E%3Cpolygon id='svg_4' points='222.36802673339844,225.9189910888672 107.00502014160156,225.9189910888672 107.00502014160156,284.5920104980469 222.36802673339844,284.5920104980469 222.36802673339844,324.656005859375 328.9830322265625,255.2550048828125 222.36802673339844,185.85398864746094 ' transform='matrix(1 0 0 1 0 0) rotate(90 217.994 255.255)'/%3E%3Cpath d='m216.99403,1.999c-36.158,0 -65.575,29.417 -65.575,65.575s29.417,65.575 65.575,65.575s65.575,-29.417 65.575,-65.575s-29.417,-65.575 -65.575,-65.575z' id='svg_5' transform='rotate(90 216.994 67.574)'/%3E%3Cpolygon id='svg_21' points='97.9406967163086,220.90044021606445 179.5146484375,139.32643508911133 138.02651977539062,97.83834457397461 56.45258331298828,179.4123420715332 28.123058319091797,151.08284378051758 1.8088525533676147,275.54492568969727 126.27093505859375,249.23065567016602 ' x='1'/%3E%3Cpolygon id='svg_22' points='351.2789611816406,220.90043258666992 432.8529052734375,139.3264274597168 391.3647766113281,97.83834457397461 309.79083251953125,179.41233444213867 281.4613037109375,151.08283615112305 255.1470947265625,275.5449333190918 379.60919189453125,249.23066329956055 ' transform='rotate(-90 344 186.692)' x='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
            case "TryDefinition":
                return "data:image/svg+xml,%3Csvg width='160' height='412' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' enable-background='new 0 0 436.346 436.346' version='1.1' xml:space='preserve'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cg id='svg_1'%3E%3Cpolygon id='svg_2' points='0,133.14898681640625 80.10099792480469,256.20098876953125 160.2010040283203,133.14898681640625 113.96000671386719,133.14898681640625 113.96000671386719,0 46.24101257324219,0 46.24101257324219,133.14898681640625 '/%3E%3Cpath d='m4.415506,336.53999c0,41.733 33.952,75.685 75.685,75.685s75.685,-33.952 75.685,-75.685c0,-41.732 -33.952,-75.685 -75.685,-75.685s-75.685,33.952 -75.685,75.685z' id='svg_3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
            case "CatchDefinition":
                return "data:image/svg+xml,%3Csvg width='232' height='477' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' enable-background='new 0 0 476.457 476.457' version='1.1' xml:space='preserve'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cg id='svg_1' transform='rotate(-90 117.228 239.228)'%3E%3Cpath d='m188.688,232.118c-33.574,0 -60.888,27.314 -60.888,60.889c0,33.573 27.314,60.888 60.888,60.888s60.888,-27.314 60.888,-60.888c0,-33.575 -27.314,-60.889 -60.888,-60.889z' id='svg_2'/%3E%3Cpath d='m188.688,124.562c-73.415,0 -135.898,47.686 -158.112,113.709l-44.847,0l0,-40.108l-106.729,69.475l106.729,69.475l0,-40.108l102.149,0l-0.65,-3.248l0,-2.426c0,-55.945 45.515,-101.461 101.46,-101.461s101.46,45.516 101.46,101.461l0,5l65.308,0l0,-5c0.001,-91.956 -74.811,-166.769 -166.768,-166.769z' id='svg_3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
            case "FinallyDefinition":
                return "data:image/svg+xml,%3Csvg width='161' height='423' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' enable-background='new 0 0 436.346 436.346' version='1.1' xml:space='preserve'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cg id='svg_1'%3E%3Cpolygon id='svg_2' points='0.9282517433166504,300.3690004348755 81.02924966812134,423.4210023880005 161.1292634010315,300.3690004348755 114.88825845718384,300.3690004348755 114.88825845718384,167.22001361846924 47.16926431655884,167.22001361846924 47.16926431655884,300.3690004348755 '/%3E%3Cpath d='m5.343757,79.428759c0,41.733 33.952,75.685 75.685,75.685s75.685,-33.952 75.685,-75.685c0,-41.732 -33.952,-75.685 -75.685,-75.685s-75.685,33.952 -75.685,75.685z' id='svg_3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
            case "LogDefinition":
                return "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%0A%3E%3Cpath d='M8.01562 6.98193C7.46334 6.98193 7.01562 7.43285 7.01562 7.98513C7.01562 8.53742 7.46334 8.98833 8.01563 8.98833H15.9659C16.5182 8.98833 16.9659 8.53742 16.9659 7.98513C16.9659 7.43285 16.5182 6.98193 15.9659 6.98193H8.01562Z' fill='currentColor' /%3E%3Cpath d='M7.01562 12C7.01562 11.4477 7.46334 10.9968 8.01562 10.9968H15.9659C16.5182 10.9968 16.9659 11.4477 16.9659 12C16.9659 12.5523 16.5182 13.0032 15.9659 13.0032H8.01563C7.46334 13.0032 7.01562 12.5523 7.01562 12Z' fill='currentColor' /%3E%3Cpath d='M8.0249 15.0122C7.47262 15.0122 7.0249 15.4631 7.0249 16.0154C7.0249 16.5677 7.47262 17.0186 8.0249 17.0186H15.9752C16.5275 17.0186 16.9752 16.5677 16.9752 16.0154C16.9752 15.4631 16.5275 15.0122 15.9752 15.0122H8.0249Z' fill='currentColor' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6C5 5.44772 5.44772 5 6 5Z' fill='currentColor' /%3E%3C/svg%3E";
            case "CircuitBreakerDefinition":
                return "data:image/svg+xml,%3Csvg width='298' height='298' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' enable-background='new 0 0 298 298' version='1.1'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cg id='svg_1'%3E%3Cpath d='m169.34692,382.94627l0,-107.7738c18.40098,-6.01731 31.65307,-22.53006 31.65307,-41.92199c0,-24.464 -21.08286,-44.36477 -47.00001,-44.36477c-25.91715,0 -47.00001,19.90077 -47.00001,44.36477c0,19.39193 13.25208,35.90468 31.65307,41.92199l0,107.7738l30.69388,0zm-15.34694,-134.30393c-8.99139,0 -16.30612,-6.90642 -16.30612,-15.39186c0,-8.48725 7.31474,-15.39186 16.30612,-15.39186c8.98947,0 16.30612,6.90461 16.30612,15.39186c0,8.48544 -7.31474,15.39186 -16.30612,15.39186z' id='svg_2' transform='matrix(1 0 0 1 0 0)'/%3E%3Cpath d='m236.4675,151.78407l-146.76987,-143.80258c3.01675,-6.04977 4.7139,-12.84128 4.7139,-20.01581c0,-20.00834 -13.173,-37.04598 -31.46417,-43.25456l0,-112.44392l-30.51071,0l0,112.44392c-18.29117,6.20858 -31.46417,23.24622 -31.46417,43.25456c0,25.24163 20.95705,45.77499 46.71953,45.77499c7.32448,0 14.25613,-1.66471 20.43264,-4.6186l146.76797,143.80072l21.57489,-21.1387zm-188.7774,-179.69951c8.93582,0 16.20882,7.12408 16.20882,15.88112s-7.27299,15.88112 -16.20882,15.88112c-8.93773,0 -16.20882,-7.12408 -16.20882,-15.88112s7.27299,-15.88112 16.20882,-15.88112z' id='svg_3' transform='rotate(-134 118.72 2.59498)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
            case "OnFallbackDefinition":
                return "data:image/svg+xml,%3Csvg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.2685 11.3076C14.9169 11.0248 14.5923 10.7795 14.2848 10.5693C13.3451 9.92712 12.672 9.68977 12 9.68977C11.328 9.68977 10.6549 9.92712 9.71521 10.5693C8.75213 11.2275 7.62138 12.2301 6.02073 13.6529L3.66436 15.7474C3.25158 16.1143 2.61951 16.0771 2.25259 15.6644C1.88567 15.2516 1.92285 14.6195 2.33564 14.2526L4.74407 12.1118C6.28074 10.7458 7.50586 9.65678 8.58672 8.91809C9.70321 8.15504 10.771 7.68977 12 7.68977C13.229 7.68977 14.2968 8.15504 15.4133 8.91809C15.8434 9.21204 16.2963 9.56146 16.7827 9.96172L15.2685 11.3076Z' fill='black'/%3E%3Cpath d='M18.3151 13.9514L20.3356 15.7474C20.7484 16.1143 21.3805 16.0771 21.7474 15.6644C22.1143 15.2516 22.0771 14.6195 21.6644 14.2526L19.8203 12.6134L18.3151 13.9514Z' fill='black'/%3E%3Cpath d='M5.6224 9.99307L3.66436 8.25259C3.25158 7.88567 2.61951 7.92285 2.25259 8.33564C1.88567 8.74842 1.92285 9.38049 2.33564 9.74741L4.1172 11.331L5.6224 9.99307Z' fill='black'/%3E%3Cpath d='M7.15251 13.9848C7.6635 14.4075 8.13756 14.7749 8.58672 15.0819C9.70321 15.845 10.771 16.3102 12 16.3102C13.229 16.3102 14.2968 15.845 15.4133 15.0819C16.4941 14.3432 17.7193 13.2542 19.2559 11.8882L21.6644 9.74741C22.0771 9.38049 22.1143 8.74842 21.7474 8.33564C21.3805 7.92285 20.7484 7.88567 20.3356 8.25259L17.9793 10.3471C16.3786 11.7699 15.2479 12.7725 14.2848 13.4307C13.3451 14.0729 12.672 14.3102 12 14.3102C11.328 14.3102 10.6549 14.0729 9.71521 13.4307C9.38867 13.2075 9.04286 12.9448 8.66599 12.6395L7.15251 13.9848Z' fill='black'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M21.7474 8.33564C22.1143 8.74842 22.0771 9.38049 21.6644 9.74741L19.2559 11.8882C17.7193 13.2542 16.4941 14.3432 15.4133 15.0819C14.2968 15.845 13.229 16.3102 12 16.3102C10.9247 16.3102 9.97074 15.9539 8.99698 15.3497C8.52769 15.0585 8.38332 14.442 8.6745 13.9728C8.96569 13.5035 9.58218 13.3591 10.0515 13.6503C10.8187 14.1264 11.4086 14.3102 12 14.3102C12.672 14.3102 13.3451 14.0729 14.2848 13.4307C15.2479 12.7725 16.3786 11.7699 17.9793 10.3471L20.3356 8.25259C20.7484 7.88567 21.3805 7.92285 21.7474 8.33564Z' fill='black'/%3E%3C/svg%3E%0A";
            case "ThreadsDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='256px' height='256px' viewBox='0 0 256 256' id='Flat' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30.62988,79.49609a11.99872,11.99872,0,0,1,1.874-16.86621c1.23242-.98633,12.56543-9.7666,30.58593-14.27148,16.94727-4.2334,43.1211-5.30762,71.56641,13.65722,40.23389,26.82129,73.51563.87891,73.84766.61426a11.9996,11.9996,0,0,1,14.99218,18.74024c-1.23242.98633-12.56543,9.7666-30.58593,14.27148a85.50742,85.50742,0,0,1-20.71485,2.56152c-14.69531.001-32.28808-3.84277-50.85156-16.21874-40.23389-26.82227-73.51563-.87891-73.84766-.61426A11.9974,11.9974,0,0,1,30.62988,79.49609Zm177.874,39.13379c-.332.26563-33.61377,26.20606-73.84766-.61426C106.21094,99.05176,80.03711,100.125,63.08984,104.3584c-18.0205,4.50488-29.35351,13.28515-30.58593,14.27148a11.9996,11.9996,0,1,0,14.99218,18.74024c.332-.26563,33.61377-26.20606,73.84766.61426,18.56348,12.376,36.15625,16.21972,50.85156,16.21874a85.50742,85.50742,0,0,0,20.71485-2.56152c18.0205-4.50488,29.35351-13.28515,30.58593-14.27148a11.9996,11.9996,0,0,0-14.99218-18.74024Zm0,56c-.332.26465-33.61377,26.208-73.84766-.61426C106.21094,155.05176,80.03711,156.125,63.08984,160.3584c-18.0205,4.50488-29.35351,13.28515-30.58593,14.27148a11.9996,11.9996,0,1,0,14.99218,18.74024c.332-.26465,33.61377-26.20606,73.84766.61426,18.56348,12.376,36.15625,16.21972,50.85156,16.21874a85.50742,85.50742,0,0,0,20.71485-2.56152c18.0205-4.50488,29.35351-13.28515,30.58593-14.27148a11.9996,11.9996,0,1,0-14.99218-18.74024Z'/%3E%3C/svg%3E%0A";
            case "ThrottleDefinition":
                return "data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 360 360' style='enable-background:new 0 0 360 360;' xml:space='preserve'%3E%3Cg id='XMLID_12_'%3E%3Cpath id='XMLID_13_' d='M102.342,246.475C99.541,242.42,94.928,240,90,240s-9.541,2.42-12.342,6.475 c-0.32,0.463-7.925,11.497-15.633,24.785C46.765,297.566,45,308.822,45,315c0,24.813,20.187,45,45,45s45-20.187,45-45 c0-6.178-1.765-17.434-17.025-43.74C110.267,257.972,102.662,246.938,102.342,246.475z'/%3E%3Cpath id='XMLID_14_' d='M300,60h-60h-15V30h15c8.284,0,15-6.716,15-15s-6.716-15-15-15h-60c-8.284,0-15,6.716-15,15s6.716,15,15,15 h15v30h-15h-60c-41.355,0-75,33.645-75,75v60c0,8.284,6.716,15,15,15h60c8.284,0,15-6.716,15-15v-45h45h60h60 c8.284,0,15-6.716,15-15V75C315,66.716,308.284,60,300,60z'/%3E%3C/g%3E%3C/svg%3E%0A";
            case "WireTapDefinition":
                return "data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m8,8c1.86658,0 3.4346,1.27853 3.8759,3.0076l0.06156,-0.00568l0,0l3.06254,-0.00192c0.5523,0 1,0.4477 1,1c0,0.5523 -0.4477,1 -1,1l-3,0c-0.042,0 -0.0834,-0.0026 -0.1241,-0.0076c-0.4413,1.7291 -2.00932,3.0076 -3.8759,3.0076c-1.86658,0 -3.43455,-1.2785 -3.87594,-3.0076c-0.04064,0.005 -0.08205,0.0076 -0.12406,0.0076l-3,0c-0.55229,0 -1,-0.4477 -1,-1c0,-0.5523 0.44771,-1 1,-1l3,0c0.04201,0 0.08342,0.0026 0.12406,0.0076c0.44139,-1.72907 2.00936,-3.0076 3.87594,-3.0076zm0,2c-1.10457,0 -2,0.8954 -2,2c0,1.1046 0.89543,2 2,2c1.10457,0 2,-0.8954 2,-2c0,-1.1046 -0.89543,-2 -2,-2zm0,-10c0.55228,0 1,0.44771 1,1l0,2.06274c1.2966,0.16336 2.539,0.64271 3.6148,1.40246c0.1917,0.13536 0.3826,0.3857 0.3826,0.5348l0.0026,2c0,0.55228 -0.4477,1 -1,1c-0.5523,0 -1,-0.44772 -1,-1l0,-1.19616c-0.9097,-0.52524 -1.94454,-0.80409 -3.00141,-0.80384c-1.05592,0.00025 -2.08969,0.27908 -2.99859,0.80384l0,1.19616c0,0.55228 -0.44772,1 -1,1c-0.55228,0 -1,-0.44772 -1,-1l0.00048,-2c-0.00048,-0.15411 0.19076,-0.39769 0.38165,-0.53263c1.07652,-0.76099 2.31996,-1.24111 3.61787,-1.40463l0,-2.06274c0,-0.55229 0.44772,-1 1,-1z' fill='%23000000' id='svg_1' transform='rotate(180 8,8)'/%3E%3C/g%3E%3C/svg%3E";
            case "ToDynamicDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M28.5039,8.1362l-12-7a1,1,0,0,0-1.0078,0l-12,7A1,1,0,0,0,3,9V23a1,1,0,0,0,.4961.8638l12,7a1,1,0,0,0,1.0078,0l12-7A1,1,0,0,0,29,23V9A1,1,0,0,0,28.5039,8.1362ZM16,3.1577,26.0156,9,16,14.8423,5.9844,9ZM5,10.7412l10,5.833V28.2588L5,22.4258ZM17,28.2588V16.5742l10-5.833V22.4258Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E%0A";
            case "RemoveHeaderDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m24,30l-20,0a2.0021,2.0021 0 0 1 -2,-2l0,-6a2.0021,2.0021 0 0 1 2,-2l20,0a2.0021,2.0021 0 0 1 2,2l0,6a2.0021,2.0021 0 0 1 -2,2zm-20,-8l-0.0015,0l0.0015,6l20,0l0,-6l-20,0z' id='svg_1'/%3E%3Cpolygon id='svg_2' points='32.009655237197876,7.0889304876327515 32.009655237197876,5.094889521598816 26.932628870010376,5.094889521598816 26.932628870010376,0.017862439155578613 24.938587427139282,0.017862558364868164 24.938587427139282,5.094889521598816 19.861561059951782,5.094889521598816 19.861561059951782,7.0889304876327515 24.938587427139282,7.0889304876327515 24.938587427139282,12.165956854820251 26.932628870010376,12.165956854820251 26.932628870010376,7.0889304876327515 32.009655237197876,7.0889304876327515 ' transform='rotate(-45 25.9356 6.09191)'/%3E%3Cpath d='m4,14l0,-6l14,0l0,-2l-14,0a2.0023,2.0023 0 0 0 -2,2l0,6a2.0023,2.0023 0 0 0 2,2l22,0l0,-2l-22,0z' id='svg_3' transform='matrix(1 0 0 1 0 0)'/%3E%3C/g%3E%3C/svg%3E";
            case "RemoveHeadersDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpolygon id='svg_2' points='32.12467002868652,6.015733242034912 32.12467002868652,4.021692276000977 27.047643661499023,4.021692276000977 27.047643661499023,-1.0553351640701294 25.05360221862793,-1.0553350448608398 25.05360221862793,4.021692276000977 19.97657585144043,4.021692276000977 19.97657585144043,6.015733242034912 25.05360221862793,6.015733242034912 25.05360221862793,11.092759132385254 27.047643661499023,11.092759132385254 27.047643661499023,6.015733242034912 32.12467002868652,6.015733242034912 ' transform='rotate(-45 26.0506 5.01871)'/%3E%3Cpath d='m3.94496,12.89928l0,-6l14,0l0,-2l-14,0a2.0023,2.0023 0 0 0 -2,2l0,6a2.0023,2.0023 0 0 0 2,2l22,0l0,-2l-22,0z' id='svg_3' transform='matrix(1 0 0 1 0 0)'/%3E%3Cpolygon id='svg_5' points='31.050630569458008,18.505210876464844 29.6406307220459,17.095211029052734 26.05063247680664,20.685209274291992 22.46063232421875,17.0952091217041 21.05063247680664,18.50520896911621 24.64063262939453,22.0952091217041 21.05063247680664,25.685209274291992 22.46063232421875,27.0952091217041 26.05063247680664,23.50520896911621 29.64063262939453,27.0952091217041 31.05063247680664,25.685209274291992 27.46063232421875,22.0952091217041 31.050630569458008,18.505210876464844 '/%3E%3Cpath d='m3.94496,30.0033l0,-6l14,0l0,-2l-14,0a2.0023,2.0023 0 0 0 -2,2l0,6a2.0023,2.0023 0 0 0 2,2l22,0l0,-2l-22,0z' id='svg_4' transform='matrix(1 0 0 1 0 0)'/%3E%3C/g%3E%3C/svg%3E";
            case "SetHeaderDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m24,30l-20,0a2.0021,2.0021 0 0 1 -2,-2l0,-6a2.0021,2.0021 0 0 1 2,-2l20,0a2.0021,2.0021 0 0 1 2,2l0,6a2.0021,2.0021 0 0 1 -2,2zm-20,-8l-0.0015,0l0.0015,6l20,0l0,-6l-20,0z' id='svg_1'/%3E%3Cpolygon id='svg_2' points='32.009655237197876,7.0889304876327515 32.009655237197876,5.094889521598816 26.932628870010376,5.094889521598816 26.932628870010376,0.017862439155578613 24.938587427139282,0.017862558364868164 24.938587427139282,5.094889521598816 19.861561059951782,5.094889521598816 19.861561059951782,7.0889304876327515 24.938587427139282,7.0889304876327515 24.938587427139282,12.165956854820251 26.932628870010376,12.165956854820251 26.932628870010376,7.0889304876327515 32.009655237197876,7.0889304876327515 '/%3E%3Cpath d='m4,14l0,-6l14,0l0,-2l-14,0a2.0023,2.0023 0 0 0 -2,2l0,6a2.0023,2.0023 0 0 0 2,2l22,0l0,-2l-22,0z' id='svg_3' transform='matrix(1 0 0 1 0 0)'/%3E%3C/g%3E%3C/svg%3E";
            case "SetBodyDefinition":
                return "data:image/svg+xml,%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpolygon points='30 24 26 24 26 20 24 20 24 24 20 24 20 26 24 26 24 30 26 30 26 26 30 26 30 24'/%3E%3Cpath d='M16,28H8V4h8v6a2.0058,2.0058,0,0,0,2,2h6v4h2V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,18,2H8A2.0058,2.0058,0,0,0,6,4V28a2.0058,2.0058,0,0,0,2,2h8ZM18,4.4,23.6,10H18Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "MarshalDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Edocument--export%3C/title%3E%3Cpolygon points='13 21 26.17 21 23.59 23.59 25 25 30 20 25 15 23.59 16.41 26.17 19 13 19 13 21'/%3E%3Cpath d='M22,14V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,14,2H4A2,2,0,0,0,2,4V28a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V26H20v2H4V4h8v6a2,2,0,0,0,2,2h6v2Zm-8-4V4.41L19.59,10Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "UnmarshalDefinition":
                return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32px' height='32px' viewBox='0 0 32 32' id='icon'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Edocument--import%3C/title%3E%3Cpolygon points='28 19 14.83 19 17.41 16.41 16 15 11 20 16 25 17.41 23.59 14.83 21 28 21 28 19'/%3E%3Cpath d='M24,14V10a1,1,0,0,0-.29-.71l-7-7A1,1,0,0,0,16,2H6A2,2,0,0,0,4,4V28a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V26H22v2H6V4h8v6a2,2,0,0,0,2,2h6v2Zm-8-4V4.41L21.59,10Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "ValidateDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m16,28l-8,0l0,-24l8,0l0,6a2.0058,2.0058 0 0 0 2,2l6,0l0,4l2,0l0,-6a0.9092,0.9092 0 0 0 -0.3,-0.7l-7,-7a0.9087,0.9087 0 0 0 -0.7,-0.3l-10,0a2.0058,2.0058 0 0 0 -2,2l0,24a2.0058,2.0058 0 0 0 2,2l8,0l0,-2zm2,-23.6l5.6,5.6l-5.6,0l0,-5.6z' id='svg_2'/%3E%3Cpolygon id='svg_9' points='22.35245457291603,27.113018035888672 19.76245442032814,24.52301788330078 18.35245457291603,25.933019638061523 22.35245457291603,29.933019638061523 30.35245457291603,21.93301773071289 28.942456632852554,20.52301788330078 22.35245457291603,27.113018035888672 ' y='0'/%3E%3C/g%3E%3C/svg%3E";
            case "ConvertBodyDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m16,28l-8,0l0,-24l8,0l0,6a2.0058,2.0058 0 0 0 2,2l6,0l0,4l2,0l0,-6a0.9092,0.9092 0 0 0 -0.3,-0.7l-7,-7a0.9087,0.9087 0 0 0 -0.7,-0.3l-10,0a2.0058,2.0058 0 0 0 -2,2l0,24a2.0058,2.0058 0 0 0 2,2l8,0l0,-2zm2,-23.6l5.6,5.6l-5.6,0l0,-5.6z' id='svg_2'/%3E%3Cpath d='m18.93145,19l0,2.4131a6.996,6.996 0 1 1 6,10.5869l0,-2a5,5 0 1 0 -4.5762,-7l2.5762,0l0,2l-6,0l0,-6l2,0z' id='svg_1' xmlns='http://www.w3.org/2000/svg'/%3E%3C/g%3E%3C/svg%3E";
            case "TransformDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Escript%3C/title%3E%3Cpolygon points='18.83 26 21.41 23.42 20 22 16 26 20 30 21.42 28.59 18.83 26'/%3E%3Cpolygon points='27.17 26 24.59 28.58 26 30 30 26 26 22 24.58 23.41 27.17 26'/%3E%3Cpath d='M14,28H8V4h8v6a2.0058,2.0058,0,0,0,2,2h6v6h2V10a.9092.9092,0,0,0-.3-.7l-7-7A.9087.9087,0,0,0,18,2H8A2.0058,2.0058,0,0,0,6,4V28a2.0058,2.0058,0,0,0,2,2h6ZM18,4.4,23.6,10H18Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "EnrichDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpolygon id='svg_1' points='4,20 4,22 8.586000442504883,22 2,28.586000442504883 3.4140000343322754,30 10,23.413999557495117 10,28 12,28 12,20 4,20 '/%3E%3Cpath d='m25.7,9.3l-7,-7a0.9087,0.9087 0 0 0 -0.7,-0.3l-10,0a2.0058,2.0058 0 0 0 -2,2l0,12l2,0l0,-12l8,0l0,6a2.0058,2.0058 0 0 0 2,2l6,0l0,6l2,0l0,-8a0.9092,0.9092 0 0 0 -0.3,-0.7zm-7.7,0.7l0,-5.6l5.6,5.6l-5.6,0z' id='svg_4'/%3E%3Cpath d='m27.28825,30l-7.5,0a4,4 0 0 1 0,-8l0.0835,0a4.7864,4.7864 0 0 1 3.9165,-2a4.9816,4.9816 0 0 1 4.6543,3.2034a3.4667,3.4667 0 0 1 2.3457,3.2966a3.5041,3.5041 0 0 1 -3.5,3.5zm-7.5,-6a2,2 0 0 0 0,4l7.5,0a1.5017,1.5017 0 0 0 1.5,-1.5a1.4855,1.4855 0 0 0 -1.2778,-1.4739l-0.6612,-0.0991l-0.1616,-0.6487a2.9568,2.9568 0 0 0 -5.4873,-0.7121l-0.2978,0.4338l-1.1143,0z' id='svg_5'/%3E%3C/g%3E%3C/svg%3E";
            case "PollEnrichDefinition":
                return "data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1 %7B fill: none; %7D%3C/style%3E%3C/defs%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpolygon id='svg_1' points='4,20 4,22 8.586000442504883,22 2,28.586000442504883 3.4140000343322754,30 10,23.413999557495117 10,28 12,28 12,20 4,20 '/%3E%3Cpath d='m25.7,9.3l-7,-7a0.9087,0.9087 0 0 0 -0.7,-0.3l-10,0a2.0058,2.0058 0 0 0 -2,2l0,12l2,0l0,-12l8,0l0,6a2.0058,2.0058 0 0 0 2,2l6,0l0,6l2,0l0,-8a0.9092,0.9092 0 0 0 -0.3,-0.7zm-7.7,0.7l0,-5.6l5.6,5.6l-5.6,0z' id='svg_4'/%3E%3Cpath d='m27.28825,30l-7.5,0a4,4 0 0 1 0,-8l0.0835,0a4.7864,4.7864 0 0 1 3.9165,-2a4.9816,4.9816 0 0 1 4.6543,3.2034a3.4667,3.4667 0 0 1 2.3457,3.2966a3.5041,3.5041 0 0 1 -3.5,3.5zm-7.5,-6a2,2 0 0 0 0,4l7.5,0a1.5017,1.5017 0 0 0 1.5,-1.5a1.4855,1.4855 0 0 0 -1.2778,-1.4739l-0.6612,-0.0991l-0.1616,-0.6487a2.9568,2.9568 0 0 0 -5.4873,-0.7121l-0.2978,0.4338l-1.1143,0z' id='svg_5'/%3E%3C/g%3E%3C/svg%3E";
            case "TransactedDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='24px' height='24px' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23000' stroke-width='2' d='M2,7 L20,7 M16,2 L21,7 L16,12 M22,17 L4,17 M8,12 L3,17 L8,22'/%3E%3C/svg%3E%0A";
            case "SagaDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:none;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Eexpand-categories%3C/title%3E%3Crect x='20' y='26' width='6' height='2'/%3E%3Crect x='20' y='18' width='8' height='2'/%3E%3Crect x='20' y='10' width='10' height='2'/%3E%3Crect x='15' y='4' width='2' height='24'/%3E%3Cpolygon points='10.586 3.959 7 7.249 3.412 3.958 2 5.373 7 10 12 5.373 10.586 3.959'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E";
            case "FromDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='24px' height='24px' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M15.8198039,12 L21.2037682,12 L12,22.5185923 L2.79623177,12 L8.1801961,12 L10.1801961,2 L13.8198039,2 L15.8198039,12 Z M12,19.4814077 L16.7962318,14 L14.1801961,14 L12.1801961,4 L11.8198039,4 L9.8198039,14 L7.20376823,14 L12,19.4814077 Z'/%3E%3C/svg%3E";
            case "ToDefinition":
                return "data:image/svg+xml,%0A%3Csvg width='32px' height='32px' viewBox='0 0 32 32' id='icon' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M28.5039,8.1362l-12-7a1,1,0,0,0-1.0078,0l-12,7A1,1,0,0,0,3,9V23a1,1,0,0,0,.4961.8638l12,7a1,1,0,0,0,1.0078,0l12-7A1,1,0,0,0,29,23V9A1,1,0,0,0,28.5039,8.1362ZM16,3.1577,26.0156,9,16,14.8423,5.9844,9ZM5,10.7412l10,5.833V28.2588L5,22.4258ZM17,28.2588V16.5742l10-5.833V22.4258Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E%0A";
            case "KameletDefinition":
                return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Capa_1' x='0px' y='0px' width='235.506px' height='235.506px' viewBox='0 0 235.506 235.506' style='enable-background:new 0 0 235.506 235.506;' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M234.099,29.368c-3.025-4.861-10.303-7.123-22.915-7.123c-13.492,0-28.304,2.661-28.625,2.733 c-20.453,2.098-27.254,26.675-32.736,46.436c-1.924,6.969-3.755,13.549-5.827,17.655c-3.157,6.242-5.064,6.915-5.057,6.955 c-0.598-0.205-5.759-3.005-10.527-37.884l-0.169-1.28c-2.934-20.845-16.198-22.62-33.163,0.713 c-4.429,6.083-6.705,6.398-7.127,6.398c-1.861,0-4.426-5.37-5.661-7.943c-1.176-2.457-2.19-4.597-3.53-6.015 c-5.482-5.811-11.175-8.754-16.905-8.754c-39.417,0-59.655,148.039-61.821,164.917c-0.15,1.135,0.194,2.284,0.95,3.138 c0.739,0.866,1.821,1.379,2.968,1.411l19.376,0.421c0.024,0,0.054,0,0.084,0c0.054-0.017,0.15,0,0.196,0 c2.246,0,4.052-1.808,4.052-4.056c0-0.445-0.068-0.866-0.203-1.274c0.046-6.36,1.222-37.104,19.266-55.688 c1.763-1.799,3.963-2.974,5.955-4.44c-1.881,17.726-5.22,55.968,0.082,65.121c0.728,1.258,2.062,2.04,3.499,2.04h15.567 c1.1,0,2.15-0.461,2.914-1.242c0.763-0.798,1.162-1.855,1.124-2.962c-1.14-30.957,0.593-66.451,5.282-72.599 c8.41-0.477,17.428,0.061,27.609,2.577c13.049,3.186,29.286,7.173,23.881,70.037c-0.104,1.118,0.276,2.225,1.038,3.066 c0.757,0.837,1.807,1.318,2.941,1.334l17.264,0.2c0.016,0,0.032,0,0.048,0c0.076-0.016,0.152-0.016,0.192,0 c2.244,0,4.056-1.807,4.056-4.063c0-0.505-0.108-1.01-0.293-1.471c-0.488-8.279-3.214-55.122-3.065-65.196 c0.024-1.764,0.421-5.839,3.562-5.839c1.066,0,2.156,0.488,2.869,1.254c0.657,0.722,0.95,1.644,0.85,2.701 c-0.797,9.001-0.344,23.026,0.093,36.584c0.36,11.605,0.713,22.537,0.328,30.096c-0.052,1.134,0.353,2.224,1.15,3.037 c0.798,0.814,1.888,1.379,2.997,1.211l16.01-0.429c1.194-0.032,2.316-0.598,3.074-1.535c0.737-0.934,1.025-2.16,0.773-3.342 c-7.422-34.897,4.809-119.518,7.213-135.325c18.522-5.504,34.829-19.618,40.251-30.689 C236.491,35.113,235.44,31.502,234.099,29.368z M67.652,204.745h-8.636c-2.435-9.782-0.23-42.021,2.384-64.399 c3.464-1.526,6.995-2.945,10.95-3.734C66.965,152.897,67.165,188.106,67.652,204.745z M226.709,36.682 c-4.769,9.752-21.02,22.979-37.55,27.123c-1.571,0.385-2.757,1.673-3.021,3.274c-0.642,3.949-14.88,93.798-8.384,136.092 l-7.017,0.185c0.132-7.373-0.16-16.667-0.481-26.4c-0.425-13.333-0.845-27.127-0.116-35.618c0.301-3.326-0.757-6.473-2.953-8.877 c-6.107-6.672-20.27-5.186-20.482,9.935c-0.132,9.565,2.124,49.323,2.914,62.696l-8.604-0.092 c4.04-54.754-8.127-68.815-30.35-74.258c-11.503-2.806-21.752-3.311-31.31-2.604c-0.046-0.017-0.084,0-0.148,0 c-15.411,1.134-28.519,6.255-38.347,16.39c-18.338,18.92-21.103,47.621-21.47,58.433l-10.772-0.232 c8.33-61.161,29.447-153.395,53.216-153.395c3.423,0,7.138,2.086,11.021,6.218c0.471,0.495,1.429,2.486,2.12,3.939 c2.529,5.306,5.991,12.543,12.956,12.543c4.488,0,8.832-3.098,13.657-9.726c9.563-13.154,14.21-13.533,14.711-13.533 c1.304,0,3.025,2.843,3.911,9.191l0.172,1.25c4.366,31.873,9.691,44.863,18.448,44.863h0.008c5.903,0,9.874-6.49,12.343-11.373 c2.453-4.831,4.376-11.784,6.416-19.153c4.817-17.373,10.796-39.012,26.068-40.587c0.152-0.034,14.731-2.649,27.491-2.649 c13.593,0,15.845,2.979,16.054,3.324C227.707,34.382,227.126,35.856,226.709,36.682z'/%3E%3C/g%3E%3C/svg%3E";
            default:
                return defaultIcon;
        }
    }

    static getIcon = (element: CamelElement): string => {
        const k: KameletModel | undefined = CamelUi.getKamelet(element);
        if (["FromDefinition", "KameletDefinition"].includes(element.dslName)) {
            return k ? k.icon() : defaultIcon;
        } else {
            return CamelUi.getIconForName(element.dslName);
        }
    }

    static getIconForComponentLabel = (dslName: string): string => {
        switch (dslName) {
            case "messaging":
                return "data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='filter' class='svg-inline--fa fa-filter fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z'%3E%3C/path%3E%3C/svg%3E";
            default:
                return defaultIcon;
        }
    }

}
