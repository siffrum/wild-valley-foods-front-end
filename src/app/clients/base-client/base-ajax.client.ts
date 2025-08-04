import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { IDictionaryCollection } from '../../models/internal/Idictionary-collection';
import { DictionaryCollection } from '../../models/internal/dictionary-collection';


export abstract class BaseAjaxClient {

    constructor() {
    }
    protected GetHttpDataAsync = async<Req>(fullReqUrl: string, method: Method, reqBody: Req | null,
        headers: IDictionaryCollection<string, string>, contentType: string): Promise<AxiosResponse> => {

        if (contentType !== '' && contentType !== 'application/json') {
            throw new Error('Content Type other then JSON not supported at the moment.');
        }
        if (headers == null) { headers = new DictionaryCollection<string, string>(); }
        headers.Add('Content-Type', contentType);

        let reqBodyTxt = '';
        reqBodyTxt = JSON.stringify(reqBody);
        let response = await this.FetchAsync(fullReqUrl, method, headers, reqBodyTxt);
        if (response == null) { throw new Error('Response null after api call. please report the event to administrator.'); }
        return response;
    }


    /**
     * EG - Headers > { 'content-type': 'application/json' };
     */
    private FetchAsync = async (fullReqUrl: string, reqMethod: Method, headersToAdd: IDictionaryCollection<string, string>,
        reqBody: string): Promise<AxiosResponse<any, any> | null> => {
        let hdrs: any = {};
        if (headersToAdd != null && headersToAdd.Count() > 0) {
            headersToAdd.Keys().forEach(key => {
                hdrs[key] = headersToAdd.Item(key);
            });
            // hdrs["crossOrigin"] =  true;
            let config: AxiosRequestConfig<string> = this.GetAxiosConfig();
            config.url = fullReqUrl;
            config.method = reqMethod;
            config.headers = hdrs;
            config.data = reqBody;
            let response = await axios.request(config);
            return response;
        }
        return null;
    }
    private GetAxiosConfig = (): AxiosRequestConfig => {

        let config = {
            url: '',
            method: 'get', // default
            // `apiBaseUrl` will be prepended to `url` unless `url` is absolute.
            // It can be convenient to set `apiBaseUrl` for an instance of axios to pass relative URLs
            // to methods of that instance.
            apiBaseUrl: '',
            // `transformRequest` allows changes to the request data before it is sent to the server
            // This is only applicable for request methods 'PUT', 'POST', 'PATCH' and 'DELETE'
            // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
            // FormData or Stream
            // You may modify the headers object.
            // transformRequest: [function (data, headers) {
            //     // Do whatever you want to transform the data
            //     return data;
            // }],

            // `transformResponse` allows changes to the response data to be made before
            // it is passed to then/catch
            // transformResponse: [function (data) {
            //     // Do whatever you want to transform the data
            //     return data;
            // }],

            // `data` is the data to be sent as the request body
            // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
            // When no `transformRequest` is set, must be of one of the following types:
            // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
            // - Browser only: FormData, File, Blob
            // - Node only: Stream, Buffer


            // `timeout` specifies the number of milliseconds before the request times out.
            // If the request takes longer than `timeout`, the request will be aborted.
            timeout: 0, // default is `0` (no timeout)

            // `withCredentials` indicates whether or not cross-site Access-Control requests
            // should be made using credentials
            withCredentials: false, // default is false

            // `adapter` allows custom handling of requests which makes testing easier.
            // Return a promise and supply a valid response (see lib/adapters/README.md).
            // adapter: function (config) {
            //     /* ... */
            // },
            // `responseType` indicates the type of data that the server will respond with
            // options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
            //   browser only: 'blob'
            responseType: 'json', // default


            // `onUploadProgress` allows handling of progress events for uploads
            onUploadProgress(progressEvent) {
                // Do whatever you want with the native progress event
            },

            // `onDownloadProgress` allows handling of progress events for downloads
            onDownloadProgress(progressEvent) {
                // Do whatever you want with the native progress event
            },

            // `maxContentLength` defines the max size of the http response content in bytes allowed
            maxContentLength: 2000,

            // `validateStatus` defines whether to resolve or reject the promise for a given
            // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
            // or `undefined`), the promise will be resolved; otherwise, the promise will be
            // rejected.
            validateStatus(status) {            
                // return status >= 200 && status < 300; // default
                // we do not throw exception from the promise, if needed handle at sinle place in base client.
                return true;
            },

            // `maxRedirects` defines the maximum number of redirects to follow in node.js.
            // If set to 0, no redirects will be followed.
            maxRedirects: 5, // default

            // // `cancelToken` specifies a cancel token that can be used to cancel the request
            // // (see Cancellation section below for details)
            // cancelToken: new CancelToken(function (cancel) {
            // })

        } as AxiosRequestConfig;
        return config;
    }
    protected IsSuccessCode = (respStatusCode: number): boolean => {
        return respStatusCode >= 200 && respStatusCode < 300;
    }
}
