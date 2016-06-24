import { Store, ICabinSelectModel, ACTIONS } from './services/store';

const template = `
<span data-ng-show="ctrl.isLoading" class="loadingIndicator"></span>
 <select class="form-control"
        title=""
        data-ng-disabled="ctrl.isLoading"
        data-ng-if="ctrl.cabintypeSelect.length"
        data-ng-model="ctrl.selectedCabintypeNid"
        data-ng-change="ctrl.onChange(ctrl.selectedCabintypeNid)"
        data-ng-options="cabintype.id as cabintype.title group by cabintype.kindName for cabintype in ctrl.cabintypeSelect">
</select>
`;

class Controller implements ng.IComponentController {


    isLoading:boolean = false;
    selectedCabintypeNid:number;
    cabintypeSelect:ICabinSelectModel[];


    onChange = (payload:number) => {
        this.store
            .dispatchState({
                type: ACTIONS.SET_CABIN_ID,
                payload
            }, 'cabinDD');
    };

    constructor(private store:Store) {
        const state = store.getLastState();

        this.selectedCabintypeNid = state.selectedCabintypeNid;
        this.cabintypeSelect = state.cabintypeSelect;

        store.subscribe(({ selectedCabintypeNid, cabintypeSelect}) => {
            this.selectedCabintypeNid = selectedCabintypeNid;
            this.cabintypeSelect = cabintypeSelect;
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

    }
}

const dlCabinSelect:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlCabinSelect;