import 'angular';
import 'angular-translate';


import dlForm from './dlForm.componet';
import dlSailSelect from './dlSailSelect.componet';
import dlCabinSelect from './dlCabinSelect.componet';
import dlPaxSelect from './dlPaxSelect.componet';
import dlPaxAgeInput from './dlPaxAgeInput.componet';
import dlCabinGridSelect from './dlCabinGridSelect.componet'
import dlCabinGridItem from './dlCabinGridItem.componet'

import { Store } from './services/store';

const MAIN_MODULE_NAME = 'requestFrom';

function registerApp() {

    const app = angular.module(MAIN_MODULE_NAME, ['pascalprecht.translate'])
        .component('dlForm', dlForm)
        .component('dlSailSelect', dlSailSelect)
        .component('dlCabinSelect', dlCabinSelect)
        .component('dlPaxSelect', dlPaxSelect)
        .component('dlPaxAgeInput', dlPaxAgeInput)
        .component('dlCabinGridSelect', dlCabinGridSelect)
        .component('dlCabinGridItem', dlCabinGridItem)
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

