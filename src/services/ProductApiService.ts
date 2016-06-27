import { HttpServiceWrapper } from './HttpServiceWrapper';
import { ICruiseModel } from './Store';


interface ProductApiResponse {
    nid:number;
    title:string;
    operator:{
        bookingServiceCode:string;
    };
    sails:{
        nid:number;
        arrivalDate:string;
        departureDate:string;
        cabins:{
            nid: number;
            title: string;
            kindId: number;
            bedQuantity: number;
            maxPassengers:number;
            thumborImage:string;
        }[]
    }[]
}

export class ProductApiService {

    private _endpoint:string = 'http://localhost:3000/src/mockData/367247.json';

    constructor(private httpServiceWrapper:HttpServiceWrapper) {


    }

    getCruise = ():ng.IPromise<ProductApiResponse> => {
        return this.httpServiceWrapper.request<ProductApiResponse>({
            url: `${this._endpoint}`,
            method: 'GET'
        });
    };
}
