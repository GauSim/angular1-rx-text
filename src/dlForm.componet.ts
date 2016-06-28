import { Store, IFormState } from './services/store';

const template = `

    <dl-select-sail></dl-select-sail>

    <dl-select-cabin-grid></dl-select-cabin-grid>

    <div class="row">
        <div class="col-md-6">
            <dl-select-sail></dl-select-sail>
            <dl-select-pax></dl-select-pax>
            <dl-select-cabin></dl-select-cabin>
            <dl-display-selected-cabin></dl-display-selected-cabin>
        </div>
        <div class="col-md-6">
        </div>
    </div>





    <pre>{{ ctrl.state | json }}</pre>
`;


class Controller implements ng.IComponentController {

    state:IFormState;

    constructor(private store:Store) {
        store.getLastState().then(state => {
            this.state = state;
        });
        this.store.subscribe(newState => {
            this.state = newState;
        });
    }
}


const dlForm:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export default dlForm;