import { Store, IPaxSelection, IPaxSelectViewModel, ITranslationCache, ACTIONS } from '../services/store';
import { IOperatorPaxAgeConfig } from '../services/OperatorService';

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

    isLoading:boolean;

    operatorPaxAgeConfig:IOperatorPaxAgeConfig;

    num_seniors:number;
    num_adults:number;
    num_junior:number;
    num_child:number;
    num_baby:number;

    paxSeniorSelect:IPaxSelectViewModel[];
    paxAdultSelect:IPaxSelectViewModel[];
    paxJuniorSelect:IPaxSelectViewModel[];
    paxChildSelect:IPaxSelectViewModel[];
    paxBabySelect:IPaxSelectViewModel[];

    public static $inject = [
        'store'
    ];

    constructor(private store:Store) {
        this.isLoading = store.getIsLoading();

        store.getLastState().then(state => {
            const { num_adults, num_seniors, num_junior, num_child, num_baby } = state.selectedPax;
            this.operatorPaxAgeConfig = state.configuration.operatorPaxAgeConfig;

            this.num_seniors = num_seniors;
            this.num_adults = num_adults;
            this.num_junior = num_junior;
            this.num_child = num_child;
            this.num_baby = num_baby;


            this.paxJuniorSelect = state.paxSelectRange.map(e => this._map(state.translationCache, e, 'junior', 'juniors'));
            this.paxSeniorSelect = state.paxSelectRange.map(e => this._map(state.translationCache, e, 'senior', 'seniors'));
            this.paxAdultSelect = state.paxSelectRange.map(e => this._map(state.translationCache, e, 'adult', 'adults'));
            this.paxChildSelect = state.paxSelectRange.map(e => this._map(state.translationCache, e, 'child', 'children'));
            this.paxBabySelect = state.paxSelectRange.map(e => this._map(state.translationCache, e, 'baby', 'babies'));
        });

        store.subscribe(({ paxSelectRange, configuration, selectedPax, translationCache  }) => {

            this.operatorPaxAgeConfig = configuration.operatorPaxAgeConfig;

            const { num_adults, num_seniors, num_junior, num_child, num_baby } = selectedPax;
            this.num_baby = num_baby;
            this.num_child = num_child;
            this.num_junior = num_junior;
            this.num_adults = num_adults;
            this.num_seniors = num_seniors;

            this.paxJuniorSelect = paxSelectRange.map(e => this._map(translationCache, e, 'junior', 'juniors'));
            this.paxSeniorSelect = paxSelectRange.map(e => this._map(translationCache, e, 'senior', 'seniors'));
            this.paxAdultSelect = paxSelectRange.map(e => this._map(translationCache, e, 'adult', 'adults'));
            this.paxChildSelect = paxSelectRange.map(e => this._map(translationCache, e, 'child', 'children'));
            this.paxBabySelect = paxSelectRange.map(e => this._map(translationCache, e, 'baby', 'babies'));
        });

        store.isLoading.subscribe(e => (this.isLoading = e));

    }

    _map = (t:ITranslationCache, item:IPaxSelectViewModel, singular:string, plural:string):IPaxSelectViewModel => {
        const text = item.id === 1 ? (t[singular] || singular) : (t[plural] || plural);
        return _.extend({}, item, {title: `${item.id} ${text}`});
    };

    onSelect = (fieldName:string, value:number) => {

        if (value === undefined) {
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
export {dlSelectPax};
