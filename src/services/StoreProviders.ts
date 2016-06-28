import * as _ from 'underscore';

import {
    IFormState,
    ICabinViewModel,
    ISailViewModel,
    ICabinGridSelectViewModel,
    IPaxSelection,
    ITranslationCache
} from './Store';
import {
    CABIN_AVAILABILITY,
    CABIN_KIND
} from '../helpers/Enums'


function compose<F1Result,F2Result,F2Input>(f1:(e:F2Result)=>F1Result, f2:(e:F2Input)=>F2Result) {
    return (x:F2Input) => {
        return f1(f2(x));
    };
};


export class StoreProviders {

    constructor() {

    }

    getCheapestCabin = (cabins:ICabinViewModel[]):ICabinViewModel => _.min(cabins, (item:ICabinViewModel) => item.price);
    getAvailableCabins = (cabins:ICabinViewModel[]):ICabinViewModel[] => cabins.filter(item => item.availability === CABIN_AVAILABILITY.available);
    getCheapestAvailableCabin = compose(this.getCheapestCabin, this.getAvailableCabins);
    getCabinsBySailId = (cabins:ICabinViewModel[], sailId:number):ICabinViewModel[] => cabins.filter(item => item.sailId === sailId);
    getSailsByCruiseId = (sails:ISailViewModel[], cruiseId:number):ISailViewModel[] => sails ? sails.filter(item => item.cruiseId === cruiseId) : [];


    getTranslation = (translationCache:ITranslationCache, key:string) => translationCache[key] ? translationCache[key] : key;

    getCheapestAvailableOrAlternativeCabin = (list:ICabinViewModel[], kind:CABIN_KIND):ICabinViewModel => {

        const byKind = list.filter(e => e.kind === kind);

        const cheapestAvailable = this.getCheapestAvailableCabin(byKind); // will return Infinity if no cabin is available

        if ((cheapestAvailable as any) !== Infinity) {
            return cheapestAvailable;
        } else {

            const cheapest = this.getCheapestCabin(byKind); // will return Infinity if no cabin is available

            if ((cheapestAvailable as any) !== Infinity) {
                return cheapest;
            } else {
                return byKind[0] ? byKind[0] : null;
            }
        }
    };

    getCabinGridSelect = (allCabins:ICabinViewModel[], selectedSailId:number):ICabinGridSelectViewModel => {

        const bySail = this.getCabinsBySailId(allCabins, selectedSailId);

        const cabinGridSelect:ICabinGridSelectViewModel = {
            inside: this.getCheapestAvailableOrAlternativeCabin(bySail, CABIN_KIND.inside),
            outside: this.getCheapestAvailableOrAlternativeCabin(bySail, CABIN_KIND.outside),
            balcony: this.getCheapestAvailableOrAlternativeCabin(bySail, CABIN_KIND.balcony),
            suite: this.getCheapestAvailableOrAlternativeCabin(bySail, CABIN_KIND.suite),
        };

        return cabinGridSelect;
    };

    getSelectedCabin = (allCabins:ICabinViewModel[], selectedCabinId:string):ICabinViewModel => {
        const selectedCabin = allCabins.filter(e=> e.id === selectedCabinId)[0];
        if (!selectedCabin) {
            console.log(allCabins);
            debugger;
            throw new Error(`can not find cabinId ${selectedCabinId} in state.allCabins`);
        }
        return selectedCabin;
    };

    orderByAvailabilityThenPrice = (cabins:ICabinViewModel[]):ICabinViewModel[] => {
        if (!cabins.length) {
            return [];
        }

        const grpd:{ available?:ICabinViewModel[]; onRequest?:ICabinViewModel[]; } = _.groupBy(cabins, (c:ICabinViewModel) => c.isAvailable ? 'available' : 'onRequest') as any;

        return [
            ... (!grpd.available) ? [] : _.sortBy(grpd.available, (c:ICabinViewModel) => c.price),
            ... (!grpd.onRequest) ? [] : grpd.onRequest,
        ]
    };

    formatSailTitle = (translationCache:ITranslationCache, allCabins:ICabinViewModel[], item:ISailViewModel):string => {
        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);

        const text_from = this.getTranslation(translationCache, 'from');
        const test_onRequest = this.getTranslation(translationCache, 'on request');

