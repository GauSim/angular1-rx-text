import { IFormState, IPaxSelection } from './Store';
import { StoreProviders } from './StoreProviders';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService) {

    }

    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();


        // todo in async, get data to update allCabins from remote service
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, currentState.allCabintypes, currentState.selectedPax, _selectedSailId, currentState.selectedCabintypeNid);

        const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

        d.resolve(nextState);
        return d.promise;
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        // todo in async, get data to update allCabins from remote service
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(currentState.translationCache, currentState.allSails, currentState.allCabintypes, currentState.selectedPax, currentState.selectedSailId, _selectedCabintypeNid);

        const nextState = this._providers.mergeState(currentState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

        d.resolve(nextState);
        return d.promise;
    };


    setPaxCount = (currentState:IFormState, selectedPax:IPaxSelection):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState:IFormState = _.extend({}, currentState, {selectedPax});

        // todo in async, get data to update allCabins from remote service
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.recalculateState(nextState.translationCache, nextState.allSails, nextState.allCabintypes, selectedPax, nextState.selectedSailId, nextState.selectedCabintypeNid);

        nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

        d.resolve(nextState);
        return d.promise;
    }
}