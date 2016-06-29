export const TrustHtml = function ($sce:ng.ISCEService) {
    return function (value:string, type:string) {
        return $sce.trustAs(type || 'html', value);
    };
};

