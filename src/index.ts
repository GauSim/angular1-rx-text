import 'angular';
import 'angular-translate';


import dlForm from './dlForm.componet';
import dlSailSelect from './dlSailSelect.componet';
import dlCabinypeSelect from './dlCabinypeSelect.componet';
import dlPaxSelect from './dlPaxSelect.componet';
import dlPaxAgeInput from './dlPaxAgeInput.componet';
import { Store } from './services/store';

const MAIN_MODULE_NAME = 'requestFrom';

function registerApp() {

    const app = angular.module(MAIN_MODULE_NAME, ['pascalprecht.translate'])
        .component('dlForm', dlForm)
        .component('dlSailSelect', dlSailSelect)
        .component('dlCabinypeSelect', dlCabinypeSelect)
        .component('dlPaxSelect', dlPaxSelect)
        .component('dlPaxAgeInput', dlPaxAgeInput)
        .service('store', Store)
        .run(() => {
            console.log('running');
        });


}


export function bootstrap() {


    function injectApp() {

        document.body.innerHTML = `<div><dl-form></dl-form><div>`;
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

