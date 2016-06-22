import { store, dlFormState, ACTIONS } from './services/store';

const template = `
 <select class="form-control"
        title=""
        data-ng-if="state.sailSelect.length"
        data-ng-change="dlCabinypeSelect.setCabinId(state.selectedCabintypeNid)"
        data-ng-model="state.selectedCabintypeNid"
        data-ng-selected="state.selectedCabintypeNid"
        data-ng-options="cabintype.id as cabintype.title for cabintype in state.cabintypeSelect">
</select>
`;






interface IScope extends ng.IScope {
    state: dlFormState;
}

class Controller {

    constructor(private $scope: IScope,
        private store: store) {
        this.$scope.state = store.getLastState();


        this.store.stream.subscribe({
            next(newState) {
                console.log('dlCabinypeSelect', newState);
                $scope.state = newState;
            },
            error(err) {
                console.error(err)
            },
            complete() {
                console.log("Stream complete")
            },
        });
    }


    setCabinId = (id: number) => {
        console.log('hu');
        this.store.dispatchState({
            type: ACTIONS.SET_CABIN_ID,
            payload: id
        });
    }
}

export default function dlCabinypeSelect() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'dlCabinypeSelect',
        scope: null

    };

    return config;
}