import * as _ from 'underscore';
import { CABIN_KIND, CABIN_AVAILABILITY } from '../helpers/Enums';
import { ISailSelectModel, ITranslationCache, ICabinSelectModel, StoreProviders } from './Store';


export class StateMockHelper {

    constructor(private provider:StoreProviders,
                private translationCache:ITranslationCache) {

    }

    mockSail = (id:number, cruiseId:number, startDate:string, endDate:string):ISailSelectModel => {
        return {
            id: id,
            title: `${startDate} - ${endDate}`,
            startDate: startDate,
            endDate: endDate,
            cruiseId: cruiseId
        }
    };

    mockCabin = (id:number, sailId:number, cruiseId:number, kind:CABIN_KIND, availability:CABIN_AVAILABILITY, price:number):ICabinSelectModel => {
        const kindName = kind;
        const cabinName = `${kindName} id:${id}`;

        const cabin:ICabinSelectModel = {
            id: id,
            sailId: sailId,
            cruiseId: cruiseId,
            kind: kind,
            availability: availability,
            kindName: kindName,
            price: price,
            cabinName: cabinName,
            title: 'Kat balcony (1000 EUR)',
            currency: 'EUR',
            ratecode: (availability === CABIN_AVAILABILITY.available) ? 'RANDOMRATECODE' : 'NO_RATECODE_AVAILABEBLE',
            imageUrl: `https://placeholdit.imgix.net/~text?txtsize=33&txt=${cabinName}&w=230&h=120`,
            isAvailable: (availability === CABIN_AVAILABILITY.available),
            isSelected: false
        };

        cabin.title = this.provider.formatCabinTitle(this.translationCache, cabin);
        return cabin;
    };


    mockAllCabintypes = (_allSails:ISailSelectModel[]):ICabinSelectModel[] => {

        const allSails = [... _allSails];


        const allCabintypes:ICabinSelectModel[] = [];
        allSails.forEach(sail => {
            // add cabins for each kind
            // 'inside', 'outside', 'balcony', 'suite'
            ['inside', 'outside', 'balcony', 'suite'].forEach((kind:CABIN_KIND) => {
                // add available and not available cabins
                [1, 2].forEach(availability => {

                    _.range(5).forEach(x=> {

                        const id = allCabintypes.length + 1;
                        const price = (availability === CABIN_AVAILABILITY.available) ? _.sample<number>([50, 100, 200, 500, 1000, 1200, 1300, 1500, 2000, 2500]) : 0;
                        const cabin = this.mockCabin(id, sail.id, sail.cruiseId, kind, availability, price);
                        allCabintypes.push(cabin);

                    });


                });

            });
        });

        return allCabintypes;
    }
}




