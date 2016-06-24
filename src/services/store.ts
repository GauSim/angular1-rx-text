import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';

import { mockAllCabintypes } from './StateMockHelper';

export enum CABIN_AVAILABILITY { available = 1, onRequest = 2 }

export type CABIN_KIND = 'inside'
    | 'outside'
    | 'balcony'
    | 'suite';

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
    kind: CABIN_KIND;
    kindName:string;
    title: string;
    price:number;
    cabinName:string;
    currency:string;
    availability:CABIN_AVAILABILITY;
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

export interface IFormState {
    num_adults:number;
    num_seniors:number;
    num_junior:number;
    num_child:number;
    num_baby:number;
    selectedCruiseNid:number;
    selectedSailId:number;
    selectedCabintypeNid:number;

    sailSelect:ISailSelectModel[];
    operatorPaxAgeConfig:IOperatorPaxAgeConfig;
    cabintypeSelect:ICabinSelectModel[];
    cabinGridSelect:ICabinGridSelectModel;

    allCabintypes:ICabinSelectModel[];
    allSails:ISailSelectModel[];

    paxSeniorSelect:IPaxSelectModel[];
    paxAdultSelect:IPaxSelectModel[];
    paxJuniorSelect:IPaxSelectModel[];
    paxChildSelect:IPaxSelectModel[];
    paxBabySelect:IPaxSelectModel[];

    translationCache:ITranslationCache;
}


interface Action {
    type: string;
    payload: any;
}


function initialState() {
    const translationCache:ITranslationCache = {};
    const operatorPaxAgeConfig = OperatorService.ALLFieldsPaxAgeConfig; // OperatorService.defaultPaxAgeConfig;

    const paxSeniorSelect = _.range(0, 10).map(id => {
        return {id, title: `${id} senior`}
    });
    const paxAdultSelect = _.range(0, 10).map(id => {
        return {id, title: `${id} adult`}
    });
    const paxJuniorSelect = _.range(0, 10).map(id => {
        return {id, title: `${id} junior`}
    });
    const paxChildSelect = _.range(0, 10).map(id => {
        return {id, title: `${id} child`}
    });
    const paxBabySelect = _.range(0, 10).map(id => {
        return {id, title: `${id} baby`}
    });

    const selectedCruiseNid = 1;
    const allSails:ISailSelectModel[] = [
        {id: 1, title: '01.01.2012 - 01.01.2016', startDate: '01.01.2012', endDate: '01.01.2016', cruiseId: 1},
        {id: 2, title: '02.02.2012 - 02.02.2016', startDate: '02.02.2012', endDate: '02.02.2016', cruiseId: 1},
        {id: 3, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016', cruiseId: 1}
    ];

    const selectedSailId = allSails[0].id;

    const providers = new StoreProviders();


    const allCabintypes:ICabinSelectModel[] = mockAllCabintypes(providers, translationCache, allSails);

    const selectedCabintypeNid = allCabintypes[0].id;

    const sailSelect = providers.getSailSelect(allCabintypes, allSails, translationCache, selectedCruiseNid);
    const cabintypeSelect = providers.getFormatedCabintypeSelect(allCabintypes, translationCache, selectedSailId, selectedCabintypeNid);
    const cabinGridSelect:ICabinGridSelectModel = providers.getCabinGridSelect(allCabintypes, translationCache, selectedSailId, selectedCabintypeNid);


    const state:IFormState = {
        selectedSailId,
        selectedCruiseNid,
        selectedCabintypeNid,

        allCabintypes,
        allSails,

        cabinGridSelect,
        cabintypeSelect,
        sailSelect,
        paxSeniorSelect,
        paxAdultSelect,
        paxJuniorSelect,
        paxChildSelect,
        paxBabySelect,

        operatorPaxAgeConfig,

        num_adults: 2,
        num_seniors: 0,
        num_junior: 0,
        num_child: 0,
        num_baby: 0,

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

            }, 1000);
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