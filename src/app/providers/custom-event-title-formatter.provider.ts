import { LOCALE_ID, Inject } from "@angular/core";
import { CalendarEventTitleFormatter, CalendarEvent } from "angular-calendar";
import { DatePipe } from "@angular/common";

/**
 * Saját Esemény Cím formázó osztály
 * month: havi nézet... stb
 */
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  month(event: CalendarEvent): string {
    return this.getTitle(event);
  }

  week(event: CalendarEvent): string {
    return this.getTitle(event);
  }

  day(event: CalendarEvent): string {
    return this.getTitle(event);
  }

  private getTitle(event: CalendarEvent): string {
    if (!event.end) {
      return `<b>${new DatePipe(this.locale).transform(
        event.start,
        "HH:mm",
        this.locale
      )}</b> ${event.title}`;
    } else {
      return `<b>
      ${new DatePipe(this.locale).transform(event.start, "HH:mm", this.locale)}
      -
      ${new DatePipe(this.locale).transform(event.end, "HH:mm", this.locale)}
      </b> 
      ${event.title}`;
    }
  }
}
