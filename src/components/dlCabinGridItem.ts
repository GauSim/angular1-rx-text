import { Store, ICabinViewModel, ACTIONS } from '../services/store';


const template = `



<div data-ng-style="ctrl.cabin.isSelected ? {color:'red'} : {}">

    <h3 class="text-center">
        {{ ctrl.cabin.kindName }}
    </h3>

    <div>
        <div class="text-center">
            <img class="img-responsive" data-ng-src="{{ ctrl.cabin.imageUrl }}">
        </div>
        <div data-ng-show="!ctrl.isLoading" class="text-center">
            {{ ctrl.cabin.title }}
        </div>
        <div data-ng-show="ctrl.isLoading" class="text-center">
            <span class="loadingIndicator"></span>
        </div>
    </div>



</div>



`;

class Controller implements ng.IComponentController {

    isLoading:boolean;
    cabin:ICabinViewModel;

    public static $inject = [
        'store'
    ];

    constructor(private store:Store) {

        this.isLoading = store.getIsLoading();
        store.isLoading.subscribe(e => (this.isLoading = e));

    }
}


const dlCabinGridItem:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {
        cabin: '<' // one-way binding
    }

};

export {dlCabinGridItem};

