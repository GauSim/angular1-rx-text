import { HttpServiceWrapper } from './HttpServiceWrapper';
import { ICruiseViewModel, ICabinViewModel, ISailViewModel, IConfiguration, IBaseModel } from './Store';
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


export class ProductApiService {

    private _endpoint:string = 'http://localhost:3000/src/mockData/367247.json';

    constructor(private httpServiceWrapper:HttpServiceWrapper,
                private operatorService:OperatorService) {
    }

    private _mapToAllSails = (productApiResponse:ProductApiResponse):ISailViewModel[] => {
        return productApiResponse.sails.map((sail):ISailViewModel => {
            return {
                id: sail.nid,
                cruiseId: productApiResponse.nid,
                title: '', // will be overwritten
                departureDate: sail.departureDate,
                arrivalDate: sail.arrivalDate,
            }
        });
    };

    private _mapToCabin = (configuration:IConfiguration, cruiseId:number, sailId:number, cabin:ProductApiCabin):ICabinViewModel => {
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

    private _mapToAllCabins = (response:ProductApiResponse, config:IConfiguration):ICabinViewModel[] => {
        return response.sails.reduce((list, sail) => {
            return [...list, ...sail.cabins.map((cabin):ICabinViewModel => {
                return this._mapToCabin(config, response.nid, sail.nid, cabin);
            })];
        }, []);
    };

    _mapToCruise = (response:ProductApiResponse, operatorPaxAgeConfig:IOperatorPaxAgeConfig):ICruiseViewModel => {
        return {
            id: response.nid, //367247,
            title: response.title,
            operatorPaxAgeConfig: operatorPaxAgeConfig,
            operatorBookingServiceCode: response.operator.bookingServiceCode
        }
    };

    _mapToBaseModel = (config:IConfiguration, response:ProductApiResponse):ng.IPromise<IBaseModel> => {
        return this.operatorService.getOperatorConfig(response.operator.bookingServiceCode)
            .then((operatorPaxAgeConfig):IBaseModel => {
                return {
                    selectedCruise: this._mapToCruise(response, operatorPaxAgeConfig),
                    allCabins: this._mapToAllCabins(response, config),
                    allSails: this._mapToAllSails(response)
                }
            });
    };

    createBaseModel = (config:IConfiguration):ng.IPromise<IBaseModel> => {
        return this.httpServiceWrapper.request<ProductApiResponse>({
                url: `${this._endpoint}`,
                method: 'GET'
            })
            .then(response => this._mapToBaseModel(config, response));
    };
}
