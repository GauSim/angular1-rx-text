import { StoreProviders } from '../../../services/StoreProviders';
import { StateMockHelper } from '../../helpers/StateMockHelper';
import { ITranslationCache } from '../../../services/Store';
import { CABIN_AVAILABILITY, CABIN_KIND } from '../../../helpers/Enums';

import * as should from 'should';
import * as Q from 'q';

describe('StoreProviders', () => {
    const translationCache:ITranslationCache = {
        'from': 'ab',
        'on request': 'auf Anfrage'
    };
    const providers = new StoreProviders();
    const m = new StateMockHelper(providers, translationCache);

    describe('formatSailTitle', () => {
        it('format for show the price of the cheapest cabin', () => {


            const sail = m.mockSail(1, 1, `01.01.2012`, `01.01.2016`);
            const cabin1 = m.mockCabin(1, sail.id, sail.cruiseId, CABIN_KIND.inside, CABIN_AVAILABILITY.available, 1);
            const cabin2 = m.mockCabin(2, sail.id, sail.cruiseId, CABIN_KIND.inside, CABIN_AVAILABILITY.available, 500);
            const cabin3 = m.mockCabin(3, sail.id, sail.cruiseId, CABIN_KIND.inside, CABIN_AVAILABILITY.onRequest, 1000);
            const allCabins = [cabin1, cabin2, cabin3];


            const title = providers.formatSailTitle(translationCache, allCabins, sail);

            should(title).be.ok();
            should(title).be.exactly(`${sail.departureDate} - ${sail.arrivalDate} (${translationCache['from']} ${cabin1.price} ${cabin1.currency})`);
        });

        it('should show on request if all cabins for the sail are onRequest', () => {


            const sail = m.mockSail(1, 1, `01.01.2012`, `01.01.2016`);
            const cabin = m.mockCabin(1, sail.id, sail.cruiseId, CABIN_KIND.inside, CABIN_AVAILABILITY.onRequest, 0);
            const allCabins = [cabin];


            const title = providers.formatSailTitle(translationCache, allCabins, sail);

            should(title).be.ok();
            should(title).be.exactly(`${sail.departureDate} - ${sail.arrivalDate} (${translationCache['on request']})`);
        });

    });


});
