import * as _ from 'underscore';

import { FareService, IFareSelector } from './FareService';
import { OperatorService } from './OperatorService';
import { IFormState, IPaxSelection, ITranslationCache, IConfiguration, ISailSelectModel, ICabinGridSelectModel, ICabinSelectModel, ICruiseModel, IBaseModel } from './Store';
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

        const paxSelectRange = _.range(0, 10).map(n => ({id: n, title: `${n}`}));
        const selectedPax:IPaxSelection = {
            num_adults: 2,
            num_seniors: 0,
            num_junior: 0,
            num_child: 0,
            num_baby: 0,
        };

        return this.updateBaseModel(configuration, selectedPax)
            .then(baseModel => {
                const selectedCruise:ICruiseModel = baseModel.cruise;
                const _selectedCruiseNid = selectedCruise.id;
                const _selectedSailId = baseModel.allSails[0].id;
                const _selectedCabintypeNid = baseModel.allCabins.filter(e => e.sailId === _selectedSailId)[0].id;


                const { allCabins, allSails, selectedCabintypeNid, selectedSailId, selectedCruiseNid } = this._providers.recalculateState(translationCache, baseModel.allSails, baseModel.allCabins, selectedPax, _selectedCruiseNid, _selectedSailId, _selectedCabintypeNid);

                const sailSelect = this._providers.getSailsByCruiseId(allSails, selectedCruiseNid);
                const cabintypeSelect = this._providers.getCabinsBySailId(allCabins, selectedSailId);
                const cabinGridSelect:ICabinGridSelectModel = this._providers.getCabinGridSelect(allCabins, selectedSailId);
                const selectedCabin:ICabinSelectModel = this._providers.getSelectedCabin(allCabins, selectedCabintypeNid);

                const state:IFormState = {
                    selectedSailId,
                    selectedCruiseNid,
                    selectedCabintypeNid,

                    selectedCruise,
                    selectedCabin,
                    selectedPax,

                    allCabintypes: allCabins,
                    allSails,

                    cabinGridSelect,
                    cabintypeSelect,
                    sailSelect,

                    paxSelectRange,

                    configuration,
                    translationCache
                };

                return state;
            });
    };


    updateBaseModel = (configuration:IConfiguration, selectedPax:IPaxSelection):ng.IPromise<IBaseModel> => {
        return this.productApiService.createBaseModel(configuration)
            .then(baseModelFromProductApi => {

                const { allCabins, cruise, allSails } = baseModelFromProductApi;

                return this.fareService.getFares(cruise.id, configuration, cruise.operatorPaxAgeConfig, selectedPax)
                    .then(availableFares => this.fareService.mergeCabinsAndFares(allCabins, availableFares))
                    .then(mergedCabins => {

                        return {allCabins: mergedCabins, cruise, allSails};
                    })

            });

    };


    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, currentState.selectedPax)
            .then(baseModel => {

                const { allCabins, allSails, selectedSailId, selectedCabintypeNid, selectedCruiseNid } = this._providers.recalculateState(currentState.translationCache, baseModel.allSails, baseModel.allCabins, currentState.selectedPax, currentState.selectedCruiseNid, _selectedSailId, currentState.selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabins, selectedCruiseNid, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:string):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, currentState.selectedPax)
            .then(baseModel => {

                const { allCabins, allSails, selectedSailId, selectedCabintypeNid, selectedCruiseNid } = this._providers.recalculateState(currentState.translationCache, baseModel.allSails, baseModel.allCabins, currentState.selectedPax, currentState.selectedCruiseNid, currentState.selectedSailId, _selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabins, selectedCruiseNid, selectedSailId, selectedCabintypeNid);

                return nextState;
            });
    };


    setPaxCount = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<IFormState> => {
        return this.updateBaseModel(currentState.configuration, selectedPax)
            .then(baseModel => {

                // todo move this into mergeState
                let nextState:IFormState = _.extend({}, currentState, {selectedPax});

                const { allCabins, allSails, selectedSailId, selectedCabintypeNid, selectedCruiseNid } = this._providers.recalculateState(nextState.translationCache, baseModel.allSails, baseModel.allCabins, selectedPax, currentState.selectedCruiseNid, nextState.selectedSailId, nextState.selectedCabintypeNid);
                nextState = this._providers.mergeState(nextState, allSails, allCabins, selectedCruiseNid, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    }
}