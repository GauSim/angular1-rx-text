import { MARKET_ID, CURRENCY } from '../helpers/Enums';
import { IOperatorPaxMetadata, OperatorService } from './OperatorService';
import { HttpServiceWrapper } from './HttpServiceWrapper';

export interface IFareSelector {
    marketId:MARKET_ID;
    bookingServiceCode:string;
    cruise_id:number;
    num_adult: number;
    num_child: number;
    num_junior: number;
    num_baby: number;
    num_senior: number;
    flight_included:boolean;
}

export interface IFareServiceRequest {
    market:MARKET_ID;
    cruiseId:number;
    passengers:IOperatorPaxMetadata[];
}

export interface IFareServiceResponse {
    cruise_id:number;
    sail_id:number;
    cabintype_id:number;
    flight_included:boolean;
    num_adult:number;
    num_child:number;
    num_junior:number;
    num_baby:number;
    rate_code:string;
    cabin_price:number;
    currency: CURRENCY;
}


export class FareService {

    /**
     * endpoint of the FareService
     * @type {string}
     * @private
     */
    private _FareServiceEndpoint:string = 'http://localhost:9999'; //'http://rates-staging.stagev1internal.dreamlines.de';


    constructor(private operatorService:OperatorService,
                private httpServiceWrapper:HttpServiceWrapper) {
    }

    private _convertSelectorToFareServiceRequest = (selector:IFareSelector):ng.IPromise<IFareServiceRequest> => {

        return this.operatorService.createFakePassengerList(selector)
            .then(passengerList => ({
                market: selector.marketId,
                cruiseId: selector.cruise_id,
                passengers: passengerList
            }));

    };


    getFares = (selector:IFareSelector):ng.IPromise<IFareServiceResponse[]> => {
        return this._convertSelectorToFareServiceRequest(selector)
            .then(payload => {
                return this.httpServiceWrapper.request<IFareServiceResponse[]>({
                    url: `${this._FareServiceEndpoint}/ratesByCruise`,
                    method: 'POST',
                    data: payload
                });
            });
    };
}
