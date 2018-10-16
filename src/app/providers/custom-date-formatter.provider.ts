import { CalendarDateFormatter, DateFormatterParams } from "angular-calendar";
import { getISOWeek } from "date-fns";
import { DatePipe } from "@angular/common";

/**
 * A saját DateFormatter osztályunk
 */
export class CustomDateFormatter extends CalendarDateFormatter {
  /**
   * A heti nézetnél saját cím:
   * @param param0
   */
  public weekViewTitle({ date, locale }: DateFormatterParams): string {
    const year: string = new DatePipe(locale).transform(date, "y", locale);
    const weekNumber: number = getISOWeek(date);
    return `${year} - ${weekNumber}. hét`;
  }
}
