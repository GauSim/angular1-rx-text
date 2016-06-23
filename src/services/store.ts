import { EventEmitter } from  '../helpers/EventEmitter';
import * as _ from 'underscore';

export interface ISailSelectItem {
    id: number;
    title: string;
}
export interface ICabintypeSelectItem {
    id: number;
    type: string;
    title: string;
}

export interface IPaxSelectItem {
    id: number;
    title: string;
}

export class dlFormState {
    num_adults: number = 2;
    num_seniors: number = 0;
    num_junior: number = 0;
    num_child: number = 0;
    num_baby: number = 0;
    selectedCruiseNid: number = 0;
    selectedSailId: number = 0;
    selectedCabintypeNid: number = 0;
    sailSelect: ISailSelectItem[] = [];
    cabintypeSelect: ICabintypeSelectItem[] = [];
    paxSeniorSelect: IPaxSelectItem[] = [];
    paxAdultSelect: IPaxSelectItem[] = [];
    paxJuniorSelect: IPaxSelectItem[] = [];
    paxChildSelect: IPaxSelectItem[] = [];
    paxBabySelect: IPaxSelectItem[] = [];
}



interface Action {
    type: string;
    payload: any;
}

function initialState() {

    const paxSeniorSelect = _.range(1, 10).map(id => { return { id, title: `${id} senior` } });
    const paxAdultSelect = _.range(1, 10).map(id => { return { id, title: `${id} adult` } });
    const paxJuniorSelect = _.range(1, 10).map(id => { return { id, title: `${id} junior` } });
    const paxChildSelect = _.range(1, 10).map(id => { return { id, title: `${id} child` } });
    const paxBabySelect = _.range(1, 10).map(id => { return { id, title: `${id} baby` } });


    const sailSelect: ISailSelectItem[] = [
        { id: 1, title: '01.01.2012 - 01.01.2016' },
        { id: 2, title: '02.02.2012 - 02.02.2016' },
        { id: 3, title: '03.03.2012 - 03.03.2016' }
    ];

    const cabintypeSelect: ICabintypeSelectItem[] =
        [
            { id: 1, title: 'Bella Prima1 (50€)', type: 'innen' },
            { id: 2, title: 'Bella Prima2 (100€)', type: 'innen' },
            { id: 3, title: 'Bella Prima3 (200€)', type: 'innen' },
            { id: 4, title: 'Bums bla Prima1 (500€)', type: 'aussen' },
            { id: 5, title: 'Bums bla Prima2 (600€)', type: 'aussen' },
            { id: 6, title: 'Bums bla Prima3 (700€)', type: 'aussen' },
            { id: 7, title: 'Kat1 (1000€)', type: 'suite' },
            { id: 8, title: 'Kat2 (2000€)', type: 'suite' },
            { id: 9, title: 'Kat3 (3000€)', type: 'suite' }
        ];

    const state: dlFormState = {
        sailSelect,
        cabintypeSelect,
        paxSeniorSelect,
        paxAdultSelect,
        paxJuniorSelect,
        paxChildSelect,
        paxBabySelect,
        num_adults: 2,
        num_seniors: 0,
        num_junior: 0,
        num_child: 0,
        num_baby: 0,
        selectedCruiseNid: 0,
        selectedSailId: sailSelect[0].id,
        selectedCabintypeNid: cabintypeSelect[0].id
    }

    return state;
}

const IS_LOADING = "IS_LOADING";
const DONE_LOADING = "DONE_LOADING";

export class Store extends EventEmitter<dlFormState> {

    isLoading = new EventEmitter<boolean>();

    private __state: dlFormState = initialState();

    constructor(private $timeout: ng.ITimeoutService,
        private $q: ng.IQService) {
        super();
    }

    public emitIsLoading = () => this.isLoading.emit(this.runingActions.length > 0);
    public getLastState = (): dlFormState => _.extend({}, this.__state) as dlFormState;

    runingActions = [];
    public dispatchState = (action: Action): void => {


        const hash = JSON.stringify(action)
        if (this.runingActions.indexOf(hash) > -1) {
            console.log('decline, action is still in action', hash);
            return;
        }

        console.log('dispatching ', action);


        let nextState = this.getLastState();
        switch (action.type) {
            case ACTIONS.SET_SAIL_ID:
                nextState.selectedSailId = action.payload;
                break;
            case ACTIONS.SET_CABIN_ID:
                nextState.selectedCabintypeNid = action.payload;
                break;
            case ACTIONS.SET_PAX_COUNT:
                console.log('todo, get rates', action.payload);
                break;
            default:
                nextState = nextState;
                break;
        }


        // put this in the switch case
        this.runingActions = [...this.runingActions, hash];
        this.emitIsLoading();

        this.$timeout(() => {

            this.__state = nextState;
            this.emit(nextState);

            this.runingActions = this.runingActions.filter(e => e != hash);
            this.emitIsLoading();

        }, 299);

    }
}

export const ACTIONS = {
    SET_SAIL_ID: 'SET_SAIL_ID',
    SET_CABIN_ID: 'SET_CABIN_ID',
    SET_PAX_COUNT: 'SET_PAX_COUNT'
}