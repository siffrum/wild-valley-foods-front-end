import { WildValleyFoodsServiceModelBase } from "../../base/WildValleyFoods-service-model-base";

export class BannerSM extends WildValleyFoodsServiceModelBase<number> {
  title!: string;
  description!: string;
  image_base64!: string;
  link?: string;
  ctaText?: string;
  bannerType!: 'Slider' | 'ShortAdd' | 'LongAdd' | 'Sales' | 'Voucher';
  isVisible: boolean = true;
}
