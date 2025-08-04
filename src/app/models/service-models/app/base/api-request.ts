import { QueryFilter } from './query-filter-base';

export class ApiRequest<T> {
  reqData: T; // Generic type for the request data
  queryFilter?: QueryFilter; // Optional property

  constructor(reqData: T, queryFilter?: QueryFilter) {
    this.reqData = reqData;
    this.queryFilter = queryFilter;
  }
}
