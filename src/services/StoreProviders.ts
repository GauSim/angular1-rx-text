import * as _ from 'underscore';

import { ICabinSelectModel, ISailSelectModel, ICabinGridSelectModel,  IFormState, CABIN_AVAILABILITY, CABIN_KIND } from './Store';


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

    formatCabinTitle = (item:ICabinSelectModel):string => {
        const displayPrice = (item.availability === CABIN_AVAILABILITY.available) ? `${item.price} ${item.currency}` : 'N/A';
        return `${item.cabinName} (${displayPrice})`;
    };
    formatCabintype = (cabins:ICabinSelectModel[]):ICabinSelectModel[] => {
        return cabins.reduce((list, item:ICabinSelectModel)=> {
            const title = this.formatCabinTitle(item);
            return [...list, _.extend({}, item, {title})];
        }, []);
    };


    getFormatedCabintypeSelect = (allCabins:ICabinSelectModel[], selectedSailId:number):ICabinSelectModel[] => {
        const cabinsForSelectedSail = this.getCabinsBySailId(allCabins, selectedSailId);
        return this.formatCabintype(cabinsForSelectedSail);
    };

    formatSailTitle = (allCabins:ICabinSelectModel[], item:ISailSelectModel):string => {

        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);
        const displayPrice = (cheapestAvailable) ? `ab ${cheapestAvailable.price} ${cheapestAvailable.currency}` : 'N/A';

        return `${item.startDate} ${item.endDate} (${displayPrice})`;
    };


    getSailSelect = (allCabins:ICabinSelectModel[], allSails:ISailSelectModel[], selectedCruiseNid:number):ISailSelectModel[] => {
        const sailsForCruise = this.getSailsByCruiseId(allSails, selectedCruiseNid);
        return this.formatSail(allCabins, sailsForCruise);
    };


    formatSail = (allCabins:ICabinSelectModel[], sails:ISailSelectModel[]):ISailSelectModel[] => {
        return sails.reduce((list, item:ISailSelectModel)=> {

            const title = this.formatSailTitle(allCabins, item);

            return [...list, _.extend({}, item, {title})];
        }, []);
    };

    getCabinGridSelect = (allCabins:ICabinSelectModel[], selectedSailId:number):ICabinGridSelectModel => {

        const selectableCabins = this.getFormatedCabintypeSelect(allCabins, selectedSailId);
// test this!
        const getCheapestAvailableOrNotAvailableCabinByKind = (list:ICabinSelectModel[], kind:CABIN_KIND):ICabinSelectModel => {
            const byKind = list.filter(e => e.kind === kind);
            const cheapestAvailableCabinForKind = this.getCheapestAvailableCabin(byKind);
            if (cheapestAvailableCabinForKind) {
                return cheapestAvailableCabinForKind;
            } else {
                const cheapestNotAvailableCabinForKind = this.getCheapestCabin(byKind);
                return cheapestNotAvailableCabinForKind ? cheapestNotAvailableCabinForKind : null;
            }
        };

        const cabinGridSelect:ICabinGridSelectModel = {
            inside: getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'inside'),
            outside: getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'outside'),
            balcony: getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'balcony'),
            suite: getCheapestAvailableOrNotAvailableCabinByKind(selectableCabins, 'suite'),
        };

        return cabinGridSelect;
    };
}