import { Store, IPaxSelectModel, ACTIONS } from './services/store';
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

export interface ISelectPaxModel {
    num_seniors:number;
    num_adults:number;
    num_junior:number;
    num_child:number;
    num_baby:number;
}

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

        this.operatorPaxAgeConfig = state.operatorPaxAgeConfig;

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


        store.subscribe(({ paxSeniorSelect, paxAdultSelect, paxJuniorSelect, paxChildSelect, paxBabySelect,
            operatorPaxAgeConfig,
            num_adults, num_seniors, num_junior, num_child, num_baby }) => {

            this.operatorPaxAgeConfig = operatorPaxAgeConfig;

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

        });

        store.isLoading.subscribe(e => (this.isLoading = e));

    }

    onSelect = (fieldName:string, value:number) => {

        if (!value) {
            return;
        }

        const payload:ISelectPaxModel = {
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
            }), 'paxDD';
    };

}
const dlSelectPax:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlSelectPax;