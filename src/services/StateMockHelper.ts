import * as _ from 'underscore';
import { CABIN_KIND, CURRENCY, CABIN_AVAILABILITY, MARKET_ID, RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG } from '../helpers/Enums';
import { ICruiseModel, ISailSelectModel, ITranslationCache, ICabinSelectModel, IConfiguration, StoreProviders } from './Store';
import { OperatorService } from './OperatorService';


export class StateMockHelper {

    constructor(private provider:StoreProviders,
                private translationCache:ITranslationCache) {

    }

    mockConfig = ():IConfiguration => {
        return {
            marketId: 'de' as MARKET_ID,
            hasDualCurrency: false,
            defaultCurrency: 'EUR' as CURRENCY
        };
    };

    mockCruise = ():ICruiseModel => {
        return {
            id: 367247,
            title: 'einmal um die welt',
            operatorPaxAgeConfig: OperatorService.defaultPaxAgeConfig,
            operatorBookingServiceCode: 'msc'
        }
    };

    mockSail = (id:number, cruiseId:number, startDate:string, endDate:string):ISailSelectModel => {
        return {
            id: id,
            title: `${startDate} - ${endDate}`,
            departureDate: startDate,
            arrivalDate: endDate,
            cruiseId: cruiseId
        }
    };

    mockCabin = (id:number, sailId:number, cruiseId:number, kind:CABIN_KIND, availability:CABIN_AVAILABILITY, price:number):ICabinSelectModel => {
        const kindName = CABIN_KIND[kind];
        const cabinName = `${kindName} id:${id}`;

        const cabin:ICabinSelectModel = {
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


    mockAllCabintypes = (_allSails:ISailSelectModel[]):ICabinSelectModel[] => {

        const allSails = [... _allSails];


        const allCabintypes:ICabinSelectModel[] = [];
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




