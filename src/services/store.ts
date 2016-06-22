import { Observable } from  '../helpers/Observable';
import * as _ from 'underscore';

interface ISailSelectItem {
    id: number;
    title: string;
}
interface ICabintypeSelect {
    id: number;
    type: string;
    title: string;
}
export class dlFormState {
    selectedCruiseNid: number = 0;
    selectedSailId: number = 0;
    selectedCabintypeNid: number = 0;
    sailSelect: ISailSelectItem[] = [];
    cabintypeSelect: ICabintypeSelect[] = [];
}

interface Action {
    type: string;
    payload: any;
}

function initialState() {

    const sailSelect: ISailSelectItem[] = [
        { id: 1, title: '01.01.2012 - 01.01.2016' },
        { id: 2, title: '02.02.2012 - 02.02.2016' },
        { id: 3, title: '03.03.2012 - 03.03.2016' }
    ];

    const cabintypeSelect: ICabintypeSelect[] =
        [
            { id: 1, title: 'Bella Prima1 (50€)', type: 'innen' },
            { id: 2, title: 'Bella Prima2 (100€)', type: 'innen' },
            { id: 3, title: 'Bella Prima3 (200€)', type: 'innen' },
            { id: 4, title: 'Bums bla Prima1 (500€)', type: 'aussen' },
            { id: 5, title: 'Bums bla Prima2 (600€)', type: 'aussen' },
            { id: 6, title: 'Bums bla Prima3 (700€)', type: 'aussen' },
            { id: 7, title: 'Kat1 (1000€)', type: 'aussen' },
            { id: 8, title: 'Kat2 (2000€)', type: 'aussen' },
            { id: 9, title: 'Kat3 (3000€)', type: 'aussen' }
        ];

    const state: dlFormState = {
        sailSelect,
        cabintypeSelect,
        selectedCruiseNid: 0,
        selectedSailId: sailSelect[0].id,
        selectedCabintypeNid: 0
    }

    return state;
}

/**
 * store
 */
export class store {

    /**
     * internal handler to emit data to the steam
     * METHOD WILL BE OVERWRITTEN IN OBSERVER
     * @type {null}
     */
    private _emitDataToStream: (e: dlFormState) => dlFormState = null;

    /**
     * internal handler to emit errors to the steam
     * METHOD WILL BE OVERWRITTEN IN OBSERVER
     * @type {null}
     */
    private _emitErrorToStream: (e: Error) => Error = null;


    private _lastState: dlFormState = initialState() // new dlFormState();
    /**
    * A stream of ViewModel, each dispatched state will result in a Event in the stream
    * @type {Observable<ViewModel>}
    */
    public stream = new Observable<dlFormState>(observer => {

        // register streaming handler
        this._emitDataToStream = (nextValue) => {
            this._lastState = nextValue;
            observer.next(nextValue);
            return nextValue;
        };
        this._emitErrorToStream = (error) => {
            observer.error(error);
            return error;
        };

        return () => {
            console.log('stream cleanup');
        };
    });

    public getLastState = (): dlFormState => {
        return _.assign({}, this._lastState);
    }

    constructor(private $timeout: ng.ITimeoutService) {


    }


    public dispatchState = (action: Action): void => {
        console.log('dispatch');

        const state: dlFormState = this.getLastState();
        let nextState = null;
        switch (action.type) {
            case ACTIONS.SET_SAIL_ID:

                nextState = _.assign({}, state);
                nextState.selectedSailId = action.payload;

                break;
            default:
                nextState = state;
                break;
        }


        this.$timeout(() => {
            this._emitDataToStream(nextState);
            console.log('emit');
        }, 20);


    }
}

export const ACTIONS = {
    SET_SAIL_ID: 'SET_SAIL_ID',
    SET_CABIN_ID: 'SET_CABIN_ID'
}