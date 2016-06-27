import { StoreProviders } from '../../../services/StoreProviders';
import { StateMockHelper } from '../../../services/StateMockHelper';
import { ITranslationCache } from '../../../services/Store';
import { CABIN_AVAILABILITY, CABIN_KIND } from '../../../helpers/Enums';

import * as should from 'should';
import * as Q from 'q';

describe('StoreProviders', () => {
    const providers = new StoreProviders();
    const m = new StateMockHelper(providers, {});

    describe('formatSailTitle', ()=> {
        it('format for show the price of the cheapest cabin', () => {

            const translationCache:ITranslationCache = {
                'from': 'ab'
            };

            const sail = m.mockSail(1, 1, `01.01.2012`, `01.01.2016`);
            const cabin1 = m.mockCabin(1, sail.id, sail.cruiseId, 'inside', CABIN_AVAILABILITY.available, 1);
            const cabin2 = m.mockCabin(2, sail.id, sail.cruiseId, 'inside', CABIN_AVAILABILITY.available, 500);
            const cabin3 = m.mockCabin(3, sail.id, sail.cruiseId, 'inside', CABIN_AVAILABILITY.onRequest, 1000);
            const allCabins = [cabin1, cabin2, cabin3];


            const title = providers.formatSailTitle(translationCache, allCabins, sail);

            should(title).be.ok();
            should(title).be.exactly(`${sail.startDate} - ${sail.endDate} (${translationCache['from']} ${cabin1.price} ${cabin1.currency})`);
        });

        it('should show on request if all cabins for the sail are onRequest', () => {

            const translationCache:ITranslationCache = {
                'on request': 'auf Anfrage'
            };

            const sail = m.mockSail(1, 1, `01.01.2012`, `01.01.2016`);
            const cabin = m.mockCabin(1, sail.id, sail.cruiseId, 'inside', CABIN_AVAILABILITY.onRequest, 0);
            const allCabins = [cabin];


            const title = providers.formatSailTitle(translationCache, allCabins, sail);

            should(title).be.ok();
            should(title).be.exactly(`${sail.startDate} - ${sail.endDate} (${translationCache['on request']})`);
        });

    });


});