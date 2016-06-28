import { MARKET_ID, CURRENCY, CABIN_AVAILABILITY } from '../helpers/Enums';
import { IOperatorPaxMetadata, IOperatorPaxAgeConfig, OperatorService } from './OperatorService';
import { HttpServiceWrapper } from './HttpServiceWrapper';
import { IPaxSelection, IConfiguration, ICruiseViewModel, ICabinViewModel } from './Store';

export interface IFareSelector {
    marketId:MARKET_ID;
    bookingServiceCode:string;
    cruise_id:number;
    num_adult: number;
    num_child: number;
    num_junior: number;
    num_baby: number;
    num_senior: number;
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
    updated:number;
    source:string;
    cabin_price:number;
    currency: CURRENCY;
}


export class FareService {

    /**
     * endpoint of the FareService
     * @type {string}
     * @private
     */
    private _endpoint:string = 'http://localhost:9999'; //'http://rates-staging.stagev1internal.dreamlines.de';


    constructor(private httpServiceWrapper:HttpServiceWrapper) {
    }

    createFakePassengerList = (operatorPaxAgeConfig:IOperatorPaxAgeConfig, selectedPax:IPaxSelection):IOperatorPaxMetadata[] => {

        const toMetadata = (age:number):IOperatorPaxMetadata => {
            return {age};
        };

        const { num_seniors, num_adults, num_junior, num_child, num_baby } = selectedPax;

        const paxList:IOperatorPaxMetadata[] = [
            ...(!operatorPaxAgeConfig.senior.isSupported ? [] : _.range(num_seniors).map(_ => toMetadata(operatorPaxAgeConfig.senior.min))),
            ...(!operatorPaxAgeConfig.adult.isSupported ? [] : _.range(num_adults).map(_ => toMetadata(operatorPaxAgeConfig.adult.min))),
            ...(!operatorPaxAgeConfig.junior.isSupported ? [] : _.range(num_junior).map(_ => toMetadata(operatorPaxAgeConfig.junior.min))),
            ...(!operatorPaxAgeConfig.child.isSupported ? [] : _.range(num_child).map(_ => toMetadata(operatorPaxAgeConfig.child.min))),
            ...(!operatorPaxAgeConfig.baby.isSupported ? [] : _.range(num_baby).map(_ => toMetadata(operatorPaxAgeConfig.baby.min)))
        ];

        return paxList;
    };


    getFares = (curiseId:number, configuration:IConfiguration, operatorPaxAgeConfig:IOperatorPaxAgeConfig, selectedPax:IPaxSelection):ng.IPromise<IFareServiceResponse[]> => {

        const payload:IFareServiceRequest = {
            market: configuration.marketId as MARKET_ID,
            cruiseId: curiseId,
            passengers: this.createFakePassengerList(operatorPaxAgeConfig, selectedPax)
        };

        return this.httpServiceWrapper.request<IFareServiceResponse[]>({
                url: `${this._endpoint}/ratesByCruise`,
                method: 'POST',
                data: payload
            })
            .then((list:IFareServiceResponse[]) => {
                return list.filter(e => {
                    return e.num_adult == selectedPax.num_adults &&
                        e.num_junior == selectedPax.num_junior &&
                        e.num_child == selectedPax.num_child &&
                        e.num_baby == selectedPax.num_baby
                })
            });
    };

    mergeCabinsAndFares = (allCabins:ICabinViewModel[], availableFares:IFareServiceResponse[]):ICabinViewModel[]=> {

        return allCabins.reduce((list, item:ICabinViewModel)=> {
            const rates = availableFares.filter(e => e.cruise_id === item.cruiseId && e.sail_id === item.sailId && e.cabintype_id === item.cabinId);

            if (rates && rates[0]) {
                const rate = rates[0];
                item.rateCode = rate.rate_code;
                item.rateLastUpdate = rate.updated;
                item.rateSource = rate.source;
                item.price = rate.cabin_price;
                item.isAvailable = true;
                item.availability = CABIN_AVAILABILITY.available;
                item.currency = rate.currency;
                item.hasFlightIncluded = rate.flight_included;
                item.maxPassengers = rate.num_adult + rate.num_junior + rate.num_child + rate.num_baby;
            }

            return [...list, item];
        }, []);

    }
}
