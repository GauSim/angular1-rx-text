import * as _ from 'underscore';
import { ISailSelectModel,ICabinSelectModel, CABIN_KIND, CABIN_AVAILABILITY, StoreProviders } from './Store';

export function mock(provider:StoreProviders, _allSails:ISailSelectModel[]):ICabinSelectModel[] {

    const allSails = [... _allSails];

    function creatCabin(id:number, sailId:number, kind:CABIN_KIND, availability:CABIN_AVAILABILITY):ICabinSelectModel {
        const kindName = kind;
        const price = _.sample<number>([50, 100, 200, 500, 1000, 1200, 1300, 1500, 2000, 2500]);
        const cabinName = `${id} ${kindName}`;
        const cabin:ICabinSelectModel = {
            id: id,
            sailId: sailId,
            kind: kind,
            availability: availability,
            kindName: kindName,
            price: price,
            cabinName: cabinName,
            title: 'Kat balcony (1000 EUR)',
            currency: 'EUR'
        };

        cabin.title = provider.formatCabinTitle(cabin);
        return cabin;
    }


    const allCabintypes:ICabinSelectModel[] = [];
    allSails.forEach(sail => {
        ['inside', 'outside', 'balcony', 'suite'].forEach((kind:CABIN_KIND) => {
            [1, 2].forEach(availability => {
                const id = allCabintypes.length + 1;
                const cabin = creatCabin(id, sail.id, kind, availability);
                allCabintypes.push(cabin);
            });

        });
    });

    console.log(allCabintypes);
    console.log(allCabintypes.length);
    return allCabintypes;
}

