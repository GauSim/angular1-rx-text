import 'angular';
import 'angular-translate';

import template from './index.tmpl';
import dlForm from './form.componet';
import dlSailSelect from './dlSailSelect.componet';
import dlCabinypeSelect from './dlCabinypeSelect.componet';
import dlPaxSelect from './dlPaxSelect.componet';
import { Store } from './services/store';

const MAIN_MODULE_NAME = 'requestFrom';

function registerApp() {

    const app = angular.module(MAIN_MODULE_NAME, ['pascalprecht.translate'])
        .directive('dlForm', dlForm)
        .directive('dlSailSelect', dlSailSelect)
        .directive('dlCabinypeSelect', dlCabinypeSelect)
        .directive('dlPaxSelect', dlPaxSelect)
        .service('store', Store)
        .run(() => {
            console.log('running');
        });


}


export function bootstrap() {


    function injectApp() {

        document.body.innerHTML = template;
        angular.bootstrap(document, [MAIN_MODULE_NAME]);
    }

    function onDomReady(fn: () => void) {
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

