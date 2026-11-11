import { useI18n } from './I18n';
import { studio, type Studio } from './studio';

export function useStudio(): Studio {
  return studio[useI18n().lang];
}
