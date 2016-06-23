import { Store, ISailSelectItem, ACTIONS } from './services/store';

const template = `
 <select class="form-control"
        title=""
        data-ng-disabled="ctrl.isLoading"
        data-ng-if="ctrl.sailSelect.length"
        data-ng-model="ctrl.selectedSailId"
        data-ng-options="sail.id as sail.title for sail in ctrl.sailSelect">
</select>
`;


class Controller implements ng.IComponentController {

    isLoading:boolean = false;
    selectedSailId:number;
    sailSelect:ISailSelectItem[];

    constructor(store:Store, $scope:ng.IScope) {
        const state = store.getLastState();

        this.selectedSailId = state.selectedSailId;
        this.sailSelect = state.sailSelect;

        store.subscribe(({ selectedSailId, sailSelect}) => {
            this.selectedSailId = selectedSailId;
            this.sailSelect = sailSelect;
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

        $scope.$watch('ctrl.selectedSailId', (payload, last) => {

            if (!payload || payload === last) {
                return;
            }

            store
                .dispatchState({
                    type: ACTIONS.SET_SAIL_ID,
                    payload
                });
        });
    }
}
const dlSailSelect:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlSailSelect;