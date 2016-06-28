import * as _ from 'underscore';

import { FareService, IFareSelector } from './FareService';
import { OperatorService } from './OperatorService';
import { IFormState, IPaxSelection, ITranslationCache, IConfiguration, ISailSelectModel, ICabinGridSelectModel, ICabinSelectModel, ICruiseModel } from './Store';
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

        return this.productApiService.getCruise(configuration)
            .then(productAPI => {
                const selectedCruise:ICruiseModel = productAPI.cruise;
                const _allSails:ISailSelectModel[] = productAPI.allSails;
                const _allCabintypes:ICabinSelectModel[] = productAPI.allCabins;

                const paxSelectRange = _.range(0, 10).map(n => ({id: n, title: `${n}`}));

                const selectedCruiseNid = selectedCruise.id;
                const selectedSailId = _allSails[0].id;
                const cabinId = _allCabintypes.filter(e => e.sailId === selectedSailId)[0].id;


                const selectedPax:IPaxSelection = {
                    num_adults: (selectedCruise.operatorPaxAgeConfig.adult.isSupported ? 2 : 0),
                    num_seniors: 0,
                    num_junior: 0,
                    num_child: 0,
                    num_baby: 0,
                };

                const providers = new StoreProviders();
                const { allCabintypes, allSails, selectedCabintypeNid } = providers.recalculateState(translationCache, _allSails, _allCabintypes, selectedPax, selectedSailId, cabinId);

                const sailSelect = providers.getSailsByCruiseId(allSails, selectedCruiseNid);
                const cabintypeSelect = providers.getCabinsBySailId(allCabintypes, selectedSailId);
                const cabinGridSelect:ICabinGridSelectModel = providers.getCabinGridSelect(allCabintypes, selectedSailId);
                const selectedCabin:ICabinSelectModel = providers.getSelectedCabin(allCabintypes, selectedCabintypeNid);

                const state:IFormState = {
                    selectedSailId,
                    selectedCruiseNid,
                    selectedCabintypeNid,

                    selectedCruise,
                    selectedCabin,
                    selectedPax,

                    allCabintypes,
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

    getAllCabins = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<ICabinSelectModel[]> => {

        const { num_adults, num_seniors, num_junior, num_child, num_baby } = selectedPax;

        const selector:IFareSelector = {
            marketId: currentState.configuration.marketId as MARKET_ID,
            bookingServiceCode: currentState.selectedCruise.operatorBookingServiceCode,
            cruise_id: currentState.selectedCruise.id,
            flight_included: currentState.selectedCabin.hasFlightIncluded,
            num_adult: num_adults,
            num_child: num_child,
            num_junior: num_junior,
            num_baby: num_baby,
            num_senior: num_seniors
        };

        return this.fareService.getFares(selector)
            .then(availableFares => {
                return this.productApiService.getCruise(currentState.configuration)
                    .then(({allCabins}) => {
                        return allCabins.reduce((list, item:ICabinSelectModel)=> {
                            const rates = availableFares.filter(e=>e.cruise_id === item.cruiseId && e.sail_id === item.sailId && e.cabintype_id === item.cabinId);
                            if (rates && rates[0]) {
                                const rate = rates[0];
                                item.rateCode = rate.rate_code;
                                item.rateLastUpdate = rate.updated;
                                item.rateSource = rate.source;
                                item.price = rate.cabin_price;
                                item.isAvailable = true;
                                item.availability = CABIN_AVAILABILITY.available;
                                item.currency = rate.currency;
                                item.hasFlightIncluded = rate.flight_included;
                                item.maxPassengers = rate.num_adult + rate.num_junior + rate.num_child + rate.num_baby;
                            }
                            return [...list, item];
                        }, []);
                    })


            });
    };


    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        return this.getAllCabins(currentState, currentState.selectedPax)
            .then(_allCabintypes => {

                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, _allCabintypes, currentState.selectedPax, _selectedSailId, currentState.selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:string):ng.IPromise<IFormState> => {
        return this.getAllCabins(currentState, currentState.selectedPax)
            .then(_allCabintypes => {

                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, _allCabintypes, currentState.selectedPax, currentState.selectedSailId, _selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    };


    setPaxCount = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<IFormState> => {
        return this.getAllCabins(currentState, selectedPax)
            .then(_allCabintypes => {
                let nextState:IFormState = _.extend({}, currentState, {selectedPax});
                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(nextState.translationCache, nextState.allSails, _allCabintypes, selectedPax, nextState.selectedSailId, nextState.selectedCabintypeNid);
                nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    }
}