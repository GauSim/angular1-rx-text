import { HttpServiceWrapper } from './HttpServiceWrapper';
import { ICruiseModel, ICabinSelectModel, ISailSelectModel, IConfiguration } from './Store';
import { CABIN_AVAILABILITY, CABIN_KIND, MARKET_ID, CURRENCY, RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG } from '../helpers/Enums';
import { IOperatorPaxAgeConfig, OperatorService } from './OperatorService';

interface ProductApiResponse {
    nid:number;
    title:string;
    operator:{
        bookingServiceCode:string;
    };
    sails:ProductApiSail[]
}

interface ProductApiSail {
    nid:number;
    arrivalDate:string;
    departureDate:string;
    cabins:ProductApiCabin[]
}
interface ProductApiCabin {
    nid: number;
    title: string;
    kindId: number;
    bedQuantity: number;
    maxPassengers:number;
    thumborImage:string;
}

interface IMappedResponse {
    cruise:ICruiseModel,
    allCabins:ICabinSelectModel[],
    allSails:ISailSelectModel[]
}

export class ProductApiService {

    private _endpoint:string = 'http://localhost:3000/src/mockData/367247.json';

    constructor(private httpServiceWrapper:HttpServiceWrapper,
                private operatorService:OperatorService) {
    }

    private _mapAllSails = (productApiResponse:ProductApiResponse):ISailSelectModel[] => {
        return productApiResponse.sails.map((sail):ISailSelectModel => {
            return {
                id: sail.nid,
                cruiseId: productApiResponse.nid,
                title: '', // will be overwritten
                departureDate: sail.departureDate,
                arrivalDate: sail.arrivalDate,
            }
        });
    };

    private _mapCabin = (configuration:IConfiguration, cruiseId:number, sailId:number, cabin:ProductApiCabin):ICabinSelectModel => {
        return {
            id: `${cruiseId}_${sailId}_${cabin.nid}`,
            cabinId: cabin.nid,
            cruiseId: cruiseId,
            sailId: sailId,
            kind: cabin.kindId as CABIN_KIND,
            bedQuantity: cabin.bedQuantity,
            cabinName: cabin.title,
            maxPassengers: cabin.maxPassengers, // will be overwritten
            kindName: CABIN_KIND[cabin.kindId], // will be overwritten
            price: 0, // will be overwritten
            hasFlightIncluded: false, // todo flight field muss be fill,
            currency: configuration.defaultCurrency as CURRENCY, // will be overwritten
            title: cabin.title, // will be overwritten
            availability: CABIN_AVAILABILITY.onRequest, // will be overwritten
            rateCode: RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG,  // will be overwritten
            rateSource: RATECODE_NO_AVAILABLE_IN_RATESERVICE_FOR_PAX_CONFIG,  // will be overwritten
            rateLastUpdate: 0, // will be overwritten
            imageUrl: cabin.thumborImage,
            isAvailable: false,  // will be overwritten
            isSelected: false  // will be overwritten
        };
    };

    private _mapAllCabins = (response:ProductApiResponse, config:IConfiguration):ICabinSelectModel[] => {
        return response.sails.reduce((list, sail) => {
            return [...list, ...sail.cabins.map((cabin):ICabinSelectModel => {
                return this._mapCabin(config, response.nid, sail.nid, cabin);
            })];
        }, []);
    };

    _mapCruise = (response:ProductApiResponse, operatorPaxAgeConfig:IOperatorPaxAgeConfig):ICruiseModel => {
        return {
            id: response.nid, //367247,
            title: response.title,
            operatorPaxAgeConfig: operatorPaxAgeConfig,
            operatorBookingServiceCode: response.operator.bookingServiceCode
        }
    };

    _mapResponse = (config:IConfiguration, response:ProductApiResponse):ng.IPromise<IMappedResponse> => {
        return this.operatorService.getOperatorConfig(response.operator.bookingServiceCode)
            .then(operatorPaxAgeConfig => {
                return {
                    cruise: this._mapCruise(response, operatorPaxAgeConfig),
                    allCabins: this._mapAllCabins(response, config),
                    allSails: this._mapAllSails(response)
                }
            });
    };

    getCruise = (config:IConfiguration):ng.IPromise<IMappedResponse> => {
        return this.httpServiceWrapper.request<ProductApiResponse>({
                url: `${this._endpoint}`,
                method: 'GET'
            })
            .then(response => this._mapResponse(config, response));
    };
}
