import { Store, IPaxSelectItem } from './services/store';
import { AGE_MAX } from './services/OperatorService';

const template = `
<div>
    <div>  (<span data-ng-if="(ctrl.paxAgeConfig.max === ctrl.AGE_MAX)">+</span>{{ ctrl.paxAgeConfig.min }}<span data-ng-if="(ctrl.paxAgeConfig.max !== ctrl.AGE_MAX)"> - {{ ctrl.paxAgeConfig.max }}</span>)</div>
    <select class="form-control"
            data-ng-disabled="ctrl.isLoading"
            data-ng-model="ctrl.selectedValue"
            data-ng-options="p.id as p.title for p in ctrl.selectOptions">
    </select>
</div>
`;

class Controller implements ng.IComponentController {
    AGE_MAX:number = AGE_MAX;
    isLoading:boolean;
    fieldName:string;
    selectOptions:IPaxSelectItem[];
    selectedValue:number;
    onSelect:(s:{fieldName:string, value:number})=>void;


    constructor(private $scope:ng.IScope, private store:Store) {

        store.isLoading.subscribe(e => (this.isLoading = e));

        store.subscribe(state => {
            // map updates from the store back to this Component
            this.selectedValue = state[this.fieldName]
        });

        $scope.$watch('ctrl.selectedValue', (value:number, last) => {
            if (!value || value === last) {
                return;
            }
            // commit value changes to parent
            this.onSelect({value, fieldName: this.fieldName});
        });
    }
}

const dlPaxAgeInput:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {
        onSelect: '&', // function
        fieldName: '@', // string
        selectOptions: '<', // one-way binding
        selectedValue: '<', // one-way binding
        paxAgeConfig: '<' // one-way binding

    }

};

export default dlPaxAgeInput;
