import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';
import { CABIN_AVAILABILITY, CABIN_KIND, MARKETID, CURRENCY } from '../helpers/Enums';
import { mockAllCabintypes } from './StateMockHelper';


export interface ISailSelectModel {
    id: number;
    cruiseId:number;
    title: string;
    startDate:string;
    endDate:string;
}

export interface ICabinSelectModel {
    id: number;
    sailId:number;
    cruiseId:number;
    kind: CABIN_KIND;
    kindName:string;
    title: string;
    price:number;
    cabinName:string;
    currency:CURRENCY;
    availability:CABIN_AVAILABILITY;
    ratecode:string;
    imageUrl:string;
    isAvailable:boolean;
    isSelected:boolean;
}

export interface ICabinGridSelectModel {
    inside:ICabinSelectModel;
    outside:ICabinSelectModel;
    balcony:ICabinSelectModel;
    suite:ICabinSelectModel;
}

export interface IPaxSelectModel {
    id: number;
    title: string;
}

export interface IFareSelector {
    cruise_id:number;
    sail_id:number;
    cabintype_id:number;
    num_adult: number;
    num_child: number;
    num_junior: number;
    num_baby: number;
    num_senior: number;
    flight_included:boolean;
}

export interface ITranslationCache {
    [key:string]:string;
}

export interface IConfiguration {
    marketId:MARKETID;
    hasDualCurrency:boolean;
    operatorPaxAgeConfig:IOperatorPaxAgeConfig;
}

export interface IPaxSelection {
    num_adults:number;
    num_seniors:number;
    num_junior:number;
    num_child:number;
    num_baby:number;
}

export interface IFormState {
    configuration:IConfiguration;

    selectedCruiseNid:number;
    selectedSailId:number;
    selectedCabintypeNid:number;

    selectedPax:IPaxSelection;
    selectedCabin:ICabinSelectModel;

    sailSelect:ISailSelectModel[];
    cabintypeSelect:ICabinSelectModel[];
    cabinGridSelect:ICabinGridSelectModel;

    allCabintypes:ICabinSelectModel[];
    allSails:ISailSelectModel[];

    paxSelectRange:IPaxSelectModel[];

    translationCache:ITranslationCache;
}


interface Action {
    type: string;
    payload: any;
}


function initialState() {
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
    const mockedSails:ISailSelectModel[] = [
        {id: 1, title: '01.01.2012 - 01.01.2016', startDate: '01.01.2012', endDate: '01.01.2016', cruiseId: 1},
        {id: 2, title: '02.02.2012 - 02.02.2016', startDate: '02.02.2012', endDate: '02.02.2016', cruiseId: 1},
        {id: 3, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016', cruiseId: 1},
        {id: 4, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016', cruiseId: 1},
        {id: 5, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016', cruiseId: 1}
    ];

    const providers = new StoreProviders();


    const mockedCabins = mockAllCabintypes(providers, translationCache, mockedSails);

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

export class Store extends EventEmitter<IFormState> {

    isLoading = new EventEmitter<boolean>();

    private _dispatchers:StoreDispatchers;
    private _state:IFormState = initialState();

    constructor(private $timeout:ng.ITimeoutService,
                private $q:ng.IQService) {
        super();
        this._dispatchers = new StoreDispatchers($q);
    }

    public setIsLoading = () => this.isLoading.emit(this.runingActions.length > 0);
    public getLastState = ():IFormState => _.extend({}, this._state) as IFormState;

    runingActions = [];
    public dispatchState = ({type, payload}:Action, debug:string = ''):void => {


        const hash = JSON.stringify({type, payload});

        if (this.runingActions.indexOf(hash) > -1) {
            console.log('decline, action is still in action', hash);
            return;
        }

        console.log(`dispatching from ${debug}`, hash);

        let currentState = this.getLastState();


        const afterDispatch = (state:IFormState) => {
            this.runingActions = [...this.runingActions, hash];
            this.setIsLoading();

            // simulate delay in async dispatch
            return this.$timeout(() => {

                this._state = state;
                this.emit(state);

                this.runingActions = this.runingActions.filter(e => e != hash);
                this.setIsLoading();

            }, 500);
        };

        switch (type) {
            case ACTIONS.SET_SAIL_ID:
                this._dispatchers.setSailId(currentState, payload)
                    .then(afterDispatch);
                break;
            case ACTIONS.SET_CABIN_ID:
                this._dispatchers.setCabinId(currentState, payload)
                    .then(afterDispatch);
                break;
            case ACTIONS.SET_PAX_COUNT:
                this._dispatchers.setPaxCount(currentState, payload)
                    .then(afterDispatch);
                break;
            default:
                currentState = currentState;
                afterDispatch(currentState);
                break;
        }

    }
}


export const ACTIONS = {
    SET_SAIL_ID: 'SET_SAIL_ID',
    SET_CABIN_ID: 'SET_CABIN_ID',
    SET_PAX_COUNT: 'SET_PAX_COUNT'
};

export { StoreProviders }