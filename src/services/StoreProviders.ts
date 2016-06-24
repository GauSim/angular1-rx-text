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

    getFormatedCabintypeSelect = (allCabins:ICabinSelectModel[], translationCache:ITranslationCache, selectedSailId:number, selectedCabintypeNid:number):ICabinSelectModel[] => {
        const forSail = this.getCabinsBySailId(allCabins, selectedSailId);
        return this.formatCabins(forSail, translationCache, selectedCabintypeNid);
    };


    getSailSelect = (allCabins:ICabinSelectModel[], allSails:ISailSelectModel[], translationCache:ITranslationCache, selectedCruiseNid:number):ISailSelectModel[] => {
        const sailsForCruise = this.getSailsByCruiseId(allSails, selectedCruiseNid);
        return this.formatSail(allCabins, sailsForCruise, translationCache);
    };


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

    getCabinGridSelect = (allCabins:ICabinSelectModel[], translationCache:ITranslationCache, selectedSailId:number, selectedCabintypeNid:number):ICabinGridSelectModel => {

        const selectableCabins = this.getFormatedCabintypeSelect(allCabins, translationCache, selectedSailId, selectedCabintypeNid);

        const cabinGridSelect:ICabinGridSelectModel = {
            inside: this.getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'inside'),
            outside: this.getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'outside'),
            balcony: this.getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'balcony'),
            suite: this.getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'suite'),
        };

        return cabinGridSelect;
    };

    formatSailTitle = (allCabins:ICabinSelectModel[], translationCache:ITranslationCache, item:ISailSelectModel):string => {
        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);

        const text_from = this.getTranslation(translationCache, 'from');
        const test_onRequest = this.getTranslation(translationCache, 'on request');

        const displayPrice = (cheapestAvailable) ? `${text_from} ${cheapestAvailable.price} ${cheapestAvailable.currency}` : test_onRequest;
        return `${item.startDate} - ${item.endDate} (${displayPrice})`;
    };

    formatSail = (allCabins:ICabinSelectModel[], sails:ISailSelectModel[], translationCache:ITranslationCache):ISailSelectModel[] => {
        return sails.reduce((list, item:ISailSelectModel)=> {
            const title = this.formatSailTitle(allCabins, translationCache, item);
            return [...list, _.extend({}, item, {title})];
        }, []);
    };

    formatCabinTitle = (translationCache:ITranslationCache, item:ICabinSelectModel):string => {
        const test_onRequest = this.getTranslation(translationCache, 'on request');
        const displayPrice = (item.availability === CABIN_AVAILABILITY.available) ? `${item.price} ${item.currency}` : test_onRequest;
        return `${item.cabinName} (${displayPrice})`;
    };


    orderByAvailabilityThenPrice = (cabins:ICabinSelectModel[]):ICabinSelectModel[] => {
        const grpd:{ available:ICabinSelectModel[]; onRequest:ICabinSelectModel[]; } = <any> _.groupBy(cabins, (c:ICabinSelectModel) => c.isAvailable ? 'available' : 'onRequest');
        return [
            ..._.sortBy(grpd.available, (c:ICabinSelectModel) => c.price),
            ...grpd.onRequest,
        ]
    };

    formatCabins = (cabins:ICabinSelectModel[], translationCache:ITranslationCache, selectedCabintypeNid:number):ICabinSelectModel[] => {

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
        } = <any> _.groupBy<ICabinSelectModel>(formatedCabins, ((e:ICabinSelectModel)=> e.kindName));

        // sort by cabin kind, then by availability, then by price
        const sorted = [
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.inside),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.outside),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.balcony),
            ...this.orderByAvailabilityThenPrice(groupedByCabinKind.suite),
        ];

        return sorted;
    };


}