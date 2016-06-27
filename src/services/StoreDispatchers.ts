import * as _ from 'underscore';
import { OperatorService } from './OperatorService';
import { IFormState, IPaxSelection, ITranslationCache, IConfiguration, ISailSelectModel, ICabinGridSelectModel, ICabinSelectModel } from './Store';
import { StoreProviders } from './StoreProviders';
import { FareService, IFareSelector } from './FareService';
import { MARKET_ID } from '../helpers/Enums';

import { StateMockHelper } from './StateMockHelper';

export function initialState() {
    const translationCache:ITranslationCache = {};
    const configuration:IConfiguration = {
        marketId: 'de',
        hasDualCurrency: false,
        operatorPaxAgeConfig: OperatorService.ALLFieldsPaxAgeConfig // OperatorService.defaultPaxAgeConfig;
    };

    const paxSelectRange = _.range(0, 10).map(n => ({id: n, title: `${n}`}));

    const selectedPax:IPaxSelection = {
        num_adults: 2,
        num_seniors: 0,
        num_junior: 0,
        num_child: 0,
        num_baby: 0,
    };

    const selectedCruiseNid = 1;


    const providers = new StoreProviders();
    const mockHelper = new StateMockHelper(providers, translationCache);

    const mockedSails:ISailSelectModel[] = _.range(10).map(id => mockHelper.mockSail(id, selectedCruiseNid, `${id}.01.2012`, `${id}.01.2016`));

    const mockedCabins = mockHelper.mockAllCabintypes(mockedSails);

    const selectedSailId = mockedSails[0].id;

    const cabinId = mockedCabins.filter(e=>e.sailId === selectedSailId)[0].id;

    const { allCabintypes, allSails, selectedCabintypeNid } = providers.recalculateState(translationCache, mockedSails, mockedCabins, selectedPax, selectedSailId, cabinId);

    const sailSelect = providers.getSailsByCruiseId(allSails, selectedCruiseNid);
    const cabintypeSelect = providers.getCabinsBySailId(allCabintypes, selectedSailId);
    const cabinGridSelect:ICabinGridSelectModel = providers.getCabinGridSelect(allCabintypes, selectedSailId);
    const selectedCabin:ICabinSelectModel = providers.getSelectedCabin(allCabintypes, selectedCabintypeNid);


    const state:IFormState = {
        selectedSailId,
        selectedCruiseNid,
        selectedCabintypeNid,

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
}

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService,
                private fareService:FareService) {


    }

    getFares = ():ng.IPromise<any> => {
        const selector:IFareSelector = {
            marketId: 'de' as MARKET_ID,
            bookingServiceCode: 'msc',
            cruise_id: 367247,
            sail_id: 0,
            cabintype_id: 0,
            num_adult: 0,
            num_child: 0,
            num_junior: 0,
            num_baby: 0,
            num_senior: 0,
            flight_included: false
        };

        return this.$q.resolve(null);
        // todo:
        // return this.fareService.getFares(selector).then(e => (console.log(e), e));
    };


    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        return this.getFares()
            .then(response => {

                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, currentState.allCabintypes, currentState.selectedPax, _selectedSailId, currentState.selectedCabintypeNid);

                const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);


                return nextState;

            });
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:number):ng.IPromise<IFormState> => {
        return this.getFares()
            .then(response => {

                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, currentState.allCabintypes, currentState.selectedPax, currentState.selectedSailId, _selectedCabintypeNid);
                const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    };


    setPaxCount = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<IFormState> => {
        return this.getFares()
            .then(response => {
                let nextState:IFormState = _.extend({}, currentState, {selectedPax});
                // todo in async, get data to update allCabins from remote service
                const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(nextState.translationCache, nextState.allSails, nextState.allCabintypes, selectedPax, nextState.selectedSailId, nextState.selectedCabintypeNid);
                nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

                return nextState;

            });
    }
}