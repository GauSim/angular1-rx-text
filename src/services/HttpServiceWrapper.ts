import * as $ from 'jquery';

/*
 function httpService<T>(options:{ url:string, method:string, payload:any }) {
 return new Promise<T>((ok, fail) => {
 try {

 const xhr = $.ajax({
 url: options.url,
 type: options.method,
 data: JSON.stringify(options.payload),
 dataType: 'json',
 contentType: 'application/json; charset=utf-8'
 });

 xhr.fail((jqXHR, textStatus, errorThrown) => fail({textStatus, errorThrown, jqXHR}));
 xhr.done((data) => ok(data));

 } catch (ex) {
 fail(ex);
 }
 });
 }
 */

export class HttpServiceWrapper {


    /**
     * contains hashes of running http requests
     * @type {Array}
     */
    private _runningRequests:string[] = [];

    /**
     * a Queue of request hashes an the corresponding rejection and resolve handlers of the promise
     * @type {Array}
     */
    private _requestQueue:{ hash:string, resolve:(r:any) => void, reject:(r:any) => void }[] = [];


    /**
     * will contain responses form request for cache lookups
     * @type {Array}
     * @private
     */
    private _responseCache:{ hash:string, response:any }[] = [];

    public static $inject = [
        '$q',
        '$http'
    ];

    constructor(private $q:ng.IQService,
                private $http:ng.IHttpService) {
    }

    /**
     * will buffer requests to remote.
     * to prevent multiple fetches to remote service,
     * running requests are memorized in runningRequests array,
     * so duplicate requests can be queued in requestQueue and will be resolved parallel
     * as the first request arrives
     * this response will go to internal cache
     * @param payload:IFareServiceRequest
     * @returns {Promise<IFareServiceResponse[]>}
     * @private
     */

    public request = <T>(options:ng.IRequestConfig):ng.IPromise<T> => {

        const d = this.$q.defer<T>();


        const hash = options.url + (options.data ? JSON.stringify(options.data) : '');


        const doRequest = () => {
            if (this._responseCache.some(e => e.hash === hash)) {
                console.log('from cache', hash);
                const response = this._responseCache.filter(e => e.hash === hash)[0].response as T;
                return this.$q.resolve(response)
            }

            // fetch from remote
            console.log('request remote', hash);
            this._runningRequests = [...this._runningRequests, hash];
            return this.$http<T>(options)
                .then(r => r.data)
                .then((response:T) => {
                    this._responseCache = [...this._responseCache, {hash, response}];
                    this._runningRequests = this._runningRequests.filter(x => x !== hash);
                    return response;
                });

        };

        if (!this._runningRequests.some(x => x === hash)) {
            doRequest()
                .then(response => {

                    // resolve the (original first) request
                    d.resolve(response);

                    // resolve requests with the same hash
                    this._requestQueue.filter(e => e.hash === hash)
                        .forEach((req, idx) => {
                            console.log('resolving from queue', idx);
                            req.resolve(response);
                        });

                    // remove items from queue;
                    this._requestQueue = this._requestQueue.filter(e => e.hash !== hash);
                })
                .catch(error => {

                    d.reject(error);


                    this._requestQueue.filter(e => e.hash === hash).forEach(req => {
                        req.reject(error);
                    });

                    this._requestQueue = this._requestQueue.filter(e => e.hash !== hash);
                });

        } else {

            // if there is a running request add request to queue
            this._requestQueue = [...this._requestQueue, {hash, resolve: d.resolve, reject: d.reject}];

            console.log('added to queue | length =>', this._requestQueue.length);

        }


        return d.promise;
    };


}
