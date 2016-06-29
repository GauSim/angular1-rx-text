import 'angular';
import 'angular-translate';


import {dlIndex} from './components/dlIndex';
import {dlSelectSail} from './components/dlSelectSail';
import {dlSelectCabin} from './components/dlSelectCabin';
import {dlSelectPax} from './components/dlSelectPax';
import {dlPaxAgeInput} from './components/dlPaxAgeInput';
import {dlSelectCabinGrid} from './components/dlSelectCabinGrid';
import {dlCabinGridItem} from './components/dlCabinGridItem';
import {dlDisplaySelectedCabin} from './components/dlDisplaySelectedCabin';

import { TrustHtml } from './filters/TrustHtml';
import { HttpServiceWrapper } from './services/HttpServiceWrapper';
import { FareService } from './services/FareService';
import { ProductApiService } from './services/ProductApiService';
import { OperatorService } from './services/OperatorService';
import { Store } from './services/store';


const MAIN_MODULE_NAME = 'requestFrom';

function registerApp() {

    const app = angular.module(MAIN_MODULE_NAME, ['pascalprecht.translate'])
        .component('dlIndex', dlIndex)
        .component('dlSelectSail', dlSelectSail)
        .component('dlSelectCabin', dlSelectCabin)
        .component('dlSelectPax', dlSelectPax)
        .component('dlPaxAgeInput', dlPaxAgeInput)
        .component('dlSelectCabinGrid', dlSelectCabinGrid)
        .component('dlCabinGridItem', dlCabinGridItem)
        .component('dlDisplaySelectedCabin', dlDisplaySelectedCabin)
        .service('httpServiceWrapper', HttpServiceWrapper)
        .service('fareService', FareService)
        .service('productApiService', ProductApiService)
        .service('operatorService', OperatorService)
        .service('store', Store)
        .filter('trustHtml', TrustHtml);
}


export function bootstrap() {


    function injectApp() {

        document.body.innerHTML = `<div class="container"><dl-Index></dl-Index><div>`;
        angular.bootstrap(document, [MAIN_MODULE_NAME]);
    }

    function onDomReady(fn:() => void) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    registerApp();


    onDomReady(injectApp);
}


bootstrap();

