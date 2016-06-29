import * as _ from 'underscore';
import { IFareSelector }from './FareService';

export interface IOperatorPaxAgeRange {
    max:number;
    min:number;
    isSupported:boolean;
}

export interface IOperatorPaxMetadata {
    age:number;
}

export interface IOperatorPaxAgeConfig {
    senior:IOperatorPaxAgeRange;
    adult:IOperatorPaxAgeRange;
    junior:IOperatorPaxAgeRange;
    child:IOperatorPaxAgeRange;
    baby:IOperatorPaxAgeRange;
}

export const AGE_MAX = 999;

export class OperatorService {

    public static defaultPaxAgeConfig:IOperatorPaxAgeConfig = {
        senior: {min: 0, max: 0, isSupported: false},
        adult: {min: 18, max: AGE_MAX, isSupported: true},
        junior: {min: 0, max: 0, isSupported: false},
        child: {min: 0, max: 18, isSupported: true},
        baby: {min: 0, max: 0, isSupported: false}
    };

    public static ALLFieldsPaxAgeConfig:IOperatorPaxAgeConfig = {
        senior: {min: Infinity, max: Infinity, isSupported: false},
        adult: {min: 18, max: AGE_MAX, isSupported: true},
        junior: {min: 12, max: 18, isSupported: true},
        child: {min: 1, max: 12, isSupported: true},
        baby: {min: 0, max: 1, isSupported: true}
    };

    public static $inject = [
        '$q'
    ];

    constructor(private $q:ng.IQService) {

    }

    getOperatorConfig = (bookingServiceCode:string):ng.IPromise<IOperatorPaxAgeConfig> => {
        // todo fetch from booking api the config for given OP
        // see https://netvacation.atlassian.net/browse/DBF-1352
        return this.$q.resolve(OperatorService.ALLFieldsPaxAgeConfig);
    };


}