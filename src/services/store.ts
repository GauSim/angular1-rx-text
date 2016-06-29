import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { FareService } from './FareService';
import { ProductApiService } from './ProductApiService';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';
import { CABIN_AVAILABILITY, CABIN_KIND, MARKET_ID, CURRENCY, RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG } from '../helpers/Enums';


export interface IBaseModel {
    configuration:IConfiguration;
    selectedCruise:ICruiseViewModel;
    allCabins:ICabinViewModel[];
    allSails:ISailViewModel[];
}

export interface ISailViewModel {
    id: number;
    cruiseId:number;
    title: string;
    departureDate:string;
    arrivalDate:string;
}

export interface ICabinViewModel {
    id: string;
    cabinId:number;
    sailId:number;
    cruiseId:number;
    kind: CABIN_KIND;
    kindName:string;
    title: string;
    guaranteeCabinInfo:string;
    location:string;
    size:string;
    bed: string;
    windows: string;
    balcony: string;
    amenities: string;
    advantages: string[];
    information: string;
    price:number;
    cabinName:string;
    currency:CURRENCY;
    availability:CABIN_AVAILABILITY;
    bedQuantity:number;
    maxPassengers:number;
    rateCode:string;
    rateSource:string;
    rateLastUpdate:number;
    imageUrl:string;
    hasFlightIncluded:boolean;
    isAvailable:boolean;
    isSelected:boolean;
}

export interface ICabinGridSelectViewModel {
    inside:ICabinViewModel;
    outside:ICabinViewModel;
    balcony:ICabinViewModel;
    suite:ICabinViewModel;
}

export interface IPaxSelectViewModel {
    id: number;
    title: string;
}


export interface ITranslationCache {
    [key:string]:string;
}

export interface IConfiguration {
    marketId:MARKET_ID;
    defaultCurrency:CURRENCY;
    hasDualCurrency:boolean;
    operatorPaxAgeConfig:IOperatorPaxAgeConfig;
}

export interface IPaxSelection {
    num_adults:number; // todo remove s from propname
    num_seniors:number; // todo remove s from propname
    num_junior:number;
    num_child:number;
    num_baby:number;
}

export interface ICruiseViewModel {
    id:number;
    title:string;
    operatorBookingServiceCode:string;
}

export interface IFormState extends IBaseModel {
    configuration:IConfiguration;

    selectedCruiseId:number;
    selectedSailId:number;
    selectedCabinId:string;

    selectedCruise:ICruiseViewModel;
    selectedPax:IPaxSelection;
    selectedCabin:ICabinViewModel;

    sailSelect:ISailViewModel[];
    cabintypeSelect:ICabinViewModel[];
    cabinGridSelect:ICabinGridSelectViewModel;

    allCabins:ICabinViewModel[];
    allSails:ISailViewModel[];

    paxSelectRange:IPaxSelectViewModel[];

    translationCache:ITranslationCache;
}


interface IAction {
    type: string;
    payload: any;
}


export class Store extends EventEmitter<IFormState> {

    isLoading = new EventEmitter<boolean>();

    private _dispatchers:StoreDispatchers;
    private _state:IFormState;


    public static $inject = [
        '$q',
        'fareService',
        'productApiService'
    ];

    constructor(private $q:ng.IQService,
                private fareService:FareService,
                private productApiService:ProductApiService) {
        super();
        this._dispatchers = new StoreDispatchers($q, fareService, productApiService);
    }

    public emitIsLoading = (force = false) => this.isLoading.emit(this.getIsLoading());
    public getIsLoading = () => this.runingActions.length > 0;

    public getLastState = ():ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        if (this._state) {
            // if there is state resolve with that
            const last = _.extend({}, this._state) as IFormState;
            d.resolve(last);
        } else {

            // if not - initializeState
            this._initializeState()
                .then(init => {
                    this._state = init;
                    return this._state;
                })
                .then(d.resolve);

        }

        return d.promise;
    };

    private _initializeState = ():ng.IPromise<IFormState> => {
        const INITIALIZING = 'INITIALIZING';

        this.runingActions = [...this.runingActions, INITIALIZING];
        this.emitIsLoading();

        const configuration:IConfiguration = {
            marketId: 'de' as MARKET_ID,
            defaultCurrency: 'EUR' as CURRENCY,
            hasDualCurrency: false,
            operatorPaxAgeConfig: OperatorService.defaultPaxAgeConfig // will be overwritten
        };
        const translationCache:ITranslationCache = {
            'from': 'ab',
            'on request': 'auf Anfrage',
            'person': 'Person',
            'persons': 'Personen',
            'max.': 'max.'
        };


        return this._dispatchers.createInitialState(translationCache, configuration)
            .then(initialState => {
                return initialState;
            })
            .finally(() => {
                this.runingActions = this.runingActions.filter(e => e !== INITIALIZING);
                this.emitIsLoading();
            });
    };

    runingActions = [];
    public dispatchState = ({type, payload}:IAction, debug = ''):void => {

        const hash = JSON.stringify({type, payload});

        if (this.runingActions.indexOf(hash) > -1) {
            console.log('decline, action is still in action', hash);
            return;
        }

        console.log(`dispatching from ${debug}`, hash);

        const afterDispatch = (state:IFormState) => {
            this._state = state;
            this.emit(state);

            this.runingActions = this.runingActions.filter(e => e !== hash);
            this.emitIsLoading();
        };

        this.getLastState()
            .then(currentState => {


                this.runingActions = [...this.runingActions, hash];
                this.emitIsLoading();

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
            });
    }
}


export const ACTIONS = {
    SET_SAIL_ID: 'SET_SAIL_ID',
    SET_CABIN_ID: 'SET_CABIN_ID',
    SET_PAX_COUNT: 'SET_PAX_COUNT'
};

export { StoreProviders }
