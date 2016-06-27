import { Store, IPaxSelection, IPaxSelectModel, ACTIONS } from './services/store';
import { IOperatorPaxAgeConfig } from './services/OperatorService';

const template = `
<dl-pax-age-input
    data-ng-show="ctrl.operatorPaxAgeConfig.senior.isSupported"
    data-field-name="num_seniors"
    data-on-select="ctrl.onSelect(fieldName, value)"
    data-select-options="ctrl.paxSeniorSelect"
    data-selected-Value="ctrl.num_seniors"
    data-pax-age-config="ctrl.operatorPaxAgeConfig.senior">
</dl-pax-age-input>

<dl-pax-age-input
    data-ng-show="ctrl.operatorPaxAgeConfig.adult.isSupported"
    data-field-name="num_adults"
    data-on-select="ctrl.onSelect(fieldName, value)"
    data-select-options="ctrl.paxAdultSelect"
    data-selected-Value="ctrl.num_adults"
    data-pax-age-config="ctrl.operatorPaxAgeConfig.adult">
</dl-pax-age-input>

<dl-pax-age-input
    data-ng-show="ctrl.operatorPaxAgeConfig.junior.isSupported"
    data-field-name="num_junior"
    data-on-select="ctrl.onSelect(fieldName, value)"
    data-select-options="ctrl.paxJuniorSelect"
    data-selected-Value="ctrl.num_junior"
    data-pax-age-config="ctrl.operatorPaxAgeConfig.junior">
</dl-pax-age-input>

<dl-pax-age-input
    data-ng-show="ctrl.operatorPaxAgeConfig.child.isSupported"
    data-field-name="num_child"
    data-on-select="ctrl.onSelect(fieldName, value)"
    data-select-options="ctrl.paxChildSelect"
    data-selected-Value="ctrl.num_child"
    data-pax-age-config="ctrl.operatorPaxAgeConfig.child">
</dl-pax-age-input>

<dl-pax-age-input
    data-ng-show="ctrl.operatorPaxAgeConfig.baby.isSupported"
    data-field-name="num_baby"
    data-on-select="ctrl.onSelect(fieldName, value)"
    data-select-options="ctrl.paxBabySelect"
    data-selected-Value="ctrl.num_baby"
    data-pax-age-config="ctrl.operatorPaxAgeConfig.baby">
</dl-pax-age-input>
`;

class Controller implements ng.IComponentController {

    isLoading:boolean = false;

    operatorPaxAgeConfig:IOperatorPaxAgeConfig;

    num_seniors:number;
    num_adults:number;
    num_junior:number;
    num_child:number;
    num_baby:number;

    paxSeniorSelect:IPaxSelectModel[];
    paxAdultSelect:IPaxSelectModel[];
    paxJuniorSelect:IPaxSelectModel[];
    paxChildSelect:IPaxSelectModel[];
    paxBabySelect:IPaxSelectModel[];

    constructor(private store:Store) {
        const state = store.getLastState();

        const { num_adults, num_seniors, num_junior, num_child, num_baby } = state.selectedPax;
        this.operatorPaxAgeConfig = state.selectedCruise.operatorPaxAgeConfig;

        this.num_seniors = num_seniors;
        this.num_adults = num_adults;
        this.num_junior = num_junior;
        this.num_child = num_child;
        this.num_baby = num_baby;


        this.paxJuniorSelect = [... state.paxSelectRange];
        this.paxSeniorSelect = [... state.paxSelectRange];
        this.paxAdultSelect = [... state.paxSelectRange];
        this.paxChildSelect = [... state.paxSelectRange];
        this.paxBabySelect = [... state.paxSelectRange];


        store.subscribe(({ paxSelectRange, selectedCruise, selectedPax  }) => {

            this.operatorPaxAgeConfig = selectedCruise.operatorPaxAgeConfig;

            const { num_adults, num_seniors, num_junior, num_child, num_baby } = selectedPax;
            this.num_baby = num_baby;
            this.num_child = num_child;
            this.num_junior = num_junior;
            this.num_adults = num_adults;
            this.num_seniors = num_seniors;

            this.paxJuniorSelect = [... paxSelectRange];
            this.paxSeniorSelect = [... paxSelectRange];
            this.paxAdultSelect = [... paxSelectRange];
            this.paxChildSelect = [... paxSelectRange];
            this.paxBabySelect = [... paxSelectRange];
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

    }

    onSelect = (fieldName:string, value:number) => {

        if (!value) {
            return;
        }

        const payload:IPaxSelection = {
            num_seniors: this.num_seniors,
            num_adults: this.num_adults,
            num_junior: this.num_junior,
            num_child: this.num_child,
            num_baby: this.num_baby
        };

        // set value on payload
        payload[fieldName] = value;

        this.store
            .dispatchState({
                type: ACTIONS.SET_PAX_COUNT,
                payload
            }, 'paxDD');
    };

}
const dlSelectPax:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlSelectPax;