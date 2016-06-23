import { Store, ICabinGridSelectModel, ACTIONS } from './services/store';


const template = `
 <pre>{{ ctrl.cabinGridSelect | json }}</pre>
`;

class Controller implements ng.IComponentController {

    isLoading:boolean = false;
    cabinGridSelect:ICabinGridSelectModel;

    onChange = (payload:number) => {

    };

    constructor(private store:Store, $scope:ng.IScope) {
        const state = store.getLastState();

        this.cabinGridSelect = state.cabinGridSelect;

        store.isLoading.subscribe(e => (this.isLoading = e));

        store.subscribe(({ cabinGridSelect })=> {
            this.cabinGridSelect = cabinGridSelect;
        })
    }
}

const dlCabinGridSelect:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlCabinGridSelect;