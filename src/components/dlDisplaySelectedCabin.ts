import { Store, ICabinViewModel, ACTIONS } from '../services/store';


const template = `
<div data-ng-show="ctrl.isLoading">
    <div class="text-center">
        <span class="loadingIndicator"></span>
    </div>
</div>

<div data-ng-hide="ctrl.isLoading">

    <img class="img-responsive" width="360" data-ng-src="{{ ctrl.selectedCabin.imageUrl }}" />

    <!-- todo OBC here -->

    <div  data-ng-if="(ctrl.cabinOBC > 0)" id="omCabinObc" class="cabinOnBoardCredit">
        <span class="cabinOnBoardCredit_obc" data-ng-bind="(ctrl.cabinOBC | currency:('currency' | translate):0)"></span>
        <div class="cabinOnBoardCredit_content text-center">
            <h5 class="text-uppercase" data-ng-bind="('cruiseData.obcTitle' | translate)"></h5>
            <span data-ng-bind="('cruiseData.obcText' | translate)"></span>
        </div>
    </div>

    <div class="clearfix"><br /></div>


    <div class="cabinDesc">
        <div class="cabinDesc_guaranteedCabin" data-ng-show="ctrl.selectedCabin.guaranteeCabinInfo">
            <span data-ng-bind-html="ctrl.selectedCabin.guaranteeCabinInfo | trustHtml"></span>
        </div>
        <div class="cabinDesc_normalCabin" data-ng-hide="ctrl.selectedCabin.guaranteeCabinInfo">
            <div data-ng-show="ctrl.selectedCabin.location">
                <strong data-ng-bind="('cruiseData.location' | translate)"></strong>:
                <span data-ng-bind-html="(ctrl.selectedCabin.location | trustHtml)"></span>
                <br />
            </div>
            <div data-ng-show="ctrl.selectedCabin.size">
                 <strong data-ng-bind="('cruiseData.cabinSize' | translate)"></strong>:
                <span data-ng-bind-html="ctrl.selectedCabin.size | trustHtml"></span>
                <br />
            </div>
            <div data-ng-show="ctrl.selectedCabin.maxPassengers">
                <strong data-ng-bind="('cruiseData.occupancy' | translate)"></strong>:
                <span data-ng-bind="ctrl.selectedCabin.maxPassengers"></span>
                <br />
            </div>
            <strong data-ng-bind="('cruiseData.amenities' | translate)"></strong>:
            <ul>
                <li data-ng-show="ctrl.selectedCabin.bed" data-ng-bind-html="(ctrl.selectedCabin.bed | trustHtml)"></li>
                <li data-ng-show="ctrl.selectedCabin.windows" data-ng-bind-html="(ctrl.selectedCabin.windows | trustHtml)"></li>
                <li data-ng-show="ctrl.selectedCabin.balcony" data-ng-bind-html="(ctrl.selectedCabin.balcony | trustHtml)"></li>
                <li data-ng-show="ctrl.selectedCabin.amenities" data-ng-repeat="amenity in ctrl.selectedCabin.amenities track by $index" data-ng-bind-html="(amenity | trustHtml)"></li>
            </ul>
            <div data-ng-show="ctrl.selectedCabin.advantages.length > 0">
                <strong data-ng-bind="('cruiseData.advantages' | translate)"></strong>:
                <ul>
                    <li data-ng-repeat="advantage in ctrl.selectedCabin.advantages track by $index" data-ng-bind-html="advantage | trustHtml"></li>
                </ul>
                <br />
            </div>
            <div data-ng-show="ctrl.selectedCabin.information">
                <strong data-ng-bind="('cruiseData.informations' | translate)"></strong>:
                <span data-ng-bind-html="(ctrl.selectedCabin.information | trustHtml)"></span>
                <br />
            </div>
        </div>
    </div>
</div>
`;

class Controller implements ng.IComponentController {

    isLoading:boolean;

    selectedCabin:ICabinViewModel;

    cabinOBC:number = 20;

    public static $inject = [
        'store'
    ];

    constructor(private store:Store) {

        this.isLoading = store.getIsLoading();
        store.isLoading.subscribe(e => (this.isLoading = e));


        store.getLastState().then(({selectedCabin}) => {
            this.selectedCabin = selectedCabin;
        });
        store.subscribe(({ selectedCabin }) => {
            this.selectedCabin = selectedCabin;
        });

    }
}


const dlDisplaySelectedCabin:ng.IComponentOptions = {
    template: template,
    controller: Controller,
    controllerAs: 'ctrl',
    bindings: {}

};

export default dlDisplaySelectedCabin;

