import { Store, ICabintypeSelectItem, ACTIONS } from './services/store';

const template = `

{{ ctrl.isLoading }}
 <select class="form-control"
        title=""
        data-ng-disabled="ctrl.isLoading"
        data-ng-if="ctrl.cabintypeSelect.length"
        data-ng-model="ctrl.selectedCabintypeNid"
        data-ng-options="cabintype.id as cabintype.title group by cabintype.type for cabintype in ctrl.cabintypeSelect">
</select>
`;

class Controller {


    isLoading: boolean = false;
    selectedCabintypeNid: number;
    cabintypeSelect: ICabintypeSelectItem[];

    constructor(store: Store, $scope: ng.IScope) {
        const state = store.getLastState();

        this.selectedCabintypeNid = state.selectedCabintypeNid;
        this.cabintypeSelect = state.cabintypeSelect;

        store.subscribe(({ selectedCabintypeNid, cabintypeSelect}) => {
            this.selectedCabintypeNid = selectedCabintypeNid;
            this.cabintypeSelect = cabintypeSelect;
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

        $scope.$watch('ctrl.selectedCabintypeNid', payload => {
            store
                .dispatchState({
                    type: ACTIONS.SET_CABIN_ID,
                    payload
                })
        })
    }
}

export default function dlCabinypeSelect() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'ctrl',
        scope: {}

    };

    return config;
}