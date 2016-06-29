export const TrustHtml = ['$sce', function ($sce:ng.ISCEService) {
    return function (value:string, type:string) {
        return $sce.trustAs(type || 'html', value);
    };
}];

