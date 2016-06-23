import { IFormState } from './Store';
import { StoreProviders } from './StoreProviders';
import { paxConfig } from '../dlPaxSelect.componet';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService) {

    }

    setSailId = (currentState:IFormState, selectedSailId:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();


        let nextState = _.extend({}, currentState, {selectedSailId});

        nextState = _.extend(nextState, {
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.selectedCruiseNid)
        });


        // reset selectedCabintypeNid to the cheapestAvailableCabin;
        if (!nextState.cabintypeSelect.some(e => e.id === nextState.selectedCabintypeNid)) {
            const cheapestAvailableCabin = this._providers.getCheapestAvailableCabin(nextState.cabintypeSelect);
            nextState = _.extend({}, nextState, {selectedCabintypeNid: cheapestAvailableCabin.id});
        }


        d.resolve(nextState);
        return d.promise;
    };


    setCabinId = (currentState:IFormState, selectedCabintypeNid:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState = _.extend({}, currentState, {selectedCabintypeNid});

        nextState = _.extend(nextState, {
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.selectedCruiseNid)
        });

        d.resolve(nextState);
        return d.promise;
    };


    setPaxCount = (currentState:IFormState, paxConfig:paxConfig):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState = _.extend({}, currentState, paxConfig);


        nextState = _.extend(nextState, {
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.selectedCruiseNid)
        });

        d.resolve(nextState);
        return d.promise;
    }
}