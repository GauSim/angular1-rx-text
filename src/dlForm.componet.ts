import { Store, IFormState } from './services/store';

const template = `
    <dl-sail-select></dl-sail-select>

    <dl-cabin-grid-select></dl-cabin-grid-select>

    <dl-pax-select></dl-pax-select>

    <dl-cabin-select></dl-cabin-select>

    <dl-sail-select></dl-sail-select>


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