import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { FareService } from './FareService';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';
import { CABIN_AVAILABILITY, CABIN_KIND, MARKET_ID, CURRENCY } from '../helpers/Enums';

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


export interface ITranslationCache {
    [key:string]:string;
}

export interface IConfiguration {
    marketId:MARKET_ID;
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
    hasFlightIncluded:boolean;
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
                private fareService:FareService) {
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
            hasDualCurrency: false
        };
        const translationCache:ITranslationCache = {
            'from': 'ab',
            'on request': 'auf Anfrage'
        };
        const cruise = {
            id: 367247,
            operatorPaxAgeConfig: OperatorService.defaultPaxAgeConfig,
            operatorBookingServiceCode: 'msc',
            hasFlightIncluded: false
        };
        return this._dispatchers.createInitialState(translationCache, configuration, cruise)
            .then(init => {

                return init;
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