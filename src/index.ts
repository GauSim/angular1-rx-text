import 'angular';
import 'angular-translate';


import dlIndex from './componets/dlIndex.componet';
import dlSelectSail from './componets/dlSelectSail.componet';
import dlSelectCabin from './componets/dlSelectCabin.componet';
import dlSelectPax from './componets/dlSelectPax.componet';
import dlPaxAgeInput from './componets/dlPaxAgeInput.componet';
import dlSelectCabinGrid from './componets/dlSelectCabinGrid.componet';
import dlCabinGridItem from './componets/dlCabinGridItem.componet';
import dlDisplaySelectedCabin from './componets/dlDisplaySelectedCabin.componet'

import { TrustHtml} from './filters/TrustHtml';
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
        .filter('trustHtml', TrustHtml)
        .run(() => {
            console.log('running');
        });


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

