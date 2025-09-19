import { WildValleyFoodsServiceModelBase } from "../../base/WildValleyFoods-service-model-base";

export class VideoSM extends WildValleyFoodsServiceModelBase<number> {
  title!: string;
  youtubeUrl!: string;        // validated URL
  description?: string;       // optional
}