        const displayPrice = ((cheapestAvailable as any) != Infinity) ? `${text_from} ${cheapestAvailable.price} ${cheapestAvailable.currency}` : test_onRequest;
        return `${item.departureDate} - ${item.arrivalDate} (${displayPrice})`;
    };

    formatCabinTitle = (translationCache:ITranslationCache, item:ICabinViewModel):string => {
        const text_onRequest = this.getTranslation(translationCache, 'on request');
        const displayPrice = (item.availability === CABIN_AVAILABILITY.available) ? `${item.price} ${item.currency}` : text_onRequest;
        const text_max = this.getTranslation(translationCache, 'max.');
        const text_person = this.getTranslation(translationCache, 'person');
        const text_persons = this.getTranslation(translationCache, 'persons');
        const displayMaxPax = (item.availability === CABIN_AVAILABILITY.available) ? `${text_max} ${item.maxPassengers} ${item.maxPassengers === 1 ? text_person : text_persons}` : '';
        return `${item.cabinName} ${item.id} (${displayPrice}) ${displayMaxPax}`;
    };

    private _formatSails = (translationCache:ITranslationCache, allCabins:ICabinViewModel[], sails:ISailViewModel[]):ISailViewModel[] => {
        return sails.reduce((list, item:ISailViewModel)=> {
            const title = this.formatSailTitle(translationCache, allCabins, item);
            return [...list, _.extend({}, item, {title})];
        }, []);
    };

    private _formatCabins = (translationCache:ITranslationCache, cabins:ICabinViewModel[], selectedPax:IPaxSelection, selectedCabinId:string):ICabinViewModel[] => {

        if (!cabins.length) {
            return [];
        }

        const formatedCabins = cabins.reduce((list, item:ICabinViewModel)=> {

            // todo does selectedPax fit in cabin ?
            item.availability = item.availability // = CABIN_AVAILABILITY.onRequest;

            const isSelected = item.id === selectedCabinId;
            const title = this.formatCabinTitle(translationCache, item);

            return [...list, _.extend({}, item, {title, isSelected})];
        }, []);

        const grpd:{
            inside?:ICabinViewModel[],
            outside?:ICabinViewModel[],
            balcony?:ICabinViewModel[],
            suite?:ICabinViewModel[]
        } = _.groupBy<ICabinViewModel>(formatedCabins, ((e:ICabinViewModel) => e.kindName)) as any;

        // sort by cabin kind, then by availability, then by price
        const sorted = [
            ... !grpd.inside ? [] : this.orderByAvailabilityThenPrice(grpd.inside),
            ... !grpd.outside ? [] : this.orderByAvailabilityThenPrice(grpd.outside),
            ... !grpd.balcony ? [] : this.orderByAvailabilityThenPrice(grpd.balcony),
            ... !grpd.suite ? [] : this.orderByAvailabilityThenPrice(grpd.suite),
        ];

        return sorted;
    };


    handleStateCollisionsAndFormat = (translationCache:ITranslationCache,
                                      _allSails:ISailViewModel[],
                                      _allCabins:ICabinViewModel[],
                                      _selectedPax:IPaxSelection,
                                      _selectedCruiseId:number,
                                      _selectedSailId:number,
                                      _selectedCabinId:string):{allCabins:ICabinViewModel[], allSails:ISailViewModel[], selectedCruiseId:number, selectedSailId:number, selectedCabinId:string} => {

        const bySail = this.getCabinsBySailId(_allCabins, _selectedSailId);

        let selectedCabinId = _selectedCabinId;


        // handle collision if _selectedCabinId is not in next result set
        if (!bySail.some(e => e.id === _selectedCabinId)) {
            const alternativeKind = this.getSelectedCabin(_allCabins, _selectedCabinId).kind;
            const alternative = this.getCheapestAvailableOrAlternativeCabin(bySail, alternativeKind);
            if (alternative) {
                selectedCabinId = alternative.id;
            } else {
                selectedCabinId = bySail[0].id;
            }
        }

        const allCabinsFormatted = this._formatCabins(translationCache, _allCabins, _selectedPax, selectedCabinId);
        const allSailsFormatted = this._formatSails(translationCache, allCabinsFormatted, _allSails);

        return {
            selectedCruiseId: _selectedCruiseId,
            selectedCabinId: selectedCabinId,
            selectedSailId: _selectedSailId,
            allCabins: allCabinsFormatted,
            allSails: allSailsFormatted
        };
    };

    mergeState = (currentState:IFormState, allSails:ISailViewModel[], allCabins:ICabinViewModel[], selectedCruiseId:number, selectedSailId:number, selectedCabinId:string):IFormState => {
        return _.extend({}, currentState, {
            selectedCruiseNid: selectedCruiseId,
            selectedCabinId: selectedCabinId,
            selectedSailId: selectedSailId,
            allCabins: allCabins,
            allSails: allSails,
            sailSelect: this.getSailsByCruiseId(allSails, selectedCruiseId),
            cabintypeSelect: this.getCabinsBySailId(allCabins, selectedSailId),
            cabinGridSelect: this.getCabinGridSelect(allCabins, selectedSailId),
            selectedCabin: this.getSelectedCabin(allCabins, selectedCabinId),
        });
    }

}