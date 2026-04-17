import { registerLocale } from "react-datepicker";
import { zhTW, enUS } from "date-fns/locale";

registerLocale("zh-TW", zhTW);
registerLocale("en-US", enUS);

export function getDateLocaleName(language) {
  return language === "zh" ? "zh-TW" : "en-US";
}

export function getDateFormat(language) {
  return language === "zh" ? "yyyy/MM/dd HH:mm" : "MMM dd, yyyy hh:mm aa";
}
