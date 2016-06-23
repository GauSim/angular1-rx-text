import * as _ from 'underscore';

import { ICabintypeSelectItem, ISailSelectItem, IFormState, CABIN_AVAILABILITY } from './Store';


function compose<F1Result,F2Result,F2Input>(f1:(e:F2Result)=>F1Result, f2:(e:F2Input)=>F2Result) {
    return (x:F2Input) => {
        return f1(f2(x));
    };
};

export class StoreProviders {

    getCheapestCabin = (cabins:ICabintypeSelectItem[]):ICabintypeSelectItem => _.min(cabins, (item:ICabintypeSelectItem) => item.price);
    getAvailableCabins = (cabins:ICabintypeSelectItem[]):ICabintypeSelectItem[] => cabins.filter(item => item.availability === CABIN_AVAILABILITY.available);
    getCheapestAvailableCabin = compose(this.getCheapestCabin, this.getAvailableCabins);
    getCabinsBySailId = (cabins:ICabintypeSelectItem[], sailId:number):ICabintypeSelectItem[] => cabins.filter(item => item.sailId === sailId);
    getSailsByCruiseId = (sails:ISailSelectItem[], cruiseId:number):ISailSelectItem[] => sails.filter(item => item.cruiseId === cruiseId);


    formatCabinTitle = (item:ICabintypeSelectItem):string => {
        const displayPrice = (item.availability === CABIN_AVAILABILITY.available) ? `${item.price} ${item.currency}` : 'N/A';
        return `${item.cabinName} (${displayPrice})`;
    };

    formatCabintype = (cabins:ICabintypeSelectItem[]):ICabintypeSelectItem[] => {
        return cabins.reduce((list, item:ICabintypeSelectItem)=> {
            const title = this.formatCabinTitle(item);
            return [...list, _.extend({}, item, {title})];
        }, []);
    };


    getFormatedCabintypeSelect = (allCabins:ICabintypeSelectItem[], selectedSailId:number):ICabintypeSelectItem[] => {
        const cabinsForSelectedSail = this.getCabinsBySailId(allCabins, selectedSailId);
        return this.formatCabintype(cabinsForSelectedSail);
    };

    formatSailTitle = (allCabins:ICabintypeSelectItem[], item:ISailSelectItem):string => {

        const cabinsForSail = this.getCabinsBySailId(allCabins, item.id);
        const cheapestAvailable = this.getCheapestAvailableCabin(cabinsForSail);
        const displayPrice = (cheapestAvailable) ? `ab ${cheapestAvailable.price} ${cheapestAvailable.currency}` : 'N/A';

        return `${item.startDate} ${item.endDate} (${displayPrice})`;
    };


    getSailSelect = (allCabins:ICabintypeSelectItem[], allSails:ISailSelectItem[], selectedCruiseNid:number):ISailSelectItem[] => {
        const sailsForCruise = this.getSailsByCruiseId(allSails, selectedCruiseNid);
        return this.formatSail(allCabins, sailsForCruise);
    };


    formatSail = (allCabins:ICabintypeSelectItem[], sails:ISailSelectItem[]):ISailSelectItem[] => {
        return sails.reduce((list, item:ISailSelectItem)=> {

            const title = this.formatSailTitle(allCabins, item);

            return [...list, _.extend({}, item, {title})];
        }, []);
    };
}