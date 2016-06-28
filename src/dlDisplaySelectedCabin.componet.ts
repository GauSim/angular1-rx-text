import { Store, ICabinViewModel, ACTIONS } from './services/store';


const template = `

<pre>{{ ctrl.selectedCabin | json }}</pre>
<h1> huhu </h1>


`;

class Controller implements ng.IComponentController {

    isLoading:boolean;

    selectedCabin:ICabinViewModel;

    constructor(private store:Store, $scope:ng.IScope) {

        this.isLoading = store.getIsLoading();
        store.isLoading.subscribe(e => (this.isLoading = e));


        store.getLastState().then(({selectedCabin}) => {
            this.selectedCabin = selectedCabin;
        });
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

