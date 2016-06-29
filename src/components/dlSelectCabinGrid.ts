import { Store, ICabinGridSelectViewModel, ACTIONS } from '../services/store';


const template = `

<div class="row">
    <dl-cabin-grid-item
        class="pointer col-md-3"
        data-ng-if="ctrl.cabinGridSelect.inside"
        data-cabin="ctrl.cabinGridSelect.inside"
        data-ng-click="ctrl.onChange(ctrl.cabinGridSelect.inside.id)">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="pointer col-md-3"
        data-ng-if="ctrl.cabinGridSelect.outside"
        data-cabin="ctrl.cabinGridSelect.outside"
        data-ng-click="ctrl.onChange(ctrl.cabinGridSelect.outside.id)">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="pointer col-md-3"
        data-ng-if="ctrl.cabinGridSelect.balcony"
        data-cabin="ctrl.cabinGridSelect.balcony"
        data-ng-click="ctrl.onChange(ctrl.cabinGridSelect.balcony.id)">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="pointer col-md-3"
        data-ng-if="ctrl.cabinGridSelect.suite"
        data-cabin="ctrl.cabinGridSelect.suite"
        data-ng-click="ctrl.onChange(ctrl.cabinGridSelect.suite.id)">
    </dl-cabin-grid-item>
</div>



`;
// <pre>{{ ctrl.cabinGridSelect.inside | json }}</pre>
class Controller implements ng.IComponentController {

    isLoading:boolean;
    cabinGridSelect:ICabinGridSelectViewModel;

    onChange = (payload:number) => {
        this.store
            .dispatchState({
                type: ACTIONS.SET_CABIN_ID,
                payload
            }, 'dlCabinGridSelect');
    };

    public static $inject = [
        'store'
    ];

    constructor(private store:Store) {

        this.isLoading = store.getIsLoading();
        store.isLoading.subscribe(e => (this.isLoading = e));

        store.getLastState().then(state => {
            this.cabinGridSelect = state.cabinGridSelect;
        });

        store.subscribe(({ cabinGridSelect }) => {
            this.cabinGridSelect = cabinGridSelect;
        });
    }
}

const dlSelectCabinGrid:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export {dlSelectCabinGrid};
