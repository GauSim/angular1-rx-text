import 'angular';
import 'angular-translate';


import dlForm from './dlForm.componet';
import dlSelectSail from './dlSelectSail.componet';
import dlSelectCabin from './dlSelectCabin.componet';
import dlSelectPax from './dlSelectPax.componet';
import dlPaxAgeInput from './dlPaxAgeInput.componet';
import dlSelectCabinGrid from './dlSelectCabinGrid.componet';
import dlCabinGridItem from './dlCabinGridItem.componet';
import dlDisplaySelectedCabin from './dlDisplaySelectedCabin.componet'

import { HttpServiceWrapper } from './services/HttpServiceWrapper';
import { FareService } from './services/FareService';
import { ProductApiService } from './services/ProductApiService';
import { OperatorService } from './services/OperatorService';
import { Store } from './services/store';

const MAIN_MODULE_NAME = 'requestFrom';

function registerApp() {

    const app = angular.module(MAIN_MODULE_NAME, ['pascalprecht.translate'])
        .component('dlForm', dlForm)
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
        .run(() => {
            console.log('running');
        });


}


export function bootstrap() {


    function injectApp() {

        document.body.innerHTML = `<div class="container"><dl-form></dl-form><div>`;
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

