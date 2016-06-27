import * as _ from 'underscore';

import {
    IFormState,
    ICabinSelectModel,
    ISailSelectModel,
    ICabinGridSelectModel,
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

    getCheapestCabin = (cabins:ICabinSelectModel[]):ICabinSelectModel => _.min(cabins, (item:ICabinSelectModel) => item.price);
    getAvailableCabins = (cabins:ICabinSelectModel[]):ICabinSelectModel[] => cabins.filter(item => item.availability === CABIN_AVAILABILITY.available);
    getCheapestAvailableCabin = compose(this.getCheapestCabin, this.getAvailableCabins);
    getCabinsBySailId = (cabins:ICabinSelectModel[], sailId:number):ICabinSelectModel[] => cabins.filter(item => item.sailId === sailId);
    getSailsByCruiseId = (sails:ISailSelectModel[], cruiseId:number):ISailSelectModel[] => sails ? sails.filter(item => item.cruiseId === cruiseId) : [];


    getTranslation = (translationCache:ITranslationCache, key:string) => translationCache[key] ? translationCache[key] : key;

    getCheapestAvailableOrAlternativeCabin = (list:ICabinSelectModel[]):ICabinSelectModel => {

        const cheapestAvailable = this.getCheapestAvailableCabin(list); // will return Infinity if no cabin is available

        if ((cheapestAvailable as any) !== Infinity) {
            return cheapestAvailable;
        } else {

            const cheapestNotAvailableCabinForKind = this.getCheapestCabin(list); // will return Infinity if no cabin is available
            return cheapestNotAvailableCabinForKind ? cheapestNotAvailableCabinForKind : null;
        }
    };

    getCabinGridSelect = (allCabins:ICabinSelectModel[], selectedSailId:number):ICabinGridSelectModel => {

        const bySail = this.getCabinsBySailId(allCabins, selectedSailId);

        const cabinGridSelect:ICabinGridSelectModel = {
            inside: this.getCheapestAvailableOrAlternativeCabin(bySail.filter(e => e.kind === 'inside')),
            outside: this.getCheapestAvailableOrAlternativeCabin(bySail.filter(e => e.kind === 'outside')),
            balcony: this.getCheapestAvailableOrAlternativeCabin(bySail.filter(e => e.kind === 'balcony')),
            suite: this.getCheapestAvailableOrAlternativeCabin(bySail.filter(e => e.kind === 'suite')),
        };

        return cabinGridSelect;
    };

    getSelectedCabin = (allCabins:ICabinSelectModel[], selectedCabintypeNid:number):ICabinSelectModel => {
        const selectedCabin = allCabins.filter(e=> e.id === selectedCabintypeNid)[0];
        if (!selectedCabin) {
            console.log(allCabins);
            debugger;
            throw new Error(`can not find cabinId ${selectedCabintypeNid} in state.allCabins`);
        }
        return selectedCabin;
    };

    orderByAvailabilityThenPrice = (cabins:ICabinSelectModel[]):ICabinSelectModel[] => {
        if (!cabins.length) {
            return [];
        }

        const grpd:{ available?:ICabinSelectModel[]; onRequest?:ICabinSelectModel[]; } = _.groupBy(cabins, (c:ICabinSelectModel) => c.isAvailable ? 'available' : 'onRequest') as any;

        return [
            ... (!grpd.available) ? [] : _.sortBy(grpd.available, (c:ICabinSelectModel) => c.price),
            ... (!grpd.onRequest) ? [] : grpd.onRequest,
        ]
    };

    formatSailTitle = (translationCache:ITranslationCache, allCabins:ICabinSelectModel[], item:ISailSelectModel):string => {
        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);

        const text_from = this.getTranslation(translationCache, 'from');
        const test_onRequest = this.getTranslation(translationCache, 'on request');

        const displayPrice = (cheapestAvailable as number != Infinity) ? `${text_from} ${cheapestAvailable.price} ${cheapestAvailable.currency}` : test_onRequest;
        return `${item.startDate} - ${item.endDate} (${displayPrice})`;
    };

    formatCabinTitle = (translationCache:ITranslationCache, item:ICabinSelectModel):string => {
        const test_onRequest = this.getTranslation(translationCache, 'on request');
        const displayPrice = (item.availability === CABIN_AVAILABILITY.available) ? `${item.price} ${item.currency}` : test_onRequest;
        return `${item.cabinName} (${displayPrice})`;
    };

    private _formatSails = (translationCache:ITranslationCache, allCabins:ICabinSelectModel[], sails:ISailSelectModel[]):ISailSelectModel[] => {
        return sails.reduce((list, item:ISailSelectModel)=> {
            const title = this.formatSailTitle(translationCache, allCabins, item);
            return [...list, _.extend({}, item, {title})];
        }, []);
    };

    private _formatCabins = (translationCache:ITranslationCache, cabins:ICabinSelectModel[], selectedPax:IPaxSelection, selectedCabintypeNid:number):ICabinSelectModel[] => {

        if (!cabins.length) {
            return [];
        }

        const formatedCabins = cabins.reduce((list, item:ICabinSelectModel)=> {

            // todo does selectedPax fit in cabin ?
            item.availability = item.availability // = CABIN_AVAILABILITY.onRequest;

            const isSelected = item.id === selectedCabintypeNid;
            const title = this.formatCabinTitle(translationCache, item);

            return [...list, _.extend({}, item, {title, isSelected})];
        }, []);

        const grpd:{
            inside?:ICabinSelectModel[],
            outside?:ICabinSelectModel[],
            balcony?:ICabinSelectModel[],
            suite?:ICabinSelectModel[]
        } = _.groupBy<ICabinSelectModel>(formatedCabins, ((e:ICabinSelectModel) => e.kindName)) as any;

        // sort by cabin kind, then by availability, then by price
        const sorted = [
            ... !grpd.inside ? [] : this.orderByAvailabilityThenPrice(grpd.inside),
            ... !grpd.outside ? [] : this.orderByAvailabilityThenPrice(grpd.outside),
            ... !grpd.balcony ? [] : this.orderByAvailabilityThenPrice(grpd.balcony),
            ... !grpd.suite ? [] : this.orderByAvailabilityThenPrice(grpd.suite),
        ];

        return sorted;
    };


    recalculateState = (translationCache:ITranslationCache,
                        _allSails:ISailSelectModel[],
                        _allCabintypes:ICabinSelectModel[],
                        _selectedPax:IPaxSelection,
                        _selectedSailId:number,
                        _selectedCabintypeNid:number):{allCabintypes:ICabinSelectModel[], allSails:ISailSelectModel[],selectedSailId:number, selectedCabintypeNid:number} => {

        const bySail = this.getCabinsBySailId(_allCabintypes, _selectedSailId);

        let selectedCabintypeNid = _selectedCabintypeNid;


        // todo more collisions detection like pax fit in cabin
        if (!bySail.some(e => e.id === _selectedCabintypeNid)) {
            const alternative = this.getCheapestAvailableOrAlternativeCabin(bySail);
            selectedCabintypeNid = alternative.id;
        }


        const allCabintypes = this._formatCabins(translationCache, _allCabintypes, _selectedPax, selectedCabintypeNid);

        const allSails = this._formatSails(translationCache, allCabintypes, _allSails);

        return {
            selectedCabintypeNid: selectedCabintypeNid,
            selectedSailId: _selectedSailId,
            allCabintypes: allCabintypes,
            allSails: allSails
        };
    };

    mergeState = (currentState:IFormState, allSails:ISailSelectModel[], allCabintypes:ICabinSelectModel[], selectedSailId:number, selectedCabintypeNid:number):IFormState => {
        return _.extend({}, currentState, {
            selectedCabintypeNid: selectedCabintypeNid,
            selectedSailId: selectedSailId,
            allCabintypes: allCabintypes,
            allSails: allSails,
            sailSelect: this.getSailsByCruiseId(allSails, currentState.selectedCruiseNid),
            cabintypeSelect: this.getCabinsBySailId(allCabintypes, selectedSailId),
            cabinGridSelect: this.getCabinGridSelect(allCabintypes, selectedSailId),
            selectedCabin: this.getSelectedCabin(allCabintypes, selectedCabintypeNid),
        });
    }

}