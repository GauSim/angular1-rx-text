import { store, dlFormState, ACTIONS } from './services/store';

const template = `
 <select class="form-control"
        title=""
        data-ng-if="state.sailSelect.length"
        data-ng-change="dlSailSelect.setSailId(state.selectedSailId)"
        data-ng-model="state.selectedSailId"
        data-ng-selected="state.selectedSailId"
        data-ng-options="sail.id as sail.title for sail in state.sailSelect">
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
                console.log('dlSailSelect', newState);
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


    setSailId = (id: number) => {
        this.store.dispatchState({
            type: ACTIONS.SET_SAIL_ID,
            payload: id
        });
    }
}

export default function dlSailSelect() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'dlSailSelect',
        scope: null

    };

    return config;
}