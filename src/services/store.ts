import * as _ from 'underscore';
import { EventEmitter } from  '../helpers/EventEmitter';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { StoreProviders } from './StoreProviders';


export enum CABIN_AVAILABILITY { available, onRequest }


export interface ISailSelectItem {
    id: number;
    title: string;
    startDate:string;
    endDate:string;
}

export interface ICabintypeSelectItem {
    id: number;
    sailId:number;
    type: string;
    title: string;
    price:number;
    cabinName:string;
    currency:string;
    availability:CABIN_AVAILABILITY;
}


export interface IPaxSelectItem {
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
    sailSelect:ISailSelectItem[];
    operatorPaxAgeConfig:IOperatorPaxAgeConfig;
    cabintypeSelect:ICabintypeSelectItem[];
    paxSeniorSelect:IPaxSelectItem[];
    paxAdultSelect:IPaxSelectItem[];
    paxJuniorSelect:IPaxSelectItem[];
    paxChildSelect:IPaxSelectItem[];
    paxBabySelect:IPaxSelectItem[];
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


    const sailSelect:ISailSelectItem[] = [
        {id: 1, title: '01.01.2012 - 01.01.2016', startDate: '01.01.2012', endDate: '01.01.2016'},
        {id: 2, title: '02.02.2012 - 02.02.2016', startDate: '02.02.2012', endDate: '02.02.2016'},
        {id: 3, title: '03.03.2012 - 03.03.2016', startDate: '03.03.2012', endDate: '03.03.2016'}
    ];

    const cabintypeSelect:ICabintypeSelectItem[] = [
        {
            id: 1,
            sailId: 1,
            title: 'Bella Prima1 (50 EUR)',
            type: 'innen',
            price: 50,
            cabinName: 'Bella Prima1',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.onRequest
        },
        {
            id: 2,
            sailId: 2,
            title: 'Bella Prima2 (100 EUR)',
            type: 'innen',
            price: 100,
            cabinName: 'Bella Prima2',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.onRequest
        },
        {
            id: 3,
            sailId: 3,
            title: 'Bella Prima3 (200 EUR)',
            type: 'innen',
            price: 200,
            cabinName: 'Bella Prima3',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.onRequest
        },
        {
            id: 4,
            sailId: 1,
            title: 'Bums bla Prima1 (500 EUR)',
            type: 'aussen',
            price: 500,
            cabinName: 'Bums bla Prima1',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        },
        {
            id: 5,
            sailId: 2,
            title: 'Bums bla Prima2 (600 EUR)',
            type: 'aussen',
            price: 600,
            cabinName: 'Bums bla Prima2',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        },
        {
            id: 6,
            sailId: 3,
            title: 'Bums bla Prima3 (700 EUR)',
            type: 'aussen',
            price: 700,
            cabinName: 'Bums bla Prima3',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        },
        {
            id: 7,
            sailId: 1,
            title: 'Kat1 (1000 EUR)',
            type: 'suite',
            price: 1000,
            cabinName: 'Kat1',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        },
        {
            id: 8,
            sailId: 2,
            title: 'Kat2 (2000 EUR)',
            type: 'suite',
            price: 2000,
            cabinName: 'Kat2',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        },
        {
            id: 9,
            sailId: 3,
            title: 'Kat3 (3000 EUR)',
            type: 'suite',
            price: 3000,
            cabinName: 'Kat3',
            currency: 'EUR',
            availability: CABIN_AVAILABILITY.available
        }
    ];

    const state:IFormState = {
        sailSelect,
        cabintypeSelect,
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
        selectedCruiseNid: 0,
        selectedSailId: sailSelect[0].id,
        selectedCabintypeNid: cabintypeSelect[0].id
    };

    return state;
}

export class Store extends EventEmitter<IFormState> {

    isLoading = new EventEmitter<boolean>();

    private _providers = new StoreProviders();
    private _state:IFormState = initialState();

    constructor(private $timeout:ng.ITimeoutService,
                private $q:ng.IQService) {
        super();
    }

    public setIsLoading = () => this.isLoading.emit(this.runingActions.length > 0);
    public getLastState = ():IFormState => _.extend({}, this._state) as IFormState;

    runingActions = [];
    public dispatchState = ({type, payload}:Action):void => {

        const hash = JSON.stringify({type, payload});

        if (this.runingActions.indexOf(hash) > -1) {
            console.log('decline, action is still in action', hash);
            return;
        }

        console.log('dispatching ', hash);

        let nextState = this.getLastState();

        switch (type) {
            case ACTIONS.SET_SAIL_ID:
                nextState = _.extend({}, nextState, {selectedSailId: payload});
                nextState = _.extend(nextState, {
                    cabintypeSelect: this._providers.formatCabintypeSelect(nextState),
                    sailSelect: this._providers.formatSailSelect(nextState)
                });
                break;
            case ACTIONS.SET_CABIN_ID:
                nextState = _.extend({}, nextState, {selectedCabintypeNid: payload});
                nextState = _.extend(nextState, {
                    cabintypeSelect: this._providers.formatCabintypeSelect(nextState),
                    sailSelect: this._providers.formatSailSelect(nextState)
                });
                break;
            case ACTIONS.SET_PAX_COUNT:
                nextState = _.extend({}, nextState, payload);
                nextState = _.extend(nextState, {
                    cabintypeSelect: this._providers.formatCabintypeSelect(nextState),
                    sailSelect: this._providers.formatSailSelect(nextState)
                });
                break;
            default:
                nextState = nextState;
                break;
        }


        // put this in the switch case
        this.runingActions = [...this.runingActions, hash];
        this.setIsLoading();

        // simulate async dispatch
        this.$timeout(() => {

            this._state = nextState;
            this.emit(nextState);

            this.runingActions = this.runingActions.filter(e => e != hash);
            this.setIsLoading();

        }, 299);

    }
}

export const ACTIONS = {
    SET_SAIL_ID: 'SET_SAIL_ID',
    SET_CABIN_ID: 'SET_CABIN_ID',
    SET_PAX_COUNT: 'SET_PAX_COUNT'
};
