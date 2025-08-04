import { QueryFilter } from '../query-filter';

export class ApiRequest<T> {
    reqData!: T;
    queryFilter!: QueryFilter;
}
