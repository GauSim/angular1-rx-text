import { Store, IFormState } from './services/store';

const template = `
    <dl-select-sail></dl-select-sail>

    <dl-select-cabin-grid></dl-select-cabin-grid>

    <dl-select-pax></dl-select-pax>

    <dl-select-cabin></dl-select-cabin>

    <dl-display-selected-cabin></dl-display-selected-cabin>

    <dl-select-sail></dl-select-sail>


    <pre>{{ ctrl.state | json }}</pre>
`;


class Controller implements ng.IComponentController {

    state:IFormState;

    constructor(private store:Store) {
        this.state = store.getLastState();
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