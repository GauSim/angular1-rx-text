import * as _ from 'underscore';
import { CABIN_KIND, CURRENCY, CABIN_AVAILABILITY, MARKET_ID, RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG } from '../../helpers/Enums';
import { ICruiseViewModel, ISailViewModel, ITranslationCache, ICabinViewModel, IConfiguration, StoreProviders } from '../../services/Store';
import { OperatorService } from '../../services/OperatorService';


export class StateMockHelper {

    constructor(private provider:StoreProviders,
                private translationCache:ITranslationCache) {

    }

    mockConfig = ():IConfiguration => {
        return {
            marketId: 'de' as MARKET_ID,
            hasDualCurrency: false,
            defaultCurrency: 'EUR' as CURRENCY,
            operatorPaxAgeConfig: OperatorService.defaultPaxAgeConfig
        };
    };

    mockCruise = ():ICruiseViewModel => {
        return {
            id: 367247,
            title: 'einmal um die welt',
            operatorBookingServiceCode: 'msc'
        };
    };

    mockSail = (id:number, cruiseId:number, startDate:string, endDate:string):ISailViewModel => {
        return {
            id: id,
            title: `${startDate} - ${endDate}`,
            departureDate: startDate,
            arrivalDate: endDate,
            cruiseId: cruiseId
        };
    };

    mockCabin = (id:number, sailId:number, cruiseId:number, kind:CABIN_KIND, availability:CABIN_AVAILABILITY, price:number):ICabinViewModel => {
        const kindName = CABIN_KIND[kind];
        const cabinName = `${kindName} id:${id}`;

        const cabin:ICabinViewModel = {
            id: `${cruiseId}_${sailId}_${id}`,
            cabinId: id,
            sailId: sailId,
            cruiseId: cruiseId,
            kind: kind,
            availability: availability,
            kindName: kindName,
            price: price,
            cabinName: cabinName,
            maxPassengers: 2,
            bedQuantity: 2,
            guaranteeCabinInfo: 'bla',
            location: 'Deck 5 & 8',
            size: '1 qm',
            bed: 'bed',
            windows: 'windows',
            balcony: 'balcony',
            amenities: 'amenities',
            advantages: ['item1'],
            information: 'some information',
            title: 'Kat balcony (1000 EUR)', // will be overwritten
            currency: 'EUR' as CURRENCY,
            rateCode: (availability === CABIN_AVAILABILITY.available) ? RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG : 'NO_RATECODE_AVAILABEBLE',
            rateSource: RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG,
            rateLastUpdate: Date.now(),
            imageUrl: `https://placeholdit.imgix.net/~text?txtsize=33&txt=${cabinName}&w=230&h=120`,
            isAvailable: (availability === CABIN_AVAILABILITY.available),
            isSelected: false,
            hasFlightIncluded: false
        };

        cabin.title = this.provider.formatCabinTitle(this.translationCache, cabin);
        return cabin;
    };


    mockAllCabintypes = (_allSails:ISailViewModel[]):ICabinViewModel[] => {

        const allSails = [... _allSails];


        const allCabintypes:ICabinViewModel[] = [];
        allSails.forEach(sail => {
            // add cabins for each kind
            // 'inside', 'outside', 'balcony', 'suite'
            [
                CABIN_KIND.inside,
                CABIN_KIND.outside,
                CABIN_KIND.balcony,
                CABIN_KIND.suite
            ].forEach((kind:CABIN_KIND) => {
                // add available and not available cabins
                [1, 2].forEach(availability => {

                    _.range(5).forEach(x => {

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




