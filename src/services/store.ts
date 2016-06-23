import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';
import { StoreDispatchers } from './StoreDispatchers';

import { mock } from './StateMockHelper';

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
}


interface Action {
    type: string;
    payload: any;
}


function initialState() {

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


    const allSails:ISailSelectModel[] = [
        {id: 1, title: '01.01.2012 - 01.01.2016', startDate: '01.01.2012', endDate: '01.01.2016', cruiseId: 1},
        {id: 2, title: '02.02.2012 - 02.02.2016', startDate: '02.02.2012', endDate: '02.02.2016', cruiseId: 1},
        {id: 3, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016', cruiseId: 1}
    ];

    const sailSelect = allSails.filter(item => item.cruiseId === 1);


    const p = new StoreProviders();


    const allCabintypes:ICabinSelectModel[] = mock(p, allSails);

    const cabintypeSelect = allCabintypes.filter(item => item.sailId === sailSelect[0].id);

    const cabinGridSelect:ICabinGridSelectModel = {
        inside: null,
        outside: null,
        balcony: null,
        suite: null,
    };

    const state:IFormState = {

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
        selectedCruiseNid: 1,

        selectedSailId: sailSelect[0].id,
        selectedCabintypeNid: cabintypeSelect[0].id
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

        let nextState = this.getLastState();


        const afterDispatch = (state:IFormState) => {
            this.runingActions = [...this.runingActions, hash];
            this.setIsLoading();

            // simulate delay in async dispatch
            return this.$timeout(() => {

                this._state = state;
                this.emit(state);

                this.runingActions = this.runingActions.filter(e => e != hash);
                this.setIsLoading();

            }, 299);
        };

        switch (type) {
            case ACTIONS.SET_SAIL_ID:
                this._dispatchers.setSailId(nextState, payload)
                    .then(afterDispatch);
                break;
            case ACTIONS.SET_CABIN_ID:
                this._dispatchers.setCabinId(nextState, payload)
                    .then(afterDispatch);
                break;
            case ACTIONS.SET_PAX_COUNT:
                this._dispatchers.setPaxCount(nextState, payload)
                    .then(afterDispatch);
                break;
            default:
                nextState = nextState;
                afterDispatch(nextState);
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