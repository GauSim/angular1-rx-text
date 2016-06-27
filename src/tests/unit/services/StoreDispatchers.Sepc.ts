import { FareService } from '../../../services/FareService';
import { OperatorService } from '../../../services/OperatorService';
import { HttpServiceWrapper } from '../../../services/HttpServiceWrapper';
import { StoreDispatchers } from '../../../services/StoreDispatchers';

import * as should from 'should';
import * as Q from 'q';

const create$httpMock = (ok:boolean, data:any) => {
    return (option:any) => {
        return ok ? Q.resolve({data}) : Q.reject(new Error(data));
    }
};

describe('StoreDispatchers', () => {

    let instance:StoreDispatchers;

    beforeEach(()=> {
        const $http:ng.IHttpService = create$httpMock(true, []) as any;
        const $q:ng.IQService = Q as any;

        const operatorService = new OperatorService($q);
        const httpServiceWrapper = new HttpServiceWrapper($q, $http);
        const fareService = new FareService(operatorService, httpServiceWrapper);

        instance = new StoreDispatchers($q, fareService);
    });
    describe('setSailId', () => {

        it('should set sailId', (done) => {

            const initState = instance.createInitialState();
            
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
                .then(r => {
                    done();
                })
                .catch(done);

        });

    })

});