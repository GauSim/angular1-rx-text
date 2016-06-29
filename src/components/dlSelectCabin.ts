import { Store, ICabinViewModel, ACTIONS } from '../services/store';

const template = `
<div class="form-group">

    <label class="col-xs-12 col-is-4 col-sm-4 col-lg-3 control-label" data-ng-bind="'cruiseData.cabintype' | translate"></label>

    <div class="col-xs-12 col-is-8 col-sm-8 col-lg-9">
        <span data-ng-show="ctrl.isLoading" class="loadingIndicator"></span>
        <select class="form-control"
                title=""
                data-ng-disabled="ctrl.isLoading"
                data-ng-if="ctrl.cabintypeSelect.length"
                data-ng-model="ctrl.selectedCabinId"
                data-ng-change="ctrl.onChange(ctrl.selectedCabinId)"
                data-ng-options="cabintype.id as cabintype.title group by (cabintype.kindName | translate) for cabintype in ctrl.cabintypeSelect">
        </select>
    </div>
</div>
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

    public static $inject = [
        'store'
    ];

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
export {dlSelectCabin};
