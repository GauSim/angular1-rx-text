import { Store, IPaxSelectItem, ACTIONS } from './services/store';

const template = `
{{ ctrl.isLoading }}
<select class="form-control"
        data-ng-disabled="ctrl.isLoading"
        data-ng-model="ctrl.num_seniors"
        data-ng-options="p.id as p.title for p in ctrl.paxSeniorSelect">
</select>
{{ ctrl.num_seniors | json }}asd
`;


class Controller {

    isLoading: boolean = false;
    num_seniors: number;
    num_adults: number;
    num_junior: number;
    num_child: number;
    num_baby: number;

    paxSeniorSelect: IPaxSelectItem[];
    paxAdultSelect: IPaxSelectItem[];
    paxJuniorSelect: IPaxSelectItem[];
    paxChildSelect: IPaxSelectItem[];
    paxBabySelect: IPaxSelectItem[];

    constructor(store: Store, $scope: ng.IScope) {
        const state = store.getLastState();

        this.num_seniors = state.num_seniors;
        this.paxSeniorSelect = state.paxSeniorSelect;

        this.num_adults = state.num_adults;
        this.paxAdultSelect = state.paxAdultSelect;

        this.num_junior = state.num_junior;
        this.paxJuniorSelect = state.paxJuniorSelect;

        this.num_child = state.num_child;
        this.paxChildSelect = state.paxChildSelect;

        this.num_baby = state.num_baby;
        this.paxBabySelect = state.paxBabySelect;


        store.subscribe(({
            paxSeniorSelect, paxAdultSelect, paxJuniorSelect, paxChildSelect, paxBabySelect,
            num_adults, num_seniors, num_junior, num_child, num_baby }) => {

            this.num_seniors = num_seniors;
            this.paxSeniorSelect = paxSeniorSelect;

            this.num_adults = num_adults;
            this.paxAdultSelect = paxAdultSelect;

            this.num_junior = num_junior;
            this.paxJuniorSelect = paxJuniorSelect;

            this.num_child = num_child;
            this.paxChildSelect = paxChildSelect;

            this.num_baby = num_baby;
            this.paxBabySelect = paxBabySelect;
            debugger;
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

        $scope.$watchGroup(['ctrl.num_adults', 'ctrl.num_seniors', 'ctrl.num_junior', 'ctrl.num_child', 'ctrl.num_baby'], ([num_adults, num_seniors, num_junior, num_child, num_baby]) => {
            console.log();
            store
                .dispatchState({
                    type: ACTIONS.SET_PAX_COUNT,
                    payload: { num_adults, num_seniors, num_junior, num_child, num_baby }
                });

        });
    }
}

export default function dlPaxSelect() {

    const config: ng.IDirective = {
        restrict: 'E',
        template: template,
        controller: Controller,
        controllerAs: 'ctrl',
        scope: {}

    };

    return config;
}