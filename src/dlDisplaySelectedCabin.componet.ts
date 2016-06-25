import { Store, ICabinSelectModel, ACTIONS } from './services/store';


const template = `

<pre>{{ ctrl.selectedCabin | json }}</pre>
<h1> huhu </h1>


`;

class Controller implements ng.IComponentController {

    isLoading:boolean = false;

    selectedCabin:ICabinSelectModel;

    constructor(private store:Store, $scope:ng.IScope) {
        const state = store.getLastState();
        this.selectedCabin = state.selectedCabin;

        store.isLoading.subscribe(e => (this.isLoading = e));
        store.subscribe(({ selectedCabin }) => {
            this.selectedCabin = selectedCabin;
        })

    }
}


const dlDisplaySelectedCabin:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};

export default dlDisplaySelectedCabin;

