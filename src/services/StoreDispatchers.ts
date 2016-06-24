import { IFormState } from './Store';
import { StoreProviders } from './StoreProviders';
import { ISelectPaxModel } from '../dlSelectPax.componet';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService) {

    }

    setSailId = (currentState:IFormState, selectedSailId:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();


        let nextState = _.extend({}, currentState, {selectedSailId});

        nextState = _.extend(nextState, {
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.translationCache, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid)
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
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.translationCache, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid)
        });

        d.resolve(nextState);
        return d.promise;
    };


    setPaxCount = (currentState:IFormState, paxConfig:ISelectPaxModel):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState = _.extend({}, currentState, paxConfig);

        nextState = _.extend(nextState, {
            cabintypeSelect: this._providers.getFormatedCabintypeSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid),
            sailSelect: this._providers.getSailSelect(nextState.allCabintypes, nextState.allSails, nextState.translationCache, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.translationCache, nextState.selectedSailId, nextState.selectedCabintypeNid)
        });

        d.resolve(nextState);
        return d.promise;
    }
}