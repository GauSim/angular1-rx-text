import { store, dlFormState } from './services/store';

const template = `

    <dl-sail-select></dl-sail-select>

    <dl-cabinype-select></dl-cabinype-select>

    <dl-sail-select></dl-sail-select>
    
huhu
    <pre>{{ state | json }}</pre>
    <pre>{{ sailSelect | json }}</pre>

`;






interface IdlFormScope extends ng.IScope {
    state: dlFormState;
}

class Controller {

    constructor(private $scope: IdlFormScope,
        private store: store) {
        this.$scope.state = store.getLastState();
        this.store.stream.subscribe({
            next(newState) {
                console.log('dlForm', newState);
                $scope.state = newState;
            },
            error(err) {
                console.error(err)
            },
            complete() {
                console.log("Stream complete")
            },
        });
    }


    dispatchState = () => {
        this.store.dispatchState(this.$scope.state);
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