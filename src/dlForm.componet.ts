import { Store, dlFormState } from './services/store';

const template = `

    <dl-sail-select></dl-sail-select>

    <dl-cabinype-select></dl-cabinype-select>

    <dl-sail-select></dl-sail-select>

    <dl-pax-select></dl-pax-select>
    
huhu
    <pre>{{ state | json }}</pre>
    <pre>{{ sailSelect | json }}</pre>

`;






interface IdlFormScope extends ng.IScope {
    state: dlFormState;
}

class Controller {

    constructor(private $scope: IdlFormScope,
        private store: Store) {
        this.$scope.state = store.getLastState();
        this.store.subscribe(newState => {
            $scope.state = newState;
        });
    }
}

export default function dlForm() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'dlForm',
        scope: null

    };

    return config;
}