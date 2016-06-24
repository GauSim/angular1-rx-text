import { Store, ICabinSelectModel, ACTIONS } from './services/store';


const template = `


<h1> huhu </h1>


`;

class Controller implements ng.IComponentController {

    isLoading:boolean = false;

    cabin:ICabinSelectModel;

    constructor(private store:Store, $scope:ng.IScope) {
        const state = store.getLastState();

        store.isLoading.subscribe(e => (this.isLoading = e));

    }
}


const dlDisplaySelectedCabin:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};

export default dlDisplaySelectedCabin;

