import { Store, ISailSelectItem, ACTIONS } from './services/store';

const template = `
{{ ctrl.isLoading }}
 <select class="form-control"
        title=""
        data-ng-disabled="ctrl.isLoading"
        data-ng-if="ctrl.sailSelect.length"
        data-ng-model="ctrl.selectedSailId"
        data-ng-options="sail.id as sail.title for sail in ctrl.sailSelect">
</select>
`;


class Controller {

    isLoading: boolean = false;
    selectedSailId: number;
    sailSelect: ISailSelectItem[];

    constructor(store: Store, $scope: ng.IScope) {
        const state = store.getLastState();

        this.selectedSailId = state.selectedSailId;
        this.sailSelect = state.sailSelect;

        store.subscribe(({ selectedSailId, sailSelect}) => {
            this.selectedSailId = selectedSailId;
            this.sailSelect = sailSelect;
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

        $scope.$watch('ctrl.selectedSailId', payload => {
            store
                .dispatchState({
                    type: ACTIONS.SET_SAIL_ID,
                    payload
                });
        });
    }
}

export default function dlSailSelect() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'ctrl',
        scope: {}

    };

    return config;
}