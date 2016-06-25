import * as _ from 'underscore';

import {
    ICabinSelectModel,
    ISailSelectModel,
    ICabinGridSelectModel,
    IFormState,
    ITranslationCache,
    CABIN_AVAILABILITY,
    CABIN_KIND
} from './Store';


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
    getSailsByCruiseId = (sails:ISailSelectModel[], cruiseId:number):ISailSelectModel[] => sails.filter(item => item.cruiseId === cruiseId);


    getTranslation = (translationCache:ITranslationCache, key:string) => translationCache[key] ? translationCache[key] : key;

    getCheapestAvailableOrNotAvailableCabinByKind = (list:ICabinSelectModel[], kind:CABIN_KIND):ICabinSelectModel => {
        const byKind = list.filter(e => e.kind === kind);
        const cheapestAvailableCabinForKind = this.getCheapestAvailableCabin(byKind); // will return Infinity if no cabin is available


        if ((cheapestAvailableCabinForKind as any) !== Infinity) {
            return cheapestAvailableCabinForKind;
        } else {

            const cheapestNotAvailableCabinForKind = this.getCheapestCabin(byKind); // will return Infinity if no cabin is available
            return cheapestNotAvailableCabinForKind ? cheapestNotAvailableCabinForKind : null;
        }
    };

    getCabinGridSelect = (allCabins:ICabinSelectModel[], selectedSailId:number):ICabinGridSelectModel => {

        const cabinsForSail = this.getCabinsBySailId(allCabins, selectedSailId);

        const cabinGridSelect:ICabinGridSelectModel = {
            inside: this.getCheapestAvailableOrNotAvailableCabinByKind(cabinsForSail, 'inside'),
            outside: this.getCheapestAvailableOrNotAvailableCabinByKind(cabinsForSail, 'outside'),
            balcony: this.getCheapestAvailableOrNotAvailableCabinByKind(cabinsForSail, 'balcony'),
            suite: this.getCheapestAvailableOrNotAvailableCabinByKind(cabinsForSail, 'suite'),
        };

        return cabinGridSelect;
    };

    getSelectedCabin = (allCabins:ICabinSelectModel[], selectedCabintypeNid:number):ICabinSelectModel => {
        const selectedCabin = allCabins.filter(e=> e.id === selectedCabintypeNid)[0];
        if (!selectedCabin) {
            throw new Error(`can not find cabinId ${selectedCabintypeNid} in state.allCabins`);
        }
        return selectedCabin;
    };

    orderByAvailabilityThenPrice = (cabins:ICabinSelectModel[]):ICabinSelectModel[] => {
        const grpd:{ available:ICabinSelectModel[]; onRequest:ICabinSelectModel[]; } = _.groupBy(cabins, (c:ICabinSelectModel) => c.isAvailable ? 'available' : 'onRequest') as any;
        return [
            ..._.sortBy(grpd.available, (c:ICabinSelectModel) => c.price),
            ...grpd.onRequest,
        ]
    };

    formatSailTitle = (translationCache:ITranslationCache, allCabins:ICabinSelectModel[], item:ISailSelectModel):string => {
        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);

        const text_from = this.getTranslation(translationCache, 'from');
        const test_onRequest = this.getTranslation(translationCache, 'on request');

        const displayPrice = (cheapestAvailable) ? `${text_from} ${cheapestAvailable.price} ${cheapestAvailable.currency} (id:${cheapestAvailable.id})` : test_onRequest;
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

   private _formatCabins = (translationCache:ITranslationCache, cabins:ICabinSelectModel[], selectedCabintypeNid:number):ICabinSelectModel[] => {

        const formatedCabins = cabins.reduce((list, item:ICabinSelectModel)=> {

            const title = this.formatCabinTitle(translationCache, item);
            const isSelected = item.id === selectedCabintypeNid;

            return [...list, _.extend({}, item, {title, isSelected})];
        }, []);

        const groupedByCabinKind:{
            inside:ICabinSelectModel[],
            outside:ICabinSelectModel[],
            balcony:ICabinSelectModel[],
            suite:ICabinSelectModel[]
        } = _.groupBy<ICabinSelectModel>(formatedCabins, ((e:ICabinSelectModel)=> e.kindName)) as any;

        // sort by cabin kind, then by availability, then by price
        const sorted = [
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.inside),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.outside),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.balcony),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.suite),
        ];

        return sorted;
    };

    formatCabinsAndSails = (translationCache:ITranslationCache, _allSails:ISailSelectModel[], _allCabintypes:ICabinSelectModel[], _selectedCabintypeNid:number):{allCabintypes:ICabinSelectModel[], allSails:ISailSelectModel[]} => {

        const allCabintypes = this._formatCabins(translationCache, _allCabintypes, _selectedCabintypeNid);
        const allSails = this._formatSails(translationCache, allCabintypes, _allSails);

        return {allCabintypes, allSails};
    }


}