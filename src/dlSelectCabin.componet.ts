import { Store, ICabinViewModel, ACTIONS } from './services/store';

const template = `
<span data-ng-show="ctrl.isLoading" class="loadingIndicator"></span>
 <select class="form-control"
        title=""
        data-ng-disabled="ctrl.isLoading"
        data-ng-if="ctrl.cabintypeSelect.length"
        data-ng-model="ctrl.selectedCabinId"
        data-ng-change="ctrl.onChange(ctrl.selectedCabinId)"
        data-ng-options="cabintype.id as cabintype.title group by cabintype.kindName for cabintype in ctrl.cabintypeSelect">
</select>
`;

class Controller implements ng.IComponentController {


    isLoading:boolean;
    selectedCabinId:string;
    cabintypeSelect:ICabinViewModel[];


    onChange = (payload:number) => {
        this.store
            .dispatchState({
                type: ACTIONS.SET_CABIN_ID,
                payload
            }, 'cabinDD');
    };

    constructor(private store:Store) {
        this.isLoading = store.getIsLoading();
        store.isLoading.subscribe(e => (this.isLoading = e));

        store.getLastState().then(state => {
            this.selectedCabinId = state.selectedCabinId;
            this.cabintypeSelect = state.cabintypeSelect;
        });
        store.subscribe(({ selectedCabinId, cabintypeSelect}) => {
            this.selectedCabinId = selectedCabinId;
            this.cabintypeSelect = cabintypeSelect;
        });


    }
}

const dlSelectCabin:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlSelectCabin;