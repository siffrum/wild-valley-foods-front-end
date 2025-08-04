import { WildValleyFoodsServiceModelBase } from "../base/WildValleyFoods-service-model-base";


export class DummyTeacherSM extends WildValleyFoodsServiceModelBase<number> {
    firstName!: string;
    lastName!: string;
    emailAddress!: string;
    profilePictureFileId?: number;
}
export class productSM extends WildValleyFoodsServiceModelBase<number> {
    name!: string;
            description!: string;
         price!: number;
            category!: string;
}
