import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { FareService } from './FareService';
import { ProductApiService } from './ProductApiService';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';
import { CABIN_AVAILABILITY, CABIN_KIND, MARKET_ID, CURRENCY, RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG } from '../helpers/Enums';

export interface ISailSelectModel {
    id: number;
    cruiseId:number;
    title: string;
    departureDate:string;
    arrivalDate:string;
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
    maxPassengers:number;
    ratecode:string;
    imageUrl:string;
    hasFlightIncluded:boolean;
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


export interface ITranslationCache {
    [key:string]:string;
}

export interface IConfiguration {
    marketId:MARKET_ID;
    defaultCurrency:CURRENCY;
    hasDualCurrency:boolean;
}

export interface IPaxSelection {
    num_adults:number;
    num_seniors:number;
    num_junior:number;
    num_child:number;
    num_baby:number;
}

export interface ICruiseModel {
    id:number;
    title:string;
    operatorPaxAgeConfig:IOperatorPaxAgeConfig;
    operatorBookingServiceCode:string;
}

export interface IFormState {
    configuration:IConfiguration;

    selectedCruiseNid:number;
    selectedSailId:number;
    selectedCabintypeNid:number;

    selectedCruise:ICruiseModel;
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


export class Store extends EventEmitter<IFormState> {

    isLoading = new EventEmitter<boolean>();

    private _dispatchers:StoreDispatchers;
    private _state:IFormState;

    constructor(private $q:ng.IQService,
                private fareService:FareService,
                private operatorService:OperatorService,
                private productApiService:ProductApiService) {
        super();
        this._dispatchers = new StoreDispatchers($q, fareService);
    }

    public emitIsLoading = (force:boolean = false) => this.isLoading.emit(this.getIsLoading());
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
                .then(init=> {
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
            hasDualCurrency: false
        };
        const translationCache:ITranslationCache = {
            'from': 'ab',
            'on request': 'auf Anfrage'
        };


        return this.productApiService.getCruise()
            .then((productApiResponse):{ cruise:ICruiseModel, allCabins:ICabinSelectModel[], allSails:ISailSelectModel[] } => {
                const allSails = productApiResponse.sails.map((sail):ISailSelectModel => {
                    return {
                        id: sail.nid,
                        cruiseId: productApiResponse.nid,
                        title: '', // will be overwritten
                        departureDate: sail.departureDate,
                        arrivalDate: sail.arrivalDate,
                    }
                });
                const allCabins:ICabinSelectModel[] = productApiResponse.sails.reduce((list, sail) => {
                    return [...list, ...sail.cabins.map((cabin):ICabinSelectModel => {
                        return {
                            id: cabin.nid,
                            cruiseId: productApiResponse.nid,
                            sailId: sail.nid,
                            kindName: CABIN_KIND[cabin.kindId], // will be overwritten
                            price: 0, // will be overwritten
                            maxPassengers: cabin.maxPassengers,
                            currency: configuration.defaultCurrency as CURRENCY,
                            kind: cabin.kindId as CABIN_KIND,
                            title: cabin.title, // will be overwritten
                            availability: CABIN_AVAILABILITY.onRequest,
                            cabinName: cabin.title,
                            ratecode: RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG,  // will be overwritten
                            imageUrl: cabin.thumborImage,
                            hasFlightIncluded: false, // todo flight field muss be fill,
                            isAvailable: false,  // will be overwritten
                            isSelected: false  // will be overwritten
                        };
                    })];
                }, []);

                console.log(allCabins);
                const cruise = {
                    id: productApiResponse.nid, //367247,
                    title: productApiResponse.title,
                    operatorPaxAgeConfig: null, // will be overwritten
                    operatorBookingServiceCode: productApiResponse.operator.bookingServiceCode
                };
                return {cruise, allCabins, allSails};
            })
            .then((data):ng.IPromise<{ cruise:ICruiseModel, allCabins:ICabinSelectModel[], allSails:ISailSelectModel[] }> => {

                return this.operatorService.getOperatorConfig(data.cruise.operatorBookingServiceCode)
                    .then(operatorPaxAgeConfig => {
                        const cruise = _.extend({}, data.cruise, {operatorPaxAgeConfig}) as ICruiseModel;
                        return {cruise: cruise, allCabins: data.allCabins, allSails: data.allSails};
                    })
            })
            .then((data):ng.IPromise<IFormState> => {
                console.log(data);
                return this._dispatchers.createInitialState(translationCache, configuration, data.cruise, data.allSails, data.allCabins)
            })
            .then(initialState => {
                return initialState;
            })
            .finally(()=> {
                this.runingActions = this.runingActions.filter(e => e != INITIALIZING);
                this.emitIsLoading();
            });
    };

    runingActions = [];
    public dispatchState = ({type, payload}:Action, debug:string = ''):void => {

        const hash = JSON.stringify({type, payload});

        if (this.runingActions.indexOf(hash) > -1) {
            console.log('decline, action is still in action', hash);
            return;
        }

        console.log(`dispatching from ${debug}`, hash);

        const afterDispatch = (state:IFormState) => {
            this._state = state;
            this.emit(state);

            this.runingActions = this.runingActions.filter(e => e != hash);
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