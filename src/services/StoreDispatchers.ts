import { IFormState } from './Store';
import { StoreProviders } from './StoreProviders';
import { ISelectPaxModel } from '../dlSelectPax.componet';

export class StoreDispatchers {

    private _providers = new StoreProviders();

    constructor(private $q:ng.IQService) {

    }

    setSailId = (currentState:IFormState, selectedSailId:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();


        let nextState:IFormState = _.extend({}, currentState, {selectedSailId});

        // this will be async
        const { allCabintypes, allSails } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedCabintypeNid);
        nextState = _.extend({}, nextState, {allCabintypes, allSails});


        nextState = _.extend(nextState, {
            selectedCabin: this._providers.getSelectedCabin(nextState.allCabintypes, nextState.selectedCabintypeNid),
            cabintypeSelect: this._providers.getCabinsBySailId(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailsByCruiseId(nextState.allSails, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.selectedSailId)
        });


        // reset selectedCabintypeNid to the cheapestAvailableCabin;
        if (!nextState.cabintypeSelect.some(e => e.id === nextState.selectedCabintypeNid)) {
            const cheapestAvailableCabin = this._providers.getCheapestAvailableCabin(nextState.cabintypeSelect);
            nextState = _.extend({}, nextState, {selectedCabintypeNid: cheapestAvailableCabin.id});

            // this will be async
            const { allCabintypes, allSails } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedCabintypeNid);
            nextState = _.extend({}, nextState, {allCabintypes, allSails});


            nextState = _.extend(nextState, {
                selectedCabin: this._providers.getSelectedCabin(nextState.allCabintypes, nextState.selectedCabintypeNid),
                cabintypeSelect: this._providers.getCabinsBySailId(nextState.allCabintypes, nextState.selectedSailId),
                sailSelect: this._providers.getSailsByCruiseId(nextState.allSails, nextState.selectedCruiseNid),
                cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.selectedSailId)
            });
        }


        d.resolve(nextState);
        return d.promise;
    };


    setCabinId = (currentState:IFormState, selectedCabintypeNid:number):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState:IFormState = _.extend({}, currentState, {selectedCabintypeNid});

        // this will be async
        const { allCabintypes, allSails } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedCabintypeNid);
        nextState = _.extend({}, nextState, {allCabintypes, allSails});


        nextState = _.extend(nextState, {
            selectedCabin: this._providers.getSelectedCabin(nextState.allCabintypes, nextState.selectedCabintypeNid),
            cabintypeSelect: this._providers.getCabinsBySailId(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailsByCruiseId(nextState.allSails, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.selectedSailId)
        });

        d.resolve(nextState);
        return d.promise;
    };


    setPaxCount = (currentState:IFormState, paxConfig:ISelectPaxModel):ng.IPromise<IFormState> => {
        const d = this.$q.defer<IFormState>();

        let nextState:IFormState = _.extend({}, currentState, paxConfig);

        // this will be async
        const { allCabintypes, allSails } = this._providers.formatCabinsAndSails(nextState.translationCache, nextState.allSails, nextState.allCabintypes, nextState.selectedCabintypeNid);
        nextState = _.extend({}, nextState, {allCabintypes, allSails});


        nextState = _.extend(nextState, {
            selectedCabin: this._providers.getSelectedCabin(nextState.allCabintypes, nextState.selectedCabintypeNid),
            cabintypeSelect: this._providers.getCabinsBySailId(nextState.allCabintypes, nextState.selectedSailId),
            sailSelect: this._providers.getSailsByCruiseId(nextState.allSails, nextState.selectedCruiseNid),
            cabinGridSelect: this._providers.getCabinGridSelect(nextState.allCabintypes, nextState.selectedSailId)
        });

        d.resolve(nextState);
        return d.promise;
    }
}