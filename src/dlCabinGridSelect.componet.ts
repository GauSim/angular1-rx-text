import { Store, ICabinGridSelectModel, ACTIONS } from './services/store';


const template = `

<div class="row">
    <dl-cabin-grid-item
        class="col-md-3"
        data-ng-if="ctrl.cabinGridSelect.inside"
        data-cabin="ctrl.cabinGridSelect.inside">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="col-md-3"
        data-ng-if="ctrl.cabinGridSelect.outside"
        data-cabin="ctrl.cabinGridSelect.outside">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="col-md-3"
        data-ng-if="ctrl.cabinGridSelect.balcony"
        data-cabin="ctrl.cabinGridSelect.balcony">
    </dl-cabin-grid-item>

    <dl-cabin-grid-item
        class="col-md-3"
        data-ng-if="ctrl.cabinGridSelect.suite"
        data-cabin="ctrl.cabinGridSelect.suite">
    </dl-cabin-grid-item>
</div>



`;
// <pre>{{ ctrl.cabinGridSelect.inside | json }}</pre>
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