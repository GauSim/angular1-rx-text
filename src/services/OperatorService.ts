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
        senior: {min: 60, max: AGE_MAX, isSupported: true},
        adult: {min: 18, max: 60, isSupported: true},
        junior: {min: 12, max: 18, isSupported: true},
        child: {min: 1, max: 12, isSupported: true},
        baby: {min: 0, max: 1, isSupported: true}
    };


    constructor(private $q:ng.IQService) {

    }

    _fetchOperatorConfig = (bookingServiceCode:string):ng.IPromise<IOperatorPaxAgeConfig> => {
        // todo fetch from booking api the config for given OP
        // see https://netvacation.atlassian.net/browse/DBF-1352
        return this.$q.resolve(OperatorService.defaultPaxAgeConfig);
    };


    createFakePassengerList = (selector:IFareSelector):ng.IPromise<IOperatorPaxMetadata[]> => {

        const toMetadata = (age:number):IOperatorPaxMetadata => {
            return {age};
        };

        const { num_senior, num_adult, num_junior, num_child, num_baby } = selector;

        return this._fetchOperatorConfig(selector.bookingServiceCode)
            .then(PaxAgeConfig => {

                return [
                    ...(!PaxAgeConfig.senior.isSupported ? [] : _.range(num_senior).map(_ => toMetadata(PaxAgeConfig.senior.min))),
                    ...(!PaxAgeConfig.adult.isSupported ? [] : _.range(num_adult).map(_ => toMetadata(PaxAgeConfig.adult.min))),
                    ...(!PaxAgeConfig.junior.isSupported ? [] : _.range(num_junior).map(_ => toMetadata(PaxAgeConfig.junior.min))),
                    ...(!PaxAgeConfig.child.isSupported ? [] : _.range(num_child).map(_ => toMetadata(PaxAgeConfig.child.min))),
                    ...(!PaxAgeConfig.baby.isSupported ? [] : _.range(num_baby).map(_ => toMetadata(PaxAgeConfig.baby.min)))
                ];

            });
    }

}