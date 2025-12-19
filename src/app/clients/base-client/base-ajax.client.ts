import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { IDictionaryCollection } from '../../models/internal/Idictionary-collection';
import { DictionaryCollection } from '../../models/internal/dictionary-collection';

export abstract class BaseAjaxClient {
  constructor() {}

  protected GetHttpDataAsync = async <Req>(
    fullReqUrl: string,
    method: Method,
    reqBody: Req | null,
    headers: IDictionaryCollection<string, string>,
    contentType: string
  ): Promise<AxiosResponse> => {
    if (headers == null) {
      headers = new DictionaryCollection<string, string>();
    }

    let dataToSend: any = null;

    if (reqBody instanceof FormData) {
      // ✅ FormData: don’t stringify, let axios handle
      dataToSend = reqBody;
    } else if (reqBody != null) {
      // ✅ JSON: stringify
      if (contentType === '' || contentType === 'application/json') {
        headers.Add('Content-Type', 'application/json');
        dataToSend = JSON.stringify(reqBody);
      } else {
        throw new Error('Unsupported content type: ' + contentType);
      }
    }

    let response = await this.FetchAsync(fullReqUrl, method, headers, dataToSend);
    if (response == null) {
      throw new Error('Response null after api call. please report the event to administrator.');
    }
    return response;
  };

  private FetchAsync = async (
    fullReqUrl: string,
    reqMethod: Method,
    headersToAdd: IDictionaryCollection<string, string>,
    reqBody: any
  ): Promise<AxiosResponse<any, any> | null> => {
    let hdrs: any = {};
    if (headersToAdd != null && headersToAdd.Count() > 0) {
      headersToAdd.Keys().forEach((key) => {
        hdrs[key] = headersToAdd.Item(key);
      });

      let config: AxiosRequestConfig<any> = this.GetAxiosConfig();
      config.url = fullReqUrl;
      config.method = reqMethod;
      config.headers = hdrs;
      config.data = reqBody;

      let response = await axios.request(config);
      return response;
    }
    return null;
  };

  private GetAxiosConfig = (): AxiosRequestConfig => {
    return {
      url: '',
      method: 'get',
      apiBaseUrl: '',
      timeout: 0,
      withCredentials: false,
      responseType: 'json',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus(status) {
        return true; // handle errors globally
      },
      maxRedirects: 5,
    } as AxiosRequestConfig;
  };

  protected IsSuccessCode = (respStatusCode: number): boolean => {
    return respStatusCode >= 200 && respStatusCode < 300;
  };
}
