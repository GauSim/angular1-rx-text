import { FareService } from '../../../services/FareService';
import { OperatorService } from '../../../services/OperatorService';
import { ProductApiService } from '../../../services/ProductApiService';
import { HttpServiceWrapper } from '../../../services/HttpServiceWrapper';
import { StoreDispatchers } from '../../../services/StoreDispatchers';
import { StoreProviders } from '../../../services/StoreProviders';
import { StateMockHelper } from '../../../services/StateMockHelper';
import { ITranslationCache, IConfiguration } from '../../../services/Store';


import * as should from 'should';
import * as Q from 'q';

const create$httpMock = (ok:boolean, data:any) => {
    return (option:any) => {
        return ok ? Q.resolve({data}) : Q.reject(new Error(data));
    }
};

describe('StoreDispatchers', () => {


    let instance:StoreDispatchers;
    const translationCache:ITranslationCache = {};
    const m = new StateMockHelper(new StoreProviders(), translationCache);


    beforeEach(()=> {
        const $http:ng.IHttpService = create$httpMock(true, []) as any;
        const $q:ng.IQService = Q as any;
        const operatorService = new OperatorService($q);
        const httpServiceWrapper = new HttpServiceWrapper($q, $http);
        const fareService = new FareService(httpServiceWrapper);
        const productApiService = new ProductApiService(httpServiceWrapper, operatorService);
        instance = new StoreDispatchers($q, fareService, productApiService);

        /*
         const cruise = m.mockCruise();
         const sails = _.range(10).map(id => m.mockSail(id, cruise.id, `${id}.01.2012`, `${id}.01.2016`));
         const cabins = m.mockAllCabintypes(sails);
         */

    });
    describe('setSailId', () => {

        it('should set sailId', (done) => {

            const conf = m.mockConfig();

            instance.createInitialState(translationCache, conf)
                .then(initState => {
                    const asyncTests = initState.allSails.map(sail => {

                        const newSailNid = sail.id;

                        return instance.setSailId(initState, newSailNid)
                            .then(resultState => {


                                should(resultState.selectedSailId).be.exactly(newSailNid);

                                should(resultState.selectedCabin.sailId).be.exactly(newSailNid);


                                should(resultState.cabinGridSelect.inside.sailId).be.exactly(newSailNid);
                                should(resultState.cabinGridSelect.outside.sailId).be.exactly(newSailNid);
                                should(resultState.cabinGridSelect.balcony.sailId).be.exactly(newSailNid);
                                should(resultState.cabinGridSelect.suite.sailId).be.exactly(newSailNid);

                                resultState.cabintypeSelect.forEach(item => {
                                    should(item.sailId).be.exactly(newSailNid);
                                });

                                should(resultState.sailSelect.some(e => e.id === newSailNid)).be.ok();

                            });
                    });

                    Q.all(asyncTests)
                        .then(r => done())
                        .catch(done);
                });


        });

    })

});