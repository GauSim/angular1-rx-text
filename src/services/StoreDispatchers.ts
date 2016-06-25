import { IFormState } from './Store';
import { StoreProviders } from './StoreProviders';
import { ISelectPaxModel } from '../dlSelectPax.componet';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService) {

    }

    setSailId = (currentState:IFormState, _selectedSailId:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();


        let nextState:IFormState = _.extend({}, currentState, {selectedSailId: _selectedSailId});

        // this will be async
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedSailId, nextState.selectedCabintypeNid);

        nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

        d.resolve(nextState);
        return d.promise;
    };


    setCabinId = (currentState:IFormState, _selectedCabintypeNid:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState:IFormState = _.extend({}, currentState, {selectedCabintypeNid: _selectedCabintypeNid});

        // this will be async
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedSailId, nextState.selectedCabintypeNid);

        nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);


        d.resolve(nextState);
        return d.promise;
    };


    setPaxCount = (currentState:IFormState, paxConfig:ISelectPaxModel):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState:IFormState = _.extend({}, currentState, paxConfig);

        // this will be async
        const { allCabintypes, allSails, selectedSailId, selectedCabintypeNid } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedSailId, nextState.selectedCabintypeNid);

        nextState = this._providers.mergeState(nextState, allSails, allCabintypes, selectedSailId, selectedCabintypeNid);

        d.resolve(nextState);
        return d.promise;
    }
}