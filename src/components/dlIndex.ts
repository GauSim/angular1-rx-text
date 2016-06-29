import { Store, IFormState } from '../services/store';

const template = `

    <dl-select-sail></dl-select-sail>

    <dl-select-cabin-grid></dl-select-cabin-grid>

    <div class="row">
        <div class="col-md-6">
            <dl-select-sail></dl-select-sail>
            <dl-select-pax></dl-select-pax>

            <dl-select-cabin></dl-select-cabin>

            <div class="clearfix"></div>

            <dl-display-selected-cabin
                class="col-xs-12 col-is-8 col-sm-8 col-lg-9 col-is-offset-4 col-sm-offset-4 col-lg-offset-3">
            </dl-display-selected-cabin>

        </div>
        <div class="col-md-6">
        </div>
    </div>





    <pre>{{ ctrl.state | json }}</pre>
`;


class Controller implements ng.IComponentController {

    state:IFormState;


    public static $inject = [
        'store'
    ];

    constructor(private store:Store) {
        store.getLastState().then(state => {
            this.state = state;
        });
        this.store.subscribe(newState => {
            this.state = newState;
        });
    }
}


const dlIndex:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};
export {dlIndex};
