import * as _ from 'underscore';

import { FareService, IFareSelector } from './FareService';
import { OperatorService } from './OperatorService';
import { IFormState, IPaxSelection, ITranslationCache, IConfiguration, ISailViewModel, ICabinGridSelectViewModel, ICabinViewModel, ICruiseViewModel, IBaseModel } from './Store';
import { StoreProviders } from './StoreProviders';
import { MARKET_ID, CABIN_AVAILABILITY } from '../helpers/Enums';
import { ProductApiService } from './ProductApiService';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService,
                private fareService:FareService,
                private productApiService:ProductApiService) {

    }

    createInitialState = (translationCache:ITranslationCache, configuration:IConfiguration):ng.IPromise<IFormState> => {

        const selectedPax:IPaxSelection = {
            num_adults: 2,
            num_seniors: 0,
            num_junior: 0,
            num_child: 0,
            num_baby: 0,
        };

        return this.updateBaseModel(configuration, selectedPax)
            .then(baseModel => {

                const selectedCruise:ICruiseViewModel = baseModel.selectedCruise;
                const _selectedCruiseNid = selectedCruise.id;
                const _selectedSailId = baseModel.allSails[0].id;
                const _selectedCabinId = baseModel.allCabins.filter(e => e.sailId === _selectedSailId)[0].id;


                const { allCabins, allSails, selectedCabinId, selectedSailId, selectedCruiseId } = this._providers.handleStateCollisionsAndFormat(translationCache, baseModel.allSails, baseModel.allCabins, selectedPax, _selectedCruiseNid, _selectedSailId, _selectedCabinId);

                const state:IFormState = {
                    selectedSailId,
                    selectedCruiseId,
                    selectedCabinId,

                    selectedCruise,
                    selectedPax,

                    allCabins,
                    allSails,

                    cabinGridSelect: this._providers.getCabinGridSelect(allCabins, selectedSailId),
                    cabintypeSelect: this._providers.getCabinsBySailId(allCabins, selectedSailId),
                    sailSelect: this._providers.getSailsByCruiseId(allSails, selectedCruiseId),
                    selectedCabin: this._providers.getSelectedCabin(allCabins, selectedCabinId),
                    paxSelectRange: _.range(0, 10).map(n => ({id: n, title: `${n}`})),

                    configuration,
                    translationCache
                };

                return state;
            });
    };


    updateBaseModel = (configuration:IConfiguration, selectedPax:IPaxSelection):ng.IPromise<IBaseModel> => {
        return this.productApiService.createBaseModel(configuration)
            .then(baseModelFromProductApi => {

                const { allCabins, selectedCruise, allSails } = baseModelFromProductApi;

                return this.fareService.getFares(selectedCruise.id, configuration, selectedCruise.operatorPaxAgeConfig, selectedPax)
                    .then(availableFares => this.fareService.mergeCabinsAndFares(allCabins, availableFares))
                    .then(mergedCabins => {

                        return {allCabins: mergedCabins, selectedCruise, allSails};
                    });
            });
    };


    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, currentState.selectedPax)
            .then(baseModel => {

                const { allCabins, allSails, selectedSailId, selectedCabinId, selectedCruiseId } = this._providers.handleStateCollisionsAndFormat(currentState.translationCache, baseModel.allSails, baseModel.allCabins, currentState.selectedPax, currentState.selectedCruiseId, _selectedSailId, currentState.selectedCabinId);
                const nextState = this._providers.mergeState(currentState, allSails, allCabins, selectedCruiseId, selectedSailId, selectedCabinId);

                return nextState;

            });
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:string):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, currentState.selectedPax)
            .then(baseModel => {

                const { allCabins, allSails, selectedSailId, selectedCabinId, selectedCruiseId } = this._providers.handleStateCollisionsAndFormat(currentState.translationCache, baseModel.allSails, baseModel.allCabins, currentState.selectedPax, currentState.selectedCruiseId, currentState.selectedSailId, _selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabins, selectedCruiseId, selectedSailId, selectedCabinId);

                return nextState;
            });
    };


    setPaxCount = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, selectedPax)
            .then(baseModel => {

                // todo move this into mergeState
                let nextState:IFormState = _.extend({}, currentState, {selectedPax});

                const { allCabins, allSails, selectedSailId, selectedCabinId, selectedCruiseId } = this._providers.handleStateCollisionsAndFormat(nextState.translationCache, baseModel.allSails, baseModel.allCabins, selectedPax, currentState.selectedCruiseId, nextState.selectedSailId, nextState.selectedCabinId);
                nextState = this._providers.mergeState(nextState, allSails, allCabins, selectedCruiseId, selectedSailId, selectedCabinId);

                return nextState;

            });
    }
}