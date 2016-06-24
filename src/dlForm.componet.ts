import { Store, IFormState } from './services/store';

const template = `
    <dl-select-sail></dl-select-sail>

    <dl-select-cabin-grid></dl-select-cabin-grid>

    <dl-select-pax></dl-select-pax>

    <dl-select-cabin></dl-select-cabin>

    <dl-display-selected-cabin></dl-display-selected-cabin>

    <dl-select-sail></dl-select-sail>


`;
// <pre>{{ state | json }}</pre>

interface IdlFormScope extends ng.IScope {
    state: IFormState;
}

class Controller implements ng.IComponentController {

    constructor(private $scope:IdlFormScope,
                private store:Store) {
        this.$scope.state = store.getLastState();
        this.store.subscribe(newState => {
            $scope.state = newState;
        });
    }
}


const dlForm:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlForm;